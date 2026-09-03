const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { google } = require("googleapis");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

const PACKAGE_NAME = "com.estudioam.agendadocente";

// Contenido del JSON de la cuenta de servicio con permiso "Ver datos financieros"
// en Play Console (Configuración > Acceso a la API). Se carga como secreto:
//   firebase functions:secrets:set PLAY_SERVICE_ACCOUNT
const playServiceAccount = defineSecret("PLAY_SERVICE_ACCOUNT");

function getAndroidPublisher() {
  const credentials = JSON.parse(playServiceAccount.value());
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/androidpublisher"],
  });
  return google.androidpublisher({ version: "v3", auth });
}

async function fetchSubscription(purchaseToken) {
  const publisher = getAndroidPublisher();
  const { data } = await publisher.purchases.subscriptionsv2.get({
    packageName: PACKAGE_NAME,
    token: purchaseToken,
  });
  return data;
}

function isActive(subscriptionState) {
  return (
    subscriptionState === "SUBSCRIPTION_STATE_ACTIVE" ||
    subscriptionState === "SUBSCRIPTION_STATE_IN_GRACE_PERIOD"
  );
}

// Google exige "reconocer" (acknowledge) toda compra de suscripción dentro de
// los 3 días o la reembolsa y anula sola. subscriptionsv2 no tiene un método
// de acknowledge propio: se hace con el endpoint clásico
// purchases.subscriptions.acknowledge, que ya no pide subscriptionId como
// obligatorio, pero se lo pasamos igual (lineItems[0].productId, que es lo
// que reemplazó al subscriptionId viejo) por compatibilidad.
async function acknowledgeIfNeeded(purchaseToken, subscription) {
  if (subscription.acknowledgementState === "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED") {
    return;
  }
  const publisher = getAndroidPublisher();
  const productId = subscription.lineItems?.[0]?.productId;
  try {
    await publisher.purchases.subscriptions.acknowledge({
      packageName: PACKAGE_NAME,
      subscriptionId: productId,
      token: purchaseToken,
    });
  } catch (e) {
    // No cortamos verifyPurchase por esto: el estado ya se guardó en
    // Firestore igual. Si ya estaba reconocida o el nombre del campo de
    // arriba no era exactamente ese, esto solo reintenta un acknowledge
    // que puede no hacer falta — no hay daño en pedirlo de más.
    console.error("No se pudo confirmar (acknowledge) la suscripción", e);
  }
}

async function saveSubscriptionState(uid, purchaseToken, subscription) {
  const state = subscription.subscriptionState;
  const expiryTime =
    subscription.lineItems?.[0]?.expiryTime
      ? new Date(subscription.lineItems[0].expiryTime)
      : null;

  await db
    .collection("subscriptions")
    .doc(uid)
    .set(
      {
        status: isActive(state) ? "active" : "inactive",
        source: "play",
        rawState: state,
        currentPeriodEnd: expiryTime,
        purchaseToken,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

  await db.collection("purchaseTokens").doc(purchaseToken).set({ uid });
}

// Llamada desde la app justo después de que el usuario completa la compra
// con la Digital Goods API, para dar acceso inmediato sin esperar el webhook.
exports.verifyPurchase = onCall(
  { secrets: [playServiceAccount] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Hay que iniciar sesión.");
    }
    const { purchaseToken } = request.data;
    if (!purchaseToken) {
      throw new HttpsError("invalid-argument", "Falta purchaseToken.");
    }

    const subscription = await fetchSubscription(purchaseToken);
    await saveSubscriptionState(request.auth.uid, purchaseToken, subscription);
    await acknowledgeIfNeeded(purchaseToken, subscription);

    return { status: isActive(subscription.subscriptionState) ? "active" : "inactive" };
  }
);

// Cuenta que puede ver el panel de administración (index → admin.html).
const ADMIN_EMAIL = "estudioam.dev@gmail.com";

// Junta quién se conectó alguna vez con Google (Firebase Authentication) con
// su estado de suscripción (Firestore) para mostrarlo en admin.html. Google
// nunca da la lista de quién *instaló* la app desde Play —esto es lo más
// cercano que existe: quién se logueó adentro de ella.
exports.adminListUsers = onCall(async (request) => {
  if (!request.auth || request.auth.token.email !== ADMIN_EMAIL) {
    throw new HttpsError("permission-denied", "No autorizada.");
  }

  const users = [];
  let pageToken;
  do {
    const page = await admin.auth().listUsers(1000, pageToken);
    users.push(...page.users);
    pageToken = page.pageToken;
  } while (pageToken);

  const subsSnap = await db.collection("subscriptions").get();
  const subsByUid = {};
  subsSnap.forEach((doc) => {
    subsByUid[doc.id] = doc.data();
  });

  return users
    .map((u) => {
      const sub = subsByUid[u.uid];
      return {
        email: u.email || "(sin mail)",
        firstSignIn: u.metadata.creationTime,
        lastSignIn: u.metadata.lastSignInTime,
        subscriptionStatus: sub ? sub.status : "sin suscripción",
        currentPeriodEnd:
          sub?.currentPeriodEnd?.toDate?.().toISOString() ?? null,
      };
    })
    .sort((a, b) => new Date(b.firstSignIn) - new Date(a.firstSignIn));
});

// Endpoint que recibe las notificaciones push de Pub/Sub configuradas en
// Play Console > Monetización > Notificaciones en tiempo real.
exports.playRtdn = onRequest(
  { secrets: [playServiceAccount] },
  async (req, res) => {
    const message = req.body?.message;
    if (!message?.data) {
      res.status(400).send("Falta message.data");
      return;
    }

    const payload = JSON.parse(
      Buffer.from(message.data, "base64").toString("utf8")
    );
    const purchaseToken = payload.subscriptionNotification?.purchaseToken;
    if (!purchaseToken) {
      // Notificaciones que no son de suscripción (ej. test), se ignoran.
      res.status(204).send();
      return;
    }

    const tokenDoc = await db.collection("purchaseTokens").doc(purchaseToken).get();
    const uid = tokenDoc.exists ? tokenDoc.data().uid : null;
    if (!uid) {
      // Compra que no pasó por verifyPurchase todavía; no hay a quién asignarla.
      res.status(200).send();
      return;
    }

    const subscription = await fetchSubscription(purchaseToken);
    await saveSubscriptionState(uid, purchaseToken, subscription);

    res.status(200).send();
  }
);

/* ============ Suscripción por Mercado Pago ============
   Para quien no puede pasar por Google Play (iPhone, o cualquiera que entre
   por el navegador sin instalar la app de Android) — ver CLAUDE.md, sección
   "Suscripción por Mercado Pago". Llena el mismo documento
   subscriptions/{uid} que ya usan verifyPurchase/playRtdn de arriba; el
   resto de la app (index.html) no distingue de dónde vino, salvo para
   mostrar a dónde mandar a alguien a administrar su suscripción. */

// Access Token de la aplicación de Mercado Pago (panel de desarrolladores →
// Tus integraciones → esta app → Credenciales). Se carga como secreto:
//   firebase functions:secrets:set MP_ACCESS_TOKEN
const mpAccessToken = defineSecret("MP_ACCESS_TOKEN");
// Clave para validar que un aviso a mpWebhook vino de verdad de Mercado Pago
// (header x-signature) y no de cualquiera que le pegue a la URL diciendo
// "ya se cobró" sin haber cobrado nada. Mercado Pago la muestra al cargar la
// URL de notificaciones en el panel de la aplicación. Se carga como secreto:
//   firebase functions:secrets:set MP_WEBHOOK_SECRET
const mpWebhookSecret = defineSecret("MP_WEBHOOK_SECRET");

// Precio único del plan mensual, en pesos argentinos. Ojo: index.html tiene
// su propia constante MP_PRECIO_ARS solo para MOSTRAR el precio en el
// cuadro de compra — el precio que de verdad se cobra es este de acá. Si se
// cambia, hay que cambiar los dos y volver a desplegar (funciones + main).
const MP_PRECIO_ARS = 9000;

async function mpFetch(path, options = {}) {
  const resp = await fetch(`https://api.mercadopago.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${mpAccessToken.value()}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(`Mercado Pago ${path} respondió ${resp.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

// Llamada desde la app cuando alguien aprieta "Suscribirme" fuera de la TWA
// de Android. Crea la suscripción del lado de Mercado Pago (sin plan
// asociado — un preapproval con el monto adentro, la forma más simple para
// un solo precio) y devuelve el link (init_point) al que la app manda a la
// persona para que la autorice con su propia tarjeta. Ningún dato de
// tarjeta pasa por acá: eso lo maneja Mercado Pago en su propia página.
exports.crearSuscripcionMP = onCall(
  { secrets: [mpAccessToken] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Hay que iniciar sesión.");
    }
    const uid = request.auth.uid;
    const email = request.auth.token.email;
    if (!email) {
      throw new HttpsError("failed-precondition", "La cuenta de Google no tiene mail.");
    }
    const backUrl =
      (request.data && request.data.backUrl) ||
      "https://estudioamsoftware.github.io/agendadocente/";

    const preapproval = await mpFetch("/preapproval", {
      method: "POST",
      body: JSON.stringify({
        reason: "Agenda Docente completa - mensual",
        external_reference: uid,
        payer_email: email,
        back_url: backUrl,
        status: "pending",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: MP_PRECIO_ARS,
          currency_id: "ARS",
        },
      }),
    });

    // Puente para que mpWebhook, cuando reciba el aviso, sepa a qué UID
    // corresponde ese preapproval (Mercado Pago no lo manda de vuelta en la
    // notificación, solo el id) — mismo truco que purchaseTokens con Play.
    await db.collection("mpPreapprovals").doc(preapproval.id).set({
      uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { initPoint: preapproval.init_point };
  }
);

function mpEstaActiva(status) {
  return status === "authorized";
}

async function mpGuardarEstado(preapprovalId) {
  const mapDoc = await db.collection("mpPreapprovals").doc(preapprovalId).get();
  if (!mapDoc.exists) return; // aviso de un preapproval que no creamos nosotros; se ignora
  const { uid } = mapDoc.data();

  const preapproval = await mpFetch(`/preapproval/${preapprovalId}`);
  await db
    .collection("subscriptions")
    .doc(uid)
    .set(
      {
        status: mpEstaActiva(preapproval.status) ? "active" : "inactive",
        source: "mercadopago",
        rawState: preapproval.status,
        currentPeriodEnd: preapproval.next_payment_date ? new Date(preapproval.next_payment_date) : null,
        mpPreapprovalId: preapprovalId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
}

// Valida la firma que manda Mercado Pago en el header x-signature (ver su
// documentación de "Firma de notificaciones webhook") antes de creerle a
// cualquier aviso que llegue a esta URL pública.
function mpFirmaValida(req) {
  const secret = mpWebhookSecret.value();
  const signatureHeader = req.headers["x-signature"];
  const requestId = req.headers["x-request-id"];
  if (!signatureHeader || !secret) return false;
  const parts = {};
  signatureHeader.split(",").forEach((p) => {
    const [k, v] = p.trim().split("=");
    if (k && v) parts[k.trim()] = v.trim();
  });
  const dataId =
    req.query["data.id"] || (req.body && req.body.data && req.body.data.id) || "";
  const manifest = `id:${dataId};request-id:${requestId};ts:${parts.ts};`;
  const hash = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  return hash === parts.v1;
}

// Endpoint que recibe los avisos de Mercado Pago cuando se autoriza, se
// cobra, se pausa o se cancela una suscripción. Se configura en el panel de
// desarrolladores de Mercado Pago → esta aplicación → Webhooks, apuntando a
// la URL de esta función una vez desplegada.
exports.mpWebhook = onRequest(
  { secrets: [mpAccessToken, mpWebhookSecret] },
  async (req, res) => {
    if (!mpFirmaValida(req)) {
      res.status(401).send("Firma inválida");
      return;
    }
    const topic = req.query.topic || req.query.type || (req.body && req.body.type);
    const dataId =
      req.query["data.id"] || (req.body && req.body.data && req.body.data.id);
    if (topic !== "preapproval" || !dataId) {
      // Otros tipos de aviso (ej. "payment", pruebas) no hace falta procesarlos:
      // el estado de la suscripción ya se puede leer completo del preapproval.
      res.status(204).send();
      return;
    }
    try {
      await mpGuardarEstado(dataId);
    } catch (e) {
      console.error("Error procesando webhook de Mercado Pago", e);
      res.status(500).send("Error");
      return;
    }
    res.status(200).send();
  }
);

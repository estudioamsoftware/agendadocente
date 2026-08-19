const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { google } = require("googleapis");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// TODO: reemplazar por el nombre de paquete real de la app en Play Console
// (ej: "ar.com.estudioam.agendadocente").
const PACKAGE_NAME = "ar.com.estudioam.agendadocente";

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

    return { status: isActive(subscription.subscriptionState) ? "active" : "inactive" };
  }
);

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

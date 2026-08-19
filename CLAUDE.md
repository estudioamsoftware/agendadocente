# Agenda Docente

App para docentes (asistencia, notas, cursada). Hoy es una **PWA de un solo archivo**:
`index.html` (todo el HTML/CSS/JS), `service-worker.js`, `manifest.json`, `privacy-policy.html`,
más `tools/make-icons.py` para generar los íconos. No hay build step, ni npm, ni framework:
es JS plano cargado por `<script>` tags.

- **Hosting actual:** Cloudflare Pages, conectado al repo de GitHub. Producción en
  `https://agendadocente.pages.dev/`. Debería generar preview deploys por rama (a confirmar).
- **Repo:** `estudioamsoftware/agendadocente` en GitHub.
- **Rama de este trabajo (suscripciones):** `claude/subscription-by-device-jzdkkp` — todavía
  NO mergeada a `main`/producción.

## Objetivo en curso: suscripción paga + publicación en Google Play

La dueña del proyecto quiere:
1. Publicar la app en **Google Play Store**.
2. Cobrar una **suscripción paga** que desbloquee funciones premium (todavía no se definió
   cuáles funciones específicamente).
3. Que la suscripción sea **por cuenta** (Google), no por dispositivo — si el docente usa la
   app en el celu y en la compu, paga una sola vez.

### Decisiones ya tomadas (no volver a proponer alternativas sin motivo)

- **Cobro: Google Play Billing únicamente.** Se descartó Mercado Pago porque Google exige
  que el contenido digital consumido dentro de una app de Play use su sistema de facturación
  (viola la política si se usa otro medio de pago para eso). Mercado Pago quedó descartado
  del todo, no solo para Android.
- **Empaquetado para Play Store: TWA (Trusted Web Activity) con Bubblewrap.** Envuelve la PWA
  actual sin reescribirla. Para cobrar dentro de una TWA se usa la **Digital Goods API**
  (parte de la Payment Request API del navegador), no el Play Billing Library nativo.
  **Todavía no se armó el TWA.**
- **Backend: Firebase** (no Supabase). La dueña ya usa Supabase pero para otro proyecto
  sin relación; se evaluó y se eligió Firebase porque las notificaciones de Google Play
  (RTDN) se integran nativamente vía Pub/Sub con Cloud Functions, sin un webhook intermedio.
- **Play Console:** la dueña ya tiene cuenta de developer (pagada, activa).

### Estado del proyecto de Firebase

- **Nombre:** Agenda Docente — **Project ID:** `agenda-docente-8c53d`
- **Plan actual:** Spark (gratis). **Ojo:** para desplegar las Cloud Functions hay que pasar
  a **Blaze** (pago por uso, pide tarjeta) — la dueña tiene desconfianza con este paso, avisar
  que se puede poner una alerta de presupuesto en $0 y que el uso esperado de esta app cae
  dentro de la capa gratuita de Blaze igual.
- **Firestore:** creado. Edición Standard, modo producción, región `southamerica-east1` (São Paulo).
- **Authentication:** proveedor **Google** habilitado. Nombre público del proyecto: "Agenda
  Docente". Correo de asistencia: `estudioam.dev@gmail.com` (mismo que figura en
  `privacy-policy.html`).
- **Dominios autorizados agregados:** `localhost`, `agenda-docente-8c53d.firebaseapp.com`,
  `agenda-docente-8c53d.web.app`, `agendadocente.pages.dev`.
- **Config web (ya integrada en `index.html`, es pública/no es secreta):**
  ```js
  {
    apiKey: "AIzaSyBxDVr9MfxKBDwuT1o-zz97JvW1zMoLOzY",
    authDomain: "agenda-docente-8c53d.firebaseapp.com",
    projectId: "agenda-docente-8c53d",
    storageBucket: "agenda-docente-8c53d.firebasestorage.app",
    messagingSenderId: "903525915752",
    appId: "1:903525915752:web:b086ebfb1986e27081efdd",
  }
  ```

### Qué se tocó en el código (rama `claude/subscription-by-device-jzdkkp`)

- **`index.html`** (al final, `<script type="module">` nuevo, no toca el resto de la app):
  inicializa Firebase, expone `window.fbSignIn()` / `window.fbSignOut()` (login Google vía
  Firebase Auth, separado del login que ya existía para Google Drive — **no se unificaron
  todavía**, son dos flujos de Google distintos conviviendo). Al loguearse, escucha en
  tiempo real `subscriptions/{uid}` en Firestore y guarda el estado en
  `document.documentElement.dataset.subscription`. **Todavía no gatea ninguna función
  premium con ese estado** — falta decidir qué funciones son premium.
- **`firebase.json`, `firestore.rules`, `firestore.indexes.json`**: config de Firebase CLI.
  Las reglas (cada docente lee solo su propio doc de suscripción, nadie escribe salvo el
  Admin SDK) ya están **pegadas y publicadas manualmente** en la consola de Firestore
  (pestaña Reglas), coinciden con `firestore.rules`.
- **`functions/index.js`, `functions/package.json`**: esqueleto de Cloud Functions, **sin
  desplegar todavía** (falta plan Blaze). Dos funciones:
  - `verifyPurchase`: callable, la llama la app justo después de una compra para validarla
    contra la Google Play Developer API y guardar el estado en Firestore.
  - `playRtdn`: HTTP endpoint que recibe las notificaciones push (Pub/Sub) de Play cuando
    una suscripción se renueva/cancela, y actualiza Firestore.
  - **Placeholders pendientes:** `PACKAGE_NAME` en `functions/index.js` (nombre de paquete
    real de Play Console, todavía no existe porque la app no está creada ahí) y el secreto
    `PLAY_SERVICE_ACCOUNT` (JSON de una cuenta de servicio con permiso "Ver datos
    financieros" en Play Console → Configuración → Acceso a la API).
- **`privacy-policy.html`**: actualizada con sección "Suscripción y pagos" y ajustes en
  "dónde se guardan tus datos" / "con quién compartimos", para reflejar que ahora hay un
  servidor propio (Firebase) que guarda el estado de suscripción por cuenta (no los datos
  de cursada/alumnos, que siguen solo locales + backup opcional a Drive del propio usuario).

### Pendiente / próximos pasos (en orden razonable)

1. Confirmar si Cloudflare Pages genera preview deploy para esta rama y probar el login de
   Google ahí (en el sandbox de esta sesión no se pudo probar: bloquea salida a
   `google.com`/`gstatic.com` por política de red, no es un bug del código).
2. Decidir qué funciones de la app son "premium" (todavía no definido).
3. Alta de la app en Play Console (nombre de paquete, ficha, etc.) — esto da el
   `PACKAGE_NAME` real que falta en `functions/index.js`.
4. Armar el TWA con Bubblewrap apuntando a `agendadocente.pages.dev` (o el dominio final),
   configurar Digital Asset Links (`assetlinks.json`).
5. Crear el producto de suscripción en Play Console (Monetización).
6. Pasar Firebase a plan Blaze, crear el secreto `PLAY_SERVICE_ACCOUNT`, desplegar
   `functions/` (`firebase deploy --only functions`), configurar RTDN en Play Console
   apuntando a la URL de `playRtdn`.
7. Implementar en `index.html` el flujo de compra con la Digital Goods API
   (`getDigitalGoodsService('https://play.google.com/billing')`) y llamar a `verifyPurchase`
   tras la compra.
8. Gatear las funciones premium según `document.documentElement.dataset.subscription`.
9. Mergear `claude/subscription-by-device-jzdkkp` a producción cuando todo esté probado.

### Perfil de la dueña del proyecto

No es programadora — está aprendiendo Firebase sobre la marcha. Cuando se le pide hacer algo
en una consola web (Firebase, Play Console, Cloudflare), conviene dar instrucciones paso a
paso concretas ("hacé clic en X"), no asumir que sabe dónde está cada cosa.

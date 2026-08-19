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
2. Cobrar una **suscripción paga** que desbloquee funciones premium.
3. Que la suscripción sea **por cuenta** (Google), no por dispositivo — si el docente usa la
   app en el celu y en la compu, paga una sola vez.

### Qué funciones van a ser premium (decidido, no implementado todavía)

- **Gratis:** cursos y alumnos ilimitados, carga de asistencia y notas sin restricción — el
  uso diario core de la app no se toca.
- **Premium:**
  - Plan gratis limitado a **1 o 2 cursos**; cursos ilimitados es premium.
  - Carga de **licencias, paros y demás eventos administrativos** (todo lo que hoy permite
    llevar registro/conteo anual — ver `LICENCIA_TIPOS`, `LICENCIA_INFO`,
    `licenciaTallyThisYear()` etc. en `index.html`, línea ~1758 en adelante).
  - **Alertas automáticas** (ej. `listadosProximosAVencer()`, línea ~2345).
  - Ver la **ayuda de licencias sacada del Estatuto Docente** (`LICENCIA_INFO`): la idea es
    que sepan que existe (visible pero bloqueada), no que esté oculta del todo — "que sepan
    que están, pero que paguen".
- **Web (`agendadocente.pages.dev`) también queda bloqueada, no solo la app de Play Store**
  (decisión explícita de la dueña, revirtiendo la idea inicial de dejar la web libre). Como
  Google Play Billing solo se puede usar dentro de la TWA, en la web hay que mostrar un cartel
  tipo "Descargá la app de Play Store para suscribirte" en vez de un flujo de pago in-situ.
- **Importante — no implementar el bloqueo todavía.** Se decidió esperar a tener Play Billing
  funcionando antes de programar las restricciones, para no dejar a nadie (incluida la propia
  dueña, que usa la app a diario) sin forma de pagar y sin acceso a algo que ya usaba. Cuando
  se implemente, la cuenta de Google de la dueña debe tener su doc en `subscriptions/{uid}`
  marcado `active` para no verse afectada.

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

### Validado en producción (preview de Cloudflare Pages)

Probado a mano el 19/8/2026 en `https://1a488a49.agendadocente.pages.dev` (preview del commit
`c1b73be`, rama `claude/subscription-by-device-jzdkkp`):
- `await window.fbSignIn()` abre el popup de Google y devuelve el usuario logueado
  (uid de prueba: `vczZgA8PIxNOoACG6j4zxpJTav23`, cuenta `estudioam.dev@gmail.com`).
- La escucha en tiempo real de `subscriptions/{uid}` funciona: al crear a mano el doc
  `subscriptions/vczZgA8PIxNOoACG6j4zxpJTav23` con `status: "active"` en la consola de
  Firestore, `document.documentElement.dataset.subscription` pasó de `'inactive'` a
  `'active'` **sin recargar la página**.
- Hay warnings benignos de "Cross-Origin-Opener-Policy... window.closed" en consola durante
  el popup de login — no impiden que el login se complete, se pueden ignorar.
- Ese documento de prueba se dejó en Firestore (sirve para seguir probando con esa cuenta
  como si tuviera suscripción activa).

Con esto: **Auth + Firestore end-to-end confirmado funcionando.** Falta todo lo de Play
Store/Billing (nada de eso se pudo probar todavía, depende de Play Console).

### Pendiente / próximos pasos (en orden razonable)

1. Decidir qué funciones de la app son "premium" (todavía no definido).
2. Alta de la app en Play Console (nombre de paquete, ficha, etc.) — esto da el
   `PACKAGE_NAME` real que falta en `functions/index.js`.
3. Armar el TWA con Bubblewrap apuntando a `agendadocente.pages.dev` (o el dominio final),
   configurar Digital Asset Links (`assetlinks.json`).
4. Crear el producto de suscripción en Play Console (Monetización).
5. Pasar Firebase a plan Blaze, crear el secreto `PLAY_SERVICE_ACCOUNT`, desplegar
   `functions/` (`firebase deploy --only functions`), configurar RTDN en Play Console
   apuntando a la URL de `playRtdn`.
6. Implementar en `index.html` el flujo de compra con la Digital Goods API
   (`getDigitalGoodsService('https://play.google.com/billing')`) y llamar a `verifyPurchase`
   tras la compra.
7. Gatear las funciones premium según `document.documentElement.dataset.subscription`.
8. Mergear `claude/subscription-by-device-jzdkkp` a producción cuando todo esté probado.

### Perfil de la dueña del proyecto

No es programadora — está aprendiendo Firebase sobre la marcha. Cuando se le pide hacer algo
en una consola web (Firebase, Play Console, Cloudflare), conviene dar instrucciones paso a
paso concretas ("hacé clic en X"), no asumir que sabe dónde está cada cosa.

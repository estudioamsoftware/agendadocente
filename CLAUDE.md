# Agenda Docente — cómo trabajar en este repo

## Cómo comunicarse con la dueña del proyecto

- **Nunca usar los cuadros de opciones para preguntar** (el widget de preguntas con
  botones). Le tildan el celular cuando está trabajando desde ahí. Si hace falta
  preguntar algo, se pregunta **en texto normal**, dentro de la respuesta.
- No es programadora. Cuando hay que hacer algo en una consola web (Firebase, Play
  Console, GitHub), dar los pasos concretos ("tocá X, después Y"), sin asumir que
  sabe dónde está cada cosa. Si pide un link, pasarle el link pelado y nada más:
  suele estar en el celu, donde copiar y pegar es un engorro.
- Trabaja desde el celular y desde la compu, alternando. Respuestas cortas.

## Qué es esto

PWA de un solo archivo para docentes (asistencia, notas, cursada): `index.html` tiene
todo el HTML/CSS/JS. No hay build step, ni npm, ni framework. Alrededor:
`service-worker.js`, `manifest.json`, `privacy-policy.html`, los íconos y
`tools/make-icons.py`.

## Datos confirmados (verificados en producción, no suponer otra cosa)

- **Hosting:** GitHub Pages, rama `main`, carpeta raíz.
  Producción en `https://estudioamsoftware.github.io/agendadocente/`.
- **Empaquetado para Android:** se usó **PWABuilder** (pwabuilder.com), no Bubblewrap.
  El `.aab` que está publicado salió de ahí. `twa/README.md` documenta Bubblewrap como
  alternativa, pero nunca se usó.
- **Package ID:** `com.estudioam.agendadocente` (definitivo, no se puede cambiar).
- **Digital Asset Links:** publicado en el repo aparte
  `estudioamsoftware/estudioamsoftware.github.io`, en `.well-known/assetlinks.json`.
  Ese repo necesita el archivo `.nojekyll` en la raíz, si no GitHub Pages ignora la
  carpeta `.well-known` y el archivo da 404.
- **Estado en Play Console:** publicada en pista de **prueba interna**, instalada y
  funcionando (abre sin barra de navegador, o sea que la verificación de dominio anda).

Si algún documento del repo dice Cloudflare Pages o Bubblewrap, está desactualizado:
quedó de intentos anteriores.

## El login de Google / Drive

### Mudado a proyecto propio (27/8/2026)

Agenda Docente ya no comparte proyecto de Google Cloud con las otras apps de la dueña.

- **Proyecto nuevo:** `Agenda Docente` (ID `agenda-docente-506819`), en la cuenta
  **`estudioam.dev@gmail.com`** (la de Estudio AM, no la vieja de English Beats).
- **Cliente OAuth en uso:** `186098387728-efdun1mckj6jcil78b6hnn9pbpgij9dr`
  (tipo Aplicación web, creado el 27/8/2026 en ese proyecto nuevo). Es el que está
  escrito en `index.html` como `GD_CID`. Origen autorizado:
  `https://estudioamsoftware.github.io`.
- Google Drive API habilitada en el proyecto nuevo, pantalla de consentimiento OAuth
  creada (Externo, nombre "Agenda Docente").
- **Antes de este cambio se le pidió a la única usuaria activa (la dueña) que bajara
  "Guardar copia en un archivo"**, siguiendo el plan de abajo. Reconectó Drive después
  del cambio de `GD_CID` sin pérdida de datos.
- El proyecto viejo (`agenda-docente-500923`, cuenta `englishbeatsclasesyrecursos@gmail.com`,
  cliente `721873412047-e1kbmt4a2uah5cekj69gb8qmqsrmn55m`) queda retirado para esta app.
  No hace falta borrarlo — ya no lo usa `index.html` — pero si algún día se quiere borrar,
  primero confirmar que ninguna otra app de la dueña lo usa (no debería, era específico de
  Agenda Docente).

### Publicado a "En producción" (27/8/2026) — ya no hace falta anotar testers para Drive

Como el proyecto ya es exclusivo de Agenda Docente, publicarlo **no arrastra a ninguna otra
app** de la dueña (antes sí, por eso no se tocaba en el proyecto viejo compartido). Se hizo
en Google Auth Platform → Público → "Publicar app", sin pedir verificación de Google (los
permisos que pide la app —`drive.file` y `email`— son no sensibles). Cualquier profe con
cuenta de Google ya puede conectar Drive sin que la anotemos a mano en ninguna lista.

Antes de poder publicar hizo falta completar en **Información de la marca**:
- Página principal: `https://estudioamsoftware.github.io/agendadocente/`
- Política de Privacidad: `https://estudioamsoftware.github.io/agendadocente/privacy-policy.html`

**A propósito no se subió logo.** En cuanto se sube un logo a esa pantalla, Google exige
mandar la app a verificación (trámite de semanas, pide video de demostración, etc.). Sin
logo la pantalla de permisos de Google se ve más genérica, pero funciona igual. Si en algún
momento se quiere esa pantalla más prolija, hay que estar dispuestas a pasar por la
verificación — no es necesario para que la app funcione.

### No cambiar el cliente de OAuth por prolijidad (sigue valiendo)

El permiso que usa la app es `drive.file`, que da acceso **solo a los archivos que creó
ese cliente**. Si se cambia el `GD_CID` de nuevo sin plan, la app deja de ver el `Datos de
Agenda Docente.json` que ya existe para cada docente que conectó Drive con el cliente
actual — no se borra, pero queda huérfano y la app arranca uno nuevo en blanco. La mudanza
del 27/8 fue la excepción justificada (aislar el proyecto); no repetir el cambio sin un
motivo igual de bueno y sin seguir el plan de abajo.

### Cómo mudar el `GD_CID` sin perder datos (por si hace falta otra vez)

**Ojo: un plan viejo decía hacerlo con "Crear backup" y "Restaurar backup de Drive". No
sirve:** ese backup se sube al Drive de la docente pero *dentro de la carpeta que creó el
cliente viejo*, y con permiso `drive.file` el cliente nuevo no puede verla. Queda del lado
equivocado de la mudanza.

Lo que sí vale, mirando el código:

- **Los datos de verdad viven en el dispositivo** (`localStorage`, clave `agendaDocente.v1`).
  Drive es respaldo y sincronización entre la compu y el celu, no la fuente.
- Cuando el cliente nuevo conecta y no encuentra archivo remoto, la app **sube lo local**
  (`gdPull()`: `if(!gd.fid){ await gdPushNow(); ... }`). No borra nada.
- Ya hay red anti-pisada (`remotePierdeDatos` / `localPierdeDatos` + `showSyncConflictDialog`),
  agregada justo por el susto del cambio de dominio de agosto.

O sea que para la docente que usa la app en **un solo dispositivo** —el caso normal— la
mudanza es casi transparente: reconecta Drive, la app no encuentra nada, sube lo que tiene y
sigue. Lo único que se pierde es el historial de backups viejos, y queda un archivo huérfano
en su Drive (no se borra, simplemente la app deja de verlo).

**Dos trampas nuevas que aparecieron al hacer la mudanza del 27/8, para no repetirlas:**

1. **No alcanza con crear el cliente OAuth — hay que declarar los permisos aparte.** En
   Google Auth Platform → "Acceso a los datos", si no se agregan explícitamente los scopes
   (`.../auth/drive.file` y `.../auth/userinfo.email`), el cliente nuevo consigue un token
   pero sin permiso real sobre Drive: la app tira **"Error en Drive: Request had
   insufficient authentication scopes"**. Se soluciona agregando esos dos scopes ahí y
   guardando — pero ojo con el punto 2, no alcanza con arreglar esto solo.

2. **Una vez que la app quedó con un token "malo" guardado, no se autocorrige sola.** El
   token se guarda en `sessionStorage` (`gd_tok`) y la marca de "ya se conectó antes" en
   `localStorage` (`gd_was_connected`). Mientras esa marca siga en `1`, la app solo reintenta
   en silencio (`gdReconnect()`, sin mostrar pantalla de permisos) — nunca vuelve a pedir el
   consentimiento completo con los scopes nuevos. Ni recargar la página ni tocar "Reintentar"
   alcanza. Hace falta borrar **todos los datos guardados del sitio** (`chrome://settings/content/all`
   → buscar `estudioamsoftware.github.io` → Eliminar datos, o en la consola del navegador
   `localStorage.clear(); sessionStorage.clear(); location.reload();`) para forzar que
   vuelva a pedir todo de cero. Como esto también borra `agendaDocente.v1` (los datos locales),
   por eso el paso 1 del orden de abajo (bajar el archivo antes de tocar nada) es imprescindible.

Los dos casos donde **sí** se puede perder algo:
1. La docente usa **dos dispositivos** y depende de Drive para sincronizar.
2. Reinstala la app, cambia de teléfono o limpia los datos del navegador *entre medio*.

Para cubrir esos dos casos se agregó al menú ⋯ (27/8): **"Guardar copia en un archivo"** y
**"Restaurar desde un archivo"** (`exportToFile()` / `importFromFile()` en `index.html`).
Bajan y cargan un `.json` común, que no depende ni de Drive ni del cliente de OAuth — es la
única copia que cruza una mudanza de `GD_CID`.

**Orden para el día de la mudanza:**
1. Que cada docente entre a la app y use "Guardar copia en un archivo" (queda en Descargas).
2. Recién ahí cambiar el `GD_CID` en `index.html` y publicar.
3. Cada una reconecta Drive. Si sus datos siguen ahí (lo esperable), listo.
4. Si a alguna le falta algo, "Restaurar desde un archivo" con el `.json` del paso 1.

### Play Console (sigue en la cuenta de Estudio AM, sin cambios)

Para sumar una docente nueva a la prueba interna de Play Store:
https://play.google.com/console/u/0/developers/6208089129841152998/app/4974565274805185721/tracks/internal-testing?tab=testers

Si a una tester le sale **"No se encontró el elemento"** en la Play Store, o no está
anotada ahí, o el mail anotado no es el que tiene puesto en la Play Store del celular
(aceptar la invitación en el navegador con otra cuenta no sirve). Esta lista sigue siendo
necesaria — es independiente de la lista de testers de Drive, y no desaparece con la
mudanza de arriba.

### Pendientes de orden (actualizado 27/8/2026)

- ~~Mudar Agenda Docente a su propio proyecto de Google Cloud~~ ✅ hecho (ver arriba).
- ~~Publicar el proyecto nuevo a "En producción"~~ ✅ hecho (ver arriba). Ya no hace falta
  anotar testers a mano para el login de Drive.
- Lo del tope de 10 dominios sin verificar y "limpiar dominios muertos"
  (`plantillacomercios.pages.dev`, `comercios.pages.dev`) ya **no aplica a Agenda
  Docente** — era un problema del proyecto viejo compartido. Sigue siendo un tema para
  las otras apps de la dueña si algún día se ordena ese proyecto, pero no es parte de
  este repo.

### Ojo con las cuentas

Ahora Drive (proyecto `agenda-docente-506819`) y Firebase (proyecto `agenda-docente-8c53d`,
número 903525915752) viven los dos en `estudioam.dev@gmail.com` — se resolvió la separación
que había antes. Falta confirmar que Play Console también termine ahí antes de cobrar (hoy
es la cuenta de Estudio AM, a confirmar si es la misma).

## La venta: estado y qué falta (actualizado 27/8/2026, ramas ya mergeadas)

Las dos ramas viejas de venta/suscripción (`claude/agenda-docente-play-store-7lv177` y
`claude/subscription-by-device-jzdkkp`, ninguna mergeada a `main` hasta hoy) ya están
juntas en esta rama. Quedaron sumados:

- El candado de la versión gratis (sección `/* ============ Licencia ============ */` en
  `index.html`, ver detalle abajo) y `VENTA.md` con el plan de venta.
- La config de referencia del TWA con Bubblewrap en `twa/` (no es la que se usa hoy — el
  `.aab` publicado salió de PWABuilder — pero sirve si el día de mañana hay que regenerar
  declarando Play Billing).
- Firebase Auth + Firestore integrados en `index.html` (al final, `<script type="module">`
  nuevo que no toca el resto de la app), esqueleto de Cloud Functions (`functions/`), config
  de Firebase CLI (`firebase.json`, `firestore.rules`, `firestore.indexes.json`) y los
  assets de la ficha de Play Store (`play-store-assets/`).
- `privacy-policy.html` ya tiene la sección "Suscripción y pagos".

### El candado de la versión gratis

- `LIC_ENFORCE` en `index.html` está en **`false`**: mientras esté apagado, nadie ve el
  candado (las profes que están probando la app no se topan con esto). Se enciende recién
  cuando la app salga a la venta de verdad.
- `LIC_FREE_GROUPS=1`: la versión gratis deja llevar un curso.
- `LIC_REGALADAS`: cuentas con la versión completa de regalo, como hash SHA-256 del mail
  (el repo es público). Hoy solo la cuenta de Estudio AM. Esta lista es un parche
  provisorio — la idea es que la responda Firebase, no el código público (ver abajo).
- `licPaywall()`: hoy el botón "Quiero la completa" abre un mail a `estudioam.dev@gmail.com`.
  Cuando esté Play Billing, tiene que disparar la compra en su lugar.

### Qué funciones van a ser premium (decidido, no implementado todavía)

Esta decisión es más amplia que el candado de "un curso" de arriba — quedó pendiente
unificar los dos enfoques:

- **Gratis:** cursos y alumnos ilimitados, carga de asistencia y notas sin restricción — el
  uso diario core de la app no se toca.
- **Premium:**
  - Cursos ilimitados (el candado de `LIC_FREE_GROUPS` de arriba).
  - Carga de **licencias, paros y demás eventos administrativos** (todo lo que hoy permite
    llevar registro/conteo anual — ver `LICENCIA_TIPOS`, `LICENCIA_INFO`,
    `licenciaTallyThisYear()` etc. en `index.html`).
  - **Alertas automáticas** (ej. `listadosProximosAVencer()`).
  - Ver la **ayuda de licencias sacada del Estatuto Docente** (`LICENCIA_INFO`): la idea es
    que sepan que existe (visible pero bloqueada), no que esté oculta del todo.
- La web (`estudioamsoftware.github.io/agendadocente/`) también queda bloqueada, no solo la
  app de Play Store — Google Play Billing solo se puede usar dentro de la app empaquetada,
  así que en la web hay que mostrar un cartel tipo "Descargá la app de Play Store para
  suscribirte" en vez de un flujo de pago in-situ.
- Cuando se encienda el bloqueo, la cuenta de Google de la dueña tiene que quedar exceptuada
  (hoy vía `LIC_REGALADAS`, más adelante vía su doc en `subscriptions/{uid}` marcado `active`).

### Decisiones tomadas sobre la venta

- Se vende **por Play Store**, no por afuera ("por fuera nadie la toma en serio").
- Modelo: **gratis con límite de cursos, versión completa paga**. Se descartó la app paga
  de entrada porque nadie compra a ciegas una herramienta de uso diario.
- **Cobro: Google Play Billing únicamente.** Se descartó Mercado Pago porque Google exige
  que el contenido digital consumido dentro de una app de Play use su propio sistema de
  facturación.
- **Backend: Firebase** (no Supabase — la dueña usa Supabase en otro proyecto sin relación).
  Se eligió Firebase porque las notificaciones de Google Play (RTDN) se integran
  nativamente vía Pub/Sub con Cloud Functions, sin webhook intermedio.
- Ojo con esto: Play deja pasar una app de paga a gratis, **nunca al revés**.
- **Pendiente de decidir con la dueña:** la licencia se ata a la cuenta de Google, pero
  **el teléfono ofrece solo la cuenta con la que está logueado Chrome**, sin dejar elegir
  otra. Si la docente compra con una cuenta y usa el celu con otra, no va a poder activar.
  Falta resolver esto (explicarlo bien, o sumar activación por código).

### Estado del proyecto de Firebase (backend de la suscripción — no confundir con el de Drive)

- **Nombre:** Agenda Docente — **Project ID:** `agenda-docente-8c53d`, en
  `estudioam.dev@gmail.com` (mismo dueño que el proyecto de Drive, ver arriba, pero es
  **otro proyecto de Google Cloud** — Drive usa `agenda-docente-506819`).
- **Plan actual:** Spark (gratis). Para desplegar las Cloud Functions hay que pasar a
  **Blaze** (pago por uso, pide tarjeta) — se puede poner una alerta de presupuesto en $0 y
  el uso esperado de esta app cae dentro de la capa gratuita de Blaze igual.
- **Firestore:** creado. Edición Standard, modo producción, región `southamerica-east1`
  (São Paulo). Reglas de `firestore.rules` (cada docente lee solo su propio doc de
  suscripción, nadie escribe salvo el Admin SDK) ya están pegadas y publicadas a mano en la
  consola de Firestore (pestaña Reglas) — si se vuelve a tocar `firestore.rules`, hay que
  repetir el pegado a mano o desplegar con `firebase deploy --only firestore:rules`.
- **Authentication:** proveedor Google habilitado.
- **Dominios autorizados (pendiente de revisar):** la lista tenía `localhost`,
  `agenda-docente-8c53d.firebaseapp.com`, `agenda-docente-8c53d.web.app` y
  `agendadocente.pages.dev` — este último es el dominio viejo de Cloudflare, ya no
  corresponde. **Falta agregar `estudioamsoftware.github.io`** (el dominio real de
  producción) en Firebase Console → Authentication → Settings → Dominios autorizados, si
  no `fbSignIn()` (el popup de login para la suscripción) no va a andar ahí.
- **Cloud Functions (`functions/index.js`), sin desplegar todavía** (falta el plan Blaze):
  `verifyPurchase` (callable, valida una compra recién hecha contra la Google Play
  Developer API) y `playRtdn` (HTTP endpoint que recibe las notificaciones push de Play
  cuando una suscripción se renueva o cancela). Ambas necesitan el secreto
  `PLAY_SERVICE_ACCOUNT` (JSON de una cuenta de servicio con permiso "Ver datos
  financieros" en Play Console → Configuración → Acceso a la API), que todavía no se creó.
- **Validado el 19/8/2026** (en un preview de Cloudflare Pages que ya no existe, pero la
  lógica de Firebase es independiente del dominio): `fbSignIn()` abre el popup de Google y
  devuelve el usuario logueado; la escucha en tiempo real de `subscriptions/{uid}` en
  Firestore funciona sin recargar la página. **Auth + Firestore confirmado funcionando
  end-to-end.** Falta todo lo de Play Store/Billing, que depende de Play Console.
- Login de Firebase Auth (para la suscripción) y login de Google Drive (para el respaldo)
  son **dos flujos de Google distintos que todavía no se unificaron** — cada uno pide su
  propio consentimiento por separado.

### Pendientes en orden (retomando desde acá)

1. ~~Revisar y juntar las dos ramas~~ ✅ hecho hoy.
2. Crear el producto de suscripción en Play Console (Monetización).
3. Regenerar el `.aab` declarando Play Billing — el que generó PWABuilder no lo trae (en
   Bubblewrap sería `"features": { "playBilling": { "enabled": true } }` en
   `twa/twa-manifest.json`).
4. Pasar Firebase a plan Blaze, crear el secreto `PLAY_SERVICE_ACCOUNT`, desplegar
   `functions/` (`firebase deploy --only functions`), configurar RTDN en Play Console
   apuntando a la URL de `playRtdn`. Antes de esto, agregar `estudioamsoftware.github.io` a
   los dominios autorizados de Firebase Auth (ver arriba).
5. Integrar en `index.html` el flujo de compra con la Digital Goods API
   (`getDigitalGoodsService('https://play.google.com/billing')`), llamar a `verifyPurchase`
   tras la compra, y recién ahí encender `LIC_ENFORCE`.

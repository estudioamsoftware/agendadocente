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

### Play Console

Cuenta "Estudio AM" (`mullerana@hotmail.com`, ver "Ojo con las cuentas" abajo).

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

### Ojo con las cuentas (confirmado 27/8/2026)

Son **dos cuentas de Google distintas**, y esto ya no es una duda: está verificado en
pantalla.

- **Drive** (proyecto `agenda-docente-506819`) y **Firebase** (proyecto
  `agenda-docente-8c53d`, número 903525915752) → `estudioam.dev@gmail.com`.
- **Play Console** (cuenta "Estudio AM", ID `6208089129841152998`) →
  **`mullerana@hotmail.com`**. No es la cuenta de Estudio AM que se usa para todo lo demás.

No hay que cambiar nada — funciona así. Pero tenerlo presente en el paso del
`PLAY_SERVICE_ACCOUNT` (ver más abajo): ahí hay que darle permiso desde Play Console
(cuenta de Hotmail) a una cuenta de servicio que vive en el proyecto de Google Cloud
(cuenta de Gmail). Se cruzan dos cuentas, y es más fácil saberlo antes que descubrirlo
en el momento.

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
- **Dominios autorizados: ya está prolijo (28/8/2026).** Quedaron `localhost`,
  `agenda-docente-8c53d.firebaseapp.com`, `agenda-docente-8c53d.web.app` y
  `estudioamsoftware.github.io` (el dominio real de producción, agregado). Se sacó
  `agendadocente.pages.dev`, el dominio viejo de Cloudflare que ya no se usa.
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

### El perfil de pagos de Play (hecho 27/8/2026) y lo que falta del banco

Para poder siquiera **entrar** a Monetiza con Play → Productos → Suscripciones, Play
Console exige tener creada una **cuenta de comerciante de Google Payments**. Antes de eso
la pantalla de suscripciones está bloqueada con "Requisitos que faltan para acceder a esta
página". Ese perfil se creó el 27/8/2026 con estos datos (son el **perfil público**, lo ve
la compradora):

- Nombre de la empresa: `Estudio AM` (no hace falta tener sociedad; monotributista con CUIT
  alcanza, se pone el nombre de fantasía).
- Sitio web: `https://estudioamsoftware.github.io/agendadocente/`
- ¿Qué vende?: `Software de computadoras`
- Correo de Atención al cliente: `estudioam.dev@gmail.com`
- Nombre del resumen de la tarjeta de crédito: `ESTUDIO AM` (es lo que la docente ve en el
  resumen de su tarjeta; si no lo reconoce, desconoce el cargo).

**Umbral de pago: USD 1.00, se paga mensual.** O sea que Google deposita todos los meses
con que haya habido cualquier venta — no acumula hasta juntar un mínimo grande.

**Falta todavía (y es a propósito):** cargar la **forma de pago** (la cuenta bancaria donde
Google deposita). La dueña es **monotributista y no tiene contador**. Antes de completar ese
paso quedó en hacer una consulta suelta con un contador/gestor, porque:
- lo que pague Google suma a su facturación anual del monotributo (ojo con el tope de
  categoría y la recategorización);
- es plata que entra del exterior, y las reglas cambiarias/impositivas argentinas para eso
  cambian seguido — no improvisar acá.

Esto **no bloquea nada del trabajo técnico**: es el último eslabón, hace falta recién el día
que se quiera cobrar de verdad.

Sobre el **programa de cargos del servicio del 15%**: se creó el grupo de cuentas (paso 1),
pero el link para aceptar los términos (paso 2) no apareció en la consola. **No vale la pena
perseguirlo:** para *suscripciones* Google ya cobra 15% de entrada sin necesidad de anotarse;
ese programa pesa sobre todo en ventas de una sola vez. Si algún día aparece el link, se
acepta y listo.

### El requisito que reordena todo: el `.aab` tiene que declarar Play Billing

**Descubierto el 27/8/2026, cambia el orden del plan.** Con el perfil de pagos ya creado, la
pantalla de Suscripciones se destraba, pero dice *"La app aún no tiene suscripciones"* y el
único botón es **"Sube un nuevo APK"**. Play Console **no deja crear el producto de
suscripción hasta que haya subido un build que declare el permiso de Play Billing**
(`com.android.vending.BILLING`). El `.aab` que está publicado hoy salió de PWABuilder y no
lo trae.

O sea: **primero el `.aab`, después el producto de suscripción.** Al revés no se puede.

**La firma está guardada y aparecida (27/8/2026).** En el Drive de la dueña, carpeta
`agenda docente play store`, están los seis archivos que largó PWABuilder el 19/8:
`Agenda Docente.aab`, `Agenda Docente.apk`, `assetlinks.json`, `Readme.html`,
**`signing-key-info.txt`** (las contraseñas) y **`signing.keystore`** (la firma).

Eso es lo que hace fácil la regeneración, porque:
- Firmando con la **misma** clave, Play reconoce el build como una versión nueva de la app
  que ya está. Con otra clave lo rechaza por firma que no coincide (habría que pedirle a
  Google el reseteo de la clave de subida — se puede, pero es trámite).
- La verificación de dominio (`assetlinks.json`, publicado en el repo
  `estudioamsoftware/estudioamsoftware.github.io`) está atada a la huella de la firma.
  Como la clave no cambia, **ese archivo no hay que tocarlo** y la app va a seguir abriendo
  sin la barra del navegador.

⚠️ Ese `signing.keystore` es irreemplazable: si se pierde, no se puede volver a actualizar
nunca más la app en Play. Y `signing-key-info.txt` tiene contraseñas en texto plano —
**nunca commitearlo al repo**, que es público.

**Cómo regenerar: con PWABuilder, no hace falta Bubblewrap.** Verificado en la documentación
de PWABuilder: soporta tanto la opción de **Google Play Billing** (que es justo lo que
falta) como la de **firmar con una clave propia** ("Mine": se sube el `.keystore` y se
completan alias, key password y store password). Se hace entero desde la web, sin instalar
Node ni JDK. Pasos:

1. pwabuilder.com → pegar `https://estudioamsoftware.github.io/agendadocente/`.
2. Paquete de Android / Google Play → abrir las opciones.
3. Activar **Google Play Billing**.
4. Subir la versión: `appVersion` a `1.0.1` y **`appVersionCode` de 1 a 2** (Play rechaza
   subir dos veces el mismo version code).
5. Signing key → **"Mine"** → subir `signing.keystore` y completar alias/contraseñas
   leyéndolas de `signing-key-info.txt`.
6. Generar, descargar, y subir el `.aab` a la pista de prueba interna en Play Console.

`twa/` (Bubblewrap) queda como plan B nomás; con PWABuilder alcanza.

### El producto de suscripción (creado 27/8/2026)

- **Producto:** ID `agenda_completa` (con prefijo del nombre de la app, a propósito — ver
  `PLAY-STORE-GUIA.md` sobre por qué, si se agregan más apps vendibles a futuro).
  Nombre visible: "Agenda Docente completa".
- **Plan básico mensual:** ID `mensual`, renovación automática, **$2.99 USD**, cargado con
  "Set prices" a los 177 países de una — Argentina queda en pesos, convertido automático
  por Google. **Ya activado.**
- **Plan anual:** ID `anual`, renovación automática, **$25 USD** (~30% menos que 12 meses
  sueltos del mensual). **Ya activado.**
- Los beneficios cargados en la ficha del producto (visibles para la compradora): Cursos
  ilimitados, Licencias/paros y eventos administrativos, Alertas automáticas de
  vencimientos, Respaldo en tu Google Drive. El diálogo `licPaywall()` en `index.html` ya
  se actualizó para decir lo mismo (antes tenía el texto viejo de la primera versión del
  candado, que ofrecía como premium cosas que en realidad son gratis).
- Clasificación por edad del producto: sin especificar (ese campo solo aplica a ciertos
  estados de EE.UU., no afecta a Argentina).

### La cuenta de servicio para `PLAY_SERVICE_ACCOUNT` (creada 28/8/2026)

- **Cuenta de servicio:** `play-store-api@agenda-docente-8c53d.iam.gserviceaccount.com`,
  creada en Google Cloud Console (proyecto `agenda-docente-8c53d`, IAM y administración →
  Cuentas de servicio). Sin roles de IAM asignados en Cloud — no los necesita.
- **Clave JSON descargada** y guardada en la carpeta de Drive de la dueña junto con el
  `signing.keystore` (mismo criterio: nunca commitear al repo).
- **Invitada en Play Console** (Usuarios y permisos → Invitar a un usuario) con **un solo
  permiso**: "Ver los datos financieros" sobre la app Agenda Docente. A propósito no se le
  dio "Administrar los pedidos y las suscripciones" — las funciones (`verifyPurchase`,
  `playRtdn`) solo necesitan leer el estado, no reembolsar ni cancelar.
- **El secreto ya está cargado** en Secret Manager (Google Cloud Console → Seguridad →
  Secret Manager → `PLAY_SERVICE_ACCOUNT`, proyecto `agenda-docente-8c53d`), subiendo el
  archivo JSON directo desde el navegador — no hizo falta la Firebase CLI para este paso.
  `defineSecret("PLAY_SERVICE_ACCOUNT")` en `functions/index.js` lo va a encontrar solo en
  el momento del deploy, sin volver a tocar nada de esto.
- **Nota para la pantalla de "Acceso a la API" de Play Console:** en esta versión de Play
  Console esa pantalla clásica no aparece ni en "Usuarios y permisos" ni en "Configuración"
  — se resolvió igual armando la cuenta de servicio directo en Google Cloud e invitándola
  como "usuario" en Play Console con el permiso puntual.

### Pendientes en orden (actualizado 27/8/2026 — el orden cambió)

1. ~~Revisar y juntar las dos ramas~~ ✅ hecho.
2. ~~Crear la cuenta de comerciante / perfil de pagos~~ ✅ hecho (falta solo el banco, ver
   arriba).
3. ~~Regenerar el `.aab` declarando Play Billing y subirlo a prueba interna~~ ✅ hecho
   (versión 2, `1.0.1.0`), reusando la firma original de PWABuilder.
4. ~~Crear el producto de suscripción en Play Console~~ ✅ hecho, planes mensual y anual
   activos (ver arriba).
5. ~~Actualizar el texto de `licPaywall()` en `index.html`~~ ✅ hecho, ya coincide con los
   beneficios reales cargados en Play Console (ver arriba).
6. ~~Pasar Firebase a plan Blaze~~ ✅ hecho (28/8/2026), reusando la cuenta de facturación
   que ya tenía la dueña de otro proyecto. Se armó además una alerta de presupuesto en $0
   para el proyecto `agenda-docente-8c53d` específicamente (solo alertas, no corta el
   servicio), en Google Cloud Console → Facturación → Presupuestos y alertas.
   ~~Crear el secreto `PLAY_SERVICE_ACCOUNT`~~ ✅ hecho (28/8/2026) — ver el bloque nuevo
   más abajo con el detalle de la cuenta de servicio.
   Falta todavía: desplegar `functions/` (`firebase deploy --only functions`), configurar
   RTDN en Play Console apuntando a la URL
   de `playRtdn`. Ojo con el cruce de cuentas (ver "Ojo con las cuentas").
7. Integrar en `index.html` el flujo de compra con la Digital Goods API
   (`getDigitalGoodsService('https://play.google.com/billing')`), usando el ID de producto
   `agenda_completa` y los planes `mensual`/`anual`. Llamar a `verifyPurchase` tras la
   compra, y recién ahí encender `LIC_ENFORCE`.
8. Completar la ficha de Play Store (iba en "2 de 11 tareas"): descripción, capturas
   —ya hechas, están en `play-store-assets/`—, clasificación de contenido. Se puede hacer en
   paralelo, no bloquea nada.
9. Cargar la forma de pago (cuenta bancaria) después de la consulta con contador/gestor.
10. **Pendiente futuro, no bloquea nada de lo anterior:** armar una landing page para
    promocionar la app por fuera de Google Play (la dueña lo pidió el 28/8/2026, para
    después de terminar lo de arriba).
11. **Pendiente futuro, no bloquea nada de lo anterior:** unificar los dos proyectos de
    Google Cloud de esta app (`agenda-docente-506819` de Drive y `agenda-docente-8c53d` de
    Firebase) en uno solo. Hoy conviven sin problema y ninguna docente nota la diferencia
    — es una prolijada administrativa, no algo urgente. Pero **conviene hacerlo mientras
    solo la dueña usa el respaldo de Drive** (nadie más todavía, 28/8/2026), porque después
    de que se sumen docentes reales, mudar el `GD_CID` vuelve a tener el mismo costo que la
    mudanza del 27/8 (ver "Cómo mudar el `GD_CID` sin perder datos" arriba — son los mismos
    pasos: crear un cliente OAuth nuevo *dentro* del proyecto `agenda-docente-8c53d`,
    declarar los scopes, la dueña baja "Guardar copia en un archivo" antes de tocar nada, se
    cambia `GD_CID` en `index.html`, se reconecta). Ojo: esto **no** resuelve por sí solo
    que hoy el login de Drive y el de Firebase Auth sean dos ventanas de consentimiento
    separadas — eso es un tema de código (dos flujos de login distintos), no de cuántos
    proyectos de Cloud hay atrás.

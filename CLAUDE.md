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

## El login de Google / Drive (resuelto el 19/8/2026)

Ojo: **no está en la cuenta de Estudio AM**. Vive en la cuenta vieja,
`englishbeatsclasesyrecursos@gmail.com`, proyecto de Google Cloud
`agenda-docente-500923`.

- **Cliente OAuth en uso:** `721873412047-e1kbmt4a2uah5cekj69gb8qmqsrmn55m`
  (nombre `agendadocente`, creado el 27/7/2026). Es el que está escrito en
  `index.html` como `GD_CID`.
- Había un cliente viejo, `Agenda docente` (`...-vhvg`, 29/6/2026), sin uso desde
  el 27/7. Se borró el 19/8 para liberar un dominio.
- **El bug:** al mudar la app de Cloudflare Pages a GitHub Pages nunca se agregó el
  origen nuevo, así que Google cortaba con **Error 400: origin_mismatch** y ni
  llegaba a mostrar el selector de cuentas. Se arregló agregando
  `https://estudioamsoftware.github.io` a "Orígenes autorizados de JavaScript".
- **Cuidado con el tope de 10 dominios sin verificar.** Ese proyecto lo comparten
  otras apps de la dueña (My Band Box, Kiosko don jose, ElBohemio, MyLyricsBox,
  yuyitos, Agenda Superior, comercios), así que el cupo está lleno. Para agregar un
  dominio hay que liberar otro, o verificar el dominio en Google Search Console
  (los verificados no cuentan).

### Pendiente: la app está en estado "Prueba"

Mientras siga así, **solo las cuentas anotadas a mano como usuarias de prueba pueden
conectar Drive**. Cualquier otra profe recibe el mismo cartel de bloqueo. Se cambia en
Google Auth Platform → Público → pasar a "En producción". No debería requerir
verificación de Google: el único permiso que pide la app es `drive.file`, que no es
sensible (solo ve los archivos que ella misma creó).

- **`estudioam.dev@gmail.com` es Propietaria del proyecto** (agregada en IAM el
  19/8/2026), así que todo esto se administra desde la cuenta nueva sin haber movido
  nada.

### No cambiar el cliente de OAuth por prolijidad

Tentación a evitar: crear un cliente nuevo en la cuenta de Estudio AM para "ordenar".
El permiso que usa la app es `drive.file`, que da acceso **solo a los archivos que creó
ese cliente**. Si se cambia el `GD_CID`, la app deja de ver el `Datos de Agenda
Docente.json` que ya existe — no se borra, pero queda huérfano y la app arranca uno
nuevo en blanco. Le pasaría a cada docente que ya conectó su Drive. Si hace falta
administrarlo desde otra cuenta, se dan permisos en IAM (ya hecho), no se migra.

### Ojo con las dos cuentas

El login de Drive vive en la cuenta de English Beats; Firebase (proyecto
`agenda-docente-8c53d`, número 903525915752) vive en `estudioam.dev@gmail.com`. Son
proyectos distintos de cuentas distintas. Hoy no molesta, pero antes de cobrar hay que
decidir en cuál queda todo, porque Play Console, Firebase y este login se tienen que
hablar entre ellos.

## Dónde está cada cosa (importante antes de empezar)

El trabajo de venta/suscripción está repartido en **dos ramas, ninguna mergeada a
`main`**. Antes de arrancar algo de eso, mirar las dos — si no, se rehace trabajo ya
hecho:

- **`claude/agenda-docente-play-store-7lv177`** — el candado de la versión gratis
  (sección `/* ============ Licencia ============ */` en `index.html`), `VENTA.md` con
  el plan de venta, y la config del TWA en `twa/`.
- **`claude/subscription-by-device-jzdkkp`** — Firebase Auth + Firestore ya integrados
  y probados, esqueleto de Cloud Functions para validar compras de Play, y los assets
  de la ficha de Play Store. Tiene un `CLAUDE.md` propio con el detalle del proyecto
  de Firebase — ojo que choca con este archivo si se mergean las dos ramas.

`VENTA.md` da Firebase por pendiente, pero en la otra rama ya está hecho y probado.

## Decisiones tomadas sobre la venta

- Se vende **por Play Store**, no por afuera ("por fuera nadie la toma en serio").
- Modelo: **gratis con límite de cursos, versión completa paga**. Se descartó la app
  paga de entrada porque nadie compra a ciegas una herramienta de uso diario.
- Ojo con esto: Play deja pasar una app de paga a gratis, **nunca al revés**.
- La licencia se ata a la cuenta de Google. Limitación detectada probando en el celu:
  **el teléfono ofrece solo la cuenta con la que está logueado Chrome**, sin dejar
  elegir otra. Si la docente compra con una cuenta y usa el celu con otra, no va a
  poder activar. Hay que preverlo (explicarlo bien, o sumar activación por código).

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

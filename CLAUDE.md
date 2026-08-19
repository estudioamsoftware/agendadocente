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

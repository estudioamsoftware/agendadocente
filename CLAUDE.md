# Agenda Docente — cómo trabajar en este repo

## Cómo comunicarse con la dueña del proyecto

- **Nunca usar los cuadros de opciones para preguntar** (el widget de preguntas con
  botones). Le tildan el celular cuando está trabajando desde ahí. Si hace falta
  preguntar algo, se pregunta **en texto normal**, dentro de la respuesta.
- No es programadora. Cuando hay que hacer algo en una consola web (Firebase, Play
  Console, Cloudflare, GitHub), dar los pasos concretos ("tocá X, después Y"), sin
  asumir que sabe dónde está cada cosa.

## Qué es esto

PWA de un solo archivo para docentes (asistencia, notas, cursada): `index.html` tiene
todo el HTML/CSS/JS. No hay build step, ni npm, ni framework. Alrededor: `service-worker.js`,
`manifest.json`, `privacy-policy.html`, los íconos y `tools/make-icons.py`.

## Dónde está cada cosa (importante antes de empezar)

El trabajo de venta/suscripción está repartido en **dos ramas, ninguna mergeada a `main`**.
Antes de arrancar algo de eso, mirar las dos — si no, se rehace trabajo ya hecho:

- **`claude/agenda-docente-play-store-7lv177`** — el candado de la versión gratis
  (sección `/* ============ Licencia ============ */` en `index.html`), `VENTA.md` con
  el plan de venta, y la config del TWA en `twa/`.
- **`claude/subscription-by-device-jzdkkp`** — Firebase Auth + Firestore ya integrados
  y probados end-to-end, esqueleto de Cloud Functions para validar compras de Play,
  los assets de la ficha de Play Store, y un `CLAUDE.md` propio con el detalle del
  proyecto de Firebase.

Las dos ramas mergean limpio entre sí (probado). Ojo: **se contradicen en dos datos**
que conviene resolver antes de seguir — dónde está hosteada la app (GitHub Pages vs
Cloudflare Pages) y cómo se empaqueta para Play (PWABuilder vs Bubblewrap). El `.aab`
que falta regenerar para poder cobrar depende de cuál de las dos sea la buena.

`VENTA.md` da Firebase por pendiente, pero en la otra rama ya está hecho y probado.

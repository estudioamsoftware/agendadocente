# Plan para vender Agenda Docente

Estado y decisiones tomadas, para retomar sin tener que reconstruir el contexto.

## Decisiones ya tomadas

- **Se vende por Google Play Store.** La venta por fuera sola no da confianza.
- **Modelo: gratis con límite + versión completa paga.** Un curso gratis; para
  cargar todos, hay que comprar.
- **La licencia se ata a la cuenta de Google.** Es la única forma de que el
  candado no se pueda saltar. La app ya pedía el mail para el respaldo en Drive,
  así que la identidad ya estaba: se reutiliza esa.
- **Package ID: `com.estudioam.agendadocente`** (sin el prefijo `ar.`). No se
  puede cambiar nunca más.

## Qué está hecho

- PWA publicada en https://estudioamsoftware.github.io/agendadocente/
- Política de privacidad publicada y cargada en Play Console.
- Datos de contacto cargados en Play Console.
- TWA generado con PWABuilder y subido a **Prueba interna** (versión 1.0.0).
- Dominio verificado: `.well-known/assetlinks.json` publicado en el repo
  `estudioamsoftware/estudioamsoftware.github.io` (con `.nojekyll`, si no
  GitHub Pages ignora las carpetas que empiezan con punto).
- **Etapa 1 del candado** (este commit): ver abajo.

## Etapa 1 — el candado (hecho)

Todo vive en `index.html`, sección `/* ============ Licencia ============ */`.

- `LIC_ENFORCE` — **está en `false`**. Mientras esté apagado, todo el mundo tiene
  la versión completa. Es a propósito: las profes que están probando la app no
  se topan con el candado. **Se enciende recién cuando la app salga a la venta.**
- `LIC_FREE_GROUPS` — cuántos cursos permite la versión gratis (hoy: 1).
- `LIC_REGALADAS` — cuentas con la versión completa de regalo, guardadas como
  hash SHA-256 del mail en minúsculas (el repo es público: no se guardan mails
  a la vista). Para agregar a alguien, calcular el hash de su mail y sumarlo
  a la lista.
- `licCanAddGroup()` — la regla. Se consulta en los tres lugares donde se pueden
  sumar cursos: `promptNewGroup()`, `seedGroups()` y el restaurar desde papelera.
- `licPaywall()` — la pantalla de "versión completa". Por ahora el botón abre un
  mail a estudioam.dev@gmail.com; cuando esté Play Billing, va a abrir la compra.

Ojo: el candado solo frena cursos **nuevos**. A quien ya tenga varios cargados no
se le esconde ninguno cuando se encienda.

## Etapa 2 — Firebase (pendiente)

Hoy la lista de licencias está escrita en el código, que es público y corre en el
navegador: alguien que sepa puede editarlo y saltearse el candado. Para que sea
un candado de verdad, la respuesta tiene que venir de un servidor.

Hace falta:
1. Crear el proyecto en Firebase (los créditos de Google cubren el costo).
2. Firestore con una colección de licencias por mail.
3. Reemplazar la consulta a `LIC_REGALADAS` dentro de `licRefresh()` por la
   consulta a Firestore.

## Etapa 3 — cobrar dentro de la app (pendiente)

Para vender por Play Store hay que usar el sistema de pagos de Google (Play
Billing). Cobrar por afuera desde la app distribuida por Play es motivo de baja.

Hace falta:
1. Crear el producto en Play Console (Monetiza con Play → Productos).
2. Regenerar el `.aab` **declarando Play Billing** — el que generó PWABuilder no
   lo trae. En Bubblewrap es `"features": { "playBilling": { "enabled": true } }`.
3. Integrar la Digital Goods API en `licPaywall()` para disparar la compra.
4. Validar la compra del lado de Firebase (si no, se puede falsear).

## Reglas de Google que conviene no olvidar

- Una app **paga se puede pasar a gratis, pero una gratis NUNCA a paga**.
- La app distribuida por Play tiene que cobrar con Play Billing. La versión web
  vendida desde el sitio propio es otro canal y ahí Google no interviene.

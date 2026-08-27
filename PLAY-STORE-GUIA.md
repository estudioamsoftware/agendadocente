# Subir una PWA a Google Play — notas que valen para cualquier proyecto

Esto no es específico de Agenda Docente. Son las cosas que ya se aprendieron a los golpes
haciendo esto, para no volver a descubrirlas en cada app. **Se puede copiar tal cual al
`CLAUDE.md` de otro proyecto.**

## Los archivos que larga PWABuilder y qué es cada uno

Cuando generás el paquete de Android en pwabuilder.com, la descarga trae:

| Archivo | Para qué sirve |
|---|---|
| `.aab` | **Esto es lo que se sube a Play Console.** Google no acepta `.apk` para apps nuevas desde 2021. |
| `.apk` | Para instalarlo a mano en tu propio celular y probarlo antes de subir. **No se sube a Play.** |
| `signing.keystore` | **La firma de la app. Irreemplazable.** Ver abajo. |
| `signing-key-info.txt` | Las contraseñas de esa firma (alias, key password, store password). |
| `assetlinks.json` | El archivo de verificación de dominio. |
| `Readme.html` | Instrucciones genéricas de PWABuilder. |

**Guardá la carpeta entera en Drive apenas la descargás.** No la dejes solo en Descargas.

## Regla de oro: la firma

El `signing.keystore` es lo que le demuestra a Google que la app nueva es la misma app de
antes.

- **Si lo perdés, no podés volver a actualizar esa app nunca más.** Habría que publicarla
  de cero, con otro nombre de paquete, como si fuera una app distinta. No hay forma de
  recuperarlo.
- **`signing-key-info.txt` tiene contraseñas en texto plano: nunca lo subas a un repo**
  (menos si es público). Tampoco lo pegues en un chat.
- La huella de esa firma es la que está escrita en `assetlinks.json`. Mientras firmes
  siempre con la misma clave, ese archivo no se toca nunca más.

## `assetlinks.json` — dónde va (esto tiene trampa)

Es el archivo que hace que la app abra como app y no con la barra del navegador arriba.

- Va en la **raíz del dominio**: `https://TUDOMINIO/.well-known/assetlinks.json`
- **Trampa con GitHub Pages de proyecto:** si tu sitio está en
  `usuario.github.io/proyecto/`, el archivo NO va en el repo del proyecto — tiene que ir en
  la raíz del dominio, o sea en un repo aparte llamado exactamente `usuario.github.io`.
- **Segunda trampa:** ese repo necesita un archivo vacío llamado **`.nojekyll`** en la raíz.
  Sin eso, GitHub Pages ignora las carpetas que empiezan con punto y `.well-known/` da 404.

Si la app abre con la barra del navegador, el problema es casi siempre uno de estos dos.

## Actualizar una app que ya está publicada

En las opciones de PWABuilder:

1. **Signing key → "Mine"** (no "New"). Subís el `signing.keystore` y completás alias, key
   password y store password leyéndolos de `signing-key-info.txt`.
2. **Subí el número de versión.** El `appVersionCode` **siempre** tiene que ser mayor al
   anterior (1 → 2 → 3...). Play rechaza que subas dos veces el mismo número. El
   `appVersion` (1.0.0 → 1.0.1) es el que ve la gente.

Si firmás con una clave distinta, Play rechaza la subida por firma que no coincide. Se
puede pedir un reseteo de la clave de subida, pero es trámite y demora.

## Si la app va a cobrar (suscripciones o compras adentro)

**El orden es obligado, no se puede saltear ningún paso** — cada uno destraba el siguiente:

1. **Crear la cuenta de comerciante** (Play Console → Configuración → Perfil de pagos).
   Hasta que no exista, la pantalla de Suscripciones está bloqueada con "Requisitos que
   faltan para acceder a esta página".
2. **Generar el `.aab` con la opción "Google Play Billing" activada** en PWABuilder, y
   subirlo a alguna pista (prueba interna alcanza). Sin un build que declare Play Billing,
   Play sigue sin dejar crear el producto: te muestra "La app aún no tiene suscripciones" y
   el único botón es "Sube un nuevo APK".
3. **Recién ahí** se crea el producto en Monetiza con Play → Productos → Suscripciones.
   Anotá el **ID del producto** que elijas, porque después va escrito en el código.
4. Programar la compra en la web con la **Digital Goods API**
   (`getDigitalGoodsService('https://play.google.com/billing')`).

### Un producto puede tener varios planes (mensual + anual)

No hace falta crear una suscripción separada para cada período. Adentro de un mismo
producto (por ejemplo `completa`) se agregan varios **planes base**, cada uno con su
propio ID, precio y período de facturación (`mensual`, `anual`). Es lo normal para ofrecer
mensual y anual con descuento sin duplicar nada.

### Si vas a vender varias apps: cuidado con el ID del producto

No quedó claro buscándolo si el ID de un producto (`completa`, por ejemplo) tiene que ser
único solo dentro de esa app, o único en **toda tu cuenta de desarrollador** (todas tus
apps juntas) — las fuentes se contradicen. Para no arriesgarte a que Play te rechace un ID
repetido entre apps distintas, **ponele el nombre de la app adelante en cada una menos la
primera**: `agendadocente_completa`, `chetaxi_completa`, etc. Así no importa cuál sea la
regla real, nunca vas a chocar.

### Reglas de Google que conviene no olvidar

- **Play Billing es obligatorio** para contenido digital consumido dentro de una app de
  Play. Cobrar por afuera (Mercado Pago, transferencia, etc.) es motivo de baja de la app.
- Una app **paga se puede pasar a gratis, pero una gratis NUNCA a paga.** Si vas a cobrar,
  pensalo antes de publicarla gratis.
- Play Billing **solo funciona dentro de la app empaquetada**. En la versión web del mismo
  producto no se puede usar: ahí hay que mostrar un cartel tipo "descargá la app para
  suscribirte".

### Sobre el perfil de pagos (Argentina)

- **No hace falta tener una sociedad.** Monotributista con CUIT alcanza: donde dice "nombre
  de la empresa" va tu nombre de fantasía.
- Ojo que ese perfil es **público**: lo ve quien compra. Conviene poner el nombre de
  fantasía y no tu nombre y apellido.
- El campo "nombre del resumen de la tarjeta de crédito" es **lo que ve la compradora en el
  resumen de su tarjeta**. Si no lo reconoce, desconoce el cargo. Poné algo identificable y
  corto, y que sirva para todas tus apps (el perfil es de la cuenta, no de una app).
- Lo que te paga Google **suma a tu facturación anual del monotributo** y entra como plata
  del exterior. Conviene una consulta con contador/gestor antes de cargar la cuenta
  bancaria. Ese paso es el último de todos y no bloquea nada del trabajo técnico.
- El umbral de pago suele ser bajo (USD 1) y deposita mensual: no acumula meses.

## Dos listas de testers distintas (si la app usa login de Google)

Si la app además usa Google Sign-In / Drive, para que una persona pueda probarla hay que
anotarla en **dos lugares distintos**, y no tienen nada que ver entre sí:

1. **Play Console → prueba interna → testers** — para que pueda *bajar* la app.
   Si le sale **"No se encontró el elemento"** en la Play Store: o no está anotada, o el
   mail anotado no es el que tiene puesto en la Play Store del celular (aceptar la
   invitación en el navegador con otra cuenta no sirve).
2. **Google Auth Platform → Público → usuarios de prueba** — para que pueda *loguearse*.
   Esta segunda lista **desaparece** si publicás la app de OAuth a "En producción". Si los
   permisos que pedís son no sensibles (`drive.file`, `userinfo.email`), publicar no
   requiere pasar por la verificación de Google.

⚠️ **El estado de publicación de OAuth es por proyecto de Google Cloud, no por app.** Si
varias apps comparten proyecto, publicar una las destraba a todas. Conviene que cada app
vendible tenga su propio proyecto.

## Verificación de desarrolladores de Android

Desde 2026 Google pide que todas las apps estén registradas a nombre de un desarrollador
verificado. Si ya tenés cuenta de Play Console, Google lo hace solo con tus datos y la app
aparece como "Registrada" sin que hagas nada. Es informativo, no hay trámite.

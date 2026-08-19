# Armar el TWA (app Android) con Bubblewrap

Esto empaqueta la PWA de Agenda Docente (que ya vive en
`https://estudioamsoftware.github.io/agendadocente/`) como una app Android
real (.aab) para subir a Play Console.

**Importante:** este paso necesita correrse en una computadora (no desde el
celu), porque descarga el Android SDK y compila con Java. Necesitás tener
instalado antes:

- [Node.js](https://nodejs.org/) (18 o superior)
- [JDK 17 o 21](https://adoptium.net/)

No hace falta instalar Android Studio completo — Bubblewrap descarga el
Android SDK mínimo que necesita la primera vez que lo corrés.

## 1. Instalar Bubblewrap

```bash
npm install -g @bubblewrap/cli
```

## 2. Inicializar el proyecto

Parado en una carpeta vacía (por ejemplo `agendadocente-twa/`, fuera del
repo del código de la app):

```bash
bubblewrap init --manifest="https://estudioamsoftware.github.io/agendadocente/manifest.json"
```

Te va a hacer una serie de preguntas. Respondé así (ya están precargadas en
`twa-manifest.json` de esta carpeta como referencia, por si preferís
copiarlas a mano):

| Pregunta | Respuesta |
|---|---|
| Application ID (package name) | `ar.com.estudioam.agendadocente` |
| Application name | `Agenda Docente` |
| Launcher name | `Agenda Docente` |
| Display mode | `standalone` |
| Theme color | `#F7EFE7` |
| Background color | `#F7EFE7` |
| Start URL | `/agendadocente/index.html` |
| Icon URL | `https://estudioamsoftware.github.io/agendadocente/icon-512.png` |
| Maskable icon URL | `https://estudioamsoftware.github.io/agendadocente/icon-maskable-512.png` |

Al final del proceso te va a pedir crear una **firma (keystore)**: contraseña
del keystore y del alias. **Guardá esa contraseña y el archivo
`android.keystore` en un lugar seguro (con backup)** — sin eso no vas a poder
publicar futuras actualizaciones de la app en Play Store. Si lo perdés, no
hay forma de recuperarlo.

## 3. Compilar

```bash
bubblewrap build
```

Esto genera:
- `app-release-bundle.aab` → **este es el archivo que subís a Play Console**
  (Producción o la pista de prueba que estés usando).
- `app-release-signed.apk` → para probarlo vos mismo en un celular antes de
  subirlo.

## 4. Verificar el dominio (Digital Asset Links)

Para que la app abra sin la barra de direcciones del navegador (como una app
nativa), Android necesita confirmar que vos sos dueño tanto del sitio como
de la app. Bubblewrap te muestra al final del build una huella SHA-256 de tu
firma, algo así:

```
14:6D:E9:...:XX (SHA256)
```

Con eso hay que armar un archivo `assetlinks.json` y publicarlo en:

```
https://estudioamsoftware.github.io/.well-known/assetlinks.json
```

Ojo con esto: como tu sitio usa GitHub Pages de proyecto
(`estudioamsoftware.github.io/agendadocente/`), ese archivo tiene que vivir
en la **raíz** del dominio `estudioamsoftware.github.io`, no dentro del repo
`agendadocente`. Eso implica crear un repo aparte llamado exactamente
`estudioamsoftware.github.io` (con Pages activado) que sirva ese archivo.
Contenido del archivo:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "ar.com.estudioam.agendadocente",
    "sha256_cert_fingerprints": ["TU_HUELLA_SHA256_ACA"]
  }
}]
```

Cuando tengas la huella SHA-256 (te la da `bubblewrap build` o corriendo
`keytool -list -v -keystore android.keystore -alias androidagendadocente`),
pasámela y te ayudo a crear ese repo y publicar el archivo.

## 5. Subir a Play Console

En Play Console → **Prueba y lanza** → elegís la pista (interna, cerrada o
producción) → **Crear nueva versión** → subís el `.aab` generado en el paso 3.

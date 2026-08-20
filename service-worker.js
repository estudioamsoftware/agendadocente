// La app entera es un solo archivo grande. Antes se pedía siempre por internet y
// recién si fallaba se usaba la copia guardada: con wifi malo eso son varios segundos
// de pantalla en blanco antes de rendirse, con la app ya guardada en el teléfono.
// Ahora se muestra la copia al toque y se actualiza por atrás (stale-while-revalidate).
const CACHE_NAME = "agenda-docente-v8";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-maskable-192.png", "./icon-maskable-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(ASSETS.map((url) => cache.add(url).catch((e) => console.warn("No se pudo cachear", url, e))))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// El botón 🔄 de la app manda este mensaje: tira la copia guardada para que la
// próxima carga baje todo de nuevo, sin tener que desinstalar nada.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "purge") {
    event.waitUntil(
      caches.keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() => { if (event.source) event.source.postMessage({ type: "purged" }); })
    );
  }
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  // Google (login de Drive, API) nunca se cachea: tiene que ir siempre a la red.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(req).then((cached) => {
        // Actualización silenciosa por atrás. Si no hay internet, no pasa nada.
        const fresh = fetch(req)
          .then((res) => {
            if (res && res.ok && res.type === "basic") cache.put(req, res.clone()).catch(() => {});
            return res;
          })
          .catch(() => null);
        // Si hay copia, se muestra ya. Si no, se espera a la red.
        if (cached) return cached;
        return fresh.then((res) => res || cache.match("./index.html"));
      })
    )
  );
});

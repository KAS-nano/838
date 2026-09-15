const CACHE_NAME = "838-public-v1";
const APP_SHELL = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function isPublicRequest(request) {
  const url = new URL(request.url);
  return url.origin === self.location.origin
    && request.method === "GET"
    && !url.pathname.startsWith("/api/")
    && !url.pathname.startsWith("/auth/")
    && !url.pathname.startsWith("/_next/image");
}

self.addEventListener("fetch", (event) => {
  if (!isPublicRequest(event.request)) return;
  const request = event.request;
  const isNavigation = request.mode === "navigate";
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(isNavigation ? "/" : request).then((cached) => cached || Response.error())),
  );
});

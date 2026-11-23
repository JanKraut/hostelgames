// Service worker: makes the whole site available offline.
// This is a template from @hostelgames/core: its eleventy plugin writes it to <output>/sw.js
// after each build and fills in the cache name, the file list and a version hash of all files.
// Each game has its own cache name, so games sharing one domain (hostelgames.com/<game>/)
// never delete each other's caches.

const VERSION = "__VERSION__";
const FILES = __FILES__; // every published file, relative to this script
const NAME = "__NAME__";
const CACHE = `${NAME}-${VERSION}`;

// Install: download everything once.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // cache: "reload" skips the browser's HTTP cache, so a new version never stores old files.
      .then((cache) => cache.addAll(FILES.map((file) => new Request(new URL(file, self.registration.scope), { cache: "reload" }))))
      .then(() => self.skipWaiting()),
  );
});

// Activate: remove caches of older versions.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(`${NAME}-`) && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || !request.url.startsWith(self.registration.scope)) return;

  // Pages: network first, so updates show up right away; the cache when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => (await caches.match(request, { ignoreSearch: true })) ?? caches.match(self.registration.scope)),
    );
    return;
  }

  // Everything else (CSS, JS, fonts, icons): cache first.
  event.respondWith(caches.match(request, { ignoreSearch: true }).then((cached) => cached ?? fetch(request)));
});

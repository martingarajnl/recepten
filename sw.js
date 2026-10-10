/* GARAJ: altijd online. Deze service worker maakt de site installeerbaar en haalt alles live op. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => e.respondWith(fetch(e.request)));

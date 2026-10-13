/* GARAJ offline: bewaart de site en alle recepten op je toestel, zodat je ook
   zonder wifi in de keuken verder kunt. Nieuwe versies komen vanzelf binnen:
   pagina's en scripts worden eerst online opgehaald, foto's eerst uit het geheugen. */
importScripts("/recepten.js");
const VERSIE = "garaj-" + (self.GARAJ_DATA && GARAJ_DATA.versie || "1");
const KERN = ["/", "/style.css", "/recepten.js", "/bouw.js", "/app.js", "/manifest.webmanifest", "/hero.jpg", "/tafel.jpg", "/icon-192.png"];

self.addEventListener("install", e => {
  const recepten = (self.GARAJ_DATA ? GARAJ_DATA.RECEPTEN : []);
  const lijst = KERN.concat(recepten.map(r => `/recept/${r.slug}/`), recepten.map(r => "/" + r.foto).filter(Boolean));
  e.waitUntil(caches.open(VERSIE).then(c => Promise.all([...new Set(lijst)].map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("garaj-") && k !== VERSIE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isBeeld = /\.(jpg|jpeg|png|webp|ico)$/i.test(url.pathname) || url.hostname === "fonts.gstatic.com";
  if (url.origin !== location.origin && !/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) return;
  if (url.pathname.startsWith("/beheer")) return;

  if (isBeeld) {
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      if (res.ok || res.type === "opaque") { const kopie = res.clone(); caches.open(VERSIE).then(c => c.put(req, kopie)); }
      return res;
    })));
    return;
  }
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const kopie = res.clone(); caches.open(VERSIE).then(c => c.put(req, kopie)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || (req.mode === "navigate" ? caches.match("/") : Response.error()))));
});

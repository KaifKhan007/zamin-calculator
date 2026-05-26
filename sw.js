// Zamin Calculator service worker
const CACHE = "zamin-v2";
const FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  // Only handle GET
  if (e.request.method !== "GET") return;
  // Network-first for HTML so updates roll out fast; cache-first for everything else
  const url = new URL(e.request.url);
  const isHTML = e.request.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname === "/";
  if (isHTML){
    e.respondWith(
      fetch(e.request).then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return r;
      }).catch(() => caches.match(e.request).then((m) => m || caches.match("./index.html")))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then((m) => m || fetch(e.request).then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return r;
      }))
    );
  }
});

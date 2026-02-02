self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // ONLINE ONLY – no cache
  event.respondWith(fetch(event.request));
});

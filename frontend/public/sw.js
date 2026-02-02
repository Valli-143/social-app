// sw.js — ONLINE ONLY PWA
self.addEventListener("install", () => {
  console.log("Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  console.log("Service Worker activated");
});

// ❌ No cache — app works ONLY when internet is available
self.addEventListener("fetch", () => {
  // do nothing (online only)
});

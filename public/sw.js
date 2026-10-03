// public/sw.js - Production-grade Service Worker for Optigo Central System
const CACHE_NAME = "optigo-pwa-v1";

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/2.ico",
  "/img/icon.png",
  "/img/logo.png",
  "/optigo_logo.png",
];

// --- 1. INSTALLATION ---
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing version:", CACHE_NAME);
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn("[Service Worker] Pre-cache partial warning:", err);
      }))
      .then(() => self.skipWaiting())
  );
});

// --- 2. ACTIVATION & CLEANUP ---
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating & claiming clients...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              console.log("[Service Worker] Deleting old cache:", name);
              return caches.delete(name);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// --- 3. BACKGROUND COOKIE/AUTH CHANNEL ---
let messagePort = null;

self.addEventListener("message", (event) => {
  if (event.data === "START_TIMER") {
    if (event.ports && event.ports[0]) {
      messagePort = event.ports[0];

      // Periodic check message
      setInterval(() => {
        if (messagePort) {
          messagePort.postMessage("CHECK_COOKIE");
        }
      }, 8000);
    } else {
      console.error("[Service Worker] No MessageChannel port provided");
    }
  }
});

// --- 4. CAUTIOUS FETCH HANDLER (Network-First for fresh data, offline fallback) ---
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // A. Only handle GET requests
  if (request.method !== "GET") return;

  // B. Never intercept API calls, WebSockets, or third-party auth
  if (
    url.pathname.startsWith("/api") ||
    url.hostname.includes("apilx") ||
    url.pathname.includes("socket.io") ||
    url.protocol.startsWith("ws") ||
    !url.protocol.startsWith("http")
  ) {
    return;
  }

  // C. Navigation requests (HTML pages) - Network first, fall back to cached index.html
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => caches.match("/index.html") || caches.match("/"))
    );
    return;
  }

  // D. Static assets (JS, CSS, Images, Fonts) - Network first, cache fallback
  if (
    url.origin === self.location.origin &&
    (url.pathname.endsWith(".js") ||
      url.pathname.endsWith(".css") ||
      url.pathname.endsWith(".png") ||
      url.pathname.endsWith(".ico") ||
      url.pathname.endsWith(".svg") ||
      url.pathname.endsWith(".woff2"))
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
  }
});

// --- 5. PUSH NOTIFICATION SETUP ---
self.addEventListener("push", (event) => {
  console.log("[Service Worker] 📩 Push received");

  let data = {};
  try {
    data = event.data ? JSON.parse(event.data.text()) : {};
  } catch {
    data = { title: "New Notification", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Optigo Notification";
  const options = {
    body: data.body || "You have a new update in Optigo Central System.",
    icon: data.icon || "/img/icon.png",
    badge: data.badge || "/2.ico",
    data,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// --- 6. NOTIFICATION CLICK ---
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const payload = event.notification.data || {};
  const type = payload?.type || "";
  const group = payload?.group || "";

  const channel = new BroadcastChannel("notification_channel");

  channel.postMessage({
    type: "NOTIFICATION_CLICK",
    payload,
    group,
  });

  channel.close();
});

/**
 * Service worker kept in place for PWA support after the React migration.
 * The cache list now targets SPA-safe assets instead of legacy HTML pages.
 */

const CACHE_VERSION = "v2.0.0";
const CACHE_NAME = `interior-studio-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/pwa.js",
  "/icons/icon-180x180.png",
  "/icons/icon-192x192.png",
  "/icons/icon-192x192-maskable.png",
  "/icons/icon-256x256.png",
  "/icons/icon-512x512.png",
  "/icons/icon-512x512-maskable.png",
  "/icons/shortcut-send-192x192.png",
  "/icons/shortcut-receive-192x192.png",
  "/icons/shortcut-dashboard-192x192.png"
];

const EXTERNAL_ASSETS = [
  "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap",
  "https://fonts.gstatic.com"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll(ASSETS_TO_CACHE).then(() => {
          return Promise.allSettled(EXTERNAL_ASSETS.map((url) => cache.add(url)));
        })
      )
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error("[SW] Installation failed:", error);
      })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith("interior-studio-") && name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return;
  }

  if (url.origin !== self.location.origin && !isWhitelistedOrigin(url.origin)) {
    return;
  }

  event.respondWith(
    staleWhileRevalidate(request).catch(() => {
      return offlineFallback(request);
    })
  );
});

async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (!response || response.status !== 200 || response.type === "error") {
      return response;
    }

    const responseToCache = response.clone();
    caches.open(CACHE_NAME).then((cache) => {
      cache.put(request, responseToCache);
    });

    return response;
  });

  return cachedResponse || fetchPromise;
}

async function offlineFallback(request) {
  if (request.mode === "navigate") {
    const cachedAppShell = await caches.match("/index.html");
    if (cachedAppShell) {
      return cachedAppShell;
    }
  }

  return new Response("Offline", {
    status: 503,
    statusText: "Offline",
    headers: {
      "Content-Type": "text/plain"
    }
  });
}

function isWhitelistedOrigin(origin) {
  const whitelist = [
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com"
  ];

  return whitelist.some((allowed) => origin.includes(allowed));
}

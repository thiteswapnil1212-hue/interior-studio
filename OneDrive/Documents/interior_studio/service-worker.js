/**
 * Service Worker for Interior Studio - Sharp Share
 * 
 * Implements a Stale-While-Revalidate caching strategy:
 * - Serves cached content immediately for instant load times
 * - Fetches fresh content in the background
 * - Perfect for slow connections in Pune and offline scenarios
 * 
 * Cache Versioning:
 * Update CACHE_VERSION when you change assets to bust old caches
 */

const CACHE_VERSION = 'v1.1.0';
const CACHE_NAME = `interior-studio-${CACHE_VERSION}`;

// Assets to cache on install
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/login.html',
  '/signup.html',
  '/services.html',
  '/products.html',
  '/contact.html',
  '/consultation.html',
  '/vendor-dashboard.html',
  '/style.css',
  '/script.js',
  '/auth-bootstrap.js',
  '/auth-login.js',
  '/auth-signup.js',
  '/firebase-init.js',
  '/firebase-config.js',
  '/vendor-dashboard.js',
  '/consultation.js',
  '/receiver.js',
  '/pwa.js',
  '/manifest.json',
  '/icons/icon-180x180.png',
  '/icons/icon-192x192.png',
  '/icons/icon-192x192-maskable.png',
  '/icons/icon-256x256.png',
  '/icons/icon-512x512.png',
  '/icons/icon-512x512-maskable.png',
  '/icons/shortcut-send-192x192.png',
  '/icons/shortcut-receive-192x192.png',
  '/icons/shortcut-dashboard-192x192.png',
];

// External dependencies to cache
const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-storage.js',
];

// ============================================
// Service Worker Lifecycle Events
// ============================================

/**
 * Install Event
 * Cache all critical assets when service worker is installed
 */
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing service worker ${CACHE_VERSION}`);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log(`[SW] Caching assets for ${CACHE_NAME}`);
        // Cache local assets
        return cache.addAll(ASSETS_TO_CACHE)
          .then(() => {
            console.log(`[SW] ✓ Cached ${ASSETS_TO_CACHE.length} local assets`);
            // Try to cache external assets (non-critical)
            return Promise.allSettled(
              EXTERNAL_ASSETS.map(url => cache.add(url))
            );
          })
          .then((results) => {
            const successful = results.filter(r => r.status === 'fulfilled').length;
            console.log(`[SW] ✓ Cached ${successful}/${EXTERNAL_ASSETS.length} external assets`);
            // Skip waiting to activate immediately
            return self.skipWaiting();
          });
      })
      .catch((error) => {
        console.error('[SW] ✗ Installation failed:', error);
      })
  );
});

/**
 * Activate Event
 * Clean up old cache versions
 */
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating service worker`);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('interior-studio-') && name !== CACHE_NAME)
            .map((name) => {
              console.log(`[SW] Deleting old cache: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log(`[SW] ✓ Activated. Ready to serve from cache: ${CACHE_NAME}`);
        return self.clients.claim();
      })
  );
});

// ============================================
// Stale-While-Revalidate Strategy
// ============================================

/**
 * Fetch Event
 * Implements Stale-While-Revalidate pattern:
 * 1. Return cached response immediately if available
 * 2. Fetch from network in background
 * 3. Update cache with new response
 * 4. Fall back to offline page if needed
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests to non-whitelisted domains
  if (url.origin !== self.location.origin && !isWhitelistedOrigin(url.origin)) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Log fetch activity (verbose mode)
  // console.log(`[SW] Fetching: ${url.pathname}`);

  event.respondWith(
    stapleWhileRevalidate(request)
      .catch((error) => {
        console.warn(`[SW] Request failed (${request.url}):`, error.message);
        // Return offline fallback if available
        return offllineFallback();
      })
  );
});

/**
 * Stale-While-Revalidate implementation
 * @param {Request} request - The fetch request
 * @returns {Promise<Response>} The response
 */
async function stapleWhileRevalidate(request) {
  // Try to get from cache first (stale)
  const cachedResponse = await caches.match(request);
  
  // Fetch fresh version in background (revalidate)
  const fetchPromise = fetch(request)
    .then((response) => {
      // Only cache successful responses
      if (!response || response.status !== 200 || response.type === 'error') {
        return response;
      }

      // Clone the response before caching
      const responseToCache = response.clone();
      caches.open(CACHE_NAME)
        .then((cache) => {
          cache.put(request, responseToCache);
        })
        .catch((error) => {
          console.warn(`[SW] Cache update failed for ${request.url}:`, error);
        });

      return response;
    })
    .catch((error) => {
      console.warn(`[SW] Network request failed for ${request.url}:`, error);
      throw error;
    });

  // Return cached version immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

/**
 * Offline fallback
 * @returns {Promise<Response>} Offline fallback response
 */
async function offlineFallback() {
  try {
    const cachedOfflinePage = await caches.match('/index.html');
    if (cachedOfflinePage) {
      return cachedOfflinePage;
    }
  } catch (error) {
    console.error('[SW] Offline fallback failed:', error);
  }

  // Return a basic offline response
  return new Response(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline</title></head>' +
    '<body><h1>You are offline</h1><p>Interior Studio is not available right now. ' +
    'Check your internet connection and try again.</p></body></html>',
    { headers: { 'Content-Type': 'text/html' } }
  );
}

/**
 * Check if an origin is whitelisted for caching
 * @param {string} origin - The origin to check
 * @returns {boolean} True if whitelisted
 */
function isWhitelistedOrigin(origin) {
  const whitelist = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://www.gstatic.com', // Firebase
    'https://firestore.googleapis.com',
    'https://securetoken.googleapis.com',
  ];
  
  return whitelist.some((allowed) => origin.includes(allowed));
}

// ============================================
// Background Sync (Optional)
// ============================================

/**
 * Background sync for future enhancements
 * Allows sync operations even when offline
 * Uncomment to enable:
 * 
 * self.addEventListener('sync', (event) => {
 *   if (event.tag === 'sync-files') {
 *     event.waitUntil(syncOfflineFiles());
 *   }
 * });
 * 
 * async function syncOfflineFiles() {
 *   // Sync pending file operations
 *   console.log('[SW] Syncing offline changes...');
 * }
 */

// ============================================
// Debug Helpers
// ============================================

/**
 * Clear all caches (for debugging)
 * Call: self.clearAllCaches()
 */
self.clearAllCaches = () => {
  caches.keys().then((names) => {
    names.forEach((name) => {
      caches.delete(name);
      console.log(`[SW] Deleted cache: ${name}`);
    });
  });
};

/**
 * List all cached URLs (for debugging)
 * Call: self.listCachedAssets()
 */
self.listCachedAssets = () => {
  caches.open(CACHE_NAME).then((cache) => {
    cache.keys().then((requests) => {
      const urls = requests.map((req) => req.url);
      console.log(`[SW] Cached assets (${urls.length}):`, urls);
    });
  });
};

console.log(`[SW] Service worker script loaded - ${CACHE_VERSION}`);

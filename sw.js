// Agnee 2026 Service Worker: offline caching & network-first updates for festival shell

const CACHE_NAME = 'agnee-2026-v72';
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './festival.css',
  './manifest.webmanifest',
  './offline.html',
  './src/boot.js',
  './assets/logo.webp',
  './src/main.js',
  './src/app.js',
  './src/core/router.js',
  './src/core/store.js',
  './src/core/ics-export.js',
  './src/core/analytics.js',
  './src/core/i18n.js',
  './src/ui/nav.js',
  './src/ui/hero.js',
  './src/ui/about.js',
  './src/ui/events.js',
  './src/ui/schedule.js',
  './src/ui/lineup.js',
  './src/ui/map-section.js',
  './src/ui/sponsors.js',
  './src/ui/gallery.js',
  './src/ui/merch.js',
  './src/ui/team.js',
  './src/ui/faq.js',
  './src/ui/contact.js',
  './src/ui/developers.js',
  './src/ui/particles.js',
  './src/ui/footer.js',
  './src/ui/toast.js',
  './src/ui/social-icons.js',
  './src/ui/scrollbar.js',
  './data/data.js',
  './data/places.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static festival shell v2');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting legacy cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // For data/*.json requests: Stale-While-Revalidate
  if (url.pathname.includes('/data/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // For same-origin assets (HTML, JS, CSS): Network-first with cache fallback
  if (url.origin === location.origin) {
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok && event.request.method === 'GET') {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      }).catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('./offline.html');
          }
        });
      })
    );
    return;
  }

  // External resources (CDN scripts, fonts): Cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok && event.request.method === 'GET') {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      });
    })
  );
});

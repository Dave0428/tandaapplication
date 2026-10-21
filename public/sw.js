
/* TANDA service worker
   Network-first updates, cache fallback when offline.
   Does not intentionally clear saved app data.
*/

var CACHE = 'tanda-v11';

var FILES = [
  './',
  'index.html',
  'css/styles.css',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'icon-512-maskable.png',
  'favicon.ico',
  'favicon-32.png',
  'js/api.js',
  'js/state.js',
  'js/i18n.js',
  'js/tutorials.js',
  'js/voice.js',
  'js/ai.js',
  'js/ai-glue.js',
  'js/ui.js',
  'js/games.js',
  'js/events.js',
  'js/boot.js'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function(cache) {
        return cache.addAll(FILES);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys()
      .then(function(keys) {
        return Promise.all(
          keys
            .filter(function(key) {
              return /^(tanda-v|cache-)/.test(key) &&
                     key !== CACHE;
            })
            .map(function(key) {
              return caches.delete(key);
            })
        );
      })
      .then(function() {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', function(e) {
  var request = e.request;
  var url = new URL(request.url);

  // Only handle same-origin GET requests.
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // Never intercept API requests or APK downloads.
  if (url.pathname.indexOf('/api/') !== -1) return;
  if (url.pathname.toLowerCase().endsWith('.apk')) return;

  e.respondWith(
    fetch(request)
      .then(function(response) {
        if (response && response.ok) {
          var copy = response.clone();

          e.waitUntil(
            caches.open(CACHE)
              .then(function(cache) {
                return cache.put(request, copy);
              })
          );
        }

        return response;
      })
      .catch(function() {
        return caches.match(request)
          .then(function(cached) {
            if (cached) return cached;

            if (request.mode === 'navigate') {
              return caches.match(
                new URL(
                  'index.html',
                  self.registration.scope
                ).href
              );
            }

            return Response.error();
          });
      })
  );
});

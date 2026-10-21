/* TANDA service worker — makes the app open with no internet.
   IMPORTANT when you ship an update: change CACHE below (v2, v3...).
   The browser only replaces old files when this string changes. */
var CACHE = 'tanda-v9';
var FILES = [
  '.', 'index.html', 'css/styles.css', 'manifest.json',
  'icon-192.png', 'icon-512.png', 'icon-512-maskable.png', 'favicon.ico', 'favicon-32.png',
  'js/api.js','js/state.js','js/i18n.js','js/tutorials.js','js/voice.js',
  'js/ai.js','js/ai-glue.js','js/ui.js','js/games.js','js/events.js','js/boot.js'
];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener('fetch', function(e){
  var url = new URL(e.request.url);
  /* never cache the API: progress and AI answers must be live.
     never touch .apk downloads either — a large binary file is exactly
     the kind of request that can fail inside a service worker's fetch
     handling, and the fallback-to-index.html below would then silently
     hand back the app's home screen instead of the file someone is
     trying to download. Let the browser fetch these directly. */
  if(url.pathname.indexOf('/api/') === 0) return;
  if(url.pathname.slice(-4).toLowerCase() === '.apk') return;
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(hit){
      if(hit) return hit;
      return fetch(e.request).then(function(res){
        /* Tutorial pictures are not in the list above because there are
           dozens and the list would have to be kept in step by hand. Instead
           each one is kept the first time it is seen. When the app loads
           from the server this is what lets a picture that was already
           viewed still show with no signal. */
        if(res && res.ok && url.origin === self.location.origin && url.pathname.indexOf('/img/') === 0){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        }
        return res;
      }).catch(function(){ return caches.match('index.html'); });
    })
  );
});

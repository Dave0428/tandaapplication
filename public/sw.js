/* TANDA service worker — makes the app open with no internet.
   IMPORTANT when you ship an update: change CACHE below (v2, v3...).
   The browser only replaces old files when this string changes. */
var CACHE = 'tanda-v4';
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
  /* never cache the API: progress and AI answers must be live */
  if(url.pathname.indexOf('/api/') === 0) return;
  e.respondWith(
    caches.match(e.request).then(function(hit){
      return hit || fetch(e.request).catch(function(){ return caches.match('index.html'); });
    })
  );
});

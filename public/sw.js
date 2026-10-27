/* TANDA service worker - keeps the app opening with no internet, WITHOUT
   getting stuck on old files.

   The first version served whatever it had saved and never asked the server
   again, so an update only appeared after the CACHE name was changed and the
   app had been opened twice - which in practice meant clearing the app's
   data. The server also tells browsers to keep files for an hour, so even a
   fresh download could be an old copy.

   Now the files that make up the app (pages, scripts, styles) are asked for
   from the server first, bypassing the browser's own copy. The saved copy is
   used only when the server does not answer within a few seconds, or not at
   all. That gives both things this app needs: a new commit shows up the next
   time the app opens with a signal, and with no signal it still opens. */

var CACHE = 'tanda-v16';
var WAIT_MS = 3000;   /* how long to wait for the server before using the saved copy */
var FILES = [
  '.', 'index.html', 'css/styles.css', 'manifest.json',
  'icon-192.png', 'icon-512.png', 'icon-512-maskable.png', 'favicon.ico', 'favicon-32.png',
  'js/api.js','js/state.js','js/i18n.js','js/tutorials.js','js/voice.js',
  'js/ai.js','js/ai-glue.js','js/ui.js','js/games.js','js/events.js','js/boot.js'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      /* One file at a time and straight from the server. addAll() gives up
         entirely if a single file is missing, and uses the browser's saved
         copy, which is how stale files were getting into a new cache. */
      return Promise.all(FILES.map(function(f){
        return fetch(new Request(f, {cache:'reload'})).then(function(res){
          if(res && res.ok) return c.put(f, res);
        }).catch(function(){});
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

function remember(req, res){
  var copy = res.clone();
  caches.open(CACHE).then(function(c){ c.put(req, copy); });
}

/* Pages, scripts, styles: the server first, the saved copy as the fallback. */
function serverFirst(req){
  return new Promise(function(resolve){
    var done = false;
    function give(r){ if(!done){ done = true; resolve(r); } }

    /* Slow server - a sleeping free-tier host can take most of a minute -
       so after a few seconds the saved copy is shown while the fresh one
       keeps downloading and is kept for next time. */
    var timer = setTimeout(function(){
      caches.match(req).then(function(hit){ if(hit) give(hit); });
    }, WAIT_MS);

    fetch(req, {cache:'no-cache'}).then(function(res){
      clearTimeout(timer);
      if(res && res.ok){ remember(req, res); give(res); return; }
      /* The server answered with an error page (502 while waking, say).
         A saved copy is better than showing that. */
      caches.match(req).then(function(hit){ give(hit || res); });
    }).catch(function(){
      clearTimeout(timer);
      caches.match(req).then(function(hit){
        if(hit) give(hit);
        else caches.match('index.html').then(give);
      });
    });
  });
}

/* Tutorial pictures: shown straight from the saved copy, refreshed quietly
   in the background so a replaced picture does not stay old forever. */
function pictureSaved(req){
  return caches.match(req).then(function(hit){
    var fresh = fetch(req).then(function(res){
      if(res && res.ok) remember(req, res);
      return res;
    }).catch(function(){ return null; });
    if(hit) return hit;
    return fresh.then(function(res){ return res || caches.match('index.html'); });
  });
}

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;
  var url = new URL(req.url);

  /* Not ours to cache: other sites, the live API, and large downloads.
     Progress and AI answers must be current, and an .apk is exactly the
     kind of request that can fail inside a service worker and then be
     answered with the home page instead of the file. */
  if(url.origin !== self.location.origin) return;
  if(url.pathname.indexOf('/api/') === 0) return;
  if(url.pathname.slice(-4).toLowerCase() === '.apk') return;

  if(url.pathname.indexOf('/img/') === 0){
    e.respondWith(pictureSaved(req));
    return;
  }

  var isApp = req.mode === 'navigate' || /\.(html|js|css|json)$/i.test(url.pathname) || url.pathname === '/';
  if(isApp){
    e.respondWith(serverFirst(req));
    return;
  }

  /* Icons and anything else: saved copy if there is one. */
  e.respondWith(
    caches.match(req).then(function(hit){
      return hit || fetch(req).catch(function(){ return caches.match('index.html'); });
    })
  );
});

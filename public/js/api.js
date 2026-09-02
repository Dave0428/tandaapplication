/* ================= TANDA — server client =================
   Talks to the Node server in /server. If there is no server (for example the
   file is opened straight from disk, or published as a Claude artifact), every
   call fails quietly and the app keeps working from localStorage alone.
   ========================================================= */
window.TandaAPI = (function(){

  /* Where the API lives. Same origin when the server also serves the page,
     which is what `npm start` does. Point this at your deployed URL if you
     host the frontend somewhere else (Netlify, GitHub Pages...). */
  var BASE = (window.TANDA_API_BASE || '') + '/api';

  var TOKEN_KEY = 'tanda.token';
  var token = null;
  try{ token = localStorage.getItem(TOKEN_KEY); }catch(e){}

  var serverUp = null;        /* null unknown, true/false once checked */
  var serverHasAI = false;
  var lastSyncAt = '';
  var syncTimer = null;

  function req(path, opts){
    opts = opts || {};
    var headers = {'Content-Type':'application/json'};
    if(token) headers['Authorization'] = 'Bearer ' + token;
    return fetch(BASE + path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function(r){
      return r.json().catch(function(){ return {}; }).then(function(data){
        if(!r.ok){
          var err = new Error(data.error || ('HTTP ' + r.status));
          err.status = r.status;
          err.msgKey = data.msgKey;      /* the server names the i18n string to show */
          throw err;
        }
        return data;
      });
    });
  }

  /* ---- health ---- */
  function checkServer(){
    return req('/health').then(function(d){
      serverUp = true; serverHasAI = !!d.ai;
      return d;
    }).catch(function(){ serverUp = false; return null; });
  }

  /* ---- auth ---- */
  function register(name, email, password){
    return req('/auth/register', {method:'POST', body:{name:name, email:email, password:password}})
      .then(keep);
  }
  function login(email, password){
    return req('/auth/login', {method:'POST', body:{email:email, password:password}}).then(keep);
  }
  function keep(res){
    token = res.token;
    try{ localStorage.setItem(TOKEN_KEY, token); }catch(e){}
    return res;
  }
  function signOut(){
    token = null;
    try{ localStorage.removeItem(TOKEN_KEY); }catch(e){}
  }
  function signedIn(){ return !!token; }

  /* ---- progress ---- */
  /* The phone is the source of truth while offline; the server keeps the
     newest copy so a different phone can pick it up. Merge rule: a tutorial
     marked done anywhere stays done, and the higher streak wins. */
  function mergeInto(local, remote){
    if(!remote) return local;
    remote.done = remote.done || {};
    for(var k in remote.done) if(remote.done[k]) local.done[k] = true;
    local.streak = Math.max(local.streak || 0, remote.streak || 0);
    local.plays  = Math.max(local.plays  || 0, remote.plays  || 0);
    if(remote.lang && !local.lang) local.lang = remote.lang;
    return local;
  }
  function pull(){
    if(!signedIn()) return Promise.resolve(null);
    return req('/progress');
  }
  function push(data){
    if(!signedIn()) return Promise.resolve(null);
    return req('/progress', {method:'PUT', body:{
      name: data.name, lang: data.lang, streak: data.streak,
      plays: data.plays, done: data.done, settings: {scale:data.scale, rate:data.rate, theme:data.theme}
    }}).then(function(r){
      lastSyncAt = new Date().toLocaleTimeString();
      return r;
    }).catch(function(){ return null; });
  }
  /* Called on every save(). Batched: one request 2s after the last change,
     so tapping through a game does not fire twenty writes. */
  function scheduleSync(data){
    if(!signedIn()) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(function(){ push(data); }, 2000);
  }
  function recordGame(game, score, meta){
    if(!signedIn()) return Promise.resolve(null);
    return req('/games', {method:'POST', body:{game:game, score:score, meta:meta||{}}}).catch(function(){ return null; });
  }

  return {
    base: BASE,
    checkServer: checkServer,
    isUp: function(){ return serverUp === true; },
    hasAI: function(){ return serverHasAI; },
    register: register, login: login, signOut: signOut, signedIn: signedIn,
    pull: pull, push: push, scheduleSync: scheduleSync, mergeInto: mergeInto,
    recordGame: recordGame,
    lastSync: function(){ return lastSyncAt; },
    token: function(){ return token; }
  };
})();

/* ================= TANDA — boot =================
   Loaded last. Every other file has already defined its globals by now.
   ================================================ */
(function(){

  /* 1. paint immediately from localStorage — never wait for the network */
  render();

  /* 2. work out which AI engine (if any) we have, then re-check the buttons */
  TandaAI.init().then(function(){
    refreshAiBits();
  });

  /* 3. if the phone is signed in, pull the account copy of the progress and
        merge it with what is on this phone */
  if(TandaAPI.signedIn()){
    TandaAPI.pull().then(function(remote){
      if(!remote) return;
      S.data.account = remote.user || S.data.account;
      TandaAPI.mergeInto(S.data, remote);
      save();
      render();
    }).catch(function(){
      /* offline or token expired — the app keeps running on local data */
    });
  }

  /* 4. offline support. The service worker only registers over http(s),
        never for a file:// page, so opening index.html directly still works. */
  if('serviceWorker' in navigator && location.protocol.indexOf('http') === 0){
    navigator.serviceWorker.register('sw.js').catch(function(){});
  }

  /* 5. keep-alive heartbeat. Render's free tier sleeps a service after ~15
        minutes with no traffic, and waking it up wipes the SQLite file —
        so it is not just slow, accounts actually disappear. A small ping
        every 8 minutes, as long as this tab/app stays open, keeps the
        server from ever going quiet long enough to sleep. Harmless no-op
        if TandaAPI never resolves an address (e.g. running as a plain
        local file) — checkServer() already fails silently in that case. */
  if(window.TandaAPI && TandaAPI.checkServer){
    setInterval(function(){ TandaAPI.checkServer(); }, 8 * 60 * 1000);
  }

  /* 6. the Android hardware/gesture back button. Capacitor's default
        behaviour, with no listener, is to exit the whole app the moment
        there is no WebView navigation history — and since this app never
        pushes browser history (it manages its own S.screen instead), that
        is every single press. Send it to the app's own "back" first, and
        only actually exit once someone is already at Home. */
  if(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App){
    window.Capacitor.Plugins.App.addListener('backButton', function(){
      if(S.modal){ S.modal = null; stopSpeak(); render(); return; }
      if(S.screen === 'tutorial'){ stopSpeak(); S.screen = 'learn'; render(); return; }
      if(S.screen === 'game'){ stopSpeak(); S.screen = 'games'; S.game = null; render(); return; }
      if(S.screen === 'account'){ S.screen = S.data.name ? 'me' : 'home'; render(); return; }
      if(S.screen !== 'home'){ S.screen = 'home'; render(); return; }
      window.Capacitor.Plugins.App.exitApp();
    });
  }
})();
   


/* ================= TANDA — boot =================
   Loaded last. Every other file has already defined its globals by now.
   ================================================ */
(function(){

  /* 1. Paint immediately from localStorage */
  render();

  /* Greeting and daily reminder */
  if(S.data.name){
    setTimeout(greetOnce, 1200);
  }

  setTimeout(scheduleDailyNudge, 2500);

  /* 2. Initialize AI */
  TandaAI.init().then(function(){
    refreshAiBits();
  }).catch(function(error){
    console.error('TANDA AI initialization failed:', error);
  });

  /* 3. Sync account progress */
  if(TandaAPI.signedIn()){
    TandaAPI.pull().then(function(remote){
      if(!remote) return;

      S.data.account = remote.user || S.data.account;
      TandaAPI.mergeInto(S.data, remote);
      save();
      render();

    }).catch(function(){
      /* Offline or expired token.
         The app continues using local data. */
    });
  }

  /* 4. Offline support and Service Worker updates */
  if(
    'serviceWorker' in navigator &&
    location.protocol.indexOf('http') === 0
  ){
    navigator.serviceWorker.register('./sw.js', {
      updateViaCache: 'none'
    })
    .then(function(registration){

      /* Check for a newer Service Worker */
      return registration.update().then(function(){
        return registration;
      });

    })
    .then(function(registration){

      /* Check again when the app returns to the foreground */
      document.addEventListener('visibilitychange', function(){
        if(document.visibilityState === 'visible'){
          registration.update().catch(function(error){
            console.error(
              'TANDA Service Worker update check failed:',
              error
            );
          });
        }
      });

    })
    .catch(function(error){
      console.error(
        'TANDA Service Worker registration failed:',
        error
      );
    });
  }

  /* 5. Keep-alive heartbeat */
  if(window.TandaAPI && TandaAPI.checkServer){
    setInterval(function(){
      TandaAPI.checkServer();
    }, 8 * 60 * 1000);
  }

  /* 6. Android hardware/gesture back button */
  if(
    window.Capacitor &&
    window.Capacitor.Plugins &&
    window.Capacitor.Plugins.App
  ){
    window.Capacitor.Plugins.App.addListener(
      'backButton',
      function(){

        if(S.modal){
          S.modal = null;
          stopSpeak();
          render();
          return;
        }

        if(S.screen === 'tutorial'){
          stopSpeak();
          S.screen = 'learn';
          render();
          return;
        }

        if(S.screen === 'game'){
          stopSpeak();
          S.screen = 'games';
          S.game = null;
          render();
          return;
        }

        if(S.screen === 'account'){
          S.screen = S.data.name ? 'me' : 'home';
          render();
          return;
        }

        if(S.screen !== 'home'){
          S.screen = 'home';
          render();
          return;
        }

        window.Capacitor.Plugins.App.exitApp();
      }
    );
  }

})();

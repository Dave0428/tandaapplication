/* ================= TANDA — boot =================
   Loaded last. Every other file has already defined its globals by now.
   ================================================ */
(function(){

  /* 1. paint immediately from localStorage — never wait for the network */
  render();

  /* The greeting waits a moment so the voice engine has loaded and so it
     does not talk over the app still drawing itself. */
  if(S.data.name){ setTimeout(greetOnce, 1200); }
  setTimeout(scheduleDailyNudge, 2500);

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

/* ---------- the daily nudge ----------
   One notification a morning. This is the single strongest thing an app can
   do to bring someone back, and for an older user living alone it doubles as
   a small piece of company. The time is early enough to catch the part of
   the day when they are most alert, and there is only ever one - an app that
   pesters gets uninstalled.

   Scheduling is repeated on every launch because Android drops pending
   notifications when the phone restarts. Re-using the same id means it
   replaces the old one rather than stacking up. */
function scheduleDailyNudge(){
  var LN = null;
  try{
    if(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications){
      LN = window.Capacitor.Plugins.LocalNotifications;
    }
  }catch(e){}
  if(!LN) return;

  LN.requestPermissions().then(function(res){
    if(res && res.display !== 'granted') return;
    return LN.schedule({
      notifications: [{
        id: 1,
        title: t('nudgeT', {n: S.data.name || t('friend')}),
        body: t('nudgeB'),
        schedule: { on: { hour: 9, minute: 0 }, allowWhileIdle: true },
        smallIcon: 'ic_stat_icon_config_sample'
      }]
    });
  }).catch(function(){});
}

/* ---------- greeting ----------
   Said out loud the first time the app is opened each day, and only then.
   Hearing your own name is what makes a screen feel less like a machine;
   hearing it every time you tap Home would be irritating. */
var greetedOn = null;
function greetOnce(){
  var today = new Date().toDateString();
  if(greetedOn === today) return;
  greetedOn = today;
  var h = new Date().getHours();
  var part = h < 11 ? 'greetMorning' : (h < 18 ? 'greetNoon' : 'greetEve');
  var line = t(part, {n: S.data.name || t('friend')});
  if(S.data.streak > 1) line += ' ' + t('greetStreak', {n: S.data.streak});
  try{ warmUp(); speakOne(line); }catch(e){}
}

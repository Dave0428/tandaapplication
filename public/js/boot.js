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
})();

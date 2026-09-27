/* ================= EVENTS ================= */
shell.addEventListener('click', function(ev){
  warmUp();
  var el = ev.target.closest('[data-act]');
  if(!el) return;
  var a = el.dataset.act, arg = el.dataset.arg;

  if(a === 'go'){ stopSpeak(); S.modal=null; S.screen = arg; if(arg!=='game') S.game=null; render(); return; }
  if(a === 'lang'){ S.data.lang = arg; save(); stopSpeak(); if(S.game==='word'||S.game==='trivia') S.g={}; render(); return; }
  if(a === 'setname'){
    var v = (document.getElementById('nameIn')||{}).value || '';
    S.data.name = v.trim() || t('friend');
    /* The walkthrough runs once, right after the name. Anyone who has
       already seen it goes straight home. */
    if(!S.data.tourDone){ S.tour = 0; S.screen = 'tour'; }
    save(); render();
    if(S.screen === 'tour') speakTourCard();
    return;
  }
  if(a === 'savename'){
    var v2 = (document.getElementById('nameEdit')||{}).value || '';
    S.data.name = v2.trim() || t('friend'); save(); render(); return;
  }
  if(a === 'theme'){ S.data.theme = S.data.theme === 'dark' ? 'light' : 'dark'; save(); applyPrefs(); render(); return; }
  if(a === 'testvoice'){ setTimeout(updateVoiceUi, 2600); speakOne(S.data.lang==='tl' ? 'Kumusta '+(S.data.name||'kaibigan')+'. Ganito ang bilis ng boses ko.' : 'Hello '+(S.data.name||'friend')+'. This is how fast I will read to you.'); return; }
  if(a === 'cat'){ S.cat = arg; render(); return; }
  if(a === 'tut'){ stopSpeak(); S.tutorial = arg; S.screen='tutorial'; render(); return; }
  if(a === 'markdone'){
    S.data.done[S.tutorial] = !S.data.done[S.tutorial]; save(); render(); return;
  }
  if(a === 'say'){
    var x = tutById(S.tutorial); speakOne(L(x.steps[Number(arg)])); return;
  }
  if(a === 'readall'){
    var xx = tutById(S.tutorial);
    var b = document.getElementById('readAllBtn');
    if(b && b.textContent.indexOf('⏹') === 0){ stopSpeak(); return; }
    var items = [{t:L(xx.title), s:null}];
    xx.steps.forEach(function(st, i){ items.push({t:(i+1)+'. '+L(st), s:i}); });
    items.push({t:t('tipL')+'. '+L(xx.tip), s:null});
    readAll(items);
    return;
  }
  if(a === 'stopspeak'){ stopSpeak(); return; }
  if(a === 'authmode'){ authMode = authMode === 'login' ? 'register' : 'login'; authErr = ''; render(); return; }
  if(a === 'togglepass'){
    var pf = document.getElementById('auPass');
    if(pf){ pf.type = pf.type === 'password' ? 'text' : 'password'; el.textContent = pf.type === 'password' ? t('showPass') : t('hidePass'); }
    return;
  }
  if(a === 'signout'){ TandaAPI.signOut(); S.data.account = null; save(); S.screen = 'me'; render(); return; }
  if(a === 'authgo'){
    var email = (document.getElementById('auEmail')||{}).value || '';
    var pass  = (document.getElementById('auPass')||{}).value || '';
    var nm    = (document.getElementById('auName')||{}).value || S.data.name || '';
    authErr = '';
    el.disabled = true;
    var originalLabel = el.textContent;
    el.textContent = t('pleaseWait');

    // The free server can be asleep and take up to ~60s to wake on the
    // first request. Without this, that wait looks exactly like a dead
    // button. Give it real time, but not forever.
    var timedOut = false;
    var timeoutId = setTimeout(function(){
      timedOut = true;
      authErr = t('stillWaiting');
      el.disabled = false;
      el.textContent = originalLabel;
      render();
    }, 75000);

    var p = authMode === 'register' ? TandaAPI.register(nm, email, pass) : TandaAPI.login(email, pass);
    p.then(function(res){
      if(timedOut) return;   // the timeout already redrew the screen; don't fight it
      clearTimeout(timeoutId);
      S.data.account = res.user;
      if(res.user.name && !S.data.name) S.data.name = res.user.name;
      if(res.progress) TandaAPI.mergeInto(S.data, res.progress);
      save();
      S.screen = S.data.name ? 'me' : 'home';
      render();
    }).catch(function(e){
      if(timedOut) return;
      clearTimeout(timeoutId);
      authErr = t(e && e.msgKey ? e.msgKey : 'serverBad', {base: TandaAPI.base}) + '\n[' + TandaAPI.base + ']';
      render();
    });
    return;
  }
  if(a === 'grantbright'){
    var TSg = tandaSys();
    if(TSg && TSg.requestWriteSettings) TSg.requestWriteSettings().catch(function(){});
    return;
  }
  if(a === 'tournext'){
    stopSpeak();
    S.tour = (S.tour || 0) + 1;
    if(S.tour >= TOUR.length){
      S.data.tourDone = true; save();
      S.screen = 'home'; S.tour = 0; render(); return;
    }
    render(); speakTourCard(); return;
  }
  if(a === 'tourprev'){
    stopSpeak();
    S.tour = Math.max(0, (S.tour || 0) - 1);
    render(); speakTourCard(); return;
  }
  if(a === 'toursay'){ stopSpeak(); speakTourCard(true); return; }
  if(a === 'tourskip'){
    stopSpeak();
    S.data.tourDone = true; save();
    S.screen = 'home'; S.tour = 0; render(); return;
  }
  if(a === 'tourstart'){
    stopSpeak();
    S.tour = 0; S.screen = 'tour'; render(); speakTourCard(); return;
  }
  if(a === 'voicecheck'){ warmUp(); runVoiceCheck(); return; }
  if(a === 'bigread'){ S.bigStep = 0; bigReader(); return; }
  if(a === 'bignext'){
    var bx = tutById(S.tutorial);
    if(S.bigStep >= bx.steps.length - 1){ S.modal = null; render(); return; }
    S.bigStep++; bigReader(); return;
  }
  if(a === 'bigprev'){ if(S.bigStep > 0){ S.bigStep--; bigReader(); } return; }
  if(a === 'bigsay'){ var bx2 = tutById(S.tutorial); speakOne(L(bx2.steps[S.bigStep])); return; }
  if(a === 'bigclose'){ S.modal = null; stopSpeak(); render(); return; }
  if(a === 'sayblob'){ var o = document.getElementById('aiOut'); if(o && o.dataset.text) speakOne(o.dataset.text); return; }
  if(a === 'sayai'){ var m = chat[Number(arg)]; if(m) speakOne(m.text); return; }
  if(a === 'sayq'){ var qq = S.g.qs[S.g.i]; if(qq) speakOne(qq.q + '. ' + qq.o.join('. ')); return; }
  if(a === 'simpler'){ tutorialAi('simpler'); return; }
  if(a === 'askabout'){ tutorialAi('questions'); return; }
  if(a === 'mic'){
    if(!sttSupported()) return;
    var micBtn = el;
    if(isListening()){ stopListening(); return; }
    var ta = document.getElementById('askIn');
    var basePrefix = ta && ta.value ? ta.value + ' ' : '';
    micBtn.textContent = '\u23FA\uFE0F';

    // Short phrases sometimes get echoed twice by Android's own speech
    // engine before it settles ("check" -> "check check") - a quirk of the
    // recognizer, not of this app. Collapse an exact A-A repeat.
    function dedupeRepeat(text){
      var words = String(text).trim().split(/\s+/);
      var n = words.length;
      if(n >= 2 && n % 2 === 0){
        var half = n / 2;
        var a1 = words.slice(0, half).join(' ').toLowerCase();
        var a2 = words.slice(half).join(' ').toLowerCase();
        if(a1 === a2) return words.slice(0, half).join(' ');
      }
      return text;
    }

    startListening(function(liveText){
      var said = dedupeRepeat(liveText);

      /* Spoken commands are handled here rather than sent to the AI. Asking
         the model to open Messenger would cost a round trip and a wait, and
         it would still only be able to answer in words. A command that the
         phone can simply carry out should be carried out. */
      if(runVoiceCommand(said)) return;

      var box = document.getElementById('askIn') || ta;
      if(box){
        box.value = basePrefix + said;
        try{ box.dispatchEvent(new Event('input', {bubbles:true})); }catch(e){}
      }
      /* Anything that is not a command is a question, so send it without
         making the person find the arrow afterwards. */
      if(box){ var q = box.value; box.value = ''; askedByVoice = true; sendAsk(q); }
    }, function(){
      var mb = document.querySelector('[data-act="mic"]') || micBtn;
      if(mb) mb.textContent = '\uD83C\uDFA4';
    });
    return;
  }

  if(a === 'send'){ var ta = document.getElementById('askIn'); var txt = ta ? ta.value : ''; if(ta) ta.value=''; sendAsk(txt); return; }
  if(a === 'chip'){ sendAsk(t('suggest'+arg)); return; }

  if(a === 'game'){ S.game = arg; S.g = {}; S.screen='game'; S.modal=null;
    if(arg==='match') initMatch(); if(arg==='puzzle') initPuzzle(); if(arg==='word') initWord(); if(arg==='math') initMath(); if(arg==='blocks') initBlocks();
    render(); if(arg==='trivia') startTrivia(); return; }
  if(a === 'usefallback'){
    var flb = (FALLBACK_Q[S.data.lang] || FALLBACK_Q.en);
    S.g = {qs: flb, i:0, score:0, picked:null};
    render();
    return;
  }
  if(a === 'replay'){ S.modal=null;
    if(S.game==='match') initMatch(); else if(S.game==='puzzle') initPuzzle(); else if(S.game==='word') initWord(); else if(S.game==='blocks') initBlocks();
    else if(S.game==='math') initMath(); else if(S.game==='trivia'){ startTrivia(); return; }
    render(); return; }
  if(a === 'bleft'){ blockMove(-1); return; }
  if(a === 'bright'){ blockMove(1); return; }
  if(a === 'brot'){ blockRotate(); return; }
  if(a === 'bdown'){ blockSlam(); return; }
  if(a === 'flip'){ flip(Number(arg)); return; }
  if(a === 'slide'){ slide(Number(arg)); return; }
  if(a === 'pick'){
    var p = S.g.pool[Number(arg)];
    if(!p || p.used) return;
    if(S.g.answer.length >= S.g.word.length) return;
    p.used = true; S.g.answer.push(p); S.g.wrong=false; render(); return;
  }
  if(a === 'unpick'){
    var idx = Number(arg); var it = S.g.answer[idx];
    if(!it) return; it.used = false; S.g.answer.splice(idx,1); S.g.wrong=false; render(); return;
  }
  if(a === 'clearword'){ S.g.answer.forEach(function(p){p.used=false;}); S.g.answer=[]; S.g.wrong=false; render(); return; }
  if(a === 'checkword'){
    var guess = S.g.answer.map(function(p){return p.c;}).join('');
    if(guess === S.g.word){ winModal(S.g.word + ' ✓'); }
    else { S.g.wrong = true; soundWrong(); render(); }
    return;
  }
  if(a === 'math'){
    if(S.g.over || S.g.q.picked !== null) return;
    S.g.q.picked = Number(arg);
    if(Number(arg) === S.g.q.ans){
      S.g.score++; S.g.streak++;
      soundRight();
      /* Every few right answers the numbers get bigger. The level-up tone
         is what tells the player it got harder, so a sudden difficult sum
         does not feel like the app misbehaving. */
      if(S.g.streak >= MATH_LEVEL_EVERY){ S.g.streak = 0; S.g.level++; soundLevel(); }
    }else{
      S.g.lives--;
      soundWrong();
    }
    render(); return;
  }
  if(a === 'nextmath'){
    S.g.n++;
    if(S.g.lives <= 0){ mathOver(); return; }
    nextMath(); render(); return;
  }
  if(a === 'triv'){
    if(S.g.picked !== null) return;
    S.g.picked = Number(arg);
    if(Number(arg) === Number(S.g.qs[S.g.i].a)){ S.g.score++; soundRight(); } else { soundWrong(); }
    render(); return;
  }
  if(a === 'nexttriv'){
    S.g.i++; S.g.picked = null;
    // The quiz has its own end screen instead of the shared winModal, so
    // recording the finished round happens right here — once, guarded by
    // a flag, the moment the last question is passed.
    if(S.g.i >= S.g.qs.length && !S.g.recorded){
      S.g.recorded = true;
      S.data.plays = (S.data.plays||0)+1; save();
      if(window.TandaAPI) TandaAPI.recordGame('trivia', S.g.score, {total: S.g.qs.length});
    }
    render(); return;
  }
});
shell.addEventListener('input', function(ev){
  var el = ev.target.closest('[data-act]');
  if(!el) return;
  if(el.dataset.act === 'scale'){ S.data.scale = Number(el.value); save(); applyPrefs(); return; }
  if(el.dataset.act === 'rate'){ S.data.rate = Number(el.value); save(); return; }
});
shell.addEventListener('keydown', function(ev){
  if(ev.target.id === 'askIn' && ev.key === 'Enter' && !ev.shiftKey){
    ev.preventDefault();
    var ta = ev.target; var txt = ta.value; ta.value=''; sendAsk(txt);
  }
  if(ev.target.id === 'nameIn' && ev.key === 'Enter'){
    ev.preventDefault();
    S.data.name = (ev.target.value||'').trim() || t('friend'); save(); render();
  }
});
window.addEventListener('beforeunload', function(){ try{ window.speechSynthesis.cancel(); }catch(e){} });

/* ---------- account screen ---------- */
var authMode = 'login';   /* or 'register' */
var authErr = '';
function viewAccount(){
  var a = S.data.account;
  if(a){
    return '<div class="scroll">' + head(t('accountT'), 'me')
      + '<div class="pad"><div class="card">'
      + '<p class="muted" style="margin:0 0 4px">' + esc(t('signedInAs')) + '</p>'
      + '<h4 style="font-family:\'Baloo 2\';margin:0 0 10px;font-size:1.1rem">' + esc(a.email) + '</h4>'
      + '<p class="muted" style="margin:0">' + esc(t('syncOn')) + '</p>'
      + (TandaAPI.lastSync() ? '<p class="muted" style="margin:6px 0 0">' + esc(t('lastSync')) + ': ' + esc(TandaAPI.lastSync()) + '</p>' : '')
      + '</div>'
      + '<button class="btn ghost" data-act="signout">' + esc(t('signOut')) + '</button></div></div>' + nav('me');
  }
  var reg = authMode === 'register';
  return '<div class="scroll">' + head(reg ? t('createAcc') : t('signIn'), S.data.name ? 'me' : 'home')
    + '<div class="pad">'
    + (reg ? '<label class="f">' + esc(t('yourName')) + '</label><input class="t" id="auName" style="margin-bottom:12px">' : '')
    + '<label class="f">' + esc(t('email')) + '</label>'
    + '<input class="t" id="auEmail" type="email" autocomplete="email" inputmode="email" autocapitalize="none" autocorrect="off" spellcheck="false" style="margin-bottom:12px">'
    + '<label class="f">' + esc(t('password')) + '</label>'
    + '<div style="position:relative;margin-bottom:2px">'
    + '<input class="t" id="auPass" type="password" autocomplete="' + (reg ? 'new-password' : 'current-password') + '" autocapitalize="none" autocorrect="off" spellcheck="false" style="padding-right:52px">'
    + '<button type="button" data-act="togglepass" style="position:absolute;right:6px;top:50%;transform:translateY(-50%);background:none;border:none;padding:10px;cursor:pointer;color:var(--ink-soft)">' + esc(t('showPass')) + '</button>'
    + '</div>'
    + (authErr ? '<p style="color:var(--terracotta);font-weight:700;margin:12px 0 0">' + esc(authErr) + '</p>' : '')
    + '<button class="btn" style="margin-top:16px" data-act="authgo">' + esc(reg ? t('createAcc') : t('signIn')) + '</button>'
    + '<p class="center" style="margin-top:14px"><button class="btn small ghost" data-act="authmode">'
      + esc(reg ? t('haveAcc') : t('createAcc')) + '</button></p>'
    + '<p class="center" style="margin-top:6px"><button class="btn small ghost" data-act="go" data-arg="' + (S.data.name ? 'me' : 'home') + '">'
      + esc(t('offlineOk')) + '</button></p>'
    + '</div></div>' + nav('me');
}

/* ---------- voice diagnostic ---------- */
function runVoiceCheck(){
  var out = document.getElementById('vcOut');
  if(!out) return;
  loadVoices();
  var info = [];
  info.push('speechSynthesis present: ' + (ttsSupported() ? 'yes' : 'NO'));
  info.push('voices found: ' + VOICES.length);
  info.push('voice names: ' + (VOICES.slice(0,4).map(function(v){ return v.name + ' [' + v.lang + ']'; }).join(' | ') || 'none'));
  info.push('running inside a frame: ' + (window.top !== window.self ? 'yes' : 'no'));
  info.push('page address: ' + location.origin);
  var events = [];
  function show(){
    out.innerHTML = '<div class="card"><p style="margin:0;font-size:.8rem;line-height:1.7;word-break:break-word">'
      + esc(info.join('\n') + '\nevents: ' + (events.join(', ') || 'waiting…')).replace(/\n/g,'<br>')
      + '</p></div>';
  }
  show();
  if(!ttsSupported()) return;
  var phrase = S.data.lang === 'tl' ? 'Isa, dalawa, tatlo. Naririnig mo ba ako?' : 'One, two, three. Can you hear me?';
  try{
    var u = new SpeechSynthesisUtterance(phrase);
    var v = pickVoice();
    if(v){ u.voice = v; u.lang = v.lang; }
    u.rate = Number(S.data.rate) || .85;
    u.onstart = function(){ events.push('start'); show(); };
    u.onend   = function(){ events.push('end'); show(); };
    u.onerror = function(e){ events.push('error:' + ((e && e.error) || '?')); show(); };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setTimeout(function(){
      if(!events.length){ events.push('no events after 3s — the utterance was dropped silently'); show(); }
    }, 3000);
  }catch(err){ events.push('threw: ' + (err && err.message)); show(); }
}

/* ---------- big text reader (works with no voice at all) ---------- */
function bigReader(){
  var x = tutById(S.tutorial);
  if(!x) return;
  var i = S.bigStep || 0;
  var total = x.steps.length;
  S.modal = '<div class="backdrop"><div class="modal" style="max-width:400px;text-align:left">'
    + '<p class="muted" style="margin:0 0 6px">' + (i+1) + ' / ' + total + '</p>'
    + '<p style="font-size:1.5rem;line-height:1.5;margin:0 0 20px;font-weight:700">' + esc(L(x.steps[i])) + '</p>'
    + '<div class="row">'
      + '<button class="btn ghost" data-act="bigprev"' + (i===0?' disabled':'') + '>' + esc(t('prev')) + '</button>'
      + '<button class="btn" data-act="bignext">' + (i===total-1 ? esc(t('close')) : esc(t('next'))) + '</button>'
    + '</div>'
    + '<div style="height:9px"></div>'
    + '<button class="btn small ghost" data-act="bigsay">\uD83D\uDD0A</button> '
    + '<button class="btn small ghost" data-act="bigclose">' + esc(t('close')) + '</button>'
    + '</div></div>';
  render();
}

      

/* ---------- spoken commands ----------
   A short list of things the phone can just do, checked before anything is
   sent to the AI. Matching is deliberately loose: an older speaker rarely
   says the exact phrase, and the recognizer mishears besides, so any
   sentence that mentions opening and names an app counts.

   Returns true when it handled the words, which tells the caller to stop.
   Every command speaks a short confirmation first, because the app is about
   to disappear from the screen and silence would look like a crash. */
/* ---------- what TANDA can open and change ----------
   Apps are opened by package name, which is what Android actually uses. A
   URL scheme is a courtesy some apps offer and many do not; a package name
   every app has.

   Each entry lists several packages because the same app ships under
   different names on different phones - the dialer and the camera especially
   - and the first one present wins. */
var VOICE_APPS = [
  {pkgs:['com.facebook.orca'], web:'https://www.messenger.com', key:'appMsg',
   words:['messenger','mesenger','masinger','mesinger','mesencher']},
  {pkgs:['com.facebook.katana','com.facebook.lite'], web:'https://www.facebook.com', key:'appFB',
   words:['facebook','fb','feysbuk','peysbuk','fesbuk']},
  {pkgs:['com.google.android.youtube'], web:'https://www.youtube.com', key:'appYT',
   words:['youtube','you tube','yutub','yutyub','yutyob']},
  {pkgs:['com.globe.gcash.android'], key:'appGCash',
   words:['gcash','g cash','jicash','gikash']},
  {pkgs:['com.viber.voip'], key:'appViber', words:['viber','vayber','bayber']},
  {pkgs:['com.whatsapp'], key:'appWA', words:['whatsapp','watsap','wasap']},
  {pkgs:['com.google.android.gm'], key:'appGmail', words:['gmail','email','imeyl']},
  {pkgs:['com.google.android.apps.maps'], key:'appMaps', words:['maps','google maps','mapa']},
  {pkgs:['com.zhiliaoapp.musically'], web:'https://www.tiktok.com', key:'appTikTok',
   words:['tiktok','tik tok','tiktak']},
  {pkgs:['com.shopee.ph'], web:'https://shopee.ph', key:'appShopee', words:['shopee','shope','sopi']},
  {pkgs:['com.lazada.android'], web:'https://www.lazada.com.ph', key:'appLazada', words:['lazada','lasada']},
  {pkgs:['com.google.android.GoogleCamera','com.android.camera2','com.android.camera',
          'com.sec.android.app.camera','com.oppo.camera','com.huaqin.camera'],
   key:'appCam', words:['camera','kamera','litrato','kuha ng litrato']},
  {pkgs:['com.google.android.dialer','com.android.dialer','com.samsung.android.dialer'],
   key:'appPhone', words:['dialer','phone app','telepono']},
  {pkgs:['com.google.android.apps.photos','com.android.gallery3d'],
   key:'appGallery', words:['gallery','galeri','album','mga litrato']},
  {pkgs:['com.google.android.deskclock','com.android.deskclock'],
   key:'appClock', words:['clock','orasan','alarm']},
  {pkgs:['com.spotify.music'], key:'appSpotify', words:['spotify','ispotify','spoti']},
  {pkgs:['com.android.chrome'], web:'https://www.google.com', key:'appGoogle',
   words:['google','gugol','chrome','browser']}
];

/* Settings screens are actions inside Android, not addresses, so they can
   only be reached from native code. */
var VOICE_SETTINGS = [
  {which:'wifi',      key:'setWifi',  words:['wifi','wi-fi','waypay','internet']},
  {which:'bluetooth', key:'setBT',    words:['bluetooth','blutut','bluetut']},
  {which:'display',   key:'setDisp',  words:['display','brightness','liwanag','screen']},
  {which:'sound',     key:'setSound', words:['sound','tunog','volume settings']},
  {which:'battery',   key:'setBatt',  words:['battery','baterya']},
  {which:'data',      key:'setData',  words:['mobile data','data']},
  {which:'main',      key:'setMain',  words:['settings','setting','ayos ng telepono']}
];

var VOICE_OPEN = ['open','buksan','buksa','pakibuksan','punta','go to','pakibukas','bukas','ibukas'];

function tandaSys(){
  try{
    if(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TandaSys){
      return window.Capacitor.Plugins.TandaSys;
    }
  }catch(e){}
  return null;
}

function sysSay(msg){
  chat.push({role:'ai', text: msg});
  render();
  try{ speakOne(msg); }catch(e){}
}

/* Tries each package in turn. The first one on the phone is the one opened;
   only when none of them is there does it fall back to a website, and only
   when there is no website does it say so. */
function launchApp(app){
  var TS = tandaSys();
  var label = t(app.key);

  if(!TS){
    if(app.web){ try{ window.location.href = app.web; }catch(e){} }
    else sysSay(t('appNoOpen', {app: label}));
    return;
  }

  try{ speakOne(t('openingApp', {app: label})); }catch(e){}

  var i = 0;
  function tryNext(){
    if(i >= app.pkgs.length){
      if(app.web){ try{ window.location.href = app.web; }catch(e){} }
      else sysSay(t('appMissing', {app: label}));
      return;
    }
    TS.openApp({ package: app.pkgs[i++] }).catch(function(){ tryNext(); });
  }
  setTimeout(tryNext, 900);
}


/* ---------- "play <something> on YouTube" ----------
   Opening YouTube and playing a particular song are different requests, and
   the second is the one people actually make. The words that carry the
   command are stripped out and whatever is left is treated as the thing to
   look for, which is handed to the YouTube app as a search.

   Nothing tries to guess a video id or play it outright: the person is put
   on the search results, where they choose. That also keeps this working
   when the words come back slightly wrong, which they often do. */
var PLAY_WORDS = ['play','i-play','iplay','patugtugin','patugtog','tugtugin','pakinggan',
                  'buksan','search','hanapin','hanap','panoorin','panood'];
var STRIP_WORDS = ['ang','ng','sa','mo','nga','po','yung','yong','ung','the','song','kanta',
                   'kantang','music','musika','video','please','paki','naman','ko','na','ni',
                   'on','in','at','to','for','of','natin','tayo','namin','nyo','ninyo','ako',
                   'muna','ngayon','lang','din','rin','isang','yan','ito','ni','si'];

function extractQuery(said, appWords){
  var words = String(said).toLowerCase().replace(/[.,?!]/g, '').split(/\s+/);
  var drop = PLAY_WORDS.concat(STRIP_WORDS, appWords || []);
  var kept = words.filter(function(w){ return w && drop.indexOf(w) < 0; });
  return kept.join(' ').trim();
}



/* ---------- every app on the phone ----------
   The curated list above knows how a handful of app names come back from the
   speech recognizer. It cannot know about the banking app, the trading app,
   or whatever else a particular person has installed, so the phone itself is
   asked once and the answer kept for the rest of the session.

   Matching is on the name the person sees under the icon, because that is
   the name they will say. */
var DEVICE_APPS = null;

function loadDeviceApps(){
  var TS = tandaSys();
  if(!TS || !TS.listApps) return Promise.resolve([]);
  if(DEVICE_APPS) return Promise.resolve(DEVICE_APPS);
  return TS.listApps().then(function(res){
    DEVICE_APPS = (res && res.apps) || [];
    return DEVICE_APPS;
  }).catch(function(){ DEVICE_APPS = []; return DEVICE_APPS; });
}

function norm(x){ return String(x || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); }

/* Finds the installed app whose visible name best fits what was said.
   Longer names win, so "Google Play Store" is preferred over "Google" when
   both could fit - the longer match used more of the sentence and is
   therefore the more specific reading. */
function matchDeviceApp(said, apps){
  var s = ' ' + norm(said) + ' ';
  var best = null, bestLen = 0;
  for(var i=0;i<apps.length;i++){
    var label = norm(apps[i].label);
    if(label.length < 3) continue;
    if(s.indexOf(' ' + label + ' ') >= 0 && label.length > bestLen){
      best = apps[i]; bestLen = label.length;
    }
  }
  if(best) return best;
  /* Nothing matched whole. Try the first word of each name, which covers
     "open Exness" when the icon reads "Exness Trade". */
  for(var j=0;j<apps.length;j++){
    var first = norm(apps[j].label).split(' ')[0];
    if(first.length >= 4 && s.indexOf(' ' + first + ' ') >= 0 && first.length > bestLen){
      best = apps[j]; bestLen = first.length;
    }
  }
  return best;
}

function launchByPackage(pkg, label){
  var TS = tandaSys();
  if(!TS) return;
  try{ speakOne(t('openingApp', {app: label})); }catch(e){}
  setTimeout(function(){
    TS.openApp({ package: pkg }).catch(function(){ sysSay(t('appNoOpen', {app: label})); });
  }, 900);
}

/* ---------- searching inside an app ----------
   Each of these takes a query in its own way. Anything not listed here can
   still be opened; it just cannot be searched from outside. */
var SEARCH_APPS = [
  {words:['youtube','you tube','yutub','yutyub','yutyob'], key:'appYT',
   pkg:'com.google.android.youtube',
   url:function(q){ return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q); }},
  {words:['spotify','ispotify','spoti'], key:'appSpotify',
   pkg:'com.spotify.music',
   url:function(q){ return 'spotify:search:' + encodeURIComponent(q); }},
  {words:['facebook','fb','feysbuk','peysbuk','fesbuk'], key:'appFB',
   pkg:'com.facebook.katana',
   url:function(q){ return 'https://m.facebook.com/search/top/?q=' + encodeURIComponent(q); }},
  {words:['google','gugol','chrome','browser'], key:'appGoogle',
   pkg:null,
   url:function(q){ return 'https://www.google.com/search?q=' + encodeURIComponent(q); }}
];

function searchInApp(entry, query){
  var TS = tandaSys();
  var url = entry.url(query);
  var label = t(entry.key);
  try{ speakOne(t('searching', {what: query, app: label})); }catch(e){}
  setTimeout(function(){
    if(TS && TS.openUrl){
      TS.openUrl({ url: url, package: entry.pkg || '' })
        .catch(function(){
          /* Without the package it may land in a browser, which is still
             better than nothing happening. */
          TS.openUrl({ url: url }).catch(function(){ sysSay(t('appNoOpen', {app: label})); });
        });
      return;
    }
    try{ window.location.href = url; }catch(e){}
  }, 1100);
}

function runVoiceCommand(said){
  var s = String(said || '').toLowerCase().trim();
  if(!s) return false;

  var wantsOpen = VOICE_OPEN.some(function(w){ return s.indexOf(w) >= 0; });
  var isQuestion = /^\s*(ano|anong|paano|papaano|pano|how|what|bakit|why|saan|where)\b/.test(s)
                   || s.indexOf('?') >= 0;

  /* ---- louder, softer, brighter, dimmer ----
     Matching is by stem, not by whole word. Tagalog builds meaning with
     affixes - lakas becomes lakasan and palakasin, taas becomes taasan -
     so anything anchored to word boundaries misses most of what people
     actually say. That was why "lakasan ang brightness" fell through to
     the AI and came back as a lesson. */
  var TS = tandaSys();
  function hasAny(list){ return list.some(function(w){ return s.indexOf(w) >= 0; }); }

  var UP   = ['taas','lakas','palakas','itaas','angat','laki','dagdag','bright','louder',
              'increase','higher','up '];
  var DOWN = ['baba','hina','pahina','bawas','liit','dim','softer','lower','decrease','dilim'];
  var VOL  = ['volume','tunog','boses','sound','audio'];
  var BRI  = ['liwanag','bright','ilaw','screen','dilim','dim'];

  var up = hasAny(UP), down = hasAny(DOWN);
  var vol = hasAny(VOL), bri = hasAny(BRI);

  if(TS && (vol || bri) && !isQuestion){
    /* Naming the thing without a direction almost always means more of it:
       "liwanag naman" is a request for light, not a question about it. */
    var goUp = up || !down;

    if(vol){
      TS.bumpVolume({ direction: goUp ? 1 : -1 })
        .catch(function(){ sysSay(t('sysFailed')); });
      return true;
    }
    TS.setBrightness({ percent: goUp ? 100 : 25 }).then(function(res){
      if(res && res.systemWide === false){
        chat.push({role:'ai', text: t('brightAppOnly'), askPerm:true});
        render();
        try{ speakOne(t('brightAppOnly')); }catch(e){}
      }else{
        try{ speakOne(t(goUp ? 'brightUp' : 'brightDown')); }catch(e){}
      }
    }).catch(function(){ sysSay(t('sysFailed')); });
    return true;
  }

  /* ---- settings screens ---- */
  if(TS && (wantsOpen || /\b(settings|setting)\b/.test(s)) && !isQuestion){
    for(var k=0;k<VOICE_SETTINGS.length;k++){
      var st = VOICE_SETTINGS[k];
      if(st.words.some(function(w){ return s.indexOf(w) >= 0; })){
        try{ speakOne(t('openingApp', {app: t(st.key)})); }catch(e){}
        var which = st.which;
        setTimeout(function(){
          TS.openSettings({ which: which }).catch(function(){ sysSay(t('sysFailed')); });
        }, 900);
        return true;
      }
    }
  }

  /* ---- playing or searching inside an app ---- */
  var wantsPlay = PLAY_WORDS.some(function(w){ return s.indexOf(w) >= 0; });
  if(wantsPlay && !isQuestion){
    for(var sa=0; sa<SEARCH_APPS.length; sa++){
      var ent = SEARCH_APPS[sa];
      if(!ent.words.some(function(w){ return s.indexOf(w) >= 0; })) continue;
      var q = extractQuery(s, ent.words);
      if(q){ searchInApp(ent, q); return true; }
      break;   /* named the app but gave nothing to look for - just open it */
    }
  }

  /* ---- other apps ---- */
  for(var i=0;i<VOICE_APPS.length;i++){
    var app = VOICE_APPS[i];
    if(!app.words.some(function(w){ return s.indexOf(w) >= 0; })) continue;
    /* A question about an app is a request to be taught, not to be moved. */
    if(!wantsOpen && isQuestion) continue;
    launchApp(app);
    return true;
  }

  /* ---- anything else installed on this phone ----
     The curated list is only a head start. This is what makes "open Exness"
     work without anyone having thought of Exness. */
  if(tandaSys() && (wantsOpen || wantsPlay) && !isQuestion){
    loadDeviceApps().then(function(apps){
      var hit = matchDeviceApp(s, apps);
      if(hit) launchByPackage(hit['package'], hit.label);
      else sendAsk(said);   /* genuinely unknown - let the AI answer */
    });
    return true;
  }

  /* ---- moving around inside TANDA ---- */
  var goes = [
    {words:['games','laro','maglaro'], screen:'games'},
    {words:['learn','gabay','aral','tutorial'], screen:'learn'},
    {words:['home','bahay','simula'], screen:'home'},
    {words:['me','profile','sarili'], screen:'me'}
  ];
  if(wantsOpen || /^(pumunta|punta|go)\b/.test(s)){
    for(var g=0; g<goes.length; g++){
      if(goes[g].words.some(function(w){ return s.indexOf(w) >= 0; })){
        stopSpeak();
        S.screen = goes[g].screen; S.modal = null; render();
        return true;
      }
    }
  }
  return false;
}


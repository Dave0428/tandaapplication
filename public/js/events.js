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
    S.data.name = v.trim() || t('friend'); save(); render(); return;
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
  if(a === 'send'){ var ta = document.getElementById('askIn'); var txt = ta ? ta.value : ''; if(ta) ta.value=''; sendAsk(txt); return; }
  if(a === 'chip'){ sendAsk(t('suggest'+arg)); return; }

  if(a === 'game'){ S.game = arg; S.g = {}; S.screen='game'; S.modal=null;
    if(arg==='match') initMatch(); if(arg==='puzzle') initPuzzle(); if(arg==='word') initWord(); if(arg==='math') initMath();
    render(); if(arg==='trivia') startTrivia(); return; }
  if(a === 'usefallback'){
    var flb = (FALLBACK_Q[S.data.lang] || FALLBACK_Q.en);
    S.g = {qs: flb, i:0, score:0, picked:null};
    render();
    return;
  }
  if(a === 'replay'){ S.modal=null;
    if(S.game==='match') initMatch(); else if(S.game==='puzzle') initPuzzle(); else if(S.game==='word') initWord();
    else if(S.game==='math') initMath(); else if(S.game==='trivia'){ startTrivia(); return; }
    render(); return; }
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
    else { S.g.wrong = true; render(); }
    return;
  }
  if(a === 'math'){
    if(S.g.q.picked !== null) return;
    S.g.q.picked = Number(arg);
    if(Number(arg) === S.g.q.ans) S.g.score++;
    render(); return;
  }
  if(a === 'nextmath'){
    S.g.n++;
    if(S.g.n >= 10){ winModal(t('score')+': '+S.g.score+' / 10', S.g.score); return; }
    nextMath(); render(); return;
  }
  if(a === 'triv'){
    if(S.g.picked !== null) return;
    S.g.picked = Number(arg);
    if(Number(arg) === Number(S.g.qs[S.g.i].a)) S.g.score++;
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


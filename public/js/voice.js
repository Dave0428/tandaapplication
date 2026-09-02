/* ---------- voice ---------- */
var VOICES = [];
var VOICE_OK = null;      /* null = not tried yet, true = heard, false = blocked */
var readToken = 0;
var warmed = false;

function ttsSupported(){ return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'; }
function loadVoices(){ try{ VOICES = window.speechSynthesis.getVoices() || []; }catch(e){ VOICES = []; } }
if(ttsSupported()){
  loadVoices();
  try{ window.speechSynthesis.addEventListener('voiceschanged', function(){ loadVoices(); updateVoiceUi(); }); }
  catch(e){ window.speechSynthesis.onvoiceschanged = function(){ loadVoices(); updateVoiceUi(); }; }
  /* Chrome stops speaking after ~15s unless nudged. resume() only:
     pause() permanently stalls several Android engines. */
  setInterval(function(){
    try{ if(window.speechSynthesis.speaking) window.speechSynthesis.resume(); }catch(e){}
  }, 8000);
}
function hasFilipinoVoice(){
  return VOICES.some(function(v){ var l=(v.lang||'').toLowerCase(); return l.indexOf('fil')===0 || l.indexOf('tl')===0; });
}
function pickVoice(){
  if(!VOICES.length) loadVoices();
  var want = S.data.lang === 'tl' ? ['fil','tl','en'] : ['en'];
  for(var i=0;i<want.length;i++){
    for(var j=0;j<VOICES.length;j++){
      var l = (VOICES[j].lang||'').toLowerCase().replace('_','-');
      if(l.indexOf(want[i]) === 0) return VOICES[j];
    }
  }
  return VOICES.length ? VOICES[0] : null;   /* never leave it to an unknown lang tag */
}
function mkUtt(text, v){
  var u = new SpeechSynthesisUtterance(String(text));
  if(v){ u.voice = v; u.lang = v.lang; }
  u.rate = Number(S.data.rate) || .85;
  u.pitch = 1; u.volume = 1;
  return u;
}
function setReadBtn(on){
  var b = document.getElementById('readAllBtn');
  if(b) b.textContent = on ? ('\u23F9 ' + t('stop')) : ('\uD83D\uDD0A ' + t('listen'));
}
function stopSpeak(){
  readToken++;
  var nat = nativeTTS();
  if(nat){ try{ nat.stop(); }catch(e){} }
  try{ window.speechSynthesis.cancel(); }catch(e){}
  var els = document.querySelectorAll('.step.reading');
  for(var i=0;i<els.length;i++) els[i].classList.remove('reading');
  setReadBtn(false);
}
function updateVoiceUi(){
  var box = document.getElementById('voiceStatus');
  if(box) box.innerHTML = voiceStatusHtml();
}
function voiceStatusHtml(){
  if(nativeTTS()) return '';   // real Android/iOS voice is available
  if(!ttsSupported() || VOICE_OK === false){
    var why = !ttsSupported() ? t('voiceNone')
            : (VOICES.length ? t('voiceBlocked') : t('voiceNone'));
    return '<div class="warn"><strong>' + esc(why) + '</strong><br>'
      + '<a href="' + esc(location.href) + '" target="_blank" rel="noopener" style="color:var(--teal);font-weight:700">'
      + esc(t('openTab')) + '</a>'
      + '<br><span class="muted" style="font-size:.78rem">voices found: ' + VOICES.length + '</span></div>';
  }
  if(S.data.lang === 'tl' && VOICES.length && !hasFilipinoVoice()){
    return '<p class="muted" style="margin:0 0 10px">\uD83D\uDD08 ' + esc(t('novoice')) + '</p>';
  }
  return '';
}
/* Touch the engine on the first tap so the voice list loads. No utterance is
   queued here: a blank one jams the queue on Chrome and never ends. */
function warmUp(){
  if(!ttsSupported()) return;
  try{ window.speechSynthesis.resume(); }catch(e){}
  if(!warmed){ warmed = true; loadVoices(); }
}

/* ---------- native voice (Capacitor) ----------
   Inside a real Android/iOS app built with Capacitor, we talk to the phone's
   own text-to-speech engine instead of the browser's. This is the permanent
   fix for the silent-voice problem: no WebView, no frame, no blocking.
   Install it with:  npm install @capacitor-community/text-to-speech
   Outside a Capacitor app this returns null and the browser path is used. */
function nativeTTS(){
  try{
    if(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech){
      return window.Capacitor.Plugins.TextToSpeech;
    }
  }catch(e){}
  return null;
}
function nativeSpeakList(tts, texts, onIndex, onDone){
  var token = ++readToken;
  var i = 0;
  VOICE_OK = true;
  try{ tts.stop(); }catch(e){}
  function step(){
    if(token !== readToken) return;
    if(i >= texts.length){ if(onDone) onDone(); else setReadBtn(false); return; }
    if(onIndex) onIndex(i);
    var txt = texts[i]; i++;
    tts.speak({
      text: txt,
      lang: S.data.lang === 'tl' ? 'fil-PH' : 'en-US',
      rate: Number(S.data.rate) || .85,
      pitch: 1, volume: 1,
      category: 'ambient'
    }).then(step).catch(function(){ if(token === readToken) step(); });
  }
  step();
}

function speakList(texts, onIndex, onDone){
  var nat = nativeTTS();
  if(nat) return nativeSpeakList(nat, texts, onIndex, onDone);
  if(!ttsSupported()){ VOICE_OK = false; updateVoiceUi(); return; }
  var token = ++readToken;
  var heard = false, tries = 0;

  function enqueue(){
    tries++;
    var v = pickVoice();
    try{ window.speechSynthesis.cancel(); }catch(e){}
    try{ window.speechSynthesis.resume(); }catch(e){}
    texts.forEach(function(txt, i){
      var u = mkUtt(txt, v);
      u.onstart = function(){
        heard = true;
        if(VOICE_OK !== true){ VOICE_OK = true; updateVoiceUi(); }
        if(token === readToken && onIndex) onIndex(i);
      };
      u.onend = function(){
        if(token === readToken && i === texts.length - 1){ if(onDone) onDone(); else setReadBtn(false); }
      };
      u.onerror = function(e){
        var why = (e && e.error) || '';
        /* our own cancel() reports these — not a failure */
        if(why === 'canceled' || why === 'interrupted') return;
        if(!heard && token === readToken){ VOICE_OK = false; updateVoiceUi(); setReadBtn(false); }
      };
      try{ window.speechSynthesis.speak(u); }catch(e){}
    });

    setTimeout(function(){
      if(token !== readToken || heard) return;
      var busy = false;
      try{ busy = window.speechSynthesis.speaking; }catch(e){}
      if(busy) return;
      if(tries < 3){ loadVoices(); enqueue(); return; }   /* Chrome drops the first queue after a cancel */
      VOICE_OK = false; updateVoiceUi(); setReadBtn(false);
    }, tries === 1 ? 600 : 1400);
  }
  enqueue();
}
function speakOne(text){ warmUp(); speakList([text]); }
function readAll(items){
  warmUp();
  setReadBtn(true);
  speakList(items.map(function(x){ return x.t; }), function(i){
    var prev = document.querySelector('.step.reading');
    if(prev) prev.classList.remove('reading');
    var si = items[i].s;
    if(si != null){
      var node = document.querySelector('[data-step="'+si+'"]');
      if(node){ node.classList.add('reading'); node.scrollIntoView({block:'center', behavior:'smooth'}); }
    }
  }, function(){ stopSpeak(); });
}

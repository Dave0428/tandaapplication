/* ---------- voice input (speech-to-text) ----------
   Same two-engine pattern as the text-to-speech section below:
   1. Capacitor's native speech recognition plugin, inside the real app —
      this is the one that actually matters, since the browser's own
      SpeechRecognition rarely works inside an Android WebView even when
      the API object exists.
   2. The browser's own SpeechRecognition, for testing on a computer.
   sttSupported() tells the UI whether to even draw the microphone button. */
function nativeSTT(){
  if(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.SpeechRecognition){
    return window.Capacitor.Plugins.SpeechRecognition;
  }
  return null;
}
function browserSTTCtor(){
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}
/* Having the plugin installed is not the same as the phone being able to
   listen. Some units have no Google app, or a stripped-down ROM with no
   speech service at all. So we ask the phone itself once and hide the
   microphone button when the answer is no — better than an older user
   tapping a button that quietly does nothing. Typing still works. */
var STT_OK = null;   /* null = not asked yet, true/false = the phone's answer */
function sttSupported(){
  if(nativeSTT()) return STT_OK !== false;
  return !!browserSTTCtor();
}
function checkSTT(){
  var n = nativeSTT();
  if(!n) return;
  if(!n.available){ STT_OK = true; return; }
  n.available().then(function(r){
    var ok = (r && typeof r.available !== 'undefined') ? !!r.available : !!r;
    if(ok === STT_OK) return;
    STT_OK = ok;
    /* the Ask screen may already be drawn with the button on it */
    try{ if(typeof render === 'function' && S.screen === 'ask') render(); }catch(e){}
  }).catch(function(){ STT_OK = false; });
}
/* Capacitor injects its bridge very early, but not always before this file
   parses — so ask twice and let the second call correct the first. */
setTimeout(checkSTT, 0);
setTimeout(checkSTT, 1500);

var listening = false;
var activeRec = null;             // the browser SpeechRecognition instance, while listening
var activeNativeHandles = [];     // native plugin listener handles, while listening
function isListening(){ return listening; }

/* onLive(text) fires again and again WHILE someone is talking — each call
   carries the whole phrase recognized so far, not just the newest word,
   so the caller should replace the box's content, not append to it.
   onEnd() fires once, whenever listening truly stops — naturally (a pause
   was long enough) or because stopListening() was called. */
function startListening(onLive, onEnd, onDebug){
  if(listening) return;
  var langTag = S.data.lang === 'tl' ? 'tl-PH' : 'en-US';
  var native = nativeSTT();

  if(native){
    listening = true;
    var stopped = false;
    var finish = function(){
      if(stopped) return;
      stopped = true;
      listening = false;
      if(onEnd) onEnd();
    };
    var promptText = S.data.lang === 'tl' ? 'Magsalita ka...' : 'Speak now...';

    /* The dialog can close in a way that rejects the start() promise even
       though the phone already recognized the phrase — on Android a
       cancelled activity comes back as plain 0. So we also listen for
       partial results and keep the last thing we heard as a fallback. */
    var lastHeard = '';
    var partialHandle = null;
    try{
      partialHandle = native.addListener('partialResults', function(data){
        var m = data && (data.matches || data.value);
        var txt = Array.isArray(m) ? m[0] : m;
        if(txt){ lastHeard = String(txt); if(onDebug) onDebug('partial: ' + lastHeard); }
      });
    }catch(e){}
    var cleanup = function(){
      try{
        if(partialHandle && partialHandle.remove) partialHandle.remove();
        else if(partialHandle && partialHandle.then) partialHandle.then(function(h){ h.remove(); });
      }catch(e){}
    };

    native.requestPermissions().then(function(perm){
      if(onDebug) onDebug('permission: ' + JSON.stringify(perm));
      // A headless (popup:false) attempt produced no results at all on
      // test devices — some Android builds only run speech recognition
      // reliably through the system's own listening dialog. Using that
      // dialog (popup:true) trades away live streaming into the box for
      // something that actually works: the phone shows its own "Speak
      // now" screen, and the recognized phrase comes back once it closes.
      return native.start({ language: langTag, maxResults: 1, prompt: promptText, partialResults: false, popup: true });
    }).then(function(res){
      if(onDebug) onDebug('start resolved: ' + JSON.stringify(res));
      var m = res && (res.matches || res.value || res.results);
      var text = Array.isArray(m) ? m[0] : (typeof m === 'string' ? m : '');
      if(!text && lastHeard) text = lastHeard;
      if(onDebug) onDebug('text: [' + text + ']');
      if(text) onLive(text);
      cleanup();
      finish();
    }).catch(function(err){
      /* Do NOT collapse this into (err && err.message) — a rejection value
         of 0 is falsy, so that pattern silently printed "0" and hid
         everything useful. Print the shape of whatever came back. */
      if(onDebug){
        var j = '?';
        try{ j = JSON.stringify(err); }catch(e){}
        onDebug('rejected. type=' + (typeof err)
          + ' value=' + String(err)
          + ' json=' + j
          + ' keys=' + (err && typeof err === 'object' ? Object.keys(err).join(',') : '-')
          + ' msg=' + ((err && (err.message || err.errorMessage)) || '-'));
      }
      if(lastHeard){
        if(onDebug) onDebug('ginamit ang partial: ' + lastHeard);
        onLive(lastHeard);
      }
      cleanup();
      finish();
    });
    return;
  }

  var Ctor = browserSTTCtor();
  if(!Ctor){ if(onEnd) onEnd(); return; }
  var rec = new Ctor();
  rec.lang = langTag;
  rec.interimResults = true;
  rec.continuous = true;
  rec.maxAlternatives = 1;
  listening = true;
  activeRec = rec;
  rec.onresult = function(e){
    var text = '';
    for(var i=0;i<e.results.length;i++) text += e.results[i][0].transcript;
    if(text) onLive(text);
  };
  rec.onend = function(){ listening = false; activeRec = null; if(onEnd) onEnd(); };
  try{ rec.start(); }catch(e){ listening = false; activeRec = null; if(onEnd) onEnd(); }
}

/* Lets the mic button double as a manual stop while someone is mid-sentence. */
function stopListening(){
  var native = nativeSTT();
  if(native){ try{ native.stop(); }catch(e){} return; }
  if(activeRec){ try{ activeRec.stop(); }catch(e){} }
}

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
  if(nativeTTS()) return '';   // real Android/iOS voice is available — the browser check below does not apply
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

    /* Plenty of phones ship with no Filipino voice at all. Asking for
       fil-PH there fails, and the old code quietly moved on to the next
       line — so the whole tutorial played back as silence with nothing
       on screen to explain why. Fall back to the English voice reading
       the Tagalog text: an accent is far better than saying nothing. */
    function say(lang, onFail){
      tts.speak({
        text: txt,
        lang: lang,
        rate: Number(S.data.rate) || .85,
        pitch: 1, volume: 1,
        category: 'ambient'
      }).then(step).catch(function(){
        if(token !== readToken) return;
        if(onFail) onFail(); else step();
      });
    }

    if(S.data.lang === 'tl'){
      say('fil-PH', function(){
        say('en-US');   // no Filipino voice on this phone — read it anyway
      });
    }else{
      say('en-US');
    }
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
     

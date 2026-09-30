/* ================= RENDER ================= */
function h(html){ return html; }
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

function render(){
  var v = '';
  if(S.screen === 'tour') v = viewTour();
  else if(!S.data.name && S.screen !== 'account') v = viewWelcome();
  else if(S.screen === 'home') v = viewHome();
  else if(S.screen === 'games') v = viewGames();
  else if(S.screen === 'game') v = viewGame();
  else if(S.screen === 'learn') v = viewLearn();
  else if(S.screen === 'tutorial') v = viewTutorial();
  else if(S.screen === 'ask') v = viewAsk();
  else if(S.screen === 'me') v = viewMe();
  else if(S.screen === 'account') v = viewAccount();
  else if(S.screen === 'tour') v = viewTour();
  shell.innerHTML = v + (S.modal ? S.modal : '');
  refreshAiBits();
  if(S.screen === 'ask') scrollChat();
  if(S.screen === 'game' && S.game === 'trivia' && !S.g.qs) startTrivia();
}
function nav(active){
  var items = [['home','🏠','navHome'],['games','🎲','navGames'],['learn','📖','navLearn'],['ask','💡','navAsk'],['me','🙂','navMe']];
  return '<div class="nav">' + items.map(function(i){
    return '<button class="navbtn" data-act="go" data-arg="'+i[0]+'" data-active="'+(active===i[0])+'">'
      + '<span class="ic">'+i[1]+'</span>'+esc(t(i[2]))+'</button>';
  }).join('') + '</div>';
}
function head(title, backTo){
  return '<div class="subheader"><button class="backbtn" data-act="go" data-arg="'+backTo+'" aria-label="'+esc(t('back'))+'">←</button>'
    + '<h2 class="subtitle">'+esc(title)+'</h2></div>';
}

/* ---------- welcome ---------- */
function viewWelcome(){
  return '<div class="scroll" style="display:flex;flex-direction:column;justify-content:center;padding:32px 26px">'
    + '<div class="center"><div style="width:78px;height:78px;border-radius:22px;background:var(--teal);color:var(--marigold);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-family:\'Baloo 2\';font-weight:800;font-size:2rem;box-shadow:0 8px 20px var(--tile-shadow)">T</div>'
    + '<h1 style="font-family:\'Baloo 2\';font-weight:800;font-size:1.7rem;margin:0 0 6px">'+esc(t('welcome'))+'</h1>'
    + '<p class="muted" style="margin:0 0 22px">'+esc(t('welcomeS'))+'</p></div>'
    + '<label class="f">'+esc(t('langQ'))+'</label>'
    + '<div class="langswitch" style="margin-bottom:16px">'
      + '<button class="langopt" style="flex:1" data-act="lang" data-arg="en" data-active="'+(S.data.lang==='en')+'">English</button>'
      + '<button class="langopt" style="flex:1" data-act="lang" data-arg="tl" data-active="'+(S.data.lang==='tl')+'">Tagalog</button>'
    + '</div>'
    + '<label class="f">'+esc(t('nameQ'))+'</label>'
    + '<input class="t" id="nameIn" placeholder="Lola Rosa" autocomplete="name">'
    + '<button class="btn" style="margin-top:16px" data-act="setname">'+esc(t('start'))+'</button>'
    + '</div>';
}

/* ---------- home ---------- */
function viewHome(){
  var d = new Date();
  var dateStr = d.toLocaleDateString(S.data.lang==='tl'?'fil-PH':'en-US', {weekday:'long', month:'long', day:'numeric'});
  var tiles = [
    ['games','🎲','var(--marigold)', t('games'), t('gamesSub')],
    ['learn','📖','var(--teal)', t('learnT'), t('learnSub')],
    ['ask','💡','var(--terracotta)', t('askT'), t('askSub')],
    ['me','🙂','var(--leaf)', t('meT'), t('textSize')+' · '+t('lang')]
  ];
  return '<div class="scroll">'
    + '<div class="header"><div><p class="greet-label">'+esc(t('hi'))+'</p>'
    + '<h1 class="greet-name">'+esc(S.data.name || t('friend'))+'</h1>'
    + '<p class="greet-date">'+esc(dateStr)+'</p></div>'
    + '<button class="avatar" data-act="go" data-arg="me">'+esc((S.data.name||'T').slice(0,1).toUpperCase())+'</button></div>'
    + '<div class="streak"><div class="streak-icon">🔥</div><div><h3>'+esc(t('streakT',{n:S.data.streak}))+'</h3><p>'+esc(t('streakS'))+'</p></div></div>'
    + '<div class="sec-label">'+esc(t('today'))+'</div>'
    + '<div class="grid">'
    + tiles.map(function(x){
        return '<button class="tile" data-act="go" data-arg="'+x[0]+'">'
          + '<span class="tile-icon" style="background:'+x[2]+'">'+x[1]+'</span>'
          + '<h4>'+esc(x[3])+'</h4><p>'+esc(x[4])+'</p></button>';
      }).join('')
    + '<button class="tile wide" data-act="go" data-arg="learn">'
      + '<span class="tile-icon" style="background:var(--teal-soft)">📈</span>'
      + '<div><h4>'+esc(t('progress',{a:doneCount(), b:TUT.length}))+'</h4><p>'+esc(t('voiceNote'))+'</p></div></button>'
    + '</div><div style="height:22px"></div></div>' + nav('home');
}

/* ---------- games ---------- */
var GAMES = [
  {id:'match', icon:'🀄', tk:'matchT', sk:'matchS'},
  {id:'puzzle', icon:'🔢', tk:'puzT', sk:'puzS'},
  {id:'word', icon:'🔤', tk:'wordT', sk:'wordS'},
  {id:'math', icon:'➕', tk:'mathT', sk:'mathS'},
  {id:'bingo', icon:'🎱', tk:'bingoT', sk:'bingoS'},
  {id:'blocks', icon:'🧱', tk:'blocksT', sk:'blocksS'}
];
function viewGames(){
  return '<div class="scroll">' + head(t('games'),'home')
    + '<div class="list">'
    + GAMES.map(function(g){
        return '<button class="listitem" data-act="game" data-arg="'+g.id+'"'+(g.ai?' data-ai-gate="1"':'')+'>'
          + '<span class="dot">'+g.icon+'</span><div><h4>'+esc(t(g.tk))+'</h4><p>'+esc(t(g.sk))+'</p></div>'
          + '<span class="chev">›</span></button>';
      }).join('')
    + '</div></div>' + nav('games');
}

/* ---------- learn ---------- */
function viewLearn(){
  var list = tutsIn(S.cat);
  return '<div class="scroll">' + head(t('learnT'),'home')
    + '<div class="tabs">' + CATS.map(function(c){
        return '<button class="tab" data-act="cat" data-arg="'+c.id+'" data-active="'+(S.cat===c.id)+'">'+c.icon+' '+esc(t(c.label))+'</button>';
      }).join('') + '</div>'
    + '<div class="list">' + list.map(function(x){
        var done = !!S.data.done[x.id];
        return '<button class="listitem" data-act="tut" data-arg="'+x.id+'">'
          + '<span class="dot">'+x.icon+'</span>'
          + '<div style="flex:1"><h4>'+esc(L(x.title))+' '+(done?'<span class="done-badge">✓ '+esc(t('doneY'))+'</span>':'')+'</h4>'
          + '<p>'+esc(L(x.sub))+' · '+x.steps.length+' '+esc(t('steps'))+'</p></div>'
          + '<span class="chev">›</span></button>';
      }).join('') + '</div>'
    + '<div class="pad" style="padding-top:0">'
      + '<button class="card" style="width:100%;text-align:left;border:none;cursor:pointer" data-act="go" data-arg="ask">'
        + '<p style="margin:0 0 4px;font-weight:700">' + esc(t('notHereT')) + '</p>'
        + '<p class="muted" style="margin:0;font-size:.88rem">' + esc(t('notHereS')) + '</p>'
      + '</button></div>'
    + '</div>' + nav('learn');
}

/* ---------- tutorial ---------- */
function viewTutorial(){
  var x = tutById(S.tutorial);
  if(!x) return viewLearn();
  var done = !!S.data.done[x.id];
  /* Each step can carry a picture of the real screen. The file is looked up
     by name - img/<tutorial id>-<step number>.jpg - so adding a screenshot
     means dropping the file in, with no data file to edit. If the file is
     not there yet, onerror hides it and the step reads as plain text,
     exactly as before. */
  var stepsHtml = x.steps.map(function(s, i){
    var txt = L(s);
    var shot = 'img/' + x.id + '-' + (i+1) + '.jpg';
    return '<div class="step" data-step="'+i+'"><span class="step-num">'+(i+1)+'</span>'
      + '<div style="flex:1;min-width:0">'
        + '<p style="margin:0">'+esc(txt)+'</p>'
        + '<img class="stepshot" src="'+esc(shot)+'" alt="" loading="lazy" onerror="this.style.display=\'none\'">'
      + '</div>'
      + '<button class="say" data-act="say" data-arg="'+i+'" aria-label="'+esc(t('readStep'))+'">\uD83D\uDD0A</button></div>';
  }).join('');
  return '<div class="scroll">' + head(x.icon + '  ' + L(x.title), 'learn')
    + '<div class="pad">'
    + (x.warn ? '<div class="warn">'+esc(L(x.sub))+'</div><div style="height:12px"></div>' : '')
    + '<div id="voiceStatus">'+voiceStatusHtml()+'</div>'
    + '<div class="card">' + stepsHtml + '</div>'
    + '<div class="tip"><strong>'+esc(t('tipL'))+':</strong> ' + esc(L(x.tip)) + '</div>'
    + '<div style="height:14px"></div>'
    + '<div id="aiOut"></div>'
    + '<div class="row" data-ai-gate="1">'
      + '<button class="btn ghost" data-act="simpler">✨ '+esc(t('simpler'))+'</button>'
      + '<button class="btn ghost" data-act="askabout">💡 '+esc(t('askAbout'))+'</button>'
    + '</div>'
    + '<div style="height:14px"></div>'
    + '<button class="btn '+(done?'ghost':'alt')+'" data-act="markdone">'+(done?'✓ '+esc(t('doneY')):esc(t('done')))+'</button>'
    + '<div style="height:8px"></div>'
    + '</div>'
    + '<div class="pad" style="padding-top:0"><div class="voicebar">'
      + '<button class="btn" id="readAllBtn" data-act="readall">🔊 '+esc(t('listen'))+'</button>'
      + '<button class="btn ghost" style="flex:0 0 auto;width:auto;padding:14px 18px" data-act="stopspeak">⏹</button>'
      + '<button class="btn ghost" style="flex:0 0 auto;width:auto;padding:14px 16px" data-act="bigread" title="'+esc(t('bigRead'))+'">🔎</button>'
    + '</div></div>'
    + '</div>';
}

/* ---------- ask (AI chat) ---------- */
var chat = [];
var askedByVoice = false;
function viewAsk(){
  var bubbles = chat.map(function(m, i){
    if(m.role === 'me') return '<div class="bub me">'+esc(m.text)+'</div>';
    var g = m.guide;
    return '<div class="bub ai" id="bub'+i+'">'+esc(m.text)
      + (m.pending ? '' : '<br><button class="say" data-act="sayai" data-arg="'+i+'">\uD83D\uDD0A </button>')
      + (m.getApp && !m.pending
          ? '<div style="margin-top:10px"><button class="btn small" style="width:auto;padding:10px 14px" '
            + 'data-act="getapp" data-arg="' + esc(m.getApp) + '">'
            + esc(t('getAppBtn', {app: m.getLabel || ''})) + '</button></div>'
          : '')
      + (m.askPerm && !m.pending
          ? '<div style="margin-top:10px"><button class="btn small" style="width:auto;padding:10px 14px" '
            + 'data-act="grantbright">' + esc(t('grantBright')) + '</button></div>'
          : '')
      + (g && !m.pending
          ? '<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--line)">'
            + '<p class="muted" style="margin:0 0 6px;font-size:.82rem">'+esc(t('guideFound'))+'</p>'
            + '<button class="btn small" style="width:auto;padding:10px 14px" data-act="tut" data-arg="'+esc(g.id)+'">'
              + g.icon + '  ' + esc(L(g.title)) + '</button>'
            + openAppBtn(g)
            + '</div>'
          : '')
      + '</div>';
  }).join('');
  var intro = chat.length ? '' : '<div class="bub ai">'+esc(t('helperIntro'))+'</div>';
  return '<div class="shellcol" style="display:flex;flex-direction:column;flex:1;min-height:0">'
    + head(t('helper'),'home')
    + '<div class="chat" id="chatBox">' + intro + bubbles
    + '<div data-ai-off class="card hidden" style="margin:12px 0"><p class="muted" style="margin:0">'+esc(t('aiOff'))+'</p></div>'
    + '</div>'
    + '<div class="chips">'
      + '<button class="chip" data-act="chip" data-arg="1">'+esc(t('suggest1'))+'</button>'
      + '<button class="chip" data-act="chip" data-arg="2">'+esc(t('suggest2'))+'</button>'
      + '<button class="chip" data-act="chip" data-arg="3">'+esc(t('suggest3'))+'</button>'
    + '</div>'
    + '<div class="composer"><textarea id="askIn" rows="1" placeholder="'+esc(t('typeHere'))+'"></textarea>'
    + (sttSupported() ? '<button class="send ghost" id="askMicBtn" data-act="mic" aria-label="'+esc(t('voiceInput'))+'">🎤</button>' : '')
    + '<button class="send" data-act="send" aria-label="'+esc(t('send'))+'">➤</button></div>'
    + '</div>' + nav('ask');
}
function scrollChat(){ var c = document.getElementById('chatBox'); if(c) c.scrollTop = c.scrollHeight; }

function sendAsk(text){
  if(!text || !text.trim()) return;
  if(!aiReady()) return;
  chat.push({role:'me', text:text.trim()});
  chat.push({role:'ai', text:t('thinking'), pending:true});
  render();
  var turns = [{role:'user', content:aiRules()}];
  var hist = chat.filter(function(m){ return !m.pending; }).slice(-8);
  hist.forEach(function(m){ turns.push({role: m.role==='me'?'user':'assistant', content:m.text}); });
  var idx = chat.length - 1;
  aiAsk(turns, {
    cache:false, modelTier:'quick',
    onText:function(u){
      /* The tag arrives character by character at the very end. Trimming a
         partial one keeps "[GUID" from flashing on screen mid-answer. */
      var live = String(u.text).replace(/\[GUIDE:?[a-z0-9\-]*\]?\s*$/i, '');
      chat[idx].text = live; chat[idx].pending = true;
      var b = document.getElementById('bub'+idx);
      if(b){ b.textContent = live; scrollChat(); }
    }
  }).then(function(r){
    var parted = splitGuideTag(r.text);
    chat[idx] = {role:'ai', text:parted.text, guide:parted.guide};
    render();
    /* A question that was spoken gets an answer that is spoken. Someone who
       used the microphone did so because reading is the hard part, and
       handing them back a wall of text would undo that. The stop bar shows
       itself while this runs. */
    if(askedByVoice){ askedByVoice = false; try{ speakOne(parted.text); }catch(e){} }
  }).catch(function(e){
    // Temporary: show the real reason instead of only the generic message,
    // so a stuck "Something went wrong" can actually be diagnosed on-device.
    var detail = '';
    try{ detail = '\n\n[debug: ' + (e && (e.code || e.message || JSON.stringify(e))) + ']'; }catch(_){ detail = '\n\n[debug: unknown error shape]'; }
    chat[idx] = {role:'ai', text: (e && e.text ? e.text : t('aiErr')) + detail};
    render();
  });
}

/* in-tutorial AI */
function tutorialAi(mode){
  var x = tutById(S.tutorial);
  if(!x || !aiReady()) return;
  var out = document.getElementById('aiOut');
  out.innerHTML = '<div class="card"><span class="thinking"><span class="dot-anim"></span><span class="dot-anim"></span><span class="dot-anim"></span> '+esc(t('thinking'))+'</span></div>';
  var body = L(x.title) + '\n' + x.steps.map(function(s,i){ return (i+1)+'. '+L(s); }).join('\n');
  var q = mode === 'simpler'
    ? 'A senior citizen read this guide and wants it explained again in an even simpler way, in their own words, with a small everyday example. Do not repeat the numbered steps word for word. Guide:\n\n' + body
    : 'A senior citizen is reading this guide. Write the three questions they most likely still have, and answer each one in one or two short sentences. Guide:\n\n' + body;
  aiAsk(q, {
    modelTier:'default',
    cache:{gcTime:86400000},
    onText:function(u){
      out.innerHTML = '<div class="card"><p style="margin:0 0 8px;white-space:pre-wrap;line-height:1.6">'+esc(u.text)+'</p></div>';
    }
  }).then(function(r){
    out.innerHTML = '<div class="card"><p style="margin:0 0 10px;white-space:pre-wrap;line-height:1.6">'+esc(r.text)+'</p>'
      + '<button class="btn small alt" data-act="sayblob">🔊 '+esc(t('listen'))+'</button></div>';
    out.dataset.text = r.text;
  }).catch(function(e){
    out.innerHTML = '<div class="card"><p class="muted" style="margin:0">'+esc(e && e.code==='not_granted' ? t('aiOff') : t('aiErr'))+'</p></div>';
  });
}

/* ---------- me / settings ---------- */
function viewMe(){
  var dark = S.data.theme === 'dark';
  return '<div class="scroll">' + head(t('meT'),'home')
    + '<div class="pad">'
    + '<label class="f">'+esc(t('yourName'))+'</label>'
    + '<input class="t" id="nameEdit" value="'+esc(S.data.name)+'">'
    + '<button class="btn small" style="margin:10px 0 20px" data-act="savename">'+esc(t('save'))+'</button>'
    + '<label class="f">'+esc(t('lang'))+'</label>'
    + '<div class="langswitch" style="margin-bottom:18px">'
      + '<button class="langopt" style="flex:1" data-act="lang" data-arg="en" data-active="'+(S.data.lang==='en')+'">English</button>'
      + '<button class="langopt" style="flex:1" data-act="lang" data-arg="tl" data-active="'+(S.data.lang==='tl')+'">Tagalog</button>'
    + '</div>'
    + '<div class="slider-row"><span class="l" style="font-weight:700">'+esc(t('textSize'))+'</span>'
      + '<input type="range" min="0.9" max="1.5" step="0.05" value="'+S.data.scale+'" data-act="scale"></div>'
    + '<div class="slider-row"><span class="l" style="font-weight:700">'+esc(t('voiceSpeed'))+'</span>'
      + '<input type="range" min="0.6" max="1.1" step="0.05" value="'+S.data.rate+'" data-act="rate">'
      + '</div>'
    + '<div id="voiceStatus">'+voiceStatusHtml()+'</div>'
    + '<button class="toggle-row" data-act="theme"><span><span class="l">'+esc(t('dark'))+'</span><br><span class="muted">'+esc(t('darkS'))+'</span></span>'
      + '<span class="track '+(dark?'on':'')+'"><span class="thumb"></span></span></button>'
    + '<button class="listitem" style="margin-bottom:14px" data-act="go" data-arg="account">'
      + '<span class="dot">'+(S.data.account?'✅':'👤')+'</span>'
      + '<div><h4>'+esc(S.data.account ? S.data.account.email : t('signIn'))+'</h4>'
      + '<p>'+esc(S.data.account ? t('syncOn') : t('syncOff'))+'</p></div><span class="chev">›</span></button>'
    + (S.data.account && S.data.account.role === 'admin'
        ? '<a class="listitem" href="admin.html" style="text-decoration:none;margin-bottom:14px">'
          + '<span class="dot">🛠️</span><div><h4>'+esc(t('adminT'))+'</h4><p>'+esc(t('adminS'))+'</p></div>'
          + '<span class="chev">›</span></a>'
        : '')
    + '<button class="listitem" style="margin-bottom:14px" data-act="tourstart">'
      + '<span class="dot">\uD83D\uDC4B</span>'
      + '<div><h4>'+esc(t('tourAgain'))+'</h4><p>'+esc(t('tourAgainS'))+'</p></div>'
      + '<span class="chev">\u203A</span></button>'
    + certShelfHtml()
    + badgeShelfHtml()
    + '<div class="card" style="margin-top:16px"><h4 style="font-family:\'Baloo 2\';margin:0 0 6px">'+esc(t('progress',{a:doneCount(), b:TUT.length}))+'</h4>'
      + '<p class="muted" style="margin:0">🔥 '+esc(t('streakT',{n:S.data.streak}))+'</p></div>'
    + '</div></div>' + nav('me');
}

/* ---------- badge shelf ----------
   Every badge is drawn, earned or not. Seeing the empty ones is what makes
   the earned ones mean anything, and it shows there is more to come. */
function badgeShelfHtml(){
  S.data.badges = S.data.badges || {};
  var won = 0;
  var cells = BADGES.map(function(b){
    var have = !!S.data.badges[b.id];
    if(have) won++;
    return '<div style="text-align:center;width:72px;margin:6px 4px">'
      + '<div style="font-size:1.9rem;line-height:1.1;opacity:' + (have ? '1' : '.22') + '">' + b.icon + '</div>'
      + '<p class="muted" style="margin:2px 0 0;font-size:.68rem;line-height:1.25">' + esc(t('badge_'+b.id)) + '</p>'
      + '</div>';
  }).join('');
  return '<div class="card" style="margin-top:16px">'
    + '<h4 style="font-family:\'Baloo 2\';margin:0 0 2px">' + esc(t('badgesT')) + ' (' + won + '/' + BADGES.length + ')</h4>'
    + '<p class="muted" style="margin:0 0 8px;font-size:.82rem">' + esc(t('badgesS')) + '</p>'
    + '<div style="display:flex;flex-wrap:wrap;justify-content:center">' + cells + '</div>'
    + '</div>';
}

/* ---------- first-run walkthrough ----------
   Shown once, right after the name is entered. It answers the problem the
   app itself creates: someone who does not know how to use a phone has to
   learn this app before it can teach them anything. One idea per screen,
   large type, and every card is read out loud without being asked, since
   the whole point is that reading may be the hard part. */
var TOUR = [
  {icon:'\uD83D\uDC4B', t:'tour1T', b:'tour1B'},
  {icon:'\uD83D\uDC47', t:'tour2T', b:'tour2B'},
  {icon:'\uD83D\uDD0A', t:'tour3T', b:'tour3B'},
  {icon:'\uD83D\uDD0E', t:'tour4T', b:'tour4B'},
  {icon:'\uD83D\uDCA1', t:'tour5T', b:'tour5B'},
  {icon:'\u2705', t:'tour6T', b:'tour6B'}
];
function viewTour(){
  var i = S.tour || 0;
  if(i >= TOUR.length) i = TOUR.length - 1;
  var c = TOUR[i];
  var last = i === TOUR.length - 1;
  var title = t(c.t, {n: S.data.name || t('friend')});
  var body  = t(c.b);

  var dots = TOUR.map(function(_, k){
    return '<span style="display:inline-block;width:9px;height:9px;border-radius:50%;margin:0 4px;'
      + 'background:' + (k === i ? 'var(--teal)' : 'var(--line)') + '"></span>';
  }).join('');

  return '<div class="scroll" style="display:flex;flex-direction:column;padding:26px 24px">'
    + '<div style="text-align:right;min-height:34px">'
      + (last ? '' : '<button class="btn small ghost" style="width:auto;padding:8px 14px" data-act="tourskip">'
          + esc(t('tourSkip')) + '</button>')
    + '</div>'
    + '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center">'
      + '<div style="font-size:4rem;line-height:1.1;margin-bottom:14px">' + c.icon + '</div>'
      + '<h1 style="font-family:\'Baloo 2\';font-weight:800;font-size:1.55rem;margin:0 0 12px">' + esc(title) + '</h1>'
      + '<p style="font-size:1.12rem;line-height:1.65;margin:0 auto;max-width:420px">' + esc(body) + '</p>'
      + '<div style="height:18px"></div>'
      + '<button class="btn small ghost" id="tourSayBtn" style="width:auto;padding:10px 16px;margin:0 auto" data-act="toursay">'
        + '\uD83D\uDD0A ' + esc(t('listen')) + '</button>'
    + '</div>'
    + '<div style="text-align:center;margin:18px 0 10px">' + dots + '</div>'
    + '<button class="btn" data-act="tournext">' + esc(last ? t('tourDone') : t('tourNext')) + '</button>'
    + (i > 0 ? '<div style="height:9px"></div><button class="btn ghost" data-act="tourprev">'
        + esc(t('tourBack')) + '</button>' : '')
    + '<div style="height:10px"></div>'
    + '</div>';
}
/* Reading the card aloud is done here rather than inside viewTour, because
   render() runs for every small change and would otherwise start the voice
   over and over on the same card. */
var tourSpoken = -1;
function speakTourCard(force){
  var i = S.tour || 0;
  if(!force && tourSpoken === i) return;
  tourSpoken = i;
  var c = TOUR[i]; if(!c) return;
  try{
    warmUp();
    speakList([t(c.t, {n: S.data.name || t('friend')}), t(c.b)]);
  }catch(e){}
}

/* ---------- opening the real app ----------
   A guide about Messenger can end with a button that actually opens
   Messenger. Plain https links are used rather than custom schemes such as
   fb-messenger:// because Android hands a normal link to the installed app
   when there is one, and falls back to the browser when there is not, so
   nothing dead-ends.

   The button always sits UNDER the guide, never instead of it. Dropping an
   older person straight into Messenger without showing them what to do
   first is how they end up stuck on a screen they did not ask for. */
var APP_LINKS = {
  fb:  {url:'https://www.facebook.com',  key:'openFB'},
  msg: {url:'https://www.messenger.com', key:'openMsg'}
};
function openAppBtn(g){
  var a = APP_LINKS[g.cat];
  if(!a) return '';
  return '<div style="height:8px"></div>'
    + '<a class="btn small ghost" style="width:auto;padding:10px 14px;display:inline-block;text-decoration:none" '
      + 'href="' + esc(a.url) + '" target="_blank" rel="noopener">' + esc(t(a.key)) + '</a>';
}

/* ---------- certificate ----------
   Finishing a whole category earns something with the person's own name on
   it. Badges live inside the app and only they ever see them; a certificate
   is made to be shown to the family, and for a Filipino senior that
   recognition carries far more weight than a score.

   It is drawn as a screen rather than a file so it works offline and can
   simply be screenshotted, which is what most people will do anyway. */
function catIsDone(catId){
  var list = TUT.filter(function(x){ return x.cat === catId; });
  return list.length > 0 && list.every(function(x){ return !!S.data.done[x.id]; });
}
function certHtml(catId){
  var cat = CATS.filter(function(c){ return c.id === catId; })[0];
  if(!cat) return '';
  var when = new Date().toLocaleDateString(S.data.lang === 'tl' ? 'fil-PH' : 'en-US',
             {year:'numeric', month:'long', day:'numeric'});
  return '<div class="backdrop"><div class="modal" style="max-width:420px;padding:0;overflow:hidden">'
    + '<div id="certCard" style="background:var(--bg);padding:26px 22px;text-align:center;'
      + 'border:6px double var(--teal)">'
      + '<p class="muted" style="margin:0;letter-spacing:.18em;font-size:.72rem">TANDA</p>'
      + '<p style="margin:2px 0 14px;font-size:.78rem;color:var(--ink-soft)">' + esc(t('certTop')) + '</p>'
      + '<div style="font-size:2.6rem;line-height:1.1">' + cat.icon + '</div>'
      + '<h2 style="font-family:\'Baloo 2\';font-weight:800;margin:10px 0 4px;font-size:1.35rem">'
        + esc(t('certTitle')) + '</h2>'
      + '<p class="muted" style="margin:0 0 12px;font-size:.86rem">' + esc(t('certFor')) + '</p>'
      + '<p style="font-family:\'Baloo 2\';font-weight:800;font-size:1.6rem;margin:0 0 4px;color:var(--teal)">'
        + esc(S.data.name || t('friend')) + '</p>'
      + '<div style="height:2px;background:var(--marigold);width:120px;margin:10px auto"></div>'
      + '<p style="margin:0 0 4px;font-size:1.02rem">' + esc(t('certBody', {cat: t(cat.label)})) + '</p>'
      + '<p class="muted" style="margin:10px 0 0;font-size:.8rem">' + esc(when) + '</p>'
    + '</div>'
    + '<div style="padding:14px">'
      + '<button class="btn" data-act="certshare">' + esc(t('certShare')) + '</button>'
      + '<div style="height:8px"></div>'
      + '<button class="btn ghost" data-act="certclose">' + esc(t('close')) + '</button>'
      + '<p class="muted" style="margin:10px 0 0;font-size:.78rem">' + esc(t('certHint')) + '</p>'
    + '</div>'
  + '</div></div>';
}

/* A certificate should not be a thing you see once and lose. Every one
   earned stays reachable from the Me screen, which is also where someone
   will look when they want to show it to a visiting grandchild. */
function certShelfHtml(){
  S.data.certs = S.data.certs || {};
  var got = CATS.filter(function(c){ return !!S.data.certs[c.id]; });
  if(!got.length) return '';
  return '<div class="card" style="margin-top:16px">'
    + '<h4 style="font-family:\'Baloo 2\';margin:0 0 8px">' + esc(t('certMine')) + '</h4>'
    + got.map(function(c){
        return '<button class="listitem" style="margin-bottom:8px" data-act="certopen" data-arg="' + c.id + '">'
          + '<span class="dot">' + c.icon + '</span>'
          + '<div><h4>' + esc(t(c.label)) + '</h4><p>' + esc(t('certTitle')) + '</p></div>'
          + '<span class="chev">\u203A</span></button>';
      }).join('')
    + '</div>';
}

/* ---------- the certificate as a picture ----------
   Sharing a sentence of text is not the same as sharing a certificate. What
   an older person wants to send their family is the thing itself, so it is
   drawn onto a canvas here and shared as an image.

   It is drawn rather than screenshotted so it comes out the same on every
   phone, at a size worth looking at, and without the status bar and the
   navigation buttons in it. */
/* The share link points at a small page rather than the app's home, because
   that page can do something a plain address cannot: hand off to TANDA when
   the person receiving it already has the app, and offer the download when
   they do not. */
var APP_LINK = 'https://tanda-tzlu.onrender.com/get.html';

function drawCertPng(catId){
  var cat = CATS.filter(function(c){ return c.id === catId; })[0];
  if(!cat) return null;

  var W = 1000, H = 700;
  var cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  var x = cv.getContext('2d');

  x.fillStyle = '#FBF3E6'; x.fillRect(0, 0, W, H);

  x.strokeStyle = '#1D4B45'; x.lineWidth = 8;
  x.strokeRect(26, 26, W-52, H-52);
  x.lineWidth = 2;
  x.strokeRect(44, 44, W-88, H-88);

  x.textAlign = 'center';

  x.fillStyle = '#6B5D52';
  x.font = '600 22px system-ui, sans-serif';
  x.fillText('T A N D A', W/2, 108);

  x.font = '400 20px system-ui, sans-serif';
  x.fillText(t('certTop'), W/2, 146);

  x.fillStyle = '#1D4B45';
  x.font = '800 46px system-ui, sans-serif';
  x.fillText(t('certTitle'), W/2, 226);

  x.fillStyle = '#6B5D52';
  x.font = '400 22px system-ui, sans-serif';
  x.fillText(t('certFor'), W/2, 280);

  x.fillStyle = '#2B2320';
  x.font = '800 62px system-ui, sans-serif';
  x.fillText(S.data.name || t('friend'), W/2, 356);

  x.fillStyle = '#E8A33D';
  x.fillRect(W/2 - 140, 386, 280, 6);

  x.fillStyle = '#2B2320';
  x.font = '400 26px system-ui, sans-serif';
  var line = t('certBody', {cat: t(cat.label)});
  /* Wrapped by hand: a long category name in Tagalog runs past the border
     otherwise, and canvas will not wrap for us. */
  var words = line.split(' '), cur = '', yy = 448;
  for(var i=0;i<words.length;i++){
    var test = cur ? cur + ' ' + words[i] : words[i];
    if(x.measureText(test).width > W - 200 && cur){
      x.fillText(cur, W/2, yy); yy += 38; cur = words[i];
    }else cur = test;
  }
  if(cur) x.fillText(cur, W/2, yy);

  var when = new Date().toLocaleDateString(S.data.lang === 'tl' ? 'fil-PH' : 'en-US',
             {year:'numeric', month:'long', day:'numeric'});
  x.fillStyle = '#6B5D52';
  x.font = '400 22px system-ui, sans-serif';
  x.fillText(when, W/2, H - 120);

  x.font = '400 19px system-ui, sans-serif';
  x.fillText(APP_LINK.replace('https://', ''), W/2, H - 76);

  return cv.toDataURL('image/png');
}

/* ================= RENDER ================= */
function h(html){ return html; }
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

function render(){
  var v = '';
  if(!S.data.name) v = viewWelcome();
  else if(S.screen === 'home') v = viewHome();
  else if(S.screen === 'games') v = viewGames();
  else if(S.screen === 'game') v = viewGame();
  else if(S.screen === 'learn') v = viewLearn();
  else if(S.screen === 'tutorial') v = viewTutorial();
  else if(S.screen === 'ask') v = viewAsk();
  else if(S.screen === 'me') v = viewMe();
  else if(S.screen === 'account') v = viewAccount();
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
    + '<p class="center" style="margin-top:16px"><button class="btn small ghost" data-act="go" data-arg="account">'+esc(t('signIn'))+'</button></p>'
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
  {id:'trivia', icon:'✨', tk:'triviaT', sk:'triviaS', ai:true}
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
      }).join('') + '</div></div>' + nav('learn');
}

/* ---------- tutorial ---------- */
function viewTutorial(){
  var x = tutById(S.tutorial);
  if(!x) return viewLearn();
  var done = !!S.data.done[x.id];
  var stepsHtml = x.steps.map(function(s, i){
    var txt = L(s);
    return '<div class="step" data-step="'+i+'"><span class="step-num">'+(i+1)+'</span>'
      + '<p style="flex:1">'+esc(txt)+'</p>'
      + '<button class="say" data-act="say" data-arg="'+i+'" aria-label="'+esc(t('readStep'))+'">🔊</button></div>';
  }).join('');
  return '<div class="scroll">' + head(x.icon + '  ' + L(x.title), 'learn')
    + '<div class="pad">'
    + (x.warn ? '<div class="warn">'+esc(L(x.sub))+'</div><div style="height:12px"></div>' : '')
    + '<div id="voiceStatus">'+voiceStatusHtml()+'</div>'
    + '<div class="card"><h4 style="font-family:\'Baloo 2\';margin:0 0 4px">'+esc(t('vcTitle'))+'</h4>'
      + '<p class="muted" style="margin:0 0 10px">'+esc(t('vcHint'))+'</p>'
      + '<button class="btn small alt" data-act="voicecheck">'+esc(t('vcRun'))+'</button></div>'
    + '<div id="vcOut"></div>'
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
function viewAsk(){
  var bubbles = chat.map(function(m, i){
    if(m.role === 'me') return '<div class="bub me">'+esc(m.text)+'</div>';
    return '<div class="bub ai" id="bub'+i+'">'+esc(m.text)+(m.pending?'':'<br><button class="say" data-act="sayai" data-arg="'+i+'">🔊 </button>')+'</div>';
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
      chat[idx].text = u.text; chat[idx].pending = true;
      var b = document.getElementById('bub'+idx);
      if(b){ b.textContent = u.text; scrollChat(); }
    }
  }).then(function(r){
    chat[idx] = {role:'ai', text:r.text};
    render();
  }).catch(function(e){
    chat[idx] = {role:'ai', text: e && e.text ? e.text : t('aiErr')};
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
      + '<button class="btn small ghost" style="margin-top:8px" data-act="testvoice">🔊 '+esc(t('voiceTest'))+'</button></div>'
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
    + '<div class="card" style="margin-top:16px"><h4 style="font-family:\'Baloo 2\';margin:0 0 6px">'+esc(t('progress',{a:doneCount(), b:TUT.length}))+'</h4>'
      + '<p class="muted" style="margin:0">🔥 '+esc(t('streakT',{n:S.data.streak}))+'</p></div>'
    + '</div></div>' + nav('me');
}

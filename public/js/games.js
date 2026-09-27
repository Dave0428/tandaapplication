/* ================= GAMES ================= */
function viewGame(){
  var body = '';
  if(S.game === 'match') body = gMatch();
  else if(S.game === 'puzzle') body = gPuzzle();
  else if(S.game === 'word') body = gWord();
  else if(S.game === 'math') body = gMath();
  else if(S.game === 'trivia') body = gTrivia();
  else if(S.game === 'blocks') body = gBlocks();
  var titleKey = (GAMES.filter(function(g){return g.id===S.game;})[0]||{}).tk || 'games';
  return '<div class="scroll">' + head(t(titleKey), 'games') + body + '</div>';
}
/* ---------- sound ----------
   Short tones made by the browser itself. No audio files to download, so
   this adds nothing to the size of the app and works with no connection.
   Older players get almost no feedback from a silent screen: a rising
   note for a correct move and a falling one for a wrong move tell them
   what happened without having to read anything. */
var AC = null;
function tone(freq, ms, delay, vol){
  try{
    if(!AC){
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if(!Ctx) return;
      AC = new Ctx();
    }
    if(AC.state === 'suspended') AC.resume();
    var t0 = AC.currentTime + (delay || 0);
    var osc = AC.createOscillator(), gain = AC.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.16, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + (ms/1000));
    osc.connect(gain); gain.connect(AC.destination);
    osc.start(t0); osc.stop(t0 + (ms/1000) + 0.02);
  }catch(e){}
}
function soundRight(){ tone(660, 120, 0); tone(880, 160, 0.10); }
function soundWrong(){ tone(300, 180, 0); }
function soundLevel(){ tone(784,110,0); tone(988,110,0.09); tone(1175,200,0.18); }
function soundWin(){ tone(523,150,0); tone(659,150,0.13); tone(784,150,0.26); tone(1047,320,0.39); }

/* ---------- badges ----------
   Earned once and kept. Small, visible proof that the time spent added up
   to something, which a score alone does not give. */
var BADGES = [
  {id:'first',   icon:'\uD83C\uDF1F', need:function(d){ return (d.plays||0) >= 1; }},
  {id:'five',    icon:'\uD83C\uDFAF', need:function(d){ return (d.plays||0) >= 5; }},
  {id:'twenty',  icon:'\uD83C\uDFC5', need:function(d){ return (d.plays||0) >= 20; }},
  {id:'streak3', icon:'\uD83D\uDD25', need:function(d){ return (d.streak||0) >= 3; }},
  {id:'streak7', icon:'\u2B50', need:function(d){ return (d.streak||0) >= 7; }},
  {id:'learn5',  icon:'\uD83D\uDCD6', need:function(d){ return doneCount() >= 5; }},
  {id:'learnAll',icon:'\uD83C\uDF93', need:function(d){ return doneCount() >= TUT.length; }}
];
function earnedBadges(){
  return BADGES.filter(function(b){ try{ return b.need(S.data); }catch(e){ return false; } });
}
/* Returns the badges won by the action that just happened, so the app can
   celebrate them once instead of every time the screen is drawn. */
function newBadges(){
  S.data.badges = S.data.badges || {};
  var fresh = earnedBadges().filter(function(b){ return !S.data.badges[b.id]; });
  fresh.forEach(function(b){ S.data.badges[b.id] = true; });
  if(fresh.length) save();
  return fresh;
}

function winModal(msg, score){
  S.data.plays = (S.data.plays||0)+1; save();
  soundWin();

  var fresh = newBadges();
  var badgeHtml = fresh.length
    ? '<div class="card" style="margin:10px 0 0;text-align:center">'
      + '<p class="muted" style="margin:0 0 6px;font-size:.85rem">' + esc(t('newBadge')) + '</p>'
      + fresh.map(function(b){
          return '<div style="font-size:2rem;line-height:1.1">'+b.icon+'</div>'
            + '<p style="margin:0;font-weight:700">'+esc(t('badge_'+b.id))+'</p>';
        }).join('')
      + '</div>'
    : '';

  var praise = t('praise'+(1 + Math.floor(Math.random()*3)), {n:S.data.name||t('friend')});

  S.modal = '<div class="backdrop"><div class="modal"><div class="ic">🏆</div>'
    + '<h3>'+esc(t('won'))+'</h3>'
    + '<p style="font-weight:700;font-size:1.05rem;margin:0 0 4px">'+esc(praise)+'</p>'
    + '<p>'+esc(msg || t('wonS',{n:S.data.name||t('friend')}))+'</p>'
    + badgeHtml
    + '<div style="height:10px"></div>'
    + '<button class="btn" data-act="replay">'+esc(t('restart'))+'</button>'
    + '<div style="height:9px"></div>'
    + '<button class="btn ghost" data-act="go" data-arg="games">'+esc(t('quit'))+'</button></div></div>';

  if(window.TandaAPI && S.game) TandaAPI.recordGame(S.game, score != null ? score : 1, {});
  render();

  /* Said out loud, because plenty of players will not stop to read it. */
  try{ speakOne(praise); }catch(e){}
}

/* --- tile match --- */
var MATCH_FACES = ['🥭','🌴','🐓','🚌','🌺','🐟','☀️','🥥'];
function initMatch(){
  var cards = MATCH_FACES.concat(MATCH_FACES).map(function(f,i){ return {f:f, id:i, up:false, done:false}; });
  for(var i=cards.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var tmp=cards[i]; cards[i]=cards[j]; cards[j]=tmp; }
  S.g = {cards:cards, moves:0, open:[], lock:false};
}
function gMatch(){
  if(!S.g.cards) initMatch();
  return '<div class="gamebar"><span>'+esc(t('moves'))+': '+S.g.moves+'</span><button class="btn small ghost" data-act="replay">'+esc(t('restart'))+'</button></div>'
    + '<div class="gwrap"><div class="match-grid">'
    + S.g.cards.map(function(c,i){
        var cls = c.done ? 'flip up matched' : (c.up ? 'flip up' : 'flip');
        return '<button class="'+cls+'" data-act="flip" data-arg="'+i+'">'+((c.up||c.done)?c.f:'')+'</button>';
      }).join('')
    + '</div><p class="muted center" style="margin-top:14px">'+esc(t('matchS'))+'</p></div>';
}
function flip(i){
  var g = S.g, c = g.cards[i];
  if(g.lock || c.up || c.done) return;
  c.up = true; g.open.push(i);
  if(g.open.length === 2){
    g.moves++;
    var a = g.cards[g.open[0]], b = g.cards[g.open[1]];
    if(a.f === b.f){
      a.done = b.done = true; g.open = [];
      soundRight();
      render();
      if(g.cards.every(function(x){return x.done;})) setTimeout(function(){ winModal(t('wonS',{n:S.data.name||t('friend')})+' ('+g.moves+' '+t('moves').toLowerCase()+')', g.moves); }, 400);
      return;
    }
    soundWrong();
    g.lock = true; render();
    setTimeout(function(){ a.up=false; b.up=false; g.open=[]; g.lock=false; render(); }, 850);
    return;
  }
  render();
}

/* --- number slide --- */
function initPuzzle(){
  var a = [1,2,3,4,5,6,7,8,0];
  do{ for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var tm=a[i]; a[i]=a[j]; a[j]=tm; } }while(!solvable(a) || solved(a));
  S.g = {tiles:a, moves:0};
}
function solvable(a){
  var inv=0, f=a.filter(function(x){return x;});
  for(var i=0;i<f.length;i++) for(var j=i+1;j<f.length;j++) if(f[i]>f[j]) inv++;
  return inv % 2 === 0;
}
function solved(a){ for(var i=0;i<8;i++) if(a[i] !== i+1) return false; return a[8]===0; }
function gPuzzle(){
  if(!S.g.tiles) initPuzzle();
  return '<div class="gamebar"><span>'+esc(t('moves'))+': '+S.g.moves+'</span><button class="btn small ghost" data-act="replay">'+esc(t('restart'))+'</button></div>'
    + '<div class="gwrap"><div class="puz-grid">'
    + S.g.tiles.map(function(n,i){
        return n ? '<button class="puz" data-act="slide" data-arg="'+i+'">'+n+'</button>' : '<button class="puz blank" disabled></button>';
      }).join('')
    + '</div><p class="muted center" style="margin-top:16px">'+esc(t('puzS'))+'</p></div>';
}
function slide(i){
  var a = S.g.tiles, b = a.indexOf(0);
  var r1=Math.floor(i/3), c1=i%3, r2=Math.floor(b/3), c2=b%3;
  if(Math.abs(r1-r2)+Math.abs(c1-c2) !== 1) return;
  a[b]=a[i]; a[i]=0; S.g.moves++;
  render();
  if(solved(a)) setTimeout(function(){ winModal(t('wonS',{n:S.data.name||t('friend')}), S.g.moves); }, 300);
}

/* --- word builder --- */
var WORDS = {
  en:[['MARKET','Where you buy vegetables'],['FAMILY','Your closest people'],['GARDEN','Where plants grow'],['SUNRISE','Morning light'],['FRIEND','A person you trust'],['KITCHEN','Where you cook'],['MEDICINE','You take it when sick'],['MESSAGE','You send it on the phone']],
  tl:[['PALENGKE','Bilihan ng gulay'],['PAMILYA','Ang pinakamalapit sa iyo'],['HARDIN','Tinutubuan ng halaman'],['UMAGA','Bago ang tanghali'],['KAIBIGAN','Taong pinagkakatiwalaan'],['KUSINA','Lutuan ng pagkain'],['GAMOT','Iniinom kapag may sakit'],['SULAT','Ipinapadala sa telepono']]
};
function initWord(){
  var pool = WORDS[S.data.lang] || WORDS.en;
  var pick = pool[Math.floor(Math.random()*pool.length)];
  var letters = pick[0].split('');
  for(var i=letters.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var tm=letters[i]; letters[i]=letters[j]; letters[j]=tm; }
  S.g = {word:pick[0], clue:pick[1], pool:letters.map(function(c,i){return {c:c,used:false,i:i};}), answer:[], wrong:false};
}
function gWord(){
  if(!S.g.word) initWord();
  var g = S.g;
  var slots = '';
  for(var i=0;i<g.word.length;i++){
    var v = g.answer[i];
    slots += v ? '<button class="ltile filled" data-act="unpick" data-arg="'+i+'">'+v.c+'</button>'
               : '<span class="ltile empty"></span>';
  }
  return '<div class="gwrap">'
    + '<div class="card center"><p class="muted" style="margin:0">'+esc(t('hint'))+'</p><p style="font-family:\'Baloo 2\';font-weight:700;font-size:1.15rem;margin:6px 0 0">'+esc(g.clue)+'</p></div>'
    + '<div class="answer-row">'+slots+'</div>'
    + '<div class="pool">'+ g.pool.map(function(p,i){
        return p.used ? '' : '<button class="ltile" data-act="pick" data-arg="'+i+'">'+p.c+'</button>';
      }).join('') +'</div>'
    + (g.wrong ? '<p class="center" style="color:var(--terracotta);font-weight:700">✗</p>' : '')
    + '<div class="row"><button class="btn ghost" data-act="clearword">'+esc(t('clear'))+'</button>'
    + '<button class="btn" data-act="checkword">'+esc(t('check'))+'</button></div>'
    + '<div style="height:10px"></div>'
    + '<button class="btn small ghost" data-act="replay">'+esc(t('restart'))+'</button></div>';
}

/* --- quick math --- */
/* ---------- endless number game ----------
   There is no last question. The sums keep coming and grow harder as the
   level rises; three wrong answers end the round. What a player chases is
   their own best score, which is a reason to open the app again tomorrow
   that a fixed ten-question quiz never gives. */
var MATH_LIVES = 3;
var MATH_LEVEL_EVERY = 5;   /* correct answers needed to move up a level */

function initMath(){
  S.g = {score:0, n:0, lives:MATH_LIVES, level:1, streak:0, over:false};
  nextMath();
}
function nextMath(){
  var lv = S.g.level || 1;
  /* The range grows with the level, so the first questions stay easy
     enough that a nervous player gets a few right before it bites. */
  var top = 9 + lv * 6;
  var a = 2 + Math.floor(Math.random()*top);
  var b = 1 + Math.floor(Math.random()*Math.max(2, Math.floor(top*0.7)));
  var ops = lv >= 3 ? ['+','-','\u00D7'] : (lv >= 2 ? ['+','-'] : ['+','-']);
  var op = ops[Math.floor(Math.random()*ops.length)];
  if(op === '\u00D7'){ a = 2+Math.floor(Math.random()*(3+lv)); b = 2+Math.floor(Math.random()*(3+lv)); }
  if(op === '-' && b > a){ var tmp=a; a=b; b=tmp; }
  var ans = op==='+' ? a+b : op==='-' ? a-b : a*b;

  /* More choices later on, but never so many that the buttons shrink. */
  var want = lv >= 4 ? 4 : 3;
  var opts = [ans];
  var guard = 0;
  while(opts.length < want && guard++ < 60){
    var spread = 3 + lv;
    var d = ans + (Math.floor(Math.random()*(spread*2+1)) - spread);
    if(d !== ans && d >= 0 && opts.indexOf(d) < 0) opts.push(d);
  }
  opts.sort(function(){ return Math.random()-.5; });
  S.g.q = {a:a, b:b, op:op, ans:ans, opts:opts, picked:null};
}

function mathBest(){ return (S.data.best && S.data.best.math) || 0; }
function mathSaveBest(){
  S.data.best = S.data.best || {};
  if(S.g.score > (S.data.best.math||0)){ S.data.best.math = S.g.score; save(); return true; }
  save(); return false;
}

/* Ends the round. Worth keeping separate from winModal: nobody won here,
   and telling an older player they lost is the fastest way to make them
   put the phone down. The wording stays on what they managed. */
function mathOver(){
  S.g.over = true;
  var isBest = mathSaveBest();
  S.data.plays = (S.data.plays||0)+1; save();
  soundWin();

  var fresh = newBadges();
  var badgeHtml = fresh.length
    ? '<div class="card" style="margin:10px 0 0;text-align:center">'
      + '<p class="muted" style="margin:0 0 6px;font-size:.85rem">'+esc(t('newBadge'))+'</p>'
      + fresh.map(function(b){
          return '<div style="font-size:2rem;line-height:1.1">'+b.icon+'</div>'
            + '<p style="margin:0;font-weight:700">'+esc(t('badge_'+b.id))+'</p>';
        }).join('')
      + '</div>'
    : '';

  var line = isBest ? t('newBest') : t('roundEndS', {n: S.data.name || t('friend')});

  S.modal = '<div class="backdrop"><div class="modal"><div class="ic">'
    + (isBest ? '\uD83C\uDF1F' : '\uD83D\uDC4F') + '</div>'
    + '<h3>'+esc(t('roundEnd'))+'</h3>'
    + '<p style="font-weight:700;font-size:1.05rem;margin:0 0 4px">'+esc(line)+'</p>'
    + '<p style="font-size:2rem;font-weight:800;margin:6px 0;color:var(--teal)">'+S.g.score+'</p>'
    + '<p class="muted" style="margin:0">'+esc(t('bestScore'))+': '+mathBest()+'</p>'
    + badgeHtml
    + '<div style="height:12px"></div>'
    + '<button class="btn" data-act="replay">'+esc(t('playAgain'))+'</button>'
    + '<div style="height:9px"></div>'
    + '<button class="btn ghost" data-act="go" data-arg="games">'+esc(t('quit'))+'</button></div></div>';

  if(window.TandaAPI) TandaAPI.recordGame('math', S.g.score, {level:S.g.level});
  render();
  try{ speakOne(line); }catch(e){}
}

function gMath(){
  if(!S.g.q) initMath();
  var q = S.g.q;
  var hearts = '';
  for(var i=0;i<MATH_LIVES;i++) hearts += (i < S.g.lives ? '\u2764\uFE0F' : '\uD83E\uDD0D');
  return '<div class="gamebar">'
      + '<span>'+esc(t('score'))+': '+S.g.score+'</span>'
      + '<span>'+esc(t('level'))+' '+S.g.level+'</span>'
      + '<span style="letter-spacing:2px">'+hearts+'</span>'
    + '</div>'
    + '<div class="gwrap"><div class="card center"><p style="font-family:\'Baloo 2\';font-weight:800;font-size:2.2rem;margin:8px 0">'
    + q.a+' '+q.op+' '+q.b+' = ?</p></div>'
    + q.opts.map(function(o){
        var cls = 'opt';
        if(q.picked !== null){ if(o===q.ans) cls+=' correct'; else if(o===q.picked) cls+=' wrong'; }
        return '<button class="'+cls+'" data-act="math" data-arg="'+o+'">'+o+'</button>';
      }).join('')
    + (q.picked!==null ? '<button class="btn" data-act="nextmath">'+esc(t('next'))+'</button>' : '')
    + '<p class="muted center" style="margin-top:12px;font-size:.85rem">'
      + esc(t('bestScore'))+': '+mathBest()+'</p>'
    + '</div>';
}

/* --- AI trivia --- */
var FALLBACK_Q = {
  en:[{q:'Which app do you use to make a video call to family?',o:['Messenger','Calculator','Camera'],a:0},
      {q:'Someone texts asking for your 6-digit code. What should you do?',o:['Send it quickly','Never send it','Ask for money'],a:1},
      {q:'What does the gear icon open?',o:['Settings','Music','Games'],a:0}],
  tl:[{q:'Anong app ang gamit sa video call sa pamilya?',o:['Messenger','Calculator','Camera'],a:0},
      {q:'May nag-text na humihingi ng 6 na numerong code. Ano ang gagawin mo?',o:['Ipadala agad','Huwag ipadala kailanman','Humingi ng pera'],a:1},
      {q:'Ano ang binubuksan ng gear na icon?',o:['Settings','Musika','Laro'],a:0}]
};
function startTrivia(){
  S.g = {loading:true, i:0, score:0, picked:null};
  render();
  var langWord = S.data.lang==='tl' ? 'Tagalog (simple, Taglish is fine)' : 'very simple English';
  var prompt = 'Write 6 quiz questions in ' + langWord + ' for a Filipino senior citizen who is learning to use a smartphone, Facebook and Messenger. '
    + 'Mix easy general knowledge about Filipino daily life with practical phone and online-safety questions. Keep every question under 18 words and every choice under 5 words. '
    + 'Reply with only a JSON array of 6 objects shaped like {"q": "question text", "o": ["choice1","choice2","choice3"], "a": 0} where a is the index of the correct choice.';
  if(!aiReady()){ S.g = {qs: FALLBACK_Q[S.data.lang]||FALLBACK_Q.en, i:0, score:0, picked:null}; render(); return; }

  var settled = false;
  var fallbackTimer = setTimeout(function(){
    if(settled) return;
    settled = true;
    // Slow connection or a busy model: don't leave someone staring at
    // "Writing your questions..." indefinitely. Start with the
    // ready-made set now; the AI-written ones just aren't worth the wait.
    S.g = {qs: FALLBACK_Q[S.data.lang]||FALLBACK_Q.en, i:0, score:0, picked:null};
    render();
  }, 8000);

  // 'quick' (Haiku) is plenty for six short trivia questions, and answers
  // noticeably faster than the default model.
  TandaAI.json(prompt, {modelTier:'quick', cache:false}).then(function(list){
    if(settled) return;
    clearTimeout(fallbackTimer);
    settled = true;
    var ok = Array.isArray(list) ? list.filter(function(x){ return x && x.q && Array.isArray(x.o) && x.o.length>=2; }) : [];
    S.g = {qs: ok.length ? ok : (FALLBACK_Q[S.data.lang]||FALLBACK_Q.en), i:0, score:0, picked:null};
    render();
  }).catch(function(){
    if(settled) return;
    clearTimeout(fallbackTimer);
    settled = true;
    S.g = {qs: FALLBACK_Q[S.data.lang]||FALLBACK_Q.en, i:0, score:0, picked:null, failed:true};
    render();
  });
}
function gTrivia(){
  if(S.g.loading || !S.g.qs) return '<div class="gwrap"><div class="card center"><span class="thinking"><span class="dot-anim"></span><span class="dot-anim"></span><span class="dot-anim"></span> '+esc(t('quizLoading'))+'</span></div>'
    + '<button class="btn ghost" style="margin-top:14px" data-act="usefallback">'+esc(t('useReadyQ'))+'</button></div>';
  var q = S.g.qs[S.g.i];
  if(!q) return '<div class="gwrap"><div class="card center"><p>'+esc(t('score'))+': '+S.g.score+' / '+S.g.qs.length+'</p>'
    + '<button class="btn" data-act="replay">'+esc(t('newQ'))+'</button></div></div>';
  return '<div class="gamebar"><span>'+esc(t('score'))+': '+S.g.score+'</span><span>'+esc(t('question'))+' '+(S.g.i+1)+'/'+S.g.qs.length+'</span></div>'
    + '<div class="gwrap"><div class="card"><p style="font-family:\'Baloo 2\';font-weight:700;font-size:1.15rem;margin:0;line-height:1.4">'+esc(q.q)+'</p>'
    + '<button class="btn small ghost" style="margin-top:10px" data-act="sayq">🔊</button></div>'
    + q.o.map(function(o, i){
        var cls='opt';
        if(S.g.picked !== null){ if(i===q.a) cls+=' correct'; else if(i===S.g.picked) cls+=' wrong'; }
        return '<button class="'+cls+'" data-act="triv" data-arg="'+i+'">'+esc(o)+'</button>';
      }).join('')
    + (S.g.picked!==null ? '<button class="btn" data-act="nexttriv">'+esc(t('next'))+'</button>' : '')
    + '</div>';
}

/* ---------- falling blocks ----------
   The endless one. Shapes drop, full rows disappear, and the round ends
   when the stack reaches the top. Everything here is sized for a phone
   held in one hand and for hands that are not quick: ten columns instead
   of the usual ten-by-twenty tower, a slow first speed, and four buttons
   large enough to hit without looking.

   It does not go through render(). A full redraw of the shell sixty times
   a round would be wasteful and would fight the tap handlers, so the tick
   repaints only the cells. The loop stops itself when the board element
   is gone from the page, which covers every way out of the screen without
   needing navigation code to know about the game. */
var BW = 10, BH = 16;
var BLOCK_TICK_START = 900;   /* ms per drop at level 1 */
var BLOCK_TICK_MIN   = 380;
var blockTimer = null;

var SHAPES = [
  {c:'#4C8C7F', m:[[1,1,1,1]]},                 /* line  */
  {c:'#E8A33D', m:[[1,1],[1,1]]},               /* square */
  {c:'#D9614F', m:[[0,1,0],[1,1,1]]},           /* T */
  {c:'#4C7A5C', m:[[0,1,1],[1,1,0]]},           /* S */
  {c:'#C6822A', m:[[1,1,0],[0,1,1]]},           /* Z */
  {c:'#
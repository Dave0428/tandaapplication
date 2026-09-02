/* ================= TANDA ================= */
var shell = document.getElementById('shell');

/* ---------- storage ---------- */
var KEY = 'tanda.v2';
function load(){ try{ var r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; }catch(e){ return null; } }
function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(S.data)); }catch(e){}
  if(window.TandaAPI && TandaAPI.scheduleSync) TandaAPI.scheduleSync(S.data);
}

var today = new Date().toISOString().slice(0,10);
var S = {
  screen:'home', tutorial:null, cat:'phone', game:null, g:{}, modal:null, ai:null,
  data: load() || { name:'', lang:'en', theme:'auto', scale:1, rate:.85, streak:0, last:'', done:{}, plays:0, best:{} }
};
S.data.account = S.data.account || null;   /* {id, email, name} when signed in */
if(S.data.rate == null) S.data.rate = .85;
/* streak */
(function(){
  var d = S.data;
  if(d.last !== today){
    var y = new Date(Date.now()-86400000).toISOString().slice(0,10);
    d.streak = (d.last === y) ? (d.streak||0)+1 : 1;
    d.last = today; save();
  }
})();
function applyPrefs(){
  document.documentElement.style.setProperty('--scale', S.data.scale);
  if(S.data.theme === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', S.data.theme);
}
applyPrefs();

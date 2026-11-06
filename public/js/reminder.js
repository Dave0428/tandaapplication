/* ================= REMINDERS =================
Card ng paalala at appointments sa home, serbisyo sa home, at emergency contacts sa me.
Hindi ginagalaw ang ui.js: idinadagdag lang ang card pagkatapos mag-render.
Kung may sira ang file na ito, hindi mablablangko ang app. */
(function(){
  var API = 'https://tanda-tzlu.onrender.com/api/me';
  var TOKEN_KEY = 'tanda.token';
  var cache = {appts: null, contacts: null, services: null, loadedAt: 0};

  function esc2(s){
    return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
    });
  }
  function token(){
    try{ return localStorage.getItem(TOKEN_KEY); }catch(e){ return null; }
  }
  function get(path){
    var tok = token();
    if(!tok) return Promise.resolve(null);
    return fetch(API + path, {headers: {'Authorization': 'Bearer ' + tok}})
      .then(function(r){ return r.ok ? r.json() : null; })
      .catch(function(){ return null; });
  }
  function refresh(){
    if(!token()) return;
    if(Date.now() - cache.loadedAt < 5 * 60 * 1000) return;
    cache.loadedAt = Date.now();
    Promise.all([get('/appointments'), get('/contacts'), get('/services')]).then(function(res){
      cache.appts = res[0] ? res[0].rows : [];
      cache.contacts = res[1] ? res[1].rows : [];
      cache.services = res[2] ? res[2].rows : [];
      if(window.S && (S.screen === 'home' || S.screen === 'me')) window.render();
    });
  }
  function soon(a){
    var ms = new Date(a.starts_at).getTime() - Date.now();
    return ms >= 0 && ms <= 24 * 3600 * 1000;
  }
  function fmt(iso){
    try{
      var lang = (window.S && S.data && S.data.lang === 'tl') ? 'fil-PH' : 'en-US';
      return new Date(iso).toLocaleString(lang, {weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit', timeZone:'Asia/Manila'});
    }catch(e){ return String(iso); }
  }

  function apptHtml(){
    var appts = cache.appts || [];
    if(!appts.length) return '';
    var due = appts.filter(soon);
    var html = '';
    if(due.length){
      html += '<div class="warn" style="margin-bottom:14px"><strong>Paalala:</strong><br>'
        + due.map(function(a){ return esc2(a.title) + ' · ' + esc2(fmt(a.starts_at)); }).join('<br>')
        + '</div>';
    }
    html += '<div class="card" style="margin-bottom:14px"><h4 style="font-family:\'Baloo 2\';margin:0 0 8px">Mga appointment ko</h4>'
      + appts.slice(0, 5).map(function(a){
        return '<p style="margin:0 0 8px"><strong>' + esc2(fmt(a.starts_at)) + '</strong><br>' + esc2(a.title) + '</p>';
      }).join('') + '</div>';
    return html;
  }

  function servicesHtml(){
    var rows = cache.services || [];
    if(!rows.length) return '';
    return '<div class="card" style="margin-bottom:14px"><h4 style="font-family:\'Baloo 2\';margin:0 0 8px">Serbisyo</h4>'
      + rows.map(function(s){
        return '<p style="margin:0 0 10px"><strong>' + esc2(s.name) + '</strong>'
          + (s.category ? ' (' + esc2(s.category) + ')' : '') + '<br>'
          + (s.address ? esc2(s.address) + '<br>' : '')
          + (s.hours ? '<span class="muted">' + esc2(s.hours) + '</span><br>' : '')
          + (s.phone ? '<a href="tel:' + esc2(s.phone) + '" style="display:inline-block;margin-top:4px;padding:10px 14px;border-radius:11px;background:var(--teal);color:#fff;font-weight:700;text-decoration:none">📞 ' + esc2(s.phone) + '</a>' : '')
          + '</p>';
      }).join('') + '</div>';
  }

  function homeHtml(){
    return apptHtml() + servicesHtml();
  }

  function meHtml(){
    var rows = cache.contacts || [];
    if(!rows.length) return '';
    return '<div class="card" style="margin-bottom:14px"><h4 style="font-family:\'Baloo 2\';margin:0 0 8px">Emergency contacts ko</h4>'
      + rows.map(function(c){
        return '<p style="margin:0 0 10px"><strong>' + esc2(c.name) + '</strong>'
          + (c.relationship ? ' (' + esc2(c.relationship) + ')' : '') + '<br>'
          + '<a href="tel:' + esc2(c.phone) + '" style="display:inline-block;margin-top:4px;padding:10px 14px;border-radius:11px;background:var(--teal);color:#fff;font-weight:700;text-decoration:none">📞 ' + esc2(c.phone) + '</a></p>';
      }).join('') + '</div>';
  }

  function decorate(){
    var shell = document.getElementById('shell');
    if(!shell || !token()) return;
    refresh();
    if(S.screen === 'home'){
      var hdr = shell.querySelector('.header');
      var html = homeHtml();
      if(hdr && html) hdr.insertAdjacentHTML('afterend', '<div id="remBox">' + html + '</div>');
    }
    if(S.screen === 'me'){
      var tg = shell.querySelector('.toggle-row');
      var em = meHtml();
      if(tg && em) tg.insertAdjacentHTML('beforebegin', '<div id="emBox">' + em + '</div>');
    }
  }

  var orig = window.render;
  if(typeof orig === 'function'){
    window.render = function(){
      orig.apply(this, arguments);
      try{ decorate(); }catch(e){ console.error('reminders:', e); }
    };
  }
})();
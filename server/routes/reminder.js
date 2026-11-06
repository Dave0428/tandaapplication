/* ================= REMINDERS =================
Paparating na appointments at emergency contacts ng naka-login na user.
Kinukuha sa server (/api/me). Kung walang account o walang server, walang lalabas. */
(function(){
  var cache = { appts: null, contacts: null, loadedAt: 0 };
  var TOKEN_KEY = 'tanda.token';

  function authed(){ try{ return localStorage.getItem(TOKEN_KEY); }catch(e){ return null; } }
  function get(path){
    var tok = authed();
    if(!tok) return Promise.resolve(null);
    return fetch((window.TANDA_API_BASE || '') + '/api/me' + path, {
      headers: {'Authorization': 'Bearer ' + tok}
    }).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; });
  }

  function refresh(){
    if(Date.now() - cache.loadedAt < 5 * 60 * 1000) return;
    cache.loadedAt = Date.now();
    Promise.all([get('/appointments'), get('/contacts')]).then(function(res){
      cache.appts = res[0] ? res[0].rows : null;
      cache.contacts = res[1] ? res[1].rows : null;
      if(S.screen === 'home' || S.screen === 'me') render();
    });
  }

  function soon(a){
    var ms = new Date(a.starts_at).getTime() - Date.now();
    return ms >= 0 && ms <= 24 * 3600 * 1000;
  }
  function fmt(iso){
    try{
      return new Date(iso).toLocaleString(S.data.lang === 'tl' ? 'fil-PH' : 'en-US',
        {weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit', timeZone:'Asia/Manila'});
    }catch(e){ return iso; }
  }

  /* Home: paalala sa loob ng 24 oras, at listahan ng paparating. */
  window.remindersHtml = function(){
    refresh();
    var appts = cache.appts || [];
    if(!authed() || !appts.length) return '';
    var due = appts.filter(soon);
    var html = '';
    if(due.length){
      html += '<div class="warn" style="margin-bottom:14px"><strong>Paalala:</strong><br>'
        + due.map(function(a){ return esc(a.title) + ' · ' + esc(fmt(a.starts_at)); }).join('<br>')
        + '</div>';
    }
    html += '<div class="card" style="margin-bottom:14px"><h4 style="font-family:\'Baloo 2\';margin:0 0 8px">Mga appointment ko</h4>'
      + appts.slice(0, 5).map(function(a){
        return '<p style="margin:0 0 8px"><strong>' + esc(fmt(a.starts_at)) + '</strong><br>' + esc(a.title) + '</p>';
      }).join('')
      + '</div>';
    return html;
  };

  /* Me: emergency contacts na may tap-to-call. */
  window.emergencyHtml = function(){
    refresh();
    var rows = cache.contacts || [];
    if(!authed() || !rows.length) return '';
    return '<div class="card" style="margin-bottom:14px"><h4 style="font-family:\'Baloo 2\';margin:0 0 8px">Emergency contacts ko</h4>'
      + rows.map(function(c){
        return '<p style="margin:0 0 10px"><strong>' + esc(c.name) + '</strong>'
          + (c.relationship ? ' (' + esc(c.relationship) + ')' : '') + '<br>'
          + '<a href="tel:' + esc(c.phone) + '" style="display:inline-block;margin-top:4px;padding:10px 14px;'
          + 'border-radius:11px;background:var(--teal);color:#fff;font-weight:700;text-decoration:none">📞 ' + esc(c.phone) + '</a></p>';
      }).join('')
      + '</div>';
  };
})();
/* ================= REMINDERS + SENIOR CARDS =================
Home: Paalala sa itaas; Mga appointment at Serbisyo sa ibaba.
Me: Emergency contacts.
Nagdaragdag lang ng card pagkatapos mag-render, hindi ginagalaw ang ui.js.
English at Tagalog ayon sa setting ng app. */
(function(){
  var API = 'https://tanda-tzlu.onrender.com/api/me';
  var TOKEN_KEY = 'tanda.token';
  var cache = {appts: null, contacts: null, services: null, loadedAt: 0};

  var L = {
    en: {reminder:'Reminder', appts:'My appointments', noAppts:'No appointments yet',
         services:'Services', call:'Call', emergency:'My emergency contacts',
         relation:'', category:'', hours:'Hours'},
    tl: {reminder:'Paalala', appts:'Mga appointment ko', noAppts:'Wala pang appointment',
         services:'Serbisyo', call:'Tawagan', emergency:'Mga emergency contact ko',
         relation:'', category:'', hours:'Oras'}
  };
  function tr(k){
    var lang = (window.S && S.data && S.data.lang === 'tl') ? 'tl' : 'en';
    return L[lang][k] || '';
  }
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

  /* ---------- shared look ---------- */
  var CARD = 'background:#fff;border-radius:24px;padding:20px 20px 18px;margin:0 0 16px;'
    + 'box-shadow:0 2px 0 #e4dccd,0 8px 20px rgba(31,74,70,.08);';
  var HEAD = 'display:flex;align-items:center;gap:12px;margin:0 0 14px;';
  var BADGE = function(icon, bg){
    return '<span style="flex:0 0 auto;width:44px;height:44px;border-radius:14px;background:'+bg+';'
      + 'display:flex;align-items:center;justify-content:center;font-size:22px">'+icon+'</span>';
  };
  var TITLE = function(txt){
    return '<h3 style="margin:0;font-family:\'Baloo 2\',sans-serif;font-size:21px;line-height:1.1;color:#2a2220">'+esc2(txt)+'</h3>';
  };
  var ROW = 'padding:14px 0;border-top:1px solid #efe8da;';
  var PILL = 'display:inline-block;font-size:13px;font-weight:700;padding:3px 10px;border-radius:999px;'
    + 'background:#f6ead2;color:#7a5a1f;margin-left:6px;vertical-align:middle;';
  var CALL = 'display:flex;align-items:center;justify-content:center;gap:8px;width:100%;box-sizing:border-box;'
    + 'margin-top:12px;padding:15px;border-radius:16px;background:var(--teal,#1f4a46);color:#fff;'
    + 'font-weight:800;font-size:18px;text-decoration:none;letter-spacing:.2px;';

  /* ---------- Paalala (top) ---------- */
  function paalalaHtml(){
    var due = (cache.appts || []).filter(soon);
    if(!due.length) return '';
    return '<div class="warn" style="margin-bottom:14px"><strong>'+esc2(tr('reminder'))+':</strong><br>'
      + due.map(function(a){ return esc2(a.title) + ' · ' + esc2(fmt(a.starts_at)); }).join('<br>')
      + '</div>';
  }

  /* ---------- Appointments (bottom) ---------- */
  function apptsHtml(){
    var appts = cache.appts || [];
    var body = appts.length
      ? appts.slice(0, 5).map(function(a, i){
          return '<div style="'+(i ? ROW : '')+'padding-top:'+(i?'14px':'0')+'">'
            + '<div style="font-size:15px;color:#7a6d5f;font-weight:700">'+esc2(fmt(a.starts_at))+'</div>'
            + '<div style="font-size:19px;color:#2a2220;margin-top:2px">'+esc2(a.title)+'</div></div>';
        }).join('')
      : '<p style="margin:0;color:#7a6d5f;font-size:17px">'+esc2(tr('noAppts'))+'</p>';
    return '<div style="'+CARD+'">'
      + '<div style="'+HEAD+'">'+BADGE('📅','#f6ead2')+TITLE(tr('appts'))+'</div>'
      + body + '</div>';
  }

  /* ---------- Serbisyo (bottom) ---------- */
  function servicesHtml(){
    var rows = cache.services || [];
    if(!rows.length) return '';
    var items = rows.map(function(s, i){
      return '<div style="'+(i ? ROW : '')+'">'
        + '<div style="font-size:19px;font-weight:800;color:#2a2220">'+esc2(s.name)
        + (s.category ? '<span style="'+PILL+'">'+esc2(s.category)+'</span>' : '') + '</div>'
        + (s.address ? '<div style="font-size:16px;color:#5b5047;margin-top:4px">'+esc2(s.address)+'</div>' : '')
        + (s.hours ? '<div style="font-size:15px;color:#7a6d5f;margin-top:2px">'+esc2(tr('hours'))+': '+esc2(s.hours)+'</div>' : '')
        + (s.phone ? '<a href="tel:'+esc2(s.phone)+'" style="'+CALL+'">📞 '+esc2(tr('call'))+' '+esc2(s.phone)+'</a>' : '')
        + '</div>';
    }).join('');
    return '<div style="'+CARD+'">'
      + '<div style="'+HEAD+'">'+BADGE('🏥','#dff0e8')+TITLE(tr('services'))+'</div>'
      + items + '</div>';
  }

  /* ---------- Emergency contacts (Me) ---------- */
  function meHtml(){
    var rows = cache.contacts || [];
    if(!rows.length) return '';
    var items = rows.map(function(c, i){
      return '<div style="'+(i ? ROW : '')+'">'
        + '<div style="font-size:19px;font-weight:800;color:#2a2220">'+esc2(c.name)
        + (c.relationship ? '<span style="'+PILL+'">'+esc2(c.relationship)+'</span>' : '') + '</div>'
        + '<a href="tel:'+esc2(c.phone)+'" style="'+CALL+'">📞 '+esc2(tr('call'))+' '+esc2(c.phone)+'</a>'
        + '</div>';
    }).join('');
    return '<div style="'+CARD+'">'
      + '<div style="'+HEAD+'">'+BADGE('🆘','#f7dcd6')+TITLE(tr('emergency'))+'</div>'
      + items + '</div>';
  }

  function decorate(){
    var shell = document.getElementById('shell');
    if(!shell || !token()) return;
    refresh();
    if(S.screen === 'home'){
      var hdr = shell.querySelector('.header');
      var top = paalalaHtml();
      if(hdr && top) hdr.insertAdjacentHTML('afterend', '<div id="remTop">' + top + '</div>');
      var sc = shell.querySelector('.scroll');
      var bottom = apptsHtml() + servicesHtml();
      if(sc) sc.insertAdjacentHTML('beforeend', '<div id="remBottom" style="padding:4px 0 24px">' + bottom + '</div>');
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

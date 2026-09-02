/* ================= TANDA — AI engine =================
   TANDA can get its answers from either of two places, whichever exists:

   1. SAMPLE  — the "sample" capability, available only when this page runs as
                a published Claude artifact. Costs the viewer's own Claude usage.
   2. SERVER  — POST /api/ask on your own Node server, which holds your
                Anthropic API key. This is what you use for a real deployment.

   Everything else in the app calls TandaAI.ask() / TandaAI.json() and never
   needs to know which one answered.
   ===================================================== */
window.TandaAI = (function(){

  var SAMPLE = null;
  var ready = false;

  function init(){
    var jobs = [];
    if(window.claude && window.claude.use){
      jobs.push(window.claude.use('sample').then(function(s){ SAMPLE = s || null; }).catch(function(){}));
    }
    jobs.push(window.TandaAPI ? TandaAPI.checkServer() : Promise.resolve());
    return Promise.all(jobs).then(function(){
      ready = true;
      if(window.refreshAiBits) refreshAiBits();
    });
  }

  function available(){
    return !!SAMPLE || (window.TandaAPI && TandaAPI.isUp() && TandaAPI.hasAI());
  }

  /* input: a prompt string, or [{role:'user'|'assistant', content}] ending on user */
  function ask(input, opts){
    opts = opts || {};
    if(SAMPLE) return SAMPLE(input, opts);

    if(!(window.TandaAPI && TandaAPI.isUp() && TandaAPI.hasAI())){
      return Promise.reject({code:'not_granted', message:'no AI engine'});
    }
    var messages = typeof input === 'string' ? [{role:'user', content:input}] : input;
    return fetch(TandaAPI.base + '/ask', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({messages: messages, tier: opts.modelTier || 'default'})
    }).then(function(r){
      if(!r.ok) throw {code:'upstream_error', message:'HTTP ' + r.status};
      return r.json();
    }).then(function(d){
      var text = d.text || '';
      /* the server route is not streaming, so fire onText once with the whole thing */
      if(opts.onText) opts.onText({text:text, delta:text});
      return {text:text, truncated:false, modelTierApplied: opts.modelTier || 'default'};
    });
  }

  function json(input, opts){
    if(SAMPLE && SAMPLE.json) return SAMPLE.json(input, opts);
    return ask(input, opts).then(function(r){
      var raw = (r.text || '').trim();
      var fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if(fence) raw = fence[1].trim();
      var first = raw.search(/[\[{]/);
      var last  = Math.max(raw.lastIndexOf(']'), raw.lastIndexOf('}'));
      if(first > -1 && last > first) raw = raw.slice(first, last + 1);
      return JSON.parse(raw);
    });
  }

  return {init:init, available:available, ask:ask, json:json, isReady:function(){ return ready; }};
})();

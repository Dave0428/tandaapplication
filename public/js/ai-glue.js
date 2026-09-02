/* ---------- AI ---------- */
/* Two possible engines, decided in js/ai.js:
   1. the Claude artifact "sample" capability, when the page runs inside claude.ai
   2. this project's own server (POST /api/ask), when you host TANDA yourself   */
function aiReady(){ return !!(window.TandaAI && TandaAI.available()); }
function refreshAiBits(){
  var nodes = document.querySelectorAll('[data-ai-gate]');
  for(var i=0;i<nodes.length;i++) nodes[i].classList.toggle('hidden', !aiReady());
  var off = document.querySelectorAll('[data-ai-off]');
  for(var k=0;k<off.length;k++) off[k].classList.toggle('hidden', aiReady());
}
function aiRules(){
  var langLine = S.data.lang === 'tl'
    ? 'Sumagot ka LAGI sa simpleng Tagalog na may kaunting Ingles na salitang teknikal (Taglish), na parang kausap mo ang lola o lolo mo.'
    : 'Always answer in simple English, the way you would speak to your own grandparent.';
  return 'You are TANDA, a patient helper inside a phone app made for Filipino senior citizens who are learning to use smartphones, Facebook, and Messenger. '
    + langLine + ' '
    + 'Rules: use short sentences; one idea per sentence. When the answer is a task, give numbered steps, at most 6, each step one action. '
    + 'Say exactly what to tap and where it is on the screen. Never use technical jargon; if you must use a word like "app" or "icon", explain it in the same sentence. '
    + 'Do not use emoji lists, headings, tables, bold markers, or asterisks. Plain sentences and numbers only. '
    + 'Keep the whole answer under 130 words. Be warm and encouraging, never talk down. '
    + 'If someone describes a message asking for an OTP, a password, or money, warn them clearly that this is a scam and tell them to talk to a family member. '
    + 'If a question is about health, money, or legal matters, give general help and gently suggest asking a doctor, the bank, or family.';
}
function aiAsk(input, opts){
  if(!aiReady()) return Promise.reject({code:'not_granted'});
  return TandaAI.ask(input, opts || {});
}

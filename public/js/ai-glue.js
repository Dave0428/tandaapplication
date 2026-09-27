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
    + 'If a question is about health, money, or legal matters, give general help and gently suggest asking a doctor, the bank, or family. '
    + guideMenu();
}

/* ---------- pointing at the guides ----------
   The app already holds 23 guides that the team wrote and checked, and each
   one carries pictures of the real screen. An answer typed out fresh has
   neither. So the model is given the list and asked to name the guide that
   fits, on its own last line, in a form the app can read back out.

   The answer still gets written normally; the tag only decides whether a
   button appears under it. Anything the model invents that is not on the
   list is dropped, so this cannot send someone to a guide that is not there. */
function guideMenu(){
  var list = TUT.map(function(x){
    return '- ' + x.id + ': ' + x.title[0];
  }).join('\n');
  return 'These step-by-step guides exist inside this app, each with pictures of the real screen:\n'
    + list + '\n'
    + 'If one of them answers the question, finish your reply with a line of exactly this form and nothing after it: [GUIDE:id] '
    + 'Use the id exactly as written above. If no guide fits, do not write the line at all. '
    + 'Never mention the tag or the word GUIDE in the part the person reads.';
}

/* Pulls the tag off the end of an answer and hands back the clean text plus
   the guide it pointed to, if that guide is real. */
function splitGuideTag(text){
  var m = String(text).match(/\[GUIDE:\s*([a-z0-9\-]+)\s*\]\s*$/i);
  if(!m) return {text:text, guide:null};
  var id = m[1].toLowerCase();
  var found = TUT.filter(function(x){ return x.id === id; })[0] || null;
  return {text: String(text).slice(0, m.index).replace(/\s+$/, ''), guide: found};
}
function aiAsk(input, opts){
  if(!aiReady()) return Promise.reject({code:'not_granted'});
  return TandaAI.ask(input, opts || {});
}

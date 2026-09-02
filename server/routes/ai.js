/* The AI helper, proxied through your server.

   Why a proxy: your Anthropic API key must never be inside the phone app.
   Anyone can read a key shipped to a browser and spend your money with it.
   The phone talks to your server; only your server holds the key. */
const express = require('express');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const MODELS = {
  quick:   'claude-haiku-4-5-20251001',
  default: 'claude-sonnet-5',
  complex: 'claude-opus-5'
};

// A cheap guard so one person cannot burn your whole budget in a minute.
const limiter = rateLimit({ windowMs: 60 * 1000, max: 12 });

router.post('/ask', limiter, async (req, res) => {
  const key = process.env.ANTHROPIC_API_KEY;
  if(!key) return res.status(503).json({ error:'AI is not configured on this server' });

  const messages = Array.isArray(req.body.messages) ? req.body.messages : [];
  if(!messages.length) return res.status(400).json({ error:'no messages' });

  // Trim what we forward: protects your bill and stays inside the model limits.
  const trimmed = messages.slice(-10).map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || '').slice(0, 4000)
  }));

  try{
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODELS[req.body.tier] || MODELS.default,
        max_tokens: 700,
        messages: trimmed
      })
    });

    if(!r.ok){
      const detail = await r.text();
      console.error('anthropic error', r.status, detail.slice(0, 300));
      return res.status(502).json({ error:'upstream error' });
    }

    const data = await r.json();
    const text = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n');
    res.json({ text });
  }catch(err){
    console.error('ask failed', err);
    res.status(502).json({ error:'upstream error' });
  }
});

module.exports = router;

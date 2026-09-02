/* Reading and writing a person's progress. */
const express = require('express');
const { db, transaction } = require('../db');
const { requireAuth } = require('./auth');

const router = express.Router();
router.use(requireAuth);

/* GET /api/progress — everything this account knows about the person. */
router.get('/progress', (req, res) => {
  const uid = req.user.uid;
  const user = db.prepare('SELECT id, email, name, lang, role FROM users WHERE id = ?').get(uid);
  if(!user) return res.status(404).json({ error:'no such user' });

  const state = db.prepare('SELECT streak, plays, settings FROM user_state WHERE user_id = ?').get(uid)
             || { streak:0, plays:0, settings:'{}' };
  const rows = db.prepare('SELECT tutorial_id FROM tutorial_progress WHERE user_id = ? AND done = 1').all(uid);

  const done = {};
  for(const r of rows) done[r.tutorial_id] = true;

  res.json({
    user,
    name: user.name,
    lang: user.lang,
    streak: state.streak,
    plays: state.plays,
    settings: JSON.parse(state.settings || '{}'),
    done
  });
});

/* PUT /api/progress — the phone sends its whole picture; we merge it in.
   Merge, never replace: the same account may be used on two phones. */
router.put('/progress', (req, res) => {
  const uid = req.user.uid;
  const b = req.body || {};

  const write = () => transaction(() => {
    if(typeof b.name === 'string' || typeof b.lang === 'string'){
      db.prepare('UPDATE users SET name = COALESCE(?, name), lang = COALESCE(?, lang) WHERE id = ?')
        .run(b.name ?? null, b.lang ?? null, uid);
    }

    db.prepare(`INSERT INTO user_state (user_id, streak, plays, settings, updated_at)
                VALUES (?,?,?,?, datetime('now'))
                ON CONFLICT(user_id) DO UPDATE SET
                  streak     = MAX(user_state.streak, excluded.streak),
                  plays      = MAX(user_state.plays,  excluded.plays),
                  settings   = excluded.settings,
                  updated_at = datetime('now')`)
      .run(uid, Number(b.streak) || 0, Number(b.plays) || 0, JSON.stringify(b.settings || {}));

    const mark = db.prepare(`INSERT INTO tutorial_progress (user_id, tutorial_id, done)
                             VALUES (?,?,1)
                             ON CONFLICT(user_id, tutorial_id) DO UPDATE SET done = 1`);
    const unmark = db.prepare('DELETE FROM tutorial_progress WHERE user_id = ? AND tutorial_id = ?');

    for(const [id, val] of Object.entries(b.done || {})){
      if(val) mark.run(uid, String(id).slice(0, 40));
      else unmark.run(uid, String(id));
    }
  });

  write();
  res.json({ ok:true, savedAt: new Date().toISOString() });
});

/* POST /api/games — one finished round. Useful later for "which games help?" */
router.post('/games', (req, res) => {
  db.prepare('INSERT INTO game_results (user_id, game, score, meta) VALUES (?,?,?,?)')
    .run(req.user.uid, String(req.body.game || '').slice(0,20), Number(req.body.score) || 0, JSON.stringify(req.body.meta || {}));
  res.json({ ok:true });
});

module.exports = router;

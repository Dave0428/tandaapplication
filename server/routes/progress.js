/* Reading and writing a person's progress. */
const express = require('express');
const { db, transaction } = require('../db');
const { requireAuth } = require('./auth');

const router = express.Router();
router.use(requireAuth);

/* GET /api/progress — everything this account knows about the person. */
router.get('/progress', async (req, res) => {
  try{
    const uid = req.user.uid;
    const user = await db.get('SELECT id, email, name, lang, role FROM users WHERE id = ?', [uid]);
    if(!user) return res.status(404).json({ error:'no such user' });

    const state = (await db.get('SELECT streak, plays, settings FROM user_state WHERE user_id = ?', [uid]))
               || { streak:0, plays:0, settings:'{}' };
    const rows = await db.all('SELECT tutorial_id FROM tutorial_progress WHERE user_id = ? AND done = 1', [uid]);

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
  }catch(err){
    console.error('get progress failed:', err);
    res.status(500).json({ error:'server error' });
  }
});

/* PUT /api/progress — the phone sends its whole picture; we merge it in.
   Merge, never replace: the same account may be used on two phones. */
router.put('/progress', async (req, res) => {
  try{
    const uid = req.user.uid;
    const b = req.body || {};
    const now = new Date().toISOString();

    // The token can outlive the account it names — the database gets reset
    // on some hosts (a redeploy, a restart) while a phone's saved login
    // token does not. Writing progress for a user_id that no longer exists
    // would otherwise throw a foreign-key error and crash the request (or
    // worse, the whole process, if left unguarded). Catch it here and tell
    // the phone plainly that it needs to sign in again.
    const stillExists = await db.get('SELECT id FROM users WHERE id = ?', [uid]);
    if(!stillExists){
      return res.status(401).json({ error:'stale session', msgKey:'sessionExpired' });
    }

    await transaction(async () => {
      if(typeof b.name === 'string' || typeof b.lang === 'string'){
        await db.run('UPDATE users SET name = COALESCE(?, name), lang = COALESCE(?, lang) WHERE id = ?',
          [b.name ?? null, b.lang ?? null, uid]);
      }

      await db.run(
        `INSERT INTO user_state (user_id, streak, plays, settings, updated_at)
         VALUES (?,?,?,?,?)
         ON CONFLICT(user_id) DO UPDATE SET
           streak     = CASE WHEN user_state.streak > excluded.streak THEN user_state.streak ELSE excluded.streak END,
           plays      = CASE WHEN user_state.plays  > excluded.plays  THEN user_state.plays  ELSE excluded.plays  END,
           settings   = excluded.settings,
           updated_at = excluded.updated_at`,
        [uid, Number(b.streak) || 0, Number(b.plays) || 0, JSON.stringify(b.settings || {}), now]
      );

      for(const [id, val] of Object.entries(b.done || {})){
        if(val){
          await db.run(
            `INSERT INTO tutorial_progress (user_id, tutorial_id, done)
             VALUES (?,?,1)
             ON CONFLICT(user_id, tutorial_id) DO UPDATE SET done = 1`,
            [uid, String(id).slice(0, 40)]
          );
        }else{
          await db.run('DELETE FROM tutorial_progress WHERE user_id = ? AND tutorial_id = ?', [uid, String(id)]);
        }
      }
    });

    res.json({ ok:true, savedAt: now });
  }catch(err){
    console.error('put progress failed:', err);
    res.status(500).json({ error:'server error' });
  }
});

/* POST /api/games — one finished round. Useful later for "which games help?" */
router.post('/games', async (req, res) => {
  try{
    await db.run(
      'INSERT INTO game_results (user_id, game, score, meta) VALUES (?,?,?,?)',
      [req.user.uid, String(req.body.game || '').slice(0,20), Number(req.body.score) || 0, JSON.stringify(req.body.meta || {})]
    );
    res.json({ ok:true });
  }catch(err){
    console.error('post game failed:', err);
    res.status(500).json({ error:'server error' });
  }
});

module.exports = router;

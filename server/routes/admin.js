/* Admin: pagsubaybay sa mga user at sa progreso nila.
   Ang lahat dito ay nangangailangan ng account na may role = 'admin'. */
const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('./auth');

const router = express.Router();

function requireAdmin(req, res, next){
  const row = db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.uid);
  if(!row || row.role !== 'admin') return res.status(403).json({ error:'admin only' });
  next();
}
router.use(requireAuth, requireAdmin);

/* GET /api/admin/stats — ang buong dashboard sa isang request. */
router.get('/stats', (req, res) => {
  const one = (sql) => db.prepare(sql).get();
  const all = (sql) => db.prepare(sql).all();

  res.json({
    totals: {
      users:          one('SELECT COUNT(*) AS n FROM users').n,
      tutorialsDone:  one('SELECT COUNT(*) AS n FROM tutorial_progress').n,
      gamesPlayed:    one('SELECT COUNT(*) AS n FROM game_results').n,
      activeThisWeek: one("SELECT COUNT(*) AS n FROM users WHERE last_seen_at >= datetime('now','-7 days')").n
    },

    /* Aling gabay ang natatapos, at aling gabay ang hindi. Ito ang
       pinakamahalagang tanong para sa thesis: alin ang kailangang ayusin. */
    perTutorial: all(`SELECT tutorial_id, COUNT(*) AS finishers
                      FROM tutorial_progress
                      GROUP BY tutorial_id
                      ORDER BY finishers DESC`),

    perGame: all(`SELECT game, COUNT(*) AS plays, ROUND(AVG(score),1) AS avg_score
                  FROM game_results GROUP BY game ORDER BY plays DESC`),

    signupsByDay: all(`SELECT date(created_at) AS day, COUNT(*) AS n
                       FROM users
                       WHERE created_at >= datetime('now','-30 days')
                       GROUP BY day ORDER BY day`),

    users: all(`SELECT u.id, u.email, u.name, u.lang, u.role,
                       date(u.created_at) AS joined,
                       u.last_seen_at,
                       (SELECT COUNT(*) FROM tutorial_progress t WHERE t.user_id = u.id) AS done,
                       (SELECT COUNT(*) FROM game_results g WHERE g.user_id = u.id) AS games,
                       COALESCE((SELECT streak FROM user_state s WHERE s.user_id = u.id), 0) AS streak
                FROM users u
                ORDER BY u.created_at DESC
                LIMIT 500`)
  });
});

/* GET /api/admin/user/:id — isang tao, detalyado. */
router.get('/user/:id', (req, res) => {
  const id = Number(req.params.id);
  const user = db.prepare('SELECT id, email, name, lang, role, created_at, last_seen_at FROM users WHERE id = ?').get(id);
  if(!user) return res.status(404).json({ error:'wala ang user na iyan' });

  res.json({
    user,
    tutorials: db.prepare('SELECT tutorial_id, done_at FROM tutorial_progress WHERE user_id = ? ORDER BY done_at DESC').all(id),
    games: db.prepare('SELECT game, score, played_at FROM game_results WHERE user_id = ? ORDER BY played_at DESC LIMIT 50').all(id)
  });
});

/* PATCH /api/admin/user/:id — palitan ang pangalan, wika, o role. */
router.patch('/user/:id', (req, res) => {
  const id = Number(req.params.id);
  const b = req.body || {};
  if(b.role && !['user','admin'].includes(b.role)) return res.status(400).json({ error:'bad role' });

  db.prepare(`UPDATE users SET
                name = COALESCE(?, name),
                lang = COALESCE(?, lang),
                role = COALESCE(?, role)
              WHERE id = ?`)
    .run(b.name ?? null, b.lang ?? null, b.role ?? null, id);

  res.json({ ok:true });
});

/* DELETE /api/admin/user/:id — buburahin pati progreso (ON DELETE CASCADE).
   Hindi na ito maibabalik. */
router.delete('/user/:id', (req, res) => {
  const id = Number(req.params.id);
  if(id === req.user.uid) return res.status(400).json({ error:'hindi mo puwedeng burahin ang sarili mo' });
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ ok:true });
});

module.exports = router;

/* Admin: pagsubaybay sa mga user at sa progreso nila.
Ang lahat dito ay nangangailangan ng account na may role = 'admin'. */
const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('./auth');

const router = express.Router();

async function requireAdmin(req, res, next){
  try{
    const row = await db.get('SELECT role FROM users WHERE id = ?', [req.user.uid]);
    if(!row || row.role !== 'admin') return res.status(403).json({ error:'admin only' });
    next();
  }catch(err){
    res.status(500).json({ error:'server error' });
  }
}
router.use(requireAuth, requireAdmin);

// SQLite and Postgres store timestamps as text in slightly different formats,
// but both begin with "YYYY-MM-DD" — so cutting the first 10 characters gives
// a reliable calendar day in either backend without needing SQL date functions.
function dayOf(isoish){ return String(isoish || '').slice(0, 10); }

/* GET /api/admin/stats — ang buong dashboard sa isang request. */
router.get('/stats', async (req, res) => {
  try{
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();

    const [usersN, tutorialsN, gamesN, activeN, perTutorial, perGame, signupRows, users] = await Promise.all([
      db.get('SELECT COUNT(*) AS n FROM users'),
      db.get('SELECT COUNT(*) AS n FROM tutorial_progress'),
      db.get('SELECT COUNT(*) AS n FROM game_results'),
      db.get('SELECT COUNT(*) AS n FROM users WHERE last_seen_at >= ?', [weekAgo]),

      db.all(`SELECT tutorial_id, COUNT(*) AS finishers
              FROM tutorial_progress
              GROUP BY tutorial_id
              ORDER BY finishers DESC`),

      db.all(`SELECT game, COUNT(*) AS plays, ROUND(AVG(score),1) AS avg_score
              FROM game_results GROUP BY game ORDER BY plays DESC`),

      db.all('SELECT created_at FROM users WHERE created_at >= ?', [monthAgo]),

      db.all(`SELECT u.id, u.email, u.name, u.lang, u.role, u.created_at, u.last_seen_at,
              (SELECT COUNT(*) FROM tutorial_progress t WHERE t.user_id = u.id) AS done,
              (SELECT COUNT(*) FROM game_results g WHERE g.user_id = u.id) AS games,
              COALESCE((SELECT streak FROM user_state s WHERE s.user_id = u.id), 0) AS streak
              FROM users u
              ORDER BY u.created_at DESC
              LIMIT 500`)
    ]);

    // Group signups by calendar day in JS — see dayOf() above for why.
    const byDay = {};
    for(const r of signupRows){
      const d = dayOf(r.created_at);
      byDay[d] = (byDay[d] || 0) + 1;
    }
    const signupsByDay = Object.keys(byDay).sort().map(day => ({ day, n: byDay[day] }));

    res.json({
      totals: {
        users: usersN.n, tutorialsDone: tutorialsN.n, gamesPlayed: gamesN.n, activeThisWeek: activeN.n
      },
      perTutorial,
      perGame,
      signupsByDay,
      users: users.map(u => ({ ...u, joined: dayOf(u.created_at) }))
    });
  }catch(err){
    console.error('admin stats failed:', err);
    res.status(500).json({ error:'server error' });
  }
});

/* GET /api/admin/user/:id — isang tao, detalyado. */
router.get('/user/:id', async (req, res) => {
  try{
    const id = Number(req.params.id);
    const user = await db.get('SELECT id, email, name, lang, role, created_at, last_seen_at FROM users WHERE id = ?', [id]);
    if(!user) return res.status(404).json({ error:'wala ang user na iyan' });

    const [tutorials, games] = await Promise.all([
      db.all('SELECT tutorial_id, done_at FROM tutorial_progress WHERE user_id = ? ORDER BY done_at DESC', [id]),
      db.all('SELECT game, score, played_at FROM game_results WHERE user_id = ? ORDER BY played_at DESC LIMIT 50', [id])
    ]);

    res.json({ user, tutorials, games });
  }catch(err){
    console.error('admin user detail failed:', err);
    res.status(500).json({ error:'server error' });
  }
});

/* PATCH /api/admin/user/:id — palitan ang pangalan, wika, o role. */
router.patch('/user/:id', async (req, res) => {
  try{
    const id = Number(req.params.id);
    const b = req.body || {};
    if(b.role && ['user','admin'].includes(b.role)) return res.status(400).json({ error:'bad role' });

    await db.run(
      `UPDATE users SET
         name = COALESCE(?, name),
         lang = COALESCE(?, lang),
         role = COALESCE(?, role)
       WHERE id = ?`,
      [b.name ?? null, b.lang ?? null, b.role ?? null, id]
    );

    res.json({ ok:true });
  }catch(err){
    console.error('admin user update failed:', err);
    res.status(500).json({ error:'server error' });
  }
});

/* DELETE /api/admin/user/:id — buburahin pati progreso (ON DELETE CASCADE).
Hindi na ito maibabalik. */
router.delete('/user/:id', async (req, res) => {
  try{
    const id = Number(req.params.id);
    if(id === req.user.uid) return res.status(400).json({ error:'hindi mo puwedeng burahin ang sarili mo' });
    await db.run('DELETE FROM users WHERE id = ?', [id]);
    res.json({ ok:true });
  }catch(err){
    console.error('admin user delete failed:', err);
    res.status(500).json({ error:'server error' });
  }
});

/* POST /api/admin/sql — direktang SQL, para tumingin/mag-ayos ng database
mula sa dashboard mismo nang hindi na kailangang bumukas ng Render Shell.
Isang statement lang kada tawag, para hindi ito maging pinto ng SQL
injection kung sakaling ma-access ito ng ibang paraan.
Isulat ang SQL sa SQLite-style "?" placeholders kung may mga value ka —
awtomatiko itong isasalin papuntang Postgres syntax kung Postgres ang
aktibong backend. Kung walang "?" (halimbawa naka-inline ang mga value
tulad ng WHERE email='...'), gumagana ito nang walang pagbabago. */
router.post('/sql', async (req, res) => {
  try{
    const raw = String(req.body.sql || '').trim();
    if(!raw) return res.status(400).json({ error:'walang SQL' });

    const statements = raw.split(';').map(s => s.trim()).filter(Boolean);
    if(statements.length > 1){
      return res.status(400).json({ error:'isang statement lang kada tawag (walang semicolon sa gitna)' });
    }

    const isSelect = /^select\b/i.test(raw) || /^pragma\b/i.test(raw);

    if(isSelect){
      const rows = await db.all(raw);
      res.json({ kind:'rows', rows });
    }else{
      const info = await db.run(raw);
      res.json({ kind:'write', changes: info.changes, lastInsertRowid: info.lastInsertRowid });
    }
  }catch(err){
    res.status(400).json({ error: err.message });
  }
});

// ---------- helpers (senior features) ----------
function cleanStr(v, max){ return v == null ? null : String(v).trim().slice(0, max || 200) || null; }
function validPhMobile(p){ return /^(\+?63|0)9\d{9}$/.test(String(p || '').replace(/[\s-]/g, '')); }
function normPhMobile(p){ return String(p).replace(/[\s-]/g, ''); }
function toIso(v){ const d = new Date(v); return isNaN(d.getTime()) ? null : d.toISOString(); }

// ---------- emergency contacts (per user, admin-managed) ----------
router.get('/contacts/:userId', async (req, res) => {
  try{
    const rows = await db.all(
      'SELECT id, name, phone, relationship FROM emergency_contacts WHERE user_id = ? ORDER BY name',
      [Number(req.params.userId)]
    );
    res.json({ rows });
  }catch(err){ console.error('contacts list failed:', err); res.status(500).json({ error:'server error' }); }
});

router.post('/contacts', async (req, res) => {
  try{
    const b = req.body || {};
    const userId = Number(b.user_id);
    const name = cleanStr(b.name, 100);
    const phone = normPhMobile(b.phone || '');
    if(!userId) return res.status(400).json({ error:'kailangan ang user' });
    if(!name) return res.status(400).json({ error:'kailangan ang pangalan' });
    if(!validPhMobile(phone)) return res.status(400).json({ error:'mali ang mobile number (hal. 09171234567)' });
    const id = await db.insertReturningId(
      'INSERT INTO emergency_contacts (user_id, name, phone, relationship) VALUES (?, ?, ?, ?)',
      [userId, name, phone, cleanStr(b.relationship, 60)]
    );
    res.json({ ok:true, id });
  }catch(err){ console.error('contact add failed:', err); res.status(500).json({ error:'server error' }); }
});

router.patch('/contacts/:id', async (req, res) => {
  try{
    const b = req.body || {};
    const phone = b.phone != null ? normPhMobile(b.phone) : null;
    if(phone !== null && !validPhMobile(phone)) return res.status(400).json({ error:'mali ang mobile number' });
    await db.run(
      `UPDATE emergency_contacts SET
         name = COALESCE(?, name),
         phone = COALESCE(?, phone),
         relationship = COALESCE(?, relationship)
       WHERE id = ?`,
      [cleanStr(b.name, 100), phone, cleanStr(b.relationship, 60), Number(req.params.id)]
    );
    res.json({ ok:true });
  }catch(err){ console.error('contact update failed:', err); res.status(500).json({ error:'server error' }); }
});

router.delete('/contacts/:id', async (req, res) => {
  try{
    await db.run('DELETE FROM emergency_contacts WHERE id = ?', [Number(req.params.id)]);
    res.json({ ok:true });
  }catch(err){ console.error('contact delete failed:', err); res.status(500).json({ error:'server error' }); }
});

// ---------- service directory (global) ----------
router.get('/services', async (req, res) => {
  try{
    const rows = await db.all(
      'SELECT id, name, category, phone, address, hours, status FROM services ORDER BY category, name'
    );
    res.json({ rows });
  }catch(err){ console.error('services list failed:', err); res.status(500).json({ error:'server error' }); }
});

router.post('/services', async (req, res) => {
  try{
    const b = req.body || {};
    const name = cleanStr(b.name, 120);
    if(!name) return res.status(400).json({ error:'kailangan ang pangalan ng serbisyo' });
    const id = await db.insertReturningId(
      'INSERT INTO services (name, category, phone, address, hours, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, cleanStr(b.category, 60), cleanStr(b.phone, 40), cleanStr(b.address, 200), cleanStr(b.hours, 120), 'active']
    );
    res.json({ ok:true, id });
  }catch(err){ console.error('service add failed:', err); res.status(500).json({ error:'server error' }); }
});

router.patch('/services/:id', async (req, res) => {
  try{
    const b = req.body || {};
    const status = b.status != null ? (b.status === 'inactive' ? 'inactive' : 'active') : null;
    await db.run(
      `UPDATE services SET
         name = COALESCE(?, name),
         category = COALESCE(?, category),
         phone = COALESCE(?, phone),
         address = COALESCE(?, address),
         hours = COALESCE(?, hours),
         status = COALESCE(?, status)
       WHERE id = ?`,
      [cleanStr(b.name, 120), cleanStr(b.category, 60), cleanStr(b.phone, 40),
       cleanStr(b.address, 200), cleanStr(b.hours, 120), status, Number(req.params.id)]
    );
    res.json({ ok:true });
  }catch(err){ console.error('service update failed:', err); res.status(500).json({ error:'server error' }); }
});

router.delete('/services/:id', async (req, res) => {
  try{
    await db.run('DELETE FROM services WHERE id = ?', [Number(req.params.id)]);
    res.json({ ok:true });
  }catch(err){ console.error('service delete failed:', err); res.status(500).json({ error:'server error' }); }
});

// ---------- appointments (per user, admin creates + monitors) ----------
// GET /api/admin/appointments?from=2026-11-05&to=2026-11-12&status=scheduled
router.get('/appointments', async (req, res) => {
  try{
    const from = toIso(req.query.from) || new Date(Date.now() - 86400000).toISOString();
    const to = toIso(req.query.to) || new Date(Date.now() + 30 * 86400000).toISOString();
    const status = req.query.status || null;
    const rows = await db.all(
      `SELECT a.id, a.user_id, a.title, a.starts_at, a.status, a.notes, u.name AS user_name, u.email AS user_email
       FROM appointments a JOIN users u ON u.id = a.user_id
       WHERE a.starts_at >= ? AND a.starts_at <= ?
         AND (? IS NULL OR a.status = ?)
       ORDER BY a.starts_at ASC`,
      [from, to, status, status]
    );
    res.json({ rows });
  }catch(err){ console.error('appointments list failed:', err); res.status(500).json({ error:'server error' }); }
});

router.post('/appointments', async (req, res) => {
  try{
    const b = req.body || {};
    const userId = Number(b.user_id);
    const title = cleanStr(b.title, 120);
    const startsAt = toIso(b.starts_at);
    if(!userId) return res.status(400).json({ error:'kailangan ang user' });
    if(!title) return res.status(400).json({ error:'kailangan ang pamagat' });
    if(!startsAt) return res.status(400).json({ error:'mali ang petsa at oras' });

    const clash = await db.get(
      "SELECT COUNT(*) AS n FROM appointments WHERE user_id = ? AND starts_at = ? AND status = 'scheduled'",
      [userId, startsAt]
    );
    if(clash && clash.n > 0) return res.status(409).json({ error:'may appointment na sa oras na iyan para sa user' });

    const id = await db.insertReturningId(
      'INSERT INTO appointments (user_id, title, starts_at, status, notes) VALUES (?, ?, ?, ?, ?)',
      [userId, title, startsAt, 'scheduled', cleanStr(b.notes, 500)]
    );
    res.json({ ok:true, id });
  }catch(err){ console.error('appointment add failed:', err); res.status(500).json({ error:'server error' }); }
});

router.patch('/appointments/:id', async (req, res) => {
  try{
    const b = req.body || {};
    const startsAt = b.starts_at != null ? toIso(b.starts_at) : null;
    if(b.starts_at != null && !startsAt) return res.status(400).json({ error:'mali ang petsa at oras' });
    const status = b.status != null && ['scheduled','done','cancelled','missed'].includes(b.status) ? b.status : null;
    if(b.status != null && !status) return res.status(400).json({ error:'mali ang status' });
    await db.run(
      `UPDATE appointments SET
         title = COALESCE(?, title),
         starts_at = COALESCE(?, starts_at),
         status = COALESCE(?, status),
         notes = COALESCE(?, notes)
       WHERE id = ?`,
      [cleanStr(b.title, 120), startsAt, status, cleanStr(b.notes, 500), Number(req.params.id)]
    );
    res.json({ ok:true });
  }catch(err){ console.error('appointment update failed:', err); res.status(500).json({ error:'server error' }); }
});

router.delete('/appointments/:id', async (req, res) => {
  try{
    await db.run('DELETE FROM appointments WHERE id = ?', [Number(req.params.id)]);
    res.json({ ok:true });
  }catch(err){ console.error('appointment delete failed:', err); res.status(500).json({ error:'server error' }); }
});

module.exports = router;
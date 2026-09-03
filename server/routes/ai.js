/* ================= TANDA — server =================
   Serves the app in /public and the /api routes it talks to.
   Start it with:  npm start
   ================================================== */
require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const { migrate } = require('./db');
const { router: authRoutes } = require('./routes/auth');
const progressRoutes = require('./routes/progress');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');

const pkg = require('./package.json');
const app = express();

// Bring the database up to date every boot. Safe: already-applied files are skipped.
migrate();

/* Gawing admin ang account na nakalagay sa ADMIN_EMAIL sa .env.
   Mag-register ka muna sa app gamit ang email na iyon, tapos i-restart. */
if(process.env.ADMIN_EMAIL){
  const { db } = require('./db');
  const r = db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(process.env.ADMIN_EMAIL.toLowerCase());
  if(r.changes) console.log('admin:', process.env.ADMIN_EMAIL);
  else console.log('note: wala pang account para sa ADMIN_EMAIL. Mag-register muna, tapos i-restart.');
}

app.use(cors());                          // tighten to your own domain before launch
app.use(express.json({ limit: '256kb' }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

/* Health: the phone calls this to learn whether a server exists at all,
   and whether the AI helper should be shown. */
app.get('/api/health', (req, res) => {
  res.json({ ok: true, version: pkg.version, ai: !!process.env.ANTHROPIC_API_KEY });
});

// IMPORTANT: aiRoutes must be mounted BEFORE progressRoutes. progressRoutes
// applies `router.use(requireAuth)` to everything under it, and because both
// routers share the '/api' mount prefix, registering progressRoutes first
// meant every request to /api/* — including /api/ask, which is meant to
// work for guests — hit that auth gate first and got rejected with 401
// before aiRoutes ever saw the request. Order here is load-bearing.
app.use('/api/auth', authRoutes);
app.use('/api', aiRoutes);
app.use('/api', progressRoutes);
app.use('/api/admin', adminRoutes);

// The app itself.
app.use(express.static(path.join(__dirname, '..', 'public'), { maxAge: '1h' }));
app.get('*', (req, res) => {
  if(req.path.startsWith('/api/')) return res.status(404).json({ error:'no such route' });
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('TANDA v' + pkg.version + ' running: http://localhost:' + port);
  if(!process.env.ANTHROPIC_API_KEY) console.log('note: no ANTHROPIC_API_KEY set, the AI helper stays hidden');
  if(!process.env.JWT_SECRET) console.log('WARNING: no JWT_SECRET set. Do not run like this in production.');
});
   

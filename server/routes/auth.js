/* Accounts: register, log in, and prove who you are on later requests. */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');

const router = express.Router();
const SECRET = () => process.env.JWT_SECRET || 'dev-only-insecure-secret';

function sign(user){
  // The token says who you are and expires in 60 days. It is not a session in
  // the database, so signing out is done by the phone throwing the token away.
  return jwt.sign({ uid: user.id, email: user.email }, SECRET(), { expiresIn: '60d' });
}

/* Middleware: put this in front of any route that needs a signed-in user. */
function requireAuth(req, res, next){
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if(!token) return res.status(401).json({ error:'no token' });
  try{
    req.user = jwt.verify(token, SECRET());
    next();
  }catch(e){
    return res.status(401).json({ error:'bad token' });
  }
}

router.post('/register', (req, res) => {
  const name = String(req.body.name || '').trim().slice(0, 60);
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error:'bad email', msgKey:'badLogin' });
  if(password.length < 8) return res.status(400).json({ error:'short password', msgKey:'shortPw' });

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if(exists) return res.status(409).json({ error:'email taken', msgKey:'taken' });

  // 10 rounds is the usual balance of safety and speed on a small server.
  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?,?,?)').run(email, hash, name);
  db.prepare('INSERT INTO user_state (user_id) VALUES (?)').run(info.lastInsertRowid);

  // Promote to admin right here, at registration — not on the next server
  // restart. On hosts with an ephemeral filesystem (Render's free tier),
  // restarting wipes the database anyway, so waiting for a restart to
  // promote an admin is a trap: the very act of restarting deletes the
  // account it was meant to promote.
  let role = 'user';
  if(process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.toLowerCase()){
    db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(info.lastInsertRowid);
    role = 'admin';
  }

  const user = { id: info.lastInsertRowid, email, name, role };
  res.json({ token: sign(user), user });
});

router.post('/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  // Same message whether the email or the password was wrong: never tell an
  // attacker which of the two exists.
  if(!row || !bcrypt.compareSync(password, row.password_hash)){
    return res.status(401).json({ error:'bad credentials', msgKey:'badLogin' });
  }
  db.prepare("UPDATE users SET last_seen_at = datetime('now') WHERE id = ?").run(row.id);

  const user = { id: row.id, email: row.email, name: row.name, role: row.role };
  res.json({ token: sign(user), user });
});

module.exports = { router, requireAuth };

/* ================= TANDA — database =================
   Uses Node's own built-in SQLite (node:sqlite), added in Node 22 — no native
   compiler, no Python, no Visual Studio Build Tools. This is why db.js does
   not `npm install` a database driver at all: it ships inside Node itself.

   When you outgrow SQLite, see docs/DATABASE.md — the SQL below is plain
   enough to move to Postgres with small edits.

   This file also runs the migrations. A migration is one .sql file that
   changes the schema. Files already applied are recorded in the "migrations"
   table, so running it twice is harmless — that is what makes shipping a
   database change to a live server safe.
   ==================================================== */
const fs = require('fs');
const path = require('path');

let DatabaseSync;
try{
  ({ DatabaseSync } = require('node:sqlite'));
}catch(e){
  console.error(
    '\nThis Node.js build does not expose node:sqlite.\n' +
    'Fix: update to Node 22 or newer (node -v to check), or if you are on an\n' +
    'early Node 22.x, start the server with:  node --experimental-sqlite server.js\n'
  );
  throw e;
}

const file = process.env.SQLITE_PATH || path.join(__dirname, 'tanda.db');
const db = new DatabaseSync(file);

db.exec('PRAGMA journal_mode = WAL');   // several readers while one writer works
db.exec('PRAGMA foreign_keys = ON');    // OFF by default in SQLite. Turn it on.

// node:sqlite has no built-in transaction() helper like better-sqlite3 did,
// so this wraps a block of statements in BEGIN/COMMIT, rolling back on error.
function transaction(fn){
  db.exec('BEGIN');
  try{
    const result = fn();
    db.exec('COMMIT');
    return result;
  }catch(err){
    db.exec('ROLLBACK');
    throw err;
  }
}

function migrate(){
  db.exec(`CREATE TABLE IF NOT EXISTS migrations (
    name       TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  const done = new Set(db.prepare('SELECT name FROM migrations').all().map(r => r.name));

  let applied = 0;
  for(const f of files){
    if(done.has(f)) continue;
    const sql = fs.readFileSync(path.join(dir, f), 'utf8');
    // One transaction per migration: it lands whole or not at all.
    transaction(() => {
      db.exec(sql);
      db.prepare('INSERT INTO migrations (name) VALUES (?)').run(f);
    });
    console.log('migration applied:', f);
    applied++;
  }
  if(!applied) console.log('database is up to date');
  return applied;
}

module.exports = { db, migrate, transaction };

// `npm run migrate` runs this file directly.
if(require.main === module){
  require('dotenv').config();
  migrate();
  console.log('database file:', file);
}

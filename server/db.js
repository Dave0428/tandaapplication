/* ================= TANDA — database =================
   Two backends, one interface. Everything else in the server calls
   db.get(sql, params), db.all(sql, params), db.run(sql, params) — all
   return Promises, and both backends accept the SAME "?" placeholder style
   in the SQL you write, so route files never need to know which database
   is actually running underneath.

   - No DATABASE_URL set  → SQLite (server/tanda.db). Good for your own
     computer. On a host with a temporary disk (Render's free tier),
     restarting or sleeping erases this file.
   - DATABASE_URL set     → Postgres (e.g. a free Neon.tech database).
     Lives on its own separate server, so it survives every restart,
     sleep, and redeploy of the app server. This is what makes accounts
     permanent.

   This file also runs the migrations — the .sql files that build the
   tables. SQLite and Postgres need slightly different SQL for the same
   table (see migrations/ vs migrations-pg/), so each backend reads its
   own folder.
   ==================================================== */
const fs = require('fs');
const path = require('path');

const usingPg = !!process.env.DATABASE_URL;

/* ---------- placeholder translation ----------
   Every query in this project is written with "?" placeholders, the
   SQLite style. Postgres wants "$1, $2, $3...". This turns one into the
   other right before the query goes out, so route files only ever write
   "?" and never think about which database is listening. */
function toPgSql(sql){
  let n = 0;
  return sql.replace(/\?/g, () => '$' + (++n));
}

let engine;

if(usingPg){
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }   // Neon and most hosted Postgres require TLS
  });

  // A transaction needs every statement to run on the SAME connection.
  // pool.query() alone hands out a random connection per call, so during
  // a transaction() block we pin one client and route queries through it.
  let activeClient = null;

  engine = {
    isPg: true,
    async all(sql, params = []){
      const client = activeClient || pool;
      const r = await client.query(toPgSql(sql), params);
      return r.rows;
    },
    async get(sql, params = []){
      const rows = await engine.all(sql, params);
      return rows[0];
    },
    async run(sql, params = []){
      const client = activeClient || pool;
      const r = await client.query(toPgSql(sql), params);
      return { changes: r.rowCount, lastInsertRowid: undefined };
    },
    // Only for the one place that needs the new row's id back (creating a
    // user). Postgres doesn't return an inserted id unless you ask for it.
    async insertReturningId(sql, params = []){
      const client = activeClient || pool;
      const r = await client.query(toPgSql(sql) + ' RETURNING id', params);
      return r.rows[0].id;
    },
    async exec(sql){
      const client = activeClient || pool;
      await client.query(sql);
    },
    async transaction(fn){
      const client = await pool.connect();
      activeClient = client;
      try{
        await client.query('BEGIN');
        const result = await fn();
        await client.query('COMMIT');
        return result;
      }catch(err){
        await client.query('ROLLBACK');
        throw err;
      }finally{
        activeClient = null;
        client.release();
      }
    }
  };

}else{
  let DatabaseSync;
  try{
    ({ DatabaseSync } = require('node:sqlite'));
  }catch(e){
    console.error(
      '\nThis Node.js build does not expose node:sqlite.\n' +
      'Fix: update to Node 22 or newer (node -v to check). On Node 22.x the\n' +
      'flag is required even with a new enough version — this project already\n' +
      'passes it via npm start/dev/migrate. If you ran `node server.js`\n' +
      'directly, use:  node --experimental-sqlite server.js  instead.\n'
    );
    throw e;
  }

  const file = process.env.SQLITE_PATH || path.join(__dirname, 'tanda.db');
  const raw = new DatabaseSync(file);
  raw.exec('PRAGMA journal_mode = WAL');
  raw.exec('PRAGMA foreign_keys = ON');

  engine = {
    isPg: false,
    async all(sql, params = []){ return raw.prepare(sql).all(...params); },
    async get(sql, params = []){ return raw.prepare(sql).get(...params); },
    async run(sql, params = []){
      const info = raw.prepare(sql).run(...params);
      return { changes: info.changes, lastInsertRowid: info.lastInsertRowid };
    },
    async insertReturningId(sql, params = []){
      const info = raw.prepare(sql).run(...params);
      return info.lastInsertRowid;
    },
    async exec(sql){ raw.exec(sql); },
    async transaction(fn){
      raw.exec('BEGIN');
      try{
        const result = await fn();
        raw.exec('COMMIT');
        return result;
      }catch(err){
        raw.exec('ROLLBACK');
        throw err;
      }
    }
  };
}

async function migrate(){
  await engine.exec(`CREATE TABLE IF NOT EXISTS migrations (
    name       TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (${usingPg ? 'now()::text' : "datetime('now')"})
  )`);

  const dir = path.join(__dirname, usingPg ? 'migrations-pg' : 'migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  const doneRows = await engine.all('SELECT name FROM migrations');
  const done = new Set(doneRows.map(r => r.name));

  let applied = 0;
  for(const f of files){
    if(done.has(f)) continue;
    const sql = fs.readFileSync(path.join(dir, f), 'utf8');
    await engine.transaction(async () => {
      await engine.exec(sql);
      await engine.run('INSERT INTO migrations (name) VALUES (?)', [f]);
    });
    console.log('migration applied:', f);
    applied++;
  }
  if(!applied) console.log('database is up to date');
  return applied;
}

module.exports = {
  db: engine,
  migrate,
  transaction: engine.transaction,
  isPg: usingPg
};

// `npm run migrate` runs this file directly.
if(require.main === module){
  require('dotenv').config();
  migrate().then(() => {
    console.log('database:', usingPg ? 'Postgres (DATABASE_URL)' : (process.env.SQLITE_PATH || path.join(__dirname, 'tanda.db')));
  }).catch(err => {
    console.error('migration failed:', err);
    process.exit(1);
  });
    }
   

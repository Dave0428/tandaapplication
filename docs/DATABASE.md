# The database

## Start with SQLite. Really.

SQLite is a single file, `server/tanda.db`. No server to install, no password,
no cloud account. It handles a few hundred people using TANDA at once without
complaining. Many small production apps never move off it.

TANDA uses Node's own **built-in** SQLite (`node:sqlite`, `server/db.js`),
not a separately-installed package. This matters in practice: the old
approach used a package called `better-sqlite3`, which has to be *compiled*
on your machine using Python and a C++ compiler — a common source of
`npm install` failures on Windows, especially on locked-down or shared
computers. The built-in module ships inside Node itself, so `npm install`
never needs to build anything for the database. The only requirement is
**Node 22 or newer** (`node -v` to check).

Move to Postgres when one of these becomes true:

- You run more than one copy of the server (two machines cannot share one file).
- You need several people writing heavily at the same moment.
- Your host has no permanent disk — this is the common one. Render, Railway and
  Heroku wipe the filesystem on every deploy, so a SQLite file there disappears
  when you push an update.

That last point catches most people. If you deploy to a platform like those,
plan on Postgres from the start.

---

## The schema, and why it looks like this

```
users               one row per person      email, password_hash, name, lang
user_state          one row per person      streak, plays, settings (JSON)
tutorial_progress   one row per guide done  user_id + tutorial_id
game_results        one row per game played user_id, game, score, played_at
migrations          one row per .sql file   which changes have been applied
```

Two decisions are worth understanding, because they are the ones beginners
usually get wrong.

**Why is `done` a table instead of a JSON blob?** We could have stored
`{"call": true, "wifi": true}` in one column. It would work. But then you can
never ask a question about it. With one row per finished guide you can write:

```sql
-- which guides do people actually finish?
SELECT tutorial_id, COUNT(*) AS finishers
FROM tutorial_progress
GROUP BY tutorial_id
ORDER BY finishers DESC;
```

That query tells you which guide to rewrite. A JSON blob cannot answer it.
The rule: **facts you will want to count go in rows; settings you only ever
read back whole can stay JSON** — which is exactly why `settings` is still a
JSON column.

**Why `ON DELETE CASCADE`?** When you delete a user, their progress and game
rows must go too. Without it you keep orphan rows pointing at a person who no
longer exists. Note that SQLite ignores foreign keys unless you turn them on,
which `db.js` does with `PRAGMA foreign_keys = ON`.

---

## Moving to Postgres

The SQL in this project is deliberately close to standard. Here is the whole job.

**1. Install the driver**

```bash
cd server
npm install pg
npm uninstall better-sqlite3
```

**2. Get a database.** [Neon](https://neon.tech) and [Supabase](https://supabase.com)
both have a free tier. They give you a connection string that looks like
`postgres://user:password@host/dbname`. Put it in `.env` as `DATABASE_URL`.

**3. Fix the type names in the migration files.** Copy `migrations/` to
`migrations-pg/` and change:

| SQLite                            | Postgres              |
|-----------------------------------|-----------------------|
| `INTEGER PRIMARY KEY AUTOINCREMENT` | `SERIAL PRIMARY KEY` |
| `TEXT DEFAULT (datetime('now'))`  | `TIMESTAMPTZ DEFAULT now()` |
| `INTEGER` used as true/false      | `BOOLEAN`             |

`TEXT`, `PRIMARY KEY`, `REFERENCES`, `ON CONFLICT ... DO UPDATE` and
`CREATE INDEX` are all the same in both.

**4. Rewrite `db.js` around a pool.** The rest of the app changes very little,
but every query becomes asynchronous — `.get()` becomes `await pool.query()`:

```js
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// SQLite:   db.prepare('SELECT * FROM users WHERE email = ?').get(email)
// Postgres: (await pool.query('SELECT * FROM users WHERE email = $1', [email])).rows[0]
```

Note the placeholders differ: SQLite uses `?`, Postgres uses `$1`, `$2`.
This means adding `async`/`await` to your route handlers. It is an afternoon
of work, not a rewrite, and it is much easier if you do it while the app is
still small.

---

## Rules that will save you

1. **Never write SQL by joining strings.** `WHERE email = '${email}'` is how
   databases get destroyed. Always use `?` or `$1` placeholders, as this
   project does everywhere.
2. **Never store a password.** Store the bcrypt hash, as `routes/auth.js` does.
   If your database leaks, hashes are useless to the thief.
3. **Back up.** For SQLite: `cp server/tanda.db backup-$(date +%F).db` on a
   schedule. For hosted Postgres, turn on the provider's automatic backups.
   You will need this exactly once, and you will be very glad.
4. **Index what you filter on.** `tutorial_progress` is indexed by `user_id`
   because every request filters by it. Without an index the database reads
   every row of the table, which is fine at 100 users and terrible at 100,000.

-- 001_init.sql — the first version of the schema.
-- Migrations are never edited once they have run on a real database.
-- To change the schema later, add 002_..., 003_... See docs/UPDATING.md.

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL DEFAULT '',
  lang          TEXT NOT NULL DEFAULT 'en',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at  TEXT
);

-- One row per user: the small settings blob and the streak counters.
CREATE TABLE IF NOT EXISTS user_state (
  user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  streak     INTEGER NOT NULL DEFAULT 0,
  plays      INTEGER NOT NULL DEFAULT 0,
  settings   TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- One row per tutorial a person has finished. A row per fact, not a JSON blob,
-- so you can later ask "which guide do people give up on?".
CREATE TABLE IF NOT EXISTS tutorial_progress (
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tutorial_id TEXT NOT NULL,
  done        INTEGER NOT NULL DEFAULT 1,
  done_at     TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, tutorial_id)
);

CREATE INDEX IF NOT EXISTS idx_tutorial_progress_user ON tutorial_progress(user_id);

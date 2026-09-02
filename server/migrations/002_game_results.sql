-- 002_game_results.sql — added after launch, as an example of a real patch.
-- Existing databases get this table when you run `npm run migrate`.

CREATE TABLE IF NOT EXISTS game_results (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game       TEXT NOT NULL,
  score      INTEGER NOT NULL DEFAULT 0,
  meta       TEXT NOT NULL DEFAULT '{}',
  played_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_game_results_user ON game_results(user_id, played_at);

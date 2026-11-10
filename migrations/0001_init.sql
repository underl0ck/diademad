CREATE TABLE IF NOT EXISTS watchlist (
  id        TEXT    PRIMARY KEY,
  user_id   TEXT    NOT NULL DEFAULT 'default',
  ticker    TEXT    NOT NULL,
  added_at  INTEGER NOT NULL,
  UNIQUE(user_id, ticker)
);
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist(user_id, added_at DESC);

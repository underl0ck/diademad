-- Swap users table to provider-agnostic schema.
-- Drops github_id (redundant with provider='github' + provider_id).
-- Makes github_login nullable so Google users fit.
-- WARNING: DROP TABLE users cascades to sessions via ON DELETE CASCADE.
--          All active sessions will be invalidated and users must re-login.

CREATE TABLE users_new (
  id            TEXT PRIMARY KEY,
  provider      TEXT NOT NULL,
  provider_id   TEXT NOT NULL,
  github_login  TEXT,
  email         TEXT,
  name          TEXT,
  avatar_url    TEXT,
  created_at    INTEGER NOT NULL,
  last_login_at INTEGER NOT NULL,
  UNIQUE(provider, provider_id)
);

INSERT INTO users_new (id, provider, provider_id, github_login, email, name, avatar_url, created_at, last_login_at)
  SELECT id, 'github', github_id, github_login, email, name, avatar_url, created_at, last_login_at
  FROM users;

DROP TABLE users;

ALTER TABLE users_new RENAME TO users;

CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);

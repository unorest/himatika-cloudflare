-- migrations/0001_create_divisions.sql
CREATE TABLE IF NOT EXISTS hmt_divisions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  description  TEXT,
  color        TEXT DEFAULT '#3B82F6',
  icon         TEXT,
  head_user_id INTEGER REFERENCES hmt_users(id) ON DELETE SET NULL,
  is_active    INTEGER DEFAULT 1,
  created_at   TEXT DEFAULT (datetime('now')),
  updated_at   TEXT DEFAULT (datetime('now')),
  deleted_at   TEXT
);
CREATE INDEX IF NOT EXISTS idx_divisions_slug ON hmt_divisions(slug);

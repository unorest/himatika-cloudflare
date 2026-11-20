-- migrations/0003_create_categories.sql
CREATE TABLE IF NOT EXISTS hmt_categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  type        TEXT NOT NULL CHECK(type IN ('blog','forum','event')),
  description TEXT,
  color       TEXT DEFAULT '#6B7280',
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON hmt_categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_type ON hmt_categories(type);

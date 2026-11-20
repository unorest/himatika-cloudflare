-- migrations/0006_create_galleries.sql
CREATE TABLE IF NOT EXISTS hmt_galleries (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id    INTEGER REFERENCES hmt_posts(id) ON DELETE SET NULL,
  event_id   INTEGER REFERENCES hmt_events(id) ON DELETE SET NULL,
  file_path  TEXT NOT NULL,
  caption    TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_galleries_post  ON hmt_galleries(post_id);
CREATE INDEX IF NOT EXISTS idx_galleries_event ON hmt_galleries(event_id);

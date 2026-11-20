-- migrations/0004_create_posts.sql
CREATE TABLE IF NOT EXISTS hmt_posts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  body         TEXT NOT NULL,
  excerpt      TEXT,
  thumbnail    TEXT,
  author_id    INTEGER NOT NULL REFERENCES hmt_users(id),
  category_id  INTEGER REFERENCES hmt_categories(id) ON DELETE SET NULL,
  status       TEXT NOT NULL DEFAULT 'draft'
                 CHECK(status IN ('draft','published','archived')),
  read_time    INTEGER DEFAULT 1,
  views        INTEGER DEFAULT 0,
  published_at TEXT,
  created_at   TEXT DEFAULT (datetime('now')),
  updated_at   TEXT DEFAULT (datetime('now')),
  deleted_at   TEXT
);
CREATE INDEX IF NOT EXISTS idx_posts_slug      ON hmt_posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status    ON hmt_posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_author    ON hmt_posts(author_id);

-- Tags
CREATE TABLE IF NOT EXISTS hmt_post_tags (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT UNIQUE NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Pivot post <-> tag
CREATE TABLE IF NOT EXISTS hmt_post_tag_pivot (
  post_id INTEGER NOT NULL REFERENCES hmt_posts(id) ON DELETE CASCADE,
  tag_id  INTEGER NOT NULL REFERENCES hmt_post_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

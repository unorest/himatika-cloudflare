-- migrations/0007_create_forum.sql
CREATE TABLE IF NOT EXISTS hmt_forum_questions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  author_name  TEXT NOT NULL,
  author_nim   TEXT,
  author_email TEXT,
  is_anonymous INTEGER DEFAULT 0,
  category_id  INTEGER REFERENCES hmt_categories(id) ON DELETE SET NULL,
  status       TEXT DEFAULT 'pending'
                 CHECK(status IN ('pending','answered','rejected')),
  upvotes      INTEGER DEFAULT 0,
  ip_address   TEXT,
  is_pinned    INTEGER DEFAULT 0,
  moderated_by INTEGER REFERENCES hmt_users(id) ON DELETE SET NULL,
  moderated_at TEXT,
  created_at   TEXT DEFAULT (datetime('now')),
  updated_at   TEXT DEFAULT (datetime('now')),
  deleted_at   TEXT
);
CREATE INDEX IF NOT EXISTS idx_forum_q_status ON hmt_forum_questions(status);
CREATE INDEX IF NOT EXISTS idx_forum_q_pinned ON hmt_forum_questions(is_pinned);

-- Jawaban
CREATE TABLE IF NOT EXISTS hmt_forum_answers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL REFERENCES hmt_forum_questions(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  answered_by INTEGER NOT NULL REFERENCES hmt_users(id),
  is_official INTEGER DEFAULT 1,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now')),
  deleted_at  TEXT
);

-- Upvotes (unik per question+ip)
CREATE TABLE IF NOT EXISTS hmt_forum_upvotes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL REFERENCES hmt_forum_questions(id) ON DELETE CASCADE,
  ip_address  TEXT NOT NULL,
  session_id  TEXT,
  created_at  TEXT DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_upvotes_unique ON hmt_forum_upvotes(question_id, ip_address);

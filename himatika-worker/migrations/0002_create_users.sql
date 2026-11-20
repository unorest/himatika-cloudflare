-- migrations/0002_create_users.sql
CREATE TABLE IF NOT EXISTS hmt_users (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT NOT NULL,
  nim            TEXT UNIQUE NOT NULL,
  email          TEXT UNIQUE NOT NULL,
  password       TEXT NOT NULL,
  avatar         TEXT,
  role           TEXT NOT NULL DEFAULT 'staff'
                   CHECK(role IN ('admin','kadiv','staff')),
  division_id    INTEGER REFERENCES hmt_divisions(id) ON DELETE SET NULL,
  is_active      INTEGER DEFAULT 1,
  last_login     TEXT,
  remember_token TEXT,
  created_at     TEXT DEFAULT (datetime('now')),
  updated_at     TEXT DEFAULT (datetime('now')),
  deleted_at     TEXT
);
CREATE INDEX IF NOT EXISTS idx_users_email ON hmt_users(email);
CREATE INDEX IF NOT EXISTS idx_users_nim   ON hmt_users(nim);
CREATE INDEX IF NOT EXISTS idx_users_role  ON hmt_users(role);

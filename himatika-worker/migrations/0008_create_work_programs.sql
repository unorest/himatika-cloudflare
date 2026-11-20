-- migrations/0008_create_work_programs.sql
CREATE TABLE IF NOT EXISTS hmt_work_programs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT,
  division_id INTEGER NOT NULL REFERENCES hmt_divisions(id),
  period_year INTEGER NOT NULL,
  period_term INTEGER DEFAULT 1,
  start_date  TEXT,
  end_date    TEXT,
  status      TEXT DEFAULT 'planning'
                CHECK(status IN ('planning','active','completed','cancelled')),
  progress    INTEGER DEFAULT 0,
  created_by  INTEGER NOT NULL REFERENCES hmt_users(id),
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now')),
  deleted_at  TEXT
);
CREATE INDEX IF NOT EXISTS idx_wp_division ON hmt_work_programs(division_id);
CREATE INDEX IF NOT EXISTS idx_wp_status   ON hmt_work_programs(status);

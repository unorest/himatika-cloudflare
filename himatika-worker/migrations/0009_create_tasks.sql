-- migrations/0009_create_tasks.sql
CREATE TABLE IF NOT EXISTS hmt_tasks (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  work_program_id INTEGER NOT NULL REFERENCES hmt_work_programs(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  status          TEXT DEFAULT 'todo'
                    CHECK(status IN ('todo','in_progress','review','done')),
  priority        TEXT DEFAULT 'medium'
                    CHECK(priority IN ('low','medium','high','critical')),
  assigned_to     INTEGER REFERENCES hmt_users(id) ON DELETE SET NULL,
  due_date        TEXT,
  sort_order      INTEGER DEFAULT 0,
  created_by      INTEGER NOT NULL REFERENCES hmt_users(id),
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now')),
  deleted_at      TEXT
);
CREATE INDEX IF NOT EXISTS idx_tasks_wp       ON hmt_tasks(work_program_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status   ON hmt_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON hmt_tasks(assigned_to);

-- Progress logs
CREATE TABLE IF NOT EXISTS hmt_task_progress_logs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id         INTEGER NOT NULL REFERENCES hmt_tasks(id) ON DELETE CASCADE,
  user_id         INTEGER NOT NULL REFERENCES hmt_users(id),
  body            TEXT NOT NULL,
  status_snapshot TEXT NOT NULL
                    CHECK(status_snapshot IN ('todo','in_progress','review','done')),
  attachment      TEXT,
  logged_date     TEXT NOT NULL,
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_task_logs_task ON hmt_task_progress_logs(task_id);

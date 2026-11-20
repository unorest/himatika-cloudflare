-- migrations/0010_create_schedules.sql
CREATE TABLE IF NOT EXISTS hmt_schedules (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  title           TEXT NOT NULL,
  description     TEXT,
  division_id     INTEGER REFERENCES hmt_divisions(id) ON DELETE SET NULL,
  start_datetime  TEXT NOT NULL,
  end_datetime    TEXT NOT NULL,
  location        TEXT,
  color           TEXT,
  is_recurring    INTEGER DEFAULT 0,
  recurrence_rule TEXT,
  created_by      INTEGER NOT NULL REFERENCES hmt_users(id),
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now')),
  deleted_at      TEXT
);
CREATE INDEX IF NOT EXISTS idx_schedules_div   ON hmt_schedules(division_id);
CREATE INDEX IF NOT EXISTS idx_schedules_start ON hmt_schedules(start_datetime);

-- Peserta jadwal
CREATE TABLE IF NOT EXISTS hmt_schedule_attendees (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  schedule_id INTEGER NOT NULL REFERENCES hmt_schedules(id) ON DELETE CASCADE,
  user_id     INTEGER NOT NULL REFERENCES hmt_users(id) ON DELETE CASCADE,
  rsvp        TEXT DEFAULT 'pending'
                CHECK(rsvp IN ('pending','accepted','declined')),
  created_at  TEXT DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendees_unique ON hmt_schedule_attendees(schedule_id, user_id);

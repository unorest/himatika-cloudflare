-- migrations/0005_create_events.sql
CREATE TABLE IF NOT EXISTS hmt_events (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  title                 TEXT NOT NULL,
  slug                  TEXT UNIQUE NOT NULL,
  description           TEXT,
  location              TEXT,
  start_datetime        TEXT NOT NULL,
  end_datetime          TEXT NOT NULL,
  category_id           INTEGER REFERENCES hmt_categories(id) ON DELETE SET NULL,
  division_id           INTEGER REFERENCES hmt_divisions(id) ON DELETE SET NULL,
  color                 TEXT,
  is_public             INTEGER DEFAULT 1,
  allow_registration    INTEGER DEFAULT 0,
  max_participants      INTEGER,
  registration_deadline TEXT,
  created_by            INTEGER NOT NULL REFERENCES hmt_users(id),
  created_at            TEXT DEFAULT (datetime('now')),
  updated_at            TEXT DEFAULT (datetime('now')),
  deleted_at            TEXT
);
CREATE INDEX IF NOT EXISTS idx_events_slug       ON hmt_events(slug);
CREATE INDEX IF NOT EXISTS idx_events_public     ON hmt_events(is_public);
CREATE INDEX IF NOT EXISTS idx_events_start      ON hmt_events(start_datetime);

-- Pendaftaran event
CREATE TABLE IF NOT EXISTS hmt_event_registrations (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id      INTEGER NOT NULL REFERENCES hmt_events(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  nim           TEXT,
  email         TEXT,
  phone         TEXT,
  status        TEXT DEFAULT 'pending'
                  CHECK(status IN ('pending','confirmed','cancelled')),
  notes         TEXT,
  registered_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_event_reg_event ON hmt_event_registrations(event_id);

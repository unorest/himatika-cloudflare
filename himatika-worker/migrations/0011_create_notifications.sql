-- migrations/0011_create_notifications.sql
CREATE TABLE IF NOT EXISTS hmt_notifications (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id          INTEGER NOT NULL REFERENCES hmt_users(id) ON DELETE CASCADE,
  type             TEXT NOT NULL,
  title            TEXT NOT NULL,
  body             TEXT,
  url              TEXT,
  is_read          INTEGER DEFAULT 0,
  notifiable_type  TEXT,
  notifiable_id    INTEGER,
  created_at       TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notif_user   ON hmt_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_unread ON hmt_notifications(user_id, is_read);

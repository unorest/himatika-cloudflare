-- migrations/seed.sql
-- Seed data awal: admin, divisi default, kategori

-- ── Divisions ─────────────────────────────────────────────────
INSERT OR IGNORE INTO hmt_divisions (name, slug, description, color, is_active)
VALUES
  ('Badan Pengurus Harian', 'bph', 'Ketua, Wakil, Sekretaris, Bendahara', '#3B82F6', 1),
  ('Divisi Akademik', 'akademik', 'Bidang pengembangan akademik mahasiswa', '#10B981', 1),
  ('Divisi Minat Bakat', 'minat-bakat', 'Bidang pengembangan non-akademik', '#F59E0B', 1),
  ('Divisi Humas', 'humas', 'Hubungan masyarakat dan publikasi', '#EF4444', 1),
  ('Divisi PSDM', 'psdm', 'Pengembangan SDM anggota', '#8B5CF6', 1);

-- ── Admin User (email: admin@himatika.ac.id | password: admin123) ──
INSERT OR REPLACE INTO hmt_users
  (id, name, nim, email, password, role, is_active)
VALUES
  (1, 'Administrator', '0000000000', 'admin@himatika.ac.id',
   '1827815e4061b46a5414da439bc2ca21:3bd0b0bbe71f4255776c12b901cd0b51569f74baf327ccb6db064318593a90ff', 'admin', 1);

-- ── Categories ────────────────────────────────────────────────
INSERT OR IGNORE INTO hmt_categories (name, slug, type, color) VALUES
  ('Berita',         'berita',         'blog',  '#3B82F6'),
  ('Tutorial',       'tutorial',       'blog',  '#10B981'),
  ('Dokumentasi',    'dokumentasi',    'blog',  '#6B7280'),
  ('Akademik',       'akademik-forum', 'forum', '#F59E0B'),
  ('Aspirasi',       'aspirasi',       'forum', '#EF4444'),
  ('Umum',           'umum',           'forum', '#8B5CF6'),
  ('Event Publik',   'event-publik',   'event', '#EC4899'),
  ('Rapat Internal', 'rapat-internal', 'event', '#14B8A6');

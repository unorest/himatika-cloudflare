-- migrations/seed.sql
-- Seed data: 5 Divisi Resmi & 21 Pengurus HIMATIKA

PRAGMA foreign_keys = OFF;

-- ── 1. Divisions (head_user_id dibuat NULL dulu agar tidak kena circular foreign key) ──
INSERT OR REPLACE INTO hmt_divisions (id, name, slug, description, color, head_user_id, is_active)
VALUES
  (1, 'Badan Pengurus Harian (BPH)', 'bph', 'Ketua, Wakil Ketua, Sekretaris, dan Bendahara HIMATIKA', '#2563EB', NULL, 1),
  (2, 'Divisi Stupport', 'stupport', 'Divisi Student Support & Advokasi Mahasiswa', '#10B981', NULL, 1),
  (3, 'Divisi PDD', 'pdd', 'Publikasi, Desain, dan Dokumentasi Kegiatan', '#F59E0B', NULL, 1),
  (4, 'Divisi PSDM', 'psdm', 'Pengembangan Sumber Daya Mahasiswa & Kaderisasi', '#8B5CF6', NULL, 1),
  (5, 'Divisi Intellogy', 'intellogy', 'Pengembangan Intelektual, Riset, dan Teknologi', '#06B6D4', NULL, 1);

-- ── 2. 21 Pengurus HIMATIKA ───────────────────────────────────
-- Password default: password123 (juga mendukung admin123)
-- Hash PBKDF2: 1827815e4061b46a5414da439bc2ca21:3bd0b0bbe71f4255776c12b901cd0b51569f74baf327ccb6db064318593a90ff

INSERT OR REPLACE INTO hmt_users
  (id, name, nim, email, password, role, division_id, is_active)
VALUES
  -- Badan Pengurus Harian (BPH)
  (1,  'Rabiah Al-Adawiyah',           '240401010065', 'rabiah@himatika.org',     '1827815e4061b46a5414da439bc2ca21:3bd0b0bbe71f4255776c12b901cd0b51569f74baf327ccb6db064318593a90ff', 'admin', 1, 1),
  (2,  'Samuel Binsar Aditya Simamora','240401010275', 'samuel@himatika.org',     '1827815e4061b46a5414da439bc2ca21:3bd0b0bbe71f4255776c12b901cd0b51569f74baf327ccb6db064318593a90ff', 'admin', 1, 1),
  (3,  'Vina Lestari',                 '240401010385', 'vina@himatika.org',       '1827815e4061b46a5414da439bc2ca21:3bd0b0bbe71f4255776c12b901cd0b51569f74baf327ccb6db064318593a90ff', 'staff', 1, 1),
  (4,  'Nadin Nadilah',                '260401071001', 'nadin@himatika.org',      '1827815e4061b46a5414da439bc2ca21:3bd0b0bbe71f4255776c12b901cd0b51569f74baf327ccb6db064318593a90ff', 'staff', 1, 1),
  (5,  'Dian Avila',                   '250401010377', 'dian@himatika.org',       '1827815e4061b46a5414da439bc2ca21:3bd0b0bbe71f4255776c12b901cd0b51569f74baf327ccb6db064318593a90ff', 'staff', 1, 1),

  -- Divisi Stupport
  (6,  'M. Rendy Amril',               '240401010288', 'rendy@himatika.org',      '1827815e4061b46a5414da439bc2ca21:3bd0b0bbe71f4255776c12b901cd0b51569f74baf327ccb6db064318593a90ff', 'kadiv', 2, 1),
  (7,  'Hikmah Indriyani',             '250401010395', 'hikmah@himatika.org',     '1827815e4061b46a5414da439bc2ca21:3bd0b0bbe71f4255776c12b901cd0b51569f74baf327ccb6db064318593a90ff', 'staff', 2, 1),
  (8,  'M. Naufal Adzim Ramadhan',     '260401630042', 'naufal@himatika.org',     '1827815e4061b46a5414da439bc2ca21:3bd0b0bbe71f4255776c12b901cd0b51569f74baf327ccb6db064318593a90ff', 'staff', 2, 1),
  (9,  'Linawati',                     '260401010228', 'linawati@himatika.org',   '1827815e4061b46a5414da439bc2ca21:3bd0b0bbe71f4255776c12b901cd0b51569f74baf327ccb6db064318593a90ff', 'staff', 2, 1),

  -- Divisi PDD
  (10, 'Intan Puji Hirdian',           '250401010210', 'intan@himatika.org',      '1827815e4061b46a5414da439bc2ca21:3bd0b0bbe71f4255776c12b901cd0b51569f74baf327ccb6db064318593a90ff', 'kadiv', 3, 1),
  (11, 'Ratu Bilqis Mantika RO',       '240401020203', 'balqis@himatika.org',     '1827815e4061b46a5414da439bc2ca21:3bd0b0bbe71f4255776c12b901cd0b51569f74baf327ccb6db064318593a90ff', 'staff', 3, 1),
  (12, 'Triyas Apritantina',           '260401010208', 'triyas@himatika.org',     '1827815e4061b46a5414da439bc2ca21:3bd0b0bbe71f4255776c12b901cd0b51569f74baf327ccb6db064318593a90ff', 'staff', 3, 1),

  -- Divisi PSDM
  (13, 'Cut Evelyn Anwar',             '250401010442', 'cut.evelyn@himatika.org', '1827815e4061b46a5414da439bc2ca21:3bd0b0bbe71f4255776c12b901cd0b51569f74baf327ccb6db064318593a90ff', 'kadiv', 4, 1),
  (14, 'Arsita Rahmawati Dewi',        '240401010318', 'arsita@himatika.org',     '1827815e4061b46a5414da439bc2ca21:3bd0b0bbe71f4255776c12b901cd0b51569f74baf327ccb6db064318593a90ff', 'staff', 4, 1),
  (15, 'M. Dzaky Ghaly Ramdhani',      '260401010316', 'dzaky@himatika.org',      '1827815e4061b46a5414da439bc2ca21:3bd0b0bbe71f4255776c12b901cd0b51569f74baf327ccb6db064318593a90ff', 'staff', 4, 1),
  (16, 'Johan Sudanta Hla',            '260401630027', 'johan@himatika.org',      '1827815e4061b46a5414da439bc2ca21:3bd0b0bbe71f4255776c12b901cd0b51569f74baf327ccb6db064318593a90ff', 'staff', 4, 1),
  (17, 'Risma Diah Wulandari',         '260401010315', 'risma@himatika.org',      '1827815e4061b46a5414da439bc2ca21:3bd0b0bbe71f4255776c12b901cd0b51569f74baf327ccb6db064318593a90ff', 'staff', 4, 1),

  -- Divisi Intellogy
  (18, 'Raden Dimas Taufik Rahmat',    '250401010460', 'dimas@himatika.org',      '1827815e4061b46a5414da439bc2ca21:3bd0b0bbe71f4255776c12b901cd0b51569f74baf327ccb6db064318593a90ff', 'kadiv', 5, 1),
  (19, 'Fajar Mauludin',               '260401010227', 'fajar@himatika.org',      '1827815e4061b46a5414da439bc2ca21:3bd0b0bbe71f4255776c12b901cd0b51569f74baf327ccb6db064318593a90ff', 'staff', 5, 1),
  (20, 'Mochammad Wahyu R',            '260401630016', 'wahyu@himatika.org',      '1827815e4061b46a5414da439bc2ca21:3bd0b0bbe71f4255776c12b901cd0b51569f74baf327ccb6db064318593a90ff', 'staff', 5, 1),
  (21, 'Chandra Handika',              '260401010340', 'chandra@himatika.org',    '1827815e4061b46a5414da439bc2ca21:3bd0b0bbe71f4255776c12b901cd0b51569f74baf327ccb6db064318593a90ff', 'staff', 5, 1);

-- ── 3. Update Kepala Divisi (setelah users terdaftar) ─────────
UPDATE hmt_divisions SET head_user_id = 1  WHERE id = 1;
UPDATE hmt_divisions SET head_user_id = 6  WHERE id = 2;
UPDATE hmt_divisions SET head_user_id = 10 WHERE id = 3;
UPDATE hmt_divisions SET head_user_id = 13 WHERE id = 4;
UPDATE hmt_divisions SET head_user_id = 18 WHERE id = 5;

-- ── 4. Categories ─────────────────────────────────────────────
INSERT OR IGNORE INTO hmt_categories (name, slug, type, color) VALUES
  ('Berita',         'berita',         'blog',  '#2563EB'),
  ('Tutorial',       'tutorial',       'blog',  '#10B981'),
  ('Dokumentasi',    'dokumentasi',    'blog',  '#6B7280'),
  ('Stupport Info',  'stupport-info',  'blog',  '#10B981'),
  ('Intellogy Tech', 'intellogy-tech', 'blog',  '#06B6D4'),
  ('Akademik',       'akademik-forum', 'forum', '#F59E0B'),
  ('Aspirasi',       'aspirasi',       'forum', '#EF4444'),
  ('Umum',           'umum',           'forum', '#8B5CF6'),
  ('Event Publik',   'event-publik',   'event', '#EC4899'),
  ('Rapat Internal', 'rapat-internal', 'event', '#14B8A6');

PRAGMA foreign_keys = ON;

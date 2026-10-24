-- =============================================================================
-- MIGRATION: 005_pelatihan_tkk_schema.sql
-- DESKRIPSI: Skema Database Pelatihan, Sertifikasi TKK, Perencanaan & Laporan (Pilar 5)
-- =============================================================================

-- 1. TABEL: pelatihan_agenda (Agenda Pelatihan & Sertifikasi)
CREATE TABLE IF NOT EXISTS public.pelatihan_agenda (
  id              VARCHAR(50) PRIMARY KEY, -- e.g. "TR-2026-001"
  judul_kegiatan  VARCHAR(255) NOT NULL,
  kategori        VARCHAR(100) NOT NULL, -- e.g. "K3 Konstruksi", "Tenaga Terampil", "Teknologi & Digitalisasi", "Tata Kelola & Regulasi"
  angkatan        VARCHAR(100) NOT NULL, -- e.g. "Angkatan I / 2026"
  tanggal_mulai   DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  lokasi          VARCHAR(255) NOT NULL,
  kuota           INTEGER NOT NULL DEFAULT 40,
  terdaftar       INTEGER NOT NULL DEFAULT 0,
  lulus           INTEGER NOT NULL DEFAULT 0,
  skk_jenjang     VARCHAR(100), -- e.g. "Jenjang 5 (Teknisi/Analis)"
  penyelenggara   VARCHAR(255),
  instruktur      VARCHAR(255),
  status          VARCHAR(50) DEFAULT 'Pendaftaran Dibuka' CHECK (status IN ('Pendaftaran Dibuka', 'Sedang Berjalan', 'Selesai', 'Dibatalkan')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL: pelatihan_peserta (Peserta & Hasil Uji Sertifikasi SKK)
CREATE TABLE IF NOT EXISTS public.pelatihan_peserta (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id       VARCHAR(50) NOT NULL REFERENCES public.pelatihan_agenda(id) ON DELETE CASCADE,
  tkk_id          UUID REFERENCES public.tkk(id) ON DELETE SET NULL,
  nik             VARCHAR(16) NOT NULL,
  nama_peserta    VARCHAR(200) NOT NULL,
  asal_bujk_id    VARCHAR(50) REFERENCES public.bujk(id) ON DELETE SET NULL,
  nama_bujk       VARCHAR(200),
  nilai_akhir     NUMERIC(5, 2),
  status_kelulusan VARCHAR(30) DEFAULT 'Terdaftar' CHECK (status_kelulusan IN ('Terdaftar', 'Lulus', 'Tidak Lulus')),
  nomor_sertifikat VARCHAR(100),
  dokumen_skk_url TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL: pelatihan_perencanaan (Paket Perencanaan Pelatihan Tahunan)
CREATE TABLE IF NOT EXISTS public.pelatihan_perencanaan (
  id              VARCHAR(50) PRIMARY KEY, -- e.g. "PP-2026-01"
  nama_paket      VARCHAR(255) NOT NULL,
  tahun           VARCHAR(10) NOT NULL DEFAULT '2026',
  target_peserta  INTEGER NOT NULL DEFAULT 100,
  anggaran        NUMERIC(15, 2) NOT NULL DEFAULT 0,
  jadwal          VARCHAR(100) NOT NULL,
  dokumen_kak     VARCHAR(255),
  status          VARCHAR(30) DEFAULT 'Menunggu Verifikasi' CHECK (status IN ('Menunggu Verifikasi', 'Terverifikasi', 'Ditolak')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL: pelatihan_laporan (Berita Acara / Laporan Hasil Pelatihan)
CREATE TABLE IF NOT EXISTS public.pelatihan_laporan (
  id              VARCHAR(50) PRIMARY KEY, -- e.g. "LAP-PEL-01"
  nomor_laporan   VARCHAR(150) NOT NULL,
  nama_kegiatan   VARCHAR(255) NOT NULL,
  tanggal_selesai DATE NOT NULL,
  jumlah_lulusan  INTEGER NOT NULL DEFAULT 0,
  lembaga_sertifikasi VARCHAR(200) NOT NULL,
  dokumen_ba      VARCHAR(255),
  status          VARCHAR(30) DEFAULT 'Menunggu Verifikasi' CHECK (status IN ('Menunggu Verifikasi', 'Terverifikasi', 'Ditolak')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES UNTUK PERFORMA
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_pelatihan_agenda_status ON public.pelatihan_agenda(status);
CREATE INDEX IF NOT EXISTS idx_pelatihan_peserta_agenda ON public.pelatihan_peserta(agenda_id);
CREATE INDEX IF NOT EXISTS idx_pelatihan_peserta_nik ON public.pelatihan_peserta(nik);
CREATE INDEX IF NOT EXISTS idx_pelatihan_perencanaan_tahun ON public.pelatihan_perencanaan(tahun);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.pelatihan_agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pelatihan_peserta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pelatihan_perencanaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pelatihan_laporan ENABLE ROW LEVEL SECURITY;

-- 1. Kebijakan pelatihan_agenda
CREATE POLICY "Public Read Agenda Pelatihan"
  ON public.pelatihan_agenda FOR SELECT
  USING (true);

CREATE POLICY "Admin All Agenda Pelatihan"
  ON public.pelatihan_agenda FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 2. Kebijakan pelatihan_peserta
CREATE POLICY "Public Read Peserta Pelatihan"
  ON public.pelatihan_peserta FOR SELECT
  USING (true);

CREATE POLICY "Authenticated All Peserta Pelatihan"
  ON public.pelatihan_peserta FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Kebijakan pelatihan_perencanaan
CREATE POLICY "Public Read Perencanaan Pelatihan"
  ON public.pelatihan_perencanaan FOR SELECT
  USING (true);

CREATE POLICY "Admin All Perencanaan Pelatihan"
  ON public.pelatihan_perencanaan FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Kebijakan pelatihan_laporan
CREATE POLICY "Public Read Laporan Pelatihan"
  ON public.pelatihan_laporan FOR SELECT
  USING (true);

CREATE POLICY "Admin All Laporan Pelatihan"
  ON public.pelatihan_laporan FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- SEED DATA AWAL DARI PROTOTYPE
-- =============================================================================

-- Seed Agenda
INSERT INTO public.pelatihan_agenda (
  id, judul_kegiatan, kategori, angkatan, tanggal_mulai, tanggal_selesai, 
  lokasi, kuota, terdaftar, lulus, skk_jenjang, penyelenggara, instruktur, status
) VALUES
(
  'TR-2026-001',
  'Bimtek SMKK (Sistem Manajemen Keselamatan Konstruksi) Petugas K3',
  'K3 Konstruksi',
  'Angkatan I / 2026',
  '2026-04-10',
  '2026-04-14',
  'Auditorium Dinas PU Kab. Bogor',
  40, 40, 38,
  'Jenjang 5 (Teknisi/Analis)',
  'Bidang Jasa Konstruksi DPU bekerjasama dengan Balai Jasa Konstruksi Wilayah III',
  'Ir. Budi Santoso, MT (Asesor BNSP)',
  'Selesai'
),
(
  'TR-2026-002',
  'Sertifikasi Kompetensi Kerja (SKK) Tukang Pasang Bata & Plesteran',
  'Tenaga Terampil',
  'Angkatan II / 2026',
  '2026-05-18',
  '2026-05-20',
  'Workshop Balai Latihan Kerja (BLK) Cibinong',
  50, 50, 47,
  'Jenjang 1-2 (Operator/Tukang)',
  'Bidang Jasa Konstruksi bekerjasama dengan LSP Gataki Konstruksi Mandiri',
  'Supriyanto, ST (Master Asesor)',
  'Selesai'
),
(
  'TR-2026-003',
  'Pelatihan Building Information Modeling (BIM) Authoring Jenjang Muda',
  'Teknologi & Digitalisasi',
  'Angkatan I / 2026',
  '2026-08-25',
  '2026-08-29',
  'Lab Komputer Bappedalitbang Kab. Bogor',
  30, 28, 0,
  'Jenjang 6 (Ahli Muda)',
  'Bidang Jasa Konstruksi DPU Kab. Bogor',
  'Radityo Prabowo, ST, M.Sc (BIM Specialist)',
  'Sedang Berjalan'
),
(
  'TR-2026-004',
  'Sosialisasi Tertib Penyelenggaraan Jasa Konstruksi & Regulasi Terbaru',
  'Tata Kelola & Regulasi',
  'Tahap III / 2026',
  '2026-09-22',
  '2026-09-22',
  'Hotel Lorin Sentul, Babakan Madang',
  100, 74, 0,
  'Semua Jenjang',
  'DPU Kab. Bogor',
  'Tim Pembina Jasa Konstruksi Ditjen Bina Konstruksi Kementerian PUPR',
  'Pendaftaran Dibuka'
)
ON CONFLICT (id) DO UPDATE SET
  judul_kegiatan = EXCLUDED.judul_kegiatan,
  status = EXCLUDED.status,
  terdaftar = EXCLUDED.terdaftar,
  lulus = EXCLUDED.lulus;

-- Seed Peserta
INSERT INTO public.pelatihan_peserta (
  agenda_id, nik, nama_peserta, nama_bujk, nilai_akhir, status_kelulusan, nomor_sertifikat
) VALUES
(
  'TR-2026-001', '3201011203900001', 'Ahmad Fauzi', 'PT Bangun Jaya Konstruksi', 88.00, 'Lulus', 'SKK-SMKK-2026-001'
),
(
  'TR-2026-001', '3201021508880004', 'Rian Hidayat', 'CV Karya Mandiri Utama', 92.00, 'Lulus', 'SKK-SMKK-2026-002'
),
(
  'TR-2026-001', '3201032104920002', 'Deni Setiawan', 'PT Mitra Pembangunan Nusantara', 85.00, 'Lulus', 'SKK-SMKK-2026-003'
),
(
  'TR-2026-002', '3201050801850003', 'Mamat Rahmat', 'CV Teknik Sejahtera', 89.00, 'Lulus', 'SKK-TUK-2026-041'
),
(
  'TR-2026-002', '3201061907870005', 'Ujang Sulaeman', 'CV Anugerah Konstruksi', 91.00, 'Lulus', 'SKK-TUK-2026-042'
)
ON CONFLICT DO NOTHING;

-- Seed Perencanaan Pelatihan
INSERT INTO public.pelatihan_perencanaan (
  id, nama_paket, tahun, target_peserta, anggaran, jadwal, dokumen_kak, status
) VALUES
(
  'PP-2026-01',
  'Pelatihan & Fasilitasi Uji Sertifikasi SKK Tenaga Kerja Konstruksi Terampil',
  '2026',
  250,
  380000000,
  'Maret - Juli 2026',
  'KAK_Fasilitasi_Sertifikasi_TKK_2026.pdf',
  'Terverifikasi'
),
(
  'PP-2026-02',
  'Bimbingan Teknis Standar Keamanan, Keselamatan, Kesehatan dan Keberlanjutan (K4 SMKK)',
  '2026',
  120,
  175000000,
  'April - Agustus 2026',
  'KAK_Bimtek_SMKK_2026.pdf',
  'Terverifikasi'
),
(
  'PP-2026-03',
  'Mobile Training Unit (MTU) Pelatihan Vokasi Pekerja Lapangan Wilayah Bogor Barat',
  '2026',
  100,
  150000000,
  'Juni - September 2026',
  'KAK_MTU_Bogor_Barat.pdf',
  'Terverifikasi'
)
ON CONFLICT (id) DO UPDATE SET
  nama_paket = EXCLUDED.nama_paket,
  target_peserta = EXCLUDED.target_peserta,
  anggaran = EXCLUDED.anggaran,
  status = EXCLUDED.status;

-- Seed Laporan Pelatihan
INSERT INTO public.pelatihan_laporan (
  id, nomor_laporan, nama_kegiatan, tanggal_selesai, jumlah_lulusan, lembaga_sertifikasi, dokumen_ba, status
) VALUES
(
  'LAP-PEL-01',
  '005/BA-LSP-GATAKI/VI/2026',
  'Sertifikasi Uji Kompetensi Mandor Tukang Pasang Bata & Plesteran',
  '2026-03-28',
  48,
  'LSP Gataki Karya Konstruksi',
  'BA_Kelulusan_Mandor_2026.pdf',
  'Terverifikasi'
),
(
  'LAP-PEL-02',
  '012/BA-LPK-BOGOR/V/2026',
  'Bimtek & Uji Sertifikasi Petugas K3 Konstruksi Tingkat Muda',
  '2026-04-02',
  62,
  'LSP Keselamatan Konstruksi Indonesia',
  'BA_Sertifikasi_K3_2026.pdf',
  'Terverifikasi'
),
(
  'LAP-PEL-03',
  '018/BA-LSP-ASTEKINDO/VII/2026',
  'Fasilitasi Sertifikasi Juru Ukur (Surveyor) Berbasis SKK',
  '2026-04-10',
  32,
  'LSP Astekindo Konstruksi Mandiri',
  'BA_Surveyor_2026.pdf',
  'Terverifikasi'
)
ON CONFLICT (id) DO UPDATE SET
  nomor_laporan = EXCLUDED.nomor_laporan,
  nama_kegiatan = EXCLUDED.nama_kegiatan,
  jumlah_lulusan = EXCLUDED.jumlah_lulusan,
  status = EXCLUDED.status;

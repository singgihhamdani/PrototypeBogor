-- =============================================================================
-- MIGRATION 009: Skema Pelaporan Pengawasan Konstruksi (3 Pilar Tertib)
-- Menyelaraskan Standar Format 8 Kolom SIPJAKI Kementerian PUPR
-- (NO, JENIS LAPORAN, NAMA LAPORAN, TAHUN, WILAYAH, DOKUMEN, STATUS, AKSI)
-- + Nilai Tambah SIJAKON (Jumlah Objek Diawasi, Indeks Kepatuhan %, Gateway Sync)
-- =============================================================================

-- =============================================================================
-- 1. TABEL: pengawasan_pelaporan (Arsip Berkas Pelaporan Berkala Resmi)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.pengawasan_pelaporan (
  id                  VARCHAR(50) PRIMARY KEY,              -- Contoh: "LAP-TU-2026-T1", "LAP-TP-2026-T1"
  tertib_type         VARCHAR(30) NOT NULL 
                      CHECK (tertib_type IN ('tertib-usaha', 'tertib-penyelenggaraan', 'tertib-pemanfaatan')),
  jenis_laporan       VARCHAR(50) NOT NULL DEFAULT 'Tahunan'
                      CHECK (jenis_laporan IN ('Tahunan', 'Semesteran', 'Triwulanan', 'Insidental')),
  nama_laporan        VARCHAR(255) NOT NULL,                -- [Standar SIPJAKI: Nama Laporan Huruf Kapital]
  tahun               VARCHAR(10) NOT NULL DEFAULT '2026',  -- [Standar SIPJAKI: Tahun Anggaran]
  propinsi            VARCHAR(100) NOT NULL DEFAULT 'Jawa Barat',
  kab_kota            VARCHAR(100) NOT NULL DEFAULT 'Kabupaten Bogor',
  wilayah             VARCHAR(255) NOT NULL DEFAULT 'Jawa Barat / Kabupaten Bogor',
  dokumen_url         TEXT,                                 -- Berkas URL / storage path
  dokumen_nama        VARCHAR(255) NOT NULL DEFAULT 'Laporan_Pengawasan_2026.pdf',
  status              VARCHAR(50) NOT NULL DEFAULT 'Menunggu Verifikasi'
                      CHECK (status IN ('Menunggu Verifikasi', 'Terverifikasi', 'Perlu Revisi', 'Draft Lokal')),
  jumlah_objek        INTEGER NOT NULL DEFAULT 0,           -- Nilai tambah analitik: Objek diperiksa
  tingkat_kepatuhan   NUMERIC(5,2) NOT NULL DEFAULT 0,      -- Nilai tambah analitik: Indeks Kepatuhan (%)
  tanggal_kirim       VARCHAR(50) DEFAULT '-',              -- Waktu sinkronisasi gateway SIPJAKI
  nomor_surat         VARCHAR(100),                         -- Nomor Surat Pengantar Kadis PUPR
  catatan             TEXT,
  created_by          UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks Performa Query
CREATE INDEX IF NOT EXISTS idx_pelaporan_tertib ON public.pengawasan_pelaporan(tertib_type);
CREATE INDEX IF NOT EXISTS idx_pelaporan_tahun ON public.pengawasan_pelaporan(tahun);
CREATE INDEX IF NOT EXISTS idx_pelaporan_status ON public.pengawasan_pelaporan(status);
CREATE INDEX IF NOT EXISTS idx_pelaporan_jenis ON public.pengawasan_pelaporan(jenis_laporan);
CREATE INDEX IF NOT EXISTS idx_pelaporan_wilayah ON public.pengawasan_pelaporan(wilayah);

-- =============================================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.pengawasan_pelaporan ENABLE ROW LEVEL SECURITY;

-- Policy 1: Hak Baca untuk Publik & Seluruh Pengguna Terotentikasi
DROP POLICY IF EXISTS "Public & authenticated can view pelaporan pengawasan" 
  ON public.pengawasan_pelaporan;
CREATE POLICY "Public & authenticated can view pelaporan pengawasan" 
  ON public.pengawasan_pelaporan FOR SELECT USING (true);

-- Policy 2: Hak Tulis, Edit, dan Hapus Khusus Super Admin & Admin Bidang (Bina Konstruksi)
DROP POLICY IF EXISTS "Admins can manage pelaporan pengawasan" 
  ON public.pengawasan_pelaporan;
CREATE POLICY "Admins can manage pelaporan pengawasan" 
  ON public.pengawasan_pelaporan FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN_BIDANG')
    )
  );

-- =============================================================================
-- 3. SEED DATA AWAL: BERKAS PELAPORAN RESMI 3 PILAR TERTIB TA 2026
-- =============================================================================

-- 3.1. PILAR 1: TERTIB USAHA JASA KONSTRUKSI
INSERT INTO public.pengawasan_pelaporan (
  id, tertib_type, jenis_laporan, nama_laporan, tahun, propinsi, kab_kota, wilayah,
  dokumen_url, dokumen_nama, status, jumlah_objek, tingkat_kepatuhan, tanggal_kirim, nomor_surat, catatan
) VALUES 
(
  'LAP-TU-2026-T1',
  'tertib-usaha',
  'Tahunan',
  'LAPORAN PENGAWASAN TAHUNAN TERTIB USAHA 2026 KABUPATEN BOGOR',
  '2026',
  'Jawa Barat',
  'Kabupaten Bogor',
  'Jawa Barat / Kabupaten Bogor',
  'https://sijakon.bogorkab.go.id/docs/Laporan_Pengawasan_Tahunan_Tertib_Usaha_2026.pdf',
  'Laporan_Pengawasan_Tahunan_Tertib_Usaha_2026.pdf',
  'Terverifikasi',
  78,
  88.50,
  '2026-11-10 09:30 WIB',
  '600.1/1420/PUPR-Jakon/2026',
  'Laporan tahunan komprehensif tertib usaha mencakup pengawasan izin usaha, rantai pasok material, dan kualifikasi badan usaha.'
),
(
  'LAP-TU-2026-Q1',
  'tertib-usaha',
  'Triwulanan',
  'LAPORAN PENGAWASAN TRIWULAN I TERTIB USAHA 2026 KABUPATEN BOGOR',
  '2026',
  'Jawa Barat',
  'Kabupaten Bogor',
  'Jawa Barat / Kabupaten Bogor',
  'https://sijakon.bogorkab.go.id/docs/Laporan_Pengawasan_TU_Q1_2026.pdf',
  'Laporan_Pengawasan_TU_Q1_2026.pdf',
  'Terverifikasi',
  35,
  86.50,
  '2026-04-05 14:30 WIB',
  '600.1/412/PUPR-Jakon/2026',
  'Laporan pengawasan triwulan I badan usaha jasa konstruksi dan produsen beton/aspal.'
),
(
  'LAP-TU-2026-S1',
  'tertib-usaha',
  'Semesteran',
  'LAPORAN PENGAWASAN SEMESTER I TERTIB USAHA 2026 KABUPATEN BOGOR',
  '2026',
  'Jawa Barat',
  'Kabupaten Bogor',
  'Jawa Barat / Kabupaten Bogor',
  'https://sijakon.bogorkab.go.id/docs/Laporan_Pengawasan_TU_Sem1_2026.pdf',
  'Laporan_Pengawasan_TU_Sem1_2026.pdf',
  'Menunggu Verifikasi',
  52,
  90.20,
  '2026-07-15 11:00 WIB',
  '600.1/850/PUPR-Jakon/2026',
  'Berkas semester I sedang dalam proses telaah verifikasi teknis oleh Balai Jasa Konstruksi Wilayah III.'
)
ON CONFLICT (id) DO NOTHING;

-- 3.2. PILAR 2: TERTIB PENYELENGGARAAN JASA KONSTRUKSI
INSERT INTO public.pengawasan_pelaporan (
  id, tertib_type, jenis_laporan, nama_laporan, tahun, propinsi, kab_kota, wilayah,
  dokumen_url, dokumen_nama, status, jumlah_objek, tingkat_kepatuhan, tanggal_kirim, nomor_surat, catatan
) VALUES 
(
  'LAP-TP-2026-T1',
  'tertib-penyelenggaraan',
  'Tahunan',
  'LAPORAN PENGAWASAN TAHUNAN TERTIB PENYELENGGARAAN 2026 KABUPATEN BOGOR',
  '2026',
  'Jawa Barat',
  'Kabupaten Bogor',
  'Jawa Barat / Kabupaten Bogor',
  'https://sijakon.bogorkab.go.id/docs/Laporan_Pengawasan_Tahunan_Tertib_Penyelenggaraan_2026.pdf',
  'Laporan_Pengawasan_Tahunan_Tertib_Penyelenggaraan_2026.pdf',
  'Terverifikasi',
  42,
  84.30,
  '2026-11-12 10:15 WIB',
  '600.1/1425/PUPR-Jakon/2026',
  'Laporan pengawasan penyelenggaraan seluruh paket pekerjaan konstruksi fisik APBD TA 2026.'
),
(
  'LAP-TP-2026-Q1',
  'tertib-penyelenggaraan',
  'Triwulanan',
  'LAPORAN PENGAWASAN TRIWULAN I TERTIB PENYELENGGARAAN 2026 KABUPATEN BOGOR',
  '2026',
  'Jawa Barat',
  'Kabupaten Bogor',
  'Jawa Barat / Kabupaten Bogor',
  'https://sijakon.bogorkab.go.id/docs/Laporan_Pengawasan_TP_Q1_2026.pdf',
  'Laporan_Pengawasan_TP_Q1_2026.pdf',
  'Terverifikasi',
  32,
  81.20,
  '2026-04-08 16:00 WIB',
  '600.1/430/PUPR-Jakon/2026',
  'Laporan pengawasan penjaminan mutu, kontrak kerja, dan penerapan SMKK proyek jalan dan jembatan.'
),
(
  'LAP-TP-2026-S1',
  'tertib-penyelenggaraan',
  'Semesteran',
  'LAPORAN PENGAWASAN SEMESTER I TERTIB PENYELENGGARAAN 2026 KABUPATEN BOGOR',
  '2026',
  'Jawa Barat',
  'Kabupaten Bogor',
  'Jawa Barat / Kabupaten Bogor',
  'https://sijakon.bogorkab.go.id/docs/Laporan_Pengawasan_TP_Sem1_2026.pdf',
  'Laporan_Pengawasan_TP_Sem1_2026.pdf',
  'Menunggu Verifikasi',
  38,
  85.00,
  '2026-07-20 13:45 WIB',
  '600.1/875/PUPR-Jakon/2026',
  'Menunggu validasi surat pengantar oleh Ditjen Bina Konstruksi Kementerian PUPR.'
)
ON CONFLICT (id) DO NOTHING;

-- 3.3. PILAR 3: TERTIB PEMANFAATAN JASA KONSTRUKSI
INSERT INTO public.pengawasan_pelaporan (
  id, tertib_type, jenis_laporan, nama_laporan, tahun, propinsi, kab_kota, wilayah,
  dokumen_url, dokumen_nama, status, jumlah_objek, tingkat_kepatuhan, tanggal_kirim, nomor_surat, catatan
) VALUES 
(
  'LAP-TM-2026-T1',
  'tertib-pemanfaatan',
  'Tahunan',
  'LAPORAN PENGAWASAN TAHUNAN TERTIB PEMANFAATAN 2026 KABUPATEN BOGOR',
  '2026',
  'Jawa Barat',
  'Kabupaten Bogor',
  'Jawa Barat / Kabupaten Bogor',
  'https://sijakon.bogorkab.go.id/docs/Laporan_Pengawasan_Tahunan_Tertib_Pemanfaatan_2026.pdf',
  'Laporan_Pengawasan_Tahunan_Tertib_Pemanfaatan_2026.pdf',
  'Terverifikasi',
  28,
  82.00,
  '2026-11-14 14:00 WIB',
  '600.1/1430/PUPR-Jakon/2026',
  'Laporan pemanfaatan gedung RSUD, kantor camat, stadion, dan jembatan purna konstruksi.'
),
(
  'LAP-TM-2026-Q1',
  'tertib-pemanfaatan',
  'Triwulanan',
  'LAPORAN PENGAWASAN TRIWULAN I TERTIB PEMANFAATAN 2026 KABUPATEN BOGOR',
  '2026',
  'Jawa Barat',
  'Kabupaten Bogor',
  'Jawa Barat / Kabupaten Bogor',
  'https://sijakon.bogorkab.go.id/docs/Laporan_Pengawasan_TM_Q1_2026.pdf',
  'Laporan_Pengawasan_TM_Q1_2026.pdf',
  'Menunggu Verifikasi',
  16,
  75.00,
  '2026-04-10 15:20 WIB',
  '600.1/445/PUPR-Jakon/2026',
  'Laporan inspeksi kelaikan fungsi bangunan dan kepemilikan Sertifikat Laik Fungsi (SLF).'
)
ON CONFLICT (id) DO NOTHING;

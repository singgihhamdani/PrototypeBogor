-- =============================================================================
-- SIPJAKI KABUPATEN BOGOR - MIGRATION 015
-- STANDARDISASI TABEL PELATIHAN DAN SERTIFIKASI TKK (SIPJAKI PUSAT)
-- =============================================================================

-- 1. Buat Tabel public.pelatihan_sipjaki jika belum ada
CREATE TABLE IF NOT EXISTS public.pelatihan_sipjaki (
  id                  VARCHAR(50) PRIMARY KEY,              -- Contoh: "PEL-2026-001"
  tahun               VARCHAR(10) NOT NULL DEFAULT '2026',
  nama_kegiatan       VARCHAR(300) NOT NULL,
  metode              VARCHAR(100) NOT NULL DEFAULT 'Reguler',
  lokasi              VARCHAR(300) NOT NULL,
  jumlah_l            INTEGER NOT NULL DEFAULT 0,
  jumlah_p            INTEGER NOT NULL DEFAULT 0,
  kab_kota            VARCHAR(100) DEFAULT 'Kabupaten Bogor',
  propinsi            VARCHAR(100) DEFAULT 'Jawa Barat',
  skk_jenjang         VARCHAR(100),
  penyelenggara       VARCHAR(255) DEFAULT 'Dinas PUPR Kabupaten Bogor',
  status              VARCHAR(50) DEFAULT 'Selesai & Tersertifikasi',
  keterangan          TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indeks Kinerja untuk Riwayat Terkini & Filter Cepat
CREATE INDEX IF NOT EXISTS idx_pelatihan_sipjaki_updated_at ON public.pelatihan_sipjaki(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_pelatihan_sipjaki_tahun ON public.pelatihan_sipjaki(tahun DESC);
CREATE INDEX IF NOT EXISTS idx_pelatihan_sipjaki_metode ON public.pelatihan_sipjaki(metode);

-- 3. Row Level Security (RLS) & Kebijakan Hak Akses
ALTER TABLE public.pelatihan_sipjaki ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view pelatihan_sipjaki" ON public.pelatihan_sipjaki;
CREATE POLICY "Public can view pelatihan_sipjaki" ON public.pelatihan_sipjaki FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage pelatihan_sipjaki" ON public.pelatihan_sipjaki;
CREATE POLICY "Admins can manage pelatihan_sipjaki" ON public.pelatihan_sipjaki FOR ALL USING (true);

-- 4. Seed Data Awal Baku (Tepat 7 Kegiatan & 94 Peserta)
INSERT INTO public.pelatihan_sipjaki (
  id, tahun, nama_kegiatan, metode, lokasi, jumlah_l, jumlah_p,
  kab_kota, propinsi, skk_jenjang, penyelenggara, status, keterangan, created_at, updated_at
) VALUES
(
  'PEL-2026-001',
  '2026',
  'Pelatihan & Sertifikasi Pelaksana Lapangan Pekerjaan Jalan Madya',
  'Hybrid',
  'Pusdiklat DPU Cibinong & Ruang Praktik Lapangan',
  38,
  7,
  'Kabupaten Bogor',
  'Jawa Barat',
  'Jenjang 5 (Teknisi/Analis)',
  'Dinas PUPR Kab. Bogor & Balai Jasa Konstruksi Wilayah III',
  'Selesai & Tersertifikasi',
  'Pelaksanaan 12 hari (teori daring dan uji praktik lapangan jalan)',
  NOW() - INTERVAL '40 days',
  NOW() - INTERVAL '15 minutes'
),
(
  'PEL-2026-002',
  '2026',
  'Bimtek Petugas K3 Konstruksi & Penerapan SMKK Angkatan I',
  'Reguler',
  'Sentul City Convention Hall (Auditorium B)',
  12,
  3,
  'Kabupaten Bogor',
  'Jawa Barat',
  'Jenjang 3 (Pelaksana K3)',
  'Dinas PUPR Kab. Bogor',
  'Selesai & Tersertifikasi',
  'Bimtek komprehensif implementasi Permen PUPR No. 10/2021',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '1 hour'
),
(
  'PEL-2026-003',
  '2026',
  'Mobile Training Unit (MTU) Tukang Pasang Bata & Plesteran',
  'Mobile Training Unit (MTU)',
  'Kecamatan Leuwiliang & Cigudeg',
  10,
  2,
  'Kabupaten Bogor',
  'Jawa Barat',
  'Jenjang 2 (Tukang Terampil)',
  'Dinas PUPR Kab. Bogor & Balai Jasa Konstruksi',
  'Sedang Berjalan',
  'Pelatihan jemput bola di desa tertinggal wilayah Bogor Barat',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '2 hours'
),
(
  'PEL-2026-004',
  '2026',
  'Fasilitasi Sertifikasi Juru Ukur (Surveyor) Berbasis SKK',
  'On The Job Training',
  'Proyek Jl. Bomang Sta 2+000 (Basecamp Samudra)',
  8,
  0,
  'Kabupaten Bogor',
  'Jawa Barat',
  'Jenjang 4 (Juru Ukur / Surveyor)',
  'DPUPR Kab. Bogor & Asosiasi Profesi Konstruksi',
  'Sedang Berjalan',
  'Praktek pengukuran kontur topografi dan total station di lapangan',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '3 hours'
),
(
  'PEL-2026-005',
  '2026',
  'Pelatihan Pengawas Pekerjaan Konstruksi Bangunan Gedung',
  'Reguler',
  'Pusdiklat Bina Konstruksi Ciawi',
  5,
  2,
  'Kabupaten Bogor',
  'Jawa Barat',
  'Jenjang 5 (Pengawas Bangunan Gedung)',
  'Dinas PUPR Kab. Bogor',
  'Sedang Berjalan',
  'Fokus pada pengendalian mutu material beton dan pengawasan struktur',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '4 hours'
),
(
  'PEL-2026-006',
  '2026',
  'Pelatihan Operator Alat Berat Backhoe Loader Tingkat Dasar',
  'Reguler',
  'Workshop Alat Berat DPU Kab. Bogor Cibinong',
  4,
  0,
  'Kabupaten Bogor',
  'Jawa Barat',
  'Jenjang 2 (Operator Alat Berat)',
  'Dinas PUPR Kab. Bogor bekerjasama dengan Balai Pelatihan Vokasi',
  'Selesai & Tersertifikasi',
  'Pelatihan pengoperasian aman, inspeksi harian, dan perawatan alat berat',
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '5 hours'
),
(
  'PEL-2026-007',
  '2026',
  'Bimtek Manajemen Kontrak Konstruksi & Pengadaan Jasa Konstruksi',
  'Daring / E-Learning',
  'Aula DPUPR Kab. Bogor & Zoom Cloud Meeting',
  2,
  1,
  'Kabupaten Bogor',
  'Jawa Barat',
  'Jenjang 6 (Ahli Manajemen Konstruksi)',
  'Dinas PUPR Kab. Bogor',
  'Selesai & Tersertifikasi',
  'Bimbingan teknis klausul kontrak konstruksi dan mitigasi klaim',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO UPDATE SET
  tahun = EXCLUDED.tahun,
  nama_kegiatan = EXCLUDED.nama_kegiatan,
  metode = EXCLUDED.metode,
  lokasi = EXCLUDED.lokasi,
  jumlah_l = EXCLUDED.jumlah_l,
  jumlah_p = EXCLUDED.jumlah_p,
  kab_kota = EXCLUDED.kab_kota,
  propinsi = EXCLUDED.propinsi,
  skk_jenjang = EXCLUDED.skk_jenjang,
  penyelenggara = EXCLUDED.penyelenggara,
  status = EXCLUDED.status,
  keterangan = EXCLUDED.keterangan,
  updated_at = EXCLUDED.updated_at;

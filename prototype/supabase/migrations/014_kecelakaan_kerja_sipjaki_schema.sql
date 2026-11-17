-- =============================================================================
-- SIPJAKI KABUPATEN BOGOR - MIGRATION 014
-- STANDARDISASI TABEL DATA KECELAKAAN KERJA (SMKK 11 KOLOM SIPJAKI PUSAT)
-- =============================================================================

-- 1. Buat Tabel public.kecelakaan_kerja jika belum ada
CREATE TABLE IF NOT EXISTS public.kecelakaan_kerja (
  id                          VARCHAR(50) PRIMARY KEY,              -- Contoh: "K3-2026-001"
  nama_pekerjaan              VARCHAR(300) NOT NULL,               -- Nama paket pekerjaan konstruksi terkait
  paket_pekerjaan_id          VARCHAR(50) REFERENCES public.paket_pekerjaan(id) ON DELETE SET NULL,
  nama_perusahaan             VARCHAR(255) NOT NULL,               -- Kontraktor pelaksana / BUJK
  bujk_id                     VARCHAR(50) REFERENCES public.bujk(id) ON DELETE SET NULL,
  lokasi                      VARCHAR(255) NOT NULL,               -- STA / Titik lokasi kejadian di Kab. Bogor
  tanggal                     DATE NOT NULL,                       -- Tanggal terjadinya kecelakaan
  waktu_jam                   VARCHAR(20) DEFAULT '10:00 WIB',     -- Jam terjadinya insiden
  deskripsi                   TEXT NOT NULL,                       -- Kronologi singkat peristiwa
  kerugian                    VARCHAR(255) NOT NULL,               -- Deskripsi dampak korban / material
  kategori_kerugian           VARCHAR(50) DEFAULT 'Luka Ringan' 
                              CHECK (kategori_kerugian IN ('Nir-Korban (Near Miss)', 'Luka Ringan', 'Luka Berat', 'Fatalitas / Meninggal')),
  estimasi_kerugian_nominal   NUMERIC(15, 2) DEFAULT 0,            -- Estimasi kerugian finansial aset/alat (Rp)
  masalah                     TEXT NOT NULL,                       -- Penyebab kejadian (unsafe action/condition)
  propinsi                    VARCHAR(100) DEFAULT 'Jawa Barat',
  kab_kota                    VARCHAR(100) DEFAULT 'Kabupaten Bogor',
  sumber_dana                 VARCHAR(50) NOT NULL DEFAULT 'APBD'
                              CHECK (sumber_dana IN ('APBD', 'DAK', 'APBN', 'Bantuan Keuangan')),
  status                      VARCHAR(50) DEFAULT 'Dalam Investigasi'
                              CHECK (status IN ('Dalam Investigasi', 'Dalam Pemantauan', 'Selesai (Investigasi Ditutup)')),
  dokumen_bap_url             VARCHAR(255),                        -- Berkas BAP Insiden K3 (PDF)
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indeks Kinerja untuk Riwayat Terkini & Penyaringan Cepat
CREATE INDEX IF NOT EXISTS idx_kecelakaan_updated_at ON public.kecelakaan_kerja(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_kecelakaan_tanggal ON public.kecelakaan_kerja(tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_kecelakaan_sumber_dana ON public.kecelakaan_kerja(sumber_dana);
CREATE INDEX IF NOT EXISTS idx_kecelakaan_kategori ON public.kecelakaan_kerja(kategori_kerugian);
CREATE INDEX IF NOT EXISTS idx_kecelakaan_paket ON public.kecelakaan_kerja(paket_pekerjaan_id);

-- 3. Row Level Security (RLS) Policies
ALTER TABLE public.kecelakaan_kerja ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view kecelakaan_kerja" ON public.kecelakaan_kerja;
CREATE POLICY "Public can view kecelakaan_kerja" ON public.kecelakaan_kerja FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage kecelakaan_kerja" ON public.kecelakaan_kerja;
CREATE POLICY "Admins can manage kecelakaan_kerja" ON public.kecelakaan_kerja FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN_BIDANG')
  )
);

-- 4. Seed Data Kejadian Kecelakaan Konstruksi Kabupaten Bogor TA 2026 & TA 2025
-- Catatan: paket_pekerjaan_id dan bujk_id diset NULL agar tidak memicu error foreign key 23503
-- jika data paket pekerjaan terkait belum diinput di remote database.
INSERT INTO public.kecelakaan_kerja (
  id, nama_pekerjaan, paket_pekerjaan_id, nama_perusahaan, bujk_id, lokasi,
  tanggal, waktu_jam, deskripsi, kerugian, kategori_kerugian, estimasi_kerugian_nominal,
  masalah, propinsi, kab_kota, sumber_dana, status, dokumen_bap_url, created_at, updated_at
) VALUES
(
  'K3-2026-001',
  'Peningkatan Jalan Poros Bojonggede - Kemang (Jl. Bomang Sta 0+000 s/d Sta 2+500)',
  NULL,
  'PT. Samudra Beton Persada',
  NULL,
  'Kecamatan Bojonggede (Sta 01+150)',
  '2026-04-12',
  '14:15 WIB',
  'Pekerja tertimpa material saat proses pembongkaran bekisting saluran u-ditch beton precast.',
  'Luka Ringan (Memar bahu kiri pekerja)',
  'Luka Ringan',
  2500000.00,
  'Unsafe Condition: Sling pengangkat mengalami pergeseran titik tumpu dan pekerja berada di bawah radius ayunan.',
  'Jawa Barat',
  'Kabupaten Bogor',
  'APBD',
  'Selesai (Investigasi Ditutup)',
  'BAP_K3_Jl_Bomang_2026.pdf',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '10 minutes'
),
(
  'K3-2026-002',
  'Rekonstruksi Jalan Raya Cibinong - Citeureup Sta 0+000 s/d 4+200',
  NULL,
  'PT Bangun Jaya Konstruksi',
  NULL,
  'Kecamatan Citeureup (Depan Pasar Citeureup STA 04+250)',
  '2026-05-14',
  '14:30 WIB',
  'Pekerja terpeleset saat menurunkan besi tulangan dari bak dump truck di area padat lalu lintas.',
  'Luka Ringan (Luka lecet dan memar lengan kanan)',
  'Luka Ringan',
  1500000.00,
  'Unsafe Action: Pekerja tidak menggunakan sarung tangan pelindung anti-slip dan pijakan licin akibat hujan rintik.',
  'Jawa Barat',
  'Kabupaten Bogor',
  'APBD',
  'Selesai (Investigasi Ditutup)',
  'BAP_K3_Cibinong_Citeureup_2026.pdf',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '2 hours'
),
(
  'K3-2026-003',
  'Rehabilitasi Jembatan Sungai Cikeas dan Penguatan Dinding Tebing Penahan',
  NULL,
  'PT Infrastruktur Bogor Raya',
  NULL,
  'Kecamatan Cikeas (Abutment 2 Sisi Selatan)',
  '2026-06-22',
  '09:15 WIB',
  'Tukang perancah jatuh terpeleset dari ketinggian platform scaffolding setinggi 3.5 meter.',
  'Luka Berat (Fraktur pergelangan tangan kiri & benturan dada)',
  'Luka Berat',
  18000000.00,
  'Unsafe Action: Tali pengait full body harness tidak dikaitkan pada lifeline vertikal yang tersedia di lokasi.',
  'Jawa Barat',
  'Kabupaten Bogor',
  'APBN',
  'Dalam Pemantauan',
  'BAP_K3_Jembatan_Cikeas_2026.pdf',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '1 day'
),
(
  'K3-2026-004',
  'Pembangunan Drainase Primer Kawasan Pusat Pertumbuhan Kec. Parung',
  NULL,
  'CV Teknik Sejahtera',
  NULL,
  'Kecamatan Parung (Saluran Sekunder Desa Lebak Wangi)',
  '2026-07-08',
  '11:00 WIB',
  'Longsoran dinding galian tanah sedalam 2 meter menimbun alat pompa air dan pipa saluran.',
  'Nir-Korban (Kerusakan pompa air & peralatan kerja)',
  'Nir-Korban (Near Miss)',
  7500000.00,
  'Unsafe Condition: Dinding tanah galian labil pasca hujan lebat dan belum terpasang turap penahan (sheet pile).',
  'Jawa Barat',
  'Kabupaten Bogor',
  'APBD',
  'Selesai (Investigasi Ditutup)',
  'BAP_K3_Drainase_Parung_2026.pdf',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '3 days'
),
(
  'K3-2025-001',
  'Pembangunan Jembatan Gantung Rawayan Penghubung Antar Desa Sukajaya',
  NULL,
  'PT Mitra Pembangunan Nusantara',
  NULL,
  'Kecamatan Sukajaya (Desa Pasir Madang)',
  '2025-08-19',
  '10:30 WIB',
  'Pekerja tergelincir saat pemasangan sling kabel penyeimbang di atas aliran sungai.',
  'Luka Ringan (Terkilir pergelangan kaki)',
  'Luka Ringan',
  2000000.00,
  'Unsafe Action: Permukaan batuan licin basah dan pekerja tidak memakai safety shoes anti-slip bertapak bergerigi.',
  'Jawa Barat',
  'Kabupaten Bogor',
  'APBD',
  'Selesai (Investigasi Ditutup)',
  'BAP_K3_Jembatan_Sukajaya_2025.pdf',
  '2025-08-19 11:00:00+07',
  '2025-09-01 16:00:00+07'
)
ON CONFLICT (id) DO UPDATE SET
  nama_pekerjaan = EXCLUDED.nama_pekerjaan,
  nama_perusahaan = EXCLUDED.nama_perusahaan,
  lokasi = EXCLUDED.lokasi,
  tanggal = EXCLUDED.tanggal,
  waktu_jam = EXCLUDED.waktu_jam,
  deskripsi = EXCLUDED.deskripsi,
  kerugian = EXCLUDED.kerugian,
  kategori_kerugian = EXCLUDED.kategori_kerugian,
  estimasi_kerugian_nominal = EXCLUDED.estimasi_kerugian_nominal,
  masalah = EXCLUDED.masalah,
  sumber_dana = EXCLUDED.sumber_dana,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;

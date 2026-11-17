-- =============================================================================
-- SIPJAKI KABUPATEN BOGOR - MIGRATION 020
-- PENGELOLAAN PESERTA PELATIHAN TKK: 2 SKEMA (INTERNAL & EKSTERNAL),
-- PENGUNCIAN NIK TUNGGAL (UNIQUE KEY), DAN PENERBITAN SERTIFIKAT OTOMATIS
-- =============================================================================

-- 1. Tabel Master Peserta Pelatihan TKK
CREATE TABLE IF NOT EXISTS public.peserta_pelatihan (
  id                          VARCHAR(50) PRIMARY KEY,              -- Contoh: "PST-2026-0094"
  nik                         VARCHAR(16) NOT NULL,                 -- Primary/Unique Key 16 Digit
  nama_lengkap                VARCHAR(255) NOT NULL,
  email                       VARCHAR(150) NOT NULL,
  telepon                     VARCHAR(30) NOT NULL,
  pendidikan_terakhir         VARCHAR(50) NOT NULL DEFAULT 'SMA/SMK',
  riwayat_pekerjaan           TEXT,
  skema_pendaftaran           VARCHAR(30) NOT NULL DEFAULT 'Internal (Batch)'
                              CHECK (skema_pendaftaran IN ('Internal (Batch)', 'Eksternal (Mandiri)')),
  asal_instansi_bujk          VARCHAR(255),                         -- Nama BUJK atau 'Mandiri'
  memiliki_sertifikat_lpjk    BOOLEAN DEFAULT false,
  nomor_registrasi_lpjk       VARCHAR(100),
  dokumen_scan_lpjk_url       VARCHAR(255),
  is_first_login              BOOLEAN DEFAULT false,                -- True untuk Internal sebelum ganti password
  status_verifikasi           VARCHAR(50) NOT NULL DEFAULT 'Terverifikasi'
                              CHECK (status_verifikasi IN ('Menunggu Verifikasi', 'Terverifikasi', 'Ditolak')),
  catatan_admin               TEXT,
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW(),

  -- Konstrain Integritas Data
  CONSTRAINT uk_peserta_pelatihan_nik UNIQUE (nik),
  CONSTRAINT chk_peserta_pelatihan_nik_length CHECK (length(nik) = 16)
);

-- 2. Tabel Riwayat Pelatihan & Sertifikasi Peserta Multi-Event
CREATE TABLE IF NOT EXISTS public.peserta_riwayat_pelatihan (
  id                          VARCHAR(50) PRIMARY KEY,              -- Contoh: "RWT-2026-001"
  peserta_id                  VARCHAR(50) NOT NULL REFERENCES public.peserta_pelatihan(id) ON DELETE CASCADE,
  nik                         VARCHAR(16) NOT NULL,
  nama_kegiatan               VARCHAR(255) NOT NULL,
  kategori_pelatihan          VARCHAR(50) NOT NULL,                 -- e.g. "PEL-GEDUNG", "K3-SMKK", "PEL-JALAN"
  tahun_pelatihan             INTEGER NOT NULL DEFAULT 2026,
  nomor_urut_peserta          VARCHAR(20) NOT NULL,                 -- e.g. "0094"
  nomor_sertifikat            VARCHAR(100),                         -- e.g. "2026/PEL-GEDUNG/0094"
  penyelenggara               VARCHAR(255) NOT NULL DEFAULT 'Dinas PUPR Kab. Bogor & LSP Konstruksi',
  jabatan_kerja               VARCHAR(150) NOT NULL,
  jenjang_kualifikasi         VARCHAR(50) NOT NULL DEFAULT 'Jenjang 4',
  jam_pelajaran               INTEGER NOT NULL DEFAULT 32,
  kehadiran_jp                INTEGER NOT NULL DEFAULT 32,
  nilai_akhir                 NUMERIC(5, 2) DEFAULT 88.50,
  hasil_asesmen               VARCHAR(30) DEFAULT 'KOMPETEN' CHECK (hasil_asesmen IN ('KOMPETEN', 'BELUM KOMPETEN', 'DALAM PROSES')),
  tanggal_mulai               DATE NOT NULL,
  tanggal_selesai             DATE NOT NULL,
  dokumen_sertifikat_url      VARCHAR(255),
  qr_code_token               VARCHAR(100),
  status_pelatihan            VARCHAR(50) DEFAULT 'Selesai' CHECK (status_pelatihan IN ('Sedang Berjalan', 'Selesai', 'Dibatalkan')),
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indeks Kinerja untuk Penyaringan Cepat & Urutan Terkini (DESC)
CREATE UNIQUE INDEX IF NOT EXISTS idx_peserta_nik_unique ON public.peserta_pelatihan(nik);
CREATE INDEX IF NOT EXISTS idx_peserta_email ON public.peserta_pelatihan(email);
CREATE INDEX IF NOT EXISTS idx_riwayat_peserta_desc ON public.peserta_riwayat_pelatihan(peserta_id, tahun_pelatihan DESC, tanggal_mulai DESC);
CREATE INDEX IF NOT EXISTS idx_riwayat_nomor_sertifikat ON public.peserta_riwayat_pelatihan(nomor_sertifikat);

-- 4. Row Level Security (RLS)
ALTER TABLE public.peserta_pelatihan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peserta_riwayat_pelatihan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view peserta_pelatihan" ON public.peserta_pelatihan;
CREATE POLICY "Public can view peserta_pelatihan" ON public.peserta_pelatihan FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage peserta_pelatihan" ON public.peserta_pelatihan;
CREATE POLICY "Admins can manage peserta_pelatihan" ON public.peserta_pelatihan FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can view peserta_riwayat" ON public.peserta_riwayat_pelatihan;
CREATE POLICY "Public can view peserta_riwayat" ON public.peserta_riwayat_pelatihan FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage peserta_riwayat" ON public.peserta_riwayat_pelatihan;
CREATE POLICY "Admins can manage peserta_riwayat" ON public.peserta_riwayat_pelatihan FOR ALL USING (true);

-- 5. Seed Data Awal: Peserta Internal & Eksternal beserta Riwayat Multi-Tahun
INSERT INTO public.peserta_pelatihan (
  id, nik, nama_lengkap, email, telepon, pendidikan_terakhir, riwayat_pekerjaan,
  skema_pendaftaran, asal_instansi_bujk, memiliki_sertifikat_lpjk, nomor_registrasi_lpjk,
  is_first_login, status_verifikasi, catatan_admin
) VALUES 
(
  'PST-2026-0094',
  '3201011205920001',
  'Ahmad Fauzi, A.Md',
  'ahmad.fauzi@tkk.bogor.go.id',
  '081234567891',
  'D3 Teknik Sipil',
  'Pelaksana Lapangan Proyek Gedung RSUD Parung (2024-2025), Pengawas Lapangan PT Bangun Jaya Konstruksi (2023)',
  'Internal (Batch)',
  'PT Bangun Jaya Konstruksi',
  false,
  NULL,
  false,
  'Terverifikasi',
  'Peserta utusan BUJK alokasi APBD Kabupaten Bogor TA 2026'
),
(
  'PST-2026-0095',
  '3201021408950002',
  'Dedi Kurniawan, ST',
  'dedi.kurniawan@tkk.bogor.go.id',
  '081234567892',
  'S1 Teknik Sipil',
  'Staf Teknik CV Karya Mandiri Utama (2024), Pengawas Mutu Konstruksi Jalan (2023)',
  'Internal (Batch)',
  'CV Karya Mandiri Utama',
  false,
  NULL,
  true,
  'Terverifikasi',
  'Kredensial instan terkirim ke email, simulasi wajib ubah password saat login pertama'
),
(
  'PST-2026-0096',
  '3201032104930003',
  'Budi Prasetyo',
  'budi.prasetyo@gmail.com',
  '085698765432',
  'SMA/SMK Bangunan',
  'Mandor Pembesian & Struktur Beton Proyek Flyover Bojonggede (2023-2025), Tukang Pasang Bata Tersertifikasi',
  'Eksternal (Mandiri)',
  'Pendaftaran Mandiri / Perorangan',
  true,
  'REG-2022-TKK-99120',
  false,
  'Terverifikasi',
  'Pendaftaran mandiri melalui portal publik SIJAKON, berkas scan SKK lama tervalidasi'
)
ON CONFLICT (id) DO UPDATE SET
  nik = EXCLUDED.nik,
  nama_lengkap = EXCLUDED.nama_lengkap,
  email = EXCLUDED.email,
  telepon = EXCLUDED.telepon,
  pendidikan_terakhir = EXCLUDED.pendidikan_terakhir,
  riwayat_pekerjaan = EXCLUDED.riwayat_pekerjaan,
  skema_pendaftaran = EXCLUDED.skema_pendaftaran,
  status_verifikasi = EXCLUDED.status_verifikasi,
  updated_at = NOW();

-- Riwayat Pelatihan Multi-Tahun untuk Ahmad Fauzi (Default Sort: 2026 di atas, disusul 2025 & 2024)
INSERT INTO public.peserta_riwayat_pelatihan (
  id, peserta_id, nik, nama_kegiatan, kategori_pelatihan, tahun_pelatihan, nomor_urut_peserta,
  nomor_sertifikat, penyelenggara, jabatan_kerja, jenjang_kualifikasi, jam_pelajaran,
  kehadiran_jp, nilai_akhir, hasil_asesmen, tanggal_mulai, tanggal_selesai,
  dokumen_sertifikat_url, qr_code_token, status_pelatihan
) VALUES
(
  'RWT-2026-001',
  'PST-2026-0094',
  '3201011205920001',
  'Pelatihan & Uji Sertifikasi Pelaksana Lapangan Pekerjaan Gedung Jenjang 4',
  'PEL-GEDUNG',
  2026,
  '0094',
  '2026/PEL-GEDUNG/0094',
  'Dinas PUPR Kab. Bogor bekerjasama dengan LSP Konstruksi Mandiri (BNSP)',
  'Pelaksana Lapangan Pekerjaan Gedung',
  'Jenjang 4 (Teknisi / Analis)',
  32,
  32,
  88.50,
  'KOMPETEN',
  '2026-08-10',
  '2026-08-18',
  'SKK_Digital_2026_PEL_GEDUNG_0094.pdf',
  'SIJAKON-VERIF-2026-0094-FAUZI',
  'Selesai'
),
(
  'RWT-2025-001',
  'PST-2026-0094',
  '3201011205920001',
  'Bimbingan Teknis Petugas Keselamatan Konstruksi (K3 & SMKK)',
  'K3-SMKK',
  2025,
  '0032',
  '2025/K3-SMKK/0032',
  'Dinas PUPR Kab. Bogor & Balai Jasa Konstruksi Wilayah III',
  'Petugas Keselamatan Konstruksi',
  'Jenjang 3 (Operator / Terampil)',
  24,
  24,
  86.00,
  'KOMPETEN',
  '2025-06-12',
  '2025-06-15',
  'Sertifikat_Bimtek_2025_K3_SMKK_0032.pdf',
  'SIJAKON-VERIF-2025-0032-FAUZI',
  'Selesai'
),
(
  'RWT-2024-001',
  'PST-2026-0094',
  '3201011205920001',
  'Mobile Training Unit (MTU): Vokasi Juru Ukur & Pengukuran Topografi Konstruksi Jalan',
  'PEL-JALAN',
  2024,
  '0015',
  '2024/PEL-JALAN/0015',
  'Dinas PUPR Kab. Bogor',
  'Juru Ukur / Surveyor',
  'Jenjang 2 (Terampil)',
  20,
  20,
  82.50,
  'KOMPETEN',
  '2024-04-20',
  '2024-04-23',
  'Sertifikat_MTU_2024_PEL_JALAN_0015.pdf',
  'SIJAKON-VERIF-2024-0015-FAUZI',
  'Selesai'
)
ON CONFLICT (id) DO UPDATE SET
  nomor_sertifikat = EXCLUDED.nomor_sertifikat,
  hasil_asesmen = EXCLUDED.hasil_asesmen,
  nilai_akhir = EXCLUDED.nilai_akhir,
  updated_at = NOW();

-- =============================================================================
-- SIPJAKI KABUPATEN BOGOR - MIGRATION 016
-- STANDARDISASI TABEL PERENCANAAN PELATIHAN & SERTIFIKASI TKK (SIPJAKI PUSAT)
-- =============================================================================

-- 1. Buat Tabel public.pelatihan_perencanaan_sipjaki jika belum ada
CREATE TABLE IF NOT EXISTS public.pelatihan_perencanaan_sipjaki (
  id                  VARCHAR(50) PRIMARY KEY,              -- Contoh: "PRC-PEL-2026-001"
  tahun               VARCHAR(10) NOT NULL DEFAULT '2026',
  wilayah             VARCHAR(255) NOT NULL DEFAULT 'JAWA BARAT, KABUPATEN BOGOR',
  kab_kota            VARCHAR(100) NOT NULL DEFAULT 'KABUPATEN BOGOR',
  propinsi            VARCHAR(100) NOT NULL DEFAULT 'JAWA BARAT',
  target_pelaksanaan  INTEGER NOT NULL DEFAULT 3,
  satuan_target       VARCHAR(50) DEFAULT 'Pelaksanaan',
  dokumen_kak_url     VARCHAR(255) DEFAULT 'KAK_Rencana_Pelatihan_TKK_2026.pdf',
  status              VARCHAR(50) NOT NULL DEFAULT 'Menunggu Verifikasi'
                      CHECK (status IN ('Menunggu Verifikasi', 'Terverifikasi', 'Ditolak')),
  catatan_verifikasi  TEXT,
  anggaran_estimasi   NUMERIC(15, 2) DEFAULT 350000000.00,
  uraian_rencana      TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indeks Kinerja untuk Penyaringan Cepat & Riwayat Terkini
CREATE INDEX IF NOT EXISTS idx_perencanaan_pelatihan_tahun ON public.pelatihan_perencanaan_sipjaki(tahun DESC);
CREATE INDEX IF NOT EXISTS idx_perencanaan_pelatihan_updated ON public.pelatihan_perencanaan_sipjaki(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_perencanaan_pelatihan_status ON public.pelatihan_perencanaan_sipjaki(status);

-- 3. Row Level Security (RLS) & Kebijakan Hak Akses
ALTER TABLE public.pelatihan_perencanaan_sipjaki ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view perencanaan_pelatihan" ON public.pelatihan_perencanaan_sipjaki;
CREATE POLICY "Public can view perencanaan_pelatihan" ON public.pelatihan_perencanaan_sipjaki FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage perencanaan_pelatihan" ON public.pelatihan_perencanaan_sipjaki;
CREATE POLICY "Admins can manage perencanaan_pelatihan" ON public.pelatihan_perencanaan_sipjaki FOR ALL USING (true);

-- 4. Seed Data Awal Baku (Tahun Berjalan 2026 & Arsip 2025)
INSERT INTO public.pelatihan_perencanaan_sipjaki (
  id, tahun, wilayah, kab_kota, propinsi, target_pelaksanaan, satuan_target,
  dokumen_kak_url, status, catatan_verifikasi, anggaran_estimasi, uraian_rencana, created_at, updated_at
) VALUES
(
  'PRC-PEL-2026-001',
  '2026',
  'JAWA BARAT, KABUPATEN BOGOR',
  'KABUPATEN BOGOR',
  'JAWA BARAT',
  3,
  'Pelaksanaan',
  'KAK_Rencana_Pelatihan_TKK_Kab_Bogor_2026.pdf',
  'Menunggu Verifikasi',
  'Dokumen KAK dan usulan anggaran telah disubmit ke Balai Jasa Konstruksi Wilayah III, menunggu review verifikator.',
  450000000.00,
  'Usulan Rencana Kerja Tahunan Pembinaan TKK: 1. Pelatihan Pelaksana Lapangan Jalan Madya, 2. Bimtek Petugas K3 Konstruksi & SMKK, 3. Mobile Training Unit (MTU) Tukang Pasang Bata & Plesteran.',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '30 minutes'
),
(
  'PRC-PEL-2025-001',
  '2025',
  'JAWA BARAT, KABUPATEN BOGOR',
  'KABUPATEN BOGOR',
  'JAWA BARAT',
  5,
  'Pelaksanaan',
  'KAK_Rencana_Pelatihan_TKK_Kab_Bogor_2025.pdf',
  'Terverifikasi',
  'Rencana kerja telah disetujui penuh oleh Tim Pembina Jasa Konstruksi Provinsi Jawa Barat.',
  620000000.00,
  'Realisasi 5 paket pelatihan vokasi & uji sertifikasi tenaga terampil gedung dan jalan Kabupaten Bogor.',
  '2025-01-15 08:30:00+07',
  '2025-02-01 14:00:00+07'
)
ON CONFLICT (id) DO UPDATE SET
  tahun = EXCLUDED.tahun,
  wilayah = EXCLUDED.wilayah,
  kab_kota = EXCLUDED.kab_kota,
  propinsi = EXCLUDED.propinsi,
  target_pelaksanaan = EXCLUDED.target_pelaksanaan,
  dokumen_kak_url = EXCLUDED.dokumen_kak_url,
  status = EXCLUDED.status,
  catatan_verifikasi = EXCLUDED.catatan_verifikasi,
  anggaran_estimasi = EXCLUDED.anggaran_estimasi,
  uraian_rencana = EXCLUDED.uraian_rencana,
  updated_at = EXCLUDED.updated_at;

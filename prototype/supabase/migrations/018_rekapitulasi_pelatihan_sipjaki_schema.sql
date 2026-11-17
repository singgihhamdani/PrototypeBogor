-- =============================================================================
-- SIPJAKI KABUPATEN BOGOR - MIGRATION 018
-- STANDARDISASI TABEL REKAPITULASI PELATIHAN & SERTIFIKASI TKK (SIPJAKI PUSAT)
-- =============================================================================

-- 1. Buat Tabel public.pelatihan_rekapitulasi_sipjaki jika belum ada
CREATE TABLE IF NOT EXISTS public.pelatihan_rekapitulasi_sipjaki (
  id                  VARCHAR(50) PRIMARY KEY,              -- Contoh: "REK-PEL-2026-001"
  tahun               VARCHAR(10) NOT NULL DEFAULT '2026',
  wilayah             VARCHAR(255) NOT NULL DEFAULT 'JAWA BARAT, KABUPATEN BOGOR',
  kab_kota            VARCHAR(100) NOT NULL DEFAULT 'KABUPATEN BOGOR',
  propinsi            VARCHAR(100) NOT NULL DEFAULT 'JAWA BARAT',
  target              INTEGER NOT NULL DEFAULT 3,
  terpenuhi           INTEGER NOT NULL DEFAULT 3,
  total_tkk           INTEGER NOT NULL DEFAULT 90,
  satuan_target       VARCHAR(50) DEFAULT 'Pelaksanaan',
  satuan_tkk          VARCHAR(50) DEFAULT 'Orang',
  capaian_pct         NUMERIC(5, 2) DEFAULT 100.00,
  dokumen_rekap_url   VARCHAR(255) DEFAULT 'Rekap_Realisasi_Pelatihan_TKK_2026.pdf',
  status              VARCHAR(50) NOT NULL DEFAULT 'Menunggu Verifikasi'
                      CHECK (status IN ('Menunggu Verifikasi', 'Terverifikasi', 'Ditolak')),
  catatan_verifikasi  TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indeks Kinerja untuk Penyaringan Cepat & Riwayat Terkini
CREATE INDEX IF NOT EXISTS idx_rekap_pelatihan_tahun ON public.pelatihan_rekapitulasi_sipjaki(tahun DESC);
CREATE INDEX IF NOT EXISTS idx_rekap_pelatihan_status ON public.pelatihan_rekapitulasi_sipjaki(status);
CREATE INDEX IF NOT EXISTS idx_rekap_pelatihan_updated ON public.pelatihan_rekapitulasi_sipjaki(updated_at DESC);

-- 3. Row Level Security (RLS) & Kebijakan Hak Akses
ALTER TABLE public.pelatihan_rekapitulasi_sipjaki ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view rekapitulasi_pelatihan" ON public.pelatihan_rekapitulasi_sipjaki;
CREATE POLICY "Public can view rekapitulasi_pelatihan" ON public.pelatihan_rekapitulasi_sipjaki FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage rekapitulasi_pelatihan" ON public.pelatihan_rekapitulasi_sipjaki;
CREATE POLICY "Admins can manage rekapitulasi_pelatihan" ON public.pelatihan_rekapitulasi_sipjaki FOR ALL USING (true);

-- 4. Seed Data Awal Baku (Tahun Berjalan 2026 & Arsip TA 2025)
INSERT INTO public.pelatihan_rekapitulasi_sipjaki (
  id, tahun, wilayah, kab_kota, propinsi, target, terpenuhi, total_tkk,
  satuan_target, satuan_tkk, capaian_pct, dokumen_rekap_url, status,
  catatan_verifikasi, created_at, updated_at
) VALUES
(
  'REK-PEL-2026-001',
  '2026',
  'JAWA BARAT, KABUPATEN BOGOR',
  'KABUPATEN BOGOR',
  'JAWA BARAT',
  3,
  3,
  90,
  'Pelaksanaan',
  'Orang',
  100.00,
  'Rekap_Realisasi_Pelatihan_TKK_2026.pdf',
  'Menunggu Verifikasi',
  'Rekapitulasi 3 paket pelatihan fisik Kabupaten Bogor TA 2026 (Pelaksana Jalan Madya, Bimtek K3, dan MTU Bata) dengan total 90 TKK lulus uji sertifikasi BNSP.',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '30 minutes'
),
(
  'REK-PEL-2025-001',
  '2025',
  'JAWA BARAT, KABUPATEN BOGOR',
  'KABUPATEN BOGOR',
  'JAWA BARAT',
  5,
  5,
  150,
  'Pelaksanaan',
  'Orang',
  100.00,
  'Rekap_Realisasi_Pelatihan_TKK_2025.pdf',
  'Terverifikasi',
  'Realisasi penuh 5 paket pelatihan vokasi dan fasilitasi sertifikasi TKK Kabupaten Bogor TA 2025 telah diverifikasi oleh Tim Pembina Jasa Konstruksi Provinsi Jawa Barat.',
  '2025-12-10 09:00:00+07',
  '2025-12-20 15:30:00+07'
)
ON CONFLICT (id) DO UPDATE SET
  tahun = EXCLUDED.tahun,
  wilayah = EXCLUDED.wilayah,
  kab_kota = EXCLUDED.kab_kota,
  propinsi = EXCLUDED.propinsi,
  target = EXCLUDED.target,
  terpenuhi = EXCLUDED.terpenuhi,
  total_tkk = EXCLUDED.total_tkk,
  satuan_target = EXCLUDED.satuan_target,
  satuan_tkk = EXCLUDED.satuan_tkk,
  capaian_pct = EXCLUDED.capaian_pct,
  dokumen_rekap_url = EXCLUDED.dokumen_rekap_url,
  status = EXCLUDED.status,
  catatan_verifikasi = EXCLUDED.catatan_verifikasi,
  updated_at = EXCLUDED.updated_at;

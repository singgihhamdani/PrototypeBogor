-- =============================================================================
-- SIPJAKI KABUPATEN BOGOR - MIGRATION 022
-- REFACTOR TABEL REKAPITULASI PELATIHAN & SERTIFIKASI TKK (SIPJAKI PUSAT)
-- Peniadaan Status, Standarisasi 11 Kolom Baku SIPJAKI, & Index Riwayat Terkini
-- =============================================================================

-- 1. Pastikan kolom target, terpenuhi, total_tkk, capaian_pct, dokumen_rekap_url dan updated_at ada
ALTER TABLE IF EXISTS public.pelatihan_rekapitulasi_sipjaki
  ADD COLUMN IF NOT EXISTS target INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS terpenuhi INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_tkk INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS satuan_target VARCHAR(50) DEFAULT 'Pelaksanaan',
  ADD COLUMN IF NOT EXISTS satuan_tkk VARCHAR(50) DEFAULT 'Orang',
  ADD COLUMN IF NOT EXISTS capaian_pct NUMERIC(5, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS dokumen_rekap_url VARCHAR(255) DEFAULT 'Rekap_Realisasi_Pelatihan_TKK_2026.pdf',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Pastikan kolom status dapat menerima NULL atau default yang fleksibel jika status ditiadakan
ALTER TABLE IF EXISTS public.pelatihan_rekapitulasi_sipjaki 
  ALTER COLUMN status DROP NOT NULL;

-- 3. Indeks Kinerja untuk Pengurutan Default Riwayat Terkini (DESC)
CREATE INDEX IF NOT EXISTS idx_rekap_pelatihan_updated_desc ON public.pelatihan_rekapitulasi_sipjaki(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_rekap_pelatihan_tahun_desc ON public.pelatihan_rekapitulasi_sipjaki(tahun DESC);

-- 4. Komentar Dokumentasi Skema
COMMENT ON TABLE public.pelatihan_rekapitulasi_sipjaki IS 'Tabel Rekapitulasi Pelatihan TKK Standar Baku SIPJAKI Kementerian PUPR dengan dukungan CRUD Edit & Hapus serta Default Sort Terkini.';

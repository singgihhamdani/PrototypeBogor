-- =============================================================================
-- SIPJAKI KABUPATEN BOGOR - MIGRATION 023
-- REFACTOR TABEL LAPORAN PELATIHAN & SERTIFIKASI TKK (DUA SUBSTANSI DOKUMEN & EDIT)
-- =============================================================================

-- 1. Tambahkan kolom dokumen_kak_url jika belum ada pada pelatihan_laporan_sipjaki
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'pelatihan_laporan_sipjaki' 
      AND column_name = 'dokumen_kak_url'
  ) THEN
    ALTER TABLE public.pelatihan_laporan_sipjaki ADD COLUMN dokumen_kak_url VARCHAR(255) DEFAULT 'KAK_Pelatihan_TKK_2026.pdf';
  END IF;
END $$;

-- 2. Pastikan kolom dokumen_ba_url tetap ada sebagai berkas Berita Acara / Laporan Lainnya
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'pelatihan_laporan_sipjaki' 
      AND column_name = 'dokumen_ba_url'
  ) THEN
    ALTER TABLE public.pelatihan_laporan_sipjaki ADD COLUMN dokumen_ba_url VARCHAR(255) DEFAULT 'BA_Pelatihan_TKK_2026.pdf';
  END IF;
END $$;

-- 3. Perbarui Data Awal dengan 2 Berkas (KAK & BA)
UPDATE public.pelatihan_laporan_sipjaki
SET 
  dokumen_kak_url = 'KAK_Pelatihan_Pelaksana_Jalan_2026.pdf',
  dokumen_ba_url = 'BA_Kelulusan_Pelaksana_Jalan_2026.pdf',
  updated_at = NOW()
WHERE id = 'LAP-PEL-2026-001';

UPDATE public.pelatihan_laporan_sipjaki
SET 
  dokumen_kak_url = 'KAK_Bimtek_K3_Konstruksi_2026.pdf',
  dokumen_ba_url = 'BA_Sertifikasi_K3_Konstruksi_2026.pdf',
  updated_at = NOW()
WHERE id = 'LAP-PEL-2026-002';

UPDATE public.pelatihan_laporan_sipjaki
SET 
  dokumen_kak_url = 'KAK_MTU_Tukang_Bata_2026.pdf',
  dokumen_ba_url = 'BA_Kelulusan_MTU_Bata_2026.pdf',
  updated_at = NOW()
WHERE id = 'LAP-PEL-2026-003';

-- 4. Indeks Kinerja Tambahan untuk Sorting Riwayat Terkini DESC
CREATE INDEX IF NOT EXISTS idx_laporan_pelatihan_updated_desc ON public.pelatihan_laporan_sipjaki(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_laporan_pelatihan_tanggal_desc ON public.pelatihan_laporan_sipjaki(tanggal DESC);

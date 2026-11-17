-- =============================================================================
-- MIGRATION: 021_pelatihan_hub_dua_sertifikat_schema.sql
-- DESKRIPSI: Skema Modernisasi Penyelenggaraan Pelatihan & Fasilitasi Sertifikasi TKK
--            1. Pemisahan 2 Kolom Sertifikat: Sertifikat Partisipasi DPU (Auto) & SKK LPJK (Manual)
--            2. Klasifikasi Jenjang Tenaga Terampil PP No. 14 Tahun 2021 (Jenjang 1 s/d 6 terpisah)
--            3. Validasi Registrasi & Penomoran Sertifikat Otomatis DPU
--            4. Kolom Edit & Hapus (Full CRUD Peserta)
--            5. Indeks Performa Default Sort Kronologis Terbalik (DESC)
-- =============================================================================

-- 1. Tambahkan kolom pendukung pada tabel pelatihan_peserta
ALTER TABLE IF EXISTS public.pelatihan_peserta 
  ADD COLUMN IF NOT EXISTS nomor_sertifikat_dpu VARCHAR(100),
  ADD COLUMN IF NOT EXISTS nomor_skk_lpjk VARCHAR(100),
  ADD COLUMN IF NOT EXISTS skk_jenjang_pp14 VARCHAR(50) CHECK (skk_jenjang_pp14 IN ('Jenjang 1', 'Jenjang 2', 'Jenjang 3', 'Jenjang 4', 'Jenjang 5', 'Jenjang 6')),
  ADD COLUMN IF NOT EXISTS is_validated BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ;

-- 2. Pastikan tabel pelatihan_agenda memiliki kolom skk_jenjang_pp14 diskret
ALTER TABLE IF EXISTS public.pelatihan_agenda
  ADD COLUMN IF NOT EXISTS skk_jenjang_pp14 VARCHAR(50);

-- 3. Indeks Performa untuk Default Sort Terkini (DESC)
CREATE INDEX IF NOT EXISTS idx_pelatihan_agenda_created_desc 
  ON public.pelatihan_agenda (tanggal_mulai DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pelatihan_peserta_updated_desc 
  ON public.pelatihan_peserta (created_at DESC, updated_at DESC);

-- 4. Fungsi Auto-Generate Nomor Sertifikat Partisipasi DPU
-- Format Baku: [Tahun] / [Kode Program] / [Nomor Urut Peserta] (cth: 2026/DPU-K3/0014)
CREATE OR REPLACE FUNCTION public.generate_nomor_sertifikat_dpu(
  p_tahun VARCHAR,
  p_kode_program VARCHAR,
  p_no_urut INTEGER
) RETURNS VARCHAR AS $$
BEGIN
  RETURN p_tahun || '/' || p_kode_program || '/' || LPAD(p_no_urut::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. Seed / Update Data Peserta dengan 2 Kolom Sertifikat & Jenjang PP 14/2021
UPDATE public.pelatihan_peserta
SET 
  nomor_sertifikat_dpu = '2026/DPU-K3/0001',
  nomor_skk_lpjk = 'REG-2026-LPJK-88219',
  skk_jenjang_pp14 = 'Jenjang 5',
  is_validated = true,
  validated_at = NOW()
WHERE nik = '3201011203900001';

UPDATE public.pelatihan_peserta
SET 
  nomor_sertifikat_dpu = '2026/DPU-K3/0002',
  nomor_skk_lpjk = 'REG-2026-LPJK-88220',
  skk_jenjang_pp14 = 'Jenjang 5',
  is_validated = true,
  validated_at = NOW()
WHERE nik = '3201021508880004';

UPDATE public.pelatihan_peserta
SET 
  nomor_sertifikat_dpu = '2026/DPU-TKK/0041',
  nomor_skk_lpjk = 'SKK-TUK-2026-041',
  skk_jenjang_pp14 = 'Jenjang 2',
  is_validated = true,
  validated_at = NOW()
WHERE nik = '3201050801850003';

UPDATE public.pelatihan_peserta
SET 
  nomor_sertifikat_dpu = '2026/DPU-TKK/0042',
  nomor_skk_lpjk = 'SKK-TUK-2026-042',
  skk_jenjang_pp14 = 'Jenjang 2',
  is_validated = true,
  validated_at = NOW()
WHERE nik = '3201061907870005';

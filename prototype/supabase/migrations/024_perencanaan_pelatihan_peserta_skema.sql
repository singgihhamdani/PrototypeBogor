-- =============================================================================
-- SIPJAKI KABUPATEN BOGOR - MIGRATION 024
-- REFACTOR PERENCANAAN PELATIHAN STANDAR SIPJAKI & DUA SKEMA PESERTA TKK (INTERNAL & EKSTERNAL)
-- =============================================================================

-- 1. Penyelarasan Kolom Dokumen pada Tabel Perencanaan
ALTER TABLE IF EXISTS public.pelatihan_perencanaan_sipjaki
  ADD COLUMN IF NOT EXISTS dokumen_url VARCHAR(255);

UPDATE public.pelatihan_perencanaan_sipjaki
SET dokumen_url = COALESCE(dokumen_kak_url, 'KAK_Rencana_Pelatihan_TKK_Kab_Bogor_2026.pdf')
WHERE dokumen_url IS NULL;

-- 2. Penambahan Kolom ID TKK & Persyaratan Dokumen pada Tabel Peserta Pelatihan
ALTER TABLE IF EXISTS public.peserta_pelatihan
  ADD COLUMN IF NOT EXISTS id_tkk VARCHAR(50),
  ADD COLUMN IF NOT EXISTS perencanaan_id VARCHAR(50),
  ADD COLUMN IF NOT EXISTS ktp_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS ijazah_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS foto_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS surat_tugas_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS status_kelengkapan VARCHAR(30) DEFAULT 'Belum Lengkap',
  ADD COLUMN IF NOT EXISTS kelengkapan_rincian TEXT,
  ADD COLUMN IF NOT EXISTS link_form_token VARCHAR(100);

-- 3. Indeks Kinerja untuk Pencarian ID TKK & Perencanaan ID
CREATE INDEX IF NOT EXISTS idx_peserta_id_tkk ON public.peserta_pelatihan(id_tkk);
CREATE INDEX IF NOT EXISTS idx_peserta_perencanaan_id ON public.peserta_pelatihan(perencanaan_id);
CREATE INDEX IF NOT EXISTS idx_peserta_status_kelengkapan ON public.peserta_pelatihan(status_kelengkapan);

-- 4. Seed / Update ID TKK & Dokumen Persyaratan Awal Peserta
UPDATE public.peserta_pelatihan
SET 
  id_tkk = 'TKK-2026-0001',
  perencanaan_id = 'PRC-PEL-2026-001',
  ktp_url = 'KTP_3201011504940001.pdf',
  ijazah_url = 'Ijazah_SMK_Konstruksi_0001.pdf',
  foto_url = 'Foto_3x4_Ahmad_Suryadi.jpg',
  surat_tugas_url = 'Surat_Tugas_PT_Bogor_Karya.pdf',
  status_kelengkapan = 'Lengkap',
  kelengkapan_rincian = 'Seluruh syarat wajib (KTP, Ijazah, Pas Foto) telah terunggah.',
  link_form_token = 'token-tkk-2026-0001'
WHERE nik = '3201011504940001' OR id = 'PST-2026-0094';

UPDATE public.peserta_pelatihan
SET 
  id_tkk = 'TKK-2026-0002',
  perencanaan_id = 'PRC-PEL-2026-001',
  ktp_url = 'KTP_3201022008920002.pdf',
  ijazah_url = 'Ijazah_D3_Sipil_0002.pdf',
  foto_url = 'Foto_3x4_Bambang_Pamungkas.jpg',
  status_kelengkapan = 'Lengkap',
  kelengkapan_rincian = 'Seluruh syarat wajib telah diverifikasi.',
  link_form_token = 'token-tkk-2026-0002'
WHERE nik = '3201022008920002';

UPDATE public.peserta_pelatihan
SET 
  id_tkk = 'TKK-2026-0003',
  perencanaan_id = 'PRC-PEL-2026-001',
  ktp_url = 'KTP_3201031211950003.pdf',
  foto_url = 'Foto_3x4_Candra_Wijaya.jpg',
  status_kelengkapan = 'Belum Lengkap',
  kelengkapan_rincian = 'Ijazah / Surat Pengalaman Kerja belum diunggah.',
  link_form_token = 'token-tkk-2026-0003'
WHERE nik = '3201031211950003';

UPDATE public.peserta_pelatihan
SET 
  id_tkk = 'TKK-2026-0004',
  perencanaan_id = 'PRC-PEL-2026-001',
  ktp_url = 'KTP_3201040506930004.pdf',
  ijazah_url = 'Ijazah_S1_Sipil_0004.pdf',
  foto_url = 'Foto_3x4_Dedi_Kurniawan.jpg',
  surat_tugas_url = 'Surat_Tugas_CV_Mitra_Konstruksi.pdf',
  status_kelengkapan = 'Lengkap',
  kelengkapan_rincian = 'Berkas terverifikasi lengkap.',
  link_form_token = 'token-tkk-2026-0004'
WHERE nik = '3201040506930004';

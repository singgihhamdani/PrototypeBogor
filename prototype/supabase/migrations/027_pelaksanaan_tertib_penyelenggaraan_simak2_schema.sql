-- ==============================================================================
-- Migrasi 027: Penyesuaian Skema & Normalisasi SIMAK 2 (Tertib Penyelenggaraan 2.a s.d. 2.d)
-- Berdasarkan Dokumen Baku: Format_Rinci_Pelaksanaan_Pengawasan_2a_sd_2d.xlsx
-- Permen PUPR No. 1/2023 & Permen PUPR No. 10/2021 (SMKK)
-- ==============================================================================

-- 1. Tambah kolom spesifik jika belum tersedia
ALTER TABLE pengawasan_sesi 
  ADD COLUMN IF NOT EXISTS nama_skpd TEXT,
  ADD COLUMN IF NOT EXISTS nama_satuan_kerja TEXT,
  ADD COLUMN IF NOT EXISTS nomor_kontrak TEXT;

-- 2. Normalisasi kode simak lama (SIMAK 2a -> 2.a)
UPDATE pengawasan_sesi SET simak_code = '2.a' WHERE simak_code IN ('SIMAK 2a', 'SIMAK 2.a');
UPDATE pengawasan_sesi SET simak_code = '2.b' WHERE simak_code IN ('SIMAK 2b', 'SIMAK 2.b');
UPDATE pengawasan_sesi SET simak_code = '2.c' WHERE simak_code IN ('SIMAK 2c', 'SIMAK 2.c');
UPDATE pengawasan_sesi SET simak_code = '2.d' WHERE simak_code IN ('SIMAK 2d', 'SIMAK 2.d');

-- 3. Indeks performa pencarian paket tertib penyelenggaraan
CREATE INDEX IF NOT EXISTS idx_pengawasan_sesi_tp_simak 
  ON pengawasan_sesi (tipe_tertib, simak_code, waktu_pengawasan DESC);

COMMENT ON COLUMN pengawasan_sesi.nama_skpd IS 'Nama SKPD Pemrakarsa Proyek (Khusus Formulir Simak 2.a)';
COMMENT ON COLUMN pengawasan_sesi.nama_satuan_kerja IS 'Nama Satuan Kerja APBD (Khusus Formulir Simak 2.b)';
COMMENT ON COLUMN pengawasan_sesi.nomor_kontrak IS 'Nomor Kontrak Kerja Konstruksi (Simak 2.a, 2.b, 2.c)';

-- =============================================================================
-- SIPJAKI KABUPATEN BOGOR - MIGRATION 019
-- PENGUNCIAN IDENTITAS TUNGGAL BUJK (NIB SEBAGAI UNIQUE KEY) & INDEKS RIWAYAT
-- =============================================================================

-- 1. Penambahan Konstrain Unik NIB pada tabel public.bujk
-- Mengacu pada standar OSS-RBA dan PP No. 5 Tahun 2021 (NIB 13 Digit Tunggal)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uk_bujk_nib'
  ) THEN
    ALTER TABLE public.bujk ADD CONSTRAINT uk_bujk_nib UNIQUE (nib);
  END IF;
END $$;

-- 2. Indeks Unik Performa untuk Pencarian Cepat Berdasarkan NIB
CREATE UNIQUE INDEX IF NOT EXISTS idx_bujk_nib_unique ON public.bujk(nib);

-- 3. Indeks Performa Riwayat Paket Pekerjaan Berdasarkan BUJK dan Urutan Terkini
CREATE INDEX IF NOT EXISTS idx_paket_pekerjaan_bujk_riwayat 
ON public.paket_pekerjaan(bujk_id, tanggal_mulai DESC, tahun_anggaran DESC, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_paket_pekerjaan_nib_riwayat 
ON public.paket_pekerjaan(nib_penyedia, tanggal_mulai DESC, tahun_anggaran DESC, updated_at DESC);

-- 4. Kebijakan Row Level Security (RLS)
ALTER TABLE public.bujk ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view bujk" ON public.bujk;
CREATE POLICY "Public can view bujk" ON public.bujk FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage bujk" ON public.bujk;
CREATE POLICY "Admins can manage bujk" ON public.bujk FOR ALL USING (true);

-- 5. Data Uji Riwayat Proyek Multi-Tahun untuk BUJK B001 (PT Bangun Jaya Konstruksi)
-- Memastikan pengujian urutan default dari pekerjaan terakhir (2026 -> 2025 -> 2024)
INSERT INTO public.paket_pekerjaan (
  id, nama_paket, tahun_anggaran, sumber_dana, nama_instansi,
  bujk_id, nama_penyedia, nib_penyedia, nilai_kontrak, jenis_kontrak,
  sifat_kontrak, karakteristik_kontrak, propinsi, kab_kota,
  tanggal_mulai, tanggal_selesai, progres_fisik, progres_keuangan,
  bulan_progres, bulan_progres_keuangan, status_pekerjaan,
  kode_kecamatan, kecamatan, lat, lng, created_at, updated_at
) VALUES 
(
  'P011',
  'Peningkatan Jembatan dan Dinding Penahan Tanah Cibinong - Cikeas',
  2025,
  'APBD',
  'Dinas PUPR Kab. Bogor',
  'B001',
  'PT Bangun Jaya Konstruksi',
  '1234567890123',
  4250000000,
  'Harga Satuan',
  'Tahun Tunggal',
  'Tahun Tunggal',
  'Jawa Barat',
  'Kabupaten Bogor',
  '2025-04-10',
  '2025-11-15',
  100.0,
  100.0,
  'November',
  'Desember',
  'Selesai',
  '01',
  'Kabupaten Bogor',
  -6.4850,
  106.8620,
  '2025-11-20 10:00:00+07',
  '2025-11-20 10:00:00+07'
),
(
  'P012',
  'Pemeliharaan Berkala Jalan Akses Sentul City - Babakan Madang',
  2024,
  'APBD',
  'Dinas PUPR Kab. Bogor',
  'B001',
  'PT Bangun Jaya Konstruksi',
  '1234567890123',
  2750000000,
  'Harga Satuan',
  'Tahun Tunggal',
  'Tahun Tunggal',
  'Jawa Barat',
  'Kabupaten Bogor',
  '2024-05-02',
  '2024-09-30',
  100.0,
  100.0,
  'September',
  'Oktober',
  'Selesai',
  '04',
  'Kabupaten Bogor',
  -6.5320,
  106.8650,
  '2024-10-05 14:30:00+07',
  '2024-10-05 14:30:00+07'
)
ON CONFLICT (id) DO UPDATE SET
  tahun_anggaran = EXCLUDED.tahun_anggaran,
  nilai_kontrak = EXCLUDED.nilai_kontrak,
  progres_fisik = EXCLUDED.progres_fisik,
  progres_keuangan = EXCLUDED.progres_keuangan,
  status_pekerjaan = EXCLUDED.status_pekerjaan,
  updated_at = EXCLUDED.updated_at;

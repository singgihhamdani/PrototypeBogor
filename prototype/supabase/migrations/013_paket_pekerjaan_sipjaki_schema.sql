-- =============================================================================
-- SIPJAKI KABUPATEN BOGOR - MIGRATION 013
-- STANDARDISASI TABEL PAKET PEKERJAAN 19 KOLOM SIPJAKI PUSAT
-- =============================================================================

-- 1. Penambahan Kolom Standar SIPJAKI pada tabel public.paket_pekerjaan
ALTER TABLE public.paket_pekerjaan
  ADD COLUMN IF NOT EXISTS propinsi VARCHAR(100) DEFAULT 'Jawa Barat',
  ADD COLUMN IF NOT EXISTS kab_kota VARCHAR(100) DEFAULT 'Kabupaten Bogor',
  ADD COLUMN IF NOT EXISTS karakteristik_kontrak VARCHAR(50) DEFAULT 'Tahun Tunggal',
  ADD COLUMN IF NOT EXISTS bulan_progres_keuangan VARCHAR(30) DEFAULT 'Agustus';

-- 2. Migrasi Nilai jenis_kontrak & sifat_kontrak lama ke Klasifikasi Standar SIPJAKI
-- Klasifikasi Jenis Kontrak SIPJAKI: 'Harga Satuan', 'Lump sum', 'Gabungan', 'Turn key'
UPDATE public.paket_pekerjaan
SET jenis_kontrak = CASE 
  WHEN sifat_kontrak IN ('Harga Satuan', 'Lump sum', 'Gabungan', 'Turn key') THEN sifat_kontrak
  WHEN sifat_kontrak = 'Lump Sum' THEN 'Lump sum'
  WHEN sifat_kontrak = 'Turn Key' THEN 'Turn key'
  ELSE 'Harga Satuan'
END
WHERE jenis_kontrak IS NULL OR jenis_kontrak = 'Konstruksi' OR jenis_kontrak NOT IN ('Harga Satuan', 'Lump sum', 'Gabungan', 'Turn key');

-- 3. Update Karakteristik Kontrak Default
UPDATE public.paket_pekerjaan
SET karakteristik_kontrak = 'Tahun Tunggal'
WHERE karakteristik_kontrak IS NULL;

-- 4. Constraint Check untuk Integritas Data SIPJAKI
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_paket_karakteristik_kontrak'
  ) THEN
    ALTER TABLE public.paket_pekerjaan
      ADD CONSTRAINT check_paket_karakteristik_kontrak 
      CHECK (karakteristik_kontrak IN ('Tahun Tunggal', 'Tahun Jamak'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_paket_jenis_kontrak_sipjaki'
  ) THEN
    ALTER TABLE public.paket_pekerjaan
      ADD CONSTRAINT check_paket_jenis_kontrak_sipjaki 
      CHECK (jenis_kontrak IN ('Harga Satuan', 'Lump sum', 'Gabungan', 'Turn key'));
  END IF;
END $$;

-- 5. Indeks Kinerja untuk Riwayat Terkini & Filter Standar
CREATE INDEX IF NOT EXISTS idx_paket_updated_at ON public.paket_pekerjaan(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_paket_jenis_kontrak ON public.paket_pekerjaan(jenis_kontrak);
CREATE INDEX IF NOT EXISTS idx_paket_karakteristik ON public.paket_pekerjaan(karakteristik_kontrak);
CREATE INDEX IF NOT EXISTS idx_paket_tahun_anggaran ON public.paket_pekerjaan(tahun_anggaran DESC);

-- 6. Update / Seed Data Komprehensif Kabupaten Bogor TA 2026 & 2025 (Format 19 Kolom)
INSERT INTO public.paket_pekerjaan (
  id, nama_paket, tahun_anggaran, sumber_dana, nama_instansi, bujk_id, nama_penyedia, nib_penyedia,
  nilai_kontrak, jenis_kontrak, karakteristik_kontrak, propinsi, kab_kota,
  tanggal_mulai, tanggal_selesai, progres_fisik, progres_keuangan, bulan_progres, bulan_progres_keuangan,
  status_pekerjaan, kode_kecamatan, kecamatan, lat, lng, created_at, updated_at
) VALUES
(
  'P001',
  'Rekonstruksi Jalan Raya Cibinong - Citeureup Sta 0+000 s/d 4+200',
  2026,
  'APBD',
  'Dinas PUPR Kab. Bogor',
  'B001',
  'PT Bangun Jaya Konstruksi',
  '1234567890123',
  8500000000.00,
  'Harga Satuan',
  'Tahun Tunggal',
  'Jawa Barat',
  'Kabupaten Bogor',
  '2026-03-15',
  '2026-11-30',
  68.00,
  55.00,
  'Agustus',
  'Agustus',
  'Pelaksanaan',
  '01',
  'Cibinong',
  -6.4816,
  106.8516,
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '1 hour'
),
(
  'P002',
  'Pembangunan Gedung PAUD Terpadu dan Fasilitas Olahraga Kec. Gunung Putri',
  2026,
  'DAK',
  'Dinas Pendidikan',
  'B002',
  'CV Karya Mandiri Utama',
  '2345678901234',
  3200000000.00,
  'Lump sum',
  'Tahun Tunggal',
  'Jawa Barat',
  'Kabupaten Bogor',
  '2026-04-01',
  '2026-10-15',
  82.00,
  75.00,
  'Agustus',
  'Agustus',
  'Pelaksanaan',
  '06',
  'Gunung Putri',
  -6.4483,
  106.9092,
  NOW() - INTERVAL '9 days',
  NOW() - INTERVAL '3 hours'
),
(
  'P003',
  'Peningkatan Jalan Lingkungan Permukiman Sukamahi dan Pedestrian Terpadu',
  2026,
  'APBD',
  'Dinas Perumahan, Kawasan Permukiman dan Pertanahan',
  'B003',
  'PT Mitra Pembangunan Nusantara',
  '3456789012345',
  1850000000.00,
  'Harga Satuan',
  'Tahun Tunggal',
  'Jawa Barat',
  'Kabupaten Bogor',
  '2026-05-10',
  '2026-09-30',
  90.00,
  82.00,
  'Agustus',
  'Agustus',
  'Pelaksanaan',
  '05',
  'Megamendung',
  -6.3969,
  106.9792,
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '5 hours'
),
(
  'P004',
  'Pembangunan Drainase Primer Kawasan Pusat Pertumbuhan Kec. Parung',
  2026,
  'APBD',
  'Dinas PUPR Kab. Bogor',
  'B004',
  'CV Teknik Sejahtera',
  '4567890123456',
  950000000.00,
  'Harga Satuan',
  'Tahun Tunggal',
  'Jawa Barat',
  'Kabupaten Bogor',
  '2026-06-01',
  '2026-11-15',
  45.00,
  38.00,
  'Agustus',
  'Agustus',
  'Pelaksanaan',
  '11',
  'Parung',
  -6.4211,
  106.7328,
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '12 hours'
),
(
  'P005',
  'Rehabilitasi Jembatan Sungai Cikeas dan Penguatan Dinding Tebing Penahan',
  2026,
  'APBN',
  'Balai Besar Pelaksanaan Jalan Nasional DKI-Jabar',
  'B005',
  'PT Infrastruktur Bogor Raya',
  '5678901234567',
  12500000000.00,
  'Gabungan',
  'Tahun Jamak',
  'Jawa Barat',
  'Kabupaten Bogor',
  '2026-02-20',
  '2026-12-20',
  58.00,
  48.00,
  'Agustus',
  'Agustus',
  'Pelaksanaan',
  '20',
  'Cikeas',
  -6.7012,
  106.8612,
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '1 day'
),
(
  'P006',
  'Pembangunan Pos Jaga & Gerbang Kawasan Wisata Puncak Kec. Cisarua',
  2026,
  'APBD',
  'Dinas Kebudayaan dan Pariwisata',
  'B006',
  'CV Anugerah Konstruksi',
  '6789012345678',
  650000000.00,
  'Lump sum',
  'Tahun Tunggal',
  'Jawa Barat',
  'Kabupaten Bogor',
  '2026-01-10',
  '2026-05-30',
  100.00,
  100.00,
  'Mei',
  'Juni',
  'Selesai',
  '21',
  'Cisarua',
  -6.6889,
  106.9234,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '2 days'
),
(
  'P007',
  'Peningkatan Jaringan Irigasi Sekunder DI Cipamingkis Kec. Leuwiliang',
  2026,
  'DAK',
  'Dinas PUPR Kab. Bogor',
  'B007',
  'PT Delta Cipta Perkasa',
  '7890123456789',
  4200000000.00,
  'Harga Satuan',
  'Tahun Tunggal',
  'Jawa Barat',
  'Kabupaten Bogor',
  '2026-04-15',
  '2026-12-15',
  52.00,
  44.00,
  'Agustus',
  'Agustus',
  'Pelaksanaan',
  '25',
  'Leuwiliang',
  -6.5812,
  106.6234,
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '3 days'
),
(
  'P008',
  'Pembangunan Gedung Fasilitas Pelayanan Rumah Sakit Umum Parung (Tahap II)',
  2026,
  'Bantuan Keuangan',
  'Dinas Kesehatan Kab. Bogor',
  'B009',
  'PT Graha Konstruksi Indonesia',
  '9012345678901',
  28450000000.00,
  'Turn key',
  'Tahun Jamak',
  'Jawa Barat',
  'Kabupaten Bogor',
  '2026-03-01',
  '2027-06-30',
  35.00,
  30.00,
  'Agustus',
  'Agustus',
  'Pelaksanaan',
  '11',
  'Parung',
  -6.4278,
  106.7217,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '4 days'
),
(
  'P009',
  'Peningkatan Jalan Poros Bojonggede - Kemang (Jl. Bomang Sta 0+000 s/d Sta 2+500)',
  2026,
  'APBD',
  'Dinas PUPR Kab. Bogor',
  'B001',
  'PT. Samudra Beton Persada',
  '9120003456789',
  14850000000.00,
  'Harga Satuan',
  'Tahun Tunggal',
  'Jawa Barat',
  'Kabupaten Bogor',
  '2026-03-01',
  '2026-08-27',
  74.50,
  68.00,
  'Agustus',
  'Agustus',
  'Pelaksanaan',
  '02',
  'Bojonggede',
  -6.4950,
  106.7930,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '20 minutes'
),
(
  'P010',
  'Pembangunan Jembatan Gantung Rawayan Penghubung Antar Desa Sukajaya',
  2025,
  'APBD',
  'Dinas PUPR Kab. Bogor',
  'B003',
  'PT Mitra Pembangunan Nusantara',
  '3456789012345',
  1250000000.00,
  'Lump sum',
  'Tahun Tunggal',
  'Jawa Barat',
  'Kabupaten Bogor',
  '2025-05-01',
  '2025-11-20',
  100.00,
  100.00,
  'November',
  'Desember',
  'Selesai',
  '30',
  'Sukajaya',
  -6.6120,
  106.5120,
  '2025-05-01 08:00:00+07',
  '2025-12-15 15:30:00+07'
)
ON CONFLICT (id) DO UPDATE SET
  nama_paket = EXCLUDED.nama_paket,
  tahun_anggaran = EXCLUDED.tahun_anggaran,
  sumber_dana = EXCLUDED.sumber_dana,
  nama_instansi = EXCLUDED.nama_instansi,
  nama_penyedia = EXCLUDED.nama_penyedia,
  nib_penyedia = EXCLUDED.nib_penyedia,
  nilai_kontrak = EXCLUDED.nilai_kontrak,
  jenis_kontrak = EXCLUDED.jenis_kontrak,
  karakteristik_kontrak = EXCLUDED.karakteristik_kontrak,
  propinsi = EXCLUDED.propinsi,
  kab_kota = EXCLUDED.kab_kota,
  tanggal_mulai = EXCLUDED.tanggal_mulai,
  tanggal_selesai = EXCLUDED.tanggal_selesai,
  progres_fisik = EXCLUDED.progres_fisik,
  progres_keuangan = EXCLUDED.progres_keuangan,
  bulan_progres = EXCLUDED.bulan_progres,
  bulan_progres_keuangan = EXCLUDED.bulan_progres_keuangan,
  status_pekerjaan = EXCLUDED.status_pekerjaan,
  updated_at = EXCLUDED.updated_at;

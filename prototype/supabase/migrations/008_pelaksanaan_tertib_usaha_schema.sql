-- =============================================================================
-- MIGRATION 008: Penyelarasan Form Pelaksanaan Pengawasan Tertib Usaha (SIMAK 1)
-- Menyelaraskan Standar Kolom SIPJAKI Kementerian PUPR:
-- - NO, TANGGAL PENGAWASAN, TAHUN, WILAYAH, DOKUMEN, STATUS, AKSI (Edit & Hapus)
-- - Isian Detail Form SIMAK 1: Kualifikasi, Nama Produsen, Nama Pemilik, No Kontak, 
--   Kepemilikan Izin, Keabsahan Izin, Kapasitas, Izin BB, Keabsahan BB, Propinsi, Kab/Kota
-- - Menghilangkan kata 'Audit' & 'Skor Tertib' -> Diganti Status Kepatuhan ('Patuh' / 'Tidak Patuh')
-- - Mengganti 'Berita Acara (BAP)' menjadi 'Dokumen'
-- - Default sorting terkini (Terbaru di atas sampai terlama)
-- =============================================================================

-- 1. ALTER TABLE: Tambahkan Kolom Standar SIPJAKI SIMAK 1 pada public.pengawasan_sesi
ALTER TABLE public.pengawasan_sesi
  ADD COLUMN IF NOT EXISTS tahun            VARCHAR(10) DEFAULT '2026',
  ADD COLUMN IF NOT EXISTS wilayah          VARCHAR(255) DEFAULT 'Kabupaten Bogor',
  ADD COLUMN IF NOT EXISTS kualifikasi      VARCHAR(50) DEFAULT 'Kecil',
  ADD COLUMN IF NOT EXISTS nama_produsen    VARCHAR(255),
  ADD COLUMN IF NOT EXISTS nama_pemilik     VARCHAR(200),
  ADD COLUMN IF NOT EXISTS no_kontak        VARCHAR(50),
  ADD COLUMN IF NOT EXISTS kepemilikan_izin VARCHAR(50) DEFAULT 'Memiliki',
  ADD COLUMN IF NOT EXISTS keabsahan_izin   VARCHAR(50) DEFAULT 'Sah',
  ADD COLUMN IF NOT EXISTS kapasitas        VARCHAR(100) DEFAULT 'Standar Operasional Lapangan',
  ADD COLUMN IF NOT EXISTS izin_bb          VARCHAR(50) DEFAULT 'Ada',
  ADD COLUMN IF NOT EXISTS keabsahan_bb     VARCHAR(50) DEFAULT 'Sah',
  ADD COLUMN IF NOT EXISTS propinsi         VARCHAR(100) DEFAULT 'Jawa Barat',
  ADD COLUMN IF NOT EXISTS kab_kota         VARCHAR(100) DEFAULT 'Kabupaten Bogor',
  ADD COLUMN IF NOT EXISTS status_kepatuhan VARCHAR(50) DEFAULT 'Patuh',
  ADD COLUMN IF NOT EXISTS dokumen          VARCHAR(255);

-- 2. Sinkronisasi Data Eksisting (Backfill & Data Migration)
UPDATE public.pengawasan_sesi
SET 
  tahun = COALESCE(tahun, '2026'),
  wilayah = COALESCE(wilayah, lokasi, 'Kabupaten Bogor'),
  nama_produsen = COALESCE(nama_produsen, badan_usaha),
  nama_pemilik = COALESCE(nama_pemilik, 'Direktur Penanggung Jawab'),
  no_kontak = COALESCE(no_kontak, '0812-3456-7890'),
  kualifikasi = COALESCE(kualifikasi, 'Kecil'),
  kepemilikan_izin = COALESCE(kepemilikan_izin, 'Memiliki'),
  keabsahan_izin = COALESCE(keabsahan_izin, 'Sah'),
  kapasitas = COALESCE(kapasitas, 'Kapasitas Operasional Memadai'),
  izin_bb = COALESCE(izin_bb, 'Ada'),
  keabsahan_bb = COALESCE(keabsahan_bb, 'Sah'),
  propinsi = COALESCE(propinsi, 'Jawa Barat'),
  kab_kota = COALESCE(kab_kota, 'Kabupaten Bogor'),
  dokumen = COALESCE(dokumen, dokumen_bap, 'Dokumen_Pengawasan_2026.pdf'),
  status_kepatuhan = CASE 
    WHEN skor_tertib >= 80 THEN 'Patuh' 
    ELSE 'Tidak Patuh' 
  END
WHERE status_kepatuhan IS NULL OR dokumen IS NULL OR tahun IS NULL;

-- 3. Seed / Upsert Data Pengawasan Tertib Usaha (SIMAK 1) Standar SIPJAKI & Kab. Bogor
INSERT INTO public.pengawasan_sesi (
  id,
  simak_code,
  tipe_tertib,
  nama_objek,
  badan_usaha,
  lokasi,
  tanggal_audit,
  pengawas,
  skor_tertib,
  kategori_hasil,
  status_verifikasi,
  dokumen_bap,
  tahun,
  wilayah,
  kualifikasi,
  nama_produsen,
  nama_pemilik,
  no_kontak,
  kepemilikan_izin,
  keabsahan_izin,
  kapasitas,
  izin_bb,
  keabsahan_bb,
  propinsi,
  kab_kota,
  status_kepatuhan,
  dokumen,
  catatan_temuan,
  rekomendasi
) VALUES
  (
    'PEL-TU-001',
    'SIMAK 1a1',
    'tertib-usaha',
    'Pengawasan Izin Berusaha & Legalitas SBU BUJK Kualifikasi Kecil',
    'PT. Pakuan Graha Konstruksi',
    'Kecamatan Cibinong',
    '2026-03-28',
    'Ir. Hendra Setiawan, S.T. (Tim Pembina Jakon)',
    95,
    'Tertib',
    'Terverifikasi',
    'Dokumen_SIMAK1_PakuanGraha.pdf',
    '2026',
    'Kecamatan Cibinong, Kabupaten Bogor',
    'Kecil',
    'PT. Pakuan Graha Konstruksi',
    'H. Ridwan Mansyur, S.T.',
    '0812-8877-6655',
    'Memiliki',
    'Sah',
    'Kemampuan Nyata Rp 2,5 Milyar',
    'Ada',
    'Sah',
    'Jawa Barat',
    'Kabupaten Bogor',
    'Patuh',
    'Dokumen_SIMAK1_PakuanGraha.pdf',
    'NIB dan SBU subklasifikasi BG004 aktif dan terverifikasi di OSS-RBA.',
    'Pertahankan pemenuhan SKK konstruksi pada setiap proyek.'
  ),
  (
    'PEL-TU-002',
    'SIMAK 1c',
    'tertib-usaha',
    'Pemeriksaan Legalitas Produsen & Izin Bahan Baku Rantai Pasok Material',
    'CV. Baraya Cipta Mandiri (Batching Plant)',
    'Kecamatan Cileungsi',
    '2026-03-24',
    'Bambang Kurniawan, S.T. (Tim Pembina Jakon)',
    65,
    'Kurang Tertib',
    'Draft',
    'Dokumen_SIMAK1_BarayaCipta.pdf',
    '2026',
    'Kecamatan Cileungsi, Kabupaten Bogor',
    'Menengah',
    'CV. Baraya Cipta Mandiri',
    'Drs. H. Mulyadi',
    '0813-1122-3344',
    'Memiliki',
    'Sah',
    '60 m³/jam (Ready Mix)',
    'Ada',
    'Tidak Sah',
    'Jawa Barat',
    'Kabupaten Bogor',
    'Tidak Patuh',
    'Dokumen_SIMAK1_BarayaCipta.pdf',
    'Izin IUP quary pasir bahan baku belum diperbarui masa berlakunya.',
    'Wajib memperbarui bukti legalitas sumber bahan baku pasir dalam tempo 14 hari.'
  ),
  (
    'PEL-TU-003',
    'SIMAK 1d',
    'tertib-usaha',
    'Pemeriksaan Kepemilikan Sertifikat Kompetensi Kerja (SKK) TKK Lapangan',
    'PT. Cibinong Mandiri Perkasa',
    'Kecamatan Citeureup',
    '2026-03-20',
    'Ir. Hendra Setiawan, S.T.',
    88,
    'Tertib',
    'Terverifikasi',
    'Dokumen_SIMAK1_CibinongMandiri.pdf',
    '2026',
    'Kecamatan Citeureup, Kabupaten Bogor',
    'Kecil',
    'PT. Cibinong Mandiri Perkasa',
    'Ahmad Fauzi, S.T.',
    '0856-7890-1234',
    'Memiliki',
    'Sah',
    'Peralatan 4 Unit Excavator',
    'Ada',
    'Sah',
    'Jawa Barat',
    'Kabupaten Bogor',
    'Patuh',
    'Dokumen_SIMAK1_CibinongMandiri.pdf',
    'Seluruh tukang dan mandor telah memiliki SKK Jenjang 1-3.',
    'Tingkatkan kepesertaan BPJS Ketenagakerjaan seluruh personel lapangan.'
  ),
  (
    'PEL-TU-004',
    'SIMAK 1a2',
    'tertib-usaha',
    'Pengawasan Badan Usaha Jasa Konstruksi Kualifikasi Menengah & Asosiasi',
    'PT. Bogor Raya Infrastruktur',
    'Kecamatan Babakan Madang',
    '2026-03-15',
    'Dra. Hj. Nunung Maryati, M.Si.',
    90,
    'Tertib',
    'Terverifikasi',
    'Dokumen_SIMAK1_BogorRaya.pdf',
    '2026',
    'Kecamatan Babakan Madang, Kabupaten Bogor',
    'Menengah',
    'PT. Bogor Raya Infrastruktur',
    'Ir. Budi Santoso',
    '0811-9988-7766',
    'Memiliki',
    'Sah',
    'Kemampuan Keuangan Rp 15 Milyar',
    'Ada',
    'Sah',
    'Jawa Barat',
    'Kabupaten Bogor',
    'Patuh',
    'Dokumen_SIMAK1_BogorRaya.pdf',
    'Dokumen perizinan OSS-RBA dan SBU lengkap dan terverifikasi.',
    'Lanjutkan pengawasan berkala 6 bulan sekali.'
  )
ON CONFLICT (id) DO UPDATE SET
  tahun = EXCLUDED.tahun,
  wilayah = EXCLUDED.wilayah,
  kualifikasi = EXCLUDED.kualifikasi,
  nama_produsen = EXCLUDED.nama_produsen,
  nama_pemilik = EXCLUDED.nama_pemilik,
  no_kontak = EXCLUDED.no_kontak,
  kepemilikan_izin = EXCLUDED.kepemilikan_izin,
  keabsahan_izin = EXCLUDED.keabsahan_izin,
  kapasitas = EXCLUDED.kapasitas,
  izin_bb = EXCLUDED.izin_bb,
  keabsahan_bb = EXCLUDED.keabsahan_bb,
  propinsi = EXCLUDED.propinsi,
  kab_kota = EXCLUDED.kab_kota,
  status_kepatuhan = EXCLUDED.status_kepatuhan,
  dokumen = EXCLUDED.dokumen,
  tanggal_audit = EXCLUDED.tanggal_audit,
  updated_at = NOW();

-- 4. Indeks Performa untuk Urutan Terbaru dan Pencarian Cepat
CREATE INDEX IF NOT EXISTS idx_pengawasan_tanggal_desc ON public.pengawasan_sesi(tanggal_audit DESC);
CREATE INDEX IF NOT EXISTS idx_pengawasan_tahun ON public.pengawasan_sesi(tahun);
CREATE INDEX IF NOT EXISTS idx_pengawasan_wilayah ON public.pengawasan_sesi(wilayah);
CREATE INDEX IF NOT EXISTS idx_pengawasan_status_kepatuhan ON public.pengawasan_sesi(status_kepatuhan);
CREATE INDEX IF NOT EXISTS idx_pengawasan_kualifikasi ON public.pengawasan_sesi(kualifikasi);
CREATE INDEX IF NOT EXISTS idx_pengawasan_nama_produsen ON public.pengawasan_sesi(nama_produsen);

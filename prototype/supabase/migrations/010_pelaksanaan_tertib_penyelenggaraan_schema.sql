-- =============================================================================
-- MIGRATION 010: Skema Pengawasan Pelaksanaan Tertib Penyelenggaraan (SIMAK 2)
-- Menyelaraskan 11 Parameter Standar SIPJAKI Kementerian PUPR
-- (NO, NAMA PROYEK, NILAI PROYEK, NOMOR PERJANJIAN, WAKTU PELAKSANAAN,
--  PENYEDIA JASA, PEMILIK PEKERJAAN, WAKTU PENGAWASAN, PROPINSI/KAB, STATUS, AKSI)
-- =============================================================================

-- 1. Penambahan Kolom-Kolom Standar SIMAK 2 pada Tabel public.pengawasan_sesi
ALTER TABLE public.pengawasan_sesi
  ADD COLUMN IF NOT EXISTS nama_proyek VARCHAR(255),
  ADD COLUMN IF NOT EXISTS nilai_proyek BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nomor_perjanjian VARCHAR(100),
  ADD COLUMN IF NOT EXISTS waktu_pelaksanaan VARCHAR(100),
  ADD COLUMN IF NOT EXISTS penyedia_jasa VARCHAR(255),
  ADD COLUMN IF NOT EXISTS nama_pemilik_pekerjaan VARCHAR(200),
  ADD COLUMN IF NOT EXISTS waktu_pengawasan DATE;

-- 2. Fleksibilitas Kolom Legacy (Agar Tidak Melanggar NOT NULL jika diisi dari Form SIPJAKI)
ALTER TABLE public.pengawasan_sesi ALTER COLUMN kategori_hasil DROP NOT NULL;
ALTER TABLE public.pengawasan_sesi ALTER COLUMN skor_tertib DROP NOT NULL;

-- 3. Indeks Performa untuk Kolom SIMAK 2
CREATE INDEX IF NOT EXISTS idx_pengawasan_nama_proyek ON public.pengawasan_sesi(nama_proyek);
CREATE INDEX IF NOT EXISTS idx_pengawasan_nomor_perjanjian ON public.pengawasan_sesi(nomor_perjanjian);
CREATE INDEX IF NOT EXISTS idx_pengawasan_penyedia_jasa ON public.pengawasan_sesi(penyedia_jasa);
CREATE INDEX IF NOT EXISTS idx_pengawasan_waktu_pengawasan ON public.pengawasan_sesi(waktu_pengawasan DESC);

-- 4. Seed Data Realistis Pengawasan Proyek Fisik SIMAK 2 Kabupaten Bogor TA 2026
INSERT INTO public.pengawasan_sesi (
  id, simak_code, tipe_tertib, nama_objek, badan_usaha, lokasi, tahun, wilayah,
  status_kepatuhan, kategori_hasil, skor_tertib, dokumen, dokumen_bap,
  status_verifikasi, tanggal_audit, pengawas,
  nama_proyek, nilai_proyek, nomor_perjanjian, waktu_pelaksanaan, penyedia_jasa,
  nama_pemilik_pekerjaan, waktu_pengawasan, propinsi, kab_kota, catatan_temuan, rekomendasi
) VALUES 
(
  'PEL-TP-2026-001',
  'SIMAK 2a',
  'tertib-penyelenggaraan',
  'Peningkatan Jalan Poros Bojonggede - Kemang (Jl. Bomang)',
  'PT. Samudra Beton Persada',
  'Kecamatan Bojonggede - Kemang',
  '2026',
  'Jawa Barat / Kabupaten Bogor',
  'Patuh',
  'Tertib',
  92,
  'Dokumen_SIMAK2_JalanBomang.pdf',
  'Dokumen_SIMAK2_JalanBomang.pdf',
  'Terverifikasi',
  '2026-03-26',
  'Ir. Rahmat Hidayat, M.T. (Tim Pembina Jakon)',
  'Peningkatan Jalan Poros Bojonggede - Kemang (Jl. Bomang Sta 0+000 - 4+200)',
  14850000000,
  '602.1/045/SPK-KTR/DPUPR/2026',
  '180 Hari Kalender (01 Mar 2026 - 27 Agu 2026)',
  'PT. Samudra Beton Persada',
  'Dinas PUPR Kab. Bogor / PPK Bidang Jalan',
  '2026-03-26',
  'Jawa Barat',
  'Kabupaten Bogor',
  'Penerapan SMKK berjalan baik, sertifikat uji tarik baja dan job mix formula (JMF) aspal telah disetujui konsultan pengawas.',
  'Pertahankan manajemen rekayasa lalu lintas dan pasang rambu peringatan tambahan di zona persimpangan.'
),
(
  'PEL-TP-2026-002',
  'SIMAK 2b',
  'tertib-penyelenggaraan',
  'Pembangunan Jembatan Ciawi - Megamendung',
  'PT. Jaya Makmur Infrastruktur',
  'Kecamatan Ciawi',
  '2026',
  'Jawa Barat / Kabupaten Bogor',
  'Patuh',
  'Tertib',
  86,
  'Dokumen_SIMAK2_JembatanCiawi.pdf',
  'Dokumen_SIMAK2_JembatanCiawi.pdf',
  'Terverifikasi',
  '2026-03-22',
  'Dr. Ir. Wahyudi, M.Sc. (Tim Pembina Jakon)',
  'Pembangunan Jembatan Beton Pratekan Ciawi - Megamendung Bentang 30M',
  8420000000,
  '602.1/052/SPK-JMB/DPUPR/2026',
  '150 Hari Kalender (15 Feb 2026 - 14 Jul 2026)',
  'PT. Jaya Makmur Infrastruktur',
  'Dinas PUPR Kab. Bogor / PPK Bidang Jembatan',
  '2026-03-22',
  'Jawa Barat',
  'Kabupaten Bogor',
  'Metode erection girder pratekan telah diverifikasi oleh tim ahli struktur. Tenaga kerja bersertifikat K3 Konstruksi aktif di lokasi.',
  'Lakukan monitoring berkala terhadap debit air sungai dan kestabilan lereng abutment selama musim hujan.'
),
(
  'PEL-TP-2026-003',
  'SIMAK 2c',
  'tertib-penyelenggaraan',
  'Pembangunan Gedung Rawat Inap Terpadu RSUD Leuwiliang',
  'PT. Pakuan Graha Konstruksi',
  'Kecamatan Leuwiliang',
  '2026',
  'Jawa Barat / Kabupaten Bogor',
  'Patuh',
  'Tertib',
  88,
  'Dokumen_SIMAK2_RSUDLeuwiliang.pdf',
  'Dokumen_SIMAK2_RSUDLeuwiliang.pdf',
  'Terverifikasi',
  '2026-03-18',
  'Ir. Hendra Setiawan, S.T. (Tim Pembina Jakon)',
  'Pembangunan Gedung Rawat Inap Terpadu 5 Lantai RSUD Leuwiliang',
  22300000000,
  '445/012/SPK-RSUD/DINKES/2026',
  '210 Hari Kalender (01 Feb 2026 - 30 Agu 2026)',
  'PT. Pakuan Graha Konstruksi',
  'Dinas Kesehatan Kab. Bogor / PPK RSUD',
  '2026-03-18',
  'Jawa Barat',
  'Kabupaten Bogor',
  'Struktur beton bertulang memenuhi spesifikasi f''c 30 MPa. Seluruh pekerja wajib mengenakan full body harness pada pekerjaan lantai 3 ke atas.',
  'Segera lengkapi jaring pengaman vertikal perimeter luar gedung.'
),
(
  'PEL-TP-2026-004',
  'SIMAK 2d',
  'tertib-penyelenggaraan',
  'Rehabilitasi Jaringan Irigasi Cibalok Cibinong',
  'CV. Cibinong Mandiri Perkasa',
  'Kecamatan Cibinong',
  '2026',
  'Jawa Barat / Kabupaten Bogor',
  'Tidak Patuh',
  'Kurang Tertib',
  60,
  'Dokumen_SIMAK2_IrigasiCibalok.pdf',
  'Dokumen_SIMAK2_IrigasiCibalok.pdf',
  'Draft',
  '2026-03-12',
  'Bambang Kurniawan, S.T. (Tim Pembina Jakon)',
  'Rehabilitasi Saluran Pasangan Batu Irigasi DI Cibalok Paket 2',
  4650000000,
  '610/038/SPK-SDA/DPUPR/2026',
  '120 Hari Kalender (01 Mar 2026 - 28 Jun 2026)',
  'CV. Cibinong Mandiri Perkasa',
  'Dinas PUPR Kab. Bogor / PPK Bidang SDA',
  '2026-03-12',
  'Jawa Barat',
  'Kabupaten Bogor',
  'Ditemukan penggunaan batu belah kali yang belum menyertakan surat uji laboratorium kuat tekan material, dan pengawas K3 belum berada di lokasi kerja.',
  'Diberikan surat peringatan tertulis untuk menghentikan sementara pengecoran plesteran hingga bukti uji material diserahkan.'
)
ON CONFLICT (id) DO UPDATE SET
  simak_code = EXCLUDED.simak_code,
  nama_proyek = EXCLUDED.nama_proyek,
  nilai_proyek = EXCLUDED.nilai_proyek,
  nomor_perjanjian = EXCLUDED.nomor_perjanjian,
  waktu_pelaksanaan = EXCLUDED.waktu_pelaksanaan,
  penyedia_jasa = EXCLUDED.penyedia_jasa,
  nama_pemilik_pekerjaan = EXCLUDED.nama_pemilik_pekerjaan,
  waktu_pengawasan = EXCLUDED.waktu_pengawasan,
  status_kepatuhan = EXCLUDED.status_kepatuhan,
  kategori_hasil = EXCLUDED.kategori_hasil,
  skor_tertib = EXCLUDED.skor_tertib,
  dokumen = EXCLUDED.dokumen,
  dokumen_bap = EXCLUDED.dokumen_bap,
  status_verifikasi = EXCLUDED.status_verifikasi,
  propinsi = EXCLUDED.propinsi,
  kab_kota = EXCLUDED.kab_kota,
  catatan_temuan = EXCLUDED.catatan_temuan,
  rekomendasi = EXCLUDED.rekomendasi;

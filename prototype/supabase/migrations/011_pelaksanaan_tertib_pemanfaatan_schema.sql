-- =============================================================================
-- MIGRATION 011: Skema Pengawasan Pelaksanaan Tertib Pemanfaatan (SIMAK 3)
-- Menyelaraskan 10 Parameter Standar SIPJAKI Kementerian PUPR
-- (NO, NAMA BANGUNAN, LOKASI, NAMA PEMILIK, NAMA PENGELOLA,
--  WAKTU PENGAWASAN, PROPINSI, KAB/KOTA, STATUS, AKSI)
-- =============================================================================

-- 1. Penambahan Kolom-Kolom Standar SIMAK 3 pada Tabel public.pengawasan_sesi
ALTER TABLE public.pengawasan_sesi
  ADD COLUMN IF NOT EXISTS nama_bangunan VARCHAR(255),
  ADD COLUMN IF NOT EXISTS nama_pemilik VARCHAR(200),
  ADD COLUMN IF NOT EXISTS nama_pengelola VARCHAR(200),
  ADD COLUMN IF NOT EXISTS waktu_pengawasan DATE,
  ADD COLUMN IF NOT EXISTS fungsi_bangunan VARCHAR(100),
  ADD COLUMN IF NOT EXISTS status_slf VARCHAR(50) DEFAULT 'Memiliki SLF';

-- 2. Fleksibilitas Kolom Legacy (Agar Selaras dengan Validasi SIPJAKI)
ALTER TABLE public.pengawasan_sesi ALTER COLUMN kategori_hasil DROP NOT NULL;
ALTER TABLE public.pengawasan_sesi ALTER COLUMN skor_tertib DROP NOT NULL;

-- 3. Indeks Performa untuk Kolom SIMAK 3
CREATE INDEX IF NOT EXISTS idx_pengawasan_nama_bangunan ON public.pengawasan_sesi(nama_bangunan);
CREATE INDEX IF NOT EXISTS idx_pengawasan_nama_pemilik ON public.pengawasan_sesi(nama_pemilik);
CREATE INDEX IF NOT EXISTS idx_pengawasan_nama_pengelola ON public.pengawasan_sesi(nama_pengelola);

-- 4. Seed Data Realistis Pengawasan Bangunan Purna-Konstruksi SIMAK 3 Kab. Bogor TA 2026
INSERT INTO public.pengawasan_sesi (
  id, simak_code, tipe_tertib, nama_objek, badan_usaha, lokasi, tahun, wilayah,
  status_kepatuhan, kategori_hasil, skor_tertib, dokumen, dokumen_bap,
  status_verifikasi, tanggal_audit, pengawas,
  nama_bangunan, nama_pemilik, nama_pengelola, waktu_pengawasan, fungsi_bangunan, status_slf,
  propinsi, kab_kota, catatan_temuan, rekomendasi
) VALUES 
(
  'PEL-TM-2026-001',
  'SIMAK 3',
  'tertib-pemanfaatan',
  'Gedung Rawat Inap Terpadu RSUD Leuwiliang',
  'Pemerintah Kabupaten Bogor / BPKAD',
  'Jl. Raya Cibeber No. 1, Kecamatan Leuwiliang',
  '2026',
  'Jawa Barat / Kabupaten Bogor',
  'Patuh',
  'Tertib',
  94,
  'BAP_SIMAK3_RSUD_Leuwiliang.pdf',
  'BAP_SIMAK3_RSUD_Leuwiliang.pdf',
  'Terverifikasi',
  '2026-03-28',
  'Ir. Hendra Setiawan, S.T. (Tim Pembina Jakon)',
  'Gedung Rawat Inap Terpadu 5 Lantai RSUD Leuwiliang',
  'Pemerintah Kabupaten Bogor / BPKAD',
  'Dinas Kesehatan Kab. Bogor / Manajemen RSUD',
  '2026-03-28',
  'Fasilitas Pelayanan Kesehatan',
  'Memiliki SLF (Aktif s.d 2029)',
  'Jawa Barat',
  'Kabupaten Bogor',
  'Pemanfaatan ruang sesuai fungsi peruntukan RS tipe B. Pemeliharaan instalasi ME, lift medis, genset darurat, dan sistem proteksi kebakaran berkala tercatat dalam log book.',
  'Pertahankan standar operasional dan lakukan pengujian berkala pada sistem hidran serta sprinkler setiap triwulan.'
),
(
  'PEL-TM-2026-002',
  'SIMAK 3',
  'tertib-pemanfaatan',
  'Stadion Utama Pakansari Cibinong',
  'Pemerintah Kabupaten Bogor / BPKAD',
  'Jl. Kolonel Edy Yoso Martadipura, Kel. Pakansari, Kec. Cibinong',
  '2026',
  'Jawa Barat / Kabupaten Bogor',
  'Patuh',
  'Tertib',
  90,
  'BAP_SIMAK3_StadionPakansari.pdf',
  'BAP_SIMAK3_StadionPakansari.pdf',
  'Terverifikasi',
  '2026-03-24',
  'Dr. Ir. Wahyudi, M.Sc. (Tim Pembina Jakon)',
  'Kompleks Stadion Utama Pakansari (Kapasitas 30.000 Penonton)',
  'Pemerintah Kabupaten Bogor / BPKAD',
  'Dinas Pemuda dan Olahraga (Dispora) Kab. Bogor',
  '2026-03-24',
  'Fasilitas Olahraga & Ruang Publik',
  'Memiliki SLF (Aktif s.d 2028)',
  'Jawa Barat',
  'Kabupaten Bogor',
  'Struktur tribun dan atap space frame kanopi dalam kondisi prima. Jalur evakuasi darurat, sistem pencahayaan LED lapangan, dan rumput drainase terpelihara dengan baik.',
  'Lakukan inspeksi rutin terhadap kekencangan baut sambungan baja atap kanopi menjelang musim angin kencang.'
),
(
  'PEL-TM-2026-003',
  'SIMAK 3',
  'tertib-pemanfaatan',
  'Jembatan Beton Pratekan Ciawi - Megamendung Bentang 30M',
  'Dinas PUPR Kabupaten Bogor',
  'Jl. Raya Puncak Km. 67, Kecamatan Ciawi',
  '2026',
  'Jawa Barat / Kabupaten Bogor',
  'Patuh',
  'Tertib',
  88,
  'BAP_SIMAK3_JembatanCiawi.pdf',
  'BAP_SIMAK3_JembatanCiawi.pdf',
  'Terverifikasi',
  '2026-03-20',
  'Ir. Rahmat Hidayat, M.T. (Tim Pembina Jakon)',
  'Jembatan Gelagar Beton Pratekan Ciawi - Megamendung',
  'Dinas PUPR Kabupaten Bogor',
  'UPT Infrastruktur Jalan & Jembatan Wilayah II Ciawi',
  '2026-03-20',
  'Infrastruktur Jembatan Jalan Kabupaten',
  'Sertifikat Laik Fungsi Jalan (SLFJ) Lengkap',
  'Jawa Barat',
  'Kabupaten Bogor',
  'Expansion joint jembatan elastis, drainase dek jembatan bersih dari sedimentasi pasir. Rambu pembatas tonase muatan terpasang jelas di kedua ujung pendekat.',
  'Lakukan pembersihan lumut dan pengecekan berkala terhadap fondasi abutment dari gerusan arus sungai (*scouring*).'
),
(
  'PEL-TM-2026-004',
  'SIMAK 3',
  'tertib-pemanfaatan',
  'Gedung Pasar Tradisional Parungpanjang',
  'Perumda Pasar Tohaga Kabupaten Bogor',
  'Jl. Raya Parungpanjang No. 45, Kecamatan Parungpanjang',
  '2026',
  'Jawa Barat / Kabupaten Bogor',
  'Tidak Patuh',
  'Kurang Tertib',
  58,
  'BAP_SIMAK3_PasarParungpanjang.pdf',
  'BAP_SIMAK3_PasarParungpanjang.pdf',
  'Draft',
  '2026-03-15',
  'Bambang Kurniawan, S.T. (Tim Pembina Jakon)',
  'Bangunan Pasar Rakyat Parungpanjang 2 Lantai Blok A & B',
  'Perumda Pasar Tohaga Kabupaten Bogor',
  'Pengelola Unit Pasar Tohaga Wilayah Parungpanjang',
  '2026-03-15',
  'Fasilitas Perdagangan / Pasar Tradisional',
  'Belum Perpanjang SLF (Kedaluwarsa)',
  'Jawa Barat',
  'Kabupaten Bogor',
  'Ditemukan alih fungsi koridor evakuasi darurat menjadi lapak dagang permanen, masa berlaku SLF telah kedaluwarsa 6 bulan, dan tabung APAR tidak dilakukan uji tekanan ulang tahunan.',
  'Diterbitkan surat rekomendasi pembinaan kepada pengelola pasar untuk segera menertibkan koridor darurat, mengisi ulang APAR, dan mengajukan perpanjangan SLF ke DPMPTSP.'
)
ON CONFLICT (id) DO UPDATE SET
  simak_code = EXCLUDED.simak_code,
  nama_bangunan = EXCLUDED.nama_bangunan,
  nama_pemilik = EXCLUDED.nama_pemilik,
  nama_pengelola = EXCLUDED.nama_pengelola,
  waktu_pengawasan = EXCLUDED.waktu_pengawasan,
  fungsi_bangunan = EXCLUDED.fungsi_bangunan,
  status_slf = EXCLUDED.status_slf,
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

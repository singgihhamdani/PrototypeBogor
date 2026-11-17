-- =============================================================================
-- MIGRATION 028: Skema Penyelarasan Pelaksanaan Tertib Pemanfaatan (Lampiran 3)
-- Menyelaraskan Format Rinci Pelaksanaan Pengawasan Lampiran 3 SIPJAKI PUPR
-- 10 Kolom Baku: NO | NAMA BANGUNAN | LOKASI | NAMA PEMILIK | NAMA PENGELOLA |
--                WAKTU PENGAWASAN | PROPINSI | KAB/KOTA | STATUS | AKSI
-- Dan 4 Lingkup Indikator Pengawasan Teknis Kelaikan & Pemanfaatan Bangunan
-- =============================================================================

-- 1. Pastikan kolom-kolom identitas bangunan & pengawasan ada pada public.pengawasan_sesi
ALTER TABLE public.pengawasan_sesi
  ADD COLUMN IF NOT EXISTS nama_bangunan VARCHAR(255),
  ADD COLUMN IF NOT EXISTS nama_pemilik VARCHAR(200),
  ADD COLUMN IF NOT EXISTS nama_pengelola VARCHAR(200),
  ADD COLUMN IF NOT EXISTS waktu_pengawasan DATE,
  ADD COLUMN IF NOT EXISTS fungsi_bangunan VARCHAR(100),
  ADD COLUMN IF NOT EXISTS status_slf VARCHAR(100) DEFAULT 'Memiliki SLF (Aktif)',
  ADD COLUMN IF NOT EXISTS sub_items JSONB DEFAULT '[]'::jsonb;

-- 2. Pastikan Indeks Performa untuk query Tertib Pemanfaatan
CREATE INDEX IF NOT EXISTS idx_pengawasan_pemanfaatan_lookup 
  ON public.pengawasan_sesi(tipe_tertib, simak_code, waktu_pengawasan);

-- 3. Update data lama jika masih menggunakan kode SIMAK 3
UPDATE public.pengawasan_sesi
SET simak_code = 'Daftar Simak 3'
WHERE tipe_tertib = 'tertib-pemanfaatan' AND simak_code IN ('SIMAK 3', 'simak-3', 'Simak 3');

-- 4. Seed Data Realistis 5 Objek Pengawasan Purna-Konstruksi Kab. Bogor TA 2026
-- Lengkap dengan Rincian 4 Lingkup Indikator Pengawasan Teknis (JSONB)
INSERT INTO public.pengawasan_sesi (
  id, simak_code, tipe_tertib, nama_objek, badan_usaha, lokasi, tahun, wilayah,
  status_kepatuhan, kategori_hasil, skor_tertib, dokumen, dokumen_bap,
  status_verifikasi, tanggal_audit, pengawas,
  nama_bangunan, nama_pemilik, nama_pengelola, waktu_pengawasan, fungsi_bangunan, status_slf,
  propinsi, kab_kota, catatan_temuan, rekomendasi, sub_items
) VALUES 
(
  'PEL-TM-2026-001',
  'Daftar Simak 3',
  'tertib-pemanfaatan',
  'Gedung Rawat Inap Terpadu 5 Lantai RSUD Leuwiliang',
  'Pemerintah Kabupaten Bogor / BPKAD',
  'Jl. Raya Cibeber No. 1, Kecamatan Leuwiliang',
  '2026',
  'Jawa Barat / Kabupaten Bogor',
  'Patuh',
  'Tertib',
  95,
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
  'Pemanfaatan ruang sesuai fungsi peruntukan RS tipe B. Pemeliharaan instalasi ME, lift medis, genset darurat, dan sistem proteksi kebakaran berkala tercatat dalam log book operasional.',
  'Pertahankan standar operasional dan lakukan pengujian berkala pada sistem hidran serta sprinkler setiap triwulan.',
  '[
    {
      "no": 1,
      "indikator": "Pengawasan fungsi peruntukan terhadap tertib pemanfaatan produk Jasa Konstruksi",
      "uraian": "Pemeriksaan kesesuaian pemanfaatan gedung RS tipe B sesuai perizinan PBG dan kesesuaian lokasi terhadap RDTR Kecamatan Leuwiliang terverifikasi sah melalui dokumen perizinan resmi.",
      "standar": "RTRW/RDTR Kab. Bogor, KKPR & PBG (PP No. 16/2021)",
      "hasil": "Sesuai"
    },
    {
      "no": 2,
      "indikator": "Pengawasan terhadap rencana umur konstruksi",
      "uraian": "Pemeriksaan jaminan kelaikan fungsi sepanjang umur konstruksi (rencana 50 tahun) dibuktikan dengan Sertifikat Laik Fungsi (SLF) Nomor 503/SLF-014/DPMPTSP/2024 aktif.",
      "standar": "Permen PUPR No. 27/PRT/M/2018 & PP No. 16/2021",
      "hasil": "Sesuai"
    },
    {
      "no": 3,
      "indikator": "Pengawasan terhadap kapasitas dan beban",
      "uraian": "Beban operasional ranjang pasien, instalasi radiologi, dan tangki air atap berada dalam batas kapasitas beban desain rencana struktur (beban hidup 250 kg/m²).",
      "standar": "SNI 1727:2020 Beban Desain Minimum untuk Gedung",
      "hasil": "Sesuai"
    },
    {
      "no": 4,
      "indikator": "Pengawasan terhadap pemeliharaan produk jasa konstruksi",
      "uraian": "Tersedia SOP Pemeliharaan Berkala Struktur & MEP serta laporan kontrak pemeliharaan lift dan chiller dengan pihak ketiga yang diperbarui secara berkala.",
      "standar": "Permen PUPR No. 24/PRT/M/2008 Pedoman Pemeliharaan & Perawatan",
      "hasil": "Sesuai"
    }
  ]'::jsonb
),
(
  'PEL-TM-2026-002',
  'Daftar Simak 3',
  'tertib-pemanfaatan',
  'Kompleks Stadion Utama Pakansari (Kapasitas 30.000 Penonton)',
  'Pemerintah Kabupaten Bogor / BPKAD',
  'Jl. Kolonel Edy Yoso Martadipura, Kel. Pakansari, Kec. Cibinong',
  '2026',
  'Jawa Barat / Kabupaten Bogor',
  'Patuh',
  'Tertib',
  92,
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
  'Lakukan inspeksi rutin terhadap kekencangan baut sambungan baja atap kanopi menjelang musim angin kencang.',
  '[
    {
      "no": 1,
      "indikator": "Pengawasan fungsi peruntukan terhadap tertib pemanfaatan produk Jasa Konstruksi",
      "uraian": "Pemanfaatan bangunan sesuai zonasi olahraga terpadu kawasan Pakansari Cibinong mengacu RDTR Pusat Pemerintahan Kab. Bogor.",
      "standar": "RDTR Kawasan Perkotaan Cibinong (Perda No. 11/2016)",
      "hasil": "Sesuai"
    },
    {
      "no": 2,
      "indikator": "Pengawasan terhadap rencana umur konstruksi",
      "uraian": "Ketersediaan SLF bangunan bentang lebar aktif dan surat rekomendasi keselamatan struktur berkala dari Tim Ahli Bangunan Gedung (TABG).",
      "standar": "PP No. 16/2021 & Permen PUPR No. 27/2018",
      "hasil": "Sesuai"
    },
    {
      "no": 3,
      "indikator": "Pengawasan terhadap kapasitas dan beban",
      "uraian": "Pemeriksaan sistem sensor beban penonton pada tribun barat/timur serta pembatasan kapasitas aman 30.000 tempat duduk bertiket (single seat).",
      "standar": "Standar Keamanan Stadion FIFA & PSSI / Permenpora No. 10/2022",
      "hasil": "Sesuai"
    },
    {
      "no": 4,
      "indikator": "Pengawasan terhadap pemeliharaan produk jasa konstruksi",
      "uraian": "Pelaksanaan program perawatan mekanikal elektrikal, genset 1.000 kVA, sistem hidran lapangan, dan peremajaan rumput terencana dalam DPA Dispora.",
      "standar": "Permen PUPR No. 24/PRT/M/2008",
      "hasil": "Sesuai"
    }
  ]'::jsonb
),
(
  'PEL-TM-2026-003',
  'Daftar Simak 3',
  'tertib-pemanfaatan',
  'Jembatan Gelagar Beton Pratekan Ciawi - Megamendung Bentang 30M',
  'Dinas PUPR Kabupaten Bogor',
  'Jl. Raya Puncak Km. 67, Kecamatan Ciawi',
  '2026',
  'Jawa Barat / Kabupaten Bogor',
  'Patuh',
  'Tertib',
  90,
  'BAP_SIMAK3_JembatanCiawi.pdf',
  'BAP_SIMAK3_JembatanCiawi.pdf',
  'Terverifikasi',
  '2026-03-20',
  'Ir. Rahmat Hidayat, M.T. (Tim Pembina Jakon)',
  'Jembatan Gelagar Beton Pratekan Ciawi - Megamendung Bentang 30M',
  'Dinas PUPR Kabupaten Bogor',
  'UPT Infrastruktur Jalan & Jembatan Wilayah II Ciawi',
  '2026-03-20',
  'Infrastruktur Sipil Jembatan Jalan Kabupaten',
  'Sertifikat Laik Fungsi Jalan (SLFJ) Lengkap',
  'Jawa Barat',
  'Kabupaten Bogor',
  'Expansion joint jembatan elastis, drainase dek jembatan bersih dari sedimentasi pasir. Rambu pembatas tonase muatan terpasang jelas di kedua ujung pendekat.',
  'Lakukan pembersihan lumut dan pengecekan berkala terhadap fondasi abutment dari gerusan arus sungai (scouring).',
  '[
    {
      "no": 1,
      "indikator": "Pengawasan fungsi peruntukan terhadap tertib pemanfaatan produk Jasa Konstruksi",
      "uraian": "Pemanfaatan prasarana jembatan kelas jalan kabupaten sesuai trase jalan kolektor kawasan wisata Puncak.",
      "standar": "UU No. 2/2022 tentang Jalan & Perda RTRW Kab. Bogor",
      "hasil": "Sesuai"
    },
    {
      "no": 2,
      "indikator": "Pengawasan terhadap rencana umur konstruksi",
      "uraian": "Jaminan umur rencana jembatan 50 tahun melalui pemenuhan sertifikat uji beban statis-dinamis dan kelaikan fungsi jembatan.",
      "standar": "SE Menteri PUPR No. 10/SE/M/2015 Uji Beban Jembatan",
      "hasil": "Sesuai"
    },
    {
      "no": 3,
      "indikator": "Pengawasan terhadap kapasitas dan beban",
      "uraian": "Pengawasan tonase muatan sumbu terberat (MST 8 Ton) dengan pemasangan rambu peringatan portal ketinggian dan timbangan berkala Dishub.",
      "standar": "Bina Marga Bridge Design Code & Permenhub No. 60/2019",
      "hasil": "Sesuai"
    },
    {
      "no": 4,
      "indikator": "Pengawasan terhadap pemeliharaan produk jasa konstruksi",
      "uraian": "Program pemeliharaan rutin expansion joint, penggantian elastomeric bearing pad berkala, dan pembersihan lubang drainase deck terdata pada UPT II.",
      "standar": "Pedoman Pemeliharaan Jembatan Ditjen Bina Marga No. 005/P/BM/2011",
      "hasil": "Sesuai"
    }
  ]'::jsonb
),
(
  'PEL-TM-2026-004',
  'Daftar Simak 3',
  'tertib-pemanfaatan',
  'Bangunan Pasar Rakyat Parungpanjang 2 Lantai Blok A & B',
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
  'Diterbitkan surat rekomendasi pembinaan kepada pengelola pasar untuk segera menertibkan koridor darurat, mengisi ulang APAR, dan mengajukan perpanjangan SLF ke DPMPTSP.',
  '[
    {
      "no": 1,
      "indikator": "Pengawasan fungsi peruntukan terhadap tertib pemanfaatan produk Jasa Konstruksi",
      "uraian": "Sebagian selasar dan ruang tangga evakuasi darurat disekat dan beralih fungsi menjadi kios pedagang semi-permanen tanpa izin pengelola.",
      "standar": "PP No. 16/2021 Pasal 13 & Standar Aksesibilitas Pasar Rakyat",
      "hasil": "Tidak Sesuai"
    },
    {
      "no": 2,
      "indikator": "Pengawasan terhadap rencana umur konstruksi",
      "uraian": "Sertifikat Laik Fungsi (SLF) nomor 503/SLF-102/2019 telah habis masa berlakunya per September 2025 dan belum diajukan permohonan perpanjangan.",
      "standar": "Permen PUPR No. 27/PRT/M/2018 (SLF Bangunan Gedung)",
      "hasil": "Tidak Sesuai"
    },
    {
      "no": 3,
      "indikator": "Pengawasan terhadap kapasitas dan beban",
      "uraian": "Penumpukan stok karung komoditas beras dan sembako melebihi kapasitas lantai mezzanine blok B menimbulkan lendutan minor pada pelat lantai.",
      "standar": "SNI 1727:2020 Beban Desain Gudang/Penyimpanan",
      "hasil": "Tidak Sesuai"
    },
    {
      "no": 4,
      "indikator": "Pengawasan terhadap pemeliharaan produk jasa konstruksi",
      "uraian": "Tidak tersedia log book perawatan berkala sistem proteksi kebakaran (APAR kosong dan pompa hidran mati) serta instalasi kabel listrik semrawut.",
      "standar": "Permen PUPR No. 24/PRT/M/2008 & Permenaker No. 04/1980",
      "hasil": "Tidak Sesuai"
    }
  ]'::jsonb
),
(
  'PEL-TM-2026-005',
  'Daftar Simak 3',
  'tertib-pemanfaatan',
  'Gedung Kantor Dinas Penanaman Modal & PTSP Kabupaten Bogor',
  'Pemerintah Kabupaten Bogor / BPKAD',
  'Jl. Tegar Beriman No. 34, Kompleks Pemda, Kecamatan Cibinong',
  '2026',
  'Jawa Barat / Kabupaten Bogor',
  'Patuh',
  'Tertib',
  96,
  'BAP_SIMAK3_DPMPTSP.pdf',
  'BAP_SIMAK3_DPMPTSP.pdf',
  'Terverifikasi',
  '2026-03-10',
  'Ir. Hendra Setiawan, S.T. (Tim Pembina Jakon)',
  'Gedung Kantor Pelayanan Terpadu Satu Pintu 3 Lantai',
  'Pemerintah Kabupaten Bogor / BPKAD',
  'Dinas Penanaman Modal dan PTSP Kabupaten Bogor',
  '2026-03-10',
  'Fasilitas Perkantoran & Pelayanan Publik',
  'Memiliki SLF (Aktif s.d 2030)',
  'Jawa Barat',
  'Kabupaten Bogor',
  'Pemanfaatan ruang terbagi jelas antara front office layanan, back office verifikasi, dan ruang server. Jalur difabel, toilet disabilitas, dan tangga darurat berfungsi optimal.',
  'Pertahankan standar operasional bangunan gedung hijau ramah lingkungan dan lakukan inspeksi rutin panel surya atap.',
  '[
    {
      "no": 1,
      "indikator": "Pengawasan fungsi peruntukan terhadap tertib pemanfaatan produk Jasa Konstruksi",
      "uraian": "Pemanfaatan gedung untuk pelayanan perizinan publik terpadu sesuai tata ruang pusat pemerintahan Kabupaten Bogor.",
      "standar": "RDTR Kawasan Pemerintahan Cibinong & PBG Gedung Pemerintah",
      "hasil": "Sesuai"
    },
    {
      "no": 2,
      "indikator": "Pengawasan terhadap rencana umur konstruksi",
      "uraian": "Sertifikat Laik Fungsi (SLF) nomor 503/SLF-008/DPMPTSP/2025 aktif sampai dengan tahun 2030 lengkap dengan as-built drawing terintegrasi.",
      "standar": "PP No. 16/2021 & Permen PUPR No. 27/2018",
      "hasil": "Sesuai"
    },
    {
      "no": 3,
      "indikator": "Pengawasan terhadap kapasitas dan beban",
      "uraian": "Ruang arsip berkas dinamis menggunakan mobile compact rolling shelves sesuai perhitungan beban struktur pelat lantai 500 kg/m².",
      "standar": "SNI 1727:2020 & Pedoman Arsip Nasional RI (ANRI)",
      "hasil": "Sesuai"
    },
    {
      "no": 4,
      "indikator": "Pengawasan terhadap pemeliharaan produk jasa konstruksi",
      "uraian": "Pemeliharaan AC sentral VRV, genset cadangan 250 kVA, dan UPS ruang server dilaksanakan melalui kontrak servis berkala bergaransi resmi.",
      "standar": "Permen PUPR No. 24/PRT/M/2008 & SOP Standar Pelayanan Perkantoran",
      "hasil": "Sesuai"
    }
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  simak_code = EXCLUDED.simak_code,
  tipe_tertib = EXCLUDED.tipe_tertib,
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
  rekomendasi = EXCLUDED.rekomendasi,
  sub_items = EXCLUDED.sub_items;

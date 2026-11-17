-- =============================================================================
-- MIGRATION 012: Skema Profil OPD & Kelembagaan Standar SIPJAKI Pusat (3 Pilar)
-- 1. Profil OPD & SDM
-- 2. Data Pendukung (PIC, Admin SIPJAKI, Dokumen & Regulasi SOTK/Perda/SK TPJK, Anggaran n & n+1)
-- 3. Pelaksanaan & Pengawasan (Tugas Utama & Pelatihan TKK, Data Wilayah, Target RPJMD)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profil_opd_sipjaki (
  id                          VARCHAR(50) PRIMARY KEY DEFAULT 'OPD-BOGOR-DPU',
  opd_id                      UUID REFERENCES public.opd(id) ON DELETE SET NULL,
  tahun_anggaran              INTEGER NOT NULL DEFAULT 2026,
  
  -- ---------------------------------------------------------------------------
  -- PILAR 1: PROFIL OPD & SDM
  -- ---------------------------------------------------------------------------
  tipe_opd                    VARCHAR(100) DEFAULT 'Dinas Teknis Pekerjaan Umum',
  kategori                    VARCHAR(50) DEFAULT 'Pemerintah Kabupaten',
  nama_bidang                 VARCHAR(200) DEFAULT 'Bidang Bina Konstruksi',
  nama_seksi                  VARCHAR(200) DEFAULT 'Sub-Koordinator Kelembagaan dan Jasa Konstruksi',
  level_suburusan             VARCHAR(100) DEFAULT 'Bidang Mandiri (Eselon III)',
  alamat_kantor               TEXT DEFAULT 'Jl. Bersih No. 1, Komplek Perkantoran Pemkab Bogor, Kel. Tengah, Kec. Cibinong, Kab. Bogor 16914',
  nomor_telepon               VARCHAR(50) DEFAULT '(021) 8753545',
  email_kantor                VARCHAR(100) DEFAULT 'dpu@bogorkab.go.id',
  website_pemerintahan        VARCHAR(150) DEFAULT 'https://dpu.bogorkab.go.id',
  jumlah_pns                  INTEGER DEFAULT 14,
  pejabat_manajerial          INTEGER DEFAULT 3,
  pejabat_fungsional          INTEGER DEFAULT 8,
  jumlah_p3k                  INTEGER DEFAULT 5,
  jumlah_non_asn              INTEGER DEFAULT 6,
  
  -- ---------------------------------------------------------------------------
  -- PILAR 2: DATA PENDUKUNG (PIC & PENYELENGGARAAN SIPJAKI)
  -- ---------------------------------------------------------------------------
  nama_pic                    VARCHAR(200) DEFAULT 'H. Raden Ridwan, ST, M.Si',
  jabatan_pic                 VARCHAR(200) DEFAULT 'Kepala Bidang Jasa Konstruksi',
  eselon_pic                  VARCHAR(50) DEFAULT 'Eselon III.b',
  no_hp_pic                   VARCHAR(50) DEFAULT '081298765432',
  email_pic                   VARCHAR(100) DEFAULT 'ridwan.jakon@bogorkab.go.id',
  sk_admin_sipjaki            VARCHAR(200) DEFAULT 'SK Penetapan Administrator SIPJAKI Daerah Kab. Bogor',
  no_sk_admin                 VARCHAR(100) DEFAULT 'SK.BUPATI/800/104/Kpts/DPU/2025',
  username_admin              VARCHAR(100) DEFAULT 'bayu.sipjaki@bogorkab.go.id',
  no_hp_admin                 VARCHAR(50) DEFAULT '085712345678',
  
  -- PILAR 2: DOKUMEN & REGULASI DAERAH
  peraturan_sotk              VARCHAR(255) DEFAULT 'Peraturan Bupati Bogor tentang SOTK Dinas Pekerjaan Umum',
  no_peraturan_sotk           VARCHAR(100) DEFAULT 'Perbup No. 67 Tahun 2021',
  perda_jasa_konstruksi       VARCHAR(255) DEFAULT 'Peraturan Daerah Kabupaten Bogor tentang Penyelenggaraan Jasa Konstruksi',
  no_perda_jakon              VARCHAR(100) DEFAULT 'Perda No. 2 Tahun 2024',
  sk_tpjk                     VARCHAR(255) DEFAULT 'SK Pembentukan Tim Pembina Jasa Konstruksi (TPJK) Kabupaten Bogor',
  no_sk_tpjk                  VARCHAR(100) DEFAULT 'SK.BUPATI/600/215/Kpts/DPU/2026',
  no_sprint_kadis             VARCHAR(100) DEFAULT '800.1.11.1/092-Bid.Jakon/2026',
  dokumen_bagan_sotk_url      TEXT DEFAULT '/documents/Bagan_SOTK_DPU_2026.pdf',
  dokumen_sk_admin_url        TEXT DEFAULT '/documents/SK_Admin_SIPJAKI_2026.pdf',
  dokumen_sprint_url          TEXT DEFAULT '/documents/Surat_Perintah_Tugas_Pengawasan_2026.pdf',
  
  -- PILAR 2: ANGGARAN UNIT KERJA (TAHUN n & n+1)
  anggaran_jakon_n            NUMERIC(15, 2) DEFAULT 4850000000,
  anggaran_fisik_n            NUMERIC(15, 2) DEFAULT 650000000000,
  anggaran_jakon_n1           NUMERIC(15, 2) DEFAULT 5200000000,
  anggaran_fisik_n1           NUMERIC(15, 2) DEFAULT 710000000000,
  
  -- ---------------------------------------------------------------------------
  -- PILAR 3: PELAKSANAAN & PENGAWASAN
  -- ---------------------------------------------------------------------------
  -- Tugas Utama & Pelatihan TKK
  cakupan_tugas_utama         TEXT DEFAULT 'Penyelenggaraan pembinaan dan pengawasan tertib usaha, tertib penyelenggaraan, dan tertib pemanfaatan produk jasa konstruksi serta fasilitasi pelatihan dan sertifikasi tenaga kerja konstruksi (TKK) tingkat terampil dan ahli di wilayah Kabupaten Bogor.',
  jml_pelatihan_tkk           INTEGER DEFAULT 6,
  jml_tkk_terlatih            INTEGER DEFAULT 240,
  jml_tkk_tersertifikasi      INTEGER DEFAULT 215,
  target_rpjmd_pelatihan      INTEGER DEFAULT 300,
  target_rpjmd_sertifikasi    INTEGER DEFAULT 250,
  
  -- Data Rantai Pasok Wilayah (BUJK & TKK)
  jml_badan_usaha             INTEGER DEFAULT 428,
  jml_sbu_berlaku             INTEGER DEFAULT 385,
  jml_tkk_wilayah             INTEGER DEFAULT 1850,
  jml_skk_berlaku             INTEGER DEFAULT 1420,
  
  -- Target RPJMD Pengawasan Tahunan
  target_rpjmd_tertib_usaha   INTEGER DEFAULT 50,
  target_rpjmd_tertib_penyelenggaraan INTEGER DEFAULT 40,
  target_rpjmd_tertib_pemanfaatan     INTEGER DEFAULT 30,
  
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE public.profil_opd_sipjaki ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view profil_opd_sipjaki" ON public.profil_opd_sipjaki;
CREATE POLICY "Public can view profil_opd_sipjaki" ON public.profil_opd_sipjaki FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update profil_opd_sipjaki" ON public.profil_opd_sipjaki;
CREATE POLICY "Admins can update profil_opd_sipjaki" ON public.profil_opd_sipjaki FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN_BIDANG')
  )
);

-- Seed Data Awal DPU Kabupaten Bogor
INSERT INTO public.profil_opd_sipjaki (
  id, tahun_anggaran, tipe_opd, kategori, nama_bidang, nama_seksi, level_suburusan,
  alamat_kantor, nomor_telepon, email_kantor, website_pemerintahan,
  jumlah_pns, pejabat_manajerial, pejabat_fungsional, jumlah_p3k, jumlah_non_asn,
  nama_pic, jabatan_pic, eselon_pic, no_hp_pic, email_pic,
  sk_admin_sipjaki, no_sk_admin, username_admin, no_hp_admin,
  peraturan_sotk, no_peraturan_sotk, perda_jasa_konstruksi, no_perda_jakon,
  sk_tpjk, no_sk_tpjk, no_sprint_kadis,
  dokumen_bagan_sotk_url, dokumen_sk_admin_url, dokumen_sprint_url,
  anggaran_jakon_n, anggaran_fisik_n, anggaran_jakon_n1, anggaran_fisik_n1,
  cakupan_tugas_utama, jml_pelatihan_tkk, jml_tkk_terlatih, jml_tkk_tersertifikasi,
  target_rpjmd_pelatihan, target_rpjmd_sertifikasi,
  jml_badan_usaha, jml_sbu_berlaku, jml_tkk_wilayah, jml_skk_berlaku,
  target_rpjmd_tertib_usaha, target_rpjmd_tertib_penyelenggaraan, target_rpjmd_tertib_pemanfaatan
) VALUES (
  'OPD-BOGOR-DPU', 2026,
  'Dinas Teknis Pekerjaan Umum',
  'Pemerintah Kabupaten',
  'Bidang Bina Konstruksi',
  'Sub-Koordinator Kelembagaan dan Jasa Konstruksi',
  'Bidang Mandiri (Eselon III)',
  'Jl. Bersih No. 1, Komplek Perkantoran Pemkab Bogor, Kel. Tengah, Kec. Cibinong, Kab. Bogor 16914',
  '(021) 8753545',
  'dpu@bogorkab.go.id',
  'https://dpu.bogorkab.go.id',
  14, 3, 8, 5, 6,
  'H. Raden Ridwan, ST, M.Si',
  'Kepala Bidang Jasa Konstruksi',
  'Eselon III.b',
  '081298765432',
  'ridwan.jakon@bogorkab.go.id',
  'SK Penetapan Administrator SIPJAKI Daerah Kab. Bogor',
  'SK.BUPATI/800/104/Kpts/DPU/2025',
  'bayu.sipjaki@bogorkab.go.id',
  '085712345678',
  'Peraturan Bupati Bogor tentang SOTK Dinas Pekerjaan Umum',
  'Perbup No. 67 Tahun 2021',
  'Peraturan Daerah Kabupaten Bogor tentang Penyelenggaraan Jasa Konstruksi',
  'Perda No. 2 Tahun 2024',
  'SK Pembentukan Tim Pembina Jasa Konstruksi (TPJK) Kabupaten Bogor',
  'SK.BUPATI/600/215/Kpts/DPU/2026',
  '800.1.11.1/092-Bid.Jakon/2026',
  '/documents/Bagan_SOTK_DPU_2026.pdf',
  '/documents/SK_Admin_SIPJAKI_2026.pdf',
  '/documents/Surat_Perintah_Tugas_Pengawasan_2026.pdf',
  4850000000, 650000000000, 5200000000, 710000000000,
  'Penyelenggaraan pembinaan dan pengawasan tertib usaha, tertib penyelenggaraan, dan tertib pemanfaatan produk jasa konstruksi serta fasilitasi pelatihan dan sertifikasi tenaga kerja konstruksi (TKK) tingkat terampil dan ahli di wilayah Kabupaten Bogor.',
  6, 240, 215, 300, 250,
  428, 385, 1850, 1420,
  50, 40, 30
) ON CONFLICT (id) DO UPDATE SET
  tahun_anggaran = EXCLUDED.tahun_anggaran,
  tipe_opd = EXCLUDED.tipe_opd,
  kategori = EXCLUDED.kategori,
  nama_bidang = EXCLUDED.nama_bidang,
  nama_seksi = EXCLUDED.nama_seksi,
  level_suburusan = EXCLUDED.level_suburusan,
  alamat_kantor = EXCLUDED.alamat_kantor,
  nomor_telepon = EXCLUDED.nomor_telepon,
  email_kantor = EXCLUDED.email_kantor,
  website_pemerintahan = EXCLUDED.website_pemerintahan,
  jumlah_pns = EXCLUDED.jumlah_pns,
  pejabat_manajerial = EXCLUDED.pejabat_manajerial,
  pejabat_fungsional = EXCLUDED.pejabat_fungsional,
  jumlah_p3k = EXCLUDED.jumlah_p3k,
  jumlah_non_asn = EXCLUDED.jumlah_non_asn,
  nama_pic = EXCLUDED.nama_pic,
  jabatan_pic = EXCLUDED.jabatan_pic,
  eselon_pic = EXCLUDED.eselon_pic,
  no_hp_pic = EXCLUDED.no_hp_pic,
  email_pic = EXCLUDED.email_pic,
  sk_admin_sipjaki = EXCLUDED.sk_admin_sipjaki,
  no_sk_admin = EXCLUDED.no_sk_admin,
  username_admin = EXCLUDED.username_admin,
  no_hp_admin = EXCLUDED.no_hp_admin,
  peraturan_sotk = EXCLUDED.peraturan_sotk,
  no_peraturan_sotk = EXCLUDED.no_peraturan_sotk,
  perda_jasa_konstruksi = EXCLUDED.perda_jasa_konstruksi,
  no_perda_jakon = EXCLUDED.no_perda_jakon,
  sk_tpjk = EXCLUDED.sk_tpjk,
  no_sk_tpjk = EXCLUDED.no_sk_tpjk,
  no_sprint_kadis = EXCLUDED.no_sprint_kadis,
  dokumen_bagan_sotk_url = EXCLUDED.dokumen_bagan_sotk_url,
  dokumen_sk_admin_url = EXCLUDED.dokumen_sk_admin_url,
  dokumen_sprint_url = EXCLUDED.dokumen_sprint_url,
  anggaran_jakon_n = EXCLUDED.anggaran_jakon_n,
  anggaran_fisik_n = EXCLUDED.anggaran_fisik_n,
  anggaran_jakon_n1 = EXCLUDED.anggaran_jakon_n1,
  anggaran_fisik_n1 = EXCLUDED.anggaran_fisik_n1,
  cakupan_tugas_utama = EXCLUDED.cakupan_tugas_utama,
  jml_pelatihan_tkk = EXCLUDED.jml_pelatihan_tkk,
  jml_tkk_terlatih = EXCLUDED.jml_tkk_terlatih,
  jml_tkk_tersertifikasi = EXCLUDED.jml_tkk_tersertifikasi,
  target_rpjmd_pelatihan = EXCLUDED.target_rpjmd_pelatihan,
  target_rpjmd_sertifikasi = EXCLUDED.target_rpjmd_sertifikasi,
  jml_badan_usaha = EXCLUDED.jml_badan_usaha,
  jml_sbu_berlaku = EXCLUDED.jml_sbu_berlaku,
  jml_tkk_wilayah = EXCLUDED.jml_tkk_wilayah,
  jml_skk_berlaku = EXCLUDED.jml_skk_berlaku,
  target_rpjmd_tertib_usaha = EXCLUDED.target_rpjmd_tertib_usaha,
  target_rpjmd_tertib_penyelenggaraan = EXCLUDED.target_rpjmd_tertib_penyelenggaraan,
  target_rpjmd_tertib_pemanfaatan = EXCLUDED.target_rpjmd_tertib_pemanfaatan,
  updated_at = NOW();

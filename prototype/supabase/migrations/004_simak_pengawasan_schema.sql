-- =============================================================================
-- MIGRATION 004: Skema Pengawasan SIMAK (Pilar 4A, 4B, 4C) & Tindak Lanjut BAP
-- =============================================================================

-- =============================================================================
-- 1. TABEL: pengawasan_sesi (Pelaksanaan Audit SIMAK Lapangan)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.pengawasan_sesi (
  id                  VARCHAR(50) PRIMARY KEY,              -- Contoh: "PEL-TU-001"
  simak_code          VARCHAR(50) NOT NULL,                 -- Contoh: "SIMAK 1a1", "SIMAK 2c"
  tipe_tertib         VARCHAR(30) NOT NULL 
                      CHECK (tipe_tertib IN ('tertib-usaha', 'tertib-penyelenggaraan', 'tertib-pemanfaatan')),
  nama_objek          VARCHAR(255) NOT NULL,
  badan_usaha         VARCHAR(255) NOT NULL,
  lokasi              VARCHAR(255) NOT NULL,
  tanggal_audit       DATE NOT NULL,
  pengawas            VARCHAR(200) NOT NULL,
  skor_tertib         NUMERIC(5, 2) NOT NULL DEFAULT 0,
  kategori_hasil      VARCHAR(30) NOT NULL 
                      CHECK (kategori_hasil IN ('Tertib', 'Cukup Tertib', 'Kurang Tertib')),
  status_verifikasi   VARCHAR(30) NOT NULL DEFAULT 'Draft' 
                      CHECK (status_verifikasi IN ('Draft', 'Menunggu Verifikasi', 'Terverifikasi', 'Ditolak')),
  dokumen_bap         VARCHAR(255),
  catatan_temuan      TEXT,
  rekomendasi         TEXT,
  diverifikasi_oleh   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  diverifikasi_pada   TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks Pengawasan Sesi
CREATE INDEX IF NOT EXISTS idx_pengawasan_tipe ON public.pengawasan_sesi(tipe_tertib);
CREATE INDEX IF NOT EXISTS idx_pengawasan_status ON public.pengawasan_sesi(status_verifikasi);
CREATE INDEX IF NOT EXISTS idx_pengawasan_tanggal ON public.pengawasan_sesi(tanggal_audit);
CREATE INDEX IF NOT EXISTS idx_pengawasan_simak ON public.pengawasan_sesi(simak_code);

-- =============================================================================
-- 2. TABEL: pengawasan_rekomendasi (Surat Peringatan & Tindak Lanjut Rekomendasi)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.pengawasan_rekomendasi (
  id                    VARCHAR(50) PRIMARY KEY,            -- Contoh: "REK-TU-001"
  nomor_surat           VARCHAR(100) NOT NULL,
  tertib_type           VARCHAR(30) NOT NULL 
                        CHECK (tertib_type IN ('tertib-usaha', 'tertib-penyelenggaraan', 'tertib-pemanfaatan')),
  badan_usaha_atau_objek VARCHAR(255) NOT NULL,
  temuan_utama          TEXT NOT NULL,
  rekomendasi_tindakan  TEXT NOT NULL,
  tenggat_waktu         DATE NOT NULL,
  status_tindak_lanjut  VARCHAR(30) NOT NULL DEFAULT 'Belum Selesai' 
                        CHECK (status_tindak_lanjut IN ('Belum Selesai', 'Dalam Proses', 'Selesai & Patuh', 'Diberi Sanksi')),
  status_verifikasi     VARCHAR(30) NOT NULL DEFAULT 'Draft' 
                        CHECK (status_verifikasi IN ('Draft', 'Terverifikasi', 'Ditolak')),
  catatan_verifikator   TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks Rekomendasi
CREATE INDEX IF NOT EXISTS idx_rekomendasi_tertib ON public.pengawasan_rekomendasi(tertib_type);
CREATE INDEX IF NOT EXISTS idx_rekomendasi_status ON public.pengawasan_rekomendasi(status_tindak_lanjut);

-- =============================================================================
-- 3. TABEL: pengawasan_sdm_perencanaan (Tim Pengawas Teknis & SK Penugasan)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.pengawasan_sdm_perencanaan (
  id          VARCHAR(50) PRIMARY KEY,                      -- Contoh: "SDM-TU-01"
  tertib_type VARCHAR(30) NOT NULL 
              CHECK (tertib_type IN ('tertib-usaha', 'tertib-penyelenggaraan', 'tertib-pemanfaatan')),
  wilayah     VARCHAR(255) NOT NULL,
  jumlah_sdm  INTEGER NOT NULL DEFAULT 1,
  tahun       VARCHAR(10) NOT NULL DEFAULT '2026',
  dokumen     VARCHAR(255),
  status      VARCHAR(30) DEFAULT 'Terverifikasi' 
              CHECK (status IN ('Menunggu Verifikasi', 'Terverifikasi', 'Ditolak')),
  nama_tim    VARCHAR(200),
  ketua_tim   VARCHAR(200),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.pengawasan_sesi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengawasan_rekomendasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengawasan_sdm_perencanaan ENABLE ROW LEVEL SECURITY;

-- Sesi Pengawasan RLS
DROP POLICY IF EXISTS "Public can view pengawasan_sesi" ON public.pengawasan_sesi;
CREATE POLICY "Public can view pengawasan_sesi" ON public.pengawasan_sesi FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage pengawasan_sesi" ON public.pengawasan_sesi;
CREATE POLICY "Admins can manage pengawasan_sesi" ON public.pengawasan_sesi FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN_BIDANG')
  )
);

-- Rekomendasi RLS
DROP POLICY IF EXISTS "Public can view pengawasan_rekomendasi" ON public.pengawasan_rekomendasi;
CREATE POLICY "Public can view pengawasan_rekomendasi" ON public.pengawasan_rekomendasi FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage pengawasan_rekomendasi" ON public.pengawasan_rekomendasi;
CREATE POLICY "Admins can manage pengawasan_rekomendasi" ON public.pengawasan_rekomendasi FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN_BIDANG')
  )
);

-- SDM Perencanaan RLS
DROP POLICY IF EXISTS "Public can view pengawasan_sdm" ON public.pengawasan_sdm_perencanaan;
CREATE POLICY "Public can view pengawasan_sdm" ON public.pengawasan_sdm_perencanaan FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage pengawasan_sdm" ON public.pengawasan_sdm_perencanaan;
CREATE POLICY "Admins can manage pengawasan_sdm" ON public.pengawasan_sdm_perencanaan FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN_BIDANG')
  )
);

-- =============================================================================
-- 5. INITIAL SEED DATA (Idempotent: ON CONFLICT DO NOTHING)
-- =============================================================================

-- Seed Sesi Pengawasan
INSERT INTO public.pengawasan_sesi (id, simak_code, tipe_tertib, nama_objek, badan_usaha, lokasi, tanggal_audit, pengawas, skor_tertib, kategori_hasil, status_verifikasi, dokumen_bap)
VALUES
  ('PEL-TU-001', 'SIMAK 1a1', 'tertib-usaha', 'Audit Kelayakan NIB & SBU Konstruksi', 'PT. Pakuan Graha Konstruksi', 'Kecamatan Cibinong', '2026-03-12', 'Ir. Hendra Setiawan, S.T.', 92, 'Tertib', 'Terverifikasi', 'BAP_SIMAK_1a1_PakuanGraha.pdf'),
  ('PEL-TU-002', 'SIMAK 1d', 'tertib-usaha', 'Pemeriksaan Kepemilikan SKK TKK Lapangan', 'CV. Baraya Cipta Mandiri', 'Kecamatan Cileungsi', '2026-03-18', 'Bambang Kurniawan, S.T.', 68, 'Kurang Tertib', 'Draft', 'BAP_SIMAK_1d_BarayaCipta.pdf'),
  ('PEL-TP-001', 'SIMAK 2c', 'tertib-penyelenggaraan', 'Audit SMKK Lapangan & RKK Proyek Jembatan', 'PT. Jaya Makmur Infrastruktur', 'Kecamatan Ciawi', '2026-03-22', 'Ir. Rahmat Hidayat, M.T.', 86, 'Tertib', 'Terverifikasi', 'BAP_SIMAK_2c_JembatanCiawi.pdf'),
  ('PEL-TM-001', 'SIMAK 3', 'tertib-pemanfaatan', 'Evaluasi BAST & SOP Pemeliharaan Gedung Puskesmas', 'Dinas Kesehatan / RSUD', 'Kecamatan Sukaraja', '2026-03-25', 'Dr. Ir. Wahyudi, M.Sc.', 82, 'Tertib', 'Terverifikasi', 'BAP_SIMAK_3_PuskesmasSukaraja.pdf')
ON CONFLICT (id) DO NOTHING;

-- Seed Rekomendasi Pengawasan
INSERT INTO public.pengawasan_rekomendasi (id, nomor_surat, tertib_type, badan_usaha_atau_objek, temuan_utama, rekomendasi_tindakan, tenggat_waktu, status_tindak_lanjut, status_verifikasi, catatan_verifikator)
VALUES
  ('REK-TU-001', '600.1.2/142/DPU-JAKON/2026', 'tertib-usaha', 'CV. Baraya Cipta Mandiri', '4 orang tukang pasang bata dan juru ukur belum memiliki sertifikat SKK aktif.', 'Mendaftarkan TKK terkait pada Program Fasilitasi Uji Kompetensi TKK DPU Kab. Bogor.', '2026-04-30', 'Dalam Proses', 'Draft', 'Menunggu bukti pendaftaran uji sertifikasi BNSP/LSP.'),
  ('REK-TU-002', '600.1.2/098/DPU-JAKON/2026', 'tertib-usaha', 'PT. Mega Karya Mandiri', 'Alamat kantor cabang pada NIB belum disesuaikan dengan domisili faktual Cibinong.', 'Melakukan pemutakhiran data alamat pada portal OSS-RBA dan konfirmasi SIPJAKI.', '2026-04-15', 'Selesai & Patuh', 'Terverifikasi', 'NIB terupdate telah diverifikasi via OSS-RBA.'),
  ('REK-TP-001', '600.1.2/189/DPU-JAKON/2026', 'tertib-penyelenggaraan', 'PT. Samudra Beton Persada (Paket Jl. Bomang)', 'Pekerja di zona galian tidak mengenakan helm rompi reflektif secara konsisten.', 'Wajib melakukan safety induction harian dan inspeksi kelengkapan APD oleh Petugas K3 Konstruksi.', '2026-04-10', 'Selesai & Patuh', 'Terverifikasi', 'Surat teguran tertulis telah ditindaklanjuti dan APD telah dipenuhi.'),
  ('REK-TM-001', '600.1.2/210/DPU-JAKON/2026', 'tertib-pemanfaatan', 'Gedung Kantor Camat Gunung Putri', 'Dokumen SOP Pemeliharaan Berkala Instalasi Mekanikal/Elektrikal belum terdokumentasi.', 'Menyusun jadwal maintenance AC dan genset serta pengurusan sertifikasi laik fungsi.', '2026-05-15', 'Dalam Proses', 'Draft', 'Sudah dijadwalkan inspeksi teknis gabungan dengan konsultan perencana.')
ON CONFLICT (id) DO NOTHING;

-- Seed SDM Perencanaan
INSERT INTO public.pengawasan_sdm_perencanaan (id, tertib_type, wilayah, jumlah_sdm, tahun, dokumen, status, nama_tim, ketua_tim)
VALUES
  ('SDM-TU-01', 'tertib-usaha', 'Wilayah I (Cibinong, Citeureup, Sukaraja, Babakan Madang)', 6, '2026', 'SK_Bupati_Tim_Pengawas_Usaha_Wil_I_2026.pdf', 'Terverifikasi', 'Tim Pengawas Teknis Usaha Wilayah I', 'Ir. Hendra Setiawan, S.T., M.Si. (Asesor Utama)'),
  ('SDM-TU-02', 'tertib-usaha', 'Wilayah II (Cileungsi, Gunung Putri, Jonggol, Cariu)', 5, '2026', 'SK_Kadis_PUPR_Pengawas_Wil_II.pdf', 'Terverifikasi', 'Tim Pengawas Teknis Usaha Wilayah II', 'Bambang Kurniawan, S.T. (Asesor Madya)'),
  ('SDM-TU-03', 'tertib-usaha', 'Wilayah III (Ciawi, Megamendung, Cisarua, Caringin, Cijeruk)', 5, '2026', 'SK_Tim_Pengawas_Wil_III_Revisi.pdf', 'Menunggu Verifikasi', 'Tim Pengawas Kawasan Puncak & Selatan', 'Dedi Supriyadi, S.T.')
ON CONFLICT (id) DO NOTHING;

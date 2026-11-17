-- =============================================================================
-- MIGRATION 007: Skema Perencanaan Anggaran Pengawasan (3 Tertib)
-- Menyelaraskan Standar Kolom SIPJAKI (Wilayah, Jumlah Anggaran, Dokumen, Status, Aksi Edit/Hapus)
-- + Nilai Tambah SIJAKON (Realisasi Belanja, % Serapan, Sumber Dana APBD/DAK/Banprov)
-- =============================================================================

-- =============================================================================
-- 1. TABEL: pengawasan_anggaran_perencanaan (Alokasi & Realisasi Anggaran Pengawasan)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.pengawasan_anggaran_perencanaan (
  id                  VARCHAR(50) PRIMARY KEY,              -- Contoh: "ANG-TU-01", "ANG-TP-01"
  tertib_type         VARCHAR(30) NOT NULL 
                      CHECK (tertib_type IN ('tertib-usaha', 'tertib-penyelenggaraan', 'tertib-pemanfaatan')),
  wilayah             VARCHAR(255) NOT NULL DEFAULT 'Kabupaten Bogor', -- [Standar SIPJAKI: Wilayah Penugasan]
  tahun               VARCHAR(10) NOT NULL DEFAULT '2026',             -- [Standar SIPJAKI: Tahun Anggaran]
  program             VARCHAR(255) NOT NULL,                           -- Uraian Program & Sub-Kegiatan RKA
  pagu_anggaran       BIGINT NOT NULL DEFAULT 0,                       -- [Standar SIPJAKI: Jumlah Anggaran]
  realisasi           BIGINT NOT NULL DEFAULT 0,                       -- [Keunggulan SIJAKON: Realisasi Penyerapan]
  sumber_dana         VARCHAR(50) NOT NULL DEFAULT 'APBD Kab. Bogor'   -- [Keunggulan SIJAKON: Sumber Pembiayaan]
                      CHECK (sumber_dana IN ('APBD Kab. Bogor', 'DAK Fisik', 'Bantuan Keuangan Provinsi')),
  dokumen_rka         VARCHAR(255),                                    -- [Standar SIPJAKI: Berkas RKA/DPA PDF]
  status              VARCHAR(30) NOT NULL DEFAULT 'Disetujui'         -- [Standar SIPJAKI: Status]
                      CHECK (status IN ('Disetujui', 'Revisi', 'Usulan')),
  catatan             TEXT,
  created_by          UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks Performa Query
CREATE INDEX IF NOT EXISTS idx_anggaran_tertib ON public.pengawasan_anggaran_perencanaan(tertib_type);
CREATE INDEX IF NOT EXISTS idx_anggaran_tahun ON public.pengawasan_anggaran_perencanaan(tahun);
CREATE INDEX IF NOT EXISTS idx_anggaran_status ON public.pengawasan_anggaran_perencanaan(status);
CREATE INDEX IF NOT EXISTS idx_anggaran_sumber ON public.pengawasan_anggaran_perencanaan(sumber_dana);
CREATE INDEX IF NOT EXISTS idx_anggaran_wilayah ON public.pengawasan_anggaran_perencanaan(wilayah);

-- =============================================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.pengawasan_anggaran_perencanaan ENABLE ROW LEVEL SECURITY;

-- Policy 1: Hak Baca untuk Publik & Seluruh Pengguna Terotentikasi
DROP POLICY IF EXISTS "Public & authenticated can view anggaran perencanaan" 
  ON public.pengawasan_anggaran_perencanaan;
CREATE POLICY "Public & authenticated can view anggaran perencanaan" 
  ON public.pengawasan_anggaran_perencanaan FOR SELECT USING (true);

-- Policy 2: Hak Tulis, Edit, dan Hapus Khusus Super Admin & Admin Bidang (Bina Konstruksi)
DROP POLICY IF EXISTS "Admins can manage anggaran perencanaan" 
  ON public.pengawasan_anggaran_perencanaan;
CREATE POLICY "Admins can manage anggaran perencanaan" 
  ON public.pengawasan_anggaran_perencanaan FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN_BIDANG')
    )
  );

-- =============================================================================
-- 3. SEED DATA AWAL: ALOKASI ANGGARAN 3 TERTIB TA 2026
-- =============================================================================
INSERT INTO public.pengawasan_anggaran_perencanaan 
  (id, tertib_type, wilayah, tahun, program, pagu_anggaran, realisasi, sumber_dana, dokumen_rka, status)
VALUES
  (
    'ANG-TU-01',
    'tertib-usaha',
    'Kabupaten Bogor (40 Kecamatan)',
    '2026',
    'Honorarium Tim Asesor & Transport Lapangan Pengawasan Tertib Usaha',
    185000000,
    92500000,
    'APBD Kab. Bogor',
    'RKA_PUPR_Pengawasan_Usaha_2026.pdf',
    'Disetujui'
  ),
  (
    'ANG-TU-02',
    'tertib-usaha',
    'Wilayah I & II (Cibinong, Cileungsi, Jonggol)',
    '2026',
    'Bimbingan Teknis & Pembinaan Legalitas NIB/SBU BUJK Kualifikasi Kecil',
    75000000,
    45000000,
    'APBD Kab. Bogor',
    'RKA_Bimtek_BUJK_2026.pdf',
    'Disetujui'
  ),
  (
    'ANG-TP-01',
    'tertib-penyelenggaraan',
    'Kabupaten Bogor (Paket Fisik Strategis APBD/DAK)',
    '2026',
    'Pengujian Sampel Mutu Laboratorium Beton/Aspal & Audit Lapangan SMKK/K3',
    240000000,
    144000000,
    'DAK Fisik',
    'RKA_Audit_Penyelenggaraan_DAK_2026.pdf',
    'Disetujui'
  ),
  (
    'ANG-TM-01',
    'tertib-pemanfaatan',
    'Kecamatan Sukaraja, Cibinong, Ciawi',
    '2026',
    'Inspeksi Kelaikan Fungsi Purna-Konstruksi Bangunan Gedung RSUD & Kantor Camat',
    120000000,
    60000000,
    'APBD Kab. Bogor',
    'RKA_Audit_Pemanfaatan_2026.pdf',
    'Disetujui'
  )
ON CONFLICT (id) DO NOTHING;

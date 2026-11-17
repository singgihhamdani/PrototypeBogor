-- =============================================================================
-- MIGRATION 006: Skema Perencanaan Timeline Pengawasan (3 Tertib)
-- Menyelaraskan Standar Kolom SIPJAKI (Wilayah, Tahun, Dokumen, Status, Aksi Edit/Hapus)
-- + Nilai Tambah SIJAKON (Target Objek Pengawasan & Rincian Siklus Operasional)
-- =============================================================================

-- =============================================================================
-- 1. TABEL: pengawasan_timeline_perencanaan (Jadwal & Target Siklus Pengawasan)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.pengawasan_timeline_perencanaan (
  id                  VARCHAR(50) PRIMARY KEY,              -- Contoh: "TIME-TU-01", "TIME-TP-01"
  tertib_type         VARCHAR(30) NOT NULL 
                      CHECK (tertib_type IN ('tertib-usaha', 'tertib-penyelenggaraan', 'tertib-pemanfaatan')),
  wilayah             VARCHAR(255) NOT NULL DEFAULT 'Kabupaten Bogor', -- [Standar SIPJAKI: Wilayah Penugasan]
  tahun               VARCHAR(10) NOT NULL DEFAULT '2026',             -- [Standar SIPJAKI: Tahun Anggaran]
  kegiatan            VARCHAR(255) NOT NULL,                           -- Rincian agenda pengawasan
  periode             VARCHAR(100) NOT NULL,                           -- Contoh: "Triwulan I (Jan - Mar 2026)"
  bulan_mulai         VARCHAR(50) NOT NULL,
  bulan_selesai       VARCHAR(50) NOT NULL,
  target_bujk         INTEGER NOT NULL DEFAULT 1,                      -- [Keunggulan SIJAKON: Target Objek]
  status              VARCHAR(30) NOT NULL DEFAULT 'Terjadwal'         -- [Standar SIPJAKI: Status]
                      CHECK (status IN ('Terjadwal', 'Berjalan', 'Selesai')),
  dokumen_jadwal      VARCHAR(255),                                    -- [Standar SIPJAKI: Berkas KAK/Jadwal PDF]
  created_by          UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks Performa Query
CREATE INDEX IF NOT EXISTS idx_timeline_tertib ON public.pengawasan_timeline_perencanaan(tertib_type);
CREATE INDEX IF NOT EXISTS idx_timeline_tahun ON public.pengawasan_timeline_perencanaan(tahun);
CREATE INDEX IF NOT EXISTS idx_timeline_status ON public.pengawasan_timeline_perencanaan(status);
CREATE INDEX IF NOT EXISTS idx_timeline_wilayah ON public.pengawasan_timeline_perencanaan(wilayah);

-- =============================================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.pengawasan_timeline_perencanaan ENABLE ROW LEVEL SECURITY;

-- Policy 1: Hak Baca untuk Publik & Seluruh Pengguna Terotentikasi
DROP POLICY IF EXISTS "Public & authenticated can view timeline perencanaan" 
  ON public.pengawasan_timeline_perencanaan;
CREATE POLICY "Public & authenticated can view timeline perencanaan" 
  ON public.pengawasan_timeline_perencanaan FOR SELECT USING (true);

-- Policy 2: Hak Tulis, Edit, dan Hapus Khusus Super Admin & Admin Bidang (Bina Konstruksi)
DROP POLICY IF EXISTS "Admins can manage timeline perencanaan" 
  ON public.pengawasan_timeline_perencanaan;
CREATE POLICY "Admins can manage timeline perencanaan" 
  ON public.pengawasan_timeline_perencanaan FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN_BIDANG')
    )
  );

-- =============================================================================
-- 3. SEED DATA AWAL: RENCANA TIMELINE 3 TERTIB TA 2026
-- =============================================================================
INSERT INTO public.pengawasan_timeline_perencanaan 
  (id, tertib_type, wilayah, tahun, kegiatan, periode, bulan_mulai, bulan_selesai, target_bujk, status, dokumen_jadwal)
VALUES
  (
    'TIME-TU-01',
    'tertib-usaha',
    'Kabupaten Bogor (40 Kecamatan)',
    '2026',
    'Sosialisasi & Verifikasi NIB/SBU BUJK Kualifikasi Kecil Tahap I',
    'Triwulan I (Jan - Mar 2026)',
    'Januari 2026',
    'Maret 2026',
    45,
    'Selesai',
    'Jadwal_Sosialisasi_TU_Q1.pdf'
  ),
  (
    'TIME-TU-02',
    'tertib-usaha',
    'Wilayah I & II (Cibinong, Cileungsi, Jonggol)',
    '2026',
    'Audit Lapangan Kesesuaian SKK & SMKK BUJK Menengah-Besar',
    'Triwulan II (Apr - Jun 2026)',
    'April 2026',
    'Juni 2026',
    60,
    'Berjalan',
    'Timeline_Audit_Lapangan_Q2.pdf'
  ),
  (
    'TIME-TU-03',
    'tertib-usaha',
    'Wilayah Kawasan Industri Sentul & Gunung Putri',
    '2026',
    'Pemeriksaan Usaha Rantai Pasok Material & Alat Berat',
    'Triwulan III (Jul - Sep 2026)',
    'Juli 2026',
    'September 2026',
    35,
    'Terjadwal',
    'Rencana_Audit_RantaiPasok_Q3.pdf'
  ),
  (
    'TIME-TP-01',
    'tertib-penyelenggaraan',
    'Kabupaten Bogor (Paket Fisik Strategis APBD/DAK)',
    '2026',
    'Monitoring Penerapan Dokumen RMPK & RKK Proyek Triwulan I',
    'Triwulan I - II 2026',
    'Februari 2026',
    'Mei 2026',
    24,
    'Berjalan',
    'Timeline_Penyelenggaraan_2026.pdf'
  ),
  (
    'TIME-TM-01',
    'tertib-pemanfaatan',
    'Kecamatan Sukaraja, Cibinong, Ciawi',
    '2026',
    'Audit Pemeliharaan Rutin Gedung RSUD & Kantor Kecamatan',
    'Semester I 2026',
    'Maret 2026',
    'Juni 2026',
    18,
    'Berjalan',
    'Timeline_Pemanfaatan_Sem1.pdf'
  )
ON CONFLICT (id) DO NOTHING;

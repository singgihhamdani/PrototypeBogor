-- =============================================================================
-- MIGRATION 003: Skema Master Data (BUJK, Paket Pekerjaan, TKK) & Seed Awal
-- =============================================================================

-- =============================================================================
-- 1. TABEL: bujk (Badan Usaha Jasa Konstruksi)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.bujk (
  id                      VARCHAR(50) PRIMARY KEY,        -- Contoh: "B001", "B002"
  nama_badan_usaha        VARCHAR(255) NOT NULL,
  bentuk_usaha            VARCHAR(20) DEFAULT 'PT' 
                          CHECK (bentuk_usaha IN ('PT', 'CV', 'Firma', 'Koperasi', 'Perorangan')),
  nib                     VARCHAR(30) UNIQUE NOT NULL,
  npwp                    VARCHAR(30) NOT NULL,
  penanggung_jawab        VARCHAR(200) NOT NULL,
  kualifikasi             VARCHAR(20) NOT NULL 
                          CHECK (kualifikasi IN ('Besar', 'Menengah', 'Kecil')),
  kecamatan               VARCHAR(100) NOT NULL,
  kode_kecamatan          VARCHAR(10),
  alamat                  TEXT NOT NULL,
  telepon                 VARCHAR(30),
  email                   VARCHAR(100),
  jumlah_sbu              INTEGER DEFAULT 1,
  tanggal_kedaluwarsa_sbu DATE,
  status_verifikasi       VARCHAR(30) DEFAULT 'Aktif' 
                          CHECK (status_verifikasi IN ('Aktif', 'Menunggu Verifikasi', 'Dibekukan', 'Dicabut')),
  proyek_aktif_count      INTEGER DEFAULT 0,
  dokumen_legalitas_url   TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks BUJK
CREATE INDEX IF NOT EXISTS idx_bujk_nib ON public.bujk(nib);
CREATE INDEX IF NOT EXISTS idx_bujk_kualifikasi ON public.bujk(kualifikasi);
CREATE INDEX IF NOT EXISTS idx_bujk_status ON public.bujk(status_verifikasi);
CREATE INDEX IF NOT EXISTS idx_bujk_kecamatan ON public.bujk(kecamatan);

-- =============================================================================
-- 2. TABEL: paket_pekerjaan (Proyek Jasa Konstruksi Kabupaten Bogor)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.paket_pekerjaan (
  id                  VARCHAR(50) PRIMARY KEY,          -- Contoh: "P001", "P002"
  nama_paket          VARCHAR(300) NOT NULL,
  tahun_anggaran      INTEGER NOT NULL,
  sumber_dana         VARCHAR(50) NOT NULL 
                      CHECK (sumber_dana IN ('APBD', 'DAK', 'APBN', 'Bantuan Keuangan')),
  nama_instansi       VARCHAR(200) NOT NULL,            -- OPD Penanggung Jawab (e.g. DPU Kab. Bogor)
  bujk_id             VARCHAR(50) REFERENCES public.bujk(id) ON DELETE SET NULL,
  nama_penyedia       VARCHAR(255) NOT NULL,
  nib_penyedia        VARCHAR(30),
  nilai_kontrak       NUMERIC(15, 2) NOT NULL,
  jenis_kontrak       VARCHAR(50) DEFAULT 'Konstruksi',
  sifat_kontrak       VARCHAR(50) DEFAULT 'Harga Satuan',
  tanggal_mulai       DATE NOT NULL,
  tanggal_selesai     DATE NOT NULL,
  progres_fisik       NUMERIC(5, 2) DEFAULT 0,
  progres_keuangan    NUMERIC(5, 2) DEFAULT 0,
  bulan_progres       VARCHAR(30) DEFAULT 'Agustus',
  status_pekerjaan    VARCHAR(30) DEFAULT 'Pelaksanaan' 
                      CHECK (status_pekerjaan IN ('Perencanaan', 'Pemilihan', 'Pelaksanaan', 'Selesai', 'Kritis')),
  kode_kecamatan      VARCHAR(10),
  kecamatan           VARCHAR(100),
  lat                 NUMERIC(10, 7),
  lng                 NUMERIC(10, 7),
  kurva_s_rencana     JSONB DEFAULT '[]'::jsonb,
  kurva_s_realisasi   JSONB DEFAULT '[]'::jsonb,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks Paket Pekerjaan
CREATE INDEX IF NOT EXISTS idx_paket_bujk ON public.paket_pekerjaan(bujk_id);
CREATE INDEX IF NOT EXISTS idx_paket_tahun ON public.paket_pekerjaan(tahun_anggaran);
CREATE INDEX IF NOT EXISTS idx_paket_status ON public.paket_pekerjaan(status_pekerjaan);
CREATE INDEX IF NOT EXISTS idx_paket_sumber_dana ON public.paket_pekerjaan(sumber_dana);

-- =============================================================================
-- 3. TABEL: tkk (Tenaga Kerja Konstruksi Bersertifikat)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.tkk (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nik                   VARCHAR(16) UNIQUE NOT NULL,
  nama_lengkap          VARCHAR(200) NOT NULL,
  nomor_registrasi_skk  VARCHAR(100) UNIQUE,
  jabatan_kerja         VARCHAR(150) NOT NULL,
  jenjang               INTEGER CHECK (jenjang BETWEEN 1 AND 9),
  klasifikasi           VARCHAR(100),
  subklasifikasi        VARCHAR(150),
  lembaga_penerbit      VARCHAR(150),
  masa_berlaku          DATE,
  bujk_id               VARCHAR(50) REFERENCES public.bujk(id) ON DELETE SET NULL,
  nama_bujk             VARCHAR(200),
  skor_sertifikasi      NUMERIC(5, 2),
  status_aktif          BOOLEAN DEFAULT TRUE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks TKK
CREATE INDEX IF NOT EXISTS idx_tkk_nik ON public.tkk(nik);
CREATE INDEX IF NOT EXISTS idx_tkk_bujk ON public.tkk(bujk_id);
CREATE INDEX IF NOT EXISTS idx_tkk_skk ON public.tkk(nomor_registrasi_skk);

-- =============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.bujk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paket_pekerjaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tkk ENABLE ROW LEVEL SECURITY;

-- Policy BUJK
DROP POLICY IF EXISTS "Public can view bujk" ON public.bujk;
CREATE POLICY "Public can view bujk" ON public.bujk FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage bujk" ON public.bujk;
CREATE POLICY "Admins can manage bujk" ON public.bujk FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN_BIDANG')
  )
);

-- Operator BUJK dapat memperbarui data perusahaannya sendiri
DROP POLICY IF EXISTS "BUJK operator can update own data" ON public.bujk;
CREATE POLICY "BUJK operator can update own data" ON public.bujk FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND bujk_id = public.bujk.id
  )
);

-- Policy Paket Pekerjaan
DROP POLICY IF EXISTS "Public can view paket_pekerjaan" ON public.paket_pekerjaan;
CREATE POLICY "Public can view paket_pekerjaan" ON public.paket_pekerjaan FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage paket_pekerjaan" ON public.paket_pekerjaan;
CREATE POLICY "Admins can manage paket_pekerjaan" ON public.paket_pekerjaan FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN_BIDANG')
  )
);

-- Policy TKK
DROP POLICY IF EXISTS "Public can view tkk" ON public.tkk;
CREATE POLICY "Public can view tkk" ON public.tkk FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage tkk" ON public.tkk;
CREATE POLICY "Admins can manage tkk" ON public.tkk FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN_BIDANG')
  )
);

-- =============================================================================
-- 5. SEED DATA DARI PROTOTYPE (Idempotent: ON CONFLICT DO NOTHING)
-- =============================================================================

-- Seed BUJK
INSERT INTO public.bujk (id, nama_badan_usaha, bentuk_usaha, nib, npwp, penanggung_jawab, kualifikasi, kecamatan, kode_kecamatan, alamat, telepon, email, jumlah_sbu, tanggal_kedaluwarsa_sbu, status_verifikasi, proyek_aktif_count)
VALUES
  ('B001', 'PT Bangun Jaya Konstruksi', 'PT', '1234567890123', '01.234.567.8-012.000', 'Ir. Ahmad Suryadi', 'Besar', 'Cibinong', '01', 'Jl. Raya Bogor No. 123, Cibinong', '081234567890', 'info@bangunjaya.co.id', 3, '2027-06-15', 'Aktif', 5),
  ('B002', 'CV Karya Mandiri Utama', 'CV', '2345678901234', '02.345.678.9-012.000', 'Hendra Wijaya', 'Menengah', 'Gunung Putri', '06', 'Jl. Mercedes Benz No. 45, Gunung Putri', '082345678901', 'cv.karyamandiri@gmail.com', 2, '2026-12-20', 'Aktif', 3),
  ('B003', 'PT Mitra Pembangunan Nusantara', 'PT', '3456789012345', '03.456.789.0-012.000', 'Dr. Bambang Hartono', 'Besar', 'Cileungsi', '05', 'Jl. Raya Narogong KM 12, Cileungsi', '083456789012', 'info@mitrapn.co.id', 4, '2027-03-10', 'Aktif', 7),
  ('B004', 'CV Teknik Sejahtera', 'CV', '4567890123456', '04.567.890.1-012.000', 'Agus Purnomo', 'Kecil', 'Parung', '11', 'Jl. Raya Parung No. 78, Parung', '084567890123', 'cvtekniksejahtera@gmail.com', 1, '2026-09-30', 'Aktif', 2),
  ('B005', 'PT Infrastruktur Bogor Raya', 'PT', '5678901234567', '05.678.901.2-012.000', 'Ir. Dewi Kartika, MT', 'Besar', 'Ciawi', '20', 'Jl. Raya Puncak No. 200, Ciawi', '085678901234', 'info@ibr-konstruksi.co.id', 5, '2027-08-25', 'Aktif', 6),
  ('B006', 'CV Anugerah Konstruksi', 'CV', '6789012345678', '06.789.012.3-012.000', 'Rudi Hermawan', 'Kecil', 'Leuwiliang', '25', 'Jl. Raya Leuwiliang No. 15', '086789012345', 'anugerahkon@gmail.com', 1, '2026-11-05', 'Aktif', 1),
  ('B007', 'PT Delta Cipta Perkasa', 'PT', '7890123456789', '07.890.123.4-012.000', 'Tommy Santoso', 'Menengah', 'Bojong Gede', '02', 'Jl. Raya Bojonggede No. 88', '087890123456', 'delta.cipta@gmail.com', 2, '2027-01-18', 'Aktif', 4),
  ('B008', 'CV Sarana Pembangunan', 'CV', '8901234567890', '08.901.234.5-012.000', 'Wahyu Prabowo', 'Kecil', 'Sukaraja', '03', 'Jl. Sukaraja Raya No. 33', '088901234567', 'sarana.pembangunan@gmail.com', 1, '2026-10-12', 'Menunggu Verifikasi', 0),
  ('B009', 'PT Graha Konstruksi Indonesia', 'PT', '9012345678901', '09.012.345.6-012.000', 'Ir. Siti Nurhaliza', 'Besar', 'Citeureup', '07', 'Jl. Raya Citeureup KM 5', '089012345678', 'info@grahakonstruksi.co.id', 4, '2027-05-22', 'Aktif', 5),
  ('B010', 'CV Berkah Abadi', 'CV', '0123456789012', '10.123.456.7-012.000', 'Eko Sulistyo', 'Kecil', 'Kemang', '12', 'Jl. Raya Kemang No. 55', '081123456789', 'berkah.abadi@gmail.com', 1, '2026-08-30', 'Aktif', 2)
ON CONFLICT (id) DO NOTHING;

-- Seed Paket Pekerjaan
INSERT INTO public.paket_pekerjaan (id, nama_paket, tahun_anggaran, sumber_dana, nama_instansi, bujk_id, nama_penyedia, nib_penyedia, nilai_kontrak, jenis_kontrak, sifat_kontrak, tanggal_mulai, tanggal_selesai, progres_fisik, progres_keuangan, bulan_progres, status_pekerjaan, kode_kecamatan, lat, lng, kurva_s_rencana, kurva_s_realisasi)
VALUES
  ('P001', 'Rekonstruksi Jalan Raya Cibinong - Citeureup', 2026, 'APBD', 'DPU Kab. Bogor', 'B001', 'PT Bangun Jaya Konstruksi', '1234567890123', 8500000000, 'Konstruksi', 'Harga Satuan', '2026-03-15', '2026-11-30', 68, 55, 'Agustus', 'Pelaksanaan', '01', -6.4816, 106.8516, '[0,5,12,22,35,48,60,72,85,95,100]'::jsonb, '[0,4,10,20,32,45,58,68,0,0,0]'::jsonb),
  ('P002', 'Pembangunan Gedung PAUD Terpadu Kec. Gunung Putri', 2026, 'DAK', 'Dinas Pendidikan', 'B002', 'CV Karya Mandiri Utama', '2345678901234', 3200000000, 'Konstruksi', 'Lump Sum', '2026-04-01', '2026-10-15', 82, 75, 'Agustus', 'Pelaksanaan', '06', -6.4483, 106.9092, '[0,8,20,35,50,65,80,92,100]'::jsonb, '[0,10,22,38,55,70,82,0,0]'::jsonb),
  ('P003', 'Peningkatan Jalan Lingkungan Desa Sukamahi', 2026, 'APBD', 'DPU Kab. Bogor', 'B003', 'PT Mitra Pembangunan Nusantara', '3456789012345', 1850000000, 'Konstruksi', 'Harga Satuan', '2026-05-10', '2026-09-30', 90, 82, 'Agustus', 'Pelaksanaan', '05', -6.3969, 106.9792, '[0,15,35,55,75,90,100]'::jsonb, '[0,18,38,58,78,90,0]'::jsonb),
  ('P004', 'Pembangunan Drainase Primer Kec. Parung', 2026, 'APBD', 'DPU Kab. Bogor', 'B004', 'CV Teknik Sejahtera', '4567890123456', 950000000, 'Konstruksi', 'Harga Satuan', '2026-06-01', '2026-11-15', 45, 38, 'Agustus', 'Pelaksanaan', '11', -6.4211, 106.7328, '[0,10,25,42,60,80,100]'::jsonb, '[0,8,22,38,45,0,0]'::jsonb),
  ('P005', 'Rehabilitasi Jembatan Sungai Cikeas', 2026, 'APBN', 'Balai Besar Jalan Nasional', 'B005', 'PT Infrastruktur Bogor Raya', '5678901234567', 12500000000, 'Konstruksi', 'Gabungan', '2026-02-20', '2026-12-20', 58, 48, 'Agustus', 'Pelaksanaan', '20', -6.7012, 106.8612, '[0,3,8,15,25,36,48,60,72,84,95,100]'::jsonb, '[0,2,7,14,23,34,46,58,0,0,0,0]'::jsonb),
  ('P006', 'Pembangunan Pos Jaga & Gerbang Kec. Cisarua', 2026, 'APBD', 'DPU Kab. Bogor', 'B006', 'CV Anugerah Konstruksi', '6789012345678', 650000000, 'Konstruksi', 'Lump Sum', '2026-01-10', '2026-05-30', 100, 100, 'Mei', 'Selesai', '21', -6.6889, 106.9234, '[0,20,45,70,90,100]'::jsonb, '[0,18,42,68,88,100]'::jsonb),
  ('P007', 'Peningkatan Jaringan Irigasi Kec. Leuwiliang', 2026, 'DAK', 'Dinas Pertanian', 'B007', 'PT Delta Cipta Perkasa', '7890123456789', 4200000000, 'Konstruksi', 'Harga Satuan', '2026-04-15', '2026-12-15', 52, 44, 'Agustus', 'Pelaksanaan', '25', -6.5812, 106.6234, '[0,5,15,28,42,55,68,82,95,100]'::jsonb, '[0,6,16,30,44,52,0,0,0,0]'::jsonb),
  ('P008', 'Pembangunan Rumah Dinas Camat Jonggol', 2026, 'APBD', 'Setda Kab. Bogor', 'B009', 'PT Graha Konstruksi Indonesia', '9012345678901', 2800000000, 'Konstruksi', 'Lump Sum', '2026-05-01', '2026-10-30', 72, 65, 'Agustus', 'Pelaksanaan', '08', -6.4878, 107.0517, '[0,12,28,48,68,88,100]'::jsonb, '[0,10,25,45,65,72,0]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed TKK Awal
INSERT INTO public.tkk (nik, nama_lengkap, nomor_registrasi_skk, jabatan_kerja, jenjang, klasifikasi, bujk_id, nama_bujk, skor_sertifikasi, status_aktif)
VALUES
  ('3201011203900001', 'Ahmad Fauzi', 'SKK-SMKK-2026-001', 'Petugas K3 Konstruksi', 5, 'K3 Konstruksi', 'B001', 'PT Bangun Jaya Konstruksi', 88, true),
  ('3201021508880004', 'Rian Hidayat', 'SKK-SMKK-2026-002', 'Petugas K3 Konstruksi', 5, 'K3 Konstruksi', 'B002', 'CV Karya Mandiri Utama', 92, true),
  ('3201032104920002', 'Deni Setiawan', 'SKK-SMKK-2026-003', 'Petugas K3 Konstruksi', 5, 'K3 Konstruksi', 'B003', 'PT Mitra Pembangunan Nusantara', 85, true),
  ('3201050801850003', 'Mamat Rahmat', 'SKK-TUK-2026-041', 'Tukang Pasang Bata & Plesteran', 2, 'Gedung', 'B004', 'CV Teknik Sejahtera', 89, true),
  ('3201061907870005', 'Ujang Sulaeman', 'SKK-TUK-2026-042', 'Tukang Pasang Bata & Plesteran', 2, 'Gedung', 'B006', 'CV Anugerah Konstruksi', 91, true)
ON CONFLICT (nik) DO NOTHING;

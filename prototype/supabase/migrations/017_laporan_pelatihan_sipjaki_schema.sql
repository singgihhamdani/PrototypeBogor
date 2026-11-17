-- =============================================================================
-- SIPJAKI KABUPATEN BOGOR - MIGRATION 017
-- STANDARDISASI TABEL LAPORAN PELATIHAN & SERTIFIKASI TKK (SIPJAKI PUSAT)
-- =============================================================================

-- 1. Buat Tabel public.pelatihan_laporan_sipjaki jika belum ada
CREATE TABLE IF NOT EXISTS public.pelatihan_laporan_sipjaki (
  id                  VARCHAR(50) PRIMARY KEY,              -- Contoh: "LAP-PEL-2026-001"
  tahun               VARCHAR(10) NOT NULL DEFAULT '2026',
  wilayah             VARCHAR(255) NOT NULL DEFAULT 'JAWA BARAT, KABUPATEN BOGOR',
  kab_kota            VARCHAR(100) NOT NULL DEFAULT 'KABUPATEN BOGOR',
  propinsi            VARCHAR(100) NOT NULL DEFAULT 'JAWA BARAT',
  nama_kegiatan       VARCHAR(300) NOT NULL,
  tanggal             DATE NOT NULL,
  jumlah_tkk          INTEGER NOT NULL DEFAULT 30,
  satuan_tkk          VARCHAR(50) DEFAULT 'Orang',
  nomor_ba            VARCHAR(150),
  lembaga_sertifikasi VARCHAR(255) DEFAULT 'LSP Gataki Karya Konstruksi',
  dokumen_ba_url      VARCHAR(255) DEFAULT 'BA_Pelatihan_TKK_2026.pdf',
  status              VARCHAR(50) NOT NULL DEFAULT 'Menunggu Verifikasi'
                      CHECK (status IN ('Menunggu Verifikasi', 'Terverifikasi', 'Ditolak')),
  catatan_verifikasi  TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indeks Kinerja untuk Penyaringan Cepat & Riwayat Terkini
CREATE INDEX IF NOT EXISTS idx_laporan_pelatihan_tahun ON public.pelatihan_laporan_sipjaki(tahun DESC);
CREATE INDEX IF NOT EXISTS idx_laporan_pelatihan_tanggal ON public.pelatihan_laporan_sipjaki(tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_laporan_pelatihan_updated ON public.pelatihan_laporan_sipjaki(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_laporan_pelatihan_status ON public.pelatihan_laporan_sipjaki(status);

-- 3. Row Level Security (RLS) & Kebijakan Hak Akses
ALTER TABLE public.pelatihan_laporan_sipjaki ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view laporan_pelatihan" ON public.pelatihan_laporan_sipjaki;
CREATE POLICY "Public can view laporan_pelatihan" ON public.pelatihan_laporan_sipjaki FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage laporan_pelatihan" ON public.pelatihan_laporan_sipjaki;
CREATE POLICY "Admins can manage laporan_pelatihan" ON public.pelatihan_laporan_sipjaki FOR ALL USING (true);

-- 4. Seed Data Awal Baku (3 Data TA 2026 = 90 TKK & 1 Data Arsip TA 2025)
INSERT INTO public.pelatihan_laporan_sipjaki (
  id, tahun, wilayah, kab_kota, propinsi, nama_kegiatan, tanggal,
  jumlah_tkk, satuan_tkk, nomor_ba, lembaga_sertifikasi, dokumen_ba_url,
  status, catatan_verifikasi, created_at, updated_at
) VALUES
(
  'LAP-PEL-2026-001',
  '2026',
  'JAWA BARAT, KABUPATEN BOGOR',
  'KABUPATEN BOGOR',
  'JAWA BARAT',
  'Pelatihan & Sertifikasi Pelaksana Lapangan Pekerjaan Jalan Madya',
  '2026-04-15',
  30,
  'Orang',
  '014/BA-PEL-DPU/IV/2026',
  'LSP Gataki Karya Konstruksi & Balai Jaskon Wilayah III',
  'BA_Kelulusan_Pelaksana_Jalan_2026.pdf',
  'Menunggu Verifikasi',
  'Laporan dan berkas berita acara hasil uji sertifikasi telah diunggah ke SIPJAKI Pusat, menunggu validasi verifikator balai.',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '20 minutes'
),
(
  'LAP-PEL-2026-002',
  '2026',
  'JAWA BARAT, KABUPATEN BOGOR',
  'KABUPATEN BOGOR',
  'JAWA BARAT',
  'Bimtek Petugas K3 Konstruksi & Penerapan SMKK Angkatan I',
  '2026-05-10',
  30,
  'Orang',
  '018/BA-K3-DPU/V/2026',
  'LSP Keselamatan Konstruksi Indonesia',
  'BA_Sertifikasi_K3_Konstruksi_2026.pdf',
  'Menunggu Verifikasi',
  'Seluruh 30 peserta telah menyelesaikan 32 JP bimbingan teknis dan uji portofolio keselamatan konstruksi.',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '15 minutes'
),
(
  'LAP-PEL-2026-003',
  '2026',
  'JAWA BARAT, KABUPATEN BOGOR',
  'KABUPATEN BOGOR',
  'JAWA BARAT',
  'Mobile Training Unit (MTU) Tukang Pasang Bata & Plesteran',
  '2026-05-25',
  30,
  'Orang',
  '022/BA-MTU-DPU/V/2026',
  'LSP Astekindo Konstruksi Mandiri',
  'BA_Kelulusan_MTU_Bata_2026.pdf',
  'Menunggu Verifikasi',
  'Pelatihan vokasi jemput bola di wilayah Bogor Barat telah tuntas dilaksanakan dengan tingkat kelulusan 100%.',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '10 minutes'
),
(
  'LAP-PEL-2025-001',
  '2025',
  'JAWA BARAT, KABUPATEN BOGOR',
  'KABUPATEN BOGOR',
  'JAWA BARAT',
  'Fasilitasi Sertifikasi Juru Ukur (Surveyor) Berbasis SKK',
  '2025-08-12',
  45,
  'Orang',
  '039/BA-SRV-DPU/VIII/2025',
  'LSP Geospasial & Survei Pemetaan',
  'BA_Surveyor_Kab_Bogor_2025.pdf',
  'Terverifikasi',
  'Laporan realisasi telah divalidasi dan terbit sertifikat kompetensi kerja resmi BNSP-LPJK.',
  '2025-08-12 10:00:00+07',
  '2025-09-01 16:30:00+07'
)
ON CONFLICT (id) DO UPDATE SET
  wilayah = EXCLUDED.wilayah,
  kab_kota = EXCLUDED.kab_kota,
  propinsi = EXCLUDED.propinsi,
  nama_kegiatan = EXCLUDED.nama_kegiatan,
  tanggal = EXCLUDED.tanggal,
  jumlah_tkk = EXCLUDED.jumlah_tkk,
  satuan_tkk = EXCLUDED.satuan_tkk,
  nomor_ba = EXCLUDED.nomor_ba,
  lembaga_sertifikasi = EXCLUDED.lembaga_sertifikasi,
  dokumen_ba_url = EXCLUDED.dokumen_ba_url,
  status = EXCLUDED.status,
  catatan_verifikasi = EXCLUDED.catatan_verifikasi,
  updated_at = NOW();

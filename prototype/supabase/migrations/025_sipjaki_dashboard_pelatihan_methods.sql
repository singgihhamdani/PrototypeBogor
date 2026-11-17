-- =============================================================================
-- SIPJAKI KABUPATEN BOGOR - MIGRATION 025
-- PENAMBAHAN METODE: DISTANCE LEARNING, INFRASTRUKTUR BERBASIS MASYARAKAT,
-- DAN LEMBAGA PEMASYARAKATAN PADA DASHBOARD PELATIHAN SIPJAKI
-- =============================================================================

-- 1. Pastikan indeks performa untuk pencarian dan riwayat terkini
CREATE INDEX IF NOT EXISTS idx_pelatihan_sipjaki_updated_at ON public.pelatihan_sipjaki(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_pelatihan_sipjaki_tahun ON public.pelatihan_sipjaki(tahun DESC);
CREATE INDEX IF NOT EXISTS idx_pelatihan_sipjaki_metode ON public.pelatihan_sipjaki(metode);

-- 2. Tambahkan Seed Data Contoh untuk 3 Metode Baru (TA 2026)
INSERT INTO public.pelatihan_sipjaki (
  id, tahun, nama_kegiatan, metode, lokasi, jumlah_l, jumlah_p,
  kab_kota, propinsi, skk_jenjang, penyelenggara, status, keterangan, created_at, updated_at
) VALUES
(
  'PEL-2026-006',
  '2026',
  'Distance Learning: Pelatihan Building Information Modelling (BIM) Konstruksi',
  'Distance Learning',
  'Online LMS SIPJAKI & Laboratorium Komputer DPU',
  24,
  8,
  'Kabupaten Bogor',
  'Jawa Barat',
  'Jenjang 5 (Teknisi/Analis)',
  'Dinas PUPR Kab. Bogor & Balai Jasa Konstruksi Wilayah III',
  'Sedang Berjalan',
  'Metode pembelajaran jarak jauh interaktif dengan studi kasus pemodelan struktur jembatan',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '10 minutes'
),
(
  'PEL-2026-007',
  '2026',
  'Pelatihan Vokasi Padat Karya Infrastruktur Berbasis Masyarakat (IBM)',
  'Infrastruktur Berbasis Masyarakat',
  'Kecamatan Rumpin & Nanggung (Wilayah Perdesaan)',
  35,
  5,
  'Kabupaten Bogor',
  'Jawa Barat',
  'Jenjang 2 (Tukang Terampil)',
  'Dinas PUPR Kab. Bogor',
  'Selesai & Tersertifikasi',
  'Pemberdayaan tenaga kerja lokal untuk pemeliharaan jalan desa dan drainase lingkungan',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '30 minutes'
),
(
  'PEL-2026-008',
  '2026',
  'Bimtek Konstruksi & Sertifikasi Kejuruan Warga Binaan Lembaga Pemasyarakatan',
  'Lembaga Pemasyarakatan',
  'Lapas Kelas IIA Cibinong (Pondok Rajeg)',
  20,
  0,
  'Kabupaten Bogor',
  'Jawa Barat',
  'Jenjang 1 (Operator Pemula)',
  'Dinas PUPR Kab. Bogor bekerjasama dengan Ditjen Pemasyarakatan',
  'Selesai & Tersertifikasi',
  'Program pembinaan kemandirian vokasi pertukangan kayu dan batu bagi warga binaan pemasyarakatan',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '1 hour'
)
ON CONFLICT (id) DO UPDATE SET
  nama_kegiatan = EXCLUDED.nama_kegiatan,
  metode = EXCLUDED.metode,
  lokasi = EXCLUDED.lokasi,
  jumlah_l = EXCLUDED.jumlah_l,
  jumlah_p = EXCLUDED.jumlah_p,
  skk_jenjang = EXCLUDED.skk_jenjang,
  status = EXCLUDED.status,
  keterangan = EXCLUDED.keterangan,
  updated_at = NOW();

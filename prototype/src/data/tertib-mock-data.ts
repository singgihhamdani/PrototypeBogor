export interface SDMRecord {
  id: string;
  tertibType: 'tertib-usaha' | 'tertib-penyelenggaraan' | 'tertib-pemanfaatan';
  wilayah?: string;
  jumlahSdm: number;
  tahun: string;
  dokumen: string;
  status: 'Menunggu Verifikasi' | 'Terverifikasi' | 'Ditolak';
  keterangan?: string;
  namaTim?: string;
  nomorSuratTugas?: string;
  ketuaTim?: string;
  sertifikasiKetua?: string;
  tanggalSuratTugas?: string;
  _docStatus?: 'complete' | 'pending';
}

export interface TimelineRecord {
  id: string;
  tertibType: 'tertib-usaha' | 'tertib-penyelenggaraan' | 'tertib-pemanfaatan';
  wilayah: string;
  tahun: string;
  kegiatan: string;
  periode: string;
  bulanMulai: string;
  bulanSelesai: string;
  targetBujk: number;
  status: 'Selesai' | 'Berjalan' | 'Terjadwal';
  dokumenJadwal: string;
  _docStatus?: 'complete' | 'pending';
}

export interface AnggaranRecord {
  id: string;
  tertibType: 'tertib-usaha' | 'tertib-penyelenggaraan' | 'tertib-pemanfaatan';
  wilayah: string;
  program: string;
  tahun: string;
  paguAnggaran: number;
  realisasi?: number;
  sumberDana: 'APBD Kab. Bogor' | 'DAK Fisik' | 'Bantuan Keuangan Provinsi';
  dokumenRka?: string;
  dokumen?: string;
  status: 'Disetujui' | 'Revisi' | 'Usulan';
  tanggalPenetapan?: string;
  keterangan?: string;
  _docStatus?: 'complete' | 'pending';
}

export interface PemetaanRecord {
  id: string;
  tertibType: 'tertib-usaha' | 'tertib-penyelenggaraan' | 'tertib-pemanfaatan';
  namaObjek: string;
  kategori: string;
  kecamatan: string;
  lokasiSpesifik: string;
  tahun: string;
  statusAudit: 'Sudah Diaudit' | 'Dijadwalkan' | 'Belum Terjadwal';
  prioritas: 'Tinggi' | 'Sedang' | 'Rendah';
}

export interface TargetRecord {
  id: string;
  tertibType: 'tertib-usaha' | 'tertib-penyelenggaraan' | 'tertib-pemanfaatan';
  indikator: string;
  targetKuantitatif: number;
  satuan: string;
  realisasiSaatIni?: number;
  tahun: string;
  kategori: string;
  tanggalPenetapan?: string;
  triwulan?: string;
  keterangan?: string;
  dasarHukum?: string;
}

export interface PelaksanaanRecord {
  id: string;
  simakCode: string;
  tertibType: 'tertib-usaha' | 'tertib-penyelenggaraan' | 'tertib-pemanfaatan';
  namaObjek: string;
  badanUsaha: string;
  lokasi: string;
  tanggal: string; // [Standar SIPJAKI: Tanggal Pengawasan - Dihilangkan kata Audit]
  tanggalAudit?: string; // Legacy fallback
  pengawas: string;
  statusKepatuhan: 'Patuh' | 'Tidak Patuh'; // [Standar SIPJAKI: Menggantikan Skor Tertib Numerik]
  skorTertib?: number; // Legacy fallback
  kategoriHasil?: 'Tertib' | 'Cukup Tertib' | 'Kurang Tertib';
  statusVerifikasi: 'Draft' | 'Terverifikasi' | 'Ditolak';
  dokumen: string; // [Standar SIPJAKI: Berkas Dokumen Pengawasan - Menggantikan Berita Acara BAP]
  dokumenBAP?: string; // Legacy fallback
  _docStatus?: 'complete' | 'pending';
  // Standar Kolom Form SIPJAKI SIMAK 1
  kualifikasi?: 'Kecil' | 'Menengah' | 'Besar' | 'Spesialis';
  namaProdusen?: string;
  namaPemilik?: string;
  noKontak?: string;
  kepemilikanIzin?: 'Memiliki' | 'Tidak Memiliki';
  keabsahanIzin?: 'Sah' | 'Tidak Sah' | 'Aktif';
  kapasitas?: string;
  izinBb?: 'Ada' | 'Tidak Ada';
  keabsahanBb?: 'Sah' | 'Tidak Sah';
  propinsi?: string;
  kabKota?: string;
  catatanTemuan?: string;
  rekomendasi?: string;
  updatedAt?: string;

  // Standar Kolom Form SIPJAKI SIMAK 2 (Tertib Penyelenggaraan / Proyek Konstruksi)
  namaProyek?: string;
  nilaiProyek?: number;
  nomorPerjanjian?: string;
  waktuPelaksanaan?: string;
  penyediaJasa?: string;
  namaPemilikPekerjaan?: string;
  waktuPengawasan?: string;

  // Standar Kolom Form SIPJAKI SIMAK 3 (Tertib Pemanfaatan / Bangunan Purna-Konstruksi)
  namaBangunan?: string;
  namaPengelola?: string;
  fungsiBangunan?: string;
  statusSlf?: string;
}

export interface RekomendasiRecord {
  id: string;
  nomorSurat: string;
  tertibType: 'tertib-usaha' | 'tertib-penyelenggaraan' | 'tertib-pemanfaatan';
  badanUsahaAtauObjek: string;
  paketPekerjaan?: string;
  lokasiProyek?: string;
  tanggalSurat?: string; // YYYY-MM-DD
  temuanUtama: string;
  rekomendasiTindakan: string;
  tenggatWaktu: string;
  realisasiTanggal?: string;
  jenisPeringatan?: 'Peringatan Tertulis I' | 'Peringatan Tertulis II' | 'Pembatasan Kegiatan Usaha' | 'Penghentian Sementara Proyek';
  statusTindakLanjut: 'Belum Selesai' | 'Dalam Proses' | 'Selesai & Patuh' | 'Diberi Sanksi';
  statusVerifikasi: 'Draft' | 'Terverifikasi' | 'Ditolak';
  catatanVerifikator?: string;
}

export interface PelaporanRecord {
  id: string;
  tertibType: 'tertib-usaha' | 'tertib-penyelenggaraan' | 'tertib-pemanfaatan';
  // Standar Format 8 Kolom SIPJAKI
  jenisLaporan: 'Tahunan' | 'Semesteran' | 'Triwulanan' | 'Insidental';
  namaLaporan: string; // [Standar SIPJAKI: Huruf Kapital Baku]
  tahun: string;       // [Standar SIPJAKI: Tahun Anggaran]
  propinsi?: string;
  kabKota?: string;
  wilayah: string;     // [Standar SIPJAKI: Hierarki Jawa Barat / Kabupaten Bogor]
  dokumen: string;     // [Standar SIPJAKI: Berkas Dokumen Laporan PDF]
  dokumenUrl?: string;
  status: 'Menunggu Verifikasi' | 'Terverifikasi' | 'Perlu Revisi' | 'Draft Lokal'; // [Standar SIPJAKI: Status]
  
  // Nilai Tambah & Metrik Analitik SIJAKON Daerah
  jumlahObjekDiperiksa: number;
  tingkatKepatuhan: number;
  tanggalKirim?: string;
  nomorSurat?: string;
  catatan?: string;
  _docStatus?: 'complete' | 'pending';
  
  // Backward compatibility aliases
  judulLaporan?: string;
  periode?: string;
  statusSinkronisasiSipjaki?: 'Tersinkronisasi' | 'Menunggu Verifikasi Pusat' | 'Draft Lokal' | string;
  filePdf?: string;
  fileExcel?: string;
}

// 1. DATA SDM PERENCANAAN
export const mockSDMRecords: SDMRecord[] = [
  {
    id: "SDM-TU-01",
    tertibType: "tertib-usaha",
    namaTim: "Tim Pengawas Teknis Usaha Konstruksi",
    nomorSuratTugas: "ST.600.1/104-DPUPR/2026",
    ketuaTim: "Ir. Hendra Setiawan, S.T., M.Si.",
    sertifikasiKetua: "Asesor Utama",
    jumlahSdm: 6,
    tahun: "2026",
    tanggalSuratTugas: "2026-03-24",
    dokumen: "Surat_Tugas_Tim_Pengawas_Usaha_2026.pdf",
    status: "Terverifikasi",
    keterangan: "Penugasan verifikasi kepatuhan legalitas NIB & SBU kualifikasi BUJK"
  },
  {
    id: "SDM-TU-02",
    tertibType: "tertib-usaha",
    namaTim: "Tim Asesor Perizinan & Pengembangan Usaha",
    nomorSuratTugas: "ST.600.1/088-DPUPR/2026",
    ketuaTim: "Bambang Kurniawan, S.T.",
    sertifikasiKetua: "Asesor Madya",
    jumlahSdm: 5,
    tahun: "2026",
    tanggalSuratTugas: "2026-02-18",
    dokumen: "Surat_Tugas_Asesor_Perizinan_2026.pdf",
    status: "Terverifikasi",
    keterangan: "Asesmen kecukupan tenaga ahli SKK dan kepemilikan peralatan kerja BUJK"
  },
  {
    id: "SDM-TU-03",
    tertibType: "tertib-usaha",
    namaTim: "Tim Pembinaan & Pengawasan BUJK Kualifikasi Kecil",
    nomorSuratTugas: "ST.600.1/042-DPUPR/2026",
    ketuaTim: "Dedi Supriyadi, S.T.",
    sertifikasiKetua: "Asesor Muda",
    jumlahSdm: 5,
    tahun: "2026",
    tanggalSuratTugas: "2026-01-15",
    dokumen: "Surat_Tugas_Pembinaan_BUJK_Kecil_2026.pdf",
    status: "Menunggu Verifikasi",
    keterangan: "Fasilitasi bimtek pembinaan dan pemutakhiran sertifikasi BUJK lokal"
  },
  {
    id: "SDM-TP-01",
    tertibType: "tertib-penyelenggaraan",
    namaTim: "Satgas Pengawas Penyelenggaraan Konstruksi Strategis",
    nomorSuratTugas: "ST.600.1/102-DPUPR/2026",
    ketuaTim: "Ir. Rahmat Hidayat, M.T.",
    sertifikasiKetua: "Ahli Madya SMKK",
    jumlahSdm: 8,
    tahun: "2026",
    tanggalSuratTugas: "2026-03-20",
    dokumen: "Surat_Tugas_Satgas_Penyelenggaraan_2026.pdf",
    status: "Terverifikasi",
    keterangan: "Pengawasan penerapan SMKK, K3 Konstruksi, dan pengendalian mutu beton/aspal"
  },
  {
    id: "SDM-TP-02",
    tertibType: "tertib-penyelenggaraan",
    namaTim: "Tim Pengawas Mutu & Progres Infrastruktur Jalan-Jembatan",
    nomorSuratTugas: "ST.600.1/076-DPUPR/2026",
    ketuaTim: "Agus Pratama, S.T.",
    sertifikasiKetua: "Ahli Pengawas Mutu",
    jumlahSdm: 6,
    tahun: "2026",
    tanggalSuratTugas: "2026-02-12",
    dokumen: "Surat_Tugas_Tim_Mutu_Infrastruktur_2026.pdf",
    status: "Terverifikasi",
    keterangan: "Uji petik sampel material laboratorium dan kepatuhan spesifikasi teknis Bina Marga"
  },
  {
    id: "SDM-TP-03",
    tertibType: "tertib-penyelenggaraan",
    namaTim: "Tim Pengawasan Keselamatan Kerja Konstruksi (K3)",
    nomorSuratTugas: "ST.600.1/035-DPUPR/2026",
    ketuaTim: "Siti Nurjanah, S.T., M.Eng.",
    sertifikasiKetua: "Ahli K3 Konstruksi",
    jumlahSdm: 4,
    tahun: "2026",
    tanggalSuratTugas: "2026-01-10",
    dokumen: "Surat_Tugas_Pengawasan_K3_2026.pdf",
    status: "Terverifikasi",
    keterangan: "Inspeksi keselamatan konstruksi dan pemenuhan dokumen RKK di lapangan"
  },
  {
    id: "SDM-TM-01",
    tertibType: "tertib-pemanfaatan",
    namaTim: "Tim Pengawasan Laik Fungsi Bangunan Gedung Publik",
    nomorSuratTugas: "ST.600.1/095-DPUPR/2026",
    ketuaTim: "Dr. Ir. Wahyudi, M.Sc.",
    sertifikasiKetua: "Ahli Bangunan Gedung",
    jumlahSdm: 5,
    tahun: "2026",
    tanggalSuratTugas: "2026-03-15",
    dokumen: "Surat_Tugas_Pemanfaatan_Gedung_2026.pdf",
    status: "Terverifikasi",
    keterangan: "Pemeriksaan kelaikan fungsi struktural, keselamatan kebakaran, dan aksesibilitas"
  },
  {
    id: "SDM-TM-02",
    tertibType: "tertib-pemanfaatan",
    namaTim: "Tim Pengawasan Operasi & Pemeliharaan Jembatan & Prasarana",
    nomorSuratTugas: "ST.600.1/061-DPUPR/2026",
    ketuaTim: "Ir. Doni Kusuma, M.T.",
    sertifikasiKetua: "Ahli Pemeliharaan Jembatan",
    jumlahSdm: 4,
    tahun: "2026",
    tanggalSuratTugas: "2026-02-05",
    dokumen: "Surat_Tugas_Tim_Pemeliharaan_Prasarana_2026.pdf",
    status: "Terverifikasi",
    keterangan: "Monitoring dokumen RTB (Rencana Teknis Pembongkaran) dan kelaikan fungsi prasarana"
  }
];

// 2. DATA TIMELINE PERENCANAAN
export const mockTimelineRecords: TimelineRecord[] = [
  {
    id: "TIME-TU-01",
    tertibType: "tertib-usaha",
    wilayah: "Kabupaten Bogor (40 Kecamatan)",
    tahun: "2026",
    kegiatan: "Sosialisasi & Verifikasi NIB/SBU BUJK Kualifikasi Kecil Tahap I",
    periode: "Triwulan I (Jan - Mar 2026)",
    bulanMulai: "Januari 2026",
    bulanSelesai: "Maret 2026",
    targetBujk: 45,
    status: "Selesai",
    dokumenJadwal: "Jadwal_Sosialisasi_TU_Q1.pdf"
  },
  {
    id: "TIME-TU-02",
    tertibType: "tertib-usaha",
    wilayah: "Wilayah I & II (Cibinong, Cileungsi, Jonggol)",
    tahun: "2026",
    kegiatan: "Audit Lapangan Kesesuaian SKK & SMKK BUJK Menengah-Besar",
    periode: "Triwulan II (Apr - Jun 2026)",
    bulanMulai: "April 2026",
    bulanSelesai: "Juni 2026",
    targetBujk: 60,
    status: "Berjalan",
    dokumenJadwal: "Timeline_Audit_Lapangan_Q2.pdf"
  },
  {
    id: "TIME-TU-03",
    tertibType: "tertib-usaha",
    wilayah: "Wilayah Kawasan Industri Sentul & Gunung Putri",
    tahun: "2026",
    kegiatan: "Pemeriksaan Usaha Rantai Pasok Material & Alat Berat",
    periode: "Triwulan III (Jul - Sep 2026)",
    bulanMulai: "Juli 2026",
    bulanSelesai: "September 2026",
    targetBujk: 35,
    status: "Terjadwal",
    dokumenJadwal: "Rencana_Audit_RantaiPasok_Q3.pdf"
  },
  {
    id: "TIME-TP-01",
    tertibType: "tertib-penyelenggaraan",
    wilayah: "Kabupaten Bogor (Paket Fisik Strategis APBD/DAK)",
    tahun: "2026",
    kegiatan: "Monitoring Penerapan Dokumen RMPK & RKK Proyek Triwulan I",
    periode: "Triwulan I - II 2026",
    bulanMulai: "Februari 2026",
    bulanSelesai: "Mei 2026",
    targetBujk: 24,
    status: "Berjalan",
    dokumenJadwal: "Timeline_Penyelenggaraan_2026.pdf"
  },
  {
    id: "TIME-TM-01",
    tertibType: "tertib-pemanfaatan",
    wilayah: "Kecamatan Sukaraja, Cibinong, Ciawi",
    tahun: "2026",
    kegiatan: "Audit Pemeliharaan Rutin Gedung RSUD & Kantor Kecamatan",
    periode: "Semester I 2026",
    bulanMulai: "Maret 2026",
    bulanSelesai: "Juni 2026",
    targetBujk: 18,
    status: "Berjalan",
    dokumenJadwal: "Timeline_Pemanfaatan_Sem1.pdf"
  }
];

// 3. DATA ANGGARAN PERENCANAAN (Standar SIPJAKI Kementerian PUPR - Default Sort Terkini DESC)
export const mockAnggaranRecords: AnggaranRecord[] = [
  // --- PILAR 1: TERTIB USAHA ---
  {
    id: "ANG-TU-01",
    tertibType: "tertib-usaha",
    wilayah: "Wilayah I & II (Cibinong, Cileungsi, Jonggol)",
    program: "Bimbingan Teknis & Sosialisasi Perizinan Berusaha OSS-RBA Jasa Konstruksi",
    tahun: "2026",
    paguAnggaran: 125000000,
    sumberDana: "APBD Kab. Bogor",
    dokumenRka: "Dokumen_Anggaran_Bimtek_OSS_2026.pdf",
    dokumen: "Dokumen_Anggaran_Bimtek_OSS_2026.pdf",
    status: "Disetujui",
    tanggalPenetapan: "2026-03-24",
    keterangan: "Peningkatan kepatuhan NIB dan SBU BUJK kualifikasi kecil",
    _docStatus: "complete"
  },
  {
    id: "ANG-TU-02",
    tertibType: "tertib-usaha",
    wilayah: "Wilayah III & IV (Ciawi, Leuwiliang, Parung)",
    program: "Operasional Tim Pemeriksa Lapangan Kelayakan NIB & SBU Konstruksi",
    tahun: "2026",
    paguAnggaran: 185000000,
    sumberDana: "APBD Kab. Bogor",
    dokumenRka: "Dokumen_Anggaran_Honor_Asesor_2026.pdf",
    dokumen: "Dokumen_Anggaran_Honor_Asesor_2026.pdf",
    status: "Disetujui",
    tanggalPenetapan: "2026-03-12",
    keterangan: "Honorarium asesor, akomodasi, dan transportasi pengawasan lapangan",
    _docStatus: "complete"
  },
  {
    id: "ANG-TU-03",
    tertibType: "tertib-usaha",
    wilayah: "Seluruh Wilayah (40 Kecamatan)",
    program: "Pengawasan Kualifikasi & Sertifikasi Kompetensi Kerja (SKK) Tenaga Kerja Konstruksi",
    tahun: "2026",
    paguAnggaran: 145000000,
    sumberDana: "Bantuan Keuangan Provinsi",
    dokumenRka: "Dokumen_Anggaran_Verifikasi_TKK_2026.pdf",
    dokumen: "Dokumen_Anggaran_Verifikasi_TKK_2026.pdf",
    status: "Disetujui",
    tanggalPenetapan: "2026-02-26",
    keterangan: "Verifikasi sertifikat operator, teknisi, dan ahli konstruksi di proyek aktif",
    _docStatus: "complete"
  },
  {
    id: "ANG-TU-04",
    tertibType: "tertib-usaha",
    wilayah: "Kawasan Industri Sentul & Gunung Putri",
    program: "Pengawasan Badan Usaha Rantai Pasok Material & Peralatan Konstruksi",
    tahun: "2026",
    paguAnggaran: 95000000,
    sumberDana: "APBD Kab. Bogor",
    dokumenRka: "Dokumen_Anggaran_Rantai_Pasok_2026.pdf",
    dokumen: "Dokumen_Anggaran_Rantai_Pasok_2026.pdf",
    status: "Disetujui",
    tanggalPenetapan: "2026-02-14",
    keterangan: "Pemeriksaan izin batching plant, quarry, dan fabrikasi baja",
    _docStatus: "complete"
  },
  {
    id: "ANG-TU-05",
    tertibType: "tertib-usaha",
    wilayah: "Pusat Pemerintahan Cibinong",
    program: "Penyusunan Profil Data BUJK & Sinkronisasi Sistem Informasi SIPJAKI",
    tahun: "2026",
    paguAnggaran: 75000000,
    sumberDana: "APBD Kab. Bogor",
    dokumenRka: "Dokumen_Anggaran_Integrasi_SIPJAKI_2026.pdf",
    dokumen: "Dokumen_Anggaran_Integrasi_SIPJAKI_2026.pdf",
    status: "Disetujui",
    tanggalPenetapan: "2026-01-22",
    keterangan: "Pemeliharaan database master BUJK dan sertifikat elektronik",
    _docStatus: "complete"
  },

  // --- PILAR 2: TERTIB PENYELENGGARAAN ---
  {
    id: "ANG-TP-01",
    tertibType: "tertib-penyelenggaraan",
    wilayah: "Paket Strategis Jalan, Jembatan & Irigasi",
    program: "Uji Petik Laboratorium Mutu Beton, Aspal, dan Baja Konstruksi Fisik APBD",
    tahun: "2026",
    paguAnggaran: 280000000,
    sumberDana: "DAK Fisik",
    dokumenRka: "Dokumen_Anggaran_Uji_Mutu_Fisik_2026.pdf",
    dokumen: "Dokumen_Anggaran_Uji_Mutu_Fisik_2026.pdf",
    status: "Disetujui",
    tanggalPenetapan: "2026-03-22",
    keterangan: "Pengujian core drill beton, density aspal, dan uji tarik tulangan baja",
    _docStatus: "complete"
  },
  {
    id: "ANG-TP-02",
    tertibType: "tertib-penyelenggaraan",
    wilayah: "Seluruh Wilayah (Paket Proyek Fisik)",
    program: "Pengawasan Penerapan SMKK & Keselamatan Konstruksi (K3) Lapangan",
    tahun: "2026",
    paguAnggaran: 210000000,
    sumberDana: "APBD Kab. Bogor",
    dokumenRka: "Dokumen_Anggaran_SMKK_K3_2026.pdf",
    dokumen: "Dokumen_Anggaran_SMKK_K3_2026.pdf",
    status: "Disetujui",
    tanggalPenetapan: "2026-03-08",
    keterangan: "Inspeksi kepatuhan RKK, APD personil, dan rambu keselamatan kerja",
    _docStatus: "complete"
  },
  {
    id: "ANG-TP-03",
    tertibType: "tertib-penyelenggaraan",
    wilayah: "Wilayah I - IV",
    program: "Pemeriksaan Standar Dokumen Kontrak Kerja Konstruksi & Addendum Proyek",
    tahun: "2026",
    paguAnggaran: 135000000,
    sumberDana: "APBD Kab. Bogor",
    dokumenRka: "Dokumen_Anggaran_Kontrak_Kerja_2026.pdf",
    dokumen: "Dokumen_Anggaran_Kontrak_Kerja_2026.pdf",
    status: "Disetujui",
    tanggalPenetapan: "2026-02-18",
    keterangan: "Kepatuhan hak dan kewajiban pengguna serta penyedia jasa konstruksi",
    _docStatus: "complete"
  },
  {
    id: "ANG-TP-04",
    tertibType: "tertib-penyelenggaraan",
    wilayah: "Seluruh Wilayah (Paket Pemilihan)",
    program: "Pengawasan Tata Cara Pemilihan Penyedia Jasa & Kepatuhan Norma Tender",
    tahun: "2026",
    paguAnggaran: 110000000,
    sumberDana: "Bantuan Keuangan Provinsi",
    dokumenRka: "Dokumen_Anggaran_Proses_Tender_2026.pdf",
    dokumen: "Dokumen_Anggaran_Proses_Tender_2026.pdf",
    status: "Disetujui",
    tanggalPenetapan: "2026-01-28",
    keterangan: "Pencegahan persaingan usaha tidak sehat dan evaluasi kualifikasi lelang",
    _docStatus: "complete"
  },

  // --- PILAR 3: TERTIB PEMANFAATAN ---
  {
    id: "ANG-TM-01",
    tertibType: "tertib-pemanfaatan",
    wilayah: "Kecamatan Sukaraja, Cibinong, Ciawi, Leuwiliang",
    program: "Inspeksi Kelaikan Fungsi Bangunan Gedung Publik & Pemenuhan SLF",
    tahun: "2026",
    paguAnggaran: 195000000,
    sumberDana: "APBD Kab. Bogor",
    dokumenRka: "Dokumen_Anggaran_SLF_Gedung_2026.pdf",
    dokumen: "Dokumen_Anggaran_SLF_Gedung_2026.pdf",
    status: "Disetujui",
    tanggalPenetapan: "2026-03-20",
    keterangan: "Evaluasi keandalan struktur dan utilitas RSUD, pasar, dan fasilitas publik",
    _docStatus: "complete"
  },
  {
    id: "ANG-TM-02",
    tertibType: "tertib-pemanfaatan",
    wilayah: "Wilayah Infrastruktur Jalan & Jembatan",
    program: "Pengawasan Pemeliharaan Berkala & Laik Fungsi Jembatan Kabupaten",
    tahun: "2026",
    paguAnggaran: 165000000,
    sumberDana: "DAK Fisik",
    dokumenRka: "Dokumen_Anggaran_Pemeliharaan_Jembatan_2026.pdf",
    dokumen: "Dokumen_Anggaran_Pemeliharaan_Jembatan_2026.pdf",
    status: "Disetujui",
    tanggalPenetapan: "2026-03-02",
    keterangan: "Pemeriksaan expansion joint, gelagar beton, dan bantalan karet jembatan",
    _docStatus: "complete"
  },
  {
    id: "ANG-TM-03",
    tertibType: "tertib-pemanfaatan",
    wilayah: "Daerah Irigasi Kabupaten Bogor",
    program: "Evaluasi Kelaikan Operasi & Pemeliharaan Jaringan Irigasi Pertanian",
    tahun: "2026",
    paguAnggaran: 120000000,
    sumberDana: "APBD Kab. Bogor",
    dokumenRka: "Dokumen_Anggaran_OP_Irigasi_2026.pdf",
    dokumen: "Dokumen_Anggaran_OP_Irigasi_2026.pdf",
    status: "Disetujui",
    tanggalPenetapan: "2026-02-10",
    keterangan: "Pemeriksaan pintu air, sedimentasi, dan tanggul pelindung saluran irigasi",
    _docStatus: "complete"
  }
];

// 4. DATA PEMETAAN OBJEK
export const mockPemetaanRecords: PemetaanRecord[] = [
  {
    id: "MAP-TU-01",
    tertibType: "tertib-usaha",
    namaObjek: "PT. Bogor Bangun Sarana (Kualifikasi Menengah)",
    kategori: "Badan Usaha Jasa Konstruksi (BUJK)",
    kecamatan: "Cibinong",
    lokasiSpesifik: "Jl. Tegar Beriman No. 45, Cibinong",
    tahun: "2026",
    statusAudit: "Sudah Diaudit",
    prioritas: "Tinggi"
  },
  {
    id: "MAP-TU-02",
    tertibType: "tertib-usaha",
    namaObjek: "CV. Puncak Mandiri Tehnik (Kualifikasi Kecil)",
    kategori: "BUJK Spesialis Mekanikal Elektrikal",
    kecamatan: "Cisarua",
    lokasiSpesifik: "Jl. Raya Puncak Km. 78, Cisarua",
    tahun: "2026",
    statusAudit: "Dijadwalkan",
    prioritas: "Sedang"
  },
  {
    id: "MAP-TU-03",
    tertibType: "tertib-usaha",
    namaObjek: "PT. Sentul Beton Perkasa",
    kategori: "Rantai Pasok (Ready-Mix Concrete)",
    kecamatan: "Babakan Madang",
    lokasiSpesifik: "Kawasan Industri Sentul, Babakan Madang",
    tahun: "2026",
    statusAudit: "Sudah Diaudit",
    prioritas: "Tinggi"
  },
  {
    id: "MAP-TP-01",
    tertibType: "tertib-penyelenggaraan",
    namaObjek: "Peningkatan Jalan Poros Bojonggede - Kemang",
    kategori: "Proyek Infrastruktur Jalan APBD",
    kecamatan: "Bojonggede",
    lokasiSpesifik: "Ruas Jl. Bomang Sta 0+000 s/d 4+200",
    tahun: "2026",
    statusAudit: "Sudah Diaudit",
    prioritas: "Tinggi"
  },
  {
    id: "MAP-TM-01",
    tertibType: "tertib-pemanfaatan",
    namaObjek: "Gedung RSUD Leuwiliang Gedung Rawat Inap Terpadu",
    kategori: "Bangunan Gedung Fasilitas Kesehatan",
    kecamatan: "Leuwiliang",
    lokasiSpesifik: "Jl. Raya Cibeber No. 1, Leuwiliang",
    tahun: "2026",
    statusAudit: "Sudah Diaudit",
    prioritas: "Tinggi"
  }
];

// 5. DATA TARGET PENGAWASAN (Standar SIPJAKI Kementerian PUPR - Default Sort Terkini DESC)
export const mockTargetRecords: TargetRecord[] = [
  // --- PILAR 1: TERTIB USAHA ---
  {
    id: "TGT-TU-01",
    tertibType: "tertib-usaha",
    indikator: "Pemeriksaan Legalitas Izin Usaha, NIB & Kelengkapan SBU BUJK Kualifikasi Kecil",
    targetKuantitatif: 120,
    satuan: "Badan Usaha",
    tahun: "2026",
    kategori: "Legalitas Usaha",
    tanggalPenetapan: "2026-03-25",
    triwulan: "TW I - IV 2026",
    keterangan: "Fokus pada BUJK pelaksana proyek konstruksi APBD dan swasta",
    dasarHukum: "Permen PUPR No. 1/2023 Pasal 5"
  },
  {
    id: "TGT-TU-02",
    tertibType: "tertib-usaha",
    indikator: "Pengawasan Kesesuaian Klasifikasi & Kualifikasi BUJK Menengah dan Besar",
    targetKuantitatif: 60,
    satuan: "Badan Usaha",
    tahun: "2026",
    kategori: "SBU & Kompetensi",
    tanggalPenetapan: "2026-03-10",
    triwulan: "TW I - IV 2026",
    keterangan: "Pemeriksaan pemenuhan syarat PJT, PJK, dan kemampuan keuangan",
    dasarHukum: "PP No. 14/2021 Pasal 41"
  },
  {
    id: "TGT-TU-03",
    tertibType: "tertib-usaha",
    indikator: "Pemeriksaan Sertifikat Kompetensi Kerja (SKK) Tenaga Kerja Konstruksi (TKK)",
    targetKuantitatif: 350,
    satuan: "Tenaga Kerja (TKK)",
    tahun: "2026",
    kategori: "SDM & TKK",
    tanggalPenetapan: "2026-02-28",
    triwulan: "TW I - IV 2026",
    keterangan: "Verifikasi sertifikat jabatan kerja jenjang teknisi dan ahli konstruksi",
    dasarHukum: "UU No. 2/2017 Pasal 70"
  },
  {
    id: "TGT-TU-04",
    tertibType: "tertib-usaha",
    indikator: "Pengawasan Pengembangan Usaha Berkelanjutan (PKB) BUJK Spesialis",
    targetKuantitatif: 40,
    satuan: "Badan Usaha",
    tahun: "2026",
    kategori: "Legalitas Usaha",
    tanggalPenetapan: "2026-02-15",
    triwulan: "TW II - IV 2026",
    keterangan: "Pemeriksaan laporan tahunan kegiatan operasional dan pelatihan BUJK",
    dasarHukum: "Permen PUPR No. 1/2023 Pasal 8"
  },
  {
    id: "TGT-TU-05",
    tertibType: "tertib-usaha",
    indikator: "Verifikasi Kualifikasi dan Asosiasi Perusahaan Jasa Konstruksi Terdaftar",
    targetKuantitatif: 30,
    satuan: "Badan Usaha",
    tahun: "2026",
    kategori: "SBU & Kompetensi",
    tanggalPenetapan: "2026-01-20",
    triwulan: "TW I - II 2026",
    keterangan: "Uji silang data registrasi LPJK dan profil perusahaan di SIKI",
    dasarHukum: "Permen PUPR No. 1/2023 Pasal 12"
  },

  // --- PILAR 2: TERTIB PENYELENGGARAAN ---
  {
    id: "TGT-TP-01",
    tertibType: "tertib-penyelenggaraan",
    indikator: "Pengawasan Penerapan SMKK & Dokumen Rencana Keselamatan Konstruksi (RKK)",
    targetKuantitatif: 45,
    satuan: "Paket Pekerjaan",
    tahun: "2026",
    kategori: "SMKK & Keselamatan",
    tanggalPenetapan: "2026-03-22",
    triwulan: "TW I - IV 2026",
    keterangan: "Uji petik paket konstruksi jalan, jembatan, irigasi, dan gedung",
    dasarHukum: "Permen PUPR No. 10/2021"
  },
  {
    id: "TGT-TP-02",
    tertibType: "tertib-penyelenggaraan",
    indikator: "Pengawasan Kontrak Kerja Konstruksi Standar SIPJAKI & Norma Pengadaan",
    targetKuantitatif: 50,
    satuan: "Paket Pekerjaan",
    tahun: "2026",
    kategori: "Kontrak Kerja",
    tanggalPenetapan: "2026-03-08",
    triwulan: "TW I - IV 2026",
    keterangan: "Pemeriksaan klausul hak-kewajiban, uang muka, dan jaminan pelaksanaan",
    dasarHukum: "UU No. 2/2017 Pasal 47"
  },
  {
    id: "TGT-TP-03",
    tertibType: "tertib-penyelenggaraan",
    indikator: "Pengendalian Mutu & Pengujian Laboratorium Bahan/Material Konstruksi Fisik",
    targetKuantitatif: 35,
    satuan: "Paket Pekerjaan",
    tahun: "2026",
    kategori: "Pengendalian Mutu",
    tanggalPenetapan: "2026-02-20",
    triwulan: "TW I - IV 2026",
    keterangan: "Uji tekan beton, uji tarik baja tulangan, dan Job Mix Formula (JMF) aspal",
    dasarHukum: "Spesifikasi Teknis Bina Marga/Cipta Karya"
  },
  {
    id: "TGT-TP-04",
    tertibType: "tertib-penyelenggaraan",
    indikator: "Pemeriksaan Dokumen Proses Pemilihan Penyedia Jasa Konstruksi (Tender)",
    targetKuantitatif: 30,
    satuan: "Paket Pekerjaan",
    tahun: "2026",
    kategori: "Proses Pemilihan",
    tanggalPenetapan: "2026-02-05",
    triwulan: "TW I - II 2026",
    keterangan: "Kepatuhan ketentuan dokumen pemilihan dan evaluasi kualifikasi tender",
    dasarHukum: "Perpres No. 12/2021"
  },
  {
    id: "TGT-TP-05",
    tertibType: "tertib-penyelenggaraan",
    indikator: "Monitoring Perlindungan BPJS Ketenagakerjaan Proyek & Jam Kerja Lapangan",
    targetKuantitatif: 40,
    satuan: "Paket Pekerjaan",
    tahun: "2026",
    kategori: "SMKK & Keselamatan",
    tanggalPenetapan: "2026-01-18",
    triwulan: "TW I - IV 2026",
    keterangan: "Pencegahan kecelakaan kerja dan kepatuhan perlindungan jaminan sosial",
    dasarHukum: "Permenaker No. 5/2021"
  },

  // --- PILAR 3: TERTIB PEMANFAATAN ---
  {
    id: "TGT-TM-01",
    tertibType: "tertib-pemanfaatan",
    indikator: "Pemeriksaan Kepemilikan & Validitas Sertifikat Laik Fungsi (SLF) Bangunan Gedung Publik",
    targetKuantitatif: 25,
    satuan: "Bangunan Publik",
    tahun: "2026",
    kategori: "Laik Fungsi & SLF",
    tanggalPenetapan: "2026-03-24",
    triwulan: "TW I - IV 2026",
    keterangan: "Inspeksi berkala bangunan RSUD, pasar, gelanggang olahraga, dan kantor dinas",
    dasarHukum: "PP No. 16/2021 & Permen PUPR No. 1/2023"
  },
  {
    id: "TGT-TM-02",
    tertibType: "tertib-pemanfaatan",
    indikator: "Pengawasan Pemeliharaan & Perawatan Berkala Infrastruktur Jembatan dan Jalan",
    targetKuantitatif: 15,
    satuan: "Infrastruktur",
    tahun: "2026",
    kategori: "Operasi & Pemeliharaan",
    tanggalPenetapan: "2026-03-05",
    triwulan: "TW I - IV 2026",
    keterangan: "Pemeriksaan kondisi expansion joint, elastomeric bearing pad, dan drainase jembatan",
    dasarHukum: "Permen PUPR No. 1/2023 Pasal 18"
  },
  {
    id: "TGT-TM-03",
    tertibType: "tertib-pemanfaatan",
    indikator: "Evaluasi Kelaikan Fungsi Saluran Irigasi dan Bangunan Pengendali Banjir",
    targetKuantitatif: 20,
    satuan: "Daerah Irigasi",
    tahun: "2026",
    kategori: "Operasi & Pemeliharaan",
    tanggalPenetapan: "2026-02-18",
    triwulan: "TW I - IV 2026",
    keterangan: "Inspeksi sedimentasi, pintu air intake, dan dinding penahan saluran irigasi",
    dasarHukum: "Permen PUPR No. 12/PRT/M/2015"
  },
  {
    id: "TGT-TM-04",
    tertibType: "tertib-pemanfaatan",
    indikator: "Inspeksi Proteksi Kebakaran dan Kelaikan Instalasi Mekanikal-Elektrikal (ME)",
    targetKuantitatif: 18,
    satuan: "Bangunan Gedung",
    tahun: "2026",
    kategori: "Laik Fungsi & SLF",
    tanggalPenetapan: "2026-01-25",
    triwulan: "TW I - III 2026",
    keterangan: "Uji fungsi sistem hidran, APAR, generator darurat, dan lift gedung publik",
    dasarHukum: "Permen PUPR No. 26/PRT/M/2008"
  }
];

// 6. DATA PELAKSANAAN PENGAWASAN (SIMAK)
export const mockPelaksanaanRecords: PelaksanaanRecord[] = [
  {
    id: "PEL-TU-001",
    simakCode: "SIMAK 1a1",
    tertibType: "tertib-usaha",
    namaObjek: "Pengawasan Izin Berusaha & Legalitas SBU BUJK Kualifikasi Kecil",
    badanUsaha: "PT. Pakuan Graha Konstruksi",
    lokasi: "Kecamatan Cibinong",
    tanggal: "2026-03-28",
    tanggalAudit: "2026-03-28",
    pengawas: "Ir. Hendra Setiawan, S.T. (Tim Pembina Jakon)",
    statusKepatuhan: "Patuh",
    skorTertib: 95,
    kategoriHasil: "Tertib",
    statusVerifikasi: "Terverifikasi",
    dokumen: "Dokumen_SIMAK1_PakuanGraha.pdf",
    dokumenBAP: "Dokumen_SIMAK1_PakuanGraha.pdf",
    kualifikasi: "Kecil",
    namaProdusen: "PT. Pakuan Graha Konstruksi",
    namaPemilik: "H. Ridwan Mansyur, S.T.",
    noKontak: "0812-8877-6655",
    kepemilikanIzin: "Memiliki",
    keabsahanIzin: "Sah",
    kapasitas: "Kemampuan Nyata Rp 2,5 Milyar",
    izinBb: "Ada",
    keabsahanBb: "Sah",
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    catatanTemuan: "NIB dan SBU subklasifikasi BG004 aktif dan terverifikasi di OSS-RBA.",
    rekomendasi: "Pertahankan pemenuhan SKK konstruksi pada setiap proyek."
  },
  {
    id: "PEL-TM-2026-001",
    simakCode: "SIMAK 3",
    tertibType: "tertib-pemanfaatan",
    namaObjek: "Gedung Rawat Inap Terpadu RSUD Leuwiliang",
    badanUsaha: "Pemerintah Kabupaten Bogor / BPKAD",
    lokasi: "Jl. Raya Cibeber No. 1, Kecamatan Leuwiliang",
    tanggal: "2026-03-28",
    tanggalAudit: "2026-03-28",
    pengawas: "Ir. Hendra Setiawan, S.T. (Tim Pembina Jakon)",
    statusKepatuhan: "Patuh",
    skorTertib: 94,
    kategoriHasil: "Tertib",
    statusVerifikasi: "Terverifikasi",
    dokumen: "BAP_SIMAK3_RSUD_Leuwiliang.pdf",
    dokumenBAP: "BAP_SIMAK3_RSUD_Leuwiliang.pdf",
    kualifikasi: "Besar",
    namaBangunan: "Gedung Rawat Inap Terpadu 5 Lantai RSUD Leuwiliang",
    namaPemilik: "Pemerintah Kabupaten Bogor / BPKAD",
    namaPengelola: "Dinas Kesehatan Kab. Bogor / Manajemen RSUD",
    waktuPengawasan: "2026-03-28",
    fungsiBangunan: "Fasilitas Pelayanan Kesehatan",
    statusSlf: "Memiliki SLF (Aktif s.d 2029)",
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    catatanTemuan: "Pemanfaatan ruang sesuai fungsi peruntukan RS tipe B. Pemeliharaan instalasi ME, lift medis, genset darurat, dan sistem proteksi kebakaran berkala tercatat dalam log book.",
    rekomendasi: "Pertahankan standar operasional dan lakukan pengujian berkala pada sistem hidran serta sprinkler setiap triwulan."
  },
  {
    id: "PEL-TM-2026-002",
    simakCode: "SIMAK 3",
    tertibType: "tertib-pemanfaatan",
    namaObjek: "Stadion Utama Pakansari Cibinong",
    badanUsaha: "Pemerintah Kabupaten Bogor / BPKAD",
    lokasi: "Jl. Kolonel Edy Yoso Martadipura, Kel. Pakansari, Kec. Cibinong",
    tanggal: "2026-03-24",
    tanggalAudit: "2026-03-24",
    pengawas: "Dr. Ir. Wahyudi, M.Sc. (Tim Pembina Jakon)",
    statusKepatuhan: "Patuh",
    skorTertib: 90,
    kategoriHasil: "Tertib",
    statusVerifikasi: "Terverifikasi",
    dokumen: "BAP_SIMAK3_StadionPakansari.pdf",
    dokumenBAP: "BAP_SIMAK3_StadionPakansari.pdf",
    kualifikasi: "Besar",
    namaBangunan: "Kompleks Stadion Utama Pakansari (Kapasitas 30.000 Penonton)",
    namaPemilik: "Pemerintah Kabupaten Bogor / BPKAD",
    namaPengelola: "Dinas Pemuda dan Olahraga (Dispora) Kab. Bogor",
    waktuPengawasan: "2026-03-24",
    fungsiBangunan: "Fasilitas Olahraga & Ruang Publik",
    statusSlf: "Memiliki SLF (Aktif s.d 2028)",
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    catatanTemuan: "Struktur tribun dan atap space frame kanopi dalam kondisi prima. Jalur evakuasi darurat, sistem pencahayaan LED lapangan, dan rumput drainase terpelihara dengan baik.",
    rekomendasi: "Lakukan inspeksi rutin terhadap kekencangan baut sambungan baja atap kanopi menjelang musim angin kencang."
  },
  {
    id: "PEL-TM-2026-003",
    simakCode: "SIMAK 3",
    tertibType: "tertib-pemanfaatan",
    namaObjek: "Jembatan Beton Pratekan Ciawi - Megamendung Bentang 30M",
    badanUsaha: "Dinas PUPR Kabupaten Bogor",
    lokasi: "Jl. Raya Puncak Km. 67, Kecamatan Ciawi",
    tanggal: "2026-03-20",
    tanggalAudit: "2026-03-20",
    pengawas: "Ir. Rahmat Hidayat, M.T. (Tim Pembina Jakon)",
    statusKepatuhan: "Patuh",
    skorTertib: 88,
    kategoriHasil: "Tertib",
    statusVerifikasi: "Terverifikasi",
    dokumen: "BAP_SIMAK3_JembatanCiawi.pdf",
    dokumenBAP: "BAP_SIMAK3_JembatanCiawi.pdf",
    kualifikasi: "Menengah",
    namaBangunan: "Jembatan Gelagar Beton Pratekan Ciawi - Megamendung",
    namaPemilik: "Dinas PUPR Kabupaten Bogor",
    namaPengelola: "UPT Infrastruktur Jalan & Jembatan Wilayah II Ciawi",
    waktuPengawasan: "2026-03-20",
    fungsiBangunan: "Infrastruktur Jembatan Jalan Kabupaten",
    statusSlf: "Sertifikat Laik Fungsi Jalan (SLFJ) Lengkap",
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    catatanTemuan: "Expansion joint jembatan elastis, drainase dek jembatan bersih dari sedimentasi pasir. Rambu pembatas tonase muatan terpasang jelas di kedua ujung pendekat.",
    rekomendasi: "Lakukan pembersihan lumut dan pengecekan berkala terhadap fondasi abutment dari gerusan arus sungai (scouring)."
  },
  {
    id: "PEL-TM-2026-004",
    simakCode: "SIMAK 3",
    tertibType: "tertib-pemanfaatan",
    namaObjek: "Gedung Pasar Tradisional Parungpanjang",
    badanUsaha: "Perumda Pasar Tohaga Kabupaten Bogor",
    lokasi: "Jl. Raya Parungpanjang No. 45, Kecamatan Parungpanjang",
    tanggal: "2026-03-15",
    tanggalAudit: "2026-03-15",
    pengawas: "Bambang Kurniawan, S.T. (Tim Pembina Jakon)",
    statusKepatuhan: "Tidak Patuh",
    skorTertib: 58,
    kategoriHasil: "Kurang Tertib",
    statusVerifikasi: "Draft",
    dokumen: "BAP_SIMAK3_PasarParungpanjang.pdf",
    dokumenBAP: "BAP_SIMAK3_PasarParungpanjang.pdf",
    kualifikasi: "Menengah",
    namaBangunan: "Bangunan Pasar Rakyat Parungpanjang 2 Lantai Blok A & B",
    namaPemilik: "Perumda Pasar Tohaga Kabupaten Bogor",
    namaPengelola: "Pengelola Unit Pasar Tohaga Wilayah Parungpanjang",
    waktuPengawasan: "2026-03-15",
    fungsiBangunan: "Fasilitas Perdagangan / Pasar Tradisional",
    statusSlf: "Belum Perpanjang SLF (Kedaluwarsa)",
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    catatanTemuan: "Ditemukan alih fungsi koridor evakuasi darurat menjadi lapak dagang permanen, masa berlaku SLF telah kedaluwarsa 6 bulan, dan tabung APAR tidak dilakukan uji tekanan ulang tahunan.",
    rekomendasi: "Diterbitkan surat rekomendasi pembinaan kepada pengelola pasar untuk segera menertibkan koridor darurat, mengisi ulang APAR, dan mengajukan perpanjangan SLF ke DPMPTSP."
  },
  {
    id: "PEL-TU-002",
    simakCode: "SIMAK 1c",
    tertibType: "tertib-usaha",
    namaObjek: "Pemeriksaan Legalitas Produsen & Izin Bahan Baku Rantai Pasok Material",
    badanUsaha: "CV. Baraya Cipta Mandiri (Batching Plant)",
    lokasi: "Kecamatan Cileungsi",
    tanggal: "2026-03-24",
    tanggalAudit: "2026-03-24",
    pengawas: "Bambang Kurniawan, S.T. (Tim Pembina Jakon)",
    statusKepatuhan: "Tidak Patuh",
    skorTertib: 65,
    kategoriHasil: "Kurang Tertib",
    statusVerifikasi: "Draft",
    dokumen: "Dokumen_SIMAK1_BarayaCipta.pdf",
    dokumenBAP: "Dokumen_SIMAK1_BarayaCipta.pdf",
    kualifikasi: "Menengah",
    namaProdusen: "CV. Baraya Cipta Mandiri",
    namaPemilik: "Drs. H. Mulyadi",
    noKontak: "0813-1122-3344",
    kepemilikanIzin: "Memiliki",
    keabsahanIzin: "Sah",
    kapasitas: "60 m³/jam (Ready Mix)",
    izinBb: "Ada",
    keabsahanBb: "Tidak Sah",
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    catatanTemuan: "Izin IUP quary pasir bahan baku belum diperbarui masa berlakunya.",
    rekomendasi: "Wajib memperbarui bukti legalitas sumber bahan baku pasir dalam tempo 14 hari."
  },
  {
    id: "PEL-TP-001",
    simakCode: "SIMAK 2a",
    tertibType: "tertib-penyelenggaraan",
    namaObjek: "Preservasi Jalan Cigudeg - Sukajaya Segmen STA 0+000 - 4+500",
    badanUsaha: "PT. Baraya Cipta Mandiri",
    lokasi: "Kecamatan Cigudeg & Sukajaya",
    tanggal: "2026-08-22",
    pengawas: "Ir. Hendra Setiawan, S.T. (Tim Pengawas SIMAK)",
    statusKepatuhan: "Tidak Patuh",
    statusVerifikasi: "Draft",
    dokumen: "Dokumen_SIMAK2_Preservasi_Cigudeg.pdf",
    // Standar SIMAK 2 SIPJAKI 11 Kolom
    namaProyek: "Preservasi Jalan Cigudeg - Sukajaya Segmen STA 0+000 - 4+500",
    nilaiProyek: 16450000000,
    nomorPerjanjian: "602.1/045/SPK-KTR/DPUPR/2026",
    waktuPelaksanaan: "180 Hari Kalender (01 Mar 2026 - 27 Agu 2026)",
    penyediaJasa: "PT. Baraya Cipta Mandiri",
    namaPemilikPekerjaan: "Dinas PUPR Kab. Bogor / PPK Bidang Jalan",
    waktuPengawasan: "2026-08-22",
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    catatanTemuan: "Uji slump beton K-350 drainase samping tidak konsisten dan barikade K3 belum dipasang di tikungan curam.",
    rekomendasi: "Penyedia jasa wajib melakukan kalibrasi batching plant, pengetatan uji slump, dan pemasangan pagar pengaman K3."
  },
  {
    id: "PEL-TP-002",
    simakCode: "SIMAK 2b",
    tertibType: "tertib-penyelenggaraan",
    namaObjek: "Pembangunan Jembatan Bojonggede Tahap III Bentang 40 Meter",
    badanUsaha: "PT. Samudra Beton Persada",
    lokasi: "Kecamatan Bojonggede",
    tanggal: "2026-08-16",
    pengawas: "Dr. Ir. Wahyudi, M.Sc. (Tim Pengawas SIMAK)",
    statusKepatuhan: "Tidak Patuh",
    statusVerifikasi: "Draft",
    dokumen: "Dokumen_SIMAK2_JembatanBojonggede.pdf",
    // Standar SIMAK 2 SIPJAKI 11 Kolom
    namaProyek: "Pembangunan Jembatan Bojonggede Tahap III Bentang 40 Meter",
    nilaiProyek: 8850000000,
    nomorPerjanjian: "602.1/052/SPK-JMB/DPUPR/2026",
    waktuPelaksanaan: "150 Hari Kalender (15 Feb 2026 - 14 Jul 2026)",
    penyediaJasa: "PT. Samudra Beton Persada",
    namaPemilikPekerjaan: "Dinas PUPR Kab. Bogor / PPK Bidang Jembatan",
    waktuPengawasan: "2026-08-16",
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    catatanTemuan: "Sertifikat laik operasi (SILO) mobile crane kedaluwarsa dan 3 operator erection girder belum memiliki SIO aktif.",
    rekomendasi: "Menghentikan pengangkatan girder hingga resertifikasi SILO alat berat dan pergantian operator berlisensi resmi."
  },
  {
    id: "PEL-TP-003",
    simakCode: "SIMAK 2c",
    tertibType: "tertib-penyelenggaraan",
    namaObjek: "Pembangunan Gedung Rawat Inap RSUD Leuwiliang 4 Lantai",
    badanUsaha: "PT. Mega Karya Mandiri",
    lokasi: "Kecamatan Leuwiliang",
    tanggal: "2026-08-08",
    pengawas: "Ir. Hendra Setiawan, S.T. (Tim Pengawas SIMAK)",
    statusKepatuhan: "Patuh",
    statusVerifikasi: "Terverifikasi",
    dokumen: "Dokumen_SIMAK2_RSUDLeuwiliang.pdf",
    // Standar SIMAK 2 SIPJAKI 11 Kolom
    namaProyek: "Pembangunan Gedung Rawat Inap RSUD Leuwiliang 4 Lantai",
    nilaiProyek: 24300000000,
    nomorPerjanjian: "445/012/SPK-RSUD/DINKES/2026",
    waktuPelaksanaan: "210 Hari Kalender (01 Feb 2026 - 30 Agu 2026)",
    penyediaJasa: "PT. Mega Karya Mandiri",
    namaPemilikPekerjaan: "Dinas Kesehatan Kab. Bogor / PPK RSUD",
    waktuPengawasan: "2026-08-08",
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    catatanTemuan: "Struktur beton bertulang memenuhi spesifikasi. Pekerja mengenakan APD lengkap dan jaring pengaman vertikal terpasang.",
    rekomendasi: "Pertahankan ketertiban implementasi Rencana Keselamatan Konstruksi (RKK)."
  },
  {
    id: "PEL-TP-004",
    simakCode: "SIMAK 2d",
    tertibType: "tertib-penyelenggaraan",
    namaObjek: "Rehabilitasi Jaringan Irigasi D.I Cileungsi Hulu Paket 1",
    badanUsaha: "CV. Bogor Konstruksi Utama",
    lokasi: "Kecamatan Cileungsi",
    tanggal: "2026-07-29",
    pengawas: "Bambang Kurniawan, S.T. (Tim Pengawas SIMAK)",
    statusKepatuhan: "Patuh",
    statusVerifikasi: "Terverifikasi",
    dokumen: "Dokumen_SIMAK2_IrigasiCileungsi.pdf",
    // Standar SIMAK 2 SIPJAKI 11 Kolom
    namaProyek: "Rehabilitasi Jaringan Irigasi D.I Cileungsi Hulu Paket 1",
    nilaiProyek: 4650000000,
    nomorPerjanjian: "610/038/SPK-SDA/DPUPR/2026",
    waktuPelaksanaan: "120 Hari Kalender (01 Mar 2026 - 28 Jun 2026)",
    penyediaJasa: "CV. Bogor Konstruksi Utama",
    namaPemilikPekerjaan: "Dinas PUPR Kab. Bogor / PPK Bidang SDA",
    waktuPengawasan: "2026-07-29",
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    catatanTemuan: "Pasangan batu saluran irigasi rapi, adukan semen 1:4 sesuai spesifikasi teknis SNI.",
    rekomendasi: "Lakukan perapihan sisa material galian tanah di sempadan saluran."
  },
  {
    id: "PEL-TP-005",
    simakCode: "SIMAK 2a",
    tertibType: "tertib-penyelenggaraan",
    namaObjek: "Pembangunan Jalan Poros Tegar Beriman II (Jl. Bomang)",
    badanUsaha: "PT. Samudra Beton Persada",
    lokasi: "Kecamatan Bojonggede - Kemang",
    tanggal: "2026-07-14",
    pengawas: "Ir. Rahmat Hidayat, M.T. (Tim Pengawas SIMAK)",
    statusKepatuhan: "Patuh",
    statusVerifikasi: "Terverifikasi",
    dokumen: "Dokumen_SIMAK2_JalanBomang.pdf",
    // Standar SIMAK 2 SIPJAKI 11 Kolom
    namaProyek: "Pembangunan Jalan Poros Tegar Beriman II (Jl. Bomang Sta 0+000 - 4+200)",
    nilaiProyek: 14850000000,
    nomorPerjanjian: "602.1/045/SPK-KTR/DPUPR/2026",
    waktuPelaksanaan: "180 Hari Kalender (01 Mar 2026 - 27 Agu 2026)",
    penyediaJasa: "PT. Samudra Beton Persada",
    namaPemilikPekerjaan: "Dinas PUPR Kab. Bogor / PPK Bidang Jalan",
    waktuPengawasan: "2026-07-14",
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    catatanTemuan: "Penerapan SMKK berjalan baik, sertifikat uji tarik baja dan JMF aspal telah disetujui konsultan pengawas.",
    rekomendasi: "Pertahankan manajemen rekayasa lalu lintas dan pasang rambu peringatan di persimpangan."
  },
  {
    id: "PEL-TP-006",
    simakCode: "SIMAK 2b",
    tertibType: "tertib-penyelenggaraan",
    namaObjek: "Peningkatan Jalan Lingkungan Klapanunggal Segmen 2",
    badanUsaha: "CV. Linggar Multi Sarana",
    lokasi: "Kecamatan Klapanunggal",
    tanggal: "2026-06-20",
    pengawas: "Bambang Kurniawan, S.T. (Tim Pengawas SIMAK)",
    statusKepatuhan: "Tidak Patuh",
    statusVerifikasi: "Ditolak",
    dokumen: "Dokumen_SIMAK2_JalanKlapanunggal.pdf",
    // Standar SIMAK 2 SIPJAKI 11 Kolom
    namaProyek: "Peningkatan Jalan Lingkungan Klapanunggal Segmen 2",
    nilaiProyek: 3200000000,
    nomorPerjanjian: "602.1/068/SPK-JL/DPUPR/2026",
    waktuPelaksanaan: "90 Hari Kalender (01 Mei 2026 - 29 Jul 2026)",
    penyediaJasa: "CV. Linggar Multi Sarana",
    namaPemilikPekerjaan: "Dinas PUPR Kab. Bogor / PPK Bidang Jalan",
    waktuPengawasan: "2026-06-20",
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    catatanTemuan: "Terjadi keterlambatan progres fisik deviasi -14.2% (Kritis Kontrak) dan ketiadaan Tenaga Teknis di lokasi.",
    rekomendasi: "Penerbitan Surat Peringatan I (Show Cause Meeting I) dan penambahan armada alat berat serta tenaga kerja."
  },
  {
    id: "PEL-TU-003",
    simakCode: "SIMAK 1d",
    tertibType: "tertib-usaha",
    namaObjek: "Pemeriksaan Kepemilikan Sertifikat Kompetensi Kerja (SKK) TKK Lapangan",
    badanUsaha: "PT. Cibinong Mandiri Perkasa",
    lokasi: "Kecamatan Citeureup",
    tanggal: "2026-03-20",
    tanggalAudit: "2026-03-20",
    pengawas: "Ir. Hendra Setiawan, S.T.",
    statusKepatuhan: "Patuh",
    skorTertib: 88,
    kategoriHasil: "Tertib",
    statusVerifikasi: "Terverifikasi",
    dokumen: "Dokumen_SIMAK1_CibinongMandiri.pdf",
    dokumenBAP: "Dokumen_SIMAK1_CibinongMandiri.pdf",
    kualifikasi: "Kecil",
    namaProdusen: "PT. Cibinong Mandiri Perkasa",
    namaPemilik: "Ahmad Fauzi, S.T.",
    noKontak: "0856-7890-1234",
    kepemilikanIzin: "Memiliki",
    keabsahanIzin: "Sah",
    kapasitas: "Peralatan 4 Unit Excavator",
    izinBb: "Ada",
    keabsahanBb: "Sah",
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    catatanTemuan: "Seluruh tukang dan mandor telah memiliki SKK Jenjang 1-3."
  },
  {
    id: "PEL-TU-004",
    simakCode: "SIMAK 1a2",
    tertibType: "tertib-usaha",
    namaObjek: "Pengawasan Badan Usaha Jasa Konstruksi Kualifikasi Menengah & Asosiasi",
    badanUsaha: "PT. Bogor Raya Infrastruktur",
    lokasi: "Kecamatan Babakan Madang",
    tanggal: "2026-03-15",
    tanggalAudit: "2026-03-15",
    pengawas: "Dra. Hj. Nunung Maryati, M.Si.",
    statusKepatuhan: "Patuh",
    skorTertib: 90,
    kategoriHasil: "Tertib",
    statusVerifikasi: "Terverifikasi",
    dokumen: "Dokumen_SIMAK1_BogorRaya.pdf",
    dokumenBAP: "Dokumen_SIMAK1_BogorRaya.pdf",
    kualifikasi: "Menengah",
    namaProdusen: "PT. Bogor Raya Infrastruktur",
    namaPemilik: "Ir. Budi Santoso",
    noKontak: "0811-9988-7766",
    kepemilikanIzin: "Memiliki",
    keabsahanIzin: "Sah",
    kapasitas: "Kemampuan Keuangan Rp 15 Milyar",
    izinBb: "Ada",
    keabsahanBb: "Sah",
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    catatanTemuan: "Dokumen perizinan OSS-RBA dan SBU lengkap dan terverifikasi."
  }
];

// 7. DATA REKOMENDASI & TINDAK LANJUT
export const mockRekomendasiRecords: RekomendasiRecord[] = [
  // --- PILAR 2: TERTIB PENYELENGGARAAN (PAKET PEKERJAAN KONSTRUKSI TERKINI - DESC) ---
  {
    id: "REK-TP-001",
    nomorSurat: "600.1.2/285/DPU-JAKON/2026",
    tertibType: "tertib-penyelenggaraan",
    badanUsahaAtauObjek: "PT. Baraya Cipta Mandiri",
    paketPekerjaan: "Preservasi Jalan Cigudeg - Sukajaya Segmen STA 0+000 - 4+500",
    lokasiProyek: "Kec. Cigudeg & Sukajaya, Kab. Bogor",
    tanggalSurat: "2026-08-22",
    temuanUtama: "Uji slump beton K-350 drainase samping tidak konsisten dan barikade K3 belum dipasang di tikungan curam.",
    rekomendasiTindakan: "Penyedia jasa wajib melakukan kalibrasi batching plant, pengetatan uji slump, dan pemasangan pagar pengaman K3.",
    tenggatWaktu: "2026-09-21",
    jenisPeringatan: "Peringatan Tertulis I",
    statusTindakLanjut: "Dalam Proses",
    statusVerifikasi: "Draft",
    catatanVerifikator: "Inspeksi SIMAK 2 tanggal 22/08/2026. Masa pemenuhan komitmen 30 hari kalender."
  },
  {
    id: "REK-TP-002",
    nomorSurat: "600.1.2/264/DPU-JAKON/2026",
    tertibType: "tertib-penyelenggaraan",
    badanUsahaAtauObjek: "PT. Samudra Beton Persada",
    paketPekerjaan: "Pembangunan Jembatan Bojonggede Tahap III Bentang 40 Meter",
    lokasiProyek: "Kec. Bojonggede, Kab. Bogor",
    tanggalSurat: "2026-08-16",
    temuanUtama: "Sertifikat laik operasi (SILO) mobile crane kedaluwarsa dan 3 operator erection girder belum memiliki SIO aktif.",
    rekomendasiTindakan: "Menghentikan pengangkatan girder hingga resertifikasi SILO alat berat dan pergantian operator berlisensi resmi.",
    tenggatWaktu: "2026-09-15",
    jenisPeringatan: "Peringatan Tertulis II",
    statusTindakLanjut: "Dalam Proses",
    statusVerifikasi: "Draft",
    catatanVerifikator: "Audit keselamatan konstruksi SMKK SIMAK 2. Peringatan keras tindak lanjut prioritas tinggi."
  },
  {
    id: "REK-TP-003",
    nomorSurat: "600.1.2/241/DPU-JAKON/2026",
    tertibType: "tertib-penyelenggaraan",
    badanUsahaAtauObjek: "PT. Mega Karya Mandiri",
    paketPekerjaan: "Pembangunan Gedung Rawat Inap RSUD Leuwiliang 4 Lantai",
    lokasiProyek: "Kec. Leuwiliang, Kab. Bogor",
    tanggalSurat: "2026-08-08",
    temuanUtama: "Deviasi dimensi penulangan kolom lantai 3 sebesar +3.5 cm dari gambar kerja teknis dan dokumen RKK belum diupdate.",
    rekomendasiTindakan: "Melakukan kajian struktural oleh Tenaga Ahli Struktur dan penyesuaian Shop Drawing yang disetujui Pengawas.",
    tenggatWaktu: "2026-09-07",
    realisasiTanggal: "2026-08-25",
    jenisPeringatan: "Peringatan Tertulis I",
    statusTindakLanjut: "Selesai & Patuh",
    statusVerifikasi: "Terverifikasi",
    catatanVerifikator: "Perbaikan dokumen teknis telah disetujui konsultan pengawas dan dinas teknis (Uji Petik Lolos)."
  },
  {
    id: "REK-TP-004",
    nomorSurat: "600.1.2/218/DPU-JAKON/2026",
    tertibType: "tertib-penyelenggaraan",
    badanUsahaAtauObjek: "CV. Bogor Konstruksi Utama",
    paketPekerjaan: "Rehabilitasi Jaringan Irigasi D.I Cileungsi Hulu Paket 1",
    lokasiProyek: "Kec. Cileungsi, Kab. Bogor",
    tanggalSurat: "2026-07-29",
    temuanUtama: "Ketebalan plesteran dinding pasangan batu saluran tersier kurang dari spesifikasi 1.5 cm pada segmen 200m.",
    rekomendasiTindakan: "Membongkar dan memplester ulang pasangan batu saluran sesuai spesifikasi teknis SNI.",
    tenggatWaktu: "2026-08-28",
    realisasiTanggal: "2026-08-20",
    jenisPeringatan: "Peringatan Tertulis I",
    statusTindakLanjut: "Selesai & Patuh",
    statusVerifikasi: "Terverifikasi",
    catatanVerifikator: "Hasil uji ketebalan core drill ulang memenuhi syarat teknis spesifikasi DPU."
  },
  {
    id: "REK-TP-005",
    nomorSurat: "600.1.2/195/DPU-JAKON/2026",
    tertibType: "tertib-penyelenggaraan",
    badanUsahaAtauObjek: "PT. Samudra Beton Persada",
    paketPekerjaan: "Pembangunan Jalan Poros Tegar Beriman II (Jl. Bomang)",
    lokasiProyek: "Kec. Bojonggede - Tajurhalang",
    tanggalSurat: "2026-07-14",
    temuanUtama: "Pekerja di zona galian tidak mengenakan helm rompi reflektif secara konsisten dan rambu K3 minim.",
    rekomendasiTindakan: "Wajib melakukan safety induction harian dan inspeksi kelengkapan APD oleh Petugas K3 Konstruksi.",
    tenggatWaktu: "2026-08-13",
    realisasiTanggal: "2026-08-01",
    jenisPeringatan: "Peringatan Tertulis I",
    statusTindakLanjut: "Selesai & Patuh",
    statusVerifikasi: "Terverifikasi",
    catatanVerifikator: "Surat teguran tertulis telah ditindaklanjuti dan APD telah dipenuhi 100%."
  },
  {
    id: "REK-TP-006",
    nomorSurat: "600.1.2/162/DPU-JAKON/2026",
    tertibType: "tertib-penyelenggaraan",
    badanUsahaAtauObjek: "CV. Linggar Multi Sarana",
    paketPekerjaan: "Peningkatan Jalan Lingkungan Klapanunggal Segmen 2",
    lokasiProyek: "Kec. Klapanunggal, Kab. Bogor",
    tanggalSurat: "2026-06-20",
    temuanUtama: "Terjadi keterlambatan progres fisik deviasi -14.2% (Kritis Kontrak) dan ketiadaan Tenaga Teknis di lokasi.",
    rekomendasiTindakan: "Penerbitan Surat Peringatan I (Show Cause Meeting I) dan penambahan armada alat berat serta tenaga kerja.",
    tenggatWaktu: "2026-07-10",
    jenisPeringatan: "Penghentian Sementara Proyek",
    statusTindakLanjut: "Diberi Sanksi",
    statusVerifikasi: "Ditolak",
    catatanVerifikator: "Rekanan gagal memenuhi target SCM I melewati batas waktu, dikenakan sanksi denda keterlambatan."
  },

  // --- PILAR 1: TERTIB USAHA (DESC) ---
  {
    id: "REK-TU-001",
    nomorSurat: "600.1.2/255/DPU-JAKON/2026",
    tertibType: "tertib-usaha",
    badanUsahaAtauObjek: "CV. Baraya Cipta Mandiri",
    paketPekerjaan: "Verifikasi Kelengkapan Sertifikat Standar Usaha & SKK Konstruksi",
    lokasiProyek: "Kec. Cibinong, Kab. Bogor",
    tanggalSurat: "2026-08-19",
    temuanUtama: "4 orang tukang pasang bata dan juru ukur belum memiliki sertifikat SKK aktif.",
    rekomendasiTindakan: "Mendaftarkan TKK terkait pada Program Fasilitasi Uji Kompetensi TKK DPU Kab. Bogor.",
    tenggatWaktu: "2026-09-18",
    jenisPeringatan: "Peringatan Tertulis I",
    statusTindakLanjut: "Dalam Proses",
    statusVerifikasi: "Draft",
    catatanVerifikator: "Menunggu bukti pendaftaran uji sertifikasi BNSP/LSP."
  },
  {
    id: "REK-TU-002",
    nomorSurat: "600.1.2/201/DPU-JAKON/2026",
    tertibType: "tertib-usaha",
    badanUsahaAtauObjek: "PT. Mega Karya Mandiri",
    paketPekerjaan: "Pemeriksaan Legalitas Izin Usaha dan NIB Berbasis Risiko",
    lokasiProyek: "Kec. Cibinong, Kab. Bogor",
    tanggalSurat: "2026-07-22",
    temuanUtama: "Alamat kantor cabang pada NIB belum disesuaikan dengan domisili faktual Cibinong.",
    rekomendasiTindakan: "Melakukan pemutakhiran data alamat pada portal OSS-RBA dan konfirmasi SIPJAKI.",
    tenggatWaktu: "2026-08-21",
    realisasiTanggal: "2026-08-10",
    jenisPeringatan: "Peringatan Tertulis I",
    statusTindakLanjut: "Selesai & Patuh",
    statusVerifikasi: "Terverifikasi",
    catatanVerifikator: "NIB terupdate telah diverifikasi via OSS-RBA."
  },

  // --- PILAR 3: TERTIB PEMANFAATAN (DESC) ---
  {
    id: "REK-TM-001",
    nomorSurat: "600.1.2/270/DPU-JAKON/2026",
    tertibType: "tertib-pemanfaatan",
    badanUsahaAtauObjek: "Gedung Kantor Camat Gunung Putri",
    paketPekerjaan: "Pengawasan Kelaikan Fungsi & Pemeliharaan Gedung Pelayanan Publik",
    lokasiProyek: "Kec. Gunung Putri, Kab. Bogor",
    tanggalSurat: "2026-08-14",
    temuanUtama: "Dokumen SOP Pemeliharaan Berkala Instalasi Mekanikal/Elektrikal belum terdokumentasi.",
    rekomendasiTindakan: "Menyusun jadwal maintenance AC dan genset serta pengurusan sertifikasi laik fungsi (SLF).",
    tenggatWaktu: "2026-09-13",
    jenisPeringatan: "Peringatan Tertulis I",
    statusTindakLanjut: "Dalam Proses",
    statusVerifikasi: "Draft",
    catatanVerifikator: "Sudah dijadwalkan inspeksi teknis gabungan dengan konsultan perencana."
  },
  {
    id: "REK-TM-002",
    nomorSurat: "600.1.2/180/DPU-JAKON/2026",
    tertibType: "tertib-pemanfaatan",
    badanUsahaAtauObjek: "Jembatan Penyeberangan Orang (JPO) Cibinong Mall",
    paketPekerjaan: "Monitoring Pemeliharaan & Beban Laik Fungsi Konstruksi JPO",
    lokasiProyek: "Kec. Cibinong, Kab. Bogor",
    tanggalSurat: "2026-07-05",
    temuanUtama: "Baut pengikat sambungan rangka atap JPO terkorosi dan kanopi retak membahayakan pejalan kaki.",
    rekomendasiTindakan: "Penggantian baut baja galvanis mutu tinggi dan perbaikan lembar atap polikarbonat.",
    tenggatWaktu: "2026-08-04",
    realisasiTanggal: "2026-07-28",
    jenisPeringatan: "Peringatan Tertulis I",
    statusTindakLanjut: "Selesai & Patuh",
    statusVerifikasi: "Terverifikasi",
    catatanVerifikator: "Penggantian baut dan atap telah selesai diperiksa oleh tim pengawas tertib pemanfaatan."
  }
];

// 8. DATA PELAPORAN RESMI (STANDAR FORMAT 8 KOLOM SIPJAKI)
export const mockPelaporanRecords: PelaporanRecord[] = [
  // PILAR 1: TERTIB USAHA
  {
    id: "LAP-TU-2026-T1",
    tertibType: "tertib-usaha",
    jenisLaporan: "Tahunan",
    namaLaporan: "LAPORAN PENGAWASAN TAHUNAN TERTIB USAHA 2026 KABUPATEN BOGOR",
    tahun: "2026",
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    wilayah: "Jawa Barat / Kabupaten Bogor",
    dokumen: "Laporan_Pengawasan_Tahunan_Tertib_Usaha_2026.pdf",
    dokumenUrl: "https://sijakon.bogorkab.go.id/docs/Laporan_Pengawasan_Tahunan_Tertib_Usaha_2026.pdf",
    status: "Terverifikasi",
    jumlahObjekDiperiksa: 78,
    tingkatKepatuhan: 88.5,
    tanggalKirim: "2026-11-10 09:30 WIB",
    nomorSurat: "600.1/1420/PUPR-Jakon/2026",
    catatan: "Laporan tahunan komprehensif tertib usaha mencakup pengawasan izin usaha dan rantai pasok.",
    judulLaporan: "LAPORAN PENGAWASAN TAHUNAN TERTIB USAHA 2026 KABUPATEN BOGOR",
    periode: "Tahunan",
    statusSinkronisasiSipjaki: "Tersinkronisasi",
    filePdf: "Laporan_Pengawasan_Tahunan_Tertib_Usaha_2026.pdf",
    fileExcel: "Rekapitulasi_Tertib_Usaha_SIPJAKI_Format.xlsx"
  },
  {
    id: "LAP-TU-2026-Q1",
    tertibType: "tertib-usaha",
    jenisLaporan: "Triwulanan",
    namaLaporan: "LAPORAN PENGAWASAN TRIWULAN I TERTIB USAHA 2026 KABUPATEN BOGOR",
    tahun: "2026",
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    wilayah: "Jawa Barat / Kabupaten Bogor",
    dokumen: "Laporan_Pengawasan_TU_Q1_2026.pdf",
    dokumenUrl: "https://sijakon.bogorkab.go.id/docs/Laporan_Pengawasan_TU_Q1_2026.pdf",
    status: "Terverifikasi",
    jumlahObjekDiperiksa: 35,
    tingkatKepatuhan: 86.5,
    tanggalKirim: "2026-04-05 14:30 WIB",
    nomorSurat: "600.1/412/PUPR-Jakon/2026",
    catatan: "Laporan pengawasan triwulan I badan usaha jasa konstruksi dan produsen beton/aspal.",
    judulLaporan: "LAPORAN PENGAWASAN TRIWULAN I TERTIB USAHA 2026 KABUPATEN BOGOR",
    periode: "Triwulan I",
    statusSinkronisasiSipjaki: "Tersinkronisasi",
    filePdf: "Laporan_Pengawasan_TU_Q1_2026.pdf",
    fileExcel: "Rekapitulasi_Tertib_Usaha_SIPJAKI_Format.xlsx"
  },
  {
    id: "LAP-TU-2026-S1",
    tertibType: "tertib-usaha",
    jenisLaporan: "Semesteran",
    namaLaporan: "LAPORAN PENGAWASAN SEMESTER I TERTIB USAHA 2026 KABUPATEN BOGOR",
    tahun: "2026",
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    wilayah: "Jawa Barat / Kabupaten Bogor",
    dokumen: "Laporan_Pengawasan_TU_Sem1_2026.pdf",
    dokumenUrl: "https://sijakon.bogorkab.go.id/docs/Laporan_Pengawasan_TU_Sem1_2026.pdf",
    status: "Menunggu Verifikasi",
    jumlahObjekDiperiksa: 52,
    tingkatKepatuhan: 90.2,
    tanggalKirim: "2026-07-15 11:00 WIB",
    nomorSurat: "600.1/850/PUPR-Jakon/2026",
    catatan: "Berkas semester I sedang dalam proses telaah verifikasi teknis oleh Balai Jakon Wilayah III.",
    judulLaporan: "LAPORAN PENGAWASAN SEMESTER I TERTIB USAHA 2026 KABUPATEN BOGOR",
    periode: "Semester I",
    statusSinkronisasiSipjaki: "Menunggu Verifikasi Pusat",
    filePdf: "Laporan_Pengawasan_TU_Sem1_2026.pdf",
    fileExcel: "Rekapitulasi_Tertib_Usaha_SIPJAKI_Format.xlsx"
  },

  // PILAR 2: TERTIB PENYELENGGARAAN
  {
    id: "LAP-TP-2026-T1",
    tertibType: "tertib-penyelenggaraan",
    jenisLaporan: "Tahunan",
    namaLaporan: "LAPORAN PENGAWASAN TAHUNAN TERTIB PENYELENGGARAAN 2026 KABUPATEN BOGOR",
    tahun: "2026",
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    wilayah: "Jawa Barat / Kabupaten Bogor",
    dokumen: "Laporan_Pengawasan_Tahunan_Tertib_Penyelenggaraan_2026.pdf",
    dokumenUrl: "https://sijakon.bogorkab.go.id/docs/Laporan_Pengawasan_Tahunan_Tertib_Penyelenggaraan_2026.pdf",
    status: "Terverifikasi",
    jumlahObjekDiperiksa: 42,
    tingkatKepatuhan: 84.3,
    tanggalKirim: "2026-11-12 10:15 WIB",
    nomorSurat: "600.1/1425/PUPR-Jakon/2026",
    catatan: "Laporan pengawasan penyelenggaraan seluruh paket pekerjaan konstruksi fisik APBD TA 2026.",
    judulLaporan: "LAPORAN PENGAWASAN TAHUNAN TERTIB PENYELENGGARAAN 2026 KABUPATEN BOGOR",
    periode: "Tahunan",
    statusSinkronisasiSipjaki: "Tersinkronisasi",
    filePdf: "Laporan_Pengawasan_Tahunan_Tertib_Penyelenggaraan_2026.pdf",
    fileExcel: "Data_Paket_Penyelenggaraan_Kemendagri.xlsx"
  },
  {
    id: "LAP-TP-2026-Q1",
    tertibType: "tertib-penyelenggaraan",
    jenisLaporan: "Triwulanan",
    namaLaporan: "LAPORAN PENGAWASAN TRIWULAN I TERTIB PENYELENGGARAAN 2026 KABUPATEN BOGOR",
    tahun: "2026",
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    wilayah: "Jawa Barat / Kabupaten Bogor",
    dokumen: "Laporan_Pengawasan_TP_Q1_2026.pdf",
    dokumenUrl: "https://sijakon.bogorkab.go.id/docs/Laporan_Pengawasan_TP_Q1_2026.pdf",
    status: "Terverifikasi",
    jumlahObjekDiperiksa: 32,
    tingkatKepatuhan: 81.2,
    tanggalKirim: "2026-04-08 16:00 WIB",
    nomorSurat: "600.1/430/PUPR-Jakon/2026",
    catatan: "Laporan pengawasan mutu, kontrak kerja, dan penerapan SMKK proyek jalan dan jembatan.",
    judulLaporan: "LAPORAN PENGAWASAN TRIWULAN I TERTIB PENYELENGGARAAN 2026 KABUPATEN BOGOR",
    periode: "Triwulan I",
    statusSinkronisasiSipjaki: "Tersinkronisasi",
    filePdf: "Laporan_Pengawasan_TP_Q1_2026.pdf",
    fileExcel: "Data_Paket_Penyelenggaraan_Kemendagri.xlsx"
  },
  {
    id: "LAP-TP-2026-S1",
    tertibType: "tertib-penyelenggaraan",
    jenisLaporan: "Semesteran",
    namaLaporan: "LAPORAN PENGAWASAN SEMESTER I TERTIB PENYELENGGARAAN 2026 KABUPATEN BOGOR",
    tahun: "2026",
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    wilayah: "Jawa Barat / Kabupaten Bogor",
    dokumen: "Laporan_Pengawasan_TP_Sem1_2026.pdf",
    dokumenUrl: "https://sijakon.bogorkab.go.id/docs/Laporan_Pengawasan_TP_Sem1_2026.pdf",
    status: "Menunggu Verifikasi",
    jumlahObjekDiperiksa: 38,
    tingkatKepatuhan: 85.0,
    tanggalKirim: "2026-07-20 13:45 WIB",
    nomorSurat: "600.1/875/PUPR-Jakon/2026",
    catatan: "Menunggu validasi surat pengantar oleh Ditjen Bina Konstruksi Kementerian PUPR.",
    judulLaporan: "LAPORAN PENGAWASAN SEMESTER I TERTIB PENYELENGGARAAN 2026 KABUPATEN BOGOR",
    periode: "Semester I",
    statusSinkronisasiSipjaki: "Menunggu Verifikasi Pusat",
    filePdf: "Laporan_Pengawasan_TP_Sem1_2026.pdf",
    fileExcel: "Data_Paket_Penyelenggaraan_Kemendagri.xlsx"
  },

  // PILAR 3: TERTIB PEMANFAATAN
  {
    id: "LAP-TM-2026-T1",
    tertibType: "tertib-pemanfaatan",
    jenisLaporan: "Tahunan",
    namaLaporan: "LAPORAN PENGAWASAN TAHUNAN TERTIB PEMANFAATAN 2026 KABUPATEN BOGOR",
    tahun: "2026",
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    wilayah: "Jawa Barat / Kabupaten Bogor",
    dokumen: "Laporan_Pengawasan_Tahunan_Tertib_Pemanfaatan_2026.pdf",
    dokumenUrl: "https://sijakon.bogorkab.go.id/docs/Laporan_Pengawasan_Tahunan_Tertib_Pemanfaatan_2026.pdf",
    status: "Terverifikasi",
    jumlahObjekDiperiksa: 28,
    tingkatKepatuhan: 82.0,
    tanggalKirim: "2026-11-14 14:00 WIB",
    nomorSurat: "600.1/1430/PUPR-Jakon/2026",
    catatan: "Laporan pemanfaatan gedung RSUD, kantor camat, stadion, dan jembatan purna konstruksi.",
    judulLaporan: "LAPORAN PENGAWASAN TAHUNAN TERTIB PEMANFAATAN 2026 KABUPATEN BOGOR",
    periode: "Tahunan",
    statusSinkronisasiSipjaki: "Tersinkronisasi",
    filePdf: "Laporan_Pengawasan_Tahunan_Tertib_Pemanfaatan_2026.pdf",
    fileExcel: "Rekap_Gedung_SLF_SIPJAKI.xlsx"
  },
  {
    id: "LAP-TM-2026-Q1",
    tertibType: "tertib-pemanfaatan",
    jenisLaporan: "Triwulanan",
    namaLaporan: "LAPORAN PENGAWASAN TRIWULAN I TERTIB PEMANFAATAN 2026 KABUPATEN BOGOR",
    tahun: "2026",
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    wilayah: "Jawa Barat / Kabupaten Bogor",
    dokumen: "Laporan_Pengawasan_TM_Q1_2026.pdf",
    dokumenUrl: "https://sijakon.bogorkab.go.id/docs/Laporan_Pengawasan_TM_Q1_2026.pdf",
    status: "Menunggu Verifikasi",
    jumlahObjekDiperiksa: 16,
    tingkatKepatuhan: 75.0,
    tanggalKirim: "2026-04-10 15:20 WIB",
    nomorSurat: "600.1/445/PUPR-Jakon/2026",
    catatan: "Laporan inspeksi kelaikan fungsi bangunan dan kepemilikan Sertifikat Laik Fungsi (SLF).",
    judulLaporan: "LAPORAN PENGAWASAN TRIWULAN I TERTIB PEMANFAATAN 2026 KABUPATEN BOGOR",
    periode: "Triwulan I",
    statusSinkronisasiSipjaki: "Menunggu Verifikasi Pusat",
    filePdf: "Laporan_Pengawasan_TM_Q1_2026.pdf",
    fileExcel: "Rekap_Gedung_SLF_SIPJAKI.xlsx"
  }
];

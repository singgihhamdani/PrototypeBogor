export interface SDMRecord {
  id: string;
  tertibType: 'tertib-usaha' | 'tertib-penyelenggaraan' | 'tertib-pemanfaatan';
  wilayah: string;
  jumlahSdm: number;
  tahun: string;
  dokumen: string;
  status: 'Menunggu Verifikasi' | 'Terverifikasi' | 'Ditolak';
  keterangan?: string;
  namaTim?: string;
  ketuaTim?: string;
}

export interface TimelineRecord {
  id: string;
  tertibType: 'tertib-usaha' | 'tertib-penyelenggaraan' | 'tertib-pemanfaatan';
  kegiatan: string;
  periode: string;
  bulanMulai: string;
  bulanSelesai: string;
  targetBujk: number;
  status: 'Selesai' | 'Berjalan' | 'Terjadwal';
  dokumenJadwal: string;
}

export interface AnggaranRecord {
  id: string;
  tertibType: 'tertib-usaha' | 'tertib-penyelenggaraan' | 'tertib-pemanfaatan';
  program: string;
  tahun: string;
  paguAnggaran: number;
  realisasi: number;
  sumberDana: 'APBD Kab. Bogor' | 'DAK Fisik' | 'Bantuan Keuangan Provinsi';
  dokumenRka: string;
  status: 'Disetujui' | 'Revisi' | 'Usulan';
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
  realisasiSaatIni: number;
  tahun: string;
  kategori: string;
}

export interface PelaksanaanRecord {
  id: string;
  simakCode: string;
  tertibType: 'tertib-usaha' | 'tertib-penyelenggaraan' | 'tertib-pemanfaatan';
  namaObjek: string;
  badanUsaha: string;
  lokasi: string;
  tanggalAudit: string;
  pengawas: string;
  skorTertib: number;
  kategoriHasil: 'Tertib' | 'Cukup Tertib' | 'Kurang Tertib';
  statusVerifikasi: 'Draft' | 'Terverifikasi' | 'Ditolak';
  dokumenBAP: string;
}

export interface RekomendasiRecord {
  id: string;
  nomorSurat: string;
  tertibType: 'tertib-usaha' | 'tertib-penyelenggaraan' | 'tertib-pemanfaatan';
  badanUsahaAtauObjek: string;
  temuanUtama: string;
  rekomendasiTindakan: string;
  tenggatWaktu: string;
  statusTindakLanjut: 'Belum Selesai' | 'Dalam Proses' | 'Selesai & Patuh' | 'Diberi Sanksi';
  statusVerifikasi: 'Draft' | 'Terverifikasi' | 'Ditolak';
  catatanVerifikator?: string;
}

export interface PelaporanRecord {
  id: string;
  tertibType: 'tertib-usaha' | 'tertib-penyelenggaraan' | 'tertib-pemanfaatan';
  judulLaporan: string;
  periode: string;
  tahun: string;
  jumlahObjekDiperiksa: number;
  tingkatKepatuhan: number;
  statusSinkronisasiSipjaki: 'Tersinkronisasi' | 'Menunggu Verifikasi Pusat' | 'Draft Lokal';
  tanggalKirim: string;
  filePdf: string;
  fileExcel: string;
}

// 1. DATA SDM PERENCANAAN
export const mockSDMRecords: SDMRecord[] = [
  {
    id: "SDM-TU-01",
    tertibType: "tertib-usaha",
    wilayah: "Wilayah I (Cibinong, Citeureup, Sukaraja, Babakan Madang)",
    jumlahSdm: 6,
    tahun: "2026",
    dokumen: "SK_Bupati_Tim_Pengawas_Usaha_Wil_I_2026.pdf",
    status: "Terverifikasi",
    namaTim: "Tim Pengawas Teknis Usaha Wilayah I",
    ketuaTim: "Ir. Hendra Setiawan, S.T., M.Si. (Asesor Utama)"
  },
  {
    id: "SDM-TU-02",
    tertibType: "tertib-usaha",
    wilayah: "Wilayah II (Cileungsi, Gunung Putri, Jonggol, Cariu)",
    jumlahSdm: 5,
    tahun: "2026",
    dokumen: "SK_Kadis_PUPR_Pengawas_Wil_II.pdf",
    status: "Terverifikasi",
    namaTim: "Tim Pengawas Teknis Usaha Wilayah II",
    ketuaTim: "Bambang Kurniawan, S.T. (Asesor Madya)"
  },
  {
    id: "SDM-TU-03",
    tertibType: "tertib-usaha",
    wilayah: "Wilayah III (Ciawi, Megamendung, Cisarua, Caringin, Cijeruk)",
    jumlahSdm: 5,
    tahun: "2026",
    dokumen: "SK_Tim_Pengawas_Wil_III_Revisi.pdf",
    status: "Menunggu Verifikasi",
    namaTim: "Tim Pengawas Kawasan Puncak & Selatan",
    ketuaTim: "Dedi Supriyadi, S.T."
  },
  {
    id: "SDM-TP-01",
    tertibType: "tertib-penyelenggaraan",
    wilayah: "Wilayah Proyek Strategis APBD & DAK Kab. Bogor",
    jumlahSdm: 8,
    tahun: "2026",
    dokumen: "SK_Satgas_Pengawasan_Proyek_2026.pdf",
    status: "Terverifikasi",
    namaTim: "Satgas Pengawas Penyelenggaraan Konstruksi",
    ketuaTim: "Ir. Rahmat Hidayat, M.T. (Ahli Madya SMKK)"
  },
  {
    id: "SDM-TP-02",
    tertibType: "tertib-penyelenggaraan",
    wilayah: "Wilayah Proyek Jalan, Jembatan & Irigasi",
    jumlahSdm: 6,
    tahun: "2026",
    dokumen: "SK_Pengawas_Infrastruktur_BinaMarga.pdf",
    status: "Terverifikasi",
    namaTim: "Tim Pengawas Mutu & Progres Lapangan",
    ketuaTim: "Agus Pratama, S.T."
  },
  {
    id: "SDM-TM-01",
    tertibType: "tertib-pemanfaatan",
    wilayah: "Seluruh Wilayah Kab. Bogor (Gedung Publik & Prasarana)",
    jumlahSdm: 5,
    tahun: "2026",
    dokumen: "SK_Bupati_Tim_Pemanfaatan_Gedung.pdf",
    status: "Terverifikasi",
    namaTim: "Tim Audit Laik Fungsi & O&P Produk Konstruksi",
    ketuaTim: "Dr. Ir. Wahyudi, M.Sc. (Ahli Bangunan Gedung)"
  }
];

// 2. DATA TIMELINE PERENCANAAN
export const mockTimelineRecords: TimelineRecord[] = [
  {
    id: "TIME-TU-01",
    tertibType: "tertib-usaha",
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
    kegiatan: "Audit Pemeliharaan Rutin Gedung RSUD & Kantor Kecamatan",
    periode: "Semester I 2026",
    bulanMulai: "Maret 2026",
    bulanSelesai: "Juni 2026",
    targetBujk: 18,
    status: "Berjalan",
    dokumenJadwal: "Timeline_Pemanfaatan_Sem1.pdf"
  }
];

// 3. DATA ANGGARAN PERENCANAAN
export const mockAnggaranRecords: AnggaranRecord[] = [
  {
    id: "ANG-TU-01",
    tertibType: "tertib-usaha",
    program: "Honorarium Tim Asesor & Transport Lapangan Pengawasan Tertib Usaha",
    tahun: "2026",
    paguAnggaran: 185000000,
    realisasi: 92500000,
    sumberDana: "APBD Kab. Bogor",
    dokumenRka: "RKA_PUPR_Pengawasan_Usaha_2026.pdf",
    status: "Disetujui"
  },
  {
    id: "ANG-TU-02",
    tertibType: "tertib-usaha",
    program: "Bimbingan Teknis & Sosialisasi Perizinan Berusaha OSS-RBA Jakon",
    tahun: "2026",
    paguAnggaran: 120000000,
    realisasi: 118000000,
    sumberDana: "APBD Kab. Bogor",
    dokumenRka: "RKA_Bimtek_Perizinan_2026.pdf",
    status: "Disetujui"
  },
  {
    id: "ANG-TP-01",
    tertibType: "tertib-penyelenggaraan",
    program: "Uji Petik Uji Mutu Bahan Konstruksi & Keselamatan Lapangan (SMKK)",
    tahun: "2026",
    paguAnggaran: 260000000,
    realisasi: 145000000,
    sumberDana: "APBD Kab. Bogor",
    dokumenRka: "RKA_Pengawasan_Mutu_SMKK_2026.pdf",
    status: "Disetujui"
  },
  {
    id: "ANG-TM-01",
    tertibType: "tertib-pemanfaatan",
    program: "Audit Laik Fungsi Bangunan Gedung Publik & SOP Pemeliharaan",
    tahun: "2026",
    paguAnggaran: 140000000,
    realisasi: 65000000,
    sumberDana: "APBD Kab. Bogor",
    dokumenRka: "RKA_Audit_Pemanfaatan_2026.pdf",
    status: "Disetujui"
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

// 5. DATA TARGET PENGAWASAN
export const mockTargetRecords: TargetRecord[] = [
  {
    id: "TGT-TU-01",
    tertibType: "tertib-usaha",
    indikator: "Jumlah BUJK Kualifikasi Kecil Diperiksa Legalitas & NIB",
    targetKuantitatif: 120,
    satuan: "Badan Usaha",
    realisasiSaatIni: 78,
    tahun: "2026",
    kategori: "Legalitas Usaha"
  },
  {
    id: "TGT-TU-02",
    tertibType: "tertib-usaha",
    indikator: "Jumlah BUJK Kualifikasi Menengah & Besar Diperiksa Kesesuaian SBU",
    targetKuantitatif: 60,
    satuan: "Badan Usaha",
    realisasiSaatIni: 42,
    tahun: "2026",
    kategori: "SBU & Kompetensi"
  },
  {
    id: "TGT-TU-03",
    tertibType: "tertib-usaha",
    indikator: "Pemeriksaan Sertifikat Kompetensi Kerja (SKK) Tenaga Kerja Konstruksi",
    targetKuantitatif: 350,
    satuan: "Tenaga Kerja (TKK)",
    realisasiSaatIni: 285,
    tahun: "2026",
    kategori: "SDM & TKK"
  },
  {
    id: "TGT-TP-01",
    tertibType: "tertib-penyelenggaraan",
    indikator: "Pemeriksaan Paket Proyek Fisik APBD yang Menerapkan SMKK Penuh",
    targetKuantitatif: 45,
    satuan: "Paket Pekerjaan",
    realisasiSaatIni: 32,
    tahun: "2026",
    kategori: "SMKK & Keselamatan"
  },
  {
    id: "TGT-TM-01",
    tertibType: "tertib-pemanfaatan",
    indikator: "Pemeriksaan Bangunan Gedung Publik Terhadap Pemenuhan SLF",
    targetKuantitatif: 25,
    satuan: "Bangunan Publik",
    realisasiSaatIni: 16,
    tahun: "2026",
    kategori: "Laik Fungsi & O&P"
  }
];

// 6. DATA PELAKSANAAN PENGAWASAN (SIMAK)
export const mockPelaksanaanRecords: PelaksanaanRecord[] = [
  {
    id: "PEL-TU-001",
    simakCode: "SIMAK 1a1",
    tertibType: "tertib-usaha",
    namaObjek: "Audit Kelayakan NIB & SBU Konstruksi",
    badanUsaha: "PT. Pakuan Graha Konstruksi",
    lokasi: "Kecamatan Cibinong",
    tanggalAudit: "2026-03-12",
    pengawas: "Ir. Hendra Setiawan, S.T.",
    skorTertib: 92,
    kategoriHasil: "Tertib",
    statusVerifikasi: "Terverifikasi",
    dokumenBAP: "BAP_SIMAK_1a1_PakuanGraha.pdf"
  },
  {
    id: "PEL-TU-002",
    simakCode: "SIMAK 1d",
    tertibType: "tertib-usaha",
    namaObjek: "Pemeriksaan Kepemilikan SKK TKK Lapangan",
    badanUsaha: "CV. Baraya Cipta Mandiri",
    lokasi: "Kecamatan Cileungsi",
    tanggalAudit: "2026-03-18",
    pengawas: "Bambang Kurniawan, S.T.",
    skorTertib: 68,
    kategoriHasil: "Kurang Tertib",
    statusVerifikasi: "Draft",
    dokumenBAP: "BAP_SIMAK_1d_BarayaCipta.pdf"
  },
  {
    id: "PEL-TP-001",
    simakCode: "SIMAK 2c",
    tertibType: "tertib-penyelenggaraan",
    namaObjek: "Audit SMKK Lapangan & RKK Proyek Jembatan",
    badanUsaha: "PT. Jaya Makmur Infrastruktur",
    lokasi: "Kecamatan Ciawi",
    tanggalAudit: "2026-03-22",
    pengawas: "Ir. Rahmat Hidayat, M.T.",
    skorTertib: 86,
    kategoriHasil: "Tertib",
    statusVerifikasi: "Terverifikasi",
    dokumenBAP: "BAP_SIMAK_2c_JembatanCiawi.pdf"
  },
  {
    id: "PEL-TM-001",
    simakCode: "SIMAK 3",
    tertibType: "tertib-pemanfaatan",
    namaObjek: "Evaluasi BAST & SOP Pemeliharaan Gedung Puskesmas",
    badanUsaha: "Dinas Kesehatan / RSUD",
    lokasi: "Kecamatan Sukaraja",
    tanggalAudit: "2026-03-25",
    pengawas: "Dr. Ir. Wahyudi, M.Sc.",
    skorTertib: 82,
    kategoriHasil: "Tertib",
    statusVerifikasi: "Terverifikasi",
    dokumenBAP: "BAP_SIMAK_3_PuskesmasSukaraja.pdf"
  }
];

// 7. DATA REKOMENDASI & TINDAK LANJUT
export const mockRekomendasiRecords: RekomendasiRecord[] = [
  {
    id: "REK-TU-001",
    nomorSurat: "600.1.2/142/DPU-JAKON/2026",
    tertibType: "tertib-usaha",
    badanUsahaAtauObjek: "CV. Baraya Cipta Mandiri",
    temuanUtama: "4 orang tukang pasang bata dan juru ukur belum memiliki sertifikat SKK aktif.",
    rekomendasiTindakan: "Mendaftarkan TKK terkait pada Program Fasilitasi Uji Kompetensi TKK DPU Kab. Bogor.",
    tenggatWaktu: "2026-04-30",
    statusTindakLanjut: "Dalam Proses",
    statusVerifikasi: "Draft",
    catatanVerifikator: "Menunggu bukti pendaftaran uji sertifikasi BNSP/LSP."
  },
  {
    id: "REK-TU-002",
    nomorSurat: "600.1.2/098/DPU-JAKON/2026",
    tertibType: "tertib-usaha",
    badanUsahaAtauObjek: "PT. Mega Karya Mandiri",
    temuanUtama: "Alamat kantor cabang pada NIB belum disesuaikan dengan domisili faktual Cibinong.",
    rekomendasiTindakan: "Melakukan pemutakhiran data alamat pada portal OSS-RBA dan konfirmasi SIPJAKI.",
    tenggatWaktu: "2026-04-15",
    statusTindakLanjut: "Selesai & Patuh",
    statusVerifikasi: "Terverifikasi",
    catatanVerifikator: "NIB terupdate telah diverifikasi via OSS-RBA."
  },
  {
    id: "REK-TP-001",
    nomorSurat: "600.1.2/189/DPU-JAKON/2026",
    tertibType: "tertib-penyelenggaraan",
    badanUsahaAtauObjek: "PT. Samudra Beton Persada (Paket Jl. Bomang)",
    temuanUtama: "Pekerja di zona galian tidak mengenakan helm rompi reflektif secara konsisten.",
    rekomendasiTindakan: "Wajib melakukan safety induction harian dan inspeksi kelengkapan APD oleh Petugas K3 Konstruksi.",
    tenggatWaktu: "2026-04-10",
    statusTindakLanjut: "Selesai & Patuh",
    statusVerifikasi: "Terverifikasi",
    catatanVerifikator: "Surat tegangan tertulis telah ditindaklanjuti dan APD telah dipenuhi."
  },
  {
    id: "REK-TM-001",
    nomorSurat: "600.1.2/210/DPU-JAKON/2026",
    tertibType: "tertib-pemanfaatan",
    badanUsahaAtauObjek: "Gedung Kantor Camat Gunung Putri",
    temuanUtama: "Dokumen SOP Pemeliharaan Berkala Instalasi Mekanikal/Elektrikal belum terdokumentasi.",
    rekomendasiTindakan: "Menyusun jadwal maintenance AC dan genset serta pengurusan sertifikasi laik fungsi.",
    tenggatWaktu: "2026-05-15",
    statusTindakLanjut: "Dalam Proses",
    statusVerifikasi: "Draft",
    catatanVerifikator: "Sudah dijadwalkan inspeksi teknis gabungan dengan konsultan perencana."
  }
];

// 8. DATA PELAPORAN RESMI
export const mockPelaporanRecords: PelaporanRecord[] = [
  {
    id: "LAP-TU-2026-Q1",
    tertibType: "tertib-usaha",
    judulLaporan: "Laporan Pengawasan Tertib Usaha Jasa Konstruksi Triwulan I TA 2026",
    periode: "Triwulan I (Jan - Mar 2026)",
    tahun: "2026",
    jumlahObjekDiperiksa: 78,
    tingkatKepatuhan: 86.5,
    statusSinkronisasiSipjaki: "Tersinkronisasi",
    tanggalKirim: "2026-04-05",
    filePdf: "Laporan_Resmi_Tertib_Usaha_Q1_2026.pdf",
    fileExcel: "Rekapitulasi_Tertib_Usaha_SIPJAKI_Format.xlsx"
  },
  {
    id: "LAP-TP-2026-Q1",
    tertibType: "tertib-penyelenggaraan",
    judulLaporan: "Laporan Pengawasan Tertib Penyelenggaraan Proyek Fisik TA 2026",
    periode: "Triwulan I (Jan - Mar 2026)",
    tahun: "2026",
    jumlahObjekDiperiksa: 32,
    tingkatKepatuhan: 81.2,
    statusSinkronisasiSipjaki: "Tersinkronisasi",
    tanggalKirim: "2026-04-08",
    filePdf: "Laporan_Tertib_Penyelenggaraan_Q1_2026.pdf",
    fileExcel: "Data_Paket_Penyelenggaraan_Kemendagri.xlsx"
  },
  {
    id: "LAP-TM-2026-Q1",
    tertibType: "tertib-pemanfaatan",
    judulLaporan: "Laporan Pengawasan Tertib Pemanfaatan Produk Konstruksi & Laik Fungsi",
    periode: "Semester I 2026 (Progres Awal)",
    tahun: "2026",
    jumlahObjekDiperiksa: 16,
    tingkatKepatuhan: 75.0,
    statusSinkronisasiSipjaki: "Menunggu Verifikasi Pusat",
    tanggalKirim: "2026-04-10",
    filePdf: "Laporan_Tertib_Pemanfaatan_2026.pdf",
    fileExcel: "Rekap_Gedung_SLF_SIPJAKI.xlsx"
  }
];

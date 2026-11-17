const { createClient } = require("../prototype/node_modules/@supabase/supabase-js");
const fs = require("fs");

const env = fs.readFileSync("prototype/.env.local", "utf-8");
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=([^\r\n]+)/);

if (!urlMatch || !keyMatch) {
  console.error("Missing Supabase credentials in prototype/.env.local");
  process.exit(1);
}

const supabase = createClient(urlMatch[1], keyMatch[1]);

const simak2Records = [
  {
    id: "PEL-TP-2A-01",
    simak_code: "2.a",
    tipe_tertib: "tertib-penyelenggaraan",
    nama_objek: "Peningkatan Jalan Poros Bojonggede - Kemang (Jl. Bomang Sta 0+000 - 4+200)",
    nama_proyek: "Peningkatan Jalan Poros Bojonggede - Kemang (Jl. Bomang Sta 0+000 - 4+200)",
    nilai_proyek: 45000000000,
    nomor_perjanjian: "602.1/045/SPK/PPK-BM/DPUPR/2026",
    waktu_pelaksanaan: "180 Hari Kalender (Maret - Agustus 2026)",
    penyedia_jasa: "PT. Pakuan Graha Konstruksi",
    badan_usaha: "PT. Pakuan Graha Konstruksi",
    nama_pemilik_pekerjaan: "Dinas Pekerjaan Umum dan Penataan Ruang (DPUPR) Kab. Bogor",
    waktu_pengawasan: "2026-03-24",
    tanggal_audit: "2026-03-24",
    propinsi: "Jawa Barat",
    kab_kota: "Kabupaten Bogor",
    lokasi: "Kecamatan Bojonggede & Kemang",
    pengawas: "Ir. Hendra Setiawan, S.T. (Petugas Pengawas Jakon)",
    status_kepatuhan: "Patuh",
    status_verifikasi: "Terverifikasi",
    dokumen: "Dokumen_SIMAK_2a_JlBomang.pdf",
    dokumen_bap: "Dokumen_SIMAK_2a_JlBomang.pdf",
    catatan_temuan: "Penerapan SMKK di lapangan berjalan sangat baik, jalur kerja dilengkapi rambu peringatan dan seluruh APD pekerja terdistribusi lengkap.",
    rekomendasi: "Pertahankan protokol K3 SMKK saat pekerjaan pengaspalan malam hari serta koordinasikan traffic management dengan Dishub.",
    sub_items: [
      {
        no: 1,
        item: "Proses Pemilihan Penyedia Jasa",
        uraian: "Tender Seleksi Terbuka melalui LPSE Kab. Bogor, KPA/PPK menandatangani surat penetapan pemenang",
        standar: "Perpres No. 12/2021 & Permen PUPR No. 1/2023",
        hasil: "Sesuai"
      },
      {
        no: 2,
        item: "Penyusunan & Pelaksanaan Kontrak Kerja Konstruksi",
        uraian: "SPK & SSUK mencantumkan klausul SKK TKK, subpenyedia spesialis lokal, TKDN minimal 45%, dan BPJS Ketenagakerjaan",
        standar: "Pasal 47 UU No. 2/2017 & PP No. 14/2021",
        hasil: "Sesuai"
      },
      {
        no: 3,
        item: "Penerapan Standar K4 & Penerapan SMKK",
        uraian: "Dokumen RKK dan RMPK disetujui, Ahli K3 Konstruksi bersertifikat aktif di lokasi proyek, nihil fatalitas kerja",
        standar: "Permen PUPR No. 10/2021 (SMKK)",
        hasil: "Sesuai"
      },
      {
        no: 4,
        item: "Penerapan Sistem Manajemen Mutu Konstruksi",
        uraian: "RMPK Kontraktor & Program Mutu Konsultan Pengawas dijalankan, uji tekan beton K-350 memenuhi syarat teknis",
        standar: "Spesifikasi Umum Bina Marga 2018 Rev 2",
        hasil: "Sesuai"
      },
      {
        no: 5,
        item: "Penggunaan Material, Peralatan & Teknologi Konstruksi",
        uraian: "Alat berat excavator ber-SILO aktif, operator bersertifikat SIO Kemnaker, semen & baja bersertifikat SNI",
        standar: "Permenaker No. 8/2020 & SNI 2052:2017",
        hasil: "Sesuai"
      },
      {
        no: 6,
        item: "Pengelolaan & Pemanfaatan Sumber Material Konstruksi",
        uraian: "Bahan agregat dari quarry berizin SIPB resmi di Rumpin, pengelolaan limbah konstruksi ramah lingkungan",
        standar: "UU No. 3/2020 Minerba & Baku Mutu KLHK",
        hasil: "Sesuai"
      }
    ]
  },
  {
    id: "PEL-TP-2B-01",
    simak_code: "2.b",
    tipe_tertib: "tertib-penyelenggaraan",
    nama_objek: "Pembangunan Jembatan Beton Pratekan Ciawi - Megamendung Bentang 30M",
    nama_proyek: "Pembangunan Jembatan Beton Pratekan Ciawi - Megamendung Bentang 30M",
    nilai_proyek: 18500000000,
    nomor_perjanjian: "602.1/018/SPK/PJN-I/2026",
    waktu_pelaksanaan: "150 Hari Kalender (Februari - Juli 2026)",
    penyedia_jasa: "PT. Megamendung Citra Karya",
    badan_usaha: "PT. Megamendung Citra Karya",
    nama_pemilik_pekerjaan: "Satuan Kerja PJN Wilayah I Jawa Barat",
    waktu_pengawasan: "2026-03-21",
    tanggal_audit: "2026-03-21",
    propinsi: "Jawa Barat",
    kab_kota: "Kabupaten Bogor",
    lokasi: "Kecamatan Ciawi & Megamendung",
    pengawas: "Drs. Mulyadi Kusuma, M.Si. (Tim Pembina Jakon)",
    status_kepatuhan: "Patuh",
    status_verifikasi: "Terverifikasi",
    dokumen: "Dokumen_SIMAK_2b_JembatanCiawi.pdf",
    dokumen_bap: "Dokumen_SIMAK_2b_JembatanCiawi.pdf",
    catatan_temuan: "Pengujian mutu gelagar girder pratekan telah terverifikasi laboratorium independen, dokumen RMPK konsultan pengawas lengkap.",
    rekomendasi: "Pastikan pengawasan pemasangan retaining wall sungai di musim hujan untuk mengantisipasi debit air tinggi.",
    sub_items: [
      {
        no: 1,
        item: "Proses Pemilihan Penyedia Jasa",
        uraian: "Dokumen kualifikasi, HPS, dan evaluasi lelang terbuka LPSE terdokumentasi rapi",
        standar: "Perpres 12/2021 & Dokumen Tender PUPR",
        hasil: "Sesuai"
      },
      {
        no: 2,
        item: "Penyusunan & Pelaksanaan Kontrak Kerja Konstruksi",
        uraian: "Kontrak telah memuat klausul HKI, alih teknologi girder pratekan, serta asuransi CAR & BPJS Ketenagakerjaan",
        standar: "Pasal 47 UU 2/2017 & Permen PUPR 1/2023",
        hasil: "Sesuai"
      },
      {
        no: 3,
        item: "Penerapan Standar K4 & Penerapan SMKK",
        uraian: "Tersedia posko K3, jalur evakuasi proyek sungai, APD rompi pelampung dan helm keselamatan lengkap",
        standar: "Permen PUPR No. 10/2021 (SMKK)",
        hasil: "Sesuai"
      },
      {
        no: 4,
        item: "Penerapan Sistem Manajemen Mutu Konstruksi",
        uraian: "Program Mutu Konsultan Supervisi dan RMPK Kontraktor terverifikasi, uji slump beton konsisten",
        standar: "Spesifikasi Teknis Jembatan PUPR",
        hasil: "Sesuai"
      },
      {
        no: 5,
        item: "Penggunaan Material, Peralatan & Teknologi Konstruksi",
        uraian: "Material tendon strand baja ber-SNI, crane pemancang bersertifikat kelaikan teknis Disnaker",
        standar: "SNI 1154:2016 & Permenaker 8/2020",
        hasil: "Sesuai"
      },
      {
        no: 6,
        item: "Pengelolaan & Pemanfaatan Sumber Material Konstruksi",
        uraian: "Sumber agregat beton berizin galian C legal, tidak mengganggu ekosistem sempadan sungai",
        standar: "UU No. 32/2009 PPLH & UU 3/2020",
        hasil: "Sesuai"
      }
    ]
  },
  {
    id: "PEL-TP-2C-01",
    simak_code: "2.c",
    tipe_tertib: "tertib-penyelenggaraan",
    nama_objek: "Pembangunan Gedung Rawat Inap Terpadu 5 Lantai RSUD Leuwiliang",
    nama_proyek: "Pembangunan Gedung Rawat Inap Terpadu 5 Lantai RSUD Leuwiliang",
    nilai_proyek: 32000000000,
    nomor_perjanjian: "445/032/SPK/RSUD-LWL/2026",
    waktu_pelaksanaan: "210 Hari Kalender (Januari - Juli 2026)",
    penyedia_jasa: "PT. Cibinong Bangun Perkasa",
    badan_usaha: "PT. Cibinong Bangun Perkasa",
    nama_pemilik_pekerjaan: "RSUD Leuwiliang / Dinas Kesehatan Kab. Bogor",
    waktu_pengawasan: "2026-03-18",
    tanggal_audit: "2026-03-18",
    propinsi: "Jawa Barat",
    kab_kota: "Kabupaten Bogor",
    lokasi: "Kecamatan Leuwiliang",
    pengawas: "Siti Rahmawati, S.T. (Petugas Pengawas Jakon)",
    status_kepatuhan: "Patuh",
    status_verifikasi: "Draft",
    dokumen: "Dokumen_SIMAK_2c_RSUDLeuwiliang.pdf",
    dokumen_bap: "Dokumen_SIMAK_2c_RSUDLeuwiliang.pdf",
    catatan_temuan: "Dokumen pernyataan komitmen pembiayaan dan jaminan pelaksanaan tersedia, struktur kolom lantai 3 sedang proses pengecoran.",
    rekomendasi: "Segera lakukan penandatanganan berita acara pemeriksaan lapangan oleh Pejabat Pembuat Komitmen (PPK).",
    sub_items: [
      {
        no: 1,
        item: "Proses Pemilihan Penyedia Jasa",
        uraian: "Surat pernyataan proses tender seleksi penyedia jasa konstruksi dari Direktur RSUD lengkap",
        standar: "Permen PUPR No. 1/2023 Lampiran 2.c",
        hasil: "Sesuai"
      },
      {
        no: 2,
        item: "Penyusunan & Pelaksanaan Kontrak Kerja Konstruksi",
        uraian: "Kontrak memuat kesepakatan jaminan ketersediaan anggaran multiyears dan klausul hak tenaga kerja",
        standar: "Pasal 47 UU No. 2/2017",
        hasil: "Sesuai"
      },
      {
        no: 3,
        item: "Penerapan Standar K4 & Penerapan SMKK",
        uraian: "Tersedia safety net penahan jatuh, scaffold berstandar aman, dan rambu K3 area rumah sakit aktif",
        standar: "Permen PUPR No. 10/2021 (SMKK)",
        hasil: "Sesuai"
      },
      {
        no: 4,
        item: "Penerapan Sistem Manajemen Mutu Konstruksi",
        uraian: "Metode kerja pengecoran bertahap dan pengujian benda uji silinder beton terjadwal teratur",
        standar: "SNI 2847:2019",
        hasil: "Sesuai"
      },
      {
        no: 5,
        item: "Penggunaan Material, Peralatan & Teknologi Konstruksi",
        uraian: "Menggunakan passenger hoist berizin SILO dan besi beton ulir ber-SNI dengan sertifikat pabrikan",
        standar: "Permenaker 8/2020 & SNI 2052:2017",
        hasil: "Sesuai"
      },
      {
        no: 6,
        item: "Pengelolaan & Pemanfaatan Sumber Material Konstruksi",
        uraian: "Pengelolaan debu dan kebisingan terkendali agar tidak mengganggu pelayanan medis pasien rawat inap",
        standar: "Baku Mutu Kebisingan Fasilitas Kesehatan",
        hasil: "Sesuai"
      }
    ]
  },
  {
    id: "PEL-TP-2D-01",
    simak_code: "2.d",
    tipe_tertib: "tertib-penyelenggaraan",
    nama_objek: "Rehabilitasi Jaringan Irigasi Tersier Daerah Irigasi (DI) Cibalok Paket 2",
    nama_proyek: "Rehabilitasi Jaringan Irigasi Tersier Daerah Irigasi (DI) Cibalok Paket 2",
    nilai_proyek: 12800000000,
    nomor_perjanjian: "012/P3A-CBL/SP-KTR/2026",
    waktu_pelaksanaan: "120 Hari Kalender (Maret - Juni 2026)",
    penyedia_jasa: "CV. Bogor Konstruksi Pratama",
    badan_usaha: "CV. Bogor Konstruksi Pratama",
    nama_pemilik_pekerjaan: "Perkumpulan Petani Pemakai Air (P3A) Tirta Cibalok / Swasta",
    waktu_pengawasan: "2026-03-15",
    tanggal_audit: "2026-03-15",
    propinsi: "Jawa Barat",
    kab_kota: "Kabupaten Bogor",
    lokasi: "Kecamatan Sukaraja & Babakan Madang",
    pengawas: "Ir. Hendra Setiawan, S.T. (Tim Pembina Jakon)",
    status_kepatuhan: "Patuh",
    status_verifikasi: "Draft",
    dokumen: "Dokumen_SIMAK_2d_IrigasiCibalok.pdf",
    dokumen_bap: "Dokumen_SIMAK_2d_IrigasiCibalok.pdf",
    catatan_temuan: "Dokumen perjanjian kerja non-APBD memenuhi kaidah Pasal 47 UU 2/2017, perbaikan pasangan batu saluran berjalan sesuai rencana.",
    rekomendasi: "Lengkapi bukti kepesertaan BPJS Ketenagakerjaan bagi seluruh pekerja lokal yang dilibatkan dalam proyek.",
    sub_items: [
      {
        no: 1,
        item: "Proses Pemilihan Penyedia Jasa",
        uraian: "Pemilihan langsung melalui musyawarah anggota P3A dengan berita acara kesepakatan tertulis",
        standar: "Permen PUPR No. 1/2023 Lampiran 2.d",
        hasil: "Sesuai"
      },
      {
        no: 2,
        item: "Penyusunan & Pelaksanaan Kontrak Kerja Konstruksi",
        uraian: "Surat Perjanjian memuat hak dan kewajiban para pihak, spesifikasi teknis batu kali, dan batas waktu penyelesaian",
        standar: "Pasal 47 UU No. 2 Tahun 2017",
        hasil: "Sesuai"
      },
      {
        no: 3,
        item: "Penerapan Standar K4 & Penerapan SMKK",
        uraian: "Pekerja dilengkapi sepatu bot dan sarung tangan, terdapat kotak P3K darurat di barak kerja lapangan",
        standar: "Permen PUPR No. 10/2021 (SMKK)",
        hasil: "Sesuai"
      },
      {
        no: 4,
        item: "Penerapan Sistem Manajemen Mutu Konstruksi",
        uraian: "Perbandingan adukan semen-pasir 1:4 diawasi mandor, plesteran dan siaran rapi tidak bocor",
        standar: "Spesifikasi Teknis Irigasi SDA PUPR",
        hasil: "Sesuai"
      },
      {
        no: 5,
        item: "Penggunaan Material, Peralatan & Teknologi Konstruksi",
        uraian: "Material semen ber-SNI, mesin molen beton beroperasi baik, batu belah bersumber dari supplier lokal berizin",
        standar: "SNI Semen Portland & UU Minerba",
        hasil: "Sesuai"
      },
      {
        no: 6,
        item: "Pengelolaan & Pemanfaatan Sumber Material Konstruksi",
        uraian: "Pembersihan endapan sedimen saluran tidak mencemari areal persawahan produktif sekitar",
        standar: "Standar Perlindungan Lingkungan Pertanian",
        hasil: "Sesuai"
      }
    ]
  }
];

async function seed() {
  console.log("Seeding SIMAK 2 (2.a s.d. 2.d) records to live Supabase...");

  for (const record of simak2Records) {
    const { error } = await supabase.from("pengawasan_sesi").upsert(record, { onConflict: "id" });
    if (error) {
      console.error(`Error inserting ${record.id}:`, error.message);
    } else {
      console.log(`Successfully upserted: ${record.id} (${record.simak_code}) - ${record.nama_proyek.slice(0, 45)}...`);
    }
  }

  // Also update old records to new 2.a - 2.d codes if any exist
  await supabase.from("pengawasan_sesi").update({ simak_code: "2.a" }).eq("simak_code", "SIMAK 2a");
  await supabase.from("pengawasan_sesi").update({ simak_code: "2.b" }).eq("simak_code", "SIMAK 2b");
  await supabase.from("pengawasan_sesi").update({ simak_code: "2.c" }).eq("simak_code", "SIMAK 2c");
  await supabase.from("pengawasan_sesi").update({ simak_code: "2.d" }).eq("simak_code", "SIMAK 2d");

  console.log("SIMAK 2 seeding and normalization completed!");
}

seed().catch(console.error);

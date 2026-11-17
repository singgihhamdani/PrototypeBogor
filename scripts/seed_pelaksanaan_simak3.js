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

const simak3Records = [
  {
    id: "PEL-TM-2026-001",
    simak_code: "Daftar Simak 3",
    tipe_tertib: "tertib-pemanfaatan",
    nama_objek: "Gedung Rawat Inap Terpadu 5 Lantai RSUD Leuwiliang",
    nama_bangunan: "Gedung Rawat Inap Terpadu 5 Lantai RSUD Leuwiliang",
    badan_usaha: "Pemerintah Kabupaten Bogor / BPKAD",
    nama_pemilik: "Pemerintah Kabupaten Bogor / BPKAD",
    nama_pengelola: "Dinas Kesehatan Kab. Bogor / Manajemen RSUD",
    lokasi: "Jl. Raya Cibeber No. 1, Kecamatan Leuwiliang",
    tahun: "2026",
    wilayah: "Jawa Barat / Kabupaten Bogor",
    propinsi: "Jawa Barat",
    kab_kota: "Kabupaten Bogor",
    waktu_pengawasan: "2026-03-28",
    tanggal_audit: "2026-03-28",
    fungsi_bangunan: "Fasilitas Pelayanan Kesehatan",
    status_slf: "Memiliki SLF (Aktif s.d 2029)",
    status_kepatuhan: "Patuh",
    kategori_hasil: "Tertib",
    skor_tertib: 95,
    status_verifikasi: "Terverifikasi",
    pengawas: "Ir. Hendra Setiawan, S.T. (Tim Pembina Jakon)",
    dokumen: "BAP_SIMAK3_RSUD_Leuwiliang.pdf",
    dokumen_bap: "BAP_SIMAK3_RSUD_Leuwiliang.pdf",
    catatan_temuan: "Pemanfaatan ruang sesuai fungsi peruntukan RS tipe B. Pemeliharaan instalasi ME, lift medis, genset darurat, dan sistem proteksi kebakaran berkala tercatat dalam log book operasional.",
    rekomendasi: "Pertahankan standar operasional dan lakukan pengujian berkala pada sistem hidran serta sprinkler setiap triwulan.",
    sub_items: [
      {
        no: 1,
        indikator: "Pengawasan fungsi peruntukan terhadap tertib pemanfaatan produk Jasa Konstruksi",
        uraian: "Pemeriksaan kesesuaian pemanfaatan gedung RS tipe B sesuai perizinan PBG dan kesesuaian lokasi terhadap RDTR Kecamatan Leuwiliang terverifikasi sah melalui dokumen perizinan resmi.",
        standar: "RTRW/RDTR Kab. Bogor, KKPR & PBG (PP No. 16/2021)",
        hasil: "Sesuai"
      },
      {
        no: 2,
        indikator: "Pengawasan terhadap rencana umur konstruksi",
        uraian: "Pemeriksaan jaminan kelaikan fungsi sepanjang umur konstruksi (rencana 50 tahun) dibuktikan dengan Sertifikat Laik Fungsi (SLF) Nomor 503/SLF-014/DPMPTSP/2024 aktif.",
        standar: "Permen PUPR No. 27/PRT/M/2018 & PP No. 16/2021",
        hasil: "Sesuai"
      },
      {
        no: 3,
        indikator: "Pengawasan terhadap kapasitas dan beban",
        uraian: "Beban operasional ranjang pasien, instalasi radiologi, dan tangki air atap berada dalam batas kapasitas beban desain rencana struktur (beban hidup 250 kg/m²).",
        standar: "SNI 1727:2020 Beban Desain Minimum untuk Gedung",
        hasil: "Sesuai"
      },
      {
        no: 4,
        indikator: "Pengawasan terhadap pemeliharaan produk jasa konstruksi",
        uraian: "Tersedia SOP Pemeliharaan Berkala Struktur & MEP serta laporan kontrak pemeliharaan lift dan chiller dengan pihak ketiga yang diperbarui secara berkala.",
        standar: "Permen PUPR No. 24/PRT/M/2008 Pedoman Pemeliharaan & Perawatan",
        hasil: "Sesuai"
      }
    ]
  },
  {
    id: "PEL-TM-2026-002",
    simak_code: "Daftar Simak 3",
    tipe_tertib: "tertib-pemanfaatan",
    nama_objek: "Kompleks Stadion Utama Pakansari (Kapasitas 30.000 Penonton)",
    nama_bangunan: "Kompleks Stadion Utama Pakansari (Kapasitas 30.000 Penonton)",
    badan_usaha: "Pemerintah Kabupaten Bogor / BPKAD",
    nama_pemilik: "Pemerintah Kabupaten Bogor / BPKAD",
    nama_pengelola: "Dinas Pemuda dan Olahraga (Dispora) Kab. Bogor",
    lokasi: "Jl. Kolonel Edy Yoso Martadipura, Kel. Pakansari, Kec. Cibinong",
    tahun: "2026",
    wilayah: "Jawa Barat / Kabupaten Bogor",
    propinsi: "Jawa Barat",
    kab_kota: "Kabupaten Bogor",
    waktu_pengawasan: "2026-03-24",
    tanggal_audit: "2026-03-24",
    fungsi_bangunan: "Fasilitas Olahraga & Ruang Publik",
    status_slf: "Memiliki SLF (Aktif s.d 2028)",
    status_kepatuhan: "Patuh",
    kategori_hasil: "Tertib",
    skor_tertib: 92,
    status_verifikasi: "Terverifikasi",
    pengawas: "Dr. Ir. Wahyudi, M.Sc. (Tim Pembina Jakon)",
    dokumen: "BAP_SIMAK3_StadionPakansari.pdf",
    dokumen_bap: "BAP_SIMAK3_StadionPakansari.pdf",
    catatan_temuan: "Struktur tribun dan atap space frame kanopi dalam kondisi prima. Jalur evakuasi darurat, sistem pencahayaan LED lapangan, dan rumput drainase terpelihara dengan baik.",
    rekomendasi: "Lakukan inspeksi rutin terhadap kekencangan baut sambungan baja atap kanopi menjelang musim angin kencang.",
    sub_items: [
      {
        no: 1,
        indikator: "Pengawasan fungsi peruntukan terhadap tertib pemanfaatan produk Jasa Konstruksi",
        uraian: "Pemanfaatan bangunan sesuai zonasi olahraga terpadu kawasan Pakansari Cibinong mengacu RDTR Pusat Pemerintahan Kab. Bogor.",
        standar: "RDTR Kawasan Perkotaan Cibinong (Perda No. 11/2016)",
        hasil: "Sesuai"
      },
      {
        no: 2,
        indikator: "Pengawasan terhadap rencana umur konstruksi",
        uraian: "Ketersediaan SLF bangunan bentang lebar aktif dan surat rekomendasi keselamatan struktur berkala dari Tim Ahli Bangunan Gedung (TABG).",
        standar: "PP No. 16/2021 & Permen PUPR No. 27/2018",
        hasil: "Sesuai"
      },
      {
        no: 3,
        indikator: "Pengawasan terhadap kapasitas dan beban",
        uraian: "Pemeriksaan sistem sensor beban penonton pada tribun barat/timur serta pembatasan kapasitas aman 30.000 tempat duduk bertiket (single seat).",
        standar: "Standar Keamanan Stadion FIFA & PSSI / Permenpora No. 10/2022",
        hasil: "Sesuai"
      },
      {
        no: 4,
        indikator: "Pengawasan terhadap pemeliharaan produk jasa konstruksi",
        uraian: "Pelaksanaan program perawatan mekanikal elektrikal, genset 1.000 kVA, sistem hidran lapangan, dan peremajaan rumput terencana dalam DPA Dispora.",
        standar: "Permen PUPR No. 24/PRT/M/2008",
        hasil: "Sesuai"
      }
    ]
  },
  {
    id: "PEL-TM-2026-003",
    simak_code: "Daftar Simak 3",
    tipe_tertib: "tertib-pemanfaatan",
    nama_objek: "Jembatan Gelagar Beton Pratekan Ciawi - Megamendung Bentang 30M",
    nama_bangunan: "Jembatan Gelagar Beton Pratekan Ciawi - Megamendung Bentang 30M",
    badan_usaha: "Dinas PUPR Kabupaten Bogor",
    nama_pemilik: "Dinas PUPR Kabupaten Bogor",
    nama_pengelola: "UPT Infrastruktur Jalan & Jembatan Wilayah II Ciawi",
    lokasi: "Jl. Raya Puncak Km. 67, Kecamatan Ciawi",
    tahun: "2026",
    wilayah: "Jawa Barat / Kabupaten Bogor",
    propinsi: "Jawa Barat",
    kab_kota: "Kabupaten Bogor",
    waktu_pengawasan: "2026-03-20",
    tanggal_audit: "2026-03-20",
    fungsi_bangunan: "Infrastruktur Sipil Jembatan Jalan Kabupaten",
    status_slf: "Sertifikat Laik Fungsi Jalan (SLFJ) Lengkap",
    status_kepatuhan: "Patuh",
    kategori_hasil: "Tertib",
    skor_tertib: 90,
    status_verifikasi: "Terverifikasi",
    pengawas: "Ir. Rahmat Hidayat, M.T. (Tim Pembina Jakon)",
    dokumen: "BAP_SIMAK3_JembatanCiawi.pdf",
    dokumen_bap: "BAP_SIMAK3_JembatanCiawi.pdf",
    catatan_temuan: "Expansion joint jembatan elastis, drainase dek jembatan bersih dari sedimentasi pasir. Rambu pembatas tonase muatan terpasang jelas di kedua ujung pendekat.",
    rekomendasi: "Lakukan pembersihan lumut dan pengecekan berkala terhadap fondasi abutment dari gerusan arus sungai (scouring).",
    sub_items: [
      {
        no: 1,
        indikator: "Pengawasan fungsi peruntukan terhadap tertib pemanfaatan produk Jasa Konstruksi",
        uraian: "Pemanfaatan prasarana jembatan kelas jalan kabupaten sesuai trase jalan kolektor kawasan wisata Puncak.",
        standar: "UU No. 2/2022 tentang Jalan & Perda RTRW Kab. Bogor",
        hasil: "Sesuai"
      },
      {
        no: 2,
        indikator: "Pengawasan terhadap rencana umur konstruksi",
        uraian: "Jaminan umur rencana jembatan 50 tahun melalui pemenuhan sertifikat uji beban statis-dinamis dan kelaikan fungsi jembatan.",
        standar: "SE Menteri PUPR No. 10/SE/M/2015 Uji Beban Jembatan",
        hasil: "Sesuai"
      },
      {
        no: 3,
        indikator: "Pengawasan terhadap kapasitas dan beban",
        uraian: "Pengawasan tonase muatan sumbu terberat (MST 8 Ton) dengan pemasangan rambu peringatan portal ketinggian dan timbangan berkala Dishub.",
        standar: "Bina Marga Bridge Design Code & Permenhub No. 60/2019",
        hasil: "Sesuai"
      },
      {
        no: 4,
        indikator: "Pengawasan terhadap pemeliharaan produk jasa konstruksi",
        uraian: "Program pemeliharaan rutin expansion joint, penggantian elastomeric bearing pad berkala, dan pembersihan lubang drainase deck terdata pada UPT II.",
        standar: "Pedoman Pemeliharaan Jembatan Ditjen Bina Marga No. 005/P/BM/2011",
        hasil: "Sesuai"
      }
    ]
  },
  {
    id: "PEL-TM-2026-004",
    simak_code: "Daftar Simak 3",
    tipe_tertib: "tertib-pemanfaatan",
    nama_objek: "Bangunan Pasar Rakyat Parungpanjang 2 Lantai Blok A & B",
    nama_bangunan: "Bangunan Pasar Rakyat Parungpanjang 2 Lantai Blok A & B",
    badan_usaha: "Perumda Pasar Tohaga Kabupaten Bogor",
    nama_pemilik: "Perumda Pasar Tohaga Kabupaten Bogor",
    nama_pengelola: "Pengelola Unit Pasar Tohaga Wilayah Parungpanjang",
    lokasi: "Jl. Raya Parungpanjang No. 45, Kecamatan Parungpanjang",
    tahun: "2026",
    wilayah: "Jawa Barat / Kabupaten Bogor",
    propinsi: "Jawa Barat",
    kab_kota: "Kabupaten Bogor",
    waktu_pengawasan: "2026-03-15",
    tanggal_audit: "2026-03-15",
    fungsi_bangunan: "Fasilitas Perdagangan / Pasar Tradisional",
    status_slf: "Belum Perpanjang SLF (Kedaluwarsa)",
    status_kepatuhan: "Tidak Patuh",
    kategori_hasil: "Kurang Tertib",
    skor_tertib: 58,
    status_verifikasi: "Draft",
    pengawas: "Bambang Kurniawan, S.T. (Tim Pembina Jakon)",
    dokumen: "BAP_SIMAK3_PasarParungpanjang.pdf",
    dokumen_bap: "BAP_SIMAK3_PasarParungpanjang.pdf",
    catatan_temuan: "Ditemukan alih fungsi koridor evakuasi darurat menjadi lapak dagang permanen, masa berlaku SLF telah kedaluwarsa 6 bulan, dan tabung APAR tidak dilakukan uji tekanan ulang tahunan.",
    rekomendasi: "Diterbitkan surat rekomendasi pembinaan kepada pengelola pasar untuk segera menertibkan koridor darurat, mengisi ulang APAR, dan mengajukan perpanjangan SLF ke DPMPTSP.",
    sub_items: [
      {
        no: 1,
        indikator: "Pengawasan fungsi peruntukan terhadap tertib pemanfaatan produk Jasa Konstruksi",
        uraian: "Sebagian selasar dan ruang tangga evakuasi darurat disekat dan beralih fungsi menjadi kios pedagang semi-permanen tanpa izin pengelola.",
        standar: "PP No. 16/2021 Pasal 13 & Standar Aksesibilitas Pasar Rakyat",
        hasil: "Tidak Sesuai"
      },
      {
        no: 2,
        indikator: "Pengawasan terhadap rencana umur konstruksi",
        uraian: "Sertifikat Laik Fungsi (SLF) nomor 503/SLF-102/2019 telah habis masa berlakunya per September 2025 dan belum diajukan permohonan perpanjangan.",
        standar: "Permen PUPR No. 27/PRT/M/2018 (SLF Bangunan Gedung)",
        hasil: "Tidak Sesuai"
      },
      {
        no: 3,
        indikator: "Pengawasan terhadap kapasitas dan beban",
        uraian: "Penumpukan stok karung komoditas beras dan sembako melebihi kapasitas lantai mezzanine blok B menimbulkan lendutan minor pada pelat lantai.",
        standar: "SNI 1727:2020 Beban Desain Gudang/Penyimpanan",
        hasil: "Tidak Sesuai"
      },
      {
        no: 4,
        indikator: "Pengawasan terhadap pemeliharaan produk jasa konstruksi",
        uraian: "Tidak tersedia log book perawatan berkala sistem proteksi kebakaran (APAR kosong dan pompa hidran mati) serta instalasi kabel listrik semrawut.",
        standar: "Permen PUPR No. 24/PRT/M/2008 & Permenaker No. 04/1980",
        hasil: "Tidak Sesuai"
      }
    ]
  },
  {
    id: "PEL-TM-2026-005",
    simak_code: "Daftar Simak 3",
    tipe_tertib: "tertib-pemanfaatan",
    nama_objek: "Gedung Kantor Dinas Penanaman Modal & PTSP Kabupaten Bogor",
    nama_bangunan: "Gedung Kantor Dinas Penanaman Modal & PTSP Kabupaten Bogor",
    badan_usaha: "Pemerintah Kabupaten Bogor / BPKAD",
    nama_pemilik: "Pemerintah Kabupaten Bogor / BPKAD",
    nama_pengelola: "Dinas Penanaman Modal dan PTSP Kabupaten Bogor",
    lokasi: "Jl. Tegar Beriman No. 34, Kompleks Pemda, Kecamatan Cibinong",
    tahun: "2026",
    wilayah: "Jawa Barat / Kabupaten Bogor",
    propinsi: "Jawa Barat",
    kab_kota: "Kabupaten Bogor",
    waktu_pengawasan: "2026-03-10",
    tanggal_audit: "2026-03-10",
    fungsi_bangunan: "Fasilitas Perkantoran & Pelayanan Publik",
    status_slf: "Memiliki SLF (Aktif s.d 2030)",
    status_kepatuhan: "Patuh",
    kategori_hasil: "Tertib",
    skor_tertib: 96,
    status_verifikasi: "Terverifikasi",
    pengawas: "Ir. Hendra Setiawan, S.T. (Tim Pembina Jakon)",
    dokumen: "BAP_SIMAK3_DPMPTSP.pdf",
    dokumen_bap: "BAP_SIMAK3_DPMPTSP.pdf",
    catatan_temuan: "Pemanfaatan ruang terbagi jelas antara front office layanan, back office verifikasi, dan ruang server. Jalur difabel, toilet disabilitas, dan tangga darurat berfungsi optimal.",
    rekomendasi: "Pertahankan standar operasional bangunan gedung hijau ramah lingkungan dan lakukan inspeksi rutin panel surya atap.",
    sub_items: [
      {
        no: 1,
        indikator: "Pengawasan fungsi peruntukan terhadap tertib pemanfaatan produk Jasa Konstruksi",
        uraian: "Pemanfaatan gedung untuk pelayanan perizinan publik terpadu sesuai tata ruang pusat pemerintahan Kabupaten Bogor.",
        standar: "RDTR Kawasan Pemerintahan Cibinong & PBG Gedung Pemerintah",
        hasil: "Sesuai"
      },
      {
        no: 2,
        indikator: "Pengawasan terhadap rencana umur konstruksi",
        uraian: "Sertifikat Laik Fungsi (SLF) nomor 503/SLF-008/DPMPTSP/2025 aktif sampai dengan tahun 2030 lengkap dengan as-built drawing terintegrasi.",
        standar: "PP No. 16/2021 & Permen PUPR No. 27/2018",
        hasil: "Sesuai"
      },
      {
        no: 3,
        indikator: "Pengawasan terhadap kapasitas dan beban",
        uraian: "Ruang arsip berkas dinamis menggunakan mobile compact rolling shelves sesuai perhitungan beban struktur pelat lantai 500 kg/m².",
        standar: "SNI 1727:2020 & Pedoman Arsip Nasional RI (ANRI)",
        hasil: "Sesuai"
      },
      {
        no: 4,
        indikator: "Pengawasan terhadap pemeliharaan produk jasa konstruksi",
        uraian: "Pemeliharaan AC sentral VRV, genset cadangan 250 kVA, dan UPS ruang server dilaksanakan melalui kontrak servis berkala bergaransi resmi.",
        standar: "Permen PUPR No. 24/PRT/M/2008 & SOP Standar Pelayanan Perkantoran",
        hasil: "Sesuai"
      }
    ]
  }
];

async function seedSimak3() {
  console.log("Mulai seeding data realistis SIMAK 3 (Tertib Pemanfaatan) ke Supabase...");

  // Update record lama jika ada
  await supabase
    .from("pengawasan_sesi")
    .update({ simak_code: "Daftar Simak 3" })
    .eq("tipe_tertib", "tertib-pemanfaatan");

  // Upsert record baru
  for (const rec of simak3Records) {
    const { data, error } = await supabase
      .from("pengawasan_sesi")
      .upsert(rec, { onConflict: "id" })
      .select();

    if (error) {
      console.error(`Gagal upsert record ${rec.id}:`, error.message);
    } else {
      console.log(`✓ Berhasil upsert record ${rec.id} (${rec.nama_bangunan})`);
    }
  }

  console.log("Seeding SIMAK 3 selesai dengan sukses!");
}

seedSimak3().catch((err) => {
  console.error("Error saat seeding SIMAK 3:", err);
  process.exit(1);
});

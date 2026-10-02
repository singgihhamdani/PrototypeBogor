import { ExportColumn, DataDictionaryItem, formatRupiah, formatTanggalIndo } from "./export-utils";
import { BatchColumnDef } from "@/components/common/batch-import-modal";

export interface SipjakiTemplate {
  id: string;
  moduleName: string;
  exportFileName: string;
  sheetName: string;
  columns: ExportColumn[];
  importColumns: BatchColumnDef[];
  sampleRows: Record<string, any>[];
  enumValidation: Record<string, string[]>;
  dictionaryItems: DataDictionaryItem[];
  instructions?: string[];
}

// ==========================================
// 1. TEMPLATE: PAKET PEKERJAAN KONSTRUKSI
// ==========================================
export const TEMPLATE_PAKET_PEKERJAAN: SipjakiTemplate = {
  id: "paket-pekerjaan",
  moduleName: "Data Paket Pekerjaan Konstruksi",
  exportFileName: "Data_Paket_Pekerjaan_SIPJAKI_Kab_Bogor",
  sheetName: "DATA PAKET",
  enumValidation: {
    source: ["APBD", "DAK", "Banprov", "APBN", "Lainnya"],
    status: ["Tender", "Pelaksanaan", "Selesai", "Putus Kontrak"],
    contractType: ["Pengadaan Barang", "Konstruksi", "Konsultansi"],
    contractChar: ["Lump Sum", "Harga Satuan", "Gabungan", "Kontrak Payung"],
    physMonth: [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ],
    finMonth: [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ]
  },
  columns: [
    {
      key: "fiscalYear",
      label: "Tahun Anggaran",
      sipjakiLabel: "tahun_anggaran",
      dataType: "Integer (YYYY)",
      description: "Tahun anggaran pelaksanaan proyek"
    },
    {
      key: "name",
      label: "Nama Pekerjaan",
      sipjakiLabel: "nama_pekerjaan",
      dataType: "String (Max 255)",
      description: "Nama paket pekerjaan sesuai kontrak/RUP"
    },
    {
      key: "source",
      label: "Sumber Dana",
      sipjakiLabel: "sumber_dana",
      dataType: "Enum",
      allowedValues: ["APBD", "DAK", "Banprov", "APBN", "Lainnya"],
      description: "Sumber pendanaan paket konstruksi"
    },
    {
      key: "owner",
      label: "Pengguna Jasa",
      sipjakiLabel: "pengguna_jasa",
      dataType: "String",
      description: "Nama OPD / Bidang pemilik pekerjaan"
    },
    {
      key: "contractor",
      label: "Nama Penyedia",
      sipjakiLabel: "nama_penyedia",
      dataType: "String",
      description: "Nama resmi kontraktor/konsultan pelaksana"
    },
    {
      key: "nib",
      label: "NIB Penyedia",
      sipjakiLabel: "nib_penyedia",
      dataType: "String (13 digit)",
      description: "Nomor Induk Berusaha penyedia jasa"
    },
    {
      key: "contractValue",
      label: "Nilai Kontrak (Rp)",
      sipjakiLabel: "nilai_kontrak",
      dataType: "BigInt / Numerik",
      transform: (v) => formatRupiah(v),
      description: "Nilai kontrak final termasuk PPN"
    },
    {
      key: "status",
      label: "Status Paket",
      sipjakiLabel: "status_paket",
      dataType: "Enum",
      allowedValues: ["Tender", "Pelaksanaan", "Selesai", "Putus Kontrak"],
      description: "Status progres pengadaan dan fisik"
    },
    {
      key: "contractType",
      label: "Jenis Kontrak",
      sipjakiLabel: "jenis_kontrak",
      dataType: "Enum",
      allowedValues: ["Pengadaan Barang", "Konstruksi", "Konsultansi"],
      description: "Klasifikasi pengadaan jasa konstruksi"
    },
    {
      key: "contractChar",
      label: "Karakteristik Kontrak",
      sipjakiLabel: "karakteristik_kontrak",
      dataType: "Enum",
      allowedValues: ["Lump Sum", "Harga Satuan", "Gabungan", "Kontrak Payung"],
      description: "Karakteristik pembayaran kontrak"
    },
    {
      key: "startDate",
      label: "Tanggal Mulai (SPMK)",
      sipjakiLabel: "tanggal_mulai",
      dataType: "Date (YYYY-MM-DD)",
      description: "Tanggal Surat Perintah Mulai Kerja"
    },
    {
      key: "endDate",
      label: "Tanggal Selesai (PHO)",
      sipjakiLabel: "tanggal_selesai",
      dataType: "Date (YYYY-MM-DD)",
      description: "Tanggal serah terima pekerjaan pertama"
    },
    {
      key: "physProgress",
      label: "Progress Fisik (%)",
      sipjakiLabel: "progress_fisik",
      dataType: "Decimal (0.00 - 100.00)",
      description: "Persentase realisasi fisik lapangan"
    },
    {
      key: "physMonth",
      label: "Bulan Progres Fisik",
      sipjakiLabel: "bulan_progress_fisik",
      dataType: "Enum",
      allowedValues: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
      description: "Bulan pelaporan capaian fisik"
    },
    {
      key: "finProgress",
      label: "Progress Keuangan (%)",
      sipjakiLabel: "progress_keuangan",
      dataType: "Decimal (0.00 - 100.00)",
      description: "Persentase realisasi penyerapan anggaran"
    },
    {
      key: "finMonth",
      label: "Bulan Progres Keuangan",
      sipjakiLabel: "bulan_progress_keuangan",
      dataType: "Enum",
      allowedValues: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
      description: "Bulan pelaporan penyerapan keuangan"
    }
  ],
  importColumns: [
    { key: "fiscalYear", label: "Tahun Anggaran", required: true, example: "2026" },
    { key: "name", label: "Nama Pekerjaan", required: true, example: "Pembangunan Jembatan Gantung Desa Karang Asem" },
    { key: "source", label: "Sumber Dana", required: true, example: "APBD" },
    { key: "owner", label: "Pengguna Jasa", required: true, example: "DPU Kab. Bogor" },
    { key: "contractor", label: "Nama Penyedia", required: true, example: "PT. Graha Cipta Prima" },
    { key: "nib", label: "NIB Penyedia", required: true, example: "1234567890123" },
    { key: "contractValue", label: "Nilai Kontrak (Rp)", required: true, example: "2450000000" },
    { key: "status", label: "Status Paket", required: true, example: "Pelaksanaan" },
    { key: "contractType", label: "Jenis Kontrak", required: false, example: "Konstruksi" },
    { key: "contractChar", label: "Karakteristik Kontrak", required: false, example: "Harga Satuan" },
    { key: "startDate", label: "Tanggal Mulai", required: false, example: "2026-04-01" },
    { key: "endDate", label: "Tanggal Selesai", required: false, example: "2026-11-30" },
    { key: "physProgress", label: "Progress Fisik (%)", required: false, example: "35" },
    { key: "physMonth", label: "Bulan Progres Fisik", required: false, example: "April" },
    { key: "finProgress", label: "Progress Keuangan (%)", required: false, example: "30" },
    { key: "finMonth", label: "Bulan Progres Keuangan", required: false, example: "April" }
  ],
  sampleRows: [
    {
      fiscalYear: 2026,
      name: "Pembangunan Jembatan Gantung Desa Karang Asem",
      source: "APBD",
      owner: "DPU Kab. Bogor",
      contractor: "PT. Graha Cipta Prima",
      nib: "1234567890123",
      contractValue: 2450000000,
      status: "Pelaksanaan",
      contractType: "Konstruksi",
      contractChar: "Harga Satuan",
      startDate: "2026-04-01",
      endDate: "2026-11-30",
      physProgress: 35,
      physMonth: "April",
      finProgress: 30,
      finMonth: "April"
    },
    {
      fiscalYear: 2026,
      name: "Rehabilitasi Saluran Sekunder Cileungsi Hulu",
      source: "DAK",
      owner: "DPU Kab. Bogor",
      contractor: "CV. Tirta Mandiri Jaya",
      nib: "2345678901234",
      contractValue: 1250000000,
      status: "Pelaksanaan",
      contractType: "Konstruksi",
      contractChar: "Lump Sum",
      startDate: "2026-03-15",
      endDate: "2026-09-15",
      physProgress: 52,
      physMonth: "April",
      finProgress: 45,
      finMonth: "April"
    }
  ],
  dictionaryItems: [
    {
      field: "tahun_anggaran",
      label: "Tahun Anggaran",
      type: "Integer",
      description: "Tahun pelaksanaan proyek (e.g. 2026)"
    },
    {
      field: "nama_pekerjaan",
      label: "Nama Pekerjaan",
      type: "String (max 255)",
      description: "Nama paket pekerjaan sesuai kontrak/RUP"
    },
    {
      field: "sumber_dana",
      label: "Sumber Dana",
      type: "Enum",
      description: "Pilihan sumber pendanaan proyek",
      allowedValues: ["APBD", "DAK", "Banprov", "APBN", "Lainnya"]
    },
    {
      field: "pengguna_jasa",
      label: "Pengguna Jasa",
      type: "String",
      description: "Nama OPD / Pemilik Pekerjaan"
    },
    {
      field: "nama_penyedia",
      label: "Nama Penyedia",
      type: "String",
      description: "Nama kontraktor pelaksana"
    },
    {
      field: "nib_penyedia",
      label: "NIB Penyedia",
      type: "String (13 digit)",
      description: "Nomor Induk Berusaha OSS RBA (harus 13 digit numerik)"
    },
    {
      field: "nilai_kontrak",
      label: "Nilai Kontrak (Rp)",
      type: "BigInt",
      description: "Nilai kontrak final termasuk PPN dalam satuan Rupiah (angka bulat)"
    },
    {
      field: "status_paket",
      label: "Status Paket",
      type: "Enum",
      description: "Tahapan pekerjaan saat ini",
      allowedValues: ["Tender", "Pelaksanaan", "Selesai", "Putus Kontrak"]
    }
  ]
};

// ==========================================
// 2. TEMPLATE: PELAPORAN KECELAKAAN KERJA K3
// ==========================================
export const TEMPLATE_KECELAKAAN: SipjakiTemplate = {
  id: "kecelakaan",
  moduleName: "Pelaporan Kecelakaan Kerja K3",
  exportFileName: "Data_Kecelakaan_K3_SIPJAKI_Kab_Bogor",
  sheetName: "DATA KECELAKAAN",
  enumValidation: {
    source: ["APBD Kab. Bogor", "APBD Prov", "APBN", "Swasta"],
    severity: ["Luka Ringan", "Luka Berat", "Meninggal Dunia", "Nir Korban"]
  },
  columns: [
    {
      key: "projectName",
      label: "Nama Pekerjaan Proyek",
      sipjakiLabel: "nama_pekerjaan",
      dataType: "String",
      description: "Nama proyek tempat insiden terjadi"
    },
    {
      key: "contractor",
      label: "Perusahaan Penyedia (BUJK)",
      sipjakiLabel: "perusahaan_penyedia",
      dataType: "String",
      description: "Nama kontraktor / BUJK pelaksana"
    },
    {
      key: "district",
      label: "Kecamatan / Wilayah",
      sipjakiLabel: "lokasi_wilayah",
      dataType: "String",
      description: "Kecamatan lokasi kejadian"
    },
    {
      key: "locationDetail",
      label: "Detail Lokasi Kejadian",
      sipjakiLabel: "lokasi_kejadian",
      dataType: "Text",
      description: "STA proyek atau alamat detail lokasi kejadian"
    },
    {
      key: "date",
      label: "Tanggal Kejadian",
      sipjakiLabel: "tanggal_kejadian",
      dataType: "Date (YYYY-MM-DD)",
      description: "Tanggal insiden"
    },
    {
      key: "time",
      label: "Waktu Kejadian",
      sipjakiLabel: "waktu_kejadian",
      dataType: "Time (HH:mm)",
      description: "Jam kejadian insiden"
    },
    {
      key: "incidentType",
      label: "Jenis Insiden",
      sipjakiLabel: "jenis_insiden",
      dataType: "String",
      description: "Kategori kecelakaan kerja"
    },
    {
      key: "severity",
      label: "Tingkat Keparahan Korban",
      sipjakiLabel: "dampak_kerugian",
      dataType: "Enum",
      allowedValues: ["Luka Ringan", "Luka Berat", "Meninggal Dunia", "Nir Korban"],
      description: "Tingkat cedera dan dampak"
    },
    {
      key: "victimName",
      label: "Nama Korban & Usia",
      sipjakiLabel: "data_korban",
      dataType: "String",
      description: "Nama lengkap dan umur korban"
    },
    {
      key: "chronology",
      label: "Kronologi Kejadian",
      sipjakiLabel: "kronologi",
      dataType: "Text",
      description: "Penjelasan kronologi lengkap alur insiden"
    },
    {
      key: "correctiveAction",
      label: "Tindakan Penanganan",
      sipjakiLabel: "tindakan_penanganan",
      dataType: "Text",
      description: "Pertolongan pertama, evakuasi medis, dan perbaikan metode"
    },
    {
      key: "status",
      label: "Status Investigasi",
      sipjakiLabel: "status_penyelidikan",
      dataType: "String",
      description: "Proses investigasi K3"
    },
    {
      key: "sipjakiRef",
      label: "Nomor Referensi SIPJAKI",
      sipjakiLabel: "no_referensi_sipjaki",
      dataType: "String",
      description: "Kode bukti catat dari sistem SIPJAKI"
    }
  ],
  importColumns: [
    { key: "projectName", label: "Nama Pekerjaan Proyek", required: true, example: "Rekonstruksi Jalan Raya Cibinong - Citeureup" },
    { key: "contractor", label: "Perusahaan Penyedia", required: true, example: "PT Bangun Jaya Konstruksi" },
    { key: "date", label: "Tanggal Kejadian", required: true, example: "2026-05-14" },
    { key: "time", label: "Waktu Kejadian", required: false, example: "14:30" },
    { key: "district", label: "Kecamatan", required: true, example: "Cibinong" },
    { key: "locationDetail", label: "Detail Lokasi Kejadian", required: false, example: "STA 04+250 Depan Pasar Citeureup" },
    { key: "incidentType", label: "Jenis Insiden", required: true, example: "Tertimpa Material / Benda Jatuh" },
    { key: "severity", label: "Tingkat Keparahan", required: true, example: "Luka Ringan" },
    { key: "victimName", label: "Nama Korban", required: false, example: "Sutrisno (34 th)" },
    { key: "chronology", label: "Kronologi", required: true, example: "Sling crane berguncang saat unloading besi beton." },
    { key: "correctiveAction", label: "Tindakan Penanganan", required: true, example: "Korban dirawat di RSUD Cibinong dan dilakukan evaluasi SOP crane." }
  ],
  sampleRows: [
    {
      projectName: "Rekonstruksi Jalan Raya Cibinong - Citeureup",
      contractor: "PT Bangun Jaya Konstruksi",
      district: "Cibinong",
      locationDetail: "STA 04+250 Depan Pasar Citeureup",
      date: "2026-05-14",
      time: "14:30",
      incidentType: "Tertimpa Material / Benda Jatuh",
      severity: "Luka Ringan",
      victimName: "Sutrisno (34 th)",
      chronology: "Saat dilakukan unloading besi tulangan menggunakan mobil crane, sling mengalami guncangan dan menyenggol pekerja.",
      correctiveAction: "Pekerja segera dibawa ke RSUD Cibinong. Dilakukan toolbox meeting ulang mengenai zona aman radius crane.",
      status: "Selesai (Investigasi Ditutup)",
      sipjakiRef: "SIPJAKI-K3-2026-0491"
    }
  ],
  dictionaryItems: [
    {
      field: "nama_pekerjaan",
      label: "Nama Pekerjaan Proyek",
      type: "String",
      description: "Nama proyek konstruksi tempat terjadinya insiden"
    },
    {
      field: "perusahaan_penyedia",
      label: "Perusahaan Penyedia",
      type: "String",
      description: "Nama BUJK pelaksana konstruksi"
    },
    {
      field: "dampak_kerugian",
      label: "Tingkat Keparahan",
      type: "Enum",
      description: "Kategori dampak keselamatan korban",
      allowedValues: ["Luka Ringan", "Luka Berat", "Meninggal Dunia", "Nir Korban"]
    },
    {
      field: "kronologi",
      label: "Kronologi",
      type: "Text",
      description: "Deskripsi runtutan insiden kecelakaan"
    },
    {
      field: "tindakan_penanganan",
      label: "Tindakan Penanganan",
      type: "Text",
      description: "Langkah pertolongan pertama, evakuasi, dan jaminan BPJS Ketenagakerjaan"
    }
  ]
};

// ==========================================
// 3. TEMPLATE: BADAN USAHA JASA KONSTRUKSI (BUJK)
// ==========================================
export const TEMPLATE_BUJK: SipjakiTemplate = {
  id: "bujk",
  moduleName: "Data Badan Usaha Jasa Konstruksi (BUJK)",
  exportFileName: "Data_BUJK_Kab_Bogor_SIPJAKI",
  sheetName: "DATA BUJK",
  enumValidation: {
    type: ["PT", "CV", "Firma", "Koperasi", "Perorangan"],
    qualification: ["Kecil", "Menengah", "Besar"],
    status: ["Aktif", "Menunggu Verifikasi", "Masa Tenggang", "Dibekukan"]
  },
  columns: [
    {
      key: "name",
      label: "Nama Badan Usaha",
      sipjakiLabel: "nama_bujk",
      dataType: "String",
      description: "Nama resmi perusahaan sesuai akta pendirian"
    },
    {
      key: "type",
      label: "Bentuk Badan Usaha",
      sipjakiLabel: "bentuk_usaha",
      dataType: "Enum",
      allowedValues: ["PT", "CV", "Firma", "Koperasi", "Perorangan"],
      description: "Bentuk badan hukum"
    },
    {
      key: "nib",
      label: "Nomor Induk Berusaha (NIB)",
      sipjakiLabel: "nib",
      dataType: "String (13 digit)",
      description: "Nomor Induk Berusaha OSS RBA"
    },
    {
      key: "npwp",
      label: "NPWP Perusahaan",
      sipjakiLabel: "npwp",
      dataType: "String",
      description: "Nomor Pokok Wajib Pajak 15/16 digit"
    },
    {
      key: "qualification",
      label: "Kualifikasi BUJK",
      sipjakiLabel: "kualifikasi",
      dataType: "Enum",
      allowedValues: ["Kecil", "Menengah", "Besar"],
      description: "Kualifikasi permodalan & kemampuan usaha"
    },
    {
      key: "leader",
      label: "Penanggung Jawab / Direktur",
      sipjakiLabel: "penanggung_jawab",
      dataType: "String",
      description: "Nama pimpinan perusahaan"
    },
    {
      key: "district",
      label: "Kecamatan Domisili",
      sipjakiLabel: "kecamatan",
      dataType: "String",
      description: "Kecamatan kantor operasional di Kab. Bogor"
    },
    {
      key: "address",
      label: "Alamat Kantor",
      sipjakiLabel: "alamat_kantor",
      dataType: "Text",
      description: "Alamat lengkap perusahaan"
    },
    {
      key: "phone",
      label: "No. Telepon / WhatsApp",
      sipjakiLabel: "no_kontak",
      dataType: "String",
      description: "Nomor kontak resmi perusahaan"
    },
    {
      key: "email",
      label: "Alamat Email",
      sipjakiLabel: "email",
      dataType: "Email",
      description: "Email resmi korespondensi"
    },
    {
      key: "sbuCount",
      label: "Jumlah SBU Aktif",
      sipjakiLabel: "jumlah_sbu",
      dataType: "Integer",
      description: "Jumlah Sertifikat Badan Usaha yang terdaftar"
    },
    {
      key: "sbuExpiry",
      label: "Masa Berlaku SBU",
      sipjakiLabel: "kadaluarsa_sbu",
      dataType: "Date (YYYY-MM-DD)",
      description: "Batas akhir masa berlaku SBU terdekat"
    },
    {
      key: "status",
      label: "Status Kepatuhan",
      sipjakiLabel: "status_operasional",
      dataType: "Enum",
      allowedValues: ["Aktif", "Menunggu Verifikasi", "Masa Tenggang", "Dibekukan"],
      description: "Status keaktifan izin berusaha"
    }
  ],
  importColumns: [
    { key: "name", label: "Nama Badan Usaha", required: true, example: "PT Bangun Jaya Konstruksi" },
    { key: "type", label: "Bentuk Usaha", required: true, example: "PT" },
    { key: "nib", label: "NIB (13 digit)", required: true, example: "1234567890123" },
    { key: "npwp", label: "NPWP Perusahaan", required: true, example: "01.234.567.8-012.000" },
    { key: "qualification", label: "Kualifikasi", required: true, example: "Besar" },
    { key: "leader", label: "Penanggung Jawab", required: false, example: "Ir. Ahmad Suryadi" },
    { key: "district", label: "Kecamatan", required: true, example: "Cibinong" },
    { key: "address", label: "Alamat Kantor", required: false, example: "Jl. Raya Bogor No. 123" },
    { key: "phone", label: "No. Kontak", required: false, example: "081234567890" },
    { key: "email", label: "Email", required: false, example: "info@bangunjaya.co.id" },
    { key: "sbuCount", label: "Jumlah SBU", required: false, example: "3" },
    { key: "sbuExpiry", label: "Masa Berlaku SBU", required: false, example: "2027-06-15" },
    { key: "status", label: "Status", required: false, example: "Aktif" }
  ],
  sampleRows: [
    {
      name: "PT Bangun Jaya Konstruksi",
      type: "PT",
      nib: "1234567890123",
      npwp: "01.234.567.8-012.000",
      qualification: "Besar",
      leader: "Ir. Ahmad Suryadi",
      district: "Cibinong",
      address: "Jl. Raya Bogor No. 123, Cibinong",
      phone: "081234567890",
      email: "info@bangunjaya.co.id",
      sbuCount: 3,
      sbuExpiry: "2027-06-15",
      status: "Aktif"
    }
  ],
  dictionaryItems: [
    {
      field: "nama_bujk",
      label: "Nama Badan Usaha",
      type: "String",
      description: "Nama perusahaan BUJK terdaftar"
    },
    {
      field: "nib",
      label: "NIB",
      type: "String (13 digit)",
      description: "Nomor Induk Berusaha pada OSS-RBA (tepat 13 angka)"
    },
    {
      field: "kualifikasi",
      label: "Kualifikasi",
      type: "Enum",
      description: "Tingkatan modal dan klasifikasi usaha",
      allowedValues: ["Kecil", "Menengah", "Besar"]
    },
    {
      field: "status_operasional",
      label: "Status Kepatuhan",
      type: "Enum",
      description: "Status legalitas SBU",
      allowedValues: ["Aktif", "Menunggu Verifikasi", "Masa Tenggang", "Dibekukan"]
    }
  ]
};

// ==========================================
// 4. TEMPLATE: PELATIHAN & TKK SIPJAKI
// ==========================================
export const TEMPLATE_PELATIHAN: SipjakiTemplate = {
  id: "pelatihan",
  moduleName: "Pelatihan & Sertifikasi Tenaga Kerja Konstruksi",
  exportFileName: "Data_Pelatihan_TKK_SIPJAKI_Kab_Bogor",
  sheetName: "DATA PELATIHAN",
  enumValidation: {
    status: ["Rencana", "Berjalan", "Selesai"],
    skkLevel: [
      "Jenjang 1-2 (Operator/Tukang)",
      "Jenjang 3-4 (Teknisi Muda)",
      "Jenjang 5 (Teknisi/Analis)",
      "Jenjang 6 (Teknisi Ahli)",
      "Jenjang 7 (Ahli Muda)",
      "Jenjang 8 (Ahli Madya)",
      "Jenjang 9 (Ahli Utama)"
    ]
  },
  columns: [
    {
      key: "title",
      label: "Nama Kegiatan Pelatihan",
      sipjakiLabel: "nama_kegiatan",
      dataType: "String",
      description: "Judul kegiatan bimtek / sertifikasi TKK"
    },
    {
      key: "category",
      label: "Kategori Bidang",
      sipjakiLabel: "kategori_keahlian",
      dataType: "String",
      description: "Bidang keilmuan (K3, Tenaga Terampil, Pengawas, dll.)"
    },
    {
      key: "skkLevel",
      label: "Jenjang Kualifikasi SKK",
      sipjakiLabel: "jenjang_skk",
      dataType: "Enum",
      allowedValues: [
        "Jenjang 1-2 (Operator/Tukang)",
        "Jenjang 3-4 (Teknisi Muda)",
        "Jenjang 5 (Teknisi/Analis)",
        "Jenjang 6 (Teknisi Ahli)",
        "Jenjang 7 (Ahli Muda)",
        "Jenjang 8 (Ahli Madya)",
        "Jenjang 9 (Ahli Utama)"
      ],
      description: "Jenjang SKK sesuai Permen PUPR"
    },
    {
      key: "batch",
      label: "Gelombang / Angkatan",
      sipjakiLabel: "angkatan",
      dataType: "String",
      description: "Angkatan dan tahun pelaksanaan"
    },
    {
      key: "startDate",
      label: "Tanggal Mulai",
      sipjakiLabel: "tanggal_mulai",
      dataType: "Date (YYYY-MM-DD)",
      description: "Tanggal pembukaan pelatihan"
    },
    {
      key: "endDate",
      label: "Tanggal Selesai",
      sipjakiLabel: "tanggal_selesai",
      dataType: "Date (YYYY-MM-DD)",
      description: "Tanggal penutupan pelatihan"
    },
    {
      key: "location",
      label: "Lokasi Pelaksanaan",
      sipjakiLabel: "lokasi_kegiatan",
      dataType: "String",
      description: "Tempat penyelenggaraan pelatihan"
    },
    {
      key: "quota",
      label: "Target Kuota Peserta",
      sipjakiLabel: "kuota_peserta",
      dataType: "Integer",
      description: "Kapasitas kuota peserta"
    },
    {
      key: "registered",
      label: "Peserta Terdaftar",
      sipjakiLabel: "peserta_terdaftar",
      dataType: "Integer",
      description: "Jumlah peserta yang hadir mengikuti"
    },
    {
      key: "passed",
      label: "Peserta Lulus / Kompeten",
      sipjakiLabel: "peserta_lulus",
      dataType: "Integer",
      description: "Jumlah peserta yang dinyatakan kompeten"
    },
    {
      key: "status",
      label: "Status Kegiatan",
      sipjakiLabel: "status_pelatihan",
      dataType: "Enum",
      allowedValues: ["Rencana", "Berjalan", "Selesai"],
      description: "Status tahapan kegiatan saat ini"
    },
    {
      key: "organizer",
      label: "Penyelenggara / Mitra Asosiasi",
      sipjakiLabel: "mitra_penyelenggara",
      dataType: "String",
      description: "LSP / Balai Jasa Konstruksi / Asosiasi mitra"
    }
  ],
  importColumns: [
    { key: "title", label: "Nama Kegiatan Pelatihan", required: true, example: "Bimtek SMKK Petugas K3" },
    { key: "category", label: "Kategori Bidang", required: true, example: "K3 Konstruksi" },
    { key: "skkLevel", label: "Jenjang SKK", required: true, example: "Jenjang 5 (Teknisi/Analis)" },
    { key: "batch", label: "Gelombang", required: false, example: "Angkatan I / 2026" },
    { key: "startDate", label: "Tanggal Mulai", required: true, example: "2026-04-10" },
    { key: "endDate", label: "Tanggal Selesai", required: true, example: "2026-04-14" },
    { key: "location", label: "Lokasi", required: true, example: "Auditorium DPU Kab. Bogor" },
    { key: "quota", label: "Kuota Peserta", required: true, example: "40" },
    { key: "registered", label: "Peserta Terdaftar", required: false, example: "40" },
    { key: "passed", label: "Peserta Lulus", required: false, example: "38" },
    { key: "status", label: "Status", required: false, example: "Selesai" },
    { key: "organizer", label: "Penyelenggara / Mitra", required: false, example: "DPU Kab. Bogor & Balai Jakon Wilayah III" }
  ],
  sampleRows: [
    {
      title: "Bimtek SMKK (Sistem Manajemen Keselamatan Konstruksi) Petugas K3",
      category: "K3 Konstruksi",
      skkLevel: "Jenjang 5 (Teknisi/Analis)",
      batch: "Angkatan I / 2026",
      startDate: "2026-04-10",
      endDate: "2026-04-14",
      location: "Auditorium Dinas PU Kab. Bogor",
      quota: 40,
      registered: 40,
      passed: 38,
      status: "Selesai",
      organizer: "Bidang Jasa Konstruksi DPU bekerjasama dengan Balai Jasa Konstruksi Wilayah III"
    }
  ],
  dictionaryItems: [
    {
      field: "nama_kegiatan",
      label: "Nama Kegiatan",
      type: "String",
      description: "Nama resmi pelatihan / sertifikasi"
    },
    {
      field: "jenjang_skk",
      label: "Jenjang SKK",
      type: "Enum",
      description: "Level jenjang sertifikat kompetensi (Jenjang 1 s/d 9)",
      allowedValues: ["Jenjang 1-2 (Operator/Tukang)", "Jenjang 3-4 (Teknisi Muda)", "Jenjang 5 (Teknisi/Analis)", "Jenjang 6 (Teknisi Ahli)", "Jenjang 7 (Ahli Muda)", "Jenjang 8 (Ahli Madya)", "Jenjang 9 (Ahli Utama)"]
    },
    {
      field: "peserta_lulus",
      label: "Peserta Lulus",
      type: "Integer",
      description: "Jumlah peserta yang dinyatakan kompeten dan diterbitkan SKK"
    }
  ]
};

// ==========================================
// 5. TEMPLATE: PELAKSANAAN AUDIT SIMAK
// ==========================================
export const TEMPLATE_PELAKSANAAN: SipjakiTemplate = {
  id: "pelaksanaan-simak",
  moduleName: "Hasil Audit SIMAK Pengawasan Jakon",
  exportFileName: "Hasil_Audit_SIMAK_Kab_Bogor_SIPJAKI",
  sheetName: "DATA AUDIT SIMAK",
  enumValidation: {
    tertibType: ["tertib-usaha", "tertib-penyelenggaraan", "tertib-pemanfaatan"],
    kategoriHasil: ["Tertib", "Kurang Tertib", "Tidak Tertib"],
    statusVerifikasi: ["Draft", "Terverifikasi", "Ditolak"]
  },
  columns: [
    {
      key: "simakCode",
      label: "Kode Instrumen SIMAK",
      sipjakiLabel: "kode_simak",
      dataType: "String",
      description: "Kode formulir SIMAK Permen PUPR 1/2023 (e.g. SIMAK 1a1, SIMAK 2c)"
    },
    {
      key: "namaObjek",
      label: "Nama Objek Pengawasan",
      sipjakiLabel: "objek_pengawasan",
      dataType: "String",
      description: "Nama proyek fisik, BUJK, atau bangunan publik yang diaudit"
    },
    {
      key: "badanUsaha",
      label: "Badan Usaha / Pengelola",
      sipjakiLabel: "nama_badan_usaha",
      dataType: "String",
      description: "Nama perusahaan penyedia atau dinas pengelola"
    },
    {
      key: "lokasi",
      label: "Lokasi Kecamatan",
      sipjakiLabel: "lokasi_inspeksi",
      dataType: "String",
      description: "Kecamatan lokasi pelaksanaan audit"
    },
    {
      key: "tanggalAudit",
      label: "Tanggal Inspeksi Lapangan",
      sipjakiLabel: "tanggal_inspeksi",
      dataType: "Date (YYYY-MM-DD)",
      description: "Waktu pelaksanaan uji petik / audit lapangan"
    },
    {
      key: "pengawas",
      label: "Petugas / Auditor Jakon",
      sipjakiLabel: "nama_auditor",
      dataType: "String",
      description: "Nama tim pengawas pembina jasa konstruksi"
    },
    {
      key: "skorTertib",
      label: "Skor Kepatuhan (0-100)",
      sipjakiLabel: "skor_kepatuhan",
      dataType: "Integer (0-100)",
      description: "Skor indeks kepatuhan hasil isian instrumen SIMAK"
    },
    {
      key: "kategoriHasil",
      label: "Predikat Hasil Audit",
      sipjakiLabel: "kategori_hasil",
      dataType: "Enum",
      allowedValues: ["Tertib", "Kurang Tertib", "Tidak Tertib"],
      description: "Kesimpulan tingkat kepatuhan regulasi"
    },
    {
      key: "statusVerifikasi",
      label: "Status Verifikasi BAP",
      sipjakiLabel: "status_bap",
      dataType: "Enum",
      allowedValues: ["Draft", "Terverifikasi", "Ditolak"],
      description: "Status pengesahan Berita Acara Pemeriksaan"
    },
    {
      key: "dokumenBAP",
      label: "Nomor / Berkas Berita Acara",
      sipjakiLabel: "dokumen_bap",
      dataType: "String",
      description: "Nama file atau nomor registrasi BAP resmi"
    }
  ],
  importColumns: [
    { key: "simakCode", label: "Kode SIMAK", required: true, example: "SIMAK 1a1" },
    { key: "namaObjek", label: "Objek Pengawasan", required: true, example: "Audit Kelayakan NIB & SBU Konstruksi" },
    { key: "badanUsaha", label: "Badan Usaha / Pelaksana", required: true, example: "PT. Pakuan Graha Konstruksi" },
    { key: "lokasi", label: "Lokasi Kecamatan", required: true, example: "Cibinong" },
    { key: "tanggalAudit", label: "Tanggal Audit", required: true, example: "2026-03-12" },
    { key: "pengawas", label: "Auditor Pengawas", required: false, example: "Ir. Hendra Setiawan, S.T." },
    { key: "skorTertib", label: "Skor Kepatuhan", required: true, example: "92" },
    { key: "kategoriHasil", label: "Hasil Audit", required: true, example: "Tertib" },
    { key: "statusVerifikasi", label: "Status BAP", required: false, example: "Terverifikasi" }
  ],
  sampleRows: [
    {
      simakCode: "SIMAK 1a1",
      namaObjek: "Audit Kelayakan NIB & SBU Konstruksi",
      badanUsaha: "PT. Pakuan Graha Konstruksi",
      lokasi: "Kecamatan Cibinong",
      tanggalAudit: "2026-03-12",
      pengawas: "Ir. Hendra Setiawan, S.T.",
      skorTertib: 92,
      kategoriHasil: "Tertib",
      statusVerifikasi: "Terverifikasi",
      dokumenBAP: "BAP_SIMAK_1a1_PakuanGraha.pdf"
    }
  ],
  dictionaryItems: [
    {
      field: "kode_simak",
      label: "Kode SIMAK",
      type: "String",
      description: "Kode instrumen SIMAK (1a1, 1a2, 1b, 2a, 2b, 2c, 3a, dll.)"
    },
    {
      field: "skor_kepatuhan",
      label: "Skor Kepatuhan",
      type: "Integer (0-100)",
      description: "Persentase kepatuhan indikator SIMAK"
    },
    {
      field: "kategori_hasil",
      label: "Predikat Hasil",
      type: "Enum",
      description: "Hasil penilaian akhir",
      allowedValues: ["Tertib", "Kurang Tertib", "Tidak Tertib"]
    }
  ]
};

// ==========================================
// 6. TEMPLATE: REKOMENDASI & TINDAK LANJUT
// ==========================================
export const TEMPLATE_REKOMENDASI: SipjakiTemplate = {
  id: "rekomendasi",
  moduleName: "Rekomendasi Pembinaan & Tindak Lanjut",
  exportFileName: "Data_Rekomendasi_Pengawasan_SIPJAKI",
  sheetName: "DATA REKOMENDASI",
  enumValidation: {
    tingkatUrgensi: ["Ringan", "Sedang", "Tinggi", "Kritis"],
    statusTindakLanjut: ["Menunggu Respons", "Dalam Proses", "Selesai Diverifikasi", "Melewati Batas Waktu"]
  },
  columns: [
    {
      key: "nomorSurat",
      label: "Nomor Surat Rekomendasi",
      sipjakiLabel: "nomor_surat_rekomendasi",
      dataType: "String",
      description: "Nomor surat dinas instruksi tindak lanjut pembinaan"
    },
    {
      key: "badanUsahaAtauObjek",
      label: "Badan Usaha / Objek Proyek",
      sipjakiLabel: "entitas_terperiksa",
      dataType: "String",
      description: "Pihak yang menerima surat rekomendasi perbaikan"
    },
    {
      key: "temuanUtama",
      label: "Uraian Temuan Ketidaktertiban",
      sipjakiLabel: "uraian_temuan",
      dataType: "Text",
      description: "Fakta ketidaksesuaian yang ditemukan saat audit lapangan"
    },
    {
      key: "butirRekomendasi",
      label: "Instruksi Perbaikan Teknis",
      sipjakiLabel: "butir_instruksi_perbaikan",
      dataType: "Text",
      description: "Langkah konkrit yang wajib dipenuhi oleh penyedia/pemilik"
    },
    {
      key: "tingkatUrgensi",
      label: "Tingkat Urgensi",
      sipjakiLabel: "tingkat_urgensi",
      dataType: "Enum",
      allowedValues: ["Ringan", "Sedang", "Tinggi", "Kritis"],
      description: "Tingkat risiko keselamatan atau kontraktual"
    },
    {
      key: "batasWaktu",
      label: "Batas Waktu Pemenuhan (Deadline)",
      sipjakiLabel: "batas_waktu_tindak_lanjut",
      dataType: "Date (YYYY-MM-DD)",
      description: "Tenggat waktu penyampaian bukti tindak lanjut perbaikan"
    },
    {
      key: "statusTindakLanjut",
      label: "Status Kepatuhan Rekomendasi",
      sipjakiLabel: "status_penyelesaian",
      dataType: "Enum",
      allowedValues: ["Menunggu Respons", "Dalam Proses", "Selesai Diverifikasi", "Melewati Batas Waktu"],
      description: "Status pemenuhan instruksi perbaikan"
    },
    {
      key: "picTindakLanjut",
      label: "PIC / Tim Verifikator Jakon",
      sipjakiLabel: "petugas_verifikator",
      dataType: "String",
      description: "Nama petugas pembina yang memvalidasi bukti tindak lanjut"
    }
  ],
  importColumns: [
    { key: "nomorSurat", label: "Nomor Surat", required: true, example: "600.1.2/142/DPUPR-JAKON/2026" },
    { key: "badanUsahaAtauObjek", label: "Badan Usaha / Objek", required: true, example: "CV. Baraya Cipta Mandiri" },
    { key: "temuanUtama", label: "Uraian Temuan", required: true, example: "4 orang tukang belum memiliki SKK." },
    { key: "butirRekomendasi", label: "Instruksi Perbaikan", required: true, example: "Ikutkan tenaga kerja dalam sertifikasi SKK." },
    { key: "tingkatUrgensi", label: "Tingkat Urgensi", required: true, example: "Sedang" },
    { key: "batasWaktu", label: "Batas Waktu", required: true, example: "2026-04-18" },
    { key: "statusTindakLanjut", label: "Status", required: false, example: "Dalam Proses" },
    { key: "picTindakLanjut", label: "PIC Verifikator", required: false, example: "Ir. Hendra Setiawan, S.T." }
  ],
  sampleRows: [
    {
      nomorSurat: "600.1.2/142/DPUPR-JAKON/2026",
      badanUsahaAtauObjek: "CV. Baraya Cipta Mandiri",
      temuanUtama: "4 orang tukang pasang bata dan juru ukur belum memiliki sertifikat SKK aktif.",
      butirRekomendasi: "Wajib mengikutsertakan tenaga kerja dalam program fasilitasi sertifikasi TKK DPU Kab. Bogor TA 2026.",
      tingkatUrgensi: "Sedang",
      batasWaktu: "2026-04-18",
      statusTindakLanjut: "Dalam Proses",
      picTindakLanjut: "Ir. Hendra Setiawan, S.T."
    }
  ],
  dictionaryItems: [
    {
      field: "nomor_surat_rekomendasi",
      label: "Nomor Surat Rekomendasi",
      type: "String",
      description: "Nomor registrasi surat dinas rekomendasi"
    },
    {
      field: "tingkat_urgensi",
      label: "Tingkat Urgensi",
      type: "Enum",
      description: "Skala prioritas penanganan temuan",
      allowedValues: ["Ringan", "Sedang", "Tinggi", "Kritis"]
    },
    {
      field: "status_penyelesaian",
      label: "Status Kepatuhan",
      type: "Enum",
      description: "Status verifikasi tindak lanjut",
      allowedValues: ["Menunggu Respons", "Dalam Proses", "Selesai Diverifikasi", "Melewati Batas Waktu"]
    }
  ]
};

// ==========================================
// REGISTRY TEMPLATE
// ==========================================
export const ALL_SIPJAKI_TEMPLATES: Record<string, SipjakiTemplate> = {
  "paket-pekerjaan": TEMPLATE_PAKET_PEKERJAAN,
  kecelakaan: TEMPLATE_KECELAKAAN,
  bujk: TEMPLATE_BUJK,
  pelatihan: TEMPLATE_PELATIHAN,
  "pelaksanaan-simak": TEMPLATE_PELAKSANAAN,
  rekomendasi: TEMPLATE_REKOMENDASI
};

export function getSipjakiTemplate(id: string): SipjakiTemplate | undefined {
  return ALL_SIPJAKI_TEMPLATES[id];
}

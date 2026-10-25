import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generator Fixture Pengujian Otomasi SIJAKON Kab. Bogor
 * Menghasilkan file uji Excel, CSV, PDF, dan format negatif untuk pengujian batch import & dokumen.
 */

const FIXTURES_DIR = path.resolve(__dirname, 'files');

export function ensureDirectories() {
  const dirs = [
    path.join(FIXTURES_DIR, 'excel'),
    path.join(FIXTURES_DIR, 'csv'),
    path.join(FIXTURES_DIR, 'pdf'),
    path.join(FIXTURES_DIR, 'invalid'),
  ];
  dirs.forEach((d) => {
    if (!fs.existsSync(d)) {
      fs.mkdirSync(d, { recursive: true });
    }
  });
}

// 1. Valid BUJK Batch (5 Baris Valid)
export function createValidBujkExcel() {
  const data = [
    {
      "Nama Badan Usaha": "PT Bogor Bangun Perkasa",
      "Bentuk Usaha": "PT",
      "NIB (13 digit)": "1234567890123",
      "NPWP Perusahaan": "01.234.567.8-012.000",
      "Kualifikasi": "Menengah",
      "Penanggung Jawab": "Ir. Hendra Setiawan, ST",
      "Kecamatan": "Cibinong",
      "Alamat Kantor": "Jl. Tegar Beriman No. 45, Cibinong",
      "Status": "Aktif",
    },
    {
      "Nama Badan Usaha": "CV Cipta Karya Mandiri",
      "Bentuk Usaha": "CV",
      "NIB (13 digit)": "9876543210987",
      "NPWP Perusahaan": "02.345.678.9-023.000",
      "Kualifikasi": "Kecil",
      "Penanggung Jawab": "Dedi Mulyadi",
      "Kecamatan": "Bogor Barat",
      "Alamat Kantor": "Jl. Pajajaran No. 12, Bogor",
      "Status": "Aktif",
    },
    {
      "Nama Badan Usaha": "PT Pakuan Jaya Konstruksi",
      "Bentuk Usaha": "PT",
      "NIB (13 digit)": "1122334455667",
      "NPWP Perusahaan": "03.456.789.0-034.000",
      "Kualifikasi": "Besar",
      "Penanggung Jawab": "Bambang Sujarwo, MT",
      "Kecamatan": "Sentul",
      "Alamat Kantor": "Kawasan Industri Sentul, Bogor",
      "Status": "Aktif",
    },
    {
      "Nama Badan Usaha": "CV Mitra Graha Mandiri",
      "Bentuk Usaha": "CV",
      "NIB (13 digit)": "2233445566778",
      "NPWP Perusahaan": "04.567.890.1-045.000",
      "Kualifikasi": "Kecil",
      "Penanggung Jawab": "Agus Triyono",
      "Kecamatan": "Dramaga",
      "Alamat Kantor": "Jl. Raya Dramaga No. 88, Bogor",
      "Status": "Aktif",
    },
    {
      "Nama Badan Usaha": "PT Bumi Asri Perkasa",
      "Bentuk Usaha": "PT",
      "NIB (13 digit)": "3344556677889",
      "NPWP Perusahaan": "05.678.901.2-056.000",
      "Kualifikasi": "Menengah",
      "Penanggung Jawab": "Siti Nurhaliza, ST",
      "Kecamatan": "Ciawi",
      "Alamat Kantor": "Jl. Raya Ciawi No. 102, Bogor",
      "Status": "Aktif",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DATA BUJK");
  XLSX.writeFile(wb, path.join(FIXTURES_DIR, 'excel', 'valid_bujk_batch.xlsx'));
}

// 2. Invalid BUJK Batch (Untuk Uji Isolasi Error)
export function createInvalidBujkExcel() {
  const data = [
    {
      "Nama Badan Usaha": "PT NIB Kurang Digit",
      "Bentuk Usaha": "PT",
      "NIB (13 digit)": "12345678", // ERROR: Kurang dari 13 digit
      "NPWP Perusahaan": "01.234.567.8-012.000",
      "Kualifikasi": "Menengah",
      "Kecamatan": "Cibinong",
      "Status": "Aktif",
    },
    {
      "Nama Badan Usaha": "", // ERROR: Kolom wajib kosong
      "Bentuk Usaha": "PT",
      "NIB (13 digit)": "9999888877776",
      "NPWP Perusahaan": "01.234.567.8-012.000",
      "Kualifikasi": "Besar",
      "Kecamatan": "Cileungsi",
      "Status": "Aktif",
    },
    {
      "Nama Badan Usaha": "PT Sukses Lolos Validasi",
      "Bentuk Usaha": "PT",
      "NIB (13 digit)": "8888777766665", // VALID
      "NPWP Perusahaan": "01.234.567.8-012.000",
      "Kualifikasi": "Kecil",
      "Penanggung Jawab": "Rian Ardiansyah",
      "Kecamatan": "Bogor Selatan",
      "Alamat Kantor": "Jl. Sudirman No. 9, Bogor",
      "Status": "Aktif",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DATA BUJK");
  XLSX.writeFile(wb, path.join(FIXTURES_DIR, 'excel', 'invalid_bujk_batch.xlsx'));
}

// 3. Valid Paket Pekerjaan Batch
export function createValidPaketPekerjaanExcel() {
  const data = [
    {
      "Tahun Anggaran": 2026,
      "Nama Pekerjaan": "Pembangunan Jembatan Ciliwung Tahap II",
      "Sumber Dana": "APBD",
      "Pengguna Jasa": "Dinas PUPR Kab. Bogor",
      "Nama Penyedia": "PT Bogor Bangun Perkasa",
      "NIB Penyedia": "1234567890123",
      "Nilai Kontrak (Rp)": 15000000000,
      "Status Paket": "Pelaksanaan",
      "Jenis Kontrak": "Konstruksi",
      "Karakteristik Kontrak": "Harga Satuan",
    },
    {
      "Tahun Anggaran": 2026,
      "Nama Pekerjaan": "Rehabilitasi Saluran Drainase Cibinong",
      "Sumber Dana": "DAK",
      "Pengguna Jasa": "Dinas Perumahan Kawasan Permukiman",
      "Nama Penyedia": "CV Cipta Karya Mandiri",
      "NIB Penyedia": "9876543210987",
      "Nilai Kontrak (Rp)": 3500000000,
      "Status Paket": "Pelaksanaan",
      "Jenis Kontrak": "Konstruksi",
      "Karakteristik Kontrak": "Gabungan",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DATA PAKET");
  XLSX.writeFile(wb, path.join(FIXTURES_DIR, 'excel', 'valid_paket_pekerjaan.xlsx'));
}

// 4. Valid CSV Batch File
export function createValidCsv() {
  const csvContent =
    '\uFEFF"Nama Badan Usaha","NIB Penyedia","Bentuk Usaha","Kualifikasi","Alamat Kantor","Status SBU"\n' +
    '"PT Sumber Makmur Sejahtera","4455667788990","Perseroan Terbatas (PT)","Menengah","Jl. Sukahati No. 11, Cibinong","Aktif"\n' +
    '"CV Wijaya Bersama","5566778899001","Persekutuan Komanditer (CV)","Kecil","Jl. Raya Puncak Km 70","Aktif"\n';

  fs.writeFileSync(path.join(FIXTURES_DIR, 'csv', 'valid_bujk_batch.csv'), csvContent, 'utf-8');
}

// 5. Empty Template File (Hanya Header)
export function createEmptyTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    ["Nama Badan Usaha", "NIB Penyedia", "Bentuk Usaha", "Kualifikasi", "Alamat Kantor", "Status SBU"]
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DATA BUJK");
  XLSX.writeFile(wb, path.join(FIXTURES_DIR, 'excel', 'empty_template.xlsx'));
}

// 6. Dokumen PDF Valid & Oversized
export function createPdfFixtures() {
  // Minimal valid PDF binary
  const validPdfHeader =
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000111 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n';

  fs.writeFileSync(path.join(FIXTURES_DIR, 'pdf', 'sample_surat_tugas.pdf'), validPdfHeader);
  fs.writeFileSync(path.join(FIXTURES_DIR, 'pdf', 'sample_bap_pemeriksaan.pdf'), validPdfHeader);
  fs.writeFileSync(path.join(FIXTURES_DIR, 'pdf', 'sample_sbu_legalitas.pdf'), validPdfHeader);

  // File PDF Oversized (8 MB - melebihi batas 2MB/5MB)
  const oversizedBuffer = Buffer.alloc(8 * 1024 * 1024, 'A');
  fs.writeFileSync(path.join(FIXTURES_DIR, 'pdf', 'oversized_document_8mb.pdf'), oversizedBuffer);

  // Format tidak diizinkan (.exe)
  fs.writeFileSync(path.join(FIXTURES_DIR, 'invalid', 'unsupported_format.exe'), Buffer.from('MZ...executable binary dummy'));

  // Corrupted Excel binary
  fs.writeFileSync(path.join(FIXTURES_DIR, 'invalid', 'corrupted_binary.xlsx'), Buffer.from('Corrupted non-zip binary text data'));
}

// Jalankan pembuatan seluruh fixture
export function generateAllFixtures() {
  console.log('--- Mempersiapkan Direktori & File Fixture Uji ---');
  ensureDirectories();
  createValidBujkExcel();
  createInvalidBujkExcel();
  createValidPaketPekerjaanExcel();
  createValidCsv();
  createEmptyTemplate();
  createPdfFixtures();
  console.log('✅ Seluruh berkas uji (Excel, CSV, PDF) berhasil dibuat di:', FIXTURES_DIR);
}

if (require.main === module) {
  generateAllFixtures();
}

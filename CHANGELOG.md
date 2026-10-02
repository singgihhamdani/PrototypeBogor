# 📋 Changelog — SIJAKON Kabupaten Bogor

Semua perubahan penting pada proyek **SIJAKON (Sistem Informasi Jasa Konstruksi) Kabupaten Bogor TA 2026** dicatat dalam dokumen ini. Format changelog mengacu pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/) dan mengikuti kaidah Semantic Versioning.

---

## [Unreleased] / [v1.6.0-rc] — 2026-10-02

### 🚀 Fitur Baru Utama

#### 1. Engine Ekspor/Impor SIPJAKI Native (SheetJS XLSX)
- **`src/lib/export-utils.ts`**: Engine ekspor spreadsheet native menggunakan SheetJS (`xlsx`). Mendukung:
  - `exportToSpreadsheet()`: Ekspor data ke file `.xlsx` multi-sheet (Data + Kamus Data) dengan auto-width kolom.
  - `exportToCSV()`: Ekspor data ke `.csv` ber-UTF-8 BOM agar kompatibel dengan Microsoft Excel Windows.
  - `downloadExcelTemplate()`: Generator template formulir impor `.xlsx` kosong dengan 3 sheet (Data Contoh, Petunjuk Pengisian, Kamus Data).
  - Formatter bawaan: `formatRupiah()`, `formatTanggalIndo()`.
- **`src/lib/sipjaki-templates.ts`**: Definisi 6 template resmi SIPJAKI Kementerian PUPR:
  1. `TEMPLATE_PAKET_PEKERJAAN` — Data proyek fisik, pagu/HPS, sumber dana, progres (17 kolom).
  2. `TEMPLATE_BUJK` — Badan Usaha Jasa Konstruksi, NIB 13-digit, kualifikasi SBU (11 kolom).
  3. `TEMPLATE_PELATIHAN` — Sertifikasi TKK, jenjang KKNI, jabatan kerja SKK (11 kolom).
  4. `TEMPLATE_KECELAKAAN` — Insiden K3, keparahan, investigasi penyebab (14 kolom).
  5. `TEMPLATE_PELAKSANAAN` — Checklist pengawasan SIMAK, skor audit (11 kolom).
  6. `TEMPLATE_REKOMENDASI` — Tindak lanjut dan sanksi administratif (10 kolom).
  - Setiap template berisi: kolom dengan `sipjakiLabel`, `enumValidation`, `sampleRows`, `dictionaryItems`, dan `instructions`.
- **`src/lib/import-validators.ts`**: Validator skema impor data SIPJAKI:
  - `validateNIB()`: Validasi NIB 13-digit numerik (standar OSS RBA).
  - `validateISODate()`: Validasi format tanggal `YYYY-MM-DD` / `DD/MM/YYYY`.
  - `validateEnum()`: Validasi kesesuaian nilai pilihan (case-sensitive).
  - `validateIntegerCurrency()`: Validasi angka murni tanpa simbol Rp/pemisah.
  - `validateProgressPercentage()`: Validasi persentase 0.00–100.00.
- **`src/lib/audit-log.ts`**: Modul pencatatan riwayat operasi ekspor/impor data di localStorage dengan seed data.

#### 2. Halaman Riwayat Audit Trail Ekspor/Impor
- **`src/app/(dashboard)/pengaturan/riwayat-data/page.tsx`**: Halaman riwayat log audit operasi ekspor dan impor data SIPJAKI. Menampilkan tabel kronologis: tanggal, modul, operator, jenis operasi, jumlah baris, dan status.

#### 3. Tab "Standar & Template Integrasi SIPJAKI" (Menggantikan API Fiktif)
- Tab "Integrasi API SIPJAKI" di halaman Pengaturan **dihapus** karena Kementerian PUPR tidak menyediakan public REST API untuk pemda.
- Digantikan oleh tab **"Standar & Template Integrasi SIPJAKI"** yang berisi:
  - Header informasi mekanisme pertukaran data file-based (Spreadsheet XLSX).
  - 6 kartu unduh template resmi dengan tombol "Unduh Template (.xlsx)".
  - 4 ketentuan validasi skema data SIPJAKI (NIB, Tanggal ISO, Numerik Murni, Enum).
  - Diagram alur kerja integrasi 4 langkah.
  - Tautan langsung ke halaman Audit Trail.

### 🛠️ Perubahan & Penyempurnaan (Improvements)

- **`src/components/common/batch-import-modal.tsx`**: Upgrade dari CSV regex parser ke **SheetJS native XLSX/XLS parser**. Fitur baru:
  - Parsing langsung file `.xlsx`, `.xls`, dan `.csv` melalui `XLSX.read()`.
  - Validasi kolom otomatis dengan error cell highlighting (sel merah untuk data invalid).
  - Summary bar: jumlah baris valid vs invalid sebelum commit.
  - Partial commit: hanya baris yang lolos validasi yang di-commit.
- **`src/components/common/data-table-view.tsx`**: Upgrade dengan:
  - Tombol ekspor **"Ekspor XLSX"** dan **"Ekspor CSV"** menggunakan `exportToSpreadsheet()` / `exportToCSV()`.
  - Tombol **"Format SIPJAKI"** dedicated yang menghasilkan berkas dengan header kolom sesuai label resmi Kementerian PUPR (`sipjakiLabel`).
- **Integrasi ekspor/impor SIPJAKI di 7 halaman modul**:
  - `paket-pekerjaan/page.tsx` — Ekspor/impor data paket pekerjaan konstruksi.
  - `bujk/page.tsx` — Ekspor/impor master BUJK.
  - `kecelakaan/page.tsx` — Ekspor/impor laporan insiden K3.
  - `pelaksanaan-view.tsx` — Ekspor/impor checklist pengawasan SIMAK.
  - `rekomendasi-view.tsx` — Ekspor/impor rekomendasi tindak lanjut.
  - `pelaporan-view.tsx` — Ekspor/impor laporan auditor.
  - `sipjaki/pelatihan/page.tsx` — Ekspor/impor data sertifikasi TKK.

### 📁 Struktur Berkas Baru Ditambahkan

```text
prototype/
├── src/app/(dashboard)/
│   └── pengaturan/
│       └── riwayat-data/page.tsx          # Halaman audit trail ekspor/impor
└── src/lib/
    ├── export-utils.ts                    # Engine ekspor XLSX/CSV (SheetJS)
    ├── sipjaki-templates.ts               # 6 template resmi SIPJAKI PUPR
    ├── import-validators.ts               # Validator NIB, tanggal, enum, numerik
    └── audit-log.ts                       # Modul audit trail localStorage
```

### 🧪 Verifikasi & Kualitas Kode
- **TypeScript**: `npx tsc --noEmit` lolos **0 error** (100% type-safe).
- **Browser Testing**: Seluruh tombol unduh template XLSX, ekspor SIPJAKI, dan impor batch terverifikasi fungsional.

---

## [v1.5.0-rc] — 2026-10-02

### 🚀 Fitur Baru Utama

#### 1. Modul Integrasi SIPJAKI Kementerian PUPR TA 2026 (Sprint 1 s.d. Sprint 6)
- **Komponen Shared & Design System Baru**:
  - `src/components/common/batch-import-modal.tsx`: Komponen modular untuk import batch berkas Excel (`.xlsx`, `.xls`) dan CSV (`.csv`) dengan live parser, validasi kolom, dan preview tabel.
  - `src/components/common/data-table-view.tsx`: Komponen data table terstandar dengan sorting, filter, pencarian teks bebas, dan paginasi interaktif.
  - `src/components/common/filter-bar.tsx`: Komponen bar penyaring data (provinsi, kabupaten/kota, status verifikasi, tahun anggaran).
  - `src/components/common/modal-form.tsx`: Komponen modal form adaptif dengan transisi halus dan validasi status loading.
  - `src/components/common/verification-dialog.tsx`: Dialog konfirmasi verifikasi dokumen dan status persetujuan data.
  - `src/components/layout/module-header.tsx`: Header halaman terpadu dengan breadcrumb, legal basis (Permen PUPR No. 1/2023), indikator pilar, dan action buttons.

- **Pilar 1: Pengawasan Tertib Usaha Jasa Konstruksi (`/pengawasan/tertib-usaha`)**:
  - Subtab Perencanaan: Pemetaan Objek, Penjadwalan Audit Lapangan, Pembentukan Tim Pengawas Jakon.
  - Pelaksanaan Audit: Form SIMAK 1.A.1 s/d 1.F untuk izin usaha NIB, kesesuaian SBU/SKK, dan kepatuhan asosiasi.
  - Tindak Lanjut: Surat Peringatan (SP-1, SP-2, SP-3) dan Rekomendasi Sanksi Administratif.

- **Pilar 2: Pengawasan Tertib Penyelenggaraan Jasa Konstruksi (`/pengawasan/tertib-penyelenggaraan`)**:
  - Pemeriksaan kontrak kerja konstruksi, standar K4/SMKK, kepatuhan mutu material, dan uji kelayakan teknis.
  - Subtab Perencanaan, Pelaksanaan, dan Tindak Lanjut terpadu.

- **Pilar 3: Pengawasan Tertib Pemanfaatan Produk Konstruksi (`/pengawasan/tertib-pemanfaatan`)**:
  - Pemeriksaan kelaikan fungsi bangunan publik, umur rencana konstruksi, pemeliharaan berkala, dan dokumen as-built drawing.
  - Subtab Perencanaan, Pelaksanaan, dan Tindak Lanjut terpadu.

- **Pilar 4: SIPJAKI Data Master (`/profil-opd` & `/sipjaki/*`)**:
  - Master Data OPD & Tim Pembina Kab. Bogor dengan filter 38 provinsi dan kabupaten/kota seluruh Indonesia.
  - Modul Rantai Pasok Material & Alat Konstruksi Kab. Bogor (`/sipjaki/rantai-pasok`).
  - Modul Asosiasi BUJK & Asosiasi Profesi Terakreditasi (`/sipjaki/asosiasi`).
  - Modul Standar Biaya Khusus (SBK) & Remunerasi Tenaga Kerja Ahli Kab. Bogor (`/sipjaki/standar-biaya`).

- **Pilar 5: Pelatihan & Fasilitasi Sertifikasi TKK (`/pelatihan/*`)**:
  - Usulan Perencanaan & Proposal Pelatihan KAK (`/pelatihan/perencanaan`).
  - Rekapitulasi Penerbitan Berita Acara (BA) Uji Kompetensi TKK (`/pelatihan/laporan`).
  - Rekapitulasi Statistik Kelulusan TKK per Jabatan Kerja, Jenjang Kualifikasi, dan Kecamatan (`/pelatihan/rekapitulasi`).

#### 2. Fitur Input Data Massal: Batch Import Data (Excel / CSV)
- **1-Click Template Generator**: Tombol unduh template resmi format `.csv` dengan *UTF-8 Byte Order Mark (BOM)* sehingga langsung terbuka rapi di Microsoft Excel Windows tanpa merusak karakter.
- **Smart Native CSV Parser**: Mendukung pemisah tanda koma (`,`) maupun titik-koma (`;`), serta membaca teks ber-koma di dalam tanda kutip secara presisi.
- **Interactive Drag-and-Drop Dropzone**: Pratinjau interaktif, validasi tipe file, dan batas ukuran file 10MB.
- **Terintegrasi pada 4 Modul Kunci**:
  1. Modul Pelatihan TKK: Import batch ratusan penetapan kelulusan Berita Acara LSP/BNSP.
  2. Modul Master OPD: Import batch dinas teknis dan daftar Tim Pembina se-Indonesia.
  3. Modul Pemetaan Objek Audit: Import batch daftar titik proyek/badan usaha di 40 Kecamatan Kab. Bogor untuk Tertib Usaha, Penyelenggaraan, dan Pemanfaatan.
  4. Modul Paket Pekerjaan: Import batch daftar tender proyek APBD/DAK Kab. Bogor TA 2026.

---

### 🛠️ Perubahan & Penyempurnaan (Improvements)
- **Sidebar Navigation (`src/components/layout/sidebar.tsx`)**:
  - Menata ulang menu menjadi hirarkis dan logis:
    - *Dashboard Utama*
    - *Pilar Pengawasan Jakon* (Tertib Usaha, Tertib Penyelenggaraan, Tertib Pemanfaatan, Rekapitulasi)
    - *Pelatihan & TKK* (Proposal KAK, Laporan BA Uji Kompetensi, Rekapitulasi Lulusan)
    - *Master Data SIPJAKI* (Paket Pekerjaan, Profil OPD, Rantai Pasok, Asosiasi, Standar Biaya)
    - *Layanan Publik & Regulasi* (WebGIS Peta Sebaran, Regulasi Jakon, Lapor Kasus K3)
  - Badge dinamis pada item menu untuk status data aktif dan prioritas.
- **Pembaruan Halaman Regulasi (`src/app/(dashboard)/regulasi/page.tsx`)**:
  - Menambahkan dasar hukum UU No. 2/2017, Permen PUPR No. 1/2023, PP No. 14/2021, dan Perbup Bogor No. 45/2024 beserta viewer metadata dokumen.
- **Pembaruan Halaman Pelaporan K3 (`src/app/(dashboard)/kecelakaan/page.tsx`)**:
  - Formulir investigasi insiden kerja konstruksi, klasifikasi fatality/cedera, dan ekspor formulir standar K3.

---

### 📁 Struktur Berkas Baru Ditambahkan

```text
prototype/
├── src/app/(dashboard)/
│   ├── pelatihan/
│   │   ├── perencanaan/page.tsx
│   │   ├── laporan/page.tsx
│   │   └── rekapitulasi/page.tsx
│   ├── pengawasan/
│   │   ├── tertib-usaha/
│   │   │   ├── perencanaan/pemetaan/page.tsx
│   │   │   ├── perencanaan/penjadwalan/page.tsx
│   │   │   ├── perencanaan/tim/page.tsx
│   │   │   ├── pelaksanaan/page.tsx
│   │   │   └── tindak-lanjut/page.tsx
│   │   ├── tertib-penyelenggaraan/
│   │   │   ├── perencanaan/pemetaan/page.tsx
│   │   │   ├── pelaksanaan/page.tsx
│   │   │   └── tindak-lanjut/page.tsx
│   │   ├── tertib-pemanfaatan/
│   │   │   ├── perencanaan/pemetaan/page.tsx
│   │   │   ├── pelaksanaan/page.tsx
│   │   │   └── tindak-lanjut/page.tsx
│   │   └── komponen/page.tsx
│   └── sipjaki/
│       ├── rantai-pasok/page.tsx
│       ├── asosiasi/page.tsx
│       └── standar-biaya/page.tsx
├── src/components/
│   ├── common/
│   │   ├── batch-import-modal.tsx
│   │   ├── data-table-view.tsx
│   │   ├── filter-bar.tsx
│   │   ├── modal-form.tsx
│   │   ├── verification-dialog.tsx
│   │   └── index.ts
│   ├── layout/
│   │   └── module-header.tsx
│   └── tertib/
│       ├── perencanaan-subtab-nav.tsx
│       └── views/
│           ├── perencanaan-pemetaan-view.tsx
│           ├── perencanaan-penjadwalan-view.tsx
│           ├── perencanaan-tim-view.tsx
│           ├── pelaksanaan-view.tsx
│           └── tindak-lanjut-view.tsx
├── src/data/
│   ├── opd-master.ts
│   └── tertib-mock-data.ts
└── src/lib/
    └── tertib-config.ts
```

---

### 🧪 Verifikasi & Kualitas Kode
- **TypeScript**: `npx tsc --noEmit` lolos **0 error** (100% type-safe).
- **Next.js Dev Server**: Kompatibel penuh dengan Next.js 16 (React 19).
- **Browser Subagent Testing**: Uji coba interaktif pengunduhan template CSV, drag-and-drop berkas, dan navigasi modul berhasil tanpa runtime error.

# 📋 Changelog — SIJAKON Kabupaten Bogor

Semua perubahan penting pada proyek **SIJAKON (Sistem Informasi Jasa Konstruksi) Kabupaten Bogor TA 2026** dicatat dalam dokumen ini. Format changelog mengacu pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/) dan mengikuti kaidah Semantic Versioning.

---

## [v1.8.0] — 2026-10-19

### 🤖 SIJAKON AI Copilot & Data Insights Assistant
- **`src/components/common/ai-copilot-drawer.tsx`**:
  - Implementasi **Floating Action Trigger Button (FAB)** melayang di pojok kanan bawah dengan aksen emas PUPR dan status live indicator.
  - Panel drawer chat responsif desktop & mobile yang dilengkapi riwayat pesan, context indicator halaman aktif, quick suggestion chips, dan input teks interaktif.
  - *Context-aware chips*: Saran pertanyaan otomatis menyesuaikan halaman yang dibuka pengguna (`/paket-pekerjaan`, `/bujk`, `/regulasi`, `/pelatihan`, `/kecelakaan`, dsb.).
- **`src/components/common/ai-action-card.tsx`**:
  - Komponen kartu aksi cerdas di dalam bubble chat untuk navigasi langsung (*deep-linking*) ke detail proyek, peta WebGIS, atau ekspor Excel.
- **`src/lib/ai/ai-data-engine.ts`**:
  - Mesin analitik data terintegrasi yang menghitung deviasi proyek kritis (Kurva-S), serapan anggaran fisik vs keuangan APBD/DAK/APBN, masa berlaku SBU BUJK, keselamatan kerja K3, serta capaian target 500 TKK tahun 2026.
  - Generator *Executive Summary Brief* otomatis untuk bahan rapat koordinasi pimpinan.
- **`src/lib/ai/ai-rag-engine.ts`**:
  - Mesin pencarian regulasi berbasis RAG (*Retrieval Augmented Generation*) yang mengindeks 11 dokumen dasar hukum (UU 2/2017, PP 22/2020 jo PP 14/2021, Permen PUPR 1/2023, Perda Jabar 6/2024, dll.) lengkap dengan sitasi pasal dan modul terkait.
- **`src/lib/ai/ai-copilot-service.ts`**:
  - Layanan orkestrasi chat cerdas yang menggabungkan *Data Engine*, *RAG Engine*, role-aware filtering, dan FAQ panduan penggunaan sistem.
- **`src/app/(dashboard)/layout.tsx`**:
  - Pemasangan `AiCopilotDrawer` secara global di layout dashboard utama sehingga selalu siap diakses di seluruh menu.

### 📗 Penyempurnaan Modul Upload Batch Excel (.xlsx) & CSV
- **`src/app/(dashboard)/pelatihan/page.tsx`**:
  - Integrasi tombol **`[📗 Import Excel]`** dan `BatchImportModal` dengan `TEMPLATE_PELATIHAN`.
  - Integrasi tombol **`[📥 Export SIPJAKI]`** dengan format multi-sheet (Data, Petunjuk, & Kamus Data).

### 🎨 Desain & UI/UX Refinement
- **`src/app/(dashboard)/dashboard/page.tsx`**:
  - Refaktor 4 kartu metrik utama (KPI Summary Cards) menerapkan **Opsi 1 (Inline Trend Pill & Full-Width Subtitle)**.
  - Memindahkan badge tren ke samping angka utama (baseline alignment) dengan `white-space: nowrap` untuk mencegah badge terlipat 2 baris.
  - Memberikan lebar 100% penuh untuk teks keterangan sub-kategori, meniadakan pemotongan teks terpotong (*truncation ellipsis* `...`), dan mengeliminasi redundansi kalimat.

---

## [v1.7.0] — 2026-10-18

### 🏛️ Basis Kebijakan, Regulasi & Dasar Hukum Jasa Konstruksi

#### 1. Katalog & Matriks Regulasi Kebijakan Lengkap
- **`src/data/regulations.json`**: Pemutakhiran dataset regulasi dengan 11 perundang-undangan pokok yang mendasari pembentukan sub-urusan jasa konstruksi dan modul operasional SIJAKON Bogor:
  1. **UU No. 2/2017 jo. UU No. 6/2023** — Undang-Undang Jasa Konstruksi (Penetapan Perppu Cipta Kerja).
  2. **PP No. 22/2020 jo. PP No. 14/2021** — Peraturan Pelaksanaan UU Jasa Konstruksi, standar K4 & perizinan berusaha.
  3. **Perpres No. 12/2021 jo. Perpres No. 16/2018** — Pengadaan Barang/Jasa Pemerintah & paket pekerjaan APBD.
  4. **Permen PUPR No. 9/2020** — Pembentukan LPJK, lisensi LSBU/LSP, dan validasi registri SBU/SKK.
  5. **Permen PUPR No. 1/2023** — Pedoman Pengawasan Penyelenggaraan Jasa Konstruksi oleh Pemda (rujukan modul SIMAK).
  6. **Perda Prov. Jawa Barat No. 6/2024** — Pembinaan dan Pengawasan Jasa Konstruksi di Daerah Provinsi Jawa Barat.
  7. **SE Dirjen Bina Konstruksi No. 299/SE/D/2025** — Pedoman Penilaian Evaluasi (PE) Kinerja Pengawasan OPD Jakon.
  8. **PP No. 16/2021** — Pelaksanaan UU Bangunan Gedung (Ketentuan SIMBG, PBG, SLF, dan Tertib Pemanfaatan).
  9. **Permen PUPR No. 10/2021 & SOP K07.07** — Penerapan SMKK dan SOP Penilaian Evaluasi Penerapan SMKK.
  10. **Perda Kab. Bogor No. 2/2020** — Penyelenggaraan Jasa Konstruksi di Kabupaten Bogor (regulasi induk daerah).
  11. **SE Bupati Bogor No. 600/188-DPU/2025** — Kewajiban TKK bersertifikat kompetensi kerja pada proyek Pemda.
- **`src/app/(dashboard)/regulasi/page.tsx`**:
  - Penambahan highlight box **"🏛️ Dasar Kebijakan & Mandat Sistem SIJAKON"** di setiap kartu katalog regulasi.
  - Penambahan badge **"Modul Terkait"** yang menghubungkan setiap regulasi ke fitur SIJAKON (misal: *Pengawasan 3 Tertib, Executive Dashboard, Rantai Pasok, Evaluasi Kinerja PE*).
  - Integrasi tombol unduh salinan berkas resmi (PDF) langsung dari repositori `/docs/aturan/`.
  - Filter kategori responsif 10 kategori regulasi dan pencarian kata kunci cerdas lintas nomor, judul, mandat, dan modul.
  - Modal detail interaktif dengan ringkasan pokok pengaturan, mandat sistem, serta tautan berkas resmi.

#### 2. Dokumentasi & Berkas Fisik Aturan
- **`docs/DASAR_HUKUM_DAN_KEBIJAKAN.md`**: Dokumen komprehensif matriks regulasi, hierarki perundang-undangan, pemetaan pasal-pasal kewenangan daerah, dan inventaris berkas fisik di repositori.
- **`prototype/public/docs/aturan/`**: Penyalinan berkas PDF resmi dari `docs/ATURAN/` ke direktori publik web app agar dapat diunduh langsung oleh pengguna.

### 🎨 Audit & Perbaikan UI/UX Menyeluruh Lintas Menu & Sub-Menu

#### 1. WebGIS Peta Interaktif (`/webgis`)
- **Masalah Terdeteksi**: Pada viewport mobile/tablet (< 1024px, khususnya lebar 500px), peta terhimpit menjadi kolom sempit (~100px) akibat grid kaku `1fr 380px`.
- **Perbaikan Diterapkan**:
  - Implementasi kontrol mode responsif: **[🗺️ Peta]**, **[📋 Daftar Proyek]**, dan **[📑 Tumpuk]**.
  - Pada mode Peta: Peta mengambil lebar penuh (100%) dan tinggi proporsional dengan floating pill button untuk berpindah ke daftar.
  - Pada mode Daftar: Kartu proyek mengambil lebar penuh dengan indikator deviasi, progres fisik, dan nilai kontrak.
  - Pada mode Tumpuk: Peta di bagian atas (tinggi 360px) dan daftar proyek di bawahnya dengan scroll sentuh.

#### 2. Detail Paket Pekerjaan (`/paket-pekerjaan/[id]`)
- **Perbaikan**: Mengganti `gridTemplateColumns: "2fr 1fr"` menjadi responsif `1fr` di mobile sehingga Kurva-S dan kartu metadata kontrak tersusun rapi secara vertikal tanpa terhimpit.
- Penyesuaian tinggi canvas grafik Kurva-S (240px di mobile) dan ringkasan metrik 3 kolom menjadi 1 kolom.

#### 3. Detail BUJK (`/bujk/[id]`)
- **Perbaikan**: Mengganti `minmax(320px, 1fr)` menjadi `minmax(min(280px, 100%), 1fr)` untuk mencegah kartu terpotong pada layar smartphone ramping.

#### 4. Hub Pelatihan (`/pelatihan`) & Portal Berita (`/berita`)
- **Perbaikan**: Mengganti grid kartu kaku `minmax(360px, 1fr)` menjadi `minmax(min(300px, 100%), 1fr)` agar kartu program bimtek dan warta tidak overflow ke kanan.

#### 5. Pelaporan SIPJAKI (`/pelaporan`) & Matriks RBAC (`/pengaturan`)
- **Perbaikan**: Menambahkan kelas `.custom-touch-scroll` dan banner indikator gestur horizontal (*"↔ Geser tabel ke samping..."*) pada tabel data lebar.

#### 6. Navigasi Subtab Tertib (`perencanaan-subtab-nav.tsx`)
- **Perbaikan**: Menambahkan scrolling momentum sentuh halus (`custom-touch-scroll`) pada subtab navigasi 6 modul perencanaan.

---

## [v1.6.0-rc] — 2026-10-02

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

#### 5. Standardisasi Nomenklatur Perangkat Daerah (DPU)
- Penyelarasan seluruh nomenklatur dinas dari **DPUPR** menjadi **DPU (Dinas Pekerjaan Umum Kabupaten Bogor)** pada antarmuka aplikasi (sidebar subtitle, kop surat BAP & surat rekomendasi pengawasan, profil OPD, pelatihan), mock data, backend, serta seluruh berkas dokumentasi (`METODOLOGI_PERENCANAAN_SISTEM.md`, `DEPLOYMENT_GUIDE.md`, `METHODOLOGY.md`, `API_SPECIFICATION.md`, dan dokumen referensi KAK/PRD).

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

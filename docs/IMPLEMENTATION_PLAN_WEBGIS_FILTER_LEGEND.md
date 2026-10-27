# IMPLEMENTATION PLAN: PENYEMPURNAAN WEBGIS SIJAKON KABUPATEN BOGOR
**Integrasi Database Supabase Live • Multi-Criteria Filter • Dynamic Progress Markers • Floating GIS Legend**
*Dokumen Rencana Teknis & Verifikasi — Tanpa Ketergantungan Fitur Kurva-S (Status: On Hold)*

---

## 1. Ringkasan Eksekutif & Kondisi Database

### 1.1 Status Konektivitas Supabase (Terverifikasi Live)
Berdasarkan uji koneksi langsung (*automated connectivity test*), aplikasi telah **terhubung 100% secara LIVE** ke Supabase PostgreSQL instance:
* **Host Database:** `https://jzaxzesvmygycumvsjvu.supabase.co`
* **Status Tabel Data:**
  * `paket_pekerjaan`: **8 baris data aktif** (Lengkap dengan atribut spasial `lat`, `lng`, `kode_kecamatan`, `progres_fisik`, `nilai_kontrak`, `sumber_dana`, `status_pekerjaan`).
  * `bujk`: **10 baris data aktif** (Master data rekanan kontraktor terverifikasi).
  * `tkk`: **5 baris data aktif** (Tenaga kerja konstruksi bersertifikat).
* **Indikator UI:** Badge status di WebGIS menampilkan badge hijau `[PostgreSQL (Live)]`.

### 1.2 Batasan Arsitektur (Scope Constraints)
* **Kurva-S Status:** **ON HOLD.**
* Seluruh formula deviasi Kurva-S (`physProgress - planProgress[i]`), time schedule indeks bulanan, dan pemicu Show Cause Meeting (SCM) **tidak akan digunakan** di WebGIS.
* Seluruh visualisasi dan filter murni mengacu pada **Capaian Progres Fisik Riil (`progres_fisik` %)**, **Status Kontrak**, **Sumber Dana**, **Kecamatan**, dan **Nilai Kontrak**.

---

## 2. Arsitektur Komponen WebGIS Target

```
┌────────────────────────────────────────────────────────────────────────┐
│                   WEBGIS PAGE (webgis/page.tsx)                        │
│                                                                        │
│  [Header: Judul, Status Live PostgreSQL, Tombol Segarkan]              │
│  [Filter Bar: Pencarian, Progres Fisik %, Sumber Dana, Status Kontrak] │
├───────────────────────────────────┬────────────────────────────────────┤
│         MAP AREA (70%)            │         SIDEBAR LIST (30%)         │
│   (components/webgis/             │                                    │
│    map-container.tsx)             │  • Header: Total Hasil Filter      │
│                                   │    (Contoh: "5 dari 8 Paket")      │
│  • Basemap (OSM / Satelit Esri)   │  • Total Nilai Anggaran Tersaring  │
│  • Layer 1: Agregat 40 Kecamatan  │  • Card Proyek:                    │
│  • Layer 2: Seluruh Pin Proyek    │    - Nama Paket                    │
│    (Warna sesuai Progres Fisik)   │    - Kecamatan & Penyedia          │
│  • Layer 3: Titik Kantor BUJK     │    - Nilai Kontrak (Rp)            │
│  • Popup Proyek + Link Detail     │    - Progress Bar Fisik Riil (%)   │
│  • [Floating GIS Legend Panel]    │    - Status Kontrak Badge          │
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## 3. Rincian Fitur yang Akan Dibangun

### A. Fitur Multi-Criteria Filter Bar (Atas Peta)
1. **Filter Progres Fisik Riil (`physProgress`):**
   * `Semua Progres (0% - 100%)`
   * `⚪ Belum Mulai (0%)`
   * `🟡 Tahap Awal (1% - 50%)`
   * `🔵 Tahap Lanjutan (51% - 99%)`
   * `🟢 Selesai Fisik (100%)`
2. **Filter Sumber Dana (`source`):**
   * `Semua Sumber Dana` | `APBD Kab. Bogor` | `DAK Fisik` | `APBN / Banprov`
3. **Filter Status Pekerjaan (`status`):**
   * `Semua Status` | `Pelaksanaan` | `Selesai` | `Persiapan`
4. **Filter Skala Nilai Kontrak (`contractValue`):**
   * `Semua Nilai` | `> Rp 5 Miliar (Strategis)` | `Rp 1 - 5 Miliar` | `< Rp 1 Miliar`
5. **Instant Map Search (Pencarian Cepat):**
   * Input teks untuk menyaring nama paket pekerjaan, nama penyedia, atau nama jalan.
6. **Tombol "Reset Semua Filter":**
   * Mengembalikan seluruh filter ke kondisi default dalam 1 klik.

### B. Penyempurnaan Map Container (Peta Geospasial)
1. **Mode Tampilan Layer Proyek:**
   * Menampilkan **seluruh pin proyek secara langsung di level kabupaten** (tanpa mewajibkan klik kecamatan terlebih dahulu), sehingga pimpinan langsung melihat peta sebaran penuh.
2. **Pewarnaan Marker Dinamis Berbasis Progres Fisik Riil:**
   * 🟢 **Hijau (`#059669`):** Proyek Selesai Fisik (`progres_fisik === 100%`)
   * 🔵 **Biru (`#2563EB`):** Tahap Lanjutan (`progres_fisik > 50%`)
   * 🟡 **Oranye/Kuning (`#D97706`):** Tahap Konstruksi Awal (`progres_fisik > 0% && <= 50%`)
   * ⚪ **Abu-abu (`#64748B`):** Belum Mulai (`progres_fisik === 0%`)
3. **Popup Proyek Informatif:**
   * Nama Paket & Nomor ID
   * Pelaksana / Kontraktor & Nilai Kontrak
   * Bar Persentase Progres Fisik Riil
   * Status Kontrak
   * Tombol link: *"Buka Detail Paket &rarr;"* (`/paket-pekerjaan/[id]`)
4. **Basemap Switcher (Pengganti Peta Dasar):**
   * Pilihan 1: **OpenStreetMap Standard** (Peta Jalan & Batas Wilayah)
   * Pilihan 2: **Esri World Imagery (Citra Satelit)** (Foto Udara Resolusi Tinggi)

### C. Floating GIS Legend Panel (Legenda Peta Mengambang)
* Panel mengambang di pojok kiri bawah peta (dapat di-*minimize* / di-*expand*).
* Menampilkan panduan warna pin:
  * 🟢 Selesai (100%)
  * 🔵 Lanjutan (51% - 99%)
  * 🟡 Awal (1% - 50%)
  * ⚪ Belum Mulai (0%)
  * 🏢 Titik BUJK Rekanan
  * ⭕ Gradasi Ukuran Kecamatan (Kepadatan Jumlah Proyek)

---

## 4. Rencana Langkah Kerja (Work Breakdown Structure)

| No | Tahapan | File Target | Estimasi |
| :--- | :--- | :--- | :--- |
| **1** | **Audit & Integrasi State Supabase**<br>Memastikan data `paket_pekerjaan` dari Supabase tersimpan ke state dengan atribut lengkap (tanpa kalkulasi deviasi Kurva-S). | `src/app/(dashboard)/webgis/page.tsx` | Selesai (Terverifikasi) |
| **2** | **Pembuatan Komponen Filter Bar Spasial**<br>Membuat bar filter responsif: filter progres %, sumber dana, status, nilai, dan search box. | `src/app/(dashboard)/webgis/page.tsx` | Tahap 1 |
| **3** | **Refactor Map Container**<br>• Menampilkan marker proyek se-kabupaten secara langsung.<br>• Menerapkan warna marker berbasis progres fisik riil.<br>• Menambahkan Basemap Switcher (OSM vs Satelit Esri).<br>• Menambahkan Popup interaktif dengan link detail paket. | `src/components/webgis/map-container.tsx` | Tahap 2 |
| **4** | **Implementasi Floating GIS Legend**<br>Membuat widget legenda mengambang dengan tombol minimize/expand. | `src/components/webgis/map-legend.tsx`<br>atau inline di map container | Tahap 3 |
| **5** | **Sinkronisasi Sidebar Proyek**<br>Sidebar otomatis menghitung jumlah paket tersaring, akumulasi nilai rupiah, dan daftar kartu proyek yang sesuai filter aktif. | `src/app/(dashboard)/webgis/page.tsx` | Tahap 4 |
| **6** | **Pengujian Fungsional & Browser Verification**<br>Menguji filter di browser, memastikan tidak ada error console, dan verifikasi tampilan desktop serta mobile. | Browser Subagent / E2E Check | Tahap 5 |

---

## 5. Rencana Pengujian & Kriteria Keberhasilan (Acceptance Criteria)

1. **Koneksi Supabase:**
   * Badge indikator di header menampilkan `[PostgreSQL (Live)]` berwarna hijau.
   * Total proyek terhitung 8 paket sesuai database Supabase.
2. **Akurasi Filter:**
   * Saat filter *"Progres: Selesai Fisik (100%)"* dipilih, hanya proyek dengan `physProgress === 100` yang muncul di peta dan sidebar.
   * Saat filter *"Sumber Dana: DAK"* dipilih, hanya paket berstatus DAK yang tampil.
   * Tombol *"Reset Filter"* mengembalikan semua 8 proyek ke layar.
3. **Peta & Legenda:**
   * Pin seluruh proyek langsung terlihat di peta dengan warna sesuai progresnya.
   * Legenda di pojok peta dapat dibaca dengan jelas dan dapat di-*minimize* agar tidak menghalangi peta.
   * Basemap dapat beralih ke citra satelit tanpa error layar putih.
4. **Bebas Error Kurva-S:**
   * Tidak ada teks deviasi Kurva-S, tidak ada istilah SCM, dan tidak ada rumus indeks bulanan yang membingungkan.

---
*Dibuat untuk Tim Pengembang SIJAKON Kabupaten Bogor — Menunggu konfirmasi persetujuan sebelum eksekusi kode.*

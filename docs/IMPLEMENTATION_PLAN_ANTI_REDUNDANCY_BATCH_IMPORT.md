# IMPLEMENTATION PLAN: ANTI-REDUNDANSI & SMART BATCH IMPORT PROGRES
**Sistem Deteksi Baris Ganda • Smart Diff (New vs Update) • Proteksi Regresi Progres**
*SIJAKON KABUPATEN BOGOR — Modul Paket Pekerjaan & Master Data*

---

## 1. Latar Belakang & Masalah (Problem Statement)
Pada saat operator dinas mengunggah berkas Excel laporan progres bulanan:
1. **Risiko ID Ganda dalam 1 Berkas:** Belum ada mekanisme yang mendeteksi jika suatu ID paket (misal `P001`) tercatat dua kali di baris yang berbeda di dalam berkas Excel yang sama.
2. **Ketiadaan Diff Visual (*New* vs *Update*):** Pengguna tidak dapat membedakan di layar pratinjau mana paket yang akan **Dibuat Baru** dan mana yang sekadar **Memperbarui Progres** dari paket lama.
3. **Risiko Penurunan Angka Progres (*Negative Regression*):** Jika berkas lama tidak sengaja terunggah, angka progres fisik yang sudah tinggi (misal 68%) bisa tidak sengaja tertimpa oleh angka lama (misal 55%) tanpa adanya peringatan.
4. **Auto-Generate ID yang Tidak Tepat:** Logika pembuatan ID fallback (`P00${projects.length + i + 1}`) berisiko membuat baris baru alih-alih memperbarui proyek yang sudah ada.

---

## 2. Arsitektur Solusi & Alur Data

```
Berkas Excel/CSV Diunggah
         │
         ▼
[1. PARSER & DEDUPLIKASI INTERNAL]
 • Deteksi apakah ada ID paket ganda di baris-baris Excel.
 • Jika ada ID ganda ➔ Tandai baris dengan error merah & blokir commit.
         │
         ▼
[2. SMART DIFF ENGINE (MATCHING DENGAN DATABASE)]
 • Cocokkan ID Excel dengan daftar proyek eksisting di Supabase:
   ├─ ID Belum Ada ➔ Kategori: [🟢 PAKET BARU]
   ├─ ID Sudah Ada & Progres Berubah ➔ Kategori: [🟡 UPDATE PROGRES] (Tampilkan: 58% ➔ 68%)
   ├─ ID Sudah Ada & Data Identik ➔ Kategori: [⚪ IDENTIK / SKIP]
   └─ ID Sudah Ada & Progres Turun ➔ Kategori: [⚠️ REGRESI TURUN] (Peringatan konfirmasi)
         │
         ▼
[3. MODAL PRATINJAU DENGAN METRIC BANNER]
 • Menampilkan ringkasan: "Total: X | Baru: Y | Update: Z | Identik: W"
 • Filter cepat: [Semua] | [Hanya Update] | [Hanya Baru] | [Bermasalah]
         │
         ▼
[4. ATOMIC COMMIT (UPSERT onConflict "id")]
 • Hanya data valid yang dikirim ke Supabase dengan `.upsert(items, { onConflict: "id" })`.
 • Data eksisting diperbarui secara aman tanpa menduplikasi baris.
```

---

## 3. Rincian Modifikasi Komponen & Kode

### A. Modifikasi Mesin Validator (`src/lib/import-validators.ts`)
1. **Fitur In-Memory Duplicate Detection:**
   * Menambahkan pengecekan Set ID pada baris-baris Excel.
   * Jika ID yang sama ditemukan kembali pada baris berikutnya, tandai sebagai `CellError` dengan severity `"error"`.
2. **Dukungan Context Data Eksisting:**
   * Menerima parameter opsional `existingIds?: Map<string, number>` (ID paket beserta nilai progres fisiknya saat ini di database).
   * Menandai status baris:
     * `isNew`: `boolean` (Apakah paket baru)
     * `isUpdate`: `boolean` (Apakah pembaruan paket lama)
     * `previousProgress`: `number | null` (Nilai progres lama)
     * `isRegression`: `boolean` (Apakah progres turun)

### B. Modifikasi Modal Impor (`src/components/common/batch-import-modal.tsx`)
1. **Kolom Status Tindakan (*Action Status Column*):**
   * Menambahkan kolom visual di tabel preview:
     * 🟢 **`[Paket Baru]`** (Badge hijau)
     * 🟡 **`[Update Progres: A% ➔ B%]`** (Badge kuning dengan rincian perubahan)
     * ⚪ **`[Identik / Tetap]`** (Badge abu-abu)
     * 🔴 **`[ID Duplikat]`** (Badge merah)
2. **Ringkasan Analisis Perubahan (*Diff Summary Bar*):**
   * Di atas tabel preview, tampilkan badge ringkasan:
     * *Total Berkas:* `X baris`
     * *Paket Baru:* `Y baris`
     * *Pembaruan Progres:* `Z baris`
     * *Tidak Berubah:* `W baris`
3. **Proteksi Tombol Simpan:**
   * Tombol *"Simpan ke Basis Data"* dinonaktifkan jika ada baris yang berstatus duplikat internal atau error kritis.

### C. Modifikasi Halaman Paket Pekerjaan (`src/app/(dashboard)/paket-pekerjaan/page.tsx`)
1. **Meneruskan Data Eksisting ke Modal:**
   * Meneruskan daftar `projects` eksisting ke `BatchImportModal` agar modal dapat mencocokkan ID secara langsung.
2. **Penyempurnaan `handleBatchCommit`:**
   * Memastikan pembaruan paket lama mempertahankan data legalitas/kontrak yang sudah ada (tidak menimpa dengan data kosong).
   * Notifikasi hasil: *"Berhasil memproses X paket: Y paket baru ditambahkan, Z progres fisik diperbarui."*

---

## 4. Rencana Langkah Kerja (Work Breakdown Structure)

| No | Tahapan | File Target | Status |
| :--- | :--- | :--- | :--- |
| **1** | **Tambahkan Logika Deduplikasi & Diff di Validator**<br>Pengecekan ID ganda internal dan perbandingan dengan progres database eksisting. | `src/lib/import-validators.ts` | Siap Dikerjakan |
| **2** | **Perbarui Tampilan Preview di Batch Import Modal**<br>Menampilkan kolom badge status (Baru vs Update), nilai delta progres (`58% ➔ 68%`), dan ringkasan diff banner. | `src/components/common/batch-import-modal.tsx` | Siap Dikerjakan |
| **3** | **Integrasikan Context Data Eksisting di Halaman Paket**<br>Menghubungkan state proyek aktif ke modal dan menyempurnakan `handleBatchCommit`. | `src/app/(dashboard)/paket-pekerjaan/page.tsx` | Siap Dikerjakan |
| **4** | **Verifikasi Build & Simulasi Browser**<br>Uji coba kompilasi TypeScript dan simulasi pengunggahan file Excel dengan skenario data baru, data update, dan data duplikat. | Browser / Test Verification | Siap Dikerjakan |

---

## 5. Kriteria Keberhasilan (Acceptance Criteria)

1. **Anti-Duplikasi Internal:**
   * Jika file Excel memiliki 2 baris dengan ID yang sama (misal `P001`), sistem menolak dan menampilkan letak baris yang duplikat.
2. **Kejelasan Aksi Perubahan (*Smart Diff*):**
   * Pengguna dapat melihat dengan jelas paket mana yang merupakan entri baru dan paket mana yang hanya mengalami kenaikan progres fisik.
3. **Integritas Database (Zero Redundancy):**
   * Berapa kali pun berkas dengan ID yang sama diunggah ulang, jumlah total baris pada tabel `paket_pekerjaan` di Supabase **tidak bertambah ganda**, hanya nilai persentase progres fisik yang diperbarui.

---
*Dibuat untuk Tim Pengembang SIJAKON Kabupaten Bogor — Menunggu konfirmasi persetujuan sebelum eksekusi kode.*

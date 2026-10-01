# 📖 Panduan Perubahan & Rilis GitHub (Release & PR Guide)
## Integrasi Penuh SIPJAKI Kementerian PUPR & Fitur Batch Import Data
### Sistem Informasi Jasa Konstruksi (SIJAKON) Kabupaten Bogor TA 2026

Dokumen ini ditujukan bagi tim pengembang, code reviewer, dan pengelola repositori GitHub untuk memahami seluruh perubahan arsitektur, panduan *Pull Request (PR)*, standar komit, serta petunjuk integrasi komponen baru pada repositori **SIJAKON Bogor**.

---

## 📑 Daftar Isi
1. [Ringkasan Perubahan (PR Description Template)](#1-ringkasan-perubahan-pr-description-template)
2. [Panduan Eksekusi Git (Branching & Commit)](#2-panduan-eksekusi-git-branching--commit)
3. [Arsitektur Komponen Baru](#3-arsitektur-komponen-baru)
4. [Panduan Integrasi Fitur Batch Import pada Modul Baru](#4-panduan-integrasi-fitur-batch-import-pada-modul-baru)
5. [Daftar Rute & Halaman Baru](#5-daftar-rute--halaman-baru)
6. [Checklist Pengujian & Quality Assurance](#6-checklist-pengujian--quality-assurance)

---

## 1. Ringkasan Perubahan (PR Description Template)

Salin teks di bawah ini ke dalam deskripsi Pull Request di GitHub:

```markdown
## 📌 Deskripsi Pull Request
Pull Request ini mengintegrasikan seluruh fitur pembinaan dan pengawasan jasa konstruksi dari portal backend **SIPJAKI Kementerian PUPR TA 2026** (5 Pilar Pengawasan & Data Master) serta menambahkan fitur **Batch Import Data (Excel / CSV)** untuk memudahkan admin menginput data massal.

### 🌟 Fitur Utama
1. **5 Pilar Pengawasan Jakon (Permen PUPR No. 1/2023)**:
   - **Pilar 1: Tertib Usaha** (`/pengawasan/tertib-usaha/*`): Pemetaan, penjadwalan, form audit SIMAK 1.A.1 s/d 1.F, dan modul SP/sanksi.
   - **Pilar 2: Tertib Penyelenggaraan** (`/pengawasan/tertib-penyelenggaraan/*`): Audit kontrak, uji mutu, standar K4/SMKK.
   - **Pilar 3: Tertib Pemanfaatan** (`/pengawasan/tertib-pemanfaatan/*`): Audit kelaikan fungsi, umur konstruksi, pemeliharaan.
   - **Pilar 4: SIPJAKI Data Master**: Profil OPD (`/profil-opd`), Rantai Pasok (`/sipjaki/rantai-pasok`), Asosiasi (`/sipjaki/asosiasi`), Standar Biaya (`/sipjaki/standar-biaya`).
   - **Pilar 5: Pelatihan & TKK**: Usulan KAK (`/pelatihan/perencanaan`), Laporan BA Uji Kompetensi (`/pelatihan/laporan`), Rekapitulasi Lulusan (`/pelatihan/rekapitulasi`).
2. **Fitur Batch Import Data (Excel / CSV)**:
   - Komponen reusable `BatchImportModal` dengan 1-click download template CSV (UTF-8 BOM), smart regex CSV parser, drag-and-drop uploader, live validation preview, dan batch commit.
   - Terpasang di: Laporan TKK, Master OPD, Pemetaan Objek Pengawasan, dan Paket Pekerjaan.

### 🛠️ Komponen Shared Baru
- `BatchImportModal` (`src/components/common/batch-import-modal.tsx`)
- `DataTableView` (`src/components/common/data-table-view.tsx`)
- `FilterBar` (`src/components/common/filter-bar.tsx`)
- `ModalForm` (`src/components/common/modal-form.tsx`)
- `VerificationDialog` (`src/components/common/verification-dialog.tsx`)
- `ModuleHeader` (`src/components/layout/module-header.tsx`)

### ✅ Verifikasi & Status
- [x] TypeScript Compilation: 0 error (`npx tsc --noEmit`)
- [x] Kompatibilitas Framework: Next.js 16 (App Router, React 19)
- [x] Pengujian Browser: Flow navigasi, download template, dan modal import terverifikasi
```

---

## 2. Panduan Eksekusi Git (Branching & Commit)

Untuk mengunggah seluruh perubahan ini ke GitHub remote:

### Langkah 1: Buat Branch Baru (Opsional jika ingin via PR)
```bash
git checkout -b feature/sipjaki-integration-batch-import
```

### Langkah 2: Stage Seluruh Perubahan
```bash
git add prototype/
git add docs/
git add CHANGELOG.md
```

### Langkah 3: Buat Commit dengan Format Konvensional
```bash
git commit -m "feat(sipjaki): integrate 5 pillars of construction supervision and batch import modal

- Add reusable BatchImportModal with CSV template generator and smart parser
- Implement 5 pillars of supervision (Tertib Usaha, Penyelenggaraan, Pemanfaatan)
- Implement SIPJAKI master data (OPD, Rantai Pasok, Asosiasi, Standar Biaya)
- Implement TKK training and certification reporting modules
- Reorganize sidebar navigation and update technical documentation"
```

### Langkah 4: Push ke GitHub Remote
```bash
git push -u origin feature/sipjaki-integration-batch-import
```

---

## 3. Arsitektur Komponen Baru

### Diagram Alur `BatchImportModal`
```text
[ Tombol Action di Header / Toolbar ]
                │
                ▼ Klik
┌────────────────────────────────────────────────────────┐
│               Modal: BatchImportModal                  │
│                                                        │
│  1. [ Unduh Template CSV Baku ] ──► (File .csv + UTF-8)│
│                                                        │
│  2. [ Drag & Drop Berkas .csv / .xlsx ]                │
│       │                                                │
│       ▼                                                │
│  3. [ Smart CSV Parser Engine ]                        │
│       ├─ Mendeteksi pemisah (koma / titik-koma)        │
│       ├─ Menangani kutip bersarang ("...")             │
│       └─ Memvalidasi kolom wajib vs opsional           │
│       │                                                │
│       ▼                                                │
│  4. [ Live Preview Table ]                             │
│       └─ Tampilkan baris valid, error badge, paginasi │
│                                                        │
│  5. [ Tombol: Proses & Simpan Semua Data ]             │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼ Callback onCommit(parsedRows)
      [ Update State / Kirim ke Database Backend ]
```

---

## 4. Panduan Integrasi Fitur Batch Import pada Modul Baru

Jika Anda ingin menambahkan fitur Batch Upload pada halaman lain, cukup ikuti 3 langkah berikut:

### Langkah 1: Definisikan Definisi Kolom & Sampel Data
```typescript
import BatchImportModal, { BatchColumnDef } from "@/components/common/batch-import-modal";

const myModuleBatchColumns: BatchColumnDef[] = [
  { key: "nama", label: "Nama Item", required: true, example: "Jembatan Karang Asem" },
  { key: "kategori", label: "Kategori", required: true, example: "Infrastruktur" },
  { key: "anggaran", label: "Pagu Anggaran", required: false, example: "500000000" }
];

const sampleRows = [
  { nama: "Jembatan Karang Asem", kategori: "Infrastruktur", anggaran: "500000000" }
];
```

### Langkah 2: Buat State Modal dan Fungsi Commit
```typescript
const [showBatchModal, setShowBatchModal] = useState(false);

const handleBatchCommit = (importedItems: Record<string, any>[]) => {
  const newRecords = importedItems.map((item, index) => ({
    id: `ITEM-${Date.now()}-${index}`,
    nama: item.nama,
    kategori: item.kategori,
    anggaran: Number(item.anggaran) || 0
  }));

  setData((prev) => [...newRecords, ...prev]);
  alert(`Berhasil mengimpor ${newRecords.length} data!`);
};
```

### Langkah 3: Render Komponen Modal di JSX
```tsx
{/* Tombol Pemicu */}
<button onClick={() => setShowBatchModal(true)}>
  Import Batch (Excel/CSV)
</button>

{/* Modal Batch Import */}
<BatchImportModal
  isOpen={showBatchModal}
  onClose={() => setShowBatchModal(false)}
  title="Import Batch Data Baru"
  subtitle="Unggah berkas CSV/Excel sesuai format standar"
  templateFileName="template_data_baru.csv"
  expectedColumns={myModuleBatchColumns}
  sampleRows={sampleRows}
  onCommit={handleBatchCommit}
/>
```

---

## 5. Daftar Rute & Halaman Baru

| No | Modul | Rute URL | Path Berkas Sumber |
|---|---|---|---|
| 1 | Laporan TKK | `/pelatihan/laporan` | `prototype/src/app/(dashboard)/pelatihan/laporan/page.tsx` |
| 2 | Proposal KAK TKK | `/pelatihan/perencanaan` | `prototype/src/app/(dashboard)/pelatihan/perencanaan/page.tsx` |
| 3 | Rekapitulasi Lulusan | `/pelatihan/rekapitulasi` | `prototype/src/app/(dashboard)/pelatihan/rekapitulasi/page.tsx` |
| 4 | Master Data OPD | `/profil-opd` | `prototype/src/app/(dashboard)/profil-opd/page.tsx` |
| 5 | Rantai Pasok Jakon | `/sipjaki/rantai-pasok` | `prototype/src/app/(dashboard)/sipjaki/rantai-pasok/page.tsx` |
| 6 | Asosiasi Terakreditasi | `/sipjaki/asosiasi` | `prototype/src/app/(dashboard)/sipjaki/asosiasi/page.tsx` |
| 7 | Standar Biaya Khusus | `/sipjaki/standar-biaya` | `prototype/src/app/(dashboard)/sipjaki/standar-biaya/page.tsx` |
| 8 | Tertib Usaha (Pemetaan) | `/pengawasan/tertib-usaha/perencanaan/pemetaan` | `prototype/src/app/(dashboard)/pengawasan/tertib-usaha/perencanaan/pemetaan/page.tsx` |
| 9 | Tertib Usaha (Audit) | `/pengawasan/tertib-usaha/pelaksanaan` | `prototype/src/app/(dashboard)/pengawasan/tertib-usaha/pelaksanaan/page.tsx` |
| 10 | Tertib Usaha (Sanksi) | `/pengawasan/tertib-usaha/tindak-lanjut` | `prototype/src/app/(dashboard)/pengawasan/tertib-usaha/tindak-lanjut/page.tsx` |
| 11 | Tertib Penyelenggaraan | `/pengawasan/tertib-penyelenggaraan/*` | `prototype/src/app/(dashboard)/pengawasan/tertib-penyelenggaraan/*` |
| 12 | Tertib Pemanfaatan | `/pengawasan/tertib-pemanfaatan/*` | `prototype/src/app/(dashboard)/pengawasan/tertib-pemanfaatan/*` |
| 13 | Paket Pekerjaan | `/paket-pekerjaan` | `prototype/src/app/(dashboard)/paket-pekerjaan/page.tsx` |

---

## 6. Checklist Pengujian & Quality Assurance

Sebelum melakukan *merge* Pull Request ke branch utama:
- [x] Jalankan `npx tsc --noEmit` di dalam folder `prototype/` dan pastikan hasil keluar dengan kode 0 (bebas error kompilasi).
- [x] Pastikan dev server dapat berjalan normal tanpa crash via `npm run dev`.
- [x] Pastikan seluruh action button di `ModuleHeader` memiliki aksi yang terdefinisi (buka modal, navigasi rute, atau unduh).
- [x] Uji pengunduhan berkas template CSV di setiap modal dan buka di Microsoft Excel untuk memverifikasi pemisahan kolom.

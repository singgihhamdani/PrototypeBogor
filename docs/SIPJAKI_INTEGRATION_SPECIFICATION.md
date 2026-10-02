# Spesifikasi Teknis & Panduan Integrasi SIPJAKI Kementerian PUPR
## Sistem Informasi Jasa Konstruksi (SIJAKON) TA 2026

Dokumen ini merupakan spesifikasi teknis resmi untuk memastikan aplikasi **SIJAKON** terintegrasi, kompatibel, dan selaras 100% dengan portal **SIPJAKI (Sistem Informasi Pembina Jasa Konstruksi)** Kementerian Pekerjaan Umum dan Perumahan Rakyat (PUPR) Republik Indonesia.

---

## 1. Arsitektur & 5 Pilar Pengawasan SIPJAKI Nasional

Berdasarkan audit langsung pada portal SIPJAKI (`https://sipjaki.pu.go.id`) per TA 2026, sistem Kementerian PUPR membagi pembinaan dan pelaporan daerah ke dalam **5 Pilar Utama**:

```text
                                  PORTAL SIPJAKI PUSAT
                                (Kementerian PUPR / LPJK)
                                            ▲
                 ┌──────────────────────────┴──────────────────────────┐
                 │    Sinkronisasi Data, Export-Import, & Pelaporan     │
                 └──────────────────────────┬──────────────────────────┘
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        ▼                                   ▼                                   ▼
┌──────────────────────┐        ┌──────────────────────┐        ┌──────────────────────┐
│  1. TERTIB USAHA     │        │ 2. PENYELENGGARAAN   │        │ 3. PEMANFAATAN       │
│ • Simak 1.A.1 s/d 1.F│        │ • Simak 2.A s/d 2.D  │        │ • Simak 3.A s/d 3.C  │
│ • Rantai Pasok       │        │ • Standar K4 / SMKK  │        │ • Kelaikan Fungsi    │
│ • Legalitas NIB/SBU  │        │ • Kontrak & Uji Mutu │        │ • Umur Konstruksi    │
└──────────────────────┘        └──────────────────────┘        └──────────────────────┘
        │                                   │                                   │
        └───────────────────────────────────┼───────────────────────────────────┘
                                            │
        ┌───────────────────────────────────┴───────────────────────────────────┐
        ▼                                                                       ▼
┌──────────────────────────────────────┐        ┌──────────────────────────────────────┐
│       4. SIPJAKI DATA MANAGEMENT     │        │ 5. PELATIHAN & FASILITASI SERTIFIKASI│
│ • Profil Kelembagaan & SDM OPD       │        │ • Perencanaan Pelatihan (Proposal KAK│
│ • Data Paket Pekerjaan Konstruksi    │        │ • Realisasi & Rekapitulasi TKK       │
│ • Pelaporan Kecelakaan Kerja K3      │        │ • Penomoran SKK & Pencatatan Asesor  │
└──────────────────────────────────────┘        └──────────────────────────────────────┘
```

---

## 2. Rincian Formulir & Parameter Data Input SIPJAKI

### 2.1 Modul Profil OPD (`/opds/create`)
Modul ini wajib diisi oleh Pemda Kabupaten/Kota untuk memvalidasi kelembagaan dinas teknis pembina jasa konstruksi:

| Kelompok Data | Nama Parameter / Field | Tipe Data | Keterangan & Aturan Validasi |
| :--- | :--- | :--- | :--- |
| **Identitas OPD** | `tipe_opd` | Enum | Pilihan: Dinas PU / Dinas Bina Marga / Dinas Cipta Karya. |
| | `kategori_opd` | Enum | Kabupaten / Kota / Provinsi. |
| | `nama_dinas` | String | Nama resmi dinas (misal: *Dinas PUPR Kabupaten Bogor*). |
| | `nama_bidang` | String | Nama bidang pembina (misal: *Bidang Jasa Konstruksi*). |
| | `nama_seksi` | String | Nama seksi teknis. |
| | `level_suburusan` | Enum | Dinas / Bidang / Seksi. |
| | `alamat_kantor` | Text | Alamat lengkap kantor OPD. |
| | `no_telp` | String | Nomor telepon resmi kantor. |
| | `website` | URL | Alamat domain resmi instansi. |
| | `email_resmi` | Email | Email dinas resmi. |
| **SDM Unit Kerja** | `jumlah_pns` | Integer | Total aparatur sipil negara PNS. |
| | `pejabat_manajerial` | Integer | Kepala Dinas, Kabid, Kasie. |
| | `pejabat_fungsional`| Integer | Pejabat Fungsional Pembina Jasa Konstruksi (Jafung Jakon). |
| | `jumlah_p3k` | Integer | Pegawai Pemerintah dengan Perjanjian Kerja. |
| | `jumlah_non_asn` | Integer | Tenaga kontrak / honorer pendukung. |
| **Anggaran Jakon** | `anggaran_penyelenggaraan_n` | Decimal | Anggaran pembinaan TA berjalan (Rupiah). |
| | `anggaran_fisik_n` | Decimal | Total pagu proyek konstruksi fisik TA berjalan. |
| | `anggaran_penyelenggaraan_n1`| Decimal | Proyeksi anggaran pembinaan TA berikutnya. |
| | `anggaran_fisik_n1` | Decimal | Proyeksi pagu fisik TA berikutnya. |
| **PIC / Admin** | `nama_pic` | String | Nama lengkap penanggung jawab OPD. |
| | `nip_pic` | String | NIP 18 digit pejabat bersangkutan. |
| | `jabatan_pic` | String | Jabatan struktural/fungsional. |
| | `no_hp_pic` | String | Nomor WhatsApp aktif PIC. |
| | `email_pic` | Email | Email personal/kedinasan PIC. |
| **Legalitas & SK** | `doc_sotk_pdf` | File (PDF) | Perda/Perbup Susunan Organisasi Tata Kerja (Maks 2MB). |
| | `doc_perda_jakon` | File (PDF) | Peraturan Daerah tentang Jasa Konstruksi. |
| | `doc_sk_tpjk` | File (PDF) | SK Bupati Tim Pembina Jasa Konstruksi (TPJK). |
| | `doc_sk_pengawas` | File (PDF) | Surat Perintah Tugas / SK Tim Pengawas Jakon. |
| | `doc_sk_admin` | File (PDF) | SK Penunjukan Operator/Admin SIPJAKI Daerah. |
| **Target RPJMD** | `target_tertib_usaha` | Integer | Target pengawasan BUJK dalam 1 tahun anggaran. |
| | `target_tertib_selenggara` | Integer | Target pengawasan paket proyek dalam 1 tahun. |
| | `target_tkk_latih` | Integer | Target sertifikasi tenaga kerja konstruksi (Orang). |

---

### 2.2 Modul Data Paket Pekerjaan Konstruksi (`/datapaketpekerjaans`)
Data ini memuat seluruh portofolio paket pekerjaan fisik APBD/APBN/DAK yang berjalan di wilayah Kabupaten/Kota:

| Nama Kolom / Field | Tipe Data | Format / Enum | Deskripsi |
| :--- | :--- | :--- | :--- |
| `tahun_anggaran` | Integer | `YYYY` (e.g. 2026) | Tahun anggaran pelaksanaan proyek. |
| `nama_pekerjaan` | String | Text (max 255) | Nama paket pekerjaan sesuai kontrak/RUP. |
| `sumber_dana` | Enum | APBD / DAK / Banprov / APBN / Lainnya | Sumber pendanaan paket konstruksi. |
| `pengguna_jasa` | String | Text | Nama OPD / Bidang / Satker pemilik pekerjaan. |
| `nama_penyedia` | String | Text | Nama resmi kontraktor/konsultan pelaksana. |
| `nib_penyedia` | String | 13 Karakter Numerik | Nomor Induk Berusaha (OSS RBA). |
| `nilai_kontrak` | BigInt | Nominal Rupiah | Nilai kontrak final (termasuk PPN). |
| `status_paket` | Enum | Tender / Pelaksanaan / Selesai / Putus Kontrak | Status progres pengadaan & fisik. |
| `jenis_kontrak` | Enum | Pengadaan Barang / Konstruksi / Konsultansi | Klasifikasi pengadaan jasa konstruksi. |
| `karakteristik_kontrak`| Enum | Lump Sum / Harga Satuan / Gabungan / Kontrak Payung | Karakteristik pembayaran kontrak. |
| `tanggal_mulai` | Date | `YYYY-MM-DD` | Tanggal SPMK (Surat Perintah Mulai Kerja). |
| `tanggal_selesai` | Date | `YYYY-MM-DD` | Tanggal berakhir kontrak (PHO). |
| `progress_fisik` | Decimal | 0.00 s.d 100.00 % | Persentase realisasi fisik di lapangan. |
| `bulan_progress_fisik` | Enum | Januari s.d Desember | Bulan pelaporan capaian fisik. |
| `progress_keuangan` | Decimal | 0.00 s.d 100.00 % | Persentase realisasi penyerapan anggaran. |
| `bulan_progress_keuangan`| Enum | Januari s.d Desember | Bulan pelaporan penyerapan keuangan. |

---

### 2.3 Modul Pelaporan Kecelakaan Kerja Konstruksi (`/kecelakaans`)
Pencatatan insiden K3 sebagai bagian dari monitoring Standar K4 (Keselamatan, Keamanan, Kesehatan, dan Keberlanjutan):

| Nama Field | Tipe Data | Deskripsi & Isian |
| :--- | :--- | :--- |
| `nama_pekerjaan` | String | Nama proyek konstruksi tempat terjadinya insiden. |
| `perusahaan_penyedia` | String | Nama BUJK yang bertanggung jawab di lokasi. |
| `lokasi_kejadian` | Text / Geo | Alamat detail lokasi atau titik koordinat GPS. |
| `waktu_kejadian` | DateTime | Tanggal dan waktu insiden kecelakaan. |
| `kronologi` | Text | Penjelasan mendalam alur terjadinya kecelakaan. |
| `sumber_dana` | Enum | APBD Kab. Bogor / APBD Prov / APBN / Swasta. |
| `dampak_kerugian` | Text | Jumlah korban (luka ringan, luka berat, meninggal dunia) serta estimasi kerugian fisik material. |
| `akar_masalah` | Text | Hasil investigasi faktor penyebab (kegagalan perancah, kelalaian APD, human error, kegagalan mekanikal). |
| `tindakan_penanganan` | Text | Langkah tanggap darurat, santunan BPJS Ketenagakerjaan, dan rekomendasi perbaikan metode kerja. |

---

### 2.4 Modul Instrumen Audit Pengawasan (Daftar Simak Permen PUPR 1/2023)

Pengawasan dilakukan menggunakan form digital SIMAK berstandar nasional:

1. **Tertib Usaha (Simak 1.A.1 s/d 1.F)**:
   - *Pemeriksaan Rantai Pasok Material & Peralatan*: Kualifikasi produsen, NIB produsen, keabsahan izin edar SNI, kapasitas terpasang, perizinan bahan baku tambang galian C.
   - *Pemeriksaan BUJK*: Keabsahan NIB, kualifikasi SBU, kecukupan tenaga ahli ber-SKK, dan pelaporan kegiatan tahunan.
2. **Tertib Penyelenggaraan (Simak 2.A s/d 2.D)**:
   - *Dokumen Kontrak*: Standar kontrak kerja konstruksi, pemenuhan hak tenaga kerja.
   - *Penerapan SMKK (Sistem Manajemen Keselamatan Konstruksi)*: RKK (Rencana Keselamatan Konstruksi), ketersediaan Ahli/Petugas K3, rasio APD, identifikasi bahaya (IBPRP).
   - *Penjaminan Mutu*: RMPK (Rencana Mutu Pekerjaan Konstruksi), uji lab bahan, as-built drawing, BAST/PHO.
3. **Tertib Pemanfaatan (Simak 3.A s/d 3.C)**:
   - *Kelaikan Fungsi*: Sertifikat Laik Fungsi (SLF), kesesuaian peruntukan fungsi bangunan.
   - *Pemeliharaan Bangunan*: Dokumen rencana pemeliharaan berkala, riwayat inspeksi struktur, penanganan kegagalan bangunan.

---

## 3. Strategi Interoperabilitas & Integrasi SIJAKON

Agar aplikasi SIJAKON Kab. Bogor dapat bertukar data tanpa hambatan dengan SIPJAKI Kementerian PUPR, disiapkan 2 lapis integrasi:

### Lapis 1: 1-Click Export Template Excel SIPJAKI (Siap Pakai Saat Ini)
Karena SIPJAKI saat ini menyediakan modul import data via Excel (`/datapaketpekerjaans-upload` dan `/kecelakaans-upload`), SIJAKON menyediakan tombol ekspor otomatis:
- **Export Paket Pekerjaan (Format SIPJAKI)**: Menghasilkan berkas `.xlsx` dengan susunan kolom, header, dan format tanggal yang 100% presisi sesuai parser SIPJAKI PUPR.
- **Export Laporan Kecelakaan (Format SIPJAKI)**: Menghasilkan berkas Excel insiden siap unggah.
- **Export Rekapitulasi TKK (Format SIPJAKI)**: Format rekap nama, NIK, jabatan kerja, dan jenjang pelatihan.

### Lapis 2: Kesiapan Infrastruktur API Internal SIJAKON (Masa Depan)

> **⚠️ Catatan Penting (Diperbarui Oktober 2026):**
> Berdasarkan verifikasi langsung, Kementerian PUPR **tidak menyediakan** public REST API terbuka untuk integrasi *machine-to-machine* oleh aplikasi pemerintah daerah. Seluruh pertukaran data SIPJAKI nasional saat ini dilakukan melalui **mekanisme unggah berkas spreadsheet** (`.xlsx`) pada portal `sipjaki.pu.go.id`.
>
> Oleh karena itu, strategi **Lapis 1 (1-Click Export Template Excel)** merupakan satu-satunya jalur integrasi yang aktif dan realistis saat ini.

Meskipun demikian, SIJAKON tetap menyiapkan infrastruktur internal untuk mengantisipasi kemungkinan pembukaan API di masa depan:

- **Internal API SIJAKON** (`/api/v1/integrasi/sipjaki/*`): Endpoint siap pakai apabila Kementerian PUPR membuka gateway integrasi daerah. Saat ini endpoint belum dihubungkan ke server eksternal.
- **Standar format pertukaran data**: Skema JSON internal SIJAKON sudah mengikuti nomenklatur field SIPJAKI (`tahun_anggaran`, `nama_pekerjaan`, `nib_penyedia`, dll.) sehingga mapping ke API nasional dapat dilakukan dengan modifikasi minimal.
- **Webhook Listener**: SIJAKON sudah menyediakan pola webhook receiver yang dapat diaktifkan jika PUPR menyediakan notifikasi push status sinkronisasi.

### Lapis 3: Validasi Skema & Audit Trail (Aktif)

SIJAKON menyediakan lapisan validasi dan pencatatan riwayat untuk menjaga integritas data:

- **Validator Skema Impor** (`src/lib/import-validators.ts`): Validasi NIB 13-digit, format tanggal ISO, enum resmi, dan angka murni sebelum data masuk ke database.
- **Audit Trail** (`/pengaturan/riwayat-data`): Seluruh operasi ekspor dan impor data SIPJAKI dicatat secara kronologis (operator, modul, tanggal, jumlah baris, status).

---

*Dokumen spesifikasi ini telah diverifikasi langsung berdasarkan struktur navigasi, model data, dan alur kerja SIPJAKI Kementerian PUPR TA 2026. Terakhir diperbarui: Oktober 2026.*


# 🚀 Rencana Implementasi & Panduan Presentasi Eksekutif
## SIJAKON (Sistem Informasi Jasa Konstruksi) Kabupaten Bogor TA 2026

Dokumen ini disusun khusus sebagai panduan presentasi, pengenalan modul, matriks kewenangan, dan rencana implementasi (*implementation plan*) menuju produksi.

> [!IMPORTANT]
> **Tautan Akses Live Demo (Cloud Deployment):**  
> 🌐 **URL Prototype:** [https://prototype-bogor.vercel.app/](https://prototype-bogor.vercel.app/)  
> 💻 **Aksesibilitas:** Siap diakses secara *live* melalui peramban Desktop/Laptop penguji maupun pemindaian smartphone audiens.

---

## 1. Executive Summary & Value Proposition

### 1.1 Latar Belakang & Urgensi Daerah
Pemerintah Kabupaten Bogor memiliki wilayah yang sangat luas (40 kecamatan, lebih dari 400 desa/kelurahan) dengan volume proyek fisik APBD/DAK yang masif setiap tahunnya. Selama ini, tata kelola jasa konstruksi di daerah menghadapi 4 kendala utama:
1. **Fragmentasi Data:** Data paket pekerjaan tersebar di berbagai OPD (DPUPR, Disdik, Dinkes, PRKP) tanpa satu pintu pemantauan (*single source of truth*).
2. **Keterlambatan Deteksi Proyek Bermasalah:** Monitoring fisik dan serapan keuangan sering kali terlambat diketahui hingga mendekati tutup tahun anggaran, memicu risiko SiLPA tinggi atau pekerjaan mangkrak.
3. **Mandat Pengawasan Tertib Konstruksi (Permen PUPR No. 1/2023):** Pemerintah Kabupaten wajib melakukan pembinaan dan audit terhadap **3 Tertib** (Tertib Usaha, Tertib Penyelenggaraan, dan Tertib Pemanfaatan).
4. **Target Sertifikasi Tenaga Kerja Konstruksi (TKK):** Target pemenuhan 500 TKK bersertifikat kompetensi kerja per tahun membutuhkan platform pencatatan yang akuntabel dan tervalidasi secara digital.

### 1.2 Visi Solusi: SIJAKON Kabupaten Bogor
**SIJAKON** dirancang sebagai ekosistem digital terpadu untuk:
- Mengintegrasikan pemantauan paket pekerjaan fisik dan keuangan berbasis spasial (WebGIS 40 Kecamatan).
- Mendigitalkan instrumen audit kepatuhan jasa konstruksi sesuai regulasi nasional.
- Menyediakan verifikasi keahlian pekerja konstruksi melalui e-Sertifikat ber-QR Code dinamis.
- Mengotomasi pelaporan daerah ke portal **SIPJAKI Kementerian PUPR**.
- Mendukung pimpinan daerah (Bupati, Sekda, Kadis) dengan **Executive Intelligence** dan asisten cerdas **AI Copilot**.

---

## 2. Bedah Fitur Utama (Core Modules Breakdown)

### Modul 1: Executive Dashboard & WebGIS Spasial
- **KPI Summary Cards:** Menampilkan 4 indikator makro (Total Paket Aktif, Total Nilai Kontrak APBD, Jumlah BUJK Terdaftar, Realisasi Sertifikasi TKK).
- **Peta Spasial Interaktif 40 Kecamatan:** Visualisasi sebaran titik proyek konstruksi di seluruh kecamatan Kab. Bogor, dilengkapi filter sumber dana (APBD/DAK/APBN) dan status proyek.
- **Tabel 5 Proyek Berjalan Terbesar:** Menampilkan ringkasan progres fisik vs keuangan untuk intervensi cepat pimpinan.

### Modul 2: Master BUJK & Kualifikasi Usaha (Epic-BUJK)
- **Database Terpusat Kontraktor & Konsultan:** Pencatatan NIB, NPWP, alamat kantor, penanggung jawab, kualifikasi (Kecil, Menengah, Besar), dan asosiasi.
- **Manajemen SBU & Klasifikasi KBLI:** Tracking masa berlaku SBU dengan sistem peringatan dini sebelum kedaluwarsa.
- **Portofolio Pengalaman Proyek:** Riwayat pekerjaan yang pernah dikerjakan di Kabupaten Bogor beserta dokumen BAST.

### Modul 3: Monitoring Paket Pekerjaan Konstruksi
- **Katalog Seluruh Paket Pekerjaan OPD:** Pemantauan realisasi fisik (%) dan realisasi keuangan SP2D (%).
- **Halaman Detail Proyek:** Menampilkan ringkasan kontrak lengkap (SPMK, PHO, PPK, kontraktor pelaksana, nilai kontrak, lokasi koordinat, dan tautan langsung ke peta WebGIS).
- **Fasilitas Import Batch Excel (.xlsx / .csv):** Memudahkan migrasi ratusan data proyek dinas sekaligus menggunakan format standar SIPJAKI.

### Modul 4: Pengawasan Tertib Jasa Konstruksi (Permen PUPR 1/2023)
- **Tertib Usaha:** Audit kesesuaian izin berusaha, keabsahan SBU, kualifikasi rantai pasok, dan pemenuhan kewajiban pengembangan usaha.
- **Tertib Penyelenggaraan:** Audit dokumen pemilihan penyedia, pelaksanaan kontrak, penerapan SMKK/K3, penjaminan mutu bahan/spesifikasi teknis, dan keabsahan TKK di lapangan.
- **Tertib Pemanfaatan:** Evaluasi kelaikan fungsi bangunan, pemeliharaan berkala produk konstruksi, dan kepemilikan SLF (Sertifikat Laik Fungsi).
- **Otomasi Scoring SIMAK:** Penghitungan otomatis skor indeks kepatuhan dan penerbitan rekomendasi tindak lanjut.

### Modul 5: Pelatihan & Sertifikasi Tenaga Kerja Konstruksi (TKK)
- **Manajemen Paket Bimtek & Uji Kompetensi:** Pengelolaan kuota pelatihan, jenjang KKNI, pembiayaan APBD, dan jadwal kegiatan.
- **Penerbitan e-Certificate Otomatis:** Sertifikat digital berformat resmi dengan stempel dan tanda tangan dinas.
- **QR Code Dinamis:** Setiap sertifikat dilengkapi kode QR yang jika dipindai di lapangan menggunakan kamera smartphone akan langsung menampilkan status validitas keaslian sertifikat secara publik.

### Modul 6: SIJAKON AI Copilot & RAG Assistant
- **Asisten Analitik Proyek:** Memberikan ringkasan eksekutif secara instan kepada pimpinan (misal: *"Tampilkan proyek dengan progres fisik di bawah 50%"*).
- **Mesin Tanya Jawab Regulasi (RAG):** Mengindeks 11 dokumen dasar hukum (UU 2/2017, PP 14/2021, Permen PUPR 1/2023, Perda Kab. Bogor 2/2020) lengkap dengan pasal rujukan resmi.

### Modul 7: Ekspor Data & Integrasi SIPJAKI Nasional
- **Multi-Format Export:** Ekspor satu klik ke format Excel (.xlsx), CSV, dan PDF resmi.
- **Sinkronisasi Template SIPJAKI:** Template file terstandarisasi dengan Kementerian PUPR untuk pelaporan sub-urusan jasa konstruksi kabupaten ke tingkat nasional.

---

## 3. Matriks Kewenangan Pengguna (Role-Based Access Control / RBAC)

SIJAKON mengadopsi 7 tingkat peran pengguna (*persona*) untuk menjamin pemisahan tugas (*segregation of duties*) dan keamanan data:

| Peran (Role) | Target Pengguna | Lingkup Kewenangan & Hak Akses |
| :--- | :--- | :--- |
| **1. Super Admin DPU** | Administrator Dinas PUPR (Diskominfo / Tim IT) | Akses mutlak seluruh modul, manajemen user, konfigurasi sistem, RBAC, dan audit trail log. |
| **2. Admin Bidang Jakon** | Kepala Seksi & Staf Bidang Bina Konstruksi | Mengelola paket pelatihan TKK, input instrumen audit SIMAK, verifikasi data BUJK, dan ekspor laporan SIPJAKI. |
| **3. PPK / Admin OPD** | Pejabat Pembuat Komitmen Dinas (PUPR, Disdik, Dinkes) | Menginput data paket pekerjaan proyek dinasnya, update tanggal SPMK/PHO, dan memantau realisasi fisik/keuangan paketnya. |
| **4. Konsultan Pengawas** | Konsultan Pengawas Lapangan | Menginput capaian opname fisik berkala dan mengunggah foto dokumentasi kemajuan pekerjaan. |
| **5. Operator BUJK** | Badan Usaha Jasa Konstruksi (Kontraktor) | Mendaftarkan akun perusahaan, memperbarui data profil SBU, dan melihat status proyek yang dikerjakan (*tenant-isolated*). |
| **6. Eksekutif Daerah** | Bupati, Wakil Bupati, Sekda, Kepala Dinas | Akses *Read-Only* ke seluruh dashboard eksekutif, peta WebGIS, KPI summary, dan unduh ringkasan laporan pimpinan. |
| **7. Peserta TKK & Publik** | Tenaga kerja, mahasiswa, asosiasi, warga umum | Pendaftaran pelatihan mandiri, repositori dasar hukum/regulasi publik, dan scan QR code validasi sertifikat. |

---

## 4. Output Konkret Sistem (Tangible Deliverables)

1. **Bagi Pimpinan Daerah (Bupati/Sekda/Kadis):**
   - Rekapitulasi serapan dana konstruksi APBD/DAK per semester.
   - Peta sebaran spasial proyek infrastruktur di 40 kecamatan.
   - *Early Warning Alert* terhadap potensi keterlambatan paket proyek.
2. **Bagi Aparat Pengawas (Inspektorat / APIP & BPK):**
   - Audit trail log digital (mencatat siapa menginput apa, tanggal, jam, dan IP address).
   - Data riwayat pengawasan fisik lapangan yang tidak bisa dimanipulasi surut (*anti-backdating*).
3. **Bagi Kementerian PUPR (SIPJAKI):**
   - File data terstruktur (Excel multi-sheet) siap unggah ke portal pembinaan nasional.
4. **Bagi Masyarakat & Industri Konstruksi:**
   - Kepastian hukum sertifikasi kompetensi tenaga kerja dengan pemindaian QR Code instan.
   - Akses mudah terhadap 11 peraturan perundang-undangan jasa konstruksi daerah dan nasional.

---

## 5. Storyline & Skenario Demo Presentasi (15–20 Menit)

### Sesi A: Pembukaan & Urgensi (Menit 00–03)
- **Narasi Utama:** *"Bapak/Ibu pimpinan, Kabupaten Bogor adalah salah satu daerah dengan perputaran proyek konstruksi terbesar di Jawa Barat. Namun tantangannya adalah bagaimana memastikan seluruh proyek tertib regulasi, transparan, dan terintegrasi dengan SIPJAKI pusat. Hari ini, kami mempersembahkan solusi nyatanya: SIJAKON Kabupaten Bogor."*
- **Tautan Live:** Buka [Dashboard Utama (https://prototype-bogor.vercel.app/dashboard)](https://prototype-bogor.vercel.app/dashboard) atau [Portal Beranda (https://prototype-bogor.vercel.app/)](https://prototype-bogor.vercel.app/).

### Sesi B: Tur Eksekutif — Dashboard & WebGIS (Menit 03–07)
- **Fokus Fitur:** Tunjukkan 4 kartu metrik utama dan peta WebGIS 40 kecamatan.
- **Tautan Live:** Buka [Peta WebGIS (https://prototype-bogor.vercel.app/webgis)](https://prototype-bogor.vercel.app/webgis).
- **Poin Penekanan:**
  - Klik salah satu titik proyek di peta WebGIS untuk memperlihatkan pop-up detail proyek dan kontraktor pelaksananya.
  - Tunjukkan bahwa pimpinan tidak perlu membaca tumpukan berkas tebal—cukup membuka dashboard ini untuk melihat potret proyek se-Kabupaten Bogor.

### Sesi C: Manajemen Paket Pekerjaan & Pengawasan Tertib Konstruksi (Menit 07–12)
- **Fokus Fitur:** Masuk ke menu Paket Pekerjaan lalu klik salah satu paket untuk membuka halaman detail.
- **Tautan Live:** Buka [Daftar Paket Pekerjaan](https://prototype-bogor.vercel.app/paket-pekerjaan) &rarr; buka [Detail Proyek P001](https://prototype-bogor.vercel.app/paket-pekerjaan/P001).
- **Poin Penekanan:**
  - Jelaskan pemisahan data: nilai kontrak dari PPK, fisik dari pengawas, keuangan dari SP2D.
  - Klik tombol **`[Audit SIMAK]`** atau buka menu [Pengawasan Tertib Konstruksi (SIMAK)](https://prototype-bogor.vercel.app/pengawasan) untuk mendemokan bagaimana dinas melakukan pengawasan kepatuhan sesuai **Permen PUPR No. 1/2023**.
  - Tunjukkan tombol **`[📗 Import Excel]`** sebagai bukti kemudahan migrasi data ratusan paket proyek tanpa input manual satu per satu.

### Sesi D: Inovasi Unggulan — Sertifikasi TKK & QR Code (Menit 12–15)
- **Fokus Fitur:** Masuk ke modul pembinaan tenaga kerja.
- **Tautan Live:** Buka [Pelatihan & Sertifikasi TKK](https://prototype-bogor.vercel.app/pelatihan).
- **Poin Penekanan:**
  - Tunjukkan capaian target 500 TKK tahun 2026.
  - Tunjukkan fitur penomoran sertifikat digital dan **QR Code**.
  - Jelaskan: *"Jika mandor atau tukang sedang bekerja di lapangan, pengawas cukup scan QR code di ID Card / sertifikat mereka untuk memastikan keaslian kompetensinya."*

### Sesi E: AI Copilot & Fleksibilitas Simulasi Role (Menit 15–18)
- **Fokus Fitur:** 
  1. Klik tombol **AI Copilot** di pojok kanan bawah, ketik pertanyaan: *"Apa dasar hukum pengawasan jasa konstruksi oleh Pemkab?"*
  2. Buka tombol switcher **`Simulasi Role`** di topbar: ganti role dari *Super Admin* ke *Eksekutif* atau *BUJK* untuk mendemokan bahwa hak akses telah terisolasi dengan rapi.

### Sesi F: Penutup & Tanya Jawab (Menit 18–20)
- Tampilkan rencana roadmap implementasi (Fase 1 s/d Fase 4) dan buka sesi diskusi.

---

## 6. Rencana Implementasi Bertahap (Roadmap Produksi)

| Fase | Durasi | Target Utama & Milestone | Output Kunci |
| :--- | :--- | :--- | :--- |
| **Fase 1: Persiapan & Regulasi** | Bulan 1 | • Finalisasi alur bisnis dan form audit dinas<br>• Penyusunan draf Keputusan Bupati / SE Sekda ttg SIJAKON | Dokumen SOP, Wireframe Final, SK Tim Pelaksana |
| **Fase 2: Engineering & Integrasi** | Bulan 2–3 | • Penyambungan backend API (NestJS/Hono) & PostgreSQL PostGIS<br>• Migrasi data awal BUJK dan paket pekerjaan via batch import | Backend siap produksi, Database spasial aktif |
| **Fase 3: Pilot Testing & Pelatihan** | Bulan 4 | • Uji coba pada 3 OPD utama (PUPR, Disdik, Dinkes)<br>• Bimbingan teknis bagi PPK, Konsultan, dan Asosiasi BUJK | Berita Acara UAT, Buku Panduan Pengguna |
| **Fase 4: Go-Live & Nasional** | Bulan 5 | • Peluncuran resmi (*Soft Launching*) oleh Bupati<br>• Sinkronisasi aktif dengan portal SIPJAKI Kementerian PUPR | Sistem Go-Live 100%, Integrasi KemenPUPR Aktif |

---

## 7. Strategi Menjawab Pertanyaan Kritis Penguji (Defense Guide)

1. **"Apakah aplikasi ini tumpang tindih dengan SIPJAKI Kementerian PUPR?"**  
   *Jawaban:* *"Sama sekali tidak. SIPJAKI pusat adalah sistem pelaporan tingkat nasional di hilir. Sedangkan SIJAKON Bogor adalah sistem kerja operasional di hulu (tingkat daerah) yang mengumpulkan, memverifikasi, dan mengolah data harian. SIJAKON justru mempermudah Pemkab Bogor memenuhi kewajiban pelaporan ke SIPJAKI secara otomatis tanpa entri ulang."*

2. **"Bagaimana jika dinas lain (non-PUPR) lambat menginput data paket fisiknya?"**  
   *Jawaban:* *"Sistem telah menyediakan fitur **Import Batch Excel (.xlsx)** yang sangat cepat—cukup ekspor dari SiRUP/SPSE lalu diunggah ke sistem dalam hitungan detik. Selain itu, implementasi sistem ini akan diperkuat dengan Surat Edaran Sekretaris Daerah mengenai integrasi pelaporan data konstruksi satu pintu."*

3. **"Bagaimana keamanan data jika diakses oleh kontraktor luar?"**  
   *Jawaban:* *"Sistem menerapkan **Row-Level Security (RLS)** dan Role-Based Access Control (RBAC). Akun kontraktor hanya dapat melihat data perusahaannya sendiri, sementara data audit internal dinas dan laporan eksekutif terkunci hanya untuk aparatur dinas yang berwenang."*

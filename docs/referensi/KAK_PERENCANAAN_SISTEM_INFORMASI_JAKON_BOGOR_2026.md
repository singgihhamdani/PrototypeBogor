# KERANGKA ACUAN KERJA (KAK) / TERM OF REFERENCE (TOR)
## JASA KONSULTANSI PERENCANAAN: PENYUSUNAN RANCANGAN DAN DED SISTEM INFORMASI JASA KONSTRUKSI (SIJAKON) KABUPATEN BOGOR
### TAHUN ANGGARAN 2026

---

## 1. LATAR BELAKANG

Penyelenggaraan jasa konstruksi di tingkat daerah memegang peranan strategis dalam mewujudkan infrastruktur yang berkualitas, tertib, aman, dan berkelanjutan. Berdasarkan Undang-Undang Nomor 2 Tahun 2017 tentang Jasa Konstruksi sebagaimana telah diubah dengan Undang-Undang Nomor 6 Tahun 2023, serta Peraturan Menteri PUPR Nomor 1 Tahun 2023 tentang Pedoman Pengawasan Penyelenggaraan Jasa Konstruksi oleh Pemerintah Daerah, Pemerintah Kabupaten Bogor memiliki kewenangan dan tanggung jawab pembinaan, pelatihan tenaga kerja konstruksi (TKK), pendataan badan usaha (BUJK), dan pengawasan tertib konstruksi di seluruh 40 Kecamatan.

Seiring dengan tingginya volume pekerjaan konstruksi di Kabupaten Bogor, pengelolaan data dan instrumen pengawasan saat ini masih menghadapi tantangan fragmentasi data, pencatatan manual, dan ketiadaan pemetaan spasial sebaran proyek yang terintegrasi. Untuk menjawab tantangan tersebut, Dinas Pekerjaan Umum (DPU) Kabupaten Bogor memandang perlu adanya **kegiatan perencanaan teknis yang matang sebelum tahap implementasi/pembangunan perangkat lunak dilaksanakan**.

Perencanaan yang komprehensif diperlukan agar sistem informasi yang dibangun pada tahap selanjutnya memiliki landasan arsitektur teknologi yang kokoh, proses bisnis yang selaras dengan regulasi nasional dan daerah (Perda Jabar No. 6/2024), model data spasial yang presisi, serta desain antarmuka (UI/UX) yang ramah pengguna. 

Oleh karena itu, diperlukan pengadaan **Jasa Konsultansi Perencanaan: Penyusunan Rancangan dan Detail Engineering Design (DED) Sistem Informasi Jasa Konstruksi Kabupaten Bogor** sebagai acuan baku dan cetak biru (*blueprint*) pengadaan pembangunan sistem informasi.

---

## 2. MAKSUD, TUJUAN DAN SASARAN

### 2.1 Maksud
Maksud dari pekerjaan jasa konsultansi perencanaan ini adalah menyediakan dokumen perencanaan teknis, analisis kebutuhan sistem, cetak biru arsitektur, pemodelan geospasial WebGIS, rancangan basis data, dan prototipe antarmuka (UI/UX) interaktif sebagai pedoman komprehensif dalam pelaksanaan pembangunan Sistem Informasi Jasa Konstruksi Kabupaten Bogor.

### 2.2 Tujuan
Tujuan pelaksanaan pekerjaan perencanaan ini adalah:
1. Melakukan kajian regulasi, proses bisnis, dan analisis kebutuhan sistem pembinaan dan pengawasan jasa konstruksi di Kabupaten Bogor.
2. Menyusun dokumen Spesifikasi Kebutuhan Perangkat Lunak (*Software Requirement Specification* / PRD).
3. Menyusun Dokumen Perancangan Arsitektur Sistem (*Software Architecture Design Document* / DED) berbasis web dan geospasial modern.
4. Merancang skema basis data relasional dan spasial terstandar (PostgreSQL + PostGIS) untuk pemetaan 40 Kecamatan.
5. Menyusun prototipe antarmuka pengguna interaktif (*Interactive Prototype*).

### 2.3 Sasaran
Sasaran yang ingin dicapai melalui kegiatan perencanaan ini adalah:
1. Tersusunnya dokumen analisis proses bisnis tata kelola jasa konstruksi Kabupaten Bogor;
2. Tersedianya Dokumen Kebutuhan Sistem (*System Requirement Document* / PRD) yang tervalidasi;
3. Tersedianya Dokumen Arsitektur Teknis & DED Sistem Informasi yang siap diimplementasikan;
4. Tersedianya Prototipe Antarmuka Pengguna (*Interactive Prototype*) interaktif yang teruji secara fungsional.

---

## 3. NAMA ORGANISASI PENGGUNA JASA

* **Instansi Pengguna Jasa**: Pemerintah Kabupaten Bogor
* **Satuan Kerja**: Dinas Pekerjaan Umum (DPU) Kabupaten Bogor
* **Pejabat Pembuat Komitmen (PPK)**: Bidang Jasa Konstruksi / Tim Teknis DPU Kabupaten Bogor

---

## 4. DASAR HUKUM

Pelaksanaan kegiatan konsultansi perencanaan ini berpedoman pada:
1. Undang-Undang Nomor 2 Tahun 2017 tentang Jasa Konstruksi jo. UU No. 6 Tahun 2023 tentang Penetapan Perppu Cipta Kerja menjadi UU;
2. Peraturan Pemerintah Nomor 22 Tahun 2020 tentang Peraturan Pelaksanaan UU No. 2/2017 tentang Jasa Konstruksi jo. PP No. 14 Tahun 2021;
3. Peraturan Presiden Nomor 12 Tahun 2021 tentang Perubahan atas Perpres No. 16 Tahun 2018 tentang Pengadaan Barang/Jasa Pemerintah;
4. Peraturan Menteri PUPR Nomor 9 Tahun 2020 tentang Pembentukan Lembaga Pengembangan Jasa Konstruksi;
5. Peraturan Menteri PUPR Nomor 1 Tahun 2023 tentang Pedoman Pengawasan Penyelenggaraan Jasa Konstruksi yang Dilaksanakan Pemerintah Daerah Provinsi, Kabupaten, dan Kota;
6. Peraturan Daerah Provinsi Jawa Barat Nomor 6 Tahun 2024 tentang Pembinaan dan Pengawasan Jasa Konstruksi.

---

## 5. LINGKUP PEKERJAAN (PERENCANAAN / TIDAK SAMPAI RILIS)

Lingkup pekerjaan Jasa Konsultansi Perencanaan ini **murni berfokus pada tahapan perancangan, analisis, dan penyusunan cetak biru sistem (tidak mencakup rilis/implementasi live coding di server produksi)**, yang meliputi:

### Tahap 1: Pengumpulan Data & Analisis Kebutuhan
* Pelaksanaan Kick-Off Meeting dan penyusunan metodologi perencanaan.
* Kajian regulasi jasa konstruksi nasional, provinsi, dan peraturan bupati terkait.
* Analisis inventarisasi data eksisting (profil BUJK, data proyek konstruksi APBD, riwayat sertifikasi TKK).
* Wawancara mendalam (*in-depth interview*) dan Focus Group Discussion (FGD) bersama stakeholder internal DPU, verifikator, asosiasi badan usaha, dan dinas teknis terkait.
* Penyusunan Dokumen Analisis Kebutuhan Pengguna (*User Requirement Analysis*).

### Tahap 2: Perancangan Arsitektur Sistem & Proses Bisnis
* Pemodelan Proses Bisnis (*Business Process Modeling Notation* / BPMN) untuk alur registrasi BUJK, verifikasi SBU, kurva S proyek, dan audit Permen PUPR 1/2023.
* Perancangan Arsitektur Perangkat Lunak (*Software Architecture Design*) mencakup Frontend, Backend API, WebGIS Engine, Caching, dan Security Layer.
* Perancangan Matriks Hak Akses Pengguna Granular (*Role-Based Access Control* / RBAC) untuk tingkatan Visitor, Operator BUJK, Asesor Pengawas, dan Super Admin.

### Tahap 3: Perancangan Basis Data & Geospasial (DED Data Model)
* Perancangan Skema Basis Data Relasional (*Entity Relationship Diagram* / ERD) dan Kamus Data (*Data Dictionary*).
* Perancangan Struktur Data Spasial berbasis **PostGIS** untuk pemetaan 40 Kecamatan, koordinat lokasi proyek, dan delineasi poligon.
* Perancangan modul interoperabilitas format data spasial **Shapefile (.SHP zipped)** dan GeoJSON.
* Perancangan mekanisme pencatatan audit sistem (*Audit Trail Logging*).

### Tahap 4: Perancangan Wireframe & Prototipe Antarmuka Interaktif
* Pembuatan sketsa wireframe (Low-Fidelity) seluruh tata letak modul aplikasi.
* Pembuatan Prototipe Antarmuka Interaktif (*Interactive Prototype*) untuk simulasi alur klik dan visualisasi navigasi pengguna.
* Perancangan tata letak fitur khusus: *Side-by-Side Document Reviewer Modal*, *Multi-Step Stepper Wizard*, dan *WebGIS Split-View*.
* Pelaksanaan Uji Keterpakaian Prototipe (*Usability Review / Prototype Walkthrough*) bersama tim teknis DPU.

---

## 6. LOKASI DAN SUMBER PENDANAAN

* **Lokasi Pekerjaan**: Wilayah Kabupaten Bogor, dengan koordinasi utama di Dinas Pekerjaan Umum Kabupaten Bogor.
* **Sumber Pendanaan**: APBD Kabupaten Bogor Tahun Anggaran 2026.
* **Pagu Anggaran**: Disesuaikan dengan Standar Biaya Masukan (SBM) Jasa Konsultansi Non-Konstruksi / Telematika Kabupaten Bogor TA 2026.

---

## 7. PERSYARATAN KUALIFIKASI PENYEDIA JASA

1. Memiliki Nomor Induk Berusaha (NIB) dengan KBLI **62019 (Aktivitas Pemrograman Komputer Lainnya)** atau **62020 (Aktivitas Konsultasi Komputer dan Manajemen Fasilitas Komputer)**;
2. Memiliki Sertifikat Badan Usaha (SBU) Jasa Konsultansi Kualifikasi **KECIL** subbidang **Telematika (1.03.05)** / Jasa Konsultansi Telematika dan Sistem Informasi;
3. Memiliki Konfirmasi Status Wajib Pajak (KSWP) dengan status **VALID** pada sistem DJP CoreTax;
4. Terdaftar dan memiliki kinerja Baik/Sangat Baik pada Sistem Informasi Kinerja Penyedia (SIKaP) LKPP;
5. Memiliki pengalaman kerja dalam bidang Jasa Konsultansi Perencanaan Sistem Informasi, Perancangan Software Architecture, atau DED Telematika dalam kurun waktu 3 (tiga) tahun terakhir.

---

## 8. KEBUTUHAN PERSONIL TENAGA AHLI & PENDUKUNG

Penyedia Jasa Konsultansi Perencanaan wajib menyediakan tim tenaga ahli profesional dengan rincian:

| No | Posisi / Peran | Kualifikasi Pendidikan & Keahlian | Jumlah | Tanggung Jawab Utama |
| :---: | :--- | :--- | :---: | :--- |
| **A** | **TENAGA AHLI** | | | |
| 1 | **Team Leader / Ahli Sistem Informasi** | S1 Sarjana Informatika / Sistem Informasi / Ilmu Komputer (Pengalaman min. 4 Tahun di bidang perencanaan software) | 1 Org | Memimpin pelaksanaan studi perencanaan, koordinasi tim ahli, penyusunan arsitektur sistem, quality assurance dokumen DED, dan presentasi laporan ke DPU. |
| 2 | **System & Business Analyst** | S1 Sarjana Informatika / Teknik Industri / Sistem Informasi (Pengalaman min. 3 Tahun) | 1 Org | Menganalisis proses bisnis jasa konstruksi, studi regulasi Permen PUPR 1/2023, menyusun modul pengawasan, SRS/PRD, dan kamus data sistem. |
| 3 | **UI/UX Prototyper / Ahli Desain Antarmuka** | S1 Sarjana Informatika / DKV / Multimedia (Pengalaman min. 3 Tahun) | 1 Org | Merancang sketsa wireframe dan membuat Prototipe Antarmuka Interaktif (Prototype) untuk simulasi navigasi dan fungsionalitas modul sistem. |
| 4 | **GIS & Spatial Data Specialist** | S1 Sarjana Geodesi / Geomatika / Perencanaan Wilayah & Kota (PWK) (Pengalaman min. 3 Tahun) | 1 Org | Merancang skema spasial PostGIS 40 kecamatan, layer tematik proyek APBD/BUJK, dan spesifikasi konversi format Shapefile (.SHP). |
| **B** | **TENAGA PENDUKUNG** | | | |
| 1 | **Tenaga Administrasi / Operator** | SMK / SMA Sederajat (Pengalaman min. 1 Tahun) | 1 Org | Membantu administrasi kegiatan FGD, inventarisasi data, dokumentasi pertemuan, dan penyusunan laporan kerja. |

---

## 9. KELUARAN / OUTPUT PEKERJAAN (DELIVERABLES)

Keluaran yang harus diserahkan oleh Konsultan Perencana berupa dokumen cetak (*hardcopy*) dan berkas digital (*softcopy* dalam flashdisk):

1. **Laporan Pendahuluan (Inception Report)**: Rencana kerja, metodologi perencanaan, jadwal kegiatan, dan hasil kick-off meeting (5 eksemplar).
2. **Laporan Antara (Interim Report)**: Hasil analisis proses bisnis, kajian regulasi, dan Dokumen Spesifikasi Kebutuhan Sistem / PRD (5 eksemplar).
3. **Dokumen DED & Arsitektur Sistem (Final DED Report)**: Dokumen desain arsitektur perangkat lunak, skema basis data PostgreSQL + PostGIS, kamus data, dan protokol keamanan (5 eksemplar).
4. **Berkas Prototipe Antarmuka Interaktif**: File prototipe interaktif (*Clickable Prototype & Wireframe Demo*) yang siap diuji dan disimulasikan.
5. **Laporan Akhir (Final Report) & Executive Summary** (5 eksemplar).

---

## 10. JANGKA WAKTU PELAKSANAAN PEKERJAAN

Jangka waktu pelaksanaan kegiatan jasa konsultansi perencanaan ini ditetapkan selama **60 (enam puluh) Hari Kalender** terhitung sejak diterbitkannya Surat Perintah Mulai Kerja (SPMK).

### Matriks Jadwal Kegiatan Perencanaan:

| No | Tahapan Kegiatan Perencanaan | Minggu 1-2 | Minggu 3-4 | Minggu 5-6 | Minggu 7-8 |
| :---: | :--- | :---: | :---: | :---: | :---: |
| 1 | Mobilisasi Tim, Kick-Off & Penyusunan Metodologi | ■ | | | |
| 2 | Pengumpulan Data Eksisting, Wawancara & Analisis Regulasi | ■ | ■ | | |
| 3 | Penyusunan Laporan Pendahuluan & FGD I | | ■ | | |
| 4 | Analisis Kebutuhan Sistem & Pemodelan Proses Bisnis (SRS) | | ■ | ■ | |
| 5 | Perancangan DED Arsitektur Sistem & Basis Data Spasial PostGIS | | | ■ | ■ |
| 6 | Perancangan Wireframe & Prototipe Antarmuka Interaktif | | | ■ | ■ |
| 7 | Penyusunan Laporan Antara & FGD II (Review Prototipe Antarmuka) | | | | ■ |
| 8 | Finalisasi Laporan Akhir, Executive Summary & Serah Terima | | | | ■ |

---

## 11. PELAPORAN DAN PENUTUP

Konsultan Perencana wajib mempresentasikan hasil setiap tahapan laporan kepada Tim Teknis Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Bogor dalam forum Diskusi/FGD resmi sebelum laporan disahkan.

Ditetapkan di : Cibinong  
Pada tanggal : Agustus 2026  

**Pejabat Pembuat Komitmen (PPK)**  
Dinas Pekerjaan Umum dan Penataan Ruang  
Kabupaten Bogor  



**Bang Fauzy Tea**  
NIP. ----------------------------

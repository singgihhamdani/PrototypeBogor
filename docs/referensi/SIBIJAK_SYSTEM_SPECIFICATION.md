# Dokumentasi & Spesifikasi Sistem SIBIJAK
**(Sistem Informasi Pembinaan Jasa Konstruksi)**

> **Tujuan Dokumen:**  
> Dokumen ini disusun sebagai acuan analisis, spesifikasi kebutuhan sistem (SRS), dan blueprint perancangan untuk pengembangan aplikasi serupa SIBIJAK pada Dinas Cipta Karya, Bina Konstruksi dan Tata Ruang (Diciptabintar).

---

## 1. Ikhtisar Sistem (System Overview)

Sistem **SIBIJAK** adalah platform informasi berbasis web yang berfungsi sebagai pusat data, verifikasi, monitoring, pelatihan, dan pengawasan bagi **Badan Usaha Jasa Konstruksi (BUJK)** dan **Tenaga Kerja Konstruksi (TKK)** di tingkat daerah (Kota/Kabupaten).

### 1.1 Aktor & Peran Pengguna (User Roles)
1. **Super Admin / Admin Dinas (Diciptabintar):**
   - Mengelola master data, memverifikasi pendaftaran, mengelola jadwal pengawasan, input nilai audit/SIMAK, mengelola pelatihan, serta manajemen pengguna/role.
2. **Badan Usaha (BUJK):**
   - Mengisi profil perusahaan, legalitas (NIB, NPWP, Akta), data Sertifikat Badan Usaha (SBU), riwayat pengalaman pekerjaan, dan pelaporan progres proyek berjalan.
3. **Tenaga Kerja Konstruksi / Peserta:**
   - Mendaftar program sertifikasi/pelatihan kompetensi jasa konstruksi, mengunggah portofolio data diri, dan mengunduh sertifikat pelatihan.
4. **Tim Pengawas / Asesor:**
   - Melakukan penilaian kepatuhan, pemeriksaan berkas di lapangan, dan pengisian form evaluasi standar tertib jasa konstruksi.
5. **Publik / Tamu (Guest):**
   - Mengakses direktori regulasi/peraturan, pengumuman pelatihan, dan berita terkait jasa konstruksi.

---

## 2. Struktur Hierarki Menu & Navigasi

```text
SIBIJAK
├── 1. Navigasi
│   └── Dashboard (/dashboard)
├── 2. Pendaftaran
│   ├── Badan Usaha (/pendaftar-adm)
│   └── Pelatihan (/pendaftarpelatihan_adm)
├── 3. Bina Konstruksi
│   ├── Badan Usaha (/badanusaha_adm)
│   ├── Sertifikat Badan Usaha (/sbu_adm)
│   ├── Pengalaman Perusahaan (/pengalaman_adm)
│   └── Progres Pekerjaan (/paket_adm)
├── 4. Pengawasan
│   ├── Penjadwalan (/penjadwalan_adm)
│   ├── Upload File SIMAK (/daftarpengawasan_adm)
│   └── Pemeriksaan (/pemeriksaan_adm)
├── 5. Pelatihan
│   ├── Paket Pelatihan (/pelatihan_adm)
│   ├── Peserta (/peserta_adm)
│   └── Sertifikat (/sertifikat_adm)
├── 6. Pengaturan
│   └── Pengguna
│       ├── User (/pengguna)
│       └── Group / Role (/group)
├── 7. Peraturan (/regulasi-adm)
└── 8. Berita (/berita-adm)
```

---

## 3. Rincian Modul, Fitur & Struktur Data (Tercatat)

### 3.1 Modul: Navigasi - Dashboard (`/dashboard`)
* **Fungsi Utama:** Memberikan gambaran ringkas kondisi eksisting jasa konstruksi daerah secara real-time.
* **Komponen & Widget:**
  - Kartu Metrik (Summary Cards):
    - Total BUJK Terdaftar & Terverifikasi
    - Total Paket Pekerjaan Konstruksi Berjalan
    - Total Peserta Pelatihan / TKK Bersertifikat
    - Agenda Pengawasan Terjadwal
  - Grafik Distribusi:
    - Kualifikasi Usaha (Kecil, Menengah, Besar, Spesialis)
    - Sebaran Wilayah / Kecamatan Proyek
  - Notifikasi / Peringatan SBU Mendekati Masa Kedaluwarsa

---

### 3.2 Modul: Pendaftaran (Registration & Screening)

#### A. Pendaftaran Badan Usaha (`/pendaftar-adm`)
* **Tujuan:** Antrian pendaftaran akun/perusahaan baru sebelum diverifikasi menjadi Master BUJK aktif.
* **Tabel / Kolom Data:**
  - `No`
  - `Nama Perusahaan`
  - `Bentuk Badan Usaha` (PT, CV, Firma, Koperasi, Perorangan)
  - `Penanggung Jawab (PJBU)`
  - `Nomor Kontak / WhatsApp`
  - `Email Perusahaan`
  - `Status Verifikasi` (Draft, Menunggu Verifikasi, Disetujui, Ditolak)
  - `Tanggal Pengajuan`
  - `Aksi` (Review Verifikasi, Setujui, Tolak dengan Catatan, Hapus)
* **Formulir Input Pendaftar (`/pendaftar_adm/form-add`):**
  - Identitas BU: Nama BU, Bentuk BU, NIB (Nomor Induk Berusaha), NPWP Perusahaan.
  - Alamat Kantor: Alamat Lengkap, RT/RW, Kelurahan, Kecamatan, Kota/Kab, Provinsi, Kode Pos.
  - Kontak Resmi: Telepon Kantor, No HP/WA PIC, Email.
  - Dokumen Lampiran: NIB (PDF), NPWP (PDF), Akta Pendirian/Perubahan Terakhir (PDF).

#### B. Pendaftaran Pelatihan (`/pendaftarpelatihan_adm`)
* **Tujuan:** Pendaftaran peserta perorangan atau utusan badan usaha untuk mengikuti agenda pelatihan/sertifikasi kompetensi.
* **Tabel / Kolom Data:**
  - `No`, `Nama Lengkap`, `NIK`, `Jenis Kelamin`, `No Telepon`, `Email`, `Nama BUJK / Instansi Asal`, `Status Verifikasi`, `Aksi`.
* **Formulir Input Peserta (`/pendaftarpelatihan_adm/form-add`):**
  - Data Pribadi: NIK (16 digit), Nama Lengkap, Tempat & Tanggal Lahir, Jenis Kelamin, Agama, Pendidikan Terakhir.
  - Data Domisili & Kontak: Alamat KTP, No WhatsApp, Alamat Email.
  - Data Kepegawaian/Profesi: Nama BUJK / Asosiasi / Mandiri, Jabatan Kerja yang diminati.
  - Berkas Unggahan: Scan KTP, Ijazah Terakhir, Pas Foto Berwarna latar merah/biru.

---

### 3.3 Modul: Bina Konstruksi (Core Data BUJK)

#### A. Data Badan Usaha (`/badanusaha_adm`)
* **Tujuan:** Master data profil legal dan operasional BUJK yang telah terdaftar resmi.
* **Fitur:** Pencarian, Filter berdasarkan Kualifikasi/Bentuk BU, Export Data (Excel/PDF), Detail Profil BU, Edit Data.
* **Struktur Informasi:**
  - Nomor Pokok Wajib Pajak (NPWP)
  - Nomor Induk Berusaha (NIB)
  - Nama Direktur / Penanggung Jawab Utama
  - Penanggung Jawab Teknis (PJT) & Penanggung Jawab Subklasifikasi (PJSK)
  - Status Keaktifan BU

#### B. Sertifikat Badan Usaha - SBU (`/sbu_adm`)
* **Tujuan:** Mengelola daftar SBU yang dimiliki oleh setiap BUJK beserta rincian subklasifikasinya.
* **Hierarki Halaman:** Daftar BU -> Detil SBU Perusahaan (`/sbu_adm/detil/{id}`) -> Form Tambah SBU (`/sbu_adm/form-add/{id}`).
* **Field / Atribut Data SBU:**
  - `Nomor Sertifikat SBU`
  - `Lembaga Penerbit / LSBU / LPJK`
  - `Klasifikasi Bidang Usaha` (Bangunan Gedung, Sipil, Mekanikal/Elektrikal, Spesialis, dsb.)
  - `Kode Subklasifikasi (KBLI)`
  - `Kualifikasi` (Kecil - K1/K2/K3, Menengah - M1/M2, Besar - B1/B2)
  - `Tanggal Terbit SBU`
  - `Masa Berlaku / Tanggal Habis Berlaku`
  - `File Dokumen SBU (PDF)`

#### C. Pengalaman Perusahaan (`/pengalaman_adm`)
* **Tujuan:** Pencatatan portofolio pekerjaan/proyek yang pernah diselesaikan oleh BUJK sebagai bukti kapabilitas teknis.
* **Hierarki Halaman:** Daftar BU -> Detil Riwayat Proyek (`/pengalaman_adm/detil/{id}`) -> Form Tambah Pengalaman (`/pengalaman_adm/form-add/{id}/{subid}`).
* **Field / Atribut Data Pengalaman:**
  - `Nama Paket Pekerjaan`
  - `Pemberi Tugas / Pengguna Jasa` (Pemerintah Daerah, Kementerian, Swasta, BUMN)
  - `Lokasi Pekerjaan`
  - `Nomor Kontrak & Tanggal Kontrak`
  - `Nilai Kontrak (Rupiah)`
  - `Tahun Anggaran Pelaksanaan`
  - `Tanggal Serah Terima Pertama (PHO / BAST 1)`
  - `Tanggal Serah Terima Akhir (FHO / BAST 2)`
  - `File Lampiran Kontrak & BAST (PDF)`

#### D. Progres Pekerjaan Konstruksi (`/paket_adm`)
* **Tujuan:** Monitoring berkala terhadap paket pekerjaan konstruksi yang sedang berjalan (aktif).
* **Field / Indikator Monitoring:**
  - `Nama Paket / Kegiatan`
  - `Tahun Anggaran & Sumber Dana` (APBD Kota, APBD Provinsi, APBN, Swasta)
  - `Nilai Pagu & Nilai Kontrak Terkoreksi`
  - `Penyedia Jasa (Kontraktor Pelaksana & Konsultan Pengawas)`
  - `Jangka Waktu Pelaksanaan` (Mulai - Selesai)
  - `Realisasi Progres Fisik (%)`
  - `Realisasi Progres Keuangan (%)`
  - `Deviasi Progres` (+ / - terhadap Kurva S rencana)
  - `Status / Catatan Masalah di Lapangan`

### 3.4 Modul: Pengawasan (Supervision & Governance)

Modul ini mengimplementasikan alur kerja 3 tahap terintegrasi untuk pengawasan tertib usaha dan teknis BUJK:
1. **Penjadwalan Pengawasan** (Admin Dinas menentukan agenda & periode)
2. **Upload File SIMAK** (Asosiasi berkas instrumen audit/SIMAK per BUJK berdasarkan jadwal)
3. **Pemeriksaan & Evaluasi** (Pelaksanaan audit dan penilaian kepatuhan/hasil pemeriksaan)

#### A. Penjadwalan Pengawasan (`/penjadwalan_adm`)
* **Tujuan:** Mengelola kalender dan periode pengawasan berkala (misal: Semester I, Semester II, Audit Khusus).
* **Tabel / Kolom Data:**
  - `#` (Nomor Urut)
  - `Pengaturan` (Aksi: Ubah Data `/penjadwalan-adm/form-edit/{id}`, Hapus Data)
  - `Tahun` (Tahun Anggaran/Pengawasan)
  - `Nama Penjadwalan` (Contoh: *Pengawasan Periode I Juni - Agustus 2024*)
  - `Periode Pengawasan` (Rentang Tanggal Mulai s.d. Tanggal Akhir)
  - `Keterangan` (Catatan lingkup agenda)
* **Form Tambah Penjadwalan (`/penjadwalan-adm/form-add`):**
  - `Tahun` (Dropdown Select2)
  - `Nama Penjadwalan` (Text Input)
  - `Tanggal Mulai` (Date Picker)
  - `Tanggal Akhir` (Date Picker)
  - `Keterangan` (Rich Text Editor / Summernote)
  - Tombol: `Simpan`

#### B. Upload File SIMAK (`/daftarpengawasan_adm`)
* **Tujuan:** Menghubungkan entitas BUJK dengan instrumen data SIMAK (Sistem Informasi Manajemen Pengawasan Konstruksi) dalam format spreadsheet/Excel.
* **Tabel Utama:**
  - `#`, `Detil` (Tombol navigasi ke `/daftarpengawasan_adm/detil/{company_id}`), `NIB`, `Badan Usaha`, `Jenis Usaha`, `Alamat`, `File Upload` (Counter jumlah file terunggah).
* **Halaman Detil Upload File SIMAK (`/daftarpengawasan_adm/detil/{company_id}`):**
  - Header Profil: Nama BU, Nama Pimpinan, NIB, Jenis Usaha.
  - Tombol: **Tambah** (membuka form upload file).
  - Tabel Berkas Terupload:
    - `#`, `Pengaturan` (Aksi: Download, Edit, Hapus)
    - `Nama Penjadwalan` (Periode pengawasan terkait)
    - `Periode Pengawasan` (Tgl Mulai - Selesai)
    - `File SIMAK` (Tautan file unduhan)
    - `Tgl. Upload`
    - `Status`
* **Form Upload Berkas SIMAK (`/daftarpengawasan-adm/form-add/{company_id}/{schedule_id}`):**
  - `Penjadwalan` (Dropdown Select2 - memilih agenda jadwal pengawasan aktif)
  - `Upload File SIMAK` (File input khusus format Excel / Spreadsheet)
  - Tombol: `Simpan`

#### C. Pemeriksaan & Evaluasi (`/pemeriksaan_adm`)
* **Tujuan:** Melakukan evaluasi kepatuhan terhadap BUJK yang telah melengkapi berkas SIMAK.
* **Tabel Utama:**
  - `#`, `Detil` (Tombol lihat riwayat pemeriksaan `/pemeriksaan_adm/detil/{company_id}`), `NIB`, `Badan Usaha`, `Jenis Usaha`, `Alamat`, `File SIMAK`.
* **Halaman Detil Pemeriksaan (`/pemeriksaan_adm/detil/{company_id}`):**
  - Header Profil BUJK (NIB, Nama BU, Jenis Usaha).
  - Tabel Hasil Pemeriksaan:
    - `#`
    - `Pemeriksaan` (Tombol Aksi untuk menginput/membuka lembar penilaian pemeriksaan)
    - `Tahun`
    - `Nama Penjadwalan`
    - `Hasil Pemeriksaan` (Skor / Kategori Kesesuaian Kepatuhan)

### 3.5 Modul: Pelatihan (Training & Certification)

Modul ini mengelola seluruh siklus pelaksanaan bimbingan teknis / pelatihan keahlian jasa konstruksi:
1. **Paket Pelatihan** (Perencanaan kurikulum, alokasi anggaran, kuota, jadwal, dan kualifikasi)
2. **Peserta Pelatihan** (Penetapan peserta terdaftar per paket pelatihan)
3. **Sertifikat Pelatihan** (Penerbitan nomor sertifikat dan pengelolaan file e-Certificate PDF)

#### A. Paket Pelatihan (`/pelatihan_adm`)
* **Tujuan:** Mengelola daftar paket pelatihan konstruksi yang diselenggarakan oleh dinas.
* **Tabel Utama:**
  - `#` (Nomor Urut)
  - `Pengaturan` (Aksi: Detil Data `/pelatihan_adm/detil/{id}`, Ubah Data `/pelatihan_adm/form-edit/{id}`, Hapus Data)
  - `Nama` (Nama Paket Pelatihan)
  - `Pendaftaran` (Rentang Tgl. Mulai - Tgl. Selesai Pendaftaran)
  - `Pelaksanaan` (Rentang Tgl. Mulai - Tgl. Selesai Pelaksanaan)
  - `Lokasi` (Tempat Penyelenggaraan Pelatihan)
* **Halaman Detil Paket (`/pelatihan_adm/detil/{id}`):**
  - Menampilkan informasi ringkas dan spesifikasi lengkap pelatihan (Tahun Anggaran, Sumber Dana, Kualifikasi, Jenjang KKNI, Klasifikasi, Kuota, Persyaratan, dsb.).
* **Form Tambah/Ubah Paket Pelatihan (`/pelatihan_adm/form-add`):**
  - `Tahun Anggaran` (Dropdown)
  - `Sumber Dana` (Dropdown - misal: APBD Kota, APBN)
  - `Nama Pelatihan` (Text Input)
  - `Penanggung Jawab` (Text Input)
  - `Kualifikasi` (Dropdown - misal: Ahli Muda, Ahli Madya, Terampil)
  - `Jenjang KKNI` (Dropdown - misal: Jenjang 4, 5, 6, 7)
  - `Klasifikasi` (Dropdown Bidang)
  - `Subklasifikasi` (Dropdown Subbidang)
  - `Tgl. Mulai Pendaftaran` & `Tgl. Akhir Pendaftaran` (Date Picker)
  - `Tgl. Mulai Pelaksanaan` & `Tgl. Akhir Pelaksanaan` (Date Picker)
  - `Metode` (Dropdown - misal: Tatap Muka / Offline, Daring / Online, Hybrid)
  - `Lama Jam Pelatihan` (Number Input - Jam Pelajaran / JP)
  - `Lokasi` (Text Input)
  - `Kuota Peserta` (Number Input)
  - `Persyaratan` (Rich Text Editor / Summernote)
  - Tombol: `Simpan`

#### B. Peserta Pelatihan (`/peserta_adm`)
* **Tujuan:** Mengelola daftar peserta yang terdaftar dan diterima ke dalam masing-masing paket pelatihan.
* **Tabel Utama (Master Paket):**
  - `#`, `Pengaturan` (Aksi: **Lihat Peserta** `/peserta_adm/detil/{package_id}`, Export Excel), `Nama Pelatihan`, `Pendaftaran`, `Pelaksanaan`, `Lokasi`, `Jumlah Pendaftar`.
* **Halaman Detil Peserta per Paket (`/peserta_adm/detil/{package_id}`):**
  - Header Ringkasan Paket Pelatihan.
  - Tombol: **Tambah** (membuka form penambahan peserta).
  - Tabel Daftar Peserta:
    - `#`, `Pengaturan` (Hapus Peserta dari Paket)
    - `Nama Peserta`
    - `E-mail`
    - `No. Telepon`
    - `Institusi / BUJK`
    - `Status Peserta` (misal: *Diterima*)
    - `Catatan` (Aksi modal: Lihat / Ubah Catatan Admin)
* **Form Tambah Peserta ke Paket (`/peserta_adm/form-add/{package_id}`):**
  - Fitur Pencarian Cerdas: `Cari Nama Peserta` (Select2 Live Search terhubung ke database pendaftar pelatihan).
  - Profil Peserta Terpilih (Otomatis Terisi / Read-Only):
    - Nama Lengkap, Tempat & Tanggal Lahir, Jenis Kelamin, Pendidikan Terakhir, Instansi/SKPD, Status Pegawai, Jabatan, NIK/KTP, Email, No. Handphone.
  - Tombol: `Simpan`

#### C. Sertifikat Pelatihan (`/sertifikat_adm`)
* **Tujuan:** Manajemen penerbitan, penomoran, dan upload file e-Certificate bagi peserta yang telah lulus pelatihan.
* **Tabel Utama (Master Paket):**
  - `#`, `Detil` (Tombol **Lihat** `/sertifikat_adm/detil/{package_id}`), `Nama Pelatihan`, `Tgl. Pendaftaran`, `Tgl. Pelaksanaan`, `Lokasi`, `Jumlah Peserta`.
* **Halaman Detil Sertifikat per Paket (`/sertifikat_adm/detil/{package_id}`):**
  - Tabel Peserta & Status Sertifikat:
    - `#`
    - `Pengaturan` (Aksi: **Upload Sertifikat**, **Download Sertifikat** PDF)
    - `No. Sertifikat`
    - `Nama Peserta`
    - `Institusi`
    - `Status Pegawai`
    - `Status Kelulusan / Peserta`
    - `Catatan`
* **Modal Dialog Upload Sertifikat:**
  - `No. Sertifikat` (Text Input - misal: *001/SERTIF-BIJAK/2024*)
  - `File Sertifikat` (File Upload Input - format PDF)
  - `Catatan` (Textarea Catatan Tambahan)
  - Tombol: `Simpan`

### 3.6 Modul: Pengaturan & Sistem (User & Role-Based Access Control / RBAC)

Modul ini mengelola keamanan otentikasi akun pengguna dan matriks hak akses (*Permission Control*) berbasis peran (*Group*).

#### A. Manajemen Pengguna / User (`/pengguna`)
* **Tujuan:** Mengelola seluruh akun pengguna yang memiliki akses administratif ke dalam sistem SIBIJAK.
* **Tabel Utama:**
  - `#` (Nomor Urut)
  - `Pengaturan` (Aksi):
    - **Ubah** (Edit profil pengguna di `/pengguna/form-edit/{id}`)
    - **Reset Password** (Reset instan melalui tautan `/pengguna/reset/{id}/{phone}`)
  - `Nama Lengkap`
  - `Username`
  - `Group` (Nama Role, memiliki hyperlink langsung ke konfigurasi izin role di `/group/permission/{group_id}`)
  - `Phone` (Nomor Handphone / WhatsApp)
* **Form Tambah Pengguna (`/pengguna/form-add`):**
  - `Nama Lengkap` (Text Input)
  - `Group` (Dropdown Select - misal: *Administrator*, *Operator*, *CS*)
  - `Username` (Text Input)
  - `Password` (Password Input - minimal 6 karakter)
  - `Konfirmasi Password` (Password Input)
  - `Email` (Email Input)
  - `Handphone` (Phone Input)
  - `Foto` (File Upload Input - Format JPEG / PNG)
  - Tombol: `Simpan`
* **Form Edit Pengguna (`/pengguna/form-edit/{id}`):**
  - Mengubah profil: `Nama Lengkap`, `Group`, `Username`, `Email`, `Handphone`, `Foto` (dilengkapi thumbnail pratinjau).
  - *Fitur Khusus*: Password dipisahkan ke tombol merah **Ubah Password** untuk keamanan.
* **Form Ganti Password (`/pengguna/form-pass/{id}`):**
  - `Password Sekarang`
  - `Password Baru`
  - `Ketik Ulang Password Baru`
  - Tombol: `Simpan`

#### B. Manajemen Group & Hak Akses / Permissions (`/group`)
* **Tujuan:** Mengonfigurasi peran pengguna (*Roles*) dan memetakan hak akses secara terperinci (*granular permissions*) hingga tingkat aksi per menu.
* **Tabel Utama Group:**
  - `#`
  - `Pengaturan` (Aksi):
    - **Permission** (Mengatur hak akses di `/group/permission/{group_id}`)
    - **Ubah** (Edit nama role di `/group/form-edit/{group_id}`)
    - **Hapus** (Hapus role)
  - `Group` (Nama Role)
* **Form Tambah Group (`/group/form-add`):**
  - `Group` (Text Input nama role)
  - Tombol: `Simpan`
* **Matriks Hak Akses / Permission Matrix (`/group/permission/{group_id}`):**
  - Sistem SIBIJAK menerapkan **65 entri permission terperinci** yang dipetakan ke setiap modul dan aksi teknis.
  - **Tabel Permission:**
    - `#` (Nomor Urut)
    - `Permission` (Format: `[Nama Modul] ([Aksi])`)
    - `Status` (Indikator Aktif: Checkmark Hijau / Nonaktif: Tanda Silang Merah)
    - `Aksi` (Tombol saklar: **Tutup Akses** untuk mencabut / **Buka Akses** untuk memberikan izin)
  - **Tipe Aksi Granular yang Diterapkan:**
    - `(Data)`: Izin membaca / melihat daftar data tabel.
    - `(Tambah)`: Izin membuka form dan membuat rekaman data baru.
    - `(Ubah)`: Izin mengedit / memperbarui data yang sudah ada.
    - `(Hapus)`: Izin menghapus rekaman data.
    - `(Detil)`: Izin membuka halaman rincian data.
    - `(Ubah Status)`: Izin menyetujui, menolak, atau mengubah status verifikasi.
    - `(Reset Password)`: Izin mereset kata sandi akun pengguna.

### 3.7 Modul: Konten & Informasi Publik (CMS: Regulasi & Berita)

Modul ini berfungsi sebagai *Content Management System* (CMS) untuk mendistribusikan regulasi hukum resmi serta mempublikasikan berita dan agenda kegiatan dinas.

#### A. Peraturan / Regulasi (`/regulasi-adm`)
* **Tujuan:** Manajemen basis data dokumen peraturan hukum terkait jasa konstruksi (UU, Perpres, Permen, Perda, Perwal, Pedoman Teknis).
* **Tabel Utama:**
  - `#` (Nomor Urut)
  - `PENGATURAN` (Aksi):
    - **Ubah** (Edit data peraturan di `/regulasi-adm/form-edit/{id}`)
    - **Hapus** (Hapus rekaman peraturan dengan konfirmasi dialog)
  - `JENIS PERATURAN` (Contoh: *Peraturan Menteri*, *Peraturan Daerah*, *Undang-Undang*)
  - `JUDUL PERATURAN` (Judul lengkap peraturan)
  - `NO PERATURAN` (Nomor dan kode regulasi, misal: *07/PRT/M/2011*)
  - `SUBJEK` (Subjek / pokok bahasan regulasi)
  - `TAHUN PERATURAN` (Tahun terbit peraturan)
* **Form Tambah/Ubah Peraturan (`/regulasi-adm/form-add`):**
  - `File Peraturan` (File Upload Input - Format PDF)
  - `Jenis Peraturan` (Text Input)
  - `Judul Peraturan` (Text Input)
  - `Penerbit Peraturan` (Text Input - misal: *Kementerian PUPR*, *Pemerintah Kota Bandung*)
  - `Tahun Peraturan` (Text / Number Input)
  - `Nomor Peraturan` (Text Input)
  - `Subjek Peraturan` (Rich Text Editor / Summernote)
  - Tombol: `Simpan`

#### B. Berita & Kegiatan (`/berita-adm`)
* **Tujuan:** Publikasi artikel warta kegiatan, pengumuman resmi, dan informasi perkembangan jasa konstruksi.
* **Tabel Utama:**
  - `#` (Nomor Urut)
  - `PENGATURAN` (Aksi):
    - **Preview / View** (Pratinjau tampilan publik di `/berita/view/{id}`)
    - **Ubah** (Edit konten berita di `/berita-adm/form-edit/{id}`)
    - **Hapus** (Hapus artikel berita)
  - `JUDUL POS` (Judul artikel berita / kegiatan)
  - `TANGGAL` (Timestamp publikasi, misal: *30/04/2026 09:57:05*)
  - `KATEGORI` (Kategori pos: *Berita*, *Kegiatan*, *Pengumuman*)
  - `STATUS` (Status penayangan: *Draft*, *Publish*)
  - `SUMBER` (Nama redaksi/instansi penerbit)
* **Form Tambah/Ubah Berita (`/berita-adm/form-add`):**
  - `Cover` (File Upload Gambar - rekomendasi rasio banner *360 x 180*)
  - `Judul` (Text Input)
  - `File (sisipkan file jika ada)` (File Upload Input lampiran opsional)
  - `Sumber` (Text Input - misal: *Dinas Cipta Karya, Bina Konstruksi dan Tata Ruang*)
  - `Kategori` (Dropdown Select: `Berita`, `Kegiatan`, `Pengumuman`)
  - `Tayang` (Dropdown Select: `Draft`, `Publish`)
  - `Artikel` (Rich Text Editor / Summernote - Isi konten lengkap dengan format gambar/teks)
  - Tombol: `Simpan`

---

## 4. Diagram Relasi Entitas & Skema Database (Database Schema Blueprint)

Untuk membangun aplikasi serupa, berikut pemetaan entitas basis data utama:

```text
[users] (id, username, password, email, phone, photo, group_id)
   |
   +---> [groups] (id, name)
            |
            +---> [group_permissions] (id, group_id, permission_name, is_granted)

[bujk_applicants] (id, name, entity_type, npwp, nib, leader_name, email, phone, status, ...)
   | (Disetujui / Verified)
   V
[bujk_master] (id, applicant_id, name, npwp, nib, leader_name, pjt_name, pjsk_name, is_active)
   |
   +---> [bujk_sbu] (id, bujk_id, cert_number, issuer, classification, subclassification, qualification, valid_until, file_url)
   |
   +---> [bujk_experiences] (id, bujk_id, project_name, owner_name, contract_number, contract_value, fiscal_year, pho_date, fho_date, file_url)
   |
   +---> [bujk_projects] (id, bujk_id, project_name, fiscal_year, funding_source, contract_value, start_date, end_date, physical_progress, financial_progress, ...)
   |
   +---> [supervision_files] (id, bujk_id, schedule_id, simak_file_url, upload_date, status)
            |
            +---> [supervision_schedules] (id, year, name, start_date, end_date, notes)
            |
            +---> [supervision_assessments] (id, bujk_id, schedule_id, score, compliance_status, notes)

[training_applicants] (id, nik, name, gender, education, institution, phone, email, status, ...)
   |
   +---> [training_packages] (id, name, fiscal_year, qualification, kkni_level, reg_start, reg_end, exec_start, exec_end, quota, ...)
            |
            +---> [training_participants] (id, package_id, applicant_id, status, notes)
                     |
                     +---> [training_certificates] (id, participant_id, cert_number, cert_file_url, issued_date)

[regulations] (id, reg_type, title, reg_number, publisher, fiscal_year, subject, file_url)
[news_posts] (id, title, category, status, source, cover_image, attachment_file, content, published_at)
```

---

## 5. Rekomendasi Arsitektur Teknologi untuk Aplikasi Serupa

Jika Anda berencana membangun aplikasi serupa dari awal, berikut rekomendasi stack modern:

1. **Backend / API:**
   - Framework: **Laravel (PHP)** / **NestJS (TypeScript)** / **FastAPI (Python)** / **Go (Fiber/Gin)**.
   - Database: **PostgreSQL** atau **MySQL 8.0+** dengan relasi terindeks rapi.
   - Storage: **S3-Compatible Object Storage (MinIO / AWS S3 / Cloudflare R2)** untuk menyimpan berkas PDF SBU, SIMAK, dan Sertifikat.
2. **Frontend:**
   - Framework: **Next.js (React)** / **Inertia.js + Vue 3** / **Vite + React SPA**.
   - UI Kit: **Tailwind CSS + Shadcn UI** (Modern, clean, responsive, dan ramah aksesibilitas).
3. **Fitur Kunci & Best Practices:**
   - **Role-Based Access Control (RBAC)** dengan permission matrix granular (seperti model 65 actions SIBIJAK).
   - **Multi-step Registration Wizard** dengan validasi NIK/NPWP/NIB realtime.
   - **Document Storage & In-App PDF Viewer:** Preview dokumen PDF (SBU, BAST, SIMAK) langsung di browser tanpa memaksa unduh.
   - **Audit Trail & Activity Log:** Mencatat siapa yang menyetujui, menolak, atau mengedit berkas.
   - **Automated Expiry Alert & Notification:** Peringatan otomatis menjelang habisnya masa berlaku SBU / SKK / Kontrak.

---

*Dokumentasi spesifikasi lengkap SIBIJAK 100% selesai disusun.*

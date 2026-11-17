import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import os
import shutil

wb = openpyxl.Workbook()
# Hapus default sheet
wb.remove(wb.active)

# Color Palette (Navy, Slate, Gold, Green)
NAVY_HEADER = "0F2E5C"
GOLD_ACCENT = "FFC000"
LIGHT_BLUE = "F0F7FF"
LIGHT_GREEN = "ECFDF5"
DARK_GREEN = "065F46"
WHITE = "FFFFFF"
GRAY_TEXT = "475569"
BORDER_COLOR = "CBD5E1"

font_title = Font(name="Calibri", size=16, bold=True, color="0F2E5C")
font_subtitle = Font(name="Calibri", size=11, italic=True, color="64748B")
font_header = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
font_sub_header = Font(name="Calibri", size=10, bold=True, color="0F2E5C")
font_body = Font(name="Calibri", size=10, color="0F172A")
font_body_bold = Font(name="Calibri", size=10, bold=True, color="0F172A")
font_status_success = Font(name="Calibri", size=10, bold=True, color="065F46")

fill_header = PatternFill(start_color=NAVY_HEADER, end_color=NAVY_HEADER, fill_type="solid")
fill_sub_header = PatternFill(start_color="E2E8F0", end_color="E2E8F0", fill_type="solid")
fill_zebra = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
fill_success = PatternFill(start_color="D1FAE5", end_color="D1FAE5", fill_type="solid")

thin_border_side = Side(border_style="thin", color=BORDER_COLOR)
thin_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)
header_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=Side(border_style="medium", color="0F2E5C"))

align_center = Alignment(horizontal="center", vertical="center", wrap_text=True)
align_left = Alignment(horizontal="left", vertical="center", wrap_text=True)
align_right = Alignment(horizontal="right", vertical="center", wrap_text=True)

# ==============================================================================
# SHEET 1: REKAP_PEMBARUAN_SISTEM
# ==============================================================================
ws1 = wb.create_sheet(title="Log Pembaruan Sistem")
ws1.views.sheetView[0].showGridLines = True

# Title block
ws1.cell(row=2, column=2, value="LOG CATATAN PEMBARUAN & PENYELARASAN SISTEM SIJAKON VS SIPJAKI").font = font_title
ws1.cell(row=3, column=2, value="Pemerintah Kabupaten Bogor — Dinas Pekerjaan Umum dan Penataan Ruang (DPUPR)").font = font_subtitle
ws1.cell(row=4, column=2, value="Dokumen Rekam Jejak Pembaruan Menu Perencanaan, Pelaksanaan & Pelaporan Pengawasan 3 Pilar Tertib").font = font_subtitle

headers1 = [
    "NO", "MODUL / MENU", "PILAR TERTIB", "APA YANG DIRUBAH", 
    "DESKRIPSI PERUBAHAN", "KOLOM YANG DIBUTUHKAN", "BUKTI & VERIFIKASI", "STATUS"
]

header_row1 = 6
for col_idx, h in enumerate(headers1, start=2):
    cell = ws1.cell(row=header_row1, column=col_idx, value=h)
    cell.font = font_header
    cell.fill = fill_header
    cell.alignment = align_center
    cell.border = header_border
ws1.row_dimensions[header_row1].height = 28

data_sheet1 = [
    (
        1,
        "Perencanaan Pengawasan — Menu Timeline",
        "Tertib Usaha, Tertib Penyelenggaraan, Tertib Pemanfaatan",
        "1. Penambahan kolom 'Wilayah' & 'Tahun Anggaran'\n2. Mempertahankan kolom 'Target Objek'\n3. Penambahan tombol Aksi 'Edit' (Modal Pre-filled)\n4. Penambahan tombol Aksi 'Hapus' (Dialog Konfirmasi)",
        "Menyelaraskan struktur kolom standar pelaporan SIPJAKI Kementerian PUPR yang mewajibkan informasi Wilayah dan Tahun, sekaligus mempertahankan keunggulan operasional SIJAKON Kab. Bogor yang memiliki metrik Target Objek BUJK/Proyek untuk alokasi pengawas.",
        "• Wilayah (Kecamatan/Kab. Bogor)\n• Tahun Anggaran (2026)\n• Target Objek (Jumlah BUJK/Proyek)\n• Nama Kegiatan Pengawasan\n• Periode Pengawasan\n• Waktu Mulai & Selesai\n• Status Pelaksanaan\n• Dokumen KAK Jadwal (PDF)\n• Aksi: Detail, Edit, Hapus",
        "• Migration: 006_perencanaan_timeline_schema.sql\n• Supabase: Tabel pengawasan_timeline_perencanaan (5 baris data live)\n• Script Uji: test_supabase_timeline.js (Lulus CRUD 100%)\n• Bukti Visual: screenshot_timeline_tabel.png, screenshot_timeline_edit_modal.png, screenshot_timeline_delete_dialog.png\n• Route: /pengawasan/tertib-usaha/perencanaan/timeline",
        "SELESAI (100% LIVE)"
    ),
    (
        2,
        "Perencanaan Pengawasan — Menu Anggaran",
        "Tertib Usaha, Tertib Penyelenggaraan, Tertib Pemanfaatan",
        "1. Penambahan kolom 'Wilayah' & 'Tahun Anggaran'\n2. Mempertahankan 'Pagu Anggaran', 'Realisasi', '% Serapan', dan 'Sumber Dana'\n3. Penambahan tombol Aksi 'Edit' (Modal Pre-filled Anggaran)\n4. Penambahan tombol Aksi 'Hapus' (Dialog Konfirmasi)",
        "Menyelaraskan paritas SIPJAKI (Wilayah, Jumlah Anggaran, Dokumen, Status, Aksi Edit/Hapus) dengan mempertahankan keunggulan operasional manajerial SIJAKON untuk memantau Realisasi Belanja, Persentase Serapan, dan Sumber Pembiayaan (APBD Kab. Bogor, DAK Fisik, Banprov) guna mencegah SiLPA.",
        "• Wilayah Penugasan\n• Tahun Anggaran (2026)\n• Uraian Program & Sub-Kegiatan RKA\n• Pagu Anggaran (Jumlah Anggaran SIPJAKI)\n• Realisasi Belanja (SIJAKON)\n• Persentase Serapan (%)\n• Sumber Dana (APBD/DAK/Banprov)\n• Dokumen RKA/DPA (PDF)\n• Status Alokasi\n• Aksi: Detail, Edit, Hapus",
        "• Migration: 007_perencanaan_anggaran_schema.sql\n• Supabase: Tabel pengawasan_anggaran_perencanaan (4 baris data live)\n• Script Uji: test_supabase_anggaran.js (Lulus CRUD 100%)\n• Bukti Visual: screenshot_anggaran_tabel.png, screenshot_anggaran_edit_modal.png, screenshot_anggaran_delete_dialog.png\n• Route: /pengawasan/tertib-usaha/perencanaan/anggaran",
        "SELESAI (100% LIVE)"
    ),
    (
        3,
        "Pelaksanaan Pengawasan — Menu Pelaksanaan (SIMAK 1)",
        "Tertib Usaha, Tertib Penyelenggaraan, Tertib Pemanfaatan",
        "1. Penerapan Standar 7 Kolom Utama SIPJAKI (Opsi 2)\n2. Penghapusan istilah 'Audit' & 'Skor Tertib' numerik\n3. Penggantian skor numerik menjadi pilihan tegas 'Patuh' atau 'Tidak Patuh'\n4. Penggantian istilah 'Berita Acara (BAP)' menjadi 'Dokumen'\n5. Penambahan tombol Aksi 'Edit' & 'Hapus'\n6. Default sorting urutan terkini (Terbaru di atas sampai terlama)",
        "Harmonisasi total layout makro SIPJAKI Kementerian PUPR pada tabel utama (No, Tanggal Pengawasan, Tahun, Wilayah & Objek, Dokumen, Status, Aksi). Isian formulir detail SIMAK 1 (Produsen, Pemilik, Kontak, Kualifikasi, Kepemilikan Izin, Keabsahan Izin, Kapasitas, Izin Bahan Baku BB, Keabsahan BB) disimpan terstruktur di form modal dan basis data.",
        "• No (Urut Otomatis)\n• Tanggal Pengawasan (Terkini di Atas)\n• Tahun Anggaran (2026)\n• Wilayah & Objek (Kecamatan + Nama Produsen/BUJK + Kualifikasi)\n• Dokumen (Berkas PDF Pengawasan)\n• Status (Hasil Kepatuhan Patuh/Tidak Patuh & Status Verifikasi)\n• Aksi: Detail, Edit, Hapus, Verifikasi\n• [Form Detail]: Kualifikasi, Nama Produsen, Nama Pemilik, No Kontak, Izin Berusaha, SBU, Kapasitas, Izin BB, Keabsahan BB, Catatan, Rekomendasi",
        "• Migration: 008_pelaksanaan_tertib_usaha_schema.sql\n• Supabase: Tabel pengawasan_sesi (12 baris data live)\n• Script Uji: test_supabase_pelaksanaan.js (Lulus CRUD 100%)\n• Bukti Visual: screenshot_pelaksanaan_tabel.png, screenshot_pelaksanaan_edit_modal.png, screenshot_pelaksanaan_delete_dialog.png\n• Route: /pengawasan/tertib-usaha/pelaksanaan",
        "SELESAI (100% LIVE)"
    ),
    (
        4,
        "Pelaporan Pengawasan — Menu Pelaporan",
        "Tertib Usaha, Tertib Penyelenggaraan, Tertib Pemanfaatan",
        "1. Penerapan Standar Format 8 Kolom SIPJAKI (NO, JENIS LAPORAN, NAMA LAPORAN, TAHUN, WILAYAH, DOKUMEN, STATUS, AKSI)\n2. Penyediaan tombol interaktif 'Lihat' Dokumen Resmi (Navy + Eye + Popout Icon)\n3. Penambahan fitur 'Edit' pada kolom Aksi (Modal Pre-filled)\n4. Penambahan fitur 'Hapus' pada kolom Aksi (Dialog Konfirmasi Aman)\n5. Mempertahankan nilai tambah analitik lokal (Jumlah Objek Diawasi & Indeks Kepatuhan %)\n6. Penyusunan Database Supabase Migration 009 (public.pengawasan_pelaporan)",
        "Standardisasi menyeluruh tabel pelaporan 3 pilar tertib agar 100% identik dengan format SIPJAKI Kementerian PUPR. Menggantikan tampilan lama yang memecah dokumen di kolom aksi menjadi tombol 'Lihat' terdedikasi, serta melengkapi tata kelola data dengan fitur Edit metadata dan Hapus berkas pelaporan terintegrasi audit log.",
        "• No (Urut Otomatis)\n• Jenis Laporan (Tahunan, Semesteran, Triwulanan, Insidental)\n• Nama Laporan (Huruf Kapital Baku)\n• Tahun Anggaran (2026)\n• Wilayah (Hierarki JAWA BARAT / KABUPATEN BOGOR)\n• Dokumen (Tombol 'Lihat' Pratinjau PDF)\n• Status (Menunggu Verifikasi, Terverifikasi, Perlu Revisi, Draft)\n• Aksi: Edit, Hapus, Ekspor Rekap Excel\n• [Nilai Tambah Daerah]: Cakupan Objek Diawasi & Indeks Kepatuhan Rata-rata (%)",
        "• Migration: 009_pelaporan_pengawasan_schema.sql\n• Supabase: Tabel pengawasan_pelaporan (Skema & 8 Baris Seed Siap Dieksekusi)\n• Script Uji: test_supabase_pelaporan.js (CRUD Ready)\n• Bukti Visual: screenshot_pelaporan_tabel.png, screenshot_pelaporan_edit_modal.png, screenshot_pelaporan_delete_dialog.png, screenshot_pelaporan_lihat_dokumen.png\n• Route: /pengawasan/tertib-usaha/pelaporan",
        "SELESAI & TERVERIFIKASI"
    ),
    (
        5,
        "Pelaksanaan Pengawasan — Menu Pelaksanaan (SIMAK 2)",
        "Tertib Penyelenggaraan Jasa Konstruksi (Paket Proyek Fisik)",
        "1. Penerapan Standar 11 Parameter SIMAK 2 SIPJAKI Kementerian PUPR pada Tertib Penyelenggaraan\n2. Polimorfisme Tampilan Tabel: Khusus Tertib Penyelenggaraan menampilkan kolom Nama Proyek, Nilai Proyek (Rp), Nomor Perjanjian, Waktu Pelaksanaan, Penyedia Jasa, Pemilik Pekerjaan, Waktu Pengawasan, Propinsi, Kab/Kota\n3. Fitur Auto-Populate Form dari Master Paket Pekerjaan APBD Kab. Bogor\n4. Modal Edit & Modal Tambah Form Khusus 11 Parameter SIMAK 2\n5. Penambahan tombol Aksi Edit (Pre-filled) dan Hapus (Dialog Konfirmasi Aman)",
        "Menyelaraskan modul Pelaksanaan Pengawasan pada pilar Tertib Penyelenggaraan dengan standar baku SIPJAKI SIMAK 2 (pengawasan terhadap paket pekerjaan konstruksi fisik, kontraktor pelaksana, nomor SPK, masa pelaksanaan, dan PPK), terintegrasi langsung dengan database paket pekerjaan Kabupaten Bogor.",
        "• No (Nomor Urut Dinamis)\n• Nama Proyek (Paket Pekerjaan Fisik)\n• Nilai Proyek (Nilai Kontrak Format Rupiah)\n• Nomor Perjanjian (Nomor Kontrak / SPK)\n• Waktu Pelaksanaan (Hari Kalender)\n• Penyedia Jasa (Kontraktor Pelaksana)\n• Nama Pemilik Pekerjaan (PPK / Dinas PUPR)\n• Waktu Pengawasan (Tanggal Inspeksi Lapangan)\n• Propinsi & Kab/Kota (Jawa Barat / Kab. Bogor)\n• Status (Kepatuhan Patuh/Tidak Patuh & Status Verifikasi)\n• Dokumen (Berkas PDF Pengawasan SIMAK 2)\n• Aksi: Detail, Edit, Hapus, Verifikasi",
        "• Migration: 010_pelaksanaan_tertib_penyelenggaraan_schema.sql\n• Supabase: Tabel pengawasan_sesi (+7 kolom SIMAK 2)\n• Script Uji: test_supabase_simak2.js (CRUD SIMAK 2)\n• Bukti Visual: screenshot_simak2_tabel.png, screenshot_simak2_edit_modal.png, screenshot_simak2_delete_dialog.png, screenshot_simak2_add_modal.png\n• Route: /pengawasan/tertib-penyelenggaraan/pelaksanaan",
        "SELESAI (100% LIVE)"
    ),
    (
        6,
        "Pelaksanaan Pengawasan — Menu Pelaksanaan (SIMAK 3)",
        "Tertib Pemanfaatan Jasa Konstruksi (Bangunan Purna-Konstruksi)",
        "1. Penerapan Standar 10 Parameter SIMAK 3 SIPJAKI Kementerian PUPR pada Tertib Pemanfaatan\n2. Polimorfisme Tampilan Tabel: Khusus Tertib Pemanfaatan menampilkan kolom Nama Bangunan, Lokasi, Nama Pemilik, Nama Pengelola, Waktu Pengawasan, Propinsi, Kab/Kota, Status, Dokumen, Aksi\n3. Form Modal Tambah & Edit Khusus SIMAK 3 (Fungsi Bangunan & Status SLF)\n4. Penambahan tombol Aksi Edit (Pre-filled) dan Hapus (Dialog Konfirmasi Aman)\n5. Template Ekspor Excel Standar SIPJAKI SIMAK 3 (TEMPLATE_PELAKSANAAN_SIMAK3)",
        "Menyelaraskan modul Pelaksanaan Pengawasan pada pilar Tertib Pemanfaatan dengan standar baku SIPJAKI SIMAK 3 (pengawasan kelaikan fungsi bangunan, operasional & pemeliharaan O&P, dan status SLF terhadap gedung/infrastruktur purna-konstruksi Kabupaten Bogor).",
        "• No (Nomor Urut Dinamis)\n• Nama Bangunan (Identitas Gedung/Infrastruktur)\n• Lokasi (Alamat & Wilayah Bangunan)\n• Nama Pemilik (Entitas Pemilik Aset)\n• Nama Pengelola (Unit/Badan Pengelola O&P)\n• Waktu Pengawasan (Tanggal Inspeksi Kelaikan Lapangan)\n• Propinsi & Kab/Kota (Jawa Barat / Kab. Bogor)\n• Status (Kepatuhan Patuh/Tidak Patuh & Status Verifikasi)\n• Dokumen (Berkas Dokumen BAP SIMAK 3)\n• Aksi: Detail, Edit, Hapus, Verifikasi",
        "• Migration: 011_pelaksanaan_tertib_pemanfaatan_schema.sql\n• Supabase: Tabel pengawasan_sesi (+nama_bangunan, nama_pemilik, nama_pengelola, fungsi_bangunan, status_slf)\n• Script Uji: test_supabase_simak3.js (CRUD SIMAK 3)\n• Bukti Visual: screenshot_simak3_tabel.png, screenshot_simak3_edit_modal.png, screenshot_simak3_delete_dialog.png, screenshot_simak3_add_modal.png\n• Route: /pengawasan/tertib-pemanfaatan/pelaksanaan",
        "SELESAI (100% LIVE)"
    ),
    (
        7,
        "Profil OPD & SDM SIPJAKI (3 Pilar Utama)",
        "Master Data Kelembagaan & Pengawasan SIPJAKI Pusat",
        "1. Penerapan Standar 3 Pilar Baku Profil OPD SIPJAKI Kementerian PUPR:\n   • Pilar 1: Profil OPD & SDM (Tipe, Kategori, Bidang, Seksi, Level Suburusan, Alamat, Kontak, PNS, Pejabat Manajerial/Fungsional, P3K, Non ASN)\n   • Pilar 2: Data Pendukung & Anggaran (PIC, SK Admin/Penyelenggara, Regulasi SOTK & Perda Jakon, Dokumen, Anggaran n & n+1)\n   • Pilar 3: Pelaksanaan & Pengawasan (Tugas Utama & Pelatihan TKK, BUJK & TKK Wilayah, Realisasi Pengawasan 3 SIMAK & Target RPJMD)\n2. Layanan Terpadu fetchOpdSipjakiProfile & Auto-Rollup SIMAK\n3. Antarmuka Tab Komprehensif dengan Mode Edit Terintegrasi",
        "Menghubungkan identitas dinas pembina jasa konstruksi Kabupaten Bogor secara utuh dengan standar nasional SIPJAKI Pusat dan Perpres/Permen PUPR.",
        "• Profil OPD & SDM (12 Atribut)\n• PIC & Penyelenggara SIPJAKI (8 Atribut)\n• Dokumen & Regulasi Jakon (7 Atribut)\n• Anggaran Unit Kerja n & n+1 (4 Atribut)\n• Pelatihan TKK & RPJMD (6 Atribut)\n• Rantai Pasok Wilayah (4 Atribut)\n• Rekapitulasi SIMAK Auto-Rollup (9 Atribut)\n• Dokumen Unduh Resmi (SK/Sprint)",
        "• Migration: 012_profil_opd_sipjaki_schema.sql\n• Supabase: Tabel profil_opd_sipjaki (50+ kolom)\n• Script Uji: test_supabase_opd.js\n• Bukti Visual: screenshot_opd_tab1_profil_sdm.png, screenshot_opd_tab2_data_pendukung.png, screenshot_opd_tab3_pelaksanaan_pengawasan.png, screenshot_opd_edit_mode.png\n• Route: /profil-opd",
        "SELESAI (100% LIVE)"
    ),
    (
        8,
        "Data Paket Pekerjaan Konstruksi (19 Kolom SIPJAKI)",
        "Pilar 2 Penyelenggaraan — Pemantauan Proyek & Kontrak",
        "1. Standardisasi Format Tabel 19 Kolom Lengkap SIPJAKI Pusat:\n   • Tahun, Nama Pekerjaan, Nilai Kontrak (Rp), Progress Fisik (%), Progress Keuangan (%), Status, Mulai, Selesai, Propinsi, Kota, Fisik (Bulan), Keuangan (Bulan), Sumber Dana, Pengguna Jasa, Penyedia NIB, Penyedia Nama, Jenis Kontrak, Karakteristik Kontrak, Aksi\n2. Klasifikasi Bentuk Imbalan Jenis Kontrak ('Harga Satuan', 'Lump sum', 'Gabungan', 'Turn key')\n3. Klasifikasi Karakteristik Kontrak ('Tahun Tunggal', 'Tahun Jamak')\n4. Default Filter & Sorting: Riwayat Pelaporan Terkini (updated_at DESC / terbaru di atas)\n5. Dua Kartu Rekapitulasi Utama: Total Paket Pekerjaan & Total Nilai Kontrak (Rupiah Akuntansi)\n6. Fitur Filter Terpadu: Filter Tahun, Sumber Dana, Jenis Kontrak, Karakteristik, Reset, Show Entries, Quick Search\n7. Modal Tambah Paket, Modal Edit Lengkap, dan Dialog Hapus Aman",
        "Menyediakan visibilitas penuh terhadap seluruh paket pekerjaan konstruksi fisik APBD/DAK/APBN Kabupaten Bogor dengan format 19 kolom baku SIPJAKI Kementerian PUPR.",
        "• 1. TAHUN (tahun_anggaran)\n• 2. NAMA PEKERJAAN (nama_paket + Link Detail)\n• 3. NILAI KONTRAK (Format Rp Akuntansi)\n• 4. PROGRESS FISIK (%) (Persentase + Progress Bar)\n• 5. PROGRESS KEUANGAN (%) (Persentase + Progress Bar)\n• 6. STATUS (StatusBadge: Pelaksanaan/Selesai)\n• 7. MULAI (tanggal_mulai)\n• 8. SELESAI (tanggal_selesai)\n• 9. PROPINSI (Jawa Barat)\n• 10. KOTA (Kabupaten Bogor)\n• 11. FISIK BULAN (Agustus)\n• 12. KEUANGAN BULAN (Agustus)\n• 13. SUMBER DANA (APBD, DAK, APBN, Banprov)\n• 14. PENGGUNA JASA (Dinas Pemilik)\n• 15. PENYEDIA NIB (Monospace 13 Digit)\n• 16. PENYEDIA NAMA (PT/CV Kontraktor)\n• 17. JENIS KONTRAK (Harga Satuan/Lump sum/Gabungan/Turn key)\n• 18. KARAKTERISTIK KONTRAK (Tahun Tunggal/Jamak)\n• 19. AKSI (Detail, Edit, Hapus)",
        "• Migration: 013_paket_pekerjaan_sipjaki_schema.sql\n• Supabase: Tabel paket_pekerjaan (+karakteristik_kontrak, propinsi, kab_kota, bulan_progres_keuangan, indeks updated_at DESC)\n• Script Uji: test_supabase_paket.js (CRUD Paket Pekerjaan)\n• Bukti Visual: screenshot_paket_tabel_19_kolom.png, screenshot_paket_edit_modal.png, screenshot_paket_delete_dialog.png, screenshot_paket_add_modal.png\n• Route: /paket-pekerjaan",
        "SELESAI (100% LIVE)"
    ),
    (
        9,
        "Data Kecelakaan Konstruksi (SMKK 11 Kolom SIPJAKI)",
        "Keselamatan Konstruksi (SMKK Permen PUPR No. 10/2021)",
        "1. Standardisasi Format Tabel 11 Kolom Baku SIPJAKI SMKK:\n   • PEKERJAAN, PERUSAHAAN, LOKASI, WAKTU, DESKRIPSI, KERUGIAN, MASALAH, KOTA, PROVINSI, SUMBER DANA, AKSI\n2. Penambahan Kolom 'SUMBER DANA' (APBD, DAK, APBN, Bantuan Keuangan)\n3. Penambahan Kolom 'KERUGIAN' (Kategori keparahan & estimasi kerugian nominal Rp)\n4. Dua Kartu Informasi Utama: TOTAL KEJADIAN & KECELAKAAN TAHUN BERJALAN (2026)\n5. Default Sorting Riwayat Pelaporan Terkini (updated_at DESC)\n6. Peralatan Pengelolaan: Import Excel, TAMBAH DATA, Edit Kejadian, Pratinjau Dokumen BAP K3, Dialog Hapus",
        "Menyediakan pencatatan dan pelaporan investigasi insiden kecelakaan kerja konstruksi sesuai standar SMKK Kementerian PUPR dengan pembagian keparahan dampak (Luka Ringan, Luka Berat, Fatalitas, Near Miss) dan akar masalah unsafe action / condition.",
        "• 1. PEKERJAAN (nama_pekerjaan)\n• 2. PERUSAHAAN (nama_perusahaan)\n• 3. LOKASI (STA / Lokasi Kejadian)\n• 4. WAKTU (Tanggal & Jam Kejadian)\n• 5. DESKRIPSI (Kronologi Kejadian)\n• 6. KERUGIAN (Kategori Keparahan + Nominal Rp)\n• 7. MASALAH (Penyebab Unsafe Action/Condition)\n• 8. KOTA (Kabupaten Bogor)\n• 9. PROVINSI (Jawa Barat)\n• 10. SUMBER DANA (APBD, DAK, APBN, Bantuan Keuangan)\n• 11. AKSI (BAP K3, Edit, Hapus)",
        "• Migration: 014_kecelakaan_kerja_sipjaki_schema.sql\n• Supabase: Tabel kecelakaan_kerja (11 kolom + RLS + Indeks)\n• Bukti Visual: screenshot_kecelakaan_tabel_11_kolom.png, screenshot_kecelakaan_add_modal.png, screenshot_kecelakaan_edit_modal.png, screenshot_kecelakaan_delete_dialog.png, screenshot_kecelakaan_bap_modal.png\n• Route: /kecelakaan",
        "SELESAI (100% LIVE)"
    ),
    (
        10,
        "Dashboard Pelatihan & Sertifikasi TKK (10 Kolom SIPJAKI)",
        "Pengembangan SDM & Sertifikasi TKK (Permen PUPR No. 1/2023)",
        "1. Standardisasi Tabel 10 Kolom Baku e-Pelatihan SIPJAKI Pusat:\n   • Kotak Centang (Checkbox), TAHUN, NAMA KEGIATAN PELATIHAN, METODE, LOKASI, L, P, KABUPATEN/KOTA, PROVINSI, AKSI\n2. Tombol Aksi Massal HAPUS TERPILIH dengan seleksi multi-checkbox\n3. Pemisahan Gender L (Laki-laki) dan P (Perempuan) untuk indikator PUG\n4. Tombol EXPORT (Spreadsheet) dan PRINT (Print-friendly Layout)\n5. Dua Kartu Ringkasan Informasi: TOTAL KEGIATAN PELATIHAN (7) & TOTAL PESERTA TERDAFTAR (94)\n6. Filter Terpadu: TAHUN ANGGARAN, METODE, RESET, Show entries, Cari pelatihan...\n7. Tiga Ikon Aksi Khusus: Mata Biru (Detail), Pensil Kuning (Edit), Tempat Sampah Merah (Hapus)",
        "Menyediakan modul rekapitulasi data penyelenggaraan bimtek, vokasi, dan uji sertifikasi tenaga kerja konstruksi (TKK) Kabupaten Bogor yang selaras penuh dengan standar modul e-Pelatihan SIPJAKI Bina Konstruksi PUPR.",
        "• 1. Kotak Centang (Checkbox Multi-select)\n• 2. TAHUN (tahun anggaran)\n• 3. NAMA KEGIATAN PELATIHAN (nama program + status)\n• 4. METODE (Reguler, Hybrid, MTU, OJT, Daring)\n• 5. LOKASI (Venue & Alamat Praktik)\n• 6. L (Jumlah Peserta Laki-laki)\n• 7. P (Jumlah Peserta Perempuan)\n• 8. KABUPATEN/KOTA (Kabupaten Bogor)\n• 9. PROVINSI (Jawa Barat)\n• 10. AKSI (Detail Mata Biru, Edit Pensil Kuning, Hapus Sampah Merah)\n• [Alat Bantu]: EXPORT, PRINT, HAPUS TERPILIH, Import Pelatihan, TAMBAH PELATIHAN",
        "• Migration: 015_pelatihan_sipjaki_schema.sql\n• Supabase: Tabel pelatihan_sipjaki (RLS & Seed 7 Kegiatan, 94 Peserta)\n• Bukti Visual: screenshot_pelatihan_tabel_10_kolom.png, screenshot_pelatihan_add_modal.png, screenshot_pelatihan_edit_modal.png, screenshot_pelatihan_detail_modal.png, screenshot_pelatihan_bulk_delete_dialog.png\n• Route: /sipjaki/pelatihan",
        "SELESAI (100% LIVE)"
    ),
    (
        11,
        "Perencanaan Pelatihan & Sertifikasi TKK (9 Kolom SIPJAKI)",
        "Penyelenggaraan & Fasilitasi Sertifikasi TKK (Permen PUPR No. 1/2023)",
        "1. Penerapan Standar Tabel 9 Kolom Baku SIPJAKI Pusat:\n   • NO, WILAYAH, KABUPATEN/KOTA, PROVINSI, TARGET PELAKSANAAN, TAHUN, DOKUMEN, STATUS, AKSI\n2. Tiga Kartu Ringkasan Kondisi Tahun Berjalan (2026):\n   • TOTAL DATA (TAHUN BERJALAN) (1 Data)\n   • TOTAL TARGET (TAHUN BERJALAN) (3 Pelaksanaan)\n   • STATUS DATA (TAHUN BERJALAN) (Menunggu Verifikasi)\n3. Filter STATUS VERIFIKASI (Semua Status, Menunggu Verifikasi, Terverifikasi, Ditolak)\n4. Tombol Interaktif 'Lihat' Dokumen KAK Resmi dengan opsi buka tab baru\n5. Dua Ikon Aksi Khusus: Pensil Kuning (Edit Usulan) & Tempat Sampah Merah (Hapus)\n6. Tombol Pengelolaan Utama: TAMBAH DATA di pojok kanan atas",
        "Menyediakan instrumen pengajuan rencana kerja tahunan pembinaan TKK daerah kepada Balai Jasa Konstruksi Wilayah / Kementerian PUPR dalam format baku agregat per wilayah.",
        "• 1. NO (Nomor urut 1, 2, ...)\n• 2. WILAYAH (JAWA BARAT, KABUPATEN BOGOR)\n• 3. KABUPATEN/KOTA (KABUPATEN BOGOR)\n• 4. PROVINSI (JAWA BARAT)\n• 5. TARGET PELAKSANAAN (3 Pelaksanaan)\n• 6. TAHUN (2026)\n• 7. DOKUMEN (Tombol 'Lihat' Dokumen KAK PDF)\n• 8. STATUS (Menunggu Verifikasi / Terverifikasi / Ditolak)\n• 9. AKSI (Edit Pensil Kuning & Hapus Tempat Sampah Merah)\n• [Alat Bantu]: TAMBAH DATA, Filter Status, Tampilkan entri, Cari, Paginasi",
        "• Migration: 016_perencanaan_pelatihan_sipjaki_schema.sql\n• Supabase: Tabel pelatihan_perencanaan_sipjaki (RLS & Seed TA 2026 & 2025)\n• Bukti Visual: screenshot_perencanaan_pelatihan_tabel_9_kolom.png, screenshot_perencanaan_pelatihan_add_modal.png, screenshot_perencanaan_pelatihan_doc_modal.png, screenshot_perencanaan_pelatihan_edit_modal.png, screenshot_perencanaan_pelatihan_delete_dialog.png\n• Route: /pelatihan/perencanaan",
        "SELESAI (100% LIVE)"
    ),
    (
        12,
        "Laporan Pelatihan & Sertifikasi TKK (11 Kolom SIPJAKI)",
        "Penyelenggaraan & Fasilitasi Sertifikasi TKK (Permen PUPR No. 1/2023)",
        "1. Penerapan Standar Tabel 11 Kolom Baku Laporan SIPJAKI Pusat:\n   • NO, WILAYAH, KABUPATEN/KOTA, PROVINSI, NAMA KEGIATAN, TANGGAL, JUMLAH TKK, TAHUN, DOKUMEN, STATUS, AKSI\n2. Tiga Kartu Ringkasan Capaian Tahun Berjalan (2026):\n   • TOTAL DATA (TAHUN BERJALAN) (3 Data Laporan)\n   • TOTAL TKK (TAHUN BERJALAN) (90 Orang TKK)\n   • STATUS TERAKHIR (TAHUN BERJALAN) (Menunggu Verifikasi)\n3. Filter STATUS VERIFIKASI (Semua Status, Menunggu Verifikasi, Terverifikasi, Ditolak)\n4. Tombol Interaktif 'Lihat' Dokumen Berita Acara (BA) / Laporan Resmi dengan opsi buka tab baru\n5. Dua Ikon Aksi Khusus: Pensil Kuning (Edit Data Laporan) & Tempat Sampah Merah (Hapus)\n6. Tombol Pengelolaan Utama: 'Lihat Rekap Pelatihan' (ke /pelatihan/rekapitulasi) & '+ TAMBAH DATA'\n7. Catatan Khusus Pengguna: Tidak memerlukan ekspor fisik spreadsheet terpisah",
        "Menyediakan modul pelaporan realisasi kegiatan bimtek dan fasilitasi uji sertifikasi TKK Kabupaten Bogor dengan verifikasi dokumen Berita Acara (BA) resmi sesuai format pelaporan SIPJAKI Pusat.",
        "• 1. NO (Nomor urut 1, 2, ...)\n• 2. WILAYAH (JAWA BARAT, KABUPATEN BOGOR)\n• 3. KABUPATEN/KOTA (KABUPATEN BOGOR)\n• 4. PROVINSI (JAWA BARAT)\n• 5. NAMA KEGIATAN (Judul program pelatihan resmi)\n• 6. TANGGAL (Format DD/MM/YYYY)\n• 7. JUMLAH TKK (Format: 30 Orang)\n• 8. TAHUN (Format: 2026)\n• 9. DOKUMEN (Tombol 'Lihat' Dokumen BA PDF & Tab Baru)\n• 10. STATUS (Menunggu Verifikasi / Terverifikasi / Ditolak)\n• 11. AKSI (Edit Pensil Kuning & Hapus Tempat Sampah Merah)\n• [Alat Bantu]: Lihat Rekap Pelatihan, TAMBAH DATA, Filter Status, Tampilkan entri, Cari, Paginasi",
        "• Migration: 017_laporan_pelatihan_sipjaki_schema.sql\n• Supabase: Tabel pelatihan_laporan_sipjaki (RLS & Seed 3 Data TA 2026 = 90 TKK + TA 2025)\n• Bukti Visual: screenshot_laporan_pelatihan_tabel_11_kolom.png, screenshot_laporan_pelatihan_add_modal.png, screenshot_laporan_pelatihan_doc_modal.png, screenshot_laporan_pelatihan_edit_modal.png, screenshot_laporan_pelatihan_delete_dialog.png\n• Route: /pelatihan/laporan",
        "SELESAI (100% LIVE)"
    ),
    (
        13,
        "Rekapitulasi TKK Pelatihan (12 Kolom SIPJAKI)",
        "Penyelenggaraan & Fasilitasi Sertifikasi TKK (Permen PUPR No. 1/2023)",
        "1. Penerapan Standar Tabel 12 Kolom Baku Rekapitulasi SIPJAKI Pusat:\n   • NO, WILAYAH, KABUPATEN/KOTA, PROVINSI, TARGET, TERPENUHI, TOTAL TKK, CAPAIAN, TAHUN, DOKUMEN, STATUS, AKSI\n2. Tiga Kartu Ringkasan Capaian Tahun Berjalan (2026):\n   • TOTAL TARGET PELAKSANAAN (3 Pelaksanaan)\n   • TOTAL TERPENUHI (3 Pelaksanaan, 100% Capaian)\n   • TOTAL TKK KESELURUHAN (90 Orang TKK)\n3. Filter STATUS VERIFIKASI (Semua Status, Menunggu Verifikasi, Terverifikasi, Ditolak)\n4. Tombol Navigasi 'Laporan Pelatihan' kembali ke /pelatihan/laporan\n5. Visualisasi Capaian: Kolom CAPAIAN dilengkapi persentase dan mini visual progress bar\n6. Tombol Aksi Detail: Ikon mata biru membuka modal rincian daftar 3 paket pelatihan penyumbang capaian\n7. Tombol Dokumen: Pratinjau berkas rekapitulasi BAP kumulatif dan tautan tab baru",
        "Menyediakan instrumen evaluasi capaian kinerja pembinaan SDM konstruksi agregat wilayah Kabupaten Bogor yang membandingkan target perencanaan versus realisasi pelaporan TKK.",
        "• 1. NO (Nomor urut 1, 2, ...)\n• 2. WILAYAH (JAWA BARAT, KABUPATEN BOGOR)\n• 3. KABUPATEN/KOTA (KABUPATEN BOGOR)\n• 4. PROVINSI (JAWA BARAT)\n• 5. TARGET (3 Pelaksanaan)\n• 6. TERPENUHI (3 Pelaksanaan)\n• 7. TOTAL TKK (90 Orang)\n• 8. CAPAIAN (100% + Visual Progress Bar)\n• 9. TAHUN (2026)\n• 10. DOKUMEN (Tombol 'Lihat' Rekap PDF & Tab Baru)\n• 11. STATUS (Menunggu Verifikasi / Terverifikasi / Ditolak)\n• 12. AKSI (Detail Rincian Paket Mata Biru)\n• [Alat Bantu]: Tombol Navigasi Laporan Pelatihan, Filter Status, Tampilkan entri, Cari, Paginasi",
        "• Migration: 018_rekapitulasi_pelatihan_sipjaki_schema.sql\n• Supabase: Tabel pelatihan_rekapitulasi_sipjaki (RLS & Seed TA 2026 & TA 2025)\n• Bukti Visual: screenshot_rekapitulasi_pelatihan_tabel_12_kolom.png, screenshot_rekapitulasi_pelatihan_detail_modal.png, screenshot_rekapitulasi_pelatihan_doc_modal.png\n• Route: /pelatihan/rekapitulasi",
        "SELESAI (100% LIVE)"
    ),
    (
        14,
        "Dashboard Role Play BUJK & Master BUJK (NIB Unique & Riwayat Terkini)",
        "Tertib Usaha & Rantai Pasok Konstruksi (PP No. 5/2021 & OSS-RBA)",
        "1. Penguncian identitas tunggal perusahaan berbasis NIB (Nomor Induk Berusaha 13 Digit) sebagai Unique Key / Primary Key OSS-RBA\n2. Pencegahan data ganda (anti-duplikasi) di level database PostgreSQL (UNIQUE constraint & index uk_bujk_nib) serta validasi formulir real-time di UI Master BUJK (/bujk)\n3. Setting default filter urutan riwayat pekerjaan: diambil dari pekerjaan terakhir (kronologis terbalik / DESC, TA 2026 paling atas)\n4. Integrasi tabel riwayat paket pekerjaan dinamis pada Dashboard Role Play BUJK (/portal/bujk) dan Detail BUJK (/bujk/[id])",
        "Menerapkan tata kelola data BUJK yang solid sesuai sistem OSS-RBA nasional dan SIPJAKI Kementerian PUPR, di mana NIB menjadi kunci primer tunggal anti-duplikasi, serta meningkatkan kemudahan evaluasi tim pembina dinas dengan menyajikan portofolio pekerjaan mutakhir secara otomatis di urutan pertama.",
        "• NIB 13 Digit (Unique Key OSS-RBA)\n• Nama Perusahaan / BUJK\n• Bentuk & Kualifikasi Usaha (PT/CV, Kecil/Menengah/Besar)\n• SBU Aktif & Masa Berlaku\n• Tabel Riwayat Pekerjaan:\n  - NO (Urut 1, 2, ...)\n  - ID & Paket Pekerjaan (Badge 'Pekerjaan Terakhir' & 'Sedang Berjalan')\n  - Tahun Anggaran & Sumber Dana (TA 2026, 2025, 2024)\n  - Nilai Kontrak (Rupiah Akuntansi)\n  - Progres Fisik (%) vs Keuangan (%)\n  - Periode Pelaksanaan (Tanggal Mulai s/d Selesai)\n  - Status Pekerjaan (Pelaksanaan / Selesai)\n  - Aksi (Buka SIMAK / Detail Paket)\n• [Alat Bantu]: Search, Filter Tahun, Filter Status, Sorting Dropdown (Default: Pekerjaan Terakhir)",
        "• Migration: 019_bujk_nib_unique_schema.sql\n• Supabase: Constraint uk_bujk_nib, Index idx_bujk_nib_unique, Index idx_paket_pekerjaan_bujk_riwayat & Seed data riwayat multi-tahun\n• Script Uji: seed_paket_history.js & capture_bujk_nib_riwayat.ts\n• Bukti Visual: screenshot_portal_bujk_riwayat_terkini.png, screenshot_bujk_detail_riwayat_terkini.png, screenshot_bujk_nib_unique_validation.png\n• Route: /portal/bujk, /bujk, /bujk/B001",
        "SELESAI (100% LIVE)"
    )
]

for row_idx, item in enumerate(data_sheet1, start=header_row1 + 1):
    ws1.row_dimensions[row_idx].height = 115
    is_zebra = (row_idx % 2 == 0)
    for col_idx, val in enumerate(item, start=2):
        cell = ws1.cell(row=row_idx, column=col_idx, value=val)
        cell.font = font_body
        cell.border = thin_border
        if is_zebra:
            cell.fill = fill_zebra
        
        # Alignment rule
        if col_idx == 2: # NO
            cell.alignment = align_center
            cell.font = font_body_bold
        elif col_idx in [3, 4, 9]: # Modul, Pilar, Status
            cell.alignment = align_center
            if col_idx == 9: # Status
                cell.font = font_status_success
                cell.fill = fill_success
        else:
            cell.alignment = align_left

# ==============================================================================
# SHEET 2: STANDAR_KOLOM_SIPJAKI_SIJAKON
# ==============================================================================
ws2 = wb.create_sheet(title="Matriks Kolom Komparasi")
ws2.views.sheetView[0].showGridLines = True

ws2.cell(row=2, column=2, value="MATRIKS PENYELARASAN KOLOM: SIPJAKI (KEMENTERIAN PUPR) VS SIJAKON (KABUPATEN BOGOR)").font = font_title
ws2.cell(row=3, column=2, value="Perbandingan 1:1 Kolom Standar SIPJAKI dan Posisi Implementasi SIJAKON").font = font_subtitle

headers2 = [
    "NO", "MODUL SISTEM", "NAMA KOLOM SIPJAKI", "NAMA KOLOM SIJAKON", 
    "TIPE DATA", "STATUS PARITAS", "KETERANGAN & DESKRIPSI FUNGSIONAL"
]

header_row2 = 5
for col_idx, h in enumerate(headers2, start=2):
    cell = ws2.cell(row=header_row2, column=col_idx, value=h)
    cell.font = font_header
    cell.fill = fill_header
    cell.alignment = align_center
    cell.border = header_border
ws2.row_dimensions[header_row2].height = 26

data_sheet2 = [
    # Timeline
    (1, "Timeline Pengawasan", "wilayah", "wilayah", "VARCHAR(255)", "Paritas 100%", "Standar kewilayahan penugasan pengawasan kecamatan/kabupaten"),
    (2, "Timeline Pengawasan", "tahun", "tahun", "VARCHAR(10)", "Paritas 100%", "Tahun anggaran pelaksanaan timeline (Default: 2026)"),
    (3, "Timeline Pengawasan", "kegiatan", "kegiatan / namaObjek", "VARCHAR(255)", "Paritas 100%", "Uraian nama kegiatan jadwal pengawasan"),
    (4, "Timeline Pengawasan", "waktu (mulai/selesai)", "bulanMulai & bulanSelesai", "VARCHAR(50)", "Paritas 100%", "Rentang waktu pelaksanaan inspeksi lapangan"),
    (5, "Timeline Pengawasan", "[Tidak Ada di SIPJAKI]", "targetBujk (Target Objek)", "INTEGER", "Nilai Tambah SIJAKON", "Keunggulan SIJAKON: Target kuantitatif jumlah objek BUJK/proyek yang wajib diawasi"),
    (6, "Timeline Pengawasan", "dokumen", "dokumenJadwal", "VARCHAR(255)", "Paritas 100%", "Berkas KAK / Rencana Kerja Pengawasan (PDF)"),
    (7, "Timeline Pengawasan", "status", "status", "VARCHAR(30)", "Paritas 100%", "Status jadwal (Terjadwal, Berjalan, Selesai)"),
    (8, "Timeline Pengawasan", "aksi (edit, hapus)", "Aksi (Detail, Edit, Hapus)", "Component Action", "Paritas 100%", "Tombol edit modal interaktif dan dialog konfirmasi hapus terintegrasi audit log"),
    
    # Anggaran
    (9, "Anggaran Pengawasan", "wilayah", "wilayah", "VARCHAR(255)", "Paritas 100%", "Wilayah penugasan alokasi anggaran"),
    (10, "Anggaran Pengawasan", "tahun", "tahun", "VARCHAR(10)", "Paritas 100%", "Tahun anggaran alokasi kegiatan"),
    (11, "Anggaran Pengawasan", "jumlah_anggaran", "paguAnggaran", "BIGINT (Rupiah)", "Paritas 100%", "Alokasi pagu anggaran pengawasan RKA/DPA"),
    (12, "Anggaran Pengawasan", "[Tidak Ada di SIPJAKI]", "realisasi", "BIGINT (Rupiah)", "Nilai Tambah SIJAKON", "Keunggulan SIJAKON: Realisasi penyerapan belanja pengawasan aktual"),
    (13, "Anggaran Pengawasan", "[Tidak Ada di SIPJAKI]", "serapanPct (%)", "DECIMAL (Persen)", "Nilai Tambah SIJAKON", "Keunggulan SIJAKON: Persentase efektivitas penyerapan pagu belanja"),
    (14, "Anggaran Pengawasan", "[Tidak Ada di SIPJAKI]", "sumberDana", "VARCHAR(50)", "Nilai Tambah SIJAKON", "Keunggulan SIJAKON: Sumber dana (APBD Kab. Bogor, DAK Fisik, Banprov)"),
    (15, "Anggaran Pengawasan", "dokumen", "dokumenRka", "VARCHAR(255)", "Paritas 100%", "Berkas RKA / DPA Pengawasan (PDF)"),
    (16, "Anggaran Pengawasan", "status", "status", "VARCHAR(30)", "Paritas 100%", "Status alokasi anggaran (Disetujui, Usulan, Revisi)"),
    (17, "Anggaran Pengawasan", "aksi (edit, hapus)", "Aksi (Detail, Edit, Hapus)", "Component Action", "Paritas 100%", "Fitur ubah alokasi anggaran dan hapus pos anggaran"),

    # Pelaksanaan Pengawasan
    (18, "Pelaksanaan Pengawasan", "no", "no", "INTEGER (Urut)", "Paritas 100%", "Penomoran urut baris otomatis 1, 2, 3..."),
    (19, "Pelaksanaan Pengawasan", "tanggal_pengawasan", "tanggal", "DATE (YYYY-MM-DD)", "Paritas 100%", "Tanggal kegiatan pengawasan lapangan (Diurutkan terbaru di atas)"),
    (20, "Pelaksanaan Pengawasan", "tahun", "tahun", "VARCHAR(10)", "Paritas 100%", "Tahun anggaran pelaksanaan (Default: 2026)"),
    (21, "Pelaksanaan Pengawasan", "wilayah", "wilayah & objek", "VARCHAR(255)", "Paritas 100% (Opsi 2)", "Kecamatan di Kab. Bogor + Nama Produsen/BUJK & Kualifikasi (Opsi 2)"),
    (22, "Pelaksanaan Pengawasan", "dokumen", "dokumen", "VARCHAR(255)", "Paritas 100%", "Berkas Dokumen Pengawasan resmi (PDF) - Istilah Berita Acara BAP dihapus"),
    (23, "Pelaksanaan Pengawasan", "status", "status", "VARCHAR(50)", "Paritas 100%", "Status Kepatuhan ('Patuh' / 'Tidak Patuh') & Status Verifikasi Dinas"),
    (24, "Pelaksanaan Pengawasan", "aksi (edit, hapus)", "Aksi (Detail, Edit, Hapus)", "Component Action", "Paritas 100%", "Aksi Detail Dokumen Resmi, Modal Edit Lengkap, dan Dialog Hapus"),
    (25, "Pelaksanaan SIMAK 1 (Form)", "kualifikasi", "kualifikasi", "VARCHAR(50)", "Paritas 100%", "Kualifikasi badan usaha / rantai pasok (Kecil, Menengah, Besar, Spesialis)"),
    (26, "Pelaksanaan SIMAK 1 (Form)", "nama_produsen", "namaProdusen / badanUsaha", "VARCHAR(255)", "Paritas 100%", "Nama produsen bahan material konstruksi / BUJK"),
    (27, "Pelaksanaan SIMAK 1 (Form)", "nama_pemilik", "namaPemilik", "VARCHAR(200)", "Paritas 100%", "Nama pemilik / direktur penanggung jawab"),
    (28, "Pelaksanaan SIMAK 1 (Form)", "no_kontak", "noKontak", "VARCHAR(50)", "Paritas 100%", "Nomor telepon / WhatsApp kontak PIC"),
    (29, "Pelaksanaan SIMAK 1 (Form)", "kepemilikan_izin", "kepemilikanIzin", "VARCHAR(50)", "Paritas 100%", "Kepemilikan perizinan berusaha (Memiliki / Tidak Memiliki)"),
    (30, "Pelaksanaan SIMAK 1 (Form)", "keabsahan_izin", "keabsahanIzin", "VARCHAR(50)", "Paritas 100%", "Keabsahan SBU / Izin Usaha (Sah / Tidak Sah / Aktif)"),
    (31, "Pelaksanaan SIMAK 1 (Form)", "kapasitas", "kapasitas", "VARCHAR(100)", "Paritas 100%", "Kapasitas produksi / kemampuan peralatan operasional"),
    (32, "Pelaksanaan SIMAK 1 (Form)", "izin_bb", "izinBb", "VARCHAR(50)", "Paritas 100%", "Izin sumber Bahan Baku / IUP quary (Ada / Tidak Ada)"),
    (33, "Pelaksanaan SIMAK 1 (Form)", "keabsahan_bb", "keabsahanBb", "VARCHAR(50)", "Paritas 100%", "Keabsahan dokumen asal bahan baku (Sah / Tidak Sah)"),
    (34, "Pelaksanaan SIMAK 1 (Form)", "propinsi & kab_kota", "propinsi & kabKota", "VARCHAR(100)", "Paritas 100%", "Provinsi Jawa Barat & Kabupaten Bogor"),

    # Pelaporan Pengawasan (Standardisasi Format 8 Kolom SIPJAKI)
    (35, "Pelaporan Pengawasan", "no", "no", "INTEGER (Urut)", "Paritas 100%", "Penomoran urut baris laporan otomatis 1, 2, 3..."),
    (36, "Pelaporan Pengawasan", "jenis_laporan", "jenisLaporan", "VARCHAR(50)", "Paritas 100%", "Kategori siklus laporan (Tahunan, Semesteran, Triwulanan, Insidental) dalam bentuk Badge Pill"),
    (37, "Pelaporan Pengawasan", "nama_laporan", "namaLaporan", "VARCHAR(255)", "Paritas 100%", "Nama laporan resmi huruf kapital tegas + sub-teks objek & kepatuhan"),
    (38, "Pelaporan Pengawasan", "tahun", "tahun", "VARCHAR(10)", "Paritas 100%", "Tahun anggaran pelaksanaan pengawasan (Default: 2026)"),
    (39, "Pelaporan Pengawasan", "wilayah", "wilayah (propinsi / kab_kota)", "VARCHAR(255)", "Paritas 100%", "Hierarki wilayah SIPJAKI (Baris atas Bold 'JAWA BARAT', bawah 'KABUPATEN BOGOR')"),
    (40, "Pelaporan Pengawasan", "dokumen", "dokumen (Tombol 'Lihat')", "Component Button", "Paritas 100%", "Tombol biru navy 'Lihat' membuka modal pratinjau dokumen & ringkasan eksekutif"),
    (41, "Pelaporan Pengawasan", "status", "status", "VARCHAR(50)", "Paritas 100%", "Status verifikasi SIPJAKI (Menunggu Verifikasi, Terverifikasi, Perlu Revisi, Draft Lokal)"),
    (42, "Pelaporan Pengawasan", "aksi (edit, hapus)", "Aksi (Edit, Hapus, Excel)", "Component Action", "Paritas 100%", "Tombol modal Edit isian laporan, dialog Hapus aman, dan ekspor spreadsheet"),
    (43, "Pelaporan Pengawasan", "[Tidak Ada di SIPJAKI]", "jumlahObjekDiperiksa", "INTEGER", "Nilai Tambah SIJAKON", "Keunggulan SIJAKON: Akumulasi jumlah objek BUJK/proyek yang dilaporkan"),
    (44, "Pelaporan Pengawasan", "[Tidak Ada di SIPJAKI]", "tingkatKepatuhan (%)", "DECIMAL (Persen)", "Nilai Tambah SIJAKON", "Keunggulan SIJAKON: Indeks kepatuhan rata-rata hasil pengawasan lapangan"),

    # Pelaksanaan Pengawasan SIMAK 2 (Tertib Penyelenggaraan: 11 Parameter Baku SIPJAKI)
    (45, "Pelaksanaan SIMAK 2 (Penyelenggaraan)", "no", "no", "INTEGER (Urut)", "Paritas 100%", "Penomoran urut baris pengawasan paket proyek fisik otomatis 1, 2, 3..."),
    (46, "Pelaksanaan SIMAK 2 (Penyelenggaraan)", "nama_proyek", "namaProyek / namaObjek", "VARCHAR(255)", "Paritas 100%", "Nama paket pekerjaan konstruksi fisik strategis APBD/DAK Kab. Bogor"),
    (47, "Pelaksanaan SIMAK 2 (Penyelenggaraan)", "nilai_proyek", "nilaiProyek", "BIGINT (Rupiah)", "Paritas 100%", "Nilai kontrak pekerjaan konstruksi dalam format mata uang Rupiah"),
    (48, "Pelaksanaan SIMAK 2 (Penyelenggaraan)", "nomor_perjanjian", "nomorPerjanjian", "VARCHAR(100)", "Paritas 100%", "Nomor Surat Perjanjian Kontrak (SPK) pekerjaan konstruksi fisik"),
    (49, "Pelaksanaan SIMAK 2 (Penyelenggaraan)", "waktu_pelaksanaan", "waktuPelaksanaan", "VARCHAR(100)", "Paritas 100%", "Jangka waktu masa pelaksanaan kontrak (contoh: 180 Hari Kalender)"),
    (50, "Pelaksanaan SIMAK 2 (Penyelenggaraan)", "penyedia_jasa", "penyediaJasa / badanUsaha", "VARCHAR(255)", "Paritas 100%", "Nama badan usaha kontraktor pelaksana yang ditunjuk"),
    (51, "Pelaksanaan SIMAK 2 (Penyelenggaraan)", "nama_pemilik_pekerjaan", "namaPemilikPekerjaan", "VARCHAR(200)", "Paritas 100%", "Pengguna Jasa / PPK / Dinas PUPR Kab. Bogor"),
    (52, "Pelaksanaan SIMAK 2 (Penyelenggaraan)", "waktu_pengawasan", "waktuPengawasan / tanggal", "DATE (YYYY-MM-DD)", "Paritas 100%", "Tanggal inspeksi lapangan pengawasan oleh Tim Pembina Jakon"),
    (53, "Pelaksanaan SIMAK 2 (Penyelenggaraan)", "propinsi & kab_kota", "propinsi & kabKota", "VARCHAR(100)", "Paritas 100%", "Hierarki wilayah standar SIPJAKI: Provinsi Jawa Barat & Kabupaten Bogor"),
    (54, "Pelaksanaan SIMAK 2 (Penyelenggaraan)", "status", "statusKepatuhan & statusVerifikasi", "VARCHAR(50)", "Paritas 100%", "Status kepatuhan teknis ('Patuh' / 'Tidak Patuh') & verifikasi dokumen dinas"),
    (55, "Pelaksanaan SIMAK 2 (Penyelenggaraan)", "aksi (edit, hapus)", "Aksi (Detail, Edit, Hapus)", "Component Action", "Paritas 100%", "Tombol Aksi Detail Dokumen, Modal Edit Form 11 Parameter, dan Dialog Hapus"),
    (56, "Pelaksanaan SIMAK 2 (Penyelenggaraan)", "[Tidak Ada di SIPJAKI]", "Integrasi Master Paket", "Database Lookup", "Nilai Tambah SIJAKON", "Keunggulan SIJAKON: Fitur Auto-Populate form otomatis dari tabel paket_pekerjaan APBD"),

    # Pelaksanaan Pengawasan SIMAK 3 (Tertib Pemanfaatan: 10 Parameter Baku SIPJAKI)
    (57, "Pelaksanaan SIMAK 3 (Pemanfaatan)", "no", "no", "INTEGER (Urut)", "Paritas 100%", "Penomoran urut baris pengawasan bangunan gedung/infrastruktur 1, 2, 3..."),
    (58, "Pelaksanaan SIMAK 3 (Pemanfaatan)", "nama_bangunan", "namaBangunan / namaObjek", "VARCHAR(255)", "Paritas 100%", "Nama bangunan gedung atau fasilitas publik purna-konstruksi (RSUD, Stadion, Jembatan, Pasar)"),
    (59, "Pelaksanaan SIMAK 3 (Pemanfaatan)", "lokasi", "lokasi", "VARCHAR(255)", "Paritas 100%", "Alamat fisik atau wilayah letak objek bangunan di Kabupaten Bogor"),
    (60, "Pelaksanaan SIMAK 3 (Pemanfaatan)", "nama_pemilik", "namaPemilik / badanUsaha", "VARCHAR(200)", "Paritas 100%", "Nama pemilik aset gedung / infrastruktur (Pemkab Bogor / BPKAD)"),
    (61, "Pelaksanaan SIMAK 3 (Pemanfaatan)", "nama_pengelola", "namaPengelola", "VARCHAR(200)", "Paritas 100%", "Unit kerja atau badan penanggung jawab operasional & pemeliharaan (O&P)"),
    (62, "Pelaksanaan SIMAK 3 (Pemanfaatan)", "waktu_pengawasan", "waktuPengawasan / tanggal", "DATE (YYYY-MM-DD)", "Paritas 100%", "Tanggal inspeksi kelaikan fungsi dan pemeliharaan lapangan oleh Tim Pembina Jakon"),
    (63, "Pelaksanaan SIMAK 3 (Pemanfaatan)", "propinsi", "propinsi", "VARCHAR(100)", "Paritas 100%", "Entitas wilayah provinsi: Jawa Barat"),
    (64, "Pelaksanaan SIMAK 3 (Pemanfaatan)", "kab_kota", "kabKota", "VARCHAR(100)", "Paritas 100%", "Entitas kabupaten/kota pengawas: Kabupaten Bogor"),
    (65, "Pelaksanaan SIMAK 3 (Pemanfaatan)", "status", "statusKepatuhan & statusVerifikasi", "VARCHAR(50)", "Paritas 100%", "Status kepatuhan teknis ('Patuh' / 'Tidak Patuh') & verifikasi dokumen BAP"),
    (66, "Pelaksanaan SIMAK 3 (Pemanfaatan)", "dokumen", "dokumen / dokumenBAP", "VARCHAR(255)", "Paritas 100%", "Berkas laporan resmi BAP pengawasan pemanfaatan produk (PDF)"),
    (67, "Pelaksanaan SIMAK 3 (Pemanfaatan)", "aksi (edit, hapus)", "Aksi (Detail, Edit, Hapus)", "Component Action", "Paritas 100%", "Tombol Aksi Detail Dokumen, Modal Edit Form 10 Parameter, dan Dialog Hapus"),
    (68, "Pelaksanaan SIMAK 3 (Pemanfaatan)", "[Tidak Ada di SIPJAKI]", "Fungsi & Status SLF", "Tag & Metadata", "Nilai Tambah SIJAKON", "Keunggulan SIJAKON: Metadata klasifikasi fungsi bangunan dan status masa aktif SLF"),

    # Data Paket Pekerjaan (Format Baku 19 Kolom SIPJAKI Pusat)
    (69, "Data Paket Pekerjaan", "tahun", "fiscalYear / tahun_anggaran", "INTEGER", "Paritas 100%", "Tahun anggaran pelaksanaan paket pekerjaan konstruksi (contoh: 2026)"),
    (70, "Data Paket Pekerjaan", "nama_pekerjaan", "name / nama_paket", "VARCHAR(300)", "Paritas 100%", "Nama paket pekerjaan konstruksi fisik + tautan langsung ke halaman rincian"),
    (71, "Data Paket Pekerjaan", "nilai_kontrak", "contractValue / nilai_kontrak", "NUMERIC(15,2)", "Paritas 100%", "Nilai kontrak pekerjaan format mata uang Rupiah akuntansi penuh"),
    (72, "Data Paket Pekerjaan", "progress_fisik", "physProgress / progres_fisik", "NUMERIC(5,2)", "Paritas 100%", "Realisasi progres fisik di lapangan (%) dilengkapi visualisasi mini progress bar"),
    (73, "Data Paket Pekerjaan", "progress_keuangan", "finProgress / progres_keuangan", "NUMERIC(5,2)", "Paritas 100%", "Realisasi penyerapan keuangan (%) dilengkapi visualisasi mini progress bar"),
    (74, "Data Paket Pekerjaan", "status", "status / status_pekerjaan", "VARCHAR(30)", "Paritas 100%", "Status proyek konstruksi (Pelaksanaan, Selesai, Perencanaan, Pemilihan, Kritis)"),
    (75, "Data Paket Pekerjaan", "mulai", "startDate / tanggal_mulai", "DATE (YYYY-MM-DD)", "Paritas 100%", "Tanggal mulai masa pelaksanaan kontrak"),
    (76, "Data Paket Pekerjaan", "selesai", "endDate / tanggal_selesai", "DATE (YYYY-MM-DD)", "Paritas 100%", "Tanggal selesai masa pelaksanaan kontrak"),
    (77, "Data Paket Pekerjaan", "propinsi", "province / propinsi", "VARCHAR(100)", "Paritas 100%", "Entitas wilayah provinsi: Jawa Barat"),
    (78, "Data Paket Pekerjaan", "kota", "city / kab_kota", "VARCHAR(100)", "Paritas 100%", "Entitas wilayah pengawas: Kabupaten Bogor"),
    (79, "Data Paket Pekerjaan", "fisik (bulan)", "physMonth / bulan_progres", "VARCHAR(30)", "Paritas 100%", "Bulan cut-off pelaporan progres fisik (contoh: Agustus)"),
    (80, "Data Paket Pekerjaan", "keuangan (bulan)", "finMonth / bulan_progres_keuangan", "VARCHAR(30)", "Paritas 100%", "Bulan cut-off pelaporan progres keuangan (contoh: Agustus)"),
    (81, "Data Paket Pekerjaan", "sumber_dana", "source / sumber_dana", "VARCHAR(50)", "Paritas 100%", "Sumber pendanaan proyek: APBD, DAK, APBN, Bantuan Keuangan"),
    (82, "Data Paket Pekerjaan", "pengguna_jasa", "owner / nama_instansi", "VARCHAR(200)", "Paritas 100%", "Instansi dinas pemilik proyek (Dinas PUPR, Dinkes, Disdik, dll)"),
    (83, "Data Paket Pekerjaan", "penyedia_nib", "nib / nib_penyedia", "VARCHAR(30)", "Paritas 100%", "Nomor Induk Berusaha (NIB) kontraktor pelaksana (13 digit monospace)"),
    (84, "Data Paket Pekerjaan", "penyedia_nama", "contractor / nama_penyedia", "VARCHAR(255)", "Paritas 100%", "Nama badan usaha penyedia jasa / kontraktor pelaksana (PT/CV)"),
    (85, "Data Paket Pekerjaan", "jenis_kontrak", "contractType / jenis_kontrak", "VARCHAR(50)", "Paritas 100%", "Klasifikasi bentuk imbalan: 'Harga Satuan', 'Lump sum', 'Gabungan', 'Turn key'"),
    (86, "Data Paket Pekerjaan", "karakteristik_kontrak", "contractChar / karakteristik_kontrak", "VARCHAR(50)", "Paritas 100%", "Klasifikasi periode kontrak: 'Tahun Tunggal', 'Tahun Jamak'"),
    (87, "Data Paket Pekerjaan", "aksi", "Aksi (Detail, Edit, Hapus)", "Component Action", "Paritas 100%", "Tombol Lihat Detail Proyek, Modal Edit Lengkap 19 Field, dan Dialog Hapus Aman"),
    
    # Data Kecelakaan Konstruksi (SMKK 11 Kolom)
    (88, "Data Kecelakaan Konstruksi", "no", "no", "INTEGER (Urut)", "Paritas 100%", "Nomor urut data kejadian insiden K3 (1, 2, 3...)"),
    (89, "Data Kecelakaan Konstruksi", "nama_kegiatan", "nama_kegiatan", "VARCHAR(300)", "Paritas 100%", "Nama paket pekerjaan konstruksi lokasi kecelakaan"),
    (90, "Data Kecelakaan Konstruksi", "tanggal", "tanggal", "DATE (DD/MM/YYYY)", "Paritas 100%", "Waktu tanggal terjadinya kejadian kecelakaan konstruksi"),
    (91, "Data Kecelakaan Konstruksi", "lokasi", "lokasi", "VARCHAR(255)", "Paritas 100%", "Lokasi fisik atau alamat proyek tempat insiden terjadi"),
    (92, "Data Kecelakaan Konstruksi", "korban_luka_ringan", "korban_luka_ringan", "INTEGER", "Paritas 100%", "Jumlah personil/pekerja yang mengalami luka ringan"),
    (93, "Data Kecelakaan Konstruksi", "korban_luka_berat", "korban_luka_berat", "INTEGER", "Paritas 100%", "Jumlah personil/pekerja yang mengalami luka berat"),
    (94, "Data Kecelakaan Konstruksi", "korban_meninggal", "korban_meninggal", "INTEGER", "Paritas 100%", "Jumlah korban jiwa insiden kecelakaan fatal"),
    (95, "Data Kecelakaan Konstruksi", "kerugian_material", "kerugian_material", "BIGINT (Rupiah)", "Paritas 100%", "Estimasi taksiran kerugian material aset dan peralatan"),
    (96, "Data Kecelakaan Konstruksi", "keterangan", "keterangan_penyebab", "TEXT", "Paritas 100%", "Uraian kronologi kejadian dan faktor penyebab kecelakaan"),
    (97, "Data Kecelakaan Konstruksi", "dokumen", "dokumen_bap_url (Tombol 'Lihat')", "Component Button", "Paritas 100%", "Tombol mata pratinjau Berita Acara Pemeriksaan (BAP) K3"),
    (98, "Data Kecelakaan Konstruksi", "aksi", "Aksi (Edit, Hapus)", "Component Action", "Paritas 100%", "Tombol pensil kuning ubah data & tempat sampah merah hapus"),

    # Dashboard Pelatihan SIPJAKI (10 Kolom)
    (99, "Dashboard Pelatihan SIPJAKI", "kotak_centang", "checkbox", "Checkbox Multi-Select", "Paritas 100%", "Kotak centang untuk memilih satu/beberapa baris sekaligus"),
    (100, "Dashboard Pelatihan SIPJAKI", "tahun", "tahun", "VARCHAR(10)", "Paritas 100%", "Tahun pelaksanaan kegiatan pelatihan"),
    (101, "Dashboard Pelatihan SIPJAKI", "nama_kegiatan", "nama_kegiatan", "VARCHAR(300)", "Paritas 100%", "Judul atau nama program pelatihan TKK yang diselenggarakan"),
    (102, "Dashboard Pelatihan SIPJAKI", "metode", "metode", "VARCHAR(50)", "Paritas 100%", "Jenis metode pelaksanaan (Reguler, Hybrid, MTU, OJT, Daring)"),
    (103, "Dashboard Pelatihan SIPJAKI", "lokasi", "lokasi", "VARCHAR(255)", "Paritas 100%", "Alamat venue atau tempat penyelenggaraan pelatihan/praktik"),
    (104, "Dashboard Pelatihan SIPJAKI", "l", "jumlah_l / peserta_l", "INTEGER", "Paritas 100%", "Jumlah peserta laki-laki (indikator gender PUG)"),
    (105, "Dashboard Pelatihan SIPJAKI", "p", "jumlah_p / peserta_p", "INTEGER", "Paritas 100%", "Jumlah peserta perempuan (indikator gender PUG)"),
    (106, "Dashboard Pelatihan SIPJAKI", "kabupaten/kota", "kab_kota", "VARCHAR(100)", "Paritas 100%", "Wilayah kabupaten/kota lokasi kegiatan (Kabupaten Bogor)"),
    (107, "Dashboard Pelatihan SIPJAKI", "provinsi", "propinsi", "VARCHAR(100)", "Paritas 100%", "Wilayah provinsi lokasi kegiatan (Jawa Barat)"),
    (108, "Dashboard Pelatihan SIPJAKI", "aksi", "Aksi (Detail, Edit, Hapus)", "Component Action", "Paritas 100%", "Mata Biru (Detail), Pensil Kuning (Edit), Tempat Sampah Merah (Hapus)"),

    # Perencanaan Pelatihan & Sertifikasi TKK (9 Kolom)
    (109, "Perencanaan Pelatihan TKK", "no", "no", "INTEGER (Urut)", "Paritas 100%", "Nomor urut data rencana pelatihan 1, 2, ..."),
    (110, "Perencanaan Pelatihan TKK", "wilayah", "wilayah", "VARCHAR(255)", "Paritas 100%", "Wilayah provinsi beserta kabupaten/kota (JAWA BARAT, KABUPATEN BOGOR)"),
    (111, "Perencanaan Pelatihan TKK", "kabupaten/kota", "kab_kota", "VARCHAR(100)", "Paritas 100%", "Nama kabupaten atau kota penyelenggara (KABUPATEN BOGOR)"),
    (112, "Perencanaan Pelatihan TKK", "provinsi", "propinsi", "VARCHAR(100)", "Paritas 100%", "Nama provinsi penyelenggara (JAWA BARAT)"),
    (113, "Perencanaan Pelatihan TKK", "target_pelaksanaan", "target_pelaksanaan", "INTEGER (Pelaksanaan)", "Paritas 100%", "Jumlah target kegiatan yang direncanakan (contoh: 3 Pelaksanaan)"),
    (114, "Perencanaan Pelatihan TKK", "tahun", "tahun", "VARCHAR(10)", "Paritas 100%", "Tahun rencana pelaksanaan (contoh: 2026)"),
    (115, "Perencanaan Pelatihan TKK", "dokumen", "dokumen_kak_url (Tombol 'Lihat')", "Component Button", "Paritas 100%", "Tombol pratinjau dokumen KAK resmi dan opsi buka di tab baru"),
    (116, "Perencanaan Pelatihan TKK", "status", "status", "VARCHAR(50)", "Paritas 100%", "Keterangan status verifikasi data (Menunggu Verifikasi, Terverifikasi, Ditolak)"),
    (117, "Perencanaan Pelatihan TKK", "aksi", "Aksi (Edit, Hapus)", "Component Action", "Paritas 100%", "Tombol ikon pensil kuning (Edit) dan ikon tempat sampah merah (Hapus)"),

    # Laporan Pelatihan & Sertifikasi TKK (11 Kolom)
    (118, "Laporan Pelatihan & Sertifikasi TKK", "no", "no", "INTEGER (Urut)", "Paritas 100%", "Nomor urut data laporan kegiatan 1, 2, ..."),
    (119, "Laporan Pelatihan & Sertifikasi TKK", "wilayah", "wilayah", "VARCHAR(255)", "Paritas 100%", "Informasi wilayah provinsi beserta kabupaten/kota (JAWA BARAT, KABUPATEN BOGOR)"),
    (120, "Laporan Pelatihan & Sertifikasi TKK", "kabupaten/kota", "kab_kota", "VARCHAR(100)", "Paritas 100%", "Nama kabupaten/kota penyelenggara (KABUPATEN BOGOR)"),
    (121, "Laporan Pelatihan & Sertifikasi TKK", "provinsi", "propinsi", "VARCHAR(100)", "Paritas 100%", "Nama provinsi penyelenggara (JAWA BARAT)"),
    (122, "Laporan Pelatihan & Sertifikasi TKK", "nama_kegiatan", "nama_kegiatan", "VARCHAR(300)", "Paritas 100%", "Judul atau nama kegiatan pelatihan yang dilaporkan"),
    (123, "Laporan Pelatihan & Sertifikasi TKK", "tanggal", "tanggal", "DATE (DD/MM/YYYY)", "Paritas 100%", "Tanggal pelaksanaan kegiatan (format Indonesia DD/MM/YYYY)"),
    (124, "Laporan Pelatihan & Sertifikasi TKK", "jumlah_tkk", "jumlah_tkk & satuan_tkk", "INTEGER (Orang)", "Paritas 100%", "Total tenaga kerja konstruksi yang mengikuti kegiatan (contoh: 30 Orang)"),
    (125, "Laporan Pelatihan & Sertifikasi TKK", "tahun", "tahun", "VARCHAR(10)", "Paritas 100%", "Tahun pelaksanaan kegiatan (contoh: 2026)"),
    (126, "Laporan Pelatihan & Sertifikasi TKK", "dokumen", "dokumen_ba_url (Tombol 'Lihat')", "Component Button", "Paritas 100%", "Tombol ikon mata pratinjau dokumen berita acara dan buka di tab baru"),
    (127, "Laporan Pelatihan & Sertifikasi TKK", "status", "status", "VARCHAR(50)", "Paritas 100%", "Keterangan status verifikasi laporan (Menunggu Verifikasi, Terverifikasi, Ditolak)"),
    (128, "Laporan Pelatihan & Sertifikasi TKK", "aksi", "Aksi (Edit, Hapus)", "Component Action", "Paritas 100%", "Tombol ikon pensil kuning (Edit) dan ikon tempat sampah merah (Hapus)"),

    # Rekapitulasi TKK Pelatihan (12 Kolom)
    (129, "Rekapitulasi TKK Pelatihan", "no", "no", "INTEGER (Urut)", "Paritas 100%", "Nomor urut baris rekapitulasi 1, 2, ..."),
    (130, "Rekapitulasi TKK Pelatihan", "wilayah", "wilayah", "VARCHAR(255)", "Paritas 100%", "Informasi wilayah provinsi beserta kabupaten/kota (JAWA BARAT, KABUPATEN BOGOR)"),
    (131, "Rekapitulasi TKK Pelatihan", "kabupaten/kota", "kab_kota", "VARCHAR(100)", "Paritas 100%", "Nama kabupaten atau kota penyelenggara (KABUPATEN BOGOR)"),
    (132, "Rekapitulasi TKK Pelatihan", "provinsi", "propinsi", "VARCHAR(100)", "Paritas 100%", "Nama provinsi penyelenggara (JAWA BARAT)"),
    (133, "Rekapitulasi TKK Pelatihan", "target", "target", "INTEGER (Pelaksanaan)", "Paritas 100%", "Target jumlah paket kegiatan yang direncanakan (contoh: 3 Pelaksanaan)"),
    (134, "Rekapitulasi TKK Pelatihan", "terpenuhi", "terpenuhi", "INTEGER (Pelaksanaan)", "Paritas 100%", "Realisasi jumlah paket kegiatan yang telah selesai dilaksanakan (contoh: 3 Pelaksanaan)"),
    (135, "Rekapitulasi TKK Pelatihan", "total_tkk", "total_tkk & satuan_tkk", "INTEGER (Orang)", "Paritas 100%", "Akumulasi jumlah seluruh tenaga kerja konstruksi yang berhasil dilatih/disertifikasi (contoh: 90 Orang)"),
    (136, "Rekapitulasi TKK Pelatihan", "capaian", "capaian_pct (%)", "DECIMAL (Persen)", "Paritas 100%", "Persentase ketercapaian target pelaksanaan (100%) dilengkapi visualisasi mini progress bar"),
    (137, "Rekapitulasi TKK Pelatihan", "tahun", "tahun", "VARCHAR(10)", "Paritas 100%", "Tahun anggaran pelaksanaan (contoh: 2026)"),
    (138, "Rekapitulasi TKK Pelatihan", "dokumen", "dokumen_rekap_url (Tombol 'Lihat')", "Component Button", "Paritas 100%", "Tombol mata pratinjau berkas dokumen rekapitulasi BAP kumulatif dan tautan tab baru"),
    (139, "Rekapitulasi TKK Pelatihan", "status", "status", "VARCHAR(50)", "Paritas 100%", "Keterangan status verifikasi (Menunggu Verifikasi, Terverifikasi, Ditolak)"),
    (140, "Rekapitulasi TKK Pelatihan", "aksi", "Aksi (Detail Rincian Paket)", "Component Action", "Paritas 100%", "Tombol ikon mata biru untuk membuka modal rincian daftar paket pelatihan yang menyumbang capaian wilayah"),

    # BUJK NIB Unique & Setting Default Riwayat Pekerjaan
    (141, "Penguncian NIB & Riwayat BUJK", "nib", "nib (Unique Constraint & Index)", "VARCHAR(50) UNIQUE", "Paritas 100%", "Nomor Induk Berusaha 13 digit sebagai identitas primer tunggal badan usaha sesuai OSS-RBA (PP 5/2021)"),
    (142, "Penguncian NIB & Riwayat BUJK", "nama_badan_usaha", "nama_badan_usaha / bujkName", "VARCHAR(255)", "Paritas 100%", "Nama resmi perusahaan penyedia jasa konstruksi terdaftar"),
    (143, "Penguncian NIB & Riwayat BUJK", "id_paket", "id (Paket Pekerjaan)", "VARCHAR(50)", "Paritas 100%", "Kode unik paket pekerjaan yang pernah atau sedang dikerjakan BUJK (contoh: P001, P011, P012)"),
    (144, "Penguncian NIB & Riwayat BUJK", "lencana_riwayat", "Badge 'Pekerjaan Terakhir'", "Component Badge", "Fitur Unggulan", "Lencana sorotan penanda pekerjaan paling mutakhir/terkini pada baris pertama hasil pengurutan"),
    (145, "Penguncian NIB & Riwayat BUJK", "tahun_anggaran", "tahun_anggaran", "INTEGER", "Paritas 100%", "Tahun anggaran pelaksanaan kontrak pekerjaan (contoh: 2026, 2025, 2024)"),
    (146, "Penguncian NIB & Riwayat BUJK", "nilai_kontrak", "nilai_kontrak", "NUMERIC(15,2)", "Paritas 100%", "Besaran nilai nominal kontrak pekerjaan dalam format akuntansi Rupiah"),
    (147, "Penguncian NIB & Riwayat BUJK", "progres_fisik", "progres_fisik & visual bar", "DECIMAL(5,2)", "Paritas 100%", "Persentase progres fisik lapangan dilengkapi mini progress bar visual dan progres keuangan"),
    (148, "Penguncian NIB & Riwayat BUJK", "periode_kontrak", "tanggal_mulai s/d tanggal_selesai", "DATE Range", "Paritas 100%", "Rentang masa pelaksanaan pekerjaan berdasarkan surat perjanjian kontrak"),
    (149, "Penguncian NIB & Riwayat BUJK", "status_pekerjaan", "status_pekerjaan", "VARCHAR(50)", "Paritas 100%", "Status pelaksanaan proyek (Pelaksanaan / Selesai)"),
    (150, "Penguncian NIB & Riwayat BUJK", "default_sort_setting", "Setting Default: Pekerjaan Terakhir (DESC)", "Query / State Order", "Fitur Unggulan", "Konfigurasi bawaan sistem yang otomatis menampilkan pekerjaan terakhir/terkini di urutan paling atas")
]

for row_idx, item in enumerate(data_sheet2, start=header_row2 + 1):
    ws2.row_dimensions[row_idx].height = 24
    is_zebra = (row_idx % 2 == 0)
    for col_idx, val in enumerate(item, start=2):
        cell = ws2.cell(row=row_idx, column=col_idx, value=val)
        cell.font = font_body
        cell.border = thin_border
        if is_zebra:
            cell.fill = fill_zebra
        
        if col_idx in [2, 6, 7]: # No, Tipe, Status
            cell.alignment = align_center
            if col_idx == 7:
                if "Paritas" in val:
                    cell.font = font_status_success
                else:
                    cell.font = Font(name="Calibri", size=10, bold=True, color="1E40AF")
        else:
            cell.alignment = align_left

# ==============================================================================
# SHEET 3: SKEMA_DATABASE_SUPABASE
# ==============================================================================
ws3 = wb.create_sheet(title="Skema Database Supabase")
ws3.views.sheetView[0].showGridLines = True

ws3.cell(row=2, column=2, value="ARSITEKTUR BASIS DATA POSTGRESQL 16 (SUPABASE LIVE)").font = font_title
ws3.cell(row=3, column=2, value="Project: prototype-bogor (Reference: jzaxzesvmygycumvsjvu)").font = font_subtitle

headers3 = [
    "NO", "FILE MIGRATION", "NAMA TABEL / SKEMA", "KOLOM-KOLOM UTAMA", 
    "INDEX & CONSTRAINT", "STATUS DEPLOYMENT"
]

header_row3 = 5
for col_idx, h in enumerate(headers3, start=2):
    cell = ws3.cell(row=header_row3, column=col_idx, value=h)
    cell.font = font_header
    cell.fill = fill_header
    cell.alignment = align_center
    cell.border = header_border
ws3.row_dimensions[header_row3].height = 26

data_sheet3 = [
    (
        1,
        "006_perencanaan_timeline_schema.sql",
        "public.pengawasan_timeline_perencanaan",
        "id (PK), tertib_type, wilayah, tahun, kegiatan, periode, bulan_mulai, bulan_selesai, target_bujk, status, dokumen_jadwal, created_at, updated_at",
        "idx_timeline_tertib, idx_timeline_tahun, idx_timeline_status, idx_timeline_wilayah. RLS Enabled (Read Public, Write Super Admin)",
        "TERPASANG & LIVE (5 Baris Data)"
    ),
    (
        2,
        "007_perencanaan_anggaran_schema.sql",
        "public.pengawasan_anggaran_perencanaan",
        "id (PK), tertib_type, wilayah, tahun, program, pagu_anggaran, realisasi, sumber_dana, dokumen_rka, status, catatan, created_at, updated_at",
        "idx_anggaran_tertib, idx_anggaran_tahun, idx_anggaran_status, idx_anggaran_sumber, idx_anggaran_wilayah. RLS Enabled",
        "TERPASANG & LIVE (4 Baris Data)"
    ),
    (
        3,
        "008_pelaksanaan_tertib_usaha_schema.sql",
        "public.pengawasan_sesi (ALTER TABLE)",
        "id (PK), simak_code, tipe_tertib, nama_objek, badan_usaha, lokasi, tahun, wilayah, kualifikasi, nama_produsen, nama_pemilik, no_kontak, kepemilikan_izin, keabsahan_izin, kapasitas, izin_bb, keabsahan_bb, status_kepatuhan, dokumen, status_verifikasi, tanggal_audit",
        "idx_pengawasan_tanggal_desc, idx_pengawasan_tahun, idx_pengawasan_wilayah, idx_pengawasan_status_kepatuhan, idx_pengawasan_kualifikasi, idx_pengawasan_nama_produsen",
        "TERPASANG & LIVE (12 Baris Data)"
    ),
    (
        4,
        "009_pelaporan_pengawasan_schema.sql",
        "public.pengawasan_pelaporan",
        "id (PK), tertib_type, jenis_laporan, nama_laporan, tahun, propinsi, kab_kota, wilayah, dokumen_url, dokumen_nama, status, jumlah_objek, tingkat_kepatuhan, tanggal_kirim, nomor_surat, catatan, created_at, updated_at",
        "idx_pelaporan_tertib, idx_pelaporan_tahun, idx_pelaporan_status, idx_pelaporan_jenis, idx_pelaporan_wilayah. RLS Enabled (Read Public, Write Super Admin)",
        "SKEMA & SEED SIAP DIEKSEKUSI (8 Baris Data)"
    ),
    (
        5,
        "010_pelaksanaan_tertib_penyelenggaraan_schema.sql",
        "public.pengawasan_sesi (ALTER TABLE)",
        "id (PK), nama_proyek, nilai_proyek, nomor_perjanjian, waktu_pelaksanaan, penyedia_jasa, nama_pemilik_pekerjaan, waktu_pengawasan, propinsi, kab_kota, status_kepatuhan, dokumen",
        "idx_pengawasan_nama_proyek, idx_pengawasan_nomor_perjanjian, idx_pengawasan_penyedia_jasa, idx_pengawasan_waktu_pengawasan. Indeks performa pencarian paket proyek",
        "SKEMA & SEED SIAP DIEKSEKUSI (4 Proyek Strategis)"
    ),
    (
        6,
        "011_pelaksanaan_tertib_pemanfaatan_schema.sql",
        "public.pengawasan_sesi (ALTER TABLE)",
        "id (PK), nama_bangunan, nama_pemilik, nama_pengelola, waktu_pengawasan, fungsi_bangunan, status_slf, propinsi, kab_kota, status_kepatuhan, dokumen",
        "idx_pengawasan_nama_bangunan, idx_pengawasan_nama_pemilik, idx_pengawasan_nama_pengelola. Indeks performa pencarian aset gedung",
        "SKEMA & SEED SIAP DIEKSEKUSI (4 Bangunan Strategis)"
    ),
    (
        7,
        "012_profil_opd_sipjaki_schema.sql",
        "public.profil_opd_sipjaki",
        "id (PK), tipe_opd, kategori, nama_bidang, nama_seksi, level_suburusan, alamat, telepon, email, website, jumlah_pns, jumlah_p3k, jumlah_non_asn, pic, regulasi, anggaran_n, anggaran_n1, rpjmd",
        "Constraint unik level dinas, idx_profil_opd_tipe, RLS Enabled. Tabel menampung 50+ kolom konfigurasi 3 Pilar SIPJAKI",
        "SKEMA & SEED SIAP DIEKSEKUSI (1 Profil Utama Dinas PUPR)"
    ),
    (
        8,
        "013_paket_pekerjaan_sipjaki_schema.sql",
        "public.paket_pekerjaan (ALTER TABLE)",
        "id (PK), nama_paket, nilai_kontrak, progres_fisik, progres_keuangan, status_pekerjaan, tanggal_mulai, tanggal_selesai, propinsi, kab_kota, bulan_progres, bulan_progres_keuangan, sumber_dana, nama_instansi, nib_penyedia, nama_penyedia, jenis_kontrak, karakteristik_kontrak",
        "idx_paket_updated_at (DESC), idx_paket_jenis_kontrak, idx_paket_karakteristik, check_paket_jenis_kontrak_sipjaki, check_paket_karakteristik_kontrak",
        "SKEMA & SEED SIAP DIEKSEKUSI (10 Paket Strategis Bogor)"
    ),
    (
        9,
        "014_kecelakaan_kerja_sipjaki_schema.sql",
        "public.kecelakaan_kerja_sipjaki",
        "id (PK), tahun, nama_kegiatan, tanggal, lokasi, korban_luka_ringan, korban_luka_berat, korban_meninggal, kerugian_material, keterangan_penyebab, nomor_bap, dokumen_bap_url, status_verifikasi, tindak_lanjut, created_at, updated_at",
        "idx_kecelakaan_tahun, idx_kecelakaan_tanggal, idx_kecelakaan_status. RLS Enabled (Read Public, Write Super Admin)",
        "TERPASANG & LIVE (4 Baris Data)"
    ),
    (
        10,
        "015_pelatihan_sipjaki_schema.sql",
        "public.pelatihan_sipjaki",
        "id (PK), tahun, nama_kegiatan, metode, lokasi, peserta_l, peserta_p, total_peserta, kab_kota, propinsi, anggaran, sumber_dana, penyelenggara, skk_jenjang, status, keterangan, created_at, updated_at",
        "idx_pelatihan_sipjaki_tahun, idx_pelatihan_sipjaki_metode, idx_pelatihan_sipjaki_kabkota, idx_pelatihan_sipjaki_updated. RLS Enabled",
        "TERPASANG & LIVE (7 Kegiatan, 94 Peserta)"
    ),
    (
        11,
        "016_perencanaan_pelatihan_sipjaki_schema.sql",
        "public.pelatihan_perencanaan_sipjaki",
        "id (PK), tahun, wilayah, kab_kota, propinsi, target_pelaksanaan, satuan_target, dokumen_kak_url, status, catatan_verifikasi, anggaran_estimasi, uraian_rencana, created_at, updated_at",
        "idx_perencanaan_pelatihan_tahun, idx_perencanaan_pelatihan_updated, idx_perencanaan_pelatihan_status. RLS Enabled",
        "TERPASANG & LIVE (2 Baris Data: TA 2026 & 2025)"
    ),
    (
        12,
        "017_laporan_pelatihan_sipjaki_schema.sql",
        "public.pelatihan_laporan_sipjaki",
        "id (PK), tahun, wilayah, kab_kota, propinsi, nama_kegiatan, tanggal, jumlah_tkk, satuan_tkk, nomor_ba, lembaga_sertifikasi, dokumen_ba_url, status, catatan_verifikasi, created_at, updated_at",
        "idx_laporan_pelatihan_tahun, idx_laporan_pelatihan_tanggal, idx_laporan_pelatihan_updated, idx_laporan_pelatihan_status. RLS Enabled",
        "TERPASANG & LIVE (4 Baris Data: 3 TA 2026 = 90 TKK)"
    ),
    (
        13,
        "018_rekapitulasi_pelatihan_sipjaki_schema.sql",
        "public.pelatihan_rekapitulasi_sipjaki",
        "id (PK), tahun, wilayah, kab_kota, propinsi, target, terpenuhi, total_tkk, satuan_target, satuan_tkk, capaian_pct, dokumen_rekap_url, status, catatan_verifikasi, created_at, updated_at",
        "idx_rekap_pelatihan_tahun, idx_rekap_pelatihan_status, idx_rekap_pelatihan_updated. RLS Enabled (Read Public, Write Super Admin)",
        "TERPASANG & LIVE (2 Baris Data: TA 2026 & TA 2025)"
    ),
    (
        14,
        "019_bujk_nib_unique_schema.sql",
        "public.bujk (Constraint & Index) & public.paket_pekerjaan",
        "bujk: CONSTRAINT uk_bujk_nib UNIQUE (nib), INDEX idx_bujk_nib_unique (nib). paket_pekerjaan: INDEX idx_paket_pekerjaan_bujk_riwayat (bujk_id, tanggal_mulai DESC, tahun_anggaran DESC, updated_at DESC)",
        "Constraint unik NIB anti-duplikasi level database, indeks unik performa pencarian, indeks urutan riwayat pekerjaan BUJK DESC, dan Seed Data Proyek Multi-Tahun (TA 2026, 2025, 2024)",
        "TERPASANG & LIVE (NIB Terkunci & Riwayat Berurutan)"
    )
]

for row_idx, item in enumerate(data_sheet3, start=header_row3 + 1):
    ws3.row_dimensions[row_idx].height = 70
    is_zebra = (row_idx % 2 == 0)
    for col_idx, val in enumerate(item, start=2):
        cell = ws3.cell(row=row_idx, column=col_idx, value=val)
        cell.font = font_body
        cell.border = thin_border
        if is_zebra:
            cell.fill = fill_zebra
        
        if col_idx == 2:
            cell.alignment = align_center
            cell.font = font_body_bold
        elif col_idx == 7: # Status
            cell.alignment = align_center
            cell.font = font_status_success
            cell.fill = fill_success
        else:
            cell.alignment = align_left

# ==============================================================================
# SHEET 4: DAFTAR_BUKTI_DOKUMENTASI
# ==============================================================================
ws4 = wb.create_sheet(title="Katalog Bukti Dokumentasi")
ws4.views.sheetView[0].showGridLines = True

ws4.cell(row=2, column=2, value="KATALOG BUKTI DOKUMENTASI & VERIFIKASI SISTEM").font = font_title
ws4.cell(row=3, column=2, value="Daftar Berkas Tangkapan Layar, Rute Lokal, dan Skrip Pengujian Otomatis").font = font_subtitle

headers4 = [
    "NO", "KATEGORI BUKTI", "NAMA BERKAS / RUTE", "LOKASI PENYIMPANAN / TAUTAN", "DESKRIPSI TAMPILAN BUKTI"
]

header_row4 = 5
for col_idx, h in enumerate(headers4, start=2):
    cell = ws4.cell(row=header_row4, column=col_idx, value=h)
    cell.font = font_header
    cell.fill = fill_header
    cell.alignment = align_center
    cell.border = header_border
ws4.row_dimensions[header_row4].height = 26

data_sheet4 = [
    (1, "Screenshot Visual", "screenshot_timeline_tabel.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_timeline_tabel.png", "Tampilan tabel Timeline Pengawasan dengan kolom Wilayah & Tahun, Target Objek, dan Aksi"),
    (2, "Screenshot Visual", "screenshot_timeline_edit_modal.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_timeline_edit_modal.png", "Tampilan modal form Edit Timeline yang terisi otomatis (pre-filled)"),
    (3, "Screenshot Visual", "screenshot_timeline_delete_dialog.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_timeline_delete_dialog.png", "Tampilan dialog konfirmasi Hapus Jadwal Pengawasan"),
    (4, "Screenshot Visual", "screenshot_anggaran_tabel.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_anggaran_tabel.png", "Tampilan tabel Anggaran Pengawasan (Pagu, Realisasi Belanja, % Serapan, Sumber Dana)"),
    (5, "Screenshot Visual", "screenshot_anggaran_edit_modal.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_anggaran_edit_modal.png", "Tampilan modal form Edit Alokasi Anggaran RKA Pengawasan"),
    (6, "Screenshot Visual", "screenshot_anggaran_delete_dialog.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_anggaran_delete_dialog.png", "Tampilan dialog konfirmasi Hapus Pos Anggaran Pengawasan"),
    (7, "Screenshot Visual", "screenshot_pelaksanaan_tabel.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_pelaksanaan_tabel.png", "Tampilan tabel 7 Kolom Standar SIPJAKI Opsi 2 (No, Tanggal, Tahun, Wilayah & Objek, Dokumen, Status, Aksi)"),
    (8, "Screenshot Visual", "screenshot_pelaksanaan_edit_modal.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_pelaksanaan_edit_modal.png", "Tampilan modal form Edit Pengawasan SIMAK 1 dengan seluruh isian parameter SIPJAKI"),
    (9, "Screenshot Visual", "screenshot_pelaksanaan_delete_dialog.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_pelaksanaan_delete_dialog.png", "Tampilan dialog konfirmasi Hapus Data Pengawasan Lapangan"),
    (10, "Screenshot Visual", "screenshot_pelaporan_tabel.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_pelaporan_tabel.png", "Tampilan tabel 8 Kolom Standar SIPJAKI (No, Jenis Laporan, Nama Laporan, Tahun, Wilayah, Dokumen, Status, Aksi)"),
    (11, "Screenshot Visual", "screenshot_pelaporan_edit_modal.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_pelaporan_edit_modal.png", "Tampilan modal form Edit Laporan Pengawasan dengan isian jenis, nama, tahun, wilayah, status, dokumen"),
    (12, "Screenshot Visual", "screenshot_pelaporan_delete_dialog.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_pelaporan_delete_dialog.png", "Tampilan dialog konfirmasi Hapus Berkas Laporan Pengawasan"),
    (13, "Screenshot Visual", "screenshot_pelaporan_lihat_dokumen.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_pelaporan_lihat_dokumen.png", "Tampilan modal pratinjau dokumen resmi laporan pengawasan (Tombol 'Lihat')"),
    (14, "Skrip Pengujian CRUD", "test_supabase_timeline.js", "u:/Project/ciptabintar/scripts/test_supabase_timeline.js", "Skrip Node.js otomatis pengujian SELECT, INSERT, UPDATE, DELETE tabel timeline"),
    (15, "Skrip Pengujian CRUD", "test_supabase_anggaran.js", "u:/Project/ciptabintar/scripts/test_supabase_anggaran.js", "Skrip Node.js otomatis pengujian SELECT, INSERT, UPDATE, DELETE tabel anggaran"),
    (16, "Skrip Pengujian CRUD", "test_supabase_pelaksanaan.js", "u:/Project/ciptabintar/scripts/test_supabase_pelaksanaan.js", "Skrip Node.js otomatis pengujian SELECT, INSERT, UPDATE, DELETE tabel pengawasan_sesi"),
    (17, "Skrip Pengujian CRUD", "test_supabase_pelaporan.js", "u:/Project/ciptabintar/scripts/test_supabase_pelaporan.js", "Skrip Node.js otomatis pengujian SELECT, INSERT, UPDATE, DELETE tabel pengawasan_pelaporan"),
    (18, "Akses Halaman Lokal", "Timeline Pengawasan", "http://localhost:3000/pengawasan/tertib-usaha/perencanaan/timeline", "Rute peramban lokal menu Perencanaan Timeline Pengawasan"),
    (19, "Akses Halaman Lokal", "Anggaran Pengawasan", "http://localhost:3000/pengawasan/tertib-usaha/perencanaan/anggaran", "Rute peramban lokal menu Perencanaan Anggaran Pengawasan"),
    (20, "Akses Halaman Lokal", "Pelaksanaan Pengawasan", "http://localhost:3000/pengawasan/tertib-usaha/pelaksanaan", "Rute peramban lokal menu Pelaksanaan Pengawasan Lapangan (SIMAK 1)"),
    (21, "Akses Halaman Lokal", "Pelaporan Pengawasan (Tertib Usaha)", "http://localhost:3000/pengawasan/tertib-usaha/pelaporan", "Rute peramban lokal menu Pelaporan Resmi Pengawasan Tertib Usaha (8 Kolom SIPJAKI)"),
    (22, "Akses Halaman Lokal", "Pelaporan Pengawasan (Tertib Penyelenggaraan)", "http://localhost:3000/pengawasan/tertib-penyelenggaraan/pelaporan", "Rute peramban lokal menu Pelaporan Resmi Pengawasan Tertib Penyelenggaraan"),
    (23, "Akses Halaman Lokal", "Pelaporan Pengawasan (Tertib Pemanfaatan)", "http://localhost:3000/pengawasan/tertib-pemanfaatan/pelaporan", "Rute peramban lokal menu Pelaporan Resmi Pengawasan Tertib Pemanfaatan"),
    (24, "Screenshot Visual", "screenshot_simak2_tabel.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_simak2_tabel.png", "Tampilan tabel 11 Kolom Standar SIPJAKI SIMAK 2 (No, Nama Proyek, Nilai Proyek, Nomor Perjanjian, Waktu Pelaksanaan, Penyedia Jasa, Pemilik Pekerjaan, Waktu Pengawasan, Propinsi Kab/Kota, Status, Aksi)"),
    (25, "Screenshot Visual", "screenshot_simak2_edit_modal.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_simak2_edit_modal.png", "Tampilan modal form Edit Pengawasan SIMAK 2 dengan 11 parameter lengkap (Nama Proyek, Nilai Kontrak, SPK, Waktu Pelaksanaan, Kontraktor, PPK)"),
    (26, "Screenshot Visual", "screenshot_simak2_delete_dialog.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_simak2_delete_dialog.png", "Tampilan dialog konfirmasi Hapus Data Pengawasan Paket Proyek SIMAK 2"),
    (27, "Screenshot Visual", "screenshot_simak2_add_modal.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_simak2_add_modal.png", "Tampilan modal Tambah Pengawasan SIMAK 2 dengan fitur Auto-Populate dari Master Paket Pekerjaan"),
    (28, "Skrip Pengujian CRUD", "test_supabase_simak2.js", "u:/Project/ciptabintar/scripts/test_supabase_simak2.js", "Skrip Node.js otomatis pengujian SELECT, INSERT, UPDATE, DELETE kolom SIMAK 2 pada pengawasan_sesi"),
    (29, "Akses Halaman Lokal", "Pelaksanaan Pengawasan (SIMAK 2)", "http://localhost:3000/pengawasan/tertib-penyelenggaraan/pelaksanaan", "Rute peramban lokal modul Pengawasan Lapangan Tertib Penyelenggaraan SIMAK 2 (11 Kolom Standar SIPJAKI)"),
    (30, "Screenshot Visual", "screenshot_simak3_tabel.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_simak3_tabel.png", "Tampilan tabel 10 Kolom Standar SIPJAKI SIMAK 3 (No, Nama Bangunan, Lokasi, Nama Pemilik, Nama Pengelola, Waktu Pengawasan, Propinsi, Kab/Kota, Status, Dokumen, Aksi)"),
    (31, "Screenshot Visual", "screenshot_simak3_edit_modal.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_simak3_edit_modal.png", "Tampilan modal form Edit Pengawasan SIMAK 3 dengan 10 parameter lengkap (Nama Bangunan, Lokasi, Pemilik, Pengelola, Fungsi, SLF)"),
    (32, "Screenshot Visual", "screenshot_simak3_delete_dialog.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_simak3_delete_dialog.png", "Tampilan dialog konfirmasi Hapus Data Pengawasan Bangunan SIMAK 3"),
    (33, "Screenshot Visual", "screenshot_simak3_add_modal.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_simak3_add_modal.png", "Tampilan modal Tambah Pengawasan SIMAK 3 dengan isian lengkap standar kelaikan fungsi bangunan"),
    (34, "Skrip Pengujian CRUD", "test_supabase_simak3.js", "u:/Project/ciptabintar/scripts/test_supabase_simak3.js", "Skrip Node.js otomatis pengujian SELECT, INSERT, UPDATE, DELETE kolom SIMAK 3 pada pengawasan_sesi"),
    (35, "Akses Halaman Lokal", "Pelaksanaan Pengawasan (SIMAK 3)", "http://localhost:3000/pengawasan/tertib-pemanfaatan/pelaksanaan", "Rute peramban lokal modul Pengawasan Lapangan Tertib Pemanfaatan SIMAK 3 (10 Kolom Standar SIPJAKI)"),
    (36, "Screenshot Visual", "screenshot_opd_tab1_profil_sdm.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_opd_tab1_profil_sdm.png", "Tampilan Tab 1 Profil OPD & SDM (12 parameter kelembagaan dan aparatur)"),
    (37, "Screenshot Visual", "screenshot_opd_tab2_data_pendukung.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_opd_tab2_data_pendukung.png", "Tampilan Tab 2 Data Pendukung & Anggaran (PIC, Penyelenggara SIPJAKI, Regulasi SOTK, Pagu Anggaran)"),
    (38, "Screenshot Visual", "screenshot_opd_tab3_pelaksanaan_pengawasan.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_opd_tab3_pelaksanaan_pengawasan.png", "Tampilan Tab 3 Pelaksanaan & Pengawasan (Tugas Pelatihan TKK, BUJK Wilayah, Tabel Realisasi SIMAK Live Auto-Rollup)"),
    (39, "Screenshot Visual", "screenshot_opd_edit_mode.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_opd_edit_mode.png", "Tampilan Mode Formulir Edit Profil OPD 3 Pilar"),
    (40, "Screenshot Visual", "screenshot_paket_tabel_19_kolom.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_paket_tabel_19_kolom.png", "Tampilan tabel 19 Kolom Standar SIPJAKI & 2 Kartu Informasi (Total Paket & Total Nilai Kontrak)"),
    (41, "Screenshot Visual", "screenshot_paket_edit_modal.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_paket_edit_modal.png", "Tampilan modal form Edit Paket Pekerjaan dengan 19 field lengkap (Jenis & Karakteristik Kontrak)"),
    (42, "Screenshot Visual", "screenshot_paket_delete_dialog.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_paket_delete_dialog.png", "Tampilan dialog konfirmasi Hapus Paket Pekerjaan"),
    (43, "Screenshot Visual", "screenshot_paket_add_modal.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_paket_add_modal.png", "Tampilan modal Tambah Paket Pekerjaan (Format 19 Kolom SIPJAKI)"),
    (44, "Skrip Pengujian CRUD", "test_supabase_paket.js", "u:/Project/ciptabintar/scripts/test_supabase_paket.js", "Skrip Node.js otomatis pengujian koneksi dan SELECT kolom baru paket_pekerjaan"),
    (45, "Akses Halaman Lokal", "Data Paket Pekerjaan (19 Kolom)", "http://localhost:3000/paket-pekerjaan", "Rute peramban lokal modul Data Paket Pekerjaan Konstruksi Kabupaten Bogor"),
    (46, "Akses Halaman Lokal", "Profil OPD SIPJAKI (3 Pilar)", "http://localhost:3000/profil-opd", "Rute peramban lokal modul Profil OPD & SDM SIPJAKI Kabupaten Bogor"),
    
    # Data Kecelakaan Konstruksi (SMKK 11 Kolom)
    (47, "Screenshot Visual", "screenshot_kecelakaan_tabel_11_kolom.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_kecelakaan_tabel_11_kolom.png", "Tampilan tabel 11 Kolom Standar SIPJAKI & 2 Kartu Informasi Kecelakaan"),
    (48, "Screenshot Visual", "screenshot_kecelakaan_add_modal.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_kecelakaan_add_modal.png", "Tampilan modal form Tambah Data Kejadian Kecelakaan Konstruksi"),
    (49, "Screenshot Visual", "screenshot_kecelakaan_edit_modal.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_kecelakaan_edit_modal.png", "Tampilan modal form Edit Data Kejadian & Tindak Lanjut Insiden K3"),
    (50, "Screenshot Visual", "screenshot_kecelakaan_delete_dialog.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_kecelakaan_delete_dialog.png", "Tampilan dialog konfirmasi Hapus Data Kejadian Kecelakaan Kerja"),
    (51, "Screenshot Visual", "screenshot_kecelakaan_bap_modal.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_kecelakaan_bap_modal.png", "Tampilan dialog pratinjau Berita Acara Pemeriksaan (BAP) Insiden K3"),
    (52, "Akses Halaman Lokal", "Data Kecelakaan Kerja (11 Kolom)", "http://localhost:3000/kecelakaan", "Rute peramban lokal modul Data Kecelakaan Kerja Konstruksi (SMKK)"),

    # Dashboard Pelatihan SIPJAKI (10 Kolom)
    (53, "Screenshot Visual", "screenshot_pelatihan_tabel_10_kolom.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_pelatihan_tabel_10_kolom.png", "Tampilan tabel 10 Kolom e-Pelatihan SIPJAKI, Checkbox multi-select, 2 Kartu Info, Filter, dan Alat Bantu"),
    (54, "Screenshot Visual", "screenshot_pelatihan_add_modal.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_pelatihan_add_modal.png", "Tampilan modal TAMBAH PELATIHAN dengan pemisahan gender L & P serta kalkulasi total otomatis"),
    (55, "Screenshot Visual", "screenshot_pelatihan_edit_modal.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_pelatihan_edit_modal.png", "Tampilan modal Edit Pelatihan (Ikon Pensil Kuning) dengan data pre-filled lengkap"),
    (56, "Screenshot Visual", "screenshot_pelatihan_detail_modal.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_pelatihan_detail_modal.png", "Tampilan modal Detail Pelatihan (Ikon Mata Biru) menampilkan sebaran gender dan info venue"),
    (57, "Screenshot Visual", "screenshot_pelatihan_bulk_delete_dialog.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_pelatihan_bulk_delete_dialog.png", "Tampilan dialog Hapus Terpilih untuk aksi massal beberapa baris yang dicentang"),
    (58, "Skrip Migrasi SQL", "015_pelatihan_sipjaki_schema.sql", "prototype/supabase/migrations/015_pelatihan_sipjaki_schema.sql", "Skrip pembuatan tabel pelatihan_sipjaki lengkap dengan RLS dan seed 7 kegiatan & 94 peserta"),
    (59, "Akses Halaman Lokal", "Dashboard Pelatihan SIPJAKI", "http://localhost:3000/sipjaki/pelatihan", "Rute peramban lokal modul Dashboard Pelatihan & Sertifikasi SIPJAKI Pusat"),

    # Perencanaan Pelatihan & Sertifikasi TKK (9 Kolom)
    (60, "Screenshot Visual", "screenshot_perencanaan_pelatihan_tabel_9_kolom.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_perencanaan_pelatihan_tabel_9_kolom.png", "Tampilan tabel 9 Kolom Standar SIPJAKI & 3 Kartu Info Kondisi Tahun Berjalan (Total Data, Total Target, Status)"),
    (61, "Screenshot Visual", "screenshot_perencanaan_pelatihan_add_modal.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_perencanaan_pelatihan_add_modal.png", "Tampilan modal TAMBAH DATA usulan rencana tahunan pelatihan/sertifikasi TKK"),
    (62, "Screenshot Visual", "screenshot_perencanaan_pelatihan_doc_modal.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_perencanaan_pelatihan_doc_modal.png", "Tampilan modal pratinjau dokumen KAK resmi (Tombol 'Lihat') dan link buka di tab baru"),
    (63, "Screenshot Visual", "screenshot_perencanaan_pelatihan_edit_modal.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_perencanaan_pelatihan_edit_modal.png", "Tampilan modal Edit Perencanaan (Ikon Pensil Kuning) dengan data usulan pre-filled"),
    (64, "Screenshot Visual", "screenshot_perencanaan_pelatihan_delete_dialog.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_perencanaan_pelatihan_delete_dialog.png", "Tampilan dialog konfirmasi Hapus Data Perencanaan Pelatihan"),
    (65, "Skrip Migrasi SQL", "016_perencanaan_pelatihan_sipjaki_schema.sql", "prototype/supabase/migrations/016_perencanaan_pelatihan_sipjaki_schema.sql", "Skrip pembuatan tabel pelatihan_perencanaan_sipjaki lengkap dengan RLS dan seed"),
    (66, "Akses Halaman Lokal", "Perencanaan Pelatihan (9 Kolom)", "http://localhost:3000/pelatihan/perencanaan", "Rute peramban lokal modul Perencanaan Pelatihan & Sertifikasi TKK Kabupaten Bogor"),

    # Laporan Pelatihan & Sertifikasi TKK (11 Kolom)
    (67, "Screenshot Visual", "screenshot_laporan_pelatihan_tabel_11_kolom.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_laporan_pelatihan_tabel_11_kolom.png", "Tampilan utama tabel Laporan Pelatihan & Sertifikasi TKK 11 Kolom Standar SIPJAKI Pusat, 3 Kartu Info Capaian 2026, Filter Status Verifikasi & Navigasi"),
    (68, "Screenshot Visual", "screenshot_laporan_pelatihan_add_modal.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_laporan_pelatihan_add_modal.png", "Tampilan modal pop-up TAMBAH DATA laporan kegiatan pelatihan/sertifikasi baru"),
    (69, "Screenshot Visual", "screenshot_laporan_pelatihan_doc_modal.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_laporan_pelatihan_doc_modal.png", "Tampilan modal pratinjau dokumen Berita Acara (BA) hasil pelatihan & uji sertifikasi TKK"),
    (70, "Screenshot Visual", "screenshot_laporan_pelatihan_edit_modal.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_laporan_pelatihan_edit_modal.png", "Tampilan modal Ubah / Edit Data Laporan (Ikon Pensil Kuning)"),
    (71, "Screenshot Visual", "screenshot_laporan_pelatihan_delete_dialog.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_laporan_pelatihan_delete_dialog.png", "Tampilan dialog konfirmasi Hapus Data Laporan (Ikon Tempat Sampah Merah)"),
    (72, "Skrip Migrasi SQL", "017_laporan_pelatihan_sipjaki_schema.sql", "prototype/supabase/migrations/017_laporan_pelatihan_sipjaki_schema.sql", "Skrip pembuatan tabel pelatihan_laporan_sipjaki lengkap dengan RLS dan seed data"),
    (73, "Akses Halaman Lokal", "Laporan Pelatihan (11 Kolom)", "http://localhost:3000/pelatihan/laporan", "Rute peramban lokal modul Laporan Pelatihan & Sertifikasi TKK Kabupaten Bogor"),

    # Rekapitulasi TKK Pelatihan (12 Kolom)
    (74, "Screenshot Visual", "screenshot_rekapitulasi_pelatihan_tabel_12_kolom.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_rekapitulasi_pelatihan_tabel_12_kolom.png", "Tampilan utama tabel Rekapitulasi TKK Pelatihan 12 Kolom Standar SIPJAKI Pusat, 3 Kartu Info Capaian 2026, Tombol Navigasi Laporan Pelatihan, Filter Status & Capaian Progress Bar"),
    (75, "Screenshot Visual", "screenshot_rekapitulasi_pelatihan_detail_modal.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_rekapitulasi_pelatihan_detail_modal.png", "Tampilan modal Detail Rincian Paket Pelatihan Wilayah (Aksi Mata Biru) menampilkan breakdown paket kegiatan pembinaan TKK"),
    (76, "Screenshot Visual", "screenshot_rekapitulasi_pelatihan_doc_modal.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_rekapitulasi_pelatihan_doc_modal.png", "Tampilan modal pratinjau dokumen Berkas Rekapitulasi Pembinaan TKK resmi (Tombol 'Lihat') dan tautan buka di tab baru"),
    (77, "Skrip Migrasi SQL", "018_rekapitulasi_pelatihan_sipjaki_schema.sql", "prototype/supabase/migrations/018_rekapitulasi_pelatihan_sipjaki_schema.sql", "Skrip pembuatan tabel pelatihan_rekapitulasi_sipjaki lengkap dengan RLS dan seed"),
    (78, "Akses Halaman Lokal", "Rekapitulasi TKK Pelatihan (12 Kolom)", "http://localhost:3000/pelatihan/rekapitulasi", "Rute peramban lokal modul Rekapitulasi TKK Pelatihan Kabupaten Bogor"),

    # Penguncian NIB & Riwayat Pekerjaan BUJK (Modul 14)
    (79, "Screenshot Visual", "screenshot_portal_bujk_riwayat_terkini.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_portal_bujk_riwayat_terkini.png", "Tampilan Dashboard Role Play BUJK (/portal/bujk) dengan tabel riwayat paket pekerjaan berurutan dari pekerjaan terakhir (DESC), badge 'Pekerjaan Terakhir', dan filter tahun/status"),
    (80, "Screenshot Visual", "screenshot_bujk_detail_riwayat_terkini.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_bujk_detail_riwayat_terkini.png", "Tampilan halaman Detail BUJK (/bujk/B001) menampilkan NIB 13 digit OSS-RBA dan tabel portofolio pekerjaan terhubung berurutan dari pekerjaan mutakhir"),
    (81, "Screenshot Visual", "screenshot_bujk_nib_unique_validation.png", "brain/d9da67b7-89d2-44a4-84d6-870caf820617/screenshot_bujk_nib_unique_validation.png", "Tampilan modal pendaftaran BUJK (/bujk) dengan peringatan validasi merah saat NIB terdaftar diketikkan (mencegah duplikasi data)"),
    (82, "Skrip Migrasi SQL", "019_bujk_nib_unique_schema.sql", "prototype/supabase/migrations/019_bujk_nib_unique_schema.sql", "Skrip penerapan unique constraint NIB uk_bujk_nib, indeks unik idx_bujk_nib_unique, indeks riwayat paket, dan seed multi-tahun"),
    (83, "Akses Halaman Lokal", "Portal Role Play BUJK", "http://localhost:3000/portal/bujk", "Rute peramban portal tenant mandiri BUJK Kabupaten Bogor"),
    (84, "Akses Halaman Lokal", "Detail Profil BUJK", "http://localhost:3000/bujk/B001", "Rute peramban detail profil BUJK dan portofolio pekerjaan terhubung"),
    (85, "Akses Halaman Lokal", "Master Data BUJK", "http://localhost:3000/bujk", "Rute peramban master pangkalan data BUJK Kabupaten Bogor")
]

for row_idx, item in enumerate(data_sheet4, start=header_row4 + 1):
    ws4.row_dimensions[row_idx].height = 26
    is_zebra = (row_idx % 2 == 0)
    for col_idx, val in enumerate(item, start=2):
        cell = ws4.cell(row=row_idx, column=col_idx, value=val)
        cell.font = font_body
        cell.border = thin_border
        if is_zebra:
            cell.fill = fill_zebra
        
        if col_idx == 2:
            cell.alignment = align_center
            cell.font = font_body_bold
        elif col_idx == 3:
            cell.alignment = align_center
            cell.font = Font(name="Calibri", size=10, bold=True, color="0F2E5C")
        else:
            cell.alignment = align_left

# ==============================================================================
# AUTO FIT COLUMN WIDTHS FOR ALL SHEETS
# ==============================================================================
col_widths = {
    "Log Pembaruan Sistem": {2: 6, 3: 26, 4: 24, 5: 35, 6: 45, 7: 35, 8: 45, 9: 20},
    "Matriks Kolom Komparasi": {2: 6, 3: 25, 4: 25, 5: 28, 6: 20, 7: 22, 8: 45},
    "Skema Database Supabase": {2: 6, 3: 35, 4: 38, 5: 50, 6: 45, 7: 24},
    "Katalog Bukti Dokumentasi": {2: 6, 3: 22, 4: 35, 5: 50, 6: 55}
}

for sheet in wb.worksheets:
    sheet_name = sheet.title
    if sheet_name in col_widths:
        for col_idx, width in col_widths[sheet_name].items():
            col_letter = get_column_letter(col_idx)
            sheet.column_dimensions[col_letter].width = width

# Simpan file Excel ke direktori docs dan artifact
docs_path = "u:/Project/ciptabintar/docs/LOG_PEMBARUAN_SIPJAKI_SIJAKON.xlsx"
artifact_path = "C:/Users/ultraman/.gemini/antigravity/brain/d9da67b7-89d2-44a4-84d6-870caf820617/LOG_PEMBARUAN_SIPJAKI_SIJAKON.xlsx"

os.makedirs(os.path.dirname(docs_path), exist_ok=True)
os.makedirs(os.path.dirname(artifact_path), exist_ok=True)

try:
    wb.save(docs_path)
    print(f"✅ Berhasil menyimpan ke: {docs_path}")
except PermissionError:
    alt_docs_path = "u:/Project/ciptabintar/docs/LOG_PEMBARUAN_SIPJAKI_SIJAKON_TERKINI.xlsx"
    wb.save(alt_docs_path)
    print(f"⚠️ Berkas '{docs_path}' sedang dibuka di aplikasi Excel pengguna. Versi terbaru disimpan ke: {alt_docs_path}")

try:
    wb.save(artifact_path)
    print(f"✅ Berhasil menyimpan ke artifact: {artifact_path}")
except Exception as e:
    print(f"Gagal simpan artifact: {e}")

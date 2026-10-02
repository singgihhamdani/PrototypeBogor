import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="CCCCCC", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:left w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        f'  <w:right w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        f'  <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def create_audit_docx(output_path):
    doc = Document()

    # Configure Margins (1 inch all sides)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

        # Header
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("LAPORAN AUDIT & EVALUASI TEKNIS — DOKUMEN USULAN TEKNIS SIJAKON TA 2026")
        hrun.font.name = "Arial"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(100, 116, 139)

        # Footer
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.LEFT
        frun = fp.add_run("Dinas Pekerjaan Umum (DPU) Kabupaten Bogor | Hasil Evaluasi Dokumen Usulan Teknis")
        frun.font.name = "Arial"
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(100, 116, 139)

    # Styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(30, 41, 59)

    # Palette
    NAVY_HEX = "1E3A8A"
    NAVY_RGB = RGBColor(30, 58, 138)
    SLATE_DARK = RGBColor(30, 41, 59)
    SLATE_MUTED = RGBColor(71, 85, 105)

    def add_doc_title(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(text)
        r.font.name = "Arial"
        r.font.size = Pt(16)
        r.font.bold = True
        r.font.color.rgb = NAVY_RGB
        return p

    def add_doc_subtitle(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(4)
        r = p.add_run(text)
        r.font.name = "Arial"
        r.font.size = Pt(11.5)
        r.font.bold = True
        r.font.color.rgb = SLATE_MUTED
        return p

    def add_meta(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(10.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(51, 65, 85)
        return p

    def add_divider():
        div = doc.add_paragraph()
        div.alignment = WD_ALIGN_PARAGRAPH.CENTER
        div.paragraph_format.space_after = Pt(10)
        div.paragraph_format.space_before = Pt(4)
        r_div = div.add_run("—" * 60)
        r_div.font.color.rgb = RGBColor(203, 213, 225)

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = "Arial"
        r.font.size = Pt(13)
        r.font.bold = True
        r.font.color.rgb = NAVY_RGB
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = "Arial"
        r.font.size = Pt(11.5)
        r.font.bold = True
        r.font.color.rgb = SLATE_DARK
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = "Arial"
        r.font.size = Pt(10.5)
        r.font.bold = True
        r.font.color.rgb = SLATE_MUTED
        return p

    def add_p(text, bold_prefix=None, italic=False):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(5)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            rb = p.add_run(bold_prefix)
            rb.font.bold = True
            rb.font.name = "Calibri"
            rb.font.size = Pt(11)
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(11)
        r.font.italic = italic
        r.font.color.rgb = SLATE_DARK
        return p

    def add_bullet(text, level=0, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            rb = p.add_run(bold_prefix)
            rb.font.bold = True
            rb.font.name = "Calibri"
            rb.font.size = Pt(10.5)
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(10.5)
        r.font.color.rgb = SLATE_DARK
        return p

    def add_callout(title, text, bg_hex="EFF6FF", border_color="2563EB", title_color="1E40AF"):
        table = doc.add_table(rows=1, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        tblPr = table._tbl.tblPr
        borders = parse_xml(
            f'<w:tblBorders {nsdecls("w")}>'
            f'  <w:top w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
            f'  <w:bottom w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
            f'  <w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/>'
            f'  <w:right w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
            f'  <w:insideH w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
            f'  <w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
            f'</w:tblBorders>'
        )
        tblPr.append(borders)
        cell = table.rows[0].cells[0]
        cell.width = Inches(6.5)
        set_cell_background(cell, bg_hex)
        set_cell_margins(cell, top=100, bottom=100, left=160, right=160)
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        if title:
            rt = p.add_run(f"{title}\n")
            rt.font.name = "Arial"
            rt.font.size = Pt(10)
            rt.font.bold = True
            r_c = int(title_color[0:2], 16)
            g_c = int(title_color[2:4], 16)
            b_c = int(title_color[4:6], 16)
            rt.font.color.rgb = RGBColor(r_c, g_c, b_c)
        rc = p.add_run(text)
        rc.font.name = "Calibri"
        rc.font.size = Pt(10)
        rc.font.color.rgb = RGBColor(51, 65, 85)
        doc.add_paragraph()

    def add_table(headers, rows, col_widths=None, header_bg="1E3A8A"):
        table = doc.add_table(rows=1 + len(rows), cols=len(headers))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(table)

        # Header row
        for i, h_text in enumerate(headers):
            cell = table.rows[0].cells[i]
            cell.text = ""
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(h_text)
            r.font.name = "Calibri"
            r.font.size = Pt(10)
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)
            set_cell_background(cell, header_bg)
            set_cell_margins(cell)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER

        # Data rows
        for row_idx, row_data in enumerate(rows):
            is_even = (row_idx % 2 == 1)
            row_cells = table.rows[1 + row_idx].cells
            for col_idx, cell_data in enumerate(row_data):
                cell = row_cells[col_idx]
                cell.text = ""
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                p.paragraph_format.space_before = Pt(1)
                p.paragraph_format.space_after = Pt(1)
                p.paragraph_format.line_spacing = 1.15

                if isinstance(cell_data, tuple):
                    c_text, c_bold, c_color = cell_data
                    r = p.add_run(str(c_text))
                    r.font.bold = c_bold
                    if c_color:
                        r.font.color.rgb = c_color
                else:
                    r = p.add_run(str(cell_data))
                    r.font.color.rgb = SLATE_DARK
                
                r.font.name = "Calibri"
                r.font.size = Pt(9.5)

                if is_even:
                    set_cell_background(cell, "F8FAFC")
                set_cell_margins(cell)
                cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER

        if col_widths:
            for row in table.rows:
                for idx, w in enumerate(col_widths):
                    if idx < len(row.cells):
                        row.cells[idx].width = Inches(w)

        doc.add_paragraph()
        return table

    # =========================================================================
    # DOKUMEN KONTEN
    # =========================================================================

    # Title & Metadata Block
    add_doc_title("LAPORAN AUDIT & EVALUASI TEKNIS")
    add_doc_subtitle("DOKUMEN USULAN TEKNIS JASA KONSULTANSI PERENCANAAN SISTEM INFORMASI JASA KONSTRUKSI (SIJAKON)")
    add_meta("Pemerintah Kabupaten Bogor — Dinas Pekerjaan Umum (DPU) TA 2026")
    add_meta("Ref. Dokumen Diuji: DOKUMEN USULAN TEKNIS FIX.pdf (42 Halaman) vs KAK Perencanaan SIJAKON 2026")
    add_divider()

    # Status Callout
    add_callout(
        "STATUS HASIL EVALUASI: REVISI MAYOR DIPERLUKAN (HIGH RISK OF DISQUALIFICATION)",
        "Dokumen penawaran teknis ini memuat elaborasi substansi metodologi dan arsitektur data jasa konstruksi yang sangat baik, namun MEMILIKI 4 KECACATAN FATAL pada aspek legalitas formasi tenaga ahli, struktur organisasi, jadwal alokasi penugasan, dan kelengkapan deliverables. Jika diajukan tanpa revisi pada tender resmi, dokumen ini BERISIKO TINGGI GUGUR PADA EVALUASI TEKNIS POKJA PEMILIHAN.",
        bg_hex="FEF2F2",
        border_color="DC2626",
        title_color="991B1B"
    )

    # -------------------------------------------------------------------------
    # BAB 1: INFORMASI DOKUMEN & METADATA AUDIT
    # -------------------------------------------------------------------------
    add_h1("1. INFORMASI DOKUMEN & METADATA AUDIT")
    add_p("Laporan ini disusun sebagai hasil audit menyeluruh (comprehensive quality & compliance audit) terhadap Dokumen Usulan Teknis yang diajukan oleh calon Penyedia Jasa Konsultansi untuk paket pekerjaan Perencanaan Sistem Informasi Jasa Konstruksi (SIJAKON) Kabupaten Bogor Tahun Anggaran 2026.")

    meta_table_headers = ["Parameter Evaluasi", "Rincian / Data Lapangan"]
    meta_table_data = [
        [("Nama Paket Pekerjaan", True, None), "Jasa Konsultansi Perencanaan Sistem Informasi Jasa Konstruksi (SIJAKON)"],
        [("Pengguna Jasa", True, None), "Dinas Pekerjaan Umum (DPU) Kabupaten Bogor"],
        [("Tahun Anggaran", True, None), "2026"],
        [("Dokumen yang Diuji", True, None), "DOKUMEN USULAN TEKNIS FIX.pdf (Ukuran 1,67 MB, 42 Halaman)"],
        [("Dokumen Acuan Evaluasi", True, None), "KAK Perencanaan Sistem Informasi Jasa Konstruksi Bogor 2026 & Perpres No. 16/2018 jo No. 12/2021"],
        [("Metode Evaluasi", True, None), "Pemeriksaan Kepatuhan Klausul KAK, Analisis Kualifikasi Tenaga Ahli, Audit Redaksional & Formatting"],
        [("Kesimpulan Akhir", True, RGBColor(220, 38, 38)), ("NON-COMPLIANT (PERLU REVISI WAJIB SEBELUM SUBMISI RESMI)", True, RGBColor(220, 38, 38))]
    ]
    add_table(meta_table_headers, meta_table_data, col_widths=[2.3, 4.2])

    # -------------------------------------------------------------------------
    # BAB 2: RINGKASAN EKSEKUTIF & SKOR KEPATUHAN
    # -------------------------------------------------------------------------
    add_h1("2. RINGKASAN EKSEKUTIF & TINGKAT KEPATUHAN")
    add_p("Berdasarkan hasil audit komparatif pasal per pasal dan lembar per lembar antara Dokumen Usulan Teknis (42 halaman) dengan Kerangka Acuan Kerja (KAK) Perencanaan, berikut adalah matriks skor kepatuhan dokumen berdasarkan kriteria evaluasi teknis standar pengadaan jasa konsultansi:")

    score_headers = ["Kriteria Evaluasi Teknis", "Bobot Standar", "Skor Kepatuhan", "Status", "Catatan Pokok"]
    score_data = [
        [
            ("1. Pengalaman Perusahaan (Bab I)", True, None),
            "10 - 20%",
            ("0%", True, RGBColor(220, 38, 38)),
            ("GAGAL TOTAL", True, RGBColor(220, 38, 38)),
            "Dokumen PDF langsung dimulai dari Bab 2 (Subbab 2.1). Bab I tentang Pengalaman dan Profil Perusahaan hilang."
        ],
        [
            ("2. Pendekatan & Metodologi (Bab 2)", True, None),
            "30 - 40%",
            ("80%", True, RGBColor(22, 163, 74)),
            ("MEMENUHI DENGAN CATATAN", True, RGBColor(202, 138, 4)),
            "Pemahaman materi jasa konstruksi (TKK, rantai pasok, GIS) sangat mendalam, namun ada inkonsistensi deliverables & vendor-lockin AI."
        ],
        [
            ("3. Kualifikasi Tenaga Ahli (Bab 2.5)", True, None),
            "40 - 50%",
            ("40%", True, RGBColor(220, 38, 38)),
            ("CACAT FATAL (POTENSI GUGUR)", True, RGBColor(220, 38, 38)),
            "Posisi Ahli No. 3 HILANG. Mengganti System Analyst & UI/UX dengan 'Programmer IT'. Tidak ada matriks penugasan Man-Month."
        ],
        [
            ("4. Struktur Organisasi & Tata Kerja", True, None),
            "5 - 10%",
            ("20%", True, RGBColor(220, 38, 38)),
            ("KOSONG MELOMPONG", True, RGBColor(220, 38, 38)),
            "Subbab 2.5.1 Struktur Organisasi hanya ada judul tanpa teks dan tanpa bagan organigram sama sekali."
        ],
        [
            ("5. Kerapian Redaksional & Formatting", True, None),
            "Pendukung",
            ("60%", True, RGBColor(202, 138, 4)),
            ("PERLU PERBAIKAN", True, RGBColor(202, 138, 4)),
            "Terdapat banyak typo fatal pada heading utama ('TUJAN', 'BEKALANG', 'DELIVERABES', 'PELASANAAN'), penomoran gambar acak-acakan."
        ]
    ]
    add_table(score_headers, score_data, col_widths=[1.5, 0.9, 0.9, 1.2, 2.0])

    # -------------------------------------------------------------------------
    # BAB 3: MATRIKS TEMUAN KRITIS (FATAL FLAWS) & RISIKO PENGGUGURAN
    # -------------------------------------------------------------------------
    add_h1("3. MATRIKS TEMUAN KRITIS (FATAL FLAWS) & RISIKO PENGGUGURAN")
    add_p("Pada bab ini diuraikan secara mendalam 5 (lima) cacat kritis yang memiliki dampak hukum pengadaan dan risiko pengguguran penawaran:")

    # Temuan 1
    add_h2("Temuan Kritis 1: Ketidaksesuaian Formasi Tenaga Ahli & Hilangnya Ahli Nomor Urut 3")
    add_bullet("Lokasi pada PDF: Halaman 5 (Tabel 2.1), Halaman 13 (Tabel 2.2), dan Halaman 42 (Tabel 2.8).", bold_prefix="Lokasi: ")
    add_bullet("Persyaratan KAK Bab 8: Membutuhkan 4 Orang Tenaga Ahli dan 1 Tenaga Pendukung:", bold_prefix="KAK Acuan: ")
    add_bullet("1. Team Leader / Ahli Sistem Informasi (S1 Informatika/Ilmu Komputer/SI, Pengalaman min. 5 tahun, 2 OB)", level=1)
    add_bullet("2. System & Business Analyst (S1 Informatika/Sistem Informasi, Pengalaman min. 3 tahun, 2 OB)", level=1)
    add_bullet("3. UI/UX Prototyper / Ahli Desain Antarmuka (S1 DKV/Informatika/SI, Pengalaman min. 3 tahun, 2 OB)", level=1)
    add_bullet("4. GIS & Spatial Data Specialist (S1 Geodesi/Geografi/Geomatika/Informatika, Pengalaman min. 3 tahun, 2 OB)", level=1)
    add_bullet("5. Tenaga Administrasi / Operator Komputer (D3/S1 segala jurusan, Pengalaman min. 2 tahun, 2 OB)", level=1)
    
    add_bullet("Kondisi pada Dokumen Usulan Teknis PDF:", bold_prefix="Fakta Lapangan: ")
    add_bullet("• Nomor 1: Team Leader (Sesuai)", level=1)
    add_bullet("• Nomor 2: 'Ahli Software Programer IT' — Menggabungkan peran analisis sistem dan pembuatan prototipe UI/UX dalam satu personil.", level=1)
    add_bullet("• Nomor 3: HILANG TOTAL. Tabel langsung melompat dari Nomor 2 ke Nomor 4!", level=1)
    add_bullet("• Nomor 4: Ahli GIS (Sesuai)", level=1)
    add_bullet("• Tenaga Pendukung: Tenaga Administrasi (Sesuai)", level=1)

    add_callout(
        "ANALISIS RISIKO HUKUM & PENGGUGURAN TEKNIS (RISIKO TERTINGGI):",
        "1. Ini adalah Pengadaan Jasa Konsultansi Perencanaan (DED Sistem), BUKAN Pengadaan Pengembangan Perangkat Lunak (Coding). Di tahap perencanaan, keluaran yang dihasilkan adalah Analisis Kebutuhan (SRS) dan Prototipe Desain Antarmuka (UI/UX). Keberadaan System Analyst dan UI/UX Prototyper adalah MANDATORI MUTLAK.\n2. Mengganti posisi System Analyst dan UI/UX dengan 'Programmer' memperlihatkan ketidakpahaman konsultan terhadap nature pekerjaan konsultansi perencanaan.\n3. Hilangnya Ahli Nomor 3 menyebabkan jumlah personil tenaga ahli kurang dari 4 orang. Pokja Evaluasi akan memberikan skor 0 pada personil yang hilang dan personil yang tidak sesuai kualifikasi, sehingga nilai teknis dipastikan tidak lolos ambang batas (Passing Grade).",
        bg_hex="FEF2F2",
        border_color="DC2626",
        title_color="991B1B"
    )

    # Temuan 2
    add_h2("Temuan Kritis 2: Kekosongan Total pada Subbab Struktur Organisasi Pelaksana")
    add_bullet("Lokasi pada PDF: Halaman 40, Subbab 2.5.1.", bold_prefix="Lokasi: ")
    add_bullet("Kondisi pada Dokumen Usulan Teknis PDF: Judul subbab '2.5.1. STRUKTUR ORGANISASI PELAKSANAAN KEGIATAN' tercetak, namun DI BAWAHNYA KOSONG MELOMPONG tanpa narasi satu kalimat pun dan tanpa gambar/bagan struktur organisasi. Halaman langsung melompat ke Subbab 2.5.2.", bold_prefix="Fakta Lapangan: ")
    add_bullet("Dampak Evaluasi: Sub-unsur Organisasi dan Personil Pelaksana dalam evaluasi penawaran teknis Pokja akan diberi nilai 0 (NOL) karena ketiadaan organigram penugasan tim.", bold_prefix="Dampak Evaluasi: ")

    # Temuan 3
    add_h2("Temuan Kritis 3: Ketiadaan Matriks Jadwal Penugasan Tenaga Ahli (Person-Month Schedule)")
    add_bullet("Lokasi pada PDF: Halaman 41.", bold_prefix="Lokasi: ")
    add_bullet("Kondisi pada Dokumen Usulan Teknis PDF: Hanya tersedia Tabel 2.7 (Jadwal Pelaksanaan Pekerjaan) yang memetakan tahapan kegiatan umum. TIDAK DITEMUKAN Matriks Jadwal Penugasan Tenaga Ahli (Daftar alokasi keterlibatan masing-masing personil minggu per minggu dari Minggu ke-1 hingga Minggu ke-8, serta total Orang-Bulan / Man-Month).", bold_prefix="Fakta Lapangan: ")
    add_bullet("Dampak Evaluasi: Formulir Jadwal Penugasan Tenaga Ahli adalah lampiran wajib dalam Dokumen Penawaran Teknis Konsultansi sesuai Standar Dokumen Pengadaan (SDP) LKPP. Tanpa tabel ini, Pokja tidak dapat menilai kecukupan alokasi jam kerja tenaga ahli.", bold_prefix="Dampak Evaluasi: ")

    # Temuan 4
    add_h2("Temuan Kritis 4: Inkonsistensi dan Pengurangan Volume Deliverables / Keluaran")
    add_bullet("Lokasi pada PDF: Halaman 5 (Tabel 2.1) dan Halaman 14 (Tabel 2.3).", bold_prefix="Lokasi: ")
    add_bullet("Persyaratan KAK Bab 9: Menetapkan 5 (lima) paket Deliverables utama:", bold_prefix="KAK Acuan: ")
    add_bullet("1. Laporan Pendahuluan (5 buku laporan)", level=1)
    add_bullet("2. Laporan Antara (5 buku laporan)", level=1)
    add_bullet("3. Dokumen DED & Arsitektur Sistem Informasi (5 buku laporan)", level=1)
    add_bullet("4. Berkas Prototipe Antarmuka Interaktif (Figma / Web Simulator)", level=1)
    add_bullet("5. Laporan Akhir & Executive Summary (5 buku + Flashdisk 64GB)", level=1)
    add_bullet("Kondisi pada Dokumen Usulan Teknis PDF: Di Tabel 2.1 (hal 5) dan Tabel 2.3 (hal 14), konsultan HANYA MENCANTUMKAN 3 KELUARAN: Laporan Pendahuluan, Laporan Akhir, dan Modul Antarmuka Interaktif. Laporan Antara dan Dokumen DED DIHILANGKAN dari daftar keluaran.", bold_prefix="Fakta Lapangan: ")
    add_bullet("Inkonsistensi Internal: Pada jadwal kerja di halaman 41, konsultan mencantumkan kegiatan 'Pembahasan Laporan Antara', namun di daftar deliverables resmi pada bab pemahaman KAK, Laporan Antara dan Buku DED tidak dicantumkan.", bold_prefix="Inkonsistensi: ")

    # Temuan 5
    add_h2("Temuan Kritis 5: Cacat Format Dokumen (Kehilangan Front Matter & Bab I)")
    add_bullet("Lokasi pada PDF: Halaman 1.", bold_prefix="Lokasi: ")
    add_bullet("Kondisi Dokumen: PDF dimulai secara tiba-tiba di Halaman 1 langsung dengan Subbab '2.1. KERANGKA ACUAN KERJA'. Tidak terdapat:", bold_prefix="Fakta Lapangan: ")
    add_bullet("1. Cover / Sampul Depan Dokumen Penawaran Teknis", level=1)
    add_bullet("2. Lembar Surat Penawaran Teknis / Surat Pengantar", level=1)
    add_bullet("3. Lembar Pengesahan / Pernyataan Tanggung Jawab", level=1)
    add_bullet("4. Daftar Isi, Daftar Tabel, Daftar Gambar, dan Daftar Lampiran", level=1)
    add_bullet("5. BAB I: PENDAHULUAN (Profil Perusahaan, Pengalaman Sejenis, dsb)", level=1)
    add_bullet("Dampak: Dokumen terlihat seperti 'potongan draft' internal yang belum tuntas dikompilasi, sangat merugikan citra profesionalitas konsultan di hadapan Pokja dan Pejabat Pembuat Komitmen (PPK).", bold_prefix="Dampak: ")

    # -------------------------------------------------------------------------
    # BAB 4: ANALISIS KOMPARASI SUBSTANSIAL (KAK VS USULAN TEKNIS)
    # -------------------------------------------------------------------------
    add_h1("4. ANALISIS KOMPARASI SUBSTANSIAL (KAK VS USULAN TEKNIS)")
    add_p("Tabel berikut menyajikan perbandingan klausul demi klausul antara Kerangka Acuan Kerja (KAK) resmi dengan Dokumen Usulan Teknis yang diajukan:")

    comp_headers = ["Parameter KAK", "Spesifikasi dalam KAK Perencanaan", "Realisasi Dokumen Usulan Teknis", "Status Kesesuaian"]
    comp_data = [
        [
            ("Maksud & Tujuan", True, None),
            "Menyusun DED, Blueprint Arsitektur, dan Prototipe Interaktif SIJAKON Bogor 2026",
            "Menyajikan maksud dan tujuan secara rinci pada hal 1-2 (namun ada typo pada judul subbab)",
            ("SESUAI SUBSTANSI", True, RGBColor(22, 163, 74))
        ],
        [
            ("Ruang Lingkup", True, None),
            "7 Modul Utama (Rantai Pasok, TKK, Pengawasan, Pelatihan, Pendaftaran, Asosiasi, Dashboard Eksekutif/GIS)",
            "Mencakup seluruh modul bahkan menambahkan konsep integrasi AI asisten cerdas",
            ("SANGAT BAIK", True, RGBColor(22, 163, 74))
        ],
        [
            ("Jangka Waktu", True, None),
            "60 (Enam Puluh) Hari Kalender (8 Minggu)",
            "Sesuai (60 hari kalender, disajikan dalam jadwal 8 minggu pada hal 41)",
            ("SESUAI", True, RGBColor(22, 163, 74))
        ],
        [
            ("Formasi Tenaga Ahli", True, None),
            "4 Tenaga Ahli (Team Leader, System Analyst, UI/UX, GIS Specialist) + 1 Pendukung",
            "3 Ahli tercantum (No. 3 hilang, System Analyst & UI/UX digabung jadi Programmer)",
            ("TIDAK SESUAI (FATAL)", True, RGBColor(220, 38, 38))
        ],
        [
            ("Alokasi Man-Month", True, None),
            "Masing-masing tenaga ahli ditugaskan 2 Bulan (Total 8 MM Ahli + 2 MM Pendukung)",
            "Tidak ada matriks penugasan person-month yang disajikan",
            ("TIDAK ADA (FATAL)", True, RGBColor(220, 38, 38))
        ],
        [
            ("Struktur Organisasi", True, None),
            "Bagan struktur organisasi pelaksana dan uraian tugas masing-masing personil",
            "Subbab 2.5.1 kosong melompong (hanya judul subbab)",
            ("TIDAK ADA (FATAL)", True, RGBColor(220, 38, 38))
        ],
        [
            ("Daftar Deliverables", True, None),
            "5 Laporan (Pendahuluan, Antara, Dokumen DED, Prototipe Figma, Laporan Akhir)",
            "Hanya mencantumkan 3 deliverables (Laporan Antara & Dokumen DED hilang di tabel)",
            ("TIDAK SESUAI (MAYOR)", True, RGBColor(220, 38, 38))
        ],
        [
            ("Arsitektur Teknologi", True, None),
            "Kepatuhan terhadap SPBE, Satu Data Indonesia, dan Standar Keamanan BSSN",
            "Sangat rinci, namun menyebutkan merek AI komersial spesifik ('AI Qwen') pada hal 35 & 39",
            ("PERLU REVISI BRANDING", True, RGBColor(202, 138, 4))
        ]
    ]
    add_table(comp_headers, comp_data, col_widths=[1.3, 1.9, 2.1, 1.2])

    # -------------------------------------------------------------------------
    # BAB 5: DAFTAR TEMUAN REDAKSIONAL, TYPO, DAN ANOMALI FORMATTING
    # -------------------------------------------------------------------------
    add_h1("5. DAFTAR TEMUAN REDAKSIONAL, TYPO, DAN ANOMALI FORMAT")
    add_p("Selain temuan substansi di atas, audit menemukan berbagai kesalahan ketik (typo), kekeliruan redaksional, dan anomali tata letak halaman per halaman sebagai berikut:")

    typo_headers = ["No", "Hal", "Lokasi / Subbab", "Teks Tertulis (Salah)", "Koreksi / Perbaikan yang Benar", "Tingkat Urgensi"]
    typo_data = [
        [
            "1", "1", "Subbab 2.1.2",
            "MAKSUD TUJAN DAN SASARAN",
            "MAKSUD, TUJUAN, DAN SASARAN (Perbaiki kata 'TUJAN')",
            ("TINGGI", True, RGBColor(220, 38, 38))
        ],
        [
            "2", "6", "Subbab 2.1.11",
            "Teks berisi copy-paste jangka waktu 60 hari kalender",
            "Ganti dengan uraian sistem pelaporan pekerjaan (Laporan Pendahuluan, Antara, DED, Akhir)",
            ("TINGGI", True, RGBColor(220, 38, 38))
        ],
        [
            "3", "8", "Subbab 2.2.1",
            "TANGGAPAN TERHADAP LATAR BEKALANG",
            "TANGGAPAN TERHADAP LATAR BELAKANG (Perbaiki kata 'BEKALANG')",
            ("TINGGI", True, RGBColor(220, 38, 38))
        ],
        [
            "4", "13", "Subbab 2.2.9",
            "TANGGAPAN TERHADAP KELUARAN (DELIVERABES)",
            "TANGGAPAN TERHADAP KELUARAN (DELIVERABLES) (Kurang huruf 'L')",
            ("TINGGI", True, RGBColor(220, 38, 38))
        ],
        [
            "5", "14", "Tabel 2.3",
            "JADWAL PELASANAAN KEGIATAN",
            "JADWAL PELAKSANAAN KEGIATAN (Kurang huruf 'K')",
            ("SEDANG", True, RGBColor(202, 138, 4))
        ],
        [
            "6", "16, 20", "Paragraf Narasi",
            "...dalam pelasanaan kegiatan perencanaan...",
            "Perbaiki menjadi 'pelaksanaan kegiatan'",
            ("SEDANG", True, RGBColor(202, 138, 4))
        ],
        [
            "7", "34", "Judul Tabel",
            "Tabel ?. Pilar Konsep Fundamental Pengembangan SIJAKON",
            "Isi placeholder nomor tabel, ubah menjadi 'Tabel 2.6' atau nomor urut yang tepat",
            ("TINGGI", True, RGBColor(220, 38, 38))
        ],
        [
            "8", "35, 39", "Paragraf AI",
            "...integrasi AI (Qwen) yang responsif...",
            "Hapus penyebutan merek vendor tunggal 'Qwen'. Ubah menjadi 'arsitektur On-Premise LLM / Open-Weights AI berstandar SPBE'",
            ("SEDANG", True, RGBColor(202, 138, 4))
        ],
        [
            "9", "36", "Keterangan Gambar",
            "Gambar 5.1 Ilustrasi Contoh Penggunakan Ai Asisstant...",
            "Perbaiki: 'Gambar 2.X Ilustrasi Contoh Penggunaan AI Assistant...' (Typo 'Penggunakan' & nomor gambar)",
            ("SEDANG", True, RGBColor(202, 138, 4))
        ],
        [
            "10", "7-38", "Seluruh Bab 2",
            "Penomoran Gambar melompat: Gambar 1.1 (hal 7), 2.1 (hal 21), 3.1 (hal 24), 4.1 (hal 32), 5.1 (hal 36)",
            "Standardisasi penomoran gambar sesuai bab: Gambar 2.1 s.d. Gambar 2.7 secara berurutan",
            ("TINGGI", True, RGBColor(220, 38, 38))
        ],
        [
            "11", "40", "Subbab 2.5.1",
            "Judul subbab berdiri sendiri tanpa teks/bagan",
            "Masukkan bagan struktur organisasi tim dan uraian tugas masing-masing personil",
            ("FATAL", True, RGBColor(220, 38, 38))
        ],
        [
            "12", "42", "Tabel 2.8",
            "Nomor urut personil melompat dari No. 2 langsung ke No. 4",
            "Lengkapi 4 personil tenaga ahli lengkap secara berurutan nomor 1 s.d 4",
            ("FATAL", True, RGBColor(220, 38, 38))
        ]
    ]
    add_table(typo_headers, typo_data, col_widths=[0.4, 0.5, 1.2, 1.8, 1.8, 0.8])

    # -------------------------------------------------------------------------
    # BAB 6: MATERI SOLUSI & DRAFT REVISI SIAP PAKAI (READY-TO-USE DRAFT)
    # -------------------------------------------------------------------------
    add_h1("6. MATERI SOLUSI & DRAFT REVISI SIAP PAKAI")
    add_p("Untuk memudahkan tim penyusun merevisi Dokumen Usulan Teknis dengan cepat dan akurat, bagian ini menyajikan draf redaksional siap pakai (copy-paste ready) yang telah diselaraskan 100% dengan KAK:")

    # 6.1 Draft Formasi Tenaga Ahli
    add_h2("6.1. Draf Pengganti Tabel Tenaga Ahli (Sesuai KAK Bab 8)")
    add_p("Gantikan Tabel 2.1 (hal 5), Tabel 2.2 (hal 13), dan Tabel 2.8 (hal 42) dengan tabel baku berikut:")

    ta_headers = ["No", "Posisi Penugasan", "Kualifikasi Pendidikan & Pengalaman", "Uraian Tugas & Tanggung Jawab Utama", "Waktu"]
    ta_data = [
        [
            "1",
            ("Team Leader / Ahli Sistem Informasi", True, None),
            "S1 Teknik Informatika / Ilmu Komputer / Sistem Informasi. Pengalaman kerja min. 5 tahun di bidang SI/TI.",
            "Memimpin seluruh pelaksanaan kegiatan perencanaan, mengoordinasikan tim ahli, mengendalikan mutu laporan, memfasilitasi FGD/asistensi dengan DPU, dan menyusun Blueprint Arsitektur Sistem.",
            "2 Bulan (2 OB)"
        ],
        [
            "2",
            ("System & Business Analyst", True, None),
            "S1 Teknik Informatika / Sistem Informasi. Pengalaman kerja min. 3 tahun dalam analisis proses bisnis dan perancangan sistem informasi.",
            "Melakukan identifikasi dan analisis proses bisnis pembinaan jasa konstruksi, menyusun Software Requirements Specification (SRS), merancang diagram alir data (DFD/BPMN), dan menyusun DED modul.",
            "2 Bulan (2 OB)"
        ],
        [
            "3",
            ("UI/UX Prototyper / Ahli Desain Antarmuka", True, None),
            "S1 Desain Komunikasi Visual (DKV) / Teknik Informatika / Sistem Informasi. Pengalaman kerja min. 3 tahun dalam UI/UX.",
            "Merancang User Experience (UX), Wireframe, Design System, High-Fidelity UI, dan membangun Prototipe Interaktif (clickable prototype) berbasis Figma untuk seluruh 7 modul SIJAKON.",
            "2 Bulan (2 OB)"
        ],
        [
            "4",
            ("GIS & Spatial Data Specialist", True, None),
            "S1 Teknik Geodesi / Geografi / Geomatika / Informatika. Pengalaman kerja min. 3 tahun di bidang WebGIS.",
            "Merancang arsitektur data spasial proyek konstruksi, skema geodatabase (PostGIS/GeoJSON), integrasi basemap One Map Policy, serta pemetaan sebaran TKK, badan usaha, dan material konstruksi.",
            "2 Bulan (2 OB)"
        ],
        [
            "B.1",
            ("Tenaga Administrasi / Operator Komputer", True, None),
            "D3 / S1 Semua Jurusan. Pengalaman kerja min. 2 tahun di bidang administrasi perkantoran / proyek.",
            "Mendukung pengelolaan administrasi proyek, korespondensi, penyiapan logistik rapat koordinasi/FGD, kompilasi dokumen laporan, dan inventarisasi berkas penyerahan pekerjaan.",
            "2 Bulan (2 OB)"
        ]
    ]
    add_table(ta_headers, ta_data, col_widths=[0.4, 1.4, 1.6, 2.4, 0.7])

    # 6.2 Draft Struktur Organisasi
    add_h2("6.2. Draf Teks & Bagan Struktur Organisasi (Subbab 2.5.1)")
    add_p("Gunakan narasi berikut untuk mengisi kekosongan pada Subbab 2.5.1 (halaman 40):")

    add_callout(
        "REDAKSIONAL SIAP PAKAI: SUBBAB 2.5.1 STRUKTUR ORGANISASI PELAKSANAAN KEGIATAN",
        "Untuk menjamin kelancaran, efektivitas, dan ketepatan waktu dalam pelaksanaan pekerjaan Perencanaan Sistem Informasi Jasa Konstruksi (SIJAKON) Kabupaten Bogor Tahun Anggaran 2026, dibentuk suatu struktur organisasi tim pelaksana yang terintegrasi secara profesional.\n\n"
        "Struktur organisasi ini menghubungkan secara hierarkis dan koordinatif antara Pengguna Jasa (Dinas Pekerjaan Umum Kabupaten Bogor melalui PPK dan PPTK), Tim Teknis Pembina Jasa Konstruksi, dengan Tim Konsultan Perencana yang dipimpin oleh Team Leader.\n\n"
        "Hubungan Kerja dan Koordinasi:\n"
        "1. Pejabat Pembuat Komitmen (PPK) / PPTK DPU: Bertindak sebagai pengarah kebijakan, pengendali kontrak, dan penanggung jawab program kegiatan.\n"
        "2. Tim Leader (Ahli Sistem Informasi): Bertanggung jawab penuh kepada PPK atas seluruh mutu manajerial dan substansi teknis perencanaan, serta mengoordinasikan seluruh Tenaga Ahli.\n"
        "3. System & Business Analyst: Berkoordinasi intensif dengan bidang pembinaan jasa konstruksi untuk perumusan kebutuhan fungsional dan tata kelola regulasi.\n"
        "4. UI/UX Prototyper: Menerjemahkan rumusan kebutuhan analis ke dalam antarmuka interaktif dan berkoordinasi dengan pengguna akhir untuk usability testing.\n"
        "5. GIS Specialist: Bertanggung jawab atas ketersediaan data spasial dan integrasi pemetaan infrastruktur.\n"
        "6. Tenaga Administrasi: Mendukung operasional harian dan dokumentasi pelaporan.",
        bg_hex="F0FDF4",
        border_color="16A34A",
        title_color="15803D"
    )

    # 6.3 Matriks Penugasan Tenaga Ahli (Man-Month)
    add_h2("6.3. Draf Matriks Jadwal Penugasan Tenaga Ahli (Person-Month Schedule)")
    add_p("Sisipkan tabel berikut di bawah Subbab 2.5.2 sebagai bukti alokasi waktu dan keterlibatan personil selama 60 hari kalender (8 minggu):")

    mm_headers_detail = ["No", "Posisi Tenaga Ahli", "M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "Total MM"]
    mm_data_detail = [
        ["1", ("Team Leader / Ahli Sistem Informasi", True, None), "V", "V", "V", "V", "V", "V", "V", "V", ("2.0 OB", True, None)],
        ["2", ("System & Business Analyst", True, None), "V", "V", "V", "V", "V", "V", "-", "-", ("2.0 OB", True, None)],
        ["3", ("UI/UX Prototyper / Ahli Desain Antarmuka", True, None), "-", "-", "V", "V", "V", "V", "V", "V", ("2.0 OB", True, None)],
        ["4", ("GIS & Spatial Data Specialist", True, None), "-", "V", "V", "V", "V", "V", "V", "-", ("2.0 OB", True, None)],
        ["B.1", ("Tenaga Administrasi / Operator", True, None), "V", "V", "V", "V", "V", "V", "V", "V", ("2.0 OB", True, None)],
        [("", False, None), ("TOTAL ALOKASI MAN-MONTH", True, NAVY_RGB), "", "", "", "", "", "", "", "", ("10.0 OB", True, NAVY_RGB)]
    ]
    add_table(mm_headers_detail, mm_data_detail, col_widths=[0.4, 2.5, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.8])

    # 6.4 Draf Deliverables
    add_h2("6.4. Draf Tabel Keluaran / Deliverables Lengkap (Sesuai KAK Bab 9)")
    add_p("Gantikan klausul keluaran pada Tabel 2.1 (hal 5) dan Tabel 2.3 (hal 14) dengan tabel berikut:")

    deliv_headers = ["No", "Nama Produk Laporan / Keluaran", "Bentuk & Format Dokumen", "Waktu Penyerahan", "Volume"]
    deliv_data = [
        [
            "1",
            ("Laporan Pendahuluan", True, None),
            "Buku Laporan Cetak A4 Hard/Soft Cover + File Digital (PDF/DOC)",
            "Akhir Minggu ke-2 (Hari ke-14)",
            "5 Buku Eksemplar"
        ],
        [
            "2",
            ("Laporan Antara (Interim Report)", True, None),
            "Buku Laporan Cetak A4 + Hasil Analisis Kebutuhan Sistem & Matriks Wawancara",
            "Akhir Minggu ke-5 (Hari ke-35)",
            "5 Buku Eksemplar"
        ],
        [
            "3",
            ("Dokumen DED & Arsitektur Sistem Informasi", True, None),
            "Buku Dokumen Teknis Arsitektur Sistem, Skema Database, DFD/BPMN, API Spec, & Security Baseline",
            "Akhir Minggu ke-7 (Hari ke-49)",
            "5 Buku Eksemplar"
        ],
        [
            "4",
            ("Berkas Prototipe Antarmuka Interaktif", True, None),
            "Tautan Interaktif Figma (Clickable Prototype) + Berkas Mentahan .FIG + Panduan Design System",
            "Akhir Minggu ke-7 (Hari ke-49)",
            "Cloud Link & Flashdisk"
        ],
        [
            "5",
            ("Laporan Akhir & Executive Summary", True, None),
            "Buku Laporan Akhir A4 + Ringkasan Eksekutif (Executive Summary) + Flashdisk 64 GB berisi seluruh master file",
            "Akhir Minggu ke-8 (Hari ke-60)",
            "5 Buku + 1 FD 64GB"
        ]
    ]
    add_table(deliv_headers, deliv_data, col_widths=[0.4, 2.2, 2.0, 1.1, 0.8])

    # 6.5 Arsitektur AI Standard SPBE
    add_h2("6.5. Standardisasi Redaksional Arsitektur AI (Kepatuhan SPBE & Keamanan Siber)")
    add_p("Pada halaman 35 dan 39, hilangkan penyebutan merek tunggal 'AI Qwen'. Gunakan redaksional berikut:")
    add_callout(
        "REKOMENDASI REDAKSI ARSITEKTUR KECERDASAN ARTIFISIAL (AI):",
        "Sistem Informasi Jasa Konstruksi (SIJAKON) dirancang untuk mengadopsi teknologi kecerdasan artifisial (AI Assistant) guna memudahkan masyarakat, kontraktor, dan aparatur dinas dalam berkonsultasi regulasi jasa konstruksi, verifikasi standar TKK, dan panduan perizinan.\n\n"
        "Guna mematuhi Peraturan Presiden No. 95/2018 tentang SPBE serta pedoman keamanan data BSSN, arsitektur AI menggunakan pendekatan Retrieval-Augmented Generation (RAG) berbasis Self-Hosted / On-Premise Open-Weights Large Language Model yang beroperasi penuh di dalam infrastruktur server Pemerintah Kabupaten Bogor tanpa mengekspos data ke API publik pihak ketiga.",
        bg_hex="EFF6FF",
        border_color="2563EB",
        title_color="1E40AF"
    )

    # -------------------------------------------------------------------------
    # BAB 7: ACTION PLAN & CHECKLIST PERBAIKAN REVISI
    # -------------------------------------------------------------------------
    add_h1("7. ACTION PLAN & CHECKLIST REVISI FINAL")
    add_p("Untuk memastikan penawaran teknis 100% siap submisi dan terhindar dari diskualifikasi, ikuti urutan prioritas perbaikan berikut:")

    chk_headers = ["Prioritas", "Tindakan Perbaikan yang Harus Dilakukan", "Target Bagian", "Status Verifikasi"]
    chk_data = [
        [
            ("P0 (FATAL)", True, RGBColor(220, 38, 38)),
            "Memperbaiki formasi Tenaga Ahli menjadi 4 Tenaga Ahli + 1 Pendukung (Munculkan kembali Ahli No. 3 dan pisahkan peran System Analyst dengan UI/UX)",
            "Hal 5, 13, 42",
            ("[ ] Selesai Direvisi", False, None)
        ],
        [
            ("P0 (FATAL)", True, RGBColor(220, 38, 38)),
            "Mengisi Subbab 2.5.1 Struktur Organisasi Pelaksana dengan bagan organigram dan narasi hubungan kerja lengkap",
            "Hal 40",
            ("[ ] Selesai Direvisi", False, None)
        ],
        [
            ("P0 (FATAL)", True, RGBColor(220, 38, 38)),
            "Menambahkan Matriks Jadwal Penugasan Tenaga Ahli (Person-Month Schedule) mingguan selama 60 hari kalender",
            "Hal 41-42",
            ("[ ] Selesai Direvisi", False, None)
        ],
        [
            ("P0 (FATAL)", True, RGBColor(220, 38, 38)),
            "Menyelaraskan daftar deliverables menjadi 5 laporan (masukkan Laporan Antara dan Dokumen DED)",
            "Hal 5, 14",
            ("[ ] Selesai Direvisi", False, None)
        ],
        [
            ("P1 (TINGGI)", True, RGBColor(202, 138, 4)),
            "Menambahkan Cover Depan, Surat Penawaran Teknis, Daftar Isi, Daftar Tabel, Daftar Gambar, dan BAB I",
            "Halaman Awal",
            ("[ ] Selesai Direvisi", False, None)
        ],
        [
            ("P1 (TINGGI)", True, RGBColor(202, 138, 4)),
            "Memperbaiki typo pada heading utama: 'TUJAN' -> 'TUJUAN', 'BEKALANG' -> 'BELAKANG', 'DELIVERABES' -> 'DELIVERABLES'",
            "Hal 1, 8, 13",
            ("[ ] Selesai Direvisi", False, None)
        ],
        [
            ("P1 (TINGGI)", True, RGBColor(202, 138, 4)),
            "Menghapus placeholder 'Tabel ?.' pada hal 34 dan memperbaiki isi Subbab 2.1.11 (hal 6) tentang Pelaporan",
            "Hal 6, 34",
            ("[ ] Selesai Direvisi", False, None)
        ],
        [
            ("P2 (SEDANG)", True, RGBColor(37, 99, 235)),
            "Merestrukturisasi penomoran gambar agar berurutan sesuai Bab 2 (Gambar 2.1 s.d. 2.7)",
            "Hal 7 - 38",
            ("[ ] Selesai Direvisi", False, None)
        ],
        [
            ("P2 (SEDANG)", True, RGBColor(37, 99, 235)),
            "Mengganti penyebutan merek vendor AI komersial menjadi arsitektur On-Premise LLM / SPBE Compliant",
            "Hal 35, 39",
            ("[ ] Selesai Direvisi", False, None)
        ]
    ]
    add_table(chk_headers, chk_data, col_widths=[1.1, 3.2, 1.0, 1.2])

    add_p("Catatan Penutup: Dengan mengeksekusi seluruh checklist prioritas P0 dan P1 di atas, Dokumen Usulan Teknis ini akan bertransformasi dari dokumen yang berisiko gugur menjadi salah satu dokumen penawaran teknis paling unggul, komprehensif, dan memiliki probabilitas kemenangan tender yang sangat tinggi.", italic=True)

    # Save Document
    doc.save(output_path)
    print(f"Document successfully created at: {output_path}")

if __name__ == "__main__":
    output_docx = r"u:\Project\ciptabintar\CATATAN_EVALUASI_DAN_TEMUAN_DOKUMEN_USULAN_TEKNIS.docx"
    create_audit_docx(output_docx)

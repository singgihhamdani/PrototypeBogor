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


def create_metodologi_docx(output_path):
    doc = Document()

    # Set Margins
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

        # Header
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("METODOLOGI PERENCANAAN SISTEM — SIJAKON KABUPATEN BOGOR TA 2026")
        hrun.font.name = "Arial"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(100, 116, 139)

        # Footer
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.LEFT
        frun = fp.add_run("Dinas Pekerjaan Umum (DPU) Kabupaten Bogor")
        frun.font.name = "Arial"
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(100, 116, 139)

    # Styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(30, 41, 59)

    # ========================================
    # Helper Functions
    # ========================================
    def add_title(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(text)
        r.font.name = "Arial"
        r.font.size = Pt(16)
        r.font.bold = True
        r.font.color.rgb = RGBColor(15, 81, 50)
        return p

    def add_subtitle(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(4)
        r = p.add_run(text)
        r.font.name = "Arial"
        r.font.size = Pt(12)
        r.font.bold = True
        r.font.color.rgb = RGBColor(51, 65, 85)
        return p

    def add_meta(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(11)
        r.font.bold = True
        r.font.color.rgb = RGBColor(71, 85, 105)
        return p

    def add_divider():
        div = doc.add_paragraph()
        div.alignment = WD_ALIGN_PARAGRAPH.CENTER
        div.paragraph_format.space_after = Pt(12)
        r_div = div.add_run("—" * 60)
        r_div.font.color.rgb = RGBColor(203, 213, 225)

    def add_heading_1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = "Arial"
        r.font.size = Pt(13)
        r.font.bold = True
        r.font.color.rgb = RGBColor(15, 81, 50)
        return p

    def add_heading_2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = "Arial"
        r.font.size = Pt(11.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(30, 41, 59)
        return p

    def add_heading_3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = "Arial"
        r.font.size = Pt(11)
        r.font.bold = True
        r.font.color.rgb = RGBColor(51, 65, 85)
        return p

    def add_p(text, bold_prefix=None, italic=False):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(6)
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
        r.font.color.rgb = RGBColor(30, 41, 59)
        return p

    def add_bullet(text, level=0):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(10.5)
        r.font.color.rgb = RGBColor(30, 41, 59)
        return p

    def add_num(text):
        p = doc.add_paragraph(style='List Number')
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(10.5)
        r.font.color.rgb = RGBColor(30, 41, 59)
        return p

    def add_callout(title, text, bg_hex="F0FDF4", border_color="0F5132"):
        """Create a bordered callout box for notes and highlights."""
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
            rt.font.size = Pt(9.5)
            rt.font.bold = True
            rt.font.color.rgb = RGBColor(15, 81, 50)
        rc = p.add_run(text)
        rc.font.name = "Calibri"
        rc.font.size = Pt(9.5)
        rc.font.italic = True
        rc.font.color.rgb = RGBColor(51, 65, 85)
        doc.add_paragraph()

    def add_table(headers, rows, col_widths=None, header_bg="0F5132"):
        """Create a formatted table with header row."""
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
            for col_idx, cell_text in enumerate(row_data):
                cell = table.rows[row_idx + 1].cells[col_idx]
                cell.text = ""
                p = cell.paragraphs[0]
                r = p.add_run(str(cell_text))
                r.font.name = "Calibri"
                r.font.size = Pt(10)
                r.font.color.rgb = RGBColor(30, 41, 59)
                set_cell_margins(cell)
                cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
                if row_idx % 2 == 1:
                    set_cell_background(cell, "F8FAFC")

        if col_widths:
            for i, width in enumerate(col_widths):
                for row in table.rows:
                    row.cells[i].width = Inches(width)

        doc.add_paragraph()
        return table

    # ========================================
    # COVER
    # ========================================
    add_title("METODOLOGI PERENCANAAN SISTEM")
    add_subtitle("PENYUSUNAN RANCANGAN DAN DED SISTEM INFORMASI")
    add_subtitle("JASA KONSTRUKSI (SIJAKON) KABUPATEN BOGOR")
    add_meta("BAGIAN DARI LAPORAN PENDAHULUAN (INCEPTION REPORT)")
    add_meta("TAHUN ANGGARAN 2026")
    add_divider()
    add_meta("Versi 1.0.0 | September 2026")

    # ========================================
    # 1. PENDAHULUAN
    # ========================================
    add_heading_1("1. PENDAHULUAN")

    add_heading_2("1.1 Latar Belakang Metodologi")
    add_p("Dokumen ini merupakan bagian dari Laporan Pendahuluan (Inception Report) yang disusun sebagai salah satu deliverable Jasa Konsultansi Perencanaan: Penyusunan Rancangan dan DED Sistem Informasi Jasa Konstruksi (SIJAKON) Kabupaten Bogor Tahun Anggaran 2026.")
    add_p("Metodologi perencanaan ini dirancang untuk menjamin bahwa seluruh keluaran pekerjaan — mulai dari analisis kebutuhan hingga prototipe antarmuka — disusun secara sistematis, terukur, dan selaras dengan kerangka regulasi yang berlaku, meliputi:")
    add_bullet("UU No. 2/2017 tentang Jasa Konstruksi jo. UU No. 6/2023 tentang Cipta Kerja;")
    add_bullet("PP No. 22/2020 jo. PP No. 14/2021 tentang Peraturan Pelaksanaan UU Jasa Konstruksi;")
    add_bullet("Permen PUPR No. 1/2023 tentang Pedoman Pengawasan Penyelenggaraan Jasa Konstruksi oleh Pemerintah Daerah;")
    add_bullet("Perda Provinsi Jawa Barat No. 6/2024 tentang Pembinaan dan Pengawasan Jasa Konstruksi;")
    add_bullet("Permen PUPR No. 9/2020 tentang Pembentukan Lembaga Pengembangan Jasa Konstruksi.")

    add_heading_2("1.2 Tujuan Dokumen Metodologi")
    add_p("Dokumen ini bertujuan untuk:")
    add_num("Memberikan kerangka kerja (framework) yang jelas dan terstruktur bagi seluruh tim konsultan perencana dalam melaksanakan setiap tahapan pekerjaan;")
    add_num("Menetapkan pendekatan, teknik, dan alat bantu yang akan digunakan pada setiap fase perencanaan;")
    add_num("Menjamin konsistensi dan kualitas seluruh dokumen keluaran (deliverables);")
    add_num("Memberikan acuan kepada Tim Teknis DPU Kabupaten Bogor untuk mengawasi dan mengevaluasi kemajuan pekerjaan.")

    add_heading_2("1.3 Ruang Lingkup Metodologi")
    add_p("Metodologi ini mencakup seluruh tahapan perencanaan sesuai Kerangka Acuan Kerja (KAK), yang meliputi:")
    add_table(
        ["Tahap", "Nama Tahapan", "Output Utama"],
        [
            ["1", "Pengumpulan Data & Analisis Kebutuhan", "Dokumen Analisis Kebutuhan Pengguna (User Requirement Analysis)"],
            ["2", "Perancangan Arsitektur Sistem & Proses Bisnis", "Dokumen Arsitektur Sistem & BPMN Proses Bisnis"],
            ["3", "Perancangan Basis Data & Geospasial (DED Data Model)", "ERD, Kamus Data, Skema PostGIS"],
            ["4", "Perancangan Wireframe & Prototipe Antarmuka Interaktif", "Wireframe (Figma) & Coded Clickable Prototype (HTML/CSS/JS)"],
        ],
        col_widths=[0.6, 2.8, 3.1]
    )
    add_p("Lingkup pekerjaan ini murni berfokus pada tahapan perencanaan, perancangan, dan penyusunan cetak biru sistem (blueprint). Tidak mencakup implementasi live coding di server produksi.", bold_prefix="CATATAN PENTING: ", italic=True)

    # ========================================
    # 2. KERANGKA PENDEKATAN METODOLOGI
    # ========================================
    add_heading_1("2. KERANGKA PENDEKATAN METODOLOGI")

    add_heading_2("2.1 Pendekatan Umum")
    add_p("Perencanaan SIJAKON Kabupaten Bogor mengadopsi pendekatan Design Thinking yang dimodifikasi dan dikombinasikan dengan Structured Systems Analysis and Design Method (SSADM) untuk konteks proyek pemerintah. Kombinasi ini dipilih karena:")
    add_bullet("Design Thinking menekankan empati terhadap pengguna akhir (stakeholder DPU, Operator BUJK, Tim Pengawas) sehingga menghasilkan rancangan yang user-centric;")
    add_bullet("SSADM memberikan struktur formal dan dokumentasi yang ketat, sesuai dengan standar dokumentasi proyek pemerintah.")

    add_p("Tahapan Design Thinking yang diadopsi:")
    add_num("Empathize — Memahami kebutuhan dan kendala pengguna melalui wawancara dan observasi langsung.")
    add_num("Define — Mendefinisikan permasalahan berdasarkan data empiris dan analisis gap (AS-IS vs TO-BE).")
    add_num("Ideate — Merancang solusi arsitektur, proses bisnis, dan model data yang optimal.")
    add_num("Prototype — Membuat prototipe antarmuka interaktif untuk simulasi alur kerja.")
    add_num("Test — Menguji keterpakaian prototipe bersama pengguna sesungguhnya.")

    add_heading_2("2.2 Prinsip-Prinsip Metodologi")
    add_p("Seluruh kegiatan perencanaan dilandasi oleh prinsip-prinsip berikut:")
    add_table(
        ["No", "Prinsip", "Penjelasan"],
        [
            ["1", "Keselarasan Regulasi (Regulatory Alignment)", "Setiap rancangan sistem harus selaras dengan hierarki regulasi jasa konstruksi (UU, PP, Permen, Perda)"],
            ["2", "Berpusat pada Pengguna (User-Centric Design)", "Rancangan didasarkan pada kebutuhan nyata pengguna melalui wawancara langsung dan FGD"],
            ["3", "Berbasis Data (Data-Driven)", "Keputusan perancangan didasarkan pada data inventarisasi eksisting dan bukti empiris"],
            ["4", "Iteratif & Bertahap (Iterative & Incremental)", "Setiap tahap menghasilkan keluaran yang dapat direview dan diperbaiki sebelum lanjut ke tahap berikutnya"],
            ["5", "Interoperabilitas (Interoperability)", "Rancangan mempertimbangkan kemampuan integrasi dengan SIPJAKI nasional dan sistem pemda lainnya"],
            ["6", "Kesadaran Spasial (Spatial Awareness)", "Dimensi geospasial menjadi komponen integral dalam setiap aspek perancangan (40 Kecamatan Kab. Bogor)"],
            ["7", "Dokumentasi Menyeluruh (Comprehensive Documentation)", "Setiap keputusan perancangan terdokumentasi dengan baik beserta rasionalnya"],
        ],
        col_widths=[0.5, 2.2, 3.8]
    )

    # ========================================
    # 3. TAHAPAN METODOLOGI PERENCANAAN
    # ========================================
    add_heading_1("3. TAHAPAN METODOLOGI PERENCANAAN")

    # --- TAHAP 1 ---
    add_heading_2("3.1 TAHAP 1 — Pengumpulan Data & Analisis Kebutuhan")
    add_p("Minggu ke-1 s.d. Minggu ke-2 (Hari 1–14)", bold_prefix="Periode: ")
    add_p("System & Business Analyst + Team Leader", bold_prefix="Penanggung Jawab Utama: ")

    add_heading_3("3.1.1 Kick-Off Meeting & Penyusunan Metodologi")
    add_p("Menyamakan persepsi antara Tim Konsultan dan Tim Teknis DPU mengenai lingkup, timeline, ekspektasi, dan mekanisme koordinasi.", bold_prefix="Tujuan: ")
    add_p("Team Leader, seluruh tenaga ahli, PPK, Tim Teknis DPU, perwakilan bidang terkait.", bold_prefix="Peserta: ")
    add_p("Berita Acara Kick-Off, Rencana Kerja Detil, Dokumen Metodologi (dokumen ini).", bold_prefix="Output: ")

    add_p("Agenda Kick-Off Meeting:")
    add_num("Paparan Lingkup Pekerjaan (Team Leader)")
    add_num("Presentasi Metodologi Perencanaan (Team Leader)")
    add_num("Konfirmasi Jadwal & Milestone (PPK + Team Leader)")
    add_num("Identifikasi Awal Stakeholder Kunci (Business Analyst)")
    add_num("Penetapan Mekanisme Koordinasi & Pelaporan")
    add_num("Diskusi & Tanya Jawab")
    add_num("Penandatanganan Berita Acara")

    add_heading_3("3.1.2 Kajian Regulasi Jasa Konstruksi")
    add_p("Memastikan seluruh rancangan sistem selaras dengan kerangka hukum yang berlaku.", bold_prefix="Tujuan: ")
    add_p("Inventarisasi produk hukum → Analisis substansi per regulasi → Pemetaan kewajiban ke fitur sistem → Penyusunan Matriks Kepatuhan Regulasi.", bold_prefix="Metode: ")

    add_p("Regulasi yang dikaji:")
    add_table(
        ["No", "Produk Hukum", "Aspek yang Dikaji", "Relevansi terhadap Sistem"],
        [
            ["1", "UU No. 2/2017 jo. UU No. 6/2023", "Kewenangan pembinaan pemda, klasifikasi BUJK, sertifikasi TKK", "Modul BUJK, SBU, TKK"],
            ["2", "PP No. 22/2020 jo. PP No. 14/2021", "Ketentuan pelaksana: registrasi, perizinan, pengawasan", "Alur kerja registrasi & verifikasi"],
            ["3", "Permen PUPR No. 1/2023", "Pedoman pengawasan jakon: instrumen audit, indikator ketertiban", "Modul Pengawasan Tertib (Checklist, Scoring)"],
            ["4", "Permen PUPR No. 9/2020", "Pembentukan LPJK, data badan usaha", "Integrasi data LPJK"],
            ["5", "Perda Jabar No. 6/2024", "Pembinaan dan pengawasan jakon tingkat provinsi", "Laporan ke provinsi"],
        ],
        col_widths=[0.4, 1.6, 2.2, 2.3]
    )
    add_p("Matriks Kepatuhan Regulasi (Regulatory Compliance Matrix) — tabel pemetaan pasal regulasi ke fitur/modul sistem.", bold_prefix="Output: ")

    add_heading_3("3.1.3 Inventarisasi Data Eksisting")
    add_p("Mengidentifikasi dan mengukur kesiapan data yang tersedia di DPU dan instansi terkait.", bold_prefix="Tujuan: ")
    add_table(
        ["Jenis Data", "Sumber", "Teknik Pengumpulan", "Format"],
        [
            ["Profil BUJK terdaftar", "Bidang Jakon DPU", "Permintaan data resmi, observasi arsip", "Excel / Database"],
            ["Data proyek konstruksi APBD", "Bidang Jakon / PPK", "Permintaan data, wawancara", "Excel / Manual"],
            ["Riwayat sertifikasi TKK", "LPJK Kab. Bogor", "Koordinasi & permintaan data", "Excel / SIPJAKI"],
            ["Data spasial kecamatan", "Bappedalitbang / BIG", "Permintaan data shapefile", "SHP / GeoJSON"],
            ["Regulasi & SOP internal", "Bagian Hukum DPU", "Studi dokumen", "PDF / Hardcopy"],
            ["Sistem informasi eksisting", "IT DPU / OPD terkait", "Observasi & demo sistem", "Akses langsung"],
        ],
        col_widths=[1.5, 1.4, 1.8, 1.4]
    )
    add_p("Instrumen pengumpulan data:")
    add_bullet("Formulir inventarisasi data terstruktur")
    add_bullet("Checklist kelengkapan data per kategori")
    add_bullet("Template audit kualitas data (Data Quality Assessment)")
    add_p("Dokumen Inventarisasi & Penilaian Kualitas Data Eksisting.", bold_prefix="Output: ")

    add_heading_3("3.1.4 Wawancara Mendalam & Focus Group Discussion (FGD I)")

    add_p("A. Wawancara Mendalam (In-Depth Interview)", bold_prefix="")
    add_p("Menggali kebutuhan, pain points, dan ekspektasi dari perspektif pengguna kunci secara individual.", bold_prefix="Tujuan: ")

    add_table(
        ["No", "Narasumber", "Topik Wawancara", "Durasi"],
        [
            ["1", "Kepala Bidang Jasa Konstruksi", "Visi digitalisasi, KPI pengawasan, hambatan tata kelola", "60 menit"],
            ["2", "Verifikator BUJK/SBU", "Alur verifikasi eksisting, kendala validasi dokumen, volume kerja", "45 menit"],
            ["3", "Tim Pengawas Lapangan (Asesor)", "Proses audit tertib konstruksi, kebutuhan mobile, format pelaporan", "45 menit"],
            ["4", "Staf Pelatihan & TKK", "Alur sertifikasi TKK, manajemen pelatihan, pencetakan sertifikat", "45 menit"],
            ["5", "Perwakilan Asosiasi BUJK", "Kendala registrasi, kebutuhan informasi, harapan terhadap sistem", "45 menit"],
            ["6", "Staf IT / Pengelola Data", "Infrastruktur IT eksisting, bandwidth, kapabilitas server", "45 menit"],
        ],
        col_widths=[0.4, 1.6, 2.8, 0.8]
    )

    add_p("Teknik wawancara:")
    add_bullet("Menggunakan panduan wawancara semi-terstruktur (semi-structured interview guide)")
    add_bullet("Setiap sesi direkam (audio) dengan persetujuan narasumber")
    add_bullet("Catatan lapangan (field notes) ditulis langsung oleh tenaga pendukung")
    add_bullet("Hasil ditranskrip dan dikoding (thematic coding) dalam waktu 2 hari kerja")

    add_p("B. Focus Group Discussion (FGD I)", bold_prefix="")
    add_p("Memvalidasi temuan awal, membangun konsensus kebutuhan lintas bagian, dan mengidentifikasi prioritas fitur.", bold_prefix="Tujuan: ")
    add_p("8–12 orang: perwakilan Bidang Jakon, Verifikator, Tim Pengawas, IT DPU, perwakilan BUJK.", bold_prefix="Peserta: ")
    add_p("System & Business Analyst.", bold_prefix="Fasilitator: ")
    add_p("3–4 jam di Ruang rapat DPU Kabupaten Bogor.", bold_prefix="Durasi & Lokasi: ")

    add_p("Teknik fasilitasi FGD:")
    add_bullet("Card Sorting: Peserta mengelompokkan fitur-fitur yang dibutuhkan ke dalam kategori modul")
    add_bullet("MoSCoW Prioritization: Setiap fitur dikelompokkan menjadi Must Have, Should Have, Could Have, Won't Have")
    add_bullet("Dot Voting: Peserta memberikan suara prioritas pada fitur-fitur kritis")
    add_bullet("Scenario Walkthrough: Simulasi alur kerja menggunakan studi kasus nyata proyek konstruksi di Kab. Bogor")
    add_p("Berita Acara FGD, Matriks Kebutuhan Fitur Tervalidasi, Dokumen Prioritas MoSCoW.", bold_prefix="Output: ")

    add_heading_3("3.1.5 Penyusunan Dokumen Analisis Kebutuhan Pengguna")
    add_p("Menyintesis seluruh temuan dari kajian regulasi, inventarisasi data, wawancara, dan FGD menjadi dokumen formal kebutuhan pengguna.", bold_prefix="Tujuan: ")
    add_p("Struktur Dokumen Analisis Kebutuhan:")
    add_num("Pendahuluan & Metodologi Analisis")
    add_num("Profil Stakeholder & Peta Pengguna (User Persona)")
    add_num("Analisis Kondisi Eksisting (AS-IS): Proses Bisnis Saat Ini, Infrastruktur IT, Kendala & Pain Points")
    add_num("Analisis Kebutuhan (TO-BE): Kebutuhan Fungsional per Modul, Non-Fungsional, Data & Integrasi, Geospasial")
    add_num("Matriks Prioritas MoSCoW")
    add_num("Matriks Kepatuhan Regulasi")
    add_num("Analisis Gap (AS-IS vs TO-BE)")
    add_num("Rekomendasi Pendekatan Solusi")

    add_p("Teknik analisis yang digunakan:")
    add_bullet("SWOT Analysis — mengidentifikasi kekuatan, kelemahan, peluang, dan ancaman")
    add_bullet("Gap Analysis (AS-IS vs TO-BE) — mengidentifikasi kesenjangan antara kondisi saat ini dan yang diinginkan")
    add_bullet("User Persona Mapping — memahami karakteristik dan kebutuhan setiap tipe pengguna")
    add_bullet("Use Case Modeling — mendokumentasikan interaksi pengguna dengan sistem")

    # --- TAHAP 2 ---
    add_heading_2("3.2 TAHAP 2 — Perancangan Arsitektur Sistem & Proses Bisnis")
    add_p("Minggu ke-3 s.d. Minggu ke-4 (Hari 15–28)", bold_prefix="Periode: ")
    add_p("Team Leader + GIS & Spatial Data Specialist", bold_prefix="Penanggung Jawab Utama: ")

    add_heading_3("3.2.1 Pemodelan Proses Bisnis (BPMN)")
    add_p("Mendokumentasikan alur proses bisnis jasa konstruksi dalam notasi standar yang dapat dipahami oleh seluruh stakeholder.", bold_prefix="Tujuan: ")
    add_p("Business Process Model and Notation (BPMN) 2.0", bold_prefix="Standar Notasi: ")

    add_p("Proses bisnis yang dimodelkan:")
    add_table(
        ["No", "Proses Bisnis", "Aktor Utama", "Kompleksitas"],
        [
            ["1", "Registrasi & Pendaftaran BUJK", "Operator BUJK, Admin", "Tinggi"],
            ["2", "Verifikasi Dokumen SBU & Legalitas", "Verifikator, Super Admin", "Tinggi"],
            ["3", "Pencatatan Pengalaman Kerja Konstruksi", "Operator BUJK", "Sedang"],
            ["4", "Input & Monitoring Paket Pekerjaan (Kurva S)", "Operator OPD/PPK", "Tinggi"],
            ["5", "Penjadwalan & Pelaksanaan Pengawasan Tertib Konstruksi", "Super Admin, Asesor", "Tinggi"],
            ["6", "Pengisian Checklist Audit (Permen PUPR 1/2023)", "Asesor/Tim Pengawas", "Tinggi"],
            ["7", "Manajemen Pelatihan & Sertifikasi TKK", "Admin Pelatihan", "Sedang"],
            ["8", "Pembuatan Laporan Eksekutif Multi-Format", "Super Admin", "Sedang"],
            ["9", "Import/Export Data Spasial (SHP)", "Operator GIS", "Sedang"],
        ],
        col_widths=[0.4, 2.5, 1.5, 1.0]
    )

    add_p("Teknik pemodelan:")
    add_bullet("Setiap proses bisnis dimodelkan dalam 3 level detail: Level 0 (Context Diagram), Level 1 (Main Process Flow dengan Swimlane), Level 2 (Detailed Sub-Process)")
    add_bullet("Menggunakan swimlane diagrams untuk menunjukkan interaksi antar-aktor")
    add_bullet("Setiap proses memiliki business rules terdokumentasi")
    add_p("Tools: Diagrams.net (draw.io), Bizagi Modeler, atau BPMN.io", bold_prefix="")

    add_heading_3("3.2.2 Perancangan Arsitektur Perangkat Lunak")
    add_p("Menyusun cetak biru arsitektur teknis yang menjadi pedoman implementasi di tahap pembangunan.", bold_prefix="Tujuan: ")
    add_p("Modular Monolith yang dipersiapkan untuk evolusi ke Microservices.", bold_prefix="Pendekatan Arsitektur: ")

    add_p("Dokumen arsitektur yang dihasilkan:")
    add_table(
        ["No", "Dokumen", "Isi"],
        [
            ["1", "Architecture Overview Document", "Gambaran umum arsitektur, layer, dan alur data"],
            ["2", "Technology Stack Justification", "Rasional pemilihan setiap teknologi yang direkomendasikan"],
            ["3", "Architecture Decision Records (ADR)", "Catatan setiap keputusan arsitektur beserta konteks dan konsekuensinya"],
            ["4", "Component Diagram", "Diagram komponen dan ketergantungan antar-modul"],
            ["5", "Deployment Architecture", "Topologi deployment (Docker, reverse proxy, backup)"],
            ["6", "Integration Architecture", "Pola integrasi dengan sistem eksternal (SIPJAKI, SIMAK)"],
        ],
        col_widths=[0.4, 2.2, 3.9]
    )

    add_p("Teknik evaluasi arsitektur:")
    add_bullet("ATAM (Architecture Tradeoff Analysis Method) — untuk mengevaluasi quality attributes (performance, security, scalability, maintainability)")
    add_bullet("ADR (Architecture Decision Record) — untuk mendokumentasikan setiap keputusan arsitektur")

    add_heading_3("3.2.3 Perancangan Matriks RBAC Granular")
    add_p("Merancang sistem otorisasi berbasis peran yang granular sesuai ketentuan KAK.", bold_prefix="Tujuan: ")
    add_p("Role-Based Access Control (RBAC) dengan permission matrix per modul dan per aksi.", bold_prefix="Pendekatan: ")

    add_p("Tingkatan peran:")
    add_bullet("Visitor / Publik — Akses read-only: Peta Publik, Regulasi, Berita, Validasi QR")
    add_bullet("Operator BUJK — CRUD: Data BUJK, SBU, Pengalaman Kerja")
    add_bullet("Operator OPD / PPK — CRUD: Paket Pekerjaan, Kurva S")
    add_bullet("Asesor / Pengawas — CRUD: Audit Checklist, Scoring")
    add_bullet("Super Admin — Full Access + Verifikasi + Export + Manajemen User/Role")
    add_p("RBAC Permission Matrix — tabel detail yang memetakan setiap peran ke modul, sub-modul, dan aksi (Create, Read, Update, Delete, Export, Verify).", bold_prefix="Output: ")

    # --- TAHAP 3 ---
    add_heading_2("3.3 TAHAP 3 — Perancangan Basis Data & Geospasial (DED Data Model)")
    add_p("Minggu ke-5 s.d. Minggu ke-6 (Hari 29–42)", bold_prefix="Periode: ")
    add_p("Team Leader + GIS & Spatial Data Specialist", bold_prefix="Penanggung Jawab Utama: ")

    add_heading_3("3.3.1 Perancangan Skema Basis Data Relasional")
    add_p("Menyusun model data relasional yang ternormalisasi, efisien, dan mendukung seluruh kebutuhan fungsional.", bold_prefix="Tujuan: ")

    add_table(
        ["Fase", "Aktivitas", "Output"],
        [
            ["Logical Design", "Identifikasi entitas, atribut, dan relasi dari analisis kebutuhan", "Conceptual ERD"],
            ["Normalization", "Normalisasi hingga 3NF (Third Normal Form) untuk menghilangkan redundansi", "Normalized ERD"],
            ["Physical Design", "Penentuan tipe data, indeks, constraint, dan optimasi query", "Physical Data Model + Data Dictionary"],
        ],
        col_widths=[1.2, 3.2, 2.1]
    )

    add_p("Entitas utama yang dirancang:")
    add_table(
        ["Domain", "Entitas", "Deskripsi"],
        [
            ["Pengguna", "users, roles, permissions, role_permissions", "Manajemen pengguna & otorisasi"],
            ["BUJK", "bujk_master, bujk_sbu, bujk_experiences, bujk_pj", "Data badan usaha jasa konstruksi"],
            ["Proyek", "bujk_projects, project_progress, progress_images", "Paket pekerjaan & kurva S"],
            ["Pengawasan", "supervision_schedules, supervision_inspections, inspection_items", "Audit Permen PUPR 1/2023"],
            ["Pelatihan", "trainings, training_participants, certificates", "Pelatihan & sertifikasi TKK"],
            ["Geospasial", "kecamatan_boundaries, project_locations, spatial_layers", "Data spasial 40 kecamatan"],
            ["CMS", "articles, regulations, announcements", "Konten publik"],
            ["Audit", "audit_logs", "Jejak audit seluruh aktivitas"],
        ],
        col_widths=[1.2, 2.8, 2.5]
    )

    add_p("Kamus Data (Data Dictionary) akan mencakup untuk setiap entitas: Nama kolom, tipe data, ukuran, nullable, default value, primary/foreign key, unique constraints, deskripsi bisnis, dan contoh data.")
    add_p("Tools: dbdiagram.io, Draw.io (ERD), Prisma Schema Language", bold_prefix="")

    add_heading_3("3.3.2 Perancangan Struktur Data Spasial (PostGIS)")
    add_p("Merancang model data geospasial yang mendukung pemetaan 40 kecamatan, lokasi proyek, dan analisis spasial.", bold_prefix="Tujuan: ")
    add_p("Standar yang digunakan:")
    add_bullet("Sistem Koordinat: EPSG:4326 (WGS 84) sebagai standar penyimpanan")
    add_bullet("Tipe Geometry: POINT (lokasi proyek), POLYGON (batas kecamatan, area proyek), MULTIPOLYGON (batas wilayah)")
    add_bullet("Engine: PostGIS 3.4 extension di atas PostgreSQL 16")

    add_table(
        ["No", "Komponen Spasial", "Tipe Geometry", "Sumber Data"],
        [
            ["1", "Batas administratif 40 kecamatan", "MULTIPOLYGON", "BIG / Bappedalitbang"],
            ["2", "Titik lokasi proyek konstruksi", "POINT", "Input via map picker"],
            ["3", "Area/poligon proyek", "POLYGON", "Input via polygon draw / SHP import"],
            ["4", "Lokasi kantor BUJK", "POINT", "Geocoding alamat"],
            ["5", "Sebaran TKK tersertifikasi", "POINT", "Data pelatihan"],
        ],
        col_widths=[0.4, 2.2, 1.5, 2.0]
    )
    add_p("Spatial Data Model Document, PostGIS Schema Definition, Spatial Query Patterns Catalog.", bold_prefix="Output: ")

    add_heading_3("3.3.3 Perancangan Modul Interoperabilitas SHP & GeoJSON")
    add_p("Merancang mekanisme import dan export data spasial dalam format standar GIS.", bold_prefix="Tujuan: ")
    add_table(
        ["Format", "Operasi", "Engine yang Direkomendasikan"],
        [
            ["Shapefile (.SHP zipped)", "Import & Export", "shpjs (parser), @turf/turf (analisis)"],
            ["GeoJSON", "Import & Export", "Native JSON handling"],
            ["KML", "Export (opsional)", "Konversi dari GeoJSON"],
        ],
        col_widths=[2.0, 1.5, 3.0]
    )

    add_heading_3("3.3.4 Perancangan Mekanisme Audit Trail")
    add_p("Merancang sistem pencatatan seluruh aktivitas pengguna yang mengubah data (data-mutating actions).", bold_prefix="Tujuan: ")
    add_table(
        ["Kolom", "Tipe", "Deskripsi"],
        [
            ["id", "UUID", "Identifier unik log"],
            ["user_id", "UUID (FK)", "Pengguna yang melakukan aksi"],
            ["action", "ENUM", "CREATE, UPDATE, DELETE, LOGIN, EXPORT, VERIFY"],
            ["entity_type", "VARCHAR", "Nama entitas/tabel yang terdampak"],
            ["entity_id", "UUID", "ID record yang terdampak"],
            ["old_values", "JSONB", "Nilai sebelum perubahan (nullable)"],
            ["new_values", "JSONB", "Nilai setelah perubahan (nullable)"],
            ["ip_address", "INET", "Alamat IP pengguna"],
            ["user_agent", "TEXT", "Browser/device pengguna"],
            ["created_at", "TIMESTAMPTZ", "Waktu aksi dilakukan"],
        ],
        col_widths=[1.3, 1.3, 3.9]
    )

    # --- TAHAP 4 ---
    add_heading_2("3.4 TAHAP 4 — Perancangan Wireframe & Prototipe Antarmuka Interaktif")
    add_p("Minggu ke-7 s.d. Minggu ke-8 (Hari 43–60)", bold_prefix="Periode: ")
    add_p("UI/UX Prototyper + Team Leader", bold_prefix="Penanggung Jawab Utama: ")

    add_heading_3("3.4.1 Pembuatan Wireframe (Low-Fidelity)")
    add_p("Membuat sketsa tata letak visual seluruh halaman dan modul sistem tanpa elemen visual detail.", bold_prefix="Tujuan: ")
    add_p("Content-First Design — mengutamakan hierarki informasi dan alur navigasi sebelum estetika visual.", bold_prefix="Pendekatan: ")

    add_table(
        ["No", "Modul", "Halaman", "Fitur Khusus"],
        [
            ["1", "Publik", "Landing Page, Regulasi, Berita", "Peta sebaran publik"],
            ["2", "Auth", "Login, Register, Lupa Password", "Multi-role login"],
            ["3", "Dashboard", "Ringkasan Statistik Eksekutif", "Widget KPI, chart, mini-map"],
            ["4", "BUJK", "Daftar BUJK, Detail, Form Stepper", "Multi-Step Stepper Wizard"],
            ["5", "SBU", "Daftar SBU, Verifikasi", "Side-by-Side Document Reviewer"],
            ["6", "WebGIS", "Peta Full-Screen, Split-View", "WebGIS Split-View (Peta + Tabel)"],
            ["7", "Pengawasan", "Jadwal, Checklist Audit, Scoring", "Gauge skor real-time, upload foto"],
            ["8", "Pelatihan", "Daftar, Peserta, e-Certificate", "QR Code sertifikat"],
            ["9", "Pelaporan", "Laporan Eksekutif, Export", "Multi-format export"],
            ["10", "Pengaturan", "Manajemen User, Role, Audit Log", "Permission matrix"],
        ],
        col_widths=[0.4, 1.2, 2.2, 2.5]
    )
    add_p("Tools: Figma (wireframe mode), Balsamiq, atau Whimsical", bold_prefix="")
    add_callout(
        "CATATAN PENGGUNAAN FIGMA:",
        "Figma digunakan HANYA untuk tahap wireframe (sketsa tata letak). Untuk prototipe interaktif, digunakan pendekatan coded prototype berbasis web statis (HTML/CSS/JS) yang dapat langsung dijalankan di browser.",
        bg_hex="EFF6FF",
        border_color="2563EB"
    )

    add_heading_3("3.4.2 Pembuatan Prototipe Antarmuka Interaktif (Coded Clickable Prototype)")
    add_p("Membuat prototipe interaktif berbasis kode (coded prototype) yang dapat diklik, dinavigasi, dan dijalankan langsung di web browser untuk mensimulasikan pengalaman pengguna nyata.", bold_prefix="Tujuan: ")

    add_callout(
        "RASIONAL PENDEKATAN CODED PROTOTYPE (HTML/CSS/JS):",
        "Prototipe TIDAK menggunakan Figma Prototype, melainkan dibangun sebagai aplikasi web statis (HTML5 + CSS3 + Vanilla JavaScript) yang berjalan langsung di browser tanpa koneksi backend/database. Pendekatan ini dipilih karena:\n"
        "• Lebih realistis — interaksi, transisi responsif, dan animasi terasa seperti aplikasi nyata.\n"
        "• Aksesibilitas tinggi — stakeholder dan penguji cukup membuka file HTML di browser tanpa memerlukan akun Figma.\n"
        "• Portabel — dapat diserahkan dalam flashdisk dan langsung dijalankan tanpa instalasi server maupun dependensi rumit.\n"
        "• Fondasi implementasi — kode antarmuka prototipe dapat diadaptasi langsung pada tahap pembangunan sistem.",
        bg_hex="FEF3C7",
        border_color="D97706"
    )

    add_p("Pendekatan Pengembangan:", bold_prefix="")
    add_bullet("Dibangun menggunakan HTML5 + CSS3 + Vanilla JavaScript (atau Alpine.js)")
    add_bullet("Navigasi antar-halaman yang berfungsi melalui client-side routing atau multi-page HTML")
    add_bullet("Data simulasi menggunakan JSON statis / dummy data (tidak terhubung ke server backend atau database)")
    add_bullet("Form input dengan validasi client-side dan feedback visual (toast notification, modal, stepper wizard)")
    add_bullet("Responsive design (Desktop >= 1024px dan Mobile >= 375px)")
    add_bullet("Menerapkan identitas visual Pemerintah Kabupaten Bogor")

    add_p("Batasan Prototipe (Scope Boundary):")
    add_table(
        ["Termasuk dalam Prototipe", "TIDAK Termasuk dalam Prototipe"],
        [
            ["Navigasi antar-halaman lengkap", "Koneksi ke server backend / API"],
            ["Form input dengan validasi client-side", "Penyimpanan data ke database"],
            ["Tabel data dengan data sampel (JSON statis)", "Autentikasi & otorisasi nyata"],
            ["Visualisasi chart/grafik dengan data dummy", "Upload file ke server"],
            ["Peta interaktif (MapLibre/Leaflet) GeoJSON statis", "Proses backend (PDF generate, queue)"],
            ["Animasi transisi dan micro-interaction", "Integrasi sistem eksternal"],
            ["Simulasi alur login (redirect tanpa auth)", "Multi-user / kolaborasi real-time"],
        ],
        col_widths=[3.2, 3.3]
    )

    add_p("Alur kerja yang disimulasikan:")
    add_table(
        ["No", "Alur Kerja", "Skenario Simulasi", "Aktor"],
        [
            ["1", "Registrasi BUJK", "Pengisian form stepper 4 langkah → Submit → Toast Berhasil → Redirect daftar", "Operator BUJK"],
            ["2", "Verifikasi Dokumen", "Admin membuka side-by-side viewer → Klik Approve/Reject → Status berubah", "Super Admin"],
            ["3", "Interaksi Peta WebGIS", "Zoom → Filter layer → Klik marker → Info popup data sampel", "Operator Dinas"],
            ["4", "Pengisian Checklist Audit", "Centang item → Score gauge berubah real-time (JS) → Preview hasil", "Asesor"],
            ["5", "Export Laporan", "Pilih modul → Pilih format (PDF/Excel/SHP) → Simulasi download dummy", "Super Admin"],
        ],
        col_widths=[0.4, 1.4, 3.3, 1.4]
    )

    add_p("Struktur Berkas Prototipe (Folder prototype/):", bold_prefix="")
    add_bullet("prototype/index.html — Landing page / beranda publik")
    add_bullet("prototype/login.html — Halaman simulasi multi-role login")
    add_bullet("prototype/dashboard.html — Dashboard eksekutif (KPI, chart, mini-map)")
    add_bullet("prototype/bujk/ — list.html, detail.html, register.html (Multi-Step Stepper Wizard)")
    add_bullet("prototype/webgis/map.html — Peta interaktif split-view (Peta + Tabel)")
    add_bullet("prototype/pengawasan/ — schedule.html, checklist.html (Audit + Scoring Gauge)")
    add_bullet("prototype/pelaporan/report.html — Laporan eksekutif + simulasi export")
    add_bullet("prototype/assets/ — css/ (Design System), js/ (Interaktivitas), data/ (JSON statis), img/ (Logo, Icon)")
    add_bullet("prototype/README.html — Panduan penggunaan dan navigasi prototipe")

    add_p("Tools Pengembangan Prototipe:", bold_prefix="")
    add_bullet("Editor: Visual Studio Code")
    add_bullet("Styling: CSS3 Modern (Custom Properties, Flexbox, Grid) / Tailwind CSS")
    add_bullet("Interaktivitas: Vanilla JavaScript / Alpine.js")
    add_bullet("Peta: MapLibre GL JS / Leaflet dengan GeoJSON statis 40 kecamatan")
    add_bullet("Chart: Chart.js (via CDN)")
    add_bullet("Ikon: Lucide Icons / Heroicons")

    add_p("Deliverable Prototipe: Folder prototype/ berisi seluruh file HTML, CSS, JS, dan aset (siap dibuka di browser); File README.html panduan navigasi; serta Screenshot PNG per halaman untuk lampiran laporan cetak.")

    add_heading_3("3.4.3 Uji Keterpakaian Prototipe & FGD II")
    add_p("Memvalidasi rancangan antarmuka dan alur kerja dengan pengguna sesungguhnya sebelum finalisasi.", bold_prefix="Tujuan: ")

    add_table(
        ["Metode", "Deskripsi", "Peserta"],
        [
            ["Task-Based Usability Test", "Peserta diminta menyelesaikan task tertentu menggunakan prototipe", "5–8 pengguna representatif"],
            ["Think-Aloud Protocol", "Peserta mengungkapkan pikiran saat berinteraksi dengan prototipe", "Semua peserta uji"],
            ["System Usability Scale (SUS)", "Kuesioner standar 10 pertanyaan untuk mengukur perceived usability", "Semua peserta uji"],
            ["FGD II (Review Kolektif)", "Diskusi kelompok untuk membahas temuan dan menyepakati perbaikan", "8–12 stakeholder"],
        ],
        col_widths=[1.8, 2.8, 1.8]
    )

    add_p("Metrik evaluasi:")
    add_table(
        ["Metrik", "Target"],
        [
            ["Task Completion Rate", "≥ 85%"],
            ["Error Rate", "≤ 10%"],
            ["SUS Score", "≥ 70 (di atas rata-rata)"],
            ["User Satisfaction (Likert 1-5)", "≥ 4.0"],
        ],
        col_widths=[3.0, 3.0]
    )
    add_p("Usability Test Report, Berita Acara FGD II, Daftar Perbaikan Prototipe.", bold_prefix="Output: ")

    # ========================================
    # 4. JADWAL PELAKSANAAN & MILESTONES
    # ========================================
    add_heading_1("4. JADWAL PELAKSANAAN & MILESTONES")
    add_p("Jangka waktu pelaksanaan: 60 (enam puluh) Hari Kalender terhitung sejak diterbitkannya SPMK.")

    add_table(
        ["No", "Milestone", "Target Minggu", "Deliverable"],
        [
            ["M1", "Kick-Off Meeting", "Minggu 1", "Berita Acara Kick-Off, Rencana Kerja, Dokumen Metodologi"],
            ["M2", "FGD I — Validasi Kebutuhan", "Minggu 2", "Berita Acara FGD I, Matriks Kebutuhan Tervalidasi"],
            ["M3", "Penyerahan Laporan Pendahuluan", "Minggu 3", "Laporan Pendahuluan (Inception Report) — 5 eksemplar"],
            ["M4", "Arsitektur & BPMN Selesai", "Minggu 4", "Dokumen Arsitektur Sistem, BPMN Proses Bisnis, ADR"],
            ["M5", "DED Data Model Selesai", "Minggu 6", "ERD, Kamus Data, Skema PostGIS, Spesifikasi Audit Trail"],
            ["M6", "Prototipe Selesai", "Minggu 7", "Wireframe Figma + Coded Clickable Prototype (HTML/CSS/JS)"],
            ["M7", "FGD II — Review Prototipe", "Minggu 7-8", "Berita Acara FGD II, Usability Test Report"],
            ["M8", "Penyerahan Laporan Antara", "Minggu 7", "Laporan Antara (Interim Report) — 5 eksemplar"],
            ["M9", "Penyerahan Final", "Minggu 8", "Laporan Akhir, DED Final, Executive Summary — 5 eksemplar"],
        ],
        col_widths=[0.4, 1.6, 1.0, 3.5]
    )

    # ========================================
    # 5. ORGANISASI TIM & PEMBAGIAN TUGAS
    # ========================================
    add_heading_1("5. ORGANISASI TIM & PEMBAGIAN TUGAS")

    add_heading_2("5.1 Struktur Tim Konsultan Perencana")
    add_table(
        ["Posisi", "Kualifikasi", "Jumlah", "Tanggung Jawab Utama"],
        [
            ["Team Leader / Ahli Sistem Informasi", "S1 Informatika/SI/Ilkom, min. 4 thn pengalaman", "1 Org", "Koordinasi tim, arsitektur sistem, QA dokumen DED"],
            ["System & Business Analyst", "S1 Informatika/Teknik Industri/SI, min. 3 thn", "1 Org", "Analisis proses bisnis, regulasi, PRD, kamus data"],
            ["UI/UX Prototyper", "S1 Informatika/DKV/Multimedia, min. 3 thn", "1 Org", "Wireframe, prototipe interaktif, usability test"],
            ["GIS & Spatial Data Specialist", "S1 Geodesi/Geomatika/PWK, min. 3 thn", "1 Org", "Skema PostGIS, layer tematik, spesifikasi SHP"],
            ["Tenaga Administrasi", "SMK/SMA Sederajat, min. 1 thn", "1 Org", "Administrasi FGD, dokumentasi, penyusunan laporan"],
        ],
        col_widths=[1.6, 1.6, 0.5, 2.8]
    )

    add_heading_2("5.2 Matriks Tanggung Jawab (RACI)")
    add_p("Keterangan: R = Responsible, A = Accountable, C = Consulted, I = Informed")
    add_table(
        ["Aktivitas", "Team Leader", "Analyst", "UI/UX", "GIS", "Admin"],
        [
            ["Kick-Off Meeting", "A/R", "R", "I", "I", "C"],
            ["Kajian Regulasi", "A", "R", "I", "I", "C"],
            ["Inventarisasi Data", "A", "R", "I", "R", "C"],
            ["Wawancara & FGD", "A", "R", "C", "C", "C"],
            ["Analisis Kebutuhan", "A", "R", "C", "C", "I"],
            ["BPMN Proses Bisnis", "A/R", "R", "I", "I", "I"],
            ["Arsitektur Sistem", "A/R", "C", "I", "C", "I"],
            ["Perancangan RBAC", "A", "R", "I", "I", "I"],
            ["ERD & Kamus Data", "A/R", "R", "I", "C", "I"],
            ["Skema PostGIS", "A", "I", "I", "R", "I"],
            ["Wireframe", "A", "C", "R", "C", "I"],
            ["Prototipe Interaktif", "A", "C", "R", "C", "I"],
            ["Uji Keterpakaian", "A", "R", "R", "I", "C"],
            ["Laporan-Laporan", "A/R", "R", "R", "R", "C"],
        ],
        col_widths=[1.6, 0.9, 0.8, 0.7, 0.7, 0.7]
    )

    # ========================================
    # 6. MEKANISME KOORDINASI & PELAPORAN
    # ========================================
    add_heading_1("6. MEKANISME KOORDINASI & PELAPORAN")

    add_heading_2("6.1 Jadwal Koordinasi Rutin")
    add_table(
        ["Jenis Koordinasi", "Frekuensi", "Peserta", "Tujuan"],
        [
            ["Rapat Internal Tim", "2× per minggu (Senin & Kamis)", "Seluruh tim konsultan", "Sinkronisasi progress"],
            ["Koordinasi dengan PPK", "1× per minggu (Rabu)", "Team Leader + PPK", "Update progress, eskalasi kendala"],
            ["Presentasi Milestone", "Sesuai jadwal milestone", "Tim + Tim Teknis DPU", "Presentasi deliverable"],
            ["FGD Formal", "2× selama proyek", "Multi-stakeholder", "Validasi kebutuhan & review prototipe"],
        ],
        col_widths=[1.6, 1.5, 1.5, 1.9]
    )

    add_heading_2("6.2 Mekanisme Pelaporan")
    add_table(
        ["Jenis Laporan", "Waktu Penyerahan", "Jumlah", "Format"],
        [
            ["Laporan Pendahuluan (Inception Report)", "Minggu ke-3", "5 eksemplar + softcopy", "Hardcopy + Flashdisk"],
            ["Laporan Antara (Interim Report)", "Minggu ke-7", "5 eksemplar + softcopy", "Hardcopy + Flashdisk"],
            ["Dokumen DED & Arsitektur (Final DED)", "Minggu ke-8", "5 eksemplar + softcopy", "Hardcopy + Flashdisk"],
            ["Berkas Prototipe Interaktif", "Minggu ke-8", "Softcopy", "Folder prototype/ (HTML/CSS/JS) + Screenshot PNG"],
            ["Laporan Akhir & Executive Summary", "Minggu ke-8", "5 eksemplar + softcopy", "Hardcopy + Flashdisk"],
        ],
        col_widths=[2.2, 1.2, 1.5, 1.5]
    )

    # ========================================
    # 7. ALAT BANTU & TEKNOLOGI PENDUKUNG
    # ========================================
    add_heading_1("7. ALAT BANTU & TEKNOLOGI PENDUKUNG")

    add_heading_2("7.1 Tools per Tahapan")
    add_table(
        ["Tahap", "Kegiatan", "Tools yang Digunakan"],
        [
            ["Tahap 1", "Dokumentasi & Analisis", "Microsoft Office, Google Workspace, Notion/Obsidian"],
            ["Tahap 1", "Wawancara & FGD", "Panduan wawancara, Voice recorder, Miro/FigJam"],
            ["Tahap 2", "Pemodelan BPMN", "Bizagi Modeler, diagrams.net (draw.io), BPMN.io"],
            ["Tahap 2", "Arsitektur & Diagram", "diagrams.net, Mermaid, Excalidraw"],
            ["Tahap 3", "ERD & Data Modeling", "dbdiagram.io, DBeaver, Prisma Schema Language"],
            ["Tahap 3", "Spasial & GIS", "QGIS, PostGIS, GeoJSON.io"],
            ["Tahap 4", "Wireframe (Low-Fidelity)", "Figma (wireframe mode), Balsamiq"],
            ["Tahap 4", "Prototipe Interaktif (Coded)", "VS Code, HTML5/CSS3/JS, MapLibre GL JS, Chart.js"],
            ["Tahap 4", "Uji Keterpakaian", "SUS Questionnaire, Task Scenario Script"],
            ["Umum", "Manajemen Proyek", "Trello / Linear / GitHub Projects"],
            ["Umum", "Komunikasi", "WhatsApp Group, Email Resmi, Zoom/Meet"],
            ["Umum", "Penyimpanan Berkas", "Google Drive / OneDrive (shared folder)"],
        ],
        col_widths=[1.0, 1.5, 4.0]
    )

    add_heading_2("7.2 Standar Format Dokumen")
    add_table(
        ["Jenis Dokumen", "Format File", "Standar"],
        [
            ["Laporan Resmi", ".docx / .pdf", "Kop Surat, Penomoran BAB, Daftar Isi, Footer halaman"],
            ["Diagram BPMN", ".bpmn / .svg / .png", "BPMN 2.0 Notation"],
            ["ERD", ".prisma / .svg / .png", "Crow's Foot Notation"],
            ["Wireframe", ".fig / .png", "Figma project (wireframe mode)"],
            ["Prototipe", ".html + .css + .js", "Coded prototype, berjalan langsung di browser tanpa server"],
            ["Data Spasial", ".shp / .geojson", "EPSG:4326, OGC Standard"],
        ],
        col_widths=[1.5, 1.5, 3.5]
    )

    # ========================================
    # 8. PENGENDALIAN MUTU
    # ========================================
    add_heading_1("8. PENGENDALIAN MUTU (QUALITY ASSURANCE)")

    add_heading_2("8.1 Mekanisme Review & Validasi")
    add_p("Setiap deliverable melalui 3 tahap validasi sebelum diserahkan ke PPK:")
    add_num("Penyusunan oleh PIC (Penanggung Jawab)")
    add_num("Peer Review oleh tim internal")
    add_num("Quality Check oleh Team Leader")
    add_num("Presentasi & Validasi PPK/DPU")
    add_num("Revisi (jika ada) & Finalisasi")

    add_heading_2("8.2 Checklist Kualitas Dokumen")
    add_table(
        ["No", "Kriteria Kualitas", "Standar"],
        [
            ["1", "Kelengkapan konten sesuai KAK", "Semua lingkup pekerjaan tercakup"],
            ["2", "Konsistensi terminologi", "Istilah seragam di seluruh dokumen"],
            ["3", "Keselarasan regulasi", "Setiap rancangan merujuk dasar hukum yang relevan"],
            ["4", "Kejelasan diagram & visualisasi", "Diagram terbaca, memiliki legenda, dan konsisten"],
            ["5", "Kelayakan teknis", "Rancangan dapat diimplementasikan dalam 90 hari (fase pembangunan)"],
            ["6", "Kemudahan pemahaman", "Dapat dipahami oleh pembaca non-teknis"],
            ["7", "Format & tata letak", "Sesuai standar format dokumen resmi"],
        ],
        col_widths=[0.4, 2.5, 3.5]
    )

    add_heading_2("8.3 Kriteria Penerimaan per Deliverable")
    add_table(
        ["Deliverable", "Kriteria Penerimaan"],
        [
            ["Laporan Pendahuluan", "Metodologi jelas, rencana kerja realistis, jadwal terperinci"],
            ["Laporan Antara", "Analisis kebutuhan tervalidasi FGD, proses bisnis lengkap, PRD detail"],
            ["DED & Arsitektur", "ERD ternormalisasi, arsitektur terjustifikasi, kamus data lengkap"],
            ["Prototipe", "Semua modul terwireframe, alur utama dapat diklik di browser (coded prototype), SUS >= 70"],
            ["Laporan Akhir", "Komprehensif, executive summary ringkas, seluruh deliverable terlampir"],
        ],
        col_widths=[2.0, 4.5]
    )

    # ========================================
    # 9. MANAJEMEN RISIKO PERENCANAAN
    # ========================================
    add_heading_1("9. MANAJEMEN RISIKO PERENCANAAN")
    add_table(
        ["No", "Risiko", "Dampak", "Prob.", "Strategi Mitigasi"],
        [
            ["1", "Stakeholder kunci tidak tersedia untuk wawancara/FGD", "Tinggi", "Sedang", "Jadwalkan jauh hari, siapkan alternatif narasumber, gunakan kuesioner tertulis sebagai fallback"],
            ["2", "Data eksisting tidak tersedia atau kualitas rendah", "Tinggi", "Tinggi", "Gunakan data sampel/dummy, dokumentasikan asumsi, koordinasi awal dengan sumber data"],
            ["3", "Data spasial 40 kecamatan tidak tersedia", "Tinggi", "Sedang", "Siapkan data OpenStreetMap (OSM) sebagai alternatif, koordinasi paralel dengan BIG"],
            ["4", "Perubahan lingkup (scope creep) dari stakeholder", "Sedang", "Tinggi", "Semua perubahan melalui Change Request formal, patuhi MoSCoW yang sudah disepakati"],
            ["5", "Keterlambatan persetujuan dokumen oleh PPK", "Sedang", "Sedang", "Sediakan buffer time di jadwal, komunikasikan timeline review sejak awal"],
            ["6", "Konflik kebutuhan antar-stakeholder", "Sedang", "Sedang", "Resolusi melalui FGD dengan fasilitasi profesional, keputusan final oleh PPK"],
            ["7", "Rancangan arsitektur terlalu kompleks", "Tinggi", "Rendah", "Evaluasi via ATAM, terapkan phased delivery, prioritas fitur MoSCoW"],
        ],
        col_widths=[0.3, 1.5, 0.7, 0.6, 3.2]
    )

    # ========================================
    # 10. PENUTUP
    # ========================================
    add_heading_1("10. PENUTUP")
    add_p("Dokumen Metodologi Perencanaan ini disusun sebagai panduan komprehensif bagi seluruh tim konsultan perencana dan stakeholder DPU Kabupaten Bogor dalam melaksanakan kegiatan Penyusunan Rancangan dan DED Sistem Informasi Jasa Konstruksi (SIJAKON).")
    add_p("Metodologi ini bersifat hidup (living document) dan dapat diperbaharui sesuai kebutuhan dengan persetujuan bersama antara Tim Konsultan dan PPK DPU Kabupaten Bogor, dengan tetap menjaga keselarasan terhadap lingkup pekerjaan yang tercantum dalam Kerangka Acuan Kerja (KAK).")

    add_divider()

    # Signature block
    add_p("Disusun oleh:", bold_prefix="")
    add_p("Tim Konsultan Perencana SIJAKON Kabupaten Bogor — Tahun Anggaran 2026")

    add_table(
        ["Jabatan", "Nama", "Tanda Tangan"],
        [
            ["Team Leader / Ahli Sistem Informasi", "_________________________", "_____________"],
            ["System & Business Analyst", "_________________________", "_____________"],
            ["UI/UX Prototyper", "_________________________", "_____________"],
            ["GIS & Spatial Data Specialist", "_________________________", "_____________"],
        ],
        col_widths=[2.5, 2.0, 2.0]
    )

    add_p("")
    add_p("Pejabat Pembuat Komitmen (PPK)", bold_prefix="Mengetahui, ")
    add_p("Dinas Pekerjaan Umum dan Penataan Ruang")
    add_p("Kabupaten Bogor")
    add_p("")
    add_p("")
    add_p("Bang Fauzy Tea", bold_prefix="")
    add_p("NIP. ----------------------------")

    # Save
    doc.save(output_path)
    print(f"\n[OK] Dokumen berhasil disimpan: {output_path}")
    print(f"   Ukuran: {os.path.getsize(output_path):,} bytes")


if __name__ == "__main__":
    output = os.path.join(os.path.dirname(os.path.abspath(__file__)), "METODOLOGI_PERENCANAAN_SISTEM.docx")
    create_metodologi_docx(output)

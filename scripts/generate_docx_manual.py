import os
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

NAVY_HEX = "0F2E5C"
NAVY_RGB = RGBColor(15, 46, 92)
GOLD_RGB = RGBColor(217, 119, 6)
SLATE_RGB = RGBColor(30, 41, 59)
TEXT_RGB = RGBColor(51, 65, 85)
MUTED_RGB = RGBColor(100, 116, 139)
BORDER_GRAY = "CBD5E1"
ZEBRA_BG = "F8FAFC"
CALLOUT_BG = "EFF6FF"

def set_cell_background(cell, fill_hex):
    shading_xml = f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>'
    cell._tc.get_or_add_tcPr().append(parse_xml(shading_xml))

def set_cell_margins(cell, top=140, bottom=140, left=180, right=180):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
        node = OxmlElement(m)
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

from xml.sax.saxutils import escape

def add_hyperlink(paragraph, url, text, color=RGBColor(2, 132, 199), underline=True):
    part = paragraph.part
    r_id = part.relate_to(url, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", is_external=True)

    escaped_text = escape(text)
    hyperlink = parse_xml(f'<w:hyperlink {nsdecls("w")} xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="{r_id}"><w:r {nsdecls("w")}><w:rPr><w:color w:val="0284C7"/><w:u w:val="single"/></w:rPr><w:t>{escaped_text}</w:t></w:r></w:hyperlink>')
    paragraph._p.append(hyperlink)

def create_styled_document():
    doc = Document()

    # 1. Page Setup (A4, Left: 3cm, Others: 2.5cm)
    for section in doc.sections:
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
        section.left_margin = Inches(1.18)    # 3.0 cm
        section.right_margin = Inches(0.98)   # 2.5 cm
        section.top_margin = Inches(0.98)     # 2.5 cm
        section.bottom_margin = Inches(0.98)  # 2.5 cm

        # Header
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("SIJAKON KAB. BOGOR TA 2026 — PANDUAN TEKNIS SIMULASI PURWARUPA")
        hrun.font.name = "Arial"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = MUTED_RGB

        # Footer
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Dokumen Perancangan Sistem • Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Bogor")
        frun.font.name = "Calibri"
        frun.font.size = Pt(9)
        frun.font.color.rgb = MUTED_RGB

    return doc

def build_word_manual():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(script_dir)
    md_path = os.path.join(root_dir, "docs", "PANDUAN_SIMULASI_PURWARUPA_SIJAKON.md")
    docx_path = os.path.join(root_dir, "docs", "PANDUAN_SIMULASI_PURWARUPA_SIJAKON.docx")
    assets_dir = os.path.join(root_dir, "docs")

    if not os.path.exists(md_path):
        print("Error: Markdown file not found at", md_path)
        return

    with open(md_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    doc = create_styled_document()

    in_table = False
    table_rows = []
    in_callout = False
    callout_lines = []

    i = 0
    while i < len(lines):
        line = lines[i].rstrip()

        # Handle Callout Block (> [!IMPORTANT] ...)
        if line.startswith("> [!IMPORTANT]") or (in_callout and line.startswith(">")):
            in_callout = True
            content = re.sub(r"^>\s*", "", line)
            content = content.replace("[!IMPORTANT]", "").strip()
            if content:
                callout_lines.append(content)
            i += 1
            continue
        elif in_callout and not line.startswith(">"):
            # Flush callout
            in_callout = False
            callout_text = "\n".join(callout_lines)
            callout_lines = []

            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.2)
            p.paragraph_format.right_indent = Inches(0.2)
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(12)

            tbl = doc.add_table(rows=1, cols=1)
            tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
            cell = tbl.cell(0, 0)
            set_cell_background(cell, CALLOUT_BG)
            set_cell_margins(cell, top=160, bottom=160, left=220, right=220)

            # Left border thick Navy
            tcPr = cell._tc.get_or_add_tcPr()
            tcBorders = parse_xml(f'''
                <w:tcBorders {nsdecls("w")}>
                    <w:top w:val="none"/>
                    <w:left w:val="single" w:sz="36" w:space="0" w:color="{NAVY_HEX}"/>
                    <w:bottom w:val="none"/>
                    <w:right w:val="none"/>
                </w:tcBorders>
            ''')
            tcPr.append(tcBorders)

            cp = cell.paragraphs[0]
            crun_bold = cp.add_run("KLAUSUL STATUS SISTEM (PROTOTYPE DISCLAIMER):\n")
            crun_bold.font.name = "Arial"
            crun_bold.font.size = Pt(10)
            crun_bold.font.bold = True
            crun_bold.font.color.rgb = NAVY_RGB

            clean_text = callout_text.replace("**KLAUSUL STATUS SISTEM (PROTOTYPE DISCLAIMER):**", "").strip()
            # Clean markdown bold markers
            clean_text = re.sub(r"\*\*(.*?)\*\*", r"\1", clean_text)
            crun_body = cp.add_run(clean_text)
            crun_body.font.name = "Calibri"
            crun_body.font.size = Pt(10)
            crun_body.font.color.rgb = TEXT_RGB
            doc.add_paragraph().paragraph_format.space_after = Pt(4)

        # Handle Tables
        if "|" in line and not line.strip().startswith("```"):
            in_table = True
            # Check if divider line |---|
            if re.match(r"^\|?\s*[-:]+\s*\|", line):
                i += 1
                continue
            cells = [c.strip() for c in line.split("|")]
            if len(cells) > 2:
                row_cells = cells[1:-1]
                table_rows.append(row_cells)
            i += 1
            continue
        elif in_table:
            # Flush Table
            in_table = False
            if table_rows:
                num_cols = max(len(r) for r in table_rows)
                tbl = doc.add_table(rows=len(table_rows), cols=num_cols)
                tbl.alignment = WD_TABLE_ALIGNMENT.CENTER

                # Set table borders
                tblPr = tbl._tbl.tblPr
                borders_xml = f'''
                    <w:tblBorders {nsdecls("w")}>
                        <w:top w:val="single" w:sz="6" w:space="0" w:color="{BORDER_GRAY}"/>
                        <w:left w:val="none"/>
                        <w:bottom w:val="single" w:sz="8" w:space="0" w:color="{NAVY_HEX}"/>
                        <w:right w:val="none"/>
                        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="{BORDER_GRAY}"/>
                        <w:insideV w:val="none"/>
                    </w:tblBorders>
                '''
                tblPr.append(parse_xml(borders_xml))

                for r_idx, row_data in enumerate(table_rows):
                    row = tbl.rows[r_idx]
                    is_header = (r_idx == 0)

                    for c_idx, cell_value in enumerate(row_data):
                        if c_idx >= num_cols:
                            continue
                        cell = row.cells[c_idx]
                        set_cell_margins(cell, top=120, bottom=120, left=160, right=160)

                        if is_header:
                            set_cell_background(cell, NAVY_HEX)
                        elif r_idx % 2 == 1:
                            set_cell_background(cell, ZEBRA_BG)

                        p = cell.paragraphs[0]
                        p.paragraph_format.space_after = Pt(2)
                        p.paragraph_format.space_before = Pt(2)

                        # Clean markdown formatting in cell
                        raw_text = cell_value.replace("<br>", "\n")
                        raw_text = re.sub(r"\[(.*?)\]\((.*?)\)", r"\1 (\2)", raw_text)
                        
                        _append_cell_text(p, raw_text, is_header=is_header)

                doc.add_paragraph().paragraph_format.space_after = Pt(6)
            table_rows = []

        # Heading 1 (Document Title)
        if line.startswith("# ") and not line.startswith("## "):
            title_text = line[2:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(16)
            p.paragraph_format.space_after = Pt(4)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = p.add_run(title_text)
            run.font.name = "Arial"
            run.font.size = Pt(20)
            run.font.bold = True
            run.font.color.rgb = NAVY_RGB
            i += 1
            continue

        # Subtitle (## ...)
        if line.startswith("## ") and not line.startswith("## BAB"):
            subtitle_text = line[3:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(16)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = p.add_run(subtitle_text)
            run.font.name = "Calibri"
            run.font.size = Pt(12)
            run.font.bold = True
            run.font.color.rgb = GOLD_RGB
            i += 1
            continue

        # Main Chapter Heading (## BAB ...)
        if line.startswith("## BAB"):
            chapter_text = line[3:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(20)
            p.paragraph_format.space_after = Pt(8)
            p.paragraph_format.keep_with_next = True
            run = p.add_run(chapter_text)
            run.font.name = "Arial"
            run.font.size = Pt(14)
            run.font.bold = True
            run.font.color.rgb = NAVY_RGB

            # Add decorative underline for chapter
            pBdr = parse_xml(f'''
                <w:pBdr {nsdecls("w")}>
                    <w:bottom w:val="single" w:sz="12" w:space="4" w:color="{NAVY_HEX}"/>
                </w:pBdr>
            ''')
            p._p.get_or_add_pPr().append(pBdr)

            i += 1
            continue

        # Sub-heading (### ...)
        if line.startswith("### "):
            subhead_text = line[4:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.keep_with_next = True
            run = p.add_run(subhead_text)
            run.font.name = "Arial"
            run.font.size = Pt(11.5)
            run.font.bold = True
            run.font.color.rgb = SLATE_RGB
            i += 1
            continue

        # Sub-sub-heading (#### ...)
        if line.startswith("#### "):
            h4_text = line[5:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.keep_with_next = True
            run = p.add_run(h4_text)
            run.font.name = "Arial"
            run.font.size = Pt(10.5)
            run.font.bold = True
            run.font.color.rgb = GOLD_RGB
            i += 1
            continue

        # Image Embedding (![Caption](path))
        img_match = re.match(r"!\[(.*?)\]\((.*?)\)", line)
        if img_match:
            caption = img_match.group(1)
            img_rel_path = img_match.group(2)
            img_full_path = os.path.normpath(os.path.join(assets_dir, img_rel_path))

            if os.path.exists(img_full_path):
                # Add picture
                p_img = doc.add_paragraph()
                p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p_img.paragraph_format.space_before = Pt(10)
                p_img.paragraph_format.space_after = Pt(4)
                run_img = p_img.add_run()
                run_img.add_picture(img_full_path, width=Inches(5.8))
                
                # Next line might be caption (*Gambar ...*)
                if i + 1 < len(lines) and lines[i+1].strip().startswith("*Gambar"):
                    cap_text = lines[i+1].strip().replace("*", "")
                    p_cap = doc.add_paragraph()
                    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    p_cap.paragraph_format.space_before = Pt(0)
                    p_cap.paragraph_format.space_after = Pt(12)
                    run_cap = p_cap.add_run(cap_text)
                    run_cap.font.name = "Calibri"
                    run_cap.font.size = Pt(9)
                    run_cap.font.italic = True
                    run_cap.font.color.rgb = MUTED_RGB
                    i += 1
            i += 1
            continue

        # Skip standalone caption line if already consumed
        if line.strip().startswith("*Gambar"):
            i += 1
            continue

        # Code block (skip ``` lines or render monospace)
        if line.startswith("```"):
            i += 1
            code_lines = []
            while i < len(lines) and not lines[i].startswith("```"):
                code_lines.append(lines[i].rstrip())
                i += 1
            if code_lines:
                p_code = doc.add_paragraph()
                p_code.paragraph_format.left_indent = Inches(0.2)
                p_code.paragraph_format.space_before = Pt(4)
                p_code.paragraph_format.space_after = Pt(8)
                run_code = p_code.add_run("\n".join(code_lines))
                run_code.font.name = "Consolas"
                run_code.font.size = Pt(9)
                run_code.font.color.rgb = SLATE_RGB
            i += 1
            continue

        # Horizontal rule (---)
        if line.strip() == "---":
            i += 1
            continue

        # Regular Body Paragraph & Bullet points
        if line.strip():
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(4)

            # Bullet points
            is_bullet = False
            raw_content = line
            if line.strip().startswith("- ") or line.strip().startswith("* "):
                p.paragraph_format.left_indent = Inches(0.25)
                raw_content = re.sub(r"^\s*[-*]\s*", "•  ", line)
                is_bullet = True
            elif re.match(r"^\s*\d+\.\s*", line):
                p.paragraph_format.left_indent = Inches(0.25)
                is_bullet = True

            # Process inline links [text](url) and bold **text**
            link_pattern = re.compile(r"\[(.*?)\]\((.*?)\)")
            last_end = 0

            for match in link_pattern.finditer(raw_content):
                start, end = match.span()
                # Text before link
                before_text = raw_content[last_end:start]
                _append_styled_text(p, before_text)

                # Hyperlink
                link_text = match.group(1)
                link_url = match.group(2)
                add_hyperlink(p, link_url, link_text)

                last_end = end

            # Remaining text after last link
            remaining_text = raw_content[last_end:]
            _append_styled_text(p, remaining_text)

        i += 1

    try:
        doc.save(docx_path)
        print(f"SUCCESS: Document successfully saved to {docx_path}")
    except PermissionError:
        fallback_path = os.path.join(root_dir, "docs", "PANDUAN_SIMULASI_PURWARUPA_SIJAKON_TERBARU.docx")
        doc.save(fallback_path)
        print(f"LOCKED_NOTICE: File utama sedang dibuka di Microsoft Word. Versi terbaru berhasil disimpan ke: {fallback_path}")

def _append_cell_text(paragraph, text, is_header=False):
    parts = re.split(r"(\*\*.*?\*\*|\*.*?\*)", text)
    for part in parts:
        if not part:
            continue
        if part.startswith("**") and part.endswith("**") and len(part) >= 4:
            clean_text = part[2:-2].replace("*", "")
            run = paragraph.add_run(clean_text)
            run.font.bold = True
        elif part.startswith("*") and part.endswith("*") and len(part) >= 2:
            clean_text = part[1:-1].replace("*", "")
            run = paragraph.add_run(clean_text)
            run.font.italic = True
        else:
            clean_text = part.replace("*", "")
            run = paragraph.add_run(clean_text)

        run.font.name = "Calibri"
        run.font.size = Pt(9.5) if not is_header else Pt(10)
        if is_header:
            run.font.color.rgb = RGBColor(255, 255, 255)
            run.font.bold = True
        else:
            run.font.color.rgb = TEXT_RGB

def _append_styled_text(paragraph, text):
    parts = re.split(r"(\*\*.*?\*\*|\*.*?\*)", text)
    for part in parts:
        if not part:
            continue
        if part.startswith("**") and part.endswith("**") and len(part) >= 4:
            clean_text = part[2:-2].replace("*", "")
            run = paragraph.add_run(clean_text)
            run.font.bold = True
        elif part.startswith("*") and part.endswith("*") and len(part) >= 2:
            clean_text = part[1:-1].replace("*", "")
            run = paragraph.add_run(clean_text)
            run.font.italic = True
        else:
            clean_text = part.replace("*", "")
            run = paragraph.add_run(clean_text)

        run.font.name = "Calibri"
        run.font.size = Pt(10.5)
        run.font.color.rgb = TEXT_RGB

if __name__ == "__main__":
    build_word_manual()

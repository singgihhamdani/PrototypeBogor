import * as XLSX from "xlsx";

export interface ExportColumn {
  key: string;
  label: string;
  sipjakiLabel?: string;
  transform?: (val: any, row?: Record<string, any>) => string | number;
  description?: string;
  dataType?: string;
  allowedValues?: string[];
}

export interface DataDictionaryItem {
  field: string;
  label: string;
  type: string;
  description: string;
  allowedValues?: string[];
}

export interface ExportOptions {
  fileName: string;
  sheetName?: string;
  format?: "xlsx" | "csv";
  columns: ExportColumn[];
  data: Record<string, any>[];
  includeDataDictionary?: boolean;
  sipjakiMode?: boolean;
  dictionaryItems?: DataDictionaryItem[];
}

/**
 * Format angka ke representasi Rupiah berformat Indonesia (tanpa desimal kecuali ada sen)
 * Contoh: 2500000000 -> "2.500.000.000"
 */
export function formatRupiah(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === "") return "0";
  const num = typeof val === "number" ? val : Number(String(val).replace(/[^\d.-]/g, ""));
  if (isNaN(num)) return String(val);
  return num.toLocaleString("id-ID");
}

/**
 * Format tanggal standar ISO/YYYY-MM-DD ke format Indonesia DD/MM/YYYY
 */
export function formatTanggalIndo(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const clean = String(dateStr).trim();
  // If YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    const [y, m, d] = clean.split("T")[0].split("-");
    return `${d}/${m}/${y}`;
  }
  return clean;
}

/**
 * Format persentase
 */
export function formatPercent(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === "") return "0%";
  const num = typeof val === "number" ? val : Number(String(val).replace(/[^\d.-]/g, ""));
  if (isNaN(num)) return String(val);
  return `${num}%`;
}

/**
 * Unduh Blob ke browser pengguna dengan penanganan nama berkas yang aman
 * dan kompatibel dengan Google Chrome, Edge, Firefox, dan Safari.
 * Menggunakan konstruktor File (bila didukung) agar nama berkas dan ekstensi terkunci pada objek Blob.
 */
export function triggerBrowserDownload(blob: Blob, fileName: string): void {
  let fileOrBlob: Blob = blob;
  try {
    if (typeof File !== "undefined") {
      fileOrBlob = new File([blob], fileName, { type: blob.type });
    }
  } catch {
    fileOrBlob = blob;
  }

  const url = URL.createObjectURL(fileOrBlob);
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = url;
  link.download = fileName;
  link.setAttribute("download", fileName);

  document.body.appendChild(link);
  link.click();

  // Berikan jeda 1,5 detik sebelum revoke & removeChild
  // agar browser (khususnya Chromium) tidak kehilangan metadata nama berkas
  setTimeout(() => {
    try {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Abaikan jika sudah dibersihkan
    }
  }, 1500);
}

/**
 * Menyimpan workbook XLSX ke format buffer biner dan memicu unduhan di browser
 * dengan MIME type resmi Microsoft Excel OpenXML (.xlsx).
 */
export function saveWorkbookAsExcel(wb: XLSX.WorkBook, fileName: string): void {
  const finalName = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  triggerBrowserDownload(blob, finalName);
}

/**
 * Ekspor data ke file Excel (.xlsx) dengan multi-sheet & format siap SIPJAKI
 */
export function exportToSpreadsheet(options: ExportOptions): void {
  const {
    fileName,
    sheetName = "DATA UTAMA",
    columns,
    data,
    includeDataDictionary = false,
    sipjakiMode = false,
    dictionaryItems
  } = options;

  // 1. Tentukan Header
  const headers = columns.map((c) => (sipjakiMode && c.sipjakiLabel ? c.sipjakiLabel : c.label));

  // 2. Petakan baris data
  const rows = data.map((row) =>
    columns.map((col) => {
      const rawVal = row[col.key];
      if (col.transform) {
        return col.transform(rawVal, row);
      }
      if (rawVal === undefined || rawVal === null) return "";
      if (Array.isArray(rawVal)) return rawVal.join(", ");
      return rawVal;
    })
  );

  // Buat Sheet Data
  const sheetData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Set lebar kolom otomatis berdasarkan konten terpanjang
  const colWidths = headers.map((h, colIdx) => {
    let maxLen = String(h).length;
    for (let r = 0; r < rows.length; r++) {
      const cellVal = String(rows[r][colIdx] || "");
      if (cellVal.length > maxLen) {
        maxLen = cellVal.length;
      }
    }
    return { wch: Math.min(Math.max(maxLen + 3, 12), 45) };
  });
  ws["!cols"] = colWidths;

  // Inisialisasi Workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));

  // 3. Tambahkan Kamus Data / Dictionary jika diminta
  if (includeDataDictionary) {
    const dictHeaders = [
      "KODE FIELD (SIPJAKI)",
      "LABEL KOLOM",
      "TIPE DATA",
      "DESKRIPSI",
      "NILAI YANG DIIZINKAN (ENUM / CONTOH)"
    ];

    let dictRows: (string | number)[][] = [];

    if (dictionaryItems && dictionaryItems.length > 0) {
      dictRows = dictionaryItems.map((item) => [
        item.field,
        item.label,
        item.type,
        item.description,
        item.allowedValues ? item.allowedValues.join(", ") : "-"
      ]);
    } else {
      dictRows = columns.map((col) => [
        col.sipjakiLabel || col.key,
        col.label,
        col.dataType || "String / Teks",
        col.description || `Data ${col.label}`,
        col.allowedValues ? col.allowedValues.join(", ") : "-"
      ]);
    }

    const dictSheetData = [dictHeaders, ...dictRows];
    const dictWs = XLSX.utils.aoa_to_sheet(dictSheetData);

    dictWs["!cols"] = [
      { wch: 25 },
      { wch: 25 },
      { wch: 15 },
      { wch: 40 },
      { wch: 35 }
    ];

    XLSX.utils.book_append_sheet(wb, dictWs, "KAMUS DATA");
  }

  // Tulis berkas dan unduh di browser dengan MIME type resmi .xlsx
  saveWorkbookAsExcel(wb, fileName);
}

/**
 * Ekspor data ke format CSV dengan UTF-8 BOM untuk kompatibilitas Microsoft Excel
 */
export function exportToCSV(options: ExportOptions): void {
  const { fileName, columns, data, sipjakiMode = false } = options;

  const headers = columns.map((c) => (sipjakiMode && c.sipjakiLabel ? c.sipjakiLabel : c.label));

  const csvRows: string[] = [];
  // Baris Header
  csvRows.push(headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(","));

  // Baris Data
  data.forEach((row) => {
    const rowValues = columns.map((col) => {
      let val = row[col.key];
      if (col.transform) {
        val = col.transform(val, row);
      }
      if (val === undefined || val === null) val = "";
      if (Array.isArray(val)) val = val.join("; ");
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(rowValues.join(","));
  });

  // Tambahkan UTF-8 BOM (\uFEFF)
  const csvContent = "\uFEFF" + csvRows.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const finalName = fileName.endsWith(".csv") ? fileName : `${fileName}.csv`;
  triggerBrowserDownload(blob, finalName);
}

/**
 * Generate dan unduh template formulir impor Excel (.xlsx) kosong dengan instruksi & kamus data
 */
export function downloadExcelTemplate(options: {
  fileName: string;
  sheetName?: string;
  columns: ExportColumn[];
  sampleRows?: Record<string, any>[];
  dictionaryItems?: DataDictionaryItem[];
  instructions?: string[];
}): void {
  const {
    fileName,
    sheetName = "TEMPLATE DATA",
    columns,
    sampleRows = [],
    dictionaryItems,
    instructions = [
      "1. Isi data pada baris di bawah header kolom.",
      "2. Kolom yang memiliki tanda (*) adalah kolom wajib isi.",
      "3. Format tanggal wajib menggunakan YYYY-MM-DD (Contoh: 2026-04-15).",
      "4. Kolom nominal angka tidak perlu menyertakan titik ribuan atau simbol mata uang.",
      "5. Kolom dengan pilihan enum (misal Sumber Dana, Status) harus sesuai dengan opsi yang terdaftar pada sheet KAMUS DATA.",
      "6. Jangan mengubah atau menghapus susunan header baris pertama."
    ]
  } = options;

  const wb = XLSX.utils.book_new();

  // Sheet 1: Template Data
  const headers = columns.map((c) => (c.allowedValues ? `${c.label} (*)` : c.label));
  const rows = sampleRows.map((row) =>
    columns.map((col) => {
      const val = row[col.key];
      if (val === undefined || val === null) return "";
      return val;
    })
  );

  const mainWs = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  mainWs["!cols"] = columns.map((c) => ({ wch: Math.max(c.label.length + 5, 15) }));
  XLSX.utils.book_append_sheet(wb, mainWs, sheetName.substring(0, 31));

  // Sheet 2: Petunjuk Pengisian
  const instRows = [
    ["PETUNJUK PENGISIAN TEMPLATE IMPOR DATA SIJAKON / SIPJAKI"],
    [""],
    ...instructions.map((inst, idx) => [`Langkah ${idx + 1}`, inst])
  ];
  const instWs = XLSX.utils.aoa_to_sheet(instRows);
  instWs["!cols"] = [{ wch: 15 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, instWs, "PETUNJUK PENGISIAN");

  // Sheet 3: Kamus Data
  const dictHeaders = ["Nama Kolom", "Field SIPJAKI", "Tipe Data", "Deskripsi", "Pilihan Nilai Valid (Enum)"];
  let dictRows: (string | number)[][] = [];

  if (dictionaryItems && dictionaryItems.length > 0) {
    dictRows = dictionaryItems.map((item) => [
      item.label,
      item.field,
      item.type,
      item.description,
      item.allowedValues ? item.allowedValues.join(", ") : "-"
    ]);
  } else {
    dictRows = columns.map((col) => [
      col.label,
      col.sipjakiLabel || col.key,
      col.dataType || "Teks",
      col.description || `Data untuk ${col.label}`,
      col.allowedValues ? col.allowedValues.join(", ") : "-"
    ]);
  }

  const dictWs = XLSX.utils.aoa_to_sheet([dictHeaders, ...dictRows]);
  dictWs["!cols"] = [{ wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 40 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(wb, dictWs, "KAMUS DATA");

  // Simpan dan unduh template resmi dengan ekstensi .xlsx
  saveWorkbookAsExcel(wb, fileName);
}

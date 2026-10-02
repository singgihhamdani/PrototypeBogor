import { SipjakiTemplate } from "./sipjaki-templates";

export interface CellError {
  columnKey: string;
  columnLabel: string;
  value: any;
  message: string;
  severity: "error" | "warning";
}

export interface RowValidation {
  rowIndex: number; // 1-indexed for user display
  originalRow: Record<string, any>;
  sanitizedRow: Record<string, any>;
  isValid: boolean;
  hasWarning: boolean;
  errors: CellError[];
}

export interface BatchValidationSummary {
  totalRows: number;
  validCount: number;
  errorCount: number;
  warningCount: number;
  rowResults: RowValidation[];
  validRows: Record<string, any>[];
  invalidRows: RowValidation[];
}

/**
 * Validasi apakah string adalah NIB 13 digit numerik
 */
export function isValidNIB(nib: string | number | null | undefined): boolean {
  if (!nib) return false;
  const str = String(nib).trim();
  return /^\d{13}$/.test(str);
}

/**
 * Validasi format tanggal YYYY-MM-DD atau DD/MM/YYYY
 */
export function isValidDate(val: string | null | undefined): boolean {
  if (!val) return false;
  const str = String(val).trim();
  // Format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const d = new Date(str);
    return !isNaN(d.getTime());
  }
  // Format DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [day, month, year] = str.split("/").map(Number);
    const d = new Date(year, month - 1, day);
    return !isNaN(d.getTime()) && d.getDate() === day;
  }
  return false;
}

/**
 * Bersihkan nilai Rupiah / mata uang ke angka integer murni
 */
export function sanitizeCurrency(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/[^\d.-]/g, "");
  const num = Number(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Mesin validasi data impor batch berbasis template SIPJAKI
 */
export function validateImportBatch(
  rows: Record<string, any>[],
  template?: SipjakiTemplate
): BatchValidationSummary {
  const rowResults: RowValidation[] = [];
  const validRows: Record<string, any>[] = [];
  const invalidRows: RowValidation[] = [];

  rows.forEach((row, index) => {
    const rowIndex = index + 1;
    const errors: CellError[] = [];
    const sanitizedRow: Record<string, any> = { ...row };

    if (template) {
      // 1. Periksa kolom wajib isi (required) dari template.importColumns
      template.importColumns.forEach((colDef) => {
        const val = row[colDef.key];
        const isEmpty = val === undefined || val === null || String(val).trim() === "";

        if (colDef.required && isEmpty) {
          errors.push({
            columnKey: colDef.key,
            columnLabel: colDef.label,
            value: val,
            message: `Kolom wajib "${colDef.label}" tidak boleh kosong.`,
            severity: "error"
          });
        }
      });

      // 2. Validasi nilai Enum
      Object.entries(template.enumValidation).forEach(([colKey, allowedValues]) => {
        const val = row[colKey];
        if (val !== undefined && val !== null && String(val).trim() !== "") {
          const strVal = String(val).trim();
          const match = allowedValues.some(
            (opt) => opt.toLowerCase() === strVal.toLowerCase()
          );

          if (!match) {
            errors.push({
              columnKey: colKey,
              columnLabel: colKey,
              value: val,
              message: `Nilai "${val}" tidak valid. Pilihan resmi: ${allowedValues.slice(0, 3).join(", ")}${allowedValues.length > 3 ? "..." : ""}`,
              severity: "error"
            });
          } else {
            // Normalkan kapitalisasi sesuai enum resmi
            const canonical = allowedValues.find(
              (opt) => opt.toLowerCase() === strVal.toLowerCase()
            );
            if (canonical) sanitizedRow[colKey] = canonical;
          }
        }
      });

      // 3. Validasi NIB jika ada kolom NIB
      const nibKeys = ["nib", "nib_penyedia", "nibPenyedia"];
      nibKeys.forEach((key) => {
        if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
          const rawNib = String(row[key]).trim();
          if (!isValidNIB(rawNib)) {
            errors.push({
              columnKey: key,
              columnLabel: "NIB Penyedia",
              value: rawNib,
              message: `NIB "${rawNib}" harus terdiri dari 13 digit angka (saat ini ${rawNib.length} karakter).`,
              severity: "error"
            });
          }
        }
      });

      // 4. Validasi Format Tanggal
      const dateKeys = ["startDate", "endDate", "date", "tanggalAudit", "batasWaktu", "sbuExpiry", "tanggal_mulai", "tanggal_selesai"];
      dateKeys.forEach((key) => {
        if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
          const rawDate = String(row[key]).trim();
          if (!isValidDate(rawDate)) {
            errors.push({
              columnKey: key,
              columnLabel: key,
              value: rawDate,
              message: `Format tanggal "${rawDate}" tidak valid. Gunakan format YYYY-MM-DD.`,
              severity: "warning"
            });
          }
        }
      });

      // 5. Normalisasi Nilai Kontrak / Keuangan
      const currencyKeys = ["contractValue", "nilai_kontrak", "paguAnggaran", "realisasi", "anggaran"];
      currencyKeys.forEach((key) => {
        if (row[key] !== undefined && row[key] !== null) {
          const num = sanitizeCurrency(row[key]);
          sanitizedRow[key] = num;
        }
      });

      // 6. Validasi Rentang Progres Fisik & Keuangan (0 - 100%)
      const progressKeys = ["physProgress", "finProgress", "progress_fisik", "progress_keuangan"];
      progressKeys.forEach((key) => {
        if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
          const num = Number(String(row[key]).replace(/[^\d.-]/g, ""));
          if (isNaN(num) || num < 0 || num > 100) {
            errors.push({
              columnKey: key,
              columnLabel: key,
              value: row[key],
              message: `Persentase harus berada antara 0 s.d 100% (nilai: ${row[key]}).`,
              severity: "error"
            });
          } else {
            sanitizedRow[key] = num;
          }
        }
      });
    }

    const hasErrors = errors.some((e) => e.severity === "error");
    const hasWarning = errors.some((e) => e.severity === "warning");
    const isValid = !hasErrors;

    const rowVal: RowValidation = {
      rowIndex,
      originalRow: row,
      sanitizedRow,
      isValid,
      hasWarning,
      errors
    };

    rowResults.push(rowVal);

    if (isValid) {
      validRows.push(sanitizedRow);
    } else {
      invalidRows.push(rowVal);
    }
  });

  return {
    totalRows: rows.length,
    validCount: validRows.length,
    errorCount: invalidRows.length,
    warningCount: rowResults.filter((r) => r.hasWarning).length,
    rowResults,
    validRows,
    invalidRows
  };
}

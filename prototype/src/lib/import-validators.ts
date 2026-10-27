import { SipjakiTemplate } from "./sipjaki-templates";

export interface CellError {
  columnKey: string;
  columnLabel: string;
  value: any;
  message: string;
  severity: "error" | "warning";
}

export type RowDiffStatus = "NEW" | "UPDATE" | "UNCHANGED" | "DUPLICATE";

export interface RowValidation {
  rowIndex: number; // 1-indexed for user display
  originalRow: Record<string, any>;
  sanitizedRow: Record<string, any>;
  isValid: boolean;
  hasWarning: boolean;
  errors: CellError[];
  diffStatus: RowDiffStatus;
  previousProgress: number | null;
  progressDelta: number | null;
  isRegression: boolean;
}

export interface ExistingRecordInfo {
  physProgress?: number;
  name?: string;
  contractValue?: number;
  status?: string;
}

export interface BatchValidationSummary {
  totalRows: number;
  validCount: number;
  errorCount: number;
  warningCount: number;
  newCount: number;
  updateCount: number;
  unchangedCount: number;
  duplicateCount: number;
  regressionCount: number;
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
 * Cari ID unik dari baris data
 */
function extractRowIdentifier(row: Record<string, any>): string | null {
  const candidateKeys = ["id", "id_paket", "kode_paket", "kodePaket", "ID", "no_kontrak", "nomor_kontrak"];
  for (const k of candidateKeys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") {
      return String(row[k]).trim().toUpperCase();
    }
  }
  return null;
}

/**
 * Mesin validasi data impor batch berbasis template SIPJAKI dengan deteksi anti-redundansi
 */
export function validateImportBatch(
  rows: Record<string, any>[],
  template?: SipjakiTemplate,
  existingRecords?: Map<string, ExistingRecordInfo>
): BatchValidationSummary {
  const rowResults: RowValidation[] = [];
  const validRows: Record<string, any>[] = [];
  const invalidRows: RowValidation[] = [];

  // 1. Pre-scan: Pengecekan Baris Ganda (Duplicate ID) dalam berkas spreadsheet yang sama
  const idToRowIndices = new Map<string, number[]>();
  rows.forEach((row, idx) => {
    const id = extractRowIdentifier(row);
    if (id) {
      const list = idToRowIndices.get(id) || [];
      list.push(idx + 1);
      idToRowIndices.set(id, list);
    }
  });

  let newCount = 0;
  let updateCount = 0;
  let unchangedCount = 0;
  let duplicateCount = 0;
  let regressionCount = 0;

  rows.forEach((row, index) => {
    const rowIndex = index + 1;
    const errors: CellError[] = [];
    const sanitizedRow: Record<string, any> = { ...row };

    const rowId = extractRowIdentifier(row);

    // Deteksi duplikasi internal dalam spreadsheet
    let diffStatus: RowDiffStatus = "NEW";
    let isInternalDuplicate = false;

    if (rowId) {
      const occurrences = idToRowIndices.get(rowId) || [];
      if (occurrences.length > 1) {
        isInternalDuplicate = true;
        diffStatus = "DUPLICATE";
        duplicateCount++;
        const otherRows = occurrences.filter((r) => r !== rowIndex);
        errors.push({
          columnKey: "id",
          columnLabel: "ID Unik",
          value: rowId,
          message: `ID "${rowId}" duplikat di dalam berkas ini (ditemukan juga pada baris ${otherRows.join(", ")}).`,
          severity: "error"
        });
      }
    }

    if (template) {
      // 1. Periksa kolom wajib isi (required)
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
            const canonical = allowedValues.find(
              (opt) => opt.toLowerCase() === strVal.toLowerCase()
            );
            if (canonical) sanitizedRow[colKey] = canonical;
          }
        }
      });

      // 3. Validasi NIB
      const nibKeys = ["nib", "nib_penyedia", "nibPenyedia"];
      nibKeys.forEach((key) => {
        if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
          const rawNib = String(row[key]).trim();
          if (!isValidNIB(rawNib)) {
            errors.push({
              columnKey: key,
              columnLabel: "NIB Penyedia",
              value: rawNib,
              message: `NIB "${rawNib}" harus 13 digit angka numerik.`,
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
              message: `Format tanggal "${rawDate}" tidak valid. Gunakan YYYY-MM-DD.`,
              severity: "warning"
            });
          }
        }
      });

      // 5. Normalisasi Nilai Rupiah
      const currencyKeys = ["contractValue", "nilai_kontrak", "paguAnggaran", "realisasi", "anggaran"];
      currencyKeys.forEach((key) => {
        if (row[key] !== undefined && row[key] !== null) {
          const num = sanitizeCurrency(row[key]);
          sanitizedRow[key] = num;
        }
      });

      // 6. Validasi Rentang Progres Fisik & Keuangan (0 - 100%)
      const progressKeys = ["physProgress", "finProgress", "progress_fisik", "progress_keuangan", "progres_fisik", "progres_keuangan"];
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

    // 7. Smart Diff Matching dengan Database Eksisting
    let previousProgress: number | null = null;
    let progressDelta: number | null = null;
    let isRegression = false;

    if (!isInternalDuplicate && rowId && existingRecords) {
      const existing = existingRecords.get(rowId);
      if (existing) {
        const rawNewProg = sanitizedRow.physProgress ?? sanitizedRow.progres_fisik ?? sanitizedRow.progress_fisik;
        const newProg = rawNewProg !== undefined ? Number(rawNewProg) : null;
        previousProgress = existing.physProgress !== undefined ? Number(existing.physProgress) : null;

        if (newProg !== null && previousProgress !== null) {
          progressDelta = newProg - previousProgress;

          if (progressDelta === 0) {
            diffStatus = "UNCHANGED";
            unchangedCount++;
          } else if (progressDelta < 0) {
            diffStatus = "UPDATE";
            isRegression = true;
            regressionCount++;
            updateCount++;
            errors.push({
              columnKey: "progres_fisik",
              columnLabel: "Progres Fisik",
              value: newProg,
              message: `Peringatan: Progres di berkas (${newProg}%) lebih kecil dari database (${previousProgress}%). Selisih: ${progressDelta}%.`,
              severity: "warning"
            });
          } else {
            diffStatus = "UPDATE";
            updateCount++;
          }
        } else {
          diffStatus = "UPDATE";
          updateCount++;
        }
      } else {
        diffStatus = "NEW";
        newCount++;
      }
    } else if (!isInternalDuplicate) {
      diffStatus = "NEW";
      newCount++;
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
      errors,
      diffStatus,
      previousProgress,
      progressDelta,
      isRegression
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
    newCount,
    updateCount,
    unchangedCount,
    duplicateCount,
    regressionCount,
    rowResults,
    validRows,
    invalidRows
  };
}

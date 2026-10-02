"use client";
import React, { useState, useRef } from "react";
import { 
  FileSpreadsheet, UploadCloud, Download, CheckCircle2, 
  AlertCircle, X, ArrowRight, Table, Sparkles, FileText, Check,
  AlertTriangle, Filter, Info, ShieldAlert
} from "lucide-react";
import * as XLSX from "xlsx";
import ModalForm from "./modal-form";
import { SipjakiTemplate } from "@/lib/sipjaki-templates";
import { downloadExcelTemplate, triggerBrowserDownload } from "@/lib/export-utils";
import { validateImportBatch, BatchValidationSummary, RowValidation } from "@/lib/import-validators";

export interface BatchColumnDef {
  key: string;
  label: string;
  required?: boolean;
  example: string;
}

export interface BatchImportModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  templateFileName: string;
  expectedColumns: BatchColumnDef[];
  sampleRows?: Record<string, any>[];
  template?: SipjakiTemplate;
  onCommit: (parsedData: T[]) => void;
}

export default function BatchImportModal<T extends Record<string, any>>({
  isOpen,
  onClose,
  title,
  subtitle = "Unggah berkas spreadsheet (.csv / .xlsx) untuk memasukkan banyak data sekaligus",
  templateFileName,
  expectedColumns,
  sampleRows = [],
  template,
  onCommit
}: BatchImportModalProps<T>) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<T[]>([]);
  const [validationResult, setValidationResult] = useState<BatchValidationSummary | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "invalid_only">("all");
  const [dragOver, setDragOver] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<"upload" | "preview">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Unduh Template Excel / CSV
  const handleDownloadTemplate = (format: "csv" | "xlsx" = "xlsx") => {
    if (format === "xlsx" && template) {
      downloadExcelTemplate({
        fileName: template.exportFileName + "_template",
        sheetName: template.sheetName,
        columns: template.columns,
        sampleRows: template.sampleRows,
        dictionaryItems: template.dictionaryItems
      });
      return;
    }

    // CSV Template Fallback
    const headers = expectedColumns.map((c) => c.label).join(",");
    const rows = sampleRows.length > 0
      ? sampleRows.map((row) => 
          expectedColumns.map((col) => `"${String(row[col.key] || col.example || "").replace(/"/g, '""')}"`).join(",")
        ).join("\n")
      : expectedColumns.map((c) => `"${c.example}"`).join(",");

    const csvContent = "\uFEFF" + headers + "\n" + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const finalName = templateFileName.endsWith(".csv") ? templateFileName : `${templateFileName}.csv`;
    triggerBrowserDownload(blob, finalName);
  };

  const processParsedRows = (rawRows: Record<string, any>[]) => {
    if (rawRows.length === 0) {
      setParseError("Tidak ada baris data yang ditemukan dalam berkas.");
      return;
    }

    if (template) {
      const summary = validateImportBatch(rawRows, template);
      setValidationResult(summary);
      setPreviewData(rawRows as T[]);
    } else {
      setPreviewData(rawRows as T[]);
      setValidationResult(null);
    }

    setParseError(null);
    setActiveStep("preview");
  };

  // Parse CSV File Native
  const parseCSV = (text: string) => {
    try {
      const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length < 2) {
        setParseError("Berkas CSV kosong atau tidak memiliki baris data setelah header.");
        return;
      }

      // Deteksi delimiter (, atau ;)
      const firstLine = lines[0];
      const delimiter = firstLine.includes(";") ? ";" : ",";
      const headers = firstLine.split(delimiter).map((h) => h.replace(/(^"|"$)/g, "").trim());

      const result: Record<string, any>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const rawLine = lines[i];
        if (!rawLine.trim()) continue;

        const regex = new RegExp(`(?:^|${delimiter})(?:"([^"]*(?:""[^"]*)*)"|([^"${delimiter}]*))`, "g");
        const rowValues: string[] = [];
        let match;
        while ((match = regex.exec(rawLine)) !== null) {
          const val = match[1] ? match[1].replace(/""/g, '"') : match[2] || "";
          rowValues.push(val.trim());
        }

        const rowObj: any = {};
        expectedColumns.forEach((col, idx) => {
          const matchedHeaderIdx = headers.findIndex(
            (h) => h.toLowerCase() === col.label.toLowerCase() || h.toLowerCase() === col.key.toLowerCase()
          );
          const valueIndex = matchedHeaderIdx !== -1 ? matchedHeaderIdx : idx;
          rowObj[col.key] = rowValues[valueIndex] !== undefined ? rowValues[valueIndex] : col.example;
        });

        result.push(rowObj);
      }

      processParsedRows(result);
    } catch {
      setParseError("Gagal membaca berkas CSV. Pastikan format tabel sesuai dengan template.");
    }
  };

  // Parse Excel Binary via SheetJS (xlsx)
  const parseExcel = (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonAoa = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

          if (jsonAoa.length < 2) {
            setParseError("Berkas Excel kosong atau tidak memiliki baris data setelah header.");
            return;
          }

          const rawHeaders = (jsonAoa[0] || []).map((h: any) => String(h || "").trim());
          const rows: Record<string, any>[] = [];

          for (let i = 1; i < jsonAoa.length; i++) {
            const rowValues = jsonAoa[i];
            if (!rowValues || rowValues.length === 0 || rowValues.every((v) => v === undefined || v === null || String(v).trim() === "")) {
              continue;
            }

            const rowObj: any = {};
            expectedColumns.forEach((col, idx) => {
              // Cari header yang cocok berdasarkan label, key, atau sipjakiLabel
              const matchedHeaderIdx = rawHeaders.findIndex((h) => {
                const hNorm = h.toLowerCase().replace(/[^a-z0-9]/g, "");
                const labelNorm = col.label.toLowerCase().replace(/[^a-z0-9]/g, "");
                const keyNorm = col.key.toLowerCase().replace(/[^a-z0-9]/g, "");
                return hNorm === labelNorm || hNorm === keyNorm;
              });

              const valIdx = matchedHeaderIdx !== -1 ? matchedHeaderIdx : idx;
              let val = rowValues[valIdx];
              if (val === undefined || val === null) val = "";
              rowObj[col.key] = val;
            });

            rows.push(rowObj);
          }

          processParsedRows(rows);
        } catch {
          setParseError("Gagal mengurai lembar kerja Excel. Pastikan berkas tidak rusak atau terenkripsi.");
        }
      };
      reader.readAsArrayBuffer(file);
    } catch {
      setParseError("Terjadi kesalahan saat memproses berkas Excel.");
    }
  };

  // Handle File Input
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setParseError(null);

    const isCSV = file.name.endsWith(".csv");
    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    if (!isCSV && !isExcel) {
      setParseError("Hanya berkas format .csv atau .xlsx / .xls yang didukung.");
      return;
    }

    if (isCSV) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          parseCSV(content);
        }
      };
      reader.readAsText(file, "UTF-8");
    } else {
      parseExcel(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Commit valid data or all
  const handleCommitData = (onlyValid: boolean = false) => {
    if (previewData.length === 0) {
      alert("Tidak ada data yang dapat disimpan!");
      return;
    }

    if (validationResult && onlyValid) {
      if (validationResult.validRows.length === 0) {
        alert("Tidak ada baris yang valid untuk disimpan! Harap perbaiki kesalahan terlebih dahulu.");
        return;
      }
      onCommit(validationResult.validRows as T[]);
    } else if (validationResult && validationResult.errorCount > 0) {
      // Prompt user confirmation if committing with errors
      const confirmCommit = window.confirm(
        `Terdapat ${validationResult.errorCount} baris yang memiliki kesalahan validasi. Apakah Anda hanya ingin menyimpan ${validationResult.validCount} baris yang VALID?`
      );
      if (confirmCommit) {
        onCommit(validationResult.validRows as T[]);
      } else {
        return;
      }
    } else {
      onCommit(previewData);
    }

    handleReset();
    onClose();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setValidationResult(null);
    setParseError(null);
    setFilterMode("all");
    setActiveStep("upload");
  };

  // Get displayed rows according to filter
  const displayedRows = React.useMemo(() => {
    if (!validationResult || filterMode === "all") {
      return previewData.map((dataRow, idx) => ({
        index: idx,
        data: dataRow,
        validation: validationResult?.rowResults[idx]
      }));
    }
    return previewData
      .map((dataRow, idx) => ({
        index: idx,
        data: dataRow,
        validation: validationResult.rowResults[idx]
      }))
      .filter((item) => item.validation && !item.validation.isValid);
  }, [previewData, validationResult, filterMode]);

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title={title}
      subtitle={subtitle}
      icon={FileSpreadsheet}
      size="xl"
      submitLabel={undefined}
      cancelLabel={activeStep === "preview" ? "Ganti Berkas" : "Tutup"}
      hideFooter={true}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* Step Indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: activeStep === "upload" ? "#0F2E5C" : "#DCFCE7",
                color: activeStep === "upload" ? "#FFFFFF" : "#166534",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 800
              }}
            >
              1
            </span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: activeStep === "upload" ? "#0F2E5C" : "#64748B" }}>
              Upload Berkas Data
            </span>

            <ArrowRight style={{ width: "16px", height: "16px", color: "#CBD5E1" }} />

            <span
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: activeStep === "preview" ? "#0F2E5C" : "#F1F5F9",
                color: activeStep === "preview" ? "#FFFFFF" : "#64748B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 800
              }}
            >
              2
            </span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: activeStep === "preview" ? "#0F2E5C" : "#64748B" }}>
              Pratinjau & Validasi {previewData.length > 0 ? `(${previewData.length} Baris)` : ""}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={() => handleDownloadTemplate("xlsx")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid #BBF7D0",
                backgroundColor: "#DCFCE7",
                color: "#166534",
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <FileSpreadsheet style={{ width: "13px", height: "13px" }} />
              <span>Unduh Template Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownloadTemplate("csv")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 10px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#F8FAFC",
                color: "#475569",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <Download style={{ width: "13px", height: "13px" }} />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* STEP 1: UPLOAD ZONE */}
        {activeStep === "upload" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Guide Card */}
            <div style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "12px", padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#166534", fontWeight: 800, fontSize: "12px", marginBottom: "4px" }}>
                <CheckCircle2 style={{ width: "16px", height: "16px" }} />
                <span>Petunjuk Format Berkas Unggahan SIPJAKI</span>
              </div>
              <p style={{ fontSize: "11px", color: "#334155", margin: 0, lineHeight: 1.5 }}>
                Unduh template resmi terlebih dahulu agar urutan kolom dan tipe data sesuai. Sistem secara otomatis memvalidasi keabsahan <b>13 Digit NIB</b>, format tanggal <b>YYYY-MM-DD</b>, serta kesesuaian nilai enum SIPJAKI.
              </p>
            </div>

            {/* Drag & Drop Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? "#2563EB" : "#CBD5E1"}`,
                backgroundColor: dragOver ? "#EFF6FF" : "#F8FAFC",
                borderRadius: "16px",
                padding: "36px 20px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px"
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                style={{ display: "none" }}
              />

              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  backgroundColor: "#EBF2FA",
                  color: "#0F2E5C",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <UploadCloud style={{ width: "28px", height: "28px" }} />
              </div>

              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#0F2E5C", margin: "0 0 4px 0" }}>
                  Tarik & Letakkan Berkas di Sini, atau <span style={{ color: "#2563EB", textDecoration: "underline" }}>Pilih Berkas</span>
                </h4>
                <p style={{ fontSize: "11px", color: "#64748B", margin: 0 }}>
                  Mendukung format Microsoft Excel (.xlsx, .xls) atau Comma-Separated Values (.csv). Maksimal 10MB.
                </p>
              </div>
            </div>

            {parseError && (
              <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FEE2E2", borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px", color: "#991B1B", fontSize: "12px" }}>
                <AlertCircle style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                <span>{parseError}</span>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: PREVIEW & VALIDATION TABLE */}
        {activeStep === "preview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Header Status & Validation Counter Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F8FAFC", padding: "12px 16px", borderRadius: "12px", border: "1px solid #E2E8F0", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FileSpreadsheet style={{ width: "20px", height: "20px", color: "#16A34A" }} />
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C" }}>
                    {selectedFile?.name || "Berkas Terbaca"}
                  </span>
                  <span style={{ fontSize: "11px", color: "#64748B", marginLeft: "8px" }}>
                    ({(Number(selectedFile?.size || 0) / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </div>

              {/* Validation Badges */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                {validationResult ? (
                  <>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#166534", backgroundColor: "#DCFCE7", padding: "4px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle2 style={{ width: "12px", height: "12px" }} />
                      {validationResult.validCount} Baris Valid
                    </span>

                    {validationResult.warningCount > 0 && (
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#854D0E", backgroundColor: "#FEF08A", padding: "4px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <AlertTriangle style={{ width: "12px", height: "12px" }} />
                        {validationResult.warningCount} Peringatan
                      </span>
                    )}

                    {validationResult.errorCount > 0 && (
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#991B1B", backgroundColor: "#FEE2E2", padding: "4px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <AlertCircle style={{ width: "12px", height: "12px" }} />
                        {validationResult.errorCount} Error
                      </span>
                    )}

                    {/* Filter Toggle */}
                    {validationResult.errorCount > 0 && (
                      <div style={{ display: "inline-flex", borderRadius: "8px", border: "1px solid #CBD5E1", overflow: "hidden", marginLeft: "6px" }}>
                        <button
                          type="button"
                          onClick={() => setFilterMode("all")}
                          style={{
                            padding: "4px 10px",
                            fontSize: "11px",
                            fontWeight: 700,
                            border: "none",
                            backgroundColor: filterMode === "all" ? "#0F2E5C" : "#FFFFFF",
                            color: filterMode === "all" ? "#FFFFFF" : "#475569",
                            cursor: "pointer"
                          }}
                        >
                          Semua ({previewData.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilterMode("invalid_only")}
                          style={{
                            padding: "4px 10px",
                            fontSize: "11px",
                            fontWeight: 700,
                            border: "none",
                            backgroundColor: filterMode === "invalid_only" ? "#991B1B" : "#FFFFFF",
                            color: filterMode === "invalid_only" ? "#FFFFFF" : "#991B1B",
                            cursor: "pointer"
                          }}
                        >
                          Bermasalah ({validationResult.errorCount})
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#166534", backgroundColor: "#DCFCE7", padding: "4px 10px", borderRadius: "9999px" }}>
                    ✓ {previewData.length} Baris Terbaca
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#64748B",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    textDecoration: "underline",
                    marginLeft: "4px"
                  }}
                >
                  Ganti Berkas
                </button>
              </div>
            </div>

            {/* Error Notification Banner if any */}
            {validationResult && validationResult.errorCount > 0 && (
              <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: "10px", color: "#991B1B", fontSize: "12px" }}>
                <ShieldAlert style={{ width: "16px", height: "16px", flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <span style={{ fontWeight: 800 }}>Ditemukan data yang tidak memenuhi format SIPJAKI.</span>
                  <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#7F1D1D" }}>
                    Baris dengan kesalahan ditandai dengan warna merah. Anda dapat tetap menyimpan {validationResult.validCount} baris yang valid, atau memperbaiki berkas dan mengunggahnya kembali.
                  </p>
                </div>
              </div>
            )}

            {/* Preview Data Table with Cell Error Highlights */}
            <div style={{ border: "1px solid #E2E8F0", borderRadius: "12px", overflowX: "auto", maxHeight: "380px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#F1F5F9", zIndex: 1 }}>
                  <tr style={{ borderBottom: "1px solid #CBD5E1" }}>
                    <th style={{ padding: "10px 12px", textAlign: "center", color: "#475569", width: "40px" }}>#</th>
                    <th style={{ padding: "10px 12px", textAlign: "center", color: "#475569", width: "70px" }}>STATUS</th>
                    {expectedColumns.map((col) => (
                      <th key={col.key} style={{ padding: "10px 14px", textAlign: "left", color: "#0F2E5C", fontWeight: 800, whiteSpace: "nowrap" }}>
                        {col.label} {col.required && <span style={{ color: "#DC2626" }}>*</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayedRows.map(({ index, data: row, validation }) => {
                    const isRowInvalid = validation && !validation.isValid;
                    const hasRowWarning = validation && validation.hasWarning;

                    return (
                      <tr 
                        key={index} 
                        style={{ 
                          borderBottom: "1px solid #F1F5F9", 
                          backgroundColor: isRowInvalid ? "#FEF2F2" : index % 2 === 0 ? "#FFFFFF" : "#F8FAFC" 
                        }}
                      >
                        <td style={{ padding: "10px 12px", textAlign: "center", color: "#94A3B8", fontWeight: 700 }}>
                          {index + 1}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "center" }}>
                          {isRowInvalid ? (
                            <span 
                              title={validation?.errors.map((e) => e.message).join("\n")}
                              style={{ 
                                display: "inline-flex", 
                                alignItems: "center", 
                                gap: "3px", 
                                fontSize: "10px", 
                                fontWeight: 800, 
                                color: "#991B1B", 
                                backgroundColor: "#FEE2E2", 
                                padding: "2px 6px", 
                                borderRadius: "4px",
                                cursor: "help" 
                              }}
                            >
                              <AlertCircle style={{ width: "10px", height: "10px" }} />
                              Error
                            </span>
                          ) : hasRowWarning ? (
                            <span 
                              title={validation?.errors.map((e) => e.message).join("\n")}
                              style={{ 
                                display: "inline-flex", 
                                alignItems: "center", 
                                gap: "3px", 
                                fontSize: "10px", 
                                fontWeight: 800, 
                                color: "#854D0E", 
                                backgroundColor: "#FEF08A", 
                                padding: "2px 6px", 
                                borderRadius: "4px",
                                cursor: "help"
                              }}
                            >
                              <AlertTriangle style={{ width: "10px", height: "10px" }} />
                              Periksa
                            </span>
                          ) : (
                            <span style={{ fontSize: "10px", fontWeight: 800, color: "#166534", backgroundColor: "#DCFCE7", padding: "2px 6px", borderRadius: "4px" }}>
                              ✓ Lolos
                            </span>
                          )}
                        </td>
                        {expectedColumns.map((col) => {
                          const cellError = validation?.errors.find((e) => e.columnKey === col.key);
                          const isCellInvalid = cellError?.severity === "error";

                          return (
                            <td 
                              key={col.key} 
                              title={cellError ? cellError.message : undefined}
                              style={{ 
                                padding: "10px 14px", 
                                color: isCellInvalid ? "#991B1B" : "#334155",
                                backgroundColor: isCellInvalid ? "#FEE2E2" : "transparent",
                                fontWeight: isCellInvalid ? 700 : 400,
                                borderLeft: isCellInvalid ? "2px solid #EF4444" : undefined,
                                whiteSpace: "nowrap"
                              }}
                            >
                              {String(row[col.key] || "-")}
                              {isCellInvalid && (
                                <span style={{ marginLeft: "4px", fontSize: "10px", color: "#DC2626" }} title={cellError.message}>
                                  ⚠️
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ fontSize: "11px", color: "#64748B" }}>
                {validationResult ? (
                  <span>
                    Menampilkan <b>{displayedRows.length}</b> dari total <b>{previewData.length}</b> baris.
                  </span>
                ) : (
                  <span>Periksa data sebelum menekan tombol simpan.</span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "10px",
                    backgroundColor: "#F1F5F9",
                    color: "#475569",
                    border: "1px solid #CBD5E1",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Batal / Ganti Berkas
                </button>

                {validationResult && validationResult.errorCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => handleCommitData(true)}
                    disabled={validationResult.validCount === 0}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "9px 18px",
                      borderRadius: "10px",
                      backgroundColor: validationResult.validCount > 0 ? "#059669" : "#94A3B8",
                      color: "#FFFFFF",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: validationResult.validCount > 0 ? "pointer" : "not-allowed",
                      boxShadow: "0 2px 6px rgba(5, 150, 105, 0.25)"
                    }}
                  >
                    <Check style={{ width: "14px", height: "14px" }} />
                    <span>Simpan {validationResult.validCount} Baris Valid (Abaikan Error)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleCommitData(false)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "9px 20px",
                      borderRadius: "10px",
                      backgroundColor: "#0F2E5C",
                      color: "#FFFFFF",
                      border: "none",
                      borderBottom: "3px solid #FFC000",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(15, 46, 92, 0.25)"
                    }}
                  >
                    <Check style={{ width: "14px", height: "14px", color: "#FFC000" }} />
                    <span>Simpan {previewData.length} Data Sekaligus</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalForm>
  );
}

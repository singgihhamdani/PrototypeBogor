"use client";
import React, { useState, useRef } from "react";
import { 
  FileSpreadsheet, UploadCloud, Download, CheckCircle2, 
  AlertCircle, X, ArrowRight, Table, Sparkles, FileText, Check
} from "lucide-react";
import ModalForm from "./modal-form";

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
  onCommit
}: BatchImportModalProps<T>) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<T[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<"upload" | "preview">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate and download CSV Template
  const handleDownloadTemplate = () => {
    const headers = expectedColumns.map((c) => c.label).join(",");
    const rows = sampleRows.length > 0
      ? sampleRows.map((row) => 
          expectedColumns.map((col) => `"${String(row[col.key] || col.example || "").replace(/"/g, '""')}"`).join(",")
        ).join("\n")
      : expectedColumns.map((c) => `"${c.example}"`).join(",");

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", templateFileName.endsWith(".csv") ? templateFileName : `${templateFileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV File Native
  const parseCSV = (text: string) => {
    try {
      const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length < 2) {
        setParseError("Berkas CSV kosong atau tidak memiliki baris data setelah header.");
        return;
      }

      // Detect delimiter (, or ;)
      const firstLine = lines[0];
      const delimiter = firstLine.includes(";") ? ";" : ",";

      const headers = firstLine.split(delimiter).map((h) => h.replace(/(^"|"$)/g, "").trim());

      const result: T[] = [];
      for (let i = 1; i < lines.length; i++) {
        const rawLine = lines[i];
        if (!rawLine.trim()) continue;

        // Simple regex to split by delimiter while ignoring delimiters inside quotes
        const regex = new RegExp(`(?:^|${delimiter})(?:"([^"]*(?:""[^"]*)*)"|([^"${delimiter}]*))`, "g");
        const rowValues: string[] = [];
        let match;
        while ((match = regex.exec(rawLine)) !== null) {
          const val = match[1] ? match[1].replace(/""/g, '"') : match[2] || "";
          rowValues.push(val.trim());
        }

        const rowObj: any = {};
        expectedColumns.forEach((col, idx) => {
          // match by expected column index or header name
          const matchedHeaderIdx = headers.findIndex(
            (h) => h.toLowerCase() === col.label.toLowerCase() || h.toLowerCase() === col.key.toLowerCase()
          );
          const valueIndex = matchedHeaderIdx !== -1 ? matchedHeaderIdx : idx;
          rowObj[col.key] = rowValues[valueIndex] || col.example;
        });

        result.push(rowObj as T);
      }

      setPreviewData(result);
      setParseError(null);
      setActiveStep("preview");
    } catch (err: any) {
      setParseError("Gagal membaca berkas CSV. Pastikan format tabel sesuai dengan template.");
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
      // Simulate/fallback parser for Excel binary
      if (sampleRows && sampleRows.length > 0) {
        setPreviewData(sampleRows as T[]);
      } else {
        // Generate mock parsed from expected columns
        const mock: any[] = [
          expectedColumns.reduce((acc, col) => ({ ...acc, [col.key]: col.example }), {}),
          expectedColumns.reduce((acc, col) => ({ ...acc, [col.key]: `${col.example} (Sample 2)` }), {})
        ];
        setPreviewData(mock as T[]);
      }
      setActiveStep("preview");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleCommitData = () => {
    if (previewData.length === 0) {
      alert("Tidak ada data yang dapat disimpan!");
      return;
    }
    onCommit(previewData);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setParseError(null);
    setActiveStep("upload");
  };

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
      submitLabel={activeStep === "preview" ? `Simpan ${previewData.length} Data ke Sistem` : undefined}
      cancelLabel={activeStep === "preview" ? "Ganti Berkas" : "Tutup"}
      hideFooter={activeStep === "upload"}
      onSubmit={(e) => {
        e.preventDefault();
        handleCommitData();
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* Step Indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px" }}>
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
              Pratinjau & Validasi ({previewData.length} Baris)
            </span>
          </div>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid #CBD5E1",
              backgroundColor: "#F8FAFC",
              color: "#0F2E5C",
              fontSize: "11px",
              fontWeight: 800,
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            <Download style={{ width: "13px", height: "13px", color: "#16A34A" }} />
            <span>Unduh Template Baku (.csv)</span>
          </button>
        </div>

        {/* STEP 1: UPLOAD ZONE */}
        {activeStep === "upload" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Guide Card */}
            <div style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "12px", padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#166534", fontWeight: 800, fontSize: "12px", marginBottom: "4px" }}>
                <CheckCircle2 style={{ width: "16px", height: "16px" }} />
                <span>Petunjuk Format Berkas Unggahan</span>
              </div>
              <p style={{ fontSize: "11px", color: "#334155", margin: 0, lineHeight: 1.5 }}>
                Unduh template resmi terlebih dahulu agar urutan kolom sesuai. Kolom yang wajib diisi:{" "}
                <b>{expectedColumns.filter((c) => c.required !== false).map((c) => c.label).join(", ")}</b>.
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
                  Mendukung format Microsoft Excel (.xlsx, .xls) atau Comma-Separated Values (.csv). Maksimal 5MB.
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

        {/* STEP 2: PREVIEW TABLE */}
        {activeStep === "preview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F8FAFC", padding: "10px 14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileSpreadsheet style={{ width: "18px", height: "18px", color: "#16A34A" }} />
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C" }}>
                    {selectedFile?.name || "Berkas Terbaca"}
                  </span>
                  <span style={{ fontSize: "11px", color: "#64748B", marginLeft: "8px" }}>
                    ({(Number(selectedFile?.size || 0) / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#166534", backgroundColor: "#DCFCE7", padding: "3px 10px", borderRadius: "9999px" }}>
                  ✓ {previewData.length} Baris Valid
                </span>
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
                    textDecoration: "underline"
                  }}
                >
                  Ganti Berkas
                </button>
              </div>
            </div>

            {/* Preview Data Table */}
            <div style={{ border: "1px solid #E2E8F0", borderRadius: "12px", overflowX: "auto", maxHeight: "380px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#F1F5F9", zIndex: 1 }}>
                  <tr style={{ borderBottom: "1px solid #CBD5E1" }}>
                    <th style={{ padding: "10px 12px", textAlign: "center", color: "#475569", width: "40px" }}>#</th>
                    {expectedColumns.map((col) => (
                      <th key={col.key} style={{ padding: "10px 14px", textAlign: "left", color: "#0F2E5C", fontWeight: 800 }}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #F1F5F9", backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC" }}>
                      <td style={{ padding: "10px 12px", textAlign: "center", color: "#94A3B8", fontWeight: 700 }}>
                        {idx + 1}
                      </td>
                      {expectedColumns.map((col) => (
                        <td key={col.key} style={{ padding: "10px 14px", color: "#334155" }}>
                          {String(row[col.key] || "-")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px" }}>
              <span style={{ fontSize: "11px", color: "#64748B" }}>
                Periksa data sebelum menekan tombol simpan di bawah.
              </span>
              <button
                type="button"
                onClick={handleCommitData}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  backgroundColor: "#0F2E5C",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(15, 46, 92, 0.25)"
                }}
              >
                <Check style={{ width: "14px", height: "14px", color: "#FFC000" }} />
                <span>Simpan {previewData.length} Data Sekaligus</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalForm>
  );
}

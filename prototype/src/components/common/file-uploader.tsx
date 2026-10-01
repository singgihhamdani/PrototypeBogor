"use client";
import React, { useState, useRef } from "react";
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle, FileSpreadsheet } from "lucide-react";

export interface FileUploaderProps {
  label?: string;
  accept?: string;
  maxSizeMb?: number;
  required?: boolean;
  hint?: string;
  onFileSelect?: (file: File | null) => void;
  initialFileName?: string;
}

export default function FileUploader({
  label = "Upload Dokumen (PDF)",
  accept = ".pdf",
  maxSizeMb = 2,
  required = false,
  hint = "Format berkas yang didukung: PDF. Ukuran berkas maksimal 2MB.",
  onFileSelect,
  initialFileName
}: FileUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateAndSetFile = (file: File) => {
    setError(null);

    // Validate size
    const maxBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Ukuran berkas melebihi batas maksimal ${maxSizeMb}MB (${formatFileSize(file.size)}).`);
      return;
    }

    // Validate extension if accept is specified
    if (accept) {
      const allowedExts = accept.split(",").map((ext) => ext.trim().toLowerCase());
      const fileName = file.name.toLowerCase();
      const isAllowed = allowedExts.some((ext) => fileName.endsWith(ext));
      if (!isAllowed) {
        setError(`Format berkas tidak valid. Harap unggah berkas dengan format: ${accept}`);
        return;
      }
    }

    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  const isExcel = accept.includes("xlsx") || accept.includes("xls") || accept.includes("csv");
  const FileIconComponent = isExcel ? FileSpreadsheet : FileText;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569" }}>
          {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
        </label>
      )}

      {/* Hidden native input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        style={{ display: "none" }}
      />

      {/* Upload Zone or Selected Preview */}
      {!selectedFile && !initialFileName ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: dragOver ? "2px dashed #2563EB" : "2px dashed #CBD5E1",
            borderRadius: "14px",
            padding: "20px 16px",
            backgroundColor: dragOver ? "#EFF6FF" : "#F8FAFC",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: dragOver ? "#DBEAFE" : "#E2E8F0",
              color: dragOver ? "#2563EB" : "#64748B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "10px"
            }}
          >
            <UploadCloud style={{ width: "22px", height: "22px" }} />
          </div>

          <p style={{ fontSize: "12px", fontWeight: 800, color: "#1E293B", margin: 0, textAlign: "center" }}>
            Tarik & Lepaskan berkas ke sini, atau <span style={{ color: "#2563EB" }}>Pilih Berkas</span>
          </p>
          <span style={{ fontSize: "10px", color: "#94A3B8", marginTop: "4px", textAlign: "center" }}>
            {hint}
          </span>
        </div>
      ) : (
        <div
          style={{
            border: "1px solid #BBF7D0",
            borderRadius: "12px",
            padding: "12px 14px",
            backgroundColor: "#F0FDF4",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#DCFCE7",
                color: "#166534",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <FileIconComponent style={{ width: "18px", height: "18px" }} />
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#0F2E5C",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "240px"
                  }}
                >
                  {selectedFile ? selectedFile.name : initialFileName}
                </span>
                <CheckCircle2 style={{ width: "14px", height: "14px", color: "#10B981", flexShrink: 0 }} />
              </div>
              <span style={{ fontSize: "10px", color: "#64748B" }}>
                {selectedFile ? formatFileSize(selectedFile.size) : "Berkas Tersimpan"} • Siap Diunggah
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            title="Hapus berkas"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "#FEE2E2",
              color: "#991B1B",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0
            }}
          >
            <X style={{ width: "14px", height: "14px" }} />
          </button>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11px",
            fontWeight: 700,
            color: "#DC2626",
            backgroundColor: "#FEF2F2",
            padding: "6px 10px",
            borderRadius: "8px",
            border: "1px solid #FECACA"
          }}
        >
          <AlertCircle style={{ width: "14px", height: "14px", flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

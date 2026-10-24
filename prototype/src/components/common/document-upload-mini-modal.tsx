"use client";
import React, { useState, useEffect } from "react";
import { FileText, CheckCircle2, AlertCircle, UploadCloud, Info, FileCheck } from "lucide-react";
import ModalForm from "./modal-form";
import FileUploader from "./file-uploader";
import { DocumentFieldDef } from "@/lib/sipjaki-templates";

export interface DocumentUploadMiniModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  documentFields: DocumentFieldDef[];
  currentValues?: Record<string, string | null>;
  existingDocuments?: Record<string, string | null | undefined>;
  onSave: (files: Record<string, File | null>, fileNames: Record<string, string>) => void;
  isLoading?: boolean;
}

export default function DocumentUploadMiniModal({
  isOpen,
  onClose,
  title,
  subtitle = "Unggah dokumen pendukung untuk melengkapi data entri ini",
  documentFields,
  currentValues = {},
  existingDocuments,
  onSave,
  isLoading = false
}: DocumentUploadMiniModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const mergedValues: Record<string, string | null> = {
    ...currentValues,
    ...(existingDocuments as any)
  };

  // Reset or populate state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFiles({});
      const initialNames: Record<string, string> = {};
      documentFields.forEach((field) => {
        if (mergedValues[field.key]) {
          initialNames[field.key] = mergedValues[field.key] || "";
        }
      });
      setFileNames(initialNames);
      setFormError(null);
    }
  }, [isOpen, documentFields, currentValues]);

  const handleFileChange = (fieldKey: string, file: File | null) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [fieldKey]: file
    }));
    if (file) {
      setFileNames((prev) => ({
        ...prev,
        [fieldKey]: file.name
      }));
      setFormError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if required fields have either new file or existing value
    for (const field of documentFields) {
      if (field.required) {
        const hasNew = Boolean(selectedFiles[field.key]);
        const hasExisting = Boolean(fileNames[field.key] && fileNames[field.key].trim());
        if (!hasNew && !hasExisting) {
          setFormError(`Dokumen "${field.label}" wajib diunggah.`);
          return;
        }
      }
    }

    onSave(selectedFiles, fileNames);
    onClose();
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={UploadCloud}
      size="md"
      onSubmit={handleSubmit}
      submitLabel="Simpan Dokumen"
      cancelLabel="Batal"
      isLoading={isLoading}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Info Banner */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            backgroundColor: "#EFF6FF",
            border: "1px solid #BFDBFE",
            borderRadius: "10px",
            padding: "12px 14px",
            fontSize: "12px",
            color: "#1E40AF",
            lineHeight: "1.5"
          }}
        >
          <Info style={{ width: "16px", height: "16px", flexShrink: 0, marginTop: "2px", color: "#2563EB" }} />
          <div>
            <b>Mekanisme Dokumen Menyusul:</b> Setelah berkas diunggah dan disimpan, status baris akan berubah menjadi <span style={{ backgroundColor: "#DCFCE7", color: "#166534", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>✅ Lengkap</span> dan riwayat aktivitas dicatat ke audit log.
          </div>
        </div>

        {/* Error Alert */}
        {formError && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#FEE2E2",
              border: "1px solid #FECACA",
              borderRadius: "8px",
              padding: "10px 12px",
              fontSize: "12px",
              color: "#991B1B"
            }}
          >
            <AlertCircle style={{ width: "15px", height: "15px", flexShrink: 0 }} />
            <span>{formError}</span>
          </div>
        )}

        {/* Upload fields */}
        {documentFields.map((field) => {
          const existingFile = fileNames[field.key];
          return (
            <div
              key={field.key}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                borderBottom: documentFields.length > 1 ? "1px dashed #E2E8F0" : "none",
                paddingBottom: documentFields.length > 1 ? "14px" : "0"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#0F2E5C" }}>
                  {field.label} {field.required && <span style={{ color: "#DC2626" }}>*</span>}
                </span>
                {existingFile ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "11px",
                      color: "#166534",
                      backgroundColor: "#DCFCE7",
                      padding: "2px 8px",
                      borderRadius: "9999px",
                      fontWeight: 700
                    }}
                  >
                    <CheckCircle2 style={{ width: "11px", height: "11px" }} />
                    Tersimpan: {existingFile.length > 20 ? existingFile.slice(0, 17) + "..." : existingFile}
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#92400E",
                      backgroundColor: "#FEF3C7",
                      padding: "2px 8px",
                      borderRadius: "9999px",
                      fontWeight: 700
                    }}
                  >
                    Belum Ada Berkas
                  </span>
                )}
              </div>

              <FileUploader
                label={field.label}
                accept={field.accept || ".pdf"}
                maxSizeMb={field.maxSizeMb || 5}
                required={field.required}
                hint={`Format berkas didukung: ${field.accept || ".pdf"}. Maksimal ${field.maxSizeMb || 5}MB.`}
                initialFileName={existingFile}
                onFileSelect={(file) => handleFileChange(field.key, file)}
              />
            </div>
          );
        })}
      </div>
    </ModalForm>
  );
}

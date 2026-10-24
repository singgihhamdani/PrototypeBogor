"use client";
import React from "react";
import { CheckCircle2, Clock, UploadCloud, FileText, AlertCircle } from "lucide-react";

export type DocStatus = "complete" | "pending" | "not_required" | string;

export interface DocStatusBadgeProps {
  status?: DocStatus;
  fileName?: string | null;
  documentLabel?: string;
  onClick?: () => void;
  size?: "sm" | "md";
  tooltip?: string;
}

export default function DocStatusBadge({
  status = "pending",
  fileName,
  documentLabel,
  onClick,
  size = "md",
  tooltip
}: DocStatusBadgeProps) {
  const normStatus = (status || "").toLowerCase().trim();
  const isComplete = normStatus === "complete" || normStatus === "lengkap" || (normStatus !== "pending" && Boolean(fileName && fileName.trim()));
  const isPending = !isComplete && (normStatus === "pending" || normStatus === "menyusul" || !fileName);
  const isNotRequired = normStatus === "not_required" || normStatus === "none";

  if (isNotRequired) {
    return (
      <span style={{ fontSize: "11px", color: "#94A3B8" }}>
        —
      </span>
    );
  }

  const padding = size === "sm" ? "3px 8px" : "4px 10px";
  const fontSize = size === "sm" ? "11px" : "12px";
  const iconSize = size === "sm" ? "12px" : "13px";

  // Truncate filename for display
  const truncateFileName = (name: string, maxLen = 16) => {
    if (name.length <= maxLen) return name;
    const parts = name.split(".");
    const ext = parts.length > 1 ? "." + parts.pop() : "";
    const base = parts.join(".");
    const avail = maxLen - ext.length - 3;
    if (avail <= 0) return name.slice(0, maxLen) + "...";
    return base.slice(0, avail) + "..." + ext;
  };

  const displayName = fileName ? truncateFileName(fileName) : documentLabel ? documentLabel : "Dokumen";

  if (isComplete) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={tooltip || (fileName ? `Dokumen terunggah: ${fileName}. Klik untuk ganti / tinjau.` : "Dokumen lengkap. Klik untuk tinjau.")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding,
          borderRadius: "9999px",
          fontSize,
          fontWeight: 700,
          backgroundColor: "#DCFCE7",
          color: "#166534",
          border: "1px solid #BBF7D0",
          cursor: onClick ? "pointer" : "default",
          transition: "all 0.15s ease",
          outline: "none",
          whiteSpace: "nowrap"
        }}
        onMouseEnter={(e) => {
          if (onClick) {
            e.currentTarget.style.backgroundColor = "#BBF7D0";
            e.currentTarget.style.borderColor = "#86EFAC";
          }
        }}
        onMouseLeave={(e) => {
          if (onClick) {
            e.currentTarget.style.backgroundColor = "#DCFCE7";
            e.currentTarget.style.borderColor = "#BBF7D0";
          }
        }}
      >
        <CheckCircle2 style={{ width: iconSize, height: iconSize, flexShrink: 0, color: "#16A34A" }} />
        <span>{displayName}</span>
        {onClick && (
          <span style={{ fontSize: "10px", opacity: 0.7, marginLeft: "2px" }}>✏️</span>
        )}
      </button>
    );
  }

  // Pending
  return (
    <button
      type="button"
      onClick={onClick}
      title={tooltip || "Dokumen belum diunggah (dapat menyusul). Klik untuk unggah dokumen sekarang."}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding,
        borderRadius: "9999px",
        fontSize,
        fontWeight: 700,
        backgroundColor: "#FEF3C7",
        color: "#92400E",
        border: "1px dashed #F59E0B",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.15s ease",
        outline: "none",
        whiteSpace: "nowrap"
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.backgroundColor = "#FDE68A";
          e.currentTarget.style.borderColor = "#D97706";
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.backgroundColor = "#FEF3C7";
          e.currentTarget.style.borderColor = "#F59E0B";
        }
      }}
    >
      <Clock style={{ width: iconSize, height: iconSize, flexShrink: 0, color: "#D97706" }} />
      <span>Belum Upload</span>
      {onClick && (
        <span
          style={{
            fontSize: "10px",
            backgroundColor: "#F59E0B",
            color: "#FFFFFF",
            padding: "1px 5px",
            borderRadius: "4px",
            marginLeft: "2px",
            fontWeight: 800
          }}
        >
          Unggah
        </span>
      )}
    </button>
  );
}

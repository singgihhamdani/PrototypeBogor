"use client";
import React from "react";
import { CheckCircle2, AlertTriangle, FileText, Filter, ArrowRight } from "lucide-react";

export interface DocCompletionBarProps {
  total?: number;
  completed?: number;
  records?: any[];
  label?: string;
  onFilterPending?: () => void;
  onToggleFilter?: () => void;
  isFilterActive?: boolean;
  filterActive?: boolean;
}

export default function DocCompletionBar({
  total,
  completed,
  records,
  label = "Kelengkapan Dokumen Lampiran",
  onFilterPending,
  onToggleFilter,
  isFilterActive = false,
  filterActive = false
}: DocCompletionBarProps) {
  const actualTotal = total ?? (records ? records.length : 0);
  const actualCompleted = completed ?? (records
    ? records.filter((r) => {
        if (r._docStatus === "complete") return true;
        if (r._docStatus === "pending") return false;
        // check document fields in record
        return Boolean(
          r.dokumenBAP || r.dokumenKak || r.dokumenRka || r.dokumenSertifikat ||
          r.dokumenJadwal || r.downloadUrl || r.dokumenSk || r.fileUrl
        );
      }).length
    : 0);

  const activeFilter = Boolean(isFilterActive || filterActive);
  const handleToggle = onFilterPending || onToggleFilter;

  if (actualTotal === 0) return null;

  const percentage = Math.min(100, Math.max(0, Math.round((actualCompleted / actualTotal) * 100)));
  const pendingCount = Math.max(0, actualTotal - actualCompleted);

  let barColor = "#2563EB";
  let textColor = "#1E40AF";
  let bgBadge = "#EFF6FF";

  if (percentage === 100) {
    barColor = "#16A34A";
    textColor = "#166534";
    bgBadge = "#DCFCE7";
  } else if (percentage === 0) {
    barColor = "#DC2626";
    textColor = "#991B1B";
    bgBadge = "#FEE2E2";
  } else if (percentage < 50) {
    barColor = "#D97706";
    textColor = "#92400E";
    bgBadge = "#FEF3C7";
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        padding: "12px 16px",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#0F2E5C" }}>
            📎 {label}
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              padding: "2px 8px",
              borderRadius: "9999px",
              backgroundColor: bgBadge,
              color: textColor
            }}
          >
            {actualCompleted} / {actualTotal} Data ({percentage}%)
          </span>
        </div>

        {handleToggle && (
          <button
            type="button"
            onClick={handleToggle}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 10px",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: 700,
              backgroundColor: activeFilter ? "#0F2E5C" : "#F8FAFC",
              color: activeFilter ? "#FFFFFF" : "#475569",
              border: `1px solid ${activeFilter ? "#0F2E5C" : "#CBD5E1"}`,
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            <Filter style={{ width: "12px", height: "12px" }} />
            <span>
              {activeFilter
                ? "Tampilkan Semua Data"
                : pendingCount > 0
                ? `Filter Belum Lengkap (${pendingCount})`
                : "Semua Sudah Lengkap"}
            </span>
          </button>
        )}
      </div>

      {/* Progress Track */}
      <div
        style={{
          width: "100%",
          height: "8px",
          backgroundColor: "#F1F5F9",
          borderRadius: "9999px",
          overflow: "hidden",
          border: "1px solid #E2E8F0"
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            backgroundColor: barColor,
            borderRadius: "9999px",
            transition: "width 0.4s ease-in-out"
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "#64748B" }}>
        <span>
          {percentage === 100
            ? "✅ Seluruh entri telah memiliki lampiran dokumen resmi."
            : pendingCount > 0
            ? `⚠️ ${pendingCount} entri belum memiliki lampiran berkas (dapat disusulkan).`
            : "Data siap diproses."}
        </span>
        <span style={{ fontWeight: 600 }}>Target: 100%</span>
      </div>
    </div>
  );
}

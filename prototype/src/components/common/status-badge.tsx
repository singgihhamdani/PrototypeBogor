"use client";
import React from "react";
import { CheckCircle2, Clock, XCircle, AlertTriangle, ShieldCheck, Activity } from "lucide-react";

export type StatusVariant =
  | "Terverifikasi"
  | "Menunggu Verifikasi"
  | "Ditolak"
  | "Draft"
  | "Selesai"
  | "Berjalan"
  | "Terjadwal"
  | "Tertib"
  | "Cukup Tertib"
  | "Kurang Tertib"
  | "Tinggi"
  | "Sedang"
  | "Rendah"
  | "Aktif"
  | "Nonaktif";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
  showIcon?: boolean;
}

export default function StatusBadge({
  status,
  size = "md",
  showDot = false,
  showIcon = true
}: StatusBadgeProps) {
  // Normalize string for matching
  const normalized = status.trim().toLowerCase();

  let bg = "#F1F5F9";
  let text = "#475569";
  let border = "#E2E8F0";
  let IconComponent: React.ComponentType<{ style?: React.CSSProperties }> = Clock;

  if (
    normalized.includes("terverifikasi") ||
    normalized.includes("sesuai") ||
    normalized.includes("selesai") ||
    normalized === "tertib" ||
    normalized.includes("lulus") ||
    normalized === "aktif"
  ) {
    bg = "#DCFCE7";
    text = "#166534";
    border = "#BBF7D0";
    IconComponent = CheckCircle2;
  } else if (
    normalized.includes("menunggu") ||
    normalized.includes("draft") ||
    normalized.includes("proses") ||
    normalized.includes("berjalan") ||
    normalized.includes("sedang") ||
    normalized.includes("cukup") ||
    normalized.includes("terjadwal")
  ) {
    bg = "#FEF3C7";
    text = "#92400E";
    border = "#FDE68A";
    IconComponent = Clock;
  } else if (
    normalized.includes("ditolak") ||
    normalized.includes("tidak") ||
    normalized.includes("kurang") ||
    normalized.includes("tinggi") ||
    normalized.includes("sanksi") ||
    normalized.includes("batal") ||
    normalized === "nonaktif"
  ) {
    bg = "#FEE2E2";
    text = "#991B1B";
    border = "#FECACA";
    IconComponent = XCircle;
  } else if (normalized.includes("rendah")) {
    bg = "#EDE9FE";
    text = "#5B21B6";
    border = "#DDD6FE";
    IconComponent = Activity;
  }

  const padding = size === "sm" ? "2px 8px" : size === "lg" ? "6px 14px" : "4px 10px";
  const fontSize = size === "sm" ? "10px" : size === "lg" ? "13px" : "11px";
  const iconSize = size === "sm" ? "11px" : size === "lg" ? "15px" : "13px";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding,
        borderRadius: "9999px",
        fontSize,
        fontWeight: 800,
        backgroundColor: bg,
        color: text,
        border: `1px solid ${border}`,
        whiteSpace: "nowrap",
        lineHeight: 1
      }}
    >
      {showDot && (
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: text
          }}
        />
      )}
      {showIcon && <IconComponent style={{ width: iconSize, height: iconSize, flexShrink: 0 }} />}
      <span>{status}</span>
    </span>
  );
}

"use client";
import React, { useState } from "react";
import { Info, ChevronDown, ChevronUp, MapPin, Building2, Circle } from "lucide-react";

interface MapLegendProps {
  totalProjects: number;
  totalBujk: number;
  layer?: "projects" | "bujk";
}

export default function MapLegend({ totalProjects, totalBujk, layer = "projects" }: MapLegendProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "20px",
        zIndex: 1000,
        backgroundColor: "rgba(255, 255, 255, 0.96)",
        backdropFilter: "blur(10px)",
        borderRadius: "14px",
        border: "1px solid #CBD5E1",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
        maxWidth: "280px",
        fontSize: "12px",
        overflow: "hidden",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    >
      {/* Legend Header with Toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          backgroundColor: "#F8FAFC",
          border: "none",
          borderBottom: isExpanded ? "1px solid #E2E8F0" : "none",
          cursor: "pointer",
          color: "#0F2E5C",
          fontWeight: 800,
          fontSize: "12px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Info style={{ width: "14px", height: "14px", color: "#0F2E5C" }} />
          <span>{layer === "bujk" ? "Legenda Rekanan BUJK" : "Legenda Paket Pekerjaan"}</span>
        </div>
        {isExpanded ? (
          <ChevronDown style={{ width: "16px", height: "16px", color: "#64748B" }} />
        ) : (
          <ChevronUp style={{ width: "16px", height: "16px", color: "#64748B" }} />
        )}
      </button>

      {/* Legend Body */}
      {isExpanded && (
        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {layer === "projects" ? (
            /* Paket Pekerjaan Legend */
            <div>
              <p style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 6px 0" }}>
                Capaian Progres Fisik Riil
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#059669", border: "2px solid #FFFFFF", boxShadow: "0 0 0 1px #059669" }} />
                  <span style={{ color: "#1E293B", fontWeight: 600 }}>100% — Selesai Fisik</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#2563EB", border: "2px solid #FFFFFF", boxShadow: "0 0 0 1px #2563EB" }} />
                  <span style={{ color: "#1E293B", fontWeight: 600 }}>51% – 99% — Tahap Lanjutan</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#D97706", border: "2px solid #FFFFFF", boxShadow: "0 0 0 1px #D97706" }} />
                  <span style={{ color: "#1E293B", fontWeight: 600 }}>1% – 50% — Tahap Awal</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#64748B", border: "2px solid #FFFFFF", boxShadow: "0 0 0 1px #64748B" }} />
                  <span style={{ color: "#1E293B", fontWeight: 600 }}>0% — Belum Mulai</span>
                </div>
              </div>
            </div>
          ) : (
            /* BUJK Legend */
            <div>
              <p style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 6px 0" }}>
                Kualifikasi Badan Usaha
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#7C3AED", border: "2px solid #FFFFFF", boxShadow: "0 0 0 1px #7C3AED" }} />
                  <span style={{ color: "#1E293B", fontWeight: 600 }}>Kualifikasi Besar (B1/B2)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#2563EB", border: "2px solid #FFFFFF", boxShadow: "0 0 0 1px #2563EB" }} />
                  <span style={{ color: "#1E293B", fontWeight: 600 }}>Kualifikasi Menengah (M1/M2)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#059669", border: "2px solid #FFFFFF", boxShadow: "0 0 0 1px #059669" }} />
                  <span style={{ color: "#1E293B", fontWeight: 600 }}>Kualifikasi Kecil (K1/K2/K3)</span>
                </div>
              </div>
            </div>
          )}

          {/* Simbol Layer */}
          <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "8px" }}>
            <p style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 6px 0" }}>
              Entitas Spasial Aktif
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", opacity: layer === "projects" ? 1 : 0.6 }}>
                <MapPin style={{ width: "14px", height: "14px", color: "#0F2E5C" }} />
                <span style={{ color: "#1E293B", fontSize: "11.5px", fontWeight: layer === "projects" ? 700 : 400 }}>
                  Paket Fisik Terdaftar ({totalProjects} Titik)
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", opacity: layer === "bujk" ? 1 : 0.6 }}>
                <Building2 style={{ width: "14px", height: "14px", color: "#7C3AED" }} />
                <span style={{ color: "#1E293B", fontSize: "11.5px", fontWeight: layer === "bujk" ? 700 : 400 }}>
                  Kantor Rekanan BUJK ({totalBujk} Titik)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

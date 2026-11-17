"use client";

import React, { useState } from "react";
import { PilarScoreDetail, DashboardYearData } from "@/lib/services/sipjaki-dashboard-scoring";

interface NestedDoughnutChartProps {
  data: DashboardYearData;
  size?: number;
}

export default function NestedDoughnutChart({ data, size = 320 }: NestedDoughnutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const cx = size / 2;
  const cy = size / 2;

  // Dimensi Cincin
  const outerR = size * 0.42;       // Radius Cincin Luar (Bobot Kumulatif)
  const outerStroke = size * 0.085; // Ketebalan Cincin Luar
  const innerR = size * 0.28;       // Radius Cincin Dalam (Realisasi Pengawasan)
  const innerStroke = size * 0.08;  // Ketebalan Cincin Dalam

  const outerCircumference = 2 * Math.PI * outerR;
  const innerCircumference = 2 * Math.PI * innerR;

  // Hitung offset kumulatif untuk cincin luar
  let accumulatedPercent = 0;
  const outerSegments = data.pilar.map((p, idx) => {
    const strokeDasharray = `${(p.bobotKumulatif / 100) * outerCircumference} ${outerCircumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * outerCircumference);
    const startAngle = (accumulatedPercent / 100) * 360;
    accumulatedPercent += p.bobotKumulatif;
    return {
      ...p,
      strokeDasharray,
      strokeDashoffset,
      startAngle
    };
  });

  // Hitung segmen cincin dalam (Realisasi per pilar)
  let accumulatedInnerPercent = 0;
  const innerSegments = data.pilar.map((p, idx) => {
    // Alokasi slot sama dengan bobot pilar
    const slotLength = (p.bobotKumulatif / 100) * innerCircumference;
    // Porsi terisi berdasarkan rasio realisasi terhadap target
    const fillRatio = Math.min(1, Math.max(0, p.realisasi / p.target));
    const filledLength = slotLength * fillRatio;
    const strokeDasharray = `${filledLength} ${innerCircumference}`;
    const strokeDashoffset = -((accumulatedInnerPercent / 100) * innerCircumference);
    
    // Background slot kosong
    const bgDasharray = `${slotLength} ${innerCircumference}`;
    const bgDashoffset = strokeDashoffset;

    accumulatedInnerPercent += p.bobotKumulatif;

    return {
      ...p,
      filledLength,
      strokeDasharray,
      strokeDashoffset,
      bgDasharray,
      bgDashoffset,
      fillRatio
    };
  });

  const activePilar = hoveredIndex !== null ? data.pilar[hoveredIndex] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
      {/* SVG Double Doughnut */}
      <div style={{ position: "relative", width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(-90deg)", overflow: "visible" }}
        >
          {/* 1. Background Cincin Dalam (Slot Kosong) */}
          {innerSegments.map((seg, idx) => (
            <circle
              key={`inner-bg-${idx}`}
              cx={cx}
              cy={cy}
              r={innerR}
              fill="none"
              stroke="#F1F5F9"
              strokeWidth={innerStroke}
              strokeDasharray={seg.bgDasharray}
              strokeDashoffset={seg.bgDashoffset}
              strokeLinecap="butt"
            />
          ))}

          {/* 2. Cincin Dalam: Realisasi Pengawasan Aktual */}
          {innerSegments.map((seg, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <circle
                key={`inner-${idx}`}
                cx={cx}
                cy={cy}
                r={innerR}
                fill="none"
                stroke={seg.innerColor || seg.color}
                strokeWidth={isHovered ? innerStroke + 3 : innerStroke}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="butt"
                style={{
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  filter: isHovered ? "drop-shadow(0 0 4px rgba(0,0,0,0.25))" : "none"
                }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}

          {/* 3. Cincin Luar: Alokasi Bobot Kumulatif (20%, 30%, 20%, 15%, 15%) */}
          {outerSegments.map((seg, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <circle
                key={`outer-${idx}`}
                cx={cx}
                cy={cy}
                r={outerR}
                fill="none"
                stroke={seg.color}
                strokeWidth={isHovered ? outerStroke + 4 : outerStroke}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="butt"
                style={{
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  filter: isHovered ? "drop-shadow(0 0 6px rgba(0,0,0,0.3))" : "none"
                }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Center Label (Tengah Donut) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            textAlign: "center",
            padding: "8px"
          }}
        >
          {activePilar ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: "10px", fontWeight: 800, color: activePilar.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {activePilar.label}
              </span>
              <span style={{ fontSize: "20px", fontWeight: 900, color: "#0F172A", lineHeight: 1.1 }}>
                {activePilar.indeksPengawasan.toFixed(2)}%
              </span>
              <span style={{ fontSize: "10px", color: "#64748B", marginTop: "2px" }}>
                Realisasi: {activePilar.realisasi}/{activePilar.target} ({activePilar.indeksRealisasi.toFixed(0)}%)
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Indeks Kumulatif
              </span>
              <span style={{ fontSize: "28px", fontWeight: 900, color: "#0F2E5C", lineHeight: 1.1, letterSpacing: "-0.5px" }}>
                {data.totalIndeksPengawasan.toFixed(2)}%
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  backgroundColor: data.predikatBadgeBg,
                  color: data.predikatColor,
                  padding: "2px 8px",
                  borderRadius: "6px",
                  marginTop: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}
              >
                ★ {data.predikat} ★
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Label Petunjuk Cincin Luar & Dalam */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px", fontSize: "11px", color: "#64748B" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", border: "2px solid #0F2E5C" }} />
          <span><strong>Cincin Luar</strong>: Bobot Kumulatif</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#2563EB" }} />
          <span><strong>Cincin Dalam</strong>: Realisasi Pengawasan</span>
        </div>
      </div>
    </div>
  );
}

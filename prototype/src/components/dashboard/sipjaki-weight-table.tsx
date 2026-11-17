"use client";

import React from "react";
import { DashboardYearData } from "@/lib/services/sipjaki-dashboard-scoring";

interface SipjakiWeightTableProps {
  data: DashboardYearData;
}

export default function SipjakiWeightTable({ data }: SipjakiWeightTableProps) {
  return (
    <div style={{ overflowX: "auto", width: "100%" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
        <thead>
          <tr style={{ backgroundColor: "#0F2E5C", color: "#FFFFFF", textAlign: "left" }}>
            <th style={{ padding: "12px 14px", fontWeight: 800, fontSize: "11px", letterSpacing: "0.5px" }}>
              PENGAWASAN (5 PILAR)
            </th>
            <th style={{ padding: "12px 14px", fontWeight: 800, fontSize: "11px", textAlign: "center" }}>
              Indeks Kumulatif (%)
            </th>
            <th style={{ padding: "12px 14px", fontWeight: 800, fontSize: "11px", textAlign: "center" }}>
              Target
            </th>
            <th style={{ padding: "12px 14px", fontWeight: 800, fontSize: "11px", textAlign: "center" }}>
              Realisasi
            </th>
            <th style={{ padding: "12px 14px", fontWeight: 800, fontSize: "11px", textAlign: "center" }}>
              Indeks Pengawasan (%)
            </th>
            <th style={{ padding: "12px 14px", fontWeight: 800, fontSize: "11px", textAlign: "center" }}>
              Indeks Realisasi (%)
            </th>
          </tr>
        </thead>
        <tbody>
          {data.pilar.map((p, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <tr
                key={p.key}
                style={{
                  backgroundColor: isEven ? "#FFFFFF" : "#F8FAFC",
                  borderBottom: "1px solid #E2E8F0"
                }}
              >
                <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0F172A" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: p.color,
                        flexShrink: 0
                      }}
                    />
                    <span>{p.label}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700, color: "#334155" }}>
                  {p.bobotKumulatif}%
                </td>
                <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700, color: "#0F2E5C" }}>
                  {p.target}
                </td>
                <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 800, color: p.realisasi >= p.target ? "#059669" : "#D97706" }}>
                  {p.realisasi}
                </td>
                <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 800, color: "#0F2E5C", backgroundColor: "rgba(15, 46, 92, 0.03)" }}>
                  {p.indeksPengawasan.toFixed(2)}%
                </td>
                <td style={{ padding: "12px 14px", textAlign: "center" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 800,
                      backgroundColor: p.indeksRealisasi >= 100 ? "#ECFDF5" : p.indeksRealisasi >= 50 ? "#EFF6FF" : "#FEF3C7",
                      color: p.indeksRealisasi >= 100 ? "#059669" : p.indeksRealisasi >= 50 ? "#2563EB" : "#D97706"
                    }}
                  >
                    {p.indeksRealisasi.toFixed(0)}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: "#F1F5F9", borderTop: "2px solid #CBD5E1" }}>
            <td style={{ padding: "12px 14px", fontWeight: 900, color: "#0F2E5C" }}>
              TOTAL
            </td>
            <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 900, color: "#0F2E5C" }}>
              100%
            </td>
            <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 900, color: "#0F2E5C" }}>
              {data.totalTarget}
            </td>
            <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 900, color: "#059669" }}>
              {data.totalRealisasi}
            </td>
            <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 900, color: "#0F2E5C", fontSize: "14px", backgroundColor: "#EBF2FA" }}>
              {data.totalIndeksPengawasan.toFixed(2)}%
            </td>
            <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700, color: "#64748B" }}>
              -
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

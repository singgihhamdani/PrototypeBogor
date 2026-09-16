"use client";
import { useState } from "react";
import Link from "next/link";
import { Package, Search, Download, Plus, Eye, ChevronRight, TrendingUp, DollarSign, Calendar, CheckCircle2, Award } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import projectsData from "@/data/projects.json";

export default function PaketPekerjaanPage() {
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const filtered = projectsData.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                        p.contractor.toLowerCase().includes(search.toLowerCase()) || 
                        p.id.toLowerCase().includes(search.toLowerCase());
    const matchSource = filterSource === "Semua" || p.source === filterSource;
    const matchStatus = filterStatus === "Semua" || p.status === filterStatus;
    return matchSearch && matchSource && matchStatus;
  });

  const totalValue = projectsData.reduce((acc, curr) => acc + curr.contractValue, 0);
  const avgProgress = Math.round(projectsData.reduce((acc, curr) => acc + curr.physProgress, 0) / projectsData.length);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 10px", borderRadius: "9999px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Pilar 2: Tertib Penyelenggaraan
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Paket Pekerjaan Konstruksi Kab. Bogor
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
            Pemantauan progres fisik, realisasi keuangan, dan Kurva-S proyek APBD/DAK TA 2026 (Format Sinkronisasi SIPJAKI)
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button 
            onClick={() => alert("Mengunduh Rekapitulasi Paket Pekerjaan (Format Template SIPJAKI .xlsx)...")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #CBD5E1",
              padding: "10px 18px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#334155",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}
          >
            <Download style={{ width: "16px", height: "16px" }} /> Export SIPJAKI
          </button>
          <button 
            onClick={() => alert("Membuka Formulir Tambah Paket Pekerjaan Baru...")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "12px",
              backgroundColor: "#0F2E5C",
              border: "none",
              borderBottom: "3px solid #FFC000",
              padding: "10px 20px",
              fontSize: "12px",
              fontWeight: 800,
              color: "#FFFFFF",
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(15, 46, 92, 0.2)"
            }}
          >
            <Plus style={{ width: "16px", height: "16px", color: "#FFC000" }} /> Tambah Paket
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div 
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px"
        }}
      >
        <div 
          style={{
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: "20px 22px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Total Paket Tercatat</span>
            <div style={{ height: "36px", width: "36px", borderRadius: "10px", backgroundColor: "#EBF2FA", color: "#0F2E5C", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Package style={{ width: "18px", height: "18px" }} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: "28px", fontWeight: 900, color: "#0F172A", margin: 0, lineHeight: 1.1 }}>{projectsData.length}</p>
            <p style={{ fontSize: "11px", color: "#94A3B8", margin: "4px 0 0 0" }}>Terdaftar pada sistem SIJAKON</p>
          </div>
        </div>

        <div 
          style={{
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: "20px 22px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Total Nilai Kontrak</span>
            <div style={{ height: "36px", width: "36px", borderRadius: "10px", backgroundColor: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DollarSign style={{ width: "18px", height: "18px" }} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0, lineHeight: 1.1, fontFamily: "monospace" }}>{formatCurrency(totalValue)}</p>
            <p style={{ fontSize: "11px", color: "#2563EB", margin: "4px 0 0 0", fontWeight: 600 }}>Pagu & Kontrak Berjalan</p>
          </div>
        </div>

        <div 
          style={{
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: "20px 22px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Rata-rata Progres Fisik</span>
            <div style={{ height: "36px", width: "36px", borderRadius: "10px", backgroundColor: "#ECFDF5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp style={{ width: "18px", height: "18px" }} />
            </div>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <p style={{ fontSize: "28px", fontWeight: 900, color: "#059669", margin: 0, lineHeight: 1.1 }}>{avgProgress}%</p>
              <span style={{ fontSize: "11px", color: "#64748B" }}>Realisasi</span>
            </div>
            <div style={{ width: "100%", height: "6px", backgroundColor: "#E2E8F0", borderRadius: "9999px", marginTop: "8px", overflow: "hidden" }}>
              <div style={{ width: `${avgProgress}%`, height: "100%", backgroundColor: "#059669", borderRadius: "9999px" }} />
            </div>
          </div>
        </div>

        <div 
          style={{
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: "20px 22px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Status Pekerjaan Selesai</span>
            <div style={{ height: "36px", width: "36px", borderRadius: "10px", backgroundColor: "#FFFBEB", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 style={{ width: "18px", height: "18px" }} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: "28px", fontWeight: 900, color: "#0F172A", margin: 0, lineHeight: 1.1 }}>
              {projectsData.filter((p) => p.status === "Selesai").length} <span style={{ fontSize: "14px", fontWeight: 500, color: "#94A3B8" }}>/ {projectsData.length} Paket</span>
            </p>
            <p style={{ fontSize: "11px", color: "#94A3B8", margin: "4px 0 0 0" }}>Serah Terima Pertama (PHO)</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div 
        style={{
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94A3B8" }} />
          <input
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ID paket, nama pekerjaan, penyedia jasa..."
            style={{
              width: "100%",
              height: "40px",
              borderRadius: "10px",
              border: "1px solid #CBD5E1",
              backgroundColor: "#F8FAFC",
              paddingLeft: "40px",
              paddingRight: "16px",
              fontSize: "12px",
              color: "#0F172A",
              outline: "none"
            }}
          />
        </div>

        {/* Source filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#F1F5F9", padding: "4px", borderRadius: "10px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", padding: "0 6px" }}>SUMBER:</span>
          {["Semua", "APBD", "DAK", "APBN"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterSource(s)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
                backgroundColor: filterSource === s ? "#0F2E5C" : "transparent",
                color: filterSource === s ? "#FFFFFF" : "#475569",
                transition: "all 0.15s ease"
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#F1F5F9", padding: "4px", borderRadius: "10px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", padding: "0 6px" }}>STATUS:</span>
          {["Semua", "Pelaksanaan", "Selesai"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
                backgroundColor: filterStatus === st ? "#0F2E5C" : "transparent",
                color: filterStatus === st ? "#FFFFFF" : "#475569",
                transition: "all 0.15s ease"
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Enterprise Data Table */}
      <div 
        style={{
          borderRadius: "18px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0", textAlign: "left" }}>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>KODE & NAMA PAKET</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>SUMBER / OPD</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>PENYEDIA JASA</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>NILAI KONTRAK</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>PROGRES FISIK</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>PROGRES KEU</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>STATUS</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px", textAlign: "center" }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr 
                  key={p.id} 
                  style={{ borderBottom: "1px solid #F1F5F9", transition: "background-color 0.15s ease" }}
                >
                  <td style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 700, backgroundColor: "#F1F5F9", color: "#475569", padding: "2px 6px", borderRadius: "4px" }}>
                        {p.id}
                      </span>
                      <div>
                        <Link href={`/paket-pekerjaan/${p.id}`} style={{ fontWeight: 800, color: "#0F172A", textDecoration: "none", fontSize: "13px" }}>
                          {p.name}
                        </Link>
                        <span style={{ display: "block", fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                          {p.startDate} s/d {p.endDate}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: "16px 18px" }}>
                    <span style={{ fontWeight: 800, backgroundColor: "#EBF2FA", color: "#0F2E5C", padding: "4px 8px", borderRadius: "6px", fontSize: "11px" }}>
                      {p.source}
                    </span>
                    <p style={{ fontSize: "11px", color: "#64748B", margin: "4px 0 0 0" }}>{p.owner}</p>
                  </td>

                  <td style={{ padding: "16px 18px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#1E293B", margin: 0 }}>{p.contractor}</p>
                    <p style={{ fontSize: "11px", fontFamily: "monospace", color: "#64748B", margin: "2px 0 0 0" }}>NIB: {p.nib}</p>
                  </td>

                  <td style={{ padding: "16px 18px", fontFamily: "monospace", fontSize: "13px", fontWeight: 800, color: "#0F172A" }}>
                    {formatCurrency(p.contractValue)}
                  </td>

                  <td style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "70px", height: "8px", backgroundColor: "#F1F5F9", borderRadius: "9999px", overflow: "hidden" }}>
                        <div 
                          style={{ 
                            width: `${p.physProgress}%`, 
                            height: "100%", 
                            backgroundColor: p.physProgress >= 100 ? "#059669" : p.physProgress > 50 ? "#0F2E5C" : "#D97706",
                            borderRadius: "9999px" 
                          }} 
                        />
                      </div>
                      <span style={{ fontWeight: 800, color: "#0F172A", fontSize: "12px" }}>{p.physProgress}%</span>
                    </div>
                    <span style={{ fontSize: "10px", color: "#94A3B8" }}>Bulan: {p.physMonth}</span>
                  </td>

                  <td style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "70px", height: "8px", backgroundColor: "#F1F5F9", borderRadius: "9999px", overflow: "hidden" }}>
                        <div 
                          style={{ 
                            width: `${p.finProgress}%`, 
                            height: "100%", 
                            backgroundColor: "#059669",
                            borderRadius: "9999px" 
                          }} 
                        />
                      </div>
                      <span style={{ fontWeight: 800, color: "#059669", fontSize: "12px" }}>{p.finProgress}%</span>
                    </div>
                    <span style={{ fontSize: "10px", color: "#94A3B8" }}>Bulan: {p.finMonth}</span>
                  </td>

                  <td style={{ padding: "16px 18px" }}>
                    <span 
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        borderRadius: "9999px",
                        padding: "4px 12px",
                        fontSize: "11px",
                        fontWeight: 800,
                        backgroundColor: p.status === "Selesai" ? "#ECFDF5" : "#EFF6FF",
                        color: p.status === "Selesai" ? "#059669" : "#2563EB"
                      }}
                    >
                      <span style={{ height: "6px", width: "6px", borderRadius: "9999px", backgroundColor: p.status === "Selesai" ? "#059669" : "#2563EB" }} />
                      {p.status}
                    </span>
                  </td>

                  <td style={{ padding: "16px 18px", textAlign: "center" }}>
                    <Link
                      href={`/paket-pekerjaan/${p.id}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        borderRadius: "8px",
                        backgroundColor: "#F1F5F9",
                        color: "#0F2E5C",
                        padding: "6px 12px",
                        fontSize: "11px",
                        fontWeight: 800,
                        textDecoration: "none"
                      }}
                    >
                      <Eye style={{ width: "14px", height: "14px" }} /> Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

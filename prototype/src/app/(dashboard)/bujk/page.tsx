"use client";
import { useState } from "react";
import { Building2, Search, Plus, Download, Eye, ChevronRight, Award, ShieldCheck, Filter } from "lucide-react";
import bujkData from "@/data/bujk.json";
import Link from "next/link";

export default function BUJKPage() {
  const [search, setSearch] = useState("");
  const [filterQual, setFilterQual] = useState("Semua");

  const filtered = bujkData.filter((b) => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || 
                        b.nib.includes(search) || 
                        b.district.toLowerCase().includes(search.toLowerCase()) ||
                        b.leader.toLowerCase().includes(search.toLowerCase());
    const matchQual = filterQual === "Semua" || b.qualification === filterQual;
    return matchSearch && matchQual;
  });

  const stats = [
    { label: "Total BUJK Terdaftar", value: bujkData.length, sub: "Tervalidasi OSS & LPJK", color: "#0F2E5C", bg: "#EBF2FA", icon: Building2 },
    { label: "Kualifikasi Besar", value: bujkData.filter((b) => b.qualification === "Besar").length, sub: "Kualifikasi B1 & B2", color: "#1E40AF", bg: "#EFF6FF", icon: Award },
    { label: "Kualifikasi Menengah", value: bujkData.filter((b) => b.qualification === "Menengah").length, sub: "Kualifikasi M1 & M2", color: "#D97706", bg: "#FFFBEB", icon: ShieldCheck },
    { label: "Kualifikasi Kecil", value: bujkData.filter((b) => b.qualification === "Kecil").length, sub: "Kualifikasi K1, K2 & K3", color: "#059669", bg: "#ECFDF5", icon: Building2 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 10px", borderRadius: "9999px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Pilar 1: Tertib Usaha
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Master Data BUJK Kabupaten Bogor
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
            Pangkalan data Badan Usaha Jasa Konstruksi yang beroperasi dan berdomisili di 40 Kecamatan
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button 
            onClick={() => alert("Mengunduh Rekapitulasi Data BUJK Kab. Bogor (.xlsx)...")}
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
            <Download style={{ width: "16px", height: "16px" }} /> Export Excel
          </button>
          <button 
            onClick={() => alert("Membuka Formulir Pendaftaran BUJK Baru...")}
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
            <Plus style={{ width: "16px", height: "16px", color: "#FFC000" }} /> Tambah BUJK Baru
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
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div 
              key={s.label} 
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
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>
                  {s.label}
                </span>
                <div 
                  style={{
                    height: "36px",
                    width: "36px",
                    borderRadius: "10px",
                    backgroundColor: s.bg,
                    color: s.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Icon style={{ width: "18px", height: "18px" }} />
                </div>
              </div>

              <div>
                <p style={{ fontSize: "28px", fontWeight: 900, color: "#0F172A", margin: 0, lineHeight: 1.1 }}>
                  {s.value}
                </p>
                <p style={{ fontSize: "11px", color: "#94A3B8", margin: "4px 0 0 0" }}>
                  {s.sub}
                </p>
              </div>
            </div>
          );
        })}
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
            placeholder="Cari berdasarkan nama BUJK, NIB, Direktur, atau Kecamatan..."
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

        {/* Qualification Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#F1F5F9", padding: "4px", borderRadius: "10px" }}>
          {["Semua", "Besar", "Menengah", "Kecil"].map((q) => {
            const isSelected = filterQual === q;
            return (
              <button
                key={q}
                onClick={() => setFilterQual(q)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: isSelected ? "#0F2E5C" : "transparent",
                  color: isSelected ? "#FFFFFF" : "#475569",
                  transition: "all 0.15s ease"
                }}
              >
                {q}
              </button>
            );
          })}
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
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px", width: "50px" }}>NO</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>NAMA BADAN USAHA & PIMPINAN</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>BENTUK</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>NIB</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>KUALIFIKASI</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>KECAMATAN</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>SBU AKTIF</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>STATUS</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px", textAlign: "center" }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr 
                  key={b.id} 
                  style={{ borderBottom: "1px solid #F1F5F9", transition: "background-color 0.15s ease" }}
                >
                  <td style={{ padding: "16px 18px", color: "#64748B", fontWeight: 600 }}>
                    {i + 1}
                  </td>

                  <td style={{ padding: "16px 18px" }}>
                    <Link href={`/bujk/${b.id}`} style={{ fontWeight: 800, color: "#0F172A", textDecoration: "none", fontSize: "13px" }}>
                      {b.name}
                    </Link>
                    <span style={{ display: "block", fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                      Penanggung Jawab: {b.leader}
                    </span>
                  </td>

                  <td style={{ padding: "16px 18px" }}>
                    <span style={{ fontWeight: 700, backgroundColor: "#F1F5F9", color: "#334155", padding: "4px 8px", borderRadius: "6px", fontSize: "11px" }}>
                      {b.type}
                    </span>
                  </td>

                  <td style={{ padding: "16px 18px", fontFamily: "monospace", fontSize: "12px", color: "#334155", fontWeight: 600 }}>
                    {b.nib}
                  </td>

                  <td style={{ padding: "16px 18px" }}>
                    <span 
                      style={{
                        display: "inline-block",
                        borderRadius: "9999px",
                        padding: "4px 12px",
                        fontSize: "11px",
                        fontWeight: 800,
                        backgroundColor: b.qualification === "Besar" ? "#EFF6FF" : b.qualification === "Menengah" ? "#FFFBEB" : "#ECFDF5",
                        color: b.qualification === "Besar" ? "#1E40AF" : b.qualification === "Menengah" ? "#B45309" : "#059669"
                      }}
                    >
                      {b.qualification}
                    </span>
                  </td>

                  <td style={{ padding: "16px 18px", color: "#334155", fontWeight: 600 }}>
                    {b.district}
                  </td>

                  <td style={{ padding: "16px 18px" }}>
                    <span style={{ fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "4px 10px", borderRadius: "8px", fontSize: "12px" }}>
                      {b.sbuCount} SBU
                    </span>
                  </td>

                  <td style={{ padding: "16px 18px" }}>
                    <span 
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        borderRadius: "9999px",
                        padding: "4px 10px",
                        fontSize: "11px",
                        fontWeight: 700,
                        backgroundColor: b.status === "Aktif" ? "#ECFDF5" : "#FFFBEB",
                        color: b.status === "Aktif" ? "#059669" : "#B45309"
                      }}
                    >
                      <span style={{ height: "6px", width: "6px", borderRadius: "9999px", backgroundColor: b.status === "Aktif" ? "#059669" : "#D97706" }} />
                      {b.status}
                    </span>
                  </td>

                  <td style={{ padding: "16px 18px", textAlign: "center" }}>
                    <Link 
                      href={`/bujk/${b.id}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                        fontWeight: 800,
                        color: "#0F2E5C",
                        backgroundColor: "#F1F5F9",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        textDecoration: "none"
                      }}
                    >
                      <Eye style={{ width: "14px", height: "14px" }} /> Detail <ChevronRight style={{ width: "12px", height: "12px" }} />
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

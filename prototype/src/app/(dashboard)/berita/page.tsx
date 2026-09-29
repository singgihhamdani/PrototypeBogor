"use client";
import { useState } from "react";
import { Newspaper, Calendar, Clock, ArrowRight, Search } from "lucide-react";
import newsData from "@/data/news.json";

export default function BeritaPage() {
  const [search, setSearch] = useState("");

  const filtered = newsData.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.summary.toLowerCase().includes(search.toLowerCase()) ||
    n.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <Newspaper style={{ width: "12px", height: "12px" }} /> Publikasi & Dokumentasi
          </span>
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
          Warta & Berita Pembinaan Jasa Konstruksi
        </h1>
        <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
          Informasi kegiatan pembinaan, audit SIMAK lapangan, sosialisasi regulasi, dan kemajuan infrastruktur Kab. Bogor
        </p>
      </div>

      {/* Search Bar */}
      <div 
        style={{
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          padding: "14px 18px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}
      >
        <Search style={{ width: "16px", height: "16px", color: "#94A3B8" }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari berita, agenda kegiatan, atau kata kunci..."
          style={{
            border: "none",
            outline: "none",
            width: "100%",
            fontSize: "13px",
            color: "#0F172A",
            backgroundColor: "transparent"
          }}
        />
      </div>

      {/* News Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {filtered.map((item) => (
          <div 
            key={item.id} 
            style={{
              borderRadius: "18px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "transform 0.15s ease, box-shadow 0.15s ease"
            }}
          >
            {/* Image/Hero Header */}
            <div 
              style={{
                height: "150px",
                background: "linear-gradient(135deg, #0F2E5C 0%, #1E40AF 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative"
              }}
            >
              <div 
                style={{
                  height: "52px",
                  width: "52px",
                  borderRadius: "14px",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFC000"
                }}
              >
                <Newspaper style={{ width: "28px", height: "28px" }} />
              </div>
              <span 
                style={{
                  position: "absolute",
                  top: "14px",
                  left: "14px",
                  backgroundColor: "#FFC000",
                  color: "#0F2E5C",
                  fontSize: "10px",
                  fontWeight: 800,
                  padding: "3px 10px",
                  borderRadius: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}
              >
                {item.category}
              </span>
            </div>

            {/* Content Body */}
            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px", flex: 1, justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "#64748B" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Calendar style={{ width: "12px", height: "12px" }} /> {item.date}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock style={{ width: "12px", height: "12px" }} /> {item.readTime}
                  </span>
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0, lineHeight: 1.35 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: "12px", color: "#475569", margin: 0, lineHeight: 1.55 }}>
                  {item.summary}
                </p>
              </div>

              <div style={{ paddingTop: "14px", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {item.tags.slice(0, 2).map((t) => (
                    <span key={t} style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "#F1F5F9", color: "#64748B", padding: "2px 8px", borderRadius: "4px" }}>
                      #{t}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Membuka artikel lengkap: "${item.title}"`)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    background: "none",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#0F2E5C",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  <span>Baca Selengkapnya</span>
                  <ArrowRight style={{ width: "14px", height: "14px", color: "#FFC000" }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

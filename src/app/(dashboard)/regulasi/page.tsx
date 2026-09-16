"use client";
import { useState } from "react";
import { BookOpen, Search, Download, Calendar, FileText } from "lucide-react";
import regulationsData from "@/data/regulations.json";

export default function RegulasiPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");

  const filtered = regulationsData.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                        r.number.toLowerCase().includes(search.toLowerCase()) ||
                        r.summary.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Semua" || r.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <BookOpen style={{ width: "12px", height: "12px" }} /> Basis Hukum & Kebijakan
          </span>
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
          Regulasi & Dasar Hukum Jasa Konstruksi
        </h1>
        <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
          Himpunan peraturan perundang-undangan daerah dan nasional terkait tertib pembinaan dan pengawasan jasa konstruksi
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div 
        style={{
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          padding: "16px 20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px"
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94A3B8" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor peraturan, judul regulasi, atau kata kunci..."
            style={{
              width: "100%",
              height: "42px",
              borderRadius: "10px",
              border: "1px solid #CBD5E1",
              backgroundColor: "#F8FAFC",
              paddingLeft: "42px",
              paddingRight: "16px",
              fontSize: "13px",
              color: "#0F172A",
              outline: "none"
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#F1F5F9", padding: "4px", borderRadius: "10px", flexWrap: "wrap" }}>
          {["Semua", "Peraturan Daerah", "Undang-Undang", "Peraturan Menteri PUPR", "Surat Edaran Bupati"].map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: "6px 12px",
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
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Regulations List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {filtered.map((reg) => (
          <div 
            key={reg.id} 
            style={{
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              padding: "22px 24px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "18px",
              transition: "border-color 0.15s ease"
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "820px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 800, backgroundColor: "#EBF2FA", color: "#0F2E5C", padding: "3px 8px", borderRadius: "6px" }}>
                  {reg.number}
                </span>
                <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 700 }}>
                  • {reg.category} (Tahun {reg.year})
                </span>
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0, lineHeight: 1.35 }}>
                {reg.title}
              </h3>
              <p style={{ fontSize: "12px", color: "#475569", margin: 0, lineHeight: 1.5 }}>
                {reg.summary}
              </p>
              <p style={{ fontSize: "11px", color: "#94A3B8", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                <Calendar style={{ width: "12px", height: "12px" }} /> Diundangkan: {reg.dateEnacted}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
              <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#64748B", fontWeight: 600 }}>{reg.fileSize}</span>
              <button
                type="button"
                onClick={() => alert(`Mengunduh dokumen resmi ${reg.number} (PDF)...`)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  borderRadius: "10px",
                  backgroundColor: "#F1F5F9",
                  color: "#0F2E5C",
                  border: "1px solid #E2E8F0",
                  padding: "9px 16px",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <Download style={{ width: "14px", height: "14px" }} />
                <span>Unduh Dokumen</span>
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E2E8F0", padding: "48px 24px", textAlign: "center", color: "#94A3B8", fontSize: "13px" }}>
            Tidak ada dokumen regulasi yang sesuai dengan pencarian Anda.
          </div>
        )}
      </div>
    </div>
  );
}

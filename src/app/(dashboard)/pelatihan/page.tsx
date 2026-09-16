"use client";
import { useState } from "react";
import { 
  GraduationCap, Search, Calendar, Users, Award, Download, 
  CheckCircle2, Clock, Plus, QrCode, FileCheck, Eye, X
} from "lucide-react";
import trainingData from "@/data/training.json";

export default function PelatihanPage() {
  const [activeTab, setActiveTab] = useState<"programs" | "tkk" | "cert">("programs");
  const [search, setSearch] = useState("");
  const [selectedCert, setSelectedCert] = useState<{
    name: string;
    nik: string;
    bujk: string;
    certNo: string;
    trainingTitle: string;
  } | null>(null);

  // Extract all participants across training
  const allTkk = trainingData.flatMap(t => 
    t.participants.map(p => ({
      ...p,
      trainingTitle: t.title,
      skkLevel: t.skkLevel,
      date: t.endDate
    }))
  );

  const filteredTkk = allTkk.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.nik.includes(search) ||
    t.bujk.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <GraduationCap style={{ width: "12px", height: "12px" }} /> Pilar 5: Pengembangan SDM & TKK
            </span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#475569", backgroundColor: "#F1F5F9", padding: "3px 10px", borderRadius: "9999px" }}>
              Integrasi: BNSP & SIPJAKI
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Pelatihan & Sertifikasi Tenaga Kerja Konstruksi (TKK)
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
            Fasilitasi uji kompetensi, sertifikasi SKK, bimtek K3 SMKK, dan penerbitan e-Certificate Jasa Konstruksi
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={() => alert("Mengunduh Rekapitulasi TKK Tersertifikasi Kab. Bogor (.xlsx)...")}
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
            <Download style={{ width: "15px", height: "15px" }} /> Export Data
          </button>
          <button
            type="button"
            onClick={() => alert("Membuka Formulir Pembukaan Pelatihan / Bimtek Baru...")}
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
            <Plus style={{ width: "15px", height: "15px", color: "#FFC000" }} /> Buka Pelatihan Baru
          </button>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
        <div style={{ borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Program Pelatihan</span>
            <div style={{ height: "36px", width: "36px", borderRadius: "10px", backgroundColor: "#EBF2FA", color: "#0F2E5C", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap style={{ width: "18px", height: "18px" }} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: "28px", fontWeight: 900, color: "#0F172A", margin: 0, lineHeight: 1.1 }}>{trainingData.length}</p>
            <p style={{ fontSize: "11px", color: "#94A3B8", margin: "4px 0 0 0" }}>TA 2026 (4 Angkatan)</p>
          </div>
        </div>

        <div style={{ borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Peserta Terdaftar</span>
            <div style={{ height: "36px", width: "36px", borderRadius: "10px", backgroundColor: "#EFF6FF", color: "#1E40AF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users style={{ width: "18px", height: "18px" }} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: "28px", fontWeight: 900, color: "#1E40AF", margin: 0, lineHeight: 1.1 }}>
              {trainingData.reduce((acc, t) => acc + t.registered, 0)}
            </p>
            <p style={{ fontSize: "11px", color: "#94A3B8", margin: "4px 0 0 0" }}>Dari Kuota 220 Orang</p>
          </div>
        </div>

        <div style={{ borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Lulus Bersertifikat</span>
            <div style={{ height: "36px", width: "36px", borderRadius: "10px", backgroundColor: "#ECFDF5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Award style={{ width: "18px", height: "18px" }} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: "28px", fontWeight: 900, color: "#059669", margin: 0, lineHeight: 1.1 }}>
              {trainingData.reduce((acc, t) => acc + t.passed, 0)}
            </p>
            <p style={{ fontSize: "11px", color: "#059669", fontWeight: 700, margin: "4px 0 0 0" }}>Tersertifikasi BNSP / SKK</p>
          </div>
        </div>

        <div style={{ borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Target Daerah 2026</span>
            <div style={{ height: "36px", width: "36px", borderRadius: "10px", backgroundColor: "#FFFBEB", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileCheck style={{ width: "18px", height: "18px" }} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: "28px", fontWeight: 900, color: "#0F172A", margin: 0, lineHeight: 1.1 }}>500 <span style={{ fontSize: "14px", fontWeight: 600, color: "#64748B" }}>TKK</span></p>
            <div style={{ width: "100%", height: "6px", backgroundColor: "#F1F5F9", borderRadius: "9999px", overflow: "hidden", marginTop: "6px" }}>
              <div style={{ width: "38%", height: "100%", backgroundColor: "#059669", borderRadius: "9999px" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #E2E8F0", paddingBottom: "10px" }}>
        {[
          { id: "programs", label: "Program Pelatihan & Bimtek" },
          { id: "tkk", label: "Database TKK Tersertifikasi" },
          { id: "cert", label: "Verifikasi e-Certificate QR" },
        ].map((tab) => {
          const isSel = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: "8px 18px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
                backgroundColor: isSel ? "#0F2E5C" : "transparent",
                color: isSel ? "#FFFFFF" : "#64748B",
                boxShadow: isSel ? "0 2px 6px rgba(15, 46, 92, 0.2)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Programs */}
      {activeTab === "programs" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
          {trainingData.map((t) => (
            <div 
              key={t.id} 
              style={{
                borderRadius: "18px",
                border: "1px solid #E2E8F0",
                backgroundColor: "#FFFFFF",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "18px"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "10px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 800, backgroundColor: "#EBF2FA", color: "#0F2E5C", padding: "2px 8px", borderRadius: "6px" }}>
                        {t.id}
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: 700, backgroundColor: "#F1F5F9", color: "#475569", padding: "2px 8px", borderRadius: "9999px" }}>
                        {t.category}
                      </span>
                    </div>
                    <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: "8px 0 0 0", lineHeight: 1.35 }}>
                      {t.title}
                    </h3>
                    <p style={{ fontSize: "11px", color: "#64748B", margin: "4px 0 0 0" }}>
                      {t.batch} • Jenjang SKK: {t.skkLevel}
                    </p>
                  </div>
                  <span 
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: "9999px",
                      flexShrink: 0,
                      backgroundColor: t.status === "Selesai" ? "#ECFDF5" : t.status === "Sedang Berjalan" ? "#EFF6FF" : "#FFFBEB",
                      color: t.status === "Selesai" ? "#059669" : t.status === "Sedang Berjalan" ? "#1E40AF" : "#D97706"
                    }}
                  >
                    {t.status}
                  </span>
                </div>

                <div style={{ backgroundColor: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", color: "#475569" }}>
                  <p style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                    <Calendar style={{ width: "14px", height: "14px", color: "#94A3B8" }} />
                    <span>{t.startDate} s/d {t.endDate}</span>
                  </p>
                  <p style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                    <Users style={{ width: "14px", height: "14px", color: "#94A3B8" }} />
                    <span>Penyelenggara: {t.organizer}</span>
                  </p>
                  <p style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                    <Award style={{ width: "14px", height: "14px", color: "#94A3B8" }} />
                    <span>Instruktur: {t.instructor}</span>
                  </p>
                </div>
              </div>

              <div style={{ paddingTop: "12px", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "#64748B" }}>Kuota: </span>
                  <span style={{ fontWeight: 800, color: "#0F172A" }}>{t.registered} / {t.quota} orang</span>
                </div>
                {t.passed > 0 && (
                  <span style={{ fontWeight: 800, color: "#059669", backgroundColor: "#ECFDF5", padding: "3px 10px", borderRadius: "6px", fontSize: "11px" }}>
                    {t.passed} Peserta Lulus SKK
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Database TKK */}
      {activeTab === "tkk" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Search bar */}
          <div style={{ borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <Search style={{ width: "16px", height: "16px", color: "#94A3B8" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama TKK, NIK, atau nama badan usaha..."
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

          {/* Table Container */}
          <div style={{ borderRadius: "18px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0", textAlign: "left" }}>
                    <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>NAMA & NIK</th>
                    <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>BADAN USAHA / BUJK</th>
                    <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>PROGRAM PELATIHAN</th>
                    <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>NO. SERTIFIKAT SKK</th>
                    <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>NILAI</th>
                    <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>STATUS</th>
                    <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px", textAlign: "center" }}>E-SERTIFIKAT</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTkk.map((tkk) => (
                    <tr key={tkk.nik} style={{ borderBottom: "1px solid #F1F5F9", transition: "background-color 0.15s ease" }}>
                      <td style={{ padding: "16px 18px" }}>
                        <p style={{ fontWeight: 800, color: "#0F172A", margin: 0, fontSize: "13px" }}>{tkk.name}</p>
                        <p style={{ fontSize: "11px", fontFamily: "monospace", color: "#64748B", margin: "2px 0 0 0" }}>NIK: {tkk.nik}</p>
                      </td>
                      <td style={{ padding: "16px 18px", color: "#334155", fontWeight: 600 }}>
                        {tkk.bujk}
                      </td>
                      <td style={{ padding: "16px 18px" }}>
                        <p style={{ fontWeight: 700, color: "#0F172A", margin: 0 }}>{tkk.trainingTitle}</p>
                        <p style={{ fontSize: "11px", color: "#64748B", margin: "2px 0 0 0" }}>Jenjang: {tkk.skkLevel}</p>
                      </td>
                      <td style={{ padding: "16px 18px" }}>
                        <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 8px", borderRadius: "6px", fontSize: "11px" }}>
                          {tkk.certNo}
                        </span>
                      </td>
                      <td style={{ padding: "16px 18px", fontWeight: 800, color: "#0F172A", fontSize: "13px" }}>
                        {tkk.score} <span style={{ fontSize: "11px", color: "#94A3B8" }}>/100</span>
                      </td>
                      <td style={{ padding: "16px 18px" }}>
                        <span style={{ display: "inline-block", backgroundColor: "#ECFDF5", color: "#059669", padding: "3px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: 800 }}>
                          {tkk.status}
                        </span>
                      </td>
                      <td style={{ padding: "16px 18px", textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCert({
                              name: tkk.name,
                              nik: tkk.nik,
                              bujk: tkk.bujk,
                              certNo: tkk.certNo,
                              trainingTitle: tkk.trainingTitle,
                            });
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            borderRadius: "8px",
                            backgroundColor: "#F1F5F9",
                            color: "#0F2E5C",
                            padding: "6px 12px",
                            fontSize: "11px",
                            fontWeight: 700,
                            border: "1px solid #E2E8F0",
                            cursor: "pointer"
                          }}
                        >
                          <Eye style={{ width: "13px", height: "13px" }} /> Lihat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Cert Verification Preview */}
      {activeTab === "cert" && (
        <div style={{ borderRadius: "18px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", padding: "36px", maxWidth: "680px", margin: "0 auto", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", textAlign: "center", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ height: "64px", width: "64px", borderRadius: "18px", backgroundColor: "#EBF2FA", color: "#0F2E5C", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <QrCode style={{ width: "36px", height: "36px" }} />
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
              Verifikasi Keaslian e-Certificate TKK
            </h2>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "6px 0 0 0" }}>
              Pindai QR Code pada sertifikat fisik atau masukkan nomor registrasi SKK / NIK untuk memvalidasi keabsahan data di SIPJAKI PUPR
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", maxWidth: "460px", margin: "0 auto", width: "100%" }}>
            <input
              type="text"
              placeholder="Masukkan No. Sertifikat (cth: SKK-2026-0012)"
              style={{ flex: 1, borderRadius: "10px", border: "1px solid #CBD5E1", padding: "10px 14px", fontSize: "13px", outline: "none" }}
            />
            <button
              type="button"
              onClick={() => alert("Memverifikasi nomor sertifikat ke server LPJK & BNSP...")}
              style={{ borderRadius: "10px", backgroundColor: "#0F2E5C", color: "#FFFFFF", border: "none", padding: "10px 20px", fontSize: "13px", fontWeight: 800, cursor: "pointer" }}
            >
              Cek Validasi
            </button>
          </div>
        </div>
      )}

      {/* Modal e-Certificate */}
      {selectedCert && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "20px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "18px", maxWidth: "560px", width: "100%", padding: "28px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Award style={{ width: "20px", height: "20px", color: "#059669" }} />
                <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
                  Salinan e-Certificate TKK
                </h3>
              </div>
              <button 
                onClick={() => setSelectedCert(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <div style={{ backgroundColor: "#F8FAFC", borderRadius: "14px", border: "1px solid #E2E8F0", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Nama Tenaga Kerja:</span>
                <p style={{ margin: "2px 0 0 0", fontWeight: 800, color: "#0F172A", fontSize: "16px" }}>{selectedCert.name}</p>
                <p style={{ margin: "2px 0 0 0", fontSize: "12px", fontFamily: "monospace", color: "#64748B" }}>NIK: {selectedCert.nik}</p>
              </div>

              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Badan Usaha (BUJK):</span>
                <p style={{ margin: "2px 0 0 0", fontWeight: 600, color: "#0F172A" }}>{selectedCert.bujk}</p>
              </div>

              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Bidang Pelatihan & Kompetensi:</span>
                <p style={{ margin: "2px 0 0 0", fontWeight: 700, color: "#0F2E5C" }}>{selectedCert.trainingTitle}</p>
              </div>

              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Nomor Registrasi Sertifikat:</span>
                <p style={{ margin: "2px 0 0 0", fontFamily: "monospace", fontWeight: 800, color: "#059669" }}>{selectedCert.certNo}</p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "10px", borderTop: "1px solid #F1F5F9" }}>
              <button
                type="button"
                onClick={() => alert("Mengunduh sertifikat digital resmi bertanda tangan elektronik...")}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "10px", backgroundColor: "#0F2E5C", color: "#FFFFFF", border: "none", padding: "8px 18px", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}
              >
                <Download style={{ width: "14px", height: "14px" }} /> Unduh e-Certificate (PDF)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

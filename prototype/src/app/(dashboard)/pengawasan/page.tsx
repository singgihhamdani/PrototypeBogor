"use client";
import { useState } from "react";
import { ClipboardCheck, CheckCircle2, XCircle, MinusCircle, RotateCw, Download, Send, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Answer = "ya" | "tidak" | "na" | null;

interface CheckItem {
  id: string;
  question: string;
  answer: Answer;
  ref: string;
}

const initialChecklist: Record<string, CheckItem[]> = {
  "Tertib Usaha": [
    { id: "TU-01", question: "Badan Usaha memiliki NIB (Nomor Induk Berusaha) yang terdaftar dan masih aktif di OSS-RBA", answer: "ya", ref: "Pasal 5 Permen PUPR 1/2023" },
    { id: "TU-02", question: "Memiliki SBU (Sertifikat Badan Usaha) yang masih berlaku sesuai sub-klasifikasi pekerjaan", answer: "ya", ref: "Pasal 6 Permen PUPR 1/2023" },
    { id: "TU-03", question: "Kualifikasi BUJK sesuai dengan nilai paket pekerjaan yang dikerjakan (Kecil/Menengah/Besar)", answer: "ya", ref: "PP No. 14 Tahun 2021" },
    { id: "TU-04", question: "Memiliki PJT (Penanggung Jawab Teknik) bersertifikat kompetensi kerja (SKK Konstruksi aktif)", answer: "ya", ref: "Pasal 8 Permen PUPR 1/2023" },
    { id: "TU-05", question: "Memiliki PJSK (Penanggung Jawab Sistem Keselamatan Konstruksi) yang ditunjuk resmi", answer: null, ref: "Permen PUPR 10/2021 SMKK" },
    { id: "TU-06", question: "Data badan usaha telah tersinkronisasi dan terverifikasi pada portal SIPJAKI PUPR", answer: "ya", ref: "Permen PUPR 1/2023" },
    { id: "TU-07", question: "Seluruh Tenaga Kerja Konstruksi (TKK) terampil memiliki sertifikat SKK/SKTK yang sah", answer: null, ref: "UU No. 2 Tahun 2017" },
  ],
  "Tertib Penyelenggaraan": [
    { id: "TP-01", question: "Dokumen Kontrak Kerja Konstruksi telah ditandatangani lengkap dengan Standar Syarat Umum/Khusus", answer: "ya", ref: "Permen PUPR 1/2023" },
    { id: "TP-02", question: "Rencana Mutu Pekerjaan Konstruksi (RMPK) dan Metode Kerja (Method Statement) telah disetujui PPK", answer: "ya", ref: "Permen PUPR 10/2021" },
    { id: "TP-03", question: "Jadwal Pelaksanaan (Time Schedule / Kurva-S) tersedia dan dilakukan pemantauan deviasi berkala", answer: "ya", ref: "Spesifikasi Umum 2020" },
    { id: "TP-04", question: "Gambar Kerja (Shop Drawing) dan As-Built Drawing sementara tersedia lengkap di direksi keet", answer: null, ref: "Permen PUPR 1/2023" },
    { id: "TP-05", question: "Laporan Harian, Mingguan, dan Bulanan disampaikan secara tertib kepada Pengawas/Konsultan", answer: "ya", ref: "Syarat Khusus Kontrak" },
    { id: "TP-06", question: "Rencana Keselamatan Konstruksi (RKK) diterapkan di lapangan (APD lengkap, induksi K3, rambu K3)", answer: null, ref: "Permen PUPR 10/2021" },
    { id: "TP-07", question: "Pengujian mutu material beton/aspal (Uji Kuat Tekan / Core Drill) terdokumentasi dan memenuhi syarat", answer: null, ref: "Spesifikasi Teknis" },
  ],
  "Tertib Pemanfaatan": [
    { id: "TM-01", question: "Hasil pekerjaan fisik telah melalui proses Serah Terima Pertama Pekerjaan (BAST-1 / PHO)", answer: "ya", ref: "Pasal 24 Permen 1/2023" },
    { id: "TM-02", question: "Masa Pemeliharaan (Defect Liability Period) berjalan sesuai jangka waktu dalam kontrak", answer: "ya", ref: "Permen PUPR 1/2023" },
    { id: "TM-03", question: "Bangunan gedung/infrastruktur dimanfaatkan sesuai peruntukan fungsi yang direncanakan", answer: "ya", ref: "UU Bangunan Gedung" },
    { id: "TM-04", question: "Tersedia SOP Operasional dan Pemeliharaan (O&P) bagi instansi pengguna jasa/OPD", answer: null, ref: "Permen PUPR 1/2023" },
    { id: "TM-05", question: "Dokumen Sertifikat Laik Fungsi (SLF) telah diproses untuk bangunan gedung publik", answer: null, ref: "PP No. 16 Tahun 2021" },
  ],
};

function calcScore(items: CheckItem[]): number {
  const answered = items.filter((i) => i.answer === "ya" || i.answer === "tidak");
  if (answered.length === 0) return 0;
  const yes = items.filter((i) => i.answer === "ya").length;
  return Math.round((yes / answered.length) * 100);
}

export default function PengawasanPage() {
  const [checklist, setChecklist] = useState(initialChecklist);
  const [activeTab, setActiveTab] = useState("Tertib Usaha");

  const toggleAnswer = (tab: string, id: string, value: Answer) => {
    setChecklist((prev) => ({
      ...prev,
      [tab]: prev[tab].map((item) => item.id === id ? { ...item, answer: item.answer === value ? null : value } : item),
    }));
  };

  const resetAll = () => setChecklist(initialChecklist);

  const totalScore = (() => {
    const allItems = Object.values(checklist).flat();
    const answered = allItems.filter((i) => i.answer === "ya" || i.answer === "tidak");
    if (answered.length === 0) return 0;
    return Math.round((allItems.filter((i) => i.answer === "ya").length / answered.length) * 100);
  })();

  const statusLabel = totalScore >= 80 ? "TERTIB (Sangat Baik)" : totalScore >= 60 ? "CUKUP TERTIB" : totalScore > 0 ? "KURANG TERTIB" : "BELUM DINILAI";
  const statusColor = totalScore >= 80 ? "#059669" : totalScore >= 60 ? "#D97706" : totalScore > 0 ? "#DC2626" : "#64748B";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 10px", borderRadius: "9999px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Instrumen SIMAK PUPR
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Audit & Pengawasan SIMAK Digital
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
            Sistem Informasi Manajemen Pengawasan Konstruksi — Checklist Digital Permen PUPR No. 1/2023
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button 
            onClick={resetAll}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #CBD5E1",
              padding: "10px 16px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#475569",
              cursor: "pointer"
            }}
          >
            <RotateCw style={{ width: "15px", height: "15px" }} /> Reset Jawaban
          </button>
          <button 
            onClick={() => alert(`Laporan Hasil Audit SIMAK (${totalScore}%) siap dikirimkan ke portal SIPJAKI Kementerian PUPR!`)}
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
            <Send style={{ width: "15px", height: "15px", color: "#FFC000" }} /> Simpan & Kirim SIPJAKI
          </button>
        </div>
      </div>

      {/* Score Summary Card */}
      <div 
        style={{
          borderRadius: "18px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          padding: "24px 28px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "32px"
        }}
      >
        {/* Left: Overall Gauge */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ position: "relative", width: "120px", height: "120px" }}>
            <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="60" cy="60" r="50" fill="none" stroke="#E2E8F0" strokeWidth="12" />
              <circle
                cx="60" cy="60" r="50" fill="none" stroke={statusColor} strokeWidth="12"
                strokeDasharray={2 * Math.PI * 50} strokeDashoffset={2 * Math.PI * 50 - (totalScore / 100) * 2 * Math.PI * 50}
                strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", lineHeight: 1 }}>{totalScore}%</span>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748B", marginTop: "2px" }}>Skor SIMAK</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#64748B" }}>
              Status Kepatuhan Proyek
            </span>
            <span style={{ fontSize: "16px", fontWeight: 900, color: statusColor }}>
              {statusLabel}
            </span>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0 0", maxWidth: "260px" }}>
              Berdasarkan evaluasi kumulatif 3 Tertib (Usaha, Penyelenggaraan, Pemanfaatan).
            </p>
          </div>
        </div>

        <div style={{ height: "80px", width: "1px", backgroundColor: "#E2E8F0" }} />

        {/* Right: Breakdown of 3 Tertib */}
        <div style={{ flex: 1, minWidth: "280px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {Object.entries(checklist).map(([tab, items]) => {
            const score = calcScore(items);
            const color = score >= 80 ? "#059669" : score >= 60 ? "#D97706" : "#DC2626";
            return (
              <div key={tab} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#334155", width: "160px", flexShrink: 0 }}>
                  {tab}
                </span>
                <div style={{ flex: 1, height: "8px", backgroundColor: "#F1F5F9", borderRadius: "9999px", overflow: "hidden" }}>
                  <div 
                    style={{ 
                      height: "100%", 
                      width: `${score}%`, 
                      backgroundColor: color, 
                      borderRadius: "9999px",
                      transition: "width 0.5s ease" 
                    }} 
                  />
                </div>
                <span style={{ fontSize: "12px", fontWeight: 800, color: color, width: "45px", textAlign: "right" }}>
                  {score}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "2px solid #E2E8F0", paddingBottom: "2px" }}>
        {Object.keys(checklist).map((tab) => {
          const isSelected = activeTab === tab;
          const score = calcScore(checklist[tab]);
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 18px",
                fontSize: "13px",
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
                borderBottom: isSelected ? "3px solid #0F2E5C" : "3px solid transparent",
                backgroundColor: "transparent",
                color: isSelected ? "#0F2E5C" : "#64748B",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.15s ease"
              }}
            >
              <span>{tab}</span>
              <span 
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  backgroundColor: isSelected ? "#EBF2FA" : "#F1F5F9",
                  color: isSelected ? "#0F2E5C" : "#64748B"
                }}
              >
                {score}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Checklist Question Cards */}
      <div 
        style={{
          borderRadius: "18px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {checklist[activeTab].map((item, idx) => (
            <div 
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
                padding: "18px 24px",
                borderBottom: idx < checklist[activeTab].length - 1 ? "1px solid #F1F5F9" : "none",
                backgroundColor: item.answer === "ya" ? "rgba(16, 185, 129, 0.03)" : item.answer === "tidak" ? "rgba(239, 68, 68, 0.03)" : "#FFFFFF"
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1, minWidth: "280px" }}>
                <span 
                  style={{
                    fontFamily: "monospace",
                    fontSize: "11px",
                    fontWeight: 800,
                    backgroundColor: "#F1F5F9",
                    color: "#0F2E5C",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    flexShrink: 0
                  }}
                >
                  {item.id}
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#1E293B", margin: 0, lineHeight: 1.5 }}>
                    {item.question}
                  </p>
                  <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                    Dasar Acuan: {item.ref}
                  </span>
                </div>
              </div>

              {/* 3 Action Pill Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {(["ya", "tidak", "na"] as Answer[]).map((val) => {
                  const isChecked = item.answer === val;
                  let bg = "#F1F5F9";
                  let fg = "#64748B";
                  let border = "1px solid #E2E8F0";

                  if (isChecked) {
                    if (val === "ya") { bg = "#059669"; fg = "#FFFFFF"; border = "1px solid #059669"; }
                    if (val === "tidak") { bg = "#DC2626"; fg = "#FFFFFF"; border = "1px solid #DC2626"; }
                    if (val === "na") { bg = "#475569"; fg = "#FFFFFF"; border = "1px solid #475569"; }
                  }

                  return (
                    <button
                      key={val}
                      onClick={() => toggleAnswer(activeTab, item.id, val)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 14px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: 800,
                        backgroundColor: bg,
                        color: fg,
                        border: border,
                        cursor: "pointer",
                        boxShadow: isChecked ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {val === "ya" && <CheckCircle2 style={{ width: "14px", height: "14px" }} />}
                      {val === "tidak" && <XCircle style={{ width: "14px", height: "14px" }} />}
                      {val === "na" && <MinusCircle style={{ width: "14px", height: "14px" }} />}
                      <span>{val === "ya" ? "Memenuhi (Ya)" : val === "tidak" ? "Tidak Memenuhi" : "N/A"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

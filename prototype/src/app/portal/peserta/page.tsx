"use client";
import { useState } from "react";
import { 
  GraduationCap, Award, CheckCircle2, Clock, Calendar, 
  Download, QrCode, FileText, Check, BookOpen, AlertCircle, Sparkles
} from "lucide-react";
import { useAuth } from "@/lib/mock-auth";

export default function PesertaPortalPage() {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert("Simulasi Berhasil: E-Sertifikat SKK Digital (PDF) ber-QR Code terverifikasi telah diunduh.");
    }, 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* 1. Hero Card */}
      <div
        style={{
          borderRadius: "20px",
          background: "linear-gradient(135deg, #0A2540 0%, #0369A1 60%, #0284C7 100%)",
          padding: "28px 32px",
          color: "#FFFFFF",
          boxShadow: "0 10px 25px -5px rgba(2, 132, 199, 0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px"
        }}
      >
        <div style={{ maxWidth: "680px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(255,255,255,0.15)", padding: "4px 12px", borderRadius: "9999px", fontSize: "11px", fontWeight: 800, color: "#7DD3FC", marginBottom: "10px" }}>
            <GraduationCap style={{ width: "14px", height: "14px" }} />
            <span>Fasilitasi Sertifikasi Tenaga Kerja Konstruksi (TKK)</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 900, margin: 0, letterSpacing: "-0.5px" }}>
            Selamat Datang, {user?.name || "Ahmad Fauzi, A.Md"}
          </h1>
          <p style={{ fontSize: "13px", color: "#E0F2FE", margin: "6px 0 0 0", lineHeight: 1.5 }}>
            Skema Kompetensi: <strong>Pelaksana Lapangan Pekerjaan Gedung (Jenjang 4)</strong> • Penyelenggara: <strong>Dinas PUPR Kabupaten Bogor bekerjasama dengan LSP/BNSP</strong>
          </p>
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", padding: "16px 24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.2)", textAlign: "center" }}>
          <span style={{ fontSize: "11px", color: "#BAE6FD", textTransform: "uppercase", display: "block", fontWeight: 700 }}>Hasil Uji Asesor</span>
          <span style={{ fontSize: "24px", fontWeight: 900, color: "#4ADE80", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <CheckCircle2 style={{ width: "22px", height: "22px" }} /> KOMPETEN
          </span>
          <span style={{ fontSize: "10px", color: "#E0F2FE", display: "block", fontWeight: 700 }}>SKK Siap Diunduh</span>
        </div>
      </div>

      {/* 2. E-Sertifikat Digital Showcase */}
      <div id="sertifikat" style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", border: "1px solid #E2E8F0", padding: "26px 30px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0284C7", backgroundColor: "#E0F2FE", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Award style={{ width: "12px", height: "12px" }} /> Dokumen Resmi Terakreditasi
            </span>
            <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0F172A", margin: "6px 0 0 0" }}>
              Sertifikat Kompetensi Kerja (SKK) Konstruksi Digital
            </h2>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "12px",
              backgroundColor: "#0284C7",
              color: "#FFFFFF",
              fontSize: "13px",
              fontWeight: 800,
              border: "none",
              cursor: downloading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 12px rgba(2, 132, 199, 0.25)"
            }}
          >
            <Download style={{ width: "16px", height: "16px" }} />
            <span>{downloading ? "Menyiapkan PDF..." : "Unduh E-Sertifikat (PDF)"}</span>
          </button>
        </div>

        {/* Certificate Mock Preview Card */}
        <div
          style={{
            borderRadius: "16px",
            border: "2px solid #BAE6FD",
            background: "linear-gradient(to right, #F0F9FF, #FFFFFF)",
            padding: "24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            alignItems: "center"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#0369A1", textTransform: "uppercase" }}>
              Nomor Registrasi Sertifikat BNSP / SIPJAKI:
            </span>
            <span style={{ fontSize: "18px", fontWeight: 900, fontFamily: "monospace", color: "#0F2E5C" }}>
              SKK-2026-DPUPR-BG-0042
            </span>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px", fontSize: "12px" }}>
              <div>
                <span style={{ color: "#64748B", display: "block" }}>Nama Lengkap:</span>
                <span style={{ fontWeight: 800, color: "#1E293B" }}>Ahmad Fauzi, A.Md</span>
              </div>
              <div>
                <span style={{ color: "#64748B", display: "block" }}>Nomor Induk Kependudukan:</span>
                <span style={{ fontWeight: 800, color: "#1E293B" }}>3201019203840003</span>
              </div>
              <div>
                <span style={{ color: "#64748B", display: "block" }}>Jenjang Kualifikasi:</span>
                <span style={{ fontWeight: 800, color: "#0369A1" }}>Jenjang 4 (Teknisi / Analis)</span>
              </div>
              <div>
                <span style={{ color: "#64748B", display: "block" }}>Masa Berlaku:</span>
                <span style={{ fontWeight: 800, color: "#059669" }}>5 Tahun (s/d Sept 2031)</span>
              </div>
            </div>
          </div>

          {/* QR Verification Box */}
          <div 
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              border: "1px solid #CBD5E1",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}
          >
            <div style={{ width: "72px", height: "72px", backgroundColor: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <QrCode style={{ width: "54px", height: "54px", color: "#0F2E5C" }} />
            </div>
            <div>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#059669", backgroundColor: "#ECFDF5", padding: "2px 8px", borderRadius: "9999px" }}>
                QR Code Valid SIPJAKI
              </span>
              <p style={{ fontSize: "11px", color: "#475569", margin: "6px 0 0 0", lineHeight: 1.4 }}>
                Pindai QR ini untuk verifikasi keaslian di sistem informasi nasional LPJK / Kementerian PUPR.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Riwayat Modul & Uji Kompetensi */}
      <div id="jadwal" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
            Kurikulum & Riwayat Pembinaan Kompetensi
          </h2>
          <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
            Total 32 Jam Pelajaran (JP) teori dan praktek lapangan di Balai Pelatihan Jasa Konstruksi
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
          {[
            { title: "Modul 1: Spesifikasi & Gambar Kerja", jp: "8 JP", status: "Selesai", score: "88/100" },
            { title: "Modul 2: Penerapan SMKK K3 Konstruksi", jp: "8 JP", status: "Selesai", score: "92/100" },
            { title: "Modul 3: Pengawasan Pembesian & Beton", jp: "10 JP", status: "Selesai", score: "85/100" },
            { title: "Modul 4: Asesmen Uji Kompetensi Asesor", jp: "6 JP", status: "Kompeten", score: "Lulus Asesmen" },
          ].map((item, idx) => (
            <div key={idx} style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #E2E8F0", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#0284C7", backgroundColor: "#E0F2FE", padding: "2px 8px", borderRadius: "6px" }}>
                  {item.jp}
                </span>
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#059669", backgroundColor: "#ECFDF5", padding: "2px 8px", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                  <Check style={{ width: "12px", height: "12px" }} /> {item.status}
                </span>
              </div>
              <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                {item.title}
              </h4>
              <span style={{ fontSize: "11px", color: "#64748B" }}>Nilai Evaluasi: <strong>{item.score}</strong></span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

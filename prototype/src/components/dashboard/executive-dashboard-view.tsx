"use client";
import { useState } from "react";
import { 
  Building2, Package, GraduationCap, ShieldCheck, TrendingUp, 
  Download, FileBarChart, Calendar, Landmark, CheckCircle2, 
  MapPin, ArrowUpRight, BarChart3, PieChart, Sparkles, AlertCircle
} from "lucide-react";

export default function ExecutiveDashboardView() {
  const [downloading, setDownloading] = useState(false);

  const handleExport = (format: "PDF" | "Excel") => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert(`Laporan Eksekutif ${format} (Ringkasan Pembinaan & Kepatuhan Jasa Konstruksi TA 2026) berhasil diunduh.`);
    }, 1200);
  };

  const executiveKpis = [
    {
      label: "Total Belanja Konstruksi APBD",
      value: "Rp 420,8 M",
      sub: "342 Paket Terkontrak TA 2026",
      trend: "+14.2% YoY",
      icon: Landmark,
      color: "#0F2E5C",
      bg: "#EBF2FA"
    },
    {
      label: "Indeks Kepatuhan Jakon Daerah",
      value: "74.8 / 100",
      sub: "Rata-rata 40 Kecamatan (Tertib Baik)",
      trend: "+6.5 Poin",
      icon: ShieldCheck,
      color: "#059669",
      bg: "#ECFDF5"
    },
    {
      label: "Realisasi Sertifikasi TKK",
      value: "4.850 Org",
      sub: "97.0% dari Target 5.000 Tenaga Kerja",
      trend: "Tercapai",
      icon: GraduationCap,
      color: "#D97706",
      bg: "#FFFBEB"
    },
    {
      label: "Tingkat Keselamatan Kerja K3",
      value: "100%",
      sub: "Zero Fatal Accident Terjaga",
      trend: "Aman",
      icon: CheckCircle2,
      color: "#0F2E5C",
      bg: "#F1F5F9"
    }
  ];

  const wilayahKepatuhan = [
    { wilayah: "Wilayah 1 (Cibinong, Citeureup, Babakan Madang, Sukaraja)", bujk: 380, paket: 112, skor: 82.4, status: "Sangat Baik" },
    { wilayah: "Wilayah 2 (Cileungsi, Gunung Putri, Jonggol, Cariu)", bujk: 295, paket: 84, skor: 78.1, status: "Baik" },
    { wilayah: "Wilayah 3 (Ciawi, Cisarua, Megamendung, Caringin)", bujk: 240, paket: 68, skor: 71.5, status: "Cukup" },
    { wilayah: "Wilayah 4 (Parung, Kemang, Gunung Sindur, Rumpin)", bujk: 195, paket: 46, skor: 69.8, status: "Cukup" },
    { wilayah: "Wilayah 5 (Leuwiliang, Cibungbulang, Pamijahan, Jasinga)", bujk: 130, paket: 32, skor: 72.3, status: "Baik" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* 1. Executive Banner */}
      <div 
        style={{
          borderRadius: "20px",
          background: "linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%)",
          padding: "32px 36px",
          color: "#FFFFFF",
          boxShadow: "0 10px 25px -5px rgba(6, 95, 70, 0.3)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "9999px", backgroundColor: "rgba(255,255,255,0.15)", padding: "6px 14px", fontSize: "11px", fontWeight: 800, color: "#A7F3D0" }}>
              <Landmark style={{ width: "14px", height: "14px" }} />
              <span>PORTAL EKSEKUTIF PIMPINAN DAERAH • KABUPATEN BOGOR</span>
            </div>

            {/* Quick Export Tools */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={() => handleExport("PDF")}
                disabled={downloading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#FFFFFF",
                  color: "#065F46",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: downloading ? "not-allowed" : "pointer",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                }}
              >
                <Download style={{ width: "14px", height: "14px" }} />
                <span>Unduh Ringkasan Eksekutif (PDF)</span>
              </button>
              <button
                onClick={() => handleExport("Excel")}
                disabled={downloading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255,255,255,0.3)",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: downloading ? "not-allowed" : "pointer"
                }}
              >
                <FileBarChart style={{ width: "14px", height: "14px" }} />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.5px", margin: 0 }}>
              Ringkasan Kinerja & Kepatuhan Jasa Konstruksi TA 2026
            </h1>
            <p style={{ fontSize: "14px", color: "#D1FAE5", margin: 0, maxWidth: "820px", lineHeight: 1.5 }}>
              Laporan strategis pimpinan daerah mengenai efektivitas 5 Pilar Pembinaan Jasa Konstruksi, status 342 paket pekerjaan DPU, serta kepatuhan 1.240 BUJK di 40 Kecamatan se-Kabupaten Bogor.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Executive KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
        {executiveKpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "18px",
                border: "1px solid #E2E8F0",
                padding: "20px 22px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                  {kpi.label}
                </span>
                <div style={{ width: "34px", height: "34px", borderRadius: "10px", backgroundColor: kpi.bg, color: kpi.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon style={{ width: "18px", height: "18px" }} />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "4px" }}>
                <span style={{ fontSize: "26px", fontWeight: 900, color: "#0F172A" }}>
                  {kpi.value}
                </span>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669", backgroundColor: "#ECFDF5", padding: "2px 8px", borderRadius: "9999px" }}>
                  {kpi.trend}
                </span>
              </div>

              <span style={{ fontSize: "11px", color: "#64748B" }}>
                {kpi.sub}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3. Sebaran Kepatuhan 5 Wilayah Pembangunan */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "18px", border: "1px solid #E2E8F0", padding: "24px 28px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
              Evaluasi Kepatuhan Tertib Konstruksi per Wilayah Pembinaan
            </h2>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
              Berdasarkan hasil pengawasan SIMAK digital dan audit lapangan Tim Asesor Dinas PU
            </p>
          </div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "4px 12px", borderRadius: "9999px" }}>
            Standar Permen PUPR 1/2023
          </span>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#64748B", fontWeight: 800 }}>
              <th style={{ padding: "12px 14px" }}>Wilayah & Cakupan Kecamatan</th>
              <th style={{ padding: "12px 14px" }}>BUJK Terdaftar</th>
              <th style={{ padding: "12px 14px" }}>Paket Berjalan</th>
              <th style={{ padding: "12px 14px" }}>Indeks Kepatuhan</th>
              <th style={{ padding: "12px 14px" }}>Predikat Evaluasi</th>
            </tr>
          </thead>
          <tbody>
            {wilayahKepatuhan.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={{ padding: "14px", fontWeight: 700, color: "#1E293B" }}>
                  {item.wilayah}
                </td>
                <td style={{ padding: "14px", color: "#475569" }}>{item.bujk} Badan Usaha</td>
                <td style={{ padding: "14px", color: "#475569" }}>{item.paket} Paket</td>
                <td style={{ padding: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "100px", height: "6px", backgroundColor: "#E2E8F0", borderRadius: "9999px", overflow: "hidden" }}>
                      <div style={{ width: `${item.skor}%`, height: "100%", backgroundColor: item.skor > 80 ? "#10B981" : item.skor > 70 ? "#3B82F6" : "#F59E0B" }} />
                    </div>
                    <span style={{ fontWeight: 800, color: "#1E293B" }}>{item.skor}%</span>
                  </div>
                </td>
                <td style={{ padding: "14px" }}>
                  <span 
                    style={{ 
                      fontSize: "10px", 
                      fontWeight: 800, 
                      padding: "3px 10px", 
                      borderRadius: "9999px",
                      backgroundColor: item.skor > 80 ? "#ECFDF5" : "#EFF6FF",
                      color: item.skor > 80 ? "#059669" : "#1D4ED8"
                    }}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

"use client";
import { 
  Building2, Package, GraduationCap, ShieldCheck, TrendingUp, TrendingDown, 
  AlertTriangle, Users, Landmark, FileBarChart, ArrowUpRight, CheckCircle2,
  DollarSign, Sparkles, MapPin, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const pilarData = [
  { label: "Tertib Usaha", value: 72, icon: Building2, color: "#0F2E5C", desc: "Kesesuaian Izin, NIB & SBU", status: "Baik" },
  { label: "Tertib Penyelenggaraan", value: 65, icon: ShieldCheck, color: "#1E40AF", desc: "Kontrak Kerja & K3 SMKK", status: "Cukup" },
  { label: "Tertib Pemanfaatan", value: 58, icon: Package, color: "#D97706", desc: "Fungsi & Umur Konstruksi", status: "Cukup" },
  { label: "Pelaporan SIPJAKI", value: 85, icon: FileBarChart, color: "#059669", desc: "Sinkronisasi Terjadwal", status: "Sangat Baik" },
  { label: "Fasilitasi SDM / TKK", value: 80, icon: GraduationCap, color: "#0F2E5C", desc: "Sertifikasi SKK BNSP", status: "Baik" },
];

const summaryCards = [
  { 
    label: "Total BUJK Terdaftar", 
    value: "1.240", 
    sub: "312 Kualifikasi Besar • 480 Menengah", 
    badge: "+12% Thn Lalu",
    isPositive: true,
    icon: Building2, 
    iconBg: "#EBF2FA",
    iconColor: "#0F2E5C"
  },
  { 
    label: "Paket Pekerjaan TA 2026", 
    value: "342", 
    sub: "Total Nilai Kontrak Rp 420 Miliar", 
    badge: "328 Pelaksanaan",
    isPositive: true,
    icon: Package, 
    iconBg: "#EFF6FF",
    iconColor: "#2563EB"
  },
  { 
    label: "TKK Tersertifikasi SKK", 
    value: "4.850", 
    sub: "Realisasi 97% dari target 5.000 org", 
    badge: "97% Target",
    isPositive: true,
    icon: GraduationCap, 
    iconBg: "#FFFBEB",
    iconColor: "#B45309"
  },
  { 
    label: "Tingkat Fatalitas K3", 
    value: "0", 
    sub: "Zero Fatal Accident tercapai", 
    badge: "100% Aman",
    isPositive: true,
    icon: ShieldCheck, 
    iconBg: "#ECFDF5",
    iconColor: "#059669"
  },
];

const recentProjects = [
  { id: "P001", name: "Rekonstruksi Jl. Raya Cibinong - Citeureup", contractor: "PT Bangun Jaya Konstruksi", progress: 68, plan: 60, value: "Rp 8,50 M", status: "Ahead", district: "Cibinong" },
  { id: "P002", name: "Pembangunan Gedung PAUD Terpadu Kec. Gunung Putri", contractor: "CV Karya Mandiri Utama", progress: 82, plan: 80, value: "Rp 3,20 M", status: "Ahead", district: "Gunung Putri" },
  { id: "P003", name: "Peningkatan Jalan Lingkungan Desa Sukamahi", contractor: "PT Mitra Pembangunan Nusantara", progress: 90, plan: 90, value: "Rp 1,85 M", status: "On Track", district: "Cileungsi" },
  { id: "P004", name: "Pembangunan Drainase Primer Kec. Parung", contractor: "CV Teknik Sejahtera", progress: 45, plan: 60, value: "Rp 950 Jt", status: "Behind", district: "Parung" },
  { id: "P005", name: "Rehabilitasi Jembatan Sungai Cikeas", contractor: "PT Infrastruktur Bogor Raya", progress: 58, plan: 60, value: "Rp 12,5 M", status: "On Track", district: "Ciawi" },
];

function GaugeCircle({ value, size = 80, strokeWidth = 8, color = "#0F2E5C" }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease-out" }}
      />
    </svg>
  );
}

export default function DashboardPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* 1. Executive Banner Hero Card */}
      <div 
        style={{
          borderRadius: "20px",
          background: "linear-gradient(135deg, #07182E 0%, #0F2E5C 60%, #163B75 100%)",
          padding: "32px 36px",
          color: "#FFFFFF",
          boxShadow: "0 10px 25px -5px rgba(15, 46, 92, 0.25)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div 
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.08,
            backgroundImage: "radial-gradient(#FFC000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            pointerEvents: "none"
          }}
        />

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "9999px", backgroundColor: "rgba(255,255,255,0.12)", padding: "6px 14px", fontSize: "11px", fontWeight: 700, color: "#FFC000", border: "1px solid rgba(255,255,255,0.15)", alignSelf: "flex-start" }}>
            <Landmark style={{ width: "14px", height: "14px" }} />
            <span>DPUPR KABUPATEN BOGOR • WILAYAH PEMBINAAN 40 KECAMATAN</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.5px", margin: 0, lineHeight: 1.25 }}>
              Dashboard Pembinaan & Pengawasan Jasa Konstruksi
            </h1>
            <p style={{ fontSize: "14px", color: "#CBD5E1", margin: 0, lineHeight: 1.6, maxWidth: "800px" }}>
              Monitoring kepatuhan 5 Pilar Jasa Konstruksi, pelaksanaan audit digital SIMAK (Tertib Usaha, Penyelenggaraan, dan Pemanfaatan), serta sinkronisasi terpadu ke portal SIPJAKI Kementerian PUPR.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px", paddingTop: "8px", flexWrap: "wrap" }}>
            <Link
              href="/pengawasan"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "12px",
                backgroundColor: "#FFC000",
                color: "#0F2E5C",
                padding: "11px 22px",
                fontSize: "13px",
                fontWeight: 900,
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                transition: "transform 0.15s ease"
              }}
            >
              <span>Mulai Audit SIMAK</span>
              <ArrowUpRight style={{ width: "16px", height: "16px" }} />
            </Link>
            <Link
              href="/webgis"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                color: "#FFFFFF",
                padding: "11px 22px",
                fontSize: "13px",
                fontWeight: 700,
                textDecoration: "none",
                border: "1px solid rgba(255, 255, 255, 0.25)"
              }}
            >
              <MapPin style={{ width: "16px", height: "16px", color: "#FFC000" }} />
              <span>Buka Peta WebGIS (40 Kec)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. 4 Summary Metric Cards */}
      <div 
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px"
        }}
      >
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.label} 
              style={{
                borderRadius: "16px",
                border: "1px solid #E2E8F0",
                backgroundColor: "#FFFFFF",
                padding: "22px 24px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "16px"
              }}
            >
              {/* Top Row: Icon + Badge */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div 
                  style={{
                    height: "44px",
                    width: "44px",
                    borderRadius: "12px",
                    backgroundColor: card.iconBg,
                    color: card.iconColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Icon style={{ width: "22px", height: "22px" }} />
                </div>
                <span 
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    backgroundColor: card.iconBg,
                    color: card.iconColor
                  }}
                >
                  {card.badge}
                </span>
              </div>

              {/* Middle: Number & Title */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <p style={{ fontSize: "32px", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.5px", margin: 0, lineHeight: 1.1 }}>
                  {card.value}
                </p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#334155", margin: 0 }}>
                  {card.label}
                </p>
              </div>

              {/* Bottom: Subtitle with clearance */}
              <div style={{ paddingTop: "8px", borderTop: "1px solid #F1F5F9" }}>
                <p style={{ fontSize: "11px", color: "#64748B", margin: 0, fontWeight: 500 }}>
                  {card.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. 5 Pilar SIPJAKI Section */}
      <div 
        style={{
          borderRadius: "18px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          padding: "24px 28px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid #F1F5F9", paddingBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ height: "10px", width: "10px", borderRadius: "9999px", backgroundColor: "#FFC000" }} />
              <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                Status Kepatuhan 5 Pilar Jasa Konstruksi (SIPJAKI)
              </h2>
            </div>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0 0" }}>
              Evaluasi kinerja pengawasan daerah sesuai Permen PUPR No. 1/2023
            </p>
          </div>
          <span 
            style={{
              fontSize: "12px",
              fontWeight: 800,
              color: "#0F2E5C",
              backgroundColor: "#EBF2FA",
              padding: "6px 14px",
              borderRadius: "10px",
              border: "1px solid rgba(15, 46, 92, 0.12)"
            }}
          >
            Indeks Kepatuhan Kab. Bogor: 72% (Kategori Tertib)
          </span>
        </div>

        <div 
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px"
          }}
        >
          {pilarData.map((pilar) => {
            const Icon = pilar.icon;
            return (
              <div 
                key={pilar.label} 
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "20px 16px",
                  borderRadius: "14px",
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  gap: "10px"
                }}
              >
                <div style={{ position: "relative", marginBottom: "4px" }}>
                  <GaugeCircle value={pilar.value} size={80} strokeWidth={8} color={pilar.color} />
                  <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 900, color: "#0F172A" }}>
                    {pilar.value}%
                  </span>
                </div>
                <p style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                  {pilar.label}
                </p>
                <p style={{ fontSize: "11px", color: "#64748B", margin: 0, lineHeight: 1.4 }}>
                  {pilar.desc}
                </p>
                <span 
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "6px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    color: pilar.color,
                    marginTop: "4px"
                  }}
                >
                  {pilar.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Recent Projects Table (Spacious, Clear & Beautiful) */}
      <div 
        style={{
          borderRadius: "18px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          padding: "24px 28px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          display: "flex",
          flexDirection: "column",
          gap: "18px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
              Paket Pekerjaan Konstruksi Terkini
            </h2>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0 0" }}>
              Pemantauan deviasi fisik lapangan terhadap jadwal kontrak APBD TA 2026
            </p>
          </div>
          <Link 
            href="/paket-pekerjaan" 
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: 800,
              color: "#0F2E5C",
              backgroundColor: "#F1F5F9",
              padding: "8px 16px",
              borderRadius: "10px",
              textDecoration: "none"
            }}
          >
            <span>Semua Paket</span>
            <ChevronRight style={{ width: "16px", height: "16px", color: "#0F2E5C" }} />
          </Link>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0", textAlign: "left" }}>
                <th style={{ padding: "14px 16px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>KODE & NAMA PAKET</th>
                <th style={{ padding: "14px 16px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>PENYEDIA JASA</th>
                <th style={{ padding: "14px 16px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>NILAI KONTRAK</th>
                <th style={{ padding: "14px 16px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>PROGRES FISIK</th>
                <th style={{ padding: "14px 16px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>STATUS DEVIASI</th>
                <th style={{ padding: "14px 16px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px", textAlign: "center" }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.map((p) => {
                const deviasi = p.progress - p.plan;
                return (
                  <tr 
                    key={p.id} 
                    style={{ borderBottom: "1px solid #F1F5F9", transition: "background-color 0.15s ease" }}
                  >
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                        <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 700, backgroundColor: "#F1F5F9", color: "#475569", padding: "2px 6px", borderRadius: "4px" }}>
                          {p.id}
                        </span>
                        <div>
                          <Link href={`/paket-pekerjaan/${p.id}`} style={{ fontWeight: 700, color: "#0F172A", textDecoration: "none", fontSize: "13px" }}>
                            {p.name}
                          </Link>
                          <span style={{ display: "block", fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                            Kec. {p.district}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "16px", color: "#334155", fontWeight: 600 }}>
                      {p.contractor}
                    </td>

                    <td style={{ padding: "16px", fontFamily: "monospace", fontWeight: 800, color: "#0F172A", fontSize: "13px" }}>
                      {p.value}
                    </td>

                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "100px", height: "8px", backgroundColor: "#E2E8F0", borderRadius: "9999px", overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${p.progress}%`,
                              height: "100%",
                              backgroundColor: p.progress >= p.plan ? "#059669" : "#DC2626",
                              borderRadius: "9999px"
                            }}
                          />
                        </div>
                        <span style={{ fontWeight: 800, color: "#0F172A", fontSize: "12px" }}>{p.progress}%</span>
                        <span style={{ fontSize: "11px", color: "#94A3B8" }}>(tgt: {p.plan}%)</span>
                      </div>
                    </td>

                    <td style={{ padding: "16px" }}>
                      <span 
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          borderRadius: "9999px",
                          padding: "4px 12px",
                          fontSize: "11px",
                          fontWeight: 800,
                          backgroundColor: deviasi > 0 ? "#ECFDF5" : deviasi === 0 ? "#EFF6FF" : "#FEF2F2",
                          color: deviasi > 0 ? "#059669" : deviasi === 0 ? "#2563EB" : "#DC2626"
                        }}
                      >
                        <span style={{ height: "6px", width: "6px", borderRadius: "9999px", backgroundColor: deviasi > 0 ? "#059669" : deviasi === 0 ? "#2563EB" : "#DC2626" }} />
                        {deviasi > 0 ? `+${deviasi}% Ahead` : deviasi === 0 ? "On Schedule" : `${deviasi}% Delay`}
                      </span>
                    </td>

                    <td style={{ padding: "16px", textAlign: "center" }}>
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
                          fontWeight: 700,
                          textDecoration: "none"
                        }}
                      >
                        Kurva-S
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

"use client";
import Link from "next/link";
import {
  BarChart3, Layers, Building2, FileText, Award,
  ShieldAlert, ArrowRight, Sparkles, ChevronRight
} from "lucide-react";

const QUICK_MODULES = [
  {
    title: "Dashboard Analitik",
    desc: "Visualisasi real-time progres fisik, realisasi keuangan, dan kepatuhan 40 kecamatan.",
    icon: BarChart3,
    badge: "Monitoring Terpadu",
    href: "/dashboard",
    color: "#1B3061",
    bg: "rgba(27, 48, 97, 0.08)",
  },
  {
    title: "WebGIS Geospasial",
    desc: "Peta spasial interaktif sebaran lokasi paket konstruksi dan konsentrasi BUJK daerah.",
    icon: Layers,
    badge: "Peta 40 Kecamatan",
    href: "/webgis",
    color: "#059669",
    bg: "rgba(5, 150, 105, 0.08)",
  },
  {
    title: "Direktori BUJK",
    desc: "Pangkalan data 416 badan usaha konstruksi terdaftar, profil NIB, dan klasifikasi SBU.",
    icon: Building2,
    badge: "416 Badan Usaha",
    href: "/bujk",
    color: "#2563EB",
    bg: "rgba(37, 99, 235, 0.08)",
  },
  {
    title: "Pelaporan Tertib Jakon",
    desc: "Digitalisasi audit berkala 5 pilar pengawasan sesuai amanat PP No. 14 Tahun 2021.",
    icon: FileText,
    badge: "Audit SIMAK",
    href: "/pelaporan",
    color: "#D97706",
    bg: "rgba(217, 119, 6, 0.08)",
  },
  {
    title: "Pelatihan & Sertifikasi",
    desc: "Fasilitasi bimtek SMKK dan uji sertifikasi kompetensi tenaga kerja konstruksi daerah.",
    icon: Award,
    badge: "Tenaga Ahli & Terampil",
    href: "/pelatihan",
    color: "#7C3AED",
    bg: "rgba(124, 58, 237, 0.08)",
  },
  {
    title: "Pengawasan K3 & Insiden",
    desc: "Pencatatan insiden kerja konstruksi dan monitoring kepatuhan standar keselamatan SMKK.",
    icon: ShieldAlert,
    badge: "Zero Accident",
    href: "/kecelakaan",
    color: "#E11D48",
    bg: "rgba(225, 29, 72, 0.08)",
  },
];

export default function QuickAccessCards() {
  return (
    <section style={{ padding: "40px 0 60px", background: "#FFFFFF", position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              background: "rgba(27,48,97,0.08)",
              color: "#1B3061",
              borderRadius: 99,
              fontSize: "0.7rem",
              fontWeight: 800,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              marginBottom: 8,
            }}>
              <Sparkles size={13} /> Akses Cepat Modul Utama
            </div>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#0F172A", margin: "0 0 6px 0", letterSpacing: "-0.5px" }}>
              Layanan Utama SIJAKON Kabupaten Bogor
            </h2>
            <p style={{ fontSize: "0.92rem", color: "#64748B", margin: 0, maxWidth: 600 }}>
              Pintas langsung menuju modul pengawasan, basis data perizinan, dan pemetaan proyek.
            </p>
          </div>

          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.82rem",
              fontWeight: 800,
              color: "#1B3061",
              textDecoration: "none",
              background: "#F1F5F9",
              padding: "8px 16px",
              borderRadius: 99,
              transition: "all 0.2s ease",
            }}
          >
            <span>Buka Dashboard</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* 6 Cards Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
        }}>
          {QUICK_MODULES.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <Link
                key={i}
                href={mod.href}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: 20,
                  padding: "24px 22px",
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.25s ease",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = mod.color;
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 14px 30px ${mod.color}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E2E8F0";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.03)";
                }}
              >
                {/* Top strip accent */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: mod.color,
                  opacity: 0.8,
                }} />

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: mod.bg,
                      color: mod.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Icon size={24} />
                    </div>
                    <span style={{
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      color: mod.color,
                      background: mod.bg,
                      padding: "4px 10px",
                      borderRadius: 99,
                      letterSpacing: "0.4px",
                      textTransform: "uppercase",
                    }}>
                      {mod.badge}
                    </span>
                  </div>

                  <h3 style={{
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: "#0F172A",
                    margin: "0 0 8px 0",
                  }}>
                    {mod.title}
                  </h3>

                  <p style={{
                    fontSize: "0.85rem",
                    color: "#64748B",
                    lineHeight: 1.55,
                    margin: "0 0 20px 0",
                  }}>
                    {mod.desc}
                  </p>
                </div>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 12,
                  borderTop: "1px solid #F1F5F9",
                }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 800, color: mod.color, display: "flex", alignItems: "center", gap: 6 }}>
                    Akses Modul <ArrowRight size={14} />
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#10B981", fontWeight: 700 }}>
                    Sistem Aktif
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

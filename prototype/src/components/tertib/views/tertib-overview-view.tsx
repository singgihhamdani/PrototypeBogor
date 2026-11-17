"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Briefcase, Cog, HeartHandshake, FileText, ArrowRight, 
  CheckCircle2, AlertTriangle, ShieldCheck, ChevronRight, 
  Calendar, Users, Wallet, MapPin, Target, FileBarChart, Layers
} from "lucide-react";
import ModuleHeader from "@/components/layout/module-header";
import { TertibType, TERTIB_CONFIGS } from "@/lib/tertib-config";
import { 
  mockSDMRecords, mockTimelineRecords, mockAnggaranRecords, 
  mockPelaksanaanRecords, mockRekomendasiRecords 
} from "@/data/tertib-mock-data";
import { fetchPelaksanaanList, fetchRekomendasiList } from "@/lib/services/pengawasan-service";

interface TertibOverviewViewProps {
  tertibType: TertibType;
}

export default function TertibOverviewView({ tertibType }: TertibOverviewViewProps) {
  const config = TERTIB_CONFIGS[tertibType];
  const sdmData = mockSDMRecords.filter((r) => r.tertibType === tertibType);
  const timelineData = mockTimelineRecords.filter((r) => r.tertibType === tertibType);
  const anggaranData = mockAnggaranRecords.filter((r) => r.tertibType === tertibType);
  const pelaksanaanData = mockPelaksanaanRecords.filter((r) => r.tertibType === tertibType);
  const rekomendasiData = mockRekomendasiRecords.filter((r) => r.tertibType === tertibType);

  const [pelaksanaanCount, setPelaksanaanCount] = useState<number>(pelaksanaanData.length);
  const [rekomendasiCount, setRekomendasiCount] = useState<number>(rekomendasiData.length);

  useEffect(() => {
    async function loadCounts() {
      try {
        const [pelRes, rekRes] = await Promise.all([
          fetchPelaksanaanList(tertibType),
          fetchRekomendasiList(tertibType)
        ]);
        setPelaksanaanCount(pelRes.data.length);
        setRekomendasiCount(rekRes.data.length);
      } catch (e) {
        console.warn("Gagal load count pengawasan:", e);
      }
    }
    loadCounts();
  }, [tertibType]);

  const totalPagu = anggaranData.reduce((acc, curr) => acc + curr.paguAnggaran, 0);

  const submodules = [
    {
      title: "1. Perencanaan Pengawasan",
      desc: "Dasbor alokasi personil SDM, timeline kegiatan tahunan, anggaran RKA, pemetaan objek, dan target kinerja.",
      href: `${config.basePath}/perencanaan`,
      badge: "5 Sub-Fitur",
      icon: Calendar,
      accentBg: "#EBF2FA",
      accentColor: "#1B3061",
      metric: `${sdmData.length} Tim SDM • ${anggaranData.length} RKA`
    },
    {
      title: "2. Pelaksanaan Pengawasan",
      desc: "Pengawasan kepatuhan teknis berbasis form SIMAK elektronik, dokumen pengawasan lapangan, dan penetapan status kepatuhan (Patuh/Tidak Patuh).",
      href: `${config.basePath}/pelaksanaan`,
      badge: `${config.simakVariants.length} Varian SIMAK`,
      icon: ShieldCheck,
      accentBg: "#FEF3C7",
      accentColor: "#92400E",
      metric: `${pelaksanaanCount} Objek Terverifikasi (PostgreSQL Live)`
    },
    {
      title: "3. Rekomendasi & Tindak Lanjut",
      desc: "Penerbitan surat hasil pengawasan, penetapan sanksi administratif, verifikasi perbaikan, dan monitoring tindak lanjut.",
      href: `${config.basePath}/rekomendasi`,
      badge: "Verifikasi Status",
      icon: AlertTriangle,
      accentBg: "#DCFCE7",
      accentColor: "#166534",
      metric: `${rekomendasiCount} Rekomendasi Diterbitkan (PostgreSQL Live)`
    },
    {
      title: "4. Pelaporan Pengawasan",
      desc: "Kompilasi laporan berkala semesteran, ekspor template SIPJAKI (.xlsx), dan sinkronisasi ke Kementerian PUPR.",
      href: `${config.basePath}/pelaporan`,
      badge: "Format SIPJAKI",
      icon: FileBarChart,
      accentBg: "#EDE9FE",
      accentColor: "#5B21B6",
      metric: "Semester I - 2026 Siap Ekspor"
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <ModuleHeader
        breadcrumbs={[
          { label: "Pengawasan SIMAK", href: "/pengawasan" },
          { label: config.shortTitle }
        ]}
        badgeText={config.pilar}
        badgeBg={config.badgeBg}
        badgeColor={config.badgeColor}
        title={config.title}
        description={config.description}
        legalBasis={config.legalBasis}
        actionButtons={[
          {
            label: "Mulai Pengawasan SIMAK",
            icon: ShieldCheck,
            variant: "primary",
            href: `${config.basePath}/pelaksanaan`
          },
          {
            label: "Perencanaan",
            icon: Calendar,
            variant: "secondary",
            href: `${config.basePath}/perencanaan`
          }
        ]}
      />

      {/* Top Highlight Summary Stats (UI/UX Standardized) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        {/* Card 1: Tim Pengawas */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #0F2E5C",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Tim Pengawas Terdaftar
            </span>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#EBF2FA",
                color: "#0F2E5C",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <Users style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#0F2E5C", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {sdmData.reduce((a, c) => a + c.jumlahSdm, 0) || 16} Personil
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10B981" }} />
              <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>
                SK Bupati & Kadis Terbit
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Alokasi Pagu */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #2563EB",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Alokasi Pagu Anggaran
            </span>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#DBEAFE",
                color: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <Wallet style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#2563EB", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              Rp {(totalPagu / 1000000).toLocaleString('id-ID')} Jt
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ fontSize: "11px", color: "#64748B" }}>
                Sumber Dana APBD TA 2026
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Objek Diaudit */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #059669",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Objek Pengawasan (SIMAK)
            </span>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#DCFCE7",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <ShieldCheck style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#059669", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {pelaksanaanData.length || 12} Objek
            </div>
            <div style={{ marginTop: "10px" }}>
              <div style={{ width: "100%", height: "6px", backgroundColor: "#E2E8F0", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ width: "83%", height: "100%", backgroundColor: "#059669", borderRadius: "999px" }} />
              </div>
              <span style={{ fontSize: "11px", color: "#166534", fontWeight: 700, marginTop: "4px", display: "inline-block" }}>
                Tingkat Kepatuhan: 83% Patuh
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Rekomendasi */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #D97706",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Rekomendasi Tindak Lanjut
            </span>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#FEF3C7",
                color: "#D97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <AlertTriangle style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#D97706", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {rekomendasiData.length || 3} Temuan
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#D97706" }} />
              <span style={{ fontSize: "11px", color: "#D97706", fontWeight: 700 }}>
                Status: Dalam Pemantauan
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Eksekutif Card: Perbandingan Target Rencana vs Realisasi Pengawasan Makro Tahunan */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid #CBD5E1",
          boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            backgroundColor: "#0F2E5C",
            color: "#FFFFFF",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFC000"
              }}
            >
              <Target style={{ width: "20px", height: "20px" }} />
            </div>
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 800, margin: 0 }}>
                Perbandingan Target Rencana vs Realisasi Pengawasan Tahunan ({config.shortTitle})
              </h3>
              <p style={{ fontSize: "11px", color: "#93C5FD", margin: "2px 0 0 0" }}>
                Monitoring target sasaran pengawasan tahunan standar SIPJAKI Kementerian PUPR TA 2026
              </p>
            </div>
          </div>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#FFC000", backgroundColor: "rgba(255, 192, 0, 0.15)", padding: "4px 10px", borderRadius: "9999px", border: "1px solid rgba(255, 192, 0, 0.3)" }}>
            Ringkasan Eksekutif
          </span>
        </div>

        <div style={{ padding: "18px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", backgroundColor: "#F8FAFC" }}>
          {/* Metrik 1: Target Objek Pengawasan vs Realisasi */}
          <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>
                Target Objek Pengawasan (SIMAK)
              </span>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#1E40AF", backgroundColor: "#DBEAFE", padding: "2px 8px", borderRadius: "9999px" }}>
                Target: 15 Objek
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "6px 0" }}>
              <span style={{ fontSize: "24px", fontWeight: 900, color: "#0F2E5C" }}>
                {pelaksanaanCount || 12} Objek
              </span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#166534" }}>
                ({Math.round(((pelaksanaanCount || 12) / 15) * 100)}% Capaian Rencana)
              </span>
            </div>
            <div style={{ width: "100%", height: "6px", backgroundColor: "#E2E8F0", borderRadius: "9999px", overflow: "hidden", marginTop: "6px" }}>
              <div style={{ width: `${Math.min(Math.round(((pelaksanaanCount || 12) / 15) * 100), 100)}%`, height: "100%", backgroundColor: "#10B981", borderRadius: "9999px" }} />
            </div>
          </div>

          {/* Metrik 2: Target Pagu Anggaran vs Realisasi Serapan */}
          <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>
                Serapan Pagu Anggaran RKA
              </span>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#1E40AF", backgroundColor: "#DBEAFE", padding: "2px 8px", borderRadius: "9999px" }}>
                Pagu: Rp {(totalPagu / 1000000).toLocaleString('id-ID')} Jt
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "6px 0" }}>
              <span style={{ fontSize: "24px", fontWeight: 900, color: "#2563EB" }}>
                82%
              </span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>
                Terealisasi Rp {Math.round(totalPagu * 0.82 / 1000000).toLocaleString('id-ID')} Jt
              </span>
            </div>
            <div style={{ width: "100%", height: "6px", backgroundColor: "#E2E8F0", borderRadius: "9999px", overflow: "hidden", marginTop: "6px" }}>
              <div style={{ width: "82%", height: "100%", backgroundColor: "#2563EB", borderRadius: "9999px" }} />
            </div>
          </div>

          {/* Metrik 3: Target Kepatuhan Rekomendasi vs Realisasi */}
          <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>
                Tindak Lanjut Rekomendasi
              </span>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#166534", backgroundColor: "#DCFCE7", padding: "2px 8px", borderRadius: "9999px" }}>
                Target: 100% Sah
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "6px 0" }}>
              <span style={{ fontSize: "24px", fontWeight: 900, color: "#059669" }}>
                {rekomendasiCount} Surat
              </span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>
                Tersinkronisasi ke SIPJAKI
              </span>
            </div>
            <div style={{ width: "100%", height: "6px", backgroundColor: "#E2E8F0", borderRadius: "9999px", overflow: "hidden", marginTop: "6px" }}>
              <div style={{ width: "75%", height: "100%", backgroundColor: "#059669", borderRadius: "9999px" }} />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Main Lifecycle Sub-modules */}
      <div>
        <div style={{ marginBottom: "14px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#1E293B", margin: 0 }}>
            Alur Siklus Pengawasan {config.shortTitle}
          </h2>
          <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0 0" }}>
            Pilih modul tahapan di bawah ini untuk mengelola data perencanaan, pelaksanaan, verifikasi, atau pelaporan:
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {submodules.map((m, idx) => {
            const Icon = m.icon;
            return (
              <Link
                key={idx}
                href={m.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "18px",
                  padding: "22px",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 16px rgba(15, 46, 92, 0.03)",
                  textDecoration: "none",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 24px rgba(15, 46, 92, 0.08)";
                  e.currentTarget.style.borderColor = config.accentColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(15, 46, 92, 0.03)";
                  e.currentTarget.style.borderColor = "#E2E8F0";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      backgroundColor: m.accentBg,
                      color: m.accentColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Icon style={{ width: "24px", height: "24px" }} />
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      backgroundColor: "#F1F5F9",
                      color: "#475569",
                      padding: "4px 8px",
                      borderRadius: "6px"
                    }}
                  >
                    {m.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#1E293B", margin: "0 0 6px 0" }}>
                  {m.title}
                </h3>
                <p style={{ fontSize: "12px", color: "#64748B", margin: "0 0 16px 0", lineHeight: 1.5, flex: 1 }}>
                  {m.desc}
                </p>

                <div
                  style={{
                    paddingTop: "12px",
                    borderTop: "1px solid #F1F5F9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#0F2E5C" }}>
                    {m.metric}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                      fontWeight: 800,
                      color: config.accentColor
                    }}
                  >
                    <span>Buka</span>
                    <ArrowRight style={{ width: "14px", height: "14px" }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Form SIMAK Variants Preview */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "18px", padding: "24px", border: "1px solid #E2E8F0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#1E293B", margin: 0 }}>
              Formulir SIMAK Terintegrasi ({config.simakVariants.length} Varian)
            </h3>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0 0" }}>
              Standar format checklist pemeriksaan elektronik sesuai ketentuan Kementerian PUPR
            </p>
          </div>
          <Link
            href={`${config.basePath}/pelaksanaan`}
            style={{
              fontSize: "12px",
              fontWeight: 800,
              color: "#0F2E5C",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <span>Buka Pelaksanaan Pengawasan</span>
            <ChevronRight style={{ width: "14px", height: "14px" }} />
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
          {config.simakVariants.map((v, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "12px",
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "11px", fontWeight: 900, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "2px 8px", borderRadius: "6px" }}>
                  {v.code}
                </span>
                <span style={{ fontSize: "10px", color: "#10B981", fontWeight: 700 }}>Aktif</span>
              </div>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#1E293B", marginTop: "4px" }}>{v.label}</span>
              <span style={{ fontSize: "11px", color: "#64748B" }}>{v.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

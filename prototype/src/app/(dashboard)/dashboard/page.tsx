"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Building2, Package, GraduationCap, ShieldCheck, TrendingUp, 
  AlertTriangle, Users, Landmark, FileBarChart, ArrowUpRight, CheckCircle2,
  MapPin, ChevronRight, Database as DbIcon, Calendar, ArrowUpDown, 
  Download, Upload, RefreshCw, Printer, Sparkles, PieChart, Layers
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/mock-auth";
import ExecutiveDashboardView from "@/components/dashboard/executive-dashboard-view";
import NestedDoughnutChart from "@/components/dashboard/nested-doughnut-chart";
import SipjakiWeightTable from "@/components/dashboard/sipjaki-weight-table";
import BackupRestoreModal from "@/components/dashboard/backup-restore-modal";
import { fetchDashboardStats, DashboardStats } from "@/lib/services/master-data";
import { getSipjakiDataByYear, SIPJAKI_YEARLY_DATA } from "@/lib/services/sipjaki-dashboard-scoring";
import { createClient } from "@/lib/supabase/client";

function GaugeCircle({ value, size = 80, strokeWidth = 8, color = "#0F2E5C" }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
      />
    </svg>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // State Pilihan Tahun Anggaran (Default: TA 2026)
  const [selectedYear, setSelectedYear] = useState<string>("2026");

  // State Modal Backup & Restore
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Ambil data SIPJAKI sesuai tahun yang dipilih
  const currentSipjakiData = useMemo(() => {
    return getSipjakiDataByYear(selectedYear);
  }, [selectedYear]);

  const loadData = () => {
    fetchDashboardStats().then((res) => {
      setStats(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();

    // Supabase Realtime subscription
    const client = createClient();
    if (client) {
      const channel = client
        .channel("realtime-dashboard-stats")
        .on("postgres_changes", { event: "*", schema: "public", table: "bujk" }, () => {
          loadData();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "paket_pekerjaan" }, () => {
          loadData();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "tkk" }, () => {
          loadData();
        })
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
  }, []);

  // 1. Tampilan Khusus Eksekutif
  if (user?.role === "EKSEKUTIF") {
    return <ExecutiveDashboardView />;
  }

  // 2. Redirect Notice jika Operator BUJK membuka dashboard dinas
  if (user?.role === "OPERATOR_BUJK") {
    return (
      <div 
        style={{
          borderRadius: "20px",
          backgroundColor: "#FFFFFF",
          border: "2px solid #FED7AA",
          padding: "36px",
          textAlign: "center",
          maxWidth: "680px",
          margin: "40px auto",
          boxShadow: "0 10px 25px -5px rgba(234, 88, 12, 0.15)"
        }}
      >
        <div style={{ width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#FFEDD5", color: "#C2410C", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
          <Building2 style={{ width: "30px", height: "30px" }} />
        </div>
        <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
          Portal Khusus Badan Usaha (BUJK)
        </h2>
        <p style={{ fontSize: "13px", color: "#64748B", margin: "8px 0 20px 0", lineHeight: 1.5 }}>
          Anda sedang login sebagai <strong>{user.bujkName || "Badan Usaha"}</strong>. Halaman ini adalah modul operasional dinas internal. Silakan buka portal terdedikasi Anda untuk mengelola SBU, proyek, dan pelaporan SIMAK.
        </p>
        <Link
          href="/portal/bujk"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            borderRadius: "12px",
            backgroundColor: "#EA580C",
            color: "#FFFFFF",
            fontSize: "13px",
            fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(234, 88, 12, 0.3)"
          }}
        >
          <span>Buka Portal Rekanan BUJK</span>
          <ArrowUpRight style={{ width: "16px", height: "16px" }} />
        </Link>
      </div>
    );
  }

  // 3. Redirect Notice jika Peserta TKK membuka dashboard dinas
  if (user?.role === "PESERTA_TKK") {
    return (
      <div 
        style={{
          borderRadius: "20px",
          backgroundColor: "#FFFFFF",
          border: "2px solid #BAE6FD",
          padding: "36px",
          textAlign: "center",
          maxWidth: "680px",
          margin: "40px auto",
          boxShadow: "0 10px 25px -5px rgba(2, 132, 199, 0.15)"
        }}
      >
        <div style={{ width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#E0F2FE", color: "#0284C7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
          <GraduationCap style={{ width: "30px", height: "30px" }} />
        </div>
        <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
          Portal Khusus Peserta Pelatihan TKK
        </h2>
        <p style={{ fontSize: "13px", color: "#64748B", margin: "8px 0 20px 0", lineHeight: 1.5 }}>
          Anda sedang login sebagai peserta sertifikasi: <strong>{user.name}</strong>. Silakan akses portal peserta untuk melihat jadwal modul pelatihan dan mengunduh E-Sertifikat SKK digital.
        </p>
        <Link
          href="/portal/peserta"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            borderRadius: "12px",
            backgroundColor: "#0284C7",
            color: "#FFFFFF",
            fontSize: "13px",
            fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)"
          }}
        >
          <span>Buka Portal Peserta TKK</span>
          <ArrowUpRight style={{ width: "16px", height: "16px" }} />
        </Link>
      </div>
    );
  }

  // 4. Summary Metric Cards (Nama Baru: Pelatihan dan Sertifikasi)
  const summaryCards = [
    { 
      label: "Total BUJK Terdaftar", 
      value: stats ? String(stats.bujk.total) : "11", 
      sub: stats ? `${stats.bujk.besar} Besar · ${stats.bujk.menengah} Menengah · ${stats.bujk.kecil} Kecil` : "4 Besar · 2 Menengah · 5 Kecil", 
      badge: stats?.source === "supabase" ? "PostgreSQL (Live)" : "Data Lokal",
      badgeBg: "#ECFDF5",
      badgeColor: "#059669",
      icon: Building2, 
      iconBg: "#EBF2FA",
      iconColor: "#0F2E5C"
    },
    { 
      label: `Paket Pekerjaan TA ${selectedYear}`, 
      value: stats ? String(stats.paket.total) : "10", 
      sub: stats ? `Akumulasi Nilai: Rp ${stats.paket.nilaiTotalMiliar} Miliar` : "Akumulasi Nilai: Rp 41.7 Miliar", 
      badge: stats ? `${stats.paket.pelaksanaan} Pelaksanaan` : "7 Pelaksanaan",
      badgeBg: "#EFF6FF",
      badgeColor: "#2563EB",
      icon: Package, 
      iconBg: "#EFF6FF",
      iconColor: "#2563EB"
    },
    { 
      label: "Pelatihan dan Sertifikasi TKK", 
      value: stats ? String(stats.tkk.total) : "5", 
      sub: stats ? `Target Awal: ${stats.tkk.target} Tenaga Kerja` : "Target Awal: 50 Tenaga Kerja", 
      badge: stats ? `${stats.tkk.percent}% Target` : "10% Target",
      badgeBg: "#FFFBEB",
      badgeColor: "#B45309",
      icon: GraduationCap, 
      iconBg: "#FFFBEB",
      iconColor: "#B45309"
    },
    { 
      label: "Tingkat Keselamatan Kerja (K3)", 
      value: "0", 
      sub: "Zero Fatal Accident di 40 Kecamatan", 
      badge: "100% Aman",
      badgeBg: "#ECFDF5",
      badgeColor: "#059669",
      icon: ShieldCheck, 
      iconBg: "#ECFDF5",
      iconColor: "#059669"
    },
  ];

  // Data Paket Pekerjaan Terkini (Default Terurut DESC berdasarkan tanggal/update terbaru)
  const recentProjects = [
    { 
      id: "P009", 
      name: "Peningkatan Jalan Poros Bojonggede - Kemang (Jl. Bomang Sta 0+000 s/d Sta 2+500)", 
      contractor: "PT. Samudra Beton Persada", 
      progress: 74.5, 
      plan: 70, 
      value: "Rp 14,85 M", 
      status: "Ahead", 
      district: "Kemang",
      tanggalUpdate: "2026-11-16"
    },
    { 
      id: "P001", 
      name: "Rekonstruksi Jalan Raya Cibinong - Citeureup Sta 0+000 s/d 4+200", 
      contractor: "PT Bangun Jaya Konstruksi", 
      progress: 68, 
      plan: 60, 
      value: "Rp 8,50 M", 
      status: "Ahead", 
      district: "Cibinong",
      tanggalUpdate: "2026-10-24"
    },
    { 
      id: "P002", 
      name: "Pembangunan Gedung PAUD Terpadu & Prasarana Kec. Gunung Putri", 
      contractor: "CV Karya Mandiri Utama", 
      progress: 82, 
      plan: 80, 
      value: "Rp 3,20 M", 
      status: "Ahead", 
      district: "Gunung Putri",
      tanggalUpdate: "2026-09-18"
    },
    { 
      id: "P003", 
      name: "Peningkatan Jalan Lingkungan & Drainase Desa Sukamahi", 
      contractor: "PT Mitra Pembangunan Nusantara", 
      progress: 90, 
      plan: 90, 
      value: "Rp 1,85 M", 
      status: "On Track", 
      district: "Cileungsi",
      tanggalUpdate: "2026-08-15"
    },
    { 
      id: "P005", 
      name: "Rehabilitasi Jembatan Sungai Cikeas Bentang 24 Meter", 
      contractor: "PT Infrastruktur Bogor Raya", 
      progress: 58, 
      plan: 60, 
      value: "Rp 12,50 M", 
      status: "On Track", 
      district: "Ciawi",
      tanggalUpdate: "2026-07-20"
    },
    { 
      id: "P004", 
      name: "Pembangunan Drainase Primer & Saluran Pengelak Kec. Parung", 
      contractor: "CV Teknik Sejahtera", 
      progress: 45, 
      plan: 60, 
      value: "Rp 950 Jt", 
      status: "Behind", 
      district: "Parung",
      tanggalUpdate: "2026-06-10"
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* 1. Executive Banner Hero Card dengan Dropdown Tahun Anggaran & Toolbar Backup/Restore */}
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
          {/* Baris Badge Status */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "9999px", backgroundColor: "rgba(255,255,255,0.12)", padding: "6px 14px", fontSize: "11px", fontWeight: 700, color: "#FFC000", border: "1px solid rgba(255,255,255,0.15)" }}>
                <Landmark style={{ width: "14px", height: "14px" }} />
                <span>DPU KABUPATEN BOGOR • WILAYAH PEMBINAAN 40 KECAMATAN</span>
              </div>

              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "9999px", backgroundColor: "rgba(255, 192, 0, 0.15)", padding: "6px 12px", fontSize: "11px", fontWeight: 800, color: "#FFC000", border: "1px solid rgba(255, 192, 0, 0.3)" }}>
                <ShieldCheck style={{ width: "13px", height: "13px" }} />
                <span>Sesi: {user?.roleLabel || "Super Admin"}</span>
              </div>

              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "9999px", backgroundColor: stats?.source === "supabase" ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)", padding: "6px 12px", fontSize: "11px", fontWeight: 800, color: stats?.source === "supabase" ? "#A7F3D0" : "#FDE68A", border: `1px solid ${stats?.source === "supabase" ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.4)"}` }}>
                <DbIcon style={{ width: "12px", height: "12px" }} />
                <span>{stats?.source === "supabase" ? "PostgreSQL (Live)" : "Cache Lokal"}</span>
              </div>
            </div>

            {/* Dropdown Filter Laporan per Tahun (Auto-Reset Data) */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(255,255,255,0.12)", padding: "4px 8px 4px 14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)" }}>
              <Calendar style={{ width: "14px", height: "14px", color: "#FFC000" }} />
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#FFC000", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                TAHUN ANGGARAN:
              </span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{
                  backgroundColor: "#0F2E5C",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontSize: "12px",
                  fontWeight: 800,
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="2026">TA 2026 (Pelaksanaan Aktif)</option>
                <option value="2025">TA 2025 (Arsip Tahunan)</option>
                <option value="2024">TA 2024 (Arsip Historis)</option>
              </select>
            </div>
          </div>

          {/* Judul & Deskripsi Banner */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.5px", margin: 0, lineHeight: 1.25 }}>
              Dashboard Pembinaan & Pengawasan Jasa Konstruksi
            </h1>
            <p style={{ fontSize: "14px", color: "#CBD5E1", margin: 0, lineHeight: 1.6, maxWidth: "850px" }}>
              Monitoring kepatuhan 5 Pilar Jasa Konstruksi, pelaksanaan pengawasan terstandar SIMAK (Tertib Usaha, Penyelenggaraan, dan Pemanfaatan), serta harmonisasi pembobotan indikator SIPJAKI Kementerian PUPR TA {selectedYear}.
            </p>
          </div>

          {/* Action Toolbar Banner: WebGIS, Backup, Restore & Cetak */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "8px", flexWrap: "wrap" }}>
            <Link
              href="/webgis"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                color: "#FFFFFF",
                padding: "9px 18px",
                fontSize: "12px",
                fontWeight: 700,
                textDecoration: "none",
                border: "1px solid rgba(255, 255, 255, 0.25)"
              }}
            >
              <MapPin style={{ width: "15px", height: "15px", color: "#FFC000" }} />
              <span>Buka Peta WebGIS (40 Kec)</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsBackupModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 192, 0, 0.18)",
                color: "#FFC000",
                padding: "9px 18px",
                fontSize: "12px",
                fontWeight: 800,
                border: "1px solid rgba(255, 192, 0, 0.4)",
                cursor: "pointer"
              }}
            >
              <Download style={{ width: "15px", height: "15px" }} />
              <span>Cadangkan Data (Backup)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBackupModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                color: "#FFFFFF",
                padding: "9px 18px",
                fontSize: "12px",
                fontWeight: 700,
                border: "1px solid rgba(255, 255, 255, 0.25)",
                cursor: "pointer"
              }}
            >
              <Upload style={{ width: "15px", height: "15px" }} />
              <span>Pulihkan Data (Restore)</span>
            </button>

            <button
              type="button"
              onClick={() => alert(`Mencetak Laporan Kinerja Pengawasan Jasa Konstruksi TA ${selectedYear} (Format Eksekutif SIPJAKI)...`)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                color: "#FFFFFF",
                padding: "9px 18px",
                fontSize: "12px",
                fontWeight: 700,
                border: "1px solid rgba(255, 255, 255, 0.25)",
                cursor: "pointer"
              }}
            >
              <Printer style={{ width: "15px", height: "15px", color: "#93C5FD" }} />
              <span>Cetak Laporan TA {selectedYear}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 4 Summary Metric Cards (UI/UX Standardized) */}
      <div 
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px"
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
                borderTop: `3px solid ${card.iconColor}`,
                backgroundColor: "#FFFFFF",
                padding: "20px",
                boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {card.label}
                  </span>
                </div>
                <div 
                  style={{
                    height: "40px",
                    width: "40px",
                    borderRadius: "10px",
                    backgroundColor: card.iconBg,
                    color: card.iconColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <Icon style={{ width: "20px", height: "20px" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "28px", fontWeight: 900, color: card.iconColor === "#0F2E5C" ? "#0F2E5C" : card.iconColor, letterSpacing: "-0.5px", lineHeight: 1 }}>
                    {card.value}
                  </span>
                  {card.badge && (
                    <span 
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "6px",
                        backgroundColor: card.badgeBg || card.iconBg,
                        color: card.badgeColor || card.iconColor,
                        whiteSpace: "nowrap",
                        lineHeight: 1.2
                      }}
                    >
                      {card.badge}
                    </span>
                  )}
                </div>

                <p 
                  style={{ 
                    fontSize: "12px", 
                    color: "#64748B", 
                    margin: "10px 0 0 0", 
                    lineHeight: 1.4,
                    fontWeight: 500
                  }}
                >
                  {card.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. GRAFIS 2: INDEKS TOTAL KOMPOSIT SIPJAKI (Nested Doughnut Chart & Tabel Bobot Excel) */}
      <div 
        style={{
          borderRadius: "18px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          padding: "24px 28px",
          boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
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
                Indeks Kinerja Komposit 5 Pilar Jasa Konstruksi (SIPJAKI TA {selectedYear})
              </h2>
            </div>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0 0" }}>
              Perhitungan matematis bobot disepakati: 20% Tertib Usaha, 30% Tertib Penyelenggaraan, 20% Tertib Pemanfaatan, 15% SIPJAKI, dan 15% Pelatihan TKK
            </p>
          </div>
          <span 
            style={{
              fontSize: "12px",
              fontWeight: 800,
              color: currentSipjakiData.predikatColor,
              backgroundColor: currentSipjakiData.predikatBadgeBg,
              padding: "6px 14px",
              borderRadius: "10px",
              border: `1px solid ${currentSipjakiData.predikatColor}30`
            }}
          >
            Indeks Pengawasan: {currentSipjakiData.totalIndeksPengawasan.toFixed(2)}% (Kategori {currentSipjakiData.predikat})
          </span>
        </div>

        {/* Konten Grid: Grafis Nested Doughnut di Kiri, Tabel Bobot Resmi di Kanan */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "28px", alignItems: "center" }}>
          {/* Kolom Kiri: Double Doughnut Chart */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px" }}>
            <NestedDoughnutChart data={currentSipjakiData} size={300} />
            <p style={{ fontSize: "12px", color: "#475569", textAlign: "center", marginTop: "14px", maxWidth: "340px", lineHeight: 1.5 }}>
              {currentSipjakiData.ringkasanKinerja}
            </p>
          </div>

          {/* Kolom Kanan: Tabel Format Excel Resmi */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Tabel Matriks Bobot & Capaian Pengawasan
              </span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#0F2E5C" }}>
                Total Target: {currentSipjakiData.totalTarget} • Realisasi: {currentSipjakiData.totalRealisasi}
              </span>
            </div>
            <SipjakiWeightTable data={currentSipjakiData} />
          </div>
        </div>
      </div>

      {/* 4. GRAFIS 1: BREAKDOWN 5 PILAR SIPJAKI (Target vs Realisasi & Capaian Masing-Masing) */}
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
              <div style={{ height: "10px", width: "10px", borderRadius: "9999px", backgroundColor: "#2563EB" }} />
              <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                Rincian Capaian per Pilar Pengawasan (Target Rencana vs Realisasi Lapangan)
              </h2>
            </div>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0 0" }}>
              Visualisasi persentase realisasi terhadap target perencanaan beserta nilai kontribusi bobot pilar
            </p>
          </div>
          <span 
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#64748B",
              backgroundColor: "#F8FAFC",
              padding: "4px 10px",
              borderRadius: "6px",
              border: "1px solid #E2E8F0"
            }}
          >
            Tahun Pelaksanaan: TA {selectedYear}
          </span>
        </div>

        {/* 5 Cards Pilar Responsif dengan Indikator Capaian Lengkap */}
        <div 
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px"
          }}
        >
          {currentSipjakiData.pilar.map((pilar) => {
            return (
              <div 
                key={pilar.key} 
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "20px 14px",
                  borderRadius: "14px",
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  gap: "10px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
                }}
              >
                {/* Circular Gauge */}
                <div style={{ position: "relative", marginBottom: "2px" }}>
                  <GaugeCircle value={pilar.indeksRealisasi} size={84} strokeWidth={8} color={pilar.color} />
                  <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", fontWeight: 900, color: "#0F172A" }}>
                    {pilar.indeksRealisasi.toFixed(0)}%
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", margin: 0, lineHeight: 1.25 }}>
                    {pilar.label}
                  </p>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: pilar.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Bobot: {pilar.bobotKumulatif}%
                  </span>
                </div>

                {/* Subteks Target vs Realisasi */}
                <div style={{ backgroundColor: "#FFFFFF", padding: "6px 10px", borderRadius: "8px", border: "1px solid #E2E8F0", width: "100%" }}>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C" }}>
                    Realisasi: {pilar.realisasi} / {pilar.target}
                  </div>
                  <div style={{ fontSize: "10px", color: "#64748B", marginTop: "1px" }}>
                    Poin: {pilar.indeksPengawasan.toFixed(2)}%
                  </div>
                </div>

                {/* Status Badge */}
                <span 
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: "6px",
                    backgroundColor: "#FFFFFF",
                    border: `1px solid ${pilar.color}40`,
                    color: pilar.color,
                    marginTop: "2px"
                  }}
                >
                  {pilar.statusKepatuhan}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Tabel Paket Pekerjaan Konstruksi Terkini (Default Sort DESC) */}
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
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                Paket Pekerjaan Konstruksi Terkini
              </h2>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  backgroundColor: "#EFF6FF",
                  color: "#1D4ED8",
                  border: "1px solid #DBEAFE",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 800
                }}
              >
                <ArrowUpDown style={{ width: "12px", height: "12px" }} />
                Paket Terkini (DESC)
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0 0" }}>
              Pemantauan deviasi fisik lapangan terhadap jadwal kontrak APBD TA {selectedYear} (Urutan diperbarui terkini ke terlama)
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
                <th style={{ padding: "14px 16px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>TANGGAL UPDATE</th>
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

                    <td style={{ padding: "16px", color: "#475569", fontWeight: 600, fontSize: "11px" }}>
                      {p.tanggalUpdate}
                    </td>

                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "90px", height: "8px", backgroundColor: "#E2E8F0", borderRadius: "9999px", overflow: "hidden" }}>
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
                        Detail
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Backup & Restore Data */}
      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        selectedYear={selectedYear}
        onRestoreSuccess={() => {
          loadData();
        }}
      />

    </div>
  );
}

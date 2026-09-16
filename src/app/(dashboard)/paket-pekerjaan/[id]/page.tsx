"use client";
import { use, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, Package, Calendar, DollarSign, Building2, MapPin, 
  FileText, TrendingUp, Download, CheckCircle2, AlertTriangle, Clock
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";
import { formatCurrency } from "@/lib/utils";
import projectsData from "@/data/projects.json";
import districtsData from "@/data/districts.json";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PaketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const project = projectsData.find((p) => p.id.toLowerCase() === resolvedParams.id.toLowerCase());

  if (!project) {
    notFound();
  }

  const district = districtsData.find((d) => d.id === project.districtId);

  // Kurva-S chart data
  const months = ["M-1", "M-2", "M-3", "M-4", "M-5", "M-6", "M-7", "M-8", "M-9", "M-10", "M-11"];
  const labels = months.slice(0, project.planProgress.length);

  const chartData = useMemo(() => {
    return {
      labels,
      datasets: [
        {
          label: "Rencana Kumulatif (%)",
          data: project.planProgress,
          borderColor: "#0F2E5C",
          backgroundColor: "rgba(15, 46, 92, 0.08)",
          borderWidth: 2.5,
          borderDash: [4, 4],
          pointRadius: 4,
          pointBackgroundColor: "#0F2E5C",
          tension: 0.3,
          fill: false,
        },
        {
          label: "Realisasi Kumulatif (%)",
          data: project.realProgress.map(v => v === 0 ? null : v),
          borderColor: "#059669",
          backgroundColor: "rgba(5, 150, 105, 0.12)",
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: "#059669",
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, [labels, project.planProgress, project.realProgress]);

  const deviasi = project.physProgress - (project.planProgress[Math.min(project.planProgress.length - 1, 7)] || 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header Back & Action */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <Link
            href="/paket-pekerjaan"
            style={{
              height: "42px",
              width: "42px",
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              color: "#0F2E5C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}
          >
            <ArrowLeft style={{ width: "18px", height: "18px" }} />
          </Link>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 800, backgroundColor: "#EBF2FA", color: "#0F2E5C", padding: "3px 8px", borderRadius: "6px" }}>
                {project.id}
              </span>
              <span 
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  padding: "3px 10px",
                  borderRadius: "9999px",
                  backgroundColor: project.status === "Selesai" ? "#ECFDF5" : "#EFF6FF",
                  color: project.status === "Selesai" ? "#059669" : "#1E40AF"
                }}
              >
                {project.status}
              </span>
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#0F172A", margin: "6px 0 0 0", letterSpacing: "-0.5px" }}>
              {project.name}
            </h1>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={() => alert(`Mengunduh Berita Acara & Lembar SIPJAKI ${project.id}...`)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #CBD5E1",
              padding: "10px 18px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#334155",
              cursor: "pointer"
            }}
          >
            <Download style={{ width: "15px", height: "15px" }} /> Dokumen Kontrak
          </button>
          <Link
            href="/pengawasan"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "12px",
              backgroundColor: "#0F2E5C",
              border: "none",
              borderBottom: "3px solid #FFC000",
              padding: "10px 20px",
              fontSize: "12px",
              fontWeight: 800,
              color: "#FFFFFF",
              textDecoration: "none",
              boxShadow: "0 4px 10px rgba(15, 46, 92, 0.2)"
            }}
          >
            <FileText style={{ width: "15px", height: "15px", color: "#FFC000" }} /> Audit SIMAK
          </Link>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
        <div style={{ borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", margin: 0 }}>Nilai Kontrak</p>
          <p style={{ fontSize: "22px", fontWeight: 900, color: "#0F172A", margin: 0, fontFamily: "monospace" }}>
            {formatCurrency(project.contractValue)}
          </p>
          <p style={{ fontSize: "11px", color: "#94A3B8", margin: "4px 0 0 0" }}>{project.contractChar} • {project.source}</p>
        </div>

        <div style={{ borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", margin: 0 }}>Progres Fisik Lapangan</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <p style={{ fontSize: "26px", fontWeight: 900, color: "#0F172A", margin: 0 }}>{project.physProgress}%</p>
            <span style={{ fontSize: "11px", fontWeight: 800, color: deviasi >= 0 ? "#059669" : "#DC2626" }}>
              {deviasi >= 0 ? `+${deviasi}% Ahead` : `${deviasi}% Delay`}
            </span>
          </div>
          <div style={{ width: "100%", height: "6px", backgroundColor: "#F1F5F9", borderRadius: "9999px", overflow: "hidden", marginTop: "4px" }}>
            <div style={{ width: `${project.physProgress}%`, height: "100%", backgroundColor: deviasi >= 0 ? "#059669" : "#DC2626", borderRadius: "9999px" }} />
          </div>
        </div>

        <div style={{ borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", margin: 0 }}>Realisasi Keuangan</p>
          <p style={{ fontSize: "26px", fontWeight: 900, color: "#059669", margin: 0 }}>{project.finProgress}%</p>
          <div style={{ width: "100%", height: "6px", backgroundColor: "#F1F5F9", borderRadius: "9999px", overflow: "hidden", marginTop: "4px" }}>
            <div style={{ width: `${project.finProgress}%`, height: "100%", backgroundColor: "#059669", borderRadius: "9999px" }} />
          </div>
        </div>

        <div style={{ borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", margin: 0 }}>Penyedia Jasa</p>
          <p style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.contractor}</p>
          <p style={{ fontSize: "11px", color: "#64748B", fontFamily: "monospace", margin: "2px 0 0 0" }}>NIB: {project.nib}</p>
        </div>
      </div>

      {/* Main Content: Kurva-S + Metadata */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        {/* Left: Kurva-S */}
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <TrendingUp style={{ width: "18px", height: "18px", color: "#0F2E5C" }} /> Kurva-S Progres Konstruksi
              </h2>
              <p style={{ fontSize: "12px", color: "#64748B", margin: "3px 0 0 0" }}>
                Perbandingan Kurva Rencana (Target Kontrak) vs Realisasi Fisik Lapangan
              </p>
            </div>
            <span style={{ fontSize: "11px", fontWeight: 800, backgroundColor: "#EBF2FA", color: "#0F2E5C", padding: "4px 12px", borderRadius: "8px" }}>
              TA {project.fiscalYear}
            </span>
          </div>

          <div style={{ height: "300px", width: "100%" }}>
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top" as const,
                    labels: {
                      usePointStyle: true,
                      boxWidth: 8,
                      font: { size: 12, weight: "bold" },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => ` ${context.dataset.label}: ${context.parsed.y}%`,
                    },
                  },
                },
                scales: {
                  y: {
                    min: 0,
                    max: 100,
                    ticks: {
                      callback: (val) => `${val}%`,
                    },
                    grid: {
                      color: "#F1F5F9",
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>

          <div style={{ paddingTop: "14px", borderTop: "1px solid #F1F5F9", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", textAlign: "center" }}>
            <div style={{ backgroundColor: "#F8FAFC", padding: "10px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
              <p style={{ fontSize: "11px", color: "#64748B", margin: 0 }}>Target Kumulatif</p>
              <p style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: "3px 0 0 0" }}>{project.planProgress[project.realProgress.filter(v => v>0).length - 1] || 0}%</p>
            </div>
            <div style={{ backgroundColor: "#ECFDF5", padding: "10px", borderRadius: "10px", border: "1px solid #A7F3D0" }}>
              <p style={{ fontSize: "11px", color: "#059669", margin: 0 }}>Realisasi Aktual</p>
              <p style={{ fontSize: "15px", fontWeight: 800, color: "#059669", margin: "3px 0 0 0" }}>{project.physProgress}%</p>
            </div>
            <div style={{ backgroundColor: deviasi >= 0 ? "#ECFDF5" : "#FEF2F2", padding: "10px", borderRadius: "10px", border: deviasi >= 0 ? "1px solid #A7F3D0" : "1px solid #FECACA" }}>
              <p style={{ fontSize: "11px", color: deviasi >= 0 ? "#059669" : "#DC2626", margin: 0 }}>Status Deviasi</p>
              <p style={{ fontSize: "15px", fontWeight: 800, color: deviasi >= 0 ? "#059669" : "#DC2626", margin: "3px 0 0 0" }}>
                {deviasi >= 0 ? `+${deviasi}%` : `${deviasi}%`}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Contract Details */}
        <div 
          style={{
            borderRadius: "18px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: "24px 26px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "18px"
          }}
        >
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: "0 0 16px 0", borderBottom: "1px solid #F1F5F9", paddingBottom: "12px" }}>
              Informasi Kontrak & Lokasi
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "12px" }}>
              <div>
                <p style={{ color: "#64748B", fontWeight: 600, margin: 0 }}>Pengguna Jasa / PPK:</p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", margin: "3px 0 0 0" }}>{project.owner}</p>
              </div>

              <div>
                <p style={{ color: "#64748B", fontWeight: 600, margin: 0 }}>Bentuk Kontrak:</p>
                <p style={{ color: "#334155", fontWeight: 600, margin: "3px 0 0 0" }}>{project.contractType} ({project.contractChar})</p>
              </div>

              <div>
                <p style={{ color: "#64748B", fontWeight: 600, margin: 0 }}>Masa Pelaksanaan:</p>
                <p style={{ display: "flex", alignItems: "center", gap: "6px", color: "#334155", margin: "3px 0 0 0", fontWeight: 600 }}>
                  <Calendar style={{ width: "13px", height: "13px", color: "#94A3B8" }} />
                  {project.startDate} s/d {project.endDate}
                </p>
              </div>

              <div>
                <p style={{ color: "#64748B", fontWeight: 600, margin: 0 }}>Wilayah Kecamatan:</p>
                <p style={{ display: "flex", alignItems: "center", gap: "6px", color: "#0F2E5C", margin: "3px 0 0 0", fontWeight: 700 }}>
                  <MapPin style={{ width: "13px", height: "13px", color: "#0F2E5C" }} />
                  Kec. {district?.name || "Kab. Bogor"}
                </p>
              </div>

              <div>
                <p style={{ color: "#64748B", fontWeight: 600, margin: 0 }}>Koordinat Proyek:</p>
                <p style={{ fontFamily: "monospace", color: "#64748B", margin: "3px 0 0 0" }}>
                  {project.lat.toFixed(4)}, {project.lng.toFixed(4)}
                </p>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: "14px", borderTop: "1px solid #F1F5F9" }}>
            <Link
              href="/webgis"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                width: "100%",
                borderRadius: "10px",
                backgroundColor: "#F1F5F9",
                padding: "10px",
                fontSize: "12px",
                fontWeight: 700,
                color: "#0F2E5C",
                textDecoration: "none",
                border: "1px solid #E2E8F0"
              }}
            >
              <MapPin style={{ width: "14px", height: "14px", color: "#0F2E5C" }} />
              <span>Lihat di Peta WebGIS</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

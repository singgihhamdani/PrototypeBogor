"use client";
import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, Package, Calendar, DollarSign, Building2, MapPin, 
  FileText, Download, CheckCircle2, Clock, ShieldCheck, HardHat, ExternalLink
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import projectsData from "@/data/projects.json";
import districtsData from "@/data/districts.json";
import { useResponsive } from "@/lib/use-responsive";

export default function PaketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { isMobile, isMounted } = useResponsive();
  const resolvedParams = use(params);
  const project = projectsData.find((p) => p.id.toLowerCase() === resolvedParams.id.toLowerCase());

  if (!project) {
    notFound();
  }

  const district = districtsData.find((d) => d.id === project.districtId);

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
            onClick={() => alert(`Mengunduh Berita Acara & Dokumen Kontrak ${project.id}...`)}
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: "16px" }}>
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
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669" }}>
              Realisasi Aktual
            </span>
          </div>
          <div style={{ width: "100%", height: "6px", backgroundColor: "#F1F5F9", borderRadius: "9999px", overflow: "hidden", marginTop: "4px" }}>
            <div style={{ width: `${project.physProgress}%`, height: "100%", backgroundColor: "#059669", borderRadius: "9999px" }} />
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

      {/* Main Content: Execution Details + Metadata */}
      <div style={{ display: "grid", gridTemplateColumns: isMounted && isMobile ? "1fr" : "2fr 1fr", gap: "20px" }}>
        {/* Left: Execution Details */}
        <div 
          style={{
            borderRadius: "18px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: isMounted && isMobile ? "18px 16px" : "24px 28px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <HardHat style={{ width: "18px", height: "18px", color: "#0F2E5C" }} /> Status Pelaksanaan & Pemantauan Progres
              </h2>
              <p style={{ fontSize: "12px", color: "#64748B", margin: "3px 0 0 0" }}>
                Rekapitulasi pencapaian fisik lapangan, penyerapan anggaran SP2D, dan kepatuhan kontrak
              </p>
            </div>
            <span style={{ fontSize: "11px", fontWeight: 800, backgroundColor: "#EBF2FA", color: "#0F2E5C", padding: "4px 12px", borderRadius: "8px" }}>
              TA {project.fiscalYear}
            </span>
          </div>

          {/* Progress Indicators */}
          <div style={{ display: "grid", gridTemplateColumns: isMounted && isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
            <div style={{ backgroundColor: "#F8FAFC", borderRadius: "14px", border: "1px solid #E2E8F0", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>Kemajuan Fisik Lapangan</span>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#059669" }}>{project.physProgress}%</span>
              </div>
              <div style={{ width: "100%", height: "8px", backgroundColor: "#E2E8F0", borderRadius: "9999px", overflow: "hidden" }}>
                <div style={{ width: `${project.physProgress}%`, height: "100%", backgroundColor: "#059669", borderRadius: "9999px" }} />
              </div>
              <p style={{ fontSize: "11px", color: "#64748B", margin: "8px 0 0 0" }}>
                Berdasarkan Berita Acara Opname fisik terakhir bersama Konsultan Pengawas.
              </p>
            </div>

            <div style={{ backgroundColor: "#F8FAFC", borderRadius: "14px", border: "1px solid #E2E8F0", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>Realisasi Keuangan (SP2D)</span>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#0F2E5C" }}>{project.finProgress}%</span>
              </div>
              <div style={{ width: "100%", height: "8px", backgroundColor: "#E2E8F0", borderRadius: "9999px", overflow: "hidden" }}>
                <div style={{ width: `${project.finProgress}%`, height: "100%", backgroundColor: "#0F2E5C", borderRadius: "9999px" }} />
              </div>
              <p style={{ fontSize: "11px", color: "#64748B", margin: "8px 0 0 0" }}>
                Pencairan termin anggaran daerah melalui BPKAD Kab. Bogor.
              </p>
            </div>
          </div>

          {/* Timeline & Milestone */}
          <div style={{ borderRadius: "14px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", padding: "18px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", margin: "0 0 14px 0", display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock style={{ width: "15px", height: "15px", color: "#0F2E5C" }} /> Jadwal & Masa Pelaksanaan Kontrak
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: isMounted && isMobile ? "1fr" : "repeat(3, 1fr)", gap: "12px" }}>
              <div style={{ backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "10px", border: "1px solid #F1F5F9" }}>
                <p style={{ fontSize: "11px", color: "#64748B", margin: 0 }}>Tanggal Mulai (SPMK)</p>
                <p style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", margin: "4px 0 0 0" }}>{project.startDate}</p>
              </div>
              <div style={{ backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "10px", border: "1px solid #F1F5F9" }}>
                <p style={{ fontSize: "11px", color: "#64748B", margin: 0 }}>Target Selesai (PHO)</p>
                <p style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", margin: "4px 0 0 0" }}>{project.endDate}</p>
              </div>
              <div style={{ backgroundColor: "#ECFDF5", padding: "12px", borderRadius: "10px", border: "1px solid #A7F3D0" }}>
                <p style={{ fontSize: "11px", color: "#059669", margin: 0 }}>Status Pekerjaan</p>
                <p style={{ fontSize: "13px", fontWeight: 800, color: "#059669", margin: "4px 0 0 0" }}>{project.status}</p>
              </div>
            </div>
          </div>

          {/* Supervision Notice */}
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "12px", padding: "14px 16px" }}>
            <ShieldCheck style={{ width: "20px", height: "20px", color: "#1D4ED8", flexShrink: 0, marginTop: "2px" }} />
            <div style={{ fontSize: "12px", color: "#1E40AF", lineHeight: 1.5 }}>
              <strong>Kepatuhan Pengawasan Tertib Konstruksi (Permen PUPR No. 1/2023):</strong>
              <p style={{ margin: "4px 0 0 0", color: "#1E3A8A" }}>
                Paket pekerjaan ini tercatat dalam pengawasan rutin Dinas PUPR Kab. Bogor. Pemeriksaan berkala mencakup pengujian mutu spesifikasi teknis, standar keselamatan K3/SMKK, dan validitas tenaga kerja bersertifikat (TKK).
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
                <p style={{ color: "#64748B", fontWeight: 600, margin: 0 }}>Sumber Dana:</p>
                <p style={{ color: "#0F2E5C", fontWeight: 700, margin: "3px 0 0 0" }}>{project.source} TA {project.fiscalYear}</p>
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

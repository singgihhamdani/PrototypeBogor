"use client";
import { useState } from "react";
import { 
  ShieldAlert, Plus, Search, Calendar, MapPin, AlertTriangle, 
  CheckCircle2, FileText, Send, Eye, ShieldCheck, Download, X,
  Check, Clock, UserCheck
} from "lucide-react";
import incidentsData from "@/data/incidents.json";
import projectsData from "@/data/projects.json";
import { 
  StatusBadge, DataTableView, VerificationDialog, 
  FileUploader, ColumnDef, VerificationTargetInfo 
} from "@/components/common";

export interface IncidentItem {
  id: string;
  projectId: string;
  projectName: string;
  contractor: string;
  date: string;
  time: string;
  district: string;
  locationDetail: string;
  incidentType: string;
  severity: string;
  victimName: string;
  victimRole: string;
  injuryDetail: string;
  chronology: string;
  correctiveAction: string;
  status: string;
  reportedToSipjaki: boolean;
  sipjakiRef: string;
}

export default function KecelakaanPage() {
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [incidents, setIncidents] = useState<IncidentItem[]>(incidentsData as IncidentItem[]);
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("Semua");
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);

  // Verification Dialog State
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState<IncidentItem | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Form states matching SIPJAKI
  const [formData, setFormData] = useState({
    projectId: "P001",
    date: "",
    time: "",
    district: "Cibinong",
    locationDetail: "",
    incidentType: "Tertimpa Material / Benda Jatuh",
    severity: "Luka Ringan",
    victimName: "",
    victimRole: "",
    injuryDetail: "",
    chronology: "",
    correctiveAction: "",
  });
  const [uploadedBapFile, setUploadedBapFile] = useState<File | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projectsData.find(p => p.id === formData.projectId);
    const newInc: IncidentItem = {
      id: `K3-2026-00${incidents.length + 1}`,
      projectId: formData.projectId,
      projectName: proj?.name || "Proyek Konstruksi",
      contractor: proj?.contractor || "Kontraktor Pelaksana",
      date: formData.date || new Date().toISOString().split("T")[0],
      time: formData.time || "10:00",
      district: formData.district,
      locationDetail: formData.locationDetail || "Lokasi Proyek",
      incidentType: formData.incidentType,
      severity: formData.severity,
      victimName: formData.victimName || "-",
      victimRole: formData.victimRole || "Pekerja",
      injuryDetail: formData.injuryDetail || "-",
      chronology: formData.chronology,
      correctiveAction: formData.correctiveAction,
      status: "Menunggu Verifikasi",
      reportedToSipjaki: true,
      sipjakiRef: `SIPJAKI-K3-2026-0${Math.floor(100 + Math.random() * 900)}`
    };

    setIncidents([newInc, ...incidents]);
    alert("Laporan Kecelakaan Kerja berhasil disimpan & siap diverifikasi tim SMKK!");
    setActiveTab("list");
  };

  const handleOpenVerify = (inc: IncidentItem) => {
    setVerifyTarget(inc);
    setIsVerifyOpen(true);
  };

  const handleConfirmVerify = (decision: "sesuai" | "tidak_sesuai", notes: string) => {
    if (!verifyTarget) return;
    setIsVerifying(true);

    setTimeout(() => {
      const isApproved = decision === "sesuai";
      setIncidents((prev) =>
        prev.map((item) =>
          item.id === verifyTarget.id
            ? {
                ...item,
                status: isApproved ? "Selesai (Investigasi Ditutup)" : "Perlu Investigasi Lanjutan",
                correctiveAction: notes ? `${item.correctiveAction} [Catatan Verifikator: ${notes}]` : item.correctiveAction
              }
            : item
        )
      );

      setIsVerifying(false);
      setIsVerifyOpen(false);
      setVerifyTarget(null);
      alert(
        `Hasil verifikasi laporan K3 ${verifyTarget.id} berhasil disimpan: ${
          isApproved ? "Investigasi Disetujui & Ditutup" : "Ditolak / Perlu Investigasi Lanjutan"
        }`
      );
    }, 600);
  };

  const filteredIncidents = incidents.filter(inc => {
    const matchSearch = inc.projectName.toLowerCase().includes(search.toLowerCase()) ||
                        inc.contractor.toLowerCase().includes(search.toLowerCase()) ||
                        inc.incidentType.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = filterSeverity === "Semua" || inc.severity.toLowerCase().includes(filterSeverity.toLowerCase());
    return matchSearch && matchSeverity;
  });

  const columns: ColumnDef<IncidentItem>[] = [
    {
      key: "id",
      label: "NO. LAPORAN & WAKTU",
      sortable: true,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#0F2E5C", fontSize: "12px" }}>
            {row.id}
          </span>
          <span style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
            {row.date} • {row.time} WIB
          </span>
        </div>
      )
    },
    {
      key: "projectName",
      label: "PAKET & PELAKSANA",
      sortable: true,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 800, color: "#0F172A", fontSize: "13px" }}>
            {row.projectName}
          </span>
          <span style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
            {row.contractor} • Kec. {row.district}
          </span>
        </div>
      )
    },
    {
      key: "incidentType",
      label: "JENIS INSIDEN",
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>
          {row.incidentType}
        </span>
      )
    },
    {
      key: "severity",
      label: "TINGKAT KEPARAHAN",
      align: "center",
      sortable: true,
      render: (row) => <StatusBadge status={row.severity} size="sm" showDot />
    },
    {
      key: "victimName",
      label: "KORBAN & PERAN",
      sortable: true,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 700, color: "#0F172A", fontSize: "12px" }}>{row.victimName}</span>
          <span style={{ fontSize: "11px", color: "#64748B" }}>{row.victimRole}</span>
        </div>
      )
    },
    {
      key: "sipjakiRef",
      label: "REF SIPJAKI",
      align: "center",
      sortable: false,
      render: (row) => (
        <span style={{ fontFamily: "monospace", fontSize: "11px", backgroundColor: "#F1F5F9", color: "#334155", padding: "3px 8px", borderRadius: "6px", fontWeight: 600 }}>
          {row.sipjakiRef}
        </span>
      )
    },
    {
      key: "status",
      label: "STATUS VERIFIKASI",
      align: "center",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} size="sm" />
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#DC2626", backgroundColor: "#FEF2F2", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <ShieldAlert style={{ width: "12px", height: "12px" }} /> Modul SMKK & K3 Konstruksi
            </span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#475569", backgroundColor: "#F1F5F9", padding: "3px 10px", borderRadius: "9999px" }}>
              Sinkronisasi: SIPJAKI PUPR
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Pelaporan Kecelakaan Kerja Konstruksi (K3)
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
            Pencatatan insiden K3, investigasi penyebab, tindakan perbaikan, dan verifikasi laporan ke Kementerian PUPR
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            style={{
              borderRadius: "12px",
              padding: "10px 18px",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              backgroundColor: activeTab === "list" ? "#0F2E5C" : "#FFFFFF",
              color: activeTab === "list" ? "#FFFFFF" : "#475569",
              border: activeTab === "list" ? "none" : "1px solid #CBD5E1",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}
          >
            Daftar Insiden ({incidents.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("create")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "12px",
              padding: "10px 20px",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              backgroundColor: activeTab === "create" ? "#DC2626" : "#FEF2F2",
              color: activeTab === "create" ? "#FFFFFF" : "#DC2626",
              border: "none",
              borderBottom: activeTab === "create" ? "none" : "3px solid #DC2626",
              boxShadow: activeTab === "create" ? "0 4px 12px rgba(220, 38, 38, 0.2)" : "none"
            }}
          >
            <Plus style={{ width: "16px", height: "16px" }} />
            <span>Lapor Insiden K3</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards (UI/UX Standardized) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        {/* Card 1: Total Laporan */}
        <div
          style={{
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #0F2E5C",
            backgroundColor: "#FFFFFF",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Total Laporan K3
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
              <ShieldAlert style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#0F2E5C", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {incidents.length} Kejadian
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10B981" }} />
              <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>
                Tahun Anggaran 2026
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Fatalitas */}
        <div
          style={{
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #059669",
            backgroundColor: "#FFFFFF",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Fatalitas (Kematian)
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
              0 Korban
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#059669" }} />
              <span style={{ fontSize: "11px", color: "#166534", fontWeight: 700 }}>
                Zero Fatalities Tercapai
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Luka Berat / Ringan */}
        <div
          style={{
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #D97706",
            backgroundColor: "#FFFFFF",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Luka Berat / Ringan
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
              {incidents.filter(i => i.severity.includes("Luka")).length} Kasus
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ fontSize: "11px", color: "#64748B" }}>
                Dalam perawatan medis & evaluasi
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Sinkronisasi SIPJAKI */}
        <div
          style={{
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #2563EB",
            backgroundColor: "#FFFFFF",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Sinkronisasi SIPJAKI
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
              <CheckCircle2 style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#2563EB", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              100% Valid
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#2563EB" }} />
              <span style={{ fontSize: "11px", color: "#2563EB", fontWeight: 700 }}>
                Pusat Data K3 Nasional
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab: Incident List */}
      {activeTab === "list" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Quick Filter Bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", backgroundColor: "#FFFFFF", padding: "14px 18px", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C" }}>Keparahan:</span>
              <div style={{ display: "inline-flex", gap: "6px" }}>
                {["Semua", "Luka Ringan", "Luka Berat", "Nir-Korban"].map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setFilterSeverity(sev)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: 800,
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: filterSeverity === sev ? "#0F2E5C" : "#F1F5F9",
                      color: filterSeverity === sev ? "#FFFFFF" : "#64748B"
                    }}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ width: "100%", maxWidth: "260px" }}>
              <input
                type="text"
                placeholder="Cari paket / jenis insiden..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", height: "34px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "12px", outline: "none" }}
              />
            </div>
          </div>

          {/* DataTableView */}
          <DataTableView<IncidentItem>
            title={`Daftar Laporan Insiden K3 Konstruksi (${filteredIncidents.length})`}
            subtitle="Pencatatan kejadian insiden dan status audit verifikasi kepatuhan SMKK"
            data={filteredIncidents}
            columns={columns}
            defaultPageSize={5}
            exportFileName="Laporan_Kecelakaan_K3_Bogor"
            actionsHeader="AKSI"
            actionsRender={(row) => (
              <div style={{ display: "inline-flex", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => setSelectedIncident(row)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    borderRadius: "6px",
                    backgroundColor: "#EBF2FA",
                    color: "#0F2E5C",
                    padding: "5px 10px",
                    fontSize: "11px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  <Eye style={{ width: "12px", height: "12px" }} />
                  <span>Detail</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenVerify(row)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    borderRadius: "6px",
                    backgroundColor: "#0F2E5C",
                    color: "#FFFFFF",
                    padding: "5px 10px",
                    fontSize: "11px",
                    fontWeight: 800,
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  <ShieldCheck style={{ width: "12px", height: "12px" }} />
                  <span>Verifikasi</span>
                </button>
              </div>
            )}
          />
        </div>
      )}

      {/* Tab: Create Incident Report */}
      {activeTab === "create" && (
        <div style={{ borderRadius: "18px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", padding: "26px 30px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "16px", marginBottom: "22px" }}>
            <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <FileText style={{ width: "18px", height: "18px", color: "#DC2626" }} /> Formulir Laporan Kecelakaan Kerja Konstruksi (Format SIPJAKI)
            </h2>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0 0" }}>
              Sesuai Permen PUPR No. 10/2021 tentang SMKK dan Sistem Informasi Pembina Jasa Konstruksi
            </p>
          </div>

          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Bagian 1: Identitas Pekerjaan */}
            <div>
              <h3 style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                1. Identitas Proyek & Lokasi
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                    Pilih Paket Pekerjaan *
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                    style={{ width: "100%", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", padding: "10px 14px", fontSize: "13px", fontWeight: 600, color: "#0F172A", outline: "none" }}
                  >
                    {projectsData.map(p => (
                      <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                    Kecamatan Lokasi Kejadian *
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    style={{ width: "100%", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", padding: "10px 14px", fontSize: "13px", fontWeight: 600, color: "#0F172A", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                    Tanggal Kejadian *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    style={{ width: "100%", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", padding: "10px 14px", fontSize: "13px", fontWeight: 600, color: "#0F172A", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                    Waktu Kejadian (WIB) *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    style={{ width: "100%", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", padding: "10px 14px", fontSize: "13px", fontWeight: 600, color: "#0F172A", outline: "none" }}
                  />
                </div>
              </div>
            </div>

            {/* Bagian 2: Karakteristik Insiden */}
            <div>
              <h3 style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                2. Detail Insiden & Korban
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                    Jenis Insiden *
                  </label>
                  <select
                    value={formData.incidentType}
                    onChange={(e) => setFormData({...formData, incidentType: e.target.value})}
                    style={{ width: "100%", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", padding: "10px 14px", fontSize: "13px", fontWeight: 600, color: "#0F172A", outline: "none" }}
                  >
                    <option value="Tertimpa Material / Benda Jatuh">Tertimpa Material / Benda Jatuh</option>
                    <option value="Jatuh dari Ketinggian">Jatuh dari Ketinggian</option>
                    <option value="Terpeleset / Tersandung">Terpeleset / Tersandung</option>
                    <option value="Tersengat Arus Listrik">Tersengat Arus Listrik</option>
                    <option value="Longsor Tebing Galian">Longsor Tebing Galian</option>
                    <option value="Kecelakaan Alat Berat">Kecelakaan Alat Berat</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                    Tingkat Keparahan *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({...formData, severity: e.target.value})}
                    style={{ width: "100%", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", padding: "10px 14px", fontSize: "13px", fontWeight: 600, color: "#0F172A", outline: "none" }}
                  >
                    <option value="Luka Ringan">Luka Ringan</option>
                    <option value="Luka Berat">Luka Berat</option>
                    <option value="Fatal / Kematian">Fatal / Kematian</option>
                    <option value="Nir-Korban (Near Miss)">Nir-Korban (Near Miss)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                    Nama Korban (Jika ada)
                  </label>
                  <input
                    type="text"
                    placeholder="Nama pekerja / korban"
                    value={formData.victimName}
                    onChange={(e) => setFormData({...formData, victimName: e.target.value})}
                    style={{ width: "100%", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", padding: "10px 14px", fontSize: "13px", fontWeight: 600, color: "#0F172A", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                    Peran / Jabatan Korban
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Pekerja Pembesian, Operator, dll"
                    value={formData.victimRole}
                    onChange={(e) => setFormData({...formData, victimRole: e.target.value})}
                    style={{ width: "100%", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", padding: "10px 14px", fontSize: "13px", fontWeight: 600, color: "#0F172A", outline: "none" }}
                  />
                </div>
              </div>
            </div>

            {/* Bagian 3: Kronologi & Tindakan */}
            <div>
              <h3 style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                3. Kronologi & Tindakan Perbaikan
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                    Kronologi Lengkap Kejadian *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Uraikan alur kejadian, faktor lingkungan, dan tindakan awal..."
                    value={formData.chronology}
                    onChange={(e) => setFormData({...formData, chronology: e.target.value})}
                    style={{ width: "100%", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", padding: "10px 14px", fontSize: "13px", color: "#0F172A", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                    Tindakan Koreksi / Penanganan Medis *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Rujukan RS, toolbox meeting ulang, sanksi K3, atau perbaikan metode kerja..."
                    value={formData.correctiveAction}
                    onChange={(e) => setFormData({...formData, correctiveAction: e.target.value})}
                    style={{ width: "100%", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", padding: "10px 14px", fontSize: "13px", color: "#0F172A", outline: "none" }}
                  />
                </div>

                {/* File Uploader */}
                <FileUploader
                  label="Lampirkan Dokumen BAP / Foto Bukti Insiden (PDF)"
                  accept=".pdf"
                  maxSizeMb={5}
                  onFileSelect={(file) => setUploadedBapFile(file)}
                  hint="Unggah berkas Berita Acara Pemeriksaan (BAP) K3 atau lampiran kronologi (Maksimal 5 MB)"
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "14px", borderTop: "1px solid #E2E8F0" }}>
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                style={{ padding: "10px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 700, color: "#64748B", backgroundColor: "#F1F5F9", border: "none", cursor: "pointer" }}
              >
                Batal
              </button>
              <button
                type="submit"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  borderRadius: "10px",
                  backgroundColor: "#DC2626",
                  color: "#FFFFFF",
                  padding: "10px 24px",
                  fontSize: "13px",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(220, 38, 38, 0.2)"
                }}
              >
                <Send style={{ width: "15px", height: "15px" }} />
                <span>Kirim Laporan K3</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Verification Dialog */}
      {verifyTarget && (
        <VerificationDialog
          isOpen={isVerifyOpen}
          onClose={() => {
            setIsVerifyOpen(false);
            setVerifyTarget(null);
          }}
          target={{
            id: verifyTarget.id,
            title: `${verifyTarget.projectName} (${verifyTarget.incidentType})`,
            category: `K3 Konstruksi • ${verifyTarget.contractor}`,
            notes: `Kronologi: ${verifyTarget.chronology} | Korban: ${verifyTarget.victimName} (${verifyTarget.severity})`,
            date: verifyTarget.date
          }}
          onConfirm={handleConfirmVerify}
          isLoading={isVerifying}
        />
      )}

      {/* Detail Modal */}
      {selectedIncident && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, backgroundColor: "rgba(15, 46, 92, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", maxWidth: "650px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", border: "1px solid #E2E8F0" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#0F2E5C", color: "#FFFFFF", borderTopLeftRadius: "20px", borderTopRightRadius: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <ShieldAlert style={{ width: "20px", height: "20px", color: "#FFC000" }} />
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0 }}>Rincian Laporan Insiden K3</h3>
                  <span style={{ fontSize: "11px", color: "#94A3B8" }}>Nomor: {selectedIncident.id} • Ref: {selectedIncident.sipjakiRef}</span>
                </div>
              </div>
              <button onClick={() => setSelectedIncident(null)} style={{ background: "none", border: "none", color: "#FFFFFF", cursor: "pointer" }}>
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", fontSize: "13px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Paket Pekerjaan</span>
                <p style={{ fontWeight: 800, color: "#0F2E5C", margin: "2px 0 0 0" }}>{selectedIncident.projectName}</p>
                <p style={{ fontSize: "11px", color: "#64748B", margin: "2px 0 0 0" }}>Kontraktor: {selectedIncident.contractor} • Lokasi: {selectedIncident.locationDetail}, Kec. {selectedIncident.district}</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "10px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748B" }}>Waktu Kejadian:</span>
                  <p style={{ fontWeight: 700, margin: 0 }}>{selectedIncident.date} ({selectedIncident.time} WIB)</p>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748B" }}>Tingkat Keparahan:</span>
                  <div style={{ marginTop: "4px" }}><StatusBadge status={selectedIncident.severity} size="sm" /></div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Kronologi Kejadian</span>
                <p style={{ color: "#334155", margin: "4px 0 0 0", lineHeight: 1.5, backgroundColor: "#FFFBEB", padding: "12px", borderRadius: "10px", border: "1px solid #FEF3C7" }}>
                  {selectedIncident.chronology}
                </p>
              </div>

              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Tindakan Koreksi & Penanganan</span>
                <p style={{ color: "#334155", margin: "4px 0 0 0", lineHeight: 1.5, backgroundColor: "#F0FDF4", padding: "12px", borderRadius: "10px", border: "1px solid #DCFCE7" }}>
                  {selectedIncident.correctiveAction}
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "12px", borderTop: "1px solid #F1F5F9" }}>
                <button
                  type="button"
                  onClick={() => setSelectedIncident(null)}
                  style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", color: "#475569", fontWeight: 700, cursor: "pointer" }}
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const inc = selectedIncident;
                    setSelectedIncident(null);
                    handleOpenVerify(inc);
                  }}
                  style={{ padding: "8px 18px", borderRadius: "8px", border: "none", backgroundColor: "#0F2E5C", color: "#FFFFFF", fontWeight: 800, cursor: "pointer" }}
                >
                  Lakukan Verifikasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

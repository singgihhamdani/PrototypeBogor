"use client";
import { useState } from "react";
import { 
  ShieldAlert, Plus, Search, Calendar, MapPin, AlertTriangle, 
  CheckCircle2, FileText, Send, Eye, ShieldCheck, Download, X
} from "lucide-react";
import incidentsData from "@/data/incidents.json";
import projectsData from "@/data/projects.json";

export default function KecelakaanPage() {
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [incidents, setIncidents] = useState(incidentsData);
  const [search, setSearch] = useState("");
  const [selectedIncident, setSelectedIncident] = useState<typeof incidentsData[0] | null>(null);

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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projectsData.find(p => p.id === formData.projectId);
    const newInc = {
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
      status: "Menunggu Verifikasi Pengawas",
      reportedToSipjaki: true,
      sipjakiRef: `SIPJAKI-K3-2026-0${Math.floor(100 + Math.random() * 900)}`
    };

    setIncidents([newInc, ...incidents]);
    alert("Laporan Kecelakaan Kerja berhasil disimpan & siap disinkronkan ke SIPJAKI Nasional!");
    setActiveTab("list");
  };

  const filteredIncidents = incidents.filter(inc => 
    inc.projectName.toLowerCase().includes(search.toLowerCase()) ||
    inc.contractor.toLowerCase().includes(search.toLowerCase()) ||
    inc.incidentType.toLowerCase().includes(search.toLowerCase())
  );

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
            Pelaporan Kecelakaan Kerja Konstruksi
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
            Pencatatan insiden K3, investigasi penyebab, tindakan perbaikan, dan integrasi data insiden ke Kementerian PUPR
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
              borderBottom: activeTab === "list" ? "3px solid #FFC000" : "1px solid #CBD5E1",
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
              gap: "6px",
              borderRadius: "12px",
              padding: "10px 18px",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              backgroundColor: activeTab === "create" ? "#DC2626" : "#FEF2F2",
              color: activeTab === "create" ? "#FFFFFF" : "#DC2626",
              border: "none",
              boxShadow: "0 2px 6px rgba(220, 38, 38, 0.2)"
            }}
          >
            <Plus style={{ width: "15px", height: "15px" }} /> Lapor Kecelakaan Baru
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
        <div style={{ borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Total Insiden K3</span>
            <div style={{ height: "36px", width: "36px", borderRadius: "10px", backgroundColor: "#FEF2F2", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldAlert style={{ width: "18px", height: "18px" }} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: "28px", fontWeight: 900, color: "#0F172A", margin: 0, lineHeight: 1.1 }}>{incidents.length}</p>
            <p style={{ fontSize: "11px", color: "#94A3B8", margin: "4px 0 0 0" }}>Tercatat di TA 2026</p>
          </div>
        </div>

        <div style={{ borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Luka Ringan</span>
            <div style={{ height: "36px", width: "36px", borderRadius: "10px", backgroundColor: "#FFFBEB", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle style={{ width: "18px", height: "18px" }} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: "28px", fontWeight: 900, color: "#D97706", margin: 0, lineHeight: 1.1 }}>
              {incidents.filter(i => i.severity === "Luka Ringan").length}
            </p>
            <p style={{ fontSize: "11px", color: "#94A3B8", margin: "4px 0 0 0" }}>Rawat Jalan / Pulih</p>
          </div>
        </div>

        <div style={{ borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Luka Berat / Fatal</span>
            <div style={{ height: "36px", width: "36px", borderRadius: "10px", backgroundColor: "#FEF2F2", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldAlert style={{ width: "18px", height: "18px" }} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: "28px", fontWeight: 900, color: "#DC2626", margin: 0, lineHeight: 1.1 }}>
              {incidents.filter(i => i.severity === "Luka Berat" || i.severity === "Meninggal Dunia").length}
            </p>
            <p style={{ fontSize: "11px", color: "#94A3B8", margin: "4px 0 0 0" }}>Zero Fatal Accident</p>
          </div>
        </div>

        <div style={{ borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Status Penanganan</span>
            <div style={{ height: "36px", width: "36px", borderRadius: "10px", backgroundColor: "#ECFDF5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 style={{ width: "18px", height: "18px" }} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: "28px", fontWeight: 900, color: "#059669", margin: 0, lineHeight: 1.1 }}>100%</p>
            <p style={{ fontSize: "11px", color: "#94A3B8", margin: "4px 0 0 0" }}>Tuntas Investigasi</p>
          </div>
        </div>
      </div>

      {/* Tab: List Incidents */}
      {activeTab === "list" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Search bar */}
          <div style={{ borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <Search style={{ width: "16px", height: "16px", color: "#94A3B8" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama proyek, kontraktor pelaksana, atau jenis insiden..."
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "13px",
                color: "#0F172A",
                backgroundColor: "transparent"
              }}
            />
          </div>

          {/* Table Container */}
          <div style={{ borderRadius: "18px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0", textAlign: "left" }}>
                    <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>NO. LAPORAN / TANGGAL</th>
                    <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>PAKET & PELAKSANA</th>
                    <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>JENIS INSIDEN</th>
                    <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>KEPARAHAN</th>
                    <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>KORBAN</th>
                    <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>REF SIPJAKI</th>
                    <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>STATUS</th>
                    <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px", textAlign: "center" }}>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncidents.map((inc) => (
                    <tr key={inc.id} style={{ borderBottom: "1px solid #F1F5F9", transition: "background-color 0.15s ease" }}>
                      <td style={{ padding: "16px 18px" }}>
                        <p style={{ fontFamily: "monospace", fontWeight: 800, color: "#0F172A", margin: 0, fontSize: "12px" }}>{inc.id}</p>
                        <p style={{ fontSize: "11px", color: "#64748B", margin: "2px 0 0 0" }}>{inc.date} • {inc.time}</p>
                      </td>
                      <td style={{ padding: "16px 18px" }}>
                        <p style={{ fontWeight: 800, color: "#0F172A", margin: 0, fontSize: "13px" }}>{inc.projectName}</p>
                        <p style={{ fontSize: "11px", color: "#64748B", margin: "2px 0 0 0" }}>{inc.contractor} • Kec. {inc.district}</p>
                      </td>
                      <td style={{ padding: "16px 18px", color: "#334155", fontWeight: 600 }}>
                        {inc.incidentType}
                      </td>
                      <td style={{ padding: "16px 18px" }}>
                        <span 
                          style={{
                            display: "inline-block",
                            borderRadius: "9999px",
                            padding: "4px 12px",
                            fontSize: "11px",
                            fontWeight: 800,
                            backgroundColor: inc.severity === "Luka Ringan" ? "#FFFBEB" : "#FEF2F2",
                            color: inc.severity === "Luka Ringan" ? "#D97706" : "#DC2626"
                          }}
                        >
                          {inc.severity}
                        </span>
                      </td>
                      <td style={{ padding: "16px 18px" }}>
                        <p style={{ fontWeight: 700, color: "#0F172A", margin: 0 }}>{inc.victimName}</p>
                        <p style={{ fontSize: "11px", color: "#64748B", margin: "2px 0 0 0" }}>{inc.victimRole}</p>
                      </td>
                      <td style={{ padding: "16px 18px" }}>
                        <span style={{ fontFamily: "monospace", fontSize: "11px", backgroundColor: "#F1F5F9", color: "#334155", padding: "3px 8px", borderRadius: "6px", fontWeight: 600 }}>
                          {inc.sipjakiRef}
                        </span>
                      </td>
                      <td style={{ padding: "16px 18px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700, color: "#059669", backgroundColor: "#ECFDF5", padding: "4px 10px", borderRadius: "9999px" }}>
                          <CheckCircle2 style={{ width: "13px", height: "13px" }} /> {inc.status}
                        </span>
                      </td>
                      <td style={{ padding: "16px 18px", textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => setSelectedIncident(inc)}
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
                            border: "1px solid #E2E8F0",
                            cursor: "pointer"
                          }}
                        >
                          <Eye style={{ width: "13px", height: "13px" }} /> Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    style={{ width: "100%", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", padding: "10px 14px", fontSize: "13px", fontWeight: 600, color: "#0F172A", outline: "none" }}
                  />
                </div>
              </div>
            </div>

            {/* Bagian 2: Kronologi & Penanganan */}
            <div>
              <h3 style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                2. Kronologi & Tindakan Korektif
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                    Kronologi Kejadian Singkat *
                  </label>
                  <textarea
                    rows={3}
                    value={formData.chronology}
                    onChange={(e) => setFormData({...formData, chronology: e.target.value})}
                    placeholder="Uraikan kronologi singkat insiden K3, pemicu kejadian, dan kondisi di tempat kerja..."
                    style={{ width: "100%", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", padding: "10px 14px", fontSize: "13px", fontWeight: 500, color: "#0F172A", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                    Tindakan Korektif & Pencegahan (Corrective Action) *
                  </label>
                  <textarea
                    rows={2}
                    value={formData.correctiveAction}
                    onChange={(e) => setFormData({...formData, correctiveAction: e.target.value})}
                    placeholder="Langkah perbaikan yang telah dilakukan kontraktor agar insiden tidak terulang..."
                    style={{ width: "100%", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", padding: "10px 14px", fontSize: "13px", fontWeight: 500, color: "#0F172A", outline: "none" }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "16px", borderTop: "1px solid #F1F5F9" }}>
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                style={{ borderRadius: "10px", padding: "10px 20px", fontSize: "12px", fontWeight: 700, color: "#64748B", backgroundColor: "#F1F5F9", border: "none", cursor: "pointer" }}
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
                  fontSize: "12px",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 10px rgba(220, 38, 38, 0.25)"
                }}
              >
                <Send style={{ width: "14px", height: "14px" }} /> Simpan & Kirim ke SIPJAKI
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Detail Kronologi */}
      {selectedIncident && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "20px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "18px", maxWidth: "600px", width: "100%", padding: "28px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}>
              <div>
                <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 800, color: "#DC2626", backgroundColor: "#FEF2F2", padding: "2px 8px", borderRadius: "4px" }}>
                  {selectedIncident.id}
                </span>
                <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#0F172A", margin: "6px 0 0 0" }}>
                  {selectedIncident.projectName}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedIncident(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Penyedia Jasa & Lokasi:</span>
                <p style={{ margin: "2px 0 0 0", fontWeight: 600, color: "#0F172A" }}>{selectedIncident.contractor} • Kec. {selectedIncident.district}</p>
              </div>

              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Waktu Kejadian:</span>
                <p style={{ margin: "2px 0 0 0", fontWeight: 600, color: "#0F172A" }}>{selectedIncident.date} pukul {selectedIncident.time} WIB</p>
              </div>

              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Kronologi Kejadian:</span>
                <p style={{ margin: "2px 0 0 0", color: "#334155", lineHeight: 1.5, backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                  {selectedIncident.chronology}
                </p>
              </div>

              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Tindakan Korektif:</span>
                <p style={{ margin: "2px 0 0 0", color: "#059669", fontWeight: 600, lineHeight: 1.5, backgroundColor: "#ECFDF5", padding: "12px", borderRadius: "10px", border: "1px solid #A7F3D0" }}>
                  {selectedIncident.correctiveAction}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "10px", borderTop: "1px solid #F1F5F9" }}>
              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                style={{ borderRadius: "10px", backgroundColor: "#0F2E5C", color: "#FFFFFF", border: "none", padding: "8px 20px", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

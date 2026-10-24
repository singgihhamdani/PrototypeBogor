"use client";
import { useState, useEffect } from "react";
import { 
  GraduationCap, Search, Calendar, Users, Award, Download, 
  CheckCircle2, Clock, Plus, QrCode, FileCheck, Eye, X, FileSpreadsheet,
  Database as DbIcon, RefreshCw, AlertCircle, UserPlus
} from "lucide-react";
import BatchImportModal from "@/components/common/batch-import-modal";
import { TEMPLATE_PELATIHAN } from "@/lib/sipjaki-templates";
import { exportToSpreadsheet } from "@/lib/export-utils";
import { 
  fetchPelatihanList, 
  createPelatihanAgenda, 
  registerPesertaPelatihan, 
  batchImportPelatihan, 
  TrainingItem, 
  DataSourceStatus 
} from "@/lib/services/pelatihan-service";

export default function PelatihanPage() {
  const [trainings, setTrainings] = useState<TrainingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<DataSourceStatus>({
    source: "supabase",
    message: "Memuat data dari database..."
  });

  const [activeTab, setActiveTab] = useState<"programs" | "tkk" | "cert">("programs");
  const [search, setSearch] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRegisterParticipantModal, setShowRegisterParticipantModal] = useState<string | null>(null);

  // New Training Form State
  const [newTraining, setNewTraining] = useState({
    title: "",
    category: "K3 Konstruksi",
    batch: "Angkatan I / 2026",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
    location: "Auditorium DPU Kab. Bogor",
    quota: 40,
    skkLevel: "Jenjang 5 (Teknisi/Analis)",
    organizer: "Bidang Jasa Konstruksi DPU Kab. Bogor",
    instructor: ""
  });

  // Participant Form State
  const [participantForm, setParticipantForm] = useState({
    nik: "",
    name: "",
    bujk: ""
  });

  const [selectedCert, setSelectedCert] = useState<{
    name: string;
    nik: string;
    bujk: string;
    certNo: string;
    trainingTitle: string;
  } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchPelatihanList();
      setTrainings(res.data);
      setDbStatus(res.status);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Extract all participants across training
  const allTkk = trainings.flatMap(t => 
    (t.participants || []).map(p => ({
      ...p,
      trainingTitle: t.title,
      skkLevel: t.skkLevel,
      date: t.endDate
    }))
  );

  const handleCreateTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTraining.title.trim()) {
      alert("Judul kegiatan wajib diisi!");
      return;
    }

    const res = await createPelatihanAgenda(newTraining);
    if (res.success) {
      alert("Agenda pelatihan baru berhasil dibuat!");
      setShowAddModal(false);
      setNewTraining({
        title: "",
        category: "K3 Konstruksi",
        batch: "Angkatan I / 2026",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
        location: "Auditorium DPU Kab. Bogor",
        quota: 40,
        skkLevel: "Jenjang 5 (Teknisi/Analis)",
        organizer: "Bidang Jasa Konstruksi DPU Kab. Bogor",
        instructor: ""
      });
      loadData();
    } else {
      alert(`Gagal membuat agenda: ${res.error}`);
    }
  };

  const handleRegisterParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRegisterParticipantModal) return;
    if (!participantForm.nik || !participantForm.name) {
      alert("NIK dan Nama Peserta wajib diisi!");
      return;
    }

    const res = await registerPesertaPelatihan(showRegisterParticipantModal, participantForm);
    if (res.success) {
      alert("Peserta berhasil didaftarkan ke kegiatan pelatihan!");
      setShowRegisterParticipantModal(null);
      setParticipantForm({ nik: "", name: "", bujk: "" });
      loadData();
    } else {
      alert(`Gagal mendaftarkan peserta: ${res.error}`);
    }
  };

  const handleBatchCommit = async (parsedData: Record<string, any>[]) => {
    const res = await batchImportPelatihan(parsedData);
    if (res.success) {
      alert(`Berhasil mengimpor ${res.insertedCount} kegiatan pelatihan ke dalam database!`);
      loadData();
    } else {
      alert(`Gagal impor batch: ${res.error}`);
    }
  };

  const filteredTkk = allTkk.filter(t => 
    (t.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.nik || "").includes(search) ||
    (t.bujk || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <GraduationCap style={{ width: "12px", height: "12px" }} /> Pilar 5: Pengembangan SDM & TKK
            </span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#475569", backgroundColor: "#F1F5F9", padding: "3px 10px", borderRadius: "9999px" }}>
              Integrasi: BNSP & SIPJAKI
            </span>
            {/* Live Database Badge */}
            <span style={{
              fontSize: "11px",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "3px 10px",
              borderRadius: "9999px",
              backgroundColor: dbStatus.source === "supabase" ? "#ECFDF5" : "#FFFBEB",
              color: dbStatus.source === "supabase" ? "#065F46" : "#92400E",
              border: `1px solid ${dbStatus.source === "supabase" ? "#A7F3D0" : "#FDE68A"}`
            }}>
              <DbIcon style={{ width: "11px", height: "11px" }} />
              {dbStatus.source === "supabase" ? "Database PostgreSQL (Live)" : "Cache Lokal"}
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Pelatihan & Sertifikasi Tenaga Kerja Konstruksi (TKK)
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
            Fasilitasi uji kompetensi, sertifikasi SKK, bimtek K3 SMKK, dan penerbitan e-Certificate Jasa Konstruksi
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Refresh Data */}
          <button
            type="button"
            onClick={loadData}
            title="Muat Ulang Data"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #CBD5E1",
              padding: "10px 14px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#475569",
              cursor: "pointer"
            }}
          >
            <RefreshCw style={{ width: "14px", height: "14px", animation: loading ? "spin 1s linear infinite" : "none" }} />
          </button>

          {/* Tombol Import Excel */}
          <button 
            type="button"
            onClick={() => setShowImportModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "12px",
              backgroundColor: "#ECFDF5",
              border: "1px solid #A7F3D0",
              padding: "10px 18px",
              fontSize: "12px",
              fontWeight: 800,
              color: "#065F46",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}
          >
            <FileSpreadsheet style={{ width: "15px", height: "15px", color: "#059669" }} />
            <span>Import Excel</span>
          </button>

          {/* Tombol Export */}
          <button
            type="button"
            onClick={() => exportToSpreadsheet({
              fileName: TEMPLATE_PELATIHAN.exportFileName,
              sheetName: TEMPLATE_PELATIHAN.sheetName,
              columns: TEMPLATE_PELATIHAN.columns,
              data: trainings,
              sipjakiMode: true,
              includeDataDictionary: true,
              dictionaryItems: TEMPLATE_PELATIHAN.dictionaryItems
            })}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #CBD5E1",
              padding: "10px 18px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#334155",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}
          >
            <Download style={{ width: "15px", height: "15px" }} /> Export SIPJAKI
          </button>

          {/* Tombol Buka Pelatihan Baru */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "12px",
              backgroundColor: "#0F2E5C",
              border: "none",
              borderBottom: "3px solid #FFC000",
              padding: "10px 20px",
              fontSize: "12px",
              fontWeight: 800,
              color: "#FFFFFF",
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(15, 46, 92, 0.2)"
            }}
          >
            <Plus style={{ width: "15px", height: "15px", color: "#FFC000" }} /> Buka Pelatihan Baru
          </button>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
        <div style={{ borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Program Pelatihan</span>
            <div style={{ height: "36px", width: "36px", borderRadius: "10px", backgroundColor: "#EBF2FA", color: "#0F2E5C", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap style={{ width: "18px", height: "18px" }} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: "28px", fontWeight: 900, color: "#0F172A", margin: 0, lineHeight: 1.1 }}>{trainings.length}</p>
            <p style={{ fontSize: "11px", color: "#94A3B8", margin: "4px 0 0 0" }}>TA 2026 ({trainings.length} Program)</p>
          </div>
        </div>

        <div style={{ borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Peserta Terdaftar</span>
            <div style={{ height: "36px", width: "36px", borderRadius: "10px", backgroundColor: "#EFF6FF", color: "#1E40AF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users style={{ width: "18px", height: "18px" }} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: "28px", fontWeight: 900, color: "#1E40AF", margin: 0, lineHeight: 1.1 }}>
              {trainings.reduce((acc, t) => acc + (t.registered || 0), 0)}
            </p>
            <p style={{ fontSize: "11px", color: "#94A3B8", margin: "4px 0 0 0" }}>Dari Kuota {trainings.reduce((acc, t) => acc + (t.quota || 0), 0)} Orang</p>
          </div>
        </div>

        <div style={{ borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Lulus Bersertifikat</span>
            <div style={{ height: "36px", width: "36px", borderRadius: "10px", backgroundColor: "#ECFDF5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Award style={{ width: "18px", height: "18px" }} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: "28px", fontWeight: 900, color: "#059669", margin: 0, lineHeight: 1.1 }}>
              {trainings.reduce((acc, t) => acc + (t.passed || 0), 0)}
            </p>
            <p style={{ fontSize: "11px", color: "#059669", fontWeight: 700, margin: "4px 0 0 0" }}>Tersertifikasi BNSP / SKK</p>
          </div>
        </div>

        <div style={{ borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Target Daerah 2026</span>
            <div style={{ height: "36px", width: "36px", borderRadius: "10px", backgroundColor: "#FFFBEB", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileCheck style={{ width: "18px", height: "18px" }} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: "28px", fontWeight: 900, color: "#0F172A", margin: 0, lineHeight: 1.1 }}>500 <span style={{ fontSize: "14px", fontWeight: 600, color: "#64748B" }}>TKK</span></p>
            <div style={{ width: "100%", height: "6px", backgroundColor: "#F1F5F9", borderRadius: "9999px", overflow: "hidden", marginTop: "6px" }}>
              <div style={{ 
                width: `${Math.min(100, Math.round((trainings.reduce((acc, t) => acc + (t.passed || 0), 0) / 500) * 100))}%`, 
                height: "100%", 
                backgroundColor: "#059669", 
                borderRadius: "9999px" 
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #E2E8F0", paddingBottom: "10px" }}>
        {[
          { id: "programs", label: "Program Pelatihan & Bimtek" },
          { id: "tkk", label: `Database TKK Tersertifikasi (${allTkk.length})` },
          { id: "cert", label: "Verifikasi e-Certificate QR" },
        ].map((tab) => {
          const isSel = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: "8px 18px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
                backgroundColor: isSel ? "#0F2E5C" : "transparent",
                color: isSel ? "#FFFFFF" : "#64748B",
                boxShadow: isSel ? "0 2px 6px rgba(15, 46, 92, 0.2)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748B", fontSize: "13px" }}>
          <RefreshCw style={{ width: "24px", height: "24px", margin: "0 auto 12px auto", animation: "spin 1s linear infinite", color: "#0F2E5C" }} />
          <p style={{ margin: 0 }}>Menghubungkan ke basis data PostgreSQL...</p>
        </div>
      )}

      {/* Tab 1: Programs */}
      {!loading && activeTab === "programs" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))", gap: "16px" }}>
          {trainings.map((t) => (
            <div 
              key={t.id} 
              style={{
                borderRadius: "18px",
                border: "1px solid #E2E8F0",
                backgroundColor: "#FFFFFF",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "18px"
              }}
            >
              <div>
                {/* Row 1: Top Meta Bar (ID + Category Left, Status Badge Right) */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    <span 
                      style={{ 
                        fontFamily: "monospace", 
                        fontSize: "11px", 
                        fontWeight: 800, 
                        backgroundColor: "#EBF2FA", 
                        color: "#0F2E5C", 
                        padding: "3px 8px", 
                        borderRadius: "6px",
                        whiteSpace: "nowrap",
                        letterSpacing: "0.2px"
                      }}
                    >
                      {t.id}
                    </span>
                    <span 
                      style={{ 
                        fontSize: "11px", 
                        fontWeight: 700, 
                        backgroundColor: "#F1F5F9", 
                        color: "#475569", 
                        padding: "3px 9px", 
                        borderRadius: "9999px",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {t.category}
                    </span>
                  </div>

                  <span 
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "3px 10px",
                      borderRadius: "9999px",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      backgroundColor: t.status === "Selesai" ? "#ECFDF5" : t.status === "Sedang Berjalan" ? "#EFF6FF" : "#FFFBEB",
                      color: t.status === "Selesai" ? "#059669" : t.status === "Sedang Berjalan" ? "#1E40AF" : "#D97706",
                      border: t.status === "Pendaftaran Dibuka" ? "1px solid #FDE68A" : "none"
                    }}
                  >
                    {t.status === "Selesai" ? "✓ Selesai" : t.status === "Sedang Berjalan" ? "● Sedang Berjalan" : "● Pendaftaran Dibuka"}
                  </span>
                </div>

                {/* Row 2: Full-width Title */}
                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: "0 0 6px 0", lineHeight: 1.4 }}>
                  {t.title}
                </h3>

                {/* Row 3: Subtitle & Jenjang SKK */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "11.5px", color: "#64748B", marginBottom: "12px" }}>
                  <span style={{ fontWeight: 600 }}>{t.batch}</span>
                  <span>•</span>
                  <span style={{ backgroundColor: "#F8FAFC", padding: "2px 8px", borderRadius: "6px", border: "1px solid #E2E8F0", color: "#334155", fontWeight: 700 }}>
                    Jenjang SKK: {t.skkLevel}
                  </span>
                </div>

                {/* Info Details Box */}
                <div style={{ backgroundColor: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", color: "#475569" }}>
                  <p style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                    <Calendar style={{ width: "14px", height: "14px", color: "#94A3B8", flexShrink: 0 }} />
                    <span>{t.startDate} s/d {t.endDate}</span>
                  </p>
                  <p style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                    <Users style={{ width: "14px", height: "14px", color: "#94A3B8", flexShrink: 0 }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Penyelenggara: {t.organizer}</span>
                  </p>
                  <p style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                    <Award style={{ width: "14px", height: "14px", color: "#94A3B8", flexShrink: 0 }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Instruktur: {t.instructor}</span>
                  </p>
                </div>
              </div>

              <div>
                <div style={{ paddingTop: "12px", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", flexWrap: "wrap", gap: "6px" }}>
                  <div>
                    <span style={{ color: "#64748B" }}>Kuota: </span>
                    <span style={{ fontWeight: 800, color: "#0F172A" }}>{t.registered} / {t.quota} orang</span>
                  </div>
                  {t.passed > 0 ? (
                    <span style={{ fontWeight: 800, color: "#059669", backgroundColor: "#ECFDF5", padding: "3px 10px", borderRadius: "6px", fontSize: "11px" }}>
                      {t.passed} Peserta Lulus SKK
                    </span>
                  ) : (
                    <span style={{ fontWeight: 700, color: t.status === "Pendaftaran Dibuka" ? "#D97706" : "#64748B", backgroundColor: t.status === "Pendaftaran Dibuka" ? "#FFFBEB" : "#F1F5F9", padding: "3px 8px", borderRadius: "6px", fontSize: "11px" }}>
                      {t.status === "Pendaftaran Dibuka" ? "Pendaftaran Terbuka" : "Tahap Bimtek"}
                    </span>
                  )}
                </div>

                {/* Tombol Daftarkan Peserta */}
                {t.status !== "Selesai" && (
                  <button
                    type="button"
                    onClick={() => setShowRegisterParticipantModal(t.id)}
                    style={{
                      width: "100%",
                      marginTop: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      borderRadius: "10px",
                      backgroundColor: "#F1F5F9",
                      border: "1px solid #CBD5E1",
                      padding: "8px 12px",
                      fontSize: "12px",
                      fontWeight: 800,
                      color: "#0F2E5C",
                      cursor: "pointer"
                    }}
                  >
                    <UserPlus style={{ width: "14px", height: "14px" }} /> Daftarkan Peserta
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Database TKK */}
      {!loading && activeTab === "tkk" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Search bar */}
          <div style={{ borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <Search style={{ width: "16px", height: "16px", color: "#94A3B8" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama TKK, NIK, atau nama badan usaha..."
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
                    <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>NAMA & NIK</th>
                    <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>BADAN USAHA / BUJK</th>
                    <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>PROGRAM PELATIHAN</th>
                    <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>NO. SERTIFIKAT SKK</th>
                    <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>NILAI</th>
                    <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>STATUS</th>
                    <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px", textAlign: "center" }}>E-SERTIFIKAT</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTkk.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: "36px", textAlign: "center", color: "#64748B" }}>
                        Belum ada peserta pelatihan yang terdaftar atau lulus.
                      </td>
                    </tr>
                  ) : (
                    filteredTkk.map((tkk, idx) => (
                      <tr key={tkk.nik || idx} style={{ borderBottom: "1px solid #F1F5F9", transition: "background-color 0.15s ease" }}>
                        <td style={{ padding: "16px 18px" }}>
                          <p style={{ fontWeight: 800, color: "#0F172A", margin: 0, fontSize: "13px" }}>{tkk.name}</p>
                          <p style={{ fontSize: "11px", fontFamily: "monospace", color: "#64748B", margin: "2px 0 0 0" }}>NIK: {tkk.nik}</p>
                        </td>
                        <td style={{ padding: "16px 18px", color: "#334155", fontWeight: 600 }}>
                          {tkk.bujk}
                        </td>
                        <td style={{ padding: "16px 18px" }}>
                          <p style={{ fontWeight: 700, color: "#0F172A", margin: 0 }}>{tkk.trainingTitle}</p>
                          <p style={{ fontSize: "11px", color: "#64748B", margin: "2px 0 0 0" }}>Jenjang: {tkk.skkLevel}</p>
                        </td>
                        <td style={{ padding: "16px 18px" }}>
                          {tkk.certNo ? (
                            <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 8px", borderRadius: "6px", fontSize: "11px" }}>
                              {tkk.certNo}
                            </span>
                          ) : (
                            <span style={{ color: "#94A3B8", fontStyle: "italic" }}>Belum terbit</span>
                          )}
                        </td>
                        <td style={{ padding: "16px 18px", fontWeight: 800, color: "#0F172A", fontSize: "13px" }}>
                          {tkk.score !== undefined ? `${tkk.score} / 100` : "-"}
                        </td>
                        <td style={{ padding: "16px 18px" }}>
                          <span style={{ 
                            display: "inline-block", 
                            backgroundColor: tkk.status === "Lulus" ? "#ECFDF5" : "#EFF6FF", 
                            color: tkk.status === "Lulus" ? "#059669" : "#1E40AF", 
                            padding: "3px 10px", 
                            borderRadius: "9999px", 
                            fontSize: "11px", 
                            fontWeight: 800 
                          }}>
                            {tkk.status || "Terdaftar"}
                          </span>
                        </td>
                        <td style={{ padding: "16px 18px", textAlign: "center" }}>
                          {tkk.status === "Lulus" ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCert({
                                  name: tkk.name,
                                  nik: tkk.nik,
                                  bujk: tkk.bujk,
                                  certNo: tkk.certNo || "SKK-VERIFIED-2026",
                                  trainingTitle: tkk.trainingTitle,
                                });
                              }}
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
                              <Eye style={{ width: "13px", height: "13px" }} /> Lihat
                            </button>
                          ) : (
                            <span style={{ fontSize: "11px", color: "#94A3B8" }}>Proses Bimtek</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Cert Verification Preview */}
      {activeTab === "cert" && (
        <div style={{ borderRadius: "18px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", padding: "36px", maxWidth: "680px", margin: "0 auto", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", textAlign: "center", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ height: "64px", width: "64px", borderRadius: "18px", backgroundColor: "#EBF2FA", color: "#0F2E5C", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <QrCode style={{ width: "36px", height: "36px" }} />
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
              Verifikasi Keaslian e-Certificate TKK
            </h2>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "6px 0 0 0" }}>
              Pindai QR Code pada sertifikat fisik atau masukkan nomor registrasi SKK / NIK untuk memvalidasi keabsahan data di SIPJAKI PUPR
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", maxWidth: "460px", margin: "0 auto", width: "100%" }}>
            <input
              type="text"
              placeholder="Masukkan No. Sertifikat (cth: SKK-2026-001)"
              style={{ flex: 1, borderRadius: "10px", border: "1px solid #CBD5E1", padding: "10px 14px", fontSize: "13px", outline: "none" }}
            />
            <button
              type="button"
              onClick={() => alert("Memverifikasi nomor sertifikat ke server LPJK & BNSP...")}
              style={{ borderRadius: "10px", backgroundColor: "#0F2E5C", color: "#FFFFFF", border: "none", padding: "10px 20px", fontSize: "13px", fontWeight: 800, cursor: "pointer" }}
            >
              Cek Validasi
            </button>
          </div>
        </div>
      )}

      {/* Modal Tambah Pelatihan Baru */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", maxWidth: "580px", width: "100%", padding: "28px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: "18px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <GraduationCap style={{ width: "20px", height: "20px", color: "#0F2E5C" }} />
                <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
                  Buka Kegiatan Pelatihan & Bimtek Baru
                </h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <form onSubmit={handleCreateTraining} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
                  Judul Pelatihan / Bimtek *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Contoh: Bimbingan Teknis K3 Konstruksi (SMKK)"
                  value={newTraining.title}
                  onChange={e => setNewTraining({ ...newTraining, title: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
                    Kategori Pelatihan
                  </label>
                  <select
                    value={newTraining.category}
                    onChange={e => setNewTraining({ ...newTraining, category: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px", backgroundColor: "#FFFFFF" }}
                  >
                    <option value="K3 Konstruksi">K3 Konstruksi</option>
                    <option value="Tenaga Terampil">Tenaga Terampil</option>
                    <option value="Teknologi & Digitalisasi">Teknologi & Digitalisasi</option>
                    <option value="Tata Kelola & Regulasi">Tata Kelola & Regulasi</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
                    Angkatan / Batch
                  </label>
                  <input 
                    type="text"
                    value={newTraining.batch}
                    onChange={e => setNewTraining({ ...newTraining, batch: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
                    Tanggal Mulai
                  </label>
                  <input 
                    type="date"
                    required
                    value={newTraining.startDate}
                    onChange={e => setNewTraining({ ...newTraining, startDate: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
                    Tanggal Selesai
                  </label>
                  <input 
                    type="date"
                    required
                    value={newTraining.endDate}
                    onChange={e => setNewTraining({ ...newTraining, endDate: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
                    Lokasi Pelatihan
                  </label>
                  <input 
                    type="text"
                    value={newTraining.location}
                    onChange={e => setNewTraining({ ...newTraining, location: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
                    Kuota Peserta
                  </label>
                  <input 
                    type="number"
                    min="1"
                    value={newTraining.quota}
                    onChange={e => setNewTraining({ ...newTraining, quota: Number(e.target.value) })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
                    Target Jenjang SKK
                  </label>
                  <select
                    value={newTraining.skkLevel}
                    onChange={e => setNewTraining({ ...newTraining, skkLevel: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px", backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Jenjang 1-2 (Operator/Tukang)">Jenjang 1-2 (Operator/Tukang)</option>
                    <option value="Jenjang 3-4 (Teknisi Junior)">Jenjang 3-4 (Teknisi Junior)</option>
                    <option value="Jenjang 5 (Teknisi/Analis)">Jenjang 5 (Teknisi/Analis)</option>
                    <option value="Jenjang 6 (Ahli Muda)">Jenjang 6 (Ahli Muda)</option>
                    <option value="Semua Jenjang">Semua Jenjang</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
                    Instruktur / Asesor
                  </label>
                  <input 
                    type="text"
                    placeholder="Nama Instruktur & Gelar"
                    value={newTraining.instructor}
                    onChange={e => setNewTraining({ ...newTraining, instructor: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid #F1F5F9", paddingTop: "14px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", fontSize: "12px", fontWeight: 700, color: "#475569", cursor: "pointer" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ padding: "10px 20px", borderRadius: "10px", border: "none", backgroundColor: "#0F2E5C", color: "#FFFFFF", fontSize: "12px", fontWeight: 800, cursor: "pointer", boxShadow: "0 2px 6px rgba(15,46,92,0.2)" }}
                >
                  Simpan Agenda Pelatihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pendaftaran Peserta */}
      {showRegisterParticipantModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", maxWidth: "480px", width: "100%", padding: "26px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <UserPlus style={{ width: "18px", height: "18px", color: "#0F2E5C" }} />
                <h3 style={{ fontSize: "15px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
                  Daftarkan Peserta TKK ({showRegisterParticipantModal})
                </h3>
              </div>
              <button 
                onClick={() => setShowRegisterParticipantModal(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>

            <form onSubmit={handleRegisterParticipant} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
                  Nomor Induk Kependudukan (NIK) *
                </label>
                <input 
                  type="text"
                  required
                  maxLength={16}
                  placeholder="16 digit NIK peserta"
                  value={participantForm.nik}
                  onChange={e => setParticipantForm({ ...participantForm, nik: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px", fontFamily: "monospace" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
                  Nama Lengkap Peserta *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Nama sesuai KTP"
                  value={participantForm.name}
                  onChange={e => setParticipantForm({ ...participantForm, name: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
                  Asal Badan Usaha (BUJK) / Instansi
                </label>
                <input 
                  type="text"
                  placeholder="Contoh: PT Bangun Jaya Konstruksi atau Mandiri"
                  value={participantForm.bujk}
                  onChange={e => setParticipantForm({ ...participantForm, bujk: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid #F1F5F9", paddingTop: "14px" }}>
                <button
                  type="button"
                  onClick={() => setShowRegisterParticipantModal(null)}
                  style={{ padding: "8px 16px", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", fontSize: "12px", fontWeight: 700, color: "#475569", cursor: "pointer" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 18px", borderRadius: "10px", border: "none", backgroundColor: "#0F2E5C", color: "#FFFFFF", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}
                >
                  Daftarkan Peserta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal e-Certificate */}
      {selectedCert && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "18px", maxWidth: "560px", width: "100%", padding: "28px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Award style={{ width: "20px", height: "20px", color: "#059669" }} />
                <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
                  Salinan e-Certificate TKK
                </h3>
              </div>
              <button 
                onClick={() => setSelectedCert(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <div style={{ backgroundColor: "#F8FAFC", borderRadius: "14px", border: "1px solid #E2E8F0", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Nama Tenaga Kerja:</span>
                <p style={{ margin: "2px 0 0 0", fontWeight: 800, color: "#0F172A", fontSize: "16px" }}>{selectedCert.name}</p>
                <p style={{ margin: "2px 0 0 0", fontSize: "12px", fontFamily: "monospace", color: "#64748B" }}>NIK: {selectedCert.nik}</p>
              </div>

              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Badan Usaha (BUJK):</span>
                <p style={{ margin: "2px 0 0 0", fontWeight: 600, color: "#0F172A" }}>{selectedCert.bujk}</p>
              </div>

              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Bidang Pelatihan & Kompetensi:</span>
                <p style={{ margin: "2px 0 0 0", fontWeight: 700, color: "#0F2E5C" }}>{selectedCert.trainingTitle}</p>
              </div>

              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Nomor Registrasi Sertifikat:</span>
                <p style={{ margin: "2px 0 0 0", fontFamily: "monospace", fontWeight: 800, color: "#059669" }}>{selectedCert.certNo}</p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "10px", borderTop: "1px solid #F1F5F9" }}>
              <button
                type="button"
                onClick={() => alert("Mengunduh sertifikat digital resmi bertanda tangan elektronik...")}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "10px", backgroundColor: "#0F2E5C", color: "#FFFFFF", border: "none", padding: "8px 18px", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}
              >
                <Download style={{ width: "14px", height: "14px" }} /> Unduh e-Certificate (PDF)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Import Modal Pelatihan */}
      <BatchImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Impor Program Pelatihan & Bimtek (SIPJAKI)"
        subtitle="Unggah berkas Excel (.xlsx) atau CSV data program pelatihan dan sertifikasi TKK Kabupaten Bogor"
        templateFileName={TEMPLATE_PELATIHAN.exportFileName}
        expectedColumns={TEMPLATE_PELATIHAN.importColumns}
        sampleRows={TEMPLATE_PELATIHAN.sampleRows}
        template={TEMPLATE_PELATIHAN}
        onCommit={handleBatchCommit}
      />
    </div>
  );
}

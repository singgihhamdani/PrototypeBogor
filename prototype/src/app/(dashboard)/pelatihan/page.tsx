"use client";
import { useState, useEffect, useMemo } from "react";
import { 
  GraduationCap, Search, Calendar, Users, Award, Download, 
  CheckCircle2, Clock, Plus, QrCode, FileCheck, Eye, X, FileSpreadsheet,
  Database as DbIcon, RefreshCw, AlertCircle, UserPlus, Edit3, Trash2,
  Filter, ArrowUpDown, ShieldCheck, Check, Sparkles
} from "lucide-react";
import BatchImportModal from "@/components/common/batch-import-modal";
import { TEMPLATE_PELATIHAN } from "@/lib/sipjaki-templates";
import { exportToSpreadsheet } from "@/lib/export-utils";
import { 
  fetchPelatihanList, 
  createPelatihanAgenda, 
  registerPesertaPelatihan, 
  batchImportPelatihan, 
  updateParticipant,
  deleteParticipant,
  validateParticipantDpu,
  deletePelatihanAgenda,
  TrainingItem, 
  TrainingParticipant,
  DataSourceStatus,
  JenjangPP14
} from "@/lib/services/pelatihan-service";

const JENJANG_PP14_OPTIONS: JenjangPP14[] = [
  "Jenjang 1",
  "Jenjang 2",
  "Jenjang 3",
  "Jenjang 4",
  "Jenjang 5",
  "Jenjang 6"
];

const JENJANG_PP14_LABELS: Record<JenjangPP14, string> = {
  "Jenjang 1": "Jenjang 1 (Operator Pemula)",
  "Jenjang 2": "Jenjang 2 (Operator / Tukang)",
  "Jenjang 3": "Jenjang 3 (Teknisi Pemula / Mandor)",
  "Jenjang 4": "Jenjang 4 (Teknisi / Analis)",
  "Jenjang 5": "Jenjang 5 (Teknisi / Analis Madya)",
  "Jenjang 6": "Jenjang 6 (Teknisi / Analis Utama)"
};

export default function PelatihanPage() {
  const [trainings, setTrainings] = useState<TrainingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<DataSourceStatus>({
    source: "supabase",
    message: "Memuat data dari database..."
  });

  const [activeTab, setActiveTab] = useState<"programs" | "tkk" | "cert">("programs");
  
  // Multi-Filter State (Setting Default: Riwayat Terkini DESC)
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("Semua");
  const [filterJenjang, setFilterJenjang] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterCert, setFilterCert] = useState("Semua");
  const [sortBy, setSortBy] = useState<"terkini" | "terlama" | "nilai">("terkini");

  // Modal States
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRegisterParticipantModal, setShowRegisterParticipantModal] = useState<string | null>(null);

  // Edit Participant Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<{
    agendaId: string;
    nik: string;
    name: string;
    bujk: string;
    skkLevel: string;
    score: number;
    certNoDpu: string;
    certNoLpjk: string;
    isValidated: boolean;
    status: string;
  } | null>(null);

  // Delete Confirm Dialog State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingParticipant, setDeletingParticipant] = useState<{
    agendaId: string;
    nik: string;
    name: string;
  } | null>(null);

  // Action status feedback
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // New Training Form State
  const [newTraining, setNewTraining] = useState({
    title: "",
    category: "K3 Konstruksi",
    batch: "Angkatan I / 2026",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
    location: "Auditorium DPU Kab. Bogor",
    quota: 40,
    skkLevel: "Jenjang 5",
    organizer: "Bidang Jasa Konstruksi DPU Kab. Bogor",
    instructor: ""
  });

  // Participant Form State
  const [participantForm, setParticipantForm] = useState({
    nik: "",
    name: "",
    bujk: "",
    skkLevel: "Jenjang 3"
  });

  const [selectedCert, setSelectedCert] = useState<{
    name: string;
    nik: string;
    bujk: string;
    certNo: string;
    certType: "DPU" | "LPJK";
    trainingTitle: string;
    skkLevel?: string;
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

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Extract all participants across training with sorting and filtering
  const allTkk = useMemo(() => {
    const list: Array<TrainingParticipant & {
      agendaId: string;
      trainingTitle: string;
      trainingCategory: string;
      date: string;
      updatedAt: string;
    }> = [];

    trainings.forEach(t => {
      (t.participants || []).forEach(p => {
        list.push({
          ...p,
          agendaId: t.id,
          trainingTitle: t.title,
          trainingCategory: t.category,
          skkLevel: p.skkLevel || t.skkLevel || "Jenjang 3",
          date: t.endDate,
          updatedAt: p.updatedAt || t.endDate || t.startDate
        });
      });
    });

    return list
      .filter(t => {
        const matchSearch = 
          (t.name || "").toLowerCase().includes(search.toLowerCase()) ||
          (t.nik || "").includes(search) ||
          (t.bujk || "").toLowerCase().includes(search.toLowerCase()) ||
          (t.certNoDpu || "").toLowerCase().includes(search.toLowerCase()) ||
          (t.certNoLpjk || "").toLowerCase().includes(search.toLowerCase());
        
        const matchCat = filterCategory === "Semua" || t.trainingCategory === filterCategory;
        const matchJenjang = filterJenjang === "Semua" || t.skkLevel === filterJenjang;
        const matchStatus = filterStatus === "Semua" || t.status === filterStatus;
        const matchCert = filterCert === "Semua" || 
          (filterCert === "Sertifikat DPU Terbit" && !!t.certNoDpu) ||
          (filterCert === "SKK LPJK Terbit" && !!t.certNoLpjk) ||
          (filterCert === "Belum Terbit" && !t.certNoDpu && !t.certNoLpjk);

        return matchSearch && matchCat && matchJenjang && matchStatus && matchCert;
      })
      .sort((a, b) => {
        if (sortBy === "terkini") {
          // Setting Default: Riwayat Terkini di Atas (DESC)
          return new Date(b.updatedAt || b.date).getTime() - new Date(a.updatedAt || a.date).getTime();
        } else if (sortBy === "terlama") {
          return new Date(a.updatedAt || a.date).getTime() - new Date(b.updatedAt || b.date).getTime();
        } else if (sortBy === "nilai") {
          return (Number(b.score) || 0) - (Number(a.score) || 0);
        }
        return 0;
      });
  }, [trainings, search, filterCategory, filterJenjang, filterStatus, filterCert, sortBy]);

  const handleCreateTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTraining.title.trim()) {
      alert("Judul kegiatan wajib diisi!");
      return;
    }

    const res = await createPelatihanAgenda(newTraining);
    if (res.success) {
      triggerNotice("Agenda pelatihan baru berhasil dibuka dan tersimpan di database!");
      setShowAddModal(false);
      setNewTraining({
        title: "",
        category: "K3 Konstruksi",
        batch: "Angkatan I / 2026",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
        location: "Auditorium DPU Kab. Bogor",
        quota: 40,
        skkLevel: "Jenjang 5",
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
      triggerNotice("Peserta berhasil didaftarkan ke kegiatan pelatihan!");
      setShowRegisterParticipantModal(null);
      setParticipantForm({ nik: "", name: "", bujk: "", skkLevel: "Jenjang 3" });
      loadData();
    } else {
      alert(`Gagal mendaftarkan peserta: ${res.error}`);
    }
  };

  // Validasi Registrasi & Auto-generate Sertifikat DPU
  const handleValidateDpu = async (agendaId: string, nik: string, name: string) => {
    const res = await validateParticipantDpu(agendaId, nik);
    if (res.success) {
      triggerNotice(`Registrasi tervalidasi! Sertifikat Partisipasi DPU berhasil diterbitkan otomatis: ${res.certNoDpu}`);
      loadData();
    } else {
      alert(`Gagal validasi sertifikat: ${res.error}`);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (tkk: any) => {
    setEditingParticipant({
      agendaId: tkk.agendaId,
      nik: tkk.nik,
      name: tkk.name,
      bujk: tkk.bujk || "",
      skkLevel: tkk.skkLevel || "Jenjang 3",
      score: tkk.score || 0,
      certNoDpu: tkk.certNoDpu || "",
      certNoLpjk: tkk.certNoLpjk || "",
      isValidated: !!tkk.isValidated || !!tkk.certNoDpu,
      status: tkk.status || "Terdaftar"
    });
    setEditModalOpen(true);
  };

  // Save Edit Participant
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParticipant) return;

    const res = await updateParticipant(editingParticipant.agendaId, editingParticipant.nik, {
      name: editingParticipant.name,
      bujk: editingParticipant.bujk,
      skkLevel: editingParticipant.skkLevel,
      score: Number(editingParticipant.score),
      certNoDpu: editingParticipant.certNoDpu,
      certNoLpjk: editingParticipant.certNoLpjk,
      isValidated: editingParticipant.isValidated,
      status: editingParticipant.status
    });

    if (res.success) {
      triggerNotice(`Data peserta ${editingParticipant.name} (NIK: ${editingParticipant.nik}) berhasil diperbarui!`);
      setEditModalOpen(false);
      setEditingParticipant(null);
      loadData();
    } else {
      alert(`Gagal memperbarui data: ${res.error}`);
    }
  };

  // Open Delete Confirm Dialog
  const handleOpenDelete = (agendaId: string, nik: string, name: string) => {
    setDeletingParticipant({ agendaId, nik, name });
    setDeleteConfirmOpen(true);
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!deletingParticipant) return;
    const res = await deleteParticipant(deletingParticipant.agendaId, deletingParticipant.nik);
    if (res.success) {
      triggerNotice(`Data peserta ${deletingParticipant.name} berhasil dihapus dari database.`);
      setDeleteConfirmOpen(false);
      setDeletingParticipant(null);
      loadData();
    } else {
      alert(`Gagal menghapus data: ${res.error}`);
    }
  };

  const handleBatchCommit = async (parsedData: Record<string, any>[]) => {
    const res = await batchImportPelatihan(parsedData);
    if (res.success) {
      triggerNotice(`Berhasil mengimpor ${res.insertedCount} kegiatan pelatihan ke dalam database!`);
      loadData();
    } else {
      alert(`Gagal impor batch: ${res.error}`);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Toast Notification */}
      {actionNotice && (
        <div 
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            backgroundColor: "#0F2E5C",
            color: "#FFFFFF",
            padding: "14px 20px",
            borderRadius: "14px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            zIndex: 99999,
            fontSize: "13px",
            fontWeight: 700,
            border: "1px solid #FFC000"
          }}
        >
          <Sparkles style={{ width: "18px", height: "18px", color: "#FFC000" }} />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <GraduationCap style={{ width: "12px", height: "12px" }} /> Pilar 5: Penyelenggaraan Pelatihan & Fasilitasi Sertifikasi TKK
            </span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#475569", backgroundColor: "#F1F5F9", padding: "3px 10px", borderRadius: "9999px" }}>
              Standar PP No. 14 Tahun 2021 & Permen PUPR 1/2023
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
            Hub Pelatihan & Fasilitasi Sertifikasi Tenaga Kerja Konstruksi (TKK)
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
            Penerbitan otomatis Sertifikat Partisipasi DPU, integrasi registrasi SKK LPJK, dan manajemen portofolio TKK Kabupaten Bogor
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
            <p style={{ fontSize: "11px", color: "#94A3B8", margin: "4px 0 0 0" }}>TA 2026 ({trainings.length} Program Aktif)</p>
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
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Lulus Bersertifikat DPU/SKK</span>
            <div style={{ height: "36px", width: "36px", borderRadius: "10px", backgroundColor: "#ECFDF5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Award style={{ width: "18px", height: "18px" }} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: "28px", fontWeight: 900, color: "#059669", margin: 0, lineHeight: 1.1 }}>
              {trainings.reduce((acc, t) => acc + (t.passed || 0), 0)}
            </p>
            <p style={{ fontSize: "11px", color: "#059669", fontWeight: 700, margin: "4px 0 0 0" }}>Terverifikasi DPU & LPJK</p>
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
          { id: "programs", label: `Program Pelatihan & Bimtek (${trainings.length})` },
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
                backgroundColor: "#FFFFFF",
                borderRadius: "18px",
                border: "1px solid #E2E8F0",
                padding: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "16px"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "2px 8px", borderRadius: "6px" }}>
                      {t.category}
                    </span>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748B", backgroundColor: "#F1F5F9", padding: "2px 8px", borderRadius: "6px" }}>
                      {t.batch}
                    </span>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "#0284C7", backgroundColor: "#E0F2FE", padding: "2px 8px", borderRadius: "6px" }}>
                      PP 14/2021: {t.skkLevel}
                    </span>
                  </div>

                  <span style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    backgroundColor: t.status === "Selesai" ? "#ECFDF5" : t.status === "Sedang Berjalan" ? "#EFF6FF" : "#FFFBEB",
                    color: t.status === "Selesai" ? "#065F46" : t.status === "Sedang Berjalan" ? "#1E40AF" : "#92400E",
                    border: `1px solid ${t.status === "Selesai" ? "#A7F3D0" : t.status === "Sedang Berjalan" ? "#BFDBFE" : "#FDE68A"}`
                  }}>
                    {t.status}
                  </span>
                </div>

                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0, lineHeight: 1.35 }}>
                  {t.title}
                </h3>

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

      {/* Tab 2: Database TKK Tersertifikasi */}
      {!loading && activeTab === "tkk" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          
          {/* TOOLBAR FILTER DATABASE TERPADU (DEFAULT: KRONOLOGIS TERKINI DESC) */}
          <div 
            style={{ 
              borderRadius: "18px", 
              border: "1px solid #E2E8F0", 
              backgroundColor: "#FFFFFF", 
              padding: "18px 22px", 
              display: "flex", 
              flexDirection: "column", 
              gap: "14px", 
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)" 
            }}
          >
            {/* Top Row: Search Box & Default Badge */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div 
                style={{ 
                  flex: 1, 
                  minWidth: "280px", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "10px", 
                  borderRadius: "12px", 
                  border: "1px solid #CBD5E1", 
                  backgroundColor: "#F8FAFC", 
                  padding: "8px 14px" 
                }}
              >
                <Search style={{ width: "16px", height: "16px", color: "#94A3B8" }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari berdasarkan nama TKK, NIK, BUJK, atau nomor sertifikat..."
                  style={{
                    border: "none",
                    outline: "none",
                    width: "100%",
                    fontSize: "12px",
                    color: "#0F172A",
                    backgroundColor: "transparent"
                  }}
                />
              </div>

              {/* Badge Indikator Setting Default */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span 
                  style={{ 
                    fontSize: "11px", 
                    fontWeight: 800, 
                    color: "#0F2E5C", 
                    backgroundColor: "#E0F2FE", 
                    padding: "6px 12px", 
                    borderRadius: "9999px", 
                    border: "1px solid #BAE6FD",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <ArrowUpDown style={{ width: "12px", height: "12px", color: "#0284C7" }} />
                  <span>Default: Riwayat Terkini (DESC)</span>
                </span>
                
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}>
                  Total: <strong>{allTkk.length}</strong> TKK
                </span>
              </div>
            </div>

            {/* Bottom Row: Multi-Filter Selects */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
              
              {/* Filter 1: Kategori Pelatihan */}
              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "4px" }}>
                  Kategori Pelatihan
                </label>
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "12px", backgroundColor: "#FFFFFF", color: "#0F172A" }}
                >
                  <option value="Semua">Semua Kategori</option>
                  <option value="K3 Konstruksi">K3 Konstruksi</option>
                  <option value="Tenaga Terampil">Tenaga Terampil</option>
                  <option value="Teknologi & Digitalisasi">Teknologi & Digitalisasi</option>
                  <option value="Tata Kelola & Regulasi">Tata Kelola & Regulasi</option>
                </select>
              </div>

              {/* Filter 2: Jenjang PP 14/2021 (Diskret 1 s/d 6) */}
              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "4px" }}>
                  Jenjang PP 14/2021
                </label>
                <select
                  value={filterJenjang}
                  onChange={e => setFilterJenjang(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", borderRadius: "10px", border: "1px solid #0284C7", fontSize: "12px", backgroundColor: "#F0F9FF", color: "#0369A1", fontWeight: 700 }}
                >
                  <option value="Semua">Semua Jenjang</option>
                  {JENJANG_PP14_OPTIONS.map(j => (
                    <option key={j} value={j}>{JENJANG_PP14_LABELS[j]}</option>
                  ))}
                </select>
              </div>

              {/* Filter 3: Status Kelulusan */}
              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "4px" }}>
                  Status Kelulusan
                </label>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "12px", backgroundColor: "#FFFFFF", color: "#0F172A" }}
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Lulus">Lulus</option>
                  <option value="Proses Bimtek">Proses Bimtek</option>
                  <option value="Terdaftar">Terdaftar</option>
                </select>
              </div>

              {/* Filter 4: Status Sertifikat */}
              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "4px" }}>
                  Status Sertifikat
                </label>
                <select
                  value={filterCert}
                  onChange={e => setFilterCert(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "12px", backgroundColor: "#FFFFFF", color: "#0F172A" }}
                >
                  <option value="Semua">Semua Sertifikat</option>
                  <option value="Sertifikat DPU Terbit">Sertifikat DPU Terbit</option>
                  <option value="SKK LPJK Terbit">SKK LPJK Terbit</option>
                  <option value="Belum Terbit">Belum Terbit</option>
                </select>
              </div>

              {/* Filter 5: Urutan / Sort By */}
              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "4px" }}>
                  Urutan Data
                </label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  style={{ width: "100%", padding: "7px 10px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "12px", backgroundColor: "#FFFFFF", color: "#0F172A", fontWeight: 700 }}
                >
                  <option value="terkini">Riwayat Terkini (Default)</option>
                  <option value="terlama">Riwayat Terlama</option>
                  <option value="nilai">Nilai Uji Tertinggi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container 9 Kolom Standar */}
          <div style={{ borderRadius: "18px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#0F2E5C", color: "#FFFFFF", borderBottom: "3px solid #FFC000", textAlign: "left" }}>
                    <th style={{ padding: "14px 14px", fontWeight: 800, fontSize: "11px", letterSpacing: "0.5px", width: "40px", textAlign: "center" }}>NO</th>
                    <th style={{ padding: "14px 16px", fontWeight: 800, fontSize: "11px", letterSpacing: "0.5px" }}>NAMA & NIK</th>
                    <th style={{ padding: "14px 16px", fontWeight: 800, fontSize: "11px", letterSpacing: "0.5px" }}>BADAN USAHA / BUJK</th>
                    <th style={{ padding: "14px 16px", fontWeight: 800, fontSize: "11px", letterSpacing: "0.5px" }}>PROGRAM PELATIHAN</th>
                    <th style={{ padding: "14px 14px", fontWeight: 800, fontSize: "11px", letterSpacing: "0.5px" }}>JENJANG (PP 14/2021)</th>
                    <th style={{ padding: "14px 16px", fontWeight: 800, fontSize: "11px", letterSpacing: "0.5px" }}>SERTIFIKAT PARTISIPASI (DPU)</th>
                    <th style={{ padding: "14px 16px", fontWeight: 800, fontSize: "11px", letterSpacing: "0.5px" }}>SERTIFIKAT SKK (LPJK)</th>
                    <th style={{ padding: "14px 14px", fontWeight: 800, fontSize: "11px", letterSpacing: "0.5px", textAlign: "center" }}>NILAI & STATUS</th>
                    {/* Header Kolom Aksi Dinamai "EDIT" Sesuai Permintaan */}
                    <th style={{ padding: "14px 16px", fontWeight: 900, fontSize: "11px", letterSpacing: "0.5px", textAlign: "center", backgroundColor: "#07182E" }}>EDIT</th>
                  </tr>
                </thead>
                <tbody>
                  {allTkk.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: "36px", textAlign: "center", color: "#64748B" }}>
                        Tidak ada data tenaga kerja konstruksi yang sesuai dengan kriteria filter.
                      </td>
                    </tr>
                  ) : (
                    allTkk.map((tkk, idx) => (
                      <tr 
                        key={tkk.nik || idx} 
                        style={{ 
                          borderBottom: "1px solid #F1F5F9", 
                          backgroundColor: idx === 0 ? "#F8FAFC" : "transparent",
                          transition: "background-color 0.15s ease" 
                        }}
                      >
                        {/* 1. NO */}
                        <td style={{ padding: "14px 14px", textAlign: "center", fontWeight: 700, color: "#64748B" }}>
                          {idx + 1}
                        </td>

                        {/* 2. NAMA & NIK */}
                        <td style={{ padding: "14px 16px" }}>
                          <p style={{ fontWeight: 800, color: "#0F172A", margin: 0, fontSize: "13px" }}>{tkk.name}</p>
                          <p style={{ fontSize: "11px", fontFamily: "monospace", color: "#64748B", margin: "2px 0 0 0" }}>NIK: {tkk.nik}</p>
                        </td>

                        {/* 3. BADAN USAHA */}
                        <td style={{ padding: "14px 16px", color: "#334155", fontWeight: 600 }}>
                          {tkk.bujk || "-"}
                        </td>

                        {/* 4. PROGRAM PELATIHAN */}
                        <td style={{ padding: "14px 16px" }}>
                          <p style={{ fontWeight: 700, color: "#0F172A", margin: 0, maxWidth: "260px" }}>{tkk.trainingTitle}</p>
                          <span style={{ fontSize: "10px", color: "#64748B" }}>{tkk.trainingCategory} • {tkk.date}</span>
                        </td>

                        {/* 5. JENJANG DISKRET PP 14/2021 */}
                        <td style={{ padding: "14px 14px" }}>
                          <span 
                            style={{ 
                              display: "inline-block",
                              fontFamily: "monospace", 
                              fontWeight: 800, 
                              color: "#0369A1", 
                              backgroundColor: "#E0F2FE", 
                              padding: "3px 8px", 
                              borderRadius: "6px", 
                              fontSize: "11px",
                              border: "1px solid #BAE6FD",
                              whiteSpace: "nowrap"
                            }}
                          >
                            {tkk.skkLevel || "Jenjang 3"}
                          </span>
                        </td>

                        {/* 6. SERTIFIKAT PARTISIPASI (DPU - OTOMATIS BY SISTEM) */}
                        <td style={{ padding: "14px 16px" }}>
                          {tkk.certNoDpu ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#065F46", backgroundColor: "#ECFDF5", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", border: "1px solid #A7F3D0" }}>
                                {tkk.certNoDpu}
                              </span>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ fontSize: "10px", color: "#059669", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "2px" }}>
                                  <CheckCircle2 style={{ width: "11px", height: "11px" }} /> Terbit Otomatis
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedCert({
                                    name: tkk.name,
                                    nik: tkk.nik,
                                    bujk: tkk.bujk,
                                    certNo: tkk.certNoDpu || "",
                                    certType: "DPU",
                                    trainingTitle: tkk.trainingTitle,
                                    skkLevel: tkk.skkLevel
                                  })}
                                  style={{ background: "none", border: "none", cursor: "pointer", color: "#0F2E5C", fontSize: "11px", fontWeight: 800, textDecoration: "underline", padding: 0 }}
                                >
                                  Lihat E-Sertifikat
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleValidateDpu(tkk.agendaId, tkk.nik, tkk.name)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                backgroundColor: "#FEF3C7",
                                color: "#92400E",
                                border: "1px solid #FCD34D",
                                padding: "4px 10px",
                                borderRadius: "8px",
                                fontSize: "11px",
                                fontWeight: 800,
                                cursor: "pointer"
                              }}
                              title="Validasi registrasi dan generate nomor sertifikat otomatis"
                            >
                              <Sparkles style={{ width: "12px", height: "12px", color: "#D97706" }} />
                              <span>Validasi & Terbitkan</span>
                            </button>
                          )}
                        </td>

                        {/* 7. SERTIFIKAT SKK (LPJK - INPUT MANUAL) */}
                        <td style={{ padding: "14px 16px" }}>
                          {tkk.certNoLpjk ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#1E40AF", backgroundColor: "#EFF6FF", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", border: "1px solid #BFDBFE" }}>
                                {tkk.certNoLpjk}
                              </span>
                              <span style={{ fontSize: "10px", color: "#2563EB", fontWeight: 700 }}>
                                Terdaftar LPJK / BNSP
                              </span>
                            </div>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ color: "#94A3B8", fontStyle: "italic", fontSize: "11px" }}>
                                Belum Terbit (LPJK)
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(tkk)}
                                title="Klik untuk menginput nomor SKK LPJK"
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#0284C7", fontSize: "11px", fontWeight: 700, padding: 0 }}
                              >
                                + Input SKK
                              </button>
                            </div>
                          )}
                        </td>

                        {/* 8. NILAI & STATUS */}
                        <td style={{ padding: "14px 14px", textAlign: "center" }}>
                          <p style={{ fontWeight: 800, color: "#0F172A", fontSize: "12px", margin: 0 }}>
                            {tkk.score !== undefined && tkk.score > 0 ? `${tkk.score} / 100` : "-"}
                          </p>
                          <span style={{ 
                            display: "inline-block", 
                            marginTop: "3px",
                            backgroundColor: tkk.status === "Lulus" ? "#ECFDF5" : tkk.status === "Proses Bimtek" ? "#EFF6FF" : "#F1F5F9", 
                            color: tkk.status === "Lulus" ? "#059669" : tkk.status === "Proses Bimtek" ? "#1E40AF" : "#475569", 
                            padding: "2px 8px", 
                            borderRadius: "9999px", 
                            fontSize: "10px", 
                            fontWeight: 800 
                          }}>
                            {tkk.status || "Terdaftar"}
                          </span>
                        </td>

                        {/* 9. KOLOM AKSI: EDIT (TOMBOL EDIT & HAPUS) */}
                        <td style={{ padding: "14px 16px", textAlign: "center" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            {/* Tombol Edit */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(tkk)}
                              title="Edit Data Peserta & Sertifikat"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                borderRadius: "8px",
                                backgroundColor: "#0F2E5C",
                                color: "#FFFFFF",
                                padding: "6px 12px",
                                fontSize: "11px",
                                fontWeight: 800,
                                border: "none",
                                cursor: "pointer",
                                boxShadow: "0 1px 3px rgba(15,46,92,0.2)"
                              }}
                            >
                              <Edit3 style={{ width: "12px", height: "12px", color: "#FFC000" }} />
                              <span>Edit</span>
                            </button>

                            {/* Tombol Hapus */}
                            <button
                              type="button"
                              onClick={() => handleOpenDelete(tkk.agendaId, tkk.nik, tkk.name)}
                              title="Hapus Peserta dari Database"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                borderRadius: "8px",
                                backgroundColor: "#FEF2F2",
                                color: "#DC2626",
                                padding: "6px 10px",
                                fontSize: "11px",
                                fontWeight: 700,
                                border: "1px solid #FECACA",
                                cursor: "pointer"
                              }}
                            >
                              <Trash2 style={{ width: "12px", height: "12px" }} />
                              <span>Hapus</span>
                            </button>
                          </div>
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
              Pindai QR Code pada sertifikat fisik atau masukkan nomor registrasi SKK / Sertifikat DPU / NIK untuk memvalidasi keabsahan data di SIPJAKI PUPR
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", maxWidth: "460px", margin: "0 auto", width: "100%" }}>
            <input
              type="text"
              placeholder="Nomor Sertifikat DPU atau SKK LPJK"
              style={{ flex: 1, borderRadius: "10px", border: "1px solid #CBD5E1", padding: "10px 14px", fontSize: "13px", outline: "none" }}
            />
            <button
              type="button"
              onClick={() => alert("Memverifikasi nomor sertifikat ke server LPJK & SIPJAKI DPU Kab. Bogor...")}
              style={{ borderRadius: "10px", backgroundColor: "#0F2E5C", color: "#FFFFFF", border: "none", padding: "10px 20px", fontSize: "13px", fontWeight: 800, cursor: "pointer" }}
            >
              Cek Validasi
            </button>
          </div>
        </div>
      )}

      {/* MODAL EDIT PESERTA & SERTIFIKASI LENGKAP */}
      {editModalOpen && editingParticipant && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "24px", maxWidth: "680px", width: "100%", padding: "32px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", gap: "18px", maxHeight: "92vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #E2E8F0", paddingBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#EBF2FA", color: "#0F2E5C", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Edit3 style={{ width: "20px", height: "20px" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
                    Edit Data Peserta & Sertifikasi TKK
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
                    Kelola identitas, jenjang PP 14/2021, sertifikat DPU dan nomor SKK LPJK
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setEditModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: "6px", borderRadius: "8px" }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#334155", textTransform: "uppercase", marginBottom: "6px" }}>
                    Nomor Induk Kependudukan (NIK)
                  </label>
                  <input 
                    type="text"
                    disabled
                    value={editingParticipant.nik}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #E2E8F0", fontSize: "13px", backgroundColor: "#F8FAFC", fontFamily: "monospace", color: "#64748B", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#334155", textTransform: "uppercase", marginBottom: "6px" }}>
                    Nama Lengkap Peserta *
                  </label>
                  <input 
                    type="text"
                    required
                    value={editingParticipant.name}
                    onChange={e => setEditingParticipant({ ...editingParticipant, name: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px", fontWeight: 600, color: "#0F172A", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#334155", textTransform: "uppercase", marginBottom: "6px" }}>
                  Asal Badan Usaha (BUJK) / Instansi
                </label>
                <input 
                  type="text"
                  value={editingParticipant.bujk}
                  onChange={e => setEditingParticipant({ ...editingParticipant, bujk: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F172A", boxSizing: "border-box" }}
                />
              </div>

              {/* Jenjang Kualifikasi Diskret PP 14/2021 */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#0F2E5C", textTransform: "uppercase", marginBottom: "6px" }}>
                  Klasifikasi Jenjang Tenaga Terampil (PP No. 14 Tahun 2021) *
                </label>
                <select
                  value={editingParticipant.skkLevel}
                  onChange={e => setEditingParticipant({ ...editingParticipant, skkLevel: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "2px solid #0284C7", fontSize: "13px", backgroundColor: "#F0F9FF", color: "#0369A1", fontWeight: 700, boxSizing: "border-box" }}
                >
                  {JENJANG_PP14_OPTIONS.map(j => (
                    <option key={j} value={j}>{JENJANG_PP14_LABELS[j]}</option>
                  ))}
                </select>
                <span style={{ fontSize: "11px", color: "#64748B", marginTop: "4px", display: "block" }}>
                  *Sesuai ketentuan PP No. 14/2021, jenjang dicatat diskret (1 s/d 6) tanpa rentang gabungan.
                </span>
              </div>

              {/* Nilai Akhir & Status Kelulusan */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#334155", textTransform: "uppercase", marginBottom: "6px" }}>
                    Nilai Akhir (0 - 100)
                  </label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={editingParticipant.score}
                    onChange={e => setEditingParticipant({ ...editingParticipant, score: Number(e.target.value) })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px", fontWeight: 700, boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#334155", textTransform: "uppercase", marginBottom: "6px" }}>
                    Status Kelulusan
                  </label>
                  <select
                    value={editingParticipant.status}
                    onChange={e => setEditingParticipant({ ...editingParticipant, status: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px", backgroundColor: "#FFFFFF", fontWeight: 600, boxSizing: "border-box" }}
                  >
                    <option value="Terdaftar">Terdaftar</option>
                    <option value="Proses Bimtek">Proses Bimtek</option>
                    <option value="Lulus">Lulus</option>
                    <option value="Tidak Lulus">Tidak Lulus</option>
                  </select>
                </div>
              </div>

              {/* Bagian 2 Sertifikat */}
              <div style={{ backgroundColor: "#F8FAFC", borderRadius: "14px", border: "1px solid #E2E8F0", padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Integrasi 2 Sertifikasi (DPU vs LPJK)
                </span>

                {/* Kolom 1: Sertifikat Partisipasi DPU (Auto Generated) */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#065F46", marginBottom: "6px" }}>
                    1. Sertifikat Partisipasi (Kegiatan DPU Kab. Bogor)
                  </label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input 
                      type="text"
                      placeholder="Contoh: 2026/DPU-K3/0014"
                      value={editingParticipant.certNoDpu}
                      onChange={e => setEditingParticipant({ ...editingParticipant, certNoDpu: e.target.value })}
                      style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px", fontFamily: "monospace", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const yr = new Date().getFullYear();
                        const rnd = Math.floor(1000 + Math.random() * 9000);
                        const autoCert = `${yr}/DPU-TKK/${rnd}`;
                        setEditingParticipant({
                          ...editingParticipant,
                          certNoDpu: autoCert,
                          isValidated: true,
                          status: "Lulus"
                        });
                      }}
                      style={{ padding: "10px 16px", borderRadius: "10px", backgroundColor: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0", fontSize: "12px", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      Generate Auto DPU
                    </button>
                  </div>
                </div>

                {/* Kolom 2: Sertifikat Kompetensi Kerja / SKK (Manual Input LPJK) */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#1E40AF", marginBottom: "6px" }}>
                    2. Sertifikat Kompetensi Kerja / SKK (Input Manual Nomor LPJK)
                  </label>
                  <input 
                    type="text"
                    placeholder="Contoh: REG-2026-LPJK-88219 atau SKK-TUK-2026-041"
                    value={editingParticipant.certNoLpjk}
                    onChange={e => setEditingParticipant({ ...editingParticipant, certNoLpjk: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px", fontFamily: "monospace", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
                  />
                  <span style={{ fontSize: "11px", color: "#64748B", marginTop: "4px", display: "block" }}>
                    *Nomor SKK resmi diinput manual sesuai dengan lembar sertifikat yang diterbitkan LPJK/BNSP.
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px", borderTop: "1px solid #E2E8F0", paddingTop: "18px" }}>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  style={{ padding: "10px 20px", borderRadius: "12px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", fontSize: "13px", fontWeight: 700, color: "#475569", cursor: "pointer" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ padding: "10px 24px", borderRadius: "12px", border: "none", backgroundColor: "#0F2E5C", color: "#FFFFFF", fontSize: "13px", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(15,46,92,0.25)", borderBottom: "2px solid #FFC000" }}
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG KONFIRMASI HAPUS PESERTA */}
      {deleteConfirmOpen && deletingParticipant && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "24px", maxWidth: "480px", width: "100%", padding: "32px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", gap: "18px", textAlign: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "18px", backgroundColor: "#FEF2F2", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", border: "1px solid #FECACA" }}>
              <Trash2 style={{ width: "28px", height: "28px" }} />
            </div>

            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
                Hapus Data Peserta Pelatihan?
              </h3>
              <p style={{ fontSize: "13px", color: "#64748B", margin: "8px 0 0 0", lineHeight: 1.5 }}>
                Apakah Anda yakin ingin menghapus peserta <strong>{deletingParticipant.name}</strong> (NIK: <span style={{ fontFamily: "monospace" }}>{deletingParticipant.nik}</span>) dari basis data? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setDeletingParticipant(null);
                }}
                style={{ padding: "9px 18px", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", fontSize: "12px", fontWeight: 700, color: "#475569", cursor: "pointer" }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{ padding: "9px 20px", borderRadius: "10px", border: "none", backgroundColor: "#DC2626", color: "#FFFFFF", fontSize: "12px", fontWeight: 800, cursor: "pointer", boxShadow: "0 2px 6px rgba(220,38,38,0.25)" }}
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buka Pelatihan Baru */}
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
                    value={newTraining.endDate}
                    onChange={e => setNewTraining({ ...newTraining, endDate: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
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
                {/* Opsi Jenjang Diskret PP 14/2021 */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
                    Target Jenjang SKK (PP 14/2021)
                  </label>
                  <select
                    value={newTraining.skkLevel}
                    onChange={e => setNewTraining({ ...newTraining, skkLevel: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px", backgroundColor: "#FFFFFF" }}
                  >
                    {JENJANG_PP14_OPTIONS.map(j => (
                      <option key={j} value={j}>{JENJANG_PP14_LABELS[j]}</option>
                    ))}
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

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
                  Jenjang Kualifikasi PP 14/2021
                </label>
                <select
                  value={participantForm.skkLevel}
                  onChange={e => setParticipantForm({ ...participantForm, skkLevel: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px", backgroundColor: "#FFFFFF" }}
                >
                  {JENJANG_PP14_OPTIONS.map(j => (
                    <option key={j} value={j}>{JENJANG_PP14_LABELS[j]}</option>
                  ))}
                </select>
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

      {/* Modal e-Certificate Viewer */}
      {selectedCert && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "18px", maxWidth: "560px", width: "100%", padding: "28px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Award style={{ width: "20px", height: "20px", color: selectedCert.certType === "DPU" ? "#059669" : "#1E40AF" }} />
                <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
                  {selectedCert.certType === "DPU" ? "Salinan E-Sertifikat Partisipasi DPU" : "Salinan Sertifikat SKK (LPJK)"}
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
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Bidang Pelatihan & Kualifikasi:</span>
                <p style={{ margin: "2px 0 0 0", fontWeight: 700, color: "#0F2E5C" }}>{selectedCert.trainingTitle}</p>
                {selectedCert.skkLevel && (
                  <span style={{ fontSize: "11px", color: "#0284C7", fontWeight: 700 }}>{selectedCert.skkLevel} (PP 14/2021)</span>
                )}
              </div>

              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                  {selectedCert.certType === "DPU" ? "Nomor Sertifikat DPU (Otomatis):" : "Nomor Registrasi SKK (LPJK):"}
                </span>
                <p style={{ margin: "2px 0 0 0", fontFamily: "monospace", fontWeight: 800, color: selectedCert.certType === "DPU" ? "#059669" : "#1E40AF", fontSize: "15px" }}>
                  {selectedCert.certNo}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "10px", borderTop: "1px solid #F1F5F9" }}>
              <button
                type="button"
                onClick={() => alert(`Mengunduh salinan resmi dokumen ${selectedCert.certNo} (PDF) bertanda tangan elektronik...`)}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "10px", backgroundColor: "#0F2E5C", color: "#FFFFFF", border: "none", padding: "8px 18px", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}
              >
                <Download style={{ width: "14px", height: "14px" }} /> Unduh E-Sertifikat (PDF)
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

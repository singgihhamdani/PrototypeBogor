"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  ShieldAlert, Plus, Search, Calendar, MapPin, AlertTriangle, 
  CheckCircle2, FileText, Send, Eye, ShieldCheck, Download, X,
  Check, Clock, UserCheck, RotateCcw, Filter, ChevronLeft, ChevronRight,
  Database as DbIcon, Loader2, Edit, Trash2, FileSpreadsheet, Building2,
  DollarSign, AlertCircle
} from "lucide-react";
import projectsData from "@/data/projects.json";
import { 
  StatusBadge, ModalForm 
} from "@/components/common";
import BatchImportModal from "@/components/common/batch-import-modal";
import { exportToSpreadsheet } from "@/lib/export-utils";
import { TEMPLATE_KECELAKAAN } from "@/lib/sipjaki-templates";
import { 
  fetchKecelakaanList, createKecelakaan, updateKecelakaan, deleteKecelakaan,
  batchInsertKecelakaan, DataSourceStatus, KecelakaanItem, KecelakaanInsert 
} from "@/lib/services/kecelakaan-service";
import { createClient } from "@/lib/supabase/client";

// Format Rupiah Akuntansi
function formatRupiahFull(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function KecelakaanPage() {
  const [incidents, setIncidents] = useState<KecelakaanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState<DataSourceStatus>({ 
    source: "fallback", 
    message: "Menghubungkan ke basis data..." 
  });

  // Filter & Search States
  const [filterYear, setFilterYear] = useState<string>("Semua");
  const [filterSource, setFilterSource] = useState<string>("Semua");
  const [search, setSearch] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal States
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<KecelakaanItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State (Tambah & Edit)
  const [formId, setFormId] = useState("");
  const [formProjectName, setFormProjectName] = useState("");
  const [formProjectId, setFormProjectId] = useState("P001");
  const [formContractor, setFormContractor] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formDate, setFormDate] = useState("2026-04-12");
  const [formTime, setFormTime] = useState("10:00 WIB");
  const [formDescription, setFormDescription] = useState("");
  const [formLoss, setFormLoss] = useState("");
  const [formLossCategory, setFormLossCategory] = useState<"Nir-Korban (Near Miss)" | "Luka Ringan" | "Luka Berat" | "Fatalitas / Meninggal">("Luka Ringan");
  const [formEstimatedLoss, setFormEstimatedLoss] = useState("0");
  const [formProblem, setFormProblem] = useState("");
  const [formCity, setFormCity] = useState("Kabupaten Bogor");
  const [formProvince, setFormProvince] = useState("Jawa Barat");
  const [formSource, setFormSource] = useState<"APBD" | "DAK" | "APBN" | "Bantuan Keuangan">("APBD");
  const [formStatus, setFormStatus] = useState<"Dalam Investigasi" | "Dalam Pemantauan" | "Selesai (Investigasi Ditutup)">("Dalam Investigasi");
  const [formBapDoc, setFormBapDoc] = useState("");

  // Load Data dari Supabase / Local Fallback
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchKecelakaanList();
      // Default sorting: Riwayat Pelaporan Terkini (updated_at / tanggal DESC)
      const sorted = [...res.data].sort((a, b) => {
        const timeA = new Date(a.updated_at || a.tanggal).getTime();
        const timeB = new Date(b.updated_at || b.tanggal).getTime();
        return timeB - timeA;
      });
      setIncidents(sorted);
      setDataStatus(res.status);
    } catch (err) {
      console.error("Gagal memuat data kecelakaan kerja:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Supabase Realtime Listener
    const client = createClient();
    if (client) {
      const channel = client
        .channel("realtime-kecelakaan-kerja-sipjaki")
        .on("postgres_changes", { event: "*", schema: "public", table: "kecelakaan_kerja" }, () => {
          loadData();
        })
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
  }, []);

  // Filter Logic
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const year = new Date(inc.tanggal).getFullYear().toString();
      const matchYear = filterYear === "Semua" || year === filterYear;
      const matchSource = filterSource === "Semua" || inc.sumber_dana === filterSource;

      const q = search.trim().toLowerCase();
      const matchSearch = !q ||
        inc.nama_pekerjaan.toLowerCase().includes(q) ||
        inc.nama_perusahaan.toLowerCase().includes(q) ||
        inc.lokasi.toLowerCase().includes(q) ||
        inc.masalah.toLowerCase().includes(q) ||
        inc.deskripsi.toLowerCase().includes(q) ||
        inc.id.toLowerCase().includes(q);

      return matchYear && matchSource && matchSearch;
    });
  }, [incidents, filterYear, filterSource, search]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredIncidents.length / pageSize) || 1;
  const paginatedIncidents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredIncidents.slice(start, start + pageSize);
  }, [filteredIncidents, currentPage, pageSize]);

  // Statistik Eksekutif (2 Kartu Informasi)
  const totalKejadian = incidents.length;
  const totalKejadianSelesai = incidents.filter(i => i.status === "Selesai (Investigasi Ditutup)").length;
  const totalKejadianAktif = incidents.filter(i => i.status !== "Selesai (Investigasi Ditutup)").length;

  const currentYear = 2026;
  const insidenTahunBerjalan = incidents.filter(i => new Date(i.tanggal).getFullYear() === currentYear);
  const countTahunBerjalan = insidenTahunBerjalan.length;
  const fatalitasTahunBerjalan = insidenTahunBerjalan.filter(i => i.kategori_kerugian === "Fatalitas / Meninggal").length;
  const lukaBeratTahunBerjalan = insidenTahunBerjalan.filter(i => i.kategori_kerugian === "Luka Berat").length;
  const lukaRinganTahunBerjalan = insidenTahunBerjalan.filter(i => i.kategori_kerugian === "Luka Ringan").length;

  // Reset Filter
  const handleResetFilter = () => {
    setFilterYear("Semua");
    setFilterSource("Semua");
    setSearch("");
    setCurrentPage(1);
  };

  // Buka Modal Tambah
  const handleOpenAddModal = () => {
    const nextNum = incidents.length + 1;
    setFormId(`K3-${currentYear}-00${nextNum}`);
    setFormProjectName("");
    setFormProjectId("P001");
    setFormContractor("");
    setFormLocation("");
    setFormDate("2026-04-12");
    setFormTime("10:00 WIB");
    setFormDescription("");
    setFormLoss("Luka Ringan (Pekerja terkilir)");
    setFormLossCategory("Luka Ringan");
    setFormEstimatedLoss("0");
    setFormProblem("Unsafe Action: Pekerja tidak mematuhi SOP SMKK lapangan");
    setFormCity("Kabupaten Bogor");
    setFormProvince("Jawa Barat");
    setFormSource("APBD");
    setFormStatus("Dalam Investigasi");
    setFormBapDoc(`BAP_K3_Insiden_${currentYear}_00${nextNum}.pdf`);
    setShowAddModal(true);
  };

  // Pilih Paket Pekerjaan saat Tambah untuk Auto-Fill Kontraktor & Sumber Dana
  const handleSelectProject = (projectId: string) => {
    setFormProjectId(projectId);
    const found = projectsData.find(p => p.id === projectId);
    if (found) {
      setFormProjectName(found.name);
      setFormContractor(found.contractor);
      setFormLocation(`Kecamatan ${found.districtId ? "Cibinong" : "Bogor"}`);
      setFormSource((found.source as any) || "APBD");
    }
  };

  // Buka Modal Edit
  const handleOpenEditModal = (inc: KecelakaanItem) => {
    setSelectedIncident(inc);
    setFormId(inc.id);
    setFormProjectName(inc.nama_pekerjaan);
    setFormProjectId(inc.paket_pekerjaan_id || "P001");
    setFormContractor(inc.nama_perusahaan);
    setFormLocation(inc.lokasi);
    setFormDate(inc.tanggal);
    setFormTime(inc.waktu_jam);
    setFormDescription(inc.deskripsi);
    setFormLoss(inc.kerugian);
    setFormLossCategory(inc.kategori_kerugian);
    setFormEstimatedLoss(String(inc.estimasi_kerugian_nominal));
    setFormProblem(inc.masalah);
    setFormCity(inc.kab_kota);
    setFormProvince(inc.propinsi);
    setFormSource(inc.sumber_dana);
    setFormStatus(inc.status);
    setFormBapDoc(inc.dokumen_bap_url || "");
    setShowEditModal(true);
  };

  // Buka Dialog Hapus
  const handleOpenDeleteDialog = (inc: KecelakaanItem) => {
    setSelectedIncident(inc);
    setShowDeleteDialog(true);
  };

  // Buka Pratinjau Detail BAP
  const handleOpenDetailModal = (inc: KecelakaanItem) => {
    setSelectedIncident(inc);
    setShowDetailModal(true);
  };

  // Submit Tambah Data Baru
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProjectName.trim() || !formContractor.trim() || !formLocation.trim()) {
      alert("Mohon lengkapi Pekerjaan, Kontraktor/Perusahaan, dan Lokasi Kejadian!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: KecelakaanInsert = {
        id: formId.trim() || `K3-${currentYear}-00${incidents.length + 1}`,
        nama_pekerjaan: formProjectName.trim(),
        paket_pekerjaan_id: formProjectId,
        nama_perusahaan: formContractor.trim(),
        bujk_id: "B001",
        lokasi: formLocation.trim(),
        tanggal: formDate,
        waktu_jam: formTime.trim(),
        deskripsi: formDescription.trim() || "Kecelakaan kerja pada pelaksanaan proyek",
        kerugian: formLoss.trim() || `${formLossCategory} - Estimasi Rp ${formEstimatedLoss}`,
        kategori_kerugian: formLossCategory,
        estimasi_kerugian_nominal: Number(formEstimatedLoss) || 0,
        masalah: formProblem.trim() || "Unsafe Condition / Action di lapangan",
        propinsi: formProvince.trim() || "Jawa Barat",
        kab_kota: formCity.trim() || "Kabupaten Bogor",
        sumber_dana: formSource,
        status: formStatus,
        dokumen_bap_url: formBapDoc.trim() || `BAP_K3_${formId}.pdf`
      };

      const res = await createKecelakaan(payload);
      if (res.success) {
        setShowAddModal(false);
        await loadData();
        alert(`Laporan kecelakaan kerja "${formId}" berhasil disimpan!`);
      } else {
        alert(res.error || "Gagal menyimpan laporan kecelakaan");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Update Data
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;

    setIsSubmitting(true);
    try {
      const payload: Partial<KecelakaanInsert> = {
        nama_pekerjaan: formProjectName.trim(),
        paket_pekerjaan_id: formProjectId,
        nama_perusahaan: formContractor.trim(),
        lokasi: formLocation.trim(),
        tanggal: formDate,
        waktu_jam: formTime.trim(),
        deskripsi: formDescription.trim(),
        kerugian: formLoss.trim(),
        kategori_kerugian: formLossCategory,
        estimasi_kerugian_nominal: Number(formEstimatedLoss) || 0,
        masalah: formProblem.trim(),
        propinsi: formProvince.trim(),
        kab_kota: formCity.trim(),
        sumber_dana: formSource,
        status: formStatus,
        dokumen_bap_url: formBapDoc.trim()
      };

      const res = await updateKecelakaan(selectedIncident.id, payload);
      if (res.success) {
        setIncidents(prev => prev.map(inc => inc.id === selectedIncident.id ? {
          ...inc,
          nama_pekerjaan: formProjectName.trim(),
          nama_perusahaan: formContractor.trim(),
          lokasi: formLocation.trim(),
          tanggal: formDate,
          waktu_jam: formTime.trim(),
          deskripsi: formDescription.trim(),
          kerugian: formLoss.trim(),
          kategori_kerugian: formLossCategory,
          estimasi_kerugian_nominal: Number(formEstimatedLoss) || 0,
          masalah: formProblem.trim(),
          propinsi: formProvince.trim(),
          kab_kota: formCity.trim(),
          sumber_dana: formSource,
          status: formStatus,
          dokumen_bap_url: formBapDoc.trim(),
          updated_at: new Date().toISOString()
        } : inc));

        setShowEditModal(false);
        setSelectedIncident(null);
        await loadData();
        alert(`Data laporan kecelakaan "${selectedIncident.id}" berhasil diperbarui!`);
      } else {
        alert(res.error || "Gagal memperbarui data kecelakaan");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Hapus Data
  const handleDeleteConfirm = async () => {
    if (!selectedIncident) return;
    setIsSubmitting(true);
    try {
      const res = await deleteKecelakaan(selectedIncident.id);
      if (res.success) {
        setIncidents(prev => prev.filter(i => i.id !== selectedIncident.id));
        setShowDeleteDialog(false);
        setSelectedIncident(null);
        alert(`Laporan kecelakaan "${selectedIncident.id}" berhasil dihapus.`);
      } else {
        alert(res.error || "Gagal menghapus laporan kecelakaan");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Batch Commit Impor Excel
  const handleBatchCommit = async (parsedData: Record<string, any>[]) => {
    const dbPayloads: KecelakaanInsert[] = parsedData.map((d, i) => {
      const id = d.id || `K3-${currentYear}-00${incidents.length + i + 1}`;
      return {
        id: String(id).toUpperCase().trim(),
        nama_pekerjaan: d.projectName || d.nama_pekerjaan || "Pekerjaan Konstruksi",
        paket_pekerjaan_id: d.projectId || null,
        nama_perusahaan: d.contractor || d.nama_perusahaan || "Kontraktor Pelaksana",
        bujk_id: "B001",
        lokasi: d.locationDetail || d.lokasi || "Kabupaten Bogor",
        tanggal: d.date || d.tanggal || "2026-01-01",
        waktu_jam: d.time || d.waktu_jam || "10:00 WIB",
        deskripsi: d.chronology || d.deskripsi || "Kecelakaan kerja konstruksi",
        kerugian: d.loss || d.kerugian || "Luka Ringan",
        kategori_kerugian: (d.lossCategory || d.kategori_kerugian || "Luka Ringan") as any,
        estimasi_kerugian_nominal: Number(d.estimatedLoss || d.estimasi_kerugian_nominal) || 0,
        masalah: d.problem || d.masalah || "Pelanggaran SOP K3",
        propinsi: d.province || d.propinsi || "Jawa Barat",
        kab_kota: d.city || d.kab_kota || "Kabupaten Bogor",
        sumber_dana: (d.source || d.sumber_dana || "APBD") as any,
        status: (d.status || "Dalam Investigasi") as any,
        dokumen_bap_url: d.bapDocumentUrl || d.dokumen_bap_url || `BAP_K3_${id}.pdf`
      };
    });

    await batchInsertKecelakaan(dbPayloads);
    await loadData();
    setShowImportModal(false);
    alert(`Berhasil mengimpor ${dbPayloads.length} catatan kecelakaan kerja!`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
      {/* 1. Header Bar Modul */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "4px 10px", borderRadius: "9999px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              SIPJAKI Data Master • Keselamatan Konstruksi (SMKK)
            </span>

            {/* Indikator Status Database */}
            <span 
              style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "5px",
                fontSize: "11px", 
                fontWeight: 700, 
                padding: "3px 10px", 
                borderRadius: "9999px",
                backgroundColor: dataStatus.source === "supabase" ? "#ECFDF5" : "#FFFBEB",
                color: dataStatus.source === "supabase" ? "#065F46" : "#B45309",
                border: `1px solid ${dataStatus.source === "supabase" ? "#A7F3D0" : "#FDE68A"}`
              }}
            >
              <DbIcon style={{ width: "12px", height: "12px" }} />
              {dataStatus.source === "supabase" ? "PostgreSQL (Live)" : "Mode Cadangan Lokal"}
            </span>
          </div>

          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Data Kecelakaan Konstruksi
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
            Pencatatan insiden K3, investigasi lapangan, dan pemantauan kerugian proyek konstruksi Kabupaten Bogor
          </p>
        </div>

        {/* Tombol Pengelolaan Data (Top Bar Actions) */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
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
              padding: "10px 16px",
              fontSize: "12px",
              fontWeight: 800,
              color: "#065F46",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}
          >
            <FileSpreadsheet style={{ width: "16px", height: "16px", color: "#059669" }} />
            <span>Import Excel</span>
          </button>

          {/* Tombol Export */}
          <button 
            type="button"
            onClick={() => exportToSpreadsheet({
              fileName: TEMPLATE_KECELAKAAN.exportFileName,
              sheetName: TEMPLATE_KECELAKAAN.sheetName,
              columns: TEMPLATE_KECELAKAAN.columns,
              data: filteredIncidents,
              sipjakiMode: true,
              includeDataDictionary: true,
              dictionaryItems: TEMPLATE_KECELAKAAN.dictionaryItems
            })}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #CBD5E1",
              padding: "10px 16px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#334155",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}
          >
            <Download style={{ width: "16px", height: "16px" }} />
            <span>Export SIPJAKI</span>
          </button>

          {/* Tombol TAMBAH DATA */}
          <button 
            type="button"
            onClick={handleOpenAddModal}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "12px",
              backgroundColor: "#0F2E5C",
              border: "none",
              borderBottom: "3px solid #FFC000",
              padding: "10px 18px",
              fontSize: "12px",
              fontWeight: 800,
              color: "#FFFFFF",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(15, 46, 92, 0.2)"
            }}
          >
            <Plus style={{ width: "16px", height: "16px", color: "#FFC000" }} />
            <span>TAMBAH DATA</span>
          </button>
        </div>
      </div>

      {/* 2. Kartu Ringkasan Informasi (Statistik K3 Eksekutif) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
        {/* Kartu 1: TOTAL KEJADIAN */}
        <div
          style={{
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            borderTop: "4px solid #DC2626",
            backgroundColor: "#FFFFFF",
            padding: "22px 24px",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px"
          }}
        >
          <div>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.6px" }}>
              TOTAL KEJADIAN
            </span>
            <div style={{ fontSize: "32px", fontWeight: 900, color: "#DC2626", margin: "4px 0 2px 0", lineHeight: 1.15 }}>
              {totalKejadian} <span style={{ fontSize: "18px", fontWeight: 700, color: "#64748B" }}>Insiden</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
              <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981" }} />
              <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700 }}>
                {totalKejadianSelesai} Selesai Investigasi
              </span>
              <span style={{ fontSize: "12px", color: "#94A3B8" }}>•</span>
              <span style={{ fontSize: "12px", color: totalKejadianAktif > 0 ? "#D97706" : "#64748B", fontWeight: totalKejadianAktif > 0 ? 700 : 400 }}>
                {totalKejadianAktif} Dalam Pemantauan
              </span>
            </div>
          </div>

          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              backgroundColor: "#FEE2E2",
              color: "#DC2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <ShieldAlert style={{ width: "28px", height: "28px" }} />
          </div>
        </div>

        {/* Kartu 2: KECELAKAAN TAHUN BERJALAN (2026) */}
        <div
          style={{
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            borderTop: "4px solid #F59E0B",
            backgroundColor: "#FFFFFF",
            padding: "22px 24px",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px"
          }}
        >
          <div>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.6px" }}>
              KECELAKAAN TAHUN BERJALAN (2026)
            </span>
            <div style={{ fontSize: "32px", fontWeight: 900, color: "#0F2E5C", margin: "4px 0 2px 0", lineHeight: 1.15 }}>
              {countTahunBerjalan} <span style={{ fontSize: "18px", fontWeight: 700, color: "#64748B" }}>Kasus K3</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", color: fatalitasTahunBerjalan === 0 ? "#059669" : "#DC2626", fontWeight: 800, backgroundColor: fatalitasTahunBerjalan === 0 ? "#DCFCE7" : "#FEE2E2", padding: "2px 8px", borderRadius: "6px" }}>
                {fatalitasTahunBerjalan === 0 ? "0 Fatalitas (Zero Fatality)" : `${fatalitasTahunBerjalan} Fatalitas`}
              </span>
              <span style={{ fontSize: "11px", color: "#1E40AF", fontWeight: 700, backgroundColor: "#DBEAFE", padding: "2px 8px", borderRadius: "6px" }}>
                {lukaBeratTahunBerjalan} Luka Berat
              </span>
              <span style={{ fontSize: "11px", color: "#64748B" }}>
                {lukaRinganTahunBerjalan} Luka Ringan
              </span>
            </div>
          </div>

          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              backgroundColor: "#FEF3C7",
              color: "#D97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <AlertTriangle style={{ width: "28px", height: "28px" }} />
          </div>
        </div>
      </div>

      {/* 3. Filter & Pencarian Data Bar */}
      <div
        style={{
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Filter style={{ width: "16px", height: "16px", color: "#0F2E5C" }} />
            <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Penyaringan & Pencarian Insiden
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "11px", color: "#64748B" }}>
              Urutan Default: <b>Riwayat Pelaporan Terkini</b> (Terbaru di atas)
            </span>
          </div>
        </div>

        {/* Row Filter: TAHUN, SUMBER DANA, RESET */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
          {/* FILTER TAHUN */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
              FILTER TAHUN
            </label>
            <select
              value={filterYear}
              onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1); }}
              style={{
                width: "100%",
                height: "36px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                padding: "0 10px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#1E293B",
                backgroundColor: "#FFFFFF",
                outline: "none"
              }}
            >
              <option value="Semua">Semua Tahun</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          {/* FILTER SUMBER DANA */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
              FILTER SUMBER DANA
            </label>
            <select
              value={filterSource}
              onChange={(e) => { setFilterSource(e.target.value); setCurrentPage(1); }}
              style={{
                width: "100%",
                height: "36px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                padding: "0 10px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#1E293B",
                backgroundColor: "#FFFFFF",
                outline: "none"
              }}
            >
              <option value="Semua">Semua Sumber Dana</option>
              <option value="APBD">APBD</option>
              <option value="DAK">DAK</option>
              <option value="APBN">APBN</option>
              <option value="Bantuan Keuangan">Bantuan Keuangan</option>
            </select>
          </div>

          {/* TOMBOL RESET */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={handleResetFilter}
              style={{
                height: "36px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                borderRadius: "8px",
                backgroundColor: "#F1F5F9",
                border: "1px solid #CBD5E1",
                color: "#475569",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
              title="Reset seluruh filter dan kolom pencarian"
            >
              <RotateCcw style={{ width: "14px", height: "14px" }} />
              <span>Reset Pengaturan</span>
            </button>
          </div>
        </div>

        {/* Row 2: Show Entries & Quick Search */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", paddingTop: "8px", borderTop: "1px dashed #E2E8F0" }}>
          {/* Show Entries */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600 }}>Show</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              style={{
                height: "32px",
                borderRadius: "6px",
                border: "1px solid #CBD5E1",
                padding: "0 8px",
                fontSize: "12px",
                fontWeight: 700,
                color: "#0F2E5C",
                outline: "none",
                backgroundColor: "#FFFFFF"
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600 }}>entries</span>
          </div>

          {/* Search Box */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "260px", maxWidth: "340px", flex: 1 }}>
            <div style={{ position: "relative", width: "100%" }}>
              <Search style={{ width: "15px", height: "15px", position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
              <input
                type="text"
                placeholder="Cari pekerjaan, perusahaan, lokasi..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                style={{
                  width: "100%",
                  height: "34px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  padding: "0 10px 0 32px",
                  fontSize: "12px",
                  color: "#1E293B",
                  outline: "none"
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}
                >
                  <X style={{ width: "13px", height: "13px" }} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Tabel Rincian Kejadian (11 Kolom Standar SIPJAKI K3) */}
      <div
        style={{
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)"
        }}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", backgroundColor: "#F8FAFC" }}>
          <div>
            <h3 style={{ fontSize: "14px", fontWeight: 900, color: "#0F2E5C", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Tabel Catatan Kejadian Kecelakaan Konstruksi (11 Kolom)
            </h3>
            <span style={{ fontSize: "11px", color: "#64748B" }}>
              Menampilkan {paginatedIncidents.length} dari {filteredIncidents.length} catatan insiden terpilih
            </span>
          </div>
        </div>

        {/* Responsive Horizontal Scroll Container */}
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", minWidth: "1600px" }}>
            <thead>
              <tr style={{ backgroundColor: "#0F2E5C", color: "#FFFFFF" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, minWidth: "220px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  PEKERJAAN
                </th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, minWidth: "180px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  PERUSAHAAN
                </th>
                <th style={{ padding: "12px 12px", textAlign: "left", fontSize: "11px", fontWeight: 800, minWidth: "160px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  LOKASI
                </th>
                <th style={{ padding: "12px 10px", textAlign: "center", fontSize: "11px", fontWeight: 800, width: "120px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  WAKTU
                </th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, minWidth: "220px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  DESKRIPSI
                </th>
                <th style={{ padding: "12px 12px", textAlign: "center", fontSize: "11px", fontWeight: 800, minWidth: "160px", borderRight: "1px solid rgba(255,255,255,0.1)", backgroundColor: "#1E3A8A" }}>
                  KERUGIAN ⭐
                </th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, minWidth: "200px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  MASALAH
                </th>
                <th style={{ padding: "12px 10px", textAlign: "center", fontSize: "11px", fontWeight: 800, width: "120px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  KOTA
                </th>
                <th style={{ padding: "12px 10px", textAlign: "center", fontSize: "11px", fontWeight: 800, width: "100px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  PROVINSI
                </th>
                <th style={{ padding: "12px 10px", textAlign: "center", fontSize: "11px", fontWeight: 800, width: "120px", borderRight: "1px solid rgba(255,255,255,0.1)", backgroundColor: "#1E3A8A" }}>
                  SUMBER DANA ⭐
                </th>
                <th style={{ padding: "12px 12px", textAlign: "center", fontSize: "11px", fontWeight: 800, width: "120px", position: "sticky", right: 0, backgroundColor: "#0F2E5C", zIndex: 2 }}>
                  AKSI
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} style={{ padding: "40px 20px", textAlign: "center", color: "#64748B" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <Loader2 style={{ width: "20px", height: "20px", animation: "spin 1s linear infinite", color: "#0F2E5C" }} />
                      <span>Memuat data kecelakaan kerja...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedIncidents.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: "40px 20px", textAlign: "center", color: "#64748B" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      <ShieldAlert style={{ width: "32px", height: "32px", color: "#CBD5E1" }} />
                      <span style={{ fontWeight: 700 }}>Tidak ada catatan kecelakaan kerja yang memenuhi kriteria</span>
                      <button
                        type="button"
                        onClick={handleResetFilter}
                        style={{ marginTop: "6px", fontSize: "11px", fontWeight: 800, color: "#2563EB", background: "none", border: "none", cursor: "pointer" }}
                      >
                        Reset Seluruh Filter
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedIncidents.map((row, idx) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <tr 
                      key={row.id}
                      style={{ 
                        backgroundColor: isEven ? "#FFFFFF" : "#F8FAFC",
                        borderBottom: "1px solid #E2E8F0",
                        transition: "background-color 0.15s ease"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F1F5F9"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isEven ? "#FFFFFF" : "#F8FAFC"}
                    >
                      {/* 1. PEKERJAAN */}
                      <td style={{ padding: "10px 14px", borderRight: "1px solid #E2E8F0" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 800, backgroundColor: "#EBF2FA", color: "#0F2E5C", padding: "2px 5px", borderRadius: "4px" }}>
                              {row.id}
                            </span>
                            {row.paket_pekerjaan_id && (
                              <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, backgroundColor: "#F1F5F9", color: "#475569", padding: "2px 4px", borderRadius: "4px" }}>
                                [{row.paket_pekerjaan_id}]
                              </span>
                            )}
                          </div>
                          <span style={{ fontWeight: 800, color: "#0F2E5C", fontSize: "12px", lineHeight: 1.3 }}>
                            {row.nama_pekerjaan}
                          </span>
                        </div>
                      </td>

                      {/* 2. PERUSAHAAN */}
                      <td style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "#1E293B", borderRight: "1px solid #E2E8F0" }}>
                        {row.nama_perusahaan}
                      </td>

                      {/* 3. LOKASI */}
                      <td style={{ padding: "10px 12px", fontSize: "11px", color: "#475569", borderRight: "1px solid #E2E8F0" }}>
                        {row.lokasi}
                      </td>

                      {/* 4. WAKTU */}
                      <td style={{ padding: "10px", textAlign: "center", borderRight: "1px solid #E2E8F0" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#0F2E5C", whiteSpace: "nowrap" }}>
                            {row.tanggal}
                          </span>
                          <span style={{ fontSize: "10px", color: "#64748B", marginTop: "2px" }}>
                            {row.waktu_jam}
                          </span>
                        </div>
                      </td>

                      {/* 5. DESKRIPSI */}
                      <td style={{ padding: "10px 14px", fontSize: "11px", color: "#334155", lineHeight: 1.4, borderRight: "1px solid #E2E8F0" }}>
                        {row.deskripsi}
                      </td>

                      {/* 6. KERUGIAN (Kolom Baru) */}
                      <td style={{ padding: "10px 12px", textAlign: "center", borderRight: "1px solid #E2E8F0" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                          <span 
                            style={{ 
                              display: "inline-block",
                              padding: "2px 8px", 
                              borderRadius: "6px", 
                              fontSize: "10px", 
                              fontWeight: 800,
                              backgroundColor: 
                                row.kategori_kerugian === "Fatalitas / Meninggal" ? "#FEE2E2" :
                                row.kategori_kerugian === "Luka Berat" ? "#FEF3C7" :
                                row.kategori_kerugian === "Luka Ringan" ? "#EFF6FF" : "#F1F5F9",
                              color: 
                                row.kategori_kerugian === "Fatalitas / Meninggal" ? "#991B1B" :
                                row.kategori_kerugian === "Luka Berat" ? "#92400E" :
                                row.kategori_kerugian === "Luka Ringan" ? "#1E40AF" : "#475569",
                              border: `1px solid ${
                                row.kategori_kerugian === "Fatalitas / Meninggal" ? "#FCA5A5" :
                                row.kategori_kerugian === "Luka Berat" ? "#FDE68A" :
                                row.kategori_kerugian === "Luka Ringan" ? "#BFDBFE" : "#CBD5E1"
                              }`
                            }}
                          >
                            {row.kategori_kerugian}
                          </span>

                          <span style={{ fontSize: "10px", fontWeight: 700, color: "#475569" }}>
                            {row.estimasi_kerugian_nominal > 0 ? formatRupiahFull(row.estimasi_kerugian_nominal) : "Nir-Nominal"}
                          </span>
                        </div>
                      </td>

                      {/* 7. MASALAH */}
                      <td style={{ padding: "10px 14px", fontSize: "11px", color: "#B91C1C", fontWeight: 600, lineHeight: 1.35, borderRight: "1px solid #E2E8F0" }}>
                        {row.masalah}
                      </td>

                      {/* 8. KOTA */}
                      <td style={{ padding: "10px", textAlign: "center", fontSize: "11px", fontWeight: 700, color: "#0F2E5C", borderRight: "1px solid #E2E8F0" }}>
                        {row.kab_kota}
                      </td>

                      {/* 9. PROVINSI */}
                      <td style={{ padding: "10px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#334155", borderRight: "1px solid #E2E8F0" }}>
                        {row.propinsi}
                      </td>

                      {/* 10. SUMBER DANA (Kolom Baru) */}
                      <td style={{ padding: "10px", textAlign: "center", borderRight: "1px solid #E2E8F0" }}>
                        <span 
                          style={{ 
                            display: "inline-block",
                            padding: "3px 8px", 
                            borderRadius: "6px", 
                            fontSize: "11px", 
                            fontWeight: 800,
                            backgroundColor: row.sumber_dana === "APBD" ? "#EBF2FA" : row.sumber_dana === "DAK" ? "#DCFCE7" : row.sumber_dana === "APBN" ? "#DBEAFE" : "#FEF3C7",
                            color: row.sumber_dana === "APBD" ? "#0F2E5C" : row.sumber_dana === "DAK" ? "#166534" : row.sumber_dana === "APBN" ? "#1E40AF" : "#B45309"
                          }}
                        >
                          {row.sumber_dana}
                        </span>
                      </td>

                      {/* 11. AKSI (Lihat BAP, Edit, Hapus) */}
                      <td 
                        style={{ 
                          padding: "8px 10px", 
                          textAlign: "center", 
                          position: "sticky", 
                          right: 0, 
                          backgroundColor: isEven ? "#FFFFFF" : "#F8FAFC", 
                          zIndex: 1,
                          boxShadow: "-2px 0 6px rgba(0,0,0,0.04)"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                          {/* Tombol Lihat Rincian / Pratinjau Dokumen BAP */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetailModal(row)}
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "6px",
                              backgroundColor: "#EBF2FA",
                              color: "#0F2E5C",
                              border: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer"
                            }}
                            title="Pratinjau Dokumen BAP K3"
                          >
                            <Eye style={{ width: "13px", height: "13px" }} />
                          </button>

                          {/* Tombol Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(row)}
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "6px",
                              backgroundColor: "#FEF3C7",
                              color: "#92400E",
                              border: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer"
                            }}
                            title="Edit Data Kecelakaan"
                          >
                            <Edit style={{ width: "13px", height: "13px" }} />
                          </button>

                          {/* Tombol Hapus */}
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteDialog(row)}
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "6px",
                              backgroundColor: "#FEE2E2",
                              color: "#991B1B",
                              border: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer"
                            }}
                            title="Hapus Data Kecelakaan"
                          >
                            <Trash2 style={{ width: "13px", height: "13px" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Bar */}
        <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", borderTop: "1px solid #E2E8F0", backgroundColor: "#F8FAFC" }}>
          <span style={{ fontSize: "12px", color: "#64748B" }}>
            Menampilkan <b>{paginatedIncidents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</b> sampai <b>{Math.min(currentPage * pageSize, filteredIncidents.length)}</b> dari <b>{filteredIncidents.length}</b> entri
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{
                height: "30px",
                padding: "0 10px",
                borderRadius: "6px",
                border: "1px solid #CBD5E1",
                backgroundColor: currentPage <= 1 ? "#F1F5F9" : "#FFFFFF",
                color: currentPage <= 1 ? "#94A3B8" : "#334155",
                fontSize: "11px",
                fontWeight: 700,
                cursor: currentPage <= 1 ? "not-allowed" : "pointer"
              }}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setCurrentPage(pg)}
                style={{
                  height: "30px",
                  width: "30px",
                  borderRadius: "6px",
                  border: currentPage === pg ? "none" : "1px solid #CBD5E1",
                  backgroundColor: currentPage === pg ? "#0F2E5C" : "#FFFFFF",
                  color: currentPage === pg ? "#FFFFFF" : "#334155",
                  fontSize: "11px",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                {pg}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{
                height: "30px",
                padding: "0 10px",
                borderRadius: "6px",
                border: "1px solid #CBD5E1",
                backgroundColor: currentPage >= totalPages ? "#F1F5F9" : "#FFFFFF",
                color: currentPage >= totalPages ? "#94A3B8" : "#334155",
                fontSize: "11px",
                fontWeight: 700,
                cursor: currentPage >= totalPages ? "not-allowed" : "pointer"
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 6. Modal Tambah Data Kejadian Baru */}
      <ModalForm
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Input Laporan Kejadian Kecelakaan Konstruksi (SMKK)"
        subtitle="Formulir resmi pelaporan insiden keselamatan kerja standar SIPJAKI"
        onSubmit={handleAddSubmit}
        submitLabel="Simpan Laporan Kejadian"
        isLoading={isSubmitting}
        size="lg"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "68vh", overflowY: "auto", paddingRight: "4px" }}>
          {/* Row 1: ID Kejadian & Pilihan Paket Pekerjaan */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                ID Kejadian <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Pilih Paket Pekerjaan Terkait (Auto-Populate)
              </label>
              <select
                value={formProjectId}
                onChange={(e) => handleSelectProject(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                {projectsData.map(p => (
                  <option key={p.id} value={p.id}>[{p.id}] {p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Nama Pekerjaan & Perusahaan */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Nama Pekerjaan <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Rekonstruksi Jalan Raya Cibinong"
                value={formProjectName}
                onChange={(e) => setFormProjectName(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Perusahaan Kontraktor (BUJK) <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: PT Bangun Jaya Konstruksi"
                value={formContractor}
                onChange={(e) => setFormContractor(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>
          </div>

          {/* Row 3: Lokasi & Waktu Kejadian */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Lokasi Kejadian <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: STA 04+250 Depan Pasar Citeureup"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Tanggal Kejadian <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Waktu (Jam)
              </label>
              <input
                type="text"
                placeholder="10:00 WIB"
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>
          </div>

          {/* Row 4: Sumber Dana & Status Investigasi */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Sumber Dana Proyek ⭐
              </label>
              <select
                value={formSource}
                onChange={(e) => setFormSource(e.target.value as any)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="APBD">APBD Kab. Bogor</option>
                <option value="DAK">DAK Fisik</option>
                <option value="APBN">APBN / Banprov</option>
                <option value="Bantuan Keuangan">Bantuan Keuangan</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Status Penanganan Investigasi
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="Dalam Investigasi">Dalam Investigasi</option>
                <option value="Dalam Pemantauan">Dalam Pemantauan</option>
                <option value="Selesai (Investigasi Ditutup)">Selesai (Investigasi Ditutup)</option>
              </select>
            </div>
          </div>

          {/* Row 5: Kategori Kerugian, Deskripsi Kerugian, & Estimasi Biaya */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Tingkat Kerugian / Korban ⭐
              </label>
              <select
                value={formLossCategory}
                onChange={(e) => setFormLossCategory(e.target.value as any)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="Luka Ringan">Luka Ringan</option>
                <option value="Luka Berat">Luka Berat</option>
                <option value="Nir-Korban (Near Miss)">Nir-Korban (Near Miss)</option>
                <option value="Fatalitas / Meninggal">Fatalitas / Meninggal</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Rincian Kerugian Korban / Material <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Luka lecet dan memar lengan kanan"
                value={formLoss}
                onChange={(e) => setFormLoss(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Estimasi Kerugian (Rp)
              </label>
              <input
                type="number"
                placeholder="0"
                value={formEstimatedLoss}
                onChange={(e) => setFormEstimatedLoss(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>
          </div>

          {/* Row 6: Deskripsi Kejadian (Kronologi) */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
              Deskripsi Kejadian (Kronologi Singkat) <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="Jelaskan alur peristiwa saat kecelakaan terjadi..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              style={{ width: "100%", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "8px 10px", fontSize: "12px", outline: "none", resize: "vertical" }}
            />
          </div>

          {/* Row 7: Masalah (Akar Penyebab Unsafe Act/Condition) */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
              Akar Masalah / Faktor Penyebab Insiden <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="Contoh: Unsafe Action - Pekerja tidak menggunakan APD sarung tangan anti-slip..."
              value={formProblem}
              onChange={(e) => setFormProblem(e.target.value)}
              style={{ width: "100%", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "8px 10px", fontSize: "12px", outline: "none", resize: "vertical" }}
            />
          </div>

          {/* Row 8: Wilayah & Dokumen BAP */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Kota / Kabupaten
              </label>
              <input
                type="text"
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Provinsi
              </label>
              <input
                type="text"
                value={formProvince}
                onChange={(e) => setFormProvince(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Nama Berkas Dokumen BAP K3
              </label>
              <input
                type="text"
                value={formBapDoc}
                onChange={(e) => setFormBapDoc(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>
          </div>
        </div>
      </ModalForm>

      {/* 7. Modal Form Edit Kejadian */}
      <ModalForm
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedIncident(null); }}
        title={`Edit Data Kecelakaan: ${selectedIncident?.id || ""}`}
        subtitle="Perbarui data investigasi, sumber dana, dan tingkat kerugian insiden K3"
        onSubmit={handleEditSubmit}
        submitLabel="Perbarui Data Laporan"
        isLoading={isSubmitting}
        size="lg"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "68vh", overflowY: "auto", paddingRight: "4px" }}>
          {/* Row 1: ID & Pekerjaan */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                ID Kejadian
              </label>
              <input
                type="text"
                disabled
                value={formId}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", backgroundColor: "#F1F5F9", color: "#64748B" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Nama Pekerjaan <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formProjectName}
                onChange={(e) => setFormProjectName(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>
          </div>

          {/* Row 2: Perusahaan & Lokasi */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Perusahaan Kontraktor (BUJK) <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formContractor}
                onChange={(e) => setFormContractor(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Lokasi Kejadian <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>
          </div>

          {/* Row 3: Tanggal, Waktu & Sumber Dana */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Tanggal Kejadian <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Waktu (Jam)
              </label>
              <input
                type="text"
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Sumber Dana Proyek ⭐
              </label>
              <select
                value={formSource}
                onChange={(e) => setFormSource(e.target.value as any)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="APBD">APBD Kab. Bogor</option>
                <option value="DAK">DAK Fisik</option>
                <option value="APBN">APBN / Banprov</option>
                <option value="Bantuan Keuangan">Bantuan Keuangan</option>
              </select>
            </div>
          </div>

          {/* Row 4: Kategori Kerugian, Rincian, & Estimasi */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Tingkat Kerugian / Korban ⭐
              </label>
              <select
                value={formLossCategory}
                onChange={(e) => setFormLossCategory(e.target.value as any)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="Luka Ringan">Luka Ringan</option>
                <option value="Luka Berat">Luka Berat</option>
                <option value="Nir-Korban (Near Miss)">Nir-Korban (Near Miss)</option>
                <option value="Fatalitas / Meninggal">Fatalitas / Meninggal</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Rincian Kerugian Korban / Material <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formLoss}
                onChange={(e) => setFormLoss(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Estimasi Kerugian (Rp)
              </label>
              <input
                type="number"
                value={formEstimatedLoss}
                onChange={(e) => setFormEstimatedLoss(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>
          </div>

          {/* Row 5: Deskripsi Kejadian */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
              Deskripsi Kejadian (Kronologi Singkat) <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <textarea
              required
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              style={{ width: "100%", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "8px 10px", fontSize: "12px", outline: "none", resize: "vertical" }}
            />
          </div>

          {/* Row 6: Masalah */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
              Akar Masalah / Faktor Penyebab Insiden <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <textarea
              required
              rows={2}
              value={formProblem}
              onChange={(e) => setFormProblem(e.target.value)}
              style={{ width: "100%", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "8px 10px", fontSize: "12px", outline: "none", resize: "vertical" }}
            />
          </div>

          {/* Row 7: Status & Dokumen */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Status Penanganan Investigasi
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="Dalam Investigasi">Dalam Investigasi</option>
                <option value="Dalam Pemantauan">Dalam Pemantauan</option>
                <option value="Selesai (Investigasi Ditutup)">Selesai (Investigasi Ditutup)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Nama Berkas Dokumen BAP K3
              </label>
              <input
                type="text"
                value={formBapDoc}
                onChange={(e) => setFormBapDoc(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>
          </div>
        </div>
      </ModalForm>

      {/* 8. Dialog Konfirmasi Hapus Data Kejadian */}
      {showDeleteDialog && selectedIncident && (
        <div 
          style={{ 
            position: "fixed", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: "rgba(15, 23, 42, 0.65)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            zIndex: 9999, 
            backdropFilter: "blur(4px)" 
          }}
        >
          <div 
            style={{ 
              backgroundColor: "#FFFFFF", 
              borderRadius: "16px", 
              width: "90%", 
              maxWidth: "460px", 
              overflow: "hidden", 
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" 
            }}
          >
            <div style={{ backgroundColor: "#991B1B", padding: "18px 20px", display: "flex", alignItems: "center", gap: "10px", color: "#FFFFFF" }}>
              <Trash2 style={{ width: "20px", height: "20px" }} />
              <div>
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 900 }}>Konfirmasi Hapus Laporan Kejadian</h4>
                <p style={{ margin: 0, fontSize: "11px", color: "#FECACA" }}>Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div style={{ padding: "20px" }}>
              <p style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#334155", lineHeight: 1.5 }}>
                Apakah Anda yakin ingin menghapus catatan insiden kecelakaan kerja berikut dari basis data?
              </p>

              <div style={{ backgroundColor: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0", padding: "12px", marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748B" }}>ID & PEKERJAAN:</div>
                <div style={{ fontSize: "13px", fontWeight: 900, color: "#0F2E5C", marginTop: "2px" }}>
                  [{selectedIncident.id}] {selectedIncident.nama_pekerjaan}
                </div>
                <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>
                  Perusahaan: <b>{selectedIncident.nama_perusahaan}</b> • Tanggal: <b>{selectedIncident.tanggal}</b>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => { setShowDeleteDialog(false); setSelectedIncident(null); }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    backgroundColor: "#FFFFFF",
                    color: "#475569",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleDeleteConfirm}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#DC2626",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: isSubmitting ? "not-allowed" : "pointer"
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 style={{ width: "14px", height: "14px" }} />
                      <span>Ya, Hapus Data</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Modal Pratinjau Dokumen BAP K3 */}
      {showDetailModal && selectedIncident && (
        <div 
          style={{ 
            position: "fixed", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: "rgba(15, 23, 42, 0.65)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            zIndex: 9999, 
            backdropFilter: "blur(4px)" 
          }}
        >
          <div 
            style={{ 
              backgroundColor: "#FFFFFF", 
              borderRadius: "16px", 
              width: "92%", 
              maxWidth: "680px", 
              maxHeight: "85vh",
              overflow: "hidden", 
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" 
            }}
          >
            <div style={{ backgroundColor: "#0F2E5C", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#FFFFFF", borderBottom: "3px solid #FFC000" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FileText style={{ width: "22px", height: "22px", color: "#FFC000" }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 900 }}>Berita Acara Pemeriksaan (BAP) Kecelakaan K3</h4>
                  <p style={{ margin: 0, fontSize: "11px", color: "#CBD5E1" }}>Nomor Berkas: {selectedIncident.dokumen_bap_url || selectedIncident.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowDetailModal(false); setSelectedIncident(null); }}
                style={{ background: "none", border: "none", color: "#FFFFFF", cursor: "pointer" }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Badge Header Summary */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", backgroundColor: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B" }}>KODE INSIDEN:</span>
                  <div style={{ fontSize: "14px", fontWeight: 900, color: "#0F2E5C" }}>{selectedIncident.id}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B" }}>SUMBER DANA:</span>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 800, backgroundColor: "#EBF2FA", color: "#0F2E5C", padding: "2px 8px", borderRadius: "6px" }}>
                      {selectedIncident.sumber_dana}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rincian Identitas */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "#64748B", fontWeight: 700 }}>Paket Pekerjaan:</span>
                  <div style={{ fontWeight: 800, color: "#0F172A", marginTop: "2px" }}>{selectedIncident.nama_pekerjaan}</div>
                </div>
                <div>
                  <span style={{ color: "#64748B", fontWeight: 700 }}>Kontraktor Pelaksana:</span>
                  <div style={{ fontWeight: 800, color: "#0F172A", marginTop: "2px" }}>{selectedIncident.nama_perusahaan}</div>
                </div>
                <div>
                  <span style={{ color: "#64748B", fontWeight: 700 }}>Lokasi Kejadian:</span>
                  <div style={{ fontWeight: 800, color: "#0F172A", marginTop: "2px" }}>{selectedIncident.lokasi}</div>
                </div>
                <div>
                  <span style={{ color: "#64748B", fontWeight: 700 }}>Waktu Pelaksanaan:</span>
                  <div style={{ fontWeight: 800, color: "#0F172A", marginTop: "2px" }}>{selectedIncident.tanggal} • {selectedIncident.waktu_jam}</div>
                </div>
              </div>

              {/* Box Dampak & Kerugian */}
              <div style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "10px", padding: "14px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#1E40AF", textTransform: "uppercase" }}>
                  Dampak Kerugian & Kategori Cedera:
                </span>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#1E293B", marginTop: "4px" }}>
                  {selectedIncident.kerugian}
                </div>
                <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>
                  Estimasi Kerugian Nominal: <b>{formatRupiahFull(selectedIncident.estimasi_kerugian_nominal)}</b>
                </div>
              </div>

              {/* Box Masalah & Kronologi */}
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#DC2626", textTransform: "uppercase" }}>
                  Akar Masalah (Faktor Penyebab):
                </span>
                <p style={{ margin: "4px 0 12px 0", fontSize: "12px", color: "#991B1B", lineHeight: 1.5, backgroundColor: "#FEF2F2", padding: "10px", borderRadius: "8px", border: "1px solid #FCA5A5" }}>
                  {selectedIncident.masalah}
                </p>

                <span style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>
                  Kronologi Lengkap Peristiwa:
                </span>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#334155", lineHeight: 1.5, backgroundColor: "#F8FAFC", padding: "10px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  {selectedIncident.deskripsi}
                </p>
              </div>

              {/* Tombol Unduh Berkas BAP */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: "11px", color: "#64748B" }}>
                  Status: <b>{selectedIncident.status}</b>
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => alert(`Mengunduh berkas ${selectedIncident.dokumen_bap_url || "BAP_K3.pdf"}...`)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      backgroundColor: "#0F2E5C",
                      color: "#FFFFFF",
                      fontSize: "12px",
                      fontWeight: 800,
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    <Download style={{ width: "14px", height: "14px", color: "#FFC000" }} />
                    <span>Unduh Berkas BAP (PDF)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowDetailModal(false); setSelectedIncident(null); }}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      backgroundColor: "#F1F5F9",
                      color: "#475569",
                      fontSize: "12px",
                      fontWeight: 700,
                      border: "1px solid #CBD5E1",
                      cursor: "pointer"
                    }}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. Batch Import Modal (Validator Format SIPJAKI) */}
      <BatchImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Impor Laporan Kecelakaan Kerja K3 (SIPJAKI)"
        subtitle="Unggah berkas Excel (.xlsx) atau CSV sesuai spesifikasi data keselamatan konstruksi Kementerian PUPR"
        templateFileName={TEMPLATE_KECELAKAAN.exportFileName}
        expectedColumns={TEMPLATE_KECELAKAAN.importColumns}
        sampleRows={TEMPLATE_KECELAKAAN.sampleRows}
        template={TEMPLATE_KECELAKAAN}
        onCommit={handleBatchCommit}
      />
    </div>
  );
}

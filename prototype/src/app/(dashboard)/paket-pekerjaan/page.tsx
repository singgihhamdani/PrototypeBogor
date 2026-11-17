"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Package, Search, Download, Plus, Eye, TrendingUp, 
  DollarSign, Calendar, CheckCircle2, Award, FileSpreadsheet,
  FileText, Check, AlertCircle, Database as DbIcon, Loader2,
  Edit, Trash2, RotateCcw, Filter, ChevronLeft, ChevronRight,
  Building2, MapPin, HardHat, ShieldCheck, X
} from "lucide-react";
import { 
  StatusBadge, ModalForm 
} from "@/components/common";
import BatchImportModal, { BatchColumnDef } from "@/components/common/batch-import-modal";
import { exportToSpreadsheet } from "@/lib/export-utils";
import { TEMPLATE_PAKET_PEKERJAAN } from "@/lib/sipjaki-templates";
import { 
  fetchPaketList, createPaket, updatePaket, deletePaket,
  batchInsertPaket, DataSourceStatus, PaketInsert, PaketItem 
} from "@/lib/services/master-data";
import { createClient } from "@/lib/supabase/client";

export interface ProjectItem {
  id: string;
  name: string;
  fiscalYear: number;
  source: string;
  owner: string;
  contractor: string;
  contractorId: string;
  nib: string;
  contractValue: number;
  status: string;
  contractType: string; // "Harga Satuan" | "Lump sum" | "Gabungan" | "Turn key"
  contractChar: string; // "Tahun Tunggal" | "Tahun Jamak"
  province: string;
  city: string;
  startDate: string;
  endDate: string;
  physProgress: number;
  physMonth: string;
  finProgress: number;
  finMonth: string;
  districtId: string;
  lat: number;
  lng: number;
  updatedAt: string;
  planProgress: number[];
  realProgress: number[];
}

// Format Rupiah Akuntansi (Contoh: Rp 247.351.520.233,99)
function formatRupiahFull(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Format Rupiah Ringkas untuk Subteks (Contoh: Rp 14.85 Miliar)
function formatRupiahShort(value: number): string {
  if (value >= 1_000_000_000_000) {
    return `Rp ${(value / 1_000_000_000_000).toFixed(2)} Triliun`;
  }
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(2)} Miliar`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(2)} Juta`;
  }
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export default function PaketPekerjaanPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState<DataSourceStatus>({ 
    source: "fallback", 
    message: "Menghubungkan ke basis data..." 
  });

  // Filter & Search States
  const [filterYear, setFilterYear] = useState<string>("Semua");
  const [filterSource, setFilterSource] = useState<string>("Semua");
  const [filterContractType, setFilterContractType] = useState<string>("Semua");
  const [filterContractChar, setFilterContractChar] = useState<string>("Semua");
  const [search, setSearch] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal States
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State (Tambah & Edit)
  const [formId, setFormId] = useState("");
  const [formName, setFormName] = useState("");
  const [formYear, setFormYear] = useState(2026);
  const [formValue, setFormValue] = useState("");
  const [formPhysProgress, setFormPhysProgress] = useState("0");
  const [formFinProgress, setFormFinProgress] = useState("0");
  const [formStatus, setFormStatus] = useState("Pelaksanaan");
  const [formStartDate, setFormStartDate] = useState("2026-03-01");
  const [formEndDate, setFormEndDate] = useState("2026-11-30");
  const [formProvince, setFormProvince] = useState("Jawa Barat");
  const [formCity, setFormCity] = useState("Kabupaten Bogor");
  const [formPhysMonth, setFormPhysMonth] = useState("Agustus");
  const [formFinMonth, setFormFinMonth] = useState("Agustus");
  const [formSource, setFormSource] = useState("APBD");
  const [formOwner, setFormOwner] = useState("Dinas PUPR Kab. Bogor");
  const [formContractorNib, setFormContractorNib] = useState("");
  const [formContractorName, setFormContractorName] = useState("");
  const [formContractType, setFormContractType] = useState("Harga Satuan");
  const [formContractChar, setFormContractChar] = useState("Tahun Tunggal");

  // Load Data dari Supabase / Local Fallback
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchPaketList();
      const mapped: ProjectItem[] = res.data.map((p: any) => ({
        id: p.id,
        name: p.nama_paket,
        fiscalYear: p.tahun_anggaran || 2026,
        source: p.sumber_dana || "APBD",
        owner: p.nama_instansi || "Dinas PUPR Kab. Bogor",
        contractor: p.nama_penyedia || "-",
        contractorId: p.bujk_id || "B001",
        nib: p.nib_penyedia || "-",
        contractValue: Number(p.nilai_kontrak) || 0,
        status: p.status_pekerjaan || "Pelaksanaan",
        contractType: p.jenis_kontrak || "Harga Satuan",
        contractChar: p.karakteristik_kontrak || p.sifat_kontrak || "Tahun Tunggal",
        province: p.propinsi || "Jawa Barat",
        city: p.kab_kota || "Kabupaten Bogor",
        startDate: p.tanggal_mulai || "2026-01-01",
        endDate: p.tanggal_selesai || "2026-12-31",
        physProgress: Number(p.progres_fisik) || 0,
        physMonth: p.bulan_progres || "Agustus",
        finProgress: Number(p.progres_keuangan) || 0,
        finMonth: p.bulan_progres_keuangan || p.bulan_progres || "Agustus",
        districtId: p.kode_kecamatan || "01",
        lat: Number(p.lat) || -6.48,
        lng: Number(p.lng) || 106.85,
        updatedAt: p.updated_at || new Date().toISOString(),
        planProgress: (p.kurva_s_rencana as number[]) || [0, 15, 35, 60, 85, 100],
        realProgress: (p.kurva_s_realisasi as number[]) || [0, 10, 30, 55, 0, 0]
      }));

      // Default sorting: Pelaporan terkini (updated_at DESC)
      mapped.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      setProjects(mapped);
      setDataStatus(res.status);
    } catch (err) {
      console.error("Gagal memuat paket pekerjaan:", err);
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
        .channel("realtime-paket-pekerjaan-sipjaki")
        .on("postgres_changes", { event: "*", schema: "public", table: "paket_pekerjaan" }, () => {
          loadData();
        })
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
  }, []);

  // Filter Logic
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchYear = filterYear === "Semua" || String(p.fiscalYear) === filterYear;
      const matchSource = filterSource === "Semua" || p.source === filterSource;
      const matchContractType = filterContractType === "Semua" || p.contractType === filterContractType;
      const matchContractChar = filterContractChar === "Semua" || p.contractChar === filterContractChar;

      const q = search.trim().toLowerCase();
      const matchSearch = !q || 
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.contractor.toLowerCase().includes(q) ||
        p.nib.toLowerCase().includes(q) ||
        p.owner.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q);

      return matchYear && matchSource && matchContractType && matchContractChar && matchSearch;
    });
  }, [projects, filterYear, filterSource, filterContractType, filterContractChar, search]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProjects.length / pageSize) || 1;
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, currentPage, pageSize]);

  // Rekapitulasi Data (Kartu Ringkasan)
  const totalPaketCount = projects.length;
  const totalNilaiKontrakAll = projects.reduce((acc, curr) => acc + curr.contractValue, 0);
  const totalNilaiKontrakFiltered = filteredProjects.reduce((acc, curr) => acc + curr.contractValue, 0);

  // Reset Semua Filter
  const handleResetFilter = () => {
    setFilterYear("Semua");
    setFilterSource("Semua");
    setFilterContractType("Semua");
    setFilterContractChar("Semua");
    setSearch("");
    setCurrentPage(1);
  };

  // Buka Modal Tambah
  const handleOpenAddModal = () => {
    setFormId(`P0${projects.length + 1 < 10 ? "0" : ""}${projects.length + 1}`);
    setFormName("");
    setFormYear(2026);
    setFormValue("");
    setFormPhysProgress("0");
    setFormFinProgress("0");
    setFormStatus("Pelaksanaan");
    setFormStartDate("2026-03-01");
    setFormEndDate("2026-11-30");
    setFormProvince("Jawa Barat");
    setFormCity("Kabupaten Bogor");
    setFormPhysMonth("Agustus");
    setFormFinMonth("Agustus");
    setFormSource("APBD");
    setFormOwner("Dinas PUPR Kab. Bogor");
    setFormContractorNib("");
    setFormContractorName("");
    setFormContractType("Harga Satuan");
    setFormContractChar("Tahun Tunggal");
    setShowAddModal(true);
  };

  // Buka Modal Edit
  const handleOpenEditModal = (p: ProjectItem) => {
    setSelectedProject(p);
    setFormId(p.id);
    setFormName(p.name);
    setFormYear(p.fiscalYear);
    setFormValue(String(p.contractValue));
    setFormPhysProgress(String(p.physProgress));
    setFormFinProgress(String(p.finProgress));
    setFormStatus(p.status);
    setFormStartDate(p.startDate);
    setFormEndDate(p.endDate);
    setFormProvince(p.province);
    setFormCity(p.city);
    setFormPhysMonth(p.physMonth);
    setFormFinMonth(p.finMonth);
    setFormSource(p.source);
    setFormOwner(p.owner);
    setFormContractorNib(p.nib);
    setFormContractorName(p.contractor);
    setFormContractType(p.contractType);
    setFormContractChar(p.contractChar);
    setShowEditModal(true);
  };

  // Buka Dialog Hapus
  const handleOpenDeleteDialog = (p: ProjectItem) => {
    setSelectedProject(p);
    setShowDeleteDialog(true);
  };

  // Submit Tambah Paket Baru
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formContractorName.trim() || !formValue) {
      alert("Mohon lengkapi Nama Paket, Kontraktor/Penyedia, dan Nilai Kontrak!");
      return;
    }

    const valNum = parseInt(formValue.replace(/\D/g, ""), 10);
    if (isNaN(valNum) || valNum <= 0) {
      alert("Nilai kontrak harus berupa nominal angka valid!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: PaketInsert = {
        id: formId.trim() || `P0${projects.length + 1}`,
        nama_paket: formName.trim(),
        tahun_anggaran: Number(formYear) || 2026,
        sumber_dana: formSource as any,
        nama_instansi: formOwner.trim() || "Dinas PUPR Kab. Bogor",
        nama_penyedia: formContractorName.trim(),
        nib_penyedia: formContractorNib.trim() || "3201000000000",
        nilai_kontrak: valNum,
        status_pekerjaan: formStatus as any,
        jenis_kontrak: formContractType,
        sifat_kontrak: formContractType,
        karakteristik_kontrak: formContractChar,
        propinsi: formProvince.trim() || "Jawa Barat",
        kab_kota: formCity.trim() || "Kabupaten Bogor",
        tanggal_mulai: formStartDate,
        tanggal_selesai: formEndDate,
        progres_fisik: Number(formPhysProgress) || 0,
        progres_keuangan: Number(formFinProgress) || 0,
        bulan_progres: formPhysMonth,
        bulan_progres_keuangan: formFinMonth,
        kode_kecamatan: "01",
        kecamatan: "Kabupaten Bogor",
        lat: -6.48,
        lng: 106.85,
        kurva_s_rencana: [0, 15, 35, 60, 85, 100],
        kurva_s_realisasi: [0, Number(formPhysProgress) || 0, 0, 0, 0, 0]
      };

      const res = await createPaket(payload);
      if (res.success) {
        setShowAddModal(false);
        await loadData();
        alert(`Paket pekerjaan "${formName}" berhasil disimpan ke sistem!`);
      } else {
        alert(res.error || "Gagal menyimpan paket pekerjaan");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Update Paket
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    const valNum = parseInt(formValue.replace(/\D/g, ""), 10);
    if (isNaN(valNum) || valNum <= 0) {
      alert("Nilai kontrak harus berupa angka valid!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<PaketInsert> = {
        nama_paket: formName.trim(),
        tahun_anggaran: Number(formYear) || 2026,
        sumber_dana: formSource as any,
        nama_instansi: formOwner.trim(),
        nama_penyedia: formContractorName.trim(),
        nib_penyedia: formContractorNib.trim(),
        nilai_kontrak: valNum,
        status_pekerjaan: formStatus as any,
        jenis_kontrak: formContractType,
        sifat_kontrak: formContractType,
        karakteristik_kontrak: formContractChar,
        propinsi: formProvince.trim(),
        kab_kota: formCity.trim(),
        tanggal_mulai: formStartDate,
        tanggal_selesai: formEndDate,
        progres_fisik: Number(formPhysProgress) || 0,
        progres_keuangan: Number(formFinProgress) || 0,
        bulan_progres: formPhysMonth,
        bulan_progres_keuangan: formFinMonth
      };

      const res = await updatePaket(selectedProject.id, payload);
      if (res.success) {
        // Update local state juga jika fallback
        setProjects((prev) => 
          prev.map((p) => p.id === selectedProject.id ? {
            ...p,
            name: formName.trim(),
            fiscalYear: Number(formYear),
            source: formSource,
            owner: formOwner.trim(),
            contractor: formContractorName.trim(),
            nib: formContractorNib.trim(),
            contractValue: valNum,
            status: formStatus,
            contractType: formContractType,
            contractChar: formContractChar,
            province: formProvince.trim(),
            city: formCity.trim(),
            startDate: formStartDate,
            endDate: formEndDate,
            physProgress: Number(formPhysProgress) || 0,
            physMonth: formPhysMonth,
            finProgress: Number(formFinProgress) || 0,
            finMonth: formFinMonth,
            updatedAt: new Date().toISOString()
          } : p)
        );
        setShowEditModal(false);
        setSelectedProject(null);
        await loadData();
        alert(`Pembaruan paket pekerjaan "${selectedProject.id}" berhasil disimpan!`);
      } else {
        alert(res.error || "Gagal memperbarui paket pekerjaan");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Hapus Paket
  const handleDeleteConfirm = async () => {
    if (!selectedProject) return;
    setIsSubmitting(true);
    try {
      const res = await deletePaket(selectedProject.id);
      if (res.success) {
        setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id));
        setShowDeleteDialog(false);
        setSelectedProject(null);
        alert(`Paket pekerjaan "${selectedProject.name}" berhasil dihapus.`);
      } else {
        alert(res.error || "Gagal menghapus paket pekerjaan");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Batch Commit untuk Impor Excel
  const handleBatchCommit = async (parsedData: Record<string, any>[]) => {
    const dbPayloads: PaketInsert[] = parsedData.map((d, i) => {
      const id = d.id || d.id_paket || `P0${projects.length + i + 1}`;
      const contractValue = Number(String(d.contractValue || d.nilai_kontrak || "").replace(/\D/g, "")) || 1000000000;
      const physProg = Number(d.physProgress ?? d.progress_fisik ?? d.progres_fisik ?? 0);
      const finProg = Number(d.finProgress ?? d.progress_keuangan ?? d.progres_keuangan ?? 0);

      return {
        id: String(id).toUpperCase().trim(),
        nama_paket: d.name || d.nama_paket || "Paket Pekerjaan Impor",
        tahun_anggaran: Number(d.fiscalYear || d.tahun_anggaran) || 2026,
        sumber_dana: (d.source || d.sumber_dana || "APBD") as any,
        nama_instansi: d.owner || d.nama_instansi || "Dinas PUPR Kab. Bogor",
        nama_penyedia: d.contractor || d.nama_penyedia || "Penyedia Jasa Konstruksi",
        nib_penyedia: d.nib || d.nib_penyedia || "3201000000000",
        nilai_kontrak: contractValue,
        status_pekerjaan: (physProg >= 100 ? "Selesai" : (d.status || d.status_pekerjaan || "Pelaksanaan")) as any,
        jenis_kontrak: d.contractType || d.jenis_kontrak || "Harga Satuan",
        sifat_kontrak: d.contractType || d.jenis_kontrak || "Harga Satuan",
        karakteristik_kontrak: d.contractChar || d.karakteristik_kontrak || "Tahun Tunggal",
        propinsi: d.province || d.propinsi || "Jawa Barat",
        kab_kota: d.city || d.kab_kota || "Kabupaten Bogor",
        tanggal_mulai: d.startDate || d.tanggal_mulai || "2026-03-01",
        tanggal_selesai: d.endDate || d.tanggal_selesai || "2026-11-30",
        progres_fisik: physProg,
        progres_keuangan: finProg,
        bulan_progres: d.physMonth || d.bulan_progres || "Agustus",
        bulan_progres_keuangan: d.finMonth || d.bulan_progres_keuangan || "Agustus",
        kode_kecamatan: "01",
        kecamatan: "Kabupaten Bogor",
        lat: -6.48,
        lng: 106.85
      };
    });

    await batchInsertPaket(dbPayloads);
    await loadData();
    setShowImportModal(false);
    alert(`Berhasil mengimpor ${dbPayloads.length} paket pekerjaan ke sistem!`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
      {/* 1. Header Bar Modul */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "4px 10px", borderRadius: "9999px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              SIPJAKI Master Data • Pilar 2 Penyelenggaraan
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
            Daftar Paket Pekerjaan Konstruksi
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
            Data kontrak paket konstruksi terintegrasi format 19 kolom SIPJAKI Kementerian PUPR Kabupaten Bogor
          </p>
        </div>

        {/* Action Buttons Top Bar */}
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

          {/* Tombol Export SIPJAKI */}
          <button 
            type="button"
            onClick={() => exportToSpreadsheet({
              fileName: TEMPLATE_PAKET_PEKERJAAN.exportFileName,
              sheetName: TEMPLATE_PAKET_PEKERJAAN.sheetName,
              columns: TEMPLATE_PAKET_PEKERJAAN.columns,
              data: filteredProjects,
              sipjakiMode: true,
              includeDataDictionary: true,
              dictionaryItems: TEMPLATE_PAKET_PEKERJAAN.dictionaryItems
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

          {/* Tombol Tambah Paket */}
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
            <span>Tambah Paket</span>
          </button>
        </div>
      </div>

      {/* 2. Ringkasan Data (2 Kartu Informasi Sesuai Spesifikasi SIPJAKI) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
        {/* Kartu 1: TOTAL PAKET PEKERJAAN */}
        <div
          style={{
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            borderTop: "4px solid #0F2E5C",
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
              TOTAL PAKET PEKERJAAN
            </span>
            <div style={{ fontSize: "32px", fontWeight: 900, color: "#0F2E5C", margin: "4px 0 2px 0", lineHeight: 1.15 }}>
              {totalPaketCount} <span style={{ fontSize: "18px", fontWeight: 700, color: "#64748B" }}>Paket</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
              <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981" }} />
              <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700 }}>
                {projects.filter(p => p.status === "Pelaksanaan").length} Dalam Pelaksanaan
              </span>
              <span style={{ fontSize: "12px", color: "#94A3B8" }}>•</span>
              <span style={{ fontSize: "12px", color: "#64748B" }}>
                {projects.filter(p => p.status === "Selesai").length} Selesai
              </span>
            </div>
          </div>

          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              backgroundColor: "#EBF2FA",
              color: "#0F2E5C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <Package style={{ width: "28px", height: "28px" }} />
          </div>
        </div>

        {/* Kartu 2: TOTAL NILAI KONTRAK */}
        <div
          style={{
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            borderTop: "4px solid #2563EB",
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
              TOTAL NILAI KONTRAK
            </span>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#2563EB", margin: "4px 0 2px 0", lineHeight: 1.2 }}>
              {formatRupiahFull(totalNilaiKontrakAll)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
              <span style={{ fontSize: "12px", color: "#2563EB", fontWeight: 700, backgroundColor: "#EFF6FF", padding: "2px 8px", borderRadius: "6px" }}>
                {formatRupiahShort(totalNilaiKontrakAll)}
              </span>
              <span style={{ fontSize: "12px", color: "#64748B" }}>
                (APBD, DAK, APBN & Bantuan Keuangan)
              </span>
            </div>
          </div>

          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              backgroundColor: "#DBEAFE",
              color: "#2563EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <DollarSign style={{ width: "28px", height: "28px" }} />
          </div>
        </div>
      </div>

      {/* 3. Filter & Pencarian Data Bar (Toolbar) */}
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
              Penyaringan & Pencarian Data
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "11px", color: "#64748B" }}>
              Urutan Default: <b>Riwayat Pelaporan Terkini</b> (Terbaru di atas)
            </span>
          </div>
        </div>

        {/* Dropdowns Filter */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
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

          {/* FILTER JENIS KONTRAK */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
              FILTER JENIS KONTRAK
            </label>
            <select
              value={filterContractType}
              onChange={(e) => { setFilterContractType(e.target.value); setCurrentPage(1); }}
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
              <option value="Semua">Semua Jenis Kontrak</option>
              <option value="Harga Satuan">Harga Satuan</option>
              <option value="Lump sum">Lump sum</option>
              <option value="Gabungan">Gabungan</option>
              <option value="Turn key">Turn key</option>
            </select>
          </div>

          {/* FILTER KARAKTERISTIK */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
              FILTER KARAKTERISTIK
            </label>
            <select
              value={filterContractChar}
              onChange={(e) => { setFilterContractChar(e.target.value); setCurrentPage(1); }}
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
              <option value="Semua">Semua Karakteristik</option>
              <option value="Tahun Tunggal">Tahun Tunggal</option>
              <option value="Tahun Jamak">Tahun Jamak</option>
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
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Row 2: Show Entries & Search Bar */}
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

          {/* Quick Search */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "260px", maxWidth: "340px", flex: 1 }}>
            <div style={{ position: "relative", width: "100%" }}>
              <Search style={{ width: "15px", height: "15px", position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
              <input
                type="text"
                placeholder="Cari pekerjaan, penyedia, NIB..."
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

      {/* 4. Tabel Rincian Pekerjaan (19 Kolom Standar SIPJAKI Pusat) */}
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
              Tabel Rincian Paket Pekerjaan Konstruksi (19 Kolom)
            </h3>
            <span style={{ fontSize: "11px", color: "#64748B" }}>
              Menampilkan {paginatedProjects.length} dari {filteredProjects.length} paket terpilih
            </span>
          </div>
        </div>

        {/* Responsive Horizontal Scroll Container */}
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", minWidth: "2100px" }}>
            <thead>
              <tr style={{ backgroundColor: "#0F2E5C", color: "#FFFFFF" }}>
                <th style={{ padding: "12px 10px", textAlign: "center", fontSize: "11px", fontWeight: 800, width: "65px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  TAHUN
                </th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, minWidth: "240px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  NAMA PEKERJAAN
                </th>
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, minWidth: "160px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  NILAI KONTRAK
                </th>
                <th style={{ padding: "12px 12px", textAlign: "center", fontSize: "11px", fontWeight: 800, width: "115px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  PROGRESS FISIK (%)
                </th>
                <th style={{ padding: "12px 12px", textAlign: "center", fontSize: "11px", fontWeight: 800, width: "115px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  PROGRESS KEUANGAN (%)
                </th>
                <th style={{ padding: "12px 10px", textAlign: "center", fontSize: "11px", fontWeight: 800, width: "110px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  STATUS
                </th>
                <th style={{ padding: "12px 10px", textAlign: "center", fontSize: "11px", fontWeight: 800, width: "95px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  MULAI
                </th>
                <th style={{ padding: "12px 10px", textAlign: "center", fontSize: "11px", fontWeight: 800, width: "95px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  SELESAI
                </th>
                <th style={{ padding: "12px 10px", textAlign: "center", fontSize: "11px", fontWeight: 800, width: "100px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  PROPINSI
                </th>
                <th style={{ padding: "12px 10px", textAlign: "center", fontSize: "11px", fontWeight: 800, width: "120px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  KOTA
                </th>
                <th style={{ padding: "12px 10px", textAlign: "center", fontSize: "11px", fontWeight: 800, width: "95px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  FISIK (BULAN)
                </th>
                <th style={{ padding: "12px 10px", textAlign: "center", fontSize: "11px", fontWeight: 800, width: "105px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  KEUANGAN (BULAN)
                </th>
                <th style={{ padding: "12px 10px", textAlign: "center", fontSize: "11px", fontWeight: 800, width: "115px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  SUMBER DANA
                </th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, minWidth: "170px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  PENGGUNA JASA
                </th>
                <th style={{ padding: "12px 10px", textAlign: "center", fontSize: "11px", fontWeight: 800, width: "120px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  PENYEDIA NIB
                </th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, minWidth: "180px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  PENYEDIA NAMA
                </th>
                <th style={{ padding: "12px 12px", textAlign: "center", fontSize: "11px", fontWeight: 800, width: "125px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  JENIS KONTRAK
                </th>
                <th style={{ padding: "12px 12px", textAlign: "center", fontSize: "11px", fontWeight: 800, width: "135px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  KARAKTERISTIK KONTRAK
                </th>
                <th style={{ padding: "12px 12px", textAlign: "center", fontSize: "11px", fontWeight: 800, width: "120px", position: "sticky", right: 0, backgroundColor: "#0F2E5C", zIndex: 2 }}>
                  AKSI
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={19} style={{ padding: "40px 20px", textAlign: "center", color: "#64748B" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <Loader2 style={{ width: "20px", height: "20px", animation: "spin 1s linear infinite", color: "#0F2E5C" }} />
                      <span>Memuat data paket pekerjaan...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedProjects.length === 0 ? (
                <tr>
                  <td colSpan={19} style={{ padding: "40px 20px", textAlign: "center", color: "#64748B" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      <Package style={{ width: "32px", height: "32px", color: "#CBD5E1" }} />
                      <span style={{ fontWeight: 700 }}>Tidak ada data paket pekerjaan yang memenuhi filter</span>
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
                paginatedProjects.map((row, idx) => {
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
                      {/* 1. TAHUN */}
                      <td style={{ padding: "10px", textAlign: "center", fontWeight: 800, color: "#0F2E5C", borderRight: "1px solid #E2E8F0" }}>
                        {row.fiscalYear}
                      </td>

                      {/* 2. NAMA PEKERJAAN */}
                      <td style={{ padding: "10px 14px", borderRight: "1px solid #E2E8F0" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 800, backgroundColor: "#EBF2FA", color: "#0F2E5C", padding: "2px 5px", borderRadius: "4px" }}>
                              {row.id}
                            </span>
                            <Link 
                              href={`/paket-pekerjaan/${row.id}`}
                              style={{ fontWeight: 800, color: "#0F2E5C", textDecoration: "none", fontSize: "12px", lineHeight: 1.3 }}
                              title="Buka rincian proyek"
                            >
                              {row.name}
                            </Link>
                          </div>
                        </div>
                      </td>

                      {/* 3. NILAI KONTRAK */}
                      <td style={{ padding: "10px 14px", textAlign: "right", borderRight: "1px solid #E2E8F0" }}>
                        <span style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: 800, color: "#0F172A", whiteSpace: "nowrap" }}>
                          {formatRupiahFull(row.contractValue)}
                        </span>
                      </td>

                      {/* 4. PROGRESS FISIK (%) */}
                      <td style={{ padding: "10px 12px", textAlign: "center", borderRight: "1px solid #E2E8F0" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                          <span style={{ fontWeight: 800, color: row.physProgress >= 100 ? "#059669" : row.physProgress >= 50 ? "#0F2E5C" : "#D97706", fontSize: "11px" }}>
                            {row.physProgress.toFixed(1)}%
                          </span>
                          <div style={{ width: "70px", height: "5px", backgroundColor: "#E2E8F0", borderRadius: "999px", overflow: "hidden" }}>
                            <div 
                              style={{ 
                                width: `${Math.min(100, row.physProgress)}%`, 
                                height: "100%", 
                                backgroundColor: row.physProgress >= 100 ? "#10B981" : row.physProgress >= 50 ? "#2563EB" : "#F59E0B" 
                              }} 
                            />
                          </div>
                        </div>
                      </td>

                      {/* 5. PROGRESS KEUANGAN (%) */}
                      <td style={{ padding: "10px 12px", textAlign: "center", borderRight: "1px solid #E2E8F0" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                          <span style={{ fontWeight: 800, color: row.finProgress >= 100 ? "#059669" : row.finProgress >= 50 ? "#2563EB" : "#D97706", fontSize: "11px" }}>
                            {row.finProgress.toFixed(1)}%
                          </span>
                          <div style={{ width: "70px", height: "5px", backgroundColor: "#E2E8F0", borderRadius: "999px", overflow: "hidden" }}>
                            <div 
                              style={{ 
                                width: `${Math.min(100, row.finProgress)}%`, 
                                height: "100%", 
                                backgroundColor: row.finProgress >= 100 ? "#10B981" : row.finProgress >= 50 ? "#3B82F6" : "#F59E0B" 
                              }} 
                            />
                          </div>
                        </div>
                      </td>

                      {/* 6. STATUS */}
                      <td style={{ padding: "10px", textAlign: "center", borderRight: "1px solid #E2E8F0" }}>
                        <StatusBadge status={row.status} size="sm" showDot />
                      </td>

                      {/* 7. MULAI */}
                      <td style={{ padding: "10px", textAlign: "center", fontSize: "11px", color: "#475569", whiteSpace: "nowrap", borderRight: "1px solid #E2E8F0" }}>
                        {row.startDate}
                      </td>

                      {/* 8. SELESAI */}
                      <td style={{ padding: "10px", textAlign: "center", fontSize: "11px", color: "#475569", whiteSpace: "nowrap", borderRight: "1px solid #E2E8F0" }}>
                        {row.endDate}
                      </td>

                      {/* 9. PROPINSI */}
                      <td style={{ padding: "10px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#334155", borderRight: "1px solid #E2E8F0" }}>
                        {row.province}
                      </td>

                      {/* 10. KOTA */}
                      <td style={{ padding: "10px", textAlign: "center", fontSize: "11px", fontWeight: 700, color: "#0F2E5C", borderRight: "1px solid #E2E8F0" }}>
                        {row.city}
                      </td>

                      {/* 11. FISIK (BULAN) */}
                      <td style={{ padding: "10px", textAlign: "center", fontSize: "11px", color: "#475569", borderRight: "1px solid #E2E8F0" }}>
                        {row.physMonth}
                      </td>

                      {/* 12. KEUANGAN (BULAN) */}
                      <td style={{ padding: "10px", textAlign: "center", fontSize: "11px", color: "#475569", borderRight: "1px solid #E2E8F0" }}>
                        {row.finMonth}
                      </td>

                      {/* 13. SUMBER DANA */}
                      <td style={{ padding: "10px", textAlign: "center", borderRight: "1px solid #E2E8F0" }}>
                        <span 
                          style={{ 
                            display: "inline-block",
                            padding: "3px 8px", 
                            borderRadius: "6px", 
                            fontSize: "11px", 
                            fontWeight: 800,
                            backgroundColor: row.source === "APBD" ? "#EBF2FA" : row.source === "DAK" ? "#DCFCE7" : row.source === "APBN" ? "#DBEAFE" : "#FEF3C7",
                            color: row.source === "APBD" ? "#0F2E5C" : row.source === "DAK" ? "#166534" : row.source === "APBN" ? "#1E40AF" : "#B45309"
                          }}
                        >
                          {row.source}
                        </span>
                      </td>

                      {/* 14. PENGGUNA JASA */}
                      <td style={{ padding: "10px 14px", fontSize: "11px", color: "#334155", fontWeight: 600, borderRight: "1px solid #E2E8F0" }}>
                        {row.owner}
                      </td>

                      {/* 15. PENYEDIA NIB */}
                      <td style={{ padding: "10px", textAlign: "center", fontFamily: "monospace", fontSize: "10px", color: "#64748B", borderRight: "1px solid #E2E8F0" }}>
                        {row.nib}
                      </td>

                      {/* 16. PENYEDIA NAMA */}
                      <td style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "#1E293B", borderRight: "1px solid #E2E8F0" }}>
                        {row.contractor}
                      </td>

                      {/* 17. JENIS KONTRAK */}
                      <td style={{ padding: "10px 12px", textAlign: "center", borderRight: "1px solid #E2E8F0" }}>
                        <span 
                          style={{ 
                            display: "inline-block",
                            padding: "3px 8px", 
                            borderRadius: "6px", 
                            fontSize: "10px", 
                            fontWeight: 800,
                            backgroundColor: 
                              row.contractType === "Harga Satuan" ? "#EFF6FF" : 
                              row.contractType === "Lump sum" ? "#ECFDF5" : 
                              row.contractType === "Gabungan" ? "#F5F3FF" : "#FFF7ED",
                            color: 
                              row.contractType === "Harga Satuan" ? "#1E40AF" : 
                              row.contractType === "Lump sum" ? "#065F46" : 
                              row.contractType === "Gabungan" ? "#5B21B6" : "#9A3412",
                            border: `1px solid ${
                              row.contractType === "Harga Satuan" ? "#BFDBFE" : 
                              row.contractType === "Lump sum" ? "#A7F3D0" : 
                              row.contractType === "Gabungan" ? "#DDD6FE" : "#FED7AA"
                            }`
                          }}
                        >
                          {row.contractType}
                        </span>
                      </td>

                      {/* 18. KARAKTERISTIK KONTRAK */}
                      <td style={{ padding: "10px 12px", textAlign: "center", borderRight: "1px solid #E2E8F0" }}>
                        <span 
                          style={{ 
                            display: "inline-block",
                            padding: "3px 8px", 
                            borderRadius: "6px", 
                            fontSize: "10px", 
                            fontWeight: 800,
                            backgroundColor: row.contractChar === "Tahun Jamak" ? "#FEF3C7" : "#F1F5F9",
                            color: row.contractChar === "Tahun Jamak" ? "#92400E" : "#475569",
                            border: `1px solid ${row.contractChar === "Tahun Jamak" ? "#FDE68A" : "#E2E8F0"}`
                          }}
                        >
                          {row.contractChar}
                        </span>
                      </td>

                      {/* 19. AKSI (Detail, Edit, Hapus) */}
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
                          {/* Tombol Detail */}
                          <Link
                            href={`/paket-pekerjaan/${row.id}`}
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "6px",
                              backgroundColor: "#EBF2FA",
                              color: "#0F2E5C",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              textDecoration: "none"
                            }}
                            title="Lihat Detail Proyek"
                          >
                            <Eye style={{ width: "13px", height: "13px" }} />
                          </Link>

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
                            title="Edit Data Paket"
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
                            title="Hapus Paket Pekerjaan"
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
            Menampilkan <b>{paginatedProjects.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</b> sampai <b>{Math.min(currentPage * pageSize, filteredProjects.length)}</b> dari <b>{filteredProjects.length}</b> entri
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

      {/* 6. Modal Form Tambah Paket Baru */}
      <ModalForm
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tambah Paket Pekerjaan Baru (Format 19 Kolom SIPJAKI)"
        subtitle="Input spesifikasi kontrak pekerjaan konstruksi Kabupaten Bogor"
        onSubmit={handleAddSubmit}
        submitLabel="Simpan Paket Pekerjaan"
        isLoading={isSubmitting}
        size="lg"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "68vh", overflowY: "auto", paddingRight: "4px" }}>
          {/* Baris 1: ID, Tahun, & Nama Paket */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                ID Paket <span style={{ color: "#EF4444" }}>*</span>
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
                Tahun Anggaran <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="number"
                required
                value={formYear}
                onChange={(e) => setFormYear(Number(e.target.value))}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Nama Pekerjaan <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Rekonstruksi Jalan Cibinong"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>
          </div>

          {/* Baris 2: Nilai Kontrak & Sumber Dana */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Nilai Kontrak (Rp) <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 14850000000"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Sumber Dana
              </label>
              <select
                value={formSource}
                onChange={(e) => setFormSource(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="APBD">APBD Kab. Bogor</option>
                <option value="DAK">DAK Fisik</option>
                <option value="APBN">APBN / Banprov</option>
                <option value="Bantuan Keuangan">Bantuan Keuangan</option>
              </select>
            </div>
          </div>

          {/* Baris 3: Jenis Kontrak & Karakteristik Kontrak (Klasifikasi SIPJAKI) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Jenis Kontrak (Bentuk Imbalan)
              </label>
              <select
                value={formContractType}
                onChange={(e) => setFormContractType(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="Harga Satuan">Harga Satuan</option>
                <option value="Lump sum">Lump sum</option>
                <option value="Gabungan">Gabungan</option>
                <option value="Turn key">Turn key</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Karakteristik Kontrak (Periode)
              </label>
              <select
                value={formContractChar}
                onChange={(e) => setFormContractChar(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="Tahun Tunggal">Tahun Tunggal</option>
                <option value="Tahun Jamak">Tahun Jamak</option>
              </select>
            </div>
          </div>

          {/* Baris 4: Rekanan / Penyedia Jasa */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Penyedia Jasa (BUJK) <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: PT. Samudra Beton Persada"
                value={formContractorName}
                onChange={(e) => setFormContractorName(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Nomor Induk Berusaha (NIB)
              </label>
              <input
                type="text"
                placeholder="Contoh: 9120003456789"
                value={formContractorNib}
                onChange={(e) => setFormContractorNib(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>
          </div>

          {/* Baris 5: Pengguna Jasa & Wilayah */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Pengguna Jasa (Instansi)
              </label>
              <input
                type="text"
                value={formOwner}
                onChange={(e) => setFormOwner(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Propinsi
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
                Kota / Kabupaten
              </label>
              <input
                type="text"
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>
          </div>

          {/* Baris 6: Tanggal Kontrak & Status */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Mulai Kontrak
              </label>
              <input
                type="date"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Selesai Kontrak
              </label>
              <input
                type="date"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Status Pekerjaan
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="Pelaksanaan">Pelaksanaan</option>
                <option value="Selesai">Selesai</option>
                <option value="Perencanaan">Perencanaan</option>
                <option value="Pemilihan">Pemilihan</option>
                <option value="Kritis">Kritis</option>
              </select>
            </div>
          </div>

          {/* Baris 7: Progres Fisik & Keuangan */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Progress Fisik (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formPhysProgress}
                onChange={(e) => setFormPhysProgress(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Fisik (Bulan)
              </label>
              <select
                value={formPhysMonth}
                onChange={(e) => setFormPhysMonth(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                {["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Progress Keuangan (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formFinProgress}
                onChange={(e) => setFormFinProgress(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Keuangan (Bulan)
              </label>
              <select
                value={formFinMonth}
                onChange={(e) => setFormFinMonth(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                {["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </ModalForm>

      {/* 7. Modal Form Edit Paket Pekerjaan */}
      <ModalForm
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedProject(null); }}
        title={`Edit Paket Pekerjaan: ${selectedProject?.id || ""}`}
        subtitle="Perbarui data teknis, progres fisik, dan keuangan paket pekerjaan"
        onSubmit={handleEditSubmit}
        submitLabel="Perbarui Data Paket"
        isLoading={isSubmitting}
        size="lg"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "68vh", overflowY: "auto", paddingRight: "4px" }}>
          {/* Baris 1: ID, Tahun, & Nama Paket */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                ID Paket
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
                Tahun Anggaran <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="number"
                required
                value={formYear}
                onChange={(e) => setFormYear(Number(e.target.value))}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Nama Pekerjaan <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>
          </div>

          {/* Baris 2: Nilai Kontrak & Sumber Dana */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Nilai Kontrak (Rp) <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Sumber Dana
              </label>
              <select
                value={formSource}
                onChange={(e) => setFormSource(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="APBD">APBD Kab. Bogor</option>
                <option value="DAK">DAK Fisik</option>
                <option value="APBN">APBN / Banprov</option>
                <option value="Bantuan Keuangan">Bantuan Keuangan</option>
              </select>
            </div>
          </div>

          {/* Baris 3: Jenis Kontrak & Karakteristik Kontrak */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Jenis Kontrak
              </label>
              <select
                value={formContractType}
                onChange={(e) => setFormContractType(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="Harga Satuan">Harga Satuan</option>
                <option value="Lump sum">Lump sum</option>
                <option value="Gabungan">Gabungan</option>
                <option value="Turn key">Turn key</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Karakteristik Kontrak
              </label>
              <select
                value={formContractChar}
                onChange={(e) => setFormContractChar(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="Tahun Tunggal">Tahun Tunggal</option>
                <option value="Tahun Jamak">Tahun Jamak</option>
              </select>
            </div>
          </div>

          {/* Baris 4: Rekanan / Penyedia Jasa */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Penyedia Jasa (BUJK) <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formContractorName}
                onChange={(e) => setFormContractorName(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Nomor Induk Berusaha (NIB)
              </label>
              <input
                type="text"
                value={formContractorNib}
                onChange={(e) => setFormContractorNib(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>
          </div>

          {/* Baris 5: Pengguna Jasa & Wilayah */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Pengguna Jasa (Instansi)
              </label>
              <input
                type="text"
                value={formOwner}
                onChange={(e) => setFormOwner(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Propinsi
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
                Kota / Kabupaten
              </label>
              <input
                type="text"
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none" }}
              />
            </div>
          </div>

          {/* Baris 6: Tanggal Kontrak & Status */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Mulai Kontrak
              </label>
              <input
                type="date"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Selesai Kontrak
              </label>
              <input
                type="date"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Status Pekerjaan
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="Pelaksanaan">Pelaksanaan</option>
                <option value="Selesai">Selesai</option>
                <option value="Perencanaan">Perencanaan</option>
                <option value="Pemilihan">Pemilihan</option>
                <option value="Kritis">Kritis</option>
              </select>
            </div>
          </div>

          {/* Baris 7: Progres Fisik & Keuangan */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Progress Fisik (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formPhysProgress}
                onChange={(e) => setFormPhysProgress(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Fisik (Bulan)
              </label>
              <select
                value={formPhysMonth}
                onChange={(e) => setFormPhysMonth(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                {["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Progress Keuangan (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formFinProgress}
                onChange={(e) => setFormFinProgress(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                Keuangan (Bulan)
              </label>
              <select
                value={formFinMonth}
                onChange={(e) => setFormFinMonth(e.target.value)}
                style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 8px", fontSize: "12px", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                {["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </ModalForm>

      {/* 8. Dialog Konfirmasi Hapus Paket */}
      {showDeleteDialog && selectedProject && (
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
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 900 }}>Konfirmasi Hapus Paket Pekerjaan</h4>
                <p style={{ margin: 0, fontSize: "11px", color: "#FECACA" }}>Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div style={{ padding: "20px" }}>
              <p style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#334155", lineHeight: 1.5 }}>
                Apakah Anda yakin ingin menghapus data paket pekerjaan berikut dari basis data?
              </p>

              <div style={{ backgroundColor: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0", padding: "12px", marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748B" }}>KODE & NAMA PAKET:</div>
                <div style={{ fontSize: "13px", fontWeight: 900, color: "#0F2E5C", marginTop: "2px" }}>
                  [{selectedProject.id}] {selectedProject.name}
                </div>
                <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>
                  Penyedia: <b>{selectedProject.contractor}</b> • Nilai: <b>{formatRupiahFull(selectedProject.contractValue)}</b>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => { setShowDeleteDialog(false); setSelectedProject(null); }}
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
                      <span>Ya, Hapus Paket</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Batch Import Modal (Validator Format SIPJAKI) */}
      <BatchImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Impor Paket Pekerjaan Konstruksi (SIPJAKI)"
        subtitle="Unggah berkas Excel (.xlsx) atau CSV sesuai spesifikasi data paket pekerjaan Kementerian PUPR"
        templateFileName={TEMPLATE_PAKET_PEKERJAAN.exportFileName}
        expectedColumns={TEMPLATE_PAKET_PEKERJAAN.importColumns}
        sampleRows={TEMPLATE_PAKET_PEKERJAAN.sampleRows}
        template={TEMPLATE_PAKET_PEKERJAAN}
        onCommit={handleBatchCommit}
      />
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Award, Plus, FileText, CheckCircle2, 
  Calendar, Search, Users, ShieldCheck, Eye, 
  RotateCcw, Filter, ChevronLeft, ChevronRight, ExternalLink,
  Target, TrendingUp, Database as DbIcon, Loader2, X,
  ArrowUpDown, ArrowUp, ArrowDown, MapPin, Building2, CheckSquare, Layers,
  Edit3, Trash2, Sparkles, Check, Download, AlertTriangle, FileSpreadsheet
} from "lucide-react";
import { 
  fetchRekapitulasiPelatihanSipjakiList,
  createRekapitulasiPelatihanSipjaki,
  updateRekapitulasiPelatihanSipjaki,
  deleteRekapitulasiPelatihanSipjaki,
  RekapitulasiPelatihanSipjakiItem,
  DataSourceStatus
} from "@/lib/services/pelatihan-service";

export default function RekapitulasiPelatihanPage() {
  const currentYearStr = "2026";

  // Data state
  const [rekapList, setRekapList] = useState<RekapitulasiPelatihanSipjakiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState<DataSourceStatus>({
    source: "fallback",
    message: "Memuat data rekapitulasi pelatihan..."
  });

  // Filter & Search state (Single-Row Action Bar)
  const [filterTahun, setFilterTahun] = useState<string>("Semua");
  const [filterCapaian, setFilterCapaian] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sorting state (Default: Riwayat Terkini DESC)
  const [sortBy, setSortBy] = useState<"terkini" | "terlama" | "capaian" | "target">("terkini");
  const [sortField, setSortField] = useState<keyof RekapitulasiPelatihanSipjakiItem | "capaian_pct">("updated_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RekapitulasiPelatihanSipjakiItem | null>(null);

  // Add Form State
  const [newTahun, setNewTahun] = useState("2026");
  const [newTarget, setNewTarget] = useState<number>(3);
  const [newTerpenuhi, setNewTerpenuhi] = useState<number>(3);
  const [newTotalTkk, setNewTotalTkk] = useState<number>(90);
  const [newDokumen, setNewDokumen] = useState("Rekap_Realisasi_Pelatihan_TKK_2026.pdf");
  const [newCatatan, setNewCatatan] = useState("");

  // Edit Modal State (Seamless Modern Dialog)
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    id: string;
    tahun: string;
    wilayah: string;
    kab_kota: string;
    propinsi: string;
    target: number;
    terpenuhi: number;
    total_tkk: number;
    dokumen_rekap_url: string;
    catatan_verifikasi: string;
  } | null>(null);

  // Delete Confirm Dialog State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{
    id: string;
    tahun: string;
    wilayah: string;
  } | null>(null);

  // Toast feedback
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchRekapitulasiPelatihanSipjakiList();
      setRekapList(res.data);
      setDataStatus(res.status);
    } catch (err) {
      console.error("Gagal memuat data rekapitulasi pelatihan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Data
  const filteredData = useMemo(() => {
    return rekapList.filter(item => {
      // Filter Tahun
      if (filterTahun !== "Semua" && item.tahun !== filterTahun) {
        return false;
      }
      // Filter Capaian
      const capaianVal = Number(item.capaian_pct) || (item.target > 0 ? (item.terpenuhi / item.target) * 100 : 0);
      if (filterCapaian === "tercapai" && capaianVal < 100) {
        return false;
      }
      if (filterCapaian === "belum" && capaianVal >= 100) {
        return false;
      }
      // Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchWilayah = (item.wilayah || "").toLowerCase().includes(q);
        const matchKab = (item.kab_kota || "").toLowerCase().includes(q);
        const matchProv = (item.propinsi || "").toLowerCase().includes(q);
        const matchTahun = (item.tahun || "").toLowerCase().includes(q);
        const matchTarget = String(item.target).includes(q);
        const matchTerpenuhi = String(item.terpenuhi).includes(q);
        const matchTkk = String(item.total_tkk).includes(q);
        const matchDoc = (item.dokumen_rekap_url || "").toLowerCase().includes(q);
        if (!matchWilayah && !matchKab && !matchProv && !matchTahun && !matchTarget && !matchTerpenuhi && !matchTkk && !matchDoc) {
          return false;
        }
      }
      return true;
    });
  }, [rekapList, filterTahun, filterCapaian, searchQuery]);

  // Sorted Data (Default: Riwayat Terkini DESC)
  const sortedData = useMemo(() => {
    const list = [...filteredData];

    if (sortBy === "terkini") {
      list.sort((a, b) => {
        const timeA = new Date(a.updated_at || a.created_at || "1970-01-01").getTime();
        const timeB = new Date(b.updated_at || b.created_at || "1970-01-01").getTime();
        if (timeA !== timeB) return timeB - timeA;
        return Number(b.tahun || 0) - Number(a.tahun || 0);
      });
      return list;
    }

    if (sortBy === "terlama") {
      list.sort((a, b) => {
        const timeA = new Date(a.updated_at || a.created_at || "1970-01-01").getTime();
        const timeB = new Date(b.updated_at || b.created_at || "1970-01-01").getTime();
        if (timeA !== timeB) return timeA - timeB;
        return Number(a.tahun || 0) - Number(b.tahun || 0);
      });
      return list;
    }

    if (sortBy === "capaian") {
      list.sort((a, b) => {
        const capA = Number(a.capaian_pct) || (a.target > 0 ? (a.terpenuhi / a.target) * 100 : 0);
        const capB = Number(b.capaian_pct) || (b.target > 0 ? (b.terpenuhi / b.target) * 100 : 0);
        return capB - capA;
      });
      return list;
    }

    if (sortBy === "target") {
      list.sort((a, b) => (Number(b.target) || 0) - (Number(a.target) || 0));
      return list;
    }

    // Manual column sort
    list.sort((a, b) => {
      let valA: any = a[sortField as keyof RekapitulasiPelatihanSipjakiItem];
      let valB: any = b[sortField as keyof RekapitulasiPelatihanSipjakiItem];

      if (sortField === "capaian_pct") {
        valA = Number(a.capaian_pct) || (a.target > 0 ? (a.terpenuhi / a.target) * 100 : 0);
        valB = Number(b.capaian_pct) || (b.target > 0 ? (b.terpenuhi / b.target) * 100 : 0);
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      const strA = String(valA || "").toLowerCase();
      const strB = String(valB || "").toLowerCase();
      return sortDirection === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });

    return list;
  }, [filteredData, sortBy, sortField, sortDirection]);

  // Paginated Data
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Sort Handler
  const handleSort = (field: keyof RekapitulasiPelatihanSipjakiItem | "capaian_pct") => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
      setSortBy("terkini");
    }
  };

  // Reset Filters
  const handleResetFilter = () => {
    setFilterTahun("Semua");
    setFilterCapaian("Semua");
    setSearchQuery("");
    setSortBy("terkini");
    setCurrentPage(1);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const currentYearItems = rekapList.filter(r => r.tahun === currentYearStr);
    const totalTarget = currentYearItems.reduce((acc, curr) => acc + (Number(curr.target) || 0), 0);
    const totalTerpenuhi = currentYearItems.reduce((acc, curr) => acc + (Number(curr.terpenuhi) || 0), 0);
    const totalTkk = currentYearItems.reduce((acc, curr) => acc + (Number(curr.total_tkk) || 0), 0);
    const avgCapaian = totalTarget > 0 ? Math.round((totalTerpenuhi / totalTarget) * 100) : 100;

    return {
      totalTarget,
      totalTerpenuhi,
      totalTkk,
      avgCapaian,
      count: rekapList.length
    };
  }, [rekapList]);

  // Handle Open Edit Modal
  const handleOpenEdit = (item: RekapitulasiPelatihanSipjakiItem) => {
    setEditingItem({
      id: item.id,
      tahun: item.tahun || currentYearStr,
      wilayah: item.wilayah || "JAWA BARAT, KABUPATEN BOGOR",
      kab_kota: item.kab_kota || "KABUPATEN BOGOR",
      propinsi: item.propinsi || "JAWA BARAT",
      target: item.target || 0,
      terpenuhi: item.terpenuhi || 0,
      total_tkk: item.total_tkk || 0,
      dokumen_rekap_url: item.dokumen_rekap_url || "",
      catatan_verifikasi: item.catatan_verifikasi || "",
    });
    setEditModalOpen(true);
  };

  // Handle Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const res = await updateRekapitulasiPelatihanSipjaki(editingItem.id, {
        tahun: editingItem.tahun,
        target: editingItem.target,
        terpenuhi: editingItem.terpenuhi,
        total_tkk: editingItem.total_tkk,
        dokumen_rekap_url: editingItem.dokumen_rekap_url,
        catatan_verifikasi: editingItem.catatan_verifikasi,
      });

      if (res.success) {
        triggerNotice(`Data Rekapitulasi TA ${editingItem.tahun} berhasil diperbarui.`);
        setEditModalOpen(false);
        loadData();
      } else {
        alert(res.error || "Gagal memperbarui data rekapitulasi.");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan saat menyimpan perubahan: " + err.message);
    }
  };

  // Handle Save Add
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createRekapitulasiPelatihanSipjaki({
        tahun: newTahun,
        wilayah: "JAWA BARAT, KABUPATEN BOGOR",
        kab_kota: "KABUPATEN BOGOR",
        propinsi: "JAWA BARAT",
        target: Number(newTarget) || 0,
        terpenuhi: Number(newTerpenuhi) || 0,
        total_tkk: Number(newTotalTkk) || 0,
        dokumen_rekap_url: newDokumen,
        catatan_verifikasi: newCatatan,
      });

      if (res.success) {
        triggerNotice(`Data Rekapitulasi baru TA ${newTahun} berhasil ditambahkan.`);
        setShowAddModal(false);
        loadData();
      } else {
        alert(res.error || "Gagal menambahkan data rekapitulasi.");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan saat menambah data: " + err.message);
    }
  };

  // Handle Open Delete Modal
  const handleOpenDelete = (item: RekapitulasiPelatihanSipjakiItem) => {
    setDeletingItem({
      id: item.id,
      tahun: item.tahun,
      wilayah: item.wilayah,
    });
    setDeleteConfirmOpen(true);
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    try {
      const res = await deleteRekapitulasiPelatihanSipjaki(deletingItem.id);
      if (res.success) {
        triggerNotice(`Data Rekapitulasi TA ${deletingItem.tahun} berhasil dihapus.`);
        setDeleteConfirmOpen(false);
        loadData();
      } else {
        alert(res.error || "Gagal menghapus data.");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan saat menghapus data: " + err.message);
    }
  };

  // Detail Modal
  const handleOpenDetail = (item: RekapitulasiPelatihanSipjakiItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  // Document Modal
  const handleOpenDoc = (item: RekapitulasiPelatihanSipjakiItem) => {
    setSelectedItem(item);
    setShowDocModal(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {actionNotice && (
        <div 
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            backgroundColor: "#0F2E5C",
            color: "#FFFFFF",
            padding: "14px 22px",
            borderRadius: "14px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
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

      {/* 1. Header Halaman Terpadu */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Award className="w-4 h-4 text-primary" />
            <span>Pilar 5: Pembinaan & Sertifikasi Jasa Konstruksi</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1.5" title="Koneksi Cloud Sinkron" />
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              SIPJAKI Terhubung
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Rekapitulasi TKK Pelatihan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manajemen Data Rekapitulasi Pelatihan & Sertifikasi Standar SIPJAKI Kementerian PUPR
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/pelatihan/perencanaan"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Perencanaan Pelatihan</span>
          </Link>
          <Link
            href="/pelatihan/laporan"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Laporan Pelatihan</span>
          </Link>
          <Link
            href="/pelatihan"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>Hub Pelatihan TKK</span>
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ TAMBAH DATA</span>
          </button>
        </div>
      </div>

      {/* 2. Tiga Kartu Ringkasan Informasi (Sesuai Desain Acuan Asli SIPJAKI PUPR - Bersih & Rapi) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* KARTU 1: TOTAL TARGET PELAKSANAAN */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-[#0F2E5C] text-[#FFC000] flex items-center justify-center shrink-0 shadow-xs">
            <Target className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 leading-none">
                {stats.totalTarget}
              </span>
              <span className="text-xs text-slate-400 font-semibold">Paket ({currentYearStr})</span>
            </div>
            <p className="text-[11px] font-extrabold tracking-wider text-slate-500 uppercase mt-1">
              TOTAL TARGET PELAKSANAAN
            </p>
          </div>
        </div>

        {/* KARTU 2: TOTAL TERPENUHI */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600 leading-none">
                {stats.totalTerpenuhi}
              </span>
              <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                {stats.avgCapaian}% Capaian
              </span>
            </div>
            <p className="text-[11px] font-extrabold tracking-wider text-slate-500 uppercase mt-1">
              TOTAL TERPENUHI
            </p>
          </div>
        </div>

        {/* KARTU 3: TOTAL TKK KESELURUHAN */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Users className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 leading-none">
                {stats.totalTkk}
              </span>
              <span className="text-xs text-slate-400 font-semibold">Orang TKK</span>
            </div>
            <p className="text-[11px] font-extrabold tracking-wider text-slate-500 uppercase mt-1">
              TOTAL TKK KESELURUHAN
            </p>
          </div>
        </div>
      </div>

      {/* 3. Toolbar Aksi Terpadu Satu Baris (Single-Row Seamless Action Bar) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 px-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Side: Filter Dropdowns & Reset */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            Filter:
          </span>

          {/* Filter Tahun */}
          <select
            id="filterTahunSelect"
            value={filterTahun}
            onChange={(e) => {
              setFilterTahun(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs font-bold border border-slate-300 rounded-xl px-3 py-1.5 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs cursor-pointer"
          >
            <option value="Semua">Semua Tahun</option>
            <option value="2026">TA 2026</option>
            <option value="2025">TA 2025</option>
            <option value="2024">TA 2024</option>
          </select>

          {/* Filter Capaian */}
          <select
            id="filterCapaianSelect"
            value={filterCapaian}
            onChange={(e) => {
              setFilterCapaian(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs font-bold border border-slate-300 rounded-xl px-3 py-1.5 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs cursor-pointer"
          >
            <option value="Semua">Semua Capaian</option>
            <option value="tercapai">Tercapai (≥ 100%)</option>
            <option value="belum">Belum Penuh (&lt; 100%)</option>
          </select>

          {/* Selector Urutan */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-bold border border-slate-300 rounded-xl px-3 py-1.5 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs cursor-pointer"
          >
            <option value="terkini">Riwayat Terkini</option>
            <option value="terlama">Riwayat Terlama</option>
            <option value="capaian">Capaian Tertinggi</option>
            <option value="target">Target Terbesar</option>
          </select>

          {(filterTahun !== "Semua" || filterCapaian !== "Semua" || searchQuery.trim() !== "") && (
            <button
              onClick={handleResetFilter}
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-bold px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right Side: Badge Default DESC & Search Box */}
        <div className="flex items-center gap-3">
          <span 
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200"
            title="Secara baku urutan data disusun kronologis terbalik (paling terbaru/update di atas)"
          >
            <ArrowUpDown className="w-3 h-3 text-blue-600" />
            <span>Riwayat Terkini (DESC)</span>
          </span>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari wilayah, target..."
              className="w-full text-xs pl-10 pr-3 py-1.5 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-slate-400 font-medium bg-slate-50 focus:bg-white transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* 4. Tabel Rekapitulasi TKK (Light Surface Style Sesuai Acuan Asli SIPJAKI PUPR - Bersih, Luas & Rapi) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 uppercase font-extrabold tracking-wider text-[11px]">
                {/* 1. NO */}
                <th className="py-3.5 px-3 text-center w-12 border-r border-slate-200/80">
                  NO
                </th>
                {/* 2. WILAYAH KERJA TERPADU */}
                <th 
                  onClick={() => handleSort("wilayah")}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 border-r border-slate-200/80 min-w-[220px]"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span>WILAYAH & DAERAH</span>
                    {sortField === "wilayah" ? (
                      sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-primary" /> : <ArrowDown className="w-3.5 h-3.5 text-primary" />
                    ) : <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </th>
                {/* 3. TARGET (PELAKSANAAN) */}
                <th 
                  onClick={() => handleSort("target")}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 border-r border-slate-200/80 min-w-[130px] text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>TARGET</span>
                    {sortField === "target" ? (
                      sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-primary" /> : <ArrowDown className="w-3.5 h-3.5 text-primary" />
                    ) : <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </th>
                {/* 4. TERPENUHI (PELAKSANAAN) */}
                <th 
                  onClick={() => handleSort("terpenuhi")}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 border-r border-slate-200/80 min-w-[130px] text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>TERPENUHI</span>
                    {sortField === "terpenuhi" ? (
                      sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-primary" /> : <ArrowDown className="w-3.5 h-3.5 text-primary" />
                    ) : <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </th>
                {/* 5. TOTAL TKK */}
                <th 
                  onClick={() => handleSort("total_tkk")}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 border-r border-slate-200/80 min-w-[120px] text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>TOTAL TKK</span>
                    {sortField === "total_tkk" ? (
                      sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-primary" /> : <ArrowDown className="w-3.5 h-3.5 text-primary" />
                    ) : <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </th>
                {/* 6. CAPAIAN */}
                <th 
                  onClick={() => handleSort("capaian_pct")}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 border-r border-slate-200/80 min-w-[140px] text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>CAPAIAN</span>
                    {sortField === "capaian_pct" ? (
                      sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-primary" /> : <ArrowDown className="w-3.5 h-3.5 text-primary" />
                    ) : <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </th>
                {/* 7. TAHUN */}
                <th 
                  onClick={() => handleSort("tahun")}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 border-r border-slate-200/80 min-w-[90px] text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>TAHUN</span>
                    {sortField === "tahun" ? (
                      sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-primary" /> : <ArrowDown className="w-3.5 h-3.5 text-primary" />
                    ) : <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </th>
                {/* 8. DOKUMEN */}
                <th className="py-3.5 px-3 text-center border-r border-slate-200/80 min-w-[110px]">
                  DOKUMEN
                </th>
                {/* 9. EDIT (HEADER KOLOM AKSI DINAMAI "EDIT") */}
                <th className="py-3.5 px-3 text-center min-w-[110px]">
                  EDIT
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-slate-500">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto text-primary mb-2.5" />
                    <span className="font-semibold text-xs">Memuat data rekapitulasi TKK SIPJAKI...</span>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <FileText className="w-9 h-9 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-800 text-sm">Tidak ada data rekapitulasi ditemukan</p>
                      <p className="text-xs text-slate-400">
                        Coba sesuaikan kata kunci pencarian atau ubah filter tahun / capaian.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => {
                  const rowNumber = (currentPage - 1) * pageSize + index + 1;
                  const capaianVal = Number(item.capaian_pct) || (item.target > 0 ? Math.round((item.terpenuhi / item.target) * 100) : 0);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* 1. NO */}
                      <td className="py-4 px-3 text-center font-bold text-slate-400 border-r border-slate-100">
                        {rowNumber}
                      </td>

                      {/* 2. WILAYAH KERJA TERPADU */}
                      <td className="py-4 px-4 font-bold text-slate-900 border-r border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-slate-900 m-0">{item.kab_kota || "KABUPATEN BOGOR"}</p>
                            <p className="text-[11px] text-slate-400 font-medium m-0">{item.propinsi || "JAWA BARAT"}</p>
                          </div>
                        </div>
                      </td>

                      {/* 3. TARGET */}
                      <td className="py-4 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Target className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.target} Pelaksanaan</span>
                        </div>
                      </td>

                      {/* 4. TERPENUHI */}
                      <td className="py-4 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{item.terpenuhi} Pelaksanaan</span>
                        </div>
                      </td>

                      {/* 5. TOTAL TKK */}
                      <td className="py-4 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.total_tkk} Orang</span>
                        </div>
                      </td>

                      {/* 6. CAPAIAN */}
                      <td className="py-4 px-3 text-center border-r border-slate-100">
                        <div className="flex flex-col items-center gap-1 min-w-[110px]">
                          <span className={`text-xs font-black ${capaianVal >= 100 ? "text-emerald-700" : "text-amber-700"}`}>
                            {capaianVal.toFixed(2)}%
                          </span>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                capaianVal >= 100 ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                              style={{ width: `${Math.min(100, capaianVal)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 7. TAHUN */}
                      <td className="py-4 px-3 text-center font-bold text-slate-800 border-r border-slate-100">
                        <span className="font-mono text-xs">{item.tahun}</span>
                      </td>

                      {/* 8. DOKUMEN */}
                      <td className="py-4 px-3 text-center border-r border-slate-100">
                        {item.dokumen_rekap_url ? (
                          <button
                            onClick={() => handleOpenDoc(item)}
                            title="Pratinjau Dokumen Rekapitulasi"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200/80 hover:bg-sky-100 text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-sky-600" />
                            <span>Lihat</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Tidak ada</span>
                        )}
                      </td>

                      {/* 9. EDIT (TOMBOL AKSI KOMPAK SESUAI ACUAN RESMI SIPJAKI PUPR) */}
                      <td className="py-4 px-3 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          {/* Tombol Edit (Kuning/Amber Rounded Button) */}
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Data Rekapitulasi"
                            className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Tombol Hapus (Merah/Rose Rounded Button) */}
                          <button
                            onClick={() => handleOpenDelete(item)}
                            title="Hapus Data Rekapitulasi"
                            className="w-7 h-7 rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Tombol Rincian / Detail Opsional */}
                          <button
                            onClick={() => handleOpenDetail(item)}
                            title="Lihat Rincian Paket Kegiatan"
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
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

        {/* Pagination & Status Footer */}
        <div className="p-4 px-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs bg-white">
          <div className="text-slate-500 font-medium">
            Menampilkan <span className="font-bold text-slate-800">{paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> sampai{" "}
            <span className="font-bold text-slate-800">{Math.min(currentPage * pageSize, sortedData.length)}</span> dari{" "}
            <span className="font-bold text-slate-800">{sortedData.length}</span> entri rekapitulasi
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                  currentPage === pg
                    ? "bg-primary text-white shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {pg}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT REKAPITULASI PELATIHAN (CLEAN SEAMLESS MODERN DIALOG)       */}
      {/* ========================================================================= */}
      {editModalOpen && editingItem && (() => {
        const capaianCalc = editingItem.target > 0 
          ? Math.round((editingItem.terpenuhi / editingItem.target) * 10000) / 100 
          : 0;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150">
              
              {/* Clean Integrated Header (Lega, Terang & Ramah UI/UX) */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-white px-7 py-5 shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 shadow-2xs">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                        Edit Data Rekapitulasi Pelatihan
                      </h3>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        TA {editingItem.tahun}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {editingItem.kab_kota || "Kabupaten Bogor"} • Terintegrasi Standar SIPJAKI Kementerian PUPR
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleSaveEdit} className="m-0">
                <div className="p-7 space-y-5">
                  
                  {/* Row 1: Tahun & Wilayah */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Tahun Anggaran <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={editingItem.tahun}
                        onChange={(e) => setEditingItem({ ...editingItem, tahun: e.target.value })}
                        className="w-full text-xs font-bold px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50 hover:bg-white text-slate-800 transition-colors shadow-2xs"
                        required
                      >
                        <option value="2026">TA 2026</option>
                        <option value="2025">TA 2025</option>
                        <option value="2024">TA 2024</option>
                        <option value="2023">TA 2023</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Kabupaten / Kota & Provinsi
                      </label>
                      <div className="w-full text-xs font-semibold px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-100/70 text-slate-600 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{editingItem.kab_kota}, {editingItem.propinsi}</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: 3 Kolom Metrik Fisik (Target, Terpenuhi, Total TKK) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        Target Pelaksanaan <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex rounded-xl border border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden bg-white shadow-2xs">
                        <input
                          type="number"
                          min="1"
                          value={editingItem.target}
                          onChange={(e) => setEditingItem({ ...editingItem, target: Number(e.target.value) })}
                          className="w-full text-xs font-bold px-3 py-2 text-slate-900 focus:outline-none"
                          required
                        />
                        <div className="bg-slate-100/80 px-2.5 py-2 text-[10px] font-bold text-slate-500 border-l border-slate-200 flex items-center select-none shrink-0">
                          Paket
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        Terpenuhi <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex rounded-xl border border-slate-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 overflow-hidden bg-white shadow-2xs">
                        <input
                          type="number"
                          min="0"
                          value={editingItem.terpenuhi}
                          onChange={(e) => setEditingItem({ ...editingItem, terpenuhi: Number(e.target.value) })}
                          className="w-full text-xs font-bold px-3 py-2 text-emerald-700 focus:outline-none"
                          required
                        />
                        <div className="bg-emerald-50 px-2.5 py-2 text-[10px] font-bold text-emerald-700 border-l border-emerald-200 flex items-center select-none shrink-0">
                          Paket
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        Total TKK Lulus <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex rounded-xl border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 overflow-hidden bg-white shadow-2xs">
                        <input
                          type="number"
                          min="0"
                          value={editingItem.total_tkk}
                          onChange={(e) => setEditingItem({ ...editingItem, total_tkk: Number(e.target.value) })}
                          className="w-full text-xs font-extrabold px-3 py-2 text-slate-900 focus:outline-none"
                          required
                        />
                        <div className="bg-blue-50 px-2.5 py-2 text-[10px] font-bold text-blue-700 border-l border-blue-200 flex items-center select-none shrink-0">
                          Orang
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Dedicated Seamless KPI Capaian Fisik Banner with Dynamic Progress Bar */}
                  <div className="p-4 bg-gradient-to-r from-slate-50 via-emerald-50/20 to-blue-50/20 rounded-2xl border border-slate-200/90 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                          Kalkulasi Realisasi Capaian Fisik (Otomatis)
                        </span>
                        <p className="text-xs text-slate-600 font-semibold mt-0.5">
                          {editingItem.terpenuhi} dari {editingItem.target} paket kegiatan terlaksana ({capaianCalc >= 100 ? "Lengkap 100%" : "Sedang Berjalan"})
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-2xl font-black ${capaianCalc >= 100 ? "text-emerald-700" : "text-amber-700"}`}>
                          {capaianCalc.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          capaianCalc >= 100 ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, capaianCalc))}%` }}
                      />
                    </div>
                  </div>

                  {/* Row 4: Dokumen Rekapitulasi */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nama File Dokumen Rekapitulasi (PDF / XLS)
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <FileText className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={editingItem.dokumen_rekap_url}
                        onChange={(e) => setEditingItem({ ...editingItem, dokumen_rekap_url: e.target.value })}
                        placeholder="Contoh: Rekap_Realisasi_Pelatihan_TKK_2026.pdf"
                        className="w-full text-xs font-mono pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 bg-white shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Row 5: Catatan / Keterangan Rekapitulasi */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Catatan / Keterangan Rekapitulasi
                    </label>
                    <textarea
                      rows={2}
                      value={editingItem.catatan_verifikasi}
                      onChange={(e) => setEditingItem({ ...editingItem, catatan_verifikasi: e.target.value })}
                      placeholder="Keterangan singkat rekapitulasi pelaksanaan daerah..."
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 leading-relaxed bg-white shadow-2xs"
                    />
                  </div>
                </div>

                {/* Modal Action Buttons Footer */}
                <div className="border-t border-slate-100 bg-slate-50/80 px-7 py-4.5 flex items-center justify-between shrink-0">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Sinkronisasi otomatis standar SIPJAKI
                  </span>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setEditModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      style={{ backgroundColor: "#0F2E5C" }}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 text-amber-300" />
                      <span>Simpan Perubahan</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL TAMBAH DATA REKAPITULASI (CLEAN SEAMLESS NEW ENTRY)                 */}
      {/* ========================================================================= */}
      {showAddModal && (() => {
        const capaianAdd = newTarget > 0 
          ? Math.round((newTerpenuhi / newTarget) * 10000) / 100 
          : 0;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150">
              
              <div className="flex items-center justify-between border-b border-slate-100 bg-white px-7 py-5 shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shadow-2xs">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                      Tambah Data Rekapitulasi Pelatihan
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Kabupaten Bogor • Penambahan Rekapitulasi Tahunan Standar SIPJAKI
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAdd} className="m-0">
                <div className="p-7 space-y-5">
                  
                  {/* Row 1: Tahun & Wilayah */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Tahun Anggaran <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={newTahun}
                        onChange={(e) => setNewTahun(e.target.value)}
                        className="w-full text-xs font-bold px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50 hover:bg-white text-slate-800 transition-colors shadow-2xs"
                        required
                      >
                        <option value="2026">TA 2026</option>
                        <option value="2025">TA 2025</option>
                        <option value="2024">TA 2024</option>
                        <option value="2023">TA 2023</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Kabupaten / Kota & Provinsi
                      </label>
                      <div className="w-full text-xs font-semibold px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-100/70 text-slate-600 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">KABUPATEN BOGOR, JAWA BARAT</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: 3 Kolom Metrik Fisik */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        Target Pelaksanaan <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex rounded-xl border border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden bg-white shadow-2xs">
                        <input
                          type="number"
                          min="1"
                          value={newTarget}
                          onChange={(e) => setNewTarget(Number(e.target.value))}
                          className="w-full text-xs font-bold px-3 py-2 text-slate-900 focus:outline-none"
                          required
                        />
                        <div className="bg-slate-100/80 px-2.5 py-2 text-[10px] font-bold text-slate-500 border-l border-slate-200 flex items-center select-none shrink-0">
                          Paket
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        Terpenuhi <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex rounded-xl border border-slate-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 overflow-hidden bg-white shadow-2xs">
                        <input
                          type="number"
                          min="0"
                          value={newTerpenuhi}
                          onChange={(e) => setNewTerpenuhi(Number(e.target.value))}
                          className="w-full text-xs font-bold px-3 py-2 text-emerald-700 focus:outline-none"
                          required
                        />
                        <div className="bg-emerald-50 px-2.5 py-2 text-[10px] font-bold text-emerald-700 border-l border-emerald-200 flex items-center select-none shrink-0">
                          Paket
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        Total TKK Lulus <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex rounded-xl border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 overflow-hidden bg-white shadow-2xs">
                        <input
                          type="number"
                          min="0"
                          value={newTotalTkk}
                          onChange={(e) => setNewTotalTkk(Number(e.target.value))}
                          className="w-full text-xs font-extrabold px-3 py-2 text-slate-900 focus:outline-none"
                          required
                        />
                        <div className="bg-blue-50 px-2.5 py-2 text-[10px] font-bold text-blue-700 border-l border-blue-200 flex items-center select-none shrink-0">
                          Orang
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Live Capaian Widget */}
                  <div className="p-4 bg-gradient-to-r from-slate-50 via-emerald-50/20 to-blue-50/20 rounded-2xl border border-slate-200/90 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                          Kalkulasi Realisasi Capaian Fisik (Otomatis)
                        </span>
                        <p className="text-xs text-slate-600 font-semibold mt-0.5">
                          {newTerpenuhi} dari {newTarget} paket kegiatan terlaksana ({capaianAdd >= 100 ? "Lengkap 100%" : "Sedang Berjalan"})
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-2xl font-black ${capaianAdd >= 100 ? "text-emerald-700" : "text-amber-700"}`}>
                          {capaianAdd.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          capaianAdd >= 100 ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, capaianAdd))}%` }}
                      />
                    </div>
                  </div>

                  {/* Row 4: Dokumen */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nama File Dokumen Rekapitulasi (PDF / XLS)
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <FileText className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={newDokumen}
                        onChange={(e) => setNewDokumen(e.target.value)}
                        placeholder="Contoh: Rekap_Realisasi_Pelatihan_TKK_2026.pdf"
                        className="w-full text-xs font-mono pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 bg-white shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Row 5: Catatan */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Catatan / Keterangan Rekapitulasi
                    </label>
                    <textarea
                      rows={2}
                      value={newCatatan}
                      onChange={(e) => setNewCatatan(e.target.value)}
                      placeholder="Keterangan singkat rekapitulasi pelaksanaan daerah..."
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 leading-relaxed bg-white shadow-2xs"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 bg-slate-50/80 px-7 py-4.5 flex items-center justify-between shrink-0">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Sinkronisasi otomatis standar SIPJAKI
                  </span>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Simpan Data Rekap</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL 2: DIALOG KONFIRMASI HAPUS REKAPITULASI (SAFETY CONFIRMATION)       */}
      {/* ========================================================================= */}
      {deleteConfirmOpen && deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-[420px] text-center p-7 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200 shadow-2xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-base font-black text-slate-900 mb-1.5">
              Hapus Data Rekapitulasi?
            </h3>
            
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus data rekapitulasi pelaksanaan TA <strong className="text-slate-800 font-bold">{deletingItem.tahun}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Permanen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RINCIAN PAKET KEGIATAN WILAYAH                                    */}
      {/* ========================================================================= */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Rincian Paket Pelatihan Wilayah</h3>
                  <p className="text-xs text-slate-400 font-medium">{selectedItem.kab_kota || "Kabupaten Bogor"} • TA {selectedItem.tahun}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Summary Bar */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block mb-0.5">Target Pelaksanaan:</span>
                  <span className="font-extrabold text-slate-900 text-xs">{selectedItem.target} Pelaksanaan</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block mb-0.5">Realisasi Terpenuhi:</span>
                  <span className="font-extrabold text-emerald-700 text-xs">{selectedItem.terpenuhi} Pelaksanaan</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block mb-0.5">Total TKK Lulus:</span>
                  <span className="font-extrabold text-blue-700 text-xs">{selectedItem.total_tkk} Orang</span>
                </div>
              </div>

              {/* Tabel Rincian Paket */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Daftar Paket Kegiatan Pelatihan & Sertifikasi:
                </h4>
                <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 text-center w-8">No</th>
                        <th className="py-2.5 px-3">Nama Program / Kegiatan</th>
                        <th className="py-2.5 px-3 text-center">Tanggal</th>
                        <th className="py-2.5 px-3 text-center">TKK</th>
                        <th className="py-2.5 px-3">Lembaga LSP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedItem.rincian_kegiatan && selectedItem.rincian_kegiatan.length > 0 ? (
                        selectedItem.rincian_kegiatan.map((pkg, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">
                              <div>{pkg.nama_kegiatan}</div>
                              <span className="text-[10px] text-slate-400 font-mono">No. BA: {pkg.nomor_ba}</span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-medium text-slate-600 whitespace-nowrap">
                              {pkg.tanggal}
                            </td>
                            <td className="py-2.5 px-3 text-center font-extrabold text-blue-700">
                              {pkg.jumlah_tkk} {pkg.satuan || "Orang"}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">{pkg.lsp}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-5 text-center text-slate-400 italic">
                            Belum ada rincian paket kegiatan yang terhubung.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedItem.catatan_verifikasi && (
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-600 leading-relaxed">
                  <strong className="block mb-0.5 text-slate-800 font-bold">Catatan Rekapitulasi:</strong>
                  {selectedItem.catatan_verifikasi}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 px-6 bg-slate-50/70 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">SIJAKON / SIPJAKI Kab. Bogor</span>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors cursor-pointer"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: PRATINJAU DOKUMEN REKAPITULASI                                    */}
      {/* ========================================================================= */}
      {showDocModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 px-6 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Dokumen Rekapitulasi</h3>
                  <p className="text-xs text-slate-400 font-medium">{selectedItem.kab_kota || "Kabupaten Bogor"} • TA {selectedItem.tahun}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDocModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Tahun Anggaran:</span>
                  <span className="font-extrabold text-slate-900">{selectedItem.tahun}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Wilayah Cakupan:</span>
                  <span className="font-bold text-slate-800">{selectedItem.wilayah}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Target / Realisasi:</span>
                  <span className="font-bold text-emerald-700">{selectedItem.terpenuhi} dari {selectedItem.target} Pelaksanaan (100%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Total TKK:</span>
                  <span className="font-black text-slate-900">{selectedItem.total_tkk} Orang</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Nama Berkas:</span>
                  <span className="font-mono text-emerald-700 font-bold">{selectedItem.dokumen_rekap_url || "-"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 px-6 bg-slate-50/70 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">SIPJAKI Kab. Bogor</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white cursor-pointer"
                >
                  Tutup
                </button>
                <a
                  href={`/docs/${selectedItem.dokumen_rekap_url || "Rekap_Realisasi_Pelatihan_TKK_2026.pdf"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Berkas</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Award, Plus, FileText, CheckCircle2, 
  Calendar, Search, Users, ShieldCheck, Trash2, Eye, 
  RotateCcw, Filter, ChevronLeft, ChevronRight, ExternalLink,
  Edit3, Clock, Database as DbIcon, Loader2, X,
  ArrowUpDown, ArrowUp, ArrowDown, FileSpreadsheet, MapPin, Building2,
  Sparkles, Check, AlertTriangle, Layers, Download
} from "lucide-react";
import { 
  fetchLaporanPelatihanSipjakiList, createLaporanPelatihanSipjaki, 
  updateLaporanPelatihanSipjaki, deleteLaporanPelatihanSipjaki,
  LaporanPelatihanSipjakiItem, LaporanPelatihanSipjakiInsert,
  DataSourceStatus
} from "@/lib/services/pelatihan-service";

export default function LaporanPelatihanPage() {
  const currentYearStr = "2026";

  // Data state
  const [laporanList, setLaporanList] = useState<LaporanPelatihanSipjakiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState<DataSourceStatus>({
    source: "fallback",
    message: "Memuat data laporan pelatihan..."
  });

  // Filter & Search state (Single-Row Action Bar)
  const [filterTahun, setFilterTahun] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sorting state (Default: Riwayat Terkini DESC)
  const [sortBy, setSortBy] = useState<"terkini" | "terlama" | "tkk_terbanyak" | "nama_az">("terkini");
  const [sortField, setSortField] = useState<keyof LaporanPelatihanSipjakiItem>("updated_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LaporanPelatihanSipjakiItem | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<"kak" | "ba" | "all">("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formTahun, setFormTahun] = useState("2026");
  const [formPropinsi, setFormPropinsi] = useState("JAWA BARAT");
  const [formKabKota, setFormKabKota] = useState("KABUPATEN BOGOR");
  const [formWilayah, setFormWilayah] = useState("JAWA BARAT, KABUPATEN BOGOR");
  const [formNamaKegiatan, setFormNamaKegiatan] = useState("");
  const [formTanggal, setFormTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [formJumlahTkk, setFormJumlahTkk] = useState<number>(30);
  const [formSatuanTkk, setFormSatuanTkk] = useState("Orang");
  const [formNomorBa, setFormNomorBa] = useState("");
  const [formLembagaSertifikasi, setFormLembagaSertifikasi] = useState("LSP Gataki Karya Konstruksi & Balai Jaskon");
  const [formDokumenKak, setFormDokumenKak] = useState("KAK_Pelatihan_TKK_2026.pdf");
  const [formDokumenBa, setFormDokumenBa] = useState("BA_Pelatihan_TKK_2026.pdf");
  const [formCatatan, setFormCatatan] = useState("");

  // Toast feedback
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Helper Format Tanggal Indonesia
  const formatTanggalIndo = (tglStr: string) => {
    if (!tglStr) return "-";
    try {
      const parts = tglStr.split("-");
      if (parts.length === 3) {
        const d = parts[2].padStart(2, "0");
        const m = parts[1].padStart(2, "0");
        const y = parts[0];
        return `${d}/${m}/${y}`;
      }
      return tglStr;
    } catch {
      return tglStr;
    }
  };

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchLaporanPelatihanSipjakiList();
      setLaporanList(res.data);
      setDataStatus(res.status);
    } catch (err) {
      console.error("Gagal memuat data laporan pelatihan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Data
  const filteredData = useMemo(() => {
    return laporanList.filter(item => {
      // Filter Tahun
      if (filterTahun !== "Semua" && item.tahun !== filterTahun) {
        return false;
      }
      // Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchNama = (item.nama_kegiatan || "").toLowerCase().includes(q);
        const matchWilayah = (item.wilayah || "").toLowerCase().includes(q);
        const matchKab = (item.kab_kota || "").toLowerCase().includes(q);
        const matchProv = (item.propinsi || "").toLowerCase().includes(q);
        const matchTahun = (item.tahun || "").toLowerCase().includes(q);
        const matchBa = (item.nomor_ba || "").toLowerCase().includes(q);
        const matchLsp = (item.lembaga_sertifikasi || "").toLowerCase().includes(q);
        const matchTkk = String(item.jumlah_tkk).includes(q);
        const matchKak = (item.dokumen_kak_url || "").toLowerCase().includes(q);
        const matchDocBa = (item.dokumen_ba_url || "").toLowerCase().includes(q);
        if (!matchNama && !matchWilayah && !matchKab && !matchProv && !matchTahun && !matchBa && !matchLsp && !matchTkk && !matchKak && !matchDocBa) {
          return false;
        }
      }
      return true;
    });
  }, [laporanList, filterTahun, searchQuery]);

  // Sorted Data (Default: Riwayat Terkini DESC)
  const sortedData = useMemo(() => {
    const list = [...filteredData];

    if (sortBy === "terkini") {
      list.sort((a, b) => {
        const timeA = new Date(a.updated_at || a.created_at || a.tanggal || "1970-01-01").getTime();
        const timeB = new Date(b.updated_at || b.created_at || b.tanggal || "1970-01-01").getTime();
        if (timeA !== timeB) return timeB - timeA;
        return Number(b.tahun || 0) - Number(a.tahun || 0);
      });
      return list;
    }

    if (sortBy === "terlama") {
      list.sort((a, b) => {
        const timeA = new Date(a.updated_at || a.created_at || a.tanggal || "1970-01-01").getTime();
        const timeB = new Date(b.updated_at || b.created_at || b.tanggal || "1970-01-01").getTime();
        if (timeA !== timeB) return timeA - timeB;
        return Number(a.tahun || 0) - Number(b.tahun || 0);
      });
      return list;
    }

    if (sortBy === "tkk_terbanyak") {
      list.sort((a, b) => (Number(b.jumlah_tkk) || 0) - (Number(a.jumlah_tkk) || 0));
      return list;
    }

    if (sortBy === "nama_az") {
      list.sort((a, b) => (a.nama_kegiatan || "").localeCompare(b.nama_kegiatan || ""));
      return list;
    }

    // Fallback sortField / sortDirection
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      aVal = String(aVal || "").toLowerCase();
      bVal = String(bVal || "").toLowerCase();
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [filteredData, sortBy, sortField, sortDirection]);

  // Paginated Data
  const totalEntries = sortedData.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Stats Counters (Tahun Berjalan 2026)
  const stats = useMemo(() => {
    const currentYearData = laporanList.filter(item => item.tahun === currentYearStr);
    const pool = currentYearData.length > 0 ? currentYearData : laporanList;

    const totalData = pool.length;
    const totalTkk = pool.reduce((acc, curr) => acc + (Number(curr.jumlah_tkk) || 0), 0);
    // Total Dokumen = Akumulasi KAK + Berita Acara / Laporan
    const totalDokumen = pool.reduce((acc, curr) => {
      let count = 0;
      if (curr.dokumen_kak_url) count++;
      if (curr.dokumen_ba_url) count++;
      return acc + count;
    }, 0);

    return { totalData, totalTkk, totalDokumen };
  }, [laporanList, currentYearStr]);

  // Handle Column Header Sort
  const handleSort = (field: keyof LaporanPelatihanSipjakiItem) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleResetFilter = () => {
    setFilterTahun("Semua");
    setSearchQuery("");
    setSortBy("terkini");
    setCurrentPage(1);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormTahun("2026");
    setFormPropinsi("JAWA BARAT");
    setFormKabKota("KABUPATEN BOGOR");
    setFormWilayah("JAWA BARAT, KABUPATEN BOGOR");
    setFormNamaKegiatan("");
    setFormTanggal(new Date().toISOString().split("T")[0]);
    setFormJumlahTkk(30);
    setFormSatuanTkk("Orang");
    setFormNomorBa("");
    setFormLembagaSertifikasi("LSP Gataki Karya Konstruksi & Balai Jaskon");
    setFormDokumenKak("KAK_Pelatihan_TKK_2026.pdf");
    setFormDokumenBa("BA_Pelatihan_TKK_2026.pdf");
    setFormCatatan("");
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: LaporanPelatihanSipjakiItem) => {
    setSelectedItem(item);
    setFormTahun(item.tahun || "2026");
    setFormPropinsi(item.propinsi || "JAWA BARAT");
    setFormKabKota(item.kab_kota || "KABUPATEN BOGOR");
    setFormWilayah(item.wilayah || "JAWA BARAT, KABUPATEN BOGOR");
    setFormNamaKegiatan(item.nama_kegiatan || "");
    setFormTanggal(item.tanggal || new Date().toISOString().split("T")[0]);
    setFormJumlahTkk(Number(item.jumlah_tkk) || 30);
    setFormSatuanTkk(item.satuan_tkk || "Orang");
    setFormNomorBa(item.nomor_ba || "");
    setFormLembagaSertifikasi(item.lembaga_sertifikasi || "");
    setFormDokumenKak(item.dokumen_kak_url || "KAK_Pelatihan_TKK_2026.pdf");
    setFormDokumenBa(item.dokumen_ba_url || "BA_Pelatihan_TKK_2026.pdf");
    setFormCatatan(item.catatan_verifikasi || "");
    setShowEditModal(true);
  };

  // Open Document Modal
  const handleOpenDoc = (item: LaporanPelatihanSipjakiItem, docType: "kak" | "ba" | "all" = "all") => {
    setSelectedItem(item);
    setSelectedDocType(docType);
    setShowDocModal(true);
  };

  // Open Detail Modal
  const handleOpenDetail = (item: LaporanPelatihanSipjakiItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (item: LaporanPelatihanSipjakiItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  // Submit Add
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNamaKegiatan.trim()) {
      alert("Mohon masukkan nama kegiatan pelatihan.");
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedId = `LAP-PEL-${formTahun}-${Date.now().toString().slice(-4)}`;
      const payload: LaporanPelatihanSipjakiInsert = {
        id: generatedId,
        tahun: formTahun,
        wilayah: formWilayah,
        kab_kota: formKabKota,
        propinsi: formPropinsi,
        nama_kegiatan: formNamaKegiatan,
        tanggal: formTanggal,
        jumlah_tkk: Number(formJumlahTkk),
        satuan_tkk: formSatuanTkk,
        nomor_ba: formNomorBa,
        lembaga_sertifikasi: formLembagaSertifikasi,
        dokumen_kak_url: formDokumenKak,
        dokumen_ba_url: formDokumenBa,
        catatan_verifikasi: formCatatan
      };

      const res = await createLaporanPelatihanSipjaki(payload);
      if (res.success && res.data) {
        setLaporanList(prev => [res.data!, ...prev]);
        setShowAddModal(false);
        triggerNotice(`Laporan kegiatan "${formNamaKegiatan}" berhasil ditambahkan.`);
      } else {
        alert("Gagal menambahkan laporan: " + (res.error || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      alert("Kesalahan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    if (!formNamaKegiatan.trim()) {
      alert("Mohon masukkan nama kegiatan pelatihan.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updates: Partial<LaporanPelatihanSipjakiItem> = {
        tahun: formTahun,
        wilayah: formWilayah,
        kab_kota: formKabKota,
        propinsi: formPropinsi,
        nama_kegiatan: formNamaKegiatan,
        tanggal: formTanggal,
        jumlah_tkk: Number(formJumlahTkk),
        satuan_tkk: formSatuanTkk,
        nomor_ba: formNomorBa,
        lembaga_sertifikasi: formLembagaSertifikasi,
        dokumen_kak_url: formDokumenKak,
        dokumen_ba_url: formDokumenBa,
        catatan_verifikasi: formCatatan
      };

      const res = await updateLaporanPelatihanSipjaki(selectedItem.id, updates);
      if (res.success) {
        setLaporanList(prev => prev.map(item => item.id === selectedItem.id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item));
        setShowEditModal(false);
        triggerNotice(`Data laporan "${formNamaKegiatan}" berhasil diperbarui.`);
      } else {
        alert("Gagal memperbarui data laporan: " + (res.error || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      alert("Kesalahan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      const res = await deleteLaporanPelatihanSipjaki(selectedItem.id);
      if (res.success) {
        setLaporanList(prev => prev.filter(item => item.id !== selectedItem.id));
        setShowDeleteModal(false);
        triggerNotice(`Data laporan kegiatan berhasil dihapus.`);
      } else {
        alert("Gagal menghapus data laporan: " + (res.error || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      alert("Kesalahan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
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
            Laporan Pelatihan dan/atau Sertifikasi TKK
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pencatatan Realisasi, Pengunggahan Dokumen KAK & Berita Acara Standar SIPJAKI Kementerian PUPR
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/pelatihan/rekapitulasi"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Lihat Rekap Pelatihan</span>
          </Link>
          <Link
            href="/pelatihan"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>Hub Pelatihan TKK</span>
          </Link>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ TAMBAH DATA</span>
          </button>
        </div>
      </div>

      {/* 2. Tiga Kartu Ringkasan Informasi (Sesuai Standar Baku SIPJAKI PUPR - Bersih & Rapi) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* KARTU 1: TOTAL DATA (TAHUN BERJALAN) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-[#0F2E5C] text-[#FFC000] flex items-center justify-center shrink-0 shadow-xs">
            <FileText className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 leading-none">
                {stats.totalData}
              </span>
              <span className="text-xs text-slate-400 font-semibold">Laporan ({currentYearStr})</span>
            </div>
            <p className="text-[11px] font-extrabold tracking-wider text-slate-500 uppercase mt-1">
              TOTAL LAPORAN PELAKSANAAN
            </p>
          </div>
        </div>

        {/* KARTU 2: TOTAL TKK (TAHUN BERJALAN) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Users className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-600 leading-none">
                {stats.totalTkk}
              </span>
              <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                Orang TKK
              </span>
            </div>
            <p className="text-[11px] font-extrabold tracking-wider text-slate-500 uppercase mt-1">
              TOTAL TKK TERFASILITASI
            </p>
          </div>
        </div>

        {/* KARTU 3: TOTAL DOKUMEN TERUNGGAH (KAK & BA) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Layers className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 leading-none">
                {stats.totalDokumen}
              </span>
              <span className="text-xs text-slate-400 font-semibold">Berkas Terverifikasi</span>
            </div>
            <p className="text-[11px] font-extrabold tracking-wider text-slate-500 uppercase mt-1">
              TOTAL DOKUMEN (KAK & BA)
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

          {/* Selector Urutan */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-bold border border-slate-300 rounded-xl px-3 py-1.5 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs cursor-pointer"
          >
            <option value="terkini">Riwayat Terkini</option>
            <option value="terlama">Riwayat Terlama</option>
            <option value="tkk_terbanyak">Jumlah TKK Terbanyak</option>
            <option value="nama_az">Nama Kegiatan (A-Z)</option>
          </select>

          {(filterTahun !== "Semua" || searchQuery.trim() !== "") && (
            <button
              onClick={handleResetFilter}
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-bold px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
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
              placeholder="Cari kegiatan, wilayah, BA..."
              className="w-full text-xs pl-10 pr-3 py-1.5 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-slate-400 font-medium bg-slate-50 focus:bg-white transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. Tabel Laporan Pelatihan (Light Surface Style Sesuai Acuan Baku SIPJAKI PUPR) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 uppercase font-extrabold tracking-wider text-[11px]">
                {/* 1. NO */}
                <th className="py-3.5 px-3 text-center w-12 border-r border-slate-200/80">
                  NO
                </th>
                {/* 2. WILAYAH & ENTITAS DAERAH */}
                <th 
                  onClick={() => handleSort("wilayah")}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 border-r border-slate-200/80 min-w-[200px]"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span>WILAYAH & DAERAH</span>
                    {sortField === "wilayah" ? (
                      sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-primary" /> : <ArrowDown className="w-3.5 h-3.5 text-primary" />
                    ) : <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </th>
                {/* 3. NAMA KEGIATAN */}
                <th 
                  onClick={() => handleSort("nama_kegiatan")}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 border-r border-slate-200/80 min-w-[260px]"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span>NAMA KEGIATAN</span>
                    {sortField === "nama_kegiatan" ? (
                      sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-primary" /> : <ArrowDown className="w-3.5 h-3.5 text-primary" />
                    ) : <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </th>
                {/* 4. TANGGAL */}
                <th 
                  onClick={() => handleSort("tanggal")}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 border-r border-slate-200/80 min-w-[110px] text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>TANGGAL</span>
                    {sortField === "tanggal" ? (
                      sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-primary" /> : <ArrowDown className="w-3.5 h-3.5 text-primary" />
                    ) : <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </th>
                {/* 5. JUMLAH TKK (STANDAR SIPJAKI) */}
                <th 
                  onClick={() => handleSort("jumlah_tkk")}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 border-r border-slate-200/80 min-w-[120px] text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>JUMLAH TKK</span>
                    {sortField === "jumlah_tkk" ? (
                      sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-primary" /> : <ArrowDown className="w-3.5 h-3.5 text-primary" />
                    ) : <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </th>
                {/* 6. TAHUN */}
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
                {/* 7. DOKUMEN (DUA SUBSTANSI: KAK & BA) */}
                <th className="py-3.5 px-3 text-center border-r border-slate-200/80 min-w-[170px]">
                  DOKUMEN
                </th>
                {/* 8. EDIT (HEADER KOLOM AKSI DINAMAI "EDIT") */}
                <th className="py-3.5 px-3 text-center min-w-[110px]">
                  EDIT
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-500">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto text-primary mb-2.5" />
                    <span className="font-semibold text-xs">Memuat data laporan pelatihan SIPJAKI...</span>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <FileText className="w-9 h-9 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-800 text-sm">Tidak ada data laporan ditemukan</p>
                      <p className="text-xs text-slate-400">
                        Coba sesuaikan kata kunci pencarian atau ubah filter tahun anggaran.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => {
                  const rowNumber = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* 1. NO */}
                      <td className="py-4 px-3 text-center font-bold text-slate-400 border-r border-slate-100">
                        {rowNumber}
                      </td>

                      {/* 2. WILAYAH & ENTITAS DAERAH */}
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

                      {/* 3. NAMA KEGIATAN */}
                      <td className="py-4 px-4 font-semibold text-slate-900 border-r border-slate-100">
                        <div>
                          <p className="text-xs font-bold text-slate-900 m-0 leading-snug">{item.nama_kegiatan}</p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                            {item.nomor_ba && (
                              <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">
                                No. BA: {item.nomor_ba}
                              </span>
                            )}
                            {item.lembaga_sertifikasi && (
                              <span className="truncate max-w-[160px] text-slate-500">
                                • {item.lembaga_sertifikasi}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 4. TANGGAL */}
                      <td className="py-4 px-3 text-center font-medium text-slate-700 border-r border-slate-100 whitespace-nowrap">
                        <span className="font-mono text-xs">{formatTanggalIndo(item.tanggal)}</span>
                      </td>

                      {/* 5. JUMLAH TKK (STANDAR SIPJAKI) */}
                      <td className="py-4 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span>{item.jumlah_tkk} {item.satuan_tkk || "Orang"}</span>
                        </span>
                      </td>

                      {/* 6. TAHUN */}
                      <td className="py-4 px-3 text-center font-bold text-slate-800 border-r border-slate-100">
                        <span className="font-mono text-xs">{item.tahun}</span>
                      </td>

                      {/* 7. DOKUMEN (DUA SUBSTANSI: KAK & BA) */}
                      <td className="py-4 px-3 text-center border-r border-slate-100">
                        <div className="inline-flex items-center justify-center gap-1.5 flex-wrap">
                          {/* Badge / Button KAK */}
                          {item.dokumen_kak_url ? (
                            <button
                              onClick={() => handleOpenDoc(item, "kak")}
                              title={`Pratinjau KAK: ${item.dokumen_kak_url}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer"
                            >
                              <FileText className="w-3 h-3 text-sky-600" />
                              <span>KAK</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No KAK</span>
                          )}

                          {/* Badge / Button Berita Acara / Laporan */}
                          {item.dokumen_ba_url ? (
                            <button
                              onClick={() => handleOpenDoc(item, "ba")}
                              title={`Pratinjau Berita Acara / Laporan: ${item.dokumen_ba_url}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                            >
                              <FileText className="w-3 h-3 text-emerald-600" />
                              <span>BA</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No BA</span>
                          )}
                        </div>
                      </td>

                      {/* 8. EDIT (TOMBOL AKSI KOMPAK SESUAI ACUAN RESMI SIPJAKI PUPR) */}
                      <td className="py-4 px-3 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          {/* Tombol Edit (Kuning/Amber Rounded Button) */}
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Data Laporan Pelatihan"
                            className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Tombol Hapus (Merah/Rose Rounded Button) */}
                          <button
                            onClick={() => handleOpenDelete(item)}
                            title="Hapus Data Laporan Pelatihan"
                            className="w-7 h-7 rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Tombol Rincian / Detail Opsional */}
                          <button
                            onClick={() => handleOpenDetail(item)}
                            title="Lihat Rincian Lengkap Kegiatan"
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

        {/* Paginasi Sederhana & Bersih */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-3.5 bg-slate-50/70 border-t border-slate-200 text-xs text-slate-600">
          <div>
            Menampilkan <span className="font-bold text-slate-900">
              {totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span> sampai <span className="font-bold text-slate-900">
              {Math.min(currentPage * pageSize, totalEntries)}
            </span> dari <span className="font-bold text-slate-900">{totalEntries}</span> laporan
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 font-bold text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                  currentPage === page
                    ? "bg-primary text-white"
                    : "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 font-bold text-xs"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: TAMBAH DATA LAPORAN (CLEAN INTEGRATED SEAMLESS DIALOG)           */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-[620px] overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Clean Integrated Header */}
            <div 
              style={{ padding: "18px 24px" }}
              className="flex items-center justify-between border-b border-slate-100 bg-white shrink-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shadow-2xs">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                      Tambah Data Laporan Pelatihan
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      TA {formTahun}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {formKabKota} • Standar Pelaporan SIPJAKI Kementerian PUPR
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitAdd} className="m-0">
              <div style={{ padding: "24px" }} className="space-y-4">
                
                {/* Row 1: Tahun & Wilayah */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tahun Anggaran <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formTahun}
                      onChange={(e) => setFormTahun(e.target.value)}
                      className="w-full text-xs font-bold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50 hover:bg-white text-slate-800 transition-colors"
                      required
                    >
                      <option value="2026">TA 2026</option>
                      <option value="2025">TA 2025</option>
                      <option value="2024">TA 2024</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kabupaten / Kota
                    </label>
                    <div className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-slate-100/70 text-slate-600 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{formKabKota}</span>
                    </div>
                  </div>
                </div>

                {/* Row 2: Nama Kegiatan Pelatihan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Program / Kegiatan Pelatihan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formNamaKegiatan}
                    onChange={(e) => setFormNamaKegiatan(e.target.value)}
                    placeholder="Contoh: Pelatihan Tenaga Terampil Konstruksi Tahap I TA 2026"
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 bg-white"
                    required
                  />
                </div>

                {/* Row 3: Tanggal Pelaksanaan & Jumlah TKK */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tanggal Pelaksanaan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formTanggal}
                      onChange={(e) => setFormTanggal(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jumlah TKK (Peserta) <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex rounded-xl border border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden bg-white shadow-2xs">
                      <input
                        type="number"
                        min="1"
                        value={formJumlahTkk}
                        onChange={(e) => setFormJumlahTkk(Number(e.target.value))}
                        className="w-full text-xs font-bold px-3 py-2 text-slate-900 focus:outline-none"
                        required
                      />
                      <div className="bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700 border-l border-blue-200 flex items-center select-none shrink-0">
                        Orang TKK
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 4: Lembaga LSP & Nomor Berita Acara */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Lembaga Penyelenggara / LSP
                    </label>
                    <input
                      type="text"
                      value={formLembagaSertifikasi}
                      onChange={(e) => setFormLembagaSertifikasi(e.target.value)}
                      placeholder="Nama LSP / Balai Jasa Konstruksi..."
                      className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nomor Berita Acara (BA)
                    </label>
                    <input
                      type="text"
                      value={formNomorBa}
                      onChange={(e) => setFormNomorBa(e.target.value)}
                      placeholder="Contoh: 014/BA-PEL-DPU/IV/2026"
                      className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 bg-white"
                    />
                  </div>
                </div>

                {/* Row 5: Dua Input Dokumen Mandiri (KAK & BA) */}
                <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-3">
                  <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block">
                    Unggah Substansi Berkas Dokumen (Standar SIPJAKI):
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Substansi 1: KAK */}
                    <div>
                      <label className="block text-[11px] font-bold text-sky-800 mb-1">
                        1. Dokumen KAK (Kerangka Acuan Kerja) *
                      </label>
                      <div className="relative">
                        <FileText className="w-3.5 h-3.5 text-sky-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={formDokumenKak}
                          onChange={(e) => setFormDokumenKak(e.target.value)}
                          placeholder="KAK_Pelatihan_2026.pdf"
                          className="w-full text-xs font-mono pl-8 pr-2 py-1.5 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white text-slate-900"
                          required
                        />
                      </div>
                    </div>

                    {/* Substansi 2: Berita Acara / Laporan Akhir */}
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                        2. Dokumen Lainnya / Berita Acara (BA) *
                      </label>
                      <div className="relative">
                        <FileText className="w-3.5 h-3.5 text-emerald-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={formDokumenBa}
                          onChange={(e) => setFormDokumenBa(e.target.value)}
                          placeholder="BA_Pelatihan_2026.pdf"
                          className="w-full text-xs font-mono pl-8 pr-2 py-1.5 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-slate-900"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 6: Catatan / Keterangan Tambahan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan Keterangan
                  </label>
                  <textarea
                    rows={2}
                    value={formCatatan}
                    onChange={(e) => setFormCatatan(e.target.value)}
                    placeholder="Keterangan singkat pelaksanaan kegiatan..."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 leading-relaxed bg-white"
                  />
                </div>
              </div>

              {/* Modal Action Buttons Footer */}
              <div 
                style={{ padding: "18px 24px", backgroundColor: "#F8FAFC" }}
                className="border-t border-slate-200 flex items-center justify-between shrink-0"
              >
                <span className="text-[11px] text-slate-400 font-medium">
                  Sinkron otomatis standar SIPJAKI
                </span>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{ padding: "10px 18px" }}
                    className="rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ padding: "10px 22px", backgroundColor: "#059669" }}
                    className="inline-flex items-center gap-1.5 rounded-xl text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>{isSubmitting ? "Menyimpan..." : "Simpan Laporan"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT DATA LAPORAN (CLEAN INTEGRATED SEAMLESS DIALOG)             */}
      {/* ========================================================================= */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-[620px] overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Clean Integrated Header */}
            <div 
              style={{ padding: "18px 24px" }}
              className="flex items-center justify-between border-b border-slate-100 bg-white shrink-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 shadow-2xs">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                      Edit Data Laporan Pelatihan
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      TA {formTahun}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {formKabKota} • ID: {selectedItem.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitEdit} className="m-0">
              <div style={{ padding: "24px" }} className="space-y-4">
                
                {/* Row 1: Tahun & Wilayah */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tahun Anggaran <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formTahun}
                      onChange={(e) => setFormTahun(e.target.value)}
                      className="w-full text-xs font-bold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50 hover:bg-white text-slate-800 transition-colors"
                      required
                    >
                      <option value="2026">TA 2026</option>
                      <option value="2025">TA 2025</option>
                      <option value="2024">TA 2024</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kabupaten / Kota
                    </label>
                    <div className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-slate-100/70 text-slate-600 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{formKabKota}</span>
                    </div>
                  </div>
                </div>

                {/* Row 2: Nama Kegiatan Pelatihan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Program / Kegiatan Pelatihan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formNamaKegiatan}
                    onChange={(e) => setFormNamaKegiatan(e.target.value)}
                    placeholder="Contoh: Pelatihan Tenaga Terampil Konstruksi Tahap I TA 2026"
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 bg-white"
                    required
                  />
                </div>

                {/* Row 3: Tanggal Pelaksanaan & Jumlah TKK */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tanggal Pelaksanaan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formTanggal}
                      onChange={(e) => setFormTanggal(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jumlah TKK (Peserta) <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex rounded-xl border border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden bg-white shadow-2xs">
                      <input
                        type="number"
                        min="1"
                        value={formJumlahTkk}
                        onChange={(e) => setFormJumlahTkk(Number(e.target.value))}
                        className="w-full text-xs font-bold px-3 py-2 text-slate-900 focus:outline-none"
                        required
                      />
                      <div className="bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700 border-l border-blue-200 flex items-center select-none shrink-0">
                        Orang TKK
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 4: Lembaga LSP & Nomor Berita Acara */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Lembaga Penyelenggara / LSP
                    </label>
                    <input
                      type="text"
                      value={formLembagaSertifikasi}
                      onChange={(e) => setFormLembagaSertifikasi(e.target.value)}
                      placeholder="Nama LSP / Balai Jasa Konstruksi..."
                      className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nomor Berita Acara (BA)
                    </label>
                    <input
                      type="text"
                      value={formNomorBa}
                      onChange={(e) => setFormNomorBa(e.target.value)}
                      placeholder="Contoh: 014/BA-PEL-DPU/IV/2026"
                      className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 bg-white"
                    />
                  </div>
                </div>

                {/* Row 5: Dua Input Dokumen Mandiri (KAK & BA) */}
                <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-3">
                  <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block">
                    Perbarui Berkas Dokumen (Standar SIPJAKI):
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Substansi 1: KAK */}
                    <div>
                      <label className="block text-[11px] font-bold text-sky-800 mb-1">
                        1. Dokumen KAK (Kerangka Acuan Kerja) *
                      </label>
                      <div className="relative">
                        <FileText className="w-3.5 h-3.5 text-sky-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={formDokumenKak}
                          onChange={(e) => setFormDokumenKak(e.target.value)}
                          placeholder="KAK_Pelatihan_2026.pdf"
                          className="w-full text-xs font-mono pl-8 pr-2 py-1.5 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white text-slate-900"
                          required
                        />
                      </div>
                    </div>

                    {/* Substansi 2: Berita Acara / Laporan Akhir */}
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                        2. Dokumen Lainnya / Berita Acara (BA) *
                      </label>
                      <div className="relative">
                        <FileText className="w-3.5 h-3.5 text-emerald-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={formDokumenBa}
                          onChange={(e) => setFormDokumenBa(e.target.value)}
                          placeholder="BA_Pelatihan_2026.pdf"
                          className="w-full text-xs font-mono pl-8 pr-2 py-1.5 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-slate-900"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 6: Catatan / Keterangan Tambahan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan Keterangan
                  </label>
                  <textarea
                    rows={2}
                    value={formCatatan}
                    onChange={(e) => setFormCatatan(e.target.value)}
                    placeholder="Keterangan singkat pelaksanaan kegiatan..."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 leading-relaxed bg-white"
                  />
                </div>
              </div>

              {/* Modal Action Buttons Footer */}
              <div 
                style={{ padding: "18px 24px", backgroundColor: "#F8FAFC" }}
                className="border-t border-slate-200 flex items-center justify-between shrink-0"
              >
                <span className="text-[11px] text-slate-400 font-medium">
                  Sinkron otomatis standar SIPJAKI
                </span>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    style={{ padding: "10px 18px" }}
                    className="rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ padding: "10px 22px", backgroundColor: "#0F2E5C" }}
                    className="inline-flex items-center gap-1.5 rounded-xl text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DIALOG KONFIRMASI HAPUS (SAFETY DIALOG)                           */}
      {/* ========================================================================= */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            style={{ padding: "28px 24px" }}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[420px] text-center animate-in zoom-in-95 duration-150"
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200 shadow-2xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-base font-black text-slate-900 mb-1.5">
              Hapus Data Laporan?
            </h3>
            
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus data laporan kegiatan <strong className="text-slate-800 font-bold">"{selectedItem.nama_kegiatan}"</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                style={{ padding: "10px 20px" }}
                className="rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                style={{ padding: "10px 20px" }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Menghapus..." : "Hapus Permanen"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: PRATINJAU DOKUMEN (KAK & BERITA ACARA / LAPORAN)                  */}
      {/* ========================================================================= */}
      {showDocModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[500px] overflow-hidden animate-in zoom-in-95 duration-150">
            
            <div 
              style={{ padding: "18px 24px" }}
              className="flex items-center justify-between border-b border-slate-100 bg-white shrink-0"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Dokumen Kegiatan SIPJAKI</h3>
                  <p className="text-xs text-slate-400 font-medium">{selectedItem.kab_kota} • TA {selectedItem.tahun}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDocModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div style={{ padding: "24px" }} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2 text-xs">
                <p className="font-extrabold text-slate-900 leading-snug">{selectedItem.nama_kegiatan}</p>
                <p className="text-[11px] text-slate-500 font-medium">Tanggal: {formatTanggalIndo(selectedItem.tanggal)} • Jumlah TKK: {selectedItem.jumlah_tkk} Orang</p>
              </div>

              {/* Dua Substansi Dokumen */}
              <div className="space-y-3">
                {/* 1. Berkas KAK */}
                <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
                        Dokumen 1: Kerangka Acuan Kerja (KAK)
                      </span>
                      <p className="text-xs font-mono text-slate-700 truncate font-semibold">
                        {selectedItem.dokumen_kak_url || "KAK_Pelatihan_TKK_2026.pdf"}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/docs/${selectedItem.dokumen_kak_url || "KAK_Pelatihan_TKK_2026.pdf"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors shadow-2xs shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka KAK</span>
                  </a>
                </div>

                {/* 2. Berkas Berita Acara / Laporan Akhir */}
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Dokumen 2: Berita Acara & Laporan (BA)
                      </span>
                      <p className="text-xs font-mono text-slate-700 truncate font-semibold">
                        {selectedItem.dokumen_ba_url || "BA_Pelatihan_TKK_2026.pdf"}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/docs/${selectedItem.dokumen_ba_url || "BA_Pelatihan_TKK_2026.pdf"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka BA</span>
                  </a>
                </div>
              </div>
            </div>

            <div 
              style={{ padding: "16px 24px", backgroundColor: "#F8FAFC" }}
              className="border-t border-slate-200 flex items-center justify-between"
            >
              <span className="text-xs text-slate-400 font-medium">SIPJAKI Kab. Bogor</span>
              <button
                type="button"
                onClick={() => setShowDocModal(false)}
                style={{ padding: "8px 18px" }}
                className="rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: RINCIAN LENGKAP KEGIATAN                                         */}
      {/* ========================================================================= */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[560px] overflow-hidden animate-in zoom-in-95 duration-150">
            
            <div 
              style={{ padding: "18px 24px" }}
              className="flex items-center justify-between border-b border-slate-100 bg-white shrink-0"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Rincian Kegiatan Pelatihan</h3>
                  <p className="text-xs text-slate-400 font-medium">{selectedItem.kab_kota} • TA {selectedItem.tahun}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div style={{ padding: "24px" }} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Program / Kegiatan:</span>
                  <span className="font-extrabold text-slate-900 max-w-[300px] text-right">{selectedItem.nama_kegiatan}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Tanggal Pelaksanaan:</span>
                  <span className="font-bold text-slate-800">{formatTanggalIndo(selectedItem.tanggal)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Jumlah Peserta TKK:</span>
                  <span className="font-black text-blue-700">{selectedItem.jumlah_tkk} {selectedItem.satuan_tkk || "Orang"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Lembaga Penyelenggara:</span>
                  <span className="font-semibold text-slate-800">{selectedItem.lembaga_sertifikasi || "-"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Nomor Berita Acara:</span>
                  <span className="font-mono text-slate-800 font-bold">{selectedItem.nomor_ba || "-"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Dokumen KAK:</span>
                  <span className="font-mono text-sky-700 font-bold">{selectedItem.dokumen_kak_url || "-"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Dokumen BA / Laporan:</span>
                  <span className="font-mono text-emerald-700 font-bold">{selectedItem.dokumen_ba_url || "-"}</span>
                </div>
              </div>

              {selectedItem.catatan_verifikasi && (
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 leading-relaxed">
                  <strong className="block mb-0.5 text-slate-800 font-bold">Catatan Verifikasi Kegiatan:</strong>
                  {selectedItem.catatan_verifikasi}
                </div>
              )}
            </div>

            <div 
              style={{ padding: "16px 24px", backgroundColor: "#F8FAFC" }}
              className="border-t border-slate-200 flex items-center justify-between"
            >
              <span className="text-xs text-slate-400 font-medium">SIJAKON Kabupaten Bogor</span>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                style={{ padding: "8px 18px" }}
                className="rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
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

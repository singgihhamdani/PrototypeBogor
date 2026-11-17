"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  GraduationCap, Users, Plus, FileSpreadsheet, Eye, 
  Trash2, RotateCcw, Filter, Search, Printer, Download,
  MapPin, CheckCircle2, AlertTriangle, X, ChevronLeft, ChevronRight,
  Database as DbIcon, Loader2, ArrowUpDown, ArrowUp, ArrowDown,
  Edit3, Award, Calendar, BookOpen, UserCheck, Sparkles, Check,
  Laptop, Globe, Shield, Home
} from "lucide-react";
import { 
  fetchPelatihanSipjakiList, createPelatihanSipjaki, updatePelatihanSipjaki, 
  deletePelatihanSipjaki, bulkDeletePelatihanSipjaki, batchInsertPelatihanSipjaki,
  PelatihanSipjakiItem, PelatihanSipjakiInsert, DataSourceStatus 
} from "@/lib/services/pelatihan-service";
import BatchImportModal, { BatchColumnDef } from "@/components/common/batch-import-modal";
import { exportToSpreadsheet, ExportColumn } from "@/lib/export-utils";

// Definisi Kolom Impor Batch
const IMPORT_COLUMNS_PELATIHAN: BatchColumnDef[] = [
  { key: "tahun", label: "Tahun Anggaran", required: true, example: "2026" },
  { key: "nama_kegiatan", label: "Nama Kegiatan Pelatihan", required: true, example: "Bimtek Petugas K3 Konstruksi" },
  { key: "metode", label: "Metode", required: true, example: "Reguler / Hybrid / Distance Learning / Infrastruktur Berbasis Masyarakat / Lembaga Pemasyarakatan" },
  { key: "lokasi", label: "Lokasi Pelaksanaan", required: true, example: "Pusdiklat DPU Cibinong" },
  { key: "jumlah_l", label: "Peserta Laki-laki (L)", required: true, example: "25" },
  { key: "jumlah_p", label: "Peserta Perempuan (P)", required: true, example: "5" },
  { key: "skk_jenjang", label: "Jenjang SKK", required: false, example: "Jenjang 5 (Teknisi/Analis)" },
  { key: "status", label: "Status Kegiatan", required: false, example: "Selesai & Tersertifikasi" }
];

// Opsi Metode Pelaksanaan Baku SIPJAKI
const METODE_PELATIHAN_LIST = [
  "Reguler",
  "Hybrid",
  "Mobile Training Unit (MTU)",
  "Distance Learning",
  "Infrastruktur Berbasis Masyarakat",
  "Lembaga Pemasyarakatan",
  "On The Job Training",
  "Daring / E-Learning"
];

export default function DashboardPelatihanPage() {
  const currentYearStr = "2026";

  // Data state
  const [pelatihanList, setPelatihanList] = useState<PelatihanSipjakiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState<DataSourceStatus>({
    source: "fallback",
    message: "Memuat data pelatihan..."
  });

  // Filter & Search state (Single-Row Action Bar)
  const [filterTahun, setFilterTahun] = useState<string>("Semua");
  const [filterMetode, setFilterMetode] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sorting state (Default: Riwayat Terkini -> tahun desc, updated_at desc)
  const [sortBy, setSortBy] = useState<"terkini" | "terlama" | "peserta" | "nama">("terkini");
  const [sortField, setSortField] = useState<keyof PelatihanSipjakiItem>("updated_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Selection Checkbox State (Multi-select)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal States
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PelatihanSipjakiItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formTahun, setFormTahun] = useState("2026");
  const [formNamaKegiatan, setFormNamaKegiatan] = useState("");
  const [formMetode, setFormMetode] = useState("Distance Learning");
  const [formLokasi, setFormLokasi] = useState("");
  const [formJumlahL, setFormJumlahL] = useState<number>(20);
  const [formJumlahP, setFormJumlahP] = useState<number>(5);
  const [formKabKota, setFormKabKota] = useState("Kabupaten Bogor");
  const [formPropinsi, setFormPropinsi] = useState("Jawa Barat");
  const [formSkkJenjang, setFormSkkJenjang] = useState("Jenjang 5 (Teknisi/Analis)");
  const [formPenyelenggara, setFormPenyelenggara] = useState("Dinas PUPR Kabupaten Bogor");
  const [formStatus, setFormStatus] = useState("Selesai & Tersertifikasi");
  const [formKeterangan, setFormKeterangan] = useState("");

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
      const res = await fetchPelatihanSipjakiList();
      setPelatihanList(res.data);
      setDataStatus(res.status);
    } catch (err) {
      console.error("Gagal memuat data pelatihan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Data
  const filteredData = useMemo(() => {
    return pelatihanList.filter(item => {
      // Filter Tahun
      if (filterTahun !== "Semua" && item.tahun !== filterTahun) {
        return false;
      }
      // Filter Metode
      if (filterMetode !== "Semua" && item.metode !== filterMetode) {
        return false;
      }
      // Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchTitle = (item.nama_kegiatan || "").toLowerCase().includes(q);
        const matchLocation = (item.lokasi || "").toLowerCase().includes(q);
        const matchMethod = (item.metode || "").toLowerCase().includes(q);
        const matchCity = (item.kab_kota || "").toLowerCase().includes(q);
        const matchProvince = (item.propinsi || "").toLowerCase().includes(q);
        const matchYear = (item.tahun || "").toLowerCase().includes(q);
        if (!matchTitle && !matchLocation && !matchMethod && !matchCity && !matchProvince && !matchYear) {
          return false;
        }
      }
      return true;
    });
  }, [pelatihanList, filterTahun, filterMetode, searchQuery]);

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

    if (sortBy === "peserta") {
      list.sort((a, b) => {
        const totalA = (Number(a.jumlah_l) || 0) + (Number(a.jumlah_p) || 0);
        const totalB = (Number(b.jumlah_l) || 0) + (Number(b.jumlah_p) || 0);
        return totalB - totalA;
      });
      return list;
    }

    if (sortBy === "nama") {
      list.sort((a, b) => (a.nama_kegiatan || "").localeCompare(b.nama_kegiatan || ""));
      return list;
    }

    // Manual Column Header Sorting
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

  // Paged Data
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Dynamic Metrics
  const totalKegiatan = filteredData.length;
  const totalL = filteredData.reduce((acc, curr) => acc + (Number(curr.jumlah_l) || 0), 0);
  const totalP = filteredData.reduce((acc, curr) => acc + (Number(curr.jumlah_p) || 0), 0);
  const totalPeserta = totalL + totalP;

  // Sorting Handler
  const handleSort = (field: keyof PelatihanSipjakiItem) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
      setSortBy("terkini");
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilterTahun("Semua");
    setFilterMetode("Semua");
    setSearchQuery("");
    setSortBy("terkini");
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  // Checkbox handlers
  const isAllPageSelected = paginatedData.length > 0 && paginatedData.every(row => selectedIds.has(row.id));

  const handleSelectAll = (checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      paginatedData.forEach(row => next.add(row.id));
    } else {
      paginatedData.forEach(row => next.delete(row.id));
    }
    setSelectedIds(next);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    setSelectedIds(next);
  };

  // Form Reset
  const resetFormFields = () => {
    setFormTahun("2026");
    setFormNamaKegiatan("");
    setFormMetode("Distance Learning");
    setFormLokasi("");
    setFormJumlahL(20);
    setFormJumlahP(5);
    setFormKabKota("Kabupaten Bogor");
    setFormPropinsi("Jawa Barat");
    setFormSkkJenjang("Jenjang 5 (Teknisi/Analis)");
    setFormPenyelenggara("Dinas PUPR Kabupaten Bogor");
    setFormStatus("Selesai & Tersertifikasi");
    setFormKeterangan("");
    setSelectedItem(null);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: PelatihanSipjakiItem) => {
    setSelectedItem(item);
    setFormTahun(item.tahun);
    setFormNamaKegiatan(item.nama_kegiatan);
    setFormMetode(item.metode);
    setFormLokasi(item.lokasi);
    setFormJumlahL(item.jumlah_l);
    setFormJumlahP(item.jumlah_p);
    setFormKabKota(item.kab_kota);
    setFormPropinsi(item.propinsi);
    setFormSkkJenjang(item.skk_jenjang || "Jenjang 5 (Teknisi/Analis)");
    setFormPenyelenggara(item.penyelenggara || "Dinas PUPR Kabupaten Bogor");
    setFormStatus(item.status);
    setFormKeterangan(item.keterangan || "");
    setShowEditModal(true);
  };

  // Open Detail Modal
  const handleOpenDetail = (item: PelatihanSipjakiItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (item: PelatihanSipjakiItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  // Submit Add
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNamaKegiatan.trim() || !formLokasi.trim()) {
      alert("Harap lengkapi Nama Kegiatan dan Lokasi Pelatihan!");
      return;
    }

    setIsSubmitting(true);
    const newId = `PEL-${formTahun}-${String(Date.now()).slice(-3)}`;
    const newEntry: PelatihanSipjakiInsert = {
      id: newId,
      tahun: formTahun,
      nama_kegiatan: formNamaKegiatan.trim(),
      metode: formMetode,
      lokasi: formLokasi.trim(),
      jumlah_l: Number(formJumlahL) || 0,
      jumlah_p: Number(formJumlahP) || 0,
      kab_kota: formKabKota,
      propinsi: formPropinsi,
      skk_jenjang: formSkkJenjang,
      penyelenggara: formPenyelenggara,
      status: formStatus,
      keterangan: formKeterangan
    };

    try {
      await createPelatihanSipjaki(newEntry);
      await loadData();
      setShowAddModal(false);
      resetFormFields();
      triggerNotice(`Kegiatan pelatihan "${newEntry.nama_kegiatan}" berhasil ditambahkan.`);
    } catch (err) {
      console.error("Gagal menambah pelatihan:", err);
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    if (!formNamaKegiatan.trim() || !formLokasi.trim()) {
      alert("Harap lengkapi Nama Kegiatan dan Lokasi Pelatihan!");
      return;
    }

    setIsSubmitting(true);
    const updates: Partial<PelatihanSipjakiItem> = {
      tahun: formTahun,
      nama_kegiatan: formNamaKegiatan.trim(),
      metode: formMetode,
      lokasi: formLokasi.trim(),
      jumlah_l: Number(formJumlahL) || 0,
      jumlah_p: Number(formJumlahP) || 0,
      kab_kota: formKabKota,
      propinsi: formPropinsi,
      skk_jenjang: formSkkJenjang,
      penyelenggara: formPenyelenggara,
      status: formStatus,
      keterangan: formKeterangan
    };

    try {
      await updatePelatihanSipjaki(selectedItem.id, updates);
      await loadData();
      setShowEditModal(false);
      resetFormFields();
      triggerNotice(`Perubahan data kegiatan "${updates.nama_kegiatan}" berhasil disimpan.`);
    } catch (err) {
      console.error("Gagal mengupdate pelatihan:", err);
      alert("Terjadi kesalahan saat memperbarui data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Single Delete
  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      await deletePelatihanSipjaki(selectedItem.id);
      selectedIds.delete(selectedItem.id);
      setSelectedIds(new Set(selectedIds));
      await loadData();
      setShowDeleteModal(false);
      triggerNotice(`Kegiatan "${selectedItem.nama_kegiatan}" berhasil dihapus.`);
      setSelectedItem(null);
    } catch (err) {
      console.error("Gagal menghapus kegiatan:", err);
      alert("Terjadi kesalahan saat menghapus data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Bulk Delete
  const handleConfirmBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsSubmitting(true);
    try {
      await bulkDeletePelatihanSipjaki(Array.from(selectedIds));
      triggerNotice(`${selectedIds.size} kegiatan pelatihan berhasil dihapus.`);
      setSelectedIds(new Set());
      await loadData();
      setShowBulkDeleteModal(false);
    } catch (err) {
      console.error("Gagal menghapus beberapa data:", err);
      alert("Terjadi kesalahan saat menghapus data massal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Batch Import Commit
  const handleImportCommit = async (importedRows: Record<string, any>[]) => {
    const formatted: PelatihanSipjakiInsert[] = importedRows.map((row, idx) => ({
      id: `PEL-IMP-${Date.now()}-${idx + 1}`,
      tahun: String(row.tahun || "2026"),
      nama_kegiatan: String(row.nama_kegiatan || "Kegiatan Bimtek TKK"),
      metode: String(row.metode || "Distance Learning"),
      lokasi: String(row.lokasi || "Kabupaten Bogor"),
      jumlah_l: Number(row.jumlah_l) || 0,
      jumlah_p: Number(row.jumlah_p) || 0,
      kab_kota: "Kabupaten Bogor",
      propinsi: "Jawa Barat",
      skk_jenjang: row.skk_jenjang || "Jenjang 5 (Teknisi/Analis)",
      penyelenggara: "Dinas PUPR Kabupaten Bogor",
      status: row.status || "Selesai & Tersertifikasi"
    }));

    await batchInsertPelatihanSipjaki(formatted);
    await loadData();
    setShowImportModal(false);
    triggerNotice(`Berhasil mengimpor ${formatted.length} kegiatan pelatihan!`);
  };

  // Export to Spreadsheet
  const handleExportData = () => {
    const targetData = selectedIds.size > 0 
      ? sortedData.filter(d => selectedIds.has(d.id))
      : sortedData;

    const exportCols: ExportColumn[] = [
      { key: "tahun", label: "Tahun Anggaran", sipjakiLabel: "TAHUN" },
      { key: "nama_kegiatan", label: "Nama Kegiatan Pelatihan", sipjakiLabel: "NAMA KEGIATAN PELATIHAN" },
      { key: "metode", label: "Metode Pelaksanaan", sipjakiLabel: "METODE" },
      { key: "lokasi", label: "Lokasi Pelatihan", sipjakiLabel: "LOKASI" },
      { key: "jumlah_l", label: "Peserta Laki-laki (L)", sipjakiLabel: "L" },
      { key: "jumlah_p", label: "Peserta Perempuan (P)", sipjakiLabel: "P" },
      { key: "total_peserta", label: "Total Peserta", sipjakiLabel: "TOTAL PESERTA" },
      { key: "kab_kota", label: "Kabupaten/Kota", sipjakiLabel: "KABUPATEN/KOTA" },
      { key: "propinsi", label: "Provinsi", sipjakiLabel: "PROVINSI" },
      { key: "status", label: "Status", sipjakiLabel: "STATUS" }
    ];

    exportToSpreadsheet({
      fileName: `Daftar_Pelatihan_SIPJAKI_Kab_Bogor_${new Date().toISOString().slice(0, 10)}`,
      sheetName: "PELATIHAN TKK",
      columns: exportCols,
      data: targetData,
      sipjakiMode: true
    });
  };

  // Print Action
  const handlePrint = () => {
    window.print();
  };

  // Helper Badge Metode (Termasuk 3 Metode Baru: Distance Learning, IBM, Lembaga Pemasyarakatan)
  const renderMethodBadge = (metode: string) => {
    const m = (metode || "").toLowerCase();

    // 1. Distance Learning (Indigo)
    if (m.includes("distance") || m.includes("jarak jauh")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200/80 whitespace-nowrap shadow-2xs">
          <Laptop className="w-3 h-3 text-indigo-600" />
          <span>Distance Learning</span>
        </span>
      );
    }

    // 2. Lembaga Pemasyarakatan (Amber / Orange) - Harus dicek sebelum 'masyarakat'
    if (m.includes("pemasyarakatan") || m.includes("pemasyarakat") || m.includes("lapas") || m.includes("warga binaan")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200/80 whitespace-nowrap shadow-2xs">
          <Shield className="w-3 h-3 text-amber-700" />
          <span>Lembaga Pemasyarakatan</span>
        </span>
      );
    }

    // 3. Infrastruktur Berbasis Masyarakat (Emerald)
    if (m.includes("masyarakat") || m.includes("ibm") || m.includes("padat karya")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap shadow-2xs">
          <Home className="w-3 h-3 text-emerald-600" />
          <span>Infrastruktur Berbasis Masyarakat</span>
        </span>
      );
    }

    // 4. Mobile Training Unit (MTU)
    if (m.includes("mtu") || m.includes("mobile")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
          <span>MTU</span>
        </span>
      );
    }

    // 5. Hybrid
    if (m.includes("hybrid")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
          <span>Hybrid</span>
        </span>
      );
    }

    // 6. On The Job Training
    if (m.includes("job") || m.includes("ojt")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">
          <span>On The Job Training</span>
        </span>
      );
    }

    // 7. Daring / E-Learning
    if (m.includes("daring") || m.includes("e-learning")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-sky-50 text-sky-700 border border-sky-200 whitespace-nowrap">
          <span>Daring / E-Learning</span>
        </span>
      );
    }

    // Default Reguler
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
        <span>{metode || "Reguler"}</span>
      </span>
    );
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

      {/* 1. Header Modul Terpadu SIPJAKI */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Award className="w-4 h-4 text-primary" />
            <span>Pilar 5: Pembinaan & Sertifikasi Jasa Konstruksi</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1.5" title="Koneksi Cloud Sinkron" />
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              SIPJAKI Master Data
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Dashboard Pelatihan SIPJAKI
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pencatatan dan pengelolaan data kegiatan pelatihan dan fasilitasi sertifikasi TKK standar SIPJAKI Kementerian PUPR
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/pelatihan/rekapitulasi"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Rekapitulasi Pelatihan</span>
          </Link>
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import Excel</span>
          </button>
          <button
            onClick={() => {
              resetFormFields();
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ TAMBAH PELATIHAN</span>
          </button>
        </div>
      </div>

      {/* 2. Kartu Ringkasan Informasi (2 Statistik Utama Bersih & Rapi) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        
        {/* KARTU 1: TOTAL KEGIATAN PELATIHAN */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-[#0F2E5C] text-[#FFC000] flex items-center justify-center shrink-0 shadow-xs">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 leading-none">
                {totalKegiatan}
              </span>
              <span className="text-xs text-slate-400 font-semibold">Kegiatan Terdaftar</span>
            </div>
            <p className="text-[11px] font-extrabold tracking-wider text-slate-500 uppercase mt-1">
              TOTAL KEGIATAN PELATIHAN
            </p>
          </div>
        </div>

        {/* KARTU 2: TOTAL PESERTA TERDAFTAR (PUG GENDER) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Users className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-600 leading-none">
                {totalPeserta}
              </span>
              <span className="text-xs text-slate-400 font-semibold">Orang Peserta</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                👨 L: {totalL} ({totalPeserta > 0 ? Math.round((totalL / totalPeserta) * 100) : 0}%)
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                👩 P: {totalP} ({totalPeserta > 0 ? Math.round((totalP / totalPeserta) * 100) : 0}%)
              </span>
            </div>
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

          {/* Filter Metode (Termasuk 3 Metode Baru) */}
          <select
            id="filterMetodeSelect"
            value={filterMetode}
            onChange={(e) => {
              setFilterMetode(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs font-bold border border-slate-300 rounded-xl px-3 py-1.5 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs cursor-pointer"
          >
            <option value="Semua">Semua Metode</option>
            {METODE_PELATIHAN_LIST.map((met) => (
              <option key={met} value={met}>{met}</option>
            ))}
          </select>

          {/* Selector Urutan (Default: Riwayat Terkini DESC) */}
          <select
            id="sortSelect"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-bold border border-slate-300 rounded-xl px-3 py-1.5 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs cursor-pointer"
          >
            <option value="terkini">Riwayat Terkini</option>
            <option value="terlama">Riwayat Terlama</option>
            <option value="peserta">Peserta Terbanyak</option>
            <option value="nama">Nama Kegiatan (A-Z)</option>
          </select>

          {(filterTahun !== "Semua" || filterMetode !== "Semua" || searchQuery.trim() !== "") && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-bold px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Tombol Hapus Terpilih */}
          {selectedIds.size > 0 && (
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="inline-flex items-center gap-1.5 text-xs text-rose-700 hover:text-rose-800 font-bold px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 transition-colors shadow-2xs cursor-pointer animate-in fade-in"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus ({selectedIds.size})</span>
            </button>
          )}
        </div>

        {/* Right Side: Badge Default DESC, Tools & Search Box */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Badge Default Riwayat Terkini */}
          <span 
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200"
            title="Secara baku urutan data disusun kronologis terbalik (paling terbaru/update di atas)"
          >
            <ArrowUpDown className="w-3 h-3 text-blue-600" />
            <span>Riwayat Terkini (DESC)</span>
          </span>

          {/* Tools: Export & Print */}
          <button
            onClick={handleExportData}
            title="Ekspor Data ke Excel"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={handlePrint}
            title="Cetak Halaman"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <div className="relative w-full sm:w-56">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari kegiatan, lokasi..."
              className="w-full text-xs pl-10 pr-3 py-1.5 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-slate-400 font-medium bg-slate-50 focus:bg-white transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* 4. Tabel Rincian Pelatihan (Light Surface Style Sesuai Acuan Asli SIPJAKI PUPR - Bersih & Rapi) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 uppercase font-extrabold tracking-wider text-[11px]">
                {/* 1. Checkbox Master */}
                <th className="py-3.5 px-3 text-center w-10 border-r border-slate-200/80">
                  <input
                    type="checkbox"
                    checked={isAllPageSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                    title="Pilih Semua di Halaman Ini"
                  />
                </th>

                {/* 2. TAHUN */}
                <th 
                  onClick={() => handleSort("tahun")}
                  className="py-3.5 px-3 text-center cursor-pointer hover:bg-slate-100 border-r border-slate-200/80 w-20"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>TAHUN</span>
                    {sortField === "tahun" ? (
                      sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />
                    ) : <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                  </div>
                </th>

                {/* 3. NAMA KEGIATAN PELATIHAN */}
                <th 
                  onClick={() => handleSort("nama_kegiatan")}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 border-r border-slate-200/80 min-w-[280px]"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span>NAMA KEGIATAN PELATIHAN</span>
                    {sortField === "nama_kegiatan" ? (
                      sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-primary" /> : <ArrowDown className="w-3.5 h-3.5 text-primary" />
                    ) : <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </th>

                {/* 4. METODE */}
                <th 
                  onClick={() => handleSort("metode")}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 border-r border-slate-200/80 min-w-[160px] text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>METODE</span>
                    {sortField === "metode" ? (
                      sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />
                    ) : <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </th>

                {/* 5. LOKASI */}
                <th 
                  onClick={() => handleSort("lokasi")}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 border-r border-slate-200/80 min-w-[180px]"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>LOKASI</span>
                    {sortField === "lokasi" ? (
                      sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />
                    ) : <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </th>

                {/* 6. L (Laki-laki) */}
                <th 
                  onClick={() => handleSort("jumlah_l")}
                  className="py-3.5 px-2.5 text-center cursor-pointer hover:bg-slate-100 border-r border-slate-200/80 w-14"
                  title="Jumlah Peserta Laki-laki"
                >
                  <span>L</span>
                </th>

                {/* 7. P (Perempuan) */}
                <th 
                  onClick={() => handleSort("jumlah_p")}
                  className="py-3.5 px-2.5 text-center cursor-pointer hover:bg-slate-100 border-r border-slate-200/80 w-14"
                  title="Jumlah Peserta Perempuan"
                >
                  <span>P</span>
                </th>

                {/* 8. KABUPATEN/KOTA */}
                <th 
                  onClick={() => handleSort("kab_kota")}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 border-r border-slate-200/80 min-w-[130px]"
                >
                  <span>KABUPATEN/KOTA</span>
                </th>

                {/* 9. PROVINSI */}
                <th 
                  onClick={() => handleSort("propinsi")}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 border-r border-slate-200/80 min-w-[110px]"
                >
                  <span>PROVINSI</span>
                </th>

                {/* 10. EDIT (HEADER KOLOM AKSI RESMI STANDAR SIPJAKI) */}
                <th className="py-3.5 px-3 text-center min-w-[110px]">
                  EDIT
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-14 text-center text-slate-500">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto text-primary mb-2.5" />
                    <span className="font-semibold text-xs">Memuat daftar kegiatan pelatihan SIPJAKI...</span>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-14 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <GraduationCap className="w-9 h-9 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-800 text-sm">Tidak ada data pelatihan ditemukan</p>
                      <p className="text-xs text-slate-400">
                        Coba sesuaikan kata kunci pencarian atau ubah filter tahun / metode.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => {
                  const isSelected = selectedIds.has(row.id);
                  return (
                    <tr 
                      key={row.id} 
                      className={`transition-colors ${isSelected ? "bg-blue-50/60" : "hover:bg-slate-50/70"}`}
                    >
                      {/* 1. Checkbox */}
                      <td className="py-3.5 px-3 text-center border-r border-slate-100">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                        />
                      </td>

                      {/* 2. TAHUN */}
                      <td className="py-3.5 px-3 text-center font-bold text-slate-800 border-r border-slate-100">
                        <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {row.tahun}
                        </span>
                      </td>

                      {/* 3. NAMA KEGIATAN PELATIHAN */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 border-r border-slate-100">
                        <div className="text-xs font-extrabold text-slate-900 leading-snug">
                          {row.nama_kegiatan}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {row.skk_jenjang && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md">
                              <Award className="w-3 h-3 text-blue-600" />
                              <span>{row.skk_jenjang}</span>
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-semibold">•</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            (row.status || "").includes("Selesai") 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {row.status}
                          </span>
                        </div>
                      </td>

                      {/* 4. METODE */}
                      <td className="py-3.5 px-3 text-center border-r border-slate-100">
                        {renderMethodBadge(row.metode)}
                      </td>

                      {/* 5. LOKASI */}
                      <td className="py-3.5 px-3 text-slate-700 border-r border-slate-100">
                        <div className="flex items-start gap-1.5 text-xs font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{row.lokasi}</span>
                        </div>
                      </td>

                      {/* 6. L */}
                      <td className="py-3.5 px-2.5 text-center font-extrabold text-blue-700 border-r border-slate-100">
                        {row.jumlah_l}
                      </td>

                      {/* 7. P */}
                      <td className="py-3.5 px-2.5 text-center font-extrabold text-rose-600 border-r border-slate-100">
                        {row.jumlah_p}
                      </td>

                      {/* 8. KABUPATEN/KOTA */}
                      <td className="py-3.5 px-3 text-xs font-semibold text-slate-800 border-r border-slate-100 whitespace-nowrap">
                        {row.kab_kota}
                      </td>

                      {/* 9. PROVINSI */}
                      <td className="py-3.5 px-3 text-xs font-semibold text-slate-600 border-r border-slate-100 whitespace-nowrap">
                        {row.propinsi}
                      </td>

                      {/* 10. EDIT (KOLOM AKSI DENGAN FITUR EDIT DAN HAPUS) */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          {/* Tombol Edit (Kuning/Amber Rounded Button) */}
                          <button
                            onClick={() => handleOpenEdit(row)}
                            title="Edit Kegiatan Pelatihan"
                            className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Tombol Hapus (Merah/Rose Rounded Button) */}
                          <button
                            onClick={() => handleOpenDelete(row)}
                            title="Hapus Kegiatan Pelatihan"
                            className="w-7 h-7 rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Tombol Detail (Abu-abu Rounded Button) */}
                          <button
                            onClick={() => handleOpenDetail(row)}
                            title="Lihat Detail Rincian Kegiatan"
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
            <span className="font-bold text-slate-800">{sortedData.length}</span> kegiatan pelatihan
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
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
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT KEGIATAN PELATIHAN (CLEAN SEAMLESS MODERN DIALOG)          */}
      {/* ========================================================================= */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-2xl max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            
            {/* Header Bersih */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-white px-7 py-5 sticky top-0 z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 shadow-2xs">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                      Ubah Data Kegiatan Pelatihan
                    </h3>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      TA {formTahun}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    ID: {selectedItem.id} • Standar SIPJAKI Kementerian PUPR
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="m-0">
              <div className="p-7 space-y-4">
                
                {/* Row 1: Tahun & Metode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tahun Anggaran <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formTahun}
                      onChange={(e) => setFormTahun(e.target.value)}
                      className="w-full text-xs font-bold px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50 hover:bg-white text-slate-800 transition-colors shadow-2xs"
                      required
                    >
                      <option value="2026">TA 2026</option>
                      <option value="2025">TA 2025</option>
                      <option value="2024">TA 2024</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Metode Pelaksanaan <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formMetode}
                      onChange={(e) => setFormMetode(e.target.value)}
                      className="w-full text-xs font-bold px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50 hover:bg-white text-slate-800 transition-colors shadow-2xs"
                      required
                    >
                      {METODE_PELATIHAN_LIST.map((met) => (
                        <option key={met} value={met}>{met}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Nama Kegiatan Pelatihan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Kegiatan Pelatihan & Sertifikasi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formNamaKegiatan}
                    onChange={(e) => setFormNamaKegiatan(e.target.value)}
                    placeholder="Contoh: Bimtek Petugas K3 Konstruksi & Penerapan SMKK..."
                    className="w-full text-xs font-semibold px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 bg-white shadow-2xs"
                  />
                </div>

                {/* Row 3: Lokasi Pelaksanaan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Lokasi Pelaksanaan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formLokasi}
                    onChange={(e) => setFormLokasi(e.target.value)}
                    placeholder="Contoh: Pusdiklat DPU Cibinong / Online LMS SIPJAKI..."
                    className="w-full text-xs font-medium px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 bg-white shadow-2xs"
                  />
                </div>

                {/* Row 4: Rincian Peserta Gender PUG */}
                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-3">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Rincian Peserta Berdasarkan Gender (PUG)
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-blue-700 mb-1">
                        Laki-laki (L) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formJumlahL}
                        onChange={(e) => setFormJumlahL(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full text-xs font-extrabold px-3 py-2 border border-slate-300 rounded-xl text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-rose-600 mb-1">
                        Perempuan (P) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formJumlahP}
                        onChange={(e) => setFormJumlahP(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full text-xs font-extrabold px-3 py-2 border border-slate-300 rounded-xl text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Total Peserta
                      </label>
                      <div className="w-full text-xs font-black px-3 py-2 border border-slate-200 rounded-xl bg-slate-100 text-slate-800 text-center select-none">
                        {(Number(formJumlahL) || 0) + (Number(formJumlahP) || 0)} Orang
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 5: Jenjang SKK & Status Pelaksanaan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Jenjang SKK Target
                    </label>
                    <select
                      value={formSkkJenjang}
                      onChange={(e) => setFormSkkJenjang(e.target.value)}
                      className="w-full text-xs font-bold px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50 hover:bg-white text-slate-800 transition-colors shadow-2xs"
                    >
                      <option value="Jenjang 1 (Operator Pemula)">Jenjang 1 (Operator Pemula)</option>
                      <option value="Jenjang 2 (Tukang Terampil)">Jenjang 2 (Tukang Terampil)</option>
                      <option value="Jenjang 3 (Pelaksana K3)">Jenjang 3 (Pelaksana K3)</option>
                      <option value="Jenjang 4 (Mandor/Teknisi)">Jenjang 4 (Mandor/Teknisi)</option>
                      <option value="Jenjang 5 (Teknisi/Analis)">Jenjang 5 (Teknisi/Analis)</option>
                      <option value="Jenjang 6 (Ahli Muda)">Jenjang 6 (Ahli Muda)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Status Pelaksanaan
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full text-xs font-bold px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50 hover:bg-white text-slate-800 transition-colors shadow-2xs"
                    >
                      <option value="Selesai & Tersertifikasi">Selesai & Tersertifikasi</option>
                      <option value="Sedang Berjalan">Sedang Berjalan</option>
                      <option value="Terjadwal">Terjadwal</option>
                    </select>
                  </div>
                </div>

                {/* Row 6: Keterangan / Catatan Tambahan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Keterangan / Catatan Tambahan
                  </label>
                  <textarea
                    rows={2}
                    value={formKeterangan}
                    onChange={(e) => setFormKeterangan(e.target.value)}
                    placeholder="Catatan teknis, durasi pelaksanaan, atau cakupan sertifikasi..."
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 leading-relaxed bg-white shadow-2xs"
                  />
                </div>
              </div>

              {/* Modal Action Footer */}
              <div className="border-t border-slate-100 bg-slate-50/80 px-7 py-4.5 flex items-center justify-between shrink-0 sticky bottom-0">
                <span className="text-[11px] text-slate-400 font-medium">
                  Sinkronisasi otomatis standar SIPJAKI
                </span>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ backgroundColor: "#0F2E5C" }}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-xs cursor-pointer disabled:opacity-50"
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
      {/* MODAL 2: TAMBAH KEGIATAN PELATIHAN BARU (+ TAMBAH PELATIHAN)              */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-2xl max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 bg-white px-7 py-5 sticky top-0 z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shadow-2xs">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                    Tambah Kegiatan Pelatihan Baru
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Pencatatan agenda pembinaan & fasilitasi sertifikasi TKK standar SIPJAKI
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

            <form onSubmit={handleAddSubmit} className="m-0">
              <div className="p-7 space-y-4">
                
                {/* Row 1: Tahun & Metode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tahun Anggaran <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formTahun}
                      onChange={(e) => setFormTahun(e.target.value)}
                      className="w-full text-xs font-bold px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50 hover:bg-white text-slate-800 transition-colors shadow-2xs"
                      required
                    >
                      <option value="2026">TA 2026</option>
                      <option value="2025">TA 2025</option>
                      <option value="2024">TA 2024</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Metode Pelaksanaan <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formMetode}
                      onChange={(e) => setFormMetode(e.target.value)}
                      className="w-full text-xs font-bold px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50 hover:bg-white text-slate-800 transition-colors shadow-2xs"
                      required
                    >
                      {METODE_PELATIHAN_LIST.map((met) => (
                        <option key={met} value={met}>{met}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Nama Kegiatan Pelatihan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Kegiatan Pelatihan & Sertifikasi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formNamaKegiatan}
                    onChange={(e) => setFormNamaKegiatan(e.target.value)}
                    placeholder="Contoh: Distance Learning: Pelatihan Building Information Modelling (BIM)..."
                    className="w-full text-xs font-semibold px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 bg-white shadow-2xs"
                  />
                </div>

                {/* Row 3: Lokasi Pelaksanaan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Lokasi Pelaksanaan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formLokasi}
                    onChange={(e) => setFormLokasi(e.target.value)}
                    placeholder="Contoh: Online LMS SIPJAKI & Lab Komputer DPU / Cibinong..."
                    className="w-full text-xs font-medium px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 bg-white shadow-2xs"
                  />
                </div>

                {/* Row 4: Rincian Peserta Gender PUG */}
                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-3">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Rincian Peserta Berdasarkan Gender (PUG)
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-blue-700 mb-1">
                        Laki-laki (L) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formJumlahL}
                        onChange={(e) => setFormJumlahL(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full text-xs font-extrabold px-3 py-2 border border-slate-300 rounded-xl text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-rose-600 mb-1">
                        Perempuan (P) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formJumlahP}
                        onChange={(e) => setFormJumlahP(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full text-xs font-extrabold px-3 py-2 border border-slate-300 rounded-xl text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Total Peserta
                      </label>
                      <div className="w-full text-xs font-black px-3 py-2 border border-slate-200 rounded-xl bg-slate-100 text-slate-800 text-center select-none">
                        {(Number(formJumlahL) || 0) + (Number(formJumlahP) || 0)} Orang
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 5: Jenjang SKK & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Jenjang SKK Target
                    </label>
                    <select
                      value={formSkkJenjang}
                      onChange={(e) => setFormSkkJenjang(e.target.value)}
                      className="w-full text-xs font-bold px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50 hover:bg-white text-slate-800 transition-colors shadow-2xs"
                    >
                      <option value="Jenjang 1 (Operator Pemula)">Jenjang 1 (Operator Pemula)</option>
                      <option value="Jenjang 2 (Tukang Terampil)">Jenjang 2 (Tukang Terampil)</option>
                      <option value="Jenjang 3 (Pelaksana K3)">Jenjang 3 (Pelaksana K3)</option>
                      <option value="Jenjang 4 (Mandor/Teknisi)">Jenjang 4 (Mandor/Teknisi)</option>
                      <option value="Jenjang 5 (Teknisi/Analis)">Jenjang 5 (Teknisi/Analis)</option>
                      <option value="Jenjang 6 (Ahli Muda)">Jenjang 6 (Ahli Muda)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Status Pelaksanaan
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full text-xs font-bold px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50 hover:bg-white text-slate-800 transition-colors shadow-2xs"
                    >
                      <option value="Selesai & Tersertifikasi">Selesai & Tersertifikasi</option>
                      <option value="Sedang Berjalan">Sedang Berjalan</option>
                      <option value="Terjadwal">Terjadwal</option>
                    </select>
                  </div>
                </div>

                {/* Row 6: Catatan Tambahan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Keterangan / Catatan Tambahan
                  </label>
                  <textarea
                    rows={2}
                    value={formKeterangan}
                    onChange={(e) => setFormKeterangan(e.target.value)}
                    placeholder="Catatan pelaksanaan, durasi hari, atau materi uji kompetensi..."
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 leading-relaxed bg-white shadow-2xs"
                  />
                </div>
              </div>

              {/* Modal Action Footer */}
              <div className="border-t border-slate-100 bg-slate-50/80 px-7 py-4.5 flex items-center justify-between shrink-0 sticky bottom-0">
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
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? "Menyimpan..." : "Simpan Kegiatan"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DIALOG KONFIRMASI HAPUS (SAFETY CONFIRMATION DIALOG)             */}
      {/* ========================================================================= */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-[420px] text-center p-7 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200 shadow-2xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-base font-black text-slate-900 mb-1.5">
              Hapus Kegiatan Pelatihan?
            </h3>
            
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus kegiatan <strong className="text-slate-800 font-bold">"{selectedItem.nama_kegiatan}"</strong> (TA {selectedItem.tahun})? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Menghapus..." : "Hapus Permanen"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DIALOG KONFIRMASI HAPUS MASSAL                                   */}
      {/* ========================================================================= */}
      {showBulkDeleteModal && selectedIds.size > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-[420px] text-center p-7 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200 shadow-2xs">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-base font-black text-slate-900 mb-1.5">
              Hapus {selectedIds.size} Kegiatan Terpilih?
            </h3>
            
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Seluruh data kegiatan pelatihan yang dicentang akan dihapus secara permanen dari basis data SIPJAKI.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmBulkDelete}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Menghapus..." : `Hapus ${selectedIds.size} Baris`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: DETAIL RINCIAN KEGIATAN PELATIHAN (MATA)                         */}
      {/* ========================================================================= */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Detail Kegiatan Pelatihan</h3>
                  <p className="text-xs text-slate-400 font-medium">ID: {selectedItem.id} • TA {selectedItem.tahun}</p>
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
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    TA {selectedItem.tahun}
                  </span>
                  {renderMethodBadge(selectedItem.metode)}
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {selectedItem.status}
                  </span>
                </div>
                <h4 className="text-base font-black text-slate-900 leading-snug">
                  {selectedItem.nama_kegiatan}
                </h4>
              </div>

              {/* Rincian Kotak Data */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Lokasi Pelaksanaan:</span>
                  <span className="font-bold text-slate-800 text-right">{selectedItem.lokasi}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Daerah / Wilayah:</span>
                  <span className="font-bold text-slate-800">{selectedItem.kab_kota}, {selectedItem.propinsi}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Jenjang SKK:</span>
                  <span className="font-extrabold text-blue-700">{selectedItem.skk_jenjang || "-"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Penyelenggara:</span>
                  <span className="font-semibold text-slate-700">{selectedItem.penyelenggara || "Dinas PUPR Kab. Bogor"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Rincian Gender (PUG):</span>
                  <span className="font-black text-slate-900">
                    👨 {selectedItem.jumlah_l} Laki-laki • 👩 {selectedItem.jumlah_p} Perempuan (Total: {(Number(selectedItem.jumlah_l) || 0) + (Number(selectedItem.jumlah_p) || 0)} Peserta)
                  </span>
                </div>
              </div>

              {selectedItem.keterangan && (
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-600 leading-relaxed">
                  <strong className="block mb-0.5 text-slate-800 font-bold">Catatan Keterangan:</strong>
                  {selectedItem.keterangan}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 px-6 bg-slate-50/70 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">SIPJAKI Kab. Bogor</span>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors cursor-pointer"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: BATCH IMPORT EXCEL                                               */}
      {/* ========================================================================= */}
      {showImportModal && (
        <BatchImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          title="Import Data Pelatihan SIPJAKI (Excel / CSV)"
          expectedColumns={IMPORT_COLUMNS_PELATIHAN}
          onCommit={handleImportCommit}
        />
      )}
    </div>
  );
}

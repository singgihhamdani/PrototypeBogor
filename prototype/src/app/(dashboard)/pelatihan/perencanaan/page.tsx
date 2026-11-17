"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Award, Plus, FileText, CheckCircle2, 
  Calendar, Search, Users, ShieldCheck, Trash2, Eye, 
  RotateCcw, Filter, ChevronLeft, ChevronRight, ExternalLink,
  Edit3, Clock, Database as DbIcon, Loader2, X,
  ArrowUpDown, ArrowUp, ArrowDown, FileSpreadsheet, MapPin, Building2,
  Sparkles, Check, AlertTriangle, Layers, Download, Upload, Copy, Share2,
  Send, UserCheck, UserX, AlertCircle, FileCheck
} from "lucide-react";
import { 
  fetchPerencanaanPelatihanSipjakiList, createPerencanaanPelatihanSipjaki, 
  updatePerencanaanPelatihanSipjaki, deletePerencanaanPelatihanSipjaki,
  PerencanaanPelatihanSipjakiItem, PerencanaanPelatihanSipjakiInsert,
  DataSourceStatus
} from "@/lib/services/pelatihan-service";
import {
  fetchPesertaList, createPeserta, updatePesertaDokumen,
  PesertaItem, evaluateSyaratKelengkapan, generateIdTkk
} from "@/lib/services/peserta-service";

export default function PerencanaanPelatihanPage() {
  const currentYearStr = "2026";

  // Data Perencanaan state
  const [perencanaanList, setPerencanaanList] = useState<PerencanaanPelatihanSipjakiItem[]>([]);
  const [pesertaList, setPesertaList] = useState<PesertaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState<DataSourceStatus>({
    source: "fallback",
    message: "Memuat data perencanaan..."
  });

  // Filter & Search state (Single-Row Action Bar)
  const [filterTahun, setFilterTahun] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sorting state (Default: Riwayat Terkini DESC)
  const [sortBy, setSortBy] = useState<"terkini" | "terlama" | "target_terbesar">("terkini");
  const [sortField, setSortField] = useState<keyof PerencanaanPelatihanSipjakiItem>("updated_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPesertaModal, setShowPesertaModal] = useState(false);
  const [showUploadSyaratModal, setShowUploadSyaratModal] = useState(false);
  const [showShareFormModal, setShowShareFormModal] = useState(false);

  // Selected State
  const [selectedItem, setSelectedItem] = useState<PerencanaanPelatihanSipjakiItem | null>(null);
  const [selectedPeserta, setSelectedPeserta] = useState<PesertaItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Perencanaan Form State
  const [formTahun, setFormTahun] = useState("2026");
  const [formPropinsi, setFormPropinsi] = useState("JAWA BARAT");
  const [formKabKota, setFormKabKota] = useState("KABUPATEN BOGOR");
  const [formTargetPelaksanaan, setFormTargetPelaksanaan] = useState<number>(3);
  const [formSatuanTarget, setFormSatuanTarget] = useState("Pelaksanaan");
  const [formDokumen, setFormDokumen] = useState("KAK_Rencana_Pelatihan_TKK_Kab_Bogor_2026.pdf");
  const [formAnggaran, setFormAnggaran] = useState<string>("450000000");
  const [formUraian, setFormUraian] = useState("");
  const [formCatatan, setFormCatatan] = useState("");

  // Peserta Internal Form State (Skema Internal)
  const [pesertaTab, setPesertaTab] = useState<"daftar" | "tambah_internal" | "share_form">("daftar");
  const [inputNik, setInputNik] = useState("");
  const [inputNama, setInputNama] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputTelepon, setInputTelepon] = useState("");
  const [inputPendidikan, setInputPendidikan] = useState("D3 Teknik Sipil");
  const [inputBujk, setInputBujk] = useState("PT Bangun Jaya Konstruksi");
  const [inputKtpUrl, setInputKtpUrl] = useState("KTP_Peserta.pdf");
  const [inputIjazahUrl, setInputIjazahUrl] = useState("Ijazah_Peserta.pdf");
  const [inputFotoUrl, setInputFotoUrl] = useState("Foto_3x4.jpg");
  const [inputSuratTugasUrl, setInputSuratTugasUrl] = useState("Surat_Tugas.pdf");

  // Upload Syarat Form State
  const [uploadKtp, setUploadKtp] = useState("");
  const [uploadIjazah, setUploadIjazah] = useState("");
  const [uploadFoto, setUploadFoto] = useState("");
  const [uploadSuratTugas, setUploadSuratTugas] = useState("");

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
      const resPrc = await fetchPerencanaanPelatihanSipjakiList();
      setPerencanaanList(resPrc.data);
      setDataStatus(resPrc.status);

      const resPst = await fetchPesertaList();
      setPesertaList(resPst.data);
    } catch (err) {
      console.error("Gagal memuat data perencanaan atau peserta:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Data
  const filteredData = useMemo(() => {
    return perencanaanList.filter(item => {
      // Filter Tahun
      if (filterTahun !== "Semua" && item.tahun !== filterTahun) {
        return false;
      }
      // Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchWilayah = (item.wilayah || "").toLowerCase().includes(q);
        const matchKab = (item.kab_kota || "").toLowerCase().includes(q);
        const matchProv = (item.propinsi || "").toLowerCase().includes(q);
        const matchTahun = (item.tahun || "").toLowerCase().includes(q);
        const matchTarget = String(item.target_pelaksanaan).includes(q);
        const matchDoc = (item.dokumen_url || item.dokumen_kak_url || "").toLowerCase().includes(q);
        const matchUraian = (item.uraian_rencana || "").toLowerCase().includes(q);
        if (!matchWilayah && !matchKab && !matchProv && !matchTahun && !matchTarget && !matchDoc && !matchUraian) {
          return false;
        }
      }
      return true;
    });
  }, [perencanaanList, filterTahun, searchQuery]);

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

    if (sortBy === "target_terbesar") {
      list.sort((a, b) => (Number(b.target_pelaksanaan) || 0) - (Number(a.target_pelaksanaan) || 0));
      return list;
    }

    return list;
  }, [filteredData, sortBy]);

  // Paginated Data
  const totalEntries = sortedData.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Ringkasan Statistik
  const stats = useMemo(() => {
    const activePerencanaan = perencanaanList.filter(item => item.tahun === currentYearStr);
    const pool = activePerencanaan.length > 0 ? activePerencanaan : perencanaanList;

    const totalUsulan = pool.length;
    const totalTarget = pool.reduce((acc, curr) => acc + (Number(curr.target_pelaksanaan) || 0), 0);
    const totalPeserta = pesertaList.length;
    const pesertaLengkap = pesertaList.filter(p => p.status_kelengkapan === "Lengkap").length;
    const pesertaBelum = totalPeserta - pesertaLengkap;

    return { totalUsulan, totalTarget, totalPeserta, pesertaLengkap, pesertaBelum };
  }, [perencanaanList, pesertaList, currentYearStr]);

  // Sorting Column Handler
  const handleSort = (field: keyof PerencanaanPelatihanSipjakiItem) => {
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

  // Open Add Perencanaan Modal
  const handleOpenAdd = () => {
    setFormTahun("2026");
    setFormPropinsi("JAWA BARAT");
    setFormKabKota("KABUPATEN BOGOR");
    setFormTargetPelaksanaan(3);
    setFormSatuanTarget("Pelaksanaan");
    setFormDokumen("KAK_Rencana_Pelatihan_TKK_Kab_Bogor_2026.pdf");
    setFormAnggaran("450000000");
    setFormUraian("");
    setFormCatatan("");
    setShowAddModal(true);
  };

  // Open Edit Perencanaan Modal
  const handleOpenEdit = (item: PerencanaanPelatihanSipjakiItem) => {
    setSelectedItem(item);
    setFormTahun(item.tahun || "2026");
    setFormPropinsi(item.propinsi || "JAWA BARAT");
    setFormKabKota(item.kab_kota || "KABUPATEN BOGOR");
    setFormTargetPelaksanaan(item.target_pelaksanaan || 3);
    setFormSatuanTarget(item.satuan_target || "Pelaksanaan");
    setFormDokumen(item.dokumen_url || item.dokumen_kak_url || "KAK_Rencana_Pelatihan.pdf");
    setFormAnggaran(String(item.anggaran_estimasi || "450000000"));
    setFormUraian(item.uraian_rencana || "");
    setFormCatatan(item.catatan_verifikasi || "");
    setShowEditModal(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (item: PerencanaanPelatihanSipjakiItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  // Open Document Modal
  const handleOpenDoc = (item: PerencanaanPelatihanSipjakiItem) => {
    setSelectedItem(item);
    setShowDocModal(true);
  };

  // Open Detail Modal
  const handleOpenDetail = (item: PerencanaanPelatihanSipjakiItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  // Open Peserta Management Modal
  const handleOpenPeserta = (item: PerencanaanPelatihanSipjakiItem) => {
    setSelectedItem(item);
    setPesertaTab("daftar");
    setShowPesertaModal(true);
  };

  // Submit Add Perencanaan
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const generatedId = `PRC-PEL-${formTahun}-${Date.now().toString().slice(-4)}`;
      const payload: PerencanaanPelatihanSipjakiInsert = {
        id: generatedId,
        tahun: formTahun,
        wilayah: `${formPropinsi}, ${formKabKota}`,
        kab_kota: formKabKota,
        propinsi: formPropinsi,
        target_pelaksanaan: Number(formTargetPelaksanaan) || 1,
        satuan_target: formSatuanTarget,
        dokumen_url: formDokumen,
        dokumen_kak_url: formDokumen,
        anggaran_estimasi: Number(formAnggaran) || 0,
        uraian_rencana: formUraian,
        catatan_verifikasi: formCatatan
      };

      const res = await createPerencanaanPelatihanSipjaki(payload);
      if (res.success && res.data) {
        setPerencanaanList(prev => [res.data!, ...prev]);
        setShowAddModal(false);
        triggerNotice(`Usulan rencana TA ${formTahun} (${formTargetPelaksanaan} Paket) berhasil ditambahkan.`);
      } else {
        alert("Gagal menambahkan usulan: " + (res.error || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      alert("Kesalahan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Perencanaan
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      const updates: Partial<PerencanaanPelatihanSipjakiItem> = {
        tahun: formTahun,
        wilayah: `${formPropinsi}, ${formKabKota}`,
        kab_kota: formKabKota,
        propinsi: formPropinsi,
        target_pelaksanaan: Number(formTargetPelaksanaan) || 1,
        satuan_target: formSatuanTarget,
        dokumen_url: formDokumen,
        dokumen_kak_url: formDokumen,
        anggaran_estimasi: Number(formAnggaran) || 0,
        uraian_rencana: formUraian,
        catatan_verifikasi: formCatatan
      };

      const res = await updatePerencanaanPelatihanSipjaki(selectedItem.id, updates);
      if (res.success) {
        setPerencanaanList(prev => prev.map(item => item.id === selectedItem.id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item));
        setShowEditModal(false);
        triggerNotice(`Data usulan rencana TA ${formTahun} berhasil diperbarui.`);
      } else {
        alert("Gagal memperbarui usulan: " + (res.error || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      alert("Kesalahan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete Perencanaan
  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      const res = await deletePerencanaanPelatihanSipjaki(selectedItem.id);
      if (res.success) {
        setPerencanaanList(prev => prev.filter(item => item.id !== selectedItem.id));
        setShowDeleteModal(false);
        triggerNotice(`Data usulan rencana berhasil dihapus.`);
      } else {
        alert("Gagal menghapus usulan: " + (res.error || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      alert("Kesalahan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Tambah Peserta Skema Internal
  const handleAddPesertaInternal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNik.trim() || !inputNama.trim()) {
      alert("Mohon masukkan NIK dan Nama Lengkap peserta.");
      return;
    }

    if (inputNik.length !== 16) {
      alert("NIK harus terdiri dari tepat 16 digit angka.");
      return;
    }

    setIsSubmitting(true);
    try {
      const nextSeq = pesertaList.length + 1;
      const newIdTkk = generateIdTkk(nextSeq, Number(formTahun) || 2026);
      const generatedId = `PST-${formTahun}-${nextSeq.toString().padStart(4, "0")}`;

      const evalRes = evaluateSyaratKelengkapan({
        ktp_url: inputKtpUrl,
        ijazah_url: inputIjazahUrl,
        foto_url: inputFotoUrl
      });

      const newPeserta: PesertaItem = {
        id: generatedId,
        id_tkk: newIdTkk,
        perencanaan_id: selectedItem?.id || "PRC-PEL-2026-001",
        nik: inputNik.trim(),
        nama_lengkap: inputNama.trim(),
        email: inputEmail.trim() || `${inputNik}@tkk.bogor.go.id`,
        telepon: inputTelepon.trim() || "081234567890",
        pendidikan_terakhir: inputPendidikan,
        riwayat_pekerjaan: "Dialokasikan via Skema Internal Dinas",
        skema_pendaftaran: "Internal (Batch)",
        asal_instansi_bujk: inputBujk.trim() || "Dinas PUPR Kab. Bogor",
        ktp_url: inputKtpUrl || null,
        ijazah_url: inputIjazahUrl || null,
        foto_url: inputFotoUrl || null,
        surat_tugas_url: inputSuratTugasUrl || null,
        status_kelengkapan: evalRes.status,
        kelengkapan_rincian: evalRes.status === "Lengkap" 
          ? "Seluruh berkas persyaratan wajib (KTP, Ijazah, Foto) telah lengkap."
          : `Persyaratan belum lengkap (${evalRes.missingItems.join(", ")} belum ada).`,
        link_form_token: `token-form-${newIdTkk.toLowerCase()}`,
        memiliki_sertifikat_lpjk: false,
        nomor_registrasi_lpjk: null,
        dokumen_scan_lpjk_url: null,
        is_first_login: false,
        status_verifikasi: "Terverifikasi",
        catatan_admin: "Peserta didaftarkan langsung oleh Administrator Dinas (Skema Internal)",
        riwayat: []
      };

      const res = await createPeserta(newPeserta);
      if (res.success && res.data) {
        setPesertaList(prev => [res.data!, ...prev]);
        setPesertaTab("daftar");
        triggerNotice(`Peserta ${inputNama} berhasil didaftarkan dengan ID Resmi: ${newIdTkk}`);
        // Reset form
        setInputNik("");
        setInputNama("");
        setInputEmail("");
        setInputTelepon("");
      } else {
        alert("Gagal mendaftarkan peserta: " + (res.error || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      alert("Kesalahan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Upload Syarat Modal
  const handleOpenUploadSyarat = (peserta: PesertaItem) => {
    setSelectedPeserta(peserta);
    setUploadKtp(peserta.ktp_url || "");
    setUploadIjazah(peserta.ijazah_url || "");
    setUploadFoto(peserta.foto_url || "");
    setUploadSuratTugas(peserta.surat_tugas_url || "");
    setShowUploadSyaratModal(true);
  };

  // Submit Upload Syarat
  const handleSaveUploadSyarat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeserta) return;

    setIsSubmitting(true);
    try {
      const res = await updatePesertaDokumen(selectedPeserta.id, {
        ktp_url: uploadKtp.trim() || undefined,
        ijazah_url: uploadIjazah.trim() || undefined,
        foto_url: uploadFoto.trim() || undefined,
        surat_tugas_url: uploadSuratTugas.trim() || undefined
      });

      if (res.success && res.data) {
        setPesertaList(prev => prev.map(p => p.id === selectedPeserta.id ? res.data! : p));
        setShowUploadSyaratModal(false);
        triggerNotice(`Berkas persyaratan peserta ${selectedPeserta.nama_lengkap} berhasil diperbarui.`);
      } else {
        alert("Gagal memperbarui berkas: " + (res.error || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      alert("Kesalahan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Share Form Modal
  const handleOpenShareForm = (peserta: PesertaItem) => {
    setSelectedPeserta(peserta);
    setShowShareFormModal(true);
  };

  // Copy Link Form
  const handleCopyFormLink = (peserta: PesertaItem) => {
    const link = `http://localhost:3000/portal/peserta?token=${peserta.link_form_token || peserta.id_tkk}`;
    navigator.clipboard.writeText(link);
    triggerNotice(`Tautan formulir untuk ${peserta.nama_lengkap} disalin ke clipboard!`);
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
            Perencanaan Pelatihan dan/atau Sertifikasi TKK
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pengajuan Usulan Rencana Kerja, Alokasi Target & Manajemen Berkas Standar SIPJAKI Kementerian PUPR
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

      {/* 2. Tiga Kartu Ringkasan Informasi (Sesuai Desain Acuan Asli SIPJAKI PUPR - Bersih & Rapi) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* KARTU 1: TOTAL USULAN RENCANA */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-[#0F2E5C] text-[#FFC000] flex items-center justify-center shrink-0 shadow-xs">
            <FileText className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 leading-none">
                {stats.totalUsulan}
              </span>
              <span className="text-xs text-slate-400 font-semibold">Usulan ({currentYearStr})</span>
            </div>
            <p className="text-[11px] font-extrabold tracking-wider text-slate-500 uppercase mt-1">
              TOTAL USULAN RENCANA
            </p>
          </div>
        </div>

        {/* KARTU 2: TOTAL TARGET PELAKSANAAN */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Award className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-600 leading-none">
                {stats.totalTarget}
              </span>
              <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                Paket Pelaksanaan
              </span>
            </div>
            <p className="text-[11px] font-extrabold tracking-wider text-slate-500 uppercase mt-1">
              TOTAL TARGET PELAKSANAAN
            </p>
          </div>
        </div>

        {/* KARTU 3: TOTAL PESERTA TERDAFTAR (INTERNAL & EKSTERNAL) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Users className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 leading-none">
                {stats.totalPeserta}
              </span>
              <span className="text-xs text-slate-400 font-semibold">Orang TKK</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {stats.pesertaLengkap} Lengkap
              </span>
              {stats.pesertaBelum > 0 && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  {stats.pesertaBelum} Belum
                </span>
              )}
            </div>
            <p className="text-[11px] font-extrabold tracking-wider text-slate-500 uppercase mt-1">
              TOTAL PESERTA TERDAFTAR
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
            <option value="target_terbesar">Target Terbesar</option>
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
              placeholder="Cari wilayah, target, berkas..."
              className="w-full text-xs pl-10 pr-3 py-1.5 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-slate-400 font-medium bg-slate-50 focus:bg-white transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. Tabel Perencanaan Pelatihan (Light Surface Style Sesuai Acuan Baku SIPJAKI PUPR - 7 Kolom Baku) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 uppercase font-extrabold tracking-wider text-[11px]">
                {/* 1. NO */}
                <th className="py-3.5 px-3 text-center w-12 border-r border-slate-200/80">
                  NO
                </th>
                {/* 2. WILAYAH & DAERAH */}
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
                {/* 3. TARGET PELAKSANAAN */}
                <th 
                  onClick={() => handleSort("target_pelaksanaan")}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 border-r border-slate-200/80 min-w-[140px] text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>TARGET PELAKSANAAN</span>
                    {sortField === "target_pelaksanaan" ? (
                      sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-primary" /> : <ArrowDown className="w-3.5 h-3.5 text-primary" />
                    ) : <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </th>
                {/* 4. TAHUN */}
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
                {/* 5. DOKUMEN (STANDAR SIPJAKI - MENGGANTIKAN DOKUMEN KAK) */}
                <th className="py-3.5 px-3 text-center border-r border-slate-200/80 min-w-[110px]">
                  DOKUMEN
                </th>
                {/* 6. PESERTA TKK (SKEMA INTERNAL & EKSTERNAL) */}
                <th className="py-3.5 px-3 text-center border-r border-slate-200/80 min-w-[160px]">
                  PESERTA TKK
                </th>
                {/* 7. EDIT (HEADER KOLOM AKSI DINAMAI "EDIT") */}
                <th className="py-3.5 px-3 text-center min-w-[110px]">
                  EDIT
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-500">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto text-primary mb-2.5" />
                    <span className="font-semibold text-xs">Memuat data perencanaan pelatihan SIPJAKI...</span>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <FileText className="w-9 h-9 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-800 text-sm">Tidak ada usulan perencanaan ditemukan</p>
                      <p className="text-xs text-slate-400">
                        Coba sesuaikan kata kunci pencarian atau ubah filter tahun anggaran.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => {
                  const rowNumber = (currentPage - 1) * pageSize + index + 1;
                  const docName = item.dokumen_url || item.dokumen_kak_url || "KAK_Rencana_Pelatihan.pdf";
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* 1. NO */}
                      <td className="py-4 px-3 text-center font-bold text-slate-400 border-r border-slate-100">
                        {rowNumber}
                      </td>

                      {/* 2. WILAYAH & DAERAH */}
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

                      {/* 3. TARGET PELAKSANAAN */}
                      <td className="py-4 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                          <Award className="w-3.5 h-3.5 text-blue-600" />
                          <span>{item.target_pelaksanaan} {item.satuan_target || "Pelaksanaan"}</span>
                        </div>
                      </td>

                      {/* 4. TAHUN */}
                      <td className="py-4 px-3 text-center font-bold text-slate-800 border-r border-slate-100">
                        <span className="font-mono text-xs">{item.tahun}</span>
                      </td>

                      {/* 5. DOKUMEN (STANDAR SIPJAKI) */}
                      <td className="py-4 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDoc(item)}
                          title={`Pratinjau Dokumen: ${docName}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-sky-600" />
                          <span>Lihat</span>
                        </button>
                      </td>

                      {/* 6. PESERTA TKK (INTERAKTIF MODAL PESERTA INTERNAL & EKSTERNAL) */}
                      <td className="py-4 px-3 text-center border-r border-slate-100">
                        <button
                          onClick={() => handleOpenPeserta(item)}
                          title="Kelola Peserta TKK (Skema Internal & Eksternal)"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer shadow-2xs group"
                        >
                          <Users className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                          <span>{pesertaList.length} Peserta</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {stats.pesertaLengkap} Lengkap
                          </span>
                        </button>
                      </td>

                      {/* 7. EDIT (TOMBOL AKSI KOMPAK SESUAI ACUAN RESMI SIPJAKI PUPR) */}
                      <td className="py-4 px-3 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          {/* Tombol Edit (Kuning/Amber Rounded Button) */}
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Data Usulan Perencanaan"
                            className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Tombol Hapus (Merah/Rose Rounded Button) */}
                          <button
                            onClick={() => handleOpenDelete(item)}
                            title="Hapus Data Usulan Perencanaan"
                            className="w-7 h-7 rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Tombol Rincian / Detail Opsional */}
                          <button
                            onClick={() => handleOpenDetail(item)}
                            title="Lihat Rincian Rencana Usulan"
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

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Menampilkan <span className="font-bold text-slate-800">{sortedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> sampai{" "}
            <span className="font-bold text-slate-800">{Math.min(currentPage * pageSize, sortedData.length)}</span> dari{" "}
            <span className="font-bold text-slate-800">{sortedData.length}</span> usulan rencana
          </div>
          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>
            <span className="px-3 py-1 bg-primary text-white font-bold rounded-md">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: KELOLA PESERTA TKK (SKEMA INTERNAL & EKSTERNAL)                  */}
      {/* ========================================================================= */}
      {showPesertaModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div 
              style={{ padding: "18px 24px" }}
              className="flex items-center justify-between border-b border-slate-200 bg-white shrink-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shadow-2xs">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                      Manajemen Peserta TKK — Perencanaan Pelatihan
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      TA {selectedItem.tahun}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {selectedItem.kab_kota} • Alokasi Target: {selectedItem.target_pelaksanaan} Paket Kegiatan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPesertaModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 pt-3 border-b border-slate-200 bg-slate-50/70 flex items-center gap-2 shrink-0">
              <button
                onClick={() => setPesertaTab("daftar")}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors border-b-2 flex items-center gap-2 ${
                  pesertaTab === "daftar"
                    ? "bg-white text-blue-700 border-blue-600 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 border-transparent"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Daftar Peserta Terdaftar ({pesertaList.length})</span>
              </button>

              <button
                onClick={() => setPesertaTab("tambah_internal")}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors border-b-2 flex items-center gap-2 ${
                  pesertaTab === "tambah_internal"
                    ? "bg-white text-blue-700 border-blue-600 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 border-transparent"
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Peserta (Skema Internal)</span>
              </button>

              <button
                onClick={() => setPesertaTab("share_form")}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors border-b-2 flex items-center gap-2 ${
                  pesertaTab === "share_form"
                    ? "bg-white text-blue-700 border-blue-600 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 border-transparent"
                }`}
              >
                <Share2 className="w-4 h-4" />
                <span>Link Form Mandiri (Skema Eksternal)</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* TAB 1: DAFTAR PESERTA & STATUS KELENGKAPAN */}
              {pesertaTab === "daftar" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-blue-50/60 p-3.5 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-blue-900 m-0">Verifikasi Dokumen Persyaratan Peserta</p>
                        <p className="text-[11px] text-blue-700 m-0">
                          Syarat wajib penerbitan ID TKK: KTP, Ijazah/Surat Pengalaman, dan Pas Foto Resmi 3x4.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full">
                        {stats.pesertaLengkap} Lengkap
                      </span>
                      {stats.pesertaBelum > 0 && (
                        <span className="text-xs font-black text-amber-700 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full">
                          {stats.pesertaBelum} Belum
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-50 text-slate-600 font-extrabold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3 text-center w-10">No</th>
                          <th className="py-2.5 px-3">ID TKK Resmi</th>
                          <th className="py-2.5 px-3">Nama & NIK</th>
                          <th className="py-2.5 px-3">Skema Pendaftaran</th>
                          <th className="py-2.5 px-3 text-center">Kelengkapan Syarat</th>
                          <th className="py-2.5 px-3 text-center min-w-[140px]">Aksi & Formulir</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pesertaList.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400">
                              Belum ada peserta TKK dialokasikan untuk perencanaan ini.
                            </td>
                          </tr>
                        ) : (
                          pesertaList.map((p, idx) => {
                            const isLengkap = p.status_kelengkapan === "Lengkap";
                            return (
                              <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-3 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                                <td className="py-3 px-3 font-mono font-extrabold text-blue-700">
                                  {p.id_tkk || generateIdTkk(idx + 1, 2026)}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-bold text-slate-900">{p.nama_lengkap}</div>
                                  <div className="font-mono text-[11px] text-slate-400">NIK: {p.nik}</div>
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    p.skema_pendaftaran?.includes("Internal")
                                      ? "bg-purple-50 text-purple-700 border border-purple-200"
                                      : "bg-sky-50 text-sky-700 border border-sky-200"
                                  }`}>
                                    {p.skema_pendaftaran || "Internal (Batch)"}
                                  </span>
                                  <div className="text-[10px] text-slate-400 truncate max-w-[150px] mt-0.5">
                                    {p.asal_instansi_bujk || "Dinas PUPR"}
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-center">
                                  {isLengkap ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Syarat Lengkap</span>
                                    </span>
                                  ) : (
                                    <span 
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200"
                                      title={p.kelengkapan_rincian || "Syarat belum lengkap"}
                                    >
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Belum Lengkap</span>
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <div className="inline-flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenUploadSyarat(p)}
                                      title="Upload / Perbarui Berkas Persyaratan"
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                                    >
                                      <Upload className="w-3 h-3 text-slate-500" />
                                      <span>Upload</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyFormLink(p)}
                                      title="Salin Tautan Form Pemenuhan Syarat Mandiri ke Peserta"
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] border border-blue-200 transition-colors"
                                    >
                                      <Copy className="w-3 h-3 text-blue-600" />
                                      <span>Kirim Form</span>
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
                </div>
              )}

              {/* TAB 2: TAMBAH PESERTA (SKEMA INTERNAL OLEH DINAS) */}
              {pesertaTab === "tambah_internal" && (
                <form onSubmit={handleAddPesertaInternal} className="space-y-4 max-w-2xl mx-auto">
                  <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-800">
                    <p className="font-bold m-0">Skema Internal (Pendaftaran Kolektif Dinas / BUJK):</p>
                    <p className="m-0 mt-0.5 text-[11px]">
                      Administrator menginput data peserta dan mengunggah dokumen persyaratan. Sistem akan menerbitkan ID TKK otomatis.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        NIK (16 Digit) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={16}
                        value={inputNik}
                        onChange={(e) => setInputNik(e.target.value.replace(/\D/g, ""))}
                        placeholder="Contoh: 3201011504940001"
                        className="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Lengkap Peserta <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={inputNama}
                        onChange={(e) => setInputNama(e.target.value)}
                        placeholder="Contoh: Ahmad Suryadi, ST"
                        className="w-full text-xs font-bold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
                      <input
                        type="text"
                        value={inputTelepon}
                        onChange={(e) => setInputTelepon(e.target.value)}
                        placeholder="Contoh: 081234567890"
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Pendidikan Terakhir</label>
                      <select
                        value={inputPendidikan}
                        onChange={(e) => setInputPendidikan(e.target.value)}
                        className="w-full text-xs font-bold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                      >
                        <option value="SMA/SMK Bangunan">SMA / SMK Bangunan / Sipil</option>
                        <option value="D3 Teknik Sipil">D3 Teknik Sipil / Arsitektur</option>
                        <option value="S1 Teknik Sipil">S1 Teknik Sipil / Manajemen Konstruksi</option>
                        <option value="SMP / Sederajat">SMP / Sederajat</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Asal BUJK / Instansi</label>
                    <input
                      type="text"
                      value={inputBujk}
                      onChange={(e) => setInputBujk(e.target.value)}
                      placeholder="Contoh: PT Bangun Jaya Konstruksi"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  {/* Dokumen Persyaratan Unggahan */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                      Unggah Dokumen Persyaratan (Standar TKK):
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">1. Scan KTP (PDF/JPG) *</label>
                        <input
                          type="text"
                          value={inputKtpUrl}
                          onChange={(e) => setInputKtpUrl(e.target.value)}
                          placeholder="KTP_Peserta.pdf"
                          className="w-full text-xs font-mono px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">2. Ijazah / SK Kerja (PDF) *</label>
                        <input
                          type="text"
                          value={inputIjazahUrl}
                          onChange={(e) => setInputIjazahUrl(e.target.value)}
                          placeholder="Ijazah_Peserta.pdf"
                          className="w-full text-xs font-mono px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">3. Pas Foto Resmi 3x4 (JPG) *</label>
                        <input
                          type="text"
                          value={inputFotoUrl}
                          onChange={(e) => setInputFotoUrl(e.target.value)}
                          placeholder="Foto_3x4.jpg"
                          className="w-full text-xs font-mono px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">4. Surat Tugas BUJK (Opsional)</label>
                        <input
                          type="text"
                          value={inputSuratTugasUrl}
                          onChange={(e) => setInputSuratTugasUrl(e.target.value)}
                          placeholder="Surat_Tugas.pdf"
                          className="w-full text-xs font-mono px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPesertaTab("daftar")}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{ backgroundColor: "#0F2E5C" }}
                      className="px-5 py-2 text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-amber-300" />
                      <span>Daftarkan & Terbitkan ID TKK</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: KIRIM LINK FORM MANDIRI (SKEMA EKSTERNAL) */}
              {pesertaTab === "share_form" && (
                <div className="space-y-4 max-w-2xl mx-auto py-2">
                  <div className="bg-sky-50 p-4 rounded-xl border border-sky-200 text-xs text-sky-800 space-y-1">
                    <p className="font-bold text-sm m-0">Skema Eksternal (Pendaftaran & Pelengkapan Mandiri Publik):</p>
                    <p className="m-0 text-slate-600 leading-relaxed">
                      Bagikan tautan formulir pendaftaran mandiri ini kepada calon peserta atau tenaga kerja konstruksi. Peserta akan mengisi data dasar serta mengunggah KTP, Ijazah, dan Foto secara mandiri dari HP atau komputer mereka untuk mendapatkan ID TKK Resmi.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                    <label className="block text-xs font-bold text-slate-700">
                      Tautan Portal Pendaftaran Peserta Mandiri (Publik):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value="http://localhost:3000/portal/peserta"
                        className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 text-slate-700 select-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("http://localhost:3000/portal/peserta");
                          triggerNotice("Tautan portal pendaftaran peserta mandiri disalin!");
                        }}
                        className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors shrink-0 flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Link</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                    <span className="font-bold text-slate-800 block">Alur Kerja Skema Eksternal:</span>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Calon peserta membuka tautan portal pendaftaran.</li>
                      <li>Mengisi NIK (16 digit), Nama, Kontak WhatsApp, dan Pilihan Jabatan Kerja.</li>
                      <li>Mengunggah berkas persyaratan (KTP, Ijazah, Pas Foto).</li>
                      <li>Setelah seluruh data lengkap, sistem langsung menerbitkan <strong>ID Peserta TKK Resmi</strong> dan Kartu Peserta Digital (e-KTA ber-QR Code).</li>
                      <li>Data peserta otomatis masuk ke pool usulan perencanaan Dinas ini dengan status <em>Syarat Lengkap</em>.</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div 
              style={{ padding: "14px 24px", backgroundColor: "#F8FAFC" }}
              className="border-t border-slate-200 flex items-center justify-between shrink-0"
            >
              <span className="text-[11px] text-slate-400 font-medium">
                Pilar 5: Pembinaan & Sertifikasi TKK Standar SIPJAKI PUPR
              </span>
              <button
                type="button"
                onClick={() => setShowPesertaModal(false)}
                className="px-4 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: UPLOAD DOKUMEN PERSYARATAN PESERTA                               */}
      {/* ========================================================================= */}
      {showUploadSyaratModal && selectedPeserta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-[540px] overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div 
              style={{ padding: "18px 24px" }}
              className="flex items-center justify-between border-b border-slate-100 bg-white shrink-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                    Unggah Berkas Persyaratan TKK
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {selectedPeserta.nama_lengkap} • ID: {selectedPeserta.id_tkk || "TKK-2026-0001"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadSyaratModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Upload */}
            <form onSubmit={handleSaveUploadSyarat} className="m-0">
              <div style={{ padding: "24px" }} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    1. File Scan KTP (Wajib) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={uploadKtp}
                    onChange={(e) => setUploadKtp(e.target.value)}
                    placeholder="Contoh: KTP_3201011504940001.pdf"
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    2. File Scan Ijazah / Surat Pengalaman Kerja (Wajib) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={uploadIjazah}
                    onChange={(e) => setUploadIjazah(e.target.value)}
                    placeholder="Contoh: Ijazah_SMK_Sipil.pdf"
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    3. Pas Foto Resmi 3x4 Latar Merah/Biru (Wajib) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={uploadFoto}
                    onChange={(e) => setUploadFoto(e.target.value)}
                    placeholder="Contoh: Foto_3x4_Ahmad.jpg"
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    4. Surat Tugas / Rekomendasi BUJK (Opsional)
                  </label>
                  <input
                    type="text"
                    value={uploadSuratTugas}
                    onChange={(e) => setUploadSuratTugas(e.target.value)}
                    placeholder="Contoh: Surat_Tugas_PT_Bangun_Jaya.pdf"
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Footer */}
              <div 
                style={{ padding: "16px 24px", backgroundColor: "#F8FAFC" }}
                className="border-t border-slate-200 flex items-center justify-end gap-2.5"
              >
                <button
                  type="button"
                  onClick={() => setShowUploadSyaratModal(false)}
                  className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Berkas Persyaratan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MODAL EDIT USULAN PERENCANAAN                                    */}
      {/* ========================================================================= */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-[580px] overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Header */}
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
                      Edit Usulan Perencanaan Pelatihan
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      TA {formTahun}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {formKabKota} • Standar SIPJAKI Kementerian PUPR
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="m-0">
              <div style={{ padding: "24px" }} className="space-y-4">
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
                      Target Pelaksanaan <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex rounded-xl border border-slate-300 focus-within:border-primary overflow-hidden bg-white">
                      <input
                        type="number"
                        min="1"
                        value={formTargetPelaksanaan}
                        onChange={(e) => setFormTargetPelaksanaan(Number(e.target.value))}
                        className="w-full text-xs font-bold px-3 py-2 text-slate-900 focus:outline-none"
                        required
                      />
                      <div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 border-l border-slate-200">
                        Paket
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Berkas Dokumen KAK / Perencanaan <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <FileText className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={formDokumen}
                      onChange={(e) => setFormDokumen(e.target.value)}
                      placeholder="Contoh: KAK_Rencana_Pelatihan_TKK_2026.pdf"
                      className="w-full text-xs font-mono pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimasi Anggaran (Rp)
                  </label>
                  <input
                    type="number"
                    value={formAnggaran}
                    onChange={(e) => setFormAnggaran(e.target.value)}
                    placeholder="Contoh: 450000000"
                    className="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Uraian Rencana Kerja
                  </label>
                  <textarea
                    rows={2}
                    value={formUraian}
                    onChange={(e) => setFormUraian(e.target.value)}
                    placeholder="Rincian paket rencana pelatihan vokasi dan uji sertifikasi..."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 bg-white"
                  />
                </div>
              </div>

              {/* Footer */}
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
                    className="rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors shadow-2xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ padding: "10px 22px", backgroundColor: "#0F2E5C" }}
                    className="inline-flex items-center gap-1.5 rounded-xl text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5 text-amber-300" />
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: MODAL TAMBAH USULAN PERENCANAAN                                  */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-[580px] overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div 
              style={{ padding: "18px 24px" }}
              className="flex items-center justify-between border-b border-slate-100 bg-white shrink-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-2xs">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                    Tambah Usulan Perencanaan Pelatihan
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Penyelenggaraan & Fasilitasi Sertifikasi TKK Kabupaten Bogor
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveAdd} className="m-0">
              <div style={{ padding: "24px" }} className="space-y-4">
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
                      Target Pelaksanaan <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex rounded-xl border border-slate-300 focus-within:border-primary overflow-hidden bg-white">
                      <input
                        type="number"
                        min="1"
                        value={formTargetPelaksanaan}
                        onChange={(e) => setFormTargetPelaksanaan(Number(e.target.value))}
                        className="w-full text-xs font-bold px-3 py-2 text-slate-900 focus:outline-none"
                        required
                      />
                      <div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 border-l border-slate-200">
                        Paket
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Berkas Dokumen KAK / Perencanaan <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <FileText className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={formDokumen}
                      onChange={(e) => setFormDokumen(e.target.value)}
                      placeholder="Contoh: KAK_Rencana_Pelatihan_TKK_2026.pdf"
                      className="w-full text-xs font-mono pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimasi Anggaran (Rp)
                  </label>
                  <input
                    type="number"
                    value={formAnggaran}
                    onChange={(e) => setFormAnggaran(e.target.value)}
                    placeholder="Contoh: 450000000"
                    className="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Uraian Rencana Kerja
                  </label>
                  <textarea
                    rows={2}
                    value={formUraian}
                    onChange={(e) => setFormUraian(e.target.value)}
                    placeholder="Rincian paket rencana pelatihan vokasi dan uji sertifikasi..."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 bg-white"
                  />
                </div>
              </div>

              {/* Footer */}
              <div 
                style={{ padding: "18px 24px", backgroundColor: "#F8FAFC" }}
                className="border-t border-slate-200 flex items-center justify-between shrink-0"
              >
                <span className="text-[11px] text-slate-400 font-medium">
                  Standar Usulan Resmi SIPJAKI
                </span>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{ padding: "10px 18px" }}
                    className="rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors shadow-2xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ padding: "10px 22px" }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambahkan Usulan</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: PRATINJAU DOKUMEN PERENCANAAN (DOKUMEN)                           */}
      {/* ========================================================================= */}
      {showDocModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-[500px] overflow-hidden animate-in zoom-in-95 duration-150">
            <div 
              style={{ padding: "18px 24px" }}
              className="flex items-center justify-between border-b border-slate-100 bg-white"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Dokumen Perencanaan Kegiatan</h3>
                  <p className="text-xs text-slate-400 font-medium">Kabupaten Bogor • TA {selectedItem.tahun}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDocModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Nama Berkas Kerangka Acuan Kerja (KAK):
                </span>
                <p className="text-xs font-mono font-bold text-slate-900 break-all m-0">
                  {selectedItem.dokumen_url || selectedItem.dokumen_kak_url || "KAK_Rencana_Pelatihan.pdf"}
                </p>
                <p className="text-[11px] text-slate-500 mt-2">
                  Target: {selectedItem.target_pelaksanaan} Paket Kegiatan • Estimasi Anggaran: Rp {Number(selectedItem.anggaran_estimasi || 0).toLocaleString("id-ID")}
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerNotice(`Membuka berkas dokumen: ${selectedItem.dokumen_url || selectedItem.dokumen_kak_url}`);
                    setShowDocModal(false);
                  }}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Dokumen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: DIALOG KONFIRMASI HAPUS PERENCANAAN (SAFETY DIALOG)              */}
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
              Hapus Data Usulan Rencana?
            </h3>
            
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus usulan perencanaan pelatihan TA <strong className="text-slate-800 font-bold">{selectedItem.tahun}</strong> ({selectedItem.target_pelaksanaan} Paket)? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                style={{ padding: "10px 20px" }}
                className="rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                style={{ padding: "10px 20px" }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Permanen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: RINCIAN USULAN PERENCANAAN DETAIL                                */}
      {/* ========================================================================= */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 px-6 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Rincian Rencana Kerja Pelatihan</h3>
                  <p className="text-xs text-slate-400 font-medium">Kabupaten Bogor • TA {selectedItem.tahun}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block mb-0.5">Target Pelaksanaan:</span>
                  <span className="font-extrabold text-slate-900 text-xs">{selectedItem.target_pelaksanaan} Paket Kegiatan</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block mb-0.5">Estimasi Anggaran:</span>
                  <span className="font-extrabold text-emerald-700 text-xs">Rp {Number(selectedItem.anggaran_estimasi || 0).toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Uraian Program & Rencana Kerja:
                </span>
                <p className="text-xs text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-200/60 leading-relaxed m-0">
                  {selectedItem.uraian_rencana || "Belum ada uraian rinci kegiatan."}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Catatan Verifikasi / Keterangan:
                </span>
                <p className="text-xs text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-200/60 leading-relaxed m-0">
                  {selectedItem.catatan_verifikasi || "Usulan rencana kerja dalam status siap verifikasi standar SIPJAKI."}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

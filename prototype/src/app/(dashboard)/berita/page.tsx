"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { 
  Newspaper, Calendar, Clock, ArrowRight, Search, Plus, 
  FileText, CheckCircle2, Eye, Trash2, Tag, BookOpen, 
  Send, Layers, User, Edit3, Upload, Image as ImageIcon,
  Download, ArrowUpDown, ArrowUp, ArrowDown, Bold, Italic,
  Underline as UnderlineIcon, Strikethrough, Heading2, Heading3,
  List, ListOrdered, Quote, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, Link2, Eraser, AlertTriangle, X, Check, FileDown,
  Scale, ShieldAlert, Sparkles, Filter, RotateCcw, ChevronRight
} from "lucide-react";
import newsData from "@/data/news.json";

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  author: string;
  summary: string;
  content?: string;
  readTime: string;
  featured?: boolean;
  tags: string[];
  status: "Terbit" | "Draf" | "Diarsipkan";
  thumbnailUrl?: string;
  pdfAttachmentUrl?: string;
  pdfAttachmentName?: string;
  pdfAttachmentSize?: string;
  updated_at?: string;
}

const initialNewsList: NewsItem[] = (newsData as any[]).map((n, i) => ({
  ...n,
  content: n.content || (n.summary + " Implementasi program ini terus dipantau oleh Tim Pembina Jasa Konstruksi Kabupaten Bogor secara berkala guna memastikan keselarasan dengan ketentuan PP No. 14/2021 dan Permen PUPR No. 1/2023."),
  status: n.status || (i === 0 || i === 1 ? "Terbit" : "Draf"),
  thumbnailUrl: n.thumbnailUrl || (i % 2 === 0 ? "/images/news/thumb-se-bupati-jakon.jpg" : "/images/news/thumb-perbup-sbk.jpg"),
  pdfAttachmentUrl: n.pdfAttachmentUrl || (i % 2 === 0 ? "SE_Bupati_Bogor_No_600_1_24_DPUPR_2026.pdf" : ""),
  pdfAttachmentName: n.pdfAttachmentName || (i % 2 === 0 ? "SE_Bupati_Bogor_No_600_1_24_DPUPR_2026.pdf" : ""),
  pdfAttachmentSize: n.pdfAttachmentSize || (i % 2 === 0 ? "2.8 MB" : ""),
  updated_at: n.updated_at || new Date(Date.now() - i * 86400000).toISOString()
}));

export default function BeritaPage() {
  const [newsList, setNewsList] = useState<NewsItem[]>(initialNewsList);
  const [activeTab, setActiveTab] = useState<"cms" | "portal">("cms"); // Default CMS untuk pengelolaan Data Kebijakan SIPJAKI
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [selectedStatus, setSelectedStatus] = useState<string>("Semua");

  // Sorting state (Default: Riwayat Aturan Terkini DESC)
  const [sortBy, setSortBy] = useState<"terkini" | "terlama" | "kategori" | "judul">("terkini");
  const [sortField, setSortField] = useState<keyof NewsItem>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Modals & Dialogs
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedNewsDetail, setSelectedNewsDetail] = useState<NewsItem | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<NewsItem | null>(null);

  // Toast feedback
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Form State for Tulis / Edit
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Pelaporan Pengawasan Konstruksi");
  const [formAuthor, setFormAuthor] = useState("Tim Pengawas SIMAK DPU");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formStatus, setFormStatus] = useState<"Terbit" | "Draf" | "Diarsipkan">("Terbit");
  const [formReadTime, setFormReadTime] = useState("4 min");
  const [formTags, setFormTags] = useState("Pengawasan, SIMAK 2, Jalan & Jembatan");
  const [formSummary, setFormSummary] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formThumbnail, setFormThumbnail] = useState<string>("");
  const [formPdfName, setFormPdfName] = useState<string>("");
  const [formPdfSize, setFormPdfSize] = useState<string>("");
  const [formPdfUrl, setFormPdfUrl] = useState<string>("");
  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");

  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Categories list
  const CATEGORIES = [
    "Semua",
    "Pelaporan Pengawasan Konstruksi",
    "Pengawasan SMKK & K3",
    "Pengawasan Mutu & Teknis",
    "Pembinaan & Pelatihan",
    "Teknologi & Sistem"
  ];

  // Helper untuk Reset Form
  const resetForm = () => {
    setFormTitle("");
    setFormCategory("Pelaporan Pengawasan Konstruksi");
    setFormAuthor("Tim Pengawas SIMAK DPU");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormStatus("Terbit");
    setFormReadTime("4 min");
    setFormTags("Pengawasan, SIMAK 2, Jalan & Jembatan");
    setFormSummary("");
    setFormContent("");
    setFormThumbnail("");
    setFormPdfName("");
    setFormPdfSize("");
    setFormPdfUrl("");
    setIsEditing(false);
    setEditingId(null);
    setEditorTab("write");
  };

  // Buka Modal Tambah Baru
  const handleOpenCreate = () => {
    resetForm();
    setIsEditing(false);
    setIsWriteModalOpen(true);
  };

  // Buka Modal Edit
  const handleOpenEdit = (item: NewsItem) => {
    setIsEditing(true);
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormAuthor(item.author);
    setFormDate(item.date);
    setFormStatus(item.status);
    setFormReadTime(item.readTime || "4 min");
    setFormTags((item.tags || []).join(", "));
    setFormSummary(item.summary || "");
    setFormContent(item.content || item.summary || "");
    setFormThumbnail(item.thumbnailUrl || "");
    setFormPdfName(item.pdfAttachmentName || "");
    setFormPdfSize(item.pdfAttachmentSize || "");
    setFormPdfUrl(item.pdfAttachmentUrl || "");
    setEditorTab("write");
    setIsWriteModalOpen(true);
  };

  // Mini WYSIWYG Toolbar Handler
  const insertFormatting = (tagStart: string, tagEnd: string = "") => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let replacement = "";
    if (selected.length > 0) {
      replacement = `${tagStart}${selected}${tagEnd}`;
    } else {
      // Default placeholder text if nothing is selected
      const defaultText = 
        tagStart.includes("strong") ? "Teks Tebal" :
        tagStart.includes("em") ? "Teks Miring" :
        tagStart.includes("u>") ? "Teks Garis Bawah" :
        tagStart.includes("s>") ? "Teks Coret" :
        tagStart.includes("h2") ? "Subjudul Regulasi" :
        tagStart.includes("h3") ? "Poin Kebijakan" :
        tagStart.includes("blockquote") ? "Kutipan Pasal / Surat Edaran..." :
        tagStart.includes("ul") ? "<li>Poin Ketentuan 1</li>\n<li>Poin Ketentuan 2</li>" :
        tagStart.includes("ol") ? "<li>Langkah Pertama</li>\n<li>Langkah Kedua</li>" :
        "Konten";
      replacement = `${tagStart}${defaultText}${tagEnd}`;
    }

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setFormContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagStart.length, start + replacement.length - tagEnd.length);
    }, 50);
  };

  // Handle Thumbnail File Upload Simulation
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file);
      setFormThumbnail(fakeUrl);
      triggerNotice(`Thumbnail "${file.name}" berhasil diunggah.`);
    }
  };

  // Handle PDF File Upload Simulation
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      setFormPdfName(file.name);
      setFormPdfSize(sizeMb);
      setFormPdfUrl(file.name);
      triggerNotice(`Naskah Dokumen PDF "${file.name}" (${sizeMb}) berhasil dilampirkan.`);
    }
  };

  // Submit Handler (Create or Edit)
  const handleSubmitNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSummary.trim()) {
      alert("Harap lengkapi Judul dan Ringkasan Kebijakan!");
      return;
    }

    const tagsArray = formTags
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (isEditing && editingId) {
      // Update item
      setNewsList(prev => prev.map(item => {
        if (item.id === editingId) {
          return {
            ...item,
            title: formTitle.trim(),
            category: formCategory,
            author: formAuthor.trim(),
            date: formDate,
            status: formStatus,
            readTime: formReadTime,
            tags: tagsArray.length > 0 ? tagsArray : ["Regulasi", "SIPJAKI"],
            summary: formSummary.trim(),
            content: formContent.trim() || formSummary.trim(),
            thumbnailUrl: formThumbnail,
            pdfAttachmentName: formPdfName,
            pdfAttachmentSize: formPdfSize,
            pdfAttachmentUrl: formPdfUrl,
            updated_at: new Date().toISOString()
          };
        }
        return item;
      }));
      triggerNotice(`Warta/Laporan "${formTitle.trim()}" berhasil diperbarui.`);
    } else {
      // Create new item
      const newId = `BER-2026-${String(newsList.length + 1).padStart(3, "0")}`;
      const newItem: NewsItem = {
        id: newId,
        title: formTitle.trim(),
        category: formCategory,
        date: formDate,
        author: formAuthor.trim(),
        summary: formSummary.trim(),
        content: formContent.trim() || formSummary.trim(),
        readTime: formReadTime || "4 min",
        featured: false,
        tags: tagsArray.length > 0 ? tagsArray : ["Pengawasan", "SIPJAKI"],
        status: formStatus,
        thumbnailUrl: formThumbnail || "/images/news/thumb-audit-jalan.jpg",
        pdfAttachmentName: formPdfName,
        pdfAttachmentSize: formPdfSize,
        pdfAttachmentUrl: formPdfUrl,
        updated_at: new Date().toISOString()
      };
      setNewsList([newItem, ...newsList]);
      triggerNotice(`Warta/Laporan baru "${formTitle.trim()}" berhasil diterbitkan.`);
    }

    setIsWriteModalOpen(false);
    resetForm();
  };

  // Delete Handler
  const handleConfirmDelete = () => {
    if (!deleteConfirmItem) return;
    setNewsList(prev => prev.filter(item => item.id !== deleteConfirmItem.id));
    triggerNotice(`Warta/Laporan "${deleteConfirmItem.title}" berhasil dihapus.`);
    setDeleteConfirmItem(null);
  };

  // Quick Status Toggle
  const handleToggleStatus = (id: string) => {
    setNewsList(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === "Terbit" ? "Draf" : "Terbit";
        triggerNotice(`Status ${item.id} diubah menjadi ${nextStatus}.`);
        return { ...item, status: nextStatus, updated_at: new Date().toISOString() };
      }
      return item;
    }));
  };

  // Filter Data
  const filteredData = useMemo(() => {
    return newsList.filter(item => {
      if (selectedCategory !== "Semua" && item.category !== selectedCategory) {
        return false;
      }
      if (selectedStatus !== "Semua" && item.status !== selectedStatus) {
        return false;
      }
      if (search.trim() !== "") {
        const q = search.toLowerCase();
        const matchTitle = (item.title || "").toLowerCase().includes(q);
        const matchSummary = (item.summary || "").toLowerCase().includes(q);
        const matchAuthor = (item.author || "").toLowerCase().includes(q);
        const matchTags = (item.tags || []).some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchSummary && !matchAuthor && !matchTags) return false;
      }
      return true;
    });
  }, [newsList, selectedCategory, selectedStatus, search]);

  // Sorted Data (Default: Riwayat Aturan Terkini DESC)
  const sortedData = useMemo(() => {
    const list = [...filteredData];
    if (sortBy === "terkini") {
      list.sort((a, b) => {
        const timeA = new Date(a.date || a.updated_at || "1970-01-01").getTime();
        const timeB = new Date(b.date || b.updated_at || "1970-01-01").getTime();
        if (timeA !== timeB) return timeB - timeA;
        return (b.id || "").localeCompare(a.id || "");
      });
      return list;
    }
    if (sortBy === "terlama") {
      list.sort((a, b) => {
        const timeA = new Date(a.date || a.updated_at || "1970-01-01").getTime();
        const timeB = new Date(b.date || b.updated_at || "1970-01-01").getTime();
        return timeA - timeB;
      });
      return list;
    }
    if (sortBy === "kategori") {
      list.sort((a, b) => (a.category || "").localeCompare(b.category || ""));
      return list;
    }
    if (sortBy === "judul") {
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      return list;
    }
    return list;
  }, [filteredData, sortBy]);

  // Statistik Atas
  const stats = useMemo(() => {
    const total = newsList.length;
    const active = newsList.filter(n => n.status === "Terbit").length;
    const withPdf = newsList.filter(n => !!n.pdfAttachmentUrl).length;
    return { total, active, withPdf };
  }, [newsList]);

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 bg-slate-50 min-h-screen text-slate-800">
      
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 1. Header Banner & Navigasi Utama */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#0F2E5C] text-[#FFC000]">
              <Scale className="w-3.5 h-3.5" />
              <span>SIPJAKI MASTER DATA</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{stats.active} Warta & Laporan Aktif</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
              <FileDown className="w-3 h-3 text-rose-600" />
              <span>{stats.withPdf} Laporan Pengawasan (PDF)</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Warta & Pelaporan Pengawasan Pekerjaan Konstruksi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Pusat penyebaran informasi hasil audit pengawasan lapangan SIMAK, kepatuhan keselamatan kerja SMKK, uji mutu bahan, dan warta pembinaan jasa konstruksi terintegrasi standar SIPJAKI Kementerian PUPR.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/regulasi"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span>Data Kebijakan</span>
          </Link>
          <Link
            href="/sipjaki/pelatihan"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Dashboard Pelatihan</span>
          </Link>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F2E5C] text-white text-xs font-extrabold hover:bg-[#153e7c] transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#FFC000]" />
            <span>+ TULIS BERITA BARU</span>
          </button>
        </div>
      </div>

      {/* 2. Tiga Kartu Metrik Ringkasan Bersih */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        
        {/* KARTU 1: TOTAL LAPORAN & WARTA */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-13 h-13 rounded-2xl bg-[#0F2E5C] text-[#FFC000] flex items-center justify-center shrink-0 shadow-xs">
            <Newspaper className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 leading-none">
                {stats.total}
              </span>
              <span className="text-xs text-slate-400 font-semibold">Artikel/Laporan</span>
            </div>
            <p className="text-[11px] font-extrabold tracking-wider text-slate-500 uppercase mt-1">
              TOTAL LAPORAN & WARTA
            </p>
          </div>
        </div>

        {/* KARTU 2: STATUS TERBIT AKTIF */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-13 h-13 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600 leading-none">
                {stats.active}
              </span>
              <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Terbit & Aktif
              </span>
            </div>
            <p className="text-[11px] font-extrabold tracking-wider text-slate-500 uppercase mt-1">
              DIPUBLIKASIKAN KE PORTAL
            </p>
          </div>
        </div>

        {/* KARTU 3: DOKUMEN PDF LAMPIRAN */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-13 h-13 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <FileDown className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 leading-none">
                {stats.withPdf}
              </span>
              <span className="text-xs text-slate-400 font-semibold">Salinan PDF</span>
            </div>
            <p className="text-[11px] font-extrabold tracking-wider text-slate-500 uppercase mt-1">
              DOKUMEN LAPORAN RESMI (PDF)
            </p>
          </div>
        </div>
      </div>

      {/* 3. Saklar Tampilan: Manajemen Konten (CMS) vs Portal Publikasi */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab("cms")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === "cms"
              ? "bg-[#0F2E5C] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Tabel Manajemen Berita & Pengawasan (CMS)</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] ${
            activeTab === "cms" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
          }`}>
            {newsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("portal")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === "portal"
              ? "bg-[#0F2E5C] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Pratinjau Portal Warta Publik</span>
        </button>
      </div>

      {/* 4. Single-Row Action Bar: Filter, Pencarian, & Sort Terkini DESC */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 px-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mr-1">
            FILTER:
          </span>

          {/* Filter Kategori */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat === "Semua" ? "Semua Kategori" : cat}</option>
              ))}
            </select>
            <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Filter Status */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="Terbit">Terbit</option>
              <option value="Draf">Draf</option>
              <option value="Diarsipkan">Diarsipkan</option>
            </select>
            <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Selector Urutan */}
          <div className="relative">
            <select
              id="sortOrderSelect"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="terkini">Riwayat Pelaporan Pengawasan Terkini (Default)</option>
              <option value="terlama">Riwayat Pengawasan Terlama</option>
              <option value="kategori">Berdasarkan Kategori Pengawasan</option>
              <option value="judul">Judul Warta / Proyek (A-Z)</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {(selectedCategory !== "Semua" || selectedStatus !== "Semua" || search !== "" || sortBy !== "terkini") && (
            <button
              onClick={() => {
                setSelectedCategory("Semua");
                setSelectedStatus("Semua");
                setSearch("");
                setSortBy("terkini");
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Reset Filter"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right: Badge Default DESC & Search Bar */}
        <div className="flex items-center gap-3">
          <span 
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200"
            title="Secara baku urutan data disusun kronologis terbalik (paling terbaru/update di atas)"
          >
            <ArrowUpDown className="w-3 h-3 text-blue-600" />
            <span>Riwayat Pelaporan Pengawasan Terkini (DESC)</span>
          </span>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari paket pekerjaan, lokasi proyek, audit..."
              className="w-full text-xs pl-10 pr-3 py-1.5 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-slate-400 font-medium bg-slate-50 focus:bg-white transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* 5. TAB 1: TABEL MANAJEMEN DATA KEBIJAKAN (CMS LIGHT SURFACE) */}
      {activeTab === "cms" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 uppercase font-extrabold tracking-wider text-[11px]">
                  {/* 1. NO */}
                  <th className="py-3.5 px-3 text-center w-12 border-r border-slate-200/80">
                    NO
                  </th>
                  {/* 2. KODE & TANGGAL */}
                  <th className="py-3.5 px-3 border-r border-slate-200/80 min-w-[130px]">
                    KODE & TANGGAL
                  </th>
                  {/* 3. JUDUL LAPORAN & KATEGORI */}
                  <th className="py-3.5 px-4 border-r border-slate-200/80 min-w-[340px]">
                    JUDUL LAPORAN & KATEGORI PENGAWASAN
                  </th>
                  {/* 4. THUMBNAIL */}
                  <th className="py-3.5 px-3 text-center border-r border-slate-200/80 min-w-[100px]">
                    THUMBNAIL
                  </th>
                  {/* 5. DOKUMEN PDF */}
                  <th className="py-3.5 px-3 text-center border-r border-slate-200/80 min-w-[150px]">
                    DOKUMEN PDF (LAPORAN)
                  </th>
                  {/* 6. STATUS */}
                  <th className="py-3.5 px-3 text-center border-r border-slate-200/80 min-w-[110px]">
                    STATUS
                  </th>
                  {/* 7. EDIT (KOLOM AKSI) */}
                  <th className="py-3.5 px-3 text-center min-w-[140px]">
                    EDIT
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedData.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    {/* NO */}
                    <td className="py-3.5 px-3 text-center font-bold text-slate-500 border-r border-slate-100">
                      {index + 1}
                    </td>

                    {/* KODE & TANGGAL */}
                    <td className="py-3.5 px-3 border-r border-slate-100">
                      <div className="font-mono font-bold text-[11px] text-[#0F2E5C] bg-slate-100 px-2 py-0.5 rounded inline-block">
                        {item.id}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{item.date}</span>
                      </div>
                    </td>

                    {/* JUDUL KEBIJAKAN & KATEGORI */}
                    <td className="py-3.5 px-4 border-r border-slate-100">
                      <div className="font-extrabold text-slate-900 text-xs sm:text-[13px] leading-snug line-clamp-2">
                        {item.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{item.author}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[10px] text-slate-500">
                          {item.readTime}
                        </span>
                      </div>
                    </td>

                    {/* THUMBNAIL */}
                    <td className="py-3.5 px-3 text-center border-r border-slate-100">
                      {item.thumbnailUrl ? (
                        <div className="w-14 h-9 rounded-lg overflow-hidden border border-slate-200 mx-auto shadow-2xs relative bg-slate-100">
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0F2E5C] to-blue-700 text-white text-[9px] font-black">
                            <ImageIcon className="w-4 h-4 text-[#FFC000]" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold italic">
                          Tanpa Foto
                        </span>
                      )}
                    </td>

                    {/* DOKUMEN PDF */}
                    <td className="py-3.5 px-3 text-center border-r border-slate-100">
                      {item.pdfAttachmentUrl ? (
                        <div className="inline-flex flex-col items-center gap-0.5">
                          <button
                            onClick={() => alert(`Mengunduh salinan berkas resmi:\n${item.pdfAttachmentName || item.pdfAttachmentUrl}\nUkuran: ${item.pdfAttachmentSize || "2.5 MB"}`)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors shadow-2xs"
                            title="Unduh Salinan PDF"
                          >
                            <FileDown className="w-3 h-3 text-rose-600" />
                            <span>PDF ({item.pdfAttachmentSize || "Unduh"})</span>
                          </button>
                          <span className="text-[9px] text-slate-400 max-w-[130px] truncate block" title={item.pdfAttachmentName}>
                            {item.pdfAttachmentName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold italic">
                          Belum Ada PDF
                        </span>
                      )}
                    </td>

                    {/* STATUS */}
                    <td className="py-3.5 px-3 text-center border-r border-slate-100">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        item.status === "Terbit" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : item.status === "Draf"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.status === "Terbit" ? "bg-emerald-500" : item.status === "Draf" ? "bg-amber-500" : "bg-slate-400"
                        }`} />
                        <span>{item.status}</span>
                      </span>
                    </td>

                    {/* EDIT (KOLOM AKSI) */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Tombol Edit Kuning */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center transition-colors shadow-2xs"
                          title="Ubah / Edit Data Kebijakan"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Tombol Hapus Merah */}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmItem(item)}
                          className="w-7 h-7 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-2xs"
                          title="Hapus Kebijakan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Tombol Detail Abu-abu */}
                        <button
                          type="button"
                          onClick={() => setSelectedNewsDetail(item)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors border border-slate-200"
                          title="Pratinjau Lengkap"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick Toggle Status */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item.id)}
                          className={`px-2 py-1 rounded text-[9px] font-black transition-colors ${
                            item.status === "Terbit"
                              ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          }`}
                          title={item.status === "Terbit" ? "Tarik ke status Draf" : "Langsung Terbitkan"}
                        >
                          {item.status === "Terbit" ? "Draf" : "Publikasi"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {sortedData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                      Tidak ada dokumen kebijakan yang cocok dengan kriteria filter Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Tabel */}
          <div className="p-3.5 px-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <span>Menampilkan <strong>{sortedData.length}</strong> dari <strong>{newsList.length}</strong> entri kebijakan</span>
            <div className="flex items-center gap-1 self-end sm:self-auto">
              <span className="text-[11px] text-slate-400 mr-2">Disinkronisasi standar SIPJAKI Kementerian PUPR</span>
              <button disabled className="px-2.5 py-1 rounded border border-slate-200 text-slate-300 cursor-not-allowed">Sebelumnya</button>
              <button className="px-2.5 py-1 rounded bg-primary text-white font-bold">1</button>
              <button disabled className="px-2.5 py-1 rounded border border-slate-200 text-slate-300 cursor-not-allowed">Selanjutnya</button>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 2: PORTAL WARTA PUBLIKASI (GRID CARDS) */}
      {activeTab === "portal" && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedData.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* Header Cover / Thumbnail */}
                <div className="h-44 bg-gradient-to-br from-[#0F2E5C] to-blue-700 relative flex items-center justify-center p-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-[#FFC000] shadow-xs">
                    <Newspaper className="w-7 h-7" />
                  </div>
                  
                  {/* Category Pill */}
                  <span className="absolute top-3.5 left-3.5 bg-[#FFC000] text-[#0F2E5C] text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-xs">
                    {item.category}
                  </span>

                  {/* Status Pill */}
                  <span className={`absolute top-3.5 right-3.5 text-[10px] font-black px-2 py-0.5 rounded-md text-white shadow-xs ${
                    item.status === "Terbit" ? "bg-emerald-600" : "bg-amber-600"
                  }`}>
                    {item.status}
                  </span>

                  {/* Lampiran PDF Badge jika ada */}
                  {item.pdfAttachmentUrl && (
                    <span className="absolute bottom-3 left-3.5 bg-rose-600/90 backdrop-blur-xs text-white text-[10px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
                      <FileDown className="w-3 h-3" />
                      <span>Lampiran Naskah PDF ({item.pdfAttachmentSize || "Tersedia"})</span>
                    </span>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{item.date}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{item.readTime}</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex gap-1.5 flex-wrap">
                      {item.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedNewsDetail(item)}
                      className="inline-flex items-center gap-1 text-xs font-black text-[#0F2E5C] hover:text-blue-700 transition-colors"
                    >
                      <span>Baca Lengkap</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#FFC000]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sortedData.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 font-medium">
              Tidak ada artikel yang cocok dengan pencarian Anda.
            </div>
          )}
        </div>
      )}

      {/* 7. MODAL TULIS / EDIT KEBIJAKAN BARU (LENGKAP: THUMBNAIL, PDF, MINI WYSIWYG) */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-5 px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0F2E5C] text-[#FFC000] flex items-center justify-center shadow-xs">
                  {isEditing ? <Edit3 className="w-5 h-5" /> : <Newspaper className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900">
                      {isEditing ? "Ubah Berita / Laporan Pengawasan" : "Tulis Berita / Laporan Pengawasan Baru"}
                    </h2>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      SIPJAKI 2026
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isEditing ? `Memperbarui artikel kode ${editingId}` : "Publikasikan hasil audit lapangan SIMAK, kepatuhan K3, atau warta pembinaan jasa konstruksi"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsWriteModalOpen(false);
                  resetForm();
                }}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable Form) */}
            <form onSubmit={handleSubmitNews} className="p-6 overflow-y-auto flex flex-col gap-4 text-xs">
              
              {/* Baris 1: Judul Berita */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  JUDUL LAPORAN / WARTA PENGAWASAN <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Laporan Pengawasan Berkala: Audit Lapangan SIMAK 2 Paket Preservasi Jalan Cigudeg..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2.5 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Baris 2: Kategori, Penulis, & Tanggal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    KATEGORI LAPORAN / PENGAWASAN
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  >
                    {CATEGORIES.filter(c => c !== "Semua").map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    PENGAWAS / INSTANSI PELAPOR
                  </label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="Contoh: Tim Pengawas SIMAK DPU"
                    className="w-full p-2.5 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    TANGGAL TERBIT
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2.5 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Baris 3: Status, Estimasi Baca, Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    STATUS PUBLIKASI
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full p-2.5 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  >
                    <option value="Terbit">Terbit (Tampil di Publik)</option>
                    <option value="Draf">Draf (Internal Admin)</option>
                    <option value="Diarsipkan">Diarsipkan</option>
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    ESTIMASI BACA
                  </label>
                  <input
                    type="text"
                    value={formReadTime}
                    onChange={(e) => setFormReadTime(e.target.value)}
                    placeholder="Contoh: 4 min"
                    className="w-full p-2.5 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    TAGS (PISAHKAN KOMA)
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="SE Bupati, Regulasi, SIPJAKI"
                    className="w-full p-2.5 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Baris 4: Dua Komponen Media Baru (Upload Thumbnail 16:9 & Upload PDF Naskah Resmi) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                
                {/* 4A. Upload Thumbnail */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-primary" />
                      <span>THUMBNAIL (COVER IMAGE)</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-semibold">Rasio 16:9</span>
                  </div>

                  <div className="border border-dashed border-slate-300 rounded-xl p-3 bg-white flex flex-col items-center justify-center text-center gap-2 relative hover:bg-slate-50 transition-colors">
                    {formThumbnail ? (
                      <div className="w-full flex items-center justify-between gap-3">
                        <div className="w-16 h-10 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                          <ImageIcon className="w-5 h-5 text-[#FFC000]" />
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <span className="text-[11px] font-bold text-slate-800 truncate block">Thumbnail Siap Terbit</span>
                          <span className="text-[10px] text-emerald-600 font-semibold">✓ Gambar tervalidasi</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormThumbnail("")}
                          className="px-2 py-1 rounded bg-rose-50 text-rose-600 text-[10px] font-bold hover:bg-rose-100"
                        >
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-slate-400" />
                        <div className="text-[11px] text-slate-600">
                          <label className="text-primary font-bold cursor-pointer hover:underline">
                            <span>Pilih file gambar</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleThumbnailUpload}
                              className="hidden"
                            />
                          </label>
                          <span className="text-slate-400"> atau seret ke sini</span>
                        </div>
                        <p className="text-[10px] text-slate-400">PNG, JPG, WebP (Maks. 2 MB)</p>
                      </>
                    )}
                  </div>
                </div>

                {/* 4B. Upload Berkas PDF Resmi */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
                      <FileDown className="w-4 h-4 text-rose-600" />
                      <span>DOKUMEN SALINAN RESMI (PDF)</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-semibold">SK / SE / Perda</span>
                  </div>

                  <div className="border border-dashed border-slate-300 rounded-xl p-3 bg-white flex flex-col items-center justify-center text-center gap-2 relative hover:bg-slate-50 transition-colors">
                    {formPdfUrl ? (
                      <div className="w-full flex items-center justify-between gap-3">
                        <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-black text-xs">
                          PDF
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <span className="text-[11px] font-bold text-slate-800 truncate block" title={formPdfName}>
                            {formPdfName || "Dokumen_Kebijakan.pdf"}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            Ukuran: {formPdfSize || "2.5 MB"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormPdfUrl("");
                            setFormPdfName("");
                            setFormPdfSize("");
                          }}
                          className="px-2 py-1 rounded bg-rose-50 text-rose-600 text-[10px] font-bold hover:bg-rose-100"
                        >
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <>
                        <FileDown className="w-6 h-6 text-rose-400" />
                        <div className="text-[11px] text-slate-600">
                          <label className="text-primary font-bold cursor-pointer hover:underline">
                            <span>Pilih naskah PDF</span>
                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              onChange={handlePdfUpload}
                              className="hidden"
                            />
                          </label>
                          <span className="text-slate-400"> lampiran resmi</span>
                        </div>
                        <p className="text-[10px] text-slate-400">PDF Asli bertandatangan (Maks. 15 MB)</p>
                      </>
                    )}
                  </div>
                </div>

              </div>

              {/* Baris 5: Ringkasan Singkat (Lead Paragraph) */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  RINGKASAN SINGKAT (LEAD PARAGRAPH) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Tuliskan rangkuman 1-2 kalimat untuk kartu depan portal berita..."
                  className="w-full p-2.5 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Baris 6: Pengaturan Penulisan Kaya (Mini WYSIWYG Toolbar Standar SIPJAKI) */}
              <div>
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                  <label className="font-extrabold text-slate-700">
                    ISI ARTIKEL / TEKS LENGKAP KEBIJAKAN
                  </label>

                  {/* Switch Tab: Tulis Narasi vs Pratinjau Format Langsung */}
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setEditorTab("write")}
                      className={`px-3 py-1 rounded-md text-[11px] font-black transition-all ${
                        editorTab === "write" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Tulis Narasi
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab("preview")}
                      className={`px-3 py-1 rounded-md text-[11px] font-black transition-all ${
                        editorTab === "preview" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Pratinjau Format (Live)
                    </button>
                  </div>
                </div>

                {editorTab === "write" ? (
                  <div className="border border-slate-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
                    {/* Mini WYSIWYG Toolbar */}
                    <div className="bg-slate-100/90 border-b border-slate-200 p-1.5 flex items-center gap-1 flex-wrap text-slate-700">
                      
                      {/* Bold, Italic, Underline, Strikethrough */}
                      <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-md border border-slate-200">
                        <button
                          type="button"
                          onClick={() => insertFormatting("<strong>", "</strong>")}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-700 font-black"
                          title="Tebal / Bold (Ctrl+B)"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting("<em>", "</em>")}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
                          title="Miring / Italic (Ctrl+I)"
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting("<u>", "</u>")}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
                          title="Garis Bawah / Underline (Ctrl+U)"
                        >
                          <UnderlineIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting("<s>", "</s>")}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
                          title="Coret / Strikethrough"
                        >
                          <Strikethrough className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Headings */}
                      <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-md border border-slate-200">
                        <button
                          type="button"
                          onClick={() => insertFormatting("<h2>", "</h2>")}
                          className="px-1.5 py-1 hover:bg-slate-100 rounded text-[11px] font-black text-slate-700"
                          title="Heading 2 (Subjudul Utama)"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting("<h3>", "</h3>")}
                          className="px-1.5 py-1 hover:bg-slate-100 rounded text-[11px] font-black text-slate-700"
                          title="Heading 3 (Subjudul Sekunder)"
                        >
                          H3
                        </button>
                      </div>

                      {/* Lists & Quote */}
                      <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-md border border-slate-200">
                        <button
                          type="button"
                          onClick={() => insertFormatting("<ul>\n  <li>", "</li>\n</ul>")}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
                          title="Daftar Poin (Bullet List)"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting("<ol>\n  <li>", "</li>\n</ol>")}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
                          title="Daftar Nomor (Numbered List)"
                        >
                          <ListOrdered className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting("<blockquote>\n\"", "\"\n</blockquote>")}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
                          title="Kutipan Aturan (Blockquote)"
                        >
                          <Quote className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Alignments */}
                      <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-md border border-slate-200">
                        <button
                          type="button"
                          onClick={() => insertFormatting('<div style="text-align: left;">', '</div>')}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
                          title="Rata Kiri"
                        >
                          <AlignLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting('<div style="text-align: center;">', '</div>')}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
                          title="Rata Tengah"
                        >
                          <AlignCenter className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting('<div style="text-align: right;">', '</div>')}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
                          title="Rata Kanan"
                        >
                          <AlignRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting('<div style="text-align: justify;">', '</div>')}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
                          title="Rata Kanan-Kiri (Justify)"
                        >
                          <AlignJustify className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Link & Clear */}
                      <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-md border border-slate-200 ml-auto">
                        <button
                          type="button"
                          onClick={() => insertFormatting('<a href="https://sipjaki.pu.go.id" target="_blank" class="text-primary underline">', '</a>')}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
                          title="Sisip Hyperlink"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Strip basic HTML tags
                            const clean = formContent.replace(/<[^>]*>?/gm, '');
                            setFormContent(clean);
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
                          title="Bersihkan Semua Format HTML"
                        >
                          <Eraser className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                    <textarea
                      ref={contentTextareaRef}
                      id="newsContentEditor"
                      rows={8}
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      placeholder="Gunakan toolbar di atas untuk menerapkan format tebal, miring, garis bawah, heading, atau daftar nomor..."
                      className="w-full p-3 text-xs font-mono leading-relaxed bg-white border-none focus:outline-none"
                    />
                  </div>
                ) : (
                  /* Tab Pratinjau Format Langsung (Live Preview) */
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 min-h-[220px] max-h-[300px] overflow-y-auto">
                    <div 
                      className="prose prose-xs max-w-none text-slate-800 leading-relaxed font-sans space-y-2 [&_h2]:text-base [&_h2]:font-black [&_h2]:text-slate-900 [&_h3]:text-sm [&_h3]:font-extrabold [&_h3]:text-slate-800 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-400 [&_blockquote]:bg-amber-50 [&_blockquote]:p-2.5 [&_blockquote]:rounded-r-lg [&_blockquote]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-black [&_u]:underline"
                      dangerouslySetInnerHTML={{ __html: formContent || "<p class='text-slate-400 italic'>Belum ada isi artikel yang ditulis.</p>" }}
                    />
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 font-semibold">
                  Tersimpan otomatis ke database SIPJAKI Daerah
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsWriteModalOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0F2E5C] hover:bg-[#153e7c] text-white text-xs font-black transition-colors shadow-xs"
                  >
                    {isEditing ? "Simpan Perubahan Laporan" : "Publikasikan Laporan / Berita"}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 8. SAFETY CONFIRMATION DIALOG HAPUS KEBIJAKAN / LAPORAN */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-[420px] p-6 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-base font-black text-slate-900">
              Hapus Berita / Laporan Pengawasan?
            </h3>
            
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus warta/laporan <strong>&quot;{deleteConfirmItem.title}&quot;</strong>?
              Data yang dihapus tidak dapat dipulihkan kembali dari portal publikasi.
            </p>

            <div className="flex items-center justify-center gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="w-full py-2.5 rounded-xl border border-slate-300 text-xs font-extrabold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-colors shadow-xs"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL DETAIL BACA SELENGKAPNYA */}
      {selectedNewsDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 px-6 bg-[#0F2E5C] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="bg-[#FFC000] text-[#0F2E5C] text-[10px] font-black px-2 py-0.5 rounded">
                  {selectedNewsDetail.category}
                </span>
                <span className="text-xs text-blue-200 font-semibold">•</span>
                <span className="text-xs text-blue-200 font-semibold">{selectedNewsDetail.date}</span>
              </div>
              <button
                onClick={() => setSelectedNewsDetail(null)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex flex-col gap-4 text-xs">
              <h2 className="text-lg font-black text-slate-900 leading-snug">
                {selectedNewsDetail.title}
              </h2>

              <div className="flex items-center gap-3 text-[11px] text-slate-500 pb-3 border-b border-slate-100">
                <span>Oleh: <strong>{selectedNewsDetail.author}</strong></span>
                <span>•</span>
                <span>Waktu Baca: <strong>{selectedNewsDetail.readTime}</strong></span>
                <span>•</span>
                <span>Status: <strong className="text-emerald-600">{selectedNewsDetail.status}</strong></span>
              </div>

              {/* Salinan PDF Box jika tersedia */}
              {selectedNewsDetail.pdfAttachmentUrl && (
                <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                      PDF
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-900 block text-xs">
                        Naskah Resmi Dokumen Kebijakan
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {selectedNewsDetail.pdfAttachmentName || "Salinan_Dokumen.pdf"} ({selectedNewsDetail.pdfAttachmentSize || "2.8 MB"})
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => alert(`Mengunduh berkas resmi ${selectedNewsDetail.pdfAttachmentName}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh PDF</span>
                  </button>
                </div>
              )}

              {/* HTML Content Render */}
              <div 
                className="prose prose-xs max-w-none text-slate-700 leading-relaxed font-sans space-y-3 [&_h2]:text-sm [&_h2]:font-black [&_h2]:text-slate-900 [&_h3]:text-xs [&_h3]:font-extrabold [&_blockquote]:border-l-4 [&_blockquote]:border-amber-400 [&_blockquote]:bg-amber-50 [&_blockquote]:p-3 [&_blockquote]:rounded-r-lg [&_blockquote]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                dangerouslySetInnerHTML={{ __html: selectedNewsDetail.content || selectedNewsDetail.summary }}
              />

              {/* Tags */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 mr-1">Tags:</span>
                {selectedNewsDetail.tags.map(t => (
                  <span key={t} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedNewsDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900"
              >
                Tutup Pratinjau
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

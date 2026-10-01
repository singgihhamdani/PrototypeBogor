"use client";
import React, { useState } from "react";
import { 
  Newspaper, Calendar, Clock, ArrowRight, Search, Plus, 
  FileText, CheckCircle2, Eye, Trash2, Tag, BookOpen, 
  Send, Layers, User
} from "lucide-react";
import newsData from "@/data/news.json";
import DataTableView, { ColumnDef } from "@/components/common/data-table-view";
import ModalForm from "@/components/common/modal-form";
import StatusBadge from "@/components/common/status-badge";

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
}

const initialNewsList: NewsItem[] = (newsData as any[]).map((n, i) => ({
  ...n,
  content: n.summary + " Implementasi program ini terus dipantau oleh Tim Pembina Jasa Konstruksi Kabupaten Bogor secara berkala guna memastikan keselarasan dengan ketentuan Permen PUPR No. 1/2023.",
  status: i === 0 ? "Terbit" : i === 1 ? "Terbit" : "Draf"
}));

export default function BeritaPage() {
  const [newsList, setNewsList] = useState<NewsItem[]>(initialNewsList);
  const [activeTab, setActiveTab] = useState<"portal" | "cms">("portal");
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("Semua");
  
  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedNewsDetail, setSelectedNewsDetail] = useState<NewsItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "Pembinaan & Pelatihan",
    author: "Tim Pembina Jakon Bogor",
    date: new Date().toISOString().split("T")[0],
    readTime: "3 min",
    status: "Terbit" as "Terbit" | "Draf" | "Diarsipkan",
    tags: "SMKK, Pembinaan, Sertifikasi",
    summary: "",
    content: ""
  });

  // Unique tags
  const allTags = ["Semua", ...Array.from(new Set(newsList.flatMap(n => n.tags)))];

  // Filtered for portal
  const filtered = newsList.filter((n) => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.summary.toLowerCase().includes(search.toLowerCase()) ||
      n.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchTag = selectedTag === "Semua" || n.tags.includes(selectedTag);
    return matchSearch && matchTag;
  });

  // Handle Create News
  const handleSubmitNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.summary) {
      alert("Harap lengkapi judul dan ringkasan berita!");
      return;
    }

    const newId = `NEWS-${String(newsList.length + 1).padStart(3, "0")}`;
    const tagsArray = formData.tags
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const newItem: NewsItem = {
      id: newId,
      title: formData.title,
      category: formData.category,
      date: formData.date,
      author: formData.author,
      summary: formData.summary,
      content: formData.content || formData.summary,
      readTime: formData.readTime || "3 min",
      featured: false,
      tags: tagsArray.length > 0 ? tagsArray : ["SIPJAKI", "Bogor"],
      status: formData.status
    };

    setNewsList([newItem, ...newsList]);
    setIsCreateOpen(false);
    // Reset form
    setFormData({
      title: "",
      category: "Pembinaan & Pelatihan",
      author: "Tim Pembina Jakon Bogor",
      date: new Date().toISOString().split("T")[0],
      readTime: "3 min",
      status: "Terbit",
      tags: "SMKK, Pembinaan, Sertifikasi",
      summary: "",
      content: ""
    });
  };

  const handleDeleteNews = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus warta/berita ini?")) {
      setNewsList(newsList.filter(n => n.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setNewsList(newsList.map(n => {
      if (n.id === id) {
        const nextStatus = n.status === "Terbit" ? "Draf" : "Terbit";
        return { ...n, status: nextStatus };
      }
      return n;
    }));
  };

  // CMS Columns
  const cmsColumns: ColumnDef<NewsItem>[] = [
    {
      key: "id",
      label: "KODE",
      width: "100px",
      render: (row) => (
        <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "2px 6px", borderRadius: "4px" }}>
          {row.id}
        </span>
      )
    },
    {
      key: "title",
      label: "JUDUL WARTA & KATEGORI",
      render: (row) => (
        <div>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", lineHeight: 1.35 }}>
            {row.title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748B" }}>
              {row.category}
            </span>
            <span style={{ fontSize: "10px", color: "#CBD5E1" }}>•</span>
            <span style={{ fontSize: "10px", color: "#64748B", display: "flex", alignItems: "center", gap: "3px" }}>
              <User style={{ width: "10px", height: "10px" }} /> {row.author}
            </span>
          </div>
        </div>
      )
    },
    {
      key: "date",
      label: "TANGGAL TERBIT",
      width: "130px",
      align: "center",
      render: (row) => (
        <div style={{ fontSize: "11px", color: "#475569", fontWeight: 600 }}>
          {row.date}
        </div>
      )
    },
    {
      key: "status",
      label: "STATUS",
      width: "110px",
      align: "center",
      render: (row) => (
        <span 
          style={{
            fontSize: "10px",
            fontWeight: 800,
            padding: "3px 8px",
            borderRadius: "6px",
            backgroundColor: row.status === "Terbit" ? "#DCFCE7" : row.status === "Draf" ? "#FEF3C7" : "#F1F5F9",
            color: row.status === "Terbit" ? "#166534" : row.status === "Draf" ? "#92400E" : "#475569"
          }}
        >
          {row.status}
        </span>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Newspaper style={{ width: "12px", height: "12px" }} /> Publikasi & Dokumentasi SIPJAKI
            </span>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#166534", backgroundColor: "#DCFCE7", padding: "3px 10px", borderRadius: "9999px" }}>
              {newsList.filter(n => n.status === "Terbit").length} Berita Aktif
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Warta & Berita Pembinaan Jasa Konstruksi
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
            Pusat penyebaran informasi bimtek, sosialisasi regulasi, audit SIMAK lapangan, dan kemajuan infrastruktur Kab. Bogor
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#0F2E5C",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "10px",
            padding: "10px 18px",
            fontSize: "12px",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(15, 46, 92, 0.25)"
          }}
        >
          <Plus style={{ width: "16px", height: "16px", color: "#FFC000" }} />
          <span>Tulis Berita Baru</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #E2E8F0", paddingBottom: "10px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("portal")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 800,
            border: "none",
            cursor: "pointer",
            backgroundColor: activeTab === "portal" ? "#0F2E5C" : "transparent",
            color: activeTab === "portal" ? "#FFFFFF" : "#64748B",
            transition: "all 0.15s ease"
          }}
        >
          <Newspaper style={{ width: "14px", height: "14px" }} />
          <span>Portal Publikasi ({filtered.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("cms")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 800,
            border: "none",
            cursor: "pointer",
            backgroundColor: activeTab === "cms" ? "#0F2E5C" : "transparent",
            color: activeTab === "cms" ? "#FFFFFF" : "#64748B",
            transition: "all 0.15s ease"
          }}
        >
          <Layers style={{ width: "14px", height: "14px" }} />
          <span>Manajemen Konten / CMS ({newsList.length})</span>
        </button>
      </div>

      {/* Tab 1: Portal Grid View */}
      {activeTab === "portal" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Search & Tag Filter Bar */}
          <div 
            style={{
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              padding: "16px 20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Search style={{ width: "16px", height: "16px", color: "#94A3B8" }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari berita, agenda kegiatan pembinaan, atau kata kunci..."
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

            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", borderTop: "1px solid #F1F5F9", paddingTop: "12px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", marginRight: "4px" }}>
                Filter Topik:
              </span>
              {allTags.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: isSelected ? "#0F2E5C" : "#F1F5F9",
                      color: isSelected ? "#FFFFFF" : "#64748B",
                      transition: "all 0.15s ease"
                    }}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* News Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
            {filtered.map((item) => (
              <div 
                key={item.id} 
                style={{
                  borderRadius: "18px",
                  border: "1px solid #E2E8F0",
                  backgroundColor: "#FFFFFF",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease"
                }}
              >
                {/* Header Card Gradient */}
                <div 
                  style={{
                    height: "140px",
                    background: "linear-gradient(135deg, #0F2E5C 0%, #1E40AF 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative"
                  }}
                >
                  <div 
                    style={{
                      height: "52px",
                      width: "52px",
                      borderRadius: "14px",
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      backdropFilter: "blur(4px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#FFC000"
                    }}
                  >
                    <Newspaper style={{ width: "26px", height: "26px" }} />
                  </div>
                  
                  <span 
                    style={{
                      position: "absolute",
                      top: "14px",
                      left: "14px",
                      backgroundColor: "#FFC000",
                      color: "#0F2E5C",
                      fontSize: "10px",
                      fontWeight: 800,
                      padding: "3px 10px",
                      borderRadius: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}
                  >
                    {item.category}
                  </span>

                  <span
                    style={{
                      position: "absolute",
                      top: "14px",
                      right: "14px",
                      backgroundColor: item.status === "Terbit" ? "rgba(16, 185, 129, 0.9)" : "rgba(245, 158, 11, 0.9)",
                      color: "#FFFFFF",
                      fontSize: "10px",
                      fontWeight: 800,
                      padding: "3px 8px",
                      borderRadius: "6px"
                    }}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Content Body */}
                <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px", flex: 1, justifyContent: "space-between" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "#64748B" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar style={{ width: "12px", height: "12px" }} /> {item.date}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock style={{ width: "12px", height: "12px" }} /> {item.readTime}
                      </span>
                    </div>
                    <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0, lineHeight: 1.35 }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: "12px", color: "#475569", margin: 0, lineHeight: 1.55 }}>
                      {item.summary}
                    </p>
                  </div>

                  <div style={{ paddingTop: "14px", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {item.tags.slice(0, 2).map((t) => (
                        <span key={t} style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "#F1F5F9", color: "#64748B", padding: "2px 8px", borderRadius: "4px" }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedNewsDetail(item)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        background: "none",
                        border: "none",
                        fontSize: "12px",
                        fontWeight: 800,
                        color: "#0F2E5C",
                        cursor: "pointer",
                        padding: 0
                      }}
                    >
                      <span>Baca Selengkapnya</span>
                      <ArrowRight style={{ width: "14px", height: "14px", color: "#FFC000" }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E2E8F0", padding: "48px 24px", textAlign: "center", color: "#94A3B8", fontSize: "13px" }}>
              Tidak ada berita yang cocok dengan kriteria pencarian Anda.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: CMS Management Table */}
      {activeTab === "cms" && (
        <DataTableView<NewsItem>
          title="Manajemen Konten Publikasi & Dokumentasi SIPJAKI"
          subtitle="Daftar warta, artikel pembinaan, dan siaran pers resmi Dinas PUPR Kab. Bogor"
          data={newsList}
          columns={cmsColumns}
          exportFileName="warta-sijakon-bogor"
          actionsHeader="AKSI KONTEN"
          actionsRender={(row) => (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <button
                type="button"
                title="Lihat Pratinjau"
                onClick={() => setSelectedNewsDetail(row)}
                style={{
                  padding: "6px",
                  borderRadius: "6px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#FFFFFF",
                  color: "#0F2E5C",
                  cursor: "pointer"
                }}
              >
                <Eye style={{ width: "14px", height: "14px" }} />
              </button>
              <button
                type="button"
                title={row.status === "Terbit" ? "Tarik ke Draf" : "Terbitkan Warta"}
                onClick={() => handleToggleStatus(row.id)}
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: row.status === "Terbit" ? "#FEF3C7" : "#DCFCE7",
                  color: row.status === "Terbit" ? "#92400E" : "#166534",
                  fontSize: "10px",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                {row.status === "Terbit" ? "Ke Draf" : "Publikasi"}
              </button>
              <button
                type="button"
                title="Hapus Warta"
                onClick={() => handleDeleteNews(row.id)}
                style={{
                  padding: "6px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#FEE2E2",
                  color: "#991B1B",
                  cursor: "pointer"
                }}
              >
                <Trash2 style={{ width: "14px", height: "14px" }} />
              </button>
            </div>
          )}
        />
      )}

      {/* Modal Tulis Berita Baru */}
      <ModalForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tulis Warta / Berita Baru SIPJAKI"
        subtitle="Publikasikan informasi kegiatan pembinaan, pelatihan, atau sosialisasi regulasi"
        icon={Newspaper}
        size="lg"
        submitLabel="Publikasikan Berita"
        onSubmit={handleSubmitNews}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
              Judul Berita / Warta <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Bimtek Penerapan SMKK Angkatan II Bagi Pelaku Usaha Jasa Konstruksi"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "13px"
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
                Kategori Berita
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px"
                }}
              >
                <option value="Pembinaan & Pelatihan">Pembinaan & Pelatihan</option>
                <option value="Teknologi & Sistem">Teknologi & Sistem</option>
                <option value="Pengawasan">Pengawasan</option>
                <option value="Kebijakan & Regulasi">Kebijakan & Regulasi</option>
                <option value="Keselamatan SMKK">Keselamatan SMKK</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
                Penulis / Kontributor
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Nama unit kerja atau penulis"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px"
                }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
                Tanggal Terbit
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
                Status Publikasi
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px"
                }}
              >
                <option value="Terbit">Terbit (Langsung Aktif)</option>
                <option value="Draf">Draf (Disimpan Internal)</option>
                <option value="Diarsipkan">Diarsipkan</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
                Estimasi Baca
              </label>
              <input
                type="text"
                value={formData.readTime}
                onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                placeholder="3 min"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px"
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
              Tags / Kata Kunci (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="SMKK, K3, Pelatihan, APBD"
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "13px"
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
              Ringkasan Singkat (Lead Paragraph) <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <textarea
              required
              rows={2}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Tuliskan rangkuman 1-2 kalimat untuk ditampilkan di kartu warta..."
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "13px",
                fontFamily: "inherit"
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
              Isi Artikel Lengkap
            </label>
            <textarea
              rows={5}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Tuliskan rincian narasi warta selengkapnya..."
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "13px",
                fontFamily: "inherit"
              }}
            />
          </div>
        </div>
      </ModalForm>

      {/* Modal Detail Berita */}
      {selectedNewsDetail && (
        <ModalForm
          isOpen={!!selectedNewsDetail}
          onClose={() => setSelectedNewsDetail(null)}
          title={selectedNewsDetail.title}
          subtitle={`${selectedNewsDetail.category} • Oleh ${selectedNewsDetail.author}`}
          icon={BookOpen}
          size="lg"
          hideFooter
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "12px", borderBottom: "1px solid #E2E8F0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", color: "#64748B" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Calendar style={{ width: "13px", height: "13px" }} /> {selectedNewsDetail.date}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock style={{ width: "13px", height: "13px" }} /> {selectedNewsDetail.readTime}
                </span>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: "6px",
                  backgroundColor: selectedNewsDetail.status === "Terbit" ? "#DCFCE7" : "#FEF3C7",
                  color: selectedNewsDetail.status === "Terbit" ? "#166534" : "#92400E"
                }}
              >
                {selectedNewsDetail.status}
              </span>
            </div>

            <div style={{ backgroundColor: "#F8FAFC", borderRadius: "10px", padding: "14px", borderLeft: "4px solid #0F2E5C" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Lead Ringkasan
              </span>
              <p style={{ fontSize: "13px", color: "#334155", margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>
                "{selectedNewsDetail.summary}"
              </p>
            </div>

            <div>
              <p style={{ fontSize: "13px", color: "#1E293B", lineHeight: 1.7, margin: 0 }}>
                {selectedNewsDetail.content || selectedNewsDetail.summary}
              </p>
            </div>

            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", paddingTop: "12px", borderTop: "1px solid #E2E8F0" }}>
              {selectedNewsDetail.tags.map((t) => (
                <span key={t} style={{ fontSize: "11px", fontWeight: 700, backgroundColor: "#EBF2FA", color: "#0F2E5C", padding: "3px 10px", borderRadius: "6px" }}>
                  #{t}
                </span>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setSelectedNewsDetail(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  backgroundColor: "#0F2E5C",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                Tutup Pembaca
              </button>
            </div>
          </div>
        </ModalForm>
      )}
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { 
  BookOpen, Search, Download, Calendar, FileText, 
  Plus, CheckCircle2, Eye, Trash2, ShieldCheck, 
  Layers, Filter, ArrowUpRight
} from "lucide-react";
import regulationsData from "@/data/regulations.json";
import DataTableView, { ColumnDef } from "@/components/common/data-table-view";
import ModalForm from "@/components/common/modal-form";
import FileUploader from "@/components/common/file-uploader";

export interface RegulationItem {
  id: string;
  category: string;
  number: string;
  year: number;
  title: string;
  summary: string;
  fileSize: string;
  dateEnacted: string;
  status: "Berlaku" | "Diubah" | "Dicabut";
  downloadUrl?: string;
}

const initialRegulations: RegulationItem[] = (regulationsData as any[]).map((r, i) => ({
  ...r,
  status: "Berlaku"
}));

export default function RegulasiPage() {
  const [regulations, setRegulations] = useState<RegulationItem[]>(initialRegulations);
  const [activeTab, setActiveTab] = useState<"katalog" | "cms">("katalog");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  
  // Modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState<RegulationItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    number: "",
    category: "Peraturan Daerah",
    year: new Date().getFullYear(),
    title: "",
    summary: "",
    dateEnacted: new Date().toISOString().split("T")[0],
    status: "Berlaku" as "Berlaku" | "Diubah" | "Dicabut",
    uploadedFile: null as File | null
  });

  // Filter for Katalog
  const filtered = regulations.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                        r.number.toLowerCase().includes(search.toLowerCase()) ||
                        r.summary.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Semua" || r.category === category;
    return matchSearch && matchCat;
  });

  // Handle Upload Submission
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number || !formData.title || !formData.summary) {
      alert("Harap lengkapi nomor peraturan, judul, dan ringkasan regulasi!");
      return;
    }

    const newId = `REG-${String(regulations.length + 1).padStart(3, "0")}`;
    const fileSizeFormatted = formData.uploadedFile 
      ? `${(formData.uploadedFile.size / (1024 * 1024)).toFixed(1)} MB` 
      : "2.4 MB";

    const newReg: RegulationItem = {
      id: newId,
      category: formData.category,
      number: formData.number,
      year: Number(formData.year) || 2026,
      title: formData.title,
      summary: formData.summary,
      fileSize: fileSizeFormatted,
      dateEnacted: formData.dateEnacted,
      status: formData.status
    };

    setRegulations([newReg, ...regulations]);
    setIsUploadOpen(false);
    // Reset
    setFormData({
      number: "",
      category: "Peraturan Daerah",
      year: new Date().getFullYear(),
      title: "",
      summary: "",
      dateEnacted: new Date().toISOString().split("T")[0],
      status: "Berlaku",
      uploadedFile: null
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data regulasi ini?")) {
      setRegulations(regulations.filter(r => r.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setRegulations(regulations.map(r => {
      if (r.id === id) {
        const nextStatus = r.status === "Berlaku" ? "Diubah" : r.status === "Diubah" ? "Dicabut" : "Berlaku";
        return { ...r, status: nextStatus };
      }
      return r;
    }));
  };

  // Columns for CMS Table
  const cmsColumns: ColumnDef<RegulationItem>[] = [
    {
      key: "number",
      label: "NOMOR & TAHUN",
      width: "180px",
      render: (row) => (
        <div>
          <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "2px 6px", borderRadius: "4px" }}>
            {row.number}
          </span>
          <div style={{ fontSize: "10px", color: "#64748B", marginTop: "3px" }}>
            Tahun {row.year}
          </div>
        </div>
      )
    },
    {
      key: "title",
      label: "JUDUL & TENTANG REGULASI",
      render: (row) => (
        <div>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", lineHeight: 1.35 }}>
            {row.title}
          </div>
          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontWeight: 700, color: "#0F2E5C" }}>{row.category}</span>
            <span>•</span>
            <span>Berkas: {row.fileSize}</span>
          </div>
        </div>
      )
    },
    {
      key: "dateEnacted",
      label: "DIUNDANGKAN",
      width: "120px",
      align: "center",
      render: (row) => (
        <span style={{ fontSize: "11px", color: "#475569", fontWeight: 600 }}>
          {row.dateEnacted}
        </span>
      )
    },
    {
      key: "status",
      label: "STATUS HUKUM",
      width: "110px",
      align: "center",
      render: (row) => (
        <span
          style={{
            fontSize: "10px",
            fontWeight: 800,
            padding: "3px 8px",
            borderRadius: "6px",
            backgroundColor: row.status === "Berlaku" ? "#DCFCE7" : row.status === "Diubah" ? "#FEF3C7" : "#FEE2E2",
            color: row.status === "Berlaku" ? "#166534" : row.status === "Diubah" ? "#92400E" : "#991B1B"
          }}
        >
          {row.status}
        </span>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <BookOpen style={{ width: "12px", height: "12px" }} /> Basis Hukum & Kebijakan SIPJAKI
            </span>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#166534", backgroundColor: "#DCFCE7", padding: "3px 10px", borderRadius: "9999px" }}>
              {regulations.filter(r => r.status === "Berlaku").length} Regulasi Berlaku
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Regulasi & Dasar Hukum Jasa Konstruksi
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
            Himpunan peraturan perundang-undangan daerah dan nasional terkait tertib pembinaan dan pengawasan jasa konstruksi
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
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
          <span>Unggah Regulasi Baru</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #E2E8F0", paddingBottom: "10px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("katalog")}
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
            backgroundColor: activeTab === "katalog" ? "#0F2E5C" : "transparent",
            color: activeTab === "katalog" ? "#FFFFFF" : "#64748B",
            transition: "all 0.15s ease"
          }}
        >
          <BookOpen style={{ width: "14px", height: "14px" }} />
          <span>Katalog Regulasi ({filtered.length})</span>
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
          <span>Manajemen Master Regulasi ({regulations.length})</span>
        </button>
      </div>

      {/* Tab 1: Katalog View */}
      {activeTab === "katalog" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Filter and Search Bar */}
          <div 
            style={{
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              padding: "16px 20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "14px"
            }}
          >
            <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
              <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94A3B8" }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nomor peraturan, judul regulasi, atau kata kunci..."
                style={{
                  width: "100%",
                  height: "42px",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#F8FAFC",
                  paddingLeft: "42px",
                  paddingRight: "16px",
                  fontSize: "13px",
                  color: "#0F172A",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#F1F5F9", padding: "4px", borderRadius: "10px", flexWrap: "wrap" }}>
              {["Semua", "Peraturan Daerah", "Undang-Undang", "Peraturan Menteri PUPR", "Surat Edaran Bupati"].map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: 800,
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: isSelected ? "#0F2E5C" : "transparent",
                      color: isSelected ? "#FFFFFF" : "#475569",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Regulations List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {filtered.map((reg) => (
              <div 
                key={reg.id} 
                style={{
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0",
                  backgroundColor: "#FFFFFF",
                  padding: "22px 24px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "18px",
                  transition: "border-color 0.15s ease"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "820px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 800, backgroundColor: "#EBF2FA", color: "#0F2E5C", padding: "3px 8px", borderRadius: "6px" }}>
                      {reg.number}
                    </span>
                    <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 700 }}>
                      • {reg.category} (Tahun {reg.year})
                    </span>
                    <span 
                      style={{
                        fontSize: "10px",
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: "6px",
                        backgroundColor: reg.status === "Berlaku" ? "#DCFCE7" : "#FEF3C7",
                        color: reg.status === "Berlaku" ? "#166534" : "#92400E"
                      }}
                    >
                      {reg.status}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0, lineHeight: 1.35 }}>
                    {reg.title}
                  </h3>
                  <p style={{ fontSize: "12px", color: "#475569", margin: 0, lineHeight: 1.5 }}>
                    {reg.summary}
                  </p>
                  <p style={{ fontSize: "11px", color: "#94A3B8", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                    <Calendar style={{ width: "12px", height: "12px" }} /> Diundangkan: {reg.dateEnacted}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                  <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#64748B", fontWeight: 600 }}>{reg.fileSize}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedReg(reg)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      borderRadius: "10px",
                      backgroundColor: "#FFFFFF",
                      color: "#0F2E5C",
                      border: "1px solid #CBD5E1",
                      padding: "8px 14px",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: "pointer"
                    }}
                  >
                    <Eye style={{ width: "14px", height: "14px" }} />
                    <span>Pratinjau</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => alert(`Mengunduh salinan berkas resmi ${reg.number} (PDF, ${reg.fileSize})...`)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      borderRadius: "10px",
                      backgroundColor: "#0F2E5C",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "9px 16px",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <Download style={{ width: "14px", height: "14px", color: "#FFC000" }} />
                    <span>Unduh PDF</span>
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E2E8F0", padding: "48px 24px", textAlign: "center", color: "#94A3B8", fontSize: "13px" }}>
                Tidak ada dokumen regulasi yang sesuai dengan pencarian Anda.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: CMS Management Table */}
      {activeTab === "cms" && (
        <DataTableView<RegulationItem>
          title="Tabel Master Regulasi Jasa Konstruksi Daerah & Nasional"
          subtitle="Basis data perundang-undangan acuan tertib pembinaan & audit pengawasan SIMAK"
          data={regulations}
          columns={cmsColumns}
          exportFileName="regulasi-jasa-konstruksi-bogor"
          actionsHeader="AKSI KELOLA"
          actionsRender={(row) => (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <button
                type="button"
                title="Lihat Detail & Pratinjau"
                onClick={() => setSelectedReg(row)}
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
                title="Ganti Status Hukum (Berlaku / Diubah / Dicabut)"
                onClick={() => handleToggleStatus(row.id)}
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: row.status === "Berlaku" ? "#FEF3C7" : row.status === "Diubah" ? "#FEE2E2" : "#DCFCE7",
                  color: row.status === "Berlaku" ? "#92400E" : row.status === "Diubah" ? "#991B1B" : "#166534",
                  fontSize: "10px",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                {row.status === "Berlaku" ? "Ubah" : row.status === "Diubah" ? "Cabut" : "Aktifkan"}
              </button>
              <button
                type="button"
                title="Unduh Salinan PDF"
                onClick={() => alert(`Mengunduh berkas ${row.number}...`)}
                style={{
                  padding: "6px",
                  borderRadius: "6px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#F8FAFC",
                  color: "#0F2E5C",
                  cursor: "pointer"
                }}
              >
                <Download style={{ width: "14px", height: "14px" }} />
              </button>
              <button
                type="button"
                title="Hapus Regulasi"
                onClick={() => handleDelete(row.id)}
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

      {/* Modal Unggah Regulasi Baru */}
      <ModalForm
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Unggah Dokumen Regulasi Baru"
        subtitle="Tambahkan peraturan perundang-undangan dasar hukum pembinaan jasa konstruksi"
        icon={BookOpen}
        size="lg"
        submitLabel="Simpan & Publikasikan Regulasi"
        onSubmit={handleUploadSubmit}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
                Nomor Peraturan / Regulasi <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Perbup Bogor No. 12 Tahun 2026"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
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
                Kategori Regulasi
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
                <option value="Peraturan Daerah">Peraturan Daerah (Perda)</option>
                <option value="Undang-Undang">Undang-Undang (UU)</option>
                <option value="Peraturan Pemerintah">Peraturan Pemerintah (PP)</option>
                <option value="Peraturan Menteri PUPR">Peraturan Menteri PUPR</option>
                <option value="Surat Edaran Bupati">Surat Edaran Bupati</option>
                <option value="Keputusan Kepala Dinas">Keputusan Kepala Dinas</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
                Tahun Terbit
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
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
                Tanggal Diundangkan
              </label>
              <input
                type="date"
                value={formData.dateEnacted}
                onChange={(e) => setFormData({ ...formData, dateEnacted: e.target.value })}
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
                Status Keberlakuan
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
                <option value="Berlaku">Berlaku Aktif</option>
                <option value="Diubah">Diubah</option>
                <option value="Dicabut">Dicabut</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
              Judul / Tentang Regulasi <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Petunjuk Pelaksanaan Audit Kelaikan Bangunan Gedung dan Penerapan SMKK"
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

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
              Ringkasan Kebijakan & Pokok Pengaturan <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Jelaskan ruang lingkup, sasaran kewajiban, dan substansi utama regulasi..."
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

          {/* File Uploader */}
          <div>
            <FileUploader
              label="Berkas Salinan Resmi Dokumen (PDF)"
              accept=".pdf"
              maxSizeMb={15}
              hint="Format berkas resmi salinan Lembaran Daerah atau Berita Negara (PDF). Maksimal 15MB."
              onFileSelect={(file) => setFormData({ ...formData, uploadedFile: file })}
            />
          </div>
        </div>
      </ModalForm>

      {/* Modal Pratinjau Detail Regulasi */}
      {selectedReg && (
        <ModalForm
          isOpen={!!selectedReg}
          onClose={() => setSelectedReg(null)}
          title={selectedReg.number}
          subtitle={`${selectedReg.category} • Tahun ${selectedReg.year}`}
          icon={BookOpen}
          size="lg"
          hideFooter
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "12px", borderBottom: "1px solid #E2E8F0" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  padding: "4px 10px",
                  borderRadius: "6px",
                  backgroundColor: selectedReg.status === "Berlaku" ? "#DCFCE7" : "#FEF3C7",
                  color: selectedReg.status === "Berlaku" ? "#166534" : "#92400E"
                }}
              >
                Status: {selectedReg.status}
              </span>
              <span style={{ fontSize: "12px", color: "#64748B" }}>
                Diundangkan: {selectedReg.dateEnacted}
              </span>
            </div>

            <div>
              <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: "0 0 8px 0", lineHeight: 1.4 }}>
                {selectedReg.title}
              </h4>
              <div style={{ backgroundColor: "#F8FAFC", borderRadius: "10px", padding: "14px", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                  Pokok-Pokok Pengaturan
                </span>
                <p style={{ fontSize: "12px", color: "#334155", margin: 0, lineHeight: 1.6 }}>
                  {selectedReg.summary}
                </p>
              </div>
            </div>

            <div style={{ padding: "14px", borderRadius: "10px", backgroundColor: "#EFF6FF", border: "1px dashed #93C5FD", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FileText style={{ width: "24px", height: "24px", color: "#1D4ED8" }} />
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: "#1E3A8A" }}>
                    Salinan Dokumen Lembaran Daerah (PDF)
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748B" }}>
                    Ukuran Berkas: {selectedReg.fileSize} • Terverifikasi Otentik
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => alert(`Mengunduh dokumen ${selectedReg.number}...`)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  backgroundColor: "#0F2E5C",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: "11px",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                <Download style={{ width: "13px", height: "13px", color: "#FFC000" }} />
                <span>Unduh</span>
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setSelectedReg(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  backgroundColor: "#E2E8F0",
                  color: "#334155",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </ModalForm>
      )}
    </div>
  );
}

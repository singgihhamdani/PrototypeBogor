"use client";
import React, { useState } from "react";
import { 
  BookOpen, Search, Download, Calendar, FileText, 
  Plus, CheckCircle2, Eye, Trash2, ShieldCheck, 
  Layers, Filter, ArrowUpRight, Scale, ExternalLink,
  CheckCircle, AlertCircle, Building2, HardHat, FileSpreadsheet
} from "lucide-react";
import regulationsData from "@/data/regulations.json";
import DataTableView, { ColumnDef } from "@/components/common/data-table-view";
import ModalForm from "@/components/common/modal-form";
import FileUploader from "@/components/common/file-uploader";
import BatchImportModal from "@/components/common/batch-import-modal";
import DocStatusBadge from "@/components/common/doc-status-badge";
import DocumentUploadMiniModal from "@/components/common/document-upload-mini-modal";
import DocCompletionBar from "@/components/common/doc-completion-bar";
import { TEMPLATE_REGULASI } from "@/lib/sipjaki-templates";
import { logDataActivity } from "@/lib/audit-log";
import { useResponsive } from "@/lib/use-responsive";

export interface RegulationItem {
  id: string;
  category: string;
  number: string;
  year: number;
  title: string;
  summary: string;
  policyMandate?: string;
  relatedModules?: string[];
  fileSize: string;
  dateEnacted: string;
  status: "Berlaku" | "Diubah" | "Dicabut";
  downloadUrl?: string;
  _docStatus?: "complete" | "pending";
}

const initialRegulations: RegulationItem[] = (regulationsData as any[]).map((r) => ({
  ...r,
  status: r.status || "Berlaku",
  _docStatus: r.downloadUrl ? "complete" : "pending"
}));

const CATEGORIES = [
  "Semua",
  "Undang-Undang",
  "Peraturan Pemerintah",
  "Peraturan Presiden",
  "Peraturan Menteri PUPR",
  "Peraturan Daerah Provinsi",
  "Peraturan Daerah Kab. Bogor",
  "Surat Edaran Dirjen",
  "Surat Edaran Bupati",
  "SOP & Pedoman Teknis"
];

export default function RegulasiPage() {
  const { isMobile, isMounted } = useResponsive();
  const [regulations, setRegulations] = useState<RegulationItem[]>(initialRegulations);
  const [activeTab, setActiveTab] = useState<"katalog" | "cms">("katalog");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  
  // Modal states & Batch Import
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isBatchImportOpen, setIsBatchImportOpen] = useState(false);
  const [docUploadTarget, setDocUploadTarget] = useState<RegulationItem | null>(null);
  const [filterDocPending, setFilterDocPending] = useState(false);
  const [selectedReg, setSelectedReg] = useState<RegulationItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    number: "",
    category: "Peraturan Daerah Kab. Bogor",
    year: new Date().getFullYear(),
    title: "",
    summary: "",
    policyMandate: "",
    relatedModules: "Pengawasan 3 Tertib, Database BUJK",
    dateEnacted: new Date().toISOString().split("T")[0],
    status: "Berlaku" as "Berlaku" | "Diubah" | "Dicabut",
    uploadedFile: null as File | null
  });

  // Filter for Katalog
  const filtered = regulations.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = 
      r.title.toLowerCase().includes(q) || 
      r.number.toLowerCase().includes(q) ||
      r.summary.toLowerCase().includes(q) ||
      (r.policyMandate && r.policyMandate.toLowerCase().includes(q)) ||
      (r.relatedModules && r.relatedModules.some(m => m.toLowerCase().includes(q)));
      
    const matchCat = category === "Semua" || r.category === category;
    const matchDoc = !filterDocPending || r._docStatus === "pending" || !r.downloadUrl;
    return matchSearch && matchCat && matchDoc;
  });

  // Filter for CMS
  const filteredCms = regulations.filter((r) => {
    const matchDoc = !filterDocPending || r._docStatus === "pending" || !r.downloadUrl;
    return matchDoc;
  });

  const handleBatchCommit = (parsedRows: any[]) => {
    const formatted: RegulationItem[] = parsedRows.map((row, idx) => ({
      id: `REG-${String(regulations.length + idx + 1).padStart(3, "0")}`,
      number: row.number || `Regulasi Baru No. ${idx + 1}`,
      title: row.title || "Regulasi Jasa Konstruksi",
      category: row.category || "Peraturan Daerah Kab. Bogor",
      year: Number(row.year) || 2026,
      dateEnacted: row.dateEnacted || new Date().toISOString().split("T")[0],
      summary: row.summary || "Dasar regulasi dan kebijakan teknis jasa konstruksi.",
      policyMandate: row.policyMandate || "Mandat pengawasan tertib jasa konstruksi.",
      relatedModules: ["Pengawasan 3 Tertib"],
      fileSize: "2.5 MB",
      downloadUrl: row.downloadUrl || "",
      status: (row.status as any) || "Berlaku",
      _docStatus: row._docStatus || "pending"
    }));
    setRegulations([...formatted, ...regulations]);
    logDataActivity({
      action: "import",
      module: "Regulasi & Kebijakan",
      format: "xlsx",
      recordCount: formatted.length,
      user: "Bagian Hukum & Pembina Jakon",
      status: "success",
      fileName: `${TEMPLATE_REGULASI.exportFileName}.xlsx`,
      details: `Impor batch ${formatted.length} regulasi kebijakan - dokumen naskah PDF dapat disusulkan`
    });
    alert(`Berhasil mengimpor ${formatted.length} data regulasi! Dokumen PDF lembaran resmi dapat diunggah menyusul.`);
  };

  const handleSaveUploadedDoc = (files: Record<string, File | null>, fileNames: Record<string, string>) => {
    if (!docUploadTarget) return;
    const newDocName = fileNames["downloadUrl"] || docUploadTarget.downloadUrl || `${docUploadTarget.number.replace(/[/\\?%*:|"<>]/g, "_")}.pdf`;
    setRegulations((prev) =>
      prev.map((item) => {
        if (item.id === docUploadTarget.id) {
          return {
            ...item,
            downloadUrl: newDocName,
            _docStatus: "complete"
          };
        }
        return item;
      })
    );
    logDataActivity({
      action: "doc_upload",
      module: "Regulasi & Kebijakan",
      format: "pdf",
      recordCount: 1,
      user: "Bagian Hukum & Pembina Jakon",
      status: "success",
      fileName: newDocName,
      details: `Upload dokumen salinan PDF regulasi: ${docUploadTarget.number}`
    });
    alert(`Dokumen "${newDocName}" berhasil diunggah! Status kelengkapan regulasi diperbarui menjadi Lengkap.`);
    setDocUploadTarget(null);
  };

  // Download Handler
  const handleDownload = (reg: RegulationItem) => {
    if (reg.downloadUrl) {
      const link = document.createElement("a");
      link.href = reg.downloadUrl;
      link.download = `${reg.number.replace(/[/\\?%*:|"<>]/g, "-")}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`Mengunduh salinan berkas resmi ${reg.number} (${reg.fileSize})...\n\nDokumen resmi tersimpan dalam arsip hukum Sub-Urusan Jasa Konstruksi DPU Kab. Bogor.`);
    }
  };

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

    const modulesList = formData.relatedModules
      ? formData.relatedModules.split(",").map(m => m.trim()).filter(Boolean)
      : ["Pengawasan 3 Tertib"];

    const newReg: RegulationItem = {
      id: newId,
      category: formData.category,
      number: formData.number,
      year: Number(formData.year) || 2026,
      title: formData.title,
      summary: formData.summary,
      policyMandate: formData.policyMandate || "Dasar kebijakan pembinaan dan pengawasan jasa konstruksi Kabupaten Bogor.",
      relatedModules: modulesList,
      fileSize: fileSizeFormatted,
      dateEnacted: formData.dateEnacted,
      status: formData.status,
      downloadUrl: formData.uploadedFile ? formData.uploadedFile.name : "",
      _docStatus: formData.uploadedFile ? "complete" : "pending"
    };

    setRegulations([newReg, ...regulations]);
    setIsUploadOpen(false);
    // Reset
    setFormData({
      number: "",
      category: "Peraturan Daerah Kab. Bogor",
      year: new Date().getFullYear(),
      title: "",
      summary: "",
      policyMandate: "",
      relatedModules: "Pengawasan 3 Tertib, Database BUJK",
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
      width: "200px",
      render: (row) => (
        <div>
          <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "2px 6px", borderRadius: "4px" }}>
            {row.number}
          </span>
          <div style={{ fontSize: "10px", color: "#64748B", marginTop: "3px" }}>
            Tahun {row.year} • {row.category}
          </div>
        </div>
      )
    },
    {
      key: "title",
      label: "JUDUL & DASAR KEBIJAKAN SISTEM",
      render: (row) => (
        <div>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", lineHeight: 1.35 }}>
            {row.title}
          </div>
          {row.policyMandate && (
            <div style={{ fontSize: "11px", color: "#1E3A8A", backgroundColor: "#EFF6FF", padding: "4px 8px", borderRadius: "6px", marginTop: "5px", lineHeight: 1.4 }}>
              <strong>Mandat:</strong> {row.policyMandate.length > 120 ? row.policyMandate.substring(0, 120) + "..." : row.policyMandate}
            </div>
          )}
          <div style={{ fontSize: "10px", color: "#64748B", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span>Ukuran: {row.fileSize}</span>
          </div>
        </div>
      )
    },
    {
      key: "downloadUrl",
      label: "BERKAS SALINAN",
      width: "160px",
      align: "center",
      render: (row) => (
        <DocStatusBadge
          status={row._docStatus || (row.downloadUrl ? "complete" : "pending")}
          fileName={row.downloadUrl}
          documentLabel="Naskah PDF"
          onClick={() => setDocUploadTarget(row)}
        />
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
      label: "STATUS",
      width: "100px",
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
      {/* Header Banner */}
      <div 
        style={{ 
          display: "flex", 
          alignItems: "flex-start", 
          justifyContent: "space-between", 
          flexWrap: "wrap", 
          gap: "16px",
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          padding: isMounted && isMobile ? "18px 16px" : "24px 28px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
        }}
      >
        <div style={{ maxWidth: "800px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "4px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Scale style={{ width: "13px", height: "13px" }} /> Landasan Kebijakan & Regulasi Hukum
            </span>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#166534", backgroundColor: "#DCFCE7", padding: "4px 10px", borderRadius: "9999px" }}>
              {regulations.filter(r => r.status === "Berlaku").length} Dokumen Berlaku Aktif
            </span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#92400E", backgroundColor: "#FEF3C7", padding: "4px 10px", borderRadius: "9999px" }}>
              Rujukan KAK & Sub-Urusan Jasa Konstruksi
            </span>
          </div>
          <h1 style={{ fontSize: isMounted && isMobile ? "20px" : "24px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Dasar Kebijakan & Regulasi Jasa Konstruksi
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "6px 0 0 0", lineHeight: 1.5 }}>
            Himpunan peraturan perundang-undangan dari tingkat Undang-Undang, Peraturan Pemerintah, Permen PUPR, Perda Jawa Barat, hingga Perda & Surat Edaran Bupati Bogor yang menjadi landasan mandat operasional sistem SIJAKON.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setIsBatchImportOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#FFFFFF",
              color: "#0F2E5C",
              border: "1px solid #CBD5E1",
              borderRadius: "10px",
              padding: "10px 16px",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
            }}
          >
            <FileSpreadsheet style={{ width: "16px", height: "16px", color: "#10B981" }} />
            <span>Import Batch (Excel)</span>
          </button>

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
          <span>Katalog & Dasar Kebijakan ({filtered.length})</span>
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
          <span>Kelola Master Regulasi ({regulations.length})</span>
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
              flexDirection: "column",
              gap: "14px"
            }}
          >
            <div style={{ position: "relative", width: "100%" }}>
              <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94A3B8" }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nomor peraturan, judul regulasi, kata kunci mandat, atau modul terkait..."
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

            {/* Category Pills (Horizontal Scroll on Mobile) */}
            <div 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "6px", 
                backgroundColor: "#F8FAFC", 
                padding: "6px", 
                borderRadius: "10px", 
                border: "1px solid #E2E8F0",
                overflowX: "auto",
                whiteSpace: "nowrap"
              }}
            >
              {CATEGORIES.map((cat) => {
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
                      transition: "all 0.15s ease",
                      flexShrink: 0
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Regulations List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filtered.map((reg) => (
              <div 
                key={reg.id} 
                style={{
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0",
                  backgroundColor: "#FFFFFF",
                  padding: isMounted && isMobile ? "18px 16px" : "22px 24px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
                  display: "flex",
                  flexDirection: isMounted && isMobile ? "column" : "row",
                  alignItems: isMounted && isMobile ? "stretch" : "flex-start",
                  justifyContent: "space-between",
                  gap: "18px",
                  transition: "border-color 0.15s ease"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                  {/* Meta Tag Line */}
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
                    {reg.downloadUrl && (
                      <span style={{ fontSize: "10px", fontWeight: 800, color: "#1D4ED8", backgroundColor: "#EFF6FF", padding: "2px 8px", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                        <CheckCircle style={{ width: "10px", height: "10px" }} /> Berkas Resmi
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0, lineHeight: 1.35 }}>
                    {reg.title}
                  </h3>

                  {/* Summary */}
                  <p style={{ fontSize: "12px", color: "#475569", margin: 0, lineHeight: 1.55 }}>
                    {reg.summary}
                  </p>

                  {/* Policy Mandate Box (Highlights the Legal Rationale) */}
                  {reg.policyMandate && (
                    <div 
                      style={{
                        backgroundColor: "#F8FAFC",
                        borderRadius: "10px",
                        borderLeft: "4px solid #0F2E5C",
                        borderTop: "1px solid #E2E8F0",
                        borderRight: "1px solid #E2E8F0",
                        borderBottom: "1px solid #E2E8F0",
                        padding: "12px 14px"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <ShieldCheck style={{ width: "14px", height: "14px", color: "#0F2E5C" }} />
                        <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                          Dasar Kebijakan & Mandat Sistem SIJAKON:
                        </span>
                      </div>
                      <p style={{ fontSize: "12px", color: "#1E293B", margin: 0, lineHeight: 1.55 }}>
                        {reg.policyMandate}
                      </p>

                      {/* Related Modules */}
                      {reg.relatedModules && reg.relatedModules.length > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748B" }}>Modul Terkait:</span>
                          {reg.relatedModules.map((mod, idx) => (
                            <span 
                              key={idx}
                              style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "#0F2E5C",
                                backgroundColor: "#EBF2FA",
                                padding: "2px 8px",
                                borderRadius: "6px"
                              }}
                            >
                              {mod}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <p style={{ fontSize: "11px", color: "#94A3B8", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                    <Calendar style={{ width: "12px", height: "12px" }} /> Diundangkan: {reg.dateEnacted}
                  </p>
                </div>

                {/* Action Buttons */}
                <div 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px", 
                    flexShrink: 0,
                    width: isMounted && isMobile ? "100%" : "auto",
                    justifyContent: isMounted && isMobile ? "space-between" : "flex-end",
                    borderTop: isMounted && isMobile ? "1px solid #F1F5F9" : "none",
                    paddingTop: isMounted && isMobile ? "12px" : "0"
                  }}
                >
                  <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#64748B", fontWeight: 600 }}>
                    {reg.fileSize}
                  </span>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <DocStatusBadge
                      status={reg._docStatus || (reg.downloadUrl ? "complete" : "pending")}
                      fileName={reg.downloadUrl}
                      documentLabel="Naskah PDF"
                      onClick={() => setDocUploadTarget(reg)}
                    />

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
                      <span>Detail</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownload(reg)}
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
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Indikator Kelengkapan Dokumen */}
          <DocCompletionBar
            records={regulations}
            label="Kelengkapan Berkas Salinan Resmi Regulasi (PDF)"
            filterActive={filterDocPending}
            onToggleFilter={() => setFilterDocPending(!filterDocPending)}
          />

          <DataTableView<RegulationItem>
            title={`Tabel Master Regulasi Jasa Konstruksi Daerah & Nasional (${filteredCms.length})`}
            subtitle="Basis data perundang-undangan acuan tertib pembinaan & audit pengawasan SIMAK"
            data={filteredCms}
            columns={cmsColumns}
            exportFileName="regulasi-jasa-konstruksi-bogor"
            sipjakiTemplate={TEMPLATE_REGULASI}
            exportColumns={TEMPLATE_REGULASI.columns}
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
                onClick={() => handleDownload(row)}
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
        </div>
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
          <div style={{ display: "grid", gridTemplateColumns: isMounted && isMobile ? "1fr" : "1.2fr 1fr", gap: "14px" }}>
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
                {CATEGORIES.filter(c => c !== "Semua").map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMounted && isMobile ? "1fr" : "1fr 1fr 1fr", gap: "14px" }}>
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
              Ringkasan Pokok Pengaturan <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <textarea
              required
              rows={2}
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

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
              Dasar Kebijakan & Mandat Sistem SIJAKON
            </label>
            <textarea
              rows={2}
              value={formData.policyMandate}
              onChange={(e) => setFormData({ ...formData, policyMandate: e.target.value })}
              placeholder="Jelaskan implikasi spesifik regulasi ini terhadap pembinaan DPU dan fitur SIJAKON..."
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
              Modul Terkait di SIJAKON (pisahkan dengan koma)
            </label>
            <input
              type="text"
              placeholder="Contoh: Pengawasan 3 Tertib, Database BUJK, Pelatihan TKK"
              value={formData.relatedModules}
              onChange={(e) => setFormData({ ...formData, relatedModules: e.target.value })}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "13px"
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "12px", borderBottom: "1px solid #E2E8F0", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                {selectedReg.downloadUrl && (
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#1D4ED8", backgroundColor: "#EFF6FF", padding: "4px 10px", borderRadius: "6px" }}>
                    ✓ Berkas Resmi Otentik
                  </span>
                )}
              </div>
              <span style={{ fontSize: "12px", color: "#64748B" }}>
                Diundangkan: {selectedReg.dateEnacted}
              </span>
            </div>

            <div>
              <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: "0 0 10px 0", lineHeight: 1.4 }}>
                {selectedReg.title}
              </h4>
              
              {/* Pokok Pengaturan */}
              <div style={{ backgroundColor: "#F8FAFC", borderRadius: "10px", padding: "14px", border: "1px solid #E2E8F0", marginBottom: "12px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Ringkasan Pokok Pengaturan
                </span>
                <p style={{ fontSize: "12.5px", color: "#334155", margin: 0, lineHeight: 1.6 }}>
                  {selectedReg.summary}
                </p>
              </div>

              {/* Dasar Kebijakan & Mandat Sistem */}
              {selectedReg.policyMandate && (
                <div style={{ backgroundColor: "#EFF6FF", borderRadius: "10px", padding: "16px", border: "1px solid #BFDBFE" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                    <ShieldCheck style={{ width: "16px", height: "16px", color: "#1E3A8A" }} />
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#1E3A8A", textTransform: "uppercase" }}>
                      Dasar Kebijakan & Mandat Sistem SIJAKON:
                    </span>
                  </div>
                  <p style={{ fontSize: "12.5px", color: "#1E293B", margin: 0, lineHeight: 1.65 }}>
                    {selectedReg.policyMandate}
                  </p>

                  {selectedReg.relatedModules && selectedReg.relatedModules.length > 0 && (
                    <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px dashed #93C5FD", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#1E3A8A" }}>
                        Modul & Fitur yang Terikat:
                      </span>
                      {selectedReg.relatedModules.map((m, idx) => (
                        <span key={idx} style={{ fontSize: "11px", fontWeight: 700, color: "#0F2E5C", backgroundColor: "#FFFFFF", padding: "3px 8px", borderRadius: "6px", border: "1px solid #CBD5E1" }}>
                          {m}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Document Download Box */}
            <div style={{ padding: "14px", borderRadius: "10px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FileText style={{ width: "26px", height: "26px", color: "#0F2E5C" }} />
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: "#0F172A" }}>
                    Salinan Dokumen Lembaran Resmi (PDF)
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748B" }}>
                    Ukuran Berkas: {selectedReg.fileSize} {selectedReg.downloadUrl ? "• Berkas Asli Tersimpan di Server" : "• Arsip Legal Dinas PU"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDownload(selectedReg)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
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
                <Download style={{ width: "14px", height: "14px", color: "#FFC000" }} />
                <span>Unduh Salinan PDF</span>
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

      {/* Mini Modal Unggah Dokumen Susulan */}
      {docUploadTarget && (
        <DocumentUploadMiniModal
          isOpen={!!docUploadTarget}
          onClose={() => setDocUploadTarget(null)}
          title={`Unggah Naskah Regulasi: ${docUploadTarget.number}`}
          documentFields={TEMPLATE_REGULASI.documentFields || []}
          existingDocuments={{
            downloadUrl: docUploadTarget.downloadUrl
          }}
          onSave={handleSaveUploadedDoc}
        />
      )}

      {/* Modal Batch Import Excel */}
      <BatchImportModal
        isOpen={isBatchImportOpen}
        onClose={() => setIsBatchImportOpen(false)}
        template={TEMPLATE_REGULASI}
        onCommit={handleBatchCommit}
      />
    </div>
  );
}

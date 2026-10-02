"use client";
import { useState } from "react";
import Link from "next/link";
import { 
  Package, Search, Download, Plus, Eye, TrendingUp, 
  DollarSign, Calendar, CheckCircle2, Award, FileSpreadsheet,
  UploadCloud, FileText, Check, AlertCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import projectsData from "@/data/projects.json";
import { 
  StatusBadge, FileUploader, DataTableView, 
  ModalForm, ColumnDef 
} from "@/components/common";
import BatchImportModal, { BatchColumnDef } from "@/components/common/batch-import-modal";
import { exportToSpreadsheet } from "@/lib/export-utils";
import { TEMPLATE_PAKET_PEKERJAAN } from "@/lib/sipjaki-templates";

const paketBatchColumns: BatchColumnDef[] = [
  { key: "id", label: "ID Paket", required: true, example: "P005" },
  { key: "name", label: "Nama Paket Pekerjaan", required: true, example: "Pembangunan Jembatan Gantung Desa Karang Asem" },
  { key: "source", label: "Sumber Dana", required: true, example: "APBD" },
  { key: "contractor", label: "Kontraktor Pelaksana", required: true, example: "PT. Graha Cipta Prima" },
  { key: "contractValue", label: "Nilai Kontrak (Rp)", required: true, example: "2450000000" },
  { key: "status", label: "Status Proyek", required: false, example: "Pelaksanaan" }
];

const sampleBatchPaket = [
  { id: "P005", name: "Pembangunan Jembatan Gantung Desa Karang Asem", source: "APBD", contractor: "PT. Graha Cipta Prima", contractValue: "2450000000", status: "Pelaksanaan" },
  { id: "P006", name: "Rehabilitasi Saluran Sekunder Cileungsi Hulu", source: "DAK", contractor: "CV. Tirta Mandiri Jaya", contractValue: "1250000000", status: "Pelaksanaan" }
];

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
  contractType: string;
  contractChar: string;
  startDate: string;
  endDate: string;
  physProgress: number;
  physMonth: string;
  finProgress: number;
  finMonth: string;
  districtId: string;
  lat: number;
  lng: number;
  planProgress: number[];
  realProgress: number[];
}

export default function PaketPekerjaanPage() {
  const [projects, setProjects] = useState<ProjectItem[]>(projectsData as ProjectItem[]);
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");

  // Modal Import Excel State
  const [showImportModal, setShowImportModal] = useState(false);

  // Modal Tambah Paket State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formId, setFormId] = useState(`P00${projects.length + 1}`);
  const [formName, setFormName] = useState("");
  const [formSource, setFormSource] = useState("APBD");
  const [formOwner, setFormOwner] = useState("DPU Kab. Bogor");
  const [formContractor, setFormContractor] = useState("");
  const [formNib, setFormNib] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formStartDate, setFormStartDate] = useState("2026-04-01");
  const [formEndDate, setFormEndDate] = useState("2026-11-30");

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                        p.contractor.toLowerCase().includes(search.toLowerCase()) || 
                        p.id.toLowerCase().includes(search.toLowerCase());
    const matchSource = filterSource === "Semua" || p.source === filterSource;
    const matchStatus = filterStatus === "Semua" || p.status === filterStatus;
    return matchSearch && matchSource && matchStatus;
  });

  const totalValue = projects.reduce((acc, curr) => acc + curr.contractValue, 0);
  const avgProgress = projects.length > 0 
    ? Math.round(projects.reduce((acc, curr) => acc + curr.physProgress, 0) / projects.length)
    : 0;

  const handleBatchCommit = (parsedData: Record<string, any>[]) => {
    const newItems: ProjectItem[] = parsedData.map((d, i) => ({
      id: d.id || `P00${projects.length + i + 1}`,
      name: d.name || "Paket Baru",
      fiscalYear: 2026,
      source: d.source || "APBD",
      owner: "DPU Kab. Bogor",
      contractor: d.contractor || "PT Kontraktor Lokal",
      contractorId: `B0${9 + i}`,
      nib: "9876543210987",
      contractValue: Number(String(d.contractValue).replace(/\D/g, "")) || 1000000000,
      status: d.status || "Pelaksanaan",
      contractType: "Konstruksi",
      contractChar: "Harga Satuan",
      startDate: "2026-04-15",
      endDate: "2026-10-30",
      physProgress: 15,
      physMonth: "April",
      finProgress: 20,
      finMonth: "April",
      districtId: "01",
      lat: -6.48,
      lng: 106.85,
      planProgress: [0, 10, 25, 45, 65, 85, 100],
      realProgress: [0, 15, 0, 0, 0, 0, 0]
    }));

    setProjects((prev) => [...newItems, ...prev]);
    alert(`Berhasil mengimpor ${newItems.length} paket pekerjaan ke dalam sistem!`);
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formContractor || !formValue) {
      alert("Mohon lengkapi Nama Paket, Kontraktor, dan Nilai Kontrak!");
      return;
    }

    const valNum = parseInt(formValue.replace(/\D/g, ""), 10);
    if (isNaN(valNum) || valNum <= 0) {
      alert("Nilai kontrak harus berupa angka valid!");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newProj: ProjectItem = {
        id: formId,
        name: formName,
        fiscalYear: 2026,
        source: formSource,
        owner: formOwner,
        contractor: formContractor,
        contractorId: `B${Date.now().toString().slice(-3)}`,
        nib: formNib || "3201000000000",
        contractValue: valNum,
        status: "Pelaksanaan",
        contractType: "Konstruksi",
        contractChar: "Harga Satuan",
        startDate: formStartDate,
        endDate: formEndDate,
        physProgress: 0,
        physMonth: "Maret",
        finProgress: 0,
        finMonth: "Maret",
        districtId: "01",
        lat: -6.48,
        lng: 106.85,
        planProgress: [0, 15, 35, 60, 85, 100],
        realProgress: [0, 0, 0, 0, 0, 0]
      };

      setProjects([newProj, ...projects]);
      setIsSubmitting(false);
      setShowAddModal(false);
      setFormName("");
      setFormContractor("");
      setFormValue("");
      alert(`Paket Pekerjaan "${formName}" berhasil ditambahkan!`);
    }, 600);
  };

  const columns: ColumnDef<ProjectItem>[] = [
    {
      key: "id",
      label: "KODE & NAMA PAKET",
      sortable: true,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 800, backgroundColor: "#F1F5F9", color: "#475569", padding: "2px 6px", borderRadius: "4px" }}>
              {row.id}
            </span>
            <Link href={`/paket-pekerjaan/${row.id}`} style={{ fontWeight: 800, color: "#0F2E5C", textDecoration: "none", fontSize: "13px" }}>
              {row.name}
            </Link>
          </div>
          <span style={{ fontSize: "11px", color: "#64748B" }}>
            Jadwal: {row.startDate} s/d {row.endDate}
          </span>
        </div>
      )
    },
    {
      key: "source",
      label: "SUMBER & OPD",
      sortable: true,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 800, backgroundColor: "#EBF2FA", color: "#0F2E5C", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", width: "fit-content" }}>
            {row.source}
          </span>
          <span style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>{row.owner}</span>
        </div>
      )
    },
    {
      key: "contractor",
      label: "PENYEDIA JASA",
      sortable: true,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#1E293B" }}>{row.contractor}</span>
          <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#64748B" }}>NIB: {row.nib}</span>
        </div>
      )
    },
    {
      key: "contractValue",
      label: "NILAI KONTRAK",
      align: "right",
      sortable: true,
      render: (row) => (
        <span style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: 800, color: "#0F172A" }}>
          {formatCurrency(row.contractValue)}
        </span>
      )
    },
    {
      key: "physProgress",
      label: "PROGRES FISIK",
      align: "center",
      sortable: true,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "90px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontWeight: 800, color: "#0F2E5C", fontSize: "12px" }}>{row.physProgress}%</span>
          </div>
          <div style={{ width: "100%", height: "6px", backgroundColor: "#F1F5F9", borderRadius: "9999px", overflow: "hidden", marginTop: "4px" }}>
            <div 
              style={{ 
                width: `${row.physProgress}%`, 
                height: "100%", 
                backgroundColor: row.physProgress >= 100 ? "#059669" : row.physProgress > 50 ? "#0F2E5C" : "#D97706",
                borderRadius: "9999px" 
              }} 
            />
          </div>
        </div>
      )
    },
    {
      key: "status",
      label: "STATUS",
      align: "center",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} size="sm" showDot />
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 10px", borderRadius: "9999px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              SIPJAKI Master Data • Pilar 2 Penyelenggaraan
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Paket Pekerjaan Konstruksi Kab. Bogor
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
            Pemantauan progres fisik, realisasi keuangan, dan Kurva-S proyek APBD/DAK TA 2026 (Format Sinkronisasi SIPJAKI)
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
              padding: "10px 18px",
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
              fileName: TEMPLATE_PAKET_PEKERJAAN.exportFileName,
              sheetName: TEMPLATE_PAKET_PEKERJAAN.sheetName,
              columns: TEMPLATE_PAKET_PEKERJAAN.columns,
              data: projects,
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
              padding: "10px 18px",
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
            onClick={() => setShowAddModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "12px",
              backgroundColor: "#0F2E5C",
              border: "none",
              borderBottom: "3px solid #FFC000",
              padding: "10px 20px",
              fontSize: "12px",
              fontWeight: 800,
              color: "#FFFFFF",
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(15, 46, 92, 0.2)"
            }}
          >
            <Plus style={{ width: "16px", height: "16px", color: "#FFC000" }} />
            <span>Tambah Paket</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards (UI/UX Standardized) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        {/* Card 1: Total Paket */}
        <div
          style={{
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #0F2E5C",
            backgroundColor: "#FFFFFF",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Total Paket Proyek
            </span>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#EBF2FA",
                color: "#0F2E5C",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <Package style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#0F2E5C", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {projects.length} Paket
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10B981" }} />
              <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>
                Tahun Anggaran 2026
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Nilai Kontrak */}
        <div
          style={{
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #2563EB",
            backgroundColor: "#FFFFFF",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Total Nilai Kontrak
            </span>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#DBEAFE",
                color: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <DollarSign style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "#2563EB", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {formatCurrency(totalValue)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ fontSize: "11px", color: "#64748B" }}>
                APBD, DAK & APBN
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Rata-rata Progres Fisik */}
        <div
          style={{
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #059669",
            backgroundColor: "#FFFFFF",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Progres Fisik Rata-rata
            </span>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#DCFCE7",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <TrendingUp style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#059669", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {avgProgress}%
            </div>
            <div style={{ marginTop: "10px" }}>
              <div style={{ width: "100%", height: "6px", backgroundColor: "#E2E8F0", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ width: `${avgProgress}%`, height: "100%", backgroundColor: "#059669", borderRadius: "999px" }} />
              </div>
              <span style={{ fontSize: "11px", color: "#166534", fontWeight: 700, marginTop: "4px", display: "inline-block" }}>
                Bulan Pelaporan: Agustus 2026
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Sinkronisasi SIPJAKI */}
        <div
          style={{
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #D97706",
            backgroundColor: "#FFFFFF",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Sinkronisasi SIPJAKI
            </span>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#FEF3C7",
                color: "#D97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <CheckCircle2 style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#D97706", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              100% Valid
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#D97706" }} />
              <span style={{ fontSize: "11px", color: "#D97706", fontWeight: 700 }}>
                RMPK / SMKK Terverifikasi
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Quick Bar */}
      <div
        style={{
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#F1F5F9", padding: "4px", borderRadius: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", padding: "0 6px" }}>SUMBER:</span>
            {["Semua", "APBD", "DAK", "APBN"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterSource(s)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: filterSource === s ? "#0F2E5C" : "transparent",
                  color: filterSource === s ? "#FFFFFF" : "#475569",
                  transition: "all 0.15s ease"
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#F1F5F9", padding: "4px", borderRadius: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", padding: "0 6px" }}>STATUS:</span>
            {["Semua", "Pelaksanaan", "Selesai"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: filterStatus === st ? "#0F2E5C" : "transparent",
                  color: filterStatus === st ? "#FFFFFF" : "#475569",
                  transition: "all 0.15s ease"
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div style={{ width: "100%", maxWidth: "260px" }}>
          <input
            type="text"
            placeholder="Cari paket / kontraktor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              height: "34px",
              borderRadius: "8px",
              border: "1px solid #CBD5E1",
              padding: "0 12px",
              fontSize: "12px",
              outline: "none"
            }}
          />
        </div>
      </div>

      {/* DataTableView */}
      <DataTableView<ProjectItem>
        title={`Daftar Paket Pekerjaan Konstruksi (${filtered.length})`}
        subtitle="Data paket proyek fisik APBD/DAK dengan status pelaporan progres Kurva-S"
        data={filtered}
        columns={columns}
        defaultPageSize={10}
        exportFileName="Paket_Pekerjaan_Bogor_2026"
        sipjakiTemplate={TEMPLATE_PAKET_PEKERJAAN}
        exportColumns={TEMPLATE_PAKET_PEKERJAAN.columns}
        actionsHeader="AKSI"
        actionsRender={(row) => (
          <Link
            href={`/paket-pekerjaan/${row.id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              borderRadius: "8px",
              backgroundColor: "#EBF2FA",
              color: "#0F2E5C",
              padding: "6px 12px",
              fontSize: "11px",
              fontWeight: 800,
              textDecoration: "none"
            }}
          >
            <Eye style={{ width: "13px", height: "13px" }} />
            <span>Detail / Kurva-S</span>
          </Link>
        )}
      />

      {/* Reusable Batch Import Modal */}
      <BatchImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Batch Paket Pekerjaan (Excel/CSV)"
        subtitle="Unggah berkas rekapitulasi paket pekerjaan sesuai format standar SIPJAKI"
        templateFileName="template_paket_pekerjaan_sipjaki.csv"
        expectedColumns={paketBatchColumns}
        sampleRows={sampleBatchPaket}
        onCommit={handleBatchCommit}
      />

      {/* Modal Form Tambah Paket Baru */}
      <ModalForm
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tambah Paket Pekerjaan Baru"
        subtitle="Input data kontrak proyek konstruksi TA 2026"
        onSubmit={handleAddProject}
        submitLabel="Simpan Paket Pekerjaan"
        isLoading={isSubmitting}
        size="lg"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                ID Paket <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
                style={{ width: "100%", height: "38px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Nama Paket Pekerjaan <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Peningkatan Jalan Ciawi - Megamendung"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                style={{ width: "100%", height: "38px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "12px", outline: "none" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Nilai Kontrak (Rp) <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="number"
                required
                placeholder="Contoh: 3500000000"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                style={{ width: "100%", height: "38px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Sumber Pendanaan
              </label>
              <select
                value={formSource}
                onChange={(e) => setFormSource(e.target.value)}
                style={{ width: "100%", height: "38px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="APBD">APBD Kab. Bogor</option>
                <option value="DAK">DAK Fisik</option>
                <option value="APBN">APBN / Banprov</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Kontraktor Pelaksana (BUJK) <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="PT / CV Penyedia Jasa"
                value={formContractor}
                onChange={(e) => setFormContractor(e.target.value)}
                style={{ width: "100%", height: "38px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Nomor Induk Berusaha (NIB)
              </label>
              <input
                type="text"
                placeholder="Contoh: 1234567890123"
                value={formNib}
                onChange={(e) => setFormNib(e.target.value)}
                style={{ width: "100%", height: "38px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "12px", outline: "none" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Tanggal Mulai Kontrak
              </label>
              <input
                type="date"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                style={{ width: "100%", height: "38px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "12px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Tanggal Selesai Kontrak
              </label>
              <input
                type="date"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                style={{ width: "100%", height: "38px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "12px", outline: "none" }}
              />
            </div>
          </div>
        </div>
      </ModalForm>

      {/* Batch Import Modal (SIPJAKI Validator) */}
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

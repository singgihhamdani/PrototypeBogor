"use client";
import React, { useState, useMemo } from "react";
import ModuleHeader from "@/components/layout/module-header";
import { TertibType, TERTIB_CONFIGS } from "@/lib/tertib-config";
import { mockPelaksanaanRecords, PelaksanaanRecord } from "@/data/tertib-mock-data";
import { 
  ClipboardCheck, Plus, Download, FileText, CheckCircle2, 
  Search, ShieldCheck, Filter, ArrowUpRight, Award, 
  AlertCircle, XCircle, Printer, Eye, Trash2, Calendar, 
  MapPin, Building2, HardHat, FileSpreadsheet, Sparkles, 
  Check, X, RefreshCw
} from "lucide-react";
import DataTableView, { ColumnDef } from "@/components/common/data-table-view";
import ModalForm from "@/components/common/modal-form";
import FileUploader from "@/components/common/file-uploader";
import VerificationDialog from "@/components/common/verification-dialog";
import StatusBadge from "@/components/common/status-badge";
import { exportToSpreadsheet } from "@/lib/export-utils";
import { TEMPLATE_PELAKSANAAN } from "@/lib/sipjaki-templates";

interface PelaksanaanViewProps {
  tertibType: TertibType;
}

export default function PelaksanaanView({ tertibType }: PelaksanaanViewProps) {
  const config = TERTIB_CONFIGS[tertibType];
  
  // State data utama
  const [data, setData] = useState<PelaksanaanRecord[]>(() => 
    mockPelaksanaanRecords.filter((r) => r.tertibType === tertibType)
  );
  
  // Filter States
  const [activeVariant, setActiveVariant] = useState<string>("Semua");
  const [filterStatus, setFilterStatus] = useState<string>("Semua");
  const [filterTahun, setFilterTahun] = useState<string>("2026");

  // Modal States
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isBapModalOpen, setIsBapModalOpen] = useState(false);
  const [selectedRecordForBap, setSelectedRecordForBap] = useState<PelaksanaanRecord | null>(null);

  // Verification Dialog States
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState<PelaksanaanRecord | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Form State untuk Audit SIMAK Baru
  const [auditForm, setAuditForm] = useState({
    simakCode: config.simakVariants[0]?.code || "SIMAK 1a1",
    namaObjek: "",
    badanUsaha: "",
    lokasi: "Kecamatan Cibinong",
    tanggalAudit: new Date().toISOString().split("T")[0],
    pengawas: "Ir. Hendra Setiawan, S.T. (Tim Pembina Jakon)",
    // 5 Indikator Kepatuhan Checklist
    item1: true,
    item2: true,
    item3: false,
    item4: true,
    item5: true,
    catatanTemuan: "",
    rekomendasi: "",
    dokumenBapFile: null as File | null
  });

  // Hitung live score dari 5 indikator checklist
  const computedScore = useMemo(() => {
    const items = [auditForm.item1, auditForm.item2, auditForm.item3, auditForm.item4, auditForm.item5];
    const trueCount = items.filter(Boolean).length;
    return Math.round((trueCount / items.length) * 100);
  }, [auditForm.item1, auditForm.item2, auditForm.item3, auditForm.item4, auditForm.item5]);

  const computedKategori = useMemo((): "Tertib" | "Cukup Tertib" | "Kurang Tertib" => {
    if (computedScore >= 80) return "Tertib";
    if (computedScore >= 60) return "Cukup Tertib";
    return "Kurang Tertib";
  }, [computedScore]);

  // Dynamic checklist label per tertib type
  const checklistLabels = useMemo(() => {
    if (tertibType === "tertib-usaha") {
      return [
        "Kepemilikan Perizinan Berusaha Berbasis Risiko (NIB & OSS-RBA)",
        "Keabsahan Sertifikat Badan Usaha (SBU) sesuai Klasifikasi & Kualifikasi",
        "Kesesuaian Tenaga Kerja Konstruksi Bersertifikat (SKK Konstruksi Aktif)",
        "Penerapan Sistem Manajemen Keselamatan Konstruksi (SMKK Tingkat Badan Usaha)",
        "Kesesuaian Kapasitas Finansial & Peralatan Kerja Faktual di Lapangan"
      ];
    } else if (tertibType === "tertib-penyelenggaraan") {
      return [
        "Kelengkapan Dokumen Kontrak Kerja Konstruksi, SPMK, & Jaminan Pelaksanaan",
        "Kepatuhan Penerapan Rencana Keselamatan Konstruksi (RKK, APD, & Rambu K3)",
        "Penempatan Tenaga Ahli / Terampil Bersertifikat SKK Sesuai Penawaran Kontrak",
        "Kepatuhan Pengendalian Mutu (Job Mix Formula, Uji Tekan, & Pengujian Lapangan)",
        "Dokumentasi Progress Fisik Mingguan (Kurva-S), Laporan Harian, & As-Built Drawing"
      ];
    } else {
      return [
        "Kesesuaian Pemanfaatan Fungsi Bangunan terhadap Izin Persetujuan Bangunan (PBG)",
        "Kepemilikan dan Keberlakuan Sertifikat Laik Fungsi (SLF)",
        "Ketersediaan Dokumen As-Built Drawing & Manual Pengoperasian Pemeliharaan",
        "Penerapan SOP Pemeliharaan Berkala Struktur, Mekanikal, & Elektrikal",
        "Ketersediaan Alokasi Anggaran & Tim Operasional Pemeliharaan (O&P)"
      ];
    }
  }, [tertibType]);

  // Filtered Records
  const filteredData = data.filter((item) => {
    const matchVariant = activeVariant === "Semua" || item.simakCode === activeVariant;
    const matchStatus = filterStatus === "Semua" || 
      (filterStatus === "pending" && item.statusVerifikasi === "Draft") ||
      (filterStatus === "verified" && item.statusVerifikasi === "Terverifikasi") ||
      (filterStatus === "rejected" && item.statusVerifikasi === "Ditolak");
    return matchVariant && matchStatus;
  });

  // Calculate Stats
  const statTotal = data.length;
  const statPending = data.filter((r) => r.statusVerifikasi === "Draft").length;
  const statVerified = data.filter((r) => r.statusVerifikasi === "Terverifikasi").length;
  const statRejected = data.filter((r) => r.statusVerifikasi === "Ditolak").length;

  // Handle Form Submission Audit Baru
  const handleSaveAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditForm.namaObjek || !auditForm.badanUsaha) {
      alert("Harap lengkapi nama objek pengawasan dan badan usaha / pelaksana!");
      return;
    }

    const newId = `PEL-${tertibType === "tertib-usaha" ? "TU" : tertibType === "tertib-penyelenggaraan" ? "TP" : "TM"}-${String(data.length + 1).padStart(3, "0")}`;
    const newRecord: PelaksanaanRecord = {
      id: newId,
      simakCode: auditForm.simakCode,
      tertibType: tertibType,
      namaObjek: auditForm.namaObjek,
      badanUsaha: auditForm.badanUsaha,
      lokasi: auditForm.lokasi,
      tanggalAudit: auditForm.tanggalAudit,
      pengawas: auditForm.pengawas,
      skorTertib: computedScore,
      kategoriHasil: computedKategori,
      statusVerifikasi: "Draft",
      dokumenBAP: `BAP_${auditForm.simakCode.replace(/\s+/g, "_")}_${auditForm.badanUsaha.replace(/[^a-zA-Z0-9]/g, "")}.pdf`
    };

    setData([newRecord, ...data]);
    setIsAuditModalOpen(false);

    // Reset Form
    setAuditForm({
      simakCode: config.simakVariants[0]?.code || "SIMAK 1a1",
      namaObjek: "",
      badanUsaha: "",
      lokasi: "Kecamatan Cibinong",
      tanggalAudit: new Date().toISOString().split("T")[0],
      pengawas: "Ir. Hendra Setiawan, S.T. (Tim Pembina Jakon)",
      item1: true,
      item2: true,
      item3: false,
      item4: true,
      item5: true,
      catatanTemuan: "",
      rekomendasi: "",
      dokumenBapFile: null
    });
  };

  // Handle Verification Confirm
  const handleConfirmVerification = (decision: "sesuai" | "tidak_sesuai", notes: string) => {
    if (!verifyTarget) return;
    setIsVerifying(true);

    setTimeout(() => {
      setData((prev) =>
        prev.map((r) => {
          if (r.id === verifyTarget.id) {
            return {
              ...r,
              statusVerifikasi: decision === "sesuai" ? "Terverifikasi" : "Ditolak"
            };
          }
          return r;
        })
      );

      setIsVerifying(false);
      setIsVerifyOpen(false);
      setVerifyTarget(null);
    }, 400);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data hasil pengawasan SIMAK ini?")) {
      setData((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Columns for DataTableView
  const tableColumns: ColumnDef<PelaksanaanRecord>[] = [
    {
      key: "simakCode",
      label: "VARIAN SIMAK",
      width: "120px",
      render: (row) => (
        <span style={{ fontSize: "11px", fontWeight: 900, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "4px 8px", borderRadius: "6px", fontFamily: "monospace" }}>
          {row.simakCode}
        </span>
      )
    },
    {
      key: "namaObjek",
      label: "OBJEK & BADAN USAHA",
      render: (row) => (
        <div>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", lineHeight: 1.35 }}>
            {row.namaObjek}
          </div>
          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "3px", display: "flex", alignItems: "center", gap: "4px" }}>
            <Building2 style={{ width: "11px", height: "11px" }} />
            <span>{row.badanUsaha}</span>
          </div>
        </div>
      )
    },
    {
      key: "lokasi",
      label: "LOKASI & TANGGAL",
      width: "190px",
      render: (row) => (
        <div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "flex", alignItems: "center", gap: "4px" }}>
            <MapPin style={{ width: "11px", height: "11px", color: "#64748B" }} />
            <span>{row.lokasi}</span>
          </div>
          <div style={{ fontSize: "10px", color: "#94A3B8", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
            <Calendar style={{ width: "10px", height: "10px" }} />
            <span>Audit: {row.tanggalAudit}</span>
          </div>
        </div>
      )
    },
    {
      key: "skorTertib",
      label: "SKOR TERTIB",
      width: "140px",
      align: "center",
      render: (row) => {
        const isGood = row.skorTertib >= 80;
        const isMid = row.skorTertib >= 60 && row.skorTertib < 80;
        return (
          <div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 900,
                padding: "3px 10px",
                borderRadius: "8px",
                backgroundColor: isGood ? "#DCFCE7" : isMid ? "#FEF3C7" : "#FEE2E2",
                color: isGood ? "#166534" : isMid ? "#92400E" : "#991B1B",
                display: "inline-block"
              }}
            >
              {row.skorTertib}%
            </span>
            <div style={{ fontSize: "10px", fontWeight: 700, color: isGood ? "#166534" : isMid ? "#92400E" : "#991B1B", marginTop: "2px" }}>
              {row.kategoriHasil}
            </div>
          </div>
        );
      }
    },
    {
      key: "dokumenBAP",
      label: "BERITA ACARA (BAP)",
      width: "180px",
      render: (row) => (
        <button
          type="button"
          onClick={() => {
            setSelectedRecordForBap(row);
            setIsBapModalOpen(true);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            background: "none",
            border: "none",
            color: "#2563EB",
            fontSize: "11px",
            fontWeight: 700,
            cursor: "pointer",
            padding: 0,
            textAlign: "left"
          }}
        >
          <FileText style={{ width: "13px", height: "13px", flexShrink: 0 }} />
          <span style={{ textDecoration: "underline", wordBreak: "break-all" }}>{row.dokumenBAP}</span>
        </button>
      )
    },
    {
      key: "statusVerifikasi",
      label: "STATUS VERIFIKASI",
      width: "140px",
      align: "center",
      render: (row) => (
        <StatusBadge
          status={row.statusVerifikasi}
        />
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Module Header */}
      <ModuleHeader
        breadcrumbs={[
          { label: config.shortTitle, href: config.basePath },
          { label: "Pelaksanaan Pengawasan" }
        ]}
        badgeText={config.pilar}
        badgeBg={config.badgeBg}
        badgeColor={config.badgeColor}
        title={`Pelaksanaan Pengawasan Lapangan — ${config.shortTitle}`}
        description={`Audit kepatuhan teknis berbasis form SIMAK elektronik baku (${config.simakVariants.map(v => v.code).join(", ")}).`}
        legalBasis={config.legalBasis}
        actionButtons={[
          {
            label: "Buat Audit SIMAK Baru",
            icon: Plus,
            variant: "primary",
            onClick: () => setIsAuditModalOpen(true)
          },
          {
            label: "Export SIPJAKI (XLSX)",
            icon: Download,
            onClick: () => exportToSpreadsheet({
              fileName: `${TEMPLATE_PELAKSANAAN.exportFileName}_${tertibType}`,
              sheetName: TEMPLATE_PELAKSANAAN.sheetName,
              columns: TEMPLATE_PELAKSANAAN.columns,
              data: filteredData,
              sipjakiMode: true,
              includeDataDictionary: true,
              dictionaryItems: TEMPLATE_PELAKSANAAN.dictionaryItems
            })
          }
        ]}
      />

      {/* Top 4 Summary Stat Cards (Modern UI/UX Revamped) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
        {/* Card 1: Total Pemeriksaan */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #2563EB",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Total Pemeriksaan
              </span>
              <span style={{ display: "block", fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>
                Audit Lapangan SIMAK
              </span>
            </div>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#EFF6FF",
                color: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <ClipboardCheck style={{ width: "20px", height: "20px" }} />
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#0F2E5C", margin: 0, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              {statTotal} Objek
            </h3>
          </div>

          <div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #F1F5F9" }}>
            <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Tahun Anggaran {filterTahun}</span>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#1E40AF", backgroundColor: "#DBEAFE", padding: "2px 8px", borderRadius: "9999px" }}>
              SIMAK Baku
            </span>
          </div>
        </div>

        {/* Card 2: Menunggu Verifikasi */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #F59E0B",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Menunggu Verifikasi
              </span>
              <span style={{ display: "block", fontSize: "11px", color: "#D97706", fontWeight: 700, marginTop: "2px" }}>
                Perlu Tindakan Pengawas
              </span>
            </div>
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
              <AlertCircle style={{ width: "20px", height: "20px" }} />
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#D97706", margin: 0, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              {statPending} Draft
            </h3>
          </div>

          <div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #F1F5F9" }}>
            <span style={{ fontSize: "11px", color: "#D97706", fontWeight: 700 }}>Menunggu Review</span>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#92400E", backgroundColor: "#FEF3C7", padding: "2px 8px", borderRadius: "9999px" }}>
              Antrian
            </span>
          </div>
        </div>

        {/* Card 3: Terverifikasi (Verified) */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #10B981",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Terverifikasi (Verified)
              </span>
              <span style={{ display: "block", fontSize: "11px", color: "#166534", fontWeight: 700, marginTop: "2px" }}>
                Sah & Siap Sinkron SIPJAKI
              </span>
            </div>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#DCFCE7",
                color: "#166534",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <CheckCircle2 style={{ width: "20px", height: "20px" }} />
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#166534", margin: 0, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              {statVerified} BAP
            </h3>
          </div>

          <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid #F1F5F9" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}>Tingkat Verifikasi</span>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#166534" }}>
                {statTotal > 0 ? Math.round((statVerified / statTotal) * 100) : 0}%
              </span>
            </div>
            <div style={{ width: "100%", height: "6px", backgroundColor: "#F1F5F9", borderRadius: "9999px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${statTotal > 0 ? Math.min(Math.round((statVerified / statTotal) * 100), 100) : 0}%`,
                  height: "100%",
                  backgroundColor: "#10B981",
                  borderRadius: "9999px"
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Ditolak / Investigasi */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #EF4444",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Ditolak / Perbaikan
              </span>
              <span style={{ display: "block", fontSize: "11px", color: "#DC2626", fontWeight: 700, marginTop: "2px" }}>
                Perlu Perbaikan Lapangan
              </span>
            </div>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#FEE2E2",
                color: "#DC2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <XCircle style={{ width: "20px", height: "20px" }} />
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#DC2626", margin: 0, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              {statRejected} Rekomendasi
            </h3>
          </div>

          <div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #F1F5F9" }}>
            <span style={{ fontSize: "11px", color: statRejected > 0 ? "#DC2626" : "#64748B", fontWeight: 700 }}>
              {statRejected > 0 ? "Perlu Tindak Lanjut" : "Nihil Temuan Kritis"}
            </span>
            <span style={{ fontSize: "10px", fontWeight: 800, color: statRejected > 0 ? "#991B1B" : "#166534", backgroundColor: statRejected > 0 ? "#FEE2E2" : "#DCFCE7", padding: "2px 8px", borderRadius: "9999px" }}>
              {statRejected > 0 ? "Temuan" : "Aman"}
            </span>
          </div>
        </div>
      </div>

      {/* Global Filter Bar */}
      <div 
        style={{
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div>
            <label style={{ fontSize: "10px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Filter Status Verifikasi
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                height: "36px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                padding: "0 10px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#1E293B"
              }}
            >
              <option value="Semua">Semua Status</option>
              <option value="pending">Menunggu Verifikasi (Draft)</option>
              <option value="verified">Terverifikasi (Verified)</option>
              <option value="rejected">Ditolak / Investigasi Lanjutan</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "10px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Tahun Anggaran
            </label>
            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              style={{
                height: "36px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                padding: "0 10px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#1E293B"
              }}
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setActiveVariant("Semua");
            setFilterStatus("Semua");
            setFilterTahun("2026");
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1px solid #CBD5E1",
            backgroundColor: "#F8FAFC",
            color: "#475569",
            fontSize: "11px",
            fontWeight: 800,
            cursor: "pointer"
          }}
        >
          <RefreshCw style={{ width: "12px", height: "12px" }} />
          <span>Reset Filter</span>
        </button>
      </div>

      {/* SIMAK Variant Scrollable Selector Chips */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          overflowX: "auto",
          padding: "10px",
          backgroundColor: "#FFFFFF",
          borderRadius: "14px",
          border: "1px solid #E2E8F0"
        }}
      >
        <button
          onClick={() => setActiveVariant("Semua")}
          style={{
            padding: "6px 14px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 800,
            cursor: "pointer",
            border: "none",
            backgroundColor: activeVariant === "Semua" ? "#0F2E5C" : "#F1F5F9",
            color: activeVariant === "Semua" ? "#FFFFFF" : "#64748B",
            whiteSpace: "nowrap"
          }}
        >
          Semua Form ({config.simakVariants.length})
        </button>
        {config.simakVariants.map((v) => (
          <button
            key={v.code}
            onClick={() => setActiveVariant(v.code)}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              border: "none",
              whiteSpace: "nowrap",
              backgroundColor: activeVariant === v.code ? "#0F2E5C" : "#F1F5F9",
              color: activeVariant === v.code ? "#FFFFFF" : "#64748B"
            }}
          >
            {v.code}: {v.label.split("(")[0]}
          </button>
        ))}
      </div>

      {/* Table DataTableView */}
      <DataTableView<PelaksanaanRecord>
        title={`Daftar Hasil Audit Lapangan SIMAK (${filteredData.length} Kegiatan)`}
        subtitle={`Audit kepatuhan pengawasan 3 tertib berbasis indikator baku Permen PUPR No. 1/2023`}
        data={filteredData}
        columns={tableColumns}
        exportFileName={`audit-simak-${tertibType}-bogor`}
        sipjakiTemplate={TEMPLATE_PELAKSANAAN}
        exportColumns={TEMPLATE_PELAKSANAAN.columns}
        actionsHeader="AKSI AUDIT"
        actionsRender={(row) => (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            {/* Tombol Verifikasi / Audit Dialog */}
            {row.statusVerifikasi === "Draft" ? (
              <button
                type="button"
                title="Lakukan Verifikasi / Validasi BAP"
                onClick={() => {
                  setVerifyTarget(row);
                  setIsVerifyOpen(true);
                }}
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#0F2E5C",
                  color: "#FFFFFF",
                  fontSize: "10px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <ShieldCheck style={{ width: "12px", height: "12px", color: "#FFC000" }} />
                <span>Verifikasi</span>
              </button>
            ) : (
              <span style={{ fontSize: "10px", color: "#166534", fontWeight: 800, backgroundColor: "#DCFCE7", padding: "3px 6px", borderRadius: "4px" }}>
                ✓ Terkunci
              </span>
            )}

            {/* Tombol Lihat Pratinjau BAP */}
            <button
              type="button"
              title="Lihat Pratinjau Dokumen BAP"
              onClick={() => {
                setSelectedRecordForBap(row);
                setIsBapModalOpen(true);
              }}
              style={{
                padding: "6px",
                borderRadius: "6px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#FFFFFF",
                color: "#0F2E5C",
                cursor: "pointer"
              }}
            >
              <Eye style={{ width: "13px", height: "13px" }} />
            </button>

            {/* Tombol Hapus */}
            <button
              type="button"
              title="Hapus Catatan Audit"
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
              <Trash2 style={{ width: "13px", height: "13px" }} />
            </button>
          </div>
        )}
      />

      {/* Modal Form Tambah Audit SIMAK Baru */}
      <ModalForm
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title={`Formulir Audit Lapangan SIMAK Elektronik`}
        subtitle={`Pengisian evaluasi kepatuhan teknis 5 indikator & kalkulasi otomatis indeks kepatuhan`}
        icon={ClipboardCheck}
        size="lg"
        submitLabel={`Simpan & Terbitkan Draft BAP (${computedScore}%)`}
        onSubmit={handleSaveAudit}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Header Scoring Live Meter */}
          <div style={{ backgroundColor: "#F0F7FF", border: "1px solid #BAE6FD", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#0369A1", textTransform: "uppercase" }}>
                Kalkulasi Indeks Kepatuhan Real-time
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "2px" }}>
                <span style={{ fontSize: "24px", fontWeight: 900, color: computedScore >= 80 ? "#166534" : computedScore >= 60 ? "#92400E" : "#991B1B" }}>
                  {computedScore}%
                </span>
                <span style={{ fontSize: "12px", fontWeight: 800, color: computedScore >= 80 ? "#166534" : computedScore >= 60 ? "#92400E" : "#991B1B" }}>
                  Status: {computedKategori}
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: "11px", color: "#475569" }}>
              Standar Permen PUPR 1/2023<br />
              <b>Kecamatan Kab. Bogor</b>
            </div>
          </div>

          {/* Identity Fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Varian Form SIMAK
              </label>
              <select
                value={auditForm.simakCode}
                onChange={(e) => setAuditForm({ ...auditForm, simakCode: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px"
                }}
              >
                {config.simakVariants.map((v) => (
                  <option key={v.code} value={v.code}>
                    {v.code} — {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Tanggal Audit Lapangan
              </label>
              <input
                type="date"
                value={auditForm.tanggalAudit}
                onChange={(e) => setAuditForm({ ...auditForm, tanggalAudit: e.target.value })}
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Nama Objek Pemeriksaan <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Audit Mutu Beton & SMKK Jembatan Ciawi Sta 1+200"
                value={auditForm.namaObjek}
                onChange={(e) => setAuditForm({ ...auditForm, namaObjek: e.target.value })}
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
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Badan Usaha / Pengelola Objek <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: PT. Adhi Beton Konstruksi / RSUD Ciawi"
                value={auditForm.badanUsaha}
                onChange={(e) => setAuditForm({ ...auditForm, badanUsaha: e.target.value })}
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Lokasi / Kecamatan di Kab. Bogor
              </label>
              <input
                type="text"
                value={auditForm.lokasi}
                onChange={(e) => setAuditForm({ ...auditForm, lokasi: e.target.value })}
                placeholder="Contoh: Kecamatan Cibinong"
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
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Nama Petugas Pengawas Jakon
              </label>
              <input
                type="text"
                value={auditForm.pengawas}
                onChange={(e) => setAuditForm({ ...auditForm, pengawas: e.target.value })}
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

          {/* 5 Checklist Indikator Evaluasi */}
          <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "14px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>
              Daftar Simak Evaluasi 5 Indikator Kepatuhan Teknis:
            </span>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { state: auditForm.item1, key: "item1", label: checklistLabels[0] },
                { state: auditForm.item2, key: "item2", label: checklistLabels[1] },
                { state: auditForm.item3, key: "item3", label: checklistLabels[2] },
                { state: auditForm.item4, key: "item4", label: checklistLabels[3] },
                { state: auditForm.item5, key: "item5", label: checklistLabels[4] },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setAuditForm({ ...auditForm, [item.key]: !item.state })}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: `1px solid ${item.state ? "#86EFAC" : "#CBD5E1"}`,
                    backgroundColor: item.state ? "#F0FDF4" : "#FFFFFF",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "6px",
                        backgroundColor: item.state ? "#16A34A" : "#E2E8F0",
                        color: item.state ? "#FFFFFF" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 900
                      }}
                    >
                      ✓
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: item.state ? "#166534" : "#475569" }}>
                      {idx + 1}. {item.label}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      padding: "3px 8px",
                      borderRadius: "6px",
                      backgroundColor: item.state ? "#DCFCE7" : "#FEE2E2",
                      color: item.state ? "#166534" : "#991B1B"
                    }}
                  >
                    {item.state ? "Sesuai / Patuh" : "Tidak Sesuai"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Catatan Temuan & Rekomendasi */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Uraian Temuan Ketidaksesuaian (Jika Ada)
              </label>
              <textarea
                rows={2}
                value={auditForm.catatanTemuan}
                onChange={(e) => setAuditForm({ ...auditForm, catatanTemuan: e.target.value })}
                placeholder="Tuliskan temuan faktual audit lapangan..."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "12px",
                  fontFamily: "inherit"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Rekomendasi Tindak Lanjut Tim Pengawas
              </label>
              <textarea
                rows={2}
                value={auditForm.rekomendasi}
                onChange={(e) => setAuditForm({ ...auditForm, rekomendasi: e.target.value })}
                placeholder="Rekomendasi tindakan korektif untuk rekanan..."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "12px",
                  fontFamily: "inherit"
                }}
              />
            </div>
          </div>

          {/* File Upload BAP Dokumen */}
          <FileUploader
            label="Unggah Berkas Bukti Lapangan / Scan BAP Fisik (PDF)"
            accept=".pdf"
            maxSizeMb={10}
            hint="Dokumen BAP bertanda tangan pengawas dan rekanan (PDF). Maksimal 10MB."
            onFileSelect={(file) => setAuditForm({ ...auditForm, dokumenBapFile: file })}
          />
        </div>
      </ModalForm>

      {/* Verification Dialog untuk Alur SweetAlert Style Approval */}
      {verifyTarget && (
        <VerificationDialog
          isOpen={isVerifyOpen}
          onClose={() => {
            setIsVerifyOpen(false);
            setVerifyTarget(null);
          }}
          target={{
            id: verifyTarget.id,
            title: `${verifyTarget.namaObjek} (${verifyTarget.simakCode})`,
            category: `Pelaksana: ${verifyTarget.badanUsaha} • Lokasi: ${verifyTarget.lokasi}`,
            notes: `Hasil Audit: ${verifyTarget.skorTertib}% (${verifyTarget.kategoriHasil}) • Dokumen BAP: ${verifyTarget.dokumenBAP}`,
            date: verifyTarget.tanggalAudit
          }}
          onConfirm={handleConfirmVerification}
          isLoading={isVerifying}
        />
      )}

      {/* Modal Pratinjau Dokumen BAP Resmi */}
      {selectedRecordForBap && (
        <ModalForm
          isOpen={isBapModalOpen}
          onClose={() => {
            setIsBapModalOpen(false);
            setSelectedRecordForBap(null);
          }}
          title={`Berita Acara Pemeriksaan (BAP) Pengawasan Lapangan`}
          subtitle={`${selectedRecordForBap.dokumenBAP} • ${selectedRecordForBap.simakCode}`}
          icon={FileText}
          size="lg"
          hideFooter
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Kop Surat Simulasi */}
            <div style={{ borderBottom: "2px solid #0F2E5C", paddingBottom: "12px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>
                Pemerintah Kabupaten Bogor — Dinas Pekerjaan Umum
              </span>
              <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#0F2E5C", margin: "4px 0" }}>
                BERITA ACARA PEMERIKSAAN PENGAWASAN JASA KONSTRUKSI
              </h3>
              <span style={{ fontSize: "11px", color: "#475569" }}>
                Nomor: 600.1.2/BAP-JAKON/{selectedRecordForBap.id}/2026 • Berdasarkan Permen PUPR No. 1/2023
              </span>
            </div>

            {/* BAP Details */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", backgroundColor: "#F8FAFC", padding: "14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
              <div>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700 }}>Objek Pengawasan:</span>
                <p style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", margin: "2px 0 0 0" }}>{selectedRecordForBap.namaObjek}</p>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700 }}>Badan Usaha / Penyedia:</span>
                <p style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", margin: "2px 0 0 0" }}>{selectedRecordForBap.badanUsaha}</p>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700 }}>Wilayah Pelaksanaan:</span>
                <p style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", margin: "2px 0 0 0" }}>{selectedRecordForBap.lokasi}</p>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700 }}>Tanggal Pemeriksaan:</span>
                <p style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", margin: "2px 0 0 0" }}>{selectedRecordForBap.tanggalAudit}</p>
              </div>
            </div>

            {/* Skor Hasil Kepatuhan */}
            <div style={{ padding: "12px 14px", borderRadius: "10px", backgroundColor: selectedRecordForBap.skorTertib >= 80 ? "#F0FDF4" : "#FFFBEB", border: `1px solid ${selectedRecordForBap.skorTertib >= 80 ? "#BBF7D0" : "#FDE68A"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#166534" }}>
                    Hasil Evaluasi Kepatuhan Tertib Lapangan:
                  </span>
                  <div style={{ fontSize: "13px", fontWeight: 900, color: "#0F2E5C", marginTop: "2px" }}>
                    Skor: {selectedRecordForBap.skorTertib}% — Kategori {selectedRecordForBap.kategoriHasil}
                  </div>
                </div>
                <StatusBadge
                  status={selectedRecordForBap.statusVerifikasi}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid #E2E8F0" }}>
              <span style={{ fontSize: "11px", color: "#64748B" }}>
                Pengawas: <b>{selectedRecordForBap.pengawas}</b>
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => alert(`Mencetak dokumen resmi ${selectedRecordForBap.dokumenBAP}...`)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    backgroundColor: "#FFFFFF",
                    color: "#0F2E5C",
                    fontSize: "11px",
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  <Printer style={{ width: "13px", height: "13px" }} />
                  <span>Cetak BAP</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Mengunduh file PDF ${selectedRecordForBap.dokumenBAP}...`)}
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
                  <span>Unduh PDF</span>
                </button>
              </div>
            </div>
          </div>
        </ModalForm>
      )}
    </div>
  );
}

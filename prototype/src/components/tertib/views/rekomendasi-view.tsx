"use client";
import React, { useState, useEffect, useMemo } from "react";
import ModuleHeader from "@/components/layout/module-header";
import { TertibType, TERTIB_CONFIGS } from "@/lib/tertib-config";
import { mockRekomendasiRecords, RekomendasiRecord } from "@/data/tertib-mock-data";
import { 
  StatusBadge, DataTableView, VerificationDialog, 
  VerificationTargetInfo, ColumnDef 
} from "@/components/common";
import ModalForm from "@/components/common/modal-form";
import FileUploader from "@/components/common/file-uploader";
import { 
  AlertTriangle, Plus, Download, ShieldCheck, CheckCircle2, 
  Clock, AlertCircle, FileText, Printer, Trash2, Eye, 
  Calendar, Building2, Send, Scale, Database as DbIcon, Loader2,
  Pencil, Search, ArrowUpDown, Filter, X, Check, Target, TrendingUp
} from "lucide-react";
import { exportToSpreadsheet } from "@/lib/export-utils";
import { TEMPLATE_REKOMENDASI } from "@/lib/sipjaki-templates";
import { 
  fetchRekomendasiList, updateTindakLanjutStatus, 
  DataSourceStatus 
} from "@/lib/services/pengawasan-service";

interface RekomendasiViewProps {
  tertibType: TertibType;
}

export default function RekomendasiView({ tertibType }: RekomendasiViewProps) {
  const config = TERTIB_CONFIGS[tertibType];
  const [data, setData] = useState<RekomendasiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState<DataSourceStatus>({
    source: "fallback",
    message: "Menghubungkan ke basis data..."
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchRekomendasiList(tertibType);
      setData(res.data);
      setDataStatus(res.status);
    } catch (err) {
      console.error("Gagal load rekomendasi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tertibType]);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterTindakLanjut, setFilterTindakLanjut] = useState<string>("Semua");
  const [filterVerifikasi, setFilterVerifikasi] = useState<string>("Semua");
  const [sortBy, setSortBy] = useState<"terkini" | "tenggat" | "status" | "nama">("terkini");

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<RekomendasiRecord | null>(null);
  const [selectedRecordForEdit, setSelectedRecordForEdit] = useState<RekomendasiRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<RekomendasiRecord | null>(null);

  // Verification Dialog state
  const [selectedRecordForVerify, setSelectedRecordForVerify] = useState<RekomendasiRecord | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Form State Penerbitan Surat Rekomendasi Baru
  const [formData, setFormData] = useState({
    badanUsahaAtauObjek: "",
    paketPekerjaan: "",
    lokasiProyek: "Kabupaten Bogor",
    tanggalSurat: new Date().toISOString().split("T")[0],
    temuanUtama: "",
    rekomendasiTindakan: "",
    tenggatWaktu: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    jenisPeringatan: "Peringatan Tertulis I" as const,
    catatanTambahan: "",
    uploadedSurat: null as File | null
  });

  // Form State Edit Rekomendasi
  const [editFormData, setEditFormData] = useState({
    badanUsahaAtauObjek: "",
    paketPekerjaan: "",
    lokasiProyek: "",
    tanggalSurat: "",
    temuanUtama: "",
    rekomendasiTindakan: "",
    tenggatWaktu: "",
    jenisPeringatan: "Peringatan Tertulis I" as const,
    statusTindakLanjut: "Dalam Proses" as const,
    statusVerifikasi: "Draft" as const,
    catatanVerifikator: ""
  });

  // Calculate Metrics & KPI Target vs Realisasi
  const totalRekomendasi = data.length;
  const dalamProses = data.filter((r) => r.statusTindakLanjut === "Dalam Proses").length;
  const selesaiPatuh = data.filter((r) => r.statusTindakLanjut === "Selesai & Patuh").length;
  const diberiSanksi = data.filter((r) => r.statusTindakLanjut === "Diberi Sanksi").length;
  const targetKepatuhanPct = 100; // Target standar regulasi: 100% temuan wajib diselesaikan
  const realisasiKepatuhanPct = totalRekomendasi > 0 ? Math.round((selesaiPatuh / totalRekomendasi) * 100) : 0;
  const onTrackCount = totalRekomendasi - diberiSanksi;

  // Filter & Sort Data (Default: Paket Pekerjaan Terkini DESC)
  const filteredData = useMemo(() => {
    let result = [...data];

    // Filter Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.badanUsahaAtauObjek.toLowerCase().includes(q) ||
          (r.paketPekerjaan && r.paketPekerjaan.toLowerCase().includes(q)) ||
          r.nomorSurat.toLowerCase().includes(q) ||
          r.temuanUtama.toLowerCase().includes(q) ||
          (r.lokasiProyek && r.lokasiProyek.toLowerCase().includes(q))
      );
    }

    // Filter Status Tindak Lanjut
    if (filterTindakLanjut !== "Semua") {
      result = result.filter((r) => r.statusTindakLanjut === filterTindakLanjut);
    }

    // Filter Status Verifikasi
    if (filterVerifikasi !== "Semua") {
      result = result.filter((r) => r.statusVerifikasi === filterVerifikasi);
    }

    // Sorting (Default: Terkini DESC)
    result.sort((a, b) => {
      if (sortBy === "terkini") {
        const dateA = a.tanggalSurat || "2026-01-01";
        const dateB = b.tanggalSurat || "2026-01-01";
        return dateB.localeCompare(dateA); // Terbaru ke terlama (DESC)
      } else if (sortBy === "tenggat") {
        return a.tenggatWaktu.localeCompare(b.tenggatWaktu); // Tenggat terdekat (ASC)
      } else if (sortBy === "status") {
        return a.statusTindakLanjut.localeCompare(b.statusTindakLanjut);
      } else if (sortBy === "nama") {
        return a.badanUsahaAtauObjek.localeCompare(b.badanUsahaAtauObjek);
      }
      return 0;
    });

    return result;
  }, [data, searchQuery, filterTindakLanjut, filterVerifikasi, sortBy]);

  // Handle Create Surat Rekomendasi
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.badanUsahaAtauObjek || !formData.temuanUtama || !formData.rekomendasiTindakan) {
      alert("Harap lengkapi nama badan usaha/paket, temuan audit, dan rekomendasi tindakan!");
      return;
    }

    const newId = `REK-${tertibType === "tertib-usaha" ? "TU" : tertibType === "tertib-penyelenggaraan" ? "TP" : "TM"}-${String(data.length + 1).padStart(3, "0")}`;
    const nomorSuratBaru = `600.1.2/${String(Math.floor(200 + Math.random() * 800))}/DPU-JAKON/2026`;

    const newRecord: RekomendasiRecord = {
      id: newId,
      nomorSurat: nomorSuratBaru,
      tertibType: tertibType,
      badanUsahaAtauObjek: formData.badanUsahaAtauObjek,
      paketPekerjaan: formData.paketPekerjaan || formData.badanUsahaAtauObjek,
      lokasiProyek: formData.lokasiProyek || "Kabupaten Bogor",
      tanggalSurat: formData.tanggalSurat,
      temuanUtama: formData.temuanUtama,
      rekomendasiTindakan: formData.rekomendasiTindakan,
      tenggatWaktu: formData.tenggatWaktu,
      jenisPeringatan: formData.jenisPeringatan,
      statusTindakLanjut: "Dalam Proses",
      statusVerifikasi: "Draft",
      catatanVerifikator: `Sifat: ${formData.jenisPeringatan}. Menunggu tindak lanjut rekanan sebelum tenggat waktu.`
    };

    setData([newRecord, ...data]);
    setIsCreateModalOpen(false);

    // Reset Form
    setFormData({
      badanUsahaAtauObjek: "",
      paketPekerjaan: "",
      lokasiProyek: "Kabupaten Bogor",
      tanggalSurat: new Date().toISOString().split("T")[0],
      temuanUtama: "",
      rekomendasiTindakan: "",
      tenggatWaktu: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      jenisPeringatan: "Peringatan Tertulis I",
      catatanTambahan: "",
      uploadedSurat: null
    });
  };

  // Open Edit Modal
  const handleOpenEdit = (record: RekomendasiRecord) => {
    setSelectedRecordForEdit(record);
    setEditFormData({
      badanUsahaAtauObjek: record.badanUsahaAtauObjek,
      paketPekerjaan: record.paketPekerjaan || record.badanUsahaAtauObjek,
      lokasiProyek: record.lokasiProyek || "Kabupaten Bogor",
      tanggalSurat: record.tanggalSurat || "2026-08-01",
      temuanUtama: record.temuanUtama,
      rekomendasiTindakan: record.rekomendasiTindakan,
      tenggatWaktu: record.tenggatWaktu,
      jenisPeringatan: (record.jenisPeringatan as any) || "Peringatan Tertulis I",
      statusTindakLanjut: (record.statusTindakLanjut as any) || "Dalam Proses",
      statusVerifikasi: (record.statusVerifikasi as any) || "Draft",
      catatanVerifikator: record.catatanVerifikator || ""
    });
  };

  // Handle Submit Edit Rekomendasi
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordForEdit) return;

    setData((prev) =>
      prev.map((item) =>
        item.id === selectedRecordForEdit.id
          ? {
              ...item,
              badanUsahaAtauObjek: editFormData.badanUsahaAtauObjek,
              paketPekerjaan: editFormData.paketPekerjaan,
              lokasiProyek: editFormData.lokasiProyek,
              tanggalSurat: editFormData.tanggalSurat,
              temuanUtama: editFormData.temuanUtama,
              rekomendasiTindakan: editFormData.rekomendasiTindakan,
              tenggatWaktu: editFormData.tenggatWaktu,
              jenisPeringatan: editFormData.jenisPeringatan,
              statusTindakLanjut: editFormData.statusTindakLanjut,
              statusVerifikasi: editFormData.statusVerifikasi,
              catatanVerifikator: editFormData.catatanVerifikator
            }
          : item
      )
    );

    setSelectedRecordForEdit(null);
  };

  // Handle Delete with Safety Confirmation
  const handleConfirmDelete = () => {
    if (!recordToDelete) return;
    setData((prev) => prev.filter((r) => r.id !== recordToDelete.id));
    setRecordToDelete(null);
  };

  const handleOpenVerify = (record: RekomendasiRecord) => {
    setSelectedRecordForVerify(record);
  };

  const handleConfirmVerify = async (decision: "sesuai" | "tidak_sesuai", notes: string) => {
    if (!selectedRecordForVerify) return;
    setIsVerifying(true);

    const isApproved = decision === "sesuai";
    const newStatusTL = isApproved ? "Selesai & Patuh" : "Diberi Sanksi";
    await updateTindakLanjutStatus(selectedRecordForVerify.id, newStatusTL);

    setData((prev) =>
      prev.map((r) =>
        r.id === selectedRecordForVerify.id
          ? {
              ...r,
              statusVerifikasi: isApproved ? "Terverifikasi" : "Ditolak",
              statusTindakLanjut: newStatusTL,
              catatanVerifikator: notes || (isApproved ? "Tindakan perbaikan diterima penuh." : "Dikenakan sanksi peringatan lanjutan.")
            }
          : r
      )
    );

    setIsVerifying(false);
    setSelectedRecordForVerify(null);
  };

  // Table Columns Definition
  const columns: ColumnDef<RekomendasiRecord>[] = [
    {
      key: "nomorSurat",
      label: "NOMOR SURAT, TANGGAL & PAKET PEKERJAAN",
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "3px", maxWidth: "340px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: 900, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "2px 7px", borderRadius: "5px", fontFamily: "monospace" }}>
              {row.nomorSurat}
            </span>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748B", display: "inline-flex", alignItems: "center", gap: "3px" }}>
              <Calendar style={{ width: "11px", height: "11px", color: "#3B82F6" }} />
              {row.tanggalSurat || "2026-08-01"}
            </span>
          </div>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", marginTop: "2px", lineHeight: 1.3 }}>
            {row.paketPekerjaan || row.badanUsahaAtauObjek}
          </div>
          <div style={{ fontSize: "11px", color: "#64748B", display: "flex", alignItems: "center", gap: "4px" }}>
            <Building2 style={{ width: "11px", height: "11px", color: "#94A3B8" }} />
            <span>{row.badanUsahaAtauObjek}</span>
            {row.lokasiProyek && <span style={{ color: "#94A3B8" }}>• {row.lokasiProyek}</span>}
          </div>
        </div>
      )
    },
    {
      key: "temuanUtama",
      label: "TEMUAN & REKOMENDASI TINDAKAN",
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxWidth: "350px" }}>
          {row.jenisPeringatan && (
            <span style={{ 
              fontSize: "10px", 
              fontWeight: 800, 
              alignSelf: "flex-start",
              padding: "1px 6px", 
              borderRadius: "4px",
              backgroundColor: row.jenisPeringatan.includes("II") || row.jenisPeringatan.includes("Penghentian") ? "#FEE2E2" : "#FEF3C7",
              color: row.jenisPeringatan.includes("II") || row.jenisPeringatan.includes("Penghentian") ? "#DC2626" : "#D97706",
              border: `1px solid ${row.jenisPeringatan.includes("II") || row.jenisPeringatan.includes("Penghentian") ? "#FCA5A5" : "#FDE68A"}`
            }}>
              {row.jenisPeringatan}
            </span>
          )}
          <div style={{ fontSize: "11px", color: "#DC2626", fontWeight: 700, display: "flex", alignItems: "flex-start", gap: "4px" }}>
            <AlertTriangle style={{ width: "12px", height: "12px", flexShrink: 0, marginTop: "1px" }} />
            <span>Temuan: {row.temuanUtama}</span>
          </div>
          <div style={{ fontSize: "11px", color: "#334155", fontWeight: 600 }}>
            👉 Rekomendasi: {row.rekomendasiTindakan}
          </div>
        </div>
      )
    },
    {
      key: "tenggatWaktu",
      label: "BATAS WAKTU (SLA)",
      width: "140px",
      align: "center",
      render: (row) => (
        <div>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#1E293B" }}>
            📅 {row.tenggatWaktu}
          </span>
          <div style={{ marginTop: "3px" }}>
            {row.statusTindakLanjut === "Selesai & Patuh" ? (
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#166534", backgroundColor: "#DCFCE7", padding: "1px 6px", borderRadius: "4px" }}>
                ✓ Tepat Waktu
              </span>
            ) : row.statusTindakLanjut === "Diberi Sanksi" ? (
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#991B1B", backgroundColor: "#FEE2E2", padding: "1px 6px", borderRadius: "4px" }}>
                Melewati SLA
              </span>
            ) : (
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#D97706", backgroundColor: "#FEF3C7", padding: "1px 6px", borderRadius: "4px" }}>
                Masa Perbaikan 30 Hari
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      key: "statusTindakLanjut",
      label: "STATUS TINDAK LANJUT",
      width: "150px",
      align: "center",
      render: (row) => <StatusBadge status={row.statusTindakLanjut} size="sm" />
    },
    {
      key: "statusVerifikasi",
      label: "VERIFIKASI",
      width: "120px",
      align: "center",
      render: (row) => <StatusBadge status={row.statusVerifikasi} size="sm" />
    }
  ];

  const targetInfo: VerificationTargetInfo | null = selectedRecordForVerify
    ? {
        id: selectedRecordForVerify.nomorSurat,
        title: selectedRecordForVerify.badanUsahaAtauObjek,
        category: `Rekomendasi Pengawasan — ${config.shortTitle}`,
        notes: `Temuan: ${selectedRecordForVerify.temuanUtama} | Rekomendasi: ${selectedRecordForVerify.rekomendasiTindakan}`,
        date: selectedRecordForVerify.tenggatWaktu
      }
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Live Database Indicator Badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <span 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "5px",
            fontSize: "11px", 
            fontWeight: 700, 
            padding: "3px 10px", 
            borderRadius: "9999px",
            backgroundColor: dataStatus.source === "supabase" ? "#ECFDF5" : "#FFFBEB",
            color: dataStatus.source === "supabase" ? "#065F46" : "#B45309",
            border: `1px solid ${dataStatus.source === "supabase" ? "#A7F3D0" : "#FDE68A"}`
          }}
        >
          <DbIcon style={{ width: "12px", height: "12px" }} />
          {dataStatus.source === "supabase" ? "PostgreSQL (Live)" : "Mode Cadangan Lokal"}
        </span>
      </div>

      {/* Module Header */}
      <ModuleHeader
        breadcrumbs={[
          { label: config.shortTitle, href: config.basePath },
          { label: "Rekomendasi & Tindak Lanjut" }
        ]}
        badgeText={config.pilar}
        badgeBg={config.badgeBg}
        badgeColor={config.badgeColor}
        title={`Rekomendasi & Tindak Lanjut — ${config.shortTitle}`}
        description="Penerbitan surat rekomendasi teknis perbaikan, monitoring perbandingan target vs realisasi kepatuhan, dan pemantauan batas waktu tindak lanjut pengawasan lapangan."
        legalBasis={config.legalBasis}
        actionButtons={[
          {
            label: "Terbitkan Surat Rekomendasi",
            icon: Plus,
            variant: "primary",
            onClick: () => setIsCreateModalOpen(true)
          },
          {
            label: "Export SIPJAKI (XLSX)",
            icon: Download,
            onClick: () => exportToSpreadsheet({
              fileName: `${TEMPLATE_REKOMENDASI.exportFileName}_${tertibType}`,
              sheetName: TEMPLATE_REKOMENDASI.sheetName,
              columns: TEMPLATE_REKOMENDASI.columns,
              data: filteredData,
              sipjakiMode: true,
              includeDataDictionary: true,
              dictionaryItems: TEMPLATE_REKOMENDASI.dictionaryItems
            })
          }
        ]}
      />

      {/* ========================================================================= */}
      {/* FITUR 1: KOMPONEN PERBANDINGAN TARGET RENCANA VS REALISASI TINDAK LANJUT */}
      {/* ========================================================================= */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid #CBD5E1",
          boxShadow: "0 2px 12px rgba(15, 46, 92, 0.05)",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            backgroundColor: "#0F2E5C",
            color: "#FFFFFF",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFC000"
              }}
            >
              <Target style={{ width: "20px", height: "20px" }} />
            </div>
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 800, margin: 0, letterSpacing: "-0.2px" }}>
                Monitoring Target Rencana vs Realisasi Kepatuhan Tindak Lanjut
              </h3>
              <p style={{ fontSize: "11px", color: "#93C5FD", margin: "2px 0 0 0" }}>
                Komparasi SLA 30 hari kalender pemenuhan komitmen perbaikan teknis audit lapangan (Permen PUPR No. 1/2023)
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#FFC000", backgroundColor: "rgba(255, 192, 0, 0.15)", padding: "4px 10px", borderRadius: "9999px", border: "1px solid rgba(255, 192, 0, 0.3)" }}>
              TA 2026 Aktif
            </span>
          </div>
        </div>

        <div style={{ padding: "18px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", backgroundColor: "#F8FAFC" }}>
          {/* Kolom 1: Target vs Realisasi Kepatuhan Selesai */}
          <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>
                1. Rasio Pemenuhan Kepatuhan
              </span>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#166534", backgroundColor: "#DCFCE7", padding: "2px 8px", borderRadius: "9999px" }}>
                Target: {targetKepatuhanPct}%
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "8px 0" }}>
              <span style={{ fontSize: "26px", fontWeight: 900, color: "#0F2E5C" }}>
                {realisasiKepatuhanPct}%
              </span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>
                ({selesaiPatuh} dari {totalRekomendasi} Rekomendasi Selesai & Sah)
              </span>
            </div>

            {/* Comparison Progress Bar */}
            <div style={{ width: "100%", height: "8px", backgroundColor: "#E2E8F0", borderRadius: "9999px", overflow: "hidden", position: "relative" }}>
              <div
                style={{
                  width: `${realisasiKepatuhanPct}%`,
                  height: "100%",
                  backgroundColor: realisasiKepatuhanPct >= 70 ? "#10B981" : "#F59E0B",
                  borderRadius: "9999px"
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "10px", color: "#64748B", fontWeight: 600 }}>
              <span>Realisasi Saat Ini: {realisasiKepatuhanPct}%</span>
              <span>Selisih: {targetKepatuhanPct - realisasiKepatuhanPct}% Menunggu</span>
            </div>
          </div>

          {/* Kolom 2: Target SLA Waktu Penyelesaian vs Kecepatan Rekanan */}
          <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>
                2. Target Waktu Perbaikan (SLA)
              </span>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#1E40AF", backgroundColor: "#DBEAFE", padding: "2px 8px", borderRadius: "9999px" }}>
                SLA: 30 Hari Kerja
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "8px 0" }}>
              <span style={{ fontSize: "26px", fontWeight: 900, color: "#2563EB" }}>
                ~18 Hari
              </span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#166534" }}>
                Rata-rata Respon Rekanan (Tepat Waktu)
              </span>
            </div>

            <div style={{ fontSize: "11px", color: "#64748B", display: "flex", alignItems: "center", gap: "6px", paddingTop: "4px" }}>
              <Clock style={{ width: "13px", height: "13px", color: "#F59E0B" }} />
              <span><b>{dalamProses} Rekanan</b> masih dalam batas tenggat aktif berjalan.</span>
            </div>
          </div>

          {/* Kolom 3: Status Penegakan Hukum & Pengendalian Risiko */}
          <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>
                3. Pengendalian Risiko & Sanksi
              </span>
              <span style={{ fontSize: "10px", fontWeight: 800, color: diberiSanksi > 0 ? "#991B1B" : "#166534", backgroundColor: diberiSanksi > 0 ? "#FEE2E2" : "#DCFCE7", padding: "2px 8px", borderRadius: "9999px" }}>
                {diberiSanksi > 0 ? `${diberiSanksi} Sanksi Eskalasi` : "Nihil Pelanggaran Berat"}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "8px 0" }}>
              <span style={{ fontSize: "26px", fontWeight: 900, color: diberiSanksi > 0 ? "#DC2626" : "#10B981" }}>
                {onTrackCount} / {totalRekomendasi}
              </span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>
                Paket Pekerjaan On-Track Kepatuhan
              </span>
            </div>

            <div style={{ fontSize: "11px", color: "#64748B", display: "flex", alignItems: "center", gap: "6px", paddingTop: "4px" }}>
              <ShieldCheck style={{ width: "13px", height: "13px", color: "#10B981" }} />
              <span>Seluruh rekomendasi tersinkronisasi dengan Berita Acara SIMAK.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        {/* Card 1: Total Rekomendasi */}
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
                Total Rekomendasi
              </span>
              <span style={{ display: "block", fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>
                Tindak Lanjut SIMAK
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
              <FileText style={{ width: "20px", height: "20px" }} />
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#0F2E5C", margin: 0, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              {totalRekomendasi} Surat
            </h3>
          </div>

          <div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #F1F5F9" }}>
            <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Tahun Anggaran 2026</span>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#1E40AF", backgroundColor: "#DBEAFE", padding: "2px 8px", borderRadius: "9999px" }}>
              Dokumen Terbit
            </span>
          </div>
        </div>

        {/* Card 2: Dalam Proses Koreksi */}
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
                Dalam Proses Koreksi
              </span>
              <span style={{ display: "block", fontSize: "11px", color: "#D97706", fontWeight: 700, marginTop: "2px" }}>
                Menunggu Bukti Perbaikan
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
              <Clock style={{ width: "20px", height: "20px" }} />
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#D97706", margin: 0, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              {dalamProses} Paket / Rekanan
            </h3>
          </div>

          <div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #F1F5F9" }}>
            <span style={{ fontSize: "11px", color: "#D97706", fontWeight: 700 }}>Batas Waktu SP Aktif</span>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#92400E", backgroundColor: "#FEF3C7", padding: "2px 8px", borderRadius: "9999px" }}>
              Proses
            </span>
          </div>
        </div>

        {/* Card 3: Selesai & Patuh */}
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
                Selesai & Patuh
              </span>
              <span style={{ display: "block", fontSize: "11px", color: "#166534", fontWeight: 700, marginTop: "2px" }}>
                Perbaikan Diterima Tim
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
              {selesaiPatuh} Kasus
            </h3>
          </div>

          <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid #F1F5F9" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}>Tingkat Kepatuhan</span>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#166534" }}>
                {realisasiKepatuhanPct}%
              </span>
            </div>
            <div style={{ width: "100%", height: "6px", backgroundColor: "#F1F5F9", borderRadius: "9999px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${realisasiKepatuhanPct}%`,
                  height: "100%",
                  backgroundColor: "#10B981",
                  borderRadius: "9999px"
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Dikenakan Sanksi */}
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
                Dikenakan Sanksi
              </span>
              <span style={{ display: "block", fontSize: "11px", color: "#DC2626", fontWeight: 700, marginTop: "2px" }}>
                Eskalasi Surat Peringatan
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
              <Scale style={{ width: "20px", height: "20px" }} />
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#DC2626", margin: 0, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              {diberiSanksi} Sanksi
            </h3>
          </div>

          <div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #F1F5F9" }}>
            <span style={{ fontSize: "11px", color: diberiSanksi > 0 ? "#DC2626" : "#64748B", fontWeight: 700 }}>
              {diberiSanksi > 0 ? "Pemberitahuan LPJK/PUPR" : "Nihil Sanksi Berat"}
            </span>
            <span style={{ fontSize: "10px", fontWeight: 800, color: diberiSanksi > 0 ? "#991B1B" : "#166534", backgroundColor: diberiSanksi > 0 ? "#FEE2E2" : "#DCFCE7", padding: "2px 8px", borderRadius: "9999px" }}>
              {diberiSanksi > 0 ? "Sanksi" : "Nihil"}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FITUR 3: FILTER BAR & DEFAULT SORTING PAKET TERKINI (DESC) */}
      {/* ========================================================================= */}
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
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", flex: 1 }}>
          {/* Search Box */}
          <div style={{ position: "relative", minWidth: "240px", flex: "1 1 240px" }}>
            <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "#94A3B8" }} />
            <input
              type="text"
              placeholder="Cari nomor surat, paket pekerjaan, BUJK, lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                height: "36px",
                paddingLeft: "32px",
                paddingRight: "12px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "12px",
                color: "#1E293B"
              }}
            />
          </div>

          {/* Filter Status Tindak Lanjut */}
          <div>
            <select
              value={filterTindakLanjut}
              onChange={(e) => setFilterTindakLanjut(e.target.value)}
              style={{
                height: "36px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                padding: "0 10px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#1E293B",
                backgroundColor: "#F8FAFC"
              }}
            >
              <option value="Semua">Semua Tindak Lanjut</option>
              <option value="Dalam Proses">Dalam Proses</option>
              <option value="Selesai & Patuh">Selesai & Patuh</option>
              <option value="Diberi Sanksi">Diberi Sanksi</option>
            </select>
          </div>

          {/* Filter Status Verifikasi */}
          <div>
            <select
              value={filterVerifikasi}
              onChange={(e) => setFilterVerifikasi(e.target.value)}
              style={{
                height: "36px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                padding: "0 10px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#1E293B",
                backgroundColor: "#F8FAFC"
              }}
            >
              <option value="Semua">Semua Verifikasi</option>
              <option value="Draft">Draft</option>
              <option value="Terverifikasi">Terverifikasi</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>

          {/* Selector Urutan (Sort Selector) */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}>Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                height: "36px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                padding: "0 10px",
                fontSize: "12px",
                fontWeight: 700,
                color: "#0F2E5C",
                backgroundColor: "#EFF6FF"
              }}
            >
              <option value="terkini">Paket Pekerjaan Terkini (Default - DESC)</option>
              <option value="tenggat">Batas Tenggat Terdekat (Urgent SLA)</option>
              <option value="status">Status Kepatuhan Selesai</option>
              <option value="nama">Nama Paket / BUJK (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Visual Badge Default Sort & Reset Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "6px 12px",
              borderRadius: "9999px",
              backgroundColor: "#EFF6FF",
              color: "#1E40AF",
              fontSize: "11px",
              fontWeight: 800,
              border: "1px solid #BFDBFE"
            }}
          >
            <ArrowUpDown style={{ width: "12px", height: "12px" }} />
            {sortBy === "terkini" ? "Paket Pekerjaan Terkini (DESC)" : sortBy.toUpperCase()}
          </span>

          {(searchQuery || filterTindakLanjut !== "Semua" || filterVerifikasi !== "Semua" || sortBy !== "terkini") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilterTindakLanjut("Semua");
                setFilterVerifikasi("Semua");
                setSortBy("terkini");
              }}
              style={{
                padding: "7px 12px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#F8FAFC",
                color: "#475569",
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <X style={{ width: "12px", height: "12px" }} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FITUR 2: TABEL DATA & KOLOM AKSI EDIT LENGKAP */}
      {/* ========================================================================= */}
      <DataTableView<RekomendasiRecord>
        title={`Daftar Surat Rekomendasi & Tindak Lanjut (${filteredData.length})`}
        subtitle="Monitoring pemenuhan komitmen perbaikan hasil audit pengawasan lapangan berdasarkan riwayat pekerjaan konstruksi terkini"
        data={filteredData}
        columns={columns}
        defaultPageSize={10}
        exportFileName={`Rekomendasi_${tertibType}`}
        sipjakiTemplate={TEMPLATE_REKOMENDASI}
        exportColumns={TEMPLATE_REKOMENDASI.columns}
        actionsHeader="EDIT"
        actionsRender={(row) => (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            {/* Tombol Kuning: EDIT Rekomendasi */}
            <button
              type="button"
              title="Edit Data Rekomendasi & Status Tindak Lanjut"
              onClick={() => handleOpenEdit(row)}
              style={{
                padding: "6px 8px",
                borderRadius: "6px",
                border: "1px solid #F59E0B",
                backgroundColor: "#FEF3C7",
                color: "#B45309",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease"
              }}
            >
              <Pencil style={{ width: "13px", height: "13px" }} />
            </button>

            {/* Tombol Merah: HAPUS dengan Safety Confirmation Dialog */}
            <button
              type="button"
              title="Hapus Rekomendasi Pengawasan"
              onClick={() => setRecordToDelete(row)}
              style={{
                padding: "6px 8px",
                borderRadius: "6px",
                border: "1px solid #FECACA",
                backgroundColor: "#FEE2E2",
                color: "#991B1B",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease"
              }}
            >
              <Trash2 style={{ width: "13px", height: "13px" }} />
            </button>

            {/* Tombol Abu-abu / Navy: Pratinjau Surat Resmi */}
            <button
              type="button"
              title="Lihat Pratinjau Naskah Surat Resmi"
              onClick={() => setSelectedRecordForDetail(row)}
              style={{
                padding: "6px 8px",
                borderRadius: "6px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#F1F5F9",
                color: "#334155",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Eye style={{ width: "13px", height: "13px" }} />
            </button>

            {/* Tombol Verifikasi / Badge Sah */}
            {row.statusVerifikasi === "Draft" ? (
              <button
                type="button"
                onClick={() => handleOpenVerify(row)}
                style={{
                  backgroundColor: "#0F2E5C",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  padding: "5px 8px",
                  fontSize: "10px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <ShieldCheck style={{ width: "11px", height: "11px", color: "#FFC000" }} />
                <span>Verif</span>
              </button>
            ) : (
              <span style={{ fontSize: "10px", color: "#166534", fontWeight: 800, backgroundColor: "#DCFCE7", padding: "3px 6px", borderRadius: "4px" }}>
                ✓ Sah
              </span>
            )}
          </div>
        )}
      />

      {/* ========================================================================= */}
      {/* MODAL UBAH / EDIT SURAT REKOMENDASI (PREFILLED) */}
      {/* ========================================================================= */}
      {selectedRecordForEdit && (
        <ModalForm
          isOpen={!!selectedRecordForEdit}
          onClose={() => setSelectedRecordForEdit(null)}
          title="Ubah Data Surat Rekomendasi & Tindak Lanjut"
          subtitle={`Memperbarui data pengawasan nomor surat: ${selectedRecordForEdit.nomorSurat}`}
          icon={Pencil}
          size="lg"
          submitLabel="Simpan Perubahan Rekomendasi"
          onSubmit={handleEditSubmit}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Badan Usaha / Objek Penerima <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.badanUsahaAtauObjek}
                  onChange={(e) => setEditFormData({ ...editFormData, badanUsahaAtauObjek: e.target.value })}
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
                  Nama Paket Pekerjaan Konstruksi <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.paketPekerjaan}
                  onChange={(e) => setEditFormData({ ...editFormData, paketPekerjaan: e.target.value })}
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
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Lokasi Proyek / Wilayah
                </label>
                <input
                  type="text"
                  value={editFormData.lokasiProyek}
                  onChange={(e) => setEditFormData({ ...editFormData, lokasiProyek: e.target.value })}
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
                  Tanggal Terbit Surat
                </label>
                <input
                  type="date"
                  value={editFormData.tanggalSurat}
                  onChange={(e) => setEditFormData({ ...editFormData, tanggalSurat: e.target.value })}
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
                  Batas Akhir SLA (Tenggat)
                </label>
                <input
                  type="date"
                  value={editFormData.tenggatWaktu}
                  onChange={(e) => setEditFormData({ ...editFormData, tenggatWaktu: e.target.value })}
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
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Klasifikasi Sifat Surat Peringatan
                </label>
                <select
                  value={editFormData.jenisPeringatan}
                  onChange={(e) => setEditFormData({ ...editFormData, jenisPeringatan: e.target.value as any })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "13px"
                  }}
                >
                  <option value="Peringatan Tertulis I">Peringatan Tertulis I (Teguran Pertama)</option>
                  <option value="Peringatan Tertulis II">Peringatan Tertulis II (Teguran Keras)</option>
                  <option value="Pembatasan Kegiatan Usaha">Pembatasan Kegiatan Usaha</option>
                  <option value="Penghentian Sementara Proyek">Penghentian Sementara Pekerjaan Fisik</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Status Tindak Lanjut
                </label>
                <select
                  value={editFormData.statusTindakLanjut}
                  onChange={(e) => setEditFormData({ ...editFormData, statusTindakLanjut: e.target.value as any })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "13px"
                  }}
                >
                  <option value="Dalam Proses">Dalam Proses</option>
                  <option value="Selesai & Patuh">Selesai & Patuh</option>
                  <option value="Diberi Sanksi">Diberi Sanksi</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Status Verifikasi
                </label>
                <select
                  value={editFormData.statusVerifikasi}
                  onChange={(e) => setEditFormData({ ...editFormData, statusVerifikasi: e.target.value as any })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "13px"
                  }}
                >
                  <option value="Draft">Draft</option>
                  <option value="Terverifikasi">Terverifikasi</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Uraian Temuan Ketidaksesuaian Hasil Audit <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <textarea
                required
                rows={2}
                value={editFormData.temuanUtama}
                onChange={(e) => setEditFormData({ ...editFormData, temuanUtama: e.target.value })}
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
                Rekomendasi Tindakan Korektif yang Wajib Dilakukan <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <textarea
                required
                rows={2}
                value={editFormData.rekomendasiTindakan}
                onChange={(e) => setEditFormData({ ...editFormData, rekomendasiTindakan: e.target.value })}
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
                Catatan Verifikator Lapangan
              </label>
              <input
                type="text"
                value={editFormData.catatanVerifikator}
                onChange={(e) => setEditFormData({ ...editFormData, catatanVerifikator: e.target.value })}
                placeholder="Catatan hasil evaluasi dokumen bukti perbaikan..."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "12px"
                }}
              />
            </div>
          </div>
        </ModalForm>
      )}

      {/* ========================================================================= */}
      {/* SAFETY CONFIRMATION DIALOG: HAPUS REKOMENDASI */}
      {/* ========================================================================= */}
      {recordToDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              border: "1px solid #FEE2E2",
              textAlign: "center"
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                backgroundColor: "#FEE2E2",
                color: "#DC2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto"
              }}
            >
              <AlertTriangle style={{ width: "26px", height: "26px" }} />
            </div>

            <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", margin: "0 0 8px 0" }}>
              Hapus Surat Rekomendasi Pengawasan?
            </h3>

            <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 18px 0", lineHeight: 1.5 }}>
              Apakah Anda yakin ingin menghapus surat nomor{" "}
              <b style={{ color: "#0F2E5C" }}>{recordToDelete.nomorSurat}</b> untuk paket pekerjaan{" "}
              <b style={{ color: "#0F172A" }}>&quot;{recordToDelete.paketPekerjaan || recordToDelete.badanUsahaAtauObjek}&quot;</b>?
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                style={{
                  padding: "9px 20px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#FFFFFF",
                  color: "#475569",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{
                  padding: "9px 20px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#DC2626",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Terbitkan Surat Rekomendasi Baru */}
      <ModalForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Terbitkan Surat Rekomendasi & Tindak Lanjut"
        subtitle="Penerbitan surat teguran tertulis / instruksi perbaikan teknis hasil audit pengawasan"
        icon={FileText}
        size="lg"
        submitLabel="Terbitkan Surat Rekomendasi"
        onSubmit={handleCreateSubmit}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Badan Usaha / Objek Penerima <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: PT. Baraya Cipta Mandiri"
                value={formData.badanUsahaAtauObjek}
                onChange={(e) => setFormData({ ...formData, badanUsahaAtauObjek: e.target.value })}
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
                Paket Pekerjaan Konstruksi <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Preservasi Jalan Cigudeg - Sukajaya"
                value={formData.paketPekerjaan}
                onChange={(e) => setFormData({ ...formData, paketPekerjaan: e.target.value })}
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
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Lokasi Proyek
              </label>
              <input
                type="text"
                value={formData.lokasiProyek}
                onChange={(e) => setFormData({ ...formData, lokasiProyek: e.target.value })}
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
                Tanggal Terbit Surat
              </label>
              <input
                type="date"
                value={formData.tanggalSurat}
                onChange={(e) => setFormData({ ...formData, tanggalSurat: e.target.value })}
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
                Batas Waktu (Tenggat SLA)
              </label>
              <input
                type="date"
                value={formData.tenggatWaktu}
                onChange={(e) => setFormData({ ...formData, tenggatWaktu: e.target.value })}
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
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
              Klasifikasi Sifat Surat Peringatan
            </label>
            <select
              value={formData.jenisPeringatan}
              onChange={(e) => setFormData({ ...formData, jenisPeringatan: e.target.value as any })}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "13px"
              }}
            >
              <option value="Peringatan Tertulis I">Peringatan Tertulis I (Teguran Pertama)</option>
              <option value="Peringatan Tertulis II">Peringatan Tertulis II (Teguran Keras)</option>
              <option value="Pembatasan Kegiatan Usaha">Pembatasan Kegiatan Usaha</option>
              <option value="Penghentian Sementara Proyek">Penghentian Sementara Pekerjaan Fisik</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
              Uraian Temuan Ketidaksesuaian Hasil Audit <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <textarea
              required
              rows={2}
              value={formData.temuanUtama}
              onChange={(e) => setFormData({ ...formData, temuanUtama: e.target.value })}
              placeholder="Jelaskan secara spesifik ketidaksesuaian dokumen, sertifikat, atau teknis lapangan..."
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
              Rekomendasi Tindakan Korektif yang Wajib Dilakukan <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formData.rekomendasiTindakan}
              onChange={(e) => setFormData({ ...formData, rekomendasiTindakan: e.target.value })}
              placeholder="Langkah-langkah perbaikan terukur yang harus dipenuhi penyedia jasa / pengelola..."
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

          {/* Upload Berkas Surat Resmi PDF */}
          <FileUploader
            label="Unggah Salinan Surat Resmi Bertanda Tangan (PDF)"
            accept=".pdf"
            maxSizeMb={5}
            hint="Salinan resmi surat dinas berstempel resmi Dinas PUPR. Maksimal 5MB."
            onFileSelect={(file) => setFormData({ ...formData, uploadedSurat: file })}
          />
        </div>
      </ModalForm>

      {/* Modal Detail Surat Rekomendasi Resmi */}
      {selectedRecordForDetail && (
        <ModalForm
          isOpen={!!selectedRecordForDetail}
          onClose={() => setSelectedRecordForDetail(null)}
          title={`Surat Rekomendasi & Tindak Lanjut`}
          subtitle={`Nomor: ${selectedRecordForDetail.nomorSurat}`}
          icon={FileText}
          size="lg"
          hideFooter
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ borderBottom: "2px solid #0F2E5C", paddingBottom: "12px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>
                Dinas Pekerjaan Umum Kabupaten Bogor
              </span>
              <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#0F2E5C", margin: "4px 0" }}>
                SURAT REKOMENDASI DAN TINDAK LANJUT PENGAWASAN JASA KONSTRUKSI
              </h3>
              <span style={{ fontSize: "11px", color: "#475569" }}>
                Nomor: {selectedRecordForDetail.nomorSurat} • Dasar: Permen PUPR No. 1/2023
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", backgroundColor: "#F8FAFC", padding: "14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
              <div>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700 }}>Badan Usaha & Paket Pekerjaan:</span>
                <p style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C", margin: "2px 0 0 0" }}>
                  {selectedRecordForDetail.paketPekerjaan || selectedRecordForDetail.badanUsahaAtauObjek}
                </p>
                <span style={{ fontSize: "11px", color: "#64748B" }}>
                  Rekanan: {selectedRecordForDetail.badanUsahaAtauObjek}
                </span>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700 }}>Batas Akhir Pemenuhan (SLA):</span>
                <p style={{ fontSize: "13px", fontWeight: 800, color: "#DC2626", margin: "2px 0 0 0" }}>
                  📅 {selectedRecordForDetail.tenggatWaktu}
                </p>
                <span style={{ fontSize: "11px", color: "#64748B" }}>
                  Sifat: {selectedRecordForDetail.jenisPeringatan || "Peringatan Tertulis I"}
                </span>
              </div>
            </div>

            <div style={{ padding: "12px 14px", borderRadius: "10px", backgroundColor: "#FEF2F2", border: "1px solid #FEE2E2" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#991B1B", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Temuan Audit Lapangan
              </span>
              <p style={{ fontSize: "12px", color: "#7F1D1D", margin: 0, lineHeight: 1.5 }}>
                {selectedRecordForDetail.temuanUtama}
              </p>
            </div>

            <div style={{ padding: "12px 14px", borderRadius: "10px", backgroundColor: "#F0FDF4", border: "1px solid #DCFCE7" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#166534", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Instruksi Rekomendasi Tindakan Korektif
              </span>
              <p style={{ fontSize: "12px", color: "#14532D", margin: 0, lineHeight: 1.5 }}>
                {selectedRecordForDetail.rekomendasiTindakan}
              </p>
            </div>

            {selectedRecordForDetail.catatanVerifikator && (
              <div style={{ fontSize: "11px", color: "#64748B", fontStyle: "italic", borderTop: "1px dashed #CBD5E1", paddingTop: "8px" }}>
                Catatan Verifikator: {selectedRecordForDetail.catatanVerifikator}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid #E2E8F0" }}>
              <StatusBadge status={selectedRecordForDetail.statusTindakLanjut} />
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => alert(`Mencetak salinan resmi surat ${selectedRecordForDetail.nomorSurat}...`)}
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
                  <span>Cetak Surat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRecordForDetail(null)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    backgroundColor: "#0F2E5C",
                    color: "#FFFFFF",
                    border: "none",
                    fontSize: "11px",
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </ModalForm>
      )}

      {/* Reusable VerificationDialog */}
      <VerificationDialog
        isOpen={!!selectedRecordForVerify}
        onClose={() => setSelectedRecordForVerify(null)}
        target={targetInfo}
        onConfirm={handleConfirmVerify}
        isLoading={isVerifying}
      />
    </div>
  );
}

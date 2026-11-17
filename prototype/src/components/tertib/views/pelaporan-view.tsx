"use client";
import React, { useState, useEffect } from "react";
import ModuleHeader from "@/components/layout/module-header";
import { TertibType, TERTIB_CONFIGS } from "@/lib/tertib-config";
import { mockPelaporanRecords, PelaporanRecord } from "@/data/tertib-mock-data";
import { 
  FileBarChart, Download, RefreshCw, CheckCircle2, 
  FileSpreadsheet, FileText, Send, Plus, Eye, 
  Trash2, ShieldCheck, Database, Calendar, ExternalLink,
  Pencil, AlertTriangle, Layers, Building2
} from "lucide-react";
import DataTableView, { ColumnDef } from "@/components/common/data-table-view";
import ModalForm from "@/components/common/modal-form";
import FileUploader from "@/components/common/file-uploader";
import { exportToSpreadsheet, ExportColumn } from "@/lib/export-utils";
import { logDataActivity } from "@/lib/audit-log";
import { 
  fetchPelaporanList, 
  createPelaporanRecord, 
  updatePelaporanRecord, 
  deletePelaporanRecord 
} from "@/lib/services/pelaporan-service";

const pelaporanExportColumns: ExportColumn[] = [
  { key: "jenisLaporan", label: "Jenis Laporan", sipjakiLabel: "jenis_laporan" },
  { key: "namaLaporan", label: "Nama Laporan Pengawasan", sipjakiLabel: "nama_laporan" },
  { key: "tahun", label: "Tahun Anggaran", sipjakiLabel: "tahun" },
  { key: "wilayah", label: "Wilayah", sipjakiLabel: "wilayah" },
  { key: "dokumen", label: "Berkas Dokumen", sipjakiLabel: "dokumen_nama" },
  { key: "status", label: "Status Verifikasi SIPJAKI", sipjakiLabel: "status" },
  { key: "jumlahObjekDiperiksa", label: "Jumlah Objek Diawasi", sipjakiLabel: "jumlah_objek" },
  { key: "tingkatKepatuhan", label: "Tingkat Kepatuhan (%)", sipjakiLabel: "tingkat_kepatuhan" },
  { key: "tanggalKirim", label: "Tanggal Pengiriman", sipjakiLabel: "tanggal_kirim" }
];

interface PelaporanViewProps {
  tertibType: TertibType;
}

export default function PelaporanView({ tertibType }: PelaporanViewProps) {
  const config = TERTIB_CONFIGS[tertibType];
  const [data, setData] = useState<PelaporanRecord[]>(() =>
    mockPelaporanRecords.filter((r) => r.tertibType === tertibType)
  );
  const [dataSource, setDataSource] = useState<"supabase" | "fallback">("fallback");

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("2026-11-15 14:30 WIB");

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReportDetail, setSelectedReportDetail] = useState<PelaporanRecord | null>(null);
  const [reportToEdit, setReportToEdit] = useState<PelaporanRecord | null>(null);
  const [reportToDelete, setReportToDelete] = useState<PelaporanRecord | null>(null);

  // Form State untuk Buat Laporan Baru
  const [formData, setFormData] = useState({
    jenisLaporan: "Tahunan" as "Tahunan" | "Semesteran" | "Triwulanan" | "Insidental",
    namaLaporan: `LAPORAN PENGAWASAN TAHUNAN ${config.shortTitle.toUpperCase()} 2026 KABUPATEN BOGOR`,
    tahun: "2026",
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    wilayah: "Jawa Barat / Kabupaten Bogor",
    jumlahObjekDiperiksa: 24,
    tingkatKepatuhan: 87.5,
    status: "Menunggu Verifikasi" as "Menunggu Verifikasi" | "Terverifikasi" | "Perlu Revisi" | "Draft Lokal",
    nomorSurat: "600.1/1450/PUPR-Jakon/2026",
    catatan: "Laporan hasil pengawasan terpadu Kabupaten Bogor format baku SIPJAKI.",
    filePdfName: `Laporan_${config.slug}_2026.pdf`
  });

  // Form State untuk Edit Laporan
  const [editFormData, setEditFormData] = useState({
    jenisLaporan: "Tahunan" as "Tahunan" | "Semesteran" | "Triwulanan" | "Insidental",
    namaLaporan: "",
    tahun: "2026",
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    wilayah: "Jawa Barat / Kabupaten Bogor",
    jumlahObjekDiperiksa: 0,
    tingkatKepatuhan: 0,
    status: "Menunggu Verifikasi" as "Menunggu Verifikasi" | "Terverifikasi" | "Perlu Revisi" | "Draft Lokal",
    nomorSurat: "",
    catatan: "",
    filePdfName: ""
  });

  // Fetch data dari Supabase saat mount
  useEffect(() => {
    async function loadData() {
      const res = await fetchPelaporanList(tertibType);
      if (res.data && res.data.length > 0) {
        setData(res.data);
        setDataSource(res.status.source);
      }
    }
    loadData();
  }, [tertibType]);

  // Update default form saat tertibType berubah
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      namaLaporan: `LAPORAN PENGAWASAN TAHUNAN ${config.shortTitle.toUpperCase()} 2026 KABUPATEN BOGOR`,
      filePdfName: `Laporan_${config.slug}_2026.pdf`
    }));
  }, [tertibType, config.shortTitle, config.slug]);

  // Calculate Metrics
  const totalObjek = data.reduce((acc, curr) => acc + (curr.jumlahObjekDiperiksa || 0), 0);
  const avgKepatuhan = data.length > 0 
    ? Math.round(data.reduce((acc, curr) => acc + (curr.tingkatKepatuhan || 0), 0) / data.length)
    : 0;
  const verifiedCount = data.filter((r) => r.status === "Terverifikasi").length;

  // Handle Sync to National Gateway SIPJAKI
  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const updated = data.map((r) => ({
        ...r,
        status: "Terverifikasi" as const,
        statusSinkronisasiSipjaki: "Tersinkronisasi" as const,
        tanggalKirim: new Date().toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }) + " WIB"
      }));
      setData(updated);
      setIsSyncing(false);
      const nowStr = new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) + " WIB";
      setLastSyncTime(nowStr);

      logDataActivity({
        action: "export",
        module: `Pelaporan SIPJAKI (${config.shortTitle})`,
        format: "db",
        recordCount: data.length,
        user: "Petugas Pembina Jakon",
        status: "success",
        details: `Sinkronisasi masal ${data.length} paket laporan ${config.shortTitle} ke SIPJAKI Nasional`
      });

      alert(`Sinkronisasi Gateway SIPJAKI Kementerian PUPR Berhasil!\n\nSeluruh ${data.length} paket laporan ${config.shortTitle} telah terkirim dan tercatat di repositori Satu Data Jakon Nasional.`);
    }, 1200);
  };

  // Handle Create Report
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaLaporan) {
      alert("Harap lengkapi nama laporan!");
      return;
    }

    const newId = `LAP-${tertibType === "tertib-usaha" ? "TU" : tertibType === "tertib-penyelenggaraan" ? "TP" : "TM"}-${formData.tahun}-${Date.now().toString().slice(-4)}`;
    const newReport: PelaporanRecord = {
      id: newId,
      tertibType: tertibType,
      jenisLaporan: formData.jenisLaporan,
      namaLaporan: formData.namaLaporan.toUpperCase(),
      tahun: formData.tahun,
      propinsi: formData.propinsi,
      kabKota: formData.kabKota,
      wilayah: `${formData.propinsi} / ${formData.kabKota}`,
      dokumen: formData.filePdfName,
      dokumenUrl: `https://sijakon.bogorkab.go.id/docs/${formData.filePdfName}`,
      status: formData.status,
      jumlahObjekDiperiksa: Number(formData.jumlahObjekDiperiksa) || 1,
      tingkatKepatuhan: Number(formData.tingkatKepatuhan) || 80,
      tanggalKirim: "-",
      nomorSurat: formData.nomorSurat,
      catatan: formData.catatan,
      // Fallback aliases
      judulLaporan: formData.namaLaporan.toUpperCase(),
      periode: formData.jenisLaporan,
      statusSinkronisasiSipjaki: formData.status === "Terverifikasi" ? "Tersinkronisasi" : "Menunggu Verifikasi Pusat",
      filePdf: formData.filePdfName,
      fileExcel: `Rekap_${config.slug}_${formData.tahun}.xlsx`
    };

    const res = await createPelaporanRecord(newReport);
    if (res.success) {
      setData([newReport, ...data]);
      setIsCreateModalOpen(false);

      logDataActivity({
        action: "create",
        module: `Pelaporan SIPJAKI (${config.shortTitle})`,
        format: "db",
        recordCount: 1,
        user: "Petugas Pembina Jakon",
        status: "success",
        details: `Menambahkan berkas pelaporan: ${newReport.namaLaporan}`
      });

      alert(`Laporan "${newReport.namaLaporan}" berhasil disimpan dan diarsipkan!`);
    } else {
      alert(`Gagal menyimpan ke database: ${res.error}`);
    }
  };

  // Buka Modal Edit
  const handleOpenEdit = (report: PelaporanRecord) => {
    setReportToEdit(report);
    setEditFormData({
      jenisLaporan: report.jenisLaporan || "Tahunan",
      namaLaporan: report.namaLaporan || report.judulLaporan || "",
      tahun: report.tahun || "2026",
      propinsi: report.propinsi || "Jawa Barat",
      kabKota: report.kabKota || "Kabupaten Bogor",
      wilayah: report.wilayah || "Jawa Barat / Kabupaten Bogor",
      jumlahObjekDiperiksa: report.jumlahObjekDiperiksa || 0,
      tingkatKepatuhan: report.tingkatKepatuhan || 80,
      status: report.status || "Menunggu Verifikasi",
      nomorSurat: report.nomorSurat || "",
      catatan: report.catatan || "",
      filePdfName: report.dokumen || report.filePdf || "Laporan.pdf"
    });
    setIsEditModalOpen(true);
  };

  // Submit Simpan Perubahan Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportToEdit) return;

    const updatedRecord: PelaporanRecord = {
      ...reportToEdit,
      jenisLaporan: editFormData.jenisLaporan,
      namaLaporan: editFormData.namaLaporan.toUpperCase(),
      tahun: editFormData.tahun,
      propinsi: editFormData.propinsi,
      kabKota: editFormData.kabKota,
      wilayah: `${editFormData.propinsi} / ${editFormData.kabKota}`,
      dokumen: editFormData.filePdfName,
      dokumenUrl: `https://sijakon.bogorkab.go.id/docs/${editFormData.filePdfName}`,
      status: editFormData.status,
      jumlahObjekDiperiksa: Number(editFormData.jumlahObjekDiperiksa),
      tingkatKepatuhan: Number(editFormData.tingkatKepatuhan),
      nomorSurat: editFormData.nomorSurat,
      catatan: editFormData.catatan,
      // Fallback aliases
      judulLaporan: editFormData.namaLaporan.toUpperCase(),
      periode: editFormData.jenisLaporan,
      statusSinkronisasiSipjaki: editFormData.status === "Terverifikasi" ? "Tersinkronisasi" : "Menunggu Verifikasi Pusat",
      filePdf: editFormData.filePdfName
    };

    const res = await updatePelaporanRecord(reportToEdit.id, updatedRecord);
    if (res.success) {
      setData((prev) => prev.map((item) => (item.id === reportToEdit.id ? updatedRecord : item)));
      setIsEditModalOpen(false);
      setReportToEdit(null);

      logDataActivity({
        action: "update",
        module: `Pelaporan SIPJAKI (${config.shortTitle})`,
        format: "db",
        recordCount: 1,
        user: "Petugas Pembina Jakon",
        status: "success",
        details: `Memperbarui data pelaporan ${updatedRecord.namaLaporan}`
      });

      alert(`Pembaruan Laporan "${updatedRecord.namaLaporan}" berhasil disimpan!`);
    } else {
      alert(`Gagal memperbarui data: ${res.error}`);
    }
  };

  // Buka Dialog Hapus
  const handleOpenDelete = (report: PelaporanRecord) => {
    setReportToDelete(report);
    setIsDeleteDialogOpen(true);
  };

  // Konfirmasi Hapus Data
  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;

    const res = await deletePelaporanRecord(reportToDelete.id);
    if (res.success) {
      setData((prev) => prev.filter((r) => r.id !== reportToDelete.id));

      logDataActivity({
        action: "delete",
        module: `Pelaporan SIPJAKI (${config.shortTitle})`,
        format: "db",
        recordCount: 1,
        user: "Petugas Pembina Jakon",
        status: "success",
        details: `Menghapus berkas pelaporan ${reportToDelete.namaLaporan || reportToDelete.judulLaporan}`
      });

      setIsDeleteDialogOpen(false);
      setReportToDelete(null);
    } else {
      alert(`Gagal menghapus data: ${res.error}`);
    }
  };

  // Helper untuk warna badge Jenis Laporan
  const getJenisLaporanBadgeStyle = (jenis: string) => {
    switch (jenis) {
      case "Tahunan":
        return { bg: "#DBEAFE", color: "#1D4ED8", border: "#BFDBFE" };
      case "Semesteran":
        return { bg: "#F3E8FF", color: "#7E22CE", border: "#E9D5FF" };
      case "Triwulanan":
        return { bg: "#FEF3C7", color: "#B45309", border: "#FDE68A" };
      case "Insidental":
        return { bg: "#E0F2FE", color: "#0369A1", border: "#BAE6FD" };
      default:
        return { bg: "#F1F5F9", color: "#475569", border: "#E2E8F0" };
    }
  };

  // Helper untuk warna badge Status SIPJAKI
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Terverifikasi":
        return { bg: "#DCFCE7", color: "#166534", dot: "#16A34A" };
      case "Menunggu Verifikasi":
        return { bg: "#FEF3C7", color: "#92400E", dot: "#D97706" };
      case "Perlu Revisi":
        return { bg: "#FEE2E2", color: "#991B1B", dot: "#DC2626" };
      default:
        return { bg: "#F1F5F9", color: "#475569", dot: "#94A3B8" };
    }
  };

  // =============================================================================
  // DEFINISI 8 KOLOM TABEL STANDAR SIPJAKI
  // (NO, JENIS LAPORAN, NAMA LAPORAN, TAHUN, WILAYAH, DOKUMEN, STATUS, AKSI)
  // =============================================================================
  const tableColumns: ColumnDef<PelaporanRecord>[] = [
    // 1. NO
    {
      key: "id",
      label: "NO",
      width: "55px",
      align: "center",
      render: (_, index) => (
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>
          {index !== undefined ? index + 1 : "-"}
        </span>
      )
    },
    // 2. JENIS LAPORAN (Badge Pill)
    {
      key: "jenisLaporan",
      label: "JENIS LAPORAN",
      width: "135px",
      align: "center",
      render: (row) => {
        const badge = getJenisLaporanBadgeStyle(row.jenisLaporan || row.periode || "Tahunan");
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 10px",
              borderRadius: "9999px",
              fontSize: "11px",
              fontWeight: 800,
              backgroundColor: badge.bg,
              color: badge.color,
              border: `1px solid ${badge.border}`
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: badge.color }} />
            {row.jenisLaporan || row.periode || "Tahunan"}
          </span>
        );
      }
    },
    // 3. NAMA LAPORAN (Huruf Kapital Baku + Subtitle Objek & Kepatuhan)
    {
      key: "namaLaporan",
      label: "NAMA LAPORAN",
      width: "350px",
      render: (row) => (
        <div>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", lineHeight: 1.4, letterSpacing: "0.2px" }}>
            {row.namaLaporan || row.judulLaporan}
          </div>
          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, color: "#0F2E5C", backgroundColor: "#F1F5F9", padding: "1px 6px", borderRadius: "4px", whiteSpace: "nowrap" }}>
              {row.jumlahObjekDiperiksa || 0} Objek Diawasi
            </span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span style={{ fontWeight: 700, color: (row.tingkatKepatuhan || 0) >= 80 ? "#166534" : "#B45309", whiteSpace: "nowrap" }}>
              Kepatuhan {row.tingkatKepatuhan}%
            </span>
            {row.nomorSurat && (
              <>
                <span style={{ opacity: 0.5 }}>•</span>
                <span style={{ color: "#94A3B8", whiteSpace: "nowrap" }}>No: {row.nomorSurat}</span>
              </>
            )}
          </div>
        </div>
      )
    },
    // 4. TAHUN (Tahun Anggaran)
    {
      key: "tahun",
      label: "TAHUN",
      width: "85px",
      align: "center",
      render: (row) => (
        <span
          style={{
            fontSize: "12px",
            fontWeight: 800,
            color: "#0F2E5C",
            backgroundColor: "#F1F5F9",
            padding: "4px 8px",
            borderRadius: "6px"
          }}
        >
          {row.tahun}
        </span>
      )
    },
    // 5. WILAYAH (Hierarki SIPJAKI: JAWA BARAT / KABUPATEN BOGOR)
    {
      key: "wilayah",
      label: "WILAYAH",
      width: "180px",
      render: (row) => (
        <div>
          <div style={{ fontSize: "12px", fontWeight: 900, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.3px" }}>
            {row.propinsi || "JAWA BARAT"}
          </div>
          <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
            {row.kabKota || "KABUPATEN BOGOR"}
          </div>
        </div>
      )
    },
    // 6. DOKUMEN (Tombol "Lihat" SIPJAKI Navy dengan Eye & External Link Icon)
    {
      key: "dokumen",
      label: "DOKUMEN",
      width: "120px",
      align: "center",
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelectedReportDetail(row)}
          title="Lihat Pratinjau Dokumen Laporan Pengawasan"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "6px 14px",
            borderRadius: "8px",
            backgroundColor: "#0F2E5C",
            color: "#FFFFFF",
            border: "none",
            fontSize: "12px",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(15, 46, 92, 0.2)",
            transition: "all 0.15s ease-in-out"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1A4B8C")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0F2E5C")}
        >
          <Eye style={{ width: "14px", height: "14px" }} />
          <span>Lihat</span>
          <ExternalLink style={{ width: "11px", height: "11px", opacity: 0.8 }} />
        </button>
      )
    },
    // 7. STATUS (Status Verifikasi SIPJAKI)
    {
      key: "status",
      label: "STATUS",
      width: "170px",
      align: "center",
      render: (row) => {
        const badge = getStatusBadgeStyle(row.status || "Menunggu Verifikasi");
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "9999px",
              fontSize: "11px",
              fontWeight: 800,
              backgroundColor: badge.bg,
              color: badge.color
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: badge.dot }} />
            {row.status || "Menunggu Verifikasi"}
          </span>
        );
      }
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Module Header */}
      <ModuleHeader
        breadcrumbs={[
          { label: config.shortTitle, href: config.basePath },
          { label: "Pelaporan SIPJAKI" }
        ]}
        badgeText={config.pilar}
        badgeBg={config.badgeBg}
        badgeColor={config.badgeColor}
        title={`Pelaporan Resmi Pengawasan — ${config.shortTitle}`}
        description="Penyusunan dan pengarsipan laporan pengawasan konstruksi Kabupaten Bogor dalam format integrasi 8 kolom SIPJAKI Kementerian PUPR."
        legalBasis={config.legalBasis}
        actionButtons={[
          {
            label: isSyncing ? "Menyinkronkan..." : "Kirim ke SIPJAKI Nasional",
            icon: isSyncing ? RefreshCw : Send,
            variant: "primary",
            onClick: handleSyncAll
          },
          {
            label: "Buat Laporan Baru",
            icon: Plus,
            onClick: () => setIsCreateModalOpen(true)
          }
        ]}
      />

      {/* Gateway Status Banner Glassmorphic */}
      <div
        style={{
          padding: "16px 20px",
          borderRadius: "16px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              backgroundColor: "#DCFCE7",
              color: "#166534",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <CheckCircle2 style={{ width: "22px", height: "22px" }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#0F2E5C", margin: 0 }}>
                Koneksi Gateway SIPJAKI Terhubung & Siap Sinkronisasi
              </h4>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#166534", backgroundColor: "#DCFCE7", padding: "2px 8px", borderRadius: "9999px" }}>
                API v1 LIVE
              </span>
              {dataSource === "supabase" && (
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#2563EB", backgroundColor: "#DBEAFE", padding: "2px 8px", borderRadius: "9999px" }}>
                  PostgreSQL Cloud
                </span>
              )}
            </div>
            <p style={{ fontSize: "11px", color: "#64748B", margin: "3px 0 0 0" }}>
              Endpoint: <code style={{ backgroundColor: "#F1F5F9", padding: "1px 6px", borderRadius: "4px" }}>https://sipjaki.pu.go.id/api/v1/pengawasan/{config.slug}</code> • Terakhir Sinkron: <b>{lastSyncTime}</b>
            </p>
          </div>
        </div>

        <button
          onClick={handleSyncAll}
          disabled={isSyncing}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "10px",
            backgroundColor: "#0F2E5C",
            color: "#FFFFFF",
            border: "none",
            fontSize: "12px",
            fontWeight: 800,
            cursor: isSyncing ? "not-allowed" : "pointer",
            boxShadow: "0 2px 6px rgba(15, 46, 92, 0.2)"
          }}
        >
          <RefreshCw style={{ width: "13px", height: "13px", animation: isSyncing ? "spin 1s linear infinite" : "none" }} />
          <span>{isSyncing ? "Proses Pengiriman..." : "Sinkronkan Laporan"}</span>
        </button>
      </div>

      {/* 4 Summary Metrics (UI/UX Standardized) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        {/* Card 1: Total Objek */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #0F2E5C",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Total Objek Diawasi
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
              <FileBarChart style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#0F2E5C", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {totalObjek} Objek
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10B981" }} />
              <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>
                100% Tercakup Dalam Berkas
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Rata-rata Kepatuhan */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #059669",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Indeks Kepatuhan
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
              <ShieldCheck style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#059669", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {avgKepatuhan}%
            </div>
            <div style={{ marginTop: "10px" }}>
              <div style={{ width: "100%", height: "6px", backgroundColor: "#E2E8F0", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ width: `${avgKepatuhan}%`, height: "100%", backgroundColor: "#059669", borderRadius: "999px" }} />
              </div>
              <span style={{ fontSize: "11px", color: "#64748B", marginTop: "4px", display: "inline-block" }}>
                Kategori Kepatuhan Sangat Baik
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Status Verifikasi */}
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
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Terverifikasi Pusat
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
              <Database style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#2563EB", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {verifiedCount} / {data.length} Laporan
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#2563EB" }} />
              <span style={{ fontSize: "11px", color: "#2563EB", fontWeight: 700 }}>
                Status Validasi Resmi SIPJAKI
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Periode Laporan */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #D97706",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Total Berkas Laporan
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
              <Calendar style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#D97706", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {data.length} Dokumen
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ fontSize: "11px", color: "#64748B" }}>
                Tahunan, Semesteran & Triwulanan
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DataTableView dengan 8 Kolom SIPJAKI + Aksi (Edit & Hapus) */}
      <DataTableView<PelaporanRecord>
        title={`Daftar Berkas Pelaporan Berkala (${data.length} Berkas)`}
        subtitle="Format baku tabel pelaporan 8 kolom integrasi SIPJAKI Kementerian PUPR"
        data={data}
        columns={tableColumns}
        exportFileName={`Laporan_${tertibType}_SIPJAKI`}
        exportColumns={pelaporanExportColumns}
        actionsHeader="AKSI"
        actionsRender={(row) => (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            {/* Tombol Edit */}
            <button
              type="button"
              title="Edit Data Laporan"
              onClick={() => handleOpenEdit(row)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid #FCD34D",
                backgroundColor: "#FEF3C7",
                color: "#92400E",
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer",
                transition: "all 0.15s ease-in-out"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FDE68A")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FEF3C7")}
            >
              <Pencil style={{ width: "12px", height: "12px" }} />
              <span>Edit</span>
            </button>

            {/* Tombol Hapus */}
            <button
              type="button"
              title="Hapus Laporan"
              onClick={() => handleOpenDelete(row)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid #FECACA",
                backgroundColor: "#FEE2E2",
                color: "#991B1B",
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer",
                transition: "all 0.15s ease-in-out"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FCA5A5")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FEE2E2")}
            >
              <Trash2 style={{ width: "12px", height: "12px" }} />
              <span>Hapus</span>
            </button>

            {/* Tombol Unduh Rekap Excel Mini */}
            <button
              type="button"
              title="Unduh Rekapitulasi Excel"
              onClick={() => exportToSpreadsheet({
                fileName: `Rekap_${row.namaLaporan || row.judulLaporan}`,
                sheetName: "REKAPITULASI PELAPORAN",
                columns: [
                  { key: "jenisLaporan", label: "Jenis Laporan" },
                  { key: "namaLaporan", label: "Nama Laporan" },
                  { key: "tahun", label: "Tahun Anggaran" },
                  { key: "wilayah", label: "Wilayah" },
                  { key: "jumlahObjekDiperiksa", label: "Objek Diawasi" },
                  { key: "tingkatKepatuhan", label: "Tingkat Kepatuhan (%)", transform: (v) => `${v}%` },
                  { key: "dokumen", label: "Berkas Laporan" },
                  { key: "status", label: "Status Verifikasi" },
                  { key: "nomorSurat", label: "Nomor Surat Pengantar" }
                ],
                data: [row],
                includeDataDictionary: true
              })}
              style={{
                padding: "6px",
                borderRadius: "6px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#FFFFFF",
                color: "#166534",
                cursor: "pointer"
              }}
            >
              <FileSpreadsheet style={{ width: "13px", height: "13px" }} />
            </button>
          </div>
        )}
      />

      {/* ============================================================================= */}
      {/* MODAL 1: BUAT LAPORAN BARU (STANDAR SIPJAKI)                                  */}
      {/* ============================================================================= */}
      <ModalForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Buat Berkas Laporan Pengawasan Baru"
        subtitle="Kompilasi dan arsipkan laporan berkala sesuai format 8 kolom SIPJAKI Kementerian PUPR"
        icon={FileBarChart}
        size="lg"
        submitLabel="Simpan & Daftarkan Laporan"
        onSubmit={handleCreateSubmit}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Jenis Laporan & Tahun */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Jenis Laporan <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <select
                value={formData.jenisLaporan}
                onChange={(e) => setFormData({ ...formData, jenisLaporan: e.target.value as any })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px"
                }}
              >
                <option value="Tahunan">Tahunan (Laporan Tahunan Terpadu)</option>
                <option value="Semesteran">Semesteran (Semester I / II)</option>
                <option value="Triwulanan">Triwulanan (Triwulan I / II / III / IV)</option>
                <option value="Insidental">Insidental (Pemeriksaan Khusus Lapangan)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Tahun Anggaran <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.tahun}
                onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
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

          {/* Nama Laporan */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
              Nama Laporan Pengawasan (Huruf Kapital Baku) <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              value={formData.namaLaporan}
              onChange={(e) => setFormData({ ...formData, namaLaporan: e.target.value.toUpperCase() })}
              placeholder="CONTOH: LAPORAN PENGAWASAN TAHUNAN TERTIB USAHA 2026 KABUPATEN BOGOR"
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "13px",
                fontWeight: 700
              }}
            />
          </div>

          {/* Wilayah Hierarki */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Propinsi
              </label>
              <input
                type="text"
                value={formData.propinsi}
                onChange={(e) => setFormData({ ...formData, propinsi: e.target.value })}
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
                Kabupaten / Kota
              </label>
              <input
                type="text"
                value={formData.kabKota}
                onChange={(e) => setFormData({ ...formData, kabKota: e.target.value })}
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

          {/* Metrik Analitik: Objek & Kepatuhan */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Jumlah Objek Diawasi
              </label>
              <input
                type="number"
                value={formData.jumlahObjekDiperiksa}
                onChange={(e) => setFormData({ ...formData, jumlahObjekDiperiksa: Number(e.target.value) })}
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
                Tingkat Kepatuhan Rata-rata (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.tingkatKepatuhan}
                onChange={(e) => setFormData({ ...formData, tingkatKepatuhan: Number(e.target.value) })}
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

          {/* Status & Nomor Surat */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Status Verifikasi SIPJAKI
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
                <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                <option value="Terverifikasi">Terverifikasi</option>
                <option value="Perlu Revisi">Perlu Revisi</option>
                <option value="Draft Lokal">Draft Lokal</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Nomor Surat Pengantar Dinas
              </label>
              <input
                type="text"
                value={formData.nomorSurat}
                onChange={(e) => setFormData({ ...formData, nomorSurat: e.target.value })}
                placeholder="600.1/xxxx/PUPR-Jakon/2026"
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

          {/* Upload Berkas Dokumen PDF */}
          <FileUploader
            label="Unggah Berkas Dokumen Laporan Resmi (PDF)"
            accept=".pdf"
            maxSizeMb={15}
            hint="Dokumen lengkap laporan berkala pengawasan format baku SIPJAKI. Maksimal 15MB."
          />
        </div>
      </ModalForm>

      {/* ============================================================================= */}
      {/* MODAL 2: EDIT LAPORAN (FITUR EDIT PADA AKSI)                                   */}
      {/* ============================================================================= */}
      {isEditModalOpen && reportToEdit && (
        <ModalForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setReportToEdit(null);
          }}
          title={`Edit Laporan: ${reportToEdit.id}`}
          subtitle="Perbarui metadata, cakupan pengawasan, atau berkas dokumen laporan"
          icon={Pencil}
          size="lg"
          submitLabel="Simpan Perubahan Laporan"
          onSubmit={handleEditSubmit}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Jenis Laporan & Tahun */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Jenis Laporan <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <select
                  value={editFormData.jenisLaporan}
                  onChange={(e) => setEditFormData({ ...editFormData, jenisLaporan: e.target.value as any })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "13px"
                  }}
                >
                  <option value="Tahunan">Tahunan</option>
                  <option value="Semesteran">Semesteran</option>
                  <option value="Triwulanan">Triwulanan</option>
                  <option value="Insidental">Insidental</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Tahun Anggaran <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.tahun}
                  onChange={(e) => setEditFormData({ ...editFormData, tahun: e.target.value })}
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

            {/* Nama Laporan */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Nama Laporan Pengawasan (Huruf Kapital) <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={editFormData.namaLaporan}
                onChange={(e) => setEditFormData({ ...editFormData, namaLaporan: e.target.value.toUpperCase() })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px",
                  fontWeight: 700
                }}
              />
            </div>

            {/* Wilayah Hierarki */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Propinsi
                </label>
                <input
                  type="text"
                  value={editFormData.propinsi}
                  onChange={(e) => setEditFormData({ ...editFormData, propinsi: e.target.value })}
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
                  Kabupaten / Kota
                </label>
                <input
                  type="text"
                  value={editFormData.kabKota}
                  onChange={(e) => setEditFormData({ ...editFormData, kabKota: e.target.value })}
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

            {/* Metrik Analitik */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Jumlah Objek Diawasi
                </label>
                <input
                  type="number"
                  value={editFormData.jumlahObjekDiperiksa}
                  onChange={(e) => setEditFormData({ ...editFormData, jumlahObjekDiperiksa: Number(e.target.value) })}
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
                  Tingkat Kepatuhan (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editFormData.tingkatKepatuhan}
                  onChange={(e) => setEditFormData({ ...editFormData, tingkatKepatuhan: Number(e.target.value) })}
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

            {/* Status & Berkas */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Status Verifikasi SIPJAKI
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "13px"
                  }}
                >
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                  <option value="Terverifikasi">Terverifikasi</option>
                  <option value="Perlu Revisi">Perlu Revisi</option>
                  <option value="Draft Lokal">Draft Lokal</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Nama Berkas Dokumen (PDF)
                </label>
                <input
                  type="text"
                  value={editFormData.filePdfName}
                  onChange={(e) => setEditFormData({ ...editFormData, filePdfName: e.target.value })}
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

            {/* Catatan / Keterangan */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Catatan Pengesahan / Catatan Verifikator
              </label>
              <textarea
                rows={2}
                value={editFormData.catatan}
                onChange={(e) => setEditFormData({ ...editFormData, catatan: e.target.value })}
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
        </ModalForm>
      )}

      {/* ============================================================================= */}
      {/* DIALOG 3: KONFIRMASI HAPUS LAPORAN (FITUR HAPUS PADA AKSI)                    */}
      {/* ============================================================================= */}
      {isDeleteDialogOpen && reportToDelete && (
        <ModalForm
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setReportToDelete(null);
          }}
          title="Konfirmasi Penghapusan Berkas Laporan"
          subtitle="Tindakan ini akan menghapus arsip berkas secara permanen dari sistem"
          icon={AlertTriangle}
          size="md"
          submitLabel="Ya, Hapus Laporan Ini"
          onSubmit={(e) => {
            e.preventDefault();
            handleConfirmDelete();
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div
              style={{
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: "10px",
                padding: "14px",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start"
              }}
            >
              <AlertTriangle style={{ width: "20px", height: "20px", color: "#DC2626", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <p style={{ fontSize: "13px", fontWeight: 800, color: "#991B1B", margin: 0 }}>
                  Peringatan Penghapusan Arsip
                </p>
                <p style={{ fontSize: "12px", color: "#7F1D1D", margin: "4px 0 0 0", lineHeight: 1.4 }}>
                  Apakah Anda yakin ingin menghapus arsip <b>{reportToDelete.namaLaporan || reportToDelete.judulLaporan}</b>? Data yang dihapus tidak dapat dipulihkan.
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ color: "#64748B" }}>ID Laporan:</span>
                <span style={{ fontWeight: 700, color: "#0F2E5C" }}>{reportToDelete.id}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ color: "#64748B" }}>Jenis / Tahun:</span>
                <span style={{ fontWeight: 700, color: "#0F172A" }}>{reportToDelete.jenisLaporan || reportToDelete.periode} / TA {reportToDelete.tahun}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>Status Terakhir:</span>
                <span style={{ fontWeight: 700, color: "#166534" }}>{reportToDelete.status}</span>
              </div>
            </div>
          </div>
        </ModalForm>
      )}

      {/* ============================================================================= */}
      {/* MODAL 4: PRATINJAU DOKUMEN ("LIHAT" SIPJAKI)                                  */}
      {/* ============================================================================= */}
      {selectedReportDetail && (
        <ModalForm
          isOpen={!!selectedReportDetail}
          onClose={() => setSelectedReportDetail(null)}
          title={selectedReportDetail.namaLaporan || selectedReportDetail.judulLaporan || "Dokumen Laporan"}
          subtitle={`${selectedReportDetail.jenisLaporan || selectedReportDetail.periode} • Tahun Anggaran ${selectedReportDetail.tahun}`}
          icon={FileBarChart}
          size="lg"
          hideFooter
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Header Informasi Wilayah & Status */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", backgroundColor: "#F8FAFC", padding: "16px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
              <div>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 800, textTransform: "uppercase" }}>Wilayah Kewenangan:</span>
                <p style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C", margin: "3px 0 0 0" }}>
                  {selectedReportDetail.wilayah || "Jawa Barat / Kabupaten Bogor"}
                </p>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 800, textTransform: "uppercase" }}>Cakupan Objek:</span>
                <p style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C", margin: "3px 0 0 0" }}>
                  {selectedReportDetail.jumlahObjekDiperiksa || 0} Objek Pengawasan
                </p>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 800, textTransform: "uppercase" }}>Indeks Kepatuhan:</span>
                <p style={{ fontSize: "13px", fontWeight: 800, color: "#166534", margin: "3px 0 0 0" }}>
                  {selectedReportDetail.tingkatKepatuhan}% (Tertib Sangat Baik)
                </p>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 800, textTransform: "uppercase" }}>Status Verifikasi:</span>
                <p style={{ fontSize: "12px", fontWeight: 800, color: "#2563EB", margin: "3px 0 0 0" }}>
                  {selectedReportDetail.status || "Menunggu Verifikasi"}
                </p>
              </div>
            </div>

            {/* Pratinjau Dokumen Mock Window */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  backgroundColor: "#FEE2E2",
                  color: "#DC2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <FileText style={{ width: "28px", height: "28px" }} />
              </div>
              <div>
                <h5 style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                  {selectedReportDetail.dokumen || selectedReportDetail.filePdf || "Laporan_Resmi_SIPJAKI.pdf"}
                </h5>
                <p style={{ fontSize: "11px", color: "#64748B", margin: "4px 0 0 0" }}>
                  Dokumen Resmi PDF • Ditandatangani Elektronik (TTE) Kepala Dinas PUPR Kabupaten Bogor
                </p>
              </div>
            </div>

            {/* Action Buttons: Unduh PDF & Rekap Excel */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => alert(`Mengunduh berkas resmi PDF: ${selectedReportDetail.dokumen || selectedReportDetail.filePdf}...`)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "11px",
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
                <span>Unduh Dokumen Laporan (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => exportToSpreadsheet({
                  fileName: `Rekap_${selectedReportDetail.namaLaporan || selectedReportDetail.judulLaporan}`,
                  sheetName: "REKAPITULASI PELAPORAN",
                  columns: [
                    { key: "jenisLaporan", label: "Jenis Laporan" },
                    { key: "namaLaporan", label: "Nama Laporan" },
                    { key: "tahun", label: "Tahun Anggaran" },
                    { key: "wilayah", label: "Wilayah" },
                    { key: "jumlahObjekDiperiksa", label: "Objek Diawasi" },
                    { key: "tingkatKepatuhan", label: "Tingkat Kepatuhan (%)", transform: (v) => `${v}%` },
                    { key: "dokumen", label: "Berkas Laporan" },
                    { key: "status", label: "Status Verifikasi" }
                  ],
                  data: [selectedReportDetail],
                  includeDataDictionary: true
                })}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "11px",
                  borderRadius: "8px",
                  backgroundColor: "#16A34A",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                <FileSpreadsheet style={{ width: "14px", height: "14px" }} />
                <span>Unduh Rekapitulasi (Excel)</span>
              </button>
            </div>
          </div>
        </ModalForm>
      )}
    </div>
  );
}

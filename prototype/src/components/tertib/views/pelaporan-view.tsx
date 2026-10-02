"use client";
import React, { useState } from "react";
import ModuleHeader from "@/components/layout/module-header";
import { TertibType, TERTIB_CONFIGS } from "@/lib/tertib-config";
import { mockPelaporanRecords, PelaporanRecord } from "@/data/tertib-mock-data";
import { 
  FileBarChart, Download, RefreshCw, CheckCircle2, 
  FileSpreadsheet, FileText, Send, Plus, Eye, 
  Trash2, Globe, ShieldCheck, Database, Calendar
} from "lucide-react";
import DataTableView, { ColumnDef } from "@/components/common/data-table-view";
import ModalForm from "@/components/common/modal-form";
import FileUploader from "@/components/common/file-uploader";
import StatusBadge from "@/components/common/status-badge";
import { exportToSpreadsheet } from "@/lib/export-utils";

interface PelaporanViewProps {
  tertibType: TertibType;
}

export default function PelaporanView({ tertibType }: PelaporanViewProps) {
  const config = TERTIB_CONFIGS[tertibType];
  const [data, setData] = useState<PelaporanRecord[]>(() =>
    mockPelaporanRecords.filter((r) => r.tertibType === tertibType)
  );

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("2026-04-05 14:30 WIB");

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReportDetail, setSelectedReportDetail] = useState<PelaporanRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    judulLaporan: `Laporan Hasil Pengawasan ${config.shortTitle} Semester I TA 2026`,
    periode: "Semester I",
    tahun: "2026",
    jumlahObjekDiperiksa: 24,
    tingkatKepatuhan: 87.5,
    filePdfName: `Laporan_${config.slug}_Sem1_2026.pdf`,
    fileExcelName: `Rekap_${config.slug}_Sem1_2026.xlsx`
  });

  // Calculate Metrics
  const totalObjek = data.reduce((acc, curr) => acc + curr.jumlahObjekDiperiksa, 0);
  const avgKepatuhan = data.length > 0 
    ? Math.round(data.reduce((acc, curr) => acc + curr.tingkatKepatuhan, 0) / data.length)
    : 0;
  const syncedCount = data.filter((r) => r.statusSinkronisasiSipjaki === "Tersinkronisasi").length;

  // Handle Sync to National Gateway
  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const updated = data.map((r) => ({
        ...r,
        statusSinkronisasiSipjaki: "Tersinkronisasi" as const,
        tanggalKirim: new Date().toISOString().split("T")[0]
      }));
      setData(updated);
      setIsSyncing(false);
      const nowStr = new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) + " WIB";
      setLastSyncTime(nowStr);
      alert(`Sinkronisasi Gateway SIPJAKI Kementerian PUPR Berhasil!\n\nSeluruh ${data.length} paket laporan ${config.shortTitle} telah terkirim dan tercatat di repositori Satu Data Jakon Nasional.`);
    }, 1200);
  };

  // Handle Create Report
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judulLaporan) {
      alert("Harap lengkapi judul laporan!");
      return;
    }

    const newId = `LAP-${tertibType === "tertib-usaha" ? "TU" : tertibType === "tertib-penyelenggaraan" ? "TP" : "TM"}-${String(data.length + 1).padStart(3, "0")}`;
    const newReport: PelaporanRecord = {
      id: newId,
      tertibType: tertibType,
      judulLaporan: formData.judulLaporan,
      periode: formData.periode,
      tahun: formData.tahun,
      jumlahObjekDiperiksa: Number(formData.jumlahObjekDiperiksa) || 1,
      tingkatKepatuhan: Number(formData.tingkatKepatuhan) || 80,
      statusSinkronisasiSipjaki: "Draft Lokal",
      tanggalKirim: "-",
      filePdf: formData.filePdfName,
      fileExcel: formData.fileExcelName
    };

    setData([newReport, ...data]);
    setIsCreateModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus arsip laporan ini?")) {
      setData((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Table Columns
  const tableColumns: ColumnDef<PelaporanRecord>[] = [
    {
      key: "judulLaporan",
      label: "JUDUL LAPORAN PENGWASAN",
      render: (row) => (
        <div>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", lineHeight: 1.35 }}>
            {row.judulLaporan}
          </div>
          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "3px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontWeight: 700, color: "#0F2E5C" }}>Periode: {row.periode}</span>
            <span>•</span>
            <span>TA {row.tahun}</span>
          </div>
        </div>
      )
    },
    {
      key: "jumlahObjekDiperiksa",
      label: "OBJEK AUDIT",
      width: "120px",
      align: "center",
      render: (row) => (
        <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C" }}>
          {row.jumlahObjekDiperiksa} Objek
        </span>
      )
    },
    {
      key: "tingkatKepatuhan",
      label: "KEPATUHAN",
      width: "120px",
      align: "center",
      render: (row) => (
        <span
          style={{
            fontSize: "11px",
            fontWeight: 800,
            padding: "3px 8px",
            borderRadius: "6px",
            backgroundColor: row.tingkatKepatuhan >= 80 ? "#DCFCE7" : "#FEF3C7",
            color: row.tingkatKepatuhan >= 80 ? "#166534" : "#92400E"
          }}
        >
          {row.tingkatKepatuhan}%
        </span>
      )
    },
    {
      key: "statusSinkronisasiSipjaki",
      label: "STATUS SIPJAKI",
      width: "160px",
      align: "center",
      render: (row) => (
        <span
          style={{
            fontSize: "10px",
            fontWeight: 800,
            padding: "3px 8px",
            borderRadius: "6px",
            backgroundColor:
              row.statusSinkronisasiSipjaki === "Tersinkronisasi"
                ? "#DCFCE7"
                : row.statusSinkronisasiSipjaki === "Menunggu Verifikasi Pusat"
                ? "#FEF3C7"
                : "#F1F5F9",
            color:
              row.statusSinkronisasiSipjaki === "Tersinkronisasi"
                ? "#166534"
                : row.statusSinkronisasiSipjaki === "Menunggu Verifikasi Pusat"
                ? "#92400E"
                : "#475569"
          }}
        >
          {row.statusSinkronisasiSipjaki}
        </span>
      )
    },
    {
      key: "tanggalKirim",
      label: "TANGGAL KIRIM",
      width: "120px",
      align: "center",
      render: (row) => (
        <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>
          {row.tanggalKirim}
        </span>
      )
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
        description="Penyusunan laporan berkala pengawasan konstruksi Kabupaten Bogor dalam format integrasi SIPJAKI Kementerian PUPR."
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
          padding: "18px 22px",
          borderRadius: "18px",
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
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              backgroundColor: "#DCFCE7",
              color: "#166534",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <CheckCircle2 style={{ width: "24px", height: "24px" }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0F2E5C", margin: 0 }}>
                Koneksi Gateway SIPJAKI Nasional Aktif & Terhubung
              </h4>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#166534", backgroundColor: "#DCFCE7", padding: "2px 8px", borderRadius: "9999px" }}>
                API v1 LIVE
              </span>
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
            padding: "9px 16px",
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
          <RefreshCw style={{ width: "14px", height: "14px", animation: isSyncing ? "spin 1s linear infinite" : "none" }} />
          <span>{isSyncing ? "Proses Pengiriman..." : "Sinkronisasi Sekarang"}</span>
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
              Total Objek Terlapor
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
                100% Sesuai Rencana
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
                Kategori Tertib Sangat Baik
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Sinkronisasi SIPJAKI */}
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
              Sinkronisasi SIPJAKI
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
              {syncedCount} / {data.length} Paket
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#2563EB" }} />
              <span style={{ fontSize: "11px", color: "#2563EB", fontWeight: 700 }}>
                Status Verified Nasional
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
              Periode Pelaporan
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
              {data.length} Berkas
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ fontSize: "11px", color: "#64748B" }}>
                Semester I & II TA 2026
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DataTableView */}
      <DataTableView<PelaporanRecord>
        title={`Daftar Berkas Pelaporan Berkala (${data.length} Periode)`}
        subtitle="Arsip pelaporan hasil pengawasan per semester yang telah disahkan Kepala Dinas PUPR"
        data={data}
        columns={tableColumns}
        exportFileName={`Laporan_${tertibType}_SIPJAKI`}
        actionsHeader="BERKAS & AKSI"
        actionsRender={(row) => (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <button
              type="button"
              title="Lihat Pratinjau Lembar Ringkasan"
              onClick={() => setSelectedReportDetail(row)}
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

            <button
              type="button"
              title="Unduh Laporan Resmi (PDF)"
              onClick={() => alert(`Mengunduh berkas laporan ${row.filePdf}...`)}
              style={{
                padding: "6px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#F1F5F9",
                color: "#0F2E5C",
                cursor: "pointer"
              }}
            >
              <FileText style={{ width: "13px", height: "13px" }} />
            </button>

            <button
              type="button"
              title="Unduh Rekapitulasi (Excel)"
              onClick={() => exportToSpreadsheet({
                fileName: row.fileExcel ? row.fileExcel.replace(/\.xlsx$/, "") : `Rekap_Pelaporan_${row.periode}_${tertibType}`,
                sheetName: "REKAPITULASI PELAPORAN",
                columns: [
                  { key: "periode", label: "Periode Pelaporan" },
                  { key: "tahun", label: "Tahun Anggaran" },
                  { key: "judulLaporan", label: "Judul Laporan" },
                  { key: "totalObjekDiawasi", label: "Total Objek Diawasi" },
                  { key: "statusTertib", label: "Objek Tertib" },
                  { key: "statusBelumTertib", label: "Objek Belum Tertib" },
                  { key: "tingkatKepatuhan", label: "Tingkat Kepatuhan (%)", transform: (v) => `${v}%` },
                  { key: "nomorSuratPengantar", label: "Nomor Surat Pengantar" },
                  { key: "statusVerifikasiKementerian", label: "Status Verifikasi Kementerian" }
                ],
                data: [row],
                includeDataDictionary: true
              })}
              style={{
                padding: "6px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#DCFCE7",
                color: "#166534",
                cursor: "pointer"
              }}
            >
              <FileSpreadsheet style={{ width: "13px", height: "13px" }} />
            </button>

            <button
              type="button"
              title="Hapus Laporan"
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

      {/* Modal Buat Laporan Baru */}
      <ModalForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Buat Laporan Periode Pengawasan Baru"
        subtitle="Kompilasi hasil audit lapangan dan indeks kepatuhan untuk sinkronisasi SIPJAKI"
        icon={FileBarChart}
        size="lg"
        submitLabel="Simpan & Arsipkan Laporan"
        onSubmit={handleCreateSubmit}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
              Judul Laporan Pengawasan <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              value={formData.judulLaporan}
              onChange={(e) => setFormData({ ...formData, judulLaporan: e.target.value })}
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
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Periode Laporan
              </label>
              <select
                value={formData.periode}
                onChange={(e) => setFormData({ ...formData, periode: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px"
                }}
              >
                <option value="Semester I">Semester I (Januari - Juni)</option>
                <option value="Semester II">Semester II (Juli - Desember)</option>
                <option value="Tahunan">Laporan Tahunan Terpadu</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Tahun Anggaran
              </label>
              <input
                type="text"
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Jumlah Objek Diperiksa
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

          {/* File Upload Laporan PDF */}
          <FileUploader
            label="Unggah Berkas Laporan Resmi yang Ditetapkan (PDF)"
            accept=".pdf"
            maxSizeMb={15}
            hint="Dokumen lengkap laporan berkala pengawasan format baku SIPJAKI. Maksimal 15MB."
          />
        </div>
      </ModalForm>

      {/* Modal Detail / Pratinjau Lembar Ringkasan */}
      {selectedReportDetail && (
        <ModalForm
          isOpen={!!selectedReportDetail}
          onClose={() => setSelectedReportDetail(null)}
          title={selectedReportDetail.judulLaporan}
          subtitle={`Periode: ${selectedReportDetail.periode} TA ${selectedReportDetail.tahun}`}
          icon={FileBarChart}
          size="lg"
          hideFooter
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", backgroundColor: "#F8FAFC", padding: "14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
              <div>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700 }}>Cakupan Audit:</span>
                <p style={{ fontSize: "14px", fontWeight: 800, color: "#0F2E5C", margin: "2px 0 0 0" }}>
                  {selectedReportDetail.jumlahObjekDiperiksa} Objek Pemeriksaan
                </p>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700 }}>Indeks Kepatuhan:</span>
                <p style={{ fontSize: "14px", fontWeight: 800, color: "#166534", margin: "2px 0 0 0" }}>
                  {selectedReportDetail.tingkatKepatuhan}% (Tertib Penuh)
                </p>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700 }}>Status Sinkronisasi Gateway:</span>
                <p style={{ fontSize: "12px", fontWeight: 800, color: "#2563EB", margin: "2px 0 0 0" }}>
                  {selectedReportDetail.statusSinkronisasiSipjaki}
                </p>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700 }}>Waktu Pengiriman API:</span>
                <p style={{ fontSize: "12px", fontWeight: 800, color: "#475569", margin: "2px 0 0 0" }}>
                  {selectedReportDetail.tanggalKirim}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => alert(`Mengunduh ${selectedReportDetail.filePdf}...`)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "10px",
                  borderRadius: "8px",
                  backgroundColor: "#0F2E5C",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                <Download style={{ width: "13px", height: "13px", color: "#FFC000" }} />
                <span>Unduh Dokumen Laporan (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => exportToSpreadsheet({
                  fileName: selectedReportDetail.fileExcel ? selectedReportDetail.fileExcel.replace(/\.xlsx$/, "") : `Rekap_Pelaporan_${selectedReportDetail.periode}_${tertibType}`,
                  sheetName: "REKAPITULASI PELAPORAN",
                  columns: [
                    { key: "periode", label: "Periode Pelaporan" },
                    { key: "tahun", label: "Tahun Anggaran" },
                    { key: "judulLaporan", label: "Judul Laporan" },
                    { key: "totalObjekDiawasi", label: "Total Objek Diawasi" },
                    { key: "statusTertib", label: "Objek Tertib" },
                    { key: "statusBelumTertib", label: "Objek Belum Tertib" },
                    { key: "tingkatKepatuhan", label: "Tingkat Kepatuhan (%)", transform: (v) => `${v}%` },
                    { key: "nomorSuratPengantar", label: "Nomor Surat Pengantar" },
                    { key: "statusVerifikasiKementerian", label: "Status Verifikasi Kementerian" }
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
                  padding: "10px",
                  borderRadius: "8px",
                  backgroundColor: "#16A34A",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                <FileSpreadsheet style={{ width: "13px", height: "13px" }} />
                <span>Unduh Rekapitulasi (Excel)</span>
              </button>
            </div>
          </div>
        </ModalForm>
      )}
    </div>
  );
}

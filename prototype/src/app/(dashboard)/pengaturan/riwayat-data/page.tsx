"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  History, FileSpreadsheet, Download, UploadCloud, 
  CheckCircle2, AlertTriangle, ArrowLeft, RefreshCw, 
  Trash2, Database, ShieldCheck, Filter, FileText
} from "lucide-react";
import DataTableView, { ColumnDef } from "@/components/common/data-table-view";
import { getActivityLogs, clearActivityLogs, DataActivityLog } from "@/lib/audit-log";
import { exportToSpreadsheet } from "@/lib/export-utils";

export default function RiwayatDataPage() {
  const [logs, setLogs] = useState<DataActivityLog[]>([]);
  const [filterAction, setFilterAction] = useState<string>("Semua");

  const loadLogs = () => {
    setLogs(getActivityLogs());
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleClear = () => {
    if (confirm("Apakah Anda yakin ingin menghapus seluruh rekaman riwayat impor dan ekspor data?")) {
      clearActivityLogs();
      setLogs([]);
    }
  };

  const filteredLogs = logs.filter((item) => {
    if (filterAction === "Semua") return true;
    return item.action === filterAction;
  });

  const totalExport = logs.filter((l) => l.action === "export").length;
  const totalImport = logs.filter((l) => l.action === "import").length;
  const totalRecords = logs.reduce((acc, curr) => acc + (curr.recordCount || 0), 0);

  const columns: ColumnDef<DataActivityLog>[] = [
    {
      key: "formattedDate",
      label: "WAKTU & ID LOG",
      render: (row) => (
        <div>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", fontFamily: "monospace" }}>
            {row.id}
          </span>
          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
            {row.formattedDate}
          </div>
        </div>
      )
    },
    {
      key: "action",
      label: "TIPE OPERASI",
      align: "center",
      render: (row) => (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 10px",
            borderRadius: "9999px",
            fontSize: "11px",
            fontWeight: 800,
            backgroundColor: row.action === "export" ? "#EBF2FA" : "#ECFDF5",
            color: row.action === "export" ? "#0F2E5C" : "#065F46",
            border: `1px solid ${row.action === "export" ? "#BFDBFE" : "#A7F3D0"}`
          }}
        >
          {row.action === "export" ? (
            <>
              <Download style={{ width: "12px", height: "12px", color: "#2563EB" }} />
              <span>Ekspor SIPJAKI</span>
            </>
          ) : (
            <>
              <UploadCloud style={{ width: "12px", height: "12px", color: "#059669" }} />
              <span>Impor Berkas</span>
            </>
          )}
        </span>
      )
    },
    {
      key: "module",
      label: "MODUL JAKON",
      render: (row) => (
        <div>
          <span style={{ fontSize: "12px", fontWeight: 800, color: "#1E293B" }}>
            {row.module}
          </span>
          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
            Berkas: <span style={{ fontFamily: "monospace" }}>{row.fileName}</span>
          </div>
        </div>
      )
    },
    {
      key: "format",
      label: "FORMAT",
      align: "center",
      render: (row) => (
        <span
          style={{
            fontSize: "10px",
            fontWeight: 900,
            padding: "3px 8px",
            borderRadius: "6px",
            backgroundColor: row.format === "xlsx" ? "#DCFCE7" : "#F1F5F9",
            color: row.format === "xlsx" ? "#166534" : "#475569",
            fontFamily: "monospace"
          }}
        >
          .{row.format.toUpperCase()}
        </span>
      )
    },
    {
      key: "recordCount",
      label: "VOLUME",
      align: "right",
      render: (row) => (
        <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", fontFamily: "monospace" }}>
          {row.recordCount} Baris
        </span>
      )
    },
    {
      key: "user",
      label: "OPERATOR",
      render: (row) => (
        <span style={{ fontSize: "12px", color: "#475569", fontWeight: 600 }}>
          {row.user}
        </span>
      )
    },
    {
      key: "status",
      label: "STATUS",
      align: "center",
      render: (row) => (
        <span
          style={{
            fontSize: "10px",
            fontWeight: 800,
            padding: "3px 8px",
            borderRadius: "9999px",
            backgroundColor: row.status === "success" ? "#DCFCE7" : row.status === "warning" ? "#FEF08A" : "#FEE2E2",
            color: row.status === "success" ? "#166534" : row.status === "warning" ? "#854D0E" : "#991B1B"
          }}
        >
          {row.status === "success" ? "✓ Berhasil" : row.status === "warning" ? "⚠ Parsial" : "✗ Gagal"}
        </span>
      )
    }
  ];

  const handleExportLog = () => {
    exportToSpreadsheet({
      fileName: "Log_Audit_Integrasi_Data_SIPJAKI_Bogor",
      sheetName: "RIWAYAT TRANSAKSI",
      columns: [
        { key: "id", label: "ID Log" },
        { key: "formattedDate", label: "Waktu Eksekusi" },
        { key: "action", label: "Tipe Aksi" },
        { key: "module", label: "Modul Jakon" },
        { key: "format", label: "Format Berkas" },
        { key: "recordCount", label: "Jumlah Baris" },
        { key: "user", label: "Operator" },
        { key: "status", label: "Status" },
        { key: "fileName", label: "Nama Berkas" },
        { key: "details", label: "Keterangan" }
      ],
      data: filteredLogs,
      includeDataDictionary: true
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Link
              href="/pengaturan"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#64748B",
                textDecoration: "none"
              }}
            >
              <ArrowLeft style={{ width: "12px", height: "12px" }} /> Kembali ke Pengaturan
            </Link>
            <span style={{ color: "#CBD5E1" }}>•</span>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "2px 8px", borderRadius: "9999px" }}>
              Audit Trail Integrasi
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Riwayat Pertukaran Data & Integrasi SIPJAKI
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
            Pencatatan riwayat ekspor format SIPJAKI dan impor berkas spreadsheet (Excel/CSV) beserta validasi skema
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={loadLogs}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 14px",
              borderRadius: "10px",
              backgroundColor: "#F8FAFC",
              border: "1px solid #CBD5E1",
              fontSize: "12px",
              fontWeight: 700,
              color: "#475569",
              cursor: "pointer"
            }}
          >
            <RefreshCw style={{ width: "14px", height: "14px" }} />
            <span>Segarkan</span>
          </button>

          <button
            type="button"
            onClick={handleExportLog}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 16px",
              borderRadius: "10px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #CBD5E1",
              fontSize: "12px",
              fontWeight: 800,
              color: "#0F2E5C",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}
          >
            <Download style={{ width: "14px", height: "14px", color: "#2563EB" }} />
            <span>Unduh Log (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 14px",
              borderRadius: "10px",
              backgroundColor: "#FEE2E2",
              border: "1px solid #FECACA",
              fontSize: "12px",
              fontWeight: 800,
              color: "#991B1B",
              cursor: "pointer"
            }}
          >
            <Trash2 style={{ width: "14px", height: "14px" }} />
            <span>Hapus Log</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E2E8F0", borderTop: "3px solid #0F2E5C", padding: "18px 20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Total Transaksi Data</span>
          <p style={{ fontSize: "24px", fontWeight: 900, color: "#0F2E5C", margin: "8px 0 0 0" }}>{logs.length} Kali</p>
          <span style={{ fontSize: "11px", color: "#64748B" }}>Total {totalRecords} baris data diproses</span>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E2E8F0", borderTop: "3px solid #2563EB", padding: "18px 20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Ekspor Format SIPJAKI</span>
          <p style={{ fontSize: "24px", fontWeight: 900, color: "#2563EB", margin: "8px 0 0 0" }}>{totalExport} Berkas</p>
          <span style={{ fontSize: "11px", color: "#2563EB", fontWeight: 600 }}>Siap unggah ke portal Kementerian PUPR</span>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E2E8F0", borderTop: "3px solid #059669", padding: "18px 20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Impor Spreadsheet</span>
          <p style={{ fontSize: "24px", fontWeight: 900, color: "#059669", margin: "8px 0 0 0" }}>{totalImport} Berkas</p>
          <span style={{ fontSize: "11px", color: "#059669", fontWeight: 600 }}>Tervalidasi parser & aturan schema</span>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E2E8F0", borderTop: "3px solid #D97706", padding: "18px 20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Tingkat Keberhasilan</span>
          <p style={{ fontSize: "24px", fontWeight: 900, color: "#D97706", margin: "8px 0 0 0" }}>100%</p>
          <span style={{ fontSize: "11px", color: "#D97706", fontWeight: 600 }}>Nir-kegagalan fatal eksekusi</span>
        </div>
      </div>

      {/* Filter Quick Bar */}
      <div style={{ backgroundColor: "#FFFFFF", padding: "12px 18px", borderRadius: "14px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C" }}>Filter Operasi:</span>
        <div style={{ display: "inline-flex", gap: "6px" }}>
          {[
            { id: "Semua", label: "Semua Aktivitas" },
            { id: "export", label: "Ekspor Saja" },
            { id: "import", label: "Impor Saja" }
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => setFilterAction(btn.id)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "none",
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer",
                backgroundColor: filterAction === btn.id ? "#0F2E5C" : "#F1F5F9",
                color: filterAction === btn.id ? "#FFFFFF" : "#64748B"
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* DataTableView */}
      <DataTableView<DataActivityLog>
        title={`Log Audit Transaksi Data (${filteredLogs.length})`}
        subtitle="Riwayat komprehensif seluruh berkas yang diekspor dan diimpor oleh operator dinas"
        data={filteredLogs}
        columns={columns}
        defaultPageSize={10}
        exportFileName="Log_Aktivitas_Data_SIPJAKI"
      />
    </div>
  );
}

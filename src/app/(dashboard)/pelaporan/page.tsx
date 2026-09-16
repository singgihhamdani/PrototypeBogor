"use client";
import { useState } from "react";
import { 
  FileBarChart, Download, RefreshCw, CheckCircle2, 
  Calendar, FileSpreadsheet, FileText
} from "lucide-react";

export default function PelaporanPage() {
  const [syncing, setSyncing] = useState(false);
  const [period, setPeriod] = useState("Semester I - 2026");

  const reports = [
    {
      id: "LAP-TU-2026-S1",
      title: "Laporan Pengawasan Tertib Usaha Jasa Konstruksi",
      category: "Pilar 1: Tertib Usaha",
      status: "Terkirim & Terverifikasi",
      date: "2026-07-15",
      coverage: "10 BUJK Diperiksa",
      score: "85% (Kategori Tertib)",
      format: "XLSX & PDF"
    },
    {
      id: "LAP-TP-2026-S1",
      title: "Laporan Pengawasan Tertib Penyelenggaraan Konstruksi",
      category: "Pilar 2: Penyelenggaraan",
      status: "Terkirim & Terverifikasi",
      date: "2026-07-20",
      coverage: "8 Paket Proyek APBD/DAK",
      score: "78% (Kategori Cukup Tertib)",
      format: "XLSX & PDF"
    },
    {
      id: "LAP-TM-2026-S1",
      title: "Laporan Pengawasan Tertib Pemanfaatan Produk Konstruksi",
      category: "Pilar 3: Pemanfaatan",
      status: "Dalam Peninjauan Pusat",
      date: "2026-08-05",
      coverage: "5 Bangunan Gedung Publik",
      score: "72% (Kategori Cukup Tertib)",
      format: "XLSX & PDF"
    },
    {
      id: "LAP-TKK-2026-S1",
      title: "Rekapitulasi Pengembangan & Sertifikasi SKK TKK",
      category: "Pilar 5: SDM / TKK",
      status: "Terkirim & Terverifikasi",
      date: "2026-08-10",
      coverage: "85 TKK Tersertifikasi",
      score: "90% (Sangat Baik)",
      format: "XLSX"
    },
    {
      id: "LAP-K3-2026-BLN",
      title: "Laporan Kejadian Kecelakaan Kerja & Penerapan SMKK",
      category: "SMKK & Keselamatan",
      status: "Terkirim & Terverifikasi",
      date: "2026-09-01",
      coverage: "3 Insiden (0 Fatalitas)",
      score: "100% Zero Accident",
      format: "XLSX & Dokumen K3"
    }
  ];

  const handleSyncAll = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      alert("Semua laporan periode aktif berhasil disinkronkan ke server SIPJAKI Pusat!");
    }, 1500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <FileBarChart style={{ width: "12px", height: "12px" }} /> Pelaporan Berkala
            </span>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669", backgroundColor: "#ECFDF5", padding: "3px 10px", borderRadius: "9999px" }}>
              Standar Permen PUPR 1/2023
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Pelaporan & Ekspor Sinkronisasi SIPJAKI
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
            Kompilasi rekapitulasi 5 pilar pengawasan jasa konstruksi Kab. Bogor dan pengiriman berkala ke Kementerian PUPR
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={handleSyncAll}
            disabled={syncing}
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
            <RefreshCw style={{ width: "15px", height: "15px" }} />
            <span>{syncing ? "Menyinkronkan..." : "Kirim Semua ke SIPJAKI"}</span>
          </button>
        </div>
      </div>

      {/* Filter & Export Card */}
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Calendar style={{ width: "16px", height: "16px", color: "#64748B" }} />
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>Pilih Periode Pelaporan:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{
              borderRadius: "10px",
              border: "1px solid #CBD5E1",
              backgroundColor: "#F8FAFC",
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: 800,
              color: "#0F2E5C",
              outline: "none"
            }}
          >
            <option value="Semester I - 2026">Semester I - TA 2026 (Jan - Jun)</option>
            <option value="Semester II - 2026">Semester II - TA 2026 (Jul - Des)</option>
            <option value="Tahunan - 2025">Laporan Tahunan 2025 (Final)</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={() => alert(`Mengunduh Paket Rekapitulasi Lengkap Format SIPJAKI (${period})...`)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "10px",
              backgroundColor: "#F1F5F9",
              border: "1px solid #E2E8F0",
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#0F2E5C",
              cursor: "pointer"
            }}
          >
            <FileSpreadsheet style={{ width: "14px", height: "14px", color: "#059669" }} />
            <span>Unduh Bundel Excel (.ZIP)</span>
          </button>
          <button
            type="button"
            onClick={() => alert(`Mencetak Laporan Eksekutif Bupati (${period})...`)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "10px",
              backgroundColor: "#F1F5F9",
              border: "1px solid #E2E8F0",
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#0F2E5C",
              cursor: "pointer"
            }}
          >
            <FileText style={{ width: "14px", height: "14px", color: "#1E40AF" }} />
            <span>Unduh Buku Laporan (PDF)</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ borderRadius: "18px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0", textAlign: "left" }}>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>MODUL & JUDUL LAPORAN</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>KATEGORI PILAR</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>CAKUPAN AUDIT</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>SKOR KEPATUHAN</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>STATUS</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>TANGGAL KIRIM</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px", textAlign: "center" }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((rep) => (
                <tr key={rep.id} style={{ borderBottom: "1px solid #F1F5F9", transition: "background-color 0.15s ease" }}>
                  <td style={{ padding: "16px 18px" }}>
                    <p style={{ fontWeight: 800, color: "#0F172A", margin: 0, fontSize: "13px" }}>{rep.title}</p>
                    <p style={{ fontSize: "11px", fontFamily: "monospace", color: "#64748B", margin: "2px 0 0 0" }}>{rep.id}</p>
                  </td>
                  <td style={{ padding: "16px 18px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, backgroundColor: "#EBF2FA", color: "#0F2E5C", padding: "4px 10px", borderRadius: "6px" }}>
                      {rep.category}
                    </span>
                  </td>
                  <td style={{ padding: "16px 18px", color: "#334155", fontWeight: 600 }}>
                    {rep.coverage}
                  </td>
                  <td style={{ padding: "16px 18px", fontWeight: 800, color: "#0F172A", fontSize: "13px" }}>
                    {rep.score}
                  </td>
                  <td style={{ padding: "16px 18px" }}>
                    <span 
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        borderRadius: "9999px",
                        padding: "4px 10px",
                        fontSize: "11px",
                        fontWeight: 800,
                        backgroundColor: rep.status.includes("Terkirim") ? "#ECFDF5" : "#FFFBEB",
                        color: rep.status.includes("Terkirim") ? "#059669" : "#D97706"
                      }}
                    >
                      <CheckCircle2 style={{ width: "13px", height: "13px" }} />
                      {rep.status}
                    </span>
                  </td>
                  <td style={{ padding: "16px 18px", color: "#64748B", fontFamily: "monospace" }}>
                    {rep.date}
                  </td>
                  <td style={{ padding: "16px 18px", textAlign: "center" }}>
                    <button
                      type="button"
                      onClick={() => alert(`Mengunduh berkas laporan ${rep.id} (${rep.format})...`)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        borderRadius: "8px",
                        backgroundColor: "#F1F5F9",
                        color: "#0F2E5C",
                        padding: "6px 12px",
                        fontSize: "11px",
                        fontWeight: 700,
                        border: "1px solid #E2E8F0",
                        cursor: "pointer"
                      }}
                    >
                      <Download style={{ width: "13px", height: "13px" }} /> Unduh
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

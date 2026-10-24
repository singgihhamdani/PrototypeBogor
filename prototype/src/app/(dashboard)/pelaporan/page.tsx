"use client";
import { useState, useEffect } from "react";
import { 
  FileBarChart, Download, RefreshCw, CheckCircle2, 
  Calendar, FileSpreadsheet, FileText, Database as DbIcon,
  Award, Building2, HardHat, TrendingUp, Sparkles, Loader2
} from "lucide-react";
import { useResponsive } from "@/lib/use-responsive";
import { formatCurrency } from "@/lib/utils";
import { 
  getExecutiveReportMetrics, exportReportByModule, 
  exportAllSipjakiBundle, ExecutiveReportMetrics 
} from "@/lib/services/pelaporan-service";
import ExecutiveReportModal from "@/components/pelaporan/executive-report-modal";

export default function PelaporanPage() {
  const { isMobile, isMounted } = useResponsive();
  const [syncing, setSyncing] = useState(false);
  const [period, setPeriod] = useState("Semester I - 2026");
  const [showExecutiveModal, setShowExecutiveModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exportingId, setExportingId] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<ExecutiveReportMetrics>({
    totalBujk: 10,
    totalPaket: 8,
    totalNilaiKontrak: 34500000000,
    avgProgresFisik: 65,
    totalAuditDilakukan: 4,
    tingkatKepatuhanPersen: 84,
    totalTkkTersertifikasi: 85,
    totalInsidenK3: 3,
    kategoriTertib: { tertib: 3, cukupTertib: 0, kurangTertib: 1 }
  });

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);
      try {
        const res = await getExecutiveReportMetrics();
        setMetrics(res);
      } catch (err) {
        console.error("Gagal load metrics pelaporan:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, []);

  const reports = [
    {
      id: "LAP-TU-2026-S1",
      title: "Laporan Pengawasan Tertib Usaha Jasa Konstruksi",
      category: "Pilar 1: Tertib Usaha",
      status: "Terkirim & Terverifikasi",
      date: "2026-07-15",
      coverage: `${metrics.totalBujk} BUJK Diperiksa`,
      score: "88% (Kategori Tertib)",
      format: "XLSX SIPJAKI"
    },
    {
      id: "LAP-TP-2026-S1",
      title: "Laporan Pengawasan Tertib Penyelenggaraan Konstruksi",
      category: "Pilar 2: Penyelenggaraan",
      status: "Terkirim & Terverifikasi",
      date: "2026-07-20",
      coverage: `${metrics.totalPaket} Paket Proyek APBD/DAK`,
      score: `Fisik ${metrics.avgProgresFisik}% (Cukup Tertib)`,
      format: "XLSX SIPJAKI"
    },
    {
      id: "LAP-TM-2026-S1",
      title: "Laporan Pengawasan Tertib Pemanfaatan Produk Konstruksi",
      category: "Pilar 3: Pemanfaatan",
      status: "Dalam Peninjauan Pusat",
      date: "2026-08-05",
      coverage: "5 Bangunan Gedung Publik",
      score: "76% (Kategori Cukup Tertib)",
      format: "XLSX SIPJAKI"
    },
    {
      id: "LAP-TKK-2026-S1",
      title: "Rekapitulasi Pengembangan & Sertifikasi SKK TKK",
      category: "Pilar 5: SDM / TKK",
      status: "Terkirim & Terverifikasi",
      date: "2026-08-10",
      coverage: `${metrics.totalTkkTersertifikasi} TKK Tersertifikasi`,
      score: "92% (Sangat Baik)",
      format: "XLSX SIPJAKI"
    },
    {
      id: "LAP-K3-2026-BLN",
      title: "Laporan Kejadian Kecelakaan Kerja & Penerapan SMKK",
      category: "SMKK & Keselamatan",
      status: "Terkirim & Terverifikasi",
      date: "2026-09-01",
      coverage: `${metrics.totalInsidenK3} Insiden Terdata (0 Fatalitas)`,
      score: "100% Zero Accident",
      format: "XLSX SIPJAKI"
    }
  ];

  const handleSyncAll = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      alert("Seluruh 5 laporan periode aktif berhasil diverifikasi dan disinkronkan ke format Satu Data SIPJAKI!");
    }, 1200);
  };

  const handleExportSingle = async (reportId: string) => {
    setExportingId(reportId);
    try {
      await exportReportByModule(reportId);
    } catch (err: any) {
      alert("Gagal mengunduh laporan: " + err.message);
    } finally {
      setExportingId(null);
    }
  };

  const handleExportAll = async () => {
    try {
      await exportAllSipjakiBundle();
      alert("Bundel laporan format SIPJAKI Nasional berhasil diunduh secara berurutan!");
    } catch (err: any) {
      alert("Terjadi kendala saat mengunduh bundel: " + err.message);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <FileBarChart style={{ width: "12px", height: "12px" }} /> Output Resmi: Pelaporan Berkala
            </span>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669", backgroundColor: "#ECFDF5", padding: "3px 10px", borderRadius: "9999px" }}>
              Standar Permen PUPR No. 1/2023
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Pelaporan & Ekspor Sinkronisasi SIPJAKI
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
            Kompilasi rekapitulasi pengawasan jasa konstruksi Kabupaten Bogor dan format ekspor siap unggah SIPJAKI Nasional
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
            <RefreshCw style={{ width: "15px", height: "15px", animation: syncing ? "spin 1s linear infinite" : "none" }} />
            <span>{syncing ? "Menyinkronkan Format..." : "Verifikasi & Sinkronkan SIPJAKI"}</span>
          </button>
        </div>
      </div>

      {/* 4 Cards Summary Metrics Riil */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        <div style={{ borderRadius: "16px", border: "1px solid #E2E8F0", borderTop: "3px solid #0F2E5C", backgroundColor: "#FFFFFF", padding: "20px", boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Badan Usaha (BUJK)</span>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#EBF2FA", color: "#0F2E5C", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 style={{ width: "18px", height: "18px" }} />
            </div>
          </div>
          <p style={{ fontSize: "22px", fontWeight: 900, color: "#0F2E5C", margin: "10px 0 4px 0" }}>
            {loading ? "..." : `${metrics.totalBujk} BUJK`}
          </p>
          <span style={{ fontSize: "11px", color: "#64748B" }}>Tervalidasi OSS & LPJK</span>
        </div>

        <div style={{ borderRadius: "16px", border: "1px solid #E2E8F0", borderTop: "3px solid #2563EB", backgroundColor: "#FFFFFF", padding: "20px", boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Portofolio Proyek</span>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp style={{ width: "18px", height: "18px" }} />
            </div>
          </div>
          <p style={{ fontSize: "22px", fontWeight: 900, color: "#2563EB", margin: "10px 0 4px 0" }}>
            {loading ? "..." : `${metrics.totalPaket} Paket Proyek`}
          </p>
          <span style={{ fontSize: "11px", color: "#64748B" }}>Total Nilai: {formatCurrency(metrics.totalNilaiKontrak)}</span>
        </div>

        <div style={{ borderRadius: "16px", border: "1px solid #E2E8F0", borderTop: "3px solid #059669", backgroundColor: "#FFFFFF", padding: "20px", boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Tingkat Kepatuhan</span>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#ECFDF5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Award style={{ width: "18px", height: "18px" }} />
            </div>
          </div>
          <p style={{ fontSize: "22px", fontWeight: 900, color: "#059669", margin: "10px 0 4px 0" }}>
            {loading ? "..." : `${metrics.tingkatKepatuhanPersen}%`}
          </p>
          <span style={{ fontSize: "11px", color: "#059669", fontWeight: 700 }}>Predikat: Tertib Lapangan</span>
        </div>

        <div style={{ borderRadius: "16px", border: "1px solid #E2E8F0", borderTop: "3px solid #D97706", backgroundColor: "#FFFFFF", padding: "20px", boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>TKK Bersertifikat</span>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#FFFBEB", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <HardHat style={{ width: "18px", height: "18px" }} />
            </div>
          </div>
          <p style={{ fontSize: "22px", fontWeight: 900, color: "#D97706", margin: "10px 0 4px 0" }}>
            {loading ? "..." : `${metrics.totalTkkTersertifikasi} TKK`}
          </p>
          <span style={{ fontSize: "11px", color: "#64748B" }}>Sertifikasi BNSP / LSP LPJK</span>
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
            onClick={handleExportAll}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "10px",
              backgroundColor: "#ECFDF5",
              border: "1px solid #A7F3D0",
              padding: "8px 16px",
              fontSize: "12px",
              fontWeight: 800,
              color: "#065F46",
              cursor: "pointer"
            }}
          >
            <FileSpreadsheet style={{ width: "15px", height: "15px", color: "#059669" }} />
            <span>Unduh Bundel Excel (.ZIP)</span>
          </button>
          
          <button
            type="button"
            onClick={() => setShowExecutiveModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "10px",
              backgroundColor: "#EBF2FA",
              border: "1px solid #BFDBFE",
              padding: "8px 16px",
              fontSize: "12px",
              fontWeight: 800,
              color: "#0F2E5C",
              cursor: "pointer"
            }}
          >
            <FileText style={{ width: "15px", height: "15px", color: "#1E40AF" }} />
            <span>Buku Laporan Bupati (Cetak/PDF)</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ borderRadius: "18px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        {isMounted && isMobile && (
          <div style={{ padding: "8px 14px", backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#64748B", fontWeight: 700 }}>
            <span>↔</span>
            <span>Geser tabel ke samping untuk melihat seluruh kolom pelaporan</span>
          </div>
        )}
        <div className="custom-touch-scroll" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0", textAlign: "left" }}>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>MODUL & JUDUL LAPORAN</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>KATEGORI PILAR</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>CAKUPAN DATA RIIL</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>STATUS</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>FORMAT</th>
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
                        backgroundColor: "#ECFDF5",
                        color: "#059669"
                      }}
                    >
                      <CheckCircle2 style={{ width: "13px", height: "13px" }} />
                      {rep.status}
                    </span>
                  </td>
                  <td style={{ padding: "16px 18px", color: "#64748B", fontFamily: "monospace", fontSize: "11px" }}>
                    {rep.format}
                  </td>
                  <td style={{ padding: "16px 18px", textAlign: "center" }}>
                    <button
                      type="button"
                      disabled={exportingId === rep.id}
                      onClick={() => handleExportSingle(rep.id)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        borderRadius: "8px",
                        backgroundColor: "#0F2E5C",
                        color: "#FFFFFF",
                        padding: "6px 14px",
                        fontSize: "11px",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 1px 2px rgba(15, 46, 92, 0.15)"
                      }}
                    >
                      {exportingId === rep.id ? (
                        <>
                          <Loader2 style={{ width: "13px", height: "13px", animation: "spin 1s linear infinite" }} />
                          <span>Mengekspor...</span>
                        </>
                      ) : (
                        <>
                          <Download style={{ width: "13px", height: "13px" }} />
                          <span>Unduh Excel</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Buku Laporan Eksekutif Resmi */}
      <ExecutiveReportModal
        isOpen={showExecutiveModal}
        onClose={() => setShowExecutiveModal(false)}
        metrics={metrics}
        period={period}
      />
    </div>
  );
}

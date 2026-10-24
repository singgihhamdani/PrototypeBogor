"use client";
import React from "react";
import { Printer, X, Download, ShieldCheck, Building2, CheckCircle2, Award, HardHat } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ExecutiveReportMetrics } from "@/lib/services/pelaporan-service";

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: ExecutiveReportMetrics;
  period: string;
}

export default function ExecutiveReportModal({
  isOpen,
  onClose,
  metrics,
  period
}: ExecutiveReportModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
    >
      <div 
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "18px",
          width: "100%",
          maxWidth: "880px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden"
        }}
      >
        {/* Modal Controls (Hidden in Print) */}
        <div 
          className="no-print"
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #E2E8F0",
            backgroundColor: "#0F2E5C",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Award style={{ width: "20px", height: "20px", color: "#FFC000" }} />
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 800, margin: 0 }}>
                Pratinjau Buku Laporan Eksekutif Resmi
              </h3>
              <span style={{ fontSize: "11px", color: "#CBD5E1" }}>
                Format Standar Penyampaian ke Bupati Bogor & SIPJAKI Kementerian PUPR
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={handlePrint}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#FFC000",
                color: "#0F2E5C",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer"
              }}
            >
              <Printer style={{ width: "14px", height: "14px" }} /> Cetak / Unduh PDF
            </button>
            <button
              onClick={onClose}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <X style={{ width: "16px", height: "16px" }} />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div 
          id="printable-report"
          style={{
            padding: "40px 48px",
            overflowY: "auto",
            backgroundColor: "#FFFFFF",
            color: "#0F172A",
            fontFamily: "Arial, sans-serif"
          }}
        >
          {/* Kop Surat Resmi */}
          <div style={{ borderBottom: "3px double #0F2E5C", paddingBottom: "16px", textAlign: "center", marginBottom: "24px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 800, letterSpacing: "1px", color: "#1E293B", margin: 0, textTransform: "uppercase" }}>
              PEMERINTAH KABUPATEN BOGOR
            </h4>
            <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0F2E5C", margin: "4px 0", letterSpacing: "0.5px" }}>
              DINAS PEKERJAAN UMUM DAN PENATAAN RUANG
            </h2>
            <p style={{ fontSize: "11px", color: "#475569", margin: "2px 0 0 0" }}>
              Jl. Tegar Beriman No. 1, Cibinong, Kabupaten Bogor, Jawa Barat 16914 • Telp: (021) 8753232
            </p>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#0F2E5C", display: "inline-block", marginTop: "4px", backgroundColor: "#EBF2FA", padding: "2px 10px", borderRadius: "9999px" }}>
              TIM PEMBINA JASA KONSTRUKSI KABUPATEN BOGOR
            </span>
          </div>

          {/* Judul Laporan */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <h1 style={{ fontSize: "17px", fontWeight: 900, color: "#0F172A", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              LAPORAN PENGAWASAN PENYELENGGARAAN JASA KONSTRUKSI DAERAH
            </h1>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#475569", marginTop: "4px" }}>
              PERIODE: {period.toUpperCase()}
            </p>
            <span style={{ fontSize: "10px", color: "#64748B", fontStyle: "italic" }}>
              Berdasarkan Undang-Undang No. 2 Tahun 2017 & Peraturan Menteri PUPR No. 1 Tahun 2023
            </span>
          </div>

          {/* Ringkasan Eksekutif */}
          <div style={{ marginBottom: "24px" }}>
            <h4 style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", textTransform: "uppercase", borderBottom: "1px solid #CBD5E1", paddingBottom: "6px", marginBottom: "12px" }}>
              I. Ringkasan Eksekutif Capaian Kepatuhan
            </h4>
            <p style={{ fontSize: "12px", lineHeight: "1.6", color: "#334155", textAlign: "justify", margin: "0 0 14px 0" }}>
              Berdasarkan hasil pengawasan tertib usaha, tertib penyelenggaraan, dan tertib pemanfaatan jasa konstruksi yang dilaksanakan oleh Tim Pembina Jasa Konstruksi Kabupaten Bogor selama {period}, tingkat kepatuhan rata-rata badan usaha dan proyek fisik mencapai <b>{metrics.tingkatKepatuhanPersen}%</b> dengan predikat kepatuhan secara umum berkategori <b>Tertib</b>.
            </p>

            {/* Metrik Kotak */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
              <div style={{ border: "1px solid #CBD5E1", borderRadius: "8px", padding: "10px", textAlign: "center", backgroundColor: "#F8FAFC" }}>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700, display: "block" }}>TOTAL BUJK</span>
                <span style={{ fontSize: "18px", fontWeight: 900, color: "#0F2E5C" }}>{metrics.totalBujk}</span>
                <span style={{ fontSize: "9px", color: "#64748B", display: "block" }}>Perusahaan Terdata</span>
              </div>
              <div style={{ border: "1px solid #CBD5E1", borderRadius: "8px", padding: "10px", textAlign: "center", backgroundColor: "#F8FAFC" }}>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700, display: "block" }}>PAKET PROYEK</span>
                <span style={{ fontSize: "18px", fontWeight: 900, color: "#0F2E5C" }}>{metrics.totalPaket}</span>
                <span style={{ fontSize: "9px", color: "#64748B", display: "block" }}>Fisik APBD / DAK</span>
              </div>
              <div style={{ border: "1px solid #CBD5E1", borderRadius: "8px", padding: "10px", textAlign: "center", backgroundColor: "#F8FAFC" }}>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700, display: "block" }}>INDEX KEPATUHAN</span>
                <span style={{ fontSize: "18px", fontWeight: 900, color: "#059669" }}>{metrics.tingkatKepatuhanPersen}%</span>
                <span style={{ fontSize: "9px", color: "#059669", fontWeight: 700, display: "block" }}>Kategori Tertib</span>
              </div>
              <div style={{ border: "1px solid #CBD5E1", borderRadius: "8px", padding: "10px", textAlign: "center", backgroundColor: "#F8FAFC" }}>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700, display: "block" }}>TKK TERSERTIFIKASI</span>
                <span style={{ fontSize: "18px", fontWeight: 900, color: "#D97706" }}>{metrics.totalTkkTersertifikasi}</span>
                <span style={{ fontSize: "9px", color: "#64748B", display: "block" }}>Tenaga Kerja SKK</span>
              </div>
            </div>
          </div>

          {/* Tabel Rekapitulasi Pilar */}
          <div style={{ marginBottom: "28px" }}>
            <h4 style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", textTransform: "uppercase", borderBottom: "1px solid #CBD5E1", paddingBottom: "6px", marginBottom: "12px" }}>
              II. Rekapitulasi Capaian Berdasarkan Pilar Pengawasan
            </h4>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead>
                <tr style={{ backgroundColor: "#F1F5F9", textAlign: "left" }}>
                  <th style={{ border: "1px solid #CBD5E1", padding: "8px" }}>NO</th>
                  <th style={{ border: "1px solid #CBD5E1", padding: "8px" }}>PILAR PEMBINAAN & PENGAWASAN</th>
                  <th style={{ border: "1px solid #CBD5E1", padding: "8px" }}>TARGET / CAKUPAN</th>
                  <th style={{ border: "1px solid #CBD5E1", padding: "8px" }}>HASIL EVALUASI</th>
                  <th style={{ border: "1px solid #CBD5E1", padding: "8px" }}>STATUS SINKRONISASI</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #CBD5E1", padding: "8px", textAlign: "center" }}>1</td>
                  <td style={{ border: "1px solid #CBD5E1", padding: "8px", fontWeight: 700 }}>Tertib Usaha Jasa Konstruksi (NIB & SBU)</td>
                  <td style={{ border: "1px solid #CBD5E1", padding: "8px" }}>{metrics.totalBujk} BUJK Terdaftar</td>
                  <td style={{ border: "1px solid #CBD5E1", padding: "8px", color: "#059669", fontWeight: 700 }}>88% Kepatuhan Legalitas</td>
                  <td style={{ border: "1px solid #CBD5E1", padding: "8px" }}>Tersinkronisasi OSS & SIPJAKI</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #CBD5E1", padding: "8px", textAlign: "center" }}>2</td>
                  <td style={{ border: "1px solid #CBD5E1", padding: "8px", fontWeight: 700 }}>Tertib Penyelenggaraan (Proyek & SMKK)</td>
                  <td style={{ border: "1px solid #CBD5E1", padding: "8px" }}>{metrics.totalPaket} Paket ({formatCurrency(metrics.totalNilaiKontrak)})</td>
                  <td style={{ border: "1px solid #CBD5E1", padding: "8px", color: "#059669", fontWeight: 700 }}>Rata-rata Fisik {metrics.avgProgresFisik}%</td>
                  <td style={{ border: "1px solid #CBD5E1", padding: "8px" }}>Tersinkronisasi SPSE & SIPJAKI</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #CBD5E1", padding: "8px", textAlign: "center" }}>3</td>
                  <td style={{ border: "1px solid #CBD5E1", padding: "8px", fontWeight: 700 }}>Tertib Pemanfaatan Produk Konstruksi</td>
                  <td style={{ border: "1px solid #CBD5E1", padding: "8px" }}>Bangunan Publik & Infrastruktur</td>
                  <td style={{ border: "1px solid #CBD5E1", padding: "8px", color: "#D97706", fontWeight: 700 }}>76% Kepatuhan Pemeliharaan</td>
                  <td style={{ border: "1px solid #CBD5E1", padding: "8px" }}>Dalam Validasi Berkala</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #CBD5E1", padding: "8px", textAlign: "center" }}>4</td>
                  <td style={{ border: "1px solid #CBD5E1", padding: "8px", fontWeight: 700 }}>Sertifikasi Tenaga Kerja Konstruksi (TKK)</td>
                  <td style={{ border: "1px solid #CBD5E1", padding: "8px" }}>{metrics.totalTkkTersertifikasi} Tenaga Kerja Terampil</td>
                  <td style={{ border: "1px solid #CBD5E1", padding: "8px", color: "#059669", fontWeight: 700 }}>Lulus Uji Kompetensi BNSP</td>
                  <td style={{ border: "1px solid #CBD5E1", padding: "8px" }}>Database SIKI LPJK Aktif</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Blok Tanda Tangan Resmi */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "36px" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "11px", color: "#475569", margin: 0 }}>Mengetahui,</p>
              <p style={{ fontSize: "12px", fontWeight: 800, color: "#0F172A", margin: "2px 0 50px 0" }}>
                KEPALA BIDANG JASA KONSTRUKSI
              </p>
              <p style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", margin: 0, textDecoration: "underline" }}>
                Ir. H. DEDI SUPRIYADI, M.Si.
              </p>
              <p style={{ fontSize: "10px", color: "#64748B", margin: "2px 0 0 0" }}>
                NIP. 19750815 200212 1 004
              </p>
            </div>

            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "11px", color: "#475569", margin: 0 }}>Cibinong, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
              <p style={{ fontSize: "12px", fontWeight: 800, color: "#0F172A", margin: "2px 0 50px 0" }}>
                KETUA TIM PENGAWAS TEKNIS
              </p>
              <p style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", margin: 0, textDecoration: "underline" }}>
                Ir. HENDRA SETIAWAN, S.T., M.Si.
              </p>
              <p style={{ fontSize: "10px", color: "#64748B", margin: "2px 0 0 0" }}>
                NIP. 19820410 200801 1 008
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

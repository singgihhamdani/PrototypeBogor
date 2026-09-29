"use client";
import { useState } from "react";
import { 
  Building2, ShieldCheck, FileCheck, AlertTriangle, UploadCloud, 
  Clock, CheckCircle2, ChevronRight, Download, FileText, Calendar,
  ExternalLink, HardHat, TrendingUp
} from "lucide-react";
import { useAuth } from "@/lib/mock-auth";

export default function BujkPortalPage() {
  const { user } = useAuth();
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleSimulateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setSelectedFile(null);
    }, 4000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* 1. Hero Summary Card */}
      <div
        style={{
          borderRadius: "20px",
          background: "linear-gradient(135deg, #0A2540 0%, #163B75 70%, #EA580C 100%)",
          padding: "28px 32px",
          color: "#FFFFFF",
          boxShadow: "0 10px 25px -5px rgba(10, 37, 64, 0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px"
        }}
      >
        <div style={{ maxWidth: "700px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(255,255,255,0.15)", padding: "4px 12px", borderRadius: "9999px", fontSize: "11px", fontWeight: 800, color: "#FFC000", marginBottom: "10px" }}>
            <Building2 style={{ width: "14px", height: "14px" }} />
            <span>Badan Usaha Jasa Konstruksi (Tenant ID: BUJK-001)</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 900, margin: 0, letterSpacing: "-0.5px" }}>
            {user?.bujkName || "PT Bangun Jaya Konstruksi"}
          </h1>
          <p style={{ fontSize: "13px", color: "#E2E8F0", margin: "6px 0 0 0", lineHeight: 1.5 }}>
            NIB: <strong>0220208192301</strong> • Penanggung Jawab Teknis: <strong>Budi Santoso, ST (SKK Jenjang 8)</strong> • Alamat: Jl. Raya Tegar Beriman No. 45, Cibinong, Kab. Bogor
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", padding: "14px 20px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.2)", textAlign: "center" }}>
            <span style={{ fontSize: "10px", color: "#CBD5E1", textTransform: "uppercase", display: "block", fontWeight: 700 }}>Indeks Kepatuhan 3 Tertib</span>
            <span style={{ fontSize: "24px", fontWeight: 900, color: "#4ADE80" }}>88.5%</span>
            <span style={{ fontSize: "10px", color: "#A7F3D0", display: "block", fontWeight: 700 }}>Kategori: Tertib</span>
          </div>

          <div style={{ backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", padding: "14px 20px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.2)", textAlign: "center" }}>
            <span style={{ fontSize: "10px", color: "#CBD5E1", textTransform: "uppercase", display: "block", fontWeight: 700 }}>Paket Berjalan TA 2026</span>
            <span style={{ fontSize: "24px", fontWeight: 900, color: "#FFC000" }}>2 Proyek</span>
            <span style={{ fontSize: "10px", color: "#FEF08A", display: "block", fontWeight: 700 }}>Total: Rp 10,35 M</span>
          </div>
        </div>
      </div>

      {/* 2. SBU Status & Masa Berlaku Grid */}
      <div id="sbu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
              Sertifikat Badan Usaha (SBU) & Izin Berusaha
            </h2>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
              Sinkronisasi real-time dengan portal Lisensi LPJK / SIPJAKI Kementerian PUPR
            </p>
          </div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669", backgroundColor: "#ECFDF5", padding: "4px 12px", borderRadius: "9999px", border: "1px solid #A7F3D0" }}>
            2 Subklasifikasi Terdaftar
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px" }}>
          
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E2E8F0", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#EBF2FA", color: "#0F2E5C", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "12px" }}>
                  BG001
                </div>
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                    Konstruksi Gedung Komersial
                  </h3>
                  <span style={{ fontSize: "11px", color: "#64748B" }}>Kualifikasi: Menengah 1 (M1)</span>
                </div>
              </div>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#059669", backgroundColor: "#ECFDF5", padding: "3px 8px", borderRadius: "6px" }}>
                Aktif
              </span>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px", backgroundColor: "#F8FAFC", padding: "10px", borderRadius: "10px" }}>
              <div>
                <span style={{ color: "#94A3B8", display: "block" }}>No. Registrasi LPJK:</span>
                <span style={{ fontWeight: 700, color: "#1E293B" }}>9120-2023-BG001-098</span>
              </div>
              <div>
                <span style={{ color: "#94A3B8", display: "block" }}>Berlaku Hingga:</span>
                <span style={{ fontWeight: 700, color: "#059669" }}>14 November 2027</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #FDE68A", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#FFFBEB", color: "#B45309", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "12px" }}>
                  SI003
                </div>
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                    Konstruksi Saluran Air & Drainase
                  </h3>
                  <span style={{ fontSize: "11px", color: "#64748B" }}>Kualifikasi: Menengah 1 (M1)</span>
                </div>
              </div>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#B45309", backgroundColor: "#FEF3C7", padding: "3px 8px", borderRadius: "6px" }}>
                Perlu Perpanjangan
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px", backgroundColor: "#FFFBEB", padding: "10px", borderRadius: "10px", border: "1px solid #FDE68A" }}>
              <div>
                <span style={{ color: "#94A3B8", display: "block" }}>No. Registrasi LPJK:</span>
                <span style={{ fontWeight: 700, color: "#1E293B" }}>9120-2021-SI003-441</span>
              </div>
              <div>
                <span style={{ color: "#94A3B8", display: "block" }}>Berlaku Hingga:</span>
                <span style={{ fontWeight: 700, color: "#DC2626" }}>22 Maret 2027</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Proyek yang Sedang Dikerjakan (Tenant Scoped) */}
      <div id="proyek" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
            Paket Pekerjaan Terkait (Tenant-Isolated)
          </h2>
          <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
            Hanya menampilkan kontrak pekerjaan Dinas PUPR yang dimenangkan oleh <strong>PT Bangun Jaya Konstruksi</strong>
          </p>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#64748B", fontWeight: 800 }}>
                <th style={{ padding: "12px 16px" }}>ID & Paket Pekerjaan</th>
                <th style={{ padding: "12px 16px" }}>Lokasi / Kecamatan</th>
                <th style={{ padding: "12px 16px" }}>Nilai Kontrak</th>
                <th style={{ padding: "12px 16px" }}>Progres Lapangan</th>
                <th style={{ padding: "12px 16px" }}>Status K3 SMKK</th>
                <th style={{ padding: "12px 16px", textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#0F2E5C", fontWeight: 700, display: "block" }}>P001</span>
                  <span style={{ fontWeight: 800, color: "#0F172A" }}>Rekonstruksi Jl. Raya Cibinong - Citeureup</span>
                </td>
                <td style={{ padding: "14px 16px", color: "#475569" }}>Cibinong, STA 0+000 - 4+200</td>
                <td style={{ padding: "14px 16px", fontWeight: 700, color: "#0F2E5C" }}>Rp 8,50 Miliar</td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ flex: 1, height: "6px", backgroundColor: "#E2E8F0", borderRadius: "9999px", overflow: "hidden" }}>
                      <div style={{ width: "68%", height: "100%", backgroundColor: "#10B981" }} />
                    </div>
                    <span style={{ fontWeight: 800, color: "#059669" }}>68%</span>
                  </div>
                  <span style={{ fontSize: "10px", color: "#64748B" }}>Rencana: 60% (+8% Deviasi Positif)</span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#059669", backgroundColor: "#ECFDF5", padding: "2px 8px", borderRadius: "9999px" }}>
                    SMKK Terverifikasi
                  </span>
                </td>
                <td style={{ padding: "14px 16px", textAlign: "center" }}>
                  <button 
                    onClick={() => alert("Membuka detail berkas SIMAK paket P001")}
                    style={{ fontSize: "11px", fontWeight: 700, color: "#0F2E5C", backgroundColor: "#EBF2FA", border: "none", padding: "6px 12px", borderRadius: "8px", cursor: "pointer" }}
                  >
                    Buka SIMAK
                  </button>
                </td>
              </tr>

              <tr>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#0F2E5C", fontWeight: 700, display: "block" }}>P003</span>
                  <span style={{ fontWeight: 800, color: "#0F172A" }}>Peningkatan Jalan Lingkungan Desa Sukamahi</span>
                </td>
                <td style={{ padding: "14px 16px", color: "#475569" }}>Cileungsi</td>
                <td style={{ padding: "14px 16px", fontWeight: 700, color: "#0F2E5C" }}>Rp 1,85 Miliar</td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ flex: 1, height: "6px", backgroundColor: "#E2E8F0", borderRadius: "9999px", overflow: "hidden" }}>
                      <div style={{ width: "90%", height: "100%", backgroundColor: "#2563EB" }} />
                    </div>
                    <span style={{ fontWeight: 800, color: "#2563EB" }}>90%</span>
                  </div>
                  <span style={{ fontSize: "10px", color: "#64748B" }}>Rencana: 90% (On Track)</span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#059669", backgroundColor: "#ECFDF5", padding: "2px 8px", borderRadius: "9999px" }}>
                    SMKK Terverifikasi
                  </span>
                </td>
                <td style={{ padding: "14px 16px", textAlign: "center" }}>
                  <button 
                    onClick={() => alert("Membuka detail berkas SIMAK paket P003")}
                    style={{ fontSize: "11px", fontWeight: 700, color: "#0F2E5C", backgroundColor: "#EBF2FA", border: "none", padding: "6px 12px", borderRadius: "8px", cursor: "pointer" }}
                  >
                    Buka SIMAK
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Upload Pelaporan Mandiri SIMAK */}
      <div id="simak" style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", border: "1px solid #E2E8F0", padding: "24px 28px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
            Upload Mandiri Laporan SIMAK (Sistem Informasi Manajemen Konstruksi)
          </h2>
          <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
            Sesuai Permen PUPR No. 1/2023: Penyedia jasa wajib mengunggah progres mingguan & bukti penerapan SMKK
          </p>
        </div>

        {uploadSuccess && (
          <div style={{ padding: "12px 16px", borderRadius: "12px", backgroundColor: "#ECFDF5", border: "1px solid #A7F3D0", color: "#065F46", fontSize: "13px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 style={{ width: "18px", height: "18px" }} />
            <span>Dokumen berhasil diunggah! Berkas sedang diverifikasi oleh Tim Pengawas Lapangan DPUPR.</span>
          </div>
        )}

        <form onSubmit={handleSimulateUpload} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>
              Pilih Paket Proyek
            </label>
            <select
              style={{ width: "100%", height: "42px", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#F8FAFC", padding: "0 12px", fontSize: "12px", outline: "none", color: "#1E293B" }}
            >
              <option>P001 — Rekonstruksi Jl. Raya Cibinong - Citeureup</option>
              <option>P003 — Peningkatan Jalan Lingkungan Desa Sukamahi</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>
              Jenis Berkas SIMAK
            </label>
            <select
              style={{ width: "100%", height: "42px", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#F8FAFC", padding: "0 12px", fontSize: "12px", outline: "none", color: "#1E293B" }}
            >
              <option>Laporan Mingguan Progres & Cuaca</option>
              <option>Checklist K3 & Notula Safety Talk</option>
              <option>Dokumentasi Foto STA Kemajuan Fisik (Geotagged)</option>
              <option>Uji Mutu Laboratorium (Slump Test / Kuat Tekan)</option>
            </select>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>
              Pilih File PDF / Gambar Laporan
            </label>
            <div
              onClick={() => setSelectedFile("Laporan_Mingguan_Minggu12_P001.pdf")}
              style={{
                border: "2px dashed #CBD5E1",
                borderRadius: "14px",
                padding: "24px",
                textAlign: "center",
                backgroundColor: selectedFile ? "#ECFDF5" : "#F8FAFC",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <UploadCloud style={{ width: "32px", height: "32px", color: selectedFile ? "#059669" : "#64748B", margin: "0 auto 8px auto" }} />
              {selectedFile ? (
                <div>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "#065F46" }}>
                    File Terpilih: {selectedFile} (4.2 MB)
                  </span>
                  <span style={{ fontSize: "11px", color: "#059669", display: "block", marginTop: "2px" }}>
                    Klik tombol kirim untuk memproses verifikasi
                  </span>
                </div>
              ) : (
                <div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#334155" }}>
                    Klik untuk memilih berkas laporan SIMAK (PDF, DOCX, ZIP)
                  </span>
                  <span style={{ fontSize: "11px", color: "#94A3B8", display: "block", marginTop: "4px" }}>
                    Maksimum ukuran file: 25 MB
                  </span>
                </div>
              )}
            </div>
          </div>

          <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={!selectedFile}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 24px",
                borderRadius: "12px",
                backgroundColor: selectedFile ? "#EA580C" : "#CBD5E1",
                color: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 800,
                border: "none",
                cursor: selectedFile ? "pointer" : "not-allowed",
                boxShadow: selectedFile ? "0 4px 12px rgba(234, 88, 12, 0.3)" : "none"
              }}
            >
              <UploadCloud style={{ width: "16px", height: "16px" }} />
              <span>Kirim Dokumen ke Asesor Dinas</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}

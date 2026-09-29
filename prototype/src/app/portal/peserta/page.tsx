"use client";
import { useState } from "react";
import { 
  GraduationCap, Award, CheckCircle2, Clock, Calendar, 
  Download, QrCode, FileText, Check, BookOpen, AlertCircle, 
  Sparkles, UserCheck, ShieldCheck, MapPin, Building, ChevronRight,
  ExternalLink, Printer, Search
} from "lucide-react";
import { useAuth } from "@/lib/mock-auth";

export default function PesertaPortalPage() {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [activeTabFilter, setActiveTabFilter] = useState<string>("all");

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert("Simulasi Berhasil: E-Sertifikat SKK Digital Jenjang 4 (PDF) ber-QR Code SIPJAKI berhasil diunduh.");
    }, 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      
      {/* 1. HERO BANNER & STATUS UTAMA (DASHBOARD) */}
      <section id="dashboard" style={{ scrollMarginTop: "120px" }}>
        <div
          style={{
            borderRadius: "24px",
            background: "linear-gradient(135deg, #0A2540 0%, #0369A1 55%, #0284C7 100%)",
            padding: "32px",
            color: "#FFFFFF",
            boxShadow: "0 12px 30px -6px rgba(2, 132, 199, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "24px",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div style={{ maxWidth: "720px", position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(255,255,255,0.18)", padding: "5px 14px", borderRadius: "9999px", fontSize: "11px", fontWeight: 800, color: "#E0F2FE", marginBottom: "12px", border: "1px solid rgba(255,255,255,0.25)" }}>
              <GraduationCap style={{ width: "15px", height: "15px", color: "#38BDF8" }} />
              <span>Program Fasilitasi Sertifikasi SKK APBD Kab. Bogor TA 2026</span>
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 900, margin: 0, letterSpacing: "-0.5px" }}>
              Selamat Datang, {user?.name || "Ahmad Fauzi, A.Md"}
            </h1>
            <p style={{ fontSize: "13px", color: "#E0F2FE", margin: "8px 0 0 0", lineHeight: 1.6 }}>
              Jabatan Kerja: <strong>Pelaksana Lapangan Pekerjaan Gedung</strong> • Kualifikasi: <strong>Jenjang 4 (Teknisi / Analis)</strong> • Penyelenggara: <strong>Dinas PUPR Kab. Bogor bekerjasama dengan LSP Konstruksi Indonesia Mandiri (BNSP)</strong>
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "18px", flexWrap: "wrap" }}>
              <a
                href="#sertifikat"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#FFFFFF",
                  color: "#0369A1",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: 800,
                  textDecoration: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}
              >
                <Award style={{ width: "14px", height: "14px" }} />
                <span>Lihat E-Sertifikat Digital</span>
              </a>

              <a
                href="#asesmen"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "#FFFFFF",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: 700,
                  textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.3)"
                }}
              >
                <CheckCircle2 style={{ width: "14px", height: "14px" }} />
                <span>Hasil Asesmen Asesor</span>
              </a>
            </div>
          </div>

          {/* Badge Status Kompeten */}
          <div style={{ backgroundColor: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", padding: "20px 28px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.25)", textAlign: "center", minWidth: "220px", position: "relative", zIndex: 1 }}>
            <span style={{ fontSize: "11px", color: "#BAE6FD", textTransform: "uppercase", display: "block", fontWeight: 800, letterSpacing: "0.5px" }}>Hasil Uji Asesor BNSP</span>
            <span style={{ fontSize: "28px", fontWeight: 900, color: "#4ADE80", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", margin: "6px 0" }}>
              <CheckCircle2 style={{ width: "26px", height: "26px" }} /> KOMPETEN
            </span>
            <span style={{ fontSize: "11px", color: "#FFFFFF", display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "rgba(74, 222, 128, 0.2)", padding: "2px 10px", borderRadius: "9999px", fontWeight: 800 }}>
              Sertifikat Aktif s/d 2031
            </span>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginTop: "20px" }}>
          <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "16px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <div style={{ width: "46px", height: "46px", borderRadius: "12px", backgroundColor: "#E0F2FE", color: "#0284C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock style={{ width: "22px", height: "22px" }} />
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 700, display: "block" }}>Jam Pelatihan (JP)</span>
              <span style={{ fontSize: "20px", fontWeight: 900, color: "#0F172A" }}>32 / 32 JP</span>
              <span style={{ fontSize: "10px", color: "#059669", fontWeight: 700, display: "block" }}>100% Kehadiran Terpenuhi</span>
            </div>
          </div>

          <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "16px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <div style={{ width: "46px", height: "46px", borderRadius: "12px", backgroundColor: "#ECFDF5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Award style={{ width: "22px", height: "22px" }} />
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 700, display: "block" }}>Nilai Evaluasi Akhir</span>
              <span style={{ fontSize: "20px", fontWeight: 900, color: "#059669" }}>88.5 / 100</span>
              <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700, display: "block" }}>Predikat: Sangat Memuaskan</span>
            </div>
          </div>

          <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "16px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <div style={{ width: "46px", height: "46px", borderRadius: "12px", backgroundColor: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck style={{ width: "22px", height: "22px" }} />
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 700, display: "block" }}>Unit Kompetensi Teruji</span>
              <span style={{ fontSize: "20px", fontWeight: 900, color: "#0F172A" }}>5 / 5 Unit</span>
              <span style={{ fontSize: "10px", color: "#D97706", fontWeight: 700, display: "block" }}>Semua Kategori Kompeten (K)</span>
            </div>
          </div>

          <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "16px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <div style={{ width: "46px", height: "46px", borderRadius: "12px", backgroundColor: "#F3E8FF", color: "#9333EA", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <QrCode style={{ width: "22px", height: "22px" }} />
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 700, display: "block" }}>Integrasi SIPJAKI PUPR</span>
              <span style={{ fontSize: "20px", fontWeight: 900, color: "#9333EA" }}>Tervalidasi</span>
              <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700, display: "block" }}>Tercatat di Database LPJK</span>
            </div>
          </div>
        </div>

        {/* 5-Step Timeline Sertifikasi */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", border: "1px solid #E2E8F0", padding: "24px 28px", marginTop: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: "0 0 16px 0" }}>
            Alur Tahapan Fasilitasi Sertifikasi Peserta
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            {[
              { step: "Tahap 1", label: "Pendaftaran & Verifikasi", date: "1 - 5 Agt 2026", status: "Terverifikasi" },
              { step: "Tahap 2", label: "Pembekalan Teori (16 JP)", date: "10 - 12 Agt 2026", status: "Selesai (100%)" },
              { step: "Tahap 3", label: "Praktik Lapangan (16 JP)", date: "15 - 18 Agt 2026", status: "Selesai (100%)" },
              { step: "Tahap 4", label: "Uji Asesmen LSP/BNSP", date: "18 Sept 2026", status: "Lulus KOMPETEN" },
              { step: "Tahap 5", label: "Penerbitan SKK Digital", date: "25 Sept 2026", status: "Terbit & Aktif" },
            ].map((s, idx) => (
              <div key={idx} style={{ backgroundColor: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0", padding: "14px", position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#0284C7" }}>{s.step}</span>
                  <span style={{ width: "18px", height: "18px", borderRadius: "9999px", backgroundColor: "#ECFDF5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check style={{ width: "12px", height: "12px" }} />
                  </span>
                </div>
                <h4 style={{ fontSize: "12px", fontWeight: 800, color: "#0F172A", margin: "0 0 4px 0" }}>{s.label}</h4>
                <span style={{ fontSize: "10px", color: "#64748B", display: "block" }}>{s.date}</span>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#059669", marginTop: "4px", display: "inline-block" }}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. JADWAL PELATIHAN & MATERI (JADWAL) */}
      <section id="jadwal" style={{ scrollMarginTop: "120px" }}>
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", border: "1px solid #E2E8F0", padding: "26px 30px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#0284C7", backgroundColor: "#E0F2FE", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <BookOpen style={{ width: "12px", height: "12px" }} /> Kurikulum & Agenda Sesi
              </span>
              <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0F172A", margin: "6px 0 0 0" }}>
                Jadwal & Agenda Pelatihan Sertifikasi TKK
              </h2>
              <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
                Total 32 Jam Pelajaran (JP) teori dan praktek lapangan di Balai Pelatihan Jasa Konstruksi Kab. Bogor
              </p>
            </div>

            <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669", backgroundColor: "#ECFDF5", padding: "6px 14px", borderRadius: "10px", border: "1px solid #A7F3D0" }}>
              Status: Semua Sesi Telah Dihadiri (100%)
            </span>
          </div>

          {/* Daftar Sesi Terjadwal */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              {
                sesi: "Sesi 1",
                tanggal: "Senin, 10 Agustus 2026",
                waktu: "08.00 - 16.00 WIB (8 JP)",
                materi: "Penerapan Keselamatan & Kesehatan Kerja (K3) dan Sistem Manajemen Keselamatan Konstruksi (SMKK)",
                instruktur: "Ir. Bambang Suharso, MT (Ahli Utama K3 Konstruksi)",
                lokasi: "Ruang Teori Gedung A, Balai Pelatihan Jasa Konstruksi, Cibinong",
                status: "Hadir Lengkap",
                score: "92 / 100",
                fileModul: "Modul_01_SMKK_K3.pdf"
              },
              {
                sesi: "Sesi 2",
                tanggal: "Rabu, 12 Agustus 2026",
                waktu: "08.00 - 16.00 WIB (8 JP)",
                materi: "Pembacaan Gambar Kerja (Shop Drawing), Spesifikasi Teknis, dan Perhitungan Volume Pekerjaan",
                instruktur: "Siti Rahmawati, ST, MT (Praktisi Pengawas Struktur)",
                lokasi: "Studio Desain & Lab Komputer DPUPR Kab. Bogor",
                status: "Hadir Lengkap",
                score: "88 / 100",
                fileModul: "Modul_02_ShopDrawing_Spesifikasi.pdf"
              },
              {
                sesi: "Sesi 3",
                tanggal: "Sabtu, 15 Agustus 2026",
                waktu: "08.00 - 17.00 WIB (10 JP)",
                materi: "Praktik Lapangan Pengawasan Pembesian, Bekisting, Slump Test, dan Pengecoran Beton Ready-Mix",
                instruktur: "Hendra Wijaya, ST (Quality Control Specialist)",
                lokasi: "Workshop Konstruksi Lapangan, Cibinong",
                status: "Hadir Lengkap",
                score: "85 / 100",
                fileModul: "Modul_03_Praktik_Pengawasan_Beton.pdf"
              },
              {
                sesi: "Sesi 4",
                tanggal: "Selasa, 18 Agustus 2026",
                waktu: "08.00 - 15.00 WIB (6 JP)",
                materi: "Penyusunan Laporan Harian, Laporan Mingguan, Berita Acara Deviasi, dan Persiapan Asesmen Mandiri",
                instruktur: "Dr. Ir. Wahyudi, MT (Lead Auditor Jakon)",
                lokasi: "Ruang Teori B, Balai Pelatihan Jasa Konstruksi, Cibinong",
                status: "Hadir Lengkap",
                score: "90 / 100",
                fileModul: "Modul_04_Administrasi_Pelaporan.pdf"
              },
            ].map((item, idx) => (
              <div 
                key={idx} 
                style={{ 
                  borderRadius: "14px", 
                  border: "1px solid #E2E8F0", 
                  backgroundColor: "#F8FAFC", 
                  padding: "16px 20px", 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  flexWrap: "wrap", 
                  gap: "14px" 
                }}
              >
                <div style={{ flex: 1, minWidth: "280px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#0284C7", backgroundColor: "#E0F2FE", padding: "2px 8px", borderRadius: "6px" }}>
                      {item.sesi}
                    </span>
                    <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 700 }}>
                      <Calendar style={{ width: "12px", height: "12px", display: "inline", marginRight: "4px" }} />
                      {item.tanggal} • {item.waktu}
                    </span>
                  </div>
                  <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A", margin: "0 0 6px 0" }}>
                    {item.materi}
                  </h4>
                  <div style={{ fontSize: "11px", color: "#475569", display: "flex", flexWrap: "wrap", gap: "16px" }}>
                    <span>Instruktur: <strong>{item.instruktur}</strong></span>
                    <span>Lokasi: <strong>{item.lokasi}</strong></span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "#059669", backgroundColor: "#ECFDF5", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Check style={{ width: "12px", height: "12px" }} /> {item.status}
                    </span>
                    <span style={{ fontSize: "11px", color: "#64748B", display: "block", marginTop: "4px" }}>
                      Nilai: <strong style={{ color: "#0F172A" }}>{item.score}</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => alert(`Mengunduh materi: ${item.fileModul}`)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "10px",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#0F2E5C",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer"
                    }}
                  >
                    <Download style={{ width: "13px", height: "13px" }} />
                    <span>Modul PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. UJI KOMPETENSI & ASESMEN (ASESMEN) */}
      <section id="asesmen" style={{ scrollMarginTop: "120px" }}>
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", border: "1px solid #E2E8F0", padding: "26px 30px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669", backgroundColor: "#ECFDF5", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 style={{ width: "12px", height: "12px" }} /> Hasil Asesmen Uji Kompetensi
              </span>
              <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0F172A", margin: "6px 0 0 0" }}>
                Uji Kompetensi & Asesmen Mandiri Tenaga Kerja Konstruksi
              </h2>
              <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
                Berdasarkan Standar Kompetensi Kerja Nasional Indonesia (SKKNI) Bidang Konstruksi Bangunan Gedung
              </p>
            </div>

            <span style={{ fontSize: "12px", fontWeight: 900, color: "#059669", backgroundColor: "#ECFDF5", padding: "6px 14px", borderRadius: "10px", border: "1px solid #A7F3D0" }}>
              Keputusan: DIREKOMENDASIKAN KOMPETEN
            </span>
          </div>

          {/* Box Info Pelaksanaan Uji */}
          <div style={{ backgroundColor: "#F0F9FF", borderRadius: "14px", border: "1px solid #BAE6FD", padding: "18px 20px", marginBottom: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", fontSize: "12px" }}>
            <div>
              <span style={{ color: "#0369A1", fontWeight: 700, display: "block" }}>Lembaga Sertifikasi Profesi (LSP):</span>
              <span style={{ fontWeight: 800, color: "#0F172A" }}>LSP Konstruksi Indonesia Mandiri</span>
              <span style={{ fontSize: "10px", color: "#64748B", display: "block" }}>Lisensi BNSP: KEP.0421/BNSP/2023</span>
            </div>
            <div>
              <span style={{ color: "#0369A1", fontWeight: 700, display: "block" }}>Tempat Uji Kompetensi (TUK):</span>
              <span style={{ fontWeight: 800, color: "#0F172A" }}>TUK Mandiri Dinas PUPR Kab. Bogor</span>
              <span style={{ fontSize: "10px", color: "#64748B", display: "block" }}>Jl. Raya Tegar Beriman No. 45, Cibinong</span>
            </div>
            <div>
              <span style={{ color: "#0369A1", fontWeight: 700, display: "block" }}>Asesor Penguji (BNSP):</span>
              <span style={{ fontWeight: 800, color: "#0F172A" }}>Ir. H. Mulyadi, MT, IPM</span>
              <span style={{ fontSize: "10px", color: "#64748B", display: "block" }}>No. Reg: MET.000.002819 2021</span>
            </div>
            <div>
              <span style={{ color: "#0369A1", fontWeight: 700, display: "block" }}>Nomor Berita Acara Asesmen (BAA):</span>
              <span style={{ fontWeight: 800, color: "#0F172A", fontFamily: "monospace" }}>042/BAA-LSP/PUPR-BGR/IX/2026</span>
              <span style={{ fontSize: "10px", color: "#059669", display: "block", fontWeight: 700 }}>Tanggal: 18 September 2026</span>
            </div>
          </div>

          {/* Tabel Unit Kompetensi */}
          <div style={{ borderRadius: "14px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#64748B", fontWeight: 800 }}>
                  <th style={{ padding: "12px 16px", width: "150px" }}>Kode Unit</th>
                  <th style={{ padding: "12px 16px" }}>Judul Unit Kompetensi (SKKNI)</th>
                  <th style={{ padding: "12px 16px", width: "160px" }}>Metode Asesmen</th>
                  <th style={{ padding: "12px 16px", width: "140px", textAlign: "center" }}>Hasil Evaluasi</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    kode: "F.410100.001.01",
                    judul: "Menerapkan Sistem Manajemen Keselamatan dan Kesehatan Kerja (SMKK) di Tempat Kerja",
                    metode: "Observasi & Portofolio",
                    hasil: "KOMPETEN (K)"
                  },
                  {
                    kode: "F.410100.002.01",
                    judul: "Melakukan Komunikasi Efektif dan Koordinasi Kerja Bersama Mandor & Subkontraktor",
                    metode: "Wawancara Lisan",
                    hasil: "KOMPETEN (K)"
                  },
                  {
                    kode: "F.410100.005.02",
                    judul: "Melaksanakan Pengawasan Pekerjaan Struktur Gedung (Pondasi, Kolom, Balok, Plat Lantai)",
                    metode: "Praktik Lapangan (Demo)",
                    hasil: "KOMPETEN (K)"
                  },
                  {
                    kode: "F.410100.008.01",
                    judul: "Membuat Laporan Harian, Laporan Mingguan, dan Berita Acara Progres Lapangan",
                    metode: "Studi Kasus & Portofolio",
                    hasil: "KOMPETEN (K)"
                  },
                  {
                    kode: "F.410100.012.01",
                    judul: "Memeriksa Kelaikan Material Bahan Bangunan dan Mutu Beton Ready-Mix di Lapangan",
                    metode: "Demonstrasi Slump Test",
                    hasil: "KOMPETEN (K)"
                  },
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: idx === 4 ? "none" : "1px solid #F1F5F9" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 700, fontFamily: "monospace", color: "#0284C7" }}>
                      {row.kode}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#1E293B" }}>
                      {row.judul}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#64748B" }}>
                      {row.metode}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669", backgroundColor: "#ECFDF5", padding: "4px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Check style={{ width: "12px", height: "12px" }} /> {row.hasil}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Catatan Asesor */}
          <div style={{ marginTop: "16px", backgroundColor: "#F8FAFC", borderRadius: "12px", padding: "14px 18px", border: "1px solid #E2E8F0" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#475569", display: "block", marginBottom: "4px" }}>
              Catatan & Kesimpulan Tim Asesor Penguji:
            </span>
            <p style={{ fontSize: "12px", color: "#334155", margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>
              "Asesi atas nama Ahmad Fauzi, A.Md telah mendemonstrasikan bukti kerja memadai, konsisten, dan memenuhi seluruh kriteria unjuk kerja pada 5 Unit Kompetensi Jenjang 4 Pelaksana Lapangan Gedung. Asesi direkomendasikan untuk diterbitkan Sertifikat Kompetensi Kerja (SKK) Konstruksi Nasional."
            </p>
          </div>
        </div>
      </section>

      {/* 4. E-SERTIFIKAT SKK DIGITAL (SERTIFIKAT) */}
      <section id="sertifikat" style={{ scrollMarginTop: "120px" }}>
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", border: "1px solid #E2E8F0", padding: "26px 30px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#0284C7", backgroundColor: "#E0F2FE", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Award style={{ width: "12px", height: "12px" }} /> Dokumen Resmi Terakreditasi
              </span>
              <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0F172A", margin: "6px 0 0 0" }}>
                Sertifikat Kompetensi Kerja (SKK) Konstruksi Digital
              </h2>
              <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
                Dokumen resmi berlisensi BNSP & terintegrasi dengan Portal SIPJAKI / LPJK Kementerian PUPR RI
              </p>
            </div>

            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 22px",
                borderRadius: "12px",
                backgroundColor: "#0284C7",
                color: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 800,
                border: "none",
                cursor: downloading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(2, 132, 199, 0.25)"
              }}
            >
              <Download style={{ width: "16px", height: "16px" }} />
              <span>{downloading ? "Menyiapkan PDF Resmi..." : "Unduh E-Sertifikat (PDF)"}</span>
            </button>
          </div>

          {/* Certificate Mock Preview Card */}
          <div
            style={{
              borderRadius: "18px",
              border: "2px solid #BAE6FD",
              background: "linear-gradient(to right, #F0F9FF, #FFFFFF)",
              padding: "26px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              alignItems: "center"
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#0369A1", textTransform: "uppercase" }}>
                Nomor Registrasi Sertifikat BNSP / SIPJAKI:
              </span>
              <span style={{ fontSize: "20px", fontWeight: 900, fontFamily: "monospace", color: "#0F2E5C" }}>
                SKK-2026-DPUPR-BG-0042
              </span>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "#64748B", display: "block" }}>Nama Lengkap:</span>
                  <span style={{ fontWeight: 800, color: "#1E293B" }}>Ahmad Fauzi, A.Md</span>
                </div>
                <div>
                  <span style={{ color: "#64748B", display: "block" }}>Nomor Induk Kependudukan:</span>
                  <span style={{ fontWeight: 800, color: "#1E293B" }}>3201019203840003</span>
                </div>
                <div>
                  <span style={{ color: "#64748B", display: "block" }}>Jabatan Kerja / Kualifikasi:</span>
                  <span style={{ fontWeight: 800, color: "#0369A1" }}>Pelaksana Lapangan Gedung (Jenjang 4)</span>
                </div>
                <div>
                  <span style={{ color: "#64748B", display: "block" }}>Masa Berlaku:</span>
                  <span style={{ fontWeight: 800, color: "#059669" }}>5 Tahun (s/d 18 September 2031)</span>
                </div>
              </div>
            </div>

            {/* QR Verification Box */}
            <div 
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                border: "1px solid #CBD5E1",
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: "18px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
              }}
            >
              <div style={{ width: "80px", height: "80px", backgroundColor: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <QrCode style={{ width: "60px", height: "60px", color: "#0F2E5C" }} />
              </div>
              <div>
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#059669", backgroundColor: "#ECFDF5", padding: "3px 10px", borderRadius: "9999px" }}>
                  QR Code Valid SIPJAKI Nasional
                </span>
                <p style={{ fontSize: "11px", color: "#475569", margin: "8px 0 0 0", lineHeight: 1.5 }}>
                  Pindai QR ini melalui aplikasi kamera ponsel untuk memverifikasi keabsahan sertifikat secara langsung di database LPJK Kementerian PUPR.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

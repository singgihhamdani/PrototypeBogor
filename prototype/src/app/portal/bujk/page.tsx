"use client";
import { useState, useEffect, useMemo } from "react";
import { 
  Building2, ShieldCheck, FileCheck, AlertTriangle, UploadCloud, 
  Clock, CheckCircle2, ChevronRight, Download, FileText, Calendar,
  ExternalLink, HardHat, TrendingUp, Search, Filter, ArrowUpDown,
  Sparkles, Check, CheckCheck, Loader2
} from "lucide-react";
import { useAuth } from "@/lib/mock-auth";
import { fetchPaketListByBUJK, PaketItem } from "@/lib/services/master-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function BujkPortalPage() {
  const { user } = useAuth();
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Data Riwayat Proyek Terkait BUJK
  const [projects, setProjects] = useState<PaketItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState<string>("Semua");
  const [filterStatus, setFilterStatus] = useState<string>("Semua");
  const [sortBy, setSortBy] = useState<"terbaru" | "terlama" | "nilai_tertinggi">("terbaru");

  const bujkNib = "1234567890123";
  const bujkId = "B001";
  const bujkName = user?.bujkName || "PT Bangun Jaya Konstruksi";

  useEffect(() => {
    let isMounted = true;
    async function loadProjects() {
      setLoadingProjects(true);
      try {
        const res = await fetchPaketListByBUJK(bujkId, bujkNib, bujkName);
        if (isMounted) {
          setProjects(res.data);
        }
      } catch (err) {
        console.error("Gagal memuat riwayat paket BUJK:", err);
      } finally {
        if (isMounted) setLoadingProjects(false);
      }
    }

    loadProjects();
    return () => { isMounted = false; };
  }, [bujkId, bujkNib, bujkName]);

  // Filter & Sort Logika (Setting Default: Urutan Pekerjaan Terakhir / Mutakhir di Atas)
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const matchSearch = (p.nama_paket || "").toLowerCase().includes(search.toLowerCase()) ||
                            (p.id || "").toLowerCase().includes(search.toLowerCase()) ||
                            (p.nama_instansi || "").toLowerCase().includes(search.toLowerCase());
        const matchYear = filterYear === "Semua" || String(p.tahun_anggaran) === filterYear;
        const matchStatus = filterStatus === "Semua" || p.status_pekerjaan === filterStatus;
        return matchSearch && matchYear && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === "terbaru") {
          // Setting Default: Kronologis Terbalik (Pekerjaan Terakhir / Mutakhir di Atas)
          if ((b.tahun_anggaran || 0) !== (a.tahun_anggaran || 0)) {
            return (b.tahun_anggaran || 0) - (a.tahun_anggaran || 0);
          }
          const dateA = new Date(a.tanggal_mulai || 0).getTime();
          const dateB = new Date(b.tanggal_mulai || 0).getTime();
          if (dateB !== dateA) return dateB - dateA;
          return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
        } else if (sortBy === "terlama") {
          if ((a.tahun_anggaran || 0) !== (b.tahun_anggaran || 0)) {
            return (a.tahun_anggaran || 0) - (b.tahun_anggaran || 0);
          }
          return new Date(a.tanggal_mulai || 0).getTime() - new Date(b.tanggal_mulai || 0).getTime();
        } else if (sortBy === "nilai_tertinggi") {
          return (Number(b.nilai_kontrak) || 0) - (Number(a.nilai_kontrak) || 0);
        }
        return 0;
      });
  }, [projects, search, filterYear, filterStatus, sortBy]);

  const activeProjectsCount = projects.filter((p) => p.status_pekerjaan === "Pelaksanaan").length;
  const totalValue = projects.reduce((acc, curr) => acc + (Number(curr.nilai_kontrak) || 0), 0);

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
        id="dashboard"
        style={{
          scrollMarginTop: "120px",
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
            <span>Badan Usaha Jasa Konstruksi (Tenant ID: {bujkId})</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 900, margin: 0, letterSpacing: "-0.5px" }}>
            {bujkName}
          </h1>
          <p style={{ fontSize: "13px", color: "#E2E8F0", margin: "6px 0 0 0", lineHeight: 1.5 }}>
            NIB: <strong style={{ color: "#FEF08A", fontFamily: "monospace", letterSpacing: "0.5px" }}>{bujkNib}</strong> (Primary Key OSS-RBA) • Penanggung Jawab: <strong>Ir. Ahmad Suryadi</strong> • Kualifikasi: <strong>Besar</strong> • Alamat: Jl. Raya Bogor No. 123, Cibinong, Kab. Bogor
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", padding: "14px 20px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.2)", textAlign: "center" }}>
            <span style={{ fontSize: "10px", color: "#CBD5E1", textTransform: "uppercase", display: "block", fontWeight: 700 }}>Indeks Kepatuhan 3 Tertib</span>
            <span style={{ fontSize: "24px", fontWeight: 900, color: "#4ADE80" }}>88.5%</span>
            <span style={{ fontSize: "10px", color: "#A7F3D0", display: "block", fontWeight: 700 }}>Kategori: Tertib</span>
          </div>

          <div style={{ backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", padding: "14px 20px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.2)", textAlign: "center" }}>
            <span style={{ fontSize: "10px", color: "#CBD5E1", textTransform: "uppercase", display: "block", fontWeight: 700 }}>Paket Berjalan TA 2026</span>
            <span style={{ fontSize: "24px", fontWeight: 900, color: "#FFC000" }}>{activeProjectsCount} Proyek</span>
            <span style={{ fontSize: "10px", color: "#FEF08A", display: "block", fontWeight: 700 }}>Total Portofolio: {formatCurrency(totalValue)}</span>
          </div>
        </div>
      </div>

      {/* 2. SBU Status & Masa Berlaku Grid */}
      <div id="sbu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
              Sertifikat Badan Usaha (SBU) & Izin Berusaha
            </h2>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
              Sinkronisasi real-time dengan portal Lisensi LPJK / SIPJAKI Kementerian PUPR berbasis NIB <strong>{bujkNib}</strong>
            </p>
          </div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669", backgroundColor: "#ECFDF5", padding: "4px 12px", borderRadius: "9999px", border: "1px solid #A7F3D0" }}>
            3 Subklasifikasi Terdaftar (Aktif)
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
                  <span style={{ fontSize: "11px", color: "#64748B" }}>Kualifikasi: Besar (B1)</span>
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
                <span style={{ fontWeight: 700, color: "#059669" }}>15 Juni 2027</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E2E8F0", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#EFF6FF", color: "#1E40AF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "12px" }}>
                  SI001
                </div>
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                    Konstruksi Saluran Air & Drainase
                  </h3>
                  <span style={{ fontSize: "11px", color: "#64748B" }}>Kualifikasi: Besar (B1)</span>
                </div>
              </div>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#059669", backgroundColor: "#ECFDF5", padding: "3px 8px", borderRadius: "6px" }}>
                Aktif
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px", backgroundColor: "#F8FAFC", padding: "10px", borderRadius: "10px" }}>
              <div>
                <span style={{ color: "#94A3B8", display: "block" }}>No. Registrasi LPJK:</span>
                <span style={{ fontWeight: 700, color: "#1E293B" }}>9120-2023-SI001-312</span>
              </div>
              <div>
                <span style={{ color: "#94A3B8", display: "block" }}>Berlaku Hingga:</span>
                <span style={{ fontWeight: 700, color: "#059669" }}>15 Juni 2027</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Proyek yang Sedang Dikerjakan (Tenant Scoped with Default Sort Pekerjaan Terakhir) */}
      <div id="proyek" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
                Riwayat & Daftar Paket Pekerjaan
              </h2>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#1E40AF", backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", padding: "3px 8px", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Sparkles style={{ width: "12px", height: "12px" }} /> Default: Pekerjaan Terakhir (DESC)
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "3px 0 0 0" }}>
              Menampilkan riwayat kontrak pekerjaan Dinas PU yang dikerjakan oleh <strong>{bujkName}</strong> (NIB: {bujkNib})
            </p>
          </div>

          {/* Baris Kontrol Filter & Sorting */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "#94A3B8" }} />
              <input
                type="text"
                placeholder="Cari paket pekerjaan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  height: "36px",
                  paddingLeft: "32px",
                  paddingRight: "12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "12px",
                  backgroundColor: "#FFFFFF",
                  width: "190px",
                  outline: "none"
                }}
              />
            </div>

            {/* Filter Tahun */}
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              style={{
                height: "36px",
                padding: "0 10px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "12px",
                backgroundColor: "#FFFFFF",
                fontWeight: 600,
                color: "#334155",
                outline: "none"
              }}
            >
              <option value="Semua">Semua Tahun</option>
              <option value="2026">TA 2026 (Terkini)</option>
              <option value="2025">TA 2025</option>
              <option value="2024">TA 2024</option>
            </select>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                height: "36px",
                padding: "0 10px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "12px",
                backgroundColor: "#FFFFFF",
                fontWeight: 600,
                color: "#334155",
                outline: "none"
              }}
            >
              <option value="Semua">Semua Status</option>
              <option value="Pelaksanaan">Pelaksanaan</option>
              <option value="Selesai">Selesai</option>
            </select>

            {/* Pengurutan */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#F1F5F9", padding: "4px 8px", borderRadius: "8px" }}>
              <ArrowUpDown style={{ width: "13px", height: "13px", color: "#64748B" }} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  height: "28px",
                  border: "none",
                  backgroundColor: "transparent",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#0F2E5C",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="terbaru">Pekerjaan Terakhir (Default)</option>
                <option value="terlama">Pekerjaan Terlama</option>
                <option value="nilai_tertinggi">Nilai Kontrak Terbesar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabel Riwayat Paket Pekerjaan */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#64748B", fontWeight: 800 }}>
                <th style={{ padding: "12px 14px", width: "40px", textAlign: "center" }}>NO</th>
                <th style={{ padding: "12px 16px" }}>ID & Paket Pekerjaan</th>
                <th style={{ padding: "12px 14px" }}>Tahun / Sumber</th>
                <th style={{ padding: "12px 16px" }}>Nilai Kontrak</th>
                <th style={{ padding: "12px 16px" }}>Progres Fisik</th>
                <th style={{ padding: "12px 14px" }}>Periode Pelaksanaan</th>
                <th style={{ padding: "12px 14px", textAlign: "center" }}>Status</th>
                <th style={{ padding: "12px 16px", textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loadingProjects ? (
                <tr>
                  <td colSpan={8} style={{ padding: "36px", textAlign: "center", color: "#64748B" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <Loader2 style={{ width: "20px", height: "20px", animation: "spin 1s linear infinite", color: "#0F2E5C" }} />
                      <span>Memuat riwayat pekerjaan terkini...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "36px", textAlign: "center", color: "#94A3B8" }}>
                    Tidak ada paket pekerjaan yang sesuai dengan kriteria penyaringan.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p, index) => {
                  const isLatest = index === 0 && sortBy === "terbaru";
                  const isActive = p.status_pekerjaan === "Pelaksanaan";
                  return (
                    <tr 
                      key={p.id} 
                      style={{ 
                        borderBottom: "1px solid #F1F5F9",
                        backgroundColor: isLatest ? "#F8FAFC" : "transparent"
                      }}
                    >
                      <td style={{ padding: "14px 14px", textAlign: "center", fontWeight: 700, color: "#64748B" }}>
                        {index + 1}
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                          <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#0F2E5C", fontWeight: 800 }}>
                            {p.id}
                          </span>
                          {isLatest && (
                            <span style={{ fontSize: "9px", fontWeight: 800, color: "#1E40AF", backgroundColor: "#DBEAFE", padding: "1px 6px", borderRadius: "4px" }}>
                              Pekerjaan Terakhir
                            </span>
                          )}
                          {isActive && (
                            <span style={{ fontSize: "9px", fontWeight: 800, color: "#059669", backgroundColor: "#D1FAE5", padding: "1px 6px", borderRadius: "4px" }}>
                              Sedang Berjalan
                            </span>
                          )}
                        </div>
                        <span style={{ fontWeight: 800, color: "#0F172A", display: "block", fontSize: "13px" }}>
                          {p.nama_paket}
                        </span>
                        <span style={{ fontSize: "11px", color: "#64748B" }}>
                          PPK: {p.nama_instansi} • {p.kecamatan || "Kabupaten Bogor"}
                        </span>
                      </td>

                      <td style={{ padding: "14px 14px" }}>
                        <span style={{ fontWeight: 800, color: "#0F2E5C", display: "block" }}>
                          TA {p.tahun_anggaran}
                        </span>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748B", backgroundColor: "#F1F5F9", padding: "2px 6px", borderRadius: "4px" }}>
                          {p.sumber_dana}
                        </span>
                      </td>

                      <td style={{ padding: "14px 16px", fontWeight: 800, color: "#0F2E5C", fontSize: "13px" }}>
                        {formatCurrency(Number(p.nilai_kontrak) || 0)}
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ flex: 1, height: "6px", backgroundColor: "#E2E8F0", borderRadius: "9999px", overflow: "hidden" }}>
                            <div 
                              style={{ 
                                width: `${Math.min(100, Number(p.progres_fisik) || 0)}%`, 
                                height: "100%", 
                                backgroundColor: Number(p.progres_fisik) >= 100 ? "#10B981" : "#2563EB" 
                              }} 
                            />
                          </div>
                          <span style={{ fontWeight: 800, color: Number(p.progres_fisik) >= 100 ? "#059669" : "#2563EB", fontSize: "12px" }}>
                            {Number(p.progres_fisik).toFixed(1)}%
                          </span>
                        </div>
                        <span style={{ fontSize: "10px", color: "#64748B" }}>
                          Keuangan: {Number(p.progres_keuangan || 0).toFixed(1)}%
                        </span>
                      </td>

                      <td style={{ padding: "14px 14px", fontSize: "11px", color: "#475569" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar style={{ width: "12px", height: "12px", color: "#94A3B8" }} />
                          <span>{p.tanggal_mulai ? formatDate(p.tanggal_mulai) : "-"}</span>
                        </div>
                        <span style={{ fontSize: "10px", color: "#94A3B8", display: "block", marginTop: "2px" }}>
                          s/d {p.tanggal_selesai ? formatDate(p.tanggal_selesai) : "-"}
                        </span>
                      </td>

                      <td style={{ padding: "14px 14px", textAlign: "center" }}>
                        <span 
                          style={{ 
                            fontSize: "10px", 
                            fontWeight: 800, 
                            color: isActive ? "#0284C7" : "#059669", 
                            backgroundColor: isActive ? "#E0F2FE" : "#ECFDF5", 
                            padding: "3px 10px", 
                            borderRadius: "9999px" 
                          }} 
                        >
                          {p.status_pekerjaan}
                        </span>
                      </td>

                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <button 
                          onClick={() => alert(`Membuka berkas SIMAK & monitoring untuk paket: ${p.nama_paket} (${p.id})`)}
                          style={{ 
                            fontSize: "11px", 
                            fontWeight: 700, 
                            color: "#0F2E5C", 
                            backgroundColor: "#EBF2FA", 
                            border: "none", 
                            padding: "6px 12px", 
                            borderRadius: "8px", 
                            cursor: "pointer",
                            transition: "background 0.2s ease"
                          }}
                        >
                          Buka SIMAK
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
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
            <span>Dokumen berhasil diunggah! Berkas sedang diverifikasi oleh Tim Pengawas Lapangan DPU.</span>
          </div>
        )}

        <form onSubmit={handleSimulateUpload} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>
              Pilih Paket Proyek Aktif
            </label>
            <select
              style={{ width: "100%", height: "42px", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#F8FAFC", padding: "0 12px", fontSize: "12px", outline: "none", color: "#1E293B" }}
            >
              {projects.length > 0 ? (
                projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} — {p.nama_paket} (TA {p.tahun_anggaran})
                  </option>
                ))
              ) : (
                <option>P001 — Rekonstruksi Jl. Raya Cibinong - Citeureup (TA 2026)</option>
              )}
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

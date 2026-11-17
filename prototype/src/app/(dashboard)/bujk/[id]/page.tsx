"use client";
import { use, useEffect, useState, useMemo } from "react";
import { 
  ArrowLeft, Building2, FileText, Award, Briefcase, MapPin, Phone, 
  Mail, Calendar, Loader2, Sparkles, ArrowUpDown, Filter, Eye, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";
import { fetchBUJKById, fetchPaketListByBUJK, PaketItem } from "@/lib/services/master-data";

export default function BUJKDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [bujk, setBujk] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Data Riwayat Proyek Terhubung
  const [projects, setProjects] = useState<PaketItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [filterYear, setFilterYear] = useState<string>("Semua");
  const [filterStatus, setFilterStatus] = useState<string>("Semua");
  const [sortBy, setSortBy] = useState<"terbaru" | "terlama" | "nilai_tertinggi">("terbaru");

  useEffect(() => {
    let isMounted = true;
    async function loadDetail() {
      setLoading(true);
      try {
        const item = await fetchBUJKById(id);
        if (isMounted) {
          if (item) {
            setBujk({
              id: item.id,
              name: item.nama_badan_usaha,
              type: item.bentuk_usaha,
              nib: item.nib,
              npwp: item.npwp,
              leader: item.penanggung_jawab,
              qualification: item.kualifikasi,
              district: item.kecamatan,
              districtId: item.kode_kecamatan || "01",
              sbuCount: item.jumlah_sbu,
              status: item.status_verifikasi,
              phone: item.telepon || "-",
              email: item.email || "-",
              address: item.alamat,
              sbuExpiry: item.tanggal_kedaluwarsa_sbu || "2027-12-31",
              projectsActive: item.proyek_aktif_count
            });

            // Muat riwayat proyek terkait BUJK ini
            setLoadingProjects(true);
            try {
              const resProjects = await fetchPaketListByBUJK(item.id, item.nib, item.nama_badan_usaha);
              if (isMounted) {
                setProjects(resProjects.data);
              }
            } catch (pErr) {
              console.error("Gagal memuat proyek BUJK:", pErr);
            } finally {
              if (isMounted) setLoadingProjects(false);
            }
          } else {
            setBujk(null);
          }
        }
      } catch (err) {
        console.error("Gagal memuat detail BUJK:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDetail();
    return () => { isMounted = false; };
  }, [id]);

  // Filter & Urutan Riwayat Proyek (Default: Kronologis Terbalik / Pekerjaan Terakhir di Atas)
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const matchYear = filterYear === "Semua" || String(p.tahun_anggaran) === filterYear;
        const matchStatus = filterStatus === "Semua" || p.status_pekerjaan === filterStatus;
        return matchYear && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === "terbaru") {
          // Setting Default: Kronologis Terbalik
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
  }, [projects, filterYear, filterStatus, sortBy]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: "12px" }}>
        <Loader2 style={{ width: "28px", height: "28px", color: "#0F2E5C", animation: "spin 1s linear infinite" }} />
        <p style={{ color: "#64748B", fontSize: "14px", fontWeight: 600 }}>Memuat profil Badan Usaha...</p>
      </div>
    );
  }

  if (!bujk) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: "12px" }}>
      <Building2 style={{ width: "40px", height: "40px", color: "#CBD5E1" }} />
      <p style={{ color: "#94A3B8", fontSize: "14px", fontWeight: 600 }}>BUJK dengan ID {id} tidak ditemukan.</p>
      <Link href="/bujk" style={{ fontSize: "12px", color: "#0F2E5C", fontWeight: 700 }}>Kembali ke Daftar BUJK</Link>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <Link 
        href="/bujk" 
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
          fontWeight: 700,
          color: "#0F2E5C",
          textDecoration: "none"
        }}
      >
        <ArrowLeft style={{ width: "16px", height: "16px" }} /> Kembali ke Master Data BUJK
      </Link>

      {/* Header card */}
      <div 
        style={{
          borderRadius: "18px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          padding: "24px 28px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div 
              style={{
                height: "56px",
                width: "56px",
                borderRadius: "16px",
                backgroundColor: "#0F2E5C",
                color: "#FFC000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "20px"
              }}
            >
              {bujk.type}
            </div>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
                {bujk.name}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#0F2E5C", fontWeight: 700, backgroundColor: "#EBF2FA", padding: "2px 8px", borderRadius: "6px" }}>
                  NIB: {bujk.nib} (Primary Key OSS-RBA)
                </span>
                <span 
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    backgroundColor: bujk.status === "Aktif" ? "#ECFDF5" : "#FFFBEB",
                    color: bujk.status === "Aktif" ? "#059669" : "#B45309"
                  }}
                >
                  {bujk.status}
                </span>
              </div>
            </div>
          </div>

          <span 
            style={{
              fontSize: "12px",
              fontWeight: 800,
              padding: "8px 16px",
              borderRadius: "10px",
              backgroundColor: bujk.qualification === "Besar" ? "#EFF6FF" : bujk.qualification === "Menengah" ? "#FFFBEB" : "#ECFDF5",
              color: bujk.qualification === "Besar" ? "#1E40AF" : bujk.qualification === "Menengah" ? "#B45309" : "#059669",
              border: "1px solid rgba(0,0,0,0.06)"
            }}
          >
            Kualifikasi: {bujk.qualification}
          </span>
        </div>
      </div>

      {/* Info grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: "16px" }}>
        <div 
          style={{
            borderRadius: "18px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: "24px 26px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #F1F5F9", paddingBottom: "12px" }}>
            <Building2 style={{ width: "16px", height: "16px", color: "#0F2E5C" }} /> Informasi Perusahaan
          </h3>
          {[
            { label: "Pimpinan / Penanggung Jawab", value: bujk.leader, icon: Briefcase },
            { label: "Nomor NPWP Badan Usaha", value: bujk.npwp, icon: FileText },
            { label: "Kecamatan Domisili", value: `Kec. ${bujk.district}`, icon: MapPin },
            { label: "Alamat Lengkap", value: bujk.address, icon: MapPin },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <item.icon style={{ width: "16px", height: "16px", color: "#94A3B8", marginTop: "2px", flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: "11px", color: "#64748B", margin: 0, fontWeight: 600 }}>{item.label}</p>
                <p style={{ fontSize: "13px", color: "#0F172A", margin: "2px 0 0 0", fontWeight: 700 }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div 
          style={{
            borderRadius: "18px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: "24px 26px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #F1F5F9", paddingBottom: "12px" }}>
            <Award style={{ width: "16px", height: "16px", color: "#0F2E5C" }} /> Kontak & Sertifikat SBU
          </h3>
          {[
            { label: "Nomor Telepon Kantor", value: bujk.phone, icon: Phone },
            { label: "Email Korespondensi", value: bujk.email, icon: Mail },
            { label: "Jumlah SBU Aktif", value: `${bujk.sbuCount} Sertifikat Subklasifikasi`, icon: Award },
            { label: "Masa Berlaku SBU", value: formatDate(bujk.sbuExpiry), icon: Calendar },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <item.icon style={{ width: "16px", height: "16px", color: "#94A3B8", marginTop: "2px", flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: "11px", color: "#64748B", margin: 0, fontWeight: 600 }}>{item.label}</p>
                <p style={{ fontSize: "13px", color: "#0F172A", margin: "2px 0 0 0", fontWeight: 700 }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabel Riwayat Paket Pekerjaan Terhubung (Urutan Default: Pekerjaan Terakhir) */}
      <div 
        style={{
          borderRadius: "18px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          padding: "24px 28px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                Riwayat Portofolio Paket Pekerjaan ({projects.length} Total Riwayat)
              </h3>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#1E40AF", backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", padding: "2px 8px", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Sparkles style={{ width: "12px", height: "12px" }} /> Default: Pekerjaan Terakhir (DESC)
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0 0" }}>
              Tersinkronisasi otomatis dengan modul Paket Pekerjaan dan SPSE / SIPJAKI Kementerian PUPR
            </p>
          </div>

          {/* Kontrol Filter & Sorting */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              style={{
                height: "34px",
                padding: "0 10px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "12px",
                backgroundColor: "#F8FAFC",
                fontWeight: 600,
                color: "#334155",
                outline: "none"
              }}
            >
              <option value="Semua">Semua Tahun</option>
              <option value="2026">TA 2026</option>
              <option value="2025">TA 2025</option>
              <option value="2024">TA 2024</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                height: "34px",
                padding: "0 10px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "12px",
                backgroundColor: "#F8FAFC",
                fontWeight: 600,
                color: "#334155",
                outline: "none"
              }}
            >
              <option value="Semua">Semua Status</option>
              <option value="Pelaksanaan">Pelaksanaan</option>
              <option value="Selesai">Selesai</option>
            </select>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#F1F5F9", padding: "3px 8px", borderRadius: "8px" }}>
              <ArrowUpDown style={{ width: "12px", height: "12px", color: "#64748B" }} />
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
                <option value="nilai_tertinggi">Nilai Tertinggi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabel */}
        <div style={{ border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden" }}>
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
                <th style={{ padding: "12px 16px", textAlign: "center" }}>Detail</th>
              </tr>
            </thead>
            <tbody>
              {loadingProjects ? (
                <tr>
                  <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "#64748B" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <Loader2 style={{ width: "18px", height: "18px", animation: "spin 1s linear infinite", color: "#0F2E5C" }} />
                      <span>Memuat riwayat paket pekerjaan terkini...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "#94A3B8" }}>
                    Tidak ada riwayat pekerjaan yang tercatat untuk kriteria ini.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p, idx) => {
                  const isLatest = idx === 0 && sortBy === "terbaru";
                  const isActive = p.status_pekerjaan === "Pelaksanaan";
                  return (
                    <tr 
                      key={p.id} 
                      style={{ 
                        borderBottom: "1px solid #F1F5F9",
                        backgroundColor: isLatest ? "#F8FAFC" : "transparent"
                      }}
                    >
                      <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700, color: "#64748B" }}>
                        {idx + 1}
                      </td>

                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
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
                              Aktif
                            </span>
                          )}
                        </div>
                        <span style={{ fontWeight: 800, color: "#0F172A", display: "block" }}>
                          {p.nama_paket}
                        </span>
                        <span style={{ fontSize: "11px", color: "#64748B" }}>
                          {p.nama_instansi} • {p.kecamatan || "Kabupaten Bogor"}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontWeight: 800, color: "#0F2E5C", display: "block" }}>
                          TA {p.tahun_anggaran}
                        </span>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748B", backgroundColor: "#F1F5F9", padding: "2px 6px", borderRadius: "4px" }}>
                          {p.sumber_dana}
                        </span>
                      </td>

                      <td style={{ padding: "12px 16px", fontWeight: 800, color: "#0F2E5C" }}>
                        {formatCurrency(Number(p.nilai_kontrak) || 0)}
                      </td>

                      <td style={{ padding: "12px 16px" }}>
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
                          <span style={{ fontWeight: 800, color: Number(p.progres_fisik) >= 100 ? "#059669" : "#2563EB" }}>
                            {Number(p.progres_fisik).toFixed(1)}%
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", fontSize: "11px", color: "#475569" }}>
                        <span>{p.tanggal_mulai ? formatDate(p.tanggal_mulai) : "-"}</span>
                        <span style={{ color: "#94A3B8", display: "block" }}>
                          s/d {p.tanggal_selesai ? formatDate(p.tanggal_selesai) : "-"}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
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

                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <Link 
                          href={`/paket-pekerjaan/${p.id}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#0F2E5C",
                            backgroundColor: "#F1F5F9",
                            padding: "5px 10px",
                            borderRadius: "6px",
                            textDecoration: "none"
                          }}
                        >
                          <Eye style={{ width: "13px", height: "13px" }} /> Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

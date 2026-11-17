"use client";
import { useState, useEffect, useMemo } from "react";
import { 
  GraduationCap, Award, CheckCircle2, Clock, Calendar, 
  Download, QrCode, FileText, Check, BookOpen, AlertCircle, 
  Sparkles, UserCheck, ShieldCheck, MapPin, Building, ChevronRight,
  ExternalLink, Printer, Search, Lock, UserPlus, KeyRound, AlertTriangle,
  RefreshCw, ArrowUpDown, Filter, Eye, CheckCheck, Loader2
} from "lucide-react";
import { 
  fetchPesertaProfile, fetchRiwayatPelatihanByPeserta, 
  checkPesertaNIKExists, registerPesertaEksternal, 
  updatePasswordPeserta, generateNomorSertifikat,
  PesertaItem, RiwayatPelatihanItem 
} from "@/lib/services/peserta-service";
import fallbackPeserta from "@/data/peserta_pelatihan.json";
import { formatDate } from "@/lib/utils";

export default function PesertaPortalPage() {
  // Simulasi Role Switcher Peserta
  const [selectedPesertaId, setSelectedPesertaId] = useState<string>("PST-2026-0094");
  const [peserta, setPeserta] = useState<PesertaItem | null>(null);
  const [riwayatList, setRiwayatList] = useState<RiwayatPelatihanItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search untuk Riwayat Pelatihan
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState<string>("Semua");
  const [filterStatus, setFilterStatus] = useState<string>("Semua");
  const [sortBy, setSortBy] = useState<"terbaru" | "terlama" | "nilai">("terbaru");

  // State Modal Wajib Ganti Password (First Login)
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [defaultPasswordInput, setDefaultPasswordInput] = useState("Sijakon2026!");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // State Modal Pendaftaran Mandiri (Eksternal)
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [nikWarning, setNikWarning] = useState<string | null>(null);
  const [regForm, setRegForm] = useState({
    nama_lengkap: "",
    nik: "",
    email: "",
    telepon: "",
    pendidikan_terakhir: "SMA/SMK",
    riwayat_pekerjaan: "",
    ktp_url: "KTP_Peserta_Mandiri.pdf",
    ijazah_url: "Ijazah_Peserta_Mandiri.pdf",
    foto_url: "Foto_3x4_Mandiri.jpg",
    memiliki_sertifikat_lpjk: false,
    nomor_registrasi_lpjk: "",
    kategori_diminati: "PEL-GEDUNG"
  });

  // State E-Sertifikat Download Simulator
  const [downloading, setDownloading] = useState(false);

  // Muat Data Peserta saat Role Switcher berganti
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetchPesertaProfile(selectedPesertaId);
        if (isMounted) {
          if (res.data) {
            setPeserta(res.data);
            setRiwayatList(res.data.riwayat || []);
            // Jika akun merupakan internal dan first login, picu modal ganti kata sandi
            if (res.data.is_first_login) {
              setShowPasswordModal(true);
            } else {
              setShowPasswordModal(false);
            }
          }
        }
      } catch (err) {
        console.error("Gagal memuat profil peserta:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [selectedPesertaId]);

  // Logika Filter & Sorting (Setting Default: Urutan Pelatihan Terakhir / Mutakhir di Atas)
  const filteredRiwayat = useMemo(() => {
    return riwayatList
      .filter((r) => {
        const matchSearch = (r.nama_kegiatan || "").toLowerCase().includes(search.toLowerCase()) ||
                            (r.nomor_sertifikat || "").toLowerCase().includes(search.toLowerCase()) ||
                            (r.kategori_pelatihan || "").toLowerCase().includes(search.toLowerCase());
        const matchYear = filterYear === "Semua" || String(r.tahun_pelatihan) === filterYear;
        const matchStatus = filterStatus === "Semua" || r.hasil_asesmen === filterStatus;
        return matchSearch && matchYear && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === "terbaru") {
          // Setting Default: Kronologis Terbalik (Pelatihan Terakhir di Atas)
          if (b.tahun_pelatihan !== a.tahun_pelatihan) {
            return b.tahun_pelatihan - a.tahun_pelatihan;
          }
          return new Date(b.tanggal_mulai).getTime() - new Date(a.tanggal_mulai).getTime();
        } else if (sortBy === "terlama") {
          if (a.tahun_pelatihan !== b.tahun_pelatihan) {
            return a.tahun_pelatihan - b.tahun_pelatihan;
          }
          return new Date(a.tanggal_mulai).getTime() - new Date(b.tanggal_mulai).getTime();
        } else if (sortBy === "nilai") {
          return (Number(b.nilai_akhir) || 0) - (Number(a.nilai_akhir) || 0);
        }
        return 0;
      });
  }, [riwayatList, search, filterYear, filterStatus, sortBy]);

  // Tangani Validasi NIK Real-time pada Pendaftaran Mandiri
  const handleNikInputChange = async (val: string) => {
    const cleanVal = val.replace(/\D/g, ""); // hanya digit
    setRegForm((prev) => ({ ...prev, nik: cleanVal }));

    if (cleanVal.length === 16) {
      const check = await checkPesertaNIKExists(cleanVal);
      if (check.exists) {
        setNikWarning(`NIK ${cleanVal} sudah terdaftar atas nama "${check.pesertaName}". Setiap NIK hanya dapat didaftarkan satu kali.`);
      } else {
        setNikWarning(null);
      }
    } else if (cleanVal.length > 0 && cleanVal.length < 16) {
      setNikWarning(`Format NIK harus tepat 16 digit (${cleanVal.length}/16 digit).`);
    } else {
      setNikWarning(null);
    }
  };

  // Tangani Submit Pendaftaran Mandiri Eksternal
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regForm.nik.length !== 16) {
      alert("Harap masukkan 16 digit NIK yang valid.");
      return;
    }
    if (nikWarning) {
      alert("Tidak dapat melanjutkan: " + nikWarning);
      return;
    }

    setIsRegistering(true);
    try {
      const res = await registerPesertaEksternal({
        nik: regForm.nik,
        nama_lengkap: regForm.nama_lengkap,
        email: regForm.email,
        telepon: regForm.telepon,
        pendidikan_terakhir: regForm.pendidikan_terakhir,
        riwayat_pekerjaan: regForm.riwayat_pekerjaan,
        ktp_url: regForm.ktp_url,
        ijazah_url: regForm.ijazah_url,
        foto_url: regForm.foto_url,
        memiliki_sertifikat_lpjk: regForm.memiliki_sertifikat_lpjk,
        nomor_registrasi_lpjk: regForm.nomor_registrasi_lpjk,
        kategori_pelatihan_diminati: regForm.kategori_diminati
      });

      if (res.success && res.data) {
        setRegisterSuccess(true);
        setTimeout(() => {
          setRegisterSuccess(false);
          setShowRegisterModal(false);
          // Alihkan ke peserta yang baru didaftarkan
          setSelectedPesertaId(res.data!.id);
        }, 2000);
      } else {
        alert(res.error || "Gagal melakukan pendaftaran mandiri");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  // Tangani Submit Wajib Ganti Password (First Login)
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordError("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (!peserta) return;

    const res = await updatePasswordPeserta(peserta.id, newPassword);
    if (res.success) {
      setPasswordSuccess(true);
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordModal(false);
        setPeserta((prev) => prev ? { ...prev, is_first_login: false } : null);
      }, 1500);
    } else {
      setPasswordError(res.error || "Gagal mengubah kata sandi.");
    }
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert(`Simulasi Berhasil: E-Sertifikat Resmi Digital ${latestCertificateNo} (PDF) ber-QR Code SIPJAKI berhasil diunduh.`);
    }, 1200);
  };

  // Sertifikat Terkini untuk Kartu E-Sertifikat
  const latestRiwayat = riwayatList[0];
  const latestCertificateNo = latestRiwayat?.nomor_sertifikat || "2026/PEL-GEDUNG/0094";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* 0. ROLE SWITCHER BAR (SIMULASI PERAN SKEMA INTERNAL & EKSTERNAL) */}
      <div 
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "18px",
          border: "1px solid #E2E8F0",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Simulasi Roleplay:
          </span>

          {/* Tombol Peserta 1 (Internal Ahmad Fauzi) */}
          <button
            onClick={() => setSelectedPesertaId("PST-2026-0094")}
            style={{
              padding: "6px 14px",
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: 700,
              border: selectedPesertaId === "PST-2026-0094" ? "2px solid #0284C7" : "1px solid #CBD5E1",
              backgroundColor: selectedPesertaId === "PST-2026-0094" ? "#E0F2FE" : "#F8FAFC",
              color: selectedPesertaId === "PST-2026-0094" ? "#0369A1" : "#475569",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            Ahmad Fauzi (Internal Batch — Sertifikat 2026)
          </button>

          {/* Tombol Peserta 2 (Internal Dedi Kurniawan - First Login) */}
          <button
            onClick={() => setSelectedPesertaId("PST-2026-0095")}
            style={{
              padding: "6px 14px",
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: 700,
              border: selectedPesertaId === "PST-2026-0095" ? "2px solid #D97706" : "1px solid #CBD5E1",
              backgroundColor: selectedPesertaId === "PST-2026-0095" ? "#FEF3C7" : "#F8FAFC",
              color: selectedPesertaId === "PST-2026-0095" ? "#92400E" : "#475569",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            Dedi Kurniawan (Internal Batch — Simulasi First Login)
          </button>

          {/* Tombol Peserta 3 (Eksternal Budi Prasetyo) */}
          <button
            onClick={() => setSelectedPesertaId("PST-2026-0096")}
            style={{
              padding: "6px 14px",
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: 700,
              border: selectedPesertaId === "PST-2026-0096" ? "2px solid #059669" : "1px solid #CBD5E1",
              backgroundColor: selectedPesertaId === "PST-2026-0096" ? "#ECFDF5" : "#F8FAFC",
              color: selectedPesertaId === "PST-2026-0096" ? "#065F46" : "#475569",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            Budi Prasetyo (Eksternal Mandiri — Portofolio LPJK)
          </button>
        </div>

        {/* Tombol Pendaftaran Mandiri Baru */}
        <button
          onClick={() => {
            setRegForm({
              nama_lengkap: "",
              nik: "",
              email: "",
              telepon: "",
              pendidikan_terakhir: "SMA/SMK",
              riwayat_pekerjaan: "",
              ktp_url: "KTP_Peserta_Mandiri.pdf",
              ijazah_url: "Ijazah_Peserta_Mandiri.pdf",
              foto_url: "Foto_3x4_Mandiri.jpg",
              memiliki_sertifikat_lpjk: false,
              nomor_registrasi_lpjk: "",
              kategori_diminati: "PEL-GEDUNG"
            });
            setNikWarning(null);
            setShowRegisterModal(true);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "#0F2E5C",
            color: "#FFFFFF",
            padding: "8px 16px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 800,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(15, 46, 92, 0.2)"
          }}
        >
          <UserPlus style={{ width: "14px", height: "14px", color: "#FFC000" }} />
          <span>+ Pendaftaran Mandiri (Eksternal)</span>
        </button>
      </div>

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
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(255,255,255,0.18)", padding: "5px 14px", borderRadius: "9999px", fontSize: "11px", fontWeight: 800, color: "#E0F2FE", border: "1px solid rgba(255,255,255,0.25)" }}>
                <GraduationCap style={{ width: "15px", height: "15px", color: "#38BDF8" }} />
                <span>Program Pembinaan TKK Kabupaten Bogor TA 2026</span>
              </div>

              {/* Lencana Skema Pendaftaran & ID TKK */}
              <span 
                style={{ 
                  fontSize: "11px", 
                  fontWeight: 800, 
                  backgroundColor: peserta?.skema_pendaftaran === "Internal (Batch)" ? "#FEF3C7" : "#DCFCE7", 
                  color: peserta?.skema_pendaftaran === "Internal (Batch)" ? "#92400E" : "#166534", 
                  padding: "4px 12px", 
                  borderRadius: "9999px" 
                }}
              >
                Skema: {peserta?.skema_pendaftaran || "Internal (Batch)"}
              </span>

              <span 
                style={{ 
                  fontSize: "11px", 
                  fontWeight: 800, 
                  backgroundColor: "rgba(255,255,255,0.2)", 
                  color: "#FEF08A", 
                  padding: "4px 12px", 
                  borderRadius: "9999px",
                  border: "1px solid rgba(254, 240, 138, 0.4)",
                  fontFamily: "monospace"
                }}
              >
                ID TKK: {peserta?.id_tkk || "TKK-2026-0001"}
              </span>

              <span 
                style={{ 
                  fontSize: "10px", 
                  fontWeight: 800, 
                  backgroundColor: peserta?.status_kelengkapan === "Belum Lengkap" ? "#FEE2E2" : "#ECFDF5", 
                  color: peserta?.status_kelengkapan === "Belum Lengkap" ? "#991B1B" : "#065F46", 
                  padding: "3px 10px", 
                  borderRadius: "9999px"
                }}
              >
                {peserta?.status_kelengkapan === "Belum Lengkap" ? "⚠ Syarat Belum Lengkap" : "✓ Syarat Lengkap"}
              </span>
            </div>

            <h1 style={{ fontSize: "28px", fontWeight: 900, margin: 0, letterSpacing: "-0.5px" }}>
              Selamat Datang, {peserta?.nama_lengkap || "Ahmad Fauzi, A.Md"}
            </h1>
            
            <p style={{ fontSize: "13px", color: "#E0F2FE", margin: "8px 0 0 0", lineHeight: 1.6 }}>
              ID TKK: <strong style={{ color: "#FEF08A", fontFamily: "monospace", letterSpacing: "0.5px" }}>{peserta?.id_tkk || "TKK-2026-0001"}</strong> • NIK: <strong style={{ color: "#FEF08A", fontFamily: "monospace", letterSpacing: "0.5px" }}>{peserta?.nik || "3201011205920001"}</strong> • Pendidikan: <strong>{peserta?.pendidikan_terakhir || "D3"}</strong> • Asal BUJK: <strong>{peserta?.asal_instansi_bujk || "PT Bangun Jaya Konstruksi"}</strong>
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
                href="#riwayat"
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
                <Clock style={{ width: "14px", height: "14px" }} />
                <span>Riwayat Pelatihan Terkini ({riwayatList.length})</span>
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
              Sertifikat: {latestCertificateNo}
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
      </section>

      {/* 2. TABEL RIWAYAT PELATIHAN (DEFAULT ORDER: TERBARU DI ATAS) */}
      <section id="riwayat" style={{ scrollMarginTop: "120px" }}>
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", border: "1px solid #E2E8F0", padding: "26px 30px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px", marginBottom: "20px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
                  Riwayat Portofolio Pelatihan & Sertifikasi TKK
                </h2>
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#1E40AF", backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", padding: "3px 8px", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Sparkles style={{ width: "12px", height: "12px" }} /> Default: Pelatihan Terakhir (DESC)
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0 0" }}>
                Rekam jejak kepesertaan bimbingan teknis, vokasi, dan sertifikasi TKK terdaftar di bawah NIK <strong>{peserta?.nik}</strong>
              </p>
            </div>

            {/* Filter & Search Bar */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <div style={{ position: "relative" }}>
                <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "#94A3B8" }} />
                <input
                  type="text"
                  placeholder="Cari kegiatan/sertifikat..."
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
                <option value="2022">TA 2022</option>
              </select>

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
                <option value="Semua">Semua Asesmen</option>
                <option value="KOMPETEN">KOMPETEN</option>
                <option value="DALAM PROSES">DALAM PROSES</option>
              </select>

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
                  <option value="terbaru">Pelatihan Terakhir (Default)</option>
                  <option value="terlama">Pelatihan Terlama</option>
                  <option value="nilai">Nilai Tertinggi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabel Riwayat */}
          <div style={{ border: "1px solid #E2E8F0", borderRadius: "14px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#64748B", fontWeight: 800 }}>
                  <th style={{ padding: "12px 14px", width: "40px", textAlign: "center" }}>NO</th>
                  <th style={{ padding: "12px 16px" }}>Kegiatan Pelatihan</th>
                  <th style={{ padding: "12px 14px" }}>Tahun / Kategori</th>
                  <th style={{ padding: "12px 16px" }}>Jabatan Kerja / Penyelenggara</th>
                  <th style={{ padding: "12px 14px", textAlign: "center" }}>Jam (JP)</th>
                  <th style={{ padding: "12px 16px", textAlign: "center" }}>Hasil Asesmen</th>
                  <th style={{ padding: "12px 16px" }}>No. Sertifikat Otomatis</th>
                  <th style={{ padding: "12px 14px", textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredRiwayat.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "#94A3B8" }}>
                      Tidak ada riwayat pelatihan yang sesuai dengan kriteria penyaringan.
                    </td>
                  </tr>
                ) : (
                  filteredRiwayat.map((r, idx) => {
                    const isLatest = idx === 0 && sortBy === "terbaru";
                    return (
                      <tr 
                        key={r.id} 
                        style={{ 
                          borderBottom: "1px solid #F1F5F9",
                          backgroundColor: isLatest ? "#F8FAFC" : "transparent"
                        }}
                      >
                        <td style={{ padding: "14px 14px", textAlign: "center", fontWeight: 700, color: "#64748B" }}>
                          {idx + 1}
                        </td>

                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                            <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#0F2E5C", fontWeight: 800 }}>
                              {r.id}
                            </span>
                            {isLatest && (
                              <span style={{ fontSize: "9px", fontWeight: 800, color: "#1E40AF", backgroundColor: "#DBEAFE", padding: "1px 6px", borderRadius: "4px" }}>
                                Pelatihan Terakhir
                              </span>
                            )}
                          </div>
                          <span style={{ fontWeight: 800, color: "#0F172A", display: "block", fontSize: "13px" }}>
                            {r.nama_kegiatan}
                          </span>
                          <span style={{ fontSize: "11px", color: "#64748B" }}>
                            Pelaksanaan: {formatDate(r.tanggal_mulai)} s/d {formatDate(r.tanggal_selesai)}
                          </span>
                        </td>

                        <td style={{ padding: "14px 14px" }}>
                          <span style={{ fontWeight: 800, color: "#0F2E5C", display: "block" }}>
                            TA {r.tahun_pelatihan}
                          </span>
                          <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748B", backgroundColor: "#F1F5F9", padding: "2px 6px", borderRadius: "4px" }}>
                            {r.kategori_pelatihan}
                          </span>
                        </td>

                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontWeight: 800, color: "#0F172A", display: "block" }}>
                            {r.jabatan_kerja}
                          </span>
                          <span style={{ fontSize: "11px", color: "#64748B" }}>
                            {r.penyelenggara}
                          </span>
                        </td>

                        <td style={{ padding: "14px 14px", textAlign: "center" }}>
                          <span style={{ fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "4px 8px", borderRadius: "6px" }}>
                            {r.kehadiran_jp} / {r.jam_pelajaran} JP
                          </span>
                        </td>

                        <td style={{ padding: "14px 16px", textAlign: "center" }}>
                          <span 
                            style={{ 
                              fontSize: "10px", 
                              fontWeight: 800, 
                              color: "#059669", 
                              backgroundColor: "#ECFDF5", 
                              padding: "3px 10px", 
                              borderRadius: "9999px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <Check style={{ width: "12px", height: "12px" }} /> {r.hasil_asesmen} ({r.nilai_akhir})
                          </span>
                        </td>

                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: 800, color: "#0F2E5C", display: "block" }}>
                            {r.nomor_sertifikat}
                          </span>
                          <span style={{ fontSize: "10px", color: "#059669", fontWeight: 700 }}>
                            Kode Unik Sistem
                          </span>
                        </td>

                        <td style={{ padding: "14px 14px", textAlign: "center" }}>
                          <a
                            href="#sertifikat"
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "#0F2E5C",
                              backgroundColor: "#F1F5F9",
                              padding: "6px 12px",
                              borderRadius: "8px",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <Eye style={{ width: "13px", height: "13px" }} /> Lihat
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. E-SERTIFIKAT SKK DIGITAL OTOMATIS (SERTIFIKAT) */}
      <section id="sertifikat" style={{ scrollMarginTop: "120px" }}>
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", border: "1px solid #E2E8F0", padding: "26px 30px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#0284C7", backgroundColor: "#E0F2FE", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Award style={{ width: "12px", height: "12px" }} /> Diterbitkan Otomatis Oleh Sistem (Auto-Generated)
              </span>
              <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0F172A", margin: "6px 0 0 0" }}>
                Sertifikat Kompetensi Kerja (SKK) Digital Kabupaten Bogor
              </h2>
              <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
                Format Kode Unik Baku: <strong>[Tahun Pelatihan] / [Kategori Pelatihan] / [No Peserta Terdaftar]</strong>
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

          {/* Kartu Sertifikat Resmi dengan Bingkai Elegan */}
          <div
            style={{
              borderRadius: "18px",
              border: "3px double #FFC000",
              background: "linear-gradient(to right, #F8FAFC, #FFFFFF)",
              padding: "28px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              alignItems: "center",
              boxShadow: "0 4px 14px rgba(0,0,0,0.03)"
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#0369A1", textTransform: "uppercase" }}>
                  Kode Unik Sertifikat Sistem:
                </span>
                <span style={{ fontSize: "9px", fontWeight: 800, color: "#059669", backgroundColor: "#ECFDF5", padding: "1px 6px", borderRadius: "4px" }}>
                  Terbit Otomatis
                </span>
              </div>
              
              <span style={{ fontSize: "24px", fontWeight: 900, fontFamily: "monospace", color: "#0F2E5C", letterSpacing: "1px" }}>
                {latestCertificateNo}
              </span>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "#64748B", display: "block" }}>Nama Pemegang:</span>
                  <span style={{ fontWeight: 800, color: "#1E293B" }}>{peserta?.nama_lengkap}</span>
                </div>
                <div>
                  <span style={{ color: "#64748B", display: "block" }}>Nomor Induk Kependudukan (NIK):</span>
                  <span style={{ fontWeight: 800, color: "#1E293B", fontFamily: "monospace" }}>{peserta?.nik}</span>
                </div>
                <div>
                  <span style={{ color: "#64748B", display: "block" }}>Jabatan Kerja / Kualifikasi:</span>
                  <span style={{ fontWeight: 800, color: "#0369A1" }}>{latestRiwayat?.jabatan_kerja || "Pelaksana Lapangan Gedung"} ({latestRiwayat?.jenjang_kualifikasi || "Jenjang 4"})</span>
                </div>
                <div>
                  <span style={{ color: "#64748B", display: "block" }}>Masa Berlaku:</span>
                  <span style={{ fontWeight: 800, color: "#059669" }}>5 Tahun (s/d Agustus 2031)</span>
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
                  QR Code Validasi SIJAKON PUPR
                </span>
                <p style={{ fontSize: "11px", color: "#475569", margin: "8px 0 0 0", lineHeight: 1.5 }}>
                  Pindai QR ini untuk memverifikasi keabsahan sertifikat secara langsung di database SIPJAKI & LPJK Nasional.
                </p>
                <span style={{ fontSize: "10px", color: "#64748B", fontFamily: "monospace", display: "block", marginTop: "4px" }}>
                  Token: {latestRiwayat?.qr_code_token || "SIJAKON-VERIF-FAUZI"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* MODAL 1: WAJIB GANTI PASSWORD (SKEMA INTERNAL FIRST LOGIN)           */}
      {/* ===================================================================== */}
      {showPasswordModal && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
          }}
        >
          <div 
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "28px 32px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              border: "1px solid #E2E8F0"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#FEF3C7", color: "#B45309", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <KeyRound style={{ width: "22px", height: "22px" }} />
              </div>
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                  Wajib Ubah Kata Sandi (First Login)
                </h3>
                <span style={{ fontSize: "12px", color: "#64748B" }}>
                  Kredensial Akun Pendaftaran Internal (Batch Dinas)
                </span>
              </div>
            </div>

            <div style={{ padding: "12px 14px", borderRadius: "10px", backgroundColor: "#F0F9FF", border: "1px solid #BAE6FD", color: "#0369A1", fontSize: "12px", lineHeight: 1.5, marginBottom: "16px" }}>
              Selamat datang, <strong>{peserta?.nama_lengkap}</strong>! Akun Anda didaftarkan secara kolektif oleh admin. Demi keamanan data kepesertaan, Anda diwajibkan mengubah kata sandi default sebelum dapat mengakses portal.
            </div>

            {passwordSuccess && (
              <div style={{ padding: "10px 14px", borderRadius: "10px", backgroundColor: "#ECFDF5", border: "1px solid #A7F3D0", color: "#065F46", fontSize: "12px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 style={{ width: "16px", height: "16px" }} /> Kata sandi berhasil diperbarui! Membuka portal...
              </div>
            )}

            {passwordError && (
              <div style={{ padding: "10px 14px", borderRadius: "10px", backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", color: "#991B1B", fontSize: "12px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                <AlertTriangle style={{ width: "16px", height: "16px" }} /> {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Kata Sandi Default (Dari Email Dinas)
                </label>
                <input
                  type="text"
                  disabled
                  value={defaultPasswordInput}
                  style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid #CBD5E1", backgroundColor: "#F8FAFC", padding: "0 12px", fontSize: "13px", fontFamily: "monospace", color: "#64748B" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Kata Sandi Baru * (Min. 8 Karakter)
                </label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan kata sandi baru Anda"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Konfirmasi Kata Sandi Baru *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ketik ulang kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#0F2E5C",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(15, 46, 92, 0.2)"
                  }}
                >
                  Simpan Sandi & Lanjutkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: PENDAFTARAN MANDIRI PESERTA (SKEMA EKSTERNAL)               */}
      {/* ===================================================================== */}
      {showRegisterModal && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
            overflowY: "auto"
          }}
        >
          <div 
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "28px 32px",
              maxWidth: "680px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              border: "1px solid #E2E8F0"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", backgroundColor: "#ECFDF5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <UserPlus style={{ width: "20px", height: "20px" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                    Pendaftaran Mandiri TKK (Skema Eksternal)
                  </h3>
                  <span style={{ fontSize: "12px", color: "#64748B" }}>
                    Registrasi langsung tenaga kerja konstruksi ke database SIJAKON Kab. Bogor
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowRegisterModal(false)}
                style={{ border: "none", background: "none", fontSize: "18px", color: "#94A3B8", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {registerSuccess && (
              <div style={{ padding: "12px 16px", borderRadius: "10px", backgroundColor: "#ECFDF5", border: "1px solid #A7F3D0", color: "#065F46", fontSize: "13px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 style={{ width: "18px", height: "18px" }} /> Pendaftaran mandiri berhasil disimpan! Mengalihkan ke profil...
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Nama Lengkap Sesuai KTP *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Prasetyo"
                  value={regForm.nama_lengkap}
                  onChange={(e) => setRegForm({ ...regForm, nama_lengkap: e.target.value })}
                  style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "13px" }}
                />
              </div>

              {/* NIK Input with Validation */}
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Nomor Induk Kependudukan (NIK) * <span style={{ fontSize: "11px", fontWeight: 600, color: "#0F2E5C" }}>(Primary Key 16 Digit)</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="16 digit NIK KTP (Contoh: 3201032104930003)"
                  value={regForm.nik}
                  onChange={(e) => handleNikInputChange(e.target.value)}
                  style={{ 
                    width: "100%", 
                    height: "40px", 
                    borderRadius: "8px", 
                    border: nikWarning ? "2px solid #EF4444" : "1px solid #CBD5E1", 
                    padding: "0 12px", 
                    fontSize: "13px",
                    fontFamily: "monospace",
                    backgroundColor: nikWarning ? "#FEF2F2" : "#FFFFFF"
                  }}
                />
                {nikWarning ? (
                  <div style={{ marginTop: "4px", padding: "6px 10px", borderRadius: "6px", backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", color: "#991B1B", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                    <AlertTriangle style={{ width: "14px", height: "14px", flexShrink: 0 }} />
                    <span>{nikWarning}</span>
                  </div>
                ) : regForm.nik.length === 16 ? (
                  <span style={{ fontSize: "11px", color: "#059669", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                    <CheckCircle2 style={{ width: "12px", height: "12px" }} /> Format NIK 16 digit valid dan belum terdaftar.
                  </span>
                ) : (
                  <span style={{ fontSize: "11px", color: "#94A3B8", display: "block", marginTop: "4px" }}>
                    NIK bersifat tunggal dan permanen untuk satu akun kepesertaan TKK.
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Pendidikan Terakhir *
                </label>
                <select
                  value={regForm.pendidikan_terakhir}
                  onChange={(e) => setRegForm({ ...regForm, pendidikan_terakhir: e.target.value })}
                  style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "13px" }}
                >
                  <option value="SD">SD Sederajat</option>
                  <option value="SMP">SMP Sederajat</option>
                  <option value="SMA/SMK">SMA / SMK Bangunan</option>
                  <option value="D3">Diploma 3 (D3) Teknik Sipil</option>
                  <option value="D4/S1">Sarjana (S1 / D4) Teknik Sipil / Arsitektur</option>
                  <option value="S2">Magister (S2)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Kategori Pelatihan Diminati *
                </label>
                <select
                  value={regForm.kategori_diminati}
                  onChange={(e) => setRegForm({ ...regForm, kategori_diminati: e.target.value })}
                  style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "13px" }}
                >
                  <option value="PEL-GEDUNG">Pelaksana Lapangan Gedung (Jenjang 4)</option>
                  <option value="PEL-JALAN">Pelaksana Lapangan Jalan (Jenjang 4)</option>
                  <option value="K3-SMKK">Petugas K3 Konstruksi & SMKK (Jenjang 3-5)</option>
                  <option value="PEL-BETON">Tukang Pasang Beton Terampil (Jenjang 3)</option>
                  <option value="PEL-BATA">Tukang Pasang Bata / Plesteran (Jenjang 1-2)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Nomor HP / WhatsApp Aktif *
                </label>
                <input
                  type="text"
                  required
                  placeholder="08xxxxxxxxxx"
                  value={regForm.telepon}
                  onChange={(e) => setRegForm({ ...regForm, telepon: e.target.value })}
                  style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Alamat Email Aktif *
                </label>
                <input
                  type="email"
                  required
                  placeholder="alamat@email.com"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "13px" }}
                />
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Riwayat Pekerjaan / Pengalaman Proyek Lapangan *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: Mandor Pembesian Proyek Flyover (2023-2025), Tukang Pasang Bata Proyek Puskesmas (2022)"
                  value={regForm.riwayat_pekerjaan}
                  onChange={(e) => setRegForm({ ...regForm, riwayat_pekerjaan: e.target.value })}
                  style={{ width: "100%", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "8px 12px", fontSize: "13px", resize: "none" }}
                />
              </div>

              {/* Dokumen Persyaratan Wajib (Skema Eksternal untuk Penerbitan ID TKK) */}
              <div style={{ gridColumn: "span 2", padding: "14px", borderRadius: "10px", backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                <span style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#166534", marginBottom: "8px" }}>
                  Upload Dokumen Persyaratan Wajib (Untuk Penerbitan ID TKK Resmi):
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#166534", marginBottom: "4px" }}>
                      1. Scan KTP (PDF/JPG) *
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.ktp_url}
                      onChange={(e) => setRegForm({ ...regForm, ktp_url: e.target.value })}
                      placeholder="KTP_Peserta.pdf"
                      style={{ width: "100%", height: "36px", borderRadius: "6px", border: "1px solid #86EFAC", padding: "0 8px", fontSize: "11px", backgroundColor: "#FFFFFF" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#166534", marginBottom: "4px" }}>
                      2. Ijazah / SK Kerja *
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.ijazah_url}
                      onChange={(e) => setRegForm({ ...regForm, ijazah_url: e.target.value })}
                      placeholder="Ijazah_Peserta.pdf"
                      style={{ width: "100%", height: "36px", borderRadius: "6px", border: "1px solid #86EFAC", padding: "0 8px", fontSize: "11px", backgroundColor: "#FFFFFF" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#166534", marginBottom: "4px" }}>
                      3. Pas Foto 3x4 *
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.foto_url}
                      onChange={(e) => setRegForm({ ...regForm, foto_url: e.target.value })}
                      placeholder="Foto_3x4.jpg"
                      style={{ width: "100%", height: "36px", borderRadius: "6px", border: "1px solid #86EFAC", padding: "0 8px", fontSize: "11px", backgroundColor: "#FFFFFF" }}
                    />
                  </div>
                </div>
              </div>

              {/* Isian Opsional Sertifikasi LPJK Lama */}
              <div style={{ gridColumn: "span 2", padding: "14px", borderRadius: "10px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 800, color: "#0F2E5C", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={regForm.memiliki_sertifikat_lpjk}
                    onChange={(e) => setRegForm({ ...regForm, memiliki_sertifikat_lpjk: e.target.checked })}
                    style={{ width: "16px", height: "16px" }}
                  />
                  <span>Apakah Anda sudah memiliki Sertifikat SKA/SKT/SKK LPJK sebelumnya? (Opsional)</span>
                </label>

                {regForm.memiliki_sertifikat_lpjk && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                        Nomor Registrasi LPJK * (Wajib Diinputkan)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: REG-2022-TKK-99120"
                        value={regForm.nomor_registrasi_lpjk}
                        onChange={(e) => setRegForm({ ...regForm, nomor_registrasi_lpjk: e.target.value })}
                        style={{ width: "100%", height: "38px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px", fontFamily: "monospace" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                        Upload Scan Sertifikat LPJK (PDF/JPG)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        style={{ width: "100%", height: "38px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "4px 8px", fontSize: "11px" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "#475569",
                    border: "1px solid #CBD5E1",
                    padding: "10px 18px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isRegistering}
                  style={{
                    backgroundColor: "#059669",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "10px 22px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: isRegistering ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 6px rgba(5, 150, 105, 0.2)"
                  }}
                >
                  {isRegistering ? "Memproses Registrasi..." : "Kirim Pendaftaran Mandiri"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

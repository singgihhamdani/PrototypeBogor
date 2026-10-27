"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, DEMO_USERS, RoleCode, ROLE_CONFIGS } from "@/lib/mock-auth";
import { 
  Eye, EyeOff, ShieldCheck, Building2, 
  ArrowRight, Key, Mail, Lock, Sparkles, UserCheck, Crown, ClipboardCheck,
  ArrowLeft, Home, ShieldAlert, ChevronDown, HardHat, GraduationCap
} from "lucide-react";
import Logo, { BrandIcon } from "@/components/ui/logo";
import { useResponsive } from "@/lib/use-responsive";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@sijakon.bogor.go.id");
  const [password, setPassword] = useState("demo2026");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDemoUser, setSelectedDemoUser] = useState("superadmin");
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  const currentDemoUser = DEMO_USERS[selectedDemoUser];
  const currentRoleConfig = currentDemoUser ? ROLE_CONFIGS[currentDemoUser.role] : null;

  // Fitur Lupa Kata Sandi
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { login, isSupabase, resetPassword } = useAuth();
  const router = useRouter();
  const { isMobile, isMounted } = useResponsive();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      if (redirect) {
        setRedirectPath(redirect);
      }
    }
  }, []);

  const getPageTitleFromPath = (path: string) => {
    if (path.includes("/regulasi")) return "Regulasi & Dasar Hukum";
    if (path.includes("/profil-opd")) return "Profil 40 OPD";
    if (path.includes("/pelaporan")) return "Pelaporan SIPJAKI PUPR";
    if (path.includes("/kecelakaan")) return "Pencatatan K3 Konstruksi";
    if (path.includes("/webgis")) return "WebGIS Geospasial";
    if (path.includes("/pengawasan")) return "Audit Pengawasan SIMAK";
    if (path.includes("/pelatihan")) return "Pelatihan & Sertifikasi SKK";
    if (path.includes("/bujk")) return "Direktori BUJK";
    if (path.includes("/paket-pekerjaan")) return "Paket Pekerjaan Konstruksi";
    if (path.includes("/dashboard")) return "Dashboard Analitik";
    return "Halaman Tujuan";
  };

  const handleSelectDemo = (usernameKey: string) => {
    setSelectedDemoUser(usernameKey);
    const demo = DEMO_USERS[usernameKey];
    if (demo) {
      setEmail(demo.email);
      setPassword("demo2026");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 450));
    
    const result = await login(email, password);
    if (result.success) {
      const destination = redirectPath || result.targetRoute;
      router.push(destination);
    } else {
      setError(result.error || "Kombinasi email atau kata sandi tidak valid.");
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetLoading(true);
    setResetMessage(null);
    const res = await resetPassword(resetEmail);
    setResetLoading(false);
    setResetMessage({
      type: res.success ? "success" : "error",
      text: res.message,
    });
  };

  return (
    <div 
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#F1F5F9",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
      }}
    >
      {/* Top Header Bar PUPR Standard */}
      <header 
        style={{
          width: "100%",
          backgroundColor: "#0F2E5C",
          borderBottom: "4px solid #FFC000",
          padding: isMounted && isMobile ? "10px 14px" : "12px 24px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        }}
      >
        <div 
          style={{
            maxWidth: "1140px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px"
          }}
        >
          {/* Clickable Brand Logo to Homepage */}
          <Link 
            href="/"
            title="Klik untuk kembali ke Beranda Utama SIJAKON"
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "10px", 
              textDecoration: "none",
              cursor: "pointer",
              transition: "transform 0.2s ease" 
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.01)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <BrandIcon size={isMounted && isMobile ? 32 : 38} bgBadge />

            <div style={{ display: "flex", flexDirection: "column" }}>
              <span 
                style={{
                  fontSize: isMounted && isMobile ? "11px" : "13px",
                  fontWeight: 900,
                  color: "#FFC000",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  lineHeight: 1.2
                }}
              >
                DINAS PEKERJAAN UMUM
              </span>
              {(!isMounted || !isMobile) && (
                <span 
                  style={{
                    fontSize: "11px",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: 500,
                    lineHeight: 1.2
                  }}
                >
                  Pemerintah Kabupaten Bogor • Terintegrasi SIPJAKI Kementerian PUPR
                </span>
              )}
            </div>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Shortcut: Kembali ke Beranda */}
            <Link
              href="/"
              title="Kembali ke Beranda Utama"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 700,
                color: "#FFFFFF",
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                padding: "6px 12px",
                borderRadius: "9999px",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                textDecoration: "none",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.25)";
                e.currentTarget.style.borderColor = "#FFC000";
                e.currentTarget.style.color = "#FFC000";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.12)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
                e.currentTarget.style.color = "#FFFFFF";
              }}
            >
              <Home style={{ width: "13px", height: "13px" }} />
              <span>Beranda</span>
            </Link>

            {(!isMounted || !isMobile) && (
              <>
                <Link
                  href="/portal/login"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#FFC000",
                    backgroundColor: "rgba(255, 192, 0, 0.12)",
                    padding: "6px 12px",
                    borderRadius: "9999px",
                    border: "1px solid rgba(255, 192, 0, 0.3)",
                    textDecoration: "none"
                  }}
                >
                  <span>Portal Mitra (BUJK/TKK)</span>
                  <ArrowRight style={{ width: "12px", height: "12px" }} />
                </Link>

                <div 
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#FFFFFF",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    padding: "6px 14px",
                    borderRadius: "9999px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    flexShrink: 0
                  }}
                >
                  <ShieldCheck style={{ width: "16px", height: "16px", color: "#FFC000" }} />
                  <span>Portal Dinas Internal</span>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Login Card Section */}
      <main 
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: isMounted && isMobile ? "16px 12px" : "24px 16px"
        }}
      >
        {/* Navigation Breadcrumb / Top Bar Affordance */}
        <div 
          style={{
            maxWidth: "960px",
            width: "100%",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              color: "#1E293B",
              fontSize: "12px",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F8FAFC";
              e.currentTarget.style.borderColor = "#CBD5E1";
              e.currentTarget.style.color = "#0F2E5C";
              e.currentTarget.style.transform = "translateX(-3px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FFFFFF";
              e.currentTarget.style.borderColor = "#E2E8F0";
              e.currentTarget.style.color = "#1E293B";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <ArrowLeft style={{ width: "15px", height: "15px", color: "#0F2E5C" }} />
            <span>Kembali ke Beranda Utama</span>
          </Link>

          {(!isMounted || !isMobile) && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "#64748B", fontWeight: 600 }}>
              <span>Portal Resmi SIJAKON</span>
              <span>•</span>
              <span>Pemerintah Kabupaten Bogor</span>
            </div>
          )}
        </div>

        <div 
          style={{
            maxWidth: "960px",
            width: "100%",
            display: "grid",
            gridTemplateColumns: isMounted && isMobile ? "1fr" : "repeat(auto-fit, minmax(360px, 1fr))",
            borderRadius: isMounted && isMobile ? "16px" : "24px",
            backgroundColor: "#FFFFFF",
            boxShadow: "0 25px 50px -12px rgba(15, 46, 92, 0.25)",
            border: "1px solid #E2E8F0",
            overflow: "hidden"
          }}
        >
          {/* Left Hero Banner */}
          <div 
            style={{
              background: "linear-gradient(135deg, #07182E 0%, #0F2E5C 50%, #163B75 100%)",
              padding: isMounted && isMobile ? "24px 18px" : "36px",
              color: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minWidth: 0,
              overflow: "hidden",
              position: "relative"
            }}
          >
            {/* Background Pattern */}
            <div 
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.08,
                backgroundImage: "radial-gradient(#FFC000 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                pointerEvents: "none"
              }}
            />

            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Badges */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <div 
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    padding: "4px 12px",
                    borderRadius: "9999px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#FFC000",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <Sparkles style={{ width: "12px", height: "12px" }} />
                  <span>Multi-Role RBAC</span>
                </div>

                <div 
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: isSupabase ? "rgba(34, 197, 94, 0.15)" : "rgba(255,255,255,0.08)",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: isSupabase ? "#4ADE80" : "#CBD5E1",
                    border: isSupabase ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(255,255,255,0.12)",
                  }}
                  title={isSupabase ? "Terhubung ke Basis Data PostgreSQL & Auth" : "Mode Simulasi Demo Tanpa Cloud"}
                >
                  <span 
                    style={{ 
                      width: "6px", 
                      height: "6px", 
                      borderRadius: "50%", 
                      backgroundColor: isSupabase ? "#22C55E" : "#94A3B8" 
                    }} 
                  />
                  <span>{isSupabase ? "PostgreSQL (Live)" : "Demo Mode DB"}</span>
                </div>
              </div>

              {/* Title with Logo */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Logo size={48} theme="dark" subtitle="DPU KABUPATEN BOGOR" />
                <div style={{ height: "4px", width: "48px", backgroundColor: "#FFC000", borderRadius: "9999px" }} />
                <p 
                  style={{
                    fontSize: "12px",
                    color: "#CBD5E1",
                    lineHeight: 1.6,
                    margin: 0
                  }}
                >
                  Sistem Informasi Pembinaan, Pengawasan SIMAK, dan Sinkronisasi 5 Pilar Jasa Konstruksi Kabupaten Bogor dengan SIPJAKI Nasional.
                </p>
              </div>

              {/* Role Highlights (5 Role Utama SIJAKON) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", margin: 0, letterSpacing: "0.5px" }}>
                  5 Pilar Role Pengguna SIJAKON:
                </p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {/* 1. Super Admin */}
                  <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Crown style={{ width: "14px", height: "14px", color: "#FFC000", flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: 800, color: "#FFFFFF" }}>1. Super Admin</span>
                        <p style={{ fontSize: "10px", color: "#94A3B8", margin: 0 }}>Full RBAC, master data & konfigurasi</p>
                      </div>
                    </div>
                    <span style={{ fontSize: "9px", fontWeight: 700, color: "#FFC000", backgroundColor: "rgba(255,192,0,0.15)", padding: "2px 6px", borderRadius: "4px" }}>PUPR</span>
                  </div>

                  {/* 2. Admin Bidang & Asesor */}
                  <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Building2 style={{ width: "14px", height: "14px", color: "#60A5FA", flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: 800, color: "#FFFFFF" }}>2. Admin Bidang & Pengawas</span>
                        <p style={{ fontSize: "10px", color: "#94A3B8", margin: 0 }}>Bina Konstruksi, Asesor & Pengawas SIMAK</p>
                      </div>
                    </div>
                    <span style={{ fontSize: "9px", fontWeight: 700, color: "#93C5FD", backgroundColor: "rgba(59,130,246,0.15)", padding: "2px 6px", borderRadius: "4px" }}>Dinas</span>
                  </div>

                  {/* 3. Eksekutif */}
                  <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ShieldCheck style={{ width: "14px", height: "14px", color: "#34D399", flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: 800, color: "#FFFFFF" }}>3. Eksekutif</span>
                        <p style={{ fontSize: "10px", color: "#94A3B8", margin: 0 }}>Dashboard makro & laporan resmi Kadis</p>
                      </div>
                    </div>
                    <span style={{ fontSize: "9px", fontWeight: 700, color: "#6EE7B7", backgroundColor: "rgba(16,185,129,0.15)", padding: "2px 6px", borderRadius: "4px" }}>Pimpinan</span>
                  </div>

                  {/* 4. Penyedia Jasa BUJK */}
                  <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <HardHat style={{ width: "14px", height: "14px", color: "#FBBF24", flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: 800, color: "#FFFFFF" }}>4. Penyedia Jasa (BUJK)</span>
                        <p style={{ fontSize: "10px", color: "#94A3B8", margin: 0 }}>Kontraktor rekanan: profil SBU, paket & SIMAK</p>
                      </div>
                    </div>
                    <span style={{ fontSize: "9px", fontWeight: 700, color: "#FCD34D", backgroundColor: "rgba(245,158,11,0.15)", padding: "2px 6px", borderRadius: "4px" }}>Rekanan</span>
                  </div>

                  {/* 5. Peserta TKK */}
                  <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <GraduationCap style={{ width: "14px", height: "14px", color: "#C084FC", flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: 800, color: "#FFFFFF" }}>5. Peserta TKK</span>
                        <p style={{ fontSize: "10px", color: "#94A3B8", margin: 0 }}>Tenaga kerja konstruksi: uji SKK & sertifikat</p>
                      </div>
                    </div>
                    <span style={{ fontSize: "9px", fontWeight: 700, color: "#D8B4FE", backgroundColor: "rgba(168,85,247,0.15)", padding: "2px 6px", borderRadius: "4px" }}>Tenaga Kerja</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Slogan */}
            <div 
              style={{
                position: "relative",
                zIndex: 1,
                paddingTop: "16px",
                marginTop: "20px",
                borderTop: "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "rgba(255,255,255,0.7)"
              }}
            >
              <span style={{ fontWeight: 800, letterSpacing: "0.5px", color: "#FFC000" }}>SIGAP MEMBANGUN NEGERI</span>
              <span style={{ fontFamily: "monospace", fontSize: "10px" }}>v1.1 RBAC</span>
            </div>
          </div>

          {/* Right Form Area */}
          <div 
            style={{
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minWidth: 0,
              backgroundColor: "#FFFFFF"
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              
              <div>
                <span 
                  style={{
                    display: "inline-block",
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "#0F2E5C",
                    backgroundColor: "#EBF2FA",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "6px"
                  }}
                >
                  Portal Masuk Terpadu
                </span>
                <h3 
                  style={{
                    fontSize: "20px",
                    fontWeight: 900,
                    color: "#0F172A",
                    letterSpacing: "-0.5px",
                    margin: 0
                  }}
                >
                  Masuk ke Sistem SIJAKON
                </h3>
                <p 
                  style={{
                    fontSize: "12px",
                    color: "#64748B",
                    margin: "2px 0 0 0"
                  }}
                >
                  Akses terpadu 5 Role: Petugas Dinas, Rekanan BUJK, dan Peserta TKK
                </p>
              </div>

              {/* Target Redirect Notice */}
              {redirectPath && (
                <div 
                  style={{
                    backgroundColor: "#EFF6FF",
                    border: "1px solid #BFDBFE",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    color: "#1E40AF"
                  }}
                >
                  <ShieldAlert style={{ width: "20px", height: "20px", color: "#2563EB", flexShrink: 0 }} />
                  <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
                    <strong style={{ color: "#1E3A8A" }}>Akses Terbatas:</strong> Silakan masuk ke akun Anda terlebih dahulu untuk mengakses menu{" "}
                    <strong style={{ color: "#0F2E5C", textDecoration: "underline" }}>{getPageTitleFromPath(redirectPath)}</strong>.
                  </div>
                </div>
              )}

              {/* Clean Demo Account Dropdown Selector */}
              <div 
                style={{
                  borderRadius: "14px",
                  border: "1.5px solid #CBD5E1",
                  backgroundColor: "#F8FAFC",
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 800, color: "#0F2E5C" }}>
                    <Sparkles style={{ width: "14px", height: "14px", color: "#F59E0B" }} />
                    <span>Pilih Akun Demo (5 Role SIJAKON):</span>
                  </div>
                  <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 600 }}>
                    1-Klik Langsung Isi
                  </span>
                </div>

                {/* Dropdown Select Element */}
                <div style={{ position: "relative" }}>
                  <select
                    id="demo-account-select"
                    value={selectedDemoUser}
                    onChange={(e) => handleSelectDemo(e.target.value)}
                    style={{
                      width: "100%",
                      height: "42px",
                      borderRadius: "10px",
                      border: "1.5px solid #0F2E5C",
                      backgroundColor: "#FFFFFF",
                      padding: "0 38px 0 12px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#0F2E5C",
                      cursor: "pointer",
                      outline: "none",
                      appearance: "none",
                      boxShadow: "0 2px 4px rgba(15, 46, 92, 0.06)"
                    }}
                  >
                    <optgroup label="── 1. SUPER ADMIN ──">
                      <option value="superadmin">👑 Super Admin — Ir. H. Raden Ridwan, ST (Akses Penuh Sistem)</option>
                    </optgroup>
                    <optgroup label="── 2. ADMIN BIDANG & PENGAWAS ──">
                      <option value="op_binkon">🏢 Admin Bidang — Bayu Pratama, S.Kom (Seksi Bina Konstruksi)</option>
                      <option value="op_pengawas">📋 Tim Pengawas — Ir. Supriyatna, ST (Asesor & Pengawas SIMAK)</option>
                    </optgroup>
                    <optgroup label="── 3. EKSEKUTIF PIMPINAN ──">
                      <option value="eksekutif">🛡️ Eksekutif — Drs. H. Suryanto Putra, M.Si (Kepala Dinas PUPR)</option>
                    </optgroup>
                    <optgroup label="── 4. PENYEDIA JASA (BUJK) ──">
                      <option value="bujk_demo">🏗️ Penyedia Jasa (BUJK) — Budi Santoso, ST (PT Bangun Jaya Konstruksi)</option>
                    </optgroup>
                    <optgroup label="── 5. PESERTA PELATIHAN TKK ──">
                      <option value="peserta_demo">🎓 Peserta TKK — Ahmad Fauzi, A.Md (Pelaksana Lapangan Gedung)</option>
                    </optgroup>
                  </select>
                  <ChevronDown 
                    style={{ 
                      position: "absolute", 
                      right: "12px", 
                      top: "50%", 
                      transform: "translateY(-50%)", 
                      width: "18px", 
                      height: "18px", 
                      color: "#0F2E5C", 
                      pointerEvents: "none" 
                    }} 
                  />
                </div>

                {/* Active Demo Profile Detail Pill */}
                {currentDemoUser && (
                  <div 
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      padding: "6px 10px",
                      borderRadius: "8px",
                      fontSize: "11px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0, overflow: "hidden" }}>
                      <span 
                        style={{
                          backgroundColor: currentRoleConfig?.badgeBg || "#0F2E5C",
                          color: currentRoleConfig?.badgeText || "#FFFFFF",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          fontWeight: 800,
                          fontSize: "9px",
                          textTransform: "uppercase",
                          flexShrink: 0
                        }}
                      >
                        {currentDemoUser.roleLabel}
                      </span>
                      <span style={{ color: "#334155", fontWeight: 700, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {currentDemoUser.name}
                      </span>
                    </div>
                    <span 
                      style={{ 
                        fontSize: "10px", 
                        color: "#2563EB", 
                        fontWeight: 700, 
                        flexShrink: 0, 
                        fontFamily: "monospace",
                        backgroundColor: "#EFF6FF",
                        padding: "2px 6px",
                        borderRadius: "4px"
                      }}
                    >
                      ➔ {currentRoleConfig?.defaultRoute || "/dashboard"}
                    </span>
                  </div>
                )}
              </div>

              {/* Form Inputs */}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Email / Nama Pengguna
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94A3B8" }} />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@sijakon.bogor.go.id"
                      required
                      style={{
                        width: "100%",
                        height: "40px",
                        borderRadius: "10px",
                        border: "1px solid #CBD5E1",
                        backgroundColor: "#F8FAFC",
                        paddingLeft: "38px",
                        paddingRight: "12px",
                        fontSize: "12px",
                        color: "#0F172A",
                        outline: "none"
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Kata Sandi
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordOpen(!forgotPasswordOpen);
                        if (!resetEmail && email) setResetEmail(email);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "11px",
                        color: "#0F2E5C",
                        fontWeight: 700,
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: 0,
                      }}
                    >
                      {forgotPasswordOpen ? "Tutup Bantuan Sandi" : "Lupa Kata Sandi?"}
                    </button>
                  </div>
                  <div style={{ position: "relative" }}>
                    <Lock style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94A3B8" }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{
                        width: "100%",
                        height: "40px",
                        borderRadius: "10px",
                        border: "1px solid #CBD5E1",
                        backgroundColor: "#F8FAFC",
                        paddingLeft: "38px",
                        paddingRight: "40px",
                        fontSize: "12px",
                        color: "#0F172A",
                        outline: "none"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#94A3B8"
                      }}
                    >
                      {showPassword ? <EyeOff style={{ width: "16px", height: "16px" }} /> : <Eye style={{ width: "16px", height: "16px" }} />}
                    </button>
                  </div>
                </div>

                {/* Expandable Forgot Password Card */}
                {forgotPasswordOpen && (
                  <div
                    style={{
                      borderRadius: "12px",
                      backgroundColor: "#F1F5F9",
                      border: "1px solid #CBD5E1",
                      padding: "12px 14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      animation: "fadeIn 0.2s ease",
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C" }}>
                      Pemulihan Kata Sandi
                    </div>
                    <p style={{ fontSize: "11px", color: "#64748B", margin: 0, lineHeight: 1.4 }}>
                      Masukkan alamat email kedinasan Anda untuk menerima tautan pembuatan kata sandi baru.
                    </p>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="nama@sijakon.bogor.go.id"
                        style={{
                          flex: 1,
                          height: "36px",
                          borderRadius: "8px",
                          border: "1px solid #CBD5E1",
                          backgroundColor: "#FFFFFF",
                          padding: "0 10px",
                          fontSize: "11px",
                          color: "#0F172A",
                          outline: "none",
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        disabled={resetLoading || !resetEmail}
                        style={{
                          height: "36px",
                          padding: "0 12px",
                          borderRadius: "8px",
                          backgroundColor: "#0F2E5C",
                          color: "#FFFFFF",
                          fontSize: "11px",
                          fontWeight: 700,
                          border: "none",
                          cursor: resetLoading || !resetEmail ? "not-allowed" : "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {resetLoading ? "Mengirim..." : "Kirim Tautan"}
                      </button>
                    </div>

                    {resetMessage && (
                      <div
                        style={{
                          borderRadius: "6px",
                          padding: "6px 10px",
                          fontSize: "11px",
                          fontWeight: 600,
                          backgroundColor: resetMessage.type === "success" ? "#DCFCE7" : "#FEE2E2",
                          color: resetMessage.type === "success" ? "#166534" : "#991B1B",
                          border: `1px solid ${resetMessage.type === "success" ? "#BBF7D0" : "#FECACA"}`,
                        }}
                      >
                        {resetMessage.text}
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div 
                    style={{
                      borderRadius: "10px",
                      backgroundColor: "#FEF2F2",
                      border: "1px solid #FECACA",
                      padding: "8px 12px",
                      fontSize: "12px",
                      color: "#B91C1C",
                      fontWeight: 600
                    }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: "44px",
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    borderRadius: "12px",
                    backgroundColor: "#0F2E5C",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: 800,
                    border: "none",
                    borderBottom: "3px solid #FFC000",
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 12px rgba(15, 46, 92, 0.25)"
                  }}
                >
                  {loading ? (
                    <span>Memverifikasi Hak Akses...</span>
                  ) : (
                    <>
                      <span>
                        {selectedDemoUser === "bujk_demo" 
                          ? "Masuk ke Portal Rekanan BUJK" 
                          : selectedDemoUser === "peserta_demo" 
                          ? "Masuk ke Portal Peserta TKK" 
                          : "Masuk ke Dashboard Dinas"}
                      </span>
                      <ArrowRight style={{ width: "16px", height: "16px", color: "#FFC000" }} />
                    </>
                  )}
                </button>
              </form>

              {/* Portal Mitra Direct Links */}
              <div 
                style={{
                  paddingTop: "12px",
                  borderTop: "1px solid #F1F5F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                  fontSize: "11px",
                  color: "#64748B"
                }}
              >
                <span>Portal Khusus:</span>
                <Link
                  href="/portal/login?tab=bujk"
                  style={{
                    fontWeight: 700,
                    color: "#D97706",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "2px"
                  }}
                >
                  Portal BUJK <ArrowRight style={{ width: "11px", height: "11px" }} />
                </Link>
                <span>•</span>
                <Link
                  href="/portal/login?tab=peserta"
                  style={{
                    fontWeight: 700,
                    color: "#2563EB",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "2px"
                  }}
                >
                  Portal Peserta TKK <ArrowRight style={{ width: "11px", height: "11px" }} />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer PUPR */}
      <footer 
        style={{
          width: "100%",
          borderTop: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          padding: "12px 24px",
          textAlign: "center",
          fontSize: "11px",
          color: "#64748B"
        }}
      >
        <div 
          style={{
            maxWidth: "1140px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <p style={{ margin: 0 }}>© 2026 Dinas Pekerjaan Umum (DPU) Kabupaten Bogor. Hak Cipta Dilindungi.</p>
            <span style={{ color: "#CBD5E1" }}>•</span>
            <Link 
              href="/" 
              style={{ 
                color: "#0F2E5C", 
                fontWeight: 700, 
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <span>← Beranda Publik</span>
            </Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#94A3B8" }}>
            <span>SIPJAKI Terintegrasi</span>
            <span>•</span>
            <span>Permen PUPR No. 1/2023</span>
            <span>•</span>
            <span>6-Tier RBAC Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

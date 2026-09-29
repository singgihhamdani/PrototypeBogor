"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, DEMO_USERS, RoleCode } from "@/lib/mock-auth";
import { 
  Eye, EyeOff, ShieldCheck, Building2, 
  ArrowRight, Key, Mail, Lock, Sparkles, UserCheck, Crown, ClipboardCheck
} from "lucide-react";
import Logo, { BrandIcon } from "@/components/ui/logo";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@sijakon.bogor.go.id");
  const [password, setPassword] = useState("demo2026");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDemoUser, setSelectedDemoUser] = useState("superadmin");
  const { login } = useAuth();
  const router = useRouter();

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
      router.push(result.targetRoute);
    } else {
      setError(result.error || "Kombinasi email atau kata sandi tidak valid.");
      setLoading(false);
    }
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
          padding: "12px 24px",
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
            gap: "16px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <BrandIcon size={40} />

            <div style={{ display: "flex", flexDirection: "column" }}>
              <span 
                style={{
                  fontSize: "13px",
                  fontWeight: 900,
                  color: "#FFC000",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  lineHeight: 1.2
                }}
              >
                DINAS PEKERJAAN UMUM
              </span>
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
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
          </div>
        </div>
      </header>

      {/* Main Login Card Section */}
      <main 
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px"
        }}
      >
        <div 
          style={{
            maxWidth: "960px",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
            borderRadius: "24px",
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
              padding: "36px",
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
              {/* Badge */}
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
                  alignSelf: "flex-start"
                }}
              >
                <Sparkles style={{ width: "12px", height: "12px" }} />
                <span>Multi-Role RBAC Prototype</span>
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

              {/* Role Highlights */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", margin: 0, letterSpacing: "0.5px" }}>
                  Role Internal yang Didukung:
                </p>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div style={{ padding: "8px 10px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Crown style={{ width: "14px", height: "14px", color: "#FFC000" }} />
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#FFFFFF" }}>Super Admin</span>
                    </div>
                    <p style={{ fontSize: "10px", color: "#94A3B8", margin: "2px 0 0 0" }}>Full RBAC & setting</p>
                  </div>

                  <div style={{ padding: "8px 10px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Building2 style={{ width: "14px", height: "14px", color: "#60A5FA" }} />
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#FFFFFF" }}>Admin Bidang</span>
                    </div>
                    <p style={{ fontSize: "10px", color: "#94A3B8", margin: "2px 0 0 0" }}>Bina Konstruksi</p>
                  </div>

                  <div style={{ padding: "8px 10px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <ClipboardCheck style={{ width: "14px", height: "14px", color: "#38BDF8" }} />
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#FFFFFF" }}>Tim Pengawas</span>
                    </div>
                    <p style={{ fontSize: "10px", color: "#94A3B8", margin: "2px 0 0 0" }}>Asesor Lapangan</p>
                  </div>

                  <div style={{ padding: "8px 10px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <ShieldCheck style={{ width: "14px", height: "14px", color: "#34D399" }} />
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#FFFFFF" }}>Eksekutif</span>
                    </div>
                    <p style={{ fontSize: "10px", color: "#94A3B8", margin: "2px 0 0 0" }}>Dashboard & Laporan</p>
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
                  Portal Dinas Internal
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
                  Masuk Akun Petugas
                </h3>
                <p 
                  style={{
                    fontSize: "12px",
                    color: "#64748B",
                    margin: "2px 0 0 0"
                  }}
                >
                  Akses modul pembinaan, pengawasan SIMAK, dan pelaporan internal
                </p>
              </div>

              {/* Demo Account Fast Selector */}
              <div 
                style={{
                  borderRadius: "14px",
                  border: "1px solid #E2E8F0",
                  backgroundColor: "#F8FAFC",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700, color: "#0F2E5C" }}>
                    <Key style={{ width: "14px", height: "14px", color: "#F59E0B" }} />
                    <span>Pilih Akun Demo Internal (1-Klik):</span>
                  </div>
                </div>

                {/* 4 Internal Demo Role Buttons */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  {[
                    { key: "superadmin", label: "Super Admin", sub: "Ridwan, ST" },
                    { key: "op_binkon", label: "Admin Bidang", sub: "Bayu Pratama" },
                    { key: "op_pengawas", label: "Tim Pengawas", sub: "Ir. Supriyatna" },
                    { key: "eksekutif", label: "Eksekutif", sub: "Kadis PUPR" },
                  ].map((item) => {
                    const isSelected = selectedDemoUser === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleSelectDemo(item.key)}
                        style={{
                          textAlign: "left",
                          padding: "6px 8px",
                          borderRadius: "8px",
                          border: isSelected ? "2px solid #0F2E5C" : "1px solid #CBD5E1",
                          backgroundColor: isSelected ? "#EBF2FA" : "#FFFFFF",
                          cursor: "pointer"
                        }}
                      >
                        <span style={{ display: "block", fontSize: "11px", fontWeight: 800, color: isSelected ? "#0F2E5C" : "#334155" }}>
                          {item.label}
                        </span>
                        <span style={{ display: "block", fontSize: "9px", color: "#64748B" }}>
                          {item.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
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
                    <span style={{ fontSize: "10px", color: "#94A3B8" }}>Default: demo2026</span>
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
                      <span>Masuk ke Dashboard Dinas</span>
                      <ArrowRight style={{ width: "16px", height: "16px", color: "#FFC000" }} />
                    </>
                  )}
                </button>
              </form>

              {/* Portal Mitra External Link */}
              <div 
                style={{
                  paddingTop: "12px",
                  borderTop: "1px solid #F1F5F9",
                  textAlign: "center"
                }}
              >
                <p style={{ fontSize: "11px", color: "#64748B", margin: 0 }}>
                  Penyedia Jasa (BUJK) atau Peserta Pelatihan?
                </p>
                <Link
                  href="/portal/login"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#D97706",
                    textDecoration: "none",
                    marginTop: "2px"
                  }}
                >
                  Beralih ke Portal Mitra & Peserta <ArrowRight style={{ width: "12px", height: "12px" }} />
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
          <p style={{ margin: 0 }}>© 2026 Dinas Pekerjaan Umum (DPU) Kabupaten Bogor. Hak Cipta Dilindungi.</p>
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

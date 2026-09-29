"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, DEMO_USERS } from "@/lib/mock-auth";
import { 
  Building2, GraduationCap, ArrowRight, Key, Mail, Lock, 
  Sparkles, CheckCircle2, ShieldCheck, Eye, EyeOff, UserPlus
} from "lucide-react";
import Logo, { BrandIcon } from "@/components/ui/logo";

export default function PortalLoginPage() {
  const [email, setEmail] = useState("admin@ptbangunjaya.co.id");
  const [password, setPassword] = useState("demo2026");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activePortalTab, setActivePortalTab] = useState<"bujk" | "peserta">("bujk");
  const { login } = useAuth();
  const router = useRouter();

  const handleSelectPortalType = (type: "bujk" | "peserta") => {
    setActivePortalTab(type);
    if (type === "bujk") {
      setEmail("admin@ptbangunjaya.co.id");
      setPassword("demo2026");
    } else {
      setEmail("ahmad.fauzi@gmail.com");
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
      setError(result.error || "Kredensial tidak valid. Silakan gunakan akun demo.");
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
        backgroundColor: "#F8FAFC",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
      }}
    >
      {/* Top Header */}
      <header 
        style={{
          width: "100%",
          backgroundColor: "#0A2540",
          borderBottom: "4px solid #F59E0B",
          padding: "12px 24px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.08)"
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
                PORTAL LAYANAN JASA KONSTRUKSI
              </span>
              <span 
                style={{
                  fontSize: "11px",
                  color: "rgba(255, 255, 255, 0.8)",
                  fontWeight: 500,
                  lineHeight: 1.2
                }}
              >
                Kabupaten Bogor • Portal Mandiri Penyedia Jasa & Tenaga Kerja
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#FFFFFF",
                backgroundColor: "rgba(255,255,255,0.1)",
                padding: "6px 14px",
                borderRadius: "9999px",
                border: "1px solid rgba(255,255,255,0.2)",
                textDecoration: "none"
              }}
            >
              <span>Portal Dinas Internal</span>
              <ArrowRight style={{ width: "12px", height: "12px" }} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Card */}
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
            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.15)",
            border: "1px solid #E2E8F0",
            overflow: "hidden"
          }}
        >
          {/* Left Side: Mitra Banner */}
          <div 
            style={{
              background: "linear-gradient(135deg, #1E293B 0%, #0F172A 60%, #0A2540 100%)",
              padding: "36px",
              color: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative"
            }}
          >
            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
              <div 
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "rgba(245, 158, 11, 0.15)",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#F59E0B",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  alignSelf: "flex-start"
                }}
              >
                <Sparkles style={{ width: "12px", height: "12px" }} />
                <span>Portal Rekanan & Peserta Mandiri</span>
              </div>

              <div>
                <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#FFFFFF", margin: "0 0 8px 0" }}>
                  Satu Pintu Layanan Mitra Konstruksi
                </h2>
                <p style={{ fontSize: "12px", color: "#94A3B8", lineHeight: 1.6, margin: 0 }}>
                  Akses langsung pengelolaan sertifikasi badan usaha, upload mandiri laporan pengawasan SIMAK, dan portal sertifikasi tenaga kerja.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div 
                  onClick={() => handleSelectPortalType("bujk")}
                  style={{
                    padding: "14px",
                    borderRadius: "14px",
                    border: activePortalTab === "bujk" ? "2px solid #F59E0B" : "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: activePortalTab === "bujk" ? "rgba(245, 158, 11, 0.12)" : "rgba(255,255,255,0.04)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px"
                  }}
                >
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#EA580C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Building2 style={{ width: "20px", height: "20px", color: "#FFFFFF" }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>Badan Usaha (BUJK)</h4>
                    <p style={{ fontSize: "11px", color: "#94A3B8", margin: "2px 0 0 0" }}>
                      Kelola profil perusahaan, pantau masa berlaku SBU, dan kirim dokumen SIMAK pekerjaan.
                    </p>
                  </div>
                </div>

                <div 
                  onClick={() => handleSelectPortalType("peserta")}
                  style={{
                    padding: "14px",
                    borderRadius: "14px",
                    border: activePortalTab === "peserta" ? "2px solid #F59E0B" : "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: activePortalTab === "peserta" ? "rgba(245, 158, 11, 0.12)" : "rgba(255,255,255,0.04)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px"
                  }}
                >
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#0284C7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <GraduationCap style={{ width: "20px", height: "20px", color: "#FFFFFF" }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>Peserta Tenaga Kerja (TKK)</h4>
                    <p style={{ fontSize: "11px", color: "#94A3B8", margin: "2px 0 0 0" }}>
                      Jadwal pelatihan, materi modul pembinaan, uji kompetensi, dan unduh sertifikat SKK.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div 
              style={{
                paddingTop: "16px",
                marginTop: "20px",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "#64748B"
              }}
            >
              <span>Kabupaten Bogor Maju & Tertib Konstruksi</span>
              <span style={{ color: "#F59E0B", fontWeight: 700 }}>SIPJAKI Verified</span>
            </div>
          </div>

          {/* Right Side: Form */}
          <div 
            style={{
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              backgroundColor: "#FFFFFF"
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              <div>
                <span 
                  style={{
                    display: "inline-block",
                    fontSize: "10px",
                    fontWeight: 800,
                    color: activePortalTab === "bujk" ? "#9A3412" : "#0369A1",
                    backgroundColor: activePortalTab === "bujk" ? "#FFEDD5" : "#E0F2FE",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "6px"
                  }}
                >
                  {activePortalTab === "bujk" ? "Portal Penyedia Jasa BUJK" : "Portal Peserta Pelatihan TKK"}
                </span>
                <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
                  Masuk ke Portal Anda
                </h3>
                <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
                  Gunakan kredensial akun terdaftar untuk melanjutkan
                </p>
              </div>

              {/* Demo Account Box */}
              <div 
                style={{
                  borderRadius: "12px",
                  border: "1px solid #FED7AA",
                  backgroundColor: "#FFFBEB",
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <span style={{ fontSize: "10px", color: "#92400E", fontWeight: 700, display: "block" }}>
                    Akun Demo Terpilih:
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#78350F" }}>
                    {activePortalTab === "bujk" ? "PT Bangun Jaya Konstruksi (Budi Santoso)" : "Ahmad Fauzi, A.Md (Peserta TKK)"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectPortalType(activePortalTab)}
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "#92400E",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #FCD34D",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  Auto-Fill
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>
                    Email / ID Pengguna
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94A3B8" }} />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>
                    Kata Sandi
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94A3B8" }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                    marginTop: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    borderRadius: "12px",
                    backgroundColor: activePortalTab === "bujk" ? "#C2410C" : "#0284C7",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: 800,
                    border: "none",
                    borderBottom: "3px solid rgba(0,0,0,0.2)",
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
                  }}
                >
                  {loading ? (
                    <span>Membuka Portal...</span>
                  ) : (
                    <>
                      <span>Masuk ke {activePortalTab === "bujk" ? "Portal BUJK" : "Portal Peserta TKK"}</span>
                      <ArrowRight style={{ width: "16px", height: "16px" }} />
                    </>
                  )}
                </button>
              </form>

              {/* Registration notice */}
              <div 
                style={{
                  paddingTop: "12px",
                  borderTop: "1px solid #F1F5F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "11px"
                }}
              >
                <span style={{ color: "#64748B" }}>Belum memiliki akun rekanan?</span>
                <span style={{ fontWeight: 800, color: "#0F2E5C", cursor: "pointer" }} onClick={() => alert("Simulasi registrasi mandiri: Data akan divalidasi dengan integrasi OSS-RBA & SIPJAKI.")}>
                  Daftar Mandiri →
                </span>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
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
        <p style={{ margin: 0 }}>© 2026 Pemerintah Kabupaten Bogor • Layanan Mandiri Jasa Konstruksi</p>
      </footer>
    </div>
  );
}

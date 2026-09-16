"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/mock-auth";
import { 
  Eye, EyeOff, ShieldCheck, Building2, 
  ArrowRight, Key, Mail, Lock, Sparkles
} from "lucide-react";
import Logo, { BrandIcon } from "@/components/ui/logo";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@sijakon.bogor.go.id");
  const [password, setPassword] = useState("demo2026");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const ok = login(email, password);
    if (ok) {
      router.push("/");
    } else {
      setError("Kombinasi email atau kata sandi demo tidak valid.");
      setLoading(false);
    }
  };

  const setDemoCredentials = () => {
    setEmail("admin@sijakon.bogor.go.id");
    setPassword("demo2026");
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
        fontFamily: "'Plus Jakarta Sans', sans-serif"
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
                DINAS PEKERJAAN UMUM DAN PENATAAN RUANG
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
            <span>Portal Pembinaan Jasa Konstruksi</span>
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
            maxWidth: "940px",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
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
                <span>Prototype TA 2026</span>
              </div>

              {/* Title with Logo */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Logo size={48} theme="dark" subtitle="DPUPR KABUPATEN BOGOR" />
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

              {/* Highlights */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div 
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    padding: "12px",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.1)"
                  }}
                >
                  <div 
                    style={{
                      height: "34px",
                      width: "34px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(255,192,0,0.15)",
                      color: "#FFC000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    <Building2 style={{ width: "18px", height: "18px" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>40 Kecamatan Terpetakan</p>
                    <p style={{ fontSize: "11px", color: "#94A3B8", margin: 0 }}>Sebaran BUJK & paket pekerjaan WebGIS.</p>
                  </div>
                </div>

                <div 
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    padding: "12px",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.1)"
                  }}
                >
                  <div 
                    style={{
                      height: "34px",
                      width: "34px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(255,192,0,0.15)",
                      color: "#FFC000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    <ShieldCheck style={{ width: "18px", height: "18px" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>Standar Permen PUPR 1/2023</p>
                    <p style={{ fontSize: "11px", color: "#94A3B8", margin: 0 }}>Audit digital 3 Tertib & pelaporan K3.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Slogan */}
            <div 
              style={{
                position: "relative",
                zIndex: 1,
                paddingTop: "20px",
                marginTop: "24px",
                borderTop: "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "rgba(255,255,255,0.7)"
              }}
            >
              <span style={{ fontWeight: 800, letterSpacing: "0.5px", color: "#FFC000" }}>SIGAP MEMBANGUN NEGERI</span>
              <span style={{ fontFamily: "monospace", fontSize: "10px" }}>v1.0 Preview</span>
            </div>
          </div>

          {/* Right Form Area */}
          <div 
            style={{
              padding: "36px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minWidth: 0,
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
                    color: "#0F2E5C",
                    backgroundColor: "#EBF2FA",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "8px"
                  }}
                >
                  Portal Masuk Petugas
                </span>
                <h3 
                  style={{
                    fontSize: "22px",
                    fontWeight: 900,
                    color: "#0F172A",
                    letterSpacing: "-0.5px",
                    margin: 0
                  }}
                >
                  Silakan Masuk
                </h3>
                <p 
                  style={{
                    fontSize: "12px",
                    color: "#64748B",
                    margin: "4px 0 0 0"
                  }}
                >
                  Akses dashboard evaluasi dan pembinaan jasa konstruksi
                </p>
              </div>

              {/* Demo Credentials Box */}
              <div 
                style={{
                  borderRadius: "14px",
                  border: "1px solid #FCD34D",
                  backgroundColor: "#FFFBEB",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700, color: "#B45309" }}>
                    <Key style={{ width: "14px", height: "14px" }} />
                    <span>Akun Demo Prototype:</span>
                  </div>
                  <button
                    type="button"
                    onClick={setDemoCredentials}
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      color: "#0F2E5C",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #FCD34D",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                  >
                    Auto-Fill
                  </button>
                </div>
                <div 
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    fontSize: "11px",
                    backgroundColor: "#FFFFFF",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    border: "1px solid #FDE68A"
                  }}
                >
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "9px", color: "#94A3B8", display: "block", textTransform: "uppercase" }}>Email:</span>
                    <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0F2E5C", fontSize: "11px" }}>admin@sijakon.bogor.go.id</span>
                  </div>
                  <div>
                    <span style={{ fontSize: "9px", color: "#94A3B8", display: "block", textTransform: "uppercase" }}>Password:</span>
                    <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0F2E5C", fontSize: "11px" }}>demo2026</span>
                  </div>
                </div>
              </div>

              {/* Form Inputs */}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Alamat Email
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94A3B8" }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@sijakon.bogor.go.id"
                      required
                      style={{
                        width: "100%",
                        height: "42px",
                        borderRadius: "10px",
                        border: "1px solid #CBD5E1",
                        backgroundColor: "#F8FAFC",
                        paddingLeft: "38px",
                        paddingRight: "12px",
                        fontSize: "13px",
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
                    <span style={{ fontSize: "10px", color: "#94A3B8" }}>Demo mode</span>
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
                        height: "42px",
                        borderRadius: "10px",
                        border: "1px solid #CBD5E1",
                        backgroundColor: "#F8FAFC",
                        paddingLeft: "38px",
                        paddingRight: "40px",
                        fontSize: "13px",
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
                    height: "46px",
                    marginTop: "6px",
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
                    <span>Memverifikasi Sesi...</span>
                  ) : (
                    <>
                      <span>Masuk ke Dashboard SIJAKON</span>
                      <ArrowRight style={{ width: "16px", height: "16px", color: "#FFC000" }} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ paddingTop: "6px", textAlign: "center" }}>
                <p style={{ fontSize: "11px", color: "#94A3B8", margin: 0 }}>
                  Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Bogor
                </p>
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
          <p style={{ margin: 0 }}>© 2026 Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Bogor. Hak Cipta Dilindungi.</p>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#94A3B8" }}>
            <span>SIPJAKI Terintegrasi</span>
            <span>•</span>
            <span>Permen PUPR No. 1/2023</span>
            <span>•</span>
            <span>SMKK K3 Konstruksi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

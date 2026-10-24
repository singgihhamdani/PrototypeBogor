"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";
import Logo, { BrandIcon } from "@/components/ui/logo";
import { createClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Hitung kekuatan password sederhana
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    return score;
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Kata sandi baru minimal harus 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      if (supabase) {
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        });

        if (updateError) {
          setError(updateError.message);
          setLoading(false);
          return;
        }

        // Update status profile first_login = false jika ada user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await (supabase.from("profiles") as any)
            .update({ first_login: false })
            .eq("id", user.id);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat menyimpan kata sandi.");
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
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      {/* Header Bar */}
      <header
        style={{
          width: "100%",
          backgroundColor: "#0F2E5C",
          borderBottom: "4px solid #FFC000",
          padding: "12px 24px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            maxWidth: "1140px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}
          >
            <BrandIcon size={36} bgBadge />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 900,
                  color: "#FFC000",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                DINAS PEKERJAAN UMUM
              </span>
              <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.8)" }}>
                Pemerintah Kabupaten Bogor • Pengaturan Akun
              </span>
            </div>
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
            }}
          >
            <ShieldCheck style={{ width: "16px", height: "16px", color: "#FFC000" }} />
            <span>Keamanan Akun Internal</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
        }}
      >
        <div
          style={{
            maxWidth: "460px",
            width: "100%",
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            boxShadow: "0 20px 40px -10px rgba(15, 46, 92, 0.18)",
            border: "1px solid #E2E8F0",
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: "#EBF2FA",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "12px",
              }}
            >
              <KeyRound style={{ width: "24px", height: "24px", color: "#0F2E5C" }} />
            </div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 900,
                color: "#0F172A",
                margin: 0,
              }}
            >
              Atur Kata Sandi Baru
            </h3>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0 0" }}>
              Silakan buat kata sandi aman untuk masuk ke akun SIJAKON Anda.
            </p>
          </div>

          {success ? (
            <div
              style={{
                backgroundColor: "#F0FDF4",
                border: "1px solid #BBF7D0",
                borderRadius: "14px",
                padding: "20px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <CheckCircle2 style={{ width: "36px", height: "36px", color: "#16A34A" }} />
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#166534" }}>
                Kata Sandi Berhasil Disimpan!
              </div>
              <div style={{ fontSize: "12px", color: "#15803D" }}>
                Mengarahkan Anda langsung ke Dashboard SIJAKON...
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>
                  Kata Sandi Baru
                </label>
                <div style={{ position: "relative" }}>
                  <Lock
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "16px",
                      height: "16px",
                      color: "#94A3B8",
                    }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
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
                      outline: "none",
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
                      color: "#94A3B8",
                    }}
                  >
                    {showPassword ? <EyeOff style={{ width: "16px", height: "16px" }} /> : <Eye style={{ width: "16px", height: "16px" }} />}
                  </button>
                </div>

                {/* Indikator Kekuatan Sandi */}
                {password && (
                  <div style={{ marginTop: "4px" }}>
                    <div
                      style={{
                        height: "4px",
                        width: "100%",
                        backgroundColor: "#E2E8F0",
                        borderRadius: "9999px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${strength}%`,
                          backgroundColor:
                            strength < 50 ? "#EF4444" : strength < 75 ? "#F59E0B" : "#10B981",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: "10px", color: "#64748B", marginTop: "2px", display: "inline-block" }}>
                      Kekuatan: {strength < 50 ? "Lemah" : strength < 75 ? "Cukup" : "Sangat Kuat"}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>
                  Konfirmasi Kata Sandi Baru
                </label>
                <div style={{ position: "relative" }}>
                  <Lock
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "16px",
                      height: "16px",
                      color: "#94A3B8",
                    }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
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
                      outline: "none",
                    }}
                  />
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
                    fontWeight: 600,
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
                  backgroundColor: "#0F2E5C",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: 800,
                  border: "none",
                  borderBottom: "3px solid #FFC000",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(15, 46, 92, 0.25)",
                }}
              >
                {loading ? (
                  <span>Menyimpan Kata Sandi...</span>
                ) : (
                  <>
                    <span>Simpan & Masuk ke Dashboard</span>
                    <ArrowRight style={{ width: "16px", height: "16px", color: "#FFC000" }} />
                  </>
                )}
              </button>
            </form>
          )}

          <div style={{ textAlign: "center", borderTop: "1px solid #F1F5F9", paddingTop: "14px" }}>
            <Link
              href="/login"
              style={{
                fontSize: "12px",
                color: "#0F2E5C",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              ← Kembali ke Laman Masuk
            </Link>
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
          color: "#64748B",
        }}
      >
        © 2026 Dinas Pekerjaan Umum Kabupaten Bogor. Hak Cipta Dilindungi.
      </footer>
    </div>
  );
}

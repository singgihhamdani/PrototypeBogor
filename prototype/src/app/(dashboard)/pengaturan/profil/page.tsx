"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  User as UserIcon, Lock, KeyRound, ShieldCheck, Building2, 
  Mail, Phone, Save, CheckCircle2, AlertCircle, ArrowLeft,
  Sparkles, Check, Eye, EyeOff, Shield, RefreshCw
} from "lucide-react";
import { useAuth, ROLE_CONFIGS, RoleCode } from "@/lib/mock-auth";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function ProfilPage() {
  const { user, isSupabase } = useAuth();

  // Form states
  const [namaLengkap, setNamaLengkap] = useState("");
  const [phone, setPhone] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (user) {
      setNamaLengkap(user.name || "");
      setPhone(user.phone || "0812-9876-5432");
      setJabatan(user.jabatan || "Petugas Pembina Jasa Konstruksi");
    }
  }, [user]);

  const currentRole: RoleCode = user?.role || "SUPER_ADMIN";
  const roleConfig = ROLE_CONFIGS[currentRole];

  // Hitung kekuatan password
  const getPasswordStrength = () => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 8) score += 25;
    if (/[A-Z]/.test(newPassword)) score += 25;
    if (/[0-9]/.test(newPassword)) score += 25;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 25;
    return score;
  };

  const strength = getPasswordStrength();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      const supabase = createClient();
      if (supabase && isSupabaseConfigured() && user) {
        await (supabase.from("profiles") as any)
          .update({
            nama_lengkap: namaLengkap,
            phone: phone,
            jabatan: jabatan,
          })
          .eq("id", user.id);
      }

      // Update local storage user
      if (typeof window !== "undefined" && user) {
        const updatedUser = {
          ...user,
          name: namaLengkap,
          phone: phone,
          jabatan: jabatan,
        };
        localStorage.setItem("sijakon_user_v3", JSON.stringify(updatedUser));
      }

      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      console.error("[Profile] Gagal menyimpan data:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword.length < 8) {
      setPasswordError("Kata sandi baru minimal harus 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setPasswordLoading(true);

    try {
      const supabase = createClient();
      if (supabase && isSupabaseConfigured()) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) {
          setPasswordError(error.message);
          setPasswordLoading(false);
          return;
        }
      }

      setPasswordSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3500);
    } catch (err: any) {
      setPasswordError(err?.message || "Gagal mengubah kata sandi.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Breadcrumb Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "8px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #CBD5E1",
              fontSize: "12px",
              fontWeight: 700,
              color: "#0F2E5C",
              textDecoration: "none",
            }}
          >
            <ArrowLeft style={{ width: "14px", height: "14px" }} />
            <span>Dashboard</span>
          </Link>
          <span style={{ color: "#94A3B8" }}>/</span>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>
            Pengaturan Profil Saya & Keamanan
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "#64748B" }}>
          <ShieldCheck style={{ width: "14px", height: "14px", color: "#16A34A" }} />
          <span>Sesi Terenkripsi & Terotentikasi</span>
        </div>
      </div>

      {/* Hero Profile Card */}
      <div
        style={{
          borderRadius: "20px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 20px -2px rgba(15, 46, 92, 0.08)",
          overflow: "hidden",
        }}
      >
        {/* Top Header Card - Deep PUPR Blue with Gold Trim */}
        <div
          style={{
            background: "linear-gradient(135deg, #07182E 0%, #0F2E5C 60%, #163B75 100%)",
            padding: "26px 30px",
            borderBottom: "4px solid #FFC000",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          {/* Subtle Grid Accent */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.06,
              backgroundImage: "radial-gradient(#FFC000 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              pointerEvents: "none",
            }}
          />

          {/* Left Profile Info */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            {/* Avatar with Golden Badge */}
            <div
              style={{
                width: "76px",
                height: "76px",
                borderRadius: "18px",
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                color: "#FFC000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                fontWeight: 900,
                border: "2px solid #FFC000",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
                flexShrink: 0,
              }}
            >
              {user?.name
                ? user.name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
                : "AD"}
            </div>

            {/* Officer Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "20px", fontWeight: 900, color: "#FFFFFF", margin: 0, letterSpacing: "-0.3px" }}>
                  {user?.name || "Nama Pengguna"}
                </h1>
                <span
                  style={{
                    backgroundColor: "rgba(34, 197, 94, 0.2)",
                    color: "#4ADE80",
                    border: "1px solid rgba(74, 222, 128, 0.4)",
                    fontSize: "11px",
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <ShieldCheck style={{ width: "12px", height: "12px" }} />
                  <span>Akun Kedinasan Terverifikasi</span>
                </span>
              </div>

              <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.82)", margin: 0, lineHeight: 1.4 }}>
                <strong>{user?.jabatan || "Petugas Jasa Konstruksi"}</strong> • {user?.email}
              </p>

              {/* Role & OPD Badges */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 900,
                    backgroundColor: "#FFC000",
                    color: "#0F2E5C",
                    padding: "2px 10px",
                    borderRadius: "9999px",
                    letterSpacing: "0.3px",
                  }}
                >
                  {user?.roleLabel || "Super Admin DPU"}
                </span>

                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    color: "#FFFFFF",
                    padding: "2px 10px",
                    borderRadius: "9999px",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <Building2 style={{ width: "12px", height: "12px", color: "#FFC000" }} />
                  <span>{user?.opdName || user?.instansi || "Dinas Pekerjaan Umum"}</span>
                </span>

                {user?.nip && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "rgba(255, 255, 255, 0.9)",
                      padding: "2px 10px",
                      borderRadius: "9999px",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      fontFamily: "monospace",
                    }}
                  >
                    NIP: {user.nip}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Status Badge */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: isSupabase ? "rgba(34, 197, 94, 0.2)" : "rgba(255, 192, 0, 0.2)",
                color: isSupabase ? "#4ADE80" : "#FFC000",
                border: `1px solid ${isSupabase ? "rgba(74, 222, 128, 0.4)" : "rgba(255, 192, 0, 0.4)"}`,
                padding: "5px 12px",
                borderRadius: "9999px",
                fontSize: "10px",
                fontWeight: 800,
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: isSupabase ? "#22C55E" : "#FFC000",
                }}
              />
              <span>{isSupabase ? "Database: Supabase Cloud (Live)" : "Database: Demo Mode"}</span>
            </div>

            <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.65)", fontWeight: 600 }}>
              Pemerintah Kabupaten Bogor
            </span>
          </div>
        </div>

        {/* Bottom Quick Stats Bar */}
        <div
          style={{
            backgroundColor: "#F8FAFC",
            borderTop: "1px solid #E2E8F0",
            padding: "12px 28px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            fontSize: "12px",
          }}
        >
          <div>
            <span style={{ color: "#64748B", display: "block", fontSize: "11px" }}>Status Kepegawaian:</span>
            <strong style={{ color: "#166534", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <CheckCircle2 style={{ width: "13px", height: "13px", color: "#16A34A" }} />
              Aktif & Terdaftar Resmi
            </strong>
          </div>
          <div>
            <span style={{ color: "#64748B", display: "block", fontSize: "11px" }}>Otorisasi Modul:</span>
            <strong style={{ color: "#0F2E5C" }}>
              {user?.role === "SUPER_ADMIN" ? "Akses Penuh Semua Modul (15/15)" : "Sesuai Bidang Penugasan"}
            </strong>
          </div>
          <div>
            <span style={{ color: "#64748B", display: "block", fontSize: "11px" }}>Keamanan Sesi:</span>
            <strong style={{ color: "#0F2E5C" }}>Token JWT Aktif (Auto-Refresh)</strong>
          </div>
          <div>
            <span style={{ color: "#64748B", display: "block", fontSize: "11px" }}>Terintegrasi SIPJAKI:</span>
            <strong style={{ color: "#0F2E5C" }}>Permen PUPR No. 1/2023</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Data Profile vs Keamanan Sandi */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
        {/* Card 1: Edit Informasi Data Diri */}
        <div
          style={{
            borderRadius: "18px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#EBF2FA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserIcon style={{ width: "18px", height: "18px", color: "#0F2E5C" }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#0F172A" }}>
                Informasi Pribadi & Kontak
              </h3>
              <p style={{ margin: 0, fontSize: "11px", color: "#64748B" }}>
                Perbarui nama lengkap, nomor telepon, dan data kontak dinas
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>
                Nama Lengkap & Gelar
              </label>
              <input
                type="text"
                required
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                style={{
                  height: "38px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#F8FAFC",
                  padding: "0 12px",
                  fontSize: "12px",
                  fontWeight: 700,
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                style={{
                  height: "38px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#F8FAFC",
                  padding: "0 12px",
                  fontSize: "12px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>
                Jabatan Struktural / Fungsional
              </label>
              <input
                type="text"
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                style={{
                  height: "38px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#F8FAFC",
                  padding: "0 12px",
                  fontSize: "12px",
                  outline: "none",
                }}
              />
            </div>

            {/* Read-Only Kedinasan */}
            <div
              style={{
                borderRadius: "10px",
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                fontSize: "11px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>Email Kedinasan:</span>
                <span style={{ fontWeight: 700, color: "#0F172A" }}>{user?.email}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>NIP Resmi:</span>
                <span style={{ fontWeight: 700, color: "#0F172A", fontFamily: "monospace" }}>{user?.nip || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>Satuan Kerja (OPD):</span>
                <span style={{ fontWeight: 700, color: "#0F2E5C" }}>{user?.opdName || user?.instansi}</span>
              </div>
            </div>

            {profileSaved && (
              <div
                style={{
                  borderRadius: "8px",
                  backgroundColor: "#DCFCE7",
                  border: "1px solid #BBF7D0",
                  padding: "8px 12px",
                  fontSize: "12px",
                  color: "#166534",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Check style={{ width: "14px", height: "14px" }} />
                <span>Perubahan profil berhasil disimpan!</span>
              </div>
            )}

            <button
              type="submit"
              disabled={profileLoading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#0F2E5C",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 800,
                border: "none",
                borderBottom: "3px solid #FFC000",
                cursor: profileLoading ? "not-allowed" : "pointer",
              }}
            >
              <Save style={{ width: "14px", height: "14px", color: "#FFC000" }} />
              <span>{profileLoading ? "Menyimpan..." : "Simpan Informasi Profil"}</span>
            </button>
          </form>
        </div>

        {/* Card 2: Pengaturan Keamanan Kata Sandi */}
        <div
          style={{
            borderRadius: "18px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#FEF3C7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <KeyRound style={{ width: "18px", height: "18px", color: "#D97706" }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#0F172A" }}>
                Keamanan & Kata Sandi
              </h3>
              <p style={{ margin: 0, fontSize: "11px", color: "#64748B" }}>
                Ubah kata sandi akun untuk menjaga integritas data kedinasan
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>
                Kata Sandi Baru
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  style={{
                    width: "100%",
                    height: "38px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    backgroundColor: "#F8FAFC",
                    paddingLeft: "12px",
                    paddingRight: "38px",
                    fontSize: "12px",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94A3B8",
                  }}
                >
                  {showPassword ? <EyeOff style={{ width: "14px", height: "14px" }} /> : <Eye style={{ width: "14px", height: "14px" }} />}
                </button>
              </div>

              {/* Strength Meter */}
              {newPassword && (
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
                    Kekuatan Sandi: {strength < 50 ? "Lemah" : strength < 75 ? "Cukup" : "Sangat Kuat"}
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                style={{
                  width: "100%",
                  height: "38px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#F8FAFC",
                  padding: "0 12px",
                  fontSize: "12px",
                  outline: "none",
                }}
              />
            </div>

            {passwordError && (
              <div
                style={{
                  borderRadius: "8px",
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FECACA",
                  padding: "8px 12px",
                  fontSize: "12px",
                  color: "#B91C1C",
                }}
              >
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div
                style={{
                  borderRadius: "8px",
                  backgroundColor: "#DCFCE7",
                  border: "1px solid #BBF7D0",
                  padding: "8px 12px",
                  fontSize: "12px",
                  color: "#166534",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <CheckCircle2 style={{ width: "14px", height: "14px" }} />
                <span>Kata sandi baru berhasil disimpan!</span>
              </div>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#0F2E5C",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 800,
                border: "none",
                borderBottom: "3px solid #FFC000",
                cursor: passwordLoading ? "not-allowed" : "pointer",
              }}
            >
              <KeyRound style={{ width: "14px", height: "14px", color: "#FFC000" }} />
              <span>{passwordLoading ? "Memperbarui Sandi..." : "Perbarui Kata Sandi"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

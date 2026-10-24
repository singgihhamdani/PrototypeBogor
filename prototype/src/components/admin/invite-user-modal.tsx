"use client";
import { useState } from "react";
import { 
  X, Mail, User, Shield, Building2, Send, 
  Copy, Check, AlertCircle, Sparkles, FileSpreadsheet, Upload 
} from "lucide-react";
import { RoleCode, ROLE_CONFIGS, AdminBidangVariant } from "@/lib/auth-types";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export interface InviteFormData {
  namaLengkap: string;
  email: string;
  nip: string;
  jabatan: string;
  role: RoleCode;
  variant?: AdminBidangVariant;
  opdId: string;
  opdName: string;
}

export const DEFAULT_OPDS = [
  { id: "opd-dpu", kode: "DPU", nama: "Dinas Pekerjaan Umum" },
  { id: "opd-bappeda", kode: "BAPPEDA", nama: "Badan Perencanaan Pembangunan Daerah" },
  { id: "opd-bpkad", kode: "BPKAD", nama: "Badan Pengelolaan Keuangan dan Aset Daerah" },
  { id: "opd-disdik", kode: "DISDIK", nama: "Dinas Pendidikan" },
  { id: "opd-dinkes", kode: "DINKES", nama: "Dinas Kesehatan" },
];

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSuccess: (newUser: any) => void;
}

export default function InviteUserModal({ isOpen, onClose, onInviteSuccess }: InviteUserModalProps) {
  const [formData, setFormData] = useState<InviteFormData>({
    namaLengkap: "",
    email: "",
    nip: "",
    jabatan: "",
    role: "ADMIN_BIDANG",
    variant: "BINA_KONSTRUKSI",
    opdId: "opd-dpu",
    opdName: "Dinas Pekerjaan Umum",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successLink, setSuccessLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleRoleChange = (newRole: RoleCode) => {
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      variant: newRole === "ADMIN_BIDANG" ? "BINA_KONSTRUKSI" : undefined,
    }));
  };

  const handleOpdChange = (opdId: string) => {
    const selected = DEFAULT_OPDS.find((o) => o.id === opdId);
    setFormData((prev) => ({
      ...prev,
      opdId,
      opdName: selected ? selected.nama : "Dinas PU Kabupaten Bogor",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const hasSupabase = isSupabaseConfigured() && !!supabase;

      // Simulasi tautan pendaftaran/aktivasi
      const token = "inv_" + Math.random().toString(36).substring(2, 12);
      const generatedLink = typeof window !== "undefined"
        ? `${window.location.origin}/auth/set-password?token=${token}&email=${encodeURIComponent(formData.email)}`
        : `https://sijakon.bogor.go.id/auth/set-password?token=${token}`;

      if (hasSupabase && supabase) {
        // Simpan ke tabel user_invitations jika Supabase aktif
        try {
          await (supabase.from("user_invitations") as any).insert({
            email: formData.email,
            nama_lengkap: formData.namaLengkap,
            nip: formData.nip || null,
            role: formData.role,
            variant: formData.variant || null,
            status: "pending",
            token: token,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          });
        } catch (dbErr: any) {
          console.warn("[Invite] Gagal mencatat undangan ke Supabase:", dbErr?.message);
        }
      }

      const createdUser = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        username: formData.email.split("@")[0],
        name: formData.namaLengkap,
        email: formData.email,
        role: formData.role,
        roleLabel: ROLE_CONFIGS[formData.role]?.label || formData.role,
        variant: formData.variant,
        variantLabel: formData.variant ? formData.variant.replace("_", " ") : undefined,
        instansi: formData.opdName,
        opdId: formData.opdId,
        opdName: formData.opdName,
        nip: formData.nip,
        jabatan: formData.jabatan,
        status: "pending",
        inviteLink: generatedLink,
        createdAt: new Date().toISOString(),
        permissions: formData.role === "SUPER_ADMIN" ? ["*:*"] : ["dashboard:read"],
      };

      setSuccessLink(generatedLink);
      onInviteSuccess(createdUser);
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat memproses undangan.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (successLink && typeof navigator !== "undefined") {
      navigator.clipboard.writeText(successLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setSuccessLink(null);
    setFormData({
      namaLengkap: "",
      email: "",
      nip: "",
      jabatan: "",
      role: "ADMIN_BIDANG",
      variant: "BINA_KONSTRUKSI",
      opdId: "opd-dpu",
      opdName: "Dinas Pekerjaan Umum",
    });
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          backgroundColor: "#FFFFFF",
          borderRadius: "18px",
          boxShadow: "0 25px 50px -12px rgba(15, 46, 92, 0.25)",
          border: "1px solid #E2E8F0",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            backgroundColor: "#0F2E5C",
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "3px solid #FFC000",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 192, 0, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Send style={{ width: "18px", height: "18px", color: "#FFC000" }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#FFFFFF" }}>
                Undang Pengguna Baru
              </h3>
              <p style={{ margin: 0, fontSize: "11px", color: "rgba(255, 255, 255, 0.75)" }}>
                Pendaftaran Terkelola (Opsi A: Admin-Invited System)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            style={{
              background: "none",
              border: "none",
              color: "#CBD5E1",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
          {successLink ? (
            /* Success State */
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", textAlign: "center" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  backgroundColor: "#DCFCE7",
                  color: "#16A34A",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                }}
              >
                <Check style={{ width: "28px", height: "28px", strokeWidth: 3 }} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#0F172A" }}>
                  Undangan Berhasil Dibuat!
                </h4>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748B" }}>
                  Akun untuk <strong>{formData.namaLengkap}</strong> ({formData.email}) telah terdaftar dengan status <strong>Pending Aktivasi</strong>.
                </p>
              </div>

              {/* Invitation Link Box */}
              <div
                style={{
                  borderRadius: "12px",
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #CBD5E1",
                  padding: "12px 14px",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#334155" }}>
                  Tautan Aktivasi Akun (Berlaku 7 Hari):
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    readOnly
                    value={successLink}
                    style={{
                      flex: 1,
                      height: "36px",
                      borderRadius: "8px",
                      border: "1px solid #E2E8F0",
                      backgroundColor: "#FFFFFF",
                      padding: "0 10px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                      color: "#0F2E5C",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "0 14px",
                      height: "36px",
                      borderRadius: "8px",
                      backgroundColor: copied ? "#16A34A" : "#0F2E5C",
                      color: "#FFFFFF",
                      fontSize: "11px",
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    {copied ? <Check style={{ width: "14px", height: "14px" }} /> : <Copy style={{ width: "14px", height: "14px" }} />}
                    <span>{copied ? "Tersalin!" : "Salin Link"}</span>
                  </button>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "11px",
                  color: "#1E40AF",
                  textAlign: "left",
                  lineHeight: 1.4,
                }}
              >
                💡 <strong>Catatan Pengujian:</strong> Pengguna dapat mengklik tautan di atas untuk langsung diarahkan ke halaman pembuatan kata sandi baru (Set Password) dan masuk ke dashboard sesuai hak akses OPD miliknya.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "10px",
                    backgroundColor: "#0F2E5C",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: 800,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Selesai & Tutup
                </button>
              </div>
            </div>
          ) : (
            /* Invite Form */
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Notice */}
              <div
                style={{
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "11px",
                  color: "#475569",
                }}
              >
                <Sparkles style={{ width: "16px", height: "16px", color: "#0F2E5C", flexShrink: 0 }} />
                <span>
                  Admin menentukan <strong>NIP, Role, dan OPD</strong> sejak awal agar pengguna langsung terikat ke struktur organisasi perangkat daerah yang sah.
                </span>
              </div>

              {/* Row 1: Nama & NIP */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>
                    Nama Lengkap & Gelar *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.namaLengkap}
                    onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                    placeholder="Contoh: Budi Santoso, ST"
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
                    NIP Petugas (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="199005152020011002"
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
              </div>

              {/* Row 2: Email & Jabatan */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>
                    Email Kedinasan *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@sijakon.bogor.go.id"
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
                    Jabatan Struktural/Fungsional
                  </label>
                  <input
                    type="text"
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    placeholder="Contoh: Pengawas Jasa Konstruksi"
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
              </div>

              {/* Row 3: Role & OPD */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>
                    Tingkat Akses (Role) *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value as RoleCode)}
                    style={{
                      height: "38px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      backgroundColor: "#F8FAFC",
                      padding: "0 12px",
                      fontSize: "12px",
                      outline: "none",
                    }}
                  >
                    <option value="SUPER_ADMIN">Super Admin (DPU)</option>
                    <option value="ADMIN_BIDANG">Admin Bidang / Pengawas</option>
                    <option value="EKSEKUTIF">Eksekutif / Pimpinan</option>
                    <option value="OPERATOR_BUJK">Operator BUJK Rekanan</option>
                    <option value="PESERTA_TKK">Peserta Pelatihan TKK</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>
                    Satuan Kerja / OPD Terkait *
                  </label>
                  <select
                    value={formData.opdId}
                    onChange={(e) => handleOpdChange(e.target.value)}
                    style={{
                      height: "38px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      backgroundColor: "#F8FAFC",
                      padding: "0 12px",
                      fontSize: "12px",
                      outline: "none",
                    }}
                  >
                    {DEFAULT_OPDS.map((opd) => (
                      <option key={opd.id} value={opd.id}>
                        {opd.nama} ({opd.kode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Variant khusus ADMIN_BIDANG */}
              {formData.role === "ADMIN_BIDANG" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#0F2E5C", textTransform: "uppercase" }}>
                    Penugasan Bidang Teknis
                  </label>
                  <select
                    value={formData.variant || "BINA_KONSTRUKSI"}
                    onChange={(e) => setFormData({ ...formData, variant: e.target.value as AdminBidangVariant })}
                    style={{
                      height: "38px",
                      borderRadius: "8px",
                      border: "2px solid #0F2E5C",
                      backgroundColor: "#EFF6FF",
                      padding: "0 12px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#0F2E5C",
                      outline: "none",
                    }}
                  >
                    <option value="BINA_KONSTRUKSI">Seksi Pembinaan & Registrasi BUJK</option>
                    <option value="PENGAWAS_ASESOR">Tim Pengawas & Asesor Lapangan (SIMAK)</option>
                    <option value="PELATIHAN">Seksi Sertifikasi & Pelatihan Tenaga Kerja (SKK)</option>
                  </select>
                </div>
              )}

              {error && (
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
                  {error}
                </div>
              )}

              {/* Footer Actions */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "8px",
                  borderTop: "1px solid #F1F5F9",
                  paddingTop: "14px",
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    backgroundColor: "#F1F5F9",
                    color: "#475569",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 20px",
                    borderRadius: "10px",
                    backgroundColor: "#0F2E5C",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: 800,
                    border: "none",
                    borderBottom: "3px solid #FFC000",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  <Send style={{ width: "14px", height: "14px", color: "#FFC000" }} />
                  <span>{loading ? "Memproses Undangan..." : "Kirim Undangan Aktivasi"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

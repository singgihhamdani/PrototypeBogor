"use client";
import { useState, useEffect } from "react";
import { X, Edit, Save, ShieldAlert, KeyRound, Check } from "lucide-react";
import { RoleCode, ROLE_CONFIGS, AdminBidangVariant } from "@/lib/auth-types";
import { DEFAULT_OPDS } from "./invite-user-modal";

interface UserEditModalProps {
  isOpen: boolean;
  user: any | null;
  onClose: () => void;
  onSave: (updatedUser: any) => void;
  onResetPassword: (user: any) => void;
}

export default function UserEditModal({
  isOpen,
  user,
  onClose,
  onSave,
  onResetPassword,
}: UserEditModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    nip: "",
    email: "",
    jabatan: "",
    role: "ADMIN_BIDANG" as RoleCode,
    variant: "BINA_KONSTRUKSI" as AdminBidangVariant | undefined,
    opdId: "opd-dpu",
    opdName: "Dinas Pekerjaan Umum",
    status: "active" as "active" | "suspended" | "pending",
  });

  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        nip: user.nip || "",
        email: user.email || "",
        jabatan: user.jabatan || "",
        role: user.role || "ADMIN_BIDANG",
        variant: user.variant || undefined,
        opdId: user.opdId || "opd-dpu",
        opdName: user.instansi || user.opdName || "Dinas Pekerjaan Umum",
        status: user.status || "active",
      });
      setResetSent(false);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...user,
      name: formData.name,
      nip: formData.nip,
      email: formData.email,
      jabatan: formData.jabatan,
      role: formData.role,
      roleLabel: ROLE_CONFIGS[formData.role]?.label || formData.role,
      variant: formData.variant,
      variantLabel: formData.variant ? formData.variant.replace("_", " ") : undefined,
      instansi: formData.opdName,
      opdId: formData.opdId,
      opdName: formData.opdName,
      status: formData.status,
    };
    onSave(updated);
  };

  const handleOpdChange = (opdId: string) => {
    const selected = DEFAULT_OPDS.find((o) => o.id === opdId);
    setFormData((prev) => ({
      ...prev,
      opdId,
      opdName: selected ? selected.nama : "Dinas PU Kabupaten Bogor",
    }));
  };

  const triggerResetPassword = () => {
    onResetPassword(user);
    setResetSent(true);
    setTimeout(() => setResetSent(false), 3000);
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
          maxWidth: "540px",
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
        {/* Header */}
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
              <Edit style={{ width: "18px", height: "18px", color: "#FFC000" }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#FFFFFF" }}>
                Edit Pengguna & Penugasan OPD
              </h3>
              <p style={{ margin: 0, fontSize: "11px", color: "rgba(255, 255, 255, 0.75)" }}>
                ID: {user.id} • {user.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
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

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Row 1: Nama & NIP */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                NIP
              </label>
              <input
                type="text"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
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
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                Jabatan
              </label>
              <input
                type="text"
                value={formData.jabatan}
                onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
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
                Role Akses
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleCode })}
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
                Satuan Kerja / OPD
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

          {/* Variant jika ADMIN_BIDANG */}
          {formData.role === "ADMIN_BIDANG" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#0F2E5C", textTransform: "uppercase" }}>
                Penugasan Bidang
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

          {/* Status Akun */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>
              Status Keanggotaan
            </label>
            <div style={{ display: "flex", gap: "12px" }}>
              {[
                { id: "active", label: "Aktif", bg: "#DCFCE7", text: "#166534" },
                { id: "suspended", label: "Ditangguhkan (Suspended)", bg: "#FEE2E2", text: "#991B1B" },
                { id: "pending", label: "Pending Aktivasi", bg: "#FEF3C7", text: "#92400E" },
              ].map((s) => (
                <label
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  <input
                    type="radio"
                    name="status"
                    checked={formData.status === s.id}
                    onChange={() => setFormData({ ...formData, status: s.id as any })}
                  />
                  <span>{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Reset Password */}
          <div
            style={{
              borderRadius: "10px",
              backgroundColor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#334155" }}>
                Pemulihan Sandi Pengguna
              </div>
              <div style={{ fontSize: "10px", color: "#64748B" }}>
                Kirim tautan reset kata sandi ke email pengguna
              </div>
            </div>
            <button
              type="button"
              onClick={triggerResetPassword}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                backgroundColor: resetSent ? "#16A34A" : "#FFFFFF",
                border: "1px solid #CBD5E1",
                color: resetSent ? "#FFFFFF" : "#0F2E5C",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {resetSent ? <Check style={{ width: "12px", height: "12px" }} /> : <KeyRound style={{ width: "12px", height: "12px" }} />}
              <span>{resetSent ? "Terkirim!" : "Kirim Reset Sandi"}</span>
            </button>
          </div>

          {/* Footer Buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "10px",
              borderTop: "1px solid #F1F5F9",
              paddingTop: "14px",
              marginTop: "4px",
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
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 20px",
                borderRadius: "10px",
                backgroundColor: "#0F2E5C",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 800,
                border: "none",
                borderBottom: "3px solid #FFC000",
                cursor: "pointer",
              }}
            >
              <Save style={{ width: "14px", height: "14px", color: "#FFC000" }} />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect, useMemo } from "react";
import { 
  Users, UserPlus, Search, Filter, ShieldCheck, Building2, 
  CheckCircle2, Clock, AlertTriangle, Edit, Trash2, KeyRound, 
  Send, Copy, Check, MoreVertical, RefreshCw, Mail, ExternalLink, ShieldAlert
} from "lucide-react";
import { RoleCode, ROLE_CONFIGS, DEMO_USERS, User } from "@/lib/auth-types";
import { useAuth } from "@/lib/mock-auth";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import InviteUserModal, { DEFAULT_OPDS } from "./invite-user-modal";
import UserEditModal from "./user-edit-modal";

// Initial seed users berbasis 6 demo persona + penugasan OPD
const INITIAL_USERS = [
  {
    id: "USR-01",
    username: "superadmin",
    name: "Ir. H. Raden Ridwan, ST, M.Si",
    email: "admin@sijakon.bogor.go.id",
    nip: "197508121998031004",
    role: "SUPER_ADMIN" as RoleCode,
    roleLabel: "Super Admin DPU",
    instansi: "Dinas Pekerjaan Umum",
    opdId: "opd-dpu",
    opdName: "Dinas Pekerjaan Umum",
    jabatan: "Kepala Bidang Bina Konstruksi",
    status: "active",
    createdAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "USR-02",
    username: "op_binkon",
    name: "Bayu Pratama, S.Kom",
    email: "binkon@sijakon.bogor.go.id",
    nip: "199204142019021003",
    role: "ADMIN_BIDANG" as RoleCode,
    roleLabel: "Admin Bidang (Bina Konstruksi)",
    variant: "BINA_KONSTRUKSI",
    variantLabel: "Seksi Bina Konstruksi",
    instansi: "Dinas Pekerjaan Umum",
    opdId: "opd-dpu",
    opdName: "Dinas Pekerjaan Umum",
    jabatan: "Staf Teknis Pembinaan Jakon",
    status: "active",
    createdAt: "2026-01-15T09:30:00Z",
  },
  {
    id: "USR-03",
    username: "op_pengawas",
    name: "Ir. Supriyatna, ST",
    email: "pengawas@sijakon.bogor.go.id",
    nip: "198306202008011007",
    role: "ADMIN_BIDANG" as RoleCode,
    roleLabel: "Admin Bidang (Tim Pengawas / Asesor)",
    variant: "PENGAWAS_ASESOR",
    variantLabel: "Tim Pengawas & Asesor Lapangan",
    instansi: "Dinas Pekerjaan Umum",
    opdId: "opd-dpu",
    opdName: "Dinas Pekerjaan Umum",
    jabatan: "Pejabat Fungsional Pembina Jasa Konstruksi",
    status: "active",
    createdAt: "2026-01-20T11:00:00Z",
  },
  {
    id: "USR-04",
    username: "eksekutif",
    name: "Drs. H. Suryanto Putra, M.Si",
    email: "kadis@sijakon.bogor.go.id",
    nip: "196811051994031002",
    role: "EKSEKUTIF" as RoleCode,
    roleLabel: "Pimpinan Eksekutif DPU",
    instansi: "Dinas Pekerjaan Umum",
    opdId: "opd-dpu",
    opdName: "Dinas Pekerjaan Umum",
    jabatan: "Kepala Dinas PU",
    status: "active",
    createdAt: "2026-01-05T07:45:00Z",
  },
  {
    id: "USR-05",
    username: "bujk_demo",
    name: "Budi Santoso, ST",
    email: "admin@ptbangunjaya.co.id",
    nip: "—",
    role: "OPERATOR_BUJK" as RoleCode,
    roleLabel: "Operator BUJK Rekanan",
    bujkId: "BUJK-001",
    bujkName: "PT Bangun Jaya Konstruksi",
    instansi: "PT Bangun Jaya Konstruksi",
    opdId: "opd-dpu",
    opdName: "Dinas Pekerjaan Umum",
    jabatan: "Penanggung Jawab Teknis Badan Usaha (PJTBU)",
    status: "active",
    createdAt: "2026-02-01T14:10:00Z",
  },
  {
    id: "USR-06",
    username: "peserta_demo",
    name: "Ahmad Fauzi, A.Md",
    email: "ahmad.fauzi@gmail.com",
    nip: "—",
    role: "PESERTA_TKK" as RoleCode,
    roleLabel: "Peserta Pelatihan TKK",
    instansi: "Mandiri / Asosiasi Tenaga Kerja",
    opdId: "opd-dpu",
    opdName: "Dinas Pekerjaan Umum",
    jabatan: "Pelaksana Lapangan Pekerjaan Gedung",
    status: "active",
    createdAt: "2026-02-10T10:20:00Z",
  },
];

export default function UserManagementView() {
  const { isSupabase, resetPassword } = useAuth();
  const [users, setUsers] = useState<any[]>(INITIAL_USERS);
  const [activeTab, setActiveTab] = useState<"users" | "invitations">("users");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [opdFilter, setOpdFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modals
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load stored users from localStorage
  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("sijakon_users_list_v2") : null;
      if (stored) {
        setUsers(JSON.parse(stored));
      }
    } catch {
      setUsers(INITIAL_USERS);
    }
  }, []);

  const saveUsers = (updatedList: any[]) => {
    setUsers(updatedList);
    if (typeof window !== "undefined") {
      localStorage.setItem("sijakon_users_list_v2", JSON.stringify(updatedList));
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handlers
  const handleInviteSuccess = (newUser: any) => {
    const updated = [newUser, ...users];
    saveUsers(updated);
    showToast(`Undangan untuk ${newUser.name} (${newUser.email}) berhasil dibuat.`);
  };

  const handleSaveEdit = (updatedUser: any) => {
    const updated = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    saveUsers(updated);
    setEditingUser(null);
    showToast(`Data pengguna ${updatedUser.name} berhasil diperbarui.`);
  };

  const handleToggleStatus = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const newStatus = target.status === "active" ? "suspended" : "active";
    const updated = users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u));
    saveUsers(updated);
    showToast(`Status pengguna ${target.name} diubah menjadi "${newStatus}".`);
  };

  const handleResetPasswordAction = async (userObj: any) => {
    const res = await resetPassword(userObj.email);
    showToast(res.message);
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (activeTab === "invitations" && u.status !== "pending") return false;
      if (activeTab === "users" && u.status === "pending") return false;

      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.nip && u.nip.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.jabatan && u.jabatan.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchesOpd = opdFilter === "ALL" || u.opdId === opdFilter;
      const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesOpd && matchesStatus;
    });
  }, [users, activeTab, searchQuery, roleFilter, opdFilter, statusFilter]);

  // Statistics
  const activeCount = users.filter((u) => u.status === "active").length;
  const pendingCount = users.filter((u) => u.status === "pending").length;
  const suspendedCount = users.filter((u) => u.status === "suspended").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: "#0F2E5C",
            color: "#FFFFFF",
            borderLeft: "4px solid #FFC000",
            borderRadius: "10px",
            padding: "12px 20px",
            fontSize: "12px",
            fontWeight: 700,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <CheckCircle2 style={{ width: "16px", height: "16px", color: "#FFC000" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div
        style={{
          borderRadius: "18px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              backgroundColor: "#EBF2FA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Users style={{ width: "22px", height: "22px", color: "#0F2E5C" }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
                Manajemen Pengguna & Penugasan OPD
              </h2>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  backgroundColor: isSupabase ? "#DCFCE7" : "#F1F5F9",
                  color: isSupabase ? "#166534" : "#475569",
                  padding: "3px 8px",
                  borderRadius: "9999px",
                  border: isSupabase ? "1px solid #BBF7D0" : "1px solid #CBD5E1",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    backgroundColor: isSupabase ? "#22C55E" : "#94A3B8",
                  }}
                />
                {isSupabase ? "Supabase Live Auth" : "Demo Mode Mock"}
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
              Skema Pendaftaran Terkelola (Opsi A: Admin-Invited) dengan Pemetaan Struktur OPD Kabupaten Bogor
            </p>
          </div>
        </div>

        {/* Action Button: Invite User */}
        <button
          type="button"
          onClick={() => setIsInviteOpen(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#0F2E5C",
            color: "#FFFFFF",
            padding: "10px 18px",
            borderRadius: "12px",
            border: "none",
            borderBottom: "3px solid #FFC000",
            fontSize: "12px",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(15, 46, 92, 0.2)",
          }}
        >
          <UserPlus style={{ width: "15px", height: "15px", color: "#FFC000" }} />
          <span>+ Undang Pengguna Baru</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
        {[
          { label: "Pengguna Aktif", count: activeCount, icon: CheckCircle2, color: "#16A34A", bg: "#F0FDF4" },
          { label: "Undangan Pending", count: pendingCount, icon: Clock, color: "#D97706", bg: "#FFFBEB" },
          { label: "Akun Ditangguhkan", count: suspendedCount, icon: AlertTriangle, color: "#DC2626", bg: "#FEF2F2" },
          { label: "Total OPD Terhubung", count: DEFAULT_OPDS.length, icon: Building2, color: "#2563EB", bg: "#EFF6FF" },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              style={{
                borderRadius: "14px",
                border: "1px solid #E2E8F0",
                backgroundColor: "#FFFFFF",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  backgroundColor: kpi.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon style={{ width: "20px", height: "20px", color: kpi.color }} />
              </div>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", display: "block" }}>
                  {kpi.label}
                </span>
                <span style={{ fontSize: "20px", fontWeight: 900, color: "#0F172A" }}>
                  {kpi.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs & Search Filter Controls */}
      <div
        style={{
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {/* Tab Switcher */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setActiveTab("users")}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
                backgroundColor: activeTab === "users" ? "#0F2E5C" : "#F1F5F9",
                color: activeTab === "users" ? "#FFFFFF" : "#475569",
              }}
            >
              Pengguna Terdaftar ({activeCount + suspendedCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("invitations")}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
                backgroundColor: activeTab === "invitations" ? "#0F2E5C" : "#F1F5F9",
                color: activeTab === "invitations" ? "#FFFFFF" : "#475569",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>Undangan Menunggu</span>
              {pendingCount > 0 && (
                <span
                  style={{
                    backgroundColor: "#FFC000",
                    color: "#0F2E5C",
                    fontSize: "10px",
                    fontWeight: 900,
                    padding: "1px 6px",
                    borderRadius: "9999px",
                  }}
                >
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          <span style={{ fontSize: "11px", color: "#64748B" }}>
            Menampilkan <strong>{filteredUsers.length}</strong> data pengguna
          </span>
        </div>

        {/* Filter Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "14px",
                height: "14px",
                color: "#94A3B8",
              }}
            />
            <input
              type="text"
              placeholder="Cari nama, NIP, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                height: "36px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#F8FAFC",
                paddingLeft: "32px",
                paddingRight: "10px",
                fontSize: "11px",
                outline: "none",
              }}
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              height: "36px",
              borderRadius: "8px",
              border: "1px solid #CBD5E1",
              backgroundColor: "#F8FAFC",
              padding: "0 10px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#334155",
              outline: "none",
            }}
          >
            <option value="ALL">Semua Role</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN_BIDANG">Admin Bidang / Pengawas</option>
            <option value="EKSEKUTIF">Eksekutif / Pimpinan</option>
            <option value="OPERATOR_BUJK">Operator BUJK</option>
            <option value="PESERTA_TKK">Peserta TKK</option>
          </select>

          {/* OPD Filter */}
          <select
            value={opdFilter}
            onChange={(e) => setOpdFilter(e.target.value)}
            style={{
              height: "36px",
              borderRadius: "8px",
              border: "1px solid #CBD5E1",
              backgroundColor: "#F8FAFC",
              padding: "0 10px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#334155",
              outline: "none",
            }}
          >
            <option value="ALL">Semua Satuan Kerja (OPD)</option>
            {DEFAULT_OPDS.map((opd) => (
              <option key={opd.id} value={opd.id}>
                {opd.nama} ({opd.kode})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              height: "36px",
              borderRadius: "8px",
              border: "1px solid #CBD5E1",
              backgroundColor: "#F8FAFC",
              padding: "0 10px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#334155",
              outline: "none",
            }}
          >
            <option value="ALL">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="suspended">Ditangguhkan</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div
        style={{
          borderRadius: "18px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0", textAlign: "left" }}>
                <th style={{ padding: "12px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px" }}>
                  PENGGUNA & NIP
                </th>
                <th style={{ padding: "12px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px" }}>
                  ROLE & PENUGASAN
                </th>
                <th style={{ padding: "12px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px" }}>
                  SATUAN KERJA (OPD)
                </th>
                <th style={{ padding: "12px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px" }}>
                  EMAIL & JABATAN
                </th>
                <th style={{ padding: "12px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", textAlign: "center" }}>
                  STATUS
                </th>
                <th style={{ padding: "12px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", textAlign: "right" }}>
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px 20px", textAlign: "center", color: "#64748B" }}>
                    <Users style={{ width: "36px", height: "36px", color: "#CBD5E1", margin: "0 auto 8px auto" }} />
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "13px", color: "#334155" }}>
                      Tidak ada pengguna yang sesuai dengan filter
                    </p>
                    <p style={{ margin: "4px 0 0 0", fontSize: "11px" }}>
                      Coba sesuaikan kata kunci pencarian atau reset filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => {
                  const meta = ROLE_CONFIGS[u.role as RoleCode] || ROLE_CONFIGS.EKSEKUTIF;
                  const isPending = u.status === "pending";
                  const isSuspended = u.status === "suspended";

                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: "1px solid #F1F5F9",
                        backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC",
                      }}
                    >
                      {/* Nama & NIP */}
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "50%",
                              backgroundColor: meta.badgeBg,
                              color: meta.badgeText,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 900,
                              fontSize: "12px",
                              flexShrink: 0,
                            }}
                          >
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 800, color: "#0F172A", fontSize: "13px" }}>
                              {u.name}
                            </p>
                            <span style={{ fontSize: "11px", color: "#64748B", fontFamily: "monospace" }}>
                              {u.nip && u.nip !== "—" ? `NIP: ${u.nip}` : u.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role & Penugasan */}
                      <td style={{ padding: "14px 18px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "11px",
                            fontWeight: 800,
                            backgroundColor: meta.badgeBg,
                            color: meta.badgeText,
                            padding: "3px 10px",
                            borderRadius: "9999px",
                          }}
                        >
                          {u.roleLabel || meta.label}
                        </span>
                        {u.variantLabel && (
                          <span
                            style={{
                              display: "block",
                              fontSize: "10px",
                              color: "#0F2E5C",
                              fontWeight: 700,
                              marginTop: "3px",
                            }}
                          >
                            {u.variantLabel}
                          </span>
                        )}
                      </td>

                      {/* Satuan Kerja (OPD) */}
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Building2 style={{ width: "14px", height: "14px", color: "#0F2E5C" }} />
                          <span style={{ fontWeight: 700, color: "#1E293B" }}>
                            {u.opdName || u.instansi || "Dinas Pekerjaan Umum"}
                          </span>
                        </div>
                      </td>

                      {/* Email & Jabatan */}
                      <td style={{ padding: "14px 18px" }}>
                        <p style={{ margin: 0, color: "#0F172A", fontWeight: 600 }}>{u.email}</p>
                        <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748B" }}>
                          {u.jabatan || "Staff Kedinasan"}
                        </p>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 18px", textAlign: "center" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "10px",
                            fontWeight: 800,
                            padding: "3px 10px",
                            borderRadius: "9999px",
                            backgroundColor: isPending ? "#FEF3C7" : isSuspended ? "#FEE2E2" : "#DCFCE7",
                            color: isPending ? "#92400E" : isSuspended ? "#991B1B" : "#166534",
                          }}
                        >
                          <span
                            style={{
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              backgroundColor: isPending ? "#F59E0B" : isSuspended ? "#EF4444" : "#10B981",
                            }}
                          />
                          {isPending ? "Pending" : isSuspended ? "Suspended" : "Aktif"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 18px", textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                          {isPending && u.inviteLink && (
                            <button
                              type="button"
                              onClick={() => {
                                if (typeof navigator !== "undefined") {
                                  navigator.clipboard.writeText(u.inviteLink);
                                  showToast(`Link aktivasi untuk ${u.name} berhasil disalin!`);
                                }
                              }}
                              title="Salin Link Aktivasi Undangan"
                              style={{
                                padding: "6px 8px",
                                borderRadius: "6px",
                                border: "1px solid #CBD5E1",
                                backgroundColor: "#FFFFFF",
                                color: "#0F2E5C",
                                cursor: "pointer",
                                fontSize: "11px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <Copy style={{ width: "12px", height: "12px" }} />
                              <span>Link</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setEditingUser(u)}
                            title="Edit Data Pengguna & OPD"
                            style={{
                              padding: "6px 10px",
                              borderRadius: "6px",
                              border: "1px solid #CBD5E1",
                              backgroundColor: "#FFFFFF",
                              color: "#0F2E5C",
                              cursor: "pointer",
                              fontSize: "11px",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Edit style={{ width: "12px", height: "12px" }} />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u.id)}
                            title={isSuspended ? "Aktifkan Akun" : "Tangguhkan (Suspend) Akun"}
                            style={{
                              padding: "6px 10px",
                              borderRadius: "6px",
                              border: isSuspended ? "1px solid #BBF7D0" : "1px solid #FECACA",
                              backgroundColor: isSuspended ? "#F0FDF4" : "#FEF2F2",
                              color: isSuspended ? "#166534" : "#B91C1C",
                              cursor: "pointer",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            {isSuspended ? "Aktifkan" : "Suspend"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <InviteUserModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onInviteSuccess={handleInviteSuccess}
      />

      <UserEditModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveEdit}
        onResetPassword={handleResetPasswordAction}
      />
    </div>
  );
}

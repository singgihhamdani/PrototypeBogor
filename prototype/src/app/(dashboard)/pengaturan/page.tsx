"use client";
import { useState } from "react";
import { 
  Settings, Users, KeyRound, Shield, RefreshCw, CheckCircle2, 
  Save, Globe, Bell, Lock, Server, Plus, Sparkles, Check, X,
  SlidersHorizontal, Crown, Building2, ClipboardCheck, GraduationCap, ShieldAlert
} from "lucide-react";
import { RoleCode, ROLE_CONFIGS, DEMO_USERS } from "@/lib/auth-types";

const RESOURCES = [
  "DASHBOARD", "BUJK", "SBU", "PROJECT", "SUPERVISION", 
  "TRAINING", "PARTICIPANT", "CERTIFICATE", "REGULATION", 
  "NEWS", "USER", "ROLE", "AUDIT_LOG", "GIS", "REPORT"
] as const;

const ACTIONS = [
  "CREATE", "READ", "UPDATE", "DELETE", "VERIFY", "EXPORT", "AUDIT"
] as const;

// Default initial permissions per role
const INITIAL_ROLE_PERMS: Record<RoleCode, Set<string>> = {
  SUPER_ADMIN: new Set(
    RESOURCES.flatMap(r => ACTIONS.map(a => `${r}:${a}`))
  ),
  ADMIN_BIDANG: new Set([
    "DASHBOARD:READ",
    "BUJK:CREATE", "BUJK:READ", "BUJK:UPDATE", "BUJK:VERIFY", "BUJK:EXPORT",
    "SBU:READ", "SBU:VERIFY", "SBU:EXPORT",
    "PROJECT:CREATE", "PROJECT:READ", "PROJECT:UPDATE", "PROJECT:EXPORT",
    "SUPERVISION:CREATE", "SUPERVISION:READ", "SUPERVISION:UPDATE", "SUPERVISION:AUDIT", "SUPERVISION:EXPORT",
    "TRAINING:READ", "TRAINING:VERIFY",
    "GIS:READ", "GIS:EXPORT",
    "REPORT:READ", "REPORT:EXPORT",
    "REGULATION:READ", "NEWS:READ",
  ]),
  EKSEKUTIF: new Set([
    "DASHBOARD:READ",
    "BUJK:READ", "BUJK:EXPORT",
    "SBU:READ", "SBU:EXPORT",
    "PROJECT:READ", "PROJECT:EXPORT",
    "SUPERVISION:READ", "SUPERVISION:EXPORT",
    "TRAINING:READ", "TRAINING:EXPORT",
    "REPORT:READ", "REPORT:EXPORT",
    "GIS:READ", "GIS:EXPORT",
    "REGULATION:READ", "NEWS:READ",
  ]),
  OPERATOR_BUJK: new Set([
    "DASHBOARD:READ",
    "BUJK:READ", "BUJK:UPDATE",
    "SBU:READ", "SBU:UPDATE",
    "PROJECT:READ", "PROJECT:UPDATE",
    "SUPERVISION:READ",
    "REGULATION:READ", "NEWS:READ",
  ]),
  PESERTA_TKK: new Set([
    "DASHBOARD:READ",
    "TRAINING:READ",
    "PARTICIPANT:READ", "PARTICIPANT:UPDATE",
    "CERTIFICATE:READ", "CERTIFICATE:EXPORT",
    "REGULATION:READ", "NEWS:READ",
  ]),
};

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState<"api" | "users" | "rbac" | "general">("rbac");
  const [apiKey, setApiKey] = useState("spjk_bogor_live_99a82f710c3b4e");
  const [autoSync, setAutoSync] = useState(true);
  const [saved, setSaved] = useState(false);

  // RBAC State
  const [selectedRole, setSelectedRole] = useState<RoleCode>("ADMIN_BIDANG");
  const [rolePermissions, setRolePermissions] = useState<Record<RoleCode, Set<string>>>(INITIAL_ROLE_PERMS);
  const [rbacSaved, setRbacSaved] = useState(false);

  const togglePermission = (role: RoleCode, resource: string, action: string) => {
    const key = `${resource}:${action}`;
    setRolePermissions(prev => {
      const currentSet = new Set(prev[role]);
      if (currentSet.has(key)) {
        currentSet.delete(key);
      } else {
        currentSet.add(key);
      }
      return { ...prev, [role]: currentSet };
    });
  };

  const applyPreset = (presetType: "PENGAWAS" | "BINKON" | "PELATIHAN") => {
    setRolePermissions(prev => {
      const newSet = new Set<string>();
      newSet.add("DASHBOARD:READ");
      newSet.add("REGULATION:READ");
      newSet.add("NEWS:READ");

      if (presetType === "PENGAWAS") {
        ["SUPERVISION", "PROJECT", "BUJK", "GIS", "REPORT"].forEach(res => {
          newSet.add(`${res}:READ`);
          newSet.add(`${res}:EXPORT`);
        });
        newSet.add("SUPERVISION:CREATE");
        newSet.add("SUPERVISION:UPDATE");
        newSet.add("SUPERVISION:AUDIT");
      } else if (presetType === "BINKON") {
        ["BUJK", "SBU", "PROJECT", "GIS", "REPORT"].forEach(res => {
          newSet.add(`${res}:CREATE`);
          newSet.add(`${res}:READ`);
          newSet.add(`${res}:UPDATE`);
          newSet.add(`${res}:VERIFY`);
          newSet.add(`${res}:EXPORT`);
        });
      } else if (presetType === "PELATIHAN") {
        ["TRAINING", "PARTICIPANT", "CERTIFICATE", "REPORT"].forEach(res => {
          newSet.add(`${res}:CREATE`);
          newSet.add(`${res}:READ`);
          newSet.add(`${res}:UPDATE`);
          newSet.add(`${res}:VERIFY`);
          newSet.add(`${res}:EXPORT`);
        });
      }

      return { ...prev, ADMIN_BIDANG: newSet };
    });
    alert(`Preset "${presetType}" berhasil diterapkan pada role ADMIN_BIDANG.`);
  };

  const handleSaveRbac = () => {
    setRbacSaved(true);
    setTimeout(() => setRbacSaved(false), 2500);
  };

  const handleSaveApi = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const currentRoleSet = rolePermissions[selectedRole] || new Set();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <Settings style={{ width: "12px", height: "12px" }} /> Konfigurasi Sistem & RBAC
          </span>
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
          Pengaturan Sistem, Hak Akses & Integrasi SIPJAKI
        </h1>
        <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
          Manajemen kredensial API Kementerian PUPR, matriks hak akses 6 role granular, serta preferensi akun dinas
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #E2E8F0", paddingBottom: "10px", flexWrap: "wrap" }}>
        {[
          { id: "rbac", label: "Matriks Hak Akses & Role (RBAC)", icon: SlidersHorizontal },
          { id: "users", label: "Manajemen Pengguna (6 Akun Demo)", icon: Users },
          { id: "api", label: "Integrasi API SIPJAKI", icon: Server },
          { id: "general", label: "Preferensi Umum", icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSel = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 18px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
                backgroundColor: isSel ? "#0F2E5C" : "transparent",
                color: isSel ? "#FFFFFF" : "#64748B",
                boxShadow: isSel ? "0 2px 6px rgba(15, 46, 92, 0.2)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              <Icon style={{ width: "14px", height: "14px", color: isSel ? "#FFC000" : "#94A3B8" }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: RBAC Permission Matrix */}
      {activeTab === "rbac" && (
        <div 
          style={{
            borderRadius: "18px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: "24px 28px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}
        >
          {/* Header Role Selector */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", borderBottom: "1px solid #F1F5F9", paddingBottom: "16px" }}>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                Matriks Hak Akses Granular (15 Resource × 7 Action)
              </h2>
              <p style={{ fontSize: "12px", color: "#64748B", margin: "3px 0 0 0" }}>
                Pilih peran di bawah ini untuk melihat dan mengonfigurasi izin akses:
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={handleSaveRbac}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  borderRadius: "10px",
                  backgroundColor: "#0F2E5C",
                  border: "none",
                  borderBottom: "3px solid #FFC000",
                  padding: "8px 18px",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(15, 46, 92, 0.2)"
                }}
              >
                {rbacSaved ? <CheckCircle2 style={{ width: "15px", height: "15px", color: "#FFC000" }} /> : <Save style={{ width: "15px", height: "15px" }} />}
                <span>{rbacSaved ? "Matriks Disimpan!" : "Simpan Konfigurasi RBAC"}</span>
              </button>
            </div>
          </div>

          {/* Role Pills */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {(["SUPER_ADMIN", "ADMIN_BIDANG", "EKSEKUTIF", "OPERATOR_BUJK", "PESERTA_TKK"] as RoleCode[]).map((rCode) => {
              const meta = ROLE_CONFIGS[rCode];
              const isSelected = selectedRole === rCode;
              return (
                <button
                  key={rCode}
                  type="button"
                  onClick={() => setSelectedRole(rCode)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    borderRadius: "12px",
                    border: isSelected ? "2px solid #0F2E5C" : "1px solid #CBD5E1",
                    backgroundColor: isSelected ? meta.badgeBg : "#F8FAFC",
                    color: isSelected ? meta.badgeText : "#475569",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 800
                  }}
                >
                  <span>{meta.label}</span>
                  <span
                    style={{
                      fontSize: "10px",
                      padding: "1px 6px",
                      borderRadius: "9999px",
                      backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : "#E2E8F0",
                      color: isSelected ? "#FFFFFF" : "#64748B"
                    }}
                  >
                    {rolePermissions[rCode]?.size || 0} Izin
                  </span>
                </button>
              );
            })}
          </div>

          {/* Preset Buttons for ADMIN_BIDANG */}
          {selectedRole === "ADMIN_BIDANG" && (
            <div 
              style={{
                borderRadius: "12px",
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles style={{ width: "16px", height: "16px", color: "#F59E0B" }} />
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C" }}>
                  Terapkan Template Preset Varian Admin Bidang:
                </span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => applyPreset("PENGAWAS")}
                  style={{ fontSize: "11px", fontWeight: 700, color: "#0F2E5C", backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", padding: "4px 12px", borderRadius: "8px", cursor: "pointer" }}
                >
                  Preset Tim Pengawas / Asesor
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("BINKON")}
                  style={{ fontSize: "11px", fontWeight: 700, color: "#0F2E5C", backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", padding: "4px 12px", borderRadius: "8px", cursor: "pointer" }}
                >
                  Preset Bina Konstruksi
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("PELATIHAN")}
                  style={{ fontSize: "11px", fontWeight: 700, color: "#0F2E5C", backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", padding: "4px 12px", borderRadius: "8px", cursor: "pointer" }}
                >
                  Preset Pelatihan TKK
                </button>
              </div>
            </div>
          )}

          {/* Matrix Grid */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", textAlign: "center" }}>
              <thead>
                <tr style={{ backgroundColor: "#0F2E5C", color: "#FFFFFF" }}>
                  <th style={{ padding: "10px 14px", textAlign: "left", width: "180px", fontWeight: 800 }}>RESOURCE / MODUL</th>
                  {ACTIONS.map(action => (
                    <th key={action} style={{ padding: "10px 12px", fontWeight: 800 }}>{action}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RESOURCES.map((resource, idx) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <tr key={resource} style={{ backgroundColor: isEven ? "#FFFFFF" : "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                      <td style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#1E293B" }}>
                        {resource}
                      </td>
                      {ACTIONS.map(action => {
                        const permKey = `${resource}:${action}`;
                        const isGranted = currentRoleSet.has(permKey);
                        const isSuper = selectedRole === "SUPER_ADMIN";

                        return (
                          <td key={action} style={{ padding: "8px 10px" }}>
                            <button
                              type="button"
                              disabled={isSuper} // Super admin is always full access
                              onClick={() => togglePermission(selectedRole, resource, action)}
                              style={{
                                width: "26px",
                                height: "26px",
                                borderRadius: "6px",
                                border: isGranted ? "1px solid #10B981" : "1px solid #CBD5E1",
                                backgroundColor: isGranted ? "#ECFDF5" : "#FFFFFF",
                                color: isGranted ? "#059669" : "#CBD5E1",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: isSuper ? "default" : "pointer"
                              }}
                            >
                              {isGranted ? <Check style={{ width: "14px", height: "14px", strokeWidth: 3 }} /> : <span style={{ fontSize: "10px" }}>—</span>}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Users Management (6 Demo Users) */}
      {activeTab === "users" && (
        <div style={{ borderRadius: "18px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", overflow: "hidden", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>Daftar 6 Akun Demo Persona</h2>
              <p style={{ fontSize: "12px", color: "#64748B", margin: "3px 0 0 0" }}>Setiap akun merepresentasikan 1 role dalam arsitektur 6-Tier SIJAKON</p>
            </div>
            <button
              type="button"
              onClick={() => alert("Tambah Pengguna: Form terintegrasi dengan tabel roles dan role_permissions.")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "10px",
                backgroundColor: "#0F2E5C",
                border: "none",
                borderBottom: "3px solid #FFC000",
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: 800,
                color: "#FFFFFF",
                cursor: "pointer"
              }}
            >
              <Plus style={{ width: "14px", height: "14px", color: "#FFC000" }} /> Tambah Pengguna Baru
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0", textAlign: "left" }}>
                  <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px" }}>NAMA & ID</th>
                  <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px" }}>ROLE / PERAN</th>
                  <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px" }}>INSTANSI / TENANT</th>
                  <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px" }}>EMAIL DEMO</th>
                  <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", textAlign: "center" }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(DEMO_USERS).map((u) => {
                  const meta = ROLE_CONFIGS[u.role];
                  return (
                    <tr key={u.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "16px 18px" }}>
                        <p style={{ fontWeight: 800, color: "#0F172A", margin: 0, fontSize: "13px" }}>{u.name}</p>
                        <p style={{ fontSize: "11px", fontFamily: "monospace", color: "#64748B", margin: "2px 0 0 0" }}>{u.id} • {u.username}</p>
                      </td>
                      <td style={{ padding: "16px 18px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 800, backgroundColor: meta.badgeBg, color: meta.badgeText, padding: "3px 10px", borderRadius: "9999px" }}>
                          {u.roleLabel}
                        </span>
                        {u.variantLabel && (
                          <span style={{ display: "block", fontSize: "10px", color: "#0F2E5C", fontWeight: 700, marginTop: "4px" }}>
                            {u.variantLabel}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "16px 18px", color: "#475569" }}>
                        <span style={{ fontWeight: 700, color: "#1E293B" }}>{u.bujkName || u.instansi}</span>
                        <span style={{ display: "block", fontSize: "10px", color: "#94A3B8" }}>{u.jabatan}</span>
                      </td>
                      <td style={{ padding: "16px 18px", color: "#475569", fontFamily: "monospace" }}>
                        {u.email}
                      </td>
                      <td style={{ padding: "16px 18px", textAlign: "center" }}>
                        <span style={{ display: "inline-block", backgroundColor: "#ECFDF5", color: "#059669", padding: "3px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: 800 }}>
                          Aktif
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: API Gateway */}
      {activeTab === "api" && (
        <div 
          style={{
            borderRadius: "18px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: "26px 30px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "22px"
          }}
        >
          <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <KeyRound style={{ width: "18px", height: "18px", color: "#0F2E5C" }} /> Koneksi Gateway SIPJAKI Kementerian PUPR
            </h2>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0 0" }}>
              Digunakan untuk sinkronisasi otomatis data 5 pilar (Tertib Usaha, Penyelenggaraan, Pemanfaatan, K3, dan TKK)
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "700px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                SIPJAKI API Base URL
              </label>
              <input
                type="text"
                readOnly
                value="https://sipjaki.pu.go.id/api/v2/integration"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#F8FAFC",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontFamily: "monospace",
                  color: "#334155"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                API Secret Key
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  style={{
                    flex: 1,
                    borderRadius: "10px",
                    border: "1px solid #CBD5E1",
                    backgroundColor: "#FFFFFF",
                    padding: "10px 14px",
                    fontSize: "13px",
                    fontFamily: "monospace",
                    color: "#0F172A",
                    outline: "none"
                  }}
                />
                <button
                  type="button"
                  onClick={() => alert("Tes Koneksi: Ping ke SIPJAKI Kementerian PUPR Sukses! Latensi 42ms.")}
                  style={{
                    borderRadius: "10px",
                    backgroundColor: "#F1F5F9",
                    border: "1px solid #CBD5E1",
                    padding: "10px 18px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#0F2E5C",
                    cursor: "pointer"
                  }}
                >
                  Uji Koneksi
                </button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", backgroundColor: "#F8FAFC", borderRadius: "14px", border: "1px solid #E2E8F0" }}>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", margin: 0 }}>Sinkronisasi Otomatis Terjadwal</p>
                <p style={{ fontSize: "11px", color: "#64748B", margin: "3px 0 0 0" }}>Kirim rekapitulasi data setiap hari pukul 23:59 WIB</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoSync(!autoSync)}
                style={{
                  position: "relative",
                  display: "inline-flex",
                  height: "26px",
                  width: "48px",
                  borderRadius: "9999px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: autoSync ? "#0F2E5C" : "#CBD5E1",
                  transition: "background-color 0.2s ease"
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    height: "20px",
                    width: "20px",
                    borderRadius: "9999px",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    transform: autoSync ? "translate(24px, 3px)" : "translate(4px, 3px)",
                    transition: "transform 0.2s ease"
                  }}
                />
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "14px", borderTop: "1px solid #F1F5F9" }}>
            <button
              type="button"
              onClick={handleSaveApi}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "12px",
                backgroundColor: "#0F2E5C",
                border: "none",
                borderBottom: "3px solid #FFC000",
                padding: "10px 24px",
                fontSize: "12px",
                fontWeight: 800,
                color: "#FFFFFF",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(15, 46, 92, 0.2)"
              }}
            >
              {saved ? <CheckCircle2 style={{ width: "15px", height: "15px" }} /> : <Save style={{ width: "15px", height: "15px" }} />}
              <span>{saved ? "Pengaturan Tersimpan!" : "Simpan Pengaturan API"}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: General */}
      {activeTab === "general" && (
        <div 
          style={{
            borderRadius: "18px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: "26px 30px",
            maxWidth: "720px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "18px"
          }}
        >
          <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
              Preferensi Lingkungan Sistem
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Nama Aplikasi</label>
              <input
                type="text"
                readOnly
                value="SIJAKON - Sistem Informasi Jasa Konstruksi Kab. Bogor"
                style={{ width: "100%", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#F8FAFC", padding: "10px 14px", fontSize: "13px", fontWeight: 600, color: "#0F172A" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Arsitektur Role</label>
              <input
                type="text"
                readOnly
                value="6-Tier Hierarchy (5 Login Role + 1 Publik) • v1.1.0"
                style={{ width: "100%", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#F8FAFC", padding: "10px 14px", fontSize: "13px", fontFamily: "monospace", color: "#0F172A" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Zona Waktu Server</label>
              <input
                type="text"
                readOnly
                value="Asia/Jakarta (WIB, UTC+7)"
                style={{ width: "100%", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#F8FAFC", padding: "10px 14px", fontSize: "13px", color: "#0F172A" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

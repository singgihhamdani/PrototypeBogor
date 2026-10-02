"use client";
import { useState } from "react";
import Link from "next/link";
import { 
  Settings, Users, KeyRound, Shield, RefreshCw, CheckCircle2, 
  Save, Globe, Bell, Lock, Plus, Sparkles, Check, X,
  SlidersHorizontal, Crown, Building2, ClipboardCheck, GraduationCap, ShieldAlert,
  History, FileSpreadsheet, Download, FileText, ArrowRight, Info, ExternalLink, HardHat,
  Package, FileCheck
} from "lucide-react";
import { RoleCode, ROLE_CONFIGS, DEMO_USERS } from "@/lib/auth-types";
import { downloadExcelTemplate } from "@/lib/export-utils";
import { 
  ALL_SIPJAKI_TEMPLATES, 
  TEMPLATE_PAKET_PEKERJAAN,
  TEMPLATE_KECELAKAAN,
  TEMPLATE_BUJK,
  TEMPLATE_PELATIHAN,
  TEMPLATE_PELAKSANAAN,
  TEMPLATE_REKOMENDASI 
} from "@/lib/sipjaki-templates";

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
  const [activeTab, setActiveTab] = useState<"template" | "users" | "rbac" | "general">("rbac");

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

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadTemplate = (tmpl: any) => {
    setDownloadingId(tmpl.id);
    try {
      downloadExcelTemplate({
        fileName: tmpl.exportFileName,
        sheetName: tmpl.sheetName,
        columns: tmpl.columns,
        sampleRows: tmpl.sampleRows,
        dictionaryItems: tmpl.dictionaryItems,
        instructions: tmpl.instructions,
      });
    } finally {
      setTimeout(() => {
        setDownloadingId(null);
      }, 1200);
    }
  };

  const currentRoleSet = rolePermissions[selectedRole] || new Set();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
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
            Standar template pertukaran data Kementerian PUPR, matriks hak akses 6 role granular, serta preferensi akun dinas
          </p>
        </div>

        <Link
          href="/pengaturan/riwayat-data"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            borderRadius: "12px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #CBD5E1",
            color: "#0F2E5C",
            fontSize: "12px",
            fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
          }}
        >
          <History style={{ width: "16px", height: "16px", color: "#2563EB" }} />
          <span>Riwayat Ekspor/Impor SIPJAKI</span>
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #E2E8F0", paddingBottom: "10px", flexWrap: "wrap" }}>
        {[
          { id: "rbac", label: "Matriks Hak Akses & Role (RBAC)", icon: SlidersHorizontal },
          { id: "users", label: "Manajemen Pengguna (6 Akun Demo)", icon: Users },
          { id: "template", label: "Standar & Template Integrasi SIPJAKI", icon: FileSpreadsheet },
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

      {/* TAB 3: Standar & Template Integrasi SIPJAKI */}
      {activeTab === "template" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Header Card / Explanation */}
          <div
            style={{
              borderRadius: "18px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              padding: "24px 28px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ maxWidth: "800px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <FileSpreadsheet style={{ width: "12px", height: "12px", color: "#0F2E5C" }} />
                    Mekanisme Resmi: Pertukaran Data Berbasis Berkas (Spreadsheet XLSX)
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669", backgroundColor: "#ECFDF5", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <CheckCircle2 style={{ width: "12px", height: "12px" }} />
                    6 Modul Sesuai Permen PUPR
                  </span>
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.3px" }}>
                  Standar Format & Template Resmi SIPJAKI Kementerian PUPR
                </h2>
                <p style={{ fontSize: "13px", color: "#475569", margin: "8px 0 0 0", lineHeight: 1.6 }}>
                  Kementerian PUPR menggunakan mekanisme sinkronisasi data semi-otomatis melalui berkas terstruktur Spreadsheet (.xlsx / .csv). Unduh template master di bawah ini untuk digunakan oleh petugas dinas maupun penyedia jasa agar data dapat diimpor langsung tanpa penolakan validasi pada portal SIPJAKI Nasional maupun sistem SIJAKON Bogor.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link
                  href="/pengaturan/riwayat-data"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 16px",
                    borderRadius: "10px",
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #CBD5E1",
                    color: "#0F2E5C",
                    fontSize: "12px",
                    fontWeight: 800,
                    textDecoration: "none"
                  }}
                >
                  <History style={{ width: "14px", height: "14px", color: "#2563EB" }} />
                  <span>Log Riwayat Audit</span>
                </Link>
              </div>
            </div>

            {/* Quick Summary Bar */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", paddingTop: "12px", borderTop: "1px solid #F1F5F9" }}>
              <div style={{ backgroundColor: "#F8FAFC", padding: "12px 14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 700 }}>Total Template Resmi</span>
                <p style={{ fontSize: "16px", fontWeight: 900, color: "#0F172A", margin: "2px 0 0 0" }}>6 Modul Pekerjaan</p>
              </div>
              <div style={{ backgroundColor: "#F8FAFC", padding: "12px 14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 700 }}>Format Berkas Kompatibel</span>
                <p style={{ fontSize: "16px", fontWeight: 900, color: "#0F172A", margin: "2px 0 0 0" }}>.XLSX & .CSV (UTF-8)</p>
              </div>
              <div style={{ backgroundColor: "#F8FAFC", padding: "12px 14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 700 }}>Struktur Berkas</span>
                <p style={{ fontSize: "16px", fontWeight: 900, color: "#0F172A", margin: "2px 0 0 0" }}>3 Sheet (Data, Petunjuk, Kamus)</p>
              </div>
              <div style={{ backgroundColor: "#F8FAFC", padding: "12px 14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 700 }}>Validasi Skema</span>
                <p style={{ fontSize: "16px", fontWeight: 900, color: "#059669", margin: "2px 0 0 0" }}>Otomatis & Real-Time</p>
              </div>
            </div>
          </div>

          {/* 6 Template Cards Grid */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                  Daftar Template Formulir Impor & Ekspor SIPJAKI
                </h3>
                <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
                  Setiap berkas template telah dilengkapi contoh baris, batasan tipe data, petunjuk teknis pengisian, dan daftar kamus nilai pilihan (enum).
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "16px" }}>
              {[
                {
                  template: TEMPLATE_PAKET_PEKERJAAN,
                  category: "Penyelenggaraan Jasa Konstruksi",
                  badgeColor: "#0284C7",
                  badgeBg: "#E0F2FE",
                  icon: Package,
                  desc: "Format impor/ekspor data proyek fisik, pagu/HPS, sumber dana (APBD/DAK/Banprov), progres fisik/keuangan bulanan, dan data kontrak.",
                  rules: ["Format Tanggal ISO (YYYY-MM-DD)", "Nilai Pagu & Kontrak angka murni", "Enum Sumber Dana valid"],
                  countCols: 17,
                },
                {
                  template: TEMPLATE_BUJK,
                  category: "Kelembagaan & Tertib Usaha",
                  badgeColor: "#0F2E5C",
                  badgeBg: "#EBF2FA",
                  icon: Building2,
                  desc: "Legalitas badan usaha, NIB 13-digit OSS RBA, kualifikasi (Kecil/Menengah/Besar), klasifikasi subbidang SBU, PJBU, dan status perizinan.",
                  rules: ["Wajib 13 Digit NIB", "Kualifikasi K/M/B resmi", "Masa berlaku SBU valid"],
                  countCols: 11,
                },
                {
                  template: TEMPLATE_PELATIHAN,
                  category: "Pembinaan Tenaga Kerja Konstruksi",
                  badgeColor: "#16A34A",
                  badgeBg: "#DCFCE7",
                  icon: GraduationCap,
                  desc: "Data kegiatan sertifikasi/pembinaan TKK, jenjang KKNI (1-9), jabatan kerja SKK, nomor registrasi BNSP/LPJK, status kelulusan, dan asesor.",
                  rules: ["Jenjang KKNI 1-9", "Format NIK 16-Digit", "Kode jabatan kerja valid"],
                  countCols: 11,
                },
                {
                  template: TEMPLATE_KECELAKAAN,
                  category: "Keselamatan Konstruksi (SMKK / K3)",
                  badgeColor: "#DC2626",
                  badgeBg: "#FEE2E2",
                  icon: HardHat,
                  desc: "Pencatatan insiden fatalitas, cedera berat/ringan, kerusakan properti, investigasi penyebab (unsafe act/condition), dan klaim asuransi BPJS.",
                  rules: ["Tingkat keparahan enum", "Estimasi kerugian integer", "Tanggal insiden valid"],
                  countCols: 14,
                },
                {
                  template: TEMPLATE_PELAKSANAAN,
                  category: "Pengawasan Lapangan SIMAK",
                  badgeColor: "#D97706",
                  badgeBg: "#FEF3C7",
                  icon: ClipboardCheck,
                  desc: "Formulir checklist pengawasan lapangan SIMAK: kepatuhan fungsi teknis, mutu material & K3, status tertib (Tertib/Peringatan/Sanksi), dan catatan pengawas.",
                  rules: ["Status kepatuhan standar", "Skor audit numerik 0-100", "Tanggal pengawasan valid"],
                  countCols: 11,
                },
                {
                  template: TEMPLATE_REKOMENDASI,
                  category: "Penegakan & Rekomendasi Sanksi",
                  badgeColor: "#9333EA",
                  badgeBg: "#F3E8FF",
                  icon: ShieldAlert,
                  desc: "Instruksi perbaikan pengawas, teguran tertulis bertingkat (1/2/3), batas waktu penyelesaian, dan verifikasi status pemenuhan rekomendasi.",
                  rules: ["Jenis sanksi terdaftar", "Batas waktu ISO format", "Status tindak lanjut valid"],
                  countCols: 10,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isDownloading = downloadingId === item.template.id;

                return (
                  <div
                    key={item.template.id}
                    style={{
                      borderRadius: "16px",
                      border: "1px solid #E2E8F0",
                      backgroundColor: "#FFFFFF",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "16px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "10px",
                              backgroundColor: item.badgeBg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: item.badgeColor
                            }}
                          >
                            <Icon style={{ width: "20px", height: "20px" }} />
                          </div>
                          <div>
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 800,
                                textTransform: "uppercase",
                                color: item.badgeColor,
                                letterSpacing: "0.5px"
                              }}
                            >
                              {item.category}
                            </span>
                            <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A", margin: "2px 0 0 0" }}>
                              {item.template.moduleName}
                            </h4>
                          </div>
                        </div>
                      </div>

                      <p style={{ fontSize: "12px", color: "#64748B", margin: "0 0 14px 0", lineHeight: 1.5 }}>
                        {item.desc}
                      </p>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "#F1F5F9", color: "#334155", padding: "3px 8px", borderRadius: "6px" }}>
                          {item.countCols} Kolom Standar
                        </span>
                        <span style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "#F1F5F9", color: "#334155", padding: "3px 8px", borderRadius: "6px" }}>
                          Sheet: {item.template.sheetName}
                        </span>
                        <span style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "#ECFDF5", color: "#059669", padding: "3px 8px", borderRadius: "6px" }}>
                          Contoh Data Ada
                        </span>
                      </div>

                      {/* Rules */}
                      <div style={{ borderTop: "1px dashed #E2E8F0", paddingTop: "10px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                          Aturan Validasi Kunci:
                        </span>
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                          {item.rules.map((rule, rIdx) => (
                            <div key={rIdx} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#64748B" }}>
                              <Check style={{ width: "12px", height: "12px", color: "#059669", flexShrink: 0 }} />
                              <span>{rule}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px", borderTop: "1px solid #F1F5F9", paddingTop: "12px" }}>
                      <button
                        type="button"
                        onClick={() => handleDownloadTemplate(item.template)}
                        disabled={isDownloading}
                        style={{
                          flex: 1,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          padding: "9px 14px",
                          borderRadius: "10px",
                          backgroundColor: isDownloading ? "#059669" : "#0F2E5C",
                          border: "none",
                          borderBottom: isDownloading ? "none" : "2px solid #FFC000",
                          color: "#FFFFFF",
                          fontSize: "12px",
                          fontWeight: 800,
                          cursor: isDownloading ? "default" : "pointer",
                          boxShadow: "0 2px 4px rgba(15, 46, 92, 0.15)",
                          transition: "all 0.15s ease"
                        }}
                      >
                        {isDownloading ? (
                          <>
                            <CheckCircle2 style={{ width: "14px", height: "14px" }} />
                            <span>Mengunduh...</span>
                          </>
                        ) : (
                          <>
                            <Download style={{ width: "14px", height: "14px" }} />
                            <span>Unduh Template (.xlsx)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Validation Standards Specification (4 Cards) */}
          <div
            style={{
              borderRadius: "18px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              padding: "24px 28px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#D97706", backgroundColor: "#FEF3C7", padding: "3px 10px", borderRadius: "9999px" }}>
                  Pedoman Teknis Impor Data
                </span>
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                4 Ketentuan Validasi Skema Data SIPJAKI
              </h3>
              <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0 0" }}>
                Parser SheetJS SIJAKON dan validator SIPJAKI Kementerian PUPR menerapkan aturan validasi ketat sebelum data dimasukkan ke basis data:
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
              <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: "#E0F2FE", color: "#0284C7", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "12px" }}>
                    1
                  </div>
                  <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                    Format NIB 13 Digit
                  </h4>
                </div>
                <p style={{ fontSize: "12px", color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                  Nomor Induk Berusaha (NIB) wajib berupa 13 digit angka murni sesuai standar OSS RBA Kemeninvest/BKPM. NIB dengan huruf, tanda baca, atau panjang tidak tepat akan ditolak.
                </p>
              </div>

              <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: "#DCFCE7", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "12px" }}>
                    2
                  </div>
                  <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                    Format Tanggal Standar ISO
                  </h4>
                </div>
                <p style={{ fontSize: "12px", color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                  Tanggal ditulis dalam format <code style={{ backgroundColor: "#FFFFFF", padding: "1px 4px", borderRadius: "4px", border: "1px solid #CBD5E1" }}>YYYY-MM-DD</code> (contoh: 2026-04-15) atau <code style={{ backgroundColor: "#FFFFFF", padding: "1px 4px", borderRadius: "4px", border: "1px solid #CBD5E1" }}>DD/MM/YYYY</code>. Zona waktu baku: WIB.
                </p>
              </div>

              <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "12px" }}>
                    3
                  </div>
                  <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                    Nilai Moneter & Numerik Murni
                  </h4>
                </div>
                <p style={{ fontSize: "12px", color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                  Nilai pagu, HPS, kontrak, kerugian K3, dan persentase progres diisi angka murni tanpa simbol mata uang <code style={{ backgroundColor: "#FFFFFF", padding: "1px 4px", borderRadius: "4px", border: "1px solid #CBD5E1" }}>Rp</code>, spasi, atau pemisah titik.
                </p>
              </div>

              <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: "#F3E8FF", color: "#9333EA", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "12px" }}>
                    4
                  </div>
                  <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                    Kesesuaian Nilai Pilihan (Enum)
                  </h4>
                </div>
                <p style={{ fontSize: "12px", color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                  Kolom pilihan (Sumber Dana, Kualifikasi BUJK, Tingkat Keparahan K3, Kepatuhan SIMAK, Jenjang TKK) harus persis sama dengan opsi pada kamus data (case-sensitive).
                </p>
              </div>
            </div>
          </div>

          {/* Workflow Steps Card */}
          <div
            style={{
              borderRadius: "18px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#F8FAFC",
              padding: "24px 28px",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
              Alur Kerja Integrasi Data SIPJAKI
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              <div style={{ backgroundColor: "#FFFFFF", padding: "14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C" }}>Langkah 1</span>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", margin: "4px 0 2px 0" }}>Unduh Template Master</p>
                <p style={{ fontSize: "11px", color: "#64748B", margin: 0 }}>Pilih modul yang relevan dan unduh berkas .xlsx resmi.</p>
              </div>
              <div style={{ backgroundColor: "#FFFFFF", padding: "14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C" }}>Langkah 2</span>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", margin: "4px 0 2px 0" }}>Pengisian & Validasi Mandiri</p>
                <p style={{ fontSize: "11px", color: "#64748B", margin: 0 }}>Isi baris data sesuai kamus dan jangan ubah nama kolom baris 1.</p>
              </div>
              <div style={{ backgroundColor: "#FFFFFF", padding: "14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C" }}>Langkah 3</span>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", margin: "4px 0 2px 0" }}>Unggah & Review Error</p>
                <p style={{ fontSize: "11px", color: "#64748B", margin: 0 }}>Klik "Impor Data SIPJAKI" di modul, pratinjau dan koreksi baris invalid.</p>
              </div>
              <div style={{ backgroundColor: "#FFFFFF", padding: "14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C" }}>Langkah 4</span>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", margin: "4px 0 2px 0" }}>Sinkron & Audit Trail</p>
                <p style={{ fontSize: "11px", color: "#64748B", margin: 0 }}>Data tersimpan di SIJAKON dan seluruh aksi dicatat di log audit.</p>
              </div>
            </div>
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

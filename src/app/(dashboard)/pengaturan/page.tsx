"use client";
import { useState } from "react";
import { 
  Settings, Users, KeyRound, Shield, RefreshCw, CheckCircle2, 
  Save, Globe, Bell, Lock, Server, Plus
} from "lucide-react";

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState<"api" | "users" | "general">("api");
  const [apiKey, setApiKey] = useState("spjk_bogor_live_99a82f710c3b4e");
  const [autoSync, setAutoSync] = useState(true);
  const [saved, setSaved] = useState(false);

  const users = [
    { id: "USR-01", name: "H. Raden Ridwan, ST, M.Si", role: "Super Admin (Kabid Jakon)", email: "ridwan.jakon@bogorkab.go.id", status: "Aktif" },
    { id: "USR-02", name: "Bayu Pratama, S.Kom", role: "Administrator Sistem", email: "bayu.sipjaki@bogorkab.go.id", status: "Aktif" },
    { id: "USR-03", name: "Supriyatna, ST", role: "Pengawas SIMAK Lapangan", email: "pengawas01@bogorkab.go.id", status: "Aktif" },
    { id: "USR-04", name: "PPK Dinas Pendidikan", role: "OPD Pengguna Jasa", email: "ppk.disdik@bogorkab.go.id", status: "Aktif" },
    { id: "USR-05", name: "PT Bangun Jaya Konstruksi", role: "Penyedia Jasa (BUJK)", email: "info@bangunjaya.co.id", status: "Aktif" }
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <Settings style={{ width: "12px", height: "12px" }} /> Konfigurasi Sistem
          </span>
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
          Pengaturan Sistem & Integrasi SIPJAKI
        </h1>
        <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
          Manajemen kredensial API Kementerian PUPR, hak akses pengguna, serta preferensi sinkronisasi data
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #E2E8F0", paddingBottom: "10px" }}>
        {[
          { id: "api", label: "Integrasi API SIPJAKI", icon: Server },
          { id: "users", label: "Manajemen Pengguna & Role", icon: Users },
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

      {/* Tab: API */}
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
                API Secret Token (Pemerintah Kabupaten Bogor)
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
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
              onClick={handleSave}
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

      {/* Tab: Users */}
      {activeTab === "users" && (
        <div style={{ borderRadius: "18px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", overflow: "hidden", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>Daftar Pengguna & Hak Akses</h2>
              <p style={{ fontSize: "12px", color: "#64748B", margin: "3px 0 0 0" }}>Peran akun dalam input audit SIMAK, verifikasi BUJK, dan pelaporan</p>
            </div>
            <button
              type="button"
              onClick={() => alert("Membuka Formulir Penambahan Akun Pengguna Baru...")}
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
              <Plus style={{ width: "14px", height: "14px", color: "#FFC000" }} /> Tambah Pengguna
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0", textAlign: "left" }}>
                  <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>NAMA LENGKAP</th>
                  <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>ROLE / PERAN</th>
                  <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>EMAIL INSTANSI</th>
                  <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>STATUS</th>
                  <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px", textAlign: "center" }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #F1F5F9", transition: "background-color 0.15s ease" }}>
                    <td style={{ padding: "16px 18px" }}>
                      <p style={{ fontWeight: 800, color: "#0F172A", margin: 0, fontSize: "13px" }}>{u.name}</p>
                      <p style={{ fontSize: "11px", fontFamily: "monospace", color: "#64748B", margin: "2px 0 0 0" }}>{u.id}</p>
                    </td>
                    <td style={{ padding: "16px 18px", color: "#0F2E5C", fontWeight: 700 }}>
                      {u.role}
                    </td>
                    <td style={{ padding: "16px 18px", color: "#475569", fontFamily: "monospace" }}>
                      {u.email}
                    </td>
                    <td style={{ padding: "16px 18px" }}>
                      <span style={{ display: "inline-block", backgroundColor: "#ECFDF5", color: "#059669", padding: "3px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: 800 }}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px 18px", textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => alert(`Mengatur hak akses peran pengguna: ${u.name}`)}
                        style={{
                          borderRadius: "8px",
                          backgroundColor: "#F1F5F9",
                          color: "#0F2E5C",
                          border: "1px solid #E2E8F0",
                          padding: "6px 14px",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        Edit Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: General */}
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
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Versi Rilis</label>
              <input
                type="text"
                readOnly
                value="v1.0-prototype (Preview for Vercel Deployment)"
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

"use client";
import { Bell, Search, LogOut, User, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/mock-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUser, setShowUser] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header 
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #E2E8F0",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
        padding: "0 32px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)"
      }}
    >
      {/* Search Bar */}
      <div style={{ position: "relative", width: "100%", maxWidth: "420px" }}>
        <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94A3B8" }} />
        <input
          type="text"
          placeholder="Cari nomor kontrak, BUJK, NIB... (Ctrl+K)"
          style={{
            width: "100%",
            height: "40px",
            borderRadius: "12px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#F8FAFC",
            paddingLeft: "42px",
            paddingRight: "60px",
            fontSize: "12px",
            color: "#1E293B",
            outline: "none"
          }}
        />
        <kbd 
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            height: "20px",
            display: "inline-flex",
            alignItems: "center",
            borderRadius: "6px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#F1F5F9",
            padding: "0 6px",
            fontSize: "10px",
            fontWeight: 700,
            color: "#64748B"
          }}
        >
          Ctrl K
        </kbd>
      </div>

      {/* Right Side Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginLeft: "16px" }}>
        {/* SIPJAKI National Sync Badge */}
        <div 
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            borderRadius: "9999px",
            backgroundColor: "#EBF2FA",
            border: "1px solid rgba(15, 46, 92, 0.15)",
            padding: "4px 12px",
            fontSize: "12px"
          }}
        >
          <span style={{ height: "8px", width: "8px", borderRadius: "9999px", backgroundColor: "#10B981" }} />
          <span style={{ fontWeight: 800, color: "#0F2E5C" }}>SIPJAKI PUPR</span>
          <span style={{ fontSize: "11px", color: "#64748B" }}>• Terhubung</span>
        </div>

        {/* TA 2026 Pill */}
        <div 
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            borderRadius: "9999px",
            backgroundColor: "#FFFBEB",
            border: "1px solid #FDE68A",
            padding: "4px 12px"
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: 900, color: "#B45309" }}>TA 2026</span>
        </div>

        {/* Notifications */}
        <button 
          onClick={() => alert("Notifikasi Sistem: 3 Laporan Audit SIMAK menunggu verifikasi.")}
          style={{
            position: "relative",
            display: "flex",
            height: "36px",
            width: "36px",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "10px",
            color: "#64748B",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer"
          }}
        >
          <Bell style={{ width: "18px", height: "18px" }} />
          <span 
            style={{
              position: "absolute",
              right: "2px",
              top: "2px",
              display: "flex",
              height: "16px",
              width: "16px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "9999px",
              backgroundColor: "#EF4444",
              fontSize: "9px",
              fontWeight: 800,
              color: "#FFFFFF"
            }}
          >
            3
          </span>
        </button>

        <div style={{ height: "24px", width: "1px", backgroundColor: "#E2E8F0" }} />

        {/* User profile dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowUser(!showUser)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              borderRadius: "10px",
              padding: "4px 8px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer"
            }}
          >
            <div 
              style={{
                display: "flex",
                height: "34px",
                width: "34px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
                backgroundColor: "#0F2E5C",
                color: "#FFC000",
                fontSize: "12px",
                fontWeight: 900,
                border: "1px solid rgba(255, 192, 0, 0.4)",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
              }}
            >
              AD
            </div>
            <div style={{ textAlign: "left", lineHeight: 1.2 }}>
              <span style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B" }}>{user?.name || "Admin DPUPR"}</span>
              <span style={{ display: "block", fontSize: "10px", fontWeight: 600, color: "#64748B" }}>{user?.role || "Super Admin"}</span>
            </div>
          </button>

          {showUser && (
            <div 
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                marginTop: "8px",
                width: "220px",
                borderRadius: "14px",
                border: "1px solid #E2E8F0",
                backgroundColor: "#FFFFFF",
                padding: "8px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                zIndex: 50
              }}
            >
              <div style={{ padding: "8px 12px", borderBottom: "1px solid #F1F5F9", marginBottom: "4px" }}>
                <p style={{ fontSize: "12px", fontWeight: 800, color: "#1E293B", margin: 0 }}>{user?.name}</p>
                <p style={{ fontSize: "11px", color: "#64748B", margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
              </div>
              <button 
                onClick={() => { setShowUser(false); router.push("/profil-opd"); }}
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  gap: "8px",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#334155",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <User style={{ width: "16px", height: "16px", color: "#0F2E5C" }} /> Profil OPD & Akun
              </button>
              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  gap: "8px",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#DC2626",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <LogOut style={{ width: "16px", height: "16px" }} /> Keluar Sesi
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

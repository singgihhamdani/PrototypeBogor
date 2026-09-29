"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Bell, Search, LogOut, User, ShieldCheck, 
  Sparkles, RefreshCw, ChevronDown, Check, Building2, GraduationCap
} from "lucide-react";
import { useAuth, ROLE_CONFIGS, RoleCode } from "@/lib/mock-auth";
import RoleSwitcherModal from "@/components/layout/role-switcher-modal";

export default function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUser, setShowUser] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const currentRole: RoleCode = user?.role || "SUPER_ADMIN";
  const roleConfig = ROLE_CONFIGS[currentRole];

  return (
    <>
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
          padding: "0 28px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)"
        }}
      >
        {/* Search Bar */}
        <div style={{ position: "relative", width: "100%", maxWidth: "380px" }}>
          <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94A3B8" }} />
          <input
            type="text"
            placeholder="Cari nomor kontrak, BUJK, NIB... (Ctrl+K)"
            style={{
              width: "100%",
              height: "38px",
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#F8FAFC",
              paddingLeft: "40px",
              paddingRight: "60px",
              fontSize: "12px",
              color: "#1E293B",
              outline: "none"
            }}
          />
          <kbd 
            style={{
              position: "absolute",
              right: "10px",
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
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "16px" }}>
          
          {/* Quick Role Switcher Trigger Button */}
          <button
            onClick={() => setShowSwitcher(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "9999px",
              backgroundColor: "#0F2E5C",
              border: "1px solid #FFC000",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: 800,
              color: "#FFFFFF",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(15, 46, 92, 0.2)",
              transition: "transform 0.15s ease"
            }}
          >
            <Sparkles style={{ width: "14px", height: "14px", color: "#FFC000" }} />
            <span>Simulasi Role:</span>
            <span
              style={{
                backgroundColor: "#FFC000",
                color: "#0F2E5C",
                padding: "2px 8px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 900
              }}
            >
              {user?.roleLabel?.split(" ")[0] || "Super"}
            </span>
            <ChevronDown style={{ width: "12px", height: "12px", color: "#FFC000" }} />
          </button>

          {/* SIPJAKI National Sync Badge */}
          <div 
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "9999px",
              backgroundColor: "#EBF2FA",
              border: "1px solid rgba(15, 46, 92, 0.15)",
              padding: "4px 12px",
              fontSize: "11px"
            }}
          >
            <span style={{ height: "7px", width: "7px", borderRadius: "9999px", backgroundColor: "#10B981" }} />
            <span style={{ fontWeight: 800, color: "#0F2E5C" }}>SIPJAKI</span>
            <span style={{ fontSize: "10px", color: "#64748B" }}>Aktif</span>
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
                  backgroundColor: roleConfig?.badgeBg || "#0F2E5C",
                  color: roleConfig?.badgeText || "#FFC000",
                  fontSize: "12px",
                  fontWeight: 900,
                  border: "1px solid rgba(255, 192, 0, 0.4)",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
                }}
              >
                {user?.name ? user.name.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() : "AD"}
              </div>
              <div style={{ textAlign: "left", lineHeight: 1.2 }}>
                <span style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.name || "Admin DPU"}
                </span>
                <span style={{ display: "block", fontSize: "10px", fontWeight: 600, color: "#64748B" }}>
                  {user?.roleLabel || "Super Admin"}
                </span>
              </div>
            </button>

            {showUser && (
              <div 
                style={{
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  marginTop: "8px",
                  width: "260px",
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0",
                  backgroundColor: "#FFFFFF",
                  padding: "8px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
                  zIndex: 50
                }}
              >
                <div style={{ padding: "10px 12px", borderBottom: "1px solid #F1F5F9", marginBottom: "4px" }}>
                  <p style={{ fontSize: "12px", fontWeight: 800, color: "#1E293B", margin: 0 }}>{user?.name}</p>
                  <p style={{ fontSize: "11px", color: "#64748B", margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
                  
                  <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    <span 
                      style={{ 
                        fontSize: "10px", 
                        fontWeight: 800, 
                        backgroundColor: roleConfig?.badgeBg || "#0F2E5C", 
                        color: roleConfig?.badgeText || "#FFFFFF", 
                        padding: "2px 8px", 
                        borderRadius: "9999px" 
                      }}
                    >
                      {user?.roleLabel}
                    </span>
                    {user?.bujkName && (
                      <span style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "#FFEDD5", color: "#9A3412", padding: "2px 6px", borderRadius: "4px" }}>
                        {user.bujkName}
                      </span>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => { setShowUser(false); setShowSwitcher(true); }}
                  style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    gap: "8px",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#0F2E5C",
                    backgroundColor: "#EBF2FA",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    marginBottom: "4px"
                  }}
                >
                  <Sparkles style={{ width: "16px", height: "16px", color: "#F59E0B" }} />
                  <span>Ganti Peran (Role Switcher)</span>
                </button>

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
                  <User style={{ width: "16px", height: "16px", color: "#0F2E5C" }} /> Profil & Info Akun
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

      {/* Role Switcher Modal */}
      <RoleSwitcherModal isOpen={showSwitcher} onClose={() => setShowSwitcher(false)} />
    </>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, DEMO_USERS, ROLE_CONFIGS, RoleCode, User } from "@/lib/mock-auth";
import { 
  ShieldAlert, ShieldCheck, Building2, GraduationCap, 
  Crown, ClipboardCheck, ArrowRight, Check, X, Sparkles, UserCheck
} from "lucide-react";

interface RoleSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RoleSwitcherModal({ isOpen, onClose }: RoleSwitcherProps) {
  const { user, switchUser } = useAuth();
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState<string>(user?.username || "superadmin");

  if (!isOpen) return null;

  const handleSelectAndApply = (key: string) => {
    setSelectedKey(key);
    switchUser(key);
    const targetUser = DEMO_USERS[key];
    if (targetUser) {
      const config = ROLE_CONFIGS[targetUser.role];
      if (config) {
        router.push(config.defaultRoute);
      }
    }
    onClose();
  };

  const getRoleIcon = (role: RoleCode, variant?: string) => {
    if (role === "SUPER_ADMIN") return <Crown style={{ width: "20px", height: "20px", color: "#FFC000" }} />;
    if (role === "ADMIN_BIDANG") {
      if (variant === "PENGAWAS_ASESOR") {
        return <ClipboardCheck style={{ width: "20px", height: "20px", color: "#38BDF8" }} />;
      }
      return <Building2 style={{ width: "20px", height: "20px", color: "#60A5FA" }} />;
    }
    if (role === "EKSEKUTIF") return <ShieldCheck style={{ width: "20px", height: "20px", color: "#34D399" }} />;
    if (role === "OPERATOR_BUJK") return <Building2 style={{ width: "20px", height: "20px", color: "#FB923C" }} />;
    return <GraduationCap style={{ width: "20px", height: "20px", color: "#A78BFA" }} />;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "720px",
          backgroundColor: "#FFFFFF",
          borderRadius: "24px",
          boxShadow: "0 25px 50px -12px rgba(15, 46, 92, 0.3)",
          border: "1px solid #E2E8F0",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#0F2E5C",
            padding: "20px 24px",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "3px solid #FFC000"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 192, 0, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <UserCheck style={{ width: "22px", height: "22px", color: "#FFC000" }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ fontSize: "17px", fontWeight: 900, margin: 0, color: "#FFFFFF" }}>
                  Demo Role Switcher (Simulasi 6 Persona)
                </h3>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    backgroundColor: "#FFC000",
                    color: "#0F2E5C",
                    padding: "2px 8px",
                    borderRadius: "9999px"
                  }}
                >
                  Interactive RBAC
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.75)", margin: "4px 0 0 0" }}>
                Ganti peran pengguna seketika untuk melihat adaptasi sidebar, hak akses modul, dan tampilan portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255, 255, 255, 0.8)",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        {/* List Persona */}
        <div
          style={{
            padding: "20px 24px",
            maxHeight: "520px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            backgroundColor: "#F8FAFC"
          }}
        >
          {Object.entries(DEMO_USERS).map(([key, demoUser]) => {
            const isCurrent = user?.username === demoUser.username;
            const config = ROLE_CONFIGS[demoUser.role];

            return (
              <div
                key={key}
                onClick={() => handleSelectAndApply(key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px",
                  borderRadius: "16px",
                  border: isCurrent ? "2px solid #0F2E5C" : "1px solid #E2E8F0",
                  backgroundColor: isCurrent ? "#FFFFFF" : "#FFFFFF",
                  cursor: "pointer",
                  boxShadow: isCurrent ? "0 4px 14px rgba(15, 46, 92, 0.12)" : "0 1px 3px rgba(0,0,0,0.02)",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      backgroundColor: "#0F2E5C",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    {getRoleIcon(demoUser.role, demoUser.variant)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A" }}>
                        {demoUser.name}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          backgroundColor: config.badgeBg,
                          color: config.badgeText,
                          padding: "2px 10px",
                          borderRadius: "9999px"
                        }}
                      >
                        {demoUser.roleLabel}
                      </span>
                      {demoUser.variantLabel && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            backgroundColor: "#EBF2FA",
                            color: "#0F2E5C",
                            padding: "2px 8px",
                            borderRadius: "6px"
                          }}
                        >
                          {demoUser.variantLabel}
                        </span>
                      )}
                      {demoUser.bujkName && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            backgroundColor: "#FFEDD5",
                            color: "#9A3412",
                            padding: "2px 8px",
                            borderRadius: "6px"
                          }}
                        >
                          {demoUser.bujkName}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 6px 0", lineHeight: 1.4 }}>
                      {config.description}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "11px", color: "#94A3B8" }}>
                      <span>Email: <strong style={{ color: "#475569" }}>{demoUser.email}</strong></span>
                      <span>Target: <strong style={{ color: "#0F2E5C" }}>{config.defaultRoute}</strong></span>
                    </div>
                  </div>
                </div>

                <div style={{ marginLeft: "16px", flexShrink: 0 }}>
                  {isCurrent ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "11px",
                        fontWeight: 800,
                        color: "#059669",
                        backgroundColor: "#ECFDF5",
                        padding: "6px 12px",
                        borderRadius: "9999px",
                        border: "1px solid #A7F3D0"
                      }}
                    >
                      <Check style={{ width: "14px", height: "14px" }} /> Sedang Aktif
                    </span>
                  ) : (
                    <button
                      type="button"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "11px",
                        fontWeight: 800,
                        color: "#0F2E5C",
                        backgroundColor: "#EBF2FA",
                        border: "1px solid #BFDBFE",
                        padding: "6px 14px",
                        borderRadius: "10px",
                        cursor: "pointer"
                      }}
                    >
                      <span>Pilih</span>
                      <ArrowRight style={{ width: "12px", height: "12px" }} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: "14px 24px",
            backgroundColor: "#FFFFFF",
            borderTop: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#64748B"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles style={{ width: "16px", height: "16px", color: "#FFC000" }} />
            <span>Semua kredensial kata sandi standar akun demo adalah: <strong style={{ color: "#0F2E5C" }}>demo2026</strong></span>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "6px 16px",
              borderRadius: "8px",
              border: "1px solid #CBD5E1",
              backgroundColor: "#F8FAFC",
              fontSize: "12px",
              fontWeight: 700,
              color: "#475569",
              cursor: "pointer"
            }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

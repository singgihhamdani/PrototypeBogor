"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Map, Building2, ClipboardCheck, GraduationCap,
  Package, Landmark, FileBarChart, BookOpen, Newspaper, Settings,
  ChevronLeft, ChevronRight, ShieldAlert, ArrowUpRight, ShieldCheck, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo, { BrandIcon } from "@/components/ui/logo";
import { useAuth, ROLE_CONFIGS, RoleCode } from "@/lib/mock-auth";

interface NavMenuItem {
  label: string;
  href: string;
  icon: any;
  badge?: number | string;
  allowedRoles?: RoleCode[];
  allowedVariants?: string[];
  requiredPermission?: { resource: string; action: string };
}

const allMenuItems: NavMenuItem[] = [
  { 
    label: "Dashboard", 
    href: "/", 
    icon: LayoutDashboard,
    allowedRoles: ["SUPER_ADMIN", "ADMIN_BIDANG", "EKSEKUTIF"]
  },
  { 
    label: "WebGIS Peta", 
    href: "/webgis", 
    icon: Map,
    allowedRoles: ["SUPER_ADMIN", "ADMIN_BIDANG", "EKSEKUTIF"]
  },
  { 
    label: "BUJK Master", 
    href: "/bujk", 
    icon: Building2,
    allowedRoles: ["SUPER_ADMIN", "ADMIN_BIDANG", "EKSEKUTIF"]
  },
  { 
    label: "Pengawasan SIMAK", 
    href: "/pengawasan", 
    icon: ClipboardCheck, 
    badge: 3,
    allowedRoles: ["SUPER_ADMIN", "ADMIN_BIDANG"],
    allowedVariants: ["PENGAWAS_ASESOR"] // Khusus Super Admin & Tim Pengawas
  },
  { 
    label: "Paket Pekerjaan", 
    href: "/paket-pekerjaan", 
    icon: Package,
    allowedRoles: ["SUPER_ADMIN", "ADMIN_BIDANG", "EKSEKUTIF"]
  },
  { 
    label: "Profil OPD PUPR", 
    href: "/profil-opd", 
    icon: Landmark,
    allowedRoles: ["SUPER_ADMIN", "ADMIN_BIDANG", "EKSEKUTIF"]
  },
  { 
    label: "Pelatihan & TKK", 
    href: "/pelatihan", 
    icon: GraduationCap,
    allowedRoles: ["SUPER_ADMIN", "ADMIN_BIDANG", "EKSEKUTIF"]
  },
  { 
    label: "Kecelakaan K3", 
    href: "/kecelakaan", 
    icon: ShieldAlert,
    allowedRoles: ["SUPER_ADMIN", "ADMIN_BIDANG"]
  },
  { 
    label: "Pelaporan SIPJAKI", 
    href: "/pelaporan", 
    icon: FileBarChart,
    allowedRoles: ["SUPER_ADMIN", "ADMIN_BIDANG", "EKSEKUTIF"]
  },
  { 
    label: "Regulasi Jakon", 
    href: "/regulasi", 
    icon: BookOpen,
    allowedRoles: ["SUPER_ADMIN", "ADMIN_BIDANG", "EKSEKUTIF"]
  },
  { 
    label: "Berita & Warta", 
    href: "/berita", 
    icon: Newspaper,
    allowedRoles: ["SUPER_ADMIN", "ADMIN_BIDANG", "EKSEKUTIF"]
  },
  { 
    label: "Pengaturan & Role", 
    href: "/pengaturan", 
    icon: Settings,
    allowedRoles: ["SUPER_ADMIN"] // Hanya Super Admin yang memiliki akses pengaturan sistem & RBAC
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const currentRole = user?.role || "SUPER_ADMIN";
  const roleConfig = ROLE_CONFIGS[currentRole];

  // Filter menu items berdasarkan role dan varian
  const visibleMenuItems = allMenuItems.filter((item) => {
    // 1. Cek role
    if (item.allowedRoles && !item.allowedRoles.includes(currentRole)) {
      return false;
    }

    // 2. Jika ADMIN_BIDANG dan item punya batasan varian spesifik (misal Pengawasan SIMAK)
    if (currentRole === "ADMIN_BIDANG" && item.allowedVariants) {
      if (user?.variant && !item.allowedVariants.includes(user.variant)) {
        // Jika varian bukan pengawas (misal bina konstruksi biasa), sembunyikan jika tidak diizinkan
        return false;
      }
    }

    return true;
  });

  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 40,
        height: "100vh",
        width: collapsed ? "72px" : "260px",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #E2E8F0",
        backgroundColor: "#FFFFFF",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "2px 0 8px rgba(0, 0, 0, 0.04)"
      }}
    >
      {/* Logo Header */}
      <div 
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: "0 16px",
          borderBottom: "1px solid #E2E8F0",
          backgroundColor: "#0F2E5C",
          color: "#FFFFFF",
          flexShrink: 0
        }}
      >
        {!collapsed ? (
          <Link href="/" style={{ display: "inline-flex", textDecoration: "none" }}>
            <Logo size={38} theme="dark" subtitle="DPU KAB. BOGOR" />
          </Link>
        ) : (
          <Link href="/" style={{ display: "inline-flex", textDecoration: "none" }}>
            <BrandIcon size={38} />
          </Link>
        )}
      </div>

      {/* Role Badge Indicator */}
      {!collapsed && user && (
        <div 
          style={{
            padding: "10px 14px",
            backgroundColor: "#F8FAFC",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
              Peran Aktif:
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  backgroundColor: roleConfig?.badgeBg || "#0F2E5C",
                  color: roleConfig?.badgeText || "#FFFFFF",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {user.roleLabel || currentRole}
              </span>
            </div>
            {user.variantLabel && (
              <span style={{ fontSize: "10px", color: "#0F2E5C", fontWeight: 700, marginTop: "2px" }}>
                • {user.variantLabel}
              </span>
            )}
          </div>
        </div>
      )}

      {/* External Portal Notice if logged in as BUJK or PESERTA in internal dashboard */}
      {!collapsed && (currentRole === "OPERATOR_BUJK" || currentRole === "PESERTA_TKK") && (
        <div
          style={{
            margin: "12px",
            padding: "12px",
            borderRadius: "12px",
            backgroundColor: "#FFFBEB",
            border: "1px solid #FDE68A",
            fontSize: "11px"
          }}
        >
          <p style={{ fontWeight: 800, color: "#92400E", margin: 0 }}>
            Portal Khusus Tersedia
          </p>
          <p style={{ color: "#78350F", margin: "4px 0 8px 0", fontSize: "10px", lineHeight: 1.4 }}>
            Anda memiliki dashboard terdedikasi untuk peran Anda.
          </p>
          <Link
            href={roleConfig?.defaultRoute || "/"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "11px",
              fontWeight: 800,
              color: "#FFFFFF",
              backgroundColor: "#D97706",
              padding: "6px 10px",
              borderRadius: "6px",
              textDecoration: "none"
            }}
          >
            Buka Portal Saya <ArrowUpRight style={{ width: "12px", height: "12px" }} />
          </Link>
        </div>
      )}

      {/* Nav List */}
      <nav 
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "4px"
        }}
      >
        {visibleMenuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                borderRadius: "12px",
                padding: "10px 12px",
                fontSize: "12px",
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 0.15s ease",
                backgroundColor: isActive ? "#0F2E5C" : "transparent",
                color: isActive ? "#FFFFFF" : "#475569"
              }}
            >
              <Icon 
                style={{
                  width: "18px",
                  height: "18px",
                  flexShrink: 0,
                  color: isActive ? "#FFC000" : "#64748B"
                }} 
              />
              {!collapsed && <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
              {!collapsed && item.badge && (
                <span 
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    height: "18px",
                    minWidth: "18px",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "9999px",
                    fontSize: "10px",
                    fontWeight: 800,
                    padding: "0 6px",
                    backgroundColor: isActive ? "#FFC000" : "#EF4444",
                    color: isActive ? "#0F2E5C" : "#FFFFFF"
                  }}
                >
                  {item.badge}
                </span>
              )}
              {isActive && (
                <span 
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    height: "24px",
                    width: "4px",
                    borderTopRightRadius: "4px",
                    borderBottomRightRadius: "4px",
                    backgroundColor: "#FFC000"
                  }} 
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* SIPJAKI Sync Status Indicator */}
      {!collapsed && (
        <div 
          style={{
            margin: "0 12px 12px 12px",
            padding: "12px",
            borderRadius: "14px",
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            fontSize: "11px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, color: "#1E293B" }}>
            <span style={{ height: "8px", width: "8px", borderRadius: "9999px", backgroundColor: "#10B981" }} />
            <span>Gateway SIPJAKI</span>
          </div>
          <p style={{ fontSize: "10px", color: "#64748B", margin: "4px 0 0 0" }}>Status: Terhubung Aktif</p>
        </div>
      )}

      {/* Collapse toggle */}
      <div 
        style={{
          borderTop: "1px solid #E2E8F0",
          padding: "10px",
          backgroundColor: "#F8FAFC",
          flexShrink: 0
        }}
      >
        <button
          onClick={onToggle}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            borderRadius: "8px",
            padding: "8px",
            fontSize: "11px",
            fontWeight: 700,
            color: "#64748B",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer"
          }}
        >
          {collapsed ? <ChevronRight style={{ width: "16px", height: "16px" }} /> : <><ChevronLeft style={{ width: "16px", height: "16px" }} /><span>Tutup Menu</span></>}
        </button>
      </div>
    </aside>
  );
}

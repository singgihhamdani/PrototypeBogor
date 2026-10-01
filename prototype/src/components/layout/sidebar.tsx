"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Map, Building2, ClipboardCheck, GraduationCap,
  Package, Landmark, FileBarChart, BookOpen, Newspaper, Settings,
  ChevronLeft, ChevronRight, ShieldAlert, ArrowUpRight, ChevronDown,
  Briefcase, Cog, HeartHandshake, Layers, HardHat, FileSpreadsheet,
  CheckCircle2, LucideIcon
} from "lucide-react";
import Logo, { BrandIcon } from "@/components/ui/logo";
import { useAuth, ROLE_CONFIGS, RoleCode } from "@/lib/mock-auth";

export interface NavChildItem {
  label: string;
  href: string;
  badge?: number | string;
  allowedRoles?: RoleCode[];
  allowedVariants?: string[];
}

export interface NavGroupItem {
  id: string;
  label: string;
  href?: string;
  icon: LucideIcon;
  badge?: number | string;
  allowedRoles?: RoleCode[];
  allowedVariants?: string[];
  children?: NavChildItem[];
}

export interface NavSection {
  sectionTitle: string;
  items: NavGroupItem[];
}

const navSections: NavSection[] = [
  {
    sectionTitle: "NAVIGASI UTAMA",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        allowedRoles: ["SUPER_ADMIN", "ADMIN_BIDANG", "EKSEKUTIF"]
      },
      {
        id: "webgis",
        label: "WebGIS Peta",
        href: "/webgis",
        icon: Map,
        allowedRoles: ["SUPER_ADMIN", "ADMIN_BIDANG", "EKSEKUTIF"]
      },
      {
        id: "bujk",
        label: "BUJK Master",
        href: "/bujk",
        icon: Building2,
        allowedRoles: ["SUPER_ADMIN", "ADMIN_BIDANG", "EKSEKUTIF"]
      }
    ]
  },
  {
    sectionTitle: "1. TERTIB JASA USAHA",
    items: [
      {
        id: "tertib-usaha",
        label: "Tertib Usaha",
        href: "/pengawasan/tertib-usaha",
        icon: Briefcase,
        allowedRoles: ["SUPER_ADMIN", "ADMIN_BIDANG", "EKSEKUTIF"],
        allowedVariants: ["PENGAWAS_ASESOR", "BINA_KONSTRUKSI"],
        badge: 2,
        children: [
          { label: "Ringkasan Modul", href: "/pengawasan/tertib-usaha" },
          { label: "Perencanaan Pengawasan", href: "/pengawasan/tertib-usaha/perencanaan" },
          { label: "Pelaksanaan SIMAK 1", href: "/pengawasan/tertib-usaha/pelaksanaan", badge: "12 Form" },
          { label: "Rekomendasi Tindak Lanjut", href: "/pengawasan/tertib-usaha/rekomendasi" },
          { label: "Pelaporan Usaha", href: "/pengawasan/tertib-usaha/pelaporan" }
        ]
      }
    ]
  },
  {
    sectionTitle: "2. TERTIB PENYELENGGARAAN",
    items: [
      {
        id: "tertib-penyelenggaraan",
        label: "Tertib Penyelenggaraan",
        href: "/pengawasan/tertib-penyelenggaraan",
        icon: Cog,
        allowedRoles: ["SUPER_ADMIN", "ADMIN_BIDANG", "EKSEKUTIF"],
        allowedVariants: ["PENGAWAS_ASESOR", "BINA_KONSTRUKSI"],
        badge: 1,
        children: [
          { label: "Ringkasan Modul", href: "/pengawasan/tertib-penyelenggaraan" },
          { label: "Perencanaan Pengawasan", href: "/pengawasan/tertib-penyelenggaraan/perencanaan" },
          { label: "Pelaksanaan SIMAK 2", href: "/pengawasan/tertib-penyelenggaraan/pelaksanaan", badge: "2a - 2d" },
          { label: "Rekomendasi Tindak Lanjut", href: "/pengawasan/tertib-penyelenggaraan/rekomendasi" },
          { label: "Pelaporan Penyelenggaraan", href: "/pengawasan/tertib-penyelenggaraan/pelaporan" }
        ]
      }
    ]
  },
  {
    sectionTitle: "3. TERTIB PEMANFAATAN",
    items: [
      {
        id: "tertib-pemanfaatan",
        label: "Tertib Pemanfaatan",
        href: "/pengawasan/tertib-pemanfaatan",
        icon: HeartHandshake,
        allowedRoles: ["SUPER_ADMIN", "ADMIN_BIDANG", "EKSEKUTIF"],
        allowedVariants: ["PENGAWAS_ASESOR", "BINA_KONSTRUKSI"],
        children: [
          { label: "Ringkasan Modul", href: "/pengawasan/tertib-pemanfaatan" },
          { label: "Perencanaan Pengawasan", href: "/pengawasan/tertib-pemanfaatan/perencanaan" },
          { label: "Pelaksanaan SIMAK 3", href: "/pengawasan/tertib-pemanfaatan/pelaksanaan", badge: "SIMAK 3" },
          { label: "Rekomendasi Tindak Lanjut", href: "/pengawasan/tertib-pemanfaatan/rekomendasi" },
          { label: "Pelaporan Pemanfaatan", href: "/pengawasan/tertib-pemanfaatan/pelaporan" }
        ]
      }
    ]
  },
  {
    sectionTitle: "4. SIPJAKI DATA MASTER",
    items: [
      {
        id: "sipjaki-master",
        label: "SIPJAKI Master",
        icon: Layers,
        allowedRoles: ["SUPER_ADMIN", "ADMIN_BIDANG", "EKSEKUTIF"],
        children: [
          { label: "Profil OPD PUPR", href: "/profil-opd" },
          { label: "Data Paket Pekerjaan", href: "/paket-pekerjaan" },
          { label: "Data Kecelakaan K3", href: "/kecelakaan" },
          { label: "Warta & Berita Jakon", href: "/berita" },
          { label: "Regulasi & Peraturan", href: "/regulasi" },
          { label: "Dashboard Pelatihan SIPJAKI", href: "/sipjaki/pelatihan" }
        ]
      }
    ]
  },
  {
    sectionTitle: "5. PELATIHAN & TKK",
    items: [
      {
        id: "pelatihan-tkk",
        label: "Pelatihan & TKK",
        href: "/pelatihan",
        icon: GraduationCap,
        allowedRoles: ["SUPER_ADMIN", "ADMIN_BIDANG", "EKSEKUTIF"],
        children: [
          { label: "Hub Pelatihan & TKK", href: "/pelatihan" },
          { label: "Perencanaan Pelatihan", href: "/pelatihan/perencanaan" },
          { label: "Laporan Sertifikasi TKK", href: "/pelatihan/laporan" },
          { label: "Rekapitulasi TKK", href: "/pelatihan/rekapitulasi" }
        ]
      }
    ]
  },
  {
    sectionTitle: "SISTEM & ADMINISTRASI",
    items: [
      {
        id: "pengawasan-hub",
        label: "Portal Pengawasan SIMAK",
        href: "/pengawasan",
        icon: ClipboardCheck,
        badge: 3,
        allowedRoles: ["SUPER_ADMIN", "ADMIN_BIDANG"]
      },
      {
        id: "pelaporan-terpadu",
        label: "Pelaporan SIPJAKI",
        href: "/pelaporan",
        icon: FileBarChart,
        allowedRoles: ["SUPER_ADMIN", "ADMIN_BIDANG", "EKSEKUTIF"]
      },
      {
        id: "pengaturan",
        label: "Pengaturan & Role",
        href: "/pengaturan",
        icon: Settings,
        allowedRoles: ["SUPER_ADMIN"]
      }
    ]
  }
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

  // State untuk melacak accordion group mana yang sedang terbuka
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "tertib-usaha": true,
    "tertib-penyelenggaraan": true,
    "tertib-pemanfaatan": false,
    "sipjaki-master": false,
    "pelatihan-tkk": false
  });

  // Auto-expand group jika user sedang berada di route child-nya
  useEffect(() => {
    navSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children) {
          const isChildActive = item.children.some(
            (c) => pathname === c.href || (c.href !== "/" && pathname.startsWith(c.href))
          );
          if (isChildActive) {
            setOpenGroups((prev) => ({ ...prev, [item.id]: true }));
          }
        }
      });
    });
  }, [pathname]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Filter items berdasarkan role
  const isItemVisible = (item: { allowedRoles?: RoleCode[]; allowedVariants?: string[] }) => {
    if (item.allowedRoles && !item.allowedRoles.includes(currentRole)) {
      return false;
    }
    if (currentRole === "ADMIN_BIDANG" && item.allowedVariants) {
      if (user?.variant && !item.allowedVariants.includes(user.variant)) {
        return false;
      }
    }
    return true;
  };

  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 40,
        height: "100vh",
        width: collapsed ? "72px" : "270px",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #E2E8F0",
        backgroundColor: "#FFFFFF",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "2px 0 10px rgba(0, 0, 0, 0.03)"
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
          <Link href="/dashboard" style={{ display: "inline-flex", textDecoration: "none" }}>
            <Logo size={36} theme="dark" subtitle="DPUPR KAB. BOGOR" />
          </Link>
        ) : (
          <Link href="/dashboard" style={{ display: "inline-flex", textDecoration: "none" }}>
            <BrandIcon size={32} bgBadge />
          </Link>
        )}
      </div>

      {/* Role Badge Indicator */}
      {!collapsed && user && (
        <div
          style={{
            padding: "8px 14px",
            backgroundColor: "#F8FAFC",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span style={{ fontSize: "9px", color: "#64748B", fontWeight: 800, textTransform: "uppercase" }}>
              Peran Aktif:
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  backgroundColor: roleConfig?.badgeBg || "#0F2E5C",
                  color: roleConfig?.badgeText || "#FFFFFF",
                  padding: "1px 8px",
                  borderRadius: "9999px",
                  whiteSpace: "nowrap"
                }}
              >
                {user.roleLabel || currentRole}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nav List */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}
      >
        {navSections.map((section, sIdx) => {
          const visibleItems = section.items.filter(isItemVisible);
          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {/* Section Header Label */}
              {!collapsed && (
                <div
                  style={{
                    padding: "6px 8px 3px 8px",
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "#94A3B8",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase"
                  }}
                >
                  {section.sectionTitle}
                </div>
              )}

              {visibleItems.map((item) => {
                const Icon = item.icon;
                const hasChildren = item.children && item.children.length > 0;
                const isGroupOpen = !!openGroups[item.id];

                const isDirectActive = item.href ? (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href) && !item.href.includes("/pengawasan/tertib"))) : false;
                const isChildActive = hasChildren && item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href));
                const isActive = isDirectActive || isChildActive;

                if (!hasChildren) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href || "#"}
                      title={collapsed ? item.label : undefined}
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        borderRadius: "10px",
                        padding: "8px 10px",
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
                          width: "17px",
                          height: "17px",
                          flexShrink: 0,
                          color: isActive ? "#FFC000" : "#64748B"
                        }}
                      />
                      {!collapsed && <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
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
                            height: "20px",
                            width: "3px",
                            borderTopRightRadius: "3px",
                            borderBottomRightRadius: "3px",
                            backgroundColor: "#FFC000"
                          }}
                        />
                      )}
                    </Link>
                  );
                }

                // If item has children (Accordion group)
                return (
                  <div key={item.id} style={{ display: "flex", flexDirection: "column" }}>
                    <div
                      onClick={() => {
                        if (collapsed) {
                          onToggle();
                        }
                        toggleGroup(item.id);
                      }}
                      title={collapsed ? item.label : undefined}
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        borderRadius: "10px",
                        padding: "8px 10px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        userSelect: "none",
                        transition: "all 0.15s ease",
                        backgroundColor: isActive && !isGroupOpen ? "#EBF2FA" : isGroupOpen ? "#F8FAFC" : "transparent",
                        color: isActive ? "#0F2E5C" : "#475569"
                      }}
                    >
                      <Icon
                        style={{
                          width: "17px",
                          height: "17px",
                          flexShrink: 0,
                          color: isActive ? "#0F2E5C" : "#64748B"
                        }}
                      />
                      {!collapsed && (
                        <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.label}
                        </span>
                      )}
                      {!collapsed && item.badge && (
                        <span
                          style={{
                            marginRight: "4px",
                            display: "flex",
                            height: "16px",
                            padding: "0 5px",
                            alignItems: "center",
                            borderRadius: "9999px",
                            fontSize: "9px",
                            fontWeight: 800,
                            backgroundColor: "#FEF3C7",
                            color: "#92400E"
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                      {!collapsed && (
                        <ChevronDown
                          style={{
                            width: "14px",
                            height: "14px",
                            color: "#94A3B8",
                            transition: "transform 0.2s ease",
                            transform: isGroupOpen ? "rotate(180deg)" : "rotate(0deg)"
                          }}
                        />
                      )}
                    </div>

                    {/* Submenu child items */}
                    {!collapsed && isGroupOpen && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "1px",
                          paddingLeft: "26px",
                          marginTop: "2px",
                          marginBottom: "4px",
                          borderLeft: "2px solid #E2E8F0",
                          marginLeft: "18px"
                        }}
                      >
                        {item.children?.map((child, cIdx) => {
                          const isChildCurrent = pathname === child.href;

                          return (
                            <Link
                              key={cIdx}
                              href={child.href}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                borderRadius: "8px",
                                padding: "6px 10px",
                                fontSize: "11px",
                                fontWeight: isChildCurrent ? 800 : 600,
                                textDecoration: "none",
                                transition: "all 0.15s ease",
                                backgroundColor: isChildCurrent ? "#0F2E5C" : "transparent",
                                color: isChildCurrent ? "#FFFFFF" : "#64748B"
                              }}
                            >
                              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {child.label}
                              </span>
                              {child.badge && (
                                <span
                                  style={{
                                    fontSize: "9px",
                                    fontWeight: 700,
                                    padding: "1px 5px",
                                    borderRadius: "4px",
                                    backgroundColor: isChildCurrent ? "rgba(255,255,255,0.2)" : "#F1F5F9",
                                    color: isChildCurrent ? "#FFFFFF" : "#475569"
                                  }}
                                >
                                  {child.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Public Home portal link */}
      <div style={{ padding: "0 10px 8px 10px" }}>
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            borderRadius: "10px",
            padding: collapsed ? "8px 0" : "8px 10px",
            justifyContent: collapsed ? "center" : "flex-start",
            fontSize: "11px",
            fontWeight: 700,
            color: "#0F2E5C",
            backgroundColor: "#F1F5F9",
            border: "1px solid #E2E8F0",
            textDecoration: "none"
          }}
          title="Buka Beranda Publik"
        >
          <ArrowUpRight style={{ width: "15px", height: "15px", color: "#2563EB", flexShrink: 0 }} />
          {!collapsed && <span>Portal Beranda Publik</span>}
        </Link>
      </div>

      {/* Gateway status */}
      {!collapsed && (
        <div
          style={{
            margin: "0 10px 10px 10px",
            padding: "8px 10px",
            borderRadius: "10px",
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            fontSize: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, color: "#1E293B" }}>
            <span style={{ height: "6px", width: "6px", borderRadius: "9999px", backgroundColor: "#10B981" }} />
            <span>SIPJAKI Sync</span>
          </div>
          <span style={{ fontSize: "10px", color: "#10B981", fontWeight: 800 }}>Aktif</span>
        </div>
      )}

      {/* Toggle button */}
      <div
        style={{
          borderTop: "1px solid #E2E8F0",
          padding: "8px",
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
            gap: "6px",
            borderRadius: "8px",
            padding: "6px",
            fontSize: "11px",
            fontWeight: 700,
            color: "#64748B",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer"
          }}
        >
          {collapsed ? <ChevronRight style={{ width: "16px", height: "16px" }} /> : <><ChevronLeft style={{ width: "16px", height: "16px" }} /><span>Ciutkan Menu</span></>}
        </button>
      </div>
    </aside>
  );
}

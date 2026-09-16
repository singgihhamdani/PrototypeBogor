"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Map, Building2, ClipboardCheck, GraduationCap,
  Package, Landmark, FileBarChart, BookOpen, Newspaper, Settings,
  ChevronLeft, ChevronRight, ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "WebGIS Peta", href: "/webgis", icon: Map },
  { label: "BUJK Master", href: "/bujk", icon: Building2 },
  { label: "Pengawasan SIMAK", href: "/pengawasan", icon: ClipboardCheck, badge: 3 },
  { label: "Paket Pekerjaan", href: "/paket-pekerjaan", icon: Package },
  { label: "Profil OPD PUPR", href: "/profil-opd", icon: Landmark },
  { label: "Pelatihan & TKK", href: "/pelatihan", icon: GraduationCap },
  { label: "Kecelakaan K3", href: "/kecelakaan", icon: ShieldAlert },
  { label: "Pelaporan SIPJAKI", href: "/pelaporan", icon: FileBarChart },
  { label: "Regulasi Jakon", href: "/regulasi", icon: BookOpen },
  { label: "Berita & Warta", href: "/berita", icon: Newspaper },
  { label: "Pengaturan & API", href: "/pengaturan", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

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
        {!collapsed && (
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div 
              style={{
                height: "36px",
                width: "36px",
                borderRadius: "10px",
                backgroundColor: "#FFC000",
                color: "#0F2E5C",
                fontWeight: 900,
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              PUPR
            </div>
            <div style={{ lineHeight: 1.15 }}>
              <span style={{ display: "block", fontSize: "14px", fontWeight: 900, color: "#FFFFFF", letterSpacing: "0.5px" }}>
                SIJAKON
              </span>
              <span style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "#FFC000", letterSpacing: "1px" }}>
                KAB. BOGOR
              </span>
            </div>
          </Link>
        )}
        {collapsed && (
          <div 
            style={{
              height: "36px",
              width: "36px",
              borderRadius: "10px",
              backgroundColor: "#FFC000",
              color: "#0F2E5C",
              fontWeight: 900,
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            PUPR
          </div>
        )}
      </div>

      {/* Nav List */}
      <nav 
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "4px"
        }}
      >
        {menuItems.map((item) => {
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

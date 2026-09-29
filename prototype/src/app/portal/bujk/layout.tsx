"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Building2, FileText, ClipboardList, ShieldAlert, LogOut, 
  Sparkles, ArrowLeft, ChevronDown 
} from "lucide-react";
import { BrandIcon } from "@/components/ui/logo";
import { useAuth } from "@/lib/mock-auth";
import RoleSwitcherModal from "@/components/layout/role-switcher-modal";

export default function BujkPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [activeHash, setActiveHash] = useState<string>("#dashboard");

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash || "#dashboard";
      setActiveHash(hash);
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/portal/login");
  };

  const navLinks = [
    { hash: "#dashboard", label: "Dashboard Badan Usaha", href: "/portal/bujk#dashboard", icon: Building2 },
    { hash: "#sbu", label: "Status SBU & NIB", href: "/portal/bujk#sbu", icon: FileText },
    { hash: "#proyek", label: "Paket Proyek Berjalan", href: "/portal/bujk#proyek", icon: ClipboardList },
    { hash: "#simak", label: "Pelaporan SIMAK & K3", href: "/portal/bujk#simak", icon: ShieldAlert },
  ];

  return (
    <div 
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Header Portal Rekanan */}
      <header
        style={{
          backgroundColor: "#0A2540",
          borderBottom: "3px solid #EA580C",
          color: "#FFFFFF",
          position: "sticky",
          top: 0,
          zIndex: 40,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}
      >
        <div
          style={{
            maxWidth: "1300px",
            margin: "0 auto",
            padding: "0 24px",
            height: "68px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px"
          }}
        >
          {/* Logo & Portal Identity */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/portal/bujk#dashboard" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <BrandIcon size={36} />
              <div>
                <span style={{ fontSize: "14px", fontWeight: 900, color: "#FFFFFF", letterSpacing: "0.5px", display: "block" }}>
                  PORTAL BUJK REKANAN
                </span>
                <span style={{ fontSize: "11px", color: "#FDBA74", fontWeight: 700 }}>
                  DPUPR KABUPATEN BOGOR
                </span>
              </div>
            </Link>

            <span style={{ height: "24px", width: "1px", backgroundColor: "rgba(255,255,255,0.2)" }} />

            {/* BUJK Badge */}
            <div 
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "rgba(255,255,255,0.08)",
                padding: "4px 12px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.15)"
              }}
            >
              <Building2 style={{ width: "16px", height: "16px", color: "#FB923C" }} />
              <div>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#FFFFFF", display: "block" }}>
                  {user?.bujkName || "PT Bangun Jaya Konstruksi"}
                </span>
                <span style={{ fontSize: "10px", color: "#CBD5E1" }}>
                  Kualifikasi: Menengah (M1) • NIB Terverifikasi
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Tools */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Role Switcher Trigger */}
            <button
              onClick={() => setShowSwitcher(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "9999px",
                backgroundColor: "#EA580C",
                border: "none",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 800,
                color: "#FFFFFF",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(234, 88, 12, 0.3)"
              }}
            >
              <Sparkles style={{ width: "14px", height: "14px" }} />
              <span>Simulasi Role</span>
              <ChevronDown style={{ width: "12px", height: "12px" }} />
            </button>

            {/* Back to Internal Dinas */}
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "10px",
                backgroundColor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                padding: "6px 12px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#E2E8F0",
                textDecoration: "none"
              }}
            >
              <ArrowLeft style={{ width: "14px", height: "14px" }} />
              <span>Dashboard Dinas</span>
            </Link>

            <button
              onClick={handleLogout}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "10px",
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                padding: "6px 12px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#FCA5A5",
                cursor: "pointer"
              }}
            >
              <LogOut style={{ width: "14px", height: "14px" }} />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Subnav Tabs with Dynamic Active State */}
        <div
          style={{
            backgroundColor: "rgba(10, 37, 64, 0.95)",
            borderTop: "1px solid rgba(255,255,255,0.1)"
          }}
        >
          <div
            style={{
              maxWidth: "1300px",
              margin: "0 auto",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              gap: "28px"
            }}
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeHash === link.hash || (activeHash === "" && link.hash === "#dashboard");
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setActiveHash(link.hash)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 2px",
                    fontSize: "12px",
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.65)",
                    textDecoration: "none",
                    borderBottom: isActive ? "3px solid #FB923C" : "3px solid transparent",
                    transition: "all 0.15s ease"
                  }}
                >
                  <Icon style={{ width: "16px", height: "16px", color: isActive ? "#FB923C" : "rgba(255, 255, 255, 0.5)" }} />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          maxWidth: "1300px",
          width: "100%",
          margin: "0 auto",
          padding: "28px 24px"
        }}
      >
        {children}
      </main>

      <RoleSwitcherModal isOpen={showSwitcher} onClose={() => setShowSwitcher(false)} />
    </div>
  );
}

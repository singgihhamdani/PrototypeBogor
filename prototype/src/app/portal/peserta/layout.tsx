"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  GraduationCap, BookOpen, Award, User, LogOut, 
  Sparkles, ArrowLeft, ChevronDown, CheckCircle2 
} from "lucide-react";
import Logo, { BrandIcon } from "@/components/ui/logo";
import { useAuth } from "@/lib/mock-auth";
import RoleSwitcherModal from "@/components/layout/role-switcher-modal";

export default function PesertaPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showSwitcher, setShowSwitcher] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/portal/login");
  };

  const navLinks = [
    { label: "Dashboard Peserta", href: "/portal/peserta", icon: GraduationCap },
    { label: "Jadwal Pelatihan", href: "/portal/peserta#jadwal", icon: BookOpen },
    { label: "Uji Kompetensi & Asesmen", href: "/portal/peserta#asesmen", icon: CheckCircle2 },
    { label: "E-Sertifikat SKK Digital", href: "/portal/peserta#sertifikat", icon: Award },
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
      {/* Header Portal Peserta */}
      <header
        style={{
          backgroundColor: "#0A2540",
          borderBottom: "3px solid #0284C7",
          color: "#FFFFFF",
          position: "sticky",
          top: 0,
          zIndex: 40,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}
      >
        <div
          style={{
            maxWidth: "1240px",
            margin: "0 auto",
            padding: "0 24px",
            height: "68px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px"
          }}
        >
          {/* Logo & Identity */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/portal/peserta" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <BrandIcon size={36} />
              <div>
                <span style={{ fontSize: "14px", fontWeight: 900, color: "#FFFFFF", letterSpacing: "0.5px", display: "block" }}>
                  PORTAL PESERTA TKK
                </span>
                <span style={{ fontSize: "11px", color: "#7DD3FC", fontWeight: 700 }}>
                  FASILITASI SERTIFIKASI SKK BOGOR
                </span>
              </div>
            </Link>

            <span style={{ height: "24px", width: "1px", backgroundColor: "rgba(255,255,255,0.2)" }} />

            {/* Peserta Info */}
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
              <User style={{ width: "16px", height: "16px", color: "#38BDF8" }} />
              <div>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#FFFFFF", display: "block" }}>
                  {user?.name || "Ahmad Fauzi, A.Md"}
                </span>
                <span style={{ fontSize: "10px", color: "#CBD5E1" }}>
                  NIK: 3201019203840003 • Jenjang 4
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
                backgroundColor: "#0284C7",
                border: "none",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 800,
                color: "#FFFFFF",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(2, 132, 199, 0.3)"
              }}
            >
              <Sparkles style={{ width: "14px", height: "14px" }} />
              <span>Simulasi Role</span>
              <ChevronDown style={{ width: "12px", height: "12px" }} />
            </button>

            {/* Back to Internal Dinas if authorized */}
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

        {/* Subnav Tabs */}
        <div
          style={{
            backgroundColor: "rgba(10, 37, 64, 0.8)",
            borderTop: "1px solid rgba(255,255,255,0.1)"
          }}
        >
          <div
            style={{
              maxWidth: "1240px",
              margin: "0 auto",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              gap: "20px"
            }}
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 4px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    textDecoration: "none",
                    borderBottom: "2px solid #0284C7"
                  }}
                >
                  <Icon style={{ width: "16px", height: "16px", color: "#38BDF8" }} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          maxWidth: "1240px",
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

"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { useResponsive } from "@/lib/use-responsive";
import AiCopilotDrawer from "@/components/common/ai-copilot-drawer";
import { useAuth } from "@/lib/mock-auth";
import { BrandIcon } from "@/components/ui/logo";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isMobile, isMounted } = useResponsive();
  const { user, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isInitialized && !user) {
      const redirectQuery = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${redirectQuery}`);
    }
  }, [isInitialized, user, pathname, router]);

  // If auth is not yet initialized or user is not logged in, show auth checking screen
  if (!isInitialized || !user) {
    return (
      <div 
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F8FAFC",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          gap: "16px",
          padding: "24px",
          textAlign: "center"
        }}
      >
        <div style={{ position: "relative" }}>
          <BrandIcon size={52} />
          <div 
            style={{
              position: "absolute",
              inset: "-6px",
              border: "3px solid #0F2E5C",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.9s linear infinite"
            }} 
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "15px", fontWeight: 800, color: "#0F2E5C" }}>
            Memverifikasi Hak Akses Sistem
          </span>
          <span style={{ fontSize: "12px", color: "#64748B" }}>
            Mengarahkan ke laman masuk SIJAKON Kabupaten Bogor...
          </span>
        </div>
      </div>
    );
  }

  // On mobile, sidebar does not push content margin
  const effectiveMarginLeft = isMounted && isMobile ? "0px" : (collapsed ? "72px" : "260px");

  return (
    <div 
      style={{ 
        display: "flex", 
        minHeight: "100vh", 
        backgroundColor: "#F8FAFC",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        position: "relative"
      }}
    >
      <Sidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      
      <div 
        className="dashboard-content-wrapper"
        style={{ 
          flex: 1, 
          marginLeft: effectiveMarginLeft, 
          minWidth: 0, 
          transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#F8FAFC"
        }}
      >
        <Topbar onMobileMenuClick={() => setMobileOpen(true)} />
        <main 
          className="dashboard-main-content"
          style={{ 
            padding: isMounted && isMobile ? "14px 12px" : "24px", 
            width: "100%", 
            maxWidth: "1400px", 
            margin: "0 auto",
            minWidth: 0,
            transition: "padding 0.2s ease"
          }}
        >
          {children}
        </main>
      </div>

      {/* SIJAKON AI Copilot Global Widget */}
      <AiCopilotDrawer />
    </div>
  );
}



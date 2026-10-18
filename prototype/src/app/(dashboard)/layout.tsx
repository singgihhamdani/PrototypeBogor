"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { useResponsive } from "@/lib/use-responsive";
import AiCopilotDrawer from "@/components/common/ai-copilot-drawer";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isMobile, isMounted } = useResponsive();

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



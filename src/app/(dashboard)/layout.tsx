"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div 
      style={{ 
        display: "flex", 
        minHeight: "100vh", 
        backgroundColor: "#F8FAFC",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
      }}
    >
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      
      <div 
        style={{ 
          flex: 1, 
          marginLeft: collapsed ? "72px" : "260px", 
          minWidth: 0, 
          transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#F8FAFC"
        }}
      >
        <Topbar />
        <main 
          style={{ 
            padding: "24px", 
            width: "100%", 
            maxWidth: "1400px", 
            margin: "0 auto",
            minWidth: 0
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, Calendar, Wallet, MapPin, Target } from "lucide-react";
import { TertibType, TERTIB_CONFIGS } from "@/lib/tertib-config";

interface PerencanaanSubtabNavProps {
  tertibType: TertibType;
  activeSubtab?: "overview" | "sdm" | "timeline" | "anggaran" | "pemetaan" | "target";
}

export default function PerencanaanSubtabNav({ tertibType }: PerencanaanSubtabNavProps) {
  const pathname = usePathname();
  const basePath = `/pengawasan/${tertibType}/perencanaan`;

  const tabs = [
    { slug: "overview", label: "Dashboard Perencanaan", href: basePath, icon: LayoutGrid },
    { slug: "sdm", label: "SDM Pengawas", href: `${basePath}/sdm`, icon: Users },
    { slug: "timeline", label: "Timeline", href: `${basePath}/timeline`, icon: Calendar },
    { slug: "anggaran", label: "Anggaran", href: `${basePath}/anggaran`, icon: Wallet },
    { slug: "pemetaan", label: "Pemetaan Objek", href: `${basePath}/pemetaan`, icon: MapPin },
    { slug: "target", label: "Target Sasaran", href: `${basePath}/target`, icon: Target },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        overflowX: "auto",
        padding: "6px",
        backgroundColor: "#FFFFFF",
        borderRadius: "14px",
        border: "1px solid #E2E8F0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        marginBottom: "20px"
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.slug === "overview" 
          ? pathname === basePath 
          : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.slug}
            href={tab.href}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: 700,
              textDecoration: "none",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
              backgroundColor: isActive ? "#0F2E5C" : "transparent",
              color: isActive ? "#FFFFFF" : "#64748B"
            }}
          >
            <Icon style={{ width: "15px", height: "15px", color: isActive ? "#FFC000" : "#94A3B8" }} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

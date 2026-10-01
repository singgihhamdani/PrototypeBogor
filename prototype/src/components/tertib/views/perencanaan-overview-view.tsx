"use client";
import React from "react";
import ModuleHeader from "@/components/layout/module-header";
import PerencanaanSubtabNav from "@/components/tertib/perencanaan-subtab-nav";
import PerencanaanCardGrid from "@/components/tertib/perencanaan-card-grid";
import { TertibType, TERTIB_CONFIGS } from "@/lib/tertib-config";
import { Plus, Download } from "lucide-react";

interface PerencanaanOverviewViewProps {
  tertibType: TertibType;
}

export default function PerencanaanOverviewView({ tertibType }: PerencanaanOverviewViewProps) {
  const config = TERTIB_CONFIGS[tertibType];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <ModuleHeader
        breadcrumbs={[
          { label: config.shortTitle, href: config.basePath },
          { label: "Perencanaan Pengawasan" }
        ]}
        badgeText={config.pilar}
        badgeBg={config.badgeBg}
        badgeColor={config.badgeColor}
        title={`Perencanaan Pengawasan ${config.shortTitle}`}
        description="Kelola seluruh aspek perencanaan pengawasan mulai dari pemetaan objek hingga alokasi anggaran dalam satu dasbor terpadu."
        legalBasis={config.legalBasis}
        actionButtons={[
          {
            label: "Unduh Rencana Pengawasan",
            icon: Download,
            onClick: () => alert("Mengunduh Rencana Tahunan Pengawasan format SIPJAKI (.pdf)...")
          }
        ]}
      />

      <PerencanaanSubtabNav tertibType={tertibType} activeSubtab="overview" />

      {/* 5-Card Grid */}
      <PerencanaanCardGrid tertibType={tertibType} />

      {/* Info Notice Box */}
      <div
        style={{
          marginTop: "10px",
          padding: "16px 20px",
          borderRadius: "16px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px"
        }}
      >
        <div>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#1E293B" }}>
            Tahapan Perencanaan Terintegrasi SIPJAKI PUPR
          </span>
          <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
            Data SDM, Timeline, Anggaran, Pemetaan, dan Target akan disinkronisasikan ke Server SIPJAKI Nasional untuk audit tahun berjalan.
          </p>
        </div>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 800,
            padding: "4px 12px",
            borderRadius: "9999px",
            backgroundColor: "#DCFCE7",
            color: "#166534"
          }}
        >
          Status Sinkronisasi: Terhubung
        </span>
      </div>
    </div>
  );
}

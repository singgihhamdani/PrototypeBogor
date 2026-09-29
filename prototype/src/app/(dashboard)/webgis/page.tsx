"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Layers, Filter, MapPin, Building2, ChevronRight, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import districtsData from "@/data/districts.json";
import projectsData from "@/data/projects.json";

const MapComponent = dynamic(() => import("@/components/webgis/map-container"), { 
  ssr: false, 
  loading: () => (
    <div style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F1F5F9", color: "#64748B", fontSize: "14px", fontWeight: 700 }}>
      Memuat Peta Spasial Kabupaten Bogor...
    </div>
  ) 
});

export default function WebGISPage() {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [layer, setLayer] = useState<"projects" | "bujk">("projects");

  const filteredProjects = selectedDistrict
    ? projectsData.filter((p) => p.districtId === selectedDistrict)
    : projectsData;

  const currentDistrictName = districtsData.find((d) => d.id === selectedDistrict)?.name;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <MapPin style={{ width: "12px", height: "12px" }} /> Peta Geospasial SIPJAKI
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            WebGIS Peta Interaktif Jasa Konstruksi
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
            Sebaran spasial 342 paket pekerjaan fisik dan sebaran BUJK di 40 kecamatan se-Kabupaten Bogor
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setLayer("projects")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "10px",
              padding: "8px 16px",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              backgroundColor: layer === "projects" ? "#0F2E5C" : "#FFFFFF",
              color: layer === "projects" ? "#FFFFFF" : "#475569",
              border: layer === "projects" ? "none" : "1px solid #CBD5E1",
              borderBottom: layer === "projects" ? "3px solid #FFC000" : "1px solid #CBD5E1",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}
          >
            <MapPin style={{ width: "14px", height: "14px", color: layer === "projects" ? "#FFC000" : "#64748B" }} />
            <span>Paket Proyek (342)</span>
          </button>
          
          <button
            type="button"
            onClick={() => setLayer("bujk")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "10px",
              padding: "8px 16px",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              backgroundColor: layer === "bujk" ? "#0F2E5C" : "#FFFFFF",
              color: layer === "bujk" ? "#FFFFFF" : "#475569",
              border: layer === "bujk" ? "none" : "1px solid #CBD5E1",
              borderBottom: layer === "bujk" ? "3px solid #FFC000" : "1px solid #CBD5E1",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}
          >
            <Building2 style={{ width: "14px", height: "14px", color: layer === "bujk" ? "#FFC000" : "#64748B" }} />
            <span>Titik BUJK (1.240)</span>
          </button>

          {selectedDistrict && (
            <button
              type="button"
              onClick={() => setSelectedDistrict(null)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "10px",
                padding: "8px 14px",
                fontSize: "12px",
                fontWeight: 800,
                backgroundColor: "#FEF2F2",
                color: "#DC2626",
                border: "1px solid #FECACA",
                cursor: "pointer"
              }}
            >
              <Filter style={{ width: "14px", height: "14px" }} />
              <span>Reset Filter Kecamatan</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: Map + Project Sidebar */}
      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 380px", 
          gap: "20px", 
          height: "calc(100vh - 210px)",
          minHeight: "560px"
        }}
      >
        {/* Left: Map Container */}
        <div 
          style={{
            borderRadius: "18px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            position: "relative"
          }}
        >
          <MapComponent
            districts={districtsData}
            projects={projectsData}
            layer={layer}
            onSelectDistrict={setSelectedDistrict}
            selectedDistrict={selectedDistrict}
          />
        </div>

        {/* Right: Sidebar Project List */}
        <div 
          style={{
            borderRadius: "18px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            overflow: "hidden"
          }}
        >
          {/* Header of sidebar */}
          <div style={{ paddingBottom: "14px", borderBottom: "1px solid #F1F5F9", marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                {selectedDistrict ? `Kecamatan ${currentDistrictName}` : "Semua Proyek"}
              </h3>
              <p style={{ fontSize: "11px", color: "#64748B", margin: "2px 0 0 0" }}>
                Menampilkan {filteredProjects.length} paket pekerjaan APBD 2026
              </p>
            </div>
            <span style={{ fontSize: "11px", fontWeight: 800, backgroundColor: "#EBF2FA", color: "#0F2E5C", padding: "4px 10px", borderRadius: "8px" }}>
              {filteredProjects.length} Paket
            </span>
          </div>

          {/* Scrollable list with explicit card spacing */}
          <div 
            style={{ 
              overflowY: "auto", 
              flex: 1, 
              paddingRight: "6px",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}
          >
            {filteredProjects.map((p) => {
              const currentIdx = Math.max(0, p.realProgress.filter((v: number) => v > 0).length - 1);
              const target = p.planProgress[currentIdx] || 60;
              const deviasi = p.physProgress - target;
              return (
                <div 
                  key={p.id} 
                  style={{
                    borderRadius: "14px",
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#FFFFFF",
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)",
                    transition: "all 0.15s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#0F2E5C";
                    e.currentTarget.style.backgroundColor = "#F8FAFC";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", margin: 0, lineHeight: 1.35 }}>
                      {p.name}
                    </p>
                    <span 
                      style={{
                        fontSize: "10px",
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        flexShrink: 0,
                        backgroundColor: deviasi >= 0 ? "#ECFDF5" : "#FEF2F2",
                        color: deviasi >= 0 ? "#059669" : "#DC2626"
                      }}
                    >
                      {deviasi >= 0 ? `+${deviasi}% Ahead` : `${deviasi}% Delay`}
                    </span>
                  </div>

                  <p style={{ fontSize: "11px", color: "#64748B", margin: 0 }}>
                    {p.contractor}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "6px", borderTop: "1px solid #F1F5F9" }}>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", fontFamily: "monospace" }}>
                      {formatCurrency(p.contractValue)}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "64px", height: "6px", backgroundColor: "#E2E8F0", borderRadius: "9999px", overflow: "hidden" }}>
                        <div 
                          style={{
                            width: `${p.physProgress}%`,
                            height: "100%",
                            backgroundColor: p.physProgress >= target ? "#059669" : "#DC2626",
                            borderRadius: "9999px"
                          }}
                        />
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F172A" }}>
                        {p.physProgress}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredProjects.length === 0 && (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#94A3B8", fontSize: "13px" }}>
                Tidak ada proyek yang terdaftar di kecamatan ini.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

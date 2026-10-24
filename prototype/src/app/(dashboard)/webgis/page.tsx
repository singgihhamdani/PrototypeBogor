"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { 
  Layers, Filter, MapPin, Building2, ChevronRight, CheckCircle2, 
  List, Map as MapIcon, SlidersHorizontal, Database as DbIcon, Loader2, RefreshCw
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import districtsData from "@/data/districts.json";
import { useResponsive } from "@/lib/use-responsive";
import { 
  fetchPaketList, fetchBUJKList, 
  PaketItem, BUJKItem, DataSourceStatus 
} from "@/lib/services/master-data";

const MapComponent = dynamic(() => import("@/components/webgis/map-container"), { 
  ssr: false, 
  loading: () => (
    <div style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F1F5F9", color: "#64748B", fontSize: "14px", fontWeight: 700 }}>
      Memuat Peta Spasial Kabupaten Bogor...
    </div>
  ) 
});

interface MappedProject {
  id: string;
  name: string;
  contractor: string;
  contractValue: number;
  physProgress: number;
  lat: number;
  lng: number;
  districtId: string;
  planProgress: number[];
  realProgress: number[];
}

export default function WebGISPage() {
  const { isMobile, isMounted } = useResponsive();
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [layer, setLayer] = useState<"projects" | "bujk">("projects");
  const [mobileViewMode, setMobileViewMode] = useState<"peta" | "daftar" | "split">("peta");

  const [projects, setProjects] = useState<MappedProject[]>([]);
  const [bujkCount, setBujkCount] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState<DataSourceStatus>({
    source: "fallback",
    message: "Menghubungkan ke basis data..."
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [paketRes, bujkRes] = await Promise.all([
        fetchPaketList(),
        fetchBUJKList()
      ]);

      const mapped: MappedProject[] = paketRes.data.map((p) => {
        const planArr = Array.isArray(p.kurva_s_rencana) ? (p.kurva_s_rencana as number[]) : [0, 20, 40, 60, 80, 100];
        const realArr = Array.isArray(p.kurva_s_realisasi) ? (p.kurva_s_realisasi as number[]) : [0, 15, 35, 55, 68];
        return {
          id: p.id,
          name: p.nama_paket,
          contractor: p.nama_penyedia,
          contractValue: Number(p.nilai_kontrak) || 0,
          physProgress: Number(p.progres_fisik) || 0,
          lat: Number(p.lat) || -6.4816,
          lng: Number(p.lng) || 106.8516,
          districtId: p.kode_kecamatan || "01",
          planProgress: planArr,
          realProgress: realArr
        };
      });

      setProjects(mapped);
      setBujkCount(bujkRes.data.length);
      setDataStatus(paketRes.status);
    } catch (err) {
      console.error("Gagal load WebGIS live data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProjects = selectedDistrict
    ? projects.filter((p) => p.districtId === selectedDistrict)
    : projects;

  const currentDistrictName = districtsData.find((d) => d.id === selectedDistrict)?.name;
  const isSmallScreen = isMounted && isMobile;

  // Recalculate district projects dynamically
  const dynamicDistricts = districtsData.map((d) => {
    const pCount = projects.filter(p => p.districtId === d.id).length;
    return {
      ...d,
      projects: pCount > 0 ? pCount : d.projects
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <MapPin style={{ width: "12px", height: "12px" }} /> Peta Geospasial SIPJAKI
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: "9999px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                backgroundColor: dataStatus.source === "supabase" ? "#DCFCE7" : "#FEF3C7",
                color: dataStatus.source === "supabase" ? "#166534" : "#92400E",
                border: `1px solid ${dataStatus.source === "supabase" ? "#86EFAC" : "#FDE68A"}`
              }}
            >
              <DbIcon style={{ width: "11px", height: "11px" }} />
              <span>{dataStatus.source === "supabase" ? "PostgreSQL (Live)" : "Cadangan Lokal"}</span>
            </span>
          </div>
          <h1 style={{ fontSize: isSmallScreen ? "20px" : "24px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            WebGIS Peta Interaktif Jasa Konstruksi
          </h1>
          <p style={{ fontSize: "12.5px", color: "#64748B", margin: "4px 0 0 0" }}>
            Sebaran spasial {projects.length} paket pekerjaan fisik dan sebaran {bujkCount} BUJK di 40 kecamatan se-Kabupaten Bogor
          </p>
        </div>

        {/* Layer Switches & Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", width: isSmallScreen ? "100%" : "auto" }}>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "10px",
              padding: isSmallScreen ? "7px 12px" : "8px 14px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              backgroundColor: "#FFFFFF",
              color: "#334155",
              border: "1px solid #CBD5E1",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}
          >
            {loading ? <Loader2 style={{ width: "13px", height: "13px", animation: "spin 1s linear infinite" }} /> : <RefreshCw style={{ width: "13px", height: "13px" }} />}
            <span>Segarkan</span>
          </button>

          <button
            type="button"
            onClick={() => setLayer("projects")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "10px",
              padding: isSmallScreen ? "7px 12px" : "8px 16px",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              backgroundColor: layer === "projects" ? "#0F2E5C" : "#FFFFFF",
              color: layer === "projects" ? "#FFFFFF" : "#475569",
              border: layer === "projects" ? "none" : "1px solid #CBD5E1",
              borderBottom: layer === "projects" ? "3px solid #FFC000" : "1px solid #CBD5E1",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              flex: isSmallScreen ? 1 : "initial",
              justifyContent: "center"
            }}
          >
            <MapPin style={{ width: "14px", height: "14px", color: layer === "projects" ? "#FFC000" : "#64748B" }} />
            <span>Paket Proyek ({projects.length})</span>
          </button>
          
          <button
            type="button"
            onClick={() => setLayer("bujk")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "10px",
              padding: isSmallScreen ? "7px 12px" : "8px 16px",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              backgroundColor: layer === "bujk" ? "#0F2E5C" : "#FFFFFF",
              color: layer === "bujk" ? "#FFFFFF" : "#475569",
              border: layer === "bujk" ? "none" : "1px solid #CBD5E1",
              borderBottom: layer === "bujk" ? "3px solid #FFC000" : "1px solid #CBD5E1",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              flex: isSmallScreen ? 1 : "initial",
              justifyContent: "center"
            }}
          >
            <Building2 style={{ width: "14px", height: "14px", color: layer === "bujk" ? "#FFC000" : "#64748B" }} />
            <span>Titik BUJK ({bujkCount})</span>
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
                padding: "7px 12px",
                fontSize: "11px",
                fontWeight: 800,
                backgroundColor: "#FEF2F2",
                color: "#DC2626",
                border: "1px solid #FECACA",
                cursor: "pointer",
                width: isSmallScreen ? "100%" : "auto",
                justifyContent: "center"
              }}
            >
              <Filter style={{ width: "13px", height: "13px" }} />
              <span>Reset Filter ({currentDistrictName || "Kecamatan"})</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Mode Switcher Tabs */}
      {isSmallScreen && (
        <div 
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#F1F5F9",
            padding: "4px",
            borderRadius: "12px",
            gap: "4px",
            border: "1px solid #E2E8F0"
          }}
        >
          <button
            type="button"
            onClick={() => setMobileViewMode("peta")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 800,
              border: "none",
              cursor: "pointer",
              backgroundColor: mobileViewMode === "peta" ? "#0F2E5C" : "transparent",
              color: mobileViewMode === "peta" ? "#FFFFFF" : "#64748B",
              transition: "all 0.15s ease",
              boxShadow: mobileViewMode === "peta" ? "0 2px 5px rgba(15, 46, 92, 0.2)" : "none"
            }}
          >
            <MapIcon style={{ width: "14px", height: "14px", color: mobileViewMode === "peta" ? "#FFC000" : "#94A3B8" }} />
            <span>Peta</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileViewMode("daftar")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 800,
              border: "none",
              cursor: "pointer",
              backgroundColor: mobileViewMode === "daftar" ? "#0F2E5C" : "transparent",
              color: mobileViewMode === "daftar" ? "#FFFFFF" : "#64748B",
              transition: "all 0.15s ease",
              boxShadow: mobileViewMode === "daftar" ? "0 2px 5px rgba(15, 46, 92, 0.2)" : "none"
            }}
          >
            <List style={{ width: "14px", height: "14px", color: mobileViewMode === "daftar" ? "#FFC000" : "#94A3B8" }} />
            <span>Daftar ({filteredProjects.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileViewMode("split")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 800,
              border: "none",
              cursor: "pointer",
              backgroundColor: mobileViewMode === "split" ? "#0F2E5C" : "transparent",
              color: mobileViewMode === "split" ? "#FFFFFF" : "#64748B",
              transition: "all 0.15s ease",
              boxShadow: mobileViewMode === "split" ? "0 2px 5px rgba(15, 46, 92, 0.2)" : "none"
            }}
          >
            <SlidersHorizontal style={{ width: "14px", height: "14px", color: mobileViewMode === "split" ? "#FFC000" : "#94A3B8" }} />
            <span>Tumpuk</span>
          </button>
        </div>
      )}

      {/* Grid: Map + Project Sidebar */}
      <div 
        style={{ 
          display: isSmallScreen ? "flex" : "grid", 
          flexDirection: isSmallScreen ? "column" : undefined,
          gridTemplateColumns: isSmallScreen ? undefined : "1fr 380px", 
          gap: "16px", 
          height: isSmallScreen ? "auto" : "calc(100vh - 210px)",
          minHeight: isSmallScreen ? "auto" : "560px"
        }}
      >
        {/* Left / Top: Map Container */}
        {(!isSmallScreen || mobileViewMode === "peta" || mobileViewMode === "split") && (
          <div 
            style={{
              borderRadius: "18px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              position: "relative",
              zIndex: 1,
              isolation: "isolate",
              width: "100%",
              height: isSmallScreen 
                ? (mobileViewMode === "split" ? "360px" : "calc(100vh - 290px)")
                : "100%",
              minHeight: isSmallScreen ? (mobileViewMode === "split" ? "340px" : "460px") : "auto"
            }}
          >
            <MapComponent
              districts={dynamicDistricts}
              projects={projects}
              layer={layer}
              onSelectDistrict={setSelectedDistrict}
              selectedDistrict={selectedDistrict}
            />

            {/* Quick Floating Action on Mobile "Peta" Mode */}
            {isSmallScreen && mobileViewMode === "peta" && (
              <div
                style={{
                  position: "absolute",
                  bottom: "16px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <button
                  type="button"
                  onClick={() => setMobileViewMode("daftar")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "#0F2E5C",
                    color: "#FFFFFF",
                    padding: "9px 18px",
                    borderRadius: "9999px",
                    border: "none",
                    borderBottom: "3px solid #FFC000",
                    fontSize: "12px",
                    fontWeight: 800,
                    boxShadow: "0 4px 14px rgba(15, 46, 92, 0.35)",
                    cursor: "pointer"
                  }}
                >
                  <List style={{ width: "14px", height: "14px", color: "#FFC000" }} />
                  <span>Lihat {filteredProjects.length} Proyek {selectedDistrict ? `(${currentDistrictName})` : ""}</span>
                  <ChevronRight style={{ width: "14px", height: "14px" }} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Right / Bottom: Sidebar Project List */}
        {(!isSmallScreen || mobileViewMode === "daftar" || mobileViewMode === "split") && (
          <div 
            style={{
              borderRadius: "18px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              padding: isSmallScreen ? "16px" : "20px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              overflow: "hidden",
              width: "100%",
              height: isSmallScreen ? (mobileViewMode === "split" ? "420px" : "auto") : "100%",
              minHeight: isSmallScreen && mobileViewMode === "daftar" ? "480px" : "auto"
            }}
          >
            {/* Header of sidebar */}
            <div style={{ paddingBottom: "12px", borderBottom: "1px solid #F1F5F9", marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                  {selectedDistrict ? `Kecamatan ${currentDistrictName}` : "Semua Proyek"}
                </h3>
                <p style={{ fontSize: "11px", color: "#64748B", margin: "2px 0 0 0" }}>
                  Menampilkan {filteredProjects.length} paket pekerjaan {dataStatus.source === "supabase" ? "PostgreSQL Live" : "APBD 2026"}
                </p>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 800, backgroundColor: "#EBF2FA", color: "#0F2E5C", padding: "4px 10px", borderRadius: "8px" }}>
                {filteredProjects.length} Paket
              </span>
            </div>

            {/* Scrollable list with explicit card spacing */}
            <div 
              className="custom-touch-scroll"
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
        )}
      </div>
    </div>
  );
}

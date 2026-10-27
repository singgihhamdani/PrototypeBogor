"use client";
import dynamic from "next/dynamic";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  MapPin, Building2, ChevronRight, CheckCircle2, 
  List, SlidersHorizontal, Database as DbIcon, Loader2, RefreshCw,
  Search, X, RotateCcw, Globe, Satellite, Activity, Coins,
  Award, Briefcase, ShieldCheck, Phone, Mail, ExternalLink
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import districtsData from "@/data/districts.json";
import { useResponsive } from "@/lib/use-responsive";
import { 
  fetchPaketList, fetchBUJKList, 
  DataSourceStatus 
} from "@/lib/services/master-data";
import type { MapProjectItem, MapBUJKItem } from "@/components/webgis/map-container";

const MapComponent = dynamic(() => import("@/components/webgis/map-container"), { 
  ssr: false, 
  loading: () => (
    <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC", color: "#64748B", fontSize: "14px", fontWeight: 700, gap: "12px" }}>
      <Loader2 style={{ width: "24px", height: "24px", animation: "spin 1s linear infinite", color: "#0F2E5C" }} />
      <span>Memuat Peta Spasial Kabupaten Bogor...</span>
    </div>
  ) 
});

export default function WebGISPage() {
  const { isMobile, isMounted } = useResponsive();
  
  // Data State
  const [projects, setProjects] = useState<MapProjectItem[]>([]);
  const [bujkList, setBujkList] = useState<MapBUJKItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState<DataSourceStatus>({
    source: "fallback",
    message: "Menghubungkan ke basis data..."
  });

  // Layer & Map Controls
  const [layer, setLayer] = useState<"projects" | "bujk">("projects");
  const [basemap, setBasemap] = useState<"osm" | "satellite">("osm");
  const [mobileViewMode, setMobileViewMode] = useState<"peta" | "daftar" | "split">("peta");
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  // Common Search
  const [searchQuery, setSearchQuery] = useState("");

  // Multi-Criteria Filters for Paket Pekerjaan (Non-Kurva S)
  const [progressFilter, setProgressFilter] = useState<"all" | "0" | "1-50" | "51-99" | "100">("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [scaleFilter, setScaleFilter] = useState<"all" | "large" | "medium" | "small">("all");

  // Multi-Criteria Filters for BUJK
  const [bujkQualFilter, setBujkQualFilter] = useState<"all" | "Besar" | "Menengah" | "Kecil">("all");
  const [bujkTypeFilter, setBujkTypeFilter] = useState<string>("all");
  const [bujkStatusFilter, setBujkStatusFilter] = useState<string>("all");
  const [bujkProjectFilter, setBujkProjectFilter] = useState<"all" | "active" | "none">("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const [paketRes, bujkRes] = await Promise.all([
        fetchPaketList(),
        fetchBUJKList()
      ]);

      // Map Live Paket Pekerjaan
      const mappedPaket: MapProjectItem[] = paketRes.data.map((p) => {
        const dMatch = districtsData.find((d) => d.id === p.kode_kecamatan || d.name.toLowerCase() === (p.kecamatan || "").toLowerCase());
        const dName = dMatch?.name || p.kecamatan || "Kabupaten Bogor";
        return {
          id: p.id,
          name: p.nama_paket,
          contractor: p.nama_penyedia || "Belum Ditentukan",
          contractValue: Number(p.nilai_kontrak) || 0,
          physProgress: Number(p.progres_fisik) || 0,
          source: (p.sumber_dana as string) || "APBD",
          owner: p.nama_instansi || "DPU Kab. Bogor",
          status: (p.status_pekerjaan as string) || "Pelaksanaan",
          lat: Number(p.lat) || (dMatch?.lat || -6.4816),
          lng: Number(p.lng) || (dMatch?.lng || 106.8516),
          districtId: p.kode_kecamatan || dMatch?.id || "01",
          districtName: dName
        };
      });

      // Map Live BUJK
      const mappedBUJK: MapBUJKItem[] = bujkRes.data.map((b) => {
        const dMatch = districtsData.find((d) => 
          (b.kode_kecamatan && d.id === b.kode_kecamatan) || 
          d.name.toLowerCase() === (b.kecamatan || "").toLowerCase()
        );
        const dName = dMatch?.name || b.kecamatan || "Kabupaten Bogor";
        return {
          id: b.id,
          name: b.nama_badan_usaha,
          type: b.bentuk_usaha || "PT",
          nib: b.nib,
          leader: b.penanggung_jawab,
          qualification: (b.kualifikasi as any) || "Kecil",
          district: dName,
          districtId: b.kode_kecamatan || dMatch?.id || "01",
          address: b.alamat,
          phone: b.telepon || "-",
          email: b.email || "-",
          sbuCount: Number(b.jumlah_sbu) || 1,
          sbuExpiry: b.tanggal_kedaluwarsa_sbu || "-",
          status: b.status_verifikasi || "Aktif",
          projectsActive: Number(b.proyek_aktif_count) || 0,
          lat: Number(dMatch?.lat || -6.4816),
          lng: Number(dMatch?.lng || 106.8516)
        };
      });

      setProjects(mappedPaket);
      setBujkList(mappedBUJK);
      setDataStatus(paketRes.status);
    } catch (err) {
      console.error("Gagal memuat live data WebGIS:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Application Logic for Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (selectedDistrict && p.districtId !== selectedDistrict) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchContractor = p.contractor.toLowerCase().includes(q);
        const matchId = p.id.toLowerCase().includes(q);
        const matchDistrict = (p.districtName || "").toLowerCase().includes(q);
        if (!matchName && !matchContractor && !matchId && !matchDistrict) return false;
      }

      if (progressFilter === "0" && p.physProgress !== 0) return false;
      if (progressFilter === "1-50" && (p.physProgress <= 0 || p.physProgress > 50)) return false;
      if (progressFilter === "51-99" && (p.physProgress <= 50 || p.physProgress >= 100)) return false;
      if (progressFilter === "100" && p.physProgress !== 100) return false;

      if (sourceFilter !== "all" && (p.source || "").toUpperCase() !== sourceFilter.toUpperCase()) return false;
      if (statusFilter !== "all" && (p.status || "").toLowerCase() !== statusFilter.toLowerCase()) return false;

      if (scaleFilter === "large" && p.contractValue < 5000000000) return false;
      if (scaleFilter === "medium" && (p.contractValue < 1000000000 || p.contractValue >= 5000000000)) return false;
      if (scaleFilter === "small" && p.contractValue >= 1000000000) return false;

      return true;
    });
  }, [projects, selectedDistrict, searchQuery, progressFilter, sourceFilter, statusFilter, scaleFilter]);

  // Filter Application Logic for BUJK
  const filteredBujk = useMemo(() => {
    return bujkList.filter((b) => {
      if (selectedDistrict && b.districtId !== selectedDistrict) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = b.name.toLowerCase().includes(q);
        const matchLeader = b.leader.toLowerCase().includes(q);
        const matchNib = b.nib.toLowerCase().includes(q);
        const matchAddress = b.address.toLowerCase().includes(q);
        const matchDistrict = b.district.toLowerCase().includes(q);
        if (!matchName && !matchLeader && !matchNib && !matchAddress && !matchDistrict) return false;
      }

      if (bujkQualFilter !== "all" && b.qualification !== bujkQualFilter) return false;
      if (bujkTypeFilter !== "all" && b.type !== bujkTypeFilter) return false;
      if (bujkStatusFilter !== "all" && b.status !== bujkStatusFilter) return false;

      if (bujkProjectFilter === "active" && b.projectsActive === 0) return false;
      if (bujkProjectFilter === "none" && b.projectsActive > 0) return false;

      return true;
    });
  }, [bujkList, selectedDistrict, searchQuery, bujkQualFilter, bujkTypeFilter, bujkStatusFilter, bujkProjectFilter]);

  // Recalculate district projects & bujk dynamically based on current live data
  const dynamicDistricts = useMemo(() => {
    return districtsData.map((d) => {
      const pCount = projects.filter(p => p.districtId === d.id).length;
      const bCount = bujkList.filter(b => b.districtId === d.id).length;
      return {
        ...d,
        projects: pCount,
        bujk: bCount
      };
    });
  }, [projects, bujkList]);

  // Aggregate Calculations
  const totalFilteredValue = filteredProjects.reduce((acc, curr) => acc + curr.contractValue, 0);
  const avgFilteredProgress = filteredProjects.length > 0
    ? Math.round(filteredProjects.reduce((acc, curr) => acc + curr.physProgress, 0) / filteredProjects.length)
    : 0;

  const bujkBesarCount = filteredBujk.filter(b => b.qualification === "Besar").length;
  const bujkMenengahCount = filteredBujk.filter(b => b.qualification === "Menengah").length;
  const bujkKecilCount = filteredBujk.filter(b => b.qualification === "Kecil").length;
  const totalActiveProjectsInBujk = filteredBujk.reduce((acc, curr) => acc + curr.projectsActive, 0);

  const currentDistrictName = districtsData.find((d) => d.id === selectedDistrict)?.name;
  const isSmallScreen = isMounted && isMobile;

  // Active filter status
  const hasActiveFilter = layer === "projects"
    ? (selectedDistrict !== null || searchQuery.trim() !== "" || progressFilter !== "all" || sourceFilter !== "all" || statusFilter !== "all" || scaleFilter !== "all")
    : (selectedDistrict !== null || searchQuery.trim() !== "" || bujkQualFilter !== "all" || bujkTypeFilter !== "all" || bujkStatusFilter !== "all" || bujkProjectFilter !== "all");

  const handleResetFilters = () => {
    setSelectedDistrict(null);
    setSearchQuery("");
    if (layer === "projects") {
      setProgressFilter("all");
      setSourceFilter("all");
      setStatusFilter("all");
      setScaleFilter("all");
    } else {
      setBujkQualFilter("all");
      setBujkTypeFilter("all");
      setBujkStatusFilter("all");
      setBujkProjectFilter("all");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* 1. Header Bar */}
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
            {layer === "projects" ? (
              <>Memantau sebaran spasial <strong>{filteredProjects.length}</strong> dari {projects.length} paket pekerjaan fisik di 40 kecamatan se-Kabupaten Bogor</>
            ) : (
              <>Memantau sebaran spasial <strong>{filteredBujk.length}</strong> dari {bujkList.length} Badan Usaha Jasa Konstruksi (BUJK) di 40 kecamatan se-Kabupaten Bogor</>
            )}
          </p>
        </div>

        {/* Controls: Basemap & Layer Switchers */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", width: isSmallScreen ? "100%" : "auto" }}>
          {/* Refresh Button */}
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

          {/* Basemap Switcher Toggle */}
          <div style={{ display: "inline-flex", borderRadius: "10px", border: "1px solid #CBD5E1", overflow: "hidden", backgroundColor: "#FFFFFF" }}>
            <button
              type="button"
              onClick={() => setBasemap("osm")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "8px 12px",
                fontSize: "11px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                backgroundColor: basemap === "osm" ? "#0F2E5C" : "#FFFFFF",
                color: basemap === "osm" ? "#FFFFFF" : "#475569"
              }}
            >
              <Globe style={{ width: "13px", height: "13px" }} />
              <span>Peta Jalan</span>
            </button>
            <button
              type="button"
              onClick={() => setBasemap("satellite")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "8px 12px",
                fontSize: "11px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                backgroundColor: basemap === "satellite" ? "#0F2E5C" : "#FFFFFF",
                color: basemap === "satellite" ? "#FFFFFF" : "#475569"
              }}
            >
              <Satellite style={{ width: "13px", height: "13px" }} />
              <span>Citra Satelit</span>
            </button>
          </div>

          {/* Layer Switches */}
          <button
            type="button"
            onClick={() => {
              setLayer("projects");
              setSelectedDistrict(null);
            }}
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
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}
          >
            <MapPin style={{ width: "14px", height: "14px", color: layer === "projects" ? "#FFC000" : "#64748B" }} />
            <span>Paket ({projects.length})</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setLayer("bujk");
              setSelectedDistrict(null);
            }}
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
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}
          >
            <Building2 style={{ width: "14px", height: "14px", color: layer === "bujk" ? "#FFC000" : "#64748B" }} />
            <span>BUJK ({bujkList.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Multi-Criteria Filter Bar (Adapts to Active Layer) */}
      <div 
        style={{ 
          backgroundColor: "#FFFFFF", 
          borderRadius: "16px", 
          border: "1px solid #E2E8F0", 
          padding: "14px 18px", 
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#0F2E5C", fontWeight: 800, fontSize: "12px", letterSpacing: "0.3px" }}>
            <SlidersHorizontal style={{ width: "14px", height: "14px", color: "#0F2E5C" }} />
            <span>{layer === "projects" ? "FILTER SPASIAL & STATUS PROYEK" : "FILTER SPASIAL & PROFIL REKANAN BUJK"}</span>
          </div>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#DC2626",
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECACA",
                padding: "4px 10px",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              <RotateCcw style={{ width: "12px", height: "12px" }} />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Dynamic Filter Inputs Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
          {/* A. Search Box */}
          <div style={{ position: "relative" }}>
            <Search style={{ width: "14px", height: "14px", color: "#64748B", position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={layer === "projects" ? "Cari nama paket, penyedia, ID..." : "Cari nama BUJK, direktur, NIB..."}
              style={{
                width: "100%",
                height: "36px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                padding: "0 10px 0 32px",
                fontSize: "12px",
                outline: "none",
                backgroundColor: "#F8FAFC",
                color: "#1E293B"
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#94A3B8" }}
              >
                <X style={{ width: "13px", height: "13px" }} />
              </button>
            )}
          </div>

          {layer === "projects" ? (
            /* PROJECT FILTERS */
            <>
              {/* B1. Filter Capaian Fisik Riil */}
              <div style={{ position: "relative" }}>
                <Activity style={{ width: "14px", height: "14px", color: progressFilter !== "all" ? "#0F2E5C" : "#64748B", position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <select
                  value={progressFilter}
                  onChange={(e) => setProgressFilter(e.target.value as any)}
                  style={{
                    width: "100%",
                    height: "36px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    padding: "0 10px 0 32px",
                    fontSize: "12px",
                    outline: "none",
                    backgroundColor: progressFilter !== "all" ? "#EBF2FA" : "#F8FAFC",
                    color: progressFilter !== "all" ? "#0F2E5C" : "#334155",
                    fontWeight: progressFilter !== "all" ? 700 : 500,
                    cursor: "pointer"
                  }}
                >
                  <option value="all">Semua Progres Fisik</option>
                  <option value="100">100% — Selesai Fisik</option>
                  <option value="51-99">51% – 99% — Lanjutan</option>
                  <option value="1-50">1% – 50% — Tahap Awal</option>
                  <option value="0">0% — Belum Mulai</option>
                </select>
              </div>

              {/* C1. Filter Sumber Dana */}
              <div style={{ position: "relative" }}>
                <Coins style={{ width: "14px", height: "14px", color: sourceFilter !== "all" ? "#0F2E5C" : "#64748B", position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  style={{
                    width: "100%",
                    height: "36px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    padding: "0 10px 0 32px",
                    fontSize: "12px",
                    outline: "none",
                    backgroundColor: sourceFilter !== "all" ? "#EBF2FA" : "#F8FAFC",
                    color: sourceFilter !== "all" ? "#0F2E5C" : "#334155",
                    fontWeight: sourceFilter !== "all" ? 700 : 500,
                    cursor: "pointer"
                  }}
                >
                  <option value="all">Semua Sumber Dana</option>
                  <option value="APBD">APBD Kab. Bogor</option>
                  <option value="DAK">DAK Fisik Pusat</option>
                  <option value="APBN">APBN / Banprov</option>
                </select>
              </div>

              {/* D1. Filter Status Pekerjaan */}
              <div style={{ position: "relative" }}>
                <CheckCircle2 style={{ width: "14px", height: "14px", color: statusFilter !== "all" ? "#0F2E5C" : "#64748B", position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    width: "100%",
                    height: "36px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    padding: "0 10px 0 32px",
                    fontSize: "12px",
                    outline: "none",
                    backgroundColor: statusFilter !== "all" ? "#EBF2FA" : "#F8FAFC",
                    color: statusFilter !== "all" ? "#0F2E5C" : "#334155",
                    fontWeight: statusFilter !== "all" ? 700 : 500,
                    cursor: "pointer"
                  }}
                >
                  <option value="all">Semua Status Kontrak</option>
                  <option value="Pelaksanaan">Sedang Pelaksanaan</option>
                  <option value="Selesai">Telah Selesai (PHO)</option>
                  <option value="Persiapan">Tahap Persiapan</option>
                </select>
              </div>

              {/* E1. Filter Skala Nilai Kontrak */}
              <div style={{ position: "relative" }}>
                <Building2 style={{ width: "14px", height: "14px", color: scaleFilter !== "all" ? "#0F2E5C" : "#64748B", position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <select
                  value={scaleFilter}
                  onChange={(e) => setScaleFilter(e.target.value as any)}
                  style={{
                    width: "100%",
                    height: "36px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    padding: "0 10px 0 32px",
                    fontSize: "12px",
                    outline: "none",
                    backgroundColor: scaleFilter !== "all" ? "#EBF2FA" : "#F8FAFC",
                    color: scaleFilter !== "all" ? "#0F2E5C" : "#334155",
                    fontWeight: scaleFilter !== "all" ? 700 : 500,
                    cursor: "pointer"
                  }}
                >
                  <option value="all">Semua Nilai Kontrak</option>
                  <option value="large">Besar (&gt; Rp 5 Miliar)</option>
                  <option value="medium">Menengah (Rp 1M – 5M)</option>
                  <option value="small">Kecil (&lt; Rp 1 Miliar)</option>
                </select>
              </div>
            </>
          ) : (
            /* BUJK FILTERS */
            <>
              {/* B2. Filter Kualifikasi BUJK */}
              <div style={{ position: "relative" }}>
                <Award style={{ width: "14px", height: "14px", color: bujkQualFilter !== "all" ? "#0F2E5C" : "#64748B", position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <select
                  value={bujkQualFilter}
                  onChange={(e) => setBujkQualFilter(e.target.value as any)}
                  style={{
                    width: "100%",
                    height: "36px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    padding: "0 10px 0 32px",
                    fontSize: "12px",
                    outline: "none",
                    backgroundColor: bujkQualFilter !== "all" ? "#EBF2FA" : "#F8FAFC",
                    color: bujkQualFilter !== "all" ? "#0F2E5C" : "#334155",
                    fontWeight: bujkQualFilter !== "all" ? 700 : 500,
                    cursor: "pointer"
                  }}
                >
                  <option value="all">Semua Kualifikasi</option>
                  <option value="Besar">Kualifikasi Besar (B1/B2)</option>
                  <option value="Menengah">Kualifikasi Menengah (M1/M2)</option>
                  <option value="Kecil">Kualifikasi Kecil (K1/K2/K3)</option>
                </select>
              </div>

              {/* C2. Filter Bentuk Usaha */}
              <div style={{ position: "relative" }}>
                <Building2 style={{ width: "14px", height: "14px", color: bujkTypeFilter !== "all" ? "#0F2E5C" : "#64748B", position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <select
                  value={bujkTypeFilter}
                  onChange={(e) => setBujkTypeFilter(e.target.value)}
                  style={{
                    width: "100%",
                    height: "36px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    padding: "0 10px 0 32px",
                    fontSize: "12px",
                    outline: "none",
                    backgroundColor: bujkTypeFilter !== "all" ? "#EBF2FA" : "#F8FAFC",
                    color: bujkTypeFilter !== "all" ? "#0F2E5C" : "#334155",
                    fontWeight: bujkTypeFilter !== "all" ? 700 : 500,
                    cursor: "pointer"
                  }}
                >
                  <option value="all">Semua Bentuk Usaha</option>
                  <option value="PT">Perseroan Terbatas (PT)</option>
                  <option value="CV">Commanditaire Vennootschap (CV)</option>
                </select>
              </div>

              {/* D2. Filter Status Verifikasi */}
              <div style={{ position: "relative" }}>
                <ShieldCheck style={{ width: "14px", height: "14px", color: bujkStatusFilter !== "all" ? "#0F2E5C" : "#64748B", position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <select
                  value={bujkStatusFilter}
                  onChange={(e) => setBujkStatusFilter(e.target.value)}
                  style={{
                    width: "100%",
                    height: "36px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    padding: "0 10px 0 32px",
                    fontSize: "12px",
                    outline: "none",
                    backgroundColor: bujkStatusFilter !== "all" ? "#EBF2FA" : "#F8FAFC",
                    color: bujkStatusFilter !== "all" ? "#0F2E5C" : "#334155",
                    fontWeight: bujkStatusFilter !== "all" ? 700 : 500,
                    cursor: "pointer"
                  }}
                >
                  <option value="all">Semua Status Legalitas</option>
                  <option value="Aktif">Terverifikasi Aktif</option>
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                </select>
              </div>

              {/* E2. Filter Proyek Berjalan */}
              <div style={{ position: "relative" }}>
                <Briefcase style={{ width: "14px", height: "14px", color: bujkProjectFilter !== "all" ? "#0F2E5C" : "#64748B", position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <select
                  value={bujkProjectFilter}
                  onChange={(e) => setBujkProjectFilter(e.target.value as any)}
                  style={{
                    width: "100%",
                    height: "36px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    padding: "0 10px 0 32px",
                    fontSize: "12px",
                    outline: "none",
                    backgroundColor: bujkProjectFilter !== "all" ? "#EBF2FA" : "#F8FAFC",
                    color: bujkProjectFilter !== "all" ? "#0F2E5C" : "#334155",
                    fontWeight: bujkProjectFilter !== "all" ? 700 : 500,
                    cursor: "pointer"
                  }}
                >
                  <option value="all">Semua Status Proyek</option>
                  <option value="active">Memiliki Proyek Berjalan</option>
                  <option value="none">Belum Ada Proyek</option>
                </select>
              </div>
            </>
          )}

          {/* F. Filter Kecamatan (Shared) */}
          <div style={{ position: "relative" }}>
            <MapPin style={{ width: "14px", height: "14px", color: selectedDistrict ? "#0F2E5C" : "#64748B", position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <select
              value={selectedDistrict || "all"}
              onChange={(e) => setSelectedDistrict(e.target.value === "all" ? null : e.target.value)}
              style={{
                width: "100%",
                height: "36px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                padding: "0 10px 0 32px",
                fontSize: "12px",
                outline: "none",
                backgroundColor: selectedDistrict ? "#EBF2FA" : "#F8FAFC",
                color: selectedDistrict ? "#0F2E5C" : "#334155",
                fontWeight: selectedDistrict ? 700 : 500,
                cursor: "pointer"
              }}
            >
              <option value="all">Semua Kecamatan (40 Wilayah)</option>
              {dynamicDistricts.map((d) => (
                <option key={d.id} value={d.id}>
                  Kec. {d.name} ({layer === "projects" ? `${d.projects} Paket` : `${d.bujk} BUJK`})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Mobile Mode Switcher Tabs */}
      {isSmallScreen && (
        <div 
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FFFFFF",
            padding: "4px",
            borderRadius: "12px",
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
              cursor: "pointer",
              border: "none",
              backgroundColor: mobileViewMode === "peta" ? "#0F2E5C" : "transparent",
              color: mobileViewMode === "peta" ? "#FFFFFF" : "#64748B"
            }}
          >
            <MapPin style={{ width: "13px", height: "13px" }} />
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
              cursor: "pointer",
              border: "none",
              backgroundColor: mobileViewMode === "daftar" ? "#0F2E5C" : "transparent",
              color: mobileViewMode === "daftar" ? "#FFFFFF" : "#64748B"
            }}
          >
            <List style={{ width: "13px", height: "13px" }} />
            <span>Daftar ({layer === "projects" ? filteredProjects.length : filteredBujk.length})</span>
          </button>
        </div>
      )}

      {/* 4. Split Grid Layout: Map (70%) + Sidebar (30%) */}
      <div 
        style={{
          display: "grid",
          gridTemplateColumns: isSmallScreen ? "1fr" : "minmax(0, 7fr) minmax(0, 3fr)",
          gap: "16px",
          height: isSmallScreen ? "auto" : "calc(100vh - 280px)",
          minHeight: isSmallScreen ? "auto" : "640px"
        }}
      >
        {/* Left: Map Container with Markers & Floating Legend */}
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
                ? (mobileViewMode === "split" ? "360px" : "calc(100vh - 310px)")
                : "100%",
              minHeight: isSmallScreen ? (mobileViewMode === "split" ? "340px" : "480px") : "auto"
            }}
          >
            <MapComponent
              districts={dynamicDistricts}
              projects={filteredProjects}
              bujkList={filteredBujk}
              layer={layer}
              onSelectDistrict={setSelectedDistrict}
              selectedDistrict={selectedDistrict}
              basemap={basemap}
              totalProjectsCount={projects.length}
              totalBujkCount={bujkList.length}
            />
          </div>
        )}

        {/* Right: Sidebar Data List (Adapts to Active Layer) */}
        {(!isSmallScreen || mobileViewMode === "daftar" || mobileViewMode === "split") && (
          <div 
            style={{
              borderRadius: "18px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              padding: isSmallScreen ? "16px" : "18px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              overflow: "hidden",
              width: "100%",
              height: isSmallScreen ? (mobileViewMode === "split" ? "420px" : "auto") : "100%",
              minHeight: isSmallScreen && mobileViewMode === "daftar" ? "480px" : "auto"
            }}
          >
            {layer === "projects" ? (
              /* SIDEBAR PAKET PEKERJAAN */
              <>
                {/* Aggregate Metric Header */}
                <div style={{ paddingBottom: "12px", borderBottom: "1px solid #F1F5F9", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                      {selectedDistrict ? `Kecamatan ${currentDistrictName}` : "Hasil Filter Spasial"}
                    </h3>
                    <span style={{ fontSize: "11px", fontWeight: 800, backgroundColor: "#EBF2FA", color: "#0F2E5C", padding: "3px 8px", borderRadius: "6px" }}>
                      {filteredProjects.length} Paket
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748B" }}>
                    <span>Akumulasi: <strong style={{ color: "#0F172A" }}>{formatCurrency(totalFilteredValue)}</strong></span>
                    <span>Rerata Fisik: <strong style={{ color: avgFilteredProgress >= 70 ? "#059669" : "#2563EB" }}>{avgFilteredProgress}%</strong></span>
                  </div>
                </div>

                {/* Scrollable Project Cards */}
                <div 
                  style={{ 
                    overflowY: "auto", 
                    flex: 1, 
                    paddingRight: "4px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }}
                >
                  {filteredProjects.map((p) => {
                    const isFinished = p.physProgress >= 100;
                    const isNearDone = p.physProgress > 50;
                    const progressColor = isFinished ? "#059669" : isNearDone ? "#2563EB" : p.physProgress > 0 ? "#D97706" : "#64748B";

                    return (
                      <div 
                        key={p.id} 
                        style={{
                          borderRadius: "12px",
                          border: "1px solid #E2E8F0",
                          backgroundColor: "#FFFFFF",
                          padding: "12px 14px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                              <span style={{ fontSize: "10px", fontWeight: 800, fontFamily: "monospace", backgroundColor: "#F1F5F9", color: "#475569", padding: "1px 5px", borderRadius: "4px" }}>
                                {p.id}
                              </span>
                              <span style={{ fontSize: "10px", color: "#64748B" }}>
                                Kec. {p.districtName}
                              </span>
                            </div>
                            <p style={{ fontSize: "12.5px", fontWeight: 800, color: "#0F172A", margin: 0, lineHeight: 1.3 }}>
                              {p.name}
                            </p>
                          </div>

                          <span 
                            style={{
                              fontSize: "10px",
                              fontWeight: 800,
                              padding: "2px 7px",
                              borderRadius: "9999px",
                              flexShrink: 0,
                              backgroundColor: isFinished ? "#ECFDF5" : "#EFF6FF",
                              color: isFinished ? "#059669" : "#1D4ED8"
                            }}
                          >
                            {p.status || (isFinished ? "Selesai" : "Pelaksanaan")}
                          </span>
                        </div>

                        <p style={{ fontSize: "11px", color: "#64748B", margin: 0 }}>
                          Penyedia: <strong style={{ color: "#334155" }}>{p.contractor}</strong>
                        </p>

                        {/* Progress Bar & Value */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "6px", borderTop: "1px solid #F8FAFC", marginTop: "2px" }}>
                          <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#0F2E5C", fontFamily: "monospace" }}>
                            {formatCurrency(p.contractValue)}
                          </span>

                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <div style={{ width: "50px", height: "5px", backgroundColor: "#E2E8F0", borderRadius: "9999px", overflow: "hidden" }}>
                              <div 
                                style={{
                                  width: `${p.physProgress}%`,
                                  height: "100%",
                                  backgroundColor: progressColor,
                                  borderRadius: "9999px"
                                }}
                              />
                            </div>
                            <span style={{ fontSize: "11px", fontWeight: 800, color: progressColor }}>
                              {p.physProgress}%
                            </span>
                          </div>
                        </div>

                        {/* Action link */}
                        <Link
                          href={`/paket-pekerjaan/${p.id}`}
                          style={{
                            fontSize: "10.5px",
                            fontWeight: 700,
                            color: "#0F2E5C",
                            textDecoration: "none",
                            marginTop: "2px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px"
                          }}
                        >
                          <span>Lihat Rincian Paket</span>
                          <ChevronRight style={{ width: "12px", height: "12px" }} />
                        </Link>
                      </div>
                    );
                  })}

                  {filteredProjects.length === 0 && (
                    <div style={{ padding: "36px 16px", textAlign: "center", color: "#94A3B8", fontSize: "12.5px" }}>
                      <p style={{ margin: "0 0 8px 0" }}>Tidak ada paket yang sesuai dengan kriteria filter.</p>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#0F2E5C",
                          backgroundColor: "#EBF2FA",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor: "pointer"
                        }}
                      >
                        Reset Filter
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* SIDEBAR BUJK (10 REKANAN) */
              <>
                {/* Aggregate Metric Header */}
                <div style={{ paddingBottom: "12px", borderBottom: "1px solid #F1F5F9", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                      {selectedDistrict ? `Kecamatan ${currentDistrictName}` : "Hasil Filter Rekanan"}
                    </h3>
                    <span style={{ fontSize: "11px", fontWeight: 800, backgroundColor: "#F3E8FF", color: "#6B21A8", padding: "3px 8px", borderRadius: "6px" }}>
                      {filteredBujk.length} BUJK
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11px", color: "#64748B" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>Kualifikasi BUJK:</span>
                      <span style={{ fontWeight: 800 }}>
                        <span style={{ color: "#7C3AED" }}>{bujkBesarCount} Besar</span>
                        <span style={{ color: "#94A3B8", margin: "0 4px" }}>•</span>
                        <span style={{ color: "#2563EB" }}>{bujkMenengahCount} Menengah</span>
                        <span style={{ color: "#94A3B8", margin: "0 4px" }}>•</span>
                        <span style={{ color: "#059669" }}>{bujkKecilCount} Kecil</span>
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>Proyek Berjalan:</span>
                      <strong style={{ color: "#059669" }}>{totalActiveProjectsInBujk} Paket Fisik</strong>
                    </div>
                  </div>
                </div>

                {/* Scrollable BUJK Cards */}
                <div 
                  style={{ 
                    overflowY: "auto", 
                    flex: 1, 
                    paddingRight: "4px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }}
                >
                  {filteredBujk.map((b) => {
                    const isBesar = b.qualification === "Besar";
                    const isMenengah = b.qualification === "Menengah";
                    const qualBg = isBesar ? "#F3E8FF" : isMenengah ? "#EFF6FF" : "#ECFDF5";
                    const qualColor = isBesar ? "#6B21A8" : isMenengah ? "#1D4ED8" : "#059669";
                    const isVerified = b.status === "Aktif";

                    return (
                      <div 
                        key={b.id} 
                        style={{
                          borderRadius: "12px",
                          border: "1px solid #E2E8F0",
                          backgroundColor: "#FFFFFF",
                          padding: "12px 14px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                              <span style={{ fontSize: "10px", fontWeight: 800, fontFamily: "monospace", backgroundColor: "#F1F5F9", color: "#475569", padding: "1px 5px", borderRadius: "4px" }}>
                                {b.id}
                              </span>
                              <span style={{ fontSize: "10px", color: "#64748B" }}>
                                Kec. {b.district}
                              </span>
                            </div>
                            <p style={{ fontSize: "12.5px", fontWeight: 800, color: "#0F172A", margin: 0, lineHeight: 1.3 }}>
                              {b.name}
                            </p>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px", flexShrink: 0 }}>
                            <span 
                              style={{
                                fontSize: "10px",
                                fontWeight: 800,
                                padding: "2px 7px",
                                borderRadius: "9999px",
                                backgroundColor: qualBg,
                                color: qualColor
                              }}
                            >
                              {b.qualification}
                            </span>
                            <span 
                              style={{
                                fontSize: "9.5px",
                                fontWeight: 700,
                                padding: "1px 6px",
                                borderRadius: "9999px",
                                backgroundColor: isVerified ? "#ECFDF5" : "#FEF3C7",
                                color: isVerified ? "#059669" : "#B45309"
                              }}
                            >
                              {isVerified ? "Aktif" : "Menunggu"}
                            </span>
                          </div>
                        </div>

                        <p style={{ fontSize: "11px", color: "#64748B", margin: 0 }}>
                          Pimpinan: <strong style={{ color: "#334155" }}>{b.leader}</strong>
                        </p>

                        {/* NIB & SBU info */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "6px", borderTop: "1px solid #F8FAFC", marginTop: "2px", fontSize: "10.5px", color: "#64748B" }}>
                          <span>NIB: <strong style={{ fontFamily: "monospace", color: "#334155" }}>{b.nib}</strong></span>
                          <span>{b.sbuCount} SBU Aktif</span>
                        </div>

                        {/* Proyek Aktif status */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "10.5px" }}>
                          <span style={{ color: "#64748B" }}>Proyek Berjalan:</span>
                          <span style={{ fontWeight: 800, color: b.projectsActive > 0 ? "#059669" : "#64748B" }}>
                            {b.projectsActive > 0 ? `${b.projectsActive} Paket Fisik` : "Belum Ada"}
                          </span>
                        </div>

                        {/* Action link to BUJK Master */}
                        <Link
                          href="/bujk"
                          style={{
                            fontSize: "10.5px",
                            fontWeight: 700,
                            color: "#0F2E5C",
                            textDecoration: "none",
                            marginTop: "2px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px"
                          }}
                        >
                          <span>Buka Profil Master BUJK</span>
                          <ChevronRight style={{ width: "12px", height: "12px" }} />
                        </Link>
                      </div>
                    );
                  })}

                  {filteredBujk.length === 0 && (
                    <div style={{ padding: "36px 16px", textAlign: "center", color: "#94A3B8", fontSize: "12.5px" }}>
                      <p style={{ margin: "0 0 8px 0" }}>Tidak ada BUJK yang sesuai dengan kriteria filter.</p>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#0F2E5C",
                          backgroundColor: "#EBF2FA",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor: "pointer"
                        }}
                      >
                        Reset Filter
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

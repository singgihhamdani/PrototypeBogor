"use client";
import { useState, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import projectsData from "@/data/projects.json";
import districtsData from "@/data/districts.json";
import { formatCurrency } from "@/lib/utils";
import { HardHat, Layers, MapPin, Eye, ExternalLink, Filter } from "lucide-react";
import Link from "next/link";

// Custom SVG Icon creator for Leaflet
function createCustomMarker(progress: number, isSelected: boolean) {
  const color = progress === 100 ? "#10B981" : progress > 60 ? "#1B3061" : "#F59E0B";
  const size = isSelected ? 42 : 34;

  const svgHtml = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
      <div style="
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: ${color};
        box-shadow: 0 4px 14px rgba(0,0,0,0.3);
        border: 2.5px solid #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
      ">
        <svg width="${size * 0.45}" height="${size * 0.45}" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      <div style="
        position: absolute;
        bottom: -6px;
        right: -4px;
        background: #FFC000;
        color: #1B3061;
        font-size: 9px;
        font-weight: 800;
        padding: 1px 4px;
        border-radius: 6px;
        border: 1px solid #ffffff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        font-family: system-ui, sans-serif;
      ">${progress}%</div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: "custom-leaflet-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

export default function HomeMap() {
  const [mounted, setMounted] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [activeProject, setActiveProject] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredProjects = useMemo(() => {
    if (selectedFilter === "ALL") return projectsData;
    if (selectedFilter === "JALAN") {
      return projectsData.filter((p) => p.name.toLowerCase().includes("jalan") || p.name.toLowerCase().includes("jembatan"));
    }
    if (selectedFilter === "GEDUNG") {
      return projectsData.filter((p) => p.name.toLowerCase().includes("gedung") || p.name.toLowerCase().includes("rumah") || p.name.toLowerCase().includes("pos"));
    }
    if (selectedFilter === "IRIGASI") {
      return projectsData.filter((p) => p.name.toLowerCase().includes("drainase") || p.name.toLowerCase().includes("irigasi"));
    }
    return projectsData;
  }, [selectedFilter]);

  if (!mounted) {
    return (
      <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 520, borderRadius: 28, overflow: "hidden", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#64748B" }}>Memuat Peta Spasial Kabupaten Bogor...</span>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 520, borderRadius: 28, overflow: "hidden" }}>
      {/* Map Filter Controls Bar */}
      <div style={{
        position: "absolute",
        top: 16,
        left: 16,
        zIndex: 20,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        padding: "6px 8px",
        borderRadius: 99,
        display: "flex",
        alignItems: "center",
        gap: 6,
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
        border: "1px solid rgba(255,255,255,0.8)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 8px", color: "#1B3061", fontWeight: 800, fontSize: "0.72rem" }}>
          <Filter size={13} />
          <span>PROYEK:</span>
        </div>
        {[
          { id: "ALL", label: `Semua (${projectsData.length})` },
          { id: "JALAN", label: "Jalan & Jembatan" },
          { id: "GEDUNG", label: "Gedung" },
          { id: "IRIGASI", label: "Irigasi & Drainase" },
        ].map((tab) => {
          const isActive = selectedFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              style={{
                border: "none",
                background: isActive ? "#1B3061" : "transparent",
                color: isActive ? "#FFC000" : "#475569",
                padding: "6px 12px",
                borderRadius: 99,
                fontSize: "0.75rem",
                fontWeight: isActive ? 700 : 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Leaflet Map Canvas */}
      <MapContainer
        center={[-6.56, 106.84]}
        zoom={10}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%", minHeight: 520, zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* District reference subtle dots */}
        {districtsData.slice(0, 15).map((d) => (
          <CircleMarker
            key={d.id}
            center={[d.lat, d.lng]}
            radius={4}
            pathOptions={{
              fillColor: "#94a3b8",
              color: "#ffffff",
              weight: 1.5,
              fillOpacity: 0.6,
            }}
          >
            <Popup>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#1B3061" }}>
                Kecamatan {d.name}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Real Projects Markers */}
        {filteredProjects.map((p) => {
          const isSelected = activeProject === p.id;
          return (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={createCustomMarker(p.physProgress, isSelected)}
              eventHandlers={{
                click: () => setActiveProject(p.id),
              }}
            >
              <Popup className="custom-project-popup">
                <div style={{ minWidth: 230, padding: "4px 2px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: 99,
                      background: p.status === "Selesai" ? "#DCFCE7" : "#DBEAFE",
                      color: p.status === "Selesai" ? "#15803D" : "#1D4ED8",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      {p.status}
                    </span>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748B" }}>
                      {p.source} • {p.fiscalYear}
                    </span>
                  </div>

                  <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", margin: "0 0 6px 0", lineHeight: 1.3 }}>
                    {p.name}
                  </h4>

                  <div style={{ fontSize: "11px", color: "#475569", marginBottom: 4 }}>
                    <span style={{ color: "#94A3B8" }}>Pelaksana: </span>
                    <strong style={{ color: "#1E293B" }}>{p.contractor}</strong>
                  </div>

                  <div style={{ fontSize: "12px", fontWeight: 800, color: "#1B3061", marginBottom: 8 }}>
                    {formatCurrency(p.contractValue)}
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: 700, marginBottom: 3, color: "#475569" }}>
                      <span>Progres Fisik ({p.physMonth})</span>
                      <span style={{ color: "#10B981" }}>{p.physProgress}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 99, background: "#E2E8F0", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: `${p.physProgress}%`,
                        background: "linear-gradient(90deg, #1B3061 0%, #10B981 100%)",
                        borderRadius: 99
                      }} />
                    </div>
                  </div>

                  <Link
                    href="/login"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      background: "#1B3061",
                      color: "#FFC000",
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: "11px",
                      fontWeight: 700,
                      textDecoration: "none",
                      transition: "0.2s"
                    }}
                  >
                    Buka Rincian Proyek <ExternalLink size={12} />
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay bottom right */}
      <div style={{
        position: "absolute",
        bottom: 16,
        right: 16,
        zIndex: 20,
        background: "rgba(255, 255, 255, 0.94)",
        backdropFilter: "blur(12px)",
        padding: "10px 14px",
        borderRadius: 14,
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
        border: "1px solid rgba(255,255,255,0.8)",
        fontSize: "10px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        color: "#334155"
      }}>
        <div style={{ fontWeight: 800, color: "#1B3061", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Status Proyek Konstruksi
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#1B3061", display: "inline-block" }} />
          <span>Pelaksanaan Berjalan (&gt;60%)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B", display: "inline-block" }} />
          <span>Pelaksanaan Awal (&lt;60%)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
          <span>Selesai (100%)</span>
        </div>
      </div>
    </div>
  );
}

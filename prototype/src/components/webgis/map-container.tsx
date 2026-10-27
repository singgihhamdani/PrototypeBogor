"use client";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { formatCurrency } from "@/lib/utils";
import MapLegend from "./map-legend";

export interface District {
  id: string;
  name: string;
  lat: number;
  lng: number;
  projects: number;
  bujk: number;
}

export interface MapProjectItem {
  id: string;
  name: string;
  contractor: string;
  contractValue: number;
  physProgress: number;
  source?: string;
  owner?: string;
  status?: string;
  districtId: string;
  districtName?: string;
  lat: number;
  lng: number;
}

export interface MapBUJKItem {
  id: string;
  name: string;
  type: string;
  nib: string;
  leader: string;
  qualification: "Besar" | "Menengah" | "Kecil";
  district: string;
  districtId: string;
  address: string;
  phone: string;
  email: string;
  sbuCount: number;
  sbuExpiry: string;
  status: string;
  projectsActive: number;
  lat: number;
  lng: number;
}

interface MapProps {
  districts: District[];
  projects: MapProjectItem[];
  bujkList: MapBUJKItem[];
  layer: "projects" | "bujk";
  selectedDistrict: string | null;
  onSelectDistrict: (id: string | null) => void;
  basemap?: "osm" | "satellite";
  totalProjectsCount?: number;
  totalBujkCount?: number;
}

function FlyToDistrict({ district }: { district: District | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (district) {
      map.flyTo([district.lat, district.lng], 13, { duration: 1.2 });
    } else {
      map.flyTo([-6.55, 106.78], 10, { duration: 1.2 });
    }
  }, [district, map]);
  return null;
}

function getProgressMarkerColor(progress: number): { fill: string; border: string; label: string } {
  if (progress >= 100) return { fill: "#059669", border: "#047857", label: "Selesai Fisik (100%)" };
  if (progress > 50) return { fill: "#2563EB", border: "#1D4ED8", label: "Tahap Lanjutan (>50%)" };
  if (progress > 0) return { fill: "#D97706", border: "#B45309", label: "Tahap Awal (1-50%)" };
  return { fill: "#64748B", border: "#475569", label: "Belum Mulai (0%)" };
}

function getBUJKMarkerColor(qualification: string): { fill: string; border: string; label: string } {
  const q = (qualification || "").toLowerCase();
  if (q.includes("besar")) {
    return { fill: "#7C3AED", border: "#5B21B6", label: "Kualifikasi Besar" };
  }
  if (q.includes("menengah")) {
    return { fill: "#2563EB", border: "#1D4ED8", label: "Kualifikasi Menengah" };
  }
  return { fill: "#059669", border: "#047857", label: "Kualifikasi Kecil" };
}

export default function MapComponent({
  districts,
  projects,
  bujkList,
  layer,
  selectedDistrict,
  onSelectDistrict,
  basemap = "osm",
  totalProjectsCount = 8,
  totalBujkCount = 10
}: MapProps) {
  const selectedDist = districts.find((d) => d.id === selectedDistrict);

  const tileUrl = basemap === "satellite"
    ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const tileAttribution = basemap === "satellite"
    ? '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; DigitalGlobe, GeoEye, Earthstar Geographics'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <MapContainer
        center={[-6.55, 106.78]}
        zoom={10}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
        zoomControl={true}
      >
        <TileLayer key={basemap} attribution={tileAttribution} url={tileUrl} />
        <FlyToDistrict district={selectedDist} />

        {/* 1. Selected District Highlight Ring (Hanya jika kecamatan difokuskan) */}
        {selectedDist && (
          <CircleMarker
            center={[selectedDist.lat, selectedDist.lng]}
            radius={28}
            pathOptions={{
              fillColor: "#FFC000",
              color: "#0F2E5C",
              weight: 3,
              fillOpacity: 0.2,
              dashArray: "6, 6"
            }}
          >
            <Popup>
              <div style={{ textAlign: "center", padding: "4px", minWidth: "140px" }}>
                <p style={{ fontWeight: 800, fontSize: "13px", color: "#0F172A", margin: "0 0 4px 0" }}>
                  Kec. {selectedDist.name}
                </p>
                <p style={{ fontSize: "11px", color: "#64748B", margin: "0 0 8px 0" }}>
                  Fokus Spasial Terpilih
                </p>
                <button
                  type="button"
                  onClick={() => onSelectDistrict(null)}
                  style={{
                    backgroundColor: "#FEF2F2",
                    color: "#DC2626",
                    border: "1px solid #FECACA",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Lepas Fokus Wilayah
                </button>
              </div>
            </Popup>
          </CircleMarker>
        )}

        {/* 2. LAYER PAKET PEKERJAAN (Tepat 8 Titik atau sesuai filter) */}
        {layer === "projects" && projects.map((p, idx) => {
          const { fill, label } = getProgressMarkerColor(p.physProgress);
          const jitterLat = p.lat + ((idx % 3) - 1) * 0.0035;
          const jitterLng = p.lng + (((idx * 2) % 3) - 1) * 0.0035;

          return (
            <CircleMarker
              key={p.id}
              center={[jitterLat, jitterLng]}
              radius={8.5}
              pathOptions={{
                fillColor: fill,
                color: "#FFFFFF",
                weight: 2.5,
                fillOpacity: 0.95,
              }}
            >
              <Popup>
                <div style={{ minWidth: "240px", padding: "4px 2px", fontFamily: "sans-serif" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 800, fontFamily: "monospace", backgroundColor: "#EBF2FA", color: "#0F2E5C", padding: "2px 6px", borderRadius: "4px" }}>
                      {p.id}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        backgroundColor: p.physProgress >= 100 ? "#ECFDF5" : "#EFF6FF",
                        color: p.physProgress >= 100 ? "#059669" : "#1D4ED8"
                      }}
                    >
                      {p.status || (p.physProgress >= 100 ? "Selesai" : "Pelaksanaan")}
                    </span>
                  </div>

                  <p style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", margin: "0 0 4px 0", lineHeight: 1.35 }}>
                    {p.name}
                  </p>

                  <p style={{ fontSize: "11px", color: "#64748B", margin: "0 0 6px 0" }}>
                    📍 Kec. {p.districtName || "Kabupaten Bogor"} • {p.contractor}
                  </p>

                  {/* Metric Box */}
                  <div style={{ backgroundColor: "#F8FAFC", padding: "8px 10px", borderRadius: "8px", border: "1px solid #E2E8F0", marginBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", color: "#64748B" }}>Nilai Kontrak:</span>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", fontFamily: "monospace" }}>
                        {formatCurrency(p.contractValue)}
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", color: "#64748B" }}>Progres Fisik:</span>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: fill }}>
                        {p.physProgress}%
                      </span>
                    </div>

                    <div style={{ width: "100%", height: "6px", backgroundColor: "#E2E8F0", borderRadius: "9999px", overflow: "hidden" }}>
                      <div style={{ width: `${p.physProgress}%`, height: "100%", backgroundColor: fill, borderRadius: "9999px" }} />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "5px", fontSize: "10px", color: "#64748B" }}>
                      <span>Sumber: <strong>{p.source || "APBD"}</strong></span>
                      <span>Kategori: <strong style={{ color: fill }}>{label.split(" (")[0]}</strong></span>
                    </div>
                  </div>

                  <a
                    href={`/paket-pekerjaan/${p.id}`}
                    style={{
                      display: "block",
                      textAlign: "center",
                      backgroundColor: "#0F2E5C",
                      color: "#FFFFFF",
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "7px 12px",
                      borderRadius: "6px",
                      textDecoration: "none",
                      boxShadow: "0 2px 4px rgba(15, 46, 92, 0.2)"
                    }}
                  >
                    Buka Detail Pekerjaan &rarr;
                  </a>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* 3. LAYER BUJK (Tepat 10 Titik Sesuai Master Data) */}
        {layer === "bujk" && bujkList.map((b, idx) => {
          const { fill, border, label } = getBUJKMarkerColor(b.qualification);
          const jitterLat = b.lat + ((idx % 3) - 1) * 0.0035;
          const jitterLng = b.lng + (((idx * 2) % 3) - 1) * 0.0035;
          const isVerified = b.status === "Aktif";

          return (
            <CircleMarker
              key={b.id}
              center={[jitterLat, jitterLng]}
              radius={9.5}
              pathOptions={{
                fillColor: fill,
                color: "#FFFFFF",
                weight: 2.5,
                fillOpacity: 0.95,
              }}
            >
              <Popup>
                <div style={{ minWidth: "250px", padding: "4px 2px", fontFamily: "sans-serif" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 800, fontFamily: "monospace", backgroundColor: "#F3E8FF", color: "#6B21A8", padding: "2px 6px", borderRadius: "4px" }}>
                      {b.id}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          padding: "2px 7px",
                          borderRadius: "9999px",
                          backgroundColor: fill + "20",
                          color: fill,
                          border: `1px solid ${fill}40`
                        }}
                      >
                        {b.qualification}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          padding: "2px 6px",
                          borderRadius: "9999px",
                          backgroundColor: isVerified ? "#ECFDF5" : "#FEF3C7",
                          color: isVerified ? "#059669" : "#B45309"
                        }}
                      >
                        {isVerified ? "Aktif" : "Menunggu"}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", margin: "0 0 2px 0", lineHeight: 1.35 }}>
                    {b.name}
                  </p>

                  <p style={{ fontSize: "11px", color: "#64748B", margin: "0 0 6px 0" }}>
                    📍 Kec. {b.district} • Penanggung Jawab: <strong style={{ color: "#334155" }}>{b.leader}</strong>
                  </p>

                  {/* Company Detail Box */}
                  <div style={{ backgroundColor: "#F8FAFC", padding: "8px 10px", borderRadius: "8px", border: "1px solid #E2E8F0", marginBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", marginBottom: "3px" }}>
                      <span style={{ color: "#64748B" }}>NIB:</span>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#1E293B" }}>{b.nib}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", marginBottom: "3px" }}>
                      <span style={{ color: "#64748B" }}>SBU Aktif:</span>
                      <span style={{ fontWeight: 700, color: "#0F2E5C" }}>{b.sbuCount} Bidang (Exp: {b.sbuExpiry})</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", marginBottom: "3px" }}>
                      <span style={{ color: "#64748B" }}>Proyek Berjalan:</span>
                      <span style={{ fontWeight: 800, color: b.projectsActive > 0 ? "#059669" : "#64748B" }}>
                        {b.projectsActive} Paket Fisik
                      </span>
                    </div>
                    <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "4px", marginTop: "4px", fontSize: "10px", color: "#64748B" }}>
                      <span>Alamat: {b.address}</span>
                    </div>
                  </div>

                  <a
                    href="/bujk"
                    style={{
                      display: "block",
                      textAlign: "center",
                      backgroundColor: "#0F2E5C",
                      color: "#FFFFFF",
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "7px 12px",
                      borderRadius: "6px",
                      textDecoration: "none",
                      boxShadow: "0 2px 4px rgba(15, 46, 92, 0.2)"
                    }}
                  >
                    Buka Profil Master BUJK &rarr;
                  </a>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Floating Legend Overlay */}
      <MapLegend totalProjects={totalProjectsCount} totalBujk={totalBujkCount} layer={layer} />
    </div>
  );
}

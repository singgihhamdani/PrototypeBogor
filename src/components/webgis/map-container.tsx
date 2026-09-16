"use client";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { formatCurrency } from "@/lib/utils";

interface District { id: string; name: string; lat: number; lng: number; projects: number; bujk: number; }
interface Project { id: string; name: string; contractor: string; contractValue: number; physProgress: number; lat: number; lng: number; districtId: string; }

interface MapProps {
  districts: District[];
  projects: Project[];
  layer: "projects" | "bujk";
  selectedDistrict: string | null;
  onSelectDistrict: (id: string | null) => void;
}

function FlyToDistrict({ district }: { district: District | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (district) map.flyTo([district.lat, district.lng], 13, { duration: 1 });
    else map.flyTo([-6.55, 106.78], 10, { duration: 1 });
  }, [district, map]);
  return null;
}

function getColor(value: number, max: number): string {
  const ratio = value / max;
  if (ratio > 0.7) return "#0F5132";
  if (ratio > 0.4) return "#10B981";
  if (ratio > 0.2) return "#F59E0B";
  return "#94A3B8";
}

export default function MapComponent({ districts, projects, layer, selectedDistrict, onSelectDistrict }: MapProps) {
  const maxProjects = Math.max(...districts.map((d) => d.projects));
  const maxBujk = Math.max(...districts.map((d) => d.bujk));
  const selectedDist = districts.find((d) => d.id === selectedDistrict);

  return (
    <MapContainer center={[-6.55, 106.78]} zoom={10} style={{ height: "100%", width: "100%" }} zoomControl={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToDistrict district={selectedDist} />

      {/* District markers */}
      {districts.map((d) => {
        const value = layer === "projects" ? d.projects : d.bujk;
        const max = layer === "projects" ? maxProjects : maxBujk;
        const radius = Math.max(8, (value / max) * 25);

        return (
          <CircleMarker
            key={d.id}
            center={[d.lat, d.lng]}
            radius={radius}
            pathOptions={{
              fillColor: getColor(value, max),
              color: selectedDistrict === d.id ? "#0F5132" : "#fff",
              weight: selectedDistrict === d.id ? 3 : 2,
              fillOpacity: 0.75,
            }}
            eventHandlers={{ click: () => onSelectDistrict(d.id === selectedDistrict ? null : d.id) }}
          >
            <Popup>
              <div className="text-center min-w-[140px]">
                <p className="font-bold text-sm text-slate-800 mb-1">Kec. {d.name}</p>
                <div className="flex justify-center gap-4 text-xs">
                  <div><span className="font-bold text-primary">{d.projects}</span> Proyek</div>
                  <div><span className="font-bold text-blue">{d.bujk}</span> BUJK</div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Project markers when zoomed into a district */}
      {selectedDistrict && projects.filter((p) => p.districtId === selectedDistrict).map((p) => (
        <CircleMarker
          key={p.id}
          center={[p.lat + (Math.random() - 0.5) * 0.01, p.lng + (Math.random() - 0.5) * 0.01]}
          radius={6}
          pathOptions={{ fillColor: "#3B82F6", color: "#fff", weight: 1.5, fillOpacity: 0.9 }}
        >
          <Popup>
            <div className="min-w-[180px]">
              <p className="font-bold text-sm text-slate-800 mb-1">{p.name}</p>
              <p className="text-xs text-slate-500 mb-1">{p.contractor}</p>
              <p className="text-xs font-bold text-primary">{formatCurrency(p.contractValue)}</p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full rounded-full bg-accent" style={{ width: `${p.physProgress}%` }} />
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Progres Fisik: {p.physProgress}%</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

"use client";
import { useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MiniMapPickerProps {
  lat: number;
  lng: number;
  basemap?: "osm" | "satellite";
  onChangePosition: (lat: number, lng: number) => void;
  targetName?: string;
}

// Marker Pin SVG yang tajam dan responsif
const pinSvg = `
<svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M17 0C7.61116 0 0 7.61116 0 17C0 27.5 14.875 40.85 15.51 41.41C15.93 41.78 16.465 42 17 42C17.535 42 18.07 41.78 18.49 41.41C19.125 40.85 34 27.5 34 17C34 7.61116 26.3888 0 17 0Z" fill="#DC2626"/>
  <path d="M17 1C8.16344 1 1 8.16344 1 17C1 26.8 15.2 39.5 16.16 40.35C16.64 40.78 17.36 40.78 17.84 40.35C18.8 39.5 33 26.8 33 17C33 8.16344 25.8366 1 17 1Z" stroke="#FFFFFF" stroke-width="2"/>
  <circle cx="17" cy="17" r="7" fill="#FFFFFF"/>
  <circle cx="17" cy="17" r="4.5" fill="#0F2E5C"/>
</svg>
`;

const pickerIcon = L.divIcon({
  className: "custom-map-picker-pin",
  html: `<div style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); transform: translate(-17px, -42px); cursor: grab;">${pinSvg}</div>`,
  iconSize: [34, 42],
  iconAnchor: [17, 42]
});

function MapEventsHandler({ 
  onChangePosition 
}: { 
  onChangePosition: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onChangePosition(
        parseFloat(e.latlng.lat.toFixed(6)),
        parseFloat(e.latlng.lng.toFixed(6))
      );
    }
  });
  return null;
}

function MapController({ 
  lat, 
  lng 
}: { 
  lat: number; 
  lng: number; 
}) {
  const map = useMap();
  
  useEffect(() => {
    // Invalidate size agar render leaflet pas saat modal terbuka
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      map.setView([lat, lng], map.getZoom() < 12 ? 14 : map.getZoom(), { animate: true });
    }
  }, [lat, lng, map]);

  return null;
}

export default function MiniMapPicker({
  lat,
  lng,
  basemap = "osm",
  onChangePosition,
  targetName
}: MiniMapPickerProps) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const pos = marker.getLatLng();
          onChangePosition(
            parseFloat(pos.lat.toFixed(6)),
            parseFloat(pos.lng.toFixed(6))
          );
        }
      }
    }),
    [onChangePosition]
  );

  const tileUrl = basemap === "satellite"
    ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const tileAttribution = basemap === "satellite"
    ? '&copy; <a href="https://www.esri.com/">Esri</a>'
    : '&copy; OpenStreetMap contributors';

  const defaultCenter: [number, number] = (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0)
    ? [lat, lng]
    : [-6.4816, 106.8516]; // Default Cibinong

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: "320px", borderRadius: "8px", overflow: "hidden", border: "1px solid #CBD5E1" }}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ width: "100%", height: "100%", minHeight: "320px", zIndex: 1 }}
      >
        <TileLayer attribution={tileAttribution} url={tileUrl} />
        <MapController lat={lat} lng={lng} />
        <MapEventsHandler onChangePosition={onChangePosition} />

        {!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 && (
          <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={[lat, lng]}
            ref={markerRef}
            icon={pickerIcon}
          />
        )}
      </MapContainer>

      {/* Petunjuk Interaktif Overlay */}
      <div style={{
        position: "absolute",
        bottom: "10px",
        left: "10px",
        right: "10px",
        backgroundColor: "rgba(15, 46, 92, 0.92)",
        color: "#FFFFFF",
        padding: "6px 12px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: 600,
        zIndex: 1000,
        backdropFilter: "blur(4px)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px"
      }}>
        <span>💡 Klik pada peta atau geser pin merah untuk menandai titik koordinat presisi.</span>
        <span style={{ fontSize: "10px", opacity: 0.85, whiteSpace: "nowrap" }}>
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </span>
      </div>
    </div>
  );
}

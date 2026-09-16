"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Layers, Filter, MapPin } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import districtsData from "@/data/districts.json";
import projectsData from "@/data/projects.json";

const MapComponent = dynamic(() => import("@/components/webgis/map-container"), { ssr: false, loading: () => <div className="h-full w-full skeleton" /> });

export default function WebGISPage() {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [layer, setLayer] = useState<"projects" | "bujk">("projects");

  const filteredProjects = selectedDistrict
    ? projectsData.filter((p) => p.districtId === selectedDistrict)
    : projectsData;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">WebGIS Peta Interaktif</h1>
          <p className="text-sm text-slate-500 mt-1">Sebaran proyek & BUJK di 40 kecamatan Kabupaten Bogor</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLayer("projects")}
            className={cn("flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors",
              layer === "projects" ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            <MapPin className="h-3.5 w-3.5" /> Proyek
          </button>
          <button
            onClick={() => setLayer("bujk")}
            className={cn("flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors",
              layer === "bujk" ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            <Layers className="h-3.5 w-3.5" /> BUJK
          </button>
          {selectedDistrict && (
            <button
              onClick={() => setSelectedDistrict(null)}
              className="flex items-center gap-1.5 rounded-lg bg-rose/10 text-rose px-3 py-2 text-xs font-bold"
            >
              <Filter className="h-3.5 w-3.5" /> Reset Filter
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4" style={{ height: "calc(100vh - 220px)" }}>
        {/* Map */}
        <div className="xl:col-span-2 rounded-2xl border border-slate-200/60 bg-white overflow-hidden">
          <MapComponent
            districts={districtsData}
            projects={projectsData}
            layer={layer}
            onSelectDistrict={setSelectedDistrict}
            selectedDistrict={selectedDistrict}
          />
        </div>

        {/* Sidebar list */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 overflow-y-auto">
          <h3 className="text-sm font-bold text-slate-700 mb-3">
            {selectedDistrict
              ? `Proyek di ${districtsData.find((d) => d.id === selectedDistrict)?.name || ""}`
              : `Semua Proyek (${filteredProjects.length})`}
          </h3>
          <div className="space-y-3">
            {filteredProjects.map((p) => (
              <div key={p.id} className="rounded-xl border border-slate-100 p-3 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer">
                <p className="text-sm font-semibold text-slate-800 leading-snug mb-1.5">{p.name}</p>
                <p className="text-xs text-slate-500 mb-2">{p.contractor}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">{formatCurrency(p.contractValue)}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-16 rounded-full bg-slate-200 overflow-hidden">
                      <div className={cn("h-full rounded-full", p.physProgress >= 75 ? "bg-accent" : p.physProgress >= 50 ? "bg-amber" : "bg-rose")}
                        style={{ width: `${p.physProgress}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600">{p.physProgress}%</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredProjects.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">Tidak ada proyek ditemukan.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

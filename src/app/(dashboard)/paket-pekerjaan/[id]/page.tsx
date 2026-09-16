"use client";
import { use, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, Package, Calendar, DollarSign, Building2, MapPin, 
  FileText, TrendingUp, Download, CheckCircle2, AlertTriangle, Clock
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";
import { cn, formatCurrency } from "@/lib/utils";
import projectsData from "@/data/projects.json";
import districtsData from "@/data/districts.json";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PaketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const project = projectsData.find((p) => p.id.toLowerCase() === resolvedParams.id.toLowerCase());

  if (!project) {
    notFound();
  }

  const district = districtsData.find((d) => d.id === project.districtId);

  // Kurva-S chart data
  const months = ["M-1", "M-2", "M-3", "M-4", "M-5", "M-6", "M-7", "M-8", "M-9", "M-10", "M-11"];
  const labels = months.slice(0, project.planProgress.length);

  const chartData = useMemo(() => {
    return {
      labels,
      datasets: [
        {
          label: "Rencana Kumulatif (%)",
          data: project.planProgress,
          borderColor: "#2563EB", // Blue
          backgroundColor: "rgba(37, 99, 235, 0.08)",
          borderWidth: 2.5,
          borderDash: [4, 4],
          pointRadius: 4,
          pointBackgroundColor: "#2563EB",
          tension: 0.3,
          fill: false,
        },
        {
          label: "Realisasi Kumulatif (%)",
          data: project.realProgress.map(v => v === 0 ? null : v),
          borderColor: "#059669", // Emerald
          backgroundColor: "rgba(5, 150, 105, 0.15)",
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: "#059669",
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, [labels, project.planProgress, project.realProgress]);

  const deviasi = project.physProgress - (project.planProgress[Math.min(project.planProgress.length - 1, 7)] || 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Back & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/paket-pekerjaan"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                {project.id}
              </span>
              <span className={cn(
                "text-xs font-bold px-2 py-0.5 rounded-full",
                project.status === "Selesai" ? "bg-accent/10 text-accent" : "bg-blue/10 text-blue"
              )}>
                {project.status}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              {project.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert(`Mengunduh Berita Acara & Lembar SIPJAKI ${project.id}...`)}
            className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Download className="h-4 w-4" /> Dokumen Kontrak
          </button>
          <Link
            href="/pengawasan"
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors shadow-sm"
          >
            <FileText className="h-4 w-4" /> Audit SIMAK
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Nilai Kontrak</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
            {formatCurrency(project.contractValue)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{project.contractChar} • {project.source}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Progres Fisik</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-extrabold text-slate-900">{project.physProgress}%</p>
            <span className={cn(
              "text-xs font-bold",
              deviasi >= 0 ? "text-accent" : "text-rose"
            )}>
              {deviasi >= 0 ? `+${deviasi}% (Ahead)` : `${deviasi}% (Kritis)`}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${project.physProgress}%` }}></div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Progres Keuangan</p>
          <p className="text-2xl font-extrabold text-accent mt-1">{project.finProgress}%</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-accent h-1.5 rounded-full" style={{ width: `${project.finProgress}%` }}></div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Penyedia Jasa</p>
          <p className="text-sm font-bold text-slate-800 mt-1 line-clamp-1">{project.contractor}</p>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">NIB: {project.nib}</p>
        </div>
      </div>

      {/* Main Content: Kurva-S + Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Kurva-S */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Kurva-S Progres Konstruksi
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Perbandingan Kurva Rencana (Target Kontrak) vs Realisasi Fisik Lapangan
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              TA {project.fiscalYear}
            </span>
          </div>

          <div className="h-[300px] w-full">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top" as const,
                    labels: {
                      usePointStyle: true,
                      boxWidth: 8,
                      font: { size: 12, weight: "bold" },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => ` ${context.dataset.label}: ${context.parsed.y}%`,
                    },
                  },
                },
                scales: {
                  y: {
                    min: 0,
                    max: 100,
                    ticks: {
                      callback: (val) => `${val}%`,
                    },
                    grid: {
                      color: "#F1F5F9",
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-50 p-2 rounded-xl">
              <p className="text-slate-400">Target Akhir Bulan</p>
              <p className="font-bold text-slate-800 mt-0.5">{project.planProgress[project.realProgress.filter(v => v>0).length - 1] || 0}%</p>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl">
              <p className="text-slate-400">Realisasi Aktual</p>
              <p className="font-bold text-accent mt-0.5">{project.physProgress}%</p>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl">
              <p className="text-slate-400">Deviasi</p>
              <p className={cn("font-bold mt-0.5", deviasi >= 0 ? "text-accent" : "text-rose")}>
                {deviasi >= 0 ? `+${deviasi}%` : `${deviasi}%`}
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Contract Details */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Informasi Kontrak & Lokasi
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Pengguna Jasa / PPK</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{project.owner}</p>
            </div>

            <div>
              <p className="text-slate-400 font-medium">Bentuk Kontrak</p>
              <p className="text-slate-700 font-medium mt-0.5">{project.contractType} ({project.contractChar})</p>
            </div>

            <div>
              <p className="text-slate-400 font-medium">Masa Pelaksanaan</p>
              <div className="flex items-center gap-1 text-slate-700 font-medium mt-0.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>{project.startDate} s/d {project.endDate}</span>
              </div>
            </div>

            <div>
              <p className="text-slate-400 font-medium">Wilayah Kecamatan</p>
              <div className="flex items-center gap-1 text-slate-700 font-medium mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span>{district?.name || "Kab. Bogor"}</span>
              </div>
            </div>

            <div>
              <p className="text-slate-400 font-medium">Koordinat Proyek</p>
              <p className="font-mono text-slate-600 mt-0.5">
                {project.lat.toFixed(4)}, {project.lng.toFixed(4)}
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/webgis"
                className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-slate-100 py-2.5 font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <MapPin className="h-4 w-4 text-primary" /> Lihat di WebGIS
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { Building2, Package, GraduationCap, ShieldCheck, TrendingUp, TrendingDown, AlertTriangle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const pilarData = [
  { label: "Tertib Usaha", value: 72, icon: Building2, color: "from-blue to-blue/70", bgColor: "bg-blue/10", textColor: "text-blue" },
  { label: "Tertib Penyelenggaraan", value: 65, icon: ShieldCheck, color: "from-accent to-accent/70", bgColor: "bg-accent/10", textColor: "text-accent" },
  { label: "Tertib Pemanfaatan", value: 58, icon: Package, color: "from-amber to-amber/70", bgColor: "bg-amber/10", textColor: "text-amber" },
  { label: "SIPJAKI", value: 45, icon: TrendingUp, color: "from-rose to-rose/70", bgColor: "bg-rose/10", textColor: "text-rose" },
  { label: "Pelatihan & Fasilitasi", value: 80, icon: GraduationCap, color: "from-primary to-primary/70", bgColor: "bg-primary/10", textColor: "text-primary" },
];

const summaryCards = [
  { label: "Total BUJK Terdaftar", value: "1.240", change: "+12%", up: true, icon: Building2, color: "text-primary", bg: "bg-primary/10" },
  { label: "Paket Pekerjaan Aktif", value: "342", change: "Rp 420 M", up: true, icon: Package, color: "text-blue", bg: "bg-blue/10" },
  { label: "TKK Tersertifikasi", value: "4.850", change: "+185 org", up: true, icon: GraduationCap, color: "text-accent", bg: "bg-accent/10" },
  { label: "Insiden K3 (TA 2026)", value: "7", change: "-3 vs 2025", up: false, icon: AlertTriangle, color: "text-amber", bg: "bg-amber/10" },
];

const recentProjects = [
  { name: "Rekonstruksi Jl. Raya Cibinong-Citeureup", contractor: "PT Bangun Jaya Konstruksi", progress: 68, value: "Rp 8,5 M", status: "on-track" },
  { name: "Gedung PAUD Terpadu Kec. Gunung Putri", contractor: "CV Karya Mandiri Utama", progress: 82, value: "Rp 3,2 M", status: "on-track" },
  { name: "Peningkatan Jl. Lingkungan Desa Sukamahi", contractor: "PT Mitra Pembangunan Nusantara", progress: 90, value: "Rp 1,85 M", status: "ahead" },
  { name: "Drainase Primer Kec. Parung", contractor: "CV Teknik Sejahtera", progress: 45, value: "Rp 950 Jt", status: "behind" },
  { name: "Rehabilitasi Jembatan Sungai Cikeas", contractor: "PT Infrastruktur Bogor Raya", progress: 58, value: "Rp 12,5 M", status: "on-track" },
];

function GaugeCircle({ value, size = 100, strokeWidth = 10 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 75 ? "#10B981" : value >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
        style={{ animation: "gauge-fill 1.2s ease-out" }}
      />
    </svg>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard Eksekutif</h1>
          <p className="text-sm text-slate-500 mt-1">Ringkasan pembinaan & pengawasan jasa konstruksi Kabupaten Bogor</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
          <span className="text-sm font-bold text-primary">Tahun Anggaran 2026</span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-slate-200/60 bg-white p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", card.bg)}>
                  <Icon className={cn("h-5 w-5", card.color)} />
                </div>
                <span className={cn("flex items-center gap-1 text-xs font-bold rounded-full px-2 py-0.5", card.up ? "text-accent bg-accent/10" : "text-amber bg-amber/10")}>
                  {card.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {card.change}
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{card.value}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* 5 Pilar SIPJAKI */}
      <div className="rounded-2xl border border-slate-200/60 bg-white p-6">
        <div className="flex items-center gap-2 mb-5">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-slate-900">5 Pilar Pengawasan SIPJAKI</h2>
          <span className="ml-auto text-xs text-slate-400 font-medium">Sesuai Permen PUPR No. 1/2023</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {pilarData.map((pilar) => {
            const Icon = pilar.icon;
            return (
              <div key={pilar.label} className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="relative mb-3">
                  <GaugeCircle value={pilar.value} size={88} strokeWidth={8} />
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-extrabold text-slate-800">
                    {pilar.value}%
                  </span>
                </div>
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg mb-2", pilar.bgColor)}>
                  <Icon className={cn("h-4 w-4", pilar.textColor)} />
                </div>
                <p className="text-xs font-semibold text-slate-700 leading-tight">{pilar.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Projects Table */}
      <div className="rounded-2xl border border-slate-200/60 bg-white p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900">Paket Pekerjaan Terbaru</h2>
          <a href="/paket-pekerjaan" className="text-sm font-semibold text-primary hover:text-accent transition-colors">
            Lihat Semua →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Paket</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pelaksana</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nilai</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Progres Fisik</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.map((p) => (
                <tr key={p.name} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 text-sm font-semibold text-slate-800 max-w-[250px] truncate">{p.name}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{p.contractor}</td>
                  <td className="py-3 px-4 text-sm font-medium text-slate-700">{p.value}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden max-w-[100px]">
                        <div
                          className={cn("h-full rounded-full transition-all", p.progress >= 75 ? "bg-accent" : p.progress >= 50 ? "bg-amber" : "bg-rose")}
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                      p.status === "on-track" && "bg-accent/10 text-accent",
                      p.status === "ahead" && "bg-blue/10 text-blue",
                      p.status === "behind" && "bg-rose/10 text-rose",
                    )}>
                      {p.status === "on-track" ? "On Track" : p.status === "ahead" ? "Ahead" : "Behind"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

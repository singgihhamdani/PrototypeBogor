"use client";
import { 
  Building2, Package, GraduationCap, ShieldCheck, TrendingUp, TrendingDown, 
  AlertTriangle, Users, Landmark, FileBarChart, ArrowUpRight, CheckCircle2,
  DollarSign, Sparkles
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const pilarData = [
  { label: "Tertib Usaha", value: 72, icon: Building2, color: "#0F2E5C", desc: "Kesesuaian Izin, NIB & SBU" },
  { label: "Tertib Penyelenggaraan", value: 65, icon: ShieldCheck, color: "#1E40AF", desc: "Kontrak Kerja & K3 SMKK" },
  { label: "Tertib Pemanfaatan", value: 58, icon: Package, color: "#B45309", desc: "Fungsi & Umur Konstruksi" },
  { label: "Pelaporan SIPJAKI", value: 85, icon: FileBarChart, color: "#059669", desc: "Sinkronisasi Terjadwal" },
  { label: "Fasilitasi SDM / TKK", value: 80, icon: GraduationCap, color: "#0F2E5C", desc: "Sertifikasi SKK BNSP" },
];

const summaryCards = [
  { label: "Total BUJK Terdaftar", value: "1.240", sub: "312 Kualifikasi Besar", up: true, change: "+12%", icon: Building2, bg: "bg-[#0F2E5C]/10 text-[#0F2E5C]" },
  { label: "Paket Pekerjaan TA 2026", value: "342", sub: "Pagu Rp 420 Miliar", up: true, change: "Aktif", icon: Package, bg: "bg-blue-50 text-blue-700" },
  { label: "TKK Tersertifikasi SKK", value: "4.850", sub: "Target 5.000 Orang", up: true, change: "97%", icon: GraduationCap, bg: "bg-amber-50 text-[#B45309]" },
  { label: "Tingkat Fatalitas K3", value: "0", sub: "Zero Fatal Accident", up: true, change: "100%", icon: ShieldCheck, bg: "bg-emerald-50 text-emerald-700" },
];

const recentProjects = [
  { id: "P001", name: "Rekonstruksi Jl. Raya Cibinong - Citeureup", contractor: "PT Bangun Jaya Konstruksi", progress: 68, plan: 60, value: "Rp 8,5 M", status: "Ahead" },
  { id: "P002", name: "Pembangunan Gedung PAUD Terpadu Kec. Gunung Putri", contractor: "CV Karya Mandiri Utama", progress: 82, plan: 80, value: "Rp 3,2 M", status: "Ahead" },
  { id: "P003", name: "Peningkatan Jalan Lingkungan Desa Sukamahi", contractor: "PT Mitra Pembangunan Nusantara", progress: 90, plan: 90, value: "Rp 1,85 M", status: "On Track" },
  { id: "P004", name: "Pembangunan Drainase Primer Kec. Parung", contractor: "CV Teknik Sejahtera", progress: 45, plan: 60, value: "Rp 950 Jt", status: "Behind" },
  { id: "P005", name: "Rehabilitasi Jembatan Sungai Cikeas", contractor: "PT Infrastruktur Bogor Raya", progress: 58, plan: 60, value: "Rp 12,5 M", status: "On Track" },
];

function GaugeCircle({ value, size = 96, strokeWidth = 9, color = "#0F2E5C" }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner with PUPR Navy & Gold Styling */}
      <div className="rounded-3xl bg-gradient-to-r from-[#091A36] via-[#0F2E5C] to-[#163B75] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#FFC000 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        />

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "16px", maxWidth: "900px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "9999px", backgroundColor: "rgba(255,255,255,0.1)", padding: "4px 12px", fontSize: "11px", fontWeight: 700, color: "#FFC000", border: "1px solid rgba(255,255,255,0.15)", alignSelf: "flex-start" }}>
            <Landmark style={{ width: "14px", height: "14px" }} />
            <span>DPUPR Kabupaten Bogor • Wilayah Kerja 40 Kecamatan</span>
          </div>
          
          <h1 style={{ fontSize: "26px", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.5px", margin: 0, lineHeight: 1.2 }}>
            Dashboard Pembinaan & Pengawasan Jasa Konstruksi
          </h1>
          
          <p style={{ fontSize: "13px", color: "#CBD5E1", margin: 0, lineHeight: 1.6, maxWidth: "720px" }}>
            Pemantauan terpadu kepatuhan 5 Pilar Jasa Konstruksi, status audit digital SIMAK lapangan, dan sinkronisasi real-time ke SIPJAKI Kementerian PUPR.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "4px" }}>
            <Link
              href="/pengawasan"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "12px",
                backgroundColor: "#FFC000",
                color: "#0F2E5C",
                padding: "10px 18px",
                fontSize: "12px",
                fontWeight: 900,
                textDecoration: "none",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
              }}
            >
              <span>Mulai Audit SIMAK</span>
              <ArrowUpRight style={{ width: "16px", height: "16px" }} />
            </Link>
            <Link
              href="/webgis"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                color: "#FFFFFF",
                padding: "10px 18px",
                fontSize: "12px",
                fontWeight: 700,
                textDecoration: "none",
                border: "1px solid rgba(255, 255, 255, 0.2)"
              }}
            >
              <span>Buka Peta WebGIS</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", card.bg)}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {card.change}
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{card.value}</p>
              <p className="text-xs font-bold text-slate-700 mt-1">{card.label}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* 5 Pilar SIPJAKI Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#FFC000]" />
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Status Kepatuhan 5 Pilar Jasa Konstruksi (SIPJAKI)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluasi kinerja pengawasan sesuai amanat UU No. 2/2017 & Permen PUPR No. 1/2023
            </p>
          </div>
          <span className="text-xs font-bold text-[#0F2E5C] bg-[#EBF2FA] px-3 py-1.5 rounded-xl self-start sm:self-auto">
            Indeks Daerah: 72% (Baik)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {pilarData.map((pilar) => {
            const Icon = pilar.icon;
            return (
              <div 
                key={pilar.label} 
                className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-[#0F2E5C]/20 hover:bg-white transition-all shadow-2xs"
              >
                <div className="relative mb-3">
                  <GaugeCircle value={pilar.value} size={84} strokeWidth={8} color={pilar.color} />
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-black text-slate-900">
                    {pilar.value}%
                  </span>
                </div>
                <p className="text-xs font-extrabold text-slate-800 leading-tight">{pilar.label}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">{pilar.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Projects Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Paket Pekerjaan Konstruksi Terkini
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pengawasan progres fisik & deviasi terhadap jadwal kontrak APBD 2026
            </p>
          </div>
          <Link 
            href="/paket-pekerjaan" 
            className="inline-flex items-center gap-1 text-xs font-bold text-[#0F2E5C] hover:text-[#1E40AF] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all"
          >
            <span>Semua Paket</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#FFC000]" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-500 text-left font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Kode & Nama Paket</th>
                <th className="py-3 px-4">Penyedia Jasa</th>
                <th className="py-3 px-4">Nilai Kontrak</th>
                <th className="py-3 px-4">Progres Fisik vs Target</th>
                <th className="py-3 px-4">Deviasi Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentProjects.map((p) => {
                const deviasi = p.progress - p.plan;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {p.id}
                        </span>
                        <Link href={`/paket-pekerjaan/${p.id}`} className="font-bold text-slate-800 hover:text-[#0F2E5C] transition-colors">
                          {p.name}
                        </Link>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {p.contractor}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {p.value}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-2">
                          <div
                            className={cn(
                              "h-2 rounded-full",
                              p.progress >= p.plan ? "bg-[#059669]" : "bg-[#EF4444]"
                            )}
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800">{p.progress}%</span>
                        <span className="text-[10px] text-slate-400">/ {p.plan}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                        deviasi > 0 ? "bg-emerald-50 text-emerald-700" :
                        deviasi === 0 ? "bg-blue-50 text-blue-700" : "bg-rose-50 text-rose-700"
                      )}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", deviasi >= 0 ? "bg-emerald-500" : "bg-rose-500")} />
                        {deviasi > 0 ? `+${deviasi}% Ahead` : deviasi === 0 ? "On Schedule" : `${deviasi}% Delay`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/paket-pekerjaan/${p.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 font-bold text-[#0F2E5C] hover:bg-[#0F2E5C] hover:text-white transition-all"
                      >
                        Kurva-S
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

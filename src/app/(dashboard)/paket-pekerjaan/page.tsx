"use client";
import { useState } from "react";
import Link from "next/link";
import { Package, Search, Download, Plus, Eye, ChevronRight, TrendingUp, DollarSign, Calendar, CheckCircle2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import projectsData from "@/data/projects.json";

export default function PaketPekerjaanPage() {
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const filtered = projectsData.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                        p.contractor.toLowerCase().includes(search.toLowerCase()) || 
                        p.id.toLowerCase().includes(search.toLowerCase());
    const matchSource = filterSource === "Semua" || p.source === filterSource;
    const matchStatus = filterStatus === "Semua" || p.status === filterStatus;
    return matchSearch && matchSource && matchStatus;
  });

  const totalValue = projectsData.reduce((acc, curr) => acc + curr.contractValue, 0);
  const avgProgress = Math.round(projectsData.reduce((acc, curr) => acc + curr.physProgress, 0) / projectsData.length);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Package className="h-7 w-7 text-primary" /> Paket Pekerjaan Konstruksi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Data pemantauan progres fisik & keuangan proyek konstruksi Kab. Bogor TA 2026 (Format Sinkronisasi SIPJAKI)
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => alert("Mengunduh Rekapitulasi Paket Pekerjaan (Format Template SIPJAKI .xlsx)...")}
            className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <Download className="h-4 w-4" /> Export SIPJAKI
          </button>
          <button 
            onClick={() => alert("Form Tambah Paket Pekerjaan Baru")}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Tambah Paket
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Total Paket</span>
            <Package className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{projectsData.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Tercatat di sistem</p>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Total Nilai Kontrak</span>
            <DollarSign className="h-4 w-4 text-accent" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-2">{formatCurrency(totalValue)}</p>
          <p className="text-[11px] text-accent font-medium mt-0.5">Pagu & Kontrak Aktif</p>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Rata-rata Progres Fisik</span>
            <TrendingUp className="h-4 w-4 text-blue" />
          </div>
          <p className="text-2xl font-extrabold text-blue mt-2">{avgProgress}%</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-blue h-1.5 rounded-full" style={{ width: `${avgProgress}%` }}></div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Status Selesai</span>
            <CheckCircle2 className="h-4 w-4 text-accent" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {projectsData.filter((p) => p.status === "Selesai").length} <span className="text-sm font-normal text-slate-400">/ {projectsData.length}</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Serah Terima Pertama (PHO)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ID paket, nama pekerjaan, kontraktor..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Sumber Dana filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 px-2 uppercase">Sumber:</span>
          {["Semua", "APBD", "DAK", "APBN"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterSource(s)}
              className={cn(
                "rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all",
                filterSource === s ? "bg-white text-primary shadow-xs" : "text-slate-600 hover:text-slate-900"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 px-2 uppercase">Status:</span>
          {["Semua", "Pelaksanaan", "Selesai"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={cn(
                "rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all",
                filterStatus === st ? "bg-white text-primary shadow-xs" : "text-slate-600 hover:text-slate-900"
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200/60 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Kode & Nama Paket</th>
                <th className="py-3 px-4">Sumber / OPD</th>
                <th className="py-3 px-4">Penyedia Jasa</th>
                <th className="py-3 px-4">Nilai Kontrak</th>
                <th className="py-3 px-4">Progres Fisik</th>
                <th className="py-3 px-4">Progres Keu</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {p.id}
                      </span>
                      <div>
                        <Link href={`/paket-pekerjaan/${p.id}`} className="text-sm font-semibold text-slate-800 hover:text-primary transition-colors">
                          {p.name}
                        </Link>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {p.startDate} s/d {p.endDate}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block rounded px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700">
                      {p.source}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">{p.owner}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-sm font-medium text-slate-800">{p.contractor}</p>
                    <p className="text-[11px] font-mono text-slate-400">NIB: {p.nib}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-sm font-semibold text-slate-900">
                    {formatCurrency(p.contractValue)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-2">
                        <div 
                          className={cn(
                            "h-2 rounded-full",
                            p.physProgress >= 100 ? "bg-accent" : p.physProgress > 50 ? "bg-primary" : "bg-amber"
                          )} 
                          style={{ width: `${p.physProgress}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700">{p.physProgress}%</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{p.physMonth}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-2">
                        <div 
                          className="bg-accent h-2 rounded-full" 
                          style={{ width: `${p.finProgress}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700">{p.finProgress}%</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{p.finMonth}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold inline-flex items-center gap-1",
                      p.status === "Selesai" ? "bg-accent/10 text-accent" : "bg-blue/10 text-blue"
                    )}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", p.status === "Selesai" ? "bg-accent" : "bg-blue")} />
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Link
                      href={`/paket-pekerjaan/${p.id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-primary hover:text-white transition-all"
                    >
                      <Eye className="h-3.5 w-3.5" /> Detail
                    </Link>
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

"use client";
import { useState } from "react";
import { Building2, Search, Filter, Eye, Plus, Download, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import bujkData from "@/data/bujk.json";
import Link from "next/link";

export default function BUJKPage() {
  const [search, setSearch] = useState("");
  const [filterQual, setFilterQual] = useState("Semua");

  const filtered = bujkData.filter((b) => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.nib.includes(search);
    const matchQual = filterQual === "Semua" || b.qualification === filterQual;
    return matchSearch && matchQual;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">BUJK Master</h1>
          <p className="text-sm text-slate-500 mt-1">Data Badan Usaha Jasa Konstruksi Kabupaten Bogor</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors">
            <Download className="h-4 w-4" /> Export
          </button>
          <button className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors">
            <Plus className="h-4 w-4" /> Tambah BUJK
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total BUJK", value: bujkData.length, color: "text-primary bg-primary/10" },
          { label: "Kualifikasi Besar", value: bujkData.filter((b) => b.qualification === "Besar").length, color: "text-blue bg-blue/10" },
          { label: "Kualifikasi Menengah", value: bujkData.filter((b) => b.qualification === "Menengah").length, color: "text-accent bg-accent/10" },
          { label: "Kualifikasi Kecil", value: bujkData.filter((b) => b.qualification === "Kecil").length, color: "text-amber bg-amber/10" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200/60 bg-white p-4">
            <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama BUJK, NIB..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        {["Semua", "Besar", "Menengah", "Kecil"].map((q) => (
          <button key={q} onClick={() => setFilterQual(q)}
            className={cn("rounded-lg px-3 py-2 text-xs font-bold transition-colors",
              filterQual === q ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >{q}</button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200/60 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">No</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Nama Badan Usaha</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Bentuk</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">NIB</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Kualifikasi</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Kecamatan</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">SBU</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 text-sm text-slate-500">{i + 1}</td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{b.name}</p>
                      <p className="text-xs text-slate-400">{b.leader}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">{b.type}</td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-600">{b.nib}</td>
                  <td className="py-3 px-4">
                    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold",
                      b.qualification === "Besar" ? "bg-blue/10 text-blue" :
                      b.qualification === "Menengah" ? "bg-accent/10 text-accent" : "bg-amber/10 text-amber"
                    )}>{b.qualification}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">{b.district}</td>
                  <td className="py-3 px-4 text-sm font-bold text-primary">{b.sbuCount}</td>
                  <td className="py-3 px-4">
                    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold",
                      b.status === "Aktif" ? "bg-accent/10 text-accent" : "bg-amber/10 text-amber"
                    )}>{b.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Link href={`/bujk/${b.id}`}
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" /> Detail <ChevronRight className="h-3 w-3" />
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

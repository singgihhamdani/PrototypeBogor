"use client";
import { useState } from "react";
import { BookOpen, Search, Download, FileText, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import regulationsData from "@/data/regulations.json";

export default function RegulasiPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");

  const filtered = regulationsData.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                        r.number.toLowerCase().includes(search.toLowerCase()) ||
                        r.summary.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Semua" || r.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
            <BookOpen className="h-3 w-3" /> Basis Hukum & Kebijakan
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
          Regulasi & Dasar Hukum Jasa Konstruksi
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Himpunan peraturan perundang-undangan daerah dan nasional terkait tertib pembinaan dan pengawasan jasa konstruksi
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor peraturan, judul regulasi, atau kata kunci..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {["Semua", "Peraturan Daerah", "Undang-Undang", "Peraturan Menteri PUPR", "Surat Edaran Bupati"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                category === cat ? "bg-white text-primary shadow-xs" : "text-slate-600 hover:text-slate-900"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Regulations List */}
      <div className="space-y-3">
        {filtered.map((reg) => (
          <div key={reg.id} className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm hover:border-primary/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {reg.number}
                </span>
                <span className="text-xs text-slate-400 font-semibold">• {reg.category} (Tahun {reg.year})</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{reg.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{reg.summary}</p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                <Calendar className="h-3 w-3" /> Tanggal Pengundangan: {reg.dateEnacted}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-400 font-mono">{reg.fileSize}</span>
              <button
                onClick={() => alert(`Mengunduh dokumen resmi ${reg.number} (PDF)...`)}
                className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all"
              >
                <Download className="h-4 w-4" /> Unduh Dokumen
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

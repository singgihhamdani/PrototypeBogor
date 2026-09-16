"use client";
import { useState } from "react";
import { Newspaper, Calendar, Clock, ArrowRight, Tag, Search } from "lucide-react";
import newsData from "@/data/news.json";

export default function BeritaPage() {
  const [search, setSearch] = useState("");

  const filtered = newsData.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.summary.toLowerCase().includes(search.toLowerCase()) ||
    n.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
            <Newspaper className="h-3 w-3" /> Publikasi & Dokumentasi
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
          Warta & Berita Pembinaan Jasa Konstruksi
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Informasi kegiatan pembinaan, audit SIMAK lapangan, sosialisasi regulasi, dan kemajuan infrastruktur Kab. Bogor
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari berita, agenda kegiatan, atau topik..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200/60 bg-white overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-all">
            <div className="h-44 bg-gradient-to-br from-primary/20 via-primary/10 to-slate-100 flex items-center justify-center p-6 text-center">
              <div className="h-12 w-12 rounded-2xl bg-white/80 shadow-xs flex items-center justify-center text-primary">
                <Newspaper className="h-6 w-6" />
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span className="text-primary font-bold">{item.category}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.readTime}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {item.date}
                </span>
                <button
                  onClick={() => alert(`Membuka artikel: "${item.title}"`)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-accent transition-colors"
                >
                  Baca Selengkapnya <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

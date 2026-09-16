"use client";
import { use } from "react";
import { ArrowLeft, Building2, FileText, Award, Briefcase, MapPin, Phone, Mail, Calendar } from "lucide-react";
import Link from "next/link";
import bujkData from "@/data/bujk.json";
import { cn, formatDate } from "@/lib/utils";

export default function BUJKDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const bujk = bujkData.find((b) => b.id === id);

  if (!bujk) return (
    <div className="flex items-center justify-center h-[50vh]">
      <p className="text-slate-400">BUJK tidak ditemukan.</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/bujk" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar BUJK
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border border-slate-200/60 bg-white p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white font-extrabold text-xl">
              {bujk.type}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">{bujk.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                <span className="font-mono">{bujk.nib}</span>
                <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                  bujk.status === "Aktif" ? "bg-accent/10 text-accent" : "bg-amber/10 text-amber"
                )}>{bujk.status}</span>
              </div>
            </div>
          </div>
          <span className={cn("self-start rounded-xl px-4 py-2 text-sm font-bold",
            bujk.qualification === "Besar" ? "bg-blue/10 text-blue" :
            bujk.qualification === "Menengah" ? "bg-accent/10 text-accent" : "bg-amber/10 text-amber"
          )}>Kualifikasi {bujk.qualification}</span>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Informasi Perusahaan</h3>
          {[
            { label: "Pimpinan", value: bujk.leader, icon: Briefcase },
            { label: "NPWP", value: bujk.npwp, icon: FileText },
            { label: "Kecamatan", value: bujk.district, icon: MapPin },
            { label: "Alamat", value: bujk.address, icon: MapPin },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <item.icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div><p className="text-xs text-slate-400">{item.label}</p><p className="text-sm font-medium text-slate-700">{item.value}</p></div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><Award className="h-4 w-4 text-primary" /> Kontak & SBU</h3>
          {[
            { label: "Telepon", value: bujk.phone, icon: Phone },
            { label: "Email", value: bujk.email, icon: Mail },
            { label: "Jumlah SBU Aktif", value: `${bujk.sbuCount} sertifikat`, icon: Award },
            { label: "SBU Berlaku Hingga", value: formatDate(bujk.sbuExpiry), icon: Calendar },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <item.icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div><p className="text-xs text-slate-400">{item.label}</p><p className="text-sm font-medium text-slate-700">{item.value}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* Proyek Aktif placeholder */}
      <div className="rounded-2xl border border-slate-200/60 bg-white p-6">
        <h3 className="font-bold text-slate-800 mb-4">Proyek Aktif ({bujk.projectsActive})</h3>
        <div className="text-center py-8">
          <Briefcase className="h-12 w-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Data proyek terhubung di modul Paket Pekerjaan</p>
        </div>
      </div>
    </div>
  );
}

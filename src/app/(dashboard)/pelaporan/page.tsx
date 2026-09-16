"use client";
import { useState } from "react";
import { 
  FileBarChart, Download, RefreshCw, CheckCircle2, AlertCircle, 
  Calendar, Building2, ShieldCheck, FileSpreadsheet, FileText, Send
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PelaporanPage() {
  const [syncing, setSyncing] = useState(false);
  const [period, setPeriod] = useState("Semester I - 2026");

  const reports = [
    {
      id: "LAP-TU-2026-S1",
      title: "Laporan Pengawasan Tertib Usaha Jasa Konstruksi",
      category: "Pilar 1: Tertib Usaha",
      status: "Terkirim & Terverifikasi",
      date: "2026-07-15",
      coverage: "10 BUJK Diperiksa",
      score: "85% (Kategori Tertib)",
      format: "XLSX & PDF"
    },
    {
      id: "LAP-TP-2026-S1",
      title: "Laporan Pengawasan Tertib Penyelenggaraan Konstruksi",
      category: "Pilar 2: Penyelenggaraan",
      status: "Terkirim & Terverifikasi",
      date: "2026-07-20",
      coverage: "8 Paket Proyek APBD/DAK",
      score: "78% (Kategori Cukup Tertib)",
      format: "XLSX & PDF"
    },
    {
      id: "LAP-TM-2026-S1",
      title: "Laporan Pengawasan Tertib Pemanfaatan Produk Konstruksi",
      category: "Pilar 3: Pemanfaatan",
      status: "Dalam Peninjauan Pusat",
      date: "2026-08-05",
      coverage: "5 Bangunan Gedung Publik",
      score: "72% (Kategori Cukup Tertib)",
      format: "XLSX & PDF"
    },
    {
      id: "LAP-TKK-2026-S1",
      title: "Rekapitulasi Pengembangan & Sertifikasi SKK TKK",
      category: "Pilar 5: SDM / TKK",
      status: "Terkirim & Terverifikasi",
      date: "2026-08-10",
      coverage: "85 TKK Tersertifikasi",
      score: "90% (Sangat Baik)",
      format: "XLSX"
    },
    {
      id: "LAP-K3-2026-BLN",
      title: "Laporan Kejadian Kecelakaan Kerja & Penerapan SMKK",
      category: "SMKK & Keselamatan",
      status: "Terkirim & Terverifikasi",
      date: "2026-09-01",
      coverage: "3 Insiden (0 Fatalitas)",
      score: "100% Zero Accident",
      format: "XLSX & Dokumen K3"
    }
  ];

  const handleSyncAll = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      alert("Semua laporan periode aktif berhasil disinkronkan ke server SIPJAKI Pusat!");
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
              <FileBarChart className="h-3 w-3" /> Pelaporan Berkala
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
              Standar Permen PUPR 1/2023
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Pelaporan & Ekspor Sinkronisasi SIPJAKI
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kompilasi rekapitulasi 5 pilar pengawasan jasa konstruksi Kab. Bogor dan pengiriman berkala ke Kementerian PUPR
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-all shadow-sm"
          >
            <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} /> 
            {syncing ? "Menyinkronkan..." : "Kirim Semua ke SIPJAKI"}
          </button>
        </div>
      </div>

      {/* Filter & Selector */}
      <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Pilih Periode Laporan:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="Semester I - 2026">Semester I - TA 2026 (Jan - Jun)</option>
            <option value="Semester II - 2026">Semester II - TA 2026 (Jul - Des)</option>
            <option value="Tahunan - 2025">Laporan Tahunan 2025 (Final)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert(`Mengunduh Paket Rekapitulasi Lengkap Format SIPJAKI (${period})...`)}
            className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-accent" /> Unduh Bundel Excel (.ZIP)
          </button>
          <button
            onClick={() => alert(`Mencetak Laporan Eksekutif Bupati (${period})...`)}
            className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <FileText className="h-4 w-4 text-primary" /> Unduh Buku Laporan (PDF)
          </button>
        </div>
      </div>

      {/* Table of Module Reports */}
      <div className="rounded-2xl border border-slate-200/60 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Modul & Judul Laporan</th>
                <th className="py-3 px-4">Kategori Pilar</th>
                <th className="py-3 px-4">Cakupan Audit</th>
                <th className="py-3 px-4">Skor Kepatuhan</th>
                <th className="py-3 px-4">Status Pengiriman</th>
                <th className="py-3 px-4">Tanggal Kirim</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {reports.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 text-sm">{rep.title}</p>
                    <p className="font-mono text-slate-400 mt-0.5">{rep.id}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {rep.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {rep.coverage}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {rep.score}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold inline-flex items-center gap-1",
                      rep.status.includes("Terkirim") ? "bg-accent/10 text-accent" : "bg-amber/10 text-amber"
                    )}>
                      <CheckCircle2 className="h-3 w-3" />
                      {rep.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono">
                    {rep.date}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => alert(`Mengunduh file laporan ${rep.id}...`)}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-primary hover:text-white transition-all"
                    >
                      <Download className="h-3.5 w-3.5" /> Unduh
                    </button>
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

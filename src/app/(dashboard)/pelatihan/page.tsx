"use client";
import { useState } from "react";
import { 
  GraduationCap, Search, Calendar, Users, Award, Download, 
  CheckCircle2, Clock, Plus, QrCode, FileCheck, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import trainingData from "@/data/training.json";

export default function PelatihanPage() {
  const [activeTab, setActiveTab] = useState<"programs" | "tkk" | "cert">("programs");
  const [search, setSearch] = useState("");
  const [selectedCert, setSelectedCert] = useState<{
    name: string;
    nik: string;
    bujk: string;
    certNo: string;
    trainingTitle: string;
  } | null>(null);

  // Extract all participants across training
  const allTkk = trainingData.flatMap(t => 
    t.participants.map(p => ({
      ...p,
      trainingTitle: t.title,
      skkLevel: t.skkLevel,
      date: t.endDate
    }))
  );

  const filteredTkk = allTkk.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.nik.includes(search) ||
    t.bujk.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
              <GraduationCap className="h-3 w-3" /> Pilar 5: Pengembangan SDM & TKK
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Integrasi: BNSP & SIPJAKI
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Pelatihan & Sertifikasi Tenaga Kerja Konstruksi (TKK)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Fasilitasi uji kompetensi, sertifikasi SKK, bimtek K3 SMKK, dan penerbitan e-Certificate Jasa Konstruksi
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => alert("Mengunduh Rekapitulasi TKK Tersertifikasi Kab. Bogor (.xlsx)...")}
            className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Download className="h-4 w-4" /> Export Data
          </button>
          <button
            onClick={() => alert("Form Buka Pelatihan / Bimtek Baru")}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" /> Buka Pelatihan Baru
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Program Pelatihan</span>
            <GraduationCap className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{trainingData.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">TA 2026 (4 Angkatan)</p>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Total Peserta Terdaftar</span>
            <Users className="h-4 w-4 text-blue" />
          </div>
          <p className="text-2xl font-extrabold text-blue mt-2">
            {trainingData.reduce((acc, t) => acc + t.registered, 0)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Dari Kuota 220 Orang</p>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">TKK Lulus Bersertifikat</span>
            <Award className="h-4 w-4 text-accent" />
          </div>
          <p className="text-2xl font-extrabold text-accent mt-2">
            {trainingData.reduce((acc, t) => acc + t.passed, 0)}
          </p>
          <p className="text-[11px] text-accent font-semibold mt-0.5">Tersertifikasi BNSP / SKK</p>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Target Daerah 2026</span>
            <FileCheck className="h-4 w-4 text-amber" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">500 <span className="text-sm font-normal text-slate-400">TKK</span></p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-accent h-1.5 rounded-full" style={{ width: "38%" }}></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: "programs", label: "Program Pelatihan & Bimtek" },
          { id: "tkk", label: "Database TKK Tersertifikasi" },
          { id: "cert", label: "Verifikasi e-Certificate QR" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-bold transition-all",
              activeTab === tab.id
                ? "bg-primary text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Programs */}
      {activeTab === "programs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trainingData.map((t) => (
            <div key={t.id} className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                    {t.id}
                  </span>
                  <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {t.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{t.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{t.batch} • Jenjang: {t.skkLevel}</p>
                </div>
                <span className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-bold shrink-0",
                  t.status === "Selesai" ? "bg-accent/10 text-accent" :
                  t.status === "Sedang Berjalan" ? "bg-blue/10 text-blue" : "bg-amber/10 text-amber"
                )}>
                  {t.status}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                <p className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>{t.startDate} s/d {t.endDate}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span>Penyelenggara: {t.organizer}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Award className="h-3.5 w-3.5 text-slate-400" />
                  <span>Instruktur: {t.instructor}</span>
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400">Kuota Terisi: </span>
                  <span className="font-bold text-slate-800">{t.registered} / {t.quota} orang</span>
                </div>
                {t.passed > 0 && (
                  <span className="font-bold text-accent">
                    {t.passed} Peserta Lulus (100% Sertifikasi)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Database TKK */}
      {activeTab === "tkk" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama TKK, NIK, atau nama badan usaha..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="rounded-2xl border border-slate-200/60 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Nama & NIK</th>
                    <th className="py-3 px-4">Badan Usaha / BUJK</th>
                    <th className="py-3 px-4">Program Pelatihan</th>
                    <th className="py-3 px-4">Nomor Sertifikat SKK</th>
                    <th className="py-3 px-4">Nilai Uji</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">E-Sertifikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredTkk.map((tkk) => (
                    <tr key={tkk.nik} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-sm">{tkk.name}</p>
                        <p className="text-slate-400 font-mono mt-0.5">NIK: {tkk.nik}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {tkk.bujk}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <p className="font-semibold text-slate-800">{tkk.trainingTitle}</p>
                        <p className="text-[11px] text-slate-400">{tkk.skkLevel}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-primary">
                        {tkk.certNo}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {tkk.score} / 100
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-accent/10 text-accent">
                          {tkk.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedCert({
                              name: tkk.name,
                              nik: tkk.nik,
                              bujk: tkk.bujk,
                              certNo: tkk.certNo,
                              trainingTitle: tkk.trainingTitle,
                            });
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 font-semibold text-primary hover:bg-primary hover:text-white transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" /> Lihat Sertifikat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Cert Verification Preview */}
      {activeTab === "cert" && (
        <div className="rounded-2xl border border-slate-200/60 bg-white p-8 max-w-2xl mx-auto shadow-md text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <QrCode className="h-10 w-10" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Verifikasi Keaslian e-Certificate</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Setiap sertifikat kompetensi yang diterbitkan dilengkapi tanda tangan elektronik dan QR Code yang terhubung ke database BNSP & SIJAKON Bogor.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Penerbit:</span>
              <span className="font-bold text-slate-800">Dinas PUPR Kab. Bogor & Balai Jasa Konstruksi Wil. III</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Standar Acuan:</span>
              <span className="font-bold text-slate-800">SKKNI & Permen PUPR No. 1/2023</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Metode Verifikasi:</span>
              <span className="font-mono font-bold text-accent">Scan QR Code / Masukkan No. SKK</span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <input
              type="text"
              placeholder="Masukkan Nomor Sertifikat (Contoh: SKK-SMKK-2026-001)"
              className="rounded-xl border border-slate-200 py-2.5 px-4 text-xs w-72 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={() => alert("Sertifikat Ditemukan: Valid & Terdaftar di SIJAKON Bogor")}
              className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-dark transition-all"
            >
              Verifikasi
            </button>
          </div>
        </div>
      )}

      {/* Modal e-Certificate Preview */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border-4 border-primary/20 space-y-6 text-center relative">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 font-bold text-xl"
            >
              ✕
            </button>

            {/* Certificate Header */}
            <div className="border-b-2 border-primary/20 pb-4">
              <p className="text-xs uppercase tracking-widest font-bold text-primary">Pemerintah Kabupaten Bogor</p>
              <h2 className="text-xl font-black text-slate-900 mt-1">SERTIFIKAT KOMPETENSI KERJA</h2>
              <p className="font-mono text-xs text-slate-500 mt-0.5">No. Registrasi: {selectedCert.certNo}</p>
            </div>

            {/* Certificate Body */}
            <div className="space-y-3 py-2">
              <p className="text-xs text-slate-500">Diberikan dengan predikat sangat memuaskan kepada:</p>
              <h3 className="text-2xl font-black text-primary tracking-wide">{selectedCert.name}</h3>
              <p className="text-xs text-slate-600 font-mono">NIK: {selectedCert.nik} • {selectedCert.bujk}</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto pt-2">
                Telah dinyatakan <strong>LULUS DAN KOMPETEN</strong> dalam mengikuti program:
              </p>
              <p className="text-base font-bold text-slate-900 bg-primary/5 py-2 px-4 rounded-xl inline-block">
                {selectedCert.trainingTitle}
              </p>
            </div>

            {/* Certificate Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-left text-xs">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center">
                  <QrCode className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Digital Signature Verified</p>
                  <p className="text-[10px] text-slate-400">BSrE - Badan Siber dan Sandi Negara</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-slate-400">Cibinong, Kab. Bogor</p>
                <p className="font-bold text-slate-900 mt-1">Kepala Dinas PUPR Kab. Bogor</p>
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => alert(`Mengunduh Salinan PDF e-Certificate ${selectedCert.certNo}...`)}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-dark transition-all"
              >
                <Download className="h-4 w-4" /> Unduh PDF Sertifikat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

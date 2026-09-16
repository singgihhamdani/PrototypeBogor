"use client";
import { useState } from "react";
import { ClipboardCheck, CheckCircle2, XCircle, MinusCircle, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

type Answer = "ya" | "tidak" | "na" | null;

interface CheckItem {
  id: string;
  question: string;
  answer: Answer;
}

const initialChecklist: Record<string, CheckItem[]> = {
  "Tertib Usaha": [
    { id: "TU01", question: "Badan Usaha memiliki NIB (Nomor Induk Berusaha) yang masih berlaku", answer: null },
    { id: "TU02", question: "Memiliki SBU (Sertifikat Badan Usaha) sesuai klasifikasi pekerjaan", answer: null },
    { id: "TU03", question: "SBU masih dalam masa berlaku pada saat pelaksanaan", answer: null },
    { id: "TU04", question: "Memiliki PJT (Penanggung Jawab Teknik) bersertifikat kompetensi", answer: null },
    { id: "TU05", question: "Memiliki PJSK (Penanggung Jawab Sistem K3 Konstruksi)", answer: null },
    { id: "TU06", question: "BUJK terdaftar dalam sistem SIPJAKI PUPR", answer: null },
    { id: "TU07", question: "Tenaga kerja konstruksi memiliki sertifikat kompetensi (SKK/SKTK)", answer: null },
  ],
  "Tertib Penyelenggaraan": [
    { id: "TP01", question: "Kontrak kerja konstruksi tersedia dan lengkap", answer: null },
    { id: "TP02", question: "Metode pelaksanaan (method statement) telah disetujui", answer: null },
    { id: "TP03", question: "Jadwal pelaksanaan (time schedule) tersedia dan dimonitor", answer: null },
    { id: "TP04", question: "Gambar kerja (shop drawing) tersedia di lokasi proyek", answer: null },
    { id: "TP05", question: "Laporan progres fisik disampaikan secara berkala", answer: null },
    { id: "TP06", question: "Laporan keuangan/realisasi anggaran tersedia", answer: null },
    { id: "TP07", question: "Standar K3 Konstruksi diterapkan di lokasi proyek", answer: null },
    { id: "TP08", question: "Pengawas/konsultan pengawas tersedia di lapangan", answer: null },
  ],
  "Tertib Pemanfaatan": [
    { id: "TM01", question: "Hasil pekerjaan sesuai dengan spesifikasi teknis kontrak", answer: null },
    { id: "TM02", question: "Berita Acara Serah Terima (BAST/PHO) telah dilaksanakan", answer: null },
    { id: "TM03", question: "Masa pemeliharaan (maintenance period) berjalan", answer: null },
    { id: "TM04", question: "Bangunan/infrastruktur dimanfaatkan sesuai peruntukan", answer: null },
    { id: "TM05", question: "Dokumentasi as-built drawing tersedia", answer: null },
    { id: "TM06", question: "SLF (Sertifikat Laik Fungsi) telah diurus (jika bangunan gedung)", answer: null },
  ],
};

function calcScore(items: CheckItem[]): number {
  const answered = items.filter((i) => i.answer === "ya" || i.answer === "tidak");
  if (answered.length === 0) return 0;
  const yes = items.filter((i) => i.answer === "ya").length;
  return Math.round((yes / answered.length) * 100);
}

export default function PengawasanPage() {
  const [checklist, setChecklist] = useState(initialChecklist);
  const [activeTab, setActiveTab] = useState("Tertib Usaha");

  const toggleAnswer = (tab: string, id: string, value: Answer) => {
    setChecklist((prev) => ({
      ...prev,
      [tab]: prev[tab].map((item) => item.id === id ? { ...item, answer: item.answer === value ? null : value } : item),
    }));
  };

  const resetAll = () => setChecklist(initialChecklist);

  const totalScore = (() => {
    const allItems = Object.values(checklist).flat();
    const answered = allItems.filter((i) => i.answer === "ya" || i.answer === "tidak");
    if (answered.length === 0) return 0;
    return Math.round((allItems.filter((i) => i.answer === "ya").length / answered.length) * 100);
  })();

  const statusLabel = totalScore >= 80 ? "TERTIB" : totalScore >= 60 ? "CUKUP TERTIB" : totalScore > 0 ? "KURANG TERTIB" : "BELUM DINILAI";
  const statusColor = totalScore >= 80 ? "text-accent" : totalScore >= 60 ? "text-amber" : totalScore > 0 ? "text-rose" : "text-slate-400";
  const statusBg = totalScore >= 80 ? "bg-accent" : totalScore >= 60 ? "bg-amber" : totalScore > 0 ? "bg-rose" : "bg-slate-300";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Pengawasan & SIMAK</h1>
          <p className="text-sm text-slate-500 mt-1">Checklist digital Permen PUPR No. 1/2023 — Instrumen SIMAK</p>
        </div>
        <button onClick={resetAll} className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200">
          <RotateCw className="h-4 w-4" /> Reset
        </button>
      </div>

      {/* Score gauge */}
      <div className="rounded-2xl border border-slate-200/60 bg-white p-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <svg width="160" height="160" className="transform -rotate-90">
              <circle cx="80" cy="80" r="65" fill="none" stroke="#E2E8F0" strokeWidth="14" />
              <circle cx="80" cy="80" r="65" fill="none" stroke={totalScore >= 80 ? "#10B981" : totalScore >= 60 ? "#F59E0B" : totalScore > 0 ? "#EF4444" : "#CBD5E1"} strokeWidth="14"
                strokeDasharray={2 * Math.PI * 65} strokeDashoffset={2 * Math.PI * 65 - (totalScore / 100) * 2 * Math.PI * 65}
                strokeLinecap="round" className="transition-all duration-700 ease-out" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-slate-900">{totalScore}%</span>
              <span className={cn("text-xs font-bold", statusColor)}>{statusLabel}</span>
            </div>
          </div>
          <div className="flex-1 space-y-3 w-full">
            {Object.entries(checklist).map(([tab, items]) => {
              const score = calcScore(items);
              return (
                <div key={tab} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-600 w-44 shrink-0">{tab}</span>
                  <div className="flex-1 h-3 rounded-full bg-slate-200 overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-500",
                      score >= 80 ? "bg-accent" : score >= 60 ? "bg-amber" : score > 0 ? "bg-rose" : "bg-slate-300"
                    )} style={{ width: `${score}%` }} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 w-12 text-right">{score}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-px">
        {Object.keys(checklist).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn("px-4 py-2.5 text-sm font-semibold transition-colors border-b-2",
              activeTab === tab ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >{tab} <span className="ml-1 text-xs text-slate-400">({calcScore(checklist[tab])}%)</span></button>
        ))}
      </div>

      {/* Checklist items */}
      <div className="rounded-2xl border border-slate-200/60 bg-white divide-y divide-slate-100">
        {checklist[activeTab].map((item) => (
          <div key={item.id} className={cn("flex items-center gap-4 px-5 py-4 transition-colors",
            item.answer === "ya" && "bg-accent/5",
            item.answer === "tidak" && "bg-rose/5",
          )}>
            <span className="text-xs font-bold text-slate-400 w-10 shrink-0">{item.id}</span>
            <p className="flex-1 text-sm text-slate-700">{item.question}</p>
            <div className="flex items-center gap-2">
              {(["ya", "tidak", "na"] as Answer[]).map((val) => (
                <button key={val} onClick={() => toggleAnswer(activeTab, item.id, val)}
                  className={cn("flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                    item.answer === val
                      ? val === "ya" ? "bg-accent text-white" : val === "tidak" ? "bg-rose text-white" : "bg-slate-500 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  )}
                >
                  {val === "ya" && <CheckCircle2 className="h-3.5 w-3.5" />}
                  {val === "tidak" && <XCircle className="h-3.5 w-3.5" />}
                  {val === "na" && <MinusCircle className="h-3.5 w-3.5" />}
                  {val === "ya" ? "Ya" : val === "tidak" ? "Tidak" : "N/A"}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { 
  Settings, Users, KeyRound, Shield, RefreshCw, CheckCircle2, 
  Save, Globe, Bell, Lock, Server
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState<"api" | "users" | "general">("api");
  const [apiKey, setApiKey] = useState("spjk_bogor_live_99a82f710c3b4e");
  const [autoSync, setAutoSync] = useState(true);
  const [saved, setSaved] = useState(false);

  const users = [
    { id: "USR-01", name: "H. Raden Ridwan, ST, M.Si", role: "Super Admin (Kabid Jakon)", email: "ridwan.jakon@bogorkab.go.id", status: "Aktif" },
    { id: "USR-02", name: "Bayu Pratama, S.Kom", role: "Administrator Sistem", email: "bayu.sipjaki@bogorkab.go.id", status: "Aktif" },
    { id: "USR-03", name: "Supriyatna, ST", role: "Pengawas SIMAK Lapangan", email: "pengawas01@bogorkab.go.id", status: "Aktif" },
    { id: "USR-04", name: "PPK Dinas Pendidikan", role: "OPD Pengguna Jasa", email: "ppk.disdik@bogorkab.go.id", status: "Aktif" },
    { id: "USR-05", name: "PT Bangun Jaya Konstruksi", role: "Penyedia Jasa (BUJK)", email: "info@bangunjaya.co.id", status: "Aktif" }
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
            <Settings className="h-3 w-3" /> Konfigurasi Sistem
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
          Pengaturan Sistem & Integrasi SIPJAKI
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manajemen kredensial API Kementerian PUPR, hak akses pengguna, serta preferensi sinkronisasi data
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: "api", label: "Integrasi API SIPJAKI", icon: Server },
          { id: "users", label: "Manajemen Pengguna & Role", icon: Users },
          { id: "general", label: "Preferensi Umum", icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all",
                activeTab === tab.id
                  ? "bg-primary text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab: API */}
      {activeTab === "api" && (
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" /> Koneksi Gateway SIPJAKI Kementerian PUPR
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Digunakan untuk sinkronisasi otomatis data 5 pilar (Tertib Usaha, Penyelenggaraan, Pemanfaatan, K3, dan TKK)
            </p>
          </div>

          <div className="space-y-4 max-w-2xl text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                SIPJAKI API Base URL
              </label>
              <input
                type="text"
                readOnly
                value="https://sipjaki.pu.go.id/api/v2/integration"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                API Secret Token (Pemerintah Kabupaten Bogor)
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white p-2.5 font-mono text-slate-900 focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => alert("Tes Koneksi: Ping ke SIPJAKI Kementerian PUPR Sukses! Latensi 42ms.")}
                  className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Uji Koneksi
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-800">Sinkronisasi Otomatis Terjadwal</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Kirim rekapitulasi data setiap hari pukul 23:59 WIB</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoSync(!autoSync)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  autoSync ? "bg-primary" : "bg-slate-300"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    autoSync ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white hover:bg-primary-dark transition-all shadow-sm"
            >
              {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved ? "Tersimpan!" : "Simpan Pengaturan API"}
            </button>
          </div>
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === "users" && (
        <div className="rounded-2xl border border-slate-200/60 bg-white overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Daftar Pengguna & Hak Akses</h2>
              <p className="text-xs text-slate-500 mt-0.5">Peran akun dalam input audit SIMAK, verifikasi BUJK, dan pelaporan</p>
            </div>
            <button
              onClick={() => alert("Form Tambah Akun Pengguna Baru")}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-dark transition-all"
            >
              + Tambah Pengguna
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-left font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4">Role / Peran</th>
                  <th className="py-3 px-4">Email Instansi</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                      <p className="text-slate-400 font-mono text-[11px]">{u.id}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-primary">
                      {u.role}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-accent/10 text-accent">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => alert(`Edit hak akses untuk ${u.name}`)}
                        className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-200"
                      >
                        Edit Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: General */}
      {activeTab === "general" && (
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm space-y-4 max-w-2xl text-xs">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Preferensi Lingkungan Sistem
          </h2>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Aplikasi</label>
            <input
              type="text"
              readOnly
              value="SIJAKON - Sistem Informasi Jasa Konstruksi Kab. Bogor"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Versi Rilis</label>
            <input
              type="text"
              readOnly
              value="v1.0-prototype (Preview for Vercel Deployment)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Zona Waktu</label>
            <input
              type="text"
              readOnly
              value="Asia/Jakarta (WIB, UTC+7)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800"
            />
          </div>
        </div>
      )}
    </div>
  );
}

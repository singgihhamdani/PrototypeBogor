"use client";
import { Bell, Search, LogOut, User, ShieldCheck, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/mock-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUser, setShowUser] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 shadow-2xs">
      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nomor kontrak, BUJK, NIB, atau regulasi... (Ctrl+K)"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2E5C]/20 focus:border-[#0F2E5C] transition-all"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-4 items-center rounded border border-slate-200 bg-slate-100 px-1 text-[9px] font-bold text-slate-400">
          Ctrl K
        </kbd>
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center gap-3 ml-4">
        {/* SIPJAKI National Sync Badge */}
        <div className="hidden lg:flex items-center gap-2 rounded-full bg-[#EBF2FA] border border-[#0F2E5C]/15 px-3 py-1 text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-[#0F2E5C]">SIPJAKI PUPR</span>
          <span className="text-[10px] text-slate-500">• Terhubung</span>
        </div>

        {/* TA 2026 Pill */}
        <div className="hidden sm:flex items-center gap-1 rounded-full bg-[#FFFBEB] border border-amber-200 px-3 py-1">
          <span className="text-[11px] font-black text-[#B45309]">TA 2026</span>
        </div>

        {/* Notifications */}
        <button 
          onClick={() => alert("Notifikasi Sistem: 3 Laporan Audit SIMAK menunggu verifikasi.")}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute 1.5 -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
            3
          </span>
        </button>

        <div className="h-6 w-[1px] bg-slate-200"></div>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUser(!showUser)}
            className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0F2E5C] text-[#FFC000] text-xs font-black border border-[#FFC000]/40 shadow-xs">
              AD
            </div>
            <div className="hidden md:block text-left leading-tight">
              <span className="block text-xs font-bold text-slate-800">{user?.name || "Admin DPUPR"}</span>
              <span className="block text-[10px] font-semibold text-slate-400">{user?.role || "Super Admin"}</span>
            </div>
          </button>

          {showUser && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-fade-in">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
              <button 
                onClick={() => { setShowUser(false); router.push("/profil-opd"); }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <User className="h-4 w-4 text-[#0F2E5C]" /> Profil OPD & Akun
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Keluar Sesi
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

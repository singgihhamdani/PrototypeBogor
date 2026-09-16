"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Map, Building2, ClipboardCheck, GraduationCap,
  Package, Landmark, FileBarChart, BookOpen, Newspaper, Settings,
  ChevronLeft, ChevronRight, ShieldAlert, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "WebGIS Peta", href: "/webgis", icon: Map },
  { label: "BUJK Master", href: "/bujk", icon: Building2 },
  { label: "Pengawasan SIMAK", href: "/pengawasan", icon: ClipboardCheck, badge: 3 },
  { label: "Paket Pekerjaan", href: "/paket-pekerjaan", icon: Package },
  { label: "Profil OPD PUPR", href: "/profil-opd", icon: Landmark },
  { label: "Pelatihan & TKK", href: "/pelatihan", icon: GraduationCap },
  { label: "Kecelakaan K3", href: "/kecelakaan", icon: ShieldAlert },
  { label: "Pelaporan SIPJAKI", href: "/pelaporan", icon: FileBarChart },
  { label: "Regulasi Jakon", href: "/regulasi", icon: BookOpen },
  { label: "Berita & Warta", href: "/berita", icon: Newspaper },
  { label: "Pengaturan & API", href: "/pengaturan", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out shadow-xs",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo Header */}
      <div className="flex h-16 items-center justify-between border-b-2 border-slate-100 bg-[#0F2E5C] px-4 text-white">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFC000] text-[#0F2E5C] font-black text-xs shadow-sm">
              PUPR
            </div>
            <div className="leading-tight">
              <span className="block text-sm font-black text-white tracking-wider">SIJAKON</span>
              <span className="block text-[10px] font-bold text-[#FFC000] tracking-widest">KAB. BOGOR</span>
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFC000] text-[#0F2E5C] font-black text-xs shadow-sm">
            PUPR
          </div>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-150",
                isActive
                  ? "bg-[#0F2E5C] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-[#FFC000]" : "text-slate-400 group-hover:text-slate-600")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className={cn(
                  "ml-auto flex h-4 min-w-4 items-center justify-center rounded-full text-[9px] font-bold px-1.5",
                  isActive ? "bg-[#FFC000] text-[#0F2E5C]" : "bg-rose-500 text-white"
                )}>
                  {item.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-[#FFC000]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* SIPJAKI Sync Status Indicator */}
      {!collapsed && (
        <div className="p-3 mx-3 mb-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px]">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Gateway SIPJAKI</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Status: Terhubung Aktif</p>
        </div>
      )}

      {/* Collapse toggle */}
      <div className="border-t border-slate-100 p-2.5 bg-slate-50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-200 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Sembunyikan Menu</span></>}
        </button>
      </div>
    </aside>
  );
}

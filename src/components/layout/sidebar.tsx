"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Map, Building2, ClipboardCheck, GraduationCap,
  Package, Landmark, FileBarChart, BookOpen, Newspaper, Settings,
  ChevronLeft, ChevronRight, ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "WebGIS Peta", href: "/webgis", icon: Map },
  { label: "BUJK Master", href: "/bujk", icon: Building2 },
  { label: "Pengawasan", href: "/pengawasan", icon: ClipboardCheck, badge: 3 },
  { label: "Paket Pekerjaan", href: "/paket-pekerjaan", icon: Package },
  { label: "Profil OPD", href: "/profil-opd", icon: Landmark },
  { label: "Pelatihan", href: "/pelatihan", icon: GraduationCap },
  { label: "Kecelakaan K3", href: "/kecelakaan", icon: ShieldAlert },
  { label: "Pelaporan", href: "/pelaporan", icon: FileBarChart },
  { label: "Regulasi", href: "/regulasi", icon: BookOpen },
  { label: "Berita", href: "/berita", icon: Newspaper },
  { label: "Pengaturan", href: "/pengaturan", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-extrabold text-sm">
              SJ
            </div>
            <div className="leading-tight">
              <span className="block text-sm font-bold text-primary">SIJAKON</span>
              <span className="block text-[10px] font-medium text-slate-400 tracking-wide">KAB. BOGOR</span>
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-extrabold text-sm">
            SJ
          </div>
        )}
      </div>

      {/* Nav */}
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
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose text-white text-[10px] font-bold px-1.5">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-slate-200 p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Tutup Menu</span></>}
        </button>
      </div>
    </aside>
  );
}

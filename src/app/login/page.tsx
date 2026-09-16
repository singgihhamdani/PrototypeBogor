"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/mock-auth";
import { 
  Eye, EyeOff, ShieldCheck, MapPin, Building2, 
  ArrowRight, Key, Mail, Lock, CheckCircle2, Landmark, Sparkles
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@sijakon.bogor.go.id");
  const [password, setPassword] = useState("demo2026");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const ok = login(email, password);
    if (ok) {
      router.push("/");
    } else {
      setError("Kombinasi email atau kata sandi demo tidak valid.");
      setLoading(false);
    }
  };

  const setDemoCredentials = () => {
    setEmail("admin@sijakon.bogor.go.id");
    setPassword("demo2026");
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#F8FAFC] selection:bg-[#F59E0B] selection:text-white">
      {/* Top Header Bar PUPR Standard */}
      <header className="w-full bg-[#0F2E5C] border-b-4 border-[#FFC000] px-6 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* PUPR & Pemkab Logo Badges */}
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-[#FFC000] text-[#0F2E5C] font-black flex items-center justify-center text-sm shadow-sm border border-white/20">
                PUPR
              </div>
              <div className="h-7 w-[1px] bg-white/20"></div>
              <div className="h-10 w-10 rounded-xl bg-white/10 text-white font-black flex items-center justify-center text-sm border border-white/20">
                BOGOR
              </div>
            </div>
            <div className="text-white leading-tight">
              <h1 className="text-xs sm:text-sm font-extrabold tracking-wider uppercase text-[#FFC000]">
                DINAS PEKERJAAN UMUM DAN PENATAAN RUANG
              </h1>
              <p className="text-[11px] text-white/80 font-medium tracking-wide">
                Pemerintah Kabupaten Bogor • Terintegrasi SIPJAKI Kementerian PUPR
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-white/80 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
            <ShieldCheck className="h-4 w-4 text-[#FFC000]" />
            <span>Portal Resmi Pembinaan Jasa Konstruksi</span>
          </div>
        </div>
      </header>

      {/* Main Login Card Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
          
          {/* Left Hero Banner (5 Cols) - Deep PUPR Blue & Construction Accent */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#091A36] via-[#0F2E5C] to-[#163B75] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Background Pattern */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(#FFC000 1px, transparent 1px)",
                backgroundSize: "20px 20px"
              }}
            />

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#FFC000] border border-white/10">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Prototype Sistem TA 2026</span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
                  SIJAKON BOGOR
                </h2>
                <div className="h-1.5 w-16 bg-[#FFC000] rounded-full mt-2 mb-3"></div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  Sistem Informasi Pembinaan, Pengawasan SIMAK, dan Sinkronisasi 5 Pilar Jasa Konstruksi Kabupaten Bogor dengan SIPJAKI Nasional.
                </p>
              </div>

              {/* 3 Core Highlights */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <Building2 className="h-5 w-5 text-[#FFC000] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-white">40 Wilayah Kecamatan</p>
                    <p className="text-slate-300 text-[11px]">Monitoring proyek fisik & BUJK berbasis peta WebGIS spasial.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <ShieldCheck className="h-5 w-5 text-[#FFC000] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-white">Standar Permen PUPR 1/2023</p>
                    <p className="text-slate-300 text-[11px]">Audit digital SIMAK (Tertib Usaha, Penyelenggaraan & Pemanfaatan).</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Slogan */}
            <div className="relative z-10 pt-6 mt-6 border-t border-white/15 flex items-center justify-between text-[11px] text-white/70">
              <span className="font-semibold tracking-wider text-[#FFC000]">SIGAP MEMBANGUN NEGERI</span>
              <span>v1.0 Preview</span>
            </div>
          </div>

          {/* Right Form Area (7 Cols) */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-white">
            <div className="max-w-md mx-auto w-full space-y-6">
              
              <div>
                <span className="text-xs font-bold text-[#0F2E5C] bg-[#EBF2FA] px-3 py-1 rounded-full uppercase tracking-wider">
                  Masuk Portal Petugas
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                  Silakan Masuk
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Akses modul pembinaan dan evaluasi jasa konstruksi
                </p>
              </div>

              {/* Demo Account Banner */}
              <div className="rounded-2xl border border-[#FFC000]/40 bg-[#FFFBEB] p-4 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#B45309]">
                    <Key className="h-3.5 w-3.5" />
                    <span>Akun Demo Prototype (Tinjauan Tim):</span>
                  </div>
                  <button
                    type="button"
                    onClick={setDemoCredentials}
                    className="text-[10px] font-bold text-[#0F2E5C] bg-white border border-amber-300 px-2 py-0.5 rounded-md hover:bg-[#FFC000] transition-colors"
                  >
                    Auto-Fill
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-700 bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Email:</span>
                    <span className="font-semibold text-[#0F2E5C]">admin@sijakon.bogor.go.id</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Password:</span>
                    <span className="font-semibold text-[#0F2E5C]">demo2026</span>
                  </div>
                </div>
              </div>

              {/* Form Input */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Alamat Email Instansi
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@sijakon.bogor.go.id"
                      required
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#0F2E5C] focus:ring-3 focus:ring-[#0F2E5C]/15 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Kata Sandi
                    </label>
                    <span className="text-[11px] text-slate-400">Demo mode</span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#0F2E5C] focus:ring-3 focus:ring-[#0F2E5C]/15 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-semibold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F2E5C] hover:bg-[#091A36] text-white py-3 px-4 text-sm font-bold shadow-lg shadow-[#0F2E5C]/20 border-b-2 border-[#FFC000] transition-all hover:translate-y-[-1px] active:translate-y-[0px] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-[#FFC000] rounded-full animate-spin" />
                      Memverifikasi Sesi...
                    </span>
                  ) : (
                    <>
                      <span>Masuk ke Dashboard SIJAKON</span>
                      <ArrowRight className="h-4 w-4 text-[#FFC000]" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-400">
                  Didukung oleh Bidang Jasa Konstruksi DPUPR Kab. Bogor & Balai Jasa Konstruksi Wilayah III
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer PUPR */}
      <footer className="w-full border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Bogor. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>SIPJAKI Terintegrasi</span>
            <span>•</span>
            <span>Permen PUPR No. 1/2023</span>
            <span>•</span>
            <span>SMKK K3 Konstruksi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

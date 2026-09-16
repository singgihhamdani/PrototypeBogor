"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/mock-auth";
import { Eye, EyeOff, MapPin, Shield } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const ok = login(email, password);
    if (ok) {
      router.push("/");
    } else {
      setError("Email atau kata sandi tidak valid.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-gradient-to-br from-primary-dark via-primary to-[#0d6b3f] overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}>
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            <div className="flex items-center gap-3 mb-16">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm font-extrabold text-lg">
                SJ
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">SIJAKON BOGOR</h2>
                <p className="text-xs text-white/60 font-medium tracking-wider uppercase">Prototype TA 2026</p>
              </div>
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold leading-[1.15] tracking-tight mb-6">
              Sistem Informasi<br />
              <span className="text-accent">Jasa Konstruksi</span><br />
              Kabupaten Bogor
            </h1>
            <p className="text-white/70 text-lg max-w-md leading-relaxed">
              Platform pembinaan, pengawasan, dan monitoring terintegrasi SIPJAKI Kementerian PUPR untuk 40 kecamatan.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <MapPin className="h-4 w-4" />
              <span>40 Kecamatan</span>
            </div>
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <Shield className="h-4 w-4" />
              <span>Terintegrasi SIPJAKI PUPR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white font-extrabold text-sm">SJ</div>
            <span className="text-lg font-bold text-primary">SIJAKON BOGOR</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Selamat Datang</h2>
            <p className="text-slate-500 text-sm mt-1">Masuk ke dashboard SIJAKON Kabupaten Bogor</p>
          </div>

          {/* Demo credentials hint */}
          <div className="mb-6 rounded-xl bg-accent/10 border border-accent/20 p-4">
            <p className="text-xs font-bold text-primary mb-1">🔑 Akun Demo Prototype:</p>
            <p className="text-xs text-slate-600 font-mono">
              Email: <span className="font-semibold">admin@sijakon.bogor.go.id</span><br />
              Password: <span className="font-semibold">demo2026</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Alamat Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sijakon.bogor.go.id"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kata Sandi</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-rose/10 border border-rose/20 px-4 py-3 text-sm text-rose font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Memverifikasi...
                </span>
              ) : (
                "Masuk Sekarang"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            DPUPR Kabupaten Bogor — Prototype SIJAKON TA 2026
          </p>
        </div>
      </div>
    </div>
  );
}

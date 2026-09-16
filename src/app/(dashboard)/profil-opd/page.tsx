"use client";
import { useState } from "react";
import { 
  Landmark, UserCheck, ShieldCheck, DollarSign, FileText, CheckCircle2, 
  Send, RefreshCw, Upload, Sparkles, Building2, Phone, Mail, Globe, MapPin
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import opdData from "@/data/opd.json";

export default function ProfilOpdPage() {
  const [profile, setProfile] = useState(opdData);
  const [isEditing, setIsEditing] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  const handleSync = () => {
    setSyncLoading(true);
    setTimeout(() => {
      setSyncLoading(false);
      alert("Profil OPD berhasil disinkronkan langsung dengan SIPJAKI Nasional (Kementerian PUPR)!");
    }, 1200);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    alert("Perubahan Profil OPD berhasil disimpan!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
              <Landmark className="h-3 w-3" /> Data Kelembagaan
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> {profile.sipjakiStatus.accountStatus}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Profil OPD Penyelenggara Jasa Konstruksi
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelengkapan profil kelembagaan, personil tim pembina, pagu anggaran, dan SK Tim Pengawas SIPJAKI
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={syncLoading}
            className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className={cn("h-4 w-4", syncLoading && "animate-spin text-primary")} /> 
            {syncLoading ? "Sinkronisasi..." : "Sinkronkan ke SIPJAKI"}
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-all shadow-sm"
          >
            {isEditing ? "Batal Edit" : "Perbarui Profil"}
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white font-bold">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              Kelengkapan Profil SIPJAKI: {profile.sipjakiStatus.completenessScore}% (Sangat Lengkap)
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Sinkronisasi Terakhir: {profile.sipjakiStatus.lastSync}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-36 bg-white rounded-full h-2.5 border border-slate-200 overflow-hidden">
            <div 
              className="bg-accent h-2.5 rounded-full" 
              style={{ width: `${profile.sipjakiStatus.completenessScore}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-accent">96/100</span>
        </div>
      </div>

      {/* Main Form/Display */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Identitas OPD */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" /> 1. Identitas Organisasi Perangkat Daerah
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Dinas / Instansi</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.agencyName}
                onChange={(e) => setProfile({...profile, agencyName: e.target.value})}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 disabled:bg-slate-50/60 p-2.5 text-sm font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pemerintah Daerah</label>
              <input
                type="text"
                disabled={!isEditing}
                value={`${profile.government} - Provinsi ${profile.province}`}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bidang Penanggung Jawab</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.division}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Website Resmi</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.website}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium text-slate-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Alamat Kantor</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.address}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Personel Kunci & PIC SIPJAKI */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-primary" /> 2. Personil Kunci & Penanggung Jawab SIPJAKI
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Kepala Dinas */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kepala Dinas</span>
              <p className="text-sm font-bold text-slate-900">{profile.headOfAgency.name}</p>
              <p className="text-xs font-mono text-slate-500">NIP. {profile.headOfAgency.nip}</p>
              <p className="text-xs text-slate-600">{profile.headOfAgency.position}</p>
            </div>

            {/* PIC SIPJAKI */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">PIC SIPJAKI (Kabid)</span>
              <p className="text-sm font-bold text-slate-900">{profile.picSipjaki.name}</p>
              <p className="text-xs font-mono text-slate-500">NIP. {profile.picSipjaki.nip}</p>
              <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                <p className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-primary" /> {profile.picSipjaki.phone}</p>
                <p className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-primary" /> {profile.picSipjaki.email}</p>
              </div>
            </div>

            {/* Operator SIPJAKI */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Operator Sistem</span>
              <p className="text-sm font-bold text-slate-900">{profile.operatorSipjaki.name}</p>
              <p className="text-xs font-mono text-slate-500">NIP. {profile.operatorSipjaki.nip}</p>
              <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                <p className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-slate-400" /> {profile.operatorSipjaki.phone}</p>
                <p className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-slate-400" /> {profile.operatorSipjaki.email}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-50 p-2.5 rounded-xl">
              <p className="text-lg font-bold text-slate-900">{profile.personnel.functionalSupervisors}</p>
              <p className="text-[11px] text-slate-500">Pejabat Fungsional Jakon</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl">
              <p className="text-lg font-bold text-primary">{profile.personnel.certifiedInspectors}</p>
              <p className="text-[11px] text-slate-500">Pengawas Bersertifikat SIMAK</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl">
              <p className="text-lg font-bold text-slate-900">{profile.personnel.adminStaff}</p>
              <p className="text-[11px] text-slate-500">Staf Administrasi</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl">
              <p className="text-lg font-bold text-slate-900">{profile.personnel.contractStaff}</p>
              <p className="text-[11px] text-slate-500">Tenaga Pendukung Lapangan</p>
            </div>
          </div>
        </div>

        {/* Section 3: SK Tim Pembina & Anggaran */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SK Pembina */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> 3. SK Tim Pembina & Pengawas
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Nomor SK Bupati:</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{profile.decree.number}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Tanggal Penetapan:</span>
                <p className="font-semibold text-slate-800 mt-0.5">{profile.decree.date}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Tentang:</span>
                <p className="text-slate-700 mt-0.5 leading-relaxed">{profile.decree.about}</p>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-bold text-accent flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> {profile.decree.status}
                </span>
                <button
                  type="button"
                  onClick={() => alert("Mengunduh salinan SK Tim Pembina...")}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Unduh SK (PDF)
                </button>
              </div>
            </div>
          </div>

          {/* Anggaran Pembinaan */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-accent" /> 4. Pagu Anggaran Pembinaan TA 2026
            </h2>
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 font-medium">Total Pagu:</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {formatCurrency(profile.budget2026.paguTotal)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 font-medium">Realisasi per Hari Ini:</span>
                <span className="text-sm font-bold text-accent font-mono">
                  {formatCurrency(profile.budget2026.realization)} ({Math.round((profile.budget2026.realization / profile.budget2026.paguTotal) * 100)}%)
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                {profile.budget2026.activities.map((act) => (
                  <div key={act.name} className="flex items-center justify-between text-slate-600">
                    <span className="truncate max-w-[220px]">{act.name}</span>
                    <span className="font-mono text-slate-800 font-semibold">{formatCurrency(act.pagu)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-all shadow-sm"
            >
              <Send className="h-4 w-4" /> Simpan Perubahan Profil
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

"use client";
import { useState } from "react";
import { 
  ShieldAlert, Plus, Search, Calendar, MapPin, AlertTriangle, 
  CheckCircle2, FileText, Send, Eye, ShieldCheck, Download, ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import incidentsData from "@/data/incidents.json";
import projectsData from "@/data/projects.json";

export default function KecelakaanPage() {
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [incidents, setIncidents] = useState(incidentsData);
  const [search, setSearch] = useState("");
  const [selectedIncident, setSelectedIncident] = useState<typeof incidentsData[0] | null>(null);

  // Form states matching SIPJAKI
  const [formData, setFormData] = useState({
    projectId: "P001",
    date: "",
    time: "",
    district: "Cibinong",
    locationDetail: "",
    incidentType: "Tertimpa Material / Benda Jatuh",
    severity: "Luka Ringan",
    victimName: "",
    victimRole: "",
    injuryDetail: "",
    chronology: "",
    correctiveAction: "",
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projectsData.find(p => p.id === formData.projectId);
    const newInc = {
      id: `K3-2026-00${incidents.length + 1}`,
      projectId: formData.projectId,
      projectName: proj?.name || "Proyek Konstruksi",
      contractor: proj?.contractor || "Kontraktor Pelaksana",
      date: formData.date || new Date().toISOString().split("T")[0],
      time: formData.time || "10:00",
      district: formData.district,
      locationDetail: formData.locationDetail || "Lokasi Proyek",
      incidentType: formData.incidentType,
      severity: formData.severity,
      victimName: formData.victimName || "-",
      victimRole: formData.victimRole || "Pekerja",
      injuryDetail: formData.injuryDetail || "-",
      chronology: formData.chronology,
      correctiveAction: formData.correctiveAction,
      status: "Menunggu Verifikasi Pengawas",
      reportedToSipjaki: true,
      sipjakiRef: `SIPJAKI-K3-2026-0${Math.floor(100 + Math.random() * 900)}`
    };

    setIncidents([newInc, ...incidents]);
    alert("Laporan Kecelakaan Kerja berhasil disimpan & siap disinkronkan ke SIPJAKI Nasional!");
    setActiveTab("list");
  };

  const filteredIncidents = incidents.filter(inc => 
    inc.projectName.toLowerCase().includes(search.toLowerCase()) ||
    inc.contractor.toLowerCase().includes(search.toLowerCase()) ||
    inc.incidentType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose/10 text-rose flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" /> Modul SMKK & K3 Konstruksi
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Sinkronisasi: SIPJAKI PUPR
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Pelaporan Kecelakaan Kerja Konstruksi
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Pencatatan insiden K3, investigasi penyebab, tindakan perbaikan, dan integrasi data insiden ke Kementerian PUPR
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("list")}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
              activeTab === "list" ? "bg-primary text-white shadow-sm" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            )}
          >
            Daftar Insiden ({incidents.length})
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-all",
              activeTab === "create" ? "bg-rose text-white shadow-sm" : "bg-rose/10 text-rose hover:bg-rose/20"
            )}
          >
            <Plus className="h-4 w-4" /> Lapor Kecelakaan
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Total Insiden K3</span>
            <ShieldAlert className="h-4 w-4 text-rose" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{incidents.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Tercatat TA 2026</p>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Luka Ringan</span>
            <AlertTriangle className="h-4 w-4 text-amber" />
          </div>
          <p className="text-2xl font-extrabold text-amber mt-2">
            {incidents.filter(i => i.severity === "Luka Ringan").length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Rawat Jalan / Pulih</p>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Luka Berat / Fatal</span>
            <ShieldAlert className="h-4 w-4 text-rose" />
          </div>
          <p className="text-2xl font-extrabold text-rose mt-2">
            {incidents.filter(i => i.severity === "Luka Berat" || i.severity === "Meninggal Dunia").length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">0 Korban Fatalitas (Meninggal)</p>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Zero Fatal Accident</span>
            <ShieldCheck className="h-4 w-4 text-accent" />
          </div>
          <p className="text-2xl font-extrabold text-accent mt-2">100%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Tercapai Sejauh Ini</p>
        </div>
      </div>

      {/* Tab: List */}
      {activeTab === "list" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama proyek, penyedia jasa, atau jenis kecelakaan..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="rounded-2xl border border-slate-200/60 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">No. Laporan / Tanggal</th>
                    <th className="py-3 px-4">Paket & Pelaksana</th>
                    <th className="py-3 px-4">Jenis Insiden</th>
                    <th className="py-3 px-4">Tingkat Keparahan</th>
                    <th className="py-3 px-4">Korban</th>
                    <th className="py-3 px-4">Ref SIPJAKI</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredIncidents.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-mono font-bold text-slate-900">{inc.id}</p>
                        <p className="text-slate-400 mt-0.5">{inc.date} {inc.time}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800 text-sm">{inc.projectName}</p>
                        <p className="text-slate-500">{inc.contractor} • Kec. {inc.district}</p>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {inc.incidentType}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={cn(
                          "rounded-full px-2.5 py-1 font-bold inline-block",
                          inc.severity === "Luka Ringan" ? "bg-amber/10 text-amber" :
                          inc.severity === "Luka Berat" ? "bg-rose/10 text-rose" : "bg-slate-100 text-slate-600"
                        )}>
                          {inc.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <p className="font-semibold">{inc.victimName}</p>
                        <p className="text-slate-400">{inc.victimRole}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {inc.sipjakiRef}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> {inc.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedIncident(inc)}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-primary hover:text-white transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" /> Kronologi
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

      {/* Tab: Create (Form Sesuai SIPJAKI) */}
      {activeTab === "create" && (
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-rose" /> Formulir Laporan Kecelakaan Kerja Konstruksi (Format SIPJAKI)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Sesuai Permen PUPR No. 10/2021 tentang SMKK dan Sistem Informasi Pembina Jasa Konstruksi
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-6">
            {/* Bagian 1: Identitas Pekerjaan */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
                1. Identitas Proyek & Lokasi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pilih Paket Pekerjaan *
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20"
                    required
                  >
                    {projectsData.map(p => (
                      <option key={p.id} value={p.id}>{p.id} - {p.name} ({p.contractor})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Wilayah Kecamatan *
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    placeholder="Contoh: Cibinong, Ciawi, dll"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Detail Titik Lokasi Kejadian *
                  </label>
                  <input
                    type="text"
                    value={formData.locationDetail}
                    onChange={(e) => setFormData({...formData, locationDetail: e.target.value})}
                    placeholder="Contoh: STA 05+100, Lantai 3 Ruang Lab, Zona Galian Selatan"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Bagian 2: Waktu & Klasifikasi */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
                2. Waktu & Jenis Insiden
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Kejadian *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Waktu / Jam Kejadian *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Kecelakaan Kerja *
                  </label>
                  <select
                    value={formData.incidentType}
                    onChange={(e) => setFormData({...formData, incidentType: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Tertimpa Material / Benda Jatuh">Tertimpa Material / Benda Jatuh</option>
                    <option value="Jatuh dari Ketinggian">Jatuh dari Ketinggian</option>
                    <option value="Terpeleset / Tersandung">Terpeleset / Tersandung</option>
                    <option value="Longsor Tebing Galian">Longsor Tebing Galian</option>
                    <option value="Tersengat Aliran Listrik">Tersengat Aliran Listrik</option>
                    <option value="Terkena Alat Berat / Kendaraan">Terkena Alat Berat / Kendaraan</option>
                    <option value="Kebakaran / Ledakan">Kebakaran / Ledakan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tingkat Keparahan *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({...formData, severity: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Luka Ringan">Luka Ringan (Rawat Jalan)</option>
                    <option value="Luka Berat">Luka Berat (Rawat Inap / Cacat Sementara)</option>
                    <option value="Meninggal Dunia">Meninggal Dunia (Fatal)</option>
                    <option value="Nir-Korban (Near Miss)">Nir-Korban (Near Miss / Nyaris Celaka)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bagian 3: Data Korban */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
                3. Identitas Korban & Cedera
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Korban</label>
                  <input
                    type="text"
                    value={formData.victimName}
                    onChange={(e) => setFormData({...formData, victimName: e.target.value})}
                    placeholder="Nama Lengkap Pekerja"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan / Profesi</label>
                  <input
                    type="text"
                    value={formData.victimRole}
                    onChange={(e) => setFormData({...formData, victimRole: e.target.value})}
                    placeholder="Contoh: Pekerja Pembesian, Tukang Cat, Operator"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bagian Tubuh Terluka</label>
                  <input
                    type="text"
                    value={formData.injuryDetail}
                    onChange={(e) => setFormData({...formData, injuryDetail: e.target.value})}
                    placeholder="Contoh: Memar lengan kanan, Fraktur jari, dll"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 4: Kronologi & Tindakan */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
                4. Kronologi Kejadian & Rencana Pencegahan
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Uraian Kronologi Singkat Kejadian *
                  </label>
                  <textarea
                    rows={3}
                    value={formData.chronology}
                    onChange={(e) => setFormData({...formData, chronology: e.target.value})}
                    placeholder="Jelaskan secara runtut bagaimana kecelakaan tersebut terjadi..."
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tindakan Pengendalian & Perbaikan (Corrective Action) *
                  </label>
                  <textarea
                    rows={2}
                    value={formData.correctiveAction}
                    onChange={(e) => setFormData({...formData, correctiveAction: e.target.value})}
                    placeholder="Langkah pertolongan pertama yang telah dilakukan dan pencegahan agar tidak berulang..."
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-all shadow-sm"
              >
                <Send className="h-4 w-4" /> Simpan & Sinkronkan SIPJAKI
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Detail Kronologi */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {selectedIncident.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedIncident.projectName}</h3>
                <p className="text-xs text-slate-400">{selectedIncident.contractor} • {selectedIncident.date} ({selectedIncident.time} WIB)</p>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl">
              <div>
                <p className="font-bold text-slate-700">Jenis Insiden & Keparahan:</p>
                <p className="text-slate-600">{selectedIncident.incidentType} — <span className="font-bold text-rose">{selectedIncident.severity}</span></p>
              </div>
              <div>
                <p className="font-bold text-slate-700">Korban & Cedera:</p>
                <p className="text-slate-600">{selectedIncident.victimName} ({selectedIncident.victimRole}): {selectedIncident.injuryDetail}</p>
              </div>
              <div>
                <p className="font-bold text-slate-700">Kronologi Kejadian:</p>
                <p className="text-slate-600 leading-relaxed">{selectedIncident.chronology}</p>
              </div>
              <div>
                <p className="font-bold text-slate-700">Tindakan Perbaikan / Penanganan:</p>
                <p className="text-slate-600 leading-relaxed">{selectedIncident.correctiveAction}</p>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-slate-500">Nomor Registrasi SIPJAKI:</span>
                <span className="font-mono font-bold text-slate-900">{selectedIncident.sipjakiRef}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedIncident(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

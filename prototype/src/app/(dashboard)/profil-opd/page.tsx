"use client";
import { useState, useEffect } from "react";
import { 
  Landmark, UserCheck, ShieldCheck, DollarSign, FileText, CheckCircle2, 
  RefreshCw, Building2, Phone, Mail, Sparkles, Send, Download, Check,
  Plus, Layers, Eye, FileSpreadsheet, Database as DbIcon, Users,
  Activity, Briefcase, Award, TrendingUp, FolderCheck, Edit3, Save,
  ExternalLink, AlertCircle, FileCheck, CheckCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { mockMasterOpdList, MasterOpdRecord } from "@/data/opd-master";
import { 
  fetchOpdList, createOpdItem,
  fetchOpdSipjakiProfile, saveOpdSipjakiProfile, fetchOpdSipjakiAutoRollup,
  OpdSipjakiProfile, DEFAULT_OPD_SIPJAKI_PROFILE, DataSourceStatus
} from "@/lib/services/opd-service";
import { 
  StatusBadge, DataTableView, FilterBar, 
  FilterBarValues, ModalForm, ColumnDef 
} from "@/components/common";
import BatchImportModal, { BatchColumnDef } from "@/components/common/batch-import-modal";
import { ExportColumn } from "@/lib/export-utils";

type TabKey = "profil-sdm" | "data-pendukung" | "pelaksanaan-pengawasan" | "master-opd";

const masterOpdExportColumns: ExportColumn[] = [
  { key: "kodeOpd", label: "Kode Rekening OPD", sipjakiLabel: "kode_opd" },
  { key: "namaOpd", label: "Nama Dinas / Lembaga", sipjakiLabel: "nama_opd" },
  { key: "kabupatenKota", label: "Kabupaten/Kota", sipjakiLabel: "kabupaten_kota" },
  { key: "provinsi", label: "Provinsi", sipjakiLabel: "provinsi" },
  { key: "kepalaDinas", label: "Kepala Dinas / Pimpinan", sipjakiLabel: "kepala_dinas" },
  { key: "tingkat", label: "Tingkat Pemerintahan", sipjakiLabel: "tingkat" },
  { key: "jumlahTimPembina", label: "Jumlah Personil Tim", sipjakiLabel: "jumlah_tim_pembina" },
  { key: "statusSinkronisasi", label: "Status Sinkronisasi", sipjakiLabel: "status" }
];

const opdBatchColumns: BatchColumnDef[] = [
  { key: "kodeOpd", label: "Kode Rekening OPD", required: true, example: "1.03.01.01.05" },
  { key: "namaOpd", label: "Nama Dinas / Lembaga", required: true, example: "Dinas Pendidikan Kabupaten Bogor" },
  { key: "kabupatenKota", label: "Kabupaten/Kota", required: true, example: "Kabupaten Bogor" },
  { key: "provinsi", label: "Provinsi", required: true, example: "Jawa Barat" },
  { key: "kepalaDinas", label: "Kepala Dinas / Pimpinan", required: true, example: "Drs. H. Bambang Setiawan, M.M." },
  { key: "tingkat", label: "Tingkat Pemerintahan", required: true, example: "Kabupaten" },
  { key: "jumlahTimPembina", label: "Jumlah Personil Tim", required: true, example: "8" }
];

const sampleBatchOpd = [
  { kodeOpd: "1.02.01.01.01", namaOpd: "Dinas Kesehatan Kabupaten Bogor", kabupatenKota: "Kabupaten Bogor", provinsi: "Jawa Barat", kepalaDinas: "dr. Hj. Mike Kaltarina, MARS", tingkat: "Kabupaten", jumlahTimPembina: 10 },
  { kodeOpd: "1.05.01.01.01", namaOpd: "Dinas Pemuda dan Olahraga Kabupaten Bogor", kabupatenKota: "Kabupaten Bogor", provinsi: "Jawa Barat", kepalaDinas: "Asnan, AP", tingkat: "Kabupaten", jumlahTimPembina: 6 }
];

export default function ProfilOpdPage() {
  const [profile, setProfile] = useState<OpdSipjakiProfile>(DEFAULT_OPD_SIPJAKI_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("profil-sdm");
  const [dataStatus, setDataStatus] = useState<DataSourceStatus>({
    source: "fallback",
    message: "Memuat profil SIPJAKI..."
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State untuk Edit Mode
  const [formData, setFormData] = useState<OpdSipjakiProfile>(DEFAULT_OPD_SIPJAKI_PROFILE);

  // Master OPD State
  const [masterList, setMasterList] = useState<MasterOpdRecord[]>(mockMasterOpdList);
  const [isLiveSupabase, setIsLiveSupabase] = useState(false);
  const [showBatchImportModal, setShowBatchImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter Master OPD
  const [filterValues, setFilterValues] = useState<FilterBarValues>({
    search: "",
    province: "",
    city: "",
    year: "",
    status: ""
  });

  // New OPD Form State
  const [formNama, setFormNama] = useState("");
  const [formKode, setFormKode] = useState("");
  const [formTingkat, setFormTingkat] = useState<"Provinsi" | "Kabupaten/Kota">("Kabupaten/Kota");
  const [formProvinsi, setFormProvinsi] = useState("Jawa Barat");
  const [formKabKota, setFormKabKota] = useState("Kab. Bogor");
  const [formAlamat, setFormAlamat] = useState("");
  const [formTelepon, setFormTelepon] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formKepalaDinas, setFormKepalaDinas] = useState("");
  const [formJumlahTim, setFormJumlahTim] = useState("10");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadProfile = async () => {
    try {
      const res = await fetchOpdSipjakiProfile("OPD-BOGOR-DPU");
      setProfile(res.data);
      setFormData(res.data);
      setDataStatus(res.status);
    } catch (err) {
      console.warn("Gagal memuat profil OPD SIPJAKI:", err);
    }
  };

  useEffect(() => {
    loadProfile();

    async function loadOpds() {
      try {
        const res = await fetchOpdList();
        if (res.status.source === "supabase") {
          setIsLiveSupabase(true);
        }
        if (res.data.length > 0) {
          const mapped: MasterOpdRecord[] = res.data.map(o => ({
            id: o.id,
            kodeOpd: o.kode,
            namaOpd: o.nama,
            tingkat: "Kabupaten/Kota",
            provinsi: "Jawa Barat",
            kabupatenKota: "Kabupaten Bogor",
            alamat: o.alamat,
            telepon: o.telepon,
            email: `${o.kode.toLowerCase()}@bogorkab.go.id`,
            kepalaDinas: o.kepalaOpd,
            jumlahTimPembina: o.userCount || 5,
            statusSinkronisasi: o.isActive ? "Terhubung" : "Menunggu Verifikasi",
            tanggalRegistrasi: "2026-01-15"
          }));
          setMasterList(prev => {
            const existingCodes = new Set(mapped.map(m => m.kodeOpd));
            const remaining = prev.filter(p => !existingCodes.has(p.kodeOpd));
            return [...mapped, ...remaining];
          });
        }
      } catch (err) {
        console.warn("Gagal load OPD dari Supabase:", err);
      }
    }
    loadOpds();
  }, []);

  const handleSyncRollup = async () => {
    setSyncLoading(true);
    try {
      const rollup = await fetchOpdSipjakiAutoRollup();
      const updated: OpdSipjakiProfile = {
        ...formData,
        realisasiTertibUsaha: rollup.tertibUsahaTotal,
        realisasiTertibUsahaKepu: rollup.tertibUsahaKepu,
        realisasiTertibPenyelenggaraan: rollup.tertibPenyelenggaraanTotal,
        realisasiTertibPenyelenggaraanKepu: rollup.tertibPenyelenggaraanKepu,
        realisasiTertibPemanfaatan: rollup.tertibPemanfaatanTotal,
        realisasiTertibPemanfaatanKepu: rollup.tertibPemanfaatanKepu,
        jmlBadanUsaha: rollup.bujkCount > 0 ? rollup.bujkCount : formData.jmlBadanUsaha,
        jmlTkkWilayah: rollup.tkkCount > 0 ? rollup.tkkCount : formData.jmlTkkWilayah
      };
      setProfile(updated);
      setFormData(updated);
      showToast("Data realisasi pengawasan SIMAK 1, 2, 3 berhasil disinkronkan secara langsung dari database!");
    } catch (err) {
      console.error(err);
      showToast("Gagal menyinkronkan data pengawasan.");
    } finally {
      setSyncLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await saveOpdSipjakiProfile(formData);
      if (res.success && res.data) {
        setProfile(res.data);
      } else {
        setProfile(formData);
      }
      setIsEditing(false);
      showToast("Profil OPD Standar SIPJAKI berhasil disimpan!");
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan saat menyimpan profil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  // Master OPD List Filter
  const filteredMasterOpd = masterList.filter((item) => {
    const matchSearch = filterValues.search === "" ||
      item.namaOpd.toLowerCase().includes(filterValues.search.toLowerCase()) ||
      item.kodeOpd.toLowerCase().includes(filterValues.search.toLowerCase()) ||
      item.kabupatenKota.toLowerCase().includes(filterValues.search.toLowerCase());

    const matchProvince = filterValues.province === "" || item.provinsi === filterValues.province;
    const matchCity = filterValues.city === "" || 
      item.kabupatenKota.toLowerCase().includes(filterValues.city.toLowerCase());
    const matchStatus = filterValues.status === "" || item.statusSinkronisasi === filterValues.status;

    return matchSearch && matchProvince && matchCity && matchStatus;
  });

  const totalOpd = masterList.length;
  const totalProv = masterList.filter((m) => m.tingkat === "Provinsi").length;
  const totalKabKota = masterList.filter((m) => m.tingkat === "Kabupaten/Kota").length;

  const handleAddOpd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama || !formKode) {
      alert("Mohon isi Nama OPD dan Kode OPD!");
      return;
    }

    setIsSubmitting(true);
    try {
      await createOpdItem({
        kode: formKode,
        nama: formNama,
        kepalaOpd: formKepalaDinas,
        alamat: formAlamat,
        telepon: formTelepon,
        isActive: true
      });

      const newOpd: MasterOpdRecord = {
        id: `OPD-${Date.now().toString().slice(-4)}`,
        kodeOpd: formKode,
        namaOpd: formNama,
        tingkat: formTingkat,
        provinsi: formProvinsi,
        kabupatenKota: formKabKota,
        alamat: formAlamat || "-",
        telepon: formTelepon || "-",
        email: formEmail || "-",
        kepalaDinas: formKepalaDinas || "-",
        jumlahTimPembina: parseInt(formJumlahTim) || 5,
        statusSinkronisasi: "Terhubung",
        tanggalRegistrasi: new Date().toISOString().split("T")[0]
      };

      setMasterList([newOpd, ...masterList]);
      setShowAddModal(false);
      showToast("Satuan Kerja baru berhasil ditambahkan!");
      setFormNama("");
      setFormKode("");
      setFormAlamat("");
      setFormTelepon("");
      setFormEmail("");
      setFormKepalaDinas("");
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan OPD.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columnsMasterOpd: ColumnDef<MasterOpdRecord>[] = [
    {
      key: "kodeOpd",
      label: "KODE OPD",
      sortable: true,
      render: (row) => (
        <span style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: 800, color: "#1E3A8A" }}>
          {row.kodeOpd}
        </span>
      )
    },
    {
      key: "namaOpd",
      label: "NAMA DINAS / LEMBAGA",
      sortable: true,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C" }}>
            {row.namaOpd}
          </span>
          <span style={{ fontSize: "11px", color: "#64748B" }}>
            {row.alamat}
          </span>
        </div>
      )
    },
    {
      key: "kabupatenKota",
      label: "WILAYAH / KAB-KOTA",
      sortable: true,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C" }}>
            {row.kabupatenKota}
          </span>
          <span style={{ fontSize: "11px", color: "#64748B" }}>
            {row.provinsi}
          </span>
        </div>
      )
    },
    {
      key: "kepalaDinas",
      label: "KEPALA DINAS",
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>
          {row.kepalaDinas}
        </span>
      )
    },
    {
      key: "jumlahTimPembina",
      label: "TIM PEMBINA",
      align: "center",
      sortable: true,
      render: (row) => (
        <span
          style={{
            fontSize: "11px",
            fontWeight: 800,
            padding: "3px 8px",
            borderRadius: "6px",
            backgroundColor: "#F1F5F9",
            color: "#0F2E5C"
          }}
        >
          {row.jumlahTimPembina} Personil
        </span>
      )
    },
    {
      key: "statusSinkronisasi",
      label: "STATUS SIPJAKI",
      align: "center",
      sortable: true,
      render: (row) => <StatusBadge status={row.statusSinkronisasi} size="sm" showDot />
    }
  ];

  // Perhitungan Ringkasan SDM & Rasio
  const totalSdm = profile.jumlahPns + profile.jumlahP3k + profile.jumlahNonAsn;
  const persenPelatihan = Math.min(100, Math.round((profile.jmlTkkTerlatih / (profile.targetRpjmdPelatihan || 1)) * 100));
  const persenSertifikasi = Math.min(100, Math.round((profile.jmlTkkTersertifikasi / (profile.targetRpjmdSertifikasi || 1)) * 100));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: "#0F2E5C",
            color: "#FFFFFF",
            padding: "12px 20px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 700,
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}
        >
          <CheckCircle2 style={{ width: "18px", height: "18px", color: "#10B981" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Profile Hero */}
      <div
        style={{
          borderRadius: "20px",
          background: "linear-gradient(135deg, #0F2E5C 0%, #1E3A8A 55%, #1D4ED8 100%)",
          color: "#FFFFFF",
          padding: "26px 30px",
          boxShadow: "0 10px 30px -5px rgba(15, 46, 92, 0.3)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#FACC15",
                    backgroundColor: "rgba(250, 204, 21, 0.15)",
                    border: "1px solid rgba(250, 204, 21, 0.3)",
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px"
                  }}
                >
                  <Landmark style={{ width: "12px", height: "12px" }} /> {profile.tipeOpd}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#A7F3D0",
                    backgroundColor: "rgba(16, 185, 129, 0.2)",
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px"
                  }}
                >
                  <ShieldCheck style={{ width: "12px", height: "12px" }} /> SIPJAKI Nasional: Terhubung (Active Sync)
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#E2E8F0",
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    padding: "3px 10px",
                    borderRadius: "9999px"
                  }}
                >
                  TA {profile.tahunAnggaran}
                </span>
              </div>

              <h1 style={{ fontSize: "26px", fontWeight: 900, margin: 0, letterSpacing: "-0.5px", color: "#FFFFFF" }}>
                {profile.namaBidang} - {profile.tipeOpd}
              </h1>
              <p style={{ fontSize: "14px", color: "#CBD5E1", margin: "6px 0 0 0", maxWidth: "800px" }}>
                {profile.kategori} Bogor • {profile.levelSuburusan} • Kelengkapan SOTK, Regulasi, SDM Aparatur, & Rekapitulasi Pengawasan Jasa Konstruksi.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={handleSyncRollup}
                disabled={syncLoading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  padding: "10px 16px",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  cursor: syncLoading ? "wait" : "pointer"
                }}
              >
                <RefreshCw style={{ width: "14px", height: "14px", animation: syncLoading ? "spin 1s linear infinite" : "none" }} />
                <span>{syncLoading ? "Menghitung Realisasi..." : "Hitung Realisasi Pengawasan"}</span>
              </button>

              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    borderRadius: "12px",
                    backgroundColor: "#F59E0B",
                    border: "none",
                    padding: "10px 18px",
                    fontSize: "12px",
                    fontWeight: 900,
                    color: "#FFFFFF",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(245, 158, 11, 0.4)"
                  }}
                >
                  <Edit3 style={{ width: "14px", height: "14px" }} />
                  <span>Ubah Data OPD</span>
                </button>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    style={{
                      borderRadius: "12px",
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      border: "none",
                      padding: "10px 14px",
                      fontSize: "12px",
                      fontWeight: 800,
                      color: "#FFFFFF",
                      cursor: "pointer"
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSubmitting}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      borderRadius: "12px",
                      backgroundColor: "#10B981",
                      border: "none",
                      padding: "10px 18px",
                      fontSize: "12px",
                      fontWeight: 900,
                      color: "#FFFFFF",
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)"
                    }}
                  >
                    <Save style={{ width: "14px", height: "14px" }} />
                    <span>{isSubmitting ? "Menyimpan..." : "Simpan Profil"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Navigation Tabs Standar SIPJAKI */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderBottom: "2px solid #E2E8F0",
          paddingBottom: "2px",
          overflowX: "auto"
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("profil-sdm")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 18px",
            fontSize: "13px",
            fontWeight: activeTab === "profil-sdm" ? 900 : 700,
            color: activeTab === "profil-sdm" ? "#0F2E5C" : "#64748B",
            borderBottom: activeTab === "profil-sdm" ? "3px solid #0F2E5C" : "3px solid transparent",
            backgroundColor: activeTab === "profil-sdm" ? "#F8FAFC" : "transparent",
            borderRadius: "8px 8px 0 0",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap"
          }}
        >
          <Building2 style={{ width: "16px", height: "16px", color: activeTab === "profil-sdm" ? "#0F2E5C" : "#94A3B8" }} />
          <span>1. Profil OPD & SDM</span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              backgroundColor: activeTab === "profil-sdm" ? "#0F2E5C" : "#E2E8F0",
              color: activeTab === "profil-sdm" ? "#FFFFFF" : "#64748B",
              padding: "1px 7px",
              borderRadius: "9999px"
            }}
          >
            {totalSdm} SDM
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("data-pendukung")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 18px",
            fontSize: "13px",
            fontWeight: activeTab === "data-pendukung" ? 900 : 700,
            color: activeTab === "data-pendukung" ? "#0F2E5C" : "#64748B",
            borderBottom: activeTab === "data-pendukung" ? "3px solid #0F2E5C" : "3px solid transparent",
            backgroundColor: activeTab === "data-pendukung" ? "#F8FAFC" : "transparent",
            borderRadius: "8px 8px 0 0",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap"
          }}
        >
          <FileCheck style={{ width: "16px", height: "16px", color: activeTab === "data-pendukung" ? "#0F2E5C" : "#94A3B8" }} />
          <span>2. Data Pendukung & Anggaran</span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              backgroundColor: activeTab === "data-pendukung" ? "#059669" : "#E2E8F0",
              color: activeTab === "data-pendukung" ? "#FFFFFF" : "#64748B",
              padding: "1px 7px",
              borderRadius: "9999px"
            }}
          >
            PIC & Regulasi
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pelaksanaan-pengawasan")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 18px",
            fontSize: "13px",
            fontWeight: activeTab === "pelaksanaan-pengawasan" ? 900 : 700,
            color: activeTab === "pelaksanaan-pengawasan" ? "#0F2E5C" : "#64748B",
            borderBottom: activeTab === "pelaksanaan-pengawasan" ? "3px solid #0F2E5C" : "3px solid transparent",
            backgroundColor: activeTab === "pelaksanaan-pengawasan" ? "#F8FAFC" : "transparent",
            borderRadius: "8px 8px 0 0",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap"
          }}
        >
          <Activity style={{ width: "16px", height: "16px", color: activeTab === "pelaksanaan-pengawasan" ? "#0F2E5C" : "#94A3B8" }} />
          <span>3. Pelaksanaan & Pengawasan</span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              backgroundColor: activeTab === "pelaksanaan-pengawasan" ? "#2563EB" : "#E2E8F0",
              color: activeTab === "pelaksanaan-pengawasan" ? "#FFFFFF" : "#64748B",
              padding: "1px 7px",
              borderRadius: "9999px"
            }}
          >
            Live SIMAK
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("master-opd")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 18px",
            fontSize: "13px",
            fontWeight: activeTab === "master-opd" ? 900 : 700,
            color: activeTab === "master-opd" ? "#0F2E5C" : "#64748B",
            borderBottom: activeTab === "master-opd" ? "3px solid #0F2E5C" : "3px solid transparent",
            backgroundColor: activeTab === "master-opd" ? "#F8FAFC" : "transparent",
            borderRadius: "8px 8px 0 0",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap"
          }}
        >
          <Layers style={{ width: "16px", height: "16px", color: activeTab === "master-opd" ? "#0F2E5C" : "#94A3B8" }} />
          <span>Master Satuan Kerja</span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              backgroundColor: "#E2E8F0",
              color: "#64748B",
              padding: "1px 7px",
              borderRadius: "9999px"
            }}
          >
            {masterList.length}
          </span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: PROFIL OPD & SDM                                             */}
      {/* ==================================================================== */}
      {activeTab === "profil-sdm" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Ringkasan SDM 5 Kartu */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px"
            }}
          >
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                padding: "18px 20px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Jumlah PNS</span>
                <span style={{ backgroundColor: "#EBF2FA", color: "#0F2E5C", padding: "4px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: 800 }}>PNS</span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#0F2E5C" }}>{profile.jumlahPns} <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748B" }}>Orang</span></div>
              <p style={{ fontSize: "11px", color: "#94A3B8", margin: "4px 0 0 0" }}>Pegawai Negeri Sipil Unit Jakon</p>
            </div>

            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                padding: "18px 20px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Pejabat Manajerial</span>
                <span style={{ backgroundColor: "#FEF3C7", color: "#D97706", padding: "4px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: 800 }}>Struktural</span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#D97706" }}>{profile.pejabatManajerial} <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748B" }}>Orang</span></div>
              <p style={{ fontSize: "11px", color: "#94A3B8", margin: "4px 0 0 0" }}>Eselon II, III, & IV / Sub-Koord</p>
            </div>

            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                padding: "18px 20px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Pejabat Fungsional</span>
                <span style={{ backgroundColor: "#ECFDF5", color: "#059669", padding: "4px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: 800 }}>Jafung</span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#059669" }}>{profile.pejabatFungsional} <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748B" }}>Orang</span></div>
              <p style={{ fontSize: "11px", color: "#94A3B8", margin: "4px 0 0 0" }}>Fungsional Pembina Jakon / PBJ</p>
            </div>

            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                padding: "18px 20px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Jumlah PPPK (P3K)</span>
                <span style={{ backgroundColor: "#F3E8FF", color: "#7C3AED", padding: "4px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: 800 }}>PPPK</span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#7C3AED" }}>{profile.jumlahP3k} <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748B" }}>Orang</span></div>
              <p style={{ fontSize: "11px", color: "#94A3B8", margin: "4px 0 0 0" }}>Aparatur Perjanjian Kerja</p>
            </div>

            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                padding: "18px 20px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Jumlah Non ASN</span>
                <span style={{ backgroundColor: "#F1F5F9", color: "#475569", padding: "4px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: 800 }}>Non-ASN</span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#475569" }}>{profile.jumlahNonAsn} <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748B" }}>Orang</span></div>
              <p style={{ fontSize: "11px", color: "#94A3B8", margin: "4px 0 0 0" }}>Tenaga Teknis / Pendukung</p>
            </div>
          </div>

          {/* Form Isian Profil & SDM */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "18px",
              padding: "24px 28px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <Building2 style={{ width: "20px", height: "20px", color: "#0F2E5C" }} />
              <h2 style={{ fontSize: "16px", fontWeight: 900, color: "#0F2E5C", margin: 0 }}>
                Data Kelembagaan & Wilayah Suburusan Jasa Konstruksi
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "20px"
              }}
            >
              {/* Kolom 1 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
                    Tipe OPD
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.tipeOpd}
                      onChange={(e) => setFormData({ ...formData, tipeOpd: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                    />
                  ) : (
                    <div style={{ padding: "10px 14px", backgroundColor: "#F8FAFC", borderRadius: "10px", fontSize: "13px", fontWeight: 700, color: "#0F2E5C", border: "1px solid #E2E8F0" }}>
                      {profile.tipeOpd}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
                    Kategori Pemerintahan
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.kategori}
                      onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                    >
                      <option value="Pemerintah Kabupaten">Pemerintah Kabupaten</option>
                      <option value="Pemerintah Kota">Pemerintah Kota</option>
                      <option value="Pemerintah Provinsi">Pemerintah Provinsi</option>
                    </select>
                  ) : (
                    <div style={{ padding: "10px 14px", backgroundColor: "#F8FAFC", borderRadius: "10px", fontSize: "13px", fontWeight: 700, color: "#0F2E5C", border: "1px solid #E2E8F0" }}>
                      {profile.kategori}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
                    Nama Bidang
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.namaBidang}
                      onChange={(e) => setFormData({ ...formData, namaBidang: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                    />
                  ) : (
                    <div style={{ padding: "10px 14px", backgroundColor: "#F8FAFC", borderRadius: "10px", fontSize: "13px", fontWeight: 700, color: "#0F2E5C", border: "1px solid #E2E8F0" }}>
                      {profile.namaBidang}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
                    Nama Seksi / Kelompok Substansi
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.namaSeksi}
                      onChange={(e) => setFormData({ ...formData, namaSeksi: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                    />
                  ) : (
                    <div style={{ padding: "10px 14px", backgroundColor: "#F8FAFC", borderRadius: "10px", fontSize: "13px", fontWeight: 700, color: "#0F2E5C", border: "1px solid #E2E8F0" }}>
                      {profile.namaSeksi}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
                    Level Suburusan Jasa Konstruksi
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.levelSuburusan}
                      onChange={(e) => setFormData({ ...formData, levelSuburusan: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                    >
                      <option value="Bidang Mandiri (Eselon III)">Bidang Mandiri (Eselon III)</option>
                      <option value="Seksi di bawah Bidang Teknis (Eselon IV)">Seksi di bawah Bidang Teknis (Eselon IV)</option>
                      <option value="Kelompok Kerja Fungsional">Kelompok Kerja Fungsional</option>
                      <option value="Belum Memiliki Unit Khusus">Belum Memiliki Unit Khusus</option>
                    </select>
                  ) : (
                    <div style={{ padding: "10px 14px", backgroundColor: "#ECFDF5", borderRadius: "10px", fontSize: "13px", fontWeight: 800, color: "#059669", border: "1px solid #A7F3D0" }}>
                      ✓ {profile.levelSuburusan}
                    </div>
                  )}
                </div>
              </div>

              {/* Kolom 2 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
                    Alamat Kantor
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={formData.alamatKantor}
                      onChange={(e) => setFormData({ ...formData, alamatKantor: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px", resize: "vertical" }}
                    />
                  ) : (
                    <div style={{ padding: "10px 14px", backgroundColor: "#F8FAFC", borderRadius: "10px", fontSize: "13px", color: "#334155", border: "1px solid #E2E8F0" }}>
                      {profile.alamatKantor}
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
                      Nomor Telepon
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.nomorTelepon}
                        onChange={(e) => setFormData({ ...formData, nomorTelepon: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                      />
                    ) : (
                      <div style={{ padding: "10px 14px", backgroundColor: "#F8FAFC", borderRadius: "10px", fontSize: "13px", color: "#334155", border: "1px solid #E2E8F0" }}>
                        {profile.nomorTelepon}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
                      Email Kantor
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.emailKantor}
                        onChange={(e) => setFormData({ ...formData, emailKantor: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                      />
                    ) : (
                      <div style={{ padding: "10px 14px", backgroundColor: "#F8FAFC", borderRadius: "10px", fontSize: "13px", color: "#334155", border: "1px solid #E2E8F0" }}>
                        {profile.emailKantor}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
                    Website Pemerintahan
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.websitePemerintahan}
                      onChange={(e) => setFormData({ ...formData, websitePemerintahan: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                    />
                  ) : (
                    <a
                      href={profile.websitePemerintahan}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: "10px 14px",
                        backgroundColor: "#F8FAFC",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#2563EB",
                        border: "1px solid #E2E8F0",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        textDecoration: "none"
                      }}
                    >
                      <ExternalLink style={{ width: "14px", height: "14px" }} />
                      <span>{profile.websitePemerintahan}</span>
                    </a>
                  )}
                </div>

                {isEditing && (
                  <div style={{ padding: "16px", backgroundColor: "#FFFBEB", borderRadius: "12px", border: "1px solid #FCD34D" }}>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#92400E", marginBottom: "10px" }}>
                      Ubah Rincian Jumlah SDM Jakon:
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
                      <div>
                        <span style={{ fontSize: "11px", color: "#78350F" }}>PNS</span>
                        <input
                          type="number"
                          value={formData.jumlahPns}
                          onChange={(e) => setFormData({ ...formData, jumlahPns: parseInt(e.target.value) || 0 })}
                          style={{ width: "100%", padding: "6px", fontSize: "12px", borderRadius: "6px", border: "1px solid #FBBF24" }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: "11px", color: "#78350F" }}>Manajerial</span>
                        <input
                          type="number"
                          value={formData.pejabatManajerial}
                          onChange={(e) => setFormData({ ...formData, pejabatManajerial: parseInt(e.target.value) || 0 })}
                          style={{ width: "100%", padding: "6px", fontSize: "12px", borderRadius: "6px", border: "1px solid #FBBF24" }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: "11px", color: "#78350F" }}>Fungsional</span>
                        <input
                          type="number"
                          value={formData.pejabatFungsional}
                          onChange={(e) => setFormData({ ...formData, pejabatFungsional: parseInt(e.target.value) || 0 })}
                          style={{ width: "100%", padding: "6px", fontSize: "12px", borderRadius: "6px", border: "1px solid #FBBF24" }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: "11px", color: "#78350F" }}>P3K</span>
                        <input
                          type="number"
                          value={formData.jumlahP3k}
                          onChange={(e) => setFormData({ ...formData, jumlahP3k: parseInt(e.target.value) || 0 })}
                          style={{ width: "100%", padding: "6px", fontSize: "12px", borderRadius: "6px", border: "1px solid #FBBF24" }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: "11px", color: "#78350F" }}>Non-ASN</span>
                        <input
                          type="number"
                          value={formData.jumlahNonAsn}
                          onChange={(e) => setFormData({ ...formData, jumlahNonAsn: parseInt(e.target.value) || 0 })}
                          style={{ width: "100%", padding: "6px", fontSize: "12px", borderRadius: "6px", border: "1px solid #FBBF24" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: DATA PENDUKUNG                                               */}
      {/* ==================================================================== */}
      {activeTab === "data-pendukung" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Grid 2 Kolom: PIC & Penyelenggaraan SIPJAKI */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px" }}>
            {/* PIC */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "18px",
                padding: "24px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ padding: "8px", borderRadius: "10px", backgroundColor: "#EBF2FA", color: "#0F2E5C" }}>
                  <UserCheck style={{ width: "20px", height: "20px" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 900, color: "#0F2E5C", margin: 0 }}>
                    Penanggung Jawab (PIC) Jasa Konstruksi
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>Pejabat penanggung jawab urusan jasa konstruksi daerah</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B" }}>Nama Lengkap & Gelar PIC:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.namaPic}
                      onChange={(e) => setFormData({ ...formData, namaPic: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", marginTop: "4px" }}
                    />
                  ) : (
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#0F2E5C", marginTop: "2px" }}>{profile.namaPic}</div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B" }}>Jabatan Definitif:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.jabatanPic}
                        onChange={(e) => setFormData({ ...formData, jabatanPic: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", marginTop: "4px" }}
                      />
                    ) : (
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#334155", marginTop: "2px" }}>{profile.jabatanPic}</div>
                    )}
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B" }}>Eselon:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.eselonPic}
                        onChange={(e) => setFormData({ ...formData, eselonPic: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", marginTop: "4px" }}
                      />
                    ) : (
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C", marginTop: "2px" }}>
                        <span style={{ backgroundColor: "#F1F5F9", padding: "2px 8px", borderRadius: "6px" }}>{profile.eselonPic}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B" }}>Nomor Handphone (WhatsApp):</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.noHpPic}
                        onChange={(e) => setFormData({ ...formData, noHpPic: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", marginTop: "4px" }}
                      />
                    ) : (
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#059669", marginTop: "2px" }}>{profile.noHpPic}</div>
                    )}
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B" }}>Email PIC:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.emailPic}
                        onChange={(e) => setFormData({ ...formData, emailPic: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", marginTop: "4px" }}
                      />
                    ) : (
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#2563EB", marginTop: "2px" }}>{profile.emailPic}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Penyelenggaraan SIPJAKI */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "18px",
                padding: "24px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ padding: "8px", borderRadius: "10px", backgroundColor: "#ECFDF5", color: "#059669" }}>
                  <ShieldCheck style={{ width: "20px", height: "20px" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 900, color: "#0F2E5C", margin: 0 }}>
                    Penyelenggaraan SIPJAKI
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>Akun resmi administrator aplikasi SIPJAKI Kementerian PUPR</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B" }}>Nama SK Penetapan Admin:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.skAdminSipjaki}
                      onChange={(e) => setFormData({ ...formData, skAdminSipjaki: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", marginTop: "4px" }}
                    />
                  ) : (
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#0F2E5C", marginTop: "2px" }}>{profile.skAdminSipjaki}</div>
                  )}
                </div>

                <div>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B" }}>Nomor SK Admin SIPJAKI:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.noSkAdmin}
                      onChange={(e) => setFormData({ ...formData, noSkAdmin: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", marginTop: "4px" }}
                    />
                  ) : (
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#334155", marginTop: "2px", fontFamily: "monospace" }}>
                      {profile.noSkAdmin}
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B" }}>Username / Email Admin:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.usernameAdmin}
                        onChange={(e) => setFormData({ ...formData, usernameAdmin: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", marginTop: "4px" }}
                      />
                    ) : (
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C", marginTop: "2px" }}>{profile.usernameAdmin}</div>
                    )}
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B" }}>No HP Admin:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.noHpAdmin}
                        onChange={(e) => setFormData({ ...formData, noHpAdmin: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", marginTop: "4px" }}
                      />
                    ) : (
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#059669", marginTop: "2px" }}>{profile.noHpAdmin}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dokumen & Regulasi Daerah + Unduh Dokumen */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "18px",
              padding: "24px 28px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ padding: "8px", borderRadius: "10px", backgroundColor: "#FEF3C7", color: "#D97706" }}>
                  <FileText style={{ width: "20px", height: "20px" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#0F2E5C", margin: 0 }}>
                    Dokumen Regulasi & Berkas Kelembagaan
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>Landasan hukum pelaksanaan suburusan jasa konstruksi di Kabupaten Bogor</p>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "18px"
              }}
            >
              <div style={{ padding: "16px", backgroundColor: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B" }}>1. PERATURAN TERKAIT SOTK</span>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      placeholder="Nama Peraturan SOTK"
                      value={formData.peraturanSotk}
                      onChange={(e) => setFormData({ ...formData, peraturanSotk: e.target.value })}
                      style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12px", marginTop: "4px" }}
                    />
                    <input
                      type="text"
                      placeholder="Nomor Peraturan"
                      value={formData.noPeraturanSotk}
                      onChange={(e) => setFormData({ ...formData, noPeraturanSotk: e.target.value })}
                      style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12px", marginTop: "4px" }}
                    />
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C", marginTop: "4px" }}>{profile.peraturanSotk}</div>
                    <div style={{ fontSize: "12px", color: "#475569", marginTop: "2px", fontFamily: "monospace" }}>{profile.noPeraturanSotk}</div>
                  </>
                )}
                <div style={{ marginTop: "12px" }}>
                  <a
                    href={profile.dokumenBaganSotkUrl || "#"}
                    style={{ fontSize: "11px", fontWeight: 800, color: "#2563EB", display: "inline-flex", alignItems: "center", gap: "4px", textDecoration: "none" }}
                  >
                    <Download style={{ width: "12px", height: "12px" }} /> Unduh Bagan SOTK (PDF)
                  </a>
                </div>
              </div>

              <div style={{ padding: "16px", backgroundColor: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B" }}>2. PERDA JASA KONSTRUKSI</span>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      placeholder="Nama Perda Jakon"
                      value={formData.perdaJasaKonstruksi}
                      onChange={(e) => setFormData({ ...formData, perdaJasaKonstruksi: e.target.value })}
                      style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12px", marginTop: "4px" }}
                    />
                    <input
                      type="text"
                      placeholder="Nomor Perda"
                      value={formData.noPerdaJakon}
                      onChange={(e) => setFormData({ ...formData, noPerdaJakon: e.target.value })}
                      style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12px", marginTop: "4px" }}
                    />
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C", marginTop: "4px" }}>{profile.perdaJasaKonstruksi}</div>
                    <div style={{ fontSize: "12px", color: "#475569", marginTop: "2px", fontFamily: "monospace" }}>{profile.noPerdaJakon}</div>
                  </>
                )}
                <div style={{ marginTop: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669", backgroundColor: "#ECFDF5", padding: "2px 6px", borderRadius: "4px" }}>
                    ✓ Lembaran Daerah Resmi
                  </span>
                </div>
              </div>

              <div style={{ padding: "16px", backgroundColor: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B" }}>3. SK TIM PEMBINA (TPJK)</span>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      placeholder="Nama SK TPJK"
                      value={formData.skTpjk}
                      onChange={(e) => setFormData({ ...formData, skTpjk: e.target.value })}
                      style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12px", marginTop: "4px" }}
                    />
                    <input
                      type="text"
                      placeholder="Nomor SK TPJK"
                      value={formData.noSkTpjk}
                      onChange={(e) => setFormData({ ...formData, noSkTpjk: e.target.value })}
                      style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12px", marginTop: "4px" }}
                    />
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C", marginTop: "4px" }}>{profile.skTpjk}</div>
                    <div style={{ fontSize: "12px", color: "#475569", marginTop: "2px", fontFamily: "monospace" }}>{profile.noSkTpjk}</div>
                  </>
                )}
                <div style={{ marginTop: "12px" }}>
                  <a
                    href={profile.dokumenSkAdminUrl || "#"}
                    style={{ fontSize: "11px", fontWeight: 800, color: "#2563EB", display: "inline-flex", alignItems: "center", gap: "4px", textDecoration: "none" }}
                  >
                    <Download style={{ width: "12px", height: "12px" }} /> Unduh SK Bupati TPJK (PDF)
                  </a>
                </div>
              </div>

              <div style={{ padding: "16px", backgroundColor: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B" }}>4. SPRINT / SK KEPALA DINAS</span>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="Nomor Surat Perintah Tugas"
                    value={formData.noSprintKadis}
                    onChange={(e) => setFormData({ ...formData, noSprintKadis: e.target.value })}
                    style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12px", marginTop: "4px" }}
                  />
                ) : (
                  <>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C", marginTop: "4px" }}>Surat Perintah Tugas Pengawasan Lapangan</div>
                    <div style={{ fontSize: "12px", color: "#475569", marginTop: "2px", fontFamily: "monospace" }}>{profile.noSprintKadis}</div>
                  </>
                )}
                <div style={{ marginTop: "12px" }}>
                  <a
                    href={profile.dokumenSprintUrl || "#"}
                    style={{ fontSize: "11px", fontWeight: 800, color: "#2563EB", display: "inline-flex", alignItems: "center", gap: "4px", textDecoration: "none" }}
                  >
                    <Download style={{ width: "12px", height: "12px" }} /> Unduh Surat Tugas (PDF)
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Anggaran Unit Kerja (Tahun n & n+1) */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "18px",
              padding: "24px 28px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ padding: "8px", borderRadius: "10px", backgroundColor: "#ECFDF5", color: "#059669" }}>
                <DollarSign style={{ width: "20px", height: "20px" }} />
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#0F2E5C", margin: 0 }}>
                  Alokasi Anggaran Unit Kerja (Tahun Berjalan n & Tahun n+1)
                </h3>
                <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>Pagu anggaran APBD untuk pembinaan jasa konstruksi dan total belanja fisik daerah</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {/* Tahun Berjalan (n, 2026) */}
              <div
                style={{
                  backgroundColor: "#F8FAFC",
                  borderRadius: "14px",
                  padding: "20px",
                  border: "1px solid #E2E8F0"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 900, color: "#0F2E5C" }}>Tahun Berjalan (n: 2026)</span>
                  <span style={{ fontSize: "11px", fontWeight: 800, backgroundColor: "#EBF2FA", color: "#0F2E5C", padding: "2px 8px", borderRadius: "6px" }}>DPA Definitif</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}>Anggaran Suburusan Jasa Konstruksi (Rp):</span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.anggaranJakonN}
                        onChange={(e) => setFormData({ ...formData, anggaranJakonN: parseFloat(e.target.value) || 0 })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", marginTop: "4px" }}
                      />
                    ) : (
                      <div style={{ fontSize: "18px", fontWeight: 900, color: "#059669", marginTop: "2px" }}>
                        {formatCurrency(profile.anggaranJakonN)}
                      </div>
                    )}
                  </div>

                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}>Total Anggaran Kegiatan Fisik / Infrastruktur (Rp):</span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.anggaranFisikN}
                        onChange={(e) => setFormData({ ...formData, anggaranFisikN: parseFloat(e.target.value) || 0 })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", marginTop: "4px" }}
                      />
                    ) : (
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "#0F2E5C", marginTop: "2px" }}>
                        {formatCurrency(profile.anggaranFisikN)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rencana Tahun Depan (n+1, 2027) */}
              <div
                style={{
                  backgroundColor: "#F8FAFC",
                  borderRadius: "14px",
                  padding: "20px",
                  border: "1px solid #E2E8F0"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 900, color: "#0F2E5C" }}>Rencana Tahun Depan (n+1: 2027)</span>
                  <span style={{ fontSize: "11px", fontWeight: 800, backgroundColor: "#FEF3C7", color: "#D97706", padding: "2px 8px", borderRadius: "6px" }}>Proyeksi KUA-PPAS</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}>Rencana Anggaran Jasa Konstruksi (Rp):</span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.anggaranJakonN1}
                        onChange={(e) => setFormData({ ...formData, anggaranJakonN1: parseFloat(e.target.value) || 0 })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", marginTop: "4px" }}
                      />
                    ) : (
                      <div style={{ fontSize: "18px", fontWeight: 900, color: "#059669", marginTop: "2px" }}>
                        {formatCurrency(profile.anggaranJakonN1)}
                      </div>
                    )}
                  </div>

                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}>Rencana Belanja Fisik Konstruksi (Rp):</span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.anggaranFisikN1}
                        onChange={(e) => setFormData({ ...formData, anggaranFisikN1: parseFloat(e.target.value) || 0 })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", marginTop: "4px" }}
                      />
                    ) : (
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "#0F2E5C", marginTop: "2px" }}>
                        {formatCurrency(profile.anggaranFisikN1)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: PELAKSANAAN & PENGAWASAN                                     */}
      {/* ==================================================================== */}
      {activeTab === "pelaksanaan-pengawasan" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Section 1: Tugas Utama & Pelatihan TKK */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "18px",
              padding: "24px 28px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ padding: "8px", borderRadius: "10px", backgroundColor: "#EBF2FA", color: "#0F2E5C" }}>
                <Award style={{ width: "20px", height: "20px" }} />
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#0F2E5C", margin: 0 }}>
                  Tugas Utama & Pengembangan Tenaga Kerja Konstruksi (TKK)
                </h3>
                <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>Cakupan kewenangan pembinaan dan realisasi pelatihan sertifikasi terhadap target RPJMD</p>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B" }}>Cakupan Tugas Utama Dinas:</span>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={formData.cakupanTugasUtama}
                  onChange={(e) => setFormData({ ...formData, cakupanTugasUtama: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", marginTop: "4px" }}
                />
              ) : (
                <p style={{ fontSize: "13px", color: "#334155", margin: "4px 0 0 0", lineHeight: "1.6" }}>
                  {profile.cakupanTugasUtama}
                </p>
              )}
            </div>

            {/* Metrik Pelatihan & Sertifikasi */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "16px"
              }}
            >
              {/* Pelatihan TKK */}
              <div style={{ backgroundColor: "#F8FAFC", borderRadius: "14px", padding: "18px", border: "1px solid #E2E8F0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C" }}>Pelatihan TKK Terlatih</span>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669", backgroundColor: "#ECFDF5", padding: "2px 8px", borderRadius: "9999px" }}>
                    {persenPelatihan}% dari Target
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "24px", fontWeight: 900, color: "#0F2E5C" }}>{profile.jmlTkkTerlatih}</span>
                  <span style={{ fontSize: "13px", color: "#64748B" }}>/ Target RPJMD {profile.targetRpjmdPelatihan} Orang</span>
                </div>

                <div style={{ width: "100%", height: "8px", backgroundColor: "#E2E8F0", borderRadius: "9999px", overflow: "hidden" }}>
                  <div style={{ width: `${persenPelatihan}%`, height: "100%", backgroundColor: "#059669", borderRadius: "9999px" }} />
                </div>
                <div style={{ fontSize: "11px", color: "#64748B", marginTop: "6px" }}>
                  Telah terselenggara <strong>{profile.jmlPelatihanTkk} gelombang</strong> pelatihan TA 2026.
                </div>
              </div>

              {/* Sertifikasi TKK */}
              <div style={{ backgroundColor: "#F8FAFC", borderRadius: "14px", padding: "18px", border: "1px solid #E2E8F0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C" }}>TKK Terlatih & Tersertifikasi SKK</span>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#2563EB", backgroundColor: "#EFF6FF", padding: "2px 8px", borderRadius: "9999px" }}>
                    {persenSertifikasi}% dari Target
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "24px", fontWeight: 900, color: "#2563EB" }}>{profile.jmlTkkTersertifikasi}</span>
                  <span style={{ fontSize: "13px", color: "#64748B" }}>/ Target RPJMD {profile.targetRpjmdSertifikasi} Orang</span>
                </div>

                <div style={{ width: "100%", height: "8px", backgroundColor: "#E2E8F0", borderRadius: "9999px", overflow: "hidden" }}>
                  <div style={{ width: `${persenSertifikasi}%`, height: "100%", backgroundColor: "#2563EB", borderRadius: "9999px" }} />
                </div>
                <div style={{ fontSize: "11px", color: "#64748B", marginTop: "6px" }}>
                  Kelulusan uji kompetensi BNSP/LSP mencapai <strong>{Math.round((profile.jmlTkkTersertifikasi / (profile.jmlTkkTerlatih || 1)) * 100)}%</strong>.
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Data Rantai Pasok Wilayah (BUJK & TKK) */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "18px",
              padding: "24px 28px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ padding: "8px", borderRadius: "10px", backgroundColor: "#F3E8FF", color: "#7C3AED" }}>
                <Briefcase style={{ width: "20px", height: "20px" }} />
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#0F2E5C", margin: 0 }}>
                  Data Rantai Pasok Wilayah Kabupaten Bogor
                </h3>
                <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>Statistik Badan Usaha Jasa Konstruksi (BUJK) dan Tenaga Kerja Konstruksi (TKK) aktif</p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "14px"
              }}
            >
              <div style={{ padding: "16px", backgroundColor: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B" }}>Total Badan Usaha (BUJK)</span>
                <div style={{ fontSize: "24px", fontWeight: 900, color: "#0F2E5C", marginTop: "4px" }}>
                  {profile.jmlBadanUsaha} <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748B" }}>BU</span>
                </div>
                <span style={{ fontSize: "11px", color: "#94A3B8" }}>Terdaftar di Kab. Bogor</span>
              </div>

              <div style={{ padding: "16px", backgroundColor: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B" }}>BUJK dengan SBU Berlaku</span>
                <div style={{ fontSize: "24px", fontWeight: 900, color: "#059669", marginTop: "4px" }}>
                  {profile.jmlSbuBerlaku} <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748B" }}>SBU</span>
                </div>
                <span style={{ fontSize: "11px", color: "#059669", fontWeight: 700 }}>
                  ✓ {Math.round((profile.jmlSbuBerlaku / (profile.jmlBadanUsaha || 1)) * 100)}% Kepatuhan SBU
                </span>
              </div>

              <div style={{ padding: "16px", backgroundColor: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B" }}>Total TKK di Wilayah</span>
                <div style={{ fontSize: "24px", fontWeight: 900, color: "#0F2E5C", marginTop: "4px" }}>
                  {profile.jmlTkkWilayah} <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748B" }}>Orang</span>
                </div>
                <span style={{ fontSize: "11px", color: "#94A3B8" }}>Tercatat di Basis Data</span>
              </div>

              <div style={{ padding: "16px", backgroundColor: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B" }}>TKK dengan SKK Aktif</span>
                <div style={{ fontSize: "24px", fontWeight: 900, color: "#2563EB", marginTop: "4px" }}>
                  {profile.jmlSkkBerlaku} <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748B" }}>SKK</span>
                </div>
                <span style={{ fontSize: "11px", color: "#2563EB", fontWeight: 700 }}>
                  ✓ {Math.round((profile.jmlSkkBerlaku / (profile.jmlTkkWilayah || 1)) * 100)}% Bersertifikat
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Pengawasan Penyelenggaraan (Tahun Berjalan) - LIVE AUTO ROLLUP */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "18px",
              padding: "24px 28px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ padding: "8px", borderRadius: "10px", backgroundColor: "#EBF2FA", color: "#0F2E5C" }}>
                  <TrendingUp style={{ width: "20px", height: "20px" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#0F2E5C", margin: 0 }}>
                    Pengawasan Penyelenggaraan Tahun Berjalan (Standar 3 Pilar SIPJAKI)
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>
                    Perbandingan data riil pengawasan lapangan (SIMAK 1, 2, 3) terhadap target RPJMD Kabupaten Bogor
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#059669",
                    backgroundColor: "#ECFDF5",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <DbIcon style={{ width: "12px", height: "12px" }} /> Auto-Rollup Terhubung
                </span>
              </div>
            </div>

            {/* Tabel 3 Baris Baku SIPJAKI */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0", color: "#0F2E5C", textAlign: "left" }}>
                    <th style={{ padding: "12px 14px", fontWeight: 800 }}>BIDANG PENGAWASAN</th>
                    <th style={{ padding: "12px 14px", fontWeight: 800, textAlign: "center" }}>OBJEK DIAWASI (REALISASI)</th>
                    <th style={{ padding: "12px 14px", fontWeight: 800, textAlign: "center" }}>PAKET / BANGUNAN KE-PU-AN</th>
                    <th style={{ padding: "12px 14px", fontWeight: 800, textAlign: "center" }}>TARGET RPJMD</th>
                    <th style={{ padding: "12px 14px", fontWeight: 800, textAlign: "center" }}>CAPAIAN (%)</th>
                    <th style={{ padding: "12px 14px", fontWeight: 800, textAlign: "center" }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Baris 1: Tertib Usaha (SIMAK 1) */}
                  <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                    <td style={{ padding: "14px", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 800, padding: "3px 8px", borderRadius: "6px", backgroundColor: "#EBF2FA", color: "#0F2E5C" }}>
                          SIMAK 1
                        </span>
                        <div>
                          <div style={{ fontWeight: 800, color: "#0F2E5C" }}>Tertib Usaha Jasa Konstruksi</div>
                          <div style={{ fontSize: "11px", color: "#64748B" }}>Kesesuaian izin usaha, rantai pasok material, & kapasitas BUJK</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px", textAlign: "center", fontWeight: 900, color: "#0F2E5C", fontSize: "15px" }}>
                      {profile.realisasiTertibUsaha} <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748B" }}>BU</span>
                    </td>
                    <td style={{ padding: "14px", textAlign: "center", fontWeight: 800, color: "#334155" }}>
                      {profile.realisasiTertibUsahaKepu} BU
                    </td>
                    <td style={{ padding: "14px", textAlign: "center", fontWeight: 800, color: "#64748B" }}>
                      {profile.targetRpjmdTertibUsaha} BU
                    </td>
                    <td style={{ padding: "14px", textAlign: "center", fontWeight: 900, color: "#059669" }}>
                      {Math.min(100, Math.round(((profile.realisasiTertibUsaha || 0) / (profile.targetRpjmdTertibUsaha || 1)) * 100))}%
                    </td>
                    <td style={{ padding: "14px", textAlign: "center" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, padding: "3px 8px", borderRadius: "6px", backgroundColor: "#ECFDF5", color: "#059669" }}>
                        On-Track
                      </span>
                    </td>
                  </tr>

                  {/* Baris 2: Tertib Penyelenggaraan (SIMAK 2) */}
                  <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                    <td style={{ padding: "14px", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 800, padding: "3px 8px", borderRadius: "6px", backgroundColor: "#FEF3C7", color: "#D97706" }}>
                          SIMAK 2
                        </span>
                        <div>
                          <div style={{ fontWeight: 800, color: "#0F2E5C" }}>Tertib Penyelenggaraan Jasa Konstruksi</div>
                          <div style={{ fontSize: "11px", color: "#64748B" }}>Pengawasan kontrak, standar SMKK, mutu teknis, & tata kelola proyek</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px", textAlign: "center", fontWeight: 900, color: "#0F2E5C", fontSize: "15px" }}>
                      {profile.realisasiTertibPenyelenggaraan} <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748B" }}>Paket</span>
                    </td>
                    <td style={{ padding: "14px", textAlign: "center", fontWeight: 800, color: "#334155" }}>
                      {profile.realisasiTertibPenyelenggaraanKepu} Paket
                    </td>
                    <td style={{ padding: "14px", textAlign: "center", fontWeight: 800, color: "#64748B" }}>
                      {profile.targetRpjmdTertibPenyelenggaraan} Paket
                    </td>
                    <td style={{ padding: "14px", textAlign: "center", fontWeight: 900, color: "#059669" }}>
                      {Math.min(100, Math.round(((profile.realisasiTertibPenyelenggaraan || 0) / (profile.targetRpjmdTertibPenyelenggaraan || 1)) * 100))}%
                    </td>
                    <td style={{ padding: "14px", textAlign: "center" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, padding: "3px 8px", borderRadius: "6px", backgroundColor: "#ECFDF5", color: "#059669" }}>
                        On-Track
                      </span>
                    </td>
                  </tr>

                  {/* Baris 3: Tertib Pemanfaatan (SIMAK 3) */}
                  <tr>
                    <td style={{ padding: "14px", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 800, padding: "3px 8px", borderRadius: "6px", backgroundColor: "#ECFDF5", color: "#059669" }}>
                          SIMAK 3
                        </span>
                        <div>
                          <div style={{ fontWeight: 800, color: "#0F2E5C" }}>Tertib Pemanfaatan Produk Konstruksi</div>
                          <div style={{ fontSize: "11px", color: "#64748B" }}>Fungsi peruntukan, keabsahan SLF, umur rencana, & pemeliharaan berkala</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px", textAlign: "center", fontWeight: 900, color: "#0F2E5C", fontSize: "15px" }}>
                      {profile.realisasiTertibPemanfaatan} <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748B" }}>Bangunan</span>
                    </td>
                    <td style={{ padding: "14px", textAlign: "center", fontWeight: 800, color: "#334155" }}>
                      {profile.realisasiTertibPemanfaatanKepu} Bangunan
                    </td>
                    <td style={{ padding: "14px", textAlign: "center", fontWeight: 800, color: "#64748B" }}>
                      {profile.targetRpjmdTertibPemanfaatan} Bangunan
                    </td>
                    <td style={{ padding: "14px", textAlign: "center", fontWeight: 900, color: "#059669" }}>
                      {Math.min(100, Math.round(((profile.realisasiTertibPemanfaatan || 0) / (profile.targetRpjmdTertibPemanfaatan || 1)) * 100))}%
                    </td>
                    <td style={{ padding: "14px", textAlign: "center" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, padding: "3px 8px", borderRadius: "6px", backgroundColor: "#ECFDF5", color: "#059669" }}>
                        On-Track
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: MASTER SATUAN KERJA (OPD SE-KABUPATEN)                        */}
      {/* ==================================================================== */}
      {activeTab === "master-opd" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Action Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0F2E5C", margin: 0 }}>
                Daftar Master Organisasi Perangkat Daerah (OPD)
              </h2>
              <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
                Pengelolaan satker pengguna anggaran, tim pembina jakon, dan akun verifikator
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setShowBatchImportModal(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  borderRadius: "12px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  padding: "10px 16px",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#0F2E5C",
                  cursor: "pointer"
                }}
              >
                <FileSpreadsheet style={{ width: "15px", height: "15px", color: "#16A34A" }} />
                <span>Import Batch OPD</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  borderRadius: "12px",
                  backgroundColor: "#0F2E5C",
                  border: "none",
                  padding: "10px 18px",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(15, 46, 92, 0.2)"
                }}
              >
                <Plus style={{ width: "15px", height: "15px" }} />
                <span>Tambah Satker Baru</span>
              </button>
            </div>
          </div>

          <FilterBar
            values={filterValues}
            onChange={(vals: FilterBarValues) => setFilterValues(vals)}
            onReset={() => setFilterValues({ search: "", province: "", city: "", year: "", status: "" })}
            showLocationFilter={false}
            showYearFilter={false}
            showStatusFilter={true}
            statuses={["Semua", "Terhubung", "Menunggu Verifikasi", "Belum Terhubung"]}
          />

          <DataTableView
            data={filteredMasterOpd}
            columns={columnsMasterOpd}
            defaultPageSize={10}
            emptyMessage="Belum ada data OPD yang terdaftar."
            exportFileName="Daftar_Master_OPD_Kabupaten_Bogor"
            exportColumns={masterOpdExportColumns}
          />
        </div>
      )}

      {/* Modal Tambah Satker Baru */}
      <ModalForm
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tambah Satuan Kerja / OPD Baru"
        onSubmit={handleAddOpd}
        isLoading={isSubmitting}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
              Kode Rekening OPD <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: 1.03.01.01"
              value={formKode}
              onChange={(e) => setFormKode(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
              Nama Dinas / Lembaga <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Dinas Bina Marga dan Penataan Ruang"
              value={formNama}
              onChange={(e) => setFormNama(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
                Tingkat Pemerintahan
              </label>
              <select
                value={formTingkat}
                onChange={(e) => setFormTingkat(e.target.value as any)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px" }}
              >
                <option value="Kabupaten/Kota">Kabupaten/Kota</option>
                <option value="Provinsi">Provinsi</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
                Jumlah Personil Tim Pembina
              </label>
              <input
                type="number"
                value={formJumlahTim}
                onChange={(e) => setFormJumlahTim(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
              Kepala Dinas / Pimpinan
            </label>
            <input
              type="text"
              placeholder="Nama Kepala Dinas beserta gelar"
              value={formKepalaDinas}
              onChange={(e) => setFormKepalaDinas(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
              Alamat Kantor
            </label>
            <textarea
              rows={2}
              placeholder="Alamat kantor lengkap..."
              value={formAlamat}
              onChange={(e) => setFormAlamat(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px", resize: "vertical" }}
            />
          </div>
        </div>
      </ModalForm>

      {/* Modal Batch Import OPD */}
      <BatchImportModal
        isOpen={showBatchImportModal}
        onClose={() => setShowBatchImportModal(false)}
        expectedColumns={opdBatchColumns}
        sampleRows={sampleBatchOpd}
        title="Import Data Master Satker OPD via Excel / CSV"
        onCommit={(data: any[]) => {
          const imported: MasterOpdRecord[] = data.map((d: any, idx: number) => ({
            id: `OPD-IMP-${Date.now()}-${idx}`,
            kodeOpd: d.kodeOpd || `1.03.01.0${idx + 10}`,
            namaOpd: d.namaOpd || "Dinas Contoh",
            kabupatenKota: d.kabupatenKota || "Kabupaten Bogor",
            provinsi: d.provinsi || "Jawa Barat",
            alamat: d.alamat || "Jl. Raya Tegar Beriman, Cibinong",
            telepon: d.telepon || "(021) 8754000",
            email: d.email || `${(d.kodeOpd || "opd").toLowerCase()}@bogorkab.go.id`,
            kepalaDinas: d.kepalaDinas || "-",
            tingkat: (d.tingkat as any) || "Kabupaten/Kota",
            jumlahTimPembina: parseInt(d.jumlahTimPembina) || 5,
            statusSinkronisasi: "Menunggu Verifikasi",
            tanggalRegistrasi: new Date().toISOString().split("T")[0]
          }));

          setMasterList(prev => [...imported, ...prev]);
          showToast(`Berhasil mengimpor ${imported.length} data Satuan Kerja!`);
        }}
      />
    </div>
  );
}

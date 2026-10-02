"use client";
import { useState } from "react";
import { 
  Landmark, UserCheck, ShieldCheck, DollarSign, FileText, CheckCircle2, 
  RefreshCw, Building2, Phone, Mail, Sparkles, Send, Download, Check,
  Plus, Layers, Eye, FileSpreadsheet
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import opdData from "@/data/opd.json";
import { mockMasterOpdList, MasterOpdRecord } from "@/data/opd-master";
import { 
  StatusBadge, DataTableView, FilterBar, 
  FilterBarValues, ModalForm, ColumnDef 
} from "@/components/common";
import BatchImportModal, { BatchColumnDef } from "@/components/common/batch-import-modal";

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
  const [profile, setProfile] = useState(opdData);
  const [isEditing, setIsEditing] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profil" | "master">("profil");

  // Master OPD State
  const [masterList, setMasterList] = useState<MasterOpdRecord[]>(mockMasterOpdList);
  const [showBatchImportModal, setShowBatchImportModal] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterBarValues>({
    search: "",
    province: "",
    city: "",
    year: "",
    status: ""
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleAddOpd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama || !formKode) {
      alert("Mohon isi Nama OPD dan Kode OPD!");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newOpd: MasterOpdRecord = {
        id: `OPD-${Date.now().toString().slice(-4)}`,
        kodeOpd: formKode,
        namaOpd: formNama,
        tingkat: formTingkat,
        provinsi: formProvinsi,
        kabupatenKota: formKabKota,
        alamat: formAlamat || "Komplek Perkantoran Pemda",
        telepon: formTelepon || "(021) 8750000",
        email: formEmail || "opd@pemda.go.id",
        kepalaDinas: formKepalaDinas || "Kepala Dinas Baru",
        jumlahTimPembina: parseInt(formJumlahTim, 10) || 5,
        statusSinkronisasi: "Terhubung",
        tanggalRegistrasi: new Date().toISOString().split("T")[0]
      };

      setMasterList([newOpd, ...masterList]);
      setIsSubmitting(false);
      setShowAddModal(false);
      setFormNama("");
      setFormKode("");
      setFormAlamat("");
      alert(`Data OPD "${formNama}" berhasil didaftarkan ke SIPJAKI Master!`);
    }, 600);
  };

  const masterColumns: ColumnDef<MasterOpdRecord>[] = [
    {
      key: "no",
      label: "NO",
      width: "50px",
      sortable: false,
      render: (_, idx) => <span style={{ fontWeight: 700, color: "#64748B" }}>{idx + 1}</span>
    },
    {
      key: "namaOpd",
      label: "NAMA & KODE OPD",
      sortable: true,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C" }}>
            {row.namaOpd}
          </span>
          <span style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
            Kode Rekening: <b style={{ fontFamily: "monospace" }}>{row.kodeOpd}</b> • Tingkat: {row.tingkat}
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
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Landmark style={{ width: "12px", height: "12px" }} /> Data Kelembagaan
            </span>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669", backgroundColor: "#ECFDF5", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <ShieldCheck style={{ width: "12px", height: "12px" }} /> {profile.sipjakiStatus.accountStatus}
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Profil OPD Penyelenggara Jasa Konstruksi
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
            Kelengkapan profil kelembagaan, personil tim pembina, pagu anggaran, dan SK Tim Pengawas SIPJAKI
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
          {activeTab === "master" ? (
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
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
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
                  gap: "8px",
                  borderRadius: "12px",
                  backgroundColor: "#0F2E5C",
                  border: "none",
                  borderBottom: "3px solid #FFC000",
                  padding: "10px 20px",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  cursor: "pointer",
                  boxShadow: "0 4px 10px rgba(15, 46, 92, 0.2)"
                }}
              >
                <Plus style={{ width: "16px", height: "16px", color: "#FFC000" }} />
                <span>Tambah Data OPD</span>
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSync}
                disabled={syncLoading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  borderRadius: "12px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  padding: "10px 18px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#334155",
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
                }}
              >
                <RefreshCw style={{ width: "15px", height: "15px", color: syncLoading ? "#0F2E5C" : "#64748B" }} />
                <span>{syncLoading ? "Sinkronisasi..." : "Sinkronkan ke SIPJAKI"}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  borderRadius: "12px",
                  backgroundColor: isEditing ? "#64748B" : "#0F2E5C",
                  border: "none",
                  borderBottom: isEditing ? "none" : "3px solid #FFC000",
                  padding: "10px 20px",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  cursor: "pointer",
                  boxShadow: "0 4px 10px rgba(15, 46, 92, 0.2)"
                }}
              >
                {isEditing ? "Batal Edit" : "Perbarui Profil"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("profil")}
          style={{
            padding: "8px 18px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 800,
            border: "none",
            cursor: "pointer",
            backgroundColor: activeTab === "profil" ? "#0F2E5C" : "#F1F5F9",
            color: activeTab === "profil" ? "#FFFFFF" : "#64748B",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <Landmark style={{ width: "14px", height: "14px" }} />
          <span>Profil OPD DPU Kab. Bogor</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("master")}
          style={{
            padding: "8px 18px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 800,
            border: "none",
            cursor: "pointer",
            backgroundColor: activeTab === "master" ? "#0F2E5C" : "#F1F5F9",
            color: activeTab === "master" ? "#FFFFFF" : "#64748B",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <Layers style={{ width: "14px", height: "14px" }} />
          <span>Master Data OPD SIPJAKI ({masterList.length})</span>
        </button>
      </div>

      {activeTab === "profil" ? (
        <>
          {/* Sync Status Banner */}
      <div 
        style={{
          borderRadius: "16px",
          border: "1px solid #BFDBFE",
          backgroundColor: "#EFF6FF",
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div 
            style={{
              height: "44px",
              width: "44px",
              borderRadius: "12px",
              backgroundColor: "#0F2E5C",
              color: "#FFC000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <Sparkles style={{ width: "22px", height: "22px" }} />
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
              Kelengkapan Profil SIPJAKI: {profile.sipjakiStatus.completenessScore}% (Sangat Lengkap)
            </p>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "3px 0 0 0" }}>
              Sinkronisasi Terakhir: {profile.sipjakiStatus.lastSync} • Portal SIPJAKI Kementerian PUPR
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "160px", height: "10px", backgroundColor: "#DBEAFE", borderRadius: "9999px", overflow: "hidden" }}>
            <div 
              style={{ 
                width: `${profile.sipjakiStatus.completenessScore}%`, 
                height: "100%", 
                backgroundColor: "#0F2E5C", 
                borderRadius: "9999px" 
              }} 
            />
          </div>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C", fontFamily: "monospace" }}>96/100</span>
        </div>
      </div>

      {/* Main Form/Display */}
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Section 1: Identitas OPD */}
        <div 
          style={{
            borderRadius: "18px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: "24px 28px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px", marginBottom: "20px" }}>
            <div style={{ height: "32px", width: "32px", borderRadius: "8px", backgroundColor: "#EBF2FA", color: "#0F2E5C", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 style={{ width: "18px", height: "18px" }} />
            </div>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
              1. Identitas Organisasi Perangkat Daerah
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Nama Dinas / Instansi</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.agencyName}
                onChange={(e) => setProfile({...profile, agencyName: e.target.value})}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: isEditing ? "#FFFFFF" : "#F8FAFC",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#0F172A",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Pemerintah Daerah</label>
              <input
                type="text"
                disabled={!isEditing}
                value={`${profile.government} - Provinsi ${profile.province}`}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#F8FAFC",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#0F172A",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Bidang Penanggung Jawab</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.division}
                onChange={(e) => setProfile({...profile, division: e.target.value})}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: isEditing ? "#FFFFFF" : "#F8FAFC",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#0F172A",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Website Resmi</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.website}
                onChange={(e) => setProfile({...profile, website: e.target.value})}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: isEditing ? "#FFFFFF" : "#F8FAFC",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#0F172A",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Alamat Kantor</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.address}
                onChange={(e) => setProfile({...profile, address: e.target.value})}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: isEditing ? "#FFFFFF" : "#F8FAFC",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#0F172A",
                  outline: "none"
                }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Personil Kunci & Penanggung Jawab */}
        <div 
          style={{
            borderRadius: "18px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: "24px 28px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px", marginBottom: "20px" }}>
            <div style={{ height: "32px", width: "32px", borderRadius: "8px", backgroundColor: "#EBF2FA", color: "#0F2E5C", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserCheck style={{ width: "18px", height: "18px" }} />
            </div>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
              2. Personil Kunci & Penanggung Jawab SIPJAKI
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" }}>
            {/* Kepala Dinas */}
            <div style={{ borderRadius: "14px", border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748B" }}>
                Kepala Dinas
              </span>
              <div>
                <p style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0 }}>{profile.headOfAgency.name}</p>
                <p style={{ fontSize: "12px", fontFamily: "monospace", color: "#64748B", margin: "3px 0 0 0" }}>NIP. {profile.headOfAgency.nip}</p>
              </div>
              <p style={{ fontSize: "12px", color: "#475569", margin: 0, fontWeight: 600 }}>{profile.headOfAgency.position}</p>
            </div>

            {/* PIC SIPJAKI */}
            <div style={{ borderRadius: "14px", border: "1px solid #BFDBFE", backgroundColor: "#EFF6FF", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#1E40AF" }}>
                PIC SIPJAKI (Kabid)
              </span>
              <div>
                <p style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0 }}>{profile.picSipjaki.name}</p>
                <p style={{ fontSize: "12px", fontFamily: "monospace", color: "#1E40AF", margin: "3px 0 0 0" }}>NIP. {profile.picSipjaki.nip}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", color: "#475569" }}>
                <p style={{ display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                  <Phone style={{ width: "13px", height: "13px", color: "#1E40AF" }} /> {profile.picSipjaki.phone}
                </p>
                <p style={{ display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                  <Mail style={{ width: "13px", height: "13px", color: "#1E40AF" }} /> {profile.picSipjaki.email}
                </p>
              </div>
            </div>

            {/* Operator SIPJAKI */}
            <div style={{ borderRadius: "14px", border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748B" }}>
                Operator Sistem
              </span>
              <div>
                <p style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0 }}>{profile.operatorSipjaki.name}</p>
                <p style={{ fontSize: "12px", fontFamily: "monospace", color: "#64748B", margin: "3px 0 0 0" }}>NIP. {profile.operatorSipjaki.nip}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", color: "#475569" }}>
                <p style={{ display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                  <Phone style={{ width: "13px", height: "13px", color: "#94A3B8" }} /> {profile.operatorSipjaki.phone}
                </p>
                <p style={{ display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                  <Mail style={{ width: "13px", height: "13px", color: "#94A3B8" }} /> {profile.operatorSipjaki.email}
                </p>
              </div>
            </div>
          </div>

          {/* Personnel Stats Grid */}
          <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #F1F5F9", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
            <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", padding: "14px 16px", borderRadius: "12px", textAlign: "center" }}>
              <p style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0 }}>{profile.personnel.functionalSupervisors}</p>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", margin: "4px 0 0 0" }}>Pejabat Fungsional Jakon</p>
            </div>
            <div style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", padding: "14px 16px", borderRadius: "12px", textAlign: "center" }}>
              <p style={{ fontSize: "24px", fontWeight: 900, color: "#1E40AF", margin: 0 }}>{profile.personnel.certifiedInspectors}</p>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#1E40AF", margin: "4px 0 0 0" }}>Pengawas Bersertifikat SIMAK</p>
            </div>
            <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", padding: "14px 16px", borderRadius: "12px", textAlign: "center" }}>
              <p style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0 }}>{profile.personnel.adminStaff}</p>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", margin: "4px 0 0 0" }}>Staf Administrasi</p>
            </div>
            <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", padding: "14px 16px", borderRadius: "12px", textAlign: "center" }}>
              <p style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0 }}>{profile.personnel.contractStaff}</p>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", margin: "4px 0 0 0" }}>Tenaga Pendukung Lapangan</p>
            </div>
          </div>
        </div>

        {/* Section 3 & 4: SK Tim Pembina & Pagu Anggaran */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          {/* Card 3: SK Tim Pembina */}
          <div 
            style={{
              borderRadius: "18px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              padding: "24px 26px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "20px"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px", marginBottom: "16px" }}>
                <div style={{ height: "32px", width: "32px", borderRadius: "8px", backgroundColor: "#EBF2FA", color: "#0F2E5C", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FileText style={{ width: "18px", height: "18px" }} />
                </div>
                <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                  3. SK Tim Pembina & Pengawas
                </h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "#64748B", fontWeight: 600 }}>Nomor SK Bupati:</span>
                  <p style={{ fontFamily: "monospace", fontWeight: 800, color: "#0F172A", fontSize: "13px", margin: "3px 0 0 0" }}>
                    {profile.decree.number}
                  </p>
                </div>
                <div>
                  <span style={{ color: "#64748B", fontWeight: 600 }}>Tanggal Penetapan:</span>
                  <p style={{ fontWeight: 700, color: "#0F172A", margin: "3px 0 0 0" }}>
                    {profile.decree.date}
                  </p>
                </div>
                <div>
                  <span style={{ color: "#64748B", fontWeight: 600 }}>Tentang:</span>
                  <p style={{ color: "#334155", lineHeight: 1.5, margin: "3px 0 0 0" }}>
                    {profile.decree.about}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ paddingTop: "14px", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669", backgroundColor: "#ECFDF5", padding: "4px 12px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 style={{ width: "13px", height: "13px" }} /> {profile.decree.status}
              </span>
              <button
                type="button"
                onClick={() => alert("Mengunduh salinan SK Tim Pembina (PDF)...")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  borderRadius: "8px",
                  backgroundColor: "#F1F5F9",
                  color: "#0F2E5C",
                  padding: "7px 14px",
                  fontSize: "11px",
                  fontWeight: 700,
                  border: "1px solid #E2E8F0",
                  cursor: "pointer"
                }}
              >
                <Download style={{ width: "13px", height: "13px" }} /> Unduh SK (PDF)
              </button>
            </div>
          </div>

          {/* Card 4: Pagu Anggaran */}
          <div 
            style={{
              borderRadius: "18px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              padding: "24px 26px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "20px"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px", marginBottom: "16px" }}>
                <div style={{ height: "32px", width: "32px", borderRadius: "8px", backgroundColor: "#FFFBEB", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DollarSign style={{ width: "18px", height: "18px" }} />
                </div>
                <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                  4. Pagu Anggaran Pembinaan TA 2026
                </h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600 }}>Total Pagu:</span>
                  <span style={{ fontSize: "18px", fontWeight: 900, color: "#0F172A", fontFamily: "monospace" }}>
                    {formatCurrency(profile.budget2026.paguTotal)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600 }}>Realisasi per Hari Ini:</span>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "#D97706", fontFamily: "monospace" }}>
                    {formatCurrency(profile.budget2026.realization)} ({Math.round((profile.budget2026.realization / profile.budget2026.paguTotal) * 100)}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ width: "100%", height: "8px", backgroundColor: "#F1F5F9", borderRadius: "9999px", overflow: "hidden", margin: "4px 0" }}>
                  <div 
                    style={{ 
                      width: `${Math.round((profile.budget2026.realization / profile.budget2026.paguTotal) * 100)}%`, 
                      height: "100%", 
                      backgroundColor: "#D97706", 
                      borderRadius: "9999px" 
                    }} 
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "10px", borderTop: "1px solid #F1F5F9", fontSize: "12px" }}>
                  {profile.budget2026.activities.map((act) => (
                    <div key={act.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                      <span style={{ color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "260px" }}>
                        {act.name}
                      </span>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0F172A", flexShrink: 0 }}>
                        {formatCurrency(act.pagu)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ paddingTop: "12px", borderTop: "1px solid #F1F5F9" }}>
              <p style={{ fontSize: "11px", color: "#94A3B8", margin: 0 }}>
                Sumber Dana: APBD Kabupaten Bogor TA 2026 • Kode Rekening: 1.03.02.2.01
              </p>
            </div>
          </div>
        </div>

        {isEditing && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "16px", borderTop: "1px solid #E2E8F0" }}>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              style={{
                borderRadius: "12px",
                padding: "10px 20px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#64748B",
                backgroundColor: "#F1F5F9",
                border: "none",
                cursor: "pointer"
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "12px",
                backgroundColor: "#0F2E5C",
                border: "none",
                borderBottom: "3px solid #FFC000",
                padding: "10px 24px",
                fontSize: "13px",
                fontWeight: 800,
                color: "#FFFFFF",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(15, 46, 92, 0.2)"
              }}
            >
              <Send style={{ width: "15px", height: "15px" }} /> Simpan Perubahan Profil
            </button>
          </div>
        )}
      </form>
        </>
      ) : (
        /* Master OPD View */
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* 3 Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                padding: "18px 20px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 8px rgba(15, 46, 92, 0.03)",
                display: "flex",
                alignItems: "center",
                gap: "14px"
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "#EBF2FA",
                  color: "#0F2E5C",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Building2 style={{ width: "22px", height: "22px" }} />
              </div>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                  Total OPD Terdaftar
                </span>
                <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#0F2E5C", margin: "2px 0 0 0" }}>
                  {totalOpd} Instansi
                </h3>
                <span style={{ fontSize: "11px", color: "#64748B" }}>Database SIPJAKI Nasional</span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                padding: "18px 20px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 8px rgba(15, 46, 92, 0.03)",
                display: "flex",
                alignItems: "center",
                gap: "14px"
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "#FEF3C7",
                  color: "#92400E",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Landmark style={{ width: "22px", height: "22px" }} />
              </div>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                  Tingkat Provinsi
                </span>
                <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#92400E", margin: "2px 0 0 0" }}>
                  {totalProv} Dinas Provinsi
                </h3>
                <span style={{ fontSize: "11px", color: "#64748B" }}>Jawa Barat & DKI Jakarta</span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                padding: "18px 20px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 8px rgba(15, 46, 92, 0.03)",
                display: "flex",
                alignItems: "center",
                gap: "14px"
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "#DCFCE7",
                  color: "#166534",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <CheckCircle2 style={{ width: "22px", height: "22px" }} />
              </div>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                  Tingkat Kab/Kota
                </span>
                <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#166534", margin: "2px 0 0 0" }}>
                  {totalKabKota} Dinas Teknis
                </h3>
                <span style={{ fontSize: "11px", color: "#166534", fontWeight: 700 }}>Kab. Bogor & Sekitarnya</span>
              </div>
            </div>
          </div>

          {/* Cascading Filter Bar */}
          <FilterBar
            values={filterValues}
            onChange={setFilterValues}
            onReset={() =>
              setFilterValues({
                search: "",
                province: "",
                city: "",
                year: "",
                status: ""
              })
            }
            showLocationFilter={true}
            showStatusFilter={true}
            statuses={["Semua", "Terhubung", "Menunggu Verifikasi", "Belum Terhubung"]}
            searchPlaceholder="Cari nama dinas, kode rekening OPD, atau kabupaten..."
          />

          {/* DataTableView */}
          <DataTableView<MasterOpdRecord>
            title={`Daftar Master OPD Penyelenggara Jasa Konstruksi (${filteredMasterOpd.length})`}
            subtitle="Basis data kelembagaan OPD tingkat provinsi dan kabupaten/kota se-Indonesia"
            data={filteredMasterOpd}
            columns={masterColumns}
            defaultPageSize={5}
            exportFileName="Master_Data_OPD_SIPJAKI"
            actionsHeader="AKSI"
            actionsRender={(row) => (
              <button
                type="button"
                onClick={() =>
                  alert(
                    `Profil Lengkap OPD:\nNama: ${row.namaOpd}\nKode: ${row.kodeOpd}\nWilayah: ${row.kabupatenKota}, ${row.provinsi}\nKepala Dinas: ${row.kepalaDinas}\nKontak: ${row.telepon} • ${row.email}`
                  )
                }
                style={{
                  backgroundColor: "#EBF2FA",
                  color: "#0F2E5C",
                  border: "none",
                  borderRadius: "6px",
                  padding: "5px 12px",
                  fontSize: "11px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <Eye style={{ width: "12px", height: "12px" }} />
                <span>Detail</span>
              </button>
            )}
          />

          {/* Modal Form Tambah OPD Baru */}
          <ModalForm
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            title="Tambah Data Master OPD Baru"
            subtitle="Daftarkan instansi OPD teknis penyelenggara jasa konstruksi ke SIPJAKI"
            onSubmit={handleAddOpd}
            submitLabel="Daftarkan OPD"
            isLoading={isSubmitting}
            size="lg"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                  Nama OPD / Instansi <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dinas Pekerjaan Umum"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  style={{
                    width: "100%",
                    height: "38px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    padding: "0 12px",
                    fontSize: "12px",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                    Kode Rekening OPD <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 1.03.01.01"
                    value={formKode}
                    onChange={(e) => setFormKode(e.target.value)}
                    style={{
                      width: "100%",
                      height: "38px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      padding: "0 12px",
                      fontSize: "12px",
                      outline: "none"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                    Tingkat Kelembagaan
                  </label>
                  <select
                    value={formTingkat}
                    onChange={(e) => setFormTingkat(e.target.value as "Provinsi" | "Kabupaten/Kota")}
                    style={{
                      width: "100%",
                      height: "38px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      padding: "0 10px",
                      fontSize: "12px",
                      outline: "none",
                      backgroundColor: "#FFFFFF"
                    }}
                  >
                    <option value="Kabupaten/Kota">Kabupaten / Kota</option>
                    <option value="Provinsi">Provinsi</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                    Provinsi
                  </label>
                  <input
                    type="text"
                    value={formProvinsi}
                    onChange={(e) => setFormProvinsi(e.target.value)}
                    style={{
                      width: "100%",
                      height: "38px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      padding: "0 12px",
                      fontSize: "12px",
                      outline: "none"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                    Kabupaten / Kota
                  </label>
                  <input
                    type="text"
                    value={formKabKota}
                    onChange={(e) => setFormKabKota(e.target.value)}
                    style={{
                      width: "100%",
                      height: "38px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      padding: "0 12px",
                      fontSize: "12px",
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                    Nama Kepala Dinas
                  </label>
                  <input
                    type="text"
                    placeholder="Nama beserta gelar"
                    value={formKepalaDinas}
                    onChange={(e) => setFormKepalaDinas(e.target.value)}
                    style={{
                      width: "100%",
                      height: "38px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      padding: "0 12px",
                      fontSize: "12px",
                      outline: "none"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                    Jumlah Personil Pembina
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formJumlahTim}
                    onChange={(e) => setFormJumlahTim(e.target.value)}
                    style={{
                      width: "100%",
                      height: "38px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      padding: "0 12px",
                      fontSize: "12px",
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                  Alamat Kantor
                </label>
                <input
                  type="text"
                  placeholder="Alamat kantor lengkap"
                  value={formAlamat}
                  onChange={(e) => setFormAlamat(e.target.value)}
                  style={{
                    width: "100%",
                    height: "38px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    padding: "0 12px",
                    fontSize: "12px",
                    outline: "none"
                  }}
                />
              </div>
            </div>
          </ModalForm>

          {/* Reusable Batch Import Modal untuk OPD */}
          <BatchImportModal<MasterOpdRecord>
            isOpen={showBatchImportModal}
            onClose={() => setShowBatchImportModal(false)}
            title="Import Batch Master Data OPD (Excel/CSV)"
            subtitle="Unggah berkas rekapitulasi data dinas, badan, dan kecamatan pengampu jasa konstruksi"
            templateFileName="template_master_opd_sipjaki.csv"
            expectedColumns={opdBatchColumns}
            sampleRows={sampleBatchOpd}
            onCommit={(parsedRows) => {
              const formatted: MasterOpdRecord[] = parsedRows.map((row: any, idx: number) => ({
                id: `OPD-IMP-${String(masterList.length + idx + 1).padStart(3, "0")}`,
                kodeOpd: row.kodeOpd || `1.03.00.00.${idx + 1}`,
                namaOpd: row.namaOpd || "Dinas Teknis Kabupaten Bogor",
                tingkat: row.tingkat === "Provinsi" ? "Provinsi" : "Kabupaten/Kota",
                provinsi: row.provinsi || "Jawa Barat",
                kabupatenKota: row.kabupatenKota || "Kabupaten Bogor",
                alamat: row.alamat || "Kawasan Pusat Pemerintahan Daerah Kabupaten Bogor, Jl. Tegar Beriman, Cibinong",
                telepon: row.telepon || "(021) 87901234",
                email: row.email || "info@bogorkab.go.id",
                kepalaDinas: row.kepalaDinas || "Kepala Dinas",
                jumlahTimPembina: Number(row.jumlahTimPembina) || 6,
                statusSinkronisasi: "Terhubung",
                tanggalRegistrasi: new Date().toISOString().split("T")[0]
              }));
              setMasterList([...formatted, ...masterList]);
              alert(`Berhasil mengimpor ${formatted.length} Master OPD ke dalam sistem!`);
            }}
          />
        </div>
      )}
    </div>
  );
}

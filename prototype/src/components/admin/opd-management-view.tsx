"use client";
import { useState, useEffect, useMemo } from "react";
import { 
  Building2, Plus, Search, CheckCircle2, AlertTriangle, 
  Edit, Trash2, Users, MapPin, Phone, UserCheck, ShieldCheck, Eye
} from "lucide-react";
import OpdFormModal, { OpdData } from "./opd-form-modal";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const INITIAL_OPD_DATA: OpdData[] = [
  {
    id: "opd-dpu",
    kode: "DPU",
    nama: "Dinas Pekerjaan Umum",
    namaPendek: "DPU",
    kepalaOpd: "Drs. H. Suryanto Putra, M.Si",
    nipKepala: "196811051994031002",
    alamat: "Jl. Tegar Beriman No. 1, Cibinong, Kabupaten Bogor",
    telepon: "(021) 8754123",
    isActive: true,
    userCount: 4,
  },
  {
    id: "opd-bappeda",
    kode: "BAPPEDA",
    nama: "Badan Perencanaan Pembangunan Daerah",
    namaPendek: "Bappeda",
    kepalaOpd: "Ir. Hj. Nurhayati, MT",
    nipKepala: "197203151998032003",
    alamat: "Kompleks Perkantoran Pemkab Bogor, Cibinong",
    telepon: "(021) 8754200",
    isActive: true,
    userCount: 1,
  },
  {
    id: "opd-bpkad",
    kode: "BPKAD",
    nama: "Badan Pengelolaan Keuangan dan Aset Daerah",
    namaPendek: "BPKAD",
    kepalaOpd: "Achmad Wildan, SE, MM",
    nipKepala: "197504202000031001",
    alamat: "Jl. Bersih No. 2, Cibinong, Kabupaten Bogor",
    telepon: "(021) 8754321",
    isActive: true,
    userCount: 1,
  },
  {
    id: "opd-disdik",
    kode: "DISDIK",
    nama: "Dinas Pendidikan",
    namaPendek: "Disdik",
    kepalaOpd: "Bambang Widodo Tawekal, M.Pd",
    nipKepala: "196908101995121001",
    alamat: "Jl. Nyaman No. 5, Cibinong, Kabupaten Bogor",
    telepon: "(021) 8754400",
    isActive: true,
    userCount: 1,
  },
  {
    id: "opd-dinkes",
    kode: "DINKES",
    nama: "Dinas Kesehatan",
    namaPendek: "Dinkes",
    kepalaOpd: "dr. Mike Kaltarina, MARS",
    nipKepala: "197412022002122001",
    alamat: "Jl. Kesehatan No. 3, Cibinong, Kabupaten Bogor",
    telepon: "(021) 8754500",
    isActive: true,
    userCount: 1,
  },
];

export default function OpdManagementView() {
  const [opds, setOpds] = useState<OpdData[]>(INITIAL_OPD_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOpd, setSelectedOpd] = useState<OpdData | null>(null);
  const [viewDetailOpd, setViewDetailOpd] = useState<OpdData | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("sijakon_opd_list_v1") : null;
      if (stored) {
        setOpds(JSON.parse(stored));
      }
    } catch {
      setOpds(INITIAL_OPD_DATA);
    }
  }, []);

  const saveOpdList = (list: OpdData[]) => {
    setOpds(list);
    if (typeof window !== "undefined") {
      localStorage.setItem("sijakon_opd_list_v1", JSON.stringify(list));
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveOpd = (saved: OpdData) => {
    const existingIndex = opds.findIndex((o) => o.id === saved.id);
    let updated: OpdData[];
    if (existingIndex >= 0) {
      updated = opds.map((o) => (o.id === saved.id ? saved : o));
      showToast(`Satuan Kerja ${saved.kode} berhasil diperbarui.`);
    } else {
      updated = [saved, ...opds];
      showToast(`Satuan Kerja baru ${saved.kode} berhasil ditambahkan.`);
    }
    saveOpdList(updated);
    setIsFormOpen(false);
    setSelectedOpd(null);
  };

  const handleToggleStatus = (opdId: string) => {
    const target = opds.find((o) => o.id === opdId);
    if (!target) return;
    const newStatus = !target.isActive;
    const updated = opds.map((o) => (o.id === opdId ? { ...o, isActive: newStatus } : o));
    saveOpdList(updated);
    showToast(`Status ${target.kode} diubah menjadi ${newStatus ? "Aktif" : "Non-Aktif"}.`);
  };

  const filteredOpds = useMemo(() => {
    return opds.filter((o) => {
      const matchesSearch =
        o.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.kepalaOpd && o.kepalaOpd.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "active" && o.isActive) ||
        (statusFilter === "inactive" && !o.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [opds, searchQuery, statusFilter]);

  const activeCount = opds.filter((o) => o.isActive).length;
  const totalUsers = opds.reduce((acc, curr) => acc + (curr.userCount || 1), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Toast */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: "#0F2E5C",
            color: "#FFFFFF",
            borderLeft: "4px solid #FFC000",
            borderRadius: "10px",
            padding: "12px 20px",
            fontSize: "12px",
            fontWeight: 700,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <CheckCircle2 style={{ width: "16px", height: "16px", color: "#FFC000" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div
        style={{
          borderRadius: "18px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              backgroundColor: "#EBF2FA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Building2 style={{ width: "22px", height: "22px", color: "#0F2E5C" }} />
          </div>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
              Master Satuan Kerja & Organisasi Perangkat Daerah (OPD)
            </h2>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
              Kelola daftar dinas/badan di Kabupaten Bogor untuk isolasi data dan penugasan petugas
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedOpd(null);
            setIsFormOpen(true);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#0F2E5C",
            color: "#FFFFFF",
            padding: "10px 18px",
            borderRadius: "12px",
            border: "none",
            borderBottom: "3px solid #FFC000",
            fontSize: "12px",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(15, 46, 92, 0.2)",
          }}
        >
          <Plus style={{ width: "15px", height: "15px", color: "#FFC000" }} />
          <span>+ Tambah OPD Baru</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
        {[
          { label: "Total OPD Terdaftar", count: opds.length, icon: Building2, color: "#0F2E5C", bg: "#EBF2FA" },
          { label: "OPD Aktif Beroperasi", count: activeCount, icon: CheckCircle2, color: "#16A34A", bg: "#F0FDF4" },
          { label: "Total Petugas Terkait", count: totalUsers, icon: Users, color: "#2563EB", bg: "#EFF6FF" },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              style={{
                borderRadius: "14px",
                border: "1px solid #E2E8F0",
                backgroundColor: "#FFFFFF",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  backgroundColor: kpi.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon style={{ width: "20px", height: "20px", color: kpi.color }} />
              </div>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", display: "block" }}>
                  {kpi.label}
                </span>
                <span style={{ fontSize: "20px", fontWeight: 900, color: "#0F172A" }}>
                  {kpi.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div
        style={{
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", gap: "10px", flex: 1, minWidth: "260px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "14px",
                height: "14px",
                color: "#94A3B8",
              }}
            />
            <input
              type="text"
              placeholder="Cari nama dinas, kode OPD, kepala dinas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                height: "36px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#F8FAFC",
                paddingLeft: "32px",
                paddingRight: "10px",
                fontSize: "11px",
                outline: "none",
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              height: "36px",
              borderRadius: "8px",
              border: "1px solid #CBD5E1",
              backgroundColor: "#F8FAFC",
              padding: "0 10px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#334155",
              outline: "none",
            }}
          >
            <option value="ALL">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Non-Aktif</option>
          </select>
        </div>

        <span style={{ fontSize: "11px", color: "#64748B" }}>
          Menampilkan <strong>{filteredOpds.length}</strong> Satuan Kerja
        </span>
      </div>

      {/* OPD Table */}
      <div
        style={{
          borderRadius: "18px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0", textAlign: "left" }}>
                <th style={{ padding: "12px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px" }}>
                  KODE & NAMA OPD
                </th>
                <th style={{ padding: "12px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px" }}>
                  KEPALA DINAS / BADAN
                </th>
                <th style={{ padding: "12px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px" }}>
                  KONTAK & ALAMAT
                </th>
                <th style={{ padding: "12px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", textAlign: "center" }}>
                  PETUGAS
                </th>
                <th style={{ padding: "12px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", textAlign: "center" }}>
                  STATUS
                </th>
                <th style={{ padding: "12px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", textAlign: "right" }}>
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOpds.map((o, idx) => (
                <tr
                  key={o.id}
                  style={{
                    borderBottom: "1px solid #F1F5F9",
                    backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC",
                  }}
                >
                  {/* Kode & Nama */}
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          backgroundColor: "#0F2E5C",
                          color: "#FFC000",
                          fontSize: "11px",
                          fontWeight: 900,
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontFamily: "monospace",
                        }}
                      >
                        {o.kode}
                      </span>
                      <div>
                        <p style={{ margin: 0, fontWeight: 800, color: "#0F172A", fontSize: "13px" }}>
                          {o.nama}
                        </p>
                        <span style={{ fontSize: "11px", color: "#64748B" }}>
                          Singkatan: {o.namaPendek || o.kode}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Kepala OPD */}
                  <td style={{ padding: "14px 18px" }}>
                    <p style={{ margin: 0, fontWeight: 700, color: "#1E293B" }}>
                      {o.kepalaOpd || "—"}
                    </p>
                    {o.nipKepala && (
                      <span style={{ fontSize: "11px", color: "#64748B", fontFamily: "monospace" }}>
                        NIP: {o.nipKepala}
                      </span>
                    )}
                  </td>

                  {/* Kontak & Alamat */}
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      {o.telepon && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#334155" }}>
                          <Phone style={{ width: "12px", height: "12px", color: "#64748B" }} />
                          <span>{o.telepon}</span>
                        </div>
                      )}
                      {o.alamat && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#64748B" }}>
                          <MapPin style={{ width: "12px", height: "12px", color: "#64748B" }} />
                          <span style={{ maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {o.alamat}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Petugas */}
                  <td style={{ padding: "14px 18px", textAlign: "center" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                        fontWeight: 800,
                        backgroundColor: "#EBF2FA",
                        color: "#0F2E5C",
                        padding: "3px 10px",
                        borderRadius: "9999px",
                      }}
                    >
                      <Users style={{ width: "12px", height: "12px" }} />
                      <span>{o.userCount || 1} Petugas</span>
                    </span>
                  </td>

                  {/* Status */}
                  <td style={{ padding: "14px 18px", textAlign: "center" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "10px",
                        fontWeight: 800,
                        padding: "3px 10px",
                        borderRadius: "9999px",
                        backgroundColor: o.isActive ? "#DCFCE7" : "#FEE2E2",
                        color: o.isActive ? "#166534" : "#991B1B",
                      }}
                    >
                      <span
                        style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          backgroundColor: o.isActive ? "#10B981" : "#EF4444",
                        }}
                      />
                      {o.isActive ? "Aktif" : "Non-Aktif"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "14px 18px", textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOpd(o);
                          setIsFormOpen(true);
                        }}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: "1px solid #CBD5E1",
                          backgroundColor: "#FFFFFF",
                          color: "#0F2E5C",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Edit style={{ width: "12px", height: "12px" }} />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(o.id)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: o.isActive ? "1px solid #FECACA" : "1px solid #BBF7D0",
                          backgroundColor: o.isActive ? "#FEF2F2" : "#F0FDF4",
                          color: o.isActive ? "#B91C1C" : "#166534",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {o.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <OpdFormModal
        isOpen={isFormOpen}
        opd={selectedOpd}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedOpd(null);
        }}
        onSave={handleSaveOpd}
      />
    </div>
  );
}

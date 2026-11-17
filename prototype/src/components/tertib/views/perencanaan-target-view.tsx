"use client";
import React, { useState, useMemo } from "react";
import ModuleHeader from "@/components/layout/module-header";
import PerencanaanSubtabNav from "@/components/tertib/perencanaan-subtab-nav";
import { TertibType, TERTIB_CONFIGS } from "@/lib/tertib-config";
import { mockTargetRecords, TargetRecord } from "@/data/tertib-mock-data";
import { 
  DataTableView, 
  ModalForm, ColumnDef 
} from "@/components/common";
import { 
  Target, Plus, Download, Layers, Calendar, 
  Briefcase, Eye, Edit, Trash2, ArrowUpDown, 
  Search, RotateCcw, AlertTriangle
} from "lucide-react";

interface PerencanaanTargetViewProps {
  tertibType: TertibType;
}

type SortOption = "terkini" | "target-desc" | "target-asc" | "nama";

export default function PerencanaanTargetView({ tertibType }: PerencanaanTargetViewProps) {
  const config = TERTIB_CONFIGS[tertibType];
  const [data, setData] = useState<TargetRecord[]>(
    mockTargetRecords.filter((r) => r.tertibType === tertibType)
  );

  // Filter & Sort State
  const [sortBy, setSortBy] = useState<SortOption>("terkini");
  const [selectedKategori, setSelectedKategori] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingTarget, setEditingTarget] = useState<TargetRecord | null>(null);
  const [deletingTarget, setDeletingTarget] = useState<TargetRecord | null>(null);
  const [detailTarget, setDetailTarget] = useState<TargetRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State Tambah
  const [formIndikator, setFormIndikator] = useState("");
  const [formKategori, setFormKategori] = useState("Legalitas Usaha");
  const [formTarget, setFormTarget] = useState("");
  const [formSatuan, setFormSatuan] = useState("Badan Usaha");
  const [formTahun, setFormTahun] = useState("2026");
  const [formTriwulan, setFormTriwulan] = useState("TW I - IV 2026");
  const [formTanggalPenetapan, setFormTanggalPenetapan] = useState(new Date().toISOString().split("T")[0]);
  const [formKeterangan, setFormKeterangan] = useState("");
  const [formDasarHukum, setFormDasarHukum] = useState("Permen PUPR No. 1/2023");

  // Form State Edit
  const [editIndikator, setEditIndikator] = useState("");
  const [editKategori, setEditKategori] = useState("Legalitas Usaha");
  const [editTarget, setEditTarget] = useState("");
  const [editSatuan, setEditSatuan] = useState("Badan Usaha");
  const [editTahun, setEditTahun] = useState("2026");
  const [editTriwulan, setEditTriwulan] = useState("TW I - IV 2026");
  const [editTanggalPenetapan, setEditTanggalPenetapan] = useState("");
  const [editKeterangan, setEditKeterangan] = useState("");
  const [editDasarHukum, setEditDasarHukum] = useState("");

  // Unique Categories
  const uniqueKategori = useMemo(() => {
    const set = new Set(data.map((d) => d.kategori));
    return Array.from(set);
  }, [data]);

  // Filtered and Sorted Data (Default: Terkini DESC)
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Filter Kategori
    if (selectedKategori !== "all") {
      result = result.filter((d) => d.kategori === selectedKategori);
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((d) => 
        d.indikator.toLowerCase().includes(q) ||
        d.kategori.toLowerCase().includes(q) ||
        (d.keterangan && d.keterangan.toLowerCase().includes(q)) ||
        (d.dasarHukum && d.dasarHukum.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "terkini") {
        const dateA = a.tanggalPenetapan || a.tahun || "";
        const dateB = b.tanggalPenetapan || b.tahun || "";
        if (dateB !== dateA) return dateB.localeCompare(dateA);
        return b.id.localeCompare(a.id);
      }
      if (sortBy === "target-desc") {
        return b.targetKuantitatif - a.targetKuantitatif;
      }
      if (sortBy === "target-asc") {
        return a.targetKuantitatif - b.targetKuantitatif;
      }
      if (sortBy === "nama") {
        return a.indikator.localeCompare(b.indikator);
      }
      return 0;
    });

    return result;
  }, [data, selectedKategori, searchQuery, sortBy]);

  // Planning Calculations (Tanpa metrik realisasi dan capaian)
  const totalVolumeTarget = data.reduce((acc, curr) => acc + curr.targetKuantitatif, 0);
  const totalKategori = uniqueKategori.length;

  // Handler Buka Edit Modal
  const handleOpenEdit = (record: TargetRecord) => {
    setEditingTarget(record);
    setEditIndikator(record.indikator);
    setEditKategori(record.kategori);
    setEditTarget(record.targetKuantitatif.toString());
    setEditSatuan(record.satuan);
    setEditTahun(record.tahun);
    setEditTriwulan(record.triwulan || "TW I - IV 2026");
    setEditTanggalPenetapan(record.tanggalPenetapan || new Date().toISOString().split("T")[0]);
    setEditKeterangan(record.keterangan || "");
    setEditDasarHukum(record.dasarHukum || "Permen PUPR No. 1/2023");
    setShowEditModal(true);
  };

  // Handler Simpan Perubahan Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget) return;

    if (!editIndikator || !editTarget) {
      alert("Mohon isi Nama Target Pengawasan dan Angka Target Kuantitatif!");
      return;
    }

    const targetNum = parseInt(editTarget, 10);
    if (isNaN(targetNum) || targetNum <= 0) {
      alert("Target kuantitatif harus berupa angka positif!");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setData((prev) =>
        prev.map((item) =>
          item.id === editingTarget.id
            ? {
                ...item,
                indikator: editIndikator,
                kategori: editKategori,
                targetKuantitatif: targetNum,
                satuan: editSatuan,
                tahun: editTahun,
                triwulan: editTriwulan,
                tanggalPenetapan: editTanggalPenetapan,
                keterangan: editKeterangan,
                dasarHukum: editDasarHukum
              }
            : item
        )
      );
      setIsSubmitting(false);
      setShowEditModal(false);
      setEditingTarget(null);
    }, 400);
  };

  // Handler Hapus Target
  const handleConfirmDelete = () => {
    if (!deletingTarget) return;
    setData((prev) => prev.filter((item) => item.id !== deletingTarget.id));
    setShowDeleteDialog(false);
    setDeletingTarget(null);
  };

  // Handler Tambah Target Baru (Murni Perencanaan tanpa input realisasi)
  const handleAddTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formIndikator || !formTarget) {
      alert("Mohon isi Nama Target Pengawasan dan Angka Target Kuantitatif!");
      return;
    }

    const targetNum = parseInt(formTarget, 10);
    if (isNaN(targetNum) || targetNum <= 0) {
      alert("Target kuantitatif harus berupa angka positif!");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newRecord: TargetRecord = {
        id: `TGT-${tertibType.substring(7, 9).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        tertibType,
        indikator: formIndikator,
        targetKuantitatif: targetNum,
        satuan: formSatuan,
        tahun: formTahun,
        kategori: formKategori,
        triwulan: formTriwulan,
        tanggalPenetapan: formTanggalPenetapan,
        keterangan: formKeterangan,
        dasarHukum: formDasarHukum
      };

      setData([newRecord, ...data]);
      setIsSubmitting(false);
      setShowModal(false);
      setFormIndikator("");
      setFormTarget("");
      setFormKeterangan("");
    }, 400);
  };

  // Kolom Tabel Target Pengawasan (Standar SIPJAKI - Tanpa kolom Realisasi dan Capaian)
  const columns: ColumnDef<TargetRecord>[] = [
    {
      key: "no",
      label: "NO",
      width: "50px",
      sortable: false,
      render: (_, idx) => <span style={{ fontWeight: 700, color: "#64748B" }}>{idx + 1}</span>
    },
    {
      key: "indikator",
      label: "TARGET PENGAWASAN",
      sortable: true,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C", lineHeight: 1.4 }}>
            {row.indikator}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "#64748B" }}>
            <span style={{ backgroundColor: "#F1F5F9", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
              {row.triwulan || "TW I - IV 2026"}
            </span>
            {row.dasarHukum && (
              <span>• Dasar: <b style={{ color: "#334155" }}>{row.dasarHukum}</b></span>
            )}
          </div>
        </div>
      )
    },
    {
      key: "kategori",
      label: "KATEGORI SASARAN",
      align: "center",
      sortable: true,
      render: (row) => {
        const isLegal = row.kategori.includes("Legalitas") || row.kategori.includes("Kontrak");
        const isSmkk = row.kategori.includes("SMKK") || row.kategori.includes("Keselamatan");
        const isSbu = row.kategori.includes("SBU") || row.kategori.includes("SDM") || row.kategori.includes("TKK");
        
        const bg = isLegal ? "#EBF2FA" : isSmkk ? "#FEF3C7" : isSbu ? "#DCFCE7" : "#F3E8FF";
        const color = isLegal ? "#0F2E5C" : isSmkk ? "#92400E" : isSbu ? "#166534" : "#6B21A8";

        return (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              backgroundColor: bg,
              color: color,
              padding: "4px 10px",
              borderRadius: "9999px",
              display: "inline-block",
              whiteSpace: "nowrap"
            }}
          >
            {row.kategori}
          </span>
        );
      }
    },
    {
      key: "targetKuantitatif",
      label: "TARGET KUANTITATIF",
      align: "center",
      sortable: true,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span style={{ fontSize: "14px", fontWeight: 900, color: "#0F2E5C" }}>
            {row.targetKuantitatif.toLocaleString("id-ID")}
          </span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}>
            {row.satuan}
          </span>
        </div>
      )
    },
    {
      key: "tahun",
      label: "TAHUN ANGGARAN",
      align: "center",
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: "12px", fontWeight: 800, color: "#1E293B", backgroundColor: "#F8FAFC", padding: "4px 8px", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
          TA {row.tahun}
        </span>
      )
    },
    {
      key: "tanggalPenetapan",
      label: "WAKTU PENETAPAN",
      align: "center",
      sortable: true,
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", fontSize: "11px", fontWeight: 700, color: "#475569" }}>
          <Calendar style={{ width: "12px", height: "12px", color: "#2563EB" }} />
          <span>{row.tanggalPenetapan || `${row.tahun}-01-15`}</span>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header (Tanpa tulisan Bogor dan tanpa kata IKU) */}
      <ModuleHeader
        breadcrumbs={[
          { label: config.shortTitle, href: config.basePath },
          { label: "Perencanaan", href: `${config.basePath}/perencanaan` },
          { label: "Target Pengawasan" }
        ]}
        badgeText={config.pilar}
        badgeBg={config.badgeBg}
        badgeColor={config.badgeColor}
        title={`Target Pengawasan — ${config.shortTitle}`}
        description="Penetapan target kuantitatif tahunan pengawasan tertib jasa konstruksi standar SIPJAKI Kementerian PUPR."
        legalBasis={config.legalBasis}
        actionButtons={[
          {
            label: "Tambah Target Pengawasan",
            icon: Plus,
            variant: "primary",
            onClick: () => setShowModal(true)
          },
          {
            label: "Unduh Target Pengawasan (PDF)",
            icon: Download,
            onClick: () => alert("Mengunduh Dokumen Penetapan Target Pengawasan Standar SIPJAKI TA 2026...")
          }
        ]}
      />

      {/* Subtab Navigation */}
      <PerencanaanSubtabNav tertibType={tertibType} activeSubtab="target" />

      {/* 4 Summary Stat Cards Murni Perencanaan (Tanpa Realisasi & Capaian) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        {/* Card 1: Total Sasaran Pengawasan */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #0F2E5C",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Total Sasaran Pengawasan
            </span>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#EBF2FA",
                color: "#0F2E5C",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <Target style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#0F2E5C", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {data.length} Sasaran
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#0F2E5C" }} />
              <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 700 }}>
                Target Pengawasan Terjadwal
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Volume Fisik Target */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #2563EB",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Total Volume Objek Target
            </span>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#DBEAFE",
                color: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <Layers style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#2563EB", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {totalVolumeTarget.toLocaleString("id-ID")} Unit/Objek
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#2563EB" }} />
              <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 700 }}>
                Akumulasi Volume Fisik RKA
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Klaster Kategori Pengawasan */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #059669",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Klaster Kategori
            </span>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#DCFCE7",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <Briefcase style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#059669", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {totalKategori} Kategori Sasaran
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#059669" }} />
              <span style={{ fontSize: "11px", color: "#059669", fontWeight: 700 }}>
                Cakupan Standar Teknis SIPJAKI
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Periode Tahun Perencanaan */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #D97706",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Tahun Anggaran
            </span>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#FEF3C7",
                color: "#D97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <Calendar style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#D97706", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              TA 2026
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#D97706" }} />
              <span style={{ fontSize: "11px", color: "#D97706", fontWeight: 700 }}>
                Rencana Kerja Operasional Aktif
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar Filter & Sort Pengurutan Terkini (Default DESC) */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "14px",
          padding: "14px 18px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 2px 8px rgba(15, 46, 92, 0.03)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px"
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", flex: 1 }}>
          {/* Search Box */}
          <div style={{ position: "relative", minWidth: "220px", flex: "1 1 220px", maxWidth: "340px" }}>
            <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "#94A3B8" }} />
            <input
              type="text"
              placeholder="Cari target sasaran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                height: "36px",
                paddingLeft: "32px",
                paddingRight: "12px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "12px",
                outline: "none"
              }}
            />
          </div>

          {/* Filter Kategori */}
          <div style={{ minWidth: "160px" }}>
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              style={{
                width: "100%",
                height: "36px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                padding: "0 10px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#1E293B",
                backgroundColor: "#FFFFFF",
                outline: "none"
              }}
            >
              <option value="all">Semua Kategori</option>
              {uniqueKategori.map((kat) => (
                <option key={kat} value={kat}>{kat}</option>
              ))}
            </select>
          </div>

          {/* Selector Urutan (Default: Terkini DESC) */}
          <div style={{ minWidth: "230px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>
              Urutan:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              style={{
                height: "36px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                padding: "0 10px",
                fontSize: "12px",
                fontWeight: 700,
                color: "#0F2E5C",
                backgroundColor: "#F8FAFC",
                outline: "none"
              }}
            >
              <option value="terkini">Target Terkini (Default - DESC)</option>
              <option value="target-desc">Target Terbanyak</option>
              <option value="target-asc">Target Terendah</option>
              <option value="nama">Nama Target (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Badges & Reset Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {sortBy === "terkini" && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "#1E40AF",
                backgroundColor: "#DBEAFE",
                border: "1px solid #BFDBFE",
                padding: "5px 10px",
                borderRadius: "6px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <ArrowUpDown style={{ width: "12px", height: "12px" }} />
              <span>Target Pengawasan Terkini (DESC)</span>
            </span>
          )}

          {(searchQuery || selectedKategori !== "all" || sortBy !== "terkini") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedKategori("all");
                setSortBy("terkini");
              }}
              style={{
                height: "36px",
                padding: "0 12px",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                backgroundColor: "#F1F5F9",
                color: "#475569",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <RotateCcw style={{ width: "12px", height: "12px" }} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabel DataTableView (Header EDIT, Tombol Aksi Baku, Tanpa kolom Realisasi) */}
      <DataTableView<TargetRecord>
        title={`Daftar Target Sasaran Pengawasan (${filteredAndSortedData.length} Sasaran Terjadwal)`}
        subtitle="Rincian kuantitatif sasaran target pengawasan tahunan standar SIPJAKI Kementerian PUPR"
        data={filteredAndSortedData}
        columns={columns}
        defaultPageSize={10}
        exportFileName={`Target_Pengawasan_${tertibType}`}
        actionsHeader="EDIT"
        actionsRender={(row) => (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            {/* Tombol 1: Detail Sasaran (Abu-abu Netral) */}
            <button
              type="button"
              title="Lihat Detail Target Sasaran"
              onClick={() => {
                setDetailTarget(row);
                setShowDetailModal(true);
              }}
              style={{
                padding: "5px 8px",
                borderRadius: "6px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#F8FAFC",
                color: "#334155",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <Eye style={{ width: "13px", height: "13px" }} />
              <span className="hidden sm:inline">Detail</span>
            </button>

            {/* Tombol 2: Edit Target (Kuning Amber) */}
            <button
              type="button"
              title="Ubah Target Sasaran Pengawasan"
              onClick={() => handleOpenEdit(row)}
              style={{
                padding: "5px 8px",
                borderRadius: "6px",
                border: "1px solid #FCD34D",
                backgroundColor: "#FEF3C7",
                color: "#B45309",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <Edit style={{ width: "13px", height: "13px" }} />
              <span className="hidden sm:inline">Edit</span>
            </button>

            {/* Tombol 3: Hapus Target (Merah) */}
            <button
              type="button"
              title="Hapus Target Sasaran Pengawasan"
              onClick={() => {
                setDeletingTarget(row);
                setShowDeleteDialog(true);
              }}
              style={{
                padding: "5px 8px",
                borderRadius: "6px",
                border: "1px solid #FCA5A5",
                backgroundColor: "#FEE2E2",
                color: "#991B1B",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <Trash2 style={{ width: "13px", height: "13px" }} />
              <span className="hidden sm:inline">Hapus</span>
            </button>
          </div>
        )}
      />

      {/* Modal Form Tambah Sasaran Baru (Murni Perencanaan tanpa input realisasi) */}
      <ModalForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Tambah Target Pengawasan Baru"
        subtitle={`Input penetapan target pengawasan tahunan standar SIPJAKI untuk ${config.shortTitle}`}
        onSubmit={handleAddTarget}
        submitLabel="Simpan Target Pengawasan"
        isLoading={isSubmitting}
        size="lg"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Nama Target Pengawasan */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
              Nama Target Pengawasan <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Pemeriksaan Legalitas Izin Usaha, NIB & SBU BUJK Kualifikasi Kecil"
              value={formIndikator}
              onChange={(e) => setFormIndikator(e.target.value)}
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

          {/* Grid Kategori & Satuan */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Kategori Sasaran
              </label>
              <select
                value={formKategori}
                onChange={(e) => setFormKategori(e.target.value)}
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
                <option value="Legalitas Usaha">Legalitas Usaha</option>
                <option value="SBU & Kompetensi">SBU & Kompetensi</option>
                <option value="SDM & TKK">SDM & TKK</option>
                <option value="SMKK & Keselamatan">SMKK & Keselamatan</option>
                <option value="Kontrak Kerja">Kontrak Kerja</option>
                <option value="Pengendalian Mutu">Pengendalian Mutu</option>
                <option value="Proses Pemilihan">Proses Pemilihan</option>
                <option value="Laik Fungsi & SLF">Laik Fungsi & SLF</option>
                <option value="Operasi & Pemeliharaan">Operasi & Pemeliharaan</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Satuan Kuantitatif
              </label>
              <select
                value={formSatuan}
                onChange={(e) => setFormSatuan(e.target.value)}
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
                <option value="Badan Usaha">Badan Usaha (BUJK)</option>
                <option value="Paket Pekerjaan">Paket Pekerjaan (Proyek)</option>
                <option value="Tenaga Kerja (TKK)">Tenaga Kerja (TKK)</option>
                <option value="Bangunan Publik">Bangunan Publik</option>
                <option value="Bangunan Gedung">Bangunan Gedung</option>
                <option value="Infrastruktur">Infrastruktur (Jalan/Jembatan)</option>
                <option value="Daerah Irigasi">Daerah Irigasi</option>
              </select>
            </div>
          </div>

          {/* Grid Target & Tahun */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Target Kuantitatif <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="Contoh: 50"
                value={formTarget}
                onChange={(e) => setFormTarget(e.target.value)}
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
                Tahun Anggaran Sasaran
              </label>
              <input
                type="text"
                value={formTahun}
                onChange={(e) => setFormTahun(e.target.value)}
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

          {/* Grid Jadwal Triwulan & Waktu Penetapan */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Jadwal Pengawasan (Triwulan)
              </label>
              <select
                value={formTriwulan}
                onChange={(e) => setFormTriwulan(e.target.value)}
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
                <option value="TW I - IV 2026">TW I - IV 2026 (Tahunan Penuh)</option>
                <option value="TW I - II 2026">TW I - II 2026 (Semester 1)</option>
                <option value="TW III - IV 2026">TW III - IV 2026 (Semester 2)</option>
                <option value="TW I 2026">TW I 2026</option>
                <option value="TW II 2026">TW II 2026</option>
                <option value="TW III 2026">TW III 2026</option>
                <option value="TW IV 2026">TW IV 2026</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Tanggal Penetapan Target
              </label>
              <input
                type="date"
                value={formTanggalPenetapan}
                onChange={(e) => setFormTanggalPenetapan(e.target.value)}
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

          {/* Dasar Hukum */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
              Dasar Hukum Regulasi
            </label>
            <input
              type="text"
              placeholder="Contoh: Permen PUPR No. 1/2023 Pasal 5"
              value={formDasarHukum}
              onChange={(e) => setFormDasarHukum(e.target.value)}
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

          {/* Keterangan */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
              Keterangan Lingkup Target
            </label>
            <textarea
              rows={2}
              placeholder="Catatan prioritas target sasaran pengawasan..."
              value={formKeterangan}
              onChange={(e) => setFormKeterangan(e.target.value)}
              style={{
                width: "100%",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                padding: "8px 12px",
                fontSize: "12px",
                outline: "none",
                resize: "vertical"
              }}
            />
          </div>
        </div>
      </ModalForm>

      {/* Modal Form Edit Target Pengawasan */}
      <ModalForm
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTarget(null);
        }}
        title="Ubah Target Pengawasan"
        subtitle={`Perbarui parameter target pengawasan untuk ${config.shortTitle}`}
        onSubmit={handleSaveEdit}
        submitLabel="Simpan Perubahan Target"
        isLoading={isSubmitting}
        size="lg"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Nama Target Pengawasan */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
              Nama Target Pengawasan <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              value={editIndikator}
              onChange={(e) => setEditIndikator(e.target.value)}
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

          {/* Grid Kategori & Satuan */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Kategori Sasaran
              </label>
              <select
                value={editKategori}
                onChange={(e) => setEditKategori(e.target.value)}
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
                <option value="Legalitas Usaha">Legalitas Usaha</option>
                <option value="SBU & Kompetensi">SBU & Kompetensi</option>
                <option value="SDM & TKK">SDM & TKK</option>
                <option value="SMKK & Keselamatan">SMKK & Keselamatan</option>
                <option value="Kontrak Kerja">Kontrak Kerja</option>
                <option value="Pengendalian Mutu">Pengendalian Mutu</option>
                <option value="Proses Pemilihan">Proses Pemilihan</option>
                <option value="Laik Fungsi & SLF">Laik Fungsi & SLF</option>
                <option value="Operasi & Pemeliharaan">Operasi & Pemeliharaan</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Satuan Kuantitatif
              </label>
              <select
                value={editSatuan}
                onChange={(e) => setEditSatuan(e.target.value)}
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
                <option value="Badan Usaha">Badan Usaha (BUJK)</option>
                <option value="Paket Pekerjaan">Paket Pekerjaan (Proyek)</option>
                <option value="Tenaga Kerja (TKK)">Tenaga Kerja (TKK)</option>
                <option value="Bangunan Publik">Bangunan Publik</option>
                <option value="Bangunan Gedung">Bangunan Gedung</option>
                <option value="Infrastruktur">Infrastruktur (Jalan/Jembatan)</option>
                <option value="Daerah Irigasi">Daerah Irigasi</option>
              </select>
            </div>
          </div>

          {/* Grid Target & Tahun */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Target Kuantitatif <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={editTarget}
                onChange={(e) => setEditTarget(e.target.value)}
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
                Tahun Anggaran Sasaran
              </label>
              <input
                type="text"
                value={editTahun}
                onChange={(e) => setEditTahun(e.target.value)}
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

          {/* Grid Jadwal Triwulan & Waktu Penetapan */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Jadwal Pengawasan (Triwulan)
              </label>
              <select
                value={editTriwulan}
                onChange={(e) => setEditTriwulan(e.target.value)}
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
                <option value="TW I - IV 2026">TW I - IV 2026 (Tahunan Penuh)</option>
                <option value="TW I - II 2026">TW I - II 2026 (Semester 1)</option>
                <option value="TW III - IV 2026">TW III - IV 2026 (Semester 2)</option>
                <option value="TW I 2026">TW I 2026</option>
                <option value="TW II 2026">TW II 2026</option>
                <option value="TW III 2026">TW III 2026</option>
                <option value="TW IV 2026">TW IV 2026</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Tanggal Penetapan Target
              </label>
              <input
                type="date"
                value={editTanggalPenetapan}
                onChange={(e) => setEditTanggalPenetapan(e.target.value)}
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

          {/* Dasar Hukum */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
              Dasar Hukum Regulasi
            </label>
            <input
              type="text"
              value={editDasarHukum}
              onChange={(e) => setEditDasarHukum(e.target.value)}
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

          {/* Keterangan */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
              Keterangan Lingkup Target
            </label>
            <textarea
              rows={2}
              value={editKeterangan}
              onChange={(e) => setEditKeterangan(e.target.value)}
              style={{
                width: "100%",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                padding: "8px 12px",
                fontSize: "12px",
                outline: "none",
                resize: "vertical"
              }}
            />
          </div>
        </div>
      </ModalForm>

      {/* Detail Modal */}
      {showDetailModal && detailTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              padding: "24px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#EBF2FA", color: "#0F2E5C", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Target style={{ width: "20px", height: "20px" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F2E5C", margin: 0 }}>
                    Detail Target Pengawasan
                  </h3>
                  <span style={{ fontSize: "11px", color: "#64748B" }}>
                    ID: {detailTarget.id} • TA {detailTarget.tahun}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  fontWeight: 700,
                  cursor: "pointer",
                  color: "#64748B"
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
              <div style={{ backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>
                  Nama Target
                </span>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", fontWeight: 800, color: "#0F2E5C" }}>
                  {detailTarget.indikator}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ backgroundColor: "#F8FAFC", padding: "10px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748B" }}>Kategori Sasaran</span>
                  <p style={{ margin: "4px 0 0 0", fontWeight: 700, color: "#1E293B" }}>{detailTarget.kategori}</p>
                </div>
                <div style={{ backgroundColor: "#F8FAFC", padding: "10px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748B" }}>Target Kuantitatif</span>
                  <p style={{ margin: "4px 0 0 0", fontWeight: 900, color: "#0F2E5C" }}>{detailTarget.targetKuantitatif} {detailTarget.satuan}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ backgroundColor: "#F8FAFC", padding: "10px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748B" }}>Jadwal Pengawasan</span>
                  <p style={{ margin: "4px 0 0 0", fontWeight: 700, color: "#1E293B" }}>{detailTarget.triwulan || "TW I - IV 2026"}</p>
                </div>
                <div style={{ backgroundColor: "#F8FAFC", padding: "10px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748B" }}>Waktu Penetapan</span>
                  <p style={{ margin: "4px 0 0 0", fontWeight: 700, color: "#1E293B" }}>{detailTarget.tanggalPenetapan || "2026-01-15"}</p>
                </div>
              </div>

              {detailTarget.dasarHukum && (
                <div style={{ backgroundColor: "#F8FAFC", padding: "10px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748B" }}>Dasar Hukum</span>
                  <p style={{ margin: "4px 0 0 0", fontWeight: 700, color: "#1E293B" }}>{detailTarget.dasarHukum}</p>
                </div>
              )}

              {detailTarget.keterangan && (
                <div style={{ backgroundColor: "#F8FAFC", padding: "10px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748B" }}>Keterangan Prioritas</span>
                  <p style={{ margin: "4px 0 0 0", color: "#475569" }}>{detailTarget.keterangan}</p>
                </div>
              )}
            </div>

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  backgroundColor: "#0F2E5C",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safety Confirmation Dialog Hapus Target */}
      {showDeleteDialog && deletingTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              padding: "24px"
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "#FEE2E2",
                  color: "#DC2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <AlertTriangle style={{ width: "24px", height: "24px" }} />
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: "0 0 6px 0" }}>
                  Konfirmasi Hapus Target Pengawasan
                </h3>
                <p style={{ fontSize: "13px", color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                  Apakah Anda yakin ingin menghapus sasaran target pengawasan:
                  <strong style={{ display: "block", color: "#0F2E5C", marginTop: "4px" }}>
                    {deletingTarget.indikator}
                  </strong>
                  <span style={{ fontSize: "11px", color: "#64748B" }}>
                    Target: {deletingTarget.targetKuantitatif} {deletingTarget.satuan} • Kategori: {deletingTarget.kategori}
                  </span>
                </p>
                <p style={{ fontSize: "11px", color: "#DC2626", marginTop: "8px", fontWeight: 600 }}>
                  Tindakan ini akan menghapus target sasaran dari dokumen perencanaan.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeletingTarget(null);
                }}
                style={{
                  padding: "9px 16px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#FFFFFF",
                  color: "#475569",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{
                  padding: "9px 18px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#DC2626",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                Ya, Hapus Sasaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
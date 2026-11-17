"use client";
import React, { useState, useEffect, useMemo } from "react";
import ModuleHeader from "@/components/layout/module-header";
import PerencanaanSubtabNav from "@/components/tertib/perencanaan-subtab-nav";
import { TertibType, TERTIB_CONFIGS } from "@/lib/tertib-config";
import { mockAnggaranRecords, AnggaranRecord } from "@/data/tertib-mock-data";
import {
  StatusBadge, FileUploader, DataTableView,
  ModalForm, ColumnDef, BatchImportModal,
  DocStatusBadge, DocumentUploadMiniModal, DocCompletionBar
} from "@/components/common";
import { 
  Wallet, Plus, Download, FileText, CheckCircle2, 
  Coins, Eye, FileSpreadsheet, Edit, Trash2, 
  MapPin, AlertTriangle, X, Calendar, ArrowUpDown, 
  Search, RotateCcw
} from "lucide-react";
import { TEMPLATE_PERENCANAAN_ANGGARAN } from "@/lib/sipjaki-templates";
import { logDataActivity } from "@/lib/audit-log";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface PerencanaanAnggaranViewProps {
  tertibType: TertibType;
}

type SortOption = "terkini" | "pagu-desc" | "pagu-asc" | "nama";

export default function PerencanaanAnggaranView({ tertibType }: PerencanaanAnggaranViewProps) {
  const config = TERTIB_CONFIGS[tertibType];
  const [data, setData] = useState<AnggaranRecord[]>(() =>
    mockAnggaranRecords.filter((r) => r.tertibType === tertibType).map((r) => ({
      ...r,
      wilayah: r.wilayah || "Kabupaten Bogor (40 Kecamatan)",
      _docStatus: r._docStatus || "complete"
    }))
  );

  // Filter & Sort State (Default: Terkini DESC)
  const [sortBy, setSortBy] = useState<SortOption>("terkini");
  const [filterSumberDana, setFilterSumberDana] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDocPending, setFilterDocPending] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isBatchImportOpen, setIsBatchImportOpen] = useState(false);
  const [docUploadTarget, setDocUploadTarget] = useState<AnggaranRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail Modal State
  const [detailRecord, setDetailRecord] = useState<AnggaranRecord | null>(null);

  // Edit Modal State (Standar SIPJAKI: Fitur Edit)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AnggaranRecord | null>(null);
  const [editProgram, setEditProgram] = useState("");
  const [editWilayah, setEditWilayah] = useState("");
  const [editTahun, setEditTahun] = useState("2026");
  const [editPagu, setEditPagu] = useState("");
  const [editSumberDana, setEditSumberDana] = useState<"APBD Kab. Bogor" | "DAK Fisik" | "Bantuan Keuangan Provinsi">("APBD Kab. Bogor");
  const [editStatus, setEditStatus] = useState<"Disetujui" | "Revisi" | "Usulan">("Disetujui");
  const [editTanggalPenetapan, setEditTanggalPenetapan] = useState("");
  const [editKeterangan, setEditKeterangan] = useState("");

  // Delete Confirmation State (Standar SIPJAKI: Fitur Hapus)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<AnggaranRecord | null>(null);

  // Form State Tambah
  const [formProgram, setFormProgram] = useState("");
  const [formWilayah, setFormWilayah] = useState("Seluruh Wilayah (40 Kecamatan)");
  const [formTahun, setFormTahun] = useState("2026");
  const [formPagu, setFormPagu] = useState("");
  const [formSumberDana, setFormSumberDana] = useState<"APBD Kab. Bogor" | "DAK Fisik" | "Bantuan Keuangan Provinsi">("APBD Kab. Bogor");
  const [formStatus, setFormStatus] = useState<"Disetujui" | "Revisi" | "Usulan">("Disetujui");
  const [formTanggalPenetapan, setFormTanggalPenetapan] = useState(new Date().toISOString().split("T")[0]);
  const [formKeterangan, setFormKeterangan] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Hybrid Dual-Engine: Cek koneksi Supabase Cloud
  useEffect(() => {
    async function loadSupabaseAnggaran() {
      if (!isSupabaseConfigured()) return;
      try {
        const supabase = createClient();
        if (!supabase) return;
        const { data: dbData, error } = await supabase
          .from("pengawasan_anggaran_perencanaan")
          .select("*")
          .eq("tertib_type", tertibType);

        if (!error && dbData && dbData.length > 0) {
          const mapped: AnggaranRecord[] = dbData.map((row: any) => ({
            id: row.id,
            tertibType: row.tertib_type,
            wilayah: row.wilayah || "Kabupaten Bogor (40 Kecamatan)",
            program: row.program,
            tahun: row.tahun,
            paguAnggaran: Number(row.pagu_anggaran),
            sumberDana: row.sumber_dana,
            dokumenRka: row.dokumen_rka || row.dokumen || "",
            dokumen: row.dokumen_rka || row.dokumen || "",
            status: row.status,
            tanggalPenetapan: row.tanggal_penetapan || row.created_at?.split("T")[0] || "2026-03-24",
            keterangan: row.keterangan || "",
            _docStatus: (row.dokumen_rka || row.dokumen) ? "complete" : "pending"
          }));
          setData(mapped);
        }
      } catch (err) {
        console.warn("Supabase query fallback to mock data:", err);
      }
    }
    loadSupabaseAnggaran();
  }, [tertibType]);

  // Filtered and Sorted Data (Default: Terkini DESC)
  const filteredAndSortedData = useMemo(() => {
    let result = data.filter((item) => {
      const matchSumber = filterSumberDana === "Semua" || item.sumberDana === filterSumberDana;
      const matchSearch = item.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.sumberDana.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.wilayah && item.wilayah.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchDoc = !filterDocPending || item._docStatus === "pending" || !(item.dokumenRka || item.dokumen);
      return matchSumber && matchSearch && matchDoc;
    });

    result.sort((a, b) => {
      if (sortBy === "terkini") {
        const dateA = a.tanggalPenetapan || a.tahun || "";
        const dateB = b.tanggalPenetapan || b.tahun || "";
        if (dateB !== dateA) return dateB.localeCompare(dateA);
        return b.id.localeCompare(a.id);
      }
      if (sortBy === "pagu-desc") {
        return b.paguAnggaran - a.paguAnggaran;
      }
      if (sortBy === "pagu-asc") {
        return a.paguAnggaran - b.paguAnggaran;
      }
      if (sortBy === "nama") {
        return a.program.localeCompare(b.program);
      }
      return 0;
    });

    return result;
  }, [data, filterSumberDana, searchQuery, filterDocPending, sortBy]);

  // Planning Calculations (Murni Perencanaan tanpa realisasi dan serapan)
  const totalPagu = data.reduce((acc, curr) => acc + curr.paguAnggaran, 0);
  const uniqueSumberDana = Array.from(new Set(data.map((d) => d.sumberDana))).length;

  const handleBatchCommit = (parsedRows: any[]) => {
    const formatted: AnggaranRecord[] = parsedRows.map((row, idx) => ({
      id: `ANG-${Date.now().toString().slice(-4)}-${idx + 1}`,
      tertibType,
      wilayah: row.wilayah || "Kabupaten Bogor (40 Kecamatan)",
      program: row.program || "Program Pengawasan Tertib Konstruksi",
      tahun: String(row.tahun || "2026"),
      paguAnggaran: Number(String(row.paguAnggaran || 0).replace(/\D/g, "")) || 100000000,
      sumberDana: (row.sumberDana as any) || "APBD Kab. Bogor",
      dokumenRka: row.dokumenRka || "",
      dokumen: row.dokumenRka || "",
      status: "Disetujui",
      tanggalPenetapan: new Date().toISOString().split("T")[0],
      _docStatus: row._docStatus || "pending"
    }));
    setData([...formatted, ...data]);
    alert(`Berhasil mengimpor ${formatted.length} data alokasi anggaran! Berkas dokumen dapat diunggah menyusul.`);
  };

  const handleSaveUploadedDoc = (files: Record<string, File | null>, fileNames: Record<string, string>) => {
    if (!docUploadTarget) return;
    const newDocName = fileNames["dokumenRka"] || docUploadTarget.dokumenRka || `Dokumen_Anggaran_${docUploadTarget.tahun}_${docUploadTarget.id}.pdf`;
    setData((prev) =>
      prev.map((item) => {
        if (item.id === docUploadTarget.id) {
          return {
            ...item,
            dokumenRka: newDocName,
            dokumen: newDocName,
            _docStatus: "complete"
          };
        }
        return item;
      })
    );
    setDocUploadTarget(null);
  };

  // Handler Tambah Anggaran Baru (Tanpa input realisasi)
  const handleAddAnggaran = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProgram || !formPagu) {
      alert("Mohon isi Nama Program dan Jumlah Pagu Anggaran!");
      return;
    }

    const paguNum = parseInt(formPagu.replace(/\D/g, ""), 10);
    if (isNaN(paguNum) || paguNum <= 0) {
      alert("Nominal pagu anggaran harus berupa angka positif!");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const docName = uploadedFile ? uploadedFile.name : `Dokumen_Anggaran_${config.shortTitle.replace(/\s+/g, "_")}_${formTahun}.pdf`;
      const newRecord: AnggaranRecord = {
        id: `ANG-${Date.now().toString().slice(-4)}`,
        tertibType,
        wilayah: formWilayah || "Kabupaten Bogor (40 Kecamatan)",
        program: formProgram,
        tahun: formTahun,
        paguAnggaran: paguNum,
        sumberDana: formSumberDana,
        dokumenRka: docName,
        dokumen: docName,
        status: formStatus,
        tanggalPenetapan: formTanggalPenetapan,
        keterangan: formKeterangan,
        _docStatus: uploadedFile ? "complete" : "pending"
      };

      setData([newRecord, ...data]);
      setIsSubmitting(false);
      setShowModal(false);
      setFormProgram("");
      setFormPagu("");
      setFormKeterangan("");
      setUploadedFile(null);

      alert(`Alokasi anggaran "${formProgram}" sebesar Rp ${paguNum.toLocaleString('id-ID')} berhasil disimpan!`);
    }, 400);
  };

  // Handler Buka Modal Edit
  const handleOpenEdit = (row: AnggaranRecord) => {
    setEditingRecord(row);
    setEditProgram(row.program);
    setEditWilayah(row.wilayah || "Kabupaten Bogor (40 Kecamatan)");
    setEditTahun(row.tahun || "2026");
    setEditPagu(String(row.paguAnggaran));
    setEditSumberDana(row.sumberDana);
    setEditStatus(row.status);
    setEditTanggalPenetapan(row.tanggalPenetapan || new Date().toISOString().split("T")[0]);
    setEditKeterangan(row.keterangan || "");
    setShowEditModal(true);
  };

  // Handler Simpan Perubahan Edit (Tanpa input realisasi)
  const handleSaveEditAnggaran = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !editProgram || !editPagu) {
      alert("Mohon lengkapi Nama Program dan Pagu Anggaran!");
      return;
    }

    const paguNum = parseInt(editPagu.replace(/\D/g, ""), 10);
    if (isNaN(paguNum) || paguNum <= 0) {
      alert("Nominal pagu anggaran harus berupa angka positif!");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setData((prev) =>
        prev.map((item) => {
          if (item.id === editingRecord.id) {
            return {
              ...item,
              program: editProgram,
              wilayah: editWilayah,
              tahun: editTahun,
              paguAnggaran: paguNum,
              sumberDana: editSumberDana,
              status: editStatus,
              tanggalPenetapan: editTanggalPenetapan,
              keterangan: editKeterangan
            };
          }
          return item;
        })
      );

      setIsSubmitting(false);
      setShowEditModal(false);
      setEditingRecord(null);
      alert(`Alokasi anggaran "${editProgram}" berhasil diperbarui!`);
    }, 400);
  };

  // Handler Buka Dialog Konfirmasi Hapus
  const handleOpenDelete = (row: AnggaranRecord) => {
    setDeletingRecord(row);
    setShowDeleteConfirm(true);
  };

  // Handler Eksekusi Hapus Data
  const handleConfirmDelete = () => {
    if (!deletingRecord) return;
    setData((prev) => prev.filter((item) => item.id !== deletingRecord.id));
    setShowDeleteConfirm(false);
    setDeletingRecord(null);
  };

  // Kolom Tabel Standar SIPJAKI (Tanpa kolom Realisasi dan % Serapan)
  const columns: ColumnDef<AnggaranRecord>[] = [
    {
      key: "no",
      label: "NO",
      width: "45px",
      sortable: false,
      render: (_, idx) => <span style={{ fontWeight: 700, color: "#64748B" }}>{idx + 1}</span>
    },
    {
      key: "program",
      label: "PROGRAM & SUB-KEGIATAN",
      sortable: true,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C", lineHeight: 1.4 }}>
            {row.program}
          </span>
          <span style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
            Sub-Kegiatan Pengawasan Jasa Konstruksi
          </span>
        </div>
      )
    },
    {
      key: "wilayah",
      label: "WILAYAH & TAHUN",
      sortable: true,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#1E293B", display: "flex", alignItems: "center", gap: "4px" }}>
            <MapPin style={{ width: "12px", height: "12px", color: "#2563EB", flexShrink: 0 }} />
            {row.wilayah || "Kabupaten Bogor"}
          </span>
          <span style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
            Tahun Anggaran {row.tahun}
          </span>
        </div>
      )
    },
    {
      key: "paguAnggaran",
      label: "PAGU ANGGARAN",
      align: "right",
      sortable: true,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <span style={{ fontSize: "14px", fontWeight: 900, color: "#0F2E5C", whiteSpace: "nowrap" }}>
            Rp {row.paguAnggaran.toLocaleString('id-ID')}
          </span>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748B" }}>
            Plafon Alokasi DPA
          </span>
        </div>
      )
    },
    {
      key: "sumberDana",
      label: "SUMBER DANA",
      sortable: true,
      render: (row) => (
        <span
          style={{
            fontSize: "11px",
            fontWeight: 800,
            padding: "3px 8px",
            borderRadius: "6px",
            backgroundColor: "#EBF2FA",
            color: "#0F2E5C",
            whiteSpace: "nowrap"
          }}
        >
          {row.sumberDana}
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
          <span>{row.tanggalPenetapan || "2026-01-15"}</span>
        </div>
      )
    },
    {
      key: "dokumenRka",
      label: "DOKUMEN",
      sortable: false,
      render: (row) => (
        <DocStatusBadge
          status={row._docStatus || (row.dokumenRka || row.dokumen ? "complete" : "pending")}
          fileName={row.dokumenRka || row.dokumen}
          documentLabel="Dokumen Penganggaran"
          onClick={() => setDocUploadTarget(row)}
        />
      )
    },
    {
      key: "status",
      label: "STATUS",
      align: "center",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} size="sm" showDot />
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header (Tanpa tulisan RKA Dinas PUPR & tanpa kata realisasi) */}
      <ModuleHeader
        breadcrumbs={[
          { label: config.shortTitle, href: config.basePath },
          { label: "Perencanaan", href: `${config.basePath}/perencanaan` },
          { label: "Anggaran Pengawasan" }
        ]}
        badgeText={config.pilar}
        badgeBg={config.badgeBg}
        badgeColor={config.badgeColor}
        title={`Alokasi Anggaran Pengawasan — ${config.shortTitle}`}
        description="Penetapan plafon dan pos alokasi pagu anggaran tahunan pengawasan tertib jasa konstruksi standar SIPJAKI Kementerian PUPR."
        legalBasis={config.legalBasis}
        actionButtons={[
          {
            label: "Tambah Pos Anggaran",
            icon: Plus,
            variant: "primary",
            onClick: () => setShowModal(true)
          },
          {
            label: "Unduh Anggaran (PDF)",
            icon: Download,
            onClick: () => alert("Mengunduh Rekapitulasi Alokasi Anggaran Pengawasan Standar SIPJAKI TA 2026...")
          }
        ]}
      />

      {/* Subtab Navigation */}
      <PerencanaanSubtabNav tertibType={tertibType} activeSubtab="anggaran" />

      {/* 4 Summary Stat Cards Murni Perencanaan (Tanpa Realisasi & Serapan Belanja) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        {/* Card 1: Total Pagu Anggaran */}
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
              Total Pagu Anggaran
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
              <Wallet style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "#0F2E5C", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              Rp {totalPagu.toLocaleString('id-ID')}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#0F2E5C" }} />
              <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 700 }}>
                {data.length} Pos Anggaran Terdaftar
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Pos Anggaran */}
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
              Total Pos Kegiatan
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
              <FileText style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "#2563EB", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {data.length} Program
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#2563EB" }} />
              <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 700 }}>
                Rencana Kerja Operasional Disahkan
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Sumber Pembiayaan */}
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
              Sumber Pembiayaan
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
              <Coins style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "#059669", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {uniqueSumberDana} Sumber Dana
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#059669" }} />
              <span style={{ fontSize: "11px", color: "#059669", fontWeight: 700 }}>
                APBD, DAK Fisik & Banprov
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Tahun Anggaran Perencanaan */}
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
            <div style={{ fontSize: "22px", fontWeight: 900, color: "#D97706", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              TA 2026
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#D97706" }} />
              <span style={{ fontSize: "11px", color: "#D97706", fontWeight: 700 }}>
                Tahun Anggaran Berjalan Aktif
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar dengan Default Urutan Terkini (DESC) */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          padding: "14px 18px",
          border: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: "1 1 340px", flexWrap: "wrap" }}>
          {/* Search Box */}
          <div style={{ position: "relative", minWidth: "220px", flex: "1 1 220px", maxWidth: "300px" }}>
            <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "#94A3B8" }} />
            <input
              type="text"
              placeholder="Cari program anggaran..."
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

          {/* Filter Sumber Dana */}
          <div style={{ display: "inline-flex", gap: "6px", flexWrap: "wrap" }}>
            {["Semua", "APBD Kab. Bogor", "DAK Fisik", "Bantuan Keuangan Provinsi"].map((sd) => (
              <button
                key={sd}
                type="button"
                onClick={() => setFilterSumberDana(sd)}
                style={{
                  padding: "5px 12px",
                  fontSize: "11px",
                  fontWeight: 800,
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  backgroundColor: filterSumberDana === sd ? "#0F2E5C" : "#F1F5F9",
                  color: filterSumberDana === sd ? "#FFFFFF" : "#64748B"
                }}
              >
                {sd}
              </button>
            ))}
          </div>

          {/* Selector Urutan */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: "210px" }}>
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
              <option value="terkini">Pos Anggaran Terkini (Default - DESC)</option>
              <option value="pagu-desc">Pagu Terbanyak</option>
              <option value="pagu-asc">Pagu Terendah</option>
              <option value="nama">Nama Program (A-Z)</option>
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
              <span>Pos Anggaran Terkini (DESC)</span>
            </span>
          )}

          {(searchQuery || filterSumberDana !== "Semua" || sortBy !== "terkini") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilterSumberDana("Semua");
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

      {/* Doc Completion Progress Bar (Label: Dokumen Anggaran) */}
      <DocCompletionBar
        records={data}
        label="Kelengkapan Dokumen Anggaran Pengawasan"
        filterActive={filterDocPending}
        onToggleFilter={() => setFilterDocPending((prev) => !prev)}
      />

      {/* Tabel DataTableView (Header EDIT, Tombol Aksi Baku, Tanpa Realisasi dan Serapan) */}
      <DataTableView<AnggaranRecord>
        title={`Daftar Pos Anggaran Pengawasan (${filteredAndSortedData.length} Kegiatan Terjadwal)`}
        subtitle="Rincian pos alokasi dana operasional pengawasan tertib jasa konstruksi standar SIPJAKI TA 2026"
        data={filteredAndSortedData}
        columns={columns}
        defaultPageSize={10}
        exportFileName={`Anggaran_Pengawasan_${tertibType}`}
        sipjakiTemplate={TEMPLATE_PERENCANAAN_ANGGARAN}
        exportColumns={[
          { key: "wilayah", label: "Wilayah Penugasan" },
          { key: "tahun", label: "Tahun Anggaran" },
          { key: "program", label: "Nama Program / Kegiatan" },
          { key: "paguAnggaran", label: "Pagu Anggaran (Rp)" },
          { key: "sumberDana", label: "Sumber Dana" },
          { key: "tanggalPenetapan", label: "Waktu Penetapan" },
          { key: "dokumenRka", label: "Dokumen" },
          { key: "status", label: "Status Usulan" }
        ]}
        actionsHeader="EDIT"
        actionsRender={(row) => (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            {/* 1. Tombol Detail (Abu-abu Netral) */}
            <button
              type="button"
              title="Lihat Detail Alokasi"
              onClick={() => setDetailRecord(row)}
              style={{
                backgroundColor: "#F8FAFC",
                color: "#334155",
                border: "1px solid #CBD5E1",
                borderRadius: "6px",
                padding: "5px 8px",
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

            {/* 2. Tombol Edit (Kuning Amber) */}
            <button
              type="button"
              title="Ubah Alokasi Anggaran"
              onClick={() => handleOpenEdit(row)}
              style={{
                backgroundColor: "#FEF3C7",
                color: "#B45309",
                border: "1px solid #FCD34D",
                borderRadius: "6px",
                padding: "5px 8px",
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

            {/* 3. Tombol Hapus (Merah Soft) */}
            <button
              type="button"
              title="Hapus Pos Anggaran"
              onClick={() => handleOpenDelete(row)}
              style={{
                backgroundColor: "#FEE2E2",
                color: "#991B1B",
                border: "1px solid #FCA5A5",
                borderRadius: "6px",
                padding: "5px 8px",
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

      {/* Modal Form Tambah Anggaran (Murni Perencanaan tanpa input realisasi) */}
      <ModalForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Tambah Pos Anggaran Pengawasan Baru"
        subtitle={`Input penetapan pos alokasi pagu anggaran untuk ${config.shortTitle}`}
        onSubmit={handleAddAnggaran}
        submitLabel="Simpan Pos Anggaran"
        isLoading={isSubmitting}
        size="lg"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Nama Program */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
              Program / Sub-Kegiatan Pengawasan <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Operasional Tim Lapangan & Uji Petik Kepatuhan Standar Jakon"
              value={formProgram}
              onChange={(e) => setFormProgram(e.target.value)}
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

          {/* Grid Wilayah & Tahun */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Wilayah Penugasan <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Seluruh Wilayah (40 Kecamatan)"
                value={formWilayah}
                onChange={(e) => setFormWilayah(e.target.value)}
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
                Tahun Anggaran <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="2026"
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

          {/* Grid Pagu Anggaran & Sumber Dana */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Pagu Anggaran (Rp) <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="number"
                required
                min="1000000"
                step="500000"
                placeholder="Contoh: 150000000"
                value={formPagu}
                onChange={(e) => setFormPagu(e.target.value)}
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
                Sumber Pendanaan
              </label>
              <select
                value={formSumberDana}
                onChange={(e) => setFormSumberDana(e.target.value as "APBD Kab. Bogor" | "DAK Fisik" | "Bantuan Keuangan Provinsi")}
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
                <option value="APBD Kab. Bogor">APBD Kab. Bogor</option>
                <option value="DAK Fisik">DAK Fisik</option>
                <option value="Bantuan Keuangan Provinsi">Bantuan Keuangan Provinsi</option>
              </select>
            </div>
          </div>

          {/* Grid Waktu Penetapan & Status Usulan */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Tanggal Penetapan Alokasi
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

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Status Usulan Anggaran
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as "Disetujui" | "Revisi" | "Usulan")}
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
                <option value="Disetujui">Disetujui</option>
                <option value="Usulan">Usulan</option>
                <option value="Revisi">Revisi</option>
              </select>
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
              Keterangan Lingkup Alokasi
            </label>
            <textarea
              rows={2}
              placeholder="Catatan peruntukan pos anggaran pengawasan..."
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

          {/* File Uploader (Label: Dokumen) */}
          <FileUploader
            label="Unggah Dokumen Penganggaran (PDF)"
            accept=".pdf"
            maxSizeMb={5}
            onFileSelect={(file) => setUploadedFile(file)}
            hint="Lampirkan berkas dokumen penganggaran resmi (Maksimal 5 MB)"
          />
        </div>
      </ModalForm>

      {/* Modal Form Edit Anggaran (Standar SIPJAKI: Fitur Edit tanpa realisasi) */}
      <ModalForm
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingRecord(null);
        }}
        title="Ubah Pos Alokasi Anggaran Pengawasan"
        subtitle={`Perbarui data pos alokasi untuk ${editingRecord?.program || ""}`}
        onSubmit={handleSaveEditAnggaran}
        submitLabel="Simpan Perubahan Anggaran"
        isLoading={isSubmitting}
        size="lg"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Nama Program */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
              Program / Sub-Kegiatan Pengawasan <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              value={editProgram}
              onChange={(e) => setEditProgram(e.target.value)}
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

          {/* Grid Wilayah & Tahun */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Wilayah Penugasan <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={editWilayah}
                onChange={(e) => setEditWilayah(e.target.value)}
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
                Tahun Anggaran <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                required
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

          {/* Grid Pagu & Sumber Dana */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Pagu Anggaran (Rp) <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="number"
                required
                min="1000000"
                step="500000"
                value={editPagu}
                onChange={(e) => setEditPagu(e.target.value)}
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
                Sumber Pendanaan
              </label>
              <select
                value={editSumberDana}
                onChange={(e) => setEditSumberDana(e.target.value as "APBD Kab. Bogor" | "DAK Fisik" | "Bantuan Keuangan Provinsi")}
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
                <option value="APBD Kab. Bogor">APBD Kab. Bogor</option>
                <option value="DAK Fisik">DAK Fisik</option>
                <option value="Bantuan Keuangan Provinsi">Bantuan Keuangan Provinsi</option>
              </select>
            </div>
          </div>

          {/* Grid Tanggal Penetapan & Status */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Tanggal Penetapan Alokasi
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

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Status Usulan Anggaran
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as "Disetujui" | "Revisi" | "Usulan")}
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
                <option value="Disetujui">Disetujui</option>
                <option value="Usulan">Usulan</option>
                <option value="Revisi">Revisi</option>
              </select>
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
              Keterangan Lingkup Alokasi
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

      {/* Modal Dialog Detail Pos Anggaran (Tanpa realisasi/serapan) */}
      {detailRecord && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
          onClick={() => setDetailRecord(null)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "540px",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              overflow: "hidden"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ backgroundColor: "#0F2E5C", padding: "18px 20px", color: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#93C5FD", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Rincian Pos Anggaran Pengawasan
                </span>
                <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "#FFFFFF" }}>
                  {detailRecord.program}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailRecord(null)}
                style={{ background: "none", border: "none", color: "#FFFFFF", cursor: "pointer", padding: "4px" }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ backgroundColor: "#F8FAFC", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <span style={{ fontSize: "11px", color: "#64748B", display: "block" }}>Wilayah Penugasan</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#1E293B" }}>{detailRecord.wilayah || "Seluruh Wilayah"}</span>
                </div>
                <div style={{ backgroundColor: "#F8FAFC", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <span style={{ fontSize: "11px", color: "#64748B", display: "block" }}>Tahun Anggaran</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#1E293B" }}>TA {detailRecord.tahun}</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ backgroundColor: "#F8FAFC", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <span style={{ fontSize: "11px", color: "#64748B", display: "block" }}>Pagu Anggaran (DPA)</span>
                  <span style={{ fontSize: "15px", fontWeight: 900, color: "#0F2E5C" }}>Rp {detailRecord.paguAnggaran.toLocaleString('id-ID')}</span>
                </div>
                <div style={{ backgroundColor: "#F8FAFC", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <span style={{ fontSize: "11px", color: "#64748B", display: "block" }}>Sumber Pembiayaan</span>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "#2563EB" }}>{detailRecord.sumberDana}</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ backgroundColor: "#F8FAFC", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <span style={{ fontSize: "11px", color: "#64748B", display: "block" }}>Waktu Penetapan</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#1E293B" }}>{detailRecord.tanggalPenetapan || "2026-01-15"}</span>
                </div>
                <div style={{ backgroundColor: "#F8FAFC", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <span style={{ fontSize: "11px", color: "#64748B", display: "block" }}>Status Usulan</span>
                  <StatusBadge status={detailRecord.status} size="sm" showDot />
                </div>
              </div>

              <div>
                <span style={{ fontSize: "11px", color: "#64748B", display: "block", marginBottom: "4px" }}>Dokumen Penganggaran</span>
                <DocStatusBadge
                  status={detailRecord._docStatus || (detailRecord.dokumenRka || detailRecord.dokumen ? "complete" : "pending")}
                  fileName={detailRecord.dokumenRka || detailRecord.dokumen}
                  documentLabel="Dokumen Penganggaran"
                  onClick={() => {
                    const tgt = detailRecord;
                    setDetailRecord(null);
                    setDocUploadTarget(tgt);
                  }}
                />
              </div>

              {detailRecord.keterangan && (
                <div style={{ backgroundColor: "#F8FAFC", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <span style={{ fontSize: "11px", color: "#64748B", display: "block" }}>Keterangan Lingkup</span>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#475569" }}>{detailRecord.keterangan}</p>
                </div>
              )}
            </div>

            <div style={{ padding: "12px 20px", backgroundColor: "#F1F5F9", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setDetailRecord(null)}
                style={{
                  backgroundColor: "#0F2E5C",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog Konfirmasi Hapus Pos Anggaran */}
      {showDeleteConfirm && deletingRecord && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              overflow: "hidden"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "24px 20px", display: "flex", gap: "16px" }}>
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
                <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#1E293B", margin: "0 0 6px 0" }}>
                  Konfirmasi Hapus Pos Anggaran
                </h4>
                <p style={{ fontSize: "13px", color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                  Apakah Anda yakin ingin menghapus pos alokasi anggaran:  
                  <strong style={{ color: "#0F2E5C", display: "block", marginTop: "4px" }}>
                    &ldquo;{deletingRecord.program}&rdquo; (Rp {deletingRecord.paguAnggaran.toLocaleString('id-ID')})
                  </strong>
                  Tindakan ini akan menghapus pos alokasi anggaran dari dokumen perencanaan kerja pengawasan.
                </p>
              </div>
            </div>

            <div style={{ padding: "12px 20px", backgroundColor: "#F8FAFC", display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid #E2E8F0" }}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#64748B",
                  border: "1px solid #CBD5E1",
                  borderRadius: "8px",
                  padding: "8px 14px",
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
                  backgroundColor: "#DC2626",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Trash2 style={{ width: "14px", height: "14px" }} />
                <span>Ya, Hapus Anggaran</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mini Modal Upload Dokumen Susulan */}
      {docUploadTarget && (
        <DocumentUploadMiniModal
          isOpen={Boolean(docUploadTarget)}
          onClose={() => setDocUploadTarget(null)}
          title={`Unggah Dokumen Penganggaran — ${docUploadTarget.program}`}
          subtitle={`${docUploadTarget.sumberDana} • Tahun ${docUploadTarget.tahun} • Rp ${docUploadTarget.paguAnggaran.toLocaleString('id-ID')}`}
          documentFields={[
            { key: "dokumenRka", label: "Dokumen Anggaran (PDF)", accept: ".pdf", maxSizeMb: 5, required: true }
          ]}
          existingDocuments={{ dokumenRka: docUploadTarget.dokumenRka || docUploadTarget.dokumen }}
          onSave={handleSaveUploadedDoc}
        />
      )}

      {/* Batch Import Modal */}
      <BatchImportModal<AnggaranRecord>
        isOpen={isBatchImportOpen}
        onClose={() => setIsBatchImportOpen(false)}
        template={TEMPLATE_PERENCANAAN_ANGGARAN}
        onCommit={handleBatchCommit}
      />
    </div>
  );
}

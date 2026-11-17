"use client";

import React, { useState, useEffect, useMemo } from "react";
import ModuleHeader from "@/components/layout/module-header";
import PerencanaanSubtabNav from "@/components/tertib/perencanaan-subtab-nav";
import { TertibType, TERTIB_CONFIGS } from "@/lib/tertib-config";
import { mockSDMRecords, SDMRecord } from "@/data/tertib-mock-data";
import { 
  StatusBadge, FileUploader, DataTableView, 
  ColumnDef, DocStatusBadge, DocumentUploadMiniModal, DocCompletionBar
} from "@/components/common";
import { 
  Users, Plus, Download, FileText, Eye, Shield, 
  CheckCircle2, Award, Calendar, Pencil, Trash2,
  AlertTriangle, X, Check, Search, Filter, ArrowUpDown
} from "lucide-react";
import { TEMPLATE_PERENCANAAN_SDM } from "@/lib/sipjaki-templates";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface PerencanaanSDMViewProps {
  tertibType: TertibType;
}

export default function PerencanaanSDMView({ tertibType }: PerencanaanSDMViewProps) {
  const config = TERTIB_CONFIGS[tertibType];

  // Inisialisasi data dari mock data (diurutkan DESC berdasarkan tanggalSuratTugas)
  const [data, setData] = useState<SDMRecord[]>(() => {
    const list = mockSDMRecords
      .filter((r) => r.tertibType === tertibType)
      .map((r) => ({
        ...r,
        tanggalSuratTugas: r.tanggalSuratTugas || "2026-03-24",
        _docStatus: r._docStatus || (r.dokumen ? "complete" : "pending")
      }));
    return list.sort((a, b) => (b.tanggalSuratTugas || "").localeCompare(a.tanggalSuratTugas || ""));
  });

  // Hybrid Dual-Engine: Sinkronisasi Supabase Cloud
  useEffect(() => {
    async function loadSupabaseSDM() {
      if (!isSupabaseConfigured()) return;
      try {
        const supabase = createClient();
        if (!supabase) return;
        const { data: dbData, error } = await supabase
          .from("pengawasan_sdm_perencanaan")
          .select("*")
          .eq("tertib_type", tertibType);

        if (error) throw error;
        if (dbData && dbData.length > 0) {
          const mapped: SDMRecord[] = dbData.map((row: any) => {
            // Ekstrak nama ketua dan sertifikasi jika ada di dalam kurung
            let ketua = row.ketua_tim || "Pengawas Teknis Jasa Konstruksi";
            let sertifikasi = "";
            const certMatch = ketua.match(/\((.*?)\)/);
            if (certMatch) {
              sertifikasi = certMatch[1];
              ketua = ketua.replace(/\(.*?\)/, "").trim();
            }

            return {
              id: row.id,
              tertibType: row.tertib_type,
              namaTim: row.nama_tim || "Tim Pengawas Teknis",
              nomorSuratTugas: row.nomor_surat_tugas || `ST.600.1/${row.id.replace(/\D/g, "") || "01"}-DPUPR/2026`,
              ketuaTim: ketua,
              sertifikasiKetua: sertifikasi,
              jumlahSdm: Number(row.jumlah_sdm) || 1,
              tahun: row.tahun || "2026",
              tanggalSuratTugas: row.tanggal_surat_tugas || row.created_at?.split("T")[0] || "2026-03-24",
              dokumen: row.dokumen || "",
              status: row.status || "Terverifikasi",
              keterangan: row.keterangan || "",
              _docStatus: row.dokumen ? "complete" : "pending"
            };
          });

          // Urutkan default DESC
          mapped.sort((a, b) => (b.tanggalSuratTugas || "").localeCompare(a.tanggalSuratTugas || ""));
          setData(mapped);
        }
      } catch (err) {
        console.warn("Supabase query fallback to mock data:", err);
      }
    }
    loadSupabaseSDM();
  }, [tertibType]);

  // State Filter & Urutan (Default DESC)
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterDocPending, setFilterDocPending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"terkini" | "terlama" | "sdm_desc" | "sdm_asc">("terkini");

  // State Modal Form Tambah
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formNamaTim, setFormNamaTim] = useState("");
  const [formNomorSuratTugas, setFormNomorSuratTugas] = useState("");
  const [formKetuaTim, setFormKetuaTim] = useState("");
  const [formSertifikasiKetua, setFormSertifikasiKetua] = useState("");
  const [formJumlah, setFormJumlah] = useState("5");
  const [formTahun, setFormTahun] = useState("2026");
  const [formTanggalSuratTugas, setFormTanggalSuratTugas] = useState("2026-03-24");
  const [formKeterangan, setFormKeterangan] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // State Modal Detail
  const [detailRecord, setDetailRecord] = useState<SDMRecord | null>(null);

  // State Modal Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SDMRecord | null>(null);
  const [editNamaTim, setEditNamaTim] = useState("");
  const [editNomorSuratTugas, setEditNomorSuratTugas] = useState("");
  const [editKetuaTim, setEditKetuaTim] = useState("");
  const [editSertifikasiKetua, setEditSertifikasiKetua] = useState("");
  const [editJumlah, setEditJumlah] = useState("");
  const [editTahun, setEditTahun] = useState("2026");
  const [editTanggalSuratTugas, setEditTanggalSuratTugas] = useState("");
  const [editStatus, setEditStatus] = useState<"Menunggu Verifikasi" | "Terverifikasi" | "Ditolak">("Terverifikasi");
  const [editKeterangan, setEditKeterangan] = useState("");

  // State Dialog Konfirmasi Hapus
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<SDMRecord | null>(null);

  // State Mini Modal Upload Dokumen Susulan
  const [docUploadTarget, setDocUploadTarget] = useState<SDMRecord | null>(null);

  // Filter & Pengurutan Data
  const filteredAndSortedData = useMemo(() => {
    let result = data.filter((item) => {
      const matchStatus = filterStatus === "Semua" || item.status === filterStatus;
      const matchSearch =
        searchQuery === "" ||
        item.namaTim?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nomorSuratTugas?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ketuaTim?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sertifikasiKetua?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDoc = !filterDocPending || item._docStatus === "pending" || !item.dokumen;
      return matchStatus && matchSearch && matchDoc;
    });

    return result.sort((a, b) => {
      if (sortBy === "terkini") {
        return (b.tanggalSuratTugas || "").localeCompare(a.tanggalSuratTugas || "");
      }
      if (sortBy === "terlama") {
        return (a.tanggalSuratTugas || "").localeCompare(b.tanggalSuratTugas || "");
      }
      if (sortBy === "sdm_desc") {
        return b.jumlahSdm - a.jumlahSdm;
      }
      if (sortBy === "sdm_asc") {
        return a.jumlahSdm - b.jumlahSdm;
      }
      return 0;
    });
  }, [data, filterStatus, searchQuery, filterDocPending, sortBy]);

  // Statistik Agregat (Tanpa Wilayah)
  const totalSDM = data.reduce((acc, curr) => acc + curr.jumlahSdm, 0);

  // Handler Simpan Dokumen Susulan
  const handleSaveUploadedDoc = (files: Record<string, File | null>, fileNames: Record<string, string>) => {
    if (!docUploadTarget) return;
    const newDocName = fileNames["dokumen"] || docUploadTarget.dokumen || `Surat_Tugas_Tim_${docUploadTarget.tahun}_${docUploadTarget.id}.pdf`;
    setData((prev) =>
      prev.map((item) => {
        if (item.id === docUploadTarget.id) {
          return {
            ...item,
            dokumen: newDocName,
            _docStatus: "complete"
          };
        }
        return item;
      })
    );

    // Sync Supabase jika aktif
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        if (supabase) {
          (supabase as any)
            .from("pengawasan_sdm_perencanaan")
            .update({ dokumen: newDocName, updated_at: new Date().toISOString() })
            .eq("id", docUploadTarget.id)
            .then();
        }
      } catch (err) {
        console.warn("Supabase update error:", err);
      }
    }

    setDocUploadTarget(null);
    alert(`Berkas dokumen surat tugas "${newDocName}" berhasil disimpan!`);
  };

  // Handler Tambah Penugasan SDM Baru
  const handleAddSDM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNamaTim || !formKetuaTim || !formJumlah) {
      alert("Mohon isi Nama Tim, Nama Ketua Tim, dan Jumlah Personil!");
      return;
    }

    setIsSubmitting(true);
    setTimeout(async () => {
      const newId = `SDM-${Date.now().toString().slice(-4)}`;
      const docName = uploadedFile ? uploadedFile.name : `Surat_Tugas_Tim_Pengawas_${formTahun}.pdf`;
      const fullKetua = formSertifikasiKetua ? `${formKetuaTim} (${formSertifikasiKetua})` : formKetuaTim;

      const newRecord: SDMRecord = {
        id: newId,
        tertibType,
        namaTim: formNamaTim,
        nomorSuratTugas: formNomorSuratTugas || `ST.600.1/${Date.now().toString().slice(-3)}-DPUPR/${formTahun}`,
        ketuaTim: formKetuaTim,
        sertifikasiKetua: formSertifikasiKetua,
        jumlahSdm: parseInt(formJumlah, 10) || 5,
        tahun: formTahun,
        tanggalSuratTugas: formTanggalSuratTugas || new Date().toISOString().split("T")[0],
        dokumen: docName,
        status: "Terverifikasi",
        keterangan: formKeterangan,
        _docStatus: uploadedFile ? "complete" : "pending"
      };

      setData((prev) => [newRecord, ...prev]);

      // Sync Supabase
      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          if (supabase) {
            await (supabase as any).from("pengawasan_sdm_perencanaan").insert({
              id: newId,
              tertib_type: tertibType,
              wilayah: "Kabupaten Bogor",
              nama_tim: formNamaTim,
              ketua_tim: fullKetua,
              jumlah_sdm: parseInt(formJumlah, 10) || 5,
              tahun: formTahun,
              dokumen: docName,
              status: "Terverifikasi"
            });
          }
        } catch (err) {
          console.warn("Supabase insert error:", err);
        }
      }

      setIsSubmitting(false);
      setShowModal(false);
      setFormNamaTim("");
      setFormNomorSuratTugas("");
      setFormKetuaTim("");
      setFormSertifikasiKetua("");
      setFormJumlah("5");
      setFormKeterangan("");
      setUploadedFile(null);
      alert("Data Penugasan SDM berhasil ditambahkan!");
    }, 400);
  };

  // Handler Buka Modal Edit
  const handleOpenEdit = (row: SDMRecord) => {
    setEditingRecord(row);
    setEditNamaTim(row.namaTim || "");
    setEditNomorSuratTugas(row.nomorSuratTugas || "");
    setEditKetuaTim(row.ketuaTim || "");
    setEditSertifikasiKetua(row.sertifikasiKetua || "");
    setEditJumlah(String(row.jumlahSdm || 5));
    setEditTahun(row.tahun || "2026");
    setEditTanggalSuratTugas(row.tanggalSuratTugas || "2026-03-24");
    setEditStatus(row.status);
    setEditKeterangan(row.keterangan || "");
    setShowEditModal(true);
  };

  // Handler Simpan Perubahan Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !editNamaTim || !editKetuaTim || !editJumlah) {
      alert("Mohon lengkapi Nama Tim, Nama Ketua Tim, dan Jumlah Personil!");
      return;
    }

    setIsSubmitting(true);
    setTimeout(async () => {
      const fullKetua = editSertifikasiKetua ? `${editKetuaTim} (${editSertifikasiKetua})` : editKetuaTim;

      setData((prev) =>
        prev.map((item) => {
          if (item.id === editingRecord.id) {
            return {
              ...item,
              namaTim: editNamaTim,
              nomorSuratTugas: editNomorSuratTugas,
              ketuaTim: editKetuaTim,
              sertifikasiKetua: editSertifikasiKetua,
              jumlahSdm: parseInt(editJumlah, 10) || 5,
              tahun: editTahun,
              tanggalSuratTugas: editTanggalSuratTugas,
              status: editStatus,
              keterangan: editKeterangan
            };
          }
          return item;
        })
      );

      // Sync Supabase
      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          if (supabase) {
            await (supabase as any)
              .from("pengawasan_sdm_perencanaan")
              .update({
                nama_tim: editNamaTim,
                ketua_tim: fullKetua,
                jumlah_sdm: parseInt(editJumlah, 10) || 5,
                tahun: editTahun,
                status: editStatus,
                updated_at: new Date().toISOString()
              })
              .eq("id", editingRecord.id);
          }
        } catch (err) {
          console.warn("Supabase update error:", err);
        }
      }

      setIsSubmitting(false);
      setShowEditModal(false);
      setEditingRecord(null);
      alert(`Data Penugasan SDM "${editNamaTim}" berhasil diperbarui!`);
    }, 400);
  };

  // Handler Buka Konfirmasi Hapus
  const handleOpenDelete = (row: SDMRecord) => {
    setDeletingRecord(row);
    setShowDeleteConfirm(true);
  };

  // Handler Eksekusi Hapus
  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;
    setData((prev) => prev.filter((item) => item.id !== deletingRecord.id));
    setShowDeleteConfirm(false);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        if (supabase) {
          await (supabase as any)
            .from("pengawasan_sdm_perencanaan")
            .delete()
            .eq("id", deletingRecord.id);
        }
      } catch (err) {
        console.warn("Supabase delete error:", err);
      }
    }

    alert(`Penugasan "${deletingRecord.namaTim}" berhasil dihapus.`);
    setDeletingRecord(null);
  };

  // Definisi Kolom Tabel (Header Bersih Tanpa Kata SK & Tanpa Wilayah)
  const columns: ColumnDef<SDMRecord>[] = [
    {
      key: "no",
      label: "NO",
      width: "50px",
      sortable: false,
      render: (_, idx) => <span style={{ fontWeight: 700, color: "#64748B" }}>{idx + 1}</span>
    },
    {
      key: "namaTim",
      label: "TIM & KETUA PENGAWAS",
      sortable: true,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C", lineHeight: 1.3 }}>
            {row.namaTim}
          </span>
          {row.nomorSuratTugas && (
            <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#64748B" }}>
              {row.nomorSuratTugas}
            </span>
          )}
          {row.ketuaTim && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#334155" }}>
                Ketua: {row.ketuaTim}
              </span>
              {row.sertifikasiKetua ? (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "#1D4ED8",
                    backgroundColor: "#EFF6FF",
                    border: "1px solid #BFDBFE",
                    padding: "1px 6px",
                    borderRadius: "4px"
                  }}
                >
                  {row.sertifikasiKetua}
                </span>
              ) : (
                <span style={{ fontSize: "10px", color: "#94A3B8" }}>
                  (Umum)
                </span>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      key: "jumlahSdm",
      label: "JUMLAH PERSONIL",
      align: "center",
      sortable: true,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 800,
              color: "#0F2E5C",
              backgroundColor: "#F1F5F9",
              padding: "4px 12px",
              borderRadius: "8px",
              display: "inline-block"
            }}
          >
            {row.jumlahSdm} Personil
          </span>
          <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 600, marginTop: "2px" }}>
            1 Kesatuan Surat Tugas
          </span>
        </div>
      )
    },
    {
      key: "tanggalSuratTugas",
      label: "TANGGAL TUGAS",
      align: "center",
      sortable: true,
      render: (row) => (
        <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 600, color: "#475569" }}>
          <Calendar style={{ width: "13px", height: "13px", color: "#64748B" }} />
          <span>{row.tanggalSuratTugas || "2026-03-24"}</span>
        </div>
      )
    },
    {
      key: "tahun",
      label: "TAHUN",
      align: "center",
      sortable: true,
      render: (row) => <span style={{ fontWeight: 700, color: "#475569", fontSize: "12px" }}>{row.tahun}</span>
    },
    {
      key: "dokumen",
      label: "DOKUMEN",
      align: "center",
      sortable: false,
      render: (row) => (
        <DocStatusBadge
          status={row._docStatus || (row.dokumen ? "complete" : "pending")}
          fileName={row.dokumen}
          documentLabel="Dokumen Surat Tugas"
          onClick={() => setDocUploadTarget(row)}
        />
      )
    },
    {
      key: "status",
      label: "STATUS",
      align: "center",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} size="sm" />
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Module Header SIPJAKI Baku */}
      <ModuleHeader
        breadcrumbs={[
          { label: config.shortTitle, href: config.basePath },
          { label: "Perencanaan", href: `${config.basePath}/perencanaan` },
          { label: "Sumber Daya Manusia" }
        ]}
        badgeText={config.pilar}
        badgeBg={config.badgeBg}
        badgeColor={config.badgeColor}
        title={`Sumber Daya Manusia (SDM) Pengawas — ${config.shortTitle}`}
        description="Kelola alokasi tim personil pengawas teknis, penetapan Ketua Tim bersertifikasi, dan penerbitan Surat Tugas pengawasan jasa konstruksi."
        legalBasis={config.legalBasis}
        actionButtons={[
          {
            label: "Tambah Surat Tugas (SDM)",
            icon: Plus,
            variant: "primary",
            onClick: () => setShowModal(true)
          },
          {
            label: "Unduh Dokumen Penugasan (PDF)",
            icon: Download,
            onClick: () => alert("Mengunduh Rekapitulasi Dokumen Penugasan SDM Pengawas...")
          }
        ]}
      />

      {/* Subtab Navigation */}
      <PerencanaanSubtabNav tertibType={tertibType} activeSubtab="sdm" />

      {/* 4 Top Stat Cards (Standardized SIPJAKI, Tanpa Tulisan Wilayah) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        {/* Card 1: Total SDM Ditugaskan */}
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
              Total Personil Ditugaskan
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
              <Users style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#0F2E5C", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {totalSDM} Personil
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10B981" }} />
              <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>
                1 Kesatuan Tim dalam {data.length} Surat Tugas
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Surat Tugas / Tim */}
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
              Total Surat Tugas
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
              <Shield style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#2563EB", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {data.length} Dokumen Penugasan
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ fontSize: "11px", color: "#64748B" }}>
                Rencana Kerja Operasional Disahkan
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Verifikasi Sinkronisasi */}
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
              Status Verifikasi
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
              <CheckCircle2 style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 900, color: "#059669", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              Terverifikasi Penuh
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#059669" }} />
              <span style={{ fontSize: "11px", color: "#166534", fontWeight: 700 }}>
                Standar SIPJAKI Kementerian PUPR
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Legalitas Penugasan (Tanpa kata SK) */}
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
              Legalitas Penugasan
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
              <Award style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "#D97706", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              Surat Tugas Sah
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ fontSize: "11px", color: "#64748B" }}>
                Dokumen Penugasan Kedinasan Aktif
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Sort Selector (Default Terkini / DESC) */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "14px",
          padding: "16px",
          border: "1px solid #E2E8F0",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", flex: 1 }}>
          {/* Input Cari */}
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
            <Search
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "16px",
                height: "16px",
                color: "#94A3B8"
              }}
            />
            <input
              type="text"
              placeholder="Cari tim, nomor surat tugas, nama ketua, sertifikasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                height: "38px",
                paddingLeft: "36px",
                paddingRight: "12px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "12px",
                color: "#0F2E5C",
                outline: "none"
              }}
            />
          </div>

          {/* Filter Status Badge Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {["Semua", "Terverifikasi", "Menunggu Verifikasi"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                style={{
                  height: "38px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: filterStatus === st ? "none" : "1px solid #E2E8F0",
                  backgroundColor: filterStatus === st ? "#0F2E5C" : "#F8FAFC",
                  color: filterStatus === st ? "#FFFFFF" : "#64748B"
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Selector: Default Terkini DESC */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <ArrowUpDown style={{ width: "14px", height: "14px", color: "#64748B" }} />
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>
              URUTAN:
            </span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              height: "38px",
              padding: "0 12px",
              borderRadius: "8px",
              border: "1px solid #CBD5E1",
              fontSize: "12px",
              fontWeight: 700,
              color: "#0F2E5C",
              backgroundColor: "#FFFFFF",
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="terkini">Surat Tugas Terkini (Default - DESC)</option>
            <option value="terlama">Surat Tugas Terlama (ASC)</option>
            <option value="sdm_desc">Jumlah Personil Terbanyak</option>
            <option value="sdm_asc">Jumlah Personil Tersedikit</option>
          </select>

          {/* Badge Indikator Filter Terkini Aktif */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              backgroundColor: "#EFF6FF",
              color: "#1D4ED8",
              border: "1px solid #DBEAFE",
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: 800
            }}
          >
            <ArrowUpDown style={{ width: "12px", height: "12px" }} />
            Surat Tugas Terkini (DESC)
          </span>
        </div>
      </div>

      {/* Doc Completion Progress Bar (Label: Surat Tugas) */}
      <DocCompletionBar
        total={data.length}
        completed={data.filter((d) => d._docStatus === "complete" || Boolean(d.dokumen)).length}
        label="Kelengkapan Dokumen Surat Tugas"
        isFilterActive={filterDocPending}
        onFilterPending={() => setFilterDocPending((prev) => !prev)}
      />

      {/* Reusable DataTableView */}
      <DataTableView<SDMRecord>
        title={`Daftar Penugasan SDM Pengawas (${filteredAndSortedData.length} Surat Tugas)`}
        subtitle={
          filterDocPending
            ? "Menampilkan tim pengawas yang belum mengunggah salinan dokumen surat tugas resmi (dapat disusulkan)"
            : "Data personalia tim dan legalitas dokumen Surat Tugas Pengawasan Teknis Jasa Konstruksi Kabupaten Bogor"
        }
        data={filteredAndSortedData}
        columns={columns}
        defaultPageSize={10}
        exportFileName={`SDM_Pengawas_${tertibType}`}
        sipjakiTemplate={TEMPLATE_PERENCANAAN_SDM}
        exportColumns={[
          { key: "namaTim", label: "Nama Tim Pengawas" },
          { key: "nomorSuratTugas", label: "Nomor Surat Tugas" },
          { key: "ketuaTim", label: "Ketua Tim" },
          { key: "sertifikasiKetua", label: "Sertifikasi Ketua" },
          { key: "jumlahSdm", label: "Jumlah Personil (1 Kesatuan)" },
          { key: "tanggalSuratTugas", label: "Tanggal Tugas" },
          { key: "tahun", label: "Tahun Anggaran" },
          { key: "dokumen", label: "Dokumen Surat Tugas" },
          { key: "status", label: "Status Verifikasi" }
        ]}
        actionsHeader="EDIT"
        actionsRender={(row) => {
          const item = row;
          return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              {/* Tombol Detail */}
              <button
                type="button"
                title="Lihat Detail Personil & Surat Tugas"
                onClick={() => setDetailRecord(item)}
                style={{
                  backgroundColor: "#F1F5F9",
                  color: "#0F2E5C",
                  border: "1px solid #CBD5E1",
                  borderRadius: "6px",
                  padding: "5px 8px",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px"
                }}
              >
                <Eye style={{ width: "12px", height: "12px" }} />
                <span>Detail</span>
              </button>

              {/* Tombol Edit */}
              <button
                type="button"
                title="Ubah Surat Tugas & Personil"
                onClick={() => handleOpenEdit(item)}
                style={{
                  backgroundColor: "#FEF3C7",
                  color: "#B45309",
                  border: "1px solid #FDE68A",
                  borderRadius: "6px",
                  padding: "5px 8px",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px"
                }}
              >
                <Pencil style={{ width: "12px", height: "12px" }} />
                <span>Edit</span>
              </button>

              {/* Tombol Hapus */}
              <button
                type="button"
                title="Hapus Penugasan Tim"
                onClick={() => handleOpenDelete(item)}
                style={{
                  backgroundColor: "#FEE2E2",
                  color: "#DC2626",
                  border: "1px solid #FECACA",
                  borderRadius: "6px",
                  padding: "5px 8px",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px"
                }}
              >
                <Trash2 style={{ width: "12px", height: "12px" }} />
                <span>Hapus</span>
              </button>
            </div>
          );
        }}
      />

      {/* Modal Tambah Surat Tugas & Personil Baru (Tanpa Wilayah, Dengan Ketua & Sertifikasi) */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              border: "1px solid #E2E8F0"
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px",
                borderBottom: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#0F2E5C",
                color: "#FFFFFF",
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px"
              }}
            >
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0 }}>
                  Tambah Surat Tugas & Personil Pengawas
                </h3>
                <p style={{ fontSize: "12px", margin: "4px 0 0 0", color: "#93C5FD" }}>
                  Input alokasi tim personil pengawas teknis untuk {config.shortTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  padding: "4px"
                }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddSDM} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
                  Nama Tim / Satgas Pengawas <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Tim Pengawas Teknis Usaha Konstruksi"
                  value={formNamaTim}
                  onChange={(e) => setFormNamaTim(e.target.value)}
                  required
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
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
                  Nomor Surat Tugas <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: ST.600.1/104-DPUPR/2026"
                  value={formNomorSuratTugas}
                  onChange={(e) => setFormNomorSuratTugas(e.target.value)}
                  style={{
                    width: "100%",
                    height: "38px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    padding: "0 12px",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    outline: "none"
                  }}
                />
              </div>

              {/* Grid: Ketua Tim & Sertifikasi */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
                    Nama Ketua Tim Pengawas <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Ir. Hendra Setiawan, S.T."
                    value={formKetuaTim}
                    onChange={(e) => setFormKetuaTim(e.target.value)}
                    required
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
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
                    Sertifikasi / Keahlian Ketua (Bila Ada)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Asesor Utama / Ahli Madya SMKK"
                    value={formSertifikasiKetua}
                    onChange={(e) => setFormSertifikasiKetua(e.target.value)}
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

              {/* Grid: Jumlah Personil, Tahun & Tanggal Tugas */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
                    Jumlah Personil <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Contoh: 6"
                    value={formJumlah}
                    onChange={(e) => setFormJumlah(e.target.value)}
                    required
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
                  <span style={{ fontSize: "10px", color: "#64748B", display: "block", marginTop: "3px" }}>
                    1 Kesatuan Surat Tugas
                  </span>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
                    Tahun Anggaran <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <select
                    value={formTahun}
                    onChange={(e) => setFormTahun(e.target.value)}
                    style={{
                      width: "100%",
                      height: "38px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      padding: "0 10px",
                      fontSize: "12px",
                      fontWeight: 600,
                      outline: "none",
                      backgroundColor: "#FFFFFF"
                    }}
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
                    Tanggal Surat Tugas <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={formTanggalSuratTugas}
                    onChange={(e) => setFormTanggalSuratTugas(e.target.value)}
                    required
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
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
                  Keterangan / Ruang Lingkup Penugasan
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan penugasan pengawasan teknis jasa konstruksi..."
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    padding: "8px 12px",
                    fontSize: "12px",
                    outline: "none"
                  }}
                />
              </div>

              {/* File Uploader */}
              <FileUploader
                label="Dokumen Surat Tugas (PDF)"
                accept=".pdf"
                maxSizeMb={5}
                hint="Surat Perintah Tugas / Dokumen Penugasan Resmi (Maks 5 MB, PDF)"
                onFileSelect={(file) => setUploadedFile(file)}
              />

              {/* Modal Footer */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "8px 16px",
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
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#0F2E5C",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: isSubmitting ? "not-allowed" : "pointer"
                  }}
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Surat Tugas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Penugasan SDM */}
      {showEditModal && editingRecord && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              border: "1px solid #E2E8F0"
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px",
                borderBottom: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#0F2E5C",
                color: "#FFFFFF",
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px"
              }}
            >
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0 }}>
                  Ubah Data Surat Tugas & Personil Pengawas
                </h3>
                <p style={{ fontSize: "12px", margin: "4px 0 0 0", color: "#93C5FD" }}>
                  Perbarui alokasi tim personil untuk {editingRecord.namaTim}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingRecord(null);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  padding: "4px"
                }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveEdit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
                  Nama Tim / Satgas Pengawas <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={editNamaTim}
                  onChange={(e) => setEditNamaTim(e.target.value)}
                  required
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
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
                  Nomor Surat Tugas <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={editNomorSuratTugas}
                  onChange={(e) => setEditNomorSuratTugas(e.target.value)}
                  style={{
                    width: "100%",
                    height: "38px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    padding: "0 12px",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    outline: "none"
                  }}
                />
              </div>

              {/* Grid: Ketua Tim & Sertifikasi */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
                    Nama Ketua Tim Pengawas <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editKetuaTim}
                    onChange={(e) => setEditKetuaTim(e.target.value)}
                    required
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
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
                    Sertifikasi / Keahlian Ketua (Bila Ada)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Asesor Utama / Ahli Madya SMKK"
                    value={editSertifikasiKetua}
                    onChange={(e) => setEditSertifikasiKetua(e.target.value)}
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

              {/* Grid: Jumlah Personil, Tahun & Tanggal */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
                    Jumlah Personil <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editJumlah}
                    onChange={(e) => setEditJumlah(e.target.value)}
                    required
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
                  <span style={{ fontSize: "10px", color: "#64748B", display: "block", marginTop: "3px" }}>
                    1 Kesatuan Surat Tugas
                  </span>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
                    Tahun Anggaran <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <select
                    value={editTahun}
                    onChange={(e) => setEditTahun(e.target.value)}
                    style={{
                      width: "100%",
                      height: "38px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      padding: "0 10px",
                      fontSize: "12px",
                      fontWeight: 600,
                      outline: "none",
                      backgroundColor: "#FFFFFF"
                    }}
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
                    Tanggal Surat Tugas <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={editTanggalSuratTugas}
                    onChange={(e) => setEditTanggalSuratTugas(e.target.value)}
                    required
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
                  />
                </div>
              </div>

              {/* Status Verifikasi */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
                  Status Verifikasi Penugasan
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  style={{
                    width: "100%",
                    height: "38px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    padding: "0 10px",
                    fontSize: "12px",
                    fontWeight: 600,
                    outline: "none",
                    backgroundColor: "#FFFFFF"
                  }}
                >
                  <option value="Terverifikasi">Terverifikasi (Disetujui)</option>
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
                  Keterangan / Ruang Lingkup Penugasan
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
                    outline: "none"
                  }}
                />
              </div>

              {/* Modal Footer */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRecord(null);
                  }}
                  style={{
                    padding: "8px 16px",
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
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#0F2E5C",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: isSubmitting ? "not-allowed" : "pointer"
                  }}
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan Penugasan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Personil & Surat Tugas */}
      {detailRecord && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              border: "1px solid #E2E8F0",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                padding: "18px 20px",
                backgroundColor: "#0F2E5C",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div>
                <span style={{ fontSize: "11px", color: "#93C5FD", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Detail Penugasan SDM Pengawas
                </span>
                <h3 style={{ fontSize: "15px", fontWeight: 800, margin: "2px 0 0 0" }}>
                  {detailRecord.namaTim}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailRecord(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#FFFFFF",
                  cursor: "pointer"
                }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ backgroundColor: "#F8FAFC", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <span style={{ fontSize: "11px", color: "#64748B", display: "block" }}>Nomor Surat Tugas</span>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", fontFamily: "monospace" }}>
                    {detailRecord.nomorSuratTugas || "-"}
                  </span>
                </div>

                <div style={{ backgroundColor: "#F8FAFC", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <span style={{ fontSize: "11px", color: "#64748B", display: "block" }}>Tanggal Tugas</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>
                    {detailRecord.tanggalSuratTugas || "2026-03-24"}
                  </span>
                </div>
              </div>

              <div style={{ backgroundColor: "#F8FAFC", padding: "12px 14px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: "11px", color: "#64748B", display: "block" }}>Ketua Tim & Sertifikasi</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C" }}>
                    {detailRecord.ketuaTim}
                  </span>
                  {detailRecord.sertifikasiKetua && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        color: "#1D4ED8",
                        backgroundColor: "#EFF6FF",
                        border: "1px solid #BFDBFE",
                        padding: "2px 8px",
                        borderRadius: "4px"
                      }}
                    >
                      {detailRecord.sertifikasiKetua}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ backgroundColor: "#F8FAFC", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <span style={{ fontSize: "11px", color: "#64748B", display: "block" }}>Jumlah Personil Tim</span>
                  <span style={{ fontSize: "14px", fontWeight: 900, color: "#0F2E5C" }}>
                    {detailRecord.jumlahSdm} Personil
                  </span>
                  <span style={{ fontSize: "10px", color: "#64748B", display: "block" }}>1 Kesatuan Surat Tugas</span>
                </div>

                <div style={{ backgroundColor: "#F8FAFC", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <span style={{ fontSize: "11px", color: "#64748B", display: "block" }}>Status Verifikasi</span>
                  <div style={{ marginTop: "4px" }}>
                    <StatusBadge status={detailRecord.status} size="sm" showDot />
                  </div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "11px", color: "#64748B", display: "block", marginBottom: "4px" }}>Dokumen Surat Tugas</span>
                <DocStatusBadge
                  status={detailRecord._docStatus || (detailRecord.dokumen ? "complete" : "pending")}
                  fileName={detailRecord.dokumen}
                  documentLabel="Dokumen Surat Tugas"
                  onClick={() => {
                    const tgt = detailRecord;
                    setDetailRecord(null);
                    setDocUploadTarget(tgt);
                  }}
                />
              </div>

              {detailRecord.keterangan && (
                <div style={{ backgroundColor: "#F8FAFC", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <span style={{ fontSize: "11px", color: "#64748B", display: "block" }}>Ruang Lingkup Tugas</span>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#475569" }}>{detailRecord.keterangan}</p>
                </div>
              )}
            </div>

            <div style={{ padding: "14px 20px", backgroundColor: "#F8FAFC", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setDetailRecord(null)}
                style={{
                  backgroundColor: "#0F2E5C",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 18px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safety Confirmation Dialog Hapus Penugasan SDM */}
      {showDeleteConfirm && deletingRecord && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "460px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              border: "1px solid #E2E8F0",
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
                <AlertTriangle style={{ width: "22px", height: "22px" }} />
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F2E5C", margin: "0 0 6px 0" }}>
                  Konfirmasi Hapus Penugasan SDM
                </h3>
                <p style={{ fontSize: "13px", color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                  Apakah Anda yakin ingin menghapus data penugasan tim:{" "}
                  <strong style={{ color: "#0F2E5C" }}>
                    &ldquo;{deletingRecord.namaTim}&rdquo; ({deletingRecord.jumlahSdm} Personil)
                  </strong>?
                  Tindakan ini akan menghapus alokasi tim dari dokumen perencanaan kerja pengawasan.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingRecord(null);
                }}
                style={{
                  padding: "8px 18px",
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
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#DC2626",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Trash2 style={{ width: "14px", height: "14px" }} />
                <span>Ya, Hapus Penugasan</span>
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
          title={`Unggah Dokumen Surat Tugas — ${docUploadTarget.namaTim}`}
          subtitle={`Tahun ${docUploadTarget.tahun} • ${docUploadTarget.jumlahSdm} Personil (1 Kesatuan Tim)`}
          documentFields={[
            { key: "dokumen", label: "Dokumen Surat Tugas (PDF)", accept: ".pdf", maxSizeMb: 5, required: true }
          ]}
          currentValues={{ dokumen: docUploadTarget.dokumen }}
          onSave={handleSaveUploadedDoc}
        />
      )}
    </div>
  );
}

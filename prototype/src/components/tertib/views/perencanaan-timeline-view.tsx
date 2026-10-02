"use client";
import React, { useState } from "react";
import ModuleHeader from "@/components/layout/module-header";
import PerencanaanSubtabNav from "@/components/tertib/perencanaan-subtab-nav";
import { TertibType, TERTIB_CONFIGS } from "@/lib/tertib-config";
import { mockTimelineRecords, TimelineRecord } from "@/data/tertib-mock-data";
import { 
  StatusBadge, FileUploader, DataTableView, 
  ModalForm, ColumnDef 
} from "@/components/common";
import { Calendar, Plus, Download, FileText, Clock, CheckCircle2, AlertCircle, Filter, Eye, TrendingUp } from "lucide-react";

interface PerencanaanTimelineViewProps {
  tertibType: TertibType;
}

export default function PerencanaanTimelineView({ tertibType }: PerencanaanTimelineViewProps) {
  const config = TERTIB_CONFIGS[tertibType];
  const [data, setData] = useState<TimelineRecord[]>(
    mockTimelineRecords.filter((r) => r.tertibType === tertibType)
  );
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formKegiatan, setFormKegiatan] = useState("");
  const [formPeriode, setFormPeriode] = useState("Triwulan I (Jan - Mar 2026)");
  const [formBulanMulai, setFormBulanMulai] = useState("Januari 2026");
  const [formBulanSelesai, setFormBulanSelesai] = useState("Maret 2026");
  const [formTargetBujk, setFormTargetBujk] = useState("");
  const [formStatus, setFormStatus] = useState<"Terjadwal" | "Berjalan" | "Selesai">("Terjadwal");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const filteredData = data.filter((item) => {
    const matchStatus = filterStatus === "Semua" || item.status === filterStatus;
    const matchSearch = item.kegiatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.periode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalTarget = data.reduce((acc, curr) => acc + curr.targetBujk, 0);
  const totalSelesai = data.filter((d) => d.status === "Selesai").length;
  const totalBerjalan = data.filter((d) => d.status === "Berjalan").length;

  const handleAddTimeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKegiatan || !formTargetBujk) {
      alert("Mohon lengkapi Nama Kegiatan dan Target Jumlah Objek!");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newRecord: TimelineRecord = {
        id: `TIME-${Date.now().toString().slice(-4)}`,
        tertibType,
        kegiatan: formKegiatan,
        periode: formPeriode,
        bulanMulai: formBulanMulai,
        bulanSelesai: formBulanSelesai,
        targetBujk: parseInt(formTargetBujk, 10),
        status: formStatus,
        dokumenJadwal: uploadedFile ? uploadedFile.name : `Jadwal_${formPeriode.replace(/\s+/g, "_")}.pdf`
      };

      setData([newRecord, ...data]);
      setIsSubmitting(false);
      setShowModal(false);
      setFormKegiatan("");
      setFormTargetBujk("");
      setUploadedFile(null);
      alert(`Jadwal kegiatan "${formKegiatan}" berhasil ditambahkan ke rencana pengawasan!`);
    }, 600);
  };

  const columns: ColumnDef<TimelineRecord>[] = [
    {
      key: "no",
      label: "NO",
      width: "50px",
      sortable: false,
      render: (_, idx) => <span style={{ fontWeight: 700, color: "#64748B" }}>{idx + 1}</span>
    },
    {
      key: "kegiatan",
      label: "KEGIATAN PENGAWASAN",
      sortable: true,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C" }}>
            {row.kegiatan}
          </span>
          <span style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
            Pelaksanaan: {row.bulanMulai} s/d {row.bulanSelesai}
          </span>
        </div>
      )
    },
    {
      key: "periode",
      label: "PERIODE / SIKLUS",
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#1E293B" }}>
          {row.periode}
        </span>
      )
    },
    {
      key: "targetBujk",
      label: "TARGET OBJEK",
      align: "center",
      sortable: true,
      render: (row) => (
        <span
          style={{
            fontSize: "12px",
            fontWeight: 900,
            color: "#0F2E5C",
            backgroundColor: "#F1F5F9",
            padding: "4px 10px",
            borderRadius: "8px"
          }}
        >
          {row.targetBujk} Objek
        </span>
      )
    },
    {
      key: "dokumenJadwal",
      label: "DOKUMEN RENCANA",
      sortable: false,
      render: (row) => (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert(`Mengunduh berkas ${row.dokumenJadwal}...`);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11px",
            fontWeight: 700,
            color: "#2563EB",
            textDecoration: "none"
          }}
        >
          <FileText style={{ width: "13px", height: "13px" }} />
          <span style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {row.dokumenJadwal}
          </span>
        </a>
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
      {/* Header */}
      <ModuleHeader
        breadcrumbs={[
          { label: config.shortTitle, href: config.basePath },
          { label: "Perencanaan", href: `${config.basePath}/perencanaan` },
          { label: "Timeline Pelaksanaan" }
        ]}
        badgeText={config.pilar}
        badgeBg={config.badgeBg}
        badgeColor={config.badgeColor}
        title={`Timeline Pelaksanaan Pengawasan — ${config.shortTitle}`}
        description="Jadwal waktu operasional pengawasan berkala, audit kepatuhan lapangan, dan siklus pelaporan triwulanan TA 2026."
        legalBasis={config.legalBasis}
        actionButtons={[
          {
            label: "Tambah Jadwal",
            icon: Plus,
            variant: "primary",
            onClick: () => setShowModal(true)
          },
          {
            label: "Unduh Jadwal (PDF)",
            icon: Download,
            onClick: () => alert("Mengunduh Jadwal Rencana Pengawasan Tahunan...")
          }
        ]}
      />

      {/* Subtab Navigation */}
      <PerencanaanSubtabNav tertibType={tertibType} activeSubtab="timeline" />

      {/* Metric Stat Cards (UI/UX Standardized) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        {/* Card 1: Total Agenda */}
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
              Total Agenda
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
              <Calendar style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#0F2E5C", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {data.length} Siklus Jadwal
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ fontSize: "11px", color: "#64748B" }}>
                Tahun Anggaran 2026
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Target Objek */}
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
              Target Objek
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
              <Clock style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#2563EB", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {totalTarget} Objek
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ fontSize: "11px", color: "#64748B" }}>
                Target kumulatif siklus
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Sedang Berjalan */}
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
              Sedang Berjalan
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
              <TrendingUp style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#D97706", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {totalBerjalan} Kegiatan
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#D97706" }} />
              <span style={{ fontSize: "11px", color: "#D97706", fontWeight: 700 }}>
                Aktivitas lapangan aktif
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Jadwal Tuntas */}
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
              Jadwal Tuntas
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
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#059669", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {totalSelesai} Tahapan
            </div>
            <div style={{ marginTop: "10px" }}>
              <div style={{ width: "100%", height: "6px", backgroundColor: "#E2E8F0", borderRadius: "999px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${data.length > 0 ? Math.round((totalSelesai / data.length) * 100) : 0}%`,
                    height: "100%",
                    backgroundColor: "#059669",
                    borderRadius: "999px"
                  }}
                />
              </div>
              <span style={{ fontSize: "11px", color: "#166534", fontWeight: 700, marginTop: "4px", display: "inline-block" }}>
                {data.length > 0 ? Math.round((totalSelesai / data.length) * 100) : 0}% Agenda selesai terlaksana
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: "1 1 280px" }}>
          <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C" }}>Status:</span>
          <div style={{ display: "inline-flex", gap: "6px" }}>
            {["Semua", "Berjalan", "Terjadwal", "Selesai"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: "5px 12px",
                  fontSize: "11px",
                  fontWeight: 800,
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  backgroundColor: filterStatus === st ? "#0F2E5C" : "#F1F5F9",
                  color: filterStatus === st ? "#FFFFFF" : "#64748B"
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div style={{ width: "100%", maxWidth: "260px" }}>
          <input
            type="text"
            placeholder="Cari kegiatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              height: "34px",
              borderRadius: "8px",
              border: "1px solid #CBD5E1",
              padding: "0 12px",
              fontSize: "12px",
              outline: "none"
            }}
          />
        </div>
      </div>

      {/* Reusable DataTableView */}
      <DataTableView<TimelineRecord>
        title={`Matriks Jadwal & Siklus Pengawasan (${filteredData.length})`}
        subtitle="Rincian tahapan operasional audit kepatuhan lapangan berdasar Permen PUPR No. 1 Tahun 2023"
        data={filteredData}
        columns={columns}
        defaultPageSize={5}
        exportFileName={`Timeline_Pengawasan_${tertibType}`}
        actionsHeader="AKSI"
        actionsRender={(row) => (
          <button
            type="button"
            onClick={() => alert(`Detail Kegiatan: "${row.kegiatan}"\nPeriode: ${row.periode}\nTarget: ${row.targetBujk} Objek`)}
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

      {/* Modal Form Tambah Jadwal */}
      <ModalForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Tambah Jadwal Pelaksanaan Pengawasan"
        subtitle={`Input agenda baru untuk siklus ${config.shortTitle}`}
        onSubmit={handleAddTimeline}
        submitLabel="Simpan Jadwal Rencana"
        isLoading={isSubmitting}
        size="lg"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Nama Kegiatan */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
              Nama Kegiatan Pengawasan <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Audit Kesesuaian SKK & SMKK BUJK Menengah-Besar Tahap II"
              value={formKegiatan}
              onChange={(e) => setFormKegiatan(e.target.value)}
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

          {/* Grid Periode & Target */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Siklus Periode
              </label>
              <select
                value={formPeriode}
                onChange={(e) => setFormPeriode(e.target.value)}
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
                <option value="Triwulan I (Jan - Mar 2026)">Triwulan I (Jan - Mar 2026)</option>
                <option value="Triwulan II (Apr - Jun 2026)">Triwulan II (Apr - Jun 2026)</option>
                <option value="Triwulan III (Jul - Sep 2026)">Triwulan III (Jul - Sep 2026)</option>
                <option value="Triwulan IV (Okt - Des 2026)">Triwulan IV (Okt - Des 2026)</option>
                <option value="Semester I 2026">Semester I 2026</option>
                <option value="Semester II 2026">Semester II 2026</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Target Jumlah Objek <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="Contoh: 45"
                value={formTargetBujk}
                onChange={(e) => setFormTargetBujk(e.target.value)}
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

          {/* Grid Bulan Mulai & Selesai */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Bulan Mulai
              </label>
              <input
                type="text"
                placeholder="Contoh: April 2026"
                value={formBulanMulai}
                onChange={(e) => setFormBulanMulai(e.target.value)}
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
                Bulan Selesai
              </label>
              <input
                type="text"
                placeholder="Contoh: Juni 2026"
                value={formBulanSelesai}
                onChange={(e) => setFormBulanSelesai(e.target.value)}
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

          {/* Status Awal */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
              Status Operasional
            </label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as "Terjadwal" | "Berjalan" | "Selesai")}
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
              <option value="Terjadwal">Terjadwal</option>
              <option value="Berjalan">Berjalan</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          {/* File Uploader */}
          <FileUploader
            label="Unggah Dokumen Kerangka Jadwal / KAK (PDF)"
            accept=".pdf"
            maxSizeMb={2}
            onFileSelect={(file) => setUploadedFile(file)}
            hint="Format berkas PDF rencana kerja pengawasan (Maksimal 2 MB)"
          />
        </div>
      </ModalForm>
    </div>
  );
}

"use client";
import React, { useState } from "react";
import Link from "next/link";
import ModuleHeader from "@/components/layout/module-header";
import PerencanaanSubtabNav from "@/components/tertib/perencanaan-subtab-nav";
import { TertibType, TERTIB_CONFIGS } from "@/lib/tertib-config";
import { mockPemetaanRecords, PemetaanRecord } from "@/data/tertib-mock-data";
import { 
  StatusBadge, DataTableView, 
  ModalForm, ColumnDef 
} from "@/components/common";
import BatchImportModal, { BatchColumnDef } from "@/components/common/batch-import-modal";
import { 
  MapPin, Plus, Map, Search, Eye, Download, Building2, 
  AlertTriangle, CheckCircle2, FileSpreadsheet 
} from "lucide-react";

interface PerencanaanPemetaanViewProps {
  tertibType: TertibType;
}

const pemetaanBatchColumns: BatchColumnDef[] = [
  { key: "namaObjek", label: "Nama Objek / Kegiatan", required: true, example: "Pembangunan Jembatan Gantung Sukamaju" },
  { key: "kategori", label: "Kategori Objek", required: true, example: "Infrastruktur Jembatan APBD" },
  { key: "kecamatan", label: "Kecamatan", required: true, example: "Cibinong" },
  { key: "lokasiSpesifik", label: "Alamat / Lokasi Spesifik", required: true, example: "Jl. Raya Cikaret No. 12" },
  { key: "prioritas", label: "Prioritas Audit", required: true, example: "Tinggi" },
  { key: "statusAudit", label: "Status Audit", required: true, example: "Dijadwalkan" }
];

const sampleBatchPemetaan = [
  { namaObjek: "Rehabilitasi Puskesmas Pembantu Cisarua", kategori: "Bangunan Fasilitas Publik", kecamatan: "Cisarua", lokasiSpesifik: "Jl. Raya Puncak Km. 82", prioritas: "Tinggi", statusAudit: "Dijadwalkan" },
  { namaObjek: "Peningkatan Jalan Lingkar Babakan Madang", kategori: "Proyek Jalan APBD", kecamatan: "Babakan Madang", lokasiSpesifik: "Ruas Babakan Madang Sta 0+500", prioritas: "Sedang", statusAudit: "Belum Terjadwal" }
];

const KECAMATAN_BOGOR = [
  "Cibinong", "Citeureup", "Sukaraja", "Babakan Madang",
  "Cileungsi", "Gunung Putri", "Jonggol", "Cariu", "Tanjungsari",
  "Ciawi", "Megamendung", "Cisarua", "Caringin", "Cijeruk", "Tamansari",
  "Kemang", "Bojonggede", "Parung", "Tajurhalang", "Gunung Sindur",
  "Leuwiliang", "Ciampea", "Cibungbulang", "Pamijahan", "Tenjolaya",
  "Rumpin", "Parungpanjang", "Jasinga", "Nanggung", "Cigudeg"
];

export default function PerencanaanPemetaanView({ tertibType }: PerencanaanPemetaanViewProps) {
  const config = TERTIB_CONFIGS[tertibType];
  const [data, setData] = useState<PemetaanRecord[]>(
    mockPemetaanRecords.filter((r) => r.tertibType === tertibType)
  );
  const [filterPrioritas, setFilterPrioritas] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showBatchImportModal, setShowBatchImportModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formNama, setFormNama] = useState("");
  const [formKategori, setFormKategori] = useState(
    tertibType === "tertib-usaha"
      ? "Badan Usaha Jasa Konstruksi (BUJK)"
      : tertibType === "tertib-penyelenggaraan"
      ? "Proyek Infrastruktur Fisik APBD"
      : "Bangunan Gedung Fasilitas Publik"
  );
  const [formKecamatan, setFormKecamatan] = useState("Cibinong");
  const [formLokasi, setFormLokasi] = useState("");
  const [formTahun] = useState("2026");
  const [formPrioritas, setFormPrioritas] = useState<"Tinggi" | "Sedang" | "Rendah">("Tinggi");
  const [formStatusAudit, setFormStatusAudit] = useState<"Sudah Diaudit" | "Dijadwalkan" | "Belum Terjadwal">("Dijadwalkan");

  const filteredData = data.filter((item) => {
    const matchPrioritas = filterPrioritas === "Semua" || item.prioritas === filterPrioritas;
    const matchStatus = filterStatus === "Semua" || item.statusAudit === filterStatus;
    const matchSearch = item.namaObjek.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.kecamatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.kategori.toLowerCase().includes(searchQuery.toLowerCase());
    return matchPrioritas && matchStatus && matchSearch;
  });

  const totalObjek = data.length;
  const totalPrioritasTinggi = data.filter((d) => d.prioritas === "Tinggi").length;
  const totalSudahAudit = data.filter((d) => d.statusAudit === "Sudah Diaudit").length;

  const handleAddPemetaan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama || !formLokasi) {
      alert("Mohon isi Nama Objek dan Alamat / Lokasi Spesifik!");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newRecord: PemetaanRecord = {
        id: `MAP-${Date.now().toString().slice(-4)}`,
        tertibType,
        namaObjek: formNama,
        kategori: formKategori,
        kecamatan: formKecamatan,
        lokasiSpesifik: formLokasi,
        tahun: formTahun,
        statusAudit: formStatusAudit,
        prioritas: formPrioritas
      };

      setData([newRecord, ...data]);
      setIsSubmitting(false);
      setShowModal(false);
      setFormNama("");
      setFormLokasi("");
      alert(`Objek pengawasan "${formNama}" di Kecamatan ${formKecamatan} berhasil dipetakan!`);
    }, 600);
  };

  const handleBatchCommit = (importedItems: Record<string, any>[]) => {
    const newRecords: PemetaanRecord[] = importedItems.map((item, index) => ({
      id: `pm-batch-${Date.now()}-${index}`,
      tertibType,
      namaObjek: item.namaObjek || "Objek Baru",
      kategori: item.kategori || "Infrastruktur Umum",
      kecamatan: item.kecamatan || "Cibinong",
      lokasiSpesifik: item.lokasiSpesifik || "Kabupaten Bogor",
      tahun: "2026",
      prioritas: (item.prioritas as "Tinggi" | "Sedang" | "Rendah") || "Sedang",
      statusAudit: (item.statusAudit as "Sudah Diaudit" | "Dijadwalkan" | "Belum Terjadwal") || "Dijadwalkan"
    }));

    setData((prev) => [...newRecords, ...prev]);
  };

  const columns: ColumnDef<PemetaanRecord>[] = [
    {
      key: "no",
      label: "NO",
      width: "50px",
      sortable: false,
      render: (_, idx) => <span style={{ fontWeight: 700, color: "#64748B" }}>{idx + 1}</span>
    },
    {
      key: "namaObjek",
      label: "NAMA OBJEK & LOKASI",
      sortable: true,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C" }}>
            {row.namaObjek}
          </span>
          <span style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
            {row.lokasiSpesifik}
          </span>
        </div>
      )
    },
    {
      key: "kategori",
      label: "KATEGORI OBJEK",
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>
          {row.kategori}
        </span>
      )
    },
    {
      key: "kecamatan",
      label: "KECAMATAN",
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
          {row.kecamatan}
        </span>
      )
    },
    {
      key: "prioritas",
      label: "PRIORITAS",
      align: "center",
      sortable: true,
      render: (row) => <StatusBadge status={row.prioritas} size="sm" showDot />
    },
    {
      key: "statusAudit",
      label: "STATUS AUDIT",
      align: "center",
      sortable: true,
      render: (row) => <StatusBadge status={row.statusAudit} size="sm" />
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <ModuleHeader
        breadcrumbs={[
          { label: config.shortTitle, href: config.basePath },
          { label: "Perencanaan", href: `${config.basePath}/perencanaan` },
          { label: "Pemetaan Objek" }
        ]}
        badgeText={config.pilar}
        badgeBg={config.badgeBg}
        badgeColor={config.badgeColor}
        title={`Pemetaan Objek Pengawasan — ${config.shortTitle}`}
        description="Inventarisasi sebaran titik lokasi badan usaha, proyek, dan bangunan gedung objek audit di 40 Kecamatan Kabupaten Bogor."
        legalBasis={config.legalBasis}
        actionButtons={[
          {
            label: "Import Batch Objek (Excel/CSV)",
            icon: FileSpreadsheet,
            variant: "outline",
            onClick: () => setShowBatchImportModal(true)
          },
          {
            label: "Buka di WebGIS Peta",
            icon: Map,
            variant: "primary",
            href: "/webgis"
          },
          {
            label: "Tambah Titik Objek",
            icon: Plus,
            variant: "secondary",
            onClick: () => setShowModal(true)
          },
          {
            label: "Unduh Peta (PDF)",
            icon: Download,
            onClick: () => alert("Mengunduh Peta Sebaran Titik Objek Pengawasan...")
          }
        ]}
      />

      {/* Subtab Navigation */}
      <PerencanaanSubtabNav tertibType={tertibType} activeSubtab="pemetaan" />

      {/* 4 Metric Cards (Modern UI/UX Revamped) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
        {/* Card 1: Total Terpetakan */}
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
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Total Terpetakan
              </span>
              <span style={{ display: "block", fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>
                Objek Audit Lapangan
              </span>
            </div>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#EFF6FF",
                color: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <MapPin style={{ width: "20px", height: "20px" }} />
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#0F2E5C", margin: 0, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              {totalObjek} Titik Objek
            </h3>
          </div>

          <div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #F1F5F9" }}>
            <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Tahun Anggaran 2026</span>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#1E40AF", backgroundColor: "#DBEAFE", padding: "2px 8px", borderRadius: "9999px" }}>
              Inventaris Aktif
            </span>
          </div>
        </div>

        {/* Card 2: Prioritas Tinggi */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #EF4444",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Prioritas Tinggi
              </span>
              <span style={{ display: "block", fontSize: "11px", color: "#EF4444", fontWeight: 700, marginTop: "2px" }}>
                Lokasi Kritis / Strategis
              </span>
            </div>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#FEE2E2",
                color: "#991B1B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <AlertTriangle style={{ width: "20px", height: "20px" }} />
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#991B1B", margin: 0, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              {totalPrioritasTinggi} Lokasi Kritis
            </h3>
          </div>

          <div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #F1F5F9" }}>
            <span style={{ fontSize: "11px", color: "#991B1B", fontWeight: 700 }}>Perlu Audit Segera</span>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#991B1B", backgroundColor: "#FEE2E2", padding: "2px 8px", borderRadius: "9999px" }}>
              Kritis
            </span>
          </div>
        </div>

        {/* Card 3: Realisasi Audit */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #10B981",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Realisasi Audit
              </span>
              <span style={{ display: "block", fontSize: "11px", color: "#166534", fontWeight: 700, marginTop: "2px" }}>
                BAP SIMAK Terverifikasi
              </span>
            </div>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#DCFCE7",
                color: "#166534",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <CheckCircle2 style={{ width: "20px", height: "20px" }} />
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#166534", margin: 0, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              {totalSudahAudit} Selesai Audit
            </h3>
          </div>

          <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid #F1F5F9" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}>Capaian Audit</span>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#166534" }}>
                {totalObjek > 0 ? Math.round((totalSudahAudit / totalObjek) * 100) : 0}%
              </span>
            </div>
            <div style={{ width: "100%", height: "6px", backgroundColor: "#F1F5F9", borderRadius: "9999px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${totalObjek > 0 ? Math.min(Math.round((totalSudahAudit / totalObjek) * 100), 100) : 0}%`,
                  height: "100%",
                  backgroundColor: "#10B981",
                  borderRadius: "9999px"
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Cakupan Wilayah */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #6366F1",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Cakupan Wilayah
              </span>
              <span style={{ display: "block", fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>
                Wilayah Kerja DPU
              </span>
            </div>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#EEF2FF",
                color: "#4F46E5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <Building2 style={{ width: "20px", height: "20px" }} />
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#1E1B4B", margin: 0, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              40 Kecamatan
            </h3>
          </div>

          <div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #F1F5F9" }}>
            <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Kabupaten Bogor</span>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#4338CA", backgroundColor: "#EEF2FF", padding: "2px 8px", borderRadius: "9999px" }}>
              100% Terpetakan
            </span>
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
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C" }}>Prioritas:</span>
            <div style={{ display: "inline-flex", gap: "4px" }}>
              {["Semua", "Tinggi", "Sedang"].map((pr) => (
                <button
                  key={pr}
                  type="button"
                  onClick={() => setFilterPrioritas(pr)}
                  style={{
                    padding: "4px 10px",
                    fontSize: "11px",
                    fontWeight: 800,
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: filterPrioritas === pr ? "#0F2E5C" : "#F1F5F9",
                    color: filterPrioritas === pr ? "#FFFFFF" : "#64748B"
                  }}
                >
                  {pr}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C" }}>Audit:</span>
            <div style={{ display: "inline-flex", gap: "4px" }}>
              {["Semua", "Sudah Diaudit", "Dijadwalkan"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  style={{
                    padding: "4px 10px",
                    fontSize: "11px",
                    fontWeight: 800,
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: filterStatus === st ? "#0F2E5C" : "#F1F5F9",
                    color: filterStatus === st ? "#FFFFFF" : "#64748B"
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ width: "100%", maxWidth: "260px" }}>
          <input
            type="text"
            placeholder="Cari objek / kecamatan..."
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
      <DataTableView<PemetaanRecord>
        title={`Daftar Inventaris Objek Pengawasan (${filteredData.length})`}
        subtitle="Data geospasial sebaran objek audit di seluruh wilayah kerja Kabupaten Bogor"
        data={filteredData}
        columns={columns}
        defaultPageSize={5}
        exportFileName={`Pemetaan_Objek_${tertibType}`}
        actionsHeader="AKSI"
        actionsRender={(row) => (
          <div style={{ display: "inline-flex", gap: "6px" }}>
            <Link
              href="/webgis"
              style={{
                backgroundColor: "#0F2E5C",
                color: "#FFFFFF",
                borderRadius: "6px",
                padding: "5px 10px",
                fontSize: "11px",
                fontWeight: 800,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <Map style={{ width: "11px", height: "11px" }} />
              <span>Peta</span>
            </Link>
            <button
              type="button"
              onClick={() => alert(`Objek: ${row.namaObjek}\nLokasi: ${row.lokasiSpesifik}\nKecamatan: ${row.kecamatan}\nPrioritas: ${row.prioritas}`)}
              style={{
                backgroundColor: "#EBF2FA",
                color: "#0F2E5C",
                border: "none",
                borderRadius: "6px",
                padding: "5px 10px",
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer"
              }}
            >
              Detail
            </button>
          </div>
        )}
      />

      {/* Modal Form Tambah Objek */}
      <ModalForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Tambah Objek Pengawasan Terpetakan"
        subtitle={`Pendataan lokasi objek audit untuk ${config.shortTitle}`}
        onSubmit={handleAddPemetaan}
        submitLabel="Simpan Titik Objek"
        isLoading={isSubmitting}
        size="lg"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Nama Objek */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
              Nama Objek Pengawasan <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: PT. Sentosa Cipta Mandiri atau Pembangunan Jembatan Bojonggede"
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

          {/* Grid Kategori & Kecamatan */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Kategori Objek
              </label>
              <input
                type="text"
                value={formKategori}
                onChange={(e) => setFormKategori(e.target.value)}
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
                Kecamatan (Kab. Bogor)
              </label>
              <select
                value={formKecamatan}
                onChange={(e) => setFormKecamatan(e.target.value)}
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
                {KECAMATAN_BOGOR.map((kec) => (
                  <option key={kec} value={kec}>
                    Kecamatan {kec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lokasi Spesifik */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
              Alamat Lengkap / Lokasi Spesifik <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Jl. Tegar Beriman No. 12, Kel. Pakansari"
              value={formLokasi}
              onChange={(e) => setFormLokasi(e.target.value)}
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

          {/* Grid Prioritas & Status Audit */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Tingkat Prioritas Audit
              </label>
              <select
                value={formPrioritas}
                onChange={(e) => setFormPrioritas(e.target.value as "Tinggi" | "Sedang" | "Rendah")}
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
                <option value="Tinggi">Tinggi (Kritis / Proyek Strategis)</option>
                <option value="Sedang">Sedang (Rutin / Berkala)</option>
                <option value="Rendah">Rendah (Sampling)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Status Audit Awal
              </label>
              <select
                value={formStatusAudit}
                onChange={(e) => setFormStatusAudit(e.target.value as "Sudah Diaudit" | "Dijadwalkan" | "Belum Terjadwal")}
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
                <option value="Dijadwalkan">Dijadwalkan</option>
                <option value="Belum Terjadwal">Belum Terjadwal</option>
                <option value="Sudah Diaudit">Sudah Diaudit</option>
              </select>
            </div>
          </div>
        </div>
      </ModalForm>

      {/* Batch Import Modal */}
      <BatchImportModal
        isOpen={showBatchImportModal}
        onClose={() => setShowBatchImportModal(false)}
        title={`Import Batch Objek Pengawasan (${config.shortTitle})`}
        subtitle="Unggah berkas Excel atau CSV untuk memasukkan daftar objek/titik audit secara massal."
        expectedColumns={pemetaanBatchColumns}
        sampleRows={sampleBatchPemetaan}
        templateFileName={`template_batch_pemetaan_${tertibType}.csv`}
        onCommit={handleBatchCommit}
      />
    </div>
  );
}

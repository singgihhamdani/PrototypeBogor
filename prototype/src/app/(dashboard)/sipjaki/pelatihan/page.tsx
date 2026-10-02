"use client";
import React, { useState } from "react";
import ModuleHeader from "@/components/layout/module-header";
import { 
  GraduationCap, Users, Calendar, Filter, Download, 
  Search, Plus, FileSpreadsheet, Eye, Award, CheckCircle2, 
  Trash2, TrendingUp, PieChart, BarChart3, UploadCloud, X
} from "lucide-react";
import DataTableView, { ColumnDef } from "@/components/common/data-table-view";
import ModalForm from "@/components/common/modal-form";
import FileUploader from "@/components/common/file-uploader";
import { exportToSpreadsheet } from "@/lib/export-utils";
import { TEMPLATE_PELATIHAN } from "@/lib/sipjaki-templates";

export interface TrainingEvent {
  id: string;
  tahun: string;
  namaKegiatan: string;
  metode: string;
  lokasi: string;
  lakiLaki: number;
  perempuan: number;
  totalPeserta: number;
  kabupaten: string;
  provinsi: string;
  status: string;
}

const mockTrainingEvents: TrainingEvent[] = [
  {
    id: "PEL-2026-001",
    tahun: "2026",
    namaKegiatan: "Pelatihan & Sertifikasi Pelaksana Lapangan Pekerjaan Jalan Madya",
    metode: "Hybrid",
    lokasi: "Pusdiklat DPU Cibinong",
    lakiLaki: 38,
    perempuan: 7,
    totalPeserta: 45,
    kabupaten: "Kabupaten Bogor",
    provinsi: "Jawa Barat",
    status: "Selesai & Tersertifikasi"
  },
  {
    id: "PEL-2026-002",
    tahun: "2026",
    namaKegiatan: "Bimtek Petugas K3 Konstruksi & Penerapan SMKK Angkatan I",
    metode: "Reguler",
    lokasi: "Sentul City Convention Hall",
    lakiLaki: 52,
    perempuan: 13,
    totalPeserta: 65,
    kabupaten: "Kabupaten Bogor",
    provinsi: "Jawa Barat",
    status: "Selesai & Tersertifikasi"
  },
  {
    id: "PEL-2026-003",
    tahun: "2026",
    namaKegiatan: "Mobile Training Unit (MTU) Tukang Pasang Bata & Plesteran",
    metode: "Mobile Training Unit (MTU)",
    lokasi: "Kecamatan Leuwiliang & Cigudeg",
    lakiLaki: 60,
    perempuan: 0,
    totalPeserta: 60,
    kabupaten: "Kabupaten Bogor",
    provinsi: "Jawa Barat",
    status: "Sedang Berjalan"
  },
  {
    id: "PEL-2026-004",
    tahun: "2026",
    namaKegiatan: "Fasilitasi Sertifikasi Juru Ukur (Surveyor) Berbasis SKK",
    metode: "On The Job Training",
    lokasi: "Proyek Jl. Bomang Sta 2+000",
    lakiLaki: 28,
    perempuan: 4,
    totalPeserta: 32,
    kabupaten: "Kabupaten Bogor",
    provinsi: "Jawa Barat",
    status: "Terjadwal Q2"
  }
];

export default function SipjakiPelatihanPage() {
  const [trainingList, setTrainingList] = useState<TrainingEvent[]>(mockTrainingEvents);
  const [selectedEvent, setSelectedEvent] = useState<TrainingEvent>(mockTrainingEvents[0]);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [previewImportData, setPreviewImportData] = useState<TrainingEvent[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    namaKegiatan: "",
    tahun: "2026",
    metode: "Hybrid",
    lokasi: "Kabupaten Bogor",
    lakiLaki: 30,
    perempuan: 10,
    status: "Sedang Berjalan",
    kabupaten: "Kabupaten Bogor",
    provinsi: "Jawa Barat"
  });

  // Calculate Metrics
  const totalPeserta = trainingList.reduce((acc, curr) => acc + curr.totalPeserta, 0);
  const totalLakiLaki = trainingList.reduce((acc, curr) => acc + curr.lakiLaki, 0);
  const totalPerempuan = trainingList.reduce((acc, curr) => acc + curr.perempuan, 0);
  const percentLaki = totalPeserta > 0 ? Math.round((totalLakiLaki / totalPeserta) * 100) : 0;
  const percentPerempuan = totalPeserta > 0 ? 100 - percentLaki : 0;

  // Breakdown by method
  const methodStats = [
    { method: "Hybrid", color: "#3B82F6" },
    { method: "Reguler", color: "#10B981" },
    { method: "Mobile Training Unit (MTU)", color: "#F59E0B" },
    { method: "On The Job Training", color: "#8B5CF6" }
  ].map(m => {
    const events = trainingList.filter(t => t.metode === m.method);
    const count = events.reduce((acc, curr) => acc + curr.totalPeserta, 0);
    const percentage = totalPeserta > 0 ? Math.round((count / totalPeserta) * 100) : 0;
    return { ...m, count, percentage, eventCount: events.length };
  });

  // Handle Add Training
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaKegiatan || !formData.lokasi) {
      alert("Harap lengkapi nama kegiatan dan lokasi pelatihan!");
      return;
    }

    const laki = Number(formData.lakiLaki) || 0;
    const perempuan = Number(formData.perempuan) || 0;
    const total = laki + perempuan;
    const newId = `PEL-2026-${String(trainingList.length + 1).padStart(3, "0")}`;

    const newEvent: TrainingEvent = {
      id: newId,
      tahun: formData.tahun,
      namaKegiatan: formData.namaKegiatan,
      metode: formData.metode,
      lokasi: formData.lokasi,
      lakiLaki: laki,
      perempuan: perempuan,
      totalPeserta: total,
      kabupaten: formData.kabupaten,
      provinsi: formData.provinsi,
      status: formData.status
    };

    const updated = [newEvent, ...trainingList];
    setTrainingList(updated);
    setSelectedEvent(newEvent);
    setIsAddModalOpen(false);

    // Reset
    setFormData({
      namaKegiatan: "",
      tahun: "2026",
      metode: "Hybrid",
      lokasi: "Kabupaten Bogor",
      lakiLaki: 30,
      perempuan: 10,
      status: "Sedang Berjalan",
      kabupaten: "Kabupaten Bogor",
      provinsi: "Jawa Barat"
    });
  };

  // Handle Excel File Selection Simulation
  const handleFileSelect = (file: File | null) => {
    setExcelFile(file);
    if (file) {
      // Simulate parsed rows from Excel
      const parsedMock: TrainingEvent[] = [
        {
          id: `PEL-IMP-01`,
          tahun: "2026",
          namaKegiatan: "Sertifikasi Tenaga Kerja Ahli Muda K3 Konstruksi",
          metode: "Hybrid",
          lokasi: "Sentul Highland",
          lakiLaki: 35,
          perempuan: 15,
          totalPeserta: 50,
          kabupaten: "Kabupaten Bogor",
          provinsi: "Jawa Barat",
          status: "Terjadwal Q2"
        },
        {
          id: `PEL-IMP-02`,
          tahun: "2026",
          namaKegiatan: "MTU Pembinaan Juru Ukur Gedung Wilayah Timur",
          metode: "Mobile Training Unit (MTU)",
          lokasi: "Kecamatan Cileungsi",
          lakiLaki: 40,
          perempuan: 0,
          totalPeserta: 40,
          kabupaten: "Kabupaten Bogor",
          provinsi: "Jawa Barat",
          status: "Sedang Berjalan"
        }
      ];
      setPreviewImportData(parsedMock);
    } else {
      setPreviewImportData([]);
    }
  };

  const handleCommitImport = () => {
    if (previewImportData.length === 0) {
      alert("Tidak ada data impor untuk diproses!");
      return;
    }
    setTrainingList([...previewImportData, ...trainingList]);
    setIsImportModalOpen(false);
    setExcelFile(null);
    setPreviewImportData([]);
    alert(`Berhasil mengimpor ${previewImportData.length} kegiatan pelatihan ke dalam SIPJAKI!`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data kegiatan pelatihan ini?")) {
      const next = trainingList.filter(t => t.id !== id);
      setTrainingList(next);
      if (selectedEvent.id === id && next.length > 0) {
        setSelectedEvent(next[0]);
      }
    }
  };

  // Table Columns
  const tableColumns: ColumnDef<TrainingEvent>[] = [
    {
      key: "namaKegiatan",
      label: "KEGIATAN & LOKASI",
      render: (row) => (
        <div>
          <div style={{ fontSize: "12px", fontWeight: 800, color: selectedEvent.id === row.id ? "#1D4ED8" : "#0F2E5C" }}>
            {row.namaKegiatan}
          </div>
          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
            📍 {row.lokasi} • TA {row.tahun}
          </div>
        </div>
      )
    },
    {
      key: "metode",
      label: "METODE",
      width: "150px",
      align: "center",
      render: (row) => (
        <span 
          style={{ 
            fontSize: "10px", 
            fontWeight: 700, 
            padding: "3px 8px", 
            borderRadius: "6px", 
            backgroundColor: "#F1F5F9", 
            color: "#334155" 
          }}
        >
          {row.metode}
        </span>
      )
    },
    {
      key: "totalPeserta",
      label: "PESERTA",
      width: "120px",
      align: "center",
      render: (row) => (
        <div>
          <span style={{ fontSize: "12px", fontWeight: 900, color: "#0F2E5C" }}>
            {row.totalPeserta} Org
          </span>
          <div style={{ fontSize: "10px", color: "#64748B" }}>
            👨{row.lakiLaki} 👩{row.perempuan}
          </div>
        </div>
      )
    },
    {
      key: "status",
      label: "STATUS",
      width: "140px",
      align: "center",
      render: (row) => {
        const isDone = row.status.includes("Selesai");
        const isOngoing = row.status.includes("Sedang Berjalan");
        return (
          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              padding: "3px 8px",
              borderRadius: "6px",
              backgroundColor: isDone ? "#DCFCE7" : isOngoing ? "#FEF3C7" : "#EBF2FA",
              color: isDone ? "#166534" : isOngoing ? "#92400E" : "#0F2E5C"
            }}
          >
            {row.status}
          </span>
        );
      }
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      {/* Header */}
      <ModuleHeader
        breadcrumbs={[
          { label: "SIPJAKI Master", href: "/dashboard" },
          { label: "Pelatihan & Sertifikasi TKK" }
        ]}
        badgeText="SIPJAKI Master Data"
        badgeBg="#EDE9FE"
        badgeColor="#5B21B6"
        title="Dashboard Visualisasi Pelatihan SIPJAKI"
        description="Analitik visual penyelenggaraan pelatihan, sertifikasi kompetensi kerja (SKK), dan sebaran peserta TKK Kabupaten Bogor."
        legalBasis="Permen PUPR No. 1/2023 & UU No. 2/2017"
        actionButtons={[
          {
            label: "Import Excel",
            icon: FileSpreadsheet,
            variant: "outline",
            onClick: () => setIsImportModalOpen(true)
          },
          {
            label: "Tambah Pelatihan",
            icon: Plus,
            variant: "primary",
            onClick: () => setIsAddModalOpen(true)
          }
        ]}
      />

      {/* Top 4 Metric Cards (UI/UX Standardized) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        {/* Card 1: Total Program */}
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
              Total Program Pelatihan
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
              <GraduationCap style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#0F2E5C", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {trainingList.length} Program
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10B981" }} />
              <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>
                Tahun Anggaran 2026
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Peserta */}
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
              Total Peserta TKK
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
              <Users style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#2563EB", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {totalPeserta} Orang
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ fontSize: "11px", color: "#64748B" }}>
                👨 {percentLaki}% Pria • 👩 {percentPerempuan}% Wanita
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Kelulusan SKK */}
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
              Kelulusan Asesmen SKK
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
              <Award style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#059669", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              94.2%
            </div>
            <div style={{ marginTop: "10px" }}>
              <div style={{ width: "100%", height: "6px", backgroundColor: "#E2E8F0", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ width: "94.2%", height: "100%", backgroundColor: "#059669", borderRadius: "999px" }} />
              </div>
              <span style={{ fontSize: "11px", color: "#166534", fontWeight: 700, marginTop: "4px", display: "inline-block" }}>
                Tersertifikasi BNSP / LSP
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Status Penyelesaian */}
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
              Status Penyelesaian
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
              <CheckCircle2 style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#D97706", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {trainingList.filter(t => t.status.includes("Selesai")).length} / {trainingList.length} Selesai
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#D97706" }} />
              <span style={{ fontSize: "11px", color: "#D97706", fontWeight: 700 }}>
                {trainingList.filter(t => t.status.includes("Sedang Berjalan")).length} Kelas Sedang Aktif
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "20px" }}>
        {/* Method Distribution Bar Visual */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "18px", padding: "20px 22px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#0F2E5C", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                <BarChart3 style={{ width: "16px", height: "16px", color: "#2563EB" }} /> Distribusi Peserta Berdasarkan Metode
              </h4>
              <p style={{ fontSize: "11px", color: "#64748B", margin: "2px 0 0 0" }}>
                Perbandingan porsi peserta pada masing-masing modalitas pelatihan
              </p>
            </div>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#F1F5F9", padding: "4px 8px", borderRadius: "6px" }}>
              {trainingList.length} Program
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {methodStats.map((item) => (
              <div key={item.method}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" }}>
                  <span style={{ fontWeight: 700, color: "#334155" }}>
                    {item.method} ({item.eventCount} sesi)
                  </span>
                  <span style={{ fontWeight: 800, color: "#0F2E5C" }}>
                    {item.count} Peserta ({item.percentage}%)
                  </span>
                </div>
                <div style={{ width: "100%", height: "8px", backgroundColor: "#F1F5F9", borderRadius: "9999px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${item.percentage}%`,
                      height: "100%",
                      backgroundColor: item.color,
                      borderRadius: "9999px",
                      transition: "width 0.4s ease"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gender Ratio & Annual Target Donut / Progress */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "18px", padding: "20px 22px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#0F2E5C", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "6px" }}>
              <PieChart style={{ width: "16px", height: "16px", color: "#10B981" }} /> Komposisi Gender & Target 2026
            </h4>
            <p style={{ fontSize: "11px", color: "#64748B", margin: 0 }}>
              Keterlibatan gender dan pencapaian target sertifikasi TKK
            </p>
          </div>

          {/* Gender Ratio Visual */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "14px 0" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: 900, color: "#2563EB" }}>
                {percentLaki}%
              </div>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#1E293B", marginTop: "2px" }}>
                👨 Laki-Laki
              </div>
              <div style={{ fontSize: "10px", color: "#64748B" }}>
                {totalLakiLaki} Peserta
              </div>
            </div>

            <div style={{ width: "1px", height: "45px", backgroundColor: "#E2E8F0" }} />

            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: 900, color: "#EC4899" }}>
                {percentPerempuan}%
              </div>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#1E293B", marginTop: "2px" }}>
                👩 Perempuan
              </div>
              <div style={{ fontSize: "10px", color: "#64748B" }}>
                {totalPerempuan} Peserta
              </div>
            </div>
          </div>

          {/* Annual Target Progress */}
          <div style={{ backgroundColor: "#F8FAFC", borderRadius: "12px", padding: "12px 14px", border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
              <span style={{ fontWeight: 700, color: "#475569" }}>Target Realisasi TA 2026</span>
              <span style={{ fontWeight: 800, color: "#0F2E5C" }}>{totalPeserta} / 350 TKK ({Math.round((totalPeserta / 350) * 100)}%)</span>
            </div>
            <div style={{ width: "100%", height: "7px", backgroundColor: "#E2E8F0", borderRadius: "9999px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.min(Math.round((totalPeserta / 350) * 100), 100)}%`,
                  height: "100%",
                  backgroundColor: "#0F2E5C",
                  borderRadius: "9999px"
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Data Table (Left) + Detail Peserta (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.1fr", gap: "20px" }}>
        {/* Table Column with DataTableView */}
        <div>
          <DataTableView<TrainingEvent>
            title="Daftar Agenda Pelatihan & Sertifikasi SIPJAKI"
            subtitle="Klik baris untuk melihat detail sampel peserta dan ringkasan teknis kegiatan"
            data={trainingList}
            columns={tableColumns}
            exportFileName="data-pelatihan-sipjaki-bogor"
            sipjakiTemplate={TEMPLATE_PELATIHAN}
            exportColumns={TEMPLATE_PELATIHAN.columns}
            onRowClick={(row) => setSelectedEvent(row)}
            actionsHeader="AKSI"
            actionsRender={(row) => (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                <button
                  type="button"
                  title="Pilih Kegiatan"
                  onClick={() => setSelectedEvent(row)}
                  style={{
                    backgroundColor: selectedEvent.id === row.id ? "#0F2E5C" : "#EBF2FA",
                    color: selectedEvent.id === row.id ? "#FFFFFF" : "#0F2E5C",
                    border: "none",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    fontSize: "10px",
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  {selectedEvent.id === row.id ? "Aktif" : "Pilih"}
                </button>
                <button
                  type="button"
                  title="Hapus Agenda"
                  onClick={() => handleDelete(row.id)}
                  style={{
                    backgroundColor: "#FEE2E2",
                    color: "#991B1B",
                    border: "none",
                    borderRadius: "6px",
                    padding: "5px",
                    cursor: "pointer"
                  }}
                >
                  <Trash2 style={{ width: "12px", height: "12px" }} />
                </button>
              </div>
            )}
          />
        </div>

        {/* Selected Event Detail & Participant Sample Card */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "18px",
            padding: "22px",
            border: "1px solid #E2E8F0",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            height: "fit-content",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#2563EB", textTransform: "uppercase" }}>
                Detail Kegiatan Terpilih
              </span>
              <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 800, color: "#64748B" }}>
                {selectedEvent.id}
              </span>
            </div>
            <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0F2E5C", margin: "4px 0 0 0", lineHeight: 1.35 }}>
              {selectedEvent.namaKegiatan}
            </h4>
            <p style={{ fontSize: "11px", color: "#64748B", margin: "2px 0 0 0" }}>
              📍 {selectedEvent.lokasi} • {selectedEvent.kabupaten}
            </p>
          </div>

          <div style={{ backgroundColor: "#F8FAFC", borderRadius: "12px", padding: "12px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", border: "1px solid #E2E8F0" }}>
            <div>
              <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700 }}>Total Peserta:</span>
              <p style={{ fontSize: "18px", fontWeight: 900, color: "#0F2E5C", margin: "2px 0 0 0" }}>{selectedEvent.totalPeserta} Orang</p>
            </div>
            <div>
              <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700 }}>Komposisi Gender:</span>
              <p style={{ fontSize: "12px", fontWeight: 800, color: "#475569", margin: "4px 0 0 0" }}>
                👨 {selectedEvent.lakiLaki} L • 👩 {selectedEvent.perempuan} P
              </p>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <h5 style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", margin: 0 }}>
                Daftar Peserta (Sampel Uji Kompetensi):
              </h5>
              <span style={{ fontSize: "10px", color: "#10B981", fontWeight: 700 }}>Terverifikasi LSP</span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                { nama: "Ahmad Fauzi, S.T.", nik: "3201012304890002", jabatan: "Pelaksana Madya", nilai: "88 (Lulus SKK)" },
                { nama: "Rian Hidayat", nik: "3201021405920005", jabatan: "Juru Ukur Jalan", nilai: "84 (Lulus SKK)" },
                { nama: "Siti Rahmawati, A.Md.", nik: "3201035508950001", jabatan: "Petugas K3 Lapangan", nilai: "92 (Lulus SKK)" },
                { nama: "Deden Kurniawan", nik: "3201041902910008", jabatan: "Mandor Pembesian", nilai: "80 (Lulus SKK)" }
              ].map((p, i) => (
                <div key={i} style={{ padding: "8px 10px", borderRadius: "8px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C" }}>{p.nama}</span>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "#166534" }}>{p.nilai}</span>
                  </div>
                  <span style={{ fontSize: "10px", color: "#64748B" }}>NIK: {p.nik} • {p.jabatan}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => exportToSpreadsheet({
              fileName: `Daftar_Nominatif_${selectedEvent.namaKegiatan.replace(/[^a-zA-Z0-9]/g, "_")}`,
              sheetName: "NOMINATIF PESERTA",
              columns: [
                { key: "nama", label: "Nama Lengkap Peserta" },
                { key: "nik", label: "Nomor Induk Kependudukan (NIK)" },
                { key: "jabatan", label: "Jabatan Kerja / Kualifikasi" },
                { key: "nilai", label: "Hasil Asesmen / Status SKK" }
              ],
              data: [
                { nama: "Ahmad Fauzi, S.T.", nik: "3201012304890002", jabatan: "Pelaksana Madya", nilai: "88 (Lulus SKK)" },
                { nama: "Rian Hidayat", nik: "3201021405920005", jabatan: "Juru Ukur Jalan", nilai: "84 (Lulus SKK)" },
                { nama: "Siti Rahmawati, A.Md.", nik: "3201035508950001", jabatan: "Petugas K3 Lapangan", nilai: "92 (Lulus SKK)" },
                { nama: "Deden Kurniawan", nik: "3201041902910008", jabatan: "Mandor Pembesian", nilai: "80 (Lulus SKK)" }
              ],
              includeDataDictionary: true
            })}
            style={{
              marginTop: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "10px",
              borderRadius: "10px",
              backgroundColor: "#0F2E5C",
              color: "#FFFFFF",
              border: "none",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(15, 46, 92, 0.2)"
            }}
          >
            <Download style={{ width: "14px", height: "14px", color: "#FFC000" }} />
            <span>Ekspor Nominatif Peserta (XLSX)</span>
          </button>
        </div>
      </div>

      {/* Modal Tambah Agenda Pelatihan */}
      <ModalForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Agenda Pelatihan & Sertifikasi SIPJAKI"
        subtitle="Registrasikan kegiatan pembinaan kapasitas dan fasilitasi uji kompetensi TKK"
        icon={GraduationCap}
        size="lg"
        submitLabel="Simpan Agenda Pelatihan"
        onSubmit={handleAddSubmit}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
              Nama Program Pelatihan / Bimtek <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Pembinaan & Sertifikasi Tenaga Terampil Konstruksi Bangunan Gedung"
              value={formData.namaKegiatan}
              onChange={(e) => setFormData({ ...formData, namaKegiatan: e.target.value })}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "13px"
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
                Metode Pelatihan
              </label>
              <select
                value={formData.metode}
                onChange={(e) => setFormData({ ...formData, metode: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px"
                }}
              >
                <option value="Hybrid">Hybrid (Daring + Luring)</option>
                <option value="Reguler">Reguler (Tatap Muka Kelas)</option>
                <option value="Mobile Training Unit (MTU)">Mobile Training Unit (MTU)</option>
                <option value="On The Job Training">On The Job Training (OJT)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
                Tahun Anggaran
              </label>
              <input
                type="text"
                value={formData.tahun}
                onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px"
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
              Lokasi Pelaksanaan <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Pusdiklat DPU Cibinong / Kantor Kecamatan Ciawi"
              value={formData.lokasi}
              onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "13px"
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
                Peserta Pria (L)
              </label>
              <input
                type="number"
                value={formData.lakiLaki}
                onChange={(e) => setFormData({ ...formData, lakiLaki: Number(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
                Peserta Wanita (P)
              </label>
              <input
                type="number"
                value={formData.perempuan}
                onChange={(e) => setFormData({ ...formData, perempuan: Number(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
                Status Pelatihan
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px"
                }}
              >
                <option value="Sedang Berjalan">Sedang Berjalan</option>
                <option value="Terjadwal Q2">Terjadwal Q2</option>
                <option value="Terjadwal Q3">Terjadwal Q3</option>
                <option value="Selesai & Tersertifikasi">Selesai & Tersertifikasi</option>
              </select>
            </div>
          </div>
        </div>
      </ModalForm>

      {/* Modal Import Excel */}
      <ModalForm
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Data Pelatihan & Nominatif Peserta (Excel)"
        subtitle="Unggah berkas rekapitulasi pelatihan format SIPJAKI (.xlsx / .xls)"
        icon={FileSpreadsheet}
        size="lg"
        submitLabel={previewImportData.length > 0 ? `Simpan ${previewImportData.length} Pelatihan` : "Pilih Berkas Dahulu"}
        onSubmit={(e) => {
          e.preventDefault();
          handleCommitImport();
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Download Template Alert */}
          <div style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FileSpreadsheet style={{ width: "20px", height: "20px", color: "#16A34A" }} />
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#166534" }}>
                  Template Resmi SIPJAKI Excel
                </div>
                <div style={{ fontSize: "11px", color: "#475569" }}>
                  Gunakan format kolom baku untuk menghindari kegagalan sinkronisasi pusat
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => alert("Mengunduh template_import_pelatihan_sipjaki.xlsx...")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 12px",
                borderRadius: "6px",
                backgroundColor: "#16A34A",
                color: "#FFFFFF",
                border: "none",
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer"
              }}
            >
              <Download style={{ width: "12px", height: "12px" }} />
              <span>Unduh Template</span>
            </button>
          </div>

          {/* File Uploader */}
          <FileUploader
            label="Pilih Berkas Excel (.xlsx / .xls)"
            accept=".xlsx,.xls"
            maxSizeMb={5}
            hint="Format berkas Microsoft Excel (.xlsx / .xls). Maksimal 5MB."
            onFileSelect={handleFileSelect}
          />

          {/* Preview Parsed Data */}
          {previewImportData.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", textTransform: "uppercase" }}>
                  Pratinjau Data Terbaca ({previewImportData.length} Baris):
                </span>
                <span style={{ fontSize: "10px", color: "#16A34A", fontWeight: 800 }}>
                  Valid & Siap Disimpan
                </span>
              </div>
              <div style={{ border: "1px solid #E2E8F0", borderRadius: "10px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                      <th style={{ padding: "8px 10px", textAlign: "left", color: "#64748B" }}>PROGRAM</th>
                      <th style={{ padding: "8px 10px", textAlign: "center", color: "#64748B" }}>METODE</th>
                      <th style={{ padding: "8px 10px", textAlign: "center", color: "#64748B" }}>PESERTA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewImportData.map((p, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td style={{ padding: "8px 10px", fontWeight: 700, color: "#0F2E5C" }}>
                          {p.namaKegiatan}
                          <div style={{ fontSize: "10px", color: "#64748B" }}>{p.lokasi}</div>
                        </td>
                        <td style={{ padding: "8px 10px", textAlign: "center", color: "#475569" }}>
                          {p.metode}
                        </td>
                        <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 800, color: "#0F2E5C" }}>
                          {p.totalPeserta} Org (L:{p.lakiLaki} P:{p.perempuan})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </ModalForm>
    </div>
  );
}

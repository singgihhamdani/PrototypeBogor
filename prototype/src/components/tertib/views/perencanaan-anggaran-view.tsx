"use client";
import React, { useState } from "react";
import ModuleHeader from "@/components/layout/module-header";
import PerencanaanSubtabNav from "@/components/tertib/perencanaan-subtab-nav";
import { TertibType, TERTIB_CONFIGS } from "@/lib/tertib-config";
import { mockAnggaranRecords, AnggaranRecord } from "@/data/tertib-mock-data";
import { 
  StatusBadge, FileUploader, DataTableView, 
  ModalForm, ColumnDef 
} from "@/components/common";
import { Wallet, Plus, Download, FileText, CheckCircle2, TrendingUp, PieChart, Coins, Eye } from "lucide-react";

interface PerencanaanAnggaranViewProps {
  tertibType: TertibType;
}

export default function PerencanaanAnggaranView({ tertibType }: PerencanaanAnggaranViewProps) {
  const config = TERTIB_CONFIGS[tertibType];
  const [data, setData] = useState<AnggaranRecord[]>(
    mockAnggaranRecords.filter((r) => r.tertibType === tertibType)
  );
  const [filterSumberDana, setFilterSumberDana] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formProgram, setFormProgram] = useState("");
  const [formTahun, setFormTahun] = useState("2026");
  const [formPagu, setFormPagu] = useState("");
  const [formRealisasi, setFormRealisasi] = useState("0");
  const [formSumberDana, setFormSumberDana] = useState<"APBD Kab. Bogor" | "DAK Fisik" | "Bantuan Keuangan Provinsi">("APBD Kab. Bogor");
  const [formStatus, setFormStatus] = useState<"Disetujui" | "Revisi" | "Usulan">("Disetujui");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const filteredData = data.filter((item) => {
    const matchSumber = filterSumberDana === "Semua" || item.sumberDana === filterSumberDana;
    const matchSearch = item.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.sumberDana.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSumber && matchSearch;
  });

  const totalPagu = data.reduce((acc, curr) => acc + curr.paguAnggaran, 0);
  const totalRealisasi = data.reduce((acc, curr) => acc + curr.realisasi, 0);
  const percentSerapan = totalPagu > 0 ? Math.round((totalRealisasi / totalPagu) * 100) : 0;
  const sisaAnggaran = totalPagu - totalRealisasi;

  const handleAddAnggaran = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProgram || !formPagu) {
      alert("Mohon isi Nama Program dan Jumlah Pagu Anggaran!");
      return;
    }

    const paguNum = parseInt(formPagu.replace(/\D/g, ""), 10);
    const realisasiNum = parseInt(formRealisasi.replace(/\D/g, ""), 10) || 0;

    if (isNaN(paguNum) || paguNum <= 0) {
      alert("Nominal pagu anggaran harus berupa angka positif!");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newRecord: AnggaranRecord = {
        id: `ANG-${Date.now().toString().slice(-4)}`,
        tertibType,
        program: formProgram,
        tahun: formTahun,
        paguAnggaran: paguNum,
        realisasi: realisasiNum,
        sumberDana: formSumberDana,
        dokumenRka: uploadedFile ? uploadedFile.name : `RKA_${config.shortTitle.replace(/\s+/g, "_")}_${formTahun}.pdf`,
        status: formStatus
      };

      setData([newRecord, ...data]);
      setIsSubmitting(false);
      setShowModal(false);
      setFormProgram("");
      setFormPagu("");
      setFormRealisasi("0");
      setUploadedFile(null);
      alert(`Alokasi anggaran "${formProgram}" sebesar Rp ${paguNum.toLocaleString('id-ID')} berhasil disimpan!`);
    }, 600);
  };

  const columns: ColumnDef<AnggaranRecord>[] = [
    {
      key: "no",
      label: "NO",
      width: "50px",
      sortable: false,
      render: (_, idx) => <span style={{ fontWeight: 700, color: "#64748B" }}>{idx + 1}</span>
    },
    {
      key: "program",
      label: "PROGRAM & SUB-KEGIATAN",
      sortable: true,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C" }}>
            {row.program}
          </span>
          <span style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
            Tahun Anggaran: <b>{row.tahun}</b> • RKA Dinas PUPR
          </span>
        </div>
      )
    },
    {
      key: "paguAnggaran",
      label: "PAGU DPA",
      align: "right",
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C" }}>
          Rp {row.paguAnggaran.toLocaleString('id-ID')}
        </span>
      )
    },
    {
      key: "realisasi",
      label: "REALISASI",
      align: "right",
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: "13px", fontWeight: 800, color: "#10B981" }}>
          Rp {row.realisasi.toLocaleString('id-ID')}
        </span>
      )
    },
    {
      key: "serapan",
      label: "% SERAPAN",
      align: "center",
      sortable: false,
      render: (row) => {
        const pct = row.paguAnggaran > 0 ? Math.round((row.realisasi / row.paguAnggaran) * 100) : 0;
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "90px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: pct >= 50 ? "#10B981" : "#F59E0B", marginBottom: "2px" }}>
              {pct}%
            </span>
            <div style={{ width: "100%", height: "6px", backgroundColor: "#F1F5F9", borderRadius: "9999px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(pct, 100)}%`,
                  backgroundColor: pct >= 75 ? "#10B981" : pct >= 50 ? "#3B82F6" : "#F59E0B",
                  borderRadius: "9999px"
                }}
              />
            </div>
          </div>
        );
      }
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
            color: "#0F2E5C"
          }}
        >
          {row.sumberDana}
        </span>
      )
    },
    {
      key: "dokumenRka",
      label: "DOKUMEN RKA",
      sortable: false,
      render: (row) => (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert(`Mengunduh berkas ${row.dokumenRka}...`);
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
          <span style={{ maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {row.dokumenRka}
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
          { label: "Anggaran Pengawasan" }
        ]}
        badgeText={config.pilar}
        badgeBg={config.badgeBg}
        badgeColor={config.badgeColor}
        title={`Anggaran Pengawasan — ${config.shortTitle}`}
        description="Monitoring alokasi pagu DPA/RKA Dinas PUPR, serapan anggaran riil kegiatan audit, dan akuntabilitas keuangan pengawasan."
        legalBasis={config.legalBasis}
        actionButtons={[
          {
            label: "Tambah Alokasi RKA",
            icon: Plus,
            variant: "primary",
            onClick: () => setShowModal(true)
          },
          {
            label: "Unduh RKA (PDF)",
            icon: Download,
            onClick: () => alert("Mengunduh Rencana Anggaran Pengawasan (PDF)...")
          }
        ]}
      />

      {/* Subtab Navigation */}
      <PerencanaanSubtabNav tertibType={tertibType} activeSubtab="anggaran" />

      {/* 4 Financial Stat Cards (Modern UI/UX Revamped) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
        {/* Card 1: Total Pagu DPA */}
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
            justifyContent: "space-between",
            transition: "transform 0.15s ease, box-shadow 0.15s ease"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Total Pagu DPA
              </span>
              <span style={{ display: "block", fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>
                Alokasi Pengawasan
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
              <Wallet style={{ width: "20px", height: "20px" }} />
            </div>
          </div>

          <div style={{ marginTop: "14px", display: "flex", alignItems: "baseline", gap: "6px", flexWrap: "nowrap" }}>
            <span style={{ fontSize: "13px", fontWeight: 800, color: "#64748B" }}>Rp</span>
            <span style={{ fontSize: "22px", fontWeight: 900, color: "#0F2E5C", letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              {totalPagu.toLocaleString('id-ID')}
            </span>
          </div>

          <div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #F1F5F9" }}>
            <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Tahun Anggaran 2026</span>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#1E40AF", backgroundColor: "#DBEAFE", padding: "2px 8px", borderRadius: "9999px" }}>
              DPA Terbit
            </span>
          </div>
        </div>

        {/* Card 2: Realisasi Berjalan */}
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
            justifyContent: "space-between",
            transition: "transform 0.15s ease, box-shadow 0.15s ease"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Realisasi Berjalan
              </span>
              <span style={{ display: "block", fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>
                SP2D Terbit Riil
              </span>
            </div>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#ECFDF5",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <TrendingUp style={{ width: "20px", height: "20px" }} />
            </div>
          </div>

          <div style={{ marginTop: "14px", display: "flex", alignItems: "baseline", gap: "6px", flexWrap: "nowrap" }}>
            <span style={{ fontSize: "13px", fontWeight: 800, color: "#059669" }}>Rp</span>
            <span style={{ fontSize: "22px", fontWeight: 900, color: "#059669", letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              {totalRealisasi.toLocaleString('id-ID')}
            </span>
          </div>

          <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid #F1F5F9" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}>Tingkat Serapan</span>
              <span style={{ fontSize: "11px", fontWeight: 800, color: percentSerapan >= 60 ? "#059669" : "#D97706" }}>
                {percentSerapan}%
              </span>
            </div>
            <div style={{ width: "100%", height: "6px", backgroundColor: "#F1F5F9", borderRadius: "9999px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.min(percentSerapan, 100)}%`,
                  height: "100%",
                  backgroundColor: percentSerapan >= 60 ? "#10B981" : "#F59E0B",
                  borderRadius: "9999px",
                  transition: "width 0.4s ease"
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Sisa Anggaran */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #F59E0B",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transition: "transform 0.15s ease, box-shadow 0.15s ease"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Sisa Anggaran
              </span>
              <span style={{ display: "block", fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>
                Sisa Pagu Belum SP2D
              </span>
            </div>
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
              <Coins style={{ width: "20px", height: "20px" }} />
            </div>
          </div>

          <div style={{ marginTop: "14px", display: "flex", alignItems: "baseline", gap: "6px", flexWrap: "nowrap" }}>
            <span style={{ fontSize: "13px", fontWeight: 800, color: "#D97706" }}>Rp</span>
            <span style={{ fontSize: "22px", fontWeight: 900, color: "#92400E", letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              {sisaAnggaran.toLocaleString('id-ID')}
            </span>
          </div>

          <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid #F1F5F9" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}>Sisa Alokasi</span>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#92400E" }}>
                {100 - percentSerapan}%
              </span>
            </div>
            <div style={{ width: "100%", height: "6px", backgroundColor: "#F1F5F9", borderRadius: "9999px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.max(100 - percentSerapan, 0)}%`,
                  height: "100%",
                  backgroundColor: "#F59E0B",
                  borderRadius: "9999px",
                  transition: "width 0.4s ease"
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Sumber Pendanaan */}
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
            justifyContent: "space-between",
            transition: "transform 0.15s ease, box-shadow 0.15s ease"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Sumber Pendanaan
              </span>
              <span style={{ display: "block", fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>
                Kanal Alokasi Fiskal
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
              <PieChart style={{ width: "20px", height: "20px" }} />
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            <h3 style={{ fontSize: "19px", fontWeight: 900, color: "#1E1B4B", margin: 0, whiteSpace: "nowrap", letterSpacing: "-0.4px" }}>
              APBD & Bantuan
            </h3>
            <span style={{ fontSize: "11px", color: "#64748B", marginTop: "4px", display: "block" }}>
              Bidang Jasa Konstruksi DPU
            </span>
          </div>

          <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", paddingTop: "12px", borderTop: "1px solid #F1F5F9" }}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "2px 8px", borderRadius: "6px" }}>
              APBD Kab. Bogor
            </span>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#065F46", backgroundColor: "#ECFDF5", padding: "2px 8px", borderRadius: "6px" }}>
              DAK Fisik
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: "1 1 320px" }}>
          <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C" }}>Sumber Dana:</span>
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
        </div>

        <div style={{ width: "100%", maxWidth: "260px" }}>
          <input
            type="text"
            placeholder="Cari program RKA..."
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
      <DataTableView<AnggaranRecord>
        title={`Rencana Kerja & Anggaran (RKA) Pengawasan (${filteredData.length})`}
        subtitle="Rincian pos alokasi dana operasional audit tertib konstruksi Kabupaten Bogor"
        data={filteredData}
        columns={columns}
        defaultPageSize={5}
        exportFileName={`Anggaran_Pengawasan_${tertibType}`}
        actionsHeader="AKSI"
        actionsRender={(row) => (
          <button
            type="button"
            onClick={() => alert(`Rincian Alokasi: "${row.program}"\nPagu: Rp ${row.paguAnggaran.toLocaleString('id-ID')}\nRealisasi: Rp ${row.realisasi.toLocaleString('id-ID')}\nSumber: ${row.sumberDana}`)}
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

      {/* Modal Form Tambah Anggaran */}
      <ModalForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Tambah Alokasi Anggaran Pengawasan (RKA)"
        subtitle={`Input alokasi pagu DPA untuk ${config.shortTitle}`}
        onSubmit={handleAddAnggaran}
        submitLabel="Simpan Pos Anggaran"
        isLoading={isSubmitting}
        size="lg"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Nama Program */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
              Program / Sub-Kegiatan <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Operasional Audit Lapangan & Uji Petik Kepatuhan Standar Jakon"
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

          {/* Grid Pagu & Realisasi */}
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
                Realisasi Berjalan (Rp)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Contoh: 45000000"
                value={formRealisasi}
                onChange={(e) => setFormRealisasi(e.target.value)}
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

          {/* Grid Sumber Dana & Status */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
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

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                Status Usulan RKA
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

          {/* File Uploader */}
          <FileUploader
            label="Unggah Dokumen RKA / DPA (PDF)"
            accept=".pdf"
            maxSizeMb={2}
            onFileSelect={(file) => setUploadedFile(file)}
            hint="Lampirkan berkas DPA-SKPD atau RKA resmi Dinas PUPR (Maksimal 2 MB)"
          />
        </div>
      </ModalForm>
    </div>
  );
}

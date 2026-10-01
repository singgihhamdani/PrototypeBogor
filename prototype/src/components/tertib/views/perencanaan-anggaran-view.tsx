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

      {/* 4 Financial Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px" }}>
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
            <Wallet style={{ width: "22px", height: "22px" }} />
          </div>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
              Total Pagu DPA
            </span>
            <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#0F2E5C", margin: "2px 0 0 0" }}>
              Rp {totalPagu.toLocaleString('id-ID')}
            </h3>
            <span style={{ fontSize: "11px", color: "#64748B" }}>Tahun Anggaran 2026</span>
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
            <TrendingUp style={{ width: "22px", height: "22px" }} />
          </div>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
              Realisasi Berjalan
            </span>
            <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#10B981", margin: "2px 0 0 0" }}>
              Rp {totalRealisasi.toLocaleString('id-ID')}
            </h3>
            <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>Serapan: {percentSerapan}%</span>
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
            <Coins style={{ width: "22px", height: "22px" }} />
          </div>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
              Sisa Anggaran
            </span>
            <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#92400E", margin: "2px 0 0 0" }}>
              Rp {sisaAnggaran.toLocaleString('id-ID')}
            </h3>
            <span style={{ fontSize: "11px", color: "#64748B" }}>Sisa alokasi pagu TA 2026</span>
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
              backgroundColor: "#F1F5F9",
              color: "#2563EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <PieChart style={{ width: "22px", height: "22px" }} />
          </div>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
              Sumber Pendanaan
            </span>
            <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#2563EB", margin: "2px 0 0 0" }}>
              APBD & Bantuan
            </h3>
            <span style={{ fontSize: "11px", color: "#64748B" }}>Bidang Bina Konstruksi</span>
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

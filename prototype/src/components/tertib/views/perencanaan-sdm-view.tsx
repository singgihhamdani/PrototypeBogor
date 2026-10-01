"use client";
import React, { useState } from "react";
import ModuleHeader from "@/components/layout/module-header";
import PerencanaanSubtabNav from "@/components/tertib/perencanaan-subtab-nav";
import { TertibType, TERTIB_CONFIGS } from "@/lib/tertib-config";
import { mockSDMRecords, SDMRecord } from "@/data/tertib-mock-data";
import { 
  StatusBadge, FileUploader, DataTableView, 
  ModalForm, ColumnDef 
} from "@/components/common";
import { Users, Plus, Download, FileText, Eye } from "lucide-react";

interface PerencanaanSDMViewProps {
  tertibType: TertibType;
}

export default function PerencanaanSDMView({ tertibType }: PerencanaanSDMViewProps) {
  const config = TERTIB_CONFIGS[tertibType];
  const [data, setData] = useState<SDMRecord[]>(
    mockSDMRecords.filter((r) => r.tertibType === tertibType)
  );
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formJumlah, setFormJumlah] = useState("");
  const [formTahun, setFormTahun] = useState("2026");
  const [formWilayah, setFormWilayah] = useState("");
  const [formNamaTim, setFormNamaTim] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const filteredData = data.filter((item) => {
    if (filterStatus === "Semua") return true;
    return item.status === filterStatus;
  });

  const totalSDM = data.reduce((acc, curr) => acc + curr.jumlahSdm, 0);

  const handleAddSDM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJumlah || !formWilayah) {
      alert("Mohon isi Jumlah SDM dan Wilayah Penugasan!");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newRecord: SDMRecord = {
        id: `SDM-${Date.now().toString().slice(-4)}`,
        tertibType,
        wilayah: formWilayah,
        jumlahSdm: parseInt(formJumlah, 10),
        tahun: formTahun,
        dokumen: uploadedFile ? uploadedFile.name : `SK_Tim_Pengawas_${formTahun}.pdf`,
        status: "Menunggu Verifikasi",
        namaTim: formNamaTim || "Tim Pengawas Teknis Lapangan"
      };

      setData([newRecord, ...data]);
      setIsSubmitting(false);
      setShowModal(false);
      setFormJumlah("");
      setFormWilayah("");
      setFormNamaTim("");
      setUploadedFile(null);
      alert("Data SDM Pengawas berhasil ditambahkan! Status: Menunggu Verifikasi.");
    }, 600);
  };

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
      label: "WILAYAH & NAMA TIM",
      sortable: true,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C" }}>
            {row.namaTim || row.wilayah}
          </span>
          <span style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
            {row.wilayah}
          </span>
          {row.ketuaTim && (
            <span style={{ fontSize: "10px", color: "#2563EB", fontWeight: 700, marginTop: "2px" }}>
              Ketua: {row.ketuaTim}
            </span>
          )}
        </div>
      )
    },
    {
      key: "jumlahSdm",
      label: "JUMLAH SDM",
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
          {row.jumlahSdm} Personil
        </span>
      )
    },
    {
      key: "tahun",
      label: "TAHUN",
      align: "center",
      sortable: true,
      render: (row) => <span style={{ fontWeight: 700, color: "#475569" }}>{row.tahun}</span>
    },
    {
      key: "dokumen",
      label: "DOKUMEN SK",
      sortable: false,
      render: (row) => (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert(`Mengunduh berkas ${row.dokumen}...`);
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
            {row.dokumen}
          </span>
        </a>
      )
    },
    {
      key: "status",
      label: "STATUS VERIFIKASI",
      align: "center",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} size="sm" />
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
        description="Kelola alokasi tim personil, pengawas teknis bersertifikat, dan penetapan SK Bupati/Kadis untuk kegiatan pengawasan di Kabupaten Bogor."
        legalBasis={config.legalBasis}
        actionButtons={[
          {
            label: "Tambah SDM Pengawas",
            icon: Plus,
            variant: "primary",
            onClick: () => setShowModal(true)
          },
          {
            label: "Unduh SK Tim (PDF)",
            icon: Download,
            onClick: () => alert("Mengunduh Rekapitulasi SK Tim Pengawas...")
          }
        ]}
      />

      <PerencanaanSubtabNav tertibType={tertibType} activeSubtab="sdm" />

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "18px", border: "1px solid #E2E8F0" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Total SDM Ditugaskan</span>
          <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#0F2E5C", margin: "6px 0 2px 0" }}>{totalSDM} Personil</h3>
          <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>Tahun Anggaran 2026</span>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "18px", border: "1px solid #E2E8F0" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Jumlah Tim Pengawas</span>
          <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#0F2E5C", margin: "6px 0 2px 0" }}>{data.length} Tim Tersebar</h3>
          <span style={{ fontSize: "11px", color: "#2563EB", fontWeight: 700 }}>Mencakup 40 Kecamatan</span>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "18px", border: "1px solid #E2E8F0" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Status Verifikasi Data</span>
          <div style={{ marginTop: "6px" }}>
            <StatusBadge status="Terverifikasi" size="md" />
          </div>
          <p style={{ fontSize: "11px", color: "#64748B", margin: "4px 0 0 0" }}>Tersinkronisasi ke SIPJAKI Nasional</p>
        </div>
      </div>

      {/* Reusable DataTableView */}
      <DataTableView<SDMRecord>
        title={`Daftar Penugasan SDM Pengawas (${filteredData.length})`}
        subtitle="Data personalia dan legalitas SK Tim Pengawas Teknis Kabupaten Bogor"
        data={filteredData}
        columns={columns}
        defaultPageSize={5}
        exportFileName={`SDM_Pengawas_${tertibType}`}
        actionsHeader="AKSI"
        actionsRender={(row) => {
          const item = row;
          return (
            <button
              type="button"
              onClick={() => alert(`Detail Personil untuk: ${item.namaTim || item.wilayah}`)}
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
          );
        }}
      />

      {/* Reusable ModalForm for Add SDM with integrated FileUploader */}
      <ModalForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Tambah Sumber Daya Manusia (SDM) Pengawas"
        subtitle={`Input alokasi personil pengawas teknis untuk ${config.shortTitle}`}
        icon={Users}
        onSubmit={handleAddSDM}
        submitLabel="Simpan SDM Pengawas"
        isLoading={isSubmitting}
        size="md"
      >
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
            Nama Tim / Satgas Pengawas <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Tim Pengawas Usaha Wilayah IV"
            value={formNamaTim}
            onChange={(e) => setFormNamaTim(e.target.value)}
            required
            style={{
              width: "100%",
              height: "38px",
              borderRadius: "10px",
              border: "1px solid #CBD5E1",
              padding: "0 12px",
              fontSize: "12px",
              outline: "none"
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
            Wilayah Penugasan (Kecamatan / Zona) <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Cibinong, Sukaraja, Babakan Madang"
            value={formWilayah}
            onChange={(e) => setFormWilayah(e.target.value)}
            required
            style={{
              width: "100%",
              height: "38px",
              borderRadius: "10px",
              border: "1px solid #CBD5E1",
              padding: "0 12px",
              fontSize: "12px",
              outline: "none"
            }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
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
                borderRadius: "10px",
                border: "1px solid #CBD5E1",
                padding: "0 12px",
                fontSize: "12px",
                outline: "none"
              }}
            />
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
                borderRadius: "10px",
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
        </div>

        {/* Drag & Drop FileUploader Component */}
        <FileUploader
          label="Dokumen SK Tim Pengawas (PDF)"
          accept=".pdf"
          maxSizeMb={2}
          hint="Surat Keputusan Bupati / Kepala Dinas terkait penetapan tim asesor (Maks 2MB, PDF)"
          onFileSelect={(file) => setUploadedFile(file)}
        />
      </ModalForm>
    </div>
  );
}

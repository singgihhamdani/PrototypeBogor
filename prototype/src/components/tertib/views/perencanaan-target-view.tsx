"use client";
import React, { useState } from "react";
import ModuleHeader from "@/components/layout/module-header";
import PerencanaanSubtabNav from "@/components/tertib/perencanaan-subtab-nav";
import { TertibType, TERTIB_CONFIGS } from "@/lib/tertib-config";
import { mockTargetRecords, TargetRecord } from "@/data/tertib-mock-data";
import { 
  StatusBadge, DataTableView, 
  ModalForm, ColumnDef 
} from "@/components/common";
import { Target, Plus, Download, TrendingUp, CheckCircle2, Award, BarChart3, Eye } from "lucide-react";

interface PerencanaanTargetViewProps {
  tertibType: TertibType;
}

export default function PerencanaanTargetView({ tertibType }: PerencanaanTargetViewProps) {
  const config = TERTIB_CONFIGS[tertibType];
  const [data, setData] = useState<TargetRecord[]>(
    mockTargetRecords.filter((r) => r.tertibType === tertibType)
  );
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formIndikator, setFormIndikator] = useState("");
  const [formKategori, setFormKategori] = useState("Legalitas Usaha");
  const [formTarget, setFormTarget] = useState("");
  const [formSatuan, setFormSatuan] = useState("Badan Usaha");
  const [formRealisasi, setFormRealisasi] = useState("0");
  const [formTahun, setFormTahun] = useState("2026");

  const totalTargetKuantitatif = data.reduce((acc, curr) => acc + curr.targetKuantitatif, 0);
  const totalRealisasiKuantitatif = data.reduce((acc, curr) => acc + curr.realisasiSaatIni, 0);
  const avgCapaian = totalTargetKuantitatif > 0 
    ? Math.round((totalRealisasiKuantitatif / totalTargetKuantitatif) * 100) 
    : 0;

  const targetTuntas = data.filter((d) => d.realisasiSaatIni >= d.targetKuantitatif).length;

  const handleAddTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formIndikator || !formTarget) {
      alert("Mohon isi Nama Indikator dan Angka Target Kuantitatif!");
      return;
    }

    const targetNum = parseInt(formTarget, 10);
    const realisasiNum = parseInt(formRealisasi, 10) || 0;

    if (isNaN(targetNum) || targetNum <= 0) {
      alert("Target kuantitatif harus berupa angka positif!");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newRecord: TargetRecord = {
        id: `TGT-${Date.now().toString().slice(-4)}`,
        tertibType,
        indikator: formIndikator,
        targetKuantitatif: targetNum,
        satuan: formSatuan,
        realisasiSaatIni: realisasiNum,
        tahun: formTahun,
        kategori: formKategori
      };

      setData([...data, newRecord]);
      setIsSubmitting(false);
      setShowModal(false);
      setFormIndikator("");
      setFormTarget("");
      setFormRealisasi("0");
      alert(`Indikator sasaran "${formIndikator}" berhasil ditambahkan!`);
    }, 600);
  };

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
      label: "INDIKATOR KINERJA UTAMA (IKU)",
      sortable: true,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C" }}>
            {row.indikator}
          </span>
          <span style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
            Kategori: <b>{row.kategori}</b> • TA {row.tahun}
          </span>
        </div>
      )
    },
    {
      key: "targetKuantitatif",
      label: "TARGET",
      align: "center",
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C" }}>
          {row.targetKuantitatif} {row.satuan}
        </span>
      )
    },
    {
      key: "realisasiSaatIni",
      label: "REALISASI",
      align: "center",
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: "12px", fontWeight: 900, color: "#10B981" }}>
          {row.realisasiSaatIni} {row.satuan}
        </span>
      )
    },
    {
      key: "persentase",
      label: "% CAPAIAN",
      align: "center",
      sortable: false,
      render: (row) => {
        const pct = Math.round((row.realisasiSaatIni / row.targetKuantitatif) * 100);
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "90px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: pct >= 75 ? "#10B981" : pct >= 50 ? "#2563EB" : "#F59E0B", marginBottom: "2px" }}>
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
      key: "status",
      label: "STATUS",
      align: "center",
      sortable: false,
      render: (row) => {
        const pct = Math.round((row.realisasiSaatIni / row.targetKuantitatif) * 100);
        const statusLabel = pct >= 100 ? "Selesai" : pct >= 50 ? "Berjalan" : "Terjadwal";
        return <StatusBadge status={statusLabel} size="sm" showDot />;
      }
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <ModuleHeader
        breadcrumbs={[
          { label: config.shortTitle, href: config.basePath },
          { label: "Perencanaan", href: `${config.basePath}/perencanaan` },
          { label: "Target Sasaran" }
        ]}
        badgeText={config.pilar}
        badgeBg={config.badgeBg}
        badgeColor={config.badgeColor}
        title={`Target & Sasaran Kinerja — ${config.shortTitle}`}
        description="Penetapan target kuantitatif tahunan pengawasan tertib konstruksi yang selaras dengan Indikator Kinerja Utama (IKU) DPU Kabupaten Bogor."
        legalBasis={config.legalBasis}
        actionButtons={[
          {
            label: "Tambah Sasaran IKU",
            icon: Plus,
            variant: "primary",
            onClick: () => setShowModal(true)
          },
          {
            label: "Unduh Matriks IKU (PDF)",
            icon: Download,
            onClick: () => alert("Mengunduh Dokumen Penetapan IKU Pengawasan TA 2026...")
          }
        ]}
      />

      {/* Subtab Navigation */}
      <PerencanaanSubtabNav tertibType={tertibType} activeSubtab="target" />

      {/* 4 Summary Stat Cards (UI/UX Standardized) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        {/* Card 1: Rata-rata Capaian IKU */}
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
              Capaian IKU
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
              <TrendingUp style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#059669", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {avgCapaian}%
            </div>
            <div style={{ marginTop: "10px" }}>
              <div style={{ width: "100%", height: "6px", backgroundColor: "#E2E8F0", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ width: `${avgCapaian}%`, height: "100%", backgroundColor: "#059669", borderRadius: "999px" }} />
              </div>
              <span style={{ fontSize: "11px", color: "#166534", fontWeight: 700, marginTop: "4px", display: "inline-block" }}>
                Progres kumulatif TA 2026
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Indikator */}
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
              Total Indikator
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
              {data.length} Indikator Kunci
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ fontSize: "11px", color: "#64748B" }}>
                Matriks Perencanaan Kinerja
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Indikator Tuntas */}
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
              Indikator Tuntas
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
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#D97706", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {targetTuntas} dari {data.length} IKU
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#D97706" }} />
              <span style={{ fontSize: "11px", color: "#D97706", fontWeight: 700 }}>
                Memenuhi kuota target
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Realisasi Volume */}
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
              Realisasi Volume
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
              <BarChart3 style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#2563EB", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {totalRealisasiKuantitatif} Realisasi
            </div>
            <div style={{ marginTop: "10px" }}>
              <div style={{ width: "100%", height: "6px", backgroundColor: "#E2E8F0", borderRadius: "999px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${totalTargetKuantitatif > 0 ? Math.min(100, Math.round((totalRealisasiKuantitatif / totalTargetKuantitatif) * 100)) : 0}%`,
                    height: "100%",
                    backgroundColor: "#2563EB",
                    borderRadius: "999px"
                  }}
                />
              </div>
              <span style={{ fontSize: "11px", color: "#64748B", marginTop: "4px", display: "inline-block" }}>
                Target: {totalTargetKuantitatif}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Progress Cards Grid */}
      <div>
        <div style={{ marginBottom: "12px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F2E5C", margin: 0 }}>
            Visualisasi Matriks Ketercapaian Sasaran
          </h3>
          <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
            Monitoring persentase realisasi kuantitatif pengawasan terhadap target kinerja tahunan
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: "16px" }}>
          {data.map((item) => {
            const percent = Math.round((item.realisasiSaatIni / item.targetKuantitatif) * 100);
            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "16px",
                  padding: "18px 20px",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      backgroundColor: "#EBF2FA",
                      color: "#0F2E5C",
                      padding: "4px 8px",
                      borderRadius: "6px"
                    }}
                  >
                    {item.kategori}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 900,
                      color: percent >= 75 ? "#10B981" : percent >= 50 ? "#2563EB" : "#F59E0B"
                    }}
                  >
                    {percent}% Tercapai
                  </span>
                </div>

                <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#1E293B", margin: 0, lineHeight: 1.4 }}>
                  {item.indikator}
                </h4>

                {/* Progress bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, color: "#64748B", marginBottom: "6px" }}>
                    <span>Realisasi: <b style={{ color: "#0F2E5C" }}>{item.realisasiSaatIni} {item.satuan}</b></span>
                    <span>Target: <b>{item.targetKuantitatif} {item.satuan}</b></span>
                  </div>
                  <div style={{ height: "8px", width: "100%", backgroundColor: "#F1F5F9", borderRadius: "9999px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(percent, 100)}%`,
                        backgroundColor: percent >= 75 ? "#10B981" : percent >= 50 ? "#3B82F6" : "#F59E0B",
                        borderRadius: "9999px",
                        transition: "width 0.5s ease"
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail DataTableView */}
      <DataTableView<TargetRecord>
        title={`Tabel Matriks Indikator & Target Kinerja (${data.length})`}
        subtitle="Rincian kuantitatif sasaran pengawasan sesuai standar laporan LKPJ Bupati Bogor"
        data={data}
        columns={columns}
        defaultPageSize={5}
        exportFileName={`Target_Sasaran_${tertibType}`}
        actionsHeader="AKSI"
        actionsRender={(row) => (
          <button
            type="button"
            onClick={() => alert(`Indikator: "${row.indikator}"\nTarget: ${row.targetKuantitatif} ${row.satuan}\nRealisasi: ${row.realisasiSaatIni} ${row.satuan}`)}
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

      {/* Modal Form Tambah Sasaran */}
      <ModalForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Tambah Indikator & Sasaran Kinerja Baru"
        subtitle={`Input penetapan IKU untuk ${config.shortTitle}`}
        onSubmit={handleAddTarget}
        submitLabel="Simpan Sasaran Kinerja"
        isLoading={isSubmitting}
        size="lg"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Nama Indikator */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
              Nama Indikator Kinerja Utama (IKU) <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Jumlah BUJK Bersertifikat yang Diperiksa Kelengkapan Dokumen K3"
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
                <option value="Kelaikan Bangunan">Kelaikan Bangunan</option>
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
                <option value="Bangunan Gedung">Bangunan Gedung</option>
                <option value="Dokumen RKK">Dokumen RKK / BAP</option>
              </select>
            </div>
          </div>

          {/* Grid Target & Realisasi */}
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
                Realisasi Awal
              </label>
              <input
                type="number"
                min="0"
                placeholder="Contoh: 15"
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

          {/* Tahun */}
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
      </ModalForm>
    </div>
  );
}

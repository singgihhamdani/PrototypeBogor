"use client";
import React, { useState } from "react";
import ModuleHeader from "@/components/layout/module-header";
import { 
  GraduationCap, Download, Users, Award, 
  Search, CheckCircle2, TrendingUp, Filter, Eye, BookOpen 
} from "lucide-react";
import trainingData from "@/data/training.json";
import DataTableView, { ColumnDef } from "@/components/common/data-table-view";
import ModalForm from "@/components/common/modal-form";

type TrainingItem = typeof trainingData[0];

export default function RekapitulasiPelatihanPage() {
  const [selectedLevel, setSelectedLevel] = useState("Semua");
  const [selectedBatch, setSelectedBatch] = useState<TrainingItem | null>(null);

  const totalQuota = trainingData.reduce((acc, curr) => acc + curr.quota, 0);
  const totalRegistered = trainingData.reduce((acc, curr) => acc + curr.registered, 0);
  const totalPassed = trainingData.reduce((acc, curr) => acc + curr.passed, 0);
  const passRate = totalRegistered > 0 ? Math.round((totalPassed / totalRegistered) * 100) : 0;

  // Unique SKK Levels
  const allLevels = ["Semua", ...Array.from(new Set(trainingData.map((t) => t.skkLevel)))];

  const filtered = trainingData.filter((t) => {
    return selectedLevel === "Semua" || t.skkLevel === selectedLevel;
  });

  const columns: ColumnDef<TrainingItem>[] = [
    {
      key: "title",
      label: "PROGRAM PELATIHAN & BATCH",
      render: (row) => (
        <div>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", lineHeight: 1.35 }}>
            {row.title}
          </div>
          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "3px" }}>
            {row.batch} • 📍 {row.location}
          </div>
        </div>
      )
    },
    {
      key: "skkLevel",
      label: "JENJANG SKK",
      width: "180px",
      render: (row) => (
        <span style={{ fontSize: "11px", fontWeight: 700, backgroundColor: "#F1F5F9", color: "#334155", padding: "3px 8px", borderRadius: "6px" }}>
          {row.skkLevel}
        </span>
      )
    },
    {
      key: "quota",
      label: "KUOTA",
      width: "90px",
      align: "center",
      render: (row) => (
        <span style={{ fontSize: "12px", fontWeight: 800, color: "#475569" }}>
          {row.quota}
        </span>
      )
    },
    {
      key: "registered",
      label: "PESERTA",
      width: "90px",
      align: "center",
      render: (row) => (
        <span style={{ fontSize: "12px", fontWeight: 800, color: "#2563EB" }}>
          {row.registered}
        </span>
      )
    },
    {
      key: "passed",
      label: "LULUS SKK",
      width: "120px",
      align: "center",
      render: (row) => (
        <span style={{ fontSize: "12px", fontWeight: 900, color: "#166534", backgroundColor: "#DCFCE7", padding: "3px 8px", borderRadius: "6px" }}>
          {row.passed} ({row.registered > 0 ? Math.round((row.passed / row.registered) * 100) : 0}%)
        </span>
      )
    },
    {
      key: "status",
      label: "STATUS",
      width: "130px",
      align: "center",
      render: (row) => (
        <span
          style={{
            fontSize: "10px",
            fontWeight: 800,
            padding: "3px 10px",
            borderRadius: "9999px",
            backgroundColor: row.status === "Selesai" ? "#DCFCE7" : "#FEF3C7",
            color: row.status === "Selesai" ? "#166534" : "#92400E"
          }}
        >
          {row.status}
        </span>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <ModuleHeader
        breadcrumbs={[
          { label: "Pelatihan & TKK", href: "/pelatihan" },
          { label: "Rekapitulasi TKK Pelatihan" }
        ]}
        badgeText="Pilar 5: Pelatihan & TKK"
        badgeBg="#DCFCE7"
        badgeColor="#166534"
        title="Rekapitulasi TKK Pelatihan & Sertifikasi"
        description="Ringkasan agregat pencapaian sertifikasi kompetensi tenaga kerja konstruksi (TKK) per kualifikasi jenjang jabatan di Kabupaten Bogor."
        legalBasis="Permen PUPR No. 1/2023 & UU No. 2/2017"
        actionButtons={[
          {
            label: "Unduh Rekapitulasi (XLSX)",
            icon: Download,
            variant: "primary",
            onClick: () => alert("Mengunduh Rekapitulasi Data TKK Terverifikasi (.xlsx)...")
          }
        ]}
      />

      {/* Top 4 Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "18px", padding: "18px", border: "1px solid #E2E8F0" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Total Kuota Pelatihan</span>
          <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#0F2E5C", margin: "4px 0 2px 0" }}>{totalQuota} Peserta</h3>
          <span style={{ fontSize: "11px", color: "#64748B" }}>Tahun Anggaran 2026</span>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "18px", padding: "18px", border: "1px solid #E2E8F0" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Peserta Terdaftar</span>
          <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#2563EB", margin: "4px 0 2px 0" }}>{totalRegistered} Orang</h3>
          <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>98.6% Kuota Terpenuhi</span>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "18px", padding: "18px", border: "1px solid #E2E8F0" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>TKK Lulus & Bersertifikat</span>
          <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#166534", margin: "4px 0 2px 0" }}>{totalPassed} TKK</h3>
          <span style={{ fontSize: "11px", color: "#166534", fontWeight: 700 }}>Tingkat Kelulusan: {passRate}%</span>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "18px", padding: "18px", border: "1px solid #E2E8F0" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Sinkronisasi SIPJAKI</span>
          <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#10B981", margin: "4px 0 2px 0" }}>100%</h3>
          <span style={{ fontSize: "11px", color: "#64748B" }}>Tercatat di Portal Nasional</span>
        </div>
      </div>

      {/* Filter Jenjang SKK */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", overflowX: "auto", padding: "8px 12px", backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
        <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", marginRight: "4px" }}>
          Jenjang SKK:
        </span>
        {allLevels.map((lvl) => {
          const isSelected = selectedLevel === lvl;
          return (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              style={{
                padding: "5px 12px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                backgroundColor: isSelected ? "#0F2E5C" : "#F1F5F9",
                color: isSelected ? "#FFFFFF" : "#475569",
                whiteSpace: "nowrap"
              }}
            >
              {lvl}
            </button>
          );
        })}
      </div>

      {/* DataTableView */}
      <DataTableView<TrainingItem>
        title={`Rekapitulasi Angkatan Sertifikasi (${filtered.length} Program)`}
        subtitle="Agregat data kuota, peserta, dan tingkat kelulusan uji kompetensi TKK"
        data={filtered}
        columns={columns}
        exportFileName="Rekapitulasi_Pelatihan_TKK_Bogor"
        actionsHeader="AKSI"
        actionsRender={(row) => (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => setSelectedBatch(row)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#FFFFFF",
                color: "#0F2E5C",
                fontSize: "10px",
                fontWeight: 800,
                cursor: "pointer"
              }}
            >
              <Eye style={{ width: "12px", height: "12px" }} />
              <span>Detail</span>
            </button>
          </div>
        )}
      />

      {/* Modal Detail Peserta Angkatan */}
      {selectedBatch && (
        <ModalForm
          isOpen={!!selectedBatch}
          onClose={() => setSelectedBatch(null)}
          title={selectedBatch.title}
          subtitle={`${selectedBatch.batch} • Jenjang: ${selectedBatch.skkLevel}`}
          icon={BookOpen}
          size="lg"
          hideFooter
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", backgroundColor: "#F8FAFC", padding: "14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
              <div>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700 }}>Lokasi & Jadwal:</span>
                <p style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", margin: "2px 0 0 0" }}>
                  📍 {selectedBatch.location} ({selectedBatch.startDate} s/d {selectedBatch.endDate})
                </p>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700 }}>Instruktur / Asesor:</span>
                <p style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", margin: "2px 0 0 0" }}>
                  {selectedBatch.instructor}
                </p>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <h5 style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", textTransform: "uppercase", margin: 0 }}>
                  Daftar Peserta & Status Sertifikasi:
                </h5>
                <span style={{ fontSize: "11px", color: "#166534", fontWeight: 800 }}>
                  {selectedBatch.passed} dari {selectedBatch.registered} Peserta Lulus SKK
                </span>
              </div>

              {selectedBatch.participants && selectedBatch.participants.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {selectedBatch.participants.map((p, idx) => (
                    <div key={idx} style={{ padding: "8px 12px", borderRadius: "8px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C" }}>{p.name}</div>
                        <div style={{ fontSize: "10px", color: "#64748B" }}>NIK: {p.nik} • {p.bujk}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "11px", fontWeight: 900, color: "#166534" }}>{p.score} (Lulus)</span>
                        <div style={{ fontSize: "10px", fontFamily: "monospace", color: "#64748B" }}>{p.certNo}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: "16px", textAlign: "center", color: "#94A3B8", fontSize: "12px" }}>
                  Pelatihan sedang berlangsung. Nominatif kelulusan akan diumumkan setelah uji kompetensi LSP.
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setSelectedBatch(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  backgroundColor: "#0F2E5C",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </ModalForm>
      )}
    </div>
  );
}

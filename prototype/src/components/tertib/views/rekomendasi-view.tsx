"use client";
import React, { useState } from "react";
import ModuleHeader from "@/components/layout/module-header";
import { TertibType, TERTIB_CONFIGS } from "@/lib/tertib-config";
import { mockRekomendasiRecords, RekomendasiRecord } from "@/data/tertib-mock-data";
import { 
  StatusBadge, DataTableView, VerificationDialog, 
  VerificationTargetInfo, ColumnDef 
} from "@/components/common";
import ModalForm from "@/components/common/modal-form";
import FileUploader from "@/components/common/file-uploader";
import { 
  AlertTriangle, Plus, Download, ShieldCheck, CheckCircle2, 
  Clock, AlertCircle, FileText, Printer, Trash2, Eye, 
  Calendar, Building2, Send, Scale
} from "lucide-react";

interface RekomendasiViewProps {
  tertibType: TertibType;
}

export default function RekomendasiView({ tertibType }: RekomendasiViewProps) {
  const config = TERTIB_CONFIGS[tertibType];
  const [data, setData] = useState<RekomendasiRecord[]>(() =>
    mockRekomendasiRecords.filter((r) => r.tertibType === tertibType)
  );

  // Filter States
  const [filterTindakLanjut, setFilterTindakLanjut] = useState<string>("Semua");
  const [filterVerifikasi, setFilterVerifikasi] = useState<string>("Semua");

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<RekomendasiRecord | null>(null);

  // Verification Dialog state
  const [selectedRecordForVerify, setSelectedRecordForVerify] = useState<RekomendasiRecord | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Form State Penerbitan Surat Rekomendasi
  const [formData, setFormData] = useState({
    badanUsahaAtauObjek: "",
    temuanUtama: "",
    rekomendasiTindakan: "",
    tenggatWaktu: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    jenisPeringatan: "Peringatan Tertulis I",
    catatanTambahan: "",
    uploadedSurat: null as File | null
  });

  // Calculate Metrics
  const totalRekomendasi = data.length;
  const dalamProses = data.filter((r) => r.statusTindakLanjut === "Dalam Proses").length;
  const selesaiPatuh = data.filter((r) => r.statusTindakLanjut === "Selesai & Patuh").length;
  const diberiSanksi = data.filter((r) => r.statusTindakLanjut === "Diberi Sanksi").length;

  // Filter Data
  const filteredData = data.filter((r) => {
    const matchTL = filterTindakLanjut === "Semua" || r.statusTindakLanjut === filterTindakLanjut;
    const matchVerif = filterVerifikasi === "Semua" || r.statusVerifikasi === filterVerifikasi;
    return matchTL && matchVerif;
  });

  // Handle Create Surat Rekomendasi
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.badanUsahaAtauObjek || !formData.temuanUtama || !formData.rekomendasiTindakan) {
      alert("Harap lengkapi nama badan usaha, temuan audit, dan rekomendasi tindakan!");
      return;
    }

    const newId = `REK-${tertibType === "tertib-usaha" ? "TU" : tertibType === "tertib-penyelenggaraan" ? "TP" : "TM"}-${String(data.length + 1).padStart(3, "0")}`;
    const nomorSuratBaru = `600.1.2/${String(Math.floor(100 + Math.random() * 900))}/DPUPR-JAKON/2026`;

    const newRecord: RekomendasiRecord = {
      id: newId,
      nomorSurat: nomorSuratBaru,
      tertibType: tertibType,
      badanUsahaAtauObjek: formData.badanUsahaAtauObjek,
      temuanUtama: formData.temuanUtama,
      rekomendasiTindakan: formData.rekomendasiTindakan,
      tenggatWaktu: formData.tenggatWaktu,
      statusTindakLanjut: "Dalam Proses",
      statusVerifikasi: "Draft",
      catatanVerifikator: `Sifat: ${formData.jenisPeringatan}. Menunggu tindak lanjut rekanan sebelum tenggat waktu.`
    };

    setData([newRecord, ...data]);
    setIsCreateModalOpen(false);

    // Reset Form
    setFormData({
      badanUsahaAtauObjek: "",
      temuanUtama: "",
      rekomendasiTindakan: "",
      tenggatWaktu: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      jenisPeringatan: "Peringatan Tertulis I",
      catatanTambahan: "",
      uploadedSurat: null
    });
  };

  const handleOpenVerify = (record: RekomendasiRecord) => {
    setSelectedRecordForVerify(record);
  };

  const handleConfirmVerify = (decision: "sesuai" | "tidak_sesuai", notes: string) => {
    if (!selectedRecordForVerify) return;
    setIsVerifying(true);

    setTimeout(() => {
      const isApproved = decision === "sesuai";
      setData((prev) =>
        prev.map((r) =>
          r.id === selectedRecordForVerify.id
            ? {
                ...r,
                statusVerifikasi: isApproved ? "Terverifikasi" : "Ditolak",
                statusTindakLanjut: isApproved ? "Selesai & Patuh" : "Diberi Sanksi",
                catatanVerifikator: notes || (isApproved ? "Tindakan perbaikan diterima penuh." : "Dikenakan sanksi peringatan lanjutan.")
              }
            : r
        )
      );

      setIsVerifying(false);
      setSelectedRecordForVerify(null);
    }, 400);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data rekomendasi ini?")) {
      setData((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const columns: ColumnDef<RekomendasiRecord>[] = [
    {
      key: "nomorSurat",
      label: "NOMOR SURAT & BADAN USAHA",
      render: (row) => (
        <div>
          <span style={{ fontSize: "11px", fontWeight: 900, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 8px", borderRadius: "6px", fontFamily: "monospace" }}>
            {row.nomorSurat}
          </span>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", marginTop: "4px" }}>
            {row.badanUsahaAtauObjek}
          </div>
        </div>
      )
    },
    {
      key: "temuanUtama",
      label: "TEMUAN & REKOMENDASI TINDAKAN",
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxWidth: "340px" }}>
          <div style={{ fontSize: "11px", color: "#DC2626", fontWeight: 700, display: "flex", alignItems: "flex-start", gap: "4px" }}>
            <AlertTriangle style={{ width: "12px", height: "12px", flexShrink: 0, marginTop: "1px" }} />
            <span>Temuan: {row.temuanUtama}</span>
          </div>
          <div style={{ fontSize: "11px", color: "#334155", fontWeight: 600 }}>
            👉 Rekomendasi: {row.rekomendasiTindakan}
          </div>
        </div>
      )
    },
    {
      key: "tenggatWaktu",
      label: "BATAS WAKTU",
      width: "120px",
      align: "center",
      render: (row) => (
        <div>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#475569" }}>
            {row.tenggatWaktu}
          </span>
          <div style={{ fontSize: "10px", color: "#64748B" }}>30 Hari Kerja</div>
        </div>
      )
    },
    {
      key: "statusTindakLanjut",
      label: "STATUS TINDAK LANJUT",
      width: "150px",
      align: "center",
      render: (row) => <StatusBadge status={row.statusTindakLanjut} size="sm" />
    },
    {
      key: "statusVerifikasi",
      label: "VERIFIKASI",
      width: "130px",
      align: "center",
      render: (row) => <StatusBadge status={row.statusVerifikasi} size="sm" />
    }
  ];

  const targetInfo: VerificationTargetInfo | null = selectedRecordForVerify
    ? {
        id: selectedRecordForVerify.nomorSurat,
        title: selectedRecordForVerify.badanUsahaAtauObjek,
        category: `Rekomendasi Pengawasan — ${config.shortTitle}`,
        notes: `Temuan: ${selectedRecordForVerify.temuanUtama} | Rekomendasi: ${selectedRecordForVerify.rekomendasiTindakan}`,
        date: selectedRecordForVerify.tenggatWaktu
      }
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Module Header */}
      <ModuleHeader
        breadcrumbs={[
          { label: config.shortTitle, href: config.basePath },
          { label: "Rekomendasi & Tindak Lanjut" }
        ]}
        badgeText={config.pilar}
        badgeBg={config.badgeBg}
        badgeColor={config.badgeColor}
        title={`Rekomendasi & Tindak Lanjut — ${config.shortTitle}`}
        description="Penerbitan surat rekomendasi teknis perbaikan, pemantauan batas waktu tindak lanjut, dan verifikasi kepatuhan administratif."
        legalBasis={config.legalBasis}
        actionButtons={[
          {
            label: "Terbitkan Surat Rekomendasi",
            icon: Plus,
            variant: "primary",
            onClick: () => setIsCreateModalOpen(true)
          },
          {
            label: "Unduh Rekap Sanksi (PDF)",
            icon: Download,
            onClick: () => alert(`Mengunduh Rekapitulasi Surat Peringatan & Sanksi Administratif (${config.shortTitle})...`)
          }
        ]}
      />

      {/* 4 Summary Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "18px", padding: "18px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "14px", background: "linear-gradient(135deg, #0F2E5C, #1E40AF)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText style={{ width: "24px", height: "24px" }} />
          </div>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Total Rekomendasi</span>
            <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#0F2E5C", margin: "2px 0 0 0" }}>{totalRekomendasi} Surat</h3>
            <span style={{ fontSize: "10px", color: "#64748B" }}>Tahun Anggaran 2026</span>
          </div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "18px", padding: "18px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "14px", background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Clock style={{ width: "24px", height: "24px" }} />
          </div>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Dalam Proses Koreksi</span>
            <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#D97706", margin: "2px 0 0 0" }}>{dalamProses} Rekanan</h3>
            <span style={{ fontSize: "10px", color: "#D97706", fontWeight: 700 }}>Menunggu Bukti Perbaikan</span>
          </div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "18px", padding: "18px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "14px", background: "linear-gradient(135deg, #10B981, #059669)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 style={{ width: "24px", height: "24px" }} />
          </div>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Selesai & Patuh</span>
            <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#059669", margin: "2px 0 0 0" }}>{selesaiPatuh} Kasus</h3>
            <span style={{ fontSize: "10px", color: "#059669", fontWeight: 700 }}>Tindakan Perbaikan Diterima</span>
          </div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "18px", padding: "18px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "14px", background: "linear-gradient(135deg, #EF4444, #DC2626)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Scale style={{ width: "24px", height: "24px" }} />
          </div>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Dikenakan Sanksi</span>
            <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#DC2626", margin: "2px 0 0 0" }}>{diberiSanksi} Sanksi</h3>
            <span style={{ fontSize: "10px", color: "#DC2626", fontWeight: 700 }}>Eskalasi Surat Peringatan</span>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div
        style={{
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div>
            <label style={{ fontSize: "10px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Filter Status Tindak Lanjut
            </label>
            <select
              value={filterTindakLanjut}
              onChange={(e) => setFilterTindakLanjut(e.target.value)}
              style={{
                height: "36px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                padding: "0 10px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#1E293B"
              }}
            >
              <option value="Semua">Semua Tindak Lanjut</option>
              <option value="Dalam Proses">Dalam Proses</option>
              <option value="Selesai & Patuh">Selesai & Patuh</option>
              <option value="Diberi Sanksi">Diberi Sanksi</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "10px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Status Verifikasi
            </label>
            <select
              value={filterVerifikasi}
              onChange={(e) => setFilterVerifikasi(e.target.value)}
              style={{
                height: "36px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                padding: "0 10px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#1E293B"
              }}
            >
              <option value="Semua">Semua Verifikasi</option>
              <option value="Draft">Draft</option>
              <option value="Terverifikasi">Terverifikasi</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setFilterTindakLanjut("Semua");
            setFilterVerifikasi("Semua");
          }}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1px solid #CBD5E1",
            backgroundColor: "#F8FAFC",
            color: "#475569",
            fontSize: "11px",
            fontWeight: 800,
            cursor: "pointer"
          }}
        >
          Reset Filter
        </button>
      </div>

      {/* DataTableView */}
      <DataTableView<RekomendasiRecord>
        title={`Daftar Surat Rekomendasi & Tindak Lanjut (${filteredData.length})`}
        subtitle="Monitoring pemenuhan komitmen perbaikan hasil audit pengawasan lapangan"
        data={filteredData}
        columns={columns}
        defaultPageSize={10}
        exportFileName={`Rekomendasi_${tertibType}`}
        actionsHeader="AKSI REKOMENDASI"
        actionsRender={(row) => (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <button
              type="button"
              title="Lihat Pratinjau Surat Resmi"
              onClick={() => setSelectedRecordForDetail(row)}
              style={{
                padding: "6px",
                borderRadius: "6px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#FFFFFF",
                color: "#0F2E5C",
                cursor: "pointer"
              }}
            >
              <Eye style={{ width: "13px", height: "13px" }} />
            </button>

            {row.statusVerifikasi === "Draft" ? (
              <button
                type="button"
                onClick={() => handleOpenVerify(row)}
                style={{
                  backgroundColor: "#0F2E5C",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  padding: "5px 10px",
                  fontSize: "10px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <ShieldCheck style={{ width: "12px", height: "12px", color: "#FFC000" }} />
                <span>Verifikasi</span>
              </button>
            ) : (
              <span style={{ fontSize: "10px", color: "#166534", fontWeight: 800, backgroundColor: "#DCFCE7", padding: "3px 6px", borderRadius: "4px" }}>
                ✓ Sah
              </span>
            )}

            <button
              type="button"
              title="Hapus Rekomendasi"
              onClick={() => handleDelete(row.id)}
              style={{
                padding: "6px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#FEE2E2",
                color: "#991B1B",
                cursor: "pointer"
              }}
            >
              <Trash2 style={{ width: "13px", height: "13px" }} />
            </button>
          </div>
        )}
      />

      {/* Modal Terbitkan Surat Rekomendasi Baru */}
      <ModalForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Terbitkan Surat Rekomendasi & Tindak Lanjut"
        subtitle="Penerbitan surat teguran tertulis / instruksi perbaikan teknis hasil audit pengawasan"
        icon={FileText}
        size="lg"
        submitLabel="Terbitkan Surat Rekomendasi"
        onSubmit={handleCreateSubmit}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
              Badan Usaha / Objek Penerima Rekomendasi <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: PT. Sumber Beton Mandiri / Proyek RSUD Ciawi"
              value={formData.badanUsahaAtauObjek}
              onChange={(e) => setFormData({ ...formData, badanUsahaAtauObjek: e.target.value })}
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
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Klasifikasi Sifat Surat Peringatan
              </label>
              <select
                value={formData.jenisPeringatan}
                onChange={(e) => setFormData({ ...formData, jenisPeringatan: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px"
                }}
              >
                <option value="Peringatan Tertulis I">Peringatan Tertulis I (Teguran Pertama)</option>
                <option value="Peringatan Tertulis II">Peringatan Tertulis II (Teguran Keras)</option>
                <option value="Pembatasan Kegiatan Usaha">Pembatasan Kegiatan Usaha</option>
                <option value="Penghentian Sementara Proyek">Penghentian Sementara Pekerjaan Fisik</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Batas Waktu Penyelesaian (Tenggat)
              </label>
              <input
                type="date"
                value={formData.tenggatWaktu}
                onChange={(e) => setFormData({ ...formData, tenggatWaktu: e.target.value })}
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
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
              Uraian Temuan Ketidaksesuaian Hasil Audit <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <textarea
              required
              rows={2}
              value={formData.temuanUtama}
              onChange={(e) => setFormData({ ...formData, temuanUtama: e.target.value })}
              placeholder="Jelaskan secara spesifik ketidaksesuaian dokumen, sertifikat, atau teknis lapangan..."
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "12px",
                fontFamily: "inherit"
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
              Rekomendasi Tindakan Korektif yang Wajib Dilakukan <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formData.rekomendasiTindakan}
              onChange={(e) => setFormData({ ...formData, rekomendasiTindakan: e.target.value })}
              placeholder="Langkah-langkah perbaikan terukur yang harus dipenuhi penyedia jasa / pengelola..."
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "12px",
                fontFamily: "inherit"
              }}
            />
          </div>

          {/* Upload Berkas Surat Resmi PDF */}
          <FileUploader
            label="Unggah Salinan Surat Resmi Bertanda Tangan (PDF)"
            accept=".pdf"
            maxSizeMb={5}
            hint="Salinan resmi surat dinas berstempel resmi Dinas PUPR. Maksimal 5MB."
            onFileSelect={(file) => setFormData({ ...formData, uploadedSurat: file })}
          />
        </div>
      </ModalForm>

      {/* Modal Detail Surat Rekomendasi Resmi */}
      {selectedRecordForDetail && (
        <ModalForm
          isOpen={!!selectedRecordForDetail}
          onClose={() => setSelectedRecordForDetail(null)}
          title={`Surat Rekomendasi & Tindak Lanjut`}
          subtitle={`Nomor: ${selectedRecordForDetail.nomorSurat}`}
          icon={FileText}
          size="lg"
          hideFooter
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ borderBottom: "2px solid #0F2E5C", paddingBottom: "12px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>
                Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Bogor
              </span>
              <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#0F2E5C", margin: "4px 0" }}>
                SURAT REKOMENDASI DAN TINDAK LANJUT PENGAWASAN JASA KONSTRUKSI
              </h3>
              <span style={{ fontSize: "11px", color: "#475569" }}>
                Nomor: {selectedRecordForDetail.nomorSurat} • Dasar: Permen PUPR No. 1/2023
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", backgroundColor: "#F8FAFC", padding: "14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
              <div>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700 }}>Badan Usaha / Penerima:</span>
                <p style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C", margin: "2px 0 0 0" }}>
                  {selectedRecordForDetail.badanUsahaAtauObjek}
                </p>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700 }}>Batas Akhir Pemenuhan:</span>
                <p style={{ fontSize: "13px", fontWeight: 800, color: "#DC2626", margin: "2px 0 0 0" }}>
                  📅 {selectedRecordForDetail.tenggatWaktu}
                </p>
              </div>
            </div>

            <div style={{ padding: "12px 14px", borderRadius: "10px", backgroundColor: "#FEF2F2", border: "1px solid #FEE2E2" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#991B1B", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Temuan Audit Lapangan
              </span>
              <p style={{ fontSize: "12px", color: "#7F1D1D", margin: 0, lineHeight: 1.5 }}>
                {selectedRecordForDetail.temuanUtama}
              </p>
            </div>

            <div style={{ padding: "12px 14px", borderRadius: "10px", backgroundColor: "#F0FDF4", border: "1px solid #DCFCE7" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#166534", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Instruksi Rekomendasi Tindakan Korektif
              </span>
              <p style={{ fontSize: "12px", color: "#14532D", margin: 0, lineHeight: 1.5 }}>
                {selectedRecordForDetail.rekomendasiTindakan}
              </p>
            </div>

            {selectedRecordForDetail.catatanVerifikator && (
              <div style={{ fontSize: "11px", color: "#64748B", fontStyle: "italic", borderTop: "1px dashed #CBD5E1", paddingTop: "8px" }}>
                Catatan Verifikator: {selectedRecordForDetail.catatanVerifikator}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid #E2E8F0" }}>
              <StatusBadge status={selectedRecordForDetail.statusTindakLanjut} />
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => alert(`Mencetak salinan resmi surat ${selectedRecordForDetail.nomorSurat}...`)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    backgroundColor: "#FFFFFF",
                    color: "#0F2E5C",
                    fontSize: "11px",
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  <Printer style={{ width: "13px", height: "13px" }} />
                  <span>Cetak Surat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRecordForDetail(null)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    backgroundColor: "#0F2E5C",
                    color: "#FFFFFF",
                    border: "none",
                    fontSize: "11px",
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </ModalForm>
      )}

      {/* Reusable VerificationDialog */}
      <VerificationDialog
        isOpen={!!selectedRecordForVerify}
        onClose={() => setSelectedRecordForVerify(null)}
        target={targetInfo}
        onConfirm={handleConfirmVerify}
        isLoading={isVerifying}
      />
    </div>
  );
}

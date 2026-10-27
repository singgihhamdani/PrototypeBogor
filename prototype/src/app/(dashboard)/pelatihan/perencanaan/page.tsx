"use client";
import React, { useState } from "react";
import ModuleHeader from "@/components/layout/module-header";
import { 
  GraduationCap, Plus, Download, FileText, CheckCircle2, 
  Calendar, Users, Search, Wallet, ShieldCheck, Trash2, Eye, FileSpreadsheet
} from "lucide-react";
import DataTableView, { ColumnDef } from "@/components/common/data-table-view";
import ModalForm from "@/components/common/modal-form";
import FileUploader from "@/components/common/file-uploader";
import VerificationDialog from "@/components/common/verification-dialog";
import StatusBadge from "@/components/common/status-badge";
import BatchImportModal from "@/components/common/batch-import-modal";
import DocStatusBadge from "@/components/common/doc-status-badge";
import DocumentUploadMiniModal from "@/components/common/document-upload-mini-modal";
import DocCompletionBar from "@/components/common/doc-completion-bar";
import { TEMPLATE_PERENCANAAN_PELATIHAN } from "@/lib/sipjaki-templates";
import { logDataActivity } from "@/lib/audit-log";
import { fetchPerencanaanList, createPerencanaanItem, PerencanaanItem } from "@/lib/services/pelatihan-service";

type PerencanaanPelatihanItem = PerencanaanItem;

export default function PerencanaanPelatihanPage() {
  const [data, setData] = useState<PerencanaanPelatihanItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals & Batch Import State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBatchImportOpen, setIsBatchImportOpen] = useState(false);
  const [docUploadTarget, setDocUploadTarget] = useState<PerencanaanPelatihanItem | null>(null);
  const [filterDocPending, setFilterDocPending] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState<PerencanaanPelatihanItem | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    namaPaket: "",
    tahun: "2026",
    targetPeserta: 50,
    anggaran: 100000000,
    jadwal: "Mei - Agustus 2026",
    dokumenKak: "KAK_Program_Pelatihan_Baru.pdf"
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchPerencanaanList();
      setData(res.data.map(d => ({ ...d, _docStatus: "complete" })));
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const filteredData = data.filter((item) => {
    const matchDoc = !filterDocPending || item._docStatus === "pending" || !item.dokumenKak;
    return matchDoc;
  });

  const totalPeserta = data.reduce((acc, curr) => acc + curr.targetPeserta, 0);
  const totalAnggaran = data.reduce((acc, curr) => acc + curr.anggaran, 0);

  const handleBatchCommit = (parsedRows: any[]) => {
    const formatted: PerencanaanPelatihanItem[] = parsedRows.map((row, idx) => ({
      id: `PP-2026-${String(data.length + idx + 1).padStart(2, "0")}`,
      namaPaket: row.namaPaket || "Paket Pelatihan TKK Baru",
      tahun: String(row.tahun || "2026"),
      targetPeserta: Number(row.targetPeserta) || 50,
      anggaran: Number(String(row.anggaran || 0).replace(/\D/g, "")) || 100000000,
      jadwal: row.jadwal || "Mei - Agustus 2026",
      dokumenKak: row.dokumenKak || "",
      status: "Menunggu Verifikasi",
      _docStatus: row._docStatus || "pending"
    }));
    setData([...formatted, ...data]);
    logDataActivity({
      action: "import",
      module: "Perencanaan Pelatihan TKK",
      format: "xlsx",
      recordCount: formatted.length,
      user: "Bidang Jakon / Pembina Jasa Konstruksi",
      status: "success",
      fileName: `${TEMPLATE_PERENCANAAN_PELATIHAN.exportFileName}.xlsx`,
      details: `Impor batch ${formatted.length} paket perencanaan pelatihan - dokumen KAK dapat disusulkan`
    });
    alert(`Berhasil mengimpor ${formatted.length} paket rencana pelatihan! Dokumen KAK dapat diunggah menyusul.`);
  };

  const handleSaveUploadedDoc = (files: Record<string, File | null>, fileNames: Record<string, string>) => {
    if (!docUploadTarget) return;
    const newDocName = fileNames["dokumenKak"] || docUploadTarget.dokumenKak || `KAK_${docUploadTarget.id}.pdf`;
    setData((prev) =>
      prev.map((item) => {
        if (item.id === docUploadTarget.id) {
          return {
            ...item,
            dokumenKak: newDocName,
            _docStatus: "complete"
          };
        }
        return item;
      })
    );
    logDataActivity({
      action: "doc_upload",
      module: "Perencanaan Pelatihan TKK",
      format: "pdf",
      recordCount: 1,
      user: "Bidang Jakon / Pembina Jasa Konstruksi",
      status: "success",
      fileName: newDocName,
      details: `Upload dokumen susulan ${newDocName} untuk paket ${docUploadTarget.namaPaket}`
    });
    alert(`Dokumen "${newDocName}" berhasil diunggah! Status kelengkapan diperbarui menjadi Lengkap.`);
    setDocUploadTarget(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaPaket) {
      alert("Harap lengkapi nama paket pelatihan!");
      return;
    }

    const res = await createPerencanaanItem(formData);
    if (res.success) {
      alert("Paket perencanaan pelatihan berhasil disimpan ke database!");
      setIsCreateOpen(false);
      loadData();
    } else {
      alert(`Gagal menyimpan: ${res.error}`);
    }
  };

  const handleConfirmVerify = (decision: "sesuai" | "tidak_sesuai", notes: string) => {
    if (!verifyTarget) return;
    setIsVerifying(true);

    setTimeout(() => {
      setData((prev) =>
        prev.map((item) => {
          if (item.id === verifyTarget.id) {
            return {
              ...item,
              status: decision === "sesuai" ? "Terverifikasi" : "Ditolak"
            };
          }
          return item;
        })
      );
      setIsVerifying(false);
      setVerifyTarget(null);
    }, 400);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus paket perencanaan pelatihan ini?")) {
      setData((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const columns: ColumnDef<PerencanaanPelatihanItem>[] = [
    {
      key: "id",
      label: "KODE",
      width: "110px",
      render: (row) => (
        <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "2px 6px", borderRadius: "4px", fontFamily: "monospace" }}>
          {row.id}
        </span>
      )
    },
    {
      key: "namaPaket",
      label: "NAMA PAKET KEGIATAN",
      render: (row) => (
        <div>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", lineHeight: 1.35 }}>
            {row.namaPaket}
          </div>
          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "3px" }}>
            📅 Jadwal: {row.jadwal} • TA {row.tahun}
          </div>
        </div>
      )
    },
    {
      key: "targetPeserta",
      label: "TARGET TKK",
      width: "120px",
      align: "center",
      render: (row) => (
        <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C" }}>
          {row.targetPeserta} Orang
        </span>
      )
    },
    {
      key: "anggaran",
      label: "PAGU ANGGARAN",
      width: "150px",
      align: "right",
      render: (row) => (
        <span style={{ fontSize: "12px", fontWeight: 800, color: "#166534" }}>
          Rp {row.anggaran.toLocaleString("id-ID")}
        </span>
      )
    },
    {
      key: "dokumenKak",
      label: "DOKUMEN KAK",
      width: "180px",
      render: (row) => (
        <DocStatusBadge
          status={row._docStatus || (row.dokumenKak ? "complete" : "pending")}
          fileName={row.dokumenKak}
          documentLabel="KAK Pelatihan"
          onClick={() => setDocUploadTarget(row)}
        />
      )
    },
    {
      key: "status",
      label: "STATUS",
      width: "140px",
      align: "center",
      render: (row) => <StatusBadge status={row.status} size="sm" />
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <ModuleHeader
        breadcrumbs={[
          { label: "Pelatihan & TKK", href: "/pelatihan" },
          { label: "Perencanaan Pelatihan" }
        ]}
        badgeText="Pilar 5: Pelatihan & TKK"
        badgeBg="#DCFCE7"
        badgeColor="#166534"
        title="Perencanaan Program Pelatihan & Sertifikasi TKK"
        description="Penyusunan Kerangka Acuan Kerja (KAK), alokasi pagu APBD, dan target kuantitatif TKK tersertifikasi di Kabupaten Bogor."
        legalBasis="Pasal 7 UU No. 2/2017 & Permen PUPR No. 1/2023"
        actionButtons={[
          {
            label: "Import Batch KAK (Excel)",
            icon: FileSpreadsheet,
            variant: "secondary",
            onClick: () => setIsBatchImportOpen(true)
          },
          {
            label: "Tambah Paket Pelatihan",
            icon: Plus,
            variant: "primary",
            onClick: () => setIsCreateOpen(true)
          },
          {
            label: "Unduh RKA Pelatihan (PDF)",
            icon: Download,
            onClick: () => alert("Mengunduh Rekapitulasi RKA Pelatihan 2026...")
          }
        ]}
      />

      {/* Top 3 Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "18px", padding: "18px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "14px", backgroundColor: "#EBF2FA", color: "#0F2E5C", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GraduationCap style={{ width: "24px", height: "24px" }} />
          </div>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Total Program</span>
            <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#0F2E5C", margin: "2px 0 0 0" }}>{data.length} Paket</h3>
            <span style={{ fontSize: "10px", color: "#64748B" }}>Tahun Anggaran 2026</span>
          </div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "18px", padding: "18px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "14px", backgroundColor: "#FEF3C7", color: "#92400E", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users style={{ width: "24px", height: "24px" }} />
          </div>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Target Total TKK</span>
            <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#92400E", margin: "2px 0 0 0" }}>{totalPeserta} Peserta</h3>
            <span style={{ fontSize: "10px", color: "#10B981", fontWeight: 700 }}>Kuota Fasilitasi APBD</span>
          </div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "18px", padding: "18px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "14px", backgroundColor: "#DCFCE7", color: "#166534", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Wallet style={{ width: "24px", height: "24px" }} />
          </div>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Total Pagu Anggaran</span>
            <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#166534", margin: "2px 0 0 0" }}>
              Rp {(totalAnggaran / 1000000).toFixed(0)} Juta
            </h3>
            <span style={{ fontSize: "10px", color: "#64748B" }}>Sub-kegiatan Pemberdayaan TKK</span>
          </div>
        </div>
      </div>

      {/* Indikator Kelengkapan Dokumen */}
      <DocCompletionBar
        records={data}
        label="Kelengkapan Dokumen KAK Pelatihan (PDF)"
        filterActive={filterDocPending}
        onToggleFilter={() => setFilterDocPending(!filterDocPending)}
      />

      {/* DataTableView */}
      <DataTableView<PerencanaanPelatihanItem>
        title={`Rencana Kerja Program Pelatihan (${filteredData.length} Paket)`}
        subtitle="Dokumentasi KAK dan alokasi anggaran pelatihan tenaga kerja konstruksi"
        data={filteredData}
        columns={columns}
        exportFileName="Perencanaan_Pelatihan_Bogor"
        sipjakiTemplate={TEMPLATE_PERENCANAAN_PELATIHAN}
        exportColumns={TEMPLATE_PERENCANAAN_PELATIHAN.columns}
        actionsHeader="AKSI"
        actionsRender={(row) => (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            {row.status === "Menunggu Verifikasi" ? (
              <button
                type="button"
                onClick={() => setVerifyTarget(row)}
                style={{
                  backgroundColor: "#0F2E5C",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  padding: "4px 8px",
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

      {/* Modal Tambah Paket */}
      <ModalForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tambah Paket Perencanaan Pelatihan Baru"
        subtitle="Daftarkan program pelatihan atau fasilitasi uji kompetensi sertifikasi TKK"
        icon={GraduationCap}
        size="lg"
        submitLabel="Simpan Paket Pelatihan"
        onSubmit={handleCreateSubmit}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
              Nama Paket Kegiatan Pelatihan <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Bimtek Pelaksana Lapangan Perkerasan Jalan Beton"
              value={formData.namaPaket}
              onChange={(e) => setFormData({ ...formData, namaPaket: e.target.value })}
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
                Target Peserta (TKK)
              </label>
              <input
                type="number"
                value={formData.targetPeserta}
                onChange={(e) => setFormData({ ...formData, targetPeserta: Number(e.target.value) })}
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
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Alokasi Pagu Anggaran (Rp)
              </label>
              <input
                type="number"
                value={formData.anggaran}
                onChange={(e) => setFormData({ ...formData, anggaran: Number(e.target.value) })}
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Jadwal Pelaksanaan
              </label>
              <input
                type="text"
                placeholder="Contoh: Mei - Agustus 2026"
                value={formData.jadwal}
                onChange={(e) => setFormData({ ...formData, jadwal: e.target.value })}
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
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
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

          <FileUploader
            label="Unggah Kerangka Acuan Kerja / KAK (PDF)"
            accept=".pdf"
            maxSizeMb={5}
            hint="Format KAK resmi ditandatangani PPK. Maksimal 5MB."
          />
        </div>
      </ModalForm>

      {/* Verification Dialog */}
      {verifyTarget && (
        <VerificationDialog
          isOpen={!!verifyTarget}
          onClose={() => setVerifyTarget(null)}
          target={{
            id: verifyTarget.id,
            title: verifyTarget.namaPaket,
            category: `Pagu: Rp ${verifyTarget.anggaran.toLocaleString("id-ID")} • Target: ${verifyTarget.targetPeserta} TKK`,
            notes: `Jadwal: ${verifyTarget.jadwal} • Dokumen KAK: ${verifyTarget.dokumenKak}`
          }}
          onConfirm={handleConfirmVerify}
          isLoading={isVerifying}
        />
      )}

      {/* Mini Modal Unggah Dokumen Susulan */}
      {docUploadTarget && (
        <DocumentUploadMiniModal
          isOpen={!!docUploadTarget}
          onClose={() => setDocUploadTarget(null)}
          title={`Unggah Dokumen KAK: ${docUploadTarget.namaPaket}`}
          documentFields={TEMPLATE_PERENCANAAN_PELATIHAN.documentFields || []}
          existingDocuments={{
            dokumenKak: docUploadTarget.dokumenKak
          }}
          onSave={handleSaveUploadedDoc}
        />
      )}

      {/* Modal Batch Import Excel */}
      <BatchImportModal
        isOpen={isBatchImportOpen}
        onClose={() => setIsBatchImportOpen(false)}
        template={TEMPLATE_PERENCANAAN_PELATIHAN}
        onCommit={handleBatchCommit}
      />
    </div>
  );
}

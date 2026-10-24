"use client";
import React, { useState } from "react";
import ModuleHeader from "@/components/layout/module-header";
import { 
  FileText, Plus, Download, CheckCircle2, 
  Award, Users, Search, ShieldCheck, Trash2, Eye, FileSpreadsheet 
} from "lucide-react";
import DataTableView, { ColumnDef } from "@/components/common/data-table-view";
import ModalForm from "@/components/common/modal-form";
import FileUploader from "@/components/common/file-uploader";
import VerificationDialog from "@/components/common/verification-dialog";
import StatusBadge from "@/components/common/status-badge";
import BatchImportModal, { BatchColumnDef } from "@/components/common/batch-import-modal";
import DocStatusBadge from "@/components/common/doc-status-badge";
import DocumentUploadMiniModal from "@/components/common/document-upload-mini-modal";
import DocCompletionBar from "@/components/common/doc-completion-bar";
import { TEMPLATE_LAPORAN_PELATIHAN } from "@/lib/sipjaki-templates";
import { logDataActivity } from "@/lib/audit-log";
import { fetchLaporanList, createLaporanItem, LaporanItem } from "@/lib/services/pelatihan-service";

type LaporanPelatihanItem = LaporanItem;

const tkkBatchColumns: BatchColumnDef[] = [
  { key: "nomorLaporan", label: "Nomor Berita Acara", required: true, example: "029/BA-LSP-GATAKI/IX/2026" },
  { key: "namaKegiatan", label: "Nama Program Sertifikasi", required: true, example: "Uji Kompetensi Mandor Perkerasan Jalan Madya" },
  { key: "tanggalSelesai", label: "Tanggal Pelaksanaan", required: true, example: "2026-05-15" },
  { key: "jumlahLulusan", label: "Jumlah Lulusan", required: true, example: "45" },
  { key: "lembagaSertifikasi", label: "Lembaga LSP / Asesor", required: true, example: "LSP Gataki Karya Konstruksi" },
];

const sampleBatchTkk = [
  { nomorLaporan: "030/BA-LSP-GATAKI/X/2026", namaKegiatan: "Sertifikasi Juru Ukur Gedung Angkatan II", tanggalSelesai: "2026-05-20", jumlahLulusan: 35, lembagaSertifikasi: "LSP Astekindo Jawa Barat" },
  { nomorLaporan: "031/BA-LSP-K3/X/2026", namaKegiatan: "Bimtek & Uji Petugas K3 Konstruksi Batch III", tanggalSelesai: "2026-05-25", jumlahLulusan: 50, lembagaSertifikasi: "LSP Keselamatan Konstruksi Indonesia" }
];

export default function LaporanPelatihanPage() {
  const [data, setData] = useState<LaporanPelatihanItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBatchImportOpen, setIsBatchImportOpen] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState<LaporanPelatihanItem | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [docUploadTarget, setDocUploadTarget] = useState<LaporanPelatihanItem | null>(null);
  const [filterDocPending, setFilterDocPending] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nomorLaporan: "",
    namaKegiatan: "",
    tanggalSelesai: new Date().toISOString().split("T")[0],
    jumlahLulusan: 30,
    lembagaSertifikasi: "LSP Gataki Karya Konstruksi",
    dokumenBa: "BA_Hasil_Uji_Kompetensi.pdf"
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchLaporanList();
      setData(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleBatchCommit = (parsedRows: any[]) => {
    const formatted: LaporanPelatihanItem[] = parsedRows.map((row, idx) => ({
      id: `LAP-IMP-${String(data.length + idx + 1).padStart(2, "0")}`,
      nomorLaporan: row.nomorLaporan || `BA-IMP-${idx + 1}`,
      namaKegiatan: row.namaKegiatan || "Program Fasilitasi Sertifikasi TKK",
      tanggalSelesai: row.tanggalSelesai || new Date().toISOString().split("T")[0],
      jumlahLulusan: Number(row.jumlahLulusan) || 25,
      lembagaSertifikasi: row.lembagaSertifikasi || "LSP Terlisensi BNSP",
      dokumenBa: row.dokumenBa || "",
      status: "Menunggu Verifikasi",
      _docStatus: row._docStatus || "pending"
    }));
    setData([...formatted, ...data]);
    logDataActivity({
      action: "import",
      module: "Laporan Pelatihan & Sertifikasi TKK",
      format: "xlsx",
      recordCount: formatted.length,
      user: "Admin Pelatihan Jakon",
      status: "success",
      fileName: "Import_Laporan_Pelatihan.xlsx",
      details: `Impor batch ${formatted.length} laporan pelatihan via Excel (dokumen BA dapat disusulkan)`
    });
    alert(`Berhasil mengimpor ${formatted.length} Berita Acara sertifikasi TKK secara massal! Dokumen BA dapat disusulkan per baris.`);
  };

  const handleSaveUploadedDoc = (files: Record<string, File | null>, fileNames: Record<string, string>) => {
    if (!docUploadTarget) return;
    const newBaName = fileNames["dokumenBa"] || docUploadTarget.dokumenBa || `BA_${docUploadTarget.nomorLaporan.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
    setData((prev) =>
      prev.map((item) => {
        if (item.id === docUploadTarget.id) {
          return {
            ...item,
            dokumenBa: newBaName,
            _docStatus: "complete"
          };
        }
        return item;
      })
    );
    logDataActivity({
      action: "doc_upload",
      module: "Laporan Pelatihan & Sertifikasi TKK",
      format: "pdf",
      recordCount: 1,
      user: "Admin Pelatihan Jakon",
      status: "success",
      fileName: newBaName,
      details: `Unggah Berita Acara (BA) susulan untuk laporan: ${docUploadTarget.nomorLaporan}`
    });
    setDocUploadTarget(null);
  };

  const totalLulusan = data.reduce((acc, curr) => acc + curr.jumlahLulusan, 0);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaKegiatan || !formData.nomorLaporan) {
      alert("Harap lengkapi nomor BA dan nama kegiatan sertifikasi!");
      return;
    }

    const res = await createLaporanItem(formData);
    if (res.success) {
      alert("Laporan / Berita Acara berhasil disimpan ke database!");
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
    if (confirm("Apakah Anda yakin ingin menghapus data laporan hasil sertifikasi ini?")) {
      setData((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const columns: ColumnDef<LaporanPelatihanItem>[] = [
    {
      key: "nomorLaporan",
      label: "NOMOR BA KELULUSAN",
      width: "180px",
      render: (row) => (
        <div>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 8px", borderRadius: "6px", fontFamily: "monospace" }}>
            {row.nomorLaporan}
          </span>
          <div style={{ fontSize: "10px", color: "#64748B", marginTop: "3px" }}>
            Selesai: {row.tanggalSelesai}
          </div>
        </div>
      )
    },
    {
      key: "namaKegiatan",
      label: "PROGRAM & LEMBAGA SERTIFIKASI",
      render: (row) => (
        <div>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", lineHeight: 1.35 }}>
            {row.namaKegiatan}
          </div>
          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "3px", display: "flex", alignItems: "center", gap: "4px" }}>
            <Award style={{ width: "12px", height: "12px", color: "#16A34A" }} />
            <span>Asesor: {row.lembagaSertifikasi}</span>
          </div>
        </div>
      )
    },
    {
      key: "jumlahLulusan",
      label: "LULUS SKK",
      width: "130px",
      align: "center",
      render: (row) => (
        <span style={{ fontSize: "13px", fontWeight: 900, color: "#166534", backgroundColor: "#DCFCE7", padding: "3px 10px", borderRadius: "8px" }}>
          {row.jumlahLulusan} TKK
        </span>
      )
    },
    {
      key: "dokumenBa",
      label: "BERITA ACARA (BA)",
      width: "190px",
      render: (row) => (
        <DocStatusBadge
          status={row._docStatus || (row.dokumenBa ? "complete" : "pending")}
          fileName={row.dokumenBa}
          documentLabel="BA Kelulusan"
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
          { label: "Laporan Fasilitasi Sertifikasi" }
        ]}
        badgeText="Pilar 5: Pelatihan & TKK"
        badgeBg="#DCFCE7"
        badgeColor="#166534"
        title="Laporan Fasilitasi Sertifikasi TKK"
        description="Dokumentasi Berita Acara (BA) hasil uji kompetensi sertifikasi, daftar lulusan SKK, dan pelaporan realisasi ke Kementerian PUPR."
        legalBasis="Pasal 7 UU No. 2/2017 & Permen PUPR No. 1/2023"
        actionButtons={[
          {
            label: "Import Batch BA (Excel/CSV)",
            icon: FileSpreadsheet,
            variant: "outline",
            onClick: () => setIsBatchImportOpen(true)
          },
          {
            label: "Catat BA Kelulusan Baru",
            icon: Plus,
            variant: "primary",
            onClick: () => setIsCreateOpen(true)
          },
          {
            label: "Unduh Rekap (XLSX)",
            icon: Download,
            onClick: () => alert("Mengunduh Rekapitulasi Nominatif Lulusan SKK (.xlsx)...")
          }
        ]}
      />

      {/* Top Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "18px", padding: "18px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "14px", backgroundColor: "#DCFCE7", color: "#166534", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Award style={{ width: "24px", height: "24px" }} />
          </div>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Total Lulusan SKK</span>
            <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#166534", margin: "2px 0 0 0" }}>{totalLulusan} TKK</h3>
            <span style={{ fontSize: "10px", color: "#10B981", fontWeight: 700 }}>Tersertifikasi BNSP / LSP</span>
          </div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "18px", padding: "18px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "14px", backgroundColor: "#EBF2FA", color: "#0F2E5C", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText style={{ width: "24px", height: "24px" }} />
          </div>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Berita Acara Resmi</span>
            <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#0F2E5C", margin: "2px 0 0 0" }}>{data.length} Dokumen</h3>
            <span style={{ fontSize: "10px", color: "#64748B" }}>Tahun Anggaran 2026</span>
          </div>
        </div>
      </div>

      {/* Doc Completion Progress Bar */}
      <DocCompletionBar
        total={data.length}
        completed={data.filter((d) => d._docStatus === "complete" || Boolean(d.dokumenBa)).length}
        label="Kelengkapan Berita Acara (BA) Sertifikasi"
        isFilterActive={filterDocPending}
        onFilterPending={() => setFilterDocPending((prev) => !prev)}
      />

      {/* DataTableView */}
      <DataTableView<LaporanPelatihanItem>
        title={`Daftar Laporan Berita Acara Uji Sertifikasi (${data.length} BA)`}
        subtitle={
          filterDocPending
            ? `Menampilkan entri yang belum memiliki lampiran Berita Acara (BA)`
            : "Rekapitulasi penetapan hasil uji kompetensi tenaga kerja konstruksi"
        }
        data={filterDocPending ? data.filter((d) => d._docStatus === "pending" || !d.dokumenBa) : data}
        columns={columns}
        exportFileName="Laporan_Sertifikasi_TKK_Bogor"
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
                ✓ Terverifikasi
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

      {/* Modal Catat BA Baru */}
      <ModalForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Catat Berita Acara (BA) Uji Sertifikasi Baru"
        subtitle="Registrasikan dokumen penetapan hasil uji kompetensi dan jumlah kelulusan TKK"
        icon={Award}
        size="lg"
        submitLabel="Simpan Laporan Kelulusan"
        onSubmit={handleCreateSubmit}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
              Nomor Berita Acara (BA) <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: 025/BA-LSP-GATAKI/VIII/2026"
              value={formData.nomorLaporan}
              onChange={(e) => setFormData({ ...formData, nomorLaporan: e.target.value })}
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
              Nama Program Sertifikasi <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Uji Kompetensi Pelaksana Lapangan Saluran Irigasi Madya"
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
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Jumlah TKK Lulus SKK
              </label>
              <input
                type="number"
                value={formData.jumlahLulusan}
                onChange={(e) => setFormData({ ...formData, jumlahLulusan: Number(e.target.value) })}
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
                Tanggal Pelaksanaan Selesai
              </label>
              <input
                type="date"
                value={formData.tanggalSelesai}
                onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })}
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
              Lembaga Sertifikasi Profesi (LSP Terlisensi BNSP)
            </label>
            <input
              type="text"
              value={formData.lembagaSertifikasi}
              onChange={(e) => setFormData({ ...formData, lembagaSertifikasi: e.target.value })}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "13px"
              }}
            />
          </div>

          <FileUploader
            label="Unggah Salinan Scan Berita Acara Uji Kompetensi (PDF)"
            accept=".pdf"
            maxSizeMb={5}
            hint="Format Berita Acara lengkap bertanda tangan asesor LSP. Maksimal 5MB."
          />
        </div>
      </ModalForm>

      {/* Verification Dialog */}
      {verifyTarget && (
        <VerificationDialog
          isOpen={!!verifyTarget}
          onClose={() => setVerifyTarget(null)}
          target={{
            id: verifyTarget.nomorLaporan,
            title: verifyTarget.namaKegiatan,
            category: `Lembaga: ${verifyTarget.lembagaSertifikasi} • Lulusan: ${verifyTarget.jumlahLulusan} TKK`,
            notes: `Tanggal Selesai: ${verifyTarget.tanggalSelesai} • Dokumen: ${verifyTarget.dokumenBa}`
          }}
          onConfirm={handleConfirmVerify}
          isLoading={isVerifying}
        />
      )}

      {/* Mini Modal Upload Dokumen Susulan */}
      {docUploadTarget && (
        <DocumentUploadMiniModal
          isOpen={Boolean(docUploadTarget)}
          onClose={() => setDocUploadTarget(null)}
          title={`Unggah Dokumen BA — ${docUploadTarget.nomorLaporan}`}
          subtitle={`${docUploadTarget.namaKegiatan} • ${docUploadTarget.lembagaSertifikasi}`}
          documentFields={TEMPLATE_LAPORAN_PELATIHAN.documentFields || [
            { key: "dokumenBa", label: "Berita Acara Kelulusan (BA)", accept: ".pdf", maxSizeMb: 5, required: true }
          ]}
          currentValues={{ dokumenBa: docUploadTarget.dokumenBa }}
          onSave={handleSaveUploadedDoc}
        />
      )}

      {/* Reusable Batch Import Modal */}
      <BatchImportModal<LaporanPelatihanItem>
        isOpen={isBatchImportOpen}
        onClose={() => setIsBatchImportOpen(false)}
        title="Import Batch Laporan Berita Acara Sertifikasi (Excel/CSV)"
        subtitle="Unggah berkas rekapitulasi penetapan hasil uji kompetensi TKK dari LSP/BNSP (Dokumen BA dapat disusulkan)"
        templateFileName="template_laporan_ba_sertifikasi_tkk.xlsx"
        expectedColumns={tkkBatchColumns}
        sampleRows={sampleBatchTkk}
        template={TEMPLATE_LAPORAN_PELATIHAN}
        onCommit={handleBatchCommit}
      />
    </div>
  );
}

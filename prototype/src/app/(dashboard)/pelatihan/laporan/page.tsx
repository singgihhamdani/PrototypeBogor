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

interface LaporanPelatihanItem {
  id: string;
  nomorLaporan: string;
  namaKegiatan: string;
  tanggalSelesai: string;
  jumlahLulusan: number;
  lembagaSertifikasi: string;
  dokumenBa: string;
  status: "Terverifikasi" | "Menunggu Verifikasi" | "Ditolak";
}

const mockLaporanPelatihan: LaporanPelatihanItem[] = [
  {
    id: "LAP-PEL-01",
    nomorLaporan: "005/BA-LSP-GATAKI/VI/2026",
    namaKegiatan: "Sertifikasi Uji Kompetensi Mandor Tukang Pasang Bata & Plesteran",
    tanggalSelesai: "2026-03-28",
    jumlahLulusan: 48,
    lembagaSertifikasi: "LSP Gataki Karya Konstruksi",
    dokumenBa: "BA_Kelulusan_Mandor_2026.pdf",
    status: "Terverifikasi"
  },
  {
    id: "LAP-PEL-02",
    nomorLaporan: "012/BA-LPK-BOGOR/V/2026",
    namaKegiatan: "Bimtek & Uji Sertifikasi Petugas K3 Konstruksi Tingkat Muda",
    tanggalSelesai: "2026-04-02",
    jumlahLulusan: 62,
    lembagaSertifikasi: "LSP Keselamatan Konstruksi Indonesia",
    dokumenBa: "BA_Sertifikasi_K3_2026.pdf",
    status: "Terverifikasi"
  },
  {
    id: "LAP-PEL-03",
    nomorLaporan: "018/BA-LSP-ASTEKINDO/VII/2026",
    namaKegiatan: "Fasilitasi Sertifikasi Juru Ukur (Surveyor) Berbasis SKK",
    tanggalSelesai: "2026-04-10",
    jumlahLulusan: 32,
    lembagaSertifikasi: "LSP Astekindo Jawa Barat",
    dokumenBa: "BA_Surveyor_2026.pdf",
    status: "Menunggu Verifikasi"
  }
];

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
  const [data, setData] = useState<LaporanPelatihanItem[]>(mockLaporanPelatihan);
  
  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBatchImportOpen, setIsBatchImportOpen] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState<LaporanPelatihanItem | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nomorLaporan: "",
    namaKegiatan: "",
    tanggalSelesai: new Date().toISOString().split("T")[0],
    jumlahLulusan: 30,
    lembagaSertifikasi: "LSP Gataki Karya Konstruksi",
    dokumenBa: "BA_Hasil_Uji_Kompetensi.pdf"
  });

  const handleBatchCommit = (parsedRows: any[]) => {
    const formatted: LaporanPelatihanItem[] = parsedRows.map((row, idx) => ({
      id: `LAP-IMP-${String(data.length + idx + 1).padStart(2, "0")}`,
      nomorLaporan: row.nomorLaporan || `BA-IMP-${idx + 1}`,
      namaKegiatan: row.namaKegiatan || "Program Fasilitasi Sertifikasi TKK",
      tanggalSelesai: row.tanggalSelesai || new Date().toISOString().split("T")[0],
      jumlahLulusan: Number(row.jumlahLulusan) || 25,
      lembagaSertifikasi: row.lembagaSertifikasi || "LSP Terlisensi BNSP",
      dokumenBa: `BA_Import_${String(row.nomorLaporan || "").replace(/[^a-zA-Z0-9]/g, "")}.pdf`,
      status: "Terverifikasi"
    }));
    setData([...formatted, ...data]);
    alert(`Berhasil mengimpor ${formatted.length} Berita Acara sertifikasi TKK secara massal!`);
  };

  const totalLulusan = data.reduce((acc, curr) => acc + curr.jumlahLulusan, 0);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaKegiatan || !formData.nomorLaporan) {
      alert("Harap lengkapi nomor BA dan nama kegiatan sertifikasi!");
      return;
    }

    const newId = `LAP-PEL-${String(data.length + 1).padStart(2, "0")}`;
    const newItem: LaporanPelatihanItem = {
      id: newId,
      nomorLaporan: formData.nomorLaporan,
      namaKegiatan: formData.namaKegiatan,
      tanggalSelesai: formData.tanggalSelesai,
      jumlahLulusan: Number(formData.jumlahLulusan) || 0,
      lembagaSertifikasi: formData.lembagaSertifikasi,
      dokumenBa: formData.dokumenBa,
      status: "Menunggu Verifikasi"
    };

    setData([newItem, ...data]);
    setIsCreateOpen(false);
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
      width: "180px",
      render: (row) => (
        <button
          type="button"
          onClick={() => alert(`Mengunduh berkas ${row.dokumenBa}...`)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            background: "none",
            border: "none",
            color: "#2563EB",
            fontSize: "11px",
            fontWeight: 700,
            cursor: "pointer",
            padding: 0
          }}
        >
          <FileText style={{ width: "12px", height: "12px" }} />
          <span>{row.dokumenBa}</span>
        </button>
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

      {/* DataTableView */}
      <DataTableView<LaporanPelatihanItem>
        title={`Daftar Laporan Berita Acara Uji Sertifikasi (${data.length} BA)`}
        subtitle="Rekapitulasi penetapan hasil uji kompetensi tenaga kerja konstruksi"
        data={data}
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

      {/* Reusable Batch Import Modal */}
      <BatchImportModal<LaporanPelatihanItem>
        isOpen={isBatchImportOpen}
        onClose={() => setIsBatchImportOpen(false)}
        title="Import Batch Laporan Berita Acara Sertifikasi (Excel/CSV)"
        subtitle="Unggah berkas rekapitulasi penetapan hasil uji kompetensi TKK dari LSP/BNSP"
        templateFileName="template_laporan_ba_sertifikasi_tkk.csv"
        expectedColumns={tkkBatchColumns}
        sampleRows={sampleBatchTkk}
        onCommit={handleBatchCommit}
      />
    </div>
  );
}

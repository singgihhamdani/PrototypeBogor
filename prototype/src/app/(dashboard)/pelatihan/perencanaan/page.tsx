"use client";
import React, { useState } from "react";
import ModuleHeader from "@/components/layout/module-header";
import { 
  GraduationCap, Plus, Download, FileText, CheckCircle2, 
  Calendar, Users, Search, Wallet, ShieldCheck, Trash2, Eye 
} from "lucide-react";
import DataTableView, { ColumnDef } from "@/components/common/data-table-view";
import ModalForm from "@/components/common/modal-form";
import FileUploader from "@/components/common/file-uploader";
import VerificationDialog from "@/components/common/verification-dialog";
import StatusBadge from "@/components/common/status-badge";

interface PerencanaanPelatihanItem {
  id: string;
  namaPaket: string;
  tahun: string;
  targetPeserta: number;
  anggaran: number;
  jadwal: string;
  dokumenKak: string;
  status: "Terverifikasi" | "Menunggu Verifikasi" | "Ditolak";
}

const initialPelatihan: PerencanaanPelatihanItem[] = [
  {
    id: "PP-2026-01",
    namaPaket: "Pelatihan & Fasilitasi Uji Sertifikasi SKK Tenaga Kerja Konstruksi Terampil",
    tahun: "2026",
    targetPeserta: 250,
    anggaran: 380000000,
    jadwal: "Maret - Juli 2026",
    dokumenKak: "KAK_Fasilitasi_Sertifikasi_TKK_2026.pdf",
    status: "Terverifikasi"
  },
  {
    id: "PP-2026-02",
    namaPaket: "Bimbingan Teknis Standar Keamanan, Keselamatan, Kesehatan dan Keberlanjutan (K4 SMKK)",
    tahun: "2026",
    targetPeserta: 120,
    anggaran: 175000000,
    jadwal: "April - Agustus 2026",
    dokumenKak: "KAK_Bimtek_SMKK_2026.pdf",
    status: "Terverifikasi"
  },
  {
    id: "PP-2026-03",
    namaPaket: "Mobile Training Unit (MTU) Pelatihan Vokasi Pekerja Lapangan Wilayah Bogor Barat",
    tahun: "2026",
    targetPeserta: 100,
    anggaran: 150000000,
    jadwal: "Juni - September 2026",
    dokumenKak: "KAK_MTU_Bogor_Barat.pdf",
    status: "Menunggu Verifikasi"
  }
];

export default function PerencanaanPelatihanPage() {
  const [data, setData] = useState<PerencanaanPelatihanItem[]>(initialPelatihan);
  
  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
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

  const totalPeserta = data.reduce((acc, curr) => acc + curr.targetPeserta, 0);
  const totalAnggaran = data.reduce((acc, curr) => acc + curr.anggaran, 0);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaPaket) {
      alert("Harap lengkapi nama paket pelatihan!");
      return;
    }

    const newId = `PP-2026-${String(data.length + 1).padStart(2, "0")}`;
    const newItem: PerencanaanPelatihanItem = {
      id: newId,
      namaPaket: formData.namaPaket,
      tahun: formData.tahun,
      targetPeserta: Number(formData.targetPeserta) || 10,
      anggaran: Number(formData.anggaran) || 0,
      jadwal: formData.jadwal,
      dokumenKak: formData.dokumenKak,
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
        <button
          type="button"
          onClick={() => alert(`Mengunduh berkas ${row.dokumenKak}...`)}
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
          <span>{row.dokumenKak}</span>
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

      {/* DataTableView */}
      <DataTableView<PerencanaanPelatihanItem>
        title={`Rencana Kerja Program Pelatihan (${data.length} Paket)`}
        subtitle="Dokumentasi KAK dan alokasi anggaran pelatihan tenaga kerja konstruksi"
        data={data}
        columns={columns}
        exportFileName="Perencanaan_Pelatihan_Bogor"
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
    </div>
  );
}

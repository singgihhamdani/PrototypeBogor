"use client";
import React, { useState } from "react";
import ModuleHeader from "@/components/layout/module-header";
import { 
  StatusBadge, FileUploader, FilterBar, FilterBarValues,
  DataTableView, ModalForm, VerificationDialog, ColumnDef 
} from "@/components/common";
import { 
  Boxes, ShieldCheck, FileText, CheckCircle2, 
  UploadCloud, Filter, Plus, Database, Sparkles 
} from "lucide-react";

interface SampleUser {
  id: string;
  nama: string;
  peran: string;
  instansi: string;
  status: string;
  tanggal: string;
  nilai: number;
}

const sampleUsers: SampleUser[] = [
  { id: "USR-001", nama: "Ir. Hendra Setiawan, S.T.", peran: "Asesor Utama", instansi: "Dinas PUPR Kab. Bogor", status: "Terverifikasi", tanggal: "2026-03-12", nilai: 95 },
  { id: "USR-002", nama: "Bambang Kurniawan, S.T.", peran: "Pengawas Lapangan", instansi: "Bidang Bina Konstruksi", status: "Terverifikasi", tanggal: "2026-03-15", nilai: 88 },
  { id: "USR-003", nama: "Dedi Supriyadi, S.T.", peran: "Tim Evaluasi K3", instansi: "Satgas SMKK", status: "Menunggu Verifikasi", tanggal: "2026-03-20", nilai: 74 },
  { id: "USR-004", nama: "CV. Baraya Cipta Mandiri", peran: "Badan Usaha (BUJK)", instansi: "Swasta Kualifikasi Kecil", status: "Ditolak", tanggal: "2026-03-22", nilai: 55 },
  { id: "USR-005", nama: "Dr. Ir. Wahyudi, M.Sc.", peran: "Ahli Laik Fungsi", instansi: "Tim Teknis SLF", status: "Terverifikasi", tanggal: "2026-03-25", nilai: 92 },
  { id: "USR-006", nama: "Ahmad Fauzi", peran: "Pelaksana Jalan", instansi: "PT. Pakuan Graha", status: "Selesai", tanggal: "2026-03-28", nilai: 84 },
  { id: "USR-007", nama: "Rian Hidayat", peran: "Juru Ukur", instansi: "CV. Karya Mandiri", status: "Berjalan", tanggal: "2026-04-01", nilai: 79 },
  { id: "USR-008", nama: "Siti Rahmawati, A.Md.", peran: "Petugas K3", instansi: "Dinas Kesehatan", status: "Terjadwal", tanggal: "2026-04-05", nilai: 82 }
];

export default function ReusableComponentsShowcasePage() {
  // FilterBar State
  const [filterValues, setFilterValues] = useState<FilterBarValues>({
    search: "",
    province: "Jawa Barat",
    city: "Kabupaten Bogor",
    year: "2026",
    status: ""
  });

  // ModalForm State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Formulir Contoh Sprint 2");
  const [isModalSubmitting, setIsModalSubmitting] = useState(false);

  // VerificationDialog State
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState({
    id: "SK-BUPATI-001/2026",
    title: "Penetapan Tim Pengawas Teknis Tertib Usaha Wilayah I",
    notes: "Memeriksa kelengkapan SK Asesor & alokasi 6 personil pengawasan."
  });

  // FileUploader State
  const [lastUploadedFile, setLastUploadedFile] = useState<string>("Belum ada berkas diunggah");

  const filteredUsers = sampleUsers.filter((u) => {
    const matchSearch = u.nama.toLowerCase().includes(filterValues.search.toLowerCase()) ||
                        u.peran.toLowerCase().includes(filterValues.search.toLowerCase());
    const matchStatus = !filterValues.status || u.status === filterValues.status;
    return matchSearch && matchStatus;
  });

  const columns: ColumnDef<SampleUser>[] = [
    { key: "id", label: "ID PENGGUNA", width: "110px", sortable: true },
    {
      key: "nama",
      label: "NAMA & INSTANSI",
      sortable: true,
      render: (row) => (
        <div>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C" }}>{row.nama}</span>
          <p style={{ fontSize: "11px", color: "#64748B", margin: "2px 0 0 0" }}>{row.instansi}</p>
        </div>
      )
    },
    { key: "peran", label: "PERAN / JABATAN", sortable: true },
    {
      key: "nilai",
      label: "SKOR NILAI",
      align: "center",
      sortable: true,
      render: (row) => (
        <span style={{ fontWeight: 900, color: row.nilai >= 80 ? "#166534" : "#92400E" }}>
          {row.nilai}%
        </span>
      )
    },
    {
      key: "status",
      label: "STATUS",
      align: "center",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} size="sm" />
    }
  ];

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalSubmitting(true);
    setTimeout(() => {
      setIsModalSubmitting(false);
      setIsModalOpen(false);
      alert("Formulir berhasil disimpan via ModalForm!");
    }, 600);
  };

  const handleConfirmVerify = (decision: "sesuai" | "tidak_sesuai", notes: string) => {
    setIsVerifyOpen(false);
    alert(`Hasil verifikasi "${verifyTarget.title}": ${decision === "sesuai" ? "TERVERIFIKASI (Sesuai)" : "DITOLAK"} - Catatan: ${notes || "Tidak ada catatan."}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <ModuleHeader
        breadcrumbs={[
          { label: "Pengawasan", href: "/pengawasan" },
          { label: "Komponen Reusable Sprint 2" }
        ]}
        badgeText="Sprint 2: Reusable UI System"
        badgeBg="#0F2E5C"
        badgeColor="#FFC000"
        title="Galeri Komponen Reusable (Sprint 2)"
        description="Pusat katalog & uji coba interaktif komponen reusable: DataTableView, ModalForm, FilterBar Cascading Wilayah, FileUploader Drag & Drop, StatusBadge, dan VerificationDialog."
        actionButtons={[
          {
            label: "Buka ModalForm Demo",
            icon: Plus,
            variant: "primary",
            onClick: () => setIsModalOpen(true)
          },
          {
            label: "Uji VerificationDialog",
            icon: ShieldCheck,
            variant: "outline",
            onClick: () => setIsVerifyOpen(true)
          }
        ]}
      />

      {/* SECTION 1: StatusBadge Component Variants */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "18px", padding: "20px", border: "1px solid #E2E8F0" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F2E5C", margin: "0 0 4px 0" }}>
          1. Komponen StatusBadge
        </h3>
        <p style={{ fontSize: "12px", color: "#64748B", margin: "0 0 14px 0" }}>
          Badge otomatis mengenali ragam status verifikasi, operasional, kelaikan, dan prioritas.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
          <StatusBadge status="Terverifikasi" size="md" />
          <StatusBadge status="Menunggu Verifikasi" size="md" />
          <StatusBadge status="Ditolak" size="md" />
          <StatusBadge status="Tertib" size="md" />
          <StatusBadge status="Cukup Tertib" size="md" />
          <StatusBadge status="Kurang Tertib" size="md" />
          <StatusBadge status="Selesai" size="md" />
          <StatusBadge status="Berjalan" size="md" />
          <StatusBadge status="Terjadwal" size="md" />
          <StatusBadge status="Prioritas Tinggi" size="md" />
          <StatusBadge status="Prioritas Sedang" size="md" />
          <StatusBadge status="Prioritas Rendah" size="md" />
          <StatusBadge status="Aktif" size="sm" showDot />
        </div>
      </div>

      {/* SECTION 2: FilterBar Component (Cascading Province -> City) */}
      <div>
        <div style={{ marginBottom: "8px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F2E5C", margin: 0 }}>
            2. Komponen FilterBar (Cascading Dropdown Wilayah)
          </h3>
          <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
            Pilih Provinsi untuk melihat perubahan otomatis pilihan Kabupaten/Kota secara cascading.
          </p>
        </div>

        <FilterBar
          values={filterValues}
          onChange={setFilterValues}
          searchPlaceholder="Cari nama atau jabatan pengguna..."
        />

        <div style={{ fontSize: "11px", color: "#64748B", marginTop: "6px" }}>
          Nilai Filter Aktif: Provinsi: <b>{filterValues.province || "Semua"}</b> | Kab/Kota: <b>{filterValues.city || "Semua"}</b> | Tahun: <b>{filterValues.year || "Semua"}</b>
        </div>
      </div>

      {/* SECTION 3: DataTableView Component */}
      <div>
        <div style={{ marginBottom: "8px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F2E5C", margin: 0 }}>
            3. Komponen DataTableView (Generic Sorting & Pagination)
          </h3>
          <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
            Mendukung sorting kolom ASC/DESC, paginasi dinamis, ekspor multi-format (Excel/PDF), dan tombol aksi kustom.
          </p>
        </div>

        <DataTableView<SampleUser>
          title="Daftar Pengguna Uji Coba"
          subtitle="Tabel terintegrasi dengan filter pencarian di atas"
          data={filteredUsers}
          columns={columns}
          defaultPageSize={5}
          exportFileName="daftar_pengguna_sprint2"
          actionsHeader="AKSI"
          actionsRender={(row) => {
            const item = row;
            return (
              <div style={{ display: "inline-flex", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setVerifyTarget({
                      id: item.id,
                      title: item.nama,
                      notes: `Peran: ${item.peran} • Skor: ${item.nilai}%`
                    });
                    setIsVerifyOpen(true);
                  }}
                  style={{
                    backgroundColor: "#0F2E5C",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "6px",
                    padding: "4px 10px",
                    fontSize: "10px",
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  Verifikasi
                </button>
              </div>
            );
          }}
        />
      </div>

      {/* SECTION 4: FileUploader Drag & Drop Demo */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "18px", padding: "20px", border: "1px solid #E2E8F0" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F2E5C", margin: "0 0 4px 0" }}>
          4. Komponen FileUploader (Drag & Drop + Validasi Ukuran/Ekstensi)
        </h3>
        <p style={{ fontSize: "12px", color: "#64748B", margin: "0 0 16px 0" }}>
          Mendukung drag-and-drop file langsung dari file explorer, validasi format, dan penampil ukuran manusiawi.
        </p>

        <div style={{ maxWidth: "540px" }}>
          <FileUploader
            label="Unggah Berkas Laporan Uji Coba (PDF, Maks 2MB)"
            accept=".pdf"
            maxSizeMb={2}
            hint="Tarik berkas PDF ke dalam kotak ini untuk menguji drop area"
            onFileSelect={(file) => setLastUploadedFile(file ? `${file.name} (${(file.size / 1024).toFixed(1)} KB)` : "Dihapus")}
          />
          <div style={{ marginTop: "10px", fontSize: "11px", color: "#64748B" }}>
            Status Berkas: <b>{lastUploadedFile}</b>
          </div>
        </div>
      </div>

      {/* ModalForm Demo */}
      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        subtitle="Contoh dialog modal yang membungkus form input standar SIPJAKI"
        icon={Boxes}
        onSubmit={handleModalSubmit}
        isLoading={isModalSubmitting}
        size="md"
      >
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
            Nama Dokumen Pengawasan <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Dokumen Rencana Kerja Pengawasan 2026"
            style={{ width: "100%", height: "38px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "12px" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
            Kategori Modul
          </label>
          <select style={{ width: "100%", height: "38px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 10px", fontSize: "12px" }}>
            <option>Tertib Usaha Jasa Konstruksi</option>
            <option>Tertib Penyelenggaraan Konstruksi</option>
            <option>Tertib Pemanfaatan Jasa Konstruksi</option>
          </select>
        </div>

        <FileUploader
          label="Lampiran Bukti Fisik (PDF)"
          accept=".pdf"
          maxSizeMb={2}
        />
      </ModalForm>

      {/* VerificationDialog Demo */}
      <VerificationDialog
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        target={verifyTarget}
        onConfirm={handleConfirmVerify}
      />
    </div>
  );
}

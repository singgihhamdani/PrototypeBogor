"use client";
import React, { useState, useMemo, useEffect } from "react";
import ModuleHeader from "@/components/layout/module-header";
import { TertibType, TERTIB_CONFIGS } from "@/lib/tertib-config";
import { mockPelaksanaanRecords, PelaksanaanRecord } from "@/data/tertib-mock-data";
import { 
  ClipboardCheck, Plus, Download, FileText, CheckCircle2, 
  Search, ShieldCheck, Filter, ArrowUpRight, Award, 
  AlertCircle, XCircle, Printer, Eye, Trash2, Calendar, 
  MapPin, Building2, HardHat, FileSpreadsheet, Sparkles, 
  Check, X, RefreshCw, Database as DbIcon, Loader2, Edit, Phone, User
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
import { exportToSpreadsheet } from "@/lib/export-utils";
import { TEMPLATE_PELAKSANAAN, TEMPLATE_PELAKSANAAN_SIMAK2, TEMPLATE_PELAKSANAAN_SIMAK3 } from "@/lib/sipjaki-templates";
import { logDataActivity } from "@/lib/audit-log";
import { fetchPaketList, PaketItem } from "@/lib/services/master-data";
import { 
  fetchPelaksanaanList, createPelaksanaanAudit, 
  updatePelaksanaan, deletePelaksanaan,
  updateAuditVerification, batchInsertPelaksanaan, 
  DataSourceStatus, PengawasanSesiInsert 
} from "@/lib/services/pengawasan-service";

interface PelaksanaanViewProps {
  tertibType: TertibType;
}

export default function PelaksanaanView({ tertibType }: PelaksanaanViewProps) {
  const config = TERTIB_CONFIGS[tertibType];
  const isSimak2 = tertibType === "tertib-penyelenggaraan";
  const isSimak3 = tertibType === "tertib-pemanfaatan";
  
  // State data utama
  const [data, setData] = useState<PelaksanaanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState<DataSourceStatus>({
    source: "fallback",
    message: "Menghubungkan ke basis data..."
  });
  
  // Master Data Paket Pekerjaan untuk Auto-Populate Form SIMAK 2
  const [masterPaketList, setMasterPaketList] = useState<PaketItem[]>([]);
  useEffect(() => {
    if (isSimak2) {
      fetchPaketList()
        .then((res) => {
          if (res && res.data) setMasterPaketList(res.data);
        })
        .catch((err) => console.error("Gagal load master paket:", err));
    }
  }, [isSimak2]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchPelaksanaanList(tertibType);
      setData(res.data);
      setDataStatus(res.status);
    } catch (err) {
      console.error("Gagal load data pengawasan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tertibType]);
  
  // Filter States
  const [activeVariant, setActiveVariant] = useState<string>("Semua");
  const [filterStatusVerifikasi, setFilterStatusVerifikasi] = useState<string>("Semua");
  const [filterKepatuhan, setFilterKepatuhan] = useState<string>("Semua");
  const [filterTahun, setFilterTahun] = useState<string>("2026");
  const [filterDocPending, setFilterDocPending] = useState(false);
  const [sortBy, setSortBy] = useState<"terkini" | "kepatuhan" | "nama" | "terlama">("terkini");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDocPreviewModalOpen, setIsDocPreviewModalOpen] = useState(false);
  const [isBatchImportOpen, setIsBatchImportOpen] = useState(false);
  const [selectedRecordForDoc, setSelectedRecordForDoc] = useState<PelaksanaanRecord | null>(null);
  const [docUploadTarget, setDocUploadTarget] = useState<PelaksanaanRecord | null>(null);

  // Edit Modal State (Standar SIPJAKI: Fitur Aksi Edit)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PelaksanaanRecord | null>(null);
  const [editSimakCode, setEditSimakCode] = useState("");
  const [editNamaObjek, setEditNamaObjek] = useState("");
  const [editNamaProdusen, setEditNamaProdusen] = useState("");
  const [editNamaPemilik, setEditNamaPemilik] = useState("");
  const [editNoKontak, setEditNoKontak] = useState("");
  const [editKualifikasi, setEditKualifikasi] = useState<"Kecil" | "Menengah" | "Besar" | "Spesialis">("Kecil");
  const [editTanggal, setEditTanggal] = useState("");
  const [editLokasi, setEditLokasi] = useState("");
  const [editKepemilikanIzin, setEditKepemilikanIzin] = useState<"Memiliki" | "Tidak Memiliki">("Memiliki");
  const [editKeabsahanIzin, setEditKeabsahanIzin] = useState<"Sah" | "Tidak Sah" | "Aktif">("Sah");
  const [editKapasitas, setEditKapasitas] = useState("");
  const [editIzinBb, setEditIzinBb] = useState<"Ada" | "Tidak Ada">("Ada");
  const [editKeabsahanBb, setEditKeabsahanBb] = useState<"Sah" | "Tidak Sah">("Sah");
  const [editStatusKepatuhan, setEditStatusKepatuhan] = useState<"Patuh" | "Tidak Patuh">("Patuh");
  const [editStatusVerifikasi, setEditStatusVerifikasi] = useState<"Draft" | "Terverifikasi" | "Ditolak">("Draft");
  const [editDokumen, setEditDokumen] = useState("");
  const [editPengawas, setEditPengawas] = useState("");
  const [editCatatan, setEditCatatan] = useState("");
  const [editRekomendasi, setEditRekomendasi] = useState("");

  // Edit Modal State Khusus SIMAK 2 (Tertib Penyelenggaraan: 11 Parameter SIPJAKI)
  const [editNamaProyek, setEditNamaProyek] = useState("");
  const [editNilaiProyek, setEditNilaiProyek] = useState<number>(0);
  const [editNomorPerjanjian, setEditNomorPerjanjian] = useState("");
  const [editWaktuPelaksanaan, setEditWaktuPelaksanaan] = useState("");
  const [editPenyediaJasa, setEditPenyediaJasa] = useState("");
  const [editNamaPemilikPekerjaan, setEditNamaPemilikPekerjaan] = useState("");
  const [editWaktuPengawasan, setEditWaktuPengawasan] = useState("");
  const [editPropinsi, setEditPropinsi] = useState("Jawa Barat");
  const [editKabKota, setEditKabKota] = useState("Kabupaten Bogor");

  // Edit Modal State Khusus SIMAK 3 (Tertib Pemanfaatan: 10 Parameter SIPJAKI)
  const [editNamaBangunan, setEditNamaBangunan] = useState("");
  const [editNamaPengelola, setEditNamaPengelola] = useState("");
  const [editFungsiBangunan, setEditFungsiBangunan] = useState("Fasilitas Pelayanan Kesehatan");
  const [editStatusSlf, setEditStatusSlf] = useState("Memiliki SLF (Aktif)");

  // Delete Dialog State (Standar SIPJAKI: Fitur Aksi Hapus)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<PelaksanaanRecord | null>(null);

  // Verification Dialog States
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState<PelaksanaanRecord | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Form State untuk Tambah Pengawasan Baru (Standar SIPJAKI SIMAK 1 & SIMAK 2)
  const [addForm, setAddForm] = useState({
    simakCode: config.simakVariants[0]?.code || "SIMAK 1a1",
    namaObjek: "",
    namaProdusen: "",
    namaPemilik: "",
    noKontak: "",
    kualifikasi: "Kecil" as "Kecil" | "Menengah" | "Besar" | "Spesialis",
    lokasi: "Kecamatan Cibinong",
    tanggal: new Date().toISOString().split("T")[0],
    pengawas: "Ir. Hendra Setiawan, S.T. (Tim Pembina Jakon)",
    kepemilikanIzin: "Memiliki" as "Memiliki" | "Tidak Memiliki",
    keabsahanIzin: "Sah" as "Sah" | "Tidak Sah" | "Aktif",
    kapasitas: "Kemampuan Operasional Lapangan",
    izinBb: "Ada" as "Ada" | "Tidak Ada",
    keabsahanBb: "Sah" as "Sah" | "Tidak Sah",
    statusKepatuhan: "Patuh" as "Patuh" | "Tidak Patuh",
    catatanTemuan: "",
    rekomendasi: "",
    dokumenFile: null as File | null,
    // Field Tambahan Standar SIMAK 2 (Tertib Penyelenggaraan Paket Proyek Fisik)
    namaProyek: "",
    nilaiProyek: 0,
    nomorPerjanjian: "",
    waktuPelaksanaan: "",
    penyediaJasa: "",
    namaPemilikPekerjaan: "Dinas PUPR Kab. Bogor",
    waktuPengawasan: new Date().toISOString().split("T")[0],
    propinsi: "Jawa Barat",
    kabKota: "Kabupaten Bogor",
    // Field Tambahan Standar SIMAK 3 (Tertib Pemanfaatan Bangunan Purna-Konstruksi)
    namaBangunan: "",
    namaPengelola: "Dinas Kesehatan / RSUD",
    fungsiBangunan: "Fasilitas Pelayanan Kesehatan",
    statusSlf: "Memiliki SLF (Aktif)"
  });

  // Default Urutan Terkini: Urutan dimulai dari paling terbaru/update di atas sampai terlama
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      if (sortBy === "terkini") {
        const dateA = a.waktuPengawasan || a.tanggal || a.tanggalAudit || "";
        const dateB = b.waktuPengawasan || b.tanggal || b.tanggalAudit || "";
        return dateB.localeCompare(dateA); // Descending (terbaru di atas)
      } else if (sortBy === "terlama") {
        const dateA = a.waktuPengawasan || a.tanggal || a.tanggalAudit || "";
        const dateB = b.waktuPengawasan || b.tanggal || b.tanggalAudit || "";
        return dateA.localeCompare(dateB);
      } else if (sortBy === "kepatuhan") {
        return a.statusKepatuhan.localeCompare(b.statusKepatuhan);
      } else if (sortBy === "nama") {
        const nameA = a.namaProyek || a.namaObjek || "";
        const nameB = b.namaProyek || b.namaObjek || "";
        return nameA.localeCompare(nameB);
      }
      return 0;
    });
  }, [data, sortBy]);

  // Filtered Records
  const filteredData = sortedData.filter((item) => {
    const matchVariant = activeVariant === "Semua" || item.simakCode === activeVariant;
    const matchVerif = filterStatusVerifikasi === "Semua" || 
      (filterStatusVerifikasi === "pending" && item.statusVerifikasi === "Draft") ||
      (filterStatusVerifikasi === "verified" && item.statusVerifikasi === "Terverifikasi") ||
      (filterStatusVerifikasi === "rejected" && item.statusVerifikasi === "Ditolak");
    const matchKepatuhan = filterKepatuhan === "Semua" || item.statusKepatuhan === filterKepatuhan;
    const matchDoc = !filterDocPending || item._docStatus === "pending" || (!item.dokumen && !item.dokumenBAP);
    return matchVariant && matchVerif && matchKepatuhan && matchDoc;
  });

  // Calculate Stats (Tanpa kata audit & skor tertib)
  const statTotal = data.length;
  const statPatuh = data.filter((r) => r.statusKepatuhan === "Patuh").length;
  const statTidakPatuh = data.filter((r) => r.statusKepatuhan === "Tidak Patuh").length;
  const statPending = data.filter((r) => r.statusVerifikasi === "Draft").length;

  // Helper Auto-Fill dari Master Paket Pekerjaan untuk SIMAK 2
  const handleSelectPaketAutoFill = (paketId: string) => {
    const found = masterPaketList.find((p) => p.id === paketId);
    if (found) {
      setAddForm((prev) => ({
        ...prev,
        namaProyek: found.nama_paket,
        nilaiProyek: Number(found.nilai_kontrak) || 0,
        nomorPerjanjian: (found as any).nomor_kontrak || `602.1/0${found.id.replace(/\D/g, '') || '45'}/SPK/DPUPR/2026`,
        waktuPelaksanaan: found.tanggal_mulai && found.tanggal_selesai
          ? `${found.tanggal_mulai} s/d ${found.tanggal_selesai}`
          : "180 Hari Kalender",
        penyediaJasa: found.nama_penyedia || "PT. Kontraktor Pelaksana",
        namaPemilikPekerjaan: found.nama_instansi || "Dinas PUPR Kab. Bogor",
        lokasi: found.kecamatan || "Kabupaten Bogor"
      }));
    }
  };

  // Handler Buka Modal Edit
  const handleOpenEdit = (row: PelaksanaanRecord) => {
    setEditingRecord(row);
    setEditSimakCode(row.simakCode);
    setEditNamaObjek(row.namaObjek);
    setEditNamaProdusen(row.namaProdusen || row.badanUsaha);
    setEditNamaPemilik(row.namaPemilik || "");
    setEditNoKontak(row.noKontak || "");
    setEditKualifikasi(row.kualifikasi || "Kecil");
    setEditTanggal(row.tanggal || row.tanggalAudit || new Date().toISOString().split("T")[0]);
    setEditLokasi(row.lokasi);
    setEditKepemilikanIzin(row.kepemilikanIzin || "Memiliki");
    setEditKeabsahanIzin(row.keabsahanIzin || "Sah");
    setEditKapasitas(row.kapasitas || "");
    setEditIzinBb(row.izinBb || "Ada");
    setEditKeabsahanBb(row.keabsahanBb || "Sah");
    setEditStatusKepatuhan(row.statusKepatuhan);
    setEditStatusVerifikasi(row.statusVerifikasi);
    setEditDokumen(row.dokumen || row.dokumenBAP || "");
    setEditPengawas(row.pengawas);
    setEditCatatan(row.catatanTemuan || "");
    setEditRekomendasi(row.rekomendasi || "");

    // Nilai SIMAK 2 (Tertib Penyelenggaraan: 11 Parameter SIPJAKI)
    setEditNamaProyek(row.namaProyek || row.namaObjek || "");
    setEditNilaiProyek(row.nilaiProyek || 0);
    setEditNomorPerjanjian(row.nomorPerjanjian || "");
    setEditWaktuPelaksanaan(row.waktuPelaksanaan || "");
    setEditPenyediaJasa(row.penyediaJasa || row.namaProdusen || row.badanUsaha || "");
    setEditNamaPemilikPekerjaan(row.namaPemilikPekerjaan || "Dinas PUPR Kab. Bogor");
    setEditWaktuPengawasan(row.waktuPengawasan || row.tanggal || row.tanggalAudit || new Date().toISOString().split("T")[0]);
    setEditPropinsi(row.propinsi || "Jawa Barat");
    setEditKabKota(row.kabKota || "Kabupaten Bogor");

    // Nilai SIMAK 3 (Tertib Pemanfaatan: 10 Parameter SIPJAKI)
    setEditNamaBangunan(row.namaBangunan || row.namaObjek || "");
    setEditNamaPengelola(row.namaPengelola || "Dinas Kesehatan / RSUD");
    setEditFungsiBangunan(row.fungsiBangunan || "Fasilitas Pelayanan Kesehatan");
    setEditStatusSlf(row.statusSlf || "Memiliki SLF (Aktif)");

    setShowEditModal(true);
  };

  // Handler Simpan Perubahan Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    if (isSimak2) {
      if (!editNamaProyek || !editPenyediaJasa) {
        alert("Harap lengkapi nama proyek dan penyedia jasa!");
        return;
      }
    } else if (isSimak3) {
      if (!editNamaBangunan || !editNamaPemilik) {
        alert("Harap lengkapi nama bangunan dan nama pemilik aset!");
        return;
      }
    } else {
      if (!editNamaObjek || !editNamaProdusen) {
        alert("Harap lengkapi nama objek pengawasan dan nama produsen / badan usaha!");
        return;
      }
    }

    const updatedRow: PelaksanaanRecord = {
      ...editingRecord,
      simakCode: editSimakCode,
      namaObjek: isSimak2 ? editNamaProyek : isSimak3 ? editNamaBangunan : editNamaObjek,
      namaProdusen: isSimak2 ? editPenyediaJasa : isSimak3 ? editNamaPemilik : editNamaProdusen,
      badanUsaha: isSimak2 ? editPenyediaJasa : isSimak3 ? editNamaPemilik : editNamaProdusen,
      namaPemilik: editNamaPemilik,
      noKontak: editNoKontak,
      kualifikasi: editKualifikasi,
      tanggal: (isSimak2 || isSimak3) ? editWaktuPengawasan : editTanggal,
      tanggalAudit: (isSimak2 || isSimak3) ? editWaktuPengawasan : editTanggal,
      lokasi: editLokasi,
      kepemilikanIzin: editKepemilikanIzin,
      keabsahanIzin: editKeabsahanIzin,
      kapasitas: editKapasitas,
      izinBb: editIzinBb,
      keabsahanBb: editKeabsahanBb,
      statusKepatuhan: editStatusKepatuhan,
      statusVerifikasi: editStatusVerifikasi,
      dokumen: editDokumen,
      dokumenBAP: editDokumen,
      pengawas: editPengawas,
      catatanTemuan: editCatatan,
      rekomendasi: editRekomendasi,
      // Field SIMAK 2
      namaProyek: editNamaProyek,
      nilaiProyek: editNilaiProyek,
      nomorPerjanjian: editNomorPerjanjian,
      waktuPelaksanaan: editWaktuPelaksanaan,
      penyediaJasa: editPenyediaJasa,
      namaPemilikPekerjaan: editNamaPemilikPekerjaan,
      waktuPengawasan: editWaktuPengawasan,
      propinsi: editPropinsi,
      kabKota: editKabKota,
      // Field SIMAK 3
      namaBangunan: editNamaBangunan,
      namaPengelola: editNamaPengelola,
      fungsiBangunan: editFungsiBangunan,
      statusSlf: editStatusSlf,
      updatedAt: new Date().toISOString()
    };

    // Update ke Supabase
    await updatePelaksanaan(editingRecord.id, updatedRow);

    // Update state lokal
    setData((prev) => prev.map((item) => (item.id === editingRecord.id ? updatedRow : item)));

    logDataActivity({
      action: "update",
      module: `Pengawasan Lapangan SIMAK (${config.shortTitle})`,
      format: "db",
      recordCount: 1,
      user: "Petugas Pembina Jakon",
      status: "success",
      details: isSimak2
        ? `Memperbarui data pengawasan SIMAK 2 "${editNamaProyek}" - Kontraktor: ${editPenyediaJasa} (Status: ${editStatusKepatuhan})`
        : isSimak3
        ? `Memperbarui data pengawasan SIMAK 3 "${editNamaBangunan}" - Pemilik: ${editNamaPemilik} (Status: ${editStatusKepatuhan})`
        : `Memperbarui data pengawasan "${editNamaObjek}" - Produsen: ${editNamaProdusen} (Status: ${editStatusKepatuhan})`
    });

    setShowEditModal(false);
    setEditingRecord(null);
    alert(`Data pengawasan untuk "${isSimak2 ? editNamaProyek : isSimak3 ? editNamaBangunan : editNamaProdusen}" berhasil diperbarui!`);
  };

  // Handler Hapus Data
  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;

    await deletePelaksanaan(deletingRecord.id);
    setData((prev) => prev.filter((r) => r.id !== deletingRecord.id));

    logDataActivity({
      action: "delete",
      module: `Pengawasan Lapangan SIMAK (${config.shortTitle})`,
      format: "db",
      recordCount: 1,
      user: "Petugas Pembina Jakon",
      status: "success",
      details: isSimak2
        ? `Menghapus data pengawasan SIMAK 2 "${deletingRecord.namaProyek || deletingRecord.namaObjek}" - Penyedia: ${deletingRecord.penyediaJasa || deletingRecord.namaProdusen || deletingRecord.badanUsaha}`
        : `Menghapus data pengawasan "${deletingRecord.namaObjek}" - Produsen: ${deletingRecord.namaProdusen || deletingRecord.badanUsaha}`
    });

    setShowDeleteDialog(false);
    setDeletingRecord(null);
    alert("Data pengawasan berhasil dihapus dari sistem.");
  };

  // Handle Form Submission Tambah Pengawasan Baru
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSimak2) {
      if (!addForm.namaProyek || !addForm.penyediaJasa) {
        alert("Harap lengkapi nama proyek dan penyedia jasa!");
        return;
      }
    } else if (isSimak3) {
      if (!addForm.namaBangunan || !addForm.namaPemilik) {
        alert("Harap lengkapi nama bangunan dan nama pemilik aset!");
        return;
      }
    } else {
      if (!addForm.namaObjek || !addForm.namaProdusen) {
        alert("Harap lengkapi nama objek pengawasan dan nama produsen / badan usaha!");
        return;
      }
    }

    const docFileName = addForm.dokumenFile 
      ? addForm.dokumenFile.name 
      : isSimak2
        ? `Dokumen_SIMAK2_${addForm.namaProyek.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20)}.pdf`
        : isSimak3
        ? `Dokumen_SIMAK3_${addForm.namaBangunan.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20)}.pdf`
        : `Dokumen_${addForm.simakCode.replace(/\s+/g, "_")}_${addForm.namaProdusen.replace(/[^a-zA-Z0-9]/g, "")}.pdf`;

    const res = await createPelaksanaanAudit({
      simakCode: addForm.simakCode,
      tertibType,
      namaObjek: isSimak2 ? addForm.namaProyek : isSimak3 ? addForm.namaBangunan : addForm.namaObjek,
      badanUsaha: isSimak2 ? addForm.penyediaJasa : isSimak3 ? addForm.namaPemilik : addForm.namaProdusen,
      namaProdusen: isSimak2 ? addForm.penyediaJasa : isSimak3 ? addForm.namaPemilik : addForm.namaProdusen,
      namaPemilik: addForm.namaPemilik,
      noKontak: addForm.noKontak,
      kualifikasi: addForm.kualifikasi,
      lokasi: addForm.lokasi,
      tanggalAudit: (isSimak2 || isSimak3) ? addForm.waktuPengawasan : addForm.tanggal,
      pengawas: addForm.pengawas,
      kepemilikanIzin: addForm.kepemilikanIzin,
      keabsahanIzin: addForm.keabsahanIzin,
      kapasitas: addForm.kapasitas,
      izinBb: addForm.izinBb,
      keabsahanBb: addForm.keabsahanBb,
      statusKepatuhan: addForm.statusKepatuhan,
      dokumen: docFileName,
      catatanTemuan: addForm.catatanTemuan,
      rekomendasi: addForm.rekomendasi,
      // Field SIMAK 2
      namaProyek: addForm.namaProyek,
      nilaiProyek: addForm.nilaiProyek,
      nomorPerjanjian: addForm.nomorPerjanjian,
      waktuPelaksanaan: addForm.waktuPelaksanaan,
      penyediaJasa: addForm.penyediaJasa,
      namaPemilikPekerjaan: addForm.namaPemilikPekerjaan,
      waktuPengawasan: addForm.waktuPengawasan,
      propinsi: addForm.propinsi,
      kabKota: addForm.kabKota,
      // Field SIMAK 3
      namaBangunan: addForm.namaBangunan,
      namaPengelola: addForm.namaPengelola,
      fungsiBangunan: addForm.fungsiBangunan,
      statusSlf: addForm.statusSlf
    });

    if (res.success && res.data) {
      setData([res.data, ...data]);
      setIsAddModalOpen(false);

      // Reset Form
      setAddForm({
        simakCode: config.simakVariants[0]?.code || "SIMAK 1a1",
        namaObjek: "",
        namaProdusen: "",
        namaPemilik: "",
        noKontak: "",
        kualifikasi: "Kecil",
        lokasi: "Kecamatan Cibinong",
        tanggal: new Date().toISOString().split("T")[0],
        pengawas: "Ir. Hendra Setiawan, S.T. (Tim Pembina Jakon)",
        kepemilikanIzin: "Memiliki",
        keabsahanIzin: "Sah",
        kapasitas: "Kemampuan Operasional Lapangan",
        izinBb: "Ada",
        keabsahanBb: "Sah",
        statusKepatuhan: "Patuh",
        catatanTemuan: "",
        rekomendasi: "",
        dokumenFile: null,
        namaProyek: "",
        nilaiProyek: 0,
        nomorPerjanjian: "",
        waktuPelaksanaan: "",
        penyediaJasa: "",
        namaPemilikPekerjaan: "Dinas PUPR Kab. Bogor",
        waktuPengawasan: new Date().toISOString().split("T")[0],
        propinsi: "Jawa Barat",
        kabKota: "Kabupaten Bogor",
        namaBangunan: "",
        namaPengelola: "Dinas Kesehatan / RSUD",
        fungsiBangunan: "Fasilitas Pelayanan Kesehatan",
        statusSlf: "Memiliki SLF (Aktif)"
      });

      logDataActivity({
        action: "create",
        module: `Pengawasan Lapangan SIMAK (${config.shortTitle})`,
        format: "db",
        recordCount: 1,
        user: "Petugas Pembina Jakon",
        status: "success",
        details: isSimak2
          ? `Menambahkan data pengawasan SIMAK 2 "${res.data.namaProyek || res.data.namaObjek}" - Penyedia: ${res.data.penyediaJasa || res.data.badanUsaha} (${res.data.statusKepatuhan})`
          : isSimak3
          ? `Menambahkan data pengawasan SIMAK 3 "${res.data.namaBangunan || res.data.namaObjek}" - Pemilik: ${res.data.namaPemilik || res.data.badanUsaha} (${res.data.statusKepatuhan})`
          : `Menambahkan data pengawasan "${res.data.namaObjek}" - Produsen: ${res.data.namaProdusen || res.data.badanUsaha} (${res.data.statusKepatuhan})`
      });

      alert(`Data pengawasan untuk ${isSimak2 ? (res.data.namaProyek || res.data.namaObjek) : isSimak3 ? (res.data.namaBangunan || res.data.namaObjek) : (res.data.namaProdusen || res.data.badanUsaha)} berhasil disimpan!`);
    } else {
      alert(res.error || "Gagal menyimpan pengawasan");
    }
  };

  // Handle Batch Commit
  const handleBatchCommit = async (parsedRows: any[]) => {
    const formatted: PelaksanaanRecord[] = parsedRows.map((row, idx) => ({
      id: `SIMAK-${Date.now().toString().slice(-4)}-${idx + 1}`,
      simakCode: row.simakCode || config.simakVariants[0]?.code || "SIMAK 1a1",
      tertibType,
      namaObjek: row.namaObjek || "Objek Pengawasan Lapangan",
      badanUsaha: row.namaProdusen || row.badanUsaha || "PT Penyedia Jasa Konstruksi",
      namaProdusen: row.namaProdusen || row.badanUsaha || "PT Penyedia Jasa Konstruksi",
      namaPemilik: row.namaPemilik || "Penanggung Jawab",
      noKontak: row.noKontak || "0812-0000-0000",
      kualifikasi: row.kualifikasi || "Kecil",
      lokasi: row.lokasi || "Kecamatan Cibinong",
      tanggal: row.tanggal || row.tanggalAudit || new Date().toISOString().split("T")[0],
      tanggalAudit: row.tanggal || row.tanggalAudit || new Date().toISOString().split("T")[0],
      pengawas: row.pengawas || "Tim Pembina Jakon Kab. Bogor",
      kepemilikanIzin: row.kepemilikanIzin || "Memiliki",
      keabsahanIzin: row.keabsahanIzin || "Sah",
      kapasitas: row.kapasitas || "Standar Operasional",
      izinBb: row.izinBb || "Ada",
      keabsahanBb: row.keabsahanBb || "Sah",
      propinsi: row.propinsi || "Jawa Barat",
      kabKota: row.kabKota || "Kabupaten Bogor",
      statusKepatuhan: row.statusKepatuhan || "Patuh",
      statusVerifikasi: "Draft",
      dokumen: row.dokumen || row.dokumenBAP || "",
      dokumenBAP: row.dokumen || row.dokumenBAP || "",
      _docStatus: row._docStatus || "pending"
    }));

    const dbPayloads: PengawasanSesiInsert[] = formatted.map((f) => ({
      id: f.id,
      simak_code: f.simakCode,
      tipe_tertib: f.tertibType,
      nama_objek: f.namaObjek,
      badan_usaha: f.badanUsaha,
      lokasi: f.lokasi,
      tanggal_audit: f.tanggal,
      pengawas: f.pengawas,
      skor_tertib: f.statusKepatuhan === "Patuh" ? 90 : 60,
      kategori_hasil: f.statusKepatuhan === "Patuh" ? "Tertib" : "Kurang Tertib",
      status_verifikasi: f.statusVerifikasi,
      dokumen_bap: f.dokumen,
      dokumen: f.dokumen,
      kualifikasi: f.kualifikasi,
      nama_produsen: f.namaProdusen,
      nama_pemilik: f.namaPemilik,
      no_kontak: f.noKontak,
      kepemilikan_izin: f.kepemilikanIzin,
      keabsahan_izin: f.keabsahanIzin,
      kapasitas: f.kapasitas,
      izin_bb: f.izinBb,
      keabsahan_bb: f.keabsahanBb,
      propinsi: f.propinsi,
      kab_kota: f.kabKota,
      status_kepatuhan: f.statusKepatuhan
    }));

    await batchInsertPelaksanaan(dbPayloads);
    await loadData();
    setIsBatchImportOpen(false);
    logDataActivity({
      action: "import",
      module: `Pelaksanaan Pengawasan SIMAK (${config.shortTitle})`,
      format: "xlsx",
      recordCount: formatted.length,
      user: "Petugas Pembina Jakon",
      status: "success",
      fileName: `${TEMPLATE_PELAKSANAAN.exportFileName}.xlsx`,
      details: `Impor batch ${formatted.length} data pengawasan SIMAK (${config.shortTitle}) tersimpan ke database`
    });
    alert(`Berhasil mengimpor ${formatted.length} data pengawasan SIMAK ke basis data!`);
  };

  const handleSaveUploadedDoc = (files: Record<string, File | null>, fileNames: Record<string, string>) => {
    if (!docUploadTarget) return;
    const newDocName = fileNames["dokumen"] || docUploadTarget.dokumen || `Dokumen_${docUploadTarget.simakCode.replace(/\s+/g, "_")}_${docUploadTarget.id}.pdf`;
    setData((prev) =>
      prev.map((item) => {
        if (item.id === docUploadTarget.id) {
          return {
            ...item,
            dokumen: newDocName,
            dokumenBAP: newDocName,
            _docStatus: "complete"
          };
        }
        return item;
      })
    );
    logDataActivity({
      action: "doc_upload",
      module: `Pelaksanaan Pengawasan SIMAK (${config.shortTitle})`,
      format: "pdf",
      recordCount: 1,
      user: "Petugas Pembina Jakon",
      status: "success",
      fileName: newDocName,
      details: `Unggah dokumen laporan pengawasan untuk: ${docUploadTarget.namaObjek} (${docUploadTarget.simakCode})`
    });
    setDocUploadTarget(null);
  };

  // Handle Verification Confirm
  const handleConfirmVerification = async (decision: "sesuai" | "tidak_sesuai", notes: string) => {
    if (!verifyTarget) return;
    setIsVerifying(true);

    const targetStatus = decision === "sesuai" ? "Terverifikasi" : "Ditolak";
    await updateAuditVerification(verifyTarget.id, targetStatus);

    setData((prev) =>
      prev.map((r) => {
        if (r.id === verifyTarget.id) {
          return {
            ...r,
            statusVerifikasi: targetStatus
          };
        }
        return r;
      })
    );

    setIsVerifying(false);
    setIsVerifyOpen(false);
    setVerifyTarget(null);
  };

  // Columns for DataTableView (Opsi 2: Harmonisasi Standar SIPJAKI 7 Kolom Utama + Visibilitas Operasional SIJAKON)
  const tableColumns: ColumnDef<PelaksanaanRecord>[] = [
    {
      key: "no",
      label: "NO",
      width: "55px",
      align: "center",
      render: (_row, index) => (
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>
          {index + 1}
        </span>
      )
    },
    {
      key: "tanggal",
      label: "TANGGAL PENGAWASAN",
      width: "165px",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Calendar style={{ width: "13px", height: "13px", color: "#2563EB", flexShrink: 0 }} />
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#0F2E5C" }}>
            {row.tanggal || row.tanggalAudit}
          </span>
        </div>
      )
    },
    {
      key: "tahun",
      label: "TAHUN",
      width: "80px",
      align: "center",
      render: () => (
        <span style={{ fontSize: "11px", fontWeight: 800, backgroundColor: "#EBF2FA", color: "#0F2E5C", padding: "3px 8px", borderRadius: "6px" }}>
          {filterTahun}
        </span>
      )
    },
    {
      key: "wilayah",
      label: "WILAYAH & OBJEK PENGAWASAN",
      render: (row) => (
        <div>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", display: "flex", alignItems: "center", gap: "5px" }}>
            <MapPin style={{ width: "12px", height: "12px", color: "#2563EB", flexShrink: 0 }} />
            <span>{row.lokasi}, Kabupaten Bogor</span>
          </div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#0F172A", marginTop: "3px", display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
            <Building2 style={{ width: "11px", height: "11px", color: "#64748B", flexShrink: 0 }} />
            <span>{row.namaProdusen || row.badanUsaha}</span>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#1E40AF", backgroundColor: "#DBEAFE", padding: "1px 6px", borderRadius: "4px" }}>
              {row.kualifikasi || "Kecil"}
            </span>
          </div>
          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "9px", fontWeight: 900, color: "#0F2E5C", backgroundColor: "#F1F5F9", padding: "1px 5px", borderRadius: "4px", fontFamily: "monospace" }}>
              {row.simakCode}
            </span>
            <span style={{ color: "#475569" }}>{row.namaObjek}</span>
          </div>
        </div>
      )
    },
    {
      key: "dokumen",
      label: "DOKUMEN",
      width: "185px",
      render: (row) => (
        <DocStatusBadge
          status={row._docStatus || (row.dokumen || row.dokumenBAP ? "complete" : "pending")}
          fileName={row.dokumen || row.dokumenBAP}
          documentLabel="Dokumen Pengawasan"
          onClick={() => setDocUploadTarget(row)}
        />
      )
    },
    {
      key: "status",
      label: "STATUS",
      width: "150px",
      align: "center",
      render: (row) => {
        const isPatuh = row.statusKepatuhan === "Patuh";
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 900,
                padding: "2px 8px",
                borderRadius: "9999px",
                backgroundColor: isPatuh ? "#DCFCE7" : "#FEE2E2",
                color: isPatuh ? "#166534" : "#991B1B",
                border: `1px solid ${isPatuh ? "#86EFAC" : "#FCA5A5"}`,
                display: "inline-flex",
                alignItems: "center",
                gap: "3px"
              }}
            >
              {isPatuh ? <Check style={{ width: "10px", height: "10px" }} /> : <X style={{ width: "10px", height: "10px" }} />}
              <span>{row.statusKepatuhan}</span>
            </span>
            <StatusBadge status={row.statusVerifikasi} />
          </div>
        );
      }
    }
  ];

  // Columns Khusus SIMAK 2 (Tertib Penyelenggaraan: 11 Kolom Standar Resmi SIPJAKI Kementerian PUPR)
  const simak2TableColumns: ColumnDef<PelaksanaanRecord>[] = [
    {
      key: "no",
      label: "NO",
      width: "50px",
      align: "center",
      render: (_row, index) => (
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>
          {index + 1}
        </span>
      )
    },
    {
      key: "namaProyek",
      label: "NAMA PROYEK",
      width: "250px",
      render: (row) => (
        <div>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", lineHeight: "1.4" }}>
            {row.namaProyek || row.namaObjek}
          </div>
          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "3px", display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "9px", fontWeight: 900, color: "#1E40AF", backgroundColor: "#DBEAFE", padding: "1px 5px", borderRadius: "4px", fontFamily: "monospace" }}>
              {row.simakCode}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
              <MapPin style={{ width: "10px", height: "10px", color: "#2563EB" }} />
              {row.lokasi}
            </span>
          </div>
        </div>
      )
    },
    {
      key: "nilaiProyek",
      label: "NILAI PROYEK",
      width: "145px",
      align: "right",
      render: (row) => {
        const val = row.nilaiProyek || 0;
        return (
          <span style={{ fontSize: "12px", fontWeight: 800, color: "#047857", fontFamily: "monospace" }}>
            {val > 0 ? `Rp ${val.toLocaleString("id-ID")}` : "-"}
          </span>
        );
      }
    },
    {
      key: "nomorPerjanjian",
      label: "NOMOR PERJANJIAN",
      width: "165px",
      render: (row) => (
        <span style={{ fontSize: "11px", fontWeight: 600, color: "#334155", wordBreak: "break-word" }}>
          {row.nomorPerjanjian || "-"}
        </span>
      )
    },
    {
      key: "waktuPelaksanaan",
      label: "WAKTU PELAKSANAAN",
      width: "150px",
      render: (row) => (
        <span style={{ fontSize: "11px", color: "#475569" }}>
          {row.waktuPelaksanaan || "-"}
        </span>
      )
    },
    {
      key: "penyediaJasa",
      label: "PENYEDIA JASA",
      width: "170px",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <Building2 style={{ width: "12px", height: "12px", color: "#2563EB", flexShrink: 0 }} />
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#0F2E5C" }}>
            {row.penyediaJasa || row.namaProdusen || row.badanUsaha}
          </span>
        </div>
      )
    },
    {
      key: "namaPemilikPekerjaan",
      label: "NAMA PEMILIK PEKERJAAN",
      width: "175px",
      render: (row) => (
        <span style={{ fontSize: "11px", fontWeight: 600, color: "#1E293B" }}>
          {row.namaPemilikPekerjaan || "Dinas PUPR Kab. Bogor"}
        </span>
      )
    },
    {
      key: "waktuPengawasan",
      label: "WAKTU PENGAWASAN",
      width: "140px",
      align: "center",
      render: (row) => (
        <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
          <Calendar style={{ width: "12px", height: "12px", color: "#2563EB" }} />
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#0F2E5C" }}>
            {row.waktuPengawasan || row.tanggal || row.tanggalAudit || "-"}
          </span>
        </div>
      )
    },
    {
      key: "wilayah",
      label: "PROPINSI KAB/KOTA",
      width: "140px",
      render: (row) => (
        <div>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C" }}>
            {row.propinsi || "Jawa Barat"}
          </div>
          <div style={{ fontSize: "10px", color: "#64748B" }}>
            {row.kabKota || "Kabupaten Bogor"}
          </div>
        </div>
      )
    },
    {
      key: "dokumen",
      label: "DOKUMEN",
      width: "160px",
      render: (row) => (
        <DocStatusBadge
          status={row._docStatus || (row.dokumen || row.dokumenBAP ? "complete" : "pending")}
          fileName={row.dokumen || row.dokumenBAP}
          documentLabel="Dokumen SIMAK 2"
          onClick={() => setDocUploadTarget(row)}
        />
      )
    },
    {
      key: "status",
      label: "STATUS",
      width: "135px",
      align: "center",
      render: (row) => {
        const isPatuh = row.statusKepatuhan === "Patuh";
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 900,
                padding: "2px 8px",
                borderRadius: "9999px",
                backgroundColor: isPatuh ? "#DCFCE7" : "#FEE2E2",
                color: isPatuh ? "#166534" : "#991B1B",
                border: `1px solid ${isPatuh ? "#86EFAC" : "#FCA5A5"}`,
                display: "inline-flex",
                alignItems: "center",
                gap: "3px"
              }}
            >
              {isPatuh ? <Check style={{ width: "10px", height: "10px" }} /> : <X style={{ width: "10px", height: "10px" }} />}
              <span>{row.statusKepatuhan}</span>
            </span>
            <StatusBadge status={row.statusVerifikasi} />
          </div>
        );
      }
    }
  ];

  // Columns Khusus SIMAK 3 (Tertib Pemanfaatan: 10 Kolom Standar Resmi SIPJAKI Kementerian PUPR)
  const simak3TableColumns: ColumnDef<PelaksanaanRecord>[] = [
    {
      key: "no",
      label: "NO",
      width: "50px",
      align: "center",
      render: (_row, index) => (
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>
          {index + 1}
        </span>
      )
    },
    {
      key: "namaBangunan",
      label: "NAMA BANGUNAN",
      width: "260px",
      render: (row) => (
        <div>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", lineHeight: "1.4" }}>
            {row.namaBangunan || row.namaObjek}
          </div>
          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "3px", display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "9px", fontWeight: 900, color: "#065F46", backgroundColor: "#D1FAE5", padding: "1px 5px", borderRadius: "4px" }}>
              {row.fungsiBangunan || "Bangunan Gedung"}
            </span>
            <span style={{ fontSize: "9px", fontWeight: 800, color: "#1E40AF", backgroundColor: "#DBEAFE", padding: "1px 5px", borderRadius: "4px" }}>
              {row.statusSlf || "SLF Terdata"}
            </span>
          </div>
        </div>
      )
    },
    {
      key: "lokasi",
      label: "LOKASI",
      width: "180px",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "flex-start", gap: "4px" }}>
          <MapPin style={{ width: "12px", height: "12px", color: "#2563EB", flexShrink: 0, marginTop: "2px" }} />
          <span style={{ fontSize: "11px", color: "#334155", lineHeight: "1.3" }}>
            {row.lokasi}
          </span>
        </div>
      )
    },
    {
      key: "namaPemilik",
      label: "NAMA PEMILIK",
      width: "170px",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <Building2 style={{ width: "12px", height: "12px", color: "#2563EB", flexShrink: 0 }} />
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#0F2E5C" }}>
            {row.namaPemilik || row.badanUsaha || "Pemkab Bogor"}
          </span>
        </div>
      )
    },
    {
      key: "namaPengelola",
      label: "NAMA PENGELOLA",
      width: "170px",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <User style={{ width: "12px", height: "12px", color: "#059669", flexShrink: 0 }} />
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#1E293B" }}>
            {row.namaPengelola || "-"}
          </span>
        </div>
      )
    },
    {
      key: "waktuPengawasan",
      label: "WAKTU PENGAWASAN",
      width: "135px",
      align: "center",
      render: (row) => (
        <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
          <Calendar style={{ width: "12px", height: "12px", color: "#2563EB" }} />
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#0F2E5C" }}>
            {row.waktuPengawasan || row.tanggal || row.tanggalAudit || "-"}
          </span>
        </div>
      )
    },
    {
      key: "propinsi",
      label: "PROPINSI",
      width: "110px",
      render: (row) => (
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#0F2E5C" }}>
          {row.propinsi || "Jawa Barat"}
        </span>
      )
    },
    {
      key: "kabKota",
      label: "KAB/KOTA",
      width: "120px",
      render: (row) => (
        <span style={{ fontSize: "11px", color: "#64748B" }}>
          {row.kabKota || "Kabupaten Bogor"}
        </span>
      )
    },
    {
      key: "status",
      label: "STATUS",
      width: "135px",
      align: "center",
      render: (row) => {
        const isPatuh = row.statusKepatuhan === "Patuh";
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 900,
                padding: "2px 8px",
                borderRadius: "9999px",
                backgroundColor: isPatuh ? "#DCFCE7" : "#FEE2E2",
                color: isPatuh ? "#166534" : "#991B1B",
                border: `1px solid ${isPatuh ? "#86EFAC" : "#FCA5A5"}`,
                display: "inline-flex",
                alignItems: "center",
                gap: "3px"
              }}
            >
              {isPatuh ? <Check style={{ width: "10px", height: "10px" }} /> : <X style={{ width: "10px", height: "10px" }} />}
              <span>{row.statusKepatuhan}</span>
            </span>
            <StatusBadge status={row.statusVerifikasi} />
          </div>
        );
      }
    },
    {
      key: "dokumen",
      label: "DOKUMEN",
      width: "160px",
      render: (row) => (
        <DocStatusBadge
          status={row._docStatus || (row.dokumen || row.dokumenBAP ? "complete" : "pending")}
          fileName={row.dokumen || row.dokumenBAP}
          documentLabel="Dokumen SIMAK 3"
          onClick={() => setDocUploadTarget(row)}
        />
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Live Database Indicator Badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <span 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "5px",
            fontSize: "11px", 
            fontWeight: 700, 
            padding: "3px 10px", 
            borderRadius: "9999px",
            backgroundColor: dataStatus.source === "supabase" ? "#ECFDF5" : "#FFFBEB",
            color: dataStatus.source === "supabase" ? "#065F46" : "#B45309",
            border: `1px solid ${dataStatus.source === "supabase" ? "#A7F3D0" : "#FDE68A"}`
          }}
        >
          <DbIcon style={{ width: "12px", height: "12px" }} />
          {dataStatus.source === "supabase" ? "PostgreSQL (Live)" : "Mode Cadangan Lokal"}
        </span>
      </div>

      {/* Module Header (Standar Resmi SIPJAKI Kementerian PUPR) */}
      <ModuleHeader
        breadcrumbs={[
          { label: config.shortTitle, href: config.basePath },
          { label: "Pelaksanaan Pengawasan Lapangan" }
        ]}
        badgeText={config.pilar}
        badgeBg={config.badgeBg}
        badgeColor={config.badgeColor}
        title={
          isSimak2
            ? "Pelaksanaan Pengawasan Tertib Penyelenggaraan Jasa Konstruksi"
            : isSimak3
            ? "Pelaksanaan Pengawasan Tertib Pemanfaatan Produk Jasa Konstruksi"
            : "Pelaksanaan Pengawasan Tertib Usaha Jasa Konstruksi"
        }
        description={
          isSimak2
            ? "Pemeriksaan kepatuhan proses pengadaan, kontrak kerja konstruksi, penerapan SMKK, dan pemenuhan standar teknis (11 Kolom Baku SIPJAKI Kementerian PUPR)."
            : isSimak3
            ? "Pemeriksaan kepatuhan kelaikan fungsi dan pemeliharaan bangunan gedung purna-konstruksi (Standar SIPJAKI Kementerian PUPR)."
            : "Pemeriksaan kepatuhan perizinan berusaha, rantai pasok material, peralatan, dan sertifikasi tenaga kerja konstruksi."
        }
        legalBasis={config.legalBasis}
        actionButtons={[
          {
            label: "Import Batch Pengawasan",
            icon: FileSpreadsheet,
            variant: "outline",
            onClick: () => setIsBatchImportOpen(true)
          },
          {
            label: "Tambah Pengawasan Baru",
            icon: Plus,
            variant: "primary",
            onClick: () => setIsAddModalOpen(true)
          },
          {
            label: "Export SIPJAKI (XLSX)",
            icon: Download,
            onClick: () => {
              const tmpl = isSimak2 ? TEMPLATE_PELAKSANAAN_SIMAK2 : isSimak3 ? TEMPLATE_PELAKSANAAN_SIMAK3 : TEMPLATE_PELAKSANAAN;
              exportToSpreadsheet({
                fileName: isSimak2 ? TEMPLATE_PELAKSANAAN_SIMAK2.exportFileName : isSimak3 ? TEMPLATE_PELAKSANAAN_SIMAK3.exportFileName : `${TEMPLATE_PELAKSANAAN.exportFileName}_${tertibType}`,
                sheetName: tmpl.sheetName,
                columns: tmpl.columns,
                data: filteredData,
                sipjakiMode: true,
                includeDataDictionary: true,
                dictionaryItems: tmpl.dictionaryItems
              });
            }
          }
        ]}
      />

      {/* Top 4 Summary Stat Cards (Tanpa kata audit & skor numerik) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
        {/* Card 1: Total Pengawasan */}
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
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Total Pengawasan
              </span>
              <span style={{ display: "block", fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>
                Pemeriksaan Lapangan SIMAK
              </span>
            </div>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#EFF6FF",
                color: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <ClipboardCheck style={{ width: "20px", height: "20px" }} />
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#0F2E5C", margin: 0, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              {statTotal} Objek
            </h3>
          </div>

          <div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #F1F5F9" }}>
            <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Tahun Anggaran {filterTahun}</span>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#1E40AF", backgroundColor: "#DBEAFE", padding: "2px 8px", borderRadius: "9999px" }}>
              Terbaru di Atas
            </span>
          </div>
        </div>

        {/* Card 2: Status Patuh */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #10B981",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Status Kepatuhan: Patuh
              </span>
              <span style={{ display: "block", fontSize: "11px", color: "#166534", fontWeight: 700, marginTop: "2px" }}>
                Memenuhi Seluruh Syarat
              </span>
            </div>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#DCFCE7",
                color: "#166534",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <CheckCircle2 style={{ width: "20px", height: "20px" }} />
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#166534", margin: 0, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              {statPatuh} Kegiatan
            </h3>
          </div>

          <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid #F1F5F9" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}>Tingkat Kepatuhan</span>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#166534" }}>
                {statTotal > 0 ? Math.round((statPatuh / statTotal) * 100) : 0}%
              </span>
            </div>
            <div style={{ width: "100%", height: "6px", backgroundColor: "#F1F5F9", borderRadius: "9999px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${statTotal > 0 ? Math.min(Math.round((statPatuh / statTotal) * 100), 100) : 0}%`,
                  height: "100%",
                  backgroundColor: "#10B981",
                  borderRadius: "9999px"
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Status Tidak Patuh */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #EF4444",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Status: Tidak Patuh
              </span>
              <span style={{ display: "block", fontSize: "11px", color: "#DC2626", fontWeight: 700, marginTop: "2px" }}>
                Perlu Tindakan Korektif
              </span>
            </div>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#FEE2E2",
                color: "#DC2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <XCircle style={{ width: "20px", height: "20px" }} />
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#DC2626", margin: 0, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              {statTidakPatuh} Temuan
            </h3>
          </div>

          <div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #F1F5F9" }}>
            <span style={{ fontSize: "11px", color: statTidakPatuh > 0 ? "#DC2626" : "#64748B", fontWeight: 700 }}>
              {statTidakPatuh > 0 ? "Wajib Surat Peringatan" : "Nihil Pelanggaran"}
            </span>
            <span style={{ fontSize: "10px", fontWeight: 800, color: statTidakPatuh > 0 ? "#991B1B" : "#166534", backgroundColor: statTidakPatuh > 0 ? "#FEE2E2" : "#DCFCE7", padding: "2px 8px", borderRadius: "9999px" }}>
              {statTidakPatuh > 0 ? "Perhatian" : "Aman"}
            </span>
          </div>
        </div>

        {/* Card 4: Menunggu Verifikasi */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #E2E8F0",
            borderTop: "3px solid #F59E0B",
            boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Menunggu Verifikasi
              </span>
              <span style={{ display: "block", fontSize: "11px", color: "#D97706", fontWeight: 700, marginTop: "2px" }}>
                Perlu Tindakan Pengawas
              </span>
            </div>
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
              <AlertCircle style={{ width: "20px", height: "20px" }} />
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#D97706", margin: 0, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              {statPending} Draft
            </h3>
          </div>

          <div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #F1F5F9" }}>
            <span style={{ fontSize: "11px", color: "#D97706", fontWeight: 700 }}>Menunggu Review</span>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#92400E", backgroundColor: "#FEF3C7", padding: "2px 8px", borderRadius: "9999px" }}>
              Antrian
            </span>
          </div>
        </div>
      </div>

      {/* Global Filter Bar (Standar Paket Pekerjaan Terkini: Urutan Terbaru di Atas) */}
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
          gap: "14px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div>
            <label style={{ fontSize: "10px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Hasil Kepatuhan
            </label>
            <select
              value={filterKepatuhan}
              onChange={(e) => setFilterKepatuhan(e.target.value)}
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
              <option value="Semua">Semua Kepatuhan</option>
              <option value="Patuh">Patuh</option>
              <option value="Tidak Patuh">Tidak Patuh</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "10px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Status Verifikasi
            </label>
            <select
              value={filterStatusVerifikasi}
              onChange={(e) => setFilterStatusVerifikasi(e.target.value)}
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
              <option value="Semua">Semua Status</option>
              <option value="pending">Menunggu Verifikasi (Draft)</option>
              <option value="verified">Terverifikasi</option>
              <option value="rejected">Ditolak / Investigasi</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "10px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Tahun Anggaran
            </label>
            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
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
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
          {/* Selector Urutan (Sort Selector) */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label style={{ fontSize: "10px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", display: "block" }}>
              Urutan
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                height: "36px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                padding: "0 10px",
                fontSize: "12px",
                fontWeight: 700,
                color: "#0F2E5C",
                backgroundColor: "#EFF6FF"
              }}
            >
              <option value="terkini">Paket Pekerjaan Terkini (Default - DESC)</option>
              <option value="kepatuhan">Status Kepatuhan (Patuh ke Tidak Patuh)</option>
              <option value="nama">Nama Paket / Objek (A-Z)</option>
              <option value="terlama">Waktu Pengawasan Terlama (ASC)</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "6px 12px",
              borderRadius: "9999px",
              backgroundColor: "#EFF6FF",
              color: "#1E40AF",
              fontSize: "11px",
              fontWeight: 800,
              border: "1px solid #BFDBFE"
            }}
          >
            <ArrowUpRight style={{ width: "12px", height: "12px" }} />
            {sortBy === "terkini" ? "Paket Pekerjaan Terkini (DESC)" : sortBy.toUpperCase()}
          </span>

          <button
            type="button"
            onClick={() => {
              setActiveVariant("Semua");
              setFilterStatusVerifikasi("Semua");
              setFilterKepatuhan("Semua");
              setFilterTahun("2026");
              setSortBy("terkini");
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
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
            <RefreshCw style={{ width: "12px", height: "12px" }} />
            <span>Reset Filter</span>
          </button>
        </div>
      </div>

      {/* SIMAK Variant Scrollable Selector Chips */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          overflowX: "auto",
          padding: "10px",
          backgroundColor: "#FFFFFF",
          borderRadius: "14px",
          border: "1px solid #E2E8F0"
        }}
      >
        <button
          onClick={() => setActiveVariant("Semua")}
          style={{
            padding: "6px 14px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 800,
            cursor: "pointer",
            border: "none",
            backgroundColor: activeVariant === "Semua" ? "#0F2E5C" : "#F1F5F9",
            color: activeVariant === "Semua" ? "#FFFFFF" : "#64748B",
            whiteSpace: "nowrap"
          }}
        >
          Semua Form ({config.simakVariants.length})
        </button>
        {config.simakVariants.map((v) => (
          <button
            key={v.code}
            onClick={() => setActiveVariant(v.code)}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              border: "none",
              whiteSpace: "nowrap",
              backgroundColor: activeVariant === v.code ? "#0F2E5C" : "#F1F5F9",
              color: activeVariant === v.code ? "#FFFFFF" : "#64748B"
            }}
          >
            {v.code}: {v.label.split("(")[0]}
          </button>
        ))}
      </div>

      {/* Doc Completion Progress Bar */}
      <DocCompletionBar
        total={data.length}
        completed={data.filter((d) => d._docStatus === "complete" || Boolean(d.dokumen || d.dokumenBAP)).length}
        label="Kelengkapan Dokumen Pengawasan Lapangan"
        isFilterActive={filterDocPending}
        onFilterPending={() => setFilterDocPending((prev) => !prev)}
      />

      {/* Table DataTableView (Standar SIPJAKI SIMAK 1, SIMAK 2 & SIMAK 3 dengan Fitur Aksi Edit & Hapus) */}
      <DataTableView<PelaksanaanRecord>
        title={
          isSimak2
            ? `Daftar Pengawasan Tertib Penyelenggaraan SIMAK 2 (${filteredData.length} Paket Proyek)`
            : isSimak3
            ? `Daftar Pengawasan Tertib Pemanfaatan SIMAK 3 (${filteredData.length} Bangunan/Infrastruktur)`
            : `Daftar Pengawasan Lapangan SIMAK (${filteredData.length} Kegiatan)`
        }
        subtitle={
          filterDocPending
            ? "Menampilkan pengawasan SIMAK yang belum memiliki berkas dokumen resmi (dapat disusulkan)"
            : isSimak2
            ? "Data pengawasan paket pekerjaan fisik konstruksi standar SIPJAKI SIMAK 2 Kementerian PUPR dan Kabupaten Bogor"
            : isSimak3
            ? "Data pengawasan kelaikan fungsi dan pemeliharaan bangunan gedung purna-konstruksi standar SIPJAKI SIMAK 3"
            : "Data hasil pengawasan 3 tertib standar SIPJAKI Kementerian PUPR dan Kabupaten Bogor"
        }
        data={filteredData}
        columns={isSimak2 ? simak2TableColumns : isSimak3 ? simak3TableColumns : tableColumns}
        exportFileName={isSimak2 ? "pengawasan-simak2-tertib-penyelenggaraan-bogor" : isSimak3 ? "pengawasan-simak3-tertib-pemanfaatan-bogor" : `pengawasan-simak-${tertibType}-bogor`}
        sipjakiTemplate={isSimak2 ? TEMPLATE_PELAKSANAAN_SIMAK2 : isSimak3 ? TEMPLATE_PELAKSANAAN_SIMAK3 : TEMPLATE_PELAKSANAAN}
        exportColumns={(isSimak2 ? TEMPLATE_PELAKSANAAN_SIMAK2 : isSimak3 ? TEMPLATE_PELAKSANAAN_SIMAK3 : TEMPLATE_PELAKSANAAN).columns}
        actionsHeader="EDIT"
        actionsRender={(row) => (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            {/* Tombol 1: Verifikasi (Hanya Muncul jika Draft) */}
            {row.statusVerifikasi === "Draft" && (
              <button
                type="button"
                title="Lakukan Verifikasi Dokumen"
                onClick={() => {
                  setVerifyTarget(row);
                  setIsVerifyOpen(true);
                }}
                style={{
                  padding: "5px 8px",
                  borderRadius: "6px",
                  border: "1px solid #047857",
                  backgroundColor: "#059669",
                  color: "#FFFFFF",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <ShieldCheck style={{ width: "13px", height: "13px", color: "#FFC000" }} />
                <span>Verifikasi</span>
              </button>
            )}

            {/* Tombol 2: Lihat Dokumen / Detail Pengawasan */}
            <button
              type="button"
              title="Lihat Pratinjau Dokumen Pengawasan"
              onClick={() => {
                setSelectedRecordForDoc(row);
                setIsDocPreviewModalOpen(true);
              }}
              style={{
                padding: "5px 8px",
                borderRadius: "6px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#F8FAFC",
                color: "#334155",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <Eye style={{ width: "13px", height: "13px" }} />
              <span className="hidden sm:inline">Detail</span>
            </button>

            {/* Tombol 3: Edit Pengawasan (Standar SIPJAKI: Fitur Edit) */}
            <button
              type="button"
              title="Ubah Data Pengawasan"
              onClick={() => handleOpenEdit(row)}
              style={{
                padding: "5px 8px",
                borderRadius: "6px",
                border: "1px solid #FCD34D",
                backgroundColor: "#FEF3C7",
                color: "#B45309",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <Edit style={{ width: "13px", height: "13px" }} />
              <span className="hidden sm:inline">Edit</span>
            </button>

            {/* Tombol 4: Hapus Pengawasan (Standar SIPJAKI: Fitur Hapus) */}
            <button
              type="button"
              title="Hapus Data Pengawasan"
              onClick={() => {
                setDeletingRecord(row);
                setShowDeleteDialog(true);
              }}
              style={{
                padding: "5px 8px",
                borderRadius: "6px",
                border: "1px solid #FCA5A5",
                backgroundColor: "#FEE2E2",
                color: "#991B1B",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <Trash2 style={{ width: "13px", height: "13px" }} />
              <span className="hidden sm:inline">Hapus</span>
            </button>
          </div>
        )}
      />

      {/* Modal Form Tambah Pengawasan Baru (Standar SIPJAKI SIMAK 1 & SIMAK 2) */}
      <ModalForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={
          isSimak2
            ? `Tambah Pengawasan SIMAK 2 (Tertib Penyelenggaraan)`
            : isSimak3
            ? `Tambah Pengawasan SIMAK 3 (Tertib Pemanfaatan)`
            : `Tambah Data Pengawasan Lapangan`
        }
        subtitle={
          isSimak2
            ? `Pengisian data form pengawasan paket proyek fisik (11 Parameter Standar SIPJAKI SIMAK 2 Kementerian PUPR)`
            : isSimak3
            ? `Pengisian data form pengawasan kelaikan fungsi & pemeliharaan bangunan gedung (10 Parameter Standar SIPJAKI SIMAK 3)`
            : `Pengisian data form pengawasan tertib usaha (SIMAK 1) standar SIPJAKI Kementerian PUPR`
        }
        icon={ClipboardCheck}
        size="lg"
        submitLabel={`Simpan Data Pengawasan`}
        onSubmit={handleSaveAdd}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Status Kepatuhan Banner Header */}
          <div style={{ backgroundColor: addForm.statusKepatuhan === "Patuh" ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${addForm.statusKepatuhan === "Patuh" ? "#BBF7D0" : "#FECACA"}`, borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "10px", fontWeight: 800, color: addForm.statusKepatuhan === "Patuh" ? "#166534" : "#991B1B", textTransform: "uppercase" }}>
                Status Kepatuhan Lapangan
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                <span style={{ fontSize: "18px", fontWeight: 900, color: addForm.statusKepatuhan === "Patuh" ? "#166534" : "#991B1B" }}>
                  {addForm.statusKepatuhan === "Patuh" ? "✓ PATUH (Memenuhi Ketentuan)" : "✗ TIDAK PATUH (Pelanggaran/Kekurangan)"}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setAddForm({ ...addForm, statusKepatuhan: "Patuh" })}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: addForm.statusKepatuhan === "Patuh" ? "#166534" : "#E2E8F0",
                  color: addForm.statusKepatuhan === "Patuh" ? "#FFFFFF" : "#475569"
                }}
              >
                Patuh
              </button>
              <button
                type="button"
                onClick={() => setAddForm({ ...addForm, statusKepatuhan: "Tidak Patuh" })}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: addForm.statusKepatuhan === "Tidak Patuh" ? "#991B1B" : "#E2E8F0",
                  color: addForm.statusKepatuhan === "Tidak Patuh" ? "#FFFFFF" : "#475569"
                }}
              >
                Tidak Patuh
              </button>
            </div>
          </div>

          {isSimak2 ? (
            /* ================= FORM KHUSUS SIMAK 2 (11 PARAMETER SIPJAKI) ================= */
            <>
              {/* Auto-fill Selector dari Master Paket Pekerjaan */}
              {masterPaketList.length > 0 && (
                <div style={{ backgroundColor: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: "10px", padding: "12px 14px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 800, color: "#0369A1", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                    <Sparkles style={{ width: "13px", height: "13px", color: "#0284C7" }} />
                    <span>Pilih dari Master Paket Pekerjaan (Auto-Populate Otomatis)</span>
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleSelectPaketAutoFill(e.target.value);
                    }}
                    defaultValue=""
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #7DD3FC", fontSize: "12px", backgroundColor: "#FFFFFF", fontWeight: 600, color: "#0F2E5C" }}
                  >
                    <option value="" disabled>-- Pilih paket untuk mengisi otomatis nilai, SPK, kontraktor & PPK --</option>
                    {masterPaketList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama_paket} (Rp {Number(p.nilai_kontrak || 0).toLocaleString("id-ID")}) - {p.nama_penyedia || "Penyedia Jasa"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Row 1: Varian SIMAK 2 & Waktu Pengawasan */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Varian Form SIMAK 2
                  </label>
                  <select
                    value={addForm.simakCode}
                    onChange={(e) => setAddForm({ ...addForm, simakCode: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  >
                    {config.simakVariants.map((v) => (
                      <option key={v.code} value={v.code}>
                        {v.code} — {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Waktu Pengawasan <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={addForm.waktuPengawasan}
                    onChange={(e) => setAddForm({ ...addForm, waktuPengawasan: e.target.value, tanggal: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Row 2: Nama Proyek & Nilai Proyek */}
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Nama Proyek / Paket Pekerjaan <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Peningkatan Jalan Poros Bojonggede - Kemang"
                    value={addForm.namaProyek}
                    onChange={(e) => setAddForm({ ...addForm, namaProyek: e.target.value, namaObjek: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Nilai Proyek (Rp) <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000000}
                    placeholder="Contoh: 14850000000"
                    value={addForm.nilaiProyek || ""}
                    onChange={(e) => setAddForm({ ...addForm, nilaiProyek: Number(e.target.value) || 0 })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                  {addForm.nilaiProyek > 0 && (
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#047857", marginTop: "3px", display: "block" }}>
                      Rp {addForm.nilaiProyek.toLocaleString("id-ID")}
                    </span>
                  )}
                </div>
              </div>

              {/* Row 3: Nomor Perjanjian & Waktu Pelaksanaan */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Nomor Perjanjian / Kontrak
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 602.1/045/SPK-KTR/DPUPR/2026"
                    value={addForm.nomorPerjanjian}
                    onChange={(e) => setAddForm({ ...addForm, nomorPerjanjian: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Waktu Pelaksanaan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 180 Hari Kalender"
                    value={addForm.waktuPelaksanaan}
                    onChange={(e) => setAddForm({ ...addForm, waktuPelaksanaan: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Row 4: Penyedia Jasa & Nama Pemilik Pekerjaan */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Penyedia Jasa (Kontraktor) <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PT. Samudra Beton Persada"
                    value={addForm.penyediaJasa}
                    onChange={(e) => setAddForm({ ...addForm, penyediaJasa: e.target.value, namaProdusen: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Nama Pemilik Pekerjaan (PPK / Dinas)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Dinas PUPR Kab. Bogor / PPK Bidang Jalan"
                    value={addForm.namaPemilikPekerjaan}
                    onChange={(e) => setAddForm({ ...addForm, namaPemilikPekerjaan: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Row 5: Lokasi / Wilayah, Propinsi, Kab/Kota */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Lokasi Pekerjaan (Kecamatan)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Kecamatan Bojonggede"
                    value={addForm.lokasi}
                    onChange={(e) => setAddForm({ ...addForm, lokasi: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Propinsi
                  </label>
                  <input
                    type="text"
                    value={addForm.propinsi}
                    onChange={(e) => setAddForm({ ...addForm, propinsi: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Kab/Kota
                  </label>
                  <input
                    type="text"
                    value={addForm.kabKota}
                    onChange={(e) => setAddForm({ ...addForm, kabKota: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Row 6: Tim Pengawas Jakon */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Tim Petugas Pengawas Jakon
                </label>
                <input
                  type="text"
                  value={addForm.pengawas}
                  onChange={(e) => setAddForm({ ...addForm, pengawas: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                />
              </div>
            </>
          ) : isSimak3 ? (
            /* ================= FORM KHUSUS SIMAK 3 (10 PARAMETER SIPJAKI TERTIB PEMANFAATAN) ================= */
            <>
              {/* Row 1: Varian Form SIMAK 3 & Waktu Pengawasan */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Varian Form SIMAK
                  </label>
                  <select
                    value={addForm.simakCode}
                    onChange={(e) => setAddForm({ ...addForm, simakCode: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  >
                    <option value="SIMAK 3">SIMAK 3 — Pengawasan Pemanfaatan Produk Konstruksi</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Waktu Pengawasan <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={addForm.waktuPengawasan}
                    onChange={(e) => setAddForm({ ...addForm, waktuPengawasan: e.target.value, tanggal: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Row 2: Nama Bangunan & Lokasi */}
              <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Nama Bangunan / Infrastruktur <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Gedung Rawat Inap RSUD Leuwiliang / Stadion Pakansari"
                    value={addForm.namaBangunan}
                    onChange={(e) => setAddForm({ ...addForm, namaBangunan: e.target.value, namaObjek: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Lokasi Bangunan <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jl. Raya Cibeber No. 1, Leuwiliang"
                    value={addForm.lokasi}
                    onChange={(e) => setAddForm({ ...addForm, lokasi: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Row 3: Nama Pemilik & Nama Pengelola */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Nama Pemilik (Aset) <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pemerintah Kabupaten Bogor / BPKAD"
                    value={addForm.namaPemilik}
                    onChange={(e) => setAddForm({ ...addForm, namaPemilik: e.target.value, namaProdusen: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Nama Pengelola (O&P) <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Dinas Kesehatan / Manajemen RSUD"
                    value={addForm.namaPengelola}
                    onChange={(e) => setAddForm({ ...addForm, namaPengelola: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Row 4: Fungsi Bangunan & Status SLF */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Fungsi Bangunan Gedung
                  </label>
                  <select
                    value={addForm.fungsiBangunan}
                    onChange={(e) => setAddForm({ ...addForm, fungsiBangunan: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  >
                    <option value="Fasilitas Pelayanan Kesehatan">Fasilitas Pelayanan Kesehatan (RSUD / Puskesmas)</option>
                    <option value="Fasilitas Olahraga & Ruang Publik">Fasilitas Olahraga & Ruang Publik (Stadion / GOR)</option>
                    <option value="Fasilitas Perkantoran Pemerintah">Fasilitas Perkantoran Pemerintah</option>
                    <option value="Infrastruktur Jembatan / Jalan">Infrastruktur Jembatan / Jalan Kabupaten</option>
                    <option value="Fasilitas Perdagangan / Pasar">Fasilitas Perdagangan / Pasar Tradisional</option>
                    <option value="Fasilitas Pendidikan / Sekolah">Fasilitas Pendidikan / Sekolah</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Status Kelaikan Fungsi (SLF)
                  </label>
                  <select
                    value={addForm.statusSlf}
                    onChange={(e) => setAddForm({ ...addForm, statusSlf: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  >
                    <option value="Memiliki SLF (Aktif)">Memiliki SLF (Aktif)</option>
                    <option value="Dalam Proses Penerbitan SLF">Dalam Proses Penerbitan SLF</option>
                    <option value="Belum Perpanjang SLF (Kedaluwarsa)">Belum Perpanjang SLF (Kedaluwarsa)</option>
                    <option value="Belum Memiliki SLF">Belum Memiliki SLF</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Propinsi & Kab/Kota */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Propinsi
                  </label>
                  <input
                    type="text"
                    disabled
                    value={addForm.propinsi}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", fontSize: "13px", color: "#64748B" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Kabupaten / Kota
                  </label>
                  <input
                    type="text"
                    disabled
                    value={addForm.kabKota}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", fontSize: "13px", color: "#64748B" }}
                  />
                </div>
              </div>

              {/* Row 6: Tim Pengawas Jakon */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Tim Petugas Pengawas Jakon
                </label>
                <input
                  type="text"
                  value={addForm.pengawas}
                  onChange={(e) => setAddForm({ ...addForm, pengawas: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                />
              </div>
            </>
          ) : (
            /* ================= FORM KHUSUS SIMAK 1 (TERTIB USAHA) ================= */
            <>
              {/* Row 1: Varian Form, Kualifikasi, Tanggal */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Varian Form SIMAK
                  </label>
                  <select
                    value={addForm.simakCode}
                    onChange={(e) => setAddForm({ ...addForm, simakCode: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  >
                    {config.simakVariants.map((v) => (
                      <option key={v.code} value={v.code}>
                        {v.code} — {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Kualifikasi Usaha
                  </label>
                  <select
                    value={addForm.kualifikasi}
                    onChange={(e) => setAddForm({ ...addForm, kualifikasi: e.target.value as any })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  >
                    <option value="Kecil">Kecil</option>
                    <option value="Menengah">Menengah</option>
                    <option value="Besar">Besar</option>
                    <option value="Spesialis">Spesialis</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Tanggal Pengawasan
                  </label>
                  <input
                    type="date"
                    value={addForm.tanggal}
                    onChange={(e) => setAddForm({ ...addForm, tanggal: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Row 2: Objek & Nama Produsen */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Nama Objek Pengawasan <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pengawasan Izin Berusaha & Legalitas SBU"
                    value={addForm.namaObjek}
                    onChange={(e) => setAddForm({ ...addForm, namaObjek: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Nama Produsen / Badan Usaha <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PT. Pakuan Graha Konstruksi"
                    value={addForm.namaProdusen}
                    onChange={(e) => setAddForm({ ...addForm, namaProdusen: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Row 3: Nama Pemilik, No Kontak, Lokasi */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Nama Pemilik / Direktur
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: H. Ridwan Mansyur, S.T."
                    value={addForm.namaPemilik}
                    onChange={(e) => setAddForm({ ...addForm, namaPemilik: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    No Kontak / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 0812-8877-6655"
                    value={addForm.noKontak}
                    onChange={(e) => setAddForm({ ...addForm, noKontak: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Lokasi Kecamatan (Kab. Bogor)
                  </label>
                  <input
                    type="text"
                    value={addForm.lokasi}
                    onChange={(e) => setAddForm({ ...addForm, lokasi: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Row 4: Kepemilikan Izin, Keabsahan Izin, Kapasitas */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Kepemilikan Izin
                  </label>
                  <select
                    value={addForm.kepemilikanIzin}
                    onChange={(e) => setAddForm({ ...addForm, kepemilikanIzin: e.target.value as any })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  >
                    <option value="Memiliki">Memiliki</option>
                    <option value="Tidak Memiliki">Tidak Memiliki</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Keabsahan Izin
                  </label>
                  <select
                    value={addForm.keabsahanIzin}
                    onChange={(e) => setAddForm({ ...addForm, keabsahanIzin: e.target.value as any })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  >
                    <option value="Sah">Sah / Aktif</option>
                    <option value="Tidak Sah">Tidak Sah / Kadaluwarsa</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Kapasitas Operasional
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Kemampuan Nyata Rp 2,5 M"
                    value={addForm.kapasitas}
                    onChange={(e) => setAddForm({ ...addForm, kapasitas: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Row 5: Izin BB & Keabsahan BB */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Izin Bahan Baku (BB)
                  </label>
                  <select
                    value={addForm.izinBb}
                    onChange={(e) => setAddForm({ ...addForm, izinBb: e.target.value as any })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  >
                    <option value="Ada">Ada</option>
                    <option value="Tidak Ada">Tidak Ada</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Keabsahan Bahan Baku
                  </label>
                  <select
                    value={addForm.keabsahanBb}
                    onChange={(e) => setAddForm({ ...addForm, keabsahanBb: e.target.value as any })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  >
                    <option value="Sah">Sah</option>
                    <option value="Tidak Sah">Tidak Sah</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Nama Petugas Pengawas
                  </label>
                  <input
                    type="text"
                    value={addForm.pengawas}
                    onChange={(e) => setAddForm({ ...addForm, pengawas: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Row Bersama: Temuan & Rekomendasi */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Uraian Temuan Pemeriksaan Lapangan
              </label>
              <textarea
                rows={2}
                value={addForm.catatanTemuan}
                onChange={(e) => setAddForm({ ...addForm, catatanTemuan: e.target.value })}
                placeholder="Tuliskan temuan faktual lapangan..."
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "12px" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Rekomendasi Tindak Lanjut
              </label>
              <textarea
                rows={2}
                value={addForm.rekomendasi}
                onChange={(e) => setAddForm({ ...addForm, rekomendasi: e.target.value })}
                placeholder="Rekomendasi tindakan korektif..."
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "12px" }}
              />
            </div>
          </div>

          {/* File Upload Dokumen */}
          <FileUploader
            label={isSimak2 ? "Unggah Berkas Dokumen Pengawasan SIMAK 2 (PDF)" : "Unggah Berkas Dokumen Pengawasan (PDF)"}
            accept=".pdf"
            maxSizeMb={10}
            hint="Dokumen laporan resmi hasil pengawasan bertanda tangan (PDF). Maksimal 10MB."
            onFileSelect={(file) => setAddForm({ ...addForm, dokumenFile: file })}
          />
        </div>
      </ModalForm>

      {/* Modal Form Edit Pengawasan (Standar SIPJAKI: Fitur Edit) */}
      <ModalForm
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingRecord(null);
        }}
        title={
          isSimak2
            ? `Ubah Data Pengawasan SIMAK 2 (Tertib Penyelenggaraan)`
            : isSimak3
            ? `Ubah Data Pengawasan SIMAK 3 (Tertib Pemanfaatan)`
            : `Ubah Data Pengawasan Lapangan`
        }
        subtitle={
          isSimak2
            ? `Perbarui data form pengawasan paket proyek "${editingRecord?.namaProyek || editingRecord?.namaObjek || ""}"`
            : isSimak3
            ? `Perbarui data form pengawasan gedung "${editingRecord?.namaBangunan || editingRecord?.namaObjek || ""}"`
            : `Perbarui data form pengawasan untuk ${editingRecord?.namaProdusen || editingRecord?.badanUsaha || ""}`
        }
        icon={Edit}
        size="lg"
        submitLabel={`Simpan Perubahan`}
        onSubmit={handleSaveEdit}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Status Kepatuhan Toggle Header */}
          <div style={{ backgroundColor: editStatusKepatuhan === "Patuh" ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${editStatusKepatuhan === "Patuh" ? "#BBF7D0" : "#FECACA"}`, borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "10px", fontWeight: 800, color: editStatusKepatuhan === "Patuh" ? "#166534" : "#991B1B", textTransform: "uppercase" }}>
                Status Kepatuhan Lapangan
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                <span style={{ fontSize: "18px", fontWeight: 900, color: editStatusKepatuhan === "Patuh" ? "#166534" : "#991B1B" }}>
                  {editStatusKepatuhan === "Patuh" ? "✓ PATUH (Memenuhi Ketentuan)" : "✗ TIDAK PATUH (Pelanggaran/Kekurangan)"}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setEditStatusKepatuhan("Patuh")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: editStatusKepatuhan === "Patuh" ? "#166534" : "#E2E8F0",
                  color: editStatusKepatuhan === "Patuh" ? "#FFFFFF" : "#475569"
                }}
              >
                Patuh
              </button>
              <button
                type="button"
                onClick={() => setEditStatusKepatuhan("Tidak Patuh")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: editStatusKepatuhan === "Tidak Patuh" ? "#991B1B" : "#E2E8F0",
                  color: editStatusKepatuhan === "Tidak Patuh" ? "#FFFFFF" : "#475569"
                }}
              >
                Tidak Patuh
              </button>
            </div>
          </div>

          {isSimak2 ? (
            /* ================= EDIT KHUSUS SIMAK 2 (11 PARAMETER SIPJAKI) ================= */
            <>
              {/* Row 1: Varian SIMAK 2, Status Verifikasi, Waktu Pengawasan */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Varian Form SIMAK 2
                  </label>
                  <select
                    value={editSimakCode}
                    onChange={(e) => setEditSimakCode(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  >
                    {config.simakVariants.map((v) => (
                      <option key={v.code} value={v.code}>
                        {v.code} — {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Status Verifikasi
                  </label>
                  <select
                    value={editStatusVerifikasi}
                    onChange={(e) => setEditStatusVerifikasi(e.target.value as any)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Terverifikasi">Terverifikasi</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Waktu Pengawasan <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={editWaktuPengawasan}
                    onChange={(e) => setEditWaktuPengawasan(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Row 2: Nama Proyek & Nilai Proyek */}
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Nama Proyek / Paket Pekerjaan <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editNamaProyek}
                    onChange={(e) => setEditNamaProyek(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Nilai Proyek (Rp) <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000000}
                    value={editNilaiProyek || ""}
                    onChange={(e) => setEditNilaiProyek(Number(e.target.value) || 0)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                  {editNilaiProyek > 0 && (
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#047857", marginTop: "3px", display: "block" }}>
                      Rp {editNilaiProyek.toLocaleString("id-ID")}
                    </span>
                  )}
                </div>
              </div>

              {/* Row 3: Nomor Perjanjian & Waktu Pelaksanaan */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Nomor Perjanjian / Kontrak
                  </label>
                  <input
                    type="text"
                    value={editNomorPerjanjian}
                    onChange={(e) => setEditNomorPerjanjian(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Waktu Pelaksanaan
                  </label>
                  <input
                    type="text"
                    value={editWaktuPelaksanaan}
                    onChange={(e) => setEditWaktuPelaksanaan(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Row 4: Penyedia Jasa & Nama Pemilik Pekerjaan */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Penyedia Jasa (Kontraktor) <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editPenyediaJasa}
                    onChange={(e) => setEditPenyediaJasa(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Nama Pemilik Pekerjaan (PPK / Dinas)
                  </label>
                  <input
                    type="text"
                    value={editNamaPemilikPekerjaan}
                    onChange={(e) => setEditNamaPemilikPekerjaan(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Row 5: Lokasi / Wilayah, Propinsi, Kab/Kota */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Lokasi Pekerjaan (Kecamatan)
                  </label>
                  <input
                    type="text"
                    value={editLokasi}
                    onChange={(e) => setEditLokasi(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Propinsi
                  </label>
                  <input
                    type="text"
                    value={editPropinsi}
                    onChange={(e) => setEditPropinsi(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Kab/Kota
                  </label>
                  <input
                    type="text"
                    value={editKabKota}
                    onChange={(e) => setEditKabKota(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Row 6: Berkas Dokumen & Tim Pengawas Jakon */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Nama Berkas Dokumen Pengawasan (PDF)
                  </label>
                  <input
                    type="text"
                    value={editDokumen}
                    onChange={(e) => setEditDokumen(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Tim Petugas Pengawas Jakon
                  </label>
                  <input
                    type="text"
                    value={editPengawas}
                    onChange={(e) => setEditPengawas(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>
            </>
          ) : isSimak3 ? (
            /* ================= EDIT KHUSUS SIMAK 3 (10 PARAMETER SIPJAKI TERTIB PEMANFAATAN) ================= */
            <>
              {/* Row 1: Varian SIMAK 3, Status Verifikasi, Waktu Pengawasan */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Varian Form SIMAK
                  </label>
                  <select
                    value={editSimakCode}
                    onChange={(e) => setEditSimakCode(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  >
                    <option value="SIMAK 3">SIMAK 3 — Pengawasan Pemanfaatan Produk Konstruksi</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Status Verifikasi
                  </label>
                  <select
                    value={editStatusVerifikasi}
                    onChange={(e) => setEditStatusVerifikasi(e.target.value as any)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Terverifikasi">Terverifikasi</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Waktu Pengawasan <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={editWaktuPengawasan}
                    onChange={(e) => setEditWaktuPengawasan(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Row 2: Nama Bangunan & Lokasi */}
              <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Nama Bangunan / Infrastruktur <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editNamaBangunan}
                    onChange={(e) => setEditNamaBangunan(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Lokasi Bangunan <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editLokasi}
                    onChange={(e) => setEditLokasi(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Row 3: Nama Pemilik & Nama Pengelola */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Nama Pemilik (Aset) <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editNamaPemilik}
                    onChange={(e) => setEditNamaPemilik(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Nama Pengelola (O&P) <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editNamaPengelola}
                    onChange={(e) => setEditNamaPengelola(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Row 4: Fungsi Bangunan & Status SLF */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Fungsi Bangunan Gedung
                  </label>
                  <select
                    value={editFungsiBangunan}
                    onChange={(e) => setEditFungsiBangunan(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  >
                    <option value="Fasilitas Pelayanan Kesehatan">Fasilitas Pelayanan Kesehatan (RSUD / Puskesmas)</option>
                    <option value="Fasilitas Olahraga & Ruang Publik">Fasilitas Olahraga & Ruang Publik (Stadion / GOR)</option>
                    <option value="Fasilitas Perkantoran Pemerintah">Fasilitas Perkantoran Pemerintah</option>
                    <option value="Infrastruktur Jembatan / Jalan">Infrastruktur Jembatan / Jalan Kabupaten</option>
                    <option value="Fasilitas Perdagangan / Pasar">Fasilitas Perdagangan / Pasar Tradisional</option>
                    <option value="Fasilitas Pendidikan / Sekolah">Fasilitas Pendidikan / Sekolah</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Status Kelaikan Fungsi (SLF)
                  </label>
                  <select
                    value={editStatusSlf}
                    onChange={(e) => setEditStatusSlf(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  >
                    <option value="Memiliki SLF (Aktif)">Memiliki SLF (Aktif)</option>
                    <option value="Dalam Proses Penerbitan SLF">Dalam Proses Penerbitan SLF</option>
                    <option value="Belum Perpanjang SLF (Kedaluwarsa)">Belum Perpanjang SLF (Kedaluwarsa)</option>
                    <option value="Belum Memiliki SLF">Belum Memiliki SLF</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Propinsi & Kab/Kota */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Propinsi
                  </label>
                  <input
                    type="text"
                    value={editPropinsi}
                    onChange={(e) => setEditPropinsi(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Kabupaten / Kota
                  </label>
                  <input
                    type="text"
                    value={editKabKota}
                    onChange={(e) => setEditKabKota(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Row 6: Berkas Dokumen & Tim Pengawas Jakon */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Nama Berkas Dokumen Pengawasan (PDF)
                  </label>
                  <input
                    type="text"
                    value={editDokumen}
                    onChange={(e) => setEditDokumen(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Tim Petugas Pengawas Jakon
                  </label>
                  <input
                    type="text"
                    value={editPengawas}
                    onChange={(e) => setEditPengawas(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>
            </>
          ) : (
            /* ================= EDIT KHUSUS SIMAK 1 (TERTIB USAHA) ================= */
            <>
              {/* Row 1: Varian, Kualifikasi, Tanggal */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Varian Form SIMAK
                  </label>
                  <select
                    value={editSimakCode}
                    onChange={(e) => setEditSimakCode(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  >
                    {config.simakVariants.map((v) => (
                      <option key={v.code} value={v.code}>
                        {v.code} — {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Kualifikasi Usaha
                  </label>
                  <select
                    value={editKualifikasi}
                    onChange={(e) => setEditKualifikasi(e.target.value as any)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  >
                    <option value="Kecil">Kecil</option>
                    <option value="Menengah">Menengah</option>
                    <option value="Besar">Besar</option>
                    <option value="Spesialis">Spesialis</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Tanggal Pengawasan
                  </label>
                  <input
                    type="date"
                    value={editTanggal}
                    onChange={(e) => setEditTanggal(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Row 2: Objek & Nama Produsen */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Nama Objek Pengawasan <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editNamaObjek}
                    onChange={(e) => setEditNamaObjek(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Nama Produsen / Badan Usaha <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editNamaProdusen}
                    onChange={(e) => setEditNamaProdusen(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Row 3: Nama Pemilik, No Kontak, Lokasi */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Nama Pemilik / Direktur
                  </label>
                  <input
                    type="text"
                    value={editNamaPemilik}
                    onChange={(e) => setEditNamaPemilik(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    No Kontak / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={editNoKontak}
                    onChange={(e) => setEditNoKontak(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Lokasi Kecamatan
                  </label>
                  <input
                    type="text"
                    value={editLokasi}
                    onChange={(e) => setEditLokasi(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Row 4: Kepemilikan Izin, Keabsahan Izin, Kapasitas */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Kepemilikan Izin
                  </label>
                  <select
                    value={editKepemilikanIzin}
                    onChange={(e) => setEditKepemilikanIzin(e.target.value as any)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  >
                    <option value="Memiliki">Memiliki</option>
                    <option value="Tidak Memiliki">Tidak Memiliki</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Keabsahan Izin
                  </label>
                  <select
                    value={editKeabsahanIzin}
                    onChange={(e) => setEditKeabsahanIzin(e.target.value as any)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  >
                    <option value="Sah">Sah / Aktif</option>
                    <option value="Tidak Sah">Tidak Sah / Kadaluwarsa</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Kapasitas Operasional
                  </label>
                  <input
                    type="text"
                    value={editKapasitas}
                    onChange={(e) => setEditKapasitas(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Row 5: Izin BB, Keabsahan BB, Status Verifikasi */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Izin Bahan Baku (BB)
                  </label>
                  <select
                    value={editIzinBb}
                    onChange={(e) => setEditIzinBb(e.target.value as any)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  >
                    <option value="Ada">Ada</option>
                    <option value="Tidak Ada">Tidak Ada</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Keabsahan Bahan Baku
                  </label>
                  <select
                    value={editKeabsahanBb}
                    onChange={(e) => setEditKeabsahanBb(e.target.value as any)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  >
                    <option value="Sah">Sah</option>
                    <option value="Tidak Sah">Tidak Sah</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Status Verifikasi
                  </label>
                  <select
                    value={editStatusVerifikasi}
                    onChange={(e) => setEditStatusVerifikasi(e.target.value as any)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Terverifikasi">Terverifikasi</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>
              </div>

              {/* Row 6: Dokumen & Pengawas */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Nama Berkas Dokumen Pengawasan (PDF)
                  </label>
                  <input
                    type="text"
                    value={editDokumen}
                    onChange={(e) => setEditDokumen(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Petugas Pengawas
                  </label>
                  <input
                    type="text"
                    value={editPengawas}
                    onChange={(e) => setEditPengawas(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Row 7: Temuan & Rekomendasi */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Catatan Temuan Pemeriksaan
              </label>
              <textarea
                rows={2}
                value={editCatatan}
                onChange={(e) => setEditCatatan(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "12px" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                Rekomendasi Tindak Lanjut
              </label>
              <textarea
                rows={2}
                value={editRekomendasi}
                onChange={(e) => setEditRekomendasi(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "12px" }}
              />
            </div>
          </div>
        </div>
      </ModalForm>

      {/* Verification Dialog untuk Alur Approval */}
      {verifyTarget && (
        <VerificationDialog
          isOpen={isVerifyOpen}
          onClose={() => {
            setIsVerifyOpen(false);
            setVerifyTarget(null);
          }}
          target={{
            id: verifyTarget.id,
            title: `${verifyTarget.namaObjek} (${verifyTarget.simakCode})`,
            category: `Produsen: ${verifyTarget.namaProdusen || verifyTarget.badanUsaha} • Lokasi: ${verifyTarget.lokasi}`,
            notes: `Hasil Kepatuhan: ${verifyTarget.statusKepatuhan} • Dokumen: ${verifyTarget.dokumen || verifyTarget.dokumenBAP}`,
            date: verifyTarget.tanggal || verifyTarget.tanggalAudit || ""
          }}
          onConfirm={handleConfirmVerification}
          isLoading={isVerifying}
        />
      )}

      {/* Modal Dialog Konfirmasi Hapus Data (Standar SIPJAKI: Fitur Hapus) */}
      {showDeleteDialog && deletingRecord && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              border: "1px solid #E2E8F0"
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "#FEE2E2",
                  color: "#DC2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <Trash2 style={{ width: "22px", height: "22px" }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: "0 0 6px 0" }}>
                  Konfirmasi Hapus Data Pengawasan
                </h3>
                <p style={{ fontSize: "13px", color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                  Apakah Anda yakin ingin menghapus data pengawasan untuk:
                  <strong style={{ display: "block", color: "#0F2E5C", marginTop: "4px" }}>
                    {isSimak2 
                      ? (deletingRecord.namaProyek || deletingRecord.namaObjek) 
                      : (deletingRecord.namaProdusen || deletingRecord.badanUsaha)}
                  </strong>
                  <span style={{ fontSize: "11px", color: "#64748B" }}>
                    {isSimak2
                      ? `Penyedia Jasa: ${deletingRecord.penyediaJasa || deletingRecord.namaProdusen || deletingRecord.badanUsaha} • ${deletingRecord.simakCode}`
                      : `(${deletingRecord.namaObjek} • ${deletingRecord.simakCode})`}
                  </span>
                </p>
                <p style={{ fontSize: "11px", color: "#DC2626", marginTop: "8px", fontWeight: 600 }}>
                  Tindakan ini akan dicatat ke dalam riwayat aktivitas sistem dan menghapus data pengawasan secara permanen.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeletingRecord(null);
                }}
                style={{
                  padding: "9px 16px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#FFFFFF",
                  color: "#475569",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{
                  padding: "9px 18px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#DC2626",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Trash2 style={{ width: "14px", height: "14px" }} />
                <span>Ya, Hapus Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pratinjau Dokumen Pengawasan Resmi */}
      {selectedRecordForDoc && (
        <ModalForm
          isOpen={isDocPreviewModalOpen}
          onClose={() => {
            setIsDocPreviewModalOpen(false);
            setSelectedRecordForDoc(null);
          }}
          title={`Dokumen Hasil Pengawasan Lapangan`}
          subtitle={`${selectedRecordForDoc.dokumen || selectedRecordForDoc.dokumenBAP} • ${selectedRecordForDoc.simakCode}`}
          icon={FileText}
          size="lg"
          hideFooter
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Kop Surat Resmi */}
            <div style={{ borderBottom: "2px solid #0F2E5C", paddingBottom: "12px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>
                Pemerintah Kabupaten Bogor — Dinas Pekerjaan Umum dan Penataan Ruang
              </span>
              <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#0F2E5C", margin: "4px 0" }}>
                LEMBAR DOKUMEN HASIL PENGAWASAN JASA KONSTRUKSI
              </h3>
              <span style={{ fontSize: "11px", color: "#475569" }}>
                Nomor: 600.1.2/DOK-JAKON/{selectedRecordForDoc.id}/2026 • Berdasarkan Permen PUPR No. 1/2023 & Standar SIPJAKI
              </span>
            </div>

            {/* Parameter Dokumen Details */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", backgroundColor: "#F8FAFC", padding: "14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
              <div>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700 }}>Objek Pengawasan:</span>
                <p style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", margin: "2px 0 0 0" }}>{selectedRecordForDoc.namaObjek}</p>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700 }}>Nama Produsen / Badan Usaha:</span>
                <p style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", margin: "2px 0 0 0" }}>{selectedRecordForDoc.namaProdusen || selectedRecordForDoc.badanUsaha}</p>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700 }}>Nama Pemilik & Kontak:</span>
                <p style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", margin: "2px 0 0 0" }}>
                  {selectedRecordForDoc.namaPemilik || "Penanggung Jawab"} ({selectedRecordForDoc.noKontak || "0812-3456-7890"})
                </p>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700 }}>Kualifikasi Usaha:</span>
                <p style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", margin: "2px 0 0 0" }}>{selectedRecordForDoc.kualifikasi || "Kecil"}</p>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700 }}>Wilayah Penugasan:</span>
                <p style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", margin: "2px 0 0 0" }}>
                  {selectedRecordForDoc.lokasi}, {selectedRecordForDoc.kabKota || "Kabupaten Bogor"}, {selectedRecordForDoc.propinsi || "Jawa Barat"}
                </p>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700 }}>Tanggal Pengawasan:</span>
                <p style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", margin: "2px 0 0 0" }}>{selectedRecordForDoc.tanggal || selectedRecordForDoc.tanggalAudit}</p>
              </div>
            </div>

            {/* Status Hasil Kepatuhan (Pilihan Jelas Patuh / Tidak Patuh) */}
            <div style={{ padding: "12px 14px", borderRadius: "10px", backgroundColor: selectedRecordForDoc.statusKepatuhan === "Patuh" ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${selectedRecordForDoc.statusKepatuhan === "Patuh" ? "#BBF7D0" : "#FECACA"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: selectedRecordForDoc.statusKepatuhan === "Patuh" ? "#166534" : "#991B1B" }}>
                    Hasil Evaluasi Kepatuhan Teknis:
                  </span>
                  <div style={{ fontSize: "15px", fontWeight: 900, color: selectedRecordForDoc.statusKepatuhan === "Patuh" ? "#166534" : "#991B1B", marginTop: "2px" }}>
                    Status: {selectedRecordForDoc.statusKepatuhan === "Patuh" ? "PATUH" : "TIDAK PATUH"}
                  </div>
                </div>
                <StatusBadge
                  status={selectedRecordForDoc.statusVerifikasi}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid #E2E8F0" }}>
              <span style={{ fontSize: "11px", color: "#64748B" }}>
                Petugas Pengawas: <b>{selectedRecordForDoc.pengawas}</b>
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => alert(`Mencetak dokumen resmi ${selectedRecordForDoc.dokumen || selectedRecordForDoc.dokumenBAP}...`)}
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
                  <span>Cetak Dokumen</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Mengunduh file PDF ${selectedRecordForDoc.dokumen || selectedRecordForDoc.dokumenBAP}...`)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    backgroundColor: "#0F2E5C",
                    color: "#FFFFFF",
                    border: "none",
                    fontSize: "11px",
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  <Download style={{ width: "13px", height: "13px", color: "#FFC000" }} />
                  <span>Unduh PDF</span>
                </button>
              </div>
            </div>
          </div>
        </ModalForm>
      )}

      {/* Mini Modal Upload Dokumen Susulan */}
      {docUploadTarget && (
        <DocumentUploadMiniModal
          isOpen={Boolean(docUploadTarget)}
          onClose={() => setDocUploadTarget(null)}
          title={`Unggah Dokumen — ${docUploadTarget.namaObjek}`}
          subtitle={`${docUploadTarget.simakCode} • ${docUploadTarget.namaProdusen || docUploadTarget.badanUsaha} • ${docUploadTarget.lokasi}`}
          documentFields={TEMPLATE_PELAKSANAAN.documentFields || [
            { key: "dokumen", label: "Dokumen Pengawasan Lapangan", accept: ".pdf", maxSizeMb: 10, required: true }
          ]}
          currentValues={{ dokumen: docUploadTarget.dokumen || docUploadTarget.dokumenBAP || null }}
          onSave={handleSaveUploadedDoc}
        />
      )}

      {/* Batch Import Modal */}
      <BatchImportModal
        isOpen={isBatchImportOpen}
        onClose={() => setIsBatchImportOpen(false)}
        title={`Import Batch Pengawasan SIMAK (${config.shortTitle})`}
        subtitle="Unggah spreadsheet data hasil pengawasan SIMAK sekaligus (Dokumen dapat disusulkan)"
        templateFileName={`${TEMPLATE_PELAKSANAAN.exportFileName}_template.xlsx`}
        expectedColumns={TEMPLATE_PELAKSANAAN.importColumns}
        sampleRows={TEMPLATE_PELAKSANAAN.sampleRows}
        template={TEMPLATE_PELAKSANAAN}
        onCommit={handleBatchCommit}
      />
    </div>
  );
}

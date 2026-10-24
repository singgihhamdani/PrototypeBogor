"use client";
import { useState, useEffect } from "react";
import { 
  Building2, Search, Plus, Download, Eye, ChevronRight, 
  Award, ShieldCheck, Filter, FileSpreadsheet, Database as DbIcon,
  CheckCircle2, AlertTriangle, Loader2, Sparkles
} from "lucide-react";
import Link from "next/link";
import { exportToSpreadsheet } from "@/lib/export-utils";
import { TEMPLATE_BUJK } from "@/lib/sipjaki-templates";
import BatchImportModal from "@/components/common/batch-import-modal";
import { ModalForm } from "@/components/common";
import { 
  fetchBUJKList, createBUJK, batchInsertBUJK, 
  BUJKItem, DataSourceStatus 
} from "@/lib/services/master-data";
import { createClient } from "@/lib/supabase/client";

export default function BUJKPage() {
  const [bujkList, setBujkList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState<DataSourceStatus>({ 
    source: "fallback", 
    message: "Menghubungkan ke basis data..." 
  });
  const [search, setSearch] = useState("");
  const [filterQual, setFilterQual] = useState("Semua");
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State untuk Tambah BUJK Baru
  const [newBujk, setNewBujk] = useState({
    name: "",
    type: "PT",
    nib: "",
    npwp: "",
    leader: "",
    qualification: "Kecil",
    district: "Cibinong",
    address: "",
    phone: "",
    email: "",
    sbuCount: 1,
    sbuExpiry: "2027-12-31"
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchBUJKList();
      // Format data untuk tabel UI
      const formatted = res.data.map((item) => ({
        id: item.id,
        name: item.nama_badan_usaha,
        type: item.bentuk_usaha,
        nib: item.nib,
        npwp: item.npwp,
        leader: item.penanggung_jawab,
        qualification: item.kualifikasi,
        district: item.kecamatan,
        districtId: item.kode_kecamatan || "01",
        sbuCount: item.jumlah_sbu,
        status: item.status_verifikasi,
        phone: item.telepon || "-",
        email: item.email || "-",
        address: item.alamat,
        sbuExpiry: item.tanggal_kedaluwarsa_sbu || "2027-12-31",
        projectsActive: item.proyek_aktif_count
      }));
      setBujkList(formatted);
      setDataStatus(res.status);
    } catch (err) {
      console.error("Gagal memuat data BUJK:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Supabase Realtime subscription untuk mendeteksi penambahan BUJK baru secara otomatis
    const client = createClient();
    if (client) {
      const channel = client
        .channel("realtime-bujk-list")
        .on("postgres_changes", { event: "*", schema: "public", table: "bujk" }, () => {
          loadData();
        })
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
  }, []);

  const filtered = bujkList.filter((b) => {
    const matchSearch = (b.name || "").toLowerCase().includes(search.toLowerCase()) || 
                        (b.nib || "").includes(search) || 
                        (b.district || "").toLowerCase().includes(search.toLowerCase()) ||
                        (b.leader || "").toLowerCase().includes(search.toLowerCase());
    const matchQual = filterQual === "Semua" || b.qualification === filterQual;
    return matchSearch && matchQual;
  });

  const stats = [
    { label: "Total BUJK Terdaftar", value: bujkList.length, sub: "Tervalidasi OSS & LPJK", color: "#0F2E5C", bg: "#EBF2FA", icon: Building2 },
    { label: "Kualifikasi Besar", value: bujkList.filter((b) => b.qualification === "Besar").length, sub: "Kualifikasi B1 & B2", color: "#1E40AF", bg: "#EFF6FF", icon: Award },
    { label: "Kualifikasi Menengah", value: bujkList.filter((b) => b.qualification === "Menengah").length, sub: "Kualifikasi M1 & M2", color: "#D97706", bg: "#FFFBEB", icon: ShieldCheck },
    { label: "Kualifikasi Kecil", value: bujkList.filter((b) => b.qualification === "Kecil").length, sub: "Kualifikasi K1, K2 & K3", color: "#059669", bg: "#ECFDF5", icon: Building2 },
  ];

  const handleBatchCommit = async (parsedData: Record<string, any>[]) => {
    const newItems = parsedData.map((d, i) => {
      const id = d.id || `B0${bujkList.length + i + 1}`;
      return {
        id,
        nama_badan_usaha: d.name || "BUJK Baru",
        bentuk_usaha: (d.type as any) || "PT",
        nib: d.nib || String(Date.now()).slice(-13),
        npwp: d.npwp || "01.234.567.8-000.000",
        penanggung_jawab: d.leader || "Pimpinan Perusahaan",
        kualifikasi: (d.qualification as any) || "Kecil",
        kecamatan: d.district || "Cibinong",
        kode_kecamatan: "01",
        alamat: d.address || "Kabupaten Bogor",
        telepon: d.phone || "081234567890",
        email: d.email || "info@bujk.co.id",
        jumlah_sbu: Number(d.sbuCount) || 1,
        tanggal_kedaluwarsa_sbu: d.sbuExpiry || "2027-12-31",
        status_verifikasi: (d.status as any) || "Aktif",
        proyek_aktif_count: 0
      };
    });

    // Simpan ke Supabase jika aktif
    await batchInsertBUJK(newItems);
    await loadData();
    setShowImportModal(false);
  };

  const handleCreateBUJK = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const generatedId = `B0${String(bujkList.length + 1).padStart(2, "0")}`;
      const payload = {
        id: generatedId,
        nama_badan_usaha: newBujk.name,
        bentuk_usaha: newBujk.type as any,
        nib: newBujk.nib,
        npwp: newBujk.npwp,
        penanggung_jawab: newBujk.leader,
        kualifikasi: newBujk.qualification as any,
        kecamatan: newBujk.district,
        kode_kecamatan: "01",
        alamat: newBujk.address,
        telepon: newBujk.phone,
        email: newBujk.email,
        jumlah_sbu: Number(newBujk.sbuCount) || 1,
        tanggal_kedaluwarsa_sbu: newBujk.sbuExpiry,
        status_verifikasi: "Aktif" as any,
        proyek_aktif_count: 0
      };

      const res = await createBUJK(payload);
      if (res.success) {
        setShowAddModal(false);
        setNewBujk({
          name: "",
          type: "PT",
          nib: "",
          npwp: "",
          leader: "",
          qualification: "Kecil",
          district: "Cibinong",
          address: "",
          phone: "",
          email: "",
          sbuCount: 1,
          sbuExpiry: "2027-12-31"
        });
        await loadData();
      } else {
        alert(res.error || "Gagal menyimpan BUJK baru");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 10px", borderRadius: "9999px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Pilar 1: Tertib Usaha
            </span>

            {/* Indikator Status Database */}
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

          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Master Data BUJK Kabupaten Bogor
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
            Pangkalan data Badan Usaha Jasa Konstruksi yang beroperasi dan berdomisili di 40 Kecamatan
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Tombol Import Excel */}
          <button 
            type="button"
            onClick={() => setShowImportModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "12px",
              backgroundColor: "#ECFDF5",
              border: "1px solid #A7F3D0",
              padding: "10px 18px",
              fontSize: "12px",
              fontWeight: 800,
              color: "#065F46",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}
          >
            <FileSpreadsheet style={{ width: "16px", height: "16px", color: "#059669" }} />
            <span>Import Excel</span>
          </button>

          {/* Tombol Export */}
          <button 
            type="button"
            onClick={() => exportToSpreadsheet({
              fileName: TEMPLATE_BUJK.exportFileName,
              sheetName: TEMPLATE_BUJK.sheetName,
              columns: TEMPLATE_BUJK.columns,
              data: bujkList,
              sipjakiMode: true,
              includeDataDictionary: true,
              dictionaryItems: TEMPLATE_BUJK.dictionaryItems
            })}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #CBD5E1",
              padding: "10px 18px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#334155",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}
          >
            <Download style={{ width: "16px", height: "16px" }} />
            <span>Export SIPJAKI</span>
          </button>

          <button 
            onClick={() => setShowAddModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "12px",
              backgroundColor: "#0F2E5C",
              border: "none",
              borderBottom: "3px solid #FFC000",
              padding: "10px 20px",
              fontSize: "12px",
              fontWeight: 800,
              color: "#FFFFFF",
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(15, 46, 92, 0.2)"
            }}
          >
            <Plus style={{ width: "16px", height: "16px", color: "#FFC000" }} /> Tambah BUJK Baru
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div 
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px"
        }}
      >
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div 
              key={s.label} 
              style={{
                borderRadius: "16px",
                border: "1px solid #E2E8F0",
                borderTop: `3px solid ${s.color}`,
                backgroundColor: "#FFFFFF",
                padding: "20px",
                boxShadow: "0 2px 10px rgba(15, 46, 92, 0.04)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {s.label}
                </span>
                <div 
                  style={{
                    height: "40px",
                    width: "40px",
                    borderRadius: "10px",
                    backgroundColor: s.bg,
                    color: s.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <Icon style={{ width: "20px", height: "20px" }} />
                </div>
              </div>

              <div>
                <p style={{ fontSize: "24px", fontWeight: 900, color: s.color === "#0F2E5C" ? "#0F2E5C" : s.color, margin: 0, lineHeight: 1.2, whiteSpace: "nowrap" }}>
                  {loading ? "..." : `${s.value} BUJK`}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
                  <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: s.color }} />
                  <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>
                    {s.sub}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
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
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94A3B8" }} />
          <input
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama BUJK, NIB, Direktur, atau Kecamatan..."
            style={{
              width: "100%",
              height: "40px",
              borderRadius: "10px",
              border: "1px solid #CBD5E1",
              backgroundColor: "#F8FAFC",
              paddingLeft: "40px",
              paddingRight: "16px",
              fontSize: "12px",
              color: "#0F172A",
              outline: "none"
            }}
          />
        </div>

        {/* Qualification Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#F1F5F9", padding: "4px", borderRadius: "10px" }}>
          {["Semua", "Besar", "Menengah", "Kecil"].map((q) => {
            const isSelected = filterQual === q;
            return (
              <button
                key={q}
                onClick={() => setFilterQual(q)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: isSelected ? "#0F2E5C" : "transparent",
                  color: isSelected ? "#FFFFFF" : "#475569",
                  transition: "all 0.15s ease"
                }}
              >
                {q}
              </button>
            );
          })}
        </div>
      </div>

      {/* Enterprise Data Table */}
      <div 
        style={{
          borderRadius: "18px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0", textAlign: "left" }}>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px", width: "50px" }}>NO</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>NAMA BADAN USAHA & PIMPINAN</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>BENTUK</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>NIB</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>KUALIFIKASI</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>KECAMATAN</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>SBU AKTIF</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>STATUS</th>
                <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px", textAlign: "center" }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: "36px", textAlign: "center", color: "#64748B" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                      <Loader2 style={{ width: "20px", height: "20px", animation: "spin 1s linear infinite" }} />
                      <span style={{ fontWeight: 600 }}>Memuat data BUJK dari {dataStatus.message}...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: "36px", textAlign: "center", color: "#64748B" }}>
                    Tidak ada data BUJK yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((b, i) => (
                  <tr 
                    key={b.id} 
                    style={{ borderBottom: "1px solid #F1F5F9", transition: "background-color 0.15s ease" }}
                  >
                    <td style={{ padding: "16px 18px", color: "#64748B", fontWeight: 600 }}>
                      {i + 1}
                    </td>

                    <td style={{ padding: "16px 18px" }}>
                      <Link href={`/bujk/${b.id}`} style={{ fontWeight: 800, color: "#0F172A", textDecoration: "none", fontSize: "13px" }}>
                        {b.name}
                      </Link>
                      <span style={{ display: "block", fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                        Penanggung Jawab: {b.leader}
                      </span>
                    </td>

                    <td style={{ padding: "16px 18px" }}>
                      <span style={{ fontWeight: 700, backgroundColor: "#F1F5F9", color: "#334155", padding: "4px 8px", borderRadius: "6px", fontSize: "11px" }}>
                        {b.type}
                      </span>
                    </td>

                    <td style={{ padding: "16px 18px", fontFamily: "monospace", fontSize: "12px", color: "#334155", fontWeight: 600 }}>
                      {b.nib}
                    </td>

                    <td style={{ padding: "16px 18px" }}>
                      <span 
                        style={{
                          display: "inline-block",
                          borderRadius: "9999px",
                          padding: "4px 12px",
                          fontSize: "11px",
                          fontWeight: 800,
                          backgroundColor: b.qualification === "Besar" ? "#EFF6FF" : b.qualification === "Menengah" ? "#FFFBEB" : "#ECFDF5",
                          color: b.qualification === "Besar" ? "#1E40AF" : b.qualification === "Menengah" ? "#B45309" : "#059669"
                        }}
                      >
                        {b.qualification}
                      </span>
                    </td>

                    <td style={{ padding: "16px 18px", color: "#334155", fontWeight: 600 }}>
                      {b.district}
                    </td>

                    <td style={{ padding: "16px 18px" }}>
                      <span style={{ fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "4px 10px", borderRadius: "8px", fontSize: "12px" }}>
                        {b.sbuCount} SBU
                      </span>
                    </td>

                    <td style={{ padding: "16px 18px" }}>
                      <span 
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          borderRadius: "9999px",
                          padding: "4px 10px",
                          fontSize: "11px",
                          fontWeight: 700,
                          backgroundColor: b.status === "Aktif" ? "#ECFDF5" : "#FFFBEB",
                          color: b.status === "Aktif" ? "#059669" : "#B45309"
                        }}
                      >
                        <span style={{ height: "6px", width: "6px", borderRadius: "9999px", backgroundColor: b.status === "Aktif" ? "#059669" : "#D97706" }} />
                        {b.status}
                      </span>
                    </td>

                    <td style={{ padding: "16px 18px", textAlign: "center" }}>
                      <Link 
                        href={`/bujk/${b.id}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "11px",
                          fontWeight: 800,
                          color: "#0F2E5C",
                          backgroundColor: "#F1F5F9",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          textDecoration: "none"
                        }}
                      >
                        <Eye style={{ width: "14px", height: "14px" }} /> Detail <ChevronRight style={{ width: "12px", height: "12px" }} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah BUJK Baru */}
      <ModalForm
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Daftarkan BUJK Baru"
        subtitle="Registrasi data Badan Usaha Jasa Konstruksi ke dalam basis data SIJAKON Kabupaten Bogor"
        icon={Building2}
        size="lg"
        isLoading={isSubmitting}
        submitLabel="Simpan ke Database"
        onSubmit={handleCreateBUJK}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={{ gridColumn: "span 2" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
              Nama Badan Usaha *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: PT. Adhi Cipta Nusantara"
              value={newBujk.name}
              onChange={(e) => setNewBujk({ ...newBujk, name: e.target.value })}
              style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "13px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
              Bentuk Usaha *
            </label>
            <select
              value={newBujk.type}
              onChange={(e) => setNewBujk({ ...newBujk, type: e.target.value })}
              style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "13px" }}
            >
              <option value="PT">PT (Perseroan Terbatas)</option>
              <option value="CV">CV (Commanditaire Vennootschap)</option>
              <option value="Firma">Firma</option>
              <option value="Koperasi">Koperasi</option>
              <option value="Perorangan">Perorangan</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
              Kualifikasi Usaha *
            </label>
            <select
              value={newBujk.qualification}
              onChange={(e) => setNewBujk({ ...newBujk, qualification: e.target.value })}
              style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "13px" }}
            >
              <option value="Kecil">Kecil (K1, K2, K3)</option>
              <option value="Menengah">Menengah (M1, M2)</option>
              <option value="Besar">Besar (B1, B2)</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
              Nomor Induk Berusaha (NIB) *
            </label>
            <input
              type="text"
              required
              placeholder="13 digit NIB OSS"
              value={newBujk.nib}
              onChange={(e) => setNewBujk({ ...newBujk, nib: e.target.value })}
              style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "13px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
              NPWP Perusahaan *
            </label>
            <input
              type="text"
              required
              placeholder="Format: 01.234.567.8-000.000"
              value={newBujk.npwp}
              onChange={(e) => setNewBujk({ ...newBujk, npwp: e.target.value })}
              style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "13px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
              Penanggung Jawab / Direktur *
            </label>
            <input
              type="text"
              required
              placeholder="Nama Lengkap Penanggung Jawab"
              value={newBujk.leader}
              onChange={(e) => setNewBujk({ ...newBujk, leader: e.target.value })}
              style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "13px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
              Kecamatan Domisili *
            </label>
            <select
              value={newBujk.district}
              onChange={(e) => setNewBujk({ ...newBujk, district: e.target.value })}
              style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "13px" }}
            >
              <option value="Cibinong">Cibinong</option>
              <option value="Gunung Putri">Gunung Putri</option>
              <option value="Cileungsi">Cileungsi</option>
              <option value="Citeureup">Citeureup</option>
              <option value="Sukaraja">Sukaraja</option>
              <option value="Parung">Parung</option>
              <option value="Ciawi">Ciawi</option>
              <option value="Bojong Gede">Bojong Gede</option>
              <option value="Kemang">Kemang</option>
              <option value="Leuwiliang">Leuwiliang</option>
              <option value="Jonggol">Jonggol</option>
            </select>
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
              Alamat Lengkap Kantor *
            </label>
            <textarea
              required
              rows={2}
              placeholder="Jalan, No, RT/RW, Kelurahan/Desa, Kecamatan..."
              value={newBujk.address}
              onChange={(e) => setNewBujk({ ...newBujk, address: e.target.value })}
              style={{ width: "100%", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "8px 12px", fontSize: "13px", resize: "vertical" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
              Telepon / WhatsApp
            </label>
            <input
              type="text"
              placeholder="08xxxxxxxxxx"
              value={newBujk.phone}
              onChange={(e) => setNewBujk({ ...newBujk, phone: e.target.value })}
              style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "13px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
              Email Perusahaan
            </label>
            <input
              type="email"
              placeholder="info@perusahaan.co.id"
              value={newBujk.email}
              onChange={(e) => setNewBujk({ ...newBujk, email: e.target.value })}
              style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid #CBD5E1", padding: "0 12px", fontSize: "13px" }}
            />
          </div>
        </div>
      </ModalForm>

      {/* Batch Import Modal BUJK */}
      <BatchImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Impor Database BUJK (SIPJAKI)"
        subtitle="Unggah berkas Excel (.xlsx) atau CSV data Badan Usaha Jasa Konstruksi Kabupaten Bogor"
        templateFileName={TEMPLATE_BUJK.exportFileName}
        expectedColumns={TEMPLATE_BUJK.importColumns}
        sampleRows={TEMPLATE_BUJK.sampleRows}
        template={TEMPLATE_BUJK}
        onCommit={handleBatchCommit}
      />
    </div>
  );
}

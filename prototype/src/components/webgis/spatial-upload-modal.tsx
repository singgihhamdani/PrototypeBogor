"use client";
import { useState, useRef, useId } from "react";
import dynamic from "next/dynamic";
import { 
  X, UploadCloud, MapPin, FileSpreadsheet, Download, 
  CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, 
  Loader2, Globe, Layers, Navigation, ChevronRight, Check
} from "lucide-react";
import districtsData from "@/data/districts.json";
import { 
  validateBogorCoordinates, 
  parseSpatialExcel, 
  parseSpatialCSV, 
  parseSpatialGeoJSON, 
  parseSpatialKML, 
  downloadSpatialTemplateExcel, 
  ParsedSpatialRecord 
} from "@/lib/spatial-utils";
import { 
  createPaket, 
  batchInsertPaket, 
  createBUJK, 
  batchInsertBUJK,
  PaketInsert,
  BUJKInsert
} from "@/lib/services/master-data";
import { formatCurrency } from "@/lib/utils";

// Dynamic import untuk Leaflet Mini Map Picker
const MiniMapPicker = dynamic(() => import("./mini-map-picker"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "340px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", gap: "10px", color: "#64748B" }}>
      <Loader2 style={{ width: "24px", height: "24px", animation: "spin 1s linear infinite", color: "#0F2E5C" }} />
      <span style={{ fontSize: "12px", fontWeight: 600 }}>Memuat Peta Pemilihan Titik...</span>
    </div>
  )
});

interface SpatialUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPoints: { lat: number; lng: number; name: string }[], layer: "projects" | "bujk") => void;
  initialLayer?: "projects" | "bujk";
}

export default function SpatialUploadModal({
  isOpen,
  onClose,
  onSuccess,
  initialLayer = "projects"
}: SpatialUploadModalProps) {
  const [activeTab, setActiveTab] = useState<"file" | "pinpoint">("file");
  const [targetLayer, setTargetLayer] = useState<"projects" | "bujk">(initialLayer);

  // State Tab 1: Upload File
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedRecords, setParsedRecords] = useState<ParsedSpatialRecord[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Tab 2: Pinpoint Form
  const [pinName, setPinName] = useState("");
  const [pinCategory, setPinCategory] = useState("Jalan dan Jembatan");
  const [pinDistrictId, setPinDistrictId] = useState("01"); // Default Cibinong
  const [pinAddress, setPinAddress] = useState("");
  const [pinValue, setPinValue] = useState<number>(1500000000);
  const [pinContractor, setPinContractor] = useState("");
  const [pinSource, setPinSource] = useState<"APBD" | "DAK" | "APBN" | "Bantuan Keuangan">("APBD");
  const [pinProgress, setPinProgress] = useState<number>(35);
  const [pinLat, setPinLat] = useState<number>(-6.4816);
  const [pinLng, setPinLng] = useState<number>(106.8516);
  const [pinBasemap, setPinBasemap] = useState<"osm" | "satellite">("osm");
  const [isLocating, setIsLocating] = useState(false);

  // State Saving
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Selected district info untuk Pinpoint
  const currentDistrict = districtsData.find((d) => d.id === pinDistrictId) || districtsData[0];

  // Geofence status untuk Pinpoint real-time
  const pinValidation = validateBogorCoordinates(pinLat, pinLng);

  // Handler Ganti Kecamatan -> Otomatis Pusatkan Pin ke Centroid Kecamatan
  const handleDistrictChange = (distId: string) => {
    setPinDistrictId(distId);
    const dist = districtsData.find((d) => d.id === distId);
    if (dist) {
      setPinLat(dist.lat);
      setPinLng(dist.lng);
    }
  };

  // Handler GPS Terkini
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Perangkat Anda tidak mendukung fitur Geolocation.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const curLat = parseFloat(pos.coords.latitude.toFixed(6));
        const curLng = parseFloat(pos.coords.longitude.toFixed(6));
        setPinLat(curLat);
        setPinLng(curLng);
      },
      (err) => {
        setIsLocating(false);
        alert(`Gagal mendeteksi lokasi GPS: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handler Parsing File
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsParsing(true);
    setParseError(null);
    setParsedRecords([]);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      let records: ParsedSpatialRecord[] = [];

      if (ext === "xlsx" || ext === "xls") {
        records = await parseSpatialExcel(file, targetLayer);
      } else if (ext === "csv") {
        const text = await file.text();
        records = parseSpatialCSV(text, targetLayer);
      } else if (ext === "geojson" || ext === "json") {
        const text = await file.text();
        records = parseSpatialGeoJSON(text, targetLayer);
      } else if (ext === "kml") {
        const text = await file.text();
        records = parseSpatialKML(text, targetLayer);
      } else {
        throw new Error(`Format file .${ext} belum didukung. Harap gunakan format .xlsx, .csv, .geojson, atau .kml.`);
      }

      setParsedRecords(records);
    } catch (err: any) {
      console.error("Error parsing file:", err);
      setParseError(err.message || "Gagal memproses berkas spasial.");
    } finally {
      setIsParsing(false);
    }
  };

  // Handler Tukar Koordinat Terbalik Otomatis
  const handleAutoSwapCoordinates = () => {
    const updated = parsedRecords.map((rec) => {
      if (rec.validation.status === "SWAPPED" && rec.validation.correctedLat && rec.validation.correctedLng) {
        const newLat = rec.validation.correctedLat;
        const newLng = rec.validation.correctedLng;
        return {
          ...rec,
          lat: newLat,
          lng: newLng,
          validation: validateBogorCoordinates(newLat, newLng)
        };
      }
      return rec;
    });
    setParsedRecords(updated);
  };

  // Hitung Metrik Pratinjau
  const validRecords = parsedRecords.filter((r) => r.validation.isValid);
  const swappedCount = parsedRecords.filter((r) => r.validation.status === "SWAPPED").length;
  const outOfBoundsCount = parsedRecords.filter((r) => r.validation.status === "OUT_OF_BOUNDS" || r.validation.status === "INVALID").length;

  // Handler Simpan Data dari Tab 1 (File Upload Batch)
  const handleSaveUploadedBatch = async () => {
    if (validRecords.length === 0) {
      alert("Tidak ada baris data koordinat valid di Kabupaten Bogor yang dapat disimpan.");
      return;
    }

    setIsSaving(true);
    try {
      if (targetLayer === "projects") {
        const itemsToInsert: PaketInsert[] = validRecords.map((r, idx) => ({
          id: `P-SPATIAL-${Date.now()}-${idx + 1}`,
          nama_paket: r.name,
          tahun_anggaran: 2026,
          sumber_dana: (r.source as any) || "APBD",
          nama_instansi: "Dinas PUPR Kabupaten Bogor",
          nama_penyedia: r.contractor || "Rekanan Terdaftar",
          nilai_kontrak: r.contractValue || 1000000000,
          jenis_kontrak: "Harga Satuan",
          sifat_kontrak: "Tahun Tunggal",
          karakteristik_kontrak: "Tahun Tunggal",
          tanggal_mulai: "2026-02-01",
          tanggal_selesai: "2026-11-30",
          progres_fisik: r.physProgress || 0,
          progres_keuangan: Math.max(0, (r.physProgress || 0) - 5),
          bulan_progres: "Maret",
          status_pekerjaan: (r.physProgress || 0) >= 100 ? "Selesai" : "Pelaksanaan",
          kode_kecamatan: r.districtId,
          kecamatan: r.district,
          lat: r.lat,
          lng: r.lng,
          propinsi: "Jawa Barat",
          kab_kota: "Kabupaten Bogor"
        }));

        const res = await batchInsertPaket(itemsToInsert);
        if (!res.success) {
          throw new Error(res.error || "Gagal menyimpan batch paket pekerjaan.");
        }
      } else {
        const bujkToInsert: BUJKInsert[] = validRecords.map((r, idx) => ({
          id: `B-SPATIAL-${Date.now()}-${idx + 1}`,
          nama_badan_usaha: r.name,
          bentuk_usaha: (r.category as any) || "PT",
          nib: r.nib || `912000${Date.now()}${idx}`.slice(0, 13),
          npwp: "01.234.567.8-403.000",
          penanggung_jawab: r.contractor || "Pimpinan Perusahaan",
          kualifikasi: r.qualification || "Kecil",
          kecamatan: r.district,
          kode_kecamatan: r.districtId,
          alamat: r.address || "Kabupaten Bogor",
          telepon: "021-8750000",
          status_verifikasi: "Aktif",
          jumlah_sbu: 2,
          tanggal_kedaluwarsa_sbu: "2028-12-31"
        }));

        const res = await batchInsertBUJK(bujkToInsert);
        if (!res.success) {
          throw new Error(res.error || "Gagal menyimpan batch BUJK.");
        }
      }

      setSaveSuccessMsg(`Berhasil menyimpan ${validRecords.length} titik spasial baru ke database!`);
      setTimeout(() => {
        onSuccess(
          validRecords.map((r) => ({ lat: r.lat, lng: r.lng, name: r.name })),
          targetLayer
        );
        onClose();
      }, 1000);
    } catch (err: any) {
      alert(`Gagal menyimpan data spasial: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handler Simpan dari Tab 2 (Pinpoint Single)
  const handleSavePinpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinName.trim()) {
      alert("Nama paket atau objek tidak boleh kosong.");
      return;
    }
    if (!pinValidation.isValid) {
      alert(`Koordinat tidak valid untuk wilayah Kabupaten Bogor: ${pinValidation.message}`);
      return;
    }

    setIsSaving(true);
    try {
      if (targetLayer === "projects") {
        const newPaket: PaketInsert = {
          id: `P-PIN-${Date.now()}`,
          nama_paket: pinName.trim(),
          tahun_anggaran: 2026,
          sumber_dana: pinSource,
          nama_instansi: "Dinas PUPR Kabupaten Bogor",
          nama_penyedia: pinContractor.trim() || "Penyedia Jasa Terdaftar",
          nilai_kontrak: Number(pinValue) || 1000000000,
          jenis_kontrak: "Harga Satuan",
          sifat_kontrak: "Tahun Tunggal",
          karakteristik_kontrak: "Tahun Tunggal",
          tanggal_mulai: "2026-03-01",
          tanggal_selesai: "2026-12-15",
          progres_fisik: Number(pinProgress) || 0,
          progres_keuangan: Math.max(0, (Number(pinProgress) || 0) - 5),
          bulan_progres: "Maret",
          status_pekerjaan: Number(pinProgress) >= 100 ? "Selesai" : "Pelaksanaan",
          kode_kecamatan: pinDistrictId,
          kecamatan: currentDistrict.name,
          lat: pinLat,
          lng: pinLng,
          propinsi: "Jawa Barat",
          kab_kota: "Kabupaten Bogor"
        };

        const res = await createPaket(newPaket);
        if (!res.success) {
          throw new Error(res.error || "Gagal menyimpan paket pekerjaan.");
        }
      } else {
        const newBUJK: BUJKInsert = {
          id: `B-PIN-${Date.now()}`,
          nama_badan_usaha: pinName.trim(),
          bentuk_usaha: (pinCategory as any) || "PT",
          nib: `912000${Date.now()}`.slice(0, 13),
          npwp: "01.234.567.8-403.000",
          penanggung_jawab: pinContractor.trim() || "Direktur Utama",
          kualifikasi: "Kecil",
          kecamatan: currentDistrict.name,
          kode_kecamatan: pinDistrictId,
          alamat: pinAddress.trim() || `Kecamatan ${currentDistrict.name}, Kabupaten Bogor`,
          telepon: "021-8750000",
          status_verifikasi: "Aktif",
          jumlah_sbu: 2,
          tanggal_kedaluwarsa_sbu: "2028-12-31"
        };

        const res = await createBUJK(newBUJK);
        if (!res.success) {
          throw new Error(res.error || "Gagal menyimpan BUJK.");
        }
      }

      setSaveSuccessMsg(`Titik "${pinName}" berhasil disimpan dan diplotkan ke WebGIS!`);
      setTimeout(() => {
        onSuccess([{ lat: pinLat, lng: pinLng, name: pinName }], targetLayer);
        onClose();
      }, 1000);
    } catch (err: any) {
      alert(`Gagal menyimpan titik spasial: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(15, 23, 42, 0.65)",
      backdropFilter: "blur(4px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px"
    }}>
      <div style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
        width: "100%",
        maxWidth: "960px",
        maxHeight: "92vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid #E2E8F0"
      }}>
        {/* Header Modal */}
        <div style={{
          backgroundColor: "#0F2E5C",
          color: "#FFFFFF",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "3px solid #FFC000"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              backgroundColor: "rgba(255, 192, 0, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255, 192, 0, 0.4)"
            }}>
              <MapPin style={{ width: "20px", height: "20px", color: "#FFC000" }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, letterSpacing: "-0.01em" }}>
                Upload Data & Plot Titik Spasial WebGIS
              </h3>
              <p style={{ margin: "2px 0 0 0", fontSize: "11.5px", color: "#CBD5E1" }}>
                Penambahan data sebaran geospasial Kabupaten Bogor via file upload atau plotting interaktif
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: "#FFFFFF",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        {/* Tab & Layer Switcher Bar */}
        <div style={{
          backgroundColor: "#F8FAFC",
          padding: "12px 20px",
          borderBottom: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          {/* Navigasi Tab */}
          <div style={{ display: "flex", gap: "6px", backgroundColor: "#E2E8F0", padding: "3px", borderRadius: "8px" }}>
            <button
              type="button"
              onClick={() => setActiveTab("file")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "6px",
                border: "none",
                fontSize: "12.5px",
                fontWeight: 700,
                cursor: "pointer",
                backgroundColor: activeTab === "file" ? "#FFFFFF" : "transparent",
                color: activeTab === "file" ? "#0F2E5C" : "#64748B",
                boxShadow: activeTab === "file" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              <FileSpreadsheet style={{ width: "15px", height: "15px", color: activeTab === "file" ? "#059669" : "#64748B" }} />
              <span>1. Upload File (.xlsx / .csv / .geojson / .kml)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("pinpoint")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "6px",
                border: "none",
                fontSize: "12.5px",
                fontWeight: 700,
                cursor: "pointer",
                backgroundColor: activeTab === "pinpoint" ? "#FFFFFF" : "transparent",
                color: activeTab === "pinpoint" ? "#0F2E5C" : "#64748B",
                boxShadow: activeTab === "pinpoint" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              <Navigation style={{ width: "15px", height: "15px", color: activeTab === "pinpoint" ? "#2563EB" : "#64748B" }} />
              <span>2. Plot Titik Interaktif (Pinpoint)</span>
            </button>
          </div>

          {/* Layer Target Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>Target Layer:</span>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                type="button"
                onClick={() => setTargetLayer("projects")}
                style={{
                  padding: "5px 10px",
                  borderRadius: "6px",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  border: targetLayer === "projects" ? "1px solid #0F2E5C" : "1px solid #CBD5E1",
                  backgroundColor: targetLayer === "projects" ? "#0F2E5C" : "#FFFFFF",
                  color: targetLayer === "projects" ? "#FFFFFF" : "#475569",
                  cursor: "pointer"
                }}
              >
                Paket Pekerjaan
              </button>
              <button
                type="button"
                onClick={() => setTargetLayer("bujk")}
                style={{
                  padding: "5px 10px",
                  borderRadius: "6px",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  border: targetLayer === "bujk" ? "1px solid #0F2E5C" : "1px solid #CBD5E1",
                  backgroundColor: targetLayer === "bujk" ? "#0F2E5C" : "#FFFFFF",
                  color: targetLayer === "bujk" ? "#FFFFFF" : "#475569",
                  cursor: "pointer"
                }}
              >
                Sebaran BUJK
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {/* Notification Sukses Simpan */}
          {saveSuccessMsg && (
            <div style={{
              backgroundColor: "#ECFDF5",
              border: "1px solid #A7F3D0",
              color: "#065F46",
              padding: "12px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "16px"
            }}>
              <CheckCircle2 style={{ width: "20px", height: "20px", color: "#059669", flexShrink: 0 }} />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 1: UPLOAD FILE SPASIAL & TABULAR */}
          {/* =================================================================== */}
          {activeTab === "file" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Dropzone & Template Card */}
              <div style={{
                border: "2px dashed #CBD5E1",
                borderRadius: "10px",
                padding: "24px 20px",
                textAlign: "center",
                backgroundColor: "#F8FAFC",
                position: "relative",
                transition: "border-color 0.2s"
              }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.geojson,.json,.kml"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="spatial-file-input"
                />

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "#E2E8F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#0F2E5C"
                  }}>
                    <UploadCloud style={{ width: "24px", height: "24px" }} />
                  </div>

                  <div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 800, color: "#0F172A" }}>
                      Tarik & Letakkan File Spasial atau Klik untuk Memilih
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#64748B" }}>
                      Mendukung format: <strong style={{ color: "#0F2E5C" }}>Excel (.xlsx), CSV, GeoJSON (.geojson), dan Google Earth (.kml)</strong>
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        backgroundColor: "#0F2E5C",
                        color: "#FFFFFF",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <UploadCloud style={{ width: "14px", height: "14px" }} />
                      <span>Pilih Berkas Dari Komputer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadSpatialTemplateExcel(targetLayer)}
                      style={{
                        backgroundColor: "#FFFFFF",
                        color: "#059669",
                        border: "1px solid #A7F3D0",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                      }}
                    >
                      <Download style={{ width: "14px", height: "14px" }} />
                      <span>Unduh Template Excel Contoh</span>
                    </button>
                  </div>
                </div>

                {uploadedFile && (
                  <div style={{
                    marginTop: "16px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "#EFF6FF",
                    border: "1px solid #BFDBFE",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "#1E40AF"
                  }}>
                    <FileSpreadsheet style={{ width: "14px", height: "14px" }} />
                    <span>Berkas Terpilih: <strong>{uploadedFile.name}</strong> ({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}
              </div>

              {/* Loading Indicator */}
              {isParsing && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "20px", color: "#64748B", fontSize: "13px", fontWeight: 600 }}>
                  <Loader2 style={{ width: "20px", height: "20px", animation: "spin 1s linear infinite", color: "#0F2E5C" }} />
                  <span>Memvalidasi koordinat spasial terhadap batas Kabupaten Bogor...</span>
                </div>
              )}

              {/* Error Box */}
              {parseError && (
                <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", padding: "12px 16px", borderRadius: "8px", display: "flex", alignItems: "flex-start", gap: "10px", color: "#991B1B", fontSize: "12.5px" }}>
                  <AlertCircle style={{ width: "18px", height: "18px", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <strong>Gagal membaca file:</strong> {parseError}
                  </div>
                </div>
              )}

              {/* Preview Hasil Parsing */}
              {parsedRecords.length > 0 && !isParsing && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {/* Summary Metric Strip */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: "10px"
                  }}>
                    <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "10px 14px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}>Total Titik Dibaca</span>
                      <p style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: 900, color: "#0F172A" }}>{parsedRecords.length}</p>
                    </div>

                    <div style={{ backgroundColor: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: "8px", padding: "10px 14px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#065F46" }}>Valid di Kab. Bogor</span>
                      <p style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: 900, color: "#059669" }}>{validRecords.length}</p>
                    </div>

                    <div style={{ backgroundColor: swappedCount > 0 ? "#FEF3C7" : "#F8FAFC", border: swappedCount > 0 ? "1px solid #FDE68A" : "1px solid #E2E8F0", borderRadius: "8px", padding: "10px 14px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: swappedCount > 0 ? "#92400E" : "#64748B" }}>Koordinat Terbalik</span>
                      <p style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: 900, color: swappedCount > 0 ? "#D97706" : "#64748B" }}>{swappedCount}</p>
                    </div>

                    <div style={{ backgroundColor: outOfBoundsCount > 0 ? "#FEF2F2" : "#F8FAFC", border: outOfBoundsCount > 0 ? "1px solid #FECACA" : "1px solid #E2E8F0", borderRadius: "8px", padding: "10px 14px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: outOfBoundsCount > 0 ? "#991B1B" : "#64748B" }}>Di Luar Batas Wilayah</span>
                      <p style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: 900, color: outOfBoundsCount > 0 ? "#DC2626" : "#64748B" }}>{outOfBoundsCount}</p>
                    </div>
                  </div>

                  {/* Banner Solusi Auto-Swap jika ada koordinat terbalik */}
                  {swappedCount > 0 && (
                    <div style={{
                      backgroundColor: "#FFFBEB",
                      border: "1px solid #FCD34D",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      flexWrap: "wrap"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#92400E", fontSize: "12px" }}>
                        <AlertTriangle style={{ width: "16px", height: "16px", flexShrink: 0, color: "#D97706" }} />
                        <span>Terdeteksi <strong>{swappedCount} data</strong> dengan nilai Latitude dan Longitude tertukar.</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoSwapCoordinates}
                        style={{
                          backgroundColor: "#D97706",
                          color: "#FFFFFF",
                          border: "none",
                          padding: "5px 12px",
                          borderRadius: "6px",
                          fontSize: "11.5px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <RefreshCw style={{ width: "12px", height: "12px" }} />
                        <span>Perbaiki Otomatis (Swap Koordinat)</span>
                      </button>
                    </div>
                  )}

                  {/* Tabel Pratinjau Titik Spasial */}
                  <div style={{ border: "1px solid #E2E8F0", borderRadius: "8px", overflow: "hidden" }}>
                    <div style={{ backgroundColor: "#F1F5F9", padding: "8px 12px", borderBottom: "1px solid #E2E8F0", fontSize: "12px", fontWeight: 700, color: "#334155" }}>
                      Pratinjau Data Spasial ({parsedRecords.length} Baris Terbaca)
                    </div>
                    <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11.5px" }}>
                        <thead>
                          <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569", textAlign: "left" }}>
                            <th style={{ padding: "8px 10px", width: "40px" }}>No</th>
                            <th style={{ padding: "8px 10px" }}>Nama Objek / Paket</th>
                            <th style={{ padding: "8px 10px" }}>Kecamatan</th>
                            <th style={{ padding: "8px 10px" }}>Latitude</th>
                            <th style={{ padding: "8px 10px" }}>Longitude</th>
                            <th style={{ padding: "8px 10px" }}>Status Validasi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedRecords.map((r, idx) => (
                            <tr key={r.tempId} style={{ borderBottom: "1px solid #F1F5F9" }}>
                              <td style={{ padding: "8px 10px", color: "#64748B", fontWeight: 600 }}>{idx + 1}</td>
                              <td style={{ padding: "8px 10px", fontWeight: 700, color: "#0F172A" }}>
                                {r.name}
                                <span style={{ display: "block", fontSize: "10.5px", color: "#64748B", fontWeight: 400 }}>{r.address}</span>
                              </td>
                              <td style={{ padding: "8px 10px", color: "#334155" }}>{r.district}</td>
                              <td style={{ padding: "8px 10px", fontFamily: "monospace", color: "#334155" }}>{r.lat.toFixed(5)}</td>
                              <td style={{ padding: "8px 10px", fontFamily: "monospace", color: "#334155" }}>{r.lng.toFixed(5)}</td>
                              <td style={{ padding: "8px 10px" }}>
                                {r.validation.isValid ? (
                                  <span style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "2px 8px",
                                    borderRadius: "9999px",
                                    backgroundColor: "#ECFDF5",
                                    color: "#059669",
                                    fontWeight: 700,
                                    fontSize: "10.5px"
                                  }}>
                                    <CheckCircle2 style={{ width: "12px", height: "12px" }} />
                                    Valid (Kab. Bogor)
                                  </span>
                                ) : r.validation.status === "SWAPPED" ? (
                                  <span style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "2px 8px",
                                    borderRadius: "9999px",
                                    backgroundColor: "#FEF3C7",
                                    color: "#D97706",
                                    fontWeight: 700,
                                    fontSize: "10.5px"
                                  }}>
                                    <AlertTriangle style={{ width: "12px", height: "12px" }} />
                                    Koordinat Terbalik
                                  </span>
                                ) : (
                                  <span style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "2px 8px",
                                    borderRadius: "9999px",
                                    backgroundColor: "#FEF2F2",
                                    color: "#DC2626",
                                    fontWeight: 700,
                                    fontSize: "10.5px"
                                  }}>
                                    <AlertCircle style={{ width: "12px", height: "12px" }} />
                                    Di Luar Kab. Bogor
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 2: PLOT TITIK INTERAKTIF (PINPOINT) */}
          {/* =================================================================== */}
          {activeTab === "pinpoint" && (
            <form onSubmit={handleSavePinpoint} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "20px"
              }}>
                {/* Kolom Kiri: Form Atribut Objek */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                      Nama {targetLayer === "projects" ? "Paket Pekerjaan" : "Badan Usaha (BUJK)"} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={targetLayer === "projects" ? "Contoh: Peningkatan Jalan Raya Jonggol - Cariu" : "Contoh: PT Karya Bangun Mandiri"}
                      value={pinName}
                      onChange={(e) => setPinName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid #CBD5E1",
                        fontSize: "12.5px"
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                        Kategori / Jenis
                      </label>
                      <select
                        value={pinCategory}
                        onChange={(e) => setPinCategory(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          border: "1px solid #CBD5E1",
                          fontSize: "12.5px"
                        }}
                      >
                        {targetLayer === "projects" ? (
                          <>
                            <option value="Jalan dan Jembatan">Jalan dan Jembatan</option>
                            <option value="Bangunan Gedung">Bangunan Gedung</option>
                            <option value="Irigasi dan SDA">Irigasi dan SDA</option>
                            <option value="Sanitasi dan Tata Air">Sanitasi dan Tata Air</option>
                            <option value="Lainnya">Lainnya</option>
                          </>
                        ) : (
                          <>
                            <option value="PT">PT</option>
                            <option value="CV">CV</option>
                            <option value="Firma">Firma</option>
                            <option value="Koperasi">Koperasi</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                        Kecamatan (40 Wilayah)
                      </label>
                      <select
                        value={pinDistrictId}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          border: "1px solid #CBD5E1",
                          fontSize: "12.5px"
                        }}
                      >
                        {districtsData.map((d) => (
                          <option key={d.id} value={d.id}>
                            Kec. {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                      Alamat / Lokasi Spesifik
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Jl. Raya Puncak KM 72, Kelurahan Cibinong"
                      value={pinAddress}
                      onChange={(e) => setPinAddress(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid #CBD5E1",
                        fontSize: "12.5px"
                      }}
                    />
                  </div>

                  {targetLayer === "projects" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                          Nilai Kontrak (Rp)
                        </label>
                        <input
                          type="number"
                          value={pinValue}
                          onChange={(e) => setPinValue(Number(e.target.value))}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: "6px",
                            border: "1px solid #CBD5E1",
                            fontSize: "12.5px"
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                          Sumber Dana
                        </label>
                        <select
                          value={pinSource}
                          onChange={(e) => setPinSource(e.target.value as any)}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: "6px",
                            border: "1px solid #CBD5E1",
                            fontSize: "12.5px"
                          }}
                        >
                          <option value="APBD">APBD Kab. Bogor</option>
                          <option value="DAK">DAK</option>
                          <option value="APBN">APBN</option>
                          <option value="Bantuan Keuangan">Bantuan Keuangan Provinsi</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                        {targetLayer === "projects" ? "Kontraktor Pelaksana" : "Penanggung Jawab / Direktur"}
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: PT Bangun Persada"
                        value={pinContractor}
                        onChange={(e) => setPinContractor(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: "1px solid #CBD5E1",
                          fontSize: "12.5px"
                        }}
                      />
                    </div>

                    {targetLayer === "projects" ? (
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                          Progres Fisik (%): {pinProgress}%
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={pinProgress}
                          onChange={(e) => setPinProgress(Number(e.target.value))}
                          style={{ width: "100%", height: "24px", marginTop: "6px" }}
                        />
                      </div>
                    ) : (
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                          Kualifikasi BUJK
                        </label>
                        <select
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: "6px",
                            border: "1px solid #CBD5E1",
                            fontSize: "12.5px"
                          }}
                        >
                          <option value="Kecil">Kecil</option>
                          <option value="Menengah">Menengah</option>
                          <option value="Besar">Besar</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Koordinat Input & Tombol GPS */}
                  <div style={{
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    padding: "12px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C" }}>Koordinat Geografis</span>
                      <button
                        type="button"
                        onClick={handleGetCurrentLocation}
                        disabled={isLocating}
                        style={{
                          backgroundColor: "#FFFFFF",
                          border: "1px solid #CBD5E1",
                          color: "#0F2E5C",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        {isLocating ? (
                          <Loader2 style={{ width: "12px", height: "12px", animation: "spin 1s linear infinite" }} />
                        ) : (
                          <Navigation style={{ width: "12px", height: "12px", color: "#2563EB" }} />
                        )}
                        <span>Gunakan GPS Perangkat</span>
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div>
                        <span style={{ fontSize: "10.5px", color: "#64748B", fontWeight: 600 }}>Latitude (Lintang)</span>
                        <input
                          type="number"
                          step="any"
                          value={pinLat}
                          onChange={(e) => setPinLat(parseFloat(e.target.value) || 0)}
                          style={{
                            width: "100%",
                            padding: "6px 8px",
                            borderRadius: "4px",
                            border: "1px solid #CBD5E1",
                            fontSize: "12px",
                            fontFamily: "monospace"
                          }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: "10.5px", color: "#64748B", fontWeight: 600 }}>Longitude (Bujur)</span>
                        <input
                          type="number"
                          step="any"
                          value={pinLng}
                          onChange={(e) => setPinLng(parseFloat(e.target.value) || 0)}
                          style={{
                            width: "100%",
                            padding: "6px 8px",
                            borderRadius: "4px",
                            border: "1px solid #CBD5E1",
                            fontSize: "12px",
                            fontFamily: "monospace"
                          }}
                        />
                      </div>
                    </div>

                    {/* Geofence Status Badge */}
                    <div style={{ marginTop: "8px", fontSize: "11.5px" }}>
                      {pinValidation.isValid ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#059669", fontWeight: 700 }}>
                          <CheckCircle2 style={{ width: "14px", height: "14px" }} />
                          <span>Koordinat Valid (Dalam Wilayah Kab. Bogor)</span>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#DC2626", fontWeight: 700 }}>
                          <AlertCircle style={{ width: "14px", height: "14px" }} />
                          <span>{pinValidation.message}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Peta Interaktif Mini */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>
                      Peta Interaktif Penentuan Titik:
                    </span>
                    {/* Basemap Switcher */}
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        type="button"
                        onClick={() => setPinBasemap("osm")}
                        style={{
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "10.5px",
                          fontWeight: 700,
                          border: pinBasemap === "osm" ? "1px solid #0F2E5C" : "1px solid #CBD5E1",
                          backgroundColor: pinBasemap === "osm" ? "#0F2E5C" : "#FFFFFF",
                          color: pinBasemap === "osm" ? "#FFFFFF" : "#64748B",
                          cursor: "pointer"
                        }}
                      >
                        OSM Jalan
                      </button>
                      <button
                        type="button"
                        onClick={() => setPinBasemap("satellite")}
                        style={{
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "10.5px",
                          fontWeight: 700,
                          border: pinBasemap === "satellite" ? "1px solid #0F2E5C" : "1px solid #CBD5E1",
                          backgroundColor: pinBasemap === "satellite" ? "#0F2E5C" : "#FFFFFF",
                          color: pinBasemap === "satellite" ? "#FFFFFF" : "#64748B",
                          cursor: "pointer"
                        }}
                      >
                        Satelit Esri
                      </button>
                    </div>
                  </div>

                  <div style={{ flex: 1, minHeight: "340px" }}>
                    <MiniMapPicker
                      lat={pinLat}
                      lng={pinLng}
                      basemap={pinBasemap}
                      onChangePosition={(newLat, newLng) => {
                        setPinLat(newLat);
                        setPinLng(newLng);
                      }}
                      targetName={pinName}
                    />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer Modal dengan Tombol Aksi */}
        <div style={{
          backgroundColor: "#F8FAFC",
          padding: "14px 20px",
          borderTop: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap"
        }}>
          <div style={{ fontSize: "12px", color: "#64748B" }}>
            {activeTab === "file" ? (
              <span>Data yang valid akan langsung terindeks di basis data Supabase.</span>
            ) : (
              <span>Titik baru akan langsung dipetakan dan kamera peta diarahkan ke lokasi baru.</span>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #CBD5E1",
                color: "#475569",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "12.5px",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Batalkan
            </button>

            {activeTab === "file" ? (
              <button
                type="button"
                onClick={handleSaveUploadedBatch}
                disabled={validRecords.length === 0 || isSaving}
                style={{
                  backgroundColor: validRecords.length > 0 && !isSaving ? "#059669" : "#94A3B8",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "8px 20px",
                  borderRadius: "6px",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  cursor: validRecords.length > 0 && !isSaving ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: validRecords.length > 0 ? "0 2px 4px rgba(5, 150, 105, 0.2)" : "none"
                }}
              >
                {isSaving ? (
                  <>
                    <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                    <span>Menyimpan ke Supabase...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 style={{ width: "16px", height: "16px" }} />
                    <span>Simpan {validRecords.length} Titik Valid ke WebGIS</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSavePinpoint}
                disabled={!pinName.trim() || !pinValidation.isValid || isSaving}
                style={{
                  backgroundColor: pinName.trim() && pinValidation.isValid && !isSaving ? "#0F2E5C" : "#94A3B8",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "8px 20px",
                  borderRadius: "6px",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  cursor: pinName.trim() && pinValidation.isValid && !isSaving ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: pinName.trim() && pinValidation.isValid ? "0 2px 4px rgba(15, 46, 92, 0.2)" : "none"
                }}
              >
                {isSaving ? (
                  <>
                    <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                    <span>Menyimpan Titik...</span>
                  </>
                ) : (
                  <>
                    <MapPin style={{ width: "16px", height: "16px", color: "#FFC000" }} />
                    <span>Plot & Simpan Titik ke Peta</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

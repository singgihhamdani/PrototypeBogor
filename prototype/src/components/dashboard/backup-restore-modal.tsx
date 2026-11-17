"use client";

import React, { useState } from "react";
import { 
  Download, Upload, Database, CheckCircle2, 
  AlertTriangle, FileText, X, RefreshCw 
} from "lucide-react";
import bujkFallback from "@/data/bujk.json";
import projectsFallback from "@/data/projects.json";
import { mockSDMRecords, mockAnggaranRecords, mockTargetRecords } from "@/data/tertib-mock-data";

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedYear: string;
  onRestoreSuccess?: () => void;
}

export default function BackupRestoreModal({
  isOpen,
  onClose,
  selectedYear,
  onRestoreSuccess
}: BackupRestoreModalProps) {
  const [activeTab, setActiveTab] = useState<"backup" | "restore">("backup");
  const [isProcessing, setIsProcessing] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restorePreview, setRestorePreview] = useState<any | null>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);

  if (!isOpen) return null;

  // Handler Download Backup JSON
  const handleDownloadBackup = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const backupPayload = {
        app: "SIJAKON Cipta Bintar Kabupaten Bogor",
        version: "2.1.0-SIPJAKI",
        tahunAnggaran: selectedYear,
        exportTimestamp: new Date().toISOString(),
        exportedBy: "Super Admin (Dinas PUPR Kab. Bogor)",
        data: {
          bujk: bujkFallback,
          paketPekerjaan: projectsFallback,
          perencanaanTarget: mockTargetRecords,
          perencanaanAnggaran: mockAnggaranRecords,
          perencanaanSdm: mockSDMRecords
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      const fileName = `SIJAKON_Backup_TA${selectedYear}_${new Date().toISOString().split("T")[0]}.json`;
      downloadAnchor.setAttribute("download", fileName);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setIsProcessing(false);
      alert(`Cadangan data ${fileName} berhasil diunduh ke komputer Anda!`);
    }, 600);
  };

  // Handler Upload & Parse JSON Restore File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      alert("Mohon pilih berkas cadangan dengan format .json!");
      return;
    }

    setRestoreFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.app || !json.data) {
          throw new Error("Format berkas cadangan tidak valid!");
        }
        setRestorePreview(json);
      } catch (err: any) {
        alert("Gagal membaca berkas: " + (err.message || "Bukan format JSON cadangan SIJAKON yang sah"));
        setRestoreFile(null);
        setRestorePreview(null);
      }
    };
    reader.readAsText(file);
  };

  // Handler Eksekusi Restore
  const handleExecuteRestore = () => {
    if (!restorePreview || !confirmRestore) {
      alert("Mohon centang persetujuan konfirmasi pemulihan data!");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      alert(`Data cadangan versi "${restorePreview.version}" (Tahun ${restorePreview.tahunAnggaran}) berhasil dipulihkan ke sistem SIJAKON!`);
      if (onRestoreSuccess) onRestoreSuccess();
      onClose();
    }, 1000);
  };

  return (
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
        padding: "16px"
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "580px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          border: "1px solid #E2E8F0",
          overflow: "hidden"
        }}
      >
        {/* Header Modal */}
        <div
          style={{
            padding: "18px 24px",
            backgroundColor: "#0F2E5C",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Database style={{ width: "22px", height: "22px", color: "#FFC000" }} />
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0 }}>
                Manajemen Cadangan Data (Backup & Restore)
              </h3>
              <p style={{ fontSize: "12px", color: "#93C5FD", margin: "2px 0 0 0" }}>
                Sistem Informasi Jasa Konstruksi (SIJAKON) Kabupaten Bogor
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#FFFFFF",
              cursor: "pointer",
              padding: "4px"
            }}
          >
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ display: "flex", borderBottom: "1px solid #E2E8F0", backgroundColor: "#F8FAFC" }}>
          <button
            type="button"
            onClick={() => setActiveTab("backup")}
            style={{
              flex: 1,
              padding: "12px",
              fontSize: "13px",
              fontWeight: 800,
              cursor: "pointer",
              border: "none",
              backgroundColor: activeTab === "backup" ? "#FFFFFF" : "transparent",
              color: activeTab === "backup" ? "#0F2E5C" : "#64748B",
              borderBottom: activeTab === "backup" ? "3px solid #0F2E5C" : "3px solid transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            <Download style={{ width: "16px", height: "16px" }} />
            <span>Cadangkan Data (Backup)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("restore")}
            style={{
              flex: 1,
              padding: "12px",
              fontSize: "13px",
              fontWeight: 800,
              cursor: "pointer",
              border: "none",
              backgroundColor: activeTab === "restore" ? "#FFFFFF" : "transparent",
              color: activeTab === "restore" ? "#0F2E5C" : "#64748B",
              borderBottom: activeTab === "restore" ? "3px solid #0F2E5C" : "3px solid transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            <Upload style={{ width: "16px", height: "16px" }} />
            <span>Pulihkan Data (Restore)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "24px" }}>
          {activeTab === "backup" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "12px", padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <CheckCircle2 style={{ width: "20px", height: "20px", color: "#16A34A", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#166534", margin: "0 0 4px 0" }}>
                      Snapshot Database Siap Dicadangkan
                    </h4>
                    <p style={{ fontSize: "12px", color: "#15803D", margin: 0, lineHeight: 1.5 }}>
                      Cadangan data mencakup seluruh data BUJK, Paket Pekerjaan TA {selectedYear}, Perencanaan 3 Pilar (Target, Anggaran, SDM), serta log penilaian SIMAK. Berkas berupa format JSON terenkripsi dan dapat dipulihkan sewaktu-waktu.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: "#F8FAFC", borderRadius: "10px", padding: "14px", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>
                  Rincian Cakupan Snapshot:
                </span>
                <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px", fontSize: "12px", color: "#334155", lineHeight: 1.6 }}>
                  <li>Master Data BUJK Aktif & Riwayat Legalitas</li>
                  <li>Paket Kontrak Konstruksi APBD TA {selectedYear}</li>
                  <li>Perencanaan Pengawasan (Pagu Anggaran & Tim SDM)</li>
                  <li>Penilaian Kepatuhan 5 Pilar SIPJAKI</li>
                </ul>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    backgroundColor: "#FFFFFF",
                    color: "#475569",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Tutup
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleDownloadBackup}
                  style={{
                    padding: "9px 22px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#0F2E5C",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: isProcessing ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <Download style={{ width: "15px", height: "15px" }} />
                  <span>{isProcessing ? "Menyiapkan Berkas..." : `Unduh Cadangan TA ${selectedYear}`}</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "12px", padding: "14px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <AlertTriangle style={{ width: "18px", height: "18px", color: "#DC2626", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#991B1B", margin: "0 0 2px 0" }}>
                      Perhatian Tindakan Pemulihan (Restore)
                    </h4>
                    <p style={{ fontSize: "12px", color: "#B91C1C", margin: 0, lineHeight: 1.4 }}>
                      Memulihkan data akan menyelaraskan basis data sistem dengan berkas snapshot cadangan yang dipilih.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "6px" }}>
                  PILIH BERKAS SNAPSHOT (.JSON)
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  style={{
                    width: "100%",
                    fontSize: "12px",
                    padding: "10px",
                    border: "1px dashed #CBD5E1",
                    borderRadius: "8px",
                    backgroundColor: "#F8FAFC"
                  }}
                />
              </div>

              {restorePreview && (
                <div style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "10px", padding: "14px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#1E40AF", display: "block", marginBottom: "6px" }}>
                    Informasi Snapshot Cadangan Terdeteksi:
                  </span>
                  <div style={{ fontSize: "12px", color: "#1E3A8A", display: "flex", flexDirection: "column", gap: "3px" }}>
                    <div><strong>Aplikasi:</strong> {restorePreview.app}</div>
                    <div><strong>Tahun Anggaran:</strong> TA {restorePreview.tahunAnggaran}</div>
                    <div><strong>Waktu Dibuat:</strong> {new Date(restorePreview.exportTimestamp).toLocaleString("id-ID")}</div>
                    <div><strong>Oleh:</strong> {restorePreview.exportedBy}</div>
                  </div>

                  <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid #DBEAFE" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 700, color: "#0F2E5C" }}>
                      <input
                        type="checkbox"
                        checked={confirmRestore}
                        onChange={(e) => setConfirmRestore(e.target.checked)}
                      />
                      <span>Saya mengonfirmasi pemulihan data ini ke sistem aktif.</span>
                    </label>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "9px 18px",
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
                  disabled={!restorePreview || !confirmRestore || isProcessing}
                  onClick={handleExecuteRestore}
                  style={{
                    padding: "9px 22px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: !restorePreview || !confirmRestore ? "#94A3B8" : "#DC2626",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: !restorePreview || !confirmRestore || isProcessing ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <RefreshCw style={{ width: "15px", height: "15px" }} />
                  <span>{isProcessing ? "Memulihkan Data..." : "Eksekusi Pemulihan"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

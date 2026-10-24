"use client";
import { useState, useEffect } from "react";
import { X, Building2, Save, Sparkles } from "lucide-react";

export interface OpdData {
  id: string;
  kode: string;
  nama: string;
  namaPendek: string;
  kepalaOpd?: string;
  nipKepala?: string;
  alamat?: string;
  telepon?: string;
  isActive: boolean;
  userCount?: number;
}

interface OpdFormModalProps {
  isOpen: boolean;
  opd: OpdData | null;
  onClose: () => void;
  onSave: (savedOpd: OpdData) => void;
}

export default function OpdFormModal({ isOpen, opd, onClose, onSave }: OpdFormModalProps) {
  const [formData, setFormData] = useState<OpdData>({
    id: "",
    kode: "",
    nama: "",
    namaPendek: "",
    kepalaOpd: "",
    nipKepala: "",
    alamat: "",
    telepon: "",
    isActive: true,
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (opd) {
      setFormData(opd);
    } else {
      setFormData({
        id: `opd-${Date.now().toString().slice(-4)}`,
        kode: "",
        nama: "",
        namaPendek: "",
        kepalaOpd: "",
        nipKepala: "",
        alamat: "",
        telepon: "",
        isActive: true,
      });
    }
    setError("");
  }, [opd, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kode || !formData.nama) {
      setError("Kode OPD dan Nama Lengkap wajib diisi.");
      return;
    }
    onSave(formData);
  };

  const isEdit = !!opd;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "540px",
          backgroundColor: "#FFFFFF",
          borderRadius: "18px",
          boxShadow: "0 25px 50px -12px rgba(15, 46, 92, 0.25)",
          border: "1px solid #E2E8F0",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#0F2E5C",
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "3px solid #FFC000",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 192, 0, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Building2 style={{ width: "18px", height: "18px", color: "#FFC000" }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#FFFFFF" }}>
                {isEdit ? "Edit Satuan Kerja (OPD)" : "Tambah Satuan Kerja (OPD) Baru"}
              </h3>
              <p style={{ margin: 0, fontSize: "11px", color: "rgba(255, 255, 255, 0.75)" }}>
                Pemerintah Daerah Kabupaten Bogor
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#CBD5E1",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Row 1: Kode & Nama Pendek */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>
                Kode OPD *
              </label>
              <input
                type="text"
                required
                value={formData.kode}
                onChange={(e) => setFormData({ ...formData, kode: e.target.value.toUpperCase() })}
                placeholder="Contoh: DPU, DISDIK"
                style={{
                  height: "38px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#F8FAFC",
                  padding: "0 12px",
                  fontSize: "12px",
                  fontWeight: 800,
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>
                Singkatan / Nama Pendek
              </label>
              <input
                type="text"
                value={formData.namaPendek}
                onChange={(e) => setFormData({ ...formData, namaPendek: e.target.value })}
                placeholder="Contoh: DPU"
                style={{
                  height: "38px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#F8FAFC",
                  padding: "0 12px",
                  fontSize: "12px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Row 2: Nama Lengkap OPD */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>
              Nama Resmi Organisasi Perangkat Daerah (OPD) *
            </label>
            <input
              type="text"
              required
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Contoh: Dinas Pekerjaan Umum Kabupaten Bogor"
              style={{
                height: "38px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#F8FAFC",
                padding: "0 12px",
                fontSize: "12px",
                outline: "none",
              }}
            />
          </div>

          {/* Row 3: Kepala OPD & NIP */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>
                Kepala Dinas / Badan
              </label>
              <input
                type="text"
                value={formData.kepalaOpd || ""}
                onChange={(e) => setFormData({ ...formData, kepalaOpd: e.target.value })}
                placeholder="Contoh: Drs. H. Suryanto, M.Si"
                style={{
                  height: "38px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#F8FAFC",
                  padding: "0 12px",
                  fontSize: "12px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>
                NIP Kepala Dinas
              </label>
              <input
                type="text"
                value={formData.nipKepala || ""}
                onChange={(e) => setFormData({ ...formData, nipKepala: e.target.value })}
                placeholder="196811051994031002"
                style={{
                  height: "38px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#F8FAFC",
                  padding: "0 12px",
                  fontSize: "12px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Row 4: Telepon & Alamat */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>
              Nomor Telepon Kantor
            </label>
            <input
              type="text"
              value={formData.telepon || ""}
              onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
              placeholder="(021) 8754123"
              style={{
                height: "38px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#F8FAFC",
                padding: "0 12px",
                fontSize: "12px",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>
              Alamat Kantor
            </label>
            <textarea
              rows={2}
              value={formData.alamat || ""}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              placeholder="Jl. Tegar Beriman No. 1, Cibinong, Kabupaten Bogor"
              style={{
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#F8FAFC",
                padding: "8px 12px",
                fontSize: "12px",
                outline: "none",
                resize: "none",
              }}
            />
          </div>

          {/* Status Switch */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              id="isActiveOpd"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              style={{ width: "16px", height: "16px", cursor: "pointer" }}
            />
            <label htmlFor="isActiveOpd" style={{ fontSize: "12px", fontWeight: 700, color: "#334155", cursor: "pointer" }}>
              Satuan Kerja Aktif (Dapat dipilih dalam pendaftaran pengguna & pelaporan)
            </label>
          </div>

          {error && (
            <div
              style={{
                borderRadius: "8px",
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECACA",
                padding: "8px 12px",
                fontSize: "12px",
                color: "#B91C1C",
              }}
            >
              {error}
            </div>
          )}

          {/* Footer Buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "10px",
              borderTop: "1px solid #F1F5F9",
              paddingTop: "14px",
              marginTop: "4px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                backgroundColor: "#F1F5F9",
                color: "#475569",
                fontSize: "12px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 20px",
                borderRadius: "10px",
                backgroundColor: "#0F2E5C",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 800,
                border: "none",
                borderBottom: "3px solid #FFC000",
                cursor: "pointer",
              }}
            >
              <Save style={{ width: "14px", height: "14px", color: "#FFC000" }} />
              <span>Simpan Satuan Kerja</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

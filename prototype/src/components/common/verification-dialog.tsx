"use client";
import React, { useState } from "react";
import { ShieldCheck, AlertCircle, CheckCircle2, XCircle, X } from "lucide-react";

export interface VerificationTargetInfo {
  id: string;
  title: string;
  category?: string;
  notes?: string;
  date?: string;
}

export interface VerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  target: VerificationTargetInfo | null;
  onConfirm: (decision: "sesuai" | "tidak_sesuai", notes: string) => void;
  isLoading?: boolean;
}

export default function VerificationDialog({
  isOpen,
  onClose,
  target,
  onConfirm,
  isLoading = false
}: VerificationDialogProps) {
  const [decision, setDecision] = useState<"sesuai" | "tidak_sesuai">("sesuai");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !target) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (decision === "tidak_sesuai" && !notes.trim()) {
      setError("Catatan alasan penolakan / ketidaksesuaian wajib diisi!");
      return;
    }
    setError(null);
    onConfirm(decision, notes);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        padding: "16px"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "520px",
          boxShadow: "0 24px 48px -12px rgba(15, 46, 92, 0.25)",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#0F2E5C",
            color: "#FFFFFF",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFC000"
              }}
            >
              <ShieldCheck style={{ width: "18px", height: "18px" }} />
            </div>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 800, margin: 0, color: "#FFFFFF" }}>
                Verifikasi Pengawasan SIPJAKI
              </h3>
              <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.75)" }}>
                Pemeriksaan bukti perbaikan & kepatuhan teknis
              </span>
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

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Target Info Box */}
          <div
            style={{
              backgroundColor: "#F8FAFC",
              borderRadius: "12px",
              padding: "14px",
              border: "1px solid #E2E8F0"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>
                Objek Yang Diverifikasi:
              </span>
              <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#0F2E5C", fontWeight: 700 }}>
                {target.id}
              </span>
            </div>
            <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#0F2E5C", margin: "4px 0 0 0" }}>
              {target.title}
            </h4>
            {target.notes && (
              <p style={{ fontSize: "11px", color: "#64748B", margin: "6px 0 0 0", lineHeight: 1.4 }}>
                Temuan/Keterangan: {target.notes}
              </p>
            )}
          </div>

          {/* Decision Radio Options */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "8px" }}>
              Keputusan Verifikasi:
            </label>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: decision === "sesuai" ? "2px solid #10B981" : "1px solid #E2E8F0",
                  backgroundColor: decision === "sesuai" ? "#F0FDF4" : "#FFFFFF",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <input
                  type="radio"
                  name="decision"
                  checked={decision === "sesuai"}
                  onChange={() => {
                    setDecision("sesuai");
                    setError(null);
                  }}
                  style={{ marginTop: "3px" }}
                />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle2 style={{ width: "14px", height: "14px", color: "#166534" }} />
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#166534" }}>
                      Sesuai (Terverifikasi)
                    </span>
                  </div>
                  <p style={{ fontSize: "11px", color: "#64748B", margin: "2px 0 0 0" }}>
                    Dokumen & pemenuhan di lapangan telah lengkap dan memenuhi standar ketentuan.
                  </p>
                </div>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: decision === "tidak_sesuai" ? "2px solid #EF4444" : "1px solid #E2E8F0",
                  backgroundColor: decision === "tidak_sesuai" ? "#FEF2F2" : "#FFFFFF",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <input
                  type="radio"
                  name="decision"
                  checked={decision === "tidak_sesuai"}
                  onChange={() => {
                    setDecision("tidak_sesuai");
                    setError(null);
                  }}
                  style={{ marginTop: "3px" }}
                />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <XCircle style={{ width: "14px", height: "14px", color: "#991B1B" }} />
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#991B1B" }}>
                      Tidak Sesuai / Ditolak
                    </span>
                  </div>
                  <p style={{ fontSize: "11px", color: "#64748B", margin: "2px 0 0 0" }}>
                    Bukti perbaikan belum memenuhi syarat atau terdapat pelanggaran yang belum diselesaikan.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Notes textarea */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>
              Catatan Hasil Verifikasi {decision === "tidak_sesuai" && <span style={{ color: "#EF4444" }}>*</span>}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Berikan catatan pertimbangan teknis atau alasan jika status ditolak..."
              style={{
                width: "100%",
                borderRadius: "10px",
                border: error ? "1px solid #EF4444" : "1px solid #CBD5E1",
                padding: "10px 12px",
                fontSize: "12px",
                outline: "none"
              }}
            />
          </div>

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 12px",
                borderRadius: "8px",
                backgroundColor: "#FEF2F2",
                color: "#991B1B",
                fontSize: "11px",
                fontWeight: 700
              }}
            >
              <AlertCircle style={{ width: "14px", height: "14px", flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                backgroundColor: "#F1F5F9",
                color: "#475569",
                border: "none",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                backgroundColor: "#0F2E5C",
                color: "#FFFFFF",
                border: "none",
                fontWeight: 800,
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              Simpan Verifikasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

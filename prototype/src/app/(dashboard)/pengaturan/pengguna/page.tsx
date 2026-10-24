"use client";
import Link from "next/link";
import { ArrowLeft, Users, ShieldAlert, Sparkles, Building2 } from "lucide-react";
import UserManagementView from "@/components/admin/user-management-view";

export default function PenggunaManagementPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link
            href="/pengaturan"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "8px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #CBD5E1",
              fontSize: "12px",
              fontWeight: 700,
              color: "#0F2E5C",
              textDecoration: "none",
            }}
          >
            <ArrowLeft style={{ width: "14px", height: "14px" }} />
            <span>Kembali ke Pengaturan</span>
          </Link>
          <span style={{ color: "#94A3B8" }}>/</span>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>
            Manajemen Pengguna & OPD
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "#64748B" }}>
          <Building2 style={{ width: "13px", height: "13px", color: "#0F2E5C" }} />
          <span>Pemerintah Kabupaten Bogor • Hak Akses Terpusat</span>
        </div>
      </div>

      {/* Main Content Component */}
      <UserManagementView />
    </div>
  );
}

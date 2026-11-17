"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { BrandIcon } from "@/components/ui/logo";

export default function PelaporanPage() {
  const router = useRouter();

  useEffect(() => {
    // Alihkan otomatis ke dashboard utama setelah jeda singkat
    const timer = setTimeout(() => {
      router.replace("/dashboard");
    }, 800);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "32px 16px",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "20px",
          backgroundColor: "#E0F2FE",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
          boxShadow: "0 4px 12px rgba(2, 132, 199, 0.15)"
        }}
      >
        <BrandIcon size={36} />
      </div>

      <h2
        style={{
          fontSize: "18px",
          fontWeight: 800,
          color: "#0F2E5C",
          marginBottom: "8px"
        }}
      >
        Mengalihkan ke Dashboard Utama...
      </h2>

      <p
        style={{
          fontSize: "13px",
          color: "#64748B",
          maxWidth: "480px",
          lineHeight: 1.6,
          marginBottom: "20px"
        }}
      >
        Modul <strong>Pelaporan SIPJAKI</strong> telah diintegrasikan secara terpusat langsung ke dalam <strong>Dashboard Eksekutif</strong> serta modul rekapitulasi per pilar pengawasan.
      </p>

      <button
        onClick={() => router.replace("/dashboard")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "#0F2E5C",
          color: "#FFFFFF",
          padding: "10px 20px",
          borderRadius: "12px",
          fontSize: "13px",
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(15, 46, 92, 0.2)"
        }}
      >
        <span>Buka Dashboard Sekarang</span>
        <ArrowRight style={{ width: "16px", height: "16px" }} />
      </button>
    </div>
  );
}

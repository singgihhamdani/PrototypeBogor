"use client";
import { use, useEffect, useState } from "react";
import { ArrowLeft, Building2, FileText, Award, Briefcase, MapPin, Phone, Mail, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { fetchBUJKById } from "@/lib/services/master-data";

export default function BUJKDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [bujk, setBujk] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDetail() {
      setLoading(true);
      try {
        const item = await fetchBUJKById(id);
        if (isMounted) {
          if (item) {
            setBujk({
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
            });
          } else {
            setBujk(null);
          }
        }
      } catch (err) {
        console.error("Gagal memuat detail BUJK:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDetail();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: "12px" }}>
        <Loader2 style={{ width: "28px", height: "28px", color: "#0F2E5C", animation: "spin 1s linear infinite" }} />
        <p style={{ color: "#64748B", fontSize: "14px", fontWeight: 600 }}>Memuat profil Badan Usaha...</p>
      </div>
    );
  }

  if (!bujk) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: "12px" }}>
      <Building2 style={{ width: "40px", height: "40px", color: "#CBD5E1" }} />
      <p style={{ color: "#94A3B8", fontSize: "14px", fontWeight: 600 }}>BUJK dengan ID {id} tidak ditemukan.</p>
      <Link href="/bujk" style={{ fontSize: "12px", color: "#0F2E5C", fontWeight: 700 }}>Kembali ke Daftar BUJK</Link>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <Link 
        href="/bujk" 
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
          fontWeight: 700,
          color: "#0F2E5C",
          textDecoration: "none"
        }}
      >
        <ArrowLeft style={{ width: "16px", height: "16px" }} /> Kembali ke Master Data BUJK
      </Link>

      {/* Header card */}
      <div 
        style={{
          borderRadius: "18px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          padding: "24px 28px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div 
              style={{
                height: "56px",
                width: "56px",
                borderRadius: "16px",
                backgroundColor: "#0F2E5C",
                color: "#FFC000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "20px"
              }}
            >
              {bujk.type}
            </div>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
                {bujk.name}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#64748B", fontWeight: 600 }}>NIB: {bujk.nib}</span>
                <span 
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    backgroundColor: bujk.status === "Aktif" ? "#ECFDF5" : "#FFFBEB",
                    color: bujk.status === "Aktif" ? "#059669" : "#B45309"
                  }}
                >
                  {bujk.status}
                </span>
              </div>
            </div>
          </div>

          <span 
            style={{
              fontSize: "12px",
              fontWeight: 800,
              padding: "8px 16px",
              borderRadius: "10px",
              backgroundColor: bujk.qualification === "Besar" ? "#EFF6FF" : bujk.qualification === "Menengah" ? "#FFFBEB" : "#ECFDF5",
              color: bujk.qualification === "Besar" ? "#1E40AF" : bujk.qualification === "Menengah" ? "#B45309" : "#059669",
              border: "1px solid rgba(0,0,0,0.06)"
            }}
          >
            Kualifikasi: {bujk.qualification}
          </span>
        </div>
      </div>

      {/* Info grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: "16px" }}>
        <div 
          style={{
            borderRadius: "18px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: "24px 26px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #F1F5F9", paddingBottom: "12px" }}>
            <Building2 style={{ width: "16px", height: "16px", color: "#0F2E5C" }} /> Informasi Perusahaan
          </h3>
          {[
            { label: "Pimpinan / Penanggung Jawab", value: bujk.leader, icon: Briefcase },
            { label: "Nomor NPWP Badan Usaha", value: bujk.npwp, icon: FileText },
            { label: "Kecamatan Domisili", value: `Kec. ${bujk.district}`, icon: MapPin },
            { label: "Alamat Lengkap", value: bujk.address, icon: MapPin },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <item.icon style={{ width: "16px", height: "16px", color: "#94A3B8", marginTop: "2px", flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: "11px", color: "#64748B", margin: 0, fontWeight: 600 }}>{item.label}</p>
                <p style={{ fontSize: "13px", color: "#0F172A", margin: "2px 0 0 0", fontWeight: 700 }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div 
          style={{
            borderRadius: "18px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: "24px 26px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #F1F5F9", paddingBottom: "12px" }}>
            <Award style={{ width: "16px", height: "16px", color: "#0F2E5C" }} /> Kontak & Sertifikat SBU
          </h3>
          {[
            { label: "Nomor Telepon Kantor", value: bujk.phone, icon: Phone },
            { label: "Email Korespondensi", value: bujk.email, icon: Mail },
            { label: "Jumlah SBU Aktif", value: `${bujk.sbuCount} Sertifikat Subklasifikasi`, icon: Award },
            { label: "Masa Berlaku SBU", value: formatDate(bujk.sbuExpiry), icon: Calendar },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <item.icon style={{ width: "16px", height: "16px", color: "#94A3B8", marginTop: "2px", flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: "11px", color: "#64748B", margin: 0, fontWeight: 600 }}>{item.label}</p>
                <p style={{ fontSize: "13px", color: "#0F172A", margin: "2px 0 0 0", fontWeight: 700 }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proyek Aktif */}
      <div 
        style={{
          borderRadius: "18px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          padding: "24px 28px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: "0 0 16px 0" }}>
          Paket Pekerjaan Terhubung ({bujk.projectsActive} Paket Aktif)
        </h3>
        <div style={{ textAlign: "center", padding: "32px 20px", backgroundColor: "#F8FAFC", borderRadius: "14px", border: "1px dashed #CBD5E1" }}>
          <Briefcase style={{ width: "36px", height: "36px", color: "#94A3B8", margin: "0 auto 8px auto" }} />
          <p style={{ fontSize: "13px", color: "#475569", fontWeight: 700, margin: 0 }}>Data paket konstruksi tervalidasi di modul Paket Pekerjaan</p>
          <p style={{ fontSize: "11px", color: "#94A3B8", margin: "4px 0 0 0" }}>Tersinkronisasi otomatis dengan SPSE & SIPJAKI PUPR</p>
        </div>
      </div>
    </div>
  );
}

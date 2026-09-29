"use client";
import { useState } from "react";
import { 
  Landmark, UserCheck, ShieldCheck, DollarSign, FileText, CheckCircle2, 
  RefreshCw, Building2, Phone, Mail, Sparkles, Send, Download, Check
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import opdData from "@/data/opd.json";

export default function ProfilOpdPage() {
  const [profile, setProfile] = useState(opdData);
  const [isEditing, setIsEditing] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  const handleSync = () => {
    setSyncLoading(true);
    setTimeout(() => {
      setSyncLoading(false);
      alert("Profil OPD berhasil disinkronkan langsung dengan SIPJAKI Nasional (Kementerian PUPR)!");
    }, 1200);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    alert("Perubahan Profil OPD berhasil disimpan!");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F2E5C", backgroundColor: "#EBF2FA", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Landmark style={{ width: "12px", height: "12px" }} /> Data Kelembagaan
            </span>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669", backgroundColor: "#ECFDF5", padding: "3px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <ShieldCheck style={{ width: "12px", height: "12px" }} /> {profile.sipjakiStatus.accountStatus}
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Profil OPD Penyelenggara Jasa Konstruksi
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
            Kelengkapan profil kelembagaan, personil tim pembina, pagu anggaran, dan SK Tim Pengawas SIPJAKI
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleSync}
            disabled={syncLoading}
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
            <RefreshCw style={{ width: "15px", height: "15px", color: syncLoading ? "#0F2E5C" : "#64748B" }} />
            <span>{syncLoading ? "Sinkronisasi..." : "Sinkronkan ke SIPJAKI"}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "12px",
              backgroundColor: isEditing ? "#64748B" : "#0F2E5C",
              border: "none",
              borderBottom: isEditing ? "none" : "3px solid #FFC000",
              padding: "10px 20px",
              fontSize: "12px",
              fontWeight: 800,
              color: "#FFFFFF",
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(15, 46, 92, 0.2)"
            }}
          >
            {isEditing ? "Batal Edit" : "Perbarui Profil"}
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      <div 
        style={{
          borderRadius: "16px",
          border: "1px solid #BFDBFE",
          backgroundColor: "#EFF6FF",
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div 
            style={{
              height: "44px",
              width: "44px",
              borderRadius: "12px",
              backgroundColor: "#0F2E5C",
              color: "#FFC000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <Sparkles style={{ width: "22px", height: "22px" }} />
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
              Kelengkapan Profil SIPJAKI: {profile.sipjakiStatus.completenessScore}% (Sangat Lengkap)
            </p>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "3px 0 0 0" }}>
              Sinkronisasi Terakhir: {profile.sipjakiStatus.lastSync} • Portal SIPJAKI Kementerian PUPR
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "160px", height: "10px", backgroundColor: "#DBEAFE", borderRadius: "9999px", overflow: "hidden" }}>
            <div 
              style={{ 
                width: `${profile.sipjakiStatus.completenessScore}%`, 
                height: "100%", 
                backgroundColor: "#0F2E5C", 
                borderRadius: "9999px" 
              }} 
            />
          </div>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C", fontFamily: "monospace" }}>96/100</span>
        </div>
      </div>

      {/* Main Form/Display */}
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Section 1: Identitas OPD */}
        <div 
          style={{
            borderRadius: "18px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: "24px 28px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px", marginBottom: "20px" }}>
            <div style={{ height: "32px", width: "32px", borderRadius: "8px", backgroundColor: "#EBF2FA", color: "#0F2E5C", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 style={{ width: "18px", height: "18px" }} />
            </div>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
              1. Identitas Organisasi Perangkat Daerah
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Nama Dinas / Instansi</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.agencyName}
                onChange={(e) => setProfile({...profile, agencyName: e.target.value})}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: isEditing ? "#FFFFFF" : "#F8FAFC",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#0F172A",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Pemerintah Daerah</label>
              <input
                type="text"
                disabled={!isEditing}
                value={`${profile.government} - Provinsi ${profile.province}`}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#F8FAFC",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#0F172A",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Bidang Penanggung Jawab</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.division}
                onChange={(e) => setProfile({...profile, division: e.target.value})}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: isEditing ? "#FFFFFF" : "#F8FAFC",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#0F172A",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Website Resmi</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.website}
                onChange={(e) => setProfile({...profile, website: e.target.value})}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: isEditing ? "#FFFFFF" : "#F8FAFC",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#0F172A",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Alamat Kantor</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.address}
                onChange={(e) => setProfile({...profile, address: e.target.value})}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: isEditing ? "#FFFFFF" : "#F8FAFC",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#0F172A",
                  outline: "none"
                }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Personil Kunci & Penanggung Jawab */}
        <div 
          style={{
            borderRadius: "18px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: "24px 28px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px", marginBottom: "20px" }}>
            <div style={{ height: "32px", width: "32px", borderRadius: "8px", backgroundColor: "#EBF2FA", color: "#0F2E5C", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserCheck style={{ width: "18px", height: "18px" }} />
            </div>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
              2. Personil Kunci & Penanggung Jawab SIPJAKI
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" }}>
            {/* Kepala Dinas */}
            <div style={{ borderRadius: "14px", border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748B" }}>
                Kepala Dinas
              </span>
              <div>
                <p style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0 }}>{profile.headOfAgency.name}</p>
                <p style={{ fontSize: "12px", fontFamily: "monospace", color: "#64748B", margin: "3px 0 0 0" }}>NIP. {profile.headOfAgency.nip}</p>
              </div>
              <p style={{ fontSize: "12px", color: "#475569", margin: 0, fontWeight: 600 }}>{profile.headOfAgency.position}</p>
            </div>

            {/* PIC SIPJAKI */}
            <div style={{ borderRadius: "14px", border: "1px solid #BFDBFE", backgroundColor: "#EFF6FF", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#1E40AF" }}>
                PIC SIPJAKI (Kabid)
              </span>
              <div>
                <p style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0 }}>{profile.picSipjaki.name}</p>
                <p style={{ fontSize: "12px", fontFamily: "monospace", color: "#1E40AF", margin: "3px 0 0 0" }}>NIP. {profile.picSipjaki.nip}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", color: "#475569" }}>
                <p style={{ display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                  <Phone style={{ width: "13px", height: "13px", color: "#1E40AF" }} /> {profile.picSipjaki.phone}
                </p>
                <p style={{ display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                  <Mail style={{ width: "13px", height: "13px", color: "#1E40AF" }} /> {profile.picSipjaki.email}
                </p>
              </div>
            </div>

            {/* Operator SIPJAKI */}
            <div style={{ borderRadius: "14px", border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748B" }}>
                Operator Sistem
              </span>
              <div>
                <p style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0 }}>{profile.operatorSipjaki.name}</p>
                <p style={{ fontSize: "12px", fontFamily: "monospace", color: "#64748B", margin: "3px 0 0 0" }}>NIP. {profile.operatorSipjaki.nip}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", color: "#475569" }}>
                <p style={{ display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                  <Phone style={{ width: "13px", height: "13px", color: "#94A3B8" }} /> {profile.operatorSipjaki.phone}
                </p>
                <p style={{ display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                  <Mail style={{ width: "13px", height: "13px", color: "#94A3B8" }} /> {profile.operatorSipjaki.email}
                </p>
              </div>
            </div>
          </div>

          {/* Personnel Stats Grid */}
          <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #F1F5F9", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
            <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", padding: "14px 16px", borderRadius: "12px", textAlign: "center" }}>
              <p style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0 }}>{profile.personnel.functionalSupervisors}</p>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", margin: "4px 0 0 0" }}>Pejabat Fungsional Jakon</p>
            </div>
            <div style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", padding: "14px 16px", borderRadius: "12px", textAlign: "center" }}>
              <p style={{ fontSize: "24px", fontWeight: 900, color: "#1E40AF", margin: 0 }}>{profile.personnel.certifiedInspectors}</p>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#1E40AF", margin: "4px 0 0 0" }}>Pengawas Bersertifikat SIMAK</p>
            </div>
            <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", padding: "14px 16px", borderRadius: "12px", textAlign: "center" }}>
              <p style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0 }}>{profile.personnel.adminStaff}</p>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", margin: "4px 0 0 0" }}>Staf Administrasi</p>
            </div>
            <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", padding: "14px 16px", borderRadius: "12px", textAlign: "center" }}>
              <p style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0 }}>{profile.personnel.contractStaff}</p>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", margin: "4px 0 0 0" }}>Tenaga Pendukung Lapangan</p>
            </div>
          </div>
        </div>

        {/* Section 3 & 4: SK Tim Pembina & Pagu Anggaran */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          {/* Card 3: SK Tim Pembina */}
          <div 
            style={{
              borderRadius: "18px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              padding: "24px 26px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "20px"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px", marginBottom: "16px" }}>
                <div style={{ height: "32px", width: "32px", borderRadius: "8px", backgroundColor: "#EBF2FA", color: "#0F2E5C", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FileText style={{ width: "18px", height: "18px" }} />
                </div>
                <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                  3. SK Tim Pembina & Pengawas
                </h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "#64748B", fontWeight: 600 }}>Nomor SK Bupati:</span>
                  <p style={{ fontFamily: "monospace", fontWeight: 800, color: "#0F172A", fontSize: "13px", margin: "3px 0 0 0" }}>
                    {profile.decree.number}
                  </p>
                </div>
                <div>
                  <span style={{ color: "#64748B", fontWeight: 600 }}>Tanggal Penetapan:</span>
                  <p style={{ fontWeight: 700, color: "#0F172A", margin: "3px 0 0 0" }}>
                    {profile.decree.date}
                  </p>
                </div>
                <div>
                  <span style={{ color: "#64748B", fontWeight: 600 }}>Tentang:</span>
                  <p style={{ color: "#334155", lineHeight: 1.5, margin: "3px 0 0 0" }}>
                    {profile.decree.about}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ paddingTop: "14px", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669", backgroundColor: "#ECFDF5", padding: "4px 12px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 style={{ width: "13px", height: "13px" }} /> {profile.decree.status}
              </span>
              <button
                type="button"
                onClick={() => alert("Mengunduh salinan SK Tim Pembina (PDF)...")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  borderRadius: "8px",
                  backgroundColor: "#F1F5F9",
                  color: "#0F2E5C",
                  padding: "7px 14px",
                  fontSize: "11px",
                  fontWeight: 700,
                  border: "1px solid #E2E8F0",
                  cursor: "pointer"
                }}
              >
                <Download style={{ width: "13px", height: "13px" }} /> Unduh SK (PDF)
              </button>
            </div>
          </div>

          {/* Card 4: Pagu Anggaran */}
          <div 
            style={{
              borderRadius: "18px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              padding: "24px 26px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "20px"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px", marginBottom: "16px" }}>
                <div style={{ height: "32px", width: "32px", borderRadius: "8px", backgroundColor: "#FFFBEB", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DollarSign style={{ width: "18px", height: "18px" }} />
                </div>
                <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                  4. Pagu Anggaran Pembinaan TA 2026
                </h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600 }}>Total Pagu:</span>
                  <span style={{ fontSize: "18px", fontWeight: 900, color: "#0F172A", fontFamily: "monospace" }}>
                    {formatCurrency(profile.budget2026.paguTotal)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600 }}>Realisasi per Hari Ini:</span>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "#D97706", fontFamily: "monospace" }}>
                    {formatCurrency(profile.budget2026.realization)} ({Math.round((profile.budget2026.realization / profile.budget2026.paguTotal) * 100)}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ width: "100%", height: "8px", backgroundColor: "#F1F5F9", borderRadius: "9999px", overflow: "hidden", margin: "4px 0" }}>
                  <div 
                    style={{ 
                      width: `${Math.round((profile.budget2026.realization / profile.budget2026.paguTotal) * 100)}%`, 
                      height: "100%", 
                      backgroundColor: "#D97706", 
                      borderRadius: "9999px" 
                    }} 
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "10px", borderTop: "1px solid #F1F5F9", fontSize: "12px" }}>
                  {profile.budget2026.activities.map((act) => (
                    <div key={act.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                      <span style={{ color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "260px" }}>
                        {act.name}
                      </span>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0F172A", flexShrink: 0 }}>
                        {formatCurrency(act.pagu)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ paddingTop: "12px", borderTop: "1px solid #F1F5F9" }}>
              <p style={{ fontSize: "11px", color: "#94A3B8", margin: 0 }}>
                Sumber Dana: APBD Kabupaten Bogor TA 2026 • Kode Rekening: 1.03.02.2.01
              </p>
            </div>
          </div>
        </div>

        {isEditing && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "16px", borderTop: "1px solid #E2E8F0" }}>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              style={{
                borderRadius: "12px",
                padding: "10px 20px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#64748B",
                backgroundColor: "#F1F5F9",
                border: "none",
                cursor: "pointer"
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "12px",
                backgroundColor: "#0F2E5C",
                border: "none",
                borderBottom: "3px solid #FFC000",
                padding: "10px 24px",
                fontSize: "13px",
                fontWeight: 800,
                color: "#FFFFFF",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(15, 46, 92, 0.2)"
              }}
            >
              <Send style={{ width: "15px", height: "15px" }} /> Simpan Perubahan Profil
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

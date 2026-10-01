"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowRight, Database, Scale, Zap, Newspaper,
  MapPin, Phone, Mail, Globe, ChevronRight, ChevronDown,
  Building2, HardHat, ShieldCheck, BarChart3, FileText,
  Target, Activity, TrendingUp, Users, Menu, X,
  ExternalLink, Clock, Layers, Award, Sparkles, CheckCircle2
} from "lucide-react";
import { BrandIcon } from "@/components/ui/logo";
import { AnimatedCounter } from "@/components/home/animated-counter";
import TickerMarquee from "@/components/home/ticker-marquee";
import QuickAccessCards from "@/components/home/quick-access-cards";
import VideoShowcase from "@/components/home/video-showcase";
import TestimonialSlider from "@/components/home/testimonial-slider";
import AnnouncementModal from "@/components/home/announcement-modal";
import { useAuth } from "@/lib/mock-auth";

// Dynamically import Leaflet Map to avoid SSR issues
const HomeMap = dynamic(() => import("@/components/home/home-map"), {
  ssr: false,
  loading: () => (
    <div style={{
      height: 520,
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#F1F5F9",
      color: "#1B3061",
      borderRadius: 28,
      gap: 12,
    }}>
      <div style={{ width: 40, height: 40, border: "3px solid #1B3061", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>Memuat Peta Spasial Proyek Konstruksi Kabupaten Bogor...</span>
    </div>
  ),
});

/* ────────────────────────────────────────────────────────────────────────────
   NAVIGATION & STATIC DATA
   ──────────────────────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Beranda", href: "/", active: true },
  {
    label: "Profil", href: "#", dropdown: [
      { label: "Tentang SIJAKON", href: "#challenges", desc: "Sistem pengawasan jasa konstruksi terpadu Kab. Bogor" },
      { label: "Visi & Misi DPU", href: "#challenges", desc: "Komitmen pembangunan tertib dan berstandar nasional" },
      { label: "Struktur Organisasi", href: "/dashboard", desc: "Bidang Bina Konstruksi Dinas Pekerjaan Umum" },
    ]
  },
  {
    label: "Layanan", href: "#", dropdown: [
      { label: "Dashboard Analitik", href: "/dashboard", desc: "Monitoring progres proyek fisik & keuangan 40 kecamatan" },
      { label: "WebGIS Geospasial", href: "/webgis", desc: "Peta sebaran titik proyek & konsentrasi BUJK daerah" },
      { label: "Audit Pengawasan SIMAK", href: "/pengawasan", desc: "Pemeriksaan tertib usaha, rantai pasok, dan pemanfaatan" },
      { label: "Pelatihan & Sertifikasi SKK", href: "/pelatihan", desc: "Fasilitasi bimtek SMKK & pembinaan tenaga kerja konstruksi" },
      { label: "Direktori 416 BUJK", href: "/bujk", desc: "Pangkalan data badan usaha berlisensi NIB dan SBU aktif" },
      { label: "Paket Pekerjaan Konstruksi", href: "/paket-pekerjaan", desc: "Informasi kontrak, spesifikasi teknis, dan lelang APBD" },
    ]
  },
  {
    label: "Data Jakon", href: "#", dropdown: [
      { label: "Profil 40 OPD", href: "/profil-opd", desc: "Kepatuhan pengawasan OPD pelaksana teknis se-Kabupaten" },
      { label: "Pelaporan SIPJAKI PUPR", href: "/pelaporan", desc: "Sinkronisasi 5 pilar pembinaan ke Kementerian PUPR" },
      { label: "Pencatatan K3 Konstruksi", href: "/kecelakaan", desc: "Monitoring zero fatal accident & kepatuhan SMKK daerah" },
      { label: "Regulasi & Dasar Hukum", href: "/regulasi", desc: "UU No. 2/2017, PP 14/2021 & pedoman peraturan daerah" },
    ]
  },
  { label: "Berita", href: "#news" },
];

const STATS = [
  { value: "40", label: "Kecamatan", icon: MapPin, color: "#10B981" },
  { value: "8", label: "Paket Aktif", icon: HardHat, color: "#F59E0B" },
  { value: "416", label: "BUJK Terdaftar", icon: Building2, color: "#3B82F6" },
  { value: "95%", label: "Kepatuhan", icon: ShieldCheck, color: "#8B5CF6" },
];

const CHALLENGES = [
  {
    icon: Database,
    iconBg: "rgba(27, 48, 97, 0.1)",
    iconColor: "#1B3061",
    title: "Integritas Data Real-time",
    desc: "Memastikan keaslian, integritas, dan kecepatan sinkronisasi data pengawasan dari seluruh OPD daerah langsung ke tingkat pusat tanpa disparitas waktu.",
  },
  {
    icon: Scale,
    iconBg: "rgba(245, 158, 11, 0.12)",
    iconColor: "#D97706",
    title: "Kepatuhan & Standarisasi",
    desc: "Penerapan tertib penyelenggaraan sesuai amanat UU No. 2/2017 dan PP 14/2021 secara seragam di seluruh kecamatan se-Kabupaten Bogor.",
  },
  {
    icon: Zap,
    iconBg: "rgba(16, 185, 129, 0.12)",
    iconColor: "#059669",
    title: "Efisiensi & Otomasi",
    desc: "Digitalisasi verifikasi laporan pengawasan, pelacakan kompetensi tenaga kerja, dan simplifikasi rantai pelaporan untuk rekomendasi kebijakan yang cepat.",
  },
];

const FEATURES = [
  { icon: BarChart3, title: "Dashboard Analitik", desc: "Visualisasi real-time seluruh progress proyek dan statistik pembangunan daerah." },
  { icon: Layers, title: "WebGIS Terintegrasi", desc: "Peta interaktif proyek konstruksi berbasis koordinat di 40 kecamatan." },
  { icon: FileText, title: "Pelaporan Digital", desc: "Sistem pelaporan tertib penyelenggaraan berbasis 5 tugas utama pembinaan." },
  { icon: ShieldCheck, title: "Pengawasan K3", desc: "Pencatatan insiden dan keselamatan kerja konstruksi standar SMKK nasional." },
  { icon: Users, title: "Database BUJK", desc: "Direktori badan usaha & tenaga kerja jasa konstruksi terverifikasi NIB dan SBU." },
  { icon: Award, title: "Pelatihan & Sertifikasi", desc: "Monitoring pelatihan ahli dan terampil konstruksi terpadu fasilitasi DPU." },
];

const NEWS = [
  {
    title: "Dinas PU Kab. Bogor Gelar Bimtek SMKK untuk 40 Kontraktor Lokal",
    category: "Pembinaan & Pelatihan",
    date: "18 Agustus 2026",
    excerpt: "Peningkatan kapasitas pelaku usaha jasa konstruksi dalam mengimplementasikan standar keselamatan kerja konstruksi menuju zero-incident.",
    readTime: "3 min",
  },
  {
    title: "Akselerasi Integrasi SIJAKON Bogor dengan SIPJAKI Nasional",
    category: "Teknologi & Sistem",
    date: "12 Agustus 2026",
    excerpt: "Sinkronisasi data 5 pilar pengawasan jasa konstruksi daerah ke pusat untuk mewujudkan satu data nasional Kementerian PUPR.",
    readTime: "4 min",
  },
  {
    title: "Tim Pengawas Tuntaskan Audit SIMAK Lapangan Tahap II",
    category: "Pengawasan",
    date: "30 Juli 2026",
    excerpt: "Sebanyak 25 paket pekerjaan strategis APBD 2026 diperiksa kesesuaian tertib penyelenggaraan dan progres fisik lapangan.",
    readTime: "5 min",
  },
  {
    title: "Forum Jasa Konstruksi Daerah Kabupaten Bogor 2026",
    category: "Kegiatan",
    date: "25 Juli 2026",
    excerpt: "Koordinasi seluruh stakeholder pembangunan daerah untuk mewujudkan tata kelola rantai pasok konstruksi yang akuntabel.",
    readTime: "3 min",
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   HOMEPAGE COMPONENT
   ──────────────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const targetRoute = user
    ? user.role === "OPERATOR_BUJK"
      ? "/portal/bujk"
      : user.role === "PESERTA_TKK"
      ? "/portal/peserta"
      : "/dashboard"
    : "/login";

  const handleNavEnter = (i: number) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(i);
  };

  const handleNavLeave = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif", color: "#0F172A", background: "#FFFFFF", overflowX: "hidden" }}>
      {/* ═══════════════════════════════════════════════════════════════════
          POPUP ANNOUNCEMENT MODAL
          ═══════════════════════════════════════════════════════════════════ */}
      <AnnouncementModal
        forceOpen={announcementModalOpen}
        onClose={() => setAnnouncementModalOpen(false)}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          FIXED TOP HEADER & TICKER
          ═══════════════════════════════════════════════════════════════════ */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 9000,
        transition: "all 0.3s ease",
      }}>
        {/* Main Navbar */}
        <header
          style={{
            width: "100%",
            position: "relative",
            zIndex: 9100,
            background: scrolled ? "rgba(27, 48, 97, 0.98)" : "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            borderBottom: scrolled ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.06)",
            padding: scrolled ? "6px 0" : "10px 0",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: scrolled ? "0 10px 30px rgba(0,0,0,0.14)" : "0 2px 10px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: scrolled ? 54 : 64,
            transition: "all 0.3s ease"
          }}>
            {/* Logo Group */}
            <Link
              href="/"
              style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none" }}
            >
              <BrandIcon size={scrolled ? 34 : 38} bgBadge={scrolled} />
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 17, fontWeight: 900, color: scrolled ? "#FFFFFF" : "#0F172A", letterSpacing: "-0.4px" }}>
                    SIJAKON
                  </span>
                  <span style={{ height: 6, width: 6, borderRadius: "50%", backgroundColor: "#FFC000", display: "inline-block" }} />
                </div>
                <span style={{ fontSize: 9.5, fontWeight: 800, color: scrolled ? "#FFC000" : "#1B3061", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                  Kabupaten Bogor
                </span>
              </div>
            </Link>

            {/* Desktop Nav Items */}
            <nav style={{ display: "flex", justifyContent: "center", flexGrow: 1, margin: "0 20px" }} className="homepage-nav-desktop">
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.3s ease",
              }}>
                {NAV_LINKS.map((link, i) => (
                  <div
                    key={i}
                    style={{ position: "relative" }}
                    onMouseEnter={() => link.dropdown ? handleNavEnter(i) : handleNavLeave()}
                    onMouseLeave={handleNavLeave}
                  >
                    <a
                      href={link.href}
                      style={{
                        padding: "8px 18px",
                        borderRadius: 10,
                        color: link.active
                          ? (scrolled ? "#FFC000" : "#1B3061")
                          : (scrolled ? "rgba(255,255,255,0.9)" : "#334155"),
                        fontWeight: link.active ? 800 : 600,
                        fontSize: "0.88rem",
                        transition: "all 0.15s ease",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        background: link.active
                          ? (scrolled ? "rgba(255,255,255,0.12)" : "rgba(27,48,97,0.06)")
                          : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!link.active) {
                          e.currentTarget.style.background = scrolled ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.05)";
                          e.currentTarget.style.color = scrolled ? "#FFFFFF" : "#0F172A";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!link.active) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = scrolled ? "rgba(255,255,255,0.9)" : "#334155";
                        }
                      }}
                    >
                      {link.label}
                      {link.dropdown && (
                        <ChevronDown
                          size={13}
                          style={{
                            transition: "transform 0.2s ease",
                            transform: activeDropdown === i ? "rotate(180deg)" : "rotate(0deg)",
                            opacity: 0.7,
                          }}
                        />
                      )}
                    </a>

                    {/* Dropdown Menu with Hover Bridge */}
                    {link.dropdown && activeDropdown === i && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          paddingTop: 10,
                          zIndex: 9500,
                        }}
                        onMouseEnter={() => handleNavEnter(i)}
                        onMouseLeave={handleNavLeave}
                      >
                        {/* Invisible hover bridge to eliminate gap */}
                        <div style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 14,
                          background: "transparent",
                        }} />

                        {/* Dropdown Card */}
                        <div style={{
                          background: "#FFFFFF",
                          width: link.dropdown.length > 4 ? 360 : 300,
                          borderRadius: 16,
                          padding: "10px",
                          boxShadow: "0 20px 45px -10px rgba(15,23,42,0.22), 0 0 0 1px rgba(0,0,0,0.06)",
                          border: "1px solid #E2E8F0",
                          animation: "fadeDropdown 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                        }}>
                          {link.dropdown.map((item, j) => (
                            <a
                              key={j}
                              href={item.href}
                              style={{
                                padding: "10px 14px",
                                borderRadius: 10,
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                transition: "all 0.15s ease",
                                textDecoration: "none",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#F8FAFC";
                                e.currentTarget.style.paddingLeft = "18px";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.paddingLeft = "14px";
                              }}
                            >
                              <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1B3061" }}>
                                {item.label}
                              </span>
                              {item.desc && (
                                <span style={{ fontSize: "0.72rem", color: "#64748B", lineHeight: 1.3 }}>
                                  {item.desc}
                                </span>
                              )}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </nav>

            {/* Action Group: Status Badge + Login Button */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
              {/* Status Sistem Badge */}
              <div
                className="homepage-status-badge"
                title="Sistem Beroperasi Penuh — Terhubung ke SIPJAKI Kementerian PUPR"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "6px 14px",
                  borderRadius: 99,
                  background: scrolled ? "rgba(255,255,255,0.12)" : "rgba(16, 185, 129, 0.08)",
                  border: scrolled ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(16, 185, 129, 0.2)",
                  color: scrolled ? "#FFFFFF" : "#059669",
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#10B981",
                  boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.3)",
                  animation: "statusPulse 2s infinite",
                  display: "inline-block",
                }} />
                <span>SIPJAKI Sync: Normal</span>
              </div>

              {/* Login / Dashboard Button */}
              <Link
                href={user ? targetRoute : "/login"}
                style={{
                  background: scrolled ? "#FFC000" : "#1B3061",
                  color: scrolled ? "#1B3061" : "#FFC000",
                  padding: "9px 22px",
                  borderRadius: 10,
                  fontWeight: 800,
                  fontSize: "0.84rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  transition: "all 0.2s ease",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  border: "none",
                  boxShadow: scrolled ? "0 4px 14px rgba(255,192,0,0.3)" : "0 4px 14px rgba(27,48,97,0.18)",
                }}
              >
                {user ? "KE DASHBOARD" : "MASUK"} <ArrowRight size={15} />
              </Link>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="homepage-mobile-toggle"
                style={{
                  fontSize: "1.5rem",
                  color: scrolled ? "#FFFFFF" : "#1E293B",
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  display: "none",
                }}
                aria-label="Buka Menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </header>

        {/* Ticker / Running Text Marquee */}
        <TickerMarquee onOpenAnnouncement={() => setAnnouncementModalOpen(true)} />
      </div>

      {/* Mobile Drawer */}
      <div style={{
        position: "fixed",
        top: 0,
        right: mobileMenuOpen ? 0 : "-100%",
        width: "100%",
        height: "100%",
        background: "#1B3061",
        zIndex: 9800,
        transition: "0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        padding: "80px 30px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}>
        <button
          onClick={() => setMobileMenuOpen(false)}
          style={{ position: "absolute", top: 20, right: 20, color: "white", fontSize: "2rem", cursor: "pointer", background: "none", border: "none" }}
          aria-label="Tutup Menu"
        >
          <X size={28} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
          <span style={{ color: "#E2E8F0", fontSize: "0.82rem", fontWeight: 700 }}>SIPJAKI Online • 40 Kecamatan</span>
        </div>
        {NAV_LINKS.map((link, i) => (
          <a
            key={i}
            href={link.href}
            onClick={() => setMobileMenuOpen(false)}
            style={{
              color: "white",
              fontSize: "1.1rem",
              fontWeight: 700,
              textDecoration: "none",
              textTransform: "uppercase",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              paddingBottom: 8,
            }}
          >
            {link.label}
          </a>
        ))}
        <Link
          href={user ? targetRoute : "/login"}
          onClick={() => setMobileMenuOpen(false)}
          style={{
            marginTop: 10,
            background: "#FFC000",
            color: "#1B3061",
            padding: "14px",
            borderRadius: 10,
            textAlign: "center",
            fontWeight: 800,
            fontSize: "1rem",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          {user ? "MENUJU DASHBOARD" : "MASUK SISTEM"}
        </Link>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION (With Counter Animation & Leaflet Interactive Map)
          ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ paddingTop: 148, paddingBottom: 60, background: "#FFFFFF", position: "relative" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          {/* Header Title */}
          <div style={{ textAlign: "center", maxWidth: 920, margin: "0 auto 36px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              background: "#F1F5F9",
              border: "1px solid #E2E8F0",
              borderRadius: 99,
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: "0.8px",
              color: "#1B3061",
              textTransform: "uppercase",
              marginBottom: 16,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 0 3px rgba(16,185,129,0.2)" }} />
              <span>Portal Resmi Pengawasan Jasa Konstruksi</span>
            </div>
            <h1 style={{
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: "-1.2px",
              color: "#0F172A",
              marginBottom: 14,
            }}>
              Pemantauan Pembinaan <br />
              <span style={{
                background: "linear-gradient(135deg, #1B3061 0%, #2563EB 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Jasa Konstruksi Kabupaten Bogor
              </span>
            </h1>
            <p style={{ fontSize: "1.05rem", color: "#64748B", lineHeight: 1.65, margin: "0 auto", maxWidth: 660 }}>
              Sistem informasi monitoring dan pengawasan jasa konstruksi terpadu untuk efisiensi, kepatuhan regulasi UU No. 2/2017, dan transparansi pembangunan 40 kecamatan.
            </p>
          </div>

          {/* Stats Cards (with AnimatedCounter) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 18, maxWidth: 1040, margin: "0 auto 36px" }}>
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: 20,
                    padding: "20px 22px",
                    boxShadow: "0 6px 20px rgba(15,23,42,0.06)",
                    transition: "all 0.3s ease",
                    cursor: "default",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 30px rgba(15,23,42,0.1)";
                    e.currentTarget.style.borderColor = stat.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(15,23,42,0.06)";
                    e.currentTarget.style.borderColor = "#E2E8F0";
                  }}
                >
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: `${stat.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon size={24} color={stat.color} />
                  </div>
                  <div>
                    <span style={{ fontSize: "1.6rem", fontWeight: 900, color: "#0F172A", display: "block", lineHeight: 1.1 }}>
                      <AnimatedCounter value={stat.value} />
                    </span>
                    <span style={{ fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 800, color: "#64748B", letterSpacing: "0.5px" }}>
                      {stat.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Leaflet Map Visual Stack */}
          <div style={{
            position: "relative",
            maxWidth: 1200,
            margin: "0 auto",
            borderRadius: 32,
            boxShadow: "0 25px 70px rgba(15,23,42,0.12)",
            border: "1px solid #E2E8F0",
            overflow: "hidden",
            background: "#F8FAFC",
            zIndex: 1,
          }}>
            {/* Top-Right Floating Widget */}
            <div
              className="map-floating-widget-top"
              style={{
                position: "absolute",
                top: 18,
                right: 18,
                zIndex: 20,
                background: "rgba(255,255,255,0.96)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255,255,255,0.8)",
                borderRadius: 18,
                padding: "14px 18px",
                boxShadow: "0 10px 30px rgba(15,23,42,0.12)",
                pointerEvents: "auto",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, background: "rgba(27,48,97,0.08)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Globe size={22} color="#1B3061" />
                </div>
                <div>
                  <span style={{ fontSize: "1.35rem", fontWeight: 900, color: "#0F172A", display: "block", lineHeight: 1.1 }}>
                    40 Kecamatan
                  </span>
                  <span style={{ fontSize: "0.68rem", textTransform: "uppercase", fontWeight: 800, color: "#10B981", letterSpacing: "0.5px" }}>
                    Terintegrasi Penuh
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom-Left Floating Widget */}
            <div
              className="map-floating-widget-bottom"
              style={{
                position: "absolute",
                bottom: 18,
                left: 18,
                zIndex: 20,
                background: "rgba(255,255,255,0.96)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255,255,255,0.8)",
                borderRadius: 18,
                padding: "16px 20px",
                boxShadow: "0 10px 30px rgba(15,23,42,0.12)",
                width: 290,
                pointerEvents: "auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 800, color: "#1B3061", fontSize: "0.75rem", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  Progres Profil OPD
                </span>
                <span style={{ background: "#10B981", color: "white", padding: "2px 8px", borderRadius: 99, fontSize: "0.65rem", fontWeight: 800 }}>
                  85%
                </span>
              </div>
              <div style={{ display: "flex", gap: 14, padding: "8px 0", borderTop: "1px solid rgba(0,0,0,0.06)", borderBottom: "1px solid rgba(0,0,0,0.06)", marginBottom: 10 }}>
                <div style={{ flex: 1, borderRight: "1px solid rgba(0,0,0,0.06)", paddingRight: 12 }}>
                  <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "#1B3061", display: "block", lineHeight: 1.1 }}>34</span>
                  <span style={{ fontSize: "0.65rem", textTransform: "uppercase", fontWeight: 700, color: "#64748B" }}>Telah Mengisi</span>
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "#B45309", display: "block", lineHeight: 1.1 }}>6</span>
                  <span style={{ fontSize: "0.65rem", textTransform: "uppercase", fontWeight: 700, color: "#64748B" }}>Belum Mengisi</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#64748B" }}>Cakupan Kabupaten</span>
                <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#10B981" }}>85%</span>
              </div>
              <div style={{ height: 6, borderRadius: 10, background: "#E2E8F0", overflow: "hidden" }}>
                <div style={{ width: "85%", height: "100%", background: "linear-gradient(90deg, #1B3061, #2563EB)", borderRadius: 10 }} />
              </div>
            </div>

            {/* Real Interactive Map Component */}
            <HomeMap />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          QUICK ACCESS CARDS SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <QuickAccessCards />

      {/* ═══════════════════════════════════════════════════════════════════
          CHALLENGES SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <section id="challenges" style={{ padding: "70px 0 60px", background: "#F8FAFC" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 14px",
              background: "rgba(27,48,97,0.08)",
              color: "#1B3061",
              borderRadius: 99,
              fontSize: "0.7rem",
              fontWeight: 800,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              marginBottom: 8,
            }}>
              <Target size={14} /> Fokus Transformasi
            </div>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, color: "#0F172A", marginBottom: 6, letterSpacing: "-0.5px" }}>
              Tantangan Utama Pengawasan Konstruksi
            </h2>
            <p style={{ fontSize: "0.95rem", color: "#64748B", marginBottom: 0, maxWidth: 650, lineHeight: 1.6 }}>
              Tiga pilar strategis dalam mewujudkan ekosistem rantai pasok dan tata kelola jasa konstruksi yang akuntabel.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {CHALLENGES.map((ch, i) => {
              const Icon = ch.icon;
              return (
                <div
                  key={i}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 24,
                    padding: "32px 28px",
                    border: "1px solid #E2E8F0",
                    transition: "all 0.3s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#1B3061";
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: ch.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}>
                    <Icon size={24} color={ch.iconColor} />
                  </div>
                  <h4 style={{ fontWeight: 800, marginBottom: 10, color: "#0F172A", fontSize: "1.15rem" }}>{ch.title}</h4>
                  <p style={{ color: "#64748B", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>{ch.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FEATURES SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 0", background: "#FFFFFF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 14px",
              background: "rgba(27,48,97,0.08)",
              color: "#1B3061",
              borderRadius: 99,
              fontSize: "0.7rem",
              fontWeight: 800,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              marginBottom: 12,
            }}>
              <Activity size={14} /> Fitur Unggulan
            </div>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, color: "#0F172A", marginBottom: 8, letterSpacing: "-0.5px" }}>
              Solusi Terintegrasi untuk Pengawasan
            </h2>
            <p style={{ fontSize: "0.95rem", color: "#64748B", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
              Enam modul inti yang dirancang untuk memenuhi kebutuhan pembinaan jasa konstruksi tingkat daerah.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  style={{
                    background: "#F8FAFC",
                    borderRadius: 20,
                    padding: "28px 24px",
                    border: "1px solid #E2E8F0",
                    transition: "all 0.3s ease",
                    cursor: "default",
                    display: "flex",
                    gap: 16,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#1B3061";
                    e.currentTarget.style.background = "#FFFFFF";
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 12px 30px rgba(27,48,97,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                    e.currentTarget.style.background = "#F8FAFC";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "linear-gradient(135deg, #1B3061, #2563EB)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon size={22} color="white" />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 800, marginBottom: 6, color: "#0F172A", fontSize: "1rem" }}>{feat.title}</h4>
                    <p style={{ color: "#64748B", fontSize: "0.88rem", lineHeight: 1.6, margin: 0 }}>{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          VIDEO SHOWCASE SECTION (Split Video Accordion)
          ═══════════════════════════════════════════════════════════════════ */}
      <VideoShowcase />

      {/* ═══════════════════════════════════════════════════════════════════
          NEWS SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <section id="news" style={{ padding: "80px 0 70px", background: "#FFFFFF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 14px",
                background: "rgba(27,48,97,0.08)",
                color: "#1B3061",
                borderRadius: 99,
                fontSize: "0.7rem",
                fontWeight: 800,
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                marginBottom: 8,
              }}>
                <Newspaper size={14} /> Kabar Konstruksi
              </div>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, color: "#1B3061", marginBottom: 6, letterSpacing: "-0.5px" }}>
                Berita & Informasi Terkini
              </h2>
              <p style={{ fontSize: "0.95rem", color: "#64748B", marginBottom: 0, maxWidth: 650, lineHeight: 1.6 }}>
                Informasi terbaru seputar pembinaan, regulasi, dan kegiatan jasa konstruksi Kabupaten Bogor.
              </p>
            </div>
            <Link
              href="/login"
              style={{
                padding: "9px 20px",
                border: "1px solid #E2E8F0",
                borderRadius: 99,
                color: "#1B3061",
                fontWeight: 800,
                fontSize: "0.82rem",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "0.3s",
                whiteSpace: "nowrap",
                background: "#F8FAFC",
              }}
            >
              Semua Berita <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
            {NEWS.map((item, i) => (
              <div
                key={i}
                style={{
                  background: "#FFFFFF",
                  borderRadius: 24,
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid #F1F5F9",
                  padding: 16,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 25px rgba(0,0,0,0.06)";
                  e.currentTarget.style.borderColor = "#CBD5E1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "#F1F5F9";
                }}
              >
                {/* Thumbnail gradient */}
                <div style={{
                  width: "100%",
                  height: 180,
                  borderRadius: 16,
                  overflow: "hidden",
                  marginBottom: 16,
                  background: `linear-gradient(135deg, ${["#1B3061", "#2563EB", "#0F766E", "#7C3AED"][i]} 0%, ${["#2563EB", "#0EA5E9", "#10B981", "#A855F7"][i]} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Newspaper size={44} color="rgba(255,255,255,0.3)" />
                </div>

                {/* Meta */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: "0.75rem", color: "#64748B", fontWeight: 700 }}>
                  <div style={{ width: 18, height: 18, background: "#1B3061", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Zap size={10} color="white" />
                  </div>
                  <span style={{ color: "#0F172A" }}>SIJAKON News</span>
                  <span style={{ opacity: 0.5 }}>• {item.date}</span>
                </div>

                {/* Title */}
                <h5 style={{
                  fontSize: "1rem",
                  fontWeight: 800,
                  lineHeight: 1.35,
                  color: "#0F172A",
                  marginBottom: 8,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {item.title}
                </h5>

                {/* Excerpt */}
                <p style={{
                  fontSize: "0.85rem",
                  color: "#64748B",
                  lineHeight: 1.6,
                  marginBottom: 16,
                  flex: 1,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {item.excerpt}
                </p>

                {/* CTA */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #F1F5F9" }}>
                  <span style={{ color: "#2563EB", fontWeight: 800, fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 4 }}>
                    Baca selengkapnya <ChevronRight size={14} />
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#94A3B8", fontSize: "0.75rem" }}>
                    <Clock size={12} /> {item.readTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          TESTIMONIAL OPD SLIDER SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <TestimonialSlider />

      {/* ═══════════════════════════════════════════════════════════════════
          CTA SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "80px 0",
        background: "linear-gradient(135deg, #1B3061 0%, #0F172A 100%)",
        color: "white",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 14px",
            background: "rgba(245,158,11,0.15)",
            color: "#FFC000",
            borderRadius: 99,
            fontSize: "0.7rem",
            fontWeight: 800,
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            marginBottom: 16,
            border: "1px solid rgba(245,158,11,0.25)",
          }}>
            <TrendingUp size={14} /> Mulai Sekarang
          </div>
          <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)", fontWeight: 900, marginBottom: 16, letterSpacing: "-0.5px" }}>
            Siap Memulai Transformasi Digital?
          </h2>
          <p style={{ fontSize: "1.02rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.65, marginBottom: 32 }}>
            Akses dashboard analitik, WebGIS terintegrasi 40 kecamatan, dan seluruh fitur pengawasan jasa konstruksi Kabupaten Bogor dalam satu pintu.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            <Link
              href={user ? targetRoute : "/login"}
              style={{
                padding: "14px 32px",
                background: "#FFC000",
                color: "#1B3061",
                borderRadius: 12,
                fontWeight: 800,
                fontSize: "0.92rem",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "0.3s",
                boxShadow: "0 10px 25px rgba(255,192,0,0.3)",
              }}
            >
              {user ? "Buka Dashboard Sistem" : "Masuk Sistem SIJAKON"} <ArrowRight size={18} />
            </Link>
            <a
              href="#challenges"
              style={{
                padding: "14px 28px",
                background: "rgba(255,255,255,0.1)",
                color: "white",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: "0.92rem",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid rgba(255,255,255,0.2)",
                transition: "0.3s",
              }}
            >
              Pelajari Fitur
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════════════ */}
      <footer style={{ background: "#FFFFFF", padding: "60px 0 0", borderTop: "1px solid #F1F5F9" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 40, marginBottom: 50 }} className="homepage-footer-grid">
            {/* Branding & Address */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <BrandIcon size={44} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.3px" }}>SIJAKON</span>
                    <span style={{ height: 6, width: 6, borderRadius: "50%", backgroundColor: "#FFC000", display: "inline-block" }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#1B3061", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                    Kabupaten Bogor
                  </span>
                </div>
              </div>

              <div style={{ color: "#64748B", lineHeight: 1.6, fontSize: "0.88rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                  <MapPin size={16} color="#1B3061" style={{ marginTop: 3, flexShrink: 0 }} />
                  <span>Jl. Tegar Beriman, Cibinong, Kabupaten Bogor, Jawa Barat 16914</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                  <Phone size={16} color="#1B3061" style={{ marginTop: 3, flexShrink: 0 }} />
                  <span>(021) 875-2871 / 875-2872</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                  <Mail size={16} color="#1B3061" style={{ marginTop: 3, flexShrink: 0 }} />
                  <span>dpu@bogorkab.go.id • jakon.bogor@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Menu Navigasi */}
            <div>
              <h5 style={{ fontWeight: 800, color: "#1B3061", marginBottom: 20, fontSize: "1rem", letterSpacing: "0.5px" }}>Menu Navigasi</h5>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  { label: "Beranda", href: "/" },
                  { label: "Dashboard Analitik", href: "/dashboard" },
                  { label: "WebGIS Proyek", href: "/webgis" },
                  { label: "Profil OPD", href: "/profil-opd" },
                  { label: "Berita Terbaru", href: "#news" },
                  { label: "Regulasi & UU", href: "/regulasi" },
                  { label: "Paket Pekerjaan", href: "/paket-pekerjaan" },
                ].map((item, i) => (
                  <li key={i} style={{ marginBottom: 10 }}>
                    <Link href={item.href} style={{ color: "#64748B", textDecoration: "none", fontSize: "0.9rem", transition: "0.2s" }}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Layanan */}
            <div>
              <h5 style={{ fontWeight: 800, color: "#1B3061", marginBottom: 20, fontSize: "1rem", letterSpacing: "0.5px" }}>Layanan & Informasi</h5>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  { label: "Bimtek & Pelatihan SMKK", href: "/pelatihan" },
                  { label: "Pencatatan Insiden K3", href: "/kecelakaan" },
                  { label: "Audit SIMAK Lapangan", href: "/pengawasan" },
                  { label: "Database 416 BUJK", href: "/bujk" },
                  { label: "Pusat Bantuan & FAQ", href: "/dashboard" },
                ].map((item, i) => (
                  <li key={i} style={{ marginBottom: 10 }}>
                    <Link href={item.href} style={{ color: "#64748B", textDecoration: "none", fontSize: "0.9rem", transition: "0.2s" }}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ background: "#F8FAFC", borderTop: "1px solid #F1F5F9", padding: "24px 0" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <span style={{ fontSize: "1.3rem", fontWeight: 900, color: "#1B3061", letterSpacing: "-0.5px" }}>SIJAKON.</span>
            <p style={{ color: "#94A3B8", fontSize: "0.78rem", margin: 0, textAlign: "center" }}>
              Copyright © 2026 Dinas Pekerjaan Umum Kabupaten Bogor — Terintegrasi SIPJAKI Kementerian PUPR. All Rights Reserved.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {[Globe, ExternalLink].map((Icon, i) => (
                <a
                  key={i}
                  href="https://sipjaki.pu.go.id"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#1B3061",
                    transition: "0.2s",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    border: "1px solid #E2E8F0",
                    textDecoration: "none",
                  }}
                  aria-label="Tautan Eksternal"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════════════
          GLOBAL PAGE CSS & ANIMATIONS
          ═══════════════════════════════════════════════════════════════════ */}
      <style>{`
        @keyframes statusPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        @keyframes fadeDropdown {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1199px) {
          .homepage-nav-desktop {
            display: none !important;
          }
          .homepage-mobile-toggle {
            display: block !important;
          }
        }

        @media (max-width: 900px) {
          .homepage-status-badge {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          .homepage-footer-grid {
            grid-template-columns: 1fr !important;
          }
          .map-floating-widget-top {
            display: none !important;
          }
          .map-floating-widget-bottom {
            width: calc(100% - 36px) !important;
          }
        }
      `}</style>
    </div>
  );
}

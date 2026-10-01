"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote, Star, CheckCircle, Building, Users2 } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  agency: string;
  avatarInitials: string;
  avatarBg: string;
  quote: string;
  rating: number;
  badge: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Ir. H. Soebiantoro, M.Si",
    role: "Kepala Dinas Pekerjaan Umum",
    agency: "DPU Kabupaten Bogor",
    avatarInitials: "SB",
    avatarBg: "linear-gradient(135deg, #1B3061, #2563EB)",
    quote:
      "SIJAKON menjadi lompatan besar dalam tata kelola pembinaan dan pengawasan jasa konstruksi daerah. Integrasi real-time dengan SIPJAKI Nasional memastikan transparansi, kepatuhan regulasi, dan mutu proyek APBD meningkat secara terukur.",
    rating: 5,
    badge: "Pembina Teknis Jakon",
  },
  {
    id: 2,
    name: "Drs. Achmad Ridwan",
    role: "Camat Cibinong",
    agency: "Pemerintah Kecamatan Cibinong",
    avatarInitials: "AR",
    avatarBg: "linear-gradient(135deg, #0F766E, #14B8A6)",
    quote:
      "Sebagai wilayah pusat pemerintahan dengan volume proyek strategis tinggi, kemudahan memantau sebaran paket pekerjaan dan sertifikasi kontraktor melalui WebGIS sangat memperkuat pengawasan wilayah kami bersama tim forkopimcam.",
    rating: 5,
    badge: "Wilayah Strategis",
  },
  {
    id: 3,
    name: "H. Dedi Mulyadi, S.T.",
    role: "Ketua BPC GAPENSI",
    agency: "GAPENSI Kabupaten Bogor",
    avatarInitials: "DM",
    avatarBg: "linear-gradient(135deg, #D97706, #F59E0B)",
    quote:
      "Pelaku usaha konstruksi lokal kini merasakan efisiensi nyata. Akses terhadap informasi bimtek SMKK, pemutakhiran data BUJK, serta uji sertifikasi kompetensi kerja (SKK) tersaji transparan tanpa hambatan birokrasi manual.",
    rating: 5,
    badge: "Asosiasi BUJK",
  },
  {
    id: 4,
    name: "Ir. Ratna Dewi, M.T.",
    role: "Koordinator Tim Audit SIMAK",
    agency: "Tim Pengawas Lapangan DPU",
    avatarInitials: "RD",
    avatarBg: "linear-gradient(135deg, #7C3AED, #A855F7)",
    quote:
      "Sistem pelaporan digital 5 pilar pengawasan memangkas waktu verifikasi lapangan hingga 70%. Dokumentasi keselamatan konstruksi (SMKK) dan bukti fisik tertib penyelenggaraan tersimpan rapi dan akuntabel.",
    rating: 5,
    badge: "Pengawas Lapangan",
  },
];

export default function TestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <section
      style={{ padding: "80px 0", background: "#F8FAFC", position: "relative" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 14px",
            background: "rgba(27,48,97,0.08)",
            color: "#1B3061",
            borderRadius: 99,
            fontSize: "0.72rem",
            fontWeight: 800,
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            marginBottom: 12,
          }}>
            <Users2 size={14} /> Suara Stakeholder & Aparat Daerah
          </div>
          <h2 style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)", fontWeight: 800, color: "#0F172A", margin: "0 0 8px 0", letterSpacing: "-0.5px" }}>
            Dipercaya Pembina, Camat & Pelaku Usaha
          </h2>
          <p style={{ fontSize: "0.95rem", color: "#64748B", maxWidth: 620, margin: "0 auto", lineHeight: 1.6 }}>
            Dampak nyata transformasi digital pengawasan jasa konstruksi dalam meningkatkan mutu dan kepatuhan pembangunan Kabupaten Bogor.
          </p>
        </div>

        {/* Carousel Card Container */}
        <div style={{ maxWidth: 880, margin: "0 auto", position: "relative" }}>
          {/* Main Card */}
          <div style={{
            background: "#FFFFFF",
            borderRadius: 24,
            padding: "44px 48px",
            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)",
            border: "1px solid #E2E8F0",
            position: "relative",
            minHeight: 280,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }} className="testimonial-card">
            {/* Top decorative quotes */}
            <div style={{
              position: "absolute",
              top: 30,
              right: 36,
              color: "rgba(27, 48, 97, 0.07)",
              pointerEvents: "none",
            }}>
              <Quote size={80} strokeWidth={1} />
            </div>

            {/* Rating Stars */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 18 }}>
              {[...Array(current.rating)].map((_, i) => (
                <Star key={i} size={18} fill="#FFC000" color="#FFC000" />
              ))}
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10B981", marginLeft: 8, display: "flex", alignItems: "center", gap: 4 }}>
                <CheckCircle size={13} /> Terverifikasi
              </span>
            </div>

            {/* Quote Text */}
            <blockquote style={{
              fontSize: "1.15rem",
              lineHeight: 1.7,
              color: "#1E293B",
              fontWeight: 500,
              margin: "0 0 28px 0",
              position: "relative",
              zIndex: 2,
            }}>
              &ldquo;{current.quote}&rdquo;
            </blockquote>

            {/* Author Profile */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: current.avatarBg,
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  letterSpacing: "0.5px",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                }}>
                  {current.avatarInitials}
                </div>
                <div>
                  <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                    {current.name}
                  </h4>
                  <div style={{ fontSize: "0.82rem", color: "#64748B", fontWeight: 500, marginTop: 2 }}>
                    {current.role} • <strong style={{ color: "#1B3061" }}>{current.agency}</strong>
                  </div>
                </div>
              </div>

              <span style={{
                background: "rgba(27, 48, 97, 0.08)",
                color: "#1B3061",
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "6px 14px",
                borderRadius: 99,
                letterSpacing: "0.3px",
              }}>
                {current.badge}
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 24,
            padding: "0 10px",
          }}>
            {/* Dots */}
            <div style={{ display: "flex", gap: 8 }}>
              {TESTIMONIALS.map((t, index) => (
                <button
                  key={t.id}
                  onClick={() => setCurrentIndex(index)}
                  style={{
                    width: currentIndex === index ? 28 : 10,
                    height: 10,
                    borderRadius: 99,
                    border: "none",
                    background: currentIndex === index ? "#1B3061" : "#CBD5E1",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Arrow Buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={prevSlide}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  color: "#1B3061",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
                  transition: "all 0.2s ease",
                }}
                aria-label="Sebelumnya"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextSlide}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "#1B3061",
                  border: "none",
                  color: "#FFC000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 4px 10px rgba(27,48,97,0.2)",
                  transition: "all 0.2s ease",
                }}
                aria-label="Berikutnya"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .testimonial-card {
            padding: 28px 20px !important;
          }
        }
      `}</style>
    </section>
  );
}

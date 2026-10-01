"use client";
import { useState } from "react";
import { Play, X, ExternalLink, ShieldCheck, Award, HardHat, Sparkles } from "lucide-react";

interface VideoItem {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  duration: string;
  thumbnailGradient: string;
  videoUrl?: string; // YouTube or direct MP4
  poster?: string;
  highlights: string[];
}

const VIDEOS: VideoItem[] = [
  {
    id: 1,
    title: "Pengenalan Ekosistem SIJAKON Kabupaten Bogor",
    subtitle: "Integrasi menyeluruh 5 pilar pengawasan jasa konstruksi daerah dengan SIPJAKI Nasional Kementerian PUPR menuju Satu Data Konstruksi.",
    category: "Profil & Transformasi Digital",
    duration: "04:15",
    thumbnailGradient: "linear-gradient(135deg, #0F172A 0%, #1B3061 50%, #2563EB 100%)",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1", // Placeholder clean embed or educational video
    highlights: ["Satu Data Jasa Konstruksi", "Integrasi Pusat-Daerah", "Audit Digital Real-time"],
  },
  {
    id: 2,
    title: "Pedoman Teknis Audit SIMAK Lapangan di 40 Kecamatan",
    subtitle: "Standarisasi instrumen audit tertib penyelenggaraan konstruksi bagi tim pengawas OPD teknis dan aparat kecamatan.",
    category: "Pedoman Teknis Pengawasan",
    duration: "06:30",
    thumbnailGradient: "linear-gradient(135deg, #1B3061 0%, #0D9488 60%, #10B981 100%)",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
    highlights: ["Instrumen Audit Baku", "Checklist 5 Tertib", "Verifikasi Lapangan Digital"],
  },
  {
    id: 3,
    title: "Penerapan SMKK & Budaya K3 Konstruksi Menuju Zero Accident",
    subtitle: "Kewajiban implementasi Rencana Keselamatan Konstruksi (RKK) sesuai Permen PUPR No. 10/2021 pada seluruh paket APBD Kabupaten Bogor.",
    category: "Keselamatan Konstruksi (SMKK)",
    duration: "05:45",
    thumbnailGradient: "linear-gradient(135deg, #312E81 0%, #7C3AED 50%, #C026D3 100%)",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
    highlights: ["Rencana Keselamatan Konstruksi", "Audit K3 Berkala", "Pencatatan Insiden Terpadu"],
  },
];

export default function VideoShowcase() {
  const [activeId, setActiveId] = useState<number>(1);
  const [modalVideo, setModalVideo] = useState<VideoItem | null>(null);

  const activeItem = VIDEOS.find((v) => v.id === activeId) || VIDEOS[0];

  return (
    <section style={{ padding: "80px 0 60px", background: "#0F172A", color: "#FFFFFF", position: "relative", overflow: "hidden" }}>
      {/* Background ambient lighting */}
      <div style={{
        position: "absolute",
        top: -100,
        left: "20%",
        width: 600,
        height: 600,
        background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        bottom: -150,
        right: "10%",
        width: 500,
        height: 500,
        background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 2 }}>
        {/* Section Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 14px",
              background: "rgba(255, 192, 0, 0.15)",
              color: "#FFC000",
              borderRadius: 99,
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              marginBottom: 12,
              border: "1px solid rgba(255, 192, 0, 0.3)",
            }}>
              <Sparkles size={13} /> Galeri Video & Edukasi Teknis
            </div>
            <h2 style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)", fontWeight: 900, letterSpacing: "-0.5px", margin: "0 0 8px 0" }}>
              Sosialisasi & Standarisasi Jasa Konstruksi
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "0.95rem", margin: 0, maxWidth: 640, lineHeight: 1.6 }}>
              Materi edukasi audiovisual resmi Dinas Pekerjaan Umum Kabupaten Bogor untuk meningkatkan pemahaman regulasi, keselamatan kerja, dan digitalisasi pengawasan.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {VIDEOS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveId(item.id)}
                style={{
                  border: "none",
                  background: activeId === item.id ? "#FFC000" : "rgba(255,255,255,0.08)",
                  color: activeId === item.id ? "#1B3061" : "#E2E8F0",
                  padding: "8px 16px",
                  borderRadius: 99,
                  fontWeight: 800,
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                0{item.id}
              </button>
            ))}
          </div>
        </div>

        {/* Video Split Accordion Container */}
        <div style={{
          display: "flex",
          borderRadius: 24,
          overflow: "hidden",
          minHeight: 460,
          background: "#020617",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.1)",
        }} className="video-split-container">
          {VIDEOS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setActiveId(item.id)}
                style={{
                  flex: isActive ? "3 1 0%" : "1 1 0%",
                  minWidth: 0,
                  position: "relative",
                  cursor: "pointer",
                  background: item.thumbnailGradient,
                  transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: isActive ? "36px 32px" : "24px 18px",
                  overflow: "hidden",
                }}
                className={`video-item ${isActive ? "active" : ""}`}
              >
                {/* Decorative overlay mesh */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: isActive
                    ? "linear-gradient(to top, rgba(2,6,23,0.92) 0%, rgba(2,6,23,0.4) 50%, rgba(2,6,23,0.15) 100%)"
                    : "rgba(2,6,23,0.7)",
                  transition: "background 0.4s ease",
                  pointerEvents: "none",
                }} />

                {/* Subtle pattern */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                  opacity: isActive ? 0.3 : 0.1,
                  pointerEvents: "none",
                }} />

                {/* Center Play Button for Active item */}
                {isActive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalVideo(item);
                    }}
                    style={{
                      position: "absolute",
                      top: "42%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 76,
                      height: 76,
                      borderRadius: "50%",
                      background: "#FFC000",
                      color: "#1B3061",
                      border: "4px solid rgba(255,255,255,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 10px 30px rgba(255,192,0,0.4)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      zIndex: 10,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.1)";
                      e.currentTarget.style.boxShadow = "0 15px 40px rgba(255,192,0,0.6)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)";
                      e.currentTarget.style.boxShadow = "0 10px 30px rgba(255,192,0,0.4)";
                    }}
                    aria-label={`Putar video ${item.title}`}
                  >
                    <Play size={32} fill="#1B3061" style={{ marginLeft: 4 }} />
                  </button>
                )}

                {/* Inactive item vertical indicator */}
                {!isActive && (
                  <div style={{
                    position: "absolute",
                    top: 24,
                    left: 20,
                    zIndex: 5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    alignItems: "center",
                  }}>
                    <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "#FFC000" }}>0{item.id}</span>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Play size={16} fill="white" style={{ marginLeft: 2 }} />
                    </div>
                  </div>
                )}

                {/* Content Area */}
                <div style={{ position: "relative", zIndex: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(6px)",
                      color: "#E2E8F0",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 99,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}>
                      {item.category}
                    </span>
                    <span style={{ color: "#FFC000", fontSize: "0.75rem", fontWeight: 700 }}>
                      ⏱ {item.duration}
                    </span>
                  </div>

                  <h3 style={{
                    fontSize: isActive ? "1.45rem" : "1.05rem",
                    fontWeight: 800,
                    lineHeight: 1.25,
                    color: "#FFFFFF",
                    margin: "0 0 8px 0",
                    transition: "font-size 0.4s ease",
                  }}>
                    {item.title}
                  </h3>

                  {isActive && (
                    <>
                      <p style={{
                        fontSize: "0.9rem",
                        color: "rgba(255,255,255,0.8)",
                        lineHeight: 1.5,
                        margin: "0 0 16px 0",
                        maxWidth: 580,
                      }}>
                        {item.subtitle}
                      </p>

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                        {item.highlights.map((h, idx) => (
                          <div key={idx} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            color: "#E2E8F0",
                            background: "rgba(255,255,255,0.08)",
                            padding: "4px 10px",
                            borderRadius: 6,
                          }}>
                            <ShieldCheck size={13} color="#10B981" />
                            <span>{h}</span>
                          </div>
                        ))}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalVideo(item);
                          }}
                          style={{
                            marginLeft: "auto",
                            background: "#FFC000",
                            color: "#1B3061",
                            border: "none",
                            padding: "8px 18px",
                            borderRadius: 8,
                            fontWeight: 800,
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Play size={14} fill="#1B3061" /> Putar Video
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Video Modal Popup */}
      {modalVideo && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(12px)",
          zIndex: 3000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
        onClick={() => setModalVideo(null)}
        >
          <div style={{
            position: "relative",
            width: "100%",
            maxWidth: 860,
            background: "#1E293B",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 24px",
              background: "#0F172A",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#FFC000", textTransform: "uppercase" }}>
                  {modalVideo.category}
                </span>
                <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#FFFFFF", margin: "2px 0 0 0" }}>
                  {modalVideo.title}
                </h4>
              </div>
              <button
                onClick={() => setModalVideo(null)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Player Display Container */}
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, background: "#000" }}>
              <div style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 40,
                textAlign: "center",
                background: "radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)",
              }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "rgba(255,192,0,0.15)",
                  border: "2px solid #FFC000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}>
                  <Play size={36} fill="#FFC000" color="#FFC000" style={{ marginLeft: 4 }} />
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#FFFFFF", marginBottom: 8 }}>
                  {modalVideo.title}
                </h3>
                <p style={{ fontSize: "0.88rem", color: "#94A3B8", maxWidth: 500, marginBottom: 20 }}>
                  Video simulasi materi sosialisasi resmi Dinas Pekerjaan Umum Kabupaten Bogor & Kementerian PUPR.
                </p>
                <div style={{ display: "flex", gap: 12 }}>
                  <a
                    href="https://sipjaki.pu.go.id"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: "#FFC000",
                      color: "#1B3061",
                      padding: "10px 20px",
                      borderRadius: 8,
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    Buka Portal SIPJAKI <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={() => setModalVideo(null)}
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >
                    Tutup Pemutar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .video-split-container {
            flex-direction: column !important;
            height: auto !important;
          }
          .video-item {
            flex: none !important;
            min-height: 220px !important;
          }
        }
      `}</style>
    </section>
  );
}

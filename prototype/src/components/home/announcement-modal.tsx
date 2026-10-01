"use client";
import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Bell, Calendar, ArrowRight, ShieldCheck, HardHat, FileText } from "lucide-react";
import Link from "next/link";

interface AnnouncementSlide {
  id: number;
  tag: string;
  tagColor: string;
  title: string;
  date: string;
  desc: string;
  icon: any;
  actionText: string;
  actionHref: string;
  gradient: string;
}

const SLIDES: AnnouncementSlide[] = [
  {
    id: 1,
    tag: "Integrasi Nasional",
    tagColor: "#1B3061",
    title: "Sinkronisasi Penuh SIJAKON Kabupaten Bogor dengan SIPJAKI Nasional",
    date: "Berlaku Efektif Q3 2026",
    desc: "Seluruh pelaporan 5 pilar pengawasan jasa konstruksi (rantai pasok, izin BUJK, sertifikasi SKK, audit SIMAK, dan data K3) kini terhubung otomatis ke portal Kementerian PUPR.",
    icon: ShieldCheck,
    actionText: "Pelajari Sistem",
    actionHref: "/login",
    gradient: "linear-gradient(135deg, #1B3061 0%, #2563EB 100%)",
  },
  {
    id: 2,
    tag: "Bimtek & Pelatihan",
    tagColor: "#D97706",
    title: "Pendaftaran Bimtek SMKK & Uji Sertifikasi Kompetensi Tenaga Kerja Konstruksi",
    date: "Pendaftaran s.d 15 Oktober 2026",
    desc: "Dinas Pekerjaan Umum Kab. Bogor membuka kuota 120 peserta pelatihan SMKK (Keselamatan Konstruksi) untuk kontraktor dan konsultan lokal tanpa dipungut biaya.",
    icon: HardHat,
    actionText: "Daftar Pelatihan",
    actionHref: "/login",
    gradient: "linear-gradient(135deg, #B45309 0%, #F59E0B 100%)",
  },
  {
    id: 3,
    tag: "Kewajiban BUJK",
    tagColor: "#059669",
    title: "Pemberitahuan Wajib Pemutakhiran Data BUJK & Laporan Triwulan III",
    date: "Batas Akhir: 31 Oktober 2026",
    desc: "Sebanyak 416 Badan Usaha Jasa Konstruksi terdaftar diwajibkan memperbarui status kepemilikan NIB, SBU terakreditasi, dan tenaga kerja bersertifikat aktif.",
    icon: FileText,
    actionText: "Akses Direktori BUJK",
    actionHref: "/login",
    gradient: "linear-gradient(135deg, #065F46 0%, #10B981 100%)",
  },
];

interface AnnouncementModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function AnnouncementModal({ forceOpen, onClose }: AnnouncementModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dontShowToday, setDontShowToday] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    // Check if dismissed today
    const dismissedDate = localStorage.getItem("sijakon_announcement_dismissed");
    const todayStr = new Date().toISOString().slice(0, 10);

    if (dismissedDate !== todayStr) {
      // Small delay on page load for smooth entry
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [forceOpen]);

  const handleClose = () => {
    if (dontShowToday) {
      const todayStr = new Date().toISOString().slice(0, 10);
      localStorage.setItem("sijakon_announcement_dismissed", todayStr);
    }
    setIsOpen(false);
    if (onClose) onClose();
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  if (!isOpen) return null;

  const slide = SLIDES[currentSlide];
  const IconComponent = slide.icon;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.75)",
      backdropFilter: "blur(8px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      animation: "modalFadeIn 0.3s ease",
    }}>
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: 620,
        background: "#FFFFFF",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 25px 70px rgba(0,0,0,0.35)",
        border: "1px solid rgba(255,255,255,0.4)",
      }}>
        {/* Modal Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 10,
            background: "rgba(0,0,0,0.3)",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background 0.2s ease",
          }}
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        {/* Slide Visual Header Banner */}
        <div style={{
          background: slide.gradient,
          padding: "36px 32px 30px",
          color: "#FFFFFF",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Subtle background decoration */}
          <div style={{
            position: "absolute",
            right: -20,
            bottom: -20,
            opacity: 0.15,
            pointerEvents: "none",
          }}>
            <IconComponent size={160} strokeWidth={1} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(6px)",
              fontSize: "0.72rem",
              fontWeight: 800,
              padding: "4px 12px",
              borderRadius: 99,
              textTransform: "uppercase",
              letterSpacing: "0.6px",
            }}>
              {slide.tag}
            </span>
            <span style={{ fontSize: "0.75rem", opacity: 0.85, display: "flex", alignItems: "center", gap: 4 }}>
              <Calendar size={13} /> {slide.date}
            </span>
          </div>

          <h3 style={{
            fontSize: "1.35rem",
            fontWeight: 800,
            lineHeight: 1.3,
            margin: "0 0 10px 0",
            maxWidth: 480,
          }}>
            {slide.title}
          </h3>
        </div>

        {/* Slide Body Content */}
        <div style={{ padding: "26px 32px" }}>
          <p style={{
            fontSize: "0.92rem",
            color: "#475569",
            lineHeight: 1.65,
            margin: "0 0 24px 0",
          }}>
            {slide.desc}
          </p>

          {/* Carousel Navigation Dots & Buttons */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            {/* Dots */}
            <div style={{ display: "flex", gap: 6 }}>
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  style={{
                    width: currentSlide === idx ? 24 : 8,
                    height: 8,
                    borderRadius: 99,
                    border: "none",
                    background: currentSlide === idx ? "#1B3061" : "#CBD5E1",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  aria-label={`Pindah ke slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next buttons */}
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={prevSlide}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "1px solid #E2E8F0",
                  background: "#FFFFFF",
                  color: "#1B3061",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextSlide}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "1px solid #E2E8F0",
                  background: "#FFFFFF",
                  color: "#1B3061",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Action Area */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 16,
            borderTop: "1px solid #F1F5F9",
            flexWrap: "wrap",
            gap: 12,
          }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "#64748B", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={dontShowToday}
                onChange={(e) => setDontShowToday(e.target.checked)}
                style={{ accentColor: "#1B3061", width: 16, height: 16, cursor: "pointer" }}
              />
              <span>Jangan tampilkan lagi hari ini</span>
            </label>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleClose}
                style={{
                  padding: "9px 18px",
                  borderRadius: 10,
                  border: "1px solid #CBD5E1",
                  background: "#FFFFFF",
                  color: "#475569",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                Tutup
              </button>
              <Link
                href={slide.actionHref}
                onClick={handleClose}
                style={{
                  padding: "9px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: "#1B3061",
                  color: "#FFC000",
                  fontWeight: 800,
                  fontSize: "0.82rem",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {slide.actionText} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

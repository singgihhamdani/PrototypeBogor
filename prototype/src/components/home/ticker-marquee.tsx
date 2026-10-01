"use client";
import { Megaphone, Bell, ChevronRight, Info } from "lucide-react";

interface TickerMarqueeProps {
  onOpenAnnouncement?: () => void;
}

const TICKER_ITEMS = [
  "⚡ Sinkronisasi Data SIJAKON Kabupaten Bogor & SIPJAKI Kementerian PUPR Periode Q3-2026 telah rampung dengan kepatuhan 95%.",
  "📢 Pendaftaran Bimtek Standar Manajemen Keselamatan Konstruksi (SMKK) Angkatan IV dibuka s.d 15 Oktober 2026 — Kuota terbatas.",
  "🔍 Audit Lapangan Pengawasan Tertib Penyelenggaraan SIMAK Tahap II serentak di 40 Kecamatan se-Kabupaten Bogor.",
  "📜 Wajib Pemutakhiran Data Perizinan Berusaha (NIB & SBU) bagi 416 BUJK Aktif terdaftar sebelum 31 Oktober 2026.",
  "👷 Fasilitasi Uji Sertifikasi Kompetensi Kerja (SKK) Konstruksi Jenjang 1 s.d 7 Terbuka untuk Tenaga Kerja Lokal Bogor.",
];

export default function TickerMarquee({ onOpenAnnouncement }: TickerMarqueeProps) {
  return (
    <div style={{
      width: "100%",
      background: "#0F1E3D",
      borderBottom: "1px solid rgba(255, 192, 0, 0.25)",
      color: "#FFFFFF",
      height: 40,
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
      position: "relative",
      zIndex: 10,
      fontSize: "0.8rem",
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      {/* Static Left Label Badge */}
      <div style={{
        background: "#1B3061",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 18px",
        fontWeight: 800,
        fontSize: "0.72rem",
        letterSpacing: "0.8px",
        color: "#FFC000",
        textTransform: "uppercase",
        flexShrink: 0,
        zIndex: 5,
        borderRight: "1px solid rgba(255, 192, 0, 0.3)",
        boxShadow: "4px 0 12px rgba(0,0,0,0.2)",
      }}>
        <span style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#FFC000",
          boxShadow: "0 0 0 3px rgba(255,192,0,0.3)",
          animation: "tickerPulse 1.8s infinite",
        }} />
        <Megaphone size={14} />
        <span>INFO TERKINI</span>
      </div>

      {/* Marquee Content Track */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          whiteSpace: "nowrap",
          position: "relative",
          display: "flex",
          alignItems: "center",
        }}
        className="ticker-track-container"
      >
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
            <span
              key={idx}
              style={{
                display: "inline-block",
                padding: "0 32px",
                color: "#E2E8F0",
                fontWeight: 500,
                cursor: "pointer",
              }}
              onClick={onOpenAnnouncement}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Right Action Button */}
      {onOpenAnnouncement && (
        <button
          onClick={onOpenAnnouncement}
          style={{
            height: "100%",
            background: "rgba(255, 192, 0, 0.12)",
            border: "none",
            borderLeft: "1px solid rgba(255, 192, 0, 0.2)",
            color: "#FFC000",
            padding: "0 14px",
            fontSize: "0.72rem",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            whiteSpace: "nowrap",
            flexShrink: 0,
            zIndex: 5,
            transition: "background 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255, 192, 0, 0.25)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255, 192, 0, 0.12)"; }}
        >
          <span>Buka Pengumuman</span>
          <ChevronRight size={14} />
        </button>
      )}

      <style>{`
        @keyframes tickerPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        .ticker-track {
          display: inline-block;
          white-space: nowrap;
          animation: tickerScroll 48s linear infinite;
        }

        .ticker-track-container:hover .ticker-track {
          animation-play-state: paused;
        }

        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

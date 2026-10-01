"use client";
import React from "react";
import Link from "next/link";
import { Users, Calendar, Wallet, MapPin, Target, ArrowRight, CheckCircle2 } from "lucide-react";
import { TertibType, TERTIB_CONFIGS } from "@/lib/tertib-config";

interface PerencanaanCardGridProps {
  tertibType: TertibType;
  stats?: {
    sdmCount?: number;
    timelineActive?: string;
    anggaranTotal?: string;
    objekCount?: number;
    targetPercent?: number;
  };
}

export default function PerencanaanCardGrid({ tertibType, stats }: PerencanaanCardGridProps) {
  const config = TERTIB_CONFIGS[tertibType];
  const basePath = `/pengawasan/${tertibType}/perencanaan`;

  const cards = [
    {
      slug: "sdm",
      cat: "Personalia",
      title: "Sumber Daya Manusia",
      desc: "Pengaturan, alokasi personil, dan penetapan SK Tim Pengawas kegiatan pengawasan di lapangan.",
      icon: Users,
      metric: stats?.sdmCount ? `${stats.sdmCount} Personil Ditugaskan` : "6 Personil Aktif",
      status: "Terverifikasi",
      accentBg: "#EBF2FA",
      accentColor: "#1B3061"
    },
    {
      slug: "timeline",
      cat: "Penjadwalan",
      title: "Timeline Pelaksanaan",
      desc: "Manajemen jadwal triwulan, periode audit lapangan, dan jangka waktu pengawasan sepanjang tahun.",
      icon: Calendar,
      metric: stats?.timelineActive || "Triwulan II (Apr - Jun)",
      status: "Berjalan Aktif",
      accentBg: "#FEF3C7",
      accentColor: "#92400E"
    },
    {
      slug: "anggaran",
      cat: "Finansial",
      title: "Anggaran Pengawasan",
      desc: "Rencana alokasi dana APBD/DAK, monitoring serapan realisasi, dan RKA kegiatan pengawasan.",
      icon: Wallet,
      metric: stats?.anggaranTotal || "Rp 305.000.000 (Pagu)",
      status: "Realisasi 48%",
      accentBg: "#DCFCE7",
      accentColor: "#166534"
    },
    {
      slug: "pemetaan",
      cat: "Objek Pengawasan",
      title: "Pemetaan Objek",
      desc: "Daftar pemetaan wilayah, lokasi BUJK/Paket strategis di 40 Kecamatan se-Kabupaten Bogor.",
      icon: MapPin,
      metric: stats?.objekCount ? `${stats.objekCount} Titik Objek Terdata` : "42 Titik Objek Terdata",
      status: "Prioritas Terpetakan",
      accentBg: "#EDE9FE",
      accentColor: "#5B21B6"
    },
    {
      slug: "target",
      cat: "Target & Sasaran",
      title: "Target Pengawasan",
      desc: "Penetapan target kuantitatif dan kualitatif pencapaian pengawasan sesuai target IKU Dinas PUPR.",
      icon: Target,
      metric: stats?.targetPercent ? `${stats.targetPercent}% Capaian Sasaran` : "68% Capaian Sasaran",
      status: "Target On-Track",
      accentBg: "#FCE7F3",
      accentColor: "#9D174D"
    }
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
      {cards.map((card) => {
        const Icon = card.icon;
        const href = `${basePath}/${card.slug}`;

        return (
          <Link
            key={card.slug}
            href={href}
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "24px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 16px rgba(15, 46, 92, 0.04)",
              textDecoration: "none",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = "0 14px 28px rgba(15, 46, 92, 0.12)";
              e.currentTarget.style.borderColor = config.accentColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(15, 46, 92, 0.04)";
              e.currentTarget.style.borderColor = "#E2E8F0";
            }}
          >
            {/* Top row: Category Badge & Status */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                  backgroundColor: card.accentBg,
                  color: card.accentColor,
                  padding: "4px 10px",
                  borderRadius: "9999px"
                }}
              >
                {card.cat}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#10B981",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <CheckCircle2 style={{ width: "12px", height: "12px" }} />
                <span>{card.status}</span>
              </span>
            </div>

            {/* Icon Box */}
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                backgroundColor: card.accentBg,
                color: card.accentColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px"
              }}
            >
              <Icon style={{ width: "26px", height: "26px" }} />
            </div>

            {/* Title & Desc */}
            <h3
              style={{
                fontSize: "17px",
                fontWeight: 800,
                color: "#1E293B",
                margin: "0 0 8px 0",
                lineHeight: 1.3
              }}
            >
              {card.title}
            </h3>
            <p
              style={{
                fontSize: "12px",
                color: "#64748B",
                margin: "0 0 20px 0",
                lineHeight: 1.5,
                flex: 1
              }}
            >
              {card.desc}
            </p>

            {/* Bottom info & Arrow */}
            <div
              style={{
                paddingTop: "14px",
                borderTop: "1px solid #F1F5F9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "10px", color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>
                  Ringkasan Data:
                </span>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F2E5C", marginTop: "2px" }}>
                  {card.metric}
                </span>
              </div>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#F8FAFC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: config.accentColor
                }}
              >
                <ArrowRight style={{ width: "16px", height: "16px" }} />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

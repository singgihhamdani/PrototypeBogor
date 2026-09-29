"use client";
import React from "react";

interface LogoProps {
  size?: number;
  showText?: boolean;
  theme?: "dark" | "light"; // dark = for dark backgrounds (white text), light = for light backgrounds (navy text)
  subtitle?: string;
}

/**
 * Official Brand Mark for SIJAKON Kab. Bogor
 * Symbolizing:
 * - Golden Structural Arch (Kementerian PUPR Bridge & Infrastructure)
 * - Tri-Pillar Foundation (Tertib Usaha, Penyelenggaraan, Pemanfaatan)
 * - Industrial Gear & Compass (Civil Engineering & Construction)
 * - Deep Navy (#0F2E5C) and Construction Gold (#FFC000)
 */
export function BrandIcon({ size = 38 }: { size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <defs>
        {/* Navy Gradient for Badge Background */}
        <linearGradient id="puprNavyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#07182E" />
          <stop offset="60%" stopColor="#0F2E5C" />
          <stop offset="100%" stopColor="#1B4D8E" />
        </linearGradient>

        {/* PUPR Gold Gradient */}
        <linearGradient id="puprGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="40%" stopColor="#FFC000" />
          <stop offset="100%" stopColor="#E09B00" />
        </linearGradient>

        {/* Subtle Drop Shadow for 3D depth */}
        <filter id="badgeShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#07182E" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Rounded Hexagonal Shield / Gear Base */}
      <rect 
        x="2" 
        y="2" 
        width="44" 
        height="44" 
        rx="12" 
        fill="url(#puprNavyGrad)" 
        stroke="url(#puprGoldGrad)" 
        strokeWidth="1.75"
        filter="url(#badgeShadow)"
      />

      {/* Outer Gear Teeth / Technical Accents */}
      <circle cx="24" cy="24" r="18.5" stroke="rgba(255, 192, 0, 0.25)" strokeWidth="1" strokeDasharray="2 3" />

      {/* Foundation Base Line (Jasa Konstruksi) */}
      <path 
        d="M11 36H37" 
        stroke="url(#puprGoldGrad)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
      />

      {/* 3 Foundation Pillars (3 Pilar Utama Pengawasan) */}
      {/* Left Pillar */}
      <path d="M16 35V24" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
      {/* Center Pillar */}
      <path d="M24 35V19" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
      {/* Right Pillar */}
      <path d="M32 35V24" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />

      {/* Golden Structural Arch / Monumental Bridge (PUPR Infrastructure) */}
      <path 
        d="M12 33C12 21 16.5 13 24 13C31.5 13 36 21 36 33" 
        stroke="url(#puprGoldGrad)" 
        strokeWidth="2.75" 
        strokeLinecap="round" 
      />

      {/* Suspension / Cable-Stayed Lines */}
      <path d="M24 14L16 26" stroke="rgba(255, 192, 0, 0.6)" strokeWidth="1.2" strokeLinecap="round" />
      {/* Right cable */}
      <path d="M24 14L32 26" stroke="rgba(255, 192, 0, 0.6)" strokeWidth="1.2" strokeLinecap="round" />

      {/* Keystone Arch Diamond / Crown Beacon */}
      <polygon 
        points="24,8 27.5,12.5 24,16 20.5,12.5" 
        fill="url(#puprGoldGrad)" 
      />
      <circle cx="24" cy="12.5" r="1.2" fill="#07182E" />
    </svg>
  );
}

export default function Logo({ 
  size = 38, 
  showText = true, 
  theme = "dark",
  subtitle = "KABUPATEN BOGOR"
}: LogoProps) {
  const isDark = theme === "dark";

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
      <BrandIcon size={size} />

      {showText && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span 
              style={{ 
                fontSize: size >= 44 ? "18px" : "15px", 
                fontWeight: 900, 
                color: isDark ? "#FFFFFF" : "#0F172A", 
                letterSpacing: "-0.3px" 
              }}
            >
              SIJAKON
            </span>
            <span 
              style={{ 
                height: "6px", 
                width: "6px", 
                borderRadius: "9999px", 
                backgroundColor: "#FFC000",
                display: "inline-block"
              }} 
            />
          </div>
          <span 
            style={{ 
              fontSize: size >= 44 ? "10px" : "9px", 
              fontWeight: 800, 
              color: isDark ? "#FFC000" : "#0F2E5C", 
              letterSpacing: "0.8px",
              textTransform: "uppercase"
            }}
          >
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
}

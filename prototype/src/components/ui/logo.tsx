"use client";
import React from "react";

interface LogoProps {
  size?: number;
  showText?: boolean;
  theme?: "dark" | "light"; // dark = for dark backgrounds, light = for light backgrounds
  subtitle?: string;
}

/**
 * Official Brand Mark for SIJAKON Kab. Bogor
 * Loaded directly from the official logo asset: /logo-sijakon.png
 * (S-curve Kujang infrastructure emblem + Bogor Istimewa dan Gemilang)
 */
export function BrandIcon({ 
  size = 38,
  className = "",
  style = {},
  bgBadge = false,
}: { 
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  bgBadge?: boolean;
}) {
  const imgElement = (
    <img
      src="/logo-sijakon.png"
      alt="Logo SIJAKON Kabupaten Bogor"
      width={size}
      height={size}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: "contain",
        flexShrink: 0,
        display: "inline-block",
        ...style,
      }}
    />
  );

  if (bgBadge) {
    return (
      <div style={{
        width: `${size + 8}px`,
        height: `${size + 8}px`,
        borderRadius: "10px",
        backgroundColor: "#FFFFFF",
        padding: "4px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        flexShrink: 0
      }}>
        {imgElement}
      </div>
    );
  }

  return imgElement;
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
      <div style={{
        width: size,
        height: size,
        borderRadius: "10px",
        backgroundColor: isDark ? "#FFFFFF" : "transparent",
        padding: isDark ? "3px" : "0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.15)" : "none"
      }}>
        <img
          src="/logo-sijakon.png"
          alt="SIJAKON"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

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

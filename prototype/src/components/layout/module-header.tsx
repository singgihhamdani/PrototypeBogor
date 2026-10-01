"use client";
import React from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft, Download, Plus, Filter, ShieldCheck, Sparkles } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface ModuleHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  badgeText?: string;
  badgeBg?: string;
  badgeColor?: string;
  title: string;
  description?: string;
  legalBasis?: string;
  actionButtons?: {
    label: string;
    icon?: any;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "outline";
    href?: string;
  }[];
  backHref?: string;
}

export default function ModuleHeader({
  breadcrumbs,
  badgeText,
  badgeBg = "#EBF2FA",
  badgeColor = "#0F2E5C",
  title,
  description,
  legalBasis,
  actionButtons,
  backHref
}: ModuleHeaderProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "8px" }}>
      {/* Breadcrumb line */}
      <nav 
        aria-label="Breadcrumb"
        style={{ 
          display: "flex", 
          alignItems: "center", 
          flexWrap: "wrap", 
          gap: "6px", 
          fontSize: "12px", 
          color: "#64748B" 
        }}
      >
        {backHref && (
          <Link
            href={backHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              marginRight: "6px",
              padding: "2px 8px",
              borderRadius: "6px",
              backgroundColor: "#F1F5F9",
              color: "#0F2E5C",
              fontWeight: 700,
              textDecoration: "none",
              fontSize: "11px"
            }}
          >
            <ArrowLeft style={{ width: "12px", height: "12px" }} />
            <span>Kembali</span>
          </Link>
        )}
        <Link href="/dashboard" style={{ color: "#64748B", textDecoration: "none", fontWeight: 600 }}>
          Dashboard
        </Link>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight style={{ width: "12px", height: "12px", color: "#94A3B8" }} />
            {crumb.href ? (
              <Link 
                href={crumb.href} 
                style={{ 
                  color: idx === breadcrumbs.length - 1 ? "#0F2E5C" : "#64748B", 
                  textDecoration: "none", 
                  fontWeight: idx === breadcrumbs.length - 1 ? 800 : 600 
                }}
              >
                {crumb.label}
              </Link>
            ) : (
              <span style={{ color: "#0F2E5C", fontWeight: 800 }}>{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Main Header Content */}
      <div 
        style={{ 
          display: "flex", 
          alignItems: "flex-start", 
          justifyContent: "space-between", 
          flexWrap: "wrap", 
          gap: "16px" 
        }}
      >
        <div style={{ flex: 1, minWidth: "280px" }}>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "6px" }}>
            {badgeText && (
              <span 
                style={{ 
                  fontSize: "11px", 
                  fontWeight: 800, 
                  color: badgeColor, 
                  backgroundColor: badgeBg, 
                  padding: "3px 10px", 
                  borderRadius: "9999px", 
                  textTransform: "uppercase", 
                  letterSpacing: "0.5px" 
                }}
              >
                {badgeText}
              </span>
            )}
            {legalBasis && (
              <span 
                style={{ 
                  fontSize: "11px", 
                  color: "#475569", 
                  backgroundColor: "#F1F5F9", 
                  padding: "3px 10px", 
                  borderRadius: "9999px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <ShieldCheck style={{ width: "12px", height: "12px", color: "#2563EB" }} />
                <span>{legalBasis}</span>
              </span>
            )}
          </div>
          
          <h1 
            style={{ 
              fontSize: "24px", 
              fontWeight: 900, 
              color: "#0F172A", 
              margin: 0, 
              letterSpacing: "-0.5px" 
            }}
          >
            {title}
          </h1>

          {description && (
            <p style={{ fontSize: "13px", color: "#64748B", margin: "6px 0 0 0", maxWidth: "800px", lineHeight: 1.5 }}>
              {description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {actionButtons && actionButtons.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            {actionButtons.map((btn, idx) => {
              const Icon = btn.icon;
              const isPrimary = btn.variant === "primary";
              const isOutline = btn.variant === "outline";

              const btnStyle: React.CSSProperties = {
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "10px",
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                textDecoration: "none",
                transition: "all 0.15s ease",
                backgroundColor: isPrimary ? "#0F2E5C" : isOutline ? "transparent" : "#FFFFFF",
                color: isPrimary ? "#FFFFFF" : isOutline ? "#0F2E5C" : "#334155",
                border: isPrimary ? "1px solid #0F2E5C" : "1px solid #CBD5E1",
                boxShadow: isPrimary ? "0 2px 6px rgba(15, 46, 92, 0.2)" : "0 1px 2px rgba(0,0,0,0.04)"
              };

              if (btn.href) {
                return (
                  <Link key={idx} href={btn.href} style={btnStyle}>
                    {Icon && <Icon style={{ width: "14px", height: "14px", color: isPrimary ? "#FFC000" : undefined }} />}
                    <span>{btn.label}</span>
                  </Link>
                );
              }

              return (
                <button key={idx} onClick={btn.onClick} style={btnStyle}>
                  {Icon && <Icon style={{ width: "14px", height: "14px", color: isPrimary ? "#FFC000" : undefined }} />}
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

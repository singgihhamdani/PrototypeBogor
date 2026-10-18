"use client";
import React from "react";
import Link from "next/link";
import { ArrowUpRight, FileSpreadsheet, MapPin, ExternalLink } from "lucide-react";
import { AiAction } from "@/lib/ai/ai-data-engine";

interface AiActionCardProps {
  actions: AiAction[];
  onActionClick?: (action: AiAction) => void;
}

export default function AiActionCard({ actions, onActionClick }: AiActionCardProps) {
  if (!actions || actions.length === 0) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px", paddingTop: "10px", borderTop: "1px dashed #CBD5E1" }}>
      {actions.map((act, idx) => {
        const isWebgis = act.url?.includes("webgis");
        const isExport = act.type === "export" || act.label.toLowerCase().includes("excel");

        const content = (
          <>
            {isWebgis ? (
              <MapPin style={{ width: "13px", height: "13px", color: "#0F2E5C" }} />
            ) : isExport ? (
              <FileSpreadsheet style={{ width: "13px", height: "13px", color: "#059669" }} />
            ) : (
              <ExternalLink style={{ width: "13px", height: "13px", color: "#0F2E5C" }} />
            )}
            <span>{act.label}</span>
            <ArrowUpRight style={{ width: "11px", height: "11px", opacity: 0.6 }} />
          </>
        );

        if (act.url) {
          return (
            <Link
              key={idx}
              href={act.url}
              onClick={() => onActionClick && onActionClick(act)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #CBD5E1",
                color: "#0F2E5C",
                fontSize: "11.5px",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F8FAFC";
                e.currentTarget.style.borderColor = "#94A3B8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FFFFFF";
                e.currentTarget.style.borderColor = "#CBD5E1";
              }}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={idx}
            type="button"
            onClick={() => onActionClick && onActionClick(act)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "8px",
              backgroundColor: "#EBF2FA",
              border: "1px solid #BFDBFE",
              color: "#0F2E5C",
              fontSize: "11.5px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              transition: "all 0.15s ease",
            }}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}

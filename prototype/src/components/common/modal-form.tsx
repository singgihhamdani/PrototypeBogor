"use client";
import React, { useEffect } from "react";
import { X, Loader2 } from "lucide-react";

export interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ style?: React.CSSProperties }>;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  headerBg?: string;
  hideFooter?: boolean;
}

export default function ModalForm({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: IconComponent,
  children,
  onSubmit,
  submitLabel = "Simpan Data",
  cancelLabel = "Batal",
  isLoading = false,
  size = "md",
  headerBg = "#0F2E5C",
  hideFooter = false
}: ModalFormProps) {
  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const maxWidth =
    size === "sm" ? "420px" : size === "lg" ? "740px" : size === "xl" ? "920px" : "560px";

  const content = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        padding: "16px"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "20px",
          width: "100%",
          maxWidth,
          boxShadow: "0 24px 48px -12px rgba(15, 46, 92, 0.25)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
          overflow: "hidden",
          animation: "modalSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            backgroundColor: headerBg,
            color: "#FFFFFF",
            padding: "16px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {IconComponent && (
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFC000"
                }}
              >
                <IconComponent style={{ width: "18px", height: "18px" }} />
              </div>
            )}
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 800, margin: 0, color: "#FFFFFF" }}>
                {title}
              </h3>
              {subtitle && (
                <p style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.75)", margin: "2px 0 0 0" }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{
              background: "transparent",
              border: "none",
              color: "#FFFFFF",
              opacity: 0.8,
              cursor: isLoading ? "not-allowed" : "pointer",
              padding: "4px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        {/* Modal Body & Form */}
        {onSubmit ? (
          <form
            onSubmit={onSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              overflow: "hidden"
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                overflowY: "auto",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "14px"
              }}
            >
              {children}
            </div>

            {!hideFooter && (
              <div
                style={{
                  padding: "14px 24px",
                  borderTop: "1px solid #E2E8F0",
                  backgroundColor: "#F8FAFC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "10px",
                  flexShrink: 0
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "10px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    color: "#475569",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: isLoading ? "not-allowed" : "pointer"
                  }}
                >
                  {cancelLabel}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "10px",
                    backgroundColor: "#0F2E5C",
                    border: "none",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 6px rgba(15, 46, 92, 0.2)"
                  }}
                >
                  {isLoading && <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />}
                  <span>{submitLabel}</span>
                </button>
              </div>
            )}
          </form>
        ) : (
          <div
            style={{
              padding: "20px 24px",
              overflowY: "auto",
              flex: 1
            }}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );

  return content;
}

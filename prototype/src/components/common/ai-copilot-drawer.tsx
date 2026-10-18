"use client";
import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { 
  Sparkles, X, Send, Bot, User, Trash2, ArrowRight,
  Maximize2, Minimize2, Lightbulb, Shield, FileText, ChevronRight
} from "lucide-react";
import { 
  ChatMessage, 
  getContextualQuickPrompts, 
  processUserQuery, 
  CopilotContext 
} from "@/lib/ai/ai-copilot-service";
import AiActionCard from "./ai-action-card";
import { useResponsive } from "@/lib/use-responsive";

export const OPEN_AI_COPILOT_EVENT = "open-ai-copilot";

export function openAiCopilot() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_AI_COPILOT_EVENT));
  }
}

export default function AiCopilotDrawer() {
  const pathname = usePathname();
  const { isMobile, isMounted } = useResponsive();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic contextual quick prompts
  const quickPrompts = getContextualQuickPrompts(pathname);

  // Listen for global open event and keyboard shortcut (Ctrl + /)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener(OPEN_AI_COPILOT_EVENT, handleOpen);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener(OPEN_AI_COPILOT_EVENT, handleOpen);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome-1",
          sender: "ai",
          text:
            `Halo! Saya **SIJAKON AI Copilot**, asisten cerdas resmi Dinas Pekerjaan Umum Kabupaten Bogor. 🏛️✨\n\n` +
            `Saya siap membantu Anda dalam:\n` +
            `• **Analisis Data Lapangan:** Deteksi proyek kritis (deviasi minus), serapan anggaran, kepatuhan BUJK & K3.\n` +
            `• **Konsultasi Regulasi:** Tanya jawab 11 dasar hukum (UU 2/2017, PP 22/2020, Permen PUPR 1/2023 tentang SIMAK, Perda Jabar 6/2024).\n` +
            `• **Ringkasan Eksekutif:** Menyiapkan memo pimpinan untuk bahan rapat koordinasi.\n\n` +
            `Pilih salah satu saran cepat di bawah atau ketikkan pertanyaan Anda:`,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          actions: [
            { label: "Ringkasan Eksekutif Pimpinan", url: "/" },
            { label: "Cek Proyek Kritis", url: "/paket-pekerjaan" },
            { label: "Pedoman SIMAK 1/2023", url: "/regulasi" },
          ],
        },
      ]);
    }
  }, [messages.length]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsgId = `user-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputMessage("");
    setIsTyping(true);

    const context: CopilotContext = {
      pathname,
      roleName: "Super Admin DPU",
      userName: "Ir. H. Raden Ridwan, ST., MT.",
    };

    try {
      // Simulate slight realistic processing latency
      setTimeout(async () => {
        const result = await processUserQuery(query, context);
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: result.text,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          actions: result.actions,
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
      }, 500);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: "Maaf, terjadi kendala saat memproses analisis data. Silakan coba sesaat lagi.",
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Hapus seluruh riwayat percakapan AI Copilot?")) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          sender: "ai",
          text: "Riwayat percakapan telah dibersihkan. Ada data atau regulasi yang ingin Anda tanyakan kembali?",
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  };

  // Basic markdown-like parser for bold, bullets, and linebreaks
  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, lIdx) => {
      // Parse **bold** and `code`
      const formattedLine = line
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/`(.*?)`/g, "<code style='background:#F1F5F9; padding:2px 5px; border-radius:4px; font-size:11px; font-family:monospace; color:#0F2E5C;'>$1</code>");

      if (line.startsWith("### ")) {
        return (
          <h4 key={lIdx} style={{ fontSize: "13px", fontWeight: 800, color: "#0F2E5C", margin: "10px 0 4px 0" }} dangerouslySetInnerHTML={{ __html: formattedLine.replace("### ", "") }} />
        );
      }

      if (line.startsWith("• ") || line.startsWith("- ")) {
        return (
          <div key={lIdx} style={{ display: "flex", gap: "6px", marginLeft: "4px", marginBottom: "3px" }}>
            <span style={{ color: "#0F2E5C", fontWeight: 800 }}>•</span>
            <span dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[•-]\s+/, "") }} />
          </div>
        );
      }

      if (line.trim() === "---") {
        return <hr key={lIdx} style={{ border: "none", borderTop: "1px solid #E2E8F0", margin: "10px 0" }} />;
      }

      return (
        <p key={lIdx} style={{ margin: "0 0 6px 0", minHeight: line.trim() ? "auto" : "6px" }} dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    });
  };

  return (
    <>
      {/* 1. Seamless & Clean Floating Action Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          title="Tanya SIJAKON AI (Pintasan: Ctrl + /)"
          style={{
            position: "fixed",
            bottom: isMounted && isMobile ? "calc(20px + env(safe-area-inset-bottom, 0px))" : "24px",
            right: isMounted && isMobile ? "16px" : "24px",
            zIndex: 9998,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "7px",
            height: isMounted && isMobile ? "48px" : "38px",
            width: isMounted && isMobile ? "48px" : "auto",
            padding: isMounted && isMobile ? "0" : "0 14px",
            borderRadius: "9999px",
            backgroundColor: "rgba(15, 46, 92, 0.94)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            color: "#FFFFFF",
            border: "1px solid rgba(255, 192, 0, 0.35)",
            boxShadow: "0 6px 18px -2px rgba(15, 46, 92, 0.28), 0 2px 6px rgba(0, 0, 0, 0.06)",
            cursor: "pointer",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.backgroundColor = "rgba(15, 46, 92, 0.98)";
            e.currentTarget.style.borderColor = "#FFC000";
            e.currentTarget.style.boxShadow = "0 10px 24px -2px rgba(15, 46, 92, 0.38)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.backgroundColor = "rgba(15, 46, 92, 0.94)";
            e.currentTarget.style.borderColor = "rgba(255, 192, 0, 0.35)";
            e.currentTarget.style.boxShadow = "0 6px 18px -2px rgba(15, 46, 92, 0.28), 0 2px 6px rgba(0, 0, 0, 0.06)";
          }}
        >
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles style={{ width: isMounted && isMobile ? "18px" : "15px", height: isMounted && isMobile ? "18px" : "15px", color: "#FFC000" }} />
            <span
              style={{
                position: "absolute",
                top: "-2px",
                right: "-2px",
                height: "7px",
                width: "7px",
                borderRadius: "9999px",
                backgroundColor: "#10B981",
                boxShadow: "0 0 0 1.5px #0F2E5C",
              }}
            />
          </div>

          {(!isMounted || !isMobile) && (
            <>
              <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.2px" }}>
                AI Copilot
              </span>
              <kbd
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  fontSize: "9.5px",
                  fontWeight: 700,
                  color: "#CBD5E1",
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  padding: "1px 5px",
                  borderRadius: "4px",
                  marginLeft: "2px",
                  letterSpacing: "0.2px",
                }}
              >
                Ctrl /
              </kbd>
            </>
          )}
        </button>
      )}

      {/* 2. Interactive Copilot Drawer Dialog */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: isMinimized ? "24px" : (isMounted && isMobile ? "0px" : "16px"),
            right: isMounted && isMobile ? "0px" : "16px",
            zIndex: 9999,
            width: isMounted && isMobile ? "100vw" : "calc(100vw - 32px)",
            maxWidth: isMounted && isMobile ? "100vw" : "460px",
            height: isMinimized ? "64px" : (isMounted && isMobile ? "88vh" : "680px"),
            maxHeight: isMounted && isMobile ? "92vh" : "calc(100vh - 32px)",
            borderRadius: isMounted && isMobile ? "24px 24px 0 0" : "20px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #CBD5E1",
            boxShadow: "0 25px 50px -12px rgba(15, 46, 92, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            transition: "height 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              padding: "14px 18px",
              backgroundColor: "#0F2E5C",
              color: "#FFFFFF",
              borderBottom: "3px solid #FFC000",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  height: "36px",
                  width: "36px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  border: "1px solid rgba(255, 192, 0, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkles style={{ width: "18px", height: "18px", color: "#FFC000" }} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 800, margin: 0, color: "#FFFFFF" }}>
                    SIJAKON AI Copilot
                  </h3>
                  <span
                    style={{
                      fontSize: "9.5px",
                      fontWeight: 800,
                      backgroundColor: "#059669",
                      color: "#FFFFFF",
                      padding: "1px 6px",
                      borderRadius: "9999px",
                      letterSpacing: "0.2px",
                    }}
                  >
                    ONLINE
                  </span>
                </div>
                <p style={{ fontSize: "11px", color: "#94A3B8", margin: "2px 0 0 0" }}>
                  Intelijen Analisis & Regulasi Jasa Konstruksi
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {!isMinimized && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Hapus Percakapan"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94A3B8",
                    cursor: "pointer",
                    padding: "6px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
                >
                  <Trash2 style={{ width: "16px", height: "16px" }} />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Perbesar" : "Kecilkan"}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94A3B8",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
              >
                {isMinimized ? <Maximize2 style={{ width: "16px", height: "16px" }} /> : <Minimize2 style={{ width: "16px", height: "16px" }} />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Tutup AI Copilot"
                style={{
                  background: "none",
                  border: "none",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Context Pill Indicator */}
              <div
                style={{
                  padding: "6px 14px",
                  backgroundColor: "#F8FAFC",
                  borderBottom: "1px solid #E2E8F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  color: "#64748B",
                  flexShrink: 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <Shield style={{ width: "12px", height: "12px", color: "#0F2E5C" }} />
                  <span>Konteks: <strong>{pathname === "/" ? "Dashboard Eksekutif" : pathname.replace("/", "").replace("-", " ").toUpperCase()}</strong></span>
                </div>
                <span style={{ fontSize: "10.5px", color: "#059669", fontWeight: 700 }}>• SIPJAKI Ready</span>
              </div>

              {/* Message History Area */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  backgroundColor: "#F8FAFC",
                }}
              >
                {messages.map((msg) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isUser ? "flex-end" : "flex-start",
                        gap: "4px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          gap: "8px",
                          flexDirection: isUser ? "row-reverse" : "row",
                          maxWidth: "92%",
                        }}
                      >
                        {/* Avatar */}
                        <div
                          style={{
                            height: "28px",
                            width: "28px",
                            borderRadius: "8px",
                            backgroundColor: isUser ? "#0F2E5C" : "#EBF2FA",
                            color: isUser ? "#FFFFFF" : "#0F2E5C",
                            border: isUser ? "none" : "1px solid #BFDBFE",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {isUser ? <User style={{ width: "14px", height: "14px" }} /> : <Bot style={{ width: "15px", height: "15px", color: "#0F2E5C" }} />}
                        </div>

                        {/* Bubble Content */}
                        <div
                          style={{
                            padding: "12px 14px",
                            borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                            backgroundColor: isUser ? "#0F2E5C" : "#FFFFFF",
                            color: isUser ? "#FFFFFF" : "#1E293B",
                            border: isUser ? "none" : "1px solid #E2E8F0",
                            boxShadow: isUser ? "0 2px 6px rgba(15, 46, 92, 0.2)" : "0 1px 3px rgba(0, 0, 0, 0.04)",
                            fontSize: "12.5px",
                            lineHeight: 1.5,
                            wordBreak: "break-word",
                          }}
                        >
                          {isUser ? (
                            <p style={{ margin: 0 }}>{msg.text}</p>
                          ) : (
                            <div>
                              {renderFormattedText(msg.text)}
                              {msg.actions && msg.actions.length > 0 && (
                                <AiActionCard actions={msg.actions} />
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <span style={{ fontSize: "10px", color: "#94A3B8", padding: "0 36px" }}>
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        height: "28px",
                        width: "28px",
                        borderRadius: "8px",
                        backgroundColor: "#EBF2FA",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Bot style={{ width: "15px", height: "15px", color: "#0F2E5C" }} />
                    </div>
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: "14px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span style={{ height: "6px", width: "6px", borderRadius: "9999px", backgroundColor: "#0F2E5C", animation: "bounce 1s infinite 0ms" }} />
                      <span style={{ height: "6px", width: "6px", borderRadius: "9999px", backgroundColor: "#0F2E5C", animation: "bounce 1s infinite 200ms" }} />
                      <span style={{ height: "6px", width: "6px", borderRadius: "9999px", backgroundColor: "#0F2E5C", animation: "bounce 1s infinite 400ms" }} />
                      <span style={{ fontSize: "11px", color: "#64748B", marginLeft: "4px" }}>Menganalisis basis data...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Contextual Quick Suggestion Chips */}
              <div
                style={{
                  padding: "8px 14px",
                  backgroundColor: "#FFFFFF",
                  borderTop: "1px solid #E2E8F0",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  overflowX: "auto",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#D97706", fontSize: "11px", fontWeight: 700, paddingRight: "4px" }}>
                  <Lightbulb style={{ width: "13px", height: "13px" }} />
                  <span>Saran:</span>
                </div>
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "9999px",
                      backgroundColor: "#F1F5F9",
                      border: "1px solid #E2E8F0",
                      color: "#334155",
                      fontSize: "11.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.15s ease",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#EBF2FA";
                      e.currentTarget.style.borderColor = "#93C5FD";
                      e.currentTarget.style.color = "#0F2E5C";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#F1F5F9";
                      e.currentTarget.style.borderColor = "#E2E8F0";
                      e.currentTarget.style.color = "#334155";
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                style={{
                  padding: "12px 14px",
                  backgroundColor: "#FFFFFF",
                  borderTop: "1px solid #E2E8F0",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexShrink: 0,
                }}
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ketik pertanyaan data atau regulasi jakon..."
                  disabled={isTyping}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: "12px",
                    border: "1px solid #CBD5E1",
                    fontSize: "12.5px",
                    outline: "none",
                    backgroundColor: "#F8FAFC",
                    color: "#0F172A",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#0F2E5C";
                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#CBD5E1";
                    e.currentTarget.style.backgroundColor = "#F8FAFC";
                  }}
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isTyping}
                  style={{
                    height: "38px",
                    width: "38px",
                    borderRadius: "10px",
                    backgroundColor: inputMessage.trim() && !isTyping ? "#0F2E5C" : "#E2E8F0",
                    color: inputMessage.trim() && !isTyping ? "#FFFFFF" : "#94A3B8",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: inputMessage.trim() && !isTyping ? "pointer" : "not-allowed",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Send style={{ width: "16px", height: "16px" }} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}

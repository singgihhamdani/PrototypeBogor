import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/mock-auth";

export const metadata: Metadata = {
  title: "SIJAKON BOGOR — Sistem Informasi Jasa Konstruksi Kabupaten Bogor",
  description: "Platform pembinaan, pengawasan, dan monitoring jasa konstruksi Kabupaten Bogor TA 2026 — terintegrasi SIPJAKI Kementerian PUPR.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

export interface PilarScoreDetail {
  key: "tertib-usaha" | "tertib-penyelenggaraan" | "tertib-pemanfaatan" | "sipjaki" | "pelatihan";
  label: string;
  bobotKumulatif: number;      // e.g. 20 (artinya 20%)
  target: number;              // Target perencanaan (e.g. 56)
  realisasi: number;           // Realisasi inspeksi (e.g. 56)
  indeksRealisasi: number;     // % Realisasi = (realisasi/target) * 100
  indeksPengawasan: number;    // % Tertimbang = indeksRealisasi * (bobot/100)
  color: string;               // Warna khas pilar
  innerColor?: string;         // Warna aksen cincin dalam
  desc: string;                // Keterangan lingkup
  statusKepatuhan: string;     // Kategori kepatuhan
}

export interface DashboardYearData {
  tahun: string;
  pilar: PilarScoreDetail[];
  totalTarget: number;
  totalRealisasi: number;
  totalIndeksPengawasan: number; // e.g. 74.43
  predikat: "Sangat Tertib" | "Tertib" | "Cukup Tertib" | "Kurang Tertib";
  predikatBadgeBg: string;
  predikatColor: string;
  ringkasanKinerja: string;
}

// Data Resmi Sesuai Tabel Excel Referensi DPU Kabupaten Bogor
export const SIPJAKI_YEARLY_DATA: Record<string, DashboardYearData> = {
  "2026": {
    tahun: "2026",
    pilar: [
      {
        key: "tertib-usaha",
        label: "Tertib Usaha",
        bobotKumulatif: 20,
        target: 56,
        realisasi: 56,
        indeksRealisasi: 100.0,
        indeksPengawasan: 20.00,
        color: "#0F2E5C",        // Navy Blue
        innerColor: "#2563EB",
        desc: "Kesesuaian Izin, NIB & SBU BUJK Kualifikasi",
        statusKepatuhan: "Sangat Tertib (100%)"
      },
      {
        key: "tertib-penyelenggaraan",
        label: "Tertib Penyelenggaraan",
        bobotKumulatif: 30,
        target: 50,
        realisasi: 50,
        indeksRealisasi: 100.0,
        indeksPengawasan: 30.00,
        color: "#EA580C",        // Warm Orange
        innerColor: "#F97316",
        desc: "Standar SMKK, K3, & Pengendalian Mutu Fisik",
        statusKepatuhan: "Sangat Tertib (100%)"
      },
      {
        key: "tertib-pemanfaatan",
        label: "Tertib Pemanfaatan",
        bobotKumulatif: 20,
        target: 20,
        realisasi: 20,
        indeksRealisasi: 100.0,
        indeksPengawasan: 20.00,
        color: "#059669",        // Emerald Green
        innerColor: "#10B981",
        desc: "Kelaikan Fungsi & Pemeliharaan Bangunan Gedung",
        statusKepatuhan: "Sangat Tertib (100%)"
      },
      {
        key: "sipjaki",
        label: "SIPJAKI",
        bobotKumulatif: 15,
        target: 21,
        realisasi: 2,
        indeksRealisasi: 9.52,   // Dibulatkan menjadi ~10% di Excel
        indeksPengawasan: 1.43,
        color: "#0284C7",        // Sky Cyan
        innerColor: "#38BDF8",
        desc: "Keterpaduan Sistem & Sinkronisasi Portal Pusat PUPR",
        statusKepatuhan: "Perlu Peningkatan Sinkronisasi"
      },
      {
        key: "pelatihan",
        label: "Pelatihan dan Sertifikasi",
        bobotKumulatif: 15,
        target: 10,
        realisasi: 2,
        indeksRealisasi: 20.0,
        indeksPengawasan: 3.00,
        color: "#7C3AED",        // Vivid Purple
        innerColor: "#A855F7",
        desc: "Uji Kompetensi & Sertifikasi SKK Tenaga Kerja Konstruksi",
        statusKepatuhan: "Sedang Berjalan (Tahap 1)"
      }
    ],
    totalTarget: 157,
    totalRealisasi: 130,
    totalIndeksPengawasan: 74.43,
    predikat: "Tertib",
    predikatBadgeBg: "#EBF2FA",
    predikatColor: "#0F2E5C",
    ringkasanKinerja: "Kinerja pengawasan 3 pilar teknis (Usaha, Penyelenggaraan, Pemanfaatan) telah tercapai 100%. Integrasi SIPJAKI dan percepatan pelatihan TKK sedang berlangsung."
  },
  "2025": {
    tahun: "2025",
    pilar: [
      {
        key: "tertib-usaha",
        label: "Tertib Usaha",
        bobotKumulatif: 20,
        target: 50,
        realisasi: 48,
        indeksRealisasi: 96.0,
        indeksPengawasan: 19.20,
        color: "#0F2E5C",
        innerColor: "#2563EB",
        desc: "Kesesuaian Izin, NIB & SBU BUJK Kualifikasi",
        statusKepatuhan: "Tertib Baik (96%)"
      },
      {
        key: "tertib-penyelenggaraan",
        label: "Tertib Penyelenggaraan",
        bobotKumulatif: 30,
        target: 45,
        realisasi: 45,
        indeksRealisasi: 100.0,
        indeksPengawasan: 30.00,
        color: "#EA580C",
        innerColor: "#F97316",
        desc: "Standar SMKK, K3, & Pengendalian Mutu Fisik",
        statusKepatuhan: "Sangat Tertib (100%)"
      },
      {
        key: "tertib-pemanfaatan",
        label: "Tertib Pemanfaatan",
        bobotKumulatif: 20,
        target: 18,
        realisasi: 16,
        indeksRealisasi: 88.89,
        indeksPengawasan: 17.78,
        color: "#059669",
        innerColor: "#10B981",
        desc: "Kelaikan Fungsi & Pemeliharaan Bangunan Gedung",
        statusKepatuhan: "Tertib Baik (88.9%)"
      },
      {
        key: "sipjaki",
        label: "SIPJAKI",
        bobotKumulatif: 15,
        target: 18,
        realisasi: 15,
        indeksRealisasi: 83.33,
        indeksPengawasan: 12.50,
        color: "#0284C7",
        innerColor: "#38BDF8",
        desc: "Keterpaduan Sistem & Sinkronisasi Portal Pusat PUPR",
        statusKepatuhan: "Sinkronisasi Penuh (83.3%)"
      },
      {
        key: "pelatihan",
        label: "Pelatihan dan Sertifikasi",
        bobotKumulatif: 15,
        target: 12,
        realisasi: 10,
        indeksRealisasi: 83.33,
        indeksPengawasan: 12.50,
        color: "#7C3AED",
        innerColor: "#A855F7",
        desc: "Uji Kompetensi & Sertifikasi SKK Tenaga Kerja Konstruksi",
        statusKepatuhan: "Target Terselesaikan (83.3%)"
      }
    ],
    totalTarget: 143,
    totalRealisasi: 134,
    totalIndeksPengawasan: 91.98,
    predikat: "Sangat Tertib",
    predikatBadgeBg: "#ECFDF5",
    predikatColor: "#059669",
    ringkasanKinerja: "Kinerja paripurna TA 2025 mencapai kategori Sangat Tertib (91.98%) dengan apresiasi pembinaan dari Kementerian PUPR."
  },
  "2024": {
    tahun: "2024",
    pilar: [
      {
        key: "tertib-usaha",
        label: "Tertib Usaha",
        bobotKumulatif: 20,
        target: 45,
        realisasi: 40,
        indeksRealisasi: 88.89,
        indeksPengawasan: 17.78,
        color: "#0F2E5C",
        innerColor: "#2563EB",
        desc: "Kesesuaian Izin, NIB & SBU BUJK Kualifikasi",
        statusKepatuhan: "Tertib Baik"
      },
      {
        key: "tertib-penyelenggaraan",
        label: "Tertib Penyelenggaraan",
        bobotKumulatif: 30,
        target: 40,
        realisasi: 38,
        indeksRealisasi: 95.0,
        indeksPengawasan: 28.50,
        color: "#EA580C",
        innerColor: "#F97316",
        desc: "Standar SMKK, K3, & Pengendalian Mutu Fisik",
        statusKepatuhan: "Sangat Tertib"
      },
      {
        key: "tertib-pemanfaatan",
        label: "Tertib Pemanfaatan",
        bobotKumulatif: 20,
        target: 15,
        realisasi: 12,
        indeksRealisasi: 80.0,
        indeksPengawasan: 16.00,
        color: "#059669",
        innerColor: "#10B981",
        desc: "Kelaikan Fungsi & Pemeliharaan Bangunan Gedung",
        statusKepatuhan: "Tertib Baik"
      },
      {
        key: "sipjaki",
        label: "SIPJAKI",
        bobotKumulatif: 15,
        target: 15,
        realisasi: 11,
        indeksRealisasi: 73.33,
        indeksPengawasan: 11.00,
        color: "#0284C7",
        innerColor: "#38BDF8",
        desc: "Keterpaduan Sistem & Sinkronisasi Portal Pusat PUPR",
        statusKepatuhan: "Cukup Baik"
      },
      {
        key: "pelatihan",
        label: "Pelatihan dan Sertifikasi",
        bobotKumulatif: 15,
        target: 15,
        realisasi: 11,
        indeksRealisasi: 73.33,
        indeksPengawasan: 11.00,
        color: "#7C3AED",
        innerColor: "#A855F7",
        desc: "Uji Kompetensi & Sertifikasi SKK Tenaga Kerja Konstruksi",
        statusKepatuhan: "Cukup Baik"
      }
    ],
    totalTarget: 130,
    totalRealisasi: 112,
    totalIndeksPengawasan: 84.28,
    predikat: "Tertib",
    predikatBadgeBg: "#EBF2FA",
    predikatColor: "#0F2E5C",
    ringkasanKinerja: "Tahun Anggaran 2024 mencapai indeks kepatuhan 84.28% (Kategori Tertib) menandai dimulainya digitalisasi SIMAK pengawasan daerah."
  }
};

export function getSipjakiDataByYear(tahun: string = "2026"): DashboardYearData {
  return SIPJAKI_YEARLY_DATA[tahun] || SIPJAKI_YEARLY_DATA["2026"];
}

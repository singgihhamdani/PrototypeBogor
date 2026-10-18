import { queryDataEngine, AiAnalysisResult, AiAction } from "./ai-data-engine";
import { queryRegulatoryKnowledge } from "./ai-rag-engine";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  actions?: AiAction[];
  isTyping?: boolean;
}

export interface CopilotContext {
  pathname: string;
  roleName?: string;
  userName?: string;
}

/**
 * Mendapatkan rekomendasi prompt kontekstual berdasarkan halaman yang sedang dibuka
 */
export function getContextualQuickPrompts(pathname: string): string[] {
  if (pathname.includes("paket-pekerjaan")) {
    return [
      "Tampilkan proyek dengan deviasi kritis",
      "Berapa total serapan anggaran APBD vs DAK?",
      "Daftar kontraktor dengan nilai kontrak terbesar",
      "Analisis sebaran proyek per kecamatan",
    ];
  }

  if (pathname.includes("bujk")) {
    return [
      "BUJK mana yang masa berlaku SBU-nya habis tahun ini?",
      "Bagaimana sebaran kualifikasi BUJK di Kab. Bogor?",
      "Apakah ada BUJK yang sedang dibekukan / masa tenggang?",
      "Cara impor batch data BUJK dari file Excel",
    ];
  }

  if (pathname.includes("regulasi")) {
    return [
      "Jelaskan sanksi administratif pada Permen PUPR 1/2023",
      "Apa kewenangan Pemda Kab. Bogor menurut Perda Jabar 6/2024?",
      "Aturan kewajiban tenaga kerja bersertifikat SKK",
      "Pedoman pelaporan berkala SIPJAKI (SE 299/2024)",
    ];
  }

  if (pathname.includes("pelatihan")) {
    return [
      "Program pelatihan apa yang pendaftarannya masih dibuka?",
      "Berapa total TKK yang telah lulus sertifikasi SKK?",
      "Berapa capaian target 500 TKK tahun 2026?",
      "Bagaimana cara memverifikasi e-Certificate QR?",
    ];
  }

  if (pathname.includes("kecelakaan")) {
    return [
      "Bagaimana rekapitulasi insiden K3 di proyek tahun 2026?",
      "Apakah ada insiden fatalitas / meninggal dunia?",
      "Bagaimana alur pelaporan insiden K3 ke SIPJAKI?",
      "Tindakan korektif untuk pekerjaan berisiko tinggi",
    ];
  }

  if (pathname.includes("tertib") || pathname.includes("pengawasan")) {
    return [
      "Apa saja 3 Pilar Pengawasan Tertib Jasa Konstruksi?",
      "Jelaskan instrumen audit SIMAK 1, 2, dan 3",
      "Bagaimana alur penerbitan Berita Acara Pemeriksaan (BAP)?",
      "Daftar rekomendasi pembinaan yang belum ditindaklanjuti",
    ];
  }

  if (pathname.includes("webgis")) {
    return [
      "Kecamatan mana yang memiliki proyek terbanyak?",
      "Tampilkan proyek infrastruktur jalan di Bogor Barat",
      "Bagaimana cara beralih tampilan peta dan tabel di mobile?",
      "Tinjau proyek dengan nilai pagu di atas 5 Miliar",
    ];
  }

  // Default Dashboard & Halaman Lainnya
  return [
    "Buatkan ringkasan eksekutif pimpinan",
    "Tampilkan proyek dengan deviasi kritis",
    "Berapa total serapan anggaran APBD vs DAK?",
    "Apa dasar hukum pengawasan SIMAK di Kabupaten Bogor?",
  ];
}

/**
 * Handler utama untuk memproses pertanyaan pengguna dan menghasilkan respon cerdas
 */
export async function processUserQuery(
  userInput: string,
  context: CopilotContext
): Promise<AiAnalysisResult> {
  const query = userInput.trim();
  const qLower = query.toLowerCase();

  // 1. Cek Data Engine (Data Analytics Proyek, BUJK, K3, Pelatihan, Anggaran)
  const dataResult = queryDataEngine(query);
  if (dataResult) {
    return dataResult;
  }

  // 2. Cek RAG Engine (11 Dasar Hukum Regulasi & SIMAK)
  const regResult = queryRegulatoryKnowledge(query);
  if (regResult) {
    return regResult;
  }

  // 3. Penanganan FAQ & Panduan Penggunaan Sistem SIJAKON
  if (qLower.includes("halo") || qLower.includes("hai") || qLower.includes("selamat pagi") || qLower.includes("selamat siang")) {
    return {
      text:
        `Halo **${context.userName || "Bapak/Ibu Stakeholder"}**! 👋\n\n` +
        `Saya adalah **SIJAKON AI Copilot**, asisten cerdas resmi Dinas Pekerjaan Umum Kabupaten Bogor. Anda saat ini aktif dengan peran **${context.roleName || "Super Admin DPU"}**.\n\n` +
        `Saya dapat membantu Anda dalam:\n` +
        `• **Analisis Data Lapangan:** Menemukan proyek deviasi minus, ringkasan serapan anggaran, dan status BUJK.\n` +
        `• **Konsultasi Regulasi:** Menjawab dasar hukum UU 2/2017, PP 22/2020, Permen PUPR 1/2023 (SIMAK), dan Perda Jabar 6/2024.\n` +
        `• **Ringkasan Eksekutif:** Menyiapkan memo ringkas kinerja pengawasan untuk bahan rapat koordinasi pimpinan.\n\n` +
        `Silakan pilih salah satu pertanyaan saran di bawah atau ketikkan pertanyaan Anda secara bebas!`,
      actions: [
        { label: "Ringkasan Eksekutif", url: "/" },
        { label: "Cek Proyek Kritis", url: "/paket-pekerjaan" },
        { label: "Konsultasi Aturan SIMAK", url: "/regulasi" },
      ],
    };
  }

  if (qLower.includes("bantuan") || qLower.includes("bisa apa saja") || qLower.includes("menu")) {
    return {
      text:
        `💡 **PANDUAN FITUR UTAMA SIJAKON BOGOR:**\n\n` +
        `Sistem Informasi Jasa Konstruksi Kabupaten Bogor memiliki modul-modul terintegrasi:\n\n` +
        `1. **Dashboard Eksekutif (Beranda):** Ringkasan indikator kinerja, serapan anggaran, dan grafik kepatuhan.\n` +
        `2. **Peta WebGIS:** Pemetaan spasial sebaran proyek di 40 Kecamatan dengan filter interaktif.\n` +
        `3. **Master Data BUJK:** Pangkalan data badan usaha, kualifikasi, NIB, dan masa berlaku SBU (dilengkapi fitur Import Excel).\n` +
        `4. **Paket Pekerjaan:** Monitoring fisik Kurva-S, keuangan, dan data kontrak APBD/DAK/APBN.\n` +
        `5. **Pengawasan 3 Tertib:** Instrumen audit SIMAK 1 (Usaha), SIMAK 2 (Penyelenggaraan), dan SIMAK 3 (Pemanfaatan).\n` +
        `6. **Hub Pelatihan & TKK:** Fasilitasi sertifikasi SKK, bimtek K3, dan verifikasi e-Certificate QR.\n` +
        `7. **Regulasi & Kebijakan:** 11 dokumen regulasi nasional dan daerah Jawa Barat.\n` +
        `8. **Pelaporan K3:** Catatan insiden keselamatan konstruksi terintegrasi SIPJAKI.`,
      actions: [
        { label: "Buka Peta WebGIS", url: "/webgis" },
        { label: "Lihat Paket Pekerjaan", url: "/paket-pekerjaan" },
        { label: "Daftar Regulasi", url: "/regulasi" },
      ],
    };
  }

  if (qLower.includes("import") || qLower.includes("unggah excel") || qLower.includes("template excel") || qLower.includes("batch")) {
    return {
      text:
        `📗 **PANDUAN MODUL IMPORT BATCH EXCEL:**\n\n` +
        `Untuk mengunggah data dalam jumlah banyak sekaligus tanpa mengetik satu-satu:\n\n` +
        `1. Buka modul target (misal **Master Data BUJK**, **Paket Pekerjaan**, atau **Pelatihan**).\n` +
        `2. Klik tombol **[📗 Import Excel]** pada bagian header atas.\n` +
        `3. Di dalam modal yang muncul, klik **[ Unduh Template Excel (.xlsx) ]** untuk mendapatkan format resmi 3-sheet (Data, Petunjuk, & Kamus Data).\n` +
        `4. Isi data sesuai petunjuk lalu drag & drop berkas Excel Anda ke area upload.\n` +
        `5. Sistem akan memvalidasi NIB 13 digit dan format tanggal secara otomatis sebelum data dikomit.`,
      actions: [
        { label: "Buka Master Data BUJK", url: "/bujk" },
        { label: "Buka Data Paket Pekerjaan", url: "/paket-pekerjaan" },
        { label: "Buka Hub Pelatihan", url: "/pelatihan" },
      ],
    };
  }

  // 4. Fallback Cerdas
  return {
    text:
      `Terima kasih atas pertanyaan Anda mengenai *"**${query}**"*.\n\n` +
      `Sebagai asisten intelijen data SIJAKON Bogor, saya dapat membantu menganalisis topik tersebut lebih spesifik. Berikut beberapa area yang dapat Anda pilih:\n\n` +
      `• **Analisis Data Proyek:** Apakah Anda ingin meninjau deviasi progres fisik Kurva-S atau serapan dana?\n` +
      `• **Legalitas BUJK:** Apakah Anda ingin memeriksa masa berlaku SBU atau kualifikasi kontraktor?\n` +
      `• **Dasar Hukum & SIMAK:** Apakah Anda memerlukan rujukan pasal UU 2/2017, Permen PUPR 1/2023, atau Perda Jabar 6/2024?\n\n` +
      `Pilih salah satu tombol di bawah untuk melihat analisis langsung:`,
    actions: [
      { label: "Analisis Proyek Kritis", url: "/paket-pekerjaan" },
      { label: "Analisis BUJK & SBU", url: "/bujk" },
      { label: "Rujukan Regulasi SIMAK", url: "/regulasi" },
      { label: "Ringkasan Eksekutif Pimpinan", url: "/" },
    ],
  };
}

import regulationsData from "@/data/regulations.json";
import { AiAnalysisResult, AiAction } from "./ai-data-engine";

export interface RegulationMatch {
  id: string;
  number: string;
  title: string;
  category: string;
  summary: string;
  policyMandate: string;
  relatedModules?: string[];
  relevanceScore: number;
}

/**
 * RAG Search Engine untuk 11 Regulasi Dasar Hukum Jasa Konstruksi & Instrumen SIMAK
 */
export function queryRegulatoryKnowledge(query: string): AiAnalysisResult | null {
  const q = query.toLowerCase();

  // Keyword scoring untuk pencarian semantik
  const matches: RegulationMatch[] = regulationsData
    .map((reg) => {
      let score = 0;
      const combinedText = `${reg.number} ${reg.title} ${reg.summary} ${reg.policyMandate} ${(reg.relatedModules || []).join(" ")}`.toLowerCase();

      // Cek nomor regulasi khusus
      if (q.includes("1/2023") || q.includes("1 tahun 2023") || q.includes("simak") || q.includes("3 tertib")) {
        if (reg.number.includes("1 Tahun 2023")) score += 20;
      }
      if (q.includes("2/2017") || q.includes("6/2023") || q.includes("undang-undang") || q.includes("uu jakon")) {
        if (reg.number.includes("UU No. 2") || reg.number.includes("UU No. 6")) score += 20;
      }
      if (q.includes("22/2020") || q.includes("14/2021") || q.includes("peraturan pemerintah") || q.includes("sanksi")) {
        if (reg.number.includes("PP No. 22") || reg.number.includes("PP No. 14")) score += 20;
      }
      if (q.includes("jabar") || q.includes("jawa barat") || q.includes("perda") || q.includes("6/2024")) {
        if (reg.number.includes("Perda") || reg.title.includes("Jawa Barat")) score += 25;
      }
      if (q.includes("sipjaki") || q.includes("se 299") || q.includes("surat edaran") || q.includes("pelaporan berkala")) {
        if (reg.number.includes("299/SE/M/2024")) score += 25;
      }
      if (q.includes("remunerasi") || q.includes("gaji") || q.includes("upah") || q.includes("billing rate") || q.includes("68/2023")) {
        if (reg.number.includes("68/KPTS/M/2023")) score += 25;
      }
      if (q.includes("smkk") || q.includes("k3") || q.includes("keselamatan") || q.includes("10/2021")) {
        if (reg.number.includes("10 Tahun 2021")) score += 20;
      }
      if (q.includes("lpjk") || q.includes("sertifikat badan usaha") || q.includes("lsbu") || q.includes("9/2020")) {
        if (reg.number.includes("9 Tahun 2020")) score += 20;
      }
      if (q.includes("rantai pasok") || q.includes("mpk") || q.includes("material") || q.includes("8/2022")) {
        if (reg.number.includes("8 Tahun 2022")) score += 20;
      }

      // Keyword token matching
      const words = q.split(/\s+/).filter((w) => w.length > 3);
      words.forEach((w) => {
        if (combinedText.includes(w)) {
          score += 2;
        }
      });

      return {
        ...reg,
        relevanceScore: score,
      };
    })
    .filter((m) => m.relevanceScore > 4)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  if (matches.length === 0) {
    return null;
  }

  const primary = matches[0];
  const secondaries = matches.slice(1, 3);

  const actions: AiAction[] = [
    { label: "Buka Halaman Regulasi Lengkap", url: "/regulasi" },
  ];

  if (primary.number.includes("1 Tahun 2023") || q.includes("simak")) {
    actions.unshift({ label: "Pelajari Instrumen SIMAK", url: "/tertib-usaha" });
  }

  let text =
    `⚖️ **KONSULTASI REGULASI & KEBIJAKAN JASA KONSTRUKSI**\n\n` +
    `Berdasarkan penelusuran basis data hukum resmi, ketentuan yang mengatur hal tersebut adalah:\n\n` +
    `📘 **${primary.number}**\n` +
    `*${primary.title}*\n\n` +
    `📌 **Ringkasan Substansi Aturan:**\n` +
    `${primary.summary}\n\n` +
    `🏛️ **Mandat Kebijakan bagi Pemkab Bogor:**\n` +
    `${primary.policyMandate}\n\n` +
    `🔗 **Modul Terkait di SIJAKON:** ${(primary.relatedModules || []).map((m: string) => `\`${m}\``).join(", ")}`;

  if (secondaries.length > 0) {
    text +=
      `\n\n---\n` +
      `🔍 **Regulasi Pendukung Terkait:**\n` +
      secondaries
        .map((s) => `• **${s.number}:** ${s.title}`)
        .join("\n");
  }

  return {
    text,
    actions,
  };
}

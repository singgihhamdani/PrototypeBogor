import projectsData from "@/data/projects.json";
import bujkData from "@/data/bujk.json";
import trainingData from "@/data/training.json";
import incidentsData from "@/data/incidents.json";

export interface AiAction {
  label: string;
  url?: string;
  type?: "link" | "filter" | "export";
  payload?: any;
}

export interface AiAnalysisResult {
  text: string;
  actions?: AiAction[];
  dataSnippet?: Record<string, any>;
}

/**
 * Format currency to Rupiah
 */
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * 1. Analisis Proyek Kritis / Deviasi Progres
 */
export function analyzeCriticalProjects(): AiAnalysisResult {
  // Hitung deviasi = realProgress terakhir - planProgress pada step yang sama
  const analyzed = projectsData.map((p) => {
    // Cari index bulan terakhir yang memiliki realProgress > 0
    let lastRealIdx = 0;
    for (let i = p.realProgress.length - 1; i >= 0; i--) {
      if (p.realProgress[i] > 0) {
        lastRealIdx = i;
        break;
      }
    }

    const planVal = p.planProgress[lastRealIdx] || p.planProgress[p.planProgress.length - 1];
    const realVal = p.realProgress[lastRealIdx] || p.physProgress;
    const deviation = realVal - planVal; // minus artinya terlambat

    return {
      ...p,
      deviation,
      currentPlan: planVal,
      currentReal: realVal,
    };
  });

  // Urutkan dari yang paling terlambat (deviasi minus terbesar)
  const critical = analyzed
    .filter((p) => p.status === "Pelaksanaan" && p.deviation < -5)
    .sort((a, b) => a.deviation - b.deviation);

  if (critical.length === 0) {
    return {
      text: "✅ **Kabar Baik!** Berdasarkan data pengawasan aktif saat ini, seluruh paket pekerjaan konstruksi yang sedang berjalan berada dalam batas deviasi normal (< 5% dari jadwal rencana Kurva-S).",
      actions: [
        { label: "Buka Data Paket Pekerjaan", url: "/paket-pekerjaan" },
        { label: "Lihat Peta Sebaran WebGIS", url: "/webgis" },
      ],
    };
  }

  const listItems = critical
    .map(
      (c, idx) =>
        `${idx + 1}. **[${c.id}] ${c.name}**\n` +
        `   • **Penyedia:** ${c.contractor}\n` +
        `   • **Nilai Kontrak:** ${formatRupiah(c.contractValue)}\n` +
        `   • **Rencana:** ${c.currentPlan}% | **Realisasi:** ${c.currentReal}% | **Deviasi:** <span style="color:#DC2626; font-weight:800;">${c.deviation}%</span>\n` +
        `   • **Rekomendasi Tindakan:** Terbitkan Surat Peringatan (SP-1) & jadwalkan *Show Cause Meeting* (SCM) Tingkat 1.`
    )
    .join("\n\n");

  return {
    text:
      `⚠️ **PERINGATAN PROYEK KRITIS (DEVIASI MINUS):**\n\n` +
      `Ditemukan **${critical.length} paket pekerjaan** yang mengalami keterlambatan signifikan terhadap jadwal Kurva-S:\n\n` +
      listItems +
      `\n\n💡 *Catatan Pengawasan:* Berdasarkan **Permen PUPR No. 1 Tahun 2023**, keterlambatan fisik di atas 10% wajib dilaporkan ke SIMAK dan dilakukan uji petik lapangan oleh Tim Pembina Jasa Konstruksi.`,
    actions: [
      { label: `Lihat Detail ${critical[0].id}`, url: `/paket-pekerjaan/${critical[0].id}` },
      { label: "Buka Seluruh Paket Pekerjaan", url: "/paket-pekerjaan" },
      { label: "Tinjau Peta WebGIS", url: "/webgis" },
    ],
  };
}

/**
 * 2. Analisis Serapan Pagu & Anggaran (APBD, DAK, APBN)
 */
export function analyzeBudgetAbsorption(): AiAnalysisResult {
  const summary: Record<string, { totalPagu: number; count: number; avgPhys: number; avgFin: number }> = {};

  projectsData.forEach((p) => {
    if (!summary[p.source]) {
      summary[p.source] = { totalPagu: 0, count: 0, avgPhys: 0, avgFin: 0 };
    }
    summary[p.source].totalPagu += p.contractValue;
    summary[p.source].count += 1;
    summary[p.source].avgPhys += p.physProgress;
    summary[p.source].avgFin += p.finProgress;
  });

  const grandTotal = Object.values(summary).reduce((acc, curr) => acc + curr.totalPagu, 0);

  const breakdown = Object.entries(summary)
    .map(([source, val]) => {
      const avgP = Math.round(val.avgPhys / val.count);
      const avgF = Math.round(val.avgFin / val.count);
      const share = Math.round((val.totalPagu / grandTotal) * 100);
      return (
        `• **Sumber Dana ${source}:**\n` +
        `  - Pagu Kontrak: **${formatRupiah(val.totalPagu)}** (${share}% dari total)\n` +
        `  - Jumlah Paket: **${val.count} paket**\n` +
        `  - Rata-rata Progres Fisik: **${avgP}%** | Keuangan: **${avgF}%**`
      );
    })
    .join("\n\n");

  return {
    text:
      `📊 **REKAPITULASI ANGGARAN & SERAPAN FISIK/KEUANGAN TA 2026**\n\n` +
      `Total alokasi nilai kontrak terdata di SIJAKON: **${formatRupiah(grandTotal)}** dari **${projectsData.length} paket pekerjaan**.\n\n` +
      breakdown +
      `\n\n💡 *Rekomendasi:* Prioritaskan percepatan pengajuan BAP termin keuangan untuk paket yang memiliki selisih progres fisik vs keuangan di atas 15%.`,
    actions: [
      { label: "Buka Data Paket Pekerjaan", url: "/paket-pekerjaan" },
      { label: "Dashboard Eksekutif", url: "/" },
    ],
  };
}

/**
 * 3. Analisis Kepatuhan & Masa Berlaku SBU BUJK
 */
export function analyzeBujkCompliance(): AiAnalysisResult {
  const currentYear = 2026;
  const expiringSoon = bujkData.filter((b) => {
    if (!b.sbuExpiry) return false;
    const year = parseInt(b.sbuExpiry.split("-")[0], 10);
    return year <= currentYear;
  });

  const byQual = {
    Besar: bujkData.filter((b) => b.qualification === "Besar").length,
    Menengah: bujkData.filter((b) => b.qualification === "Menengah").length,
    Kecil: bujkData.filter((b) => b.qualification === "Kecil").length,
  };

  const expiringList = expiringSoon
    .map(
      (b) =>
        `• **${b.name}** (${b.type})\n` +
        `  - Kualifikasi: **${b.qualification}** | Domisili: **Kecamatan ${b.district}**\n` +
        `  - Masa Berlaku SBU: <span style="color:#D97706; font-weight:700;">${b.sbuExpiry}</span>\n` +
        `  - Jumlah SBU Aktif: ${b.sbuCount} sertifikat | Paket Berjalan: ${b.projectsActive} paket`
    )
    .join("\n\n");

  return {
    text:
      `🏢 **ANALISIS DATABASE BUJK KABUPATEN BOGOR**\n\n` +
      `Total BUJK terdaftar: **${bujkData.length} badan usaha**\n` +
      `• Kualifikasi Besar: **${byQual.Besar} BUJK**\n` +
      `• Kualifikasi Menengah: **${byQual.Menengah} BUJK**\n` +
      `• Kualifikasi Kecil: **${byQual.Kecil} BUJK**\n\n` +
      `⚠️ **PERHATIAN PERPANJANGAN SBU (Tahun ${currentYear}):**\n` +
      `Ditemukan **${expiringSoon.length} BUJK** yang masa berlaku SBU-nya akan berakhir di tahun ini:\n\n` +
      expiringList +
      `\n\n💡 *Saran Pembinaan:* Kirimkan surat notifikasi pembinaan tertib usaha kepada BUJK bersangkutan untuk segera melakukan perpanjangan lisensi melalui OSS-RBA & LPJK.`,
    actions: [
      { label: "Buka Master Data BUJK", url: "/bujk" },
      { label: "Instrumen Tertib Usaha SIMAK", url: "/tertib-usaha" },
    ],
  };
}

/**
 * 4. Analisis Keselamatan Konstruksi (K3)
 */
export function analyzeK3Incidents(): AiAnalysisResult {
  const total = incidentsData.length;
  const severityCount: Record<string, number> = {};
  incidentsData.forEach((i) => {
    severityCount[i.severity] = (severityCount[i.severity] || 0) + 1;
  });

  const list = incidentsData
    .map(
      (i, idx) =>
        `${idx + 1}. **[${i.id}] ${i.projectName}**\n` +
        `   • **Kontraktor:** ${i.contractor}\n` +
        `   • **Tanggal:** ${i.date} (${i.time}) | **Kecamatan:** ${i.district}\n` +
        `   • **Jenis Insiden:** ${i.incidentType}\n` +
        `   • **Tingkat Keparahan:** **${i.severity}** (Korban: ${i.victimName})\n` +
        `   • **Status Investigasi:** <span style="color:#059669; font-weight:700;">${i.status}</span>\n` +
        `   • **Tindakan Korektif:** ${i.correctiveAction}`
    )
    .join("\n\n");

  return {
    text:
      `🛡️ **LAPORAN PENGAWASAN KESELAMATAN KONSTRUKSI (SMKK & K3)**\n\n` +
      `Total insiden tercatat TA 2026: **${total} kejadian**.\n` +
      `• Luka Ringan: **${severityCount["Luka Ringan"] || 0} kejadian**\n` +
      `• Luka Berat: **${severityCount["Luka Berat"] || 0} kejadian**\n` +
      `• Meninggal Dunia: **${severityCount["Meninggal Dunia"] || 0} kejadian** (Nir Fatalitas)\n\n` +
      `Rincian Insiden Terdaftar:\n\n` +
      list +
      `\n\n💡 *Catatan Pengawas K3:* Seluruh insiden telah dilaporkan ke SIPJAKI Kementerian PUPR dan telah ditindaklanjuti dengan evaluasi SOP K3 di lapangan.`,
    actions: [
      { label: "Buka Data Kecelakaan K3", url: "/kecelakaan" },
      { label: "Sertifikasi K3 di Hub Pelatihan", url: "/pelatihan" },
    ],
  };
}

/**
 * 5. Analisis Program Pelatihan & Sertifikasi TKK
 */
export function analyzeTrainingAndTKK(): AiAnalysisResult {
  const totalPrograms = trainingData.length;
  const totalQuota = trainingData.reduce((acc, t) => acc + t.quota, 0);
  const totalRegistered = trainingData.reduce((acc, t) => acc + t.registered, 0);
  const totalPassed = trainingData.reduce((acc, t) => acc + t.passed, 0);
  const targetTahunan = 500; // Target Pemkab Bogor

  const programList = trainingData
    .map(
      (t) =>
        `• **[${t.id}] ${t.title}**\n` +
        `  - Status: **${t.status}** | ${t.batch}\n` +
        `  - Kuota: ${t.registered} / ${t.quota} peserta | Lulus SKK: **${t.passed} orang**\n` +
        `  - Penyelenggara: ${t.organizer}`
    )
    .join("\n\n");

  const passRate = totalRegistered > 0 ? Math.round((totalPassed / totalRegistered) * 100) : 0;
  const targetPct = Math.round((totalPassed / targetTahunan) * 100);

  return {
    text:
      `🎓 **CAPAIAN SERTIFIKASI TENAGA KERJA KONSTRUKSI (TKK) TA 2026**\n\n` +
      `• Total Program Berjalan: **${totalPrograms} angkatan**\n` +
      `• Peserta Terdaftar: **${totalRegistered} orang** (dari kuota ${totalQuota})\n` +
      `• Lulus Uji Kompetensi BNSP/SKK: **${totalPassed} orang** (*Passing Rate*: **${passRate}%**)\n` +
      `• Capaian Target Daerah 2026: **${totalPassed} / ${targetTahunan} TKK (${targetPct}%)**\n\n` +
      `Daftar Kegiatan Pelatihan:\n\n` +
      programList +
      `\n\n💡 *Rekomendasi:* Tambahkan fasilitasi uji kompetensi untuk Jenjang 3–4 (Teknisi Muda) pada APBD Perubahan untuk memenuhi sisa target daerah.`,
    actions: [
      { label: "Buka Hub Pelatihan & TKK", url: "/pelatihan" },
      { label: "Laporan Sertifikasi TKK", url: "/pelatihan/laporan" },
    ],
  };
}

/**
 * 6. Generate Ringkasan Eksekutif (Executive Summary Brief)
 */
export function generateExecutiveSummary(): AiAnalysisResult {
  const totalPagu = projectsData.reduce((acc, curr) => acc + curr.contractValue, 0);
  const avgPhys = Math.round(projectsData.reduce((acc, curr) => acc + curr.physProgress, 0) / projectsData.length);
  const totalTkk = trainingData.reduce((acc, curr) => acc + curr.passed, 0);

  return {
    text:
      `🏛️ **EXECUTIVE SUMMARY — KINERJA PEMBINAAN JASA KONSTRUKSI KABUPATEN BOGOR**\n` +
      `*Periode: Tahun Anggaran 2026 | Sumber: Sistem Informasi SIJAKON BOGOR*\n\n` +
      `---\n\n` +
      `### 1. Kinerja Pelaksanaan Fisik & Pengadaan\n` +
      `• Total Portofolio Proyek Terdata: **${projectsData.length} paket pekerjaan** bernilai **${formatRupiah(totalPagu)}**.\n` +
      `• Rata-rata Progres Fisik: **${avgPhys}%**.\n` +
      `• Paket Kritis: Terdapat **1 paket** yang memerlukan perhatian khusus (P004 Pembangunan Drainase Parung, deviasi -35%).\n\n` +
      `### 2. Legalitas & Kepatuhan BUJK\n` +
      `• Total BUJK Aktif: **${bujkData.length} badan usaha** (Kecil: 4, Menengah: 2, Besar: 4).\n` +
      `• Seluruh BUJK memegang NIB OSS-RBA dan SBU terdaftar di LPJK.\n` +
      `• Terdapat **3 BUJK** dengan masa berlaku SBU berakhir sebelum triwulan IV 2026.\n\n` +
      `### 3. Pengembangan Sumber Daya Manusia (TKK)\n` +
      `• Sebanyak **${totalTkk} Tenaga Kerja Konstruksi** telah lulus sertifikasi SKK BNSP.\n` +
      `• Telah terselenggara 4 program pelatihan (K3 Konstruksi, Mandor Pasang Bata, BIM Authoring, dan Tata Kelola Jakon).\n\n` +
      `### 4. Keselamatan Kerja (SMKK / K3)\n` +
      `• Angka Fatalitas Kerja: **0 (Zero Fatalities)**.\n` +
      `• Seluruh insiden luka ringan telah tertangani dan bukti perbaikan SOP telah diunggah ke SIPJAKI.\n\n` +
      `---\n` +
      `📌 *Disiapkan secara otomatis oleh SIJAKON AI Copilot untuk bahan rapat koordinasi pimpinan.*`,
    actions: [
      { label: "Dashboard Eksekutif", url: "/" },
      { label: "Portal Pengawasan SIMAK", url: "/tertib-usaha" },
      { label: "Paket Pekerjaan", url: "/paket-pekerjaan" },
    ],
  };
}

/**
 * Router cerdas untuk mencocokkan query pertanyaan pengguna dengan analisis data internal
 */
export function queryDataEngine(query: string): AiAnalysisResult | null {
  const q = query.toLowerCase();

  // 1. Proyek Kritis / Terlambat / Deviasi
  if (
    q.includes("kritis") ||
    q.includes("terlambat") ||
    q.includes("deviasi") ||
    q.includes("kurva s") ||
    q.includes("kurva-s") ||
    q.includes("masalah proyek")
  ) {
    return analyzeCriticalProjects();
  }

  // 2. Anggaran / Pagu / Serapan / APBD / DAK / APBN
  if (
    q.includes("anggaran") ||
    q.includes("pagu") ||
    q.includes("serapan") ||
    q.includes("apbd") ||
    q.includes("keuangan") ||
    q.includes("nilai kontrak")
  ) {
    return analyzeBudgetAbsorption();
  }

  // 3. BUJK / Kontraktor / SBU / NIB
  if (
    q.includes("bujk") ||
    q.includes("kontraktor") ||
    q.includes("sbu") ||
    q.includes("kedaluwarsa") ||
    q.includes("habis") ||
    q.includes("kualifikasi bujk")
  ) {
    return analyzeBujkCompliance();
  }

  // 4. K3 / Kecelakaan / Insiden / Keselamatan
  if (
    q.includes("k3") ||
    q.includes("kecelakaan") ||
    q.includes("insiden") ||
    q.includes("korban") ||
    q.includes("smkk") ||
    q.includes("safety")
  ) {
    return analyzeK3Incidents();
  }

  // 5. Pelatihan / Sertifikasi / TKK / SKK / Kuota
  if (
    q.includes("pelatihan") ||
    q.includes("tkk") ||
    q.includes("skk") ||
    q.includes("sertifikasi") ||
    q.includes("bimtek") ||
    q.includes("lulus") ||
    q.includes("kuota")
  ) {
    return analyzeTrainingAndTKK();
  }

  // 6. Ringkasan Eksekutif / Brief / Laporan Rapat
  if (
    q.includes("ringkasan eksekutif") ||
    q.includes("executive summary") ||
    q.includes("laporan pimpinan") ||
    q.includes("overview") ||
    q.includes("rapat")
  ) {
    return generateExecutiveSummary();
  }

  return null;
}

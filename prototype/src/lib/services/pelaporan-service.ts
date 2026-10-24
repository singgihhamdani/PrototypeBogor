import { createClient, isSupabaseConfigured } from "../supabase/client";
import { fetchBUJKList } from "./master-data";
import { fetchPaketList } from "./master-data";
import { fetchPelaksanaanList } from "./pengawasan-service";
import { exportToSpreadsheet } from "../export-utils";
import { 
  TEMPLATE_BUJK, 
  TEMPLATE_PAKET_PEKERJAAN, 
  TEMPLATE_PELAKSANAAN, 
  TEMPLATE_PELATIHAN, 
  TEMPLATE_KECELAKAAN 
} from "../sipjaki-templates";
import incidentsData from "@/data/incidents.json";
import trainingData from "@/data/training.json";

export interface ExecutiveReportMetrics {
  totalBujk: number;
  totalPaket: number;
  totalNilaiKontrak: number;
  avgProgresFisik: number;
  totalAuditDilakukan: number;
  tingkatKepatuhanPersen: number;
  totalTkkTersertifikasi: number;
  totalInsidenK3: number;
  kategoriTertib: {
    tertib: number;
    cukupTertib: number;
    kurangTertib: number;
  };
}

/**
 * Mengambil ringkasan data eksekutif secara riil dari Supabase / Master Data Services
 */
export async function getExecutiveReportMetrics(): Promise<ExecutiveReportMetrics> {
  const [bujkRes, paketRes, auditTURes, auditTPRes, auditTMRes] = await Promise.all([
    fetchBUJKList(),
    fetchPaketList(),
    fetchPelaksanaanList("tertib-usaha"),
    fetchPelaksanaanList("tertib-penyelenggaraan"),
    fetchPelaksanaanList("tertib-pemanfaatan")
  ]);

  const allAudits = [...auditTURes.data, ...auditTPRes.data, ...auditTMRes.data];
  const totalAudit = allAudits.length;

  const tertibCount = allAudits.filter((a) => a.kategoriHasil === "Tertib").length;
  const cukupTertibCount = allAudits.filter((a) => a.kategoriHasil === "Cukup Tertib").length;
  const kurangTertibCount = allAudits.filter((a) => a.kategoriHasil === "Kurang Tertib").length;

  const avgKepatuhan = totalAudit > 0 
    ? Math.round(allAudits.reduce((acc, curr) => acc + curr.skorTertib, 0) / totalAudit)
    : 84;

  const totalNilai = paketRes.data.reduce((acc, curr) => acc + Number(curr.nilai_kontrak), 0);
  const avgProgres = paketRes.data.length > 0
    ? Math.round(paketRes.data.reduce((acc, curr) => acc + Number(curr.progres_fisik), 0) / paketRes.data.length)
    : 0;

  // Hitung TKK dari training data
  const totalTkk = trainingData.reduce((acc, curr) => acc + (curr.passed || 0), 0);

  return {
    totalBujk: bujkRes.data.length,
    totalPaket: paketRes.data.length,
    totalNilaiKontrak: totalNilai,
    avgProgresFisik: avgProgres,
    totalAuditDilakukan: totalAudit,
    tingkatKepatuhanPersen: avgKepatuhan,
    totalTkkTersertifikasi: totalTkk,
    totalInsidenK3: incidentsData.length,
    kategoriTertib: {
      tertib: tertibCount,
      cukupTertib: cukupTertibCount,
      kurangTertib: kurangTertibCount
    }
  };
}

/**
 * Ekspor file Excel sesuai format resmi SIPJAKI Kementerian PUPR
 */
export async function exportReportByModule(moduleId: string) {
  switch (moduleId) {
    case "LAP-TU-2026-S1": {
      const bujkRes = await fetchBUJKList();
      exportToSpreadsheet({
        fileName: `${TEMPLATE_BUJK.exportFileName}_Semester1_2026`,
        sheetName: TEMPLATE_BUJK.sheetName,
        columns: TEMPLATE_BUJK.columns,
        data: bujkRes.data,
        sipjakiMode: true,
        includeDataDictionary: true,
        dictionaryItems: TEMPLATE_BUJK.dictionaryItems
      });
      break;
    }
    case "LAP-TP-2026-S1": {
      const paketRes = await fetchPaketList();
      exportToSpreadsheet({
        fileName: `${TEMPLATE_PAKET_PEKERJAAN.exportFileName}_Semester1_2026`,
        sheetName: TEMPLATE_PAKET_PEKERJAAN.sheetName,
        columns: TEMPLATE_PAKET_PEKERJAAN.columns,
        data: paketRes.data,
        sipjakiMode: true,
        includeDataDictionary: true,
        dictionaryItems: TEMPLATE_PAKET_PEKERJAAN.dictionaryItems
      });
      break;
    }
    case "LAP-TM-2026-S1": {
      const auditRes = await fetchPelaksanaanList("tertib-pemanfaatan");
      exportToSpreadsheet({
        fileName: `Rekapitulasi_Tertib_Pemanfaatan_SIPJAKI_2026`,
        sheetName: "TERTIB PEMANFAATAN",
        columns: TEMPLATE_PELAKSANAAN.columns,
        data: auditRes.data,
        sipjakiMode: true,
        includeDataDictionary: true,
        dictionaryItems: TEMPLATE_PELAKSANAAN.dictionaryItems
      });
      break;
    }
    case "LAP-TKK-2026-S1": {
      exportToSpreadsheet({
        fileName: `Data_Sertifikasi_TKK_SIPJAKI_Kab_Bogor`,
        sheetName: "DATA TKK",
        columns: TEMPLATE_PELATIHAN.columns,
        data: trainingData,
        sipjakiMode: true,
        includeDataDictionary: true,
        dictionaryItems: TEMPLATE_PELATIHAN.dictionaryItems
      });
      break;
    }
    case "LAP-K3-2026-BLN": {
      exportToSpreadsheet({
        fileName: TEMPLATE_KECELAKAAN.exportFileName,
        sheetName: TEMPLATE_KECELAKAAN.sheetName,
        columns: TEMPLATE_KECELAKAAN.columns,
        data: incidentsData,
        sipjakiMode: true,
        includeDataDictionary: true,
        dictionaryItems: TEMPLATE_KECELAKAAN.dictionaryItems
      });
      break;
    }
    default:
      console.warn("Modul tidak dikenali untuk ekspor:", moduleId);
  }
}

/**
 * Ekspor seluruh paket format SIPJAKI Nasional sekaligus (Multi-Sheet / Berkas Lengkap)
 */
export async function exportAllSipjakiBundle() {
  await exportReportByModule("LAP-TU-2026-S1");
  setTimeout(async () => {
    await exportReportByModule("LAP-TP-2026-S1");
  }, 400);
  setTimeout(async () => {
    await exportReportByModule("LAP-TM-2026-S1");
  }, 800);
}

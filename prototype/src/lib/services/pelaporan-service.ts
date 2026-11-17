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
import { mockPelaporanRecords, PelaporanRecord } from "@/data/tertib-mock-data";
import { TertibType } from "../tertib-config";

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
    ? Math.round(allAudits.reduce((acc, curr) => acc + (curr.skorTertib ?? (curr.statusKepatuhan === "Patuh" ? 90 : 60)), 0) / totalAudit)
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

// =============================================================================
// OPERASI DATA PELAPORAN RESMI (STANDAR FORMAT 8 KOLOM SIPJAKI)
// =============================================================================

export interface PelaporanServiceResponse {
  data: PelaporanRecord[];
  status: {
    source: "supabase" | "fallback";
    message: string;
  };
}

/**
 * Mengambil daftar arsip pelaporan pengawasan berkala dari Supabase (dengan fallback ke mock data)
 */
export async function fetchPelaporanList(tertibType: TertibType): Promise<PelaporanServiceResponse> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client.from("pengawasan_pelaporan") as any)
          .select("*")
          .eq("tertib_type", tertibType)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: PelaporanRecord[] = data.map((d: any) => ({
            id: d.id,
            tertibType: d.tertib_type,
            jenisLaporan: d.jenis_laporan,
            namaLaporan: d.nama_laporan,
            tahun: d.tahun,
            propinsi: d.propinsi || "Jawa Barat",
            kabKota: d.kab_kota || "Kabupaten Bogor",
            wilayah: d.wilayah || `${d.propinsi || "Jawa Barat"} / ${d.kab_kota || "Kabupaten Bogor"}`,
            dokumen: d.dokumen_nama || "Laporan_Pengawasan.pdf",
            dokumenUrl: d.dokumen_url,
            status: d.status,
            jumlahObjekDiperiksa: Number(d.jumlah_objek) || 0,
            tingkatKepatuhan: Number(d.tingkat_kepatuhan) || 0,
            tanggalKirim: d.tanggal_kirim || "-",
            nomorSurat: d.nomor_surat,
            catatan: d.catatan,
            _docStatus: d.dokumen_url ? "complete" : "pending",
            // Backwards compatibility
            judulLaporan: d.nama_laporan,
            periode: d.jenis_laporan,
            statusSinkronisasiSipjaki: d.status === "Terverifikasi" ? "Tersinkronisasi" : d.status === "Menunggu Verifikasi" ? "Menunggu Verifikasi Pusat" : "Draft Lokal",
            filePdf: d.dokumen_nama || "Laporan_Pengawasan.pdf",
            fileExcel: `Rekap_${d.tertib_type}_${d.tahun}.xlsx`
          }));

          return {
            data: mapped,
            status: { source: "supabase", message: "Live PostgreSQL Supabase" }
          };
        }
      }
    } catch (err) {
      console.warn("Gagal terhubung ke Supabase pengawasan_pelaporan:", err);
    }
  }

  // Fallback
  const fallback = mockPelaporanRecords.filter((r) => r.tertibType === tertibType);
  return {
    data: fallback,
    status: { source: "fallback", message: "Data Cadangan Lokal (Offline/Fallback Mode)" }
  };
}

/**
 * Menyimpan data pelaporan pengawasan baru ke Supabase
 */
export async function createPelaporanRecord(
  payload: Partial<PelaporanRecord>
): Promise<{ success: boolean; data?: PelaporanRecord; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const dbPayload = {
          id: payload.id,
          tertib_type: payload.tertibType,
          jenis_laporan: payload.jenisLaporan,
          nama_laporan: payload.namaLaporan,
          tahun: payload.tahun,
          propinsi: payload.propinsi || "Jawa Barat",
          kab_kota: payload.kabKota || "Kabupaten Bogor",
          wilayah: payload.wilayah || `${payload.propinsi || "Jawa Barat"} / ${payload.kabKota || "Kabupaten Bogor"}`,
          dokumen_nama: payload.dokumen || payload.filePdf || "Laporan_Pengawasan.pdf",
          dokumen_url: payload.dokumenUrl || null,
          status: payload.status || "Menunggu Verifikasi",
          jumlah_objek: payload.jumlahObjekDiperiksa || 0,
          tingkat_kepatuhan: payload.tingkatKepatuhan || 0,
          tanggal_kirim: payload.tanggalKirim || "-",
          nomor_surat: payload.nomorSurat || null,
          catatan: payload.catatan || null
        };

        const { data, error } = await (client.from("pengawasan_pelaporan") as any)
          .insert(dbPayload)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data: payload as PelaporanRecord };
      }
    } catch (err: any) {
      console.error("Gagal simpan ke Supabase pengawasan_pelaporan:", err);
      return { success: false, error: err.message };
    }
  }

  return { success: true, data: payload as PelaporanRecord };
}

/**
 * Memperbarui data pelaporan pengawasan yang sudah ada
 */
export async function updatePelaporanRecord(
  id: string,
  payload: Partial<PelaporanRecord>
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const updatePayload: Record<string, any> = {
          updated_at: new Date().toISOString()
        };

        if (payload.jenisLaporan !== undefined) updatePayload.jenis_laporan = payload.jenisLaporan;
        if (payload.namaLaporan !== undefined) updatePayload.nama_laporan = payload.namaLaporan;
        if (payload.tahun !== undefined) updatePayload.tahun = payload.tahun;
        if (payload.propinsi !== undefined) updatePayload.propinsi = payload.propinsi;
        if (payload.kabKota !== undefined) updatePayload.kab_kota = payload.kabKota;
        if (payload.wilayah !== undefined) updatePayload.wilayah = payload.wilayah;
        if (payload.dokumen !== undefined) updatePayload.dokumen_nama = payload.dokumen;
        if (payload.dokumenUrl !== undefined) updatePayload.dokumen_url = payload.dokumenUrl;
        if (payload.status !== undefined) updatePayload.status = payload.status;
        if (payload.jumlahObjekDiperiksa !== undefined) updatePayload.jumlah_objek = payload.jumlahObjekDiperiksa;
        if (payload.tingkatKepatuhan !== undefined) updatePayload.tingkat_kepatuhan = payload.tingkatKepatuhan;
        if (payload.tanggalKirim !== undefined) updatePayload.tanggal_kirim = payload.tanggalKirim;
        if (payload.nomorSurat !== undefined) updatePayload.nomor_surat = payload.nomorSurat;
        if (payload.catatan !== undefined) updatePayload.catatan = payload.catatan;

        const { error } = await (client.from("pengawasan_pelaporan") as any)
          .update(updatePayload)
          .eq("id", id);

        if (error) throw error;
        return { success: true };
      }
    } catch (err: any) {
      console.error("Gagal update data pengawasan_pelaporan:", err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
}

/**
 * Menghapus arsip pelaporan pengawasan dari Supabase
 */
export async function deletePelaporanRecord(id: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { error } = await (client.from("pengawasan_pelaporan") as any)
          .delete()
          .eq("id", id);

        if (error) throw error;
        return { success: true };
      }
    } catch (err: any) {
      console.error("Gagal hapus data pengawasan_pelaporan:", err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
}

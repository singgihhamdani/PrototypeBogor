import { createClient, isSupabaseConfigured } from "../supabase/client";
import type { Database } from "../supabase/types";
import { TertibType } from "../tertib-config";
import { 
  mockPelaksanaanRecords, PelaksanaanRecord,
  mockRekomendasiRecords, RekomendasiRecord,
  mockSDMRecords, SDMRecord
} from "@/data/tertib-mock-data";

export type PengawasanSesiRow = Database["public"]["Tables"]["pengawasan_sesi"]["Row"];
export type PengawasanSesiInsert = Database["public"]["Tables"]["pengawasan_sesi"]["Insert"];
export type RekomendasiRow = Database["public"]["Tables"]["pengawasan_rekomendasi"]["Row"];
export type RekomendasiInsert = Database["public"]["Tables"]["pengawasan_rekomendasi"]["Insert"];

export interface DataSourceStatus {
  source: "supabase" | "fallback";
  message: string;
}

// =============================================================================
// 1. PELAKSANAAN AUDIT SIMAK
// =============================================================================

export async function fetchPelaksanaanList(tertibType: TertibType): Promise<{ data: PelaksanaanRecord[]; status: DataSourceStatus }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await client
          .from("pengawasan_sesi")
          .select("*")
          .eq("tipe_tertib", tertibType)
          .order("tanggal_audit", { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: PelaksanaanRecord[] = data.map((d: any) => ({
            id: d.id,
            simakCode: d.simak_code,
            tertibType: d.tipe_tertib,
            namaObjek: d.nama_objek,
            badanUsaha: d.badan_usaha,
            lokasi: d.lokasi,
            tanggalAudit: d.tanggal_audit,
            pengawas: d.pengawas,
            skorTertib: Number(d.skor_tertib),
            kategoriHasil: d.kategori_hasil,
            statusVerifikasi: d.status_verifikasi,
            dokumenBAP: d.dokumen_bap || "BAP_SIMAK_Generated.pdf",
            _docStatus: d.dokumen_bap ? "complete" : "pending"
          }));

          return {
            data: mapped,
            status: { source: "supabase", message: "Live PostgreSQL Database" }
          };
        }
      }
    } catch (err) {
      console.warn("Gagal terhubung ke Supabase pengawasan_sesi, menggunakan fallback:", err);
    }
  }

  // Fallback ke mock data lokal
  const fallback = mockPelaksanaanRecords
    .filter((r) => r.tertibType === tertibType)
    .map((r) => ({
      ...r,
      _docStatus: r._docStatus || "complete"
    }));

  return {
    data: fallback,
    status: { source: "fallback", message: "Data Cadangan Lokal (Offline/Fallback Mode)" }
  };
}

export async function createPelaksanaanAudit(record: {
  simakCode: string;
  tertibType: TertibType;
  namaObjek: string;
  badanUsaha: string;
  lokasi: string;
  tanggalAudit: string;
  pengawas: string;
  skorTertib: number;
  kategoriHasil: 'Tertib' | 'Cukup Tertib' | 'Kurang Tertib';
  catatanTemuan?: string;
  rekomendasi?: string;
}): Promise<{ success: boolean; data?: PelaksanaanRecord; error?: string }> {
  const generatedId = `PEL-${record.tertibType.substring(0, 2).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  const payload: PengawasanSesiInsert = {
    id: generatedId,
    simak_code: record.simakCode,
    tipe_tertib: record.tertibType,
    nama_objek: record.namaObjek,
    badan_usaha: record.badanUsaha,
    lokasi: record.lokasi,
    tanggal_audit: record.tanggalAudit,
    pengawas: record.pengawas,
    skor_tertib: record.skorTertib,
    kategori_hasil: record.kategoriHasil,
    status_verifikasi: "Draft",
    dokumen_bap: `BAP_${record.simakCode.replace(/\s+/g, "_")}_${record.badanUsaha.replace(/[^a-zA-Z0-9]/g, "")}.pdf`,
    catatan_temuan: record.catatanTemuan || null,
    rekomendasi: record.rekomendasi || null
  };

  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client.from("pengawasan_sesi") as any)
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        return {
          success: true,
          data: {
            id: data.id,
            simakCode: data.simak_code,
            tertibType: data.tipe_tertib,
            namaObjek: data.nama_objek,
            badanUsaha: data.badan_usaha,
            lokasi: data.lokasi,
            tanggalAudit: data.tanggal_audit,
            pengawas: data.pengawas,
            skorTertib: Number(data.skor_tertib),
            kategoriHasil: data.kategori_hasil,
            statusVerifikasi: data.status_verifikasi,
            dokumenBAP: data.dokumen_bap,
            _docStatus: "complete"
          }
        };
      }
    } catch (err: any) {
      console.error("Gagal simpan sesi audit ke Supabase:", err);
      return { success: false, error: err.message };
    }
  }

  // Fallback in-memory response
  return {
    success: true,
    data: {
      id: generatedId,
      simakCode: record.simakCode,
      tertibType: record.tertibType,
      namaObjek: record.namaObjek,
      badanUsaha: record.badanUsaha,
      lokasi: record.lokasi,
      tanggalAudit: record.tanggalAudit,
      pengawas: record.pengawas,
      skorTertib: record.skorTertib,
      kategoriHasil: record.kategoriHasil,
      statusVerifikasi: "Draft",
      dokumenBAP: payload.dokumen_bap || "BAP.pdf",
      _docStatus: "complete"
    }
  };
}

export async function updateAuditVerification(
  id: string, 
  status: "Terverifikasi" | "Ditolak" | "Draft" | "Menunggu Verifikasi"
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { error } = await (client.from("pengawasan_sesi") as any)
          .update({
            status_verifikasi: status,
            diverifikasi_pada: new Date().toISOString()
          })
          .eq("id", id);

        if (error) throw error;
        return { success: true };
      }
    } catch (err: any) {
      console.error("Gagal update status verifikasi audit:", err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
}

export async function batchInsertPelaksanaan(items: PengawasanSesiInsert[]): Promise<{ success: boolean; count: number; error?: string }> {
  if (isSupabaseConfigured() && items.length > 0) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client.from("pengawasan_sesi") as any)
          .upsert(items, { onConflict: "id" })
          .select();

        if (error) throw error;
        return { success: true, count: data?.length || items.length };
      }
    } catch (err: any) {
      console.error("Batch insert pengawasan error:", err);
      return { success: false, count: 0, error: err.message };
    }
  }

  return { success: true, count: items.length };
}

// =============================================================================
// 2. REKOMENDASI & TINDAK LANJUT
// =============================================================================

export async function fetchRekomendasiList(tertibType: TertibType): Promise<{ data: RekomendasiRecord[]; status: DataSourceStatus }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await client
          .from("pengawasan_rekomendasi")
          .select("*")
          .eq("tertib_type", tertibType)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: RekomendasiRecord[] = data.map((d: any) => ({
            id: d.id,
            nomorSurat: d.nomor_surat,
            tertibType: d.tertib_type,
            badanUsahaAtauObjek: d.badan_usaha_atau_objek,
            temuanUtama: d.temuan_utama,
            rekomendasiTindakan: d.rekomendasi_tindakan,
            tenggatWaktu: d.tenggat_waktu,
            statusTindakLanjut: d.status_tindak_lanjut,
            statusVerifikasi: d.status_verifikasi,
            catatanVerifikator: d.catatan_verifikator || undefined
          }));

          return {
            data: mapped,
            status: { source: "supabase", message: "Live PostgreSQL Database" }
          };
        }
      }
    } catch (err) {
      console.warn("Gagal terhubung ke Supabase pengawasan_rekomendasi:", err);
    }
  }

  // Fallback
  const fallback = mockRekomendasiRecords.filter((r) => r.tertibType === tertibType);
  return {
    data: fallback,
    status: { source: "fallback", message: "Data Cadangan Lokal (Offline/Fallback Mode)" }
  };
}

export async function updateTindakLanjutStatus(
  id: string,
  status: "Belum Selesai" | "Dalam Proses" | "Selesai & Patuh" | "Diberi Sanksi"
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { error } = await (client.from("pengawasan_rekomendasi") as any)
          .update({
            status_tindak_lanjut: status,
            updated_at: new Date().toISOString()
          })
          .eq("id", id);

        if (error) throw error;
        return { success: true };
      }
    } catch (err: any) {
      console.error("Gagal update status tindak lanjut:", err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
}

// =============================================================================
// 3. SDM PERENCANAAN TIM PENGAWAS
// =============================================================================

export async function fetchSDMPerencanaanList(tertibType: TertibType): Promise<{ data: SDMRecord[]; status: DataSourceStatus }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await client
          .from("pengawasan_sdm_perencanaan")
          .select("*")
          .eq("tertib_type", tertibType);

        if (!error && data && data.length > 0) {
          const mapped: SDMRecord[] = data.map((d: any) => ({
            id: d.id,
            tertibType: d.tertib_type,
            wilayah: d.wilayah,
            jumlahSdm: d.jumlah_sdm,
            tahun: d.tahun,
            dokumen: d.dokumen || "SK_Pengawas.pdf",
            status: d.status,
            namaTim: d.nama_tim || undefined,
            ketuaTim: d.ketua_tim || undefined,
            _docStatus: d.dokumen ? "complete" : "pending"
          }));

          return {
            data: mapped,
            status: { source: "supabase", message: "Live PostgreSQL Database" }
          };
        }
      }
    } catch (err) {
      console.warn("Gagal terhubung ke Supabase pengawasan_sdm_perencanaan:", err);
    }
  }

  return {
    data: mockSDMRecords.filter((r) => r.tertibType === tertibType),
    status: { source: "fallback", message: "Data Cadangan Lokal (Offline/Fallback Mode)" }
  };
}

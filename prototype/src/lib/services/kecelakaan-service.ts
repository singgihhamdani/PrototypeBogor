import { createClient, isSupabaseConfigured } from "../supabase/client";
import incidentsFallback from "@/data/incidents.json";

export interface DataSourceStatus {
  source: "supabase" | "fallback";
  message: string;
}

export interface KecelakaanItem {
  id: string;
  nama_pekerjaan: string;
  paket_pekerjaan_id?: string | null;
  nama_perusahaan: string;
  bujk_id?: string | null;
  lokasi: string;
  tanggal: string;
  waktu_jam: string;
  deskripsi: string;
  kerugian: string;
  kategori_kerugian: "Nir-Korban (Near Miss)" | "Luka Ringan" | "Luka Berat" | "Fatalitas / Meninggal";
  estimasi_kerugian_nominal: number;
  masalah: string;
  propinsi: string;
  kab_kota: string;
  sumber_dana: "APBD" | "DAK" | "APBN" | "Bantuan Keuangan";
  status: "Dalam Investigasi" | "Dalam Pemantauan" | "Selesai (Investigasi Ditutup)";
  dokumen_bap_url?: string | null;
  created_at: string;
  updated_at: string;
}

export type KecelakaanInsert = Omit<KecelakaanItem, "created_at" | "updated_at"> & {
  created_at?: string;
  updated_at?: string;
};

// =============================================================================
// KECELAKAAN KERJA DATA SERVICES (SIPJAKI K3 SMKK)
// =============================================================================

export async function fetchKecelakaanList(): Promise<{ data: KecelakaanItem[]; status: DataSourceStatus }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client as any)
          .from("kecelakaan_kerja")
          .select("*")
          .order("updated_at", { ascending: false });

        if (!error && data && data.length > 0) {
          return {
            data: data as KecelakaanItem[],
            status: { source: "supabase", message: "Live PostgreSQL Database" }
          };
        }
      }
    } catch (err) {
      console.warn("Gagal terhubung ke Supabase kecelakaan_kerja, menggunakan data cadangan lokal:", err);
    }
  }

  // Fallback ke local incidents.json (Diurutkan dari pembaruan terkini)
  const sortedFallback = [...incidentsFallback].sort((a: any, b: any) => {
    const timeA = new Date(a.updatedAt || a.date || 0).getTime();
    const timeB = new Date(b.updatedAt || b.date || 0).getTime();
    return timeB - timeA;
  });

  const mappedFallback: KecelakaanItem[] = sortedFallback.map((inc: any) => ({
    id: inc.id,
    nama_pekerjaan: inc.projectName || "Pekerjaan Konstruksi",
    paket_pekerjaan_id: inc.projectId || null,
    nama_perusahaan: inc.contractor || "Kontraktor Pelaksana",
    bujk_id: inc.contractorId || null,
    lokasi: inc.locationDetail || inc.district || "Kabupaten Bogor",
    tanggal: inc.date || "2026-01-01",
    waktu_jam: inc.time || "10:00 WIB",
    deskripsi: inc.chronology || inc.incidentType || "-",
    kerugian: inc.loss || inc.severity || "Luka Ringan",
    kategori_kerugian: (inc.lossCategory || inc.severity || "Luka Ringan") as any,
    estimasi_kerugian_nominal: Number(inc.estimatedLoss) || 0,
    masalah: inc.problem || inc.incidentType || "Kecelakaan Kerja Lapangan",
    propinsi: inc.province || "Jawa Barat",
    kab_kota: inc.city || "Kabupaten Bogor",
    sumber_dana: (inc.source || "APBD") as any,
    status: (inc.status || "Selesai (Investigasi Ditutup)") as any,
    dokumen_bap_url: inc.bapDocumentUrl || null,
    created_at: inc.updatedAt || new Date().toISOString(),
    updated_at: inc.updatedAt || new Date().toISOString()
  }));

  return {
    data: mappedFallback,
    status: { source: "fallback", message: "Data Cadangan Lokal (Offline/Fallback Mode)" }
  };
}

export async function createKecelakaan(item: KecelakaanInsert): Promise<{ success: boolean; data?: KecelakaanItem; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client as any)
          .from("kecelakaan_kerja")
          .insert(item)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data: data as KecelakaanItem };
      }
    } catch (err: any) {
      console.error("Error creating Kecelakaan on Supabase:", err);
      return { success: false, error: err.message || "Gagal menyimpan ke basis data PostgreSQL" };
    }
  }

  return {
    success: true,
    data: {
      ...item,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };
}

export async function updateKecelakaan(
  id: string,
  payload: Partial<KecelakaanInsert>
): Promise<{ success: boolean; data?: KecelakaanItem; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const updatePayload = {
          ...payload,
          updated_at: new Date().toISOString()
        };
        const { data, error } = await (client as any)
          .from("kecelakaan_kerja")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data: data as KecelakaanItem };
      }
    } catch (err: any) {
      console.error("Error updating Kecelakaan on Supabase:", err);
      return { success: false, error: err.message || "Gagal memperbarui data kecelakaan" };
    }
  }

  return { success: true };
}

export async function deleteKecelakaan(id: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { error } = await (client as any)
          .from("kecelakaan_kerja")
          .delete()
          .eq("id", id);

        if (error) throw error;
        return { success: true };
      }
    } catch (err: any) {
      console.error("Error deleting Kecelakaan on Supabase:", err);
      return { success: false, error: err.message || "Gagal menghapus data kecelakaan" };
    }
  }

  return { success: true };
}

export async function batchInsertKecelakaan(items: KecelakaanInsert[]): Promise<{ success: boolean; count: number; error?: string }> {
  if (isSupabaseConfigured() && items.length > 0) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client as any)
          .from("kecelakaan_kerja")
          .upsert(items, { onConflict: "id" })
          .select();

        if (error) throw error;
        return { success: true, count: data?.length || items.length };
      }
    } catch (err: any) {
      console.error("Batch insert error kecelakaan on Supabase:", err);
      return { success: false, count: 0, error: err.message };
    }
  }

  return { success: true, count: items.length };
}

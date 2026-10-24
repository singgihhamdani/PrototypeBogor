import { createClient, isSupabaseConfigured } from "../supabase/client";
import type { Database } from "../supabase/types";
import bujkFallback from "@/data/bujk.json";
import projectsFallback from "@/data/projects.json";

export type BUJKItem = Database["public"]["Tables"]["bujk"]["Row"];
export type BUJKInsert = Database["public"]["Tables"]["bujk"]["Insert"];
export type PaketItem = Database["public"]["Tables"]["paket_pekerjaan"]["Row"];
export type PaketInsert = Database["public"]["Tables"]["paket_pekerjaan"]["Insert"];
export type TKKItem = Database["public"]["Tables"]["tkk"]["Row"];

export interface DataSourceStatus {
  source: "supabase" | "fallback";
  message: string;
}

// =============================================================================
// 1. BUJK DATA SERVICES
// =============================================================================

export async function fetchBUJKList(): Promise<{ data: BUJKItem[]; status: DataSourceStatus }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await client
          .from("bujk")
          .select("*")
          .order("id", { ascending: true });

        if (!error && data && data.length > 0) {
          return {
            data,
            status: { source: "supabase", message: "Live Supabase PostgreSQL Database" }
          };
        }
      }
    } catch (err) {
      console.warn("Gagal terhubung ke Supabase bujk, menggunakan data fallback:", err);
    }
  }

  // Fallback ke local JSON jika Supabase belum diisi atau error
  const mappedFallback: BUJKItem[] = bujkFallback.map((b) => ({
    id: b.id,
    nama_badan_usaha: b.name,
    bentuk_usaha: (b.type as any) || "PT",
    nib: b.nib,
    npwp: b.npwp,
    penanggung_jawab: b.leader,
    kualifikasi: (b.qualification as any) || "Kecil",
    kecamatan: b.district,
    kode_kecamatan: b.districtId,
    alamat: b.address,
    telepon: b.phone,
    email: b.email,
    jumlah_sbu: b.sbuCount,
    tanggal_kedaluwarsa_sbu: b.sbuExpiry,
    status_verifikasi: (b.status as any) || "Aktif",
    proyek_aktif_count: b.projectsActive,
    dokumen_legalitas_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  return {
    data: mappedFallback,
    status: { source: "fallback", message: "Data Cadangan Lokal (Offline/Fallback Mode)" }
  };
}

export async function createBUJK(item: BUJKInsert): Promise<{ success: boolean; data?: BUJKItem; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client.from("bujk") as any)
          .insert(item)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      }
    } catch (err: any) {
      console.error("Error creating BUJK on Supabase:", err);
      return { success: false, error: err.message || "Gagal menyimpan ke Supabase" };
    }
  }

  // In-memory fallback response
  return {
    success: true,
    data: {
      ...item,
      bentuk_usaha: item.bentuk_usaha || "PT",
      kode_kecamatan: item.kode_kecamatan || null,
      telepon: item.telepon || null,
      email: item.email || null,
      jumlah_sbu: item.jumlah_sbu || 1,
      tanggal_kedaluwarsa_sbu: item.tanggal_kedaluwarsa_sbu || null,
      status_verifikasi: item.status_verifikasi || "Aktif",
      proyek_aktif_count: item.proyek_aktif_count || 0,
      dokumen_legalitas_url: item.dokumen_legalitas_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };
}

export async function fetchBUJKById(id: string): Promise<BUJKItem | null> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await client
          .from("bujk")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (!error && data) {
          return data;
        }
      }
    } catch (err) {
      console.warn("Gagal fetch bujk by id:", err);
    }
  }

  const found = bujkFallback.find((b) => b.id === id);
  if (!found) return null;
  return {
    id: found.id,
    nama_badan_usaha: found.name,
    bentuk_usaha: (found.type as any) || "PT",
    nib: found.nib,
    npwp: found.npwp,
    penanggung_jawab: found.leader,
    kualifikasi: (found.qualification as any) || "Kecil",
    kecamatan: found.district,
    kode_kecamatan: found.districtId,
    alamat: found.address,
    telepon: found.phone,
    email: found.email,
    jumlah_sbu: found.sbuCount,
    tanggal_kedaluwarsa_sbu: found.sbuExpiry,
    status_verifikasi: (found.status as any) || "Aktif",
    proyek_aktif_count: found.projectsActive,
    dokumen_legalitas_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export async function batchInsertBUJK(items: BUJKInsert[]): Promise<{ success: boolean; count: number; error?: string }> {
  if (isSupabaseConfigured() && items.length > 0) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client.from("bujk") as any)
          .upsert(items, { onConflict: "id" })
          .select();

        if (error) throw error;
        return { success: true, count: data?.length || items.length };
      }
    } catch (err: any) {
      console.error("Batch insert error on Supabase:", err);
      return { success: false, count: 0, error: err.message };
    }
  }

  return { success: true, count: items.length };
}

// =============================================================================
// 2. PAKET PEKERJAAN DATA SERVICES
// =============================================================================

export async function fetchPaketList(): Promise<{ data: PaketItem[]; status: DataSourceStatus }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await client
          .from("paket_pekerjaan")
          .select("*")
          .order("id", { ascending: true });

        if (!error && data && data.length > 0) {
          return {
            data: data as PaketItem[],
            status: { source: "supabase", message: "Live Supabase PostgreSQL Database" }
          };
        }
      }
    } catch (err) {
      console.warn("Gagal terhubung ke Supabase paket_pekerjaan, fallback:", err);
    }
  }

  // Fallback ke local projects.json
  const mappedFallback: PaketItem[] = projectsFallback.map((p) => ({
    id: p.id,
    nama_paket: p.name,
    tahun_anggaran: p.fiscalYear,
    sumber_dana: (p.source as any) || "APBD",
    nama_instansi: p.owner,
    bujk_id: p.contractorId,
    nama_penyedia: p.contractor,
    nib_penyedia: p.nib,
    nilai_kontrak: p.contractValue,
    jenis_kontrak: p.contractType,
    sifat_kontrak: p.contractChar,
    tanggal_mulai: p.startDate,
    tanggal_selesai: p.endDate,
    progres_fisik: p.physProgress,
    progres_keuangan: p.finProgress,
    bulan_progres: p.physMonth,
    status_pekerjaan: (p.status as any) || "Pelaksanaan",
    kode_kecamatan: p.districtId,
    kecamatan: "Kabupaten Bogor",
    lat: p.lat,
    lng: p.lng,
    kurva_s_rencana: p.planProgress,
    kurva_s_realisasi: p.realProgress,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  return {
    data: mappedFallback,
    status: { source: "fallback", message: "Data Cadangan Lokal (Offline/Fallback Mode)" }
  };
}

export async function createPaket(item: PaketInsert): Promise<{ success: boolean; data?: PaketItem; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client.from("paket_pekerjaan") as any)
          .insert(item)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data: data as PaketItem };
      }
    } catch (err: any) {
      console.error("Error creating Paket on Supabase:", err);
      return { success: false, error: err.message || "Gagal menyimpan ke Supabase" };
    }
  }

  return {
    success: true,
    data: {
      ...item,
      bujk_id: item.bujk_id || null,
      nib_penyedia: item.nib_penyedia || null,
      jenis_kontrak: item.jenis_kontrak || "Konstruksi",
      sifat_kontrak: item.sifat_kontrak || "Harga Satuan",
      progres_fisik: item.progres_fisik || 0,
      progres_keuangan: item.progres_keuangan || 0,
      bulan_progres: item.bulan_progres || null,
      status_pekerjaan: item.status_pekerjaan || "Pelaksanaan",
      kode_kecamatan: item.kode_kecamatan || null,
      kecamatan: item.kecamatan || null,
      lat: item.lat || null,
      lng: item.lng || null,
      kurva_s_rencana: item.kurva_s_rencana || [],
      kurva_s_realisasi: item.kurva_s_realisasi || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };
}

export async function batchInsertPaket(items: PaketInsert[]): Promise<{ success: boolean; count: number; error?: string }> {
  if (isSupabaseConfigured() && items.length > 0) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client.from("paket_pekerjaan") as any)
          .upsert(items, { onConflict: "id" })
          .select();

        if (error) throw error;
        return { success: true, count: data?.length || items.length };
      }
    } catch (err: any) {
      console.error("Batch insert error paket on Supabase:", err);
      return { success: false, count: 0, error: err.message };
    }
  }

  return { success: true, count: items.length };
}

// =============================================================================
// 3. TKK DATA SERVICES
// =============================================================================

export async function fetchTKKList(): Promise<{ data: TKKItem[]; status: DataSourceStatus }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await client
          .from("tkk")
          .select("*")
          .order("nama_lengkap", { ascending: true });

        if (!error && data && data.length > 0) {
          return {
            data,
            status: { source: "supabase", message: "Live Supabase PostgreSQL Database" }
          };
        }
      }
    } catch (err) {
      console.warn("Gagal terhubung ke Supabase tkk, fallback:", err);
    }
  }

  return {
    data: [],
    status: { source: "fallback", message: "Data Cadangan Lokal (Offline/Fallback Mode)" }
  };
}

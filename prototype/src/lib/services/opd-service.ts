import { createClient, isSupabaseConfigured } from "../supabase/client";
import type { Database } from "../supabase/types";

export interface OpdRecord {
  id: string;
  kode: string;
  nama: string;
  namaPendek: string;
  kepalaOpd: string;
  nipKepala?: string;
  alamat: string;
  telepon: string;
  isActive: boolean;
  userCount?: number;
}

export interface DataSourceStatus {
  source: "supabase" | "fallback";
  message: string;
}

export const INITIAL_OPD_FALLBACK: OpdRecord[] = [
  {
    id: "opd-dpu",
    kode: "DPU",
    nama: "Dinas Pekerjaan Umum",
    namaPendek: "DPU",
    kepalaOpd: "Drs. H. Suryanto Putra, M.Si",
    nipKepala: "196811051994031002",
    alamat: "Jl. Tegar Beriman No. 1, Cibinong, Kabupaten Bogor",
    telepon: "(021) 8754123",
    isActive: true,
    userCount: 4,
  },
  {
    id: "opd-bappeda",
    kode: "BAPPEDA",
    nama: "Badan Perencanaan Pembangunan Daerah",
    namaPendek: "Bappeda",
    kepalaOpd: "Ir. Hj. Nurhayati, MT",
    nipKepala: "197203151998032003",
    alamat: "Kompleks Perkantoran Pemkab Bogor, Cibinong",
    telepon: "(021) 8754200",
    isActive: true,
    userCount: 1,
  },
  {
    id: "opd-bpkad",
    kode: "BPKAD",
    nama: "Badan Pengelolaan Keuangan dan Aset Daerah",
    namaPendek: "BPKAD",
    kepalaOpd: "Achmad Wildan, SE, MM",
    nipKepala: "197504202000031001",
    alamat: "Jl. Bersih No. 2, Cibinong, Kabupaten Bogor",
    telepon: "(021) 8754321",
    isActive: true,
    userCount: 1,
  },
  {
    id: "opd-disdik",
    kode: "DISDIK",
    nama: "Dinas Pendidikan",
    namaPendek: "Disdik",
    kepalaOpd: "Bambang Widodo Tawekal, M.Pd",
    nipKepala: "196908101995121001",
    alamat: "Jl. Nyaman No. 5, Cibinong, Kabupaten Bogor",
    telepon: "(021) 8754400",
    isActive: true,
    userCount: 1,
  },
  {
    id: "opd-dinkes",
    kode: "DINKES",
    nama: "Dinas Kesehatan",
    namaPendek: "Dinkes",
    kepalaOpd: "dr. Mike Kaltarina, MARS",
    nipKepala: "197412022002122001",
    alamat: "Jl. Kesehatan No. 3, Cibinong, Kabupaten Bogor",
    telepon: "(021) 8754500",
    isActive: true,
    userCount: 1,
  },
];

export async function fetchOpdList(): Promise<{ data: OpdRecord[]; status: DataSourceStatus }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await client
          .from("opd")
          .select("*")
          .order("kode", { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: OpdRecord[] = data.map((row: any) => {
            const fallbackItem = INITIAL_OPD_FALLBACK.find(f => f.kode === row.kode);
            return {
              id: row.id,
              kode: row.kode,
              nama: row.nama,
              namaPendek: row.nama_pendek || row.kode,
              kepalaOpd: row.kepala_opd || fallbackItem?.kepalaOpd || "Kepala Satuan Kerja",
              nipKepala: fallbackItem?.nipKepala || "197001011995011001",
              alamat: row.alamat || fallbackItem?.alamat || "Kabupaten Bogor",
              telepon: row.telepon || fallbackItem?.telepon || "(021) 8754000",
              isActive: row.is_active ?? true,
              userCount: fallbackItem?.userCount || 1,
            };
          });

          return {
            data: mapped,
            status: { source: "supabase", message: "Live PostgreSQL Database" }
          };
        }
      }
    } catch (err) {
      console.warn("Gagal terhubung ke Supabase opd, menggunakan fallback:", err);
    }
  }

  return {
    data: INITIAL_OPD_FALLBACK,
    status: { source: "fallback", message: "Data Cadangan Lokal (Offline/Fallback Mode)" }
  };
}

export async function createOpdItem(opd: {
  kode: string;
  nama: string;
  namaPendek?: string;
  kepalaOpd?: string;
  alamat?: string;
  telepon?: string;
  isActive?: boolean;
}): Promise<{ success: boolean; data?: OpdRecord; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const payload = {
          kode: opd.kode.toUpperCase(),
          nama: opd.nama,
          nama_pendek: opd.namaPendek || opd.kode,
          kepala_opd: opd.kepalaOpd || null,
          alamat: opd.alamat || null,
          telepon: opd.telepon || null,
          is_active: opd.isActive ?? true
        };

        const { data, error } = await (client.from("opd") as any)
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        return {
          success: true,
          data: {
            id: data.id,
            kode: data.kode,
            nama: data.nama,
            namaPendek: data.nama_pendek || data.kode,
            kepalaOpd: data.kepala_opd || "",
            nipKepala: "197001011995011001",
            alamat: data.alamat || "",
            telepon: data.telepon || "",
            isActive: data.is_active ?? true,
            userCount: 0
          }
        };
      }
    } catch (err: any) {
      console.error("Gagal tambah OPD ke Supabase:", err);
      return { success: false, error: err.message };
    }
  }

  return {
    success: true,
    data: {
      id: `opd-${Date.now()}`,
      kode: opd.kode,
      nama: opd.nama,
      namaPendek: opd.namaPendek || opd.kode,
      kepalaOpd: opd.kepalaOpd || "",
      nipKepala: "197001011995011001",
      alamat: opd.alamat || "",
      telepon: opd.telepon || "",
      isActive: opd.isActive ?? true,
      userCount: 0
    }
  };
}

export async function toggleOpdActiveStatus(id: string, currentStatus: boolean): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { error } = await (client.from("opd") as any)
          .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
          .eq("id", id);

        if (error) throw error;
        return { success: true };
      }
    } catch (err: any) {
      console.error("Gagal toggle status OPD di Supabase:", err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
}

import { createClient, isSupabaseConfigured } from "../supabase/client";
import fallbackPeserta from "@/data/peserta_pelatihan.json";

export interface PesertaItem {
  id: string;
  id_tkk?: string;
  perencanaan_id?: string | null;
  nik: string;
  nama_lengkap: string;
  email: string;
  telepon: string;
  pendidikan_terakhir: string;
  riwayat_pekerjaan: string | null;
  skema_pendaftaran: "Internal (Batch)" | "Eksternal (Mandiri)";
  asal_instansi_bujk: string | null;
  ktp_url?: string | null;
  ijazah_url?: string | null;
  foto_url?: string | null;
  surat_tugas_url?: string | null;
  status_kelengkapan?: "Lengkap" | "Belum Lengkap";
  kelengkapan_rincian?: string | null;
  link_form_token?: string | null;
  memiliki_sertifikat_lpjk: boolean;
  nomor_registrasi_lpjk: string | null;
  dokumen_scan_lpjk_url: string | null;
  is_first_login: boolean;
  status_verifikasi: "Menunggu Verifikasi" | "Terverifikasi" | "Ditolak";
  catatan_admin?: string | null;
  created_at?: string;
  updated_at?: string;
  riwayat?: RiwayatPelatihanItem[];
}

export interface RiwayatPelatihanItem {
  id: string;
  peserta_id: string;
  nik: string;
  nama_kegiatan: string;
  kategori_pelatihan: string;
  tahun_pelatihan: number;
  nomor_urut_peserta: string;
  nomor_sertifikat: string;
  penyelenggara: string;
  jabatan_kerja: string;
  jenjang_kualifikasi: string;
  jam_pelajaran: number;
  kehadiran_jp: number;
  nilai_akhir: number;
  hasil_asesmen: "KOMPETEN" | "BELUM KOMPETEN" | "DALAM PROSES";
  tanggal_mulai: string;
  tanggal_selesai: string;
  dokumen_sertifikat_url: string;
  qr_code_token: string;
  status_pelatihan: "Sedang Berjalan" | "Selesai" | "Dibatalkan";
  created_at?: string;
  updated_at?: string;
}

export interface DataSourceStatus {
  source: "supabase" | "fallback";
  message: string;
}

/**
 * Formula Kode Unik Sertifikat: [Tahun Pelatihan] / [Kategori Pelatihan] / [No Peserta Terdaftar]
 * Contoh: 2026/PEL-GEDUNG/0094
 */
export function generateNomorSertifikat(
  tahun: number, 
  kategori: string, 
  noUrut: number | string
): string {
  const cleanKategori = (kategori || "PEL-TKK").trim().toUpperCase();
  const cleanNo = String(noUrut).padStart(4, "0");
  return `${tahun}/${cleanKategori}/${cleanNo}`;
}

/**
 * Validasi Keunikan NIK (Single Identity Number / Dukcapil 16 Digit)
 */
export async function checkPesertaNIKExists(
  nik: string, 
  currentId?: string
): Promise<{ exists: boolean; pesertaName?: string; id?: string }> {
  const cleanNik = (nik || "").trim();
  if (!cleanNik) return { exists: false };

  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        let query = (client.from("peserta_pelatihan") as any)
          .select("id, nama_lengkap, nik")
          .eq("nik", cleanNik);
        if (currentId) {
          query = query.neq("id", currentId);
        }
        const { data, error } = await query.maybeSingle();
        if (!error && data) {
          const row = data as { id: string; nama_lengkap: string; nik: string };
          return {
            exists: true,
            pesertaName: row.nama_lengkap,
            id: row.id
          };
        }
      }
    } catch (err) {
      console.warn("Gagal mengecek keunikan NIK peserta di Supabase:", err);
    }
  }

  // Fallback lokal
  const found = fallbackPeserta.find(
    (p: any) => p.nik.trim() === cleanNik && (!currentId || p.id !== currentId)
  );

  if (found) {
    return {
      exists: true,
      pesertaName: found.nama_lengkap,
      id: found.id
    };
  }

  return { exists: false };
}

/**
 * Mengambil seluruh daftar peserta pelatihan TKK
 */
export async function fetchPesertaList(): Promise<{ data: PesertaItem[]; status: DataSourceStatus }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client.from("peserta_pelatihan") as any)
          .select("*, peserta_riwayat_pelatihan(*)")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          return {
            data: data as PesertaItem[],
            status: {
              source: "supabase",
              message: "Data peserta pelatihan berhasil disinkronisasi dari Supabase Cloud."
            }
          };
        }
      }
    } catch (err: any) {
      console.warn("Exception saat fetchPesertaList:", err.message);
    }
  }

  return {
    data: (fallbackPeserta as unknown) as PesertaItem[],
    status: {
      source: "fallback",
      message: "Data cadangan lokal peserta pelatihan (offline/fallback mode)."
    }
  };
}

/**
 * Mendaftarkan peserta pelatihan baru (Skema Internal)
 */
export async function createPeserta(newItem: PesertaItem): Promise<{ success: boolean; data?: PesertaItem; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client.from("peserta_pelatihan") as any)
          .insert([newItem])
          .select()
          .single();

        if (!error && data) {
          return { success: true, data: data as PesertaItem };
        }
      }
    } catch (err: any) {
      console.warn("Exception saat createPeserta:", err.message);
    }
  }

  // Simpan secara in-memory fallback
  (fallbackPeserta as any[]).unshift(newItem);
  return { success: true, data: newItem };
}

/**
 * Mengambil profil peserta beserta daftar riwayat pelatihan
 */
export async function fetchPesertaProfile(
  idOrNik: string
): Promise<{ data: PesertaItem | null; status: DataSourceStatus }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client.from("peserta_pelatihan") as any)
          .select("*, peserta_riwayat_pelatihan(*)")
          .or(`id.eq.${idOrNik},nik.eq.${idOrNik}`)
          .maybeSingle();

        if (!error && data) {
          // Setting Default Filter: Urutan riwayat dari yang paling mutakhir (DESC)
          const sortedRiwayat = (data.peserta_riwayat_pelatihan || []).sort((a: any, b: any) => {
            if (b.tahun_pelatihan !== a.tahun_pelatihan) {
              return b.tahun_pelatihan - a.tahun_pelatihan;
            }
            return new Date(b.tanggal_mulai).getTime() - new Date(a.tanggal_mulai).getTime();
          });

          return {
            data: {
              ...data,
              riwayat: sortedRiwayat
            } as PesertaItem,
            status: { source: "supabase", message: "Live PostgreSQL Database" }
          };
        }
      }
    } catch (err) {
      console.warn("Gagal fetch peserta profile dari Supabase, fallback:", err);
    }
  }

  // Fallback lokal
  const found = (fallbackPeserta as any[]).find(
    (p) => p.id === idOrNik || p.nik === idOrNik
  );

  if (!found) {
    return { data: null, status: { source: "fallback", message: "Data tidak ditemukan" } };
  }

  // Setting Default Filter Riwayat: DESC (paling baru di atas)
  const sortedRiwayat = [...(found.riwayat || [])].sort((a: any, b: any) => {
    if (b.tahun_pelatihan !== a.tahun_pelatihan) {
      return b.tahun_pelatihan - a.tahun_pelatihan;
    }
    return new Date(b.tanggal_mulai).getTime() - new Date(a.tanggal_mulai).getTime();
  });

  return {
    data: {
      ...found,
      riwayat: sortedRiwayat
    } as PesertaItem,
    status: { source: "fallback", message: "Data Cadangan Lokal (Offline/Fallback Mode)" }
  };
}

/**
 * Mengambil daftar riwayat pelatihan peserta dengan urutan default DESC (Pekerjaan/Pelatihan terakhir di atas)
 */
export async function fetchRiwayatPelatihanByPeserta(
  pesertaId: string, 
  nik?: string
): Promise<{ data: RiwayatPelatihanItem[]; status: DataSourceStatus }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        let query = (client.from("peserta_riwayat_pelatihan") as any).select("*");
        if (pesertaId && nik) {
          query = query.or(`peserta_id.eq.${pesertaId},nik.eq.${nik}`);
        } else if (pesertaId) {
          query = query.eq("peserta_id", pesertaId);
        }

        // Setting Default Filter: Urutan awal diambil dari pelatihan terakhir (DESC)
        query = query
          .order("tahun_pelatihan", { ascending: false })
          .order("tanggal_mulai", { ascending: false })
          .order("updated_at", { ascending: false });

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return {
            data: data as RiwayatPelatihanItem[],
            status: { source: "supabase", message: "Live PostgreSQL Database" }
          };
        }
      }
    } catch (err) {
      console.warn("Gagal fetch riwayat peserta dari Supabase, fallback:", err);
    }
  }

  // Fallback lokal
  const parent = (fallbackPeserta as any[]).find((p) => p.id === pesertaId || p.nik === nik);
  const items = parent?.riwayat || [];

  // Setting Default Filter: Kronologis Terbalik (Pelatihan Terakhir di Urutan Pertama)
  const sorted = [...items].sort((a: any, b: any) => {
    if (b.tahun_pelatihan !== a.tahun_pelatihan) {
      return b.tahun_pelatihan - a.tahun_pelatihan;
    }
    const dateA = new Date(a.tanggal_mulai || 0).getTime();
    const dateB = new Date(b.tanggal_mulai || 0).getTime();
    if (dateB !== dateA) return dateB - dateA;
    return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
  });

  return {
    data: sorted as RiwayatPelatihanItem[],
    status: { source: "fallback", message: "Data Cadangan Lokal (Offline/Fallback Mode)" }
  };
}

/**
 * Pendaftaran Mandiri Peserta Eksternal
 */
export async function registerPesertaEksternal(payload: {
  nik: string;
  nama_lengkap: string;
  email: string;
  telepon: string;
  pendidikan_terakhir: string;
  riwayat_pekerjaan: string;
  ktp_url?: string;
  ijazah_url?: string;
  foto_url?: string;
  memiliki_sertifikat_lpjk: boolean;
  nomor_registrasi_lpjk?: string;
  dokumen_scan_lpjk_url?: string;
  kategori_pelatihan_diminati?: string;
}): Promise<{ success: boolean; data?: PesertaItem; error?: string }> {
  const cleanNik = payload.nik.trim();
  if (cleanNik.length !== 16) {
    return { success: false, error: "Nomor Induk Kependudukan (NIK) harus tepat 16 digit angka." };
  }

  // Cek duplikasi NIK
  const check = await checkPesertaNIKExists(cleanNik);
  if (check.exists) {
    return {
      success: false,
      error: `NIK ${cleanNik} sudah terdaftar atas nama "${check.pesertaName}". Setiap NIK hanya dapat didaftarkan satu kali.`
    };
  }

  const nextSeq = (fallbackPeserta as any[]).length + 1;
  const newIdTkk = generateIdTkk(nextSeq, 2026);
  const generatedId = `PST-2026-${String(nextSeq).padStart(4, "0")}`;

  const evalRes = evaluateSyaratKelengkapan({
    ktp_url: payload.ktp_url || "KTP_Mandiri.pdf",
    ijazah_url: payload.ijazah_url || "Ijazah_Mandiri.pdf",
    foto_url: payload.foto_url || "Foto_3x4_Mandiri.jpg"
  });

  const newItem: PesertaItem = {
    id: generatedId,
    id_tkk: newIdTkk,
    perencanaan_id: "PRC-PEL-2026-001",
    nik: cleanNik,
    nama_lengkap: payload.nama_lengkap,
    email: payload.email,
    telepon: payload.telepon,
    pendidikan_terakhir: payload.pendidikan_terakhir,
    riwayat_pekerjaan: payload.riwayat_pekerjaan,
    skema_pendaftaran: "Eksternal (Mandiri)",
    asal_instansi_bujk: "Pendaftaran Mandiri / Perorangan",
    ktp_url: payload.ktp_url || "KTP_Mandiri.pdf",
    ijazah_url: payload.ijazah_url || "Ijazah_Mandiri.pdf",
    foto_url: payload.foto_url || "Foto_3x4_Mandiri.jpg",
    status_kelengkapan: evalRes.status,
    kelengkapan_rincian: evalRes.status === "Lengkap" 
      ? "Pendaftaran mandiri eksternal terverifikasi lengkap."
      : `Persyaratan belum lengkap (${evalRes.missingItems.join(", ")} belum diunggah).`,
    link_form_token: `token-${newIdTkk.toLowerCase()}`,
    memiliki_sertifikat_lpjk: payload.memiliki_sertifikat_lpjk,
    nomor_registrasi_lpjk: payload.nomor_registrasi_lpjk || null,
    dokumen_scan_lpjk_url: payload.dokumen_scan_lpjk_url || null,
    is_first_login: false,
    status_verifikasi: "Terverifikasi",
    catatan_admin: `Pendaftaran mandiri via portal publik SIJAKON, diterbitkan ID TKK: ${newIdTkk}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    riwayat: []
  };

  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client.from("peserta_pelatihan") as any)
          .insert(newItem)
          .select()
          .single();

        if (!error && data) {
          return { success: true, data };
        }
      }
    } catch (err: any) {
      console.warn("Gagal simpan ke Supabase, fallback:", err);
    }
  }

  // Simpan secara in-memory fallback
  (fallbackPeserta as any[]).push(newItem);
  return { success: true, data: newItem };
}

/**
 * Menyelesaikan alur wajib ganti password peserta (First Login)
 */
export async function updatePasswordPeserta(
  pesertaId: string, 
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (newPassword.length < 8) {
    return { success: false, error: "Kata sandi baru minimal 8 karakter." };
  }

  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { error } = await (client.from("peserta_pelatihan") as any)
          .update({ is_first_login: false, updated_at: new Date().toISOString() })
          .eq("id", pesertaId);

        if (!error) return { success: true };
      }
    } catch (err: any) {
      console.warn("Gagal update password di Supabase:", err);
    }
  }

  // Fallback lokal
  const found = (fallbackPeserta as any[]).find((p) => p.id === pesertaId);
  if (found) {
    found.is_first_login = false;
  }
  return { success: true };
}

/**
 * Formula ID Peserta TKK Resmi: TKK-[TAHUN]-[NO_URUT]
 * Contoh: TKK-2026-0001
 */
export function generateIdTkk(seqNumber: number, year: number = 2026): string {
  const pad = String(seqNumber).padStart(4, "0");
  return `TKK-${year}-${pad}`;
}

/**
 * Evaluasi status kelengkapan dokumen persyaratan peserta (KTP, Ijazah/SK, Foto)
 */
export function evaluateSyaratKelengkapan(peserta: Partial<PesertaItem>): {
  status: "Lengkap" | "Belum Lengkap";
  missingCount: number;
  totalRequired: number;
  missingItems: string[];
} {
  const missingItems: string[] = [];
  if (!peserta.ktp_url) missingItems.push("KTP");
  if (!peserta.ijazah_url) missingItems.push("Ijazah / SK Kerja");
  if (!peserta.foto_url) missingItems.push("Pas Foto 3x4");

  const isLengkap = missingItems.length === 0;
  return {
    status: isLengkap ? "Lengkap" : "Belum Lengkap",
    missingCount: missingItems.length,
    totalRequired: 3,
    missingItems
  };
}

/**
 * Update Berkas Persyaratan Peserta TKK (Skema Internal & Eksternal)
 */
export async function updatePesertaDokumen(
  pesertaId: string,
  dokumen: {
    ktp_url?: string;
    ijazah_url?: string;
    foto_url?: string;
    surat_tugas_url?: string;
  }
): Promise<{ success: boolean; data?: PesertaItem; error?: string }> {
  // Hitung status kelengkapan baru
  const found = (fallbackPeserta as any[]).find((p) => p.id === pesertaId);
  const current = found || {};
  const merged = { ...current, ...dokumen };
  const evalResult = evaluateSyaratKelengkapan(merged);

  const payloadUpdates = {
    ...dokumen,
    status_kelengkapan: evalResult.status,
    kelengkapan_rincian: evalResult.status === "Lengkap" 
      ? "Seluruh berkas persyaratan wajib (KTP, Ijazah, Foto) telah lengkap."
      : `Persyaratan belum lengkap (${evalResult.missingItems.join(", ")} belum diunggah).`,
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client.from("peserta_pelatihan") as any)
          .update(payloadUpdates)
          .eq("id", pesertaId)
          .select()
          .single();

        if (!error && data) {
          return { success: true, data: data as PesertaItem };
        }
      }
    } catch (err: any) {
      console.warn("Gagal update dokumen di Supabase:", err);
    }
  }

  // Fallback lokal
  if (found) {
    Object.assign(found, payloadUpdates);
    return { success: true, data: found as PesertaItem };
  }

  return { success: false, error: "Peserta tidak ditemukan" };
}

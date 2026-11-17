import { createClient, isSupabaseConfigured } from "../supabase/client";
import type { Database } from "../supabase/types";
import rawTrainingData from "@/data/training.json";
import fallbackPelatihanData from "@/data/pelatihan_sipjaki.json";
import fallbackPerencanaanData from "@/data/perencanaan_pelatihan_sipjaki.json";
import fallbackLaporanData from "@/data/laporan_pelatihan_sipjaki.json";
import fallbackRekapitulasiData from "@/data/rekapitulasi_pelatihan_sipjaki.json";

export type PelatihanAgendaRow = Database["public"]["Tables"]["pelatihan_agenda"]["Row"];
export type PelatihanAgendaInsert = Database["public"]["Tables"]["pelatihan_agenda"]["Insert"];
export type PelatihanPesertaRow = Database["public"]["Tables"]["pelatihan_peserta"]["Row"];
export type PelatihanPesertaInsert = Database["public"]["Tables"]["pelatihan_peserta"]["Insert"];
export type PelatihanPerencanaanRow = Database["public"]["Tables"]["pelatihan_perencanaan"]["Row"];
export type PelatihanPerencanaanInsert = Database["public"]["Tables"]["pelatihan_perencanaan"]["Insert"];
export type PelatihanLaporanRow = Database["public"]["Tables"]["pelatihan_laporan"]["Row"];
export type PelatihanLaporanInsert = Database["public"]["Tables"]["pelatihan_laporan"]["Insert"];

export interface DataSourceStatus {
  source: "supabase" | "fallback";
  message: string;
}

export type JenjangPP14 = 
  | "Jenjang 1" 
  | "Jenjang 2" 
  | "Jenjang 3" 
  | "Jenjang 4" 
  | "Jenjang 5" 
  | "Jenjang 6";

export interface TrainingParticipant {
  id?: string;
  nik: string;
  name: string;
  bujk: string;
  skkLevel?: JenjangPP14 | string;
  score?: number;
  certNo?: string;        // Fallback backward-compatible
  certNoDpu?: string;     // Sertifikat Partisipasi DPU (Auto-Generated)
  certNoLpjk?: string;    // Sertifikat SKK LPJK (Manual Input)
  isValidated?: boolean;  // Status validasi internal DPU
  status?: string;
  updatedAt?: string;
}

export function generateDpuCertificateNumber(year: number | string, category: string, sequence: number): string {
  const cleanYear = String(year || new Date().getFullYear());
  let code = "DPU-TKK";
  const cat = (category || "").toUpperCase();
  if (cat.includes("K3") || cat.includes("SMKK")) code = "DPU-K3";
  else if (cat.includes("BIM") || cat.includes("DIGITAL")) code = "DPU-BIM";
  else if (cat.includes("JALAN") || cat.includes("JEMBATAN")) code = "DPU-JALAN";
  else if (cat.includes("GEDUNG") || cat.includes("BATA")) code = "DPU-GEDUNG";
  
  return `${cleanYear}/${code}/${String(sequence).padStart(4, "0")}`;
}

export interface TrainingItem {
  id: string;
  title: string;
  category: string;
  batch: string;
  startDate: string;
  endDate: string;
  location: string;
  quota: number;
  registered: number;
  passed: number;
  status: string;
  organizer: string;
  instructor: string;
  skkLevel: string;
  participants: TrainingParticipant[];
}

export interface PerencanaanItem {
  id: string;
  namaPaket: string;
  tahun: string;
  targetPeserta: number;
  anggaran: number;
  jadwal: string;
  dokumenKak: string;
  status: "Terverifikasi" | "Menunggu Verifikasi" | "Ditolak";
  _docStatus?: "complete" | "pending";
}

export interface LaporanItem {
  id: string;
  nomorLaporan: string;
  namaKegiatan: string;
  tanggalSelesai: string;
  jumlahLulusan: number;
  lembagaSertifikasi: string;
  dokumenBa: string;
  status: "Terverifikasi" | "Menunggu Verifikasi" | "Ditolak";
  _docStatus?: "complete" | "pending";
}

// Fallback in-memory cache
let fallbackTrainings: TrainingItem[] = JSON.parse(JSON.stringify(rawTrainingData));

// =============================================================================
// 1. AGENDA PELATIHAN & PESERTA
// =============================================================================

export async function fetchPelatihanList(): Promise<{ data: TrainingItem[]; status: DataSourceStatus }> {
  if (!isSupabaseConfigured()) {
    return {
      data: fallbackTrainings,
      status: { source: "fallback", message: "Basis data PostgreSQL belum terkonfigurasi. Menggunakan cache lokal." }
    };
  }

  try {
    const client = createClient();
    if (!client) {
      return {
        data: fallbackTrainings,
        status: { source: "fallback", message: "Klien basis data tidak tersedia." }
      };
    }

    const { data, error } = await client
      .from("pelatihan_agenda")
      .select(`
        *,
        pelatihan_peserta (
          id,
          nik,
          nama_peserta,
          nama_bujk,
          nilai_akhir,
          status_kelulusan,
          nomor_sertifikat
        )
      `)
      .order("tanggal_mulai", { ascending: false });

    if (error || !data || data.length === 0) {
      return {
        data: fallbackTrainings,
        status: { 
          source: "fallback", 
          message: error ? `Error database: ${error.message}` : "Tabel pelatihan_agenda kosong. Menggunakan seed lokal." 
        }
      };
    }

    const mapped: TrainingItem[] = data.map((row: any) => {
      const participantsList = Array.isArray(row.pelatihan_peserta) ? row.pelatihan_peserta : [];
      const passedCount = participantsList.filter((p: any) => p.status_kelulusan === "Lulus").length;

      return {
        id: row.id,
        title: row.judul_kegiatan,
        category: row.kategori,
        batch: row.angkatan,
        startDate: row.tanggal_mulai,
        endDate: row.tanggal_selesai,
        location: row.lokasi,
        quota: row.kuota,
        registered: Math.max(row.terdaftar || 0, participantsList.length),
        passed: Math.max(row.lulus || 0, passedCount),
        status: row.status,
        organizer: row.penyelenggara || "DPU Kab. Bogor",
        instructor: row.instruktur || "-",
        skkLevel: row.skk_jenjang || "Semua Jenjang",
        participants: participantsList.map((p: any) => ({
          id: p.id,
          nik: p.nik,
          name: p.nama_peserta,
          bujk: p.nama_bujk || "-",
          skkLevel: p.skk_jenjang_pp14 || row.skk_jenjang || "Jenjang 3",
          score: p.nilai_akhir ? Number(p.nilai_akhir) : undefined,
          certNo: p.nomor_sertifikat || p.nomor_skk_lpjk || undefined,
          certNoDpu: p.nomor_sertifikat_dpu || undefined,
          certNoLpjk: p.nomor_skk_lpjk || undefined,
          isValidated: p.is_validated !== undefined ? p.is_validated : !!p.nomor_sertifikat_dpu,
          status: p.status_kelulusan || "Terdaftar",
          updatedAt: p.updated_at || row.updated_at || new Date().toISOString()
        }))
      };
    });

    return {
      data: mapped,
      status: { source: "supabase", message: "Terhubung ke basis data PostgreSQL (Pilar 5: Pelatihan TKK)." }
    };
  } catch (err: any) {
    return {
      data: fallbackTrainings,
      status: { source: "fallback", message: `Koneksi gagal: ${err.message}. Menggunakan cache lokal.` }
    };
  }
}

export async function createPelatihanAgenda(agenda: {
  id?: string;
  title: string;
  category: string;
  batch: string;
  startDate: string;
  endDate: string;
  location: string;
  quota: number;
  skkLevel: string;
  organizer?: string;
  instructor?: string;
  status?: "Pendaftaran Dibuka" | "Sedang Berjalan" | "Selesai" | "Dibatalkan";
}): Promise<{ success: boolean; data?: TrainingItem; error?: string }> {
  const generatedId = agenda.id || `TR-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

  const newItem: TrainingItem = {
    id: generatedId,
    title: agenda.title,
    category: agenda.category,
    batch: agenda.batch,
    startDate: agenda.startDate,
    endDate: agenda.endDate,
    location: agenda.location,
    quota: agenda.quota,
    registered: 0,
    passed: 0,
    status: agenda.status || "Pendaftaran Dibuka",
    organizer: agenda.organizer || "Bidang Jasa Konstruksi DPU Kab. Bogor",
    instructor: agenda.instructor || "-",
    skkLevel: agenda.skkLevel,
    participants: []
  };

  if (!isSupabaseConfigured()) {
    fallbackTrainings.unshift(newItem);
    return { success: true, data: newItem };
  }

  try {
    const client = createClient();
    if (!client) {
      fallbackTrainings.unshift(newItem);
      return { success: true, data: newItem };
    }

    const payload: PelatihanAgendaInsert = {
      id: generatedId,
      judul_kegiatan: agenda.title,
      kategori: agenda.category,
      angkatan: agenda.batch,
      tanggal_mulai: agenda.startDate,
      tanggal_selesai: agenda.endDate,
      lokasi: agenda.location,
      kuota: agenda.quota,
      terdaftar: 0,
      lulus: 0,
      skk_jenjang: agenda.skkLevel,
      penyelenggara: agenda.organizer || "Bidang Jasa Konstruksi DPU Kab. Bogor",
      instruktur: agenda.instructor || "-",
      status: agenda.status || "Pendaftaran Dibuka"
    };

    const { error } = await (client.from("pelatihan_agenda") as any).insert(payload);
    if (error) throw error;

    fallbackTrainings.unshift(newItem);
    return { success: true, data: newItem };
  } catch (err: any) {
    fallbackTrainings.unshift(newItem);
    return { success: true, data: newItem, error: `Disimpan ke memori lokal: ${err.message}` };
  }
}

export async function registerPesertaPelatihan(agendaId: string, participant: {
  nik: string;
  name: string;
  bujk: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    const found = fallbackTrainings.find(t => t.id === agendaId);
    if (found) {
      found.participants.push({
        nik: participant.nik,
        name: participant.name,
        bujk: participant.bujk,
        status: "Terdaftar"
      });
      found.registered = found.participants.length;
    }
    return { success: true };
  }

  try {
    const client = createClient();
    if (!client) return { success: false, error: "Klien basis data tidak tersedia." };

    const payload: PelatihanPesertaInsert = {
      agenda_id: agendaId,
      nik: participant.nik,
      nama_peserta: participant.name,
      nama_bujk: participant.bujk,
      status_kelulusan: "Terdaftar"
    };

    const { error } = await (client.from("pelatihan_peserta") as any).insert(payload);
    if (error) throw error;

    // Increment terdaftar
    const { data: agendaData } = await client.from("pelatihan_agenda").select("terdaftar").eq("id", agendaId).single();
    if (agendaData) {
      const currentTerdaftar = (agendaData as any).terdaftar || 0;
      await (client.from("pelatihan_agenda") as any)
        .update({ terdaftar: currentTerdaftar + 1 })
        .eq("id", agendaId);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateParticipant(
  agendaId: string,
  participantNik: string,
  updatedData: Partial<TrainingParticipant>
): Promise<{ success: boolean; error?: string }> {
  // Update in-memory fallback
  for (const t of fallbackTrainings) {
    if (!agendaId || t.id === agendaId) {
      const pIdx = t.participants.findIndex(p => p.nik === participantNik || p.id === updatedData.id);
      if (pIdx !== -1) {
        t.participants[pIdx] = {
          ...t.participants[pIdx],
          ...updatedData,
          updatedAt: new Date().toISOString()
        };
        // Recalculate passed count
        t.passed = t.participants.filter(p => p.status === "Lulus").length;
        break;
      }
    }
  }

  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const client = createClient();
    if (!client) return { success: true };

    const payload: any = {
      updated_at: new Date().toISOString()
    };
    if (updatedData.name !== undefined) payload.nama_peserta = updatedData.name;
    if (updatedData.bujk !== undefined) payload.nama_bujk = updatedData.bujk;
    if (updatedData.score !== undefined) payload.nilai_akhir = updatedData.score;
    if (updatedData.status !== undefined) payload.status_kelulusan = updatedData.status;
    if (updatedData.certNoLpjk !== undefined) payload.nomor_skk_lpjk = updatedData.certNoLpjk;
    if (updatedData.certNoDpu !== undefined) payload.nomor_sertifikat_dpu = updatedData.certNoDpu;
    if (updatedData.skkLevel !== undefined) payload.skk_jenjang_pp14 = updatedData.skkLevel;
    if (updatedData.isValidated !== undefined) {
      payload.is_validated = updatedData.isValidated;
      if (updatedData.isValidated) payload.validated_at = new Date().toISOString();
    }

    await (client.from("pelatihan_peserta") as any)
      .update(payload)
      .eq("nik", participantNik);

    return { success: true };
  } catch (err: any) {
    console.error("Gagal update peserta di Supabase:", err);
    return { success: true };
  }
}

export async function deleteParticipant(
  agendaId: string,
  participantNik: string
): Promise<{ success: boolean; error?: string }> {
  // Update in-memory fallback
  for (const t of fallbackTrainings) {
    if (!agendaId || t.id === agendaId) {
      const initialLen = t.participants.length;
      t.participants = t.participants.filter(p => p.nik !== participantNik);
      if (t.participants.length < initialLen) {
        t.registered = t.participants.length;
        t.passed = t.participants.filter(p => p.status === "Lulus").length;
      }
    }
  }

  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const client = createClient();
    if (!client) return { success: true };

    await (client.from("pelatihan_peserta") as any)
      .delete()
      .eq("nik", participantNik);

    return { success: true };
  } catch (err: any) {
    console.error("Gagal hapus peserta di Supabase:", err);
    return { success: true };
  }
}

export async function validateParticipantDpu(
  agendaId: string,
  participantNik: string
): Promise<{ success: boolean; certNoDpu?: string; error?: string }> {
  const targetTraining = fallbackTrainings.find(t => t.id === agendaId) || fallbackTrainings[0];
  const year = new Date().getFullYear();
  const category = targetTraining?.category || "TKK";
  const seq = Math.floor(1000 + Math.random() * 9000);
  const certNo = generateDpuCertificateNumber(year, category, seq);

  const res = await updateParticipant(agendaId, participantNik, {
    isValidated: true,
    certNoDpu: certNo,
    status: "Lulus"
  });

  return { success: res.success, certNoDpu: certNo, error: res.error };
}

export async function deletePelatihanAgenda(agendaId: string): Promise<{ success: boolean; error?: string }> {
  fallbackTrainings = fallbackTrainings.filter(t => t.id !== agendaId);

  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const client = createClient();
    if (!client) return { success: true };

    await (client.from("pelatihan_agenda") as any).delete().eq("id", agendaId);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function batchImportPelatihan(rawRows: Record<string, any>[]): Promise<{
  success: boolean;
  insertedCount: number;
  error?: string;
}> {
  if (!rawRows || rawRows.length === 0) {
    return { success: false, insertedCount: 0, error: "Tidak ada data untuk diimpor." };
  }

  const newAgendas: PelatihanAgendaInsert[] = rawRows.map((r, i) => ({
    id: r.id || `TR-${new Date().getFullYear()}-${String(fallbackTrainings.length + i + 1).padStart(3, "0")}`,
    judul_kegiatan: r.title || r.judul_kegiatan || "Pelatihan Jasa Konstruksi",
    kategori: r.kategori || r.category || "Tata Kelola & Regulasi",
    angkatan: r.angkatan || r.batch || `Angkatan ${fallbackTrainings.length + i + 1} / 2026`,
    tanggal_mulai: r.tanggal_mulai || r.startDate || new Date().toISOString().split("T")[0],
    tanggal_selesai: r.tanggal_selesai || r.endDate || new Date().toISOString().split("T")[0],
    lokasi: r.lokasi || r.location || "Auditorium DPU Kab. Bogor",
    kuota: Number(r.kuota || r.quota) || 40,
    terdaftar: Number(r.terdaftar || r.registered) || 0,
    lulus: Number(r.lulus || r.passed) || 0,
    skk_jenjang: r.skk_jenjang || r.skkLevel || "Jenjang 5 (Teknisi/Analis)",
    penyelenggara: r.penyelenggara || r.organizer || "DPU Kab. Bogor",
    instruktur: r.instruktur || r.instructor || "-",
    status: (r.status as any) || "Pendaftaran Dibuka"
  }));

  if (!isSupabaseConfigured()) {
    newAgendas.forEach(a => {
      fallbackTrainings.unshift({
        id: a.id,
        title: a.judul_kegiatan,
        category: a.kategori,
        batch: a.angkatan,
        startDate: a.tanggal_mulai,
        endDate: a.tanggal_selesai,
        location: a.lokasi,
        quota: a.kuota || 40,
        registered: a.terdaftar || 0,
        passed: a.lulus || 0,
        status: a.status || "Pendaftaran Dibuka",
        organizer: a.penyelenggara || "DPU Kab. Bogor",
        instructor: a.instruktur || "-",
        skkLevel: a.skk_jenjang || "Semua Jenjang",
        participants: []
      });
    });
    return { success: true, insertedCount: newAgendas.length };
  }

  try {
    const client = createClient();
    if (!client) {
      return { success: false, insertedCount: 0, error: "Klien basis data tidak tersedia." };
    }

    const { error } = await (client.from("pelatihan_agenda") as any).upsert(newAgendas, { onConflict: "id" });
    if (error) throw error;

    return { success: true, insertedCount: newAgendas.length };
  } catch (err: any) {
    return { success: false, insertedCount: 0, error: err.message };
  }
}

// =============================================================================
// 2. PERENCANAAN PELATIHAN
// =============================================================================

const defaultPerencanaan: PerencanaanItem[] = [
  {
    id: "PP-2026-01",
    namaPaket: "Pelatihan & Fasilitasi Uji Sertifikasi SKK Tenaga Kerja Konstruksi Terampil",
    tahun: "2026",
    targetPeserta: 250,
    anggaran: 380000000,
    jadwal: "Maret - Juli 2026",
    dokumenKak: "KAK_Fasilitasi_Sertifikasi_TKK_2026.pdf",
    status: "Terverifikasi"
  },
  {
    id: "PP-2026-02",
    namaPaket: "Bimbingan Teknis Standar Keamanan, Keselamatan, Kesehatan dan Keberlanjutan (K4 SMKK)",
    tahun: "2026",
    targetPeserta: 120,
    anggaran: 175000000,
    jadwal: "April - Agustus 2026",
    dokumenKak: "KAK_Bimtek_SMKK_2026.pdf",
    status: "Terverifikasi"
  },
  {
    id: "PP-2026-03",
    namaPaket: "Mobile Training Unit (MTU) Pelatihan Vokasi Pekerja Lapangan Wilayah Bogor Barat",
    tahun: "2026",
    targetPeserta: 100,
    anggaran: 150000000,
    jadwal: "Juni - September 2026",
    dokumenKak: "KAK_MTU_Bogor_Barat.pdf",
    status: "Terverifikasi"
  }
];

export async function fetchPerencanaanList(): Promise<{ data: PerencanaanItem[]; status: DataSourceStatus }> {
  if (!isSupabaseConfigured()) {
    return { data: defaultPerencanaan, status: { source: "fallback", message: "Menggunakan cache lokal perencanaan." } };
  }

  try {
    const client = createClient();
    if (!client) {
      return { data: defaultPerencanaan, status: { source: "fallback", message: "Klien basis data tidak tersedia." } };
    }

    const { data, error } = await client
      .from("pelatihan_perencanaan")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return { data: defaultPerencanaan, status: { source: "fallback", message: error ? error.message : "Data kosong, fallback." } };
    }

    const mapped: PerencanaanItem[] = data.map((r: any) => ({
      id: r.id,
      namaPaket: r.nama_paket,
      tahun: r.tahun,
      targetPeserta: r.target_peserta,
      anggaran: Number(r.anggaran),
      jadwal: r.jadwal,
      dokumenKak: r.dokumen_kak || "-",
      status: r.status
    }));

    return { data: mapped, status: { source: "supabase", message: "Terhubung ke basis data PostgreSQL." } };
  } catch (err: any) {
    return { data: defaultPerencanaan, status: { source: "fallback", message: err.message } };
  }
}

export async function createPerencanaanItem(item: {
  namaPaket: string;
  tahun: string;
  targetPeserta: number;
  anggaran: number;
  jadwal: string;
  dokumenKak?: string;
}): Promise<{ success: boolean; error?: string }> {
  const generatedId = `PP-${item.tahun}-${String(Date.now()).slice(-3)}`;
  if (!isSupabaseConfigured()) {
    defaultPerencanaan.unshift({
      id: generatedId,
      namaPaket: item.namaPaket,
      tahun: item.tahun,
      targetPeserta: item.targetPeserta,
      anggaran: item.anggaran,
      jadwal: item.jadwal,
      dokumenKak: item.dokumenKak || "-",
      status: "Menunggu Verifikasi"
    });
    return { success: true };
  }

  try {
    const client = createClient();
    if (!client) return { success: false, error: "Klien basis data tidak tersedia." };

    const payload: PelatihanPerencanaanInsert = {
      id: generatedId,
      nama_paket: item.namaPaket,
      tahun: item.tahun,
      target_peserta: item.targetPeserta,
      anggaran: item.anggaran,
      jadwal: item.jadwal,
      dokumen_kak: item.dokumenKak || null,
      status: "Menunggu Verifikasi"
    };

    const { error } = await (client.from("pelatihan_perencanaan") as any).insert(payload);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// =============================================================================
// 3. LAPORAN PELATIHAN & BAP
// =============================================================================

const defaultLaporan: LaporanItem[] = [
  {
    id: "LAP-PEL-01",
    nomorLaporan: "005/BA-LSP-GATAKI/VI/2026",
    namaKegiatan: "Sertifikasi Uji Kompetensi Mandor Tukang Pasang Bata & Plesteran",
    tanggalSelesai: "2026-03-28",
    jumlahLulusan: 48,
    lembagaSertifikasi: "LSP Gataki Karya Konstruksi",
    dokumenBa: "BA_Kelulusan_Mandor_2026.pdf",
    status: "Terverifikasi",
    _docStatus: "complete"
  },
  {
    id: "LAP-PEL-02",
    nomorLaporan: "012/BA-LPK-BOGOR/V/2026",
    namaKegiatan: "Bimtek & Uji Sertifikasi Petugas K3 Konstruksi Tingkat Muda",
    tanggalSelesai: "2026-04-02",
    jumlahLulusan: 62,
    lembagaSertifikasi: "LSP Keselamatan Konstruksi Indonesia",
    dokumenBa: "BA_Sertifikasi_K3_2026.pdf",
    status: "Terverifikasi",
    _docStatus: "complete"
  },
  {
    id: "LAP-PEL-03",
    nomorLaporan: "018/BA-LSP-ASTEKINDO/VII/2026",
    namaKegiatan: "Fasilitasi Sertifikasi Juru Ukur (Surveyor) Berbasis SKK",
    tanggalSelesai: "2026-04-10",
    jumlahLulusan: 32,
    lembagaSertifikasi: "LSP Astekindo Konstruksi Mandiri",
    dokumenBa: "BA_Surveyor_2026.pdf",
    status: "Terverifikasi",
    _docStatus: "complete"
  }
];

export async function fetchLaporanList(): Promise<{ data: LaporanItem[]; status: DataSourceStatus }> {
  if (!isSupabaseConfigured()) {
    return { data: defaultLaporan, status: { source: "fallback", message: "Menggunakan cache lokal laporan." } };
  }

  try {
    const client = createClient();
    if (!client) {
      return { data: defaultLaporan, status: { source: "fallback", message: "Klien basis data tidak tersedia." } };
    }

    const { data, error } = await client
      .from("pelatihan_laporan")
      .select("*")
      .order("tanggal_selesai", { ascending: false });

    if (error || !data || data.length === 0) {
      return { data: defaultLaporan, status: { source: "fallback", message: error ? error.message : "Data kosong, fallback." } };
    }

    const mapped: LaporanItem[] = data.map((r: any) => ({
      id: r.id,
      nomorLaporan: r.nomor_laporan,
      namaKegiatan: r.nama_kegiatan,
      tanggalSelesai: r.tanggal_selesai,
      jumlahLulusan: r.jumlah_lulusan,
      lembagaSertifikasi: r.lembaga_sertifikasi,
      dokumenBa: r.dokumen_ba || "-",
      status: r.status,
      _docStatus: "complete"
    }));

    return { data: mapped, status: { source: "supabase", message: "Terhubung ke basis data PostgreSQL." } };
  } catch (err: any) {
    return { data: defaultLaporan, status: { source: "fallback", message: err.message } };
  }
}

export async function createLaporanItem(item: {
  nomorLaporan: string;
  namaKegiatan: string;
  tanggalSelesai: string;
  jumlahLulusan: number;
  lembagaSertifikasi: string;
  dokumenBa?: string;
}): Promise<{ success: boolean; error?: string }> {
  const generatedId = `LAP-PEL-${String(Date.now()).slice(-4)}`;
  if (!isSupabaseConfigured()) {
    defaultLaporan.unshift({
      id: generatedId,
      nomorLaporan: item.nomorLaporan,
      namaKegiatan: item.namaKegiatan,
      tanggalSelesai: item.tanggalSelesai,
      jumlahLulusan: item.jumlahLulusan,
      lembagaSertifikasi: item.lembagaSertifikasi,
      dokumenBa: item.dokumenBa || "-",
      status: "Menunggu Verifikasi",
      _docStatus: "complete"
    });
    return { success: true };
  }

  try {
    const client = createClient();
    if (!client) return { success: false, error: "Klien basis data tidak tersedia." };

    const payload: PelatihanLaporanInsert = {
      id: generatedId,
      nomor_laporan: item.nomorLaporan,
      nama_kegiatan: item.namaKegiatan,
      tanggal_selesai: item.tanggalSelesai,
      jumlah_lulusan: item.jumlahLulusan,
      lembaga_sertifikasi: item.lembagaSertifikasi,
      dokumen_ba: item.dokumenBa || null,
      status: "Menunggu Verifikasi"
    };

    const { error } = await (client.from("pelatihan_laporan") as any).insert(payload);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// =============================================================================
// 2. STANDARISASI MODUL DASHBOARD PELATIHAN (SIPJAKI PUSAT)
// =============================================================================

export interface PelatihanSipjakiItem {
  id: string;
  tahun: string;
  nama_kegiatan: string;
  metode: string;
  lokasi: string;
  peserta_l?: number;
  peserta_p?: number;
  jumlah_l: number;
  jumlah_p: number;
  total_peserta?: number;
  kab_kota: string;
  propinsi: string;
  anggaran?: number;
  sumber_dana?: string;
  penyelenggara?: string;
  skk_jenjang: string;
  skk_level?: string;
  status: string;
  keterangan?: string;
  created_at?: string;
  updated_at?: string;
}

export type PelatihanSipjakiInsert = Omit<PelatihanSipjakiItem, "created_at" | "updated_at">;

export async function fetchPelatihanSipjakiList(): Promise<{
  data: PelatihanSipjakiItem[];
  status: DataSourceStatus;
}> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client as any)
          .from("pelatihan_sipjaki")
          .select("*")
          .order("updated_at", { ascending: false });

        if (!error && data && data.length > 0) {
          return {
            data: data as PelatihanSipjakiItem[],
            status: {
              source: "supabase",
              message: "Data pelatihan berhasil disinkronisasi dari Supabase Cloud.",
            },
          };
        }
      }
    } catch (err: any) {
      console.warn("Exception saat fetchPelatihanSipjakiList:", err.message);
    }
  }

  const sortedFallback = [...((fallbackPelatihanData as unknown) as PelatihanSipjakiItem[])].sort((a, b) => {
    const timeA = new Date(a.updated_at || a.created_at || "1970-01-01").getTime();
    const timeB = new Date(b.updated_at || b.created_at || "1970-01-01").getTime();
    if (timeA !== timeB) return timeB - timeA;
    return Number(b.tahun || 0) - Number(a.tahun || 0);
  });

  return {
    data: sortedFallback,
    status: {
      source: "fallback",
      message: "Menggunakan data baku lokal SIPJAKI Kabupaten Bogor (offline mode).",
    },
  };
}

export async function createPelatihanSipjaki(
  payload: PelatihanSipjakiInsert
): Promise<{ success: boolean; data?: PelatihanSipjakiItem; error?: string }> {
  const l = payload.jumlah_l ?? payload.peserta_l ?? 0;
  const p = payload.jumlah_p ?? payload.peserta_p ?? 0;
  const total_peserta = l + p;
  const newItem: PelatihanSipjakiItem = {
    ...payload,
    jumlah_l: l,
    jumlah_p: p,
    peserta_l: l,
    peserta_p: p,
    total_peserta,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client as any)
          .from("pelatihan_sipjaki")
          .insert([newItem])
          .select()
          .single();

        if (error) {
          console.warn("Gagal insert pelatihan_sipjaki ke Supabase:", error.message);
        } else if (data) {
          return { success: true, data: data as PelatihanSipjakiItem };
        }
      }
    } catch (err: any) {
      console.warn("Exception saat createPelatihanSipjaki:", err.message);
    }
  }

  return { success: true, data: newItem };
}

export async function updatePelatihanSipjaki(
  id: string,
  updates: Partial<PelatihanSipjakiItem>
): Promise<{ success: boolean; data?: PelatihanSipjakiItem; error?: string }> {
  const l = updates.jumlah_l ?? updates.peserta_l;
  const p = updates.jumlah_p ?? updates.peserta_p;
  const updatedPayload: any = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (l !== undefined) {
    updatedPayload.jumlah_l = l;
    updatedPayload.peserta_l = l;
  }
  if (p !== undefined) {
    updatedPayload.jumlah_p = p;
    updatedPayload.peserta_p = p;
  }
  if (l !== undefined || p !== undefined) {
    updatedPayload.total_peserta = (l ?? 0) + (p ?? 0);
  }

  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client as any)
          .from("pelatihan_sipjaki")
          .update(updatedPayload)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.warn("Gagal update pelatihan_sipjaki di Supabase:", error.message);
        } else if (data) {
          return { success: true, data: data as PelatihanSipjakiItem };
        }
      }
    } catch (err: any) {
      console.warn("Exception saat updatePelatihanSipjaki:", err.message);
    }
  }

  return { success: true };
}

export async function deletePelatihanSipjaki(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { error } = await (client as any)
          .from("pelatihan_sipjaki")
          .delete()
          .eq("id", id);

        if (error) {
          console.warn("Gagal hapus pelatihan_sipjaki di Supabase:", error.message);
        }
      }
    } catch (err: any) {
      console.warn("Exception saat deletePelatihanSipjaki:", err.message);
    }
  }

  return { success: true };
}

export async function bulkDeletePelatihanSipjaki(
  ids: string[]
): Promise<{ success: boolean; count: number; error?: string }> {
  if (ids.length === 0) return { success: true, count: 0 };

  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { error } = await (client as any)
          .from("pelatihan_sipjaki")
          .delete()
          .in("id", ids);

        if (error) {
          console.warn("Gagal bulk delete pelatihan_sipjaki di Supabase:", error.message);
        }
      }
    } catch (err: any) {
      console.warn("Exception saat bulkDeletePelatihanSipjaki:", err.message);
    }
  }

  return { success: true, count: ids.length };
}

export async function batchInsertPelatihanSipjaki(
  items: PelatihanSipjakiInsert[]
): Promise<{ success: boolean; count: number; error?: string }> {
  if (items.length === 0) return { success: true, count: 0 };

  const formattedItems: PelatihanSipjakiItem[] = items.map((item) => ({
    ...item,
    total_peserta: (item.peserta_l || 0) + (item.peserta_p || 0),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { error } = await (client as any)
          .from("pelatihan_sipjaki")
          .insert(formattedItems);

        if (error) {
          console.warn("Gagal batch insert pelatihan_sipjaki ke Supabase:", error.message);
        } else {
          return { success: true, count: formattedItems.length };
        }
      }
    } catch (err: any) {
      console.warn("Exception saat batchInsertPelatihanSipjaki:", err.message);
    }
  }

  return { success: true, count: formattedItems.length };
}

// =============================================================================
// 3. STANDARISASI MODUL PERENCANAAN PELATIHAN (SIPJAKI PUSAT)
// =============================================================================

export interface PerencanaanPelatihanSipjakiItem {
  id: string;
  tahun: string;
  wilayah: string;
  kab_kota: string;
  propinsi: string;
  target_pelaksanaan: number;
  satuan_target: string;
  dokumen_url?: string;
  dokumen_kak_url?: string;
  status?: "Menunggu Verifikasi" | "Terverifikasi" | "Ditolak";
  catatan_verifikasi?: string;
  anggaran_estimasi?: number;
  uraian_rencana?: string;
  created_at?: string;
  updated_at?: string;
}

export type PerencanaanPelatihanSipjakiInsert = Omit<PerencanaanPelatihanSipjakiItem, "created_at" | "updated_at">;

export async function fetchPerencanaanPelatihanSipjakiList(): Promise<{
  data: PerencanaanPelatihanSipjakiItem[];
  status: DataSourceStatus;
}> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client as any)
          .from("pelatihan_perencanaan_sipjaki")
          .select("*")
          .order("tahun", { ascending: false });

        if (!error && data && data.length > 0) {
          return {
            data: data as PerencanaanPelatihanSipjakiItem[],
            status: {
              source: "supabase",
              message: "Data perencanaan pelatihan berhasil disinkronisasi dari Supabase Cloud.",
            },
          };
        }
      }
    } catch (err: any) {
      console.warn("Exception saat fetchPerencanaanPelatihanSipjakiList:", err.message);
    }
  }

  return {
    data: (fallbackPerencanaanData as unknown) as PerencanaanPelatihanSipjakiItem[],
    status: {
      source: "fallback",
      message: "Menggunakan data baku lokal SIPJAKI Kabupaten Bogor (offline mode).",
    },
  };
}

export async function createPerencanaanPelatihanSipjaki(
  payload: PerencanaanPelatihanSipjakiInsert
): Promise<{ success: boolean; data?: PerencanaanPelatihanSipjakiItem; error?: string }> {
  const newItem: PerencanaanPelatihanSipjakiItem = {
    ...payload,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client as any)
          .from("pelatihan_perencanaan_sipjaki")
          .insert([newItem])
          .select()
          .single();

        if (error) {
          console.warn("Gagal insert pelatihan_perencanaan_sipjaki ke Supabase:", error.message);
        } else if (data) {
          return { success: true, data: data as PerencanaanPelatihanSipjakiItem };
        }
      }
    } catch (err: any) {
      console.warn("Exception saat createPerencanaanPelatihanSipjaki:", err.message);
    }
  }

  return { success: true, data: newItem };
}

export async function updatePerencanaanPelatihanSipjaki(
  id: string,
  updates: Partial<PerencanaanPelatihanSipjakiItem>
): Promise<{ success: boolean; data?: PerencanaanPelatihanSipjakiItem; error?: string }> {
  const updatedPayload = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client as any)
          .from("pelatihan_perencanaan_sipjaki")
          .update(updatedPayload)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.warn("Gagal update pelatihan_perencanaan_sipjaki di Supabase:", error.message);
        } else if (data) {
          return { success: true, data: data as PerencanaanPelatihanSipjakiItem };
        }
      }
    } catch (err: any) {
      console.warn("Exception saat updatePerencanaanPelatihanSipjaki:", err.message);
    }
  }

  return { success: true };
}

export async function deletePerencanaanPelatihanSipjaki(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { error } = await (client as any)
          .from("pelatihan_perencanaan_sipjaki")
          .delete()
          .eq("id", id);

        if (error) {
          console.warn("Gagal hapus pelatihan_perencanaan_sipjaki di Supabase:", error.message);
        }
      }
    } catch (err: any) {
      console.warn("Exception saat deletePerencanaanPelatihanSipjaki:", err.message);
    }
  }

  return { success: true };
}

// =============================================================================
// 4. STANDARISASI MODUL LAPORAN PELATIHAN & SERTIFIKASI TKK (SIPJAKI PUSAT)
// =============================================================================

export interface LaporanPelatihanSipjakiItem {
  id: string;
  tahun: string;
  wilayah: string;
  kab_kota: string;
  propinsi: string;
  nama_kegiatan: string;
  tanggal: string;
  jumlah_tkk: number;
  satuan_tkk: string;
  nomor_ba?: string;
  lembaga_sertifikasi?: string;
  dokumen_kak_url?: string;
  dokumen_ba_url?: string;
  status?: "Menunggu Verifikasi" | "Terverifikasi" | "Ditolak";
  catatan_verifikasi?: string;
  created_at?: string;
  updated_at?: string;
}

export type LaporanPelatihanSipjakiInsert = Omit<LaporanPelatihanSipjakiItem, "created_at" | "updated_at">;

export async function fetchLaporanPelatihanSipjakiList(): Promise<{
  data: LaporanPelatihanSipjakiItem[];
  status: DataSourceStatus;
}> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client as any)
          .from("pelatihan_laporan_sipjaki")
          .select("*")
          .order("tanggal", { ascending: false });

        if (!error && data && data.length > 0) {
          return {
            data: data as LaporanPelatihanSipjakiItem[],
            status: {
              source: "supabase",
              message: "Data laporan pelatihan berhasil disinkronisasi dari Supabase Cloud.",
            },
          };
        }
      }
    } catch (err: any) {
      console.warn("Exception saat fetchLaporanPelatihanSipjakiList:", err.message);
    }
  }

  return {
    data: (fallbackLaporanData as unknown) as LaporanPelatihanSipjakiItem[],
    status: {
      source: "fallback",
      message: "Menggunakan data baku lokal SIPJAKI Kabupaten Bogor (offline mode).",
    },
  };
}

export async function createLaporanPelatihanSipjaki(
  payload: LaporanPelatihanSipjakiInsert
): Promise<{ success: boolean; data?: LaporanPelatihanSipjakiItem; error?: string }> {
  const newItem: LaporanPelatihanSipjakiItem = {
    ...payload,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client as any)
          .from("pelatihan_laporan_sipjaki")
          .insert([newItem])
          .select()
          .single();

        if (error) {
          console.warn("Gagal insert pelatihan_laporan_sipjaki ke Supabase:", error.message);
        } else if (data) {
          return { success: true, data: data as LaporanPelatihanSipjakiItem };
        }
      }
    } catch (err: any) {
      console.warn("Exception saat createLaporanPelatihanSipjaki:", err.message);
    }
  }

  return { success: true, data: newItem };
}

export async function updateLaporanPelatihanSipjaki(
  id: string,
  updates: Partial<LaporanPelatihanSipjakiItem>
): Promise<{ success: boolean; data?: LaporanPelatihanSipjakiItem; error?: string }> {
  const updatedPayload = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client as any)
          .from("pelatihan_laporan_sipjaki")
          .update(updatedPayload)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.warn("Gagal update pelatihan_laporan_sipjaki di Supabase:", error.message);
        } else if (data) {
          return { success: true, data: data as LaporanPelatihanSipjakiItem };
        }
      }
    } catch (err: any) {
      console.warn("Exception saat updateLaporanPelatihanSipjaki:", err.message);
    }
  }

  return { success: true };
}

export async function deleteLaporanPelatihanSipjaki(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { error } = await (client as any)
          .from("pelatihan_laporan_sipjaki")
          .delete()
          .eq("id", id);

        if (error) {
          console.warn("Gagal hapus pelatihan_laporan_sipjaki di Supabase:", error.message);
        }
      }
    } catch (err: any) {
      console.warn("Exception saat deleteLaporanPelatihanSipjaki:", err.message);
    }
  }

  return { success: true };
}

// =============================================================================
// 5. STANDARISASI MODUL REKAPITULASI PELATIHAN & SERTIFIKASI TKK (SIPJAKI PUSAT)
// =============================================================================

export interface RekapitulasiRincianItem {
  nomor_ba: string;
  nama_kegiatan: string;
  tanggal: string;
  jumlah_tkk: number;
  satuan: string;
  lsp: string;
  status: string;
}

export interface RekapitulasiPelatihanSipjakiItem {
  id: string;
  tahun: string;
  wilayah: string;
  kab_kota: string;
  propinsi: string;
  target: number;
  terpenuhi: number;
  total_tkk: number;
  satuan_target?: string;
  satuan_tkk?: string;
  capaian_pct: number;
  dokumen_rekap_url?: string;
  status?: string;
  catatan_verifikasi?: string;
  rincian_kegiatan?: RekapitulasiRincianItem[];
  created_at?: string;
  updated_at?: string;
}

let localRekapitulasiList: RekapitulasiPelatihanSipjakiItem[] = [
  ...((fallbackRekapitulasiData as unknown) as RekapitulasiPelatihanSipjakiItem[])
];

export async function fetchRekapitulasiPelatihanSipjakiList(): Promise<{
  data: RekapitulasiPelatihanSipjakiItem[];
  status: DataSourceStatus;
}> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client as any)
          .from("pelatihan_rekapitulasi_sipjaki")
          .select("*")
          .order("updated_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const mappedData = data.map((item: RekapitulasiPelatihanSipjakiItem) => {
            const fallbackMatch = localRekapitulasiList.find(
              (f) => f.id === item.id || f.tahun === item.tahun
            );
            return {
              ...item,
              rincian_kegiatan: fallbackMatch?.rincian_kegiatan || [],
            };
          });

          return {
            data: mappedData,
            status: {
              source: "supabase",
              message: "Data rekapitulasi pelatihan berhasil disinkronisasi dari Supabase Cloud.",
            },
          };
        }
      }
    } catch (err: any) {
      console.warn("Exception saat fetchRekapitulasiPelatihanSipjakiList:", err.message);
    }
  }

  // Sort local data by updated_at / tahun descending (default: riwayat terkini)
  const sortedLocal = [...localRekapitulasiList].sort((a, b) => {
    const timeA = new Date(a.updated_at || a.created_at || "1970-01-01").getTime();
    const timeB = new Date(b.updated_at || b.created_at || "1970-01-01").getTime();
    if (timeA !== timeB) return timeB - timeA;
    return Number(b.tahun || 0) - Number(a.tahun || 0);
  });

  return {
    data: sortedLocal,
    status: {
      source: "fallback",
      message: "Menggunakan data baku lokal SIPJAKI Kabupaten Bogor (offline mode).",
    },
  };
}

export async function createRekapitulasiPelatihanSipjaki(
  item: Partial<RekapitulasiPelatihanSipjakiItem> & {
    tahun: string;
    target: number;
    terpenuhi: number;
    total_tkk: number;
  }
): Promise<{ success: boolean; data?: RekapitulasiPelatihanSipjakiItem; error?: string }> {
  try {
    const nowIso = new Date().toISOString();
    const id = `rekap-${Date.now()}`;
    const target = Number(item.target) || 0;
    const terpenuhi = Number(item.terpenuhi) || 0;
    const computedCapaian = target > 0 ? Math.round((terpenuhi / target) * 10000) / 100 : 0;

    const newItem: RekapitulasiPelatihanSipjakiItem = {
      wilayah: item.wilayah || "JAWA BARAT, KABUPATEN BOGOR",
      kab_kota: item.kab_kota || "KABUPATEN BOGOR",
      propinsi: item.propinsi || "JAWA BARAT",
      dokumen_rekap_url: item.dokumen_rekap_url || "",
      catatan_verifikasi: item.catatan_verifikasi || "",
      ...item,
      id,
      tahun: item.tahun,
      target,
      terpenuhi,
      total_tkk: Number(item.total_tkk) || 0,
      capaian_pct: computedCapaian,
      created_at: nowIso,
      updated_at: nowIso,
      rincian_kegiatan: item.rincian_kegiatan || [],
    };

    localRekapitulasiList = [newItem, ...localRekapitulasiList];

    if (isSupabaseConfigured()) {
      const client = createClient();
      if (client) {
        const { data, error } = await (client as any)
          .from("pelatihan_rekapitulasi_sipjaki")
          .insert({
            tahun: newItem.tahun,
            wilayah: newItem.wilayah,
            kab_kota: newItem.kab_kota,
            propinsi: newItem.propinsi,
            target: newItem.target,
            terpenuhi: newItem.terpenuhi,
            total_tkk: newItem.total_tkk,
            capaian_pct: newItem.capaian_pct,
            dokumen_rekap_url: newItem.dokumen_rekap_url,
            catatan_verifikasi: newItem.catatan_verifikasi,
          })
          .select()
          .single();

        if (error) {
          console.warn("Gagal insert pelatihan_rekapitulasi_sipjaki ke Supabase:", error.message);
        } else if (data) {
          return { success: true, data: data as RekapitulasiPelatihanSipjakiItem };
        }
      }
    }

    return { success: true, data: newItem };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal membuat data rekapitulasi." };
  }
}

export async function updateRekapitulasiPelatihanSipjaki(
  id: string,
  updates: Partial<RekapitulasiPelatihanSipjakiItem>
): Promise<{ success: boolean; data?: RekapitulasiPelatihanSipjakiItem; error?: string }> {
  try {
    const nowIso = new Date().toISOString();
    const target = updates.target !== undefined ? Number(updates.target) : undefined;
    const terpenuhi = updates.terpenuhi !== undefined ? Number(updates.terpenuhi) : undefined;
    const total_tkk = updates.total_tkk !== undefined ? Number(updates.total_tkk) : undefined;

    let computedCapaian = updates.capaian_pct;
    if (target !== undefined && terpenuhi !== undefined) {
      computedCapaian = target > 0 ? Math.round((terpenuhi / target) * 10000) / 100 : 0;
    }

    const payload: Partial<RekapitulasiPelatihanSipjakiItem> = {
      ...updates,
      ...(target !== undefined ? { target } : {}),
      ...(terpenuhi !== undefined ? { terpenuhi } : {}),
      ...(total_tkk !== undefined ? { total_tkk } : {}),
      ...(computedCapaian !== undefined ? { capaian_pct: computedCapaian } : {}),
      updated_at: nowIso,
    };

    // Update in-memory fallback
    const idx = localRekapitulasiList.findIndex(r => r.id === id);
    if (idx !== -1) {
      localRekapitulasiList[idx] = {
        ...localRekapitulasiList[idx],
        ...payload,
      };
    }

    if (isSupabaseConfigured()) {
      const client = createClient();
      if (client) {
        const { data, error } = await (client as any)
          .from("pelatihan_rekapitulasi_sipjaki")
          .update(payload)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.warn("Gagal update pelatihan_rekapitulasi_sipjaki di Supabase:", error.message);
        } else if (data) {
          return { success: true, data: data as RekapitulasiPelatihanSipjakiItem };
        }
      }
    }

    return { 
      success: true, 
      data: idx !== -1 ? localRekapitulasiList[idx] : undefined 
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memperbarui data rekapitulasi." };
  }
}

export async function deleteRekapitulasiPelatihanSipjaki(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete from in-memory fallback
    localRekapitulasiList = localRekapitulasiList.filter(r => r.id !== id);

    if (isSupabaseConfigured()) {
      const client = createClient();
      if (client) {
        const { error } = await (client as any)
          .from("pelatihan_rekapitulasi_sipjaki")
          .delete()
          .eq("id", id);

        if (error) {
          console.warn("Gagal hapus pelatihan_rekapitulasi_sipjaki di Supabase:", error.message);
        }
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghapus data rekapitulasi." };
  }
}

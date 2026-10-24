import { createClient, isSupabaseConfigured } from "../supabase/client";
import type { Database } from "../supabase/types";
import rawTrainingData from "@/data/training.json";

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

export interface TrainingParticipant {
  id?: string;
  nik: string;
  name: string;
  bujk: string;
  score?: number;
  certNo?: string;
  status?: string;
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
      status: { source: "fallback", message: "Supabase belum terkonfigurasi. Menggunakan cache lokal." }
    };
  }

  try {
    const client = createClient();
    if (!client) {
      return {
        data: fallbackTrainings,
        status: { source: "fallback", message: "Klien Supabase tidak tersedia." }
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
          score: p.nilai_akhir ? Number(p.nilai_akhir) : undefined,
          certNo: p.nomor_sertifikat || undefined,
          status: p.status_kelulusan
        }))
      };
    });

    return {
      data: mapped,
      status: { source: "supabase", message: "Terhubung ke Supabase PostgreSQL (Pilar 5: Pelatihan TKK)." }
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
  const generatedId = agenda.id || `TR-${new Date().getFullYear()}-${String(fallbackTrainings.length + 1).padStart(3, "0")}`;

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
    if (!client) return { success: false, error: "Klien Supabase tidak tersedia." };

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
      return { success: false, insertedCount: 0, error: "Klien Supabase tidak tersedia." };
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
      return { data: defaultPerencanaan, status: { source: "fallback", message: "Klien Supabase tidak tersedia." } };
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

    return { data: mapped, status: { source: "supabase", message: "Terhubung ke Supabase." } };
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
    if (!client) return { success: false, error: "Klien Supabase tidak tersedia." };

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
      return { data: defaultLaporan, status: { source: "fallback", message: "Klien Supabase tidak tersedia." } };
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

    return { data: mapped, status: { source: "supabase", message: "Terhubung ke Supabase." } };
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
    if (!client) return { success: false, error: "Klien Supabase tidak tersedia." };

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

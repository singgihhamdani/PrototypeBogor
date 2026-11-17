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
            tanggal: d.tanggal_audit,
            tanggalAudit: d.tanggal_audit,
            pengawas: d.pengawas,
            statusKepatuhan: d.status_kepatuhan || (Number(d.skor_tertib) >= 80 ? "Patuh" : "Tidak Patuh"),
            skorTertib: Number(d.skor_tertib),
            kategoriHasil: d.kategori_hasil,
            statusVerifikasi: d.status_verifikasi,
            dokumen: d.dokumen || d.dokumen_bap || "Dokumen_Pengawasan_2026.pdf",
            dokumenBAP: d.dokumen || d.dokumen_bap || "Dokumen_Pengawasan_2026.pdf",
            _docStatus: (d.dokumen || d.dokumen_bap) ? "complete" : "pending",
            kualifikasi: d.kualifikasi || "Kecil",
            namaProdusen: d.nama_produsen || d.badan_usaha,
            namaPemilik: d.nama_pemilik || "Direktur Penanggung Jawab",
            noKontak: d.no_kontak || "0812-3456-7890",
            kepemilikanIzin: d.kepemilikan_izin || "Memiliki",
            keabsahanIzin: d.keabsahan_izin || "Sah",
            kapasitas: d.kapasitas || "Standar Operasional",
            izinBb: d.izin_bb || "Ada",
            keabsahanBb: d.keabsahan_bb || "Sah",
            propinsi: d.propinsi || "Jawa Barat",
            kabKota: d.kab_kota || "Kabupaten Bogor",
            catatanTemuan: d.catatan_temuan,
            rekomendasi: d.rekomendasi,
            updatedAt: d.updated_at,
            // Standar SIMAK 2 (Tertib Penyelenggaraan / Proyek Konstruksi)
            namaProyek: d.nama_proyek || d.nama_objek,
            nilaiProyek: Number(d.nilai_proyek) || 0,
            nomorPerjanjian: d.nomor_perjanjian || "-",
            waktuPelaksanaan: d.waktu_pelaksanaan || "-",
            penyediaJasa: d.penyedia_jasa || d.badan_usaha,
            namaPemilikPekerjaan: d.nama_pemilik_pekerjaan || "Dinas PUPR Kab. Bogor",
            waktuPengawasan: d.waktu_pengawasan || d.tanggal_audit,
            // Standar SIMAK 3 (Tertib Pemanfaatan / Bangunan Purna-Konstruksi)
            namaBangunan: d.nama_bangunan || d.nama_objek,
            namaPengelola: d.nama_pengelola || "-",
            fungsiBangunan: d.fungsi_bangunan || "Bangunan Gedung / Infrastruktur",
            statusSlf: d.status_slf || "Memiliki SLF"
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

  // Fallback ke mock data lokal (disortir menurun berdasarkan tanggal terbaru)
  const fallback = mockPelaksanaanRecords
    .filter((r) => r.tertibType === tertibType)
    .sort((a, b) => (b.tanggal || b.tanggalAudit || "").localeCompare(a.tanggal || a.tanggalAudit || ""))
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
  skorTertib?: number;
  statusKepatuhan?: 'Patuh' | 'Tidak Patuh';
  kategoriHasil?: 'Tertib' | 'Cukup Tertib' | 'Kurang Tertib';
  kualifikasi?: 'Kecil' | 'Menengah' | 'Besar' | 'Spesialis';
  namaProdusen?: string;
  namaPemilik?: string;
  noKontak?: string;
  kepemilikanIzin?: 'Memiliki' | 'Tidak Memiliki';
  keabsahanIzin?: 'Sah' | 'Tidak Sah' | 'Aktif';
  kapasitas?: string;
  izinBb?: 'Ada' | 'Tidak Ada';
  keabsahanBb?: 'Sah' | 'Tidak Sah';
  propinsi?: string;
  kabKota?: string;
  dokumen?: string;
  catatanTemuan?: string;
  rekomendasi?: string;
  // Standar SIMAK 2 (Tertib Penyelenggaraan / Proyek Konstruksi)
  namaProyek?: string;
  nilaiProyek?: number;
  nomorPerjanjian?: string;
  waktuPelaksanaan?: string;
  penyediaJasa?: string;
  namaPemilikPekerjaan?: string;
  waktuPengawasan?: string;
  // Standar SIMAK 3 (Tertib Pemanfaatan / Bangunan Purna-Konstruksi)
  namaBangunan?: string;
  namaPengelola?: string;
  fungsiBangunan?: string;
  statusSlf?: string;
}): Promise<{ success: boolean; data?: PelaksanaanRecord; error?: string }> {
  const generatedId = `PEL-${record.tertibType.substring(0, 2).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  const statusKepatuhanVal = record.statusKepatuhan || (record.skorTertib && record.skorTertib >= 80 ? "Patuh" : "Tidak Patuh");
  const dokumenVal = record.dokumen || `Dokumen_${record.simakCode.replace(/\s+/g, "_")}_${record.badanUsaha.replace(/[^a-zA-Z0-9]/g, "")}.pdf`;

  const payload: Record<string, any> = {
    id: generatedId,
    simak_code: record.simakCode,
    tipe_tertib: record.tertibType,
    nama_objek: record.namaProyek || record.namaObjek,
    badan_usaha: record.penyediaJasa || record.badanUsaha,
    lokasi: record.lokasi,
    tanggal_audit: record.waktuPengawasan || record.tanggalAudit,
    pengawas: record.pengawas,
    skor_tertib: record.skorTertib || (statusKepatuhanVal === "Patuh" ? 90 : 60),
    kategori_hasil: record.kategoriHasil || (statusKepatuhanVal === "Patuh" ? "Tertib" : "Kurang Tertib"),
    status_verifikasi: "Draft",
    dokumen_bap: dokumenVal,
    dokumen: dokumenVal,
    kualifikasi: record.kualifikasi || "Kecil",
    nama_produsen: record.namaProdusen || record.badanUsaha,
    nama_pemilik: record.namaPemilik || "Penanggung Jawab",
    no_kontak: record.noKontak || "0812-0000-0000",
    kepemilikan_izin: record.kepemilikanIzin || "Memiliki",
    keabsahan_izin: record.keabsahanIzin || "Sah",
    kapasitas: record.kapasitas || "Standar Operasional",
    izin_bb: record.izinBb || "Ada",
    keabsahan_bb: record.keabsahanBb || "Sah",
    propinsi: record.propinsi || "Jawa Barat",
    kab_kota: record.kabKota || "Kabupaten Bogor",
    status_kepatuhan: statusKepatuhanVal,
    catatan_temuan: record.catatanTemuan || null,
    rekomendasi: record.rekomendasi || null,
    // Kolom SIMAK 2
    nama_proyek: record.namaProyek || record.namaObjek,
    nilai_proyek: record.nilaiProyek || 0,
    nomor_perjanjian: record.nomorPerjanjian || null,
    waktu_pelaksanaan: record.waktuPelaksanaan || null,
    penyedia_jasa: record.penyediaJasa || record.badanUsaha,
    nama_pemilik_pekerjaan: record.namaPemilikPekerjaan || null,
    waktu_pengawasan: record.waktuPengawasan || record.tanggalAudit,
    // Kolom SIMAK 3
    nama_bangunan: record.namaBangunan || record.namaObjek,
    nama_pengelola: record.namaPengelola || null,
    fungsi_bangunan: record.fungsiBangunan || null,
    status_slf: record.statusSlf || "Memiliki SLF"
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
            tanggal: data.tanggal_audit,
            tanggalAudit: data.tanggal_audit,
            pengawas: data.pengawas,
            statusKepatuhan: data.status_kepatuhan || statusKepatuhanVal,
            skorTertib: Number(data.skor_tertib),
            kategoriHasil: data.kategori_hasil,
            statusVerifikasi: data.status_verifikasi,
            dokumen: data.dokumen || data.dokumen_bap || dokumenVal,
            dokumenBAP: data.dokumen || data.dokumen_bap || dokumenVal,
            _docStatus: "complete",
            kualifikasi: data.kualifikasi,
            namaProdusen: data.nama_produsen,
            namaPemilik: data.nama_pemilik,
            noKontak: data.no_kontak,
            kepemilikanIzin: data.kepemilikan_izin,
            keabsahanIzin: data.keabsahan_izin,
            kapasitas: data.kapasitas,
            izinBb: data.izin_bb,
            keabsahanBb: data.keabsahan_bb,
            propinsi: data.propinsi,
            kabKota: data.kab_kota,
            catatanTemuan: data.catatan_temuan,
            rekomendasi: data.rekomendasi,
            // Standar SIMAK 2
            namaProyek: data.nama_proyek || data.nama_objek,
            nilaiProyek: Number(data.nilai_proyek) || 0,
            nomorPerjanjian: data.nomor_perjanjian || "-",
            waktuPelaksanaan: data.waktu_pelaksanaan || "-",
            penyediaJasa: data.penyedia_jasa || data.badan_usaha,
            namaPemilikPekerjaan: data.nama_pemilik_pekerjaan || "Dinas PUPR Kab. Bogor",
            waktuPengawasan: data.waktu_pengawasan || data.tanggal_audit,
            // Standar SIMAK 3
            namaBangunan: data.nama_bangunan || data.nama_objek,
            namaPengelola: data.nama_pengelola || "-",
            fungsiBangunan: data.fungsi_bangunan || "Bangunan Gedung / Infrastruktur",
            statusSlf: data.status_slf || "Memiliki SLF"
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
      namaObjek: record.namaProyek || record.namaObjek,
      badanUsaha: record.penyediaJasa || record.badanUsaha,
      lokasi: record.lokasi,
      tanggal: record.waktuPengawasan || record.tanggalAudit,
      tanggalAudit: record.waktuPengawasan || record.tanggalAudit,
      pengawas: record.pengawas,
      statusKepatuhan: statusKepatuhanVal,
      skorTertib: record.skorTertib || 90,
      kategoriHasil: record.kategoriHasil || "Tertib",
      statusVerifikasi: "Draft",
      dokumen: dokumenVal,
      dokumenBAP: dokumenVal,
      _docStatus: "complete",
      kualifikasi: record.kualifikasi || "Kecil",
      namaProdusen: record.namaProdusen || record.badanUsaha,
      namaPemilik: record.namaPemilik || "Penanggung Jawab",
      noKontak: record.noKontak || "0812-0000-0000",
      kepemilikanIzin: record.kepemilikanIzin || "Memiliki",
      keabsahanIzin: record.keabsahanIzin || "Sah",
      kapasitas: record.kapasitas || "Standar Operasional",
      izinBb: record.izinBb || "Ada",
      keabsahanBb: record.keabsahanBb || "Sah",
      propinsi: record.propinsi || "Jawa Barat",
      kabKota: record.kabKota || "Kabupaten Bogor",
      // Standar SIMAK 2
      namaProyek: record.namaProyek || record.namaObjek,
      nilaiProyek: record.nilaiProyek || 0,
      nomorPerjanjian: record.nomorPerjanjian || "-",
      waktuPelaksanaan: record.waktuPelaksanaan || "-",
      penyediaJasa: record.penyediaJasa || record.badanUsaha,
      namaPemilikPekerjaan: record.namaPemilikPekerjaan || "Dinas PUPR Kab. Bogor",
      waktuPengawasan: record.waktuPengawasan || record.tanggalAudit,
      // Standar SIMAK 3
      namaBangunan: record.namaBangunan || record.namaObjek,
      namaPengelola: record.namaPengelola || "-",
      fungsiBangunan: record.fungsiBangunan || "Bangunan Gedung / Infrastruktur",
      statusSlf: record.statusSlf || "Memiliki SLF"
    }
  };
}

export async function updatePelaksanaan(
  id: string,
  record: Partial<PelaksanaanRecord>
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const payload: Record<string, any> = {
          updated_at: new Date().toISOString()
        };
        if (record.simakCode !== undefined) payload.simak_code = record.simakCode;
        if (record.namaObjek !== undefined) payload.nama_objek = record.namaObjek;
        if (record.badanUsaha !== undefined) payload.badan_usaha = record.badanUsaha;
        if (record.lokasi !== undefined) payload.lokasi = record.lokasi;
        if (record.tanggal !== undefined) payload.tanggal_audit = record.tanggal;
        if (record.tanggalAudit !== undefined) payload.tanggal_audit = record.tanggalAudit;
        if (record.pengawas !== undefined) payload.pengawas = record.pengawas;
        if (record.statusKepatuhan !== undefined) payload.status_kepatuhan = record.statusKepatuhan;
        if (record.statusVerifikasi !== undefined) payload.status_verifikasi = record.statusVerifikasi;
        if (record.dokumen !== undefined) {
          payload.dokumen = record.dokumen;
          payload.dokumen_bap = record.dokumen;
        }
        if (record.kualifikasi !== undefined) payload.kualifikasi = record.kualifikasi;
        if (record.namaProdusen !== undefined) payload.nama_produsen = record.namaProdusen;
        if (record.namaPemilik !== undefined) payload.nama_pemilik = record.namaPemilik;
        if (record.noKontak !== undefined) payload.no_kontak = record.noKontak;
        if (record.kepemilikanIzin !== undefined) payload.kepemilikan_izin = record.kepemilikanIzin;
        if (record.keabsahanIzin !== undefined) payload.keabsahan_izin = record.keabsahanIzin;
        if (record.kapasitas !== undefined) payload.kapasitas = record.kapasitas;
        if (record.izinBb !== undefined) payload.izin_bb = record.izinBb;
        if (record.keabsahanBb !== undefined) payload.keabsahan_bb = record.keabsahanBb;
        if (record.catatanTemuan !== undefined) payload.catatan_temuan = record.catatanTemuan;
        if (record.rekomendasi !== undefined) payload.rekomendasi = record.rekomendasi;
        // Kolom SIMAK 2
        if (record.namaProyek !== undefined) payload.nama_proyek = record.namaProyek;
        if (record.nilaiProyek !== undefined) payload.nilai_proyek = record.nilaiProyek;
        if (record.nomorPerjanjian !== undefined) payload.nomor_perjanjian = record.nomorPerjanjian;
        if (record.waktuPelaksanaan !== undefined) payload.waktu_pelaksanaan = record.waktuPelaksanaan;
        if (record.penyediaJasa !== undefined) payload.penyedia_jasa = record.penyediaJasa;
        if (record.namaPemilikPekerjaan !== undefined) payload.nama_pemilik_pekerjaan = record.namaPemilikPekerjaan;
        if (record.waktuPengawasan !== undefined) payload.waktu_pengawasan = record.waktuPengawasan;
        // Kolom SIMAK 3
        if (record.namaBangunan !== undefined) payload.nama_bangunan = record.namaBangunan;
        if (record.namaPengelola !== undefined) payload.nama_pengelola = record.namaPengelola;
        if (record.fungsiBangunan !== undefined) payload.fungsi_bangunan = record.fungsiBangunan;
        if (record.statusSlf !== undefined) payload.status_slf = record.statusSlf;

        const { error } = await (client.from("pengawasan_sesi") as any)
          .update(payload)
          .eq("id", id);

        if (error) throw error;
        return { success: true };
      }
    } catch (err: any) {
      console.error("Gagal update pengawasan_sesi di Supabase:", err);
      return { success: false, error: err.message };
    }
  }
  return { success: true };
}

export async function deletePelaksanaan(id: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { error } = await (client.from("pengawasan_sesi") as any)
          .delete()
          .eq("id", id);

        if (error) throw error;
        return { success: true };
      }
    } catch (err: any) {
      console.error("Gagal hapus pengawasan_sesi di Supabase:", err);
      return { success: false, error: err.message };
    }
  }
  return { success: true };
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
            paketPekerjaan: d.paket_pekerjaan || d.badan_usaha_atau_objek,
            lokasiProyek: d.lokasi_proyek || "Kabupaten Bogor",
            tanggalSurat: d.tanggal_surat || (d.created_at ? d.created_at.split('T')[0] : "2026-08-01"),
            temuanUtama: d.temuan_utama,
            rekomendasiTindakan: d.rekomendasi_tindakan,
            tenggatWaktu: d.tenggat_waktu,
            realisasiTanggal: d.realisasi_tanggal || undefined,
            jenisPeringatan: d.jenis_peringatan || "Peringatan Tertulis I",
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
  const fallback = [...mockRekomendasiRecords.filter((r) => r.tertibType === tertibType)].sort(
    (a, b) => (b.tanggalSurat || "").localeCompare(a.tanggalSurat || "")
  );
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

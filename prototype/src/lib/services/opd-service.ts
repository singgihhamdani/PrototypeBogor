import { createClient, isSupabaseConfigured } from "../supabase/client";
import type { Database } from "../supabase/types";
import opdJsonFallback from "@/data/opd.json";

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

export interface OpdSipjakiProfile {
  id: string;
  opdId?: string;
  tahunAnggaran: number;

  // PILAR 1: PROFIL OPD & SDM
  tipeOpd: string;
  kategori: string;
  namaBidang: string;
  namaSeksi: string;
  levelSuburusan: string;
  alamatKantor: string;
  nomorTelepon: string;
  emailKantor: string;
  websitePemerintahan: string;
  jumlahPns: number;
  pejabatManajerial: number;
  pejabatFungsional: number;
  jumlahP3k: number;
  jumlahNonAsn: number;

  // PILAR 2: DATA PENDUKUNG (PIC & SIPJAKI)
  namaPic: string;
  jabatanPic: string;
  eselonPic: string;
  noHpPic: string;
  emailPic: string;
  skAdminSipjaki: string;
  noSkAdmin: string;
  usernameAdmin: string;
  noHpAdmin: string;

  // PILAR 2: DOKUMEN & REGULASI
  peraturanSotk: string;
  noPeraturanSotk: string;
  perdaJasaKonstruksi: string;
  noPerdaJakon: string;
  skTpjk: string;
  noSkTpjk: string;
  noSprintKadis: string;
  dokumenBaganSotkUrl?: string;
  dokumenSkAdminUrl?: string;
  dokumenSprintUrl?: string;

  // PILAR 2: ANGGARAN UNIT KERJA (n & n+1)
  anggaranJakonN: number;
  anggaranFisikN: number;
  anggaranJakonN1: number;
  anggaranFisikN1: number;

  // PILAR 3: PELAKSANAAN & PENGAWASAN
  cakupanTugasUtama: string;
  jmlPelatihanTkk: number;
  jmlTkkTerlatih: number;
  jmlTkkTersertifikasi: number;
  targetRpjmdPelatihan: number;
  targetRpjmdSertifikasi: number;

  // DATA WILAYAH
  jmlBadanUsaha: number;
  jmlSbuBerlaku: number;
  jmlTkkWilayah: number;
  jmlSkkBerlaku: number;

  // TARGET RPJMD PENGAWASAN
  targetRpjmdTertibUsaha: number;
  targetRpjmdTertibPenyelenggaraan: number;
  targetRpjmdTertibPemanfaatan: number;

  // REALISASI LIVE AUTO ROLLUP
  realisasiTertibUsaha: number;
  realisasiTertibUsahaKepu: number;
  realisasiTertibPenyelenggaraan: number;
  realisasiTertibPenyelenggaraanKepu: number;
  realisasiTertibPemanfaatan: number;
  realisasiTertibPemanfaatanKepu: number;
}

export const DEFAULT_OPD_SIPJAKI_PROFILE: OpdSipjakiProfile = {
  id: "OPD-BOGOR-DPU",
  tahunAnggaran: 2026,
  tipeOpd: opdJsonFallback.tipeOpd || "Dinas Teknis Pekerjaan Umum",
  kategori: opdJsonFallback.kategori || "Pemerintah Kabupaten",
  namaBidang: opdJsonFallback.division || "Bidang Bina Konstruksi",
  namaSeksi: opdJsonFallback.section || "Sub-Koordinator Kelembagaan dan Jasa Konstruksi",
  levelSuburusan: opdJsonFallback.levelSuburusan || "Bidang Mandiri (Eselon III)",
  alamatKantor: opdJsonFallback.address || "Jl. Bersih No. 1, Cibinong, Kab. Bogor",
  nomorTelepon: opdJsonFallback.phone || "(021) 8753545",
  emailKantor: opdJsonFallback.email || "dpu@bogorkab.go.id",
  websitePemerintahan: opdJsonFallback.website || "https://dpu.bogorkab.go.id",
  jumlahPns: opdJsonFallback.personnel?.pns || 14,
  pejabatManajerial: opdJsonFallback.personnel?.manajerial || 3,
  pejabatFungsional: opdJsonFallback.personnel?.fungsional || 8,
  jumlahP3k: opdJsonFallback.personnel?.p3k || 5,
  jumlahNonAsn: opdJsonFallback.personnel?.nonAsn || 6,

  namaPic: opdJsonFallback.picSipjaki?.name || "H. Raden Ridwan, ST, M.Si",
  jabatanPic: opdJsonFallback.picSipjaki?.position || "Kepala Bidang Jasa Konstruksi",
  eselonPic: opdJsonFallback.picSipjaki?.eselon || "Eselon III.b",
  noHpPic: opdJsonFallback.picSipjaki?.phone || "081298765432",
  emailPic: opdJsonFallback.picSipjaki?.email || "ridwan.jakon@bogorkab.go.id",

  skAdminSipjaki: opdJsonFallback.operatorSipjaki?.skAdmin || "SK Penetapan Administrator SIPJAKI Daerah Kab. Bogor",
  noSkAdmin: opdJsonFallback.operatorSipjaki?.noSkAdmin || "SK.BUPATI/800/104/Kpts/DPU/2025",
  usernameAdmin: opdJsonFallback.operatorSipjaki?.email || "bayu.sipjaki@bogorkab.go.id",
  noHpAdmin: opdJsonFallback.operatorSipjaki?.phone || "085712345678",

  peraturanSotk: opdJsonFallback.regulation?.sotk || "Peraturan Bupati Bogor tentang SOTK Dinas Pekerjaan Umum",
  noPeraturanSotk: opdJsonFallback.regulation?.noSotk || "Perbup No. 67 Tahun 2021",
  perdaJasaKonstruksi: opdJsonFallback.regulation?.perdaJakon || "Peraturan Daerah Kabupaten Bogor tentang Penyelenggaraan Jasa Konstruksi",
  noPerdaJakon: opdJsonFallback.regulation?.noPerdaJakon || "Perda No. 2 Tahun 2024",
  skTpjk: opdJsonFallback.regulation?.skTpjk || "SK Pembentukan Tim Pembina Jasa Konstruksi (TPJK) Kabupaten Bogor",
  noSkTpjk: opdJsonFallback.regulation?.noSkTpjk || "SK.BUPATI/600/215/Kpts/DPU/2026",
  noSprintKadis: opdJsonFallback.regulation?.noSprintKadis || "800.1.11.1/092-Bid.Jakon/2026",
  dokumenBaganSotkUrl: opdJsonFallback.regulation?.docBaganSotkUrl || "/documents/Bagan_SOTK_DPU_2026.pdf",
  dokumenSkAdminUrl: opdJsonFallback.regulation?.docSkAdminUrl || "/documents/SK_Admin_SIPJAKI_2026.pdf",
  dokumenSprintUrl: opdJsonFallback.regulation?.docSprintUrl || "/documents/Surat_Perintah_Tugas_Pengawasan_2026.pdf",

  anggaranJakonN: opdJsonFallback.budget?.anggaranJakonN || 4850000000,
  anggaranFisikN: opdJsonFallback.budget?.anggaranFisikN || 650000000000,
  anggaranJakonN1: opdJsonFallback.budget?.anggaranJakonN1 || 5200000000,
  anggaranFisikN1: opdJsonFallback.budget?.anggaranFisikN1 || 710000000000,

  cakupanTugasUtama: opdJsonFallback.tkkPelatihan?.cakupanTugasUtama || "Penyelenggaraan pembinaan dan pengawasan tertib usaha, tertib penyelenggaraan, dan tertib pemanfaatan produk jasa konstruksi serta fasilitasi pelatihan dan sertifikasi tenaga kerja konstruksi (TKK) di wilayah Kabupaten Bogor.",
  jmlPelatihanTkk: opdJsonFallback.tkkPelatihan?.jmlPelatihanTkk || 6,
  jmlTkkTerlatih: opdJsonFallback.tkkPelatihan?.jmlTkkTerlatih || 240,
  jmlTkkTersertifikasi: opdJsonFallback.tkkPelatihan?.jmlTkkTersertifikasi || 215,
  targetRpjmdPelatihan: opdJsonFallback.tkkPelatihan?.targetRpjmdPelatihan || 300,
  targetRpjmdSertifikasi: opdJsonFallback.tkkPelatihan?.targetRpjmdSertifikasi || 250,

  jmlBadanUsaha: opdJsonFallback.rantaiPasokWilayah?.jmlBadanUsaha || 428,
  jmlSbuBerlaku: opdJsonFallback.rantaiPasokWilayah?.jmlSbuBerlaku || 385,
  jmlTkkWilayah: opdJsonFallback.rantaiPasokWilayah?.jmlTkkWilayah || 1850,
  jmlSkkBerlaku: opdJsonFallback.rantaiPasokWilayah?.jmlSkkBerlaku || 1420,

  targetRpjmdTertibUsaha: opdJsonFallback.targetRpjmdPengawasan?.tertibUsaha || 50,
  targetRpjmdTertibPenyelenggaraan: opdJsonFallback.targetRpjmdPengawasan?.tertibPenyelenggaraan || 40,
  targetRpjmdTertibPemanfaatan: opdJsonFallback.targetRpjmdPengawasan?.tertibPemanfaatan || 30,

  realisasiTertibUsaha: 14,
  realisasiTertibUsahaKepu: 10,
  realisasiTertibPenyelenggaraan: 11,
  realisasiTertibPenyelenggaraanKepu: 9,
  realisasiTertibPemanfaatan: 6,
  realisasiTertibPemanfaatanKepu: 5
};

export const INITIAL_OPD_FALLBACK: OpdRecord[] = [
  {
    id: "opd-dpu",
    kode: "DPU",
    nama: "Dinas Pekerjaan Umum",
    namaPendek: "DPU",
    kepalaOpd: "Iwan Setiawan, ST, MT",
    nipKepala: "197204151998031005",
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

// =============================================================================
// FITUR PROFIL OPD & SIPJAKI PUSAT (3 PILAR)
// =============================================================================

export async function fetchOpdSipjakiProfile(profileId: string = "OPD-BOGOR-DPU"): Promise<{
  data: OpdSipjakiProfile;
  status: DataSourceStatus;
}> {
  let profile = { ...DEFAULT_OPD_SIPJAKI_PROFILE };
  let source: "supabase" | "fallback" = "fallback";
  let message = "Data Cadangan Lokal (Offline/Fallback Mode)";

  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await (client as any)
          .from("profil_opd_sipjaki")
          .select("*")
          .eq("id", profileId)
          .maybeSingle();

        if (!error && data) {
          source = "supabase";
          message = "Live Supabase PostgreSQL Database";
          profile = {
            id: data.id,
            opdId: data.opd_id,
            tahunAnggaran: data.tahun_anggaran || 2026,
            tipeOpd: data.tipe_opd || profile.tipeOpd,
            kategori: data.kategori || profile.kategori,
            namaBidang: data.nama_bidang || profile.namaBidang,
            namaSeksi: data.nama_seksi || profile.namaSeksi,
            levelSuburusan: data.level_suburusan || profile.levelSuburusan,
            alamatKantor: data.alamat_kantor || profile.alamatKantor,
            nomorTelepon: data.nomor_telepon || profile.nomorTelepon,
            emailKantor: data.email_kantor || profile.emailKantor,
            websitePemerintahan: data.website_pemerintahan || profile.websitePemerintahan,
            jumlahPns: Number(data.jumlah_pns) || profile.jumlahPns,
            pejabatManajerial: Number(data.pejabat_manajerial) || profile.pejabatManajerial,
            pejabatFungsional: Number(data.pejabat_fungsional) || profile.pejabatFungsional,
            jumlahP3k: Number(data.jumlah_p3k) || profile.jumlahP3k,
            jumlahNonAsn: Number(data.jumlah_non_asn) || profile.jumlahNonAsn,

            namaPic: data.nama_pic || profile.namaPic,
            jabatanPic: data.jabatan_pic || profile.jabatanPic,
            eselonPic: data.eselon_pic || profile.eselonPic,
            noHpPic: data.no_hp_pic || profile.noHpPic,
            emailPic: data.email_pic || profile.emailPic,
            skAdminSipjaki: data.sk_admin_sipjaki || profile.skAdminSipjaki,
            noSkAdmin: data.no_sk_admin || profile.noSkAdmin,
            usernameAdmin: data.username_admin || profile.usernameAdmin,
            noHpAdmin: data.no_hp_admin || profile.noHpAdmin,

            peraturanSotk: data.peraturan_sotk || profile.peraturanSotk,
            noPeraturanSotk: data.no_peraturan_sotk || profile.noPeraturanSotk,
            perdaJasaKonstruksi: data.perda_jasa_konstruksi || profile.perdaJasaKonstruksi,
            noPerdaJakon: data.no_perda_jakon || profile.noPerdaJakon,
            skTpjk: data.sk_tpjk || profile.skTpjk,
            noSkTpjk: data.no_sk_tpjk || profile.noSkTpjk,
            noSprintKadis: data.no_sprint_kadis || profile.noSprintKadis,
            dokumenBaganSotkUrl: data.dokumen_bagan_sotk_url || profile.dokumenBaganSotkUrl,
            dokumenSkAdminUrl: data.dokumen_sk_admin_url || profile.dokumenSkAdminUrl,
            dokumenSprintUrl: data.dokumen_sprint_url || profile.dokumenSprintUrl,

            anggaranJakonN: Number(data.anggaran_jakon_n) || profile.anggaranJakonN,
            anggaranFisikN: Number(data.anggaran_fisik_n) || profile.anggaranFisikN,
            anggaranJakonN1: Number(data.anggaran_jakon_n1) || profile.anggaranJakonN1,
            anggaranFisikN1: Number(data.anggaran_fisik_n1) || profile.anggaranFisikN1,

            cakupanTugasUtama: data.cakupan_tugas_utama || profile.cakupanTugasUtama,
            jmlPelatihanTkk: Number(data.jml_pelatihan_tkk) || profile.jmlPelatihanTkk,
            jmlTkkTerlatih: Number(data.jml_tkk_terlatih) || profile.jmlTkkTerlatih,
            jmlTkkTersertifikasi: Number(data.jml_tkk_tersertifikasi) || profile.jmlTkkTersertifikasi,
            targetRpjmdPelatihan: Number(data.target_rpjmd_pelatihan) || profile.targetRpjmdPelatihan,
            targetRpjmdSertifikasi: Number(data.target_rpjmd_sertifikasi) || profile.targetRpjmdSertifikasi,

            jmlBadanUsaha: Number(data.jml_badan_usaha) || profile.jmlBadanUsaha,
            jmlSbuBerlaku: Number(data.jml_sbu_berlaku) || profile.jmlSbuBerlaku,
            jmlTkkWilayah: Number(data.jml_tkk_wilayah) || profile.jmlTkkWilayah,
            jmlSkkBerlaku: Number(data.jml_skk_berlaku) || profile.jmlSkkBerlaku,

            targetRpjmdTertibUsaha: Number(data.target_rpjmd_tertib_usaha) || profile.targetRpjmdTertibUsaha,
            targetRpjmdTertibPenyelenggaraan: Number(data.target_rpjmd_tertib_penyelenggaraan) || profile.targetRpjmdTertibPenyelenggaraan,
            targetRpjmdTertibPemanfaatan: Number(data.target_rpjmd_tertib_pemanfaatan) || profile.targetRpjmdTertibPemanfaatan,

            realisasiTertibUsaha: profile.realisasiTertibUsaha,
            realisasiTertibUsahaKepu: profile.realisasiTertibUsahaKepu,
            realisasiTertibPenyelenggaraan: profile.realisasiTertibPenyelenggaraan,
            realisasiTertibPenyelenggaraanKepu: profile.realisasiTertibPenyelenggaraanKepu,
            realisasiTertibPemanfaatan: profile.realisasiTertibPemanfaatan,
            realisasiTertibPemanfaatanKepu: profile.realisasiTertibPemanfaatanKepu
          };
        }

        // Live Auto-Rollup Calculation dari pengawasan_sesi
        const rollup = await fetchOpdSipjakiAutoRollup();
        profile.realisasiTertibUsaha = rollup.tertibUsahaTotal;
        profile.realisasiTertibUsahaKepu = rollup.tertibUsahaKepu;
        profile.realisasiTertibPenyelenggaraan = rollup.tertibPenyelenggaraanTotal;
        profile.realisasiTertibPenyelenggaraanKepu = rollup.tertibPenyelenggaraanKepu;
        profile.realisasiTertibPemanfaatan = rollup.tertibPemanfaatanTotal;
        profile.realisasiTertibPemanfaatanKepu = rollup.tertibPemanfaatanKepu;
        if (rollup.bujkCount > 0) profile.jmlBadanUsaha = rollup.bujkCount;
        if (rollup.tkkCount > 0) profile.jmlTkkWilayah = rollup.tkkCount;
      }
    } catch (err) {
      console.warn("Gagal fetch profil_opd_sipjaki dari Supabase:", err);
    }
  }

  return {
    data: profile,
    status: { source, message }
  };
}

export async function fetchOpdSipjakiAutoRollup(): Promise<{
  tertibUsahaTotal: number;
  tertibUsahaKepu: number;
  tertibPenyelenggaraanTotal: number;
  tertibPenyelenggaraanKepu: number;
  tertibPemanfaatanTotal: number;
  tertibPemanfaatanKepu: number;
  bujkCount: number;
  tkkCount: number;
}> {
  let res = {
    tertibUsahaTotal: 14,
    tertibUsahaKepu: 10,
    tertibPenyelenggaraanTotal: 11,
    tertibPenyelenggaraanKepu: 9,
    tertibPemanfaatanTotal: 6,
    tertibPemanfaatanKepu: 5,
    bujkCount: 428,
    tkkCount: 1850
  };

  if (!isSupabaseConfigured()) return res;

  try {
    const client = createClient();
    if (!client) return res;

    // Ambil data pengawasan_sesi
    const { data: sesiList } = await (client as any)
      .from("pengawasan_sesi")
      .select("tipe_tertib, badan_usaha, nama_pemilik_pekerjaan, nama_pemilik");

    if (sesiList && sesiList.length > 0) {
      let tuTotal = 0, tuKepu = 0;
      let tpTotal = 0, tpKepu = 0;
      let tmTotal = 0, tmKepu = 0;

      sesiList.forEach((row: any) => {
        const isKepu = (
          (row.nama_pemilik_pekerjaan && /pu|pupr|pekerjaan umum/i.test(row.nama_pemilik_pekerjaan)) ||
          (row.badan_usaha && /pu|pupr|pekerjaan umum/i.test(row.badan_usaha)) ||
          (row.nama_pemilik && /pu|pupr|pekerjaan umum|bpkad|pemkab/i.test(row.nama_pemilik))
        );

        if (row.tipe_tertib === "tertib-usaha") {
          tuTotal++;
          if (isKepu) tuKepu++;
        } else if (row.tipe_tertib === "tertib-penyelenggaraan") {
          tpTotal++;
          if (isKepu) tpKepu++;
        } else if (row.tipe_tertib === "tertib-pemanfaatan") {
          tmTotal++;
          if (isKepu) tmKepu++;
        }
      });

      res.tertibUsahaTotal = tuTotal || res.tertibUsahaTotal;
      res.tertibUsahaKepu = tuKepu || res.tertibUsahaKepu;
      res.tertibPenyelenggaraanTotal = tpTotal || res.tertibPenyelenggaraanTotal;
      res.tertibPenyelenggaraanKepu = tpKepu || res.tertibPenyelenggaraanKepu;
      res.tertibPemanfaatanTotal = tmTotal || res.tertibPemanfaatanTotal;
      res.tertibPemanfaatanKepu = tmKepu || res.tertibPemanfaatanKepu;
    }

    // Ambil total bujk
    const { count: bujkCount } = await (client as any)
      .from("bujk")
      .select("*", { count: "exact", head: true });
    if (bujkCount) res.bujkCount = bujkCount;

    // Ambil total tkk
    const { count: tkkCount } = await (client as any)
      .from("tkk")
      .select("*", { count: "exact", head: true });
    if (tkkCount) res.tkkCount = tkkCount;

  } catch (err) {
    console.warn("Gagal auto rollup pengawasan:", err);
  }

  return res;
}

export async function saveOpdSipjakiProfile(profile: OpdSipjakiProfile): Promise<{
  success: boolean;
  data?: OpdSipjakiProfile;
  error?: string;
}> {
  if (isSupabaseConfigured()) {
    try {
      const client = createClient();
      if (client) {
        const payload = {
          id: profile.id || "OPD-BOGOR-DPU",
          tahun_anggaran: profile.tahunAnggaran || 2026,
          tipe_opd: profile.tipeOpd,
          kategori: profile.kategori,
          nama_bidang: profile.namaBidang,
          nama_seksi: profile.namaSeksi,
          level_suburusan: profile.levelSuburusan,
          alamat_kantor: profile.alamatKantor,
          nomor_telepon: profile.nomorTelepon,
          email_kantor: profile.emailKantor,
          website_pemerintahan: profile.websitePemerintahan,
          jumlah_pns: profile.jumlahPns,
          pejabat_manajerial: profile.pejabatManajerial,
          pejabat_fungsional: profile.pejabatFungsional,
          jumlah_p3k: profile.jumlahP3k,
          jumlah_non_asn: profile.jumlahNonAsn,

          nama_pic: profile.namaPic,
          jabatan_pic: profile.jabatanPic,
          eselon_pic: profile.eselonPic,
          no_hp_pic: profile.noHpPic,
          email_pic: profile.emailPic,
          sk_admin_sipjaki: profile.skAdminSipjaki,
          no_sk_admin: profile.noSkAdmin,
          username_admin: profile.usernameAdmin,
          no_hp_admin: profile.noHpAdmin,

          peraturan_sotk: profile.peraturanSotk,
          no_peraturan_sotk: profile.noPeraturanSotk,
          perda_jasa_konstruksi: profile.perdaJasaKonstruksi,
          no_perda_jakon: profile.noPerdaJakon,
          sk_tpjk: profile.skTpjk,
          no_sk_tpjk: profile.noSkTpjk,
          no_sprint_kadis: profile.noSprintKadis,
          dokumen_bagan_sotk_url: profile.dokumenBaganSotkUrl,
          dokumen_sk_admin_url: profile.dokumenSkAdminUrl,
          dokumen_sprint_url: profile.dokumenSprintUrl,

          anggaran_jakon_n: profile.anggaranJakonN,
          anggaran_fisik_n: profile.anggaranFisikN,
          anggaran_jakon_n1: profile.anggaranJakonN1,
          anggaran_fisik_n1: profile.anggaranFisikN1,

          cakupan_tugas_utama: profile.cakupanTugasUtama,
          jml_pelatihan_tkk: profile.jmlPelatihanTkk,
          jml_tkk_terlatih: profile.jmlTkkTerlatih,
          jml_tkk_tersertifikasi: profile.jmlTkkTersertifikasi,
          target_rpjmd_pelatihan: profile.targetRpjmdPelatihan,
          target_rpjmd_sertifikasi: profile.targetRpjmdSertifikasi,

          jml_badan_usaha: profile.jmlBadanUsaha,
          jml_sbu_berlaku: profile.jmlSbuBerlaku,
          jml_tkk_wilayah: profile.jmlTkkWilayah,
          jml_skk_berlaku: profile.jmlSkkBerlaku,

          target_rpjmd_tertib_usaha: profile.targetRpjmdTertibUsaha,
          target_rpjmd_tertib_penyelenggaraan: profile.targetRpjmdTertibPenyelenggaraan,
          target_rpjmd_tertib_pemanfaatan: profile.targetRpjmdTertibPemanfaatan,
          updated_at: new Date().toISOString()
        };

        const { data, error } = await (client as any)
          .from("profil_opd_sipjaki")
          .upsert(payload)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data: profile };
      }
    } catch (err: any) {
      console.error("Gagal simpan profil_opd_sipjaki ke Supabase:", err);
      return { success: false, error: err.message };
    }
  }

  return { success: true, data: profile };
}

import { createClient, isSupabaseConfigured } from "../prototype/src/lib/supabase/client";

async function seedMethods() {
  if (!isSupabaseConfigured()) {
    console.log("Supabase not configured, using local fallback only.");
    return;
  }

  const client = createClient();
  if (!client) {
    console.log("No client.");
    return;
  }

  const items = [
    {
      id: "PEL-2026-010",
      tahun: "2026",
      nama_kegiatan: "Distance Learning: Pelatihan Building Information Modelling (BIM) Konstruksi",
      metode: "Distance Learning",
      lokasi: "Online LMS SIPJAKI & Laboratorium Komputer DPU",
      jumlah_l: 24,
      jumlah_p: 8,
      kab_kota: "Kabupaten Bogor",
      propinsi: "Jawa Barat",
      skk_jenjang: "Jenjang 5 (Teknisi/Analis)",
      penyelenggara: "Dinas PUPR Kab. Bogor & Balai Jasa Konstruksi Wilayah III",
      status: "Sedang Berjalan",
      keterangan: "Metode pembelajaran jarak jauh interaktif dengan studi kasus pemodelan struktur jembatan",
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "PEL-2026-009",
      tahun: "2026",
      nama_kegiatan: "Pelatihan Vokasi Padat Karya Infrastruktur Berbasis Masyarakat (IBM)",
      metode: "Infrastruktur Berbasis Masyarakat",
      lokasi: "Kecamatan Rumpin & Nanggung (Wilayah Perdesaan)",
      jumlah_l: 35,
      jumlah_p: 5,
      kab_kota: "Kabupaten Bogor",
      propinsi: "Jawa Barat",
      skk_jenjang: "Jenjang 2 (Tukang Terampil)",
      penyelenggara: "Dinas PUPR Kab. Bogor",
      status: "Selesai & Tersertifikasi",
      keterangan: "Pemberdayaan tenaga kerja lokal untuk pemeliharaan jalan desa dan drainase lingkungan",
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "PEL-2026-008",
      tahun: "2026",
      nama_kegiatan: "Bimtek Konstruksi & Sertifikasi Kejuruan Warga Binaan Lembaga Pemasyarakatan",
      metode: "Lembaga Pemasyarakatan",
      lokasi: "Lapas Kelas IIA Cibinong (Pondok Rajeg)",
      jumlah_l: 20,
      jumlah_p: 0,
      kab_kota: "Kabupaten Bogor",
      propinsi: "Jawa Barat",
      skk_jenjang: "Jenjang 1 (Operator Pemula)",
      penyelenggara: "Dinas PUPR Kab. Bogor bekerjasama dengan Ditjen Pemasyarakatan",
      status: "Selesai & Tersertifikasi",
      keterangan: "Program pembinaan kemandirian vokasi pertukangan kayu dan batu bagi warga binaan pemasyarakatan",
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  for (const item of items) {
    const { data, error } = await (client as any)
      .from("pelatihan_sipjaki")
      .upsert(item, { onConflict: "id" })
      .select();
    if (error) {
      console.error("Error upserting", item.id, error.message);
    } else {
      console.log("Successfully upserted", item.id, item.metode);
    }
  }
}

seedMethods().then(() => console.log("Done seeding methods."));

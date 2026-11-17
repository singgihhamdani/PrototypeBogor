const { createClient } = require("u:/Project/ciptabintar/prototype/node_modules/@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, "../prototype/.env.local");
let supabaseUrl = "";
let supabaseAnonKey = "";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
      supabaseUrl = trimmed.split("=")[1].trim();
    }
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_ANON_KEY=")) {
      supabaseAnonKey = trimmed.split("=")[1].trim();
    }
  });
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.log("Supabase not configured");
  process.exit(0);
}

const client = createClient(supabaseUrl, supabaseAnonKey);

async function seedHistory() {
  const items = [
    {
      id: "P011",
      nama_paket: "Peningkatan Jembatan dan Dinding Penahan Tanah Cibinong - Cikeas",
      tahun_anggaran: 2025,
      sumber_dana: "APBD",
      nama_instansi: "Dinas PUPR Kab. Bogor",
      bujk_id: "B001",
      nama_penyedia: "PT Bangun Jaya Konstruksi",
      nib_penyedia: "1234567890123",
      nilai_kontrak: 4250000000,
      jenis_kontrak: "Harga Satuan",
      sifat_kontrak: "Tahun Tunggal",
      karakteristik_kontrak: "Tahun Tunggal",
      propinsi: "Jawa Barat",
      kab_kota: "Kabupaten Bogor",
      tanggal_mulai: "2025-04-10",
      tanggal_selesai: "2025-11-15",
      progres_fisik: 100.0,
      progres_keuangan: 100.0,
      bulan_progres: "November",
      bulan_progres_keuangan: "Desember",
      status_pekerjaan: "Selesai",
      kode_kecamatan: "01",
      kecamatan: "Kabupaten Bogor",
      lat: -6.4850,
      lng: 106.8620,
      updated_at: "2025-11-20T10:00:00.000Z"
    },
    {
      id: "P012",
      nama_paket: "Pemeliharaan Berkala Jalan Akses Sentul City - Babakan Madang",
      tahun_anggaran: 2024,
      sumber_dana: "APBD",
      nama_instansi: "Dinas PUPR Kab. Bogor",
      bujk_id: "B001",
      nama_penyedia: "PT Bangun Jaya Konstruksi",
      nib_penyedia: "1234567890123",
      nilai_kontrak: 2750000000,
      jenis_kontrak: "Harga Satuan",
      sifat_kontrak: "Tahun Tunggal",
      karakteristik_kontrak: "Tahun Tunggal",
      propinsi: "Jawa Barat",
      kab_kota: "Kabupaten Bogor",
      tanggal_mulai: "2024-05-02",
      tanggal_selesai: "2024-09-30",
      progres_fisik: 100.0,
      progres_keuangan: 100.0,
      bulan_progres: "September",
      bulan_progres_keuangan: "Oktober",
      status_pekerjaan: "Selesai",
      kode_kecamatan: "04",
      kecamatan: "Kabupaten Bogor",
      lat: -6.5320,
      lng: 106.8650,
      updated_at: "2024-10-05T14:30:00.000Z"
    }
  ];

  const { data, error } = await client
    .from("paket_pekerjaan")
    .upsert(items, { onConflict: "id" })
    .select();

  if (error) {
    console.error("Gagal insert ke Supabase:", error.message);
  } else {
    console.log("Berhasil insert proyek history ke Supabase! Count:", data.length);
  }
}

seedHistory();

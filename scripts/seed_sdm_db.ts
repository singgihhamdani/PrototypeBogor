import { createClient } from "u:/Project/ciptabintar/prototype/node_modules/@supabase/supabase-js";
import * as path from "path";
import * as fs from "fs";

const envPath = path.resolve("prototype/.env.local");
let supabaseUrl = "";
let supabaseKey = "";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
      supabaseUrl = trimmed.substring("NEXT_PUBLIC_SUPABASE_URL=".length).trim();
    }
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_ANON_KEY=")) {
      supabaseKey = trimmed.substring("NEXT_PUBLIC_SUPABASE_ANON_KEY=".length).trim();
    }
  }
}

const supabase = createClient(supabaseUrl, supabaseKey);

const newRows = [
  {
    id: "SDM-TP-01",
    tertib_type: "tertib-penyelenggaraan",
    wilayah: "Kabupaten Bogor",
    nama_tim: "Satgas Pengawas Penyelenggaraan Konstruksi Strategis",
    ketua_tim: "Ir. Rahmat Hidayat, M.T. (Ahli Madya SMKK)",
    jumlah_sdm: 8,
    tahun: "2026",
    dokumen: "Surat_Tugas_Satgas_Penyelenggaraan_2026.pdf",
    status: "Terverifikasi"
  },
  {
    id: "SDM-TP-02",
    tertib_type: "tertib-penyelenggaraan",
    wilayah: "Kabupaten Bogor",
    nama_tim: "Tim Pengawas Mutu & Progres Infrastruktur Jalan-Jembatan",
    ketua_tim: "Agus Pratama, S.T. (Ahli Pengawas Mutu)",
    jumlah_sdm: 6,
    tahun: "2026",
    dokumen: "Surat_Tugas_Tim_Mutu_Infrastruktur_2026.pdf",
    status: "Terverifikasi"
  },
  {
    id: "SDM-TP-03",
    tertib_type: "tertib-penyelenggaraan",
    wilayah: "Kabupaten Bogor",
    nama_tim: "Tim Pengawasan Keselamatan Kerja Konstruksi (K3)",
    ketua_tim: "Siti Nurjanah, S.T., M.Eng. (Ahli K3 Konstruksi)",
    jumlah_sdm: 4,
    tahun: "2026",
    dokumen: "Surat_Tugas_Pengawasan_K3_2026.pdf",
    status: "Terverifikasi"
  },
  {
    id: "SDM-TM-01",
    tertib_type: "tertib-pemanfaatan",
    wilayah: "Kabupaten Bogor",
    nama_tim: "Tim Pengawasan Laik Fungsi Bangunan Gedung Publik",
    ketua_tim: "Dr. Ir. Wahyudi, M.Sc. (Ahli Bangunan Gedung)",
    jumlah_sdm: 5,
    tahun: "2026",
    dokumen: "Surat_Tugas_Pemanfaatan_Gedung_2026.pdf",
    status: "Terverifikasi"
  },
  {
    id: "SDM-TM-02",
    tertib_type: "tertib-pemanfaatan",
    wilayah: "Kabupaten Bogor",
    nama_tim: "Tim Pengawasan Operasi & Pemeliharaan Jembatan & Prasarana",
    ketua_tim: "Ir. Doni Kusuma, M.T. (Ahli Pemeliharaan Jembatan)",
    jumlah_sdm: 4,
    tahun: "2026",
    dokumen: "Surat_Tugas_Tim_Pemeliharaan_Prasarana_2026.pdf",
    status: "Terverifikasi"
  }
];

async function main() {
  for (const row of newRows) {
    const { error } = await supabase
      .from("pengawasan_sdm_perencanaan")
      .upsert(row, { onConflict: "id" });
    if (error) {
      console.error(`Error upserting ${row.id}:`, error.message);
    } else {
      console.log(`Upserted ${row.id}`);
    }
  }
}

main().catch(console.error);

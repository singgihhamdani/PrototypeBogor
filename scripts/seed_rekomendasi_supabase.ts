import { createClient } from "u:/Project/ciptabintar/prototype/node_modules/@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { mockRekomendasiRecords } from "../prototype/src/data/tertib-mock-data";

// Read .env.local manually
const envPath = path.resolve(__dirname, "../prototype/.env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars: Record<string, string> = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const idx = trimmed.indexOf("=");
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      envVars[key] = val;
    }
  }
}

const supabaseUrl = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseKey = envVars["SUPABASE_SERVICE_ROLE_KEY"] || envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Upserting mockRekomendasiRecords into pengawasan_rekomendasi...");
  for (const item of mockRekomendasiRecords) {
    const payload = {
      id: item.id,
      nomor_surat: item.nomorSurat,
      tertib_type: item.tertibType,
      badan_usaha_atau_objek: item.badanUsahaAtauObjek,
      temuan_utama: item.temuanUtama,
      rekomendasi_tindakan: item.rekomendasiTindakan,
      tenggat_waktu: item.tenggatWaktu,
      status_tindak_lanjut: item.statusTindakLanjut,
      status_verifikasi: item.statusVerifikasi,
      catatan_verifikator: item.catatanVerifikator || null
    };

    const { error } = await supabase
      .from("pengawasan_rekomendasi")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      console.error(`Error inserting ${item.id}:`, error.message);
    } else {
      console.log(`Success: ${item.id} - ${item.badanUsahaAtauObjek}`);
    }
  }
}

seed();

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

async function main() {
  const { data, error } = await supabase
    .from("pengawasan_sesi")
    .select("id, tipe_tertib, nama_objek, badan_usaha, status_kepatuhan, dokumen_bap, skor_tertib");

  if (error) {
    console.error("Error fetching pengawasan_sesi:", error);
    return;
  }

  console.log(`Found ${data.length} rows in pengawasan_sesi:`);
  for (const row of data) {
    console.log(`- [${row.id}] (${row.tipe_tertib}) ${row.nama_objek} | Dok: ${row.dokumen_bap} | Kepatuhan: ${row.status_kepatuhan}`);
  }

  // Update rows that have "Audit" in nama_objek or "BAP" in dokumen_bap
  for (const row of data) {
    let needsUpdate = false;
    let newNamaObjek = row.nama_objek;
    let newDokumen = row.dokumen_bap;

    if (row.nama_objek && row.nama_objek.includes("Audit")) {
      newNamaObjek = row.nama_objek.replace(/Audit\s*/g, "Pemeriksaan ");
      needsUpdate = true;
    }
    if (row.dokumen_bap && row.dokumen_bap.includes("BAP_")) {
      newDokumen = row.dokumen_bap.replace(/BAP_/g, "Dokumen_");
      needsUpdate = true;
    }

    if (needsUpdate) {
      console.log(`Updating ${row.id}: nama_objek='${newNamaObjek}', dokumen_bap='${newDokumen}'`);
      const { error: updateErr } = await supabase
        .from("pengawasan_sesi")
        .update({
          nama_objek: newNamaObjek,
          dokumen_bap: newDokumen,
          dokumen: newDokumen
        })
        .eq("id", row.id);
      if (updateErr) {
        console.error(`Gagal update ${row.id}:`, updateErr);
      } else {
        console.log(`Berhasil update ${row.id}`);
      }
    }
  }
}

main().catch(console.error);

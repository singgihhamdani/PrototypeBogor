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
    .from("pengawasan_sdm_perencanaan")
    .select("*");

  if (error) {
    console.error("Error fetching pengawasan_sdm_perencanaan:", error.message);
    return;
  }

  console.log(`Found ${data.length} rows in pengawasan_sdm_perencanaan:`);
  for (const row of data) {
    console.log(`- [${row.id}] (${row.tertib_type}) ${row.nama_tim} | Dok: ${row.dokumen}`);
    let newDoc = row.dokumen;
    let needsUpdate = false;

    if (row.dokumen && row.dokumen.includes("SK_")) {
      newDoc = row.dokumen.replace(/SK_/g, "Surat_Tugas_");
      needsUpdate = true;
    }
    if (newDoc && newDoc.includes("Audit")) {
      newDoc = newDoc.replace(/Audit/g, "Pengawasan");
      needsUpdate = true;
    }

    if (needsUpdate) {
      console.log(`Updating ${row.id} -> ${newDoc}`);
      await supabase
        .from("pengawasan_sdm_perencanaan")
        .update({
          dokumen: newDoc,
          updated_at: new Date().toISOString()
        })
        .eq("id", row.id);
    }
  }

  console.log("Selesai pembaruan database SDM.");
}

main().catch(console.error);

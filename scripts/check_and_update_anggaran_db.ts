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
    .from("pengawasan_anggaran_perencanaan")
    .select("*");

  if (error) {
    console.error("Error fetching pengawasan_anggaran_perencanaan:", error.message);
    return;
  }

  console.log(`Found ${data.length} rows in pengawasan_anggaran_perencanaan:`);
  for (const row of data) {
    console.log(`- [${row.id}] (${row.tertib_type}) ${row.program} | Dok: ${row.dokumen_rka}`);
  }

  for (const row of data) {
    let needsUpdate = false;
    let newDoc = row.dokumen_rka;
    let newProgram = row.program;

    if (row.dokumen_rka && row.dokumen_rka.includes("RKA_")) {
      newDoc = row.dokumen_rka.replace(/RKA_/g, "Dokumen_Anggaran_");
      needsUpdate = true;
    }
    if (newDoc && newDoc.includes("Audit")) {
      newDoc = newDoc.replace(/Audit/g, "Pengawasan");
      needsUpdate = true;
    }
    if (row.program && row.program.includes("Audit")) {
      newProgram = row.program.replace(/Audit/g, "Pengawasan");
      needsUpdate = true;
    }
    if (row.program && row.program.includes("RKA Dinas PUPR")) {
      newProgram = row.program.replace(/RKA Dinas PUPR/g, "Pengawasan Jasa Konstruksi");
      needsUpdate = true;
    }

    if (needsUpdate) {
      console.log(`Updating ${row.id}...`);
      await supabase
        .from("pengawasan_anggaran_perencanaan")
        .update({
          dokumen_rka: newDoc,
          program: newProgram
        })
        .eq("id", row.id);
    }
  }
  console.log("Selesai periksa dan update database.");
}

main().catch(console.error);

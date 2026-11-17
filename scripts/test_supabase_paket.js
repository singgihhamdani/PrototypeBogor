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

console.log("Testing Supabase connection for paket_pekerjaan...");
console.log("URL:", supabaseUrl ? "Configured" : "Missing");

if (!supabaseUrl || !supabaseAnonKey) {
  console.log("Supabase credentials not configured in .env.local");
  process.exit(0);
}

const client = createClient(supabaseUrl, supabaseAnonKey);

async function testPaket() {
  try {
    const { data, error } = await client
      .from("paket_pekerjaan")
      .select("id, nama_paket, nilai_kontrak, jenis_kontrak, karakteristik_kontrak, propinsi, kab_kota, updated_at")
      .order("updated_at", { ascending: false })
      .limit(5);

    if (error) {
      console.log("Query Result (Catatan: Skema 013 belum dieksekusi di SQL Editor Supabase):", error.message);
    } else {
      console.log("Berhasil query paket_pekerjaan! Total baris:", data.length);
      console.log("Sampel data:", data);
    }
  } catch (err) {
    console.error("Exception:", err.message);
  }
}

testPaket();

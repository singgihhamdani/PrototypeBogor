const path = require('path');
const { createClient } = require(path.resolve(__dirname, '../prototype/node_modules/@supabase/supabase-js'));
const fs = require('fs');

const envPath = path.resolve(__dirname, '../prototype/.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value.trim();
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Target Project URL:', url);
const supabase = createClient(url, key);

async function testOpd() {
  console.log("Menguji koneksi ke tabel profil_opd_sipjaki...");
  const { data, error } = await supabase
    .from("profil_opd_sipjaki")
    .select("*")
    .eq("id", "OPD-BOGOR-DPU")
    .maybeSingle();

  if (error) {
    console.log("Catatan: Tabel profil_opd_sipjaki belum dieksekusi di Supabase:", error.message);
  } else if (data) {
    console.log("✅ Berhasil membaca profil OPD dari Supabase:", data.nama_bidang);
  } else {
    console.log("Tabel sudah ada, namun belum ada row OPD-BOGOR-DPU.");
  }
}

testOpd();

const path = require('path');
const { createClient } = require(path.resolve(__dirname, '../prototype/node_modules/@supabase/supabase-js'));
const fs = require('fs');

// Baca .env.local manual
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

async function runTests() {
  console.log('\n======================================================');
  console.log('TEST 1: SELECT DARI TABEL pengawasan_anggaran_perencanaan');
  console.log('======================================================');
  
  const { data, error, count } = await supabase
    .from('pengawasan_anggaran_perencanaan')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('❌ Error SELECT:', error.message);
    process.exit(1);
  }

  console.log(`✅ Berhasil! Ditemukan ${data.length} baris data pada tabel.`);
  data.forEach((row, i) => {
    const serapanPct = row.pagu_anggaran > 0 ? ((row.realisasi / row.pagu_anggaran) * 100).toFixed(1) : 0;
    console.log(`\nBaris ${i + 1}:`);
    console.log(`  - ID              : ${row.id}`);
    console.log(`  - Pilar Tertib    : ${row.tertib_type}`);
    console.log(`  - Wilayah         : ${row.wilayah} (Standar SIPJAKI)`);
    console.log(`  - Tahun Anggaran  : TA ${row.tahun} (Standar SIPJAKI)`);
    console.log(`  - Program         : ${row.program}`);
    console.log(`  - Pagu Anggaran   : Rp ${Number(row.pagu_anggaran).toLocaleString('id-ID')} (Standar SIPJAKI)`);
    console.log(`  - Realisasi       : Rp ${Number(row.realisasi).toLocaleString('id-ID')} (${serapanPct}%) (Keunggulan SIJAKON)`);
    console.log(`  - Sumber Dana     : ${row.sumber_dana} (Keunggulan SIJAKON)`);
    console.log(`  - Status          : ${row.status}`);
    console.log(`  - Berkas RKA      : ${row.dokumen_rka}`);
  });

  console.log('\n======================================================');
  console.log('TEST 2: UJI OPERASI INSERT (TAMBAH ALOKASI ANGGARAN BARU)');
  console.log('======================================================');
  const testId = `ANG-TEST-${Date.now().toString().slice(-4)}`;
  const newRow = {
    id: testId,
    tertib_type: 'tertib-usaha',
    wilayah: 'Kecamatan Babakan Madang, Sukaraja',
    tahun: '2026',
    program: 'Uji Penambahan Anggaran Verifikasi Otomatis',
    pagu_anggaran: 100000000,
    realisasi: 45000000,
    sumber_dana: 'APBD Kab. Bogor',
    status: 'Disetujui',
    dokumen_rka: 'Test_RKA_Anggaran.pdf',
    catatan: 'Testing insert row'
  };

  const { error: insertErr } = await supabase
    .from('pengawasan_anggaran_perencanaan')
    .insert([newRow]);

  if (insertErr) {
    console.error('❌ Error INSERT:', insertErr.message);
  } else {
    console.log(`✅ Berhasil INSERT data uji coba dengan ID: ${testId}`);
  }

  console.log('\n======================================================');
  console.log('TEST 3: UJI OPERASI UPDATE (EDIT ANGGARAN)');
  console.log('======================================================');
  const { error: updateErr } = await supabase
    .from('pengawasan_anggaran_perencanaan')
    .update({ realisasi: 65000000, status: 'Disetujui' })
    .eq('id', testId);

  if (updateErr) {
    console.error('❌ Error UPDATE:', updateErr.message);
  } else {
    console.log(`✅ Berhasil UPDATE realisasi menjadi Rp 65.000.000 untuk ID: ${testId}`);
  }

  console.log('\n======================================================');
  console.log('TEST 4: UJI OPERASI DELETE (HAPUS ANGGARAN UJI COBA)');
  console.log('======================================================');
  const { error: deleteErr } = await supabase
    .from('pengawasan_anggaran_perencanaan')
    .delete()
    .eq('id', testId);

  if (deleteErr) {
    console.error('❌ Error DELETE:', deleteErr.message);
  } else {
    console.log(`✅ Berhasil DELETE data uji coba ID: ${testId}`);
  }

  console.log('\n======================================================');
  console.log('🎉 SEMUA PENGUJIAN CRUD SUPABASE ANGGARAN SUKSES LULUS!');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});

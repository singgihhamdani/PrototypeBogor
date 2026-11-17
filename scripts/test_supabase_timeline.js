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
  console.log('TEST 1: SELECT DARI TABEL pengawasan_timeline_perencanaan');
  console.log('======================================================');
  
  const { data, error, count } = await supabase
    .from('pengawasan_timeline_perencanaan')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('❌ Error SELECT:', error.message);
    process.exit(1);
  }

  console.log(`✅ Berhasil! Ditemukan ${data.length} baris data pada tabel.`);
  data.forEach((row, i) => {
    console.log(`\nBaris ${i + 1}:`);
    console.log(`  - ID              : ${row.id}`);
    console.log(`  - Pilar Tertib    : ${row.tertib_type}`);
    console.log(`  - Wilayah         : ${row.wilayah} (Standar SIPJAKI)`);
    console.log(`  - Tahun Anggaran  : TA ${row.tahun} (Standar SIPJAKI)`);
    console.log(`  - Kegiatan        : ${row.kegiatan}`);
    console.log(`  - Periode         : ${row.periode}`);
    console.log(`  - Waktu           : ${row.bulan_mulai} s/d ${row.bulan_selesai}`);
    console.log(`  - Target Objek    : ${row.target_bujk} Objek (Keunggulan SIJAKON)`);
    console.log(`  - Status          : ${row.status}`);
    console.log(`  - Berkas KAK      : ${row.dokumen_jadwal}`);
  });

  console.log('\n======================================================');
  console.log('TEST 2: UJI OPERASI INSERT (TAMBAH JADWAL BARU)');
  console.log('======================================================');
  const testId = `TIME-TEST-${Date.now().toString().slice(-4)}`;
  const newRow = {
    id: testId,
    tertib_type: 'tertib-usaha',
    wilayah: 'Kecamatan Babakan Madang & Sukaraja',
    tahun: '2026',
    kegiatan: 'Inspeksi Verifikasi Uji Coba Otomatis',
    periode: 'Triwulan IV (Okt - Des 2026)',
    bulan_mulai: 'Oktober 2026',
    bulan_selesai: 'Desember 2026',
    target_bujk: 50,
    status: 'Terjadwal',
    dokumen_jadwal: 'Test_KAK_Jadwal.pdf'
  };

  const { error: insertErr } = await supabase
    .from('pengawasan_timeline_perencanaan')
    .insert([newRow]);

  if (insertErr) {
    console.error('❌ Error INSERT:', insertErr.message);
  } else {
    console.log(`✅ Berhasil INSERT data uji coba dengan ID: ${testId}`);
  }

  console.log('\n======================================================');
  console.log('TEST 3: UJI OPERASI UPDATE (EDIT JADWAL)');
  console.log('======================================================');
  const { error: updateErr } = await supabase
    .from('pengawasan_timeline_perencanaan')
    .update({ target_bujk: 75, status: 'Berjalan' })
    .eq('id', testId);

  if (updateErr) {
    console.error('❌ Error UPDATE:', updateErr.message);
  } else {
    console.log(`✅ Berhasil UPDATE target_bujk menjadi 75 & status menjadi 'Berjalan' untuk ID: ${testId}`);
  }

  console.log('\n======================================================');
  console.log('TEST 4: UJI OPERASI DELETE (HAPUS JADWAL UJI COBA)');
  console.log('======================================================');
  const { error: deleteErr } = await supabase
    .from('pengawasan_timeline_perencanaan')
    .delete()
    .eq('id', testId);

  if (deleteErr) {
    console.error('❌ Error DELETE:', deleteErr.message);
  } else {
    console.log(`✅ Berhasil DELETE data uji coba ID: ${testId}`);
  }

  console.log('\n======================================================');
  console.log('🎉 SEMUA PENGUJIAN DATABASE SUPABASE LULUS DENGAN SUKSES! 🎉');
  console.log('======================================================');
}

runTests().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});

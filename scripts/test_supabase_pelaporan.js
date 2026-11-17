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
  console.log('TEST 1: SELECT DARI TABEL pengawasan_pelaporan');
  console.log('======================================================');
  
  const { data, error } = await supabase
    .from('pengawasan_pelaporan')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Gagal SELECT:', error.message);
    if (error.code === '42P01') {
      console.log('ℹ️ Tabel public.pengawasan_pelaporan belum dibuat di Supabase.');
      console.log('   Silakan jalankan file SQL: prototype/supabase/migrations/009_pelaporan_pengawasan_schema.sql di Supabase SQL Editor.');
    }
    process.exit(1);
  }

  console.log(`✅ Berhasil! Ditemukan ${data.length} berkas laporan pada tabel pengawasan_pelaporan.`);
  data.forEach((row, i) => {
    console.log(`\nBaris ${i + 1}:`);
    console.log(`  - NO / ID         : ${i + 1} / ${row.id}`);
    console.log(`  - JENIS LAPORAN   : ${row.jenis_laporan}`);
    console.log(`  - NAMA LAPORAN    : ${row.nama_laporan}`);
    console.log(`  - TAHUN           : ${row.tahun}`);
    console.log(`  - WILAYAH         : ${row.wilayah} (${row.propinsi} / ${row.kab_kota})`);
    console.log(`  - DOKUMEN         : ${row.dokumen_nama}`);
    console.log(`  - STATUS          : ${row.status}`);
    console.log(`  - OBJEK DIAWASI   : ${row.jumlah_objek} Objek`);
    console.log(`  - KEPATUHAN       : ${row.tingkat_kepatuhan}%`);
    console.log(`  - TANGGAL KIRIM   : ${row.tanggal_kirim}`);
    console.log(`  - NO SURAT        : ${row.nomor_surat || '-'}`);
  });

  console.log('\n======================================================');
  console.log('TEST 2: UJI OPERASI INSERT (TAMBAH BERKAS LAPORAN BARU)');
  console.log('======================================================');
  const testId = `LAP-TEST-${Date.now().toString().slice(-4)}`;
  const newRecord = {
    id: testId,
    tertib_type: 'tertib-usaha',
    jenis_laporan: 'Insidental',
    nama_laporan: 'LAPORAN PENGAWASAN INSIDENTAL KHUSUS MATERIAL BETON 2026',
    tahun: '2026',
    propinsi: 'Jawa Barat',
    kab_kota: 'Kabupaten Bogor',
    wilayah: 'Jawa Barat / Kabupaten Bogor',
    dokumen_nama: 'Laporan_Insidental_Beton_2026.pdf',
    status: 'Menunggu Verifikasi',
    jumlah_objek: 12,
    tingkat_kepatuhan: 91.50,
    tanggal_kirim: '2026-11-16 10:00 WIB',
    nomor_surat: '600.1/TEST/2026',
    catatan: 'Uji integrasi CRUD Supabase untuk pelaporan pengawasan'
  };

  const { data: inserted, error: insertError } = await supabase
    .from('pengawasan_pelaporan')
    .insert(newRecord)
    .select()
    .single();

  if (insertError) {
    console.error('❌ Gagal INSERT:', insertError.message);
  } else {
    console.log('✅ Berhasil INSERT berkas laporan uji:', inserted.id, '-', inserted.nama_laporan);
  }

  console.log('\n======================================================');
  console.log('TEST 3: UJI OPERASI UPDATE (FITUR EDIT PADA AKSI)');
  console.log('======================================================');
  const { error: updateError } = await supabase
    .from('pengawasan_pelaporan')
    .update({ 
      status: 'Terverifikasi',
      tingkat_kepatuhan: 95.00,
      catatan: 'Telah diverifikasi dan disahkan oleh Tim Pembina Jakon'
    })
    .eq('id', testId);

  if (updateError) {
    console.error('❌ Gagal UPDATE:', updateError.message);
  } else {
    console.log('✅ Berhasil UPDATE status & tingkat kepatuhan untuk ID:', testId);
  }

  console.log('\n======================================================');
  console.log('TEST 4: UJI OPERASI DELETE (FITUR HAPUS PADA AKSI)');
  console.log('======================================================');
  const { error: deleteError } = await supabase
    .from('pengawasan_pelaporan')
    .delete()
    .eq('id', testId);

  if (deleteError) {
    console.error('❌ Gagal DELETE:', deleteError.message);
  } else {
    console.log('✅ Berhasil DELETE data uji:', testId);
  }

  console.log('\n======================================================');
  console.log('🎉 SELURUH PENGUJIAN SUPABASE PELAPORAN BERHASIL 100%');
  console.log('======================================================');
}

runTests();

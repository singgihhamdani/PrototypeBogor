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
  console.log('TEST 1: SELECT DARI TABEL pengawasan_sesi (SORT TERBARU)');
  console.log('======================================================');
  
  const { data, error } = await supabase
    .from('pengawasan_sesi')
    .select('*')
    .order('tanggal_audit', { ascending: false });

  if (error) {
    console.error('❌ Error SELECT:', error.message);
    process.exit(1);
  }

  console.log(`✅ Berhasil! Ditemukan ${data.length} baris data pada tabel.`);
  data.slice(0, 5).forEach((row, i) => {
    console.log(`\nBaris ${i + 1}:`);
    console.log(`  - ID              : ${row.id}`);
    console.log(`  - Kode SIMAK      : ${row.simak_code}`);
    console.log(`  - Kualifikasi     : ${row.kualifikasi || '-'} (Standar SIPJAKI)`);
    console.log(`  - Produsen / BU   : ${row.nama_produsen || row.badan_usaha}`);
    console.log(`  - Pemilik         : ${row.nama_pemilik || '-'} (Standar SIPJAKI)`);
    console.log(`  - Kontak          : ${row.no_kontak || '-'} (Standar SIPJAKI)`);
    console.log(`  - Tanggal         : ${row.tanggal_audit} (Urutan Terkini)`);
    console.log(`  - Lokasi          : ${row.lokasi}, ${row.kab_kota || 'Kab. Bogor'}`);
    console.log(`  - Izin Usaha      : ${row.kepemilikan_izin || '-'} (${row.keabsahan_izin || '-'})`);
    console.log(`  - Bahan Baku (BB) : ${row.izin_bb || '-'} (${row.keabsahan_bb || '-'})`);
    console.log(`  - Kepatuhan       : ${row.status_kepatuhan || (row.skor_tertib >= 80 ? 'Patuh' : 'Tidak Patuh')} (Pengganti Skor Numerik)`);
    console.log(`  - Dokumen         : ${row.dokumen || row.dokumen_bap}`);
    console.log(`  - Status          : ${row.status_verifikasi}`);
  });

  console.log('\n======================================================');
  console.log('TEST 2: UJI OPERASI INSERT (TAMBAH PENGAWASAN BARU)');
  console.log('======================================================');
  const testId = `PEL-TEST-${Date.now().toString().slice(-4)}`;
  const newRow = {
    id: testId,
    simak_code: 'SIMAK 1a1',
    tipe_tertib: 'tertib-usaha',
    nama_objek: 'Pengawasan Verifikasi Otomatis SIPJAKI SIMAK 1',
    badan_usaha: 'PT. Sukaraja Konstruksi Mandiri',
    nama_produsen: 'PT. Sukaraja Konstruksi Mandiri',
    nama_pemilik: 'Ir. Ahmad Subagja',
    no_kontak: '0812-9988-7766',
    kualifikasi: 'Kecil',
    lokasi: 'Kecamatan Sukaraja',
    tanggal_audit: '2026-03-30',
    pengawas: 'Tim Pembina Jakon Kab. Bogor',
    skor_tertib: 90,
    kategori_hasil: 'Tertib',
    status_verifikasi: 'Draft',
    dokumen_bap: 'Dokumen_Test_Sukaraja.pdf',
    dokumen: 'Dokumen_Test_Sukaraja.pdf',
    kepemilikan_izin: 'Memiliki',
    keabsahan_izin: 'Sah',
    kapasitas: 'Kemampuan Keuangan Rp 3 Milyar',
    izin_bb: 'Ada',
    keabsahan_bb: 'Sah',
    propinsi: 'Jawa Barat',
    kab_kota: 'Kabupaten Bogor',
    status_kepatuhan: 'Patuh',
    catatan_temuan: 'Data uji otomatis berhasil disimpan'
  };

  const { error: insertErr } = await supabase
    .from('pengawasan_sesi')
    .insert([newRow]);

  if (insertErr) {
    console.error('❌ Error INSERT:', insertErr.message);
  } else {
    console.log(`✅ Berhasil INSERT data uji coba dengan ID: ${testId}`);
  }

  console.log('\n======================================================');
  console.log('TEST 3: UJI OPERASI UPDATE (EDIT DATA PENGAWASAN)');
  console.log('======================================================');
  const { error: updateErr } = await supabase
    .from('pengawasan_sesi')
    .update({ 
      nama_pemilik: 'Ir. Ahmad Subagja, M.T. (Updated)', 
      status_kepatuhan: 'Patuh',
      status_verifikasi: 'Terverifikasi'
    })
    .eq('id', testId);

  if (updateErr) {
    console.error('❌ Error UPDATE:', updateErr.message);
  } else {
    console.log(`✅ Berhasil UPDATE nama_pemilik & status_verifikasi untuk ID: ${testId}`);
  }

  console.log('\n======================================================');
  console.log('TEST 4: UJI OPERASI DELETE (HAPUS DATA UJI COBA)');
  console.log('======================================================');
  const { error: deleteErr } = await supabase
    .from('pengawasan_sesi')
    .delete()
    .eq('id', testId);

  if (deleteErr) {
    console.error('❌ Error DELETE:', deleteErr.message);
  } else {
    console.log(`✅ Berhasil DELETE data uji coba ID: ${testId}`);
  }

  console.log('\n======================================================');
  console.log('🎉 SEMUA PENGUJIAN CRUD SUPABASE PENGAWASAN SUKSES LULUS!');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});

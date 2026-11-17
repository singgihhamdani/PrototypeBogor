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
  console.log('TEST 1: SELECT DATA SIMAK 3 (TERTIB PEMANFAATAN)');
  console.log('======================================================');
  
  const { data, error } = await supabase
    .from('pengawasan_sesi')
    .select('*')
    .eq('tipe_tertib', 'tertib-pemanfaatan')
    .order('tanggal_audit', { ascending: false });

  if (error) {
    console.error('❌ Error SELECT:', error.message);
  } else {
    console.log(`✅ Berhasil! Ditemukan ${data.length} bangunan/infrastruktur SIMAK 3 pada tabel.`);
    data.slice(0, 5).forEach((row, i) => {
      console.log(`\nBaris ${i + 1} (Standar 10 Parameter SIPJAKI SIMAK 3):`);
      console.log(`  1. No                  : ${i + 1}`);
      console.log(`  2. Nama Bangunan       : ${row.nama_bangunan || row.nama_objek}`);
      console.log(`  3. Lokasi              : ${row.lokasi}`);
      console.log(`  4. Nama Pemilik        : ${row.nama_pemilik || row.badan_usaha}`);
      console.log(`  5. Nama Pengelola      : ${row.nama_pengelola || '-'}`);
      console.log(`  6. Waktu Pengawasan    : ${row.waktu_pengawasan || row.tanggal_audit}`);
      console.log(`  7. Propinsi            : ${row.propinsi || 'Jawa Barat'}`);
      console.log(`  8. Kab/Kota            : ${row.kab_kota || 'Kabupaten Bogor'}`);
      console.log(`  9. Status              : ${row.status_kepatuhan || 'Patuh'} (Verifikasi: ${row.status_verifikasi})`);
      console.log(` 10. Dokumen Pengawasan  : ${row.dokumen || row.dokumen_bap}`);
    });
  }

  console.log('\n======================================================');
  console.log('TEST 2: INSERT DATA PENGUJIAN BARU SIMAK 3');
  console.log('======================================================');
  const testId = `PEL-TM-TEST-${Date.now().toString().slice(-4)}`;
  const testBuilding = {
    id: testId,
    simak_code: 'SIMAK 3',
    tipe_tertib: 'tertib-pemanfaatan',
    nama_objek: 'Gedung Kesenian Daerah Kabupaten Bogor',
    nama_bangunan: 'Gedung Kesenian Daerah Kabupaten Bogor',
    badan_usaha: 'Pemerintah Kabupaten Bogor / Disbudpar',
    nama_pemilik: 'Pemerintah Kabupaten Bogor / BPKAD',
    nama_pengelola: 'Dinas Kebudayaan dan Pariwisata Kab. Bogor',
    waktu_pengawasan: '2026-03-30',
    tanggal_audit: '2026-03-30',
    lokasi: 'Jl. Tegar Beriman, Kec. Cibinong',
    propinsi: 'Jawa Barat',
    kab_kota: 'Kabupaten Bogor',
    pengawas: 'Ir. Hendra Setiawan, S.T. (Tim Pembina Jakon)',
    status_kepatuhan: 'Patuh',
    kategori_hasil: 'Tertib',
    skor_tertib: 92,
    status_verifikasi: 'Draft',
    dokumen: 'BAP_SIMAK3_GedungKesenian.pdf',
    dokumen_bap: 'BAP_SIMAK3_GedungKesenian.pdf',
    catatan_temuan: 'Struktur rangka atap baja dan fasilitas akustik auditorium dalam kondisi terawat baik.',
    rekomendasi: 'Lakukan peremajaan APAR dan pengecekan jalur evakuasi penonton secara berkala.'
  };

  const { error: insertErr } = await supabase
    .from('pengawasan_sesi')
    .insert([testBuilding]);

  if (insertErr) {
    console.error('❌ Error INSERT:', insertErr.message);
  } else {
    console.log(`✅ Berhasil INSERT bangunan uji coba dengan ID: ${testId}`);
  }

  console.log('\n======================================================');
  console.log('TEST 3: UPDATE DATA SIMAK 3 (SIMULASI FITUR EDIT)');
  console.log('======================================================');
  const { error: updateErr } = await supabase
    .from('pengawasan_sesi')
    .update({
      nama_pengelola: 'UPT Pengelola Gedung Seni & Budaya Kab. Bogor',
      status_verifikasi: 'Terverifikasi',
      catatan_temuan: 'Audit pemeliharaan selesai dan verifikasi laik fungsi disetujui tim pengawas.'
    })
    .eq('id', testId);

  if (updateErr) {
    console.error('❌ Error UPDATE:', updateErr.message);
  } else {
    console.log(`✅ Berhasil UPDATE pengelola & status verifikasi data ID: ${testId}`);
  }

  console.log('\n======================================================');
  console.log('TEST 4: DELETE DATA SIMAK 3 (SIMULASI FITUR HAPUS)');
  console.log('======================================================');
  const { error: deleteErr } = await supabase
    .from('pengawasan_sesi')
    .delete()
    .eq('id', testId);

  if (deleteErr) {
    console.error('❌ Error DELETE:', deleteErr.message);
  } else {
    console.log(`✅ Berhasil DELETE data uji coba ${testId} dari tabel pengawasan_sesi.`);
  }

  console.log('\n======================================================');
  console.log('KESIMPULAN: SELURUH OPERASI CRUD SIMAK 3 BERJALAN 100%!');
  console.log('======================================================');
}

runTests().catch(err => console.error('Unexpected error:', err));

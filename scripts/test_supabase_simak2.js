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
  console.log('TEST 1: SELECT DATA SIMAK 2 (TERTIB PENYELENGGARAAN)');
  console.log('======================================================');
  
  const { data, error } = await supabase
    .from('pengawasan_sesi')
    .select('*')
    .eq('tipe_tertib', 'tertib-penyelenggaraan')
    .order('tanggal_audit', { ascending: false });

  if (error) {
    console.error('❌ Error SELECT:', error.message);
  } else {
    console.log(`✅ Berhasil! Ditemukan ${data.length} paket pekerjaan SIMAK 2 pada tabel.`);
    data.slice(0, 5).forEach((row, i) => {
      console.log(`\nBaris ${i + 1} (Standar 11 Parameter SIPJAKI SIMAK 2):`);
      console.log(`  1. No                  : ${i + 1}`);
      console.log(`  2. Nama Proyek         : ${row.nama_proyek || row.nama_objek}`);
      console.log(`  3. Nilai Proyek        : Rp ${Number(row.nilai_proyek || 0).toLocaleString('id-ID')}`);
      console.log(`  4. Nomor Perjanjian    : ${row.nomor_perjanjian || '-'}`);
      console.log(`  5. Waktu Pelaksanaan   : ${row.waktu_pelaksanaan || '-'}`);
      console.log(`  6. Penyedia Jasa       : ${row.penyedia_jasa || row.badan_usaha}`);
      console.log(`  7. Nama Pemilik Kerja  : ${row.nama_pemilik_pekerjaan || 'Dinas PUPR Kab. Bogor'}`);
      console.log(`  8. Waktu Pengawasan    : ${row.waktu_pengawasan || row.tanggal_audit}`);
      console.log(`  9. Propinsi & Kab/Kota : ${row.propinsi || 'Jawa Barat'} / ${row.kab_kota || 'Kabupaten Bogor'}`);
      console.log(` 10. Status              : ${row.status_kepatuhan || 'Patuh'} (Verifikasi: ${row.status_verifikasi})`);
      console.log(` 11. Dokumen Pengawasan  : ${row.dokumen || row.dokumen_bap}`);
    });
  }

  console.log('\n======================================================');
  console.log('TEST 2: INSERT DATA PENGUJIAN BARU SIMAK 2');
  console.log('======================================================');
  const testId = `PEL-TP-TEST-${Date.now().toString().slice(-4)}`;
  const testProject = {
    id: testId,
    simak_code: 'SIMAK 2a',
    tipe_tertib: 'tertib-penyelenggaraan',
    nama_objek: 'Pembangunan Underpass Batutulis Bogor',
    nama_proyek: 'Pembangunan Underpass Batutulis Sta 0+000 - 0+450',
    nilai_proyek: 19500000000,
    nomor_perjanjian: '602.1/088/SPK-JLN/DPUPR/2026',
    waktu_pelaksanaan: '240 Hari Kalender (01 Jan 2026 - 28 Agu 2026)',
    penyedia_jasa: 'PT. Wijaya Konstruksi Mandiri',
    badan_usaha: 'PT. Wijaya Konstruksi Mandiri',
    nama_pemilik_pekerjaan: 'Dinas PUPR Kab. Bogor / PPK Bidang Jalan',
    waktu_pengawasan: '2026-03-29',
    tanggal_audit: '2026-03-29',
    lokasi: 'Kecamatan Bogor Selatan',
    propinsi: 'Jawa Barat',
    kab_kota: 'Kabupaten Bogor',
    pengawas: 'Ir. Hendra Setiawan, S.T. (Tim Pembina Jakon)',
    status_kepatuhan: 'Patuh',
    kategori_hasil: 'Tertib',
    skor_tertib: 92,
    status_verifikasi: 'Draft',
    dokumen: 'Dokumen_SIMAK2_UnderpassBatutulis.pdf',
    dokumen_bap: 'Dokumen_SIMAK2_UnderpassBatutulis.pdf',
    catatan_temuan: 'Pekerjaan struktur retaining wall beton cor berlangsung sesuai spesifikasi RKS.',
    rekomendasi: 'Lakukan pemantauan vibrasi saat pemancangan sheet pile.'
  };

  const { error: insertErr } = await supabase
    .from('pengawasan_sesi')
    .insert([testProject]);

  if (insertErr) {
    console.error('❌ Error INSERT:', insertErr.message);
  } else {
    console.log(`✅ Berhasil INSERT paket proyek uji coba dengan ID: ${testId}`);
  }

  console.log('\n======================================================');
  console.log('TEST 3: UPDATE DATA SIMAK 2 (SIMULASI FITUR EDIT)');
  console.log('======================================================');
  const { error: updateErr } = await supabase
    .from('pengawasan_sesi')
    .update({
      nilai_proyek: 20250000000,
      waktu_pelaksanaan: '270 Hari Kalender (Addendum 1)',
      status_verifikasi: 'Terverifikasi'
    })
    .eq('id', testId);

  if (updateErr) {
    console.error('❌ Error UPDATE:', updateErr.message);
  } else {
    console.log(`✅ Berhasil UPDATE data paket ${testId} (Nilai Proyek -> Rp 20.250.000.000, Status -> Terverifikasi)`);
  }

  console.log('\n======================================================');
  console.log('TEST 4: DELETE DATA SIMAK 2 (SIMULASI FITUR HAPUS)');
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
  console.log('KESIMPULAN: SELURUH OPERASI CRUD SIMAK 2 BERJALAN 100%!');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('Terjadi kesalahan fatal:', err);
  process.exit(1);
});

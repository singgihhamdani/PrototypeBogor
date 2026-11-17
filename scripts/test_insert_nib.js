const path = require('path');
const fs = require('fs');
const { createClient } = require(path.resolve(__dirname, '../prototype/node_modules/@supabase/supabase-js'));

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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testInsert() {
  const { data, error } = await supabase.from('pengawasan_sesi').insert([{
    id: 'TEST-NIB-COL',
    simak_code: '1.a.1',
    tipe_tertib: 'tertib-usaha',
    nama_objek: 'Test NIB',
    badan_usaha: 'Test BU',
    lokasi: 'Cibinong',
    nib: '1234567890'
  }]);
  if (error) {
    console.log('PostgREST returned error:', error.message);
  } else {
    console.log('SUCCESS! Column nib already exists in database!');
    await supabase.from('pengawasan_sesi').delete().eq('id', 'TEST-NIB-COL');
  }
}
testInsert();

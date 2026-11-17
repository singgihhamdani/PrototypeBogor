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

async function checkColumns() {
  const { data, error } = await supabase.from('pengawasan_sesi').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else if (data && data[0]) {
    console.log('Existing columns in pengawasan_sesi:');
    console.log(Object.keys(data[0]));
  }
}

checkColumns();

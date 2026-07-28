/* ---------- KONFIGURACJA SUPABASE ---------- */
const SUPABASE_URL = 'https://uhatlvlnlhzlknjlaqpd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Bo_PxUx9tuojImnHrsOA5g_yOah2Wj1';
const STORAGE_BUCKET = 'coffee-photos';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

/* funkcje do rozmowy z Supabase — pobieranie i zapisywanie danych oraz zdjęć */
export const sb = {
  async get(table, params = '') {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, { headers });
    if (!res.ok) throw new Error(`GET ${table} failed: ${res.status}`);
    return res.json();
  },
  async post(table, body) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST', headers, body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`POST ${table} failed: ${res.status}`);
    return res.json();
  },
  async patch(table, filter, body) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
      method: 'PATCH', headers, body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`PATCH ${table} failed: ${res.status}`);
    return res.json();
  },
  async uploadPhoto(file, path) {
    const uploadHeaders = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': file.type,
      'Cache-Control': '3600',
    };
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${path}`,
      { method: 'POST', headers: uploadHeaders, body: file }
    );
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
  },
};

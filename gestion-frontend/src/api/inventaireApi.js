const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '';

function authHeaders() {
  let token = localStorage.getItem('token');
  try { token = JSON.parse(token); } catch(e) {}
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

async function parseResponse(res) {
  const text = await res.text();
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { return JSON.parse(text); } catch(e) { throw new Error('Invalid JSON response'); }
  }
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  return text;
}

export async function listDemandes() {
  const res = await fetch(`${apiBase}/api/inventaires`, { method: 'GET', headers: authHeaders() });
  const parsed = await parseResponse(res);
  // backend returns ApiResponse { success, message, data }
  if (parsed && (parsed.data || parsed.success !== undefined)) {
    console.log('[inventaireApi] listDemandes -> parsed:', parsed);
    return parsed.data || [];
  }
  // fallback if endpoint returns raw array
  return Array.isArray(parsed) ? parsed : [];
}

export async function createDemande(payload) {
  const res = await fetch(`${apiBase}/api/inventaires/demandes`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
  return await parseResponse(res);
}

export async function validateDemande(id) {
  const res = await fetch(`${apiBase}/api/inventaires/${encodeURIComponent(id)}/validate`, { method: 'POST', headers: authHeaders() });
  return await parseResponse(res);
}

export async function performInventaire(inventaireId, payload) {
  const url = `${apiBase}/api/inventaires/perform`;
  const res = await fetch(url, { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
  return await parseResponse(res);
}

export default { listDemandes, createDemande, validateDemande, performInventaire };

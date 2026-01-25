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

export async function getStockPrecisionKpi(filters = {}) {
  const params = new URLSearchParams();
  if (filters.depotId) params.append('depotId', filters.depotId);
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
  if (filters.dateFin) params.append('dateFin', filters.dateFin);
  
  const url = `${apiBase}/api/stock/kpis/precision${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url, { method: 'GET', headers: authHeaders() });
  return await parseResponse(res);
}

export async function getCategories() {
  const url = `${apiBase}/api/categories`;
  const res = await fetch(url, { method: 'GET', headers: authHeaders() });
  return await parseResponse(res);
}

export async function getAjustementFormData(filters = {}) {
  const params = new URLSearchParams();
  if (filters.depotId) params.append('depotId', filters.depotId);
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
  if (filters.dateFin) params.append('dateFin', filters.dateFin);
  
  const url = `${apiBase}/api/stock/kpis/ajustement-form-data${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url, { method: 'GET', headers: authHeaders() });
  return await parseResponse(res);
}

export async function getArticlesRemaining(filters = {}) {
  const params = new URLSearchParams();
  if (filters.depotId) params.append('depotId', filters.depotId);
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  const url = `${apiBase}/api/stock/kpis/articles/remaining${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url, { method: 'GET', headers: authHeaders() });
  return await parseResponse(res);
}

export async function getRiskyLots(filters = {}) {
  const params = new URLSearchParams();
  if (filters.depotId) params.append('depotId', filters.depotId);
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
  if (filters.dateFin) params.append('dateFin', filters.dateFin);

  const url = `${apiBase}/api/stock/kpis/lots/risk${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url, { method: 'GET', headers: authHeaders() });
  return await parseResponse(res);
}

export default { getStockPrecisionKpi, getCategories, getAjustementFormData, getArticlesRemaining, getRiskyLots };

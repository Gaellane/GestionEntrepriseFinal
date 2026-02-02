const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '';

function authHeaders() {
  let token = localStorage.getItem('token');
  try { token = JSON.parse(token); } catch(e) {}
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

/**
 * Récupère le montant total des achats entre deux dates
 */
export async function getMontantTotalAchats(dateMin, dateMax) {
  const url = `${apiBase}/api/achats/kpi/montant-total-achats?dateMin=${dateMin}&dateMax=${dateMax}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders()
  });
  const data = await res.json();
  return data;
}

/**
 * Récupère le montant total des commandes entre deux dates
 */
export async function getMontantTotalCommandes(dateMin, dateMax) {
  const url = `${apiBase}/api/achats/kpi/montant-total-commandes?dateMin=${dateMin}&dateMax=${dateMax}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders()
  });
  const data = await res.json();
  return data;
}

/**
 * Récupère la comparaison entre prix d'estimation et prix réel
 */
export async function getComparaisonPrix(dateMin, dateMax) {
  const url = `${apiBase}/api/achats/kpi/comparaison-prix?dateMin=${dateMin}&dateMax=${dateMax}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders()
  });
  const data = await res.json();
  return data;
}

/**
 * Récupère le coût moyen par achat
 */
export async function getCoutMoyenParAchat(dateMin, dateMax) {
  const url = `${apiBase}/api/achats/kpi/cout-moyen?dateMin=${dateMin}&dateMax=${dateMax}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders()
  });
  const data = await res.json();
  return data;
}

/**
 * Récupère tous les KPIs en une seule fois
 */
export async function getAllKpis(dateMin, dateMax) {
  const url = `${apiBase}/api/achats/kpi/all?dateMin=${dateMin}&dateMax=${dateMax}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders()
  });
  const data = await res.json();
  return data;
}

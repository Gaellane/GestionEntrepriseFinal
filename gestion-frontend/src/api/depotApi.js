const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '';

function authHeaders() {
  let token = localStorage.getItem('token');
  try { token = JSON.parse(token); } catch(e) {}
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

/**
 * Récupère tous les dépôts
 */
export async function getAllDepots() {
  const url = `${apiBase}/api/depots`;
  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders()
  });
  const data = await res.json();
  return data;
}

/**
 * Récupère les dépôts de l'utilisateur connecté
 */
export async function getDepotsForCurrentUser() {
  const url = `${apiBase}/api/depots`;
  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders()
  });
  const data = await res.json();
  return data;
}

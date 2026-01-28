const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '';

function authHeaders() {
  let token = localStorage.getItem('token');
  try { token = JSON.parse(token); } catch(e) {}
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export async function getCategories() {
  const url = `${apiBase}/api/categories`;
  const res = await fetch(url, { method: 'GET', headers: authHeaders() });
  return (res);
}

export async function getArticles() {
  const url = `${apiBase}/api/articles`;
  const res = await fetch(url, { method: 'GET', headers: authHeaders() });
  return (res);
}

export async function getUnites() {
    const url = `${apiBase}/api/unites`;
    const res = await fetch(url, { method: 'GET', headers: authHeaders() });
    return (res);
}
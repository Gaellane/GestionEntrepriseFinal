const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '';

function authHeaders() {
  let token = localStorage.getItem('token');
  try { token = JSON.parse(token); } catch(e) {}
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export async function sendAchat(achatData) {
  const url = `${apiBase}/api/achats`;
  const res = await fetch(url, { 
    method: 'POST', 
    headers: authHeaders(),
    body: JSON.stringify(achatData)
  });
  return (res);
}

export async function fetchAchatAll() {
  const url = `${apiBase}/api/achats`;
  const res = await fetch(url, { 
    method: 'GET', 
    headers: authHeaders()
  });
  const data = await res.json();
  return data;
}
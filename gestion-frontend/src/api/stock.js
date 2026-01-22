const apiBase = import.meta.env.VITE_API_BASE || '';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export async function getFormData() {
  const res = await fetch(`${apiBase}/api/lot-mouvements/form-data`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function submitMovement(payload) {
  const res = await fetch(`${apiBase}/api/lot-mouvements/saisir`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default { getFormData, submitMovement };
const apiBase = import.meta.env.VITE_API_BASE || '';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

async function parseResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();
  // If JSON, parse and return; otherwise include the text in an error
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`Invalid JSON response (status ${res.status}): ${text}`);
    }
  }

  // Not JSON
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  // ok but not JSON -> return raw text
  return text;
}

export async function getFormData(movementType = 1) {
  const url = `${apiBase}/api/lot-mouvements/saisie?type=${encodeURIComponent(movementType)}`;
  console.log("Headers for getFormData:", authHeaders());
  const res = await fetch(url, { headers: authHeaders() });
  console.log("getFormData response status:", res.js);
  return res.json();  
}

export async function submitMovement(payload) {
  const res = await fetch(`${apiBase}/api/lot-mouvements/saisie`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });

  return await parseResponse(res);
}

export default { getFormData, submitMovement };
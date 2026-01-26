const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '';

function authHeaders() {
  let token = localStorage.getItem('token');
  
  if (token) {
    try {
      const parsed = JSON.parse(token);
      token = parsed;
    } catch (e) {
      // token is not JSON, keep as-is
    }
  }

  const headers = token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  return headers;
}

async function parseResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();
  
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`Invalid JSON response (status ${res.status}): ${text}`);
    }
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return text;
}

/**
 * Récupère tous les utilisateurs
 */
export async function getAllUtilisateurs() {
  const url = `${apiBase}/api/utilisateurs`;
  const headers = authHeaders();

  const res = await fetch(url, {
    method: 'GET',
    headers: headers,
  });

  if (!res.ok) {
    const errorData = await parseResponse(res);
    throw new Error(errorData.message || `HTTP ${res.status}`);
  }

  const data = await parseResponse(res);
  return data.data || data;
}

/**
 * Récupère un utilisateur par ID
 */
export async function getUtilisateurById(id) {
  const url = `${apiBase}/api/utilisateurs/${id}`;
  const headers = authHeaders();

  const res = await fetch(url, {
    method: 'GET',
    headers: headers,
  });

  if (!res.ok) {
    const errorData = await parseResponse(res);
    throw new Error(errorData.message || `HTTP ${res.status}`);
  }

  const data = await parseResponse(res);
  return data.data || data;
}

/**
 * Récupère un utilisateur par email
 */
export async function getUtilisateurByEmail(email) {
  const url = `${apiBase}/api/utilisateurs/email/${encodeURIComponent(email)}`;
  const headers = authHeaders();

  const res = await fetch(url, {
    method: 'GET',
    headers: headers,
  });

  if (!res.ok) {
    const errorData = await parseResponse(res);
    throw new Error(errorData.message || `HTTP ${res.status}`);
  }

  const data = await parseResponse(res);
  return data.data || data;
}

export default {
  getAllUtilisateurs,
  getUtilisateurById,
  getUtilisateurByEmail,
};

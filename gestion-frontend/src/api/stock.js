const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '';

function authHeaders() {
  let token = localStorage.getItem('token');
  console.log('Raw token from localStorage:', token);
  
  if (token) {
    try {
      // Si le token est stocké comme JSON, le parser
      const parsed = JSON.parse(token);
      token = parsed;
      console.log('Parsed token:', token);
    } catch (e) {
      // token is not JSON, keep as-is
      console.log('Token is not JSON, using as-is');
    }
  }

  const headers = token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  console.log('Auth headers:', headers);
  return headers;
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
  const headers = authHeaders();
  
  // Debug détaillé
  console.log("=== DEBUG getFormData ===");
  console.log("URL:", url);
  console.log("Raw token from localStorage:", localStorage.getItem('token'));
  console.log("Raw user from localStorage:", localStorage.getItem('user'));
  console.log("Headers:", headers);
  console.log("=========================");
  
  const res = await fetch(url, { 
    method: 'GET',
    headers,
    mode: 'cors'
  });
  console.log("getFormData response status:", res.status);
  return await parseResponse(res);
}

export async function submitMovement(payload) {
  const res = await fetch(`${apiBase}/api/lot-mouvements/saisie`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });

  return await parseResponse(res);
}

export async function submitMovements(payloads) {
  const res = await fetch(`${apiBase}/api/lot-mouvements/saisie`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payloads)
  });

  return await parseResponse(res);
}

export async function submitTransfer(payloads) {
  const res = await fetch(`${apiBase}/api/lot-mouvements/transfer`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payloads)
  });

  return await parseResponse(res);
}

export async function getLotMouvementsByArticle(articleId) {
  const url = `${apiBase}/api/lot-mouvements/by-article/${articleId}`;
  console.log('=== getLotMouvementsByArticle ===');
  console.log('URL:', url);
  console.log('ArticleId:', articleId);
  
  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders()
  });

  console.log('Response status:', res.status);
  const result = await parseResponse(res);
  console.log('Parsed result:', result);
  return result;
}

export default { getFormData, submitMovement, submitMovements, submitTransfer, getLotMouvementsByArticle };
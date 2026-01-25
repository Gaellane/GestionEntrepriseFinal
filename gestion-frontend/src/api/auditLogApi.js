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

export async function getAuditLogs(page = 0, size = 10, sortBy = 'actionTimestamp', direction = 'DESC') {
  const url = `${apiBase}/api/audit-logs?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`;
  const headers = authHeaders();

  const res = await fetch(url, {
    method: 'GET',
    headers: headers,
  });

  if (!res.ok) {
    const errorData = await parseResponse(res);
    throw new Error(errorData.message || `HTTP ${res.status}`);
  }

  return parseResponse(res);
}

export default {
  getAuditLogs,
};

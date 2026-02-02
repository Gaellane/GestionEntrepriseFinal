const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function authHeaders() {
  let token = localStorage.getItem('token');
  try { token = JSON.parse(token); } catch(e) {}
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export const aiApi = {
  chat: async (message) => {
    const response = await fetch(`${VITE_API_BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ prompt: message }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Chat request failed');
    }

    return response.json();
  },
};

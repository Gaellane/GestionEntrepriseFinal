const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const authApi = {
  login: async (credentials) => {
    console.log(`${VITE_API_BASE_URL}/login`);
    const response = await fetch(`${VITE_API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${VITE_API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    return response.json();
  },
};
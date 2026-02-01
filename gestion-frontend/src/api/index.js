export { authApi } from './authApi';
export { default as utilisateurApi } from './utilisateurApi';
export { default as roleApi } from './roleApi';
export * from './livraisonApi';
export * from './kpiApi';

import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const articleApi = {
    getAllArticles: async (params = {}) => {
        const { page = 0, size = 1000 } = params;
        const response = await api.get('/articles', { params: { page, size } });
        return response.data;
    },

    getArticleById: async (id) => {
        const response = await api.get(`/articles/${id}`);
        return response.data;
    }
};

export default api;

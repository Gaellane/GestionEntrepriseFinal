export { authApi } from './authApi';
export { default as utilisateurApi } from './utilisateurApi';
export { default as roleApi } from './roleApi';
export * from './livraisonApi';
export * from './kpiApi';

// Re-export API modules as named exports for backward compatibility
export { default as articleApi } from './articleApi';
export { default as clientApi } from './clientApi';
export { default as configurationApi } from './configurationApi';
export { default as proformaVenteApi } from './proformaVenteApi';
export { tarificationApi } from './tarificationApi';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + '/api';

const handleUnauthorized = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

const buildUrl = (path, params) => {
    const url = new URL(`${BASE_URL}${path}`);
    if (params) {
        Object.keys(params).forEach(k => {
            if (params[k] !== undefined && params[k] !== null) url.searchParams.set(k, params[k]);
        });
    }
    return url.toString();
};

const buildHeaders = (hasBody = false) => {
    const token = localStorage.getItem('token');
    const headers = {};
    if (hasBody) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
};

const wrapResponse = async (res) => {
    if (res.status === 401) {
        await handleUnauthorized();
        return Promise.reject(new Error('Unauthorized'));
    }
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
        const err = new Error(data?.message || res.statusText || 'Request failed');
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return { data, status: res.status };
};

const api = {
    get: async (path, options = {}) => {
        const url = buildUrl(path, options.params);
        const res = await fetch(url, { method: 'GET', headers: buildHeaders(false) });
        return wrapResponse(res);
    },
    post: async (path, body, options = {}) => {
        const url = buildUrl(path, options.params);
        const res = await fetch(url, { method: 'POST', headers: buildHeaders(true), body: JSON.stringify(body) });
        return wrapResponse(res);
    },
    put: async (path, body, options = {}) => {
        const url = buildUrl(path, options.params);
        const res = await fetch(url, { method: 'PUT', headers: buildHeaders(true), body: JSON.stringify(body) });
        return wrapResponse(res);
    },
    delete: async (path, options = {}) => {
        const url = buildUrl(path, options.params);
        const res = await fetch(url, { method: 'DELETE', headers: buildHeaders(false) });
        return wrapResponse(res);
    }
};

export default api;

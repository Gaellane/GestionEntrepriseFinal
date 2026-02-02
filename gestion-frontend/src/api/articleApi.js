import api from './index';

// Named functions for compatibility with existing imports
export const getAllArticles = async (pageOrOptions = 0, size = 10, sortBy = 'id', sortDir = 'ASC') => {
    let page = pageOrOptions;
    let sizeVal = size;
    let sortByVal = sortBy;
    let sortDirVal = sortDir;

    if (typeof pageOrOptions === 'object' && pageOrOptions !== null) {
        const opts = pageOrOptions;
        page = opts.page ?? 0;
        sizeVal = opts.size ?? 10;
        sortByVal = opts.sortBy ?? 'id';
        sortDirVal = opts.sortDir ?? 'ASC';
    }

    const res = await api.get('/articles', { params: { page, size: sizeVal, sortBy: sortByVal, sortDir: sortDirVal } });
    return res.data;
};

export const getAllArticlesNoPagination = async () => {
    const res = await api.get('/articles/all');
    return res.data;
};

export const getArticleById = async (id) => {
    const res = await api.get(`/articles/${id}`);
    return res.data;
};

export const searchArticles = async (searchTerm = '', page = 0, size = 10, sortBy = 'id', sortDir = 'ASC') => {
    const res = await api.get('/articles/search', { params: { searchTerm, page, size, sortBy, sortDir } });
    return res.data;
};

export const createArticle = async (articleData) => {
    const res = await api.post('/articles', articleData);
    return res.data;
};

export const updateArticle = async (id, articleData) => {
    const res = await api.put(`/articles/${id}`, articleData);
    return res.data;
};

export const deleteArticle = async (id) => {
    const res = await api.delete(`/articles/${id}`);
    return res.data;
};

export const getArticlesByCategorie = async (categorieId) => {
    const res = await api.get(`/articles/by-categorie/${categorieId}`);
    return res.data;
};

// Additional simple functions for backward compatibility
const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '';

function authHeaders() {
    let token = localStorage.getItem('token');
    try { token = JSON.parse(token); } catch(e) {}
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export async function getCategories() {
    const url = `${apiBase}/api/categories`;
    const res = await fetch(url, { method: 'GET', headers: authHeaders() });
    return res;
}

export async function getArticles() {
    const url = `${apiBase}/api/articles`;
    const res = await fetch(url, { method: 'GET', headers: authHeaders() });
    return res;
}

export async function getUnites() {
    const url = `${apiBase}/api/unites`;
    const res = await fetch(url, { method: 'GET', headers: authHeaders() });
    return res;
}

const articleApi = {
    getAllArticles,
    getAllArticlesNoPagination,
    getArticleById,
    searchArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    getArticlesByCategorie,
    getCategories,
    getArticles,
    getUnites
};

export default articleApi;

import api from './index';

export const getAllClients = async (pageOrOptions = 0, size = 10, sortBy = 'id', sortDir = 'asc') => {
    let page = pageOrOptions;
    let sizeVal = size;
    let sortByVal = sortBy;
    let sortDirVal = sortDir;

    if (typeof pageOrOptions === 'object' && pageOrOptions !== null) {
        const opts = pageOrOptions;
        page = opts.page ?? 0;
        sizeVal = opts.size ?? 10;
        sortByVal = opts.sortBy ?? 'id';
        sortDirVal = opts.sortDir ?? 'asc';
    }

    const res = await api.get('/clients', { params: { page, size: sizeVal, sortBy: sortByVal, sortDir: sortDirVal } });
    return res.data;
};

export const searchClients = async (searchTerm = '', page = 0, size = 10, sortBy = 'id', sortDir = 'asc') => {
    const res = await api.get('/clients/search', { params: { searchTerm, page, size, sortBy, sortDir } });
    return res.data;
};

export const searchClientsByName = async (clientNom) => {
    const res = await api.get('/clients/by-name', { params: { clientNom } });
    return res.data;
};

export const getClientById = async (id) => {
    const res = await api.get(`/clients/${id}`);
    return res.data;
};

export const createClient = async (clientData) => {
    const res = await api.post('/clients', clientData);
    return res.data;
};

export const updateClient = async (id, clientData) => {
    const res = await api.put(`/clients/${id}`, clientData);
    return res.data;
};

export const deleteClient = async (id) => {
    const res = await api.delete(`/clients/${id}`);
    return res.data;
};

const clientApi = {
    getAllClients,
    searchClients,
    searchClientsByName,
    getClientById,
    createClient,
    updateClient,
    deleteClient
};

export { clientApi };
export default clientApi;


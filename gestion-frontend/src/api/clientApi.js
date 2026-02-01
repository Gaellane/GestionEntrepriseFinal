import axiosInstance from './index';

const clientApi = {
    // Récupérer tous les clients avec pagination
    getAllClients: async (page = 0, size = 10, sortBy = 'id', sortDir = 'asc') => {
        const response = await axiosInstance.get('/clients', {
            params: { page, size, sortBy, sortDir }
        });
        return response.data;
    },

    // Rechercher des clients avec pagination
    searchClients: async (searchTerm = '', page = 0, size = 10, sortBy = 'id', sortDir = 'asc') => {
        const response = await axiosInstance.get('/clients/search', {
            params: { searchTerm, page, size, sortBy, sortDir }
        });
        return response.data;
    },

    // Rechercher des clients par nom (sans pagination)
    searchClientsByName: async (clientNom) => {
        const response = await axiosInstance.get('/clients/by-name', {
            params: { clientNom }
        });
        return response.data;
    },

    // Récupérer un client par ID
    getClientById: async (id) => {
        const response = await axiosInstance.get(`/clients/${id}`);
        return response.data;
    },

    // Créer un nouveau client
    createClient: async (clientData) => {
        const response = await axiosInstance.post('/clients', clientData);
        return response.data;
    },

    // Mettre à jour un client
    updateClient: async (id, clientData) => {
        const response = await axiosInstance.put(`/clients/${id}`, clientData);
        return response.data;
    },

    // Supprimer un client
    deleteClient: async (id) => {
        const response = await axiosInstance.delete(`/clients/${id}`);
        return response.data;
    }
};

export default clientApi;

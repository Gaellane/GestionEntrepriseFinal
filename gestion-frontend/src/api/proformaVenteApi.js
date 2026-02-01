import api from './index';

export const proformaVenteApi = {
    // Récupérer tous les pro-formas avec pagination
    getAllProformaVentes: async (params = {}) => {
        const { page = 0, size = 10, sortBy = 'dateEntree', sortDir = 'DESC' } = params;
        const response = await api.get('/proforma-ventes', {
            params: { page, size, sortBy, sortDir }
        });
        return response.data;
    },

    // Récupérer un pro-forma par ID
    getProformaVenteById: async (id) => {
        const response = await api.get(`/proforma-ventes/${id}`);
        return response.data;
    },

    // Créer un nouveau pro-forma
    createProformaVente: async (data) => {
        const response = await api.post('/proforma-ventes', data);
        return response.data;
    },

    // Mettre à jour un pro-forma
    updateProformaVente: async (id, data) => {
        const response = await api.put(`/proforma-ventes/${id}`, data);
        return response.data;
    },

    // Supprimer un pro-forma
    deleteProformaVente: async (id) => {
        const response = await api.delete(`/proforma-ventes/${id}`);
        return response.data;
    },

    // Changer le statut d'un pro-forma
    changerStatut: async (id, action, motif = '') => {
        const response = await api.post(`/proforma-ventes/${id}/workflow`, {
            action,
            motif
        });
        return response.data;
    },

    // Valider une remise exceptionnelle
    validerRemiseExceptionnelle: async (id, motif = '') => {
        const response = await api.post(`/proforma-ventes/${id}/valider-remise`, motif, {
            headers: {
                'Content-Type': 'text/plain'
            }
        });
        return response.data;
    }
};

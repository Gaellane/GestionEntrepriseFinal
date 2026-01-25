import api from './index';

/**
 * API pour la gestion des commandes clients (ventes)
 */

/**
 * Récupérer toutes les ventes avec pagination
 */
export const getAllVentes = async (params = {}) => {
    const { page = 0, size = 10, sort = 'dateEntree,desc' } = params;
    const response = await api.get('/ventes', {
        params: { page, size, sort }
    });
    return response.data;
};

/**
 * Récupérer une vente par ID
 */
export const getVenteById = async (id) => {
    const response = await api.get(`/ventes/${id}`);
    return response.data;
};

/**
 * Créer une vente depuis un pro-forma
 */
export const createFromProforma = async (proformaId, data) => {
    const response = await api.post(`/ventes/from-proforma/${proformaId}`, data);
    return response.data;
};

/**
 * Créer une vente directe (sans pro-forma)
 */
export const createDirectVente = async (data) => {
    const response = await api.post('/ventes', data);
    return response.data;
};

/**
 * Mettre à jour une vente
 */
export const updateVente = async (id, data) => {
    const response = await api.put(`/ventes/${id}`, data);
    return response.data;
};

/**
 * Supprimer une vente
 */
export const deleteVente = async (id) => {
    await api.delete(`/ventes/${id}`);
};

/**
 * Récupérer les pro-formas acceptés (pour transformation)
 */
export const getAcceptedProformas = async () => {
    const response = await api.get('/proforma-ventes', {
        params: { processValue: 30 } // Status "Accepté"
    });
    return response.data;
};

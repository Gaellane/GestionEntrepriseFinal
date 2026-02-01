import api from './index';

/**
 * API pour la gestion des livraisons de ventes
 */

/**
 * Récupérer les ventes à préparer (confirmées)
 */
export const getVentesAPreparer = async () => {
    const response = await api.get('/livraisons-vente/a-preparer');
    return response.data;
};

/**
 * Récupérer les lots disponibles pour une ligne de vente
 * @param {number} venteLigneId - ID de la ligne de vente
 * @param {string} methode - FIFO ou FEFO
 */
export const getLotsDisponibles = async (venteLigneId, methode = 'FIFO') => {
    const response = await api.get(`/livraisons-vente/lots-disponibles/${venteLigneId}`, {
        params: { methode }
    });
    return response.data;
};

/**
 * Créer une livraison
 * @param {number} venteId - ID de la vente
 * @param {Array} lignes - Lignes de livraison avec lots
 */
export const creerLivraison = async (venteId, lignes) => {
    const response = await api.post(`/livraisons-vente/creer/${venteId}`, { lignes });
    return response.data;
};

/**
 * Récupérer toutes les livraisons avec pagination
 */
export const getAllLivraisons = async (params = {}) => {
    const { page = 0, size = 10, sort = 'dateEntree,desc' } = params;
    const response = await api.get('/livraisons-vente', {
        params: { page, size, sort }
    });
    return response.data;
};

/**
 * Récupérer une livraison par ID
 */
export const getLivraisonById = async (id) => {
    const response = await api.get(`/livraisons-vente/${id}`);
    return response.data;
};

/**
 * Valider une livraison (marquer comme livrée)
 */
export const validerLivraison = async (id) => {
    const response = await api.put(`/livraisons-vente/${id}/valider`);
    return response.data;
};

/**
 * Annuler une livraison
 */
export const annulerLivraison = async (id, motif) => {
    const response = await api.put(`/livraisons-vente/${id}/annuler`, { motif });
    return response.data;
};

/**
 * Récupérer les livraisons par vente
 */
export const getLivraisonsByVente = async (venteId) => {
    const response = await api.get(`/livraisons-vente/vente/${venteId}`);
    return response.data;
};

import api from './index';

const tarificationApi = {
    // Récupérer tous les prix d'une entité
    getAllPrixByEntity: async (entityId) => {
        const res = await api.get(`/tarification/entity/${entityId}`);
        return res.data;
    },

    // Récupérer l'historique des prix pour un article entity
    getHistoriquePrix: async (articleEntityId) => {
        const res = await api.get(`/tarification/historique/${articleEntityId}`);
        return res.data;
    },

    // Récupérer le prix actuel d'un article entity
    getPrixActuel: async (articleEntityId) => {
        const res = await api.get(`/tarification/actuel/${articleEntityId}`);
        return res.data;
    },

    // Récupérer le dernier prix d'un article par son ID
    getLatestPrixByArticleId: async (articleId) => {
        try {
            const res = await api.get(`/tarification/article/${articleId}/latest`);
            return res.data;
        } catch (error) {
            console.error('Erreur lors de la récupération du prix:', error);
            return null;
        }
    },

    // Ajouter un nouveau prix
    ajouterNouveauPrix: async (prixData) => {
        const res = await api.post('/tarification', prixData);
        return res.data;
    },

    // Mettre à jour un prix
    updatePrix: async (prixId, prixData) => {
        const res = await api.put(`/tarification/${prixId}`, prixData);
        return res.data;
    },

    // Supprimer un prix
    deletePrix: async (prixId) => {
        const res = await api.delete(`/tarification/${prixId}`);
        return res.data;
    }
};

export { tarificationApi };

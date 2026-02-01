import axiosInstance from './index';

const tarificationApi = {
    // Récupérer tous les prix d'une entité
    getAllPrixByEntity: async (entityId) => {
        const response = await axiosInstance.get(`/tarification/entity/${entityId}`);
        return response.data;
    },

    // Récupérer l'historique des prix pour un article entity
    getHistoriquePrix: async (articleEntityId) => {
        const response = await axiosInstance.get(`/tarification/historique/${articleEntityId}`);
        return response.data;
    },

    // Récupérer le prix actuel d'un article entity
    getPrixActuel: async (articleEntityId) => {
        const response = await axiosInstance.get(`/tarification/actuel/${articleEntityId}`);
        return response.data;
    },

    // Récupérer le dernier prix d'un article par son ID
    getLatestPrixByArticleId: async (articleId) => {
        try {
            const response = await axiosInstance.get(`/tarification/article/${articleId}/latest`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération du prix:', error);
            return null;
        }
    },

    // Ajouter un nouveau prix
    ajouterNouveauPrix: async (prixData) => {
        const response = await axiosInstance.post('/tarification', prixData);
        return response.data;
    },

    // Mettre à jour un prix
    updatePrix: async (prixId, prixData) => {
        const response = await axiosInstance.put(`/tarification/${prixId}`, prixData);
        return response.data;
    },

    // Supprimer un prix
    deletePrix: async (prixId) => {
        const response = await axiosInstance.delete(`/tarification/${prixId}`);
        return response.data;
    }
};

export { tarificationApi };

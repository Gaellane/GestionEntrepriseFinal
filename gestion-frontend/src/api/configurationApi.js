import api from './index';

const configurationApi = {
    // Récupérer toutes les configurations
    getAllConfigurations: async () => {
        const res = await api.get('/configurations');
        return res.data;
    },

    // Récupérer une configuration par ID
    getConfigurationById: async (id) => {
        const res = await api.get(`/configurations/${id}`);
        return res.data;
    },

    // Récupérer une configuration par clé
    getConfigurationByKey: async (configKey) => {
        const res = await api.get(`/configurations/key/${configKey}`);
        return res.data;
    },

    // Récupérer la remise maximum pour un rôle
    getRemiseMaxByRole: async (roleCode) => {
        const res = await api.get(`/configurations/remise-max/${roleCode}`);
        return res.data;
    },

    // Créer une nouvelle configuration
    createConfiguration: async (configData) => {
        const res = await api.post('/configurations', configData);
        return res.data;
    },

    // Mettre à jour une configuration
    updateConfiguration: async (id, configData) => {
        const res = await api.put(`/configurations/${id}`, configData);
        return res.data;
    },

    // Supprimer une configuration
    deleteConfiguration: async (id) => {
        const res = await api.delete(`/configurations/${id}`);
        return res.data;
    }
};

export { configurationApi };
export default configurationApi;

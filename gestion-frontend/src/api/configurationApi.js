import axiosInstance from './index';

const configurationApi = {
    // Récupérer toutes les configurations
    getAllConfigurations: async () => {
        const response = await axiosInstance.get('/configurations');
        return response.data;
    },

    // Récupérer une configuration par ID
    getConfigurationById: async (id) => {
        const response = await axiosInstance.get(`/configurations/${id}`);
        return response.data;
    },

    // Récupérer une configuration par clé
    getConfigurationByKey: async (configKey) => {
        const response = await axiosInstance.get(`/configurations/key/${configKey}`);
        return response.data;
    },

    // Récupérer la remise maximum pour un rôle
    getRemiseMaxByRole: async (roleCode) => {
        const response = await axiosInstance.get(`/configurations/remise-max/${roleCode}`);
        return response.data;
    },

    // Créer une nouvelle configuration
    createConfiguration: async (configData) => {
        const response = await axiosInstance.post('/configurations', configData);
        return response.data;
    },

    // Mettre à jour une configuration
    updateConfiguration: async (id, configData) => {
        const response = await axiosInstance.put(`/configurations/${id}`, configData);
        return response.data;
    },

    // Supprimer une configuration
    deleteConfiguration: async (id) => {
        const response = await axiosInstance.delete(`/configurations/${id}`);
        return response.data;
    }
};

export default configurationApi;

import api from './index';

export const getAllProformaVentes = async (params = {}) => {
    const { page = 0, size = 10, sortBy = 'dateEntree', sortDir = 'DESC' } = params;
    const res = await api.get('/proforma-ventes', { params: { page, size, sortBy, sortDir } });
    return res.data;
};

export const getProformaVenteById = async (id) => {
    const res = await api.get(`/proforma-ventes/${id}`);
    return res.data;
};

export const createProformaVente = async (data) => {
    const res = await api.post('/proforma-ventes', data);
    return res.data;
};

export const updateProformaVente = async (id, data) => {
    const res = await api.put(`/proforma-ventes/${id}`, data);
    return res.data;
};

export const deleteProformaVente = async (id) => {
    const res = await api.delete(`/proforma-ventes/${id}`);
    return res.data;
};

export const changerStatut = async (id, action, motif = '') => {
    const res = await api.post(`/proforma-ventes/${id}/workflow`, { action, motif });
    return res.data;
};

export const envoyerProforma = async (id) => {
    const res = await api.post(`/proforma-ventes/${id}/envoyer`);
    return res.data;
};

export const accepterProforma = async (id, motif = '') => {
    const res = await api.post(`/proforma-ventes/${id}/accepter`, motif);
    return res.data;
};

export const refuserProforma = async (id, motif = '') => {
    const res = await api.post(`/proforma-ventes/${id}/refuser`, motif);
    return res.data;
};

export const transformerEnVente = async (id) => {
    const res = await api.post(`/proforma-ventes/${id}/transformer`);
    return res.data;
};

export const validerRemiseExceptionnelle = async (id, motif = '') => {
    // Use api.post (JSON) for now; backend should accept or this can be adjusted to use text/plain fetch if required
    const res = await api.post(`/proforma-ventes/${id}/valider-remise`, motif);
    return res.data;
};

export const proformaVenteApi = {
    getAllProformaVentes,
    getProformaVenteById,
    createProformaVente,
    updateProformaVente,
    deleteProformaVente,
    changerStatut,
    envoyerProforma,
    accepterProforma,
    refuserProforma,
    transformerEnVente,
    validerRemiseExceptionnelle
};

export default proformaVenteApi;


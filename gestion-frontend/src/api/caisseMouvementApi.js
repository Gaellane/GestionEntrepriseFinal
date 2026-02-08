import api from './index';

// Encaisser une vente
export const encaisserVente = async (venteId, montant, details = null) => {
  const response = await api.post('/caisse-mouvements/encaisser-vente', { 
    venteId, 
    montant, 
    details 
  });
  return response.data;
};

// Récupérer les mouvements de caisse pour une vente
export const getMouvementsByVente = async (venteId) => {
  const response = await api.get(`/caisse-mouvements/vente/${venteId}`);
  return response.data;
};

// Créer un mouvement de caisse générique
export const createMouvement = async (venteId, montant, typeMouvementId = null, entityId = null, details = null) => {
  const response = await api.post('/caisse-mouvements', {
    venteId,
    montant,
    typeMouvementId,
    entityId,
    details
  });
  return response.data;
};

// Récupérer tous les mouvements de caisse
export const getAllMouvements = async () => {
  const response = await api.get('/caisse-mouvements');
  return response.data;
};

// Récupérer le solde de caisse
export const getSoldeCaisse = async () => {
  const response = await api.get('/caisse-mouvements/solde');
  return response.data;
};

// Récupérer les statistiques de caisse (encaissements, remboursements, par type)
export const getStatsCaisse = async (dateDebut = null, dateFin = null) => {
  const params = {};
  if (dateDebut) params.dateDebut = dateDebut;
  if (dateFin) params.dateFin = dateFin;
  const response = await api.get('/caisse-mouvements/stats', { params });
  return response.data;
};
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
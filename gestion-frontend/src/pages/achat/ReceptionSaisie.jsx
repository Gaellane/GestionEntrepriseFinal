import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLivraisonByAchatId, saveReception } from '../../api/achatApi';
import { getDepotsForCurrentUser } from '../../api/depotApi';
import { 
  ClipboardDocumentCheckIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function ReceptionSaisie() {
  const { achatId } = useParams();
  const navigate = useNavigate();

  const [livraison, setLivraison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Données du formulaire
  const [lignes, setLignes] = useState([]);
  const [depots, setDepots] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Charger les dépôts
        const depotsData = await getDepotsForCurrentUser();
        setDepots(depotsData);
        
        // Charger la livraison
        const data = await getLivraisonByAchatId(achatId);
        setLivraison(data);

        // Initialiser les lignes avec les articles de la livraison
        if (data.livraisonAchatLignes) {
          const initialLignes = data.livraisonAchatLignes.map(ligne => ({
            articleId: ligne.articleId,
            articleNom: ligne.article.articleNom,
            articleRefe: ligne.article.refe,
            quantiteLivree: ligne.quantite,
            quantiteReceptionnee: ligne.quantite, // Par défaut, on réceptionne tout
            depotId: depotsData.length > 0 ? depotsData[0].id : null, // Premier dépôt par défaut
            unite: ligne.article.unite?.abreviation || ''
          }));
          setLignes(initialLignes);
        }

        console.log('Livraison loaded:', data);
        console.log('Dépôts loaded:', depotsData);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (achatId) {
      loadData();
    }
  }, [achatId]);

  const handleQuantiteChange = (index, value) => {
    const newLignes = [...lignes];
    newLignes[index].quantiteReceptionnee = parseFloat(value) || 0;
    setLignes(newLignes);
  };

  const handleDepotChange = (index, depotId) => {
    const newLignes = [...lignes];
    newLignes[index].depotId = parseInt(depotId);
    setLignes(newLignes);
  };

  const handleSave = async () => {
    // Vérifier qu'au moins une quantité est > 0
    const hasValidQuantity = lignes.some(ligne => ligne.quantiteReceptionnee > 0);
    if (!hasValidQuantity) {
      alert('Veuillez saisir au moins une quantité à réceptionner');
      return;
    }

    setSaving(true);
    try {
      const receptionData = {
        livraisonId: livraison.id,
        lignes: lignes
          .filter(ligne => ligne.quantiteReceptionnee > 0)
          .map(ligne => ({
            articleId: ligne.articleId,
            depotId: ligne.depotId,
            quantite: ligne.quantiteReceptionnee
          }))
      };

      console.log('Saving reception:', receptionData);
      const response = await saveReception(receptionData);

      if (response.ok) {
        alert('Réception enregistrée avec succès !');
        navigate(`/achats/fiche/${achatId}`);
      } else {
        const errorText = await response.text();
        alert('Erreur lors de l\'enregistrement de la réception: ' + errorText);
      }
    } catch (err) {
      console.error('Error saving reception:', err);
      alert('Une erreur est survenue lors de l\'enregistrement de la réception');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ? Les données saisies seront perdues.')) {
      navigate(`/achats/fiche/${achatId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la livraison...</p>
        </div>
      </div>
    );
  }

  if (error || !livraison) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error || 'Livraison non trouvée'}</p>
          <button
            onClick={() => navigate(`/achats/fiche/${achatId}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Retour
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Réception des Articles</h1>
              <p className="text-gray-600 mt-1">
                Livraison: <span className="font-semibold">{livraison.refe}</span>
              </p>
              <p className="text-sm text-gray-500">La référence de réception sera générée automatiquement</p>
            </div>
            <ClipboardDocumentCheckIcon className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* Informations de la livraison */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations de la livraison</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Bon de commande</p>
              <p className="font-semibold text-gray-900">{livraison.bonCommandeRefe}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date de livraison</p>
              <p className="font-semibold text-gray-900">
                {new Date(livraison.dateEntree).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        {/* Table des articles */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Articles à réceptionner</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qté Livrée</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qté Réceptionnée *</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dépôt *</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lignes.map((ligne, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{ligne.articleNom}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{ligne.articleRefe}</td>
                    <td className="px-4 py-3">
                      <span className="text-gray-900">
                        {ligne.quantiteLivree} {ligne.unite}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max={ligne.quantiteLivree}
                          step="0.01"
                          value={ligne.quantiteReceptionnee}
                          onChange={(e) => handleQuantiteChange(index, e.target.value)}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-gray-500">{ligne.unite}</span>
                      </div>
                      {ligne.quantiteReceptionnee > ligne.quantiteLivree && (
                        <p className="text-red-500 text-xs mt-1">
                          La quantité réceptionnée ne peut pas dépasser la quantité livrée
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={ligne.depotId}
                        onChange={(e) => handleDepotChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {depots.map(depot => (
                          <option key={depot.id} value={depot.id}>
                            {depot.depotName}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <XCircleIcon className="w-5 h-5" />
            <span>Annuler</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                <span>Enregistrer la réception</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

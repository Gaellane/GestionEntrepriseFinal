import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCommandeByAchatId, saveLivraison } from '../../api/achatApi';
import { 
  TruckIcon, 
  DocumentTextIcon, 
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function LivraisonSaisie() {
  const { achatId } = useParams();
  const navigate = useNavigate();

  const [bonCommande, setBonCommande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Données du formulaire
  const [refe, setRefe] = useState('');
  const [lignes, setLignes] = useState([]);

  useEffect(() => {
    const loadBonCommande = async () => {
      try {
        setLoading(true);
        const data = await getCommandeByAchatId(achatId);
        setBonCommande(data);

        // Initialiser les lignes avec les articles du bon de commande
        if (data.bonCommandeAchatLignes) {
          const initialLignes = data.bonCommandeAchatLignes.map(ligne => ({
            articleId: ligne.articleId,
            articleNom: ligne.article.articleNom,
            articleRefe: ligne.article.refe,
            quantiteCommandee: ligne.quantite,
            quantiteLivree: ligne.quantite, // Par défaut, on livre tout
            unite: ligne.article.unite?.abreviation || ''
          }));
          setLignes(initialLignes);
        }

        console.log('Bon de commande loaded:', data);
      } catch (err) {
        setError('Erreur lors du chargement du bon de commande');
        console.error('Error fetching bon de commande:', err);
      } finally {
        setLoading(false);
      }
    };

    if (achatId) {
      loadBonCommande();
    }
  }, [achatId]);

  const handleQuantiteChange = (index, value) => {
    const newLignes = [...lignes];
    newLignes[index].quantiteLivree = parseFloat(value) || 0;
    setLignes(newLignes);
  };

  const handleSave = async () => {
    if (!refe.trim()) {
      alert('Veuillez saisir une référence pour la livraison');
      return;
    }

    // Vérifier qu'au moins une quantité est > 0
    const hasValidQuantity = lignes.some(ligne => ligne.quantiteLivree > 0);
    if (!hasValidQuantity) {
      alert('Veuillez saisir au moins une quantité à livrer');
      return;
    }

    setSaving(true);
    try {
      const livraisonData = {
        bonCommandeId: bonCommande.id,
        refe: refe,
        lignes: lignes
          .filter(ligne => ligne.quantiteLivree > 0)
          .map(ligne => ({
            articleId: ligne.articleId,
            quantite: ligne.quantiteLivree
          }))
      };

      console.log('Saving livraison:', livraisonData);
      const response = await saveLivraison(livraisonData);

      if (response.ok) {
        alert('Livraison enregistrée avec succès !');
        navigate(`/achats/fiche/${achatId}`);
      } else {
        const errorText = await response.text();
        alert('Erreur lors de l\'enregistrement de la livraison: ' + errorText);
      }
    } catch (err) {
      console.error('Error saving livraison:', err);
      alert('Une erreur est survenue lors de l\'enregistrement de la livraison');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ? Les données saisies seront perdues.')) {
      navigate(`/achats/${achatId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du bon de commande...</p>
        </div>
      </div>
    );
  }

  if (error || !bonCommande) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error || 'Bon de commande non trouvé'}</p>
          <button
            onClick={() => navigate(`/achats/${achatId}`)}
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
              <h1 className="text-3xl font-bold text-gray-900">Réception de Livraison</h1>
              <p className="text-gray-600 mt-1">
                Bon de commande: <span className="font-semibold">{bonCommande.refe}</span>
              </p>
            </div>
            <TruckIcon className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* Informations du bon de commande */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations du bon de commande</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Fournisseur</p>
              <p className="font-semibold text-gray-900">{bonCommande.fournisseurNom}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Proforma</p>
              <p className="font-semibold text-gray-900">{bonCommande.proformaRefe}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Montant Total</p>
              <p className="font-semibold text-emerald-600">{bonCommande.montantTotal?.toFixed(2)} €</p>
            </div>
          </div>
        </div>

        {/* Formulaire de livraison */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails de la livraison</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Référence de la livraison *
            </label>
            <input
              type="text"
              value={refe}
              onChange={(e) => setRefe(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: LIV-2024-001"
            />
          </div>

          {/* Table des articles */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qté Commandée</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qté Livrée *</th>
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
                        {ligne.quantiteCommandee} {ligne.unite}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max={ligne.quantiteCommandee}
                          step="0.01"
                          value={ligne.quantiteLivree}
                          onChange={(e) => handleQuantiteChange(index, e.target.value)}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-gray-500">{ligne.unite}</span>
                      </div>
                      {ligne.quantiteLivree > ligne.quantiteCommandee && (
                        <p className="text-red-500 text-xs mt-1">
                          La quantité livrée ne peut pas dépasser la quantité commandée
                        </p>
                      )}
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
                <span>Enregistrer la livraison</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

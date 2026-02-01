import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCommandeByAchatId, downloadBonCommandePdf } from '../../../api/achatApi';
import { DocumentTextIcon, TruckIcon, CalendarIcon, CurrencyEuroIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function AchatBonCommande({ achat }) {
  const navigate = useNavigate();
  const [bonCommande, setBonCommande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBonCommande = async () => {
      try {
        setLoading(true);
        const data = await getCommandeByAchatId(achat.id);
        setBonCommande(data);
        console.log('Bon de commande loaded:', data);
      } catch (err) {
        setError('Erreur lors du chargement du bon de commande');
        console.error('Error fetching bon commande:', err);
      } finally {
        setLoading(false);
      }
    };

    if (achat?.id) {
      loadBonCommande();
    }
  }, [achat?.id]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleDownloadPdf = async () => {
    try {
      await downloadBonCommandePdf(bonCommande.id);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  if (error || !bonCommande) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center text-gray-500">
          <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>{error || 'Aucun bon de commande disponible'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Bon de Commande</h2>
              <p className="text-blue-100 text-sm">Référence: {bonCommande.refe}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span className="font-semibold">PDF</span>
            </button>
            { achat.process?.valeur < 40 && (
                <button
                onClick={() => navigate(`/achats/livraison/saisie/${achat.id}`)}
                className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
              <TruckIcon className="w-5 h-5" />
              <span className="font-semibold">Livrer</span>
            </button>
            ) }
          </div>
        </div>
      </div>

      {/* Info principale */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <TruckIcon className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Fournisseur</p>
              <p className="font-semibold text-gray-900">{bonCommande.fournisseurNom}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CalendarIcon className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Date d'entrée</p>
              <p className="font-semibold text-gray-900">
                {new Date(bonCommande.dateEntree).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <DocumentTextIcon className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Proforma</p>
              <p className="font-semibold text-gray-900">{bonCommande.proformaRefe}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <CurrencyEuroIcon className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Montant Total</p>
              <p className="font-bold text-emerald-600 text-lg">
                {bonCommande.montantTotal?.toFixed(2)} €
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Articles du bon de commande */}
      <div className="px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Articles commandés</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix unitaire
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bonCommande.bonCommandeAchatLignes && bonCommande.bonCommandeAchatLignes.length > 0 ? (
                bonCommande.bonCommandeAchatLignes.map((ligne, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {ligne.article?.articleNom || 'Article non spécifié'}
                        </div>
                        {ligne.article?.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {ligne.article.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {ligne.article?.refe || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {ligne.article?.categorie?.categorieName || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-gray-900">
                        {ligne.quantite}
                        {ligne.article?.unite?.abreviation && (
                          <span className="text-gray-500 ml-1">
                            {ligne.article.unite.abreviation}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-gray-900">{ligne.prixUnitaire?.toFixed(2)} €</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-emerald-600">
                        {(ligne.quantite * ligne.prixUnitaire)?.toFixed(2)} €
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    <p>Aucun article dans ce bon de commande</p>
                  </td>
                </tr>
              )}
              
              {bonCommande.bonCommandeAchatLignes && bonCommande.bonCommandeAchatLignes.length > 0 && (
                <tr className="bg-gray-50">
                  <td colSpan="5" className="px-4 py-3 text-right font-medium text-gray-700">
                    Total général :
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-xl text-emerald-600">
                      {bonCommande.montantTotal?.toFixed(2)} €
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

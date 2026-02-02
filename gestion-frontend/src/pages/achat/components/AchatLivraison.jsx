import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLivraisonByAchatId, downloadLivraisonPdf } from '../../../api/achatApi';
import { TruckIcon, CalendarIcon, CheckCircleIcon, ClipboardDocumentCheckIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function AchatLivraison({ achat }) {
  const navigate = useNavigate();
  const [livraison, setLivraison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLivraison = async () => {
      try {
        setLoading(true);
        const data = await getLivraisonByAchatId(achat.id);
        setLivraison(data);
        console.log('Livraison loaded:', data);
      } catch (err) {
        setError('Erreur lors du chargement de la livraison');
        console.error('Error fetching livraison:', err);
      } finally {
        setLoading(false);
      }
    };

    if (achat?.id) {
      loadLivraison();
    }
  }, [achat?.id]);

  const handleReceptionner = () => {
    navigate(`/achats/livraison/reception/${achat.id}`);
  };

  const handleDownloadPdf = async () => {
    try {
      await downloadLivraisonPdf(livraison.id);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

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

  if (error || !livraison) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center text-gray-500">
          <TruckIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>{error || 'Aucune livraison disponible'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TruckIcon className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Livraison</h2>
              <p className="text-emerald-100 text-sm">Référence: {livraison.refe}</p>
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
            {achat.process?.valeur < 45 && (
              <button
                onClick={handleReceptionner}
                className="flex items-center space-x-2 px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                <ClipboardDocumentCheckIcon className="w-5 h-5" />
                <span className="font-semibold">Réceptionner</span>
              </button>
            )}
          </div>
        </div> {/* ← ICI : Cette balise fermante manquait */}
      </div>

      {/* Info principale */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <CalendarIcon className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Date de livraison</p>
              <p className="font-semibold text-gray-900">
                {new Date(livraison.dateEntree).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="w-5 h-5 text-emerald-500 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Bon de commande</p>
              <p className="font-semibold text-gray-900">{livraison.bonCommandeRefe}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Articles livrés */}
      <div className="px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Articles livrés</h3>
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
                  Quantité livrée
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {livraison.livraisonAchatLignes && livraison.livraisonAchatLignes.length > 0 ? (
                livraison.livraisonAchatLignes.map((ligne, index) => (
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
                      <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800">
                        {ligne.article?.categorie?.categorieName || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-emerald-600">
                        {ligne.quantite}
                        {ligne.article?.unite?.abreviation && (
                          <span className="text-gray-500 ml-1">
                            {ligne.article.unite.abreviation}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    <p>Aucun article livré</p>
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
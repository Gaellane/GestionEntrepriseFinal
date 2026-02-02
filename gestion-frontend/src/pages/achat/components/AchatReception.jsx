import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReceptionByAchatId, cloturerAchat, downloadReceptionPdf } from '../../../api/achatApi';
import { ClipboardDocumentCheckIcon, CalendarIcon, CheckCircleIcon, XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function AchatReception({ achat, onReload }) {
  const navigate = useNavigate();
  const [reception, setReception] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cloturant, setCloturant] = useState(false);

  useEffect(() => {
    const loadReception = async () => {
      try {
        setLoading(true);
        const data = await getReceptionByAchatId(achat.id);
        setReception(data);
        console.log('Réception loaded:', data);
      } catch (err) {
        setError('Erreur lors du chargement de la réception');
        console.error('Error fetching reception:', err);
      } finally {
        setLoading(false);
      }
    };

    if (achat?.id) {
      loadReception();
    }
  }, [achat?.id]);

  const handleCloturer = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir clôturer cet achat ? Cette action est irréversible.')) {
      return;
    }

    setCloturant(true);
    try {
      const response = await cloturerAchat(achat.id);
      if (response.ok) {
        alert('Achat clôturé avec succès !');
        if (onReload) onReload();
      } else {
        const errorText = await response.text();
        alert('Erreur lors de la clôture: ' + errorText);
      }
    } catch (err) {
      console.error('Error cloturer achat:', err);
      alert('Une erreur est survenue lors de la clôture de l\'achat');
    } finally {
      setCloturant(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      await downloadReceptionPdf(reception.id);
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

  if (error || !reception) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center text-gray-500">
          <ClipboardDocumentCheckIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>{error || 'Aucune réception disponible'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ClipboardDocumentCheckIcon className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Réception</h2>
              <p className="text-purple-100 text-sm">Référence: {reception.refe}</p>
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
            {achat.process?.valeur === 45 && (
              <button
                onClick={handleCloturer}
                disabled={cloturant}
                className="flex items-center space-x-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cloturant ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                    <span className="font-semibold">Clôture...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    <span className="font-semibold">Clôturer</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info principale */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <CalendarIcon className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Date de réception</p>
              <p className="font-semibold text-gray-900">
                {new Date(reception.dateEntree).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="w-5 h-5 text-purple-500 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Bon de commande</p>
              <p className="font-semibold text-gray-900">{reception.bonCommandeRefe}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Articles réceptionnés */}
      <div className="px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Articles réceptionnés</h3>
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
                  Dépôt
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité réceptionnée
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reception.receptionAchatLignes && reception.receptionAchatLignes.length > 0 ? (
                reception.receptionAchatLignes.map((ligne, index) => (
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
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        {ligne.depot?.depotName || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-purple-600">
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
                    <p>Aucun article réceptionné</p>
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

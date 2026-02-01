import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TruckIcon, DocumentTextIcon, PlusCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { fetchProformaByAchatAndFournisseur } from '../../../api/achatApi';

export default function AchatCommandesList({ achat, commandes }) {
    const navigate = useNavigate();
    const [selectedProforma, setSelectedProforma] = useState(null);
    const [loadingProforma, setLoadingProforma] = useState(false);
    const [showProformaModal, setShowProformaModal] = useState(false);

    const handleViewProforma = async (fournisseurId) => {
        try {
            setLoadingProforma(true);
            const proforma = await fetchProformaByAchatAndFournisseur(achat.id, fournisseurId);
            setSelectedProforma({ data: proforma, fournisseurId });
            setShowProformaModal(true);
        } catch (error) {
            console.error('Error fetching proforma:', error);
            setSelectedProforma({ data: null, fournisseurId });
            setShowProformaModal(true);
        } finally {
            setLoadingProforma(false);
        }
    };

    const handleCreateProforma = (fournisseurId) => {
        navigate(`/achats/proforma/saisie/${achat.id}/${fournisseurId}`);
    };

    const closeModal = () => {
        setShowProformaModal(false);
        setSelectedProforma(null);
    };


  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Commandes fournisseurs</h2>
        <p className="text-sm text-gray-600 mt-1">
          {commandes?.length || 0} commande(s) passée(s)
        </p>
      </div>
      
      <div className="p-6">
        {commandes && commandes.length > 0 ? (
          <div className="space-y-4">
            {commandes.map((commande) => (
              <div 
                key={commande.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <TruckIcon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {commande.fournisseur?.fournisseurNom}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Commande #{commande.id}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleViewProforma(commande.fournisseur?.id)}
                    disabled={loadingProforma}
                    className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loadingProforma ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Chargement...</span>
                      </>
                    ) : (
                      <>
                        <DocumentTextIcon className="w-4 h-4" />
                        <span>Voir Proforma</span>
                      </>
                    )}
                  </button>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(commande.dateCommande).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(commande.dateCommande).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Contact</p>
                    <p className="text-sm text-gray-900">
                      {commande.fournisseur?.contact || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Adresse</p>
                    <p className="text-sm text-gray-900">
                      {commande.fournisseur?.adresse || 'N/A'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500">Coordonnées bancaires</p>
                    <p className="text-sm text-gray-900 font-mono">
                      {commande.fournisseur?.coordonneeBancaire || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <TruckIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Aucune commande fournisseur pour cet achat</p>
          </div>
        )}
      </div>

      {/* Modal Proforma */}
      {showProformaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header du modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                Détails du Proforma
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Contenu du modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {selectedProforma?.data && Object.keys(selectedProforma.data).length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3">Informations du Proforma</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-blue-600">Référence</p>
                        <p className="font-medium text-blue-900">{selectedProforma.data.reference || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-600">Date</p>
                        <p className="font-medium text-blue-900">
                          {selectedProforma.data.date ? new Date(selectedProforma.data.date).toLocaleDateString('fr-FR') : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-600">Montant Total</p>
                        <p className="font-medium text-blue-900">
                          {selectedProforma.data.montantTotal ? `${selectedProforma.data.montantTotal.toFixed(2)} €` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-600">Statut</p>
                        <p className="font-medium text-blue-900">{selectedProforma.data.statut || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Liste des lignes du proforma */}
                  {selectedProforma.data.lignes && selectedProforma.data.lignes.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Articles</h4>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix Unit.</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedProforma.data.lignes.map((ligne, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">{ligne.articleNom || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{ligne.quantite || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{ligne.prixUnitaire?.toFixed(2) || 'N/A'} €</td>
                                <td className="px-4 py-3 text-sm font-medium text-blue-600">
                                  {(ligne.quantite * ligne.prixUnitaire)?.toFixed(2) || 'N/A'} €
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Aucun proforma trouvé</h4>
                  <p className="text-gray-500 mb-6">
                    Aucun proforma n'a été créé pour ce fournisseur. Créez-en un maintenant.
                  </p>
                  <button
                    onClick={() => handleCreateProforma(selectedProforma?.fournisseurId)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:opacity-90 transition-all font-medium shadow-lg hover:shadow-xl"
                  >
                    <PlusCircleIcon className="w-5 h-5" />
                    Créer un Proforma
                  </button>
                </div>
              )}
            </div>

            {/* Footer du modal */}
            {selectedProforma?.data && Object.keys(selectedProforma.data).length > 0 && (
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={() => handleCreateProforma(selectedProforma?.fournisseurId)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Modifier le Proforma
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

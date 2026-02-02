import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { encaisserVente } from '../../api/caisseMouvementApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EncaissementVenteForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const venteIdParam = searchParams.get('venteId');
  const montantParam = searchParams.get('montant');

  const [formData, setFormData] = useState({
    venteId: venteIdParam ? parseInt(venteIdParam) : '',
    montant: montantParam ? parseFloat(montantParam) : '',
    details: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'montant' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.venteId) return setError("L'ID de la vente est requis");
    if (!formData.montant || formData.montant <= 0) return setError('Le montant doit être supérieur à 0');
    setLoading(true);
    setError(null);
    try {
      await encaisserVente(formData.venteId, formData.montant, formData.details || null);
      navigate(`/ventes/${formData.venteId}`, { state: { message: 'Encaissement enregistré avec succès' } });
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'encaissement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Encaissement de Vente</h1>
          <p className="text-gray-600 mt-2">Enregistrer un paiement client pour une commande validée</p>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire principal */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md">
              <div className="p-6 space-y-6">
                {/* ID Vente */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Commande Client
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="venteId"
                      value={formData.venteId}
                      onChange={handleChange}
                      disabled={!!venteIdParam}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Numéro de commande"
                      required
                    />
                    {venteIdParam && (
                      <div className="mt-2 flex items-center text-sm text-green-600">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Commande sélectionnée automatiquement
                      </div>
                    )}
                  </div>
                </div>

                {/* Montant */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Montant à encaisser (Ar)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-medium">Ar</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      name="montant"
                      value={formData.montant}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  {montantParam && (
                    <p className="mt-2 text-sm text-gray-500">
                      Montant suggéré depuis la commande: <span className="font-semibold">{parseFloat(montantParam).toFixed(2)} Ar</span>
                    </p>
                  )}
                </div>

                {/* Détails */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Détails du paiement
                  </label>
                  <textarea
                    name="details"
                    value={formData.details}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Mode de paiement, référence chèque/virement, remarques..."
                  />
                  <p className="mt-1 text-xs text-gray-500">Ex: Chèque n°123456, Espèces, Virement bancaire...</p>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                <button
                  type="button"
                  onClick={() => navigate(formData.venteId ? `/ventes/${formData.venteId}` : '/ventes')}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {loading ? 'Enregistrement...' : 'Valider l\'encaissement'}
                </button>
              </div>
            </form>
          </div>

          {/* Panneau d'informations */}
          <div className="lg:col-span-1 space-y-4">
            {/* Aide */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">
                    Informations importantes
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Seules les commandes validées peuvent être encaissées</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>L'encaissement sera automatiquement enregistré dans votre entité</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Cette action ne peut pas être annulée</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Guide rapide */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Guide rapide
              </h3>
              <ol className="text-sm text-gray-600 space-y-2">
                <li className="flex">
                  <span className="font-semibold text-green-600 mr-2">1.</span>
                  <span>Vérifiez le numéro de commande</span>
                </li>
                <li className="flex">
                  <span className="font-semibold text-green-600 mr-2">2.</span>
                  <span>Saisissez le montant encaissé</span>
                </li>
                <li className="flex">
                  <span className="font-semibold text-green-600 mr-2">3.</span>
                  <span>Indiquez le mode de paiement</span>
                </li>
                <li className="flex">
                  <span className="font-semibold text-green-600 mr-2">4.</span>
                  <span>Validez l'encaissement</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncaissementVenteForm;
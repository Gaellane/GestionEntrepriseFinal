import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { encaisserVente } from '../../api/caisseMouvementApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CaisseMouvementForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Récupérer les paramètres de l'URL
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
        setFormData(prev => ({
            ...prev,
            [name]: name === 'montant' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.venteId) {
            setError('L\'ID de la vente est requis');
            return;
        }
        
        if (!formData.montant || formData.montant <= 0) {
            setError('Le montant doit être supérieur à 0');
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            await encaisserVente(
                formData.venteId,
                formData.montant,
                formData.details || null
            );
            
            // Rediriger vers la page de détail de la vente
            navigate(`/ventes/${formData.venteId}`, {
                state: { message: 'Encaissement enregistré avec succès' }
            });
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'encaissement');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="p-6">
            <div className="max-w-2xl mx-auto">
                {/* En-tête */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Encaissement Vente</h1>
                    <p className="text-gray-600 mt-1">Enregistrer un paiement client</p>
                </div>

                {/* Messages d'erreur */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {/* Formulaire */}
                <div className="bg-white rounded-lg shadow p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* ID Vente */}
                        <div>
                            <label htmlFor="venteId" className="block text-sm font-medium text-gray-700 mb-1">
                                ID Vente *
                            </label>
                            <input
                                type="number"
                                id="venteId"
                                name="venteId"
                                value={formData.venteId}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={!!venteIdParam} // Désactiver si vient des params URL
                            />
                            {venteIdParam && (
                                <p className="text-sm text-gray-500 mt-1">
                                    ID récupéré automatiquement depuis la vente
                                </p>
                            )}
                        </div>

                        {/* Montant */}
                        <div>
                            <label htmlFor="montant" className="block text-sm font-medium text-gray-700 mb-1">
                                Montant (Ar) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                id="montant"
                                name="montant"
                                value={formData.montant}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                            {montantParam && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Montant prérempli depuis le total de la vente ({parseFloat(montantParam).toFixed(2)} Ar)
                                </p>
                            )}
                        </div>

                        {/* Détails */}
                        <div>
                            <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
                                Détails
                            </label>
                            <textarea
                                id="details"
                                name="details"
                                rows="3"
                                value={formData.details}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Informations complémentaires sur le paiement (mode de paiement, référence, etc.)"
                            />
                        </div>

                        {/* Informations */}
                        <div className="bg-blue-50 border border-blue-200 rounded p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">
                                        Informations importantes
                                    </h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li>Ce mouvement sera enregistré comme un encaissement</li>
                                            <li>Le type de mouvement par défaut sera utilisé automatiquement</li>
                                            <li>Cette action ne peut pas être annulée une fois validée</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => formData.venteId ? navigate(`/ventes/${formData.venteId}`) : navigate('/ventes')}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Enregistrement...' : 'Enregistrer l\'encaissement'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CaisseMouvementForm;
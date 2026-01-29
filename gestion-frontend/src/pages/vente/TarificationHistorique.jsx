import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tarificationApi from '../../api/tarificationApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TarificationHistorique = () => {
    const { articleEntityId } = useParams();
    const navigate = useNavigate();

    const [historique, setHistorique] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPrix, setNewPrix] = useState('');

    useEffect(() => {
        if (articleEntityId) {
            fetchHistorique();
        }
    }, [articleEntityId]);

    const fetchHistorique = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await tarificationApi.getHistoriquePrix(articleEntityId);
            setHistorique(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement de l\'historique');
            console.error('Error fetching historique:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPrix = async () => {
        try {
            setLoading(true);
            setError(null);
            await tarificationApi.ajouterNouveauPrix({
                articleEntityId: parseInt(articleEntityId),
                prix: parseFloat(newPrix)
            });
            setShowAddModal(false);
            setNewPrix('');
            fetchHistorique();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'ajout du prix');
            console.error('Error adding prix:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    };

    const calculateEvolution = (index) => {
        if (!historique || index >= historique.historique.length - 1) return null;

        const currentPrix = historique.historique[index].prix;
        const previousPrix = historique.historique[index + 1].prix;
        const evolution = ((currentPrix - previousPrix) / previousPrix) * 100;

        return {
            value: evolution,
            isPositive: evolution > 0
        };
    };

    if (loading && !historique) {
        return <LoadingSpinner />;
    }

    if (error && !historique) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
                <button
                    onClick={() => navigate('/tarification')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                    Retour
                </button>
            </div>
        );
    }

    if (!historique) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Historique des Prix</h1>
                    <p className="text-gray-600">Article: {historique.articleNom}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/tarification')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        Retour
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        + Ajouter un prix
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Informations de l'article */}
            <div className="bg-white rounded-lg shadow-md mb-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            Référence
                        </label>
                        <p className="text-lg font-semibold text-gray-900">{historique.articleReference}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            Article
                        </label>
                        <p className="text-lg font-semibold text-gray-900">{historique.articleNom}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            Entité
                        </label>
                        <p className="text-lg font-semibold text-gray-900">{historique.entityName}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            Prix Actuel
                        </label>
                        <p className="text-2xl font-bold text-green-600">
                            {historique.prixActuel ? formatCurrency(historique.prixActuel) : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Timeline de l'historique */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Évolution des Prix</h2>

                {historique.historique.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Aucun historique de prix disponible</p>
                ) : (
                    <div className="relative">
                        {/* Ligne verticale */}
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

                        {/* Liste des prix */}
                        <div className="space-y-6">
                            {historique.historique.map((item, index) => {
                                const evolution = calculateEvolution(index);
                                const isLatest = index === 0;

                                return (
                                    <div key={item.id} className="relative pl-16">
                                        {/* Point sur la timeline */}
                                        <div className={`absolute left-6 w-5 h-5 rounded-full border-4 ${isLatest ? 'bg-green-500 border-green-200' : 'bg-blue-500 border-blue-200'
                                            }`}></div>

                                        <div className={`p-4 rounded-lg border-2 ${isLatest ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
                                            }`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="text-2xl font-bold text-gray-800">
                                                            {formatCurrency(item.prix)}
                                                        </span>
                                                        {isLatest && (
                                                            <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                                                                ACTUEL
                                                            </span>
                                                        )}
                                                        {evolution && (
                                                            <span className={`flex items-center gap-1 text-sm font-semibold ${evolution.isPositive ? 'text-red-600' : 'text-green-600'
                                                                }`}>
                                                                {evolution.isPositive ? '↑' : '↓'} {Math.abs(evolution.value).toFixed(2)}%
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        {formatDate(item.dateEntree)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal d'ajout de prix */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Ajouter un nouveau prix</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Article: <span className="font-semibold">{historique.articleNom}</span>
                        </p>
                        {historique.prixActuel && (
                            <p className="text-sm text-gray-600 mb-4">
                                Prix actuel: <span className="font-semibold">{formatCurrency(historique.prixActuel)}</span>
                            </p>
                        )}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nouveau prix
                            </label>
                            <input
                                type="number"
                                value={newPrix}
                                onChange={(e) => setNewPrix(e.target.value)}
                                step="0.01"
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewPrix('');
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleAddPrix}
                                disabled={loading || !newPrix || parseFloat(newPrix) <= 0}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Ajout...' : 'Ajouter'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TarificationHistorique;

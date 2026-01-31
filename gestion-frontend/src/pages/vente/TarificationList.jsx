import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tarificationApi } from '../../api/tarificationApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TarificationList = () => {
    const navigate = useNavigate();
    const [prixList, setPrixList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Pour simplifier, on utilise l'entité 1 par défaut
    // Dans une application réelle, vous devriez avoir un sélecteur d'entité
    const [selectedEntityId] = useState(1);

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPrix, setFilteredPrix] = useState([]);

    useEffect(() => {
        fetchPrix();
    }, [selectedEntityId]);

    useEffect(() => {
        if (searchTerm) {
            const filtered = prixList.filter(item =>
                item.articleNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.articleReference.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredPrix(filtered);
        } else {
            setFilteredPrix(prixList);
        }
    }, [searchTerm, prixList]);

    const fetchPrix = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await tarificationApi.getAllPrixByEntity(selectedEntityId);

            // Grouper par article entity (ne garder que le prix le plus récent)
            const groupedByArticle = {};
            data.forEach(item => {
                if (!groupedByArticle[item.articleEntityId] ||
                    new Date(item.dateEntree) > new Date(groupedByArticle[item.articleEntityId].dateEntree)) {
                    groupedByArticle[item.articleEntityId] = item;
                }
            });

            const uniquePrix = Object.values(groupedByArticle);
            setPrixList(uniquePrix);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des prix');
            console.error('Error fetching prix:', err);
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
        return new Intl.NumberFormat('fr-MG', {
            style: 'currency',
            currency: 'MGA',
            currencyDisplay: 'symbol'
        }).format(value);
    };

    if (loading && prixList.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Consultation des Prix Articles</h1>
                <p className="text-gray-600">Prix de vente des articles par entité</p>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Barre de recherche */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex gap-4 items-center">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Rechercher un article (nom ou référence)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                            Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            {/* Tableau des prix */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Référence
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Article
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Entité
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Prix Actuel
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dernière Mise à Jour
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPrix.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                        {searchTerm ? 'Aucun article trouvé' : 'Aucun prix disponible'}
                                    </td>
                                </tr>
                            ) : (
                                filteredPrix.map((item) => (
                                    <tr key={item.articleEntityId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                                            {item.articleReference}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {item.articleNom}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.entityName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                                            {formatCurrency(item.prix)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(item.dateEntree)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => navigate(`/tarification/historique/${item.articleEntityId}`)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Voir Historique
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Stats */}
                {filteredPrix.length > 0 && (
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                        <div className="text-sm text-gray-700">
                            {filteredPrix.length} article{filteredPrix.length > 1 ? 's' : ''} trouvé{filteredPrix.length > 1 ? 's' : ''}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TarificationList;

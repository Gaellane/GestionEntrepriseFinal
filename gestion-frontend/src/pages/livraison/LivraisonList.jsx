import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllLivraisons, validerLivraison, annulerLivraison } from '../../api/livraisonApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';

const LivraisonList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [livraisons, setLivraisons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        loadLivraisons();
    }, [page]);

    const loadLivraisons = async () => {
        setLoading(true);
        try {
            const response = await getAllLivraisons({ page, size: 10 });
            setLivraisons(response.content || response || []);
            setTotalPages(response.totalPages || 1);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des livraisons');
        } finally {
            setLoading(false);
        }
    };

    const handleValider = async (id) => {
        if (!window.confirm('Confirmer la livraison effectuée ?')) return;
        try {
            await validerLivraison(id);
            loadLivraisons();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de la validation');
        }
    };

    const handleAnnuler = async (id) => {
        const motif = window.prompt('Motif d\'annulation :');
        if (!motif) return;
        try {
            await annulerLivraison(id, motif);
            loadLivraisons();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de l\'annulation');
        }
    };

    const getStatusBadge = (status, valeur) => {
        const statusConfig = {
            'En cours': 'bg-yellow-100 text-yellow-800',
            'Prête': 'bg-blue-100 text-blue-800',
            'Livrée': 'bg-green-100 text-green-800',
            'Annulée': 'bg-red-100 text-red-800',
        };
        const colorClass = statusConfig[status] || 'bg-gray-100 text-gray-800';
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                {status}
            </span>
        );
    };

    const filteredLivraisons = livraisons.filter(liv => {
        const matchSearch = liv.refe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            liv.venteRefe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            liv.clientNom?.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterStatus === 'all') return matchSearch;
        return matchSearch && liv.processName === filterStatus;
    });

    if (loading) return <LoadingSpinner />;

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Livraisons</h1>
                <button
                    onClick={() => navigate('/livraison/enregistrement')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    + Nouvelle Livraison
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Filtres */}
            <div className="mb-4 flex gap-4 flex-wrap">
                <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded w-64"
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded"
                >
                    <option value="all">Tous les statuts</option>
                    <option value="En cours">En cours</option>
                    <option value="Prête">Prête</option>
                    <option value="Livrée">Livrée</option>
                    <option value="Annulée">Annulée</option>
                </select>
            </div>

            {/* Tableau */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Référence
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Commande
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Client
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Lieu
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredLivraisons.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                        Aucune livraison trouvée
                                    </td>
                                </tr>
                            ) : (
                                filteredLivraisons.map((livraison) => (
                                    <tr key={livraison.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                            {livraison.refe}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {livraison.venteRefe}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {livraison.clientNom}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {livraison.dateEntree && new Date(livraison.dateEntree).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {livraison.lieuLivraison}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(livraison.processName, livraison.processValeur)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <button
                                                onClick={() => navigate(`/livraison/${livraison.id}`)}
                                                className="text-blue-600 hover:text-blue-800 mr-3"
                                            >
                                                Détails
                                            </button>
                                            {livraison.processValeur < 90 && (
                                                <>
                                                    <button
                                                        onClick={() => handleValider(livraison.id)}
                                                        className="text-green-600 hover:text-green-800 mr-3"
                                                    >
                                                        Valider
                                                    </button>
                                                    <button
                                                        onClick={() => handleAnnuler(livraison.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Annuler
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-3 flex justify-between items-center border-t">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Précédent
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {page + 1} sur {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Suivant
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LivraisonList;

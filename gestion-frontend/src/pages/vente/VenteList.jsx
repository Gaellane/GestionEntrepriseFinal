import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllVentes, deleteVente } from '../../api/venteApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';

const VenteList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ventes, setVentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadVentes();
    }, [page]);

    const loadVentes = async () => {
        setLoading(true);
        try {
            const response = await getAllVentes({ page, size: 10 });
            setVentes(response.content || []);
            setTotalPages(response.totalPages || 0);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des commandes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
            return;
        }

        try {
            await deleteVente(id);
            loadVentes();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const canDelete = user?.role?.roleCode === 'ADMIN';

    const filteredVentes = ventes.filter(vente =>
        vente.refe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vente.clientNom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vente.proformaRefe?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <LoadingSpinner />;

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Commandes Clients</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/ventes/nouveau/transformation')}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Depuis Pro-forma
                    </button>
                    <button
                        onClick={() => navigate('/ventes/nouveau')}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        + Nouvelle Commande
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Barre de recherche */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Rechercher par référence, client, pro-forma..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded"
                />
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
                                    Client
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Date Effective
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Date Livraison
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Pro-forma
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Total TTC
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
                            {filteredVentes.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                        Aucune commande trouvée
                                    </td>
                                </tr>
                            ) : (
                                filteredVentes.map((vente) => (
                                    <tr key={vente.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-medium text-blue-600">{vente.refe}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {vente.clientNom}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(vente.dateEffective).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {vente.dateLivraison
                                                ? new Date(vente.dateLivraison).toLocaleDateString('fr-FR')
                                                : '-'
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {vente.proformaRefe ? (
                                                <span className="text-sm text-gray-600">{vente.proformaRefe}</span>
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">Directe</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-semibold">
                                                {vente.prixTotal?.toFixed(2)} €
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {vente.processName || 'En cours'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => navigate(`/ventes/${vente.id}`)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                Voir
                                            </button>
                                            <button
                                                onClick={() => navigate(`/ventes/${vente.id}/modifier`)}
                                                className="text-green-600 hover:text-green-900 mr-3"
                                            >
                                                Modifier
                                            </button>
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDelete(vente.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Supprimer
                                                </button>
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
                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setPage(Math.max(0, page - 1))}
                                disabled={page === 0}
                                className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Précédent
                            </button>
                            <span className="text-sm text-gray-700">
                                Page {page + 1} sur {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                disabled={page >= totalPages - 1}
                                className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VenteList;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { proformaVenteApi } from '../../api/proformaVenteApi';

const ProformaVenteList = () => {
    const [proformas, setProformas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState('dateEntree');
    const [sortDir, setSortDir] = useState('DESC');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [proformaToDelete, setProformaToDelete] = useState(null);

    useEffect(() => {
        loadProformas();
    }, [page, pageSize, sortBy, sortDir]);

    const loadProformas = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await proformaVenteApi.getAllProformaVentes({
                page,
                size: pageSize,
                sortBy,
                sortDir
            });

            setProformas(response.content || []);
            setTotalPages(response.totalPages || 0);
            setTotalElements(response.totalElements || 0);
        } catch (err) {
            console.error('Erreur lors du chargement des pro-formas:', err);
            setError('Impossible de charger les pro-formas');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDir(sortDir === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(field);
            setSortDir('ASC');
        }
        setPage(0);
    };

    const handleDelete = async () => {
        if (!proformaToDelete) return;

        try {
            setLoading(true);
            await proformaVenteApi.deleteProformaVente(proformaToDelete.id);
            setShowDeleteModal(false);
            setProformaToDelete(null);
            loadProformas();
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
            setError('Erreur lors de la suppression du pro-forma');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const SortIcon = ({ field }) => {
        if (sortBy !== field) return <span className="text-gray-400">⇅</span>;
        return sortDir === 'ASC' ? <span className="text-blue-500">↑</span> : <span className="text-blue-500">↓</span>;
    };

  const getStatusColor = (processName) => {
    const statusColors = {
      'Brouillon': 'bg-gray-200 text-gray-700',
      'Envoyé': 'bg-blue-100 text-blue-700',
      'Accepté': 'bg-green-100 text-green-700',
      'Refusé': 'bg-red-100 text-red-700',
      'Transformé en commande': 'bg-purple-100 text-purple-700'
    };
    return statusColors[processName] || 'bg-gray-100 text-gray-600';
  };

  return (
        <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Pro-formas de Vente</h1>
                    <Link
                        to="/proforma-ventes/nouveau"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        + Nouveau Pro-forma
                    </Link>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <p className="mt-4 text-gray-600">Chargement...</p>
                    </div>
                )}

                {!loading && proformas.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-lg">Aucun pro-forma trouvé</p>
                        <Link
                            to="/proforma-ventes/nouveau"
                            className="mt-4 inline-block text-blue-500 hover:underline"
                        >
                            Créer votre premier pro-forma
                        </Link>
                    </div>
                )}

                {!loading && proformas.length > 0 && (
                    <>
                        {/* Contrôles de pagination */}
                        <div className="mb-4 flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <span className="text-gray-600">Afficher</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(parseInt(e.target.value));
                                        setPage(0);
                                    }}
                                    className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                </select>
                                <span className="text-gray-600">par page</span>
                            </div>
                            <div className="text-gray-600">
                                Total: {totalElements} pro-forma{totalElements > 1 ? 's' : ''}
                            </div>
                        </div>

                        {/* Tableau */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th
                                            className="px-4 py-3 border-b text-left cursor-pointer hover:bg-gray-200"
                                            onClick={() => handleSort('refe')}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span>Référence</span>
                                                <SortIcon field="refe" />
                                            </div>
                                        </th>
                                        <th
                                            className="px-4 py-3 border-b text-left cursor-pointer hover:bg-gray-200"
                                            onClick={() => handleSort('dateEntree')}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span>Date</span>
                                                <SortIcon field="dateEntree" />
                                            </div>
                                        </th>
                                        <th
                                            className="px-4 py-3 border-b text-left cursor-pointer hover:bg-gray-200"
                                            onClick={() => handleSort('clientNom')}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span>Client</span>
                                                <SortIcon field="clientNom" />
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 border-b text-center">Lignes</th>
                                        <th
                                            className="px-4 py-3 border-b text-right cursor-pointer hover:bg-gray-200"
                                            onClick={() => handleSort('prixTotal')}
                                        >
                                            <div className="flex items-center justify-end space-x-2">
                                                <span>Total TTC</span>
                                                <SortIcon field="prixTotal" />
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 border-b text-center">Processus</th>
                                        <th className="px-4 py-3 border-b text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {proformas.map((proforma) => (
                                        <tr key={proforma.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 border-b">
                                                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                    {proforma.refe}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 border-b text-sm">
                                                {formatDate(proforma.dateEntree)}
                                            </td>
                                            <td className="px-4 py-3 border-b font-semibold">
                                                {proforma.clientNom}
                                            </td>
                                            <td className="px-4 py-3 border-b text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold">
                                                    {proforma.lignes?.length || 0}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 border-b text-right font-bold text-green-600">
                                                {proforma.prixTotal?.toFixed(2)} €
                                            </td>
                                            <td className="px-4 py-3 border-b text-center">
                                                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(proforma.processName)}`}>
                                                    {proforma.processName}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 border-b text-center">
                                                <div className="flex justify-center space-x-2">
                                                    <Link
                                                        to={`/proforma-ventes/${proforma.id}`}
                                                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                                                    >
                                                        Détails
                                                    </Link>
                                                    <Link
                                                        to={`/proforma-ventes/${proforma.id}/modifier`}
                                                        className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition-colors"
                                                    >
                                                        Modifier
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            setProformaToDelete(proforma);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                                                    >
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 flex justify-center items-center space-x-2">
                            <button
                                onClick={() => setPage(Math.max(0, page - 1))}
                                disabled={page === 0}
                                className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                            >
                                Précédent
                            </button>
                            <span className="px-4 py-2 text-gray-700">
                                Page {page + 1} sur {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                disabled={page >= totalPages - 1}
                                className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                            >
                                Suivant
                            </button>
                        </div>
                    </>
                )}

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Confirmer la suppression</h3>
                        <p className="mb-6 text-gray-600">
                            Êtes-vous sûr de vouloir supprimer le pro-forma{' '}
                            <span className="font-semibold">{proformaToDelete?.refe}</span> ?
                            Cette action est irréversible.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setProformaToDelete(null);
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProformaVenteList;

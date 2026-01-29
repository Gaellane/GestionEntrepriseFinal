import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLivraisonById, validerLivraison, annulerLivraison } from '../../api/livraisonApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const LivraisonDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [livraison, setLivraison] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadLivraison();
    }, [id]);

    const loadLivraison = async () => {
        setLoading(true);
        try {
            const response = await getLivraisonById(id);
            setLivraison(response);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleValider = async () => {
        if (!window.confirm('Confirmer la livraison effectuée ?')) return;
        try {
            await validerLivraison(id);
            loadLivraison();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de la validation');
        }
    };

    const handleAnnuler = async () => {
        const motif = window.prompt('Motif d\'annulation :');
        if (!motif) return;
        try {
            await annulerLivraison(id, motif);
            loadLivraison();
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
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
                {status}
            </span>
        );
    };

    if (loading) return <LoadingSpinner />;

    if (error) {
        return (
            <div className="p-6">
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                </div>
            </div>
        );
    }

    if (!livraison) return null;

    return (
        <div className="p-6">
            {/* En-tête */}
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Livraison {livraison.refe}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Commande: {livraison.venteRefe}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {getStatusBadge(livraison.processName, livraison.processValeur)}

                    {livraison.processValeur < 90 && (
                        <>
                            <button
                                onClick={handleValider}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Valider Livraison
                            </button>
                            <button
                                onClick={handleAnnuler}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Annuler
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Informations livraison</h2>
                    <dl className="space-y-3">
                        <div className="flex justify-between">
                            <dt className="text-gray-600">Date création:</dt>
                            <dd className="font-medium">
                                {new Date(livraison.dateEntree).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-600">Lieu de livraison:</dt>
                            <dd className="font-medium">{livraison.lieuLivraison}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-600">Livreur:</dt>
                            <dd className="font-medium">{livraison.livreurNom || '-'}</dd>
                        </div>
                    </dl>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Client</h2>
                    <dl className="space-y-3">
                        <div className="flex justify-between">
                            <dt className="text-gray-600">Nom:</dt>
                            <dd className="font-medium">{livraison.clientNom}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-600">Contact:</dt>
                            <dd className="font-medium">{livraison.clientContact || '-'}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-600">Adresse:</dt>
                            <dd className="font-medium">{livraison.clientAdresse || '-'}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Lignes de livraison */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold">Articles livrés</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Article
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Lot
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Dépôt
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Quantité
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Prix Unit.
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Montant
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {livraison.lignes?.map((ligne, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium">{ligne.articleNom}</div>
                                        <div className="text-sm text-gray-500">{ligne.articleRefe}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {ligne.lotRefe}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {ligne.depotNom}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        {ligne.quantite}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        {ligne.prixUnitaire?.toLocaleString('fr-FR')} Ar
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                                        {(ligne.quantite * ligne.prixUnitaire)?.toLocaleString('fr-FR')} Ar
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                            <tr>
                                <td colSpan="5" className="px-6 py-3 text-right font-semibold">
                                    Total:
                                </td>
                                <td className="px-6 py-3 text-right font-bold">
                                    {livraison.lignes?.reduce((sum, l) => sum + (l.quantite * l.prixUnitaire), 0)?.toLocaleString('fr-FR')} Ar
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Bouton retour */}
            <div className="mt-6">
                <button
                    onClick={() => navigate('/livraison/liste')}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                    ← Retour à la liste
                </button>
            </div>
        </div>
    );
};

export default LivraisonDetail;

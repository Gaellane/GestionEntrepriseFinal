import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVenteById, deleteVente } from '../../api/venteApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';

const VenteDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [vente, setVente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadVente();
    }, [id]);

    const loadVente = async () => {
        setLoading(true);
        try {
            const data = await getVenteById(id);
            setVente(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement de la commande');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
            return;
        }

        try {
            await deleteVente(id);
            navigate('/ventes');
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const canDelete = user?.role?.roleCode === 'ADMIN';

    if (loading) return <LoadingSpinner />;
    if (error) {
        return (
            <div className="p-6">
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                </div>
                <button
                    onClick={() => navigate('/ventes')}
                    className="mt-4 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                    Retour
                </button>
            </div>
        );
    }
    if (!vente) return null;

    return (
        <div className="p-6">
            {/* En-tête */}
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{vente.refe}</h1>
                    <p className="text-gray-600 mt-1">Commande Client</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate(`/ventes/${id}/modifier`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Modifier
                    </button>
                    {canDelete && (
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Supprimer
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/ventes')}
                        className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                    >
                        Retour
                    </button>
                </div>
            </div>

            {/* Informations principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Client */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Client</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Nom:</span>
                            <span className="font-medium">{vente.clientNom}</span>
                        </div>
                    </div>
                </div>

                {/* Dates et Livraison */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Dates & Livraison</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Date Entrée:</span>
                            <span className="font-medium">
                                {new Date(vente.dateEntree).toLocaleDateString('fr-FR')}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Date Effective:</span>
                            <span className="font-medium">
                                {new Date(vente.dateEffective).toLocaleDateString('fr-FR')}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Date Livraison:</span>
                            <span className="font-medium">
                                {vente.dateLivraison
                                    ? new Date(vente.dateLivraison).toLocaleDateString('fr-FR')
                                    : 'Non définie'
                                }
                            </span>
                        </div>
                        {vente.locationLivraison && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Lieu:</span>
                                <span className="font-medium">{vente.locationLivraison}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Pro-forma source */}
            {vente.proformaId && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-blue-900">
                                Créée depuis le pro-forma: {vente.proformaRefe}
                            </p>
                            <p className="text-sm text-blue-700">
                                Cette commande a été générée automatiquement depuis un devis accepté
                            </p>
                        </div>
                        <button
                            onClick={() => navigate(`/proforma-ventes/${vente.proformaId}`)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Voir Pro-forma
                        </button>
                    </div>
                </div>
            )}

            {/* Lignes de commande */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Articles Commandés</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Article
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Référence
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Quantité
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Prix Unit.
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Remise %
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Remise Fixe
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {vente.lignes?.map((ligne) => (
                                <tr key={ligne.id}>
                                    <td className="px-4 py-3">{ligne.articleNom}</td>
                                    <td className="px-4 py-3 text-gray-600">{ligne.articleReference}</td>
                                    <td className="px-4 py-3 text-right">{ligne.quantite}</td>
                                    <td className="px-4 py-3 text-right">{ligne.prixUnitaire?.toFixed(2)} €</td>
                                    <td className="px-4 py-3 text-right text-red-600">
                                        {ligne.remisePourcentage > 0 ? `${ligne.remisePourcentage}%` : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right text-red-600">
                                        {ligne.remiseFixe > 0 ? `${ligne.remiseFixe.toFixed(2)} €` : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        {ligne.montantNet?.toFixed(2)} €
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Récapitulatif */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Récapitulatif Financier</h2>
                <div className="max-w-md ml-auto space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Montant Brut:</span>
                        <span className="font-medium">{vente.montantBrutTotal?.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                        <span>Remises sur Lignes:</span>
                        <span>-{vente.montantRemiseLignes?.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">Sous-total:</span>
                        <span className="font-medium">{vente.sousTotal?.toFixed(2)} €</span>
                    </div>
                    {(vente.remisePourcentage > 0 || vente.remiseFixe > 0) && (
                        <>
                            <div className="text-sm text-gray-600 mt-2">
                                {vente.remisePourcentage > 0 && (
                                    <div>Remise globale: {vente.remisePourcentage}%</div>
                                )}
                                {vente.remiseFixe > 0 && (
                                    <div>Remise fixe: {vente.remiseFixe.toFixed(2)} €</div>
                                )}
                            </div>
                            <div className="flex justify-between text-red-600">
                                <span>Remise Globale:</span>
                                <span>-{vente.montantRemiseGlobale?.toFixed(2)} €</span>
                            </div>
                        </>
                    )}
                    <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">Montant HT:</span>
                        <span className="font-medium">{vente.montantAvantTVA?.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">TVA ({vente.tauxTVA}%):</span>
                        <span>{vente.montantTVA?.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between border-t-2 border-gray-300 pt-2 text-lg font-bold">
                        <span>Total TTC:</span>
                        <span className="text-blue-600">{vente.prixTotal?.toFixed(2)} €</span>
                    </div>
                </div>
            </div>

            {/* Statut */}
            {vente.processName && (
                <div className="mt-6 bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Statut</h2>
                    <div className="inline-flex px-4 py-2 rounded-full bg-blue-100 text-blue-800 font-semibold">
                        {vente.processName}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VenteDetail;

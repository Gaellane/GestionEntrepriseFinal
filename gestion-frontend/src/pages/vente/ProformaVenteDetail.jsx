import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { proformaVenteApi } from '../../api/proformaVenteApi';
import ProformaWorkflowActions from '../../components/common/ProformaWorkflowActions';
import { useAuth } from '../../hooks/useAuth';

const ProformaVenteDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [proforma, setProforma] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadProformaDetail();
    }, [id]);

    const loadProformaDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await proformaVenteApi.getProformaVenteById(id);
            setProforma(data);
        } catch (err) {
            console.error('Erreur lors du chargement du pro-forma:', err);
            setError('Impossible de charger les détails du pro-forma');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
                <button
                    onClick={() => navigate('/proforma-ventes')}
                    className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Retour à la liste
                </button>
            </div>
        );
    }

    if (!proforma) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-gray-600">Pro-forma non trouvé</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-md p-6">
                {/* En-tête */}
                <div className="flex justify-between items-start mb-6 pb-6 border-b">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Pro-forma de Vente</h1>
                        <p className="text-gray-600 text-lg">Référence: <span className="font-mono font-semibold">{proforma.refe}</span></p>
                        <p className="text-gray-500 text-sm mt-1">Créé le {formatDate(proforma.dateEntree)}</p>
                    </div>
                    <div className="flex space-x-2">
                        <Link
                            to={`/proforma-ventes/${id}/modifier`}
                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                        >
                            Modifier
                        </Link>
                        <button
                            onClick={() => navigate('/proforma-ventes')}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Retour
                        </button>
                    </div>
                </div>

                {/* Informations client et workflow */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Informations client */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Client</h2>
                        <p className="text-lg font-semibold text-blue-700">{proforma.clientNom}</p>
                    </div>

                    {/* Actions de workflow */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">Workflow</h2>
                        <ProformaWorkflowActions 
                            proforma={proforma}
                            onUpdate={loadProformaDetail}
                            userRole={user?.role?.roleCode}
                        />
                    </div>
                </div>

                {/* Lignes du pro-forma */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Détail des articles</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-300">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 border-b text-left">Article</th>
                                    <th className="px-4 py-3 border-b text-left">Référence</th>
                                    <th className="px-4 py-3 border-b text-center">Qté</th>
                                    <th className="px-4 py-3 border-b text-right">Prix Unit.</th>
                                    <th className="px-4 py-3 border-b text-right">Montant Brut</th>
                                    <th className="px-4 py-3 border-b text-right">Remise Ligne</th>
                                    <th className="px-4 py-3 border-b text-right">Total Ligne</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proforma.lignes && proforma.lignes.map((ligne, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 border-b font-semibold">{ligne.articleNom}</td>
                                        <td className="px-4 py-3 border-b">
                                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                {ligne.articleReference}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 border-b text-center">{ligne.quantite}</td>
                                        <td className="px-4 py-3 border-b text-right">{ligne.prixUnitaire?.toFixed(2)} €</td>
                                        <td className="px-4 py-3 border-b text-right">{ligne.montantBrut?.toFixed(2)} €</td>
                                        <td className="px-4 py-3 border-b text-right text-red-600">
                                            {ligne.montantRemise > 0 ? `- ${ligne.montantRemise?.toFixed(2)} €` : '-'}
                                            {(ligne.remisePourcentage > 0 || ligne.remiseFixe > 0) && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {ligne.remisePourcentage > 0 && `${ligne.remisePourcentage}%`}
                                                    {ligne.remisePourcentage > 0 && ligne.remiseFixe > 0 && ' + '}
                                                    {ligne.remiseFixe > 0 && `${ligne.remiseFixe?.toFixed(2)}€`}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 border-b text-right font-semibold">
                                            {ligne.montantNet?.toFixed(2)} €
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Récapitulatif des totaux */}
                <div className="flex justify-end">
                    <div className="w-full md:w-1/2 lg:w-1/3 bg-gray-50 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Récapitulatif</h2>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Montant brut total:</span>
                                <span className="font-semibold">{proforma.montantBrutTotal?.toFixed(2)} €</span>
                            </div>

                            <div className="flex justify-between text-sm text-red-600">
                                <span>Remises lignes:</span>
                                <span>- {proforma.montantRemiseLignes?.toFixed(2)} €</span>
                            </div>

                            <div className="flex justify-between border-t pt-2">
                                <span className="font-semibold text-gray-700">Sous-total:</span>
                                <span className="font-semibold">{proforma.sousTotal?.toFixed(2)} €</span>
                            </div>

                            {(proforma.remisePourcentage > 0 || proforma.remiseFixe > 0) && (
                                <>
                                    <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                                        <div className="text-sm font-semibold text-gray-700 mb-2">Remise globale:</div>
                                        {proforma.remisePourcentage > 0 && (
                                            <div className="text-xs text-gray-600">• Remise {proforma.remisePourcentage}%</div>
                                        )}
                                        {proforma.remiseFixe > 0 && (
                                            <div className="text-xs text-gray-600">• Remise fixe {proforma.remiseFixe?.toFixed(2)} €</div>
                                        )}
                                    </div>
                                    <div className="flex justify-between text-sm text-red-600">
                                        <span>Montant remise globale:</span>
                                        <span>- {proforma.montantRemiseGlobale?.toFixed(2)} €</span>
                                    </div>
                                </>
                            )}

                            <div className="flex justify-between border-t pt-2">
                                <span className="font-semibold text-gray-700">Montant avant TVA:</span>
                                <span className="font-semibold">{proforma.montantAvantTVA?.toFixed(2)} €</span>
                            </div>

                            <div className="flex justify-between text-sm text-blue-600">
                                <span>TVA ({proforma.tauxTVA}%):</span>
                                <span>+ {proforma.montantTVA?.toFixed(2)} €</span>
                            </div>

                            <div className="flex justify-between border-t-2 border-gray-400 pt-3 mt-3">
                                <span className="text-xl font-bold text-gray-800">TOTAL TTC:</span>
                                <span className="text-xl font-bold text-green-600">{proforma.prixTotal?.toFixed(2)} €</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProformaVenteDetail;

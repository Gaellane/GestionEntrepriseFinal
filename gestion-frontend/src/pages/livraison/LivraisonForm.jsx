import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVentesAPreparer, getLotsDisponibles, creerLivraison } from '../../api/livraisonApi';
import { getVenteById } from '../../api/venteApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const LivraisonForm = () => {
    const navigate = useNavigate();
    const [ventesAPreparer, setVentesAPreparer] = useState([]);
    const [selectedVente, setSelectedVente] = useState(null);
    const [lignesLivraison, setLignesLivraison] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [methode, setMethode] = useState('FIFO');

    useEffect(() => {
        loadVentesAPreparer();
    }, []);

    const loadVentesAPreparer = async () => {
        setLoading(true);
        try {
            const response = await getVentesAPreparer();
            setVentesAPreparer(response || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectVente = async (venteSummary) => {
        setLoading(true);
        try {
            // Récupérer les détails complets de la vente (lignes)
            const fullVente = await getVenteById(venteSummary.venteId);
            setSelectedVente(fullVente);

            // Charger les lots disponibles pour chaque ligne
            const lignesAvecLots = await Promise.all(
                fullVente.lignes.map(async (ligne) => {
                    const lots = await getLotsDisponibles(ligne.id, methode);
                    return {
                        ...ligne,
                        lotsDisponibles: lots,
                        lotSelections: [] // [{lotId, quantite}]
                    };
                })
            );
            setLignesLivraison(lignesAvecLots);
            setError(null);
        } catch (err) {
            setError(err?.data?.message || err?.message || 'Erreur lors du chargement des lots');
        } finally {
            setLoading(false);
        }
    };

    const handleLotSelection = (ligneIndex, lotId, quantite) => {
        setLignesLivraison(prev => {
            const updated = [...prev];
            const ligne = { ...updated[ligneIndex] };
            const existingIndex = ligne.lotSelections.findIndex(s => s.lotId === lotId);

            if (quantite <= 0) {
                // Supprimer la sélection
                ligne.lotSelections = ligne.lotSelections.filter(s => s.lotId !== lotId);
            } else if (existingIndex >= 0) {
                // Mettre à jour la quantité
                ligne.lotSelections = [...ligne.lotSelections];
                ligne.lotSelections[existingIndex] = { lotId, quantite };
            } else {
                // Ajouter nouvelle sélection
                ligne.lotSelections = [...ligne.lotSelections, { lotId, quantite }];
            }

            updated[ligneIndex] = ligne;
            return updated;
        });
    };

    const getQuantiteSelectionnee = (ligneIndex) => {
        const ligne = lignesLivraison[ligneIndex];
        return ligne.lotSelections.reduce((sum, s) => sum + s.quantite, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        for (let i = 0; i < lignesLivraison.length; i++) {
            const ligne = lignesLivraison[i];
            const qteSelectionnee = getQuantiteSelectionnee(i);
            if (qteSelectionnee !== ligne.quantite) {
                alert(`La ligne ${ligne.articleNom} nécessite ${ligne.quantite} unités, mais ${qteSelectionnee} sont sélectionnées.`);
                return;
            }
        }

        setSubmitting(true);
        try {
            const lignesData = lignesLivraison.map((ligne, idx) => ({
                id: ligne.id,
                articleId: ligne.articleId || (ligne.article ? ligne.article.id : null),
                quantite: getQuantiteSelectionnee(idx),
                lots: ligne.lotSelections
            }));

            await creerLivraison(selectedVente.id, lignesData);
            alert('Livraison créée avec succès !');
            navigate('/livraison/liste');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la création');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && !selectedVente) return <LoadingSpinner />;

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Enregistrement Livraison</h1>
                <p className="text-gray-600 mt-1">Préparer une livraison depuis une commande confirmée</p>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Sélection méthode */}
            <div className="mb-4 flex gap-4 items-center">
                <label className="font-medium">Méthode de sélection des lots :</label>
                <select
                    value={methode}
                    onChange={(e) => setMethode(e.target.value)}
                    className="px-3 py-2 border rounded"
                >
                    <option value="FIFO">FIFO (Premier entré, premier sorti)</option>
                    <option value="FEFO">FEFO (Premier expiré, premier sorti)</option>
                </select>
            </div>

            {/* Liste des ventes à préparer */}
            {!selectedVente && (
                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold">Commandes à préparer</h2>
                    </div>
                    <div className="divide-y">
                        {ventesAPreparer.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                Aucune commande à préparer
                            </div>
                        ) : (
                            ventesAPreparer.map((vente, vIndex) => (
                                <div
                                    key={vente.venteId ?? vente.venteRefe ?? vIndex}
                                    className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                                    onClick={() => handleSelectVente(vente)}
                                >
                                    <div>
                                        <div className="font-medium">{vente.venteRefe}</div>
                                        <div className="text-sm text-gray-600">
                                            Client: {vente.clientNom}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Livraison prévue: {vente.dateLivraison ? new Date(vente.dateLivraison).toLocaleDateString('fr-FR') : ''}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium text-blue-600">
                                            {vente.prixTotal?.toLocaleString('fr-FR')} Ar
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {vente.nombreLignes || 0} article(s)
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Formulaire de préparation */}
            {selectedVente && (
                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-lg shadow mb-6">
                        <div className="p-4 border-b flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Commande {selectedVente.refe}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Client: {selectedVente.clientNom} |
                                    Livraison: {selectedVente.lieuLivraison}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedVente(null);
                                    setLignesLivraison([]);
                                }}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                ← Retour
                            </button>
                        </div>

                        {loading ? (
                            <div className="p-8">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <div className="p-4 space-y-6">
                                {lignesLivraison.map((ligne, ligneIndex) => (
                                    <div key={ligne.id ?? `ligne-${ligneIndex}`} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-medium">{ligne.articleNom}</h3>
                                                <p className="text-sm text-gray-500">
                                                    Réf: {ligne.articleRefe}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium">
                                                    Demandé: {ligne.quantite}
                                                </div>
                                                <div className={`text-sm ${getQuantiteSelectionnee(ligneIndex) === ligne.quantite
                                                        ? 'text-green-600'
                                                        : 'text-orange-600'
                                                    }`}>
                                                    Sélectionné: {getQuantiteSelectionnee(ligneIndex)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Liste des lots disponibles */}
                                        <div className="mt-3">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left">Lot</th>
                                                        <th className="px-3 py-2 text-left">Dépôt</th>
                                                        <th className="px-3 py-2 text-right">Disponible</th>
                                                        <th className="px-3 py-2 text-left">Expiration</th>
                                                        <th className="px-3 py-2 text-right">Prix Unit.</th>
                                                        <th className="px-3 py-2 text-center">Quantité à prélever</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {ligne.lotsDisponibles?.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="6" className="px-3 py-4 text-center text-red-600">
                                                                Aucun lot disponible pour cet article
                                                            </td>
                                                        </tr>
                                                        ) : (
                                                        ligne.lotsDisponibles?.map((lot, lotIndex) => {
                                                            const selection = ligne.lotSelections.find(s => s.lotId === lot.lotId);
                                                            return (
                                                                <tr key={lot.lotId ?? `lot-${lotIndex}`} className="border-t">
                                                                    <td className="px-3 py-2">{lot.lotRefe}</td>
                                                                    <td className="px-3 py-2">{lot.depotNom}</td>
                                                                    <td className="px-3 py-2 text-right">{lot.quantiteDisponible}</td>
                                                                    <td className="px-3 py-2">
                                                                        {lot.dateExpiration && new Date(lot.dateExpiration).toLocaleDateString('fr-FR')}
                                                                    </td>
                                                                    <td className="px-3 py-2 text-right">
                                                                        {lot.prixUnitaire?.toLocaleString('fr-FR')} Ar
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max={lot.quantiteDisponible}
                                                                            value={selection?.quantite || ''}
                                                                            onChange={(e) => handleLotSelection(
                                                                                ligneIndex,
                                                                                lot.lotId,
                                                                                parseFloat(e.target.value) || 0
                                                                            )}
                                                                            className="w-24 px-2 py-1 border rounded text-center"
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/livraison/liste')}
                            className="px-4 py-2 border rounded hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {submitting ? 'Création...' : 'Créer la livraison'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default LivraisonForm;

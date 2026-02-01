import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createFromProforma, createDirectVente, getVenteById, updateVente } from '../../api/venteApi';
import { getAcceptedProformas } from '../../api/venteApi';
import { getProformaVenteById } from '../../api/proformaVenteApi';
import { getAllClients } from '../../api/clientApi';
import { getAllArticles } from '../../api/articleApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const VenteForm = () => {
    const navigate = useNavigate();
    const { id, proformaId } = useParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Mode: 'transformation' ou 'direct' ou 'edit'
    const [mode, setMode] = useState(proformaId ? 'transformation' : id ? 'edit' : 'direct');

    // Données
    const [acceptedProformas, setAcceptedProformas] = useState([]);
    const [selectedProforma, setSelectedProforma] = useState(null);
    const [clients, setClients] = useState([]);
    const [articles, setArticles] = useState([]);

    // Formulaire
    const [formData, setFormData] = useState({
        proformaId: proformaId || null,
        clientId: null,
        dateEffective: new Date().toISOString().split('T')[0],
        dateLivraison: '',
        locationLivraison: '',
        remisePourcentage: 0,
        remiseFixe: 0,
        lignes: []
    });

    useEffect(() => {
        loadInitialData();
    }, [id, proformaId, mode]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            // Charger les clients et articles
            const [clientsData, articlesData] = await Promise.all([
                getAllClients({ page: 0, size: 1000 }),
                getAllArticles({ page: 0, size: 1000 })
            ]);

            setClients(clientsData.content || []);
            setArticles(articlesData.content || []);

            if (mode === 'transformation') {
                // Mode transformation: charger les pro-formas acceptés
                const proformasData = await getAcceptedProformas();
                setAcceptedProformas(proformasData.content || []);

                if (proformaId) {
                    loadProformaData(proformaId);
                }
            } else if (mode === 'edit' && id) {
                // Mode édition: charger la vente existante
                const vente = await getVenteById(id);
                setFormData({
                    proformaId: vente.proformaId,
                    clientId: vente.clientId,
                    dateEffective: vente.dateEffective,
                    dateLivraison: vente.dateLivraison || '',
                    locationLivraison: vente.locationLivraison || '',
                    remisePourcentage: vente.remisePourcentage || 0,
                    remiseFixe: vente.remiseFixe || 0,
                    lignes: vente.lignes || []
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const loadProformaData = async (pfId) => {
        try {
            const proforma = await getProformaVenteById(pfId);
            setSelectedProforma(proforma);

            setFormData(prev => ({
                ...prev,
                proformaId: proforma.id,
                clientId: proforma.clientId,
                remisePourcentage: proforma.remisePourcentage || 0,
                remiseFixe: proforma.remiseFixe || 0,
                lignes: proforma.lignes || []
            }));
        } catch (err) {
            setError('Erreur lors du chargement du pro-forma');
        }
    };

    const handleProformaChange = (e) => {
        const pfId = e.target.value;
        if (pfId) {
            loadProformaData(pfId);
        } else {
            setSelectedProforma(null);
            setFormData({
                ...formData,
                proformaId: null,
                clientId: null,
                lignes: [],
                remisePourcentage: 0,
                remiseFixe: 0
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddLigne = () => {
        setFormData(prev => ({
            ...prev,
            lignes: [
                ...prev.lignes,
                {
                    articleId: null,
                    quantite: 1,
                    prixUnitaire: 0,
                    remisePourcentage: 0,
                    remiseFixe: 0
                }
            ]
        }));
    };

    const handleRemoveLigne = (index) => {
        setFormData(prev => ({
            ...prev,
            lignes: prev.lignes.filter((_, i) => i !== index)
        }));
    };

    const handleLigneChange = (index, field, value) => {
        setFormData(prev => {
            const newLignes = [...prev.lignes];
            newLignes[index] = { ...newLignes[index], [field]: value };

            // Si l'article change, mettre à jour le prix
            if (field === 'articleId') {
                const article = articles.find(a => a.id === parseInt(value));
                if (article) {
                    newLignes[index].prixUnitaire = article.prixVente || 0;
                }
            }

            return { ...prev, lignes: newLignes };
        });
    };

    const calculateLigneMontants = (ligne) => {
        const montantBrut = ligne.quantite * ligne.prixUnitaire;
        const remisePct = (montantBrut * ligne.remisePourcentage) / 100;
        const montantApresRemisePct = montantBrut - remisePct;
        const montantRemise = remisePct + ligne.remiseFixe;
        const montantNet = montantApresRemisePct - ligne.remiseFixe;

        return { montantBrut, montantRemise, montantNet };
    };

    const calculateTotaux = () => {
        let montantBrutTotal = 0;
        let montantRemiseLignes = 0;

        formData.lignes.forEach(ligne => {
            const { montantBrut, montantRemise } = calculateLigneMontants(ligne);
            montantBrutTotal += montantBrut;
            montantRemiseLignes += montantRemise;
        });

        const sousTotal = montantBrutTotal - montantRemiseLignes;
        const remiseGlobalePct = (sousTotal * formData.remisePourcentage) / 100;
        const montantApresRemiseGlobalePct = sousTotal - remiseGlobalePct;
        const montantRemiseGlobale = remiseGlobalePct + formData.remiseFixe;
        const montantAvantTVA = montantApresRemiseGlobalePct - formData.remiseFixe;
        const montantTVA = (montantAvantTVA * 20) / 100; // TVA 20%
        const prixTotal = montantAvantTVA + montantTVA;

        return {
            montantBrutTotal,
            montantRemiseLignes,
            sousTotal,
            montantRemiseGlobale,
            montantAvantTVA,
            montantTVA,
            prixTotal
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'transformation' && formData.proformaId) {
                await createFromProforma(formData.proformaId, {
                    dateEffective: formData.dateEffective,
                    dateLivraison: formData.dateLivraison || null,
                    locationLivraison: formData.locationLivraison || null
                });
            } else if (mode === 'edit' && id) {
                await updateVente(id, formData);
            } else {
                await createDirectVente(formData);
            }

            navigate('/ventes');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !formData.clientId) return <LoadingSpinner />;

    const totaux = calculateTotaux();

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    {mode === 'edit' ? 'Modifier la Commande' : 'Nouvelle Commande Client'}
                </h1>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Sélecteur de mode */}
            {!id && !proformaId && (
                <div className="mb-6 flex gap-4">
                    <button
                        onClick={() => setMode('transformation')}
                        className={`px-4 py-2 rounded ${mode === 'transformation'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Depuis Pro-forma
                    </button>
                    <button
                        onClick={() => setMode('direct')}
                        className={`px-4 py-2 rounded ${mode === 'direct'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Commande Directe
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sélection Pro-forma */}
                {mode === 'transformation' && (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4">Pro-forma</h2>
                        <select
                            value={formData.proformaId || ''}
                            onChange={handleProformaChange}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            required
                        >
                            <option value="">Sélectionner un pro-forma accepté</option>
                            {acceptedProformas.map(pf => (
                                <option key={pf.id} value={pf.id}>
                                    {pf.refe} - {pf.clientNom} - {pf.prixTotal?.toFixed(2)} €
                                </option>
                            ))}
                        </select>

                        {selectedProforma && (
                            <div className="mt-4 p-4 bg-gray-50 rounded">
                                <p className="font-medium">{selectedProforma.refe}</p>
                                <p className="text-sm text-gray-600">Client: {selectedProforma.clientNom}</p>
                                <p className="text-sm text-gray-600">
                                    Total: {selectedProforma.prixTotal?.toFixed(2)} €
                                </p>
                                <p className="text-sm text-gray-600">
                                    {selectedProforma.lignes?.length || 0} ligne(s)
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Informations commande */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Informations Commande</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mode === 'direct' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Client *
                                </label>
                                <select
                                    name="clientId"
                                    value={formData.clientId || ''}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    required
                                >
                                    <option value="">Sélectionner un client</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.nom}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date Effective *
                            </label>
                            <input
                                type="date"
                                name="dateEffective"
                                value={formData.dateEffective}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date Livraison
                            </label>
                            <input
                                type="date"
                                name="dateLivraison"
                                value={formData.dateLivraison}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lieu de Livraison
                            </label>
                            <input
                                type="text"
                                name="locationLivraison"
                                value={formData.locationLivraison}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                placeholder="Adresse de livraison"
                            />
                        </div>
                    </div>
                </div>

                {/* Lignes (seulement en mode direct ou edit) */}
                {mode === 'direct' && (
                    <>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Articles</h2>
                                <button
                                    type="button"
                                    onClick={handleAddLigne}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    + Ajouter Article
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Article</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Qté</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Prix Unit.</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Rem. %</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Rem. Fixe</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                                            <th className="px-3 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {formData.lignes.map((ligne, index) => {
                                            const { montantNet } = calculateLigneMontants(ligne);
                                            return (
                                                <tr key={index}>
                                                    <td className="px-3 py-2">
                                                        <select
                                                            value={ligne.articleId || ''}
                                                            onChange={(e) => handleLigneChange(index, 'articleId', e.target.value)}
                                                            className="w-full border border-gray-300 rounded px-2 py-1"
                                                            required
                                                        >
                                                            <option value="">Sélectionner</option>
                                                            {articles.map(art => (
                                                                <option key={art.id} value={art.id}>
                                                                    {art.nom}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="number"
                                                            value={ligne.quantite}
                                                            onChange={(e) => handleLigneChange(index, 'quantite', parseFloat(e.target.value))}
                                                            className="w-20 border border-gray-300 rounded px-2 py-1"
                                                            min="1"
                                                            required
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="number"
                                                            value={ligne.prixUnitaire}
                                                            onChange={(e) => handleLigneChange(index, 'prixUnitaire', parseFloat(e.target.value))}
                                                            className="w-24 border border-gray-300 rounded px-2 py-1"
                                                            step="0.01"
                                                            required
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="number"
                                                            value={ligne.remisePourcentage}
                                                            onChange={(e) => handleLigneChange(index, 'remisePourcentage', parseFloat(e.target.value))}
                                                            className="w-20 border border-gray-300 rounded px-2 py-1"
                                                            min="0"
                                                            max="100"
                                                            step="0.01"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="number"
                                                            value={ligne.remiseFixe}
                                                            onChange={(e) => handleLigneChange(index, 'remiseFixe', parseFloat(e.target.value))}
                                                            className="w-24 border border-gray-300 rounded px-2 py-1"
                                                            step="0.01"
                                                            min="0"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2 font-medium">
                                                        {montantNet.toFixed(2)} €
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveLigne(index)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            ✕
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Remises globales */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-lg font-semibold mb-4">Remises Globales</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Remise Pourcentage (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="remisePourcentage"
                                        value={formData.remisePourcentage}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Remise Fixe (€)
                                    </label>
                                    <input
                                        type="number"
                                        name="remiseFixe"
                                        value={formData.remiseFixe}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Récapitulatif */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Récapitulatif</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Montant Brut:</span>
                            <span className="font-medium">{totaux.montantBrutTotal.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                            <span>Remises Lignes:</span>
                            <span>-{totaux.montantRemiseLignes.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Sous-total:</span>
                            <span className="font-medium">{totaux.sousTotal.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                            <span>Remise Globale:</span>
                            <span>-{totaux.montantRemiseGlobale.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                            <span>Montant HT:</span>
                            <span className="font-medium">{totaux.montantAvantTVA.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between">
                            <span>TVA (20%):</span>
                            <span>{totaux.montantTVA.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between border-t-2 pt-2 text-lg font-bold">
                            <span>Total TTC:</span>
                            <span className="text-blue-600">{totaux.prixTotal.toFixed(2)} €</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/ventes')}
                        className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Enregistrement...' : mode === 'edit' ? 'Modifier' : 'Créer Commande'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VenteForm;

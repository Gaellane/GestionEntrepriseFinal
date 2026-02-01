import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { proformaVenteApi } from '../../api/proformaVenteApi';
import { clientApi } from '../../api/clientApi';
import { articleApi } from '../../api/index';
import { tarificationApi } from '../../api/tarificationApi';
import { configurationApi } from '../../api/configurationApi';
import RemiseAlert from '../../components/common/RemiseAlert';
import { useAuth } from '../../hooks/useAuth';

const ProformaVenteForm = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [clients, setClients] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tauxTVA, setTauxTVA] = useState(20);

    const [formData, setFormData] = useState({
        clientId: '',
        remisePourcentage: 0,
        remiseFixe: 0,
        lignes: [
            {
                articleId: '',
                quantite: 1,
                prixUnitaire: 0,
                remisePourcentage: 0,
                remiseFixe: 0
            }
        ]
    });

    // Charger les données initiales
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [clientsData, articlesData, tvaConfig] = await Promise.all([
                clientApi.getAllClients({ page: 0, size: 1000 }),
                articleApi.getAllArticles({ page: 0, size: 1000 }),
                configurationApi.getConfigurationByKey('TVA')
            ]);

            setClients(clientsData.content || []);
            setArticles(articlesData.content || []);
            setTauxTVA(parseFloat(tvaConfig.configValue) || 20);
        } catch (err) {
            console.error('Erreur lors du chargement des données:', err);
            setError('Impossible de charger les données nécessaires');
        } finally {
            setLoading(false);
        }
    };

    // Charger le prix d'un article
    const loadArticlePrice = async (articleId, ligneIndex) => {
        try {
            const prixData = await tarificationApi.getLatestPrixByArticleId(articleId);
            if (prixData) {
                updateLigne(ligneIndex, 'prixUnitaire', prixData.prixVente || 0);
            }
        } catch (err) {
            console.error('Erreur lors du chargement du prix:', err);
        }
    };

    // Ajouter une ligne
    const ajouterLigne = () => {
        setFormData(prev => ({
            ...prev,
            lignes: [
                ...prev.lignes,
                {
                    articleId: '',
                    quantite: 1,
                    prixUnitaire: 0,
                    remisePourcentage: 0,
                    remiseFixe: 0
                }
            ]
        }));
    };

    // Supprimer une ligne
    const supprimerLigne = (index) => {
        if (formData.lignes.length === 1) {
            alert('Vous devez conserver au moins une ligne');
            return;
        }
        setFormData(prev => ({
            ...prev,
            lignes: prev.lignes.filter((_, i) => i !== index)
        }));
    };

    // Mettre à jour une ligne
    const updateLigne = (index, field, value) => {
        setFormData(prev => {
            const newLignes = [...prev.lignes];
            newLignes[index] = {
                ...newLignes[index],
                [field]: field === 'articleId' ? value : parseFloat(value) || 0
            };

            // Si l'article change, charger son prix
            if (field === 'articleId' && value) {
                loadArticlePrice(value, index);
            }

            return { ...prev, lignes: newLignes };
        });
    };

    // Calculs
    const calculs = React.useMemo(() => {
        // Calculer les montants de chaque ligne
        const lignesCalculees = formData.lignes.map(ligne => {
            const montantBrut = ligne.quantite * ligne.prixUnitaire;

            // Remise pourcentage ligne
            const montantApresRemisePct = montantBrut * (1 - ligne.remisePourcentage / 100);

            // Remise fixe ligne
            const montantNet = Math.max(0, montantApresRemisePct - ligne.remiseFixe);
            const montantRemise = montantBrut - montantNet;

            return {
                ...ligne,
                montantBrut,
                montantRemise,
                montantNet
            };
        });

        // Totaux des lignes
        const montantBrutTotal = lignesCalculees.reduce((sum, l) => sum + l.montantBrut, 0);
        const montantRemiseLignes = lignesCalculees.reduce((sum, l) => sum + l.montantRemise, 0);
        const sousTotal = lignesCalculees.reduce((sum, l) => sum + l.montantNet, 0);

        // Remise globale pourcentage
        const montantApresRemiseGlobalePct = sousTotal * (1 - formData.remisePourcentage / 100);

        // Remise globale fixe
        const montantAvantTVA = Math.max(0, montantApresRemiseGlobalePct - formData.remiseFixe);
        const montantRemiseGlobale = sousTotal - montantAvantTVA;

        // TVA
        const montantTVA = montantAvantTVA * (tauxTVA / 100);
        const prixTotal = montantAvantTVA + montantTVA;

        return {
            lignesCalculees,
            montantBrutTotal,
            montantRemiseLignes,
            sousTotal,
            montantRemiseGlobale,
            montantAvantTVA,
            montantTVA,
            prixTotal
        };
    }, [formData.lignes, formData.remisePourcentage, formData.remiseFixe, tauxTVA]);

    // Soumettre le formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.clientId) {
            setError('Veuillez sélectionner un client');
            return;
        }

        if (formData.lignes.some(l => !l.articleId)) {
            setError('Toutes les lignes doivent avoir un article');
            return;
        }

        try {
            setLoading(true);
            await proformaVenteApi.createProformaVente(formData);
            navigate('/proforma-ventes');
        } catch (err) {
            console.error('Erreur lors de la création du pro-forma:', err);
            setError(err.response?.data?.message || 'Erreur lors de la création du pro-forma');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Créer un Pro-forma de Vente</h1>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Sélection du client */}
                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2">
                            Client <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.clientId}
                            onChange={(e) => setFormData({ ...formData, clientId: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Sélectionner un client</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>
                                    {client.clientNom} - {client.contact}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Lignes d'articles */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Articles</h2>
                            <button
                                type="button"
                                onClick={ajouterLigne}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                + Ajouter une ligne
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-2 border-b text-left">Article</th>
                                        <th className="px-4 py-2 border-b text-center">Quantité</th>
                                        <th className="px-4 py-2 border-b text-right">Prix Unit.</th>
                                        <th className="px-4 py-2 border-b text-right">Remise %</th>
                                        <th className="px-4 py-2 border-b text-right">Remise Fixe</th>
                                        <th className="px-4 py-2 border-b text-right">Total Ligne</th>
                                        <th className="px-4 py-2 border-b text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.lignes.map((ligne, index) => {
                                        const ligneCalc = calculs.lignesCalculees[index];
                                        return (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 border-b">
                                                    <select
                                                        value={ligne.articleId}
                                                        onChange={(e) => updateLigne(index, 'articleId', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        required
                                                    >
                                                        <option value="">Sélectionner...</option>
                                                        {articles.map(article => (
                                                            <option key={article.id} value={article.id}>
                                                                {article.articleNom} ({article.refe})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-2 border-b">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={ligne.quantite}
                                                        onChange={(e) => updateLigne(index, 'quantite', e.target.value)}
                                                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        required
                                                    />
                                                </td>
                                                <td className="px-4 py-2 border-b">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={ligne.prixUnitaire}
                                                        onChange={(e) => updateLigne(index, 'prixUnitaire', e.target.value)}
                                                        className="w-24 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        required
                                                    />
                                                </td>
                                                <td className="px-4 py-2 border-b">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="100"
                                                        value={ligne.remisePourcentage}
                                                        onChange={(e) => updateLigne(index, 'remisePourcentage', e.target.value)}
                                                        className="w-20 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-2 border-b">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={ligne.remiseFixe}
                                                        onChange={(e) => updateLigne(index, 'remiseFixe', e.target.value)}
                                                        className="w-24 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-2 border-b text-right font-semibold">
                                                    {ligneCalc?.montantNet.toFixed(2)} €
                                                </td>
                                                <td className="px-4 py-2 border-b text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => supprimerLigne(index)}
                                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                                    >
                                                        ×
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Récapitulatif des calculs */}
                    <div className="bg-gray-50 p-6 rounded-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Récapitulatif</h2>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Montant brut total:</span>
                                <span className="font-semibold">{calculs.montantBrutTotal.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between text-red-600">
                                <span>Remises lignes:</span>
                                <span>- {calculs.montantRemiseLignes.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="font-semibold text-gray-700">Sous-total:</span>
                                <span className="font-semibold">{calculs.sousTotal.toFixed(2)} €</span>
                            </div>

                            {/* Remise globale */}
                            <div className="mt-4 p-4 bg-white rounded border border-gray-300">
                                <h3 className="font-semibold text-gray-700 mb-3">Remise Globale</h3>

                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Remise % :</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            value={formData.remisePourcentage}
                                            onChange={(e) => setFormData({ ...formData, remisePourcentage: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Remise Fixe (€) :</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.remiseFixe}
                                            onChange={(e) => setFormData({ ...formData, remiseFixe: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Alerte de remise */}
                                {formData.remisePourcentage > 0 && (
                                    <RemiseAlert
                                        remisePourcentage={formData.remisePourcentage}
                                    />
                                )}

                                <div className="flex justify-between text-red-600 mt-2">
                                    <span>Montant remise globale:</span>
                                    <span>- {calculs.montantRemiseGlobale.toFixed(2)} €</span>
                                </div>
                            </div>

                            <div className="flex justify-between border-t pt-2">
                                <span className="font-semibold text-gray-700">Montant avant TVA:</span>
                                <span className="font-semibold">{calculs.montantAvantTVA.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between text-blue-600">
                                <span>TVA ({tauxTVA}%):</span>
                                <span>+ {calculs.montantTVA.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between border-t-2 border-gray-400 pt-2 mt-2">
                                <span className="text-xl font-bold text-gray-800">TOTAL TTC:</span>
                                <span className="text-xl font-bold text-green-600">{calculs.prixTotal.toFixed(2)} €</span>
                            </div>
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/proforma-ventes')}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? 'Enregistrement...' : 'Créer le Pro-forma'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProformaVenteForm;

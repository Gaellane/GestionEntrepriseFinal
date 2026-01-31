import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { fetchAchatById, validerAchatMagasinier, validerAchatFinancier } from "../../api/achatApi";
import {
  ShoppingCartIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentCheckIcon,
  DocumentArrowUpIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  TruckIcon,
  BanknotesIcon,
  UserIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowLeftIcon,
  PrinterIcon,
  ShareIcon,
  EnvelopeIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function AchatFiche() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [achat, setAchat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const loadAchat = async () => {
            try {
                setLoading(true);
                const data = await fetchAchatById(id);
                setAchat(data);
            } catch (err) {
                setError('Erreur lors du chargement de l\'achat');
                console.error('Error fetching achat:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadAchat();
        }
    }, [id]);

    const getProcessConfig = (valeur) => {
        switch (valeur) {
            case 1:
                return {
                    id: 1,
                    buttonText: "Valider Magasinier",
                    buttonColor: "from-emerald-500 to-green-600",
                    buttonIcon: CheckCircleIcon,
                    label: "Créé",
                    labelColor: "bg-blue-100 text-blue-800",
                    showCancel: true
                };
            case 11:
                return {
                    id: 11,
                    buttonText: "Valider Financier",
                    buttonColor: "from-purple-500 to-indigo-600",
                    buttonIcon: BanknotesIcon,
                    label: "Validé Magasinier",
                    labelColor: "bg-emerald-100 text-emerald-800",
                    showCancel: true
                };
            case 21:
                return {
                    id: 21,
                    buttonText: "Lancer Commande",
                    buttonColor: "from-orange-500 to-amber-600",
                    buttonIcon: TruckIcon,
                    label: "Validé",
                    labelColor: "bg-purple-100 text-purple-800",
                    showCancel: false
                };
            case 31:
                return {
                    id: 31,
                    buttonText: "Réception",
                    buttonColor: "from-cyan-500 to-blue-600",
                    buttonIcon: ArchiveBoxIcon,
                    label: "En Commande",
                    labelColor: "bg-orange-100 text-orange-800",
                    showCancel: false
                };
            case 41:
                return {
                    id: 41,
                    buttonText: null,
                    buttonColor: "",
                    buttonIcon: null,
                    label: "Réceptionné",
                    labelColor: "bg-cyan-100 text-cyan-800",
                    showCancel: false
                };
            case 0:
                return {
                    id: 0,
                    buttonText: "Ré-Envoyer",
                    buttonColor: "from-red-500 to-pink-600",
                    buttonIcon: ArrowPathIcon,
                    label: "Annulé",
                    labelColor: "bg-red-100 text-red-800",
                    showCancel: false
                };
            default:
                return {
                    id: -1,
                    buttonText: "Action",
                    buttonColor: "from-gray-500 to-gray-600",
                    buttonIcon: DocumentTextIcon,
                    label: "Inconnu",
                    labelColor: "bg-gray-100 text-gray-800",
                    showCancel: false
                };
        }
    };

    const calculerMontantTotal = (achatData) => {
        if (!achatData?.achatLignes || achatData.achatLignes.length === 0) return 0;
        
        return achatData.achatLignes.reduce((total, ligne) => {
            return total + (ligne.quantite * ligne.prixUnitaire);
        }, 0).toFixed(2);
    };

    const handleAction = async (actionType, processId) => {
        if (!achat) return;
        
        setActionLoading(true);
        try {
            switch (processId) {
                case 1:
                    const resMg = await validerAchatMagasinier(achat.id);
                    if (resMg.ok) {
                        alert('Achat validé par le magasinier avec succès');
                        // Recharger les données
                        const data = await fetchAchatById(id);
                        setAchat(data);
                    }
                    break;
                case 11:
                    const resFnc = await validerAchatFinancier(achat.id);
                    if (resFnc.ok) {
                        alert('Achat validé par le financier avec succès');
                        // Recharger les données
                        const data = await fetchAchatById(id);
                        setAchat(data);
                    }
                    break;
                case 21 :
                    navigate(`/achats/commande/saisie/${id}`);
                    break;
                default:
                    alert(`Action "${actionType}" non implémentée.`);
                    break;
            }
        } catch (err) {
            console.error('Error performing action:', err);
            alert('Une erreur est survenue lors de l\'exécution de l\'action');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = () => {
        if (!achat) return;
        
        if (window.confirm('Êtes-vous sûr de vouloir annuler cet achat ? Cette action est irréversible.')) {
            console.log(`Annulation achat ${achat.id}`);
            alert('Fonctionnalité d\'annulation à implémenter');
        }
    };

    const handleBack = () => {
        navigate('/achats');
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement de l'achat...</p>
                </div>
            </div>
        );
    }

    if (error || !achat) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
                    <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                        <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur</h3>
                    <p className="text-red-600 mb-4">{error || 'Achat non trouvé'}</p>
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center mx-auto"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Retour à la liste
                    </button>
                </div>
            </div>
        );
    }

    const processConfig = getProcessConfig(achat.process?.valeur || 0);
    const ButtonIcon = processConfig.buttonIcon;
    const totalAmount = calculerMontantTotal(achat);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header avec bouton retour et actions */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleBack}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
                                    <ShoppingCartIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">Détail de l'Achat</h1>
                                    <p className="text-gray-600">
                                        Référence: {achat.refe}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={handlePrint}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                            >
                                <PrinterIcon className="w-4 h-4 mr-2" />
                                <span>Imprimer</span>
                            </button>
                            
                            <button
                                onClick={() => console.log('Partager')}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                            >
                                <ShareIcon className="w-4 h-4 mr-2" />
                                <span>Partager</span>
                            </button>
                            
                            <button
                                onClick={() => console.log('Dupliquer')}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                            >
                                <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                                <span>Dupliquer</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Carte principale de l'achat */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Section gauche - Informations principales */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Carte d'information */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Informations Générales</h2>
                                    <div className="flex items-center space-x-3">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${processConfig.labelColor}`}>
                                            {processConfig.label}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            ID: {achat.id}
                                        </span>
                                    </div>
                                </div>
                                
                                {processConfig.buttonText && (
                                    <button
                                        onClick={() => handleAction(processConfig.buttonText, processConfig.id)}
                                        disabled={actionLoading}
                                        className={`px-4 py-2 bg-gradient-to-r ${processConfig.buttonColor} text-white rounded-lg hover:opacity-90 transition-all flex items-center space-x-2 ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {actionLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Chargement...</span>
                                            </>
                                        ) : (
                                            <>
                                                {ButtonIcon && <ButtonIcon className="w-4 h-4" />}
                                                <span>{processConfig.buttonText}</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Référence</h3>
                                        <p className="text-lg font-semibold text-gray-900">{achat.refe}</p>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Demandeur</h3>
                                        <div className="flex items-center space-x-2">
                                            <UserIcon className="w-5 h-5 text-gray-400" />
                                            <span className="text-gray-900">{achat.demandeur}</span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Date effective</h3>
                                        <div className="flex items-center space-x-2">
                                            <CalendarIcon className="w-5 h-5 text-gray-400" />
                                            <span className="text-gray-900">
                                                {new Date(achat.dateEffective).toLocaleDateString('fr-FR', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Processus</h3>
                                        <div className="flex items-center space-x-2">
                                            <ClockIcon className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-gray-900">{achat.process?.processName}</p>
                                                <p className="text-sm text-gray-500">Étape {achat.process?.valeur}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Type de processus</h3>
                                        <div className="flex items-center space-x-2">
                                            <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                                            <span className="text-gray-900">{achat.achatProcess?.abreviation}</span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Montant total</h3>
                                        <div className="flex items-center space-x-2">
                                            <CurrencyEuroIcon className="w-6 h-6 text-emerald-600" />
                                            <span className="text-2xl font-bold text-emerald-600">
                                                {totalAmount} €
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {achat.achatLignes?.length || 0} article(s)
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {processConfig.showCancel && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all flex items-center space-x-2"
                                    >
                                        <XCircleIcon className="w-4 h-4" />
                                        <span>Annuler cet achat</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Carte des articles */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">Articles commandés</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {achat.achatLignes?.length || 0} article(s) au total
                                </p>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Article
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Référence
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Quantité
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Prix unitaire
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Prix estimé
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {achat.achatLignes && achat.achatLignes.length > 0 ? (
                                            achat.achatLignes.map((ligne, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="font-medium text-gray-900">
                                                            {ligne.articleNom || 'Article non spécifié'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {ligne.articleRefe || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-gray-900">{ligne.quantite}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-gray-900">{ligne.prixUnitaire?.toFixed(2)} €</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {ligne.prixUnitaireEstime ? (
                                                            <div className="text-gray-900">
                                                                {ligne.prixUnitaireEstime?.toFixed(2)} €
                                                                {ligne.prixUnitaireEstime !== ligne.prixUnitaire && (
                                                                    <span className={`ml-2 text-xs ${ligne.prixUnitaireEstime > ligne.prixUnitaire ? 'text-red-600' : 'text-green-600'}`}>
                                                                        ({ligne.prixUnitaireEstime > ligne.prixUnitaire ? '+' : ''}{((ligne.prixUnitaireEstime - ligne.prixUnitaire) / ligne.prixUnitaire * 100).toFixed(1)}%)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="text-gray-400 text-sm">N/A</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="font-medium text-emerald-600">
                                                            {(ligne.quantite * ligne.prixUnitaire)?.toFixed(2)} €
                                                        </div>
                                                        {ligne.prixUnitaireEstime && ligne.prixUnitaireEstime !== ligne.prixUnitaire && (
                                                            <div className="text-xs text-gray-500">
                                                                Estimé: {(ligne.quantite * ligne.prixUnitaireEstime)?.toFixed(2)} €
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                    <ShoppingCartIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                    <p>Aucun article dans cet achat</p>
                                                </td>
                                            </tr>
                                        )}
                                        
                                        {/* Total */}
                                        {achat.achatLignes && achat.achatLignes.length > 0 && (
                                            <tr className="bg-gray-50">
                                                <td colSpan="5" className="px-6 py-4 text-right font-medium text-gray-700">
                                                    Total général :
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-xl text-emerald-600">
                                                        {totalAmount} €
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Section droite - Actions et métadonnées */}
                    <div className="space-y-6">
                        {/* Carte de résumé */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Résumé</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Nombre d'articles</span>
                                    <span className="font-medium">{achat.achatLignes?.length || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Statut</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${processConfig.labelColor}`}>
                                        {processConfig.label}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Créé le</span>
                                    <span className="font-medium">
                                        {new Date(achat.dateEffective).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                                <div className="pt-3 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-800 font-semibold">Total</span>
                                        <span className="text-2xl font-bold text-emerald-600">
                                            {totalAmount} €
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Carte des actions rapides */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions rapides</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={handlePrint}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                                >
                                    <PrinterIcon className="w-5 h-5 mr-3 text-gray-600" />
                                    <span>Imprimer le bon de commande</span>
                                </button>
                                
                                <button
                                    onClick={() => console.log('Envoyer par email')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                                >
                                    <EnvelopeIcon className="w-5 h-5 mr-3 text-gray-600" />
                                    <span>Envoyer par email</span>
                                </button>
                                
                                <button
                                    onClick={() => navigate(`/achats/edit/${achat.id}`)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                                >
                                    <PencilIcon className="w-5 h-5 mr-3 text-gray-600" />
                                    <span>Modifier l'achat</span>
                                </button>
                                
                                {processConfig.showCancel && (
                                    <button
                                        onClick={handleCancel}
                                        className="w-full px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center"
                                    >
                                        <TrashIcon className="w-5 h-5 mr-3" />
                                        <span>Annuler l'achat</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Carte d'historique des actions */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Historique des étapes</h3>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">Création de l'achat</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(achat.dateEffective).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                            <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">Validation magasinier</p>
                                        <p className="text-sm text-gray-500">
                                            En attente
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Vous pouvez ajouter plus d'étapes ici selon l'état actuel */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
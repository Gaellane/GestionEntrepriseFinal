import React, { useEffect, useState } from 'react';
import { fetchAchatAll } from '../../api/achatApi';
import { useNavigate } from 'react-router-dom';
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
  ChevronUpIcon
} from '@heroicons/react/24/outline';

const AchatList = () => {
  const [achats, setAchats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAchats, setExpandedAchats] = useState({}); // Pour suivre quels achats sont dépliés
  const navigate = useNavigate();   

  const fetchAchat = async () => {
    try {
      setLoading(true);
      const data = await fetchAchatAll();
      setAchats(data || []);
      
      // Initialiser l'état des achats dépliés (tous fermés par défaut)
      const initialExpandedState = {};
      data?.forEach(achat => {
        initialExpandedState[achat.id] = false;
      });
      setExpandedAchats(initialExpandedState);
    } catch (err) {
      setError('Erreur lors du chargement des achats');
      console.error('Error fetching achats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (achatId) => {
    navigate(`/achats/details/${achatId}`);
  };

  // Toggle l'affichage des lignes d'articles
  const toggleExpandAchat = (achatId) => {
    setExpandedAchats(prev => ({
      ...prev,
      [achatId]: !prev[achatId]
    }));
  };

  // Toggle tous les achats
  const toggleAllAchats = () => {
    const allExpanded = Object.values(expandedAchats).every(val => val === true);
    
    const newState = {};
    achats.forEach(achat => {
      newState[achat.id] = !allExpanded;
    });
    setExpandedAchats(newState);
  };

  useEffect(() => {
    fetchAchat();
  }, []);

  // Calculer le montant total d'un achat
  const calculerMontantTotal = (achat) => {
    if (!achat.achatLignes || achat.achatLignes.length === 0) return 0;
    
    return achat.achatLignes.reduce((total, ligne) => {
      return total + (ligne.quantite * ligne.prixUnitaire);
    }, 0).toFixed(2);
  };

  // Déterminer les boutons et labels selon la valeur du processus
  const getProcessConfig = (valeur) => {
    switch (valeur) {
      case 1:
        return {
          buttonText: "Valider Magasinier",
          buttonColor: "from-emerald-500 to-green-600",
          buttonIcon: CheckCircleIcon,
          label: "Créé",
          labelColor: "bg-blue-100 text-blue-800",
          showCancel: true
        };
      case 11:
        return {
          buttonText: "Valider Financier",
          buttonColor: "from-purple-500 to-indigo-600",
          buttonIcon: BanknotesIcon,
          label: "Validé Magasinier",
          labelColor: "bg-emerald-100 text-emerald-800",
          showCancel: true
        };
      case 21:
        return {
          buttonText: "Lancer Commande",
          buttonColor: "from-orange-500 to-amber-600",
          buttonIcon: TruckIcon,
          label: "Validé",
          labelColor: "bg-purple-100 text-purple-800",
          showCancel: false
        };
      case 31:
        return {
          buttonText: "Réception",
          buttonColor: "from-cyan-500 to-blue-600",
          buttonIcon: ArchiveBoxIcon,
          label: "En Commande",
          labelColor: "bg-orange-100 text-orange-800",
          showCancel: false
        };
      case 41:
        return {
          buttonText: null, // Pas de bouton
          buttonColor: "",
          buttonIcon: null,
          label: "Réceptionné",
          labelColor: "bg-cyan-100 text-cyan-800",
          showCancel: false
        };
      case 0:
        return {
          buttonText: "Ré-Envoyer",
          buttonColor: "from-red-500 to-pink-600",
          buttonIcon: ArrowPathIcon,
          label: "Annulé",
          labelColor: "bg-red-100 text-red-800",
          showCancel: false
        };
      default:
        return {
          buttonText: "Action",
          buttonColor: "from-gray-500 to-gray-600",
          buttonIcon: DocumentTextIcon,
          label: "Inconnu",
          labelColor: "bg-gray-100 text-gray-800",
          showCancel: false
        };
    }
  };

  // Gérer les actions des boutons
  const handleAction = (achatId, actionType) => {
    console.log(`Action ${actionType} sur achat ${achatId}`);
    // TODO: Implémenter la logique d'action
  };

  // Gérer l'annulation
  const handleCancel = (achatId) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cet achat ?')) {
      console.log(`Annulation achat ${achatId}`);
      // TODO: Implémenter la logique d'annulation
    }
  };

  // Compter le nombre d'achats avec lignes
  const achatsAvecLignes = achats.filter(achat => achat.achatLignes && achat.achatLignes.length > 0).length;
  const tousExpanded = Object.values(expandedAchats).every(val => val === true) && achatsAvecLignes > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des achats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <XCircleIcon className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAchat}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center mx-auto"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
                <ShoppingCartIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Liste des Achats</h1>
                <p className="text-gray-600">{achats.length} achat(s) au total</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {achatsAvecLignes > 0 && (
                <button
                  onClick={toggleAllAchats}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                >
                  {tousExpanded ? (
                    <>
                      <ChevronUpIcon className="w-4 h-4 mr-2" />
                      <span>Réduire tout</span>
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="w-4 h-4 mr-2" />
                      <span>Déplier tout</span>
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={fetchAchat}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                <span>Actualiser</span>
              </button>
            </div>
          </div>
        </div>

        {/* Achats List */}
        <div className="space-y-6">
          {achats.length > 0 ? (
            achats.map((achat) => {
              const processConfig = getProcessConfig(achat.process?.valeur || 0);
              const ButtonIcon = processConfig.buttonIcon;
              const isExpanded = expandedAchats[achat.id];
              const hasLignes = achat.achatLignes && achat.achatLignes.length > 0;
              
              return (
                <div key={achat.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Header de l'achat */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {achat.refe}
                          </h3>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-sm text-gray-600 flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              {new Date(achat.dateEffective).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="text-sm text-gray-600 flex items-center">
                              <UserIcon className="w-4 h-4 mr-1" />
                              {achat.demandeur}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${processConfig.labelColor}`}>
                              {processConfig.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 md:mt-0 flex items-center space-x-2">
                        {/* Bouton principal */}
                        {processConfig.buttonText && (
                          <button
                            onClick={() => handleAction(achat.id, processConfig.buttonText)}
                            className={`px-4 py-2 bg-gradient-to-r ${processConfig.buttonColor} text-white rounded-lg hover:opacity-90 transition-all flex items-center space-x-2`}
                          >
                            {ButtonIcon && <ButtonIcon className="w-4 h-4" />}
                            <span>{processConfig.buttonText}</span>
                          </button>
                        )}
                        
                        {/* Bouton annuler */}
                        {processConfig.showCancel && (
                          <button
                            onClick={() => handleCancel(achat.id)}
                            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all flex items-center space-x-2"
                          >
                            <XCircleIcon className="w-4 h-4" />
                            <span>Annuler</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Détails de l'achat */}
                  <div className="px-6 py-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Processus</h4>
                        <div className="flex items-center space-x-2">
                          <div className="p-1 bg-purple-50 rounded">
                            <ClockIcon className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <span className="text-sm text-gray-900">{achat.process?.processName}</span>
                            <p className="text-xs text-gray-500">Étape {achat.process?.valeur}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Informations</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">ID:</span>
                            <span className="text-sm font-medium">{achat.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Process:</span>
                            <span className="text-sm font-medium">{achat.achatProcess?.abreviation}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Montant</h4>
                        <div className="flex items-center space-x-2">
                          <CurrencyEuroIcon className="w-5 h-5 text-emerald-600" />
                          <span className="text-xl font-bold text-emerald-600">
                            {calculerMontantTotal(achat)} €
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {achat.achatLignes?.length || 0} article(s)
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bouton pour afficher/réduire les lignes */}
                  {hasLignes && (
                    <div className="px-6 py-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        
                        <button
                            onClick={() => toggleExpandAchat(achat.id)}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                            {isExpanded ? (
                                <>
                                <ChevronUpIcon className="w-4 h-4" />
                                <span className="text-sm font-medium">Réduire les articles</span>
                            </>
                            ) : (
                                <>
                                <ChevronDownIcon className="w-4 h-4" />
                                <span className="text-sm font-medium">Afficher les articles ({achat.achatLignes.length})</span>
                            </>
                            )}
                        </button>
                        </div>
                         <div className="flex space-x-3">
                            <button
                            onClick={() => handleViewDetails(achat.id)}
                            className="px-3 py-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors flex items-center space-x-1"
                            >
                            <EyeIcon className="w-4 h-4" />
                            <span className="text-sm">Détails complets</span>
                            </button>
                        </div>

                            
                           
                      </div>
                    </div>
                  )}
                  
                  {/* Lignes d'achat (conditionnellement affichées) */}
                  {hasLignes && isExpanded && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center justify-between">
                        <span>Articles commandés</span>
                        <button
                          onClick={() => toggleExpandAchat(achat.id)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Réduire
                        </button>
                      </h4>
                      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Article
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quantité
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Prix unitaire
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {achat.achatLignes.map((ligne, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {ligne.article?.articleNom || 'Article non spécifié'}
                                    </div>
                                    {ligne.article?.refe && (
                                      <div className="text-xs text-gray-500">{ligne.article.refe}</div>
                                    )}
                                    {ligne.article?.description && (
                                      <div className="text-xs text-gray-400 truncate max-w-xs">
                                        {ligne.article.description}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-gray-900">{ligne.quantite}</div>
                                  {ligne.article?.unite?.abreviation && (
                                    <div className="text-xs text-gray-500">
                                      {ligne.article.unite.abreviation}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-gray-900">{ligne.prixUnitaire?.toFixed(2)} €</div>
                                  <div className="text-xs text-gray-500">unitaire</div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="font-medium text-emerald-600">
                                    {(ligne.quantite * ligne.prixUnitaire)?.toFixed(2)} €
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {/* Ligne de total */}
                            <tr className="bg-gray-50">
                              <td colSpan="3" className="px-4 py-3 text-right font-medium text-gray-700">
                                Total :
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-bold text-lg text-emerald-600">
                                  {calculerMontantTotal(achat)} €
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {/* Actions secondaires */}
                  <div className="px-6 py-4 border-t border-gray-200">
                    
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16">
              <ShoppingCartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun achat trouvé</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Commencez par créer votre premier achat.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchatList;
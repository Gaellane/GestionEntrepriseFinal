import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchFournisseursAll,
  demandeProforma,
  fetchAchatById,
} from '../../api/achatApi';

import {
  PlusIcon,
  TrashIcon,
  CalendarIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  CheckIcon,
  ArrowUturnLeftIcon,
  CurrencyEuroIcon,
  ArchiveBoxIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  UserGroupIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

export default function DemandeProforma() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [achat, setAchat] = useState(null);
  const [allFournisseurs, setAllFournisseurs] = useState([]);
  const [selectedFournisseurs, setSelectedFournisseurs] = useState([]);
  const [filteredFournisseurs, setFilteredFournisseurs] = useState([]);
  const [existingFournisseurs, setExistingFournisseurs] = useState([]);
  const [newFournisseurs, setNewFournisseurs] = useState([]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Charger l'achat et les fournisseurs
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Charger l'achat
        const achatData = await fetchAchatById(id);
        setAchat(achatData);
        
        // Charger tous les fournisseurs
        const fournisseursData = await fetchFournisseursAll();
        setAllFournisseurs(fournisseursData);
        setFilteredFournisseurs(fournisseursData);

        // Si l'achat a déjà des fournisseurs sélectionnés
        if (achatData.fournisseurIds && achatData.fournisseurIds.length > 0) {
          // Trouver les fournisseurs existants
          const existing = fournisseursData.filter(f => 
            achatData.fournisseurIds.includes(f.id)
          );
          setExistingFournisseurs(existing);
          
          // Filtrer les fournisseurs non encore sélectionnés
          const availableFournisseurs = fournisseursData.filter(f => 
            !achatData.fournisseurIds.includes(f.id)
          );
          setFilteredFournisseurs(availableFournisseurs);
        }
        
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Mettre à jour les nouveaux fournisseurs sélectionnés
  useEffect(() => {
    // Filtrer pour n'avoir que les nouveaux fournisseurs (non existants)
    const newSelected = selectedFournisseurs.filter(id => 
      !existingFournisseurs.some(f => f.id === id)
    );
    setNewFournisseurs(newSelected);
  }, [selectedFournisseurs, existingFournisseurs]);

  // Filtrer les fournisseurs disponibles
  useEffect(() => {
    if (!searchTerm.trim()) {
      // Afficher tous les fournisseurs non encore sélectionnés
      const availableFournisseurs = allFournisseurs.filter(f => 
        !existingFournisseurs.some(existing => existing.id === f.id)
      );
      setFilteredFournisseurs(availableFournisseurs);
      return;
    }

    const filtered = allFournisseurs.filter(fournisseur => {
      // Exclure les fournisseurs déjà existants
      if (existingFournisseurs.some(existing => existing.id === fournisseur.id)) {
        return false;
      }

      const searchLower = searchTerm.toLowerCase();
      return (
        (fournisseur.nom && fournisseur.nom.toLowerCase().includes(searchLower)) ||
        (fournisseur.email && fournisseur.email.toLowerCase().includes(searchLower)) ||
        (fournisseur.telephone && fournisseur.telephone.includes(searchTerm)) ||
        (fournisseur.adresse && fournisseur.adresse.toLowerCase().includes(searchLower)) ||
        (fournisseur.ville && fournisseur.ville.toLowerCase().includes(searchLower))
      );
    });
    
    setFilteredFournisseurs(filtered);
  }, [searchTerm, allFournisseurs, existingFournisseurs]);

  // Calculer le total estimé de l'achat
  const calculerTotalEstime = () => {
    if (!achat || !achat.achatLignes) return 0;
    return achat.achatLignes.reduce((total, ligne) => {
      return total + (ligne.quantite * (ligne.prixUnitaireEstime || ligne.prixUnitaire || 0));
    }, 0).toFixed(2);
  };

  // Calculer la quantité totale
  const calculerQuantiteTotale = () => {
    if (!achat || !achat.achatLignes) return 0;
    return achat.achatLignes.reduce((total, ligne) => total + ligne.quantite, 0);
  };

  // Gérer la sélection des nouveaux fournisseurs
  const handleFournisseurToggle = (fournisseurId) => {
    setSelectedFournisseurs(prev => {
      if (prev.includes(fournisseurId)) {
        return prev.filter(id => id !== fournisseurId);
      } else {
        return [...prev, fournisseurId];
      }
    });
  };

  // Sélectionner tous les fournisseurs disponibles
  const handleSelectAll = () => {
    if (selectedFournisseurs.length === filteredFournisseurs.length) {
      // Désélectionner tous les nouveaux fournisseurs
      setSelectedFournisseurs(prev => 
        prev.filter(id => existingFournisseurs.some(f => f.id === id))
      );
    } else {
      // Sélectionner tous les fournisseurs disponibles + garder les existants
      const allAvailableIds = filteredFournisseurs.map(f => f.id);
      setSelectedFournisseurs(prev => {
        const existingIds = existingFournisseurs.map(f => f.id);
        return [...new Set([...existingIds, ...prev, ...allAvailableIds])];
      });
    }
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Seuls les nouveaux fournisseurs seront envoyés
    const fournisseursToSend = newFournisseurs;
    
    if (fournisseursToSend.length === 0) {
      setError('Veuillez sélectionner au moins un nouveau fournisseur');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      // Créer les commandeCreateDTOs uniquement pour les nouveaux fournisseurs
      const commandeCreateDTOs = fournisseursToSend.map(fournisseurId => ({
        achatId: parseInt(id),
        fournisseurId: fournisseurId
      }));

      const response = await demandeProforma(id, commandeCreateDTOs);
      
      if (response.ok) {
        setSuccess('Demande de proforma envoyée avec succès aux nouveaux fournisseurs !');
        
        // Mettre à jour la liste des fournisseurs existants
        const newlyAddedFournisseurs = allFournisseurs.filter(f => 
          fournisseursToSend.includes(f.id)
        );
        setExistingFournisseurs(prev => [...prev, ...newlyAddedFournisseurs]);
        
        // Réinitialiser la sélection
        setSelectedFournisseurs([]);
        setNewFournisseurs([]);
        
        // Filtrer les fournisseurs disponibles
        const availableFournisseurs = allFournisseurs.filter(f => 
          ![...existingFournisseurs, ...newlyAddedFournisseurs].some(existing => existing.id === f.id)
        );
        setFilteredFournisseurs(availableFournisseurs);
        
        // Redirection après délai
        setTimeout(() => {
          navigate('/achats/fiche/' + id);
        }, 2000);
      } else {
        throw new Error('Erreur lors de l\'envoi de la demande');
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (!achat) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Achat non trouvé</h2>
          <p className="text-gray-600 mb-4">L'achat #{id} n'existe pas ou n'est pas accessible.</p>
          <button
            onClick={() => navigate('/achats')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Retour aux achats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Demande de Proforma</h1>
              <p className="text-gray-600">
                {existingFournisseurs.length > 0 
                  ? `Ajouter des fournisseurs pour l'achat ${achat.refe}`
                  : `Envoyez une demande de proforma pour l'achat ${achat.refe}`
                }
              </p>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => navigate('/achats')}
              className="inline-flex items-center text-sm text-gray-600 hover:text-emerald-700 transition-colors"
            >
              <ArrowUturnLeftIcon className="w-4 h-4 mr-1" />
              Retour aux achats
            </button>
          </div>
        </div>

        {/* Messages d'erreur/succès */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <ExclamationCircleIcon className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center">
              <CheckIcon className="w-5 h-5 text-emerald-600 mr-2" />
              <p className="text-emerald-700">{success}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Information Achat */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 h-full">
                <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200 flex items-center">
                  <InformationCircleIcon className="w-5 h-5 mr-2 text-emerald-600" />
                  Informations Achat
                </h2>
                
                <div className="space-y-6">
                  {/* Référence Achat */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Référence Achat
                    </label>
                    <div className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <span className="font-bold text-emerald-700">#{achat.refe}</span>
                    </div>
                  </div>

                  {/* Statut Achat */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut de l'achat
                    </label>
                    <div className="flex items-center">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        achat.process?.valeur === 25 
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {achat.process?.processName || 'DEMANDE PROFORMA'}
                      </div>
                    </div>
                  </div>

                  {/* Date effective */}
                  {achat.dateEffective && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        Date effective
                      </label>
                      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg">
                        <span className="text-gray-900">{formatDate(achat.dateEffective)}</span>
                      </div>
                    </div>
                  )}

                  {/* Demandeur */}
                  {achat.demandeur && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Demandeur
                      </label>
                      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg">
                        <span className="text-gray-900">{achat.demandeur}</span>
                      </div>
                    </div>
                  )}

                  {/* Récapitulatif Achat */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Récapitulatif Achat</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Nombre d'articles :</span>
                        <span className="font-medium text-gray-900">
                          {achat.achatLignes?.length || 0}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Quantité totale :</span>
                        <span className="font-medium text-gray-900">
                          {calculerQuantiteTotale()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-sm font-medium text-gray-700">Total estimé :</span>
                        <div className="text-lg font-bold text-emerald-600">
                          {calculerTotalEstime()} €
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Récapitulatif Fournisseurs */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Fournisseurs</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Déjà sélectionnés :</span>
                        <span className="font-medium text-gray-900">
                          {existingFournisseurs.length}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Nouveaux sélectionnés :</span>
                        <span className="font-medium text-gray-900">
                          {newFournisseurs.length}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Disponibles :</span>
                        <span className="font-medium text-gray-900">
                          {filteredFournisseurs.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bouton d'envoi */}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={submitting || newFournisseurs.length === 0}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center ${
                        submitting || newFournisseurs.length === 0
                          ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                          : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                      }`}
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <UserPlusIcon className="w-5 h-5 mr-2" />
                          Envoyer aux nouveaux ({newFournisseurs.length})
                        </>
                      )}
                    </button>
                    
                    {newFournisseurs.length === 0 && (
                      <p className="text-sm text-amber-600 mt-2 text-center">
                        Sélectionnez au moins un nouveau fournisseur
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sélection des fournisseurs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Section Fournisseurs déjà sélectionnés */}
              {existingFournisseurs.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200 flex items-center">
                    <CheckIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Fournisseurs Déjà Sélectionnés
                  </h2>
                  
                  <div className="space-y-3">
                    {existingFournisseurs.map(fournisseur => (
                      <div
                        key={fournisseur.id}
                        className="p-4 border border-blue-200 bg-blue-50 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="mt-1 w-6 h-6 rounded-full border border-blue-500 bg-blue-500 flex items-center justify-center flex-shrink-0">
                              <CheckIcon className="w-4 h-4 text-white" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-medium text-gray-900">
                                  {fournisseur.nom || fournisseur.name || `Fournisseur ${fournisseur.id}`}
                                </h3>
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                  Déjà ajouté
                                </span>
                              </div>
                              
                              <div className="space-y-1">
                                {fournisseur.email && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <span className="w-20 flex-shrink-0">Email :</span>
                                    <span className="font-medium">{fournisseur.email}</span>
                                  </div>
                                )}
                                
                                {fournisseur.telephone && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <span className="w-20 flex-shrink-0">Téléphone :</span>
                                    <span className="font-medium">{fournisseur.telephone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section Ajouter de nouveaux fournisseurs */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <UserPlusIcon className="w-5 h-5 mr-2 text-emerald-600" />
                    <h2 className="text-lg font-semibold text-gray-800">
                      Ajouter de Nouveaux Fournisseurs
                    </h2>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-sm text-emerald-700 hover:text-emerald-800 font-medium flex items-center"
                  >
                    {selectedFournisseurs.filter(id => 
                      !existingFournisseurs.some(f => f.id === id)
                    ).length === filteredFournisseurs.length ? (
                      <>
                        <TrashIcon className="w-4 h-4 mr-1" />
                        Tout désélectionner
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-4 h-4 mr-1" />
                        Tout sélectionner
                      </>
                    )}
                  </button>
                </div>

                {/* Information */}
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-start">
                    <InformationCircleIcon className="w-5 h-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-emerald-700">
                        <span className="font-semibold">Sélectionnez les nouveaux fournisseurs</span> 
                        à qui envoyer une demande de proforma. Seuls les nouveaux fournisseurs sélectionnés 
                        recevront la demande.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un fournisseur par nom, email, téléphone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {filteredFournisseurs.length} fournisseur(s) disponible(s)
                  </p>
                </div>

                {/* Liste des fournisseurs disponibles */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {filteredFournisseurs.map(fournisseur => {
                    const isSelected = selectedFournisseurs.includes(fournisseur.id);
                    const isExisting = existingFournisseurs.some(f => f.id === fournisseur.id);

                    return (
                      <div
                        key={fournisseur.id}
                        className={`p-4 border rounded-lg transition-all cursor-pointer hover:shadow-md ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 bg-white'
                        } ${isExisting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !isExisting && handleFournisseurToggle(fournisseur.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className={`mt-1 w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'bg-white border-gray-300'
                            } ${isExisting ? 'bg-gray-300 border-gray-400' : ''}`}>
                              {isSelected && !isExisting && (
                                <CheckIcon className="w-4 h-4 text-white" />
                              )}
                              {isExisting && (
                                <CheckIcon className="w-4 h-4 text-gray-500" />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className={`font-medium ${
                                  isExisting ? 'text-gray-500' : 'text-gray-900'
                                }`}>
                                  {fournisseur.nom || fournisseur.name || `Fournisseur ${fournisseur.id}`}
                                </h3>
                                {isExisting && (
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                    Déjà ajouté
                                  </span>
                                )}
                              </div>
                              
                              <div className="space-y-1">
                                {fournisseur.email && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <span className="w-20 flex-shrink-0">Email :</span>
                                    <span className="font-medium">{fournisseur.email}</span>
                                  </div>
                                )}
                                
                                {fournisseur.telephone && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <span className="w-20 flex-shrink-0">Téléphone :</span>
                                    <span className="font-medium">{fournisseur.telephone}</span>
                                  </div>
                                )}
                                
                                {(fournisseur.adresse || fournisseur.ville) && (
                                  <div className="flex items-start text-sm text-gray-600">
                                    <span className="w-20 flex-shrink-0 mt-1">Adresse :</span>
                                    <div>
                                      {fournisseur.adresse && (
                                        <div>{fournisseur.adresse}</div>
                                      )}
                                      {fournisseur.ville && (
                                        <div className="text-gray-500">{fournisseur.ville}</div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {fournisseur.description && (
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {fournisseur.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {isSelected && !isExisting && (
                            <div className="flex-shrink-0 ml-2">
                              <div className="p-1 bg-emerald-100 rounded-full">
                                <PlusIcon className="w-4 h-4 text-emerald-600" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Aucun fournisseur disponible */}
                {filteredFournisseurs.length === 0 && (
                  <div className="text-center py-12">
                    <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      {existingFournisseurs.length > 0 
                        ? 'Tous les fournisseurs sont déjà sélectionnés'
                        : 'Aucun fournisseur disponible'
                      }
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm 
                        ? `Aucun résultat pour "${searchTerm}"`
                        : "Tous les fournisseurs ont déjà été ajoutés à cette demande."
                      }
                    </p>
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Voir tous les fournisseurs
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
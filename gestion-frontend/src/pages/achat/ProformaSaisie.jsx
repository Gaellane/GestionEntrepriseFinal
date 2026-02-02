import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { fetchAchatById, fetchFournisseurById, saveProforma } from "../../api/achatApi";
import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  ShoppingBagIcon,
  BuildingOfficeIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  ArrowPathIcon,
  XCircleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  PaperClipIcon,
  TrashIcon,
  CalculatorIcon,
  PrinterIcon,
  EyeIcon,
  ShareIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CubeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function ProformaSaisie() {
  const { achatId, fournisseurId } = useParams();
  const navigate = useNavigate();
  
  // États principaux
  const [achat, setAchat] = useState(null);
  const [fournisseur, setFournisseur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // État pour le formulaire de proforma
  const [proforma, setProforma] = useState({
    refe: '',
    dateProforma: '', // Nouveau champ pour la date du proforma
    dateEntree: new Date().toISOString().split('T')[0],
    montantTotal: 0,
    lienFichier: '',
    lignes: []
  });
  
  // États pour UI
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Charger l'achat
        const achatData = await fetchAchatById(achatId);
        setAchat(achatData);
        console.log('Achat data loaded:', achatData);
        
        // Charger le fournisseur
        let fournisseurData;
        try {
          fournisseurData = await fetchFournisseurById(fournisseurId);
        } catch (err) {
          console.warn('Fournisseur non trouvé, utilisation des données par défaut:', err);
          fournisseurData = {
            id: parseInt(fournisseurId),
            fournisseurNom: `Fournisseur ${fournisseurId}`,
            contact: 'Non spécifié',
            adresse: 'Non spécifié',
            coordonneeBancaire: 'Non spécifié'
          };
        }
        
        setFournisseur(fournisseurData);
        console.log('Fournisseur data loaded:', fournisseurData);

        // Générer une référence automatique
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const refe = `PROF-${achatData?.refe?.substring(0, 6) || 'ACH'}-${fournisseurData?.fournisseurNom?.substring(0, 3).toUpperCase() || 'FOUR'}-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
        
        // Pré-remplir les lignes avec les articles de l'achat
        const lignesInitiales = achatData?.achatLignes?.map(ligne => ({
          articleId: ligne.articleId,
          articleNom: ligne.articleNom,
          articleRefe: ligne.articleRefe,
          quantite: ligne.quantite || 0,
          prixUnitaire: ligne.prixUnitaireEstime || ligne.prixUnitaire || 0,
          montantTotal: (ligne.quantite || 0) * (ligne.prixUnitaireEstime || ligne.prixUnitaire || 0)
        })) || [];
        
        console.log('Lignes initiales créées:', lignesInitiales);
        
        // Calculer le montant total initial
        const montantTotalInitial = lignesInitiales.reduce((sum, ligne) => sum + (ligne.montantTotal || 0), 0);
        
        setProforma({
          refe,
          dateProforma: todayStr, // Date par défaut = aujourd'hui
          achatId: parseInt(achatId),
          fournisseurId: parseInt(fournisseurId),
          dateEntree: new Date().toISOString().split('T')[0],
          lienFichier: '',
          lignes: lignesInitiales,
          montantTotal: montantTotalInitial
        });
        
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    console.log('Params:', { achatId, fournisseurId });
    if (achatId && fournisseurId) {
      loadData();
    }
  }, [achatId, fournisseurId]);

  // Calculer le montant total
  const calculateTotal = (lignes) => {
    return lignes.reduce((sum, ligne) => {
      const ligneTotal = (ligne.quantite || 0) * (ligne.prixUnitaire || 0);
      return sum + (isNaN(ligneTotal) ? 0 : ligneTotal);
    }, 0);
  };

  // Mettre à jour une ligne
  const updateLigne = (index, field, value) => {
    const updatedLignes = [...proforma.lignes];
    const numValue = parseFloat(value) || 0;
    
    updatedLignes[index][field] = numValue;
    
    // Recalculer le montant total de la ligne
    updatedLignes[index].montantTotal = 
      (updatedLignes[index].quantite || 0) * (updatedLignes[index].prixUnitaire || 0);
    
    // Mettre à jour l'état
    setProforma(prev => ({ 
      ...prev, 
      lignes: updatedLignes,
      montantTotal: calculateTotal(updatedLignes)
    }));
  };

  // Supprimer une ligne
  const handleRemoveLigne = (index) => {
    const updatedLignes = proforma.lignes.filter((_, i) => i !== index);
    setProforma(prev => ({ 
      ...prev, 
      lignes: updatedLignes,
      montantTotal: calculateTotal(updatedLignes)
    }));
  };

  // Gérer le fichier
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Ici, vous devrez uploader le fichier sur votre serveur
      // Pour l'exemple, on simule un lien
      setProforma(prev => ({
        ...prev,
        lienFichier: `/uploads/proformas/${file.name}`
      }));
    }
  };

  // Sauvegarder le proforma
  const handleSave = async () => {
    if (proforma.lignes.length === 0) {
      alert('Veuillez ajouter au moins un article');
      return;
    }
    
    // Validation de la référence
    if (!proforma.refe.trim()) {
      alert('Veuillez saisir une référence pour le proforma');
      return;
    }
    
    // Validation des lignes
    const lignesInvalid = proforma.lignes.filter(l => 
      !l.articleId || l.quantite <= 0 || l.prixUnitaire <= 0
    );
    
    if (lignesInvalid.length > 0) {
      alert('Veuillez vérifier que tous les articles ont une quantité et un prix unitaire valides');
      return;
    }
    
    setIsSaving(true);
    try {
      // Préparer les données au format DTO
      const proformaData = {
        refe: proforma.refe,
        dateProforma: proforma.dateProforma || new Date().toISOString().split('T')[0], // Si date vide, utiliser aujourd'hui
        achatId: proforma.achatId,
        fournisseurId: proforma.fournisseurId,
        lienFichier: proforma.lienFichier || '',
        lignes: proforma.lignes.map(ligne => ({
          articleId: ligne.articleId,
          quantite: parseFloat(ligne.quantite) || 0,
          prixUnitaire: parseFloat(ligne.prixUnitaire) || 0
        }))
      };
      
      console.log('Données à envoyer:', JSON.stringify(proformaData, null, 2));
      
      // Appeler l'API pour sauvegarder
      const response = await saveProforma(proformaData);
      
      alert('Proforma sauvegardée avec succès!');
      navigate(-1); // Retour à la page précédente
      
    } catch (err) {
      alert('Erreur lors de la sauvegarde: ' + (err.message || 'Veuillez réessayer'));
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Gestionnaire pour la date du proforma
  const handleDateChange = (date) => {
    setProforma(prev => ({ 
      ...prev, 
      dateProforma: date || new Date().toISOString().split('T')[0] 
    }));
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
            onClick={() => window.location.reload()}
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
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Saisie de Proforma</h1>
                <p className="text-gray-600">
                  Création pour l'achat {achat?.refe}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                {showAdvanced ? (
                  <>
                    <ChevronUpIcon className="w-4 h-4 mr-2" />
                    <span>Options réduites</span>
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="w-4 h-4 mr-2" />
                    <span>Options avancées</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleSave}
                disabled={isSaving || proforma.lignes.length === 0 || !proforma.refe.trim()}
                className={`px-6 py-2 rounded-lg transition-colors flex items-center ${
                  isSaving || proforma.lignes.length === 0 || !proforma.refe.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:opacity-90'
                }`}
              >
                {isSaving ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                    <span>Sauvegarde...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    <span>Sauvegarder la Proforma</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Informations principales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Carte Achat */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <ShoppingBagIcon className="w-5 h-5 mr-2 text-blue-600" />
                Informations Achat
              </h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {achat?.process?.processName}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Référence</span>
                <span className="font-semibold text-gray-900">{achat?.refe}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Demandeur</span>
                <span className="text-gray-900">{achat?.demandeur}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Date</span>
                <span className="text-gray-900 flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  {new Date(achat?.dateEffective).toLocaleDateString('fr-FR')}
                </span>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Nombre d'articles</span>
                  <span className="font-medium text-gray-900">{achat?.achatLignes?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Carte Fournisseur */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <BuildingOfficeIcon className="w-5 h-5 mr-2 text-green-600" />
                Fournisseur
              </h3>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {fournisseur?.fournisseurNom}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-500">Contact</span>
                <span className="text-gray-900 text-right">{fournisseur?.contact || 'Non spécifié'}</span>
              </div>
              
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-500">Adresse</span>
                <span className="text-gray-900 text-right">{fournisseur?.adresse || 'Non spécifié'}</span>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-500">Coordonnées bancaires</span>
                  <span className="text-gray-900 font-mono text-sm text-right">
                    {fournisseur?.coordonneeBancaire || 'Non spécifié'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Carte Proforma */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2 text-purple-600" />
                Détails Proforma
              </h3>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                En création
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Référence Proforma *
                </label>
                <input
                  type="text"
                  value={proforma.refe}
                  onChange={(e) => setProforma(prev => ({ ...prev, refe: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="PROF-ACH-FOUR-20240101"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date du Proforma *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={proforma.dateProforma}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <CalendarIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    {!proforma.dateProforma && (
                      <button
                        onClick={() => handleDateChange(new Date().toISOString().split('T')[0])}
                        className="absolute right-2 top-2 text-xs text-emerald-600 hover:text-emerald-700"
                        type="button"
                      >
                        Aujourd'hui
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Laisser vide pour utiliser la date d'aujourd'hui
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant Total
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                    <CurrencyEuroIcon className="w-5 h-5 text-emerald-600 mr-2" />
                    <span className="text-xl font-bold text-emerald-600">
                      {proforma.montantTotal.toLocaleString('fr-FR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fichier Proforma
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
                      <PaperClipIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm text-gray-600">
                        {proforma.lienFichier ? 'Fichier joint' : 'Cliquer pour ajouter un fichier'}
                      </span>
                      {proforma.lienFichier && (
                        <p className="text-xs text-emerald-600 mt-1">{proforma.lienFichier.split('/').pop()}</p>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                    />
                  </label>
                  {proforma.lienFichier && (
                    <button
                      onClick={() => setProforma(prev => ({ ...prev, lienFichier: '' }))}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des lignes - Articles de l'achat */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <CubeIcon className="w-5 h-5 mr-2 text-gray-600" />
                Articles de l'Achat ({proforma.lignes.length})
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Modifiez seulement la quantité et le prix unitaire)
                </span>
              </h3>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Montant total:
                  <span className="ml-2 text-xl font-bold text-emerald-600">
                    {proforma.montantTotal.toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} €
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {proforma.lignes.length > 0 ? (
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
                      Prix Unitaire (€)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant Total (€)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {proforma.lignes.map((ligne, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {ligne.articleNom || 'Article non spécifié'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {ligne.articleRefe || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={ligne.quantite || ''}
                          onChange={(e) => updateLigne(index, 'quantite', e.target.value)}
                          className="w-32 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={ligne.prixUnitaire || ''}
                          onChange={(e) => updateLigne(index, 'prixUnitaire', e.target.value)}
                          className="w-32 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-emerald-600">
                          {(ligne.montantTotal || 0).toLocaleString('fr-FR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })} €
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleRemoveLigne(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer cet article"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Ligne totale */}
                  <tr className="bg-gray-50 border-t-2 border-gray-300">
                    <td colSpan="4" className="px-6 py-4 text-right font-bold text-gray-900 text-lg">
                      Total Général :
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-2xl text-emerald-600">
                        {proforma.montantTotal.toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} €
                      </div>
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <CubeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun article trouvé</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Aucun article n'a été trouvé dans cet achat.
              </p>
            </div>
          )}
        </div>

        {/* Options avancées */}
        {showAdvanced && (
          <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <CalculatorIcon className="w-5 h-5 mr-2 text-gray-600" />
              Options avancées
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarques supplémentaires
                </label>
                <textarea
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ajoutez des notes ou instructions pour cette proforma..."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conditions de paiement
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                  <option>À 30 jours</option>
                  <option>À 60 jours</option>
                  <option>À réception</option>
                  <option>50% à la commande, 50% à livraison</option>
                  <option>Autre</option>
                </select>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Délai de livraison
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      className="w-20 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="30"
                    />
                    <span className="text-gray-600">jours</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                >
                  <PrinterIcon className="w-4 h-4 mr-2" />
                  Imprimer
                </button>
                
                <button
                  onClick={() => {/* Action prévisualisation */}}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Prévisualiser
                </button>
                
                <button
                  onClick={() => {/* Action partage */}}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Partager
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Barre d'actions en bas */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Retour
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (window.confirm('Êtes-vous sûr de vouloir vider toutes les lignes?')) {
                  setProforma(prev => ({ ...prev, lignes: [], montantTotal: 0 }));
                }
              }}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Vider toutes les lignes
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSaving || proforma.lignes.length === 0 || !proforma.refe.trim()}
              className={`px-8 py-3 rounded-lg transition-colors flex items-center ${
                isSaving || proforma.lignes.length === 0 || !proforma.refe.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:opacity-90'
              }`}
            >
              {isSaving ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                  <span>Sauvegarde en cours...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Finaliser la Proforma</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import inventaireApi from '../../api/inventaireApi';
import stockApi from '../../api/stock';
import {
  DocumentTextIcon,
  PlusCircleIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  CubeIcon,
  ClipboardDocumentCheckIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function InventairePerform() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [depotId, setDepotId] = useState('');
  const [depots, setDepots] = useState([]);
  const [articles, setArticles] = useState([]);
  const [demandeInfo, setDemandeInfo] = useState(null);
  const [details, setDetails] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lines, setLines] = useState([{ articleId: '', quantity: '', note: '', currentStock: '' }]);

  // Chargement des données
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    const loadData = async () => {
      try {
        // Charger les données de formulaire
        const formData = await stockApi.getFormData();
        const data = formData && (formData.data || formData.payload || formData);
        const depotList = data && data.depots ? data.depots : (formData.depots || []);
        const articleList = data && data.articles ? data.articles : (formData.articles || []);
        
        if (mounted) {
          setDepots(Array.isArray(depotList) ? depotList : []);
          setArticles(Array.isArray(articleList) ? articleList : []);
          
          if (Array.isArray(depotList) && depotList.length > 0 && !depotId) {
            const firstDepot = depotList[0];
            setDepotId(firstDepot.id || firstDepot.depotId || firstDepot.depot_id || '');
          }
        }

        // Charger les informations de la demande si ID présent
        if (id) {
          try {
            const demandeRes = await inventaireApi.getDemande(id);
            const demandeData = demandeRes?.data || demandeRes;
            if (mounted && demandeData) {
              setDemandeInfo(demandeData);
              setDetails(demandeData.description || `Inventaire pour ${demandeData.depotName || 'dépôt'}`);
            }
          } catch (err) {
            console.warn('Impossible de charger les détails de la demande:', err);
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setMessage({
          type: 'error',
          text: 'Erreur lors du chargement des données. Veuillez réessayer.'
        });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => { mounted = false; };
  }, [id]);

  // Mise à jour du stock actuel quand l'article change
  const handleArticleChange = (index, articleId) => {
    const article = articles.find(a => a.id == articleId);
    updateLine(index, 'articleId', articleId);
    updateLine(index, 'currentStock', article?.stockActuel || 'N/A');
  };

  const addLine = () => setLines(prev => [...prev, { articleId: '', quantity: '', note: '', currentStock: '' }]);

  const removeLine = (index) => {
    if (lines.length > 1) {
      setLines(prev => prev.filter((_, i) => i !== index));
    } else {
      setLines([{ articleId: '', quantity: '', note: '', currentStock: '' }]);
    }
  };

  const updateLine = (index, field, value) => 
    setLines(prev => prev.map((ln, i) => i === index ? { ...ln, [field]: value } : ln));

  const validateForm = () => {
    const errors = [];
    
    // Vérifier les lignes
    lines.forEach((line, index) => {
      if (!line.articleId) {
        errors.push(`Ligne ${index + 1}: Veuillez sélectionner un article`);
      }
      if (!line.quantity || parseFloat(line.quantity) < 0) {
        errors.push(`Ligne ${index + 1}: Quantité invalide`);
      }
    });

    if (errors.length > 0) {
      setMessage({ type: 'error', text: errors.join(', ') });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      const payload = {
        inventaireId: id ? Number(id) : null,
        depotId: depotId ? Number(depotId) : null,
        description: details,
        lignes: lines.map(l => ({ 
          articleId: Number(l.articleId), 
          quantite: Number(l.quantity),
          note: l.note || ''
        }))
      };

      const res = await inventaireApi.performInventaire(undefined, payload);
      
      setMessage({ 
        type: 'success', 
        text: res?.message || 'Inventaire soumis avec succès!' 
      });

      // Redirection après succès
      setTimeout(() => {
        navigate('/inventaire/mes-demandes');
      }, 1500);

    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || err.message || 'Erreur lors de la soumission' 
      });
    } finally {
      setSaving(false);
    }
  };

  const clearForm = () => {
    setLines([{ articleId: '', quantity: '', note: '', currentStock: '' }]);
    setDetails('');
    setMessage(null);
  };

  const getLineTotal = (index) => {
    const line = lines[index];
    if (!line.quantity || !line.currentStock) return null;
    
    const current = parseFloat(line.currentStock) || 0;
    const counted = parseFloat(line.quantity) || 0;
    const difference = counted - current;
    
    return {
      difference,
      isMatch: Math.abs(difference) < 0.01,
      isOver: difference > 0,
      isUnder: difference < 0
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête avec navigation */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Retour
          </button>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-lg">
                <ClipboardDocumentCheckIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Réaliser l'inventaire {id ? `#${id}` : ''}
                </h1>
                <p className="text-gray-600 mt-1">
                  Comptez physiquement les articles et saisissez les quantités
                </p>
              </div>
            </div>
            
            {demandeInfo && (
              <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <InformationCircleIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Demande d'inventaire</p>
                    <p className="text-sm text-gray-600">
                      Dépôt: {demandeInfo.depotName || 'Non spécifié'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Formulaire principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne de gauche - Informations générales */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                Informations générales
              </h2>

              {/* Sélection du dépôt */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <BuildingOfficeIcon className="w-4 h-4" />
                  Dépôt *
                </label>
                <select
                  value={depotId}
                  onChange={(e) => setDepotId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                  required
                >
                  <option value="">Sélectionner un dépôt</option>
                  {depots.map(d => (
                    <option key={d.id} value={d.id || d.depotId}>
                      {d.depotName || d.nom || `Dépôt ${d.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Détails */}
              <div className="mb-8">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <DocumentTextIcon className="w-4 h-4" />
                  Observations
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Notes supplémentaires, anomalies observées, etc."
                />
              </div>

              {/* Statistiques */}
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Résumé</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Nombre de lignes:</span>
                    <span className="font-medium">{lines.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Articles sélectionnés:</span>
                    <span className="font-medium">
                      {lines.filter(l => l.articleId).length}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Tous les champs marqués d'un * sont obligatoires
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne de droite - Lignes d'inventaire */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* En-tête des lignes */}
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <CubeIcon className="w-5 h-5" />
                    Lignes d'inventaire
                  </h2>
                  <button
                    type="button"
                    onClick={addLine}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <PlusCircleIcon className="w-5 h-5" />
                    Ajouter une ligne
                  </button>
                </div>
              </div>

              {/* Messages */}
              {message && (
                <div className={`m-4 p-4 rounded-xl border-l-4 ${
                  message.type === 'success'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : 'bg-red-50 border-red-500 text-red-700'
                }`}>
                  <div className="flex items-center gap-2">
                    {message.type === 'success' ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      <ExclamationCircleIcon className="w-5 h-5" />
                    )}
                    <p className="font-medium">{message.text}</p>
                  </div>
                </div>
              )}

              {/* Liste des lignes */}
              <div className="p-4 md:p-6">
                <div className="space-y-4">
                  {lines.map((line, index) => {
                    const totalInfo = getLineTotal(index);
                    
                    return (
                      <div key={index} className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50/50 to-white">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-100 to-indigo-200 flex items-center justify-center">
                              <span className="font-semibold text-indigo-700">{index + 1}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              Ligne {index + 1}
                            </span>
                          </div>
                          {lines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLine(index)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer cette ligne"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          {/* Article */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Article *
                            </label>
                            <select
                              value={line.articleId}
                              onChange={(e) => handleArticleChange(index, e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                              required
                            >
                              <option value="">Sélectionner un article</option>
                              {articles.map(a => (
                                <option key={a.id} value={a.id}>
                                  {a.articleNom || a.refe || a.description || 
                                   a.code || a.reference || a.name || 
                                   a.nom || a.libelle || `Article ${a.id}`}
                                </option>
                              ))}
                            </select>
                            {line.currentStock && (
                              <p className="text-xs text-gray-500 mt-1">
                                Stock actuel: {line.currentStock}
                              </p>
                            )}
                          </div>

                          {/* Quantité comptée */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Quantité comptée *
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.quantity}
                              onChange={(e) => updateLine(index, 'quantity', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                              placeholder="0.00"
                              required
                            />
                          </div>

                          {/* Note */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Note
                            </label>
                            <input
                              type="text"
                              value={line.note}
                              onChange={(e) => updateLine(index, 'note', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                              placeholder="Observation..."
                            />
                          </div>
                        </div>

                        {/* Écart de stock */}
                        {totalInfo && (
                          <div className={`mt-4 pt-4 border-t ${
                            totalInfo.isMatch 
                              ? 'border-gray-200' 
                              : totalInfo.isOver 
                                ? 'border-emerald-200' 
                                : 'border-red-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Écart:</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${
                                  totalInfo.isMatch 
                                    ? 'text-gray-600' 
                                    : totalInfo.isOver 
                                      ? 'text-emerald-600' 
                                      : 'text-red-600'
                                }`}>
                                  {totalInfo.difference > 0 ? '+' : ''}{totalInfo.difference.toFixed(2)}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  totalInfo.isMatch 
                                    ? 'bg-gray-100 text-gray-600' 
                                    : totalInfo.isOver 
                                      ? 'bg-emerald-100 text-emerald-700' 
                                      : 'bg-red-100 text-red-700'
                                }`}>
                                  {totalInfo.isMatch ? 'Conforme' : totalInfo.isOver ? 'Surplus' : 'Manquant'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Boutons d'action */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={clearForm}
                      disabled={saving}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Réinitialiser
                    </button>
                    
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => navigate('/inventaire/mes-demandes')}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={saving}
                        className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                          saving
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
                        }`}
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="w-5 h-5" />
                            Soumettre l'inventaire
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Information supplémentaire */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
              <div className="flex items-start gap-3">
                <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Conseils pour l'inventaire</p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• Comptez physiquement chaque article avant de saisir</li>
                    <li>• Vérifiez les dates de péremption si applicable</li>
                    <li>• Notez toute anomalie dans les observations</li>
                    <li>• Signalez les écarts importants dans les notes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
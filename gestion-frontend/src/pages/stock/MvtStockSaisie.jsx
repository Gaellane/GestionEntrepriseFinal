import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SideBar from '../../components/layout/SideBar';
import { getFormData, submitMovements } from '../../api/stock';
import {
  DocumentTextIcon,
  ArchiveBoxIcon,
  PlusCircleIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CubeIcon,
  BuildingOfficeIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

const emptyRow = (type) => ({ 
  type: type || 'ENTREE', 
  articleId: '', 
  depotId: '', // for ENTREE
  depotSourceId: '', // for TRANSFER
  depotDestId: '',   // for TRANSFER
  quantite: '', 
  prixUnitaire: '', 
  raisonId: '', 
  description: '', 
  date: new Date().toISOString().slice(0, 16),
  datePeremption: '' 
});

export default function MvtStockSaisie() {
  const { type } = useParams();
  console.log(`[DEBUG] type ${type}`);
  // Gestion du type
  let defaultType;
  if (!type) {
    defaultType = 'ENTREE';
  } else if (!isNaN(Number(type))) {
    const numType = Number(type);
    if (numType === 1) {
      defaultType = 'ENTREE';
    } else if (numType === 2) {
      defaultType = 'SORTIE';
    } else if (numType === 3) {
      defaultType = 'TRANSFER';
    } else {
      defaultType = 'ENTREE'; // default fallback
    }
  } else {
    const t = type.toString().toUpperCase();
    if (t === 'SORTIE') {
      defaultType = 'SORTIE';
    } else if (t === 'TRANSFER' || t === 'TRANSFERT' || t === 'TRANSFERENCE') {
      // accept english/french variants
      defaultType = 'TRANSFER';
    } else if (t === 'ENTREE') {
      defaultType = 'ENTREE';
    } else {
      defaultType = 'ENTREE'; // default fallback
    }
  }

  const [activeTab, setActiveTab] = useState(defaultType);
  const [articles, setArticles] = useState([]);
  const [depots, setDepots] = useState([]);
  const [raisons, setRaisons] = useState([]);
  const [rows, setRows] = useState([emptyRow(defaultType)]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chargement des données
  useEffect(() => {
    const loadFormData = async () => {
      setLoading(true);
      try {
        const movementTypeNumber = activeTab === 'ENTREE' ? 1 : 2;
        const resp = await getFormData(movementTypeNumber);
        const data = resp.data || resp;
        console.log('form data', data);
        setArticles(data.articles || []);
        setDepots(data.depots || []);
        setRaisons(data.raisons || []);
      } catch (e) {
        console.error('Erreur getFormData', e);
        setArticles([]);
        setDepots([]);
        setRaisons([]);
        setMessage({ 
          type: 'error', 
          text: 'Erreur lors du chargement des données. Veuillez réessayer.' 
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadFormData();
  }, [activeTab]);

  // Réinitialisation des lignes quand le type change
  useEffect(() => {
    setActiveTab(defaultType);
    setRows([emptyRow(defaultType)]);
    setMessage(null);
  }, [defaultType]);

  // Gestion des changements de ligne
  const updateRow = (index, key, value) => {
    const copy = [...rows];
    copy[index] = { ...copy[index], [key]: value };
    setRows(copy);
    // Si on change l'article, réinitialiser les champs dépendants
    if (key === 'articleId' && value) {
      const selectedArticle = articles.find(a => a.id == value);
      if (selectedArticle && !copy[index].prixUnitaire) {
        copy[index].prixUnitaire = selectedArticle.prixAchat || '';
      }
    }
  };

  const addRow = () => {
    setRows(prev => [...prev, emptyRow(activeTab)]);
  };

  const removeRow = (i) => {
    if (rows.length > 1) {
      setRows(prev => prev.filter((_, idx) => idx !== i));
    } else {
      setRows([emptyRow(activeTab)]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    
    // Validation
    const errors = [];
    rows.forEach((row, idx) => {
      if (!row.articleId) errors.push(`Ligne ${idx + 1}: Article manquant`);
      if (!row.quantite || Number(row.quantite) <= 0) errors.push(`Ligne ${idx + 1}: Quantité invalide`);
      if (activeTab === 'ENTREE' && !row.depotId) errors.push(`Ligne ${idx + 1}: Dépôt manquant`);
      if (activeTab === 'TRANSFER') {
        if (!row.depotSourceId) errors.push(`Ligne ${idx + 1}: Dépôt source manquant`);
        if (!row.depotDestId) errors.push(`Ligne ${idx + 1}: Dépôt destination manquant`);
        if (row.depotSourceId && row.depotDestId && row.depotSourceId === row.depotDestId) errors.push(`Ligne ${idx + 1}: Dépôts source et destination identiques`);
      }
    });
    
    if (errors.length > 0) {
      setMessage({ type: 'error', text: errors.join(', ') });
      return;
    }

    setSubmitting(true);
    try {
      const payloads = rows.map(r => {
        if (activeTab === 'TRANSFER') {
          return {
            articleId: Number(r.articleId),
            depotSourceId: r.depotSourceId ? Number(r.depotSourceId) : null,
            depotDestId: r.depotDestId ? Number(r.depotDestId) : null,
            quantite: Number(r.quantite),
            raisonId: r.raisonId ? Number(r.raisonId) : null,
            description: r.description,
            date: r.date ? new Date(r.date).toISOString() : new Date().toISOString(),
            datePeremption: r.datePeremption ? new Date(r.datePeremption).toISOString() : null
          };
        }

        return {
          type: activeTab,
          articleId: Number(r.articleId),
          depotId: r.depotId ? Number(r.depotId) : null,
          quantite: Number(r.quantite),
          prixUnitaire: r.prixUnitaire ? Number(r.prixUnitaire) : null,
          raisonId: r.raisonId ? Number(r.raisonId) : null,
          description: r.description,
          date: r.date ? new Date(r.date).toISOString() : new Date().toISOString(),
          datePeremption: r.datePeremption ? new Date(r.datePeremption).toISOString() : null
        };
      });

      let res;
      if (activeTab === 'TRANSFER') {
        res = await import('../../api/stock').then(m => m.default.submitTransfer(payloads));
      } else {
        res = await submitMovements(payloads);
      }
      const resultData = res?.data || res;
      const count = Array.isArray(resultData) ? resultData.length : 0;
      
      setMessage({ 
        type: 'success', 
        text: `✅ ${count} mouvement(s) enregistré(s) avec succès!`,
        details: resultData
      });
      
      // Réinitialiser le formulaire après succès
      setTimeout(() => {
        setRows([emptyRow(activeTab)]);
      }, 2000);
      
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || err.message || 'Erreur lors de l\'enregistrement' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Calcul du total
  const calculateTotal = () => {
    return rows.reduce((sum, row) => {
      const qty = parseFloat(row.quantite) || 0;
      const price = parseFloat(row.prixUnitaire) || 0;
      return sum + (qty * price);
    }, 0).toFixed(2);
  };

  const MovementTypeTab = ({ type, label, icon: Icon, active }) => (
    <button
      type="button"
      onClick={() => {
        setActiveTab(type);
        setRows([emptyRow(type)]);
      }}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${
        active === type
          ? type === 'ENTREE'
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
            : 'bg-red-500 text-white shadow-lg shadow-red-200'
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideBar />
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <ArchiveBoxIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Mouvements de Stock</h1>
                  <p className="text-gray-600 mt-1">Gérez les entrées et sorties de votre inventaire</p>
                </div>
              </div>
              
        
            </div>

            {/* Bannière d'information */}
            <div className={`p-4 rounded-xl border-l-4 mb-6 ${
              activeTab === 'ENTREE' ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
              : activeTab === 'SORTIE' ? 'bg-red-50 border-red-500 text-red-700'
              : 'bg-blue-50 border-blue-500 text-blue-700'
            }`}>
              <div className="flex items-center gap-2">
                {activeTab === 'ENTREE' ? (
                  <ArrowDownTrayIcon className="w-5 h-5" />
                ) : activeTab === 'SORTIE' ? (
                  <ArrowUpTrayIcon className="w-5 h-5" />
                ) : (
                  <BuildingOfficeIcon className="w-5 h-5" />
                )}

                <p className="font-medium">
                  {activeTab === 'ENTREE' && 'Vous êtes en train d\'enregistrer une entrée de stock'}
                  {activeTab === 'SORTIE' && 'Vous êtes en train d\'enregistrer une sortie de stock'}
                  {activeTab === 'TRANSFER' && 'Vous êtes en train d\'effectuer un transfert entre dépôts'}
                </p>
              </div>
              <p className="text-sm mt-1 opacity-90">
                {activeTab === 'ENTREE' && 'Ajoutez des articles à votre inventaire avec leur prix d\'achat'}
                {activeTab === 'SORTIE' && 'Retirez des articles de votre inventaire pour vente ou consommation'}
                {activeTab === 'TRANSFER' && 'Sélectionnez le dépôt source et le dépôt destination pour chaque ligne.'}
              </p>
            </div>
          </div>

          {/* Formulaire principal */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* En-tête du formulaire */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Saisie des mouvements
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Remplissez les informations ci-dessous pour chaque article
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500">
                    {rows.length} ligne{rows.length > 1 ? 's' : ''}
                  </div>
                  <button
                    type="button"
                    onClick={addRow}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <PlusCircleIcon className="w-5 h-5" />
                    Ajouter une ligne
                  </button>
                </div>
              </div>
            </div>

            {/* Contenu du formulaire */}
            <div className="p-4 md:p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                  <p className="text-gray-600">Chargement des données...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {rows.map((row, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50/50 to-white shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  activeTab === 'ENTREE' 
                                    ? 'bg-emerald-100 text-emerald-600'
                                    : activeTab === 'SORTIE' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            <span className="font-semibold">{idx + 1}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            Ligne {idx + 1}
                          </span>
                        </div>
                        {rows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRow(idx)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer cette ligne"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      {/* Première ligne de champs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Article */}
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <CubeIcon className="w-4 h-4" />
                            Article *
                          </label>
                          <select
                            value={row.articleId}
                            onChange={e => updateRow(idx, 'articleId', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                            required
                          >
                            <option value="">Sélectionner un article</option>
                            {articles.map(a => (
                              <option key={a.id} value={a.id}>
                                {a.articleNom || a.refe} {a.codeBarre ? `(${a.codeBarre})` : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Dépôt (seulement pour entrées) */}
                        {activeTab === 'ENTREE' && (
                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                              <BuildingOfficeIcon className="w-4 h-4" />
                              Dépôt *
                            </label>
                            <select
                              value={row.depotId}
                              onChange={e => updateRow(idx, 'depotId', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                              required
                            >
                              <option value="">Sélectionner un dépôt</option>
                              {depots.map(d => (
                                <option key={d.id} value={d.id}>{d.depotName}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Transfer: source and destination depots */}
                        {activeTab === 'TRANSFER' && (
                          <>
                            <div>
                              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">Dépôt source *</label>
                              <select value={row.depotSourceId} onChange={e => updateRow(idx, 'depotSourceId', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white">
                                <option value="">Sélectionner dépôt source</option>
                                {depots.map(d => (<option key={d.id} value={d.id}>{d.depotName}</option>))}
                              </select>
                            </div>
                            <div>
                              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">Dépôt destination *</label>
                              <select value={row.depotDestId} onChange={e => updateRow(idx, 'depotDestId', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white">
                                <option value="">Sélectionner dépôt destination</option>
                                {depots.map(d => (<option key={d.id} value={d.id}>{d.depotName}</option>))}
                              </select>
                            </div>
                          </>
                        )}

                        {/* Quantité */}
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <ArchiveBoxIcon className="w-4 h-4" />
                            Quantité *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={row.quantite}
                            onChange={e => updateRow(idx, 'quantite', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="0.00"
                            required
                          />
                        </div>

                        {/* Prix unitaire (seulement pour entrées) */}
                        {activeTab === 'ENTREE' && (
                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                              <CurrencyDollarIcon className="w-4 h-4" />
                              Prix unitaire
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={row.prixUnitaire}
                                onChange={e => updateRow(idx, 'prixUnitaire', e.target.value)}
                                className="w-full px-4 py-2.5 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                placeholder="0.00"
                              />
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">€</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Deuxième ligne de champs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {/* Raison */}
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <TagIcon className="w-4 h-4" />
                            Raison
                          </label>
                          <select
                            value={row.raisonId}
                            onChange={e => updateRow(idx, 'raisonId', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                          >
                            <option value="">Sélectionner une raison</option>
                            {raisons.map(r => (
                              <option key={r.id} value={r.id}>{r.raisonName}</option>
                            ))}
                          </select>
                        </div>

                        {/* Date (seulement pour entrées) */}
                        {activeTab === 'ENTREE' && (
                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                              <CalendarIcon className="w-4 h-4" />
                              Date
                            </label>
                            <input
                              type="datetime-local"
                              value={row.date}
                              onChange={e => updateRow(idx, 'date', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            />
                          </div>
                        )}

                        {/* Date de péremption (seulement pour entrées) */}
                        {activeTab === 'ENTREE' && (
                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                              <CalendarIcon className="w-4 h-4" />
                              Date de péremption
                            </label>
                            <input
                              type="date"
                              value={row.datePeremption}
                              onChange={e => updateRow(idx, 'datePeremption', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            />
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
                          Description
                        </label>
                        <input
                          type="text"
                          value={row.description}
                          onChange={e => updateRow(idx, 'description', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          placeholder="Notes supplémentaires..."
                        />
                      </div>

                      {/* Total de la ligne (seulement pour entrées) */}
                      {activeTab === 'ENTREE' && row.quantite && row.prixUnitaire && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total de la ligne:</span>
                            <span className="text-lg font-semibold text-emerald-600">
                              {(parseFloat(row.quantite) * parseFloat(row.prixUnitaire)).toFixed(2)} €
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Total général et bouton d'envoi */}
                  <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-6 px-6 py-4 mt-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        {activeTab === 'ENTREE' && (
                          <div className="flex items-center gap-4">
                            <div className="text-gray-700">
                              <span className="text-sm">Total général:</span>
                              <div className="text-2xl font-bold text-emerald-600">
                                {calculateTotal()} €
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {rows.length} article{rows.length > 1 ? 's' : ''}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setRows([emptyRow(activeTab)])}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          disabled={submitting}
                        >
                          Réinitialiser
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                            submitting
                              ? 'bg-gray-400 cursor-not-allowed'
                              : activeTab === 'ENTREE'
                                ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
                                : 'bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl'
                          }`}
                        >
                          {submitting ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              Enregistrement...
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="w-5 h-5" />
                              Enregistrer {rows.length > 1 ? 'les mouvements' : 'le mouvement'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  {message && (
                    <div className={`p-4 rounded-xl border-l-4 ${
                      message.type === 'success'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'bg-red-50 border-red-500 text-red-700'
                    }`}>
                      <div className="flex items-center gap-2">
                        {message.type === 'success' ? (
                          <CheckCircleIcon className="w-5 h-5" />
                        ) : (
                          <XCircleIcon className="w-5 h-5" />
                        )}
                        <p className="font-medium">{message.text}</p>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="mt-6 text-sm text-gray-500 text-center">
            <p>* Champs obligatoires</p>
            <p className="mt-1">
              Les mouvements sont tracés et peuvent être consultés dans l'historique
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
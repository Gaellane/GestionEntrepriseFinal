import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircleIcon, MinusCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import stockKpiApi from '../../api/stockKpiApi';

export default function AjustementStock() {
  const navigate = useNavigate();
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filters, setFilters] = useState({
    depotId: '',
    categoryId: '',
    dateDebut: '',
    dateFin: ''
  });
  const [depots, setDepots] = useState([]);
  const [categories, setCategories] = useState([]);
  const [adjustments, setAdjustments] = useState({});

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async (customFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const res = await stockKpiApi.getAjustementFormData(customFilters);
      const data = res && res.data ? res.data : res;
      
      setKpiData(data.kpiData);
      setDepots(Array.isArray(data.depots) ? data.depots : []);
      
      // Charger les catégories séparément
      const categoriesRes = await stockKpiApi.getCategories();
      const categoriesData = categoriesRes && categoriesRes.data ? categoriesRes.data : categoriesRes;
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      
      // Initialiser les ajustements pour chaque article
      if (data.kpiData && data.kpiData.details) {
        const initialAdjustments = {};
        data.kpiData.details.forEach(detail => {
          initialAdjustments[detail.articleId] = {
            type: '',
            quantite: '',
            depotId: customFilters.depotId || '',
            raisonId: '',
            description: '',
            prixUnitaire: ''
          };
        });
        setAdjustments(initialAdjustments);
      }
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    const updatedFilters = { ...filters, [field]: value };
    setFilters(updatedFilters);
    loadFormData(updatedFilters);
  };

  const handleAdjustmentChange = (articleId, field, value) => {
    setAdjustments(prev => {
      const updated = {
        ...prev,
        [articleId]: {
          ...prev[articleId],
          [field]: value
        }
      };
      
      // Set automatic description when type changes
      if (field === 'type' && value) {
        updated[articleId].description = value === 'ENTREE' ? 'Ajustement positif' : 'Ajustement négatif';
      }
      
      return updated;
    });
  };

  const handleSubmitAdjustments = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const movements = [];
      
      // Collecter tous les ajustements valides
      Object.keys(adjustments).forEach(articleId => {
        const adj = adjustments[articleId];
        if (adj.type && adj.quantite && adj.depotId) {
          movements.push({
            type: adj.type,
            articleId: Number(articleId),
            depotId: Number(adj.depotId),
            quantite: Number(adj.quantite),
            raisonId: null,
            description: adj.description || (adj.type === 'ENTREE' ? 'Ajustement positif' : 'Ajustement négatif'),
            prixUnitaire: adj.prixUnitaire ? Number(adj.prixUnitaire) : null,
            date: new Date().toISOString()
          });
        }
      });

      if (movements.length === 0) {
        setError('Aucun ajustement à enregistrer');
        setLoading(false);
        return;
      }

      await stockApi.submitMovements(movements);
      
      setSuccess(`${movements.length} ajustement(s) enregistré(s) avec succès`);
      
      // Recharger les données et réinitialiser les ajustements
      await loadKpiData(filters);
      
      // Scroll vers le haut pour voir le message de succès
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num == null) return '0';
    return Number(num).toFixed(2);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          Ajustements de Stock
        </h1>
        <p className="text-gray-600 mt-1">Effectuer des ajustements positifs ou négatifs sur les stocks</p>
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-emerald-800 font-medium">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtres</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dépôt</label>
            <select
              value={filters.depotId}
              onChange={(e) => handleFilterChange('depotId', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Tous les dépôts</option>
              {depots.map(d => (
                <option key={d.id} value={d.id}>
                  {d.nomDepot || d.nom || `Dépôt ${d.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select
              value={filters.categoryId}
              onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.categorieName || `Catégorie ${c.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
            <input
              type="datetime-local"
              value={filters.dateDebut}
              onChange={(e) => handleFilterChange('dateDebut', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
            <input
              type="datetime-local"
              value={filters.dateFin}
              onChange={(e) => handleFilterChange('dateFin', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Formulaire d'ajustements */}
      {loading && !kpiData && (
        <div className="text-center py-12">
          <ArrowPathIcon className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      )}

      {kpiData && kpiData.details && kpiData.details.length > 0 && (
        <form onSubmit={handleSubmitAdjustments}>
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Articles et Ajustements</h2>
            
            <div className="space-y-6">
              {kpiData.details.map((detail) => {
                const adj = adjustments[detail.articleId] || {};

                return (
                  <div key={detail.articleId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {detail.articleNom || detail.articleRef || `Article ${detail.articleId}`}
                        </h3>
                        {detail.categoryName && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                            {detail.categoryName}
                          </span>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-blue-600">Théorique: {formatNumber(detail.stockTheorique)}</div>
                        <div className="text-emerald-600">Physique: {formatNumber(detail.stockPhysique)}</div>
                        <div className={`font-bold ${detail.ecart >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          Écart: {detail.ecart >= 0 ? '+' : ''}{formatNumber(detail.ecart)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={adj.type || ''}
                          onChange={(e) => handleAdjustmentChange(detail.articleId, 'type', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                        >
                          <option value="">-</option>
                          <option value="ENTREE">Entrée</option>
                          <option value="SORTIE">Sortie</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Quantité</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={adj.quantite || ''}
                          onChange={(e) => handleAdjustmentChange(detail.articleId, 'quantite', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                          disabled={!adj.type}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Dépôt</label>
                        <select
                          value={adj.depotId || ''}
                          onChange={(e) => handleAdjustmentChange(detail.articleId, 'depotId', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                          disabled={!adj.type}
                        >
                          <option value="">Sélectionner</option>
                          {depots.map(d => (
                            <option key={d.id} value={d.id}>
                              {d.nomDepot || d.nom || `Dépôt ${d.id}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {adj.type === 'ENTREE' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Prix Unit.</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={adj.prixUnitaire || ''}
                            onChange={(e) => handleAdjustmentChange(detail.articleId, 'prixUnitaire', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                          />
                        </div>
                      )}

                      <div className={adj.type === 'ENTREE' ? 'md:col-span-2' : 'md:col-span-3'}>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Description {adj.type && '(Auto)'}
                        </label>
                        <input
                          type="text"
                          value={adj.description || ''}
                          onChange={(e) => handleAdjustmentChange(detail.articleId, 'description', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-gray-50"
                          placeholder={adj.type === 'ENTREE' ? 'Ajustement positif' : adj.type === 'SORTIE' ? 'Ajustement négatif' : 'Auto'}
                          disabled={!adj.type}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer les ajustements'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

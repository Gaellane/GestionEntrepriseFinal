import { useState, useEffect } from 'react';
import { ChartBarIcon, FunnelIcon, ArrowPathIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import stockKpiApi from '../../api/stockKpiApi';
import stockApi from '../../api/stock';

export default function DashboardRespMagasin() {
  const navigate = useNavigate();
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    depotId: '',
    categoryId: '',
    dateDebut: '',
    dateFin: ''
  });
  const [depots, setDepots] = useState([]);
  const [categories, setCategories] = useState([]);
  const [riskyLots, setRiskyLots] = useState([]);

  useEffect(() => {
    loadDepots();
    loadCategories();
    loadKpiData();
  }, []);

  const loadDepots = async () => {
    try {
      const res = await stockApi.getFormData();
      const data = res && (res.data || res.payload || res);
      const depotList = data && data.depots ? data.depots : (res.depots || []);
      setDepots(Array.isArray(depotList) ? depotList : []);
    } catch (err) {
      console.error('Failed to load depots', err);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await stockKpiApi.getCategories();
      console.log('[DashboardRespMagasin] Categories response:', res);
      const data = res && res.data ? res.data : res;
      console.log('[DashboardRespMagasin] Categories data:', data);
      const categoryList = Array.isArray(data) ? data : [];
      setCategories(categoryList);
      console.log('[DashboardRespMagasin] Categories loaded:', categoryList.length);
    } catch (err) {
      console.error('[DashboardRespMagasin] Failed to load categories', err);
    }
  };

  const loadKpiData = async (customFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const res = await stockKpiApi.getStockPrecisionKpi(customFilters);
      const data = res && res.data ? res.data : res;
      setKpiData(data);
      // charger les lots à risque en fonction des mêmes filtres
      loadRiskyLots(customFilters);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const loadRiskyLots = async (customFilters = filters) => {
    try {
      const res = await stockKpiApi.getRiskyLots(customFilters);
      const data = res && res.data ? res.data : res;
      setRiskyLots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load risky lots', err);
      setRiskyLots([]);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    loadKpiData(filters);
  };

  const resetFilters = () => {
    const emptyFilters = { depotId: '', categoryId: '', dateDebut: '', dateFin: '' };
    setFilters(emptyFilters);
    loadKpiData(emptyFilters);
  };

  const formatNumber = (num) => {
    if (num == null) return '0';
    return Number(num).toFixed(2);
  };

  const getColorForPrecision = (taux) => {
    if (taux >= 95) return 'text-emerald-600 bg-emerald-100';
    if (taux >= 85) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const renderBarChart = () => {
    if (!kpiData || !kpiData.details || kpiData.details.length === 0) {
      return <div className="text-center text-gray-500 py-8">Aucune donnée disponible</div>;
    }

    const maxValue = Math.max(
      ...kpiData.details.map(d => Math.max(d.stockTheorique || 0, d.stockPhysique || 0))
    );

    return (
      <div className="space-y-6">
        {kpiData.details.slice(0, 10).map((detail, idx) => {
          const theoriqueWidth = maxValue > 0 ? (detail.stockTheorique / maxValue) * 100 : 0;
          const physiqueWidth = maxValue > 0 ? (detail.stockPhysique / maxValue) * 100 : 0;
          const ecart = detail.ecart || 0;

          return (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-700 text-sm">
                    {detail.articleNom || detail.articleRef || `Article ${detail.articleId}`}
                  </span>
                  {detail.categoryName && (
                    <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {detail.categoryName}
                    </span>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getColorForPrecision(detail.tauxPrecision || 0)}`}>
                  {formatNumber(detail.tauxPrecision)}%
                </span>
              </div>
              
              {/* Barres groupées avec écart */}
              <div className="flex items-center gap-4">
                {/* Barre théorique */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-xs text-gray-600">Théorique: {formatNumber(detail.stockTheorique)}</span>
                  </div>
                  <div className="bg-gray-200 rounded h-6 relative overflow-hidden">
                    <div 
                      className="bg-blue-500 h-6 rounded transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${theoriqueWidth}%` }}
                    >
                      {theoriqueWidth > 10 && <span className="text-xs text-white font-semibold">{formatNumber(detail.stockTheorique)}</span>}
                    </div>
                  </div>
                </div>
                
                {/* Barre physique */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                    <span className="text-xs text-gray-600">Physique: {formatNumber(detail.stockPhysique)}</span>
                  </div>
                  <div className="bg-gray-200 rounded h-6 relative overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-6 rounded transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${physiqueWidth}%` }}
                    >
                      {physiqueWidth > 10 && <span className="text-xs text-white font-semibold">{formatNumber(detail.stockPhysique)}</span>}
                    </div>
                  </div>
                </div>
                
                {/* Indicateur d'écart */}
                <div className="w-20 text-center">
                  <div className={`text-sm font-bold ${
                    ecart > 0 ? 'text-emerald-600' : ecart < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {ecart > 0 ? '+' : ''}{formatNumber(ecart)}
                  </div>
                  <div className="text-xs text-gray-500">écart</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderGaugeChart = () => {
    if (!kpiData) return null;

    const taux = kpiData.tauxPrecision || 0;
    const angle = (taux / 100) * 180; // 0 à 180 degrés
    const radian = ((angle - 90) * Math.PI) / 180;
    const cx = 100;
    const cy = 100;
    const radius = 70;
    const needleX = cx + radius * Math.cos(radian);
    const needleY = cy + radius * Math.sin(radian);

    return (
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 200 120" className="w-full max-w-sm">
          {/* Arc de fond */}
          <path
            d="M 30 100 A 70 70 0 0 1 170 100"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="20"
            strokeLinecap="round"
          />
          
          {/* Arc de progression */}
          <path
            d="M 30 100 A 70 70 0 0 1 170 100"
            fill="none"
            stroke={taux >= 95 ? '#10b981' : taux >= 85 ? '#f59e0b' : '#ef4444'}
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={`${(taux / 100) * 220} 220`}
          />
          
          {/* Aiguille */}
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke="#1f2937"
            strokeWidth="2"
          />
          <circle cx={cx} cy={cy} r="5" fill="#1f2937" />
          
          {/* Valeur au centre */}
          <text x={cx} y={cy + 25} textAnchor="middle" className="text-2xl font-bold" fill="#1f2937">
            {formatNumber(taux)}%
          </text>
        </svg>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">Taux de précision global</p>
          <p className="text-xs text-gray-500 mt-1">
            Stock théorique: {formatNumber(kpiData.stockTheoriqueTotal)} | 
            Stock physique: {formatNumber(kpiData.stockPhysiqueTotal)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ChartBarIcon className="w-8 h-8 text-emerald-600" />
            Dashboard Responsable Magasin
          </h1>
          <p className="text-gray-600 mt-1">Taux de précision stock (Théorique vs Physique)</p>
        </div>
        <button
          onClick={() => navigate('/stock/ajustements')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <AdjustmentsHorizontalIcon className="w-5 h-5" />
          Ajustements
        </button>
      </div>

      {/* Notifications lots à risque */}
      {!loading && riskyLots && riskyLots.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-yellow-800">Lots à risque</h3>
              <p className="text-xs text-yellow-700">{riskyLots.length} lot(s) expirés ou expirant selon le filtre sélectionné.</p>
            </div>
            <div>
              <button onClick={() => loadRiskyLots(filters)} className="text-sm text-yellow-800 underline">Rafraîchir</button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {riskyLots.slice(0,6).map((lot) => (
              <div key={lot.id} className="bg-yellow-100 p-2 rounded">
                <div className="text-sm font-medium text-yellow-900">{lot.numero} — {lot.article?.articleNom || lot.article?.articleRef || 'Article'}</div>
                <div className="text-xs text-yellow-800">Dépôt: {lot.depot?.nomDepot || lot.depot?.nom || '-' } | Qté restante: {lot.quantiteRestante}</div>
                <div className="text-xs text-yellow-700">Péremption: {lot.datePeremption ? new Date(lot.datePeremption).toLocaleString() : '-'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Filtres</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dépôt</label>
            <select
              value={filters.depotId}
              onChange={(e) => handleFilterChange('depotId', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
            <input
              type="datetime-local"
              value={filters.dateFin}
              onChange={(e) => handleFilterChange('dateFin', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Appliquer
          </button>
          <button
            onClick={resetFilters}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Affichage des KPIs */}
      {loading && (
        <div className="text-center py-12">
          <ArrowPathIcon className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-800">Erreur: {error}</p>
        </div>
      )}

      {!loading && !error && kpiData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Jauge de précision globale */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Précision Globale</h2>
            {renderGaugeChart()}
          </div>

          {/* Graphique à barres comparatif */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Comparaison par Article</h2>
            <div className="overflow-y-auto max-h-96">
              {renderBarChart()}
            </div>
          </div>

          {/* Tableau détaillé */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Détails par Article</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Article</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Catégorie</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Valorisation</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Stock Théorique</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Stock Physique</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Écart</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Valeur Stock</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Précision</th>
                  </tr>
                </thead>
                <tbody>
                  {kpiData.details && kpiData.details.map((detail, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800">
                        {detail.articleNom || detail.articleRef || `Article ${detail.articleId}`}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {detail.categoryName || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        <span className={`px-2 py-1 rounded ${
                          detail.valorisation === 'FIFO' ? 'bg-blue-100 text-blue-700' :
                          detail.valorisation === 'LIFO' ? 'bg-purple-100 text-purple-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {detail.valorisation || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-blue-600 font-medium">
                        {formatNumber(detail.stockTheorique)}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                        {formatNumber(detail.stockPhysique)}
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${
                        detail.ecart >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {detail.ecart >= 0 ? '+' : ''}{formatNumber(detail.ecart)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-800 font-semibold">
                        {detail.valeurStock != null ? formatNumber(detail.valeurStock) + ' AR' : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getColorForPrecision(detail.tauxPrecision || 0)}`}>
                          {formatNumber(detail.tauxPrecision)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

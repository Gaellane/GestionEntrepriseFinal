import { useState, useEffect, useRef } from 'react';
import {
  ChartBarIcon,
  FunnelIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import stockKpiApi from '../../api/stockKpiApi';
import stockApi from '../../api/stock';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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
  const [adjustmentHistory, setAdjustmentHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [articleMovements, setArticleMovements] = useState({});

  useEffect(() => {
    loadDepots();
    loadCategories();
    loadKpiData();
    loadAdjustmentHistory();
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
      const data = res && res.data ? res.data : res;
      const categoryList = Array.isArray(data) ? data : [];
      setCategories(categoryList);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const loadKpiData = async (customFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const res = await stockKpiApi.getStockPrecisionKpi(customFilters);
      const data = res && res.data ? res.data : res;
      setKpiData(data);
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

  const loadAdjustmentHistory = async () => {
    try {
      const res = await stockKpiApi.getAdjustmentHistory(filters);
      const data = res && res.data ? res.data : res;
      setAdjustmentHistory(Array.isArray(data) ? data.slice(0, 10) : []);
    } catch (err) {
      console.error('Failed to load adjustment history', err);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    loadKpiData(filters);
    loadAdjustmentHistory();
  };

  const toggleArticleMovements = async (articleId) => {
    if (expandedArticle === articleId) {
      setExpandedArticle(null);
    } else {
      setExpandedArticle(articleId);
      if (!articleMovements[articleId]) {
        try {
          console.log('Loading movements for article:', articleId);
          const res = await stockApi.getLotMouvementsByArticle(articleId);
          console.log('Raw response:', res);

          // Extraire les données de la réponse
          let data = res;
          if (res?.data !== undefined) {
            data = res.data;
          }
          if (res?.payload !== undefined) {
            data = res.payload;
          }

          console.log('Extracted data:', data);
          const movements = Array.isArray(data) ? data : [];
          console.log('Movements array:', movements);

          setArticleMovements(prev => ({
            ...prev,
            [articleId]: movements
          }));
        } catch (err) {
          console.error('Failed to load movements for article', articleId, err);
          setArticleMovements(prev => ({
            ...prev,
            [articleId]: []
          }));
        }
      }
    }
  };

  const resetFilters = () => {
    const emptyFilters = { depotId: '', categoryId: '', dateDebut: '', dateFin: '' };
    setFilters(emptyFilters);
    loadKpiData(emptyFilters);
    loadAdjustmentHistory();
  };

  const formatNumber = (num) => {
    if (num == null) return '0';
    return Number(num).toFixed(2);
  };

  const formatCurrency = (num) => {
    if (num == null) return '0 Ar';
    return new Intl.NumberFormat('fr-MG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num) + ' Ar';
  };

  const getColorForPrecision = (taux) => {
    if (taux >= 95) return 'text-emerald-600 bg-emerald-100';
    if (taux >= 85) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  // Données pour le graphique des écarts
  const getEcartChartData = () => {
    if (!kpiData?.details) return null;

    const sortedDetails = [...kpiData.details]
      .sort((a, b) => Math.abs(b.ecart || 0) - Math.abs(a.ecart || 0))
      .slice(0, 10)
      .reverse(); // Reverse pour que le plus gros soit en haut (horizontal)

    return {
      labels: sortedDetails.map(d => d.articleNom || d.articleRef || `Article ${d.articleId}`),
      datasets: [
        {
          label: 'Surplus (stock en trop)',
          data: sortedDetails.map(d => Math.max(0, d.ecart || 0)),
          backgroundColor: 'rgba(16, 185, 129, 0.75)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1,
          borderRadius: 4,
          barThickness: 18,
        },
        {
          label: 'Manquant (stock insuffisant)',
          data: sortedDetails.map(d => Math.min(0, d.ecart || 0)),
          backgroundColor: 'rgba(239, 68, 68, 0.75)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 1,
          borderRadius: 4,
          barThickness: 18,
        }
      ]
    };
  };

  // Données pour le graphique de répartition des précisions
  const getPrecisionDistributionData = () => {
    if (!kpiData?.details) return null;

    const total = kpiData.details.length || 1;
    const excellent = kpiData.details.filter(d => (d.tauxPrecision || 0) >= 95).length;
    const good = kpiData.details.filter(d => (d.tauxPrecision || 0) >= 85 && (d.tauxPrecision || 0) < 95).length;
    const poor = kpiData.details.filter(d => (d.tauxPrecision || 0) < 85).length;

    const pct = (n) => ((n / total) * 100).toFixed(0);

    return {
      labels: [
        `Excellente ≥95% — ${excellent} articles (${pct(excellent)}%)`,
        `Correcte 85-94% — ${good} articles (${pct(good)}%)`,
        `Insuffisante <85% — ${poor} articles (${pct(poor)}%)`
      ],
      datasets: [
        {
          data: [excellent, good, poor],
          backgroundColor: [
            'rgba(16, 185, 129, 0.85)',
            'rgba(251, 191, 36, 0.85)',
            'rgba(239, 68, 68, 0.85)'
          ],
          borderColor: '#fff',
          borderWidth: 3,
          hoverOffset: 12,
          spacing: 2,
        }
      ]
    };
  };

  // Données pour le graphique barres groupées par catégorie
  const getCategoryBarData = () => {
    if (!kpiData?.details) return null;

    const categoriesMap = new Map();
    kpiData.details.forEach(detail => {
      const categoryName = detail.categoryName || 'Non catégorisé';
      if (!categoriesMap.has(categoryName)) {
        categoriesMap.set(categoryName, {
          count: 0,
          totalPrecision: 0,
          totalEcart: 0,
          totalValue: 0
        });
      }
      const categoryData = categoriesMap.get(categoryName);
      categoryData.count++;
      categoryData.totalPrecision += detail.tauxPrecision || 0;
      categoryData.totalEcart += Math.abs(detail.ecart || 0);
      categoryData.totalValue += detail.valeurStock || 0;
    });

    const categoriesArray = Array.from(categoriesMap.entries())
      .sort((a, b) => b[1].totalValue - a[1].totalValue)
      .slice(0, 8);

    return {
      labels: categoriesArray.map(([name]) => name),
      datasets: [
        {
          label: 'Précision moyenne (%)',
          data: categoriesArray.map(([, data]) => +(data.totalPrecision / data.count).toFixed(1)),
          backgroundColor: 'rgba(59, 130, 246, 0.75)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
          borderRadius: 6,
          yAxisID: 'y',
        },
        {
          label: 'Nb articles',
          data: categoriesArray.map(([, data]) => data.count),
          backgroundColor: 'rgba(168, 85, 247, 0.65)',
          borderColor: 'rgb(168, 85, 247)',
          borderWidth: 1,
          borderRadius: 6,
          yAxisID: 'y1',
        }
      ]
    };
  };

  // Options pour les graphiques
  const barChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'rectRounded',
          padding: 16,
          font: { size: 12, weight: '500' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: { size: 13, weight: '600' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const val = context.raw;
            if (val === 0) return null;
            const sign = val > 0 ? '+' : '';
            return ` ${context.dataset.label}: ${sign}${formatNumber(val)} unités`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Écart en unités (surplus ► / ◄ manquant)',
          font: { size: 12, weight: '500' },
          color: '#6b7280'
        },
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: { font: { size: 11 } }
      },
      y: {
        grid: { display: false },
        ticks: {
          font: { size: 11, weight: '500' },
          color: '#374151'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 14,
          font: { size: 12, weight: '500' },
          color: '#374151'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: { size: 13, weight: '600' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const pct = ((context.raw / total) * 100).toFixed(0);
            return ` ${context.raw} articles — ${pct}% du total`;
          }
        }
      }
    }
  };

  const categoryBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'rectRounded',
          padding: 16,
          font: { size: 12, weight: '500' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: { size: 13, weight: '600' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        position: 'left',
        title: {
          display: true,
          text: 'Précision moyenne (%)',
          font: { size: 12, weight: '500' },
          color: '#3b82f6'
        },
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: { font: { size: 11 }, color: '#3b82f6' }
      },
      y1: {
        position: 'right',
        title: {
          display: true,
          text: 'Nombre d\'articles',
          font: { size: 12, weight: '500' },
          color: '#a855f7'
        },
        beginAtZero: true,
        grid: { drawOnChartArea: false },
        ticks: { font: { size: 11 }, color: '#a855f7', stepSize: 1 }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, weight: '500' }, color: '#374151' }
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
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

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'analytics'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('risks')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'risks'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Risques & Alertes
            </button>
          </nav>
        </div>
      </div>

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

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <ArrowPathIcon className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-800">Erreur: {error}</p>
        </div>
      )}

      {/* Main content */}
      {!loading && !error && kpiData && (
        <>
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Précision globale</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">
                        {formatNumber(kpiData.tauxPrecision || 0)}%
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${getColorForPrecision(kpiData.tauxPrecision || 0).split(' ')[1]}`}>
                      <ChartBarIcon className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    <span className="text-emerald-600">▲</span> {kpiData.details?.filter(d => (d.tauxPrecision || 0) >= 95).length || 0} articles excellents
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Écart total</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">
                        {formatNumber(kpiData.details?.reduce((sum, d) => sum + Math.abs(d.ecart || 0), 0) || 0)}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-amber-100">
                      {kpiData.details?.reduce((sum, d) => sum + (d.ecart || 0), 0) >= 0 ? (
                        <ArrowTrendingUpIcon className="w-6 h-6 text-amber-600" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    {kpiData.details?.filter(d => (d.ecart || 0) > 0).length || 0} surplus, {kpiData.details?.filter(d => (d.ecart || 0) < 0).length || 0} manquants
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Valeur totale du stock</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">
                        {formatCurrency(kpiData.details?.reduce((sum, d) => sum + (d.valeurStock || 0), 0) || 0)}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-100">
                      <ChartBarIcon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    Théorique: {formatNumber(kpiData.stockTheoriqueTotal)} | Physique: {formatNumber(kpiData.stockPhysiqueTotal)}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Articles à risque</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">
                        {kpiData.details?.filter(d => (d.tauxPrecision || 0) < 85).length || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-red-100">
                      <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    Précision inférieure à 85%
                  </div>
                </div>
              </div>

              {/* Main Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graphique des écarts */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    Top 10 — Écarts les plus importants
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">Différence entre stock physique et théorique par article</p>
                  <div style={{ height: '380px' }}>
                    {getEcartChartData() && (
                      <Bar data={getEcartChartData()} options={barChartOptions} />
                    )}
                  </div>
                </div>

                {/* Graphique de répartition des précisions */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    Qualité du stock
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">Répartition des articles par niveau de précision</p>
                  <div style={{ height: '340px' }} className="flex items-center justify-center">
                    {getPrecisionDistributionData() && (
                      <Doughnut data={getPrecisionDistributionData()} options={doughnutOptions} />
                    )}
                  </div>
                </div>
              </div>

              {/* Tableau détaillé */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Détails par article</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Article</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Catégorie</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">Valorisation</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Stock Théorique</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Stock Physique</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Écart</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Valeur Stock</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Précision</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">Mouvements</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kpiData.details?.slice(0, 15).map((detail, idx) => (
                        <>
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-800">
                              {detail.articleNom || detail.articleRef || `Article ${detail.articleId}`}
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-sm">
                              {detail.categoryName || '-'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${detail.valorisation === 'FIFO' ? 'bg-blue-100 text-blue-700' :
                                detail.valorisation === 'LIFO' ? 'bg-purple-100 text-purple-700' :
                                  detail.valorisation === 'CMUP' ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                {detail.valorisation || 'N/A'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-blue-600 font-medium">
                              {formatNumber(detail.stockTheorique)}
                            </td>
                            <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                              {formatNumber(detail.stockPhysique)}
                            </td>
                            <td className={`px-4 py-3 text-right font-medium ${detail.ecart >= 0 ? 'text-emerald-600' : 'text-red-600'
                              }`}>
                              {detail.ecart >= 0 ? '+' : ''}{formatNumber(detail.ecart)}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-800 font-semibold">
                              {formatCurrency(detail.valeurStock)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${getColorForPrecision(detail.tauxPrecision || 0)}`}>
                                {formatNumber(detail.tauxPrecision)}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => toggleArticleMovements(detail.articleId)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                {expandedArticle === detail.articleId ? (
                                  <ChevronUpIcon className="w-5 h-5" />
                                ) : (
                                  <ChevronDownIcon className="w-5 h-5" />
                                )}
                              </button>
                            </td>
                          </tr>
                          {expandedArticle === detail.articleId && (
                            <tr>
                              <td colSpan="9" className="px-4 py-4 bg-gray-50">
                                <div className="max-h-96 overflow-y-auto">
                                  <h4 className="font-semibold text-gray-700 mb-3">Historique des mouvements de lots</h4>
                                  {articleMovements[detail.articleId] !== undefined ? (
                                    articleMovements[detail.articleId].length > 0 ? (
                                      <table className="w-full text-xs">
                                        <thead className="bg-gray-200">
                                          <tr>
                                            <th className="px-2 py-2 text-left">Date</th>
                                            <th className="px-2 py-2 text-left">Lot N°</th>
                                            <th className="px-2 py-2 text-left">Dépôt</th>
                                            <th className="px-2 py-2 text-left">Type</th>
                                            <th className="px-2 py-2 text-right">Quantité</th>
                                            <th className="px-2 py-2 text-right">Prix unitaire</th>
                                            <th className="px-2 py-2 text-left">Raison</th>
                                            <th className="px-2 py-2 text-left">Description</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {articleMovements[detail.articleId].map((mouvement, mIdx) => (
                                            <tr key={mIdx} className="border-b border-gray-300">
                                              <td className="px-2 py-2 text-gray-700">
                                                {mouvement.dateEntree ? new Date(mouvement.dateEntree).toLocaleString('fr-FR') : '-'}
                                              </td>
                                              <td className="px-2 py-2 text-gray-700">{mouvement.lotNumero || '-'}</td>
                                              <td className="px-2 py-2 text-gray-700">{mouvement.depotNom || '-'}</td>
                                              <td className="px-2 py-2">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${mouvement.typeMouvement?.toLowerCase().includes('entr') || mouvement.typeMouvementId === 1
                                                  ? 'bg-green-100 text-green-700'
                                                  : 'bg-red-100 text-red-700'
                                                  }`}>
                                                  {mouvement.typeMouvement || 'N/A'}
                                                </span>
                                              </td>
                                              <td className="px-2 py-2 text-right font-medium">{formatNumber(mouvement.quantite)}</td>
                                              <td className="px-2 py-2 text-right text-gray-600">
                                                {mouvement.prixUnitaire ? formatCurrency(mouvement.prixUnitaire) : '-'}
                                              </td>
                                              <td className="px-2 py-2 text-gray-600">{mouvement.raison || '-'}</td>
                                              <td className="px-2 py-2 text-gray-600">{mouvement.description || '-'}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    ) : (
                                      <p className="text-gray-500 text-center py-4">Aucun mouvement trouvé pour cet article</p>
                                    )
                                  ) : (
                                    <div className="text-center py-4">
                                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                      <p className="text-gray-500">Chargement des mouvements...</p>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Analytics */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart par catégorie */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    Analyse par catégorie
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">Précision moyenne et nombre d'articles par catégorie</p>
                  <div style={{ height: '380px' }}>
                    {getCategoryBarData() && (
                      <Bar data={getCategoryBarData()} options={categoryBarOptions} />
                    )}
                  </div>
                </div>

                {/* Top des articles à risque */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                    Articles à faible précision (≤85%)
                  </h3>
                  <div className="space-y-4">
                    {kpiData.details
                      ?.filter(d => (d.tauxPrecision || 0) < 85)
                      .sort((a, b) => (a.tauxPrecision || 0) - (b.tauxPrecision || 0))
                      .slice(0, 8)
                      .map((detail, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">
                              {detail.articleNom || detail.articleRef || `Article ${detail.articleId}`}
                            </p>
                            <p className="text-xs text-gray-600">{detail.categoryName || '-'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-red-600 font-bold">{formatNumber(detail.tauxPrecision)}%</p>
                            <p className="text-xs text-gray-500">Écart: {detail.ecart >= 0 ? '+' : ''}{formatNumber(detail.ecart)}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Historique des ajustements */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Historique des ajustements récents</h3>
                <div className="space-y-4">
                  {adjustmentHistory.length > 0 ? (
                    adjustmentHistory.map((adjustment, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${adjustment.type === 'correction' ? 'bg-blue-100' :
                            adjustment.type === 'inventaire' ? 'bg-emerald-100' :
                              'bg-amber-100'
                            }`}>
                            <AdjustmentsHorizontalIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {adjustment.articleNom || adjustment.articleRef}
                            </p>
                            <p className="text-sm text-gray-600">
                              {adjustment.motif || 'Ajustement de stock'} •
                              {new Date(adjustment.date).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${adjustment.quantiteAjustee > 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                            {adjustment.quantiteAjustee > 0 ? '+' : ''}{formatNumber(adjustment.quantiteAjustee)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Ancien: {formatNumber(adjustment.ancienneQuantite)} → Nouveau: {formatNumber(adjustment.nouvelleQuantite)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">Aucun ajustement récent</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Risks */}
          {activeTab === 'risks' && (
            <div className="space-y-6">
              {/* Lots à risque */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                  Lots expirés ou expirant bientôt
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {riskyLots.slice(0, 9).map((lot, idx) => (
                    <div key={idx} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-yellow-900">{lot.numero}</p>
                          <p className="text-sm text-yellow-800">
                            {lot.article?.articleNom || lot.article?.articleRef || 'Article inconnu'}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                          Risque
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-yellow-700">
                          <span className="font-medium">Qté:</span> {formatNumber(lot.quantiteRestante)}
                        </p>
                        <p className="text-yellow-700">
                          <span className="font-medium">Dépôt:</span> {lot.depot?.nomDepot || lot.depot?.nom || '-'}
                        </p>
                        <p className="text-yellow-700">
                          <span className="font-medium">Expire le:</span> {
                            lot.datePeremption
                              ? new Date(lot.datePeremption).toLocaleDateString('fr-FR')
                              : 'Non spécifié'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {riskyLots.length === 0 && (
                  <p className="text-center text-gray-500 py-4">Aucun lot à risque identifié</p>
                )}
              </div>

              {/* Alertes de précision */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Alertes de précision critique</h3>
                <div className="space-y-3">
                  {kpiData.details
                    ?.filter(d => (d.tauxPrecision || 0) < 80)
                    .map((detail, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                          <div>
                            <p className="font-medium text-gray-800">
                              {detail.articleNom || detail.articleRef || `Article ${detail.articleId}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              Écart important: {detail.ecart >= 0 ? '+' : ''}{formatNumber(detail.ecart)} unités
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-red-600 font-bold">{formatNumber(detail.tauxPrecision)}%</p>
                          <button
                            onClick={() => navigate(`/stock/ajustements?article=${detail.articleId}`)}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            Corriger
                          </button>
                        </div>
                      </div>
                    ))}
                  {kpiData.details?.filter(d => (d.tauxPrecision || 0) < 80).length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      <CheckCircleIcon className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                      Aucune alerte critique
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
import React, { useState, useEffect, useCallback } from 'react';
import {
  trainPredictionModel,
  getModelInfo,
  predictAllArticles,
  getAlertesRupture,
  predictForArticle
} from '../../api/predictionApi';
import { useAuth } from '../../hooks/useAuth';

// Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Heroicons
import {
  CpuChipIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  InformationCircleIcon,
  BoltIcon,
  ClockIcon,
  SparklesIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  Title, Tooltip, Legend, LineElement, PointElement
);

const MOIS_LABELS = [
  '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const PredictionDashboard = () => {
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [modelInfo, setModelInfo] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [alertes, setAlertes] = useState([]);

  // Filters
  const now = new Date();
  const defaultMois = (now.getMonth() + 1) % 12 + 1;
  const defaultAnnee = defaultMois === 1 ? now.getFullYear() + 1 : now.getFullYear();
  const [moisCible, setMoisCible] = useState(defaultMois);
  const [anneeCible, setAnneeCible] = useState(defaultAnnee);
  const [filterNiveau, setFilterNiveau] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Article detail modal
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articlePrediction, setArticlePrediction] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [info, preds, alerts] = await Promise.all([
        getModelInfo(),
        predictAllArticles({ mois: moisCible, annee: anneeCible }).catch(() => null),
        getAlertesRupture({ mois: moisCible, annee: anneeCible }).catch(() => []),
      ]);
      setModelInfo(info);
      setPredictions(preds);
      setAlertes(Array.isArray(alerts) ? alerts : []);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [moisCible, anneeCible]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Train model
  const handleTrain = async () => {
    setTraining(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await trainPredictionModel();
      setSuccess(`Modèle entraîné avec succès en ${result.durationMs}ms`);
      await loadData();
    } catch (err) {
      setError('Erreur lors de l\'entraînement : ' + (err.message || 'Erreur inconnue'));
    } finally {
      setTraining(false);
    }
  };

  // Article detail
  const handleArticleClick = async (pred) => {
    setSelectedArticle(pred);
    setArticlePrediction(pred);
  };

  const closeModal = () => {
    setSelectedArticle(null);
    setArticlePrediction(null);
  };

  // Filtered predictions
  const filteredPredictions = (predictions?.predictions || []).filter(p => {
    if (filterNiveau !== 'ALL' && p.niveauAlerte !== filterNiveau) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (p.articleNom?.toLowerCase().includes(q) || p.articleRef?.toLowerCase().includes(q));
    }
    return true;
  });

  // Chart data
  const getAlertDonutData = () => {
    const preds = predictions?.predictions || [];
    const critique = preds.filter(p => p.niveauAlerte === 'CRITIQUE').length;
    const attention = preds.filter(p => p.niveauAlerte === 'ATTENTION').length;
    const normal = preds.filter(p => p.niveauAlerte === 'NORMAL').length;

    return {
      labels: ['Critique', 'Attention', 'Normal'],
      datasets: [{
        data: [critique, attention, normal],
        backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
        borderWidth: 2,
        borderColor: '#fff',
      }]
    };
  };

  const getTopRiskBarData = () => {
    const topRisk = [...(predictions?.predictions || [])]
      .filter(p => p.alerteRupture)
      .sort((a, b) => a.ecartStockPrediction - b.ecartStockPrediction)
      .slice(0, 10);

    return {
      labels: topRisk.map(p => p.articleNom?.substring(0, 15) || p.articleRef),
      datasets: [
        {
          label: 'Stock disponible',
          data: topRisk.map(p => p.stockDisponibleNet),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
        },
        {
          label: 'Ventes prédites',
          data: topRisk.map(p => p.quantitePredite),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
        }
      ]
    };
  };

  const getReapproBarData = () => {
    const needReappro = [...(predictions?.predictions || [])]
      .filter(p => p.quantiteReapprovisionnement > 0)
      .sort((a, b) => b.quantiteReapprovisionnement - a.quantiteReapprovisionnement)
      .slice(0, 10);

    return {
      labels: needReappro.map(p => p.articleNom?.substring(0, 15) || p.articleRef),
      datasets: [{
        label: 'Quantité à commander',
        data: needReappro.map(p => p.quantiteReapprovisionnement),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: '#8B5CF6',
        borderWidth: 1,
      }]
    };
  };

  // Niveau alerte badge
  const AlertBadge = ({ niveau }) => {
    const styles = {
      CRITIQUE: 'bg-red-100 text-red-800 border-red-200',
      ATTENTION: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      NORMAL: 'bg-green-100 text-green-800 border-green-200',
    };
    const icons = {
      CRITIQUE: <ShieldExclamationIcon className="w-4 h-4 mr-1" />,
      ATTENTION: <ExclamationTriangleIcon className="w-4 h-4 mr-1" />,
      NORMAL: <CheckCircleIcon className="w-4 h-4 mr-1" />,
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[niveau] || styles.NORMAL}`}>
        {icons[niveau]}
        {niveau}
      </span>
    );
  };

  // KPI Card inline
  const KpiCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
    const colorMap = {
      blue: { bg: 'bg-blue-50 border-blue-200', icon: 'text-blue-600 bg-blue-100' },
      green: { bg: 'bg-green-50 border-green-200', icon: 'text-green-600 bg-green-100' },
      red: { bg: 'bg-red-50 border-red-200', icon: 'text-red-600 bg-red-100' },
      yellow: { bg: 'bg-yellow-50 border-yellow-200', icon: 'text-yellow-600 bg-yellow-100' },
      purple: { bg: 'bg-purple-50 border-purple-200', icon: 'text-purple-600 bg-purple-100' },
      indigo: { bg: 'bg-indigo-50 border-indigo-200', icon: 'text-indigo-600 bg-indigo-100' },
    };
    const c = colorMap[color] || colorMap.blue;
    return (
      <div className={`rounded-xl border p-5 ${c.bg} transition-shadow hover:shadow-md`}>
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-gray-600 mb-1 truncate">{title}</h3>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {Icon && (
            <div className={`p-3 rounded-lg ${c.icon} flex-shrink-0`}>
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Format number
  const fmt = (n) => n != null ? new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(n) : 'N/A';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <SparklesIcon className="w-8 h-8 text-indigo-600" />
              Prédiction des Ventes & Stock
            </h1>
            <p className="text-gray-500 mt-1">
              Anticipez les ruptures de stock grâce à l'intelligence artificielle (Random Forest)
            </p>
          </div>
          <button
            onClick={handleTrain}
            disabled={training}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white shadow-sm transition-all
              ${training
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
              }`}
          >
            {training ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                Entraînement en cours…
              </>
            ) : (
              <>
                <CpuChipIcon className="w-5 h-5" />
                Entraîner le modèle
              </>
            )}
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5" />
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            {success}
          </div>
        )}
      </div>

      {/* Model Info Banner */}
      {modelInfo && (
        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${modelInfo.modeleDisponible ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-medium">
                {modelInfo.modeleDisponible ? 'Modèle actif' : 'Modèle non entraîné'}
              </span>
            </div>
            {modelInfo.dernierEntrainement && (
              <div className="flex items-center gap-1 text-gray-500">
                <ClockIcon className="w-4 h-4" />
                Dernier entraînement : {new Date(modelInfo.dernierEntrainement).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
            {modelInfo.nombreDonneesEntrainement > 0 && (
              <div className="flex items-center gap-1 text-gray-500">
                <ChartBarIcon className="w-4 h-4" />
                {modelInfo.nombreDonneesEntrainement} données d'entraînement
              </div>
            )}
            {modelInfo.r2Score != null && (
              <div className="flex items-center gap-1 text-gray-500">
                <BoltIcon className="w-4 h-4" />
                R² = {(modelInfo.r2Score * 100).toFixed(1)}%
              </div>
            )}
            {modelInfo.erreurMoyenne != null && (
              <div className="flex items-center gap-1 text-gray-500">
                <InformationCircleIcon className="w-4 h-4" />
                MAE = {fmt(modelInfo.erreurMoyenne)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Mois cible</label>
            <select
              value={moisCible}
              onChange={(e) => setMoisCible(Number(e.target.value))}
              className="rounded-lg border-gray-300 text-sm px-3 py-2 border focus:ring-indigo-500 focus:border-indigo-500"
            >
              {MOIS_LABELS.slice(1).map((label, i) => (
                <option key={i + 1} value={i + 1}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Année</label>
            <select
              value={anneeCible}
              onChange={(e) => setAnneeCible(Number(e.target.value))}
              className="rounded-lg border-gray-300 text-sm px-3 py-2 border focus:ring-indigo-500 focus:border-indigo-500"
            >
              {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Niveau d'alerte</label>
            <select
              value={filterNiveau}
              onChange={(e) => setFilterNiveau(e.target.value)}
              className="rounded-lg border-gray-300 text-sm px-3 py-2 border focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="ALL">Tous</option>
              <option value="CRITIQUE">🔴 Critique</option>
              <option value="ATTENTION">🟡 Attention</option>
              <option value="NORMAL">🟢 Normal</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Rechercher un article</label>
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nom ou référence..."
                className="w-full rounded-lg border-gray-300 text-sm pl-9 pr-3 py-2 border focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 text-sm font-medium transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <ArrowPathIcon className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-500">Chargement des prédictions…</p>
          </div>
        </div>
      )}

      {!loading && predictions && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
            <KpiCard
              title="Articles analysés"
              value={predictions.predictions?.length || 0}
              subtitle="avec historique de ventes"
              icon={CubeIcon}
              color="blue"
            />
            <KpiCard
              title="Alertes critiques"
              value={predictions.nombreAlertesCritiques || 0}
              subtitle="rupture imminente"
              icon={ShieldExclamationIcon}
              color="red"
            />
            <KpiCard
              title="Alertes attention"
              value={predictions.nombreAlertesAttention || 0}
              subtitle="stock faible"
              icon={ExclamationTriangleIcon}
              color="yellow"
            />
            <KpiCard
              title="Articles sains"
              value={(predictions.predictions?.length || 0) - (predictions.nombreAlertesCritiques || 0) - (predictions.nombreAlertesAttention || 0)}
              subtitle="stock suffisant"
              icon={CheckCircleIcon}
              color="green"
            />
            <KpiCard
              title="Précision modèle"
              value={predictions.r2Score != null ? `${(predictions.r2Score * 100).toFixed(1)}%` : 'N/A'}
              subtitle="R² score"
              icon={BoltIcon}
              color="purple"
            />
            <KpiCard
              title="Prédiction pour"
              value={`${MOIS_LABELS[moisCible]?.slice(0, 4)}. ${anneeCible}`}
              subtitle="période sélectionnée"
              icon={ArrowTrendingUpIcon}
              color="indigo"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Alert Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-gray-500" />
                Répartition des alertes
              </h3>
              <div className="h-64 flex items-center justify-center">
                <Doughnut
                  data={getAlertDonutData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' },
                    },
                    cutout: '60%',
                  }}
                />
              </div>
            </div>

            {/* Top Risk Articles */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                Top 10 – Articles à risque
              </h3>
              <div className="h-64">
                <Bar
                  data={getTopRiskBarData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: { legend: { position: 'top' } },
                    scales: {
                      x: { beginAtZero: true },
                    },
                  }}
                />
              </div>
            </div>

            {/* Reorder Suggestions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TruckIcon className="w-5 h-5 text-purple-500" />
                Réapprovisionnement suggéré
              </h3>
              <div className="h-64">
                <Bar
                  data={getReapproBarData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { beginAtZero: true },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Predictions Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-indigo-500" />
                Détail des prédictions
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({filteredPredictions.length} article{filteredPredictions.length > 1 ? 's' : ''})
                </span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ventes prédites</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock actuel</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Réservé</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Disponible net</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Écart</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Alerte</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Réappro.</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Confiance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPredictions.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                        {!modelInfo?.modeleDisponible
                          ? 'Le modèle n\'est pas encore entraîné. Cliquez sur "Entraîner le modèle" pour commencer.'
                          : 'Aucun résultat trouvé pour les filtres sélectionnés.'}
                      </td>
                    </tr>
                  )}
                  {filteredPredictions.map((p) => (
                    <tr
                      key={p.articleId}
                      onClick={() => handleArticleClick(p)}
                      className="hover:bg-indigo-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{p.articleNom}</span>
                          <span className="text-xs text-gray-500">{p.articleRef}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        {fmt(p.quantitePredite)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700">
                        {fmt(p.stockActuel)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-500">
                        {fmt(p.stockReserve)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        {fmt(p.stockDisponibleNet)}
                      </td>
                      <td className={`px-4 py-3 text-right text-sm font-semibold ${p.ecartStockPrediction >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="inline-flex items-center gap-1">
                          {p.ecartStockPrediction >= 0
                            ? <ArrowTrendingUpIcon className="w-4 h-4" />
                            : <ArrowTrendingDownIcon className="w-4 h-4" />
                          }
                          {fmt(p.ecartStockPrediction)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <AlertBadge niveau={p.niveauAlerte} />
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-purple-700">
                        {p.quantiteReapprovisionnement > 0 ? fmt(p.quantiteReapprovisionnement) : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${p.scoreConfiance >= 0.8 ? 'bg-green-500' : p.scoreConfiance >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${(p.scoreConfiance || 0) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{((p.scoreConfiance || 0) * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* No model state */}
      {!loading && !predictions && modelInfo && !modelInfo.modeleDisponible && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <CpuChipIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Modèle non entraîné</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Le moteur de prédiction a besoin d'être entraîné avec vos données historiques de ventes.
            Cliquez sur le bouton ci-dessous pour lancer l'entraînement initial.
          </p>
          <button
            onClick={handleTrain}
            disabled={training}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            <CpuChipIcon className="w-5 h-5" />
            Lancer l'entraînement initial
          </button>
        </div>
      )}

      {/* Article Detail Modal */}
      {selectedArticle && articlePrediction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className={`px-6 py-4 rounded-t-2xl ${
              articlePrediction.niveauAlerte === 'CRITIQUE' ? 'bg-red-600' :
              articlePrediction.niveauAlerte === 'ATTENTION' ? 'bg-yellow-500' :
              'bg-green-600'
            }`}>
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <h3 className="text-lg font-bold">{articlePrediction.articleNom}</h3>
                  <p className="text-sm opacity-90">{articlePrediction.articleRef}</p>
                </div>
                <AlertBadge niveau={articlePrediction.niveauAlerte} />
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Prediction Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Ventes prédites</p>
                  <p className="text-2xl font-bold text-indigo-700">{fmt(articlePrediction.quantitePredite)}</p>
                  <p className="text-xs text-gray-500">{MOIS_LABELS[moisCible]} {anneeCible}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Stock disponible net</p>
                  <p className="text-2xl font-bold text-blue-700">{fmt(articlePrediction.stockDisponibleNet)}</p>
                  <p className="text-xs text-gray-500">actuel - réservé</p>
                </div>
              </div>

              {/* Stock Details */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Détail du stock</h4>
                <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                  <div className="flex justify-between px-4 py-2 text-sm">
                    <span className="text-gray-600">Stock actuel (lots)</span>
                    <span className="font-medium">{fmt(articlePrediction.stockActuel)}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2 text-sm">
                    <span className="text-gray-600">Stock réservé</span>
                    <span className="font-medium text-orange-600">-{fmt(articlePrediction.stockReserve)}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2 text-sm font-semibold">
                    <span className="text-gray-800">Disponible net</span>
                    <span>{fmt(articlePrediction.stockDisponibleNet)}</span>
                  </div>
                  <div className={`flex justify-between px-4 py-2 text-sm font-semibold ${articlePrediction.ecartStockPrediction >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <span>Écart (dispo - prédit)</span>
                    <span>{fmt(articlePrediction.ecartStockPrediction)}</span>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className={`rounded-lg p-4 border ${
                articlePrediction.niveauAlerte === 'CRITIQUE' ? 'bg-red-50 border-red-200' :
                articlePrediction.niveauAlerte === 'ATTENTION' ? 'bg-yellow-50 border-yellow-200' :
                'bg-green-50 border-green-200'
              }`}>
                <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <InformationCircleIcon className="w-4 h-4" />
                  Recommandation
                </h4>
                <p className="text-sm text-gray-700">{articlePrediction.recommandation}</p>
                {articlePrediction.quantiteReapprovisionnement > 0 && (
                  <p className="mt-2 text-sm font-semibold text-purple-700 flex items-center gap-1">
                    <TruckIcon className="w-4 h-4" />
                    Commander : {fmt(articlePrediction.quantiteReapprovisionnement)} unités
                  </p>
                )}
              </div>

              {/* Confidence */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Confiance :</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      articlePrediction.scoreConfiance >= 0.8 ? 'bg-green-500' :
                      articlePrediction.scoreConfiance >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(articlePrediction.scoreConfiance || 0) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{((articlePrediction.scoreConfiance || 0) * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionDashboard;

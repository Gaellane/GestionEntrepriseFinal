import React, { useState, useEffect, useCallback } from 'react';
import {
  trainPredictionModel,
  getDashboardSummary,
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
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

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
  UserGroupIcon,
  CalendarDaysIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  Title, Tooltip, Legend, LineElement, PointElement, Filler
);

const MOIS_LABELS = [
  '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const MOIS_SHORT = ['', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const PredictionDashboard = () => {
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

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

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardSummary({ mois: moisCible, annee: anneeCible });
      setDashboard(data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [moisCible, anneeCible]);

  useEffect(() => { loadData(); }, [loadData]);

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

  // Filtered predictions
  const filteredPredictions = (dashboard?.predictions || []).filter(p => {
    if (filterNiveau !== 'ALL' && p.niveauAlerte !== filterNiveau) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (p.articleNom?.toLowerCase().includes(q) || p.articleRef?.toLowerCase().includes(q));
    }
    return true;
  });

  // ======= CHART DATA =======

  const getAlertDonutData = () => {
    const preds = dashboard?.predictions || [];
    const critique = preds.filter(p => p.niveauAlerte === 'CRITIQUE').length;
    const attention = preds.filter(p => p.niveauAlerte === 'ATTENTION').length;
    const normal = preds.filter(p => p.niveauAlerte === 'NORMAL').length;
    return {
      labels: ['Critique', 'Attention', 'Normal'],
      datasets: [{
        data: [critique, attention, normal],
        backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
        borderWidth: 2, borderColor: '#fff',
      }]
    };
  };

  const getTopRiskBarData = () => {
    const topRisk = [...(dashboard?.predictions || [])]
      .filter(p => p.alerteRupture)
      .sort((a, b) => a.ecartStockPrediction - b.ecartStockPrediction)
      .slice(0, 10);
    return {
      labels: topRisk.map(p => p.articleNom?.substring(0, 18) || p.articleRef),
      datasets: [
        { label: 'Stock disponible', data: topRisk.map(p => p.stockDisponibleNet), backgroundColor: 'rgba(59, 130, 246, 0.8)' },
        { label: 'Ventes prédites', data: topRisk.map(p => p.quantitePredite), backgroundColor: 'rgba(239, 68, 68, 0.8)' },
      ]
    };
  };

  const getReapproBarData = () => {
    const need = [...(dashboard?.predictions || [])]
      .filter(p => p.quantiteReapprovisionnement > 0)
      .sort((a, b) => b.quantiteReapprovisionnement - a.quantiteReapprovisionnement)
      .slice(0, 10);
    return {
      labels: need.map(p => p.articleNom?.substring(0, 18) || p.articleRef),
      datasets: [{
        label: 'Quantité à commander',
        data: need.map(p => p.quantiteReapprovisionnement),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
      }]
    };
  };

  const getStockEvolutionChartData = (evolution) => {
    if (!evolution?.evolution) return null;
    const pts = evolution.evolution;
    return {
      labels: pts.map(p => `${MOIS_SHORT[p.mois]} ${p.annee}`),
      datasets: [
        {
          label: 'Stock projeté',
          data: pts.map(p => p.stockProjetee),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.3,
        },
        {
          label: 'Ventes prédites',
          data: pts.map(p => p.ventesPredites),
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: false,
          tension: 0.3,
          borderDash: [5, 5],
        },
        ...(pts.some(p => p.ventesHistoriques >= 0) ? [{
          label: 'Ventes réelles',
          data: pts.map(p => p.ventesHistoriques >= 0 ? p.ventesHistoriques : null),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: false,
          tension: 0.3,
          pointStyle: 'rectRot',
          pointRadius: 5,
        }] : []),
      ]
    };
  };

  const getClientTrendDonutData = () => {
    const d = dashboard;
    return {
      labels: ['En hausse', 'En baisse', 'Stables', 'Nouveaux'],
      datasets: [{
        data: [d?.clientsEnHausse || 0, d?.clientsEnBaisse || 0, d?.clientsStables || 0, d?.nouveauxClients || 0],
        backgroundColor: ['#10B981', '#EF4444', '#6B7280', '#3B82F6'],
        borderWidth: 2, borderColor: '#fff',
      }]
    };
  };

  // ======= COMPOSANTS UTILITAIRES =======

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
        {icons[niveau]}{niveau}
      </span>
    );
  };

  const TrendBadge = ({ tendance }) => {
    const map = {
      HAUSSE: { cls: 'bg-green-100 text-green-700', icon: <ArrowTrendingUpIcon className="w-3.5 h-3.5 mr-1" /> },
      BAISSE: { cls: 'bg-red-100 text-red-700', icon: <ArrowTrendingDownIcon className="w-3.5 h-3.5 mr-1" /> },
      STABLE: { cls: 'bg-gray-100 text-gray-700', icon: <ArrowsRightLeftIcon className="w-3.5 h-3.5 mr-1" /> },
      NOUVEAU: { cls: 'bg-blue-100 text-blue-700', icon: <SparklesIcon className="w-3.5 h-3.5 mr-1" /> },
    };
    const t = map[tendance] || map.STABLE;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${t.cls}`}>
        {t.icon}{tendance}
      </span>
    );
  };

  const KpiCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }) => {
    const colorMap = {
      blue: { bg: 'bg-blue-50 border-blue-200', icon: 'text-blue-600 bg-blue-100' },
      green: { bg: 'bg-green-50 border-green-200', icon: 'text-green-600 bg-green-100' },
      red: { bg: 'bg-red-50 border-red-200', icon: 'text-red-600 bg-red-100' },
      yellow: { bg: 'bg-yellow-50 border-yellow-200', icon: 'text-yellow-600 bg-yellow-100' },
      purple: { bg: 'bg-purple-50 border-purple-200', icon: 'text-purple-600 bg-purple-100' },
      indigo: { bg: 'bg-indigo-50 border-indigo-200', icon: 'text-indigo-600 bg-indigo-100' },
      orange: { bg: 'bg-orange-50 border-orange-200', icon: 'text-orange-600 bg-orange-100' },
    };
    const c = colorMap[color] || colorMap.blue;
    return (
      <div className={`rounded-xl border p-5 ${c.bg} transition-shadow hover:shadow-md`}>
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-gray-600 mb-1 truncate">{title}</h3>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            {trend != null && (
              <p className={`text-xs font-medium mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? '+' : ''}{trend}% vs mois préc.
              </p>
            )}
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

  const fmt = (n) => n != null ? new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(n) : 'N/A';
  const fmtMoney = (n) => n != null ? new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' Ar' : 'N/A';

  // ======= TABS =======
  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: ChartBarIcon },
    { id: 'stock', label: 'Évolution du Stock', icon: CalendarDaysIcon },
    { id: 'clients', label: 'Tendances Clients', icon: UserGroupIcon },
    { id: 'details', label: 'Détail Prédictions', icon: CubeIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <SparklesIcon className="w-8 h-8 text-indigo-600" />
              Prédiction IA — Ventes & Stock
            </h1>
            <p className="text-gray-500 mt-1">
              Anticipez les ruptures, projetez vos ventes et suivez l'évolution de vos clients
            </p>
          </div>
          <button
            onClick={handleTrain}
            disabled={training}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white shadow-sm transition-all
              ${training ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'}`}
          >
            {training ? (
              <><ArrowPathIcon className="w-5 h-5 animate-spin" />Entraînement…</>
            ) : (
              <><CpuChipIcon className="w-5 h-5" />Entraîner le modèle</>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5" />{error}
          </div>
        )}
        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />{success}
          </div>
        )}
      </div>

      {/* Model Info Banner */}
      {dashboard && (
        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${dashboard.modeleDisponible ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="font-medium">{dashboard.modeleDisponible ? 'Modèle actif' : 'Modèle non entraîné'}</span>
            </div>
            {dashboard.dernierEntrainement && (
              <div className="flex items-center gap-1 text-gray-500">
                <ClockIcon className="w-4 h-4" />
                {new Date(dashboard.dernierEntrainement).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
            {dashboard.nombreDonneesEntrainement > 0 && (
              <div className="flex items-center gap-1 text-gray-500">
                <ChartBarIcon className="w-4 h-4" />{dashboard.nombreDonneesEntrainement} données
              </div>
            )}
            {dashboard.r2Score != null && (
              <div className="flex items-center gap-1 text-gray-500">
                <BoltIcon className="w-4 h-4" />R² = {(dashboard.r2Score * 100).toFixed(1)}%
              </div>
            )}
            {dashboard.erreurMoyenne != null && (
              <div className="flex items-center gap-1 text-gray-500">
                <InformationCircleIcon className="w-4 h-4" />MAE = {fmt(dashboard.erreurMoyenne)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters + Tabs */}
      <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Mois cible</label>
            <select value={moisCible} onChange={(e) => setMoisCible(Number(e.target.value))}
              className="rounded-lg border-gray-300 text-sm px-3 py-2 border focus:ring-indigo-500 focus:border-indigo-500">
              {MOIS_LABELS.slice(1).map((label, i) => <option key={i + 1} value={i + 1}>{label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Année</label>
            <select value={anneeCible} onChange={(e) => setAnneeCible(Number(e.target.value))}
              className="rounded-lg border-gray-300 text-sm px-3 py-2 border focus:ring-indigo-500 focus:border-indigo-500">
              {Array.from({ length: 8 }, (_, i) => 2020 + i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={loadData}
            className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 text-sm font-medium transition-colors">
            <ArrowPathIcon className="w-4 h-4" />Actualiser
          </button>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 border-t border-gray-100 pt-3">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
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

      {/* No model state */}
      {!loading && dashboard && !dashboard.modeleDisponible && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <CpuChipIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Modèle non entraîné</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Le moteur de prédiction a besoin d'être entraîné avec vos données historiques de ventes.
          </p>
          <button onClick={handleTrain} disabled={training}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
            <CpuChipIcon className="w-5 h-5" />Lancer l'entraînement initial
          </button>
        </div>
      )}

      {/* ===== CONTENT AREA ===== */}
      {!loading && dashboard && dashboard.modeleDisponible && (
        <>
          {/* ===== TAB: VUE D'ENSEMBLE ===== */}
          {activeTab === 'overview' && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
                <KpiCard title="Ventes prédites" value={fmt(dashboard.totalVentesPredites)}
                  subtitle={`${MOIS_LABELS[moisCible]} ${anneeCible}`}
                  icon={ArrowTrendingUpIcon} color="indigo"
                  trend={dashboard.evolutionVentesPourcent} />
                <KpiCard title="Articles analysés" value={dashboard.totalArticlesAnalyses || 0}
                  subtitle="avec historique" icon={CubeIcon} color="blue" />
                <KpiCard title="Alertes critiques" value={dashboard.alertesCritiques || 0}
                  subtitle="rupture imminente" icon={ShieldExclamationIcon} color="red" />
                <KpiCard title="Alertes attention" value={dashboard.alertesAttention || 0}
                  subtitle="stock faible" icon={ExclamationTriangleIcon} color="yellow" />
                <KpiCard title="Articles sains" value={dashboard.articlesSains || 0}
                  subtitle="stock suffisant" icon={CheckCircleIcon} color="green" />
                <KpiCard title="Rupture < 30j" value={dashboard.articlesEnRuptureSous30j || 0}
                  subtitle="urgence" icon={ClockIcon} color="red" />
                <KpiCard title="Rupture < 90j" value={dashboard.articlesEnRuptureSous90j || 0}
                  subtitle="à planifier" icon={CalendarDaysIcon} color="orange" />
                <KpiCard title="Clients en hausse" value={dashboard.clientsEnHausse || 0}
                  subtitle={`sur ${(dashboard.clientTrends || []).length} clients`}
                  icon={UserGroupIcon} color="green" />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FunnelIcon className="w-5 h-5 text-gray-500" />Répartition des alertes
                  </h3>
                  <div className="h-64 flex items-center justify-center">
                    <Doughnut data={getAlertDonutData()} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, cutout: '60%' }} />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />Top 10 — Articles à risque
                  </h3>
                  <div className="h-64">
                    <Bar data={getTopRiskBarData()} options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { position: 'top' } }, scales: { x: { beginAtZero: true } } }} />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TruckIcon className="w-5 h-5 text-purple-500" />Réapprovisionnement suggéré
                  </h3>
                  <div className="h-64">
                    <Bar data={getReapproBarData()} options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } }} />
                  </div>
                </div>
              </div>

              {/* Quick Client Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <UserGroupIcon className="w-5 h-5 text-blue-500" />Tendances Clients
                  </h3>
                  <div className="h-64 flex items-center justify-center">
                    <Doughnut data={getClientTrendDonutData()} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, cutout: '55%' }} />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CalendarDaysIcon className="w-5 h-5 text-indigo-500" />Projections de rupture (6 mois)
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {(dashboard.stockEvolutions || []).filter(s => s.moisAvantRupture >= 0).map(s => (
                      <div key={s.articleId} className="flex items-center justify-between px-3 py-2 bg-red-50 rounded-lg border border-red-100">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{s.articleNom}</p>
                          <p className="text-xs text-gray-500">{s.articleRef}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-red-600">
                            {s.moisAvantRupture === 0 ? 'Ce mois-ci' : `Dans ${s.moisAvantRupture} mois`}
                          </p>
                          <p className="text-xs text-gray-500">Stock: {fmt(s.stockDisponibleNet)}</p>
                        </div>
                      </div>
                    ))}
                    {(dashboard.stockEvolutions || []).filter(s => s.moisAvantRupture >= 0).length === 0 && (
                      <p className="text-center text-gray-400 py-8">Aucune rupture prévue sur 6 mois</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ===== TAB: STOCK EVOLUTION ===== */}
          {activeTab === 'stock' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Évolution du stock projeté — 6 prochains mois
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Stock disponible actuel diminué des ventes prédites mois par mois. Les articles les plus à risque sont affichés.
                </p>
              </div>

              {(dashboard.stockEvolutions || []).map(evo => {
                const chartData = getStockEvolutionChartData(evo);
                if (!chartData) return null;
                return (
                  <div key={evo.articleId} className={`bg-white rounded-xl border p-6 shadow-sm ${evo.moisAvantRupture >= 0 ? 'border-red-300' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-base font-semibold text-gray-900">{evo.articleNom}</h4>
                        <p className="text-xs text-gray-500">{evo.articleRef} — Stock actuel: {fmt(evo.stockActuel)} | Réservé: {fmt(evo.stockReserve)} | Disponible: {fmt(evo.stockDisponibleNet)}</p>
                      </div>
                      {evo.moisAvantRupture >= 0 ? (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                          Rupture {evo.moisAvantRupture === 0 ? 'ce mois' : `dans ${evo.moisAvantRupture} mois`}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          Stock suffisant 6 mois
                        </span>
                      )}
                    </div>
                    <div className="h-56">
                      <Line data={chartData} options={{
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { position: 'top', labels: { font: { size: 11 } } } },
                        scales: {
                          y: { beginAtZero: true, title: { display: true, text: 'Quantité' } },
                        },
                      }} />
                    </div>
                    {/* Data table below chart */}
                    <div className="mt-3 overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="text-gray-500">
                            {evo.evolution?.map(p => (
                              <th key={`${p.mois}-${p.annee}`} className="px-2 py-1 text-center font-medium">{MOIS_SHORT[p.mois]} {p.annee}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="text-blue-700">
                            {evo.evolution?.map(p => (
                              <td key={`s-${p.mois}-${p.annee}`} className={`px-2 py-1 text-center font-medium ${p.rupturePrevue ? 'text-red-600 font-bold' : ''}`}>
                                {fmt(p.stockProjetee)}{p.rupturePrevue ? ' ⚠' : ''}
                              </td>
                            ))}
                          </tr>
                          <tr className="text-red-600">
                            {evo.evolution?.map(p => (
                              <td key={`v-${p.mois}-${p.annee}`} className="px-2 py-1 text-center">-{fmt(p.ventesPredites)}</td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
              {(dashboard.stockEvolutions || []).length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
                  Aucune donnée d'évolution de stock disponible.
                </div>
              )}
            </div>
          )}

          {/* ===== TAB: CLIENTS ===== */}
          {activeTab === 'clients' && (
            <div className="space-y-6">
              {/* Client KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Clients en hausse" value={dashboard.clientsEnHausse || 0}
                  subtitle="+10% de CA vs année prec." icon={ArrowTrendingUpIcon} color="green" />
                <KpiCard title="Clients en baisse" value={dashboard.clientsEnBaisse || 0}
                  subtitle="-10% de CA vs année prec." icon={ArrowTrendingDownIcon} color="red" />
                <KpiCard title="Clients stables" value={dashboard.clientsStables || 0}
                  subtitle="±10% de variation" icon={ArrowsRightLeftIcon} color="blue" />
                <KpiCard title="Nouveaux clients" value={dashboard.nouveauxClients || 0}
                  subtitle="apparus cette année" icon={SparklesIcon} color="purple" />
              </div>

              {/* Client table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <UserGroupIcon className="w-5 h-5 text-indigo-500" />
                    Évolution des clients — {anneeCible} vs {anneeCible - 1}
                    <span className="text-sm font-normal text-gray-500 ml-2">({(dashboard.clientTrends || []).length} clients)</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CA {anneeCible}</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CA {anneeCible - 1}</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Évolution</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cmd {anneeCible}</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cmd {anneeCible - 1}</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Panier moyen</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tendance</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(dashboard.clientTrends || []).length === 0 && (
                        <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Aucune donnée client.</td></tr>
                      )}
                      {(dashboard.clientTrends || []).map(c => (
                        <tr key={c.clientId} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.clientNom}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-700">{fmtMoney(c.totalAchatsAnneeCourante)}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-500">{fmtMoney(c.totalAchatsAnneePrecedente)}</td>
                          <td className={`px-4 py-3 text-right text-sm font-semibold ${c.evolutionPourcent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {c.evolutionPourcent >= 0 ? '+' : ''}{c.evolutionPourcent}%
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-700">{c.nombreCommandesAnneeCourante}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-500">{c.nombreCommandesAnneePrecedente}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-700">{fmtMoney(c.panierMoyen)}</td>
                          <td className="px-4 py-3 text-center"><TrendBadge tendance={c.tendance} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: DETAIL PREDICTIONS ===== */}
          {activeTab === 'details' && (
            <>
              {/* Table Filters */}
              <div className="mb-4 flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Niveau d'alerte</label>
                  <select value={filterNiveau} onChange={(e) => setFilterNiveau(e.target.value)}
                    className="rounded-lg border-gray-300 text-sm px-3 py-2 border focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="ALL">Tous</option>
                    <option value="CRITIQUE">Critique</option>
                    <option value="ATTENTION">Attention</option>
                    <option value="NORMAL">Normal</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Rechercher</label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Nom ou référence…"
                      className="w-full rounded-lg border-gray-300 text-sm pl-9 pr-3 py-2 border focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                </div>
              </div>

              {/* Predictions Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5 text-indigo-500" />
                    Prédictions — {MOIS_LABELS[moisCible]} {anneeCible}
                    <span className="text-sm font-normal text-gray-500 ml-2">({filteredPredictions.length} article{filteredPredictions.length > 1 ? 's' : ''})</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ventes prédites</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock actuel</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Réservé</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Disponible</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Écart</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Alerte</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Réappro.</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Confiance</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPredictions.length === 0 && (
                        <tr>
                          <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                            {!dashboard.modeleDisponible
                              ? 'Modèle non entraîné.'
                              : 'Aucun résultat pour les filtres sélectionnés.'}
                          </td>
                        </tr>
                      )}
                      {filteredPredictions.map((p) => (
                        <tr key={p.articleId} onClick={() => setSelectedArticle(p)}
                          className="hover:bg-indigo-50 cursor-pointer transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">{p.articleNom}</span>
                              <span className="text-xs text-gray-500">{p.articleRef}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{fmt(p.quantitePredite)}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-700">{fmt(p.stockActuel)}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-500">{fmt(p.stockReserve)}</td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{fmt(p.stockDisponibleNet)}</td>
                          <td className={`px-4 py-3 text-right text-sm font-semibold ${p.ecartStockPrediction >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <span className="inline-flex items-center gap-1">
                              {p.ecartStockPrediction >= 0 ? <ArrowTrendingUpIcon className="w-4 h-4" /> : <ArrowTrendingDownIcon className="w-4 h-4" />}
                              {fmt(p.ecartStockPrediction)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center"><AlertBadge niveau={p.niveauAlerte} /></td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-purple-700">
                            {p.quantiteReapprovisionnement > 0 ? fmt(p.quantiteReapprovisionnement) : '—'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div className={`h-2 rounded-full ${p.scoreConfiance >= 0.8 ? 'bg-green-500' : p.scoreConfiance >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  style={{ width: `${(p.scoreConfiance || 0) * 100}%` }} />
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
        </>
      )}

      {/* ===== ARTICLE DETAIL MODAL ===== */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedArticle(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className={`px-6 py-4 rounded-t-2xl ${
              selectedArticle.niveauAlerte === 'CRITIQUE' ? 'bg-red-600' :
              selectedArticle.niveauAlerte === 'ATTENTION' ? 'bg-yellow-500' : 'bg-green-600'
            }`}>
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <h3 className="text-lg font-bold">{selectedArticle.articleNom}</h3>
                  <p className="text-sm opacity-90">{selectedArticle.articleRef}</p>
                </div>
                <AlertBadge niveau={selectedArticle.niveauAlerte} />
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Ventes prédites</p>
                  <p className="text-2xl font-bold text-indigo-700">{fmt(selectedArticle.quantitePredite)}</p>
                  <p className="text-xs text-gray-500">{MOIS_LABELS[moisCible]} {anneeCible}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Stock disponible</p>
                  <p className="text-2xl font-bold text-blue-700">{fmt(selectedArticle.stockDisponibleNet)}</p>
                  <p className="text-xs text-gray-500">actuel − réservé</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Détail du stock</h4>
                <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                  <div className="flex justify-between px-4 py-2 text-sm">
                    <span className="text-gray-600">Stock actuel (lots)</span>
                    <span className="font-medium">{fmt(selectedArticle.stockActuel)}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2 text-sm">
                    <span className="text-gray-600">Stock réservé</span>
                    <span className="font-medium text-orange-600">-{fmt(selectedArticle.stockReserve)}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2 text-sm font-semibold">
                    <span className="text-gray-800">Disponible net</span>
                    <span>{fmt(selectedArticle.stockDisponibleNet)}</span>
                  </div>
                  <div className={`flex justify-between px-4 py-2 text-sm font-semibold ${selectedArticle.ecartStockPrediction >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <span>Écart (dispo − prédit)</span>
                    <span>{fmt(selectedArticle.ecartStockPrediction)}</span>
                  </div>
                </div>
              </div>

              <div className={`rounded-lg p-4 border ${
                selectedArticle.niveauAlerte === 'CRITIQUE' ? 'bg-red-50 border-red-200' :
                selectedArticle.niveauAlerte === 'ATTENTION' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
              }`}>
                <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <InformationCircleIcon className="w-4 h-4" />Recommandation
                </h4>
                <p className="text-sm text-gray-700">{selectedArticle.recommandation}</p>
                {selectedArticle.quantiteReapprovisionnement > 0 && (
                  <p className="mt-2 text-sm font-semibold text-purple-700 flex items-center gap-1">
                    <TruckIcon className="w-4 h-4" />Commander : {fmt(selectedArticle.quantiteReapprovisionnement)} unités
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Confiance :</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div className={`h-3 rounded-full transition-all ${
                    selectedArticle.scoreConfiance >= 0.8 ? 'bg-green-500' :
                    selectedArticle.scoreConfiance >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} style={{ width: `${(selectedArticle.scoreConfiance || 0) * 100}%` }} />
                </div>
                <span className="text-sm font-medium">{((selectedArticle.scoreConfiance || 0) * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm">
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

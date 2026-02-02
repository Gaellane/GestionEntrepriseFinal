import React, { useState, useEffect } from 'react';
import { getAllKpis } from '../../api/achatKpiApi';
import KpiCard from '../../components/kpi/KpiCard';
import ComparaisonKpiCard from '../../components/kpi/ComparaisonKpiCard';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';
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
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
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

export default function AchatKpiDashboard() {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30days'); // '30days', '90days', 'year', 'custom'
  const [historicalData, setHistoricalData] = useState([]);

  // Dates par défaut
  const getDefaultDates = (range = '30days') => {
    const today = new Date();
    const startDate = new Date();
    
    switch(range) {
      case '7days':
        startDate.setDate(today.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(today.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(today.getDate() - 90);
        break;
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate.setDate(today.getDate() - 30);
    }
    
    return {
      dateMin: startDate.toISOString().slice(0, 16),
      dateMax: today.toISOString().slice(0, 16)
    };
  };

  const [dateMin, setDateMin] = useState(getDefaultDates().dateMin);
  const [dateMax, setDateMax] = useState(getDefaultDates().dateMax);

  const loadKpis = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllKpis(dateMin, dateMax);
      setKpis(data);
      
      // Simuler des données historiques pour les graphiques
      // En production, vous auriez une API séparée pour ça
      generateHistoricalData(data);
    } catch (err) {
      setError('Erreur lors du chargement des KPIs');
      console.error('Error fetching KPIs:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateHistoricalData = (currentData) => {
    // Simuler des données historiques pour les graphiques
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentMonth = new Date().getMonth();
    
    const historical = months.slice(0, currentMonth + 1).map((month, index) => {
      const baseValue = currentData.montantTotalAchats / (currentMonth + 1);
      const variation = Math.random() * 0.3 - 0.15; // Variation de -15% à +15%
      
      return {
        month,
        montantAchats: baseValue * (1 + variation * (currentMonth - index) / 12),
        nombreAchats: Math.floor(currentData.nombreAchats / (currentMonth + 1) * (0.8 + Math.random() * 0.4)),
        coutMoyen: currentData.coutMoyenParAchat * (0.9 + Math.random() * 0.2),
        estimation: baseValue * (1 + variation * (currentMonth - index) / 12) * 0.85,
        reel: baseValue * (1 + variation * (currentMonth - index) / 12)
      };
    });
    
    setHistoricalData(historical);
  };

  useEffect(() => {
    loadKpis();
  }, []);

  const handleRefresh = () => {
    loadKpis();
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    const dates = getDefaultDates(range);
    setDateMin(dates.dateMin);
    setDateMax(dates.dateMax);
  };

  const handleApplyCustomDates = () => {
    setTimeRange('custom');
    loadKpis();
  };

  // Données pour le graphique d'évolution des achats
  const getPurchaseTrendData = () => {
    return {
      labels: historicalData.map(d => d.month),
      datasets: [
        {
          label: 'Montant des achats',
          data: historicalData.map(d => d.montantAchats),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Nombre d\'achats',
          data: historicalData.map(d => d.nombreAchats),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };
  };

  // Données pour le graphique de comparaison estimation vs réel
  const getEstimationVsRealData = () => {
    const months = historicalData.slice(-6); // Derniers 6 mois
    
    return {
      labels: months.map(d => d.month),
      datasets: [
        {
          label: 'Prix Estimation',
          data: months.map(d => d.estimation),
          backgroundColor: 'rgba(168, 85, 247, 0.7)',
          borderColor: 'rgb(168, 85, 247)',
          borderWidth: 1
        },
        {
          label: 'Prix Réel',
          data: months.map(d => d.reel),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        }
      ]
    };
  };

  // Données pour le graphique de répartition des coûts
  const getCostDistributionData = () => {
    if (!kpis) return null;
    
    // Simuler des catégories d'achat
    const categories = [
      { name: 'Matériel', value: kpis.montantTotalAchats * 0.4 },
      { name: 'Services', value: kpis.montantTotalAchats * 0.25 },
      { name: 'Logiciels', value: kpis.montantTotalAchats * 0.15 },
      { name: 'Fournitures', value: kpis.montantTotalAchats * 0.12 },
      { name: 'Autres', value: kpis.montantTotalAchats * 0.08 }
    ];
    
    return {
      labels: categories.map(c => c.name),
      datasets: [
        {
          data: categories.map(c => c.value),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(168, 85, 247)',
            'rgb(239, 68, 68)'
          ],
          borderWidth: 2
        }
      ]
    };
  };

  // Options pour les graphiques
  const lineChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.datasetIndex === 0) {
              label += new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'MGA',
                minimumFractionDigits: 0
              }).format(context.raw).replace('MGA', 'Ar');
            } else {
              label += context.raw;
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Montant (Ar)'
        },
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('fr-FR', {
              notation: 'compact',
              compactDisplay: 'short'
            }).format(value) + ' Ar';
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Nombre d\'achats'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    }
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('fr-FR', {
              notation: 'compact',
              compactDisplay: 'short'
            }).format(value) + ' Ar';
          }
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${context.label}: ${new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'MGA',
              minimumFractionDigits: 0
            }).format(value).replace('MGA', 'Ar')} (${percentage}%)`;
          }
        }
      }
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value).replace('MGA', 'Ar');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de Bord - KPIs Achats</h1>
              <p className="text-gray-600">Indicateurs de performance et analytics des achats</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtres de période */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div className="flex space-x-2">
              {['7days', '30days', '90days', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => handleTimeRangeChange(range)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    timeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range === '7days' && '7 derniers jours'}
                  {range === '30days' && '30 derniers jours'}
                  {range === '90days' && '90 derniers jours'}
                  {range === 'year' && 'Cette année'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Min
              </label>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="datetime-local"
                  value={dateMin}
                  onChange={(e) => setDateMin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Max
              </label>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="datetime-local"
                  value={dateMax}
                  onChange={(e) => setDateMax(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleApplyCustomDates}
                disabled={loading}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                Appliquer les dates
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Chargement des données...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-600 font-semibold">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* KPIs Display */}
        {!loading && !error && kpis && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <CurrencyDollarIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                    kpis.tendanceAchats >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {kpis.tendanceAchats >= 0 ? '▲' : '▼'} {Math.abs(kpis.tendanceAchats || 0)}%
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Montant Total Achats</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {formatCurrency(kpis.montantTotalAchats)}
                </p>
                <p className="text-sm text-gray-500">
                  {kpis.nombreAchats} achat(s) • {formatCurrency(kpis.coutMoyenParAchat)} en moyenne
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <ShoppingCartIcon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <span className="text-sm font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    {kpis.tauxCommandes ? `${kpis.tauxCommandes}%` : 'N/A'}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Total Commandes</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {formatCurrency(kpis.montantTotalCommandes)}
                </p>
                <p className="text-sm text-gray-500">
                  Montant total des commandes à traiter
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <ChartBarIcon className="w-8 h-8 text-purple-600" />
                  </div>
                  <span className="text-sm font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                    {kpis.evolutionCoutMoyen ? `${kpis.evolutionCoutMoyen}%` : 'N/A'}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Coût Moyen / Achat</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {formatCurrency(kpis.coutMoyenParAchat)}
                </p>
                <p className="text-sm text-gray-500">
                  Coût moyen par transaction d'achat
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <DocumentTextIcon className="w-8 h-8 text-orange-600" />
                  </div>
                  <span className="text-sm font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    {kpis.tauxCroissanceAchats ? `+${kpis.tauxCroissanceAchats}%` : 'N/A'}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Nombre d'Achats</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {kpis.nombreAchats.toLocaleString('fr-FR')}
                </p>
                <p className="text-sm text-gray-500">
                  Transactions sur la période
                </p>
              </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique d'évolution des achats */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Évolution des Achats</h3>
                    <p className="text-sm text-gray-600">Tendance sur {timeRange === '30days' ? '30 jours' : timeRange}</p>
                  </div>
                  <ArrowTrendingUpIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="h-72">
                  {historicalData.length > 0 && (
                    <Line data={getPurchaseTrendData()} options={lineChartOptions} />
                  )}
                </div>
              </div>

              {/* Comparaison Prix */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Estimation vs Réel</h3>
                    <p className="text-sm text-gray-600">Comparaison des prix</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded mr-1"></div>
                      <span className="text-xs text-gray-600">Estimation</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
                      <span className="text-xs text-gray-600">Réel</span>
                    </div>
                  </div>
                </div>
                <div className="h-72">
                  {historicalData.length > 0 && (
                    <Bar data={getEstimationVsRealData()} options={barChartOptions} />
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-700 mb-1">Prix Estimation Total</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(kpis.prixEstimationTotal)}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700 mb-1">Prix Réel Total</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(kpis.prixReelTotal)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dernière ligne avec répartition et détails */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Répartition des coûts */}
              <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-1">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Répartition des Coûts</h3>
                    <p className="text-sm text-gray-600">Par catégorie d'achat</p>
                  </div>
                  <ChartPieIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div className="h-64">
                  {getCostDistributionData() && (
                    <Doughnut data={getCostDistributionData()} options={pieChartOptions} />
                  )}
                </div>
              </div>

              {/* Résumé des écarts */}
              <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Analyse des Écarts</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        kpis.ecartPrix >= 0 ? 'bg-red-100' : 'bg-emerald-100'
                      }`}>
                        {kpis.ecartPrix >= 0 ? (
                          <ArrowTrendingUpIcon className="w-5 h-5 text-red-600" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Écart total</p>
                        <p className="text-sm text-gray-600">Différence estimation vs réel</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        kpis.ecartPrix >= 0 ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        {kpis.ecartPrix >= 0 ? '+' : ''}{formatCurrency(kpis.ecartPrix)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {kpis.pourcentageEcart >= 0 ? '+' : ''}{kpis.pourcentageEcart?.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Achats par jour moyen</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(kpis.montantTotalAchats / 30)}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Taux de commandes</p>
                      <p className="text-lg font-bold text-gray-900">
                        {kpis.tauxCommandes ? `${kpis.tauxCommandes}%` : 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Valeur moyenne par commande</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(kpis.montantTotalCommandes / (kpis.nombreCommandes || 1))}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Économies potentielles</p>
                      <p className="text-lg font-bold text-emerald-600">
                        {kpis.ecartPrix < 0 ? formatCurrency(Math.abs(kpis.ecartPrix)) : '0 Ar'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Recommandations</h4>
                    <div className="space-y-2">
                      {kpis.pourcentageEcart > 5 && (
                        <div className="flex items-start space-x-2 text-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                          <span className="text-gray-700">
                            Les estimations sont supérieures aux prix réels de {kpis.pourcentageEcart.toFixed(1)}%
                          </span>
                        </div>
                      )}
                      {kpis.tendanceAchats > 0 && (
                        <div className="flex items-start space-x-2 text-sm">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5"></div>
                          <span className="text-gray-700">
                            Tendance positive : les achats augmentent de {kpis.tendanceAchats}%
                          </span>
                        </div>
                      )}
                      <div className="flex items-start space-x-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                        <span className="text-gray-700">
                          Coût moyen par achat : {formatCurrency(kpis.coutMoyenParAchat)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
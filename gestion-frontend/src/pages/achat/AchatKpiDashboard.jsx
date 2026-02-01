import React, { useState, useEffect } from 'react';
import { getAllKpis } from '../../api/achatKpiApi';
import KpiCard from '../../components/kpi/KpiCard';
import ComparaisonKpiCard from '../../components/kpi/ComparaisonKpiCard';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function AchatKpiDashboard() {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dates par défaut : 30 derniers jours
  const getDefaultDates = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    return {
      dateMin: thirtyDaysAgo.toISOString().slice(0, 16),
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
      console.log('KPIs loaded:', data);
    } catch (err) {
      setError('Erreur lors du chargement des KPIs');
      console.error('Error fetching KPIs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKpis();
  }, []);

  const handleRefresh = () => {
    loadKpis();
  };

  const handleResetDates = () => {
    const defaults = getDefaultDates();
    setDateMin(defaults.dateMin);
    setDateMax(defaults.dateMax);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de Bord - KPIs Achats</h1>
          <p className="text-gray-600">Indicateurs de performance des achats</p>
        </div>

        {/* Filtres de date */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4 flex-wrap gap-4">
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
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleResetDates}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                30 derniers jours
              </button>
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

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Chargement des KPIs...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        )}

        {/* KPIs Display */}
        {!loading && !error && kpis && (
          <div className="space-y-8">
            {/* Première ligne - KPIs principaux */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard
                title="Montant Total Achats"
                value={kpis.montantTotalAchats}
                subtitle={`${kpis.nombreAchats} achat(s)`}
                format="currency"
                color="blue"
                icon={CurrencyDollarIcon}
              />

              <KpiCard
                title="Total Commandes"
                value={kpis.montantTotalCommandes}
                subtitle="Montant à sortir"
                format="currency"
                color="green"
                icon={ShoppingCartIcon}
              />

              <KpiCard
                title="Coût Moyen / Achat"
                value={kpis.coutMoyenParAchat}
                subtitle="Par achat"
                format="currency"
                color="purple"
                icon={ChartBarIcon}
              />

              <KpiCard
                title="Nombre d'Achats"
                value={kpis.nombreAchats}
                subtitle="Période sélectionnée"
                format="number"
                color="orange"
                icon={ChartBarIcon}
              />
            </div>

            {/* Deuxième ligne - Comparaison Prix */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComparaisonKpiCard
                title="Comparaison Prix Estimation vs Réel"
                estimation={kpis.prixEstimationTotal}
                reel={kpis.prixReelTotal}
                ecart={kpis.ecartPrix}
                pourcentage={kpis.pourcentageEcart}
                color="purple"
              />

              {/* Résumé statistique */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé Statistique</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Prix Estimation Total</span>
                    <span className="font-semibold text-gray-900">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'MGA',
                        minimumFractionDigits: 0
                      }).format(kpis.prixEstimationTotal).replace('MGA', 'Ar')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Prix Réel Total</span>
                    <span className="font-semibold text-gray-900">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'MGA',
                        minimumFractionDigits: 0
                      }).format(kpis.prixReelTotal).replace('MGA', 'Ar')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Écart</span>
                    <span className={`font-semibold ${kpis.ecartPrix >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {kpis.ecartPrix >= 0 ? '+' : ''}
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'MGA',
                        minimumFractionDigits: 0
                      }).format(kpis.ecartPrix).replace('MGA', 'Ar')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pourcentage d'écart</span>
                    <span className={`font-semibold ${kpis.pourcentageEcart >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {kpis.pourcentageEcart >= 0 ? '+' : ''}{kpis.pourcentageEcart?.toFixed(2)}%
                    </span>
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

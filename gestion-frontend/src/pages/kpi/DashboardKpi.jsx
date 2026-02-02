import React, { useState, useEffect } from 'react';
import {
    getKpiCommercial,
    getKpiFinance,
    getKpiDirection,
    getDashboardCommercial,
    exportVentesExcel,
    exportKpiCommercialExcel,
    downloadFile
} from '../../api/kpiApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';

// Chart.js components (will be installed)
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
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement
);

const DashboardKpi = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('commercial');
    const [dateDebut, setDateDebut] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        return d.toISOString().split('T')[0];
    });
    const [dateFin, setDateFin] = useState(() => new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Data states
    const [kpiCommercial, setKpiCommercial] = useState(null);
    const [kpiFinance, setKpiFinance] = useState(null);
    const [kpiDirection, setKpiDirection] = useState(null);
    const [dashboard, setDashboard] = useState(null);

    useEffect(() => {
        loadData();
    }, [activeTab, dateDebut, dateFin]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        const params = { dateDebut, dateFin };

        try {
            if (activeTab === 'commercial') {
                const [kpi, dash] = await Promise.all([
                    getKpiCommercial(params),
                    getDashboardCommercial(params)
                ]);
                setKpiCommercial(kpi);
                setDashboard(dash);
            } else if (activeTab === 'finance') {
                const kpi = await getKpiFinance(params);
                setKpiFinance(kpi);
            } else if (activeTab === 'direction') {
                const kpi = await getKpiDirection(params);
                setKpiDirection(kpi);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = async () => {
        try {
            const response = await exportVentesExcel({ dateDebut, dateFin });
            downloadFile(response, `ventes_${dateDebut}_${dateFin}.xlsx`);
        } catch (err) {
            alert('Erreur lors de l\'export');
        }
    };

    const handleExportKpiExcel = async () => {
        try {
            const response = await exportKpiCommercialExcel({ dateDebut, dateFin });
            downloadFile(response, `kpi_commercial_${dateDebut}_${dateFin}.xlsx`);
        } catch (err) {
            alert('Erreur lors de l\'export');
        }
    };

    const KpiCard = ({ title, value, subtitle, trend, color = 'blue', icon }) => {
        const colors = {
            blue: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
            green: 'bg-gradient-to-br from-green-500 to-green-600 text-white',
            red: 'bg-gradient-to-br from-red-500 to-red-600 text-white',
            yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white',
            purple: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white',
            indigo: 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white',
            pink: 'bg-gradient-to-br from-pink-500 to-pink-600 text-white',
        };

        return (
            <div className={`rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-200 ${colors[color]}`}>
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h3 className="text-sm font-medium opacity-90">{title}</h3>
                        <p className="text-3xl font-bold mt-2">{value}</p>
                        {subtitle && <p className="text-xs mt-1 opacity-80">{subtitle}</p>}
                    </div>
                    {icon && <div className="text-4xl opacity-80">{icon}</div>}
                </div>
                {trend !== undefined && (
                    <div className="mt-4 flex items-center">
                        <span className={`inline-flex items-center text-sm font-medium px-2 py-1 rounded-full ${
                            trend >= 0 
                                ? 'bg-white/20 text-white' 
                                : 'bg-black/20 text-white'
                        }`}>
                            {trend >= 0 ? '↗️' : '↘️'} {Math.abs(trend).toFixed(1)}%
                        </span>
                    </div>
                )}
            </div>
        );
    };

    // Chart configurations and components
    const PipelineChart = ({ data }) => {
        const chartData = {
            labels: Object.keys(data || {}),
            datasets: [
                {
                    data: Object.values(data || {}),
                    backgroundColor: [
                        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }
            ]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        };

        return <Doughnut data={chartData} options={options} />;
    };

    const TrendsChart = ({ data, label }) => {
        const chartData = {
            labels: data?.labels || [],
            datasets: [
                {
                    label: label,
                    data: data?.values || [],
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        };

        return <Line data={chartData} options={options} />;
    };

    const TopClientsChart = ({ data }) => {
        const chartData = {
            labels: data?.map(client => client.clientNom.substring(0, 15) + '...') || [],
            datasets: [
                {
                    label: 'CA (Ar)',
                    data: data?.map(client => client.totalAchats / 1000000) || [],
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: '#3B82F6',
                    borderWidth: 1,
                    borderRadius: 6
                }
            ]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'CA (M Ar)'
                    }
                }
            }
        };

        return <Bar data={chartData} options={options} />;
    };

    const RemisesChart = ({ data }) => {
        const chartData = {
            labels: ['Remises Fixes', 'Remises %', 'Total'],
            datasets: [
                {
                    data: [
                        data?.totalRemisesFixe || 0,
                        data?.totalRemisesPourcentage || 0,
                        data?.totalRemises || 0
                    ],
                    backgroundColor: ['#EF4444', '#F59E0B', '#8B5CF6'],
                    borderWidth: 0
                }
            ]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        };

        return <Doughnut data={chartData} options={options} />;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">📊 Tableau de Bord</h1>
                        <p className="text-gray-600 mt-1">Analyse en temps réel de vos performances</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportExcel}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                        >
                            📊 Export Ventes
                        </button>
                        <button
                            onClick={handleExportKpiExcel}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                        >
                            📈 Export KPI
                        </button>
                    </div>
                </div>

                {/* Date Filters */}
                <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">🗓️ Période d'analyse</h3>
                    <div className="flex gap-6 items-end flex-wrap">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date début
                            </label>
                            <input
                                type="date"
                                value={dateDebut}
                                onChange={(e) => setDateDebut(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date fin
                            </label>
                            <input
                                type="date"
                                value={dateFin}
                                onChange={(e) => setDateFin(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={loadData}
                            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center gap-2"
                        >
                            🔄 Actualiser
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="mb-8 bg-white rounded-2xl shadow-lg p-2">
                    <nav className="flex gap-1">
                        <button
                            onClick={() => setActiveTab('commercial')}
                            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                                activeTab === 'commercial'
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                        >
                            🛍️ Commercial
                        </button>
                        <button
                            onClick={() => setActiveTab('finance')}
                            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                                activeTab === 'finance'
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                            }`}
                        >
                            💰 Finance
                        </button>
                        <button
                            onClick={() => setActiveTab('direction')}
                            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                                activeTab === 'direction'
                                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                            }`}
                        >
                            👔 Direction
                        </button>
                    </nav>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Commercial Tab */}
                        {activeTab === 'commercial' && kpiCommercial && (
                            <div className="space-y-8">
                                {/* Main KPI Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <KpiCard
                                        title="Commandes en cours"
                                        value={kpiCommercial.commandesEnCours}
                                        subtitle="Confirmées + En préparation"
                                        icon="📋"
                                        color="blue"
                                    />
                                    <KpiCard
                                        title="Commandes livrées"
                                        value={kpiCommercial.commandesLivrees}
                                        subtitle="Sur la période"
                                        icon="✅"
                                        color="green"
                                    />
                                    <KpiCard
                                        title="Commandes en retard"
                                        value={kpiCommercial.commandesEnRetard}
                                        subtitle="Date livraison dépassée"
                                        icon="⏰"
                                        color="red"
                                    />
                                    <KpiCard
                                        title="Taux d'annulation"
                                        value={`${kpiCommercial.tauxAnnulation?.toFixed(1)}%`}
                                        subtitle={`${kpiCommercial.commandesAnnulees} / ${kpiCommercial.commandesTotal}`}
                                        icon="❌"
                                        color={kpiCommercial.tauxAnnulation > 10 ? 'red' : 'yellow'}
                                    />
                                </div>

                                {/* Charts Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Pipeline Chart */}
                                    {dashboard?.pipeline && (
                                        <div className="bg-white rounded-2xl shadow-lg p-6">
                                            <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                                                📊 Pipeline des commandes
                                            </h2>
                                            <div className="h-80">
                                                <PipelineChart data={dashboard.pipeline} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Remises Chart */}
                                    <div className="bg-white rounded-2xl shadow-lg p-6">
                                        <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                                            💸 Répartition des remises
                                        </h2>
                                        <div className="h-80">
                                            <RemisesChart data={kpiCommercial} />
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Remises Section */}
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                                        💰 Analyse détaillée des remises
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-red-600 font-medium">Remises fixes</p>
                                                    <p className="text-2xl font-bold text-red-700">
                                                        {(kpiCommercial.totalRemisesFixe / 1000)?.toLocaleString('fr-FR')} K Ar
                                                    </p>
                                                </div>
                                                <span className="text-3xl">🔢</span>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-yellow-600 font-medium">Remises %</p>
                                                    <p className="text-2xl font-bold text-yellow-700">
                                                        {(kpiCommercial.totalRemisesPourcentage / 1000)?.toLocaleString('fr-FR')} K Ar
                                                    </p>
                                                </div>
                                                <span className="text-3xl">📊</span>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-purple-600 font-medium">Total remises</p>
                                                    <p className="text-2xl font-bold text-purple-700">
                                                        {(kpiCommercial.totalRemises / 1000)?.toLocaleString('fr-FR')} K Ar
                                                    </p>
                                                    {kpiCommercial.depassementPlafond && (
                                                        <p className="text-xs text-red-600 mt-1 font-medium">
                                                            ⚠️ Dépassement plafond
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="text-3xl">💸</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Alerts */}
                                {dashboard?.alertes && dashboard.alertes.length > 0 && (
                                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
                                        <h2 className="text-xl font-semibold mb-6 text-red-600 flex items-center gap-2">
                                            🚨 Alertes importantes ({dashboard.alertes.length})
                                        </h2>
                                        <div className="space-y-3 max-h-60 overflow-y-auto">
                                            {dashboard.alertes.map((alerte, index) => (
                                                <div
                                                    key={index}
                                                    className={`p-4 rounded-xl border-l-4 ${
                                                        alerte.priorite === 'HIGH'
                                                            ? 'bg-red-50 border-red-500 text-red-700'
                                                            : 'bg-yellow-50 border-yellow-500 text-yellow-700'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-xl">
                                                            {alerte.priorite === 'HIGH' ? '🔴' : '🟡'}
                                                        </span>
                                                        <p className="font-medium">{alerte.message}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Finance Tab */}
                        {activeTab === 'finance' && kpiFinance && (
                            <div className="space-y-8">
                                {/* Finance KPI Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <KpiCard
                                        title="CA Réalisé"
                                        value={`${(kpiFinance.caRealise / 1000000)?.toFixed(2)} M`}
                                        subtitle="Ventes livrées"
                                        icon="💰"
                                        color="green"
                                    />
                                    <KpiCard
                                        title="CA Facturé"
                                        value={`${(kpiFinance.caFacture / 1000000)?.toFixed(2)} M`}
                                        subtitle="Ar"
                                        icon="📄"
                                        color="blue"
                                    />
                                    <KpiCard
                                        title="CA Encaissé"
                                        value={`${(kpiFinance.caEncaisse / 1000000)?.toFixed(2)} M`}
                                        subtitle="Ar"
                                        icon="💳"
                                        color="purple"
                                    />
                                    <KpiCard
                                        title="Remboursements"
                                        value={`${(kpiFinance.volumeRemboursements / 1000)?.toFixed(0)} K`}
                                        subtitle="Ar"
                                        icon="↩️"
                                        color="red"
                                    />
                                </div>

                                {/* Margin Analysis */}
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                                        📊 Analyse de la marge
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-blue-600 font-medium">Prix de vente total</p>
                                                    <p className="text-2xl font-bold text-blue-700">
                                                        {(kpiFinance.prixVenteTotal / 1000000)?.toFixed(2)} M Ar
                                                    </p>
                                                </div>
                                                <span className="text-3xl">💵</span>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-orange-600 font-medium">Coût réel total</p>
                                                    <p className="text-2xl font-bold text-orange-700">
                                                        {(kpiFinance.coutReelTotal / 1000000)?.toFixed(2)} M Ar
                                                    </p>
                                                </div>
                                                <span className="text-3xl">📋</span>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-green-600 font-medium">Marge brute</p>
                                                    <p className="text-2xl font-bold text-green-700">
                                                        {(kpiFinance.margeBrute / 1000000)?.toFixed(2)} M Ar
                                                    </p>
                                                </div>
                                                <span className="text-3xl">💚</span>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-purple-600 font-medium">Marge %</p>
                                                    <p className="text-2xl font-bold text-purple-700">
                                                        {kpiFinance.margePercent?.toFixed(1)}%
                                                    </p>
                                                </div>
                                                <span className="text-3xl">📈</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Variation Section */}
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                                        <h3 className="text-lg font-medium mb-3 text-gray-800">📊 Évolution vs période précédente</h3>
                                        <div className="flex items-center gap-4">
                                            <div className={`px-4 py-2 rounded-lg ${
                                                kpiFinance.variationMarge >= 0 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                <span className="font-bold text-xl">
                                                    {kpiFinance.variationMarge >= 0 ? '+' : ''}
                                                    {(kpiFinance.variationMarge / 1000)?.toFixed(0)} K Ar
                                                </span>
                                            </div>
                                            <div className={`px-4 py-2 rounded-lg ${
                                                kpiFinance.variationMargePercent >= 0 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                <span className="font-bold text-xl">
                                                    {kpiFinance.variationMargePercent >= 0 ? '+' : ''}
                                                    {kpiFinance.variationMargePercent?.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Remboursements Analysis */}
                                {kpiFinance.causesRemboursements && Object.keys(kpiFinance.causesRemboursements).length > 0 && (
                                    <div className="bg-white rounded-2xl shadow-lg p-6">
                                        <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                                            🔄 Analyse des remboursements
                                        </h2>
                                        <div className="grid gap-4">
                                            {Object.entries(kpiFinance.causesRemboursements).map(([cause, montant]) => (
                                                <div key={cause} className="flex justify-between items-center p-4 bg-red-50 border border-red-200 rounded-xl">
                                                    <span className="font-medium text-gray-900">{cause}</span>
                                                    <span className="font-bold text-red-600 text-lg">
                                                        {(montant / 1000)?.toLocaleString('fr-FR')} K Ar
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Direction Tab */}
                        {activeTab === 'direction' && kpiDirection && (
                            <div className="space-y-8">
                                {/* Direction KPI Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <KpiCard
                                        title="CA Global"
                                        value={`${(kpiDirection.caGlobal / 1000000)?.toFixed(2)} M`}
                                        subtitle="Ar"
                                        trend={kpiDirection.evolutionCaPercent}
                                        icon="🌍"
                                        color="blue"
                                    />
                                    <KpiCard
                                        title="Marge Brute"
                                        value={`${(kpiDirection.margeBrute / 1000000)?.toFixed(2)} M`}
                                        subtitle="Ar"
                                        icon="💎"
                                        color="green"
                                    />
                                    <KpiCard
                                        title="Marge %"
                                        value={`${kpiDirection.margePercent?.toFixed(1)}%`}
                                        icon="📊"
                                        color="purple"
                                    />
                                </div>

                                {/* Charts Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Top Clients Chart */}
                                    {kpiDirection.topClients && kpiDirection.topClients.length > 0 && (
                                        <div className="bg-white rounded-2xl shadow-lg p-6">
                                            <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                                                🏆 Top 10 Clients (CA)
                                            </h2>
                                            <div className="h-80">
                                                <TopClientsChart data={kpiDirection.topClients.slice(0, 10)} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Performance Metrics */}
                                    <div className="bg-white rounded-2xl shadow-lg p-6">
                                        <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                                            📈 Métriques de performance
                                        </h2>
                                        <div className="space-y-4">
                                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-blue-700">Clients actifs</span>
                                                    <span className="font-bold text-blue-800 text-xl">
                                                        {kpiDirection.topClients?.length || 0}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-green-700">Articles vendus</span>
                                                    <span className="font-bold text-green-800 text-xl">
                                                        {kpiDirection.topArticles?.length || 0}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-purple-700">CA moyen/client</span>
                                                    <span className="font-bold text-purple-800 text-xl">
                                                        {kpiDirection.topClients?.length > 0 
                                                            ? `${((kpiDirection.caGlobal / kpiDirection.topClients.length) / 1000000).toFixed(2)} M` 
                                                            : '0'} Ar
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Tables */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Top Clients Table */}
                                    {kpiDirection.topClients && kpiDirection.topClients.length > 0 && (
                                        <div className="bg-white rounded-2xl shadow-lg p-6">
                                            <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                                                👥 Top Clients détaillé
                                            </h2>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CA (K Ar)</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commandes</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {kpiDirection.topClients.slice(0, 10).map((client, index) => (
                                                            <tr key={client.clientId} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 text-sm font-medium">
                                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                                        index < 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                        {index + 1}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 font-medium text-gray-900">{client.clientNom}</td>
                                                                <td className="px-4 py-3 text-right font-bold text-green-600">
                                                                    {(client.totalAchats / 1000)?.toLocaleString('fr-FR')}
                                                                </td>
                                                                <td className="px-4 py-3 text-right font-medium">{client.nombreCommandes}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Top Articles Table */}
                                    {kpiDirection.topArticles && kpiDirection.topArticles.length > 0 && (
                                        <div className="bg-white rounded-2xl shadow-lg p-6">
                                            <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                                                📦 Top Articles vendus
                                            </h2>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qté</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CA (K Ar)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {kpiDirection.topArticles.slice(0, 10).map((article, index) => (
                                                            <tr key={article.articleId} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 text-sm font-medium">
                                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                                        index < 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                        {index + 1}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div>
                                                                        <div className="font-medium text-gray-900">{article.articleNom}</div>
                                                                        <div className="text-xs text-gray-500">{article.articleReference}</div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-right font-bold text-blue-600">
                                                                    {article.quantiteTotale}
                                                                </td>
                                                                <td className="px-4 py-3 text-right font-bold text-green-600">
                                                                    {(article.caTotalArticle / 1000)?.toLocaleString('fr-FR')}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardKpi;

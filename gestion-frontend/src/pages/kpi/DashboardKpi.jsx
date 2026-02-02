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

// Chart.js components
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
    RadialLinearScale,
} from 'chart.js';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';

// Heroicons
import {
    CurrencyDollarIcon,
    ShoppingCartIcon,
    ChartBarIcon,
    CalendarIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    PresentationChartLineIcon,
    DocumentTextIcon,
    BanknotesIcon,
    CreditCardIcon,
    ReceiptRefundIcon,
    ChartPieIcon
} from '@heroicons/react/24/outline';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    RadialLinearScale
);

const DashboardKpi = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('commercial');
    const [timeRange, setTimeRange] = useState('30days');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Data states
    const [kpiCommercial, setKpiCommercial] = useState(null);
    const [kpiFinance, setKpiFinance] = useState(null);
    const [kpiDirection, setKpiDirection] = useState(null);
    const [dashboard, setDashboard] = useState(null);

    // Get default dates based on time range
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
            dateDebut: startDate.toISOString().split('T')[0],
            dateFin: today.toISOString().split('T')[0]
        };
    };

    const [dateDebut, setDateDebut] = useState(getDefaultDates().dateDebut);
    const [dateFin, setDateFin] = useState(getDefaultDates().dateFin);

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

    const handleTimeRangeChange = (range) => {
        setTimeRange(range);
        const dates = getDefaultDates(range);
        setDateDebut(dates.dateDebut);
        setDateFin(dates.dateFin);
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

    // KPI Card Component
    const KpiCard = ({ title, value, subtitle, trend, icon: Icon, color = 'blue' }) => {
        const colorClasses = {
            blue: 'bg-blue-50 border-blue-200',
            green: 'bg-green-50 border-green-200',
            red: 'bg-red-50 border-red-200',
            yellow: 'bg-yellow-50 border-yellow-200',
            purple: 'bg-purple-50 border-purple-200',
            indigo: 'bg-indigo-50 border-indigo-200'
        };

        const iconClasses = {
            blue: 'text-blue-600 bg-blue-100',
            green: 'text-green-600 bg-green-100',
            red: 'text-red-600 bg-red-100',
            yellow: 'text-yellow-600 bg-yellow-100',
            purple: 'text-purple-600 bg-purple-100',
            indigo: 'text-indigo-600 bg-indigo-100'
        };

        return (
            <div className={`rounded-xl border p-6 ${colorClasses[color]}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                    </div>
                    {Icon && (
                        <div className={`p-3 rounded-lg ${iconClasses[color]}`}>
                            <Icon className="w-6 h-6" />
                        </div>
                    )}
                </div>
                {trend !== undefined && (
                    <div className="mt-4 flex items-center">
                        <span className={`inline-flex items-center text-sm font-medium px-2 py-1 rounded-full ${
                            trend >= 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {trend >= 0 ? (
                                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                            ) : (
                                <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                            )}
                            {trend >= 0 ? '+' : ''}{Math.abs(trend).toFixed(1)}%
                        </span>
                    </div>
                )}
            </div>
        );
    };

    // Chart configurations
    const getPipelineChartData = (data) => {
        return {
            labels: Object.keys(data || {}),
            datasets: [{
                data: Object.values(data || {}),
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
                borderWidth: 0
            }]
        };
    };

    const getTrendsChartData = (labels, values, label) => {
        return {
            labels: labels || [],
            datasets: [{
                label: label,
                data: values || [],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            }]
        };
    };

    const getTopClientsChartData = (clients) => {
        return {
            labels: clients?.map(client => client.clientNom?.substring(0, 12) + (client.clientNom?.length > 12 ? '...' : '') || 'Client') || [],
            datasets: [{
                label: 'Chiffre d\'affaires (M Ar)',
                data: clients?.map(client => (client.totalAchats || 0) / 1000000) || [],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: '#3B82F6',
                borderWidth: 1
            }]
        };
    };

    const getPerformanceRadarData = (kpiData) => {
        return {
            labels: ['CA Livré', 'CA Facturé', 'CA Encaissé', 'Marge', 'Commandes'],
            datasets: [{
                label: 'Performance',
                data: [
                    (kpiData?.caRealise || 0) / 1000000,
                    (kpiData?.caFacture || 0) / 1000000,
                    (kpiData?.caEncaisse || 0) / 1000000,
                    kpiData?.margePercent || 0,
                    kpiData?.commandesLivrees || 0
                ],
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: '#3B82F6',
                pointBackgroundColor: '#3B82F6',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#3B82F6'
            }]
        };
    };

    const getRemisesChartData = (kpiData) => {
        return {
            labels: ['Remises fixes', 'Remises %', 'Total'],
            datasets: [{
                data: [
                    kpiData?.totalRemisesFixe || 0,
                    kpiData?.totalRemisesPourcentage || 0,
                    kpiData?.totalRemises || 0
                ],
                backgroundColor: ['#EF4444', '#F59E0B', '#8B5CF6']
            }]
        };
    };

    const getCausesRemboursementsChartData = (causes) => {
        if (!causes) return null;
        
        const labels = Object.keys(causes);
        const values = Object.values(causes);
        
        return {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
                    '#8B5CF6', '#EC4899', '#6366F1'
                ]
            }]
        };
    };

    // Chart options
    const barChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
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

    const radarChartOptions = {
        responsive: true,
        scales: {
            r: {
                beginAtZero: true,
                ticks: {
                    stepSize: 20
                }
            }
        }
    };

    const pieChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
            }
        }
    };

    const lineChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    const formatCurrency = (value) => {
        if (!value) return '0 Ar';
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
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord KPI</h1>
                            <p className="text-gray-600">Analyse de performance commerciale, financière et directionnelle</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleExportExcel}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <DocumentTextIcon className="w-5 h-5" />
                                Export Ventes
                            </button>
                            <button
                                onClick={handleExportKpiExcel}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <ChartBarIcon className="w-5 h-5" />
                                Export KPI
                            </button>
                        </div>
                    </div>
                </div>

                {/* Date Filters */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                        <div className="flex gap-2">
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
                                Date début
                            </label>
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-gray-400" />
                                <input
                                    type="date"
                                    value={dateDebut}
                                    onChange={(e) => setDateDebut(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date fin
                            </label>
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-gray-400" />
                                <input
                                    type="date"
                                    value={dateFin}
                                    onChange={(e) => setDateFin(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={loadData}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                Actualiser
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="mb-8">
                    <nav className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('commercial')}
                            className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === 'commercial'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <ShoppingCartIcon className="w-5 h-5" />
                                Commercial
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('finance')}
                            className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === 'finance'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <CurrencyDollarIcon className="w-5 h-5" />
                                Finance
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('direction')}
                            className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === 'direction'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <PresentationChartLineIcon className="w-5 h-5" />
                                Direction
                            </div>
                        </button>
                    </nav>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
                        <ExclamationTriangleIcon className="w-5 h-5" />
                        {error}
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
                                {/* KPI Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <KpiCard
                                        title="Commandes en cours"
                                        value={kpiCommercial.commandesEnCours}
                                        subtitle="Confirmées + En préparation"
                                        icon={ShoppingCartIcon}
                                        color="blue"
                                    />
                                    <KpiCard
                                        title="Commandes livrées"
                                        value={kpiCommercial.commandesLivrees}
                                        subtitle="Sur la période"
                                        icon={CheckCircleIcon}
                                        color="green"
                                    />
                                    <KpiCard
                                        title="Commandes en retard"
                                        value={kpiCommercial.commandesEnRetard}
                                        subtitle="Date livraison dépassée"
                                        icon={ExclamationTriangleIcon}
                                        color="red"
                                    />
                                    <KpiCard
                                        title="Taux d'annulation"
                                        value={`${kpiCommercial.tauxAnnulation?.toFixed(1)}%`}
                                        subtitle={`${kpiCommercial.commandesAnnulees} / ${kpiCommercial.commandesTotal}`}
                                        icon={ArrowTrendingDownIcon}
                                        color={kpiCommercial.tauxAnnulation > 10 ? 'red' : 'yellow'}
                                    />
                                </div>

                                {/* Charts */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Pipeline Chart */}
                                    {dashboard?.pipeline && (
                                        <div className="bg-white rounded-xl shadow-lg p-6">
                                            <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                                Pipeline des commandes
                                            </h2>
                                            <div className="h-80">
                                                <Doughnut 
                                                    data={getPipelineChartData(dashboard.pipeline)} 
                                                    options={pieChartOptions} 
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Remises Chart */}
                                    <div className="bg-white rounded-xl shadow-lg p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                            Analyse des remises
                                        </h2>
                                        <div className="h-80">
                                            <Doughnut 
                                                data={getRemisesChartData(kpiCommercial)} 
                                                options={pieChartOptions} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Remises Details */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                        Détails des remises
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-blue-600 font-medium">Remises fixes</p>
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        {formatCurrency(kpiCommercial.totalRemisesFixe)}
                                                    </p>
                                                </div>
                                                <BanknotesIcon className="w-8 h-8 text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-yellow-600 font-medium">Remises %</p>
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        {formatCurrency(kpiCommercial.totalRemisesPourcentage)}
                                                    </p>
                                                </div>
                                                <ChartPieIcon className="w-8 h-8 text-yellow-600" />
                                            </div>
                                        </div>
                                        <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-purple-600 font-medium">Total remises</p>
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        {formatCurrency(kpiCommercial.totalRemises)}
                                                    </p>
                                                    {kpiCommercial.depassementPlafond && (
                                                        <p className="text-sm text-red-600 mt-2 font-medium">
                                                            Dépassement de plafond détecté
                                                        </p>
                                                    )}
                                                </div>
                                                <ChartBarIcon className="w-8 h-8 text-purple-600" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Alertes */}
                                {dashboard?.alertes && dashboard.alertes.length > 0 && (
                                    <div className="bg-white rounded-xl shadow-lg p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                            Alertes importantes
                                        </h2>
                                        <div className="space-y-4">
                                            {dashboard.alertes.map((alerte, index) => (
                                                <div
                                                    key={index}
                                                    className={`p-4 rounded-lg border-l-4 ${
                                                        alerte.priorite === 'HIGH'
                                                            ? 'border-red-500 bg-red-50'
                                                            : 'border-yellow-500 bg-yellow-50'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {alerte.priorite === 'HIGH' ? (
                                                            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
                                                        ) : (
                                                            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                                                        )}
                                                        <p className="text-gray-700">{alerte.message}</p>
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
                                {/* KPI Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <KpiCard
                                        title="CA Réalisé"
                                        value={`${(kpiFinance.caRealise / 1000000).toFixed(1)}M`}
                                        subtitle="Ventes livrées"
                                        icon={CurrencyDollarIcon}
                                        color="green"
                                    />
                                    <KpiCard
                                        title="CA Facturé"
                                        value={`${(kpiFinance.caFacture / 1000000).toFixed(1)}M`}
                                        subtitle="Ar"
                                        icon={DocumentTextIcon}
                                        color="blue"
                                    />
                                    <KpiCard
                                        title="CA Encaissé"
                                        value={`${(kpiFinance.caEncaisse / 1000000).toFixed(1)}M`}
                                        subtitle="Ar"
                                        icon={CreditCardIcon}
                                        color="purple"
                                    />
                                    <KpiCard
                                        title="Remboursements"
                                        value={`${(kpiFinance.volumeRemboursements / 1000).toFixed(0)}K`}
                                        subtitle="Ar"
                                        icon={ReceiptRefundIcon}
                                        color="red"
                                    />
                                </div>

                                {/* Marge Analysis */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                        Analyse de la marge
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                                            <p className="text-sm text-blue-600 font-medium mb-2">Prix de vente total</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {formatCurrency(kpiFinance.prixVenteTotal)}
                                            </p>
                                        </div>
                                        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                                            <p className="text-sm text-yellow-600 font-medium mb-2">Coût réel total</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {formatCurrency(kpiFinance.coutReelTotal)}
                                            </p>
                                        </div>
                                        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                                            <p className="text-sm text-green-600 font-medium mb-2">Marge brute</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {formatCurrency(kpiFinance.margeBrute)}
                                            </p>
                                        </div>
                                        <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                                            <p className="text-sm text-purple-600 font-medium mb-2">Marge %</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {kpiFinance.margePercent?.toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>

                                    {/* Performance Radar */}
                                    <div className="mt-8">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyse de performance</h3>
                                        <div className="h-96">
                                            <Radar 
                                                data={getPerformanceRadarData(kpiFinance)} 
                                                options={radarChartOptions} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Remboursements Analysis */}
                                {kpiFinance.causesRemboursements && Object.keys(kpiFinance.causesRemboursements).length > 0 && (
                                    <div className="bg-white rounded-xl shadow-lg p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                            Causes des remboursements
                                        </h2>
                                        <div className="h-80">
                                            <Doughnut 
                                                data={getCausesRemboursementsChartData(kpiFinance.causesRemboursements)} 
                                                options={pieChartOptions} 
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Direction Tab */}
                        {activeTab === 'direction' && kpiDirection && (
                            <div className="space-y-8">
                                {/* KPI Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <KpiCard
                                        title="CA Global"
                                        value={`${(kpiDirection.caGlobal / 1000000).toFixed(1)}M`}
                                        subtitle="Ar"
                                        trend={kpiDirection.evolutionCaPercent}
                                        icon={CurrencyDollarIcon}
                                        color="blue"
                                    />
                                    <KpiCard
                                        title="Marge Brute"
                                        value={`${(kpiDirection.margeBrute / 1000000).toFixed(1)}M`}
                                        subtitle="Ar"
                                        icon={ChartBarIcon}
                                        color="green"
                                    />
                                    <KpiCard
                                        title="Marge %"
                                        value={`${kpiDirection.margePercent?.toFixed(1)}%`}
                                        icon={ChartPieIcon}
                                        color="purple"
                                    />
                                </div>

                                {/* Charts */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Top Clients Chart */}
                                    {kpiDirection.topClients && kpiDirection.topClients.length > 0 && (
                                        <div className="bg-white rounded-xl shadow-lg p-6">
                                            <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                                Top 10 Clients (CA)
                                            </h2>
                                            <div className="h-80">
                                                <Bar 
                                                    data={getTopClientsChartData(kpiDirection.topClients.slice(0, 10))} 
                                                    options={barChartOptions} 
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Performance Metrics */}
                                    <div className="bg-white rounded-xl shadow-lg p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                            Métriques de performance
                                        </h2>
                                        <div className="space-y-6">
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-700">Clients actifs</span>
                                                    <span className="font-bold text-gray-900 text-xl">
                                                        {kpiDirection.topClients?.length || 0}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-700">Articles vendus</span>
                                                    <span className="font-bold text-gray-900 text-xl">
                                                        {kpiDirection.topArticles?.length || 0}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-700">CA moyen par client</span>
                                                    <span className="font-bold text-gray-900 text-xl">
                                                        {kpiDirection.topClients?.length > 0 
                                                            ? `${(kpiDirection.caGlobal / kpiDirection.topClients.length / 1000000).toFixed(2)}M` 
                                                            : '0'} Ar
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tables */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Top Clients Table */}
                                    {kpiDirection.topClients && kpiDirection.topClients.length > 0 && (
                                        <div className="bg-white rounded-xl shadow-lg p-6">
                                            <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                                Top Clients détaillé
                                            </h2>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CA (K Ar)</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commandes</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {kpiDirection.topClients.slice(0, 10).map((client, index) => (
                                                            <tr key={client.clientId} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 font-medium text-gray-900">{client.clientNom}</td>
                                                                <td className="px-4 py-3 text-right font-bold text-green-600">
                                                                    {(client.totalAchats / 1000)?.toLocaleString('fr-FR')}
                                                                </td>
                                                                <td className="px-4 py-3 text-right font-medium text-gray-700">
                                                                    {client.nombreCommandes}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Top Articles Table */}
                                    {kpiDirection.topArticles && kpiDirection.topArticles.length > 0 && (
                                        <div className="bg-white rounded-xl shadow-lg p-6">
                                            <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                                Top Articles vendus
                                            </h2>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qté</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CA (K Ar)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {kpiDirection.topArticles.slice(0, 10).map((article) => (
                                                            <tr key={article.articleId} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3">
                                                                    <div>
                                                                        <div className="font-medium text-gray-900">{article.articleNom}</div>
                                                                        <div className="text-sm text-gray-500">{article.articleReference}</div>
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
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

    const KpiCard = ({ title, value, subtitle, trend, color = 'blue' }) => {
        const colors = {
            blue: 'bg-blue-50 border-blue-200 text-blue-700',
            green: 'bg-green-50 border-green-200 text-green-700',
            red: 'bg-red-50 border-red-200 text-red-700',
            yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
            purple: 'bg-purple-50 border-purple-200 text-purple-700',
        };

        return (
            <div className={`rounded-lg border p-4 ${colors[color]}`}>
                <h3 className="text-sm font-medium opacity-75">{title}</h3>
                <p className="text-2xl font-bold mt-1">{value}</p>
                {subtitle && <p className="text-xs mt-1 opacity-75">{subtitle}</p>}
                {trend !== undefined && (
                    <p className={`text-xs mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% vs période précédente
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord & KPI</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportExcel}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Export Ventes Excel
                    </button>
                    <button
                        onClick={handleExportKpiExcel}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Export KPI Excel
                    </button>
                </div>
            </div>

            {/* Filtres de période */}
            <div className="mb-6 bg-white rounded-lg shadow p-4 flex gap-4 items-center flex-wrap">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date début
                    </label>
                    <input
                        type="date"
                        value={dateDebut}
                        onChange={(e) => setDateDebut(e.target.value)}
                        className="px-3 py-2 border rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date fin
                    </label>
                    <input
                        type="date"
                        value={dateFin}
                        onChange={(e) => setDateFin(e.target.value)}
                        className="px-3 py-2 border rounded"
                    />
                </div>
                <button
                    onClick={loadData}
                    className="mt-5 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                    Actualiser
                </button>
            </div>

            {/* Onglets */}
            <div className="mb-6 border-b">
                <nav className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('commercial')}
                        className={`py-2 px-4 border-b-2 font-medium ${activeTab === 'commercial'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Commercial
                    </button>
                    <button
                        onClick={() => setActiveTab('finance')}
                        className={`py-2 px-4 border-b-2 font-medium ${activeTab === 'finance'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Finance
                    </button>
                    <button
                        onClick={() => setActiveTab('direction')}
                        className={`py-2 px-4 border-b-2 font-medium ${activeTab === 'direction'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Direction
                    </button>
                </nav>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                </div>
            )}

            {loading ? (
                <LoadingSpinner />
            ) : (
                <>
                    {/* KPI Commercial */}
                    {activeTab === 'commercial' && kpiCommercial && (
                        <div className="space-y-6">
                            {/* Cartes KPI */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <KpiCard
                                    title="Commandes en cours"
                                    value={kpiCommercial.commandesEnCours}
                                    subtitle="Confirmées + En préparation"
                                    color="blue"
                                />
                                <KpiCard
                                    title="Commandes livrées"
                                    value={kpiCommercial.commandesLivrees}
                                    subtitle="Sur la période"
                                    color="green"
                                />
                                <KpiCard
                                    title="Commandes en retard"
                                    value={kpiCommercial.commandesEnRetard}
                                    subtitle="Date livraison dépassée"
                                    color="red"
                                />
                                <KpiCard
                                    title="Taux d'annulation"
                                    value={`${kpiCommercial.tauxAnnulation?.toFixed(1)}%`}
                                    subtitle={`${kpiCommercial.commandesAnnulees} / ${kpiCommercial.commandesTotal}`}
                                    color={kpiCommercial.tauxAnnulation > 10 ? 'red' : 'yellow'}
                                />
                            </div>

                            {/* Remises */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold mb-4">Remises accordées</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-gray-50 rounded">
                                        <p className="text-sm text-gray-600">Remises fixes</p>
                                        <p className="text-xl font-bold">
                                            {kpiCommercial.totalRemisesFixe?.toLocaleString('fr-FR')} Ar
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded">
                                        <p className="text-sm text-gray-600">Remises %</p>
                                        <p className="text-xl font-bold">
                                            {kpiCommercial.totalRemisesPourcentage?.toLocaleString('fr-FR')} Ar
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded">
                                        <p className="text-sm text-gray-600">Total remises</p>
                                        <p className="text-xl font-bold">
                                            {kpiCommercial.totalRemises?.toLocaleString('fr-FR')} Ar
                                        </p>
                                        {kpiCommercial.depassementPlafond && (
                                            <p className="text-xs text-red-600 mt-1">
                                                ⚠️ Dépassement du plafond ({kpiCommercial.plafondRemise}%)
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Motifs d'annulation */}
                            {kpiCommercial.motifsAnnulation && Object.keys(kpiCommercial.motifsAnnulation).length > 0 && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h2 className="text-lg font-semibold mb-4">Motifs d'annulation</h2>
                                    <div className="space-y-2">
                                        {Object.entries(kpiCommercial.motifsAnnulation).map(([motif, count]) => (
                                            <div key={motif} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <span>{motif}</span>
                                                <span className="font-medium">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pipeline */}
                            {dashboard?.pipeline && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h2 className="text-lg font-semibold mb-4">Pipeline des commandes</h2>
                                    <div className="flex gap-2 flex-wrap">
                                        {Object.entries(dashboard.pipeline).map(([status, count]) => (
                                            <div key={status} className="flex-1 min-w-[120px] p-3 bg-gray-50 rounded text-center">
                                                <p className="text-2xl font-bold">{count}</p>
                                                <p className="text-xs text-gray-600">{status}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Alertes */}
                            {dashboard?.alertes && dashboard.alertes.length > 0 && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h2 className="text-lg font-semibold mb-4 text-red-600">
                                        ⚠️ Alertes ({dashboard.alertes.length})
                                    </h2>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {dashboard.alertes.map((alerte, index) => (
                                            <div
                                                key={index}
                                                className={`p-3 rounded border-l-4 ${alerte.priorite === 'HIGH'
                                                        ? 'bg-red-50 border-red-500'
                                                        : 'bg-yellow-50 border-yellow-500'
                                                    }`}
                                            >
                                                <p className="text-sm">{alerte.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* KPI Finance */}
                    {activeTab === 'finance' && kpiFinance && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <KpiCard
                                    title="CA Réalisé"
                                    value={`${(kpiFinance.caRealise / 1000000)?.toFixed(2)} M Ar`}
                                    subtitle="Ventes livrées"
                                    color="green"
                                />
                                <KpiCard
                                    title="CA Facturé"
                                    value={`${(kpiFinance.caFacture / 1000000)?.toFixed(2)} M Ar`}
                                    color="blue"
                                />
                                <KpiCard
                                    title="CA Encaissé"
                                    value={`${(kpiFinance.caEncaisse / 1000000)?.toFixed(2)} M Ar`}
                                    color="purple"
                                />
                                <KpiCard
                                    title="Remboursements"
                                    value={`${(kpiFinance.volumeRemboursements / 1000)?.toFixed(0)} K Ar`}
                                    color="red"
                                />
                            </div>

                            {/* Marge */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold mb-4">Analyse de la marge</h2>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-blue-50 rounded">
                                        <p className="text-sm text-gray-600">Prix de vente total</p>
                                        <p className="text-xl font-bold">
                                            {(kpiFinance.prixVenteTotal / 1000000)?.toFixed(2)} M Ar
                                        </p>
                                    </div>
                                    <div className="p-4 bg-orange-50 rounded">
                                        <p className="text-sm text-gray-600">Coût réel total</p>
                                        <p className="text-xl font-bold">
                                            {(kpiFinance.coutReelTotal / 1000000)?.toFixed(2)} M Ar
                                        </p>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded">
                                        <p className="text-sm text-gray-600">Marge brute</p>
                                        <p className="text-xl font-bold text-green-700">
                                            {(kpiFinance.margeBrute / 1000000)?.toFixed(2)} M Ar
                                        </p>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded">
                                        <p className="text-sm text-gray-600">Marge %</p>
                                        <p className="text-xl font-bold text-purple-700">
                                            {kpiFinance.margePercent?.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>

                                {/* Variation */}
                                <div className="mt-4 p-4 bg-gray-50 rounded">
                                    <p className="text-sm text-gray-600">Variation marge vs période précédente</p>
                                    <p className={`text-xl font-bold ${kpiFinance.variationMarge >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {kpiFinance.variationMarge >= 0 ? '+' : ''}
                                        {(kpiFinance.variationMarge / 1000)?.toFixed(0)} K Ar
                                        ({kpiFinance.variationMargePercent >= 0 ? '+' : ''}
                                        {kpiFinance.variationMargePercent?.toFixed(1)}%)
                                    </p>
                                </div>
                            </div>

                            {/* Causes remboursements */}
                            {kpiFinance.causesRemboursements && Object.keys(kpiFinance.causesRemboursements).length > 0 && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h2 className="text-lg font-semibold mb-4">Causes des remboursements</h2>
                                    <div className="space-y-2">
                                        {Object.entries(kpiFinance.causesRemboursements).map(([cause, montant]) => (
                                            <div key={cause} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <span>{cause}</span>
                                                <span className="font-medium text-red-600">
                                                    {montant?.toLocaleString('fr-FR')} Ar
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* KPI Direction */}
                    {activeTab === 'direction' && kpiDirection && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <KpiCard
                                    title="CA Global"
                                    value={`${(kpiDirection.caGlobal / 1000000)?.toFixed(2)} M Ar`}
                                    trend={kpiDirection.evolutionCaPercent}
                                    color="blue"
                                />
                                <KpiCard
                                    title="Marge Brute"
                                    value={`${(kpiDirection.margeBrute / 1000000)?.toFixed(2)} M Ar`}
                                    color="green"
                                />
                                <KpiCard
                                    title="Marge %"
                                    value={`${kpiDirection.margePercent?.toFixed(1)}%`}
                                    color="purple"
                                />
                            </div>

                            {/* Top 10 Clients */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold mb-4">Top 10 Clients</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">#</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Client</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total Achats</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Nb Commandes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {kpiDirection.topClients?.map((client, index) => (
                                                <tr key={client.clientId}>
                                                    <td className="px-4 py-2 text-sm">{index + 1}</td>
                                                    <td className="px-4 py-2 font-medium">{client.clientNom}</td>
                                                    <td className="px-4 py-2 text-right">
                                                        {client.totalAchats?.toLocaleString('fr-FR')} Ar
                                                    </td>
                                                    <td className="px-4 py-2 text-right">{client.nombreCommandes}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Top 10 Articles */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold mb-4">Top 10 Articles Vendus</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">#</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Article</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Référence</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Quantité</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">CA</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {kpiDirection.topArticles?.map((article, index) => (
                                                <tr key={article.articleId}>
                                                    <td className="px-4 py-2 text-sm">{index + 1}</td>
                                                    <td className="px-4 py-2 font-medium">{article.articleNom}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-500">{article.articleReference}</td>
                                                    <td className="px-4 py-2 text-right">{article.quantiteTotale}</td>
                                                    <td className="px-4 py-2 text-right">
                                                        {article.caTotalArticle?.toLocaleString('fr-FR')} Ar
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DashboardKpi;

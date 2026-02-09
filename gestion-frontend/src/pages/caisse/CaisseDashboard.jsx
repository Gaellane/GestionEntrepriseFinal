import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStatsCaisse, getSoldeCaisse } from '../../api/caisseMouvementApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CaisseDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [solde, setSolde] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateDebut, setDateDebut] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().split('T')[0];
    });
    const [dateFin, setDateFin] = useState(() => new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchData();
    }, [dateDebut, dateFin]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [statsData, soldeData] = await Promise.all([
                getStatsCaisse(dateDebut, dateFin),
                getSoldeCaisse()
            ]);
            setStats(statsData);
            setSolde(soldeData?.solde ?? 0);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des statistiques');
        } finally {
            setLoading(false);
        }
    };

    const formatMontant = (montant) => {
        if (montant == null) return '0 Ar';
        return new Intl.NumberFormat('fr-FR').format(montant) + ' Ar';
    };

    if (loading) return <LoadingSpinner />;

    const encaissements = stats?.encaissements ?? 0;
    const remboursements = stats?.remboursements ?? 0;
    const parType = stats?.parType ?? [];

    // Calcul du pourcentage encaissements vs remboursements
    const total = encaissements + remboursements;
    const pctEncaissements = total > 0 ? Math.round((encaissements / total) * 100) : 100;
    const pctRemboursements = total > 0 ? Math.round((remboursements / total) * 100) : 0;

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                {/* En-tête */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard Caisse</h1>
                        <p className="text-gray-600 mt-1">Vue d'ensemble de la trésorerie</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/caisse/mouvements')}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            Historique
                        </button>
                        <button
                            onClick={() => navigate('/caisse/mouvements/creer')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nouveau mouvement
                        </button>
                    </div>
                </div>

                {/* Erreur */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Solde en temps réel */}
                <div className="mb-6">
                    <div className={`rounded-xl p-6 shadow-lg ${solde >= 0 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Solde actuel en caisse</p>
                                <p className="text-4xl font-bold text-white mt-2">{formatMontant(solde)}</p>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-full p-4">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sélecteur de période */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-sm font-medium text-gray-700">Période :</span>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={dateDebut}
                                onChange={(e) => setDateDebut(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-500">→</span>
                            <input
                                type="date"
                                value={dateFin}
                                onChange={(e) => setDateFin(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        {/* Raccourcis de période */}
                        <div className="flex gap-2 ml-auto">
                            <button
                                onClick={() => {
                                    const now = new Date();
                                    setDateDebut(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
                                    setDateFin(now.toISOString().split('T')[0]);
                                }}
                                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                            >
                                Ce mois
                            </button>
                            <button
                                onClick={() => {
                                    const now = new Date();
                                    const startOfWeek = new Date(now);
                                    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
                                    setDateDebut(startOfWeek.toISOString().split('T')[0]);
                                    setDateFin(now.toISOString().split('T')[0]);
                                }}
                                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                            >
                                Cette semaine
                            </button>
                            <button
                                onClick={() => {
                                    const now = new Date();
                                    setDateDebut(now.toISOString().split('T')[0]);
                                    setDateFin(now.toISOString().split('T')[0]);
                                }}
                                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                            >
                                Aujourd'hui
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cartes KPI */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Encaissements */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Encaissements</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">{formatMontant(encaissements)}</p>
                            </div>
                            <div className="bg-green-100 rounded-full p-3">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${pctEncaissements}%` }}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{pctEncaissements}% du flux total</p>
                        </div>
                    </div>

                    {/* Remboursements */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Remboursements / Sorties</p>
                                <p className="text-2xl font-bold text-red-600 mt-1">{formatMontant(remboursements)}</p>
                            </div>
                            <div className="bg-red-100 rounded-full p-3">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${pctRemboursements}%` }}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{pctRemboursements}% du flux total</p>
                        </div>
                    </div>

                    {/* Net */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Net (période)</p>
                                <p className={`text-2xl font-bold mt-1 ${(encaissements - remboursements) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                    {formatMontant(encaissements - remboursements)}
                                </p>
                            </div>
                            <div className="bg-blue-100 rounded-full p-3">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Répartition par type de mouvement */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition par type de mouvement</h2>
                    {parType.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p>Aucune donnée pour cette période</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {parType.map((item, index) => {
                                const typeName = item.type || 'Inconnu';
                                const montant = item.total || 0;
                                const maxMontant = Math.max(...parType.map(p => Math.abs(p.total || 0)), 1);
                                const pct = Math.round((Math.abs(montant) / maxMontant) * 100);
                                const isPositif = montant >= 0;

                                return (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="w-40 text-sm font-medium text-gray-700 truncate" title={typeName}>
                                            {typeName}
                                        </div>
                                        <div className="flex-1">
                                            <div className="w-full bg-gray-100 rounded-full h-6 relative">
                                                <div
                                                    className={`h-6 rounded-full flex items-center justify-end pr-2 text-xs font-medium text-white ${isPositif ? 'bg-green-500' : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${Math.max(pct, 5)}%` }}
                                                >
                                                    {formatMontant(Math.abs(montant))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CaisseDashboard;

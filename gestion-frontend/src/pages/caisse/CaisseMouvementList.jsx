  import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllMouvements } from '../../api/caisseMouvementApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CaisseMouvementList = () => {
    const navigate = useNavigate();
    const [mouvements, setMouvements] = useState([]);
    const [filteredMouvements, setFilteredMouvements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filtres
    const [searchText, setSearchText] = useState('');
    const [filterType, setFilterType] = useState('tous');
    const [dateDebut, setDateDebut] = useState('');
    const [dateFin, setDateFin] = useState('');

    useEffect(() => {
        fetchMouvements();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [mouvements, searchText, filterType, dateDebut, dateFin]);

    const fetchMouvements = async () => {
        try {
            setLoading(true);
            const data = await getAllMouvements();
            // Trier par date décroissante
            const sorted = (data || []).sort((a, b) => new Date(b.dateEntree) - new Date(a.dateEntree));
            setMouvements(sorted);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des mouvements');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...mouvements];

        // Filtre par texte (détails)
        if (searchText) {
            const search = searchText.toLowerCase();
            filtered = filtered.filter(m =>
                (m.details && m.details.toLowerCase().includes(search)) ||
                (m.typeMouvement?.typeName && m.typeMouvement.typeName.toLowerCase().includes(search))
            );
        }

        // Filtre par type (entrée/sortie)
        if (filterType === 'entree') {
            filtered = filtered.filter(m => m.typeMouvement?.valeur > 0);
        } else if (filterType === 'sortie') {
            filtered = filtered.filter(m => m.typeMouvement?.valeur < 0);
        }

        // Filtre par date
        if (dateDebut) {
            filtered = filtered.filter(m => new Date(m.dateEntree) >= new Date(dateDebut));
        }
        if (dateFin) {
            filtered = filtered.filter(m => new Date(m.dateEntree) <= new Date(dateFin + 'T23:59:59'));
        }

        setFilteredMouvements(filtered);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatMontant = (montant) => {
        if (montant == null) return '-';
        return new Intl.NumberFormat('fr-FR').format(montant) + ' Ar';
    };

    const totalEntrees = filteredMouvements
        .filter(m => m.typeMouvement?.valeur > 0)
        .reduce((sum, m) => sum + (m.montant || 0), 0);

    const totalSorties = filteredMouvements
        .filter(m => m.typeMouvement?.valeur < 0)
        .reduce((sum, m) => sum + (m.montant || 0), 0);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                {/* En-tête */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Historique des Mouvements</h1>
                        <p className="text-gray-600 mt-1">{filteredMouvements.length} mouvement(s) trouvé(s)</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/caisse/mouvements/creer')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nouveau mouvement
                        </button>
                        <button
                            onClick={() => navigate('/caisse/dashboard')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Dashboard
                        </button>
                    </div>
                </div>

                {/* Erreur */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Résumé rapide */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-600 font-medium">Total Entrées</p>
                        <p className="text-2xl font-bold text-green-700">{formatMontant(totalEntrees)}</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-600 font-medium">Total Sorties</p>
                        <p className="text-2xl font-bold text-red-700">{formatMontant(Math.abs(totalSorties))}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Solde (filtré)</p>
                        <p className="text-2xl font-bold text-blue-700">{formatMontant(totalEntrees + totalSorties)}</p>
                    </div>
                </div>

                {/* Filtres */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
                            <input
                                type="text"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                placeholder="Rechercher dans les détails..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="tous">Tous</option>
                                <option value="entree">Entrées uniquement</option>
                                <option value="sortie">Sorties uniquement</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                            <input
                                type="date"
                                value={dateDebut}
                                onChange={(e) => setDateDebut(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                            <input
                                type="date"
                                value={dateFin}
                                onChange={(e) => setDateFin(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    {(searchText || filterType !== 'tous' || dateDebut || dateFin) && (
                        <div className="mt-3 flex justify-end">
                            <button
                                onClick={() => { setSearchText(''); setFilterType('tous'); setDateDebut(''); setDateFin(''); }}
                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                                Réinitialiser les filtres
                            </button>
                        </div>
                    )}
                </div>

                {/* Tableau */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entité</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Détails</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredMouvements.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                            Aucun mouvement trouvé
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMouvements.map((m) => {
                                        const isEntree = m.typeMouvement?.valeur > 0;
                                        return (
                                            <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">#{m.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(m.dateEntree)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isEntree ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {isEntree ? '↑ ' : '↓ '}{m.typeMouvement?.typeName || '-'}
                                                    </span>
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${isEntree ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {isEntree ? '+' : '-'}{formatMontant(m.montant)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {m.entity?.entityName || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={m.details}>
                                                    {m.details || '-'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaisseMouvementList;

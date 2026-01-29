import React, { useState, useEffect } from 'react';
import {
    getVentesExportPreview,
    exportVentesExcel,
    exportVentesCsv,
    exportVentesPdf,
    downloadFile
} from '../../api/kpiApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ExportVentes = () => {
    const [dateDebut, setDateDebut] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        return d.toISOString().split('T')[0];
    });
    const [dateFin, setDateFin] = useState(() => new Date().toISOString().split('T')[0]);
    const [commercialId, setCommercialId] = useState('');
    const [clientId, setClientId] = useState('');

    const [ventes, setVentes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState(null);

    const loadPreview = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = { dateDebut, dateFin };
            if (commercialId) params.commercialId = commercialId;
            if (clientId) params.clientId = clientId;

            const response = await getVentesExportPreview(params);
            setVentes(response || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPreview();
    }, []);

    const handleExport = async (format) => {
        setExporting(true);
        try {
            const params = { dateDebut, dateFin };
            if (commercialId) params.commercialId = commercialId;
            if (clientId) params.clientId = clientId;

            let response;
            let filename;

            switch (format) {
                case 'excel':
                    response = await exportVentesExcel(params);
                    filename = `ventes_${dateDebut}_${dateFin}.xlsx`;
                    break;
                case 'csv':
                    response = await exportVentesCsv(params);
                    filename = `ventes_${dateDebut}_${dateFin}.csv`;
                    break;
                case 'pdf':
                    response = await exportVentesPdf(params);
                    filename = `ventes_${dateDebut}_${dateFin}.pdf`;
                    break;
                default:
                    return;
            }

            downloadFile(response, filename);
        } catch (err) {
            alert('Erreur lors de l\'export');
        } finally {
            setExporting(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Brouillon': 'bg-gray-100 text-gray-800',
            'Confirmée': 'bg-blue-100 text-blue-800',
            'En préparation': 'bg-yellow-100 text-yellow-800',
            'Prête': 'bg-purple-100 text-purple-800',
            'Livrée': 'bg-green-100 text-green-800',
            'Annulée': 'bg-red-100 text-red-800',
        };
        const colorClass = statusConfig[status] || 'bg-gray-100 text-gray-800';
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Export des Ventes</h1>
                <p className="text-gray-600 mt-1">Filtrer et exporter les données de ventes</p>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Filtres</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date début
                        </label>
                        <input
                            type="date"
                            value={dateDebut}
                            onChange={(e) => setDateDebut(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
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
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Commercial (ID)
                        </label>
                        <input
                            type="number"
                            value={commercialId}
                            onChange={(e) => setCommercialId(e.target.value)}
                            placeholder="Tous"
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Client (ID)
                        </label>
                        <input
                            type="number"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            placeholder="Tous"
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                </div>
                <div className="mt-4 flex gap-3">
                    <button
                        onClick={loadPreview}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                        {loading ? 'Chargement...' : 'Aperçu'}
                    </button>
                </div>
            </div>

            {/* Boutons d'export */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Exporter ({ventes.length} ventes)</h2>
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={() => handleExport('excel')}
                        disabled={exporting || ventes.length === 0}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Excel (.xlsx)
                    </button>
                    <button
                        onClick={() => handleExport('csv')}
                        disabled={exporting || ventes.length === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        CSV
                    </button>
                    <button
                        onClick={() => handleExport('pdf')}
                        disabled={exporting || ventes.length === 0}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        PDF
                    </button>
                </div>
                {exporting && <p className="mt-2 text-sm text-gray-600">Export en cours...</p>}
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Aperçu des données */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold">Aperçu des données</h2>
                </div>

                {loading ? (
                    <div className="p-8">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Référence
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Client
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Livraison
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Prix Total
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Remise
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Statut
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {ventes.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                            Aucune vente trouvée pour ces critères
                                        </td>
                                    </tr>
                                ) : (
                                    ventes.slice(0, 50).map((vente) => (
                                        <tr key={vente.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap font-medium">
                                                {vente.reference}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {vente.clientNom}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {vente.dateEntree && new Date(vente.dateEntree).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {vente.dateLivraison && new Date(vente.dateLivraison).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right">
                                                {vente.prixTotal?.toLocaleString('fr-FR')} Ar
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                                                {vente.remiseTotale?.toLocaleString('fr-FR')} Ar
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {getStatusBadge(vente.statut)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        {ventes.length > 50 && (
                            <div className="p-4 text-center text-sm text-gray-500 bg-gray-50">
                                Affichage des 50 premières lignes sur {ventes.length}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Résumé */}
            {ventes.length > 0 && (
                <div className="mt-6 bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Résumé</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 rounded">
                            <p className="text-sm text-gray-600">Nombre de ventes</p>
                            <p className="text-2xl font-bold">{ventes.length}</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded">
                            <p className="text-sm text-gray-600">Total prix</p>
                            <p className="text-2xl font-bold">
                                {ventes.reduce((sum, v) => sum + (v.prixTotal || 0), 0).toLocaleString('fr-FR')} Ar
                            </p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded">
                            <p className="text-sm text-gray-600">Total remises</p>
                            <p className="text-2xl font-bold">
                                {ventes.reduce((sum, v) => sum + (v.remiseTotale || 0), 0).toLocaleString('fr-FR')} Ar
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExportVentes;

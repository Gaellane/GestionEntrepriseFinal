import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clientApi from '../../api/clientApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ClientDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchClient();
    }, [id]);

    const fetchClient = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await clientApi.getClientById(id);
            setClient(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement du client');
            console.error('Error fetching client:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
                <button
                    onClick={() => navigate('/clients')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                    Retour à la liste
                </button>
            </div>
        );
    }

    if (!client) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Détails du Client</h1>
                    <p className="text-gray-600">Informations complètes du client</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/clients')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        Retour
                    </button>
                    <button
                        onClick={() => navigate(`/clients/edit/${id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Modifier
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                    <h2 className="text-2xl font-bold text-white">{client.clientNom}</h2>
                    <p className="text-blue-100">Client #{client.id}</p>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ID */}
                        <div className="border-b border-gray-200 pb-4">
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                ID Client
                            </label>
                            <p className="text-lg text-gray-900">{client.id}</p>
                        </div>

                        {/* Nom */}
                        <div className="border-b border-gray-200 pb-4">
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                Nom du Client
                            </label>
                            <p className="text-lg text-gray-900">{client.clientNom}</p>
                        </div>

                        {/* Contact */}
                        <div className="border-b border-gray-200 pb-4">
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                Contact
                            </label>
                            <p className="text-lg text-gray-900">{client.contact || '-'}</p>
                        </div>

                        {/* Adresse */}
                        <div className="border-b border-gray-200 pb-4 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                Adresse
                            </label>
                            <p className="text-lg text-gray-900 whitespace-pre-line">
                                {client.adresse || '-'}
                            </p>
                        </div>

                        {/* Coordonnées bancaires */}
                        <div className="pb-4 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                Coordonnées Bancaires
                            </label>
                            <p className="text-lg text-gray-900 whitespace-pre-line">
                                {client.coordonneeBancaire || '-'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section future: historique des ventes */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Historique des transactions
                    </h3>
                    <p className="text-gray-600 italic">
                        Fonctionnalité à venir : affichage de l'historique des ventes
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ClientDetail;

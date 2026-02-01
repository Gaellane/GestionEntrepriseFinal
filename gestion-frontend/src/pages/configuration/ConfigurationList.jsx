import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import configurationApi from '../../api/configurationApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ConfigurationList = () => {
    const navigate = useNavigate();
    const [configurations, setConfigurations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [editingConfig, setEditingConfig] = useState(null);
    const [editFormData, setEditFormData] = useState({
        configKey: '',
        configValue: '',
        description: ''
    });

    useEffect(() => {
        fetchConfigurations();
    }, []);

    const fetchConfigurations = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await configurationApi.getAllConfigurations();
            setConfigurations(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des configurations');
            console.error('Error fetching configurations:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (config) => {
        setEditingConfig(config.id);
        setEditFormData({
            configKey: config.configKey,
            configValue: config.configValue,
            description: config.description || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingConfig(null);
        setEditFormData({
            configKey: '',
            configValue: '',
            description: ''
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveEdit = async (configId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await configurationApi.updateConfiguration(configId, editFormData);
            setSuccess(response.message || 'Configuration modifiée avec succès');
            setEditingConfig(null);
            fetchConfigurations();

            // Auto-clear success message
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la modification');
            console.error('Error updating configuration:', err);
        } finally {
            setLoading(false);
        }
    };

    const getConfigTypeLabel = (configKey) => {
        if (configKey.startsWith('REMISE_MAX_')) {
            return { type: 'Remise', color: 'bg-purple-100 text-purple-800' };
        } else if (configKey === 'TVA') {
            return { type: 'TVA', color: 'bg-green-100 text-green-800' };
        } else {
            return { type: 'Général', color: 'bg-gray-100 text-gray-800' };
        }
    };

    const isRemiseConfig = (configKey) => {
        return configKey === 'REMISE_MAX_COMMERCIAL' || configKey === 'REMISE_MAX_RESPONSABLE';
    };

    const getRemiseWarning = (configValue) => {
        const value = parseFloat(configValue);
        if (isNaN(value)) return null;
        if (value > 50) {
            return { level: 'error', message: 'Attention: Plafond très élevé (>50%)' };
        } else if (value > 30) {
            return { level: 'warning', message: 'Plafond élevé (>30%)' };
        }
        return null;
    };

    if (loading && configurations.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestion des Configurations</h1>
                <p className="text-gray-600">Configuration des plafonds de remises et paramètres système</p>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                </div>
            )}

            {/* Section Remises */}
            <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 rounded-t-lg">
                    <h2 className="text-xl font-bold text-white">Plafonds de Remises</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {configurations.filter(c => isRemiseConfig(c.configKey)).map((config) => {
                            const warning = getRemiseWarning(config.configValue);
                            const isEditing = editingConfig === config.id;

                            return (
                                <div key={config.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800">
                                                {config.configKey === 'REMISE_MAX_COMMERCIAL'
                                                    ? 'Remise Maximum - Commercial'
                                                    : 'Remise Maximum - Responsable'}
                                            </h3>
                                            <p className="text-sm text-gray-500">{config.description}</p>
                                        </div>
                                        {!isEditing && (
                                            <button
                                                onClick={() => handleEditClick(config)}
                                                className="ml-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                            >
                                                Modifier
                                            </button>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Valeur (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="configValue"
                                                    value={editFormData.configValue}
                                                    onChange={handleEditChange}
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Description
                                                </label>
                                                <input
                                                    type="text"
                                                    name="description"
                                                    value={editFormData.description}
                                                    onChange={handleEditChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleSaveEdit(config.id)}
                                                    disabled={loading}
                                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    Enregistrer
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="text-4xl font-bold text-purple-600 mb-2">
                                                {config.configValue}%
                                            </div>
                                            {warning && (
                                                <div className={`px-3 py-2 rounded-lg text-sm ${warning.level === 'error'
                                                        ? 'bg-red-100 text-red-800 border border-red-300'
                                                        : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                                    }`}>
                                                    ⚠️ {warning.message}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Autres configurations */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4 rounded-t-lg">
                    <h2 className="text-xl font-bold text-white">Autres Configurations</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Clé
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Valeur
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {configurations.filter(c => !isRemiseConfig(c.configKey)).map((config) => {
                                const typeInfo = getConfigTypeLabel(config.configKey);
                                const isEditing = editingConfig === config.id;

                                return (
                                    <tr key={config.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded ${typeInfo.color}`}>
                                                {typeInfo.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {config.configKey}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="configValue"
                                                    value={editFormData.configValue}
                                                    onChange={handleEditChange}
                                                    className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <span className="font-semibold">{config.configValue}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="description"
                                                    value={editFormData.description}
                                                    onChange={handleEditChange}
                                                    className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            ) : (
                                                config.description
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {isEditing ? (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleSaveEdit(config.id)}
                                                        disabled={loading}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        ✓ Valider
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        ✗ Annuler
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleEditClick(config)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Modifier
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ConfigurationList;

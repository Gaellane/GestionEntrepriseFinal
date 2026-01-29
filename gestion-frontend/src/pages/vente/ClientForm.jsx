import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clientApi from '../../api/clientApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ClientForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [formData, setFormData] = useState({
        clientNom: '',
        contact: '',
        adresse: '',
        coordonneeBancaire: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEditMode) {
            fetchClient();
        }
    }, [id]);

    const fetchClient = async () => {
        try {
            setLoading(true);
            const client = await clientApi.getClientById(id);
            setFormData({
                clientNom: client.clientNom || '',
                contact: client.contact || '',
                adresse: client.adresse || '',
                coordonneeBancaire: client.coordonneeBancaire || ''
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement du client');
            console.error('Error fetching client:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Effacer l'erreur du champ si elle existe
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.clientNom.trim()) {
            newErrors.clientNom = 'Le nom du client est obligatoire';
        } else if (formData.clientNom.length > 100) {
            newErrors.clientNom = 'Le nom ne doit pas dépasser 100 caractères';
        }

        if (formData.contact && formData.contact.length > 100) {
            newErrors.contact = 'Le contact ne doit pas dépasser 100 caractères';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            if (isEditMode) {
                const response = await clientApi.updateClient(id, formData);
                setSuccess(response.message || 'Client modifié avec succès');
            } else {
                const response = await clientApi.createClient(formData);
                setSuccess(response.message || 'Client créé avec succès');
                // Réinitialiser le formulaire après création
                setFormData({
                    clientNom: '',
                    contact: '',
                    adresse: '',
                    coordonneeBancaire: ''
                });
            }

            // Rediriger vers la liste après 1.5 secondes
            setTimeout(() => {
                navigate('/clients');
            }, 1500);

        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement du client');
            console.error('Error saving client:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode && !formData.clientNom) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {isEditMode ? 'Modifier le Client' : 'Nouveau Client'}
                </h1>
                <p className="text-gray-600">
                    {isEditMode
                        ? 'Modifiez les informations du client'
                        : 'Remplissez le formulaire pour créer un nouveau client'}
                </p>
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

            <div className="bg-white rounded-lg shadow-md p-6">
                <form onSubmit={handleSubmit}>
                    {/* Nom du client */}
                    <div className="mb-6">
                        <label htmlFor="clientNom" className="block text-sm font-medium text-gray-700 mb-2">
                            Nom du Client <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="clientNom"
                            name="clientNom"
                            value={formData.clientNom}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.clientNom
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            placeholder="Entrez le nom du client"
                            disabled={loading}
                        />
                        {errors.clientNom && (
                            <p className="mt-1 text-sm text-red-500">{errors.clientNom}</p>
                        )}
                    </div>

                    {/* Contact */}
                    <div className="mb-6">
                        <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
                            Contact
                        </label>
                        <input
                            type="text"
                            id="contact"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.contact
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            placeholder="Numéro de téléphone, email, etc."
                            disabled={loading}
                        />
                        {errors.contact && (
                            <p className="mt-1 text-sm text-red-500">{errors.contact}</p>
                        )}
                    </div>

                    {/* Adresse */}
                    <div className="mb-6">
                        <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-2">
                            Adresse
                        </label>
                        <textarea
                            id="adresse"
                            name="adresse"
                            value={formData.adresse}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Adresse complète du client"
                            disabled={loading}
                        />
                    </div>

                    {/* Coordonnées bancaires */}
                    <div className="mb-6">
                        <label htmlFor="coordonneeBancaire" className="block text-sm font-medium text-gray-700 mb-2">
                            Coordonnées Bancaires
                        </label>
                        <textarea
                            id="coordonneeBancaire"
                            name="coordonneeBancaire"
                            value={formData.coordonneeBancaire}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="IBAN, RIB, etc."
                            disabled={loading}
                        />
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => navigate('/clients')}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                            disabled={loading}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading
                                ? 'Enregistrement...'
                                : isEditMode
                                    ? 'Enregistrer les modifications'
                                    : 'Créer le client'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientForm;

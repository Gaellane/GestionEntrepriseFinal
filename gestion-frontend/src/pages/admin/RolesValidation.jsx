import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import SideBar from '../../components/layout/SideBar';
import roleAttributionApi from '../../api/roleAttributionApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function RolesValidation() {
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, validated, rejected

  useEffect(() => {
    loadValidations();
  }, [filter]);

  const loadValidations = async () => {
    try {
      setLoading(true);
      // Process id 1 = création
      const createdAttr = await roleAttributionApi.getAttributionsByProcess(1);
      
      let filtered = createdAttr.data || createdAttr;
      
      if (filter === 'pending') {
        filtered = filtered.filter(a => a.processId === 1);
      } else if (filter === 'validated') {
        const validatedAttr = await roleAttributionApi.getAttributionsByProcess(2);
        filtered = validatedAttr.data || validatedAttr;
      } else if (filter === 'rejected') {
        const rejectedAttr = await roleAttributionApi.getAttributionsByProcess(3);
        filtered = rejectedAttr.data || rejectedAttr;
      }

      setValidations(filtered);
    } catch (err) {
      console.error('Error loading validations:', err);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des validations' });
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir valider cette attribution?')) {
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);
      await roleAttributionApi.validateAttribution(id);
      setMessage({ type: 'success', text: 'Attribution validée avec succès' });
      await loadValidations();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Erreur lors de la validation' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir rejeter cette attribution?')) {
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);
      await roleAttributionApi.rejectAttribution(id);
      setMessage({ type: 'success', text: 'Attribution rejetée avec succès' });
      await loadValidations();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Erreur lors du rejet' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
                <ClipboardDocumentCheckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Validation des Rôles
                </h1>
                <p className="text-gray-600">
                  Validez ou rejetez les attributions de rôles
                </p>
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-4 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              <p className="font-semibold">{message.type === 'success' ? 'Succès' : 'Erreur'}</p>
              <p>{message.text}</p>
            </div>
          )}

          {/* Filter */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrer par
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">Toutes les attributions</option>
                  <option value="pending">En attente de validation</option>
                  <option value="validated">Validées</option>
                  <option value="rejected">Rejetées</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && <LoadingSpinner />}

          {/* Validations Table */}
          {!loading && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {validations.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                          <th className="px-6 py-4 text-left">
                            <span className="text-xs font-semibold text-gray-700 uppercase">Utilisateur</span>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <span className="text-xs font-semibold text-gray-700 uppercase">Email</span>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <span className="text-xs font-semibold text-gray-700 uppercase">Rôle</span>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <span className="text-xs font-semibold text-gray-700 uppercase">Statut</span>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <span className="text-xs font-semibold text-gray-700 uppercase">Date</span>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <span className="text-xs font-semibold text-gray-700 uppercase">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {validations.map((validation, index) => (
                          <tr
                            key={validation.id}
                            className={`border-b ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            } hover:bg-green-50 transition`}
                          >
                            <td className="px-6 py-4">
                              <span className="font-semibold text-gray-900">
                                {validation.utilisateurNom}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {validation.utilisateurEmail}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {validation.roleName}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  validation.processAbreviation === 'VAL'
                                    ? 'bg-green-100 text-green-800'
                                    : validation.processAbreviation === 'REJ'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {validation.processName}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {formatDate(validation.dateEntree)}
                            </td>
                            <td className="px-6 py-4">
                              {validation.processAbreviation === 'CRE' && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleValidate(validation.id)}
                                    disabled={submitting}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded hover:bg-green-600 disabled:opacity-50 transition"
                                  >
                                    <CheckIcon className="w-4 h-4" />
                                    Valider
                                  </button>
                                  <button
                                    onClick={() => handleReject(validation.id)}
                                    disabled={submitting}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 disabled:opacity-50 transition"
                                  >
                                    <XMarkIcon className="w-4 h-4" />
                                    Rejeter
                                  </button>
                                </div>
                              )}
                              {validation.processAbreviation !== 'CRE' && (
                                <span className="text-xs text-gray-500">Aucune action</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <ClipboardDocumentCheckIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-semibold">Aucune attribution trouvée</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
  );
}

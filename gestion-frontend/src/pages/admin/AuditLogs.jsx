import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import SideBar from '../../components/layout/SideBar';
import auditLogApi from '../../api/auditLogApi';
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
    second: '2-digit',
  });
};

export default function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [sortBy, setSortBy] = useState('actionTimestamp');
  const [direction, setDirection] = useState('DESC');

  useEffect(() => {
    loadAuditLogs();
  }, [pagination.currentPage, pagination.pageSize, sortBy, direction]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await auditLogApi.getAuditLogs(
        pagination.currentPage,
        pagination.pageSize,
        sortBy,
        direction
      );

      console.log('[AuditLogs] Response:', response);

      // Extract the Page object from ApiResponse
      const pageData = response.data || response;

      setAuditLogs(Array.isArray(pageData.content) ? pageData.content : []);
      setPagination({
        currentPage: pageData.number || 0,
        pageSize: pageData.size || 10,
        totalElements: pageData.totalElements || 0,
        totalPages: pageData.totalPages || 0,
      });
    } catch (err) {
      console.error('[AuditLogs] Error loading audit logs:', err);
      setError(err.message || 'Erreur lors du chargement des logs d\'audit');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPagination((prev) => ({ ...prev, pageSize: newSize, currentPage: 0 }));
  };

  const handleSortChange = (column) => {
    if (sortBy === column) {
      setDirection(direction === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setDirection('DESC');
    }
  };

  return (
      <div className="">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <DocumentDuplicateIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Logs d'Audit
                </h1>
                <p className="text-gray-600">
                  Consultez l'historique des actions effectuées dans le système
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <p className="font-semibold">Erreur</p>
              <p>{error}</p>
            </div>
          )}

          {/* Controls */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Éléments par page
                </label>
                <select
                  value={pagination.pageSize}
                  onChange={handlePageSizeChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>

              <div>
                <p className="text-sm text-gray-600">
                  Total : <span className="font-semibold">{pagination.totalElements}</span> logs
                </p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && <LoadingSpinner />}

          {/* Table */}
          {!loading && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {auditLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                        <th className="px-6 py-4">
                          <button
                            onClick={() => handleSortChange('id')}
                            className="text-xs font-semibold text-gray-700 uppercase hover:text-blue-600 transition"
                          >
                            ID {sortBy === 'id' && (direction === 'ASC' ? '↑' : '↓')}
                          </button>
                        </th>
                        <th className="px-6 py-4">
                          <button
                            onClick={() => handleSortChange('actionTimestamp')}
                            className="text-xs font-semibold text-gray-700 uppercase hover:text-blue-600 transition"
                          >
                            Date/Heure {sortBy === 'actionTimestamp' && (direction === 'ASC' ? '↑' : '↓')}
                          </button>
                        </th>
                        <th className="px-6 py-4">
                          <span className="text-xs font-semibold text-gray-700 uppercase">Utilisateur</span>
                        </th>
                        <th className="px-6 py-4">
                          <span className="text-xs font-semibold text-gray-700 uppercase">Action</span>
                        </th>
                        <th className="px-6 py-4">
                          <span className="text-xs font-semibold text-gray-700 uppercase">Classe</span>
                        </th>
                        <th className="px-6 py-4">
                          <span className="text-xs font-semibold text-gray-700 uppercase">Détails</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log, index) => (
                        <tr
                          key={log.id}
                          className={`border-b ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          } hover:bg-blue-50 transition`}
                        >
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              #{log.id}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatDate(log.actionTimestamp)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              #{log.userId || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {log.actionLabel || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {log.classes || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="max-w-xs truncate" title={log.details || log.idsClasses}>
                              {log.details || log.idsClasses || '-'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <DocumentDuplicateIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-semibold">Aucun log d'audit trouvé</p>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 0}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                      Précédent
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Page{' '}
                        <span className="font-semibold">
                          {pagination.currentPage + 1}
                        </span>{' '}
                        sur{' '}
                        <span className="font-semibold">
                          {pagination.totalPages}
                        </span>
                      </span>
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages - 1}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Suivant
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
  );
}

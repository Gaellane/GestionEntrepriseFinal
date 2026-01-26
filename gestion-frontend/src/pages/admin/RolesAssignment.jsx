import React, { useState, useEffect } from 'react';
import { UserPlusIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import SideBar from '../../components/layout/SideBar';
import roleAttributionApi from '../../api/roleAttributionApi';
import utilisateurApi from '../../api/utilisateurApi';
import roleApi from '../../api/roleApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function RolesAssignment() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load all users
      const utilisateursList = await utilisateurApi.getAllUtilisateurs();
      setUtilisateurs(utilisateursList.data ? utilisateursList.data : utilisateursList);
      
      // Load all roles
      const rolesList = await roleApi.getAllRoles();
      setRoles(rolesList.data ? rolesList.data : rolesList);
      
      // Load attributions with process id 1 (creation)
      const attributions = await roleAttributionApi.getAttributionsByProcess(1);
      setAssignments(attributions.data || attributions);
    } catch (err) {
      console.error('Error loading data:', err);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données' });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedRole) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un utilisateur et un rôle' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);
      const result = await roleAttributionApi.assignRole(parseInt(selectedUser), parseInt(selectedRole));
      
      setMessage({ type: 'success', text: 'Rôle assigné avec succès' });
      setSelectedUser('');
      setSelectedRole('');
      
      // Reload assignments
      await loadInitialData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Erreur lors de l\'assignation' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <UserPlusIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Assignation de Rôles
                </h1>
                <p className="text-gray-600">
                  Assignez des rôles aux utilisateurs
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

          {/* Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <form onSubmit={handleAssignRole} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Utilisateur *
                  </label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">-- Sélectionnez un utilisateur --</option>
                    {utilisateurs.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.nom} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rôle *
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">-- Sélectionnez un rôle --</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.roleName} ({role.roleCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50"
              >
                {submitting ? 'Assignation en cours...' : 'Assigner le Rôle'}
              </button>
            </form>
          </div>

          {/* Assignments List */}
          {loading && <LoadingSpinner />}

          {!loading && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
                        <span className="text-xs font-semibold text-gray-700 uppercase">Date Assignation</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.length > 0 ? (
                      assignments.map((assignment, index) => (
                        <tr
                          key={assignment.id}
                          className={`border-b ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          } hover:bg-blue-50 transition`}
                        >
                          <td className="px-6 py-4">
                            <span className="font-semibold text-gray-900">
                              {assignment.utilisateurNom}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {assignment.utilisateurEmail}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {assignment.roleName}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(assignment.dateEntree).toLocaleDateString('fr-FR')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                          Aucune assignation en attente
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
  );
}

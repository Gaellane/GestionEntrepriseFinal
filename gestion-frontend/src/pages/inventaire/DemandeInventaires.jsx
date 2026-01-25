import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import inventaireApi from '../../api/inventaireApi';
import stockApi from '../../api/stock';
import { useAuth } from '../../hooks/useAuth';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  DocumentTextIcon, 
  ExclamationCircleIcon,
  BuildingOfficeIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export default function DemandeInventaires() {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [depotsMap, setDepotsMap] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await inventaireApi.listDemandes();
        setDemandes(Array.isArray(res) ? res : []);
        // charger la liste des dépôts pour afficher le nom plutôt que l'id
        try {
          const form = await stockApi.getFormData();
          const f = form && (form.data || form) ;
          const deps = f && f.depots ? f.depots : (form.depots || []);
          const map = {};
          (deps || []).forEach(d => { if (d && d.id) map[d.id] = d.depotName || d.depot_name || d.name; });
          setDepotsMap(map);
        } catch (e) {
          // ignore depot loading errors
          console.error('Failed to load depots for names', e);
        }
      } catch (err) {
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const [validatingId, setValidatingId] = useState(null);

  const handleValidate = async (id) => {
    if (!window.confirm('Confirmer la validation de la demande #' + id + ' ?')) return;
    setValidatingId(id);
    try {
      await inventaireApi.validateDemande(id);
      const refreshed = await inventaireApi.listDemandes();
      setDemandes(Array.isArray(refreshed) ? refreshed : []);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setValidatingId(null);
    }
  };

  const getStatusBadge = (validated) => {
    if (validated) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircleIcon className="w-4 h-4" />
          Validé
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <ClockIcon className="w-4 h-4" />
        En attente
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
              <DocumentTextIcon className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Demandes d'inventaire</h1>
              <p className="text-gray-600 mt-1">Gérez et suivez les demandes d'inventaire</p>
            </div>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total des demandes</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{demandes.length}</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg">
                <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {demandes.filter(d => !d.validated).length}
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <ClockIcon className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Validées</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {demandes.filter(d => d.validated).length}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des demandes */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* En-tête du tableau */}
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Liste des demandes</h2>
          </div>

          {/* États de chargement et erreur */}
          {loading && (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Chargement des demandes...</p>
            </div>
          )}

          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 text-red-700">
                <ExclamationCircleIcon className="w-5 h-5" />
                <p className="font-medium">Erreur</p>
              </div>
              <p className="text-red-600 mt-1 text-sm">{error}</p>
            </div>
          )}

          {/* Tableau */}
          {!loading && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date de demande
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Dépôt
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      État
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {demandes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <DocumentTextIcon className="w-12 h-12 mb-3" />
                          <p className="text-lg font-medium text-gray-500">Aucune demande trouvée</p>
                          <p className="text-sm mt-1">Les demandes apparaîtront ici</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    demandes.map((d) => {
                      const validated = !!d.validated;
                      return (
                        <tr key={d.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                              #{d.id}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(d.dateEntree || d.date_entree || d.createdAt || Date.now()).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(d.dateEntree || d.date_entree || d.createdAt || Date.now()).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {d.depotName || d.depot?.depotName || depotsMap[d.depotId] || depotsMap[d.depot?.id] || (d.depotId ? `#${d.depotId}` : '-')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {d.utilisateurName || d.utilisateur?.nom || d.utilisateur?.name || (d.utilisateurId || '-')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(validated)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {!validated && user && user.role === 'RESP_MAGASIN' ? (
                                <button
                                  onClick={() => handleValidate(d.id)}
                                  disabled={validatingId === d.id}
                                  className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                    validatingId === d.id 
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow'
                                  }`}
                                >
                                  {validatingId === d.id ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      Validation...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircleIcon className="w-4 h-4" />
                                      Valider
                                    </>
                                  )}
                                </button>
                              ) : (validated && user && user.role === 'MAGINV' ? (
                                <Link 
                                  to={`/inventaire/perform/${d.id}`}
                                  className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow"
                                >
                                  <DocumentTextIcon className="w-4 h-4" />
                                  Faire inventaire
                                </Link>
                              ) : (
                                <span className="text-gray-400 text-sm">—</span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pied de page informatif */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            {user?.role === 'RESP_MAGASIN' 
              ? 'Vous pouvez valider les demandes en attente pour autoriser les inventaires.' 
              : user?.role === 'MAGINV' 
              ? 'Vous pouvez procéder aux inventaires des demandes validées.' 
              : 'Connectez-vous avec un rôle approprié pour effectuer des actions.'}
          </p>
        </div>
      </div>
    </div>
  );
}
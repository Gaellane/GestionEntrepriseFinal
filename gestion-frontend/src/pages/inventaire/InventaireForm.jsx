import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import inventaireApi from '../../api/inventaireApi';
import stockApi from '../../api/stock';
import {
  ClipboardDocumentListIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function InventaireForm(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [depotId, setDepotId] = useState('');
  const [depots, setDepots] = useState([]);
  const [details, setDetails] = useState('');
  const [message, setMessage] = useState(null);
  const [loadingDepots, setLoadingDepots] = useState(true);

  useEffect(() => {
    // For demande creation we only need depots list
    let mounted = true;
    stockApi.getFormData()
      .then(res => {
        const data = res && (res.data || res.payload || res);
        const list = data && data.depots ? data.depots : (res.depots || []);
        if (mounted) {
          setDepots(Array.isArray(list) ? list : []);
          setLoadingDepots(false);
          if ((!depotId || depotId === '') && Array.isArray(list) && list.length > 0) {
            const first = list[0];
            setDepotId(first.id || first.depotId || first.depot_id || '');
          }
        }
      })
      .catch(err => {
        console.error('Failed to load depots for user', err);
        if (mounted) setLoadingDepots(false);
      });

    return () => { mounted = false; };
  }, [depotId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id === 'new') {
        if (!depotId || depotId === '') {
          setMessage('Veuillez sélectionner un dépôt avant de créer la demande.');
          return;
        }
        const depotNumeric = Number(depotId);
        if (!Number.isFinite(depotNumeric) || depotNumeric <= 0) {
          setMessage('Identifiant de dépôt invalide.');
          return;
        }
        const payload = { depotId: depotNumeric, details };
        await inventaireApi.createDemande(payload);
        setMessage('Demande créée');
        navigate('/home');
      } else {
        // For existing demande, direct user to the perform page
        navigate(`/inventaire/perform/${id}`);
      }
    } catch (err) {
      setMessage(err.message || String(err));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-linear-to-r from-emerald-500 to-green-600 rounded-lg">
            <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {id === 'new' ? "Créer une demande d'inventaire" : `Inventaire #${id}`}
            </h1>
            <p className="text-gray-600">
              {id === 'new' ? "Créez une nouvelle demande d'inventaire pour un dépôt" : "Consultez et gérez cet inventaire"}
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        {message && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section Dépôt */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200 flex items-center">
              <BuildingStorefrontIcon className="w-5 h-5 mr-2 text-emerald-600" />
              Sélection du dépôt
            </h2>

            <div className="space-y-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <BuildingStorefrontIcon className="w-4 h-4 mr-1" />
                  Dépôt *
                </label>
                {loadingDepots ? (
                  <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                    <span className="text-gray-600">Chargement des dépôts...</span>
                  </div>
                ) : (
                  <select
                    value={depotId}
                    onChange={e => setDepotId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                    required
                  >
                    <option value="">-- Sélectionnez un dépôt --</option>
                    {depots.map(d => (
                      <option key={d.id || d.depotId} value={d.id || d.depotId}>
                        {d.depotName || d.depot_name || d.name || `Depot ${d.id || d.depotId}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Section Détails */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2 text-emerald-600" />
              Informations complémentaires
            </h2>

            <div className="space-y-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <DocumentTextIcon className="w-4 h-4 mr-1" />
                  Détails (optionnel)
                </label>
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none resize-none"
                  rows="4"
                  placeholder="Ajoutez des détails supplémentaires sur cette demande d'inventaire..."
                />
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="bg-linear-to-r from-emerald-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 flex items-center space-x-2"
            >
              {id === 'new' ? (
                <>
                  <ClipboardDocumentListIcon className="w-5 h-5" />
                  <span>Créer la demande</span>
                </>
              ) : (
                <>
                  <ArrowRightIcon className="w-5 h-5" />
                  <span>Aller à la saisie</span>
                </>
              )}
            </button>
          </div>
        </form>

        {id && id !== 'new' && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ArrowRightIcon className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 font-medium">Accès rapide à la saisie</span>
              </div>
              <Link
                to={`/inventaire/perform/${id}`}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>Ouvrir la saisie</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

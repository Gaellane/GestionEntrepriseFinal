import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import inventaireApi from '../../api/inventaireApi';
import stockApi from '../../api/stock';

export default function InventaireForm(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [depotId, setDepotId] = useState('');
  const [depots, setDepots] = useState([]);
  const [details, setDetails] = useState('');
  const [message, setMessage] = useState(null);
  const [loadingDepots, setLoadingDepots] = useState(false);

  useEffect(() => {
    // For demande creation we only need depots list
    let mounted = true;
    setLoadingDepots(true);
    stockApi.getFormData()
      .then(res => {
        const data = res && (res.data || res.payload || res);
        const list = data && data.depots ? data.depots : (res.depots || []);
        if (mounted) {
          setDepots(Array.isArray(list) ? list : []);
          if ((!depotId || depotId === '') && Array.isArray(list) && list.length > 0) {
            const first = list[0];
            setDepotId(first.id || first.depotId || first.depot_id || '');
          }
        }
      })
      .catch(err => {
        console.error('Failed to load depots for user', err);
      })
      .finally(() => setLoadingDepots(false));

    return () => { mounted = false; };
  }, []);

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
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">{id === 'new' ? "Créer une demande d'inventaire" : `Inventaire #${id}`}</h2>
      {message && <div className="mb-4 text-sm text-emerald-700">{message}</div>}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Dépôt</label>
          {loadingDepots ? (
            <div className="p-2">Chargement des dépôts...</div>
          ) : (
            <select value={depotId} onChange={e=>setDepotId(e.target.value)} className="w-full border p-2 rounded">
              <option value="">-- Sélectionnez un dépôt --</option>
              {depots.map(d => (
                <option key={d.id || d.depotId} value={d.id || d.depotId}>
                  {d.depotName || d.depot_name || d.name || `Depot ${d.id || d.depotId}`}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Détails</label>
          <textarea value={details} onChange={e=>setDetails(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        <div>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded">{id === 'new' ? 'Créer' : 'Aller à la saisie'}</button>
        </div>
      </form>
      {id && id !== 'new' && (
        <div className="mt-4">
          <Link to={`/inventaire/perform/${id}`} className="text-sky-600">Ouvrir la page de saisie des lignes pour cet inventaire</Link>
        </div>
      )}
    </div>
  );
}

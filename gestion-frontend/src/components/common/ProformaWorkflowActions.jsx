import React, { useState } from 'react';
import { proformaVenteApi } from '../../api/proformaVenteApi';

const ProformaWorkflowActions = ({ proforma, onUpdate, userRole }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [motif, setMotif] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const processValue = proforma.processId;

  // Déterminer les actions disponibles selon le statut
  const getAvailableActions = () => {
    const actions = [];
    
    // Brouillon (10) → Envoyer
    if (processValue === 10) {
      actions.push({ label: 'Envoyer au client', action: 'ENVOYER', color: 'blue' });
    }
    
    // Envoyé (20) → Accepter ou Refuser
    if (processValue === 20) {
      actions.push({ label: 'Accepter', action: 'ACCEPTER', color: 'green' });
      actions.push({ label: 'Refuser', action: 'REFUSER', color: 'red' });
    }
    
    // Accepté (30) → Transformer en commande
    if (processValue === 30 && (userRole === 'ADMIN' || userRole === 'RESP_VENTE')) {
      actions.push({ label: 'Transformer en commande', action: 'TRANSFORMER', color: 'purple' });
    }

    return actions;
  };

  const handleAction = (action) => {
    setModalAction(action);
    setShowModal(true);
    setMotif('');
    setError(null);
  };

  const confirmAction = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await proformaVenteApi.changerStatut(proforma.id, modalAction, motif);
      
      setShowModal(false);
      setMotif('');
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
      setError(err.response?.data?.message || 'Erreur lors du changement de statut');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    const statusColors = {
      10: 'bg-gray-200 text-gray-700',
      20: 'bg-blue-100 text-blue-700',
      30: 'bg-green-100 text-green-700',
      40: 'bg-red-100 text-red-700',
      50: 'bg-purple-100 text-purple-700'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[processValue] || 'bg-gray-100 text-gray-600'}`}>
        {proforma.processName}
      </span>
    );
  };

  const getActionColor = (color) => {
    const colors = {
      blue: 'bg-blue-500 hover:bg-blue-600',
      green: 'bg-green-500 hover:bg-green-600',
      red: 'bg-red-500 hover:bg-red-600',
      purple: 'bg-purple-500 hover:bg-purple-600'
    };
    return colors[color] || 'bg-gray-500 hover:bg-gray-600';
  };

  const availableActions = getAvailableActions();

  return (
    <div className="space-y-4">
      {/* Badge de statut */}
      <div className="flex items-center space-x-2">
        <span className="text-gray-600 font-semibold">Statut :</span>
        {getStatusBadge()}
      </div>

      {/* Boutons d'action */}
      {availableActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleAction(action.action)}
              className={`px-4 py-2 text-white rounded-lg transition-colors ${getActionColor(action.color)}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Modal de confirmation */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              Confirmer l'action
            </h3>
            
            <p className="mb-4 text-gray-600">
              Voulez-vous vraiment <span className="font-semibold">{modalAction.toLowerCase()}</span> ce pro-forma ?
            </p>

            {/* Champ motif (optionnel pour REFUSER, obligatoire pour certaines actions) */}
            {(modalAction === 'REFUSER' || modalAction === 'TRANSFORMER') && (
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Motif {modalAction === 'REFUSER' && '(obligatoire)'}:
                </label>
                <textarea
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Saisissez le motif..."
                  required={modalAction === 'REFUSER'}
                />
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setMotif('');
                  setError(null);
                }}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={confirmAction}
                disabled={loading || (modalAction === 'REFUSER' && !motif)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {loading ? 'Traitement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProformaWorkflowActions;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMouvement } from '../../api/caisseMouvementApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CaisseMouvementGeneralForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    venteId: '',
    montant: '',
    details: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'montant' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.montant || formData.montant === 0) return setError('Le montant est requis');
    setLoading(true);
    setError(null);
    try {
      await createMouvement(formData.venteId ? parseInt(formData.venteId) : null, formData.montant, null, null, formData.details || null);
      navigate('/caisse/mouvements/creer', { state: { message: 'Mouvement enregistré' } });
    } catch (err) {
      setError(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mouvement de caisse</h1>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Vente (optionnel)</label>
          <input type="number" name="venteId" value={formData.venteId} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Montant</label>
          <input type="number" step="0.01" name="montant" value={formData.montant} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Détails</label>
          <textarea name="details" value={formData.details} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/ventes')} className="px-4 py-2 border rounded">Annuler</button>
          <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded">Enregistrer</button>
        </div>
      </form>
    </div>
  );
};

export default CaisseMouvementGeneralForm;
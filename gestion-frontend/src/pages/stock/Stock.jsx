import React, { useEffect, useState } from 'react';
import { getFormData, submitMovement } from '../../api/stock';


const emptyRow = () => ({ type: 'ENTREE', articleId: '', depotId: '', quantite: '', description: '', date: '', datePeremption: '' });
  export default function Stock() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const defaultType = params.get('type') || 'ENTREE';

    const [activeTab, setActiveTab] = useState(defaultType);
    const [articles, setArticles] = useState([]);
    const [depots, setDepots] = useState([]);
    const [rows, setRows] = useState([emptyRow(defaultType)]);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
      (async () => {
        try {
          const resp = await getFormData();
          const data = resp.data || resp;
          setArticles(data.articles || []);
          setDepots(data.depots || []);
        } catch (e) {
          console.error(e);
        }
      })();
    }, []);

    useEffect(() => {
      // when tab changes, reset rows with the selected type
      setRows([emptyRow(activeTab)]);
    }, [activeTab]);

    const updateRow = (index, key, value) => {
      const copy = [...rows];
      copy[index] = { ...copy[index], [key]: value };
      setRows(copy);
    };

    const addRow = () => setRows(prev => [...prev, emptyRow(activeTab)]);
    const removeRow = (i) => setRows(prev => prev.filter((_, idx) => idx !== i));

    const handleSubmit = async (e) => {
      e.preventDefault();
      setMessage(null);
      setSubmitting(true);
      const results = [];
      try {
        for (const r of rows) {
          // basic validation
          if (!r.articleId || !r.quantite || (activeTab === 'ENTREE' && !r.depotId)) {
            throw new Error('Chaque ligne doit contenir article, quantité et dépôt si entrée');
          }

          const payload = {
            type: activeTab,
            articleId: Number(r.articleId),
            depotId: r.depotId ? Number(r.depotId) : null,
            quantite: Number(r.quantite),
            raisonId: null,
            description: r.description,
            date: r.date ? new Date(r.date).toISOString() : null,
            datePeremption: r.datePeremption ? new Date(r.datePeremption).toISOString() : null
          };

          const res = await submitMovement(payload);
          results.push(res);
        }

        setMessage({ type: 'success', text: `Opération réussie (${results.length} lignes)` });
        setRows([emptyRow(activeTab)]);
      } catch (err) {
        setMessage({ type: 'error', text: err.message || 'Erreur' });
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="flex">
        <SideBar />
        <div className="min-h-screen max-h-full bg-gradient-to-br from-gray-50 to-gray-100 p-6 overflow-y-scroll flex-1">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Stock — Saisie mouvements</h1>
                  <p className="text-gray-600">Enregistrez des entrées ou sorties de stock</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <ArchiveBoxIcon className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Mouvement</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => setActiveTab('ENTREE')} className={`px-3 py-1 rounded ${activeTab==='ENTREE' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Entrée</button>
                    <button onClick={() => setActiveTab('SORTIE')} className={`px-3 py-1 rounded ${activeTab==='SORTIE' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Sortie</button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {rows.map((row, idx) => (
                    <div key={idx} className="border rounded-lg p-4 mb-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Article</label>
                          <select value={row.articleId} onChange={e => updateRow(idx, 'articleId', e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg">
                            <option value="">-- Choisir --</option>
                            {articles.map(a => (<option key={a.id} value={a.id}>{a.articleNom || a.refe}</option>))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Quantité</label>
                          <input type="number" step="0.01" value={row.quantite} onChange={e => updateRow(idx, 'quantite', e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Dépôt</label>
                          <select value={row.depotId} onChange={e => updateRow(idx, 'depotId', e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg" disabled={activeTab !== 'ENTREE'}>
                            <option value="">-- Choisir --</option>
                            {depots.map(d => (<option key={d.id} value={d.id}>{d.depotName}</option>))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Date</label>
                          <input type="datetime-local" value={row.date} onChange={e => updateRow(idx, 'date', e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Date péremption</label>
                          <input type="date" value={row.datePeremption} onChange={e => updateRow(idx, 'datePeremption', e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Actions</label>
                          <div className="mt-1 flex gap-2">
                            <button type="button" onClick={() => removeRow(idx)} className="px-3 py-1 bg-red-50 text-red-600 rounded">Suppr.</button>
                            <button type="button" onClick={addRow} className="px-3 py-1 bg-gray-100 rounded">+ Ligne</button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <input type="text" value={row.description} onChange={e => updateRow(idx, 'description', e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg" />
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">{rows.length} ligne(s)</div>
                    <div className="flex items-center gap-3">
                      <button type="submit" disabled={submitting} className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg">{submitting ? 'Envoi...' : 'Enregistrer'}</button>
                    </div>
                  </div>

                  {message && (
                    <div className={`p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message.text}</div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}

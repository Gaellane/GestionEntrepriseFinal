/**
 * API client pour le module de prédiction des ventes et alertes de stock.
 * Communique avec PredictionController côté backend.
 */

const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '';

function authHeaders() {
  let token = localStorage.getItem('token');
  try { token = JSON.parse(token); } catch(e) {}
  return token
    ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

async function parseResponse(res) {
  const text = await res.text();
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { return JSON.parse(text); } catch(e) { throw new Error('Invalid JSON response'); }
  }
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  return text;
}

/**
 * Déclenche l'entraînement (ou le réentraînement) du modèle de prédiction.
 * @returns {Promise<{success: boolean, message: string, durationMs: number}>}
 */
export async function trainPredictionModel() {
  const url = `${apiBase}/api/predictions/train`;
  const res = await fetch(url, { method: 'POST', headers: authHeaders() });
  return await parseResponse(res);
}

/**
 * Récupère les informations du modèle (date d'entraînement, métriques, etc.)
 * @returns {Promise<PredictionSummaryDto>}
 */
export async function getModelInfo() {
  const url = `${apiBase}/api/predictions/model-info`;
  const res = await fetch(url, { method: 'GET', headers: authHeaders() });
  return await parseResponse(res);
}

/**
 * Prédit les ventes pour un article spécifique.
 * @param {Object} request - { articleId, depotId?, moisCible, anneeCible, promotion? }
 * @returns {Promise<SalesPredictionResponseDto>}
 */
export async function predictForArticle(request) {
  const url = `${apiBase}/api/predictions/article`;
  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(request),
  });
  return await parseResponse(res);
}

/**
 * Prédit les ventes pour tous les articles ayant un historique.
 * @param {Object} filters - { mois?, annee? }
 * @returns {Promise<PredictionSummaryDto>}
 */
export async function predictAllArticles(filters = {}) {
  const params = new URLSearchParams();
  if (filters.mois) params.append('mois', filters.mois);
  if (filters.annee) params.append('annee', filters.annee);

  const url = `${apiBase}/api/predictions/all${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url, { method: 'GET', headers: authHeaders() });
  return await parseResponse(res);
}

/**
 * Récupère les alertes de rupture de stock prédites.
 * @param {Object} filters - { mois?, annee? }
 * @returns {Promise<SalesPredictionResponseDto[]>}
 */
export async function getAlertesRupture(filters = {}) {
  const params = new URLSearchParams();
  if (filters.mois) params.append('mois', filters.mois);
  if (filters.annee) params.append('annee', filters.annee);

  const url = `${apiBase}/api/predictions/alertes${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url, { method: 'GET', headers: authHeaders() });
  return await parseResponse(res);
}

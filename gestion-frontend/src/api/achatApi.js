const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '';

function authHeaders() {
  let token = localStorage.getItem('token');
  try { token = JSON.parse(token); } catch(e) {}
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export async function sendAchat(achatData) {
  const url = `${apiBase}/api/achats`;
  const res = await fetch(url, { 
    method: 'POST', 
    headers: authHeaders(),
    body: JSON.stringify(achatData)
  });
  return (res);
}

export async function fetchFournisseursAll() {
  const url = `${apiBase}/api/fournisseurs`;
  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders()
  });
  const data = await res.json();
  return data;
}

export async function fetchFournisseurById(id) {
  const url = `${apiBase}/api/fournisseurs/${id}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders()
  });
  const data = await res.json();
  return data;
}

export async function fetchAchatAll() {
  const url = `${apiBase}/api/achats`;
  const res = await fetch(url, { 
    method: 'GET', 
    headers: authHeaders()
  });
  const data = await res.json();
  return data;
}

export async function fetchAchatById(id) {
  const url = `${apiBase}/api/achats/${id}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders()
  });
  const data = await res.json();
  return data;
}

export async function fetchCommandesByAchatId(id) {
  const url = `${apiBase}/api/achats/commande/${id}/list`;
  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders()
  });
  const data = await res.json();
  return data;
}

export async function fetchProformaByAchatAndFournisseur(achatId, fournisseurId) {
  const url = `${apiBase}/api/achats/proforma/${achatId}/fournisseur/${fournisseurId}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders()
  });
  const data = await res.json();
  return data;
}

export async function validerAchatMagasinier(id) {
  const url = `${apiBase}/api/achats/valider/${id}/magasinier`;
  const res = await fetch(url, { 
    method: 'GET', 
    headers: authHeaders()
  });
  return (res);
}

export async function validerAchatFinancier(id) { 
  const url = `${apiBase}/api/achats/valider/${id}/financier`;
  const res = await fetch(url, { 
    method: 'GET', 
    headers: authHeaders()
  });
  return (res);

}

export async function demandeProforma(id, commandeCreateDTOs) {
  const url = `${apiBase}/api/achats/commande/${id}/demande`;
  const res = await fetch(url, { 
    method: 'POST', 
    headers: authHeaders(),
    body: JSON.stringify(commandeCreateDTOs)
  });
  return (res);
}

export async function saveProforma(proforma) {
  const url = `${apiBase}/api/achats/proforma/create`;
  const res = await fetch(url, { 
    method: 'POST', 
    headers: authHeaders(),
    body: JSON.stringify(proforma)
  });
  return (res);
}

export async function saveCommande(id) {
  const url = `${apiBase}/api/achats/commande/${id}/create`;
  const res = await fetch(url, { 
    method: 'POST', 
    headers: authHeaders()
  });
  return (res);
}

export async function getCommandeByAchatId(achatId) {
  const url = `${apiBase}/api/achats/commande/${achatId}/get`;
  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders()
  });
  const data = await res.json();
  return data;
}

export async function saveLivraison(livraisonData) {
  const url = `${apiBase}/api/achats/livraison/create`;
  const res = await fetch(url, { 
    method: 'POST', 
    headers: authHeaders(),
    body: JSON.stringify(livraisonData)
  });
  return (res);
}

export async function getLivraisonByAchatId(achatId) {
  const url = `${apiBase}/api/achats/livraison/${achatId}/get`;
  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders()
  });
  const data = await res.json();
  return data;
}

export async function saveReception(receptionData) {
  const url = `${apiBase}/api/achats/reception/create`;
  const res = await fetch(url, { 
    method: 'POST', 
    headers: authHeaders(),
    body: JSON.stringify(receptionData)
  });
  return (res);
}

export async function getReceptionByAchatId(achatId) {
  const url = `${apiBase}/api/achats/reception/${achatId}/get`;
  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders()
  });
  const data = await res.json();
  return data;
}

export async function cloturerAchat(achatId) {
  const url = `${apiBase}/api/achats/cloturer/${achatId}`;
  const res = await fetch(url, { 
    method: 'POST', 
    headers: authHeaders()
  });
  return (res);
}

export async function getDepotAll() {
  const url = `${apiBase}/api/depots`;
  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders()
  });
  const data = await res.json();
  return data;
}

/**
 * Télécharge le PDF du bon de commande
 */
export async function downloadBonCommandePdf(bonCommandeId) {
  const url = `${apiBase}/api/achats/commande/${bonCommandeId}/pdf`;
  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders()
  });
  
  if (!res.ok) {
    throw new Error('Erreur lors du téléchargement du PDF');
  }
  
  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `bon_commande_${bonCommandeId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

/**
 * Télécharge le PDF de la livraison
 */
export async function downloadLivraisonPdf(livraisonId) {
  const url = `${apiBase}/api/achats/livraison/${livraisonId}/pdf`;
  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders()
  });
  
  if (!res.ok) {
    throw new Error('Erreur lors du téléchargement du PDF');
  }
  
  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `bon_livraison_${livraisonId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

/**
 * Télécharge le PDF de la réception
 */
export async function downloadReceptionPdf(receptionId) {
  const url = `${apiBase}/api/achats/reception/${receptionId}/pdf`;
  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders()
  });
  
  if (!res.ok) {
    throw new Error('Erreur lors du téléchargement du PDF');
  }
  
  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `bon_reception_${receptionId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}
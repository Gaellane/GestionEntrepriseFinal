-- Script pour créer la table proforma_historiques
-- Traçabilité des changements de statut des pro-forma

-- Création de la table proforma_historiques
CREATE TABLE IF NOT EXISTS proforma_historiques (
    id SERIAL PRIMARY KEY,
    proforma_id INTEGER NOT NULL REFERENCES proforma_ventes(id),
    ancien_process_id INTEGER REFERENCES proforma_processes(id),
    nouveau_process_id INTEGER NOT NULL REFERENCES proforma_processes(id),
    utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id),
    date_changement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    motif TEXT,
    commentaire TEXT
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_proforma_historiques_proforma_id ON proforma_historiques(proforma_id);
CREATE INDEX IF NOT EXISTS idx_proforma_historiques_date ON proforma_historiques(date_changement);
CREATE INDEX IF NOT EXISTS idx_proforma_historiques_utilisateur ON proforma_historiques(utilisateur_id);

-- Vérification
SELECT 'Table proforma_historiques créée avec succès' as status;
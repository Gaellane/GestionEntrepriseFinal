-- Script pour créer et alimenter la table proforma_processes
-- Système simple avec 3 statuts : CRÉÉ, VALIDÉ, ANNULÉ

-- Création de la table proforma_processes
CREATE TABLE IF NOT EXISTS proforma_processes (
    id SERIAL PRIMARY KEY,
    process_name VARCHAR(50) NOT NULL,
    process_code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    ordre INTEGER NOT NULL,
    couleur VARCHAR(20) DEFAULT '#6B7280'
);

-- Insertion des processus proforma
INSERT INTO proforma_processes (process_name, process_code, description, ordre, couleur) VALUES
('Créé', 'CREE', 'Pro-forma créé en brouillon', 1, '#6B7280'),
('Validé', 'VALIDE', 'Pro-forma validé et envoyé au client', 2, '#10B981'),
('Annulé', 'ANNULE', 'Pro-forma annulé', 3, '#EF4444');

-- Vérification
SELECT * FROM proforma_processes ORDER BY ordre;
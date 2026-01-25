-- Script pour alimenter la table vente_processes avec les statuts de pro-forma
-- 2.2 Définir Process Pro-forma

-- Insérer les 5 statuts de pro-forma
INSERT INTO vente_processes (process_name, valeur, date_entree) VALUES
('Brouillon', 10, NOW()),
('Envoyé', 20, NOW()),
('Accepté', 30, NOW()),
('Refusé', 40, NOW()),
('Transformé en commande', 50, NOW())
ON CONFLICT (process_name) DO NOTHING;

-- Vérifier les insertions
SELECT * FROM vente_processes ORDER BY valeur;

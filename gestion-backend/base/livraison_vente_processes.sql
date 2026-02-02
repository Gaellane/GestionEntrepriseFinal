-- Script pour alimenter la table livraison_vente_processes avec les statuts de livraison

INSERT INTO livraison_vente_processes (process_name, abreviation, valeur) VALUES
('En preparation', 'PREPAR', 10),      -- etat initial après creation
('Livree', 'LIVRE', 50),               -- Livraison terminee
('Annulee', 'ANNULE', 99);             -- Livraison annulee

ON CONFLICT (process_name) DO NOTHING;

-- Vérifier les insertions
SELECT * FROM livraison_vente_processes ORDER BY valeur;

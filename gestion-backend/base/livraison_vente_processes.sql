-- Script pour alimenter la table livraison_vente_processes avec les statuts de livraison

INSERT INTO livraison_vente_processes (process_name, abreviation, valeur) VALUES
('En préparation', 'PREPAR', 10),      -- 4.2 État initial après création
('En cours de picking', 'PICKIN', 20), -- 4.3 Sélection des lots en cours
('Prête à expédier', 'PRETE', 30),     -- Picking terminé
('Expédiée', 'EXPED', 40),             -- En transit
('Livrée', 'LIVRE', 50),               -- Réceptionnée par client
('Annulée', 'ANNULE', 99)              -- Annulée

ON CONFLICT (process_name) DO NOTHING;

-- Vérifier les insertions
SELECT * FROM livraison_vente_processes ORDER BY valeur;

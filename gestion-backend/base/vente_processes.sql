-- Script pour alimenter la table vente_processes avec tous les statuts de ventes
-- Inclut les statuts pro-forma ET les statuts de commande

-- Statuts Pro-forma (valeurs 10-50)
INSERT INTO vente_processes (process_name, abreviation, valeur) VALUES
('Brouillon', 'BROUIL', 10),           -- État initial pro-forma et commande
('Envoyé', 'ENVOYE', 20),               -- Pro-forma envoyé au client
('Accepté', 'ACCEPT', 30),              -- Pro-forma accepté par client
('Refusé', 'REFUSE', 40),               -- Pro-forma refusé par client
('Transformé en commande', 'TRANSF', 50), -- Pro-forma converti en commande

-- Statuts Commande (valeurs 60-99)
('Confirmée', 'CONFIR', 60),            -- 3.5 Validation commerciale + réservation stock
('En préparation', 'PREPAR', 70),       -- Commande en cours de préparation
('Prête', 'PRETE', 80),                 -- Commande prête à livrer
('Livrée', 'LIVRE', 90),                -- Commande livrée au client
('Annulée', 'ANNULE', 99)               -- 3.7 Commande annulée + libération stock

ON CONFLICT (process_name) DO NOTHING;

-- Vérifier les insertions
SELECT * FROM vente_processes ORDER BY valeur;

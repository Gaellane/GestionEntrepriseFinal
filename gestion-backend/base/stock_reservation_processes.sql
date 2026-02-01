-- Script d'initialisation des processus de réservation de stock
-- À exécuter après la création de la table stock_reservation_processes

-- Réservée (valeur 10) - État initial
INSERT INTO stock_reservation_processes (process_name, valeur, description)
VALUES ('Réservée', 10, 'Stock réservé pour une commande client (état initial)')
ON CONFLICT (valeur) DO NOTHING;

-- Allouée (valeur 20) - Stock physiquement séparé
INSERT INTO stock_reservation_processes (process_name, valeur, description)
VALUES ('Allouée', 20, 'Stock physiquement alloué et séparé pour préparation')
ON CONFLICT (valeur) DO NOTHING;

-- Consommée (valeur 30) - Expédiée/livrée (état final)
INSERT INTO stock_reservation_processes (process_name, valeur, description)
VALUES ('Consommée', 30, 'Stock consommé - commande expédiée ou livrée (état final)')
ON CONFLICT (valeur) DO NOTHING;

-- Libérée (valeur 99) - Annulée, stock libéré (état final)
INSERT INTO stock_reservation_processes (process_name, valeur, description)
VALUES ('Libérée', 99, 'Réservation annulée - stock libéré et disponible (état final)')
ON CONFLICT (valeur) DO NOTHING;

-- Vérification
SELECT * FROM stock_reservation_processes ORDER BY valeur;

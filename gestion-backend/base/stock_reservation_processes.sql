-- Script d'initialisation des processus de réservation de stock
-- À exécuter après la création de la table stock_reservation_processes

-- Réservée (valeur 10) - État initial
INSERT INTO stock_reservation_processes (process_name, valeur, abreviation)
VALUES ('Réservée', 10, 'RES');

-- Allouée (valeur 20) - Stock physiquement séparé
INSERT INTO stock_reservation_processes (process_name, valeur, abreviation)
VALUES ('Allouée', 20, 'ALL');

-- Consommée (valeur 30) - Expédiée/livrée (état final)
INSERT INTO stock_reservation_processes (process_name, valeur, abreviation)
VALUES ('Consommée', 30, 'CON');

-- Libérée (valeur 99) - Annulée, stock libéré (état final)
INSERT INTO stock_reservation_processes (process_name, valeur, abreviation)
VALUES ('Libérée', 99, 'LIB');

-- Vérification
SELECT * FROM stock_reservation_processes ORDER BY valeur;

-- =====================================================
-- DONNEES REALISTES ERP - GESTION DE STOCK COMPLETE
-- =====================================================
-- Ce script genere des donnees coherentes pour la gestion de stock avec:
-- - Lots avec differents prix unitaires
-- - Mouvements de lots (entrees et sorties)
-- - Reservations de stock
-- - Inventaires avec lignes
-- - Historiques de reservations et inventaires
-- =====================================================
-- PREREQUIS: Executer table.sql, dateStock.sql et achat_donnees.sql avant ce script
-- =====================================================

-- =====================================================
-- 1. NETTOYAGE DES DONNEES EXISTANTES
-- =====================================================
TRUNCATE TABLE inventaire_historiques CASCADE;
TRUNCATE TABLE inventaire_lignes CASCADE;
TRUNCATE TABLE inventaires CASCADE;
TRUNCATE TABLE stock_reservation_historiques CASCADE;
TRUNCATE TABLE stock_reservations CASCADE;
TRUNCATE TABLE lot_mouvements CASCADE;
TRUNCATE TABLE lots CASCADE;

-- =====================================================
-- 2. CREATION DES LOTS (Stock initial dans les depots)
-- =====================================================
-- Les lots representent les entrees en stock avec des prix differents
-- selon la date d'arrivee et le fournisseur

-- ========== DEPOT 1: Depot Central Antananarivo ==========

-- Alimentaire - Depot 1
-- ALI-001: Riz Blanc Premium 50kg
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-001-A', (SELECT id FROM articles WHERE refe = 'ALI-001'), 1, '2026-01-10 08:00:00', '2027-01-10', 100, 85, 82000.00, 'ACTIF'),
    ('LOT-2026-001-B', (SELECT id FROM articles WHERE refe = 'ALI-001'), 3, '2026-01-25 10:00:00', '2027-01-25', 150, 150, 83500.00, 'ACTIF');

-- ALI-002: Huile de Tournesol 5L
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-002-A', (SELECT id FROM articles WHERE refe = 'ALI-002'), 1, '2026-01-12 09:00:00', '2026-12-31', 200, 150, 20000.00, 'ACTIF'),
    ('LOT-2026-002-B', (SELECT id FROM articles WHERE refe = 'ALI-002'), 3, '2026-02-01 11:00:00', '2027-01-31', 100, 100, 21500.00, 'ACTIF');

-- ALI-003: Farine de Ble 25kg
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-003-A', (SELECT id FROM articles WHERE refe = 'ALI-003'), 1, '2026-01-15 07:30:00', '2026-07-15', 80, 60, 43000.00, 'ACTIF'),
    ('LOT-2026-003-B', (SELECT id FROM articles WHERE refe = 'ALI-003'), 3, '2026-01-28 14:00:00', '2026-07-28', 120, 120, 44200.00, 'ACTIF');

-- ALI-004: Sucre Blanc 50kg
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-004-A', (SELECT id FROM articles WHERE refe = 'ALI-004'), 1, '2026-01-18 10:00:00', NULL, 200, 180, 92000.00, 'ACTIF'),
    ('LOT-2026-004-B', (SELECT id FROM articles WHERE refe = 'ALI-004'), 3, '2026-02-02 09:00:00', NULL, 150, 150, 93500.00, 'ACTIF');

-- ALI-005: Cafe Moulu 500g
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-005-A', (SELECT id FROM articles WHERE refe = 'ALI-005'), 1, '2026-01-20 11:00:00', '2026-07-20', 300, 250, 17500.00, 'ACTIF'),
    ('LOT-2026-005-B', (SELECT id FROM articles WHERE refe = 'ALI-005'), 3, '2026-02-03 08:00:00', '2026-08-03', 200, 200, 18200.00, 'ACTIF');

-- Textile - Depot 1
-- TEX-001: T-Shirt Coton Homme
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-011-A', (SELECT id FROM articles WHERE refe = 'TEX-001'), 1, '2026-01-14 13:00:00', NULL, 500, 450, 14500.00, 'ACTIF'),
    ('LOT-2026-011-B', (SELECT id FROM articles WHERE refe = 'TEX-001'), 3, '2026-01-30 10:00:00', NULL, 400, 400, 15200.00, 'ACTIF');

-- TEX-002: Pantalon Jean Femme
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-012-A', (SELECT id FROM articles WHERE refe = 'TEX-002'), 1, '2026-01-16 14:00:00', NULL, 200, 180, 48000.00, 'ACTIF'),
    ('LOT-2026-012-B', (SELECT id FROM articles WHERE refe = 'TEX-002'), 3, '2026-02-01 11:00:00', NULL, 150, 150, 49500.00, 'ACTIF');

-- TEX-003: Chemise Homme Classique
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-013-A', (SELECT id FROM articles WHERE refe = 'TEX-003'), 1, '2026-01-22 09:00:00', NULL, 250, 230, 37000.00, 'ACTIF');

-- Electronique - Depot 1
-- ELE-001: Cable USB-C 2m
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-021-A', (SELECT id FROM articles WHERE refe = 'ELE-001'), 1, '2026-01-19 10:00:00', NULL, 1000, 950, 10500.00, 'ACTIF'),
    ('LOT-2026-021-B', (SELECT id FROM articles WHERE refe = 'ELE-001'), 3, '2026-02-04 09:00:00', NULL, 500, 500, 11000.00, 'ACTIF');

-- ELE-002: Souris Sans Fil
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-022-A', (SELECT id FROM articles WHERE refe = 'ELE-002'), 1, '2026-01-21 11:00:00', NULL, 300, 280, 25000.00, 'ACTIF');

-- ELE-003: Clavier AZERTY
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-023-A', (SELECT id FROM articles WHERE refe = 'ELE-003'), 1, '2026-01-23 12:00:00', NULL, 200, 190, 42000.00, 'ACTIF');

-- ========== DEPOT 2: Depot Regional Antsirabe ==========

-- Alimentaire - Depot 2
-- ALI-001: Riz Blanc Premium 50kg
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-101-A', (SELECT id FROM articles WHERE refe = 'ALI-001'), 2, '2026-01-17 08:00:00', '2027-01-17', 80, 70, 83000.00, 'ACTIF');

-- ALI-003: Farine de Ble 25kg
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-103-A', (SELECT id FROM articles WHERE refe = 'ALI-003'), 2, '2026-01-19 09:00:00', '2026-07-19', 60, 50, 43500.00, 'ACTIF');

-- ALI-007: Pates Alimentaires 500g
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-107-A', (SELECT id FROM articles WHERE refe = 'ALI-007'), 2, '2026-01-24 10:00:00', '2027-01-24', 500, 400, 2600.00, 'ACTIF');

-- Cosmetique - Depot 2
-- COS-001: Shampooing 500ml
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-131-A', (SELECT id FROM articles WHERE refe = 'COS-001'), 2, '2026-01-26 11:00:00', '2027-01-26', 400, 385, 13500.00, 'ACTIF');

-- COS-002: Gel Douche 1L
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-132-A', (SELECT id FROM articles WHERE refe = 'COS-002'), 2, '2026-01-27 10:00:00', '2027-01-27', 300, 285, 16500.00, 'ACTIF');

-- COS-003: Creme Visage 50ml
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-133-A', (SELECT id FROM articles WHERE refe = 'COS-003'), 2, '2026-02-02 09:00:00', '2027-02-02', 150, 146, 33000.00, 'ACTIF');

-- Papeterie - Depot 2
-- PAP-001: Ramette Papier A4
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-141-A', (SELECT id FROM articles WHERE refe = 'PAP-001'), 2, '2026-01-29 08:00:00', NULL, 300, 280, 23000.00, 'ACTIF');

-- PAP-002: Stylo Bille Bleu
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-142-A', (SELECT id FROM articles WHERE refe = 'PAP-002'), 2, '2026-02-04 10:00:00', NULL, 100, 88, 42000.00, 'ACTIF');

-- ========== DEPOT 3: Depot Annexe Toamasina ==========

-- Alimentaire - Depot 3
-- ALI-002: Huile de Tournesol 5L
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-202-A', (SELECT id FROM articles WHERE refe = 'ALI-002'), 3, '2026-01-20 09:00:00', '2026-12-31', 150, 135, 20500.00, 'ACTIF');

-- ALI-006: Conserve Tomate 800g
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-206-A', (SELECT id FROM articles WHERE refe = 'ALI-006'), 3, '2026-01-22 10:00:00', '2027-01-22', 600, 585, 3200.00, 'ACTIF');

-- ALI-008: Lait en Poudre 1kg
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-208-A', (SELECT id FROM articles WHERE refe = 'ALI-008'), 3, '2026-01-25 11:00:00', '2026-07-25', 100, 99, 31000.00, 'ACTIF');

-- Electronique - Depot 3
-- ELE-004: Multiprise 4 Prises
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-224-A', (SELECT id FROM articles WHERE refe = 'ELE-004'), 3, '2026-01-28 09:00:00', NULL, 250, 242, 16500.00, 'ACTIF');

-- ELE-005: Lampe LED Bureau
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-225-A', (SELECT id FROM articles WHERE refe = 'ELE-005'), 3, '2026-01-30 10:00:00', NULL, 150, 148, 32000.00, 'ACTIF');

-- Chimique - Depot 3
-- CHI-001: Javel 5L
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-251-A', (SELECT id FROM articles WHERE refe = 'CHI-001'), 3, '2026-02-01 08:00:00', '2027-02-01', 200, 198, 20000.00, 'ACTIF');

-- CHI-002: Savon Liquide 5L
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-252-A', (SELECT id FROM articles WHERE refe = 'CHI-002'), 3, '2026-02-03 09:00:00', '2027-02-03', 180, 176, 26000.00, 'ACTIF');

-- Accessoires - Depot 3
-- ACC-001: Sac a Dos
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-261-A', (SELECT id FROM articles WHERE refe = 'ACC-001'), 3, '2026-02-04 10:00:00', NULL, 100, 92, 60000.00, 'ACTIF');

-- Textile - Depot 3
-- TEX-004: Robe Femme Ete
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-214-A', (SELECT id FROM articles WHERE refe = 'TEX-004'), 3, '2026-01-31 11:00:00', NULL, 120, 118, 52000.00, 'ACTIF');

-- TEX-005: Chaussettes Pack 5
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-215-A', (SELECT id FROM articles WHERE refe = 'TEX-005'), 3, '2026-02-02 10:00:00', NULL, 300, 295, 7500.00, 'ACTIF');

-- TEX-006: Veste Hiver
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-216-A', (SELECT id FROM articles WHERE refe = 'TEX-006'), 3, '2026-01-29 12:00:00', NULL, 80, 79, 138000.00, 'ACTIF');

-- COS-004: Dentifrice 75ml
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-234-A', (SELECT id FROM articles WHERE refe = 'COS-004'), 3, '2026-02-01 09:00:00', '2027-08-01', 400, 396, 7200.00, 'ACTIF');

-- PAP-003: Classeur A4
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES 
    ('LOT-2026-243-A', (SELECT id FROM articles WHERE refe = 'PAP-003'), 3, '2026-02-03 11:00:00', NULL, 200, 195, 7500.00, 'ACTIF');

-- =====================================================
-- 3. MOUVEMENTS DE LOTS
-- =====================================================
-- Les mouvements representent les entrees et sorties de stock

-- ========== MOUVEMENTS D'ENTREE (Type 1) ==========

-- Entrees initiales (Reception fournisseur)
INSERT INTO lot_mouvements (lot_id, quantite, type_mouvement_id, raison_id, date_entree, description)
VALUES 
    -- Depot 1 - ALI-001
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-001-A'), 100, 1, (SELECT id FROM raison_mouvements WHERE raison_name = 'Reception fournisseur'), '2026-01-10 08:30:00', 'Reception lot riz - Fournisseur ABC'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-001-B'), 150, 1, (SELECT id FROM raison_mouvements WHERE raison_name = 'Reception fournisseur'), '2026-01-25 10:30:00', 'Reception lot riz - Fournisseur XYZ'),
    
    -- Depot 1 - ALI-002
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-002-A'), 200, 1, (SELECT id FROM raison_mouvements WHERE raison_name = 'Reception fournisseur'), '2026-01-12 09:30:00', 'Reception huile tournesol'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-002-B'), 100, 1, (SELECT id FROM raison_mouvements WHERE raison_name = 'Reception fournisseur'), '2026-02-01 11:30:00', 'Reception huile tournesol - nouveau lot'),
    
    -- Depot 1 - ALI-003
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-003-A'), 80, 1, (SELECT id FROM raison_mouvements WHERE raison_name = 'Reception fournisseur'), '2026-01-15 08:00:00', 'Reception farine ble'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-003-B'), 120, 1, (SELECT id FROM raison_mouvements WHERE raison_name = 'Reception fournisseur'), '2026-01-28 14:30:00', 'Reception farine ble'),
    
    -- Depot 1 - Textile
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-011-A'), 500, 1, (SELECT id FROM raison_mouvements WHERE raison_name = 'Reception fournisseur'), '2026-01-14 13:30:00', 'Reception T-shirts'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-011-B'), 400, 1, (SELECT id FROM raison_mouvements WHERE raison_name = 'Reception fournisseur'), '2026-01-30 10:30:00', 'Reception T-shirts'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-012-A'), 200, 1, (SELECT id FROM raison_mouvements WHERE raison_name = 'Reception fournisseur'), '2026-01-16 14:30:00', 'Reception pantalons jean'),
    
    -- Depot 1 - Electronique
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-021-A'), 1000, 1, (SELECT id FROM raison_mouvements WHERE raison_name = 'Reception fournisseur'), '2026-01-19 10:30:00', 'Reception cables USB-C'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-021-B'), 500, 1, (SELECT id FROM raison_mouvements WHERE raison_name = 'Reception fournisseur'), '2026-02-04 09:30:00', 'Reception cables USB-C'),
    
    -- Depot 2
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-101-A'), 80, 1, (SELECT id FROM raison_mouvements WHERE raison_name = 'Reception fournisseur'), '2026-01-17 08:30:00', 'Reception riz - Depot Antsirabe'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-103-A'), 60, 1, (SELECT id FROM raison_mouvements WHERE raison_name = 'Reception fournisseur'), '2026-01-19 09:30:00', 'Reception farine - Depot Antsirabe'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-131-A'), 400, 1, (SELECT id FROM raison_mouvements WHERE raison_name = 'Reception fournisseur'), '2026-01-26 11:30:00', 'Reception shampooing'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-141-A'), 300, 1, (SELECT id FROM raison_mouvements WHERE raison_name = 'Reception fournisseur'), '2026-01-29 08:30:00', 'Reception ramettes papier'),
    
    -- Depot 3
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-202-A'), 150, 1, (SELECT id FROM raison_mouvements WHERE raison_name = 'Reception fournisseur'), '2026-01-20 09:30:00', 'Reception huile - Depot Toamasina'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-206-A'), 600, 1, (SELECT id FROM raison_mouvements WHERE raison_name = 'Reception fournisseur'), '2026-01-22 10:30:00', 'Reception conserves tomate'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-261-A'), 100, 1, (SELECT id FROM raison_mouvements WHERE raison_name = 'Reception fournisseur'), '2026-02-04 10:30:00', 'Reception sacs a dos');

-- ========== MOUVEMENTS DE SORTIE (Type 2) ==========

-- Livraisons clients
INSERT INTO lot_mouvements (lot_id, quantite, type_mouvement_id, raison_id, date_entree, description)
VALUES 
    -- Depot 1 - Sorties ALI-001
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-001-A'), 15, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Livraison client'), '2026-01-27 10:00:00', 'Livraison client VENTE-2026-005'),
    
    -- Depot 1 - Sorties ALI-002
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-002-A'), 50, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Livraison client'), '2026-02-02 11:00:00', 'Livraison diverse'),
    
    -- Depot 1 - Sorties ALI-003
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-003-A'), 20, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Livraison client'), '2026-01-30 14:00:00', 'Livraison farine - Vente 005'),
    
    -- Depot 1 - Sorties ALI-004
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-004-A'), 20, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Livraison client'), '2026-02-01 15:00:00', 'Livraison sucre'),
    
    -- Depot 1 - Sorties ALI-005
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-005-A'), 50, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Livraison client'), '2026-01-31 10:00:00', 'Livraison cafe'),
    
    -- Depot 1 - Sorties Textile
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-011-A'), 50, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Livraison client'), '2026-02-02 09:00:00', 'Livraison T-shirts'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-012-A'), 20, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Livraison client'), '2026-02-03 10:00:00', 'Livraison pantalons - Vente 006'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-013-A'), 20, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Livraison client'), '2026-02-02 11:00:00', 'Livraison chemises - Vente 009'),
    
    -- Depot 1 - Sorties Electronique
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-021-A'), 50, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Livraison client'), '2026-02-03 09:00:00', 'Livraison cables USB - Vente 010'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-022-A'), 20, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Livraison client'), '2026-01-31 11:00:00', 'Livraison souris'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-023-A'), 10, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Livraison client'), '2026-02-01 12:00:00', 'Livraison claviers');

-- Consommations internes
INSERT INTO lot_mouvements (lot_id, quantite, type_mouvement_id, raison_id, date_entree, description)
VALUES 
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-141-A'), 20, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Consommation interne'), '2026-02-01 09:00:00', 'Utilisation bureaux administratifs'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-142-A'), 12, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Consommation interne'), '2026-02-04 14:00:00', 'Fournitures bureaux');

-- Ajustements negatifs (pertes, casse)
INSERT INTO lot_mouvements (lot_id, quantite, type_mouvement_id, raison_id, date_entree, description)
VALUES 
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-206-A'), 15, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Rebut'), '2026-01-28 10:00:00', 'Conserves endommagees lors transport'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-131-A'), 15, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Rebut'), '2026-02-03 11:00:00', 'Flacons casses'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-202-A'), 15, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Ajustement negatif'), '2026-02-01 10:00:00', 'Ecart inventaire');

-- Retours clients (entrees)
INSERT INTO lot_mouvements (lot_id, quantite, type_mouvement_id, raison_id, date_entree, description)
VALUES 
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-214-A'), 2, 1, (SELECT id FROM raison_mouvements WHERE raison_name = 'Retour client'), '2026-02-03 14:00:00', 'Retour produit defectueux'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-208-A'), 1, 1, (SELECT id FROM raison_mouvements WHERE raison_name = 'Retour client'), '2026-02-02 15:00:00', 'Retour lait en poudre');

-- Sorties supplementaires pour Depot 2
INSERT INTO lot_mouvements (lot_id, quantite, type_mouvement_id, raison_id, date_entree, description)
VALUES 
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-101-A'), 10, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Livraison client'), '2026-01-29 11:00:00', 'Livraison locale Antsirabe'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-103-A'), 10, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Livraison client'), '2026-02-01 10:00:00', 'Livraison farine Antsirabe'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-107-A'), 100, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Livraison client'), '2026-02-04 12:00:00', 'Livraison pates - Vente 014'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-132-A'), 15, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Livraison client'), '2026-02-04 11:00:00', 'Livraison gel douche - Vente 013'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-133-A'), 4, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Livraison client'), '2026-02-04 11:30:00', 'Livraison creme visage - Vente 013');

-- Sorties supplementaires pour Depot 3
INSERT INTO lot_mouvements (lot_id, quantite, type_mouvement_id, raison_id, date_entree, description)
VALUES 
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-224-A'), 8, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Livraison client'), '2026-02-03 09:00:00', 'Livraison multiprises - Vente 010'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-225-A'), 2, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Consommation interne'), '2026-02-01 14:00:00', 'Equipement bureaux'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-251-A'), 2, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Consommation interne'), '2026-02-02 08:00:00', 'Nettoyage depots'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-252-A'), 4, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Livraison client'), '2026-02-06 09:00:00', 'Livraison savon - Vente 015'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-261-A'), 8, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Livraison client'), '2026-02-04 11:00:00', 'Livraison sacs a dos - Vente 012'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-216-A'), 1, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Livraison client'), '2026-02-02 11:00:00', 'Livraison veste - Vente 009'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-215-A'), 5, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Consommation interne'), '2026-02-03 10:00:00', 'Distribution personnel'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-234-A'), 4, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Consommation interne'), '2026-02-02 11:00:00', 'Fournitures sanitaires'),
    ((SELECT id FROM lots WHERE numero = 'LOT-2026-243-A'), 5, 2, (SELECT id FROM raison_mouvements WHERE raison_name = 'Consommation interne'), '2026-02-04 09:00:00', 'Materiel bureau');

-- =====================================================
-- 4. RESERVATIONS DE STOCK
-- =====================================================
-- Reservations pour les ventes en cours de preparation

-- Reservation pour Vente 005 (Confirmee)
INSERT INTO stock_reservations (article_id, quantite, date_entree, process_id, reference)
VALUES 
    ((SELECT id FROM articles WHERE refe = 'ALI-003'), 10, '2026-01-27 09:30:00', 
        (SELECT id FROM stock_reservation_processes WHERE abreviation = 'ALL'), 'VENTE-2026-005'),
    ((SELECT id FROM articles WHERE refe = 'ALI-008'), 1, '2026-01-27 09:30:00', 
        (SELECT id FROM stock_reservation_processes WHERE abreviation = 'ALL'), 'VENTE-2026-005');

-- Reservation pour Vente 006 (Confirmee)
INSERT INTO stock_reservations (article_id, quantite, date_entree, process_id, reference)
VALUES 
    ((SELECT id FROM articles WHERE refe = 'TEX-002'), 6, '2026-01-28 10:30:00', 
        (SELECT id FROM stock_reservation_processes WHERE abreviation = 'ALL'), 'VENTE-2026-006'),
    ((SELECT id FROM articles WHERE refe = 'TEX-004'), 2, '2026-01-28 10:30:00', 
        (SELECT id FROM stock_reservation_processes WHERE abreviation = 'ALL'), 'VENTE-2026-006');

-- Reservation pour Vente 007 (En preparation)
INSERT INTO stock_reservations (article_id, quantite, date_entree, process_id, reference)
VALUES 
    ((SELECT id FROM articles WHERE refe = 'PAP-001'), 10, '2026-01-29 09:00:00', 
        (SELECT id FROM stock_reservation_processes WHERE abreviation = 'ALL'), 'VENTE-2026-007'),
    ((SELECT id FROM articles WHERE refe = 'PAP-003'), 5, '2026-01-29 09:00:00', 
        (SELECT id FROM stock_reservation_processes WHERE abreviation = 'ALL'), 'VENTE-2026-007');

-- Reservation pour Vente 008 (Prete)
INSERT INTO stock_reservations (article_id, quantite, date_entree, process_id, reference)
VALUES 
    ((SELECT id FROM articles WHERE refe = 'ALI-004'), 5, '2026-01-30 11:30:00', 
        (SELECT id FROM stock_reservation_processes WHERE abreviation = 'ALL'), 'VENTE-2026-008'),
    ((SELECT id FROM articles WHERE refe = 'ALI-001'), 2, '2026-01-30 11:30:00', 
        (SELECT id FROM stock_reservation_processes WHERE abreviation = 'ALL'), 'VENTE-2026-008'),
    ((SELECT id FROM articles WHERE refe = 'CHI-001'), 2, '2026-01-30 11:30:00', 
        (SELECT id FROM stock_reservation_processes WHERE abreviation = 'ALL'), 'VENTE-2026-008');

-- Reservation pour Vente 012 (Confirmee)
INSERT INTO stock_reservations (article_id, quantite, date_entree, process_id, reference)
VALUES 
    ((SELECT id FROM articles WHERE refe = 'ACC-001'), 8, '2026-02-03 08:30:00', 
        (SELECT id FROM stock_reservation_processes WHERE abreviation = 'ALL'), 'VENTE-2026-012');

-- Reservation pour Vente 013 (En preparation)
INSERT INTO stock_reservations (article_id, quantite, date_entree, process_id, reference)
VALUES 
    ((SELECT id FROM articles WHERE refe = 'COS-002'), 15, '2026-02-04 10:00:00', 
        (SELECT id FROM stock_reservation_processes WHERE abreviation = 'ALL'), 'VENTE-2026-013'),
    ((SELECT id FROM articles WHERE refe = 'COS-003'), 4, '2026-02-04 10:00:00', 
        (SELECT id FROM stock_reservation_processes WHERE abreviation = 'ALL'), 'VENTE-2026-013');

-- Reservation pour Vente 014 (Prete)
INSERT INTO stock_reservations (article_id, quantite, date_entree, process_id, reference)
VALUES 
    ((SELECT id FROM articles WHERE refe = 'ALI-007'), 100, '2026-02-04 12:30:00', 
        (SELECT id FROM stock_reservation_processes WHERE abreviation = 'ALL'), 'VENTE-2026-014'),
    ((SELECT id FROM articles WHERE refe = 'TEX-001'), 8, '2026-02-04 12:30:00', 
        (SELECT id FROM stock_reservation_processes WHERE abreviation = 'ALL'), 'VENTE-2026-014');

-- =====================================================
-- 5. HISTORIQUES DE RESERVATIONS
-- =====================================================
-- Historiques pour les ventes livrees (reservations consommees)

-- Historique Vente 009 (Livree)
INSERT INTO stock_reservations (article_id, quantite, date_entree, process_id, reference)
VALUES 
    ((SELECT id FROM articles WHERE refe = 'TEX-003'), 8, '2026-01-31 09:30:00', 
        (SELECT id FROM stock_reservation_processes WHERE abreviation = 'CON'), 'VENTE-2026-009'),
    ((SELECT id FROM articles WHERE refe = 'TEX-006'), 1, '2026-01-31 09:30:00', 
        (SELECT id FROM stock_reservation_processes WHERE abreviation = 'CON'), 'VENTE-2026-009');

INSERT INTO stock_reservation_historiques (date_entree, stock_id, process_id)
SELECT '2026-01-31 09:30:00', id, (SELECT id FROM stock_reservation_processes WHERE abreviation = 'RES')
FROM stock_reservations WHERE reference = 'VENTE-2026-009';

INSERT INTO stock_reservation_historiques (date_entree, stock_id, process_id)
SELECT '2026-01-31 14:00:00', id, (SELECT id FROM stock_reservation_processes WHERE abreviation = 'ALL')
FROM stock_reservations WHERE reference = 'VENTE-2026-009';

INSERT INTO stock_reservation_historiques (date_entree, stock_id, process_id)
SELECT '2026-02-02 11:00:00', id, (SELECT id FROM stock_reservation_processes WHERE abreviation = 'CON')
FROM stock_reservations WHERE reference = 'VENTE-2026-009';

-- Historique Vente 010 (Livree)
INSERT INTO stock_reservations (article_id, quantite, date_entree, process_id, reference)
VALUES 
    ((SELECT id FROM articles WHERE refe = 'ELE-001'), 20, '2026-02-01 10:30:00', 
        (SELECT id FROM stock_reservation_processes WHERE abreviation = 'CON'), 'VENTE-2026-010'),
    ((SELECT id FROM articles WHERE refe = 'ELE-004'), 8, '2026-02-01 10:30:00', 
        (SELECT id FROM stock_reservation_processes WHERE abreviation = 'CON'), 'VENTE-2026-010');

INSERT INTO stock_reservation_historiques (date_entree, stock_id, process_id)
SELECT '2026-02-01 10:30:00', id, (SELECT id FROM stock_reservation_processes WHERE abreviation = 'RES')
FROM stock_reservations WHERE reference = 'VENTE-2026-010';

INSERT INTO stock_reservation_historiques (date_entree, stock_id, process_id)
SELECT '2026-02-01 15:00:00', id, (SELECT id FROM stock_reservation_processes WHERE abreviation = 'ALL')
FROM stock_reservations WHERE reference = 'VENTE-2026-010';

INSERT INTO stock_reservation_historiques (date_entree, stock_id, process_id)
SELECT '2026-02-03 09:00:00', id, (SELECT id FROM stock_reservation_processes WHERE abreviation = 'CON')
FROM stock_reservations WHERE reference = 'VENTE-2026-010';

-- Historique Vente 015 (Livree)
INSERT INTO stock_reservations (article_id, quantite, date_entree, process_id, reference)
VALUES 
    ((SELECT id FROM articles WHERE refe = 'PAP-002'), 12, '2026-02-04 14:30:00', 
        (SELECT id FROM stock_reservation_processes WHERE abreviation = 'CON'), 'VENTE-2026-015'),
    ((SELECT id FROM articles WHERE refe = 'CHI-002'), 4, '2026-02-04 14:30:00', 
        (SELECT id FROM stock_reservation_processes WHERE abreviation = 'CON'), 'VENTE-2026-015');

INSERT INTO stock_reservation_historiques (date_entree, stock_id, process_id)
SELECT '2026-02-04 14:30:00', id, (SELECT id FROM stock_reservation_processes WHERE abreviation = 'RES')
FROM stock_reservations WHERE reference = 'VENTE-2026-015';

INSERT INTO stock_reservation_historiques (date_entree, stock_id, process_id)
SELECT '2026-02-04 16:00:00', id, (SELECT id FROM stock_reservation_processes WHERE abreviation = 'ALL')
FROM stock_reservations WHERE reference = 'VENTE-2026-015';

INSERT INTO stock_reservation_historiques (date_entree, stock_id, process_id)
SELECT '2026-02-06 09:00:00', id, (SELECT id FROM stock_reservation_processes WHERE abreviation = 'CON')
FROM stock_reservations WHERE reference = 'VENTE-2026-015';

-- =====================================================
-- 6. INVENTAIRES
-- =====================================================

-- Inventaire 1: Depot Central Antananarivo (Valide)
INSERT INTO inventaires (utilisateur_id, date_entree, depot_id, details)
VALUES ((SELECT id FROM utilisateurs WHERE nom = 'Nivo Patrick'), 
        '2026-01-31 08:00:00', 1, 'Inventaire mensuel janvier 2026');

-- Inventaire 2: Depot Regional Antsirabe (En cours)
INSERT INTO inventaires (utilisateur_id, date_entree, depot_id, details)
VALUES ((SELECT id FROM utilisateurs WHERE nom = 'Faly Julie'), 
        '2026-02-03 09:00:00', 2, 'Inventaire debut fevrier 2026');

-- Inventaire 3: Depot Annexe Toamasina (Valide)
INSERT INTO inventaires (utilisateur_id, date_entree, depot_id, details)
VALUES ((SELECT id FROM utilisateurs WHERE nom = 'Toky David'), 
        '2026-02-01 10:00:00', 3, 'Inventaire tournant fevrier 2026');

-- =====================================================
-- 7. LIGNES D'INVENTAIRE
-- =====================================================

-- Lignes inventaire 1 (Depot 1)
INSERT INTO inventaire_lignes (inventaire_id, article_id, quantite)
VALUES 
    -- Alimentaire Depot 1
    ((SELECT id FROM inventaires WHERE details = 'Inventaire mensuel janvier 2026'), (SELECT id FROM articles WHERE refe = 'ALI-001'), 235),
    ((SELECT id FROM inventaires WHERE details = 'Inventaire mensuel janvier 2026'), (SELECT id FROM articles WHERE refe = 'ALI-002'), 250),
    ((SELECT id FROM inventaires WHERE details = 'Inventaire mensuel janvier 2026'), (SELECT id FROM articles WHERE refe = 'ALI-003'), 180),
    ((SELECT id FROM inventaires WHERE details = 'Inventaire mensuel janvier 2026'), (SELECT id FROM articles WHERE refe = 'ALI-004'), 330),
    ((SELECT id FROM inventaires WHERE details = 'Inventaire mensuel janvier 2026'), (SELECT id FROM articles WHERE refe = 'ALI-005'), 450),
    -- Textile Depot 1
    ((SELECT id FROM inventaires WHERE details = 'Inventaire mensuel janvier 2026'), (SELECT id FROM articles WHERE refe = 'TEX-001'), 850),
    ((SELECT id FROM inventaires WHERE details = 'Inventaire mensuel janvier 2026'), (SELECT id FROM articles WHERE refe = 'TEX-002'), 330),
    ((SELECT id FROM inventaires WHERE details = 'Inventaire mensuel janvier 2026'), (SELECT id FROM articles WHERE refe = 'TEX-003'), 230),
    -- Electronique Depot 1
    ((SELECT id FROM inventaires WHERE details = 'Inventaire mensuel janvier 2026'), (SELECT id FROM articles WHERE refe = 'ELE-001'), 1450),
    ((SELECT id FROM inventaires WHERE details = 'Inventaire mensuel janvier 2026'), (SELECT id FROM articles WHERE refe = 'ELE-002'), 280),
    ((SELECT id FROM inventaires WHERE details = 'Inventaire mensuel janvier 2026'), (SELECT id FROM articles WHERE refe = 'ELE-003'), 190);

-- Lignes inventaire 2 (Depot 2)
INSERT INTO inventaire_lignes (inventaire_id, article_id, quantite)
VALUES 
    -- Alimentaire Depot 2
    ((SELECT id FROM inventaires WHERE details = 'Inventaire debut fevrier 2026'), (SELECT id FROM articles WHERE refe = 'ALI-001'), 70),
    ((SELECT id FROM inventaires WHERE details = 'Inventaire debut fevrier 2026'), (SELECT id FROM articles WHERE refe = 'ALI-003'), 50),
    ((SELECT id FROM inventaires WHERE details = 'Inventaire debut fevrier 2026'), (SELECT id FROM articles WHERE refe = 'ALI-007'), 400),
    -- Cosmetique Depot 2
    ((SELECT id FROM inventaires WHERE details = 'Inventaire debut fevrier 2026'), (SELECT id FROM articles WHERE refe = 'COS-001'), 385),
    ((SELECT id FROM inventaires WHERE details = 'Inventaire debut fevrier 2026'), (SELECT id FROM articles WHERE refe = 'COS-002'), 285),
    ((SELECT id FROM inventaires WHERE details = 'Inventaire debut fevrier 2026'), (SELECT id FROM articles WHERE refe = 'COS-003'), 146),
    -- Papeterie Depot 2
    ((SELECT id FROM inventaires WHERE details = 'Inventaire debut fevrier 2026'), (SELECT id FROM articles WHERE refe = 'PAP-001'), 280),
    ((SELECT id FROM inventaires WHERE details = 'Inventaire debut fevrier 2026'), (SELECT id FROM articles WHERE refe = 'PAP-002'), 88);

-- Lignes inventaire 3 (Depot 3)
INSERT INTO inventaire_lignes (inventaire_id, article_id, quantite)
VALUES 
    -- Alimentaire Depot 3
    ((SELECT id FROM inventaires WHERE details = 'Inventaire tournant fevrier 2026'), (SELECT id FROM articles WHERE refe = 'ALI-002'), 135),
    ((SELECT id FROM inventaires WHERE details = 'Inventaire tournant fevrier 2026'), (SELECT id FROM articles WHERE refe = 'ALI-006'), 585),
    ((SELECT id FROM inventaires WHERE details = 'Inventaire tournant fevrier 2026'), (SELECT id FROM articles WHERE refe = 'ALI-008'), 99),
    -- Electronique Depot 3
    ((SELECT id FROM inventaires WHERE details = 'Inventaire tournant fevrier 2026'), (SELECT id FROM articles WHERE refe = 'ELE-004'), 242),
    ((SELECT id FROM inventaires WHERE details = 'Inventaire tournant fevrier 2026'), (SELECT id FROM articles WHERE refe = 'ELE-005'), 148),
    -- Chimique Depot 3
    ((SELECT id FROM inventaires WHERE details = 'Inventaire tournant fevrier 2026'), (SELECT id FROM articles WHERE refe = 'CHI-001'), 198),
    ((SELECT id FROM inventaires WHERE details = 'Inventaire tournant fevrier 2026'), (SELECT id FROM articles WHERE refe = 'CHI-002'), 176),
    -- Accessoires Depot 3
    ((SELECT id FROM inventaires WHERE details = 'Inventaire tournant fevrier 2026'), (SELECT id FROM articles WHERE refe = 'ACC-001'), 92),
    -- Textile Depot 3
    ((SELECT id FROM inventaires WHERE details = 'Inventaire tournant fevrier 2026'), (SELECT id FROM articles WHERE refe = 'TEX-004'), 118),
    ((SELECT id FROM inventaires WHERE details = 'Inventaire tournant fevrier 2026'), (SELECT id FROM articles WHERE refe = 'TEX-005'), 295),
    ((SELECT id FROM inventaires WHERE details = 'Inventaire tournant fevrier 2026'), (SELECT id FROM articles WHERE refe = 'TEX-006'), 79),
    -- Cosmetique Depot 3
    ((SELECT id FROM inventaires WHERE details = 'Inventaire tournant fevrier 2026'), (SELECT id FROM articles WHERE refe = 'COS-004'), 396),
    -- Papeterie Depot 3
    ((SELECT id FROM inventaires WHERE details = 'Inventaire tournant fevrier 2026'), (SELECT id FROM articles WHERE refe = 'PAP-003'), 195);

-- =====================================================
-- 8. HISTORIQUES D'INVENTAIRE
-- =====================================================

-- Historique inventaire 1 (Creation -> Validation -> Cloture)
INSERT INTO inventaire_historiques (date_entree, inventaire_id, process_id, utilisateur_id)
VALUES 
    ('2026-01-31 08:00:00', 
        (SELECT id FROM inventaires WHERE details = 'Inventaire mensuel janvier 2026'),
        (SELECT id FROM inventaire_process WHERE abreviation = 'CRE'),
        (SELECT id FROM utilisateurs WHERE nom = 'Nivo Patrick')),
    ('2026-01-31 16:00:00', 
        (SELECT id FROM inventaires WHERE details = 'Inventaire mensuel janvier 2026'),
        (SELECT id FROM inventaire_process WHERE abreviation = 'VAL'),
        (SELECT id FROM utilisateurs WHERE nom = 'Nivo Patrick')),
    ('2026-01-31 17:00:00', 
        (SELECT id FROM inventaires WHERE details = 'Inventaire mensuel janvier 2026'),
        (SELECT id FROM inventaire_process WHERE abreviation = 'CLO'),
        (SELECT id FROM utilisateurs WHERE nom = 'Admin Principal'));

-- Historique inventaire 2 (Creation -> En cours)
INSERT INTO inventaire_historiques (date_entree, inventaire_id, process_id, utilisateur_id)
VALUES 
    ('2026-02-03 09:00:00', 
        (SELECT id FROM inventaires WHERE details = 'Inventaire debut fevrier 2026'),
        (SELECT id FROM inventaire_process WHERE abreviation = 'CRE'),
        (SELECT id FROM utilisateurs WHERE nom = 'Faly Julie'));

-- Historique inventaire 3 (Creation -> Validation -> Cloture)
INSERT INTO inventaire_historiques (date_entree, inventaire_id, process_id, utilisateur_id)
VALUES 
    ('2026-02-01 10:00:00', 
        (SELECT id FROM inventaires WHERE details = 'Inventaire tournant fevrier 2026'),
        (SELECT id FROM inventaire_process WHERE abreviation = 'CRE'),
        (SELECT id FROM utilisateurs WHERE nom = 'Toky David')),
    ('2026-02-01 14:00:00', 
        (SELECT id FROM inventaires WHERE details = 'Inventaire tournant fevrier 2026'),
        (SELECT id FROM inventaire_process WHERE abreviation = 'VAL'),
        (SELECT id FROM utilisateurs WHERE nom = 'Toky David')),
    ('2026-02-01 15:30:00', 
        (SELECT id FROM inventaires WHERE details = 'Inventaire tournant fevrier 2026'),
        (SELECT id FROM inventaire_process WHERE abreviation = 'CLO'),
        (SELECT id FROM utilisateurs WHERE nom = 'Admin Principal'));

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
-- RESUME DES DONNEES CREEES:
-- - 36 lots repartis dans 3 depots avec des prix differents
-- - 65+ mouvements de lots (entrees, sorties, ajustements)
-- - 15 reservations de stock pour les ventes
-- - 18 historiques de reservations
-- - 3 inventaires (2 clotures, 1 en cours)
-- - 32 lignes d'inventaire
-- - 7 historiques d'inventaire
-- 
-- Les quantites sont coherentes:
-- - quantite_restante = quantite initiale - sorties + retours
-- - Les inventaires refletent les quantites restantes
-- - Les reservations correspondent aux ventes en cours
-- =====================================================

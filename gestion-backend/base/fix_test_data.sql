-- =====================================================
-- SCRIPT DE CORRECTION - test_data.sql
-- Execute apres clean_data.sql et test_data.sql (partiellement)
-- =====================================================

-- =====================================================
-- 1. INSERTION DES VENTES AVEC CLIENT_ID
-- =====================================================

-- Vente 1: Decembre 2025 - Livree (client_id = 1, de proforma 1)
INSERT INTO ventes (refe, date_entree, proforma_id, client_id, date_effective, date_livraison, location_livraison, prix_total, remise_pourcentage, process_id) VALUES
('VTE-2025-0001', '2025-12-08 10:00:00', 1, 1, '2025-12-08', '2025-12-10', 'Lot II A 12, Antananarivo', 807500.00, 5.00, 9);
INSERT INTO vente_lignes (vente_id, article_id, quantite, prix_unitaire, remise_pourcentage) VALUES
(1, 1, 10, 45000.00, 0),
(1, 8, 5, 75000.00, 5.00);

INSERT INTO vente_historiques (date_entree, vente_id, process_id) VALUES
('2025-12-08 10:00:00', 1, 6),
('2025-12-08 14:00:00', 1, 7),
('2025-12-09 09:00:00', 1, 8),
('2025-12-10 11:00:00', 1, 9);

-- Vente 2: Decembre 2025 - Livree (client_id = 2, de proforma 2)
INSERT INTO ventes (refe, date_entree, proforma_id, client_id, date_effective, date_livraison, location_livraison, prix_total, process_id) VALUES
('VTE-2025-0002', '2025-12-15 09:30:00', 2, 2, '2025-12-15', '2025-12-18', 'Zone Industrielle, Antsirabe', 425000.00, 9);
INSERT INTO vente_lignes (vente_id, article_id, quantite, prix_unitaire) VALUES
(2, 3, 5, 85000.00);

INSERT INTO vente_historiques (date_entree, vente_id, process_id) VALUES
('2025-12-15 09:30:00', 2, 6),
('2025-12-16 10:00:00', 2, 7),
('2025-12-17 14:00:00', 2, 8),
('2025-12-18 16:00:00', 2, 9);

-- Vente 3: Janvier 2026 - Livree (client_id = 3, de proforma 3)
INSERT INTO ventes (refe, date_entree, proforma_id, client_id, date_effective, date_livraison, location_livraison, prix_total, remise_pourcentage, process_id) VALUES
('VTE-2026-0001', '2026-01-10 11:00:00', 3, 3, '2026-01-10', '2026-01-15', 'Rue du Commerce, Toamasina', 990000.00, 10.00, 9);
INSERT INTO vente_lignes (vente_id, article_id, quantite, prix_unitaire, remise_pourcentage) VALUES
(3, 7, 5, 220000.00, 10.00);

INSERT INTO vente_historiques (date_entree, vente_id, process_id) VALUES
('2026-01-10 11:00:00', 3, 6),
('2026-01-11 09:00:00', 3, 7),
('2026-01-13 14:00:00', 3, 8),
('2026-01-15 10:00:00', 3, 9);

-- Vente 4: Janvier 2026 - En preparation (client_id = 4, de proforma 4)
INSERT INTO ventes (refe, date_entree, proforma_id, client_id, date_effective, date_livraison, location_livraison, prix_total, process_id) VALUES
('VTE-2026-0002', '2026-01-20 14:00:00', 4, 4, '2026-01-20', '2026-01-25', 'Avenue de la Technologie, Antananarivo', 350000.00, 7);
INSERT INTO vente_lignes (vente_id, article_id, quantite, prix_unitaire) VALUES
(4, 11, 10, 35000.00);

INSERT INTO vente_historiques (date_entree, vente_id, process_id) VALUES
('2026-01-20 14:00:00', 4, 6),
('2026-01-21 10:00:00', 4, 7);

-- Vente 5: Janvier 2026 - Confirmee (client_id = 5, association)
INSERT INTO ventes (refe, date_entree, proforma_id, client_id, date_effective, date_livraison, location_livraison, prix_total, process_id) VALUES
('VTE-2026-0003', '2026-01-18 09:00:00', 4, 5, '2026-01-18', '2026-01-22', 'Quartier Isoraka, Antananarivo', 175000.00, 6);
INSERT INTO vente_lignes (vente_id, article_id, quantite, prix_unitaire) VALUES
(5, 11, 5, 35000.00);

INSERT INTO vente_historiques (date_entree, vente_id, process_id) VALUES
('2026-01-18 09:00:00', 5, 6);

-- Vente 6: Janvier 2026 - Annulee (client_id = 6)
INSERT INTO ventes (refe, date_entree, proforma_id, client_id, date_effective, date_livraison, location_livraison, prix_total, process_id) VALUES
('VTE-2026-0004', '2026-01-25 10:00:00', 3, 6, '2026-01-25', '2026-01-28', 'Analakely, Antananarivo', 440000.00, 10);
INSERT INTO vente_lignes (vente_id, article_id, quantite, prix_unitaire) VALUES
(6, 7, 2, 220000.00);

INSERT INTO vente_historiques (date_entree, vente_id, process_id) VALUES
('2026-01-25 10:00:00', 6, 6),
('2026-01-26 11:00:00', 6, 10);

-- =====================================================
-- 2. LIVRAISONS VENTES (maintenant que les ventes existent)
-- =====================================================

-- Livraison Vente 1
INSERT INTO livraison_ventes (vente_id, process_id, date_entree, refe) VALUES
(1, 3, '2025-12-10 10:00:00', 'LIV-2025-0001');
INSERT INTO livraison_vente_lignes (livraison_id, article_id, quantite) VALUES
(1, 1, 10),
(1, 8, 5);

INSERT INTO livraison_vente_historiques (date_entree, livraison_id, process_id) VALUES
('2025-12-09 14:00:00', 1, 1),
('2025-12-10 10:00:00', 1, 3);

-- Livraison Vente 2
INSERT INTO livraison_ventes (vente_id, process_id, date_entree, refe) VALUES
(2, 3, '2025-12-18 14:00:00', 'LIV-2025-0002');
INSERT INTO livraison_vente_lignes (livraison_id, article_id, quantite) VALUES
(2, 3, 5);

INSERT INTO livraison_vente_historiques (date_entree, livraison_id, process_id) VALUES
('2025-12-17 10:00:00', 2, 1),
('2025-12-18 14:00:00', 2, 3);

-- Livraison Vente 3
INSERT INTO livraison_ventes (vente_id, process_id, date_entree, refe) VALUES
(3, 3, '2026-01-15 09:00:00', 'LIV-2026-0001');
INSERT INTO livraison_vente_lignes (livraison_id, article_id, quantite) VALUES
(3, 7, 5);

INSERT INTO livraison_vente_historiques (date_entree, livraison_id, process_id) VALUES
('2026-01-14 14:00:00', 3, 1),
('2026-01-15 09:00:00', 3, 3);

-- Livraison Vente 4 (en preparation)
INSERT INTO livraison_ventes (vente_id, process_id, date_entree, refe) VALUES
(4, 1, '2026-01-22 10:00:00', 'LIV-2026-0002');
INSERT INTO livraison_vente_lignes (livraison_id, article_id, quantite) VALUES
(4, 11, 10);

INSERT INTO livraison_vente_historiques (date_entree, livraison_id, process_id) VALUES
('2026-01-22 10:00:00', 4, 1);

-- =====================================================
-- 3. AUDIT LOGS (avec action_id valides)
-- Utilise les actions existantes dans clean_data.sql
-- =====================================================

INSERT INTO audit_logs (utilisateur_id, action_id, classes, ids_classes, action_timestamp, details) VALUES
-- Creations achats (action 9 = Creer achat)
(3, 9, 'achats', '1', '2025-12-01 09:00:00', 'Creation demande achat ACH-2025-0001'),
(4, 9, 'achats', '2', '2025-12-10 10:30:00', 'Creation demande achat ACH-2025-0002'),
-- Validations (action 5 = Valider)
(7, 5, 'achats', '1', '2025-12-01 14:00:00', 'Validation magasinier ACH-2025-0001'),
(9, 5, 'achats', '1', '2025-12-02 10:00:00', 'Validation comptable ACH-2025-0001'),
-- Receptions (action 13 = Reception)
(12, 13, 'reception_achats', '1', '2025-12-10 09:00:00', 'Reception marchandises ACH-2025-0001'),
-- Ventes (action 21 = Creer proforma vente, action 22 = Confirmer vente)
(5, 21, 'proforma_ventes', '1', '2025-12-05 10:00:00', 'Creation devis PRO-VTE-2025-0001'),
(5, 22, 'ventes', '1', '2025-12-08 10:00:00', 'Confirmation vente VTE-2025-0001'),
-- Livraisons (action 24 = Livrer)
(8, 24, 'livraison_ventes', '1', '2025-12-10 10:00:00', 'Livraison VTE-2025-0001'),
-- Inventaires (action 19 = Creer inventaire, action 20 = Valider inventaire)
(12, 19, 'inventaires', '1', '2025-12-28 08:00:00', 'Creation inventaire Depot 1'),
(7, 20, 'inventaires', '1', '2025-12-28 14:00:00', 'Validation inventaire Depot 1'),
-- Annulation (action 8 = Annuler)
(5, 8, 'ventes', '6', '2026-01-26 11:00:00', 'Annulation vente VTE-2026-0004');

-- =====================================================
-- 4. MISE A JOUR DES QUANTITES RESTANTES (lots initiaux)
-- =====================================================

UPDATE lots SET quantite_restante = 190 WHERE numero = 'LOT-VET-0001-001';      -- -10 ventes
UPDATE lots SET quantite_restante = 145 WHERE numero = 'LOT-PARF-0001-001';     -- -5 ventes
UPDATE lots SET quantite_restante = 145 WHERE numero = 'LOT-PARF-0002-001';     -- -5 rebut, +30 reception
UPDATE lots SET quantite_restante = 45 WHERE numero = 'LOT-ACC-0001-001';       -- -5 ventes
UPDATE lots SET quantite_restante = 135 WHERE numero = 'LOT-CHAUSS-0001-001';   -- -5 ventes, -10 transfert
UPDATE lots SET quantite_restante = 235 WHERE numero = 'LOT-MAQ-0001-001';      -- -15 reserves
UPDATE lots SET quantite_restante = 480 WHERE numero = 'LOT-REF001-001';        -- -20 ventes
UPDATE lots SET quantite_restante = 980 WHERE numero = 'LOT-REF009-001';        -- -20 conso interne

-- =====================================================
-- 5. LOTS AVEC DATES DE PEREMPTION PROCHES (pour alertes)
-- =====================================================

INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot) VALUES
('LOT-COS-0001-003', 5, 1, '2025-06-01 10:00:00', '2026-02-15', 50, 45, 21000.00, 'ACTIF'),       -- DLUO proche
('LOT-SOIN-0001-002', 10, 1, '2025-03-01 10:00:00', '2026-02-10', 100, 30, 12000.00, 'EXPIRE_DLUO'), -- DLUO depassee
('LOT-REF001-003', 12, 2, '2025-08-01 10:00:00', '2026-02-05', 150, 80, 2400.00, 'BLOQUE');      -- Bloque manuellement

-- =====================================================
-- FIN DU SCRIPT DE CORRECTION
-- =====================================================

-- =====================================================
-- SCRIPT DE DONNEES DE TEST - GestionEntreprise
-- Simulation d'utilisation reelle du système
-- Donnees pour tester: Achats, Ventes, Stock, Inventaires, KPIs
-- =====================================================

-- =====================================================
-- PREREQUIS: Executer clean_data.sql d'abord
-- =====================================================

-- =====================================================
-- MAPPING UTILISATEURS EXISTANTS:
-- 1: admin@gestion.mg - Admin
-- 2: admin@gmail.com - Admin
-- 3: resp_achat@gmail.com - Responsable Achat
-- 4: emp_achat@gmail.com - Employe Achat
-- 5: resp_vente@gmail.com - Responsable Vente
-- 6: emp_vente@gmail.com - Employe Vente
-- 7: resp_magasin@gmail.com - Responsable Magasin
-- 8: emp_magasin@gmail.com - Employe Magasin
-- 9: resp_finance@gmail.com - Responsable Finance
-- 10: emp_finance@gmail.com - Employe Finance
-- 11: resp_direction@gmail.com - Responsable Direction
-- 12: magrecept@gmail.com - Magasinier Reception
-- =====================================================

-- =====================================================
-- 1. CLIENTS
-- =====================================================
INSERT INTO clients (client_nom, contact, adresse, coordonnee_bancaire) VALUES
('SARL Andry & Co', 'Tel:+261341234567; contact@andryco.mg', 'Lot II A 12, Antananarivo', 'BIC:BNGMMGXXXX - ACC: 1234567890'),
('Societe FitLine', 'Tel:+261320345678; sales@fitline.mg', 'Zone Industrielle, Antsirabe', 'BIC:BFITMGXXX - ACC: 9876543210'),
('Ets Rakoto Import', 'Tel:+261202233344; contact@rakoto.mg', 'Rue du Commerce, Toamasina', 'BIC:ERAKMGXXX - ACC: 1122334455'),
('Compagnie MadaTech', 'Tel:+261341112223; info@madatech.mg', 'Avenue de la Technologie, Antananarivo', 'BIC:MDTMGXXX - ACC: 5566778899'),
('Association Solidarite', 'Tel:+261333224455; hello@solidarite.mg', 'Quartier Isoraka, Antananarivo', ''),
('Rajaonarimampianina H.', 'Tel:+261345678901; raja.h@example.mg', 'Analakely, Antananarivo', ''),
('Randriamamonjy S.', 'Tel:+261331234567; s.randria@example.mg', 'Ambohijatovo, Antananarivo', ''),
('Rasoa R.', 'Tel:+261334455666; rasoa.r@example.mg', 'Antsirabe Centre', ''),
('Andriamanana T.', 'Tel:+261339998877; tandria@example.mg', 'Toamasina, Rue des Fleurs', ''),
('Mme. Vololona N.', 'Tel:+261327776655; vololona.n@example.mg', 'Fianarantsoa, Rue Principale', '');

-- =====================================================
-- 2. FOURNISSEURS
-- =====================================================
INSERT INTO fournisseurs (fournisseur_nom, contact, adresse, coordonnee_bancaire) VALUES
('Fournisseur A', '0310031102', '123 Rue Principale, Ville A', 'FR76 1234 5678 9012 3456 7890 123'),
('Fournisseur B', '0232112141', '456 Avenue des Champs, Ville B', 'FR98 0987 6543 2109 8765 4321 098'),
('Fournisseur C', '1012412042', '789 Boulevard Central, Ville C', 'FR12 3456 7890 1234 5678 9012 345'),
('Madagascar Textile SARL', 'Tel:+261341234567; textile@madatex.mg', 'Zone Industrielle, Antsirabe', 'BIC:BNGMMGXXXX - ACC: 1234567899'),
('Parfums Import Co', 'Tel:+261320345678; contact@parfumsimport.mg', 'Analakely, Antananarivo', 'BIC:BFITMGXXX - ACC: 9876543210'),
('Cosmetik Pro', 'Tel:+261202233344; info@cosmetikpro.mg', 'Rue du Commerce, Toamasina', 'BIC:ERAKMGXXX - ACC: 1122334455');

-- =====================================================
-- 3. DEMANDES D'ACHATS (Simulation sur 3 mois)
-- =====================================================

-- Achat 1: Decembre 2025 - Cloture (demandeur: Responsable Achat)
INSERT INTO achats (date_entree, demandeur, date_effective, process_id, refe) VALUES
('2025-12-01 09:00:00', 3, '2025-12-05', 7, 'ACH-2025-0001');
INSERT INTO achat_lignes (achat_id, article_id, quantite, prix_unitaire, prix_unitaire_estime) VALUES
(1, 1, 50, 40000.00, 42000.00),  -- Jean Slim
(1, 3, 30, 75000.00, 80000.00);  -- Eau de Parfum

INSERT INTO achat_historiques (date_entree, achat_id, process_id) VALUES
('2025-12-01 09:00:00', 1, 1),
('2025-12-01 14:00:00', 1, 2),
('2025-12-02 10:00:00', 1, 3),
('2025-12-03 09:00:00', 1, 4),
('2025-12-10 11:00:00', 1, 5),
('2025-12-15 14:00:00', 1, 6),
('2025-12-20 16:00:00', 1, 7);

-- Achat 2: Decembre 2025 - Cloture (demandeur: Employe Achat)
INSERT INTO achats (date_entree, demandeur, date_effective, process_id, refe) VALUES
('2025-12-10 10:30:00', 4, '2025-12-15', 7, 'ACH-2025-0002');
INSERT INTO achat_lignes (achat_id, article_id, quantite, prix_unitaire, prix_unitaire_estime) VALUES
(2, 12, 200, 2200.00, 2500.00),  -- Sucre
(2, 14, 150, 10000.00, 12000.00); -- Riz basmati

INSERT INTO achat_historiques (date_entree, achat_id, process_id) VALUES
('2025-12-10 10:30:00', 2, 1),
('2025-12-11 09:00:00', 2, 2),
('2025-12-12 11:00:00', 2, 3),
('2025-12-13 14:00:00', 2, 4),
('2025-12-18 10:00:00', 2, 5),
('2025-12-22 15:00:00', 2, 6),
('2025-12-28 11:00:00', 2, 7);

-- Achat 3: Janvier 2026 - En commande (demandeur: Responsable Achat)
INSERT INTO achats (date_entree, demandeur, date_effective, process_id, refe) VALUES
('2026-01-05 08:30:00', 3, '2026-01-10', 4, 'ACH-2026-0001');
INSERT INTO achat_lignes (achat_id, article_id, quantite, prix_unitaire, prix_unitaire_estime) VALUES
(3, 5, 100, 20000.00, 22000.00),  -- Creme Visage
(3, 10, 200, 11000.00, 12500.00); -- Lotion Corps

INSERT INTO achat_historiques (date_entree, achat_id, process_id) VALUES
('2026-01-05 08:30:00', 3, 1),
('2026-01-06 10:00:00', 3, 2),
('2026-01-07 14:00:00', 3, 3),
('2026-01-08 09:00:00', 3, 4);

-- Achat 4: Janvier 2026 - Valide comptable (demandeur: Employe Achat)
INSERT INTO achats (date_entree, demandeur, date_effective, process_id, refe) VALUES
('2026-01-15 11:00:00', 4, '2026-01-20', 3, 'ACH-2026-0002');
INSERT INTO achat_lignes (achat_id, article_id, quantite, prix_unitaire, prix_unitaire_estime) VALUES
(4, 7, 25, 200000.00, 220000.00), -- Sac Cabas
(4, 8, 60, 70000.00, 75000.00);   -- Sneakers

INSERT INTO achat_historiques (date_entree, achat_id, process_id) VALUES
('2026-01-15 11:00:00', 4, 1),
('2026-01-16 09:30:00', 4, 2),
('2026-01-17 14:00:00', 4, 3);

-- Achat 5: Janvier 2026 - Cree (en attente) (demandeur: Responsable Achat)
INSERT INTO achats (date_entree, demandeur, date_effective, process_id, refe) VALUES
('2026-01-25 09:00:00', 3, '2026-01-30', 1, 'ACH-2026-0003');
INSERT INTO achat_lignes (achat_id, article_id, quantite, prix_unitaire, prix_unitaire_estime) VALUES
(5, 19, 500, 450.00, 500.00),    -- Stylo bille
(5, 20, 50, 14000.00, 15000.00); -- Agrafeuse

INSERT INTO achat_historiques (date_entree, achat_id, process_id) VALUES
('2026-01-25 09:00:00', 5, 1);

-- Achat 6: Fevrier 2026 - Annule (demandeur: Employe Achat)
INSERT INTO achats (date_entree, demandeur, date_effective, process_id, refe) VALUES
('2026-02-01 10:00:00', 4, '2026-02-05', 8, 'ACH-2026-0004');
INSERT INTO achat_lignes (achat_id, article_id, quantite, prix_unitaire, prix_unitaire_estime) VALUES
(6, 23, 100, 2800.00, 3000.00);  -- Pile AA

INSERT INTO achat_historiques (date_entree, achat_id, process_id) VALUES
('2026-02-01 10:00:00', 6, 1),
('2026-02-01 15:00:00', 6, 8);

-- =====================================================
-- 3. PROFORMA ACHATS & BONS DE COMMANDE
-- =====================================================

-- Proforma pour Achat 1
INSERT INTO proforma_achats (achat_id, fournisseur_id, date_entree, montant_total, refe) VALUES
(1, 4, '2025-12-02 14:00:00', 4250000.00, 'PRO-ACH-2025-0001');
INSERT INTO proforma_achat_lignes (proforma_id, article_id, quantite, prix_unitaire) VALUES
(1, 1, 50, 40000.00),
(1, 3, 30, 75000.00);

-- Bon de commande pour Achat 1
INSERT INTO bon_commandes_achats (proforma_id, date_entree, montant_total, process_id, refe) VALUES
(1, '2025-12-03 10:00:00', 4250000.00, 5, 'BC-2025-0001');
INSERT INTO bon_commande_achat_lignes (bon_commande_id, article_id, quantite, prix_unitaire) VALUES
(1, 1, 50, 40000.00),
(1, 3, 30, 75000.00);

INSERT INTO bon_commande_historiques (date_entree, bon_commande_id, process_id) VALUES
('2025-12-03 10:00:00', 1, 1),
('2025-12-04 09:00:00', 1, 2),
('2025-12-05 11:00:00', 1, 3),
('2025-12-10 14:00:00', 1, 4),
('2025-12-15 16:00:00', 1, 5);

-- Proforma pour Achat 2
INSERT INTO proforma_achats (achat_id, fournisseur_id, date_entree, montant_total, refe) VALUES
(2, 1, '2025-12-13 11:00:00', 1940000.00, 'PRO-ACH-2025-0002');
INSERT INTO proforma_achat_lignes (proforma_id, article_id, quantite, prix_unitaire) VALUES
(2, 12, 200, 2200.00),
(2, 14, 150, 10000.00);

-- Bon de commande pour Achat 2
INSERT INTO bon_commandes_achats (proforma_id, date_entree, montant_total, process_id, refe) VALUES
(2, '2025-12-14 09:00:00', 1940000.00, 5, 'BC-2025-0002');
INSERT INTO bon_commande_achat_lignes (bon_commande_id, article_id, quantite, prix_unitaire) VALUES
(2, 12, 200, 2200.00),
(2, 14, 150, 10000.00);

INSERT INTO bon_commande_historiques (date_entree, bon_commande_id, process_id) VALUES
('2025-12-14 09:00:00', 2, 1),
('2025-12-15 10:00:00', 2, 2),
('2025-12-16 14:00:00', 2, 3),
('2025-12-20 11:00:00', 2, 4),
('2025-12-24 15:00:00', 2, 5);

-- Proforma pour Achat 3 (en cours)
INSERT INTO proforma_achats (achat_id, fournisseur_id, date_entree, montant_total, refe) VALUES
(3, 6, '2026-01-08 10:00:00', 4200000.00, 'PRO-ACH-2026-0001');
INSERT INTO proforma_achat_lignes (proforma_id, article_id, quantite, prix_unitaire) VALUES
(3, 5, 100, 20000.00),
(3, 10, 200, 11000.00);

-- Bon de commande pour Achat 3 (en cours)
INSERT INTO bon_commandes_achats (proforma_id, date_entree, montant_total, process_id, refe) VALUES
(3, '2026-01-09 09:00:00', 4200000.00, 3, 'BC-2026-0001');
INSERT INTO bon_commande_achat_lignes (bon_commande_id, article_id, quantite, prix_unitaire) VALUES
(3, 5, 100, 20000.00),
(3, 10, 200, 11000.00);

INSERT INTO bon_commande_historiques (date_entree, bon_commande_id, process_id) VALUES
('2026-01-09 09:00:00', 3, 1),
('2026-01-10 10:00:00', 3, 2),
('2026-01-11 14:00:00', 3, 3);

-- =====================================================
-- 4. RECEPTIONS D'ACHATS
-- =====================================================

-- Reception Achat 1
INSERT INTO reception_achats (bon_commande_id, date_entree, refe) VALUES
(1, '2025-12-10 09:00:00', 'REC-2025-0001');
INSERT INTO reception_achat_lignes (reception_id, article_id, depot_id, quantite) VALUES
(1, 1, 1, 50),
(1, 3, 1, 30);

-- Reception Achat 2
INSERT INTO reception_achats (bon_commande_id, date_entree, refe) VALUES
(2, '2025-12-20 10:00:00', 'REC-2025-0002');
INSERT INTO reception_achat_lignes (reception_id, article_id, depot_id, quantite) VALUES
(2, 12, 1, 200),
(2, 14, 2, 150);

-- =====================================================
-- 5. LOTS SUPPLEMENTAIRES (receptions)
-- =====================================================

-- Lots crees par receptions
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot) VALUES
('LOT-VET-0001-002', 1, 1, '2025-12-10 09:00:00', NULL, 50, 45, 40000.00, 'ACTIF'),
('LOT-PARF-0001-002', 3, 1, '2025-12-10 09:00:00', '2028-06-30', 30, 22, 75000.00, 'ACTIF'),
('LOT-REF001-002', 12, 1, '2025-12-20 10:00:00', '2027-03-31', 200, 180, 2200.00, 'ACTIF'),
('LOT-REF008-002', 14, 2, '2025-12-20 10:00:00', '2027-06-30', 150, 130, 10000.00, 'ACTIF');

-- =====================================================
-- 6. MOUVEMENTS DE STOCK (Entrees des receptions)
-- =====================================================

INSERT INTO lot_mouvements (lot_id, quantite, type_mouvement_id, raison_id, date_entree, description) VALUES
-- Entrees reception Achat 1
(21, 50, 1, 1, '2025-12-10 09:15:00', 'Reception ACH-2025-0001 - Jean Slim'),
(22, 30, 1, 1, '2025-12-10 09:20:00', 'Reception ACH-2025-0001 - Eau de Parfum'),
-- Entrees reception Achat 2
(23, 200, 1, 1, '2025-12-20 10:15:00', 'Reception ACH-2025-0002 - Sucre'),
(24, 150, 1, 1, '2025-12-20 10:20:00', 'Reception ACH-2025-0002 - Riz');

-- =====================================================
-- 7. PROFORMA VENTES (Devis clients)
-- =====================================================

-- Proforma 1: Decembre 2025 - Transforme en commande
INSERT INTO proforma_ventes (process_id, date_entree, client_id, refe, prix_total, remise_pourcentage) VALUES
(5, '2025-12-05 10:00:00', 1, 'PRO-VTE-2025-0001', 850000.00, 5.00);
INSERT INTO proforma_vente_lignes (proforma_id, article_id, quantite, prix_unitaire, remise_pourcentage) VALUES
(1, 1, 10, 45000.00, 0),
(1, 8, 5, 75000.00, 5.00);

-- Proforma 2: Decembre 2025 - Transforme en commande
INSERT INTO proforma_ventes (process_id, date_entree, client_id, refe, prix_total, remise_pourcentage) VALUES
(5, '2025-12-12 14:00:00', 2, 'PRO-VTE-2025-0002', 425000.00, 0);
INSERT INTO proforma_vente_lignes (proforma_id, article_id, quantite, prix_unitaire) VALUES
(2, 3, 5, 85000.00);

-- Proforma 3: Janvier 2026 - Transforme en commande
INSERT INTO proforma_ventes (process_id, date_entree, client_id, refe, prix_total, remise_pourcentage) VALUES
(5, '2026-01-08 09:30:00', 3, 'PRO-VTE-2026-0001', 1100000.00, 10.00);
INSERT INTO proforma_vente_lignes (proforma_id, article_id, quantite, prix_unitaire, remise_pourcentage) VALUES
(3, 7, 5, 220000.00, 10.00);

-- Proforma 4: Janvier 2026 - Accepte (pas encore converti)
INSERT INTO proforma_ventes (process_id, date_entree, client_id, refe, prix_total, remise_pourcentage) VALUES
(3, '2026-01-15 11:00:00', 4, 'PRO-VTE-2026-0002', 350000.00, 0);
INSERT INTO proforma_vente_lignes (proforma_id, article_id, quantite, prix_unitaire) VALUES
(4, 11, 10, 35000.00);

-- Proforma 5: Janvier 2026 - Envoye
INSERT INTO proforma_ventes (process_id, date_entree, client_id, refe, prix_total, remise_fixe) VALUES
(2, '2026-01-20 10:00:00', 5, 'PRO-VTE-2026-0003', 165000.00, 10000.00);
INSERT INTO proforma_vente_lignes (proforma_id, article_id, quantite, prix_unitaire) VALUES
(5, 2, 1, 150000.00),
(5, 19, 50, 500.00);

-- Proforma 6: Janvier 2026 - Refuse
INSERT INTO proforma_ventes (process_id, date_entree, client_id, refe, prix_total) VALUES
(4, '2026-01-22 14:30:00', 6, 'PRO-VTE-2026-0004', 660000.00);
INSERT INTO proforma_vente_lignes (proforma_id, article_id, quantite, prix_unitaire) VALUES
(6, 7, 3, 220000.00);

-- Proforma 7: Janvier 2026 - Brouillon
INSERT INTO proforma_ventes (process_id, date_entree, client_id, refe, prix_total) VALUES
(1, '2026-01-28 09:00:00', 7, 'PRO-VTE-2026-0005', 275000.00);
INSERT INTO proforma_vente_lignes (proforma_id, article_id, quantite, prix_unitaire) VALUES
(7, 9, 5, 55000.00);

-- Proforma 8: Fevrier 2026 - Brouillon
INSERT INTO proforma_ventes (process_id, date_entree, client_id, refe, prix_total, remise_pourcentage) VALUES
(1, '2026-02-01 08:30:00', 8, 'PRO-VTE-2026-0006', 500000.00, 8.00);
INSERT INTO proforma_vente_lignes (proforma_id, article_id, quantite, prix_unitaire, remise_pourcentage) VALUES
(8, 3, 4, 85000.00, 5.00),
(8, 4, 3, 60000.00, 0);

-- =====================================================
-- 8. VENTES (Commandes clients)
-- =====================================================

-- Vente 1: Decembre 2025 - Livree
INSERT INTO ventes (refe, date_entree, proforma_id, date_effective, date_livraison, location_livraison, prix_total, remise_pourcentage, process_id) VALUES
('VTE-2025-0001', '2025-12-08 10:00:00', 1, '2025-12-08', '2025-12-10', 'Lot II A 12, Antananarivo', 807500.00, 5.00, 9);
INSERT INTO vente_lignes (vente_id, article_id, quantite, prix_unitaire, remise_pourcentage) VALUES
(1, 1, 10, 45000.00, 0),
(1, 8, 5, 75000.00, 5.00);

INSERT INTO vente_historiques (date_entree, vente_id, process_id) VALUES
('2025-12-08 10:00:00', 1, 6),
('2025-12-08 14:00:00', 1, 7),
('2025-12-09 09:00:00', 1, 8),
('2025-12-10 11:00:00', 1, 9);

-- Vente 2: Decembre 2025 - Livree
INSERT INTO ventes (refe, date_entree, proforma_id, date_effective, date_livraison, location_livraison, prix_total, process_id) VALUES
('VTE-2025-0002', '2025-12-15 09:30:00', 2, '2025-12-15', '2025-12-18', 'Zone Industrielle, Antsirabe', 425000.00, 9);
INSERT INTO vente_lignes (vente_id, article_id, quantite, prix_unitaire) VALUES
(2, 3, 5, 85000.00);

INSERT INTO vente_historiques (date_entree, vente_id, process_id) VALUES
('2025-12-15 09:30:00', 2, 6),
('2025-12-16 10:00:00', 2, 7),
('2025-12-17 14:00:00', 2, 8),
('2025-12-18 16:00:00', 2, 9);

-- Vente 3: Janvier 2026 - Livree
INSERT INTO ventes (refe, date_entree, proforma_id, date_effective, date_livraison, location_livraison, prix_total, remise_pourcentage, process_id) VALUES
('VTE-2026-0001', '2026-01-10 11:00:00', 3, '2026-01-10', '2026-01-15', 'Rue du Commerce, Toamasina', 990000.00, 10.00, 9);
INSERT INTO vente_lignes (vente_id, article_id, quantite, prix_unitaire, remise_pourcentage) VALUES
(3, 7, 5, 220000.00, 10.00);

INSERT INTO vente_historiques (date_entree, vente_id, process_id) VALUES
('2026-01-10 11:00:00', 3, 6),
('2026-01-11 09:00:00', 3, 7),
('2026-01-13 14:00:00', 3, 8),
('2026-01-15 10:00:00', 3, 9);

-- Vente 4: Janvier 2026 - En preparation
INSERT INTO ventes (refe, date_entree, proforma_id, date_effective, date_livraison, location_livraison, prix_total, process_id) VALUES
('VTE-2026-0002', '2026-01-20 14:00:00', 4, '2026-01-20', '2026-01-25', 'Avenue de la Technologie, Antananarivo', 350000.00, 7);
INSERT INTO vente_lignes (vente_id, article_id, quantite, prix_unitaire) VALUES
(4, 11, 10, 35000.00);

INSERT INTO vente_historiques (date_entree, vente_id, process_id) VALUES
('2026-01-20 14:00:00', 4, 6),
('2026-01-21 10:00:00', 4, 7);

-- Vente 5: Janvier 2026 - Confirmee (en retard de livraison)
INSERT INTO ventes (refe, date_entree, proforma_id, date_effective, date_livraison, location_livraison, prix_total, process_id) VALUES
('VTE-2026-0003', '2026-01-18 09:00:00', 4, '2026-01-18', '2026-01-22', 'Quartier Isoraka, Antananarivo', 175000.00, 6);
INSERT INTO vente_lignes (vente_id, article_id, quantite, prix_unitaire) VALUES
(5, 11, 5, 35000.00);

INSERT INTO vente_historiques (date_entree, vente_id, process_id) VALUES
('2026-01-18 09:00:00', 5, 6);

-- Vente 6: Janvier 2026 - Annulee
INSERT INTO ventes (refe, date_entree, proforma_id, date_effective, date_livraison, location_livraison, prix_total, process_id) VALUES
('VTE-2026-0004', '2026-01-25 10:00:00', 3, '2026-01-25', '2026-01-28', 'Analakely, Antananarivo', 440000.00, 10);
INSERT INTO vente_lignes (vente_id, article_id, quantite, prix_unitaire) VALUES
(6, 7, 2, 220000.00);

INSERT INTO vente_historiques (date_entree, vente_id, process_id) VALUES
('2026-01-25 10:00:00', 6, 6),
('2026-01-26 11:00:00', 6, 10);

-- =====================================================
-- 9. RESERVATIONS DE STOCK
-- =====================================================

-- Reservations pour ventes confirmees/en preparation
INSERT INTO stock_reservations (article_id, quantite, date_entree, process_id, reference) VALUES
(11, 10, '2026-01-20 14:00:00', 1, 'VTE-2026-0002'),  -- Palette maquillage
(11, 5, '2026-01-18 09:00:00', 1, 'VTE-2026-0003');   -- Palette maquillage

INSERT INTO stock_reservation_historiques (date_entree, stock_id, process_id) VALUES
('2026-01-20 14:00:00', 1, 1),
('2026-01-18 09:00:00', 2, 1);

-- Reservation liberee (vente annulee)
INSERT INTO stock_reservations (article_id, quantite, date_entree, process_id, reference) VALUES
(7, 2, '2026-01-25 10:00:00', 4, 'VTE-2026-0004');  -- Sac Cabas - libere

INSERT INTO stock_reservation_historiques (date_entree, stock_id, process_id) VALUES
('2026-01-25 10:00:00', 3, 1),
('2026-01-26 11:00:00', 3, 4);

-- =====================================================
-- 10. LIVRAISONS VENTES
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
-- 11. MOUVEMENTS DE STOCK (Sorties livraisons)
-- =====================================================

INSERT INTO lot_mouvements (lot_id, quantite, type_mouvement_id, raison_id, date_entree, description) VALUES
-- Sorties livraison 1
(1, 10, 2, 5, '2025-12-10 10:15:00', 'Livraison VTE-2025-0001 - Jean Slim'),
(8, 5, 2, 5, '2025-12-10 10:20:00', 'Livraison VTE-2025-0001 - Sneakers'),
-- Sorties livraison 2
(3, 5, 2, 5, '2025-12-18 14:15:00', 'Livraison VTE-2025-0002 - Eau de Parfum'),
-- Sorties livraison 3
(7, 5, 2, 5, '2026-01-15 09:15:00', 'Livraison VTE-2026-0001 - Sac Cabas');

-- Mouvements divers (ajustements, transferts, rebuts)
INSERT INTO lot_mouvements (lot_id, quantite, type_mouvement_id, raison_id, date_entree, description) VALUES
-- Ajustement positif inventaire
(12, 5, 1, 3, '2025-12-28 11:00:00', 'Ajustement suite inventaire - Sucre'),
-- Rebut produit endommage
(4, 2, 2, 7, '2026-01-05 14:00:00', 'Rebut - Parfum bouteilles cassees'),
-- Transfert entre depots
(8, 10, 2, 9, '2026-01-10 10:00:00', 'Transfert vers DEPOT 2'),
-- Consommation interne
(19, 20, 2, 6, '2026-01-20 15:00:00', 'Consommation interne - Stylos bureau');

-- =====================================================
-- 12. INVENTAIRES
-- =====================================================

-- Inventaire 1: Decembre 2025 - Cloture (Depot 1) - cree par Magasinier Reception
INSERT INTO inventaires (utilisateur_id, date_entree, depot_id, details) VALUES
(12, '2025-12-28 08:00:00', 1, 'Inventaire de fin d''annee - Depot Principal');
INSERT INTO inventaire_lignes (inventaire_id, article_id, quantite) VALUES
(1, 1, 235),   -- Jean Slim: 200 initial + 50 reception - 10 vente - 5 ecart
(1, 2, 100),   -- Robe Soiree
(1, 3, 167),   -- Eau Parfum Oriental: 150 + 30 - 5 - 8 ecart
(1, 7, 45),    -- Sac Cabas
(1, 12, 705),  -- Sucre: 500 + 200 + 5 ajust
(1, 19, 978);  -- Stylo: 1000 - 22 ecart

INSERT INTO inventaire_historiques (date_entree, inventaire_id, process_id, utilisateur_id) VALUES
('2025-12-28 08:00:00', 1, 1, 12),
('2025-12-28 14:00:00', 1, 2, 7),
('2025-12-28 16:00:00', 1, 4, 7);

-- Inventaire 2: Janvier 2026 - Valide (Depot 2) - cree par Magasinier Reception
INSERT INTO inventaires (utilisateur_id, date_entree, depot_id, details) VALUES
(12, '2026-01-15 09:00:00', 2, 'Inventaire mensuel - Depot Secondaire');
INSERT INTO inventaire_lignes (inventaire_id, article_id, quantite) VALUES
(2, 5, 298),   -- Creme Visage: 300 - 2 ecart
(2, 8, 135),   -- Sneakers: 150 - 5 - 10 transfert
(2, 10, 498),  -- Lotion Corps: 500 - 2 ecart
(2, 13, 995),  -- Eau minerale: 1000 - 5 ecart
(2, 14, 530),  -- Riz: 400 + 150 - 20 ecart
(2, 16, 98);   -- Savon liquide: 100 - 2 ecart

INSERT INTO inventaire_historiques (date_entree, inventaire_id, process_id, utilisateur_id) VALUES
('2026-01-15 09:00:00', 2, 1, 12),
('2026-01-16 10:00:00', 2, 2, 7);

-- Inventaire 3: Janvier 2026 - Creation (en cours) - cree par Magasinier Reception
INSERT INTO inventaires (utilisateur_id, date_entree, depot_id, details) VALUES
(12, '2026-01-30 08:30:00', 1, 'Inventaire mensuel - Depot Principal');
INSERT INTO inventaire_lignes (inventaire_id, article_id, quantite) VALUES
(3, 1, 225),
(3, 3, 159),
(3, 7, 38),
(3, 9, 195),
(3, 11, 235);

INSERT INTO inventaire_historiques (date_entree, inventaire_id, process_id, utilisateur_id) VALUES
('2026-01-30 08:30:00', 3, 1, 12);

-- =====================================================
-- 13. MOUVEMENTS DE CAISSE
-- =====================================================

-- Encaissements ventes
INSERT INTO caisse_mouvements (montant, type_mouvement_id, date_entree, entity_id, details) VALUES
(807500.00, 1, '2025-12-10 12:00:00', 1, 'Encaissement VTE-2025-0001 - SARL Andry & Co'),
(425000.00, 1, '2025-12-18 16:30:00', 1, 'Encaissement VTE-2025-0002 - Societe FitLine'),
(990000.00, 1, '2026-01-15 11:00:00', 1, 'Encaissement VTE-2026-0001 - Ets Rakoto Import'),
(175000.00, 1, '2026-01-20 15:00:00', 1, 'Acompte VTE-2026-0002 - Compagnie MadaTech (50%)');

-- Autres encaissements
INSERT INTO caisse_mouvements (montant, type_mouvement_id, date_entree, entity_id, details) VALUES
(50000.00, 2, '2025-12-20 09:00:00', 1, 'Vente au comptoir - Divers'),
(75000.00, 2, '2026-01-05 10:30:00', 1, 'Vente au comptoir - Divers'),
(30000.00, 2, '2026-01-25 14:00:00', 1, 'Vente au comptoir - Divers');

-- Remboursement client (vente annulee)
INSERT INTO caisse_mouvements (montant, type_mouvement_id, date_entree, entity_id, details) VALUES
(-110000.00, 3, '2026-01-27 10:00:00', 1, 'Remboursement VTE-2026-0004 - Acompte 25%');

-- Sorties de caisse
INSERT INTO caisse_mouvements (montant, type_mouvement_id, date_entree, entity_id, details) VALUES
(-25000.00, 4, '2025-12-15 09:00:00', 1, 'Frais de transport livraison'),
(-50000.00, 4, '2026-01-08 11:00:00', 1, 'Achat fournitures bureau'),
(-15000.00, 4, '2026-01-22 14:30:00', 1, 'Frais divers');

-- Paiements fournisseurs
INSERT INTO caisse_mouvements (montant, type_mouvement_id, date_entree, entity_id, details) VALUES
(-2125000.00, 5, '2025-12-18 10:00:00', 1, 'Acompte BC-2025-0001 - 50%'),
(-2125000.00, 5, '2025-12-28 11:00:00', 1, 'Solde BC-2025-0001'),
(-970000.00, 5, '2025-12-26 09:00:00', 1, 'Acompte BC-2025-0002 - 50%'),
(-970000.00, 5, '2026-01-05 14:00:00', 1, 'Solde BC-2025-0002');

-- =====================================================
-- 14. AUDIT LOGS (Traçabilite des actions)
-- =====================================================

INSERT INTO audit_logs (utilisateur_id, action_id, classes, ids_classes, action_timestamp, details) VALUES
-- Connexions
(1, 35, 'utilisateurs', '1', '2025-12-01 08:00:00', 'Connexion admin'),
(3, 35, 'utilisateurs', '3', '2025-12-01 08:30:00', 'Connexion Responsable Achat'),
-- Creations achats
(3, 9, 'achats', '1', '2025-12-01 09:00:00', 'Creation demande achat ACH-2025-0001'),
(4, 9, 'achats', '2', '2025-12-10 10:30:00', 'Creation demande achat ACH-2025-0002'),
-- Validations
(7, 5, 'achats', '1', '2025-12-01 14:00:00', 'Validation magasinier ACH-2025-0001'),
(9, 5, 'achats', '1', '2025-12-02 10:00:00', 'Validation comptable ACH-2025-0001'),
-- Receptions
(12, 13, 'reception_achats', '1', '2025-12-10 09:00:00', 'Reception marchandises ACH-2025-0001'),
-- Ventes
(5, 21, 'proforma_ventes', '1', '2025-12-05 10:00:00', 'Creation devis PRO-VTE-2025-0001'),
(5, 22, 'ventes', '1', '2025-12-08 10:00:00', 'Confirmation vente VTE-2025-0001'),
-- Livraisons
(8, 24, 'livraison_ventes', '1', '2025-12-10 10:00:00', 'Livraison VTE-2025-0001'),
-- Inventaires
(12, 19, 'inventaires', '1', '2025-12-28 08:00:00', 'Creation inventaire Depot 1'),
(7, 20, 'inventaires', '1', '2025-12-28 14:00:00', 'Validation inventaire Depot 1'),
-- Annulation
(5, 8, 'ventes', '6', '2026-01-26 11:00:00', 'Annulation vente VTE-2026-0004');

-- =====================================================
-- 15. MISE A JOUR DES QUANTITES RESTANTES (lots initiaux)
-- Simulation des ventes/sorties sur les lots du clean_data
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
-- 16. LOTS AVEC DATES DE PEREMPTION PROCHES (pour alertes)
-- =====================================================

INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot) VALUES
('LOT-COS-0001-003', 5, 1, '2025-06-01 10:00:00', '2026-02-15', 50, 45, 21000.00, 'ACTIF'),       -- DLUO proche
('LOT-SOIN-0001-002', 10, 1, '2025-03-01 10:00:00', '2026-02-10', 100, 30, 12000.00, 'EXPIRE_DLUO'), -- DLUO depassee
('LOT-REF001-003', 12, 2, '2025-08-01 10:00:00', '2026-02-05', 150, 80, 2400.00, 'BLOQUE');      -- Bloque manuellement


-- =====================================================
-- DONNEES REALISTES ERP - WORKFLOW VENTE COMPLET
-- =====================================================
-- Ce script genere des donnees coherentes pour un ERP avec:
-- - Clients (10 clients)
-- - Prix d'articles a differentes dates
-- - 15 proformas de vente avec differents statuts
-- - 15 ventes correspondantes
-- - 1 a 3 lignes par vente
-- - Livraisons pour les ventes appropriees
-- - Historiques de changements de statuts
-- =====================================================
-- PREREQUIS: Executer table.sql, dataVente.sql et achat_donnees.sql avant ce script
-- =====================================================

-- =====================================================
-- 1. NETTOYAGE DES DONNEES EXISTANTES
-- =====================================================
TRUNCATE TABLE livraison_vente_historiques CASCADE;
TRUNCATE TABLE livraison_vente_lignes CASCADE;
TRUNCATE TABLE livraison_ventes CASCADE;
TRUNCATE TABLE vente_historiques CASCADE;
TRUNCATE TABLE vente_lignes CASCADE;
TRUNCATE TABLE ventes CASCADE;
TRUNCATE TABLE proforma_vente_lignes CASCADE;
TRUNCATE TABLE proforma_ventes CASCADE;
TRUNCATE TABLE clients CASCADE;

-- =====================================================
-- 2. CLIENTS (10 clients)
-- =====================================================
INSERT INTO clients (client_nom, contact, adresse, coordonnee_bancaire) VALUES
('Entreprise ROVA', '+261 34 12 345 67', 'Lot IVA 123 Antananarivo', 'BNI-MA 00001 12345 67890123456 78'),
('Societe VAHINY SARL', '+261 33 23 456 78', '67 Avenue de l''Independance Antananarivo', 'BOA 00002 23456 78901234567 89'),
('Commerce TSARA', '+261 32 34 567 89', 'Ankorondrano Antananarivo', 'BFV 00003 34567 89012345678 90'),
('Distribution MALALA', '+261 34 45 678 90', 'Antsirabe Centre', 'BNI-MA 00004 45678 90123456789 01'),
('Magasin FAHAZAVANA', '+261 33 56 789 01', 'Toamasina Port', 'BOA 00005 56789 01234567890 12'),
('Boutique MIRAY', '+261 32 67 890 12', 'Fianarantsoa Ville', 'BMOI 00006 67890 12345678901 23'),
('Superette TANJONA', '+261 34 78 901 23', 'Mahajanga Be', 'BFV 00007 78901 23456789012 34'),
('Epicerie MITIA', '+261 33 89 012 34', 'Toliara Centre', 'BNI-MA 00008 89012 34567890123 45'),
('Quincaillerie MANDROSO', '+261 32 90 123 45', 'Antsirabe Asabotsy', 'BOA 00009 90123 45678901234 56'),
('Restaurant HAZO', '+261 34 01 234 56', 'Ivato Antananarivo', 'BMOI 00010 01234 56789012345 67');

-- =====================================================
-- 3. PRIX DES ARTICLES A DIFFERENTES DATES
-- =====================================================
-- Prix initiaux (Janvier 2026)
INSERT INTO article_prix (article_id, prix, date_entree)
SELECT id, 
    CASE refe
        -- Alimentaire
        WHEN 'ALI-001' THEN 95000.00
        WHEN 'ALI-002' THEN 25000.00
        WHEN 'ALI-003' THEN 48000.00
        WHEN 'ALI-004' THEN 105000.00
        WHEN 'ALI-005' THEN 20000.00
        WHEN 'ALI-006' THEN 4000.00
        WHEN 'ALI-007' THEN 3200.00
        WHEN 'ALI-008' THEN 35000.00
        -- Textile
        WHEN 'TEX-001' THEN 18000.00
        WHEN 'TEX-002' THEN 52000.00
        WHEN 'TEX-003' THEN 40000.00
        WHEN 'TEX-004' THEN 62000.00
        WHEN 'TEX-005' THEN 10000.00
        WHEN 'TEX-006' THEN 145000.00
        -- Electronique
        WHEN 'ELE-001' THEN 12000.00
        WHEN 'ELE-002' THEN 28000.00
        WHEN 'ELE-003' THEN 45000.00
        WHEN 'ELE-004' THEN 18000.00
        WHEN 'ELE-005' THEN 35000.00
        -- Cosmetique
        WHEN 'COS-001' THEN 15000.00
        WHEN 'COS-002' THEN 18000.00
        WHEN 'COS-003' THEN 35000.00
        WHEN 'COS-004' THEN 8000.00
        WHEN 'COS-005' THEN 12000.00
        -- Papeterie
        WHEN 'PAP-001' THEN 25000.00
        WHEN 'PAP-002' THEN 45000.00
        WHEN 'PAP-003' THEN 8000.00
        -- Chimique
        WHEN 'CHI-001' THEN 22000.00
        WHEN 'CHI-002' THEN 28000.00
        -- Accessoires
        WHEN 'ACC-001' THEN 65000.00
    END,
    '2026-01-15 10:00:00'
FROM articles;

-- Prix mis a jour (Fevrier 2026)
INSERT INTO article_prix (article_id, prix, date_entree)
SELECT id, 
    CASE refe
        -- Alimentaire (augmentation 5%)
        WHEN 'ALI-001' THEN 99750.00
        WHEN 'ALI-002' THEN 26250.00
        WHEN 'ALI-003' THEN 50400.00
        WHEN 'ALI-004' THEN 110250.00
        WHEN 'ALI-005' THEN 21000.00
        WHEN 'ALI-006' THEN 4200.00
        WHEN 'ALI-007' THEN 3360.00
        WHEN 'ALI-008' THEN 36750.00
        -- Textile (augmentation 3%)
        WHEN 'TEX-001' THEN 18540.00
        WHEN 'TEX-002' THEN 53560.00
        WHEN 'TEX-003' THEN 41200.00
        WHEN 'TEX-004' THEN 63860.00
        WHEN 'TEX-005' THEN 10300.00
        WHEN 'TEX-006' THEN 149350.00
        -- Electronique (reduction 2%)
        WHEN 'ELE-001' THEN 11760.00
        WHEN 'ELE-002' THEN 27440.00
        WHEN 'ELE-003' THEN 44100.00
        WHEN 'ELE-004' THEN 17640.00
        WHEN 'ELE-005' THEN 34300.00
        -- Cosmetique (augmentation 4%)
        WHEN 'COS-001' THEN 15600.00
        WHEN 'COS-002' THEN 18720.00
        WHEN 'COS-003' THEN 36400.00
        WHEN 'COS-004' THEN 8320.00
        WHEN 'COS-005' THEN 12480.00
        -- Papeterie (stable)
        WHEN 'PAP-001' THEN 25000.00
        WHEN 'PAP-002' THEN 45000.00
        WHEN 'PAP-003' THEN 8000.00
        -- Chimique (augmentation 2%)
        WHEN 'CHI-001' THEN 22440.00
        WHEN 'CHI-002' THEN 28560.00
        -- Accessoires (augmentation 5%)
        WHEN 'ACC-001' THEN 68250.00
    END,
    '2026-02-01 08:00:00'
FROM articles;

-- =====================================================
-- 4. PROFORMAS DE VENTE (15 proformas)
-- =====================================================
-- Proforma 1: Brouillon
INSERT INTO proforma_ventes (refe, date_entree, client_id, process_id, prix_total, remise_pourcentage, remise_fixe)
VALUES ('PF-VENTE-2026-001', '2026-01-20 09:30:00', 1, 
    (SELECT id FROM vente_processes WHERE abreviation = 'BROUIL'), 
    315000.00, NULL, NULL);

-- Proforma 2: Envoye
INSERT INTO proforma_ventes (refe, date_entree, client_id, process_id, prix_total, remise_pourcentage, remise_fixe)
VALUES ('PF-VENTE-2026-002', '2026-01-22 14:15:00', 2, 
    (SELECT id FROM vente_processes WHERE abreviation = 'ENVOYE'), 
    225000.00, 5.0, NULL);

-- Proforma 3: Accepte
INSERT INTO proforma_ventes (refe, date_entree, client_id, process_id, prix_total, remise_pourcentage, remise_fixe)
VALUES ('PF-VENTE-2026-003', '2026-01-24 10:00:00', 3, 
    (SELECT id FROM vente_processes WHERE abreviation = 'ACCEPT'), 
    450000.00, NULL, 15000.00);

-- Proforma 4: Refuse
INSERT INTO proforma_ventes (refe, date_entree, client_id, process_id, prix_total, remise_pourcentage, remise_fixe)
VALUES ('PF-VENTE-2026-004', '2026-01-25 11:30:00', 4, 
    (SELECT id FROM vente_processes WHERE abreviation = 'REFUSE'), 
    180000.00, NULL, NULL);

-- Proforma 5: Transforme en commande
INSERT INTO proforma_ventes (refe, date_entree, client_id, process_id, prix_total, remise_pourcentage, remise_fixe)
VALUES ('PF-VENTE-2026-005', '2026-01-26 08:45:00', 5, 
    (SELECT id FROM vente_processes WHERE abreviation = 'TRANSF'), 
    520000.00, 10.0, NULL);

-- Proforma 6: Transforme (Confirmee)
INSERT INTO proforma_ventes (refe, date_entree, client_id, process_id, prix_total, remise_pourcentage, remise_fixe)
VALUES ('PF-VENTE-2026-006', '2026-01-27 13:20:00', 6, 
    (SELECT id FROM vente_processes WHERE abreviation = 'TRANSF'), 
    385000.00, NULL, 20000.00);

-- Proforma 7: Transforme (En preparation)
INSERT INTO proforma_ventes (refe, date_entree, client_id, process_id, prix_total, remise_pourcentage, remise_fixe)
VALUES ('PF-VENTE-2026-007', '2026-01-28 09:00:00', 7, 
    (SELECT id FROM vente_processes WHERE abreviation = 'TRANSF'), 
    295000.00, 3.0, NULL);

-- Proforma 8: Transforme (Prete)
INSERT INTO proforma_ventes (refe, date_entree, client_id, process_id, prix_total, remise_pourcentage, remise_fixe)
VALUES ('PF-VENTE-2026-008', '2026-01-29 10:30:00', 8, 
    (SELECT id FROM vente_processes WHERE abreviation = 'TRANSF'), 
    670000.00, 8.0, NULL);

-- Proforma 9: Transforme (Livree)
INSERT INTO proforma_ventes (refe, date_entree, client_id, process_id, prix_total, remise_pourcentage, remise_fixe)
VALUES ('PF-VENTE-2026-009', '2026-01-30 14:45:00', 9, 
    (SELECT id FROM vente_processes WHERE abreviation = 'TRANSF'), 
    425000.00, NULL, 10000.00);

-- Proforma 10: Transforme (Livree)
INSERT INTO proforma_ventes (refe, date_entree, client_id, process_id, prix_total, remise_pourcentage, remise_fixe)
VALUES ('PF-VENTE-2026-010', '2026-01-31 11:00:00', 10, 
    (SELECT id FROM vente_processes WHERE abreviation = 'TRANSF'), 
    355000.00, 5.0, NULL);

-- Proforma 11: Accepte
INSERT INTO proforma_ventes (refe, date_entree, client_id, process_id, prix_total, remise_pourcentage, remise_fixe)
VALUES ('PF-VENTE-2026-011', '2026-02-01 08:30:00', 1, 
    (SELECT id FROM vente_processes WHERE abreviation = 'ACCEPT'), 
    280000.00, NULL, NULL);

-- Proforma 12: Transforme (Confirmee)
INSERT INTO proforma_ventes (refe, date_entree, client_id, process_id, prix_total, remise_pourcentage, remise_fixe)
VALUES ('PF-VENTE-2026-012', '2026-02-02 09:15:00', 2, 
    (SELECT id FROM vente_processes WHERE abreviation = 'TRANSF'), 
    540000.00, 7.0, NULL);

-- Proforma 13: Transforme (En preparation)
INSERT INTO proforma_ventes (refe, date_entree, client_id, process_id, prix_total, remise_pourcentage, remise_fixe)
VALUES ('PF-VENTE-2026-013', '2026-02-03 10:00:00', 3, 
    (SELECT id FROM vente_processes WHERE abreviation = 'TRANSF'), 
    395000.00, NULL, 25000.00);

-- Proforma 14: Transforme (Prete)
INSERT INTO proforma_ventes (refe, date_entree, client_id, process_id, prix_total, remise_pourcentage, remise_fixe)
VALUES ('PF-VENTE-2026-014', '2026-02-04 11:20:00', 4, 
    (SELECT id FROM vente_processes WHERE abreviation = 'TRANSF'), 
    480000.00, 6.0, NULL);

-- Proforma 15: Transforme (Livree)
INSERT INTO proforma_ventes (refe, date_entree, client_id, process_id, prix_total, remise_pourcentage, remise_fixe)
VALUES ('PF-VENTE-2026-015', '2026-02-04 13:30:00', 5, 
    (SELECT id FROM vente_processes WHERE abreviation = 'TRANSF'), 
    625000.00, 10.0, NULL);

-- =====================================================
-- 5. LIGNES DE PROFORMA VENTE
-- =====================================================
-- Proforma 1 lignes (Brouillon)
INSERT INTO proforma_vente_lignes (proforma_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-001'), (SELECT id FROM articles WHERE refe = 'ALI-001'), 2, 95000.00, NULL, NULL),
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-001'), (SELECT id FROM articles WHERE refe = 'ALI-002'), 5, 25000.00, NULL, NULL);

-- Proforma 2 lignes (Envoye)
INSERT INTO proforma_vente_lignes (proforma_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-002'), (SELECT id FROM articles WHERE refe = 'TEX-001'), 10, 18000.00, NULL, NULL),
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-002'), (SELECT id FROM articles WHERE refe = 'TEX-005'), 5, 10000.00, NULL, NULL);

-- Proforma 3 lignes (Accepte)
INSERT INTO proforma_vente_lignes (proforma_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-003'), (SELECT id FROM articles WHERE refe = 'ELE-002'), 8, 28000.00, NULL, NULL),
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-003'), (SELECT id FROM articles WHERE refe = 'ELE-003'), 4, 45000.00, NULL, NULL),
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-003'), (SELECT id FROM articles WHERE refe = 'ELE-005'), 2, 35000.00, NULL, NULL);

-- Proforma 4 lignes (Refuse)
INSERT INTO proforma_vente_lignes (proforma_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-004'), (SELECT id FROM articles WHERE refe = 'COS-001'), 10, 15000.00, NULL, NULL),
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-004'), (SELECT id FROM articles WHERE refe = 'COS-004'), 4, 8000.00, NULL, NULL);

-- Proforma 5 lignes (Transforme)
INSERT INTO proforma_vente_lignes (proforma_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-005'), (SELECT id FROM articles WHERE refe = 'ALI-003'), 10, 48000.00, NULL, NULL),
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-005'), (SELECT id FROM articles WHERE refe = 'ALI-008'), 1, 35000.00, NULL, NULL);

-- Proforma 6 lignes (Transforme - Confirmee)
INSERT INTO proforma_vente_lignes (proforma_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-006'), (SELECT id FROM articles WHERE refe = 'TEX-002'), 6, 52000.00, NULL, NULL),
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-006'), (SELECT id FROM articles WHERE refe = 'TEX-004'), 2, 62000.00, NULL, NULL);

-- Proforma 7 lignes (Transforme - En preparation)
INSERT INTO proforma_vente_lignes (proforma_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-007'), (SELECT id FROM articles WHERE refe = 'PAP-001'), 10, 25000.00, NULL, NULL),
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-007'), (SELECT id FROM articles WHERE refe = 'PAP-003'), 5, 8000.00, NULL, NULL);

-- Proforma 8 lignes (Transforme - Prete)
INSERT INTO proforma_vente_lignes (proforma_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-008'), (SELECT id FROM articles WHERE refe = 'ALI-004'), 5, 105000.00, NULL, NULL),
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-008'), (SELECT id FROM articles WHERE refe = 'ALI-001'), 2, 95000.00, NULL, NULL),
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-008'), (SELECT id FROM articles WHERE refe = 'CHI-001'), 2, 22000.00, NULL, NULL);

-- Proforma 9 lignes (Transforme - Livree)
INSERT INTO proforma_vente_lignes (proforma_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-009'), (SELECT id FROM articles WHERE refe = 'TEX-003'), 8, 40000.00, NULL, NULL),
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-009'), (SELECT id FROM articles WHERE refe = 'TEX-006'), 1, 145000.00, NULL, NULL);

-- Proforma 10 lignes (Transforme - Livree)
INSERT INTO proforma_vente_lignes (proforma_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-010'), (SELECT id FROM articles WHERE refe = 'ELE-001'), 20, 12000.00, NULL, NULL),
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-010'), (SELECT id FROM articles WHERE refe = 'ELE-004'), 8, 18000.00, NULL, NULL);

-- Proforma 11 lignes (Accepte)
INSERT INTO proforma_vente_lignes (proforma_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-011'), (SELECT id FROM articles WHERE refe = 'ALI-005'), 10, 21000.00, NULL, NULL),
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-011'), (SELECT id FROM articles WHERE refe = 'ALI-006'), 15, 4200.00, NULL, NULL);

-- Proforma 12 lignes (Transforme - Confirmee)
INSERT INTO proforma_vente_lignes (proforma_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-012'), (SELECT id FROM articles WHERE refe = 'ACC-001'), 8, 68250.00, NULL, NULL);

-- Proforma 13 lignes (Transforme - En preparation)
INSERT INTO proforma_vente_lignes (proforma_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-013'), (SELECT id FROM articles WHERE refe = 'COS-002'), 15, 18720.00, NULL, NULL),
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-013'), (SELECT id FROM articles WHERE refe = 'COS-003'), 4, 36400.00, NULL, NULL);

-- Proforma 14 lignes (Transforme - Prete)
INSERT INTO proforma_vente_lignes (proforma_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-014'), (SELECT id FROM articles WHERE refe = 'ALI-007'), 100, 3360.00, NULL, NULL),
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-014'), (SELECT id FROM articles WHERE refe = 'TEX-001'), 8, 18540.00, NULL, NULL);

-- Proforma 15 lignes (Transforme - Livree)
INSERT INTO proforma_vente_lignes (proforma_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-015'), (SELECT id FROM articles WHERE refe = 'PAP-002'), 12, 45000.00, NULL, NULL),
    ((SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-015'), (SELECT id FROM articles WHERE refe = 'CHI-002'), 4, 28560.00, NULL, NULL);

-- =====================================================
-- 6. VENTES (15 ventes basees sur les proformas)
-- =====================================================
-- Vente 1: Aucune vente (Brouillon) - pas de vente
-- Vente 2: Aucune vente (Envoye) - pas de vente
-- Vente 3: Aucune vente (Accepte) - pas encore transforme
-- Vente 4: Aucune vente (Refuse) - pas de vente

-- Vente 5: Confirmee (depuis proforma 5)
INSERT INTO ventes (refe, date_entree, proforma_id, client_id, date_effective, date_livraison, location_livraison, prix_total, remise_pourcentage, remise_fixe, process_id)
VALUES ('VENTE-2026-005', '2026-01-27 09:00:00',
    (SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-005'), 5,
    '2026-01-27', '2026-02-05', 'Toamasina Port',
    520000.00, 10.0, NULL,
    (SELECT id FROM vente_processes WHERE abreviation = 'CONFIR'));

-- Vente 6: Confirmee (depuis proforma 6)
INSERT INTO ventes (refe, date_entree, proforma_id, client_id, date_effective, date_livraison, location_livraison, prix_total, remise_pourcentage, remise_fixe, process_id)
VALUES ('VENTE-2026-006', '2026-01-28 10:00:00',
    (SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-006'), 6,
    '2026-01-28', '2026-02-07', 'Fianarantsoa Ville',
    385000.00, NULL, 20000.00,
    (SELECT id FROM vente_processes WHERE abreviation = 'CONFIR'));

-- Vente 7: En preparation (depuis proforma 7)
INSERT INTO ventes (refe, date_entree, proforma_id, client_id, date_effective, date_livraison, location_livraison, prix_total, remise_pourcentage, remise_fixe, process_id)
VALUES ('VENTE-2026-007', '2026-01-29 08:30:00',
    (SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-007'), 7,
    '2026-01-29', '2026-02-08', 'Mahajanga Be',
    295000.00, 3.0, NULL,
    (SELECT id FROM vente_processes WHERE abreviation = 'PREPAR'));

-- Vente 8: Prete (depuis proforma 8)
INSERT INTO ventes (refe, date_entree, proforma_id, client_id, date_effective, date_livraison, location_livraison, prix_total, remise_pourcentage, remise_fixe, process_id)
VALUES ('VENTE-2026-008', '2026-01-30 11:00:00',
    (SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-008'), 8,
    '2026-01-30', '2026-02-09', 'Toliara Centre',
    670000.00, 8.0, NULL,
    (SELECT id FROM vente_processes WHERE abreviation = 'PRETE'));

-- Vente 9: Livree (depuis proforma 9)
INSERT INTO ventes (refe, date_entree, proforma_id, client_id, date_effective, date_livraison, location_livraison, prix_total, remise_pourcentage, remise_fixe, process_id)
VALUES ('VENTE-2026-009', '2026-01-31 09:00:00',
    (SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-009'), 9,
    '2026-01-31', '2026-02-02', 'Antsirabe Asabotsy',
    425000.00, NULL, 10000.00,
    (SELECT id FROM vente_processes WHERE abreviation = 'LIVRE'));

-- Vente 10: Livree (depuis proforma 10)
INSERT INTO ventes (refe, date_entree, proforma_id, client_id, date_effective, date_livraison, location_livraison, prix_total, remise_pourcentage, remise_fixe, process_id)
VALUES ('VENTE-2026-010', '2026-02-01 10:00:00',
    (SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-010'), 10,
    '2026-02-01', '2026-02-03', 'Ivato Antananarivo',
    355000.00, 5.0, NULL,
    (SELECT id FROM vente_processes WHERE abreviation = 'LIVRE'));

-- Vente 11: Aucune vente (Accepte) - pas encore transforme

-- Vente 12: Confirmee (depuis proforma 12)
INSERT INTO ventes (refe, date_entree, proforma_id, client_id, date_effective, date_livraison, location_livraison, prix_total, remise_pourcentage, remise_fixe, process_id)
VALUES ('VENTE-2026-012', '2026-02-03 08:00:00',
    (SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-012'), 2,
    '2026-02-03', '2026-02-15', 'Antananarivo Centre',
    540000.00, 7.0, NULL,
    (SELECT id FROM vente_processes WHERE abreviation = 'CONFIR'));

-- Vente 13: En preparation (depuis proforma 13)
INSERT INTO ventes (refe, date_entree, proforma_id, client_id, date_effective, date_livraison, location_livraison, prix_total, remise_pourcentage, remise_fixe, process_id)
VALUES ('VENTE-2026-013', '2026-02-04 09:30:00',
    (SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-013'), 3,
    '2026-02-04', '2026-02-16', 'Ankorondrano Antananarivo',
    395000.00, NULL, 25000.00,
    (SELECT id FROM vente_processes WHERE abreviation = 'PREPAR'));

-- Vente 14: Prete (depuis proforma 14)
INSERT INTO ventes (refe, date_entree, proforma_id, client_id, date_effective, date_livraison, location_livraison, prix_total, remise_pourcentage, remise_fixe, process_id)
VALUES ('VENTE-2026-014', '2026-02-04 12:00:00',
    (SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-014'), 4,
    '2026-02-04', '2026-02-17', 'Antsirabe Centre',
    480000.00, 6.0, NULL,
    (SELECT id FROM vente_processes WHERE abreviation = 'PRETE'));

-- Vente 15: Livree (depuis proforma 15)
INSERT INTO ventes (refe, date_entree, proforma_id, client_id, date_effective, date_livraison, location_livraison, prix_total, remise_pourcentage, remise_fixe, process_id)
VALUES ('VENTE-2026-015', '2026-02-04 14:00:00',
    (SELECT id FROM proforma_ventes WHERE refe = 'PF-VENTE-2026-015'), 5,
    '2026-02-04', '2026-02-06', 'Toamasina Port',
    625000.00, 10.0, NULL,
    (SELECT id FROM vente_processes WHERE abreviation = 'LIVRE'));

-- =====================================================
-- 7. LIGNES DE VENTE
-- =====================================================
-- Vente 5 lignes
INSERT INTO vente_lignes (vente_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM ventes WHERE refe = 'VENTE-2026-005'), (SELECT id FROM articles WHERE refe = 'ALI-003'), 10, 48000.00, NULL, NULL),
    ((SELECT id FROM ventes WHERE refe = 'VENTE-2026-005'), (SELECT id FROM articles WHERE refe = 'ALI-008'), 1, 35000.00, NULL, NULL);

-- Vente 6 lignes
INSERT INTO vente_lignes (vente_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM ventes WHERE refe = 'VENTE-2026-006'), (SELECT id FROM articles WHERE refe = 'TEX-002'), 6, 52000.00, NULL, NULL),
    ((SELECT id FROM ventes WHERE refe = 'VENTE-2026-006'), (SELECT id FROM articles WHERE refe = 'TEX-004'), 2, 62000.00, NULL, NULL);

-- Vente 7 lignes
INSERT INTO vente_lignes (vente_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM ventes WHERE refe = 'VENTE-2026-007'), (SELECT id FROM articles WHERE refe = 'PAP-001'), 10, 25000.00, NULL, NULL),
    ((SELECT id FROM ventes WHERE refe = 'VENTE-2026-007'), (SELECT id FROM articles WHERE refe = 'PAP-003'), 5, 8000.00, NULL, NULL);

-- Vente 8 lignes
INSERT INTO vente_lignes (vente_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM ventes WHERE refe = 'VENTE-2026-008'), (SELECT id FROM articles WHERE refe = 'ALI-004'), 5, 105000.00, NULL, NULL),
    ((SELECT id FROM ventes WHERE refe = 'VENTE-2026-008'), (SELECT id FROM articles WHERE refe = 'ALI-001'), 2, 95000.00, NULL, NULL),
    ((SELECT id FROM ventes WHERE refe = 'VENTE-2026-008'), (SELECT id FROM articles WHERE refe = 'CHI-001'), 2, 22000.00, NULL, NULL);

-- Vente 9 lignes
INSERT INTO vente_lignes (vente_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM ventes WHERE refe = 'VENTE-2026-009'), (SELECT id FROM articles WHERE refe = 'TEX-003'), 8, 40000.00, NULL, NULL),
    ((SELECT id FROM ventes WHERE refe = 'VENTE-2026-009'), (SELECT id FROM articles WHERE refe = 'TEX-006'), 1, 145000.00, NULL, NULL);

-- Vente 10 lignes
INSERT INTO vente_lignes (vente_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM ventes WHERE refe = 'VENTE-2026-010'), (SELECT id FROM articles WHERE refe = 'ELE-001'), 20, 12000.00, NULL, NULL),
    ((SELECT id FROM ventes WHERE refe = 'VENTE-2026-010'), (SELECT id FROM articles WHERE refe = 'ELE-004'), 8, 18000.00, NULL, NULL);

-- Vente 12 lignes
INSERT INTO vente_lignes (vente_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM ventes WHERE refe = 'VENTE-2026-012'), (SELECT id FROM articles WHERE refe = 'ACC-001'), 8, 68250.00, NULL, NULL);

-- Vente 13 lignes
INSERT INTO vente_lignes (vente_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM ventes WHERE refe = 'VENTE-2026-013'), (SELECT id FROM articles WHERE refe = 'COS-002'), 15, 18720.00, NULL, NULL),
    ((SELECT id FROM ventes WHERE refe = 'VENTE-2026-013'), (SELECT id FROM articles WHERE refe = 'COS-003'), 4, 36400.00, NULL, NULL);

-- Vente 14 lignes
INSERT INTO vente_lignes (vente_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM ventes WHERE refe = 'VENTE-2026-014'), (SELECT id FROM articles WHERE refe = 'ALI-007'), 100, 3360.00, NULL, NULL),
    ((SELECT id FROM ventes WHERE refe = 'VENTE-2026-014'), (SELECT id FROM articles WHERE refe = 'TEX-001'), 8, 18540.00, NULL, NULL);

-- Vente 15 lignes
INSERT INTO vente_lignes (vente_id, article_id, quantite, prix_unitaire, remise_pourcentage, remise_fixe)
VALUES 
    ((SELECT id FROM ventes WHERE refe = 'VENTE-2026-015'), (SELECT id FROM articles WHERE refe = 'PAP-002'), 12, 45000.00, NULL, NULL),
    ((SELECT id FROM ventes WHERE refe = 'VENTE-2026-015'), (SELECT id FROM articles WHERE refe = 'CHI-002'), 4, 28560.00, NULL, NULL);

-- =====================================================
-- 8. HISTORIQUES DE VENTE
-- =====================================================
-- Vente 5 historiques (Confirmee)
INSERT INTO vente_historiques (date_entree, vente_id, process_id)
VALUES 
    ('2026-01-27 09:00:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-005'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'CONFIR'));

-- Vente 6 historiques (Confirmee)
INSERT INTO vente_historiques (date_entree, vente_id, process_id)
VALUES 
    ('2026-01-28 10:00:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-006'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'CONFIR'));

-- Vente 7 historiques (Confirmee -> En preparation)
INSERT INTO vente_historiques (date_entree, vente_id, process_id)
VALUES 
    ('2026-01-29 08:30:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-007'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'CONFIR')),
    ('2026-01-30 14:00:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-007'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'PREPAR'));

-- Vente 8 historiques (Confirmee -> En preparation -> Prete)
INSERT INTO vente_historiques (date_entree, vente_id, process_id)
VALUES 
    ('2026-01-30 11:00:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-008'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'CONFIR')),
    ('2026-01-31 10:00:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-008'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'PREPAR')),
    ('2026-02-01 15:00:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-008'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'PRETE'));

-- Vente 9 historiques (Confirmee -> En preparation -> Prete -> Livree)
INSERT INTO vente_historiques (date_entree, vente_id, process_id)
VALUES 
    ('2026-01-31 09:00:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-009'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'CONFIR')),
    ('2026-01-31 14:00:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-009'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'PREPAR')),
    ('2026-02-01 10:00:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-009'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'PRETE')),
    ('2026-02-02 11:00:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-009'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'LIVRE'));

-- Vente 10 historiques (Confirmee -> En preparation -> Prete -> Livree)
INSERT INTO vente_historiques (date_entree, vente_id, process_id)
VALUES 
    ('2026-02-01 10:00:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-010'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'CONFIR')),
    ('2026-02-01 15:00:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-010'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'PREPAR')),
    ('2026-02-02 10:00:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-010'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'PRETE')),
    ('2026-02-03 09:00:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-010'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'LIVRE'));

-- Vente 12 historiques (Confirmee)
INSERT INTO vente_historiques (date_entree, vente_id, process_id)
VALUES 
    ('2026-02-03 08:00:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-012'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'CONFIR'));

-- Vente 13 historiques (Confirmee -> En preparation)
INSERT INTO vente_historiques (date_entree, vente_id, process_id)
VALUES 
    ('2026-02-04 09:30:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-013'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'CONFIR')),
    ('2026-02-04 14:00:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-013'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'PREPAR'));

-- Vente 14 historiques (Confirmee -> En preparation -> Prete)
INSERT INTO vente_historiques (date_entree, vente_id, process_id)
VALUES 
    ('2026-02-04 12:00:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-014'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'CONFIR')),
    ('2026-02-04 15:00:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-014'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'PREPAR')),
    ('2026-02-04 17:00:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-014'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'PRETE'));

-- Vente 15 historiques (Confirmee -> En preparation -> Prete -> Livree)
INSERT INTO vente_historiques (date_entree, vente_id, process_id)
VALUES 
    ('2026-02-04 14:00:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-015'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'CONFIR')),
    ('2026-02-04 16:00:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-015'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'PREPAR')),
    ('2026-02-05 10:00:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-015'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'PRETE')),
    ('2026-02-06 09:00:00', (SELECT id FROM ventes WHERE refe = 'VENTE-2026-015'), 
        (SELECT id FROM vente_processes WHERE abreviation = 'LIVRE'));

-- =====================================================
-- 9. LIVRAISONS VENTE (pour les ventes livrees)
-- =====================================================
-- Livraison pour vente 9 (Livree)
INSERT INTO livraison_ventes (refe, date_entree, vente_id, process_id)
VALUES ('LIV-VENTE-2026-009', '2026-02-02 10:00:00',
    (SELECT id FROM ventes WHERE refe = 'VENTE-2026-009'),
    (SELECT id FROM livraison_vente_processes WHERE abreviation = 'LIVRE'));

-- Livraison pour vente 10 (Livree)
INSERT INTO livraison_ventes (refe, date_entree, vente_id, process_id)
VALUES ('LIV-VENTE-2026-010', '2026-02-03 08:00:00',
    (SELECT id FROM ventes WHERE refe = 'VENTE-2026-010'),
    (SELECT id FROM livraison_vente_processes WHERE abreviation = 'LIVRE'));

-- Livraison pour vente 15 (Livree)
INSERT INTO livraison_ventes (refe, date_entree, vente_id, process_id)
VALUES ('LIV-VENTE-2026-015', '2026-02-06 08:30:00',
    (SELECT id FROM ventes WHERE refe = 'VENTE-2026-015'),
    (SELECT id FROM livraison_vente_processes WHERE abreviation = 'LIVRE'));

-- =====================================================
-- 10. LIGNES DE LIVRAISON VENTE
-- =====================================================
-- Livraison vente 9 lignes (livraison complete)
INSERT INTO livraison_vente_lignes (livraison_id, article_id, quantite)
VALUES 
    ((SELECT id FROM livraison_ventes WHERE refe = 'LIV-VENTE-2026-009'), 
        (SELECT id FROM articles WHERE refe = 'TEX-003'), 8),
    ((SELECT id FROM livraison_ventes WHERE refe = 'LIV-VENTE-2026-009'), 
        (SELECT id FROM articles WHERE refe = 'TEX-006'), 1);

-- Livraison vente 10 lignes (livraison complete)
INSERT INTO livraison_vente_lignes (livraison_id, article_id, quantite)
VALUES 
    ((SELECT id FROM livraison_ventes WHERE refe = 'LIV-VENTE-2026-010'), 
        (SELECT id FROM articles WHERE refe = 'ELE-001'), 20),
    ((SELECT id FROM livraison_ventes WHERE refe = 'LIV-VENTE-2026-010'), 
        (SELECT id FROM articles WHERE refe = 'ELE-004'), 8);

-- Livraison vente 15 lignes (livraison complete)
INSERT INTO livraison_vente_lignes (livraison_id, article_id, quantite)
VALUES 
    ((SELECT id FROM livraison_ventes WHERE refe = 'LIV-VENTE-2026-015'), 
        (SELECT id FROM articles WHERE refe = 'PAP-002'), 12),
    ((SELECT id FROM livraison_ventes WHERE refe = 'LIV-VENTE-2026-015'), 
        (SELECT id FROM articles WHERE refe = 'CHI-002'), 4);

-- =====================================================
-- 11. HISTORIQUES DE LIVRAISON VENTE
-- =====================================================
-- Livraison 9 historiques (En preparation -> Expediee -> Livree)
INSERT INTO livraison_vente_historiques (date_entree, livraison_id, process_id)
VALUES 
    ('2026-02-02 10:00:00', (SELECT id FROM livraison_ventes WHERE refe = 'LIV-VENTE-2026-009'), 
        (SELECT id FROM livraison_vente_processes WHERE abreviation = 'PREPAR')),
    ('2026-02-02 14:00:00', (SELECT id FROM livraison_ventes WHERE refe = 'LIV-VENTE-2026-009'), 
        (SELECT id FROM livraison_vente_processes WHERE abreviation = 'EXPED')),
    ('2026-02-02 18:00:00', (SELECT id FROM livraison_ventes WHERE refe = 'LIV-VENTE-2026-009'), 
        (SELECT id FROM livraison_vente_processes WHERE abreviation = 'LIVRE'));

-- Livraison 10 historiques (En preparation -> Expediee -> Livree)
INSERT INTO livraison_vente_historiques (date_entree, livraison_id, process_id)
VALUES 
    ('2026-02-03 08:00:00', (SELECT id FROM livraison_ventes WHERE refe = 'LIV-VENTE-2026-010'), 
        (SELECT id FROM livraison_vente_processes WHERE abreviation = 'PREPAR')),
    ('2026-02-03 11:00:00', (SELECT id FROM livraison_ventes WHERE refe = 'LIV-VENTE-2026-010'), 
        (SELECT id FROM livraison_vente_processes WHERE abreviation = 'EXPED')),
    ('2026-02-03 15:00:00', (SELECT id FROM livraison_ventes WHERE refe = 'LIV-VENTE-2026-010'), 
        (SELECT id FROM livraison_vente_processes WHERE abreviation = 'LIVRE'));

-- Livraison 15 historiques (En preparation -> Expediee -> Livree)
INSERT INTO livraison_vente_historiques (date_entree, livraison_id, process_id)
VALUES 
    ('2026-02-06 08:30:00', (SELECT id FROM livraison_ventes WHERE refe = 'LIV-VENTE-2026-015'), 
        (SELECT id FROM livraison_vente_processes WHERE abreviation = 'PREPAR')),
    ('2026-02-06 10:00:00', (SELECT id FROM livraison_ventes WHERE refe = 'LIV-VENTE-2026-015'), 
        (SELECT id FROM livraison_vente_processes WHERE abreviation = 'EXPED')),
    ('2026-02-06 14:00:00', (SELECT id FROM livraison_ventes WHERE refe = 'LIV-VENTE-2026-015'), 
        (SELECT id FROM livraison_vente_processes WHERE abreviation = 'LIVRE'));

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
-- RESUME DES DONNEES CREEES:
-- - 10 clients
-- - 60 prix d'articles (30 articles × 2 dates)
-- - 15 proformas de vente (avec differents statuts)
-- - 11 ventes (depuis les proformas transformes)
-- - 22 lignes de vente (1 a 3 par vente)
-- - 36 historiques de vente
-- - 3 livraisons de vente (pour les ventes livrees)
-- - 6 lignes de livraison
-- - 9 historiques de livraison
-- =====================================================

-- =====================================================
-- DONNEES REALISTES ERP - WORKFLOW ACHAT COMPLET
-- =====================================================
-- Ce script genere des donnees coherentes pour un ERP avec:
-- - 30 articles varies
-- - 2 entities (entreprises)
-- - 3 depots
-- - 15 achats avec workflow complet et changements de statuts
-- - 2-4 proformas par achat (avec variations de prix)
-- - Bons de commande bases sur le proforma le moins cher
-- - Receptions et livraisons avec quantites variables
-- =====================================================
-- PREREQUIS: Executer table.sql et dataAchat.sql avant ce script
-- =====================================================

-- =====================================================
-- 1. NETTOYAGE DES DONNEES EXISTANTES
-- =====================================================
TRUNCATE TABLE lot_mouvements CASCADE;
TRUNCATE TABLE lots CASCADE;
TRUNCATE TABLE reception_achat_lignes CASCADE;
TRUNCATE TABLE reception_achats CASCADE;
TRUNCATE TABLE livraison_achat_lignes CASCADE;
TRUNCATE TABLE livraison_achats CASCADE;
TRUNCATE TABLE bon_commande_historiques CASCADE;
TRUNCATE TABLE bon_commande_achat_lignes CASCADE;
TRUNCATE TABLE bon_commandes_achats CASCADE;
TRUNCATE TABLE proforma_achat_lignes CASCADE;
TRUNCATE TABLE proforma_achats CASCADE;
TRUNCATE TABLE achat_historiques CASCADE;
TRUNCATE TABLE achat_lignes CASCADE;
TRUNCATE TABLE achats CASCADE;
TRUNCATE TABLE article_prix CASCADE;
TRUNCATE TABLE article_entities CASCADE;
TRUNCATE TABLE articles CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE fournisseurs CASCADE;
TRUNCATE TABLE entity_depots CASCADE;
TRUNCATE TABLE depots CASCADE;
TRUNCATE TABLE entities CASCADE;
TRUNCATE TABLE utilisateurs CASCADE;
TRUNCATE TABLE roles CASCADE;
TRUNCATE TABLE departments CASCADE;

-- =====================================================
-- 2. DEPARTMENTS ET ROLES
-- =====================================================
INSERT INTO departments (id, department_name) VALUES
(1, 'Administration'),
(2, 'Achats'),
(3, 'Ventes'),
(4, 'Magasin'),
(5, 'Finance');

INSERT INTO roles (role_code, role_name, niveau_acces, department_id) VALUES
('ADMIN', 'Administrateur', 100, 1),
('RESP_ACHAT', 'Responsable Achats', 29, 2),
('EMP_ACHAT', 'Employe Achats', 25, 2),
('RESP_VENTE', 'Responsable Ventes', 39, 3),
('EMP_VENTE', 'Employe Ventes', 35, 3),
('RESP_MAGASIN', 'Responsable Magasin', 49, 4),
('MAGRECEP', 'Magasinier Reception', 45, 4),
('MAGSORT', 'Magasinier Sortie', 45, 4),
('EMP_MAGASIN', 'Employe Magasin', 42, 4),
('FINANCE', 'Responsable Finance', 59, 5),
('RESP_FINANCE', 'Directeur Financier', 55, 5);

-- =====================================================
-- 3. ENTITIES (2 entreprises)
-- =====================================================
INSERT INTO entities (entity_name) VALUES
('GestionMada SARL'),
('GestionMada Filiale Antsirabe');

-- =====================================================
-- 4. DEPOTS (3 depots)
-- =====================================================
INSERT INTO depots (depot_name) VALUES
('Depot Central Antananarivo'),
('Depot Regional Antsirabe'),
('Depot Annexe Toamasina');

-- =====================================================
-- 5. ASSOCIATION ENTITIES-DEPOTS
-- =====================================================
INSERT INTO entity_depots (entity_id, depot_id) VALUES
(1, 3), -- Entity 1 utilise Depot 1
(1, 4), -- Entity 1 utilise Depot 2
(1, 4), -- Entity 1 utilise Depot 3
(2, 3), -- Entity 2 utilise Depot 2
(2, 5); -- Entity 2 utilise Depot 3

-- =====================================================
-- 6. UTILISATEURS
-- =====================================================
INSERT INTO utilisateurs (nom, email, mot_de_passe, role_id, entity_id) VALUES
('Admin Principal', 'admin@gestionmada.mg', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', (SELECT id FROM roles WHERE role_code = 'ADMIN'), 1),
('Rakoto Jean', 'j.rakoto@gestionmada.mg', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', (SELECT id FROM roles WHERE role_code = 'RESP_ACHAT'), 1),
('Rasoa Marie', 'm.rasoa@gestionmada.mg', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', (SELECT id FROM roles WHERE role_code = 'EMP_ACHAT'), 1),
('Rabe Paul', 'p.rabe@gestionmada.mg', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', (SELECT id FROM roles WHERE role_code = 'RESP_VENTE'), 1),
('Hery Sophie', 's.hery@gestionmada.mg', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', (SELECT id FROM roles WHERE role_code = 'EMP_VENTE'), 1),
('Nivo Patrick', 'p.nivo@gestionmada.mg', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', (SELECT id FROM roles WHERE role_code = 'RESP_MAGASIN'), 1),
('Faly Julie', 'j.faly@gestionmada.mg', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', (SELECT id FROM roles WHERE role_code = 'MAGRECEP'), 1),
('Toky David', 'd.toky@gestionmada.mg', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', (SELECT id FROM roles WHERE role_code = 'MAGSORT'), 1),
('Ravelo Nadia', 'n.ravelo@gestionmada.mg', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', (SELECT id FROM roles WHERE role_code = 'FINANCE'), 1),
('Andria Luc', 'l.andria@gestionmada.mg', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', (SELECT id FROM roles WHERE role_code = 'EMP_ACHAT'), 2);

-- =====================================================
-- 7. CATEGORIES
-- =====================================================
INSERT INTO categories (categorie_name, description) VALUES
('Alimentaire', 'Produits alimentaires et boissons'),
('Textile', 'Vetements et tissus'),
('Electronique', 'Materiel electronique et informatique'),
('Cosmetique', 'Produits de beaute et soins'),
('Mobilier', 'Meubles et equipements'),
('Papeterie', 'Fournitures de bureau'),
('Chimique', 'Produits chimiques et nettoyage'),
('Accessoires', 'Accessoires divers');

-- =====================================================
-- 8. ARTICLES (30 articles varies)
-- =====================================================
INSERT INTO articles (refe, article_nom, valorisation, description, categorie_id, unite_id) VALUES
-- Alimentaire (8 articles)
('ALI-001', 'Riz Blanc Premium 50kg', 'FIFO', 'Sac de riz blanc de qualite superieure', (SELECT id FROM categories WHERE categorie_name = 'Alimentaire'), (SELECT id FROM unites WHERE abreviation = 'kg')),
('ALI-002', 'Huile de Tournesol 5L', 'FIFO', 'Bidon huile vegetale 5 litres', (SELECT id FROM categories WHERE categorie_name = 'Alimentaire'), (SELECT id FROM unites WHERE abreviation = 'L')),
('ALI-003', 'Farine de Ble 25kg', 'FIFO', 'Farine type 55 pour boulangerie', (SELECT id FROM categories WHERE categorie_name = 'Alimentaire'), (SELECT id FROM unites WHERE abreviation = 'kg')),
('ALI-004', 'Sucre Blanc 50kg', 'CMUP', 'Sucre cristallise blanc', (SELECT id FROM categories WHERE categorie_name = 'Alimentaire'), (SELECT id FROM unites WHERE abreviation = 'kg')),
('ALI-005', 'Cafe Moulu 500g', 'FIFO', 'Cafe arabica moulu', (SELECT id FROM categories WHERE categorie_name = 'Alimentaire'), (SELECT id FROM unites WHERE abreviation = 'kg')),
('ALI-006', 'Conserve Tomate 800g', 'FIFO', 'Concentre de tomate en conserve', (SELECT id FROM categories WHERE categorie_name = 'Alimentaire'), (SELECT id FROM unites WHERE abreviation = 'u')),
('ALI-007', 'Pates Alimentaires 500g', 'CMUP', 'Pates spaghetti qualite premium', (SELECT id FROM categories WHERE categorie_name = 'Alimentaire'), (SELECT id FROM unites WHERE abreviation = 'u')),
('ALI-008', 'Lait en Poudre 1kg', 'FIFO', 'Lait entier en poudre', (SELECT id FROM categories WHERE categorie_name = 'Alimentaire'), (SELECT id FROM unites WHERE abreviation = 'kg')),

-- Textile (6 articles)
('TEX-001', 'T-Shirt Coton Homme', 'CMUP', 'T-shirt 100% coton diverses tailles', (SELECT id FROM categories WHERE categorie_name = 'Textile'), (SELECT id FROM unites WHERE abreviation = 'u')),
('TEX-002', 'Pantalon Jean Femme', 'CMUP', 'Jean coupe moderne toutes tailles', (SELECT id FROM categories WHERE categorie_name = 'Textile'), (SELECT id FROM unites WHERE abreviation = 'u')),
('TEX-003', 'Chemise Homme Classique', 'CMUP', 'Chemise manches longues diverses couleurs', (SELECT id FROM categories WHERE categorie_name = 'Textile'), (SELECT id FROM unites WHERE abreviation = 'u')),
('TEX-004', 'Robe Femme Ete', 'CMUP', 'Robe legere motifs varies', (SELECT id FROM categories WHERE categorie_name = 'Textile'), (SELECT id FROM unites WHERE abreviation = 'u')),
('TEX-005', 'Chaussettes Pack 5', 'CMUP', 'Pack de 5 paires de chaussettes', (SELECT id FROM categories WHERE categorie_name = 'Textile'), (SELECT id FROM unites WHERE abreviation = 'u')),
('TEX-006', 'Veste Hiver', 'CMUP', 'Veste chaude impermeable', (SELECT id FROM categories WHERE categorie_name = 'Textile'), (SELECT id FROM unites WHERE abreviation = 'u')),

-- Electronique (5 articles)
('ELE-001', 'Cable USB-C 2m', 'CMUP', 'Cable de charge rapide USB-C', (SELECT id FROM categories WHERE categorie_name = 'Electronique'), (SELECT id FROM unites WHERE abreviation = 'u')),
('ELE-002', 'Souris Sans Fil', 'CMUP', 'Souris optique ergonomique', (SELECT id FROM categories WHERE categorie_name = 'Electronique'), (SELECT id FROM unites WHERE abreviation = 'u')),
('ELE-003', 'Clavier AZERTY', 'CMUP', 'Clavier filaire standard', (SELECT id FROM categories WHERE categorie_name = 'Electronique'), (SELECT id FROM unites WHERE abreviation = 'u')),
('ELE-004', 'Multiprise 4 Prises', 'CMUP', 'Multiprise avec interrupteur', (SELECT id FROM categories WHERE categorie_name = 'Electronique'), (SELECT id FROM unites WHERE abreviation = 'u')),
('ELE-005', 'Lampe LED Bureau', 'CMUP', 'Lampe de bureau reglable', (SELECT id FROM categories WHERE categorie_name = 'Electronique'), (SELECT id FROM unites WHERE abreviation = 'u')),

-- Cosmetique (5 articles)
('COS-001', 'Shampooing 500ml', 'FIFO', 'Shampooing tous types cheveux', (SELECT id FROM categories WHERE categorie_name = 'Cosmetique'), (SELECT id FROM unites WHERE abreviation = 'L')),
('COS-002', 'Gel Douche 1L', 'FIFO', 'Gel douche hydratant', (SELECT id FROM categories WHERE categorie_name = 'Cosmetique'), (SELECT id FROM unites WHERE abreviation = 'L')),
('COS-003', 'Creme Visage 50ml', 'FIFO', 'Creme hydratante visage', (SELECT id FROM categories WHERE categorie_name = 'Cosmetique'), (SELECT id FROM unites WHERE abreviation = 'u')),
('COS-004', 'Dentifrice 75ml', 'FIFO', 'Dentifrice menthe fraiche', (SELECT id FROM categories WHERE categorie_name = 'Cosmetique'), (SELECT id FROM unites WHERE abreviation = 'u')),
('COS-005', 'Deodorant Spray 150ml', 'FIFO', 'Deodorant longue duree', (SELECT id FROM categories WHERE categorie_name = 'Cosmetique'), (SELECT id FROM unites WHERE abreviation = 'u')),

-- Papeterie (3 articles)
('PAP-001', 'Ramette Papier A4', 'CMUP', 'Ramette 500 feuilles A4 80g', (SELECT id FROM categories WHERE categorie_name = 'Papeterie'), (SELECT id FROM unites WHERE abreviation = 'u')),
('PAP-002', 'Stylo Bille Bleu', 'CMUP', 'Boite de 50 stylos bleus', (SELECT id FROM categories WHERE categorie_name = 'Papeterie'), (SELECT id FROM unites WHERE abreviation = 'box')),
('PAP-003', 'Classeur A4', 'CMUP', 'Classeur carton rigide', (SELECT id FROM categories WHERE categorie_name = 'Papeterie'), (SELECT id FROM unites WHERE abreviation = 'u')),

-- Chimique (2 articles)
('CHI-001', 'Javel 5L', 'CMUP', 'Eau de javel concentree', (SELECT id FROM categories WHERE categorie_name = 'Chimique'), (SELECT id FROM unites WHERE abreviation = 'L')),
('CHI-002', 'Savon Liquide 5L', 'CMUP', 'Savon liquide mains', (SELECT id FROM categories WHERE categorie_name = 'Chimique'), (SELECT id FROM unites WHERE abreviation = 'L')),

-- Accessoires (1 article)
('ACC-001', 'Sac a Dos', 'CMUP', 'Sac a dos polyvalent 25L', (SELECT id FROM categories WHERE categorie_name = 'Accessoires'), (SELECT id FROM unites WHERE abreviation = 'u'));

-- =====================================================
-- 9. ARTICLE-ENTITIES (Association articles-entities)
-- =====================================================
-- Tous les articles sont disponibles pour les 2 entities
INSERT INTO article_entities (entity_id, article_id)
SELECT e.id, a.id
FROM entities e
CROSS JOIN articles a;

-- =====================================================
-- 10. PRIX DES ARTICLES
-- =====================================================
INSERT INTO article_prix (article_id, prix, date_entree)
SELECT ae.id,
    CASE a.refe
        -- Alimentaire
        WHEN 'ALI-001' THEN 85000.00
        WHEN 'ALI-002' THEN 22000.00
        WHEN 'ALI-003' THEN 45000.00
        WHEN 'ALI-004' THEN 95000.00
        WHEN 'ALI-005' THEN 18000.00
        WHEN 'ALI-006' THEN 3500.00
        WHEN 'ALI-007' THEN 2800.00
        WHEN 'ALI-008' THEN 32000.00
        -- Textile
        WHEN 'TEX-001' THEN 15000.00
        WHEN 'TEX-002' THEN 45000.00
        WHEN 'TEX-003' THEN 35000.00
        WHEN 'TEX-004' THEN 55000.00
        WHEN 'TEX-005' THEN 8000.00
        WHEN 'TEX-006' THEN 125000.00
        -- Electronique
        WHEN 'ELE-001' THEN 4500.00
        WHEN 'ELE-002' THEN 18000.00
        WHEN 'ELE-003' THEN 25000.00
        WHEN 'ELE-004' THEN 12000.00
        WHEN 'ELE-005' THEN 35000.00
        -- Cosmetique
        WHEN 'COS-001' THEN 8500.00
        WHEN 'COS-002' THEN 12000.00
        WHEN 'COS-003' THEN 25000.00
        WHEN 'COS-004' THEN 3200.00
        WHEN 'COS-005' THEN 6500.00
        -- Papeterie
        WHEN 'PAP-001' THEN 12000.00
        WHEN 'PAP-002' THEN 35000.00
        WHEN 'PAP-003' THEN 4500.00
        -- Chimique
        WHEN 'CHI-001' THEN 15000.00
        WHEN 'CHI-002' THEN 22000.00
        -- Accessoires
        WHEN 'ACC-001' THEN 85000.00
        ELSE 10000.00
    END,
    NOW()
FROM article_entities ae
JOIN articles a ON a.id = ae.article_id;

-- =====================================================
-- 11. FOURNISSEURS (10 fournisseurs)
-- =====================================================
INSERT INTO fournisseurs (fournisseur_nom, contact, adresse, coordonnee_bancaire) VALUES
('Madagascar Import SARL', 'Tel:+261341234567; contact@madaimport.mg', 'Zone Industrielle Forello, Antananarivo', 'BIC:BNGMMGXXXX - ACC: 10001234567'),
('Grossiste Central SA', 'Tel:+261320345678; ventes@grossistecentral.mg', 'Analakely, Antananarivo', 'BIC:BFITMGXXX - ACC: 10009876543'),
('FoodSupply Madagascar', 'Tel:+261331122334; commande@foodsupply.mg', 'Rue du Commerce, Toamasina', 'BIC:ERAKMGXXX - ACC: 10001122334'),
('Textile Pro Ltd', 'Tel:+261342233445; textile@texpro.mg', 'Zone Industrielle, Antsirabe', 'BIC:MDTMGXXX - ACC: 10005566778'),
('TechnoMada Equipement', 'Tel:+261333344556; info@technomada.mg', 'Avenue de la Technologie, Antananarivo', 'BIC:TECHMGXXX - ACC: 10007788990'),
('Beauty Import Co', 'Tel:+261344455667; contact@beautyimport.mg', 'Ampefiloha, Antananarivo', 'BIC:BNGMMGXXXX - ACC: 10002233445'),
('Bureau Plus SARL', 'Tel:+261335566778; vente@bureauplus.mg', 'Analakely, Antananarivo', 'BIC:BFITMGXXX - ACC: 10009988776'),
('ChimiClean Madagascar', 'Tel:+261336677889; order@chimiclean.mg', 'Zone Industrielle, Toamasina', 'BIC:ERAKMGXXX - ACC: 10005544332'),
('Fashion Accessories SA', 'Tel:+261337788990; sales@fashionacc.mg', 'Rue de la Mode, Antananarivo', 'BIC:MDTMGXXX - ACC: 10003344556'),
('Multi-Produits SARL', 'Tel:+261338899001; contact@multiproduits.mg', 'Mahamasina, Antananarivo', 'BIC:BNGMMGXXXX - ACC: 10006677889');

-- =====================================================
-- 12. ACHATS (15 achats avec workflow complet)
-- =====================================================

-- ========== ACHAT 1 ==========
-- Achat alimentaire - Workflow complet jusqu'a cloture
INSERT INTO achats (date_entree, demandeur, date_effective, process_id, refe) VALUES
('2025-10-01 09:00:00', 2, '2025-10-01', (SELECT id FROM achat_processes WHERE abreviation = 'CL'), 'ACH-2025-001');

INSERT INTO achat_lignes (achat_id, article_id, quantite, prix_unitaire, prix_unitaire_estime) VALUES
(1, (SELECT id FROM articles WHERE refe = 'ALI-001'), 100, 82000.00, 85000.00),
(1, (SELECT id FROM articles WHERE refe = 'ALI-002'), 200, 21500.00, 22000.00),
(1, (SELECT id FROM articles WHERE refe = 'ALI-004'), 50, 93000.00, 95000.00);

-- Historique Achat 1
INSERT INTO achat_historiques (date_entree, achat_id, process_id) VALUES
('2025-10-01 09:00:00', 1, (SELECT id FROM achat_processes WHERE abreviation = 'CR')),
('2025-10-01 14:30:00', 1, (SELECT id FROM achat_processes WHERE abreviation = 'VM')),
('2025-10-02 10:00:00', 1, (SELECT id FROM achat_processes WHERE abreviation = 'VC')),
('2025-10-02 15:00:00', 1, (SELECT id FROM achat_processes WHERE abreviation = 'DP')),
('2025-10-05 11:00:00', 1, (SELECT id FROM achat_processes WHERE abreviation = 'EC')),
('2025-10-12 09:30:00', 1, (SELECT id FROM achat_processes WHERE abreviation = 'RE')),
('2025-10-15 16:00:00', 1, (SELECT id FROM achat_processes WHERE abreviation = 'VF')),
('2025-10-16 10:00:00', 1, (SELECT id FROM achat_processes WHERE abreviation = 'CL'));

-- Proformas Achat 1 (3 proformas avec prix differents)
INSERT INTO proforma_achats (achat_id, fournisseur_id, date_entree, montant_total, lien_fichier, refe) VALUES
(1, 1, '2025-10-03 10:00:00', 14020000.00, NULL, 'PF-ACH-2025-001-F1'),
(1, 3, '2025-10-03 11:30:00', 13850000.00, NULL, 'PF-ACH-2025-001-F2'),
(1, 10, '2025-10-03 14:00:00', 14200000.00, NULL, 'PF-ACH-2025-001-F3');

INSERT INTO proforma_achat_lignes (proforma_id, article_id, quantite, prix_unitaire) VALUES
-- Proforma 1
(1, (SELECT id FROM articles WHERE refe = 'ALI-001'), 100, 83000.00),
(1, (SELECT id FROM articles WHERE refe = 'ALI-002'), 200, 22000.00),
(1, (SELECT id FROM articles WHERE refe = 'ALI-004'), 50, 94000.00),
-- Proforma 2 (meilleur prix)
(2, (SELECT id FROM articles WHERE refe = 'ALI-001'), 100, 82000.00),
(2, (SELECT id FROM articles WHERE refe = 'ALI-002'), 200, 21500.00),
(2, (SELECT id FROM articles WHERE refe = 'ALI-004'), 50, 93000.00),
-- Proforma 3
(3, (SELECT id FROM articles WHERE refe = 'ALI-001'), 100, 84000.00),
(3, (SELECT id FROM articles WHERE refe = 'ALI-002'), 200, 22500.00),
(3, (SELECT id FROM articles WHERE refe = 'ALI-004'), 50, 94000.00);

-- Bon de Commande Achat 1 (base sur proforma 2 - moins cher)
INSERT INTO bon_commandes_achats (proforma_id, date_entree, montant_total, process_id, refe) VALUES
(2, '2025-10-05 11:00:00', 13850000.00, (SELECT id FROM bon_commande_processes WHERE abreviation = 'CL'), 'BC-ACH-2025-001');

INSERT INTO bon_commande_achat_lignes (bon_commande_id, article_id, quantite, prix_unitaire) VALUES
(1, (SELECT id FROM articles WHERE refe = 'ALI-001'), 100, 82000.00),
(1, (SELECT id FROM articles WHERE refe = 'ALI-002'), 200, 21500.00),
(1, (SELECT id FROM articles WHERE refe = 'ALI-004'), 50, 93000.00);

INSERT INTO bon_commande_historiques (date_entree, bon_commande_id, process_id) VALUES
('2025-10-05 11:00:00', 1, (SELECT id FROM bon_commande_processes WHERE abreviation = 'CR')),
('2025-10-05 15:00:00', 1, (SELECT id FROM bon_commande_processes WHERE abreviation = 'VA')),
('2025-10-06 09:00:00', 1, (SELECT id FROM bon_commande_processes WHERE abreviation = 'EC')),
('2025-10-12 09:30:00', 1, (SELECT id FROM bon_commande_processes WHERE abreviation = 'RE')),
('2025-10-16 10:00:00', 1, (SELECT id FROM bon_commande_processes WHERE abreviation = 'CL'));

-- Reception Achat 1
INSERT INTO reception_achats (bon_commande_id, date_entree, refe) VALUES
(1, '2025-10-12 09:30:00', 'REC-ACH-2025-001');

INSERT INTO reception_achat_lignes (reception_id, article_id, depot_id, quantite) VALUES
(1, (SELECT id FROM articles WHERE refe = 'ALI-001'), 1, 100),
(1, (SELECT id FROM articles WHERE refe = 'ALI-002'), 1, 200),
(1, (SELECT id FROM articles WHERE refe = 'ALI-004'), 1, 50);

-- Livraison Achat 1
INSERT INTO livraison_achats (bon_commande_id, date_entree, refe) VALUES
(1, '2025-10-12 09:30:00', 'LIV-ACH-2025-001');

INSERT INTO livraison_achat_lignes (livraison_id, article_id, quantite) VALUES
(1, (SELECT id FROM articles WHERE refe = 'ALI-001'), 100),
(1, (SELECT id FROM articles WHERE refe = 'ALI-002'), 200),
(1, (SELECT id FROM articles WHERE refe = 'ALI-004'), 50);

-- ========== ACHAT 2 ==========
-- Achat textile - En cours de reception
INSERT INTO achats (date_entree, demandeur, date_effective, process_id, refe) VALUES
('2025-10-05 10:30:00', 3, '2025-10-05', (SELECT id FROM achat_processes WHERE abreviation = 'RE'), 'ACH-2025-002');

INSERT INTO achat_lignes (achat_id, article_id, quantite, prix_unitaire, prix_unitaire_estime) VALUES
(2, (SELECT id FROM articles WHERE refe = 'TEX-001'), 500, 14000.00, 15000.00),
(2, (SELECT id FROM articles WHERE refe = 'TEX-002'), 300, 42000.00, 45000.00),
(2, (SELECT id FROM articles WHERE refe = 'TEX-005'), 200, 7500.00, 8000.00);

INSERT INTO achat_historiques (date_entree, achat_id, process_id) VALUES
('2025-10-05 10:30:00', 2, (SELECT id FROM achat_processes WHERE abreviation = 'CR')),
('2025-10-05 16:00:00', 2, (SELECT id FROM achat_processes WHERE abreviation = 'VM')),
('2025-10-06 11:00:00', 2, (SELECT id FROM achat_processes WHERE abreviation = 'VC')),
('2025-10-07 09:00:00', 2, (SELECT id FROM achat_processes WHERE abreviation = 'DP')),
('2025-10-10 14:00:00', 2, (SELECT id FROM achat_processes WHERE abreviation = 'EC')),
('2025-10-18 10:00:00', 2, (SELECT id FROM achat_processes WHERE abreviation = 'RE'));

-- Proformas Achat 2 (4 proformas)
INSERT INTO proforma_achats (achat_id, fournisseur_id, date_entree, montant_total, lien_fichier, refe) VALUES
(2, 4, '2025-10-08 09:00:00', 21100000.00, NULL, 'PF-ACH-2025-002-F1'),
(2, 10, '2025-10-08 10:30:00', 20600000.00, NULL, 'PF-ACH-2025-002-F2'),
(2, 1, '2025-10-08 14:00:00', 21400000.00, NULL, 'PF-ACH-2025-002-F3'),
(2, 9, '2025-10-08 15:30:00', 20800000.00, NULL, 'PF-ACH-2025-002-F4');

INSERT INTO proforma_achat_lignes (proforma_id, article_id, quantite, prix_unitaire) VALUES
-- Proforma 1
(4, (SELECT id FROM articles WHERE refe = 'TEX-001'), 500, 14500.00),
(4, (SELECT id FROM articles WHERE refe = 'TEX-002'), 300, 43000.00),
(4, (SELECT id FROM articles WHERE refe = 'TEX-005'), 200, 7800.00),
-- Proforma 2 (meilleur prix)
(5, (SELECT id FROM articles WHERE refe = 'TEX-001'), 500, 14000.00),
(5, (SELECT id FROM articles WHERE refe = 'TEX-002'), 300, 42000.00),
(5, (SELECT id FROM articles WHERE refe = 'TEX-005'), 200, 7500.00),
-- Proforma 3
(6, (SELECT id FROM articles WHERE refe = 'TEX-001'), 500, 14800.00),
(6, (SELECT id FROM articles WHERE refe = 'TEX-002'), 300, 43500.00),
(6, (SELECT id FROM articles WHERE refe = 'TEX-005'), 200, 7900.00),
-- Proforma 4
(7, (SELECT id FROM articles WHERE refe = 'TEX-001'), 500, 14200.00),
(7, (SELECT id FROM articles WHERE refe = 'TEX-002'), 300, 42500.00),
(7, (SELECT id FROM articles WHERE refe = 'TEX-005'), 200, 7600.00);

INSERT INTO bon_commandes_achats (proforma_id, date_entree, montant_total, process_id, refe) VALUES
(5, '2025-10-10 14:00:00', 20600000.00, (SELECT id FROM bon_commande_processes WHERE abreviation = 'RE'), 'BC-ACH-2025-002');

INSERT INTO bon_commande_achat_lignes (bon_commande_id, article_id, quantite, prix_unitaire) VALUES
(2, (SELECT id FROM articles WHERE refe = 'TEX-001'), 500, 14000.00),
(2, (SELECT id FROM articles WHERE refe = 'TEX-002'), 300, 42000.00),
(2, (SELECT id FROM articles WHERE refe = 'TEX-005'), 200, 7500.00);

INSERT INTO bon_commande_historiques (date_entree, bon_commande_id, process_id) VALUES
('2025-10-10 14:00:00', 2, (SELECT id FROM bon_commande_processes WHERE abreviation = 'CR')),
('2025-10-11 09:00:00', 2, (SELECT id FROM bon_commande_processes WHERE abreviation = 'VA')),
('2025-10-11 14:00:00', 2, (SELECT id FROM bon_commande_processes WHERE abreviation = 'EC')),
('2025-10-18 10:00:00', 2, (SELECT id FROM bon_commande_processes WHERE abreviation = 'RE'));

-- Reception partielle Achat 2
INSERT INTO reception_achats (bon_commande_id, date_entree, refe) VALUES
(2, '2025-10-18 10:00:00', 'REC-ACH-2025-002');

INSERT INTO reception_achat_lignes (reception_id, article_id, depot_id, quantite) VALUES
(2, (SELECT id FROM articles WHERE refe = 'TEX-001'), 1, 500),
(2, (SELECT id FROM articles WHERE refe = 'TEX-002'), 1, 280), -- Reception partielle
(2, (SELECT id FROM articles WHERE refe = 'TEX-005'), 1, 200);

INSERT INTO livraison_achats (bon_commande_id, date_entree, refe) VALUES
(2, '2025-10-18 10:00:00', 'LIV-ACH-2025-002');

INSERT INTO livraison_achat_lignes (livraison_id, article_id, quantite) VALUES
(2, (SELECT id FROM articles WHERE refe = 'TEX-001'), 500),
(2, (SELECT id FROM articles WHERE refe = 'TEX-002'), 280),
(2, (SELECT id FROM articles WHERE refe = 'TEX-005'), 200);

-- ========== ACHAT 3 ==========
-- Achat electronique - En commande
INSERT INTO achats (date_entree, demandeur, date_effective, process_id, refe) VALUES
('2025-10-10 11:00:00', 2, '2025-10-10', (SELECT id FROM achat_processes WHERE abreviation = 'EC'), 'ACH-2025-003');

INSERT INTO achat_lignes (achat_id, article_id, quantite, prix_unitaire, prix_unitaire_estime) VALUES
(3, (SELECT id FROM articles WHERE refe = 'ELE-001'), 1000, 4200.00, 4500.00),
(3, (SELECT id FROM articles WHERE refe = 'ELE-002'), 150, 17000.00, 18000.00),
(3, (SELECT id FROM articles WHERE refe = 'ELE-003'), 100, 24000.00, 25000.00);

INSERT INTO achat_historiques (date_entree, achat_id, process_id) VALUES
('2025-10-10 11:00:00', 3, (SELECT id FROM achat_processes WHERE abreviation = 'CR')),
('2025-10-10 15:00:00', 3, (SELECT id FROM achat_processes WHERE abreviation = 'VM')),
('2025-10-11 10:00:00', 3, (SELECT id FROM achat_processes WHERE abreviation = 'VC')),
('2025-10-12 09:00:00', 3, (SELECT id FROM achat_processes WHERE abreviation = 'DP')),
('2025-10-15 14:00:00', 3, (SELECT id FROM achat_processes WHERE abreviation = 'EC'));

INSERT INTO proforma_achats (achat_id, fournisseur_id, date_entree, montant_total, lien_fichier, refe) VALUES
(3, 5, '2025-10-13 10:00:00', 7150000.00, NULL, 'PF-ACH-2025-003-F1'),
(3, 2, '2025-10-13 14:00:00', 6850000.00, NULL, 'PF-ACH-2025-003-F2'),
(3, 10, '2025-10-14 09:00:00', 7000000.00, NULL, 'PF-ACH-2025-003-F3');

INSERT INTO proforma_achat_lignes (proforma_id, article_id, quantite, prix_unitaire) VALUES
(8, (SELECT id FROM articles WHERE refe = 'ELE-001'), 1000, 4500.00),
(8, (SELECT id FROM articles WHERE refe = 'ELE-002'), 150, 17500.00),
(8, (SELECT id FROM articles WHERE refe = 'ELE-003'), 100, 24000.00),
(9, (SELECT id FROM articles WHERE refe = 'ELE-001'), 1000, 4200.00),
(9, (SELECT id FROM articles WHERE refe = 'ELE-002'), 150, 17000.00),
(9, (SELECT id FROM articles WHERE refe = 'ELE-003'), 100, 24000.00),
(10, (SELECT id FROM articles WHERE refe = 'ELE-001'), 1000, 4300.00),
(10, (SELECT id FROM articles WHERE refe = 'ELE-002'), 150, 17500.00),
(10, (SELECT id FROM articles WHERE refe = 'ELE-003'), 100, 24500.00);

INSERT INTO bon_commandes_achats (proforma_id, date_entree, montant_total, process_id, refe) VALUES
(9, '2025-10-15 14:00:00', 6850000.00, (SELECT id FROM bon_commande_processes WHERE abreviation = 'EC'), 'BC-ACH-2025-003');

INSERT INTO bon_commande_achat_lignes (bon_commande_id, article_id, quantite, prix_unitaire) VALUES
(3, (SELECT id FROM articles WHERE refe = 'ELE-001'), 1000, 4200.00),
(3, (SELECT id FROM articles WHERE refe = 'ELE-002'), 150, 17000.00),
(3, (SELECT id FROM articles WHERE refe = 'ELE-003'), 100, 24000.00);

INSERT INTO bon_commande_historiques (date_entree, bon_commande_id, process_id) VALUES
('2025-10-15 14:00:00', 3, (SELECT id FROM bon_commande_processes WHERE abreviation = 'CR')),
('2025-10-16 09:00:00', 3, (SELECT id FROM bon_commande_processes WHERE abreviation = 'VA')),
('2025-10-16 14:00:00', 3, (SELECT id FROM bon_commande_processes WHERE abreviation = 'EC'));

-- ========== ACHAT 4 ==========
-- Achat cosmetique - Cloture
INSERT INTO achats (date_entree, demandeur, date_effective, process_id, refe) VALUES
('2025-10-15 09:00:00', 10, '2025-10-15', (SELECT id FROM achat_processes WHERE abreviation = 'CL'), 'ACH-2025-004');

INSERT INTO achat_lignes (achat_id, article_id, quantite, prix_unitaire, prix_unitaire_estime) VALUES
(4, (SELECT id FROM articles WHERE refe = 'COS-001'), 800, 8200.00, 8500.00),
(4, (SELECT id FROM articles WHERE refe = 'COS-002'), 500, 11500.00, 12000.00),
(4, (SELECT id FROM articles WHERE refe = 'COS-004'), 1000, 3000.00, 3200.00);

INSERT INTO achat_historiques (date_entree, achat_id, process_id) VALUES
('2025-10-15 09:00:00', 4, (SELECT id FROM achat_processes WHERE abreviation = 'CR')),
('2025-10-15 14:00:00', 4, (SELECT id FROM achat_processes WHERE abreviation = 'VM')),
('2025-10-16 10:00:00', 4, (SELECT id FROM achat_processes WHERE abreviation = 'VC')),
('2025-10-17 09:00:00', 4, (SELECT id FROM achat_processes WHERE abreviation = 'DP')),
('2025-10-20 11:00:00', 4, (SELECT id FROM achat_processes WHERE abreviation = 'EC')),
('2025-10-28 10:00:00', 4, (SELECT id FROM achat_processes WHERE abreviation = 'RE')),
('2025-10-30 15:00:00', 4, (SELECT id FROM achat_processes WHERE abreviation = 'VF')),
('2025-10-31 09:00:00', 4, (SELECT id FROM achat_processes WHERE abreviation = 'CL'));

INSERT INTO proforma_achats (achat_id, fournisseur_id, date_entree, montant_total, lien_fichier, refe) VALUES
(4, 6, '2025-10-18 10:00:00', 12510000.00, NULL, 'PF-ACH-2025-004-F1'),
(4, 3, '2025-10-18 14:00:00', 12350000.00, NULL, 'PF-ACH-2025-004-F2');

INSERT INTO proforma_achat_lignes (proforma_id, article_id, quantite, prix_unitaire) VALUES
(11, (SELECT id FROM articles WHERE refe = 'COS-001'), 800, 8400.00),
(11, (SELECT id FROM articles WHERE refe = 'COS-002'), 500, 11800.00),
(11, (SELECT id FROM articles WHERE refe = 'COS-004'), 1000, 3100.00),
(12, (SELECT id FROM articles WHERE refe = 'COS-001'), 800, 8200.00),
(12, (SELECT id FROM articles WHERE refe = 'COS-002'), 500, 11500.00),
(12, (SELECT id FROM articles WHERE refe = 'COS-004'), 1000, 3000.00);

INSERT INTO bon_commandes_achats (proforma_id, date_entree, montant_total, process_id, refe) VALUES
(12, '2025-10-20 11:00:00', 12350000.00, (SELECT id FROM bon_commande_processes WHERE abreviation = 'CL'), 'BC-ACH-2025-004');

INSERT INTO bon_commande_achat_lignes (bon_commande_id, article_id, quantite, prix_unitaire) VALUES
(4, (SELECT id FROM articles WHERE refe = 'COS-001'), 800, 8200.00),
(4, (SELECT id FROM articles WHERE refe = 'COS-002'), 500, 11500.00),
(4, (SELECT id FROM articles WHERE refe = 'COS-004'), 1000, 3000.00);

INSERT INTO bon_commande_historiques (date_entree, bon_commande_id, process_id) VALUES
('2025-10-20 11:00:00', 4, (SELECT id FROM bon_commande_processes WHERE abreviation = 'CR')),
('2025-10-21 09:00:00', 4, (SELECT id FROM bon_commande_processes WHERE abreviation = 'VA')),
('2025-10-21 14:00:00', 4, (SELECT id FROM bon_commande_processes WHERE abreviation = 'EC')),
('2025-10-28 10:00:00', 4, (SELECT id FROM bon_commande_processes WHERE abreviation = 'RE')),
('2025-10-31 09:00:00', 4, (SELECT id FROM bon_commande_processes WHERE abreviation = 'CL'));

INSERT INTO reception_achats (bon_commande_id, date_entree, refe) VALUES
(4, '2025-10-28 10:00:00', 'REC-ACH-2025-004');

INSERT INTO reception_achat_lignes (reception_id, article_id, depot_id, quantite) VALUES
(3, (SELECT id FROM articles WHERE refe = 'COS-001'), 2, 800),
(3, (SELECT id FROM articles WHERE refe = 'COS-002'), 2, 500),
(3, (SELECT id FROM articles WHERE refe = 'COS-004'), 2, 1000);

INSERT INTO livraison_achats (bon_commande_id, date_entree, refe) VALUES
(4, '2025-10-28 10:00:00', 'LIV-ACH-2025-004');

INSERT INTO livraison_achat_lignes (livraison_id, article_id, quantite) VALUES
(3, (SELECT id FROM articles WHERE refe = 'COS-001'), 800),
(3, (SELECT id FROM articles WHERE refe = 'COS-002'), 500),
(3, (SELECT id FROM articles WHERE refe = 'COS-004'), 1000);

-- ========== ACHAT 5 ==========
-- Achat papeterie - Validation comptable
INSERT INTO achats (date_entree, demandeur, date_effective, process_id, refe) VALUES
('2025-10-20 10:00:00', 3, '2025-10-20', (SELECT id FROM achat_processes WHERE abreviation = 'VC'), 'ACH-2025-005');

INSERT INTO achat_lignes (achat_id, article_id, quantite, prix_unitaire, prix_unitaire_estime) VALUES
(5, (SELECT id FROM articles WHERE refe = 'PAP-001'), 300, 11500.00, 12000.00),
(5, (SELECT id FROM articles WHERE refe = 'PAP-002'), 50, 33000.00, 35000.00),
(5, (SELECT id FROM articles WHERE refe = 'PAP-003'), 200, 4300.00, 4500.00);

INSERT INTO achat_historiques (date_entree, achat_id, process_id) VALUES
('2025-10-20 10:00:00', 5, (SELECT id FROM achat_processes WHERE abreviation = 'CR')),
('2025-10-20 15:00:00', 5, (SELECT id FROM achat_processes WHERE abreviation = 'VM')),
('2025-10-21 11:00:00', 5, (SELECT id FROM achat_processes WHERE abreviation = 'VC'));

INSERT INTO proforma_achats (achat_id, fournisseur_id, date_entree, montant_total, lien_fichier, refe) VALUES
(5, 7, '2025-10-22 10:00:00', 5360000.00, NULL, 'PF-ACH-2025-005-F1'),
(5, 2, '2025-10-22 14:00:00', 5260000.00, NULL, 'PF-ACH-2025-005-F2'),
(5, 10, '2025-10-23 09:00:00', 5400000.00, NULL, 'PF-ACH-2025-005-F3');

INSERT INTO proforma_achat_lignes (proforma_id, article_id, quantite, prix_unitaire) VALUES
(13, (SELECT id FROM articles WHERE refe = 'PAP-001'), 300, 11800.00),
(13, (SELECT id FROM articles WHERE refe = 'PAP-002'), 50, 34000.00),
(13, (SELECT id FROM articles WHERE refe = 'PAP-003'), 200, 4400.00),
(14, (SELECT id FROM articles WHERE refe = 'PAP-001'), 300, 11500.00),
(14, (SELECT id FROM articles WHERE refe = 'PAP-002'), 50, 33000.00),
(14, (SELECT id FROM articles WHERE refe = 'PAP-003'), 200, 4300.00),
(15, (SELECT id FROM articles WHERE refe = 'PAP-001'), 300, 12000.00),
(15, (SELECT id FROM articles WHERE refe = 'PAP-002'), 50, 34000.00),
(15, (SELECT id FROM articles WHERE refe = 'PAP-003'), 200, 4500.00);

-- ========== ACHAT 6 ==========
-- Mix alimentaire et chimique - Cloture
INSERT INTO achats (date_entree, demandeur, date_effective, process_id, refe) VALUES
('2025-10-22 09:30:00', 2, '2025-10-22', (SELECT id FROM achat_processes WHERE abreviation = 'CL'), 'ACH-2025-006');

INSERT INTO achat_lignes (achat_id, article_id, quantite, prix_unitaire, prix_unitaire_estime) VALUES
(6, (SELECT id FROM articles WHERE refe = 'ALI-003'), 150, 44000.00, 45000.00),
(6, (SELECT id FROM articles WHERE refe = 'ALI-005'), 200, 17500.00, 18000.00),
(6, (SELECT id FROM articles WHERE refe = 'CHI-001'), 100, 14500.00, 15000.00),
(6, (SELECT id FROM articles WHERE refe = 'CHI-002'), 80, 21000.00, 22000.00);

INSERT INTO achat_historiques (date_entree, achat_id, process_id) VALUES
('2025-10-22 09:30:00', 6, (SELECT id FROM achat_processes WHERE abreviation = 'CR')),
('2025-10-22 14:00:00', 6, (SELECT id FROM achat_processes WHERE abreviation = 'VM')),
('2025-10-23 10:00:00', 6, (SELECT id FROM achat_processes WHERE abreviation = 'VC')),
('2025-10-24 09:00:00', 6, (SELECT id FROM achat_processes WHERE abreviation = 'DP')),
('2025-10-27 11:00:00', 6, (SELECT id FROM achat_processes WHERE abreviation = 'EC')),
('2025-11-02 10:00:00', 6, (SELECT id FROM achat_processes WHERE abreviation = 'RE')),
('2025-11-04 14:00:00', 6, (SELECT id FROM achat_processes WHERE abreviation = 'VF')),
('2025-11-05 09:00:00', 6, (SELECT id FROM achat_processes WHERE abreviation = 'CL'));

INSERT INTO proforma_achats (achat_id, fournisseur_id, date_entree, montant_total, lien_fichier, refe) VALUES
(6, 3, '2025-10-25 10:00:00', 12730000.00, NULL, 'PF-ACH-2025-006-F1'),
(6, 8, '2025-10-25 14:00:00', 12550000.00, NULL, 'PF-ACH-2025-006-F2');

INSERT INTO proforma_achat_lignes (proforma_id, article_id, quantite, prix_unitaire) VALUES
(16, (SELECT id FROM articles WHERE refe = 'ALI-003'), 150, 44500.00),
(16, (SELECT id FROM articles WHERE refe = 'ALI-005'), 200, 17800.00),
(16, (SELECT id FROM articles WHERE refe = 'CHI-001'), 100, 14800.00),
(16, (SELECT id FROM articles WHERE refe = 'CHI-002'), 80, 21200.00),
(17, (SELECT id FROM articles WHERE refe = 'ALI-003'), 150, 44000.00),
(17, (SELECT id FROM articles WHERE refe = 'ALI-005'), 200, 17500.00),
(17, (SELECT id FROM articles WHERE refe = 'CHI-001'), 100, 14500.00),
(17, (SELECT id FROM articles WHERE refe = 'CHI-002'), 80, 21000.00);

INSERT INTO bon_commandes_achats (proforma_id, date_entree, montant_total, process_id, refe) VALUES
(17, '2025-10-27 11:00:00', 12550000.00, (SELECT id FROM bon_commande_processes WHERE abreviation = 'CL'), 'BC-ACH-2025-006');

INSERT INTO bon_commande_achat_lignes (bon_commande_id, article_id, quantite, prix_unitaire) VALUES
(5, (SELECT id FROM articles WHERE refe = 'ALI-003'), 150, 44000.00),
(5, (SELECT id FROM articles WHERE refe = 'ALI-005'), 200, 17500.00),
(5, (SELECT id FROM articles WHERE refe = 'CHI-001'), 100, 14500.00),
(5, (SELECT id FROM articles WHERE refe = 'CHI-002'), 80, 21000.00);

INSERT INTO bon_commande_historiques (date_entree, bon_commande_id, process_id) VALUES
('2025-10-27 11:00:00', 5, (SELECT id FROM bon_commande_processes WHERE abreviation = 'CR')),
('2025-10-28 09:00:00', 5, (SELECT id FROM bon_commande_processes WHERE abreviation = 'VA')),
('2025-10-28 14:00:00', 5, (SELECT id FROM bon_commande_processes WHERE abreviation = 'EC')),
('2025-11-02 10:00:00', 5, (SELECT id FROM bon_commande_processes WHERE abreviation = 'RE')),
('2025-11-05 09:00:00', 5, (SELECT id FROM bon_commande_processes WHERE abreviation = 'CL'));

INSERT INTO reception_achats (bon_commande_id, date_entree, refe) VALUES
(5, '2025-11-02 10:00:00', 'REC-ACH-2025-006');

INSERT INTO reception_achat_lignes (reception_id, article_id, depot_id, quantite) VALUES
(4, (SELECT id FROM articles WHERE refe = 'ALI-003'), 3, 150),
(4, (SELECT id FROM articles WHERE refe = 'ALI-005'), 3, 200),
(4, (SELECT id FROM articles WHERE refe = 'CHI-001'), 3, 100),
(4, (SELECT id FROM articles WHERE refe = 'CHI-002'), 3, 80);

INSERT INTO livraison_achats (bon_commande_id, date_entree, refe) VALUES
(5, '2025-11-02 10:00:00', 'LIV-ACH-2025-006');

INSERT INTO livraison_achat_lignes (livraison_id, article_id, quantite) VALUES
(4, (SELECT id FROM articles WHERE refe = 'ALI-003'), 150),
(4, (SELECT id FROM articles WHERE refe = 'ALI-005'), 200),
(4, (SELECT id FROM articles WHERE refe = 'CHI-001'), 100),
(4, (SELECT id FROM articles WHERE refe = 'CHI-002'), 80);

-- ========== ACHAT 7 ==========
-- Textile et accessoires - Reception
INSERT INTO achats (date_entree, demandeur, date_effective, process_id, refe) VALUES
('2025-10-25 11:00:00', 3, '2025-10-25', (SELECT id FROM achat_processes WHERE abreviation = 'RE'), 'ACH-2025-007');

INSERT INTO achat_lignes (achat_id, article_id, quantite, prix_unitaire, prix_unitaire_estime) VALUES
(7, (SELECT id FROM articles WHERE refe = 'TEX-003'), 250, 33500.00, 35000.00),
(7, (SELECT id FROM articles WHERE refe = 'TEX-004'), 180, 52000.00, 55000.00),
(7, (SELECT id FROM articles WHERE refe = 'ACC-001'), 100, 80000.00, 85000.00);

INSERT INTO achat_historiques (date_entree, achat_id, process_id) VALUES
('2025-10-25 11:00:00', 7, (SELECT id FROM achat_processes WHERE abreviation = 'CR')),
('2025-10-25 15:00:00', 7, (SELECT id FROM achat_processes WHERE abreviation = 'VM')),
('2025-10-26 10:00:00', 7, (SELECT id FROM achat_processes WHERE abreviation = 'VC')),
('2025-10-27 09:00:00', 7, (SELECT id FROM achat_processes WHERE abreviation = 'DP')),
('2025-10-30 14:00:00', 7, (SELECT id FROM achat_processes WHERE abreviation = 'EC')),
('2025-11-06 09:00:00', 7, (SELECT id FROM achat_processes WHERE abreviation = 'RE'));

INSERT INTO proforma_achats (achat_id, fournisseur_id, date_entree, montant_total, lien_fichier, refe) VALUES
(7, 4, '2025-10-28 10:00:00', 25735000.00, NULL, 'PF-ACH-2025-007-F1'),
(7, 9, '2025-10-28 14:00:00', 25235000.00, NULL, 'PF-ACH-2025-007-F2'),
(7, 1, '2025-10-29 09:00:00', 25900000.00, NULL, 'PF-ACH-2025-007-F3');

INSERT INTO proforma_achat_lignes (proforma_id, article_id, quantite, prix_unitaire) VALUES
(18, (SELECT id FROM articles WHERE refe = 'TEX-003'), 250, 34000.00),
(18, (SELECT id FROM articles WHERE refe = 'TEX-004'), 180, 53000.00),
(18, (SELECT id FROM articles WHERE refe = 'ACC-001'), 100, 81500.00),
(19, (SELECT id FROM articles WHERE refe = 'TEX-003'), 250, 33500.00),
(19, (SELECT id FROM articles WHERE refe = 'TEX-004'), 180, 52000.00),
(19, (SELECT id FROM articles WHERE refe = 'ACC-001'), 100, 80000.00),
(20, (SELECT id FROM articles WHERE refe = 'TEX-003'), 250, 34500.00),
(20, (SELECT id FROM articles WHERE refe = 'TEX-004'), 180, 53500.00),
(20, (SELECT id FROM articles WHERE refe = 'ACC-001'), 100, 82000.00);

INSERT INTO bon_commandes_achats (proforma_id, date_entree, montant_total, process_id, refe) VALUES
(19, '2025-10-30 14:00:00', 25235000.00, (SELECT id FROM bon_commande_processes WHERE abreviation = 'RE'), 'BC-ACH-2025-007');

INSERT INTO bon_commande_achat_lignes (bon_commande_id, article_id, quantite, prix_unitaire) VALUES
(6, (SELECT id FROM articles WHERE refe = 'TEX-003'), 250, 33500.00),
(6, (SELECT id FROM articles WHERE refe = 'TEX-004'), 180, 52000.00),
(6, (SELECT id FROM articles WHERE refe = 'ACC-001'), 100, 80000.00);

INSERT INTO bon_commande_historiques (date_entree, bon_commande_id, process_id) VALUES
('2025-10-30 14:00:00', 6, (SELECT id FROM bon_commande_processes WHERE abreviation = 'CR')),
('2025-10-31 09:00:00', 6, (SELECT id FROM bon_commande_processes WHERE abreviation = 'VA')),
('2025-10-31 14:00:00', 6, (SELECT id FROM bon_commande_processes WHERE abreviation = 'EC')),
('2025-11-06 09:00:00', 6, (SELECT id FROM bon_commande_processes WHERE abreviation = 'RE'));

INSERT INTO reception_achats (bon_commande_id, date_entree, refe) VALUES
(6, '2025-11-06 09:00:00', 'REC-ACH-2025-007');

INSERT INTO reception_achat_lignes (reception_id, article_id, depot_id, quantite) VALUES
(5, (SELECT id FROM articles WHERE refe = 'TEX-003'), 1, 250),
(5, (SELECT id FROM articles WHERE refe = 'TEX-004'), 1, 180),
(5, (SELECT id FROM articles WHERE refe = 'ACC-001'), 1, 95); -- Reception partielle

INSERT INTO livraison_achats (bon_commande_id, date_entree, refe) VALUES
(6, '2025-11-06 09:00:00', 'LIV-ACH-2025-007');

INSERT INTO livraison_achat_lignes (livraison_id, article_id, quantite) VALUES
(5, (SELECT id FROM articles WHERE refe = 'TEX-003'), 250),
(5, (SELECT id FROM articles WHERE refe = 'TEX-004'), 180),
(5, (SELECT id FROM articles WHERE refe = 'ACC-001'), 95);

-- ========== ACHAT 8 ==========
-- Electronique et bureau - Demande proforma
INSERT INTO achats (date_entree, demandeur, date_effective, process_id, refe) VALUES
('2025-10-28 10:00:00', 2, '2025-10-28', (SELECT id FROM achat_processes WHERE abreviation = 'DP'), 'ACH-2025-008');

INSERT INTO achat_lignes (achat_id, article_id, quantite, prix_unitaire, prix_unitaire_estime) VALUES
(8, (SELECT id FROM articles WHERE refe = 'ELE-004'), 300, 11500.00, 12000.00),
(8, (SELECT id FROM articles WHERE refe = 'ELE-005'), 150, 33000.00, 35000.00),
(8, (SELECT id FROM articles WHERE refe = 'PAP-001'), 200, 11800.00, 12000.00);

INSERT INTO achat_historiques (date_entree, achat_id, process_id) VALUES
('2025-10-28 10:00:00', 8, (SELECT id FROM achat_processes WHERE abreviation = 'CR')),
('2025-10-28 14:00:00', 8, (SELECT id FROM achat_processes WHERE abreviation = 'VM')),
('2025-10-29 10:00:00', 8, (SELECT id FROM achat_processes WHERE abreviation = 'VC')),
('2025-10-30 09:00:00', 8, (SELECT id FROM achat_processes WHERE abreviation = 'DP'));

INSERT INTO proforma_achats (achat_id, fournisseur_id, date_entree, montant_total, lien_fichier, refe) VALUES
(8, 5, '2025-10-31 10:00:00', 10270000.00, NULL, 'PF-ACH-2025-008-F1'),
(8, 7, '2025-10-31 14:00:00', 10110000.00, NULL, 'PF-ACH-2025-008-F2');

INSERT INTO proforma_achat_lignes (proforma_id, article_id, quantite, prix_unitaire) VALUES
(21, (SELECT id FROM articles WHERE refe = 'ELE-004'), 300, 11800.00),
(21, (SELECT id FROM articles WHERE refe = 'ELE-005'), 150, 33500.00),
(21, (SELECT id FROM articles WHERE refe = 'PAP-001'), 200, 12000.00),
(22, (SELECT id FROM articles WHERE refe = 'ELE-004'), 300, 11500.00),
(22, (SELECT id FROM articles WHERE refe = 'ELE-005'), 150, 33000.00),
(22, (SELECT id FROM articles WHERE refe = 'PAP-001'), 200, 11800.00);

-- ========== ACHAT 9 ==========
-- Cosmetiques - Cloture
INSERT INTO achats (date_entree, demandeur, date_effective, process_id, refe) VALUES
('2025-11-02 09:00:00', 10, '2025-11-02', (SELECT id FROM achat_processes WHERE abreviation = 'CL'), 'ACH-2025-009');

INSERT INTO achat_lignes (achat_id, article_id, quantite, prix_unitaire, prix_unitaire_estime) VALUES
(9, (SELECT id FROM articles WHERE refe = 'COS-003'), 400, 24000.00, 25000.00),
(9, (SELECT id FROM articles WHERE refe = 'COS-005'), 600, 6300.00, 6500.00);

INSERT INTO achat_historiques (date_entree, achat_id, process_id) VALUES
('2025-11-02 09:00:00', 9, (SELECT id FROM achat_processes WHERE abreviation = 'CR')),
('2025-11-02 14:00:00', 9, (SELECT id FROM achat_processes WHERE abreviation = 'VM')),
('2025-11-03 10:00:00', 9, (SELECT id FROM achat_processes WHERE abreviation = 'VC')),
('2025-11-04 09:00:00', 9, (SELECT id FROM achat_processes WHERE abreviation = 'DP')),
('2025-11-07 11:00:00', 9, (SELECT id FROM achat_processes WHERE abreviation = 'EC')),
('2025-11-14 10:00:00', 9, (SELECT id FROM achat_processes WHERE abreviation = 'RE')),
('2025-11-16 14:00:00', 9, (SELECT id FROM achat_processes WHERE abreviation = 'VF')),
('2025-11-17 09:00:00', 9, (SELECT id FROM achat_processes WHERE abreviation = 'CL'));

INSERT INTO proforma_achats (achat_id, fournisseur_id, date_entree, montant_total, lien_fichier, refe) VALUES
(9, 6, '2025-11-05 10:00:00', 13500000.00, NULL, 'PF-ACH-2025-009-F1'),
(9, 3, '2025-11-05 14:00:00', 13380000.00, NULL, 'PF-ACH-2025-009-F2'),
(9, 10, '2025-11-06 09:00:00', 13450000.00, NULL, 'PF-ACH-2025-009-F3');

INSERT INTO proforma_achat_lignes (proforma_id, article_id, quantite, prix_unitaire) VALUES
(23, (SELECT id FROM articles WHERE refe = 'COS-003'), 400, 24500.00),
(23, (SELECT id FROM articles WHERE refe = 'COS-005'), 600, 6500.00),
(24, (SELECT id FROM articles WHERE refe = 'COS-003'), 400, 24000.00),
(24, (SELECT id FROM articles WHERE refe = 'COS-005'), 600, 6300.00),
(25, (SELECT id FROM articles WHERE refe = 'COS-003'), 400, 24200.00),
(25, (SELECT id FROM articles WHERE refe = 'COS-005'), 600, 6400.00);

INSERT INTO bon_commandes_achats (proforma_id, date_entree, montant_total, process_id, refe) VALUES
(24, '2025-11-07 11:00:00', 13380000.00, (SELECT id FROM bon_commande_processes WHERE abreviation = 'CL'), 'BC-ACH-2025-009');

INSERT INTO bon_commande_achat_lignes (bon_commande_id, article_id, quantite, prix_unitaire) VALUES
(7, (SELECT id FROM articles WHERE refe = 'COS-003'), 400, 24000.00),
(7, (SELECT id FROM articles WHERE refe = 'COS-005'), 600, 6300.00);

INSERT INTO bon_commande_historiques (date_entree, bon_commande_id, process_id) VALUES
('2025-11-07 11:00:00', 7, (SELECT id FROM bon_commande_processes WHERE abreviation = 'CR')),
('2025-11-08 09:00:00', 7, (SELECT id FROM bon_commande_processes WHERE abreviation = 'VA')),
('2025-11-08 14:00:00', 7, (SELECT id FROM bon_commande_processes WHERE abreviation = 'EC')),
('2025-11-14 10:00:00', 7, (SELECT id FROM bon_commande_processes WHERE abreviation = 'RE')),
('2025-11-17 09:00:00', 7, (SELECT id FROM bon_commande_processes WHERE abreviation = 'CL'));

INSERT INTO reception_achats (bon_commande_id, date_entree, refe) VALUES
(7, '2025-11-14 10:00:00', 'REC-ACH-2025-009');

INSERT INTO reception_achat_lignes (reception_id, article_id, depot_id, quantite) VALUES
(6, (SELECT id FROM articles WHERE refe = 'COS-003'), 2, 400),
(6, (SELECT id FROM articles WHERE refe = 'COS-005'), 2, 600);

INSERT INTO livraison_achats (bon_commande_id, date_entree, refe) VALUES
(7, '2025-11-14 10:00:00', 'LIV-ACH-2025-009');

INSERT INTO livraison_achat_lignes (livraison_id, article_id, quantite) VALUES
(6, (SELECT id FROM articles WHERE refe = 'COS-003'), 400),
(6, (SELECT id FROM articles WHERE refe = 'COS-005'), 600);

-- ========== ACHAT 10 ==========
-- Alimentaire mix - Validation magasinier
INSERT INTO achats (date_entree, demandeur, date_effective, process_id, refe) VALUES
('2025-11-05 10:00:00', 3, '2025-11-05', (SELECT id FROM achat_processes WHERE abreviation = 'VM'), 'ACH-2025-010');

INSERT INTO achat_lignes (achat_id, article_id, quantite, prix_unitaire, prix_unitaire_estime) VALUES
(10, (SELECT id FROM articles WHERE refe = 'ALI-006'), 500, 3400.00, 3500.00),
(10, (SELECT id FROM articles WHERE refe = 'ALI-007'), 800, 2700.00, 2800.00),
(10, (SELECT id FROM articles WHERE refe = 'ALI-008'), 150, 31000.00, 32000.00);

INSERT INTO achat_historiques (date_entree, achat_id, process_id) VALUES
('2025-11-05 10:00:00', 10, (SELECT id FROM achat_processes WHERE abreviation = 'CR')),
('2025-11-05 15:00:00', 10, (SELECT id FROM achat_processes WHERE abreviation = 'VM'));

-- ========== ACHAT 11 ==========
-- Textile veste - En commande
INSERT INTO achats (date_entree, demandeur, date_effective, process_id, refe) VALUES
('2025-11-08 09:30:00', 2, '2025-11-08', (SELECT id FROM achat_processes WHERE abreviation = 'EC'), 'ACH-2025-011');

INSERT INTO achat_lignes (achat_id, article_id, quantite, prix_unitaire, prix_unitaire_estime) VALUES
(11, (SELECT id FROM articles WHERE refe = 'TEX-006'), 200, 120000.00, 125000.00);

INSERT INTO achat_historiques (date_entree, achat_id, process_id) VALUES
('2025-11-08 09:30:00', 11, (SELECT id FROM achat_processes WHERE abreviation = 'CR')),
('2025-11-08 14:00:00', 11, (SELECT id FROM achat_processes WHERE abreviation = 'VM')),
('2025-11-09 10:00:00', 11, (SELECT id FROM achat_processes WHERE abreviation = 'VC')),
('2025-11-10 09:00:00', 11, (SELECT id FROM achat_processes WHERE abreviation = 'DP')),
('2025-11-13 14:00:00', 11, (SELECT id FROM achat_processes WHERE abreviation = 'EC'));

INSERT INTO proforma_achats (achat_id, fournisseur_id, date_entree, montant_total, lien_fichier, refe) VALUES
(11, 4, '2025-11-11 10:00:00', 24800000.00, NULL, 'PF-ACH-2025-011-F1'),
(11, 9, '2025-11-11 14:00:00', 24000000.00, NULL, 'PF-ACH-2025-011-F2'),
(11, 1, '2025-11-12 09:00:00', 24600000.00, NULL, 'PF-ACH-2025-011-F3');

INSERT INTO proforma_achat_lignes (proforma_id, article_id, quantite, prix_unitaire) VALUES
(26, (SELECT id FROM articles WHERE refe = 'TEX-006'), 200, 124000.00),
(27, (SELECT id FROM articles WHERE refe = 'TEX-006'), 200, 120000.00),
(28, (SELECT id FROM articles WHERE refe = 'TEX-006'), 200, 123000.00);

INSERT INTO bon_commandes_achats (proforma_id, date_entree, montant_total, process_id, refe) VALUES
(27, '2025-11-13 14:00:00', 24000000.00, (SELECT id FROM bon_commande_processes WHERE abreviation = 'EC'), 'BC-ACH-2025-011');

INSERT INTO bon_commande_achat_lignes (bon_commande_id, article_id, quantite, prix_unitaire) VALUES
(8, (SELECT id FROM articles WHERE refe = 'TEX-006'), 200, 120000.00);

INSERT INTO bon_commande_historiques (date_entree, bon_commande_id, process_id) VALUES
('2025-11-13 14:00:00', 8, (SELECT id FROM bon_commande_processes WHERE abreviation = 'CR')),
('2025-11-14 09:00:00', 8, (SELECT id FROM bon_commande_processes WHERE abreviation = 'VA')),
('2025-11-14 14:00:00', 8, (SELECT id FROM bon_commande_processes WHERE abreviation = 'EC'));

-- ========== ACHAT 12 ==========
-- Mix produits - Cloture
INSERT INTO achats (date_entree, demandeur, date_effective, process_id, refe) VALUES
('2025-11-10 11:00:00', 10, '2025-11-10', (SELECT id FROM achat_processes WHERE abreviation = 'CL'), 'ACH-2025-012');

INSERT INTO achat_lignes (achat_id, article_id, quantite, prix_unitaire, prix_unitaire_estime) VALUES
(12, (SELECT id FROM articles WHERE refe = 'ELE-001'), 500, 4300.00, 4500.00),
(12, (SELECT id FROM articles WHERE refe = 'COS-001'), 300, 8300.00, 8500.00),
(12, (SELECT id FROM articles WHERE refe = 'PAP-003'), 400, 4400.00, 4500.00);

INSERT INTO achat_historiques (date_entree, achat_id, process_id) VALUES
('2025-11-10 11:00:00', 12, (SELECT id FROM achat_processes WHERE abreviation = 'CR')),
('2025-11-10 15:00:00', 12, (SELECT id FROM achat_processes WHERE abreviation = 'VM')),
('2025-11-11 10:00:00', 12, (SELECT id FROM achat_processes WHERE abreviation = 'VC')),
('2025-11-12 09:00:00', 12, (SELECT id FROM achat_processes WHERE abreviation = 'DP')),
('2025-11-15 11:00:00', 12, (SELECT id FROM achat_processes WHERE abreviation = 'EC')),
('2025-11-22 10:00:00', 12, (SELECT id FROM achat_processes WHERE abreviation = 'RE')),
('2025-11-24 14:00:00', 12, (SELECT id FROM achat_processes WHERE abreviation = 'VF')),
('2025-11-25 09:00:00', 12, (SELECT id FROM achat_processes WHERE abreviation = 'CL'));

INSERT INTO proforma_achats (achat_id, fournisseur_id, date_entree, montant_total, lien_fichier, refe) VALUES
(12, 5, '2025-11-13 10:00:00', 6410000.00, NULL, 'PF-ACH-2025-012-F1'),
(12, 10, '2025-11-13 14:00:00', 6240000.00, NULL, 'PF-ACH-2025-012-F2');

INSERT INTO proforma_achat_lignes (proforma_id, article_id, quantite, prix_unitaire) VALUES
(29, (SELECT id FROM articles WHERE refe = 'ELE-001'), 500, 4400.00),
(29, (SELECT id FROM articles WHERE refe = 'COS-001'), 300, 8500.00),
(29, (SELECT id FROM articles WHERE refe = 'PAP-003'), 400, 4500.00),
(30, (SELECT id FROM articles WHERE refe = 'ELE-001'), 500, 4300.00),
(30, (SELECT id FROM articles WHERE refe = 'COS-001'), 300, 8300.00),
(30, (SELECT id FROM articles WHERE refe = 'PAP-003'), 400, 4400.00);

INSERT INTO bon_commandes_achats (proforma_id, date_entree, montant_total, process_id, refe) VALUES
(30, '2025-11-15 11:00:00', 6240000.00, (SELECT id FROM bon_commande_processes WHERE abreviation = 'CL'), 'BC-ACH-2025-012');

INSERT INTO bon_commande_achat_lignes (bon_commande_id, article_id, quantite, prix_unitaire) VALUES
(9, (SELECT id FROM articles WHERE refe = 'ELE-001'), 500, 4300.00),
(9, (SELECT id FROM articles WHERE refe = 'COS-001'), 300, 8300.00),
(9, (SELECT id FROM articles WHERE refe = 'PAP-003'), 400, 4400.00);

INSERT INTO bon_commande_historiques (date_entree, bon_commande_id, process_id) VALUES
('2025-11-15 11:00:00', 9, (SELECT id FROM bon_commande_processes WHERE abreviation = 'CR')),
('2025-11-16 09:00:00', 9, (SELECT id FROM bon_commande_processes WHERE abreviation = 'VA')),
('2025-11-16 14:00:00', 9, (SELECT id FROM bon_commande_processes WHERE abreviation = 'EC')),
('2025-11-22 10:00:00', 9, (SELECT id FROM bon_commande_processes WHERE abreviation = 'RE')),
('2025-11-25 09:00:00', 9, (SELECT id FROM bon_commande_processes WHERE abreviation = 'CL'));

INSERT INTO reception_achats (bon_commande_id, date_entree, refe) VALUES
(9, '2025-11-22 10:00:00', 'REC-ACH-2025-012');

INSERT INTO reception_achat_lignes (reception_id, article_id, depot_id, quantite) VALUES
(7, (SELECT id FROM articles WHERE refe = 'ELE-001'), 1, 500),
(7, (SELECT id FROM articles WHERE refe = 'COS-001'), 1, 300),
(7, (SELECT id FROM articles WHERE refe = 'PAP-003'), 1, 400);

INSERT INTO livraison_achats (bon_commande_id, date_entree, refe) VALUES
(9, '2025-11-22 10:00:00', 'LIV-ACH-2025-012');

INSERT INTO livraison_achat_lignes (livraison_id, article_id, quantite) VALUES
(7, (SELECT id FROM articles WHERE refe = 'ELE-001'), 500),
(7, (SELECT id FROM articles WHERE refe = 'COS-001'), 300),
(7, (SELECT id FROM articles WHERE refe = 'PAP-003'), 400);

-- ========== ACHAT 13 ==========
-- Alimentaire urgent - Creation
INSERT INTO achats (date_entree, demandeur, date_effective, process_id, refe) VALUES
('2025-11-15 09:00:00', 3, '2025-11-15', (SELECT id FROM achat_processes WHERE abreviation = 'CR'), 'ACH-2025-013');

INSERT INTO achat_lignes (achat_id, article_id, quantite, prix_unitaire, prix_unitaire_estime) VALUES
(13, (SELECT id FROM articles WHERE refe = 'ALI-001'), 200, 84000.00, 85000.00),
(13, (SELECT id FROM articles WHERE refe = 'ALI-002'), 300, 21800.00, 22000.00),
(13, (SELECT id FROM articles WHERE refe = 'ALI-003'), 100, 44500.00, 45000.00);

INSERT INTO achat_historiques (date_entree, achat_id, process_id) VALUES
('2025-11-15 09:00:00', 13, (SELECT id FROM achat_processes WHERE abreviation = 'CR'));

-- ========== ACHAT 14 ==========
-- Cosmetiques et soins - Validation comptable
INSERT INTO achats (date_entree, demandeur, date_effective, process_id, refe) VALUES
('2025-11-18 10:30:00', 2, '2025-11-18', (SELECT id FROM achat_processes WHERE abreviation = 'VC'), 'ACH-2025-014');

INSERT INTO achat_lignes (achat_id, article_id, quantite, prix_unitaire, prix_unitaire_estime) VALUES
(14, (SELECT id FROM articles WHERE refe = 'COS-002'), 400, 11700.00, 12000.00),
(14, (SELECT id FROM articles WHERE refe = 'COS-004'), 1200, 3100.00, 3200.00);

INSERT INTO achat_historiques (date_entree, achat_id, process_id) VALUES
('2025-11-18 10:30:00', 14, (SELECT id FROM achat_processes WHERE abreviation = 'CR')),
('2025-11-18 15:00:00', 14, (SELECT id FROM achat_processes WHERE abreviation = 'VM')),
('2025-11-19 10:00:00', 14, (SELECT id FROM achat_processes WHERE abreviation = 'VC'));

INSERT INTO proforma_achats (achat_id, fournisseur_id, date_entree, montant_total, lien_fichier, refe) VALUES
(14, 6, '2025-11-20 10:00:00', 8400000.00, NULL, 'PF-ACH-2025-014-F1'),
(14, 3, '2025-11-20 14:00:00', 8200000.00, NULL, 'PF-ACH-2025-014-F2');

INSERT INTO proforma_achat_lignes (proforma_id, article_id, quantite, prix_unitaire) VALUES
(31, (SELECT id FROM articles WHERE refe = 'COS-002'), 400, 12000.00),
(31, (SELECT id FROM articles WHERE refe = 'COS-004'), 1200, 3200.00),
(32, (SELECT id FROM articles WHERE refe = 'COS-002'), 400, 11700.00),
(32, (SELECT id FROM articles WHERE refe = 'COS-004'), 1200, 3100.00);

-- ========== ACHAT 15 ==========
-- Mix final - Annule
INSERT INTO achats (date_entree, demandeur, date_effective, process_id, refe) VALUES
('2025-11-20 11:00:00', 10, '2025-11-20', (SELECT id FROM achat_processes WHERE abreviation = 'AN'), 'ACH-2025-015');

INSERT INTO achat_lignes (achat_id, article_id, quantite, prix_unitaire, prix_unitaire_estime) VALUES
(15, (SELECT id FROM articles WHERE refe = 'TEX-001'), 100, 14500.00, 15000.00),
(15, (SELECT id FROM articles WHERE refe = 'ELE-002'), 80, 17800.00, 18000.00);

INSERT INTO achat_historiques (date_entree, achat_id, process_id) VALUES
('2025-11-20 11:00:00', 15, (SELECT id FROM achat_processes WHERE abreviation = 'CR')),
('2025-11-20 15:00:00', 15, (SELECT id FROM achat_processes WHERE abreviation = 'VM')),
('2025-11-21 10:00:00', 15, (SELECT id FROM achat_processes WHERE abreviation = 'VC')),
('2025-11-22 09:00:00', 15, (SELECT id FROM achat_processes WHERE abreviation = 'AN'));

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
-- RESUME DES DONNEES GENEREES:
-- ✓ 30 Articles (Alimentaire, Textile, Electronique, Cosmetique, Papeterie, Chimique, Accessoires)
-- ✓ 2 Entities (entreprises)
-- ✓ 3 Depots (Antananarivo, Antsirabe, Toamasina)
-- ✓ 10 Utilisateurs avec roles divers
-- ✓ 10 Fournisseurs
-- ✓ 15 Achats avec workflow realiste:
--   - 6 Achats clotures (workflow complet)
--   - 3 Achats en reception
--   - 2 Achats en commande
--   - 2 Achats en validation comptable
--   - 1 Achat en demande proforma
--   - 1 Achat annule
-- ✓ 32 Proformas (2-4 par achat avec variations de prix)
-- ✓ 9 Bons de commande bases sur proformas moins chers
-- ✓ 9 Receptions (certaines avec quantites partielles)
-- ✓ 9 Livraisons
-- ✓ Historiques complets des changements de statuts
-- 
-- UTILISATION:
-- 1. Executer table.sql pour creer la structure
-- 2. Executer dataAchat.sql pour les process
-- 3. Executer ce fichier pour les donnees
-- =====================================================

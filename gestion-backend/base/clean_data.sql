-- =====================================================
-- SCRIPT DE DONNEES CLEAN - GestionEntreprise
-- Ce script contient toutes les données nécessaires
-- pour initialiser la base de données
-- =====================================================

-- =====================================================
-- 1. DEPARTMENTS
-- =====================================================
INSERT INTO departments (id, department_name) VALUES 
(1, 'ADMIN'), 
(2, 'Direction'), 
(3, 'Achat'), 
(4, 'Vente'), 
(5, 'Magasin'), 
(6, 'Finance');

-- =====================================================
-- 2. ROLES
-- =====================================================
INSERT INTO roles (role_code, role_name, niveau_acces, department_id) VALUES 
('ADMIN', 'Admin', 100, 1),
('ADMINSYS', 'ADMINISTRATEUR SYSTEME', 50, 1),
('RESP_DIRECTION', 'Responsable Direction', 11, 2),
('RESP_ACHAT', 'Responsable Achat', 11, 3),
('EMP_ACHAT', 'Employe Achat', 1, 3),
('RESP_VENTE', 'Responsable Vente', 11, 4),
('EMP_VENTE', 'Employe Vente', 1, 4),
('RESP_MAGASIN', 'Responsable Magasin', 11, 5),
('EMP_MAGASIN', 'Employe Magasin', 1, 5),
('MAGRECEP', 'MAGASINIER RECEPTION', 9, 5),
('MAGSORT', 'MAGASINIER SORTIE', 9, 5),
('MAGINV', 'MAGASINIER INVENTAIRE', 9, 5),
('RESP_FINANCE', 'Responsable Finance', 11, 6),
('EMP_FINANCE', 'Employe Finance', 1, 6);

-- =====================================================
-- 3. ACTIONS (Audit)
-- =====================================================
INSERT INTO actions (action_name, description) VALUES
-- Actions générales
('CREATE', 'Création d''un nouvel enregistrement'),
('UPDATE', 'Mise à jour d''un enregistrement existant'),
('DELETE', 'Suppression d''un enregistrement'),
('VIEW', 'Consultation d''un enregistrement'),
('VALIDATE', 'Validation d''un enregistrement'),
('REJECT', 'Rejet d''un enregistrement'),
('APPROVE', 'Approbation finale d''un enregistrement'),
('CANCEL', 'Annulation d''un enregistrement'),
-- Achats
('REQUEST', 'Création d''une demande d''achat'),
('ORDER', 'Création d''une commande d''achat'),
('CONFIRM_FUNDS', 'Confirmation de disponibilité des fonds'),
('CLOSE_ORDER', 'Clôture d''une commande d''achat'),
-- Stock / Magasin
('RECEIVE', 'Réception de marchandises'),
('RETURN', 'Retour de marchandises'),
('ADJUST', 'Ajustement des niveaux de stock'),
('TRANSFER', 'Transfert de marchandises entre dépôts'),
('RESERVE', 'Réservation de stock'),
('RELEASE', 'Libération de stock réservé'),
('INVENTORY', 'Réalisation d''inventaire'),
('VALIDATE_INVENTORY', 'Validation des résultats d''inventaire'),
-- Ventes
('QUOTE', 'Création d''un devis'),
('SELL', 'Création d''une commande de vente'),
('SHIP', 'Expédition de marchandises'),
('DELIVER', 'Livraison au client'),
('INVOICE', 'Émission d''une facture'),
('CREDIT_NOTE', 'Émission d''un avoir'),
('COLLECT', 'Encaissement client'),
('Annulation Vente', 'Annulation d''une commande de vente'),
-- Finance
('PAY', 'Paiement fournisseur'),
('RECONCILE', 'Rapprochement de comptes'),
('CLOSE_PERIOD', 'Clôture de période comptable'),
-- Données
('EXPORT', 'Export de données'),
('IMPORT', 'Import de données'),
('ARCHIVE', 'Archivage d''enregistrements'),
-- Sécurité / Audit
('LOGIN', 'Connexion utilisateur'),
('LOGOUT', 'Déconnexion utilisateur'),
('DELEGATE', 'Délégation d''accès'),
('REVOKE', 'Révocation d''accès délégué');

-- =====================================================
-- 4. ENTITIES (Entités)
-- =====================================================
INSERT INTO entities (entity_name) VALUES
('Entite principale');

-- =====================================================
-- 5. DEPOTS
-- =====================================================
INSERT INTO depots (depot_name) VALUES 
('DEPOT PRINCIPAL'),
('DEPOT SECONDAIRE');

-- =====================================================
-- 6. ENTITY_DEPOTS (Liaison Entité-Dépôt)
-- =====================================================
INSERT INTO entity_depots (entity_id, depot_id) VALUES
(1, 1),
(1, 2);

-- =====================================================
-- 7. CONFIGURATIONS
-- =====================================================
INSERT INTO configurations (config_key, config_value, description) VALUES 
('TVA', '20', 'Taux de TVA en pourcentage'),
('REMISE_MAX_COMMERCIAL', '10', 'Plafond de remise maximum pour les commerciaux (en %)'),
('REMISE_MAX_RESPONSABLE', '25', 'Plafond de remise maximum pour les responsables (en %)');

-- =====================================================
-- 8. UNITES
-- =====================================================
INSERT INTO unites (unite_name, abreviation) VALUES 
('Unité', 'u'),
('Kilogramme', 'kg'),
('Litre', 'L'),
('Pièce', 'pc'),
('Mètre', 'm'),
('Boîte', 'box');

-- =====================================================
-- 9. CATEGORIES (Familles d'articles)
-- =====================================================
INSERT INTO categories (categorie_name, description, dluo, dlc) VALUES
('Vêtements', 'Collections homme, femme et enfant', NULL, NULL),
('Parfums', 'Eaux de parfum et eaux de toilette', 3650, NULL),
('Cosmétiques', 'Soins visage, corps et cheveux', 365, 180),
('Accessoires', 'Sacs, ceintures, foulards et bijoux', NULL, NULL),
('Chaussures', 'Chaussures homme, femme, enfant', NULL, NULL),
('Lingerie', 'Sous-vêtements et lingerie fine', 365, NULL),
('Soin du Corps', 'Produits de soin et hygiène corporelle', 365, 180),
('Maquillage', 'Produits de maquillage professionnels', 365, 180),
('Alimentaire', 'Produits alimentaires et consommables', 180, 90),
('Nettoyage', 'Produits de nettoyage et d''entretien', 730, NULL),
('Bureau', 'Fournitures de bureau et papier', NULL, NULL),
('Electronique', 'Matériels électroniques et accessoires', NULL, NULL),
('Emballage', 'Matériels d''emballage et conditionnement', NULL, NULL),
('Divers', 'Autres produits non classés', NULL, NULL);

-- =====================================================
-- 10. ARTICLES
-- =====================================================
INSERT INTO articles (refe, article_nom, valorisation, description, categorie_id, unite_id) VALUES
-- Vêtements
('VET-0001', 'Jean Slim Homme', 'FIFO', 'Jean slim coupe moderne', 1, 4),
('VET-0002', 'Robe Soirée Femme', 'CMUP', 'Robe élégante en satin', 1, 4),
-- Parfums
('PARF-0001', 'Eau de Parfum Oriental 50ml', 'LIFO', 'Parfum oriental signature 50ml', 2, 3),
('PARF-0002', 'Eau de Toilette Fraîche 100ml', 'FIFO', 'Parfum léger 100ml', 2, 3),
-- Cosmétiques
('COS-0001', 'Crème Visage Nutri 50ml', 'CMUP', 'Crème hydratante visage', 3, 3),
('COS-0002', 'Shampooing Doux 1L', 'FIFO', 'Shampooing professionnel 1L', 3, 3),
-- Accessoires
('ACC-0001', 'Sac Cabas Cuir', 'FIFO', 'Sac cabas en cuir pleine fleur', 4, 4),
-- Chaussures
('CHAUSS-0001', 'Sneakers Classic', 'CMUP', 'Sneakers unisexe confort', 5, 4),
-- Lingerie
('LING-0001', 'Ensemble Lingerie Femme', 'LIFO', 'Ensemble soutien-gorge et culotte', 6, 4),
-- Soin du Corps
('SOIN-0001', 'Lotion Corps Hydratante 500ml', 'FIFO', 'Lotion corps nourrissante', 7, 3),
-- Maquillage
('MAQ-0001', 'Palette Fards à Paupières', 'CMUP', 'Palette professionnelle 12 couleurs', 8, 4),
-- Alimentaire
('REF001', 'Sucre en poudre', 'LIFO', 'Sucre cristallisé en sachet 1kg', 9, 2),
('REF002', 'Eau minérale', 'LIFO', 'Bouteille eau 1.5L', 9, 3),
('REF008', 'Riz basmati', 'FIFO', 'Riz grain long sac 5kg', 9, 2),
('REF013', 'Farine blé', 'FIFO', 'Farine de blé T45 sac 1kg', 9, 2),
-- Nettoyage
('REF004', 'Savon liquide', 'FIFO', 'Savon main 5L', 10, 3),
('REF010', 'Chiffon microfibre', 'FIFO', 'Chiffon nettoyage 30x30cm', 10, 4),
('REF014', 'Désinfectant', 'FIFO', 'Désinfectant surfaces 750ml', 10, 3),
-- Bureau
('REF003', 'Cahier A4', 'CMUP', 'Cahier 96 pages grands carreaux', 11, 4),
('REF009', 'Stylo bille', 'CMUP', 'Stylo bleu pointe moyenne', 11, 4),
('REF015', 'Agrafeuse', 'CMUP', 'Agrafeuse bureau standard', 11, 4),
-- Electronique
('REF005', 'Câble USB', 'CMUP', 'Câble USB 2.0 longueur 1m', 12, 5),
('REF006', 'Cartouche encre', 'FIFO', 'Cartouche encre noire HP', 12, 4),
('REF012', 'Pile AA', 'LIFO', 'Pile alcaline longue durée', 12, 4),
-- Emballage
('REF007', 'Sac plastique', 'CMUP', 'Sac 50x60cm lot de 100', 13, 6),
('REF011', 'Bouteille vide', 'CMUP', 'Bouteille PET 1L', 13, 4);

-- =====================================================
-- 11. ARTICLE_ENTITIES (Liaison Article-Entité)
-- =====================================================
INSERT INTO article_entities (entity_id, article_id)
SELECT 1, id FROM articles;

-- =====================================================
-- 12. ARTICLE_PRIX (Prix initiaux)
-- =====================================================
INSERT INTO article_prix (article_id, prix, date_entree)
SELECT ae.id, 
    CASE a.refe
        WHEN 'VET-0001' THEN 45000.00
        WHEN 'VET-0002' THEN 150000.00
        WHEN 'PARF-0001' THEN 85000.00
        WHEN 'PARF-0002' THEN 60000.00
        WHEN 'COS-0001' THEN 22000.00
        WHEN 'COS-0002' THEN 80000.00
        WHEN 'ACC-0001' THEN 220000.00
        WHEN 'CHAUSS-0001' THEN 75000.00
        WHEN 'LING-0001' THEN 55000.00
        WHEN 'SOIN-0001' THEN 12500.00
        WHEN 'MAQ-0001' THEN 35000.00
        WHEN 'REF001' THEN 2500.00
        WHEN 'REF002' THEN 1500.00
        WHEN 'REF003' THEN 3500.00
        WHEN 'REF004' THEN 15000.00
        WHEN 'REF005' THEN 5000.00
        WHEN 'REF006' THEN 25000.00
        WHEN 'REF007' THEN 8000.00
        WHEN 'REF008' THEN 12000.00
        WHEN 'REF009' THEN 500.00
        WHEN 'REF010' THEN 2000.00
        WHEN 'REF011' THEN 1000.00
        WHEN 'REF012' THEN 3000.00
        WHEN 'REF013' THEN 3500.00
        WHEN 'REF014' THEN 8500.00
        WHEN 'REF015' THEN 15000.00
        ELSE 10000.00 
    END as prix,
    NOW()
FROM article_entities ae
JOIN articles a ON a.id = ae.article_id;

-- =====================================================
-- 13. FOURNISSEURS
-- =====================================================
INSERT INTO fournisseurs (fournisseur_nom, contact, adresse, coordonnee_bancaire) VALUES
('Fournisseur A', '0310031102', '123 Rue Principale, Ville A', 'FR76 1234 5678 9012 3456 7890 123'),
('Fournisseur B', '0232112141', '456 Avenue des Champs, Ville B', 'FR98 0987 6543 2109 8765 4321 098'),
('Fournisseur C', '1012412042', '789 Boulevard Central, Ville C', 'FR12 3456 7890 1234 5678 9012 345'),
('Madagascar Textile SARL', 'Tel:+261341234567; textile@madatex.mg', 'Zone Industrielle, Antsirabe', 'BIC:BNGMMGXXXX - ACC: 1234567899'),
('Parfums Import Co', 'Tel:+261320345678; contact@parfumsimport.mg', 'Analakely, Antananarivo', 'BIC:BFITMGXXX - ACC: 9876543210'),
('Cosmetik Pro', 'Tel:+261202233344; info@cosmetikpro.mg', 'Rue du Commerce, Toamasina', 'BIC:ERAKMGXXX - ACC: 1122334455');

-- =====================================================
-- 14. CLIENTS
-- =====================================================
INSERT INTO clients (client_nom, contact, adresse, coordonnee_bancaire) VALUES
('SARL Andry & Co', 'Tel:+261341234567; contact@andryco.mg', 'Lot II A 12, Antananarivo', 'BIC:BNGMMGXXXX - ACC: 1234567890'),
('Société FitLine', 'Tel:+261320345678; sales@fitline.mg', 'Zone Industrielle, Antsirabe', 'BIC:BFITMGXXX - ACC: 9876543210'),
('Ets Rakoto Import', 'Tel:+261202233344; contact@rakoto.mg', 'Rue du Commerce, Toamasina', 'BIC:ERAKMGXXX - ACC: 1122334455'),
('Compagnie MadaTech', 'Tel:+261341112223; info@madatech.mg', 'Avenue de la Technologie, Antananarivo', 'BIC:MDTMGXXX - ACC: 5566778899'),
('Association Solidarité', 'Tel:+261333224455; hello@solidarite.mg', 'Quartier Isoraka, Antananarivo', ''),
('Rajaonarimampianina H.', 'Tel:+261345678901; raja.h@example.mg', 'Analakely, Antananarivo', ''),
('Randriamamonjy S.', 'Tel:+261331234567; s.randria@example.mg', 'Ambohijatovo, Antananarivo', ''),
('Rasoa R.', 'Tel:+261334455666; rasoa.r@example.mg', 'Antsirabe Centre', ''),
('Andriamanana T.', 'Tel:+261339998877; tandria@example.mg', 'Toamasina, Rue des Fleurs', ''),
('Mme. Vololona N.', 'Tel:+261327776655; vololona.n@example.mg', 'Fianarantsoa, Rue Principale', '');

-- =====================================================
-- 15. ACHAT_PROCESSES (Processus d'achat)
-- =====================================================
INSERT INTO achat_processes (process_name, abreviation, valeur) VALUES 
('CREER', 'CR', 1),
('VALIDER MAGASINIER', 'VM', 11),
('VALIDER COMPTABLE', 'VC', 21),
('EN COMMANDE', 'EC', 31),
('RECEPTIONNER', 'RE', 41),
('VALIDER FACTURE', 'VF', 51),
('CLOTURER', 'CL', 61),
('ANNULER', 'AN', 0);

-- =====================================================
-- 16. BON_COMMANDE_PROCESSES (Processus Bon de commande)
-- =====================================================
INSERT INTO bon_commande_processes (process_name, abreviation, valeur) VALUES
('CREER', 'CR', 1),
('VALIDER', 'VAL', 10),
('ENVOYER', 'ENV', 20),
('RECEPTIONNER', 'REC', 30),
('CLOTURER', 'CLO', 40),
('ANNULER', 'ANN', 0);

-- =====================================================
-- 17. VENTE_PROCESSES (Processus de vente)
-- =====================================================
INSERT INTO vente_processes (process_name, abreviation, valeur) VALUES
-- Statuts Pro-forma (valeurs 10-50)
('Brouillon', 'BROUIL', 10),
('Envoyé', 'ENVOYE', 20),
('Accepté', 'ACCEPT', 30),
('Refusé', 'REFUSE', 40),
('Transformé en commande', 'TRANSF', 50),
-- Statuts Commande (valeurs 60-99)
('Confirmée', 'CONFIR', 60),
('En préparation', 'PREPAR', 70),
('Prête', 'PRETE', 80),
('Livrée', 'LIVRE', 90),
('Annulée', 'ANNULE', 99);

-- =====================================================
-- 18. LIVRAISON_VENTE_PROCESSES (Processus de livraison)
-- =====================================================
INSERT INTO livraison_vente_processes (process_name, abreviation, valeur) VALUES
('En préparation', 'PREPAR', 10),
('En transit', 'TRANS', 30),
('Livrée', 'LIVRE', 50),
('Annulée', 'ANNULE', 99);

-- =====================================================
-- 19. STOCK_RESERVATION_PROCESSES (Processus réservation stock)
-- =====================================================
INSERT INTO stock_reservation_processes (process_name, abreviation, valeur) VALUES
('Réservée', 'RES', 10),
('Allouée', 'ALL', 20),
('Consommée', 'CON', 30),
('Libérée', 'LIB', 99);

-- =====================================================
-- 20. STOCK_TYPE_MOUVEMENTS (Types de mouvement stock)
-- =====================================================
INSERT INTO stock_type_mouvements (id, type_name, description) VALUES
(1, 'ENTREE', 'Mouvement entrée en stock'),
(2, 'SORTIE', 'Mouvement sortie de stock');

-- =====================================================
-- 21. RAISON_MOUVEMENTS (Raisons de mouvement stock)
-- =====================================================
INSERT INTO raison_mouvements (raison_name, description) VALUES
('Réception fournisseur', 'ENTREE'),
('Retour client', 'ENTREE'),
('Ajustement positif', 'ENTREE'),
('Transfert entrant', 'ENTREE'),
('Livraison client', 'SORTIE'),
('Consommation interne', 'SORTIE'),
('Rebut', 'SORTIE'),
('Ajustement négatif', 'SORTIE'),
('Transfert sortant', 'SORTIE');

-- =====================================================
-- 22. INVENTAIRE_PROCESS (Processus d'inventaire)
-- =====================================================
INSERT INTO inventaire_process (process_name, abreviation, valeur) VALUES
('Création de l''inventaire', 'CRE', 1),
('Validation inventaire', 'VAL', 2),
('Rejet inventaire', 'REJ', 3),
('Clôture inventaire', 'CLO', 4),
('Annulation inventaire', 'ANN', 5);

-- =====================================================
-- 23. CAISSE_TYPE_MOUVEMENTS (Types de mouvement caisse)
-- =====================================================
INSERT INTO caisse_type_mouvements (type_name, valeur) VALUES
('Encaissement vente', 1),
('Encaissement autre', 2),
('Remboursement client', -1),
('Sortie de caisse', -2),
('Paiement fournisseur', -3);

-- =====================================================
-- 24. ROLES_ATTRIBUTION_PROCESS (Processus attribution rôles)
-- =====================================================
INSERT INTO roles_attribution_process (process_name, abreviation, valeur) VALUES
('Création de l''attribution de role', 'CRE', 1),
('Validation attribution de role', 'VAL', 2),
('Rejet attribution de role', 'REJ', 3),
('Annulation attribution de role', 'ANN', 4);

-- =====================================================
-- 25. PROFORMA_PROCESSES (Processus Pro-forma - si table séparée)
-- =====================================================
-- Note: Cette table peut être optionnelle si vente_processes suffit
-- INSERT INTO proforma_processes (process_name, process_code, description, ordre, couleur) VALUES
-- ('Créé', 'CREE', 'Pro-forma créé en brouillon', 1, '#6B7280'),
-- ('Validé', 'VALIDE', 'Pro-forma validé et envoyé au client', 2, '#10B981'),
-- ('Annulé', 'ANNULE', 'Pro-forma annulé', 3, '#EF4444');

-- =====================================================
-- 26. LOTS INITIAUX (Stock de départ)
-- =====================================================
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire, statut_lot)
VALUES
('LOT-VET-0001-001', (SELECT id FROM articles WHERE refe='VET-0001'), 1, NOW(), NULL, 200, 200, 45000.00, 'ACTIF'),
('LOT-VET-0002-001', (SELECT id FROM articles WHERE refe='VET-0002'), 1, NOW(), NULL, 100, 100, 150000.00, 'ACTIF'),
('LOT-PARF-0001-001', (SELECT id FROM articles WHERE refe='PARF-0001'), 1, NOW(), '2028-12-31', 150, 150, 85000.00, 'ACTIF'),
('LOT-PARF-0002-001', (SELECT id FROM articles WHERE refe='PARF-0002'), 1, NOW(), '2028-06-30', 120, 120, 60000.00, 'ACTIF'),
('LOT-COS-0001-001', (SELECT id FROM articles WHERE refe='COS-0001'), 2, NOW(), '2027-06-30', 300, 300, 22000.00, 'ACTIF'),
('LOT-COS-0002-001', (SELECT id FROM articles WHERE refe='COS-0002'), 1, NOW(), '2027-12-31', 80, 80, 80000.00, 'ACTIF'),
('LOT-ACC-0001-001', (SELECT id FROM articles WHERE refe='ACC-0001'), 1, NOW(), NULL, 50, 50, 220000.00, 'ACTIF'),
('LOT-CHAUSS-0001-001', (SELECT id FROM articles WHERE refe='CHAUSS-0001'), 2, NOW(), NULL, 150, 150, 75000.00, 'ACTIF'),
('LOT-LING-0001-001', (SELECT id FROM articles WHERE refe='LING-0001'), 1, NOW(), NULL, 200, 200, 55000.00, 'ACTIF'),
('LOT-SOIN-0001-001', (SELECT id FROM articles WHERE refe='SOIN-0001'), 2, NOW(), '2027-12-31', 500, 500, 12500.00, 'ACTIF'),
('LOT-MAQ-0001-001', (SELECT id FROM articles WHERE refe='MAQ-0001'), 1, NOW(), '2027-09-30', 250, 250, 35000.00, 'ACTIF'),
('LOT-REF001-001', (SELECT id FROM articles WHERE refe='REF001'), 1, NOW(), '2027-06-30', 500, 500, 2500.00, 'ACTIF'),
('LOT-REF002-001', (SELECT id FROM articles WHERE refe='REF002'), 2, NOW(), '2027-12-31', 1000, 1000, 1500.00, 'ACTIF'),
('LOT-REF003-001', (SELECT id FROM articles WHERE refe='REF003'), 1, NOW(), NULL, 300, 300, 3500.00, 'ACTIF'),
('LOT-REF004-001', (SELECT id FROM articles WHERE refe='REF004'), 2, NOW(), '2028-06-30', 100, 100, 15000.00, 'ACTIF'),
('LOT-REF005-001', (SELECT id FROM articles WHERE refe='REF005'), 1, NOW(), NULL, 200, 200, 5000.00, 'ACTIF'),
('LOT-REF006-001', (SELECT id FROM articles WHERE refe='REF006'), 1, NOW(), NULL, 150, 150, 25000.00, 'ACTIF'),
('LOT-REF008-001', (SELECT id FROM articles WHERE refe='REF008'), 2, NOW(), '2027-09-30', 400, 400, 12000.00, 'ACTIF'),
('LOT-REF009-001', (SELECT id FROM articles WHERE refe='REF009'), 1, NOW(), NULL, 1000, 1000, 500.00, 'ACTIF'),
('LOT-REF012-001', (SELECT id FROM articles WHERE refe='REF012'), 2, NOW(), '2028-12-31', 500, 500, 3000.00, 'ACTIF');

-- =====================================================
-- 27. UTILISATEUR ADMIN PAR DEFAUT
-- Note: Mot de passe à hasher avec BCrypt avant insertion
-- Le mot de passe ci-dessous est "admin123" encodé en BCrypt
-- =====================================================
INSERT INTO utilisateurs (nom, email, mot_de_passe, role_id, entity_id) VALUES
('Administrateur', 'admin@gestion.mg', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.QB28wGb2VBmtXRUyDS', 1, 1);

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================

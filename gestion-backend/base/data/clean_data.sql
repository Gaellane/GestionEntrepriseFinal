-- =====================================================
-- SCRIPT DE DONNEES CLEAN - GestionEntreprise
-- Ce script contient toutes les donnees necessaires
-- pour initialiser la base de donnees
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
-- Actions generales
('CREATE', 'Creation d un nouvel enregistrement'),
('UPDATE', 'Mise a jour d un enregistrement existant'),
('DELETE', 'Suppression d un enregistrement'),
('VIEW', 'Consultation d un enregistrement'),
('VALIDATE', 'Validation d un enregistrement'),
('REJECT', 'Rejet d un enregistrement'),
('APPROVE', 'Approbation finale d un enregistrement'),
('CANCEL', 'Annulation d un enregistrement'),
-- Achats
('REQUEST', 'Creation d une demande d achat'),
('ORDER', 'Creation d une commande d achat'),
('CONFIRM_FUNDS', 'Confirmation de disponibilite des fonds'),
('CLOSE_ORDER', 'Cloture d une commande d achat'),
-- Stock / Magasin
('RECEIVE', 'Reception de marchandises'),
('RETURN', 'Retour de marchandises'),
('ADJUST', 'Ajustement des niveaux de stock'),
('TRANSFER', 'Transfert de marchandises entre depots'),
('RESERVE', 'Reservation de stock'),
('RELEASE', 'Liberation de stock reserve'),
('INVENTORY', 'Realisation d inventaire'),
('VALIDATE_INVENTORY', 'Validation des resultats d inventaire'),
-- Ventes
('QUOTE', 'Creation d un devis'),
('SELL', 'Creation d une commande de vente'),
('SHIP', 'Expedition de marchandises'),
('DELIVER', 'Livraison au client'),
('INVOICE', 'emission d une facture'),
('CREDIT_NOTE', 'emission d un avoir'),
('COLLECT', 'Encaissement client'),
('Annulation Vente', 'Annulation d une commande de vente'),
-- Finance
('PAY', 'Paiement fournisseur'),
('RECONCILE', 'Rapprochement de comptes'),
('CLOSE_PERIOD', 'Cloture de periode comptable'),
-- Donnees
('EXPORT', 'Export de donnees'),
('IMPORT', 'Import de donnees'),
('ARCHIVE', 'Archivage d enregistrements'),
-- Securite / Audit
('LOGIN', 'Connexion utilisateur'),
('LOGOUT', 'Deconnexion utilisateur'),
('DELEGATE', 'Delegation d acces'),
('REVOKE', 'Revocation d acces delegue');

-- =====================================================
-- 4. ENTITIES (Entites)
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
-- 6. ENTITY_DEPOTS (Liaison Entite-Depot)
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
('Unite', 'u'),
('Kilogramme', 'kg'),
('Litre', 'L'),
('Piece', 'pc'),
('Metre', 'm'),
('Boîte', 'box');

-- =====================================================
-- 9. CATEGORIES (Familles d'articles)
-- =====================================================
INSERT INTO categories (categorie_name, description, dluo, dlc) VALUES
('Vêtements', 'Collections homme, femme et enfant', NULL, NULL),
('Parfums', 'Eaux de parfum et eaux de toilette', 3650, NULL),
('Cosmetiques', 'Soins visage, corps et cheveux', 365, 180),
('Accessoires', 'Sacs, ceintures, foulards et bijoux', NULL, NULL),
('Chaussures', 'Chaussures homme, femme, enfant', NULL, NULL),
('Lingerie', 'Sous-vêtements et lingerie fine', 365, NULL),
('Soin du Corps', 'Produits de soin et hygiene corporelle', 365, 180),
('Maquillage', 'Produits de maquillage professionnels', 365, 180),
('Alimentaire', 'Produits alimentaires et consommables', 180, 90),
('Nettoyage', 'Produits de nettoyage et d entretien', 730, NULL),
('Bureau', 'Fournitures de bureau et papier', NULL, NULL),
('Electronique', 'Materiels electroniques et accessoires', NULL, NULL),
('Emballage', 'Materiels d emballage et conditionnement', NULL, NULL),
('Divers', 'Autres produits non classes', NULL, NULL);

-- =====================================================
-- 10. ARTICLES
-- =====================================================
INSERT INTO articles (refe, article_nom, valorisation, description, categorie_id, unite_id) VALUES
-- Vêtements
('VET-0001', 'Jean Slim Homme', 'FIFO', 'Jean slim coupe moderne', 1, 4),
('VET-0002', 'Robe Soiree Femme', 'CMUP', 'Robe elegante en satin', 1, 4),
-- Parfums
('PARF-0001', 'Eau de Parfum Oriental 50ml', 'LIFO', 'Parfum oriental signature 50ml', 2, 3),
('PARF-0002', 'Eau de Toilette Fraîche 100ml', 'FIFO', 'Parfum leger 100ml', 2, 3),
-- Cosmetiques
('COS-0001', 'Creme Visage Nutri 50ml', 'CMUP', 'Creme hydratante visage', 3, 3),
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
('MAQ-0001', 'Palette Fards a Paupieres', 'CMUP', 'Palette professionnelle 12 couleurs', 8, 4),
-- Alimentaire
('REF001', 'Sucre en poudre', 'LIFO', 'Sucre cristallise en sachet 1kg', 9, 2),
('REF002', 'Eau minerale', 'LIFO', 'Bouteille eau 1.5L', 9, 3),
('REF008', 'Riz basmati', 'FIFO', 'Riz grain long sac 5kg', 9, 2),
('REF013', 'Farine ble', 'FIFO', 'Farine de ble T45 sac 1kg', 9, 2),
-- Nettoyage
('REF004', 'Savon liquide', 'FIFO', 'Savon main 5L', 10, 3),
('REF010', 'Chiffon microfibre', 'FIFO', 'Chiffon nettoyage 30x30cm', 10, 4),
('REF014', 'Desinfectant', 'FIFO', 'Desinfectant surfaces 750ml', 10, 3),
-- Bureau
('REF003', 'Cahier A4', 'CMUP', 'Cahier 96 pages grands carreaux', 11, 4),
('REF009', 'Stylo bille', 'CMUP', 'Stylo bleu pointe moyenne', 11, 4),
('REF015', 'Agrafeuse', 'CMUP', 'Agrafeuse bureau standard', 11, 4),
-- Electronique
('REF005', 'Câble USB', 'CMUP', 'Câble USB 2.0 longueur 1m', 12, 5),
('REF006', 'Cartouche encre', 'FIFO', 'Cartouche encre noire HP', 12, 4),
('REF012', 'Pile AA', 'LIFO', 'Pile alcaline longue duree', 12, 4),
-- Emballage
('REF007', 'Sac plastique', 'CMUP', 'Sac 50x60cm lot de 100', 13, 6),
('REF011', 'Bouteille vide', 'CMUP', 'Bouteille PET 1L', 13, 4);

-- =====================================================
-- 11. ARTICLE_ENTITIES (Liaison Article-Entite)
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
('Societe FitLine', 'Tel:+261320345678; sales@fitline.mg', 'Zone Industrielle, Antsirabe', 'BIC:BFITMGXXX - ACC: 9876543210'),
('Ets Rakoto Import', 'Tel:+261202233344; contact@rakoto.mg', 'Rue du Commerce, Toamasina', 'BIC:ERAKMGXXX - ACC: 1122334455'),
('Compagnie MadaTech', 'Tel:+261341112223; info@madatech.mg', 'Avenue de la Technologie, Antananarivo', 'BIC:MDTMGXXX - ACC: 5566778899'),
('Association Solidarite', 'Tel:+261333224455; hello@solidarite.mg', 'Quartier Isoraka, Antananarivo',  ),
('Rajaonarimampianina H.', 'Tel:+261345678901; raja.h@example.mg', 'Analakely, Antananarivo',  ),
('Randriamamonjy S.', 'Tel:+261331234567; s.randria@example.mg', 'Ambohijatovo, Antananarivo',  ),
('Rasoa R.', 'Tel:+261334455666; rasoa.r@example.mg', 'Antsirabe Centre',  ),
('Andriamanana T.', 'Tel:+261339998877; tandria@example.mg', 'Toamasina, Rue des Fleurs',  ),
('Mme. Vololona N.', 'Tel:+261327776655; vololona.n@example.mg', 'Fianarantsoa, Rue Principale',  );

-- =====================================================
-- 17. VENTE_PROCESSES (Processus de vente)
-- =====================================================
INSERT INTO vente_processes (process_name, abreviation, valeur) VALUES
-- Statuts Pro-forma (valeurs 10-50)
('Brouillon', 'BROUIL', 10),
('Envoye', 'ENVOYE', 20),
('Accepte', 'ACCEPT', 30),
('Refuse', 'REFUSE', 40),
('Transforme en commande', 'TRANSF', 50),
-- Statuts Commande (valeurs 60-99)
('Confirmee', 'CONFIR', 60),
('En preparation', 'PREPAR', 70),
('Prête', 'PRETE', 80),
('Livree', 'LIVRE', 90),
('Annulee', 'ANNULE', 99);

-- =====================================================
-- 18. LIVRAISON_VENTE_PROCESSES (Processus de livraison)
-- =====================================================
INSERT INTO livraison_vente_processes (process_name, abreviation, valeur) VALUES
('En preparation', 'PREPAR', 10),
('En transit', 'TRANS', 30),
('Livree', 'LIVRE', 50),
('Annulee', 'ANNULE', 99);

-- =====================================================
-- 19. STOCK_RESERVATION_PROCESSES (Processus reservation stock)
-- =====================================================
INSERT INTO stock_reservation_processes (process_name, abreviation, valeur) VALUES
('Reservee', 'RES', 10),
('Allouee', 'ALL', 20),
('Consommee', 'CON', 30),
('Liberee', 'LIB', 99);

-- =====================================================
-- 20. STOCK_TYPE_MOUVEMENTS (Types de mouvement stock)
-- =====================================================
INSERT INTO stock_type_mouvements (id, type_name, description) VALUES
(1, 'ENTREE', 'Mouvement entree en stock'),
(2, 'SORTIE', 'Mouvement sortie de stock');

-- =====================================================
-- 21. RAISON_MOUVEMENTS (Raisons de mouvement stock)
-- =====================================================
INSERT INTO raison_mouvements (raison_name, description) VALUES
('Reception fournisseur', 'ENTREE'),
('Retour client', 'ENTREE'),
('Ajustement positif', 'ENTREE'),
('Transfert entrant', 'ENTREE'),
('Livraison client', 'SORTIE'),
('Consommation interne', 'SORTIE'),
('Rebut', 'SORTIE'),
('Ajustement negatif', 'SORTIE'),
('Transfert sortant', 'SORTIE');

-- =====================================================
-- 22. INVENTAIRE_PROCESS (Processus d'inventaire)
-- =====================================================
INSERT INTO inventaire_process (process_name, abreviation, valeur) VALUES
('Creation de l inventaire', 'CRE', 1),
('Validation inventaire', 'VAL', 2),
('Rejet inventaire', 'REJ', 3),
('Cloture inventaire', 'CLO', 4),
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
-- 24. ROLES_ATTRIBUTION_PROCESS (Processus attribution roles)
-- =====================================================
INSERT INTO roles_attribution_process (process_name, abreviation, valeur) VALUES
('Creation de l attribution de role', 'CRE', 1),
('Validation attribution de role', 'VAL', 2),
('Rejet attribution de role', 'REJ', 3),
('Annulation attribution de role', 'ANN', 4);

-- =====================================================
-- 25. PROFORMA_PROCESSES (Processus Pro-forma - si table separee)
-- =====================================================
-- Note: Cette table peut être optionnelle si vente_processes suffit
-- INSERT INTO proforma_processes (process_name, process_code, description, ordre, couleur) VALUES
-- ('Cree', 'CREE', 'Pro-forma cree en brouillon', 1, '#6B7280'),
-- ('Valide', 'VALIDE', 'Pro-forma valide et envoye au client', 2, '#10B981'),
-- ('Annule', 'ANNULE', 'Pro-forma annule', 3, '#EF4444');

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================

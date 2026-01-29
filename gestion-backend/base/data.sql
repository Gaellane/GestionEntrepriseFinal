INSERT into departments (id, department_name) values 
(1, 'ADMIN'), (2, 'Direction'), (3, 'Achat'), (4, 'Vente'), (5, 'Magasin'), (6, 'Finance');

INSERT INTO roles (role_code,role_name, niveau_acces, department_id) VALUES 
('ADMIN','Admin', 100, 1),
('RESP_ACHAT','Responsable Achat', 11, 3),
('EMP_ACHAT','Employe Achat', 1, 3),
('RESP_VENTE','Responsable Vente', 11, 4),
('EMP_VENTE','Employe Vente', 1, 4),
('RESP_MAGASIN','Responsable Magasin', 11, 5),
('EMP_MAGASIN','Employe Magasin', 1, 5),
('RESP_FINANCE','Responsable Finance', 11, 6),
('EMP_FINANCE','Employe Finance', 1, 6),
('RESP_DIRECTION','Responsable Direction', 11, 2);


INSERT INTO actions (action_name, description) VALUES
('CREATE', 'Creation of a new record'),
('UPDATE', 'Update of an existing record'),
('DELETE', 'Deletion of a record'),
('VIEW', 'Viewing a record'),
('VALIDATE', 'Validation of a record'),
('REJECT', 'Rejection of a record'),
('APPROVE', 'Final approval of a record'),
('CANCEL', 'Cancellation of a record'),

-- Achats
('REQUEST', 'Creation of a purchase request'),
('ORDER', 'Creation of a purchase order'),
('CONFIRM_FUNDS', 'Confirmation of fund availability'),
('CLOSE_ORDER', 'Closing a purchase order'),

-- Stock / Magasin
('RECEIVE', 'Receiving goods or items'),
('RETURN', 'Returning goods or items'),
('ADJUST', 'Adjusting inventory levels'),
('TRANSFER', 'Transferring goods between locations'),
('RESERVE', 'Reserving stock'),
('RELEASE', 'Releasing reserved stock'),
('INVENTORY', 'Performing inventory counting'),
('VALIDATE_INVENTORY', 'Validation of inventory results'),

-- Ventes
('QUOTE', 'Creating a sales quotation'),
('SELL', 'Creating a sales order'),
('SHIP', 'Shipping goods or items'),
('DELIVER', 'Delivering goods to customer'),
('INVOICE', 'Issuing an invoice'),
('CREDIT_NOTE', 'Issuing a credit note'),
('COLLECT', 'Collecting customer payment'),

-- Finance
('PAY', 'Paying a supplier'),
('RECONCILE', 'Reconciling documents or accounts'),
('CLOSE_PERIOD', 'Closing accounting period'),

-- Donnees 
('EXPORT', 'Exporting data'),
('IMPORT', 'Importing data'),
('ARCHIVE', 'Archiving records'),

-- Securite / Audit
('LOGIN', 'User login action'),
('LOGOUT', 'User logout action'),
('DELEGATE', 'Delegation of access'),
('REVOKE', 'Revoking delegated access');


INSERT INTO entities(entity_name) VALUES
('Entite test');

INSERT INTO depots(depot_name) VALUES 
('DEPOTS 1') , ('DEPOT 2');

INSERT INTO entity_depots(entity_id, depot_id) VALUES
(1,1) , (1,2);

-- Configurations pour les remises et autres paramètres
INSERT INTO configurations(config_key, config_value, description) VALUES 
('TVA', '20', 'Taux de TVA en pourcentage'),
('REMISE_MAX_COMMERCIAL', '10', 'Plafond de remise maximum pour les commerciaux (en %)'),
('REMISE_MAX_RESPONSABLE', '25', 'Plafond de remise maximum pour les responsables (en %)');




INSERT INTO roles (role_code,role_name, niveau_acces, department_id) VALUES 
('MAGRECEP','MAGASINIER RECEPTION', 9, 1),
('MAGSORT','MAGASINIER SORTIE', 9, 1);

-- ==================================================================
-- Familles (categories) et Articles pour grand groupe
-- Valorisation possible: FIFO, LIFO, CMUP
-- ==================================================================

-- Catégories / familles
INSERT INTO categories (categorie_name, description) VALUES
('Vêtements', 'Collections homme, femme et enfant'),
('Parfums', 'Eaux de parfum et eaux de toilette'),
('Cosmétiques', 'Soins visage, corps et cheveux'),
('Accessoires', 'Sacs, ceintures, foulards et bijoux'),
('Chaussures', 'Chaussures homme, femme, enfant'),
('Lingerie', 'Sous-vêtements et lingerie fine'),
('Soin du Corps', 'Produits de soin et hygiène corporelle'),
('Maquillage', 'Produits de maquillage professionnels');

-- Mettre à jour les seuils de péremption par catégorie (DLUO = alerte en jours, DLC = blocage en jours)
UPDATE categories SET dluo = NULL, dlc = NULL WHERE categorie_name = 'Vêtements';
UPDATE categories SET dluo = 3650, dlc = NULL WHERE categorie_name = 'Parfums';
UPDATE categories SET dluo = 365, dlc = 180 WHERE categorie_name = 'Cosmétiques';
UPDATE categories SET dluo = NULL, dlc = NULL WHERE categorie_name = 'Accessoires';
UPDATE categories SET dluo = NULL, dlc = NULL WHERE categorie_name = 'Chaussures';
UPDATE categories SET dluo = 365, dlc = NULL WHERE categorie_name = 'Lingerie';
UPDATE categories SET dluo = 365, dlc = 180 WHERE categorie_name = 'Soin du Corps';
UPDATE categories SET dluo = 365, dlc = 180 WHERE categorie_name = 'Maquillage';

-- Articles (références et valorisation)
INSERT INTO articles (refe, article_nom, valorisation, description, categorie_id, unite_id) VALUES
('VET-0001', 'Jean Slim Homme', 'FIFO', 'Jean slim coupe moderne', (SELECT id FROM categories WHERE categorie_name='Vêtements'), (SELECT id FROM unites WHERE unite_name='Piece')),
('VET-0002', 'Robe Soirée Femme', 'CMUP', 'Robe élégante en satin', (SELECT id FROM categories WHERE categorie_name='Vêtements'), (SELECT id FROM unites WHERE unite_name='Piece')),
('PARF-0001', 'Eau de Parfum Oriental 50ml', 'LIFO', 'Parfum oriental signature 50ml', (SELECT id FROM categories WHERE categorie_name='Parfums'), (SELECT id FROM unites WHERE unite_name='Litre')),
('PARF-0002', 'Eau de Toilette Fraîche 100ml', 'FIFO', 'Parfum léger 100ml', (SELECT id FROM categories WHERE categorie_name='Parfums'), (SELECT id FROM unites WHERE unite_name='Litre')),
('COS-0001', 'Crème Visage Nutri 50ml', 'CMUP', 'Crème hydratante visage', (SELECT id FROM categories WHERE categorie_name='Cosmétiques'), (SELECT id FROM unites WHERE unite_name='Litre')),
('COS-0002', 'Shampooing Doux 1L', 'FIFO', 'Shampooing professionnel 1L', (SELECT id FROM categories WHERE categorie_name='Cosmétiques'), (SELECT id FROM unites WHERE unite_name='Litre')),
('ACC-0001', 'Sac Cabas Cuir', 'FIFO', 'Sac cabas en cuir pleine fleur', (SELECT id FROM categories WHERE categorie_name='Accessoires'), (SELECT id FROM unites WHERE unite_name='Piece')),
('CHAUSS-0001', 'Sneakers Classic', 'CMUP', 'Sneakers unisexe confort', (SELECT id FROM categories WHERE categorie_name='Chaussures'), (SELECT id FROM unites WHERE unite_name='Piece')),
('LING-0001', 'Ensemble Lingerie Femme', 'LIFO', 'Ensemble soutien-gorge et culotte', (SELECT id FROM categories WHERE categorie_name='Lingerie'), (SELECT id FROM unites WHERE unite_name='Piece')),
('SOIN-0001', 'Lotion Corps Hydratante 500ml', 'FIFO', 'Lotion corps nourrissante', (SELECT id FROM categories WHERE categorie_name='Soin du Corps'), (SELECT id FROM unites WHERE unite_name='Litre')),
('MAQ-0001', 'Palette Fards à Paupières', 'CMUP', 'Palette professionnelle 12 couleurs', (SELECT id FROM categories WHERE categorie_name='Maquillage'), (SELECT id FROM unites WHERE unite_name='Piece'));

-- Lier les articles à l'entité (ici entity_id = 1)
INSERT INTO article_entities (entity_id, article_id)
SELECT 1, a.id FROM articles a WHERE a.refe IN (
	'VET-0001','VET-0002','PARF-0001','PARF-0002','COS-0001','COS-0002','ACC-0001','CHAUSS-0001','LING-0001','SOIN-0001','MAQ-0001'
);

-- Prix d'entrée initiaux pour chaque article (lié à article_entities)
-- note: article_prix.article_id référence article_entities.id
INSERT INTO article_prix (article_id, prix, date_entree)
SELECT ae.id, CASE a.refe
		WHEN 'VET-0001' THEN 45.00
		WHEN 'VET-0002' THEN 150.00
		WHEN 'PARF-0001' THEN 85.00
		WHEN 'PARF-0002' THEN 60.00
		WHEN 'COS-0001' THEN 22.00
		WHEN 'COS-0002' THEN 8.50
		WHEN 'ACC-0001' THEN 220.00
		WHEN 'CHAUSS-0001' THEN 75.00
		WHEN 'LING-0001' THEN 55.00
		WHEN 'SOIN-0001' THEN 12.50
		WHEN 'MAQ-0001' THEN 35.00
		ELSE 0 END as prix,
	NOW()
FROM article_entities ae
JOIN articles a ON a.id = ae.article_id
WHERE a.refe IN (
	'VET-0001','VET-0002','PARF-0001','PARF-0002','COS-0001','COS-0002','ACC-0001','CHAUSS-0001','LING-0001','SOIN-0001','MAQ-0001'
);

-- Quelques lots initiaux pour permettre réception/sortie (quantités et prix unitaires)
INSERT INTO lots (numero, article_id, depot_id, date_arrivee, date_peremption, quantite, quantite_restante, prix_unitaire)
VALUES
('LOT-VET-0001-001', (SELECT id FROM articles WHERE refe='VET-0001'), 1, NOW(), NULL, 200, 200, 45.00),
('LOT-PARF-0001-001', (SELECT id FROM articles WHERE refe='PARF-0001'), 1, NOW(), NULL, 150, 150, 85.00),
('LOT-COS-0001-001', (SELECT id FROM articles WHERE refe='COS-0001'), 2, NOW(), NULL, 300, 300, 22.00),
('LOT-SOIN-0001-001', (SELECT id FROM articles WHERE refe='SOIN-0001'), 2, NOW(), '2027-12-31', 500, 500, 12.50);

-- END familles/articles

-- ==================================================================
-- Raison de mouvements (catégorisées : ENTREE / SORTIE)
-- ==================================================================
INSERT INTO raison_mouvements (raison_name, description) VALUES
('réception fournisseur', 'ENTREE'),
('retour client', 'ENTREE'),
('ajustement positif', 'ENTREE'),
('transfert entrant', 'ENTREE'),
('livraison client', 'SORTIE'),
('consommation interne', 'SORTIE'),
('rebut', 'SORTIE'),
('ajustement négatif', 'SORTIE'),
('transfert sortant', 'SORTIE');

-- Types de mouvement (ENTREE=1, SORTIE=2)
INSERT INTO stock_type_mouvements (id, type_name, description) VALUES
(1, 'ENTREE', 'Mouvement entrée en stock'),
(2, 'SORTIE', 'Mouvement sortie de stock');


-- Inventaire demande process (processus pour les demandes d'inventaire)
INSERT INTO inventaire_process (process_name, abreviation, valeur) VALUES
('Création de la demande', 'CRE', 1),
('Validation demande', 'VAL', 2),
('Rejet demande', 'REJ', 3),
('Clôture demande', 'CLO', 4),
('Annulation demande', 'ANN', 5);



INSERT INTO roles (role_code,role_name, niveau_acces, department_id) VALUES 
('MAGINV','MAGASINIER INVENTAIRE', 9, 5);
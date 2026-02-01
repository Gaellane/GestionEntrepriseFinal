-- Insertion achat processes
INSERT INTO achat_processes (process_name , abreviation , valeur) VALUES 
('CREER' , 'CR' ,1),
('VALIDER MAGASINIER' , 'VM' ,11),
('VALIDER COMPTABLE' , 'VC' ,21),
('EN COMMANDE' , 'EC' ,31),
('LIVRER' , 'LI' ,41),
('VALIDER FACTURE' , 'VF' ,51),
('CLOTURER' , 'CL' ,61) ,
('ANNULER' , 'AN' ,0);

INSERT INTO achat_processes (process_name , abreviation , valeur) VALUES 
('DEMANDE PROFORMA' , 'DP' ,25);
INSERT INTO achat_processes (process_name , abreviation , valeur) VALUES 
('RECEPTIONNER' , 'RE' ,45);

-- Insertion des fournisseurs
INSERT INTO fournisseurs (fournisseur_nom , contact , adresse , coordonnee_bancaire) VALUES
('Fournisseur A' , '0310031102' , '123 Rue Principale, Ville A' , 'FR76 1234 5678 9012 3456 7890 123'),
('Fournisseur B' , '0232112141' , '456 Avenue des Champs, Ville B' , 'FR98 0987 6543 2109 8765 4321 098'),
('Fournisseur C' , '1012412042' , '789 Boulevard Central, Ville C' , 'FR12 3456 7890 1234 5678 9012 345');

-- Insertion des catégories
INSERT INTO categories (categorie_name, description) VALUES
('Alimentaire', 'Produits alimentaires et consommables'),
('Nettoyage', 'Produits de nettoyage et d entretien'),
('Bureau', 'Fournitures de bureau et papier'),
('Electronique', 'Materiels electroniques et accessoires'),
('Emballage', 'Materiels d emballage et conditionnement'),
('Divers', 'Autres produits non classes');

-- Insertion des articles
INSERT INTO articles (refe, article_nom, valorisation, description, categorie_id, unite_id) VALUES
('REF001', 'Sucre en poudre', 'LIFO', 'Sucre cristallise en sachet 1kg', 1, 2),
('REF002', 'Eau minerale', 'LIFO', 'Bouteille eau 1.5L', 1, 3),
('REF003', 'Cahier A4', 'CMUP', 'Cahier 96 pages grands carreaux', 3, 4),
('REF004', 'Savon liquide', 'FIFO', 'Savon main 5L', 2, 3),
('REF005', 'Cable USB', 'CMUP', 'Cable USB 2.0 longueur 1m', 4, 5),
('REF006', 'Cartouche encre', 'FIFO', 'Cartouche encre noire HP', 4, 4),
('REF007', 'Sac plastique', 'CMUP', 'Sac 50x60cm lot de 100', 5, 6),
('REF008', 'Riz basmati', 'FIFO', 'Riz grain long sac 5kg', 1, 2),
('REF009', 'Stylo bille', 'CMUP', 'Stylo bleu pointe moyenne', 3, 4),
('REF010', 'Chiffon microfibre', 'FIFO', 'Chiffon nettoyage 30x30cm', 2, 4),
('REF011', 'Bouteille vide', 'CMUP', 'Bouteille PET 1L', 5, 4),
('REF012', 'Pile AA', 'LIFO', 'Pile alcaline longue duree', 4, 4),
('REF013', 'Farine ble', 'FIFO', 'Farine de ble T45 sac 1kg', 1, 2),
('REF014', 'Desinfectant', 'FIFO', 'Desinfectant surfaces 750ml', 2, 3),
('REF015', 'Agrapheuse', 'CMUP', 'Agrapheuse bureau standard', 3, 4);

-- Insertion des process bon commande
INSERT INTO bon_commande_processes (process_name , abreviation , valeur) VALUES 
('CREER' , 'CR' ,1),
('VALIDER' , 'VA' ,11),
('EN COMMANDE' , 'EC' ,21),
('LIVRER' , 'LI' ,41),
('CLOTURER' , 'CL' ,61) ,
('ANNULER' , 'AN' ,0);

INSERT INTO bon_commande_processes (process_name , abreviation , valeur) VALUES 
('RECEPTIONNER' , 'RE' ,45);

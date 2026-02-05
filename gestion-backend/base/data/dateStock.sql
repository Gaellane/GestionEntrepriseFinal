INSERT INTO stock_reservation_processes (process_name, abreviation, valeur) VALUES
('Reservee', 'RES', 10),
('Allouee', 'ALL', 20),
('Consommee', 'CON', 30),
('Liberee', 'LIB', 99);

INSERT INTO stock_type_mouvements (id, type_name, description) VALUES
(1, 'ENTREE', 'Mouvement entree en stock'),
(2, 'SORTIE', 'Mouvement sortie de stock');

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


INSERT INTO inventaire_process (process_name, abreviation, valeur) VALUES
('Creation de l inventaire', 'CRE', 1),
('Validation inventaire', 'VAL', 2),
('Rejet inventaire', 'REJ', 3),
('Clôture inventaire', 'CLO', 4),
('Annulation inventaire', 'ANN', 5);
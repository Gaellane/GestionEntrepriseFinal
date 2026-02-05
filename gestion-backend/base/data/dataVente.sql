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

INSERT INTO livraison_vente_processes (process_name, abreviation, valeur) VALUES
('En preparation', 'PREPAR', 10),
('Expediee', 'EXPED', 20),
('En transit', 'TRANS', 30),
('Livree', 'LIVRE', 40),
('Annulee', 'ANNULE', 99);


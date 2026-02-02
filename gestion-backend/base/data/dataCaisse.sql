INSERT INTO caisse_type_mouvements(type_name,valeur) VALUES
('ENTREE',1),
('SORTIE',-1);


INSERT INTO caisse_mouvements(montant,type_mouvement_id,date_entree,entity_id,details) VALUES 
(900000,1,'2026-01-01',1,'Test');
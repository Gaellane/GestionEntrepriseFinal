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

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





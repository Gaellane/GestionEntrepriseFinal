--- AUTORIZATION TABLES AND DATA(departments, roles, entities, utilisateurs, actions, audit_logs, configurations)

CREATE TABLE entities (
    id SERIAL PRIMARY KEY,
    entity_name VARCHAR(100) NOT NULL
);

CREATE TABLE departments (
    id INTEGER PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL
);

INSERT into departments (id, department_name) values 
(1, 'ADMIN'), (2, 'Direction'), (3, 'Achat'), (4, 'Vente'), (5, 'Magasin'), (6, 'Finance');

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_code VARCHAR(100) NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    niveau_acces INTEGER NOT NULL,
    department_id INTEGER NOT NULL REFERENCES departments(id)
);

-- admin 100
-- responsable direction 11
-- finance 59 -> 50
-- magasin 49 -> 40
-- vente 39 -> 30
-- achat 29 -> 20
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

CREATE TABLE depots (
    id SERIAL PRIMARY KEY,
    depot_name VARCHAR(100) NOT NULL
);

CREATE TABLE entity_depots (
    id SERIAL PRIMARY KEY,
    entity_id INTEGER NOT NULL REFERENCES entities(id),
    depot_id INTEGER NOT NULL REFERENCES depots(id)
);

CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(100) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    entity_id INTEGER NOT NULL REFERENCES entities(id)
);

CREATE TABLE actions (
    id SERIAL PRIMARY KEY,
    action_name VARCHAR(100) NOT NULL,
    description TEXT
);

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

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER REFERENCES utilisateurs(id),
    action_id INTEGER REFERENCES actions(id),
    classes VARCHAR(100), -- separateur ;
    ids_classes TEXT NOT NULL, -- separateur , ;
    action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    old_values TEXT, -- vide si create
    new_values TEXT, -- vide si delete
    details TEXT
);

CREATE TABLE configurations (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    description TEXT
);

INSERT INTO configurations(config_key, config_value) VALUES ('TVA', '20');

--- STOCK MANAGEMENT TABLES 

CREATE TABLE unites (
    id SERIAL PRIMARY KEY,
    unite_name VARCHAR(50) NOT NULL,
    abreviation VARCHAR(10) NOT NULL
);

INSERT INTO unites (unite_name, abreviation) VALUES 
('unites', 'u'),
('Kilogramme', 'kg'),
('Litre', 'L'),
('Piece', 'pc'),
('Metre', 'm'),
('Boite', 'box');

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    categorie_name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    refe VARCHAR(100) UNIQUE NOT NULL,
    article_nom VARCHAR(100) NOT NULL,
    valorisation VARCHAR(50) NOT NULL,
    description TEXT,
    categorie_id INTEGER REFERENCES categories(id),
    unite_id INTEGER REFERENCES unites(id)
);

CREATE TABLE article_entities (
    id SERIAL PRIMARY KEY,
    entity_id INTEGER NOT NULL REFERENCES entities(id),
    article_id INTEGER NOT NULL REFERENCES articles(id)
);

CREATE TABLE article_prix (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES article_entities(id),
    prix DECIMAL(15,2) NOT NULL,
    date_entree TIMESTAMP NOT NULL
);

CREATE TABLE fournisseurs (
    id SERIAL PRIMARY KEY,
    fournisseur_nom VARCHAR(100) NOT NULL,
    contact VARCHAR(100),
    adresse TEXT,
    coordonnee_bancaire TEXT
);

CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    client_nom VARCHAR(100) NOT NULL,
    contact VARCHAR(100),
    adresse TEXT,
    coordonnee_bancaire TEXT
);

--- ACHAT TABLES
CREATE TABLE achat_processes (
    id SERIAL PRIMARY KEY,
    process_name VARCHAR(100) NOT NULL,
    abreviation VARCHAR(10) NOT NULL,
    valeur INTEGER NOT NULL
);

CREATE TABLE achats (
    id SERIAL PRIMARY KEY,
    date_entree TIMESTAMP NOT NULL,
    demandeur INTEGER NOT NULL REFERENCES utilisateurs(id),
    date_effective DATE NOT NULL,
    process_id INTEGER NOT NULL REFERENCES achat_processes(id),
    refe VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE achat_lignes (
    id SERIAL PRIMARY KEY,
    achat_id INTEGER NOT NULL REFERENCES achats(id),
    article_id INTEGER NOT NULL REFERENCES articles(id),
    quantite DECIMAL(15,2) NOT NULL,
    prix_unitaire DECIMAL(15,2) NOT NULL,
    prix_unitaire_estime DECIMAL(15,2) NOT NULL
);

CREATE TABLE achat_historiques (
    id SERIAL PRIMARY KEY,
    date_entree TIMESTAMP NOT NULL,
    achat_id INTEGER NOT NULL REFERENCES achats(id),
    process_id INTEGER NOT NULL REFERENCES achat_processes(id)
);

CREATE TABLE proforma_achats (
    id SERIAL PRIMARY KEY,
    achat_id INTEGER NOT NULL REFERENCES achats(id),
    fournisseur_id INTEGER NOT NULL REFERENCES fournisseurs(id),
    date_entree TIMESTAMP NOT NULL,
    montant_total DECIMAL(15,2) NOT NULL,
    lien_fichier VARCHAR(200),
    refe VARCHAR(100) NOT NULL
);

CREATE TABLE proforma_achat_lignes (
    id SERIAL PRIMARY KEY,
    proforma_id INTEGER NOT NULL REFERENCES proforma_achats(id),
    article_id INTEGER NOT NULL REFERENCES articles(id),
    quantite DECIMAL(15,2) NOT NULL,
    prix_unitaire DECIMAL(15,2) NOT NULL
);

CREATE TABLE bon_commande_processes (
    id SERIAL PRIMARY KEY,
    process_name VARCHAR(100) NOT NULL,
    abreviation VARCHAR(10) NOT NULL,
    valeur INTEGER NOT NULL
);

CREATE TABLE bon_commandes_achats (
    id SERIAL PRIMARY KEY,
    proforma_id INTEGER NOT NULL REFERENCES proforma_achats(id),
    date_entree TIMESTAMP NOT NULL,
    montant_total DECIMAL(15,2) NOT NULL,
    process_id INTEGER NOT NULL REFERENCES bon_commande_processes(id),
    refe VARCHAR(100) NOT NULL
);

CREATE TABLE bon_commande_achat_lignes (
    id SERIAL PRIMARY KEY,
    bon_commande_id INTEGER NOT NULL REFERENCES bon_commandes_achats(id),
    article_id INTEGER NOT NULL REFERENCES articles(id),
    quantite DECIMAL(15,2) NOT NULL,
    prix_unitaire DECIMAL(15,2) NOT NULL
);

CREATE TABLE bon_commande_historiques (
    id SERIAL PRIMARY KEY,
    date_entree TIMESTAMP NOT NULL,
    bon_commande_id INTEGER NOT NULL  REFERENCES bon_commandes_achats(id),
    process_id INTEGER NOT NULL REFERENCES bon_commande_processes(id)
);

CREATE TABLE reception_achats (
    id SERIAL PRIMARY KEY,
    bon_commande_id INTEGER NOT NULL REFERENCES bon_commandes_achats(id),
    date_entree TIMESTAMP NOT NULL,
    refe VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE reception_achat_lignes (
    id SERIAL PRIMARY KEY,
    reception_id INTEGER NOT NULL REFERENCES reception_achats(id),
    article_id INTEGER NOT NULL REFERENCES articles(id),
    depot_id INTEGER NOT NULL REFERENCES depots(id),
    quantite DECIMAL(15,2) NOT NULL
);

CREATE TABLE livraison_achats (
    id SERIAL PRIMARY KEY,
    date_entree TIMESTAMP NOT NULL,
    bon_commande_id INTEGER NOT NULL REFERENCES bon_commandes_achats(id),
    refe VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE livraison_achat_lignes (
    id SERIAL PRIMARY KEY,
    livraison_id INTEGER NOT NULL REFERENCES livraison_achats(id),
    article_id INTEGER NOT NULL REFERENCES articles(id),
    quantite DECIMAL(15,2)
);

--- STOCK / MAGASIN TABLES

CREATE TABLE lots (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(100) UNIQUE NOT NULL,
    article_id INTEGER NOT NULL REFERENCES articles(id),
    depot_id INTEGER NOT NULL REFERENCES depots(id),
    date_arrivee TIMESTAMP NOT NULL,
    date_peremption TIMESTAMP,
    quantite DECIMAL(15,2) NOT NULL,
    quantite_restante DECIMAL(15,2) NOT NULL,
    prix_unitaire DECIMAL(15,2) NOT NULL,

);

CREATE SEQUENCE IF NOT EXISTS lot_num_seq START 1;


CREATE TABLE stock_type_mouvements (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,
    description TEXT
);

------------- NAMPIANA TABLES -------------
CREATE TABLE raison_mouvements (
    id SERIAL PRIMARY KEY,
    raison_name VARCHAR(100) NOT NULL,
    description TEXT
);
CREATE TABLE lot_mouvements (
    id SERIAL PRIMARY KEY,
    lot_id INTEGER NOT NULL REFERENCES lots(id),
    quantite DECIMAL(15,2) NOT NULL,
    type_mouvement_id INTEGER NOT NULL REFERENCES stock_type_mouvements(id),
    raison_id INTEGER NOT NULL REFERENCES raison_mouvements(id),
    date_entree TIMESTAMP NOT NULL,
    chemin_document VARCHAR(200),
    description TEXT
);

CREATE TABLE stock_reservation_processes (
    id SERIAL PRIMARY KEY,
    process_name VARCHAR(100) NOT NULL,
    abreviation VARCHAR(10) NOT NULL,
    valeur INTEGER NOT NULL
);

CREATE TABLE stock_reservations (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(id),
    quantite DECIMAL(15,2) NOT NULL,
    date_entree TIMESTAMP NOT NULL,
    process_id INTEGER NOT NULL REFERENCES stock_reservation_processes(id),
    reference VARCHAR(100) NOT NULL
);

CREATE TABLE stock_reservation_historiques (
    id SERIAL PRIMARY KEY,
    date_entree TIMESTAMP NOT NULL,
    stock_id INTEGER NOT NULL REFERENCES stock_reservations(id),
    process_id INTEGER NOT NULL REFERENCES stock_reservation_processes(id)
);

--- VENTE TABLES

CREATE TABLE vente_processes (
    id SERIAL PRIMARY KEY,
    process_name VARCHAR(100) NOT NULL,
    abreviation VARCHAR(10) NOT NULL,
    valeur INTEGER NOT NULL
);

CREATE TABLE proforma_ventes (
    id SERIAL PRIMARY KEY,
    process_id INTEGER NOT NULL REFERENCES vente_processes(id),
    date_entree TIMESTAMP NOT NULL,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    refe VARCHAR(100) UNIQUE NOT NULL,
    prix_total DECIMAL(15,2) NOT NULL,
    remise_pourcentage DECIMAL(4,2) DEFAULT 0,
    remise_fixe DECIMAL(15,2) DEFAULT 0
);

CREATE TABLE proforma_vente_lignes (
    id SERIAL PRIMARY KEY,
    proforma_id INTEGER NOT NULL REFERENCES proforma_ventes(id),
    article_id INTEGER NOT NULL REFERENCES articles(id),
    quantite DECIMAL(15,2) NOT NULL,
    prix_unitaire DECIMAL(15,2) NOT NULL,
    remise_pourcentage DECIMAL(4,2) DEFAULT 0,
    remise_fixe DECIMAL(15,2) DEFAULT 0
);

CREATE TABLE ventes (
    id SERIAL PRIMARY KEY,
    refe VARCHAR(100) UNIQUE NOT NULL,
    date_entree TIMESTAMP NOT NULL,
    proforma_id INTEGER NOT NULL REFERENCES proforma_ventes(id),
    date_effective DATE NOT NULL,
    date_livraison DATE NOT NULL,
    location_livraison VARCHAR(200) NOT NULL,
    prix_total DECIMAL(15,2) NOT NULL,
    remise_pourcentage DECIMAL(4,2) DEFAULT 0,
    remise_fixe DECIMAL(15,2) DEFAULT 0,
    process_id INTEGER NOT NULL REFERENCES vente_processes(id)
);

CREATE TABLE vente_lignes (
    id SERIAL PRIMARY KEY,
    vente_id INTEGER NOT NULL REFERENCES ventes(id),
    article_id INTEGER NOT NULL REFERENCES articles(id),
    quantite DECIMAL(15,2) NOT NULL,
    prix_unitaire DECIMAL(15,2) NOT NULL,
    remise_pourcentage DECIMAL(4,2) DEFAULT 0,
    remise_fixe DECIMAL(15,2) DEFAULT 0
);

CREATE TABLE vente_historiques (
    id SERIAL PRIMARY KEY,
    date_entree TIMESTAMP NOT NULL,
    vente_id INTEGER NOT NULL REFERENCES ventes(id),
    process_id INTEGER NOT NULL REFERENCES vente_processes(id)
);

--- LIVRAISON TABLES 

CREATE TABLE livraison_vente_processes (
    id SERIAL PRIMARY KEY,
    process_name VARCHAR(100) NOT NULL,
    abreviation VARCHAR(10) NOT NULL,
    valeur INTEGER NOT NULL
);

CREATE TABLE livraison_ventes (
    id SERIAL PRIMARY KEY,
    vente_id INTEGER NOT NULL REFERENCES ventes(id),
    process_id INTEGER NOT NULL REFERENCES livraison_vente_processes(id),
    date_entree TIMESTAMP NOT NULL,
    refe VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE livraison_vente_lignes (
    id SERIAL PRIMARY KEY,
    livraison_id INTEGER NOT NULL REFERENCES livraison_ventes(id),
    article_id INTEGER NOT NULL REFERENCES articles(id),
    quantite DECIMAL(15,2) NOT NULL
);

CREATE TABLE livraison_vente_historiques (
    id SERIAL PRIMARY KEY,
    date_entree TIMESTAMP NOT NULL,
    livraison_id INTEGER NOT NULL REFERENCES livraison_ventes(id),
    process_id INTEGER NOT NULL REFERENCES livraison_vente_processes(id)
);

CREATE TABLE inventaires (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id),
    date_entree TIMESTAMP NOT NULL,
    depot_id INTEGER NOT NULL REFERENCES depots(id),
    details TEXT
);

CREATE TABLE inventaire_lignes (
    id SERIAL PRIMARY KEY,
    inventaire_id INTEGER NOT NULL REFERENCES inventaires(id),
    article_id INTEGER NOT NULL REFERENCES articles(id),
    quantite DECIMAL(15,2) NOT NULL
);

CREATE TABLE caisse_type_mouvements (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,
    valeur INTEGER NOT NULL
);

CREATE TABLE caisse_mouvements (
    id SERIAL PRIMARY KEY,
    montant DECIMAL(15,2) NOT NULL,
    type_mouvement_id INTEGER NOT NULL REFERENCES caisse_type_mouvements(id),
    date_entree TIMESTAMP NOT NULL,
    entity_id INTEGER NOT NULL REFERENCES entities(id),
    details TEXT
);

-- Updates hanatsarana tracabilite changement de roles

CREATE TABLE roles_attribution_historiques(
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER REFERENCES utilisateurs(id),
    role_id INTEGER REFERENCES roles(id),
    date_entree TIMESTAMP NOT NULL
);


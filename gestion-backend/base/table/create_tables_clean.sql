-- =====================================================
-- Script de création des tables - Système de Gestion
-- =====================================================
-- Ordre de création: tables sans dépendances d'abord,
-- puis tables avec clés étrangères
-- =====================================================

-- =====================================================
-- TABLES DE BASE (sans dépendances)
-- =====================================================

-- Table: unites
CREATE TABLE IF NOT EXISTS unites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unite_name VARCHAR(50) NOT NULL,
    abreviation VARCHAR(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: categories
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categorie_name VARCHAR(100) NOT NULL,
    description TEXT,
    dluo INT COMMENT 'Date Limite d''Utilisation Optimale en jours',
    dlc INT COMMENT 'Date Limite de Consommation en jours'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: depots
CREATE TABLE IF NOT EXISTS depots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    depot_name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: departments
CREATE TABLE IF NOT EXISTS departments (
    id INT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: entities
CREATE TABLE IF NOT EXISTS entities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: fournisseurs
CREATE TABLE IF NOT EXISTS fournisseurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fournisseur_nom VARCHAR(100) NOT NULL,
    contact VARCHAR(100),
    adresse TEXT,
    coordonnee_bancaire TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: clients
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_nom VARCHAR(100) NOT NULL,
    contact VARCHAR(100),
    adresse TEXT,
    coordonnee_bancaire TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: configurations
CREATE TABLE IF NOT EXISTS configurations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: actions
CREATE TABLE IF NOT EXISTS actions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action_name VARCHAR(100) NOT NULL,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLES DE PROCESSUS
-- =====================================================

-- Table: achat_processes
CREATE TABLE IF NOT EXISTS achat_processes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    process_name VARCHAR(100) NOT NULL,
    abreviation VARCHAR(10) NOT NULL,
    valeur INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: vente_processes
CREATE TABLE IF NOT EXISTS vente_processes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    process_name VARCHAR(100) NOT NULL,
    abreviation VARCHAR(10) NOT NULL,
    valeur INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: bon_commande_processes
CREATE TABLE IF NOT EXISTS bon_commande_processes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    process_name VARCHAR(100) NOT NULL,
    abreviation VARCHAR(10) NOT NULL,
    valeur INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: stock_reservation_processes
CREATE TABLE IF NOT EXISTS stock_reservation_processes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    process_name VARCHAR(100) NOT NULL,
    abreviation VARCHAR(10) NOT NULL,
    valeur INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: livraison_vente_processes
CREATE TABLE IF NOT EXISTS livraison_vente_processes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    process_name VARCHAR(100) NOT NULL,
    abreviation VARCHAR(10) NOT NULL,
    valeur INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: inventaire_process
CREATE TABLE IF NOT EXISTS inventaire_process (
    id INT AUTO_INCREMENT PRIMARY KEY,
    process_name VARCHAR(100) NOT NULL,
    abreviation VARCHAR(10) NOT NULL,
    valeur INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: roles_attribution_process
CREATE TABLE IF NOT EXISTS roles_attribution_process (
    id INT AUTO_INCREMENT PRIMARY KEY,
    process_name VARCHAR(100) NOT NULL,
    abreviation VARCHAR(10) NOT NULL,
    valeur INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: stock_type_mouvements
CREATE TABLE IF NOT EXISTS stock_type_mouvements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: raison_mouvements
CREATE TABLE IF NOT EXISTS raison_mouvements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    raison_name VARCHAR(100) NOT NULL,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: caisse_type_mouvements
CREATE TABLE IF NOT EXISTS caisse_type_mouvements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,
    valeur INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLES AVEC DÉPENDANCES (Niveau 1)
-- =====================================================

-- Table: articles
CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    refe VARCHAR(100) NOT NULL UNIQUE,
    article_nom VARCHAR(100) NOT NULL,
    valorisation VARCHAR(50) NOT NULL COMMENT 'CMUP, FIFO, LIFO',
    description TEXT,
    categorie_id INT,
    unite_id INT,
    FOREIGN KEY (categorie_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (unite_id) REFERENCES unites(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: entity_depots
CREATE TABLE IF NOT EXISTS entity_depots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_id INT NOT NULL,
    depot_id INT NOT NULL,
    FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
    FOREIGN KEY (depot_id) REFERENCES depots(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: roles
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL,
    role_code VARCHAR(100) NOT NULL,
    niveau_acces INT NOT NULL,
    department_id INT NOT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: utilisateurs
CREATE TABLE IF NOT EXISTS utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(100) NOT NULL,
    role_id INT,
    entity_id INT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
    FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: article_entities
CREATE TABLE IF NOT EXISTS article_entities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_id INT NOT NULL,
    article_id INT NOT NULL,
    FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: article_prix
CREATE TABLE IF NOT EXISTS article_prix (
    id INT AUTO_INCREMENT PRIMARY KEY,
    article_id INT NOT NULL,
    prix DOUBLE NOT NULL,
    date_entree DATETIME NOT NULL,
    FOREIGN KEY (article_id) REFERENCES article_entities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: lots
CREATE TABLE IF NOT EXISTS lots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(100) NOT NULL UNIQUE,
    article_id INT NOT NULL,
    depot_id INT NOT NULL,
    date_arrivee DATETIME NOT NULL,
    date_peremption DATETIME,
    quantite DOUBLE NOT NULL,
    quantite_restante DOUBLE NOT NULL,
    prix_unitaire DOUBLE NOT NULL,
    statut_lot VARCHAR(20) DEFAULT 'ACTIF' COMMENT 'ACTIF, BLOQUE',
    raison_blocage TEXT,
    date_blocage DATETIME,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE RESTRICT,
    FOREIGN KEY (depot_id) REFERENCES depots(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: lot_mouvements
CREATE TABLE IF NOT EXISTS lot_mouvements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lot_id INT NOT NULL,
    quantite DOUBLE NOT NULL,
    type_mouvement_id INT NOT NULL,
    raison_id INT NOT NULL,
    chemin_document VARCHAR(200),
    date_entree DATETIME NOT NULL,
    description TEXT,
    FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE CASCADE,
    FOREIGN KEY (type_mouvement_id) REFERENCES stock_type_mouvements(id) ON DELETE RESTRICT,
    FOREIGN KEY (raison_id) REFERENCES raison_mouvements(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: stock_reservations
CREATE TABLE IF NOT EXISTS stock_reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    article_id INT NOT NULL,
    quantite DOUBLE NOT NULL,
    date_entree DATETIME NOT NULL,
    process_id INT NOT NULL,
    reference VARCHAR(100) NOT NULL,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE RESTRICT,
    FOREIGN KEY (process_id) REFERENCES stock_reservation_processes(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: stock_reservation_historiques
CREATE TABLE IF NOT EXISTS stock_reservation_historiques (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date_entree DATETIME NOT NULL,
    stock_id INT NOT NULL,
    process_id INT NOT NULL,
    FOREIGN KEY (stock_id) REFERENCES stock_reservations(id) ON DELETE CASCADE,
    FOREIGN KEY (process_id) REFERENCES stock_reservation_processes(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: achats
CREATE TABLE IF NOT EXISTS achats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date_entree DATETIME NOT NULL,
    demandeur INT NOT NULL,
    date_effective DATE NOT NULL,
    process_id INT NOT NULL,
    refe VARCHAR(100) NOT NULL UNIQUE,
    FOREIGN KEY (demandeur) REFERENCES utilisateurs(id) ON DELETE RESTRICT,
    FOREIGN KEY (process_id) REFERENCES achat_processes(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: achat_lignes
CREATE TABLE IF NOT EXISTS achat_lignes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    achat_id INT NOT NULL,
    article_id INT NOT NULL,
    quantite DOUBLE NOT NULL,
    prix_unitaire DOUBLE,
    prix_unitaire_estime DOUBLE NOT NULL,
    FOREIGN KEY (achat_id) REFERENCES achats(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: achat_historiques
CREATE TABLE IF NOT EXISTS achat_historiques (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date_entree DATETIME NOT NULL,
    achat_id INT NOT NULL,
    process_id INT NOT NULL,
    FOREIGN KEY (achat_id) REFERENCES achats(id) ON DELETE CASCADE,
    FOREIGN KEY (process_id) REFERENCES achat_processes(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: commande
CREATE TABLE IF NOT EXISTS commande (
    id INT AUTO_INCREMENT PRIMARY KEY,
    achat_id INT NOT NULL,
    fournisseur_id INT NOT NULL,
    date_commande DATETIME NOT NULL,
    FOREIGN KEY (achat_id) REFERENCES achats(id) ON DELETE CASCADE,
    FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: proforma_achats
CREATE TABLE IF NOT EXISTS proforma_achats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    achat_id INT NOT NULL,
    fournisseur_id INT NOT NULL,
    date_entree DATETIME NOT NULL,
    montant_total DOUBLE NOT NULL,
    refe VARCHAR(100) NOT NULL,
    lien_fichier VARCHAR(200),
    FOREIGN KEY (achat_id) REFERENCES achats(id) ON DELETE CASCADE,
    FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: proforma_achat_lignes
CREATE TABLE IF NOT EXISTS proforma_achat_lignes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proforma_id INT NOT NULL,
    article_id INT NOT NULL,
    quantite DOUBLE NOT NULL,
    prix_unitaire DOUBLE NOT NULL,
    FOREIGN KEY (proforma_id) REFERENCES proforma_achats(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: bon_commandes_achats
CREATE TABLE IF NOT EXISTS bon_commandes_achats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proforma_id INT NOT NULL,
    date_entree DATETIME NOT NULL,
    montant_total DOUBLE NOT NULL,
    process_id INT NOT NULL,
    refe VARCHAR(100) NOT NULL,
    FOREIGN KEY (proforma_id) REFERENCES proforma_achats(id) ON DELETE CASCADE,
    FOREIGN KEY (process_id) REFERENCES bon_commande_processes(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: bon_commande_achat_lignes
CREATE TABLE IF NOT EXISTS bon_commande_achat_lignes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bon_commande_id INT NOT NULL,
    article_id INT NOT NULL,
    quantite DOUBLE NOT NULL,
    prix_unitaire DOUBLE NOT NULL,
    FOREIGN KEY (bon_commande_id) REFERENCES bon_commandes_achats(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: bon_commande_historiques
CREATE TABLE IF NOT EXISTS bon_commande_historiques (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date_entree DATETIME NOT NULL,
    bon_commande_id INT NOT NULL,
    process_id INT NOT NULL,
    FOREIGN KEY (bon_commande_id) REFERENCES bon_commandes_achats(id) ON DELETE CASCADE,
    FOREIGN KEY (process_id) REFERENCES bon_commande_processes(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: reception_achats
CREATE TABLE IF NOT EXISTS reception_achats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bon_commande_id INT NOT NULL,
    date_entree DATETIME NOT NULL,
    refe VARCHAR(100) NOT NULL UNIQUE,
    FOREIGN KEY (bon_commande_id) REFERENCES bon_commandes_achats(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: reception_achat_lignes
CREATE TABLE IF NOT EXISTS reception_achat_lignes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reception_id INT NOT NULL,
    article_id INT NOT NULL,
    depot_id INT NOT NULL,
    quantite DOUBLE NOT NULL,
    FOREIGN KEY (reception_id) REFERENCES reception_achats(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE RESTRICT,
    FOREIGN KEY (depot_id) REFERENCES depots(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: livraison_achats
CREATE TABLE IF NOT EXISTS livraison_achats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date_entree DATETIME NOT NULL,
    bon_commande_id INT NOT NULL,
    refe VARCHAR(100) NOT NULL UNIQUE,
    FOREIGN KEY (bon_commande_id) REFERENCES bon_commandes_achats(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: livraison_achat_lignes
CREATE TABLE IF NOT EXISTS livraison_achat_lignes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    livraison_id INT NOT NULL,
    article_id INT NOT NULL,
    quantite DOUBLE,
    FOREIGN KEY (livraison_id) REFERENCES livraison_achats(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLES DE VENTE
-- =====================================================

-- Table: proforma_ventes
CREATE TABLE IF NOT EXISTS proforma_ventes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    process_id INT NOT NULL,
    date_entree DATETIME NOT NULL,
    client_id INT NOT NULL,
    refe VARCHAR(100) NOT NULL UNIQUE,
    prix_total DOUBLE NOT NULL,
    remise_pourcentage DOUBLE,
    remise_fixe DOUBLE,
    FOREIGN KEY (process_id) REFERENCES vente_processes(id) ON DELETE RESTRICT,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: proforma_vente_lignes
CREATE TABLE IF NOT EXISTS proforma_vente_lignes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proforma_id INT NOT NULL,
    article_id INT NOT NULL,
    quantite DOUBLE NOT NULL,
    prix_unitaire DOUBLE NOT NULL,
    remise_pourcentage DOUBLE,
    remise_fixe DOUBLE,
    FOREIGN KEY (proforma_id) REFERENCES proforma_ventes(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: ventes
CREATE TABLE IF NOT EXISTS ventes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    refe VARCHAR(100) NOT NULL UNIQUE,
    date_entree DATETIME NOT NULL,
    proforma_id INT NOT NULL,
    client_id INT NOT NULL,
    date_effective DATE NOT NULL,
    date_livraison DATE NOT NULL,
    location_livraison VARCHAR(200) NOT NULL,
    prix_total DOUBLE NOT NULL,
    remise_pourcentage DOUBLE,
    remise_fixe DOUBLE,
    process_id INT NOT NULL,
    FOREIGN KEY (proforma_id) REFERENCES proforma_ventes(id) ON DELETE RESTRICT,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
    FOREIGN KEY (process_id) REFERENCES vente_processes(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: vente_lignes
CREATE TABLE IF NOT EXISTS vente_lignes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vente_id INT NOT NULL,
    article_id INT NOT NULL,
    quantite DOUBLE NOT NULL,
    prix_unitaire DOUBLE NOT NULL,
    remise_pourcentage DOUBLE,
    remise_fixe DOUBLE,
    FOREIGN KEY (vente_id) REFERENCES ventes(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: vente_historiques
CREATE TABLE IF NOT EXISTS vente_historiques (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date_entree DATETIME NOT NULL,
    vente_id INT NOT NULL,
    process_id INT NOT NULL,
    FOREIGN KEY (vente_id) REFERENCES ventes(id) ON DELETE CASCADE,
    FOREIGN KEY (process_id) REFERENCES vente_processes(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: livraison_ventes
CREATE TABLE IF NOT EXISTS livraison_ventes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vente_id INT NOT NULL,
    process_id INT NOT NULL,
    date_entree DATETIME NOT NULL,
    refe VARCHAR(100) NOT NULL UNIQUE,
    FOREIGN KEY (vente_id) REFERENCES ventes(id) ON DELETE CASCADE,
    FOREIGN KEY (process_id) REFERENCES livraison_vente_processes(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: livraison_vente_lignes
CREATE TABLE IF NOT EXISTS livraison_vente_lignes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    livraison_id INT NOT NULL,
    article_id INT NOT NULL,
    quantite DOUBLE NOT NULL,
    FOREIGN KEY (livraison_id) REFERENCES livraison_ventes(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: livraison_vente_historiques
CREATE TABLE IF NOT EXISTS livraison_vente_historiques (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date_entree DATETIME NOT NULL,
    livraison_id INT NOT NULL,
    process_id INT NOT NULL,
    FOREIGN KEY (livraison_id) REFERENCES livraison_ventes(id) ON DELETE CASCADE,
    FOREIGN KEY (process_id) REFERENCES livraison_vente_processes(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLES D'INVENTAIRE
-- =====================================================

-- Table: inventaires
CREATE TABLE IF NOT EXISTS inventaires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    date_entree DATETIME NOT NULL,
    depot_id INT NOT NULL,
    details TEXT,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE RESTRICT,
    FOREIGN KEY (depot_id) REFERENCES depots(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: inventaire_lignes
CREATE TABLE IF NOT EXISTS inventaire_lignes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inventaire_id INT NOT NULL,
    article_id INT NOT NULL,
    quantite DOUBLE NOT NULL,
    FOREIGN KEY (inventaire_id) REFERENCES inventaires(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: inventaire_historiques
CREATE TABLE IF NOT EXISTS inventaire_historiques (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date_entree DATETIME NOT NULL,
    inventaire_id INT NOT NULL,
    process_id INT NOT NULL,
    utilisateur_id INT NOT NULL,
    FOREIGN KEY (inventaire_id) REFERENCES inventaires(id) ON DELETE CASCADE,
    FOREIGN KEY (process_id) REFERENCES inventaire_process(id) ON DELETE RESTRICT,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLES DE CAISSE
-- =====================================================

-- Table: caisse_mouvements
CREATE TABLE IF NOT EXISTS caisse_mouvements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    montant DOUBLE NOT NULL,
    type_mouvement_id INT NOT NULL,
    date_entree DATETIME NOT NULL,
    entity_id INT NOT NULL,
    details TEXT,
    FOREIGN KEY (type_mouvement_id) REFERENCES caisse_type_mouvements(id) ON DELETE RESTRICT,
    FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLES D'AUDIT ET HISTORIQUE
-- =====================================================

-- Table: audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT,
    action_id INT,
    classes VARCHAR(100),
    ids_classes TEXT NOT NULL,
    action_timestamp DATETIME,
    old_values TEXT,
    new_values TEXT,
    details TEXT,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
    FOREIGN KEY (action_id) REFERENCES actions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: roles_attribution_historiques
CREATE TABLE IF NOT EXISTS roles_attribution_historiques (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT,
    role_id INT,
    process_id INT,
    date_entree DATETIME NOT NULL,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
    FOREIGN KEY (process_id) REFERENCES roles_attribution_process(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INDEX POUR AMÉLIORER LES PERFORMANCES
-- =====================================================

-- Index sur les clés étrangères fréquemment utilisées
CREATE INDEX idx_articles_categorie ON articles(categorie_id);
CREATE INDEX idx_articles_unite ON articles(unite_id);
CREATE INDEX idx_lots_article ON lots(article_id);
CREATE INDEX idx_lots_depot ON lots(depot_id);
CREATE INDEX idx_achats_demandeur ON achats(demandeur);
CREATE INDEX idx_achats_process ON achats(process_id);
CREATE INDEX idx_ventes_client ON ventes(client_id);
CREATE INDEX idx_ventes_process ON ventes(process_id);
CREATE INDEX idx_utilisateurs_role ON utilisateurs(role_id);
CREATE INDEX idx_utilisateurs_entity ON utilisateurs(entity_id);

-- Index sur les champs de recherche fréquents
CREATE INDEX idx_articles_refe ON articles(refe);
CREATE INDEX idx_achats_refe ON achats(refe);
CREATE INDEX idx_ventes_refe ON ventes(refe);
CREATE INDEX idx_lots_numero ON lots(numero);
CREATE INDEX idx_lots_statut ON lots(statut_lot);

-- Index sur les dates pour les requêtes temporelles
CREATE INDEX idx_achats_date_entree ON achats(date_entree);
CREATE INDEX idx_achats_date_effective ON achats(date_effective);
CREATE INDEX idx_ventes_date_entree ON ventes(date_entree);
CREATE INDEX idx_ventes_date_effective ON ventes(date_effective);
CREATE INDEX idx_lots_date_peremption ON lots(date_peremption);

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================

-- ==========================================================================
-- donnee_prediction_historique.sql
-- Genere 24 mois de donnees historiques de ventes (Jan 2024 a Dec 2025)
-- pour l entrainement du modele ML Random Forest (SMILE).
--
-- PREREQUIS : Executer APRES les scripts suivants :
--   1. create_tables_clean.sql (schema)
--   2. dataVente.sql (processus de vente)
--   3. achat_donnees.sql (articles, categories, depots, clients)
--   4. donnee_vente.sql (clients, proformas/ventes existantes)
--
-- Ce script N EFFACE PAS les donnees existantes.
-- Il ajoute des ventes historiques antidatees pour alimenter le modele IA.
--
-- Resultat attendu :
--   - 120 proformas + 120 ventes (5 par mois x 24 mois)
--   - ~720 lignes de vente (6 articles par vente)
--   - 30 articles couverts, chacun avec 24 points mensuels
--   - Variation saisonniere + croissance annuelle + bruit aleatoire
-- ==========================================================================
SET client_encoding = 'UTF8';

DO $$
DECLARE
    -- Process IDs
    v_process_transf_id INT;
    v_process_livre_id  INT;

    -- Client management
    v_client_ids  INT[];
    v_num_clients INT;
    v_client_id   INT;

    -- Loop variables
    v_year  INT;
    v_month INT;
    v_group INT;
    v_day   INT;

    -- Generated IDs
    v_proforma_id INT;
    v_vente_id    INT;

    -- Calculation variables
    v_total    DOUBLE PRECISION;
    v_qty      DOUBLE PRECISION;
    v_seasonal DOUBLE PRECISION;
    v_growth   DOUBLE PRECISION;
    v_refe     TEXT;
    v_date     TIMESTAMP;

    -- Inner loop record
    rec RECORD;

BEGIN
    -- ========== VALIDATION DES PREREQUIS ==========
    SELECT id INTO v_process_transf_id FROM vente_processes WHERE abreviation = 'TRANSF';
    SELECT id INTO v_process_livre_id  FROM vente_processes WHERE abreviation = 'LIVRE';

    IF v_process_transf_id IS NULL THEN
        RAISE EXCEPTION 'Process TRANSF introuvable. Executez dataVente.sql d abord.';
    END IF;
    IF v_process_livre_id IS NULL THEN
        RAISE EXCEPTION 'Process LIVRE introuvable. Executez dataVente.sql d abord.';
    END IF;

    SELECT array_agg(id ORDER BY id) INTO v_client_ids FROM clients;
    v_num_clients := array_length(v_client_ids, 1);

    IF v_num_clients IS NULL OR v_num_clients = 0 THEN
        RAISE EXCEPTION 'Aucun client trouve. Executez donnee_vente.sql d abord.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM articles WHERE refe = 'ALI-001') THEN
        RAISE EXCEPTION 'Articles introuvables. Executez achat_donnees.sql d abord.';
    END IF;

    RAISE NOTICE 'Prerequis OK : % clients, TRANSF=%, LIVRE=%',
                  v_num_clients, v_process_transf_id, v_process_livre_id;

    -- ========== CONFIGURATION DES ARTICLES PAR GROUPE ==========
    -- 30 articles repartis en 5 groupes de 6
    -- Chaque groupe genere 1 vente par mois -> 5 ventes/mois x 24 mois = 120 ventes
    CREATE TEMP TABLE tmp_hist_config (
        refe       TEXT,
        base_qty   INT,
        base_prix  DOUBLE PRECISION,
        sale_group INT
    ) ON COMMIT DROP;

    -- Groupe 1 : Alimentaire courant + Textile + Papeterie
    INSERT INTO tmp_hist_config VALUES
        ('ALI-001', 25,  95000, 1),   -- Riz
        ('ALI-002', 18,  25000, 1),   -- Huile
        ('ALI-003', 15,  48000, 1),   -- Sucre
        ('TEX-001', 12,  18000, 1),   -- T-shirt
        ('TEX-005', 10,  10000, 1),   -- Chaussettes
        ('PAP-001', 14,  25000, 1);   -- Cahiers

    -- Groupe 2 : Alimentaire premium + Textile + Electronique
    INSERT INTO tmp_hist_config VALUES
        ('ALI-004', 10, 105000, 2),   -- Lait en poudre
        ('ALI-005', 20,  20000, 2),   -- Sel
        ('ALI-006', 30,   4000, 2),   -- Epices
        ('TEX-002',  8,  52000, 2),   -- Jean
        ('ELE-001', 15,  12000, 2),   -- Cables
        ('ELE-004', 10,  18000, 2);   -- Accessoires elec.

    -- Groupe 3 : Alimentaire divers + Textile + Cosmetique
    INSERT INTO tmp_hist_config VALUES
        ('ALI-007', 35,   3200, 3),   -- Eau minerale
        ('ALI-008',  6,  35000, 3),   -- Conserves
        ('TEX-003',  8,  40000, 3),   -- Robe
        ('TEX-004',  5,  62000, 3),   -- Veste
        ('COS-001', 12,  15000, 3),   -- Savon
        ('COS-002', 15,  18000, 3);   -- Creme

    -- Groupe 4 : Textile premium + Electronique + Papeterie + Accessoires
    INSERT INTO tmp_hist_config VALUES
        ('TEX-006',  3, 145000, 4),   -- Manteau
        ('ELE-002',  8,  28000, 4),   -- Chargeur
        ('ELE-003',  5,  45000, 4),   -- Ecouteurs
        ('ELE-005',  4,  35000, 4),   -- Batterie externe
        ('PAP-002',  7,  45000, 4),   -- Classeurs
        ('ACC-001',  4,  65000, 4);   -- Sac

    -- Groupe 5 : Cosmetique + Papeterie + Chimique
    INSERT INTO tmp_hist_config VALUES
        ('COS-003',  6,  35000, 5),   -- Parfum
        ('COS-004', 14,   8000, 5),   -- Deodorant
        ('COS-005', 10,  12000, 5),   -- Shampoing
        ('PAP-003', 18,   8000, 5),   -- Stylos
        ('CHI-001',  5,  22000, 5),   -- Detergent
        ('CHI-002',  4,  28000, 5);   -- Desinfectant

    RAISE NOTICE 'Configuration chargee : 30 articles en 5 groupes';

    -- ========== GENERATION DES VENTES HISTORIQUES ==========
    FOR v_year IN 2024..2025 LOOP
        FOR v_month IN 1..12 LOOP

            -- Coefficient saisonnier (Madagascar)
            v_seasonal := CASE v_month
                WHEN  1 THEN 1.30   -- Nouvel an / rentree
                WHEN  2 THEN 1.00
                WHEN  3 THEN 1.10
                WHEN  4 THEN 0.85   -- Periode creuse
                WHEN  5 THEN 0.80   -- Periode creuse
                WHEN  6 THEN 1.15   -- Mi-annee
                WHEN  7 THEN 1.20   -- Vacances
                WHEN  8 THEN 1.00
                WHEN  9 THEN 1.05   -- Rentree scolaire
                WHEN 10 THEN 1.10
                WHEN 11 THEN 1.25   -- Pre-fetes
                WHEN 12 THEN 1.45   -- Fetes fin d annee
            END;

            -- Croissance : +10% annuel + ~1% mensuel progressif
            v_growth := 1.0 + (v_year - 2024) * 0.10 + (v_month - 1) * 0.008;

            -- === 5 ventes par mois (1 par groupe d'articles) ===
            FOR v_group IN 1..5 LOOP

                -- Date repartie dans le mois (jour 7, 12, 17, 22, 27 +/- bruit)
                v_day  := LEAST(2 + v_group * 5 + floor(random() * 3)::INT, 28);
                v_date := make_timestamp(v_year, v_month, v_day,
                                         8 + v_group, floor(random() * 60)::INT, 0);

                -- Reference unique
                v_refe := v_year || LPAD(v_month::TEXT, 2, '0') || LPAD(v_group::TEXT, 2, '0');

                -- Client en rotation deterministe
                v_client_id := v_client_ids[1 + ((v_group + v_month + v_year) % v_num_clients)];

                -- ===== PROFORMA =====
                INSERT INTO proforma_ventes (refe, date_entree, client_id, process_id, prix_total)
                VALUES ('PFH-' || v_refe, v_date, v_client_id, v_process_transf_id, 0)
                RETURNING id INTO v_proforma_id;

                -- ===== VENTE (process = LIVRE, valeur 90) =====
                INSERT INTO ventes (refe, date_entree, proforma_id, client_id,
                                    date_effective, date_livraison, location_livraison,
                                    prix_total, process_id)
                VALUES ('VH-' || v_refe, v_date, v_proforma_id, v_client_id,
                        v_date::date, (v_date + interval '5 days')::date, 'Antananarivo',
                        0, v_process_livre_id)
                RETURNING id INTO v_vente_id;

                v_total := 0;

                -- ===== LIGNES (6 articles par groupe) =====
                FOR rec IN
                    SELECT refe AS art_refe, base_qty, base_prix
                    FROM tmp_hist_config
                    WHERE sale_group = v_group
                LOOP
                    -- Quantite = base x saisonnalite x croissance x bruit [0.75..1.25]
                    v_qty := GREATEST(1, round(
                        rec.base_qty * v_seasonal * v_growth * (0.75 + random() * 0.50)
                    ));

                    -- Ligne proforma
                    INSERT INTO proforma_vente_lignes
                        (proforma_id, article_id, quantite, prix_unitaire)
                    VALUES (
                        v_proforma_id,
                        (SELECT id FROM articles WHERE refe = rec.art_refe),
                        v_qty,
                        rec.base_prix
                    );

                    -- Ligne vente
                    INSERT INTO vente_lignes
                        (vente_id, article_id, quantite, prix_unitaire)
                    VALUES (
                        v_vente_id,
                        (SELECT id FROM articles WHERE refe = rec.art_refe),
                        v_qty,
                        rec.base_prix
                    );

                    v_total := v_total + v_qty * rec.base_prix;
                END LOOP;

                -- Mettre a jour les totaux
                UPDATE proforma_ventes SET prix_total = v_total WHERE id = v_proforma_id;
                UPDATE ventes SET prix_total = v_total WHERE id = v_vente_id;

            END LOOP; -- groupes
        END LOOP; -- mois
    END LOOP; -- annees

    RAISE NOTICE '========================================';
    RAISE NOTICE 'GENERATION TERMINEE AVEC SUCCES';
    RAISE NOTICE '120 ventes historiques (Jan 2024 -> Dec 2025)';
    RAISE NOTICE '~720 lignes de vente, 30 articles couverts';
    RAISE NOTICE '========================================';

END $$;

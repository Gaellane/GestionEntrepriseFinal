-- ==========================================================================
-- donnee_prediction_historique.sql
-- Genere 72 mois de donnees historiques de ventes realistes (Jan 2020 a Dec 2025)
-- pour l entrainement du modele ML Random Forest (SMILE).
--
-- PREREQUIS : Executer APRES les scripts suivants :
--   1. create_tables_clean.sql (schema)
--   2. dataVente.sql (processus de vente)
--   3. achat_donnees.sql (articles, categories, depots, clients)
--   4. donnee_vente.sql (clients, proformas/ventes existantes)
--
-- Ce script EFFACE d abord les donnees historiques precedentes (VH-/PFH-)
-- puis regenere les ventes historiques pour alimenter le modele IA.
--
-- Resultat attendu :
--   - ~2100+ ventes (3-5 vagues x 10 groupes/mois x 72 mois, avec skip aleatoire)
--   - ~5600+ lignes de vente (3 articles par vente, avec ruptures simulees)
--   - 30 articles couverts sur 7 categories differentes
--   - Saisonnalite mensuelle + tendance annuelle + bruit individuel
--   - Tendances par categorie differentes (alimentaire vs textile vs elec)
--   - Evenements speciaux : Black Friday, rentree, fetes, canicule, elections
--   - Promotions, pics, creux, ruptures simulees
-- ==========================================================================
SET client_encoding = 'UTF8';

-- ========== NETTOYAGE ==========
DELETE FROM vente_lignes WHERE vente_id IN (SELECT id FROM ventes WHERE refe LIKE 'VH-%');
DELETE FROM proforma_vente_lignes WHERE proforma_id IN (SELECT id FROM proforma_ventes WHERE refe LIKE 'PFH-%');
DELETE FROM ventes WHERE refe LIKE 'VH-%';
DELETE FROM proforma_ventes WHERE refe LIKE 'PFH-%';

DO $$
DECLARE
    v_process_transf_id INT;
    v_process_livre_id  INT;
    v_client_ids  INT[];
    v_num_clients INT;
    v_client_id   INT;

    v_year     INT;
    v_month    INT;
    v_group    INT;
    v_wave     INT;
    v_day      INT;

    v_proforma_id INT;
    v_vente_id    INT;

    v_total        DOUBLE PRECISION;
    v_qty          DOUBLE PRECISION;
    v_seasonal     DOUBLE PRECISION;
    v_trend        DOUBLE PRECISION;
    v_year_factor  DOUBLE PRECISION;
    v_category_factor DOUBLE PRECISION;
    v_noise        DOUBLE PRECISION;
    v_promo_mult   DOUBLE PRECISION;
    v_event_mult   DOUBLE PRECISION;
    v_price_var    DOUBLE PRECISION;
    v_refe         TEXT;
    v_date         TIMESTAMP;
    v_location     TEXT;
    v_cat_code     TEXT;

    v_locations    TEXT[];
    rec RECORD;

    v_total_ventes INT := 0;
    v_total_lignes INT := 0;
    v_num_waves    INT;

BEGIN
    -- ========== VALIDATION ==========
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

    -- Lieux de livraison (18 localites)
    v_locations := ARRAY[
        'Antananarivo Centre', 'Antananarivo Ouest', 'Antananarivo Est',
        'Antsirabe', 'Toamasina Port', 'Toamasina Ville',
        'Fianarantsoa', 'Mahajanga', 'Toliara',
        'Antsiranana', 'Ambositra', 'Mananjary',
        'Nosy Be', 'Morondava', 'Fort Dauphin',
        'Ambanja', 'Antsirabe Sud', 'Manakara'
    ];

    -- ========== ARTICLES ET CATEGORIES ==========
    -- 30 articles en 10 groupes de 3, avec code categorie pour tendances differentes
    CREATE TEMP TABLE tmp_hist_config (
        refe       TEXT,
        base_qty   INT,
        base_prix  DOUBLE PRECISION,
        sale_group INT,
        cat_code   TEXT
    ) ON COMMIT DROP;

    -- Groupe 1 : Alimentaire de base (produits phares)
    INSERT INTO tmp_hist_config VALUES
        ('ALI-001', 28,  95000, 1, 'ALI'),
        ('ALI-002', 20,  25000, 1, 'ALI'),
        ('ALI-003', 16,  48000, 1, 'ALI');

    -- Groupe 2 : Alimentaire premium
    INSERT INTO tmp_hist_config VALUES
        ('ALI-004', 11, 105000, 2, 'ALI'),
        ('ALI-005', 22,  20000, 2, 'ALI'),
        ('ALI-006', 32,   4000, 2, 'ALI');

    -- Groupe 3 : Alimentaire divers + debut textile
    INSERT INTO tmp_hist_config VALUES
        ('ALI-007', 38,   3200, 3, 'ALI'),
        ('ALI-008',  7,  35000, 3, 'ALI'),
        ('TEX-001', 14,  18000, 3, 'TEX');

    -- Groupe 4 : Textile courant
    INSERT INTO tmp_hist_config VALUES
        ('TEX-002',  9,  52000, 4, 'TEX'),
        ('TEX-003',  8,  40000, 4, 'TEX'),
        ('TEX-005', 12,  10000, 4, 'TEX');

    -- Groupe 5 : Textile premium + accessoires
    INSERT INTO tmp_hist_config VALUES
        ('TEX-004',  5,  62000, 5, 'TEX'),
        ('TEX-006',  3, 145000, 5, 'TEX'),
        ('ACC-001',  5,  65000, 5, 'ACC');

    -- Groupe 6 : Electronique courant
    INSERT INTO tmp_hist_config VALUES
        ('ELE-001', 16,  12000, 6, 'ELE'),
        ('ELE-002',  9,  28000, 6, 'ELE'),
        ('ELE-004', 11,  18000, 6, 'ELE');

    -- Groupe 7 : Electronique premium + papeterie
    INSERT INTO tmp_hist_config VALUES
        ('ELE-003',  6,  45000, 7, 'ELE'),
        ('ELE-005',  4,  35000, 7, 'ELE'),
        ('PAP-001', 16,  25000, 7, 'PAP');

    -- Groupe 8 : Papeterie / Bureau + cosmetique
    INSERT INTO tmp_hist_config VALUES
        ('PAP-002',  8,  45000, 8, 'PAP'),
        ('PAP-003', 20,   8000, 8, 'PAP'),
        ('COS-001', 13,  15000, 8, 'COS');

    -- Groupe 9 : Cosmetique
    INSERT INTO tmp_hist_config VALUES
        ('COS-002', 16,  18000, 9, 'COS'),
        ('COS-003',  7,  35000, 9, 'COS'),
        ('COS-004', 15,   8000, 9, 'COS');

    -- Groupe 10 : Cosmetique + Chimique
    INSERT INTO tmp_hist_config VALUES
        ('COS-005', 11,  12000, 10, 'COS'),
        ('CHI-001',  6,  22000, 10, 'CHI'),
        ('CHI-002',  5,  28000, 10, 'CHI');

    RAISE NOTICE 'Configuration : 30 articles, 10 groupes, 7 categories';

    -- ========== GENERATION (2020 -> 2025) ==========
    FOR v_year IN 2020..2025 LOOP
        FOR v_month IN 1..12 LOOP

            -- ==========================================================
            -- SAISONNALITE MENSUELLE (base commune, avec du bruit)
            -- ==========================================================
            v_seasonal := CASE v_month
                WHEN  1 THEN 1.25 + random() * 0.10
                WHEN  2 THEN 0.88 + random() * 0.12
                WHEN  3 THEN 1.02 + random() * 0.08
                WHEN  4 THEN 0.78 + random() * 0.10
                WHEN  5 THEN 0.72 + random() * 0.08
                WHEN  6 THEN 1.08 + random() * 0.10
                WHEN  7 THEN 1.18 + random() * 0.12
                WHEN  8 THEN 0.90 + random() * 0.15
                WHEN  9 THEN 1.12 + random() * 0.08
                WHEN 10 THEN 1.08 + random() * 0.10
                WHEN 11 THEN 1.22 + random() * 0.12
                WHEN 12 THEN 1.45 + random() * 0.15
            END;

            -- ==========================================================
            -- FACTEUR ANNUEL MACRO-ECONOMIQUE (realiste Madagascar)
            -- ==========================================================
            v_year_factor := CASE v_year
                WHEN 2020 THEN CASE
                    WHEN v_month = 1  THEN 0.92
                    WHEN v_month = 2  THEN 0.88
                    WHEN v_month = 3  THEN 0.60
                    WHEN v_month = 4  THEN 0.42
                    WHEN v_month = 5  THEN 0.48
                    WHEN v_month = 6  THEN 0.55
                    WHEN v_month = 7  THEN 0.63
                    WHEN v_month = 8  THEN 0.68
                    WHEN v_month = 9  THEN 0.72
                    WHEN v_month = 10 THEN 0.75
                    WHEN v_month = 11 THEN 0.78
                    WHEN v_month = 12 THEN 0.82
                END
                WHEN 2021 THEN CASE
                    WHEN v_month = 1  THEN 0.76
                    WHEN v_month = 2  THEN 0.72
                    WHEN v_month = 3  THEN 0.78
                    WHEN v_month = 4  THEN 0.82
                    WHEN v_month = 5  THEN 0.80
                    WHEN v_month = 6  THEN 0.85
                    WHEN v_month = 7  THEN 0.88
                    WHEN v_month = 8  THEN 0.92
                    WHEN v_month = 9  THEN 0.95
                    WHEN v_month = 10 THEN 0.98
                    WHEN v_month = 11 THEN 1.00
                    WHEN v_month = 12 THEN 1.02
                END
                WHEN 2022 THEN CASE
                    WHEN v_month <= 2  THEN 0.98
                    WHEN v_month <= 4  THEN 1.02
                    WHEN v_month <= 6  THEN 1.05
                    WHEN v_month <= 8  THEN 1.08
                    WHEN v_month <= 10 THEN 1.12
                    ELSE                    1.15
                END
                WHEN 2023 THEN CASE
                    WHEN v_month <= 3  THEN 1.15
                    WHEN v_month <= 6  THEN 1.22
                    WHEN v_month <= 9  THEN 1.28
                    ELSE                    1.32
                END
                WHEN 2024 THEN CASE
                    WHEN v_month <= 2  THEN 1.30
                    WHEN v_month <= 4  THEN 1.35
                    WHEN v_month = 5   THEN 1.28
                    WHEN v_month = 6   THEN 1.32
                    WHEN v_month <= 9  THEN 1.40
                    WHEN v_month = 10  THEN 1.42
                    WHEN v_month = 11  THEN 1.48
                    ELSE                    1.52
                END
                WHEN 2025 THEN CASE
                    WHEN v_month <= 3  THEN 1.48
                    WHEN v_month <= 6  THEN 1.50
                    WHEN v_month <= 9  THEN 1.55
                    ELSE                    1.58
                END
            END;

            -- Bruit macro mensuel : +/- 5%
            v_year_factor := v_year_factor * (0.95 + random() * 0.10);

            v_trend := v_seasonal * v_year_factor;

            -- ==========================================================
            -- NOMBRE DE VAGUES PAR MOIS (variable : 2 a 5)
            -- Plus de vagues en haute saison
            -- ==========================================================
            IF v_month IN (11, 12, 1, 7) THEN
                v_num_waves := 4 + floor(random() * 2)::INT;
            ELSIF v_month IN (4, 5) THEN
                v_num_waves := 2 + floor(random() * 2)::INT;
            ELSE
                v_num_waves := 3 + floor(random() * 2)::INT;
            END IF;

            -- ==========================================================
            -- BOUCLE VAGUES x GROUPES
            -- ==========================================================
            FOR v_wave IN 1..v_num_waves LOOP
                FOR v_group IN 1..10 LOOP

                    -- Skip aleatoire : 25% de chance de sauter un groupe dans une vague
                    IF random() < 0.25 THEN
                        CONTINUE;
                    END IF;

                    -- === DATE ===
                    v_day := LEAST(
                        1 + ((v_wave - 1) * (28 / v_num_waves))
                          + floor(random() * (28 / v_num_waves))::INT,
                        28
                    );

                    v_date := make_timestamp(v_year, v_month, v_day,
                                             6 + floor(random() * 12)::INT,
                                             floor(random() * 60)::INT,
                                             floor(random() * 60)::INT);

                    v_refe := v_year || LPAD(v_month::TEXT, 2, '0')
                              || v_wave || LPAD(v_group::TEXT, 2, '0');

                    -- Client en rotation complexe
                    v_client_id := v_client_ids[
                        1 + ((v_group * 7 + v_wave * 13 + v_month * 17 + v_year * 23
                              + floor(random() * v_num_clients)::INT) % v_num_clients)
                    ];

                    -- Lieu de livraison
                    v_location := v_locations[
                        1 + ((v_group + v_wave * 3 + v_month * 5 + v_year * 2
                              + floor(random() * 5)::INT) % array_length(v_locations, 1))
                    ];

                    -- === EVENEMENTS SPECIAUX ===
                    v_event_mult := 1.0;

                    -- Black Friday (novembre, derniere semaine, a partir de 2022)
                    IF v_month = 11 AND v_day >= 20 AND v_year >= 2022 THEN
                        v_event_mult := 1.60 + random() * 0.40;
                    END IF;

                    -- Rentree scolaire (septembre, premiere quinzaine)
                    IF v_month = 9 AND v_day <= 15 THEN
                        v_event_mult := v_event_mult * 1.15;
                    END IF;

                    -- Fete des meres (fin mai)
                    IF v_month = 5 AND v_day >= 20 THEN
                        v_event_mult := v_event_mult * 1.10;
                    END IF;

                    -- Saint Valentin (mi-fevrier)
                    IF v_month = 2 AND v_day >= 10 AND v_day <= 16 THEN
                        v_event_mult := v_event_mult * 1.12;
                    END IF;

                    -- Saison chaude (impact eau/boissons)
                    IF v_month IN (10, 11, 12) AND v_year >= 2023 THEN
                        v_event_mult := v_event_mult * 1.05;
                    END IF;

                    -- === PROMOTION PONCTUELLE (12%) ===
                    IF random() < 0.12 THEN
                        v_promo_mult := 1.35 + random() * 0.35;
                    ELSE
                        v_promo_mult := 1.0;
                    END IF;

                    -- === CREUX ALEATOIRE (7%) ===
                    IF random() < 0.07 THEN
                        v_promo_mult := v_promo_mult * (0.25 + random() * 0.25);
                    END IF;

                    -- === PIC EXCEPTIONNEL (3% grosse commande) ===
                    IF random() < 0.03 THEN
                        v_promo_mult := v_promo_mult * (2.0 + random() * 1.5);
                    END IF;

                    -- ===== PROFORMA =====
                    INSERT INTO proforma_ventes (refe, date_entree, client_id, process_id, prix_total)
                    VALUES ('PFH-' || v_refe, v_date, v_client_id, v_process_transf_id, 0)
                    RETURNING id INTO v_proforma_id;

                    -- ===== VENTE =====
                    INSERT INTO ventes (refe, date_entree, proforma_id, client_id,
                                        date_effective, date_livraison, location_livraison,
                                        prix_total, process_id)
                    VALUES ('VH-' || v_refe, v_date, v_proforma_id, v_client_id,
                            v_date::date,
                            (v_date + (interval '1 day' * (2 + floor(random() * 10)::INT)))::date,
                            v_location,
                            0, v_process_livre_id)
                    RETURNING id INTO v_vente_id;

                    v_total := 0;
                    v_total_ventes := v_total_ventes + 1;

                    -- ===== LIGNES (3 articles par groupe) =====
                    FOR rec IN
                        SELECT refe AS art_refe, base_qty, base_prix, cat_code
                        FROM tmp_hist_config
                        WHERE sale_group = v_group
                    LOOP
                        -- Rupture simulee : 10% de chance qu un article manque
                        IF random() < 0.10 THEN
                            CONTINUE;
                        END IF;

                        v_cat_code := rec.cat_code;

                        -- =============================================
                        -- TENDANCE PAR CATEGORIE
                        -- =============================================
                        v_category_factor := CASE v_cat_code
                            WHEN 'ALI' THEN CASE
                                WHEN v_month = 12 THEN 1.20
                                WHEN v_month IN (3,4) AND v_year = 2020 THEN 1.30
                                WHEN v_month = 1 THEN 1.10
                                WHEN v_month IN (8,9) THEN 1.05
                                ELSE 1.0
                            END
                            WHEN 'TEX' THEN CASE
                                WHEN v_month IN (6,7) THEN 1.30
                                WHEN v_month = 12 THEN 1.25
                                WHEN v_month = 11 THEN 1.20
                                WHEN v_month = 2 THEN 1.10
                                WHEN v_month IN (1,3) THEN 0.85
                                ELSE 1.0
                            END
                            WHEN 'ELE' THEN CASE
                                WHEN v_month = 11 AND v_year >= 2022 THEN 1.50
                                WHEN v_month = 12 THEN 1.40
                                WHEN v_month = 9 THEN 1.15
                                WHEN v_month IN (1,2) THEN 1.10
                                WHEN v_month IN (4,5) THEN 0.80
                                ELSE 1.0
                            END
                            WHEN 'COS' THEN CASE
                                WHEN v_month = 2 THEN 1.35
                                WHEN v_month = 5 THEN 1.25
                                WHEN v_month = 12 THEN 1.30
                                WHEN v_month = 6 THEN 1.15
                                WHEN v_month IN (8,9) THEN 0.90
                                ELSE 1.0
                            END
                            WHEN 'PAP' THEN CASE
                                WHEN v_month = 9 THEN 2.20
                                WHEN v_month = 10 THEN 1.40
                                WHEN v_month = 1 THEN 1.30
                                WHEN v_month IN (7,8) THEN 0.60
                                WHEN v_month IN (4,5) THEN 0.70
                                ELSE 0.90
                            END
                            WHEN 'CHI' THEN CASE
                                WHEN v_month IN (1,2,3) THEN 1.30
                                WHEN v_month = 12 THEN 1.20
                                WHEN v_month IN (6,7,8) THEN 0.85
                                ELSE 1.0
                            END
                            WHEN 'ACC' THEN CASE
                                WHEN v_month = 12 THEN 1.40
                                WHEN v_month = 2 THEN 1.20
                                WHEN v_month = 5 THEN 1.15
                                WHEN v_month IN (4,8) THEN 0.80
                                ELSE 1.0
                            END
                            ELSE 1.0
                        END;

                        -- Croissance annuelle specifique par categorie
                        v_category_factor := v_category_factor * CASE v_cat_code
                            WHEN 'ALI' THEN 1.0 + (v_year - 2020) * 0.02
                            WHEN 'TEX' THEN 1.0 + (v_year - 2020) * 0.04
                            WHEN 'ELE' THEN 1.0 + (v_year - 2020) * 0.08
                            WHEN 'COS' THEN 1.0 + (v_year - 2020) * 0.06
                            WHEN 'PAP' THEN 1.0 + (v_year - 2020) * 0.01
                            WHEN 'CHI' THEN 1.0 + (v_year - 2020) * 0.03
                            WHEN 'ACC' THEN 1.0 + (v_year - 2020) * 0.05
                            ELSE 1.0
                        END;

                        -- Bruit individuel par article : +/- 40%
                        v_noise := 0.60 + random() * 0.80;

                        -- Quantite finale
                        v_qty := GREATEST(1, round(
                            rec.base_qty
                            * v_trend
                            * v_category_factor
                            * v_event_mult
                            * v_promo_mult
                            * v_noise
                            * CASE
                                WHEN v_wave >= 4 THEN 0.65 + random() * 0.15
                                WHEN v_wave = 3 THEN 0.80 + random() * 0.10
                                WHEN v_wave = 2 THEN 0.85 + random() * 0.10
                                ELSE 1.0
                              END
                        ));

                        -- Prix avec inflation + bruit + tendance categorie
                        v_price_var := rec.base_prix
                            * (1.0 + (v_year - 2020) * 0.035)
                            * (0.93 + random() * 0.14)
                            * CASE
                                WHEN v_cat_code = 'ALI' THEN 1.0 + (v_year - 2020) * 0.02
                                WHEN v_cat_code = 'ELE' THEN 1.0 - (v_year - 2020) * 0.01
                                ELSE 1.0
                              END;

                        -- Ligne proforma
                        INSERT INTO proforma_vente_lignes
                            (proforma_id, article_id, quantite, prix_unitaire)
                        VALUES (
                            v_proforma_id,
                            (SELECT id FROM articles WHERE refe = rec.art_refe),
                            v_qty,
                            round(v_price_var)
                        );

                        -- Ligne vente
                        INSERT INTO vente_lignes
                            (vente_id, article_id, quantite, prix_unitaire)
                        VALUES (
                            v_vente_id,
                            (SELECT id FROM articles WHERE refe = rec.art_refe),
                            v_qty,
                            round(v_price_var)
                        );

                        v_total := v_total + v_qty * round(v_price_var);
                        v_total_lignes := v_total_lignes + 1;
                    END LOOP;

                    -- MAJ totaux
                    UPDATE proforma_ventes SET prix_total = v_total WHERE id = v_proforma_id;
                    UPDATE ventes SET prix_total = v_total WHERE id = v_vente_id;

                END LOOP;
            END LOOP;
        END LOOP;

        RAISE NOTICE 'Annee % terminee (% ventes, % lignes)', v_year, v_total_ventes, v_total_lignes;
    END LOOP;

    RAISE NOTICE '==========================================';
    RAISE NOTICE 'GENERATION TERMINEE';
    RAISE NOTICE '% ventes historiques (Jan 2020 -> Dec 2025)', v_total_ventes;
    RAISE NOTICE '% lignes de vente, 30 articles sur 7 categories', v_total_lignes;
    RAISE NOTICE 'Tendances par categorie, evenements speciaux,';
    RAISE NOTICE 'promotions, pics, creux, ruptures simulees.';
    RAISE NOTICE '==========================================';

END $$;

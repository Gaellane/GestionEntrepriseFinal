-- =====================================================
-- 9. KPI & REPORTING - Données de test
-- =====================================================

-- Vérifier les process de vente existants
SELECT * FROM vente_processes ORDER BY valeur;

-- Si les process n'existent pas, les créer
INSERT INTO vente_processes (process_name, abreviation, valeur) VALUES
('Brouillon', 'BRO', 10),
('Confirmée', 'CNF', 60),
('En préparation', 'PRE', 70),
('Prête', 'PRT', 80),
('Livrée', 'LIV', 90),
('Annulée', 'ANN', 99)
ON CONFLICT DO NOTHING;

-- Vérifier les types de mouvement caisse existants
SELECT * FROM caisse_type_mouvements;

-- Si les types n'existent pas, les créer
INSERT INTO caisse_type_mouvements (type_name, valeur) VALUES
('Encaissement vente', 1),
('Encaissement autre', 2),
('Remboursement client', -1),
('Sortie de caisse', -2)
ON CONFLICT DO NOTHING;

-- Vérifier les actions existantes
SELECT * FROM actions;

-- Si les actions n'existent pas, créer l'action annulation
INSERT INTO actions (action_name, description) VALUES
('Annulation Vente', 'Annulation d''une commande de vente')
ON CONFLICT DO NOTHING;

-- =====================================================
-- Exemples de requêtes KPI (pour vérification)
-- =====================================================

-- 9.1 KPI Commercial

-- Commandes en cours (Confirmée=60, En préparation=70)
SELECT COUNT(*) as commandes_en_cours 
FROM ventes v 
JOIN vente_processes vp ON v.process_id = vp.id 
WHERE vp.valeur IN (60, 70)
AND v.date_entree >= NOW() - INTERVAL '1 month';

-- Commandes livrées
SELECT COUNT(*) as commandes_livrees 
FROM ventes v 
JOIN vente_processes vp ON v.process_id = vp.id 
WHERE vp.valeur = 90
AND v.date_entree >= NOW() - INTERVAL '1 month';

-- Commandes en retard
SELECT COUNT(*) as commandes_en_retard 
FROM ventes v 
JOIN vente_processes vp ON v.process_id = vp.id 
WHERE v.date_livraison < CURRENT_DATE
AND vp.valeur >= 60 AND vp.valeur < 90;

-- Taux d'annulation
SELECT 
    COUNT(CASE WHEN vp.valeur = 99 THEN 1 END) as annulees,
    COUNT(*) as total,
    ROUND(COUNT(CASE WHEN vp.valeur = 99 THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as taux_annulation
FROM ventes v 
JOIN vente_processes vp ON v.process_id = vp.id 
WHERE v.date_entree >= NOW() - INTERVAL '1 month';

-- Total remises
SELECT 
    COALESCE(SUM(remise_fixe), 0) as total_remises_fixe,
    COALESCE(SUM(prix_total * remise_pourcentage / 100), 0) as total_remises_pct
FROM ventes 
WHERE date_entree >= NOW() - INTERVAL '1 month';

-- 9.2 KPI Finance

-- CA réalisé (ventes livrées)
SELECT COALESCE(SUM(v.prix_total), 0) as ca_realise
FROM ventes v 
JOIN vente_processes vp ON v.process_id = vp.id 
WHERE vp.valeur = 90
AND v.date_entree >= NOW() - INTERVAL '1 month';

-- CA encaissé
SELECT COALESCE(SUM(cm.montant), 0) as ca_encaisse
FROM caisse_mouvements cm
JOIN caisse_type_mouvements ctm ON cm.type_mouvement_id = ctm.id
WHERE ctm.valeur > 0
AND cm.date_entree >= NOW() - INTERVAL '1 month';

-- Volume remboursements
SELECT COALESCE(SUM(ABS(cm.montant)), 0) as remboursements
FROM caisse_mouvements cm
JOIN caisse_type_mouvements ctm ON cm.type_mouvement_id = ctm.id
WHERE ctm.valeur < 0
AND cm.date_entree >= NOW() - INTERVAL '1 month';

-- 9.3 KPI Direction

-- CA global
SELECT COALESCE(SUM(v.prix_total), 0) as ca_global
FROM ventes v 
JOIN vente_processes vp ON v.process_id = vp.id 
WHERE vp.valeur >= 60 AND vp.valeur < 99
AND v.date_entree >= NOW() - INTERVAL '1 month';

-- Top 10 clients
SELECT 
    c.id,
    c.client_nom,
    SUM(v.prix_total) as total_achats,
    COUNT(v.id) as nb_commandes
FROM ventes v 
JOIN vente_processes vp ON v.process_id = vp.id 
JOIN proformas_vente pv ON v.proforma_id = pv.id
JOIN clients c ON pv.client_id = c.id
WHERE vp.valeur >= 60 AND vp.valeur < 99
AND v.date_entree >= NOW() - INTERVAL '1 month'
GROUP BY c.id, c.client_nom
ORDER BY total_achats DESC
LIMIT 10;

-- Top 10 articles vendus
SELECT 
    a.id,
    a.refe,
    a.article_nom,
    SUM(vl.quantite) as quantite_totale,
    SUM(vl.quantite * vl.prix_unitaire) as ca_total
FROM vente_lignes vl
JOIN articles a ON vl.article_id = a.id
JOIN ventes v ON vl.vente_id = v.id
JOIN vente_processes vp ON v.process_id = vp.id
WHERE vp.valeur >= 60 AND vp.valeur < 99
AND v.date_entree >= NOW() - INTERVAL '1 month'
GROUP BY a.id, a.refe, a.article_nom
ORDER BY quantite_totale DESC
LIMIT 10;

-- 9.4 Dashboard - Pipeline par statut
SELECT 
    vp.process_name,
    COUNT(v.id) as nombre
FROM ventes v 
JOIN vente_processes vp ON v.process_id = vp.id 
WHERE v.date_entree >= NOW() - INTERVAL '1 month'
GROUP BY vp.process_name, vp.valeur
ORDER BY vp.valeur;

-- CA par mois (12 derniers mois)
SELECT 
    TO_CHAR(v.date_entree, 'YYYY-MM') as mois,
    COALESCE(SUM(v.prix_total), 0) as ca
FROM ventes v 
JOIN vente_processes vp ON v.process_id = vp.id 
WHERE vp.valeur >= 60 AND vp.valeur < 99
AND v.date_entree >= NOW() - INTERVAL '12 months'
GROUP BY TO_CHAR(v.date_entree, 'YYYY-MM')
ORDER BY mois;

-- Ventes en retard (alertes)
SELECT 
    v.id,
    v.refe,
    v.date_livraison,
    vp.process_name
FROM ventes v 
JOIN vente_processes vp ON v.process_id = vp.id 
WHERE v.date_livraison < CURRENT_DATE
AND vp.valeur >= 60 AND vp.valeur < 90;

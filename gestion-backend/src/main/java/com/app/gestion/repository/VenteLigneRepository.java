package com.app.gestion.repository;

import com.app.gestion.model.VenteLigne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VenteLigneRepository extends JpaRepository<VenteLigne, Integer> {

    /**
     * Récupère les ventes mensuelles agrégées par article.
     * Retourne [articleId, annee, mois, totalQuantiteVendue]
     * Filtre sur les ventes confirmées (process >= 60 et < 99).
     */
    @Query(value = "SELECT vl.article_id, " +
            "EXTRACT(YEAR FROM v.date_entree)::int AS annee, " +
            "EXTRACT(MONTH FROM v.date_entree)::int AS mois, " +
            "COALESCE(SUM(vl.quantite), 0) AS total_quantite " +
            "FROM vente_lignes vl " +
            "JOIN ventes v ON vl.vente_id = v.id " +
            "JOIN vente_processes vp ON v.process_id = vp.id " +
            "WHERE vp.valeur >= 60 AND vp.valeur < 99 " +
            "GROUP BY vl.article_id, EXTRACT(YEAR FROM v.date_entree), EXTRACT(MONTH FROM v.date_entree) " +
            "ORDER BY vl.article_id, annee, mois",
            nativeQuery = true)
    List<Object[]> findVentesMensuellesParArticle();

    /**
     * Récupère les ventes mensuelles pour un article spécifique.
     * Retourne [annee, mois, totalQuantiteVendue]
     */
    @Query(value = "SELECT " +
            "EXTRACT(YEAR FROM v.date_entree)::int AS annee, " +
            "EXTRACT(MONTH FROM v.date_entree)::int AS mois, " +
            "COALESCE(SUM(vl.quantite), 0) AS total_quantite " +
            "FROM vente_lignes vl " +
            "JOIN ventes v ON vl.vente_id = v.id " +
            "JOIN vente_processes vp ON v.process_id = vp.id " +
            "WHERE vp.valeur >= 60 AND vp.valeur < 99 " +
            "AND vl.article_id = :articleId " +
            "GROUP BY EXTRACT(YEAR FROM v.date_entree), EXTRACT(MONTH FROM v.date_entree) " +
            "ORDER BY annee, mois",
            nativeQuery = true)
    List<Object[]> findVentesMensuellesPourArticle(@Param("articleId") Integer articleId);

    /**
     * Récupère la liste de tous les articles ayant eu au moins une vente.
     */
    @Query("SELECT DISTINCT vl.article.id FROM VenteLigne vl " +
            "WHERE vl.vente.process.valeur >= 60 AND vl.vente.process.valeur < 99")
    List<Integer> findArticlesAvecVentes();

    /**
     * DEBUG: Compte les ventes par année pour vérifier la variété des données
     */
    @Query(value = "SELECT " +
            "EXTRACT(YEAR FROM v.date_entree)::int AS annee, " +
            "COUNT(*) as nb_ventes, " +
            "SUM(vl.quantite) as total_qty " +
            "FROM vente_lignes vl " +
            "JOIN ventes v ON vl.vente_id = v.id " +
            "JOIN vente_processes vp ON v.process_id = vp.id " +
            "WHERE vp.valeur >= 60 AND vp.valeur < 99 " +
            "GROUP BY EXTRACT(YEAR FROM v.date_entree) " +
            "ORDER BY annee",
            nativeQuery = true)
    List<Object[]> debugVentesParAnnee();

    /**
     * DEBUG: Vérifie si nous avons bien des données historiques (référence VH-)
     */
    @Query(value = "SELECT COUNT(*) FROM ventes WHERE refe LIKE 'VH-%'", nativeQuery = true)
    Long countVentesHistoriques();

    /**
     * Tendances clients : total achats et nb commandes par client et année.
     * Retourne [client_id, client_nom, annee, nb_commandes, total_montant]
     */
    @Query(value = "SELECT v.client_id, c.client_nom, " +
            "EXTRACT(YEAR FROM v.date_entree)::int AS annee, " +
            "COUNT(DISTINCT v.id) AS nb_commandes, " +
            "COALESCE(SUM(vl.quantite * vl.prix_unitaire), 0) AS total_montant " +
            "FROM vente_lignes vl " +
            "JOIN ventes v ON vl.vente_id = v.id " +
            "JOIN vente_processes vp ON v.process_id = vp.id " +
            "JOIN clients c ON v.client_id = c.id " +
            "WHERE vp.valeur >= 60 AND vp.valeur < 99 " +
            "GROUP BY v.client_id, c.client_nom, EXTRACT(YEAR FROM v.date_entree) " +
            "ORDER BY annee DESC, total_montant DESC",
            nativeQuery = true)
    List<Object[]> findTendancesClients();

    /**
     * Ventes mensuelles totales (tous articles confondus).
     * Retourne [annee, mois, total_quantite, total_montant]
     */
    @Query(value = "SELECT " +
            "EXTRACT(YEAR FROM v.date_entree)::int AS annee, " +
            "EXTRACT(MONTH FROM v.date_entree)::int AS mois, " +
            "COALESCE(SUM(vl.quantite), 0) AS total_quantite, " +
            "COALESCE(SUM(vl.quantite * vl.prix_unitaire), 0) AS total_montant " +
            "FROM vente_lignes vl " +
            "JOIN ventes v ON vl.vente_id = v.id " +
            "JOIN vente_processes vp ON v.process_id = vp.id " +
            "WHERE vp.valeur >= 60 AND vp.valeur < 99 " +
            "GROUP BY EXTRACT(YEAR FROM v.date_entree), EXTRACT(MONTH FROM v.date_entree) " +
            "ORDER BY annee, mois",
            nativeQuery = true)
    List<Object[]> findVentesMensuellesTotales();
}

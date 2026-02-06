package com.app.gestion.repository;

import com.app.gestion.model.Lot;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LotRepository extends JpaRepository<Lot, Integer> {

        /**
         * Calculer le stock théorique (somme des quantités restantes) pour un article
         * dans un dépôt
         */
        @Query("SELECT COALESCE(SUM(l.quantiteRestante), 0.0) FROM Lot l " +
                        "WHERE l.article.id = :articleId " +
                        "AND l.depot.id = :depotId")
        Double calculerStockTheorique(@Param("articleId") Integer articleId,
                        @Param("depotId") Integer depotId);

        /**
         * 4.3 - Trouver les lots disponibles pour un article dans un dépôt
         * en ordre FIFO (First In First Out) - par date d'arrivée
         * Exclut les lots expirés
         */
        @Query("SELECT l FROM Lot l " +
                        "WHERE l.article.id = :articleId " +
                        "AND l.depot.id = :depotId " +
                        "AND l.quantiteRestante > 0 " +
                        "AND (l.datePeremption IS NULL OR l.datePeremption > CURRENT_TIMESTAMP) " +
                        "ORDER BY l.dateArrivee ASC")
        List<Lot> findLotsDisponiblesFIFO(@Param("articleId") Integer articleId,
                        @Param("depotId") Integer depotId);

        /**
         * 4.3 - Trouver les lots disponibles pour un article dans un dépôt
         * en ordre FEFO (First Expired First Out) - par date de péremption
         * Pour produits périssables
         * Exclut les lots expirés
         */
        @Query("SELECT l FROM Lot l " +
                        "WHERE l.article.id = :articleId " +
                        "AND l.depot.id = :depotId " +
                        "AND l.quantiteRestante > 0 " +
                        "AND l.datePeremption IS NOT NULL " +
                        "AND l.datePeremption > CURRENT_TIMESTAMP " +
                        "ORDER BY l.datePeremption DESC")
        List<Lot> findLotsDisponiblesFEFO(@Param("articleId") Integer articleId,
                        @Param("depotId") Integer depotId);

        /**
         * 4.3 - Vérifier si un article a des produits périssables (avec date de
         * péremption)
         */
        @Query("SELECT COUNT(l) > 0 FROM Lot l " +
                        "WHERE l.article.id = :articleId " +
                        "AND l.datePeremption IS NOT NULL")
        boolean hasLotsPerissables(@Param("articleId") Integer articleId);
	@Query(value = "SELECT nextval('lot_num_seq')", nativeQuery = true)
	Long getNextLotSequence();

    //@Query("SELECT l FROM Lot l WHERE l.article.id = :articleId AND l.depot.id = :depotId ORDER BY l.datePeremption ASC where l.quantite > 0")
    //public List<Lot> findFIFO(Integer articleId, Integer depotId,Double quantite);

    @Query(value = "SELECT * " +
                "FROM ( " +
                "    SELECT l.*, " +
                "        SUM(l.quantite) OVER (ORDER BY l.date_arrivee ASC) AS cumul " +
                "    FROM lots l " +
                "    WHERE l.article_id = :articleId " +
                "    AND l.depot_id = :depotId " +
                "    AND l.quantite > 0 " +
                ") t " +
                "WHERE t.cumul <= :quantite " +
                "OR t.cumul - t.quantite < :quantite " +
                "ORDER BY t.date_arrivee ASC", 
        nativeQuery = true)
    List<Lot> findFIFO(
        @Param("articleId") Integer articleId,
        @Param("depotId") Integer depotId,
        @Param("quantite") Double quantite
    );

    @Query(value = "SELECT * " +
                "FROM ( " +
                "    SELECT l.*, " +
                "        SUM(l.quantite) OVER (ORDER BY l.date_arrivee ASC) AS cumul " +
                "    FROM lots l " +
                "    WHERE l.article_id = :articleId " +
                "    AND l.depot_id = :depotId " +
                "    AND l.quantite > 0 " +
                ") t " +
                "WHERE t.cumul <= :quantite " +
                "OR t.cumul - t.quantite < :quantite " +
                "ORDER BY t.date_arrivee DESC", 
        nativeQuery = true)
    List<Lot> findLIFO(
        @Param("articleId") Integer articleId,
        @Param("depotId") Integer depotId,
        @Param("quantite") Double quantite
    );


    @Query(value = "SELECT * "+
        "FROM (" +
            "SELECT l.*, " +
                "SUM(l.quantite) OVER () AS cumul "+
            "FROM lots l "+
            "WHERE l.article_id = :articleId "+
            "AND l.depot_id = :depotId "+
            "AND l.quantite > 0 "+
        ") t "+
        "WHERE t.cumul <= :quantite"+
        "OR t.cumul - t.quantite < :quantite", nativeQuery = true)
    List<Lot> findCMUP(
        @Param("articleId") Integer articleId,
        @Param("depotId") Integer depotId,
        @Param("quantite") Double quantite
    );

    // Fallback Spring Data methods (used when DB window functions are not available)
    List<Lot> findByArticleIdAndDepotIdAndQuantiteGreaterThanOrderByDateArriveeAsc(Integer articleId, Integer depotId, Double quantite);
    List<Lot> findByArticleIdAndDepotIdAndQuantiteGreaterThanOrderByDateArriveeDesc(Integer articleId, Integer depotId, Double quantite);

    List<Lot> findByArticleIdAndQuantiteGreaterThanOrderByDateArriveeAsc(Integer articleId, Double quantite);
    List<Lot> findByArticleIdAndQuantiteGreaterThanOrderByDateArriveeDesc(Integer articleId, Double quantite);

    // Methods with arrival-date cutoff
    List<Lot> findByArticleIdAndDepotIdAndQuantiteGreaterThanAndDateArriveeLessThanEqualOrderByDateArriveeAsc(
        Integer articleId, Integer depotId, Double quantite, LocalDateTime dateArrivee
    );

    List<Lot> findByArticleIdAndDepotIdAndQuantiteGreaterThanAndDateArriveeLessThanEqualOrderByDateArriveeDesc(
        Integer articleId, Integer depotId, Double quantite, LocalDateTime dateArrivee
    );

    List<Lot> findByArticleIdAndQuantiteGreaterThanAndDateArriveeLessThanEqualOrderByDateArriveeAsc(
        Integer articleId, Double quantite, LocalDateTime dateArrivee
    );

    List<Lot> findByArticleIdAndQuantiteGreaterThanAndDateArriveeLessThanEqualOrderByDateArriveeDesc(
        Integer articleId, Double quantite, LocalDateTime dateArrivee
    );
}

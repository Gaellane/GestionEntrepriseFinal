package com.app.gestion.repository;

import com.app.gestion.model.Lot;

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
                        "ORDER BY l.datePeremption ASC")
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
}

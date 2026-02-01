package com.app.gestion.repository;

import com.app.gestion.model.StockReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockReservationRepository extends JpaRepository<StockReservation, Integer> {

    /**
     * Trouver les réservations par référence (encodée avec VENTE-{refe})
     */
    List<StockReservation> findByReferenceStartingWith(String referencePrefix);

    /**
     * Trouver les réservations actives (non consommées et non libérées)
     */
    @Query("SELECT sr FROM StockReservation sr " +
            "WHERE sr.process.valeur NOT IN (30, 99)")
    List<StockReservation> findReservationsActives();

    /**
     * 3.4 - Calculer le stock réservé pour un article dans un dépôt
     * Somme des réservations actives (process != Consommée (30) et != Libérée (99))
     */
    @Query("SELECT COALESCE(SUM(sr.quantite), 0.0) FROM StockReservation sr " +
            "WHERE sr.article.id = :articleId " +
            "AND sr.process.valeur NOT IN (30, 99)")
    Double calculerStockReserve(@Param("articleId") Integer articleId, @Param("depotId") Integer depotId);
}

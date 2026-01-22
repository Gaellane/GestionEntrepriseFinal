package com.app.gestion.repository;

import com.app.gestion.model.Lot;

import jakarta.persistence.criteria.CriteriaBuilder.In;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LotRepository extends JpaRepository<Lot, Integer> {

	@Query(value = "SELECT nextval('lot_num_seq')", nativeQuery = true)
	Long getNextLotSequence();

    //@Query("SELECT l FROM Lot l WHERE l.article.id = :articleId AND l.depot.id = :depotId ORDER BY l.datePeremption ASC where l.quantite > 0")
    //public List<Lot> findFIFO(Integer articleId, Integer depotId,Double quantite);

    @Query(value = """
        SELECT *
        FROM (
            SELECT l.*,
                SUM(l.quantite) OVER (ORDER BY l.date_peremption ASC) AS cumul
            FROM lot l
            WHERE l.article_id = :articleId
            AND l.depot_id = :depotId
            AND l.quantite > 0
        ) t
        WHERE t.cumul <= :quantite
        OR t.cumul - t.quantite < :quantite
        ORDER BY t.date_peremption ASC
    """, nativeQuery = true)
    List<Lot> findFIFO(
        @Param("articleId") Integer articleId,
        @Param("depotId") Integer depotId,
        @Param("quantite") Double quantite
    );

    @Query(value = """
        SELECT *
        FROM (
            SELECT l.*,
                SUM(l.quantite) OVER (ORDER BY l.date_peremption ASC) AS cumul
            FROM lot l
            WHERE l.article_id = :articleId
            AND l.depot_id = :depotId
            AND l.quantite > 0
        ) t
        WHERE t.cumul <= :quantite
        OR t.cumul - t.quantite < :quantite
        ORDER BY t.date_peremption DESC
    """, nativeQuery = true)
    List<Lot> findLIFO(
        @Param("articleId") Integer articleId,
        @Param("depotId") Integer depotId,
        @Param("quantite") Double quantite
    );


    @Query(value = """
        SELECT *
        FROM (
            SELECT l.*,
                SUM(l.quantite) OVER () AS cumul
            FROM lot l
            WHERE l.article_id = :articleId
            AND l.depot_id = :depotId
            AND l.quantite > 0
        ) t
        WHERE t.cumul <= :quantite
        OR t.cumul - t.quantite < :quantite
    """, nativeQuery = true)
    List<Lot> findCMUP(
        @Param("articleId") Integer articleId,
        @Param("depotId") Integer depotId,
        @Param("quantite") Double quantite
    );
}

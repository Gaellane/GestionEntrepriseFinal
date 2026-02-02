package com.app.gestion.repository;

import com.app.gestion.model.LotMouvement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LotMouvementRepository extends JpaRepository<LotMouvement, Integer> {

    @Query("SELECT lm FROM LotMouvement lm " +
            "JOIN FETCH lm.lot l " +
            "JOIN FETCH l.article a " +
            "LEFT JOIN FETCH l.depot d " +
            "LEFT JOIN FETCH lm.typeMouvement tm " +
            "LEFT JOIN FETCH lm.raison r " +
            "WHERE a.id = :articleId " +
            "ORDER BY lm.dateEntree DESC")
    List<LotMouvement> findByArticleId(@Param("articleId") Integer articleId);
    
    @Query("SELECT lm FROM LotMouvement lm " +
            "JOIN FETCH lm.lot l " +
            "JOIN FETCH l.article a " +
            "LEFT JOIN FETCH l.depot d " +
            "LEFT JOIN FETCH lm.typeMouvement tm " +
            "LEFT JOIN FETCH lm.raison r " +
            "ORDER BY lm.dateEntree DESC")
    List<LotMouvement> findAllWithDetails();
}

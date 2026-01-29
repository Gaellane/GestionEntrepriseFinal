package com.app.gestion.repository;

import com.app.gestion.model.ArticleEntity;
import com.app.gestion.model.ArticlePrix;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticlePrixRepository extends JpaRepository<ArticlePrix, Integer> {

    // Récupérer tous les prix d'un article entity (historique)
    List<ArticlePrix> findByArticleEntityOrderByDateEntreeDesc(ArticleEntity articleEntity);

    // Récupérer le prix actuel (le plus récent) d'un article entity
    @Query("SELECT ap FROM ArticlePrix ap WHERE ap.articleEntity.id = :articleEntityId " +
            "ORDER BY ap.dateEntree DESC LIMIT 1")
    Optional<ArticlePrix> findLatestPrixByArticleEntityId(@Param("articleEntityId") Integer articleEntityId);

    // Récupérer tous les prix pour une entité donnée
    @Query("SELECT ap FROM ArticlePrix ap " +
            "WHERE ap.articleEntity.entity.id = :entityId " +
            "ORDER BY ap.articleEntity.article.articleNom, ap.dateEntree DESC")
    List<ArticlePrix> findAllByEntityId(@Param("entityId") Integer entityId);
}

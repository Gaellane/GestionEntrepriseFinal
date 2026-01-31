package com.app.gestion.repository;

import com.app.gestion.model.ArticleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleEntityRepository extends JpaRepository<ArticleEntity, Integer> {

    // Récupérer tous les articles d'une entité
    List<ArticleEntity> findByEntityId(Integer entityId);

    // Récupérer un article entity par article et entité
    Optional<ArticleEntity> findByArticleIdAndEntityId(Integer articleId, Integer entityId);

    // Rechercher des articles par nom dans une entité
    @Query("SELECT ae FROM ArticleEntity ae " +
            "WHERE ae.entity.id = :entityId " +
            "AND LOWER(ae.article.articleNom) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<ArticleEntity> searchArticlesByEntityId(@Param("entityId") Integer entityId,
            @Param("searchTerm") String searchTerm);

    // Récupérer l'ArticleEntity actif pour un article donné (première entité trouvée)
    @Query("SELECT ae FROM ArticleEntity ae WHERE ae.article.id = :articleId ORDER BY ae.id ASC")
    Optional<ArticleEntity> findActiveByArticleId(@Param("articleId") Integer articleId);
}

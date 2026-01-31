package com.app.gestion.repository;

import com.app.gestion.model.Article;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Integer> {
    Optional<Article> findByRefe(String refe);
    Boolean existsByRefe(String refe);

    @Query("SELECT a FROM Article a LEFT JOIN FETCH a.categorie LEFT JOIN FETCH a.unite")
    List<Article> findAllWithRelations();
    
    @Query("SELECT a FROM Article a WHERE a.categorie.id = :categorieId")
    List<Article> findByCategorieId(@Param("categorieId") Integer categorieId);
    
    @Query("SELECT a FROM Article a WHERE " +
           "(:searchTerm IS NULL OR :searchTerm = '' OR " +
           "LOWER(a.articleNom) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.refe) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Article> searchArticles(@Param("searchTerm") String searchTerm, Pageable pageable);
}

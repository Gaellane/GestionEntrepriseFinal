package com.app.gestion.repository;

import com.app.gestion.model.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Integer> {
    Optional<Article> findByRefe(String refe);
    Boolean existsByRefe(String refe);
}

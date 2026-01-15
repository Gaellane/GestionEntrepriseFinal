package com.app.gestion.repository;

import com.app.gestion.model.ArticleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArticleEntityRepository extends JpaRepository<ArticleEntity, Integer> {
}

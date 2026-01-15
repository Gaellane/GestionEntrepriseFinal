package com.app.gestion.repository;

import com.app.gestion.model.ArticlePrix;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArticlePrixRepository extends JpaRepository<ArticlePrix, Integer> {
}

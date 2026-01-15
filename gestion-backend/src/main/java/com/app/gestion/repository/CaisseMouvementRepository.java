package com.app.gestion.repository;

import com.app.gestion.model.CaisseMouvement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CaisseMouvementRepository extends JpaRepository<CaisseMouvement, Integer> {
}

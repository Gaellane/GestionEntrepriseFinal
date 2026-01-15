package com.app.gestion.repository;

import com.app.gestion.model.CaisseTypeMouvement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CaisseTypeMouvementRepository extends JpaRepository<CaisseTypeMouvement, Integer> {
}

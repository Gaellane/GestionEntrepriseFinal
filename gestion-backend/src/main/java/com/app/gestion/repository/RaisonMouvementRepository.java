package com.app.gestion.repository;

import com.app.gestion.model.RaisonMouvement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RaisonMouvementRepository extends JpaRepository<RaisonMouvement, Integer> {
    List<RaisonMouvement> findAllByOrderByRaisonNameAsc();
    List<RaisonMouvement> findByDescriptionOrderByRaisonNameAsc(String description);
}

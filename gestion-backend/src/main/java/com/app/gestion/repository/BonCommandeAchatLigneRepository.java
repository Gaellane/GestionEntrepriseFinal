package com.app.gestion.repository;

import com.app.gestion.model.BonCommandeAchatLigne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BonCommandeAchatLigneRepository extends JpaRepository<BonCommandeAchatLigne, Integer> {
    List<BonCommandeAchatLigne> findByBonCommandeId(Integer bonCommandeId);
}

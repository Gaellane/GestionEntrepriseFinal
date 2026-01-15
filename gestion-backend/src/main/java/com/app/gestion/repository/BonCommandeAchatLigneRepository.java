package com.app.gestion.repository;

import com.app.gestion.model.BonCommandeAchatLigne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BonCommandeAchatLigneRepository extends JpaRepository<BonCommandeAchatLigne, Integer> {
}

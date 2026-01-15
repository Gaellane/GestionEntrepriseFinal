package com.app.gestion.repository;

import com.app.gestion.model.BonCommandeHistorique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BonCommandeHistoriqueRepository extends JpaRepository<BonCommandeHistorique, Integer> {
}

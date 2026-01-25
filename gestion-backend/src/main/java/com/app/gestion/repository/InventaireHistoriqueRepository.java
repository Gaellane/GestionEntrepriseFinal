package com.app.gestion.repository;

import com.app.gestion.model.InventaireHistorique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventaireHistoriqueRepository extends JpaRepository<InventaireHistorique, Integer> {
	boolean existsByInventaire_IdAndProcess_Abreviation(Integer inventaireId, String abreviation);
}

package com.app.gestion.repository;

import com.app.gestion.model.InventaireProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventaireProcessRepository extends JpaRepository<InventaireProcess, Integer> {
	InventaireProcess findByAbreviation(String abreviation);
}

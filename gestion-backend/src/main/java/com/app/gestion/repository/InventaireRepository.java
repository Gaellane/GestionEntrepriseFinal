package com.app.gestion.repository;

import com.app.gestion.model.Inventaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventaireRepository extends JpaRepository<Inventaire, Integer> {
	java.util.List<Inventaire> findByUtilisateur_Id(Integer utilisateurId);
}

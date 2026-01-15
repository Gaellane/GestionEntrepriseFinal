package com.app.gestion.repository;

import com.app.gestion.model.LivraisonVenteProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LivraisonVenteProcessRepository extends JpaRepository<LivraisonVenteProcess, Integer> {
}

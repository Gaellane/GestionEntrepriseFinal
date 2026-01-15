package com.app.gestion.repository;

import com.app.gestion.model.VenteHistorique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VenteHistoriqueRepository extends JpaRepository<VenteHistorique, Integer> {
}

package com.app.gestion.repository;

import com.app.gestion.model.LivraisonVenteHistorique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LivraisonVenteHistoriqueRepository extends JpaRepository<LivraisonVenteHistorique, Integer> {
}

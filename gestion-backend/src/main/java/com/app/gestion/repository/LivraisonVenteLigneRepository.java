package com.app.gestion.repository;

import com.app.gestion.model.LivraisonVenteLigne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LivraisonVenteLigneRepository extends JpaRepository<LivraisonVenteLigne, Integer> {
}

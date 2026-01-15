package com.app.gestion.repository;

import com.app.gestion.model.LivraisonAchatLigne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LivraisonAchatLigneRepository extends JpaRepository<LivraisonAchatLigne, Integer> {
}

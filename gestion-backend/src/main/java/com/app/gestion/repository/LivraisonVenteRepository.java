package com.app.gestion.repository;

import com.app.gestion.model.LivraisonVente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LivraisonVenteRepository extends JpaRepository<LivraisonVente, Integer> {
    Optional<LivraisonVente> findByRefe(String refe);
}

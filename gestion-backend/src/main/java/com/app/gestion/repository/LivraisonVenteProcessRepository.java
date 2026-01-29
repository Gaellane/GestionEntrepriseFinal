package com.app.gestion.repository;

import com.app.gestion.model.LivraisonVenteProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LivraisonVenteProcessRepository extends JpaRepository<LivraisonVenteProcess, Integer> {

    /**
     * Trouver un processus par sa valeur
     */
    Optional<LivraisonVenteProcess> findByValeur(Integer valeur);
}

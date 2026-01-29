package com.app.gestion.repository;

import com.app.gestion.model.VenteProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VenteProcessRepository extends JpaRepository<VenteProcess, Integer> {

    /**
     * Trouver un processus par sa valeur
     */
    Optional<VenteProcess> findByValeur(Integer valeur);

    /**
     * Trouver un processus par son nom
     */
    Optional<VenteProcess> findByProcessName(String processName);
}

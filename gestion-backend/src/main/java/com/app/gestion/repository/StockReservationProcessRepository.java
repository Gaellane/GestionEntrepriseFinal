package com.app.gestion.repository;

import com.app.gestion.model.StockReservationProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StockReservationProcessRepository extends JpaRepository<StockReservationProcess, Integer> {

    /**
     * Trouver un processus par sa valeur (10, 20, 30, 99)
     */
    Optional<StockReservationProcess> findByValeur(Integer valeur);
}

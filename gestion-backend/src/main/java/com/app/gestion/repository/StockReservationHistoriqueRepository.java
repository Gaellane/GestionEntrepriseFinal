package com.app.gestion.repository;

import com.app.gestion.model.StockReservationHistorique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockReservationHistoriqueRepository extends JpaRepository<StockReservationHistorique, Integer> {
}

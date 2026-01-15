package com.app.gestion.repository;

import com.app.gestion.model.StockReservationProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockReservationProcessRepository extends JpaRepository<StockReservationProcess, Integer> {
}

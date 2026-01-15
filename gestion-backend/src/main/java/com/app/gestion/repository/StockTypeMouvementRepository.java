package com.app.gestion.repository;

import com.app.gestion.model.StockTypeMouvement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockTypeMouvementRepository extends JpaRepository<StockTypeMouvement, Integer> {
}

package com.app.gestion.repository;

import com.app.gestion.model.VenteLigne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VenteLigneRepository extends JpaRepository<VenteLigne, Integer> {
}

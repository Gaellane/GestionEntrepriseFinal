package com.app.gestion.repository;

import com.app.gestion.model.InventaireLigne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventaireLigneRepository extends JpaRepository<InventaireLigne, Integer> {
}

package com.app.gestion.repository;

import com.app.gestion.model.ProformaVenteLigne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProformaVenteLigneRepository extends JpaRepository<ProformaVenteLigne, Integer> {
}

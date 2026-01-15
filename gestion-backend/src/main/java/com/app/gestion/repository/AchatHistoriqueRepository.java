package com.app.gestion.repository;

import com.app.gestion.model.AchatHistorique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AchatHistoriqueRepository extends JpaRepository<AchatHistorique, Integer> {
}

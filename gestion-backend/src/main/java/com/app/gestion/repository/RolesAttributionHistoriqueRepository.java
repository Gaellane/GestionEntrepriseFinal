package com.app.gestion.repository;

import com.app.gestion.model.RolesAttributionHistorique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RolesAttributionHistoriqueRepository extends JpaRepository<RolesAttributionHistorique, Integer> {
}

package com.app.gestion.repository;

import com.app.gestion.model.EntityDepot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EntityDepotRepository extends JpaRepository<EntityDepot, Integer> {
}

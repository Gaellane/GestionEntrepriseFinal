package com.app.gestion.repository;

import com.app.gestion.model.EntityDepot;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EntityDepotRepository extends JpaRepository<EntityDepot, Integer> {
	List<EntityDepot> findByEntityId(Integer entityId);
}

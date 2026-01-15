package com.app.gestion.repository;

import com.app.gestion.model.VenteProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VenteProcessRepository extends JpaRepository<VenteProcess, Integer> {
}

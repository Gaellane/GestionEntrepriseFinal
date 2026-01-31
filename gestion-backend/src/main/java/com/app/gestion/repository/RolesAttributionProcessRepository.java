package com.app.gestion.repository;

import com.app.gestion.model.RolesAttributionProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RolesAttributionProcessRepository extends JpaRepository<RolesAttributionProcess, Integer> {
    Optional<RolesAttributionProcess> findByValeur(Integer valeur);
}

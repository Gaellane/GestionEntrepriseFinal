package com.app.gestion.repository;

import com.app.gestion.model.BonCommandeProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BonCommandeProcessRepository extends JpaRepository<BonCommandeProcess, Integer> {
}

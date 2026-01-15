package com.app.gestion.repository;

import com.app.gestion.model.AchatProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AchatProcessRepository extends JpaRepository<AchatProcess, Integer> {
}

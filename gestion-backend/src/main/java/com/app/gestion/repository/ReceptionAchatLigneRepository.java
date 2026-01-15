package com.app.gestion.repository;

import com.app.gestion.model.ReceptionAchatLigne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReceptionAchatLigneRepository extends JpaRepository<ReceptionAchatLigne, Integer> {
}

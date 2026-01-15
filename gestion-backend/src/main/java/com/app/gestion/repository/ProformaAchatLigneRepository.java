package com.app.gestion.repository;

import com.app.gestion.model.ProformaAchatLigne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProformaAchatLigneRepository extends JpaRepository<ProformaAchatLigne, Integer> {
}

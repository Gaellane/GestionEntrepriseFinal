package com.app.gestion.repository;

import com.app.gestion.model.AchatLigne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchatLigneRepository extends JpaRepository<AchatLigne, Integer> {

    List<AchatLigne> findByAchatId(Integer achatId);
}

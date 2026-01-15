package com.app.gestion.repository;

import com.app.gestion.model.LotMouvement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LotMouvementRepository extends JpaRepository<LotMouvement, Integer> {
}

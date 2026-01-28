package com.app.gestion.repository;

import com.app.gestion.model.CaisseMouvement;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CaisseMouvementRepository extends JpaRepository<CaisseMouvement, Integer> {
    List<CaisseMouvement> findByTypeMouvementId(Integer id);

    @Query(nativeQuery = true, value = "SELECT SUM(montant) FROM caisse_mouvements WHERE type_mouvement_id = :id")
    Double findMontantTotalByMouvementId(@Param("id") Integer id);
}

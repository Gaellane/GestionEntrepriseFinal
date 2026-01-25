package com.app.gestion.repository;

import com.app.gestion.model.LivraisonVente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LivraisonVenteRepository extends JpaRepository<LivraisonVente, Integer> {

    Optional<LivraisonVente> findByRefe(String refe);

    /**
     * 4.2 - Trouver toutes les livraisons d'une vente
     */
    List<LivraisonVente> findByVenteId(Integer venteId);

    /**
     * Vérifier si une vente a déjà une livraison
     */
    @Query("SELECT COUNT(l) > 0 FROM LivraisonVente l WHERE l.vente.id = :venteId")
    boolean existsByVenteId(@Param("venteId") Integer venteId);
}

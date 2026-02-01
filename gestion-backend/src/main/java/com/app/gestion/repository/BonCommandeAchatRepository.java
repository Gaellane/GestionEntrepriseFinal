package com.app.gestion.repository;

import com.app.gestion.model.BonCommandeAchat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BonCommandeAchatRepository extends JpaRepository<BonCommandeAchat, Integer> {
    Optional<BonCommandeAchat> findByRefe(String refe);

    @Query("SELECT b FROM BonCommandeAchat b LEFT JOIN b.proforma p LEFT JOIN b.bonCommandeAchatLignes l WHERE p.achat.id = :achatId")
    Optional<BonCommandeAchat> findByAchatId(Integer achatId);

    Optional<BonCommandeAchat> findByProforma_Achat_Id(Integer achatId);

    // Trouver les bons de commande entre deux dates
    List<BonCommandeAchat> findByDateEntreeBetween(LocalDateTime dateMin, LocalDateTime dateMax);

}

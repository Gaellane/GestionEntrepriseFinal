package com.app.gestion.repository;

import com.app.gestion.model.CaisseMouvement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CaisseMouvementRepository extends JpaRepository<CaisseMouvement, Integer> {

    // =========== KPI FINANCE (9.2) ===========

    // CA encaissé (type mouvement positif / encaissement)
    @Query("SELECT COALESCE(SUM(cm.montant), 0.0) FROM CaisseMouvement cm " +
            "WHERE cm.typeMouvement.valeur > 0 " +
            "AND cm.dateEntree BETWEEN :dateDebut AND :dateFin")
    Double sumEncaissements(@Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin);

    // Volume remboursements (type mouvement négatif / sortie)
    @Query("SELECT COALESCE(SUM(ABS(cm.montant)), 0.0) FROM CaisseMouvement cm " +
            "WHERE cm.typeMouvement.valeur < 0 " +
            "AND cm.dateEntree BETWEEN :dateDebut AND :dateFin")
    Double sumRemboursements(@Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin);

    // Mouvements remboursements avec détails (pour analyse causes)
    @Query("SELECT cm FROM CaisseMouvement cm " +
            "WHERE cm.typeMouvement.valeur < 0 " +
            "AND cm.dateEntree BETWEEN :dateDebut AND :dateFin")
    List<CaisseMouvement> findRemboursements(@Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin);

    // Mouvements par type
    @Query("SELECT cm.typeMouvement.typeName, COALESCE(SUM(cm.montant), 0.0) " +
            "FROM CaisseMouvement cm " +
            "WHERE cm.dateEntree BETWEEN :dateDebut AND :dateFin " +
            "GROUP BY cm.typeMouvement.typeName")
    List<Object[]> sumByTypeMouvement(@Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin);
}

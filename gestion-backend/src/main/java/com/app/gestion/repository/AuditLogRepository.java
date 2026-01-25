package com.app.gestion.repository;

import com.app.gestion.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Integer> {

    // =========== KPI COMMERCIAL (9.1) ===========

    // Logs d'annulation de ventes (pour motifs)
    @Query("SELECT al FROM AuditLog al " +
            "WHERE al.classes = 'Vente' " +
            "AND al.action.actionName LIKE '%Annul%' " +
            "AND al.actionTimestamp BETWEEN :dateDebut AND :dateFin")
    List<AuditLog> findLogsAnnulationVentes(@Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin);

    // Logs d'exceptions/dérogations
    @Query("SELECT al FROM AuditLog al " +
            "WHERE al.details LIKE '%exception%' OR al.details LIKE '%dérogation%' " +
            "AND al.actionTimestamp BETWEEN :dateDebut AND :dateFin")
    List<AuditLog> findLogsExceptions(@Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin);

    // Logs par utilisateur et classe
    @Query("SELECT al FROM AuditLog al " +
            "WHERE al.classes = :classe " +
            "AND al.actionTimestamp BETWEEN :dateDebut AND :dateFin " +
            "ORDER BY al.actionTimestamp DESC")
    List<AuditLog> findByClasseAndPeriode(@Param("classe") String classe,
            @Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin);
}

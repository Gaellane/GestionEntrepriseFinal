package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@jakarta.persistence.Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id")
    @lombok.ToString.Exclude
    private Utilisateur utilisateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "action_id")
    @lombok.ToString.Exclude
    private Action action;

    @Column(name = "classes", length = 100)
    private String classes;

    @Column(name = "ids_classes", nullable = false, columnDefinition = "TEXT")
    private String idsClasses;

    @Column(name = "action_timestamp")
    private LocalDateTime actionTimestamp;

    @Column(name = "old_values", columnDefinition = "TEXT")
    private String oldValues;

    @Column(name = "new_values", columnDefinition = "TEXT")
    private String newValues;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;
}

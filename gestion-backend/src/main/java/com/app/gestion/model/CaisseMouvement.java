package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@jakarta.persistence.Entity
@Table(name = "caisse_mouvements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaisseMouvement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "montant", nullable = false)
    private Double montant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_mouvement_id", nullable = false)
    private CaisseTypeMouvement typeMouvement;

    @Column(name = "date_entree", nullable = false)
    private LocalDateTime dateEntree;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entity_id", nullable = false)
    private Entity entity;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;
}

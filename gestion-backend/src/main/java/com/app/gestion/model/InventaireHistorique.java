package com.app.gestion.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@jakarta.persistence.Entity
@Table(name = "inventaire_historiques")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventaireHistorique {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "date_entree", nullable = false)
    private LocalDateTime dateEntree;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventaire_id", nullable = false)
    @lombok.ToString.Exclude
    private Inventaire inventaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id", nullable = false)
    @lombok.ToString.Exclude
    private InventaireProcess process;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    @lombok.ToString.Exclude
    private Utilisateur utilisateur;
}

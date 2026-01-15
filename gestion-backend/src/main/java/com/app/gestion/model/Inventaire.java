package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@jakarta.persistence.Entity
@Table(name = "inventaires")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @Column(name = "date_entree", nullable = false)
    private LocalDateTime dateEntree;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "depot_id", nullable = false)
    private Depot depot;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @OneToMany(mappedBy = "inventaire", fetch = FetchType.LAZY)
    private List<InventaireLigne> inventaireLignes;
}

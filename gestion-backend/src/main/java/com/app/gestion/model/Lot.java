package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@jakarta.persistence.Entity
@Table(name = "lots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "depot_id", nullable = false)
    private Depot depot;

    @Column(name = "date_arrivee", nullable = false)
    private LocalDateTime dateArrivee;

    @Column(name = "date_peremption")
    private LocalDateTime datePeremption;

    @Column(name = "quantite", nullable = false)
    private Double quantite;

    @OneToMany(mappedBy = "lot", fetch = FetchType.LAZY)
    private List<LotMouvement> lotMouvements;
}

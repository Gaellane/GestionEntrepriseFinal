package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

@jakarta.persistence.Entity
@Table(name = "inventaire_lignes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventaireLigne {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventaire_id", nullable = false)
    private Inventaire inventaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;

    @Column(name = "quantite", nullable = false)
    private Double quantite;
}

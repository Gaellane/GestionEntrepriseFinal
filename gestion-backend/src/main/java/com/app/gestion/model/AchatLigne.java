package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

@jakarta.persistence.Entity
@Table(name = "achat_lignes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AchatLigne {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "achat_id", nullable = false)
    @lombok.ToString.Exclude
    private Achat achat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    @lombok.ToString.Exclude
    private Article article;

    @Column(name = "quantite", nullable = false)
    private Double quantite;

    @Column(name = "prix_unitaire", nullable = false)
    private Double prixUnitaire;

    @Column(name = "prix_unitaire_estime", nullable = false)
    private Double prixUnitaireEstime;
}

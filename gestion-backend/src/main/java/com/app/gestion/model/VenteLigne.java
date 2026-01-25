package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

@jakarta.persistence.Entity
@Table(name = "vente_lignes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VenteLigne {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vente_id", nullable = false)
    @lombok.ToString.Exclude
    private Vente vente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    @lombok.ToString.Exclude
    private Article article;

    @Column(name = "quantite", nullable = false)
    private Double quantite;

    @Column(name = "prix_unitaire", nullable = false)
    private Double prixUnitaire;

    @Column(name = "remise_pourcentage")
    private Double remisePourcentage;

    @Column(name = "remise_fixe")
    private Double remiseFixe;
}

package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

@jakarta.persistence.Entity
@Table(name = "proforma_achat_lignes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProformaAchatLigne {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proforma_id", nullable = false)
    private ProformaAchat proforma;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;

    @Column(name = "quantite", nullable = false)
    private Double quantite;

    @Column(name = "prix_unitaire", nullable = false)
    private Double prixUnitaire;
}

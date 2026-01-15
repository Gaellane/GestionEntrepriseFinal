package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

@jakarta.persistence.Entity
@Table(name = "livraison_achat_lignes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LivraisonAchatLigne {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "livraison_id", nullable = false)
    private LivraisonAchat livraison;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;

    @Column(name = "quantite")
    private Double quantite;
}

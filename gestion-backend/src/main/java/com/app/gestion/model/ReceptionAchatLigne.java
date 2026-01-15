package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

@jakarta.persistence.Entity
@Table(name = "reception_achat_lignes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceptionAchatLigne {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reception_id", nullable = false)
    private ReceptionAchat reception;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "depot_id", nullable = false)
    private Depot depot;

    @Column(name = "quantite", nullable = false)
    private Double quantite;
}

package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@jakarta.persistence.Entity
@Table(name = "articles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "refe", unique = true, nullable = false, length = 100)
    private String refe;

    @Column(name = "article_nom", nullable = false, length = 100)
    private String articleNom;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_id")
    private Categorie categorie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unite_id")
    private Unite unite;

    @OneToMany(mappedBy = "article", fetch = FetchType.LAZY)
    private List<ArticleEntity> articleEntities;

    @OneToMany(mappedBy = "article", fetch = FetchType.LAZY)
    private List<AchatLigne> achatLignes;

    @OneToMany(mappedBy = "article", fetch = FetchType.LAZY)
    private List<ProformaAchatLigne> proformaAchatLignes;

    @OneToMany(mappedBy = "article", fetch = FetchType.LAZY)
    private List<BonCommandeAchatLigne> bonCommandeAchatLignes;

    @OneToMany(mappedBy = "article", fetch = FetchType.LAZY)
    private List<ReceptionAchatLigne> receptionAchatLignes;

    @OneToMany(mappedBy = "article", fetch = FetchType.LAZY)
    private List<LivraisonAchatLigne> livraisonAchatLignes;

    @OneToMany(mappedBy = "article", fetch = FetchType.LAZY)
    private List<Lot> lots;

    @OneToMany(mappedBy = "article", fetch = FetchType.LAZY)
    private List<StockReservation> stockReservations;

    @OneToMany(mappedBy = "article", fetch = FetchType.LAZY)
    private List<ProformaVenteLigne> proformaVenteLignes;

    @OneToMany(mappedBy = "article", fetch = FetchType.LAZY)
    private List<VenteLigne> venteLignes;

    @OneToMany(mappedBy = "article", fetch = FetchType.LAZY)
    private List<LivraisonVenteLigne> livraisonVenteLignes;

    @OneToMany(mappedBy = "article", fetch = FetchType.LAZY)
    private List<InventaireLigne> inventaireLignes;
}

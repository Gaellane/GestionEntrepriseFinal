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

    @Column(name = "valorisation", nullable = false, length = 50)
    private String valorisation;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_id")
    @ToString.Exclude
    private Categorie categorie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unite_id")
    @ToString.Exclude
    private Unite unite;

    @OneToMany(mappedBy = "article", fetch = FetchType.LAZY)
    @ToString.Exclude
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
    @ToString.Exclude
    private List<Lot> lots;

    @OneToMany(mappedBy = "article", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<StockReservation> stockReservations;

    @OneToMany(mappedBy = "article", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<ProformaVenteLigne> proformaVenteLignes;

    @OneToMany(mappedBy = "article", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<VenteLigne> venteLignes;

    @OneToMany(mappedBy = "article", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<LivraisonVenteLigne> livraisonVenteLignes;

    @OneToMany(mappedBy = "article", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<InventaireLigne> inventaireLignes;


    public boolean isCmup(){
        return valorisation.compareToIgnoreCase("cmup")==0;
    }
    public boolean isFifo(){
        return valorisation.compareToIgnoreCase("fifo")==0;
    }
    public boolean isLifo(){
        return valorisation.compareToIgnoreCase("lifo")==0;
    }
}

package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@jakarta.persistence.Entity
@Table(name = "ventes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "refe", unique = true, nullable = false, length = 100)
    private String refe;

    @Column(name = "date_entree", nullable = false)
    private LocalDateTime dateEntree;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proforma_id", nullable = false)
    @lombok.ToString.Exclude
    private ProformaVente proforma;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    @lombok.ToString.Exclude
    private Client client;

    @Column(name = "date_effective", nullable = false)
    private LocalDate dateEffective;

    @Column(name = "date_livraison", nullable = false)
    private LocalDate dateLivraison;

    @Column(name = "location_livraison", nullable = false, length = 200)
    private String locationLivraison;

    @Column(name = "prix_total", nullable = false)
    private Double prixTotal;

    @Column(name = "remise_pourcentage")
    private Double remisePourcentage;

    @Column(name = "remise_fixe")
    private Double remiseFixe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id", nullable = false)
    @lombok.ToString.Exclude
    private VenteProcess process;

    @OneToMany(mappedBy = "vente", fetch = FetchType.LAZY)
    @lombok.ToString.Exclude
    private List<VenteLigne> venteLignes=new ArrayList<VenteLigne>();

    @OneToMany(mappedBy = "vente", fetch = FetchType.LAZY)
    @lombok.ToString.Exclude
    private List<VenteHistorique> venteHistoriques=new ArrayList<VenteHistorique>();

    @OneToMany(mappedBy = "vente", fetch = FetchType.LAZY)
    @lombok.ToString.Exclude
    private List<LivraisonVente> livraisonVentes=new ArrayList<LivraisonVente>();
}

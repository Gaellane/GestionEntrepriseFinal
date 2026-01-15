package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
    private ProformaVente proforma;

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
    private VenteProcess process;

    @OneToMany(mappedBy = "vente", fetch = FetchType.LAZY)
    private List<VenteLigne> venteLignes;

    @OneToMany(mappedBy = "vente", fetch = FetchType.LAZY)
    private List<VenteHistorique> venteHistoriques;

    @OneToMany(mappedBy = "vente", fetch = FetchType.LAZY)
    private List<LivraisonVente> livraisonVentes;
}

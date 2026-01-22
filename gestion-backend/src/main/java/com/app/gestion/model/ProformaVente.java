package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@jakarta.persistence.Entity
@Table(name = "proforma_ventes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProformaVente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id", nullable = false)
    private VenteProcess process;

    @Column(name = "date_entree", nullable = false)
    private LocalDateTime dateEntree;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(name = "refe", unique = true, nullable = false, length = 100)
    private String refe;

    @Column(name = "prix_total", nullable = false)
    private Double prixTotal;

    @Column(name = "remise_pourcentage")
    private Double remisePourcentage;

    @Column(name = "remise_fixe")
    private Double remiseFixe;

    @OneToMany(mappedBy = "proforma", fetch = FetchType.LAZY)
    private List<ProformaVenteLigne> proformaVenteLignes;

    @OneToMany(mappedBy = "proforma", fetch = FetchType.LAZY)
    private List<Vente> ventes;
}

package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@jakarta.persistence.Entity
@Table(name = "vente_processes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VenteProcess {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "process_name", nullable = false, length = 100)
    private String processName;

    @Column(name = "abreviation", nullable = false, length = 10)
    private String abreviation;

    @Column(name = "valeur", nullable = false)
    private Integer valeur;

    @OneToMany(mappedBy = "process", fetch = FetchType.LAZY)
    private List<ProformaVente> proformaVentes;

    @OneToMany(mappedBy = "process", fetch = FetchType.LAZY)
    private List<Vente> ventes;

    @OneToMany(mappedBy = "process", fetch = FetchType.LAZY)
    private List<VenteHistorique> venteHistoriques;
}

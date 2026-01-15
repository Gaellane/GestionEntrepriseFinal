package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@jakarta.persistence.Entity
@Table(name = "fournisseurs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fournisseur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "fournisseur_nom", nullable = false, length = 100)
    private String fournisseurNom;

    @Column(name = "contact", length = 100)
    private String contact;

    @Column(name = "adresse", columnDefinition = "TEXT")
    private String adresse;

    @Column(name = "coordonnee_bancaire", columnDefinition = "TEXT")
    private String coordonneeBancaire;

    @OneToMany(mappedBy = "fournisseur", fetch = FetchType.LAZY)
    private List<ProformaAchat> proformaAchats;
}

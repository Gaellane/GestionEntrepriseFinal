package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@jakarta.persistence.Entity
@Table(name = "clients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "client_nom", nullable = false, length = 100)
    private String clientNom;

    @Column(name = "contact", length = 100)
    private String contact;

    @Column(name = "adresse", columnDefinition = "TEXT")
    private String adresse;

    @Column(name = "coordonnee_bancaire", columnDefinition = "TEXT")
    private String coordonneeBancaire;

    @OneToMany(mappedBy = "client", fetch = FetchType.LAZY)
    private List<ProformaVente> proformaVentes;
}

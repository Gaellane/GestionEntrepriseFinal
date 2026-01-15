package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@jakarta.persistence.Entity
@Table(name = "proforma_achats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProformaAchat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "achat_id", nullable = false)
    private Achat achat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fournisseur_id", nullable = false)
    private Fournisseur fournisseur;

    @Column(name = "date_entree", nullable = false)
    private LocalDateTime dateEntree;

    @Column(name = "montant_total", nullable = false)
    private Double montantTotal;

    @Column(name = "refe", nullable = false, length = 100)
    private String refe;

    @OneToMany(mappedBy = "proforma", fetch = FetchType.LAZY)
    private List<ProformaAchatLigne> proformaAchatLignes;

    @OneToMany(mappedBy = "proforma", fetch = FetchType.LAZY)
    private List<BonCommandeAchat> bonCommandeAchats;
}

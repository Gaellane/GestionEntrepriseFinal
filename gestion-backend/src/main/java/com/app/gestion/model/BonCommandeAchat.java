package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@jakarta.persistence.Entity
@Table(name = "bon_commandes_achats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BonCommandeAchat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proforma_id", nullable = false)
    private ProformaAchat proforma;

    @Column(name = "date_entree", nullable = false)
    private LocalDateTime dateEntree;

    @Column(name = "montant_total", nullable = false)
    private Double montantTotal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id", nullable = false)
    private BonCommandeProcess process;

    @Column(name = "refe", nullable = false, length = 100)
    private String refe;

    @OneToMany(mappedBy = "bonCommande", fetch = FetchType.LAZY)
    private List<BonCommandeAchatLigne> bonCommandeAchatLignes;

    @OneToMany(mappedBy = "bonCommande", fetch = FetchType.LAZY)
    private List<BonCommandeHistorique> bonCommandeHistoriques;

    @OneToMany(mappedBy = "bonCommande", fetch = FetchType.LAZY)
    private List<ReceptionAchat> receptionAchats;

    @OneToMany(mappedBy = "bonCommande", fetch = FetchType.LAZY)
    private List<LivraisonAchat> livraisonAchats;
}

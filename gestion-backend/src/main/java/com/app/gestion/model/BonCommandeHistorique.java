package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@jakarta.persistence.Entity
@Table(name = "bon_commande_historiques")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BonCommandeHistorique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "date_entree", nullable = false)
    private LocalDateTime dateEntree;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bon_commande_id", nullable = false)
    private BonCommandeAchat bonCommande;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id", nullable = false)
    private BonCommandeProcess process;
}

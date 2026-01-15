package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@jakarta.persistence.Entity
@Table(name = "reception_achats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceptionAchat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bon_commande_id", nullable = false)
    private BonCommandeAchat bonCommande;

    @Column(name = "date_entree", nullable = false)
    private LocalDateTime dateEntree;

    @Column(name = "refe", unique = true, nullable = false, length = 100)
    private String refe;

    @OneToMany(mappedBy = "reception", fetch = FetchType.LAZY)
    private List<ReceptionAchatLigne> receptionAchatLignes;
}

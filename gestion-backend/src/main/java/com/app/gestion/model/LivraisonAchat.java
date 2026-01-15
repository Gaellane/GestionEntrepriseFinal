package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@jakarta.persistence.Entity
@Table(name = "livraison_achats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LivraisonAchat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "date_entree", nullable = false)
    private LocalDateTime dateEntree;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bon_commande_id", nullable = false)
    private BonCommandeAchat bonCommande;

    @Column(name = "refe", unique = true, nullable = false, length = 100)
    private String refe;

    @OneToMany(mappedBy = "livraison", fetch = FetchType.LAZY)
    private List<LivraisonAchatLigne> livraisonAchatLignes;
}

package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@jakarta.persistence.Entity
@Table(name = "livraison_ventes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LivraisonVente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vente_id", nullable = false)
    private Vente vente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id", nullable = false)
    private LivraisonVenteProcess process;

    @Column(name = "date_entree", nullable = false)
    private LocalDateTime dateEntree;

    @Column(name = "refe", unique = true, nullable = false, length = 100)
    private String refe;

    @OneToMany(mappedBy = "livraison", fetch = FetchType.LAZY)
    private List<LivraisonVenteLigne> livraisonVenteLignes;

    @OneToMany(mappedBy = "livraison", fetch = FetchType.LAZY)
    private List<LivraisonVenteHistorique> livraisonVenteHistoriques;
}

package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@jakarta.persistence.Entity
@Table(name = "livraison_vente_historiques")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LivraisonVenteHistorique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "date_entree", nullable = false)
    private LocalDateTime dateEntree;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "livraison_id", nullable = false)
    private LivraisonVente livraison;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id", nullable = false)
    private LivraisonVenteProcess process;
}

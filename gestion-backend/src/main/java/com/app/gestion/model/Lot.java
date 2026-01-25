package com.app.gestion.model;

import com.app.gestion.model.enums.StatutLot;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@jakarta.persistence.Entity
@Table(name = "lots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "numero", nullable = false, unique = true, length = 100)
    private String numero;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    @lombok.ToString.Exclude
    private Article article;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "depot_id", nullable = false)
    @lombok.ToString.Exclude
    private Depot depot;

    @Column(name = "date_arrivee", nullable = false)
    private LocalDateTime dateArrivee;

    @Column(name = "date_peremption")
    private LocalDateTime datePeremption;

    @Column(name = "quantite", nullable = false)
    private Double quantite;

    @Column(name = "quantite_restante", nullable = false)
    private Double quantiteRestante;

    @Column(name = "prix_unitaire", nullable = false)
    private Double prixUnitaire;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_lot", length = 20)
    private StatutLot statutLot = StatutLot.ACTIF;

    @Column(name = "raison_blocage", columnDefinition = "TEXT")
    private String raisonBlocage;

    @Column(name = "date_blocage")
    private LocalDateTime dateBlocage;

    @OneToMany(mappedBy = "lot", fetch = FetchType.LAZY)
    @lombok.ToString.Exclude
    private List<LotMouvement> lotMouvements;
}

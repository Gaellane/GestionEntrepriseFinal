package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@jakarta.persistence.Entity
@Table(name = "lot_mouvements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LotMouvement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lot_id", nullable = false)
    @lombok.ToString.Exclude
    private Lot lot;

    @Column(name = "quantite", nullable = false)
    private Double quantite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_mouvement_id", nullable = false)
    @lombok.ToString.Exclude
    private StockTypeMouvement typeMouvement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raison_id", nullable = false)
    @lombok.ToString.Exclude
    private RaisonMouvement raison;

    @Column(name = "chemin_document", length = 200)
    private String cheminDocument;

    @Column(name = "date_entree", nullable = false)
    private LocalDateTime dateEntree;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}

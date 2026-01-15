package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@jakarta.persistence.Entity
@Table(name = "stock_reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;

    @Column(name = "quantite", nullable = false)
    private Double quantite;

    @Column(name = "date_entree", nullable = false)
    private LocalDateTime dateEntree;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id", nullable = false)
    private StockReservationProcess process;

    @Column(name = "reference", nullable = false, length = 100)
    private String reference;

    @OneToMany(mappedBy = "stock", fetch = FetchType.LAZY)
    private List<StockReservationHistorique> stockReservationHistoriques;
}

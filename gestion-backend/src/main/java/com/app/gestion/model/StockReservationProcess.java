package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@jakarta.persistence.Entity
@Table(name = "stock_reservation_processes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockReservationProcess {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "process_name", nullable = false, length = 100)
    private String processName;

    @Column(name = "abreviation", nullable = false, length = 10)
    private String abreviation;

    @Column(name = "valeur", nullable = false)
    private Integer valeur;

    @OneToMany(mappedBy = "process", fetch = FetchType.LAZY)
    private List<StockReservation> stockReservations;

    @OneToMany(mappedBy = "process", fetch = FetchType.LAZY)
    private List<StockReservationHistorique> stockReservationHistoriques;
}

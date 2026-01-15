package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@jakarta.persistence.Entity
@Table(name = "depots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Depot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "depot_name", nullable = false, length = 100)
    private String depotName;

    @OneToMany(mappedBy = "depot", fetch = FetchType.LAZY)
    private List<EntityDepot> entityDepots;

    @OneToMany(mappedBy = "depot", fetch = FetchType.LAZY)
    private List<Lot> lots;

    @OneToMany(mappedBy = "depot", fetch = FetchType.LAZY)
    private List<ReceptionAchatLigne> receptionAchatLignes;

    @OneToMany(mappedBy = "depot", fetch = FetchType.LAZY)
    private List<Inventaire> inventaires;
}

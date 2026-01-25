package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@jakarta.persistence.Entity
@Table(name = "inventaire_process")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventaireProcess {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "process_name", nullable = false)
    private String processName;

    @Column(name = "abreviation", nullable = false)
    private String abreviation;

    @Column(name = "valeur", nullable = false)
    private Integer valeur;
}

package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

@jakarta.persistence.Entity
@Table(name = "roles_attribution_process")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RolesAttributionProcess {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "process_name", nullable = false, length = 100)
    private String processName;

    @Column(name = "abreviation", nullable = false, length = 10)
    private String abreviation;

    @Column(name = "valeur", nullable = false)
    private Integer valeur;
}

package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

@jakarta.persistence.Entity
@Table(name = "raison_mouvements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RaisonMouvement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "raison_name", nullable = false, length = 100)
    private String raisonName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}

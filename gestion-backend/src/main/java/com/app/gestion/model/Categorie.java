package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@jakarta.persistence.Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Categorie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "categorie_name", nullable = false, length = 100)
    private String categorieName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "dluo")
    private Integer dluo; // Date Limite d'Utilisation Optimale en jours

    @Column(name = "dlc")
    private Integer dlc; // Date Limite de Consommation en jours

    @OneToMany(mappedBy = "categorie", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<Article> articles;
}

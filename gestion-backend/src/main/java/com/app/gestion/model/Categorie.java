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

    @OneToMany(mappedBy = "categorie", fetch = FetchType.LAZY)
    private List<Article> articles;
}

package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@jakarta.persistence.Entity
@Table(name = "entities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Entity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "entity_name", nullable = false, length = 100)
    private String entityName;

    @OneToMany(mappedBy = "entity", fetch = FetchType.LAZY)
    private List<EntityDepot> entityDepots;

    @OneToMany(mappedBy = "entity", fetch = FetchType.LAZY)
    private List<Utilisateur> utilisateurs;

    @OneToMany(mappedBy = "entity", fetch = FetchType.LAZY)
    private List<ArticleEntity> articleEntities;

    @OneToMany(mappedBy = "entity", fetch = FetchType.LAZY)
    private List<CaisseMouvement> caisseMouvements;
}

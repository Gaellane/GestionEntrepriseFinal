package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@jakarta.persistence.Entity
@Table(name = "article_entities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entity_id", nullable = false)
    private Entity entity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;

    @OneToMany(mappedBy = "articleEntity", fetch = FetchType.LAZY)
    private List<ArticlePrix> articlePrix;
}

package com.app.gestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@jakarta.persistence.Entity
@Table(name = "article_prix")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticlePrix {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    @lombok.ToString.Exclude
    private ArticleEntity articleEntity;

    @Column(name = "prix", nullable = false)
    private Double prix;

    @Column(name = "date_entree", nullable = false)
    private LocalDateTime dateEntree;
}

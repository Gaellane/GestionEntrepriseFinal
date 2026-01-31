package com.app.gestion.dto.tarification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticlePrixResponseDto {

    private Integer id;
    private Integer articleEntityId;
    private String articleNom;
    private String articleReference;
    private String entityName;
    private Double prix;
    private Double prixVente; // Prix utilisé pour les ventes (peut être le même que prix)
    private LocalDateTime dateEntree;
}

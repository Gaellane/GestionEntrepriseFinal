package com.app.gestion.dto.tarification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleTarifHistoriqueDto {

    private Integer articleEntityId;
    private String articleNom;
    private String articleReference;
    private String entityName;
    private Double prixActuel;
    private List<ArticlePrixResponseDto> historique;
}

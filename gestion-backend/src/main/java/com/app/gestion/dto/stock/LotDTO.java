package com.app.gestion.dto.stock;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LotDTO {
    private Integer id;
    private String numero;
    private ArticleDTO article;
    private DepotDTO depot;
    private LocalDateTime dateArrivee;
    private LocalDateTime datePeremption;
    private Double quantite;
    private Double quantiteRestante;
    private Double prixUnitaire;
}

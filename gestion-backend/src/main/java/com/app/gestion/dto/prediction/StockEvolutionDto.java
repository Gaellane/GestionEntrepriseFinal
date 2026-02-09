package com.app.gestion.dto.prediction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Évolution du stock projetée sur plusieurs mois pour un ou tous les articles.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockEvolutionDto {
    private Integer articleId;
    private String articleNom;
    private String articleRef;
    private double stockActuel;
    private double stockReserve;
    private double stockDisponibleNet;
    private int moisAvantRupture;       // -1 si pas de rupture sur l'horizon
    private List<ForecastPointDto> evolution;
}

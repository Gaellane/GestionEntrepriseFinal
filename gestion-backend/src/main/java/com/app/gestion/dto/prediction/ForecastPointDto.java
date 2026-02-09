package com.app.gestion.dto.prediction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Un point de prévision mensuel pour un article.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForecastPointDto {
    private int mois;
    private int annee;
    private String moisLabel;
    private double ventesPredites;
    private double ventesHistoriques;   // ventes réelles si disponibles, sinon -1
    private double stockProjetee;       // stock estimé à ce mois
    private boolean rupturePrevue;
}

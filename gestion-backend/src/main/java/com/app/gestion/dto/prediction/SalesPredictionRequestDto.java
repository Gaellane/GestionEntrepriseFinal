package com.app.gestion.dto.prediction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour les requêtes de prédiction de ventes.
 * Contient les features nécessaires au modèle Random Forest.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesPredictionRequestDto {

    /** ID de l'article concerné */
    private Integer articleId;

    /** ID du dépôt (optionnel, pour multi-dépôt) */
    private Integer depotId;

    /** Mois cible pour la prédiction (1-12) */
    private Integer moisCible;

    /** Année cible pour la prédiction */
    private Integer anneeCible;

    /** Indicateur de promotion prévue (0 ou 1) */
    @Builder.Default
    private Integer promotion = 0;
}

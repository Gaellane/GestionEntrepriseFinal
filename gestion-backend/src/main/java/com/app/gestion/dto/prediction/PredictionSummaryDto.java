package com.app.gestion.dto.prediction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO résumé global des prédictions avec statistiques du modèle.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictionSummaryDto {

    /** Date du dernier entraînement du modèle */
    private LocalDateTime dernierEntrainement;

    /** Nombre de données d'entraînement utilisées */
    private int nombreDonneesEntrainement;

    /** Erreur moyenne absolue du modèle (MAE) */
    private Double erreurMoyenne;

    /** R² score du modèle */
    private Double r2Score;

    /** Modèle prêt à prédire ? */
    private boolean modeleDisponible;

    /** Nombre total d'articles avec alertes critiques */
    private long nombreAlertesCritiques;

    /** Nombre total d'articles avec alertes attention */
    private long nombreAlertesAttention;

    /** Liste des prédictions par article */
    private List<SalesPredictionResponseDto> predictions;
}

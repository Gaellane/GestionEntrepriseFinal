package com.app.gestion.dto.prediction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de réponse contenant la prédiction de ventes et les alertes associées.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesPredictionResponseDto {

    /** ID de l'article */
    private Integer articleId;

    /** Nom de l'article */
    private String articleNom;

    /** Référence de l'article */
    private String articleRef;

    /** Mois prédit */
    private Integer mois;

    /** Année prédite */
    private Integer annee;

    /** Quantité prédite (ventes estimées) */
    private Double quantitePredite;

    /** Stock actuel disponible */
    private Double stockActuel;

    /** Stock réservé (commandes en cours) */
    private Double stockReserve;

    /** Stock disponible net (actuel - réservé) */
    private Double stockDisponibleNet;

    /** Écart entre stock disponible et ventes prédites */
    private Double ecartStockPrediction;

    /** Alerte rupture de stock */
    private boolean alerteRupture;

    /** Niveau d'alerte : NORMAL, ATTENTION, CRITIQUE */
    private NiveauAlerte niveauAlerte;

    /** Recommandation de réapprovisionnement */
    private String recommandation;

    /** Quantité suggérée de réapprovisionnement */
    private Double quantiteReapprovisionnement;

    /** Score de confiance du modèle (0-1) */
    private Double scoreConfiance;

    public enum NiveauAlerte {
        NORMAL,
        ATTENTION,
        CRITIQUE
    }
}

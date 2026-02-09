package com.app.gestion.dto.prediction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Représente un point de données d'entraînement pour le modèle de prédiction.
 * Chaque point correspond à un mois de vente pour un article donné.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingDataPoint {

    /** ID de l'article */
    private Integer articleId;

    /** Mois (1-12) */
    private int mois;

    /** Année */
    private int annee;

    /** Quantité vendue le mois précédent */
    private double quantiteMoisPrecedent;

    /** Quantité vendue le même mois l'année précédente */
    private double quantiteMemesMoisAnneePrecedente;

    /** Moyenne mobile des 3 derniers mois */
    private double moyenneMobile3Mois;

    /** Indicateur de promotion (0 ou 1) */
    private int promotion;

    /** Tendance de croissance (ratio mois courant / mois précédent) */
    private double tendanceCroissance;

    /** Moyenne mobile des 6 derniers mois */
    private double moyenneMobile6Mois;

    /** Label : Quantité réellement vendue ce mois */
    private double quantiteVendue;

    /**
     * Convertit ce point en tableau de features pour SMILE.
     * Ordre des features :
     * [0] mois
     * [1] annee
     * [2] quantiteMoisPrecedent
     * [3] quantiteMemesMoisAnneePrecedente
     * [4] moyenneMobile3Mois
     * [5] moyenneMobile6Mois
     * [6] promotion
     * [7] tendanceCroissance
     */
    public double[] toFeatureArray() {
        return new double[]{
                mois,
                annee,
                quantiteMoisPrecedent,
                quantiteMemesMoisAnneePrecedente,
                moyenneMobile3Mois,
                moyenneMobile6Mois,
                promotion,
                tendanceCroissance
        };
    }
}

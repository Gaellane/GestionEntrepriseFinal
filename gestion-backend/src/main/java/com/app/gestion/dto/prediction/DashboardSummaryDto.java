package com.app.gestion.dto.prediction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO complet pour le dashboard de prédiction unifié.
 * Combine toutes les données de prédiction en un seul appel.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDto {

    // --- Métadonnées modèle ---
    private boolean modeleDisponible;
    private LocalDateTime dernierEntrainement;
    private int nombreDonneesEntrainement;
    private Double r2Score;
    private Double erreurMoyenne;

    // --- KPI globaux ---
    private int totalArticlesAnalyses;
    private long alertesCritiques;
    private long alertesAttention;
    private long articlesSains;

    // --- Ventes futures (mois sélectionné) ---
    private int moisCible;
    private int anneeCible;
    private double totalVentesPredites;
    private double totalVentesMoisPrecedent;
    private double evolutionVentesPourcent;

    // --- Stock à risque ---
    private int articlesEnRuptureSous30j;
    private int articlesEnRuptureSous60j;
    private int articlesEnRuptureSous90j;
    private double valeurReapproNecessaire;

    // --- Prédictions détaillées ---
    private List<SalesPredictionResponseDto> predictions;

    // --- Évolution de stock (top articles à risque sur 6 mois) ---
    private List<StockEvolutionDto> stockEvolutions;

    // --- Tendances clients ---
    private List<ClientTrendDto> clientTrends;
    private int clientsEnHausse;
    private int clientsEnBaisse;
    private int clientsStables;
    private int nouveauxClients;
}

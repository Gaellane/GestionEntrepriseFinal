package com.app.gestion.service.prediction;

import com.app.gestion.dto.prediction.*;
import com.app.gestion.dto.prediction.SalesPredictionResponseDto.NiveauAlerte;
import com.app.gestion.model.Article;
import com.app.gestion.repository.ArticleRepository;
import com.app.gestion.repository.LotRepository;
import com.app.gestion.repository.StockReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service principal de prédiction des ventes et d'aide au réapprovisionnement.
 *
 * Responsabilités :
 * - Prédire les ventes futures pour un article ou tous les articles
 * - Comparer les prédictions au stock disponible
 * - Générer des alertes de rupture de stock
 * - Fournir des recommandations de réapprovisionnement
 *
 * Ce service est le point d'entrée pour le module stock et les contrôleurs.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StockPredictionService {

    private final ModelTrainingService modelTrainingService;
    private final TrainingDataService trainingDataService;
    private final ArticleRepository articleRepository;
    private final LotRepository lotRepository;
    private final StockReservationRepository stockReservationRepository;

    /** Seuil d'alerte attention : stock couvre moins de X% de la prédiction */
    @Value("${prediction.alert.attention-threshold:1.2}")
    private double attentionThreshold;

    /** Seuil d'alerte critique : stock couvre moins de X% de la prédiction */
    @Value("${prediction.alert.critical-threshold:0.8}")
    private double criticalThreshold;

    /** Marge de sécurité pour le réapprovisionnement (20% en plus) */
    @Value("${prediction.reorder.safety-margin:1.2}")
    private double safetyMargin;

    /**
     * Prédit les ventes pour un article donné sur un mois/année ciblé.
     */
    public SalesPredictionResponseDto predictForArticle(SalesPredictionRequestDto request) {
        if (!modelTrainingService.isModelAvailable()) {
            throw new IllegalStateException(
                    "Le modèle de prédiction n'est pas encore entraîné. "
                    + "Veuillez lancer l'entraînement via POST /api/predictions/train");
        }

        Article article = articleRepository.findById(request.getArticleId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Article introuvable : " + request.getArticleId()));

        // Construire les features
        double[] features = trainingDataService.buildPredictionFeatures(
                request.getArticleId(),
                request.getMoisCible(),
                request.getAnneeCible(),
                request.getPromotion() != null ? request.getPromotion() : 0
        );

        // Prédiction
        double quantitePredite = modelTrainingService.predict(request.getArticleId(), features);

        // Récupérer le stock actuel
        double stockActuel = getStockTotal(request.getArticleId(), request.getDepotId());
        double stockReserve = getStockReserve(request.getArticleId());
        double stockDisponible = stockActuel - stockReserve;

        // Analyse et recommandations
        return buildPredictionResponse(article, request.getMoisCible(), request.getAnneeCible(),
                quantitePredite, stockActuel, stockReserve, stockDisponible);
    }

    /**
     * Prédit les ventes pour tous les articles ayant un historique.
     */
    public PredictionSummaryDto predictAllArticles(int moisCible, int anneeCible) {
        if (!modelTrainingService.isModelAvailable()) {
            throw new IllegalStateException(
                    "Le modèle de prédiction n'est pas encore entraîné.");
        }

        List<Integer> articleIds = trainingDataService.getArticlesAvecVentes();
        List<SalesPredictionResponseDto> predictions = new ArrayList<>();

        for (Integer articleId : articleIds) {
            try {
                SalesPredictionRequestDto request = SalesPredictionRequestDto.builder()
                        .articleId(articleId)
                        .moisCible(moisCible)
                        .anneeCible(anneeCible)
                        .promotion(0)
                        .build();

                predictions.add(predictForArticle(request));
            } catch (Exception e) {
                log.warn("Erreur prédiction article {} : {}", articleId, e.getMessage());
            }
        }

        // Tri par niveau d'alerte (critiques en premier)
        predictions.sort(Comparator
                .comparing(SalesPredictionResponseDto::getNiveauAlerte)
                .reversed()
                .thenComparing(SalesPredictionResponseDto::getEcartStockPrediction));

        long alertesCritiques = predictions.stream()
                .filter(p -> p.getNiveauAlerte() == NiveauAlerte.CRITIQUE)
                .count();
        long alertesAttention = predictions.stream()
                .filter(p -> p.getNiveauAlerte() == NiveauAlerte.ATTENTION)
                .count();

        return PredictionSummaryDto.builder()
                .dernierEntrainement(modelTrainingService.getLastTrainingDate())
                .nombreDonneesEntrainement(modelTrainingService.getTrainingDataCount())
                .erreurMoyenne(modelTrainingService.getGlobalMAE())
                .r2Score(modelTrainingService.getGlobalR2())
                .modeleDisponible(modelTrainingService.isModelAvailable())
                .nombreAlertesCritiques(alertesCritiques)
                .nombreAlertesAttention(alertesAttention)
                .predictions(predictions)
                .build();
    }

    /**
     * Retourne uniquement les articles à risque de rupture.
     */
    public List<SalesPredictionResponseDto> getAlertesRupture(int moisCible, int anneeCible) {
        PredictionSummaryDto summary = predictAllArticles(moisCible, anneeCible);
        return summary.getPredictions().stream()
                .filter(SalesPredictionResponseDto::isAlerteRupture)
                .collect(Collectors.toList());
    }

    /**
     * Déclenche l'entraînement des modèles (batch).
     */
    public void triggerTraining() {
        modelTrainingService.trainAllModels();
    }

    /**
     * Retourne les informations sur le modèle (sans prédictions).
     */
    public PredictionSummaryDto getModelInfo() {
        return PredictionSummaryDto.builder()
                .dernierEntrainement(modelTrainingService.getLastTrainingDate())
                .nombreDonneesEntrainement(modelTrainingService.getTrainingDataCount())
                .erreurMoyenne(modelTrainingService.getGlobalMAE())
                .r2Score(modelTrainingService.getGlobalR2())
                .modeleDisponible(modelTrainingService.isModelAvailable())
                .build();
    }

    // === MÉTHODES PRIVÉES ===

    private SalesPredictionResponseDto buildPredictionResponse(
            Article article, int mois, int annee,
            double quantitePredite, double stockActuel,
            double stockReserve, double stockDisponible) {

        double ecart = stockDisponible - quantitePredite;

        // Déterminer le niveau d'alerte
        NiveauAlerte niveau;
        boolean alerteRupture;
        String recommandation;
        double quantiteReappro = 0;

        double ratio = quantitePredite > 0 ? stockDisponible / quantitePredite : Double.MAX_VALUE;

        if (ratio <= criticalThreshold) {
            niveau = NiveauAlerte.CRITIQUE;
            alerteRupture = true;
            quantiteReappro = Math.ceil((quantitePredite * safetyMargin) - stockDisponible);
            recommandation = String.format(
                    "URGENT : Réapprovisionnement immédiat de %.0f unités recommandé. "
                    + "Le stock actuel ne couvre que %.0f%% de la demande prévue.",
                    quantiteReappro, ratio * 100);

        } else if (ratio <= attentionThreshold) {
            niveau = NiveauAlerte.ATTENTION;
            alerteRupture = true;
            quantiteReappro = Math.ceil((quantitePredite * safetyMargin) - stockDisponible);
            recommandation = String.format(
                    "Planifier un réapprovisionnement de %.0f unités. "
                    + "Le stock actuel couvre %.0f%% de la demande prévue.",
                    quantiteReappro, ratio * 100);

        } else {
            niveau = NiveauAlerte.NORMAL;
            alerteRupture = false;
            recommandation = String.format(
                    "Stock suffisant. Couverture de %.0f%% par rapport à la demande prévue.",
                    ratio * 100);
        }

        // Score de confiance (basé sur l'existence d'un modèle spécifique)
        double scoreConfiance = modelTrainingService.hasArticleModel(article.getId()) ? 0.85 : 0.65;

        return SalesPredictionResponseDto.builder()
                .articleId(article.getId())
                .articleNom(article.getArticleNom())
                .articleRef(article.getRefe())
                .mois(mois)
                .annee(annee)
                .quantitePredite(Math.round(quantitePredite * 100.0) / 100.0)
                .stockActuel(stockActuel)
                .stockReserve(stockReserve)
                .stockDisponibleNet(stockDisponible)
                .ecartStockPrediction(Math.round(ecart * 100.0) / 100.0)
                .alerteRupture(alerteRupture)
                .niveauAlerte(niveau)
                .recommandation(recommandation)
                .quantiteReapprovisionnement(Math.max(0, quantiteReappro))
                .scoreConfiance(scoreConfiance)
                .build();
    }

    /**
     * Calcule le stock total pour un article (somme des quantités restantes des lots).
     */
    private double getStockTotal(Integer articleId, Integer depotId) {
        try {
            if (depotId != null) {
                Double stock = lotRepository.calculerStockTheorique(articleId, depotId);
                return stock != null ? stock : 0.0;
            } else {
                Double stock = lotRepository.calculerStockTotalParArticle(articleId);
                return stock != null ? stock : 0.0;
            }
        } catch (Exception e) {
            log.warn("Erreur calcul stock article {} : {}", articleId, e.getMessage());
            return 0.0;
        }
    }

    /**
     * Calcule le stock réservé pour un article.
     */
    private double getStockReserve(Integer articleId) {
        try {
            // Le repository attend depotId mais ne l'utilise pas dans la query
            Double reserved = stockReservationRepository.calculerStockReserve(articleId, null);
            return reserved != null ? reserved : 0.0;
        } catch (Exception e) {
            log.warn("Erreur calcul stock réservé article {} : {}", articleId, e.getMessage());
            return 0.0;
        }
    }
}
